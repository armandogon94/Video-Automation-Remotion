/**
 * LayoutPresets — named scene layouts → resolved `{cam, screen}` regions.
 *
 * WHAT THIS IS
 * ------------
 * The closed vocabulary of Tella-style layout presets (see
 * docs/research/wave-9/TELLA-PRODUCT-RESEARCH.md §2.2 / §3.2). Each preset
 * resolves to concrete `Region`s in normalized `[0..1]` canvas coordinates so it
 * survives any aspect-ratio crop. `LayoutTrack.tsx` consumes the resolved regions
 * to position the two source video layers (screen behind, cam in front).
 *
 * REGION CONVENTION
 * -----------------
 * A `Region` (from `editPlan.ts`) is `{xPct,yPct,wPct,hPct}` in 0..1 of the
 * canvas, plus an optional `shape`/`cornerRadiusPx` border treatment. Paint order
 * is fixed by the layer (screen behind, cam in front) — there is no per-region
 * z-index here (unlike the research's `z` field), because the LayoutTrack stacks
 * the two layers in a fixed DOM order; `tv-presenter` is handled by giving the cam
 * the full canvas and floating the screen on top within that fixed order.
 *
 * ASPECT-AWARENESS
 * ----------------
 * Most presets are aspect-agnostic (0..1 regions look right in both 16:9 and
 * 9:16). Two are aspect-aware: `split-5050` (horizontal split in landscape,
 * vertical split in portrait — Tella §2.2) and the corner-bubble sizes (a bubble
 * that is "medium" in 16:9 would be too small in a tall 9:16 frame, so portrait
 * bubbles are scaled up). Pass the `aspect` to `resolveLayout()` to opt in.
 */
import type { InlineLayout, Region } from "../../autoedit/editPlan";

export type LayoutAspect = "16:9" | "9:16";

/** Default camera border treatment (Jack's squircle, itsjack/ANALYSIS.md §2). */
const CAM_SHAPE = "squircle" as const;
const CAM_RADIUS_PX = 28;
/** Subtle rounding on screens so UI chrome isn't clipped (Tella §2.3). */
const SCREEN_SHAPE = "rounded" as const;
const SCREEN_RADIUS_PX = 14;

/** Full-canvas region helper. */
const FULL: Region = { xPct: 0, yPct: 0, wPct: 1, hPct: 1, shape: "rect" };

function cam(r: Omit<Region, "shape" | "cornerRadiusPx">): Region {
  return { ...r, shape: CAM_SHAPE, cornerRadiusPx: CAM_RADIUS_PX };
}
function screen(r: Omit<Region, "shape" | "cornerRadiusPx">): Region {
  return { ...r, shape: SCREEN_SHAPE, cornerRadiusPx: SCREEN_RADIUS_PX };
}

// ─────────────────────────────────────────────────────────────────────────────
// Corner-bubble PiP — Tella's 9-point grid (corners here) × S/M/L sizes (§2.2)
// ─────────────────────────────────────────────────────────────────────────────

type Corner = "tl" | "tr" | "bl" | "br";
type BubbleSize = "sm" | "md" | "lg";

/** Bubble size as a fraction of the SHORTER canvas dimension, per aspect. The
 *  bubble is kept square-ish via `LayoutTrack`'s circle/squircle rendering; here
 *  we size width by canvas-width fraction and height by canvas-height fraction so
 *  the on-canvas pixel box is near-square at the target aspect. */
const BUBBLE_W: Record<LayoutAspect, Record<BubbleSize, number>> = {
  "16:9": { sm: 0.14, md: 0.2, lg: 0.27 },
  // Portrait: same on-screen footprint needs a larger width-fraction.
  "9:16": { sm: 0.26, md: 0.36, lg: 0.46 },
};

/** Margin from the frame edge, per aspect (fraction of that axis). */
const BUBBLE_MARGIN: Record<LayoutAspect, { x: number; y: number }> = {
  "16:9": { x: 0.03, y: 0.045 },
  "9:16": { x: 0.04, y: 0.03 },
};

/** Approximate canvas aspect ratio (w/h) for keeping bubbles square on screen. */
const CANVAS_RATIO: Record<LayoutAspect, number> = { "16:9": 16 / 9, "9:16": 9 / 16 };

function bubbleLayout(
  corner: Corner,
  size: BubbleSize,
  aspect: LayoutAspect,
): InlineLayout {
  const wPct = BUBBLE_W[aspect][size];
  // Make the on-screen box square: hPct = wPct * (canvasW/canvasH).
  const hPct = Math.min(0.9, wPct * CANVAS_RATIO[aspect]);
  const m = BUBBLE_MARGIN[aspect];
  const left = corner === "tl" || corner === "bl";
  const top = corner === "tl" || corner === "tr";
  const xPct = left ? m.x : 1 - m.x - wPct;
  const yPct = top ? m.y : 1 - m.y - hPct;
  return {
    screen: screen({ ...FULL }),
    cam: cam({ xPct, yPct, wPct, hPct }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Framed-backdrop (Jack's signature) — itsjack/ANALYSIS.md §2
// ─────────────────────────────────────────────────────────────────────────────

/** Jack's default backdrop palette (the dominant blue-gradient variant). */
export const FRAMED_BACKDROP_DEFAULT = {
  type: "gradient" as const,
  angleDeg: 120,
  stops: ["#3B82F6", "#1E5FD8", "#0B3A9C"],
};

/**
 * Jack's framed scene: screen window inset ~6–8% top/right, larger gap bottom-left
 * for a chunky bottom-left squircle cam (~27–30% W × ~40–44% H). Aspect-aware: in
 * portrait the screen inset is uniform and the cam is sized for the tall frame.
 */
function framedBackdropLayout(aspect: LayoutAspect): InlineLayout {
  if (aspect === "9:16") {
    return {
      screen: screen({ xPct: 0.06, yPct: 0.08, wPct: 0.88, hPct: 0.56 }),
      cam: cam({ xPct: 0.06, yPct: 0.66, wPct: 0.46, hPct: 0.26 }),
    };
  }
  // 16:9 — quantified from itsjack/ANALYSIS.md §2 frame geometry.
  return {
    screen: screen({ xPct: 0.07, yPct: 0.07, wPct: 0.84, hPct: 0.8 }),
    cam: cam({ xPct: 0.025, yPct: 0.55, wPct: 0.28, hPct: 0.42 }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The closed list of preset NAMES. `corner-bubble-{tl,tr,bl,br}-{sm,md,lg}` is the
 * 12 PiP variants (Tella's 9-point grid corners × S/M/L). Kept as a string union
 * for ergonomic call-sites; `resolveLayout` accepts any string (inline layouts
 * are resolved elsewhere) and returns `null` for unknown names.
 */
export const LAYOUT_PRESET_NAMES = [
  "full-cam",
  "screen-only",
  "split-5050",
  "tv-presenter",
  "framed-backdrop",
  "corner-bubble-tl-sm",
  "corner-bubble-tl-md",
  "corner-bubble-tl-lg",
  "corner-bubble-tr-sm",
  "corner-bubble-tr-md",
  "corner-bubble-tr-lg",
  "corner-bubble-bl-sm",
  "corner-bubble-bl-md",
  "corner-bubble-bl-lg",
  "corner-bubble-br-sm",
  "corner-bubble-br-md",
  "corner-bubble-br-lg",
] as const;

export type LayoutPresetName = (typeof LAYOUT_PRESET_NAMES)[number];

const CORNER_BUBBLE_RE = /^corner-bubble-(tl|tr|bl|br)-(sm|md|lg)$/;

/**
 * Resolve a preset NAME to a `{cam?, screen?}` region pair. Returns `null` for an
 * unknown name (caller falls back to the base layout). Presets that need the
 * canvas aspect (`split-5050`, the corner bubbles) read it from `aspect`.
 */
export function resolveLayout(
  name: string,
  aspect: LayoutAspect,
): InlineLayout | null {
  switch (name) {
    case "full-cam":
      return { cam: cam({ ...FULL }) };
    case "screen-only":
      return { screen: screen({ ...FULL }) };
    case "split-5050":
      // Horizontal split in landscape (cam left, screen right); vertical split in
      // portrait (cam top, screen bottom) — Tella §2.2.
      return aspect === "9:16"
        ? {
            cam: cam({ xPct: 0, yPct: 0, wPct: 1, hPct: 0.5 }),
            screen: screen({ xPct: 0, yPct: 0.5, wPct: 1, hPct: 0.5 }),
          }
        : {
            cam: cam({ xPct: 0, yPct: 0, wPct: 0.5, hPct: 1 }),
            screen: screen({ xPct: 0.5, yPct: 0, wPct: 0.5, hPct: 1 }),
          };
    case "tv-presenter":
      // Big cam fills the canvas; screen floats on top (fixed paint order puts the
      // cam behind, so we give the cam full-canvas and overlap a floating screen).
      return aspect === "9:16"
        ? {
            cam: cam({ ...FULL }),
            screen: screen({ xPct: 0.08, yPct: 0.1, wPct: 0.84, hPct: 0.48 }),
          }
        : {
            cam: cam({ ...FULL }),
            screen: screen({ xPct: 0.4, yPct: 0.12, wPct: 0.56, hPct: 0.7 }),
          };
    case "framed-backdrop":
      return framedBackdropLayout(aspect);
    default: {
      const m = CORNER_BUBBLE_RE.exec(name);
      if (m) {
        return bubbleLayout(m[1] as Corner, m[2] as BubbleSize, aspect);
      }
      return null;
    }
  }
}

/** True when `name` is one of the known preset names. */
export function isLayoutPresetName(name: string): name is LayoutPresetName {
  return (LAYOUT_PRESET_NAMES as readonly string[]).includes(name);
}

export type { Region, InlineLayout } from "../../autoedit/editPlan";
