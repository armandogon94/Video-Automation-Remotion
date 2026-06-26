/**
 * GlowPulseOverlay — the signature liquid-glass RIM, as a drop-in overlay atom.
 *
 * WHY THIS EXISTS (austin.marchese + nateherk study, 2026-06-26)
 * -------------------------------------------------------------
 * The 3-reviewer animation study (Opus + Codex GPT-5.5 + Gemini 3.5 Flash — see
 * docs/research/austin-anim/FINAL-CONSENSUS.md) found ONE load-bearing piece of
 * craft all three reviewers independently flagged: the rim does NOT fade in as a
 * single unit. It animates in TWO STAGES with SEPARATE easing:
 *   1. the SOLID BORDER settles CRISP first (ease-out, opacity 0→1 + a tiny
 *      scale 0.985→1) — the card "snaps" into existence with a hard edge;
 *   2. THEN the GLOW BLOOMS independently a few frames later (ease-in-out,
 *      box-shadow intensity 0→1 via glassGlow) — the rim "powers on".
 *   3. optional continuous PULSE afterward (intensity 1→0.45→1, a sine breathe).
 *
 * This atom encapsulates exactly that timing so any composition gets the right
 * feel by wrapping its card content. It pairs with glassCardStyle (the frosted
 * fill + border) — typically: <GlowPulseOverlay><div style={glassCardStyle(...)}>
 * …</div></GlowPulseOverlay>, OR use it standalone as the bordered card itself.
 *
 * Renders a POSITIONED wrapper div (border + borderRadius + boxShadow) around its
 * children — NOT an AbsoluteFill. The caller positions it. SSR-safe and
 * frame-deterministic: everything derives from useCurrentFrame(); no DOM
 * measurement, no window access, no Math.random / Date.now.
 *
 * GOTCHA HANDLED: no background-clip:text / -webkit-text-fill-color:transparent
 * (Remotion's headless Chromium paints those as opaque rectangles). This atom
 * touches only border/radius/box-shadow/transform, so it's headless-safe.
 */
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  glassGlow,
  lgTheme,
  withAlpha,
  type LiquidGlassTheme,
} from "./tokens";

export interface GlowPulseOverlayProps {
  /** Card content wrapped by the animated rim. */
  children?: React.ReactNode;
  /** Rim / glow accent color. Defaults to the theme's glow hue. */
  color?: string;
  /** Liquid-glass theme; only used to resolve the default `color`. */
  theme?: LiquidGlassTheme;
  /** Frame at which the whole sequence begins (settle → bloom → pulse). */
  startFrame?: number;
  /** Duration (frames) of stage 1 — the crisp border settle. */
  settleFrames?: number;
  /** Frames after `startFrame` before stage 2 — the glow bloom — begins. */
  bloomDelayFrames?: number;
  /** Duration (frames) of stage 2 — the glow bloom. */
  bloomFrames?: number;
  /** Glow blur radius (px) passed to glassGlow(color, glowSigma, intensity). */
  glowSigma?: number;
  /** Stage 3: continuous sine "breathe" of the glow after it has bloomed. */
  pulse?: boolean;
  /** Period (frames) of one full pulse cycle. */
  pulsePeriodFrames?: number;
  /** Border thickness (px). */
  borderWidth?: number;
  /** Corner radius (px). */
  radius?: number;
  /** Extra styles merged onto the wrapper (e.g. position / size / padding). */
  style?: React.CSSProperties;
}

/**
 * Two-stage liquid-glass rim overlay: crisp border settle, then independent glow
 * bloom, then an optional continuous pulse. Border and glow are SEPARATE
 * interpolations with SEPARATE easing — never collapsed into one tween.
 */
export const GlowPulseOverlay: React.FC<GlowPulseOverlayProps> = ({
  children,
  color,
  theme = "brand",
  startFrame = 0,
  settleFrames = 12,
  bloomDelayFrames = 16,
  bloomFrames = 6,
  glowSigma = 18,
  pulse = true,
  pulsePeriodFrames = 45,
  borderWidth = 2,
  radius = 28,
  style,
}) => {
  const frame = useCurrentFrame();
  const rimColor = color ?? lgTheme(theme).glow;

  // ── Stage 1: BORDER settles crisp (ease-out). opacity 0→1 + tiny scale. ──
  const settleEnd = startFrame + Math.max(1, settleFrames);
  const settle = interpolate(frame, [startFrame, settleEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const borderOpacity = settle;
  const scale = interpolate(settle, [0, 1], [0.985, 1]);

  // ── Stage 2: GLOW BLOOMS independently (ease-in-out), AFTER bloomDelay. ──
  const bloomStart = startFrame + bloomDelayFrames;
  const bloomEnd = bloomStart + Math.max(1, bloomFrames);
  const bloom = interpolate(frame, [bloomStart, bloomEnd], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Stage 3: continuous PULSE (sine breathe) once the bloom has finished. ──
  // intensity rides 1 → 0.45 → 1 over one period; phase 0 sits at the peak so
  // it joins the bloom seamlessly (no jump from 1.0 down to the cycle start).
  let glowIntensity = bloom;
  if (pulse && frame >= bloomEnd) {
    const period = Math.max(1, pulsePeriodFrames);
    const phase = ((frame - bloomEnd) % period) / period; // 0..1
    // cos starts at +1 (peak) so the seam at bloomEnd is continuous.
    const wave = (Math.cos(phase * 2 * Math.PI) + 1) / 2; // 1 → 0 → 1
    const PULSE_FLOOR = 0.45;
    const pulsed = PULSE_FLOOR + (1 - PULSE_FLOOR) * wave; // 1 → 0.45 → 1
    // Gate the pulse by the bloom so a startFrame in the past still resolves to
    // a fully-bloomed rim before breathing (bloom is already 1 here).
    glowIntensity = bloom * pulsed;
  }

  return (
    <div
      style={{
        // Positioned wrapper (NOT an AbsoluteFill) — caller controls placement.
        position: "relative",
        borderRadius: radius,
        border: `${borderWidth}px solid ${withAlpha(rimColor, borderOpacity)}`,
        boxShadow: glassGlow(rimColor, glowSigma, glowIntensity),
        transform: `scale(${scale})`,
        transformOrigin: "center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
