/**
 * DiagnosticCalloutCard — OV5 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV5
 * `DiagnosticCalloutCard` (label + body, over speaker).
 *  - Anchor refs: `sGakuNs9mT4@1050s` & `@1125s` ("IT SOUNDS LIKE: / You have a /
 *    MARKETING ISSUE"), `fr78adfAnuA@615s` ("HUMAN PSYCHOLOGY IS NOT GONNA
 *    CHANGE" + glowing brain icon top-right).
 *  - What: a 2–3 line text block — a small yellow caps LABEL line + larger
 *    white/yellow body — anchored top-left or top-right corner, transparent bg,
 *    over him. Reads like a "callout box" but without a box; held while he
 *    elaborates.
 *  - transitionVerb: "Type-on or fade-in the label line first (6 frames), then
 *    fade the body line(s) in 6 frames later; optional accompanying icon
 *    scale-pops top-corner; hold for the spoken sentence; fade out 10 frames."
 *  - Differs from cutaway: corner-anchored over live footage; the cutaway
 *    version would be a full-screen equation/matrix on dark bg.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across OV4–OV7):
 *  - Transparent `AbsoluteFill` (no opaque fill); `anchor` prop, NEVER center.
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type.
 *
 * @dualAspect true — relative/px sizing over a transparent AbsoluteFill; renders
 * correctly at any composition dimension (16:9 and 9:16). Cited OV5.
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

// Hormozi over-speaker emphasis yellow (OVERLAY-ANALYSIS §2.2).
const HORMOZI_YELLOW = "#FFE000";

/** Corner/side anchors — NEVER center (OVERLAY-ANALYSIS §2.1). */
type OverSpeakerAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right"
  | "lower-third";

function anchorPlacement(
  anchor: OverSpeakerAnchor,
  insetPx: number,
): { wrapper: React.CSSProperties; textAlign: "left" | "right"; alignItems: React.CSSProperties["alignItems"] } {
  switch (anchor) {
    case "top-right":
      return { wrapper: { top: insetPx, right: insetPx }, textAlign: "right", alignItems: "flex-end" };
    case "bottom-left":
      return { wrapper: { bottom: insetPx, left: insetPx }, textAlign: "left", alignItems: "flex-start" };
    case "bottom-right":
      return { wrapper: { bottom: insetPx, right: insetPx }, textAlign: "right", alignItems: "flex-end" };
    case "right":
      return {
        wrapper: { top: "50%", right: insetPx, transform: "translateY(-50%)" },
        textAlign: "right",
        alignItems: "flex-end",
      };
    case "left":
      return {
        wrapper: { top: "50%", left: insetPx, transform: "translateY(-50%)" },
        textAlign: "left",
        alignItems: "flex-start",
      };
    case "lower-third":
      return { wrapper: { bottom: "22%", left: insetPx }, textAlign: "left", alignItems: "flex-start" };
    case "top-left":
    default:
      return { wrapper: { top: insetPx, left: insetPx }, textAlign: "left", alignItems: "flex-start" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, every field .default()ed so it renders standalone)
// ─────────────────────────────────────────────────────────────────────────────

export const diagnosticCalloutCardSchema = z.object({
  /** Small yellow ALL-CAPS label line (e.g. "IT SOUNDS LIKE:"). */
  label: z.string().default("IT SOUNDS LIKE:"),
  /** Larger body line(s). Split on "\n" → each line fades in at +6f after the
   *  previous, after the label settles. */
  body: z.string().default("You have a\nMARKETING ISSUE"),
  /** Optional emoji icon scale-popped at the top corner (e.g. "🧠"). */
  icon: z.string().default(""),
  /** Side/corner anchor. Default top-left (OV5 convention). NEVER center. */
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
    .default("top-left"),
  /** Safe-margin inset from frame edges in px. Default 110. */
  insetPx: z.number().default(110),
  /** Label color. Default Hormozi yellow. */
  labelColor: z.string().default(HORMOZI_YELLOW),
  /** Body color. Default white. */
  bodyColor: z.string().default("#FFFFFF"),
  /** Label font size in px. Default 30. */
  labelFontSize: z.number().default(30),
  /** Body font size in px. Default 56. */
  bodyFontSize: z.number().default(56),
  /** Max text-block width in px. Default 620. */
  maxWidthPx: z.number().default(620),
  /** Frame the overlay begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold after the last line lands. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit frame to begin the 10-frame fade-out. When omitted, the
   *  overlay holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type DiagnosticCalloutCardProps = z.infer<typeof diagnosticCalloutCardSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const DiagnosticCalloutCard: React.FC<DiagnosticCalloutCardProps> = ({
  label = "IT SOUNDS LIKE:",
  body = "You have a\nMARKETING ISSUE",
  icon = "",
  anchor = "top-left",
  insetPx = 110,
  labelColor = HORMOZI_YELLOW,
  bodyColor = "#FFFFFF",
  labelFontSize = 30,
  bodyFontSize = 56,
  maxWidthPx = 620,
  enterFrame = 0,
  holdFrames = 60,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const local = frame - enterFrame;

  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  // Block fade-out envelope (in/hold/out). Per-line fade-in is below.
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

  const { wrapper, textAlign, alignItems } = anchorPlacement(anchor, insetPx);

  // Label fades in first over 6 frames; each body line +6f after the previous.
  const FADE = 6;
  const labelOpacity = interpolate(local, [0, FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelTranslateY = interpolate(local, [0, FADE], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const bodyLines = body.split("\n");

  // Icon scale-pop 0 → 1 over 6 frames, synced with the label.
  const iconScale = interpolate(local, [0, FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          position: "absolute",
          ...wrapper,
          maxWidth: maxWidthPx,
          display: "flex",
          flexDirection: "column",
          alignItems,
          gap: 10,
          textAlign,
        }}
      >
        {icon ? (
          <div
            style={{
              fontSize: Math.round(bodyFontSize * 1.1),
              lineHeight: 1,
              marginBottom: 4,
              transform: `scale(${iconScale})`,
              filter: "drop-shadow(0 0 16px rgba(255,224,0,0.55))",
            }}
          >
            {icon}
          </div>
        ) : null}

        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: labelFontSize,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: labelColor,
            opacity: labelOpacity,
            transform: `translateY(${labelTranslateY}px)`,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            lineHeight: 1.1,
          }}
        >
          {label}
        </div>

        {bodyLines.map((line, i) => {
          const lineStart = FADE + (i + 1) * FADE;
          const lineLocal = local - lineStart;
          const lineOpacity = interpolate(lineLocal, [0, FADE], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const lineTranslateY = interpolate(lineLocal, [0, FADE], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.ease),
          });
          return (
            <div
              key={`body-${i}`}
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 800,
                fontSize: bodyFontSize,
                color: bodyColor,
                opacity: lineOpacity,
                transform: `translateY(${lineTranslateY}px)`,
                textShadow: "0 3px 10px rgba(0,0,0,0.65)",
                lineHeight: 1.12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {line.length === 0 ? " " : line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default DiagnosticCalloutCard;
