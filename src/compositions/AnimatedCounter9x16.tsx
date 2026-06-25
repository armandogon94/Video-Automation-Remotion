/**
 * AnimatedCounter9x16 — vertical (1080×1920) stat-hero whose numeric figure
 * ramps from 0 → target over a configurable count window with cubic ease-out.
 *
 * Sibling of BigNumberHero9x16. Where BigNumberHero is a *static* stat-hero
 * with optional countUp, AnimatedCounter is *count-first*: the ramp IS the
 * payoff. Built per docs/research/wave-1/R2-data-viz.md §1 (Animated Counter
 * / Odometer): Remotion-native interpolate, `tabular-nums`, cubic ease-out,
 * no third-party odometerjs (which flickers during frame-by-frame render).
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional kicker eyebrow (Inter 700 32px tracking-spaced uppercase accent, ~y=240)
 *   - THE COUNTER (vertical center): Inter 900 380-460px, ink, tabular-nums.
 *     Counts 0 → target over countDurationSeconds (default 1.8s) with easeOutCubic.
 *     Optional prefix (60% size, ink) and suffix (70% size, accent).
 *   - Subtitle (Inter 600 ~62px, ink, max-width 920px)
 *   - Optional caption under subtitle (Inter 500 ~32px, muted)
 *   - Optional EditorialCaption strip (default false — counter speaks for itself)
 *
 * Motion grammar:
 *   - Pre-ramp: 0.3s scale-in (0.85 → 1.0) on the entire counter block.
 *   - Counter ramp: `target * easeOutCubic(progress)` 0→1 over countDurationSeconds.
 *   - Prefix + suffix fade in 0.15s after the counter starts ramping.
 *   - Subtitle fades in 0.3s after the counter completes ramp.
 *   - Optional audioAnchorKeyword: if provided + found in wordTimings, the entire
 *     ramp clock starts when the keyword is spoken instead of at frame 0.
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";
import { outCubic } from "../timing/easing";

// TODO: wordTimingSchema + breadcrumbSchema are not exported from schemas.ts
// (only the inferred types `WordTiming` / `Breadcrumb` are). Redeclared locally
// to keep AnimatedCounter9x16Props self-contained. If the Wave 1 schema cleanup
// promotes those to exports, swap these locals for `import { wordTimingSchema,
// breadcrumbSchema } from "./schemas"`.
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

// --- Animated Counter 9x16 (numeric ramp 0→target, tabular-nums, audio-anchored) ---
export const animatedCounter9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  target: z.number().default(15),
  prefix: z.string().default(""),
  suffix: z.string().default(""),
  decimals: z.number().int().min(0).max(4).default(0),
  /** When set + found in wordTimings, ramp starts at the spoken-keyword time. */
  audioAnchorKeyword: z.string().optional(),
  /** Seconds for the count ramp. Default 1.8. */
  countDurationSeconds: z.number().min(0.3).max(10).default(1.8),
  kicker: z.string().optional(),
  subtitle: z.string().default(""),
  caption: z.string().optional(),
  /**
   * Face for the numeric figure (prefix + digits + suffix).
   * - `"sans"` (default): Inter 900 house display face — sibling of BigNumberHero9x16.
   * - `"mono"`: JetBrains Mono — the live-readout / odometer look (e.g. adamrosler's
   *   `ERROR 0.81`, `step 2,907,583` orange/blue monospace counters). Keeps
   *   `tabular-nums` so digits don't jitter as the value ramps.
   */
  figureFont: z.enum(["sans", "mono"]).default("sans"),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AnimatedCounter9x16Props = z.infer<typeof animatedCounter9x16Schema>;

// Layout constants (mirror BigNumberHero9x16)
const NUMBER_MAX_WIDTH = 940;
const NUMBER_BASE_SIZE = 420; // sits in the 380–460 band; auto-shrinks for long figures
const KICKER_OFFSET_ABOVE_NUMBER = 110; // px above the number block
const SUBTITLE_GAP = 56; // px below the number block

// ─── Helpers ────────────────────────────────────────────────────────

/** Cubic ease-out: f(t) = 1 - (1 - t)^3. Standard "settle-in-place" curve.
 *  Clamps t to [0,1] before delegating to the shared `outCubic` curve. */
function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return outCubic(c);
}

/**
 * Format a numeric value with fixed decimals and comma-thousands grouping
 * (the editorial default). Matches BigNumberHero9x16's `formatFigure` for
 * the common case (usesCommaThousands=true) so the two compositions visually
 * agree on number rendering.
 */
function formatNumber(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withCommas}.${fracPart}` : withCommas;
}

/**
 * Find the start time (in seconds) of the first word whose text matches the
 * given keyword, case-insensitive, stripping punctuation. Returns null when
 * no match — caller should fall back to anchoring at frame 0.
 */
function findKeywordStart(
  wordTimings: AnimatedCounter9x16Props["wordTimings"],
  keyword: string,
): number | null {
  if (!keyword) return null;
  const needle = keyword.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "");
  if (!needle) return null;
  for (const w of wordTimings) {
    const haystack = w.text.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "");
    if (haystack === needle) return w.startSeconds;
  }
  return null;
}

// ─── Composition ────────────────────────────────────────────────────
export const AnimatedCounter9x16: React.FC<AnimatedCounter9x16Props> = ({
  audioUrl,
  wordTimings,
  target,
  prefix,
  suffix,
  decimals,
  audioAnchorKeyword,
  countDurationSeconds,
  kicker,
  subtitle,
  caption,
  figureFont,
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

  // Compute the anchor frame: either when the keyword is spoken, or 0.
  const anchorFrame = useMemo(() => {
    if (!audioAnchorKeyword) return 0;
    const seconds = findKeywordStart(wordTimings, audioAnchorKeyword);
    if (seconds === null) return 0;
    return Math.round(seconds * fps);
  }, [audioAnchorKeyword, wordTimings, fps]);

  // Local frame relative to anchor — everything below treats this as "frame 0".
  const localFrame = Math.max(0, frame - anchorFrame);

  // Pre-ramp scale-in over 0.3s (0.85 → 1.0) on the entire counter block.
  const preRampDurationFrames = Math.round(0.3 * fps);
  const preRampProgress = interpolate(
    localFrame,
    [0, preRampDurationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const blockScale = interpolate(preRampProgress, [0, 1], [0.85, 1.0]);
  const blockOpacity = interpolate(localFrame, [0, preRampDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Counter ramp: 0 → target across countDurationSeconds with cubic ease-out.
  const rampDurationFrames = Math.max(1, Math.round(countDurationSeconds * fps));
  const rampLinear = interpolate(localFrame, [0, rampDurationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rampEased = easeOutCubic(rampLinear);
  const currentValue = target * rampEased;
  const displayedFigure = formatNumber(currentValue, decimals);

  // Auto-shrink rule (mirrors BigNumberHero9x16): figures wider than 4 chars scale
  // down. Use the *terminal* figure width — same width every frame — to avoid the
  // number resizing as it counts up.
  const terminalFigure = formatNumber(target, decimals);
  const figureLen = terminalFigure.length + (prefix ? 1 : 0);
  const charCountSize =
    figureLen <= 4
      ? NUMBER_BASE_SIZE
      : Math.max(220, Math.round(NUMBER_BASE_SIZE * (4 / figureLen)));
  // The char-count shrink above ignores RENDERED WIDTH, so long figures —
  // especially wide mono glyphs like "2,907,583" — overflow the 1080 canvas and
  // clip off both edges. Additionally cap the size to an estimated width fit so
  // the whole figure always sits inside a safe width (margin left for prefix/suffix).
  const charEm = figureFont === "mono" ? 0.62 : 0.56; // approx glyph advance / char
  const widthFit = Math.floor(940 / Math.max(1, figureLen * charEm));
  const numberFontSize = Math.max(120, Math.min(charCountSize, widthFit));
  const suffixFontSize = Math.round(numberFontSize * 0.7);
  const prefixFontSize = Math.round(numberFontSize * 0.6);

  // Figure face: Inter 900 (default house display) or JetBrains Mono (live-readout
  // / odometer look). Mono glyphs are wider and read best without the tight
  // negative tracking the sans face uses, so relax letter-spacing in mono mode.
  const isMono = figureFont === "mono";
  const figureFontFamily = isMono ? FONT_STACKS.mono : "Inter, sans-serif";
  const figureWeight = isMono ? 700 : 900;
  const figureTracking = isMono ? "0em" : "-0.04em";
  // In mono (live-readout) mode the whole figure carries the accent color, matching
  // adamrosler's fully-orange `ERROR 0.81` / fully-blue `step 2,907,583` readouts.
  // In sans mode the digits stay ink and only the suffix carries the accent.
  const figureColor = isMono ? resolvedAccent : resolvedInk;

  // Prefix + suffix fade in 0.15s AFTER the counter starts ramping (so the eye
  // lands on the numerals first, then the modifiers attach).
  const sideDelayFrames = Math.round(0.15 * fps);
  const sideLocal = Math.max(0, localFrame - sideDelayFrames);
  const sideFadeFrames = Math.round(0.2 * fps);
  const sideOpacity = interpolate(sideLocal, [0, sideFadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Kicker — already on-screen by the time the counter starts (fade-in at f0).
  const kickerOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle / caption fade in 0.3s AFTER the counter completes ramp.
  const subtitleStartFrames = rampDurationFrames + Math.round(0.3 * fps);
  const subtitleOpacity = interpolate(
    localFrame,
    [subtitleStartFrames, subtitleStartFrames + Math.round(0.3 * fps)],
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

      {/* Centered hero stack — kicker + counter + subtitle + caption */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        {/* Kicker (eyebrow above the counter) */}
        {kicker && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              color: resolvedAccent,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              opacity: kickerOpacity,
              marginBottom: KICKER_OFFSET_ABOVE_NUMBER - 32,
              textAlign: "center",
            }}
          >
            {kicker}
          </div>
        )}

        {/* THE COUNTER — prefix + ramping figure + suffix */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            maxWidth: NUMBER_MAX_WIDTH,
            lineHeight: 0.92,
            opacity: blockOpacity,
            transform: `scale(${blockScale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Optional leading prefix ($, €, etc.) — rendered in ink, smaller (60%) */}
          {prefix && (
            <span
              style={{
                fontFamily: figureFontFamily,
                fontWeight: figureWeight,
                fontSize: prefixFontSize,
                color: figureColor,
                letterSpacing: figureTracking,
                lineHeight: 0.92,
                marginRight: 8,
                marginTop: Math.round((numberFontSize - prefixFontSize) * 0.18),
                opacity: sideOpacity,
                display: "inline-block",
              }}
            >
              {prefix}
            </span>
          )}

          {/* Main ramping figure — tabular-nums so digit widths don't jitter */}
          <span
            style={{
              fontFamily: figureFontFamily,
              fontWeight: figureWeight,
              fontSize: numberFontSize,
              color: figureColor,
              letterSpacing: figureTracking,
              lineHeight: 0.92,
              display: "inline-block",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayedFigure}
          </span>

          {/* Optional trailing suffix (×, %, M, B, K) — accent, ~70% size */}
          {suffix && (
            <span
              style={{
                fontFamily: figureFontFamily,
                fontWeight: figureWeight,
                fontSize: suffixFontSize,
                color: resolvedAccent,
                letterSpacing: figureTracking,
                lineHeight: 0.92,
                marginLeft: 12,
                marginTop: Math.round((numberFontSize - suffixFontSize) * 0.12),
                opacity: sideOpacity,
                display: "inline-block",
              }}
            >
              {suffix}
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
              color: resolvedInk,
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

      {/* Word-by-word captions in the bottom strip — opt-in (counter speaks for itself) */}
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
