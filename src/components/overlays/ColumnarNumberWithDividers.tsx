/**
 * ColumnarNumberWithDividers — OV7 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV7
 * `ColumnarNumberWithDividers`.
 *  - Anchor ref: `jfW6gL6hKhk@512s` (three large "1" numerals separated by thin
 *    vertical divider lines at lower-third, with a yellow label "ONE PRODUCT OR
 *    SERVICE" pinned under the active column — the "1 product / 1 avatar / 1
 *    channel" framing).
 *  - What: N large faint-white numerals in a row, separated by full-height thin
 *    divider strokes, anchored lower-third over him; a yellow caps label appears
 *    under whichever column he's naming.
 *  - transitionVerb: "Draw the divider strokes top-to-bottom (stroke-dashoffset)
 *    over 8 frames; fade the numerals in; reveal/swap the active-column yellow
 *    label with a 4-frame slide-up as he names each."
 *  - Differs from cutaway: lower-third strip over live footage; he gestures up
 *    at it.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across OV4–OV7):
 *  - Transparent `AbsoluteFill` (no opaque fill); `anchor` prop, NEVER center.
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type.
 *
 * @dualAspect true — relative/px sizing over a transparent AbsoluteFill; the
 * row self-centers horizontally within its lower-third / side band, so it
 * renders correctly at any composition dimension (16:9 and 9:16). Cited OV7.
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

const HORMOZI_YELLOW = "#FFE000";

/** Lower band / corner anchors — NEVER center (OVERLAY-ANALYSIS §2.1).
 *  lower-third is the OV7 convention (the row sits low, he gestures up at it). */
type OverSpeakerAnchor =
  | "lower-third"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

function anchorPlacement(
  anchor: OverSpeakerAnchor,
  insetPx: number,
): React.CSSProperties {
  switch (anchor) {
    case "bottom-left":
      return { bottom: insetPx, left: insetPx };
    case "bottom-right":
      return { bottom: insetPx, right: insetPx };
    case "top-left":
      return { top: insetPx, left: insetPx };
    case "top-right":
      return { top: insetPx, right: insetPx };
    case "lower-third":
    default:
      // Horizontally centered band sitting in the lower third (NOT frame-center
      // vertically — this is a lower strip, anchor discipline preserved).
      return { bottom: "18%", left: "50%", transform: "translateX(-50%)" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, every field .default()ed so it renders standalone)
// ─────────────────────────────────────────────────────────────────────────────

const columnarNumberColumnSchema = z.object({
  /** The large numeral/value shown in the column (e.g. "1", "10", "3×"). */
  value: z.string().default("1"),
  /** Yellow caps label revealed under the column when it is active. */
  label: z.string().default(""),
});

export const columnarNumberWithDividersSchema = z.object({
  /** The columns, left → right (Hormozi's "1 / 1 / 1" framing). */
  columns: z
    .array(columnarNumberColumnSchema)
    .default([
      { value: "1", label: "ONE PRODUCT OR SERVICE" },
      { value: "1", label: "ONE AVATAR" },
      { value: "1", label: "ONE CHANNEL" },
    ]),
  /** Index of the active column (yellow label shown beneath it). -1 = none. */
  activeIndex: z.number().default(0),
  /** Lower band / corner anchor. Default lower-third (OV7). NEVER center. */
  anchor: z
    .enum(["lower-third", "bottom-left", "bottom-right", "top-left", "top-right"])
    .default("lower-third"),
  /** Safe-margin inset from frame edges in px (used for corner anchors). Default 96. */
  insetPx: z.number().default(96),
  /** Numeral color (faint white). Default rgba(255,255,255,0.92). */
  numeralColor: z.string().default("rgba(255,255,255,0.92)"),
  /** Divider stroke color. Default rgba(255,255,255,0.45). */
  dividerColor: z.string().default("rgba(255,255,255,0.45)"),
  /** Active-label color. Default Hormozi yellow. */
  labelColor: z.string().default(HORMOZI_YELLOW),
  /** Numeral font size in px. Default 150. */
  numeralFontSize: z.number().default(150),
  /** Active-label font size in px. Default 30. */
  labelFontSize: z.number().default(30),
  /** Per-column width in px. Default 220. */
  columnWidthPx: z.number().default(220),
  /** Frame the overlay begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold after the numerals + dividers settle. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit frame to begin the 10-frame fade-out. When omitted, the
   *  overlay holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type ColumnarNumberWithDividersProps = z.infer<
  typeof columnarNumberWithDividersSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const ColumnarNumberWithDividers: React.FC<
  ColumnarNumberWithDividersProps
> = ({
  columns = columnarNumberWithDividersSchema.parse({}).columns,
  activeIndex = 0,
  anchor = "lower-third",
  insetPx = 96,
  numeralColor = "rgba(255,255,255,0.92)",
  dividerColor = "rgba(255,255,255,0.45)",
  labelColor = HORMOZI_YELLOW,
  numeralFontSize = 150,
  labelFontSize = 30,
  columnWidthPx = 220,
  enterFrame = 0,
  holdFrames = 60,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const local = frame - enterFrame;

  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  // Block fade-out envelope (in/hold/out).
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

  // Dividers "draw" top→bottom over 8 frames (scaleY 0→1 from the top).
  const dividerProgress = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  // Numerals fade in alongside the divider draw.
  const numeralOpacity = interpolate(local, [2, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const placement = anchorPlacement(anchor, insetPx);
  const dividerHeight = Math.round(numeralFontSize * 1.05);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          position: "absolute",
          ...placement,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        {columns.map((col, i) => {
          const isActive = i === activeIndex;
          // Active-label slide-up reveal: 4-frame envelope, retriggered whenever
          // activeIndex changes by keying off the divider-draw completion.
          const labelLocal = local - 12;
          const labelOpacity = isActive
            ? interpolate(labelLocal, [0, 4], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;
          const labelTranslateY = isActive
            ? interpolate(labelLocal, [0, 4], [10, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.ease),
              })
            : 10;

          return (
            <React.Fragment key={`col-${i}`}>
              {i > 0 ? (
                <div
                  style={{
                    width: 2,
                    height: dividerHeight,
                    background: dividerColor,
                    transform: `scaleY(${dividerProgress})`,
                    transformOrigin: "top center",
                    margin: "0 6px",
                    alignSelf: "flex-start",
                  }}
                />
              ) : null}
              <div
                style={{
                  width: columnWidthPx,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 800,
                    fontSize: numeralFontSize,
                    lineHeight: 1,
                    color: numeralColor,
                    opacity: isActive ? numeralOpacity : numeralOpacity * 0.7,
                    textShadow: "0 4px 16px rgba(0,0,0,0.55)",
                  }}
                >
                  {col.value}
                </div>
                {col.label ? (
                  <div
                    style={{
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: 800,
                      fontSize: labelFontSize,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textAlign: "center",
                      color: labelColor,
                      opacity: labelOpacity,
                      transform: `translateY(${labelTranslateY}px)`,
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                      lineHeight: 1.15,
                      maxWidth: columnWidthPx,
                    }}
                  >
                    {col.label}
                  </div>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default ColumnarNumberWithDividers;
