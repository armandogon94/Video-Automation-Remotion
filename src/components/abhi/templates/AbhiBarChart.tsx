/**
 * AbhiBarChart — replica of abhishek.devini's "bar-chart" metric scene.
 * FOREGROUND ONLY: the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host AbhiScene9x16, so this renders transparent over
 * it and draws only the LOCAL chart surfaces (bars, axis, labels, glow).
 *
 * Source ground-truth: DY6pP0FP4Qa 40–46s (DARK, "● ALIGNMENT" /
 * "Misaligned behavior ↓ lower is better" — 4 vertical bars from a baseline:
 * Sonnet 4.6 grey · Mythos green · Opus 4.7 grey · Opus 4.8 WHITE-glow hero,
 * value labels counting up above each, category labels below, a green dashed
 * threshold line crossing the field). Secondary clean ref: DY6pP0FP4Qa 6.5–9.5s
 * (increasing-staircase rising bars, rightmost = white-glow hero).
 *
 * Choreography (STYLE-SPEC "Charts/viz"):
 *   • Kicker pill fades + drops from y−16px over f1–6; accent dot ignites f4.
 *   • Headline + "↓ lower is better" caption rise from +18px over ~8f at f6.
 *   • Bars grow from the baseline staggered ~4f each (each bar grows over ~14f,
 *     fast→slow ease-out); the hero (white-glow) bar blooms a soft accent glow
 *     on land; the secondary (accent-colored) bar tints in.
 *   • Value label above each bar counts up (0→value, ~14f) as the bar grows.
 *   • Category labels under the baseline fade in 2–3f after each bar lands.
 *   • Optional dashed threshold line wipes in L→R after the bars settle.
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

const barSchema = z.object({
  /** Category label under the baseline (e.g. "Opus 4.8"). */
  label: z.string().default(""),
  /** Numeric value the bar height + counting label represents. */
  value: z.number().default(0),
  /**
   * Visual role of this bar:
   *   "rival"   — muted grey slate bar (the baseline / competitors).
   *   "accent"  — filled in the scene accent color (the secondary highlight).
   *   "hero"    — white→light vertical-gradient bar with an accent glow bloom.
   */
  kind: z.enum(["rival", "accent", "hero"]).default("rival"),
});
export type AbhiBar = z.infer<typeof barSchema>;

export const abhiBarChartSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono kicker pill, UPPERCASE (e.g. "ALIGNMENT" / "THE BENCHMARK"). */
  kicker: z.string().default("ALIGNMENT"),
  /** Color of the kicker dot + secondary "accent" bars (e.g. green for "lower"). */
  dotColor: z.string().default("#42AE66"),
  /** Two-tone headline ink portion (left, white/near-black). */
  headline: z.string().default("Misaligned behavior"),
  /** Small grey caption appended inline after the headline. "" hides it. */
  caption: z.string().default("↓ lower is better"),
  /** The bars, left→right. 2–6 sensible; 4 is the canonical layout. */
  bars: z.array(barSchema).default([
    { label: "Sonnet 4.6", value: 2.5, kind: "rival" },
    { label: "Mythos", value: 1.75, kind: "accent" },
    { label: "Opus 4.7", value: 2.4, kind: "rival" },
    { label: "Opus 4.8", value: 1.85, kind: "hero" },
  ]),
  /** Decimal places for the counting value labels (0–2). */
  valueDecimals: z.number().int().min(0).max(2).default(2),
  /** Optional suffix on value labels (e.g. "%", "×"). "" = none. */
  valueSuffix: z.string().default(""),
  /**
   * Optional dashed threshold line drawn across the field at this VALUE level
   * (in the same units as the bars). NaN / ≤0 hides it. Tinted with dotColor.
   */
  thresholdValue: z.number().default(1.85),
  /** Optional takeaway pill below the chart (green-tinted, leading glyph). "" hides it. */
  footnote: z.string().default(""),
});
export type AbhiBarChartProps = z.infer<typeof abhiBarChartSchema>;

const PX = 1080; // 1px@720-spec → 1.5px on this 1080-wide canvas

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

export const AbhiBarChart: React.FC<Partial<AbhiBarChartProps>> = (props) => {
  const p = abhiBarChartSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const grey = isDark ? "#8A8A90" : "#5A5A66";
  const rivalFill = isDark ? "#2E2C32" : "#D9D5DE";
  const rivalEdge = isDark ? "rgba(255,255,255,0.06)" : "rgba(12,12,18,0.10)";
  const axisColor = isDark ? "rgba(242,242,244,0.16)" : "rgba(12,12,18,0.18)";

  const px = (specPx720: number) => (specPx720 / 720) * PX;

  // ---- Geometry (spec % of 720w → px on 1080) ----
  const marginX = Math.round(0.078 * PX); // left text margin x≈7.8%
  const kickerPx = Math.round(0.0205 * PX); // ~2.05% → 22px
  const headlinePx = Math.round(0.058 * PX); // ~5.8% → 63px

  // Plot box (the bar field). Measured from source: baseline y≈70%, tallest
  // bar top y≈37% → tallest bar ≈ 33% of 1920h ≈ 637px (much taller than before).
  const plotLeft = Math.round(0.155 * PX);
  const plotRight = Math.round(0.875 * PX);
  const plotWidth = plotRight - plotLeft;
  const baselineTop = Math.round(0.699 * 1920); // y≈70% of 1920h → ~1342px
  const maxBarH = Math.round(0.332 * 1920); // tallest bar ≈ 33% of 1920 → ~637px
  const barW = Math.round(0.083 * PX); // bar width ≈ 8.3% of 720w → ~90px

  const bars = p.bars.length > 0 ? p.bars : [{ label: "", value: 0, kind: "rival" as const }];
  const n = bars.length;
  const maxVal = Math.max(...bars.map((b) => b.value), 0.0001);

  // Evenly distribute bar centers across the plot box.
  const slot = plotWidth / n;
  const centerX = (i: number) => plotLeft + slot * (i + 0.5);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  // ============================================================

  // --- Kicker pill: fade + drop from y−24px over f1–6, dot ignites f4 ---
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

  // --- Headline + caption: rise from +18px over ~8f starting f6 ---
  const headStart = 6;
  const headProg = spring({
    frame: frame - headStart,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const headY = interpolate(headProg, [0, 1], [px(18), 0]);
  const headOpacity = interpolate(frame, [headStart, headStart + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Bars: grow from baseline staggered ~4f each, ~14f grow per bar ---
  const BAR_FIRST = 16; // first bar starts after the headline lands
  const BAR_STAGGER = 4;
  const BAR_GROW = 14;
  const barStart = (i: number) => BAR_FIRST + i * BAR_STAGGER;

  // After all bars land, the optional dashed threshold line wipes in L→R.
  const lastBarEnd = barStart(n - 1) + BAR_GROW;
  const THRESH_START = lastBarEnd + 2;
  const threshWipe = interpolate(
    frame,
    [THRESH_START, THRESH_START + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );

  const hasCaption = p.caption.trim() !== S;
  const showThreshold = p.thresholdValue > 0 && p.thresholdValue <= maxVal;
  const threshY = baselineTop - (p.thresholdValue / maxVal) * maxBarH;

  // --- Footnote takeaway pill: fades up under the chart after bars settle ---
  const hasFootnote = p.footnote.trim() !== S;
  const FOOT_START = lastBarEnd + 4;
  const footProg = spring({
    frame: frame - FOOT_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 160 },
    durationInFrames: 8,
  });
  const footY = interpolate(footProg, [0, 1], [px(14), 0]);
  const footOpacity = interpolate(frame, [FOOT_START, FOOT_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Kicker pill surface ----
  const pillBg = isDark ? "rgba(36,36,40,0.66)" : "rgba(244,244,250,0.85)";
  const pillBorder = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(12,12,18,0.08)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill (mono, centered x50% y≈20%) ── */}
      <div
        style={{
          position: "absolute",
          top: Math.round(0.195 * 1920),
          left: "50%",
          transform: `translateX(-50%) translateY(${kickerY}px)`,
          opacity: kickerOpacity,
          display: "inline-flex",
          alignItems: "center",
          gap: px(8),
          padding: `${px(7)}px ${px(14)}px`,
          borderRadius: 999,
          background: pillBg,
          border: pillBorder,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            width: px(7),
            height: px(7),
            borderRadius: "50%",
            background: p.dotColor,
            boxShadow: `0 0 ${px(6 + dotGlow * 8)}px ${hexA(p.dotColor, 0.4 + dotGlow * 0.5)}`,
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
            color: grey,
            whiteSpace: "nowrap",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ── Headline + inline grey caption (LEFT x≈7.8% y≈25%) ── */}
      <div
        style={{
          position: "absolute",
          top: Math.round(0.252 * 1920),
          left: marginX,
          right: marginX,
          transform: `translateY(${headY}px)`,
          opacity: headOpacity,
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: px(10),
          fontFamily: FONT_STACKS.sans,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: headlinePx,
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            color: ink,
          }}
        >
          {p.headline}
        </span>
        {hasCaption && (
          <span
            style={{
              fontWeight: 700,
              fontSize: Math.round(headlinePx * 0.46),
              letterSpacing: "-0.01em",
              color: grey,
              whiteSpace: "nowrap",
            }}
          >
            {p.caption}
          </span>
        )}
      </div>

      {/* ── Chart field ── */}
      <AbsoluteFill>
        {/* baseline axis */}
        <div
          style={{
            position: "absolute",
            left: plotLeft - px(8),
            top: baselineTop,
            width: plotWidth + px(16),
            height: 1.5,
            background: axisColor,
            transformOrigin: "left center",
            transform: `scaleX(${interpolate(
              frame,
              [BAR_FIRST - 4, BAR_FIRST + 6],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
            )})`,
          }}
        />

        {/* optional dashed threshold line (wipes L→R) */}
        {showThreshold && (
          <div
            style={{
              position: "absolute",
              left: plotLeft - px(8),
              top: threshY,
              width: (plotWidth + px(16)) * threshWipe,
              height: 0,
              borderTop: `2px dashed ${hexA(p.dotColor, 0.55)}`,
              opacity: threshWipe,
            }}
          />
        )}

        {/* bars + labels */}
        {bars.map((b, i) => {
          const start = barStart(i);
          // grow 0→1 over BAR_GROW with ease-out (fast→slow)
          const grow = interpolate(frame, [start, start + BAR_GROW], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const targetH = (b.value / maxVal) * maxBarH;
          const h = targetH * grow;
          const cx = centerX(i);
          const barLeft = cx - barW / 2;
          const isHero = b.kind === "hero";
          const isAccent = b.kind === "accent";

          // hero glow blooms on land (after ~70% grown)
          const landGlow = interpolate(grow, [0.7, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // counting value label (tracks grow)
          const shownVal = b.value * grow;
          const valStr = shownVal.toFixed(p.valueDecimals) + p.valueSuffix;
          const labelColor = isHero ? ink : isAccent ? p.dotColor : ink;
          // value label fades in with the bar; category label 2–3f after land
          const valOpacity = interpolate(frame, [start, start + 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const catOpacity = interpolate(
            frame,
            [start + BAR_GROW - 2, start + BAR_GROW + 4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          const barFill = isHero
            ? "linear-gradient(180deg, #FFFFFF 0%, #ECECF0 55%, #C9C9D2 100%)"
            : isAccent
              ? `linear-gradient(180deg, ${hexA(p.dotColor, 1)} 0%, ${hexA(p.dotColor, 0.92)} 100%)`
              : rivalFill;

          return (
            <React.Fragment key={i}>
              {/* hero glow bloom (behind the bar) */}
              {isHero && (
                <div
                  style={{
                    position: "absolute",
                    left: barLeft - px(18),
                    top: baselineTop - h - px(18),
                    width: barW + px(36),
                    height: h + px(28),
                    borderRadius: px(20),
                    background: `radial-gradient(ellipse at 50% 40%, ${hexA(
                      p.accentColor,
                      0.55,
                    )} 0%, ${hexA(p.accentColor, 0.18)} 45%, rgba(0,0,0,0) 72%)`,
                    filter: "blur(22px)",
                    opacity: 0.85 * landGlow,
                  }}
                />
              )}

              {/* the bar */}
              <div
                style={{
                  position: "absolute",
                  left: barLeft,
                  top: baselineTop - h,
                  width: barW,
                  height: h,
                  borderRadius: `${px(8)}px ${px(8)}px ${px(2)}px ${px(2)}px`,
                  background: barFill,
                  border: isHero
                    ? "none"
                    : isAccent
                      ? "none"
                      : `1px solid ${rivalEdge}`,
                  boxShadow: isHero
                    ? `0 0 ${px(24)}px ${hexA(p.accentColor, 0.45 * landGlow)}`
                    : isAccent
                      ? `0 0 ${px(16)}px ${hexA(p.dotColor, 0.28)}`
                      : "none",
                }}
              />

              {/* counting value label above the bar */}
              <div
                style={{
                  position: "absolute",
                  left: barLeft - px(20),
                  top: baselineTop - h - px(40),
                  width: barW + px(40),
                  textAlign: "center",
                  opacity: valOpacity,
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize: Math.round(0.034 * PX),
                  letterSpacing: "-0.01em",
                  color: labelColor,
                  whiteSpace: "nowrap",
                }}
              >
                {valStr}
              </div>

              {/* category label under the baseline */}
              <div
                style={{
                  position: "absolute",
                  left: barLeft - px(30),
                  top: baselineTop + px(12),
                  width: barW + px(60),
                  textAlign: "center",
                  opacity: catOpacity,
                  fontFamily: FONT_STACKS.mono,
                  fontWeight: isHero ? 700 : 500,
                  fontSize: Math.round(0.0205 * PX),
                  letterSpacing: "0.02em",
                  color: isHero ? ink : grey,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {b.label}
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>

      {/* ── Footnote takeaway pill (green-tinted, centered under the chart) ── */}
      {hasFootnote && (
        <div
          style={{
            position: "absolute",
            top: baselineTop + px(58),
            left: "50%",
            maxWidth: PX - 2 * marginX,
            transform: `translateX(-50%) translateY(${footY}px)`,
            opacity: footOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: px(10),
            padding: `${px(11)}px ${px(20)}px`,
            borderRadius: 999,
            background: hexA(p.dotColor, isDark ? 0.1 : 0.14),
            border: `1px solid ${hexA(p.dotColor, 0.4)}`,
            boxShadow: `0 0 ${px(26)}px ${hexA(p.dotColor, 0.18)}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: Math.round(0.026 * PX), lineHeight: 1, flexShrink: 0 }}>
            🤝
          </span>
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: Math.round(0.029 * PX),
              letterSpacing: "-0.01em",
              color: ink,
            }}
          >
            {p.footnote}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
