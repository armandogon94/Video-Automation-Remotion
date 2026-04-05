import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { WordTiming, CaptionStyle } from "../compositions/schemas";

interface CaptionProps {
  wordTimings: WordTiming[];
  style: CaptionStyle;
  containerWidth: number;
}

export const Caption: React.FC<CaptionProps> = ({
  wordTimings,
  style,
  containerWidth,
}) => {
  const frame = useCurrentFrame();

  if (!style.enabled || wordTimings.length === 0) return null;

  // Find current words to display (show a window of words around the active one)
  const activeWordIndex = wordTimings.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );

  if (activeWordIndex === -1) {
    // Check if we're between words — show the last spoken group
    const lastSpoken = wordTimings.findIndex((w) => w.startFrame > frame) - 1;
    if (lastSpoken < 0 && frame > wordTimings[0]?.startFrame) {
      // Past all words
      return null;
    }
  }

  // Display a window of ~6 words centered on current
  const windowSize = 6;
  const centerIndex = activeWordIndex >= 0 ? activeWordIndex : 0;
  const groupStart = Math.max(
    0,
    Math.floor(centerIndex / windowSize) * windowSize
  );
  const groupEnd = Math.min(wordTimings.length, groupStart + windowSize);
  const visibleWords = wordTimings.slice(groupStart, groupEnd);

  // Only show if we're within the time range of visible words
  const groupFirstFrame = visibleWords[0]?.startFrame ?? 0;
  const groupLastFrame = visibleWords[visibleWords.length - 1]?.endFrame ?? 0;
  if (frame < groupFirstFrame - 10 || frame > groupLastFrame + 15) return null;

  const positionStyle: React.CSSProperties =
    style.position === "top"
      ? { top: 60 }
      : style.position === "center"
        ? { top: "50%", transform: "translateY(-50%)" }
        : { bottom: 80 };

  const fadeIn = interpolate(
    frame,
    [groupFirstFrame - 5, groupFirstFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: fadeIn,
        ...positionStyle,
      }}
    >
      <div
        style={{
          backgroundColor: style.backgroundColor,
          borderRadius: 12,
          padding: "12px 24px",
          maxWidth: containerWidth * 0.85,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 8px",
        }}
      >
        {visibleWords.map((word, i) => {
          const isActive =
            frame >= word.startFrame && frame <= word.endFrame;
          const isPast = frame > word.endFrame;

          return (
            <span
              key={`${groupStart}-${i}`}
              style={{
                fontSize: style.fontSize,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                color: isActive
                  ? style.highlightColor
                  : isPast
                    ? style.color
                    : `${style.color}88`,
                transition: "color 0.1s",
                transform: isActive ? "scale(1.08)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
