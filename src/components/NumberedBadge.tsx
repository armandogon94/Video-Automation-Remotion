/**
 * NumberedBadge — lime-green outlined circle with a number inside.
 *
 * Hormozi long-form HIGH-priority unlock #2 (consensus H2). Used as the visual
 * anchor in `HormoziTweetCardListicle` ("1", "2", "3" big circles next to each
 * tweet) and `NumberedCarouselRibbon` (horizontal strip of numbered chips).
 *
 *   ╭───╮
 *   │ 1 │   ← lime-green stroke, transparent fill, big white number inside
 *   ╰───╯
 *
 * Pure React FC. Reads `useCurrentFrame()` internally so it can render an
 * optional fade-in. All layout is controlled via props — caller decides where
 * to place it (top/left offsets) or wraps it in its own positioned container.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

export interface NumberedBadgeProps {
  /** The number to display. */
  number: number | string;
  /** Size in px. Default 80. */
  sizePx?: number;
  /** Stroke color (default lime green Hormozi-style #C4F84A). */
  strokeColor?: string;
  /** Number text color (default white). */
  textColor?: string;
  /** Stroke width. Default 4. */
  strokeWidthPx?: number;
  /** Optional fill (default transparent). */
  fill?: string;
  /** Font size — auto if absent (66% of sizePx). */
  fontSize?: number;
  /** Font weight. Default 900. */
  fontWeight?: number;
  /** Optional accent halo glow behind. */
  glow?: boolean;
  glowColor?: string;
  /** Optional fade-in. Default 0 (instant). */
  fadeInFrames?: number;
  /** Optional Y-position offset. */
  topPx?: number;
  /** Optional X-position offset. */
  leftPx?: number;
}

export const NumberedBadge: React.FC<NumberedBadgeProps> = ({
  number,
  sizePx = 80,
  strokeColor = "#C4F84A",
  textColor = "#FFFFFF",
  strokeWidthPx = 4,
  fill = "transparent",
  fontSize,
  fontWeight = 900,
  glow = false,
  glowColor,
  fadeInFrames = 0,
  topPx,
  leftPx,
}) => {
  const frame = useCurrentFrame();

  const opacity =
    fadeInFrames > 0
      ? interpolate(frame, [0, fadeInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const resolvedFontSize = fontSize ?? Math.round(sizePx * 0.66);
  const haloColor = glowColor ?? strokeColor;

  // SVG geometry — keep the stroke fully inside the viewBox so it doesn't clip.
  const viewBox = 100;
  const radius = (viewBox - strokeWidthPx) / 2;
  const center = viewBox / 2;

  // Build the outer position style only if caller provided offsets — otherwise
  // the badge renders inline so a parent flex/grid can place it freely.
  const positionStyle: React.CSSProperties =
    topPx !== undefined || leftPx !== undefined
      ? {
          position: "absolute",
          top: topPx,
          left: leftPx,
        }
      : {};

  return (
    <div
      style={{
        ...positionStyle,
        width: sizePx,
        height: sizePx,
        opacity,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        filter: glow
          ? `drop-shadow(0 0 ${Math.round(sizePx * 0.18)}px ${haloColor}AA)`
          : undefined,
      }}
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        style={{ display: "block" }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidthPx}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight,
            fontSize: resolvedFontSize,
            letterSpacing: "0.01em",
          }}
        >
          {String(number)}
        </text>
      </svg>
    </div>
  );
};
