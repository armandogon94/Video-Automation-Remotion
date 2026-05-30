/**
 * WhiteboardOverheadHandDraw — Alex Hormozi's H6 "WhiteboardOverheadHandDraw".
 *
 * Source: references/creators/alexhormozi/ANALYSIS.md — pattern **H6
 * `WhiteboardOverheadHandDraw`** (top-down whiteboard cutaway). Anchored at
 * §3 "RE-CONFIRMED patterns" table row:
 *   "**H6 `WhiteboardOverheadHandDraw`** (top-down whiteboard cutaway) | 5
 *    windows / 4 videos" (videos `hHkdbr6_JJs`, `3SVksBB3_YY`, `nSQdjim8CsE`,
 *    `EonibwnAEME` — math/bookkeeping cluster in blue sharpie).
 * Cross-niche convergent twin: "Adam Rosler's top-down code-paper drawings"
 * (§4 Cross-creator overlaps). Dual-lane note (§4):
 *   "`WhiteboardOverheadHandDraw` (H6) — both lanes; portrait crops the paper
 *    to a center column."
 *
 * Visual: an overhead (top-down) view of a marker/whiteboard surface. Hand-drawn
 * strokes — underlines, circles, arrows, simple labels — reveal progressively
 * via SVG `stroke-dashoffset` animation, as if a hand is drawing them live in
 * blue/black/green sharpie. Strokes draw on in sequence with a configurable
 * stagger; each label text fades in just after its stroke completes.
 *
 *   ┌───────────────────────────────────────┐
 *   │                                       │
 *   │   LEADS ───────                       │   ← underline draws L→R
 *   │                                       │
 *   │        ( SALES )                      │   ← circle traces around
 *   │           │                           │
 *   │           ▼                           │   ← arrow draws + arrowhead
 *   │        PROFIT                         │
 *   │                                       │
 *   └───────────────────────────────────────┘
 *
 * Aspect-NEUTRAL (Tier-B per ADR-001 §2.3): no hard-coded 1920×1080 or
 * 1080×1920. The surface fills the parent slot at 100%/100% and the SVG uses a
 * normalized `0 0 100 100` viewBox with `preserveAspectRatio="none"` so stroke
 * geometry is authored in 0..100 percentage space and scales into whatever box
 * the parent positions/sizes. Renders standalone with sensible defaults.
 *
 * Transition verb (Wave-5 contract):
 *   "Overhead whiteboard surface fills the slot; pre-traced sharpie-style SVG
 *    strokes (underline/circle/arrow/path) reveal one-at-a-time via
 *    stroke-dashoffset over `strokeDurationFrames`, staggered by
 *    `staggerFrames`; each stroke's label fades in just after the stroke
 *    finishes drawing."
 *
 * @dualAspect true — renders in both 9:16 and 16:9; the parent positions and
 * sizes the slot. Tier-B per ADR-001 §2.3. Source pattern: Hormozi H6
 * `WhiteboardOverheadHandDraw`.
 *
 * Pure React FC reading its own `useCurrentFrame()`, so it can be mounted inside
 * an AbsoluteFill or a <Sequence> (Remotion handles relative time).
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRAND, FONT_STACKS } from "../brand";

/** A single point in normalized 0..100 surface space. */
export interface WhiteboardPoint {
  /** X in 0..100 (percent of surface width). */
  x: number;
  /** Y in 0..100 (percent of surface height). */
  y: number;
}

/**
 * One hand-drawn stroke on the whiteboard. `kind` selects the geometry;
 * the optional `label` is text revealed near the stroke once it finishes.
 */
export interface WhiteboardStroke {
  /**
   * Geometry of the stroke:
   *  - `underline` — a near-horizontal line from `from` → `to`.
   *  - `circle`    — an ellipse traced around `center` with `radius`.
   *  - `arrow`     — a line from `from` → `to` with a drawn arrowhead.
   *  - `path`      — an arbitrary SVG path `d` string (advanced).
   */
  kind: "underline" | "circle" | "arrow" | "path";
  /** Start point (underline, arrow). */
  from?: WhiteboardPoint;
  /** End point (underline, arrow). */
  to?: WhiteboardPoint;
  /** Center (circle). */
  center?: WhiteboardPoint;
  /** Radius in normalized units; `[rx, ry]` or a single number for a circle. */
  radius?: number | [number, number];
  /** Raw SVG path `d` (kind === "path"). Authored in 0..100 space. */
  d?: string;
  /** Optional text label revealed near the stroke after it draws. */
  label?: string;
  /** Anchor point for the label. Defaults to the stroke's natural anchor. */
  labelAt?: WhiteboardPoint;
  /** Per-stroke ink color override (defaults to `markerColor`). */
  color?: string;
  /** Per-stroke marker weight override (defaults to `markerWidth`). */
  width?: number;
}

export interface WhiteboardOverheadHandDrawProps {
  /** Strokes to draw, in reveal order. */
  strokes?: WhiteboardStroke[];
  /** Default marker ink color. Default = a blue-sharpie tone. */
  markerColor?: string;
  /** Whiteboard/paper surface color. Default = warm off-white. */
  surfaceColor?: string;
  /** Frames between successive stroke reveals. Default 18. */
  staggerFrames?: number;
  /** Frames each stroke takes to draw on. Default 20. */
  strokeDurationFrames?: number;
  /** Frame at which the first stroke begins drawing. Default 0. */
  startFrame?: number;
  /** Default marker stroke weight (SVG user units in 0..100 space). Default 0.9. */
  markerWidth?: number;
  /** Show a faint paper-grid texture under the strokes? Default true. */
  showGrid?: boolean;
  /** Label text color. Defaults to `markerColor`. */
  labelColor?: string;
  /** Label font family. Default = brand sans. */
  fontFamily?: string;
}

/** Blue sharpie — the H6 `EonibwnAEME` math/bookkeeping cluster ink tone. */
const DEFAULT_MARKER = "#2A5BB0";
/** Warm off-white paper/whiteboard surface. */
const DEFAULT_SURFACE = "#F6F3EC";

/**
 * Default strokes so the molecule renders meaningfully standalone — a small
 * "LEADS → SALES → PROFIT" funnel sketch in the Hormozi top-down style.
 */
const DEFAULT_STROKES: WhiteboardStroke[] = [
  {
    kind: "underline",
    from: { x: 22, y: 26 },
    to: { x: 52, y: 26 },
    label: "LEADS",
    labelAt: { x: 22, y: 19 },
  },
  {
    kind: "circle",
    center: { x: 50, y: 50 },
    radius: [16, 9],
    label: "SALES",
    labelAt: { x: 50, y: 50 },
    color: BRAND.colors.keywordOrange,
  },
  {
    kind: "arrow",
    from: { x: 50, y: 60 },
    to: { x: 50, y: 76 },
  },
  {
    kind: "underline",
    from: { x: 36, y: 86 },
    to: { x: 64, y: 86 },
    label: "PROFIT",
    labelAt: { x: 50, y: 80 },
  },
];

/**
 * Build the SVG `d` path string for a stroke in 0..100 space. Returns null for
 * malformed strokes (missing required points) so they are skipped rather than
 * throwing during render.
 */
function buildPath(stroke: WhiteboardStroke): string | null {
  switch (stroke.kind) {
    case "underline":
    case "arrow": {
      if (!stroke.from || !stroke.to) return null;
      return `M ${stroke.from.x} ${stroke.from.y} L ${stroke.to.x} ${stroke.to.y}`;
    }
    case "circle": {
      if (!stroke.center) return null;
      const r = stroke.radius ?? 10;
      const rx = Array.isArray(r) ? r[0] : r;
      const ry = Array.isArray(r) ? r[1] : r;
      const { x, y } = stroke.center;
      // Trace an ellipse as two arcs so a single path with dashoffset draws it
      // continuously (one full loop, start at the left vertex).
      return [
        `M ${x - rx} ${y}`,
        `A ${rx} ${ry} 0 1 1 ${x + rx} ${y}`,
        `A ${rx} ${ry} 0 1 1 ${x - rx} ${y}`,
      ].join(" ");
    }
    case "path": {
      return stroke.d ?? null;
    }
    default:
      return null;
  }
}

/**
 * Build the arrowhead path for an `arrow` stroke (two short barbs at `to`,
 * pointing back along the from→to direction). Returns null when not an arrow.
 */
function buildArrowhead(stroke: WhiteboardStroke): string | null {
  if (stroke.kind !== "arrow" || !stroke.from || !stroke.to) return null;
  const dx = stroke.to.x - stroke.from.x;
  const dy = stroke.to.y - stroke.from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  // Barb length in normalized units; angle ~28deg off the shaft.
  const barb = Math.min(5, len * 0.4);
  const angle = (28 * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // Rotate the reversed unit vector by ±angle to get the two barb directions.
  const back = { x: -ux, y: -uy };
  const left = {
    x: back.x * cos - back.y * sin,
    y: back.x * sin + back.y * cos,
  };
  const right = {
    x: back.x * cos + back.y * sin,
    y: -back.x * sin + back.y * cos,
  };
  const tip = stroke.to;
  return [
    `M ${tip.x + left.x * barb} ${tip.y + left.y * barb}`,
    `L ${tip.x} ${tip.y}`,
    `L ${tip.x + right.x * barb} ${tip.y + right.y * barb}`,
  ].join(" ");
}

/** Natural label anchor when `labelAt` is omitted. */
function labelAnchorFor(stroke: WhiteboardStroke): WhiteboardPoint {
  if (stroke.labelAt) return stroke.labelAt;
  if (stroke.center) return stroke.center;
  if (stroke.from) return { x: stroke.from.x, y: stroke.from.y - 6 };
  return { x: 50, y: 50 };
}

export const WhiteboardOverheadHandDraw: React.FC<
  WhiteboardOverheadHandDrawProps
> = ({
  strokes = DEFAULT_STROKES,
  markerColor = DEFAULT_MARKER,
  surfaceColor = DEFAULT_SURFACE,
  staggerFrames = 18,
  strokeDurationFrames = 20,
  startFrame = 0,
  markerWidth = 0.9,
  showGrid = true,
  labelColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const resolvedFont = fontFamily ?? FONT_STACKS.sans;
  const drawDuration = Math.max(1, strokeDurationFrames);
  const gridLines: number[] = [12, 24, 36, 48, 60, 72, 84];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: surfaceColor,
        // Subtle overhead-lighting vignette so it reads as a real surface shot.
        backgroundImage:
          "radial-gradient(120% 120% at 50% 30%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, display: "block" }}
        // Geometry is authored in percentage space; non-uniform scale is fine
        // for hand-drawn strokes (slight stretch reads as natural marker work).
        shapeRendering="geometricPrecision"
      >
        {showGrid ? (
          <g stroke="rgba(27,58,110,0.06)" strokeWidth={0.15}>
            {gridLines.map((p) => (
              <line key={`h-${p}`} x1={0} y1={p} x2={100} y2={p} />
            ))}
            {gridLines.map((p) => (
              <line key={`v-${p}`} x1={p} y1={0} x2={p} y2={100} />
            ))}
          </g>
        ) : null}

        {strokes.map((stroke, i) => {
          const d = buildPath(stroke);
          if (!d) return null;
          const enter = startFrame + i * staggerFrames;
          const progress = interpolate(
            frame,
            [enter, enter + drawDuration],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          // pathLength is normalized to 1 so dasharray/offset are progress-based
          // regardless of the stroke's true geometric length.
          const ink = stroke.color ?? markerColor;
          const w = stroke.width ?? markerWidth;
          const head = buildArrowhead(stroke);
          // Arrowhead only after the shaft is essentially fully drawn.
          const headProgress = interpolate(
            frame,
            [enter + drawDuration * 0.85, enter + drawDuration * 1.1],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke={ink}
                strokeWidth={w}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - progress}
              />
              {head ? (
                <path
                  d={head}
                  fill="none"
                  stroke={ink}
                  strokeWidth={w}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - headProgress}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Labels render as HTML (crisp text) positioned over the surface in the
          same 0..100 percentage space, so they track the SVG geometry. */}
      {strokes.map((stroke, i) => {
        if (!stroke.label) return null;
        const enter = startFrame + i * staggerFrames;
        // Label fades in just after its stroke finishes drawing.
        const labelOpacity = interpolate(
          frame,
          [enter + drawDuration * 0.7, enter + drawDuration + 6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const anchor = labelAnchorFor(stroke);
        const color = labelColor ?? stroke.color ?? markerColor;
        return (
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: `${anchor.x}%`,
              top: `${anchor.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: labelOpacity,
              fontFamily: resolvedFont,
              fontWeight: 800,
              // clamp keeps labels legible in both portrait and landscape slots
              // without locking to a pixel size (aspect-neutral).
              fontSize: "clamp(14px, 4vmin, 56px)",
              letterSpacing: "0.04em",
              color,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              pointerEvents: "none",
              // slight hand-written tilt
              rotate: "-1.5deg",
            }}
          >
            {stroke.label}
          </div>
        );
      })}
    </div>
  );
};

export default WhiteboardOverheadHandDraw;
