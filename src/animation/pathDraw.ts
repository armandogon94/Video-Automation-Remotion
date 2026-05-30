/**
 * pathDraw — SVG stroke-dashoffset animator for L→R / center-out path reveals.
 *
 * Wave-5 Tella synthesis #T1 primitive (unlocks T5 connectors, T7 tree edges, T6
 * Venn outlines, future arrows). Tella explicitly says: "Remotion doesn't do an
 * amazing job at arrows. Use a small dot or chevron at the edge tip instead."
 *
 * Usage with React + Remotion:
 *
 *   const { dashArray, dashOffset, opacity } = pathDraw({
 *     frame,
 *     startFrame: 30,
 *     durationFrames: 18,
 *     pathLength: 240,        // get from svgPath.getTotalLength() in a ref callback,
 *                             //   or hardcode if you know the geometry.
 *     direction: "start-to-end",
 *   });
 *   <path
 *     d="…"
 *     fill="none"
 *     stroke={color}
 *     strokeWidth={4}
 *     strokeDasharray={dashArray}
 *     strokeDashoffset={dashOffset}
 *     style={{ opacity }}
 *   />
 *
 * Pair with a small tip-dot for arrows (NEVER animate arrowheads — Tella's rule).
 */
import { interpolate } from "remotion";
import { outCubic, outQuart, inOutCubic } from "../timing/easing";

export type PathDrawEasing = "outCubic" | "outQuart" | "inOutCubic" | "linear";
export type PathDrawDirection = "start-to-end" | "end-to-start" | "center-out";

export interface PathDrawOptions {
  /** Current composition frame. */
  frame: number;
  /** Frame the draw starts. Default 0. */
  startFrame?: number;
  /** Duration in frames. Default 18 (~0.6s at 30fps). */
  durationFrames?: number;
  /** Total SVG path length in user units (from `getTotalLength()` or hand-calc). */
  pathLength: number;
  /** Direction the line reveals. Default "start-to-end". */
  direction?: PathDrawDirection;
  /** Easing. Default "outCubic" (lazy-decelerating marker draw). */
  easing?: PathDrawEasing;
}

export interface PathDrawValues {
  /** Apply to `strokeDasharray`. */
  dashArray: string;
  /** Apply to `strokeDashoffset`. */
  dashOffset: number;
  /** Soft opacity ramp so the line fades up in the first 20% of the draw
   *  (prevents the "tail-flash" you get on hairlines if you only animate offset). */
  opacity: number;
  /** Raw 0..1 progress along the easing curve. */
  progress: number;
}

function applyEasing(t: number, kind: PathDrawEasing): number {
  if (kind === "linear") return t;
  if (kind === "outQuart") return outQuart(t);
  if (kind === "inOutCubic") return inOutCubic(t);
  return outCubic(t);
}

export function pathDraw(opts: PathDrawOptions): PathDrawValues {
  const {
    frame,
    startFrame = 0,
    durationFrames = 18,
    pathLength,
    direction = "start-to-end",
    easing = "outCubic",
  } = opts;

  const raw = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = applyEasing(raw, easing);

  const dashArray = `${pathLength}`;
  let dashOffset: number;
  if (direction === "start-to-end") {
    dashOffset = pathLength * (1 - eased);
  } else if (direction === "end-to-start") {
    dashOffset = -pathLength * (1 - eased);
  } else {
    // center-out: dashArray is half the length, drawn outward both ways.
    // Implement by reducing both ends using a 3-stop pattern.
    const half = pathLength / 2;
    dashOffset = half * (1 - eased);
    return {
      dashArray: `${pathLength} ${pathLength}`,
      dashOffset,
      opacity: Math.min(1, raw * 5),
      progress: eased,
    };
  }

  return {
    dashArray,
    dashOffset,
    opacity: Math.min(1, raw * 5),
    progress: eased,
  };
}

/**
 * Helper for sequential edges in a tree / mesh — staggers each edge
 * by `gapFrames` so they draw one after another.
 *
 *   for (const [i, edge] of edges.entries()) {
 *     const v = pathDrawStaggered({ frame, index: i, gapFrames: 4, ...other });
 *   }
 */
export function pathDrawStaggered(opts: PathDrawOptions & { index: number; gapFrames?: number }): PathDrawValues {
  const { index, gapFrames = 4, startFrame = 0, ...rest } = opts;
  return pathDraw({ ...rest, startFrame: startFrame + index * gapFrames });
}
