#!/usr/bin/env node
/**
 * W21 "Gemini 3.2 Flash leak" — TechNewsFlash9x16 with Gemini blue accent.
 *
 * The original W21 v2 baseline render uses the editorial warm-red accent
 * (#B33A2A). Every other variant in the W21 bake-off (DiagramExplainer,
 * QuoteCard, BigNumberHero, TNF-transitions) uses `subjectTool: "gemini"`
 * which overrides the accent to Gemini blue via getToolAccent(). This
 * script re-renders the canonical TNF using the same Gemini-blue override
 * so the entire bake-off is visually unified.
 *
 * REUSE: overlays are loaded as-is from `overlays.resolved.json` (the V2
 * orchestrator's already-anchored schedule) — we do NOT re-resolve or
 * re-anchor. Word timings load as-is from `voiceover.aligned.json`.
 *
 * Inputs (must already exist):
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.mp3
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.aligned.json
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/overlays.resolved.json
 *
 * Outputs:
 *   output/2026-05-18-gemini-3-2-flash-leak/tnf-blue/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/tnf-blue/preview-t1s.jpg
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const VARIANT_OUT = path.join(OUT_DIR, "tnf-blue");
const FPS = 30;

interface AlignedWord {
  text: string;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
  source?: string;
}

interface ResolvedOverlay {
  kind: "chip" | "huge" | "subtitle" | "cta";
  text: string;
  subtext?: string;
  startSeconds: number;
  endSeconds: number;
  anchorSource?: "keyword" | "fallback" | "hardcoded";
}

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

async function probeAudioDurationSeconds(file: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nokey=1:noprint_wrappers=1",
    file,
  ]);
  const n = parseFloat(stdout.trim());
  if (!Number.isFinite(n)) {
    throw new Error(`ffprobe returned non-numeric duration for ${file}: ${stdout}`);
  }
  return n;
}

async function main() {
  fs.mkdirSync(VARIANT_OUT, { recursive: true });

  // ─── 1. Read inputs ──────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");
  const overlaysFile = path.join(OUT_DIR, "audio", "overlays.resolved.json");

  if (!fs.existsSync(audioFile)) throw new Error(`Missing voiceover at ${audioFile}`);
  if (!fs.existsSync(alignedFile)) throw new Error(`Missing aligned JSON at ${alignedFile}`);
  if (!fs.existsSync(overlaysFile)) throw new Error(`Missing resolved overlays at ${overlaysFile}`);

  const alignedRaw = JSON.parse(fs.readFileSync(alignedFile, "utf-8")) as
    | AlignedWord[]
    | { words: AlignedWord[] };
  const wordTimings: AlignedWord[] = Array.isArray(alignedRaw) ? alignedRaw : alignedRaw.words;
  if (!wordTimings.length) throw new Error("Empty wordTimings");

  const overlaysRaw = JSON.parse(fs.readFileSync(overlaysFile, "utf-8")) as ResolvedOverlay[];
  if (!overlaysRaw.length) throw new Error("Empty overlays");

  // Wave-3 audit fix (AA re-audit §"Top 5 STILL-OUTSTANDING" #1): DELETE the
  // legacy "FILTRACIÓN" chip overlay. The BrandBreadcrumb already carries the
  // "FILTRACIÓN" word in the same horizontal band, in the same Gemini-blue
  // accent. Keeping both creates: (a) A4 redundancy ("FILTRACIÓN" rendered
  // twice in the same row), (b) A2 contrast hot-spot (white-on-#4285F4 chip
  // text = 3.7:1, sub-AA), and (c) A5 structural defect (non-canonical chip
  // living next to canonical breadcrumb). One delete folds three findings.
  const overlays = overlaysRaw.filter(
    (o) => !(o.kind === "chip" && o.text === "FILTRACIÓN" && o.startSeconds === 0),
  );
  const droppedCount = overlaysRaw.length - overlays.length;

  log(
    "Inputs",
    `wordTimings: ${wordTimings.length} words · overlays: ${overlays.length}` +
      (droppedCount > 0 ? ` (dropped ${droppedCount} legacy chip per Wave-3 audit)` : ""),
  );

  // ─── 2. Duration: max(lastWord.end, audio length) + 0.5s tail ───
  // The aligned words end at 41.96s but the audio file runs ~43.3s (room
  // tone). Using only lastWord clips ~0.84s of trailing audio — we keep
  // everything.
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioFileDuration = await probeAudioDurationSeconds(audioFile);
  const tail = 0.5;
  const audioDuration = Math.max(lastWord.endSeconds, audioFileDuration) + tail;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log(
    "Pipeline",
    `lastWord.end=${lastWord.endSeconds.toFixed(2)}s · audio=${audioFileDuration.toFixed(2)}s · ` +
      `total=${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`,
  );

  // ─── 3. Stage audio in public/ ───────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  const publicAudioPath = path.join(publicDir, publicAudioName);
  if (!fs.existsSync(publicAudioPath)) {
    fs.copyFileSync(audioFile, publicAudioPath);
    log("Render", `Audio staged at public/${publicAudioName}`);
  } else {
    log("Render", `Audio already staged at public/${publicAudioName}`);
  }

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
    // The whole point: Gemini blue accent via getToolAccent() override.
    subjectTool: "gemini",
    paperColor: "#FAF7F2",
    inkColor: "#1A1A1A",
    accentColor: "#B33A2A", // overridden by subjectTool
    mutedColor: "#6B6760",
    captionFontSize: 48,
    useHeroTransitions: false, // preserve v2 visual cadence
  };

  log("Render", "Selecting composition TechNewsFlash9x16...");
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
    audioCodec: "aac",
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
  const stats = fs.statSync(masterFile);
  log(
    "Render",
    `master.mp4 in ${renderSec.toFixed(1)}s · ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
  );

  // ─── 5. Representative preview at t=1s ──────────────────
  const jpgPath = path.join(VARIANT_OUT, "preview-t1s.jpg");
  log("FFmpeg", "Extracting preview-t1s.jpg (chip + first huge overlay visible)...");
  await execa(
    "ffmpeg",
    ["-y", "-ss", "1", "-i", masterFile, "-frames:v", "1", "-q:v", "2", jpgPath],
    { stdio: "ignore" },
  );

  // ─── 6. Report ──────────────────────────────────────────
  const jpgStats = fs.statSync(jpgPath);
  console.log("\n✓ W21 TNF blue variant render complete");
  console.log(`  master.mp4:       ${masterFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  preview-t1s.jpg:  ${jpgPath} (${(jpgStats.size / 1024).toFixed(1)} KB)`);
  console.log(`  Duration:         ${audioDuration.toFixed(2)}s (${durationInFrames} frames @${FPS}fps)`);
  console.log(`  Raw render:       ${renderSec.toFixed(1)}s`);
}

main().catch((err) => {
  console.error("\n✗ TNF blue render failed:", err);
  process.exit(1);
});
