/**
 * AbhiLineChart — replica of abhishek.devini's "line-chart" benchmark scene.
 * FOREGROUND ONLY: the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host AbhiScene9x16, so this renders transparent over
 * it and draws only the LOCAL surfaces (browser card, plot, lines, labels, glow).
 *
 * Source ground-truth: DXhkSFiD8dL 7.5–14s (DARK, teal accent #009181):
 *   • Mono UPPERCASE letter-spaced kicker "ARTIFICIAL ANALYSIS · INTELLIGENCE INDEX"
 *     (inline, accent-tinted — NOT a pill in this reel).
 *   • Two-line headline: "GPT-5.5 leads." (white) over "Across the board." (accent,
 *     terminal period accent-tinted).
 *   • A dark rounded browser/dashboard card slides up + fades, with a teal accent
 *     left-edge glow bar. Inside: card title + gear glyph, a colored-dot legend row,
 *     a multi-series LINE chart (each model one colored polyline w/ a hollow end-dot)
 *     drawing on LEFT→RIGHT over ~20f behind a vertical accent SCAN-LINE, y-axis
 *     gridlines + numeric ticks, an x-axis label, and a hero (accent) line that
 *     blooms a soft glow + solid end-dot when its draw completes.
 *
 * Choreography (STYLE-SPEC "Charts/viz" + "Timing conventions"):
 *   • f1–6   kicker fades + drops from y−16px; accent dot/rule ignites f4.
 *   • f6–    headline rises line-by-line from +18px over ~8f (white first, accent
 *            line ~6f later; accent line tint-sweeps white→accent L→R over ~8f).
 *   • f14–   browser card scales 0.96→1 + fades up from +28px over ~10f; accent
 *            left-edge glow bar wipes top→bottom.
 *   • f26–   card title + gear + legend dots pop in (~3f stagger), y-axis + ticks
 *            fade, then the line series DRAW L→R over ~20f behind a travelling
 *            accent scan-line; hero (accent) line blooms a glow + solid end-dot
 *            when the wipe passes its end; x-axis label fades in last.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = pct/100*1080.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/** "" sentinel = "caller did not override" (no zod reflection on defaults). */
const S = "";

/** One model's line series: a label, color, and its y-values (one per x-tick). */
const seriesSchema = z.object({
  /** Legend label (e.g. "GPT-5.5"). */
  label: z.string().default(""),
  /** Line + dot color. The "hero" series should pass accentColor here. */
  color: z.string().default("#F2F2F4"),
  /**
   * Y-values in data units, left→right (one per x-tick). `null` skips a point so a
   * line can start later than x=0 (shorter models join the chart further right).
   */
  values: z.array(z.number().nullable()).default([]),
  /**
   * Visual role:
   *   "rival" — thin muted line, hollow end-dot.
   *   "hero"  — thicker line, solid end-dot, blooms an accent glow on completion.
   */
  kind: z.enum(["rival", "hero"]).default("rival"),
});
export type AbhiLineSeries = z.infer<typeof seriesSchema>;

export const abhiLineChartSchema = z.object({
  /** Single accent color — defaults to Anthropic orange (topic-tracking). */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono UPPERCASE kicker (inline, accent-tinted). */
  kicker: z.string().default("ARTIFICIAL ANALYSIS · INTELLIGENCE INDEX"),
  /** Headline line 1 (ink/white). */
  headlinePre: z.string().default("Opus 4.8 leads."),
  /** Headline line 2 (accent; tint-sweeps white→accent L→R). "" hides it. */
  headlineAccent: z.string().default("Across the board."),
  /** Browser/card title (top chrome, bold ink). */
  cardTitle: z.string().default("Intelligence Index"),
  /** Y-axis caption (rotated, grey). "" hides it. */
  yAxisLabel: z.string().default("Intelligence Index"),
  /** X-axis caption (under the plot, grey). "" hides it. */
  xAxisLabel: z.string().default("Output tokens total (M, log scale)"),
  /** X-axis tick labels, left→right. Determines the horizontal grid. */
  xTicks: z.array(z.string()).default(["0", "4M", "8M", "16M", "32M", "64M", "128M"]),
  /** Y-axis numeric ticks, BOTTOM→TOP (ascending). First = plot floor. */
  yTicks: z.array(z.number()).default([35, 40, 45, 50, 55, 60]),
  /** The line series, drawn back→front (last one painted on top). */
  series: z.array(seriesSchema).default([
    { label: "Claude Opus 4.6", color: "#E08A5A", kind: "rival", values: [null, null, 46.5, 49, 51, 52.5, 53] },
    { label: "Gemini 3.1 Pro", color: "#6E8BE0", kind: "rival", values: [null, 36, 47.5, 51, 53, 55.5, 56.5] },
    { label: "Claude Opus 4.7", color: "#C8C8CE", kind: "rival", values: [null, null, 48, 52.5, 54.5, 56, 56.5] },
    { label: "Opus 4.8", color: "#F2F2F4", kind: "hero", values: [41, null, 52, 56.5, 57.5, 59.5, 60.5] },
  ]),
}).transform((v) => ({
  ...v,
  // Promote the hero series' color to the accent so callers only set accentColor.
  series: v.series.map((s) =>
    s.kind === "hero" && s.color === "#F2F2F4" ? { ...s, color: v.accentColor } : s,
  ),
}));
export type AbhiLineChartProps = z.input<typeof abhiLineChartSchema>;

const PX = 1080; // 1px@720-spec → 1.5px on this 1080-wide canvas
const CANVAS_H = 1920;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(253,155,0,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiLineChart: React.FC<Partial<AbhiLineChartProps>> = (props) => {
  const p = abhiLineChartSchema.parse(props ?? {});
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const grey = isDark ? "#8A8A90" : "#5A5A66";
  const accent = p.accentColor;

  const px = (specPx720: number) => (specPx720 / 720) * PX;

  // ---- Outer geometry (spec % of 720w/1280h → px on 1080/1920) ----
  const marginX = Math.round(0.078 * PX); // left text margin x≈7.8%
  const kickerPx = Math.round(0.0205 * PX); // ~2.05% → 22px
  const headlinePx = Math.round(0.072 * PX); // ~7.2% → 78px

  // ---- Card geometry (centered; ~88% wide, top ~34%). ----
  const cardW = Math.round(0.886 * PX); // ≈ 957px
  const cardLeft = Math.round((PX - cardW) / 2);
  const cardTop = Math.round(0.345 * CANVAS_H); // y≈34.5% → ~662px
  const cardH = Math.round(0.23 * CANVAS_H); // ≈ 442px

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  // ============================================================

  // --- Kicker: fade + drop from y−16px over f1–6, dot/rule ignites f4 ---
  const kickerProg = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 170 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerProg, [0, 1], [-px(16), 0]);
  const kickerOpacity = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Headline: line 1 (white) rises f6, line 2 (accent) ~6f later ---
  const riseFor = (start: number) => {
    const prog = spring({
      frame: frame - start,
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 150 },
      durationInFrames: 8,
    });
    return {
      y: interpolate(prog, [0, 1], [px(18), 0]),
      opacity: interpolate(frame, [start, start + 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    };
  };
  const preR = riseFor(6);
  const accR = riseFor(12);
  // Accent line tint-sweeps white→accent L→R over ~8f after it rises.
  const sweepStart = 12 + 4;
  const sweep = interpolate(frame, [sweepStart, sweepStart + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Browser card: scale 0.96→1 + fade up from +28px over ~10f at f14 ---
  const CARD_START = 14;
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120 },
    durationInFrames: 10,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardRise = interpolate(cardSpring, [0, 1], [px(28), 0]);
  // Accent left-edge glow bar wipes top→bottom as the card lands.
  const edgeWipe = interpolate(frame, [CARD_START + 2, CARD_START + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // --- Inner chrome (title + gear + legend) pops after card lands ---
  const CHROME_START = CARD_START + 12; // ~f26
  const chromeOp = interpolate(frame, [CHROME_START, CHROME_START + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Axis fades, then lines DRAW L→R over ~20f behind a scan-line ---
  const AXIS_START = CHROME_START + 4; // ~f30
  const axisOp = interpolate(frame, [AXIS_START, AXIS_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const DRAW_START = AXIS_START + 4; // ~f34
  const DRAW_DUR = 20;
  const draw = interpolate(frame, [DRAW_START, DRAW_START + DRAW_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // X-axis label fades in last, after the draw completes.
  const XLABEL_START = DRAW_START + DRAW_DUR + 2;
  const xLabelOp = interpolate(frame, [XLABEL_START, XLABEL_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Plot box (inside the card body) ----
  const PAD_T = px(78); // below chrome (title + legend)
  const PAD_B = px(58); // above x-axis labels
  const PAD_L = px(78); // for y-axis ticks + label
  const PAD_R = px(34);
  const plotX = cardLeft + PAD_L;
  const plotY = cardTop + PAD_T;
  const plotW = cardW - PAD_L - PAD_R;
  const plotH = cardH - PAD_T - PAD_B;

  const xTicks = p.xTicks.length > 0 ? p.xTicks : [""];
  const nx = xTicks.length;
  const xAt = (i: number) =>
    nx <= 1 ? plotX : plotX + (plotW * i) / (nx - 1);

  const yTicks = p.yTicks.length > 0 ? p.yTicks : [0, 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const ySpan = yMax - yMin || 1;
  const yAt = (v: number) => plotY + plotH * (1 - (v - yMin) / ySpan);

  // SVG geometry is card-local (origin at card top-left).
  const svgX = (i: number) => xAt(i) - cardLeft;
  const svgY = (v: number) => yAt(v) - cardTop;
  // The travelling scan-line reveal position, in card-local px.
  const wipeX = (plotX - cardLeft) + plotW * draw;

  // ---- Surfaces ----
  const cardFill = isDark ? "#101117" : "#FFFFFF";
  const cardEdge = isDark ? "rgba(255,255,255,0.07)" : "rgba(12,12,18,0.10)";
  const plotFill = isDark ? "#08090E" : "#F6F4F9";
  const gridStroke = isDark ? "rgba(242,242,244,0.07)" : "rgba(12,12,18,0.07)";
  const axisStroke = isDark ? "rgba(242,242,244,0.16)" : "rgba(12,12,18,0.18)";
  const tickColor = isDark ? "#6F6F77" : "#7A7682";

  const hasAccentLine = p.headlineAccent.trim() !== S;
  const hasYLabel = p.yAxisLabel.trim() !== S;
  const hasXLabel = p.xAxisLabel.trim() !== S;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker (inline mono caps, accent, LEFT x≈7.8% y≈16%) ── */}
      <div
        style={{
          position: "absolute",
          top: Math.round(0.158 * CANVAS_H),
          left: marginX,
          right: marginX,
          transform: `translateY(${kickerY}px)`,
          opacity: kickerOpacity,
          display: "flex",
          alignItems: "center",
          gap: px(10),
        }}
      >
        <span
          style={{
            width: px(7),
            height: px(7),
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${px(6 + dotGlow * 8)}px ${hexA(accent, 0.4 + dotGlow * 0.5)}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: kickerPx,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ── Two-line headline (LEFT x≈7.8% y≈18%) ── */}
      <div
        style={{
          position: "absolute",
          top: Math.round(0.182 * CANVAS_H),
          left: marginX,
          right: marginX,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: headlinePx,
          letterSpacing: "-0.02em",
          lineHeight: 1.02,
        }}
      >
        {/* line 1 — white/ink */}
        <div
          style={{
            color: ink,
            transform: `translateY(${preR.y}px)`,
            opacity: preR.opacity,
          }}
        >
          {p.headlinePre}
        </div>
        {/* line 2 — accent (white copy + accent copy wiping over L→R) */}
        {hasAccentLine && (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              transform: `translateY(${accR.y}px)`,
              opacity: accR.opacity,
            }}
          >
            <span style={{ color: ink }}>{p.headlineAccent}</span>
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                color: accent,
                clipPath: `inset(0 ${100 - sweep}% 0 0)`,
              }}
            >
              {p.headlineAccent}
            </span>
          </div>
        )}
      </div>

      {/* ── Browser / dashboard card ── */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          height: cardH,
          opacity: cardOpacity,
          transform: `translateY(${cardRise}px) scale(${cardScale})`,
          transformOrigin: "50% 35%",
          borderRadius: px(20),
          background: cardFill,
          border: `1px solid ${cardEdge}`,
          boxShadow: `0 ${px(26)}px ${px(72)}px ${hexA("#000000", isDark ? 0.55 : 0.18)}, 0 0 ${px(60)}px ${hexA(accent, isDark ? 0.07 : 0.05)}`,
          overflow: "hidden",
        }}
      >
        {/* accent left-edge glow bar (wipes top→bottom) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: px(4),
            height: `${edgeWipe * 100}%`,
            background: `linear-gradient(180deg, ${accent}, ${hexA(accent, 0.4)})`,
            boxShadow: `0 0 ${px(18)}px ${hexA(accent, 0.55)}`,
          }}
        />

        {/* card title + gear (top chrome) */}
        <div
          style={{
            position: "absolute",
            left: px(28),
            right: px(28),
            top: px(22),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: chromeOp,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: px(20),
              letterSpacing: "-0.01em",
              color: ink,
            }}
          >
            {p.cardTitle}
          </span>
          <GearGlyph px={px} color={tickColor} />
        </div>

        {/* colored-dot legend row */}
        <div
          style={{
            position: "absolute",
            left: px(28),
            right: px(28),
            top: px(54),
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: px(14),
            opacity: chromeOp,
          }}
        >
          {p.series.map((s, i) => {
            const op = interpolate(
              frame,
              [CHROME_START + i * 3, CHROME_START + i * 3 + 5],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(6),
                  opacity: op,
                }}
              >
                <span
                  style={{
                    width: px(8),
                    height: px(8),
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 600,
                    fontSize: px(12.5),
                    color: grey,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
              </span>
            );
          })}
        </div>

        {/* plot area + chart (SVG, card-local coordinates) */}
        <div
          style={{
            position: "absolute",
            left: plotX - cardLeft,
            top: plotY - cardTop,
            width: plotW,
            height: plotH,
            background: plotFill,
            borderRadius: px(8),
            opacity: axisOp,
          }}
        />

        <svg
          width={cardW}
          height={cardH}
          viewBox={`0 0 ${cardW} ${cardH}`}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          {/* horizontal gridlines + y-axis numeric ticks */}
          <g opacity={axisOp}>
            {yTicks.map((v, i) => {
              const y = svgY(v);
              return (
                <g key={`y${i}`}>
                  <line
                    x1={plotX - cardLeft}
                    y1={y}
                    x2={plotX - cardLeft + plotW}
                    y2={y}
                    stroke={i === 0 ? axisStroke : gridStroke}
                    strokeWidth={i === 0 ? 1.4 : 1}
                  />
                  <text
                    x={plotX - cardLeft - px(10)}
                    y={y + px(4)}
                    textAnchor="end"
                    fontFamily={FONT_STACKS.mono}
                    fontSize={px(11)}
                    fill={tickColor}
                  >
                    {v}
                  </text>
                </g>
              );
            })}
          </g>

          {/* x-axis tick labels */}
          <g opacity={axisOp}>
            {xTicks.map((t, i) => (
              <text
                key={`x${i}`}
                x={svgX(i)}
                y={svgY(yMin) + px(22)}
                textAnchor="middle"
                fontFamily={FONT_STACKS.mono}
                fontSize={px(11)}
                fill={tickColor}
              >
                {t}
              </text>
            ))}
          </g>

          {/* rotated y-axis caption */}
          {hasYLabel && (
            <text
              x={plotX - cardLeft - px(46)}
              y={svgY((yMin + yMax) / 2)}
              textAnchor="middle"
              fontFamily={FONT_STACKS.sans}
              fontWeight={600}
              fontSize={px(11.5)}
              fill={tickColor}
              opacity={axisOp}
              transform={`rotate(-90 ${plotX - cardLeft - px(46)} ${svgY((yMin + yMax) / 2)})`}
            >
              {p.yAxisLabel}
            </text>
          )}

          {/* line series — clipped by the travelling scan-line reveal */}
          <defs>
            <clipPath id="abhi-line-reveal">
              <rect
                x={plotX - cardLeft - px(40)}
                y={cardTop - cardTop}
                width={wipeX - (plotX - cardLeft - px(40))}
                height={cardH}
              />
            </clipPath>
          </defs>

          <g clipPath="url(#abhi-line-reveal)">
            {p.series.map((s, si) => {
              // Build the polyline from defined (non-null/finite) points.
              const pts: { x: number; y: number }[] = [];
              s.values.forEach((v, i) => {
                if (typeof v === "number" && Number.isFinite(v) && i < nx) {
                  pts.push({ x: svgX(i), y: svgY(v) });
                }
              });
              if (pts.length === 0) return null;
              const isHero = s.kind === "hero";
              const d = pts
                .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`)
                .join(" ");
              const last = pts[pts.length - 1];
              // End-dot becomes solid only once the wipe passes it (draw complete).
              const endRevealed = wipeX >= last.x - px(2);
              return (
                <g key={si}>
                  {/* hero accent glow under the line */}
                  {isHero && (
                    <path
                      d={d}
                      fill="none"
                      stroke={hexA(accent, 0.5)}
                      strokeWidth={px(7)}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{ filter: `blur(${px(5)}px)` }}
                      opacity={interpolate(draw, [0.2, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      })}
                    />
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={isHero ? px(2.6) : px(1.8)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={isHero ? 1 : 0.92}
                  />
                  {/* node dots along the line */}
                  {pts.map((pt, pi) => {
                    const isEnd = pi === pts.length - 1;
                    const solid = isEnd ? endRevealed : true;
                    const r = isEnd && isHero ? px(4.5) : px(3);
                    return (
                      <circle
                        key={pi}
                        cx={pt.x}
                        cy={pt.y}
                        r={r}
                        fill={solid ? s.color : cardFill}
                        stroke={s.color}
                        strokeWidth={px(1.6)}
                      />
                    );
                  })}
                  {/* hero end-dot halo bloom when revealed */}
                  {isHero && endRevealed && (
                    <circle
                      cx={last.x}
                      cy={last.y}
                      r={px(11)}
                      fill={hexA(accent, 0.28)}
                      style={{ filter: `blur(${px(4)}px)` }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* the bright travelling scan-line itself (accent) */}
          {draw > 0 && draw < 1 && (
            <line
              x1={wipeX}
              y1={svgY(yMax) - px(6)}
              x2={wipeX}
              y2={svgY(yMin) + px(2)}
              stroke={accent}
              strokeWidth={px(2)}
              opacity={0.9}
              style={{ filter: `drop-shadow(0 0 ${px(8)}px ${hexA(accent, 0.8)})` }}
            />
          )}
        </svg>

        {/* x-axis caption (fades in last) */}
        {hasXLabel && (
          <div
            style={{
              position: "absolute",
              left: plotX - cardLeft,
              top: cardH - px(26),
              width: plotW,
              textAlign: "center",
              opacity: xLabelOp,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 600,
              fontSize: px(12),
              color: tickColor,
            }}
          >
            {p.xAxisLabel}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const GearGlyph: React.FC<{ px: (n: number) => number; color: string }> = ({
  px,
  color,
}) => (
  <svg width={px(18)} height={px(18)} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={1.6} />
    <path
      d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </svg>
);
