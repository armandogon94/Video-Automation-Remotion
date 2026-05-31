/**
 * YellowGlowWordCallout — a short word/phrase scale-pops in with a warm yellow
 * glow halo, pinned to a side/corner over a live talking-head.
 *
 * Source pattern: OV1 `YellowGlowWordCallout` — the MOST FREQUENT over-speaker
 * beat in Hormozi long-form. See
 * `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` §1 OV1 + §2.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │                                              │
 *   │   ┌─ RIGHT WORDS  ← #FFE000 bold caps, glow   │  (speaker visible →)
 *   │   bottom-left, color-isolated graphic         │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OV1): "Scale-pop the word group from 0.85→1.0 over 5 frames
 * with a 2-frame overshoot; fade the yellow glow (text-shadow 0 0 14px
 * rgba(255,224,0,0.8)) in over the same window; hold ~24 frames; cut out
 * (no fade)."
 *
 * Differs from a cutaway: lives in a corner over live footage; never owns the
 * frame, never on a flat bg. It is BIGGER and color-isolated vs. the white
 * karaoke caption track, so the eye reads it as a graphic, not a subtitle.
 *
 * Self-contained: reads `useCurrentFrame()` itself; transparent AbsoluteFill.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent sizes/positions the
 * frame (Tier-B per ADR-001 §2.3). Source pattern: OV1.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
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

export const yellowGlowWordCalloutSchema = z.object({
  /** The 1–3 word phrase to call out. */
  text: z.string().default("RIGHT WORDS"),
  /** Side/corner anchor. NEVER center. Default 'bottom-left' (OV1 default). */
  anchor: anchorEnum.default("bottom-left"),
  /** Frame the callout enters. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames to hold at full opacity after the pop. Default 24. */
  holdFrames: z.number().default(24),
  /** Optional explicit exit frame. If omitted, derived from enter+pop+hold. */
  exitFrame: z.number().optional(),
  /** Yellow accent. Default Hormozi yellow ~#FFE000. */
  yellow: z.string().default("#FFE000"),
  /** Font size (px). Default 96 (bigger than the caption track on purpose). */
  fontSize: z.number().default(96),
  /** Glow halo radius (px). Default 14. */
  glowRadiusPx: z.number().default(14),
  /** Uppercase transform. Default true. */
  uppercase: z.boolean().default(true),
});

export type YellowGlowWordCalloutProps = z.infer<
  typeof yellowGlowWordCalloutSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Positioning for a side/corner-anchored block. NEVER center. */
function anchorStyle(anchor: Anchor): React.CSSProperties {
  const inset = "6%";
  const base: React.CSSProperties = { position: "absolute", display: "flex" };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset, justifyContent: "flex-start" };
    case "top-right":
      return { ...base, top: inset, right: inset, justifyContent: "flex-end" };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset, justifyContent: "flex-start" };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset, justifyContent: "flex-end" };
    case "left":
      return {
        ...base,
        top: "50%",
        left: inset,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        ...base,
        top: "50%",
        right: inset,
        transform: "translateY(-50%)",
      };
    case "lower-third":
      return { ...base, bottom: "20%", left: inset };
  }
}

export const YellowGlowWordCallout: React.FC<
  Partial<YellowGlowWordCalloutProps>
> = (props) => {
  const {
    text,
    anchor,
    enterFrame,
    holdFrames,
    exitFrame,
    yellow,
    fontSize,
    glowRadiusPx,
    uppercase,
  } = yellowGlowWordCalloutSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;

  const POP_IN = 5; // 0.85 → 1.0 over 5 frames
  const OVERSHOOT = 2; // 2-frame overshoot tail
  const popEnd = POP_IN + OVERSHOOT;
  const derivedExit = enterFrame + popEnd + holdFrames; // OV1 cuts out (no fade)
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Scale-pop 0.85 → 1.0 with a small overshoot bump, then settle.
  const scale = interpolate(
    local,
    [0, POP_IN, popEnd],
    [0.85, 1.04, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Glow + opacity fade in over the pop window.
  const opacity = interpolate(local, [0, POP_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Two-stop bloom: tight inner halo + softer wide halo. Plus a thin black
  // outline (4 directional shadows) so it survives a bright/busy bg.
  const glow = `0 0 ${glowRadiusPx}px ${yellow}cc, 0 0 ${glowRadiusPx * 2}px ${yellow}66`;
  const outline =
    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={anchorStyle(anchor)}>
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            transformOrigin:
              anchor.includes("right") ? "right center" : "left center",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize,
            color: yellow,
            letterSpacing: "0.01em",
            textTransform: uppercase ? "uppercase" : "none",
            lineHeight: 1.02,
            maxWidth: "46%",
            textShadow: `${glow}, ${outline}`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default YellowGlowWordCallout;
