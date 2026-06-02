#!/usr/bin/env node
/**
 * runTella16x9Demo — a Tella-style 16:9 layout demo on the user's REAL footage.
 *
 * THE ASK (the user's exact goal)
 * -------------------------------
 * A 16:9 video where HE is composited in a CORNER / to the SIDE / FULL-screen over
 * animated graphics of what he's saying, with a ZOOM on his face, and SMOOTH
 * grow/shrink TRANSITIONS when moving him between positions.
 *
 * HOW THIS DRIVER DELIVERS IT
 * ---------------------------
 *   1. Stage the cam clip — the IMG_3627 "feature list" money-shot (~21.0–31.3s),
 *      HDR-color-fixed (iPhone HLG/bt2020 → bt709) the SAME way renderFromPlan
 *      stages base clips. His footage is portrait 9:16, so it is staged to a tall
 *      1080×1920 clip; inside the 16:9 frame the LayoutTrack places it as a tall
 *      corner/side rectangle (objectFit:cover) — never a stretched landscape crop.
 *   2. The "animated graphics of what he's saying" = the SCREEN layer. We pre-render
 *      the existing `ThreeRowLabeledCardStack16x9` template (his feature triplet:
 *      Documentos / Reportes / Reuniones) to an mp4 and feed it as `screenSrc`, so
 *      the non-cam area is filled with animated graphics illustrating his words.
 *   3. A `layoutTrack` demonstrating Tella switching, all `transition:'smooth'` so
 *      the cam grows/shrinks/slides between positions:
 *        FULL-cam (him full, zoom IN on his face)
 *          → corner-bubble-br-md (him small bottom-right, graphics fill)
 *          → split-5050 (him left half, graphics right half)
 *          → FULL-cam (back to full)
 *   4. FACE ZOOM — the opening FULL phase uses two stacked segments with a smooth
 *      transition: camScale 1.0 → 1.45 focused on the upper-middle (his face),
 *      a continuous Ken-Burns push driven by the new `camScale` Region field
 *      (LayoutTrack scales the video INSIDE its region; the box stays full-frame).
 *
 * Renders `SpeakerOverlayScene16x9` → output/autoedit/tella-16x9-demo.mp4.
 *
 * One-shot driver — does NOT edit renderFromPlan/editPlan-schema in conflicting
 * ways, overlay molecules, or Root.tsx. It only ADDS (the `camScale` field is a
 * backward-compatible optional). Run:  npx tsx src/autoedit/runTella16x9Demo.ts
 */
import fs from "fs";
import path from "path";

import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { execa } from "execa";

import type { LayoutSegment } from "./editPlan.js";
import { hdrColorFixFilter, hlgLutPath } from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

// ── Source money-shot (IMG_3627 feature list) ──────────────────────────────────
const SOURCE = path.join(PROJECT_ROOT, "output/footage/claude-cowork/IMG_3627.MOV");
// Clean feature-list delivery: "Organiza carpetas, analizar documentos, crear
// reportes, hojas de Excel… presentaciones… resúmenes, reuniones y muchas cosas
// más." (skips the 12.5–20.2s doubled "Claude Codework puede" stumble.)
const KEEP_START = 21.0;
const KEEP_END = 31.3;

const SLUG = "tella-16x9-demo";
// Cam clip is staged PORTRAIT (his native aspect) so the 16:9 LayoutTrack regions
// crop it as tall rectangles. Screen graphics are a separate 16:9 mp4.
const CAM_STATIC_REF = path.posix.join("autoedit", "tella-cam-3627.mp4");
const SCREEN_STATIC_REF = path.posix.join("autoedit", "tella-screen-features.mp4");

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — HDR-fixed portrait cam clip (renderFromPlan staging idiom)
// ─────────────────────────────────────────────────────────────────────────────

/** iPhone .MOV HDR (bt2020/HLG) → bt709 SDR via the SAME baked LUT renderFromPlan
 *  uses (correct HLG inverse-OETF tonemap, matched to the reference grade). Trim the
 *  money-shot, scale to a portrait 1080×1920 (his native aspect), normalize fps,
 *  re-encode H.264. */
async function stageCamClip(absOut: string): Promise<void> {
  const w = 1080;
  const h = 1920;
  const colorFix = hdrColorFixFilter(true, hlgLutPath(PROJECT_ROOT));
  const vf =
    `${colorFix}scale=${w}:${h}:force_original_aspect_ratio=increase,` +
    `crop=${w}:${h},fps=${FPS},format=yuv420p,` +
    `setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709`;
  console.log(`[tella] staging cam clip (HDR→bt709, ${w}×${h}) → ${absOut}`);
  await execa("ffmpeg", [
    "-y",
    "-ss",
    String(KEEP_START),
    "-to",
    String(KEEP_END),
    "-i",
    SOURCE,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    // Tag the staged clip bt709 SDR — pixels are already bt709 after the LUT, but
    // ffmpeg would otherwise keep the source HLG/bt2020 tags and Remotion would
    // re-tonemap (skin shifts red). Relabel, do not convert.
    "-colorspace",
    "bt709",
    "-color_primaries",
    "bt709",
    "-color_trc",
    "bt709",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    absOut,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — pre-render the SCREEN graphics (ThreeRowLabeledCardStack16x9)
// ─────────────────────────────────────────────────────────────────────────────

async function renderScreenGraphics(
  serveUrl: string,
  durationInFrames: number,
  absOut: string,
): Promise<void> {
  const inputProps: Record<string, unknown> = {
    rows: [
      { label: "ORGANIZA", title: "Carpetas y documentos", accentColor: "#5BC0E8" },
      { label: "CREA", title: "Reportes y Excel con fórmulas", accentColor: "#D4AF37" },
      { label: "RESUME", title: "Reuniones y limpieza de datos", accentColor: "#E8743B" },
    ],
    caption: { text: "y muchas cosas más", keyword: "más" },
    handle: "",
    durationFrames: durationInFrames,
  };
  const composition = await selectComposition({
    serveUrl,
    id: "ThreeRowLabeledCardStack16x9",
    inputProps,
  });
  console.log(`[tella] rendering screen graphics → ${absOut}`);
  await renderMedia({
    composition: { ...composition, durationInFrames, fps: FPS },
    serveUrl,
    codec: "h264",
    outputLocation: absOut,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 50 === 0) {
        process.stdout.write(`\r[tella] screen ${Math.round(progress * 100)}%  `);
      }
    },
  });
  process.stdout.write("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// The Tella layout sequence (smooth grow/shrink/slide between positions)
// ─────────────────────────────────────────────────────────────────────────────

/** Full-frame cam region with an optional Ken-Burns push on his FACE. The focus is
 *  NOT the frame center — in this clip his face sits LEFT of center, looking down at
 *  notes. Detected by skin-tone (YCbCr) centroid across the zoom window: median
 *  x≈0.255, y≈0.41 (mouth); we raise y to ≈0.34 so the zoom centers on his eyes,
 *  and nudge x to 0.29 (head-center, since the cheek-facing skin pulls the median
 *  left). Re-derive with the skin-centroid probe in .claude/memory.md. */
function fullCam(camScale: number): LayoutSegment["layout"] {
  return {
    cam: {
      xPct: 0,
      yPct: 0,
      wPct: 1,
      hPct: 1,
      shape: "rect",
      camScale,
      camFocusXPct: 0.29,
      camFocusYPct: 0.34,
    },
  };
}

/**
 * Phases (≈10.3s @ 30fps ≈ 309 frames):
 *   A  [0,75)    FULL, no zoom — establish him full-frame.
 *   A' [75,150)  FULL, smooth zoom IN to 1.45 on his face (Ken Burns push).
 *   B  [150,210) CORNER bubble bottom-right (md), graphics fill — smooth shrink.
 *   C  [210,270) SPLIT 50/50, him left half + graphics right half — smooth slide.
 *   D  [270,end) FULL again — smooth grow back to full.
 */
function buildLayoutTrack(durationInFrames: number): LayoutSegment[] {
  const end = durationInFrames;
  return [
    // A — full, settle. (no transition: opens on full cam)
    { id: "lay-a", startFrame: 0, endFrame: 75, layout: fullCam(1.0) },
    // A' — smooth Ken-Burns zoom IN on his face over 60f.
    {
      id: "lay-a2",
      startFrame: 75,
      endFrame: 150,
      layout: fullCam(1.45),
      transition: { type: "smooth", durationFrames: 60 },
    },
    // B — shrink him into the bottom-right corner bubble; graphics fill the frame.
    {
      id: "lay-b",
      startFrame: 150,
      endFrame: 210,
      layout: "corner-bubble-br-md",
      transition: { type: "smooth", durationFrames: 36 },
    },
    // C — slide/grow him to the LEFT half; graphics take the right half.
    {
      id: "lay-c",
      startFrame: 210,
      endFrame: 270,
      layout: "split-5050",
      transition: { type: "smooth", durationFrames: 36 },
    },
    // D — grow back to full.
    {
      id: "lay-d",
      startFrame: 270,
      endFrame: end,
      layout: fullCam(1.0),
      transition: { type: "smooth", durationFrames: 36 },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) throw new Error(`Source not found: ${SOURCE}`);

  const publicDir = path.join(PROJECT_ROOT, "public", "autoedit");
  fs.mkdirSync(publicDir, { recursive: true });
  const camAbs = path.join(PROJECT_ROOT, "public", CAM_STATIC_REF);
  const screenAbs = path.join(PROJECT_ROOT, "public", SCREEN_STATIC_REF);

  const durationInFrames = Math.round((KEEP_END - KEEP_START) * FPS); // ≈ 309

  // ── Stage 1: cam clip (HDR-fixed portrait) ─────────────────────────────────
  await stageCamClip(camAbs);

  await ensureBrowser();
  const entryPoint = path.join(PROJECT_ROOT, "src/index.ts");

  // ── Stage 2: screen graphics mp4 ───────────────────────────────────────────
  // First bundle (does NOT need the screen mp4) → render the screen graphics into
  // public/autoedit/. A Remotion bundle snapshots public/ at bundle time, so the
  // FINAL scene render must bundle AGAIN below, after this mp4 exists, or its
  // staticFile() ref 404s.
  console.log("[tella] bundling (pass 1 — screen graphics)…");
  const serveUrl1 = await bundle({ entryPoint });
  await renderScreenGraphics(serveUrl1, durationInFrames, screenAbs);

  // ── Re-bundle so the scene's staticFile(screenSrc) resolves the new mp4 ────
  console.log("[tella] bundling (pass 2 — scene, with staged assets)…");
  const serveUrl = await bundle({ entryPoint });

  // ── Stage 3: the Tella 16:9 scene ──────────────────────────────────────────
  const layoutTrack = buildLayoutTrack(durationInFrames);
  const inputProps: Record<string, unknown> = {
    camSrc: CAM_STATIC_REF,
    screenSrc: SCREEN_STATIC_REF,
    layoutTrack,
    handle: "@armandointeligencia",
    durationFrames: durationInFrames,
    // Override the registered defaultProps `overlays` (EDICIÓN AUTOMÁTICA bullet
    // list + clapperboard) — Remotion merges defaultProps, so an empty array is
    // required to suppress them; the SCREEN graphics carry the message instead.
    overlays: [],
    // No caption layer for this layout demo (the graphics ARE the message).
    caption: { wordTimings: [], style: "editorial-cyan", register: "editorial" },
  };

  const compositionId = "SpeakerOverlayScene16x9";
  console.log(`[tella] selecting ${compositionId}…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputDir = path.join(PROJECT_ROOT, "output", "autoedit");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${SLUG}.mp4`);

  console.log(
    `[tella] rendering ${durationInFrames} frames @ ${FPS}fps → ${outputPath}`,
  );
  console.log(
    "[tella] sequence: FULL → FULL+faceZoom(1.45) → corner-bubble-br-md → split-5050 → FULL (all smooth)",
  );
  const started = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames, fps: FPS },
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        process.stdout.write(`\r[tella] scene ${Math.round(progress * 100)}%  `);
      }
    },
  });
  const elapsed = (Date.now() - started) / 1000;

  console.log(`\n✓ TELLA 16:9 DEMO COMPLETE`);
  console.log(`  output : ${outputPath}`);
  console.log(`  frames=${durationInFrames} @ ${FPS}fps · render ${elapsed.toFixed(1)}s`);
}

main().catch((err) => {
  console.error(
    "\n✗ runTella16x9Demo failed:",
    err instanceof Error ? (err.stack ?? err.message) : err,
  );
  process.exit(1);
});
