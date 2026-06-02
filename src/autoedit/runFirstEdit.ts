#!/usr/bin/env node
/**
 * runFirstEdit — the FIRST real end-to-end auto-edit on actual footage (Part 2).
 *
 * Drives the pipeline on `output/footage/claude-cowork/IMG_3618.MOV` (the cleanest
 * clip per TRIAGE.md): keeps the money-shot benefit line, builds captions from the
 * existing faster-whisper transcript re-based onto the trimmed timeline, and renders
 * `SpeakerOverlayScene9x16` over the trimmed footage via `renderFromPlan`.
 *
 * This is a one-shot driver (not the general CLI) so the exact keep-range and the
 * TRIAGE transcript corrections are explicit + reproducible. Run:
 *   npx tsx src/autoedit/runFirstEdit.ts
 */
import fs from "fs";
import path from "path";

import { buildEditPlan } from "./buildEditPlan.js";
import { toEditSegments } from "./silenceTrim.js";
import { editPlanWordSchema, type EditPlanWord } from "./editPlan.js";
import { renderEditedVideo, type CaptionStyle } from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const SOURCE = path.join(
  PROJECT_ROOT,
  "output/footage/claude-cowork/IMG_3618.MOV",
);
const TRANSCRIPT = path.join(
  PROJECT_ROOT,
  "output/footage/claude-cowork/transcripts/IMG_3618.json",
);

// Money-shot benefit line (TRIAGE.md IMG_3618): the clean second pass —
// "Claude se encarga de todo mientras tú ves el capítulo que aún no has podido
//  terminar en Netflix." — runs 16.20s → 20.34s. Pad slightly head/tail.
const KEEP_START = 16.0;
const KEEP_END = 20.6;

const CAPTION_STYLE: CaptionStyle = "editorial-cyan";
const SLUG = "IMG_3618";

/**
 * Apply the TRIAGE.md transcript corrections to a word's text. None of these tokens
 * appear in IMG_3618 (no "PlanMax", no "eai"/"e ai" sign-off), but we apply the
 * documented corrections generically so the same driver works on the other clips.
 */
function correctWordText(text: string): string {
  let t = text;
  t = t.replace(/\bPlanMax\b/gi, "Plan Max");
  t = t.replace(/\be\s*ai\b/gi, "Armando Inteligencia");
  t = t.replace(/\beai\b/gi, "Armando Inteligencia");
  return t;
}

function loadSourceWords(): EditPlanWord[] {
  const raw: unknown = JSON.parse(fs.readFileSync(TRANSCRIPT, "utf-8"));
  const words = (raw as { words?: unknown[] }).words ?? [];
  return words
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => ({ ...r.data, text: correctWordText(r.data.text) }));
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) throw new Error(`Source not found: ${SOURCE}`);
  if (!fs.existsSync(TRANSCRIPT)) throw new Error(`Transcript not found: ${TRANSCRIPT}`);

  // One KEEP span = the money-shot. toEditSegments maps source→edit timeline.
  const segments = toEditSegments(
    [{ startSeconds: KEEP_START, endSeconds: KEEP_END }],
    FPS,
  );

  const sourceWords = loadSourceWords();
  const sourceDurationFrames = Math.ceil(22.953 * FPS); // from transcript.duration

  const plan = buildEditPlan({
    sourceVideo: SOURCE,
    aspect: "9:16",
    fps: FPS,
    sourceDurationFrames,
    segments,
    sourceWords,
    caption: { register: "editorial", position: "bottom-center", mode: "karaoke" },
    // v1 is a CLEAN caption-only edit. The rule-based suggester would otherwise
    // fire R4 (brand beat) on "Netflix" and dump a default 🧠 IconPopOverSpeaker
    // in the top-right — a meaningless static icon, NOT a real animated pop-up.
    // We do NOT dump random icons in v1; suppress overlays entirely here.
    // (Animated over-speaker pop-ups are demoed via runOverlayAnimDemo.ts.)
    overlayOptions: { maxOverlays: 0 },
  });

  console.log(
    `[plan] keep ${KEEP_START}-${KEEP_END}s · edit-words=${plan.captionTrack.wordTimings.length} · overlays=${plan.overlayTrack.length} · editFrames=${plan.editDurationFrames}`,
  );
  console.log(
    `[plan] caption text: ${plan.captionTrack.wordTimings.map((w) => w.text).join(" ")}`,
  );

  const result = await renderEditedVideo({
    plan,
    projectRoot: PROJECT_ROOT,
    slug: SLUG,
    captionStyle: CAPTION_STYLE,
  });

  console.log(`\n✓ FIRST AUTO-EDIT COMPLETE`);
  console.log(`  staged clip : ${result.stagedClipPath}`);
  console.log(`  final video : ${result.outputPath}`);
  console.log(`  frames=${result.durationInFrames} @ ${FPS}fps · ${result.elapsedSeconds.toFixed(1)}s wall`);
}

main().catch((err) => {
  console.error("\n✗ runFirstEdit failed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
