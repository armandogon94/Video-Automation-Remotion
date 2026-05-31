/**
 * BenchmarkBars16x9 — horizontal (1920×1080) port of `BenchmarkBars9x16`.
 *
 * Same semantic primitive: horizontal-bar comparison chart for "X vs Y"
 * stories (pricing comparisons, performance benchmarks, latency races).
 *
 * Re-laid for landscape. The wide 1920-px canvas gives the bars MUCH more
 * horizontal room: label columns can be wider, bars can be longer, value
 * labels always fit inside the fill with room to spare. Title + subtitle sit
 * in a compact top band (not stacked tall), and the bars zone uses ~70% of
 * the vertical height — leaving clean margins. Bars are centered vertically
 * in their zone (same principle as `BarChartList16x9`).
 *
 * Visual structure (1920×1080):
 *   - Optional BrandBreadcrumb16x9 (top-left, ~y=60)
 *   - TITLE (~y=80) Inter 700, 16:9-calibrated size, ink, centered
 *   - SUBTITLE (~y=170) Inter 500 muted, centered (optional)
 *   - BARS ZONE (~y=240..860) — stacked horizontal bars:
 *       · Left: label column (wider on 1920)
 *       · Right: track + fill + value
 *   - SOURCE CAPTION (~y=900) muted, centered (optional)
 *   - Optional EditorialCaption strip (default false)
 *   - BrandWatermark16x9 (bottom-right)
 *
 * Motion grammar (preserved from 9:16):
 *   - Title fades in at frame 0 (~0.4s).
 *   - Subtitle fades in 0.2s after title.
 *   - Bars enter sequentially: bar[i] starts at barStaggerSeconds * i.
 *       · Label fades in instantly (~0.1s).
 *       · Track fades in over 0.15s.
 *       · Fill width interpolates 0 → widthPct over barAnimSeconds (outCubic).
 *       · Value label fades in once fill reaches ≥95% of target.
 *   - Source caption fades in after all bars complete.
 *
 * Font defaults are 16:9-calibrated (ADR-001 §5.1): label/value sizes
 * land larger than the 9:16 source to read on the 1920-wide canvas.
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
  ALL_PALETTE_MODES,
} from "../brand";
import type { PaletteMode } from "../brand";
import { outCubic } from "../timing/easing";

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

const benchmarkBarSchema_local = z.object({
  label: z.string().default(""),
  value: z.string().default(""),
  widthPct: z.number().min(0).max(1).default(0.5),
  color: z.string().default(""),
});
export type BenchmarkBar16x9 = z.infer<typeof benchmarkBarSchema_local>;

export const benchmarkBars16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  title: z.string().default("Precio por millón de tokens"),
  subtitle: z.string().optional(),
  bars: z.array(benchmarkBarSchema_local).default([]),
  sourceCaption: z.string().optional(),
  barStaggerSeconds: z.number().min(0).max(5).default(0.3),
  barAnimSeconds: z.number().min(0.1).max(5).default(0.8),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),

  // 16:9-calibrated font defaults (ADR-001 §5.1).
  titleFontSize: z.number().min(28).max(160).default(72),
  subtitleFontSize: z.number().min(20).max(80).default(38),
  labelFontSize: z.number().min(20).max(80).default(40),
  valueFontSize: z.number().min(20).max(80).default(44),
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type BenchmarkBars16x9Props = z.infer<typeof benchmarkBars16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────
const CANVAS_W = 1920;

const TITLE_TOP = 80;
const TITLE_MAX_WIDTH = 1600;

const SUBTITLE_TOP = 178;
const SUBTITLE_MAX_WIDTH = 1500;

const BARS_ZONE_TOP = 248;
const BARS_ZONE_LEFT = 160;
const BARS_ZONE_RIGHT = 160;
const BARS_ZONE_WIDTH = CANVAS_W - BARS_ZONE_LEFT - BARS_ZONE_RIGHT; // 1600

// Label column — wider on the 1920-px canvas vs the 9:16 version's 280px.
const LABEL_WIDTH = 380;
const LABEL_GAP = 28;
const TRACK_LEFT_OFFSET = LABEL_WIDTH + LABEL_GAP; // 408
const TRACK_WIDTH = BARS_ZONE_WIDTH - TRACK_LEFT_OFFSET; // 1192

const BAR_TRACK_HEIGHT = 88;
const BAR_ROW_GAP = 32;
const BAR_ROW_HEIGHT = BAR_TRACK_HEIGHT + BAR_ROW_GAP;

const SOURCE_CAPTION_Y = 900;
const SOURCE_CAPTION_MAX_WIDTH = 1500;

// Value label always inside the fill on 16:9 (bar is much wider), unless
// the fill is below this fraction.
const INSIDE_LABEL_THRESHOLD = 0.15;

// ─── Single bar row ────────────────────────────────────────────────
const BarRow16x9: React.FC<{
  bar: BenchmarkBar16x9;
  topPx: number;
  enterFrame: number;
  barAnimSeconds: number;
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
  barAnimSeconds,
  labelFontSize,
  valueFontSize,
  inkColor,
  paperColor,
  mutedColor,
  accentColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Label fades in over 3 frames.
  const labelOpacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Track fades in over 0.15s.
  const trackFadeFrames = Math.max(1, Math.round(0.15 * fps));
  const trackOpacity = interpolate(localFrame, [0, trackFadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fill width — outCubic ease-out over barAnimSeconds.
  const fillFrames = Math.max(1, Math.round(barAnimSeconds * fps));
  const fillProgressLinear = interpolate(localFrame, [0, fillFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillProgressEased = outCubic(fillProgressLinear);
  const targetFraction = Math.max(0, Math.min(1, bar.widthPct));
  const fillFraction = targetFraction * fillProgressEased;
  const fillPx = TRACK_WIDTH * fillFraction;

  // Value label appears once fill reaches ≥95%.
  const valueLabelVisible = fillProgressEased >= 0.95;
  const valueFadeStart = Math.round(fillFrames * 0.95);
  const valueOpacity = interpolate(localFrame, [valueFadeStart, valueFadeStart + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelSitsInside = targetFraction >= INSIDE_LABEL_THRESHOLD;
  const fillColor = bar.color && bar.color.length > 0 ? bar.color : accentColor;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: BARS_ZONE_LEFT,
        width: BARS_ZONE_WIDTH,
        height: BAR_TRACK_HEIGHT,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Label on the left */}
      <div
        style={{
          width: LABEL_WIDTH,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: labelFontSize,
          color: getBodyTextColor(paletteMode, inkColor, labelFontSize),
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          opacity: labelOpacity,
          paddingRight: LABEL_GAP,
          textAlign: "right",
        }}
      >
        {bar.label}
      </div>

      {/* Track + fill + value (right column) */}
      <div
        style={{
          position: "relative",
          width: TRACK_WIDTH,
          height: BAR_TRACK_HEIGHT,
        }}
      >
        {/* Track — muted at 15% alpha */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${mutedColor}26`,
            borderRadius: 14,
            opacity: trackOpacity,
          }}
        />

        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: fillPx,
            background: fillColor,
            borderRadius: 14,
          }}
        />

        {/* Value label */}
        {valueLabelVisible && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...(labelSitsInside ? { right: 18 } : { left: fillPx + 14 }),
              display: "flex",
              alignItems: "center",
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: valueFontSize,
              color: labelSitsInside ? paperColor : inkColor,
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
              opacity: valueOpacity,
              whiteSpace: "nowrap",
            }}
          >
            {bar.value}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────
export const BenchmarkBars16x9: React.FC<BenchmarkBars16x9Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  bars,
  sourceCaption,
  barStaggerSeconds,
  barAnimSeconds,
  breadcrumb,
  watermark,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  titleFontSize,
  subtitleFontSize,
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

  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Title / subtitle fade-in.
  const titleOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleStartFrame = Math.round(0.2 * fps);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStartFrame, subtitleStartFrame + Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Bar layout — vertically center the stack within the bars zone.
  const totalBarsHeight =
    bars.length > 0
      ? bars.length * BAR_TRACK_HEIGHT + (bars.length - 1) * BAR_ROW_GAP
      : 0;
  const barsZoneAvailable = SOURCE_CAPTION_Y - BARS_ZONE_TOP - 40;
  const barsBlockTop =
    BARS_ZONE_TOP + Math.max(0, (barsZoneAvailable - totalBarsHeight) / 2);

  // Per-bar enter frames.
  const barFrames = bars.map((_, i) => Math.round(i * barStaggerSeconds * fps));
  const lastBarCompleteFrame =
    bars.length > 0
      ? barFrames[barFrames.length - 1] + Math.round(barAnimSeconds * fps)
      : 0;

  // Source caption fades in after all bars complete.
  const sourceFadeStart = lastBarCompleteFrame + Math.round(0.2 * fps);
  const sourceOpacity = interpolate(
    frame,
    [sourceFadeStart, sourceFadeStart + Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* 16:9 breadcrumb — top-left */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: TITLE_TOP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: titleFontSize,
          color: getBodyTextColor(palette, resolvedInk, titleFontSize),
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          padding: `0 ${(CANVAS_W - TITLE_MAX_WIDTH) / 2}px`,
          opacity: titleOpacity,
        }}
      >
        {title}
      </div>

      {/* Subtitle (optional) */}
      {subtitle && (
        <div
          style={{
            position: "absolute",
            top: SUBTITLE_TOP,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: subtitleFontSize,
            color: resolvedMuted,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            padding: `0 ${(CANVAS_W - SUBTITLE_MAX_WIDTH) / 2}px`,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Bars zone */}
      {bars.map((bar, i) => (
        <BarRow16x9
          key={`bar-${i}`}
          bar={bar}
          topPx={barsBlockTop + i * BAR_ROW_HEIGHT}
          enterFrame={barFrames[i]}
          barAnimSeconds={barAnimSeconds}
          labelFontSize={labelFontSize}
          valueFontSize={valueFontSize}
          inkColor={resolvedInk}
          paperColor={resolvedPaper}
          mutedColor={resolvedMuted}
          accentColor={resolvedAccent}
          paletteMode={palette}
        />
      ))}

      {/* Source caption (optional) */}
      {sourceCaption && (
        <div
          style={{
            position: "absolute",
            top: SOURCE_CAPTION_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 28,
            color: resolvedMuted,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            padding: `0 ${(CANVAS_W - SOURCE_CAPTION_MAX_WIDTH) / 2}px`,
            opacity: sourceOpacity,
          }}
        >
          {sourceCaption}
        </div>
      )}

      {/* Word-by-word captions — opt-in */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 100,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* 16:9 watermark — bottom-right */}
      {watermark.enabled && (
        <BrandWatermark16x9 style={watermark} paddingPx={64} />
      )}
    </AbsoluteFill>
  );
};

export default BenchmarkBars16x9;
