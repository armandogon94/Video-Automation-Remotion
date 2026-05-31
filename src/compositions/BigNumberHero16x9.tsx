/**
 * BigNumberHero16x9 — horizontal (1920×1080) stat-hero composition.
 *
 * 16:9 sibling of `BigNumberHero9x16` (per ADR-001 §2.1 — `16x9` suffix, flat in
 * src/compositions/, own inline schema per §2.4). Same semantic content fields
 * (number / kicker / subtitle / caption / countUp) and the same single-spring
 * "the number lands" motion intent, RE-LAID-OUT for the wider canvas.
 *
 * The 9:16 version stacks the numeral vertically and lets it dominate ~50% of a
 * 1080-wide column. A 16:9 port is NOT that layout stretched: on a 1920-wide
 * landscape canvas the numeral is centered but visually punchier (smaller px,
 * per ADR §5.1 — 9:16 hero 240–280px band → 16:9 140–180px band), with the
 * kicker above and the supporting subtitle / caption sitting BELOW at landscape
 * scale. The whole stack is centered in the frame; the wider canvas gives the
 * subtitle room to run on one line instead of wrapping.
 *
 * Visual structure (centered stack):
 *   - Optional BrandBreadcrumb16x9 top-left (house grammar).
 *   - Kicker (small uppercase mono eyebrow in accent) above the numeral.
 *   - THE NUMBER — Inter 900, ~160px (auto-fit), in headline color. Optional
 *     leading prefix ($, €) and trailing suffix (×, %, B, M, ↑, ↓) in accent.
 *   - Subtitle (one-line context, Inter 600 ~36px, landscape-calibrated).
 *   - Optional caption (small secondary line, muted).
 *   - Optional BrandWatermark16x9 bottom-right.
 *   - Word-by-word EditorialCaption in the bottom strip (optional, OFF by
 *     default — the on-card numeral + subtitle IS the text layer, per ADR §2.5).
 *
 * Motion grammar (preserved from the 9:16 source):
 *   - Number lands with a single hard editorial spring (scale 0.78 → 1.0,
 *     opacity 0 → 1). Lands by frame ~18.
 *   - Suffix follows ~0.15s after the figure with its own snappier spring.
 *   - Optional `countUp` ramps a pure-numeric figure from 0 → target across the
 *     entry window, preserving leading sign and thousands separators.
 *   - Kicker is already on-screen when the number lands (frame 0 fade-in).
 *   - Subtitle / caption fade in 0.3s after the number lands.
 */
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  ALL_PALETTE_MODES,
} from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Local schemas (self-contained — does NOT import the 9:16 schema; ADR §2.4)
// ─────────────────────────────────────────────────────────────────────────────

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
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

export const bigNumberHero16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** The big figure. Can include a suffix like "×" / "%" / "B". e.g. "15×", "+47%", "$2.5B". */
  number: z.string().default("15×"),
  /** Small uppercase eyebrow above the number. Optional. */
  kicker: z.string().optional(),
  /** One-line context under the number. */
  subtitle: z.string().default("más barato que GPT-5"),
  /** Optional small caption under the subtitle. */
  caption: z.string().optional(),
  /** Animate the figure 0 → target during entry. Pure-numeric figures only. */
  countUp: z.boolean().default(false),

  /** Typography — 16:9-calibrated defaults (ADR §5.1). */
  typography: z
    .object({
      /** Hero numeral base size. 16:9 band 140–180px (vs 9:16 240–280+). */
      numberFontSize: z.number().default(160),
      /** Subtitle body — 16:9 band 30–36px (vs 9:16 36–42+). */
      subtitleFontSize: z.number().default(36),
      /** Caption secondary line. */
      captionTextFontSize: z.number().default(26),
      /** Kicker eyebrow. */
      kickerFontSize: z.number().default(28),
    })
    .default({
      numberFontSize: 160,
      subtitleFontSize: 36,
      captionTextFontSize: 26,
      kickerFontSize: 28,
    }),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  /** Optional watermark — if null, no watermark is rendered. */
  watermark: watermarkSchema_local.nullable().default(null),
  /** Optional handle text shown next to the watermark logo. */
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(36),
  /** Default OFF — the numeral + subtitle IS the text layer (ADR §2.5). */
  showCaptions: z.boolean().default(false),
});
export type BigNumberHero16x9Props = z.infer<typeof bigNumberHero16x9Schema>;

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Split a number string like "15×", "+47%", "$2.5B", "150" into a leading
 * prefix (currency-like), a figure (digits / sign / separators) and a trailing
 * suffix character (×, %, B, M, ↑, ↓).
 */
function splitFigure(raw: string): {
  prefix: string;
  figure: string;
  suffix: string;
} {
  if (!raw) return { prefix: "", figure: "", suffix: "" };

  let prefix = "";
  let rest = raw;
  if (/^[^\d+\-.,]/.test(rest)) {
    prefix = rest[0];
    rest = rest.slice(1);
  }

  const match = rest.match(/^([+\-]?[\d.,]+)(.*)$/);
  if (!match) {
    return { prefix, figure: rest, suffix: "" };
  }
  return { prefix, figure: match[1], suffix: match[2] };
}

/**
 * Parse a figure string into a number for count-up animation. Preserves the
 * separator style (comma-thousands vs dot-decimal). Returns null if unparseable.
 */
function parseFigure(
  figure: string,
): { value: number; usesCommaThousands: boolean; decimals: number } | null {
  if (!figure) return null;
  const usesCommaThousands = figure.includes(",");
  const stripped = figure.replace(/,/g, "");
  const value = Number(stripped);
  if (!Number.isFinite(value)) return null;
  const dotIdx = stripped.indexOf(".");
  const decimals = dotIdx === -1 ? 0 : stripped.length - dotIdx - 1;
  return { value, usesCommaThousands, decimals };
}

function formatFigure(
  value: number,
  usesCommaThousands: boolean,
  decimals: number,
): string {
  const fixed = value.toFixed(decimals);
  if (!usesCommaThousands) return fixed;
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

// Layout constant — the figure auto-shrinks past this many chars so a long
// "$1,234.5" line stays balanced on the landscape canvas.
const FIGURE_BALANCE_THRESHOLD = 4;

// ─── Composition ────────────────────────────────────────────────────
export const BigNumberHero16x9: React.FC<BigNumberHero16x9Props> = ({
  audioUrl,
  wordTimings,
  number,
  kicker,
  subtitle,
  caption,
  countUp,
  typography,
  breadcrumb,
  watermark,
  watermarkHandle,
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
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  // Split the number into prefix / figure / suffix once.
  const parts = useMemo(() => splitFigure(number), [number]);
  const parsed = useMemo(() => parseFigure(parts.figure), [parts.figure]);

  // Auto-shrink rule: anything over the threshold scales down so the block
  // stays balanced. Floor at ~55% of base so very long figures stay legible.
  const figureLen = parts.figure.length + (parts.prefix ? 1 : 0);
  const baseSize = typography.numberFontSize;
  const numberFontSize =
    figureLen <= FIGURE_BALANCE_THRESHOLD
      ? baseSize
      : Math.max(
          Math.round(baseSize * 0.55),
          Math.round(baseSize * (FIGURE_BALANCE_THRESHOLD / figureLen)),
        );
  const suffixFontSize = Math.round(numberFontSize * 0.7);
  const prefixFontSize = Math.round(numberFontSize * 0.55);

  // Editorial spring (damping 22 / stiffness 130 / mass 0.7) — shared motion DNA
  // with the cream/dark family. Suffix uses a snappier (20/150/0.6) beat.
  const numberEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const numberScale = interpolate(numberEnter, [0, 1], [0.78, 1.0]);
  const numberOpacity = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Count-up: animate digits 0 → target across the entry window.
  const countUpDuration = Math.round(0.6 * fps);
  const countUpProgress = interpolate(frame, [0, countUpDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayedFigure =
    countUp && parsed !== null
      ? formatFigure(
          parsed.value * countUpProgress,
          parsed.usesCommaThousands,
          parsed.decimals,
        )
      : parts.figure;

  // Suffix entry — 0.15s after the figure.
  const suffixDelayFrames = Math.round(0.15 * fps);
  const suffixLocal = Math.max(0, frame - suffixDelayFrames);
  const suffixEnter = spring({
    frame: suffixLocal,
    fps,
    config: { damping: 20, stiffness: 150, mass: 0.6 },
  });
  const suffixScale = interpolate(suffixEnter, [0, 1], [0.6, 1.0]);
  const suffixOpacity = interpolate(suffixLocal, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Kicker — on-screen by the time the number lands.
  const kickerOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle / caption fade-in — 0.3s after the number lands.
  const subtitleStart = Math.round(0.9 * fps);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStart, subtitleStart + 9],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Headline color: on dark palettes the numeral pops in pure white; on cream it
  // uses the resolved ink. getBodyTextColor handles the dark-palette sharpening.
  const numberColor = isDark ? "#FFFFFF" : resolvedInk;

  return (
    <DarkSlateChassis16x9 slateColor={resolvedPaper}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      {/* Palette-driven grain overlay. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant). */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}

      {/* Centered hero stack — kicker + number + subtitle + caption. The wider
          canvas keeps the subtitle on one line; padding is generous on the
          sides so the breadcrumb/watermark chrome never collides. */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 200px",
        }}
      >
        {/* Kicker (eyebrow above the number). */}
        {kicker ? (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: typography.kickerFontSize,
              color: resolvedAccent,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              opacity: kickerOpacity,
              marginBottom: 36,
              textAlign: "center",
            }}
          >
            {kicker}
          </div>
        ) : null}

        {/* THE NUMBER — figure + optional prefix + optional suffix. */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            maxWidth: 1500,
            lineHeight: 0.92,
          }}
        >
          {/* Optional leading prefix ($, €, etc.) — accent, smaller. */}
          {parts.prefix ? (
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: prefixFontSize,
                color: resolvedAccent,
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                marginRight: 8,
                marginTop: Math.round((numberFontSize - prefixFontSize) * 0.18),
                opacity: numberOpacity,
                transform: `scale(${numberScale})`,
                transformOrigin: "left top",
                display: "inline-block",
              }}
            >
              {parts.prefix}
            </span>
          ) : null}

          {/* Main figure. */}
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: numberFontSize,
              color: numberColor,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              opacity: numberOpacity,
              transform: `scale(${numberScale})`,
              transformOrigin: "center top",
              display: "inline-block",
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 4px 24px rgba(0,0,0,0.45)",
            }}
          >
            {displayedFigure}
          </span>

          {/* Optional trailing suffix (×, %, B, M, ↑, ↓) — accent, ~70% size. */}
          {parts.suffix ? (
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: suffixFontSize,
                color: resolvedAccent,
                letterSpacing: "-0.04em",
                lineHeight: 0.92,
                marginLeft: 12,
                marginTop: Math.round((numberFontSize - suffixFontSize) * 0.12),
                opacity: suffixOpacity,
                transform: `scale(${suffixScale})`,
                transformOrigin: "left top",
                display: "inline-block",
              }}
            >
              {parts.suffix}
            </span>
          ) : null}
        </div>

        {/* Subtitle. */}
        {subtitle ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 600,
              fontSize: typography.subtitleFontSize,
              color: getBodyTextColor(
                palette,
                resolvedInk,
                typography.subtitleFontSize,
              ),
              lineHeight: 1.2,
              maxWidth: 1300,
              textAlign: "center",
              marginTop: 44,
              opacity: subtitleOpacity,
              letterSpacing: "-0.015em",
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {/* Optional small caption under the subtitle. */}
        {caption ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 500,
              fontSize: typography.captionTextFontSize,
              color: resolvedMuted,
              lineHeight: 1.25,
              maxWidth: 1200,
              textAlign: "center",
              marginTop: 18,
              opacity: subtitleOpacity,
              letterSpacing: "0.01em",
            }}
          >
            {caption}
          </div>
        ) : null}
      </AbsoluteFill>

      {/* Bottom-right watermark (optional). */}
      {watermark ? (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      ) : null}

      {/* Word-by-word captions in the bottom strip — gated by showCaptions. */}
      {showCaptions ? (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      ) : null}
    </DarkSlateChassis16x9>
  );
};

export default BigNumberHero16x9;
