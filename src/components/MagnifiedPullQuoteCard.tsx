/**
 * MagnifiedPullQuoteCard — Matt Wolfe / mreflow signature pull-quote overlay.
 *
 * Source: references/creators/mreflow/ANALYSIS.md — pattern #3
 *   `ArticleReadAlongWithNeonPIP16x9` uses this card as a fixed overlay on top
 *   of scrolling article B-roll. Matt magnifies one key sentence (a WSJ quote,
 *   a tweet, a paper abstract line) by floating it above the article while the
 *   rest of the column scrolls underneath.
 *
 * Visual:
 *   ╭──────────────────────────────────────────╮
 *   │ "                                        │
 *   │   The quote text renders here in big      │
 *   │   Playfair Display italic — line height   │
 *   │   1.35 so it breathes on the canvas.      │
 *   │                                          │
 *   │   — ATTRIBUTION                          │
 *   │   source.com / The WSJ                   │
 *   ╰──────────────────────────────────────────╯
 *     ↑ optional 4px accent left border in `accentBorder` color
 *
 * Pure React FC reading `useCurrentFrame()` + `useVideoConfig()` internally.
 * Position via `anchor` (canvas-relative) or pixel offsets (`topPx`/`leftPx`).
 *
 * Magnified pull-quote card fades in over 8 frames with quote in Playfair
 * italic + smaller sans attribution + optional source line. Optional accent
 * left-border + big opening quote mark ornament. Used as an overlay above
 * scrolling article B-roll.
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACKS } from "../brand";

export type MagnifiedPullQuoteAnchor =
  | "center"
  | "top-third"
  | "bottom-third"
  | "left-half"
  | "right-half";

export interface MagnifiedPullQuoteCardProps {
  /** The quote text (will render in italic serif). */
  quote: string;
  /** Optional attribution (renders smaller, sans). */
  attribution?: string;
  /** Optional source URL/title shown small. */
  source?: string;
  /** Anchor on canvas. */
  anchor?: MagnifiedPullQuoteAnchor;
  topPx?: number;
  leftPx?: number;
  /** Card width. Default 720. */
  widthPx?: number;
  /** Quote font size. Default 56. */
  quoteFontSize?: number;
  /** Attribution font size. Default 28. */
  attributionFontSize?: number;
  /** Card background. Default 'rgba(255,255,255,0.95)'. */
  background?: string;
  /** Text color (default near-black for white card). */
  color?: string;
  /** Attribution color. */
  attributionColor?: string;
  /** Card border radius. Default 16. */
  borderRadius?: number;
  /** Card padding. */
  paddingX?: number; // default 48
  paddingY?: number; // default 40
  /** Drop shadow. Default soft + wide. */
  shadow?: boolean;
  /** Optional accent left border (4px line in accent color). */
  accentBorder?: string;
  /** Optional opening quote mark ornament (big "). Default true. */
  showQuoteMark?: boolean;
  /** Italic on quote text. Default true. */
  italicQuote?: boolean;
  /** Quote font family. Default serifItalic. */
  quoteFontFamily?: string;
  /** Entry frame for fade-in. */
  enterFrame?: number;
  fadeInFrames?: number;
  visibleFrames?: number;
  fadeOutFrames?: number;
}

/**
 * Crossfade envelope:
 *   enterFrame → enterFrame+fadeIn       : 0 → 1
 *   ...+fadeIn → ...+visible             : held at 1
 *   ...+visible → ...+visible+fadeOut    : 1 → 0  (only when visibleFrames set)
 *
 * If `visibleFrames` is undefined the card stays at 1 forever after the
 * fade-in completes — useful for "stays until scene ends".
 */
function crossfadeOpacity(
  frame: number,
  enterFrame: number,
  fadeInFrames: number,
  visibleFrames: number | undefined,
  fadeOutFrames: number,
): number {
  const local = frame - enterFrame;
  if (local < 0) return 0;
  if (fadeInFrames > 0 && local < fadeInFrames) {
    return interpolate(local, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (visibleFrames === undefined) return 1;
  const holdEnd = fadeInFrames + visibleFrames;
  if (local < holdEnd) return 1;
  if (fadeOutFrames > 0 && local < holdEnd + fadeOutFrames) {
    return interpolate(local, [holdEnd, holdEnd + fadeOutFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return 0;
}

/**
 * Resolve an anchor preset to a CSS position style. Pixel offsets win over
 * anchor presets so callers can still nudge a pre-anchored card.
 */
function resolveAnchorStyle(
  anchor: MagnifiedPullQuoteAnchor,
  widthPx: number,
  canvasWidth: number,
  canvasHeight: number,
  topPx: number | undefined,
  leftPx: number | undefined,
): React.CSSProperties {
  const style: React.CSSProperties = { position: "absolute" };

  // Vertical placement
  if (topPx !== undefined) {
    style.top = topPx;
  } else if (anchor === "top-third") {
    style.top = Math.round(canvasHeight / 6);
  } else if (anchor === "bottom-third") {
    style.bottom = Math.round(canvasHeight / 6);
  } else {
    // center, left-half, right-half — vertically centered
    style.top = "50%";
    style.transform = (style.transform ?? "") + " translateY(-50%)";
  }

  // Horizontal placement
  if (leftPx !== undefined) {
    style.left = leftPx;
  } else if (anchor === "left-half") {
    // Center the card in the left half of the canvas.
    style.left = Math.round(canvasWidth / 4 - widthPx / 2);
  } else if (anchor === "right-half") {
    // Center the card in the right half of the canvas.
    style.left = Math.round((canvasWidth * 3) / 4 - widthPx / 2);
  } else {
    // center, top-third, bottom-third — horizontally centered
    style.left = "50%";
    style.transform = (style.transform ?? "") + " translateX(-50%)";
  }

  // Clean up empty transform
  if (typeof style.transform === "string") {
    style.transform = style.transform.trim();
    if (style.transform === "") delete style.transform;
  }

  return style;
}

export const MagnifiedPullQuoteCard: React.FC<MagnifiedPullQuoteCardProps> = ({
  quote,
  attribution,
  source,
  anchor = "center",
  topPx,
  leftPx,
  widthPx = 720,
  quoteFontSize = 56,
  attributionFontSize = 28,
  background = "rgba(255, 255, 255, 0.95)",
  color = "#0F1B2D",
  attributionColor,
  borderRadius = 16,
  paddingX = 48,
  paddingY = 40,
  shadow = true,
  accentBorder,
  showQuoteMark = true,
  italicQuote = true,
  quoteFontFamily,
  enterFrame = 0,
  fadeInFrames = 8,
  visibleFrames,
  fadeOutFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { width: canvasWidth, height: canvasHeight } = useVideoConfig();

  const opacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
    fadeOutFrames,
  );

  if (opacity <= 0) return null;

  const positionStyle = resolveAnchorStyle(
    anchor,
    widthPx,
    canvasWidth,
    canvasHeight,
    topPx,
    leftPx,
  );

  const resolvedQuoteFamily = quoteFontFamily ?? FONT_STACKS.serifItalic;
  const resolvedAttributionColor =
    attributionColor ?? "rgba(15, 27, 45, 0.65)";
  const resolvedSourceColor = "rgba(15, 27, 45, 0.45)";

  // Soft + wide drop shadow — Matt's overlays feel like floating paper, not
  // a stark drop-shadow box. Two stacked shadows: a tight near-shadow for
  // depth definition and a broad far-shadow for the lift.
  const cardShadow = shadow
    ? "0 8px 24px rgba(0, 0, 0, 0.18), 0 24px 64px rgba(0, 0, 0, 0.22)"
    : undefined;

  return (
    <div
      style={{
        ...positionStyle,
        width: widthPx,
        background,
        borderRadius,
        // Use paddingLeft separately so the accent border doesn't eat the
        // visual padding when present — we want the quote text to align
        // consistently regardless of the accent stripe.
        paddingTop: paddingY,
        paddingBottom: paddingY,
        paddingRight: paddingX,
        paddingLeft: accentBorder ? paddingX : paddingX,
        borderLeft: accentBorder ? `4px solid ${accentBorder}` : undefined,
        boxShadow: cardShadow,
        opacity,
        boxSizing: "border-box",
        pointerEvents: "none",
        position: positionStyle.position,
      }}
    >
      {showQuoteMark ? (
        <div
          aria-hidden
          style={{
            fontFamily: FONT_STACKS.serif,
            fontWeight: 900,
            fontSize: Math.round(quoteFontSize * 1.7),
            lineHeight: 0.6,
            color,
            opacity: 0.18,
            // Pull the giant quote glyph up so it sits at the top-left of the
            // card content area without pushing the quote text down.
            marginTop: -Math.round(quoteFontSize * 0.15),
            marginBottom: Math.round(quoteFontSize * 0.05),
            userSelect: "none",
          }}
        >
          “
        </div>
      ) : null}
      <div
        style={{
          fontFamily: resolvedQuoteFamily,
          fontStyle: italicQuote ? "italic" : "normal",
          fontWeight: 400,
          fontSize: quoteFontSize,
          lineHeight: 1.35,
          color,
        }}
      >
        {quote}
      </div>
      {attribution !== undefined && attribution !== "" ? (
        <div
          style={{
            marginTop: Math.round(quoteFontSize * 0.5),
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: attributionFontSize,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: resolvedAttributionColor,
          }}
        >
          {attribution}
        </div>
      ) : null}
      {source !== undefined && source !== "" ? (
        <div
          style={{
            marginTop: attribution ? 8 : Math.round(quoteFontSize * 0.4),
            fontFamily: FONT_STACKS.mono,
            fontWeight: 400,
            fontSize: Math.round(attributionFontSize * 0.72),
            letterSpacing: "0.04em",
            color: resolvedSourceColor,
          }}
        >
          {source}
        </div>
      ) : null}
    </div>
  );
};
