/**
 * PaginatedListSlide — Hormozi consensus pattern H3 ("PaginatedListSlideTransition").
 *
 * Wave-6 longform consensus synthesis
 * (`docs/research/wave-6/alexhormozi-longform-consensus.md` — pattern H3) and
 * frame evidence at
 * `references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/anim-04-*.jpg`.
 * Reference clips:
 *   - `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-04.mp4`
 *   - `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-04-v2.mp4`
 *   - `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-05-v2.mp4`
 *
 * Choreography contract (Wave-5 `transitionVerb`):
 *
 *   "Each list page slides up from below into position over 14 frames using
 *    outCubic, holds 60 frames settled, then continues sliding up out the top
 *    over 14 frames as the next page concurrently slides up from below."
 *
 * The hallmark of H3 is that the outgoing card AND the incoming card are both
 * in motion at the crossover frame — both are briefly visible at the same time
 * (the outgoing card half-off the top, the incoming card half-on the bottom).
 * This is the "scrolling-deck" feel Hormozi uses to paginate listicles and
 * stat dumps in his longform videos.
 *
 * This is a CHOREOGRAPHY WRAPPER (a molecule), not a render of any specific
 * card style — pass in any `React.ReactNode` per page (`SocialPostCard`,
 * `NumberedBadge`, a custom layout, etc.) and the wrapper handles the
 * page-to-page slide-up cadence.
 *
 * Sibling molecule for context: `NotificationToast` uses a similar
 * enter-hold-exit shape but with overshoot springs; this molecule prefers
 * deterministic `interpolate()` + named easing because the page-to-page
 * concurrency window is exactly aligned between the outgoing exit ramp and
 * the incoming entry ramp.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { inOutCubic, outCubic, outQuart } from "../timing/easing";

export type PaginationDirection = "up" | "down";

export interface PaginatedListSlideEntry {
  /** Content for this page — any React node (a SocialPostCard, a numbered
   *  card, a custom layout, etc). */
  content: React.ReactNode;
  /** Optional override: how many frames this page stays "settled" before the
   *  next begins entering. Falls back to the wrapper-level `visibleFrames`. */
  visibleFrames?: number;
}

export interface PaginatedListSlideProps {
  /** Array of slide entries to paginate through. */
  slides: PaginatedListSlideEntry[];
  /** First-slide entry frame (relative to the parent Sequence). Default 0. */
  startFrame?: number;
  /** Frames each slide takes to slide into position. Default 14. */
  slideInFrames?: number;
  /** Frames each slide holds settled. Default 60 (2 sec at 30fps). */
  visibleFrames?: number;
  /** Frames the outgoing slide takes to leave (concurrent with next slide's
   *  entry). Default 14. */
  slideOutFrames?: number;
  /** Direction of motion. Default 'up' (Hormozi default — outgoing exits to
   *  top, incoming arrives from bottom). */
  direction?: PaginationDirection;
  /** Translation distance (px). Default 200. */
  translateDistancePx?: number;
  /** Easing for the slide. Default 'outCubic'. */
  easing?: "outCubic" | "outQuart" | "inOutCubic";
  /** Whether to crossfade slides at the crossover frame (default true). The
   *  H3 reference clips show both pages fully opaque during the swap, but a
   *  brief crossfade reads as cleaner at lower resolutions. */
  crossfade?: boolean;
  /** Whether the slides loop after the last one. Default false. */
  loop?: boolean;
  /** Canvas width for layout. Default 1080 (use 1920 for 16:9). */
  canvasWidthPx?: number;
  /** Canvas height. Default 1920 (use 1080 for 16:9). */
  canvasHeightPx?: number;
}

type EasingName = NonNullable<PaginatedListSlideProps["easing"]>;

type SlidePhase = "pre" | "entering" | "settled" | "exiting" | "past";

interface SlideTimeline {
  /** Index of the slide in the input array. */
  index: number;
  /** Frame this slide starts sliding in. */
  enterFrame: number;
  /** Frame the slide is fully settled. */
  settledFrame: number;
  /** Frame this slide starts sliding out (concurrent with the next slide's
   *  entry). For the last slide (when `loop=false`) this equals
   *  `settledFrame + visibleFrames`. */
  exitFrame: number;
  /** Frame the slide is fully off-screen. */
  goneFrame: number;
  /** Frames this slide holds settled. */
  visibleFrames: number;
}

interface SlideState {
  phase: SlidePhase;
  /** Progress 0..1 during `entering` / `exiting`; 0 or 1 otherwise. */
  progress: number;
}

function applyEasing(t: number, name: EasingName): number {
  switch (name) {
    case "outQuart":
      return outQuart(t);
    case "inOutCubic":
      return inOutCubic(t);
    case "outCubic":
    default:
      return outCubic(t);
  }
}

/**
 * Build the timeline for every slide. Each slide's exit ramp is EXACTLY
 * concurrent with the next slide's entry ramp — that's the "both visible at
 * crossover" property the H3 pattern requires.
 *
 * Visually:
 *
 *   slide 0: |--enter--|----settled----|--exit--|
 *   slide 1:                           |--enter--|----settled----|--exit--|
 *   slide 2:                                                     |--enter--|...
 *                                      ^ crossover frame
 *
 * The exit window is `slideOutFrames` long. The next slide's entry window is
 * `slideInFrames` long. They start at the same frame (the "crossover" frame).
 * If `slideOutFrames === slideInFrames` (the default 14/14) the two ramps end
 * on the same frame as well.
 */
function buildTimeline(
  slides: PaginatedListSlideEntry[],
  opts: {
    startFrame: number;
    slideInFrames: number;
    visibleFrames: number;
    slideOutFrames: number;
    loop: boolean;
  },
): SlideTimeline[] {
  const { startFrame, slideInFrames, slideOutFrames, loop } = opts;
  const timeline: SlideTimeline[] = [];

  let cursor = startFrame;
  for (let i = 0; i < slides.length; i++) {
    const visibleFrames = slides[i].visibleFrames ?? opts.visibleFrames;
    const enterFrame = cursor;
    const settledFrame = enterFrame + slideInFrames;
    // Next slide begins entering at `settledFrame + visibleFrames`. This
    // slide's exit ramp shares that same start frame.
    const exitFrame = settledFrame + visibleFrames;
    const isLast = i === slides.length - 1;
    const goneFrame =
      isLast && !loop ? exitFrame : exitFrame + slideOutFrames;

    timeline.push({
      index: i,
      enterFrame,
      settledFrame,
      exitFrame,
      goneFrame,
      visibleFrames,
    });

    // Advance the cursor to the next slide's enter frame (== this slide's
    // exit frame). That's what makes the entry and exit ramps concurrent.
    cursor = exitFrame;
  }

  return timeline;
}

function computeState(frame: number, t: SlideTimeline, isLastNoLoop: boolean): SlideState {
  if (frame < t.enterFrame) return { phase: "pre", progress: 0 };
  if (frame < t.settledFrame) {
    const progress = (frame - t.enterFrame) / Math.max(1, t.settledFrame - t.enterFrame);
    return { phase: "entering", progress };
  }
  if (frame < t.exitFrame) return { phase: "settled", progress: 1 };
  // The very last slide (no loop) never exits — it stays settled past
  // `exitFrame` because there's nothing to push it out.
  if (isLastNoLoop) return { phase: "settled", progress: 1 };
  if (frame < t.goneFrame) {
    const progress = (frame - t.exitFrame) / Math.max(1, t.goneFrame - t.exitFrame);
    return { phase: "exiting", progress };
  }
  return { phase: "past", progress: 1 };
}

/**
 * Compute the visual offset (translateY in px) for a slide given its state.
 *
 * For `direction: 'up'`:
 *   - entering: starts BELOW the viewport (+translateDistancePx) and rises to 0
 *   - settled: 0
 *   - exiting: continues rising — from 0 to -translateDistancePx (off the top)
 *
 * For `direction: 'down'` the signs are mirrored.
 */
function computeTranslateY(
  state: SlideState,
  direction: PaginationDirection,
  translateDistancePx: number,
  easedEnterT: number,
  easedExitT: number,
): number {
  const sign = direction === "up" ? 1 : -1;
  if (state.phase === "pre") return sign * translateDistancePx;
  if (state.phase === "entering") {
    // 0 → 1 means moving from +distance (or -distance for 'down') TO 0.
    return interpolate(easedEnterT, [0, 1], [sign * translateDistancePx, 0]);
  }
  if (state.phase === "settled") return 0;
  if (state.phase === "exiting") {
    // 0 → 1 means moving from 0 TO -distance (or +distance for 'down').
    return interpolate(easedExitT, [0, 1], [0, -sign * translateDistancePx]);
  }
  return -sign * translateDistancePx;
}

/**
 * Opacity policy:
 *   - `pre` / `past` → 0 (the slide does not render at all in those phases,
 *     so this is mostly defensive)
 *   - `entering` / `settled` / `exiting` → 1 by default
 *   - When `crossfade=true`, `entering` ramps 0 → 1 and `exiting` ramps 1 → 0
 *     over their respective windows, so the crossover frame shows both pages
 *     at ~50% opacity instead of stacked solid.
 */
function computeOpacity(
  state: SlideState,
  crossfade: boolean,
  easedEnterT: number,
  easedExitT: number,
): number {
  if (state.phase === "pre" || state.phase === "past") return 0;
  if (!crossfade) return 1;
  if (state.phase === "entering") {
    return interpolate(easedEnterT, [0, 1], [0, 1]);
  }
  if (state.phase === "exiting") {
    return interpolate(easedExitT, [0, 1], [1, 0]);
  }
  return 1;
}

export const PaginatedListSlide: React.FC<PaginatedListSlideProps> = ({
  slides,
  startFrame = 0,
  slideInFrames = 14,
  visibleFrames = 60,
  slideOutFrames = 14,
  direction = "up",
  translateDistancePx = 200,
  easing = "outCubic",
  crossfade = true,
  loop = false,
  canvasWidthPx = 1080,
  canvasHeightPx = 1920,
}) => {
  const frame = useCurrentFrame();

  // Empty list — render nothing. Compositions that pass a dynamic list might
  // hit this transiently while their props resolve.
  if (slides.length === 0) return null;

  // Build the timeline once per render. Cheap (O(n) on the slide count).
  const timeline = buildTimeline(slides, {
    startFrame,
    slideInFrames,
    visibleFrames,
    slideOutFrames,
    loop,
  });

  // Loop handling: when `loop=true`, we treat the global frame as cycling
  // through the full sequence length. The cleanest way to implement loop is
  // to compute the total cycle length and re-map the frame into the first
  // cycle. Subsequent cycles are visually identical so we don't need to
  // re-build the timeline.
  let effectiveFrame = frame;
  if (loop) {
    const lastTimeline = timeline[timeline.length - 1];
    // Cycle length is from startFrame to the moment the last slide is gone
    // (which is `exitFrame + slideOutFrames` when looping).
    const cycleLength = lastTimeline.exitFrame + slideOutFrames - startFrame;
    if (cycleLength > 0 && frame >= startFrame) {
      effectiveFrame = startFrame + ((frame - startFrame) % cycleLength);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: canvasWidthPx,
        height: canvasHeightPx,
        overflow: "hidden",
      }}
    >
      {timeline.map((t) => {
        const isLastNoLoop = t.index === timeline.length - 1 && !loop;
        const state = computeState(effectiveFrame, t, isLastNoLoop);

        // Performance: only render slides currently visible (during their
        // entering/settled/exiting phases). Hormozi-style H3 has at most 2
        // slides in the DOM at any time (the outgoing one and the incoming
        // one during a crossover frame).
        if (state.phase === "pre" || state.phase === "past") return null;

        // Compute progress through ENTER and EXIT ramps separately so the
        // crossover frame (where one slide is in `exiting` and the next is
        // in `entering`) gets two independent eased values. `pre` and `past`
        // were already filtered out above, so for the remaining phases
        // (entering / settled / exiting) the enter ramp is fully complete
        // (== 1) once the slide is past `entering`.
        const enterT = state.phase === "entering" ? state.progress : 1;
        const exitT = state.phase === "exiting" ? state.progress : 0;

        const easedEnterT = applyEasing(enterT, easing);
        const easedExitT = applyEasing(exitT, easing);

        const translateY = computeTranslateY(
          state,
          direction,
          translateDistancePx,
          easedEnterT,
          easedExitT,
        );
        const opacity = computeOpacity(state, crossfade, easedEnterT, easedExitT);

        return (
          <div
            key={t.index}
            data-paginated-slide-index={t.index}
            data-paginated-slide-phase={state.phase}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: canvasWidthPx,
              height: canvasHeightPx,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${translateY}px)`,
              opacity,
              // overflow: visible so the slide's own decorations (shadows,
              // protruding badges) aren't clipped by the slot. Outer
              // wrapper's overflow:hidden still clips against the canvas.
              overflow: "visible",
              willChange: "transform, opacity",
            }}
          >
            {slides[t.index].content}
          </div>
        );
      })}
    </div>
  );
};
