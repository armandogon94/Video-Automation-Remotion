#!/usr/bin/env node
/**
 * W21 BIG-NUMBER HERO renderer.
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the
 * BigNumberHero9x16 composition in BOTH `cream` and `dark` palettes,
 * headlining the "15×" stat (Gemini 3.2 Flash vs GPT-5.5 pricing).
 *
 * Inputs (must exist):
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.mp3
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.aligned.json
 *
 * Output:
 *   output/2026-05-18-gemini-3-2-flash-leak/bignum-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/bignum-cream/preview-t1.5s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/bignum-dark/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/bignum-dark/preview-t1.5s.jpg
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

type Palette = "cream" | "dark";

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
  // ─── 1. Read inputs ──────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");

  if (!fs.existsSync(audioFile)) {
    throw new Error(`Missing audio at ${audioFile}.`);
  }
  if (!fs.existsSync(alignedFile)) {
    throw new Error(`Missing aligned word timings at ${alignedFile}.`);
  }

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

  // ─── 2. Compute duration ─────────────────────────────────
  // Brief says: "last alignedWord endSeconds + 0.5s". We also guard against
  // trailing silence in the audio file (the MP3 is ~1.3s longer than the last
  // aligned word) so Remotion doesn't cut the audio short.
  const lastWord = wordTimings[wordTimings.length - 1];
  const lastWordEnd = lastWord ? lastWord.endSeconds : 0;
  const audioDurationSec = await getAudioDurationSeconds(audioFile);
  const audioDuration = Math.max(lastWordEnd, audioDurationSec) + 0.5;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log(
    "Pipeline",
    `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps ` +
      `(lastWord ${lastWordEnd.toFixed(2)}s, audio file ${audioDurationSec.toFixed(2)}s)`,
  );

  // ─── 3. Stage audio in public/ ───────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));
  log("Render", `Audio staged at public/${publicAudioName}`);

  // ─── 4. Bundle once ──────────────────────────────────────
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  // ─── 5. Render both palettes ─────────────────────────────
  const palettes: Palette[] = ["cream", "dark"];
  const results: Array<{
    palette: Palette;
    mp4: string;
    jpg: string;
    durationSec: number;
    renderSec: number;
  }> = [];

  for (const palette of palettes) {
    const variantDir = path.join(OUT_DIR, `bignum-${palette}`);
    fs.mkdirSync(variantDir, { recursive: true });

    const inputProps = {
      audioUrl: publicAudioName,
      wordTimings,
      number: "15×",
      kicker: "GEMINI 3.2 FLASH",
      subtitle: "más barato que GPT-5.5",
      caption: "$0.25 / $2.00 por millón de tokens",
      countUp: false,
      breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
      subjectTool: "gemini",
      palette,
      paperColor: "",
      inkColor: "",
      accentColor: "",
      mutedColor: "",
      captionFontSize: 40,
      showCaptions: true,
    };

    const composition = await selectComposition({
      serveUrl,
      id: "BigNumberHero9x16",
      inputProps,
    });

    const rawVideoFile = path.join(variantDir, "raw.mp4");
    log("Render", `[${palette}] Rendering ${durationInFrames} frames -> ${rawVideoFile}`);
    const renderStart = Date.now();
    await renderMedia({
      composition: { ...composition, durationInFrames },
      serveUrl,
      codec: "h264",
      outputLocation: rawVideoFile,
      inputProps,
      onProgress: ({ progress }) => {
        if (progress !== undefined) {
          const pct = Math.round(progress * 100);
          if (pct % 10 === 0 && pct > 0) {
            process.stdout.write(`\r[Render][${palette}] ${pct}%`);
          }
        }
      },
    });
    process.stdout.write("\n");
    const renderSec = (Date.now() - renderStart) / 1000;
    log("Render", `[${palette}] raw render in ${renderSec.toFixed(1)}s`);

    // ─── 6. FFmpeg: normalize audio + h264 + aac master ───
    const masterFile = path.join(variantDir, "master.mp4");
    log("FFmpeg", `[${palette}] normalizing audio + writing master...`);
    const normStart = Date.now();
    await execa("ffmpeg", [
      "-y", "-i", rawVideoFile,
      "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
      "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      masterFile,
    ], { stdio: "ignore" });
    log("FFmpeg", `[${palette}] master.mp4 in ${((Date.now() - normStart) / 1000).toFixed(1)}s`);

    // ─── 7. Extract preview frame at t≈1.5s ───────────────
    const jpgFile = path.join(variantDir, "preview-t1.5s.jpg");
    await execa("ffmpeg", [
      "-y", "-ss", "1.5", "-i", masterFile,
      "-frames:v", "1", "-q:v", "2",
      jpgFile,
    ], { stdio: "ignore" });
    log("FFmpeg", `[${palette}] preview frame -> ${jpgFile}`);

    const ffprobeDuration = await getAudioDurationSeconds(masterFile);
    results.push({
      palette,
      mp4: masterFile,
      jpg: jpgFile,
      durationSec: ffprobeDuration,
      renderSec,
    });
  }

  // ─── 8. Report ──────────────────────────────────────────
  console.log("\n✓ W21 BigNumberHero render complete");
  for (const r of results) {
    const stats = fs.statSync(r.mp4);
    console.log(`  [${r.palette}]`);
    console.log(`    master:   ${r.mp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`    preview:  ${r.jpg}`);
    console.log(`    duration: ${r.durationSec.toFixed(2)}s`);
    console.log(`    render:   ${r.renderSec.toFixed(1)}s`);
  }
}

main().catch((err) => {
  console.error("\n✗ W21 BigNumberHero render failed:", err);
  process.exit(1);
});
