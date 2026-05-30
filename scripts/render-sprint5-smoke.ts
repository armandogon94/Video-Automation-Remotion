#!/usr/bin/env node
/**
 * Sprint 5 smoke renderer — renders all 24 new Wave-4-derived 9×16 templates
 * onto the W21 voiceover with default props, sharing a single bundle for speed.
 *
 * Output: output/sprint5-smoke/<CompositionId>/master.mp4 + preview.jpg
 *
 * The point is to verify every template:
 *   1. Compiles + renders end-to-end (catches runtime crashes the type-checker missed)
 *   2. Produces a sensible visual preview at default props (for the comparison grid)
 *
 * This is NOT meant to be a polished content render — defaultProps in Root.tsx
 * supplies minimal but valid placeholders so the templates render "something."
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const W21_OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const SMOKE_OUT_DIR = path.join(PROJECT_ROOT, "output", "sprint5-smoke");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

// The 24 new templates registered in Root.tsx during Sprint 5 integration.
const SPRINT5_TEMPLATES = [
  // T1 — Code-focused
  { id: "CodeDiffBeforeAfter9x16", previewT: 4 },
  { id: "TerminalBlock9x16", previewT: 3 },
  { id: "EditorBlock9x16", previewT: 3 },
  // T2 — Kinetic typography
  { id: "KineticEssay9x16", previewT: 4 },
  { id: "OutroFollowCTA9x16", previewT: 2 },
  // T3 — Numbers / charts
  { id: "BigNumberDuel9x16", previewT: 2 },
  { id: "LineChartAnnotated9x16", previewT: 3 },
  { id: "BarChartList9x16", previewT: 3 },
  // T4 — Flow / dossier
  { id: "PipelineFlow9x16", previewT: 4 },
  { id: "TitledDossierCard9x16", previewT: 3 },
  // T5 — Meta-template wrappers
  { id: "GeminiFrameWrapper9x16", previewT: 2 },
  { id: "CamcorderFrame9x16", previewT: 2 },
  // T6 — B-roll-driven
  { id: "KeyedFounderOverBroll9x16", previewT: 2 },
  { id: "GenerativeBrollWithDiegeticUI9x16", previewT: 2 },
  // T7 — Education
  { id: "WhiteboardScene9x16", previewT: 3 },
  { id: "IllustratedConcept9x16", previewT: 2 },
  // T8 — Faux UI
  { id: "FauxProductUI9x16", previewT: 2 },
  { id: "NewsClipCitation9x16", previewT: 2 },
  // T9 — Outro / CTA
  { id: "YouTubeEndCard9x16", previewT: 1 },
  { id: "PollCTA9x16", previewT: 2 },
  { id: "YouTubeCalloutArrows9x16", previewT: 2 },
  // T10 — Pricing / feature / testimonial
  { id: "TestimonialCard9x16", previewT: 2 },
  { id: "PricingTierCard9x16", previewT: 2 },
  { id: "LockedFeatureRow9x16", previewT: 2 },
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
  // Wire up audio file in /public for the templates that play audio
  const audioFile = path.join(W21_OUT_DIR, "audio", "voiceover.mp3");
  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}.`);

  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));

  const audioDuration = await getAudioDurationSeconds(audioFile);
  const durationInFrames = Math.ceil((audioDuration + 0.5) * FPS);
  log("Pipeline", `Audio duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames`);
  log("Pipeline", `Rendering ${SPRINT5_TEMPLATES.length} templates...`);

  // Single bundle — shared across all 24 renders. This is the big speedup.
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Bundle", `ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  fs.mkdirSync(SMOKE_OUT_DIR, { recursive: true });

  const results: Array<{ id: string; status: "ok" | "fail"; durationSec?: number; error?: string; masterPath?: string; previewPath?: string }> = [];

  for (const { id, previewT } of SPRINT5_TEMPLATES) {
    const variantDir = path.join(SMOKE_OUT_DIR, id);
    fs.mkdirSync(variantDir, { recursive: true });
    const t1 = Date.now();
    try {
      // Select composition with input props that supply the audio URL.
      // Other props come from defaultProps registered in Root.tsx.
      const composition = await selectComposition({
        serveUrl,
        id,
        // Audio plumbing only — let Root.tsx's defaultProps drive the rest.
        // But override audioUrl + wordTimings if they exist on the schema.
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
      results.push({ id, status: "ok", durationSec: elapsed, masterPath: masterFile, previewPath: previewFile });
      log("OK", `${id} ✓ ${elapsed.toFixed(1)}s`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({ id, status: "fail", error: errMsg });
      log("FAIL", `${id} ✗ ${errMsg.slice(0, 200)}`);
    }
  }

  // Report
  const totalTime = ((Date.now() - t0) / 1000).toFixed(1);
  const okCount = results.filter((r) => r.status === "ok").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  log("Summary", `${okCount}/${SPRINT5_TEMPLATES.length} OK · ${failCount} failed · total ${totalTime}s`);

  // Write JSON report
  const reportFile = path.join(SMOKE_OUT_DIR, "REPORT.json");
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  log("Report", `wrote ${reportFile}`);

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
