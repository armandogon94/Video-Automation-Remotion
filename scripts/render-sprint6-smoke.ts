#!/usr/bin/env node
/**
 * Sprint 6 smoke renderer — renders the 6 Wave-5 / Tella-derived 9×16 templates
 * onto the W21 voiceover with the Gemini-themed default props from Root.tsx.
 *
 * Single shared bundle → 6 sequential renders + JPG previews. Mirrors the
 * Sprint-5 smoke pattern at `scripts/render-sprint5-smoke.ts`.
 *
 * If HM-1 lands and BrollListicle9x16 ships, add it to SPRINT6_TEMPLATES and
 * re-run — the bundle and audio plumbing are already in place.
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundleOnce as bundle } from "../src/autoedit/bundleOnce";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const W21_OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const SMOKE_OUT_DIR = path.join(PROJECT_ROOT, "output", "sprint6-smoke");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

const SPRINT6_TEMPLATES = [
  // Tella synthesis → Sprint-6 Wave-5 compositions
  { id: "TweetCard9x16", previewT: 2 },          // animated tweet (T2)
  { id: "RankedTierList9x16", previewT: 4 },     // Hormozi/Klaus tiers w/ dwell (T3)
  { id: "AppConnect9x16", previewT: 2.5 },       // Shabam app-connect + cascade (T5)
  { id: "VennDiagram9x16", previewT: 4 },        // animated Venn (T6)
  { id: "DecisionTree9x16", previewT: 3 },       // radial decision tree (T7)
  { id: "BrandedOpener9x16", previewT: 1.2 },    // hook opener (T9)
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
  log("Pipeline", `Rendering ${SPRINT6_TEMPLATES.length} Sprint-6 templates...`);

  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Bundle", `ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  fs.mkdirSync(SMOKE_OUT_DIR, { recursive: true });

  const results: Array<{ id: string; status: "ok" | "fail"; durationSec?: number; error?: string }> = [];

  for (const { id, previewT } of SPRINT6_TEMPLATES) {
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
  log("Summary", `${okCount}/${SPRINT6_TEMPLATES.length} OK · ${failCount} failed · total ${totalTime}s`);

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
