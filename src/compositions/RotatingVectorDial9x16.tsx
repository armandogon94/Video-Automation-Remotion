/**
 * RotatingVectorDial9x16 — adamrosler "rotating vector / needle dial" pattern.
 *
 *   - Source frame:
 *     `references/creators/adamrosler/_backcat/es79NbFQdzw/f04.jpg`
 *     ("ROTATE BEFORE THE DOT PRODUCT."): near-black background, a white bold
 *     ALL-CAPS headline pinned high, and ONE or TWO clock-face DIALS — each a
 *     thin circular gauge with a crosshair + tick marks and a glowing blue
 *     NEEDLE/vector that rotates to a target angle, used for comparison
 *     ("Position 1" vs "Position 50"). A dotted arc traces the swept angle and
 *     a gold monospace caption labels each dial below it.
 *
 * adamrosler palette discipline: near-black bg + ONE cool accent (blue) for the
 * needle/arc with a soft glow + a warm gold for the value/label captions. No
 * gradients-as-text (Remotion headless renders background-clip:text as an opaque
 * box — every label is a SOLID color).
 *
 * Motion grammar:
 *   - Dial ring + tick marks fade/scale in first (spring, staggered per dial).
 *   - The NEEDLE springs its rotation from 0° → targetAngleDeg (clamped spring
 *     so the swing is crisp, not smeared across the whole comp). 0° points up
 *     (12 o'clock); positive angles sweep clockwise.
 *   - A dotted ARC draws along the swept sector, its end-cap dot riding the
 *     needle tip via stroke-dashoffset keyed to the same eased progress.
 *   - The value callout (angle/value label) counts up with the needle and the
 *     gold caption fades in once the needle settles.
 *   - kicker (eyebrow) + headline reveal at the top before the dials swing.
 *
 * Self-contained: react, remotion, zod, ../brand (BRAND, FONT_STACKS) + inline
 * SVG only. Every schema field has a sensible DEMO `.default()` so `{}` props
 * render the two-up "ROTATE BEFORE THE DOT PRODUCT" comparison out of the box.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─── Public schema + types ─────────────────────────────────────────────
const dialSchema = z.object({
  /** Gold monospace caption under the dial (e.g. "POSITION 1"). */
  label: z.string().default("POSITION 1"),
  /** Target needle angle in degrees. 0° = up (12 o'clock); positive = clockwise. */
  targetAngleDeg: z.number().default(35),
  /** Value callout shown at the dial center as the needle settles (e.g. "35°"). */
  valueLabel: z.string().default("35°"),
});
export type RotatingVectorDial = z.infer<typeof dialSchema>;

export const rotatingVectorDial9x16Schema = z.object({
  /** Small eyebrow above the headline. "" hides it. */
  kicker: z.string().default("VECTOR INTUITION"),
  /** White ALL-CAPS headline pinned high (adamrosler hook line). */
  headline: z.string().default("Rotate before the dot product."),
  /** One or two dials. With two, they sit side-by-side for comparison. */
  dials: z
    .array(dialSchema)
    .default([
      { label: "POSITION 1", targetAngleDeg: 35, valueLabel: "35°" },
      { label: "POSITION 50", targetAngleDeg: 295, valueLabel: "295°" },
    ]),
  /** Cool accent for the needle + swept arc + glow. */
  accentColor: z.string().default("#5B8DEF"),
  /** Warm caption color (value callout + dial label). */
  labelColor: z.string().default(BRAND.colors.accent),
  /** Near-black canvas. */
  backgroundColor: z.string().default("#0A0C10"),
  /** Force a two-up comparison layout even when only one dial is supplied. */
  twoUp: z.boolean().default(true),
});
export type RotatingVectorDial9x16Props = z.infer<
  typeof rotatingVectorDial9x16Schema
>;

// ─── Geometry constants ────────────────────────────────────────────────
const TWO_PI = Math.PI * 2;
const TICK_COUNT = 12; // clock-face ticks (every 30°)

/** Polar → cartesian. angleDeg measured from UP (12 o'clock), clockwise +. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // -90 so 0° points up
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── A single dial (ring + ticks + needle + swept arc + center value) ───
type DialFaceProps = {
  dial: RotatingVectorDial;
  /** Stagger index — later dials enter slightly after earlier ones. */
  order: number;
  size: number;
  accentColor: string;
  labelColor: string;
};

const DialFace: React.FC<DialFaceProps> = ({
  dial,
  order,
  size,
  accentColor,
  labelColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterDelay = 8 + order * 6;
  const needleDelay = 22 + order * 8;

  // Ring + ticks scale/fade in.
  const enter = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.7 },
    durationInFrames: 18,
  });
  const ringOpacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringScale = interpolate(enter, [0, 1], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Needle rotation springs 0 → targetAngleDeg (clamped so the swing is crisp).
  const needleSpring = spring({
    frame: frame - needleDelay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1.1 },
    durationInFrames: 40,
  });
  const swingProgress = interpolate(needleSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentAngle = dial.targetAngleDeg * swingProgress;

  // Settle: value callout + label fade in as the needle reaches target.
  const settle = interpolate(
    frame,
    [needleDelay + 26, needleDelay + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // SVG layout (square viewBox).
  const vb = 200;
  const cx = vb / 2;
  const cy = vb / 2;
  const ringR = vb / 2 - 14;
  const needleR = ringR - 26;
  const arcR = ringR - 40;
  const tickOuter = ringR;
  const tickInner = ringR - 10;

  // Swept-arc path (sector from up=0° to currentAngle, drawn as a dashed trace).
  const arcStart = polar(cx, cy, arcR, 0);
  const arcEnd = polar(cx, cy, arcR, currentAngle);
  const largeArc = Math.abs(currentAngle) > 180 ? 1 : 0;
  const sweepFlag = currentAngle >= 0 ? 1 : 0;
  const arcPath =
    Math.abs(currentAngle) < 0.5
      ? ""
      : `M ${arcStart.x.toFixed(2)} ${arcStart.y.toFixed(2)} A ${arcR} ${arcR} 0 ${largeArc} ${sweepFlag} ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`;

  const needleTip = polar(cx, cy, needleR, currentAngle);
  const needleTail = polar(cx, cy, 16, currentAngle + 180);
  const glowId = `dialGlow-${order}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        opacity: ringOpacity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        style={{
          transform: `scale(${ringScale})`,
          transformOrigin: "center center",
          overflow: "visible",
        }}
      >
        <defs>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ringR}
          fill="none"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth={1.4}
        />

        {/* Crosshair (vertical + horizontal axis) */}
        <line
          x1={cx}
          y1={cy - ringR}
          x2={cx}
          y2={cy + ringR}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
        />
        <line
          x1={cx - ringR}
          y1={cy}
          x2={cx + ringR}
          y2={cy}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
        />

        {/* Tick marks every 30° */}
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const a = (i / TICK_COUNT) * 360;
          const p1 = polar(cx, cy, tickOuter, a);
          const p2 = polar(cx, cy, tickInner, a);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1.2}
            />
          );
        })}

        {/* Dotted swept-angle arc (accent), end-cap dot rides the needle tip */}
        {arcPath && (
          <>
            <path
              d={arcPath}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="1.5 5"
              opacity={0.9}
              filter={`url(#${glowId})`}
            />
            <circle
              cx={arcEnd.x}
              cy={arcEnd.y}
              r={2.6}
              fill={accentColor}
              filter={`url(#${glowId})`}
            />
          </>
        )}

        {/* The NEEDLE / vector (accent, glowing) */}
        <g filter={`url(#${glowId})`}>
          <line
            x1={needleTail.x}
            y1={needleTail.y}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={accentColor}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
          {/* arrow tip */}
          <circle cx={needleTip.x} cy={needleTip.y} r={4.2} fill={accentColor} />
          {/* hub */}
          <circle cx={cx} cy={cy} r={4} fill={accentColor} />
          <circle cx={cx} cy={cy} r={7} fill="none" stroke={accentColor} strokeWidth={1.2} opacity={0.6} />
        </g>

        {/* Value callout near the hub (fades in as the needle settles) */}
        <text
          x={cx}
          y={cy + ringR * 0.62}
          textAnchor="middle"
          fill={accentColor}
          opacity={settle}
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 18,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {dial.valueLabel}
        </text>
      </svg>

      {/* Gold monospace caption under the dial */}
      <div
        style={{
          fontFamily: FONT_STACKS.mono,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.12em",
          color: labelColor,
          textTransform: "uppercase",
          opacity: settle,
          textAlign: "center",
        }}
      >
        {dial.label}
      </div>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const RotatingVectorDial9x16: React.FC<RotatingVectorDial9x16Props> = ({
  kicker,
  headline,
  dials,
  accentColor,
  labelColor,
  backgroundColor,
  twoUp,
}) => {
  const frame = useCurrentFrame();

  // Header reveal (kicker + headline rise/fade before the dials swing).
  const headOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const headY = interpolate(frame, [0, 14], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Render up to two dials (the comparison case). With one dial + twoUp we still
  // single-render it centered; twoUp only affects sizing/spacing when 2 exist.
  const renderDials = dials.slice(0, 2);
  const isPair = renderDials.length >= 2 || (twoUp && renderDials.length === 2);
  const dialSize = isPair ? 380 : 480;

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 72px",
      }}
    >
      {/* Subtle radial vignette glow behind everything */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1200px at 50% 46%, ${accentColor}14, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header block (kicker + headline) */}
      <div
        style={{
          marginTop: 150,
          transform: `translateY(${headY}px)`,
          opacity: headOpacity,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {kicker.length > 0 && (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.28em",
              color: accentColor,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            {kicker}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 58,
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            textTransform: "uppercase",
          }}
        >
          {headline}
        </h1>
      </div>

      {/* Dials row, vertically centered in the lower 2/3 of the canvas */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isPair ? 90 : 0,
          width: "100%",
        }}
      >
        {renderDials.map((dial, i) => (
          <DialFace
            key={`${dial.label}-${i}`}
            dial={dial}
            order={i}
            size={dialSize}
            accentColor={accentColor}
            labelColor={labelColor}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
