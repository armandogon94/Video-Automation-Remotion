/**
 * BenchmarkBars9x16 — vertical (1080×1920) horizontal-bar comparison chart.
 *
 * Use for "X vs Y" comparison stories: pricing comparisons ("15× cheaper"),
 * performance benchmarks ("92% of GPT-5.5"), latency races ("<200ms vs 800ms"),
 * etc. Same house grammar as the rest of Sprint 1 templates (cream/dark palette,
 * subjectTool accent override, optional BrandBreadcrumb, grain overlay,
 * EditorialCaption strip).
 *
 * Inspired by @carloscuamatzin's "scientific chart" treatment — large editorial
 * labels on the left, bold horizontal fills on the right, with a clean source
 * caption pinned to the bottom of the bars zone.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~80px from top)
 *   - TITLE (~y=260)       Inter 700, 64–80px (auto-shrink for length), ink, max-w 920
 *   - SUBTITLE (~y=380)    Inter 500, 36–44px, muted, max-w 880 (optional)
 *   - BARS ZONE (~y=460)   stacked horizontal bars (label · track · fill · value)
 *   - SOURCE CAPTION       Inter 400, 26–30px, muted (optional, ~y=1420)
 *   - EditorialCaption     bottom 200px strip (toggleable)
 *
 * Motion grammar:
 *   - Title fades in at frame 0 (~0.4s).
 *   - Subtitle fades in 0.2s after title.
 *   - Bars enter SEQUENTIALLY: bar[i] starts at barStaggerSeconds * i.
 *       · Label fades in instantly (~0.1s).
 *       · Track fades in over 0.15s.
 *       · Fill width interpolates 0 → widthPct over barAnimSeconds with a
 *         cubic-ease curve (interpolate's default easing).
 *       · Value label fades in once the fill reaches ≥95% of target.
 *   - Source caption fades in after all bars complete.
 *
 * NOTE on schema: this Props type is defined locally for tsc-only compilation.
 * The canonical Zod schema + Root.tsx registration are proposed in the agent
 * report; this file does not touch src/compositions/schemas.ts or src/Root.tsx.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, getBodyTextColor } from "../brand";
import { outCubic } from "../timing/easing";
import type { PaletteMode } from "../brand";
import type { BenchmarkBars9x16Props, BenchmarkBar } from "./schemas";

// ─── Layout constants ──────────────────────────────────────────────────
const TITLE_Y = 260;
const TITLE_MAX_WIDTH = 920;
const TITLE_BASE_SIZE = 80;

const SUBTITLE_Y = 380;
const SUBTITLE_MAX_WIDTH = 880;
const SUBTITLE_BASE_SIZE = 44;

const BARS_ZONE_TOP = 460;
const BARS_ZONE_LEFT = 80;
const BARS_ZONE_WIDTH = 1080 - 2 * BARS_ZONE_LEFT; // = 920

const LABEL_WIDTH = 280;
const LABEL_GAP = 24; // gap between label and track
const TRACK_LEFT_OFFSET = LABEL_WIDTH + LABEL_GAP; // 304
const TRACK_WIDTH = BARS_ZONE_WIDTH - TRACK_LEFT_OFFSET; // 616

const BAR_TRACK_HEIGHT = 84;
const BAR_ROW_GAP = 30;
const BAR_ROW_HEIGHT = BAR_TRACK_HEIGHT + BAR_ROW_GAP;

const SOURCE_CAPTION_Y = 1420;
const SOURCE_CAPTION_MAX_WIDTH = 920;

// Width fraction (of TRACK_WIDTH) above which the value label sits inside the fill.
const INSIDE_LABEL_THRESHOLD = 0.3;

// ─── Helpers ───────────────────────────────────────────────────────────

/** Crude auto-shrink: long titles step down 4px per char over a threshold. */
function autoShrinkFont(text: string, baseSize: number, charsThreshold: number, minSize: number): number {
  if (text.length <= charsThreshold) return baseSize;
  const overshoot = text.length - charsThreshold;
  return Math.max(minSize, baseSize - overshoot * 2);
}

// ─── Single bar row (label · track · fill · value) ─────────────────────
const BarRow: React.FC<{
  bar: BenchmarkBar;
  topPx: number;
  enterFrame: number;
  barAnimSeconds: number;
  inkColor: string;
  paperColor: string;
  mutedColor: string;
  accentColor: string;
  paletteMode: PaletteMode;
}> = ({ bar, topPx, enterFrame, barAnimSeconds, inkColor, paperColor, mutedColor, accentColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Label fades in over 3 frames (~0.1s @ 30fps).
  const labelOpacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Track fades in over 0.15s (~4-5 frames @ 30fps).
  const trackFadeFrames = Math.max(1, Math.round(0.15 * fps));
  const trackOpacity = interpolate(localFrame, [0, trackFadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fill width interpolates 0 → widthPct over barAnimSeconds.
  // interpolate's default easing is linear; we apply a cubic-ease via easing param indirectly
  // by using a normalized progress and easing-out curve.
  const fillFrames = Math.max(1, Math.round(barAnimSeconds * fps));
  const fillProgressLinear = interpolate(localFrame, [0, fillFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Cubic ease-out via the shared named curve (`outCubic`). Replaces the
  // inline `1 - Math.pow(1 - t, 3)` so every keyframe in the brand speaks the
  // same easing vocabulary — see R6 transcripts synthesis, Insight 1.
  const fillProgressEased = outCubic(fillProgressLinear);
  const targetFraction = Math.max(0, Math.min(1, bar.widthPct));
  const fillFraction = targetFraction * fillProgressEased;
  const fillPx = TRACK_WIDTH * fillFraction;

  // Value label appears once the fill reaches ≥95% of target.
  const valueLabelVisible = fillProgressEased >= 0.95;
  const valueFadeStart = Math.round(fillFrames * 0.95);
  const valueOpacity = interpolate(localFrame, [valueFadeStart, valueFadeStart + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Inside-vs-outside positioning of the value label.
  const labelSitsInside = targetFraction >= INSIDE_LABEL_THRESHOLD;
  const valueFontSize = labelSitsInside ? 42 : 40;

  const fillColor = bar.color && bar.color.length > 0 ? bar.color : accentColor;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: BARS_ZONE_LEFT,
        width: BARS_ZONE_WIDTH,
        height: BAR_TRACK_HEIGHT,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Label on the left */}
      <div
        style={{
          width: LABEL_WIDTH,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 42,
          // A3 audit: dark-palette body text >30px sharpens with pure white.
          color: getBodyTextColor(paletteMode, inkColor, 42),
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          opacity: labelOpacity,
          paddingRight: LABEL_GAP,
          textAlign: "left",
        }}
      >
        {bar.label}
      </div>

      {/* Track + fill + value (right column) */}
      <div
        style={{
          position: "relative",
          width: TRACK_WIDTH,
          height: BAR_TRACK_HEIGHT,
        }}
      >
        {/* Track (background) — muted at 15% alpha */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${mutedColor}26`, // ~0.15 alpha hex
            borderRadius: 14,
            opacity: trackOpacity,
          }}
        />

        {/* Fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: fillPx,
            background: fillColor,
            borderRadius: 14,
          }}
        />

        {/* Value label — inside the fill if wide enough, else outside to the right */}
        {valueLabelVisible && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...(labelSitsInside
                ? { right: 18 }
                : { left: fillPx + 18 }),
              display: "flex",
              alignItems: "center",
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: valueFontSize,
              color: labelSitsInside ? paperColor : inkColor,
              letterSpacing: "-0.01em",
              fontVariantNumeric: "tabular-nums",
              opacity: valueOpacity,
              whiteSpace: "nowrap",
            }}
          >
            {bar.value}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const BenchmarkBars9x16: React.FC<BenchmarkBars9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  bars,
  sourceCaption,
  barStaggerSeconds,
  barAnimSeconds,
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
  // Empty string in a color prop = "use palette default" (Zod schemas default to "").
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

  // Title / subtitle fade-in.
  const titleOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleStartFrame = Math.round(0.2 * fps);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStartFrame, subtitleStartFrame + Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Auto-shrink long titles/subtitles.
  const titleFontSize = autoShrinkFont(title, TITLE_BASE_SIZE, 28, 64);
  const subtitleFontSize = subtitle
    ? autoShrinkFont(subtitle, SUBTITLE_BASE_SIZE, 40, 36)
    : SUBTITLE_BASE_SIZE;

  // Bar layout — vertically center the stack within the bars zone.
  const totalBarsHeight =
    bars.length > 0
      ? bars.length * BAR_TRACK_HEIGHT + (bars.length - 1) * BAR_ROW_GAP
      : 0;
  const barsZoneAvailable = SOURCE_CAPTION_Y - BARS_ZONE_TOP - 40;
  const barsBlockTop = BARS_ZONE_TOP + Math.max(0, (barsZoneAvailable - totalBarsHeight) / 2);

  // Per-bar enter frames.
  const barFrames = bars.map((_, i) => Math.round(i * barStaggerSeconds * fps));
  const lastBarCompleteFrame =
    bars.length > 0
      ? barFrames[barFrames.length - 1] + Math.round(barAnimSeconds * fps)
      : 0;

  // Source caption fades in after all bars complete.
  const sourceFadeStart = lastBarCompleteFrame + Math.round(0.2 * fps);
  const sourceOpacity = interpolate(
    frame,
    [sourceFadeStart, sourceFadeStart + Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay (cream uses multiply vignette, dark uses screen amber). */}
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

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: TITLE_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: titleFontSize,
          // A3 audit: dark-palette body text >30px sharpens with pure white.
          color: getBodyTextColor(palette, resolvedInk, titleFontSize),
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          padding: `0 ${(1080 - TITLE_MAX_WIDTH) / 2}px`,
          opacity: titleOpacity,
        }}
      >
        {title}
      </div>

      {/* Subtitle (optional) */}
      {subtitle && (
        <div
          style={{
            position: "absolute",
            top: SUBTITLE_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: subtitleFontSize,
            color: resolvedMuted,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            padding: `0 ${(1080 - SUBTITLE_MAX_WIDTH) / 2}px`,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Bars zone */}
      {bars.map((bar, i) => (
        <BarRow
          key={`bar-${i}`}
          bar={bar}
          topPx={barsBlockTop + i * BAR_ROW_HEIGHT}
          enterFrame={barFrames[i]}
          barAnimSeconds={barAnimSeconds}
          inkColor={resolvedInk}
          paperColor={resolvedPaper}
          mutedColor={resolvedMuted}
          accentColor={resolvedAccent}
          paletteMode={palette}
        />
      ))}

      {/* Source / attribution caption (optional) */}
      {sourceCaption && (
        <div
          style={{
            position: "absolute",
            top: SOURCE_CAPTION_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 28,
            color: resolvedMuted,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            padding: `0 ${(1080 - SOURCE_CAPTION_MAX_WIDTH) / 2}px`,
            opacity: sourceOpacity,
          }}
        >
          {sourceCaption}
        </div>
      )}

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 200,
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
