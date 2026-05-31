/**
 * LineChartAnnotated16x9 — horizontal (1920×1080) port of `LineChartAnnotated9x16`.
 *
 * Re-laid for landscape. The wide canvas hosts a WIDER chart zone — more
 * horizontal room per data series — and the header sits in a single compact
 * top band rather than stacked tall. Value-readout chip moves to the
 * top-right inside the chart zone (same as 9:16) but benefits from the
 * extra horizontal room to breathe.
 *
 * Visual structure (1920×1080):
 *   - Optional BrandBreadcrumb16x9 (top-left, ~y=60)
 *   - Section label eyebrow (top-center, ~y=60)
 *   - Optional value-readout chip (top-right of chart zone)
 *   - CHART ZONE (~y=200..920, fills most of the 1080 canvas height):
 *       · X / Y axes at low alpha (if showAxes)
 *       · 1-2 polyline series with stroke-dashoffset draw-on
 *       · Annotation dots that ping at their atIndex reveal time
 *       · Annotation text labels next to dots
 *   - X-axis label row (~y=950, mono uppercase)
 *   - Optional EditorialCaption strip (default false)
 *   - BrandWatermark16x9 (bottom-right)
 *
 * Font defaults are 16:9-calibrated (ADR-001 §5.1): wider canvas at
 * long-form viewing distance.
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
import { countUp, formatCount } from "../animation";
import { outCubic, outBack } from "../timing/easing";

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

const annotationSchema_local = z.object({
  atIndex: z.number().int().min(0),
  text: z.string(),
});

const seriesSchema_local = z.object({
  name: z.string().default(""),
  color: z.string().default(""),
  values: z.array(z.number()).default([]),
  annotations: z.array(annotationSchema_local).default([]),
});
export type LineSeries16x9 = z.infer<typeof seriesSchema_local>;

export const lineChartAnnotated16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),
  /** X-axis labels. Length must equal each series' values length. */
  xLabels: z.array(z.string()).default([]),
  series: z.array(seriesSchema_local).default([]),
  yMin: z.number().optional(),
  yMax: z.number().optional(),
  showAxes: z.boolean().default(true),
  showValueReadout: z.boolean().default(true),
  drawDurationSeconds: z.number().min(0.3).max(8).default(1.2),
  enterSeconds: z.number().min(0).max(20).default(0.5),

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
export type LineChartAnnotated16x9Props = z.infer<typeof lineChartAnnotated16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────
const SECTION_LABEL_TOP = 56;

// Readout chip — top-right of the chart zone
const READOUT_TOP = 160;
const READOUT_RIGHT = 100;

// Chart zone: wide canvas, tall — leaves a top band for title/section label.
const CHART_ZONE_TOP = 200;
const CHART_ZONE_LEFT = 100;
const CHART_ZONE_WIDTH = 1920 - CHART_ZONE_LEFT * 2; // 1720
const CHART_ZONE_HEIGHT = 720;

// Inner SVG padding — extra horizontal room is the key 16:9 benefit.
const CHART_PAD_TOP = 50;
const CHART_PAD_RIGHT = 60;
const CHART_PAD_BOTTOM = 70;
const CHART_PAD_LEFT = 90;  // y-axis labels

const X_AXIS_LABEL_ROW_Y = CHART_ZONE_TOP + CHART_ZONE_HEIGHT - 30;

const STROKE_WIDTH = 8;
const DOT_RADIUS = 14;
const ANNOTATION_OFFSET = 26;

// ─── Helpers ───────────────────────────────────────────────────────
interface XY { x: number; y: number; }

function autoYRange(
  series: LineSeries16x9[],
  yMinOpt?: number,
  yMaxOpt?: number,
): { yMin: number; yMax: number } {
  const all = series.flatMap((s) => s.values);
  if (all.length === 0) return { yMin: 0, yMax: 1 };
  let yMin = yMinOpt ?? Math.min(...all);
  let yMax = yMaxOpt ?? Math.max(...all);
  if (yMin === yMax) {
    yMin -= Math.max(1, Math.abs(yMin) * 0.1);
    yMax += Math.max(1, Math.abs(yMax) * 0.1);
  } else if (yMinOpt === undefined && yMaxOpt === undefined) {
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
export const LineChartAnnotated16x9: React.FC<LineChartAnnotated16x9Props> = ({
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

  const innerW = CHART_ZONE_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
  const innerH = CHART_ZONE_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;

  const { yMin, yMax } = useMemo(
    () => autoYRange(series, yMinProp, yMaxProp),
    [series, yMinProp, yMaxProp],
  );

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

  const enterFrame = Math.round(enterSeconds * fps);
  const drawDurationFrames = Math.round(drawDurationSeconds * fps);
  const seriesStaggerFrames = Math.round(0.2 * fps);

  const headerOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const axesOpacity = interpolate(
    frame,
    [enterFrame, enterFrame + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const primarySeries = seriesPaths[0];
  const readoutFromVal =
    primarySeries && primarySeries.values.length > 0 ? primarySeries.values[0] : 0;
  const readoutToVal =
    primarySeries && primarySeries.values.length > 0
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

      {/* Section label — top-center */}
      {sectionLabel && (
        <div
          style={{
            position: "absolute",
            top: SECTION_LABEL_TOP,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 28,
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
            padding: "10px 20px",
            borderRadius: 12,
            background: resolvedPaper,
            border: `2px solid ${resolvedAccent}`,
            fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 30,
            color: resolvedInk,
            letterSpacing: "0.02em",
            fontVariantNumeric: "tabular-nums",
            opacity: headerOpacity,
          }}
        >
          {primarySeries.name && (
            <span style={{ color: resolvedMuted, fontWeight: 500, fontSize: 22 }}>
              {primarySeries.name.toUpperCase()}
            </span>
          )}
          <span>{formatCount(readoutValue, { decimals: 1, thousands: true })}</span>
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
                <line
                  x1={0} y1={0} x2={0} y2={innerH}
                  stroke={resolvedMuted} strokeWidth={2} strokeOpacity={0.4}
                />
                <line
                  x1={0} y1={innerH} x2={innerW} y2={innerH}
                  stroke={resolvedMuted} strokeWidth={2} strokeOpacity={0.4}
                />
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={`gridline-${f}`}
                    x1={0} y1={innerH * f} x2={innerW} y2={innerH * f}
                    stroke={resolvedMuted} strokeWidth={1} strokeOpacity={0.15}
                    strokeDasharray="4 6"
                  />
                ))}
                <text
                  x={-14} y={innerH} textAnchor="end" dominantBaseline="middle"
                  fontFamily='"JetBrains Mono", "SF Mono", ui-monospace, monospace'
                  fontSize={22} fontWeight={500} fill={resolvedMuted}
                >
                  {formatCount(yMin, { decimals: 0, thousands: true })}
                </text>
                <text
                  x={-14} y={0} textAnchor="end" dominantBaseline="middle"
                  fontFamily='"JetBrains Mono", "SF Mono", ui-monospace, monospace'
                  fontSize={22} fontWeight={500} fill={resolvedMuted}
                >
                  {formatCount(yMax, { decimals: 0, thousands: true })}
                </text>
              </g>
            )}

            {/* Series */}
            {seriesPaths.map((s, sIdx) => {
              const sStart = enterFrame + sIdx * seriesStaggerFrames;
              const sLocal = Math.max(0, frame - sStart);
              const drawLinear = interpolate(sLocal, [0, drawDurationFrames], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
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

                  {/* Annotations — each pings at the moment the line reaches its atIndex */}
                  {s.annotations.map((ann, aIdx) => {
                    const idx = Math.max(0, Math.min(s.points.length - 1, ann.atIndex));
                    const pt = s.points[idx];
                    if (!pt) return null;
                    const denom = Math.max(1, s.points.length - 1);
                    const annStart = sStart + Math.round(drawDurationFrames * (idx / denom));
                    const annLocal = Math.max(0, frame - annStart);
                    const annDurationFrames = Math.round(0.35 * fps);
                    const annT = Math.max(0, Math.min(1, annLocal / annDurationFrames));
                    const annScale = outBack(annT);
                    const annOpacity = annT;
                    const labelAbove = aIdx % 2 === 0;
                    const labelDy = labelAbove ? -ANNOTATION_OFFSET : ANNOTATION_OFFSET + 8;

                    return (
                      <g key={`ann-${sIdx}-${aIdx}`} opacity={annOpacity}>
                        <circle
                          cx={pt.x} cy={pt.y} r={DOT_RADIUS + 6}
                          fill="none" stroke={s.color} strokeWidth={2}
                          strokeOpacity={0.4 * annOpacity}
                        />
                        <circle cx={pt.x} cy={pt.y} r={DOT_RADIUS * annScale} fill={s.color} />
                        <circle
                          cx={pt.x} cy={pt.y} r={DOT_RADIUS * annScale * 0.4}
                          fill={resolvedPaper}
                        />
                        <text
                          x={pt.x} y={pt.y + labelDy}
                          textAnchor="middle"
                          dominantBaseline={labelAbove ? "auto" : "hanging"}
                          fontFamily="Inter, sans-serif"
                          fontSize={24}
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
                  i === 0 ? "left" : i === xLabels.length - 1 ? "right" : "center",
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

export default LineChartAnnotated16x9;
