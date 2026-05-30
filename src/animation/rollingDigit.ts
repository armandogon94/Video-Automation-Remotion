/**
 * rollingDigit — frame-over-frame digit roll for HUD telemetry.
 *
 * Wave-4 Bilawal V4 #1 finding ("HUD telemetry illusion"):
 *   "Every static-looking info element actually ticks frame-over-frame even when
 *    the underlying clip is held. RNG 15→14→14→13→12 NM at roughly 1 unit per
 *    1.5 s. It is the difference between a screenshot and a heartbeat."
 *
 * Difference vs `countUp`: `countUp` smoothly interpolates the NUMERIC VALUE.
 * `rollingDigit` returns a DISCRETE INTEGER value that steps at intervals you set,
 * with optional jitter so it never holds the same number twice in a row.
 *
 * For datestamps that scrub forward over the reel, use `rollingDate`.
 */
import { interpolate } from "remotion";

export interface RollingDigitOptions {
  /** Current frame. */
  frame: number;
  /** Frame the ticker starts (default 0). */
  startFrame?: number;
  /** Initial value at startFrame. */
  from: number;
  /** Final value at endFrame. */
  to: number;
  /** Frame the ticker ends (must be > startFrame). */
  endFrame: number;
  /** Step size in frames between integer updates (default 3 frames). */
  stepFrames?: number;
  /**
   * Optional jitter amplitude (±units). E.g. with jitter=2, a step that would
   * land on 14 might display 13/14/15 to feel "live." Default 0 (deterministic).
   */
  jitterAmplitude?: number;
  /** Deterministic seed for jitter — same `(frame, seed)` always returns same value. */
  seed?: number;
}

/**
 * FNV-1a 32-bit hash for deterministic jitter (no random allowed in renders).
 */
function fnv1a(input: number): number {
  let h = 0x811c9dc5;
  let n = Math.floor(input) | 0;
  for (let i = 0; i < 4; i++) {
    h ^= n & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
    n = n >>> 8;
  }
  return h;
}

export function rollingDigit(opts: RollingDigitOptions): number {
  const {
    frame,
    startFrame = 0,
    from,
    to,
    endFrame,
    stepFrames = 3,
    jitterAmplitude = 0,
    seed = 1,
  } = opts;

  // Quantize the frame to step boundaries so adjacent renders agree.
  const tickIndex = Math.max(0, Math.floor((frame - startFrame) / stepFrames));
  const ticksTotal = Math.max(
    1,
    Math.floor((endFrame - startFrame) / stepFrames),
  );
  const t = Math.min(1, tickIndex / ticksTotal);
  const baseValue = Math.round(from + (to - from) * t);

  if (jitterAmplitude === 0) return baseValue;

  const noise = fnv1a(tickIndex * 2654435761 + seed);
  const offset = (noise % (jitterAmplitude * 2 + 1)) - jitterAmplitude;
  return baseValue + offset;
}

/**
 * Rolling-date ticker — advance a date by N days/hours per frame range.
 *
 * Returns a JS Date — the caller formats with Intl.DateTimeFormat.
 */
export interface RollingDateOptions {
  frame: number;
  startFrame?: number;
  endFrame: number;
  /** ISO date string of the START of the range. */
  fromIso: string;
  /** ISO date string of the END of the range. */
  toIso: string;
}

export function rollingDate(opts: RollingDateOptions): Date {
  const { frame, startFrame = 0, endFrame, fromIso, toIso } = opts;
  const fromMs = new Date(fromIso).getTime();
  const toMs = new Date(toIso).getTime();
  const t = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return new Date(fromMs + (toMs - fromMs) * t);
}
