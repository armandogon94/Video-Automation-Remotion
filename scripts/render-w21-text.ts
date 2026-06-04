#!/usr/bin/env node
/**
 * W21 ANIMATED TEXT renderer (BOTH reveal styles).
 *
 * Renders the 2026-05-18 "Gemini 3.2 Flash leak" voiceover onto the
 * AnimatedText9x16 composition TWICE — once with revealStyle=blur-in and
 * once with revealStyle=scramble-decrypt — and each in BOTH `cream` and
 * `dark` palettes. The headline "GEMINI 3.2 FLASH" reveals on the
 * spoken word "Gemini" at the top of the clip.
 *
 * Outputs (4 total):
 *   output/2026-05-18-gemini-3-2-flash-leak/text-blurin-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/text-blurin-cream/preview-t2s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/text-blurin-dark/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/text-blurin-dark/preview-t2s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/text-scramble-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/text-scramble-cream/preview-t2s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/text-scramble-dark/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/text-scramble-dark/preview-t2s.jpg
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
type RevealStyle = "blur-in" | "scramble-decrypt";

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

  type Variant = { style: RevealStyle; palette: Palette; tag: string; compositionId: string; revealDur: number };
  const variants: Variant[] = [
    { style: "blur-in",          palette: "cream", tag: "text-blurin-cream",   compositionId: "AnimatedText9x16BlurIn",   revealDur: 0.8 },
    { style: "blur-in",          palette: "dark",  tag: "text-blurin-dark",    compositionId: "AnimatedText9x16BlurIn",   revealDur: 0.8 },
    { style: "scramble-decrypt", palette: "cream", tag: "text-scramble-cream", compositionId: "AnimatedText9x16Scramble", revealDur: 1.0 },
    { style: "scramble-decrypt", palette: "dark",  tag: "text-scramble-dark",  compositionId: "AnimatedText9x16Scramble", revealDur: 1.0 },
  ];

  const results: Array<{ tag: string; mp4: string; jpg: string; durationSec: number; renderSec: number }> = [];

  for (const v of variants) {
    const variantDir = path.join(OUT_DIR, v.tag);
    fs.mkdirSync(variantDir, { recursive: true });

    const inputProps = {
      audioUrl: publicAudioName,
      wordTimings,
      text: "GEMINI 3.2 FLASH",
      subtitle: "Filtración pre-I/O 2026",
      revealStyle: v.style,
      revealDurationSeconds: v.revealDur,
      audioAnchorKeyword: "Gemini",
      scrambleCharPool: "",
      breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
      subjectTool: "gemini",
      palette: v.palette,
      paperColor: "",
      inkColor: "",
      accentColor: "",
      mutedColor: "",
      captionFontSize: 40,
      showCaptions: true,
    };

    const composition = await selectComposition({
      serveUrl,
      id: v.compositionId,
      inputProps,
    });

    const rawVideoFile = path.join(variantDir, "raw.mp4");
    log("Render", `[${v.tag}] Rendering ${durationInFrames} frames -> ${rawVideoFile}`);
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
            process.stdout.write(`\r[Render][${v.tag}] ${pct}%`);
          }
        }
      },
    });
    process.stdout.write("\n");
    const renderSec = (Date.now() - renderStart) / 1000;
    log("Render", `[${v.tag}] raw render in ${renderSec.toFixed(1)}s`);

    const masterFile = path.join(variantDir, "master.mp4");
    log("FFmpeg", `[${v.tag}] normalizing audio + writing master...`);
    const normStart = Date.now();
    await execa("ffmpeg", [
      "-y", "-i", rawVideoFile,
      "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
      "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      masterFile,
    ], { stdio: "ignore" });
    log("FFmpeg", `[${v.tag}] master.mp4 in ${((Date.now() - normStart) / 1000).toFixed(1)}s`);

    // Preview at t=2s — after the reveal animation has settled.
    const jpgFile = path.join(variantDir, "preview-t2s.jpg");
    await execa("ffmpeg", [
      "-y", "-ss", "2", "-i", masterFile,
      "-frames:v", "1", "-q:v", "2",
      jpgFile,
    ], { stdio: "ignore" });
    log("FFmpeg", `[${v.tag}] preview frame -> ${jpgFile}`);

    const ffprobeDuration = await getAudioDurationSeconds(masterFile);
    results.push({ tag: v.tag, mp4: masterFile, jpg: jpgFile, durationSec: ffprobeDuration, renderSec });
  }

  console.log("\n✓ W21 AnimatedText (blur-in + scramble) renders complete");
  for (const r of results) {
    const stats = fs.statSync(r.mp4);
    console.log(`  [${r.tag}]`);
    console.log(`    master:   ${r.mp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`    preview:  ${r.jpg}`);
    console.log(`    duration: ${r.durationSec.toFixed(2)}s`);
    console.log(`    render:   ${r.renderSec.toFixed(1)}s`);
  }
}

main().catch((err) => {
  console.error("\n✗ W21 AnimatedText render failed:", err);
  process.exit(1);
});
