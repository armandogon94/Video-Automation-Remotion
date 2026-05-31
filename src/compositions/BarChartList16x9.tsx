/**
 * BarChartList16x9 — horizontal (1920×1080) port of `BarChartList9x16`.
 *
 * Where `BarChartList9x16` stacks a column of <label → animated bar → value>
 * rows tuned for the 1080-wide vertical canvas, this 16:9 sibling re-lays the
 * SAME semantic unit for landscape: a single centered title eyebrow on top, then
 * a column of FULL-WIDTH labeled horizontal bars that span the wide canvas and
 * read at long-form distance.
 *
 * Crucially distinct from `BigNumberHorizontalBars16x9`: that template leads with
 * a hero numeral on the LEFT half and crams five bars into the RIGHT half. THIS
 * template is a ranked LIST — every row is full canvas width, each its own
 * <category label · animated bar · value> unit, no hero numeral, so the bars
 * themselves carry the story top-to-bottom.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb16x9 (top-left, ~y=60)
 *   - Section label eyebrow (centered, mono tracked uppercase, ~y=120)
 *   - BARS BLOCK — full-width rows, vertically centered in the body zone:
 *       · Left: category label column (mono uppercase, tracked)
 *       · Right: animated horizontal bar, value label inside (wide bar) or
 *         floating to the right (narrow bar)
 *   - Optional EditorialCaption (default false — chart already dense)
 *   - BrandWatermark16x9 (bottom-right)
 *
 * Motion grammar (preserved from the 9:16 source):
 *   - Each row enters via `staggerEntry` (accelerating cascade) — row[i] starts
 *     at `baseStartFrame + staggerFrames * decay^i`.
 *   - Each bar's width interpolates 0 → (value / maxValue) × trackWidth over
 *     `fillDurationSeconds`, eased with `outQuart`.
 *   - Each value label counts up via `countUp` synced to the fill window.
 *   - Direction "rtl" reverses the fill so it grows right-to-left.
 *
 * Font defaults are 16:9-calibrated (ADR-001 §5.1): row labels/values land
 * larger than the 9:16 source to read on the 1920-wide canvas at long-form
 * viewing distance.
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import type { PaletteMode } from "../brand";
import { countUp, formatCount } from "../animation/countUp";
import { staggerEntry } from "../animation/staggeredCascade";
import { outQuart } from "../timing/easing";

// ─── Local schemas ──────────────────────────────────────────────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

// Local watermark schema (self-contained; does not touch shared schemas.ts).
const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(120),
  opacity: z.number().min(0).max(1).default(0.9),
});

const barSchema = z.object({
  /** Left-column category label (mono uppercase). */
  label: z.string().default(""),
  /** Numeric value (used for count-up + bar width). */
  value: z.number().default(0),
  /** Optional suffix after the value (e.g. "%", " req"). */
  suffix: z.string().default(""),
  /** Optional per-bar fill color (overrides composition accent). */
  color: z.string().default(""),
  /** Decimals to display on the count-up. Default 0. */
  decimals: z.number().int().min(0).max(4).default(0),
});
export type BarChartList16x9Bar = z.infer<typeof barSchema>;

export const barChartList16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),
  bars: z.array(barSchema).default([]),
  /** Bar fill direction. Default L→R. */
  direction: z.enum(["ltr", "rtl"]).default("ltr"),
  /** Per-bar entry stagger (frames). Default 4. */
  staggerFrames: z.number().int().min(0).max(60).default(4),
  /** Bar fill duration (seconds). Default 0.8. */
  fillDurationSeconds: z.number().min(0.1).max(8).default(0.8),
  /** First-row enter time (seconds). Default 0.5. */
  firstBarEnterSeconds: z.number().min(0).max(8).default(0.5),
  /** Max value to scale bars against (default = max of bars.value). */
  maxValue: z.number().optional(),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  /** Optional watermark in the bottom-right. */
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),

  // 16:9-calibrated font defaults (ADR-001 §5.1).
  sectionLabelFontSize: z.number().min(16).max(80).default(30),
  labelFontSize: z.number().min(20).max(90).default(40),
  valueFontSize: z.number().min(20).max(110).default(48),
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type BarChartList16x9Props = z.infer<typeof barChartList16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────────
const CANVAS_W = 1920;

const SECTION_LABEL_Y = 120;

const ROW_HEIGHT = 110;
const ROW_GAP = 36;
const ROW_UNIT = ROW_HEIGHT + ROW_GAP;

const BARS_ZONE_TOP = 250;
const BARS_ZONE_BOTTOM = 960;
const BARS_ZONE_LEFT = 160;
const BARS_ZONE_RIGHT = 160;
const BARS_ZONE_WIDTH = CANVAS_W - BARS_ZONE_LEFT - BARS_ZONE_RIGHT; // 1600

const LABEL_COL_WIDTH = 460;
const LABEL_TO_BAR_GAP = 40;
const BAR_COL_LEFT = LABEL_COL_WIDTH + LABEL_TO_BAR_GAP;
const BAR_COL_WIDTH = BARS_ZONE_WIDTH - BAR_COL_LEFT; // 1100

const BAR_HEIGHT = 64;
const BAR_RADIUS = 14;

// Bar fill fraction above which the value label sits INSIDE the fill.
const INSIDE_VALUE_THRESHOLD = 0.3;

// ─── Single row ────────────────────────────────────────────────────
const BarRow: React.FC<{
  bar: BarChartList16x9Bar;
  topPx: number;
  enterFrame: number;
  fillDurationFrames: number;
  maxValue: number;
  direction: "ltr" | "rtl";
  labelFontSize: number;
  valueFontSize: number;
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
  labelFontSize,
  valueFontSize,
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
  const fraction =
    maxValue > 0 ? Math.max(0, Math.min(1, bar.value / maxValue)) : 0;
  const targetPx = BAR_COL_WIDTH * fraction;
  const fillPx = targetPx * fillEased;

  // Live count-up synced to the fill window.
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
  const valueOpacity = interpolate(
    local,
    [valueFadeStart, valueFadeStart + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
          fontFamily: FONT_STACKS.mono,
          fontSize: labelFontSize,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: getBodyTextColor(paletteMode, inkColor, labelFontSize),
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
        {/* Value label — inside when wide, floating right of the fill when narrow. */}
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
                ? { left: fillLeft + 22 }
                : { right: BAR_COL_WIDTH - fillPx + 22 }
              : direction === "rtl"
                ? { right: BAR_COL_WIDTH - (BAR_COL_WIDTH - fillPx) + 22 }
                : { left: fillPx + 22 }),
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: valueFontSize,
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
export const BarChartList16x9: React.FC<BarChartList16x9Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  bars,
  direction,
  staggerFrames,
  fillDurationSeconds,
  firstBarEnterSeconds,
  maxValue: maxValueProp,
  breadcrumb,
  watermark,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  sectionLabelFontSize,
  labelFontSize,
  valueFontSize,
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
    bars.length > 0 ? bars.length * ROW_HEIGHT + (bars.length - 1) * ROW_GAP : 0;
  const bodyZoneHeight = BARS_ZONE_BOTTOM - BARS_ZONE_TOP;
  const blockTop =
    BARS_ZONE_TOP + Math.max(0, (bodyZoneHeight - totalBlockHeight) / 2);

  // Base start frame — slight beat after the section label settles.
  const baseStartFrame = Math.round(firstBarEnterSeconds * fps);
  const fillDurationFrames = Math.max(1, Math.round(fillDurationSeconds * fps));

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
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
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: sectionLabelFontSize,
            color: resolvedAccent,
            letterSpacing: "0.22em",
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
            labelFontSize={labelFontSize}
            valueFontSize={valueFontSize}
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
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Bottom-right brand watermark (16:9 variant) */}
      <BrandWatermark16x9 style={watermark} />
    </AbsoluteFill>
  );
};

export default BarChartList16x9;
