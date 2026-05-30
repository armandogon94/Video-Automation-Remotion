/**
 * AnimatedTable9x16 — vertical (1080×1920) row-by-row stagger reveal of a
 * tabular comparison (X-vs-Y across multiple metrics).
 *
 * Sibling of BenchmarkBars9x16. Where BenchmarkBars uses horizontal-bar fills
 * for ONE metric across multiple subjects, AnimatedTable shows MULTIPLE metrics
 * across multiple subjects in a compact grid — closer to a Bloomberg / FT
 * comparison table. The first column is the row label (subject); the remaining
 * columns are the metric values; an optional highlighted row calls out a
 * "winner" with an accent-tinted background and bolder body weight.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional title (~y=260, Inter 700 ~58px, auto-shrink for length)
 *   - Optional subtitle (~y=350, Inter 500 ~36px, muted)
 *   - TABLE ZONE (~y=480..1500, max-width 920px centered):
 *       · Header row: Inter 700 ~28px, tracking-spaced uppercase, accent color,
 *         2px accent bottom border.
 *       · Body rows: Inter 500 ~36px, ink, 18px×24px padding, alternating
 *         palette-muted-at-5%-alpha background on even rows.
 *       · First column: row labels, left-aligned.
 *       · Other columns: values, right-aligned (numerical comparison default).
 *       · Optional highlight row (winner): full-row tinted accent at 8% alpha,
 *         body weight bumped to 700.
 *   - Optional source caption (~y=1540, Inter 400 26px muted)
 *   - Optional EditorialCaption strip (default false — table speaks for itself)
 *
 * Motion grammar:
 *   - Header row fades in over 0.3s at frame 0.
 *   - Body row[i] enters at `headerDelaySeconds + rowStaggerSeconds * i`.
 *       · Per-row entry: opacity 0→1 + translateX -8→0 over 0.3s (subtle slide).
 *   - Highlight row's accent tint fades in 0.2s AFTER that row settles
 *     (so the winner glow lands on the eye second, not first).
 *   - Source caption fades in 0.2s after all rows complete.
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
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, getBodyTextColor } from "../brand";
import type { PaletteMode } from "../brand";

// Local schema duplicates (mirroring AnimatedCounter9x16): wordTimingSchema and
// breadcrumbSchema are not exported from schemas.ts, only their inferred types.
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

// --- Animated Table 9x16 (row-by-row stagger reveal of an X-vs-Y comparison) ---
export const animatedTable9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  /** Header row strings (first one is the row-label column header). */
  headers: z.array(z.string()).default([]),
  /** Body rows. Each row is an array matching headers.length. First entry = row label. */
  rows: z.array(z.array(z.string())).default([]),
  /** Index of the row to highlight (winner row). -1 = no highlight. */
  highlightRowIndex: z.number().int().default(-1),
  /** Seconds between consecutive body-row entrances. */
  rowStaggerSeconds: z.number().min(0.05).max(3).default(0.2),
  /** Seconds before first body row enters (after header). */
  headerDelaySeconds: z.number().min(0).max(5).default(0.4),
  sourceCaption: z.string().optional(),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AnimatedTable9x16Props = z.infer<typeof animatedTable9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────────
const TITLE_Y = 260;
const TITLE_MAX_WIDTH = 920;
const TITLE_BASE_SIZE = 58;

const SUBTITLE_Y = 350;
const SUBTITLE_MAX_WIDTH = 880;
const SUBTITLE_BASE_SIZE = 36;

const TABLE_TOP = 480;
const TABLE_MAX_WIDTH = 920;
const TABLE_LEFT = (1080 - TABLE_MAX_WIDTH) / 2; // = 80

const HEADER_FONT_SIZE = 28;
const HEADER_PADDING_V = 14;
const HEADER_PADDING_H = 24;
const HEADER_BORDER_WIDTH = 2;

const ROW_FONT_SIZE = 36;
const ROW_PADDING_V = 18;
const ROW_PADDING_H = 24;
const ROW_HIGHLIGHT_FONT_WEIGHT = 700;
const ROW_DEFAULT_FONT_WEIGHT = 500;

const SOURCE_CAPTION_Y = 1540;
const SOURCE_CAPTION_MAX_WIDTH = 920;

// ─── Helpers ───────────────────────────────────────────────────────────

/** Crude auto-shrink: long titles step down per char over a threshold. */
function autoShrinkFont(text: string, baseSize: number, charsThreshold: number, minSize: number): number {
  if (text.length <= charsThreshold) return baseSize;
  const overshoot = text.length - charsThreshold;
  return Math.max(minSize, baseSize - overshoot * 1.5);
}

/**
 * Append an 8-bit alpha (00..FF) onto a 6-digit hex color (#RRGGBB) and return
 * the resulting #RRGGBBAA string. Falls back to the input untouched if it isn't
 * a clean hex (rgb()/named colors are passed through — most callers feed hex).
 */
function withAlphaHex(hex: string, alpha01: number): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha01)) * 255);
  const hh = a.toString(16).padStart(2, "0").toUpperCase();
  return `${hex}${hh}`;
}

// ─── Single body row ───────────────────────────────────────────────────
const TableRow: React.FC<{
  values: string[];
  isHighlight: boolean;
  enterFrame: number;
  highlightDelayFrames: number;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
  rowIndex: number;
  columnCount: number;
}> = ({
  values,
  isHighlight,
  enterFrame,
  highlightDelayFrames,
  inkColor,
  accentColor,
  mutedColor,
  paletteMode,
  rowIndex,
  columnCount,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Row entry: opacity 0→1 + translateX -8→0 over 0.3s.
  const entryFrames = Math.max(1, Math.round(0.3 * fps));
  const opacity = interpolate(localFrame, [0, entryFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(localFrame, [0, entryFrames], [-8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight tint fades in 0.2s AFTER the row settles.
  const highlightFadeFrames = Math.max(1, Math.round(0.3 * fps));
  const highlightLocal = localFrame - highlightDelayFrames;
  const highlightOpacity = isHighlight
    ? interpolate(highlightLocal, [0, highlightFadeFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Alternating zebra stripe on even data rows (rowIndex 1, 3, 5… stripped) —
  // matches editorial table convention (first body row clean, then subtle).
  const isStriped = rowIndex % 2 === 1;
  const stripeBg = isStriped ? withAlphaHex(mutedColor, 0.05) : "transparent";

  // Highlight tint sits on TOP of the zebra stripe (additive). Per the spec the
  // highlight fade has its own opacity, so we mix that into the alpha here.
  const highlightTintAlpha = isHighlight ? 0.08 * highlightOpacity : 0;
  const highlightBg = isHighlight ? withAlphaHex(accentColor, highlightTintAlpha) : "transparent";

  const bodyColor = getBodyTextColor(paletteMode, inkColor, ROW_FONT_SIZE);
  const fontWeight = isHighlight ? ROW_HIGHLIGHT_FONT_WEIGHT : ROW_DEFAULT_FONT_WEIGHT;

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `1.4fr repeat(${Math.max(0, columnCount - 1)}, 1fr)`,
        alignItems: "center",
        padding: `${ROW_PADDING_V}px ${ROW_PADDING_H}px`,
        opacity,
        transform: `translateX(${translateX}px)`,
        background: stripeBg,
      }}
    >
      {/* Highlight overlay layer (sits above stripe, beneath text) */}
      {isHighlight && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: highlightBg,
            pointerEvents: "none",
          }}
        />
      )}

      {values.map((cell, ci) => (
        <div
          key={`cell-${rowIndex}-${ci}`}
          style={{
            position: "relative",
            fontFamily: "Inter, sans-serif",
            fontWeight,
            fontSize: ROW_FONT_SIZE,
            color: bodyColor,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            textAlign: ci === 0 ? "left" : "right",
            fontVariantNumeric: ci === 0 ? "normal" : "tabular-nums",
            paddingLeft: ci === 0 ? 0 : 16,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {cell}
        </div>
      ))}
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const AnimatedTable9x16: React.FC<AnimatedTable9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  headers,
  rows,
  highlightRowIndex,
  rowStaggerSeconds,
  headerDelaySeconds,
  sourceCaption,
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

  // Title / subtitle fade-in (instant at frame 0, settles by ~0.3s).
  const titleFadeFrames = Math.round(0.3 * fps);
  const titleOpacity = interpolate(frame, [0, titleFadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleStartFrame = Math.round(0.15 * fps);
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStartFrame, subtitleStartFrame + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Header row fade-in over 0.3s at frame 0 (no horizontal slide).
  const headerOpacity = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Auto-shrink long titles/subtitles.
  const titleFontSize = title ? autoShrinkFont(title, TITLE_BASE_SIZE, 32, 44) : TITLE_BASE_SIZE;
  const subtitleFontSize = subtitle
    ? autoShrinkFont(subtitle, SUBTITLE_BASE_SIZE, 50, 28)
    : SUBTITLE_BASE_SIZE;

  // Per-row enter frames (after headerDelaySeconds, then staggered).
  const headerDelayFrames = Math.round(headerDelaySeconds * fps);
  const staggerFrames = Math.round(rowStaggerSeconds * fps);
  const rowFrames = rows.map((_, i) => headerDelayFrames + i * staggerFrames);

  // Each row's entry takes ~0.3s; the highlight tint fades in 0.2s AFTER that.
  const rowEntryFrames = Math.max(1, Math.round(0.3 * fps));
  const highlightInternalDelayFrames = rowEntryFrames + Math.round(0.2 * fps);

  // Source caption fades in 0.2s after all rows finish entering.
  const lastRowSettleFrame =
    rows.length > 0 ? rowFrames[rowFrames.length - 1] + rowEntryFrames : headerDelayFrames;
  const sourceFadeStart = lastRowSettleFrame + Math.round(0.2 * fps);
  const sourceOpacity = interpolate(
    frame,
    [sourceFadeStart, sourceFadeStart + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const columnCount = headers.length;

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

      {/* Title (optional) */}
      {title && (
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
            color: getBodyTextColor(palette, resolvedInk, titleFontSize),
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            padding: `0 ${(1080 - TITLE_MAX_WIDTH) / 2}px`,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
      )}

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

      {/* Table zone */}
      {columnCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: TABLE_TOP,
            left: TABLE_LEFT,
            width: TABLE_MAX_WIDTH,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `1.4fr repeat(${Math.max(0, columnCount - 1)}, 1fr)`,
              alignItems: "end",
              padding: `${HEADER_PADDING_V}px ${HEADER_PADDING_H}px`,
              borderBottom: `${HEADER_BORDER_WIDTH}px solid ${resolvedAccent}`,
              opacity: headerOpacity,
            }}
          >
            {headers.map((h, ci) => (
              <div
                key={`header-${ci}`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: HEADER_FONT_SIZE,
                  color: resolvedAccent,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textAlign: ci === 0 ? "left" : "right",
                  lineHeight: 1.2,
                  paddingLeft: ci === 0 ? 0 : 16,
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Body rows */}
          {rows.map((row, ri) => (
            <TableRow
              key={`row-${ri}`}
              values={row}
              isHighlight={ri === highlightRowIndex}
              enterFrame={rowFrames[ri]}
              highlightDelayFrames={highlightInternalDelayFrames}
              inkColor={resolvedInk}
              accentColor={resolvedAccent}
              mutedColor={resolvedMuted}
              paletteMode={palette}
              rowIndex={ri}
              columnCount={columnCount}
            />
          ))}
        </div>
      )}

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
            fontSize: 26,
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

      {/* Word-by-word captions in the bottom strip — opt-in (table is the focus) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 180,
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
