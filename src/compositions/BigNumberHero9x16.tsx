/**
 * BigNumberHero9x16 — vertical (1080×1920) stat-hero composition.
 *
 * Inspired by @DIYSmartCode's "HeroPricing" template (analyzed at
 * references/creators/diysmartcode/ANALYSIS.md — Template 2, reel dzn9KVVtZLc
 * "ast grep - the missing layer"). ONE massive number dominates ~50% of the
 * vertical frame; supporting text frames it.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb at top (~80px)
 *   - Kicker (small uppercase eyebrow in accent)
 *   - THE NUMBER — massive Inter 900, ~380–460px (auto-fit), in ink. Optional
 *     suffix character (×, %, B, M, $, ↑, ↓) rendered in accent at ~70% size.
 *   - Subtitle (one-line context, Inter 600 ~60px)
 *   - Optional caption (small secondary line, muted)
 *   - Word-by-word EditorialCaption in the bottom strip (optional)
 *
 * Motion grammar:
 *   - Number lands with a single hard spring (scale 0.78 → 1.0 over ~0.6s,
 *     opacity 0 → 1 over ~0.3s). Lands by frame ~18.
 *   - Suffix follows ~0.15s after the figure with its own spring.
 *   - Optional `countUp` ramps a pure-numeric figure from 0 → target across the
 *     entry window, preserving leading sign and thousands separators.
 *   - Subtitle fades in 0.3s after the number lands.
 *   - Kicker is already on-screen when the number lands (frame 0 fade-in).
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
import type { BigNumberHero9x16Props } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, getBodyTextColor } from "../brand";

// Layout constants
const NUMBER_MAX_WIDTH = 940;
const NUMBER_BASE_SIZE = 420; // sits in the 380–460 band; auto-shrinks for long figures
const KICKER_OFFSET_ABOVE_NUMBER = 110; // px above the number block
const SUBTITLE_GAP = 56; // px below the number block

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Split a number string like "15×", "+47%", "$2.5B", "150" into a leading
 * figure (digits, dot, comma, leading sign) and a trailing suffix character
 * (anything that follows). Also handles a leading currency-like prefix.
 *
 * Returns { prefix, figure, suffix } so the renderer can place a $ before
 * and a × / % / B / M / ↑ / ↓ after the main numerals.
 */
function splitFigure(raw: string): {
  prefix: string;
  figure: string;
  suffix: string;
} {
  if (!raw) return { prefix: "", figure: "", suffix: "" };

  // Optional leading non-digit prefix (e.g. "$", "€", "£"). Sign (+/-) stays
  // glued to the figure for the count-up parser.
  let prefix = "";
  let rest = raw;
  if (/^[^\d+\-.,]/.test(rest)) {
    prefix = rest[0];
    rest = rest.slice(1);
  }

  // Figure = optional sign + digits / dots / commas
  const match = rest.match(/^([+\-]?[\d.,]+)(.*)$/);
  if (!match) {
    // No numeric body at all — render whole thing as figure with no suffix.
    return { prefix, figure: rest, suffix: "" };
  }
  return { prefix, figure: match[1], suffix: match[2] };
}

/**
 * Parse a figure string into a number for count-up animation. Preserves the
 * separator style (comma-thousands vs dot-decimal) when re-formatting.
 * Returns null if the figure can't be parsed (e.g. "N/A").
 */
function parseFigure(
  figure: string,
): { value: number; usesCommaThousands: boolean; decimals: number } | null {
  if (!figure) return null;
  // Detect "1,234.56" vs "1234.56" vs "1234"
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
  // Add comma thousands separators to the integer part only.
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

// ─── Composition ────────────────────────────────────────────────────
export const BigNumberHero9x16: React.FC<BigNumberHero9x16Props> = ({
  audioUrl,
  wordTimings,
  number,
  kicker,
  subtitle,
  caption,
  countUp,
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

  // Split the number into prefix / figure / suffix once.
  const parts = useMemo(() => splitFigure(number), [number]);
  const parsed = useMemo(() => parseFigure(parts.figure), [parts.figure]);

  // Auto-shrink rule: anything over 4 chars in the figure scales down so the
  // whole block stays within NUMBER_MAX_WIDTH. The 4-char threshold matches
  // a typical "$XX.X" or "1234" line.
  const figureLen = parts.figure.length + (parts.prefix ? 1 : 0);
  const numberFontSize =
    figureLen <= 4
      ? NUMBER_BASE_SIZE
      : Math.max(220, Math.round(NUMBER_BASE_SIZE * (4 / figureLen)));
  const suffixFontSize = Math.round(numberFontSize * 0.7);
  const prefixFontSize = Math.round(numberFontSize * 0.55);

  // Editorial spring (A1 audit): damping 22 / stiffness 130 / mass 0.7. Shared
  // with the other cream/dark compositions for a single motion DNA. The 0.15s-
  // delayed suffix uses a slightly snappier (20/150/0.6) profile by design — it
  // should feel like a separate beat landing on top of the number.
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

  // Count-up: animate digits 0 → target across the entry window (0..~18 frames).
  // Only enabled when caller asks AND figure is parseable as a finite number.
  const countUpDuration = Math.round(0.6 * fps); // ~18 @ 30fps
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

  // Suffix entry — 0.15s after the figure
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

  // Kicker — already on-screen by the time the number lands (fade-in at frame 0)
  const kickerOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle / caption fade-in — 0.3s after the number lands (number lands ~f18,
  // so start ~f27, full opacity ~f36)
  const subtitleStart = Math.round(0.9 * fps);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStart, subtitleStart + 9],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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

      {/* Centered hero stack — kicker + number + subtitle + caption */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        {/* Kicker (eyebrow above the number) */}
        {kicker && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 34,
              color: resolvedAccent,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              opacity: kickerOpacity,
              marginBottom: KICKER_OFFSET_ABOVE_NUMBER - 34,
              textAlign: "center",
            }}
          >
            {kicker}
          </div>
        )}

        {/* THE NUMBER — main figure + optional prefix + optional suffix */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            maxWidth: NUMBER_MAX_WIDTH,
            lineHeight: 0.92,
          }}
        >
          {/* Optional leading prefix ($, €, etc.) — rendered in accent, smaller */}
          {parts.prefix && (
            <span
              style={{
                fontFamily: "Inter, sans-serif",
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
          )}

          {/* Main figure */}
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: numberFontSize,
              color: resolvedInk,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              opacity: numberOpacity,
              transform: `scale(${numberScale})`,
              transformOrigin: "center top",
              display: "inline-block",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayedFigure}
          </span>

          {/* Optional trailing suffix (×, %, B, M, ↑, ↓) — accent, ~70% size */}
          {parts.suffix && (
            <span
              style={{
                fontFamily: "Inter, sans-serif",
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
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 62,
              // A3 audit: dark-palette body text >30px sharpens with pure white
              // (cream ink anti-aliases soft at medium sizes).
              color: getBodyTextColor(palette, resolvedInk, 62),
              lineHeight: 1.1,
              maxWidth: 920,
              textAlign: "center",
              marginTop: SUBTITLE_GAP,
              opacity: subtitleOpacity,
              letterSpacing: "-0.015em",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Optional small caption under the subtitle */}
        {caption && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 32,
              color: resolvedMuted,
              lineHeight: 1.2,
              maxWidth: 880,
              textAlign: "center",
              marginTop: 22,
              opacity: subtitleOpacity,
              letterSpacing: "0.01em",
            }}
          >
            {caption}
          </div>
        )}
      </AbsoluteFill>

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
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
