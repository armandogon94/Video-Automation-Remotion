/**
 * BuildingBulletListOverSpeaker — beat-synced accumulating bullet list,
 * anchored to ONE side over a live talking-head, leaving the speaker visible.
 *
 * Source pattern: OV3 `BuildingBulletListOverSpeaker` — THE headline
 * over-speaker pattern (appears in all 3 rich Hormozi long-form videos).
 * See `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` §1 OV3 + §2.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │  HOW TO LEARN          ┌── heading (yellow)   │
 *   │  ① SPEAK LOUD ENOUGH   │   (dimmed, prior)    │
 *   │  ② SPEAK SLOWLY        │   (dimmed, prior)    │
 *   │  ③ ARTICULATE          │ ← newest item bright │  (speaker visible →)
 *   │                                              │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OV3): "Fade+slide the heading in from the side edge over 8
 * frames; reveal each list item on its spoken beat — slide up 10px + fade 0→1
 * over 6 frames; when a new item appears, drop prior items to 0.6 opacity;
 * hold the full list 30–60 frames after the last item, then fade the whole
 * block out over 10 frames. Anchor to left- or right-third (NEVER center —
 * center is reserved for cutaways)."
 *
 * Differs from a cutaway: anchored to one side over live footage; the speaker
 * stays on camera and gestures toward it. Renders into a transparent
 * AbsoluteFill so the base talking-head shows through.
 *
 * Self-contained: reads `useCurrentFrame()` itself; safe to mount anywhere.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent sizes/positions the
 * frame (Tier-B per ADR-001 §2.3). Source pattern: OV3.
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

const bulletItemSchema = z.object({
  /** Primary bullet text. */
  text: z.string(),
  /** Optional sub-text below the main bullet. */
  sub: z.string().optional(),
});

export const buildingBulletListOverSpeakerSchema = z.object({
  /** Optional heading (yellow bold caps) above the list. */
  heading: z.string().default("HOW TO LEARN"),
  /** Vertical list of items, accumulating one per beat. */
  items: z
    .array(bulletItemSchema)
    .default([
      { text: "Speak loud enough" },
      { text: "Speak slowly enough" },
      { text: "Articulate every word" },
      { text: "Use pauses for weight" },
    ]),
  /** Side/corner anchor. NEVER center. Default 'left' (left-third menu). */
  anchor: anchorEnum.default("left"),
  /** Frame the heading enters (block-relative origin). Default 0. */
  enterFrame: z.number().default(0),
  /** Frames between successive item reveals (one per spoken beat). Default 24. */
  beatFrames: z.number().default(24),
  /** Frames to hold the full list after the last item. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame. If omitted, derived from enter+build+hold. */
  exitFrame: z.number().optional(),
  /** Yellow heading + marker accent. Default Hormozi yellow. */
  accentColor: z.string().default("#FFE000"),
  /** Body text color. Default white. */
  textColor: z.string().default("#FFFFFF"),
  /** Bullet marker color (purple structure tone). Default Hormozi purple. */
  markerColor: z.string().default("#6B3FD4"),
  /** Use numbered markers (①②③) instead of dots. Default true. */
  numbered: z.boolean().default(true),
  /** Body font size (px). Default 46. */
  fontSize: z.number().default(46),
});

export type BuildingBulletListOverSpeakerProps = z.infer<
  typeof buildingBulletListOverSpeakerSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Positioning for a side/corner-anchored block. NEVER center. */
function anchorStyle(anchor: Anchor): React.CSSProperties {
  const inset = "5%";
  const base: React.CSSProperties = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
  };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset, alignItems: "flex-start" };
    case "top-right":
      return { ...base, top: inset, right: inset, alignItems: "flex-end" };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset, alignItems: "flex-start" };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset, alignItems: "flex-end" };
    case "left":
      return {
        ...base,
        top: "50%",
        left: inset,
        transform: "translateY(-50%)",
        alignItems: "flex-start",
      };
    case "right":
      return {
        ...base,
        top: "50%",
        right: inset,
        transform: "translateY(-50%)",
        alignItems: "flex-end",
      };
    case "lower-third":
      return {
        ...base,
        bottom: "12%",
        left: inset,
        alignItems: "flex-start",
      };
  }
}

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"] as const;

export const BuildingBulletListOverSpeaker: React.FC<
  Partial<BuildingBulletListOverSpeakerProps>
> = (props) => {
  const {
    heading,
    items,
    anchor,
    enterFrame,
    beatFrames,
    holdFrames,
    exitFrame,
    accentColor,
    textColor,
    markerColor,
    numbered,
    fontSize,
  } = buildingBulletListOverSpeakerSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;

  // Heading enters first; each item enters on its own beat after the heading.
  const HEADING_IN = 8;
  const ITEM_IN = 6;
  const firstItemAt = HEADING_IN;
  const lastItemAt = firstItemAt + Math.max(0, items.length - 1) * beatFrames;
  const buildEnd = lastItemAt + ITEM_IN;
  const FADE_OUT = 10;
  const derivedExit = enterFrame + buildEnd + holdFrames + FADE_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Whole-block fade-out over the final FADE_OUT frames.
  const blockOpacity = interpolate(
    frame,
    [effectiveExit - FADE_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Heading fade+slide from the side edge.
  const slideFromRight = anchor === "right" || anchor === "top-right" || anchor === "bottom-right";
  const headingOpacity = interpolate(local, [0, HEADING_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headingShift = interpolate(local, [0, HEADING_IN], [slideFromRight ? 24 : -24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Index of the newest revealed item (for dim-prior logic).
  const newestIndex = items.reduce((acc, _item, i) => {
    const itemAt = firstItemAt + i * beatFrames;
    return local >= itemAt ? i : acc;
  }, -1);

  const dropShadow = "0 2px 8px rgba(0,0,0,0.55)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...anchorStyle(anchor), opacity: blockOpacity, maxWidth: "38%", gap: 18 }}>
        {heading ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: Math.round(fontSize * 0.92),
              color: accentColor,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              lineHeight: 1.05,
              marginBottom: 6,
              opacity: headingOpacity,
              transform: `translateX(${headingShift}px)`,
              textShadow: `0 0 14px ${accentColor}66, ${dropShadow}`,
            }}
          >
            {heading}
          </div>
        ) : null}
        {items.map((item, i) => {
          const itemAt = firstItemAt + i * beatFrames;
          const itemLocal = local - itemAt;
          if (itemLocal < 0) return null;
          const opacity = interpolate(itemLocal, [0, ITEM_IN], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rise = interpolate(itemLocal, [0, ITEM_IN], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // Prior items dim to 0.6 so the newest reads brightest.
          const dim = i < newestIndex ? 0.6 : 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 16,
                opacity: opacity * dim,
                transform: `translateY(${rise}px)`,
              }}
            >
              <span
                aria-hidden
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize,
                  color: markerColor,
                  lineHeight: 1.15,
                  flexShrink: 0,
                  textShadow: dropShadow,
                }}
              >
                {numbered ? (CIRCLED[i] ?? `${i + 1}.`) : "•"}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 700,
                    fontSize,
                    color: textColor,
                    lineHeight: 1.18,
                    textTransform: "uppercase",
                    letterSpacing: "0.01em",
                    textShadow: dropShadow,
                  }}
                >
                  {item.text}
                </div>
                {item.sub ? (
                  <div
                    style={{
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: 500,
                      fontSize: Math.round(fontSize * 0.58),
                      color: textColor,
                      opacity: 0.78,
                      lineHeight: 1.3,
                      textShadow: dropShadow,
                    }}
                  >
                    {item.sub}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default BuildingBulletListOverSpeaker;
