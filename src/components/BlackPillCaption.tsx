/**
 * BlackPillCaption — Matt Wolfe + Hormozi shared "seam pill" molecule.
 *
 * Source:
 *  - references/creators/mreflow/ANALYSIS.md — Matt's pattern #7
 *    `BlackPillSingleWordCaption` (HIGH frequency).
 *  - Also appears across Hormozi long-form as the black-pill karaoke caption
 *    sitting on the seam between split screens, with the active word in his
 *    signature yellow.
 *
 * Visual: a black rounded pill (or rect, controllable via borderRadius)
 * containing 1-4 words of caption text. When `activeWord` is provided, the
 * matching word renders in `activeColor` (default Hormozi yellow #F1C232)
 * while the rest stay white — the karaoke-on-seam effect that anchors the
 * cut between A-roll and B-roll.
 *
 * Wave-7 cross-creator molecule. Pure React FC reading `useCurrentFrame()`
 * internally to drive the fade-in/fade-out envelope.
 *
 * Transition verb (Wave-5 contract):
 *   "Black rounded pill fades in over 8 frames with a 1-4 word caption inside;
 *    if an activeWord is set, that word renders in the active color (yellow
 *    default) while the rest stay white."
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

export interface BlackPillCaptionProps {
  /** Caption text. */
  text: string;
  /** Optional active word to highlight (matched case-insensitive). */
  activeWord?: string;
  /** Position. Default 'center-y'. */
  position?: "top" | "center-y" | "bottom";
  /** Manual top offset — only used when `position` is left undefined. */
  topPx?: number;
  /** Pill background. Default '#000000'. */
  background?: string;
  /** Text color. Default '#FFFFFF'. */
  color?: string;
  /** Active word color (default yellow #F1C232 — Hormozi). */
  activeColor?: string;
  /** Pill horizontal padding. Default 32. */
  paddingX?: number;
  /** Pill vertical padding. Default 18. */
  paddingY?: number;
  /** Border radius. Default 999 (full pill). */
  borderRadius?: number;
  /** Font size. Default 48. */
  fontSize?: number;
  /** Font weight. Default 900. */
  fontWeight?: number;
  /** Letter spacing. Default 0. */
  letterSpacing?: string;
  /** Uppercase. Default false. */
  uppercase?: boolean;
  /** Optional drop shadow. Default true. */
  shadow?: boolean;
  /** Max width (will wrap if too long). Default 880. */
  maxWidthPx?: number;
  /** Entry frame for fade-in. */
  enterFrame?: number;
  /** Fade-in duration in frames. Default 8. */
  fadeInFrames?: number;
  /** How long the pill stays at full opacity. Default 60. */
  visibleFrames?: number;
  /** Fade-out duration in frames. Default 8. */
  fadeOutFrames?: number;
}

/**
 * Strip leading/trailing punctuation for case-insensitive word matching.
 * Keeps comparison Unicode-friendly without dragging in Intl helpers.
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export const BlackPillCaption: React.FC<BlackPillCaptionProps> = ({
  text,
  activeWord,
  position = "center-y",
  topPx,
  background = "#000000",
  color = "#FFFFFF",
  activeColor = "#F1C232",
  paddingX = 32,
  paddingY = 18,
  borderRadius = 999,
  fontSize = 48,
  fontWeight = 900,
  letterSpacing = "0",
  uppercase = false,
  shadow = true,
  maxWidthPx = 880,
  enterFrame = 0,
  fadeInFrames = 8,
  visibleFrames = 60,
  fadeOutFrames = 8,
}) => {
  const frame = useCurrentFrame();

  // Two-stage envelope: fade-in to 1, hold for visibleFrames, fade-out to 0.
  const fadeInEnd = enterFrame + Math.max(0, fadeInFrames);
  const holdEnd = fadeInEnd + Math.max(0, visibleFrames);
  const fadeOutEnd = holdEnd + Math.max(0, fadeOutFrames);

  let opacity: number;
  if (frame < enterFrame) {
    opacity = 0;
  } else if (frame < fadeInEnd) {
    opacity = interpolate(frame, [enterFrame, fadeInEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < holdEnd) {
    opacity = 1;
  } else if (frame < fadeOutEnd) {
    opacity = interpolate(frame, [holdEnd, fadeOutEnd], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    opacity = 0;
  }

  // Position resolution — named positions take precedence over raw topPx so
  // callers can opt into the 9x16 layout presets without doing math.
  const positionStyle: React.CSSProperties = (() => {
    if (position === "top") {
      return { position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)" };
    }
    if (position === "bottom") {
      return { position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)" };
    }
    if (position === "center-y") {
      return {
        position: "absolute",
        top: topPx ?? "50%",
        left: "50%",
        transform: topPx !== undefined ? "translateX(-50%)" : "translate(-50%, -50%)",
      };
    }
    return { position: "absolute", top: topPx, left: "50%", transform: "translateX(-50%)" };
  })();

  const normalizedActive = activeWord ? normalizeWord(activeWord) : null;
  // Split on whitespace runs — preserves single-word captions as a 1-element
  // array, which is the most common Matt-Wolfe usage.
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  return (
    <div
      style={{
        ...positionStyle,
        opacity,
        background,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        borderRadius,
        maxWidth: maxWidthPx,
        boxShadow: shadow ? "0 8px 24px rgba(0, 0, 0, 0.35)" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontSize,
          fontWeight,
          color,
          letterSpacing,
          textTransform: uppercase ? "uppercase" : "none",
          lineHeight: 1.15,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {words.map((word, i) => {
          const isActive =
            normalizedActive !== null &&
            normalizeWord(word) === normalizedActive;
          return (
            <React.Fragment key={`${word}-${i}`}>
              <span style={{ color: isActive ? activeColor : color }}>
                {word}
              </span>
              {i < words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </span>
    </div>
  );
};
