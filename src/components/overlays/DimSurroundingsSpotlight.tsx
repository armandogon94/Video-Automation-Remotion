/**
 * DimSurroundingsSpotlight — dims the WHOLE frame except a normalized rectangular
 * region, creating a "look at this" spotlight. The cutout window stays bright;
 * everything around it darkens. NO AI — a single darkened layer with a punched-out
 * hole (CSS box-shadow spread inset around the region).
 *
 * Source pattern: AZisk object-emphasis family (Tier-1 region emphasis; §2 / §4
 * `RegionEmphasisBox`). See `references/creators/azisk/ANALYSIS.md` §2 — region
 * emphasis with "rest untouched / one half dims". This is the dim-the-rest
 * variant: instead of boxing the target, it darkens everything BUT the target.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
 *   │▓▓▓▓┌──────────┐▓▓▓▓▓▓▓▓▓▓  ← bright region    │
 *   │▓▓▓▓│  region  │▓▓▓▓▓▓▓▓▓▓     (rest dimmed)    │
 *   │▓▓▓▓└──────────┘▓▓▓▓▓▓▓▓▓▓                      │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb: "Ramp the surrounding dim 0→target over ~8 frames; hold while
 * he points; ramp the dim back to 0 over 8 frames on exit." Optional thin accent
 * ring around the bright region to sharpen the focal edge.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT:
 *  - Transparent `AbsoluteFill`; parent-positioned; inline zod schema with every
 *    field `.default()`ed (new optional fields use `.optional()`); enter/hold/exit
 *    timing via `useCurrentFrame()`. Exports component + schema + type.
 *
 * @dualAspect true — region is expressed in NORMALIZED (0–1) frame coordinates,
 * so the spotlight lands on the same content area at any composition dimension.
 * Cited AZisk §2/§4 region emphasis.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";

/** Normalized spotlight region (0–1 of frame width/height). */
const spotlightRegionSchema = z.object({
  x: z.number().min(0).max(1).default(0.3),
  y: z.number().min(0).max(1).default(0.3),
  w: z.number().min(0).max(1).default(0.4),
  h: z.number().min(0).max(1).default(0.4),
});

export const dimSurroundingsSpotlightSchema = z.object({
  /** The region to KEEP bright, in normalized (0–1) frame coordinates. */
  region: spotlightRegionSchema.default({ x: 0.3, y: 0.3, w: 0.4, h: 0.4 }),
  /** Maximum dim of the surroundings (0 = none, 1 = black). Default 0.62. */
  dimOpacity: z.number().min(0).max(1).default(0.62),
  /** Corner radius of the bright window in px. Default 16. */
  cornerRadiusPx: z.number().default(16),
  /** Optional accent ring color around the bright region. Empty = no ring. */
  ringColor: z.string().default(""),
  /** Ring thickness in px (used only when `ringColor` is set). Default 4. */
  ringWidthPx: z.number().default(4),
  /** Frame the dim begins ramping in (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold the dim after it ramps in. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame: ramps the dim back to 0 over 8 frames from
   *  here. When omitted, the spotlight holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type DimSurroundingsSpotlightProps = z.infer<
  typeof dimSurroundingsSpotlightSchema
>;

export const DimSurroundingsSpotlight: React.FC<
  Partial<DimSurroundingsSpotlightProps>
> = (props) => {
  const {
    region,
    dimOpacity,
    cornerRadiusPx,
    ringColor,
    ringWidthPx,
    enterFrame,
    holdFrames,
    exitFrame,
  } = dimSurroundingsSpotlightSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;
  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  const ENTER = 8;
  const enterRamp = interpolate(local, [0, ENTER], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  // Exit: ramp the dim back to 0 over 8 frames from `exitFrame`.
  let exitRamp = 1;
  if (exitFrame !== undefined) {
    exitRamp = interpolate(frame - exitFrame, [0, ENTER], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    });
    if (exitRamp <= 0) return null;
  }
  const dim = dimOpacity * enterRamp * exitRamp;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: `${region.x * 100}%`,
          top: `${region.y * 100}%`,
          width: `${region.w * 100}%`,
          height: `${region.h * 100}%`,
          borderRadius: cornerRadiusPx,
          // A huge spread box-shadow paints the dim AROUND the bright window
          // while the window itself stays untouched (the "punched-out hole").
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${dim})`,
          // Optional accent ring sharpening the focal edge.
          border:
            ringColor.length > 0
              ? `${ringWidthPx}px solid ${ringColor}`
              : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

export default DimSurroundingsSpotlight;
