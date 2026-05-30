/**
 * NeuralNetwork9x16 — vertical (1080×1920) animated neural-network diagram.
 *
 * Visual language: nodes (circles) arranged into vertical columns (layers),
 * fully-connected with low-opacity edges, and small accent pulses traveling
 * left-to-right in continuous "activation waves." Same house grammar as the
 * other 9x16 templates — cream/dark palette, optional breadcrumb, optional
 * EditorialCaption strip at the bottom.
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~80px)
 *   - Optional title (Inter 700 ~58px, y ≈ 260)
 *   - Optional subtitle (Inter 500 ~32px, y ≈ 350)
 *   - NETWORK ZONE: SVG canvas 1080×920 at y ≈ 460..1380
 *       · 2–6 vertical layer columns
 *       · Nodes per layer configurable (default [4, 6, 6, 4])
 *       · Edges fully-connected, muted at 0.25 alpha
 *       · Pulses (radius 5 accent circles) traverse one edge per
 *         `pulsePropagateSeconds`, layer-by-layer, in waves
 *       · Optional layer labels (uppercase, tracking-spaced) at top
 *   - Optional EditorialCaption strip at bottom
 *
 * Motion grammar:
 *   - Whole network fades in over ~0.4s
 *   - First wave fires at `firstWaveDelaySeconds` (default 0.5s)
 *   - New wave every `waveIntervalSeconds` (default 0.9s)
 *   - Within a wave: layer-0 nodes briefly light up; pulses propagate to
 *     layer 1, then layer 2, etc., taking `pulsePropagateSeconds` per hop
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
import type { NeuralNetwork9x16Props } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Layout constants ──────────────────────────────────────────────
const NETWORK_TOP = 460;
const NETWORK_LEFT = 0;
const NETWORK_W = 1080;
const NETWORK_H = 920;

// Inside the SVG viewBox, leave room for labels on top and breathing room sides.
const SVG_PADDING_X = 120; // columns span x ∈ [120, 960] → 840px wide
const SVG_LABEL_BAND = 70; // top band reserved for layer labels
const SVG_NODE_BAND_BOTTOM = NETWORK_H - 30; // node band y ∈ [SVG_LABEL_BAND, SVG_NODE_BAND_BOTTOM]

const NODE_RADIUS = 22;
const PULSE_RADIUS = 5;

// ─── Helpers ──────────────────────────────────────────────────────

interface NodePos {
  x: number;
  y: number;
}

/**
 * Compute the absolute (x, y) of every node in the SVG viewBox.
 * Returns nodes[layerIdx][nodeIdx] = { x, y }.
 */
function layoutNodes(layers: number[]): NodePos[][] {
  const numLayers = layers.length;
  const innerW = NETWORK_W - SVG_PADDING_X * 2;
  // For 1 layer, place at center; otherwise spread evenly across innerW.
  const colXs: number[] = [];
  for (let i = 0; i < numLayers; i++) {
    const t = numLayers === 1 ? 0.5 : i / (numLayers - 1);
    colXs.push(SVG_PADDING_X + t * innerW);
  }

  const nodeBandTop = SVG_LABEL_BAND;
  const nodeBandH = SVG_NODE_BAND_BOTTOM - nodeBandTop;

  return layers.map((count, layerIdx) => {
    const positions: NodePos[] = [];
    if (count === 1) {
      positions.push({ x: colXs[layerIdx], y: nodeBandTop + nodeBandH / 2 });
      return positions;
    }
    // Spread nodes evenly with edge padding so circles don't kiss the band.
    const edgePad = NODE_RADIUS + 12;
    const usableH = nodeBandH - edgePad * 2;
    for (let n = 0; n < count; n++) {
      const t = n / (count - 1);
      positions.push({
        x: colXs[layerIdx],
        y: nodeBandTop + edgePad + t * usableH,
      });
    }
    return positions;
  });
}

/**
 * Deterministic per-wave random in [0, 1). Used to pick which target node
 * a pulse routes to in the next layer (so the network feels alive rather
 * than rendering pulses on every single one of the N×M edges).
 */
function seededRand(seed: number): number {
  // Mulberry32-ish — cheap, deterministic across renders.
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ─── Composition ──────────────────────────────────────────────────
export const NeuralNetwork9x16: React.FC<NeuralNetwork9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  layers,
  layerLabels,
  firstWaveDelaySeconds,
  waveIntervalSeconds,
  pulsePropagateSeconds,
  showLayerLabels,
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
  const { fps, durationInFrames } = useVideoConfig();

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

  // Per-frame guards against undersized configs.
  const safeLayers = layers.length >= 2 ? layers : [4, 6, 6, 4];

  // Layout computed once per layers config.
  const nodes = useMemo<NodePos[][]>(() => layoutNodes(safeLayers), [safeLayers]);

  // Whole-network fade-in over ~0.4s.
  const networkOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Wave timing ────────────────────────────────────────────────
  // Each wave runs for ~ pulsePropagateSeconds * (numLayers - 1) seconds.
  const numLayers = safeLayers.length;
  const waveDurationSec = Math.max(0.001, pulsePropagateSeconds * (numLayers - 1));
  const nowSec = frame / fps;
  const totalDurationSec = durationInFrames / fps;

  // Compute which waves are currently airborne. A wave is "alive" while
  // any part of its propagation is still in flight, plus a small node-glow
  // tail of 0.25s after the last pulse lands.
  const NODE_GLOW_SEC = 0.35;
  const waveLifetimeSec = waveDurationSec + NODE_GLOW_SEC;
  const maxWaves =
    Math.floor((totalDurationSec - firstWaveDelaySeconds) / waveIntervalSeconds) + 1;

  // Build a small list of currently-alive waves (typically 1-3 simultaneous).
  const aliveWaves: number[] = [];
  for (let w = 0; w < maxWaves; w++) {
    const waveStart = firstWaveDelaySeconds + w * waveIntervalSeconds;
    const waveEnd = waveStart + waveLifetimeSec;
    if (nowSec >= waveStart && nowSec < waveEnd) {
      aliveWaves.push(w);
    }
  }

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
            fontSize: 58,
            lineHeight: 1.08,
            color: resolvedInk,
            letterSpacing: "-0.015em",
            opacity: networkOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Optional subtitle (~y=350) */}
      {subtitle && (
        <div
          style={{
            position: "absolute",
            top: 350,
            left: 80,
            right: 80,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.25,
            color: resolvedMuted,
            opacity: networkOpacity,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* NETWORK ZONE — SVG 1080×920 */}
      <svg
        style={{
          position: "absolute",
          top: NETWORK_TOP,
          left: NETWORK_LEFT,
          width: NETWORK_W,
          height: NETWORK_H,
          opacity: networkOpacity,
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${NETWORK_W} ${NETWORK_H}`}
      >
        {/* Subtle accent drop-shadow used by every node */}
        <defs>
          <filter id="nn-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nn-pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Layer labels (top band) ────────────────────────────── */}
        {showLayerLabels &&
          nodes.map((col, layerIdx) => {
            const label =
              layerLabels[layerIdx] ??
              (layerIdx === 0
                ? "INPUT"
                : layerIdx === nodes.length - 1
                  ? "OUTPUT"
                  : `HIDDEN ${layerIdx}`);
            const cx = col[0].x;
            return (
              <text
                key={`label-${layerIdx}`}
                x={cx}
                y={42}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                fontSize={24}
                letterSpacing="3"
                fill={resolvedMuted}
                style={{ textTransform: "uppercase" }}
              >
                {label}
              </text>
            );
          })}

        {/* ── Edges (fully-connected, low-opacity) ──────────────── */}
        <g>
          {nodes.slice(0, -1).map((col, layerIdx) =>
            col.map((from, i) =>
              nodes[layerIdx + 1].map((to, j) => (
                <line
                  key={`edge-${layerIdx}-${i}-${j}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={resolvedMuted}
                  strokeOpacity={0.25}
                  strokeWidth={1.5}
                />
              )),
            ),
          )}
        </g>

        {/* ── Nodes ───────────────────────────────────────────── */}
        <g>
          {nodes.map((col, layerIdx) =>
            col.map((p, i) => {
              // Per-node glow: light up when this layer's pulses are arriving.
              // Pulse for wave w arrives at layer L at time waveStart + L*pulsePropagateSeconds.
              let glow = 0;
              for (const w of aliveWaves) {
                const waveStart = firstWaveDelaySeconds + w * waveIntervalSeconds;
                const arriveSec = waveStart + layerIdx * pulsePropagateSeconds;
                const delta = nowSec - arriveSec;
                if (delta >= 0 && delta < NODE_GLOW_SEC) {
                  // Triangle envelope: peaks at delta=0, fades linearly out.
                  glow = Math.max(glow, 1 - delta / NODE_GLOW_SEC);
                }
              }
              return (
                <circle
                  key={`node-${layerIdx}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={NODE_RADIUS}
                  fill={resolvedPaper}
                  stroke={resolvedAccent}
                  strokeWidth={2.5}
                  style={{
                    filter:
                      glow > 0.05 ? "url(#nn-node-glow)" : undefined,
                  }}
                  opacity={0.85 + 0.15 * glow}
                />
              );
            }),
          )}
        </g>

        {/* ── Pulses ──────────────────────────────────────────── */}
        <g>
          {aliveWaves.map((w) => {
            const waveStart = firstWaveDelaySeconds + w * waveIntervalSeconds;
            // For each layer transition, every layer-i node emits a pulse
            // toward a deterministically chosen target in layer-(i+1).
            const elements: React.ReactNode[] = [];
            for (let layerIdx = 0; layerIdx < numLayers - 1; layerIdx++) {
              const hopStart = waveStart + layerIdx * pulsePropagateSeconds;
              const hopEnd = hopStart + pulsePropagateSeconds;
              if (nowSec < hopStart || nowSec >= hopEnd) continue;
              const t = (nowSec - hopStart) / pulsePropagateSeconds; // 0..1

              const fromCol = nodes[layerIdx];
              const toCol = nodes[layerIdx + 1];
              for (let i = 0; i < fromCol.length; i++) {
                // Deterministic target picker (seeded by wave + layer + source).
                const seed = w * 1009 + layerIdx * 31 + i;
                const targetIdx = Math.floor(seededRand(seed) * toCol.length);
                const from = fromCol[i];
                const to = toCol[Math.min(toCol.length - 1, targetIdx)];
                const x = from.x + (to.x - from.x) * t;
                const y = from.y + (to.y - from.y) * t;
                // Soft in/out fade so pulses don't pop in at the source.
                const fade =
                  t < 0.12
                    ? t / 0.12
                    : t > 0.88
                      ? (1 - t) / 0.12
                      : 1;
                elements.push(
                  <circle
                    key={`pulse-${w}-${layerIdx}-${i}`}
                    cx={x}
                    cy={y}
                    r={PULSE_RADIUS}
                    fill={resolvedAccent}
                    opacity={0.95 * fade}
                    style={{ filter: "url(#nn-pulse-glow)" }}
                  />,
                );
              }
            }
            return <g key={`wave-${w}`}>{elements}</g>;
          })}
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
