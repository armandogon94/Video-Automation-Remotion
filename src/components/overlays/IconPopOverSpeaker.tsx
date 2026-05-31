/**
 * IconPopOverSpeaker — a single semantic icon/emoji (or tiny icon equation)
 * scale-pops in beside the speaker's head over the live set, punctuating a
 * point. Optional continuous glow pulse for "concept" icons (e.g. brain).
 *
 * Source pattern: OV10 `IconPopOverSpeaker`. See
 * `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` §1 OV10 + §2. The
 * over-speaker cousin of the Shorts `HookEmojiStrip` (pattern J).
 *
 *   ╭──────────────────────────────────────────────╮
 *   │                              🧠  ← glow pulse  │
 *   │                          (top-right corner)   │  (speaker visible →)
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OV10): "Scale-pop the icon 0→1.0 over 6 frames with
 * overshoot; optional continuous glow pulse for 'concept' icons (brain); hold
 * for the spoken phrase; pop out."
 *
 * Differs from a cutaway: a single glyph in a corner over footage, not a full
 * illustrated scene. Renders into a transparent AbsoluteFill so the base
 * talking-head shows through.
 *
 * Self-contained: reads `useCurrentFrame()` itself.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent sizes/positions the
 * frame (Tier-B per ADR-001 §2.3). Source pattern: OV10.
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

export const iconPopOverSpeakerSchema = z.object({
  /** The icon/emoji to pop. Can be a tiny equation like "🍎 = 🍎". */
  icon: z.string().default("🧠"),
  /** Side/corner anchor (beside-head). NEVER center. Default 'top-right'. */
  anchor: anchorEnum.default("top-right"),
  /** Frame the icon enters. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames to hold after the pop. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame. If omitted, derived from enter+pop+hold. */
  exitFrame: z.number().optional(),
  /** Icon size (px). Default 160. */
  sizePx: z.number().default(160),
  /** Continuous glow pulse (for "concept" icons like a brain). Default false. */
  glowPulse: z.boolean().default(false),
  /** Glow color when pulsing. Default Hormozi yellow ~#FFE000. */
  glowColor: z.string().default("#FFE000"),
});

export type IconPopOverSpeakerProps = z.infer<typeof iconPopOverSpeakerSchema>;

type Anchor = z.infer<typeof anchorEnum>;

/** Positioning for a side/corner-anchored glyph. NEVER center. */
function anchorStyle(anchor: Anchor): React.CSSProperties {
  const inset = "7%";
  const base: React.CSSProperties = { position: "absolute", display: "flex" };
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
      return {
        ...base,
        top: "45%",
        left: inset,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        ...base,
        top: "45%",
        right: inset,
        transform: "translateY(-50%)",
      };
    case "lower-third":
      return { ...base, bottom: "24%", left: inset };
  }
}

export const IconPopOverSpeaker: React.FC<
  Partial<IconPopOverSpeakerProps>
> = (props) => {
  const {
    icon,
    anchor,
    enterFrame,
    holdFrames,
    exitFrame,
    sizePx,
    glowPulse,
    glowColor,
  } = iconPopOverSpeakerSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const POP_IN = 6;
  const POP_OUT = 6;
  const derivedExit = enterFrame + POP_IN + holdFrames + POP_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Scale-pop 0 → 1.0 over 6 frames with spring overshoot.
  const enterScale = spring({
    frame: local,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
    durationInFrames: POP_IN,
  });
  // Pop out: scale back down over the final POP_OUT frames.
  const outScale = interpolate(
    frame,
    [effectiveExit - POP_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = interpolate(
    frame,
    [effectiveExit - POP_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = enterScale * outScale;

  // Optional continuous glow pulse (concept icons): a 1.5s sine breathe.
  const pulse = glowPulse
    ? 0.5 + 0.5 * Math.sin((local / (fps * 0.75)) * Math.PI)
    : 0;
  const glowRadius = 18 + 22 * pulse;
  const glowAlpha = Math.round((0.5 + 0.4 * pulse) * 255)
    .toString(16)
    .padStart(2, "0");
  const glow = glowPulse
    ? `0 0 ${glowRadius}px ${glowColor}${glowAlpha}, 0 0 ${glowRadius * 1.8}px ${glowColor}44`
    : "0 4px 16px rgba(0,0,0,0.45)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={anchorStyle(anchor)}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            opacity,
            fontFamily: FONT_STACKS.sans,
            fontSize: sizePx,
            lineHeight: 1,
            // Glow is applied as a filter drop-shadow so it haloes the emoji
            // glyph shape itself (text-shadow would not follow the emoji).
            filter: glowPulse
              ? `drop-shadow(0 0 ${glowRadius}px ${glowColor}) drop-shadow(0 0 ${glowRadius * 1.8}px ${glowColor}88)`
              : "drop-shadow(0 4px 16px rgba(0,0,0,0.45))",
            textShadow: glow,
            whiteSpace: "nowrap",
          }}
        >
          {icon}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default IconPopOverSpeaker;
