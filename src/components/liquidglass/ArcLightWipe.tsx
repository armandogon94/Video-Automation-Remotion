/**
 * ArcLightWipe — a transition WIPE atom (net-new; Opus + Gemini verified the repo
 * had NO arc-wipe / swoosh / light-streak transition).
 *
 * WHAT IT IS
 * ----------
 * A glowing light streak that SWEEPS across the frame to bridge scene changes —
 * the cinematic "swoosh / light-bridge" cut. It renders a tall, thin, blurred
 * gradient bar with rounded ends (carrying the shared liquid-glass `glassGlow`
 * rim), rotated by `angleDeg`, that translateX-sweeps from fully off one side of
 * the frame to fully off the other over [startFrame, startFrame + durationInFrames].
 * A faint, wider TRAILING arc follows just behind the lead streak so the sweep
 * reads as a comet-like light bridge rather than a hard bar. The whole atom fades
 * in at the start and out at the end of the window so nothing pops on/off.
 *
 * Drop it on TOP of whatever is changing underneath (it is an AbsoluteFill with
 * pointerEvents:"none"); time it so the midpoint of the sweep lands on the cut.
 *
 * MATERIAL: pulls `glow` from the shared liquid-glass tokens (theme-aware) and
 * `glassGlow` for the signature rim bloom; `withAlpha` builds the gradient stops.
 *
 * GOTCHA HANDLED: no CSS background-clip:text / -webkit-text-fill-color (there is
 * no text here anyway). Pure transforms + linear-gradient + box-shadow, all
 * derived from useCurrentFrame() — SSR-safe and frame-deterministic (no
 * Math.random / Date.now / window). Comp-id-safe (this is an atom, not a comp).
 *
 * Self-contained: imports only react, remotion, and ./tokens (same folder).
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { glassGlow, lgTheme, withAlpha, type LiquidGlassTheme } from "./tokens";

export interface ArcLightWipeProps {
  /** Streak / glow color. Defaults to the theme's liquid-glass glow hue. */
  color?: string;
  /** Liquid-glass theme; selects the default `color` when none is passed. */
  theme?: LiquidGlassTheme;
  /** Frame the sweep begins (atom is invisible before this). */
  startFrame?: number;
  /** Length of the full off-to-off sweep, in frames. */
  durationInFrames?: number;
  /** "ltr" sweeps left→right; "rtl" sweeps right→left. */
  direction?: "ltr" | "rtl";
  /** Width (px) of the lead streak bar BEFORE rotation. */
  streakWidth?: number;
  /** Blur radius (px) feeding the glassGlow rim bloom. */
  glowSigma?: number;
  /** Tilt of the streak, in degrees (gives the swoosh its diagonal arc). */
  angleDeg?: number;
  /** Extra container styles (z-index, mixBlendMode, opacity multiplier, etc.). */
  style?: React.CSSProperties;
}

export const ArcLightWipe: React.FC<ArcLightWipeProps> = ({
  color,
  theme = "brand",
  startFrame = 0,
  durationInFrames = 24,
  direction = "ltr",
  streakWidth = 220,
  glowSigma = 40,
  angleDeg = 18,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const streakColor = color ?? lgTheme(theme).glow;

  // Local frame within the sweep window, clamped so the atom is fully off-frame
  // (and invisible) outside [startFrame, startFrame + durationInFrames].
  const dur = Math.max(1, durationInFrames);
  const localFrame = frame - startFrame;

  // Sweep progress 0→1 with an ease-in-out so the streak accelerates into the
  // frame and decelerates out — reads as a deliberate light bridge, not a wipe.
  const progress = interpolate(localFrame, [0, dur], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Off-screen travel: the streak (rotated, so we pad generously for its tilted
  // bounding box) starts fully past one edge and ends fully past the other.
  // travelStart < 0 puts the streak left of frame; travelEnd > width puts it
  // right of frame. The streak element is centered via translateX(-50%), so we
  // travel its CENTER from off-left to off-right.
  const pad = streakWidth + Math.abs(height * Math.sin((angleDeg * Math.PI) / 180));
  const travelStart = -pad;
  const travelEnd = width + pad;

  // Direction flips the travel span; progress always runs 0→1 in window time.
  const fromX = direction === "rtl" ? travelEnd : travelStart;
  const toX = direction === "rtl" ? travelStart : travelEnd;
  const centerX = interpolate(progress, [0, 1], [fromX, toX]);

  // Edge fades: bloom in over the first slice, bloom out over the last slice so
  // neither the appearance nor the exit pops. Outside the window this is 0.
  const fade = interpolate(
    localFrame,
    [0, dur * 0.18, dur * 0.82, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // The trailing arc lags the lead streak by a fraction of the travel span and
  // is wider + dimmer, giving the comet/light-bridge read. It trails BEHIND the
  // direction of motion.
  const trailSpan = streakWidth * 1.9;
  const trailOffset = direction === "rtl" ? trailSpan : -trailSpan;
  const trailCenterX = centerX + trailOffset;

  // A streak just taller than the frame's diagonal so the rotated bar always
  // covers top-to-bottom regardless of tilt.
  const streakHeight = Math.hypot(width, height) * 1.2;

  // Lead-streak gradient: a bright, soft-edged core feathering to transparent.
  const leadGradient = `linear-gradient(90deg,
    ${withAlpha(streakColor, 0)} 0%,
    ${withAlpha(streakColor, 0.35)} 28%,
    ${withAlpha(streakColor, 0.95)} 50%,
    ${withAlpha(streakColor, 0.35)} 72%,
    ${withAlpha(streakColor, 0)} 100%)`;

  // Trailing-arc gradient: lower-alpha, broader feather — the soft wake.
  const trailGradient = `linear-gradient(90deg,
    ${withAlpha(streakColor, 0)} 0%,
    ${withAlpha(streakColor, 0.18)} 50%,
    ${withAlpha(streakColor, 0)} 100%)`;

  const streakBaseStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    height: streakHeight,
    borderRadius: streakWidth,
    transformOrigin: "center center",
    pointerEvents: "none",
    willChange: "transform, opacity",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade, ...style }}>
      {/* Trailing arc — wider, dimmer wake that lags behind the lead streak. */}
      <div
        style={{
          ...streakBaseStyle,
          left: 0,
          width: trailSpan,
          background: trailGradient,
          filter: `blur(${Math.round(glowSigma * 0.6)}px)`,
          opacity: 0.7,
          transform: `translate(${trailCenterX}px, -50%) translateX(-50%) rotate(${angleDeg}deg)`,
        }}
      />
      {/* Lead streak — the bright light bar carrying the liquid-glass rim glow. */}
      <div
        style={{
          ...streakBaseStyle,
          left: 0,
          width: streakWidth,
          background: leadGradient,
          filter: `blur(${Math.round(glowSigma * 0.25)}px)`,
          boxShadow: glassGlow(streakColor, glowSigma, 1),
          transform: `translate(${centerX}px, -50%) translateX(-50%) rotate(${angleDeg}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
