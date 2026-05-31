/**
 * BrandLogoPopOverSpeaker — OV11 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV11
 * `BrandLogoPopOverSpeaker`.
 *  - Anchor ref: `fr78adfAnuA@945s` (the "skool" wordmark animating in beside
 *    him).
 *  - What: a third-party or own brand wordmark/logo animated in to one side
 *    over the talking-head when he name-drops a tool/platform; punctuates the
 *    mention.
 *  - transitionVerb: "Fade+scale the wordmark in (0.9→1.0, 6 frames); optional
 *    letter-by-letter color reveal; hold; fade out."
 *  - Differs from cutaway: logo beside him vs. a full-screen UI screenshot
 *    cutaway.
 *  - Replicability: "`<img>`/SVG with fade-scale."
 *
 * REUSE: where a logo image src is supplied this routes it through the same
 * `staticFile`-aware src resolver idiom used by `src/components/BrandGlyphs.tsx`
 * (`LogoWall.resolveLogoSrc`). When no image is supplied it renders a styled
 * text wordmark with an optional letter-by-letter color reveal — covering the
 * common name-drop case without a per-brand asset.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across the overlays/ batch):
 *  - Transparent `AbsoluteFill` (no opaque fill; `pointerEvents:'none'`);
 *    anchored to a side/corner, NEVER center (OVERLAY-ANALYSIS §2.1).
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type; renders standalone with zero
 *    props (parses defaults).
 *
 * Dual-aspect (Tier-B): a px-sized wordmark/logo anchored to one side of a
 * transparent AbsoluteFill; renders correctly at 16:9 and 9:16; parent owns slot.
 *
 * @dualAspect true — cited OV11.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

/** Anchor vocabulary shared across all over-speaker molecules. NEVER center. */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);

export const brandLogoPopOverSpeakerSchema = z.object({
  /** Logo image src (own/third-party wordmark). Absolute URL, data URI, or
   *  /public-relative (routed via staticFile). Empty → text wordmark. */
  logoSrc: z.string().default(""),
  /** Wordmark text when no `logoSrc` (e.g. a tool/platform name-drop). */
  wordmark: z.string().default("skool"),
  /** Wordmark text color. Default white. */
  color: z.string().default("#FFFFFF"),
  /** Reveal color used during the optional letter-by-letter color sweep. */
  revealColor: z.string().default("#FFE000"),
  /** Letter-by-letter color reveal (text wordmark only). Default true. */
  letterReveal: z.boolean().default(true),
  /** Side/corner anchor (logo beside his head). Default 'right'. NEVER center. */
  anchor: anchorEnum.default("right"),
  /** Wordmark font size in px (text mode). Default 96. */
  fontSizePx: z.number().default(96),
  /** Logo image height in px (image mode; width auto). Default 120. */
  logoHeightPx: z.number().default(120),
  /** Safe-margin inset from the frame edges (%). Default 6. */
  insetPct: z.number().default(6),
  /** Frame the logo begins entering. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames to hold after the pop settles. Default 54. */
  holdFrames: z.number().default(54),
  /** Optional explicit exit frame. When omitted, derived from enter+pop+hold. */
  exitFrame: z.number().optional(),
});

export type BrandLogoPopOverSpeakerProps = z.infer<
  typeof brandLogoPopOverSpeakerSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Resolve a logo src — mirrors `BrandGlyphs.tsx` `resolveLogoSrc`: pass through
 *  absolute/data URLs, route the rest through Remotion's `staticFile`. */
function resolveLogoSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

/** Side/corner placement of the logo wrapper. NEVER center. */
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
      return { ...base, bottom: "22%", right: inset };
  }
}

export const BrandLogoPopOverSpeaker: React.FC<
  Partial<BrandLogoPopOverSpeakerProps>
> = (props) => {
  const {
    logoSrc,
    wordmark,
    color,
    revealColor,
    letterReveal,
    anchor,
    fontSizePx,
    logoHeightPx,
    insetPct,
    enterFrame,
    holdFrames,
    exitFrame,
  } = brandLogoPopOverSpeakerSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const POP_IN = 6;
  const FADE_OUT = 8;
  const derivedExit = enterFrame + POP_IN + holdFrames + FADE_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Fade + scale the wordmark in (0.9 → 1.0) over 6 frames with overshoot.
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
    durationInFrames: POP_IN,
  });
  const scale = interpolate(pop, [0, 1], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterOpacity = interpolate(local, [0, POP_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [effectiveExit - FADE_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const inset = `${insetPct}%`;
  const useImage = logoSrc.length > 0;

  // Letter-by-letter color reveal sweep (text wordmark only): each glyph
  // crosses from `color` to `revealColor` on a short stagger, then settles.
  const PER_LETTER = 2;
  const SWEEP = 6;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...anchorPlacement(anchor, inset),
          opacity,
          transform: `${anchorPlacement(anchor, inset).transform ?? ""} scale(${scale})`.trim(),
          transformOrigin: "center center",
        }}
      >
        {useImage ? (
          <Img
            src={resolveLogoSrc(logoSrc)}
            alt={wordmark}
            style={{
              height: logoHeightPx,
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: fontSizePx,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "pre",
              textShadow: "0 4px 16px rgba(0,0,0,0.55)",
            }}
          >
            {wordmark.split("").map((ch, i) => {
              if (!letterReveal) {
                return (
                  <span key={`ch-${i}`} style={{ color }}>
                    {ch}
                  </span>
                );
              }
              const t = interpolate(
                local - i * PER_LETTER,
                [0, SWEEP, SWEEP * 2],
                [0, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              // Blend toward revealColor at the sweep peak, settle back to color.
              return (
                <span
                  key={`ch-${i}`}
                  style={{
                    color: t > 0.5 ? revealColor : color,
                    transition: "none",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default BrandLogoPopOverSpeaker;
