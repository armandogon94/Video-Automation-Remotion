/**
 * blurInFocus — the dominant entry move in the Carlos corpus.
 *
 * Wave-4 Carlos V4 finding (top utility #1):
 *   "Blur-in-from-defocus is the dominant entry move. Caught in the act on multiple
 *    reel openers. Duration ~280 ms, blur 14→0 px + small scale 0.96→1, soft ease-out."
 *
 * Returns the three CSS-applicable values: blur (in px), opacity, and scale.
 * Apply via a single `filter: blur(...)` + `transform: scale(...)` + `opacity` style.
 */
import { interpolate } from "remotion";
import { outCubic } from "../timing/easing";

export interface BlurInFocusOptions {
  /** Current frame (inside whatever sequence reference frame the caller has). */
  frame: number;
  /** Frame at which the entry begins (default 0). */
  startFrame?: number;
  /** Duration in frames (default 8 frames at 30fps = ~270ms). */
  durationFrames?: number;
  /** Starting blur in px (default 14). */
  startBlurPx?: number;
  /** Starting scale (default 0.96). */
  startScale?: number;
}

export interface BlurInFocusValues {
  blurPx: number;
  opacity: number;
  scale: number;
  /** Ready-to-use `filter` value (e.g. "blur(7.2px)"). */
  filter: string;
  /** Ready-to-use `transform` value (e.g. "scale(0.98)"). */
  transform: string;
}

export function blurInFocus(opts: BlurInFocusOptions): BlurInFocusValues {
  const {
    frame,
    startFrame = 0,
    durationFrames = 8,
    startBlurPx = 14,
    startScale = 0.96,
  } = opts;
  const raw = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t = outCubic(raw);
  const blurPx = startBlurPx * (1 - t);
  const opacity = t;
  const scale = startScale + (1 - startScale) * t;
  return {
    blurPx,
    opacity,
    scale,
    filter: `blur(${blurPx.toFixed(2)}px)`,
    transform: `scale(${scale.toFixed(4)})`,
  };
}
