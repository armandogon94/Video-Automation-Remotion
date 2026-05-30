/**
 * WebcamPipOverlay — fixed-position webcam tile chrome.
 *
 * Two variants ship from this file. Both encode the same molecule observed
 * convergently across Matthew Berman, Matt Wolfe, Bilawal, and Hormozi: a
 * persistent webcam tile pinned to a frame corner over the underlying
 * composition for the entire segment.
 *
 *   - `<WebcamPipOverlay>`    — rectangle tile, Matthew Berman convention
 *                               (top-right, 16:9 aspect, soft white border,
 *                                drop shadow).
 *   - `<NeonRingFaceCamPip>`  — circular crop with a magenta neon ring + glow
 *                               halo, Matt Wolfe convention (bottom-right,
 *                                #FF2EC4 ring, double box-shadow halo).
 *
 * Wave-5 contract — transitionVerb (for both):
 *   "Compose a fixed-position webcam tile in the corner over the underlying
 *    frame for the entire segment duration; static after fade-in."
 *
 * Source ANALYSIS docs:
 *   - references/creators/matthewberman/ANALYSIS.md  — pattern #1 WebcamPipOverlay
 *   - references/creators/mreflow/ANALYSIS.md         — pattern #1 NeonRingCircularFaceCamPIP
 *
 * Pure React FCs. Each reads `useCurrentFrame()` directly so a single mount
 * handles the entire fade-in + hold + (optional) fade-out envelope without
 * the parent having to slice the timeline with <Sequence>.
 */
import React from "react";
import { interpolate, OffthreadVideo, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

type Anchor = "top-right" | "top-left" | "bottom-right" | "bottom-left";

/**
 * Crossfade opacity envelope.
 *
 *   enterFrame                       → 0
 *   enterFrame + fadeInFrames        → 1
 *   ...held at 1 for visibleFrames   (or forever if visibleFrames undefined)
 *   end                              → 0
 */
function crossfadeOpacity(
  frame: number,
  enterFrame: number,
  fadeInFrames: number,
  visibleFrames: number | undefined,
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
  return 0;
}

function anchorOffsets(
  anchor: Anchor,
  insetPx: number,
): React.CSSProperties {
  switch (anchor) {
    case "top-right":
      return { top: insetPx, right: insetPx };
    case "top-left":
      return { top: insetPx, left: insetPx };
    case "bottom-right":
      return { bottom: insetPx, right: insetPx };
    case "bottom-left":
      return { bottom: insetPx, left: insetPx };
  }
}

// ---------------------------------------------------------------------------
// 1. <WebcamPipOverlay> — rectangle webcam tile (Matthew Berman style)
// ---------------------------------------------------------------------------

export interface WebcamPipOverlayProps {
  /** Source video for the webcam feed. Falls back to placeholder if absent. */
  videoSrc?: string;
  /** Anchor corner. Default 'top-right' (Matthew Berman convention). */
  anchor?: Anchor;
  /** Inset from edge in px. Default 40. */
  insetPx?: number;
  /** Width in px. Default 320. */
  widthPx?: number;
  /** Aspect ratio. Default '16:9'. */
  aspect?: "16:9" | "4:3" | "1:1";
  /** Border radius. Default 12. */
  borderRadius?: number;
  /** Border color. Default 'rgba(255,255,255,0.20)'. */
  borderColor?: string;
  borderWidthPx?: number;
  /** Drop shadow color + offset. Default soft black 0 8px 24px. */
  shadow?: boolean;
  /** Optional name label below the webcam. */
  nameLabel?: string;
  /** Optional opacity. Default 1. */
  opacity?: number;
  /** Visible throughout — no per-frame animation by default. */
  visibleFrames?: number;
  enterFrame?: number;
  fadeInFrames?: number;
}

const ASPECT_RATIOS: Record<NonNullable<WebcamPipOverlayProps["aspect"]>, number> =
  {
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "1:1": 1,
  };

/**
 * Compose a fixed-position webcam tile in the corner over the underlying frame
 * for the entire segment duration; static after fade-in.
 *
 * Matthew Berman convention: 16:9 rectangle pinned top-right with a hairline
 * white border and a soft drop shadow. The tile is rendered as a CSS-positioned
 * `<OffthreadVideo>` if `videoSrc` is provided; otherwise a neutral charcoal
 * placeholder rectangle is shown so layouts can be previewed before footage
 * is wired in.
 */
export const WebcamPipOverlay: React.FC<WebcamPipOverlayProps> = ({
  videoSrc,
  anchor = "top-right",
  insetPx = 40,
  widthPx = 320,
  aspect = "16:9",
  borderRadius = 12,
  borderColor = "rgba(255,255,255,0.20)",
  borderWidthPx = 2,
  shadow = true,
  nameLabel,
  opacity = 1,
  visibleFrames,
  enterFrame = 0,
  fadeInFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const fadeOpacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
  );
  if (fadeOpacity <= 0) return null;

  const ratio = ASPECT_RATIOS[aspect];
  const heightPx = Math.round(widthPx / ratio);

  const offsets = anchorOffsets(anchor, insetPx);

  const boxShadow = shadow
    ? "0 8px 24px rgba(0,0,0,0.45)"
    : undefined;

  return (
    <div
      style={{
        position: "absolute",
        ...offsets,
        opacity: opacity * fadeOpacity,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: widthPx,
          height: heightPx,
          borderRadius,
          overflow: "hidden",
          border: `${borderWidthPx}px solid ${borderColor}`,
          background: "#1A1A1A",
          boxShadow,
        }}
      >
        {videoSrc ? (
          <OffthreadVideo
            src={videoSrc}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)",
            }}
          />
        )}
      </div>
      {nameLabel ? (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: 18,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.02em",
            textShadow: "0 2px 6px rgba(0,0,0,0.45)",
            whiteSpace: "nowrap",
          }}
        >
          {nameLabel}
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. <NeonRingFaceCamPip> — circular crop + neon ring (Matt Wolfe style)
// ---------------------------------------------------------------------------

export interface NeonRingFaceCamPipProps {
  videoSrc?: string;
  /** Anchor. Default 'bottom-right' (Matt Wolfe). */
  anchor?: Anchor;
  insetPx?: number; // default 60
  /** Diameter in px. Default 220. */
  sizePx?: number;
  /** Neon ring color. Default '#FF2EC4' (Matt magenta). */
  ringColor?: string;
  /** Ring width in px. Default 8 (~22% of sizePx scaling). */
  ringWidthPx?: number;
  /** Glow halo (px). Default 24. */
  glowRadiusPx?: number;
  /** Inner circle border (white). Default true. */
  innerBorder?: boolean;
  enterFrame?: number;
  fadeInFrames?: number;
  visibleFrames?: number;
}

/**
 * Compose a circular webcam tile in the corner with a magenta neon ring + glow
 * halo, static after fade-in.
 *
 * Matt Wolfe convention: bottom-right, 220px diameter, #FF2EC4 ring with a
 * double box-shadow halo (one tight high-alpha ring + one wide low-alpha bloom)
 * that reads as a soft magenta neon glow against dark backgrounds. An inner
 * 2px white hairline rim seats the face inside the ring; toggle off via
 * `innerBorder={false}` for the minimalist look.
 */
export const NeonRingFaceCamPip: React.FC<NeonRingFaceCamPipProps> = ({
  videoSrc,
  anchor = "bottom-right",
  insetPx = 60,
  sizePx = 220,
  ringColor = "#FF2EC4",
  ringWidthPx = 8,
  glowRadiusPx = 24,
  innerBorder = true,
  enterFrame = 0,
  fadeInFrames = 0,
  visibleFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeOpacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
  );
  if (fadeOpacity <= 0) return null;

  const offsets = anchorOffsets(anchor, insetPx);

  // Glow halo: tighter inner ring (88 = ~53% alpha) + wider outer bloom
  // (44 = ~27% alpha at 2x radius) — same two-stop bloom trick the yellow
  // lower-third uses for Hormozi's neon text.
  const innerHalo = `0 0 ${glowRadiusPx}px ${ringColor}88`;
  const outerHalo = `0 0 ${glowRadiusPx * 2}px ${ringColor}44`;
  const glow = `${innerHalo}, ${outerHalo}`;

  // Inner circle diameter = full size minus the ring on both sides.
  const innerSize = sizePx - ringWidthPx * 2;

  return (
    <div
      style={{
        position: "absolute",
        ...offsets,
        opacity: fadeOpacity,
        pointerEvents: "none",
        width: sizePx,
        height: sizePx,
        borderRadius: "50%",
        background: ringColor,
        boxShadow: glow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#1A1A1A",
          border: innerBorder
            ? "2px solid rgba(255,255,255,0.85)"
            : "none",
          boxSizing: "border-box",
        }}
      >
        {videoSrc ? (
          <OffthreadVideo
            src={videoSrc}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
};
