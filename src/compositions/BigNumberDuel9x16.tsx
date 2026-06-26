/**
 * BigNumberDuel9x16 — vertical (1080×1920) two-column big-number comparison.
 *
 * Wave-4 inspiration: @carloscuamatzin's T14 BigNumberDuel — the "X vs Y"
 * archetype rendered as two enormous figures sitting side-by-side, each with
 * its own label + source attribution, separated by a tiny serif "vs".
 *
 * Use for paired magnitudes where the COMPARISON is the story:
 *   - "$0.25" (us) vs "$3.50" (them)
 *   - "2.4s" (Sonnet 4.6) vs "12.1s" (GPT-5)
 *   - "92%" (Claude) vs "67%" (Gemini)
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional sectionLabel (~y=200, Inter 700 ~28px tracking-spaced accent)
 *   - LEFT column @ x ~30..550, vertically centered
 *   - "vs" centered between the two columns in serif italic (~80px)
 *   - RIGHT column @ x ~530..1050, vertically centered
 *   - Optional conclusionLine across the bottom (~y=1380)
 *   - Optional EditorialCaption (default false — two numbers already compete)
 *
 * Each column contains (top → bottom inside the column):
 *   - Optional small brandLogo + sourceIcon row (~70×70 logo)
 *   - The HUGE number (Inter 900 ~220px, count-up via `countUp`)
 *   - Label (Inter 700 ~42px, 1 line)
 *   - Optional tagline (Inter 500 ~28px muted)
 *
 * Motion grammar:
 *   - Left column wipes IN FROM LEFT — translateX(-160 → 0) + fade 0→1 over 0.4s
 *     starting at `enterLeftSeconds`.
 *   - Right column wipes IN FROM RIGHT — translateX(160 → 0) + fade 0→1 over 0.4s
 *     starting at `enterRightSeconds`.
 *   - Both numbers count up from 0 → value over `countDurationSeconds` from the
 *     moment their column wipe completes, using `countUp` + `formatCount` from
 *     src/animation (outQuart easing — Carlos V4 prescription).
 *   - "vs" separator fades in once BOTH columns have landed.
 *   - Conclusion line fades in 0.3s after the slower column finishes counting.
 */
import React from "react";
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
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, getBodyTextColor } from "../brand";
import type { PaletteMode } from "../brand";
import { countUp, formatCount } from "../animation";

// ─── Schema ────────────────────────────────────────────────────────
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

const duelSideSchema = z.object({
  /** Numeric value (used for count-up). */
  value: z.number(),
  /** Optional prefix (e.g. "$"). Rendered in accent at ~55% number size. */
  prefix: z.string().default(""),
  /** Optional suffix (e.g. "%", "×", "s", "ms"). Rendered in accent at ~65% number size. */
  suffix: z.string().default(""),
  /** Decimals to display on the count-up. Default 0. */
  decimals: z.number().int().min(0).max(4).default(0),
  /** Bold one-line label under the number (e.g. "Sonnet 4.6"). */
  label: z.string().default(""),
  /** Optional muted secondary line under the label (e.g. "$0.25 / 1M tokens"). */
  tagline: z.string().default(""),
  /** Optional path/URL to a small monogram icon (~40px) shown above the number. */
  sourceIcon: z.string().default(""),
  /** Optional per-side accent override (defaults to composition accent / muted). */
  accentColor: z.string().default(""),
  /** Optional path/URL to a brand logo (~70px square) shown alongside sourceIcon. */
  brandLogo: z.string().default(""),
});
export type DuelSide = z.infer<typeof duelSideSchema>;

export const bigNumberDuel9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Optional section eyebrow shown above the two columns. */
  sectionLabel: z.string().default(""),
  left: duelSideSchema,
  right: duelSideSchema,
  /** When true, renders a serif italic "vs" centered between the columns. */
  vsSeparator: z.boolean().default(true),
  /** Optional bottom verdict line (e.g. "14× cheaper, same accuracy"). */
  conclusionLine: z.string().default(""),
  /** Wall-clock seconds at which the LEFT column begins wiping in. */
  enterLeftSeconds: z.number().min(0).max(20).default(0.4),
  /** Wall-clock seconds at which the RIGHT column begins wiping in. */
  enterRightSeconds: z.number().min(0).max(20).default(0.7),
  /** Duration (seconds) of the count-up ramp for both numbers. */
  countDurationSeconds: z.number().min(0.2).max(8).default(1.0),
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
export type BigNumberDuel9x16Props = z.infer<typeof bigNumberDuel9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const SECTION_LABEL_Y = 200;

// Two fixed columns separated by a clear center gutter so the two figures
// can NEVER touch (and the "vs" divider always has breathing room around it).
// Canvas is 1080 wide; the gutter is centered on x=540 where "vs" sits.
const CENTER_GUTTER = 120; // clear horizontal channel down the middle
const COLUMN_WIDTH = (1080 - CENTER_GUTTER) / 2 - 20; // 460 — leaves 20px outer margin each side
const COLUMN_HEIGHT = 900;
const COLUMN_TOP = (1920 - COLUMN_HEIGHT) / 2; // 510
const LEFT_COLUMN_LEFT = 20;
const RIGHT_COLUMN_LEFT = 1080 - 20 - COLUMN_WIDTH; // 600 — symmetric right margin

const NUMBER_BASE_SIZE = 200;
// Hard cap on the figure block (prefix + number + suffix). Kept comfortably
// inside the column so the rendered string never bleeds into the gutter.
const NUMBER_MAX_WIDTH = COLUMN_WIDTH - 24;
const LABEL_FONT_SIZE = 42;
const TAGLINE_FONT_SIZE = 28;

const VS_SIZE = 80;
const VS_Y = COLUMN_TOP + COLUMN_HEIGHT / 2 - VS_SIZE / 2;

const CONCLUSION_Y = 1380;
const CONCLUSION_MAX_WIDTH = 920;

const ENTER_DURATION_SECONDS = 0.4;

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Auto-shrink the number font when the FULL figure (prefix + number + suffix)
 * is wide. `glyphCount` is the total visible character count including any
 * prefix/suffix — prefix/suffix render smaller, but counting them keeps a safe
 * margin so the figure never spills into the center gutter.
 */
function fitNumberFontSize(glyphCount: number, base: number, maxChars: number): number {
  if (glyphCount <= maxChars) return base;
  const ratio = maxChars / glyphCount;
  return Math.max(110, Math.round(base * ratio));
}

// ─── Side column ───────────────────────────────────────────────────
const DuelColumn: React.FC<{
  side: DuelSide;
  leftPx: number;
  enterSeconds: number;
  countDurationSeconds: number;
  fromDirection: "left" | "right";
  inkColor: string;
  mutedColor: string;
  accentColor: string;
  paletteMode: PaletteMode;
}> = ({
  side,
  leftPx,
  enterSeconds,
  countDurationSeconds,
  fromDirection,
  inkColor,
  mutedColor,
  accentColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterStartFrame = Math.round(enterSeconds * fps);
  const enterDurationFrames = Math.round(ENTER_DURATION_SECONDS * fps);

  // Editorial spring matches BigNumberHero's settle DNA.
  const enterLocal = Math.max(0, frame - enterStartFrame);
  const enterSpring = spring({
    frame: enterLocal,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const enterOpacity = interpolate(
    enterLocal,
    [0, enterDurationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const enterDx = interpolate(
    enterSpring,
    [0, 1],
    [fromDirection === "left" ? -160 : 160, 0],
  );

  // Count-up starts at the moment the wipe completes.
  const countStartFrame = enterStartFrame + enterDurationFrames;
  const countDurationFrames = Math.round(countDurationSeconds * fps);
  const liveValue = countUp(frame, {
    from: 0,
    to: side.value,
    startFrame: countStartFrame,
    durationFrames: countDurationFrames,
    easing: "outQuart",
    decimals: side.decimals,
  });

  const renderedNumber = formatCount(liveValue, {
    decimals: side.decimals,
    thousands: true,
  });

  // Wide figures auto-shrink so they don't overflow the column / touch the
  // gutter. Count prefix + figure + suffix so "$0.25" (5 glyphs) shrinks too —
  // the previous fitter saw only "0.25" (4) and let the "$" bleed center.
  const numberLen = renderedNumber.length + (side.prefix ? 1 : 0) + (side.suffix ? 1 : 0);
  const numberFontSize = fitNumberFontSize(numberLen, NUMBER_BASE_SIZE, 4);
  const prefixSize = Math.round(numberFontSize * 0.55);
  const suffixSize = Math.round(numberFontSize * 0.65);

  // The per-side accent override (e.g. "loser" gets muted) — falls back to comp accent.
  const sideAccent =
    side.accentColor && side.accentColor.length > 0 ? side.accentColor : accentColor;

  return (
    <div
      style={{
        position: "absolute",
        top: COLUMN_TOP,
        left: leftPx,
        width: COLUMN_WIDTH,
        height: COLUMN_HEIGHT,
        opacity: enterOpacity,
        transform: `translateX(${enterDx}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* Optional brand-logo + source-icon row */}
      {(side.brandLogo || side.sourceIcon) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 28,
            height: 70,
          }}
        >
          {side.brandLogo && (
            <img
              src={
                side.brandLogo.startsWith("http")
                  ? side.brandLogo
                  : staticFile(side.brandLogo)
              }
              alt=""
              style={{ width: 70, height: 70, objectFit: "contain" }}
            />
          )}
          {side.sourceIcon && (
            <img
              src={
                side.sourceIcon.startsWith("http")
                  ? side.sourceIcon
                  : staticFile(side.sourceIcon)
              }
              alt=""
              style={{ width: 40, height: 40, objectFit: "contain", opacity: 0.7 }}
            />
          )}
        </div>
      )}

      {/* THE NUMBER — prefix · figure · suffix */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          maxWidth: NUMBER_MAX_WIDTH,
          lineHeight: 0.92,
        }}
      >
        {side.prefix && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: prefixSize,
              color: sideAccent,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              marginRight: 6,
              marginTop: Math.round((numberFontSize - prefixSize) * 0.18),
            }}
          >
            {side.prefix}
          </span>
        )}
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: numberFontSize,
            color: inkColor,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {renderedNumber}
        </span>
        {side.suffix && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: suffixSize,
              color: sideAccent,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              marginLeft: 8,
              marginTop: Math.round((numberFontSize - suffixSize) * 0.12),
            }}
          >
            {side.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      {side.label && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: LABEL_FONT_SIZE,
            color: getBodyTextColor(paletteMode, inkColor, LABEL_FONT_SIZE),
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginTop: 36,
            maxWidth: COLUMN_WIDTH - 20,
          }}
        >
          {side.label}
        </div>
      )}

      {/* Tagline */}
      {side.tagline && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: TAGLINE_FONT_SIZE,
            color: mutedColor,
            lineHeight: 1.25,
            letterSpacing: "0.005em",
            marginTop: 16,
            maxWidth: COLUMN_WIDTH - 20,
          }}
        >
          {side.tagline}
        </div>
      )}

      {/* Silence the unused-var lint for numberLen — kept for future overflow tuning. */}
      <span style={{ display: "none" }}>{numberLen}</span>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────
export const BigNumberDuel9x16: React.FC<BigNumberDuel9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  left,
  right,
  vsSeparator,
  conclusionLine,
  enterLeftSeconds,
  enterRightSeconds,
  countDurationSeconds,
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

  // "vs" separator fades in once both columns have landed.
  const bothLandedFrame = Math.round(
    Math.max(enterLeftSeconds, enterRightSeconds) * fps + ENTER_DURATION_SECONDS * fps,
  );
  const vsOpacity = interpolate(
    frame,
    [bothLandedFrame, bothLandedFrame + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Section label fades in at frame 0.
  const sectionOpacity = interpolate(frame, [0, Math.round(0.4 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Conclusion line: appears 0.3s after the slower column finishes counting.
  const slowerCountFinishFrame = Math.round(
    Math.max(enterLeftSeconds, enterRightSeconds) * fps +
      ENTER_DURATION_SECONDS * fps +
      countDurationSeconds * fps,
  );
  const conclusionFadeStart = slowerCountFinishFrame + Math.round(0.3 * fps);
  const conclusionOpacity = interpolate(
    frame,
    [conclusionFadeStart, conclusionFadeStart + Math.round(0.4 * fps)],
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

      {/* Section label (eyebrow) */}
      {sectionLabel && (
        <div
          style={{
            position: "absolute",
            top: SECTION_LABEL_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            color: resolvedAccent,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            opacity: sectionOpacity,
          }}
        >
          {sectionLabel}
        </div>
      )}

      {/* LEFT column */}
      <DuelColumn
        side={left}
        leftPx={LEFT_COLUMN_LEFT}
        enterSeconds={enterLeftSeconds}
        countDurationSeconds={countDurationSeconds}
        fromDirection="left"
        inkColor={resolvedInk}
        mutedColor={resolvedMuted}
        accentColor={resolvedAccent}
        paletteMode={palette}
      />

      {/* RIGHT column */}
      <DuelColumn
        side={right}
        leftPx={RIGHT_COLUMN_LEFT}
        enterSeconds={enterRightSeconds}
        countDurationSeconds={countDurationSeconds}
        fromDirection="right"
        inkColor={resolvedInk}
        mutedColor={resolvedMuted}
        accentColor={resolvedAccent}
        paletteMode={palette}
      />

      {/* "vs" separator */}
      {vsSeparator && (
        <div
          style={{
            position: "absolute",
            top: VS_Y,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Playfair Display, Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: VS_SIZE,
            color: resolvedMuted,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            opacity: vsOpacity,
            pointerEvents: "none",
          }}
        >
          vs
        </div>
      )}

      {/* Conclusion line */}
      {conclusionLine && (
        <div
          style={{
            position: "absolute",
            top: CONCLUSION_Y,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 48,
            color: getBodyTextColor(palette, resolvedInk, 48),
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            padding: `0 ${(1080 - CONCLUSION_MAX_WIDTH) / 2}px`,
            opacity: conclusionOpacity,
          }}
        >
          {conclusionLine}
        </div>
      )}

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
