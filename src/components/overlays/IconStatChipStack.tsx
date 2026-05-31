/**
 * IconStatChipStack — OV4 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV4
 * `IconStatChipStack`.
 *  - Anchor refs: `fr78adfAnuA@720s` (purple pill stack "⚡ FASTER / 💲 CHEAPER"
 *    lower-left over him), `sGakuNs9mT4@450s` ("5 FREQUENCY OF VOICE" — purple
 *    numeral chip + white pill label).
 *  - What: a small vertical stack of 1–3 rounded pills, each `icon + bold-caps
 *    label`, anchored lower-left. Purple bg pills (`~#6B3FD4`), white text. A
 *    compact version of OV3 for 1–3 items.
 *  - transitionVerb: "Slide each pill in from the left edge, 4 frames apart,
 *    with a 6px overshoot; pulse the icon (scale 1.0→1.15→1.0 over 8 frames)
 *    on entry."
 *  - Differs from cutaway: tiny corner element over live footage.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across OV4–OV7):
 *  - Renders into a fully transparent `AbsoluteFill` (no opaque fill); content
 *    positioned via an `anchor` prop, NEVER center (anchor discipline,
 *    OVERLAY-ANALYSIS §2.1).
 *  - Inline zod `<name>Schema` with every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`, all animated relative
 *    to `enterFrame` via `useCurrentFrame()` (in / hold / out envelope).
 *  - Exports component + schema + inferred type.
 *
 * @dualAspect true — purely relative/px sizing over a transparent AbsoluteFill;
 * renders correctly at any composition dimension (16:9 and 9:16). Cited OV4.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Over-speaker palette (Hormozi color-isolation, OVERLAY-ANALYSIS §2.2):
//   purple `~#6B3FD4` for chips/structure, white text, yellow `#FFE000` accents.
// ─────────────────────────────────────────────────────────────────────────────

const HORMOZI_PURPLE = "#6B3FD4";

/** Side/corner anchors — NEVER center (OVERLAY-ANALYSIS §2.1). */
type OverSpeakerAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right"
  | "lower-third";

/**
 * Resolve a side/corner anchor to absolute placement + a flex alignment for the
 * inner stack. `insetPx` is the safe-margin padding from the frame edges.
 */
function anchorPlacement(
  anchor: OverSpeakerAnchor,
  insetPx: number,
): { wrapper: React.CSSProperties; alignItems: React.CSSProperties["alignItems"] } {
  switch (anchor) {
    case "top-left":
      return { wrapper: { top: insetPx, left: insetPx }, alignItems: "flex-start" };
    case "top-right":
      return { wrapper: { top: insetPx, right: insetPx }, alignItems: "flex-end" };
    case "bottom-right":
      return { wrapper: { bottom: insetPx, right: insetPx }, alignItems: "flex-end" };
    case "right":
      return {
        wrapper: { top: "50%", right: insetPx, transform: "translateY(-50%)" },
        alignItems: "flex-end",
      };
    case "left":
      return {
        wrapper: { top: "50%", left: insetPx, transform: "translateY(-50%)" },
        alignItems: "flex-start",
      };
    case "lower-third":
      return {
        wrapper: { bottom: "22%", left: insetPx },
        alignItems: "flex-start",
      };
    case "bottom-left":
    default:
      return { wrapper: { bottom: insetPx, left: insetPx }, alignItems: "flex-start" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, every field .default()ed so it renders standalone)
// ─────────────────────────────────────────────────────────────────────────────

const iconStatChipSchema = z.object({
  /** Emoji glyph (e.g. "⚡", "💲") — rendered as text. Takes precedence over numeral. */
  emoji: z.string().default(""),
  /** Image src for the icon slot (rendered via `<Img>`); used when emoji empty. */
  iconSrc: z.string().default(""),
  /** A bold numeral shown in a small purple chip (Hormozi "5" numeral chip).
   *  Used when both emoji and iconSrc are empty. */
  numeral: z.string().default(""),
  /** Bold ALL-CAPS pill label (e.g. "FASTER", "CHEAPER"). */
  label: z.string().default(""),
});

export const iconStatChipStackSchema = z.object({
  /** 1–3 chips, top → bottom. Each is `icon + bold-caps label`. */
  chips: z
    .array(iconStatChipSchema)
    .default([
      { emoji: "⚡", iconSrc: "", numeral: "", label: "FASTER" },
      { emoji: "💲", iconSrc: "", numeral: "", label: "CHEAPER" },
    ]),
  /** Side/corner anchor. Default lower-left (OV4 convention). NEVER center. */
  anchor: z
    .enum([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "left",
      "right",
      "lower-third",
    ])
    .default("bottom-left"),
  /** Safe-margin inset from frame edges in px. Default 96. */
  insetPx: z.number().default(96),
  /** Pill background color. Default Hormozi purple. */
  pillColor: z.string().default(HORMOZI_PURPLE),
  /** Pill text + icon color. Default white. */
  textColor: z.string().default("#FFFFFF"),
  /** Label font size in px. Default 34. */
  fontSize: z.number().default(34),
  /** Frame the overlay begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold at full visibility after the last chip lands. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit frame to begin the fade-out. When omitted, the overlay
   *  holds indefinitely (no exit). */
  exitFrame: z.number().optional(),
  /** Per-chip slide-in stagger in frames. Default 4 (OV4 transitionVerb). */
  staggerFrames: z.number().default(4),
});

export type IconStatChipStackProps = z.infer<typeof iconStatChipStackSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const IconStatChipStack: React.FC<IconStatChipStackProps> = ({
  chips = iconStatChipStackSchema.parse({}).chips,
  anchor = "bottom-left",
  insetPx = 96,
  pillColor = HORMOZI_PURPLE,
  textColor = "#FFFFFF",
  fontSize = 34,
  enterFrame = 0,
  holdFrames = 60,
  exitFrame,
  staggerFrames = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  if (local < 0) return null;

  // Block-level fade-out envelope (in/hold/out). Entry fade is per-chip below.
  let blockOpacity = 1;
  if (exitFrame !== undefined) {
    const exitLocal = frame - exitFrame;
    blockOpacity = interpolate(exitLocal, [0, 10], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    });
    if (blockOpacity <= 0) return null;
  }
  // `holdFrames` documents intended dwell after the last chip; the actual
  // dwell is enforced by the caller's Sequence duration / `exitFrame`.
  void holdFrames;

  const { wrapper, alignItems } = anchorPlacement(anchor, insetPx);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          position: "absolute",
          ...wrapper,
          display: "flex",
          flexDirection: "column",
          alignItems,
          gap: 14,
        }}
      >
        {chips.map((chip, i) => {
          const chipEnter = i * staggerFrames;
          const chipLocal = local - chipEnter;

          // Slide in from the left edge with a 6px overshoot via spring.
          const slide = spring({
            frame: chipLocal,
            fps,
            config: { damping: 14, stiffness: 180, mass: 0.6 },
            durationInFrames: 14,
          });
          const translateX = interpolate(slide, [0, 0.7, 1], [-60, 6, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const chipOpacity = interpolate(chipLocal, [0, 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Icon pulse on entry: scale 1.0 → 1.15 → 1.0 over 8 frames.
          const iconScale = interpolate(
            chipLocal,
            [0, 4, 8],
            [1, 1.15, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          if (chipLocal < 0) return null;

          return (
            <div
              key={`chip-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: `${Math.round(fontSize * 0.32)}px ${Math.round(fontSize * 0.6)}px`,
                borderRadius: 999,
                background: pillColor,
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                opacity: chipOpacity,
                transform: `translateX(${translateX}px)`,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.round(fontSize * 1.05),
                  lineHeight: 1,
                  color: textColor,
                  transform: `scale(${iconScale})`,
                }}
              >
                {chip.emoji ? (
                  chip.emoji
                ) : chip.iconSrc ? (
                  <Img
                    src={chip.iconSrc}
                    style={{
                      width: Math.round(fontSize * 1.1),
                      height: Math.round(fontSize * 1.1),
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : chip.numeral ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: Math.round(fontSize * 1.1),
                      height: Math.round(fontSize * 1.1),
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.18)",
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: 800,
                      fontSize: Math.round(fontSize * 0.9),
                      color: textColor,
                    }}
                  >
                    {chip.numeral}
                  </span>
                ) : null}
              </span>
              {chip.label ? (
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 800,
                    fontSize,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: textColor,
                    lineHeight: 1,
                  }}
                >
                  {chip.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default IconStatChipStack;
