#!/usr/bin/env node
/**
 * W21 TOKEN STREAM renderer.
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the
 * TokenStream9x16 composition (a streaming-token panel that shows what
 * a model "speaks") in BOTH `cream` and `dark` palettes. The streamed
 * text is the pricing pull-quote that justifies the "15× más barato"
 * headline.
 *
 * Outputs:
 *   output/2026-05-18-gemini-3-2-flash-leak/tokenstream-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/tokenstream-cream/preview-t15s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/tokenstream-dark/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/tokenstream-dark/preview-t15s.jpg
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
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");

  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}.`);
  if (!fs.existsSync(alignedFile)) throw new Error(`Missing aligned word timings at ${alignedFile}.`);

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

  const lastWord = wordTimings[wordTimings.length - 1];
  const lastWordEnd = lastWord ? lastWord.endSeconds : 0;
  const audioDurationSec = await getAudioDurationSeconds(audioFile);
  const audioDuration = Math.max(lastWordEnd, audioDurationSec) + 0.5;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`);

  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));
  log("Render", `Audio staged at public/${publicAudioName}`);

  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const palettes: Palette[] = ["cream", "dark"];
  const results: Array<{ palette: Palette; mp4: string; jpg: string; durationSec: number; renderSec: number }> = [];

  for (const palette of palettes) {
    const variantDir = path.join(OUT_DIR, `tokenstream-${palette}`);
    fs.mkdirSync(variantDir, { recursive: true });

    const inputProps = {
      audioUrl: publicAudioName,
      wordTimings,
      title: "GEMINI 3.2 FLASH genera:",
      text: "$0.25 por millón de tokens de entrada. Dos dólares por millón de salida. 92% del rendimiento de GPT-5.5. Latencia menos de 200ms.",
      tokensArray: [],
      tokensPerSecond: 8,
      showCursor: true,
      breadcrumb: { text: "Gemini 3.2", date: "Streaming" },
      subjectTool: "gemini",
      palette,
      paperColor: "",
      inkColor: "",
      accentColor: "",
      mutedColor: "",
      captionFontSize: 38,
      showCaptions: true,
    };

    const composition = await selectComposition({
      serveUrl,
      id: "TokenStream9x16",
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

    // Preview at t=15s — most tokens have streamed by 8 tok/s.
    const jpgFile = path.join(variantDir, "preview-t15s.jpg");
    await execa("ffmpeg", [
      "-y", "-ss", "15", "-i", masterFile,
      "-frames:v", "1", "-q:v", "2",
      jpgFile,
    ], { stdio: "ignore" });
    log("FFmpeg", `[${palette}] preview frame -> ${jpgFile}`);

    const ffprobeDuration = await getAudioDurationSeconds(masterFile);
    results.push({ palette, mp4: masterFile, jpg: jpgFile, durationSec: ffprobeDuration, renderSec });
  }

  console.log("\n✓ W21 TokenStream render complete");
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
  console.error("\n✗ W21 TokenStream render failed:", err);
  process.exit(1);
});
