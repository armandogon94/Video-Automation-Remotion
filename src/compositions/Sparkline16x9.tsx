/**
 * Sparkline16x9 — horizontal (1920×1080) port of `Sparkline9x16`.
 *
 * Same archetype: a single LATEST stat (e.g. "92%") paired with a
 * sparkline that animates left → right via SVG stroke-dashoffset. Re-laid
 * for landscape — the wide canvas lets the hero number and sparkline sit
 * SIDE-BY-SIDE (hero number LEFT column, sparkline RIGHT zone) rather than
 * stacking them vertically. This turns the 9:16 vertical stack into a
 * horizontal editorial split.
 *
 * Layout (1920×1080):
 *   - Optional BrandBreadcrumb16x9 (top-left)
 *   - LEFT COLUMN (~x=100..680, vertically centered):
 *       · Optional kicker eyebrow (Inter 700 ~28px, uppercase tracked, accent)
 *       · Title (Inter 700 ~60px, ink, line-height 1.1)
 *       · CURRENT VALUE block (Inter 900 ~200px, ink + accent suffix)
 *       · TREND BADGE (pill with up/down/flat arrow + % change)
 *       · Optional source-caption
 *   - RIGHT ZONE (~x=760..1820):
 *       · SPARKLINE (SVG polyline, full right zone)
 *       · Y-axis baseline
 *       · Optional area fill below line
 *       · End-dot with pulse
 *   - BrandWatermark16x9 (bottom-right)
 *   - Optional EditorialCaption strip (default false)
 *
 * Motion grammar (preserved from 9:16):
 *   - Current value counts up 0 → latest over 0.8s cubic ease-out.
 *   - Sparkline draws on left → right over `drawDurationSeconds` (default 1.2s).
 *   - Area fill fades in once line reaches 100% drawn.
 *   - End-dot appears + starts pulsing once line completes.
 *   - Trend badge fades in 0.3s after sparkline completes.
 *
 * Font defaults are 16:9-calibrated (ADR-001 §5.1).
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { getToolAccentForSurface, resolveColors, getPalette, ALL_PALETTE_MODES } from "../brand";
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

export const sparkline16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
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
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type Sparkline16x9Props = z.infer<typeof sparkline16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────
// LEFT COLUMN — hero stat + title
const LEFT_COL_LEFT = 100;
const LEFT_COL_WIDTH = 580;   // ~x=100..680
const LEFT_COL_TOP = 160;     // vertically soft-centered; column items are absolutely positioned within

const KICKER_TOP = 160;
const TITLE_TOP = 220;

// Current value block
const VALUE_BLOCK_TOP = 360;
const VALUE_FONT_SIZE_BASE = 200;  // 16:9-calibrated (smaller than 9:16's 280px — wider canvas, not vertically dominant)

// Trend badge
const TREND_BADGE_TOP = 660;

// Source caption
const SOURCE_CAPTION_TOP = 760;

// RIGHT ZONE — sparkline
const SPARK_ZONE_LEFT = 720;
const SPARK_ZONE_TOP = 120;
const SPARK_ZONE_WIDTH = 1920 - SPARK_ZONE_LEFT - 80; // ~1120
const SPARK_ZONE_HEIGHT = 800;

// Inner SVG padding inside the spark zone
const SPARK_PAD_X = 20;
const SPARK_PAD_Y = 30;

const STROKE_WIDTH = 8;
const END_DOT_RADIUS = 16;

// ─── Helpers ───────────────────────────────────────────────────────
function easeOutCubic(t: number): number {
  return outCubic(Math.max(0, Math.min(1, t)));
}

function formatNumber(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

function formatValue(value: number, decimals: number, template: string): string {
  const num = formatNumber(value, decimals);
  return template.includes("{v}") ? template.replace("{v}", num) : `${template}${num}`;
}

interface XY { x: number; y: number; }

function projectPoints(data: number[], innerW: number, innerH: number): XY[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min;
  const n = data.length;
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

function buildPointsAttr(points: XY[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

function buildAreaPath(points: XY[], baselineY: number): string {
  if (points.length === 0) return "";
  const head = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  const mid = points.slice(1).map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("");
  const tail = `L${points[points.length - 1].x.toFixed(2)},${baselineY.toFixed(2)} L${points[0].x.toFixed(2)},${baselineY.toFixed(2)} Z`;
  return `${head}${mid}${tail}`;
}

function polylineLength(points: XY[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function computeTrendPct(data: number[]): number | null {
  if (data.length < 2) return null;
  const first = data[0];
  const last = data[data.length - 1];
  if (first === 0) {
    if (last === 0) return 0;
    return last > 0 ? 100 : -100;
  }
  return ((last - first) / Math.abs(first)) * 100;
}

// ─── Composition ───────────────────────────────────────────────────
export const Sparkline16x9: React.FC<Sparkline16x9Props> = ({
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
  watermark,
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

  const innerW = SPARK_ZONE_WIDTH - SPARK_PAD_X * 2;
  const innerH = SPARK_ZONE_HEIGHT - SPARK_PAD_Y * 2;

  const points = useMemo(() => projectPoints(data, innerW, innerH), [data, innerW, innerH]);
  const lineLength = useMemo(() => polylineLength(points), [points]);
  const pointsAttr = useMemo(() => buildPointsAttr(points), [points]);
  const areaPath = useMemo(() => buildAreaPath(points, innerH), [points, innerH]);

  const latestValue = data.length > 0 ? data[data.length - 1] : 0;
  const trendPct = useMemo(() => computeTrendPct(data), [data]);

  // 1. Count-up
  const countDurationFrames = Math.max(1, Math.round(0.8 * fps));
  const countLinear = interpolate(frame, [0, countDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countEased = easeOutCubic(countLinear);
  const displayedValue = latestValue * countEased;

  const terminalText = formatValue(latestValue, decimals, valueFormat);
  const valFontSize =
    terminalText.length <= 4
      ? VALUE_FONT_SIZE_BASE
      : Math.max(120, Math.round(VALUE_FONT_SIZE_BASE * (4 / terminalText.length)));

  // 2. Sparkline draw-on
  const drawDelayFrames = Math.round(0.2 * fps);
  const drawDurationFrames = Math.max(1, Math.round(drawDurationSeconds * fps));
  const drawLocalFrame = Math.max(0, frame - drawDelayFrames);
  const drawProgressLinear = interpolate(drawLocalFrame, [0, drawDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drawProgressEased = easeOutCubic(drawProgressLinear);
  const dashOffset = lineLength * (1 - drawProgressEased);
  const drawCompleteFrame = drawDelayFrames + drawDurationFrames;

  // 3. Area fill
  const areaFadeStart = drawCompleteFrame;
  const areaOpacity = interpolate(
    frame,
    [areaFadeStart, areaFadeStart + Math.round(0.3 * fps)],
    [0, 0.18],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 4. End-dot
  const endDotFadeFrames = Math.round(0.2 * fps);
  const endDotOpacity = interpolate(
    frame,
    [drawCompleteFrame, drawCompleteFrame + endDotFadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pulseLocal = Math.max(0, frame - drawCompleteFrame);
  const pulsePhase = (pulseLocal / fps) * (Math.PI * 2) * (1 / 1.4);
  const pulseScale = 1 + 0.18 * Math.sin(pulsePhase);
  const pulseRingProgress = ((pulseLocal / fps) % 1.4) / 1.4;
  const pulseRingRadius = END_DOT_RADIUS + pulseRingProgress * 28;
  const pulseRingOpacity = (1 - pulseRingProgress) * 0.5 * endDotOpacity;

  // 5. Trend badge
  const badgeFadeStart = drawCompleteFrame + Math.round(0.3 * fps);
  const badgeOpacity = interpolate(
    frame,
    [badgeFadeStart, badgeFadeStart + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 6. Header
  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sourceOpacity = badgeOpacity;

  const trendDirection: "up" | "down" | "flat" =
    trendPct === null || Math.abs(trendPct) < 0.5
      ? "flat"
      : trendPct > 0
        ? "up"
        : "down";
  const trendUpColor = surfaceMode === "dark" ? "#3FB68B" : "#1F8A55";
  const trendDownColor = surfaceMode === "dark" ? "#E85C5C" : "#B33A2A";
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

  const endPoint = points.length > 0 ? points[points.length - 1] : { x: 0, y: 0 };
  const baselineY = innerH;

  // Divider line between left and right zones
  const dividerX = LEFT_COL_LEFT + LEFT_COL_WIDTH + 20;

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

      {/* Thin divider line separating left col from spark zone */}
      <div
        style={{
          position: "absolute",
          left: dividerX,
          top: 80,
          width: 1,
          height: 920,
          background: `${resolvedMuted}33`,
        }}
      />

      {/* LEFT COLUMN — hero stat */}
      {kicker && (
        <div
          style={{
            position: "absolute",
            top: KICKER_TOP,
            left: LEFT_COL_LEFT,
            width: LEFT_COL_WIDTH,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: resolvedAccent,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            opacity: headerOpacity,
          }}
        >
          {kicker}
        </div>
      )}

      {title && (
        <div
          style={{
            position: "absolute",
            top: TITLE_TOP,
            left: LEFT_COL_LEFT,
            width: LEFT_COL_WIDTH,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 52,
            color: resolvedInk,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            opacity: headerOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* CURRENT VALUE block */}
      <div
        style={{
          position: "absolute",
          top: VALUE_BLOCK_TOP,
          left: LEFT_COL_LEFT,
          width: LEFT_COL_WIDTH,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: valFontSize,
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
          color: resolvedInk,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <SplitFormattedValue16x9
          value={displayedValue}
          decimals={decimals}
          template={valueFormat}
          inkColor={resolvedInk}
          accentColor={resolvedAccent}
          baseFontSize={valFontSize}
        />
      </div>

      {/* TREND BADGE */}
      {showTrendBadge && trendPct !== null && (
        <div
          style={{
            position: "absolute",
            top: TREND_BADGE_TOP,
            left: LEFT_COL_LEFT,
            opacity: badgeOpacity,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 24px",
              borderRadius: 999,
              background: `${trendColor}1F`,
              border: `2px solid ${trendColor}66`,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 34,
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
            top: SOURCE_CAPTION_TOP,
            left: LEFT_COL_LEFT,
            width: LEFT_COL_WIDTH,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 26,
            color: resolvedMuted,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            opacity: sourceOpacity,
          }}
        >
          {sourceCaption}
        </div>
      )}

      {/* SPARKLINE zone — right two-thirds */}
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
          <g transform={`translate(${SPARK_PAD_X}, ${SPARK_PAD_Y})`}>
            {/* Y-axis baseline */}
            <line
              x1={0} y1={baselineY} x2={innerW} y2={baselineY}
              stroke={resolvedMuted} strokeWidth={2} strokeOpacity={0.25}
            />

            {/* Area fill */}
            {showAreaFill && points.length >= 2 && (
              <path d={areaPath} fill={resolvedAccent} fillOpacity={areaOpacity} />
            )}

            {/* Sparkline */}
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

            {/* End-dot + pulse */}
            {points.length >= 1 && (
              <g>
                <circle
                  cx={endPoint.x} cy={endPoint.y} r={pulseRingRadius}
                  fill="none" stroke={resolvedAccent} strokeWidth={3}
                  strokeOpacity={pulseRingOpacity}
                />
                <circle
                  cx={endPoint.x} cy={endPoint.y} r={END_DOT_RADIUS * pulseScale}
                  fill={resolvedAccent} opacity={endDotOpacity}
                />
                <circle
                  cx={endPoint.x} cy={endPoint.y}
                  r={END_DOT_RADIUS * pulseScale * 0.42}
                  fill={resolvedPaper} opacity={endDotOpacity * 0.7}
                />
              </g>
            )}
          </g>
        </svg>
      </div>

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

// ─── Sub-component ──────────────────────────────────────────────────
const SplitFormattedValue16x9: React.FC<{
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

export default Sparkline16x9;
