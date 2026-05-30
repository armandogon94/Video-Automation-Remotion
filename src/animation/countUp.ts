/**
 * countUp — animated number ramp (the only way numbers should ever appear).
 *
 * Wave-4 cross-creator HIGH-confidence finding:
 *  - Carlos V4: "Numbers are NEVER instant. Every number animates via a tween counter,
 *    frequently sync'd to a horizontal bar fill."
 *  - DIYSmart V2 M5: "Massive numeral count-up — number rolls up to final value during VO beat."
 *  - Bilawal V4 #1: "HUD telemetry illusion — every counter ticks frame-over-frame."
 *
 * Pair with `rollingDigitTicker` for HUD-style telemetry where digits should
 * appear to scroll (vs a tween that interpolates the numeric VALUE).
 */
import { interpolate } from "remotion";
import { outQuart, outCubic } from "../timing/easing";

export type CountUpEasing = "outQuart" | "outCubic" | "linear";

export interface CountUpOptions {
  /** Starting value (default 0). */
  from?: number;
  /** Final value. */
  to: number;
  /** Frame at which the ramp begins (default 0). */
  startFrame?: number;
  /** Duration of the ramp in frames (default ~24 frames at 30fps = 0.8s). */
  durationFrames?: number;
  /** Easing curve (default `outQuart` — Carlos V4 prescription). */
  easing?: CountUpEasing;
  /**
   * Decimal places to display. If omitted, returns the raw float (caller formats).
   * Set to 0 for integer counters (default behavior for counts/percentages).
   */
  decimals?: number;
}

/**
 * Compute the current displayed value at a given frame.
 *
 * Returns the raw number — the caller formats it (so we can support `$`, `%`, units, etc).
 */
export function countUp(frame: number, opts: CountUpOptions): number {
  const {
    from = 0,
    to,
    startFrame = 0,
    durationFrames = 24,
    easing = "outQuart",
  } = opts;
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const eased =
    easing === "linear" ? t : easing === "outCubic" ? outCubic(t) : outQuart(t);
  const value = from + (to - from) * eased;
  if (opts.decimals !== undefined) {
    const k = Math.pow(10, opts.decimals);
    return Math.round(value * k) / k;
  }
  return value;
}

/**
 * Format a count-up number with optional prefix/suffix + thousands separator.
 *
 *  formatCount(1234.5, { prefix: "$", decimals: 0, thousands: true }) -> "$1,235"
 *  formatCount(0.94, { suffix: "%", decimals: 0, scaleTo100: true })  -> "94%"
 */
export function formatCount(
  value: number,
  opts: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    thousands?: boolean;
    /** Multiply by 100 (use when `value` is a 0..1 fraction shown as a percent). */
    scaleTo100?: boolean;
  } = {},
): string {
  let v = opts.scaleTo100 ? value * 100 : value;
  if (opts.decimals !== undefined) {
    v = Number(v.toFixed(opts.decimals));
  }
  const integerFmt = opts.thousands ? v.toLocaleString("en-US") : String(v);
  return `${opts.prefix ?? ""}${integerFmt}${opts.suffix ?? ""}`;
}
