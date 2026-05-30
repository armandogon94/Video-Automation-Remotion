/**
 * staggeredCascade — accelerating per-item stagger for lists / grids / chips.
 *
 * Wave-4 Carlos V4 finding (top utility #3): "List items don't all use the same stagger.
 * The 5-hooks list appears to use a slightly accelerating cascade (later rows arrive
 * faster), so the eye doesn't get bored waiting for row 5."
 *
 * Linear stagger feels mechanical at row 5+. Accelerate by reducing the per-item
 * delay as `index` grows, so the last item lands within the readable window.
 */

export interface StaggerOptions {
  /** Index of this item in the list (0-based). */
  index: number;
  /** Starting frame for the FIRST item (index 0). */
  baseStartFrame?: number;
  /** Per-item stagger in frames (constant if `accelerate=false`). Default 3 frames (~100ms). */
  staggerFrames?: number;
  /**
   * If true, later items arrive proportionally faster.
   * The Nth item enters at: `base + sum_{i=0..N-1}(stagger * decay^i)`.
   * Decay default 0.85 (slight acceleration).
   */
  accelerate?: boolean;
  /** Acceleration decay factor when `accelerate=true`. Default 0.85. */
  decay?: number;
}

/**
 * Get the entry frame for an item in a staggered cascade.
 *
 *   for (const [i, item] of items.entries()) {
 *     const enter = staggerEntry({ index: i, baseStartFrame: 30, accelerate: true });
 *     // Use `enter` as the `from` prop on a <Sequence> or as the input to a spring().
 *   }
 */
export function staggerEntry(opts: StaggerOptions): number {
  const {
    index,
    baseStartFrame = 0,
    staggerFrames = 3,
    accelerate = true,
    decay = 0.85,
  } = opts;

  if (index <= 0) return baseStartFrame;

  if (!accelerate) return baseStartFrame + index * staggerFrames;

  // Accelerating cascade: sum of geometric series with ratio = decay.
  // Σ_{i=0..N-1} stagger * decay^i  =  stagger * (1 - decay^N) / (1 - decay).
  const sum = staggerFrames * ((1 - Math.pow(decay, index)) / (1 - decay));
  return baseStartFrame + Math.round(sum);
}

/**
 * Convenience: build an array of entry frames for N items.
 */
export function staggerSchedule(
  count: number,
  opts: Omit<StaggerOptions, "index"> = {},
): number[] {
  return Array.from({ length: count }, (_, i) =>
    staggerEntry({ ...opts, index: i }),
  );
}
