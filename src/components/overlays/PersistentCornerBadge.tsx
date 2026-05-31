/**
 * PersistentCornerBadge — OV9 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV9
 * `PersistentCornerBadge`.
 *  - Anchor ref: `fr78adfAnuA@450s`+ (a framed Guinness-record photo as a
 *    persistent prop/badge top-left, present across many seconds),
 *    `jfW6gL6hKhk` recurring corner marks.
 *  - What: a small image/logo + label badge held in a top corner across a long
 *    stretch — a persistent watermark-style overlay rather than a beat-synced
 *    one (e.g. handle / sponsor / topic).
 *  - transitionVerb: "Fade in once over 10 frames; hold persistently; never
 *    re-animate. Pin to corner with safe-margin padding."
 *  - Differs from cutaway: never owns the frame; it's chrome, like a logo bug.
 *  - Replicability: "Maps to existing `BrandWatermark.tsx` concept."
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across the overlays/ batch):
 *  - Transparent `AbsoluteFill` (no opaque fill; `pointerEvents:'none'`); pinned
 *    to a corner/side `anchor`, NEVER center (OVERLAY-ANALYSIS §2.1).
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - NOTE: this badge PERSISTS the whole segment — `holdFrames` defaults to an
 *    effectively scene-length value, so absent an `exitFrame` it never fades.
 *  - Exports component + schema + inferred type; renders standalone with zero
 *    props (parses defaults).
 *
 * Dual-aspect (Tier-B): the badge is a px-sized cluster pinned to a corner of a
 * transparent AbsoluteFill, so it renders correctly at any composition
 * dimension (16:9 and 9:16); the parent owns the slot.
 *
 * @dualAspect true — cited OV9.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

/**
 * A scene-length hold sentinel. OV9 persists for the whole segment; without an
 * explicit `exitFrame`, the badge holds for this many frames before fading —
 * larger than any realistic single talking-head segment (~10 min at 60fps).
 */
const SCENE_LENGTH_HOLD = 36_000;

/** Corner/side anchors shared across over-speaker molecules. NEVER center.
 *  OV9 reads best top-left / top-right (a logo-bug corner). */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);

export const persistentCornerBadgeSchema = z.object({
  /** Badge image src (logo/sponsor/photo). Absolute URL, data URI, or
   *  /public-relative (routed via staticFile). Empty → label-only pill. */
  src: z.string().default(""),
  /** Label text beside the image (e.g. handle / sponsor / topic). Optional. */
  label: z.string().default("@armandointeligencia"),
  /** Show the label. Default true. */
  showLabel: z.boolean().default(true),
  /** Corner/side anchor. Default 'top-left' (the OV9 prop-badge corner). NEVER center. */
  anchor: anchorEnum.default("top-left"),
  /** Badge image size (px, square). Default 84. */
  sizePx: z.number().default(84),
  /** Label font size (px). Default 30. */
  labelFontSize: z.number().default(30),
  /** Label color. Default white. */
  labelColor: z.string().default("#FFFFFF"),
  /** Pill / chip background behind the badge. Default translucent dark. */
  chipBg: z.string().default("rgba(15,27,45,0.62)"),
  /** Round the image into a circle (vs. a rounded square). Default false. */
  circular: z.boolean().default(false),
  /** Safe-margin inset from the frame edges (%). Default 5. */
  insetPct: z.number().default(5),
  /** Frame the badge fades in. Default 0. */
  enterFrame: z.number().default(0),
  /** Fade-in length in frames. Default 10. */
  fadeInFrames: z.number().default(10),
  /** Frames to hold after fade-in. Defaults effectively to scene length
   *  (OV9 persists the whole segment). */
  holdFrames: z.number().default(SCENE_LENGTH_HOLD),
  /** Optional explicit exit frame. When omitted, derived from enter+fade+hold. */
  exitFrame: z.number().optional(),
});

export type PersistentCornerBadgeProps = z.infer<
  typeof persistentCornerBadgeSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

function resolveSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

function isLeftAnchor(anchor: Anchor): boolean {
  return anchor === "top-left" || anchor === "bottom-left" || anchor === "left";
}

/** Corner/side placement of the badge wrapper. NEVER center. */
function anchorPlacement(anchor: Anchor, inset: string): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute" };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset };
    case "top-right":
      return { ...base, top: inset, right: inset };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset };
    case "left":
      return { ...base, top: "50%", left: inset, transform: "translateY(-50%)" };
    case "right":
      return { ...base, top: "50%", right: inset, transform: "translateY(-50%)" };
    case "lower-third":
      return { ...base, bottom: "22%", left: inset };
  }
}

export const PersistentCornerBadge: React.FC<
  Partial<PersistentCornerBadgeProps>
> = (props) => {
  const {
    src,
    label,
    showLabel,
    anchor,
    sizePx,
    labelFontSize,
    labelColor,
    chipBg,
    circular,
    insetPct,
    enterFrame,
    fadeInFrames,
    holdFrames,
    exitFrame,
  } = persistentCornerBadgeSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;

  const FADE_OUT = 10;
  const derivedExit = enterFrame + fadeInFrames + holdFrames + FADE_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Fade in once over fadeInFrames; never re-animate.
  const fadeIn = interpolate(local, [0, fadeInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade out only when an exitFrame brings the badge in range.
  const fadeOut = interpolate(
    frame,
    [effectiveExit - FADE_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const inset = `${insetPct}%`;
  const leftSide = isLeftAnchor(anchor);
  const hasLabel = showLabel && label.length > 0;
  const radius = circular ? "50%" : 12;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...anchorPlacement(anchor, inset),
          opacity,
          display: "flex",
          flexDirection: leftSide ? "row" : "row-reverse",
          alignItems: "center",
          gap: hasLabel ? 14 : 0,
          background: chipBg,
          borderRadius: hasLabel ? 999 : radius,
          padding: hasLabel ? "10px 22px 10px 10px" : 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
        }}
      >
        {src ? (
          <Img
            src={resolveSrc(src)}
            alt={label}
            style={{
              width: sizePx,
              height: sizePx,
              objectFit: "cover",
              borderRadius: radius,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: sizePx,
              height: sizePx,
              borderRadius: radius,
              background: "rgba(255,255,255,0.12)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: Math.round(sizePx * 0.5),
              color: labelColor,
            }}
          >
            {(label.replace(/^@/, "")[0] ?? "A").toUpperCase()}
          </div>
        )}
        {hasLabel ? (
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: labelFontSize,
              color: labelColor,
              letterSpacing: "0.02em",
              textShadow: "0 2px 8px rgba(0,0,0,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export default PersistentCornerBadge;
