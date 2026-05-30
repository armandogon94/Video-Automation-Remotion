/**
 * BrandBreadcrumb16x9 — 16:9 variant of `BrandBreadcrumb.tsx`.
 *
 * Same "house grammar" element as the 9:16 version (universal section label
 * with thin accent underline) but adapted for the wider 16:9 long-form canvas
 * per Hormozi consensus (his breadcrumb anchors top-LEFT, not top-center, and
 * stays compact so it doesn't fight the talking head):
 *
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │  ANTHROPIC · MAY 19, 2026                                            │
 *   │  ─────────────────                                                   │
 *   │                                                                      │
 *   │                         (rest of composition)                        │
 *   └──────────────────────────────────────────────────────────────────────┘
 *
 * Differences from the 9:16 version:
 *   - Anchored top-LEFT (not centered).
 *   - Inline compact horizontal layout — text + dot + date all on one line.
 *   - Default 60px from edges, 32px font, 0.18em letter-spacing.
 *
 * Same accent/text-color/show-underline/from-frame contract as the 9:16
 * version so callers can swap with a one-line import change.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT_STACKS } from "../brand";

export interface BrandBreadcrumb16x9Props {
  /** Primary label text. Will be rendered uppercase. e.g. "ANTHROPIC" or "AST-GREP" */
  text: string;
  /** Optional date / secondary segment, joined with a middle-dot. e.g. "MAY 19, 2026" */
  date?: string;
  /** Color of the underline + (optionally) the text. Default uses the composition's accent. */
  accentColor?: string;
  /** Color of the text. If unset, falls back to accentColor. */
  textColor?: string;
  /** Y position from top of frame in pixels. Default 60. */
  topPx?: number;
  /** X position from left of frame in pixels. Default 60. */
  leftPx?: number;
  /** Font size in pixels. Default 32. */
  fontSizePx?: number;
  /** Letter spacing. Default 0.18em (tighter than 9:16). */
  letterSpacing?: string;
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

export const BrandBreadcrumb16x9: React.FC<BrandBreadcrumb16x9Props> = ({
  text,
  date,
  accentColor = "#B33A2A",
  textColor,
  topPx = 60,
  leftPx = 60,
  fontSizePx = 32,
  letterSpacing = "0.18em",
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
  // Slide in from the LEFT (matches left-anchored position) — subtle 12px slide.
  const translateX = interpolate(enter, [0, 1], [-12, 0]);

  const labelColor = textColor ?? accentColor;
  const composed = date ? `${text}  ·  ${date}` : text;

  // Underline animates draw-on. Width estimated as ~0.55× the text length in px
  // so it sits under roughly half the label width — that proportional rule
  // matches the 9:16 chip's ~120px reference width relative to its label.
  const underlineMaxPx = Math.round(text.length * fontSizePx * 0.55);
  const underlineWidthPct = interpolate(enter, [0.3, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: leftPx,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: fontSizePx,
          color: labelColor,
          letterSpacing,
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
            width: `${Math.round(underlineWidthPct * underlineMaxPx)}px`,
            background: accentColor,
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
};
