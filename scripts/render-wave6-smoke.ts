#!/usr/bin/env node
/**
 * Wave-6 smoke renderer — renders the 6 new 16:9 (1920×1080) compositions onto
 * the W21 voiceover. Same single-bundle pattern as Sprint-5 + Sprint-6 smoke
 * scripts; the only thing that changes is the composition IDs.
 *
 * Output: output/wave6-smoke/<CompositionId>/master.mp4 + preview.jpg
 *
 * These previews feed the side-by-side validation HTML
 * (`docs/wave6-validation.html`) which shows reference clip ↔ our recreation.
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundleOnce as bundle } from "../src/autoedit/bundleOnce";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const W21_OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const SMOKE_OUT_DIR = path.join(PROJECT_ROOT, "output", "wave6-smoke");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

const WAVE6_TEMPLATES = [
  // Hormozi long-form HIGH-priority Tella-claim payoff
  { id: "HormoziTweetCardListicle16x9", previewT: 3 },
  // Nate B Jones consensus HIGH patterns (all 16:9)
  { id: "TitleCardKineticTwoLine16x9", previewT: 1.5 },
  { id: "BeforeAfterText16x9", previewT: 3 },
  { id: "BigNumberHorizontalBars16x9", previewT: 3 },
  { id: "PipelineFlow16x9", previewT: 4 },
  { id: "SplitScreenInterviewLayout16x9", previewT: 2 },
] as const;

async function getAudioDurationSeconds(audioFile: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    audioFile,
  ]);
  return parseFloat(stdout.trim());
}

async function main() {
  const audioFile = path.join(W21_OUT_DIR, "audio", "voiceover.mp3");
  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}.`);

  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));

  const audioDuration = await getAudioDurationSeconds(audioFile);
  const durationInFrames = Math.ceil((audioDuration + 0.5) * FPS);
  log("Pipeline", `Audio: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames`);
  log("Pipeline", `Rendering ${WAVE6_TEMPLATES.length} Wave-6 16:9 templates...`);

  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Bundle", `ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  fs.mkdirSync(SMOKE_OUT_DIR, { recursive: true });

  const results: Array<{ id: string; status: "ok" | "fail"; durationSec?: number; error?: string }> = [];

  for (const { id, previewT } of WAVE6_TEMPLATES) {
    const variantDir = path.join(SMOKE_OUT_DIR, id);
    fs.mkdirSync(variantDir, { recursive: true });
    const t1 = Date.now();
    try {
      const composition = await selectComposition({
        serveUrl,
        id,
        inputProps: { audioUrl: publicAudioName, wordTimings: [] },
      });

      const rawFile = path.join(variantDir, "raw.mp4");
      await renderMedia({
        composition: { ...composition, durationInFrames },
        serveUrl,
        codec: "h264",
        outputLocation: rawFile,
        inputProps: { audioUrl: publicAudioName, wordTimings: [] },
        onProgress: () => {},
      });

      const masterFile = path.join(variantDir, "master.mp4");
      await execa("ffmpeg", [
        "-y", "-i", rawFile,
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
        "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        masterFile,
      ], { stdio: "ignore" });

      const previewFile = path.join(variantDir, `preview-t${previewT}s.jpg`);
      await execa("ffmpeg", [
        "-y", "-ss", String(previewT), "-i", masterFile,
        "-frames:v", "1", "-q:v", "2",
        previewFile,
      ], { stdio: "ignore" });

      fs.rmSync(rawFile, { force: true });

      const elapsed = (Date.now() - t1) / 1000;
      results.push({ id, status: "ok", durationSec: elapsed });
      log("OK", `${id} ✓ ${elapsed.toFixed(1)}s`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({ id, status: "fail", error: errMsg });
      log("FAIL", `${id} ✗ ${errMsg.slice(0, 200)}`);
    }
  }

  const totalTime = ((Date.now() - t0) / 1000).toFixed(1);
  const okCount = results.filter((r) => r.status === "ok").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  log("Summary", `${okCount}/${WAVE6_TEMPLATES.length} OK · ${failCount} failed · total ${totalTime}s`);

  fs.writeFileSync(path.join(SMOKE_OUT_DIR, "REPORT.json"), JSON.stringify(results, null, 2));

  if (failCount > 0) {
    console.error("\nFailures:");
    results.filter((r) => r.status === "fail").forEach((r) => {
      console.error(`  ${r.id}: ${r.error?.slice(0, 300)}`);
    });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
