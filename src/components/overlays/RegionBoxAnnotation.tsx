/**
 * RegionBoxAnnotation — a colored stroke box drawn over a normalized screen
 * region, with an optional number/label badge. The cheapest possible
 * object-emphasis: a rectangle over a base layer, NO AI.
 *
 * Source pattern: AZisk object-emphasis OE1 / OE3 (`RedBoxPortAnnotation`,
 * `VramRowHighlight`). See `references/creators/azisk/ANALYSIS.md` §2 —
 * "of 8 object-emphasis patterns, 6 need NO AI". This is the Tier-1, region-box
 * primitive: a stroke `<rect>` at fixed normalized coords over a B-roll /
 * screen-recording, with a small number label (the red "1" port box) or text
 * badge. UI elements & ports are axis-aligned → a box, not a pixel-tight cutout.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │   ┌──────────┐                                │
 *   │  ①│  region  │   ← colored stroke box + badge │
 *   │   └──────────┘                                │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OE1/OE3): "Draw the stroke rect in (clip-path inset wipe, or a
 * scale-pop) over ~6 frames; pop the number/label badge in alongside; hold while
 * he points; fade out 8 frames." Defaults to a scale-pop draw.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across the overlay family):
 *  - Transparent `AbsoluteFill` (no opaque fill); parent-positioned.
 *  - Inline zod `<name>Schema`, every field `.default()`ed (new optional fields
 *    use `.optional()`); enter/hold/exit timing animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type.
 *
 * @dualAspect true — region is expressed in NORMALIZED (0–1) frame coordinates,
 * so the box lands on the same content area at any composition dimension (16:9
 * and 9:16). Cited AZisk OE1/OE3.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

// AZisk emphasis red — the "red port box" sentiment color (ANALYSIS §3).
const AZ_RED = "#E5484D";

/** Normalized region (0–1 of frame width/height). A box, not a cutout. */
const regionSchema = z.object({
  x: z.number().min(0).max(1).default(0.1),
  y: z.number().min(0).max(1).default(0.3),
  w: z.number().min(0).max(1).default(0.35),
  h: z.number().min(0).max(1).default(0.25),
});

export const regionBoxAnnotationSchema = z.object({
  /** Region to box, in normalized (0–1) frame coordinates. */
  region: regionSchema.default({ x: 0.1, y: 0.3, w: 0.35, h: 0.25 }),
  /** Stroke color of the box (and badge fill). Default AZisk red. */
  color: z.string().default(AZ_RED),
  /** Stroke thickness in px. Default 6. */
  strokeWidthPx: z.number().default(6),
  /** Corner radius of the box in px. Default 10. */
  cornerRadiusPx: z.number().default(10),
  /** Optional number/label badge text (e.g. "1", "VRAM"). Empty = no badge. */
  badge: z.string().default(""),
  /** Badge corner. Default top-left of the box. */
  badgeAnchor: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
    .default("top-left"),
  /** Enter animation: 'pop' (scale 0.9→1) or 'draw' (wipe in). Default 'pop'. */
  enter: z.enum(["pop", "draw"]).default("pop"),
  /** Frame the box begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold at full opacity after entering. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame. When omitted, the box holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type RegionBoxAnnotationProps = z.infer<typeof regionBoxAnnotationSchema>;

type BadgeAnchor = RegionBoxAnnotationProps["badgeAnchor"];

/** Place the badge on a corner of the box, nudged outward to straddle the edge. */
function badgeStyle(anchor: BadgeAnchor, sizePx: number): React.CSSProperties {
  const off = -Math.round(sizePx * 0.4);
  const base: React.CSSProperties = { position: "absolute" };
  switch (anchor) {
    case "top-right":
      return { ...base, top: off, right: off };
    case "bottom-left":
      return { ...base, bottom: off, left: off };
    case "bottom-right":
      return { ...base, bottom: off, right: off };
    case "top-left":
    default:
      return { ...base, top: off, left: off };
  }
}

export const RegionBoxAnnotation: React.FC<
  Partial<RegionBoxAnnotationProps>
> = (props) => {
  const {
    region,
    color,
    strokeWidthPx,
    cornerRadiusPx,
    badge,
    badgeAnchor,
    enter,
    enterFrame,
    holdFrames,
    exitFrame,
  } = regionBoxAnnotationSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;
  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  // Block fade-out envelope.
  let blockOpacity = 1;
  if (exitFrame !== undefined) {
    blockOpacity = interpolate(frame - exitFrame, [0, 8], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    });
    if (blockOpacity <= 0) return null;
  }

  const ENTER = 6;
  const enterOpacity = interpolate(local, [0, ENTER], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 'pop': scale 0.9→1.0; 'draw': clip-path wipe left→right.
  const popScale =
    enter === "pop"
      ? interpolate(local, [0, ENTER], [0.9, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.back(1.4)),
        })
      : 1;
  const wipePct =
    enter === "draw"
      ? interpolate(local, [0, ENTER * 1.4], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        })
      : 100;

  const badgeSizePx = Math.round(strokeWidthPx * 7);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          position: "absolute",
          left: `${region.x * 100}%`,
          top: `${region.y * 100}%`,
          width: `${region.w * 100}%`,
          height: `${region.h * 100}%`,
          opacity: enterOpacity,
          transform: `scale(${popScale})`,
          transformOrigin: "center",
          // 'draw' reveals the box edges left→right; 'pop' shows it whole.
          clipPath: `inset(0 ${100 - wipePct}% 0 0)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: `${strokeWidthPx}px solid ${color}`,
            borderRadius: cornerRadiusPx,
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
          }}
        />
        {badge ? (
          <div
            style={{
              ...badgeStyle(badgeAnchor, badgeSizePx),
              minWidth: badgeSizePx,
              height: badgeSizePx,
              padding: "0 8px",
              borderRadius: Math.round(badgeSizePx * 0.28),
              background: color,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACKS.display,
              fontWeight: 900,
              fontSize: Math.round(badgeSizePx * 0.52),
              lineHeight: 1,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
            }}
          >
            {badge}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export default RegionBoxAnnotation;
