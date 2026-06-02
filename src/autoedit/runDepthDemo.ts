#!/usr/bin/env node
/**
 * runDepthDemo — the "text-behind-speaker" DEPTH demo on real footage.
 *
 * Builds on the v1 auto-edit (runFirstEdit.ts) but engages the depth-compositing
 * path: the SAME staged money-shot clip (`public/autoedit/IMG_3618.mp4`) is used
 * BOTH as the background plate (camSrc, full-frame layout layer) AND — via the RVM
 * matte (`public/matte/IMG_3618/fg/0000.png`…) — as the cut-out speaker composited
 * ON TOP. A large hero word "NETFLIX" is added as a `behindSpeaker` overlay so it
 * renders BETWEEN the plate and the speaker matte → the word appears behind him
 * (his body/head occludes it). The normal editorial-cyan karaoke caption stays in
 * FRONT (reusing the v1 wordTimings).
 *
 * Layer stack engaged (SpeakerOverlayScene9x16, layout mode):
 *   1. LayoutTrack  → camSrc full-frame   (background plate = the speaker footage)
 *   2. behind overlays (NETFLIX, behindSpeaker:true)                ← BEHIND him
 *   ── SpeakerForegroundMatte (RVM png-sequence) ──                 ← the cut-out speaker
 *   3. front overlays (none) + editorial-cyan caption               ← in FRONT
 *   4. handle chip
 *
 * One-shot driver — does NOT edit SpeakerOverlayScene / editPlan / Root. Reuses
 * buildEditPlan only to rebase the v1 wordTimings onto the trimmed timeline, then
 * renders the existing composition directly (the clip is ALREADY staged, so no
 * ffmpeg re-trim). Run:  npx tsx src/autoedit/runDepthDemo.ts
 */
import fs from "fs";
import path from "path";

import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";

import { buildEditPlan } from "./buildEditPlan.js";
import { toEditSegments } from "./silenceTrim.js";
import { editPlanWordSchema, type EditPlanWord } from "./editPlan.js";

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

// Same money-shot KEEP range + slug as runFirstEdit.ts so the wordTimings match v1.
const KEEP_START = 16.0;
const KEEP_END = 20.6;
const SLUG = "IMG_3618";

// The clip is ALREADY staged at public/autoedit/IMG_3618.mp4 (the v1 base plate).
const STAGED_STATIC_REF = path.posix.join("autoedit", `${SLUG}.mp4`);
// RVM matte: zero-padded by ABSOLUTE frame index under public/matte/<slug>/fg/.
// SpeakerForegroundMatte resolves a %0Nd token per frame → matte/IMG_3618/fg/0000.png …
const MATTE_PATTERN = "matte/IMG_3618/fg/%04d.png";

/** v1 TRIAGE transcript corrections (identical to runFirstEdit.ts). */
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
  if (!fs.existsSync(TRANSCRIPT))
    throw new Error(`Transcript not found: ${TRANSCRIPT}`);
  const stagedAbs = path.join(PROJECT_ROOT, "public", STAGED_STATIC_REF);
  if (!fs.existsSync(stagedAbs))
    throw new Error(`Staged clip not found (run v1 first): ${stagedAbs}`);
  const matteFrame0 = path.join(PROJECT_ROOT, "public", "matte/IMG_3618/fg/0000.png");
  if (!fs.existsSync(matteFrame0))
    throw new Error(`Matte not found (run RVM first): ${matteFrame0}`);

  // Rebuild the SAME plan as v1 to recover the rebased wordTimings.
  const segments = toEditSegments(
    [{ startSeconds: KEEP_START, endSeconds: KEEP_END }],
    FPS,
  );
  const sourceWords = loadSourceWords();
  const sourceDurationFrames = Math.ceil(22.953 * FPS);

  const plan = buildEditPlan({
    sourceVideo: SOURCE,
    aspect: "9:16",
    fps: FPS,
    sourceDurationFrames,
    segments,
    sourceWords,
    caption: { register: "editorial", position: "bottom-center", mode: "karaoke" },
  });

  const durationInFrames = Math.max(1, Math.round(plan.editDurationFrames));

  // ── Build scene props directly (layout mode → matte path engaged) ───────────
  // Full-frame cam layer = the background plate (same footage). The matte (same
  // speaker, cut out) composites on top; NETFLIX sits behind him.
  const fullFrame = { xPct: 0, yPct: 0, wPct: 1, hPct: 1, shape: "rect" as const };

  const inputProps: Record<string, unknown> = {
    videoSrc: STAGED_STATIC_REF, // (ignored in layout mode, set for correctness)
    camSrc: STAGED_STATIC_REF, // background plate
    layoutTrack: [
      {
        id: "lay-0",
        startFrame: 0,
        endFrame: durationInFrames,
        layout: { cam: fullFrame },
      },
    ],
    foregroundMatte: { src: MATTE_PATTERN, kind: "png-sequence" },
    captionBehindSpeaker: false, // editorial-cyan caption stays IN FRONT
    overlays: [
      {
        type: "YellowGlowWordCallout",
        behindSpeaker: true, // ← renders BELOW the speaker matte (the depth beat)
        props: {
          text: "NETFLIX",
          // Upper-third hero anchor: pinned HIGH (~20% from top), horizontally
          // centered, so the word reads ABOVE his head/shoulders. Only its lower
          // edge is occluded by the matte → clearly behind him yet legible.
          anchor: "upper-third",
          enterFrame: 0,
          holdFrames: durationInFrames, // hold the whole clip
          yellow: "#E50914", // Netflix red, big + color-isolated
          // Large enough to read as a hero word, but small enough that the top
          // sits above his head rather than being swallowed by his torso.
          fontSize: 180,
          glowRadiusPx: 24,
          uppercase: true,
        },
      },
    ],
    caption: {
      wordTimings: plan.captionTrack.wordTimings,
      style: "editorial-cyan",
      position: "bottom-center",
      mode: "karaoke",
      register: "editorial",
    },
    durationFrames: durationInFrames,
  };

  console.log(
    `[depth] keep ${KEEP_START}-${KEEP_END}s · words=${plan.captionTrack.wordTimings.length} · frames=${durationInFrames}`,
  );
  console.log(`[depth] caption: ${plan.captionTrack.wordTimings.map((w) => w.text).join(" ")}`);
  console.log(`[depth] matte: ${MATTE_PATTERN} · plate=${STAGED_STATIC_REF}`);

  await ensureBrowser();
  console.log("[depth] bundling…");
  const serveUrl = await bundle({
    entryPoint: path.join(PROJECT_ROOT, "src/index.ts"),
  });

  const compositionId = "SpeakerOverlayScene9x16";
  console.log(`[depth] selecting ${compositionId}…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputDir = path.join(PROJECT_ROOT, "output", "autoedit");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${SLUG}-depth.mp4`);

  console.log(`[depth] rendering ${durationInFrames} frames → ${outputPath}`);
  const started = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames, fps: FPS },
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        process.stdout.write(`\r[depth] ${Math.round(progress * 100)}%   `);
      }
    },
  });
  const elapsed = (Date.now() - started) / 1000;

  console.log(`\n✓ DEPTH DEMO COMPLETE`);
  console.log(`  output : ${outputPath}`);
  console.log(`  frames=${durationInFrames} @ ${FPS}fps · ${elapsed.toFixed(1)}s render`);
}

main().catch((err) => {
  console.error(
    "\n✗ runDepthDemo failed:",
    err instanceof Error ? (err.stack ?? err.message) : err,
  );
  process.exit(1);
});
