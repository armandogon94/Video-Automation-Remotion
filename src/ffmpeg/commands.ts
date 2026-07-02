/**
 * FFmpeg command builders for post-processing pipeline.
 */
import { execa } from "execa";
import fs from "fs";
import path from "path";

interface ResizeOptions {
  input: string;
  output: string;
  width: number;
  height: number;
  mode: "pad" | "crop" | "blur";
}

export async function resize(opts: ResizeOptions): Promise<void> {
  const { input, output, width, height, mode } = opts;

  // The geometry step only changes the picture — the audio was already normalized to
  // 48 kHz stereo AAC upstream (normalizeAudio), so copy it through instead of re-encoding
  // (avoids a needless extra lossy generation; FABLE §4.5 / Task 1.2).
  const audioArgs = ["-c:a", "copy"];

  let vf: string;
  if (mode === "crop") {
    // Scale-to-COVER the target box, then center-crop to exact size. This single
    // expression is correct for ANY input/output aspect combination, in both directions
    // (landscape→portrait, portrait→square, etc.) — the previous `crop=ih*w/h:ih` assumed
    // a landscape input and hard-failed on vertical masters (FABLE §4.1/§4.2, Task 1.1).
    vf = `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${width}:${height}`;
  } else if (mode === "blur") {
    // Blurred background with sharp foreground overlay
    vf = [
      `[0:v]scale=${width}:${height},boxblur=20:5[bg]`,
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease[fg]`,
      `[bg][fg]overlay=(W-w)/2:(H-h)/2`,
    ].join(";");
    await execa("ffmpeg", [
      "-y", "-i", input,
      "-filter_complex", vf,
      "-c:v", "libx264", "-crf", "18", "-preset", "medium",
      ...audioArgs,
      "-movflags", "+faststart",
      output,
    ]);
    return;
  } else {
    // pad (default)
    vf = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`;
  }

  await execa("ffmpeg", [
    "-y", "-i", input,
    "-vf", vf,
    "-c:v", "libx264", "-crf", "18", "-preset", "medium",
    ...audioArgs,
    "-movflags", "+faststart",
    output,
  ]);
}

export async function normalizeAudio(
  input: string,
  output: string,
  targetLufs: number = -14,
): Promise<void> {
  // Single-pass loudnorm (good enough for most cases).
  // loudnorm internally upsamples to 192 kHz; without an explicit output rate the AAC
  // encoder clamps to a non-standard 96 kHz (FABLE §4.5). Force standard 48 kHz stereo so
  // downstream platform exports don't have to transcode it again. The trailing
  // `aformat=...channel_layouts=stereo` also guarantees a stereo layout even for mono
  // sources (FABLE §4.6) so nothing silently downmixes.
  await execa("ffmpeg", [
    "-y", "-i", input,
    "-af", `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo`,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    "-ar", "48000", "-ac", "2",
    output,
  ]);
}

/** Probe a media file's duration in seconds via ffprobe. Returns 0 if it can't be read. */
async function probeDurationSeconds(input: string): Promise<number> {
  try {
    const { stdout } = await execa("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      input,
    ]);
    const seconds = Number.parseFloat(stdout.trim());
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  } catch {
    return 0;
  }
}

export async function extractThumbnail(
  input: string,
  output: string,
  timeSeconds: number = 2,
): Promise<void> {
  // Seeking past the end of a short clip fails ("Output file does not contain any stream")
  // and, via exportMultiPlatform's fan-out, used to kill the whole batch (FABLE §4.17).
  // Clamp the seek to the clip: never past the midpoint, never past its duration.
  const duration = await probeDurationSeconds(input);
  const seek = duration > 0 ? Math.min(timeSeconds, duration / 2) : 0;
  await execa("ffmpeg", [
    "-y",
    "-ss", String(seek),
    "-i", input,
    "-frames:v", "1",
    "-q:v", "2",
    output,
  ]);
}

interface MultiPlatformOptions {
  input: string;
  outputDir: string;
  baseName: string;
  platforms: Array<"youtube" | "tiktok" | "reels" | "square">;
}

export async function exportMultiPlatform(
  opts: MultiPlatformOptions,
): Promise<Record<string, string>> {
  const { input, outputDir, baseName, platforms } = opts;

  const platformConfigs: Record<string, { w: number; h: number; mode: "pad" | "crop" }> = {
    youtube: { w: 1920, h: 1080, mode: "pad" },
    tiktok: { w: 1080, h: 1920, mode: "crop" },
    reels: { w: 1080, h: 1920, mode: "crop" },
    square: { w: 1080, h: 1080, mode: "crop" },
  };

  // Each job knows the file it writes so a FAILED job can be cleaned up (FABLE §4.19).
  interface ExportJob {
    label: string;
    outputPath: string;
    run: () => Promise<void>;
  }

  const jobs: ExportJob[] = platforms
    .filter((platform) => platformConfigs[platform])
    .map((platform) => {
      const config = platformConfigs[platform];
      const outputPath = path.join(outputDir, `${baseName}_${platform}.mp4`);
      return {
        label: platform,
        outputPath,
        run: () =>
          resize({
            input,
            output: outputPath,
            width: config.w,
            height: config.h,
            mode: config.mode,
          }),
      };
    });

  const thumbPath = path.join(outputDir, `${baseName}_thumbnail.jpg`);
  jobs.push({
    label: "thumbnail",
    outputPath: thumbPath,
    run: () => extractThumbnail(input, thumbPath),
  });

  // allSettled (not all) so one platform's failure doesn't abandon the siblings with
  // half-written files and orphan ffmpeg work (FABLE §4.19).
  const settled = await Promise.allSettled(jobs.map((job) => job.run()));

  const exports: Record<string, string> = {};
  const failures: Array<{ label: string; reason: string }> = [];

  settled.forEach((result, i) => {
    const job = jobs[i];
    if (result.status === "fulfilled") {
      exports[job.label] = job.outputPath;
      console.log(`  ✓ ${job.label} → ${job.outputPath}`);
    } else {
      const reason =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      failures.push({ label: job.label, reason });
      // Remove the partial/half-written output so it can't be mistaken for a good export.
      try {
        fs.rmSync(job.outputPath, { force: true });
      } catch {
        /* best-effort cleanup */
      }
      console.error(`  ✗ ${job.label} failed: ${reason.slice(0, 160)}`);
    }
  });

  if (failures.length > 0) {
    // Fail loudly with ONE aggregate error listing every failed platform.
    const summary = failures.map((f) => `${f.label} (${f.reason.slice(0, 120)})`).join("; ");
    throw new Error(
      `Multi-platform export failed for: ${summary}. ` +
        `Succeeded: ${Object.keys(exports).join(", ") || "none"}. ` +
        `Partial outputs for failed platforms were removed.`,
    );
  }

  return exports;
}
