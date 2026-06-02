#!/usr/bin/env node
/**
 * runAssembleReel — assemble the full "Claude Cowork" reel from the best single
 * take of EACH beat across the 9 raw .MOV clips (TRIAGE.md).
 *
 * Unlike `runFirstEdit` (one money-shot from ONE file), this driver harvests one
 * clean range from EACH source file and stitches them — in TRIAGE's recommended
 * beat order — into a single 9:16 reel via `renderMultiSourcePlan`. Each beat's
 * caption words are loaded from that clip's faster-whisper transcript, filtered to
 * the kept range, and re-based onto the assembled timeline. TRIAGE caption
 * corrections are applied ("PlanMax" → "Plan Max", "eai"/"e ai" → "Armando
 * Inteligencia"), plus a couple of obvious whisper mis-hearings in the kept lines.
 *
 * Run: npx tsx src/autoedit/runAssembleReel.ts
 *
 * BEAT SELECTION (TRIAGE.md ranges, tightened to the cleanest single pass so
 * cuts and captions carry no stutters/duplicates):
 *   hook         IMG_3615  35.00–40.60  "Reduce tu trabajo de 8 horas a tan solo unos minutos."
 *   setup        IMG_3616  40.70–45.30  "…que ha tenido Claude Code…, ahora Anthropic saca Claude Cowork,"
 *   features     IMG_3627  15.00–31.40  "Claude Cowork puede organizar carpetas, analizar documentos…"
 *   how-it-works IMG_3617  06.10–10.05  "Con Cowork no tienes que chatear paso a paso."
 *   how-it-works IMG_3617  90.90–99.40  "Claude se encarga de todo mientras tú haces otra cosa."
 *   benefit      IMG_3618  16.00–20.60  "…mientras tú ves el capítulo que aún no has podido terminar en Netflix."
 *   availability IMG_3629  42.60–54.50  "Por ahora solo está… del Plan Max, pero marca claramente hacia dónde va…"
 *   cta          IMG_3630  16.10–21.90  "Si quieres saber si esta u otras herramientas… para tu empresa,"
 *   cta          IMG_3630  25.40–28.50  "entonces comenta la palabra herramientas."
 *   follow       IMG_3632  04.20–26.50  "También te invito a seguirme… podamos continuar armando inteligencia."
 *
 * NOTE: IMG_3628 (no-code beat) is intentionally omitted — TRIAGE marks it
 * marginal (60s lead silence, one buried sentence). v1 prefers the cleanest takes.
 */
import fs from "fs";
import path from "path";

import { editPlanWordSchema, type EditPlanWord } from "./editPlan.js";
import {
  renderMultiSourcePlan,
  type CaptionStyle,
  type ReelBeat,
} from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const FOOTAGE_DIR = path.join(PROJECT_ROOT, "output/footage/claude-cowork");
const TRANSCRIPT_DIR = path.join(FOOTAGE_DIR, "transcripts");

const CAPTION_STYLE: CaptionStyle = "editorial-cyan";
const SLUG = "claude-cowork-reel";

/** A beat references its clip by id; paths are resolved relative to FOOTAGE_DIR. */
interface BeatSpec {
  clip: string;
  label: string;
  startSec: number;
  endSec: number;
}

// Beats are EYE-CONTACT takes only, tightened to speech boundaries (first word
// −0.12s … last word +0.16s) so there's no pre-/post-speech dead air. DROPPED two
// off-camera takes the user flagged as bloopers:
//   • features (IMG_3627 15–31s): reading the feature list off a PAPER, looking down
//   • how-1    (IMG_3617 6–10s):  looking down at his PHONE the whole line
// Their content is carried elsewhere (the Tella demo shows the feature list as motion
// graphics; how-2 covers "Claude does it while you do other things"), so the narrative
// still flows: hook → setup → how-2 → benefit → availability → CTA → follow.
const BEATS: BeatSpec[] = [
  { clip: "IMG_3615", label: "hook", startSec: 35.08, endSec: 40.66 },
  { clip: "IMG_3616", label: "setup", startSec: 40.78, endSec: 45.36 },
  { clip: "IMG_3617", label: "how-2", startSec: 91.18, endSec: 99.36 },
  { clip: "IMG_3618", label: "benefit", startSec: 16.08, endSec: 20.46 },
  { clip: "IMG_3629", label: "availability", startSec: 42.68, endSec: 54.52 },
  { clip: "IMG_3630", label: "cta-1", startSec: 16.08, endSec: 21.86 },
  { clip: "IMG_3630", label: "cta-2", startSec: 25.38, endSec: 28.46 },
  { clip: "IMG_3632", label: "follow", startSec: 4.28, endSec: 26.5 },
];

/**
 * Apply TRIAGE.md caption corrections + a few obvious whisper mis-hearings in the
 * kept lines. Brand/spelling fixes only — never alters meaning.
 */
function correctWordText(text: string): string {
  let t = text;
  // TRIAGE documented corrections.
  t = t.replace(/\bPlanMax\b/gi, "Plan Max");
  t = t.replace(/\be\s*ai\b/gi, "Armando Inteligencia");
  t = t.replace(/\beai\b/gi, "Armando Inteligencia");
  // Whisper mis-hearings in the kept lines.
  t = t.replace(/\bCodework\b/gi, "Cowork"); // IMG_3627 "Claude Codework" → "Cowork"
  t = t.replace(/\bReducio\b/gi, "Reduce"); // IMG_3615 hook "Reducio" → "Reduce"
  return t;
}

/** Load + correct a clip's whisper words (source-time, 30fps frames). */
function loadWords(clip: string): EditPlanWord[] {
  const file = path.join(TRANSCRIPT_DIR, `${clip}.json`);
  if (!fs.existsSync(file)) throw new Error(`Transcript not found: ${file}`);
  const raw: unknown = JSON.parse(fs.readFileSync(file, "utf-8"));
  const words = (raw as { words?: unknown[] }).words ?? [];
  return words
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => ({ ...r.data, text: correctWordText(r.data.text) }));
}

async function main(): Promise<void> {
  // Cache transcripts per clip (some beats share a source, e.g. IMG_3617/IMG_3630).
  const wordCache = new Map<string, EditPlanWord[]>();
  const wordsFor = (clip: string): EditPlanWord[] => {
    const cached = wordCache.get(clip);
    if (cached) return cached;
    const w = loadWords(clip);
    wordCache.set(clip, w);
    return w;
  };

  const beats: ReelBeat[] = [];
  const wordsPerBeat: EditPlanWord[][] = [];
  for (const b of BEATS) {
    const sourceFile = path.join(FOOTAGE_DIR, `${b.clip}.MOV`);
    if (!fs.existsSync(sourceFile)) throw new Error(`Source not found: ${sourceFile}`);
    beats.push({ sourceFile, startSec: b.startSec, endSec: b.endSec, label: b.label });
    wordsPerBeat.push(wordsFor(b.clip));
  }

  console.log(`[reel] assembling ${beats.length} beats:`);
  BEATS.forEach((b) => {
    const words = wordsFor(b.clip).filter(
      (w) => w.startSeconds >= b.startSec && w.startSeconds < b.endSec,
    );
    console.log(
      `  ${b.label.padEnd(14)} ${b.clip} ${b.startSec}-${b.endSec}s · ` +
        `"${words.map((w) => w.text).join(" ")}"`,
    );
  });

  const result = await renderMultiSourcePlan({
    beats,
    wordsPerBeat,
    aspect: "9:16",
    fps: FPS,
    projectRoot: PROJECT_ROOT,
    slug: SLUG,
    captionStyle: CAPTION_STYLE,
    captionPosition: "bottom-center",
    captionMode: "karaoke",
  });

  console.log(`\n✓ CLAUDE COWORK REEL COMPLETE`);
  console.log(`  staged clip : ${result.stagedClipPath}`);
  console.log(`  final video : ${result.outputPath}`);
  console.log(`  beats=${result.beatCount} · frames=${result.durationInFrames} @ ${FPS}fps`);
  console.log(`  duration=${result.durationSeconds.toFixed(1)}s · ${result.elapsedSeconds.toFixed(1)}s wall`);
}

main().catch((err) => {
  console.error("\n✗ runAssembleReel failed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
