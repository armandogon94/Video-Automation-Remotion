#!/usr/bin/env node
/**
 * V2 ORCHESTRATOR for the 2026-05-18 "Gemini 3.2 Flash leak" video.
 *
 * Fixes the 3 bugs from the W21 first-render postmortem:
 *   - Bug 1 (caption-group overlap): consumed by the composition via nonOverlappingGroups()
 *   - Bug 2 (caption highlight drift): aligned word list (script text + whisper timing) replaces TTS-distributed timings
 *   - Bug 3 (big-overlay drift): every overlay declared with a KEYWORD ANCHOR; orchestrator resolves to actual spoken time before render
 *
 * Inputs (must exist in output/<slug>/):
 *   audio/voiceover.mp3
 *   audio/voiceover.timestamps.json   (TTS approximate; correct text)
 *   transcript/transcript.json        (whisper word-level; accurate timing)
 *
 * Output:
 *   audio/voiceover.aligned.json      (NEW — script text + whisper timing)
 *   audio/overlays.resolved.json      (NEW — keyword-anchored overlays with diagnostics)
 *   remotion/raw.mp4
 *   remotion/master.mp4               + master.tiktok.mp4 / master.reels.mp4 / master.shorts.mp4
 *   remotion/render.timings.json
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import {
  alignScriptToWhisper,
  anchorOverlays,
  summarizeAlignment,
  type OverlayAnchorSpec,
  type TTSWord,
  type WhisperWord,
} from "../src/timing/align.js";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
// V2 keeps v1 intact so we can A/B side-by-side.
const REMOTION_OUT = path.join(OUT_DIR, "remotion-v2");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

// ─── Overlay specs from the brief's §3 timing table ───────────────────
// Every overlay anchors to a SPOKEN KEYWORD. `leadInSeconds` lets the overlay
// appear slightly BEFORE the keyword (so it's already on screen when the voice
// lands on it). `fallback` is the brief's original hardcoded timing — used only
// if the keyword isn't found in the audio.
const OVERLAY_SPECS: OverlayAnchorSpec[] = [
  {
    payload: { kind: "chip", text: "FILTRACIÓN" },
    anchorKeyword: "Filtraron",
    leadInSeconds: 0.0,
    durationSeconds: 3.2,
    fallback: { startSeconds: 0, endSeconds: 3 },
  },
  {
    payload: { kind: "huge", text: "GEMINI 3.2 FLASH" },
    anchorKeyword: "Filtraron",
    leadInSeconds: 0.0,
    durationSeconds: 3.2,
    fallback: { startSeconds: 0, endSeconds: 3 },
  },
  {
    payload: { kind: "huge", text: "15× MÁS BARATO" },
    anchorKeyword: "Quince",
    leadInSeconds: 0.25,
    durationSeconds: 2.4,
    fallback: { startSeconds: 12, endSeconds: 14 },
  },
  {
    payload: { kind: "subtitle", text: "$0.25 / $2.00 por millón de tokens" },
    anchorKeyword: "Veinticinco",
    leadInSeconds: 0.25,
    durationSeconds: 4.5,
    fallback: { startSeconds: 14, endSeconds: 18 },
  },
  {
    payload: { kind: "huge", text: "92% del rendimiento de GPT-5.5" },
    anchorKeyword: "noventa",
    leadInSeconds: 0.25,
    durationSeconds: 4.0,
    fallback: { startSeconds: 18, endSeconds: 22 },
  },
  {
    payload: { kind: "huge", text: "<200ms latencia" },
    anchorKeyword: "Latencia",
    leadInSeconds: 0.25,
    durationSeconds: 3.5,
    fallback: { startSeconds: 22, endSeconds: 26 },
  },
  {
    payload: { kind: "cta", text: "LISTA HOY" },
    anchorKeyword: "lista",
    leadInSeconds: 0.3,
    durationSeconds: 5.0,
    fallback: { startSeconds: 38, endSeconds: 43 },
  },
];

async function main() {
  fs.mkdirSync(REMOTION_OUT, { recursive: true });

  // ─── 1. Read inputs ──────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const ttsFile = path.join(OUT_DIR, "audio", "voiceover.timestamps.json");
  const whisperFile = path.join(OUT_DIR, "transcript", "transcript.json");

  if (!fs.existsSync(audioFile) || !fs.existsSync(ttsFile)) {
    throw new Error(`Missing pre-generated audio at ${audioFile} or timings at ${ttsFile}.`);
  }
  if (!fs.existsSync(whisperFile)) {
    throw new Error(
      `Missing whisper transcript at ${whisperFile}. Run faster-whisper first via src/transcribe/transcribe.py.`,
    );
  }

  const ttsData = JSON.parse(fs.readFileSync(ttsFile, "utf-8")) as { words: TTSWord[] };
  const whisperData = JSON.parse(fs.readFileSync(whisperFile, "utf-8")) as {
    words: WhisperWord[];
  };

  // ─── 2. Align script ↔ whisper ───────────────────────────
  log("Align", `Aligning ${ttsData.words.length} script words to ${whisperData.words.length} whisper tokens...`);
  const aligned = alignScriptToWhisper(ttsData.words, whisperData.words, FPS);
  const summary = summarizeAlignment(aligned);
  log(
    "Align",
    `${summary.total} aligned · ${summary.counts.whisper} whisper · ${summary.counts.interpolated} interp · ${summary.counts["tts-fallback"]} TTS fallback · ${summary.durationSeconds.toFixed(2)}s`,
  );

  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");
  fs.writeFileSync(
    alignedFile,
    JSON.stringify({ summary, words: aligned }, null, 2),
  );
  log("Align", `Wrote ${alignedFile}`);

  // ─── 3. Resolve keyword-anchored overlays ────────────────
  log("Anchor", `Resolving ${OVERLAY_SPECS.length} overlays against spoken keywords...`);
  const anchored = anchorOverlays(OVERLAY_SPECS, aligned);
  const overlays = anchored.map((a) => ({
    ...(a.payload as Record<string, unknown>),
    startSeconds: a.startSeconds,
    endSeconds: a.endSeconds,
    anchorSource: a.anchorMatched ? "keyword" : "fallback",
  }));

  // Log each overlay's resolved time + the drift vs the brief's hardcoded value
  anchored.forEach((a, i) => {
    const spec = OVERLAY_SPECS[i];
    const hard = spec.fallback?.startSeconds ?? 0;
    const drift = a.startSeconds - hard;
    const status = a.anchorMatched ? "✓ keyword" : "⚠ fallback";
    log(
      "Anchor",
      `  [${status}] "${(a.payload as { text?: string }).text}" → ${a.startSeconds.toFixed(2)}s (anchor="${a.anchorKeyword}", brief said ${hard.toFixed(2)}s, drift ${drift >= 0 ? "+" : ""}${drift.toFixed(2)}s)`,
    );
  });

  const overlaysFile = path.join(OUT_DIR, "audio", "overlays.resolved.json");
  fs.writeFileSync(overlaysFile, JSON.stringify(overlays, null, 2));
  log("Anchor", `Wrote ${overlaysFile}`);

  // ─── 4. Compute duration from aligned words ──────────────
  const lastWord = aligned[aligned.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 45;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`);

  // ─── 5. Stage audio in public/ ───────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  fs.copyFileSync(audioFile, path.join(publicDir, publicAudioName));
  log("Render", `Audio staged at public/${publicAudioName}`);

  // ─── 6. Bundle + render ──────────────────────────────────
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const inputProps = {
    audioUrl: publicAudioName,
    wordTimings: aligned,
    overlays,
    paperColor: "#FAF7F2",
    inkColor: "#1A1A1A",
    accentColor: "#B33A2A",
    mutedColor: "#6B6760",
    captionFontSize: 48,
    brandId: "armando-inteligencia",
  };

  const composition = await selectComposition({
    serveUrl,
    id: "TechNewsFlash9x16",
    inputProps,
  });

  const rawVideoFile = path.join(REMOTION_OUT, "raw.mp4");
  log("Render", `Rendering ${durationInFrames} frames -> ${rawVideoFile}`);
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
        if (pct % 10 === 0 && pct > 0) process.stdout.write(`\r[Render] ${pct}%`);
      }
    },
  });
  process.stdout.write("\n");
  const renderSec = (Date.now() - renderStart) / 1000;
  log("Render", `Raw render in ${renderSec.toFixed(1)}s`);

  // ─── 7. FFmpeg post (normalize + platform variants) ─────
  const masterFile = path.join(REMOTION_OUT, "master.mp4");
  log("FFmpeg", "Normalizing audio + writing master...");
  const normStart = Date.now();
  await execa("ffmpeg", [
    "-y", "-i", rawVideoFile,
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    masterFile,
  ], { stdio: "ignore" });
  log("FFmpeg", `master.mp4 in ${((Date.now() - normStart) / 1000).toFixed(1)}s`);

  const platforms = [
    { name: "tiktok", vBitrate: "8M" },
    { name: "reels", vBitrate: "5M" },
    { name: "shorts", vBitrate: "8M" },
  ];
  for (const p of platforms) {
    const out = path.join(REMOTION_OUT, `master.${p.name}.mp4`);
    log("Export", `${p.name} (${p.vBitrate})...`);
    await execa("ffmpeg", [
      "-y", "-i", masterFile,
      "-c:v", "libx264", "-b:v", p.vBitrate, "-maxrate", p.vBitrate, "-bufsize", "16M",
      "-preset", "medium", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      out,
    ], { stdio: "ignore" });
  }

  // ─── 8. Report ──────────────────────────────────────────
  const masterStats = fs.statSync(masterFile);
  console.log("\n✓ V2 Remotion render complete");
  console.log(`  Duration:     ${audioDuration.toFixed(2)}s (${durationInFrames} frames @${FPS}fps)`);
  console.log(`  Raw render:   ${renderSec.toFixed(1)}s`);
  console.log(`  master.mp4:   ${masterFile} (${(masterStats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  Whisper coverage: ${(summary.coverage.whisper * 100).toFixed(0)}% of words have accurate timing`);
  console.log(`  Keyword anchors:  ${anchored.filter((a) => a.anchorMatched).length}/${anchored.length} matched`);

  fs.writeFileSync(
    path.join(REMOTION_OUT, "render.timings.json"),
    JSON.stringify(
      {
        slug: SLUG,
        composition: "TechNewsFlash9x16",
        durationSeconds: audioDuration,
        durationFrames: durationInFrames,
        renderSeconds: renderSec,
        alignmentSummary: summary,
        anchorMatchRate: anchored.filter((a) => a.anchorMatched).length / anchored.length,
        masterSizeBytes: masterStats.size,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("\n✗ V2 render failed:", err);
  process.exit(1);
});
