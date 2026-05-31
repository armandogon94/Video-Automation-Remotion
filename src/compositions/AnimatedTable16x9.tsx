/**
 * AnimatedTable16x9 — horizontal (1920×1080) port of `AnimatedTable9x16`.
 *
 * Same semantic primitive as the 9:16 source: a row-by-row stagger reveal of a
 * tabular comparison (X-vs-Y across multiple metrics), Bloomberg / FT style. The
 * first column is the row label (subject); the remaining columns are metric
 * values; an optional highlighted row calls out a "winner".
 *
 * Re-laid for landscape, NOT the vertical layout stretched: the wide 1920-px
 * canvas hosts a WIDER table (more metric columns sit comfortably), the table is
 * centered with generous side gutters, title/subtitle sit on a single top band
 * rather than stacked tall, and rows build in left-to-right with a subtle slide.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb16x9 (top-left, ~y=60)
 *   - Optional title (centered, Inter 700, auto-shrink for length, ~y=140)
 *   - Optional subtitle (centered, Inter 500 muted, ~y=230)
 *   - TABLE ZONE (centered, wide):
 *       · Header row: Inter 700 tracking-spaced uppercase, accent color, 2px
 *         accent bottom border.
 *       · Body rows: Inter 500 ink, padded, zebra stripe on odd rows.
 *       · First column: row labels, left-aligned.
 *       · Other columns: values, right-aligned (numerical comparison default).
 *       · Optional highlight row (winner): full-row accent tint, body weight 700.
 *   - Optional source caption (centered, Inter 400 muted)
 *   - Optional EditorialCaption strip (default false — table speaks for itself)
 *   - BrandWatermark16x9 (bottom-right)
 *
 * Motion grammar (preserved from the 9:16 source):
 *   - Header row fades in over 0.3s at frame 0.
 *   - Body row[i] enters at `headerDelaySeconds + rowStaggerSeconds * i` with
 *     opacity 0→1 + translateX -8→0 over 0.3s (subtle slide).
 *   - Highlight row's accent tint fades in 0.2s AFTER that row settles.
 *   - Source caption fades in 0.2s after all rows complete.
 *
 * Font defaults are 16:9-calibrated (ADR-001 §5.1): title lands smaller than the
 * vertically-dominant 9:16 value but punchy; header/row sizing tuned for the
 * wide canvas at long-form viewing distance.
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import type { PaletteMode } from "../brand";

// ─── Local schemas ──────────────────────────────────────────────────
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

// Local watermark schema (self-contained; does not touch shared schemas.ts).
const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(120),
  opacity: z.number().min(0).max(1).default(0.9),
});

export const animatedTable16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
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

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  /** Optional watermark in the bottom-right. */
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),

  // 16:9-calibrated font defaults (ADR-001 §5.1).
  titleFontSize: z.number().min(28).max(180).default(72),
  subtitleFontSize: z.number().min(20).max(90).default(40),
  headerFontSize: z.number().min(16).max(70).default(32),
  rowFontSize: z.number().min(18).max(90).default(40),
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AnimatedTable16x9Props = z.infer<typeof animatedTable16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────────
const CANVAS_W = 1920;

const TITLE_Y = 140;
const TITLE_MAX_WIDTH = 1500;

const SUBTITLE_Y = 240;
const SUBTITLE_MAX_WIDTH = 1400;

const TABLE_TOP = 360;
const TABLE_MAX_WIDTH = 1500;
const TABLE_LEFT = (CANVAS_W - TABLE_MAX_WIDTH) / 2; // = 210

const HEADER_PADDING_V = 16;
const HEADER_PADDING_H = 32;
const HEADER_BORDER_WIDTH = 2;

const ROW_PADDING_V = 22;
const ROW_PADDING_H = 32;
const ROW_HIGHLIGHT_FONT_WEIGHT = 700;
const ROW_DEFAULT_FONT_WEIGHT = 500;

const SOURCE_CAPTION_Y = 980;
const SOURCE_CAPTION_MAX_WIDTH = 1500;

// ─── Helpers ───────────────────────────────────────────────────────────

/** Crude auto-shrink: long titles step down per char over a threshold. */
function autoShrinkFont(
  text: string,
  baseSize: number,
  charsThreshold: number,
  minSize: number,
): number {
  if (text.length <= charsThreshold) return baseSize;
  const overshoot = text.length - charsThreshold;
  return Math.max(minSize, baseSize - overshoot * 1.5);
}

/**
 * Append an 8-bit alpha (00..FF) onto a 6-digit hex color (#RRGGBB) and return
 * the resulting #RRGGBBAA string. Falls back to the input untouched if it isn't
 * a clean hex (rgb()/named colors pass through — most callers feed hex).
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
  rowFontSize: number;
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
  rowFontSize,
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

  // Alternating zebra stripe on odd data rows.
  const isStriped = rowIndex % 2 === 1;
  const stripeBg = isStriped ? withAlphaHex(mutedColor, 0.05) : "transparent";

  // Highlight tint sits on TOP of the zebra stripe (additive).
  const highlightTintAlpha = isHighlight ? 0.08 * highlightOpacity : 0;
  const highlightBg = isHighlight
    ? withAlphaHex(accentColor, highlightTintAlpha)
    : "transparent";

  const bodyColor = getBodyTextColor(paletteMode, inkColor, rowFontSize);
  const fontWeight = isHighlight
    ? ROW_HIGHLIGHT_FONT_WEIGHT
    : ROW_DEFAULT_FONT_WEIGHT;

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
            fontFamily: FONT_STACKS.sans,
            fontWeight,
            fontSize: rowFontSize,
            color: bodyColor,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            textAlign: ci === 0 ? "left" : "right",
            fontVariantNumeric: ci === 0 ? "normal" : "tabular-nums",
            paddingLeft: ci === 0 ? 0 : 20,
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
export const AnimatedTable16x9: React.FC<AnimatedTable16x9Props> = ({
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
  watermark,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  titleFontSize,
  subtitleFontSize,
  headerFontSize,
  rowFontSize,
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

  // Auto-shrink long titles/subtitles (16:9 thresholds — wider canvas tolerates more chars).
  const resolvedTitleFontSize = title
    ? autoShrinkFont(title, titleFontSize, 44, Math.round(titleFontSize * 0.7))
    : titleFontSize;
  const resolvedSubtitleFontSize = subtitle
    ? autoShrinkFont(
        subtitle,
        subtitleFontSize,
        66,
        Math.round(subtitleFontSize * 0.75),
      )
    : subtitleFontSize;

  // Per-row enter frames (after headerDelaySeconds, then staggered).
  const headerDelayFrames = Math.round(headerDelaySeconds * fps);
  const staggerFrames = Math.round(rowStaggerSeconds * fps);
  const rowFrames = rows.map((_, i) => headerDelayFrames + i * staggerFrames);

  // Each row's entry takes ~0.3s; the highlight tint fades in 0.2s AFTER that.
  const rowEntryFrames = Math.max(1, Math.round(0.3 * fps));
  const highlightInternalDelayFrames = rowEntryFrames + Math.round(0.2 * fps);

  // Source caption fades in 0.2s after all rows finish entering.
  const lastRowSettleFrame =
    rows.length > 0
      ? rowFrames[rowFrames.length - 1] + rowEntryFrames
      : headerDelayFrames;
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
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay (cream uses multiply vignette, dark uses screen amber). */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
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
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: resolvedTitleFontSize,
            color: getBodyTextColor(palette, resolvedInk, resolvedTitleFontSize),
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            padding: `0 ${(CANVAS_W - TITLE_MAX_WIDTH) / 2}px`,
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
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: resolvedSubtitleFontSize,
            color: resolvedMuted,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            padding: `0 ${(CANVAS_W - SUBTITLE_MAX_WIDTH) / 2}px`,
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
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 700,
                  fontSize: headerFontSize,
                  color: resolvedAccent,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textAlign: ci === 0 ? "left" : "right",
                  lineHeight: 1.2,
                  paddingLeft: ci === 0 ? 0 : 20,
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
              rowFontSize={rowFontSize}
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
            fontFamily: FONT_STACKS.sans,
            fontWeight: 400,
            fontSize: 28,
            color: resolvedMuted,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            padding: `0 ${(CANVAS_W - SOURCE_CAPTION_MAX_WIDTH) / 2}px`,
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
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Bottom-right brand watermark (16:9 variant) */}
      <BrandWatermark16x9 style={watermark} />
    </AbsoluteFill>
  );
};

export default AnimatedTable16x9;
