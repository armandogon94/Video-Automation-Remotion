/**
 * DecisionTree16x9 — horizontal (1920×1080) port of `DecisionTree9x16`.
 *
 * Source: Wave-5 Tella-derived template (synthesis T7 in
 * docs/research/wave-5/tella-motion-graphics-synthesis.md). Central parent
 * node with 3–5 child nodes fanning out, edges drawing last via
 * stroke-dashoffset, labels revealing AFTER their edge completes.
 *
 * CRITICAL Tella rule (ykBDqicGx0M.txt L254–258): "Remotion doesn't do an
 * amazing job at arrows. It kind of shows the pointy bits of the arrow too
 * quickly or in strange places." → This template NEVER animates arrowheads.
 * It places a small static DOT (or CHEVRON) at the tip of each edge only
 * once the edge is fully drawn.
 *
 * Re-laid for landscape (1920×1080). The wide canvas allows more horizontal
 * breathing room: root node centers on the left third; children fan into the
 * right two-thirds (radial-fan / tree-right mode). Header text sits at the
 * TOP of the canvas (not stacked vertically), keeping the middle-to-right
 * zone free for the diagram. The SVG diagram layer spans the full canvas so
 * the edges get genuine horizontal room.
 *
 * Layout differences from 9:16 source:
 *   - Canvas: 1920×1080 (not 1080×1920).
 *   - Root node shifted LEFT (CX ≈ 450) — children fan rightward.
 *   - For tree-down layout: children spread LEFT→RIGHT horizontally below
 *     the title bar, root centered on the top-left column.
 *   - Brand chrome: BrandBreadcrumb16x9 + BrandWatermark16x9 (not 9:16 variants).
 *   - Font defaults 16:9-calibrated (ADR-001 §5.1): larger on the wider canvas.
 *   - No EditorialCaption by default (chart-dense; set showCaptions true to opt in).
 *
 * Visual structure (1920×1080):
 *   1. Optional BrandBreadcrumb16x9 (top-left)
 *   2. Title + subtitle (top-center band, y ≈ 60–180)
 *   3. SVG diagram spanning the full canvas (behind cards)
 *   4. Root node card (left-center)
 *   5. Child node cards (right zone)
 *   6. BrandWatermark16x9 (bottom-right)
 *   7. Optional EditorialCaption strip
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  ALL_PALETTE_MODES,
} from "../brand";
import type { PaletteMode } from "../brand";
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

const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(120),
  opacity: z.number().min(0).max(1).default(0.9),
});

const rootNodeSchema_local = z
  .object({
    label: z.string().default("AI for this task?"),
    sub: z.string().default(""),
    color: z.string().default(""),
  })
  .default({ label: "AI for this task?", sub: "", color: "" });

const childNodeSchema_local = z.object({
  label: z.string().default(""),
  sub: z.string().default(""),
  color: z.string().default(""),
  /** Optional angle override (degrees from horizontal-right, clockwise). */
  angle: z.number().optional(),
});

export const decisionTree16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),

  /** Title shown above the diagram. */
  title: z.string().default("Decide when to use AI"),
  /** Optional subtitle under the title. */
  subtitle: z.string().default(""),

  /** The parent / central node. */
  rootNode: rootNodeSchema_local,

  /** Children — 3 to 5 typical. */
  children: z
    .array(childNodeSchema_local)
    .default([
      { label: "Delegate to AI", sub: "Routine tasks", color: "#7CE49A" },
      { label: "Collaborate", sub: "Hard decisions", color: "#5BC0E8" },
      { label: "Avoid AI", sub: "Personal stuff", color: "#E89B7A" },
    ]),

  /** Layout mode:
   *   - 'radial-fan': children fan in a half-circle to the RIGHT of the root
   *   - 'tree-down':  children stacked with L-shaped edges from root
   *   - 'pie':        children distributed evenly around the root */
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
  // mention the no-arrowhead rule. Optional so Root.tsx defaultProps can omit it.
  transitionVerb: z
    .string()
    .optional(),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),

  // 16:9-calibrated font defaults (ADR-001 §5.1).
  titleFontSize: z.number().min(20).max(120).default(56),
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type DecisionTree16x9Props = z.infer<typeof decisionTree16x9Schema>;
type ChildNode16x9 = z.infer<typeof childNodeSchema_local>;

// ─── Layout constants (1920×1080) ──────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Title band — top strip
const TITLE_TOP = 48;

// SVG diagram spans full canvas
const SVG_W = CANVAS_W;
const SVG_H = CANVAS_H;

// Root node is LEFT-CENTER on the landscape canvas
const ROOT_CX_RADIAL = 420;   // left-third
const ROOT_CY = 540;          // vertical center
const ROOT_CX_PIE = CANVAS_W / 2;  // true-center for pie
const ROOT_CX_TREE = 420;

// Node card sizes — wider on the 1920 canvas
const ROOT_W = 380;
const ROOT_H = 140;
const CHILD_W = 300;
const CHILD_H = 116;

// Radial radius from root center to child center
const RADIAL_RADIUS = 440;

// ─── Fan / pie angles ───────────────────────────────────────────────
// For radial-fan: children fan RIGHT (clockwise angles 330°..30° → 210°..150°,
// i.e. left-hemisphere is excluded). We use "rightward half circle":
// angles in [-70°, 70°] measured clockwise from horizontal-right (0°).
// - 3 children → -60°, 0°, 60°
// - 5 children → -70°, -35°, 0°, 35°, 70°
function defaultFanAngles16x9(count: number): number[] {
  if (count <= 1) return [0];
  if (count === 2) return [-45, 45];
  if (count === 3) return [-60, 0, 60];
  if (count === 4) return [-65, -22, 22, 65];
  const start = -70;
  const end = 70;
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function defaultPieAngles16x9(count: number): number[] {
  const step = 360 / Math.max(1, count);
  return Array.from({ length: count }, (_, i) => i * step);
}

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

// ─── Geometry helpers ───────────────────────────────────────────────
interface ChildLayoutEntry16x9 {
  child: ChildNode16x9;
  cx: number;
  cy: number;
  edgeStartX: number;
  edgeStartY: number;
  edgeEndX: number;
  edgeEndY: number;
  lPath?: { midX: number; midY: number };
  borderColor: string;
  pathLength: number;
}

function trimSegment16x9(
  rootCx: number,
  rootCy: number,
  childCx: number,
  childCy: number,
  rootHalf: { w: number; h: number },
  childHalf: { w: number; h: number },
): { startX: number; startY: number; endX: number; endY: number; length: number } {
  const dx = childCx - rootCx;
  const dy = childCy - rootCy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  const exitFromRect = (halfW: number, halfH: number): number => {
    const inv = (ux * ux) / (halfW * halfW) + (uy * uy) / (halfH * halfH);
    return 1 / Math.sqrt(inv);
  };

  const rRoot = exitFromRect(rootHalf.w, rootHalf.h);
  const rChild = exitFromRect(childHalf.w, childHalf.h);
  const tipPad = 8;

  const startX = rootCx + ux * rRoot;
  const startY = rootCy + uy * rRoot;
  const endX = childCx - ux * (rChild + tipPad);
  const endY = childCy - uy * (rChild + tipPad);
  const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

  return { startX, startY, endX, endY, length };
}

function buildLayout16x9(
  childrenInput: ChildNode16x9[],
  layoutMode: "radial-fan" | "tree-down" | "pie",
  rootCx: number,
  rootCy: number,
  defaultAccent: string,
): { children: ChildLayoutEntry16x9[] } {
  const n = childrenInput.length;
  const rootHalf = { w: ROOT_W / 2, h: ROOT_H / 2 };
  const childHalf = { w: CHILD_W / 2, h: CHILD_H / 2 };

  if (layoutMode === "tree-down") {
    // Tree-down on the wide canvas: children spread LEFT→RIGHT below the root,
    // connected by L-shaped busbar edges. Works naturally on 1920 px wide.
    const verticalGap = 100;
    const firstChildY = rootCy + ROOT_H / 2 + verticalGap + CHILD_H / 2;
    const slotCount = Math.max(1, n);
    const totalWidth = Math.min(1500, slotCount * (CHILD_W + 40));
    const startX =
      slotCount === 1
        ? rootCx
        : rootCx - totalWidth / 2 + CHILD_W / 2 + 20;
    const xStep = slotCount === 1 ? 0 : (totalWidth - CHILD_W - 40) / (slotCount - 1);

    const entries: ChildLayoutEntry16x9[] = childrenInput.map((child, i) => {
      const childCx = startX + i * xStep;
      const childCy = firstChildY;
      const busbarY = rootCy + ROOT_H / 2 + 50;

      const edgeStartX = rootCx;
      const edgeStartY = rootCy + ROOT_H / 2;
      const edgeEndX = childCx;
      const edgeEndY = childCy - CHILD_H / 2 - 6;
      const midX = childCx;
      const midY = busbarY;

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

  const angles =
    layoutMode === "pie"
      ? childrenInput.map((c, i) =>
          c.angle !== undefined ? c.angle : defaultPieAngles16x9(n)[i],
        )
      : childrenInput.map((c, i) =>
          c.angle !== undefined ? c.angle : defaultFanAngles16x9(n)[i],
        );

  const entries: ChildLayoutEntry16x9[] = childrenInput.map((child, i) => {
    const center = projectChildCenter(rootCx, rootCy, angles[i], RADIAL_RADIUS);
    const trimmed = trimSegment16x9(rootCx, rootCy, center.x, center.y, rootHalf, childHalf);
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
const EdgeWithTip16x9: React.FC<{
  entry: ChildLayoutEntry16x9;
  startFrame: number;
  drawFrames: number;
  marker: "dot" | "chevron" | "none";
}> = ({ entry, startFrame, drawFrames, marker }) => {
  const frame = useCurrentFrame();

  const { dashArray, dashOffset, opacity, progress } = pathDraw({
    frame,
    startFrame,
    durationFrames: drawFrames,
    pathLength: entry.pathLength,
    direction: "start-to-end",
    easing: "outCubic",
  });

  const dStr = entry.lPath
    ? `M ${entry.edgeStartX} ${entry.edgeStartY} L ${entry.edgeStartX} ${entry.lPath.midY} L ${entry.lPath.midX} ${entry.lPath.midY} L ${entry.edgeEndX} ${entry.edgeEndY}`
    : `M ${entry.edgeStartX} ${entry.edgeStartY} L ${entry.edgeEndX} ${entry.edgeEndY}`;

  const showMarker = progress >= 1.0 && marker !== "none";

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
    <g>
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
        <circle cx={entry.edgeEndX} cy={entry.edgeEndY} r={7} fill={entry.borderColor} />
      )}
      {showMarker && marker === "chevron" && (
        <polygon
          points="-12,-8 0,0 -12,8"
          fill={entry.borderColor}
          transform={`translate(${entry.edgeEndX} ${entry.edgeEndY}) rotate(${chevronAngle})`}
        />
      )}
    </g>
  );
};

// ─── Root node card ─────────────────────────────────────────────────
const RootNodeCard16x9: React.FC<{
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
  const translateX = interpolate(enter, [0, 1], [-12, 0]);

  const cardBg =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
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
        borderRadius: 20,
        padding: "20px 26px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        boxShadow: `0 12px 36px ${accentColor}26`,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: getBodyTextColor(palette, inkColor, 36),
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
            fontSize: 22,
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

// ─── Child node card ────────────────────────────────────────────────
const ChildNodeCard16x9: React.FC<{
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
  const translateX = interpolate(enter, [0, 1], [10, 0]);

  const cardBg =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
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
        borderRadius: 16,
        padding: "14px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        boxShadow: `0 6px 24px ${borderColor}22`,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: getBodyTextColor(palette, inkColor, 28),
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

// ─── Composition ────────────────────────────────────────────────────
export const DecisionTree16x9: React.FC<DecisionTree16x9Props> = ({
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
  watermark,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  titleFontSize,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
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

  // Root X depends on layout mode
  const rootCx =
    layout === "pie" ? ROOT_CX_PIE : layout === "tree-down" ? ROOT_CX_TREE : ROOT_CX_RADIAL;
  const rootCy = ROOT_CY;

  const { children: childLayout } = buildLayout16x9(
    children,
    layout,
    rootCx,
    rootCy,
    resolvedAccent,
  );

  const rootEnterFrame = Math.round(rootEnterSeconds * fps);
  const edgeBaseFrame = Math.round(edgeDrawStartSeconds * fps);

  // Header fade-in
  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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

      {/* 16:9 breadcrumb — top-left */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Title + section label — top-center band */}
      <div
        style={{
          position: "absolute",
          top: TITLE_TOP,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
        }}
      >
        {sectionLabel && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 26,
              color: resolvedAccent,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {sectionLabel}
          </div>
        )}
        {title && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: titleFontSize,
              color: getBodyTextColor(palette, resolvedInk, titleFontSize),
              lineHeight: 1.06,
              letterSpacing: "-0.015em",
              padding: "0 160px",
            }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT_STACKS.mono,
              fontSize: 28,
              color: resolvedMuted,
              letterSpacing: "0.03em",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* SVG diagram layer — edges drawn under the cards */}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: SVG_W,
          height: SVG_H,
          pointerEvents: "none",
        }}
      >
        {childLayout.map((entry, i) => {
          const startFrame = edgeBaseFrame + i * edgeStaggerFrames;
          return (
            <EdgeWithTip16x9
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
        <RootNodeCard16x9
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

      {/* Child node cards — each reveals labelRevealAfterEdgeFrames after its edge completes. */}
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
            <ChildNodeCard16x9
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

      {/* Word-by-word captions — opt-in (default false for chart-dense comps) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 120,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* 16:9 watermark — bottom-right */}
      {watermark.enabled && (
        <BrandWatermark16x9 style={watermark} paddingPx={64} />
      )}
    </AbsoluteFill>
  );
};

export default DecisionTree16x9;
