/**
 * ForceGraph16x9 — horizontal (1920×1080) node-edge knowledge graph.
 *
 * 16:9 sibling of ForceGraph9x16. The graph is spread across the WIDE
 * canvas: the SVG zone spans the full 1920px width and 800px height,
 * centred vertically between a top breadcrumb band and a bottom caption
 * strip. A two-column information layout replaces the stacked 9:16 chrome:
 *   - LEFT gutter (0..320px): optional title block (large sans 96px) and
 *     optional section-eyebrow chip, both left-aligned.
 *   - GRAPH ZONE: SVG 1920×800 at y ≈ 140..940, x 0..1920.
 *   - Optional EditorialCaption in the bottom 80px strip.
 *
 * SSR / d3-force constraint: same as 9x16 — we pre-compute layout to
 * convergence with seeded initial positions; no Math.random(), no window.
 *
 * Motion grammar (preserved from 9x16):
 *   - Whole graph fades in over ~0.5s.
 *   - Edges draw on (stroke-dashoffset → 0) staggered by edge index (~0.03s/edge).
 *   - Focus node pulsing glow ring starts once everything is in place.
 *   - Optional very-slow continuous rotation (off by default).
 *
 * Layout note: the wide canvas lets the force simulation spread nodes across
 * ~1700px of horizontal space vs ~880px in 9x16, so clusters become more
 * spatially separated and edges are longer — this reads better on landscape.
 *
 * If the 9x16 source has a *Dark variant, this 16:9 composition uses a
 * `palette` prop (default "dark") so one file covers both surface modes.
 */
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import type { WatermarkStyle } from "./schemas";

// ─── Local schemas (self-contained — ADR-001 §2.4) ─────────────────────
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
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  group: z.string().optional(),
  weight: z.number().min(0.3).max(3).default(1),
});

const graphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
});

export const forceGraph16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  title: z.string().optional(),
  nodes: z.array(graphNodeSchema).default([]),
  edges: z.array(graphEdgeSchema).default([]),
  /** ID of the focus node (gets accent fill + pulsing glow). */
  focusNodeId: z.string().optional(),
  showNodeLabels: z.boolean().default(true),
  /** Optional very-slow continuous rotation of the whole graph. Default off. */
  rotateSlowly: z.boolean().default(false),
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.nullable().default(null),
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  /** ADR-001 §5.1: 16:9 default "dark" (single comp covers both surfaces). */
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  /** ADR-001 §5.1: 16:9 caption font size default 36px (vs 38px for 9:16). */
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
});

export type ForceGraph16x9Props = z.infer<typeof forceGraph16x9Schema>;

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Graph SVG zone: full width, leaves top 140px for breadcrumb and bottom
// 140px for captions / watermark breathing room.
const GRAPH_TOP = 140;
const GRAPH_H = 800;
const GRAPH_W = CANVAS_W;

// Title block occupies a left-aligned position inside the graph zone
// (rendered via HTML, not SVG, so it respects normal DOM stacking).
const TITLE_LEFT = 60;
const TITLE_TOP = 160;
const TITLE_MAX_W = 360;

// d3-force runs in the full GRAPH_W × GRAPH_H viewBox — so nodes can spread
// horizontally.  Padding prevents nodes from kissing the edges.
const GRAPH_PADDING = 120;

const BASE_NODE_RADIUS = 30; // 16:9: slightly smaller radius — more nodes fit
const FOCUS_NODE_SCALE = 1.35;

// Palette of fill colors by group (same two sets as 9x16).
const GROUP_PALETTE_CREAM = [
  "#F2D3A7",
  "#C9D8B6",
  "#D8C3D8",
  "#F4B89A",
  "#A8C5D8",
];
const GROUP_PALETTE_DARK = [
  "#3A2E1F",
  "#1F3A2F",
  "#3A1F35",
  "#3A2820",
  "#1F2E3A",
];

// ─── Types ──────────────────────────────────────────────────────────────
interface ComputedNode extends SimulationNodeDatum {
  id: string;
  label?: string;
  group?: string;
  weight: number;
  x: number;
  y: number;
}

interface ComputedEdge {
  source: ComputedNode;
  target: ComputedNode;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Deterministic hash → [0, 1). Seeded initial positions (no Math.random). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Pre-compute d3-force layout to convergence (300 ticks). Deterministic. */
function computeLayout(
  nodesIn: ReadonlyArray<{
    id: string;
    label?: string;
    group?: string;
    weight: number;
  }>,
  edgesIn: ReadonlyArray<{ source: string; target: string }>,
  width: number,
  height: number,
): { nodes: ComputedNode[]; edges: ComputedEdge[] } {
  if (nodesIn.length === 0) return { nodes: [], edges: [] };

  const cx = width / 2;
  const cy = height / 2;
  const seedRadius = Math.min(width, height) * 0.3;

  const nodes: ComputedNode[] = nodesIn.map((n) => {
    const angle = hash01(n.id) * Math.PI * 2;
    const r = hash01(n.id + "_r") * seedRadius;
    return {
      id: n.id,
      label: n.label,
      group: n.group,
      weight: n.weight,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });

  const links: SimulationLinkDatum<ComputedNode>[] = edgesIn.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const sim = forceSimulation<ComputedNode>(nodes)
    .force(
      "link",
      forceLink<ComputedNode, SimulationLinkDatum<ComputedNode>>(links)
        .id((d) => d.id)
        // Wider canvas → longer link distance so the graph spreads horizontally.
        .distance(200)
        .strength(0.6),
    )
    .force("charge", forceManyBody<ComputedNode>().strength(-320))
    .force("center", forceCenter<ComputedNode>(cx, cy))
    .force(
      "collide",
      forceCollide<ComputedNode>().radius(
        (d) => BASE_NODE_RADIUS * d.weight + 14,
      ),
    )
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();

  for (const n of nodes) {
    const r = BASE_NODE_RADIUS * n.weight;
    n.x = Math.min(
      width - GRAPH_PADDING - r,
      Math.max(GRAPH_PADDING + r, n.x ?? cx),
    );
    n.y = Math.min(
      height - GRAPH_PADDING - r,
      Math.max(GRAPH_PADDING + r, n.y ?? cy),
    );
  }

  const nodeById = new Map<string, ComputedNode>(nodes.map((n) => [n.id, n]));
  const edges: ComputedEdge[] = [];
  for (const l of links) {
    const s =
      typeof l.source === "string"
        ? nodeById.get(l.source)
        : (l.source as ComputedNode);
    const t =
      typeof l.target === "string"
        ? nodeById.get(l.target)
        : (l.target as ComputedNode);
    if (s && t) edges.push({ source: s, target: t });
  }

  return { nodes, edges };
}

/** Stable group → color lookup (insertion order, same as 9x16). */
function buildGroupColorMap(
  nodes: ReadonlyArray<{ group?: string }>,
  paletteMode: "cream" | "dark",
): Map<string, string> {
  const palette =
    paletteMode === "dark" ? GROUP_PALETTE_DARK : GROUP_PALETTE_CREAM;
  const map = new Map<string, string>();
  let next = 0;
  for (const n of nodes) {
    if (n.group && !map.has(n.group)) {
      map.set(n.group, palette[next % palette.length]);
      next += 1;
    }
  }
  return map;
}

// ─── Composition ────────────────────────────────────────────────────────
export const ForceGraph16x9: React.FC<ForceGraph16x9Props> = ({
  audioUrl,
  wordTimings,
  title,
  nodes,
  edges,
  focusNodeId,
  showNodeLabels,
  rotateSlowly,
  breadcrumb,
  watermark,
  watermarkHandle,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
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

  // Determine the surface mode used by tool-accent lookup.
  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Layout — pre-computed once per nodes/edges config.
  const layout = useMemo(
    () => computeLayout(nodes, edges, GRAPH_W, GRAPH_H),
    [nodes, edges],
  );

  const groupColors = useMemo(
    () => buildGroupColorMap(nodes, surfaceMode),
    [nodes, surfaceMode],
  );

  // ── Motion timeline (same beats as 9x16) ───────────────────────────
  const FADE_IN_SEC = 0.5;
  const EDGE_DRAW_SEC = 0.6;
  const EDGE_STAGGER_SEC = 0.03;
  const PULSE_PERIOD_SEC = 1.6;

  const nowSec = frame / fps;

  const graphOpacity = interpolate(nowSec, [0, FADE_IN_SEC], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotationDeg = rotateSlowly ? (nowSec / 60) * 360 : 0;

  const pulsePhase = (nowSec / PULSE_PERIOD_SEC) % 1;
  const pulse = Math.sin(pulsePhase * Math.PI) ** 2;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Brand breadcrumb (16:9 variant) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional title block — left-aligned, wide-canvas position */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: TITLE_TOP,
            left: TITLE_LEFT,
            maxWidth: TITLE_MAX_W,
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            // ADR-001 §5.1: hero headline 96px for 16:9 (vs 56px in 9x16).
            fontSize: 96,
            lineHeight: 1.0,
            color: resolvedInk,
            letterSpacing: "-0.02em",
            opacity: graphOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* GRAPH ZONE — SVG spanning full 1920×800, top-offset 140px */}
      <svg
        style={{
          position: "absolute",
          top: GRAPH_TOP,
          left: 0,
          width: GRAPH_W,
          height: GRAPH_H,
          opacity: graphOpacity,
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      >
        <defs>
          <filter
            id="fg16-pulse-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`rotate(${rotationDeg} ${GRAPH_W / 2} ${GRAPH_H / 2})`}
        >
          {/* ── Edges ─────────────────────────────────────────── */}
          <g>
            {layout.edges.map((e, idx) => {
              const length = Math.hypot(
                e.target.x - e.source.x,
                e.target.y - e.source.y,
              );
              const startAt = FADE_IN_SEC + idx * EDGE_STAGGER_SEC;
              const t = interpolate(
                nowSec,
                [startAt, startAt + EDGE_DRAW_SEC],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const dashOffset = length * (1 - t);
              return (
                <line
                  key={`edge-${idx}`}
                  x1={e.source.x}
                  y1={e.source.y}
                  x2={e.target.x}
                  y2={e.target.y}
                  stroke={resolvedMuted}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                  strokeDasharray={length}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* ── Focus-node pulsing glow ring (under nodes) ─── */}
          {focusNodeId &&
            (() => {
              const fn = layout.nodes.find((n) => n.id === focusNodeId);
              if (!fn) return null;
              const fnRadius =
                BASE_NODE_RADIUS * fn.weight * FOCUS_NODE_SCALE;
              const ringRadius = fnRadius + 8 + pulse * 20;
              const ringOpacity = 0.55 * (1 - pulse);
              const pulseGate = interpolate(
                nowSec,
                [FADE_IN_SEC + 0.6, FADE_IN_SEC + 0.9],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              return (
                <circle
                  cx={fn.x}
                  cy={fn.y}
                  r={ringRadius}
                  fill="none"
                  stroke={resolvedAccent}
                  strokeWidth={3}
                  opacity={ringOpacity * pulseGate}
                  style={{ filter: "url(#fg16-pulse-glow)" }}
                />
              );
            })()}

          {/* ── Nodes ─────────────────────────────────────────── */}
          <g>
            {layout.nodes.map((n) => {
              const isFocus = n.id === focusNodeId;
              const radius =
                BASE_NODE_RADIUS *
                n.weight *
                (isFocus ? FOCUS_NODE_SCALE : 1);
              const fillColor = isFocus
                ? resolvedAccent
                : n.group
                  ? (groupColors.get(n.group) ?? resolvedPaper)
                  : resolvedPaper;
              return (
                <circle
                  key={`node-${n.id}`}
                  cx={n.x}
                  cy={n.y}
                  r={radius}
                  fill={fillColor}
                  stroke={resolvedAccent}
                  strokeWidth={2.5}
                />
              );
            })}
          </g>

          {/* ── Labels (below each node) ───────────────────────── */}
          {showNodeLabels && (
            <g>
              {layout.nodes.map((n) => {
                if (!n.label) return null;
                const isFocus = n.id === focusNodeId;
                const radius =
                  BASE_NODE_RADIUS *
                  n.weight *
                  (isFocus ? FOCUS_NODE_SCALE : 1);
                return (
                  <text
                    key={`label-${n.id}`}
                    x={n.x}
                    y={n.y + radius + 22}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontWeight={500}
                    // ADR-001 §5.1: body text 30–36px for 16:9 (vs 22px in 9x16).
                    fontSize={28}
                    fill={resolvedInk}
                  >
                    {n.label}
                  </text>
                );
              })}
            </g>
          )}
        </g>
      </svg>

      {/* Bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark as WatermarkStyle}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Caption strip — default OFF (on-graph labels are the text layer) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            // ADR-001 §2.5: 16:9 B-roll captions 60px from bottom.
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Silence unused CANVAS_H reference. */}
      {CANVAS_H > 0 ? null : null}
    </AbsoluteFill>
  );
};

export default ForceGraph16x9;
