/**
 * handleWindows — SHARED validation/normalization for the intermittent
 * handle-chip windows (owner decision, DOGFOOD-PLAYBOOK §9.3).
 *
 * Sol 2026-07-16 §3.1 overturned the twin scenes' raw handling: the schemas
 * accepted arbitrary numbers (no integers, no non-negative start, no
 * `toFrame > fromFrame`), rendering silently clamped invalid/reversed windows
 * to a 1-frame flash whose fade math produced ZERO opacity, and coincident
 * windows double-mounted (darkened) the same chip. Both scene twins also
 * carried byte-identical copies of the logic, guaranteeing divergence.
 *
 * This module is the ONE home for that logic:
 *   - `handleWindowsSchema` — the zod fragment both twins embed (ints, ≥ 0).
 *   - `normalizeHandleWindows` — drop invalid windows loudly, sort, merge
 *     overlapping/touching windows, and enforce a minimum visible duration.
 *
 * Production wiring note: the EditPlan has no handle-cadence field yet, so the
 * planner cannot emit these windows — that wiring (owner default cadence ~3 s
 * every ~45 s + final 4 s) is QUEUED behind the EditPlan v2 contract
 * (SOL-0716-TRIAGE.md). Until then the scenes keep the persistent chip when
 * `handleWindows` is absent.
 */
import { z } from "zod";

/** One scene-local appearance window for the handle chip. */
export interface HandleWindow {
  fromFrame: number;
  toFrame: number;
}

/** Zod fragment shared by both scene twins: integer, non-negative frames.
 *  Ordering/overlap is normalized at render time (`normalizeHandleWindows`)
 *  rather than rejected at parse time, so a sloppy caller degrades loudly
 *  instead of failing the whole render. */
export const handleWindowsSchema = z
  .array(
    z.object({
      fromFrame: z.number().int().nonnegative(),
      toFrame: z.number().int().nonnegative(),
    }),
  )
  .optional();

/** Minimum visible window (frames). Below this the chip is a subliminal flash
 *  and the ~10-frame fade in/out math degenerates (a 1-frame window rendered
 *  at zero opacity — Sol §3.1). 8 frames ≈ 0.27 s @ 30fps. */
export const MIN_HANDLE_WINDOW_FRAMES = 8;

/**
 * Normalize a raw window list into a safe, render-ready one:
 *   1. DROP (with a console.warn) windows that are non-finite, negative-start,
 *      or have `toFrame <= fromFrame`; fractional frames are rounded.
 *   2. SORT by `fromFrame`.
 *   3. MERGE overlapping or touching windows — coincident windows previously
 *      double-mounted the chip (duplicate/darkened rendering).
 *   4. DROP (with a console.warn) merged windows shorter than
 *      `MIN_HANDLE_WINDOW_FRAMES`.
 * Pure aside from the warnings; both scene twins call this so their behavior
 * cannot diverge.
 */
export function normalizeHandleWindows(windows: HandleWindow[]): HandleWindow[] {
  const valid: HandleWindow[] = [];
  for (const w of windows) {
    if (
      !Number.isFinite(w.fromFrame) ||
      !Number.isFinite(w.toFrame) ||
      w.fromFrame < 0 ||
      w.toFrame <= w.fromFrame
    ) {
      console.warn(
        `[handleWindows] dropping invalid window fromFrame=${w.fromFrame} ` +
          `toFrame=${w.toFrame} (need finite, non-negative integers with ` +
          `toFrame > fromFrame)`,
      );
      continue;
    }
    valid.push({ fromFrame: Math.round(w.fromFrame), toFrame: Math.round(w.toFrame) });
  }

  valid.sort((a, b) => a.fromFrame - b.fromFrame);

  const merged: HandleWindow[] = [];
  for (const w of valid) {
    const last = merged[merged.length - 1];
    if (last && w.fromFrame <= last.toFrame) {
      // Overlapping or touching → one continuous appearance.
      last.toFrame = Math.max(last.toFrame, w.toFrame);
    } else {
      merged.push({ ...w });
    }
  }

  return merged.filter((w) => {
    const dur = w.toFrame - w.fromFrame;
    if (dur < MIN_HANDLE_WINDOW_FRAMES) {
      console.warn(
        `[handleWindows] dropping ${dur}-frame window [${w.fromFrame},${w.toFrame}) — ` +
          `below the ${MIN_HANDLE_WINDOW_FRAMES}-frame minimum visible duration ` +
          `(a shorter chip is an invisible flash; Sol 0716 §3.1)`,
      );
      return false;
    }
    return true;
  });
}
