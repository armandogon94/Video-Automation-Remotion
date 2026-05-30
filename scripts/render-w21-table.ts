#!/usr/bin/env node
/**
 * W21 ANIMATED TABLE renderer.
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the
 * AnimatedTable9x16 composition — Gemini vs GPT-5.5 head-to-head metrics
 * table with the Gemini row highlighted as the "winner" on price/latency.
 *
 * Output: output/2026-05-18-gemini-3-2-flash-leak/table/master.mp4 + preview JPG
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
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

  const variantDir = path.join(OUT_DIR, "table");
  fs.mkdirSync(variantDir, { recursive: true });

  const inputProps = {
    audioUrl: publicAudioName,
    wordTimings,
    title: "Gemini 3.2 Flash vs GPT-5.5",
    subtitle: "Filtración Google AI Studio · 5 mayo 2026",
    headers: ["Modelo", "Precio/M", "Latencia", "Score"],
    rows: [
      ["Gemini 3.2 Flash", "$0.25", "<200ms", "92%"],
      ["GPT-5.5",         "$3.75", "~600ms", "100%"],
    ],
    highlightRowIndex: 0,
    rowStaggerSeconds: 0.25,
    headerDelaySeconds: 0.4,
    sourceCaption: "Filtración Google AI Studio · 5 mayo 2026",
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "gemini",
    palette: "dark" as const,
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 38,
    showCaptions: false,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "AnimatedTable9x16",
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

  // t=2s — header (0.3s) + 2 rows × 0.25s stagger + 0.3s row enter ≈ 1.4s settled.
  // Plus 0.2s post-row tint = ~1.6s. Picking t=2s catches a clean settled state.
  const jpgFile = path.join(variantDir, "preview-t2s.jpg");
  await execa("ffmpeg", [
    "-y", "-ss", "2", "-i", masterFile,
    "-frames:v", "1", "-q:v", "2",
    jpgFile,
  ], { stdio: "ignore" });

  const ffprobeDuration = await getAudioDurationSeconds(masterFile);
  const stats = fs.statSync(masterFile);
  console.log("\n✓ W21 AnimatedTable render complete");
  console.log(`  master:   ${masterFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  preview:  ${jpgFile}`);
  console.log(`  duration: ${ffprobeDuration.toFixed(2)}s`);
}

main().catch((err) => {
  console.error("\n✗ W21 AnimatedTable render failed:", err);
  process.exit(1);
});
