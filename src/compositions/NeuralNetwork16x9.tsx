/**
 * NeuralNetwork16x9 — horizontal (1920×1080) animated neural-network diagram.
 *
 * 16:9 sibling of NeuralNetwork9x16. Re-layout for the wide canvas:
 *   - Layers are spread across a 1920×680 SVG zone (full width, vertically
 *     centered between breadcrumb top and caption bottom).
 *   - With more horizontal space per layer the columns are wider-spaced
 *     (~300px apart for 6 layers vs ~160px in 9x16), and nodes within each
 *     column are spread over ~600px of vertical space vs ~850px — so the
 *     network looks wider and shallower, which reads naturally in landscape.
 *   - Optional title and subtitle are placed LEFT-aligned in the left gutter
 *     above the SVG zone (y ≈ 60..130) rather than stacking vertically as
 *     in the 9x16.
 *
 * Motion grammar preserved from 9x16:
 *   - Whole network fades in over ~0.4s.
 *   - Activation waves fire every `waveIntervalSeconds`, propagating left →
 *     right one layer per `pulsePropagateSeconds`. Pulses soft-fade at edges.
 *   - Arriving nodes briefly glow and return to base opacity.
 *
 * ADR-001 §5.1 font defaults:
 *   - Layer labels: 28px (vs 24px in 9x16, proportional to wider spacing).
 *   - Title: 96px (vs 58px in 9x16).
 *   - Subtitle: 36px (vs 32px in 9x16).
 *   - captionFontSize default: 36px (vs 38px in 9x16).
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

export const neuralNetwork16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  /** Number of nodes in each layer. Length 2–6. Default [4, 6, 6, 4]. */
  layers: z.array(z.number().int().min(1).max(20)).default([4, 6, 6, 4]),
  /** Optional layer labels. Length should match layers. */
  layerLabels: z.array(z.string()).default([]),
  /** Seconds before first activation wave. Default 0.5s. */
  firstWaveDelaySeconds: z.number().min(0).max(10).default(0.5),
  /** Seconds between consecutive waves. Default 0.9s. */
  waveIntervalSeconds: z.number().min(0.2).max(5).default(0.9),
  /** Seconds for a pulse to traverse one edge. Default 0.4s. */
  pulsePropagateSeconds: z.number().min(0.1).max(3).default(0.4),
  /** Show layer labels above each column. Default true. */
  showLayerLabels: z.boolean().default(true),
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.nullable().default(null),
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  /** ADR-001 §5.1: 16:9 default "dark". */
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  /** ADR-001 §5.1: 16:9 default 36px (vs 38px in 9x16). */
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
});

export type NeuralNetwork16x9Props = z.infer<typeof neuralNetwork16x9Schema>;

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────
const CANVAS_H = 1080;

// Network SVG zone: full width, 680px tall, vertically centred
// leaving 200px top for breadcrumb/title and 200px bottom for caption/watermark.
const NETWORK_TOP = 200;
const NETWORK_W = 1920;
const NETWORK_H = 680;

// Inside the SVG viewBox:
//   - x padding: 160px on each side so end-layer nodes are inset.
//   - top label band: 60px.
//   - bottom padding: 20px.
const SVG_PADDING_X = 160;
const SVG_LABEL_BAND = 60;
const SVG_NODE_BAND_BOTTOM = NETWORK_H - 20;

// ADR-001 §5.1: body text sizing for 16:9.
const NODE_RADIUS = 22;
const PULSE_RADIUS = 5;

// ─── Helpers ────────────────────────────────────────────────────────────

interface NodePos {
  x: number;
  y: number;
}

/** Compute absolute (x,y) of every node for the 1920px-wide SVG viewBox. */
function layoutNodes(layers: number[]): NodePos[][] {
  const numLayers = layers.length;
  const innerW = NETWORK_W - SVG_PADDING_X * 2;
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

/** Deterministic per-wave target picker (Mulberry32-ish). */
function seededRand(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ─── Composition ────────────────────────────────────────────────────────
export const NeuralNetwork16x9: React.FC<NeuralNetwork16x9Props> = ({
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
  const { fps, durationInFrames } = useVideoConfig();

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
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  const safeLayers = layers.length >= 2 ? layers : [4, 6, 6, 4];
  const nodes = useMemo<NodePos[][]>(() => layoutNodes(safeLayers), [safeLayers]);

  // Fade in over 0.4s (same as 9x16).
  const networkOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Wave timing (identical logic to 9x16) ─────────────────────────
  const numLayers = safeLayers.length;
  const waveDurationSec = Math.max(
    0.001,
    pulsePropagateSeconds * (numLayers - 1),
  );
  const nowSec = frame / fps;
  const totalDurationSec = durationInFrames / fps;

  const NODE_GLOW_SEC = 0.35;
  const waveLifetimeSec = waveDurationSec + NODE_GLOW_SEC;
  const maxWaves =
    Math.floor(
      (totalDurationSec - firstWaveDelaySeconds) / waveIntervalSeconds,
    ) + 1;

  const aliveWaves: number[] = [];
  for (let w = 0; w < maxWaves; w++) {
    const waveStart = firstWaveDelaySeconds + w * waveIntervalSeconds;
    const waveEnd = waveStart + waveLifetimeSec;
    if (nowSec >= waveStart && nowSec < waveEnd) {
      aliveWaves.push(w);
    }
  }

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

      {/* Title — left-aligned above the SVG zone, large 16:9 sizing */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            // ADR-001 §5.1: hero headline 96px for 16:9.
            fontSize: 96,
            lineHeight: 1.0,
            color: resolvedInk,
            letterSpacing: "-0.02em",
            opacity: networkOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Subtitle — left-aligned, one line below title */}
      {subtitle && (
        <div
          style={{
            position: "absolute",
            top: 168,
            left: 60,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            // ADR-001 §5.1: body 36px for 16:9.
            fontSize: 36,
            lineHeight: 1.25,
            color: resolvedMuted,
            opacity: networkOpacity,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* NETWORK ZONE — SVG 1920×680 */}
      <svg
        style={{
          position: "absolute",
          top: NETWORK_TOP,
          left: 0,
          width: NETWORK_W,
          height: NETWORK_H,
          opacity: networkOpacity,
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${NETWORK_W} ${NETWORK_H}`}
      >
        <defs>
          <filter
            id="nn16-node-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="nn16-pulse-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Layer labels (top band) ─────────────────────── */}
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
                y={36}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                // ADR-001 §5.1: layer labels 28px (vs 24 in 9x16).
                fontSize={28}
                letterSpacing="3"
                fill={resolvedMuted}
                style={{ textTransform: "uppercase" }}
              >
                {label}
              </text>
            );
          })}

        {/* ── Edges (fully-connected, low-opacity) ───────── */}
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

        {/* ── Nodes ────────────────────────────────────────── */}
        <g>
          {nodes.map((col, layerIdx) =>
            col.map((p, i) => {
              let glow = 0;
              for (const w of aliveWaves) {
                const waveStart =
                  firstWaveDelaySeconds + w * waveIntervalSeconds;
                const arriveSec =
                  waveStart + layerIdx * pulsePropagateSeconds;
                const delta = nowSec - arriveSec;
                if (delta >= 0 && delta < NODE_GLOW_SEC) {
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
                      glow > 0.05 ? "url(#nn16-node-glow)" : undefined,
                  }}
                  opacity={0.85 + 0.15 * glow}
                />
              );
            }),
          )}
        </g>

        {/* ── Pulses ────────────────────────────────────────── */}
        <g>
          {aliveWaves.map((w) => {
            const waveStart = firstWaveDelaySeconds + w * waveIntervalSeconds;
            const elements: React.ReactNode[] = [];
            for (let layerIdx = 0; layerIdx < numLayers - 1; layerIdx++) {
              const hopStart = waveStart + layerIdx * pulsePropagateSeconds;
              const hopEnd = hopStart + pulsePropagateSeconds;
              if (nowSec < hopStart || nowSec >= hopEnd) continue;
              const t = (nowSec - hopStart) / pulsePropagateSeconds;

              const fromCol = nodes[layerIdx];
              const toCol = nodes[layerIdx + 1];
              for (let i = 0; i < fromCol.length; i++) {
                const seed = w * 1009 + layerIdx * 31 + i;
                const targetIdx = Math.floor(seededRand(seed) * toCol.length);
                const from = fromCol[i];
                const to = toCol[Math.min(toCol.length - 1, targetIdx)];
                const x = from.x + (to.x - from.x) * t;
                const y = from.y + (to.y - from.y) * t;
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
                    style={{ filter: "url(#nn16-pulse-glow)" }}
                  />,
                );
              }
            }
            return <g key={`wave-${w}`}>{elements}</g>;
          })}
        </g>
      </svg>

      {/* Bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark as WatermarkStyle}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Caption strip — default OFF */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
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

      {/* Silence CANVAS_H reference. */}
      {CANVAS_H > 0 ? null : null}
    </AbsoluteFill>
  );
};

export default NeuralNetwork16x9;
