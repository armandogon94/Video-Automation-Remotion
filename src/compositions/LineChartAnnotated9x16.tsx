/**
 * LineChartAnnotated9x16 — vertical (1080×1920) animated SVG line-chart.
 *
 * Wave-4 inspiration: @carloscuamatzin's T16 LineChartAnnotated — the
 * scientific-paper look applied to AI-progress storytelling. One or two data
 * series stroke-draw left-to-right; annotation dots ping into existence at
 * specific data points; a top-right "value readout" chip shows the current
 * line value.
 *
 * Use for trend/progression stories:
 *   - "Model accuracy over 18 months"
 *   - "Token prices: 2023 → 2026"
 *   - "Benchmark X vs Y across versions"
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Section label eyebrow (~y=200)
 *   - Optional value-readout chip (top-right of chart zone)
 *   - CHART ZONE (~y=420..1380, 920×960, centered):
 *       · X / Y axes at low alpha (if showAxes)
 *       · 1-2 polyline series with stroke-dashoffset draw-on
 *       · Annotation dots that ping (scale 0 → 1.2 → 1.0) at their atIndex's reveal time
 *       · Annotation text labels next to the dots
 *   - X-axis label row (~y=1410, mono uppercase tracking-spaced muted)
 *   - Optional EditorialCaption strip (default false — chart already dense)
 *
 * Motion grammar:
 *   - Section label / readout chip fade in at frame 0 (0.4s).
 *   - Axes (if shown) fade in at `enterSeconds`.
 *   - Each series draws on via stroke-dashoffset over `drawDurationSeconds`,
 *     starting at `enterSeconds`. Series i+1 starts 0.2s after series i.
 *   - Annotation dot[k] pings (outBack overshoot) at the moment the line reaches
 *     its atIndex — i.e. drawDurationSeconds × (atIndex / (xLabels.length - 1)).
 *   - Value-readout chip number counts up via `countUp` from series[0]'s first
 *     value → last value, synced with the first series' draw window.
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
import { countUp, formatCount } from "../animation";
import { outCubic, outBack } from "../timing/easing";

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

const annotationSchema = z.object({
  /** Index into the series.values / xLabels array. */
  atIndex: z.number().int().min(0),
  /** Annotation label rendered next to the dot. */
  text: z.string(),
});

const seriesSchema = z.object({
  /** Display name (used in the legend / value readout). */
  name: z.string().default(""),
  /** Hex color for the line. Empty = accent color. */
  color: z.string().default(""),
  /** Data values — length MUST match xLabels.length. */
  values: z.array(z.number()).default([]),
  /** Optional labeled data points. */
  annotations: z.array(annotationSchema).default([]),
});
export type LineSeries = z.infer<typeof seriesSchema>;

export const lineChartAnnotated9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default(""),
  /** X-axis labels (dates / step names). Length must equal each series' values length. */
  xLabels: z.array(z.string()).default([]),
  series: z.array(seriesSchema).default([]),
  /** Manual Y-axis lower bound. Empty / undefined = auto. */
  yMin: z.number().optional(),
  /** Manual Y-axis upper bound. Empty / undefined = auto. */
  yMax: z.number().optional(),
  showAxes: z.boolean().default(true),
  showValueReadout: z.boolean().default(true),
  /** Seconds for each series to draw on. */
  drawDurationSeconds: z.number().min(0.3).max(8).default(1.2),
  /** Wall-clock seconds at which axes + first series begin animating in. */
  enterSeconds: z.number().min(0).max(20).default(0.5),
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
export type LineChartAnnotated9x16Props = z.infer<typeof lineChartAnnotated9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const SECTION_LABEL_Y = 200;

const READOUT_TOP = 320;
const READOUT_RIGHT = 80;

const CHART_ZONE_TOP = 420;
const CHART_ZONE_LEFT = 80;
const CHART_ZONE_WIDTH = 1080 - CHART_ZONE_LEFT * 2;
const CHART_ZONE_HEIGHT = 960;

// Inner padding inside the SVG so the line + labels don't kiss the edges.
const CHART_PAD_TOP = 60;
const CHART_PAD_RIGHT = 60;
const CHART_PAD_BOTTOM = 80; // room for x-axis labels rendered below the chart
const CHART_PAD_LEFT = 80; // room for y-axis labels

const X_AXIS_LABEL_ROW_Y = CHART_ZONE_TOP + CHART_ZONE_HEIGHT - 40;

const STROKE_WIDTH = 8;
const DOT_RADIUS = 14;
const ANNOTATION_OFFSET = 24; // px offset between dot and annotation label

// ─── Helpers ───────────────────────────────────────────────────────

interface XY {
  x: number;
  y: number;
}

function autoYRange(
  series: LineSeries[],
  yMinOpt?: number,
  yMaxOpt?: number,
): { yMin: number; yMax: number } {
  const all = series.flatMap((s) => s.values);
  if (all.length === 0) return { yMin: 0, yMax: 1 };
  let yMin = yMinOpt ?? Math.min(...all);
  let yMax = yMaxOpt ?? Math.max(...all);
  if (yMin === yMax) {
    // Flat data — pad ±10% so the line shows up.
    yMin -= Math.max(1, Math.abs(yMin) * 0.1);
    yMax += Math.max(1, Math.abs(yMax) * 0.1);
  } else if (yMinOpt === undefined && yMaxOpt === undefined) {
    // Add 8% headroom on top + bottom so the line doesn't kiss the chart edges.
    const span = yMax - yMin;
    yMin -= span * 0.08;
    yMax += span * 0.08;
  }
  return { yMin, yMax };
}

function projectSeries(
  values: number[],
  innerW: number,
  innerH: number,
  yMin: number,
  yMax: number,
): XY[] {
  const n = values.length;
  if (n === 0) return [];
  const span = yMax - yMin || 1;
  return values.map((v, i) => {
    const x = n === 1 ? innerW / 2 : (i / (n - 1)) * innerW;
    const norm = (v - yMin) / span;
    const y = innerH - norm * innerH;
    return { x, y };
  });
}

function pointsToPathD(points: XY[]): string {
  if (points.length === 0) return "";
  const head = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  const tail = points
    .slice(1)
    .map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join("");
  return `${head}${tail}`;
}

function pathLength(points: XY[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// ─── Composition ───────────────────────────────────────────────────
export const LineChartAnnotated9x16: React.FC<LineChartAnnotated9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  xLabels,
  series,
  yMin: yMinProp,
  yMax: yMaxProp,
  showAxes,
  showValueReadout,
  drawDurationSeconds,
  enterSeconds,
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

  // ─── Geometry ──────────────────────────────────────────────────
  const innerW = CHART_ZONE_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
  const innerH = CHART_ZONE_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;

  const { yMin, yMax } = useMemo(
    () => autoYRange(series, yMinProp, yMaxProp),
    [series, yMinProp, yMaxProp],
  );

  // Per-series projected points + path string + length.
  const seriesPaths = useMemo(
    () =>
      series.map((s) => {
        const pts = projectSeries(s.values, innerW, innerH, yMin, yMax);
        return {
          name: s.name,
          color: s.color && s.color.length > 0 ? s.color : resolvedAccent,
          values: s.values,
          annotations: s.annotations,
          points: pts,
          d: pointsToPathD(pts),
          length: pathLength(pts),
        };
      }),
    [series, innerW, innerH, yMin, yMax, resolvedAccent],
  );

  // ─── Motion ────────────────────────────────────────────────────
  const enterFrame = Math.round(enterSeconds * fps);
  const drawDurationFrames = Math.round(drawDurationSeconds * fps);
  const seriesStaggerFrames = Math.round(0.2 * fps);

  // Section label / readout fade in at frame 0.
  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Axes fade in at `enterSeconds`.
  const axesOpacity = interpolate(
    frame,
    [enterFrame, enterFrame + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Value-readout count-up ────────────────────────────────────
  // Track series[0] from first → last value across its draw window.
  const primarySeries = seriesPaths[0];
  const readoutFromVal = primarySeries && primarySeries.values.length > 0
    ? primarySeries.values[0]
    : 0;
  const readoutToVal = primarySeries && primarySeries.values.length > 0
    ? primarySeries.values[primarySeries.values.length - 1]
    : 0;
  const readoutValue = countUp(frame, {
    from: readoutFromVal,
    to: readoutToVal,
    startFrame: enterFrame,
    durationFrames: drawDurationFrames,
    easing: "outQuart",
    decimals: 1,
  });

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

      {/* Section label */}
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

      {/* Value-readout chip (top-right of chart zone) */}
      {showValueReadout && primarySeries && (
        <div
          style={{
            position: "absolute",
            top: READOUT_TOP,
            right: READOUT_RIGHT,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 12,
            background: resolvedPaper,
            border: `2px solid ${resolvedAccent}`,
            fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 28,
            color: resolvedInk,
            letterSpacing: "0.02em",
            fontVariantNumeric: "tabular-nums",
            opacity: headerOpacity,
          }}
        >
          {primarySeries.name && (
            <span
              style={{ color: resolvedMuted, fontWeight: 500, fontSize: 22 }}
            >
              {primarySeries.name.toUpperCase()}
            </span>
          )}
          <span>
            {formatCount(readoutValue, { decimals: 1, thousands: true })}
          </span>
        </div>
      )}

      {/* CHART ZONE */}
      <div
        style={{
          position: "absolute",
          top: CHART_ZONE_TOP,
          left: CHART_ZONE_LEFT,
          width: CHART_ZONE_WIDTH,
          height: CHART_ZONE_HEIGHT,
        }}
      >
        <svg
          width={CHART_ZONE_WIDTH}
          height={CHART_ZONE_HEIGHT}
          viewBox={`0 0 ${CHART_ZONE_WIDTH} ${CHART_ZONE_HEIGHT}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <g transform={`translate(${CHART_PAD_LEFT}, ${CHART_PAD_TOP})`}>
            {/* Axes */}
            {showAxes && (
              <g opacity={axesOpacity}>
                {/* Y axis */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={innerH}
                  stroke={resolvedMuted}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
                {/* X axis */}
                <line
                  x1={0}
                  y1={innerH}
                  x2={innerW}
                  y2={innerH}
                  stroke={resolvedMuted}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
                {/* Horizontal gridlines at 25/50/75% of innerH */}
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={`gridline-${f}`}
                    x1={0}
                    y1={innerH * f}
                    x2={innerW}
                    y2={innerH * f}
                    stroke={resolvedMuted}
                    strokeWidth={1}
                    strokeOpacity={0.15}
                    strokeDasharray="4 6"
                  />
                ))}
                {/* Y axis tick labels (yMin, yMax) */}
                <text
                  x={-12}
                  y={innerH}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily='"JetBrains Mono", "SF Mono", ui-monospace, monospace'
                  fontSize={22}
                  fontWeight={500}
                  fill={resolvedMuted}
                >
                  {formatCount(yMin, { decimals: 0, thousands: true })}
                </text>
                <text
                  x={-12}
                  y={0}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily='"JetBrains Mono", "SF Mono", ui-monospace, monospace'
                  fontSize={22}
                  fontWeight={500}
                  fill={resolvedMuted}
                >
                  {formatCount(yMax, { decimals: 0, thousands: true })}
                </text>
              </g>
            )}

            {/* Series — drawn in order; each starts seriesStaggerFrames after the previous. */}
            {seriesPaths.map((s, sIdx) => {
              const sStart = enterFrame + sIdx * seriesStaggerFrames;
              const sLocal = Math.max(0, frame - sStart);
              const drawLinear = interpolate(
                sLocal,
                [0, drawDurationFrames],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const drawEased = outCubic(Math.max(0, Math.min(1, drawLinear)));
              const dashOffset = s.length * (1 - drawEased);

              if (s.points.length < 2) return null;

              return (
                <g key={`series-${sIdx}`}>
                  <path
                    d={s.d}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={s.length}
                    strokeDashoffset={dashOffset}
                  />

                  {/* Annotations — each pings at the moment the line reaches its atIndex. */}
                  {s.annotations.map((ann, aIdx) => {
                    const idx = Math.max(
                      0,
                      Math.min(s.points.length - 1, ann.atIndex),
                    );
                    const pt = s.points[idx];
                    if (!pt) return null;
                    const denom = Math.max(1, s.points.length - 1);
                    const annStart = sStart + Math.round(drawDurationFrames * (idx / denom));
                    const annLocal = Math.max(0, frame - annStart);
                    const annDurationFrames = Math.round(0.35 * fps);
                    const annT = Math.max(
                      0,
                      Math.min(1, annLocal / annDurationFrames),
                    );
                    // outBack overshoot for the dot ping.
                    const annScale = outBack(annT);
                    const annOpacity = annT;

                    // Annotation label position — alternate sides for readability.
                    const labelAbove = aIdx % 2 === 0;
                    const labelDy = labelAbove ? -ANNOTATION_OFFSET : ANNOTATION_OFFSET + 8;

                    return (
                      <g key={`ann-${sIdx}-${aIdx}`} opacity={annOpacity}>
                        {/* Outer ring */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={DOT_RADIUS + 6}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={2}
                          strokeOpacity={0.4 * annOpacity}
                        />
                        {/* Solid dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={DOT_RADIUS * annScale}
                          fill={s.color}
                        />
                        {/* Inner highlight */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={DOT_RADIUS * annScale * 0.4}
                          fill={resolvedPaper}
                        />
                        {/* Label */}
                        <text
                          x={pt.x}
                          y={pt.y + labelDy}
                          textAnchor="middle"
                          dominantBaseline={labelAbove ? "auto" : "hanging"}
                          fontFamily="Inter, sans-serif"
                          fontSize={22}
                          fontWeight={600}
                          fill={resolvedInk}
                        >
                          {ann.text}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* X-axis labels — rendered below the SVG to avoid clipping. */}
      {showAxes && xLabels.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: X_AXIS_LABEL_ROW_Y,
            left: CHART_ZONE_LEFT + CHART_PAD_LEFT,
            width: innerW,
            display: "flex",
            justifyContent: "space-between",
            opacity: axesOpacity,
          }}
        >
          {xLabels.map((lab, i) => (
            <span
              key={`xlab-${i}`}
              style={{
                fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
                fontSize: 20,
                fontWeight: 500,
                color: resolvedMuted,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                textAlign:
                  i === 0
                    ? "left"
                    : i === xLabels.length - 1
                      ? "right"
                      : "center",
                flex: "0 0 auto",
              }}
            >
              {lab}
            </span>
          ))}
        </div>
      )}

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
