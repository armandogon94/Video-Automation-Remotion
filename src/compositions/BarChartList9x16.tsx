/**
 * BarChartList9x16 — vertical (1080×1920) horizontal-bar list with row labels.
 *
 * Wave-4 inspiration: @DIYSmartCode's V3 red-team gap N4 — a data-viz template
 * the prior set was missing. Each row is a self-contained <category label →
 * animated bar → numeric value> unit; bars grow from 0 → value with a staggered
 * cascade so the eye scans rows top-to-bottom.
 *
 * Use for ranked / segmented numeric stories:
 *   - "% of devs using each tool"
 *   - "Requests per second by model"
 *   - "Errors by class"
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Section label eyebrow (~y=200)
 *   - BARS BLOCK — rows of 90px height, vertically centered in the body zone:
 *       · Left: category label (mono uppercase, +0.18em tracking)
 *       · Right: animated horizontal bar, with value label inside (wide bar)
 *         or floating to the right (narrow bar)
 *   - Optional EditorialCaption (default false — chart already dense)
 *
 * Motion grammar:
 *   - Each row enters via `staggerEntry` (accelerating cascade — Carlos V4
 *     prescription) — row[i] starts at `staggerFrames * decay^i`.
 *   - Each bar's width interpolates 0 → (value / maxValue) × containerWidth
 *     over `fillDurationSeconds`, using `outQuart` from src/timing/easing.
 *   - Each value label counts up via `countUp` synced with the bar's fill window.
 *   - Direction "rtl" reverses the bar so it grows right-to-left (e.g. for
 *     mirror layouts).
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, getBodyTextColor } from "../brand";
import type { PaletteMode } from "../brand";
import { countUp, formatCount, staggerEntry } from "../animation";
import { outQuart } from "../timing/easing";

// ─── Schema ────────────────────────────────────────────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

const barSchema = z.object({
  /** Left-column category label (mono uppercase). */
  label: z.string().default(""),
  /** Numeric value (used for count-up + bar width). */
  value: z.number().default(0),
  /** Optional suffix after the value (e.g. "%", " requests"). */
  suffix: z.string().default(""),
  /** Optional per-bar fill color (overrides composition accent). */
  color: z.string().default(""),
  /** Decimals to display on the count-up. Default 0. */
  decimals: z.number().int().min(0).max(4).default(0),
});
export type BarChartBar = z.infer<typeof barSchema>;

export const barChartList9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default(""),
  bars: z.array(barSchema).default([]),
  /** Bar fill direction. Default L→R. */
  direction: z.enum(["ltr", "rtl"]).default("ltr"),
  /** Per-bar entry stagger (frames). Default 4. */
  staggerFrames: z.number().int().min(0).max(60).default(4),
  /** Bar fill duration (seconds). Default 0.8. */
  fillDurationSeconds: z.number().min(0.1).max(8).default(0.8),
  /** Max value to scale bars against (default = max of bars.value). */
  maxValue: z.number().optional(),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type BarChartList9x16Props = z.infer<typeof barChartList9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const SECTION_LABEL_Y = 200;

const ROW_HEIGHT = 90;
const ROW_GAP = 24;
const ROW_UNIT = ROW_HEIGHT + ROW_GAP;

const BARS_ZONE_TOP = 380;
const BARS_ZONE_BOTTOM = 1700;
const BARS_ZONE_LEFT = 80;
const BARS_ZONE_RIGHT = 80;
const BARS_ZONE_WIDTH = 1080 - BARS_ZONE_LEFT - BARS_ZONE_RIGHT; // 920

const LABEL_COL_WIDTH = 320;
const LABEL_TO_BAR_GAP = 24;
const BAR_COL_LEFT = LABEL_COL_WIDTH + LABEL_TO_BAR_GAP;
const BAR_COL_WIDTH = BARS_ZONE_WIDTH - BAR_COL_LEFT;

const BAR_HEIGHT = 56;
const BAR_RADIUS = 12;

const VALUE_FONT_SIZE = 36;
const LABEL_FONT_SIZE = 30;

// Bar width threshold above which the value label sits INSIDE the fill.
const INSIDE_VALUE_THRESHOLD = 0.3;

// ─── Single row ────────────────────────────────────────────────────
const BarRow: React.FC<{
  bar: BarChartBar;
  topPx: number;
  enterFrame: number;
  fillDurationFrames: number;
  maxValue: number;
  direction: "ltr" | "rtl";
  inkColor: string;
  paperColor: string;
  mutedColor: string;
  accentColor: string;
  paletteMode: PaletteMode;
}> = ({
  bar,
  topPx,
  enterFrame,
  fillDurationFrames,
  maxValue,
  direction,
  inkColor,
  paperColor,
  mutedColor,
  accentColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();
  const local = frame - enterFrame;
  if (local < 0) return null;

  // Row + label fade-in.
  const fadeFrames = 6;
  const rowOpacity = interpolate(local, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bar fill — width interpolates 0 → targetPx with outQuart.
  const fillLinear = interpolate(local, [0, fillDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillEased = outQuart(Math.max(0, Math.min(1, fillLinear)));
  const fraction = maxValue > 0 ? Math.max(0, Math.min(1, bar.value / maxValue)) : 0;
  const targetPx = BAR_COL_WIDTH * fraction;
  const fillPx = targetPx * fillEased;

  // Live count-up.
  const liveVal = countUp(frame, {
    from: 0,
    to: bar.value,
    startFrame: enterFrame,
    durationFrames: fillDurationFrames,
    easing: "outQuart",
    decimals: bar.decimals,
  });
  const valueText = formatCount(liveVal, {
    decimals: bar.decimals,
    suffix: bar.suffix,
    thousands: true,
  });

  // Value label appears once fill ≥ 90% of its target.
  const valueFadeStart = Math.round(fillDurationFrames * 0.9);
  const valueOpacity = interpolate(local, [valueFadeStart, valueFadeStart + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fillColor = bar.color && bar.color.length > 0 ? bar.color : accentColor;
  const labelSitsInside = fraction >= INSIDE_VALUE_THRESHOLD;

  // For rtl, the bar grows from the right edge of the bar column.
  const fillLeft = direction === "rtl" ? BAR_COL_WIDTH - fillPx : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: BARS_ZONE_LEFT,
        width: BARS_ZONE_WIDTH,
        height: ROW_HEIGHT,
        display: "flex",
        alignItems: "center",
        opacity: rowOpacity,
      }}
    >
      {/* Left: category label */}
      <div
        style={{
          width: LABEL_COL_WIDTH,
          paddingRight: LABEL_TO_BAR_GAP,
          fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
          fontSize: LABEL_FONT_SIZE,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: getBodyTextColor(paletteMode, inkColor, LABEL_FONT_SIZE),
          lineHeight: 1.1,
          textAlign: direction === "rtl" ? "right" : "left",
        }}
      >
        {bar.label}
      </div>

      {/* Right: track + fill + value */}
      <div
        style={{
          position: "relative",
          width: BAR_COL_WIDTH,
          height: ROW_HEIGHT,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track (background) at ~10% muted alpha */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
            width: BAR_COL_WIDTH,
            height: BAR_HEIGHT,
            background: `${mutedColor}1A`,
            borderRadius: BAR_RADIUS,
          }}
        />
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: fillLeft,
            top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
            width: fillPx,
            height: BAR_HEIGHT,
            background: fillColor,
            borderRadius: BAR_RADIUS,
          }}
        />
        {/* Value label — inside when wide, outside (floating right of the fill) when narrow. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            opacity: valueOpacity,
            ...(labelSitsInside
              ? direction === "rtl"
                ? { left: fillLeft + 18 }
                : { right: BAR_COL_WIDTH - fillPx + 18 }
              : direction === "rtl"
                ? { right: BAR_COL_WIDTH - (BAR_COL_WIDTH - fillPx) + 18 }
                : { left: fillPx + 18 }),
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: VALUE_FONT_SIZE,
            color: labelSitsInside ? paperColor : inkColor,
            letterSpacing: "-0.01em",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {valueText}
        </div>
      </div>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────
export const BarChartList9x16: React.FC<BarChartList9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  bars,
  direction,
  staggerFrames,
  fillDurationSeconds,
  maxValue: maxValueProp,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Section label fade-in.
  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Auto-compute maxValue if not supplied.
  const maxValue =
    typeof maxValueProp === "number" && maxValueProp > 0
      ? maxValueProp
      : Math.max(0, ...bars.map((b) => b.value));

  // Vertical layout — center the bars block in the body zone.
  const totalBlockHeight =
    bars.length > 0
      ? bars.length * ROW_HEIGHT + (bars.length - 1) * ROW_GAP
      : 0;
  const bodyZoneHeight = BARS_ZONE_BOTTOM - BARS_ZONE_TOP;
  const blockTop = BARS_ZONE_TOP + Math.max(0, (bodyZoneHeight - totalBlockHeight) / 2);

  // Base start frame — slight beat after the section label settles.
  const baseStartFrame = Math.round(0.4 * fps);
  const fillDurationFrames = Math.round(fillDurationSeconds * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section label (eyebrow) */}
      {sectionLabel && (
        <div
          style={{
            position: "absolute",
            top: SECTION_LABEL_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: resolvedAccent,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            opacity: headerOpacity,
          }}
        >
          {sectionLabel}
        </div>
      )}

      {/* Bars */}
      {bars.map((bar, i) => {
        const enterFrame = staggerEntry({
          index: i,
          baseStartFrame,
          staggerFrames,
          accelerate: true,
        });
        return (
          <BarRow
            key={`bar-${i}`}
            bar={bar}
            topPx={blockTop + i * ROW_UNIT}
            enterFrame={enterFrame}
            fillDurationFrames={fillDurationFrames}
            maxValue={maxValue}
            direction={direction}
            inkColor={resolvedInk}
            paperColor={resolvedPaper}
            mutedColor={resolvedMuted}
            accentColor={resolvedAccent}
            paletteMode={palette}
          />
        );
      })}

      {/* Word-by-word captions — opt-in */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
