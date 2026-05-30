/**
 * smartZoom — Ken Burns + punch-in flavors for video / image content.
 *
 * Wave-5 Tella synthesis #T11 (Claude-edits-videos pipeline):
 *   "Two distinct zoom flavors — slow Ken Burns (1.0 → 1.08 over 90-120f), and
 *    harsh punch-in (1.0 → 1.15 over 4-6f then held)."
 *
 * Both return a `transform` string ready to drop onto a `<div>`, `<Img>`, or
 * `<OffthreadVideo>`. The translate component shifts the focal point so the
 * zoom doesn't drift off-screen.
 */
import { interpolate } from "remotion";
import { outCubic, inOutCubic } from "../timing/easing";

export interface FocalPoint {
  /** 0..1 normalized X position (0 = left edge, 1 = right edge). Default 0.5 (center). */
  x?: number;
  /** 0..1 normalized Y position. Default 0.5 (center). */
  y?: number;
}

export interface KenBurnsOptions {
  frame: number;
  fps: number;
  /** Duration of the slow zoom in seconds. Default 4s (gentle). */
  durationSeconds?: number;
  /** Final zoom factor at end of duration. Default 1.08 (Tella spec). */
  factor?: number;
  /** Start zoom factor. Default 1.0. */
  startFactor?: number;
  /** Focal point — the zoom anchors here. */
  focal?: FocalPoint;
  /** Frame at which the Ken Burns starts (defaults 0). */
  startFrame?: number;
}

export interface PunchInOptions {
  frame: number;
  fps: number;
  /** Frame at which the punch starts (defaults 0). */
  startFrame?: number;
  /** Frames the punch-in takes. Default 5 (Tella spec: 4–6f). */
  framesIn?: number;
  /** Final zoom factor. Default 1.15. */
  factor?: number;
  /** Optional held duration (frames) after punch lands. Default Infinity (held until composition end). */
  heldFrames?: number;
  /** Optional ease-out back to 1.0 after the held period (frames). Default 0 (no ease-out). */
  framesOut?: number;
  /** Focal point. */
  focal?: FocalPoint;
}

export interface SmartZoomResult {
  /** Apply to CSS `transform`. e.g. "scale(1.08) translate(-2.0%, 1.5%)" */
  transform: string;
  /** Raw scale factor for compositing math. */
  scale: number;
  /** Translation (px or %) — exported for advanced overrides. */
  translateXPct: number;
  translateYPct: number;
}

function computeTranslate(scale: number, focal: FocalPoint): { translateXPct: number; translateYPct: number } {
  const fx = focal.x ?? 0.5;
  const fy = focal.y ?? 0.5;
  // Shift origin so the focal point stays anchored: translate = -(scale-1) * (focal - 0.5) * 100%
  const tx = -(scale - 1) * (fx - 0.5) * 100;
  const ty = -(scale - 1) * (fy - 0.5) * 100;
  return { translateXPct: tx, translateYPct: ty };
}

/**
 * Slow Ken Burns zoom — gentle, continuous, eased.
 * Use for: speaker shots, b-roll, ambient backgrounds.
 */
export function kenBurns(opts: KenBurnsOptions): SmartZoomResult {
  const {
    frame,
    fps,
    durationSeconds = 4,
    factor = 1.08,
    startFactor = 1.0,
    focal = {},
    startFrame = 0,
  } = opts;
  const durationFrames = durationSeconds * fps;
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = inOutCubic(t);
  const scale = startFactor + (factor - startFactor) * eased;
  const { translateXPct, translateYPct } = computeTranslate(scale, focal);
  return {
    transform: `scale(${scale.toFixed(4)}) translate(${translateXPct.toFixed(2)}%, ${translateYPct.toFixed(2)}%)`,
    scale,
    translateXPct,
    translateYPct,
  };
}

/**
 * Hard punch-in — fast, near-instant zoom held on emotion/laughter peaks.
 * Use for: comedic beats, emphasis on a number, "look at this" moments.
 */
export function punchIn(opts: PunchInOptions): SmartZoomResult {
  const {
    frame,
    fps,
    startFrame = 0,
    framesIn = 5,
    factor = 1.15,
    heldFrames = Number.POSITIVE_INFINITY,
    framesOut = 0,
    focal = {},
  } = opts;

  let scale: number;
  if (frame < startFrame) {
    scale = 1.0;
  } else if (frame < startFrame + framesIn) {
    // Punch-in phase: 1.0 → factor over `framesIn`
    const t = (frame - startFrame) / framesIn;
    scale = 1.0 + (factor - 1.0) * outCubic(t);
  } else if (frame < startFrame + framesIn + heldFrames) {
    // Held
    scale = factor;
  } else if (framesOut > 0 && frame < startFrame + framesIn + heldFrames + framesOut) {
    // Ease back out
    const t = (frame - startFrame - framesIn - heldFrames) / framesOut;
    scale = factor + (1.0 - factor) * outCubic(t);
  } else {
    scale = framesOut > 0 ? 1.0 : factor;
  }

  // Disable fps lint (kept in props for symmetry with kenBurns + future use).
  void fps;

  const { translateXPct, translateYPct } = computeTranslate(scale, focal);
  return {
    transform: `scale(${scale.toFixed(4)}) translate(${translateXPct.toFixed(2)}%, ${translateYPct.toFixed(2)}%)`,
    scale,
    translateXPct,
    translateYPct,
  };
}
