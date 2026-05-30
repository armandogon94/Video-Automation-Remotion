#!/usr/bin/env node
/**
 * Render the W21 "Gemini 3.2 Flash leak" voiceover onto the QuoteCard9x16
 * composition in BOTH cream and dark palettes.
 *
 * Inputs (must already exist):
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.mp3
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.aligned.json
 *
 * Outputs:
 *   output/2026-05-18-gemini-3-2-flash-leak/quote-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/quote-dark/master.mp4
 */
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const FPS = 30;

interface AlignedWord {
  text: string;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
  source: string;
}

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

async function main() {
  // ─── 1. Inputs ──────────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");

  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}`);
  if (!fs.existsSync(alignedFile)) throw new Error(`Missing aligned timings at ${alignedFile}`);

  const aligned = JSON.parse(fs.readFileSync(alignedFile, "utf-8")) as {
    summary: unknown;
    words: AlignedWord[];
  };
  const wordTimings = aligned.words;
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 44;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`);

  // ─── 2. Stage audio in public/ ───────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));
  log("Render", `Audio staged at public/${publicAudioName}`);

  // ─── 3. Bundle ──────────────────────────────────────────
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  // ─── 4. Build the two palette variants ──────────────────
  const sharedProps = {
    audioUrl: publicAudioName,
    wordTimings,
    quote:
      "Filtraron Gemini 3.2 Flash dos días antes del Google I/O. Y los números son escandalosos.",
    author: "Armando Inteligencia",
    authorRole: "AI Leadership Lab",
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "gemini",
    // Empty strings → composition uses palette defaults.
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 40,
    // A4 audit: quote IS the text layer.
    showCaptions: false,
  };

  const variants = [
    { palette: "cream" as const, outDir: path.join(OUT_DIR, "quote-cream") },
    { palette: "dark" as const, outDir: path.join(OUT_DIR, "quote-dark") },
  ];

  for (const v of variants) {
    fs.mkdirSync(v.outDir, { recursive: true });
    const inputProps = { ...sharedProps, palette: v.palette };

    const composition = await selectComposition({
      serveUrl,
      id: "QuoteCard9x16",
      inputProps,
    });

    const outFile = path.join(v.outDir, "master.mp4");
    log("Render", `[${v.palette}] Rendering ${durationInFrames} frames -> ${outFile}`);
    const renderStart = Date.now();
    await renderMedia({
      composition: { ...composition, durationInFrames },
      serveUrl,
      codec: "h264",
      audioCodec: "aac",
      outputLocation: outFile,
      inputProps,
      onProgress: ({ progress }) => {
        if (progress !== undefined) {
          const pct = Math.round(progress * 100);
          if (pct % 10 === 0 && pct > 0) {
            process.stdout.write(`\r[Render ${v.palette}] ${pct}%`);
          }
        }
      },
    });
    process.stdout.write("\n");
    const renderSec = (Date.now() - renderStart) / 1000;
    const stats = fs.statSync(outFile);
    log(
      "Render",
      `[${v.palette}] Done in ${renderSec.toFixed(1)}s · ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    );
  }

  // ─── 5. Report ──────────────────────────────────────────
  console.log("\n✓ W21 QuoteCard9x16 (cream + dark) render complete");
  for (const v of variants) {
    console.log(`  ${v.palette.padEnd(5)}: ${path.join(v.outDir, "master.mp4")}`);
  }
}

main().catch((err) => {
  console.error("\n✗ render-w21-quote failed:", err);
  process.exit(1);
});
