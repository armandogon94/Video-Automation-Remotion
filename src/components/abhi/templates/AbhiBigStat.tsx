/**
 * AbhiBigStat — abhishek.devini "big-stat-number" FOREGROUND template.
 *
 * Renders a giant extra-bold grotesk numeral that COUNTS UP with a strong
 * ease-out + overshoot settle, an accent-colored unit suffix (% / × / + …),
 * a mono UPPERCASE kicker pill above, a two-tone kinetic subtitle below, and
 * an optional dot-matrix progress strip with one accent dot. Transparent over
 * the shared AbhiBackground (dark-grid-glow OR light-mesh) mounted by the host
 * AbhiScene9x16 — this component draws NO full background.
 *
 * Ground-truth source: DXUhthziNCS 0.0–4.4s ("99%" — orange #DE6D35 digits +
 * off-white % + "A SECRET MOST MISS" pill + "of Claude users have / no idea
 * this exists" two-tone subtitle + dot-matrix strip).
 *
 * Canvas 1080×1920 @30fps. Spec measures are % of 720w → px = specPx@720 × 1.5.
 * Animates from frame 0 of the scene's own timeline, then HOLDS.
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

/** Sentinel for "use the mode-aware default" without zod schema reflection. */
const AUTO = "";

export const abhiBigStatSchema = z.object({
  /** "dark" (near-black grid-glow) or "light" (pastel mesh). Drives ink colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Single topic accent (Anthropic orange by default). Recolors digits + dot + glow word. */
  accentColor: z.string().default("#FD9B00"),
  /** Distinct accent used for the count-up DIGITS themselves (often a touch warmer/deeper
   *  than the headline accent in the source). Empty = derive from accentColor. */
  digitColor: z.string().default("#DE6D35"),

  /** Kicker pill text (mono UPPERCASE). Empty string hides the pill. */
  kicker: z.string().default("UN SECRETO QUE CASI NADIE VE"),

  /** Final numeric value the counter lands on. */
  statValue: z.number().default(99),
  /** Where the count-up starts from (the source ramps in from a low number). */
  statStart: z.number().default(63),
  /** Decimal places to render while counting + at rest. */
  statDecimals: z.number().int().min(0).max(3).default(0),
  /** Thousands separator for large counts (e.g. 12,400). */
  statThousands: z.boolean().default(false),
  /** Unit suffix recolored to accent and popped in beside the number ("%", "×", "+", "x", "$pre"). */
  statUnit: z.string().default("%"),
  /** If true the unit is a PREFIX (e.g. "$") instead of a suffix. */
  statUnitPrefix: z.boolean().default(false),

  /** Two-line kinetic subtitle. Line 1 inks primary; line 2 inks accent. Empty hides. */
  subtitleLine1: z.string().default("de los usuarios de Claude"),
  subtitleLine2: z.string().default("no saben que esto existe"),

  /** Mono grey sub-label UNDER the number (alternative/legacy slot). Empty hides. */
  subLabel: z.string().default(""),

  /** Dot-matrix progress strip with one accent dot (the signature "loading" motif). */
  showDotMatrix: z.boolean().default(true),
  /** Columns × rows of the dot matrix. Source: 20 cols × 5 rows, square pitch. */
  dotCols: z.number().int().min(4).max(40).default(20),
  dotRows: z.number().int().min(1).max(8).default(5),

  /** Thin DARK-only corner brackets ⌐ ⌐ framing the number. Empty = auto.
   *  Source DXUhthziNCS shows NO brackets around the number, so auto = off. */
  cornerBrackets: z.union([z.boolean(), z.literal(AUTO)]).default(AUTO),
});
export type AbhiBigStatProps = z.infer<typeof abhiBigStatSchema>;

// ── color helpers (no external libs) ──
function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
function rgba(hex: string, a: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
}
/** Mix a hex toward black (amount<0) or white (amount>0) by a fraction. */
function shade(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const t = amount < 0 ? 0 : 255;
  const f = Math.abs(amount);
  return `rgb(${clampByte(r + (t - r) * f)},${clampByte(
    g + (t - g) * f,
  )},${clampByte(b + (t - b) * f)})`;
}

export const AbhiBigStat: React.FC<Partial<AbhiBigStatProps>> = (props) => {
  const p = abhiBigStatSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // 720→1080 scale: a spec px-at-720 → ×1.5. We size off the live canvas width
  // so the layout holds even if the host renders at a different width.
  const U = width / 720; // px-per-(spec-px-at-720). =1.5 at 1080.

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  // The unit glyph (% / × / +) in the source is a warm off-white, not bright white.
  const unitInk = isDark ? "#D0CCC8" : "#0C0C12";
  const inkDim = isDark ? rgba("#F2F2F4", 0.86) : rgba("#0C0C12", 0.78);
  const greyLabel = isDark ? "#9A9AA0" : "#5A5A66";
  const digitColor = p.digitColor && p.digitColor !== AUTO ? p.digitColor : p.accentColor;
  // Source shows a clean number with no framing brackets → auto resolves to OFF.
  const showBrackets =
    p.cornerBrackets === AUTO ? false : (p.cornerBrackets as boolean);

  // ── TIMING (frames @30fps), per STYLE-SPEC big-stat conventions ──
  // hold start ~6f → ease-out count over ~24f (fast→slow) with 0.9→1 + 1.06
  // overshoot settle → unit suffix pops 6f → kicker + subtitle + dot strip
  // bloom up ~8f after the number lands.
  const COUNT_START = 6;
  const COUNT_DUR = 24;
  const COUNT_END = COUNT_START + COUNT_DUR; // 30
  const SETTLE_END = COUNT_END + 6; // overshoot resolves by ~36
  const UNIT_IN = COUNT_END - 2; // unit lands just as digits settle
  const KICKER_IN = COUNT_END + 4;
  const SUB_IN = COUNT_END + 8;
  const DOT_IN = COUNT_END + 12;

  // Count-up value with strong ease-out.
  const countT = interpolate(frame, [COUNT_START, COUNT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const value = p.statStart + (p.statValue - p.statStart) * countT;

  // Scale 0.9→1 with a 1.06 overshoot settle, via spring driven from COUNT_START.
  const settle = spring({
    frame: frame - COUNT_START,
    fps,
    config: { damping: 11, mass: 0.9, stiffness: 170 },
    durationInFrames: SETTLE_END - COUNT_START,
  });
  const numScale = interpolate(settle, [0, 0.7, 1], [0.9, 1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numOpacity = interpolate(frame, [0, COUNT_START + 2], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Unit suffix pop (separate, 6f overshoot).
  const unitSpring = spring({
    frame: frame - UNIT_IN,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 200 },
    durationInFrames: 8,
  });
  const unitScale = interpolate(unitSpring, [0, 1], [0.6, 1]);
  const unitOpacity = unitSpring;

  // Kicker pill drop-in (fade + drop from y−16px @720 → −24px@1080).
  const kickerT = interpolate(frame, [KICKER_IN, KICKER_IN + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const kickerY = (1 - kickerT) * -16 * U;

  // Subtitle reveal (rise + fade as two lines).
  const subT = interpolate(frame, [SUB_IN, SUB_IN + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const subY = (1 - subT) * 14 * U;
  // Accent underline sweep under line 2 (L→R), starts as line 2 lands.
  const ulT = interpolate(frame, [SUB_IN + 6, SUB_IN + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Dot matrix bloom + the single accent dot index (settles to roughly value%).
  const dotT = interpolate(frame, [DOT_IN, DOT_IN + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dotMatrixY = (1 - dotT) * 12 * U;

  // ── derived geometry ──
  const numFontPx = 280 * U; // ≈420px@1080 — large hero numeral (~spec 28-31%)
  // Source % cap-height ≈ 0.82× the digit cap-height (measured) → larger than a
  // naive 60% suffix. Bump the unit font so the glyph reads near-full height.
  const unitFontPx = 224 * U;
  const valueStr = formatStat(value, p.statDecimals, p.statThousands);

  const unitGlyph = p.statUnit;
  const accentDigitGlow = isDark
    ? `0 0 ${44 * U}px ${rgba(digitColor, 0.55)}, 0 0 ${110 * U}px ${rgba(
        digitColor,
        0.28,
      )}`
    : "none";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ───── centered column ───── */}
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 60 * U,
        }}
      >
        {/* Kicker pill */}
        {p.kicker ? (
          <div
            style={{
              opacity: kickerT,
              transform: `translateY(${kickerY}px)`,
              marginBottom: 26 * U,
              display: "inline-flex",
              alignItems: "center",
              // Source pill is a clean outlined capsule — no leading dot.
              padding: `${9 * U}px ${22 * U}px`,
              borderRadius: 999,
              background: isDark
                ? "rgba(18,15,18,0.55)"
                : "rgba(255,255,255,0.7)",
              border: `1px solid ${
                isDark ? "rgba(150,148,152,0.30)" : "rgba(20,20,30,0.10)"
              }`,
              backdropFilter: "blur(6px)",
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                // Source tracks wide (~0.24em) and sits a touch smaller/cooler.
                fontSize: 16 * U,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: isDark ? "#C6C2C0" : "#5A5A66",
                whiteSpace: "nowrap",
              }}
            >
              {p.kicker}
            </span>
          </div>
        ) : null}

        {/* Giant numeral + unit (+ optional corner brackets) */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "baseline",
            opacity: numOpacity,
            transform: `scale(${numScale})`,
            padding: `0 ${28 * U}px`,
          }}
        >
          {showBrackets ? (
            <>
              <CornerBracket U={U} color={rgba(ink, 0.5)} corner="tl" />
              <CornerBracket U={U} color={rgba(ink, 0.5)} corner="br" />
            </>
          ) : null}

          {p.statUnitPrefix && unitGlyph ? (
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: unitFontPx,
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                color: p.accentColor,
                opacity: unitOpacity,
                transform: `scale(${unitScale})`,
                transformOrigin: "right bottom",
                marginRight: 6 * U,
              }}
            >
              {unitGlyph}
            </span>
          ) : null}

          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: numFontPx,
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              color: digitColor,
              textShadow: accentDigitGlow,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {valueStr}
          </span>

          {!p.statUnitPrefix && unitGlyph ? (
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: unitFontPx,
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                color: unitInk,
                opacity: unitOpacity,
                // Source aligns the % glyph to the TOP of the digits (its cap
                // floats up near the digit top, not on the baseline), so lift it.
                transform: `translateY(${-40 * U}px) scale(${unitScale})`,
                transformOrigin: "left top",
                marginLeft: 4 * U,
              }}
            >
              {unitGlyph}
            </span>
          ) : null}
        </div>

        {/* Two-tone kinetic subtitle */}
        {(p.subtitleLine1 || p.subtitleLine2) && !p.subLabel ? (
          <div
            style={{
              opacity: subT,
              transform: `translateY(${subY}px)`,
              marginTop: 30 * U,
              textAlign: "center",
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 36 * U,
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
            }}
          >
            {p.subtitleLine1 ? (
              <div style={{ color: inkDim }}>{p.subtitleLine1}</div>
            ) : null}
            {p.subtitleLine2 ? (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  color: p.accentColor,
                }}
              >
                {p.subtitleLine2}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -8 * U,
                    height: 3 * U,
                    width: `${ulT * 100}%`,
                    background: rgba(p.accentColor, 0.85),
                    borderRadius: 2 * U,
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Legacy mono grey sub-label (mutually exclusive with subtitle) */}
        {p.subLabel ? (
          <div
            style={{
              opacity: subT,
              transform: `translateY(${subY}px)`,
              marginTop: 26 * U,
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 30 * U,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: greyLabel,
              textAlign: "center",
            }}
          >
            {p.subLabel}
          </div>
        ) : null}

        {/* Dot-matrix progress strip with one accent dot */}
        {p.showDotMatrix ? (
          <div
            style={{
              opacity: dotT,
              transform: `translateY(${dotMatrixY}px)`,
              marginTop: 40 * U,
              display: "grid",
              // Source strip is compact + dense — small dots, tight pitch — so the
              // 22-col matrix reads as a narrow centered band, not a full-width bar.
              gridTemplateColumns: `repeat(${p.dotCols}, ${7 * U}px)`,
              gridAutoRows: `${7 * U}px`,
              gap: `${6 * U}px ${6 * U}px`,
              justifyContent: "center",
            }}
          >
            {Array.from({ length: p.dotCols * p.dotRows }).map((_, i) => {
              // The accent dot sits at the "fill point" — middle row, column
              // proportional to value/maxScale (clamped inside the grid).
              const col = i % p.dotCols;
              const row = Math.floor(i / p.dotCols);
              // Source places the single lit dot near the START of the strip
              // (middle row, ~2nd column), not at a value-proportional far point.
              const fillFrac = interpolate(
                value,
                [p.statStart, p.statValue],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const fillCol = Math.round(fillFrac * Math.min(p.dotCols - 1, 1));
              const isAccent =
                row === Math.floor(p.dotRows / 2) && col === fillCol;
              return (
                <span
                  key={i}
                  style={{
                    width: 7 * U,
                    height: 7 * U,
                    borderRadius: "50%",
                    background: isAccent
                      ? p.accentColor
                      : isDark
                        ? rgba("#FFFFFF", 0.12)
                        : rgba("#0C0C12", 0.14),
                    boxShadow: isAccent
                      ? `0 0 ${12 * U}px ${rgba(p.accentColor, 0.7)}`
                      : "none",
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Thin L-shaped corner bracket (⌐) — dark-mode framing accent around the number. */
const CornerBracket: React.FC<{
  U: number;
  color: string;
  corner: "tl" | "br";
}> = ({ U, color, corner }) => {
  const len = 34 * U;
  const thick = 2 * U;
  const off = -18 * U;
  const isTL = corner === "tl";
  const anchor: React.CSSProperties = isTL
    ? { left: off, top: off }
    : { right: off, bottom: off };
  return (
    <>
      <span
        style={{
          position: "absolute",
          ...anchor,
          width: len,
          height: thick,
          background: color,
        }}
      />
      <span
        style={{
          position: "absolute",
          ...anchor,
          width: thick,
          height: len,
          background: color,
        }}
      />
    </>
  );
};

/** Format a numeric stat with fixed decimals + optional thousands separators. */
function formatStat(v: number, decimals: number, thousands: boolean): string {
  const fixed = v.toFixed(decimals);
  if (!thousands) return fixed;
  const [intPart, fracPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${grouped}.${fracPart}` : grouped;
}
