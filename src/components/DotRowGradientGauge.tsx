/**
 * DotRowGradientGauge — Adam Rosler's signature "drift gauge" molecule.
 *
 * Source: references/creators/adamrosler/ANALYSIS.md — Adam's pattern #3
 * with 5/18 frequency (HIGHEST signature on his account). Frame reference:
 *   references/creators/adamrosler/hvtB3UaQ1wg/frames/frame-NNN.jpg
 *     (telephone-game drift gauge).
 *
 * Visual: a horizontal row of ~20 dots that fills L→R one at a time. Each lit
 * dot interpolates green→yellow→red along a gradient lookup keyed on its
 * position in the row, so the gauge reads like a thermometer of "how bad did
 * the drift get". Adam uses it for "drift" / "error rate" / "telephone-game"
 * style metrics where the right-hand end of the row is the danger zone.
 *
 *   ●●●●●●●●●●●●○○○○○○○○
 *   green ─────► yellow ─────► red    (color baked in by index)
 *
 * Wave-7 cross-creator molecule. Pure React FC reading `useCurrentFrame()`
 * internally so callers only have to wire the `startFrame` offset.
 *
 * Transition verb (Wave-5 contract):
 *   "Dots in a row light up one at a time L→R over 30 frames; each lit dot
 *    interpolates green→yellow→red along a gradient lookup keyed on its index."
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../brand";

export interface DotRowGradientGaugeProps {
  /** Number of dots in the row. Default 20. */
  count?: number;
  /** Final fill state — how many dots should be lit at the end (0..count). */
  fillTo: number;
  /** Color stops along the L→R gradient. Default green→yellow→red. */
  colorStops?: string[];
  /** Dot size in px. Default 18. */
  dotSizePx?: number;
  /** Gap between dots (px). Default 8. */
  gapPx?: number;
  /** Total fill animation duration (frames). Default 30. */
  fillDurationFrames?: number;
  /** Frame at which fill begins. */
  startFrame?: number;
  /** Whether unfilled dots are visible (translucent). Default true. */
  showUnfilled?: boolean;
  unfilledColor?: string;
  /** Optional label above the row (e.g. "DRIFT"). */
  label?: string;
  /** Optional caption below the row (e.g. "12 of 20"). */
  caption?: string;
  /** Position on canvas. */
  topPx?: number;
  leftPx?: number;
  centerOnCanvas?: boolean;
  fontFamily?: string;
}

const DEFAULT_COLOR_STOPS = ["#3ECF8E", "#F5C518", "#E5484D"];

/**
 * Parse a hex color (#RGB, #RRGGBB) into an [r, g, b] tuple in 0..255.
 * Returns null when the input isn't a parseable hex string — caller falls back
 * to the raw value so rgb()/rgba()/named colors still render (just without
 * interpolation between stops).
 */
function parseHex(value: string): [number, number, number] | null {
  const v = value.trim().replace(/^#/, "");
  if (v.length === 3) {
    const r = parseInt(v[0] + v[0], 16);
    const g = parseInt(v[1] + v[1], 16);
    const b = parseInt(v[2] + v[2], 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return [r, g, b];
  }
  if (v.length === 6) {
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return [r, g, b];
  }
  return null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Sample a color from the gradient stops at normalized position t ∈ [0,1].
 * Implements piecewise linear interpolation in sRGB — close enough for the
 * green→yellow→red signal gauge Adam uses; not perceptually uniform but the
 * three default stops are spaced to read correctly.
 */
function sampleGradient(stops: string[], t: number): string {
  if (stops.length === 0) return "#FFFFFF";
  if (stops.length === 1) return stops[0];
  const clamped = Math.max(0, Math.min(1, t));
  const segments = stops.length - 1;
  const scaled = clamped * segments;
  const lowerIdx = Math.min(segments - 1, Math.floor(scaled));
  const upperIdx = lowerIdx + 1;
  const localT = scaled - lowerIdx;

  const lo = parseHex(stops[lowerIdx]);
  const hi = parseHex(stops[upperIdx]);
  if (!lo || !hi) {
    // Fallback: snap to the nearest stop (no rgb interpolation possible).
    return localT < 0.5 ? stops[lowerIdx] : stops[upperIdx];
  }
  const r = Math.round(lerp(lo[0], hi[0], localT));
  const g = Math.round(lerp(lo[1], hi[1], localT));
  const b = Math.round(lerp(lo[2], hi[2], localT));
  return `rgb(${r}, ${g}, ${b})`;
}

export const DotRowGradientGauge: React.FC<DotRowGradientGaugeProps> = ({
  count = 20,
  fillTo,
  colorStops = DEFAULT_COLOR_STOPS,
  dotSizePx = 18,
  gapPx = 8,
  fillDurationFrames = 30,
  startFrame = 0,
  showUnfilled = true,
  unfilledColor = "rgba(255, 255, 255, 0.10)",
  label,
  caption,
  topPx,
  leftPx,
  centerOnCanvas = false,
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const clampedFillTo = Math.max(0, Math.min(count, fillTo));
  const lit = Math.round(
    interpolate(
      frame,
      [startFrame, startFrame + Math.max(1, fillDurationFrames)],
      [0, clampedFillTo],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );

  const resolvedFont = fontFamily ?? FONT_STACKS.sans;

  // Index → normalized gradient position. Using (count - 1) as the denominator
  // so the first dot is exactly stops[0] and the last is exactly stops[last] —
  // matches Adam's gauges where the rightmost dot reads as the deepest red.
  const denom = Math.max(1, count - 1);

  const dots: React.ReactElement[] = [];
  for (let i = 0; i < count; i += 1) {
    const isLit = i < lit;
    const color = isLit
      ? sampleGradient(colorStops, i / denom)
      : unfilledColor;
    if (!isLit && !showUnfilled) {
      dots.push(
        <span
          key={i}
          style={{
            width: dotSizePx,
            height: dotSizePx,
            display: "inline-block",
          }}
        />,
      );
      continue;
    }
    dots.push(
      <span
        key={i}
        style={{
          width: dotSizePx,
          height: dotSizePx,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />,
    );
  }

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

  return (
    <div
      style={{
        ...positionStyle,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {label !== undefined ? (
        <div
          style={{
            fontFamily: resolvedFont,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            opacity: 0.85,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: gapPx,
        }}
      >
        {dots}
      </div>
      {caption !== undefined ? (
        <div
          style={{
            fontFamily: resolvedFont,
            fontWeight: 500,
            fontSize: 20,
            color: "#FFFFFF",
            opacity: 0.7,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
