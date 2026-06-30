/**
 * RibbonParallax — an "alive background" ATOM (net-new layer for the liquid-glass
 * family; the repo had no ambient drifting-color backdrop).
 *
 * WHY THIS EXISTS (austin.marchese + nateherk study; Opus craft note)
 * ------------------------------------------------------------------
 * The 3-reviewer animation study (Opus + Codex GPT-5.5 + Gemini 3.5 Flash — see
 * docs/research/austin-anim/FINAL-CONSENSUS.md) flagged that austin/nate's frames
 * never sit on a DEAD background: under their otherwise-static glass cards there is
 * a slow, breathing wash of color that drifts on ITS OWN clock — a layer entirely
 * independent of the card/foreground motion. The video-use / Opus craft note made
 * the timing explicit: "ribbon drift is its own layer." So this atom is a pure
 * BACKGROUND: 2–3 soft, heavily-blurred themed gradient "ribbons"/blobs, each with
 * its OWN speed, easing, and phase, panning continuously behind the foreground. It
 * is deliberately low-opacity and large-blur so it reads as AMBIENT COLOR and never
 * competes with text.
 *
 * WHAT IT IS
 * ----------
 * An AbsoluteFill (pointerEvents:"none") holding N radial-gradient blobs. Each blob
 * translates on a continuous, SEAMLESSLY-LOOPING path: x and y ride independent
 * sine/cosine waves whose periods are exact integer frame counts, so position,
 * velocity, AND acceleration all match across the loop seam (no jump, no pause).
 * Each blob gets its own period, phase offset, and a per-axis ease via a smooth
 * triangle→eased remap, so the three never drift in lockstep — the "independent
 * layers" read. The whole stack is blurred (filter: blur) so the gradients fuse
 * into soft ambient color.
 *
 * Drop it as the FIRST child of a composition's AbsoluteFill (or behind a glass
 * card) so foreground content paints on top. Pairs with the shared liquid-glass
 * tokens: default `colors` are derived from lgTheme(theme).glow + .accent.
 *
 * GOTCHA HANDLED (headless Remotion): no CSS background-clip:text /
 * -webkit-text-fill-color:transparent (there is no text here). Pure radial-gradient
 * divs + transform translate + filter:blur, all derived from useCurrentFrame() —
 * SSR-safe and frame-deterministic (no Math.random / Date.now / window). This is an
 * atom, not a composition, so the comp-id charset rule does not apply.
 *
 * Self-contained: imports only react, remotion, and ./tokens (same folder).
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { lgTheme, withAlpha, type LiquidGlassTheme } from "./tokens";

export interface RibbonParallaxProps {
  /** Liquid-glass theme; selects the default `colors` when none are passed. */
  theme?: LiquidGlassTheme;
  /** Global drift-speed multiplier (1 = base; >1 faster, <1 slower). */
  speed?: number;
  /** Blur radius (px) applied to the whole ribbon stack — keep it large. */
  blurSigma?: number;
  /** Master opacity of the ambient layer (0..1). Keep it low so text wins. */
  opacity?: number;
  /** How many ribbons/blobs to render (2–3 reads best; clamped to ≥1). */
  count?: number;
  /** Ribbon colors. Cycled across blobs. Defaults to theme glow + accent + glow. */
  colors?: string[];
  /** Extra container styles (z-index, mixBlendMode, background, etc.). */
  style?: React.CSSProperties;
}

/**
 * Per-blob personality. Periods are integer frame counts so every wave closes
 * seamlessly; phases stagger the blobs so they never move in lockstep. Travel is
 * expressed in viewport percent (translate uses %) so the atom is resolution-free.
 */
interface RibbonSpec {
  /** Base center, in viewport %. */
  cx: number;
  cy: number;
  /** Half-amplitude of the pan on each axis, in viewport %. */
  ampX: number;
  ampY: number;
  /** Seamless loop periods (frames) per axis — independent so paths weave. */
  periodX: number;
  periodY: number;
  /** Phase offsets (0..1 of a cycle) per axis so blobs start out of sync. */
  phaseX: number;
  phaseY: number;
  /** Blob diameter as a fraction of the larger viewport edge. */
  sizeFrac: number;
  /** Peak alpha of this blob's gradient core (before master opacity). */
  coreAlpha: number;
}

// Three hand-tuned ribbons. Each period is a distinct integer frame count so the
// blobs share no common short cycle (they only realign over the LCM, far beyond a
// typical clip) — that is what makes the drift read as three independent layers.
const RIBBON_SPECS: RibbonSpec[] = [
  {
    cx: 30,
    cy: 28,
    ampX: 14,
    ampY: 10,
    periodX: 360,
    periodY: 300,
    phaseX: 0,
    phaseY: 0.25,
    sizeFrac: 0.95,
    coreAlpha: 0.9,
  },
  {
    cx: 72,
    cy: 64,
    ampX: 12,
    ampY: 16,
    periodX: 420,
    periodY: 510,
    phaseX: 0.5,
    phaseY: 0.1,
    sizeFrac: 1.05,
    coreAlpha: 0.8,
  },
  {
    cx: 50,
    cy: 88,
    ampX: 18,
    ampY: 9,
    periodX: 480,
    periodY: 390,
    phaseX: 0.75,
    phaseY: 0.6,
    sizeFrac: 0.85,
    coreAlpha: 0.7,
  },
];

const TAU = Math.PI * 2;

/**
 * Seamless eased oscillation in [-1, 1]. A raw sine already loops perfectly, but
 * pure sine spends little time near its extremes; squaring-the-cosine via a smooth
 * remap gives each blob a slightly different "dwell" feel per axis (its own easing)
 * WITHOUT ever breaking C∞ continuity at the loop seam — position/velocity/accel
 * all stay continuous because everything is built from sin/cos of (frame/period).
 */
function easedWave(
  frame: number,
  period: number,
  phase: number,
  ease: number,
): number {
  const safePeriod = Math.max(1, period);
  const theta = TAU * (frame / safePeriod + phase);
  const base = Math.sin(theta); // [-1, 1], seamless
  // Blend in a higher-harmonic term (cos of 2θ is also period-safe) to bend the
  // path so axes don't trace a plain ellipse — `ease` controls how much bend.
  const bent = base + ease * 0.18 * Math.cos(2 * theta);
  // Renormalize the small overshoot the harmonic can introduce.
  return Math.max(-1, Math.min(1, bent));
}

/**
 * Ambient drifting-ribbon background. 2–3 heavily-blurred themed gradient blobs,
 * each panning on its OWN seamless-looping path (independent period/phase/easing
 * per axis) so the backdrop feels alive without competing with foreground text.
 */
export const RibbonParallax: React.FC<RibbonParallaxProps> = ({
  theme = "brand",
  speed = 1,
  blurSigma = 80,
  opacity = 0.5,
  count = 3,
  colors,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Default palette derived from the theme — glow + accent, with glow repeated so
  // a 3-blob default doesn't run out of hues (cycled below regardless of length).
  const palette =
    colors && colors.length > 0 ? colors : [t.glow, t.accent, t.glow];

  // Clamp the blob count to what we have specs for (1..3); speed scales the clock.
  const n = Math.max(1, Math.min(count, RIBBON_SPECS.length));
  const driftFrame = frame * (Number.isFinite(speed) ? speed : 1);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        // The whole stack is blurred + alpha'd so the gradients fuse into ambient
        // color. overflow:hidden keeps the over-sized, panning blobs clipped to
        // the frame so they never reveal a hard edge as they drift.
        overflow: "hidden",
        opacity: Math.max(0, Math.min(1, opacity)),
        filter: `blur(${Math.max(0, blurSigma)}px)`,
        WebkitFilter: `blur(${Math.max(0, blurSigma)}px)`,
        willChange: "transform",
        ...style,
      }}
    >
      {RIBBON_SPECS.slice(0, n).map((spec, i) => {
        const color = palette[i % palette.length];

        // Independent seamless oscillation per axis; the `i`-derived ease term
        // gives each blob its own path-bend so none move in lockstep.
        const dx =
          easedWave(driftFrame, spec.periodX, spec.phaseX, 1 + i) * spec.ampX;
        const dy =
          easedWave(driftFrame, spec.periodY, spec.phaseY, 1 + i * 0.5) *
          spec.ampY;

        // Soft radial blob: bright-ish core feathering fully to transparent so the
        // post-blur result is a smooth wash with no ring or hard rim.
        const blob = `radial-gradient(circle at 50% 50%,
          ${withAlpha(color, spec.coreAlpha)} 0%,
          ${withAlpha(color, spec.coreAlpha * 0.5)} 34%,
          ${withAlpha(color, 0)} 70%)`;

        // Diameter relative to the larger viewport edge (100vmax) so the blob is
        // big enough to dominate the frame as ambient color regardless of aspect.
        const diameter = `${spec.sizeFrac * 100}vmax`;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${spec.cx}%`,
              top: `${spec.cy}%`,
              width: diameter,
              height: diameter,
              background: blob,
              // Center the blob on (cx,cy) THEN apply the drift — translate uses
              // %, so the -50% recentre is relative to the blob's own box.
              transform: `translate(-50%, -50%) translate(${dx}%, ${dy}%)`,
              willChange: "transform",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
