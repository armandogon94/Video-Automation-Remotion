#!/usr/bin/env node
/**
 * runCaptionShowcase — render the SAME color-corrected money-shot clip (IMG_3618
 * benefit line) once per caption STYLE preset so the 8 styles can be compared
 * side-by-side ("try out the different caption styles so I see them in action").
 *
 * Each output reuses the exact same plan (keep-range, transcript, register, position,
 * mode) and only swaps `captionStyle` — so any visible difference is purely the
 * typographic/animation preset (Wave-9 §1.2 orthogonal-axis contract). The HDR→SDR
 * LUT in renderFromPlan is applied to every staged clip, so all 8 share the corrected
 * grade. Outputs: output/autoedit/captions/<style>.mp4
 *
 *   npx tsx src/autoedit/runCaptionShowcase.ts
 */
import fs from "fs";
import path from "path";

import { buildEditPlan } from "./buildEditPlan.js";
import { toEditSegments } from "./silenceTrim.js";
import { editPlanWordSchema, type EditPlanWord } from "./editPlan.js";
import { renderEditedVideo, type CaptionStyle } from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const SOURCE = path.join(PROJECT_ROOT, "output/footage/claude-cowork/IMG_3618.MOV");
const TRANSCRIPT = path.join(
  PROJECT_ROOT,
  "output/footage/claude-cowork/transcripts/IMG_3618.json",
);
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/captions");

const KEEP_START = 16.0;
const KEEP_END = 20.6;

// All 8 typographic/animation presets (FloatingCaption CaptionStyle union).
const STYLES: CaptionStyle[] = [
  "classic",
  "hormozi-pop",
  "box-highlight",
  "editorial-cyan",
  "condensed-hype",
  "slide-clean",
  "blur-premium",
  "type-terminal",
];

function loadSourceWords(): EditPlanWord[] {
  const raw: unknown = JSON.parse(fs.readFileSync(TRANSCRIPT, "utf-8"));
  const words = (raw as { words?: unknown[] }).words ?? [];
  return words
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => r.data);
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) throw new Error(`Source not found: ${SOURCE}`);
  if (!fs.existsSync(TRANSCRIPT)) throw new Error(`Transcript not found: ${TRANSCRIPT}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const segments = toEditSegments(
    [{ startSeconds: KEEP_START, endSeconds: KEEP_END }],
    FPS,
  );
  const sourceWords = loadSourceWords();
  const sourceDurationFrames = Math.ceil(22.953 * FPS);

  console.log(`[showcase] ${STYLES.length} caption styles · keep ${KEEP_START}-${KEEP_END}s\n`);

  const results: { style: CaptionStyle; file: string; secs: number }[] = [];
  for (const style of STYLES) {
    const plan = buildEditPlan({
      sourceVideo: SOURCE,
      aspect: "9:16",
      fps: FPS,
      sourceDurationFrames,
      segments,
      sourceWords,
      caption: { register: "editorial", position: "bottom-center", mode: "karaoke" },
      overlayOptions: { maxOverlays: 0 },
    });

    const slug = `cap-${style}`;
    console.log(`[showcase] → ${style}`);
    const result = await renderEditedVideo({
      plan,
      projectRoot: PROJECT_ROOT,
      slug,
      captionStyle: style,
      log: () => {}, // quiet per-render; we print our own one-liners
    });
    results.push({ style, file: result.outputPath, secs: result.elapsedSeconds });
    console.log(`           done (${result.elapsedSeconds.toFixed(1)}s) → ${path.basename(result.outputPath)}`);
  }

  console.log(`\n✓ CAPTION SHOWCASE COMPLETE — ${results.length} styles`);
  for (const r of results) console.log(`  ${r.style.padEnd(15)} ${r.file}`);
}

main().catch((err) => {
  console.error("\n✗ runCaptionShowcase failed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
