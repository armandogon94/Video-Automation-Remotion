/**
 * DecisionTree9x16 — vertical (1080×1920) decision-tree / radial pie split.
 *
 * Wave-5 Tella-derived template (synthesis T7 in
 * docs/research/wave-5/tella-motion-graphics-synthesis.md). The reference is
 * ykBDqicGx0M @ 16:47–17:55 — a central parent node with 3–5 child nodes
 * fanning out, edges drawing last via stroke-dashoffset, labels revealing
 * AFTER their edge completes.
 *
 * CRITICAL Tella rule (ykBDqicGx0M.txt L254–258): "Remotion doesn't do an
 * amazing job at arrows. It kind of shows the pointy bits of the arrow too
 * quickly or in strange places." → This template NEVER animates arrowheads.
 * It places a small static DOT (or CHEVRON) at the tip of each edge only
 * once the edge is fully drawn.
 *
 * Visual structure (top → bottom on the 1080×1920 canvas):
 *   1. Optional BrandBreadcrumb (~y=80)
 *   2. Section label (~y=220)
 *   3. Title + subtitle (~y=320)
 *   4. SVG diagram layer (y ≈ 500 → y ≈ 1700)
 *        · Root node at the top-center of the diagram layer (radial-fan / pie)
 *          or top-center for tree-down.
 *        · 3–5 child nodes positioned by `layout` mode.
 *        · Edges drawn root→child via pathDraw() with per-child stagger.
 *        · Static dot/chevron at edge tip rendered AFTER edge progress >= 1.
 *        · Child label fades in `labelRevealAfterEdgeFrames` after edge done.
 *   5. EditorialCaption strip (bottom), gated by `showCaptions`.
 *
 * The `transitionVerb` schema field is metadata for the prompt-engineering
 * pipeline (animation-replication-runbook.md contract) — it doesn't drive
 * runtime behavior, but it travels with the schema so downstream prompt
 * generators describe the motion in imperative voice.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { pathDraw } from "../animation/pathDraw";
import { EDITORIAL_SPRING } from "./scenes";

// ─── Local schemas ──────────────────────────────────────────────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const rootNodeSchema = z
  .object({
    label: z.string().default("AI for this task?"),
    sub: z.string().default(""),
    color: z.string().default(""),
  })
  .default({
    label: "AI for this task?",
    sub: "",
    color: "",
  });

const childNodeSchema = z.object({
  label: z.string().default(""),
  sub: z.string().default(""),
  color: z.string().default(""),
  /** Optional angle override (degrees from horizontal-right, counter-clockwise).
   *  If absent, evenly distributed by layout. */
  angle: z.number().optional(),
});

export const decisionTree9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),

  /** Title shown above the diagram. */
  title: z.string().default("Decide when to use AI"),
  /** Optional subtitle under the title. */
  subtitle: z.string().default(""),

  /** The parent / central node. */
  rootNode: rootNodeSchema,

  /** Children — 3 to 5 typical. */
  children: z
    .array(childNodeSchema)
    .default([
      { label: "Delegate to AI", sub: "Routine tasks", color: "#7CE49A" },
      { label: "Collaborate", sub: "Hard decisions", color: "#5BC0E8" },
      { label: "Avoid AI", sub: "Personal stuff", color: "#E89B7A" },
    ]),

  /** Layout mode:
   *   - 'radial-fan': children fan in a half-circle below the root
   *   - 'tree-down':  children stacked vertically below root with L-shaped edges
   *   - 'pie':        children evenly distributed around a full circle */
  layout: z
    .enum(["radial-fan", "tree-down", "pie"])
    .default("radial-fan"),

  /** Edge tip marker. NEVER animate arrowheads — use a static dot or chevron. */
  edgeTipMarker: z.enum(["dot", "chevron", "none"]).default("dot"),

  /** Timing. */
  rootEnterSeconds: z.number().default(0.4),
  edgeDrawStartSeconds: z.number().default(1.2),
  edgeDrawFrames: z.number().default(18),
  edgeStaggerFrames: z.number().default(6),
  labelRevealAfterEdgeFrames: z.number().default(4),

  // CRITICAL: transitionVerb in imperative voice (Wave-5 contract). MUST
  // mention the no-arrowhead rule.
  transitionVerb: z
    .string()
    .default(
      "Central root node fades in first; child edges draw outward from root via stroke-dashoffset over 18 frames, staggered by 6 frames each; labels fade in 4 frames AFTER each edge completes; place a static dot at each edge tip — DO NOT animate arrowheads (Tella's rule).",
    ),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type DecisionTree9x16Props = z.infer<typeof decisionTree9x16Schema>;
type ChildNode = z.infer<typeof childNodeSchema>;

// ─── Layout constants ───────────────────────────────────────────────
const CANVAS_W = 1080;
const CANVAS_H = 1920;

const BREADCRUMB_Y = 80;
const SECTION_LABEL_Y = 220;
const TITLE_Y = 300;

// SVG diagram band
const SVG_TOP = 500;
const SVG_BOTTOM = 1700;
const SVG_HEIGHT = SVG_BOTTOM - SVG_TOP;

// Node sizes (root + children share dimensions)
const ROOT_W = 360;
const ROOT_H = 130;
const CHILD_W = 280;
const CHILD_H = 110;

// Radial layout — radius from root center to child center
const RADIAL_RADIUS = 380;

// ─── Default fan angles per child count (degrees) ───────────────────
// Measured from the horizontal-right axis, counter-clockwise = positive.
// Because SVG y grows DOWNWARD, the half-circle "below" the root maps to
// angles in [180°, 360°] (or equivalently negative angles). We use the
// canonical math convention internally and flip Y when projecting.
//
// For radial-fan: distribute across the lower half (180°..360° in
// canonical / "downward 180° arc").
// For pie: distribute across full 360°, starting from straight down.
function defaultFanAngles(count: number): number[] {
  // Spread across 180° below horizontal (= -180° to 0° in math y-up,
  // = 180° to 360° in y-down screen). We feed angles directly in
  // screen-coords (y-down) below by negating sin/cos appropriately.
  // Spec: 3 children → 30°, 90°, 150° (measured from horizontal-right
  // downward), 5 children → 20°, 55°, 90°, 125°, 160°.
  if (count <= 1) return [90];
  if (count === 2) return [60, 120];
  if (count === 3) return [30, 90, 150];
  if (count === 4) return [25, 70, 110, 155];
  // 5 or more: spread evenly across [20°, 160°]
  const start = 20;
  const end = 160;
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function defaultPieAngles(count: number): number[] {
  // Even distribution around 360°, starting from straight down (90° in
  // screen-coords with y-down means: angle 90° points downward).
  const step = 360 / Math.max(1, count);
  return Array.from({ length: count }, (_, i) => 90 + i * step);
}

/** Project a (rootCx, rootCy) → child center given angle (deg) measured
 *  CLOCKWISE from horizontal-right (because SVG y grows downward).
 *  - angle =   0° → right
 *  - angle =  90° → straight down
 *  - angle = 180° → left
 *  - angle = 270° → straight up
 */
function projectChildCenter(
  rootCx: number,
  rootCy: number,
  angleDeg: number,
  radius: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: rootCx + radius * Math.cos(rad),
    y: rootCy + radius * Math.sin(rad),
  };
}

// ─── Section label ──────────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: accentColor,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Title + subtitle ───────────────────────────────────────────────
const TitleBlock: React.FC<{
  title: string;
  subtitle: string;
  inkColor: string;
  mutedColor: string;
  palette: PaletteMode;
}> = ({ title, subtitle, inkColor, mutedColor, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 56,
          color: getBodyTextColor(palette, inkColor, 56),
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          padding: "0 60px",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_STACKS.mono,
            fontSize: 26,
            color: mutedColor,
            letterSpacing: "0.04em",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ─── Root node (rounded card, fades in with EDITORIAL_SPRING) ───────
const RootNodeCard: React.FC<{
  cx: number;
  cy: number;
  label: string;
  sub: string;
  inkColor: string;
  accentColor: string;
  paperColor: string;
  palette: PaletteMode;
}> = ({ cx, cy, label, sub, inkColor, accentColor, paperColor, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  const cardBg = palette === "dark" || palette === "warm-black" || palette === "true-black"
    ? "#10172A"
    : paperColor;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - ROOT_W / 2,
        top: cy - ROOT_H / 2,
        width: ROOT_W,
        minHeight: ROOT_H,
        background: cardBg,
        border: `3px solid ${accentColor}`,
        borderRadius: 18,
        padding: "18px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        boxShadow: `0 10px 30px ${accentColor}26`,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 34,
          color: getBodyTextColor(palette, inkColor, 34),
          lineHeight: 1.1,
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: 20,
            color: accentColor,
            opacity: 0.8,
            letterSpacing: "0.02em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// ─── Child node card (label reveal after edge completes) ────────────
const ChildNodeCard: React.FC<{
  cx: number;
  cy: number;
  label: string;
  sub: string;
  borderColor: string;
  inkColor: string;
  paperColor: string;
  palette: PaletteMode;
}> = ({ cx, cy, label, sub, borderColor, inkColor, paperColor, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [8, 0]);

  const cardBg = palette === "dark" || palette === "warm-black" || palette === "true-black"
    ? "#10172A"
    : paperColor;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - CHILD_W / 2,
        top: cy - CHILD_H / 2,
        width: CHILD_W,
        minHeight: CHILD_H,
        background: cardBg,
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        padding: "12px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        boxShadow: `0 6px 22px ${borderColor}22`,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: getBodyTextColor(palette, inkColor, 26),
          lineHeight: 1.1,
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: 18,
            color: borderColor,
            opacity: 0.85,
            letterSpacing: "0.02em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// ─── Geometry per child ─────────────────────────────────────────────
interface ChildLayoutEntry {
  child: ChildNode;
  /** Center of the child card. */
  cx: number;
  cy: number;
  /** Start point of the edge (where it meets the root card border). */
  edgeStartX: number;
  edgeStartY: number;
  /** End point of the edge (where it meets the child card border / tip dot). */
  edgeEndX: number;
  edgeEndY: number;
  /** L-path segments for tree-down only. Undefined for straight-line edges. */
  lPath?: { midX: number; midY: number };
  /** Border color for this child. */
  borderColor: string;
  /** Path length used by pathDraw (in svg units). */
  pathLength: number;
}

/** Trim the endpoints of a straight line so the visible edge starts/ends
 *  just outside the card borders (so it doesn't punch through them). */
function trimSegment(
  rootCx: number,
  rootCy: number,
  childCx: number,
  childCy: number,
  rootHalf: { w: number; h: number },
  childHalf: { w: number; h: number },
): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
} {
  const dx = childCx - rootCx;
  const dy = childCy - rootCy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  // Approximate exit point from a rounded rect as the intersection with
  // an inscribed-ellipse boundary — cheap-and-correct-enough for our
  // ~ax+by=const cards.
  const exitFromRect = (halfW: number, halfH: number): number => {
    // Distance from center to rect edge along (ux, uy) — use elliptical
    // approximation: r = 1 / sqrt((ux/halfW)^2 + (uy/halfH)^2)
    const inv =
      (ux * ux) / (halfW * halfW) + (uy * uy) / (halfH * halfH);
    return 1 / Math.sqrt(inv);
  };

  const rRoot = exitFromRect(rootHalf.w, rootHalf.h);
  const rChild = exitFromRect(childHalf.w, childHalf.h);

  // Pull endpoints inward by ~6px so we leave room for the tip dot.
  const tipPad = 8;
  const startX = rootCx + ux * rRoot;
  const startY = rootCy + uy * rRoot;
  const endX = childCx - ux * (rChild + tipPad);
  const endY = childCy - uy * (rChild + tipPad);

  const length = Math.sqrt(
    (endX - startX) * (endX - startX) + (endY - startY) * (endY - startY),
  );

  return { startX, startY, endX, endY, length };
}

function buildLayout(
  childrenInput: ChildNode[],
  layoutMode: "radial-fan" | "tree-down" | "pie",
  rootCx: number,
  rootCy: number,
  defaultAccent: string,
): { children: ChildLayoutEntry[] } {
  const n = childrenInput.length;
  const rootHalf = { w: ROOT_W / 2, h: ROOT_H / 2 };
  const childHalf = { w: CHILD_W / 2, h: CHILD_H / 2 };

  if (layoutMode === "tree-down") {
    // Stack children vertically below the root. Edge is an L-shape:
    // straight down from root, then horizontal to the child card.
    // We treat the L-path as one polyline; pathDraw uses its total length.
    const verticalGap = 80;
    const firstChildY = rootCy + ROOT_H / 2 + verticalGap;
    // Spread children horizontally if more than 1.
    const slotCount = Math.max(1, n);
    const totalWidth = Math.min(900, slotCount * (CHILD_W + 32));
    const startX =
      slotCount === 1
        ? rootCx
        : rootCx - totalWidth / 2 + CHILD_W / 2 + 16;
    const xStep = slotCount === 1 ? 0 : (totalWidth - CHILD_W - 32) / (slotCount - 1);

    const entries: ChildLayoutEntry[] = childrenInput.map((child, i) => {
      const childCx = startX + i * xStep;
      const childCy = firstChildY + CHILD_H / 2;

      // L-edge: down from root bottom to a busbar midY, then horizontal
      // to (childCx, midY), then short down stub to child top.
      const busbarY = rootCy + ROOT_H / 2 + 40;
      const edgeStartX = rootCx;
      const edgeStartY = rootCy + ROOT_H / 2; // exits the bottom of root
      const edgeEndX = childCx;
      const edgeEndY = childCy - CHILD_H / 2 - 6; // stops just above child top
      const midX = childCx;
      const midY = busbarY;

      // Three-segment polyline:
      //   (edgeStartX, edgeStartY) → (edgeStartX, midY)
      //   → (midX, midY) → (edgeEndX, edgeEndY)
      const seg1 = Math.abs(midY - edgeStartY);
      const seg2 = Math.abs(midX - edgeStartX);
      const seg3 = Math.abs(edgeEndY - midY);
      const length = seg1 + seg2 + seg3;

      return {
        child,
        cx: childCx,
        cy: childCy,
        edgeStartX,
        edgeStartY,
        edgeEndX,
        edgeEndY,
        lPath: { midX, midY },
        borderColor: child.color || defaultAccent,
        pathLength: length,
      };
    });

    return { children: entries };
  }

  // Radial-fan or pie: angles by index
  const angles =
    layoutMode === "pie"
      ? childrenInput.map((c, i) =>
          c.angle !== undefined ? c.angle : defaultPieAngles(n)[i],
        )
      : childrenInput.map((c, i) =>
          c.angle !== undefined ? c.angle : defaultFanAngles(n)[i],
        );

  const entries: ChildLayoutEntry[] = childrenInput.map((child, i) => {
    const center = projectChildCenter(rootCx, rootCy, angles[i], RADIAL_RADIUS);
    const trimmed = trimSegment(
      rootCx,
      rootCy,
      center.x,
      center.y,
      rootHalf,
      childHalf,
    );
    return {
      child,
      cx: center.x,
      cy: center.y,
      edgeStartX: trimmed.startX,
      edgeStartY: trimmed.startY,
      edgeEndX: trimmed.endX,
      edgeEndY: trimmed.endY,
      borderColor: child.color || defaultAccent,
      pathLength: trimmed.length,
    };
  });

  return { children: entries };
}

// ─── Edge + static tip marker ───────────────────────────────────────
const EdgeWithTip: React.FC<{
  entry: ChildLayoutEntry;
  startFrame: number;
  drawFrames: number;
  marker: "dot" | "chevron" | "none";
  ghosted?: boolean;
}> = ({ entry, startFrame, drawFrames, marker, ghosted }) => {
  const frame = useCurrentFrame();

  const { dashArray, dashOffset, opacity, progress } = pathDraw({
    frame,
    startFrame,
    durationFrames: drawFrames,
    pathLength: entry.pathLength,
    direction: "start-to-end",
    easing: "outCubic",
  });

  // SVG path d-string. For tree-down: 3-segment polyline. Otherwise: straight.
  const dStr = entry.lPath
    ? `M ${entry.edgeStartX} ${entry.edgeStartY} L ${entry.edgeStartX} ${entry.lPath.midY} L ${entry.lPath.midX} ${entry.lPath.midY} L ${entry.edgeEndX} ${entry.edgeEndY}`
    : `M ${entry.edgeStartX} ${entry.edgeStartY} L ${entry.edgeEndX} ${entry.edgeEndY}`;

  // Marker only appears once the edge is fully drawn (progress >= 1).
  // CRITICAL: no animated arrowhead — only a static dot or chevron.
  const showMarker = progress >= 1.0 && marker !== "none";

  // Chevron orientation: angle of the final segment.
  let chevronAngle = 0;
  if (marker === "chevron") {
    let segDx: number;
    let segDy: number;
    if (entry.lPath) {
      segDx = entry.edgeEndX - entry.lPath.midX;
      segDy = entry.edgeEndY - entry.lPath.midY;
    } else {
      segDx = entry.edgeEndX - entry.edgeStartX;
      segDy = entry.edgeEndY - entry.edgeStartY;
    }
    chevronAngle = (Math.atan2(segDy, segDx) * 180) / Math.PI;
  }

  return (
    <g style={{ opacity: ghosted ? 0.4 : 1 }}>
      <path
        d={dStr}
        fill="none"
        stroke={entry.borderColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        style={{ opacity }}
      />
      {showMarker && marker === "dot" && (
        <circle
          cx={entry.edgeEndX}
          cy={entry.edgeEndY}
          r={7}
          fill={entry.borderColor}
        />
      )}
      {showMarker && marker === "chevron" && (
        <polygon
          // A small static chevron — three points centered at the tip,
          // rotated to align with the final segment direction.
          points={`-12,-8 0,0 -12,8`}
          fill={entry.borderColor}
          transform={`translate(${entry.edgeEndX} ${entry.edgeEndY}) rotate(${chevronAngle})`}
        />
      )}
    </g>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const DecisionTree9x16: React.FC<DecisionTree9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  title,
  subtitle,
  rootNode,
  children,
  layout,
  edgeTipMarker,
  rootEnterSeconds,
  edgeDrawStartSeconds,
  edgeDrawFrames,
  edgeStaggerFrames,
  labelRevealAfterEdgeFrames,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const rootAccent = rootNode.color || resolvedAccent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // ─── Geometry ─────────────────────────────────────────────────
  // Root center: for radial-fan / tree-down, root sits at the top of
  // the SVG band so the children fan downward. For pie, root sits at
  // the vertical center.
  const rootCx = CANVAS_W / 2;
  const rootCy =
    layout === "pie"
      ? SVG_TOP + SVG_HEIGHT / 2
      : SVG_TOP + ROOT_H / 2 + 60;

  const { children: childLayout } = buildLayout(
    children,
    layout,
    rootCx,
    rootCy,
    resolvedAccent,
  );

  // ─── Timing ───────────────────────────────────────────────────
  const rootEnterFrame = Math.round(rootEnterSeconds * fps);
  const edgeBaseFrame = Math.round(edgeDrawStartSeconds * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
          topPx={BREADCRUMB_Y}
        />
      )}

      {/* Section label */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* Title + subtitle */}
      {title && (
        <TitleBlock
          title={title}
          subtitle={subtitle}
          inkColor={resolvedInk}
          mutedColor={resolvedMuted}
          palette={palette}
        />
      )}

      {/* SVG diagram layer — edges drawn under the cards */}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CANVAS_W,
          height: CANVAS_H,
          pointerEvents: "none",
        }}
      >
        {childLayout.map((entry, i) => {
          const startFrame = edgeBaseFrame + i * edgeStaggerFrames;
          return (
            <EdgeWithTip
              key={`edge-${i}`}
              entry={entry}
              startFrame={startFrame}
              drawFrames={edgeDrawFrames}
              marker={edgeTipMarker}
            />
          );
        })}
      </svg>

      {/* Root node card */}
      <Sequence from={rootEnterFrame} durationInFrames={9999} layout="none">
        <RootNodeCard
          cx={rootCx}
          cy={rootCy}
          label={rootNode.label}
          sub={rootNode.sub}
          inkColor={resolvedInk}
          accentColor={rootAccent}
          paperColor={resolvedPaper}
          palette={palette}
        />
      </Sequence>

      {/* Child node cards — each reveals labelRevealAfterEdgeFrames after its
          edge completes drawing. */}
      {childLayout.map((entry, i) => {
        const edgeStart = edgeBaseFrame + i * edgeStaggerFrames;
        const edgeDone = edgeStart + edgeDrawFrames;
        const labelEnter = edgeDone + labelRevealAfterEdgeFrames;
        return (
          <Sequence
            key={`child-${i}`}
            from={labelEnter}
            durationInFrames={9999}
            layout="none"
          >
            <ChildNodeCard
              cx={entry.cx}
              cy={entry.cy}
              label={entry.child.label}
              sub={entry.child.sub}
              borderColor={entry.borderColor}
              inkColor={resolvedInk}
              paperColor={resolvedPaper}
              palette={palette}
            />
          </Sequence>
        );
      })}

      {/* Word-by-word captions (bottom) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
