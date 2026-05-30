/**
 * BrandBreadcrumb — top-of-frame section label with thin accent underline.
 *
 * Universal "house grammar" element observed on every @carloscuamatzin and @DIYSmartCode
 * video. Provides instant context in <1 second of viewing.
 *
 *   ┌────────────────────────────────────────────┐
 *   │                                            │
 *   │       ANTHROPIC  ·  MAY 19, 2026          │
 *   │       ───────────────                       │  (thin warm-red underline)
 *   │                                            │
 *   │           (rest of composition)            │
 *   └────────────────────────────────────────────┘
 *
 * Used inside any 9x16 composition by mounting at the top of the AbsoluteFill.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export interface BrandBreadcrumbProps {
  /** Primary label text. Will be rendered uppercase. e.g. "ANTHROPIC" or "AST-GREP" */
  text: string;
  /** Optional date / secondary segment, joined with a middle-dot. e.g. "MAY 19, 2026" */
  date?: string;
  /** Color of the underline + (optionally) the text. Default uses the composition's accent. */
  accentColor?: string;
  /** Color of the text. If unset, falls back to accentColor. */
  textColor?: string;
  /** Y position from top of frame in pixels. Default 80. */
  topPx?: number;
  /** Font size in pixels. Default 30. */
  fontSizePx?: number;
  /** Whether to show the underline. Default true. */
  showUnderline?: boolean;
  /** Frame the breadcrumb should be visible from. Default 0. */
  fromFrame?: number;
  /**
   * Chrome mode. Default `'full'` — renders the breadcrumb normally.
   * Set to `'minimal'` to render NOTHING (brand-free output for cross-posting
   * to platforms where in-video watermarks aren't desirable). Per Adam Rosler
   * analysis: zero in-video watermark on 18/18 frames.
   */
  chrome?: "minimal" | "full";
}

export const BrandBreadcrumb: React.FC<BrandBreadcrumbProps> = ({
  text,
  date,
  accentColor = "#B33A2A",
  textColor,
  topPx = 80,
  fontSizePx = 30,
  showUnderline = true,
  fromFrame = 0,
  chrome = "full",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (chrome === "minimal") return null;
  const localFrame = frame - fromFrame;
  if (localFrame < 0) return null;

  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 24, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);

  const labelColor = textColor ?? accentColor;
  const composed = date ? `${text}  ·  ${date}` : text;

  // Underline animates draw-on in sync with text
  const underlineWidthPct = interpolate(enter, [0.3, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: fontSizePx,
          color: labelColor,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {composed}
      </div>
      {showUnderline && (
        <div
          style={{
            marginTop: 6,
            height: 2,
            width: `${Math.round(underlineWidthPct * 120)}px`, // ~120px max width
            background: accentColor,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
};
