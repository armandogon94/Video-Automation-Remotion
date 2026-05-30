/**
 * YellowGlowLowerThird — one- or two-line yellow bold sans-caps lower-third
 * with a soft yellow glow halo.
 *
 * Hormozi long-form HIGH-confidence pattern H4 (consensus, 6+ video instances).
 * The signature "money word" / lesson-callout lower-third — black canvas, big
 * yellow Inter 900 caps, soft outer glow that makes the type bloom slightly.
 *
 *   ╭────────────────────────────────────────────╮
 *   │                                            │
 *   │                                            │
 *   │       MORE ACTION, MORE LEARNING          │  ← #F1C232, glow
 *   │       The fastest path to mastery          │  (optional subtitle)
 *   │                                            │
 *   ╰────────────────────────────────────────────╯
 *
 * Pure React FC. Reads `useCurrentFrame()` so a single mount handles the full
 * enter → hold → exit envelope. Mount inside an `<AbsoluteFill>` at any depth.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent positions/sizes the slot (Tier-B per ADR-001 §2.3). Source pattern: H4.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

export interface YellowGlowLowerThirdProps {
  /** Primary text (always shown). */
  text: string;
  /** Optional subtitle below the primary text. */
  subtitle?: string;
  /** Y position from bottom (px). Default 160. */
  bottomPx?: number;
  /** Yellow accent color. Default #F1C232 (Hormozi). */
  yellow?: string;
  /** Optional secondary yellow for the subtitle. */
  subtitleYellow?: string;
  /** Max width. Default 1600 (16:9 canvas). */
  maxWidthPx?: number;
  /** Font size. Default 88 (primary). */
  primaryFontSize?: number;
  subtitleFontSize?: number;
  /** Letter spacing. Default 0.02em. */
  letterSpacing?: string;
  /** Glow halo intensity (px). Default 24. */
  glowRadiusPx?: number;
  /** Optional fade-in. Default 0. */
  fadeInFrames?: number;
  enterFrame?: number;
  visibleFrames?: number;
  fadeOutFrames?: number;
  /** Uppercase transform. Default true. */
  uppercase?: boolean;
}

/**
 * Crossfade opacity envelope. Mirrors the helper in `HormoziOverlays.tsx`:
 *
 *   enterFrame → enterFrame+fadeIn   : 0 → 1
 *   ...+fadeIn → ...+visible         : held at 1
 *   ...+visible → ...+visible+fadeOut: 1 → 0  (only if visibleFrames defined)
 *
 * If `visibleFrames` is undefined the lower-third holds at 1 forever after the
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

export const YellowGlowLowerThird: React.FC<YellowGlowLowerThirdProps> = ({
  text,
  subtitle,
  bottomPx = 160,
  yellow = "#F1C232",
  subtitleYellow,
  maxWidthPx = 1600,
  primaryFontSize = 88,
  subtitleFontSize,
  letterSpacing = "0.02em",
  glowRadiusPx = 24,
  fadeInFrames = 0,
  enterFrame = 0,
  visibleFrames,
  fadeOutFrames = 0,
  uppercase = true,
}) => {
  const frame = useCurrentFrame();

  const opacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
    fadeOutFrames,
  );

  if (opacity <= 0) return null;

  const subtitleColor = subtitleYellow ?? yellow;
  const subtitleSize = subtitleFontSize ?? Math.round(primaryFontSize * 0.42);

  // Glow halo: two stacked text-shadows give the Hormozi "bloom" — a tighter
  // inner halo (8a) and a softer outer halo (44 = 27% alpha) doubling the
  // radius.
  const glow = `0 0 ${glowRadiusPx}px ${yellow}88, 0 0 ${glowRadiusPx * 2}px ${yellow}44`;
  const subtitleGlow = `0 0 ${Math.round(glowRadiusPx * 0.6)}px ${subtitleColor}66`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomPx,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: primaryFontSize,
          color: yellow,
          letterSpacing,
          textTransform: uppercase ? "uppercase" : "none",
          textAlign: "center",
          maxWidth: maxWidthPx,
          lineHeight: 1.05,
          textShadow: glow,
        }}
      >
        {text}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: subtitleSize,
            color: subtitleColor,
            letterSpacing,
            textTransform: uppercase ? "uppercase" : "none",
            textAlign: "center",
            maxWidth: maxWidthPx,
            lineHeight: 1.15,
            textShadow: subtitleGlow,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
