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
 * DELIBERATE DEVIATION from the source pattern (Sol 2026-07-16 §2.5 / §4):
 * Hormozi's OV1 hard-cuts out, but the house lifecycle contract
 * (DOGFOOD-PLAYBOOK §5 "everything eases in AND out; nothing pops or
 * vanishes" + hard gate G4 "no hard lifecycle clip") requires a real exit.
 * The callout now fades + slightly scales DOWN over its final EXIT_FADE
 * frames, completing exactly at `exitFrame` — the dogfood renders showed KEY
 * full-strength at frame 205 and gone at 206, which failed G4.
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
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

/** Anchor vocabulary shared across all over-speaker molecules. NEVER center.
 *  `upper-third` is the behind-speaker hero anchor: a large word pinned HIGH
 *  (above head/shoulders) so it still reads when the speaker matte occludes its
 *  lower portion. Horizontally centered (the only centered case) but offset
 *  toward the TOP, not the dead-center cutaway zone. */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
  "upper-third",
]);

export const yellowGlowWordCalloutSchema = z.object({
  /** The 1–3 word phrase to call out. */
  text: z.string().default("RIGHT WORDS"),
  /** Side/corner anchor. NEVER dead-center. Default 'bottom-left' (OV1 default).
   *  Use 'upper-third' for behind-speaker hero words. */
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
  /** For `anchor:'upper-third'` only — distance of the word's TOP from the frame
   *  top, as a percentage. Lower = higher on screen (over the head). Default 20. */
  topPct: z.number().default(20),
});

export type YellowGlowWordCalloutProps = z.infer<
  typeof yellowGlowWordCalloutSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Positioning for a side/corner-anchored block. NEVER center. */
function anchorStyle(anchor: Anchor, topPct = 20): React.CSSProperties {
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
    case "upper-third":
      // Behind-speaker hero anchor: pinned HIGH (top ~20%), horizontally
      // centered so a big word reads over the head/shoulders. The matte
      // occludes only its lower edge, keeping the top legible.
      return {
        ...base,
        top: `${topPct}%`,
        left: 0,
        right: 0,
        justifyContent: "center",
      };
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
    topPct,
  } = yellowGlowWordCalloutSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const POP_IN = 8; // spring settle window
  const EXIT_FADE = 6; // ease-out window (house lifecycle contract — Sol §2.5)
  const derivedExit = enterFrame + POP_IN + holdFrames + EXIT_FADE;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Genuine spring pop: scale 0.6 → 1.0 with overshoot (damping low enough to
  // visibly bump past 1.0 before settling), so the word "snaps in" like Hormozi.
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 9, stiffness: 200, mass: 0.7 },
    durationInFrames: POP_IN,
  });
  // Exit ease-out (Sol 2026-07-16 §2.5: this molecule hard-cut at exitFrame —
  // KEY full-strength at frame 205, gone at 206 in the r2-austin-mid render).
  // Fade + slight scale-down over the final EXIT_FADE frames, finishing exactly
  // at effectiveExit; clamped so very short windows still ease out.
  const exitStart = Math.max(enterFrame, effectiveExit - EXIT_FADE);
  const exitProgress =
    effectiveExit > exitStart
      ? interpolate(frame, [exitStart, effectiveExit], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const scale = (0.6 + 0.4 * pop) * (0.92 + 0.08 * exitProgress);
  // Glow + opacity fade in fast over the first few frames of the pop, and back
  // out over the exit window.
  const opacity =
    interpolate(local, [0, 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * exitProgress;

  // Two-stop bloom: tight inner halo + softer wide halo. Plus a thin black
  // outline (4 directional shadows) so it survives a bright/busy bg.
  const glow = `0 0 ${glowRadiusPx}px ${yellow}cc, 0 0 ${glowRadiusPx * 2}px ${yellow}66`;
  const outline =
    "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={anchorStyle(anchor, topPct)}>
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: anchor.includes("right")
              ? "right center"
              : anchor === "upper-third"
                ? "center center"
                : "left center",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize,
            color: yellow,
            letterSpacing: "0.01em",
            textTransform: uppercase ? "uppercase" : "none",
            lineHeight: 1.02,
            textAlign: anchor === "upper-third" ? "center" : "left",
            // Upper-third hero words may span most of the width; side anchors stay
            // narrow so the speaker isn't covered.
            maxWidth: anchor === "upper-third" ? "92%" : "46%",
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
