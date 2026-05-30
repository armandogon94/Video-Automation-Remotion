/**
 * Named easing curves for animation interpolation.
 *
 * Motion-design rationale (Mt. Mograph, "Easing (Motion Design Techniques)"):
 *
 *   "if there's one motion design technique that applies to everything its easing.
 *    that's what gives objects their wobble their bounce and makes rigid lifeless
 *    animations like this feel more natural and real"
 *
 *   "objects in the real world don't move like this weight inertia and resistance
 *    all influence everything around us and so to make our animations feel more
 *    natural and more real we need to emulate what these forces might do to our
 *    graph this is where the power of easing comes in"
 *
 * Cited from R6 transcripts synthesis (`docs/research/wave-1/R6-transcripts-synthesis.md`,
 * Insight 1). Easing is the single biggest "looks AI" tell — replace inline cubics and
 * `Easing.bezier(...)` calls with these named curves so every keyframe in the brand
 * speaks the same motion vocabulary.
 *
 * All functions take `t ∈ [0, 1]` and return a value in `[0, 1]` (or slightly beyond
 * for `outBack`, by design — that's the overshoot). Pass the OUTPUT of these functions
 * into `interpolate(easedT, [0, 1], [from, to])` rather than calling `interpolate` with
 * an `easing:` option, so the curve is explicit at the call site.
 */

/**
 * Cubic ease-out — `1 - (1 - t)^3`.
 *
 * Decelerating curve: fast start, slow finish. The brand's default editorial
 * settle for elements that "land" (bar fills, count-ups, marker draws). Replaces
 * the inline `1 - Math.pow(1 - t, 3)` pattern that was duplicated across multiple
 * compositions.
 */
export function outCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * In-out cubic — symmetric S-curve.
 *
 * Slow start, fast middle, slow finish. Use for full-loop transitions where the
 * element both accelerates AND decelerates (camera moves, value scrubs, scroll
 * sweeps). Default recommended by R6 for non-spring interpolations.
 */
export function inOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Back ease-out — overshoots past 1 then settles.
 *
 * Use sparingly: chip pop-ins, badge stamps, "stamp" moments. The `overshoot`
 * parameter (default `1.70158`, the standard Penner value) controls how far past
 * 1 the curve travels (~10% overshoot at default). Higher = more bouncy.
 */
export function outBack(t: number, overshoot = 1.70158): number {
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Quartic ease-out — `1 - (1 - t)^4`.
 *
 * Carlos V4 prescription for count-up ramps and bar fills:
 *   "Numbers tween via easeOutQuart, value bouncing very slightly at the end."
 * Sits between `outCubic` (gentler) and `outQuint` (sharper). The signature
 * curve for any animated value that lands on a syllable.
 */
export function outQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Quintic ease-out — `1 - (1 - t)^5`.
 *
 * Sharper deceleration than `outQuart`. Use for fast snap-finish moments where
 * you want most of the motion in the first 30% of the timeline (text settles,
 * lower-third reveals).
 */
export function outQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Exponential ease-out — `1 - 2^(-10t)`.
 *
 * Even sharper than `outQuint` — almost all motion is front-loaded. Use for
 * "shot fired" reveals (cuts where the element should already be there by the
 * time the eye notices). Clamped at `t === 1` to return exactly 1.
 */
export function outExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Linear — `t`. No easing.
 *
 * Exported by name so call sites can say "I deliberately want linear motion"
 * rather than passing `Easing.linear` (which is the visual signature R6's
 * Insight 1 warns against). Use ONLY for: progress bars that show literal
 * elapsed time, audio waveforms, anything that represents a real-world clock.
 */
export function linear(t: number): number {
  return t;
}
