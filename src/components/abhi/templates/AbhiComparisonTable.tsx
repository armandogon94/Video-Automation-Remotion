/**
 * AbhiComparisonTable — replica of abhishek.devini's "comparison-table" scene
 * (the benchmark / "we win across the board" AI-model data-table card).
 * FOREGROUND ONLY: the shared AbhiBackground (dark-grid-glow) is mounted by the
 * host AbhiScene9x16, so this renders transparent and draws only LOCAL surfaces
 * (the table card + its corner-bracket frame + the kicker pill).
 *
 * Source ground-truth: DY6pP0FP4Qa 9.5–18.0s (DARK, "● BENCHMARKS", columns
 *   Opus 4.8 [highlighted] / Opus 4.7 / GPT-5.5 / Gemini 3.1; rows Agentic
 *   coding / Terminal coding / Reasoning / Computer use; warm vertical tint-wipe
 *   on the hero column, rows reveal top→bottom; a per-row "winner" cell can be
 *   recolored to the negative-accent orange). Cross-checked vs DXhkSFiD8dL 68–80s
 *   (teal, GPT-5.5 bolded column) + DXwq6HYoogv 58–66s (frosted, periwinkle).
 *
 * Choreography (transitionVerb, frames @30fps):
 *   • Kicker pill fades + drops from y−16px over f1–6.
 *   • Card scales 0.96→1 + fades up over ~10f (starts ~f6).
 *   • The highlighted column's warm tint sweeps DOWN over ~12f (after card lands).
 *   • Header row of model columns fades up ~6f.
 *   • Body rows reveal top→bottom, ~3–4f/row stagger, each scaling 0.98→1 + fade;
 *     the highlighted-column value lands bold-white, others grey; an optional
 *     per-row "winner" cell tints to the accent 2f after its row lands.
 *   • Corner brackets ⌐ ⌐ draw in around the card last.
 *
 * Canvas 1080×1920 @30fps. Spec measures are % of 720w → px = specPx720 × 1.5.
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

/** "" sentinel = "caller did not override" (avoids zod reflection on defaults). */
const S = "";

/** A single benchmark row: label + mono sub-caption + one value per column. */
const rowSchema = z.object({
  /** Bold white row title, e.g. "Agentic coding". */
  label: z.string().default("Agentic coding"),
  /** Grey mono sub-caption under the label, e.g. "SWE-Bench Pro". "" hides it. */
  sub: z.string().default("SWE-Bench Pro"),
  /** One value string per column header, in column order. */
  values: z.array(z.string()).default(["69.2", "64.3", "58.6", "54.2"]),
  /**
   * Optional 0-based column index whose cell is recolored to the accent for this
   * row (the per-row "winner" that ISN'T the highlighted column). -1 = none.
   */
  winnerCol: z.number().default(-1),
});

/** A column header: model name + which built-in glyph to draw above it. */
const colSchema = z.object({
  /** Header label, e.g. "Opus 4.8". */
  name: z.string().default("Opus 4.8"),
  /** Glyph drawn above the name: anthropic burst, openai, gemini, or none. */
  icon: z.enum(["anthropic", "openai", "gemini", "none"]).default("anthropic"),
});

export const abhiComparisonTableSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono kicker pill text, UPPERCASE. */
  kicker: z.string().default("BENCHMARKS"),
  /**
   * Column headers (2–4). The FIRST one is the highlighted hero column that
   * gets the warm vertical tint-wipe + bold-white values.
   */
  columns: z.array(colSchema).default([
    { name: "Opus 4.8", icon: "anthropic" },
    { name: "Opus 4.7", icon: "anthropic" },
    { name: "GPT-5.5", icon: "openai" },
    { name: "Gemini 3.1", icon: "gemini" },
  ]),
  /** Body rows (2–5). */
  rows: z.array(rowSchema).default([
    {
      label: "Agentic coding",
      sub: "SWE-Bench Pro",
      values: ["69.2", "64.3", "58.6", "54.2"],
      winnerCol: -1,
    },
    {
      label: "Terminal coding",
      sub: "Terminal-Bench",
      values: ["74.6", "66.1", "78.2", "70.3"],
      winnerCol: 2,
    },
    {
      label: "Reasoning",
      sub: "Humanity's Last Exam",
      values: ["57.9", "54.7", "52.2", "51.4"],
      winnerCol: -1,
    },
    {
      label: "Computer use",
      sub: "OSWorld",
      values: ["83.4", "82.8", "78.7", "76.2"],
      winnerCol: -1,
    },
  ]),
  /**
   * Optional takeaway pill below the card (mono caps, accent dot + soft glow) —
   * the source's closing "Terminal coding — the one exception" line that pops in
   * after the brackets settle. "" hides it.
   */
  footnote: z.string().default(""),
});
export type AbhiComparisonTableProps = z.infer<typeof abhiComparisonTableSchema>;

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

export const AbhiComparisonTable: React.FC<
  Partial<AbhiComparisonTableProps>
> = (props) => {
  const p = abhiComparisonTableSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Spec frame is 720×1280: x-measures scale by width/720, y-measures by
  // height/1280. `px` = horizontal/size basis; `py` = vertical-position basis.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;
  const py = (specPy1280: number) => (specPy1280 * height) / 1280;

  const isDark = p.mode === "dark";
  const accent = p.accentColor;

  // ── Palette (DARK warm-slate glass / LIGHT frosted) ──
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  // Non-hero values in the source read clearly bright (near-white grey), not dim.
  const greyVal = isDark ? "#BBB9C2" : "#6E6976"; // non-hero cell values
  const labelGrey = isDark ? "#9A9AA0" : "#5A5A66"; // sub-captions / kicker
  const cardFill = isDark ? "#181620" : "rgba(255,255,255,0.86)";
  const cardEdge = isDark ? "rgba(255,255,255,0.09)" : "rgba(12,12,18,0.08)";
  const rowLine = isDark ? "rgba(255,255,255,0.055)" : "rgba(12,12,18,0.06)";
  const headerFill = isDark ? "rgba(255,255,255,0.018)" : "rgba(12,12,18,0.02)";
  const pillBg = isDark ? "rgba(28,24,32,0.72)" : "rgba(244,244,250,0.9)";
  const pillBorder = isDark
    ? `1px solid ${hexA(accent, 0.35)}`
    : "1px solid rgba(12,12,18,0.1)";
  const bracketCol = isDark ? "rgba(255,255,255,0.42)" : "rgba(12,12,18,0.32)";

  const cols = p.columns.length > 0 ? p.columns : [{ name: "—", icon: "none" as const }];
  const nCols = cols.length;

  // ============================================================
  // GEOMETRY (spec % of 720w → px @1080). Card x≈5.1% wide 89.7%,
  // y top ≈24.6% (315/1280) height ≈34% (437/1280) for 4 rows.
  // ============================================================
  const cardW = px(646); // ≈ 89.7% of 720
  const cardLeft = (width - cardW) / 2;
  const cardTop = py(315); // top edge ≈ 24.6% of 1280 → 472px @1920
  // The label column is wider; model columns share the remaining width evenly.
  const labelColW = px(176); // ≈ 24.5% of card
  const modelColsW = cardW - labelColW;
  const modelColW = modelColsW / nCols;

  const headerH = py(74); // header row height
  const rowH = py(74); // body row height
  const tableBodyH = p.rows.length * rowH;
  const cardH = headerH + tableBodyH + py(14); // + bottom pad
  const radius = px(18);

  // ── TIMING ──
  const KICK_START = 1;
  const CARD_START = 6;
  const TINT_START = CARD_START + 8; // hero-column tint sweeps down
  const TINT_DUR = 12;
  const HEAD_START = CARD_START + 6; // header model labels fade up
  const ROW_START = HEAD_START + 6; // first body row
  const ROW_STEP = 4; // ~3–4f/row stagger
  const BRACKET_START = ROW_START + p.rows.length * ROW_STEP; // brackets last

  // ── Kicker pill: fade + drop from y−16px over f1–6 ──
  const kickSpring = spring({
    frame: frame - KICK_START,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 120 },
    durationInFrames: 6,
  });
  const kickOpacity = kickSpring;
  const kickY = interpolate(kickSpring, [0, 1], [-px(16), 0]);
  const dotGlow = interpolate(frame, [KICK_START + 2, KICK_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Card: scale 0.96→1 + fade up over ~10f ──
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 110 },
    durationInFrames: 11,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardRise = interpolate(cardSpring, [0, 1], [px(26), 0]);

  // ── Hero column warm tint: vertical wipe DOWN over TINT_DUR ──
  const tintWipe = interpolate(
    frame,
    [TINT_START, TINT_START + TINT_DUR],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );

  // ── Corner brackets draw-in ──
  const bracketOpacity = interpolate(
    frame,
    [BRACKET_START, BRACKET_START + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Takeaway pill: fades + rises below the card after the brackets settle ──
  const hasFootnote = p.footnote.trim() !== S;
  const FOOT_START = BRACKET_START + 8;
  const footSpring = spring({
    frame: frame - FOOT_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const footOpacity = footSpring;
  const footY = interpolate(footSpring, [0, 1], [px(14), 0]);
  const footGlow = interpolate(frame, [FOOT_START + 2, FOOT_START + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // x-center of a model column (0-based among model columns).
  const modelColCenterX = (i: number) => labelColW + modelColW * (i + 0.5);
  const heroTintWidth = modelColW; // hero is model column 0

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill — centered, above the card ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cardTop - py(64),
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: px(10),
            padding: `${px(8)}px ${px(18)}px`,
            borderRadius: 999,
            background: pillBg,
            border: pillBorder,
            opacity: kickOpacity,
            transform: `translateY(${kickY}px)`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: px(8),
              height: px(8),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.5 + 0.4 * dotGlow)}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: px(15),
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: labelGrey,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>
      </div>

      {/* ── Table card ── */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          height: cardH,
          opacity: cardOpacity,
          transform: `translateY(${cardRise}px) scale(${cardScale})`,
          transformOrigin: "50% 28%",
          borderRadius: radius,
          background: cardFill,
          border: `1px solid ${cardEdge}`,
          boxShadow: isDark
            ? `0 ${px(26)}px ${px(70)}px ${hexA("#000000", 0.5)}, inset 0 1px 0 ${hexA(
                "#FFFFFF",
                0.06,
              )}`
            : `0 ${px(20)}px ${px(56)}px rgba(12,12,18,0.18)`,
          overflow: "hidden",
        }}
      >
        {/* Hero-column warm vertical tint (under the content) */}
        <div
          style={{
            position: "absolute",
            left: labelColW,
            top: 0,
            width: heroTintWidth,
            height: `${tintWipe * 100}%`,
            background: `linear-gradient(180deg, ${hexA(accent, isDark ? 0.16 : 0.12)} 0%, ${hexA(
              accent,
              isDark ? 0.05 : 0.05,
            )} 100%)`,
            borderLeft: `1px solid ${hexA(accent, 0.28)}`,
            borderRight: `1px solid ${hexA(accent, 0.18)}`,
          }}
        />

        {/* ── Header row ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: headerH,
            background: headerFill,
            borderBottom: `1px solid ${rowLine}`,
          }}
        >
          {cols.map((c, i) => {
            const start = HEAD_START + i * 2;
            const op = interpolate(frame, [start, start + 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const ty = interpolate(frame, [start, start + 6], [px(8), 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const isHero = i === 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: modelColCenterX(i),
                  top: "50%",
                  transform: `translate(-50%, calc(-50% + ${ty}px))`,
                  opacity: op,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: px(6),
                  width: modelColW,
                }}
              >
                <ModelIcon
                  kind={c.icon}
                  px={px}
                  accent={accent}
                  isHero={isHero}
                  ink={ink}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: isHero ? 700 : 600,
                    fontSize: px(16),
                    letterSpacing: "-0.01em",
                    color: isHero ? ink : labelGrey,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Body rows ── */}
        {p.rows.map((r, ri) => {
          const start = ROW_START + ri * ROW_STEP;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 190, mass: 0.6, stiffness: 130 },
            durationInFrames: 7,
          });
          const op = sp;
          const ty = interpolate(sp, [0, 1], [px(10), 0]);
          const rowTop = headerH + ri * rowH;
          return (
            <div
              key={ri}
              style={{
                position: "absolute",
                left: 0,
                top: rowTop,
                width: "100%",
                height: rowH,
                opacity: op,
                transform: `translateY(${ty}px)`,
                borderBottom:
                  ri < p.rows.length - 1 ? `1px solid ${rowLine}` : "none",
              }}
            >
              {/* Row label + sub-caption */}
              <div
                style={{
                  position: "absolute",
                  left: px(22),
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: labelColW - px(28),
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 700,
                    fontSize: px(18),
                    letterSpacing: "-0.01em",
                    color: ink,
                    lineHeight: 1.1,
                  }}
                >
                  {r.label}
                </div>
                {r.sub.trim() !== S && (
                  <div
                    style={{
                      marginTop: px(4),
                      fontFamily: FONT_STACKS.mono,
                      fontWeight: 400,
                      fontSize: px(11),
                      letterSpacing: "0.02em",
                      color: labelGrey,
                      lineHeight: 1.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.sub}
                  </div>
                )}
              </div>

              {/* Value cells per column */}
              {cols.map((_c, ci) => {
                const isHero = ci === 0;
                const isWinner = r.winnerCol === ci && !isHero;
                const valStart = start + 1 + ci; // cells settle just after the row
                const valOp = interpolate(
                  frame,
                  [valStart, valStart + 5],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                const winTint = interpolate(
                  frame,
                  [valStart + 2, valStart + 8],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                const valColor = isHero
                  ? ink
                  : isWinner
                  ? mix(greyVal, accent, winTint)
                  : greyVal;
                const valStr = r.values[ci] ?? "—";
                return (
                  <div
                    key={ci}
                    style={{
                      position: "absolute",
                      left: modelColCenterX(ci),
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: valOp,
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: isHero ? 800 : isWinner ? 700 : 600,
                      fontSize: px(isHero ? 30 : 26),
                      letterSpacing: "-0.02em",
                      color: valColor,
                      whiteSpace: "nowrap",
                      textShadow: isHero
                        ? `0 0 ${px(14)}px ${hexA(accent, 0.18)}`
                        : "none",
                    }}
                  >
                    {valStr}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Corner brackets ⌐ ⌐ framing the card (DARK) ── */}
      <CornerBrackets
        left={cardLeft}
        top={cardTop}
        width={cardW}
        height={cardH}
        px={px}
        color={bracketCol}
        opacity={bracketOpacity}
        cardRise={cardRise}
      />

      {/* ── Takeaway pill below the card (accent dot + soft glow) ── */}
      {hasFootnote && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: cardTop + cardH + py(40),
            display: "flex",
            justifyContent: "center",
            opacity: footOpacity,
            transform: `translateY(${footY}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: px(10),
              padding: `${px(11)}px ${px(22)}px`,
              borderRadius: px(999),
              background: pillBg,
              border: `1px solid ${hexA(accent, 0.45)}`,
              boxShadow: `0 0 ${px(28)}px ${hexA(accent, 0.22 * footGlow)}`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maxWidth: cardW,
            }}
          >
            <span
              style={{
                width: px(8),
                height: px(8),
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.7 * footGlow)}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: px(18),
                letterSpacing: "0.04em",
                color: ink,
                whiteSpace: "nowrap",
              }}
            >
              {p.footnote}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const ModelIcon: React.FC<{
  kind: "anthropic" | "openai" | "gemini" | "none";
  px: (n: number) => number;
  accent: string;
  isHero: boolean;
  ink: string;
}> = ({ kind, px, accent, isHero, ink }) => {
  const s = px(22);
  // Source: the hero Anthropic burst is accent-orange; the non-hero Anthropic
  // burst (Opus 4.7) is a muted CORAL, not pure white. Other logos stay light.
  const col = isHero ? accent : ink;
  if (kind === "none") {
    return <span style={{ height: s, display: "block" }} />;
  }
  if (kind === "anthropic") {
    // Anthropic spark — a DENSE radiating burst whose spokes start near the
    // centre (source reads as a filled spark, not a hollow snowflake).
    const burstCol = isHero ? accent : "#C9826B"; // muted coral for rivals
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          const x1 = 12 + Math.cos(a) * 1.4;
          const y1 = 12 + Math.sin(a) * 1.4;
          const x2 = 12 + Math.cos(a) * 9.6;
          const y2 = 12 + Math.sin(a) * 9.6;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={burstCol}
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }
  if (kind === "openai") {
    // OpenAI hexafoil — six identical petal lobes radiating from the centre,
    // each a stroked rounded-rect rotated 60°, so it reads as the real knot.
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={9.4}
            y={1.6}
            width={5.2}
            height={11.2}
            rx={2.6}
            stroke={col}
            strokeWidth={1.35}
            fill="none"
            transform={`rotate(${i * 60} 12 12)`}
          />
        ))}
      </svg>
    );
  }
  // gemini — 4-point sparkle star.
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 C12.6 7.4 16.6 11.4 22 12 C16.6 12.6 12.6 16.6 12 22 C11.4 16.6 7.4 12.6 2 12 C7.4 11.4 11.4 7.4 12 2 Z"
        fill={col}
      />
    </svg>
  );
};

const CornerBrackets: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  px: (n: number) => number;
  color: string;
  opacity: number;
  cardRise: number;
  // Declared for call-site parity but unused inside this component; optional so
  // the existing call (which omits them) type-checks without changing output.
  cardScale?: number;
  cardOpacity?: number;
  canvasW?: number;
  canvasH?: number;
}> = ({ left, top, width, height, px, color, opacity, cardRise }) => {
  const gap = px(14); // brackets sit just OUTSIDE the card edge
  const len = px(26); // arm length
  const sw = px(2); // stroke width
  const x0 = left - gap;
  const y0 = top - gap;
  const x1 = left + width + gap;
  const y1 = top + height + gap;
  const arm = (
    style: React.CSSProperties,
  ): React.CSSProperties => ({
    position: "absolute",
    background: color,
    ...style,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        opacity,
        transform: `translateY(${cardRise}px)`,
      }}
    >
      {/* top-left */}
      <div style={arm({ left: x0, top: y0, width: len, height: sw })} />
      <div style={arm({ left: x0, top: y0, width: sw, height: len })} />
      {/* top-right */}
      <div style={arm({ left: x1 - len, top: y0, width: len, height: sw })} />
      <div style={arm({ left: x1 - sw, top: y0, width: sw, height: len })} />
      {/* bottom-left */}
      <div style={arm({ left: x0, top: y1 - sw, width: len, height: sw })} />
      <div style={arm({ left: x0, top: y1 - len, width: sw, height: len })} />
      {/* bottom-right */}
      <div style={arm({ left: x1 - len, top: y1 - sw, width: len, height: sw })} />
      <div style={arm({ left: x1 - sw, top: y1 - len, width: sw, height: len })} />
    </div>
  );
};

/** Linear-interpolate two #RRGGBB hex colors → "rgb(r,g,b)". */
function mix(a: string, b: string, t: string | number): string {
  const tt = typeof t === "number" ? t : parseFloat(t);
  const pa = toRgb(a);
  const pb = toRgb(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * tt);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * tt);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * tt);
  return `rgb(${r},${g},${bl})`;
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [126, 123, 134];
  }
  return [r, g, b];
}
