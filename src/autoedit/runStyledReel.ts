#!/usr/bin/env node
/**
 * runStyledReel — assemble FULL alternative reel cuts with per-beat motion-graphics
 * baked in, so you can compare finished edits (not just clips). Same 8 eye-contact
 * beats as runAssembleReel, but each beat gets a keyword overlay + an advancing
 * segmented progress bar, in two styles:
 *   • editorial — RevealText keyword (fade/slide, cyan accent) + thin progress bar
 *   • punchy    — SentimentKeyword pop (tone-colored stroke) + progress bar
 * Outputs → output/autoedit/claude-cowork-reel-<style>.mp4
 *   npx tsx src/autoedit/runStyledReel.ts
 */
import fs from "fs";
import path from "path";
import { editPlanWordSchema, type EditPlanWord } from "./editPlan.js";
import { renderMultiSourcePlan, type ReelBeat } from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const FOOTAGE_DIR = path.join(PROJECT_ROOT, "output/footage/claude-cowork");
const TRANSCRIPT_DIR = path.join(FOOTAGE_DIR, "transcripts");
const CYAN = "#5BC0E8", GOLD = "#D4AF37";

interface BeatSpec { clip: string; label: string; startSec: number; endSec: number; word: string; tone: string; reveal: string }

// Same 8 beats as the base reel + a curated keyword + tone/reveal per beat.
const BEATS: BeatSpec[] = [
  { clip: "IMG_3615", label: "hook", startSec: 35.08, endSec: 40.66, word: "8 HORAS → MINUTOS", tone: "topic", reveal: "slide-up" },
  { clip: "IMG_3616", label: "setup", startSec: 40.78, endSec: 45.36, word: "CLAUDE COWORK", tone: "topic", reveal: "mask-wipe" },
  { clip: "IMG_3617", label: "how-2", startSec: 91.18, endSec: 99.36, word: "EN AUTOMÁTICO", tone: "positive", reveal: "fade-up" },
  { clip: "IMG_3618", label: "benefit", startSec: 16.08, endSec: 20.46, word: "NETFLIX", tone: "alert", reveal: "pop" },
  { clip: "IMG_3629", label: "availability", startSec: 42.68, endSec: 54.52, word: "SOLO PLAN MAX", tone: "neutral", reveal: "rise-line" },
  { clip: "IMG_3630", label: "cta-1", startSec: 16.08, endSec: 21.86, word: "¿PARA TU EMPRESA?", tone: "topic", reveal: "fade-up" },
  { clip: "IMG_3630", label: "cta-2", startSec: 25.38, endSec: 28.46, word: "HERRAMIENTAS", tone: "positive", reveal: "pop" },
  { clip: "IMG_3632", label: "follow", startSec: 4.28, endSec: 26.5, word: "SÍGUEME", tone: "positive", reveal: "scale-in" },
];

function correctWordText(text: string): string {
  let t = text;
  t = t.replace(/\bPlanMax\b/gi, "Plan Max");
  t = t.replace(/\be\s*ai\b/gi, "Armando Inteligencia").replace(/\beai\b/gi, "Armando Inteligencia");
  t = t.replace(/\bCodework\b/gi, "Cowork").replace(/\bReducio\b/gi, "Reduce");
  return t;
}

function loadWords(clip: string): EditPlanWord[] {
  const raw: unknown = JSON.parse(fs.readFileSync(path.join(TRANSCRIPT_DIR, `${clip}.json`), "utf-8"));
  const words = (raw as { words?: unknown[] }).words ?? [];
  return words
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => ({ ...r.data, text: correctWordText(r.data.text) }));
}

type Overlay = { type: string; props: Record<string, unknown>; behindSpeaker?: boolean };

/** Per-beat edit-frame ranges (cumulative trimmed durations). */
function beatFrameRanges(): { start: number; len: number }[] {
  const out: { start: number; len: number }[] = [];
  let acc = 0;
  for (const b of BEATS) {
    const len = Math.round((b.endSec - b.startSec) * FPS);
    out.push({ start: acc, len });
    acc += len;
  }
  return out;
}

function buildOverlays(style: "editorial" | "punchy"): Overlay[] {
  const ranges = beatFrameRanges();
  const n = BEATS.length;
  const ov: Overlay[] = [];
  BEATS.forEach((b, i) => {
    const { start, len } = ranges[i];
    const enter = start + 8;
    const hold = Math.max(20, len - 18);
    // Advancing segmented progress bar (one instance per beat, stepping fill).
    ov.push({ type: "SegmentedProgressBar", props: { segments: n, progress: (i + 1) / n, anchor: "top", enterFrame: start, holdFrames: len, accentColor: CYAN, secondaryColor: GOLD } });
    // Per-beat keyword.
    if (style === "editorial") {
      ov.push({ type: "RevealText", props: { text: b.word, reveal: b.reveal, anchor: "lower-third", fontSize: b.word.length > 14 ? 96 : 128, color: "#FFFFFF", accentColor: CYAN, glow: false, enterFrame: enter, holdFrames: hold } });
    } else {
      ov.push({ type: "SentimentKeyword", props: { text: b.word, tone: b.tone, anchor: "lower-third", enterFrame: enter, holdFrames: hold } });
    }
  });
  return ov;
}

async function renderStyle(style: "editorial" | "punchy"): Promise<void> {
  const beats: ReelBeat[] = [];
  const wordsPerBeat: EditPlanWord[][] = [];
  const cache = new Map<string, EditPlanWord[]>();
  for (const b of BEATS) {
    const sourceFile = path.join(FOOTAGE_DIR, `${b.clip}.MOV`);
    beats.push({ sourceFile, startSec: b.startSec, endSec: b.endSec, label: b.label });
    if (!cache.has(b.clip)) cache.set(b.clip, loadWords(b.clip));
    wordsPerBeat.push(cache.get(b.clip)!);
  }
  console.log(`\n[styled:${style}] rendering full reel with ${BEATS.length} beats + overlays…`);
  const result = await renderMultiSourcePlan({
    beats, wordsPerBeat, aspect: "9:16", fps: FPS, projectRoot: PROJECT_ROOT,
    slug: `claude-cowork-reel-${style}`,
    captionStyle: style === "punchy" ? "hormozi-pop" : "editorial-cyan",
    captionPosition: "bottom-center", captionMode: "karaoke",
    overlays: buildOverlays(style),
    log: (m) => console.log(`  [${style}] ${m}`),
  });
  console.log(`✓ ${style}: ${result.outputPath} · ${result.durationInFrames}f / ${result.durationSeconds.toFixed(1)}s`);
}

async function main(): Promise<void> {
  for (const style of ["editorial", "punchy"] as const) await renderStyle(style);
  console.log("\n✓ STYLED REELS COMPLETE (editorial + punchy)");
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
