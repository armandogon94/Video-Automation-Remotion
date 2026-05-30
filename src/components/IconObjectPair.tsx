/**
 * IconObjectPair — Adam Rosler signature "two-thing + bracketed callout".
 *
 * Source: references/creators/adamrosler/ANALYSIS.md — Adam's NEW molecule
 * proposal "IconObjectPair (1/18 — bracketed numeric callout)". Adam uses
 * this to depict a measured relationship between two things: a DB and an
 * LLM with `[2.5×]` between them, a GPU and a token stream with `[12ms]`,
 * a user and a model with `[97% acc]`.
 *
 * Visual:
 *   ╭───╮          ╭───╮
 *   │ 🗄 │  [2.5×]  │ 🧠 │
 *   ╰───╯          ╰───╯
 *   DB             LLM
 *
 * Pure React FC reading `useCurrentFrame()` internally. The three elements
 * (left icon, callout, right icon) fade in sequentially: left enters at
 * `enterFrame + leftEnterOffset`, right enters at `enterFrame + rightEnterOffset`
 * (default +6), callout enters at `enterFrame + calloutEnterOffset` (default +12).
 *
 * Two icon objects side-by-side with a bracketed numeric callout between them;
 * left icon fades in at enterFrame, right icon fades in 6 frames later, callout
 * fades in 12 frames after enter. Used to depict a relationship or measurement
 * between two things (e.g. database → LLM with [2.5×] callout).
 */
import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

export interface IconObjectPairIcon {
  /** Image src path (rendered via `<Img>`). */
  src?: string;
  /** Emoji glyph (rendered as text). */
  emoji?: string;
  /** Inline SVG path `d` attribute (rendered inside a `<svg>`). */
  svgPath?: string;
  /** Optional small label below the icon (mono tracked uppercase). */
  label?: string;
  /** Icon size in px (square). Default 120. */
  sizePx?: number;
  /** Color (used for emoji text color or svg fill). */
  color?: string;
}

export interface IconObjectPairProps {
  /** Left icon — can be SVG path, emoji, or src path. */
  left: IconObjectPairIcon;
  /** Right icon — same shape as left. */
  right: IconObjectPairIcon;
  /** Callout in the middle (e.g. "[2.5×]" or "[12ms]"). */
  callout: string;
  /** Callout color. Default accent. */
  calloutColor?: string;
  /** Callout font size. Default 56. */
  calloutFontSize?: number;
  /** Callout font family. Default mono. */
  calloutFontFamily?: string;
  /** Spacing between left icon and callout (px). Default 48. */
  gapPx?: number;
  /** Total horizontal anchor. */
  topPx?: number;
  centerOnCanvas?: boolean;
  leftPx?: number;
  /** Entry choreography. */
  enterFrame?: number;
  /** Left icon enter offset (frames). Default 0. */
  leftEnterOffset?: number;
  /** Right icon enter offset (frames). Default 6. */
  rightEnterOffset?: number;
  /** Callout enter offset (frames). Default 12. */
  calloutEnterOffset?: number;
  /** Per-element fade-in frames. Default 8. */
  fadeInFrames?: number;
}

const DEFAULT_ICON_SIZE_PX = 120;
const DEFAULT_CALLOUT_COLOR = "#C4F84A";

/**
 * Fade-in helper. Returns 0 before `start`, 1 after `start+duration`, and
 * linear interpolation in between. Identical envelope shape across all three
 * elements so the sequential cascade reads as a single staggered motion.
 */
function fadeIn(
  frame: number,
  start: number,
  duration: number,
): number {
  if (duration <= 0) return frame >= start ? 1 : 0;
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Render a single icon slot — emoji, image, or inline SVG path.
 *
 * Resolution order: `svgPath` > `src` > `emoji`. If none are provided the
 * slot renders an empty box at `sizePx` so the layout still reserves space
 * (useful when a caller is animating one slot in later).
 */
const IconSlot: React.FC<{
  icon: IconObjectPairIcon;
  opacity: number;
}> = ({ icon, opacity }) => {
  const size = icon.sizePx ?? DEFAULT_ICON_SIZE_PX;
  const color = icon.color ?? "#FFFFFF";

  let glyph: React.ReactNode;
  if (icon.svgPath !== undefined && icon.svgPath !== "") {
    glyph = (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ display: "block" }}
      >
        <path d={icon.svgPath} fill={color} />
      </svg>
    );
  } else if (icon.src !== undefined && icon.src !== "") {
    glyph = (
      <Img
        src={icon.src}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  } else if (icon.emoji !== undefined && icon.emoji !== "") {
    glyph = (
      <span
        style={{
          fontSize: Math.round(size * 0.85),
          lineHeight: 1,
          color,
          display: "block",
        }}
      >
        {icon.emoji}
      </span>
    );
  } else {
    glyph = (
      <span
        style={{
          width: size,
          height: size,
          display: "block",
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {glyph}
      </div>
      {icon.label !== undefined && icon.label !== "" ? (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color,
            opacity: 0.85,
          }}
        >
          {icon.label}
        </div>
      ) : null}
    </div>
  );
};

export const IconObjectPair: React.FC<IconObjectPairProps> = ({
  left,
  right,
  callout,
  calloutColor = DEFAULT_CALLOUT_COLOR,
  calloutFontSize = 56,
  calloutFontFamily,
  gapPx = 48,
  topPx,
  centerOnCanvas = false,
  leftPx,
  enterFrame = 0,
  leftEnterOffset = 0,
  rightEnterOffset = 6,
  calloutEnterOffset = 12,
  fadeInFrames = 8,
}) => {
  const frame = useCurrentFrame();

  const leftOpacity = fadeIn(
    frame,
    enterFrame + leftEnterOffset,
    fadeInFrames,
  );
  const rightOpacity = fadeIn(
    frame,
    enterFrame + rightEnterOffset,
    fadeInFrames,
  );
  const calloutOpacity = fadeIn(
    frame,
    enterFrame + calloutEnterOffset,
    fadeInFrames,
  );

  const positionStyle: React.CSSProperties = centerOnCanvas
    ? {
        position: "absolute",
        top: topPx ?? "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    : topPx !== undefined || leftPx !== undefined
      ? {
          position: "absolute",
          top: topPx,
          left: leftPx,
        }
      : {};

  const resolvedCalloutFamily = calloutFontFamily ?? FONT_STACKS.mono;

  return (
    <div
      style={{
        ...positionStyle,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: gapPx,
      }}
    >
      <IconSlot icon={left} opacity={leftOpacity} />
      <div
        style={{
          fontFamily: resolvedCalloutFamily,
          fontWeight: 700,
          fontSize: calloutFontSize,
          color: calloutColor,
          opacity: calloutOpacity,
          letterSpacing: "0.02em",
          lineHeight: 1,
          // Keep the callout vertically centered against the icon row even if
          // one side has a label below — labels live INSIDE the IconSlot
          // column, so the icon glyphs themselves still center against this.
          alignSelf: "center",
          whiteSpace: "nowrap",
        }}
      >
        {callout}
      </div>
      <IconSlot icon={right} opacity={rightOpacity} />
    </div>
  );
};
