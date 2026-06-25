/**
 * RingTopologyHopCounter9x16 — adamrosler ring-topology hop visualization.
 *
 * SOURCE: references/creators/adamrosler/_backcat/prvqXkQDoBw/{f03,f04,f05}.jpg
 *   ("RING ATTENTION" explainer — GPUs arranged on a circle, a data parcel
 *   hops around the ring perimeter node→node while a "HOP n / N" counter
 *   ticks up and the active node glows).
 *
 * Pattern distilled (adamrosler discipline = near-black dark bg + ONE accent
 * + per-node soft glow + monospaced UI chrome):
 *   - Dark near-black background, faint vignette.
 *   - Bold white ALL-CAPS headline up top (the "RING ATTENTION" hero).
 *   - Accent-colored monospace kicker beneath it ("1. LOCAL ATTENTION").
 *   - N labeled nodes placed evenly on a circle; each ring drawn in a faint
 *     cool tone, the *active* node lit in the accent color with a glow halo.
 *   - A small bright data parcel eases from the active node to the next node,
 *     advancing one hop at a time around the perimeter.
 *   - "HOP n / N" step counter centered below the ring, ticking up as the
 *     parcel completes each hop.
 *
 * GOTCHAS handled per brief:
 *   - Composition id RingTopologyHopCounter9x16 has no underscore. ✓
 *   - SOLID color used for hero/headline + parcel (no background-clip:text,
 *     which Remotion headless renders as an opaque box). ✓
 *   - No Date.now / Math.random — all motion derived from useCurrentFrame. ✓
 *
 * Self-contained: imports only react, remotion, zod, and ../brand (BRAND,
 * FONT_STACKS) + inline SVG. No new deps.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─── Schema (every field has a DEMO default so {} props renders real content) ──
export const ringTopologyHopCounter9x16Schema = z.object({
  /** How many nodes sit on the ring. Clamped to 3..12. */
  nodeCount: z.number().int().default(8),
  /** Labels for each node, in clockwise order from the top. */
  nodeLabels: z
    .array(z.string())
    .default([
      "GPU 0",
      "GPU 1",
      "GPU 2",
      "GPU 3",
      "GPU 4",
      "GPU 5",
      "GPU 6",
      "GPU 7",
    ]),
  /** Total hops the parcel makes around the ring (the N in "HOP n / N"). */
  totalHops: z.number().int().default(8),
  /** Bold white hero headline. */
  headline: z.string().default("RING ATTENTION"),
  /** Accent monospace kicker under the headline. */
  kicker: z.string().default("1. KEYS HOP"),
  /** The single accent color (adamrosler one-accent discipline). */
  accentColor: z.string().default("#F2A33C"),
});
export type RingTopologyHopCounter9x16Props = z.infer<
  typeof ringTopologyHopCounter9x16Schema
>;

// ─── Palette (adamrosler near-black + glow) ────────────────────────────────
const BG_TOP = "#0C0D12";
const BG_BOTTOM = "#070709";
const INK = "#F4F5F8";
const NODE_IDLE_LABEL = "#7E889C";
const RING_GUIDE = "#222838";

// A small cool palette to faintly tint idle node rings (mirrors the source's
// blue / mint / amber / indigo node hues), cycled by index. Kept low-saturation
// so the single accent still dominates.
const NODE_TINTS = ["#5C9BE0", "#4FB89A", "#C7923E", "#7C77D6", "#5C9BE0"];

// ─── Composition ────────────────────────────────────────────────────────────
export const RingTopologyHopCounter9x16: React.FC<
  RingTopologyHopCounter9x16Props
> = ({ nodeCount, nodeLabels, totalHops, headline, kicker, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // ── Geometry ──────────────────────────────────────────────────────────────
  const count = Math.max(3, Math.min(12, Math.round(nodeCount)));
  const cx = width / 2;
  const cy = height * 0.52;
  const radius = Math.min(width, height) * 0.32;
  const nodeR = Math.max(34, radius * 0.16);

  // Node positions: node 0 at the top (−90°), going clockwise.
  const angleFor = (i: number): number =>
    (-Math.PI / 2) + (i / count) * Math.PI * 2;
  const posFor = (i: number): { x: number; y: number } => {
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  };
  const labelFor = (i: number): string =>
    nodeLabels[i] ?? `GPU ${i}`;

  // ── Hop timeline ────────────────────────────────────────────────────────────
  // Reserve an intro beat (ring + headline build in) and an outro hold, then
  // spread the hops evenly across the middle. Each hop = parcel eases from the
  // current active node to the next node clockwise.
  const introFrames = Math.round(fps * 0.7);
  const outroFrames = Math.round(fps * 0.5);
  const hops = Math.max(1, Math.round(totalHops));
  const animFrames = Math.max(1, durationInFrames - introFrames - outroFrames);
  const framesPerHop = animFrames / hops;

  // Local time inside the hopping phase (clamped to [0, animFrames]).
  const tHop = Math.max(0, Math.min(animFrames, frame - introFrames));

  // Which hop are we currently performing, and how far through it (eased).
  const rawHopIndex = tHop / framesPerHop; // 0..hops
  const currentHop = Math.min(hops - 1, Math.floor(rawHopIndex));
  const hopFraction = Math.min(1, rawHopIndex - currentHop);
  // Ease the within-hop progress so the parcel accelerates out and settles in.
  const easedFraction = interpolate(hopFraction, [0, 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Completed hops drives the HOP counter (n / N). Before the hop phase it's 0;
  // it increments as each hop *finishes*.
  const completedHops = Math.min(hops, Math.floor(rawHopIndex));
  const displayedHop = frame < introFrames ? 0 : completedHops;

  // Source / target node indices for the parcel on the current hop.
  const fromNode = currentHop % count;
  const toNode = (currentHop + 1) % count;

  // Parcel position: lerp along the straight chord from fromNode → toNode,
  // pulled slightly toward the ring center so it reads as travelling *along*
  // the perimeter rather than cutting straight across (subtle inward bow).
  const fromP = posFor(fromNode);
  const toP = posFor(toNode);
  const parcelX = fromP.x + (toP.x - fromP.x) * easedFraction;
  const parcelYStraight = fromP.y + (toP.y - fromP.y) * easedFraction;
  // Inward bow: max at mid-hop, zero at the endpoints.
  const bow = Math.sin(easedFraction * Math.PI);
  const midX = (fromP.x + toP.x) / 2;
  const midY = (fromP.y + toP.y) / 2;
  const towardCenterX = (cx - midX) * 0.18 * bow;
  const towardCenterY = (cy - midY) * 0.18 * bow;
  const parcelPosX = parcelX + towardCenterX;
  const parcelPosY = parcelYStraight + towardCenterY;
  const showParcel = frame >= introFrames && tHop < animFrames;

  // ── Headline / kicker build-in (snappy spring) ──────────────────────────────
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 },
    durationInFrames: 16,
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [28, 0]);

  const kickerOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter pop: scale-kick whenever displayedHop increments.
  const hopChangeFrame = introFrames + completedHops * framesPerHop;
  const sinceHopChange = frame - hopChangeFrame;
  const counterPop =
    sinceHopChange >= 0 && sinceHopChange < 10
      ? interpolate(sinceHopChange, [0, 4, 10], [1, 1.14, 1], {
          extrapolateRight: "clamp",
        })
      : 1;

  // ── Node ring draw-on (each node fades/scales in with a small stagger) ──────
  const nodeAppear = (i: number): number => {
    const start = 4 + i * 2.5;
    return interpolate(frame, [start, start + 12], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // A node is "active" when the parcel is sitting on it or arriving at it.
  // While a hop is in flight, the *target* lights up as the parcel nears it,
  // and the *source* stays lit until the parcel leaves.
  const nodeGlow = (i: number): number => {
    if (frame < introFrames) return i === 0 ? 0.65 : 0;
    if (tHop >= animFrames) {
      // Outro: every node settles lit (the "every query sees every key" beat).
      const settle = interpolate(
        frame,
        [introFrames + animFrames, durationInFrames],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      return Math.max(i === toNode ? 0.8 : 0, settle * 0.55);
    }
    if (i === fromNode) return interpolate(easedFraction, [0, 1], [0.9, 0.2]);
    if (i === toNode) return interpolate(easedFraction, [0, 1], [0.15, 0.95]);
    return 0;
  };

  const counterTextColor = accentColor;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 42%, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`,
        fontFamily: FONT_STACKS.mono,
      }}
    >
      {/* Faint vignette to deepen the corners (adamrosler near-black look). */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(100% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Headline + kicker ── */}
      <div
        style={{
          position: "absolute",
          top: height * 0.11,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: 88,
            letterSpacing: "0.01em",
            color: INK, // SOLID color (no background-clip:text)
            lineHeight: 1.02,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: accentColor,
            opacity: kickerOpacity,
          }}
        >
          {kicker}
        </div>
      </div>

      {/* ── Ring + nodes + parcel (SVG) ── */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="rthc-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="rthc-parcel-glow"
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
          >
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint dashed guide circle that the nodes sit on. */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={RING_GUIDE}
          strokeWidth={1.5}
          strokeDasharray="2 12"
          opacity={interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
        {/* Tiny center dot (the ring's hub, as in the source) — faint brand tint. */}
        <circle cx={cx} cy={cy} r={3} fill={BRAND.colors.muted} opacity={0.5} />

        {/* Nodes. */}
        {Array.from({ length: count }).map((_, i) => {
          const p = posFor(i);
          const appear = nodeAppear(i);
          const glow = nodeGlow(i);
          const tint = NODE_TINTS[i % NODE_TINTS.length];
          const ringColor = glow > 0.05 ? accentColor : tint;
          const ringOpacity = 0.45 + glow * 0.55;
          const scale = 0.8 + appear * 0.2 + glow * 0.06;

          return (
            <g
              key={i}
              transform={`translate(${p.x} ${p.y}) scale(${scale})`}
              opacity={appear}
            >
              {/* Glow halo (only meaningful when lit). */}
              {glow > 0.02 ? (
                <circle
                  r={nodeR}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={3}
                  opacity={glow}
                  filter="url(#rthc-glow)"
                />
              ) : null}
              {/* Inner fill disc — darkens center so labels read. */}
              <circle
                r={nodeR - 2}
                fill={BG_BOTTOM}
                opacity={0.92}
              />
              {/* Node ring. */}
              <circle
                r={nodeR}
                fill="none"
                stroke={ringColor}
                strokeWidth={glow > 0.05 ? 3 : 2}
                opacity={ringOpacity}
              />
              {/* Label. */}
              <text
                x={0}
                y={6}
                textAnchor="middle"
                fontFamily={FONT_STACKS.mono}
                fontWeight={700}
                fontSize={nodeR * 0.5}
                letterSpacing="0.04em"
                fill={glow > 0.3 ? INK : NODE_IDLE_LABEL}
              >
                {labelFor(i)}
              </text>
            </g>
          );
        })}

        {/* Data parcel travelling node → node. */}
        {showParcel ? (
          <g
            transform={`translate(${parcelPosX} ${parcelPosY})`}
            filter="url(#rthc-parcel-glow)"
          >
            <circle r={13} fill={accentColor} opacity={0.35} />
            <circle r={7} fill={accentColor} />
            <circle r={3} fill={INK} opacity={0.9} />
          </g>
        ) : null}
      </svg>

      {/* ── HOP n / N counter ── */}
      <div
        style={{
          position: "absolute",
          top: cy + radius + nodeR + 70,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "0.28em",
            color: counterTextColor,
            transform: `scale(${counterPop})`,
            transformOrigin: "center",
          }}
        >
          HOP {displayedHop} / {hops}
        </span>
      </div>
    </AbsoluteFill>
  );
};
