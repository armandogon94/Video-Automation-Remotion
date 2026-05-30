#!/usr/bin/env node
/**
 * VARIANT RENDERER — proves the `useHeroTransitions: true` flag actually triggers
 * <TransitionSeries> crossfades on TechNewsFlash9x16.
 *
 * The W21 v2 schedule has overlapping heroes ("15× MÁS BARATO" and the "$0.25/$2.00"
 * subtitle ride concurrently), which forces partitionOverlays() to route them to the
 * decoration track. That makes useHeroTransitions a no-op on that data.
 *
 * Here we rewrite the schedule into a STRICT back-to-back hero chain (each next-hero
 * .startSeconds == prev-hero.endSeconds, within 1/30s tolerance), so partitionOverlays()
 * builds a single chain of length 5 (plus an isolated CTA chain of length 1 + a chip
 * that overlaps the first huge and lands in decorations).
 *
 * Inputs (must exist already):
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.mp3
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.aligned.json
 *
 * Output:
 *   output/2026-05-18-gemini-3-2-flash-leak/tnf-transitions/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/tnf-transitions/preview-t10.5s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/tnf-transitions/preview-t6.85s-crossfade.jpg
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const VARIANT_OUT = path.join(OUT_DIR, "tnf-transitions");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

// Sequential hero chain: each next.start == prev.end (within 1/30s tolerance) so
// partitionOverlays() groups heroes 0→7→14→21→27→33 into ONE chain of length 5.
// The chip from 0→3 overlaps the first huge → routes to decorations (intentional).
// The CTA at 36→41.6 has a gap to the chain → becomes its own chain of length 1
// (and renders as a plain Sequence, regardless of useHeroTransitions).
const overlays = [
  // Decoration chip — overlaps the first hero, intentional
  { kind: "chip" as const, text: "FILTRACIÓN", startSeconds: 0, endSeconds: 3 },
  // Hero chain — strictly back-to-back (each next.start == prev.end)
  { kind: "huge" as const,     text: "GEMINI 3.2 FLASH",            startSeconds: 0,  endSeconds: 7 },
  { kind: "huge" as const,     text: "15× MÁS BARATO",              startSeconds: 7,  endSeconds: 14 },
  { kind: "subtitle" as const, text: "$0.25 / $2.00 por millón",    startSeconds: 14, endSeconds: 21 },
  { kind: "huge" as const,     text: "92% rendimiento GPT-5.5",     startSeconds: 21, endSeconds: 27 },
  { kind: "huge" as const,     text: "<200ms latencia",             startSeconds: 27, endSeconds: 33 },
  { kind: "cta" as const,      text: "LISTA HOY",                   startSeconds: 36, endSeconds: 41.6 },
];

interface AlignedWord {
  text: string;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
  source?: string;
}

async function main() {
  fs.mkdirSync(VARIANT_OUT, { recursive: true });

  // ─── 1. Read inputs ──────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");
  if (!fs.existsSync(audioFile)) {
    throw new Error(`Missing voiceover at ${audioFile}`);
  }
  if (!fs.existsSync(alignedFile)) {
    throw new Error(
      `Missing ${alignedFile}. Run scripts/render-2026-05-18-gemini-3-2-flash-leak.ts first to produce it.`,
    );
  }
  const alignedData = JSON.parse(fs.readFileSync(alignedFile, "utf-8")) as {
    words: AlignedWord[];
  };
  const wordTimings = alignedData.words;

  // ─── 2. Duration from aligned words + 0.5s tail ─────────
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 45;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`);
  log(
    "Schedule",
    `Heroes 0→7→14→21→27→33 form a contiguous chain (length 5). Chip 0→3 overlaps the first huge → decorations. CTA 36→41.6 has a gap → standalone chain (length 1).`,
  );

  // ─── 3. Stage audio in public/ ───────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));
  log("Render", `Audio staged at public/${publicAudioName}`);

  // ─── 4. Bundle + render ──────────────────────────────────
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const inputProps = {
    audioUrl: publicAudioName,
    wordTimings,
    overlays,
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "gemini",
    paperColor: "#FAF7F2",
    inkColor: "#1A1A1A",
    accentColor: "#B33A2A",
    mutedColor: "#6B6760",
    captionFontSize: 48,
    useHeroTransitions: true,
    brandId: "armando-inteligencia",
  };

  const composition = await selectComposition({
    serveUrl,
    id: "TechNewsFlash9x16",
    inputProps,
  });

  const masterFile = path.join(VARIANT_OUT, "master.mp4");
  log("Render", `Rendering ${durationInFrames} frames -> ${masterFile}`);
  const renderStart = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames },
    serveUrl,
    codec: "h264",
    outputLocation: masterFile,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined) {
        const pct = Math.round(progress * 100);
        if (pct % 10 === 0 && pct > 0) process.stdout.write(`\r[Render] ${pct}%`);
      }
    },
  });
  process.stdout.write("\n");
  const renderSec = (Date.now() - renderStart) / 1000;
  log("Render", `master.mp4 in ${renderSec.toFixed(1)}s`);

  // ─── 5. Extract preview frames ──────────────────────────
  const previewMid = path.join(VARIANT_OUT, "preview-t10.5s.jpg");
  const previewCrossfade = path.join(VARIANT_OUT, "preview-t6.85s-crossfade.jpg");
  log("FFmpeg", "Extracting preview frame @ t=10.5s (mid '15× MÁS BARATO')...");
  await execa("ffmpeg", ["-y", "-ss", "10.5", "-i", masterFile, "-frames:v", "1", "-q:v", "2", previewMid], {
    stdio: "ignore",
  });
  log("FFmpeg", "Extracting preview frame @ t=6.85s (mid-crossfade)...");
  await execa("ffmpeg", ["-y", "-ss", "6.85", "-i", masterFile, "-frames:v", "1", "-q:v", "2", previewCrossfade], {
    stdio: "ignore",
  });

  // ─── 6. Report ──────────────────────────────────────────
  const masterStats = fs.statSync(masterFile);
  console.log("\n✓ TNF transitions variant render complete");
  console.log(`  master.mp4:          ${masterFile} (${(masterStats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  preview t=10.5s:     ${previewMid}`);
  console.log(`  preview t=6.85s xfd: ${previewCrossfade}`);
  console.log(`  Duration:            ${audioDuration.toFixed(2)}s (${durationInFrames} frames @${FPS}fps)`);
  console.log(`  Raw render:          ${renderSec.toFixed(1)}s`);
}

main().catch((err) => {
  console.error("\n✗ TNF transitions render failed:", err);
  process.exit(1);
});
