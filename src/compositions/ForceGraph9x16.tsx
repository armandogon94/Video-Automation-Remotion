/**
 * ForceGraph9x16 — vertical (1080×1920) node-edge knowledge graph.
 *
 * SSR constraint (per docs/research/wave-?/R3-graph-libs.md):
 *   `react-force-graph`, `cytoscape.js`, and `vis-network` all touch `window` at
 *   module-evaluation time and BREAK Remotion's headless renderer. We instead use
 *   `d3-force` (pure JS), pre-compute the layout to convergence at component-mount
 *   inside a `useMemo`, snapshot the final {x,y} positions, and animate purely via
 *   Remotion's `interpolate`/`spring`. Deterministic across renders because we
 *   seed each node's initial position from its id-hash instead of `Math.random`.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional title (Inter 700 ~56px, ink, y ≈ 260)
 *   - GRAPH ZONE: SVG canvas 1080×1040 at y ≈ 460..1500
 *       · Nodes: circles radius 28-44px (scaled by node.weight)
 *         · fill = paper (or group palette color, if `group` provided)
 *         · stroke = accent, stroke-width 2.5
 *         · optional label (Inter 500 22px, ink) offset below the node
 *       · Edges: muted lines, stroke-width 2, alpha 0.4
 *       · Focus node: 1.4× radius + accent fill + pulsing glow ring
 *   - Optional EditorialCaption strip at bottom (default false)
 *
 * Motion grammar:
 *   - Whole graph fades in over ~0.5s
 *   - Edges draw on (stroke-dashoffset 0 → length) over 0.6s after node settle,
 *     staggered by edge index (~0.03s per edge)
 *   - Focus node's pulsing glow ring starts once everything is in place
 *   - Optional very-slow continuous graph rotation (off by default)
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
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Schema ──────────────────────────────────────────────────────────
// wordTimingSchema + breadcrumbSchema are not exported from ./schemas;
// redeclared locally to keep this composition self-contained (same pattern
// as AnimatedCounter9x16).
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
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

export const forceGraph9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  nodes: z.array(graphNodeSchema).default([]),
  edges: z.array(graphEdgeSchema).default([]),
  /** ID of the focus node (gets accent fill + pulsing glow). */
  focusNodeId: z.string().optional(),
  showNodeLabels: z.boolean().default(true),
  /** Optional very-slow continuous rotation of the whole graph. Default off. */
  rotateSlowly: z.boolean().default(false),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});

export type ForceGraph9x16Props = z.infer<typeof forceGraph9x16Schema>;

// ─── Layout constants ────────────────────────────────────────────────
const GRAPH_TOP = 460;
const GRAPH_LEFT = 0;
const GRAPH_W = 1080;
const GRAPH_H = 1040;

// Inner viewBox (d3-force runs in viewBox coordinates) — leave a margin so
// nodes' full radii + labels never spill into the breadcrumb / caption zones.
const GRAPH_PADDING = 100;

const BASE_NODE_RADIUS = 32; // unscaled radius for weight=1
const FOCUS_NODE_SCALE = 1.35;

// Small palette of fill colors used when nodes have a `group` field.
// Kept short on purpose — visual clutter beyond ~5 categories drowns the
// signal. Order is deterministic, so the same group string always maps to
// the same color regardless of node order.
const GROUP_PALETTE_CREAM = [
  "#F2D3A7", // warm sand
  "#C9D8B6", // sage
  "#D8C3D8", // dusty mauve
  "#F4B89A", // peach
  "#A8C5D8", // pale steel blue
];
// On the dark paper (#0A0F1A) the previous fills (deep amber-brown / deep
// sage etc.) were too low-contrast to read as "glowing" filled discs — the
// adamrosler node-graph signature uses SATURATED, luminous role colors
// (gold source / teal destination / coral / blue / green). Bright fills that
// sit clearly above the near-black paper.
const GROUP_PALETTE_DARK = [
  "#D4A04A", // gold (matches dark-palette accent / "source" role)
  "#3FB68B", // teal-green (destination / active)
  "#C06CC9", // mauve-magenta
  "#E8895A", // coral / warning
  "#4F9BD8", // steel blue (input)
];

// ─── Helpers ────────────────────────────────────────────────────────

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

/**
 * Deterministic hash → [0, 1). Used to seed each node's initial position so
 * d3-force converges to the same layout every render (no `Math.random()`).
 */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Map signed 32-bit int to [0, 1).
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Pre-compute the graph layout. Runs ~300 d3-force ticks against the
 * provided nodes + edges, then snapshots the final {x, y} positions.
 *
 * Determinism: each node's initial (x, y) is seeded from `hash01(id)`
 * rather than the d3 default of random, so the layout is identical across
 * SSR and client renders.
 */
function computeLayout(
  nodesIn: ReadonlyArray<{ id: string; label?: string; group?: string; weight: number }>,
  edgesIn: ReadonlyArray<{ source: string; target: string }>,
  width: number,
  height: number,
): { nodes: ComputedNode[]; edges: ComputedEdge[] } {
  if (nodesIn.length === 0) return { nodes: [], edges: [] };

  // Seeded initial positions — within a ~40% inner box around center so the
  // sim doesn't waste iterations dragging nodes from the corners.
  const cx = width / 2;
  const cy = height / 2;
  const seedRadius = Math.min(width, height) * 0.25;

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

  // d3-force mutates link objects to replace source/target string-ids with
  // node refs after init, so we feed it a fresh copy of edge data.
  const links: SimulationLinkDatum<ComputedNode>[] = edgesIn.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const sim = forceSimulation<ComputedNode>(nodes)
    .force(
      "link",
      forceLink<ComputedNode, SimulationLinkDatum<ComputedNode>>(links)
        .id((d) => d.id)
        .distance(140)
        .strength(0.7),
    )
    .force("charge", forceManyBody<ComputedNode>().strength(-260))
    .force("center", forceCenter<ComputedNode>(cx, cy))
    .force(
      "collide",
      forceCollide<ComputedNode>().radius((d) => BASE_NODE_RADIUS * d.weight + 12),
    )
    .stop();

  // Run to convergence (300 ticks is plenty for graphs of < ~50 nodes).
  for (let i = 0; i < 300; i++) sim.tick();

  // Clamp positions inside the padded viewBox so no node clips the edge.
  for (const n of nodes) {
    const r = BASE_NODE_RADIUS * n.weight;
    n.x = Math.min(width - GRAPH_PADDING - r, Math.max(GRAPH_PADDING + r, n.x ?? cx));
    n.y = Math.min(height - GRAPH_PADDING - r, Math.max(GRAPH_PADDING + r, n.y ?? cy));
  }

  // Resolve link source/target refs (post-init they're either ComputedNode
  // objects or — for unknown ids — left as strings; filter the strings out).
  const nodeById = new Map<string, ComputedNode>(nodes.map((n) => [n.id, n]));
  const edges: ComputedEdge[] = [];
  for (const l of links) {
    const s = typeof l.source === "string" ? nodeById.get(l.source) : (l.source as ComputedNode);
    const t = typeof l.target === "string" ? nodeById.get(l.target) : (l.target as ComputedNode);
    if (s && t) edges.push({ source: s, target: t });
  }

  return { nodes, edges };
}

/**
 * Stable color lookup for a `group` string. Each unique group string in
 * insertion order picks the next palette slot; identical strings always map
 * to the same color.
 */
function buildGroupColorMap(
  nodes: ReadonlyArray<{ group?: string }>,
  paletteMode: "cream" | "dark",
): Map<string, string> {
  const palette = paletteMode === "dark" ? GROUP_PALETTE_DARK : GROUP_PALETTE_CREAM;
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

// ─── Composition ────────────────────────────────────────────────────
export const ForceGraph9x16: React.FC<ForceGraph9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  nodes,
  edges,
  focusNodeId,
  showNodeLabels,
  rotateSlowly,
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Pre-compute layout once per node/edge config. SSR-safe — runs deterministically
  // from seeded initial positions (no `window`, no `Math.random`).
  const layout = useMemo(
    () => computeLayout(nodes, edges, GRAPH_W, GRAPH_H),
    [nodes, edges],
  );

  // Group-color lookup (stable insertion order).
  const groupColors = useMemo(
    () => buildGroupColorMap(nodes, palette),
    [nodes, palette],
  );

  // ── Motion timeline ────────────────────────────────────────────
  // 0.0s             : nothing rendered
  // 0.0s → 0.5s      : whole graph fades in
  // 0.5s → 1.1s      : edges draw on (stroke-dashoffset → 0), stagger 0.03s/edge
  // 1.1s+            : focus node pulses indefinitely
  const FADE_IN_SEC = 0.5;
  const EDGE_DRAW_SEC = 0.6;
  const EDGE_STAGGER_SEC = 0.03;
  const PULSE_PERIOD_SEC = 1.6;

  const nowSec = frame / fps;
  const graphOpacity = interpolate(nowSec, [0, FADE_IN_SEC], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow rotation (off by default). One full revolution every 60s.
  const rotationDeg = rotateSlowly ? (nowSec / 60) * 360 : 0;

  // Pulse 0..1 envelope (sin² so it eases in and out smoothly).
  const pulsePhase = (nowSec / PULSE_PERIOD_SEC) % 1;
  const pulse = Math.sin(pulsePhase * Math.PI) ** 2;

  // ── Render ────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional title (centered, ~y=260) */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 1.08,
            color: resolvedInk,
            letterSpacing: "-0.015em",
            opacity: graphOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* GRAPH ZONE — SVG 1080×1040 */}
      <svg
        style={{
          position: "absolute",
          top: GRAPH_TOP,
          left: GRAPH_LEFT,
          width: GRAPH_W,
          height: GRAPH_H,
          opacity: graphOpacity,
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      >
        <defs>
          <filter id="fg-pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rotation group — `transform-origin` style isn't honored by some
            headless SVG renderers, so we rotate via attribute around the center. */}
        <g transform={`rotate(${rotationDeg} ${GRAPH_W / 2} ${GRAPH_H / 2})`}>
          {/* ── Edges (drawn on after node settle) ─────────────── */}
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
              // `stroke-dashoffset` from full length → 0 draws the line on.
              const dashOffset = length * (1 - t);
              return (
                <line
                  key={`edge-${idx}`}
                  x1={e.source.x}
                  y1={e.source.y}
                  x2={e.target.x}
                  y2={e.target.y}
                  // Edges must read clearly as connections so the graph looks
                  // like a NETWORK, not a loose bubble cluster. `muted` at 0.4
                  // alpha on the near-black dark paper blended to ~background and
                  // vanished after the 1080→~400px downscale. Use the saturated
                  // accent (the adamrosler AS-graph uses prominent role-colored
                  // edges) with a thicker stroke that survives the downscale.
                  stroke={resolvedAccent}
                  strokeOpacity={0.55}
                  strokeWidth={4}
                  strokeDasharray={length}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* ── Focus-node pulsing glow ring (rendered UNDER nodes) ── */}
          {focusNodeId &&
            (() => {
              const fn = layout.nodes.find((n) => n.id === focusNodeId);
              if (!fn) return null;
              const fnRadius = BASE_NODE_RADIUS * fn.weight * FOCUS_NODE_SCALE;
              // Ring grows from fnRadius+8 → fnRadius+28 and fades 0.55 → 0 over each cycle.
              const ringRadius = fnRadius + 8 + pulse * 20;
              const ringOpacity = 0.55 * (1 - pulse);
              // Hold the pulse until after the fade-in completes.
              const pulseGate = interpolate(nowSec, [FADE_IN_SEC + 0.6, FADE_IN_SEC + 0.9], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <circle
                  cx={fn.x}
                  cy={fn.y}
                  r={ringRadius}
                  fill="none"
                  stroke={resolvedAccent}
                  strokeWidth={3}
                  opacity={ringOpacity * pulseGate}
                  style={{ filter: "url(#fg-pulse-glow)" }}
                />
              );
            })()}

          {/* ── Nodes ──────────────────────────────────────────── */}
          <g>
            {layout.nodes.map((n) => {
              const isFocus = n.id === focusNodeId;
              const radius = BASE_NODE_RADIUS * n.weight * (isFocus ? FOCUS_NODE_SCALE : 1);
              // Fill: focus → accent; group → group palette; else → paper.
              const fillColor = isFocus
                ? resolvedAccent
                : n.group
                  ? (groupColors.get(n.group) ?? resolvedPaper)
                  : resolvedPaper;
              // On dark, filled nodes (focus or grouped) get a soft glow so they
              // read as luminous discs — the adamrosler node-graph signature.
              // Hollow paper nodes stay crisp (no glow).
              const isFilled = isFocus || Boolean(n.group);
              const glow = palette === "dark" && isFilled;
              return (
                <circle
                  key={`node-${n.id}`}
                  cx={n.x}
                  cy={n.y}
                  r={radius}
                  fill={fillColor}
                  stroke={resolvedAccent}
                  strokeWidth={2.5}
                  style={glow ? { filter: "url(#fg-pulse-glow)" } : undefined}
                />
              );
            })}
          </g>

          {/* ── Labels (rendered on top, offset below node) ─────── */}
          {showNodeLabels && (
            <g>
              {layout.nodes.map((n) => {
                if (!n.label) return null;
                const isFocus = n.id === focusNodeId;
                const radius =
                  BASE_NODE_RADIUS * n.weight * (isFocus ? FOCUS_NODE_SCALE : 1);
                return (
                  <text
                    key={`label-${n.id}`}
                    x={n.x}
                    y={n.y + radius + 22}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontWeight={500}
                    fontSize={22}
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

      {/* Word-by-word captions (bottom strip) — optional */}
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
