/**
 * StatCardSequenceWithUnderlines9x16 — CodingFab signature stat-card sequence (1080×1920).
 *
 * Derived from @CodingFab (references/creators/codingfab/lz0ddzEUTJQ/frames/).
 * The recognizable trait studied across the source frames:
 *   - small muted tracked-uppercase EYEBROW ("JUST", "AS LOW AS")
 *   - a big SERIF hero number/figure (Playfair Display), counter- or scramble-revealed
 *   - a thin animated COLORED UNDERLINE that wipes left-to-right directly beneath
 *     the hero number (NOT a border-bottom — a free-standing accent rule that animates)
 *   - a serif supporting line under the underline ("Tokens Google processed last month")
 *   - dark surface with a soft radial vignette behind the figure.
 *
 * This template plays a VERTICAL SEQUENCE of 3–5 such stat cards. Each card owns a
 * time window: it fades/rises in, the hero number reveals (counter ramp 0→target OR a
 * brief digit scramble), the underline wipes, then the supporting line fades in. After a
 * dwell beat the card cross-fades out and the next card takes over.
 *
 * Optional COMPARISON card: when a stat sets `compareTo`, the card renders two stacked
 * figures (this stat over the compareTo stat) joined by a gold arrow "↓ / ↑", matching
 * CodingFab's occasional A-vs-B beat.
 *
 * Motion grammar (per-card, in card-local frames):
 *   - 0.00s  eyebrow fades in (+rise 8px)
 *   - 0.12s  hero number reveals over `numberRevealSeconds` (~0.5s): counter ramp with
 *            cubic ease-out, or a digit scramble that settles to the target string.
 *   - on number-settle: underline wipes left→right over `underlineWipeSeconds` (~0.4s)
 *   - +0.15s supporting line fades in (+rise 6px)
 *   - dwell, then card cross-fades out as the next enters.
 *
 * Brand: brand gold #D4AF37 / navy is the spine (eyebrow, supporting accents, arrow,
 * progress dots). Each stat's underline color defaults to CodingFab cyan #00D9A3 but is
 * per-stat overridable via `underlineColor`. Palette prop supports "cream" (default light)
 * and "dark"; the source is dark, so "dark" is the most faithful rendering.
 *
 * GOTCHA observed: we never use background-clip:text + transparent text — Remotion's
 * headless Chromium paints that as an opaque block. All hero/figure text uses SOLID color.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, resolveColors, getPalette, FONT_STACKS, type PaletteMode } from "../brand";

// ─── Palette + constants ────────────────────────────────────────────
// CodingFab's most-recognizable underline accent. Used as the default per-stat
// underline color; the brand gold/navy remain the spine for all other chrome.
const CODINGFAB_CYAN = "#00D9A3";
const BRAND_GOLD = BRAND.colors.accent;

const FRAME_W = 1080;
const FRAME_H = 1920;

// Horizontal text inset — CodingFab anchors the figure to the left third.
const CONTENT_LEFT = 96;
const CONTENT_WIDTH = FRAME_W - CONTENT_LEFT - 96;

// ─── Schema (every field has a .default — defaultProps = schema.parse({})) ──
const statSchema = z.object({
  /** Numeric value the card centers on. */
  value: z.number().default(0),
  /** Text prefix shown before the figure (e.g. "$"). Empty-string = none. */
  prefix: z.string().default(""),
  /** Text suffix shown after the figure (e.g. "%", "×", "Quadrillion"). Empty-string = none. */
  suffix: z.string().default(""),
  /** Decimal places when rendering the figure. */
  decimals: z.number().int().min(0).max(4).default(0),
  /** Small tracked-uppercase eyebrow above the figure ("JUST", "AS LOW AS"). Empty = none. */
  eyebrow: z.string().default(""),
  /** Supporting line under the underline. Empty-string = none. */
  supporting: z.string().default(""),
  /** Underline color for THIS stat. Empty-string = use the CodingFab cyan default. */
  underlineColor: z.string().default(""),
  /**
   * Reveal style for the hero figure:
   *  - "counter": ramp 0 → value with cubic ease-out (the data-viz default).
   *  - "scramble": cycle random digits, settling left→right to the target string.
   */
  reveal: z.enum(["counter", "scramble"]).default("counter"),
  /**
   * Optional comparison: when set, the card renders this stat as the HERO over a
   * second smaller "compareTo" figure joined by a gold arrow. Empty-string label
   * (the default object) means "no comparison".
   */
  compareTo: z
    .object({
      value: z.number().default(0),
      prefix: z.string().default(""),
      suffix: z.string().default(""),
      decimals: z.number().int().min(0).max(4).default(0),
      label: z.string().default(""),
      /** "up" → gold ▲, "down" → gold ▼ between the two figures. */
      direction: z.enum(["up", "down"]).default("down"),
    })
    .default({
      value: 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      label: "",
      direction: "down",
    }),
});
export type StatCardItem = z.infer<typeof statSchema>;

export const statCardSequenceWithUnderlines9x16Schema = z.object({
  /** Hook/title card shown BEFORE the stat sequence (CodingFab opens on a muted hook). */
  title: z.string().default("Your AI Metrics\nAre Lying."),
  /** The stat cards, played in order. 3–5 recommended. */
  stats: z
    .array(statSchema)
    .default([
      {
        value: 3.2,
        prefix: "",
        suffix: " Quadrillion",
        decimals: 1,
        eyebrow: "JUST",
        supporting: "Tokens Google processed last month",
        underlineColor: CODINGFAB_CYAN,
        reveal: "counter",
        compareTo: { value: 0, prefix: "", suffix: "", decimals: 0, label: "", direction: "down" },
      },
      {
        value: 12,
        prefix: "",
        suffix: "%",
        decimals: 0,
        eyebrow: "AS LOW AS",
        supporting: "AI suggestion acceptance at tokenmaxxing teams",
        underlineColor: CODINGFAB_CYAN,
        reveal: "counter",
        compareTo: { value: 0, prefix: "", suffix: "", decimals: 0, label: "", direction: "down" },
      },
      {
        value: 12,
        prefix: "",
        suffix: "%",
        decimals: 0,
        eyebrow: "FROM",
        supporting: "Acceptance after switching to outcome-maxxing",
        underlineColor: BRAND_GOLD,
        reveal: "counter",
        compareTo: { value: 71, prefix: "", suffix: "%", decimals: 0, label: "Outcome-maxxing teams", direction: "up" },
      },
    ]),
  /** Seconds each stat card holds the screen (including its own reveal). */
  secondsPerStat: z.number().min(1).max(8).default(2.4),
  /** Seconds the opening title card holds before the first stat. */
  titleSeconds: z.number().min(0).max(4).default(1.0),
  /** Hero number reveal duration (counter ramp / scramble settle). CodingFab ≈ 0.5s. */
  numberRevealSeconds: z.number().min(0.2).max(2).default(0.5),
  /** Underline wipe duration after the number settles. */
  underlineWipeSeconds: z.number().min(0.1).max(1.5).default(0.4),
  /** Surface palette. "dark" is the most faithful to the source; "cream" = brand light. */
  palette: z.enum(["cream", "dark"]).default("dark"),
  /** Spine accent (eyebrow, arrow, dots). Empty-string = brand gold / palette accent. */
  accentColor: z.string().default(""),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  mutedColor: z.string().default(""),
});
export type StatCardSequenceWithUnderlines9x16Props = z.infer<
  typeof statCardSequenceWithUnderlines9x16Schema
>;

/**
 * Content-driven total duration = title card + one card per stat. Mirrors the
 * component's own `titleFrames + stats.length × statFrames` math so
 * `calculateMetadata` never truncates a 5-stat sequence in Studio/direct render.
 */
export function computeStatCardSequenceFrames(
  props: Pick<
    StatCardSequenceWithUnderlines9x16Props,
    "stats" | "secondsPerStat" | "titleSeconds"
  >,
  fps: number,
): number {
  const titleFrames = Math.round(props.titleSeconds * fps);
  const statFrames = Math.max(1, Math.round(props.secondsPerStat * fps));
  return titleFrames + Math.max(1, props.stats.length) * statFrames;
}

// ─── Number formatting ──────────────────────────────────────────────
function formatFigure(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

const SCRAMBLE_GLYPHS = "0123456789";

/**
 * Produce a scramble of `target` at progress `t` (0→1): characters settle
 * left→right, so leading digits lock first. Non-digit chars (commas, dots)
 * pass through unchanged. `seed` keeps the random churn stable per frame.
 */
function scrambleString(target: string, t: number, seed: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const settled = Math.floor(clamped * target.length);
  let out = "";
  for (let i = 0; i < target.length; i += 1) {
    const ch = target[i];
    if (i < settled || ch === "," || ch === ".") {
      out += ch;
    } else if (/\d/.test(ch)) {
      const idx = Math.abs((seed * 7 + i * 31) % SCRAMBLE_GLYPHS.length);
      out += SCRAMBLE_GLYPHS[idx];
    } else {
      out += ch;
    }
  }
  return out;
}

// Auto-size the hero figure so long strings stay inside CONTENT_WIDTH.
function heroFontSize(text: string): number {
  const base = 220;
  // Serif glyph advance ≈ 0.55em; clamp so even long figures fit the inset width.
  const widthFit = Math.floor(CONTENT_WIDTH / Math.max(1, text.length * 0.55));
  return Math.max(96, Math.min(base, widthFit));
}

// ─── Hero figure (counter ramp OR scramble) ─────────────────────────
const HeroFigure: React.FC<{
  stat: StatCardItem;
  localFrame: number;
  revealFrames: number;
  color: string;
  fontSize: number;
  withGlow: boolean;
}> = ({ stat, localFrame, revealFrames, color, fontSize, withGlow }) => {
  const targetStr = formatFigure(stat.value, stat.decimals);

  let figureText: string;
  if (stat.reveal === "scramble") {
    const t = interpolate(localFrame, [0, revealFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    figureText = scrambleString(targetStr, t, localFrame);
  } else {
    const t = interpolate(localFrame, [0, revealFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = Easing.out(Easing.cubic)(t);
    figureText = formatFigure(stat.value * eased, stat.decimals);
  }

  const prefixSize = Math.round(fontSize * 0.62);
  const suffixSize = Math.round(fontSize * 0.62);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        fontFamily: FONT_STACKS.serif,
        fontWeight: 700,
        lineHeight: 0.96,
        color, // SOLID color — never background-clip:text (Remotion paints that opaque)
        letterSpacing: "-0.01em",
        textShadow: withGlow ? `0 0 36px ${color}66, 0 0 12px ${color}44` : "none",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {stat.prefix && <span style={{ fontSize: prefixSize, marginRight: 6 }}>{stat.prefix}</span>}
      <span style={{ fontSize }}>{figureText}</span>
      {stat.suffix && <span style={{ fontSize: suffixSize, marginLeft: 8 }}>{stat.suffix}</span>}
    </div>
  );
};

// ─── A single stat card ─────────────────────────────────────────────
const StatCard: React.FC<{
  stat: StatCardItem;
  localFrame: number;
  cardOpacity: number;
  numberRevealFrames: number;
  underlineWipeFrames: number;
  inkColor: string;
  mutedColor: string;
  accentColor: string;
}> = ({
  stat,
  localFrame,
  cardOpacity,
  numberRevealFrames,
  underlineWipeFrames,
  inkColor,
  mutedColor,
  accentColor,
}) => {
  const { fps } = useVideoConfig();

  const eyebrowDelay = 0;
  const numberDelay = Math.round(0.12 * fps);
  const numberLocal = Math.max(0, localFrame - numberDelay);
  // Underline begins wiping once the figure has settled.
  const underlineStart = numberDelay + numberRevealFrames;
  const underlineLocal = Math.max(0, localFrame - underlineStart);
  const supportingStart = underlineStart + Math.round(0.15 * fps);

  const eyebrowOpacity = interpolate(localFrame, [eyebrowDelay, eyebrowDelay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyebrowRise = interpolate(localFrame, [eyebrowDelay, eyebrowDelay + 10], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const underlineWidthPct = interpolate(underlineLocal, [0, underlineWipeFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const supportingOpacity = interpolate(
    localFrame,
    [supportingStart, supportingStart + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const supportingRise = interpolate(
    localFrame,
    [supportingStart, supportingStart + 12],
    [6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const underlineColor =
    stat.underlineColor && stat.underlineColor.length > 0
      ? stat.underlineColor
      : CODINGFAB_CYAN;

  const heroStr = formatFigure(stat.value, stat.decimals);
  const heroSize = heroFontSize(
    `${stat.prefix}${heroStr}${stat.suffix}`,
  );
  const underlineLen = Math.round(heroSize * 0.7);

  const hasComparison = stat.compareTo.label.trim().length > 0;
  const arrowGlyph = stat.compareTo.direction === "up" ? "▲" : "▼";

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT,
        top: 0,
        width: CONTENT_WIDTH,
        height: FRAME_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity: cardOpacity,
      }}
    >
      {/* Eyebrow */}
      {stat.eyebrow && (
        <div
          style={{
            fontFamily: FONT_STACKS.serif,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: mutedColor,
            opacity: eyebrowOpacity,
            transform: `translateY(${eyebrowRise}px)`,
            marginBottom: 24,
          }}
        >
          {stat.eyebrow}
        </div>
      )}

      {/* Hero figure */}
      <HeroFigure
        stat={stat}
        localFrame={numberLocal}
        revealFrames={numberRevealFrames}
        color={underlineColor}
        fontSize={heroSize}
        withGlow
      />

      {/* The signature animated underline — wipes left → right, NOT a border. */}
      <div
        style={{
          marginTop: 22,
          width: underlineLen,
          height: 6,
          borderRadius: 3,
          background: underlineColor,
          transform: `scaleX(${underlineWidthPct / 100})`,
          transformOrigin: "left center",
          boxShadow: `0 0 14px ${underlineColor}55`,
        }}
      />

      {/* Supporting line */}
      {stat.supporting && (
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT_STACKS.serif,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.2,
            color: inkColor,
            opacity: supportingOpacity,
            transform: `translateY(${supportingRise}px)`,
            maxWidth: CONTENT_WIDTH,
          }}
        >
          {stat.supporting}
        </div>
      )}

      {/* Optional comparison: gold arrow + second (smaller) figure */}
      {hasComparison && (
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            opacity: supportingOpacity,
            transform: `translateY(${supportingRise}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.serif,
              fontWeight: 700,
              fontSize: 30,
              color: accentColor,
              letterSpacing: "0.04em",
            }}
          >
            {arrowGlyph}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span
              style={{
                fontFamily: FONT_STACKS.serif,
                fontWeight: 700,
                fontSize: Math.round(heroSize * 0.5),
                color: accentColor,
                lineHeight: 0.96,
                textShadow: `0 0 22px ${accentColor}55`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.compareTo.prefix}
              {formatFigure(stat.compareTo.value, stat.compareTo.decimals)}
              {stat.compareTo.suffix}
            </span>
            <span
              style={{
                fontFamily: FONT_STACKS.serif,
                fontWeight: 400,
                fontSize: 32,
                color: mutedColor,
              }}
            >
              {stat.compareTo.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Opening title (hook) card ──────────────────────────────────────
const TitleCard: React.FC<{
  title: string;
  opacity: number;
  mutedColor: string;
  inkColor: string;
}> = ({ title, opacity, mutedColor, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 130, mass: 0.7 } });
  const rise = interpolate(enter, [0, 1], [14, 0]);
  // CodingFab opens with a low-contrast muted hook that the stats then "answer".
  const lines = title.split("\n");
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_LEFT,
        top: 0,
        width: CONTENT_WIDTH,
        height: FRAME_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: mutedColor,
        }}
      >
        {lines.map((line, i) => (
          <div key={`hook-line-${i}`} style={{ color: i === lines.length - 1 ? inkColor : mutedColor }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Progress dots (which stat is active) ───────────────────────────
const ProgressDots: React.FC<{
  count: number;
  activeIndex: number;
  accentColor: string;
  mutedColor: string;
}> = ({ count, activeIndex, accentColor, mutedColor }) => (
  <div
    style={{
      position: "absolute",
      bottom: 120,
      left: CONTENT_LEFT,
      display: "flex",
      gap: 14,
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={`dot-${i}`}
        style={{
          width: i === activeIndex ? 40 : 14,
          height: 14,
          borderRadius: 7,
          background: i === activeIndex ? accentColor : `${mutedColor}66`,
          transition: "none",
        }}
      />
    ))}
  </div>
);

// ─── Composition ────────────────────────────────────────────────────
export const StatCardSequenceWithUnderlines9x16: React.FC<
  StatCardSequenceWithUnderlines9x16Props
> = ({
  title,
  stats,
  secondsPerStat,
  titleSeconds,
  numberRevealSeconds,
  underlineWipeSeconds,
  palette,
  accentColor,
  paperColor,
  inkColor,
  mutedColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  // Brand gold is the spine accent unless a palette/override supplies one.
  const resolvedAccent =
    accentColor && accentColor.length > 0 ? accentColor : BRAND_GOLD;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette as PaletteMode).grainOverlay;
  const isDark = palette === "dark";

  const titleFrames = Math.round(titleSeconds * fps);
  const statFrames = Math.max(1, Math.round(secondsPerStat * fps));
  const numberRevealFrames = Math.max(1, Math.round(numberRevealSeconds * fps));
  const underlineWipeFrames = Math.max(1, Math.round(underlineWipeSeconds * fps));
  const crossFadeFrames = Math.round(0.3 * fps);

  // Title card opacity: visible until titleFrames, then fades out over crossFade.
  const titleOpacity = interpolate(
    frame,
    [0, 6, Math.max(7, titleFrames - crossFadeFrames), titleFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Which stat is active and its card-local frame.
  const elapsedInStats = frame - titleFrames;
  const activeIndex = Math.max(
    0,
    Math.min(stats.length - 1, Math.floor(elapsedInStats / statFrames)),
  );

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {/* Soft radial vignette behind the figure (CodingFab's center glow). */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 42% at 38% 50%, ${
            isDark ? "rgba(27,58,110,0.30)" : "rgba(27,58,110,0.06)"
          } 0%, rgba(0,0,0,0) 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Palette grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Opening hook / title card */}
      {titleOpacity > 0 && (
        <TitleCard
          title={title}
          opacity={titleOpacity}
          mutedColor={resolvedMuted}
          inkColor={resolvedInk}
        />
      )}

      {/* Stat cards — render only the active one (+neighbor during cross-fade). */}
      {stats.map((stat, i) => {
        const cardStart = titleFrames + i * statFrames;
        const cardEnd = cardStart + statFrames;
        const localFrame = frame - cardStart;
        // Render window includes a short lead/lag for cross-fade overlap.
        if (frame < cardStart - crossFadeFrames || frame > cardEnd + crossFadeFrames) {
          return null;
        }
        const cardOpacity = interpolate(
          frame,
          [
            cardStart,
            cardStart + crossFadeFrames,
            cardEnd - crossFadeFrames,
            cardEnd,
          ],
          [0, 1, 1, i === stats.length - 1 ? 1 : 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <StatCard
            key={`stat-${i}`}
            stat={stat}
            localFrame={localFrame}
            cardOpacity={cardOpacity}
            numberRevealFrames={numberRevealFrames}
            underlineWipeFrames={underlineWipeFrames}
            inkColor={resolvedInk}
            mutedColor={resolvedMuted}
            accentColor={resolvedAccent}
          />
        );
      })}

      {/* Progress dots — only once the stat sequence is underway. */}
      {elapsedInStats >= 0 && (
        <ProgressDots
          count={stats.length}
          activeIndex={activeIndex}
          accentColor={resolvedAccent}
          mutedColor={resolvedMuted}
        />
      )}
    </AbsoluteFill>
  );
};
