/**
 * FloatingNumberedChipRow — a horizontal row of rounded purple numbered chips
 * that stagger in left-to-right, floated over a live talking-head. One chip
 * enlarges/brightens as the speaker names that item.
 *
 * Source pattern: OV2 `FloatingNumberedChipRow`. See
 * `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` §1 OV2 + §2.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │        ┌─┐ ┌─┐ ┌━┓ ┌─┐ ┌─┐                    │
 *   │        │1│ │2│ ┃3┃ │4│ │5│  ← active chip 3   │  (speaker visible →)
 *   │        └─┘ └─┘ ┗━┛ └─┘ └─┘     scaled 1.25     │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OV2): "Stagger-in 5 chips left-to-right, 3 frames apart, each
 * rising 12px with a spring settle; to highlight item N, scale chip N to 1.25
 * and lift sibling opacity down to 0.5 over 6 frames."
 *
 * Differs from a cutaway: chips float over the live set (the cutaway version is
 * the full acronym list on a flat dark bg — the overlay→cutaway escalation
 * noted in §2.4). This molecule is the over-speaker phase only.
 *
 * Self-contained: reads `useCurrentFrame()` itself; transparent AbsoluteFill.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent sizes/positions the
 * frame (Tier-B per ADR-001 §2.3). Source pattern: OV2.
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

export const floatingNumberedChipRowSchema = z.object({
  /** Number of chips in the row. Default 5. */
  count: z.number().int().min(1).max(9).default(5),
  /** Optional explicit labels per chip; falls back to 1..count. */
  labels: z.array(z.string()).optional(),
  /** Side/corner anchor. NEVER center. Default 'lower-third'. */
  anchor: anchorEnum.default("lower-third"),
  /** Frame the first chip enters. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames between successive chip entries. Default 3. */
  staggerFrames: z.number().default(3),
  /** Frames to hold the row after all chips are in. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame. If omitted, derived from enter+stagger+hold. */
  exitFrame: z.number().optional(),
  /** 1-based index of the currently-named chip to highlight (0 = none). Default 0. */
  activeChip: z.number().int().min(0).default(0),
  /** Chip background (purple structure tone). Default Hormozi purple. */
  chipColor: z.string().default("#6B3FD4"),
  /** Numeral color. Default white. */
  textColor: z.string().default("#FFFFFF"),
  /** Chip size (px, square). Default 86. */
  chipSizePx: z.number().default(86),
});

export type FloatingNumberedChipRowProps = z.infer<
  typeof floatingNumberedChipRowSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Positioning for a side/corner-anchored row. NEVER center. */
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
      // A horizontal band low in the frame, but offset left of center so the
      // speaker on the right stays clear (never dead-center).
      return { ...base, bottom: "22%", left: inset, right: "30%", justifyContent: "flex-start" };
  }
}

export const FloatingNumberedChipRow: React.FC<
  Partial<FloatingNumberedChipRowProps>
> = (props) => {
  const {
    count,
    labels,
    anchor,
    enterFrame,
    staggerFrames,
    holdFrames,
    exitFrame,
    activeChip,
    chipColor,
    textColor,
    chipSizePx,
  } = floatingNumberedChipRowSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const SPRING_SETTLE = 18; // approx frames for a chip spring to settle
  const lastChipAt = (count - 1) * staggerFrames;
  const buildEnd = lastChipAt + SPRING_SETTLE;
  const FADE_OUT = 10;
  const derivedExit = enterFrame + buildEnd + holdFrames + FADE_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  const blockOpacity = interpolate(
    frame,
    [effectiveExit - FADE_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const chips = Array.from({ length: count }, (_, i) => i);
  const dropShadow = "0 6px 18px rgba(0,0,0,0.4)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...anchorStyle(anchor), opacity: blockOpacity }}>
        <div style={{ display: "flex", flexDirection: "row", gap: Math.round(chipSizePx * 0.22), alignItems: "center" }}>
          {chips.map((i) => {
            const chipEnter = enterFrame + i * staggerFrames;
            const enterProgress = spring({
              frame: frame - chipEnter,
              fps,
              config: { damping: 14, stiffness: 160, mass: 0.7 },
              durationInFrames: SPRING_SETTLE,
            });
            const rise = interpolate(enterProgress, [0, 1], [12, 0]);
            const baseOpacity = interpolate(enterProgress, [0, 1], [0, 1]);

            // Highlight: chip N scales to 1.25, siblings dim to 0.5 over 6 frames.
            const isActive = activeChip === i + 1;
            const anyActive = activeChip > 0;
            // 6-frame ease for the highlight transition keyed off local time.
            const hl = interpolate(local, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const scale = isActive ? 1 + 0.25 * hl : 1;
            const dim = anyActive && !isActive ? 1 - 0.5 * hl : 1;
            const brightness = isActive ? 1.15 : 1;

            const label = labels?.[i] ?? String(i + 1);

            return (
              <div
                key={i}
                style={{
                  width: chipSizePx,
                  height: chipSizePx,
                  borderRadius: Math.round(chipSizePx * 0.26),
                  background: chipColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: baseOpacity * dim,
                  transform: `translateY(${rise}px) scale(${scale})`,
                  filter: `brightness(${brightness})`,
                  boxShadow: dropShadow,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 900,
                    fontSize: Math.round(chipSizePx * 0.5),
                    color: textColor,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default FloatingNumberedChipRow;
