#!/usr/bin/env node
/**
 * runLayoutPunch — the austin.marchese "layout punch" on REAL talking-head
 * footage (Matthew Berman dogfood fixture).
 *
 * THE ASK (Armando's feedback on the caption-only auto-edits)
 * -----------------------------------------------------------
 * The auto-editor should not only caption — it should apply the austin grammar:
 * the speaker starts FULLSCREEN, then PUNCHES into a rounded vertical panel on
 * the RIGHT while the LEFT fills with a liquid-glass content stack (kicker +
 * title + numbered cards appearing ONE BY ONE as he speaks) over a brand
 * gradient backdrop, then punches back to fullscreen.
 *
 * HOW THIS DRIVER DELIVERS IT
 * ---------------------------
 *   1. Stage the base clip: the berman-end2 EDIT-timeline clip (silence-trimmed
 *      per output/dogfood/berman-end2-plan.json via `trimAndStageBaseClip`) →
 *      public/autoedit/berman-layout-demo.mp4. NOTE: the RAW fixture is
 *      source-time (752f); the plan's captions/overlay beats are EDIT-time
 *      (696f), so the staged clip MUST be the trimmed edit or every beat after
 *      the first cut drifts (~0.5s at 5s, ~1.9s by the end).
 *   2. Render SpeakerOverlayScene16x9 (1920×1080, 696f @30fps) in layout mode:
 *        - baseLayout "full-cam" → he opens fullscreen;
 *        - layoutTrack: punch IN at f140 (18f smooth) → rounded cam panel
 *          right (x .70, y .16, w .26, h .68, r28); punch OUT at f600 back to
 *          full-cam (18f smooth);
 *        - backdrop: 135° deep-navy → navy brand gradient behind the punch;
 *        - overlays: SidePanelCards left (56% wide), Sequence-mounted
 *          f150–f596, cards timed to his ACTUAL beats (enterFrame 36 +
 *          stagger 108 → scene f186/294/402/510 ≈ "owns all knowledge work" /
 *          "How does society continue" / "Government intervention" /
 *          "we will not allow a single company");
 *        - captions: the plan's word timings, box-highlight karaoke.
 *
 * Output: output/dogfood/berman-layout-demo.mp4.
 * One-shot driver — run:  npx tsx src/autoedit/runLayoutPunch.ts
 */
import fs from "fs";
import path from "path";

import { bundleOnce as bundle } from "./bundleOnce";
import {
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";

import { backdropSchema, editPlanSchema, type LayoutSegment } from "./editPlan.js";
import { trimAndStageBaseClip } from "./renderFromPlan.js";
import { BRAND } from "../brand";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

const PLAN_PATH = path.join(PROJECT_ROOT, "output/dogfood/berman-end2-plan.json");
const SLUG = "berman-layout-demo";
const CAM_STATIC_REF = path.posix.join("autoedit", `${SLUG}.mp4`);
const DURATION_FRAMES = 696; // = plan.editDurationFrames (23.2s @30fps)

// ─────────────────────────────────────────────────────────────────────────────
// The punch choreography
// ─────────────────────────────────────────────────────────────────────────────

/** FULL → rounded right panel (f140, 18f smooth) → FULL again (f600, 18f). */
const LAYOUT_TRACK: LayoutSegment[] = [
  {
    id: "punch-in",
    startFrame: 140,
    endFrame: 600,
    layout: {
      cam: {
        xPct: 0.7,
        yPct: 0.16,
        wPct: 0.26,
        hPct: 0.68,
        shape: "rounded",
        cornerRadiusPx: 28,
      },
    },
    transition: { type: "smooth", durationFrames: 18 },
  },
  {
    id: "punch-out",
    startFrame: 600,
    endFrame: DURATION_FRAMES,
    layout: "full-cam",
    transition: { type: "smooth", durationFrames: 18 },
  },
];

/** Brand gradient behind the punch (deep navy → navy, 135°). Validated against
 *  backdropSchema so a schema drift fails loudly here, not silently mid-render. */
const BACKDROP = backdropSchema.parse({
  type: "gradient",
  angleDeg: 135,
  stops: [BRAND.colors.backgroundDark, BRAND.colors.primary], // #0F1B2D → #1B3A6E
});

/** The left content stack — mirrors what Berman actually says in the clip, so
 *  the cards land on the same beats as the captions (edit-time frames):
 *    "owns all knowledge work"        f190 → card 1 @ f186
 *    "How does society continue"     f291 → card 2 @ f294
 *    "Government intervention"       f400 → card 3 @ f402
 *    "we will not allow a single…"   f519 → card 4 @ f510
 *  (Sequence mounts at f150 → local beats = 36 + i·108.) */
const OVERLAYS = [
  {
    type: "SidePanelCards",
    fromFrame: 150,
    toFrame: 596,
    props: {
      side: "left",
      widthFrac: 0.56,
      kicker: "EL PUNTO MÁS SERIO",
      title: "Si Anthropic gana el trabajo del conocimiento…",
      cards: [
        {
          n: 1,
          title: "Posee todo el trabajo del conocimiento",
          note: "software, análisis, decisiones",
        },
        {
          n: 2,
          title: "¿Cómo continúa la sociedad?",
          note: "la pregunta sin respuesta",
        },
        {
          n: 3,
          title: "La intervención del gobierno",
          note: "la última línea de defensa",
        },
        {
          n: 4,
          title: "Todo el poder, una sola empresa",
          note: "el escenario que no permitiremos",
        },
      ],
      enterFrame: 36,
      staggerFrames: 108,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!fs.existsSync(PLAN_PATH)) throw new Error(`Plan not found: ${PLAN_PATH}`);
  const plan = editPlanSchema.parse(
    JSON.parse(fs.readFileSync(PLAN_PATH, "utf8")),
  );
  if (!fs.existsSync(plan.sourceVideo)) {
    throw new Error(`Fixture not found: ${plan.sourceVideo}`);
  }

  // ── Stage 1: the trimmed EDIT-timeline base clip under public/ ─────────────
  const camAbs = path.join(PROJECT_ROOT, "public", CAM_STATIC_REF);
  if (!fs.existsSync(camAbs)) {
    await trimAndStageBaseClip(plan, PROJECT_ROOT, SLUG, (m) =>
      console.log(`[punch] ${m}`),
    );
  } else {
    console.log(`[punch] staged clip present → ${camAbs}`);
  }

  // ── Stage 2: bundle (AFTER staging, so staticFile() resolves the clip) ─────
  await ensureBrowser();
  console.log("[punch] bundling…");
  const serveUrl = await bundle({
    entryPoint: path.join(PROJECT_ROOT, "src/index.ts"),
  });

  // ── Stage 3: the punch scene ───────────────────────────────────────────────
  const inputProps: Record<string, unknown> = {
    camSrc: CAM_STATIC_REF, // layout mode — NO videoSrc
    baseLayout: "full-cam",
    layoutTrack: LAYOUT_TRACK,
    backdrop: BACKDROP,
    overlays: OVERLAYS,
    caption: {
      wordTimings: plan.captionTrack.wordTimings,
      style: "box-highlight",
      position: "bottom-center",
      mode: "karaoke",
      register: "editorial",
    },
    handle: "@armandointeligencia",
    durationFrames: DURATION_FRAMES,
  };

  const compositionId = "SpeakerOverlayScene16x9";
  console.log(`[punch] selecting ${compositionId}…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputPath = path.join(PROJECT_ROOT, "output", "dogfood", `${SLUG}.mp4`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log(
    `[punch] rendering ${DURATION_FRAMES} frames @ ${FPS}fps → ${outputPath}`,
  );
  console.log(
    "[punch] choreography: FULL → punch-in f140 (cam→right panel, cards build left) → punch-out f600 → FULL",
  );
  const started = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames: DURATION_FRAMES, fps: FPS },
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        process.stdout.write(`\r[punch] ${Math.round(progress * 100)}%  `);
      }
    },
  });
  const elapsed = (Date.now() - started) / 1000;

  console.log(`\n✓ LAYOUT PUNCH DEMO COMPLETE`);
  console.log(`  output : ${outputPath}`);
  console.log(
    `  frames=${DURATION_FRAMES} @ ${FPS}fps · render ${elapsed.toFixed(1)}s`,
  );
}

main().catch((err) => {
  console.error(
    "\n✗ runLayoutPunch failed:",
    err instanceof Error ? (err.stack ?? err.message) : err,
  );
  process.exit(1);
});
