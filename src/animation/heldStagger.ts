/**
 * heldStagger — per-index reveal with EXPLICIT DWELL BEATS between items.
 *
 * Wave-5 Tella synthesis #T3 (Hormozi/Klaus ranked-tier listicle):
 *   "List items appear bottom-to-top, each tier with a slight rest beat before the
 *    next slides in — not a flat stagger."
 *
 * Difference vs `staggeredCascade.ts` (Carlos V4 finding):
 *   - staggeredCascade: continuous stagger — each item enters as soon as it's its turn.
 *     Good for short lists (3-5) where the eye should "scan" all items quickly.
 *   - heldStagger: discrete tiers — each item enters, then HOLDS for N frames before the
 *     next one starts. Good for ranked tiers, notification cascades, dramatic reveals.
 *
 * Usage:
 *
 *   const schedule = heldStaggerSchedule({
 *     count: items.length,
 *     baseStartFrame: 30,
 *     revealFrames: 10,
 *     holdFrames: 14,
 *   });
 *   // schedule[i] = { enterFrame, settledFrame, exitFrame? }
 *
 *   const state = heldStaggerState({ frame, index: i, ...same opts });
 *   // { phase: 'pre' | 'entering' | 'held' | 'past', progress: 0..1 }
 */

export interface HeldStaggerOptions {
  /** Frame at which item 0 begins entering. */
  baseStartFrame?: number;
  /** Frames the entry animation takes (per item). Default 10 (~333ms). */
  revealFrames?: number;
  /** Hold time after an item settles before the next one begins entering. Default 14. */
  holdFrames?: number;
}

export interface HeldStaggerEntry {
  /** Frame at which this item's entry animation starts. */
  enterFrame: number;
  /** Frame at which the entry completes (the dwell begins). */
  settledFrame: number;
  /** Frame at which the NEXT item's entry begins (also when this item's dwell ends). */
  nextEnterFrame: number;
}

export interface HeldStaggerOptionsForIndex extends HeldStaggerOptions {
  index: number;
}

/**
 * Compute the schedule for `count` items.
 */
export function heldStaggerSchedule(
  opts: { count: number } & HeldStaggerOptions,
): HeldStaggerEntry[] {
  const { count, baseStartFrame = 0, revealFrames = 10, holdFrames = 14 } = opts;
  const step = revealFrames + holdFrames;
  return Array.from({ length: count }, (_, i) => {
    const enterFrame = baseStartFrame + i * step;
    return {
      enterFrame,
      settledFrame: enterFrame + revealFrames,
      nextEnterFrame: enterFrame + step,
    };
  });
}

/**
 * Get the entry frame for a single index.
 */
export function heldStaggerEntry(opts: HeldStaggerOptionsForIndex): number {
  const { index, baseStartFrame = 0, revealFrames = 10, holdFrames = 14 } = opts;
  return baseStartFrame + index * (revealFrames + holdFrames);
}

export type HeldStaggerPhase = "pre" | "entering" | "held" | "past";

export interface HeldStaggerState {
  phase: HeldStaggerPhase;
  /** Progress 0..1 — only meaningful during "entering" (else 0 or 1). */
  progress: number;
  /** True while the item is locked in (dwell beat) — useful for "freeze this frame" effects. */
  isHeld: boolean;
}

/**
 * Compute the current phase for an item at a given frame.
 *
 * Use the `progress` value as input to an `interpolate()` or your spring.
 * Use `isHeld` to gate any per-frame animation (e.g. suppress parallax during a dwell).
 */
export function heldStaggerState(
  opts: HeldStaggerOptionsForIndex & { frame: number },
): HeldStaggerState {
  const { frame, index, baseStartFrame = 0, revealFrames = 10, holdFrames = 14 } = opts;
  const enterFrame = baseStartFrame + index * (revealFrames + holdFrames);
  const settledFrame = enterFrame + revealFrames;
  // The dwell ends only when ALL subsequent items have entered — but practically
  // we mark "past" once the NEXT item's entry has begun (so this item finishes
  // its visual hold while sibling enters).
  const dwellEnd = settledFrame + holdFrames;

  if (frame < enterFrame) return { phase: "pre", progress: 0, isHeld: false };
  if (frame < settledFrame) {
    return {
      phase: "entering",
      progress: (frame - enterFrame) / Math.max(1, revealFrames),
      isHeld: false,
    };
  }
  if (frame < dwellEnd) {
    return { phase: "held", progress: 1, isHeld: true };
  }
  return { phase: "past", progress: 1, isHeld: false };
}
