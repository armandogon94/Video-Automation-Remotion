/**
 * BulletSequenceCounter — sequenced numbered-bullet reveal.
 *
 * Wave-7 W2 Adam Rosler-derived molecule. Adam's signature visual for
 * "Step N of K" walkthroughs: a vertical sequence of N bullet items revealed
 * one-at-a-time, each accompanied by a small "i / N" counter so the viewer
 * always knows where they are in the sequence.
 *
 *   ┌─────────────────────────────────────────────────┐
 *   │                                                 │
 *   │   • Open the agent control panel       1 / 5    │
 *   │     Click the gear icon in top-right            │
 *   │                                                 │
 *   │   • Select the eval suite              2 / 5    │
 *   │                                                 │
 *   │   • Pin the harness configuration      3 / 5    │
 *   │     Defaults are usually fine                   │
 *   │                                                 │
 *   │   • ...                                         │
 *   └─────────────────────────────────────────────────┘
 *
 * Transition verb (Wave-5):
 *   "Bullet items reveal one-at-a-time at 18-frame intervals via opacity
 *    fade-in over 8 frames; each item shows bullet glyph + body text +
 *    optional sub + optional 'i/N' counter pill."
 *
 * Pure React FC. Reads its own `useCurrentFrame()` so it can be mounted
 * top-level inside an AbsoluteFill or inside a <Sequence> (relative-time is
 * handled by Remotion).
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";
import { staggerEntry } from "../animation/staggeredCascade";

export interface BulletSequenceCounterItem {
  /** Primary bullet text. */
  text: string;
  /** Optional sub-text rendered below the main bullet. */
  sub?: string;
}

export interface BulletSequenceCounterProps {
  /** Bullet items. */
  items: Array<BulletSequenceCounterItem>;
  /** Y position (px). */
  topPx?: number;
  /** Item spacing (px). Default 80. */
  gapPx?: number;
  /** Max width. Default 880. */
  maxWidthPx?: number;
  /** Font size. Default 42. */
  fontSize?: number;
  fontWeight?: number;
  /** Color of bullet glyph + counter. Default accent. */
  accentColor?: string;
  /** Body text color. */
  textColor?: string;
  /** Sub-text color. */
  subColor?: string;
  /** Bullet glyph. Default '•'. */
  bulletChar?: string;
  /** Show the counter pill? Default true. */
  showCounter?: boolean;
  /** Counter position. Default 'right' (renders "i / N" right of bullet). */
  counterPosition?: "left" | "right" | "none";
  /** First-item enter frame. Default 0. */
  startFrame?: number;
  /** Frames between successive items. Default 18. */
  intervalFrames?: number;
  /** Per-item enter duration. Default 8. */
  itemEnterFrames?: number;
  /** Hold duration after all items shown. Default Infinity. */
  holdFrames?: number;
  /** Stay visible after sequence completes. */
  remainVisible?: boolean;
}

const DEFAULT_ACCENT = "#B33A2A";
const DEFAULT_TEXT = "#F4EDDF";
const DEFAULT_SUB = "rgba(244, 237, 223, 0.65)";

export const BulletSequenceCounter: React.FC<BulletSequenceCounterProps> = ({
  items,
  topPx = 0,
  gapPx = 80,
  maxWidthPx = 880,
  fontSize = 42,
  fontWeight = 600,
  accentColor = DEFAULT_ACCENT,
  textColor = DEFAULT_TEXT,
  subColor = DEFAULT_SUB,
  bulletChar = "•",
  showCounter = true,
  counterPosition = "right",
  startFrame = 0,
  intervalFrames = 18,
  itemEnterFrames = 8,
  holdFrames = Infinity,
  remainVisible = true,
}) => {
  const frame = useCurrentFrame();
  const totalCount = items.length;
  // Last item finishes entering at this frame.
  const lastItemEnter = staggerEntry({
    index: Math.max(0, totalCount - 1),
    baseStartFrame: startFrame,
    staggerFrames: intervalFrames,
    accelerate: false,
  });
  const sequenceEnd = lastItemEnter + itemEnterFrames;

  // Global hide once the sequence has been on screen for `holdFrames` after
  // the last item finished entering (unless `remainVisible` is true).
  const localFrame = frame - sequenceEnd;
  const shouldHide =
    !remainVisible &&
    Number.isFinite(holdFrames) &&
    localFrame > (holdFrames as number);
  if (shouldHide) return null;

  const counterShown = showCounter && counterPosition !== "none";

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: gapPx,
          maxWidth: maxWidthPx,
          width: "100%",
        }}
      >
        {items.map((item, i) => {
          const enter = staggerEntry({
            index: i,
            baseStartFrame: startFrame,
            staggerFrames: intervalFrames,
            accelerate: false,
          });
          const opacity = interpolate(
            frame,
            [enter, enter + itemEnterFrames],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          // Sub-pixel rise to feel less mechanical than pure opacity.
          const translateY = interpolate(
            frame,
            [enter, enter + itemEnterFrames],
            [6, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          const counterLabel = `${i + 1} / ${totalCount}`;

          const counterNode = counterShown ? (
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 500,
                fontSize: Math.round(fontSize * 0.5),
                color: accentColor,
                letterSpacing: "0.18em",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {counterLabel}
            </span>
          ) : null;

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              {counterPosition === "left" && counterNode}
              <span
                aria-hidden
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize,
                  color: accentColor,
                  lineHeight: 1.1,
                  flexShrink: 0,
                }}
              >
                {bulletChar}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight,
                    fontSize,
                    color: textColor,
                    lineHeight: 1.2,
                  }}
                >
                  {item.text}
                </div>
                {item.sub ? (
                  <div
                    style={{
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: 400,
                      fontSize: Math.round(fontSize * 0.6),
                      color: subColor,
                      lineHeight: 1.35,
                    }}
                  >
                    {item.sub}
                  </div>
                ) : null}
              </div>
              {counterPosition === "right" && counterNode}
            </div>
          );
        })}
      </div>
    </div>
  );
};
