/**
 * FFmpeg command builders for post-processing pipeline.
 */
import { execa } from "execa";
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

  let vf: string;
  if (mode === "crop") {
    vf = `crop=ih*${width}/${height}:ih,scale=${width}:${height}:flags=lanczos`;
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
      "-c:a", "aac", "-b:a", "192k",
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
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    output,
  ]);
}

export async function normalizeAudio(
  input: string,
  output: string,
  targetLufs: number = -14,
): Promise<void> {
  // Single-pass loudnorm (good enough for most cases)
  await execa("ffmpeg", [
    "-y", "-i", input,
    "-af", `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    output,
  ]);
}

export async function extractThumbnail(
  input: string,
  output: string,
  timeSeconds: number = 2,
): Promise<void> {
  await execa("ffmpeg", [
    "-y",
    "-ss", String(timeSeconds),
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
  const outputs: Record<string, string> = {};

  const platformConfigs: Record<string, { w: number; h: number; mode: "pad" | "crop" }> = {
    youtube: { w: 1920, h: 1080, mode: "pad" },
    tiktok: { w: 1080, h: 1920, mode: "crop" },
    reels: { w: 1080, h: 1920, mode: "crop" },
    square: { w: 1080, h: 1080, mode: "crop" },
  };

  for (const platform of platforms) {
    const config = platformConfigs[platform];
    if (!config) continue;

    const outputPath = path.join(outputDir, `${baseName}_${platform}.mp4`);
    await resize({
      input,
      output: outputPath,
      width: config.w,
      height: config.h,
      mode: config.mode,
    });
    outputs[platform] = outputPath;
  }

  // Thumbnail
  const thumbPath = path.join(outputDir, `${baseName}_thumbnail.jpg`);
  await extractThumbnail(input, thumbPath);
  outputs.thumbnail = thumbPath;

  return outputs;
}
