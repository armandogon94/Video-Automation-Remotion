#!/usr/bin/env node
/**
 * W21 TALKING-HEAD DYNAMIC (revised) renderer.
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the REVISED
 * TalkingHeadDynamic9x16 composition. Cycles through ALL 5 crop modes across
 * the full ~42s VO so a single render demos every mode for the bake-off grid.
 *
 * faceCamSrc + brollClips are intentionally left EMPTY — both source assets
 * fall through to the composition's built-in fallback blocks (diagonal-stripe
 * placeholders), which is sufficient for visual taxonomy comparison.
 *
 * Output: output/2026-05-18-gemini-3-2-flash-leak/thd-revised/master.mp4 + preview JPG
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundleOnce as bundle } from "../src/autoedit/bundleOnce";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import type { WordTiming } from "../src/compositions/schemas.js";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

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
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");
  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}.`);
  if (!fs.existsSync(alignedFile)) throw new Error(`Missing aligned timings at ${alignedFile}.`);

  const alignedData = JSON.parse(fs.readFileSync(alignedFile, "utf-8")) as {
    words: Array<WordTiming & { source?: string }>;
  };
  const wordTimings: WordTiming[] = alignedData.words.map((w) => ({
    text: w.text,
    startFrame: w.startFrame,
    endFrame: w.endFrame,
    startSeconds: w.startSeconds,
    endSeconds: w.endSeconds,
  }));

  const lastWordEnd = wordTimings[wordTimings.length - 1]?.endSeconds ?? 0;
  const audioDurationSec = await getAudioDurationSeconds(audioFile);
  const audioDuration = Math.max(lastWordEnd, audioDurationSec) + 0.5;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames`);

  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));

  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const variantDir = path.join(OUT_DIR, "thd-revised");
  fs.mkdirSync(variantDir, { recursive: true });

  // 5-segment timeline showcasing all crop modes across the full ~42s VO.
  // Each segment runs ~8s so each mode gets meaningful screen time.
  // Stephan's grammar: HARD_CUT only, transitionFrames=0.
  const SEG = Math.floor(audioDuration / 5); // ~8s per segment for a 42s VO
  const segments = [
    { startSeconds:  0 * SEG, endSeconds:  1 * SEG, cropMode: "FACE_FULL"          as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
    { startSeconds:  1 * SEG, endSeconds:  2 * SEG, cropMode: "BROLL_FULL"         as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
    { startSeconds:  2 * SEG, endSeconds:  3 * SEG, cropMode: "SPLIT_50_TOP_BROLL" as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
    { startSeconds:  3 * SEG, endSeconds:  4 * SEG, cropMode: "SPLIT_50_TOP_FACE"  as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
    // Last segment extends to the end of the audio (audioDuration) so we never
    // leave a black tail.
    { startSeconds:  4 * SEG, endSeconds:  audioDuration, cropMode: "SPLIT_33_TOP_FACE"  as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
  ];

  const inputProps = {
    audioUrl: publicAudioName,
    wordTimings,
    faceCamSrc: "",
    voiceoverSrc: "",
    brollClips: [],
    segments,
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "claude-code",
    palette: "dark" as const,
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 40,
    showCaptions: true,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "TalkingHeadDynamic9x16",
    inputProps,
  });

  const rawFile = path.join(variantDir, "raw.mp4");
  const renderStart = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames },
    serveUrl,
    codec: "h264",
    outputLocation: rawFile,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined) {
        const pct = Math.round(progress * 100);
        if (pct % 10 === 0 && pct > 0) process.stdout.write(`\r[Render] ${pct}%`);
      }
    },
  });
  process.stdout.write("\n");
  log("Render", `raw render in ${((Date.now() - renderStart) / 1000).toFixed(1)}s`);

  const masterFile = path.join(variantDir, "master.mp4");
  await execa("ffmpeg", [
    "-y", "-i", rawFile,
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    masterFile,
  ], { stdio: "ignore" });

  // Preview at t=20s — lands inside segment 3 (SPLIT_50_TOP_BROLL) so the
  // grid thumbnail shows a "split" frame rather than a full mode, which best
  // signals "this template animates across modes".
  const jpgFile = path.join(variantDir, "preview-t20s.jpg");
  await execa("ffmpeg", [
    "-y", "-ss", "20", "-i", masterFile,
    "-frames:v", "1", "-q:v", "2",
    jpgFile,
  ], { stdio: "ignore" });

  const ffprobeDuration = await getAudioDurationSeconds(masterFile);
  const stats = fs.statSync(masterFile);
  console.log("\n✓ W21 TalkingHeadDynamic (revised) render complete");
  console.log(`  master:   ${masterFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  preview:  ${jpgFile}`);
  console.log(`  duration: ${ffprobeDuration.toFixed(2)}s`);
  console.log(`  segments: ${segments.length} (${segments.map((s) => s.cropMode).join(", ")})`);
}

main().catch((err) => {
  console.error("\n✗ W21 TalkingHeadDynamic (revised) render failed:", err);
  process.exit(1);
});
