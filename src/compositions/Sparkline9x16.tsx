/**
 * Sparkline9x16 — vertical (1080×1920) micro line-chart hero.
 *
 * Visual archetype: a single LATEST stat (e.g. "92%") sits atop a hand-drawn
 * sparkline that animates left → right via SVG stroke-dashoffset. Use for
 * trend stories ("X grew from Y to Z over period P"): adoption curves, pricing
 * trajectories, latency drops, model-eval climbs. Same house grammar as the
 * rest of Sprint 1 templates (cream/dark palette, subjectTool accent override,
 * optional BrandBreadcrumb, grain overlay, EditorialCaption strip).
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional kicker eyebrow (Inter 700 ~32px tracking-spaced accent, ~y=240)
 *   - Title (~y=340, Inter 700 ~58px, centered)
 *   - CURRENT VALUE block (~y=480..640): massive Inter 900 ~280px showing the
 *     LATEST data-point, with optional suffix in accent (e.g. "92%", "$2.4M").
 *     Right-aligned to the chart edge so the eye lands on the magnitude first.
 *   - SPARKLINE ZONE (~y=720..1300, 880px wide × 580px tall, centered):
 *       · SVG <polyline> drawn via stroke-dasharray / stroke-dashoffset interpolate
 *       · Optional area fill below the line at low alpha
 *       · Y-axis baseline visible at low alpha
 *       · Optional dot at the end of the line that pulses once the line completes
 *   - TREND BADGE (~y=1340, optional): pill with up-arrow / down-arrow / flat icon
 *     + percentage change. Color: green for positive, red for negative, muted for flat.
 *   - Optional source-caption (~y=1440)
 *   - Optional EditorialCaption strip (default false)
 *
 * Motion grammar:
 *   - Current value counts up 0 → latest over 0.8s via cubic ease-out (AnimatedCounter pattern).
 *   - Sparkline draws on left → right over `drawDurationSeconds` (default 1.2s) using
 *     stroke-dashoffset (NOT @remotion/paths — that package isn't installed; stroke-dashoffset
 *     is the native-SVG alternative and works for any polyline of any length).
 *   - Area fill fades in once line reaches 100% drawn.
 *   - End-dot appears + starts pulsing once line completes.
 *   - Trend badge fades in 0.3s after sparkline completes.
 */
import React, { useMemo } from "react";
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
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";
import { outCubic } from "../timing/easing";

// Local schemas (mirror AnimatedCounter9x16 — schemas.ts doesn't yet export
// wordTimingSchema/breadcrumbSchema as named exports, only the inferred types).
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

// ─── Schema ────────────────────────────────────────────────────────
export const sparkline9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  kicker: z.string().optional(),
  title: z.string().default(""),
  /** Data points. Length 3-30. First = oldest, last = current/latest. */
  data: z.array(z.number()).default([]),
  /** Format string for the current value display. Use {v} as placeholder. e.g. "{v}%" or "${v}M" */
  valueFormat: z.string().default("{v}"),
  /** Number of decimals for the current value display. */
  decimals: z.number().int().min(0).max(4).default(0),
  /** Show area fill below line. */
  showAreaFill: z.boolean().default(true),
  /** Show trend badge with arrow + % change. */
  showTrendBadge: z.boolean().default(true),
  /** Seconds for the line draw-on animation. */
  drawDurationSeconds: z.number().min(0.3).max(8).default(1.2),
  sourceCaption: z.string().optional(),
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
export type Sparkline9x16Props = z.infer<typeof sparkline9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const KICKER_Y = 240;
const TITLE_Y = 340;

// CURRENT VALUE block — right-aligned to chart edge.
const VALUE_BLOCK_TOP = 480;
const VALUE_BLOCK_HEIGHT = 200; // ~y=480..680
const VALUE_FONT_SIZE_BASE = 280;
const VALUE_MAX_WIDTH = 880;

// SPARKLINE zone — centered, 880 × 580.
const SPARK_ZONE_WIDTH = 880;
const SPARK_ZONE_HEIGHT = 580;
const SPARK_ZONE_LEFT = (1080 - SPARK_ZONE_WIDTH) / 2; // 100
const SPARK_ZONE_TOP = 720;

// Inner-SVG padding (so the line doesn't kiss the box edges + the end-dot fits).
const SPARK_PAD_X = 20;
const SPARK_PAD_Y = 30;

const STROKE_WIDTH = 8;
const END_DOT_RADIUS = 16;

// TREND BADGE.
const TREND_BADGE_Y = 1340;

// SOURCE CAPTION.
const SOURCE_CAPTION_Y = 1440;
const SOURCE_CAPTION_MAX_WIDTH = 920;

// ─── Helpers ───────────────────────────────────────────────────────

/** Cubic ease-out: f(t) = 1 - (1 - t)^3. Clamps t to [0,1] before delegating
 *  to the shared `outCubic` curve from `../timing/easing`. */
function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return outCubic(c);
}

/**
 * Format a number with fixed decimals and comma-thousands grouping.
 * Mirrors AnimatedCounter9x16's formatNumber so figures render consistently.
 */
function formatNumber(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

/**
 * Apply a `{v}`-template to a numeric value.
 * e.g. formatValue(92, 0, "{v}%") = "92%"
 *      formatValue(2.4, 1, "${v}M") = "$2.4M"
 */
function formatValue(value: number, decimals: number, template: string): string {
  const num = formatNumber(value, decimals);
  return template.includes("{v}") ? template.replace("{v}", num) : `${template}${num}`;
}

/**
 * Project a data-array onto SVG coordinates within (innerW × innerH).
 * Returns the list of (x, y) points where y=innerH is the bottom of the zone.
 *
 * Y-scaling: use [min, max] of the data with a small headroom — if all values
 * are equal, we render a flat line at the vertical center.
 */
interface XY {
  x: number;
  y: number;
}
function projectPoints(data: number[], innerW: number, innerH: number): XY[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min;
  const n = data.length;
  // Y-axis: 0 at top of inner zone, innerH at bottom. Map data so that
  // max → 6% from top, min → 6% from bottom (gives breathing room).
  const yPadTop = innerH * 0.06;
  const yPadBot = innerH * 0.06;
  const usableH = innerH - yPadTop - yPadBot;
  return data.map((v, i) => {
    const x = n === 1 ? innerW / 2 : (i / (n - 1)) * innerW;
    const norm = span === 0 ? 0.5 : (v - min) / span;
    const y = yPadTop + (1 - norm) * usableH;
    return { x, y };
  });
}

/** Build an SVG points string for a <polyline> from projected XY points. */
function buildPointsAttr(points: XY[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/** Build an SVG path "d" for the area-fill region (line + drop to baseline). */
function buildAreaPath(points: XY[], baselineY: number): string {
  if (points.length === 0) return "";
  const head = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  const mid = points
    .slice(1)
    .map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join("");
  const tail = `L${points[points.length - 1].x.toFixed(2)},${baselineY.toFixed(2)} L${points[0].x.toFixed(2)},${baselineY.toFixed(2)} Z`;
  return `${head}${mid}${tail}`;
}

/**
 * Compute total length of a polyline (sum of segment lengths). Used to size
 * the stroke-dasharray/dashoffset for the draw-on animation.
 */
function polylineLength(points: XY[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/** Compute trend: % change from first → last data point. */
function computeTrendPct(data: number[]): number | null {
  if (data.length < 2) return null;
  const first = data[0];
  const last = data[data.length - 1];
  if (first === 0) {
    // Avoid division by zero — fall back to absolute-direction signal.
    if (last === 0) return 0;
    return last > 0 ? 100 : -100;
  }
  return ((last - first) / Math.abs(first)) * 100;
}

// ─── Composition ───────────────────────────────────────────────────
export const Sparkline9x16: React.FC<Sparkline9x16Props> = ({
  audioUrl,
  wordTimings,
  kicker,
  title,
  data,
  valueFormat,
  decimals,
  showAreaFill,
  showTrendBadge,
  drawDurationSeconds,
  sourceCaption,
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

  // Resolve color stack: palette defaults + per-color overrides.
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

  // ─── Data prep ─────────────────────────────────────────────────
  const innerW = SPARK_ZONE_WIDTH - SPARK_PAD_X * 2;
  const innerH = SPARK_ZONE_HEIGHT - SPARK_PAD_Y * 2;

  const points = useMemo(() => projectPoints(data, innerW, innerH), [data, innerW, innerH]);
  const lineLength = useMemo(() => polylineLength(points), [points]);
  const pointsAttr = useMemo(() => buildPointsAttr(points), [points]);
  const areaPath = useMemo(
    () => buildAreaPath(points, innerH),
    [points, innerH],
  );

  const latestValue = data.length > 0 ? data[data.length - 1] : 0;
  const trendPct = useMemo(() => computeTrendPct(data), [data]);

  // ─── Motion ────────────────────────────────────────────────────

  // 1. Current-value count-up — 0 → latest over 0.8s with cubic ease-out.
  const countDurationFrames = Math.max(1, Math.round(0.8 * fps));
  const countLinear = interpolate(frame, [0, countDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countEased = easeOutCubic(countLinear);
  const displayedValue = latestValue * countEased;
  const displayedValueText = formatValue(displayedValue, decimals, valueFormat);

  // Auto-shrink rule for the current-value block — long figures step down.
  // Use the *terminal* string so width doesn't shift while counting up.
  const terminalText = formatValue(latestValue, decimals, valueFormat);
  const valFontSize =
    terminalText.length <= 4
      ? VALUE_FONT_SIZE_BASE
      : Math.max(180, Math.round(VALUE_FONT_SIZE_BASE * (4 / terminalText.length)));

  // 2. Sparkline draw-on — stroke-dashoffset from lineLength → 0 over drawDurationSeconds.
  // Slight delay so the eye lands on the headline value first before the line draws.
  const drawDelayFrames = Math.round(0.2 * fps);
  const drawDurationFrames = Math.max(1, Math.round(drawDurationSeconds * fps));
  const drawLocalFrame = Math.max(0, frame - drawDelayFrames);
  const drawProgressLinear = interpolate(
    drawLocalFrame,
    [0, drawDurationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const drawProgressEased = easeOutCubic(drawProgressLinear);
  const dashOffset = lineLength * (1 - drawProgressEased);
  const drawCompleteFrame = drawDelayFrames + drawDurationFrames;

  // 3. Area fill — fades in over 0.3s once line reaches 100% drawn.
  const areaFadeStart = drawCompleteFrame;
  const areaOpacity = interpolate(
    frame,
    [areaFadeStart, areaFadeStart + Math.round(0.3 * fps)],
    [0, 0.18],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 4. End-dot — fades in once the line completes, then pulses (1.4s period).
  const endDotFadeFrames = Math.round(0.2 * fps);
  const endDotOpacity = interpolate(
    frame,
    [drawCompleteFrame, drawCompleteFrame + endDotFadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Pulse: a sin-wave on radius once the dot is visible.
  const pulseLocal = Math.max(0, frame - drawCompleteFrame);
  const pulsePhase = (pulseLocal / fps) * (Math.PI * 2) * (1 / 1.4); // 1.4s period
  const pulseScale = 1 + 0.18 * Math.sin(pulsePhase);
  // Outer ring that ripples outward and fades.
  const pulseRingProgress = ((pulseLocal / fps) % 1.4) / 1.4; // 0..1 every 1.4s
  const pulseRingRadius = END_DOT_RADIUS + pulseRingProgress * 28;
  const pulseRingOpacity = (1 - pulseRingProgress) * 0.5 * endDotOpacity;

  // 5. Trend badge — fades in 0.3s after sparkline completes.
  const badgeFadeStart = drawCompleteFrame + Math.round(0.3 * fps);
  const badgeOpacity = interpolate(
    frame,
    [badgeFadeStart, badgeFadeStart + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 6. Title + kicker fade in at frame 0 (~0.4s).
  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 7. Source caption fades in alongside the trend badge.
  const sourceOpacity = badgeOpacity;

  // Trend color + arrow.
  const trendDirection: "up" | "down" | "flat" =
    trendPct === null || Math.abs(trendPct) < 0.5
      ? "flat"
      : trendPct > 0
        ? "up"
        : "down";
  // Editorial green/red — pulled tonally close to palette so they don't clash.
  // (Could be promoted to brand palettes later.)
  const trendUpColor = palette === "dark" ? "#3FB68B" : "#1F8A55";
  const trendDownColor = palette === "dark" ? "#E85C5C" : "#B33A2A";
  const trendColor =
    trendDirection === "up"
      ? trendUpColor
      : trendDirection === "down"
        ? trendDownColor
        : resolvedMuted;
  const trendArrow = trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→";
  const trendText =
    trendPct === null
      ? ""
      : `${trendArrow} ${trendPct >= 0 ? "+" : ""}${trendPct.toFixed(0)}%`;

  // End-dot position (last point in the polyline, in SVG space).
  const endPoint = points.length > 0 ? points[points.length - 1] : { x: 0, y: 0 };

  // Baseline (y-axis bottom line in the SVG).
  const baselineY = innerH;

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

      {/* Kicker eyebrow */}
      {kicker && (
        <div
          style={{
            position: "absolute",
            top: KICKER_Y,
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
          {kicker}
        </div>
      )}

      {/* Title */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: TITLE_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 58,
            color: resolvedInk,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            padding: "0 80px",
            opacity: headerOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* CURRENT VALUE block — right-aligned to the sparkline's right edge */}
      <div
        style={{
          position: "absolute",
          top: VALUE_BLOCK_TOP,
          left: SPARK_ZONE_LEFT,
          width: SPARK_ZONE_WIDTH,
          height: VALUE_BLOCK_HEIGHT,
          maxWidth: VALUE_MAX_WIDTH,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: valFontSize,
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
          color: resolvedInk,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {/* Render numeric portion in ink and any non-{v} suffix in accent.
            For valueFormat "{v}%" the "%" is rendered in accent at 70% size. */}
        <SplitFormattedValue
          value={displayedValue}
          decimals={decimals}
          template={valueFormat}
          inkColor={resolvedInk}
          accentColor={resolvedAccent}
          baseFontSize={valFontSize}
        />
      </div>

      {/* SPARKLINE zone */}
      <div
        style={{
          position: "absolute",
          top: SPARK_ZONE_TOP,
          left: SPARK_ZONE_LEFT,
          width: SPARK_ZONE_WIDTH,
          height: SPARK_ZONE_HEIGHT,
        }}
      >
        <svg
          width={SPARK_ZONE_WIDTH}
          height={SPARK_ZONE_HEIGHT}
          viewBox={`0 0 ${SPARK_ZONE_WIDTH} ${SPARK_ZONE_HEIGHT}`}
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Inner-padded group — everything below is in (innerW × innerH) space. */}
          <g transform={`translate(${SPARK_PAD_X}, ${SPARK_PAD_Y})`}>
            {/* Y-axis baseline at low alpha */}
            <line
              x1={0}
              y1={baselineY}
              x2={innerW}
              y2={baselineY}
              stroke={resolvedMuted}
              strokeWidth={2}
              strokeOpacity={0.25}
            />

            {/* Area fill — appears after the line completes */}
            {showAreaFill && points.length >= 2 && (
              <path
                d={areaPath}
                fill={resolvedAccent}
                fillOpacity={areaOpacity}
              />
            )}

            {/* The sparkline itself — stroke-dashoffset drives the draw-on. */}
            {points.length >= 2 && (
              <polyline
                points={pointsAttr}
                fill="none"
                stroke={resolvedAccent}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={lineLength}
                strokeDashoffset={dashOffset}
              />
            )}

            {/* End-dot — fades in + pulses once the line completes */}
            {points.length >= 1 && (
              <g>
                {/* Outward-ripple ring */}
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={pulseRingRadius}
                  fill="none"
                  stroke={resolvedAccent}
                  strokeWidth={3}
                  strokeOpacity={pulseRingOpacity}
                />
                {/* Solid dot — gentle in-place scale pulse */}
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={END_DOT_RADIUS * pulseScale}
                  fill={resolvedAccent}
                  opacity={endDotOpacity}
                />
                {/* Inner highlight (palette-aware) */}
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={(END_DOT_RADIUS * pulseScale) * 0.42}
                  fill={resolvedPaper}
                  opacity={endDotOpacity * 0.7}
                />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* TREND BADGE */}
      {showTrendBadge && trendPct !== null && (
        <div
          style={{
            position: "absolute",
            top: TREND_BADGE_Y,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: badgeOpacity,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              borderRadius: 999,
              background: `${trendColor}1F`, // ~12% alpha
              border: `2px solid ${trendColor}66`,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 38,
              color: trendColor,
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {trendText}
          </div>
        </div>
      )}

      {/* Source caption */}
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
            padding: `0 ${(1080 - SOURCE_CAPTION_MAX_WIDTH) / 2}px`,
            opacity: sourceOpacity,
          }}
        >
          {sourceCaption}
        </div>
      )}

      {/* Word-by-word captions in the bottom strip — opt-in */}
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

// ─── Sub-components ─────────────────────────────────────────────────

/**
 * Renders a `{v}`-templated value with the numeric portion in ink and the
 * non-numeric leading/trailing portions in accent at ~70% size. So "{v}%"
 * yields a big ink figure + a smaller accent "%". If the template has no
 * `{v}` placeholder we fall back to a single ink span.
 */
const SplitFormattedValue: React.FC<{
  value: number;
  decimals: number;
  template: string;
  inkColor: string;
  accentColor: string;
  baseFontSize: number;
}> = ({ value, decimals, template, inkColor, accentColor, baseFontSize }) => {
  const numStr = formatNumber(value, decimals);
  if (!template.includes("{v}")) {
    return <span style={{ color: inkColor }}>{`${template}${numStr}`}</span>;
  }
  const [pre, post] = template.split("{v}");
  const sideSize = Math.round(baseFontSize * 0.7);
  return (
    <>
      {pre && (
        <span
          style={{
            color: accentColor,
            fontSize: sideSize,
            marginRight: 8,
            marginTop: Math.round((baseFontSize - sideSize) * 0.18),
            lineHeight: 0.92,
          }}
        >
          {pre}
        </span>
      )}
      <span style={{ color: inkColor, lineHeight: 0.92 }}>{numStr}</span>
      {post && (
        <span
          style={{
            color: accentColor,
            fontSize: sideSize,
            marginLeft: 8,
            marginTop: Math.round((baseFontSize - sideSize) * 0.12),
            lineHeight: 0.92,
          }}
        >
          {post}
        </span>
      )}
    </>
  );
};
