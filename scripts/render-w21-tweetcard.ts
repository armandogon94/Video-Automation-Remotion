#!/usr/bin/env node
/**
 * W21 TWEET CARD HERO renderer.
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the
 * TweetCardHero9x16 composition. Composed tweet card on near-black above an
 * artifact zone (fallback diagonal-stripe block since we have no screenshare).
 * Bilawal.ai-inspired authority-pattern treatment.
 *
 * Output: output/2026-05-18-gemini-3-2-flash-leak/tweetcard/master.mp4 + preview JPG
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

  // Stage audio
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));

  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const variantDir = path.join(OUT_DIR, "tweetcard");
  fs.mkdirSync(variantDir, { recursive: true });

  const inputProps = {
    audioUrl: publicAudioName,
    wordTimings,
    tweet: {
      name: "Armando Inteligencia",
      handle: "armandointeligencia",
      avatarUrl: "",
      body:
        "Gemini 3.2 Flash filtra benchmarks: 15× más barato que GPT-5.5 con casi el mismo score. Esto cambia el cálculo para todos los que están construyendo con LLMs.",
      timestamp: "May 18",
      verified: true,
      replies: 142,
      retweets: 980,
      likes: 4500,
    },
    artifactImageUrl: "",
    faceCamImageUrl: "",
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "gemini",
    palette: "dark" as const,
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 38,
    // A4 audit: tweet body IS the text layer.
    showCaptions: false,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "TweetCardHero9x16",
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

  const jpgFile = path.join(variantDir, "preview-t2s.jpg");
  await execa("ffmpeg", [
    "-y", "-ss", "2", "-i", masterFile,
    "-frames:v", "1", "-q:v", "2",
    jpgFile,
  ], { stdio: "ignore" });

  const ffprobeDuration = await getAudioDurationSeconds(masterFile);
  const stats = fs.statSync(masterFile);
  console.log("\n✓ W21 TweetCardHero render complete");
  console.log(`  master:   ${masterFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  preview:  ${jpgFile}`);
  console.log(`  duration: ${ffprobeDuration.toFixed(2)}s`);
}

main().catch((err) => {
  console.error("\n✗ W21 TweetCardHero render failed:", err);
  process.exit(1);
});
