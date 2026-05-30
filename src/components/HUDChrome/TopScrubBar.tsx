/**
 * TopScrubBar — 4-6px hairline progress bar at the top (or bottom) of the canvas
 * that fills L→R across the entire video duration.
 *
 * Wave-4 critique reference: diysmartcode-vote3-redteam.md (N8 TopScrubBar).
 * The bar gives a persistent "how far through the video are we" cue that wraps any
 * template. Resets clean at frame 0.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export interface TopScrubBarProps {
  /** Duration of the parent composition in seconds. */
  totalSeconds: number;
  thicknessPx?: number; // default 5
  accentColor?: string;
  /** Track (unfilled) color. Default rgba(255,255,255,0.08). */
  trackColor?: string;
  /** Anchor edge. Default 'top'. */
  position?: "top" | "bottom";
  /** Optional small accent dot that travels with the progress head. */
  showDot?: boolean;
}

export const TopScrubBar: React.FC<TopScrubBarProps> = ({
  totalSeconds,
  thicknessPx = 5,
  accentColor = "#D4AF37",
  trackColor = "rgba(255,255,255,0.08)",
  position = "top",
  showDot = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSeconds = frame / fps;
  // Clamp to [0, 1] and reset clean at frame 0.
  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, currentSeconds / totalSeconds))
      : 0;

  const verticalAnchor: React.CSSProperties =
    position === "bottom" ? { bottom: 0 } : { top: 0 };

  const dotSize = thicknessPx * 2.4;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...verticalAnchor,
        height: thicknessPx,
        background: trackColor,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${progress * 100}%`,
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}55`,
        }}
      />
      {showDot ? (
        <div
          style={{
            position: "absolute",
            left: `${progress * 100}%`,
            top: "50%",
            width: dotSize,
            height: dotSize,
            marginLeft: -dotSize / 2,
            marginTop: -dotSize / 2,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}88`,
          }}
        />
      ) : null}
    </div>
  );
};
