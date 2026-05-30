/**
 * useOverlayChoreography — shared scale-in + fade-in/fade-out hook for editorial overlays.
 *
 * Each `ChipScene`/`HugeScene`/`SubtitleScene`/`CtaScene` calls this hook to get a uniform
 * entry choreography. The hook returns `{ opacity, scale, scaleIn }`:
 *
 *   - `scaleIn`  — raw spring progress (0 → 1, lands by ~frame 18). Useful for downstream
 *                  micro-animations (e.g. underlines that draw on after the text lands).
 *   - `scale`    — eased scale value (0.86 → 1.00).
 *   - `opacity`  — min(fade-in over first 4 frames, fade-out over last 6 frames).
 *
 * When a scene is rendered INSIDE a TransitionSeries that handles its own crossfades, pass
 * `{ fadeMode: "in-group" }` to suppress the fade and let the outer transition own opacity.
 */
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export interface OverlayChoreography {
  opacity: number;
  scale: number;
  scaleIn: number;
}

export interface SpringProfile {
  damping: number;
  stiffness: number;
  mass: number;
}

/**
 * Punchy spring — TechNewsFlash chip/hero/subtitle/CTA "snap-in" DNA.
 * Used by the news-flash scenes via `useOverlayChoreography`'s default.
 * Wave-3 AA re-audit deliberately KEEPS this as the hook's default so the
 * TechNewsFlash chip doesn't visually regress.
 */
export const PUNCHY_SPRING: SpringProfile = {
  damping: 15,
  stiffness: 110,
  mass: 0.7,
};

/**
 * Editorial spring — calmer "Bloomberg" settle shared by DiagramExplainer,
 * BigNumberHero, QuoteCard9x16, BenchmarkBars title, TweetCardHero. Critically
 * damped — almost zero overshoot, slower arrival. Wave-3 AA re-audit (§"Top 5
 * still-outstanding" #2) named this the brand's editorial motion DNA.
 *
 * Editorial templates currently inline `{ damping: 22, stiffness: 130, mass: 0.7 }`
 * at their direct `spring()` call sites; this export gives them a single source
 * of truth so the profile can drift in one place if ever revisited.
 */
export const EDITORIAL_SPRING: SpringProfile = {
  damping: 22,
  stiffness: 130,
  mass: 0.7,
};

export interface UseOverlayChoreographyOpts {
  /** Total frames this scene is visible for (= durationInFrames of its Sequence). */
  durationFrames: number;
  /** "standalone" = manage opacity ourselves (default).
   *  "in-group"   = outer TransitionSeries owns opacity; we only scale-in. */
  fadeMode?: "standalone" | "in-group";
  /** Spring tuning. Defaults to PUNCHY_SPRING (the TechNewsFlash chip DNA).
   *  Pass `EDITORIAL_SPRING` here when this hook is reused from a calmer
   *  cream/dark composition. */
  spring?: { damping?: number; stiffness?: number; mass?: number };
}

export function useOverlayChoreography({
  durationFrames,
  fadeMode = "standalone",
  spring: springCfg,
}: UseOverlayChoreographyOpts): OverlayChoreography {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Default = PUNCHY_SPRING (chips/hero/subtitle/CTA TikTok-style snap-in).
  // Editorial templates that reuse this hook must explicitly pass EDITORIAL_SPRING
  // to opt into the calmer profile. Wave-3 AA re-audit (§"Top 5 still-outstanding"
  // #2) deliberately preserves the punchy default so the existing TechNewsFlash
  // chip behavior does not regress.
  const scaleIn = spring({
    frame,
    fps,
    config: {
      damping: springCfg?.damping ?? PUNCHY_SPRING.damping,
      stiffness: springCfg?.stiffness ?? PUNCHY_SPRING.stiffness,
      mass: springCfg?.mass ?? PUNCHY_SPRING.mass,
    },
  });
  const scale = interpolate(scaleIn, [0, 1], [0.86, 1.0]);

  if (fadeMode === "in-group") {
    return { opacity: 1, scale, scaleIn };
  }

  const fadeIn = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(0, durationFrames - 6), durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return { opacity, scale, scaleIn };
}
