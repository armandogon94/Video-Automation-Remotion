/**
 * BigNumberHorizontalBars16x9 — horizontal (1920×1080) consensus pattern M3
 * from Nate B Jones' "Security Stack / 18 modules" beat (FtCdYhspm7w ≈ t400s).
 *
 * Pattern (also relates to Hormozi's `GameStatPanel`):
 *   • LEFT half — one huge count-up number ("18") + small mono uppercase label
 *     ("MODULES") + optional sublabel.
 *   • RIGHT half — five stacked horizontal bars, each: mono category label · the
 *     bar fill · the per-row count, fill widths scaled to the heaviest row.
 *   • BELOW — optional bordered emphasis pill ("the security stack does it ALL")
 *     using <EmphasisPill> with one word in accent orange.
 *
 * Motion grammar:
 *   - Hero number on the LEFT counts up from 0 → value over `countDurationSeconds`
 *     (default 1.2s) using outQuart easing — the count-up "rolls" as the bars enter.
 *   - Bars on the RIGHT enter staggered `staggerFrames` apart (default 4 frames),
 *     using `staggerEntry({ accelerate: true })` so later rows arrive faster and
 *     the cascade doesn't drag.
 *   - Each bar's fill width interpolates from 0 → `(value/max) * containerWidth`
 *     over `fillDurationSeconds` (default 0.8s) with outQuart easing; the count
 *     value at the end of the fill rolls up via `countUp(...)` synced to the same
 *     window so the digits land as the fill stops.
 *   - The optional emphasis pill fades in after the last bar lands.
 *
 * Reference frames:
 *   references/creators/natebjones/FtCdYhspm7w/frames/vote1-anim-03-*.jpg
 * Reference clip:
 *   docs/research/wave-6/references/natebjones/FtCdYhspm7w-vote1-anim-03.mp4
 *
 * The `transitionVerb` field is metadata for the prompt-engineering pipeline
 * (animation-replication-runbook.md contract) — it travels with the schema so
 * downstream prompt generators describe the motion in imperative voice.
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
import { EmphasisPill } from "../components/TextEmphasis";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { countUp } from "../animation/countUp";
import { staggerEntry } from "../animation/staggeredCascade";
import { outQuart } from "../timing/easing";

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

// Local watermark schema (kept self-contained — does not touch shared
// src/compositions/schemas.ts).
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

const heroNumberSchema = z
  .object({
    value: z.number().default(18),
    label: z.string().default("MODULES"),
    sublabel: z.string().default(""),
    countDurationSeconds: z.number().default(1.2),
    prefix: z.string().default(""),
    suffix: z.string().default(""),
  })
  .default({
    value: 18,
    label: "MODULES",
    sublabel: "",
    countDurationSeconds: 1.2,
    prefix: "",
    suffix: "",
  });

const barSchema = z.object({
  label: z.string().default(""),
  value: z.number().default(0),
  suffix: z.string().default(""),
  color: z.string().default(""),
  /** Optional sub-label rendered under the category label. */
  sub: z.string().default(""),
});

const emphasisPillSchema = z
  .object({
    enabled: z.boolean().default(false),
    text: z.string().default(""),
    emphasisWords: z.array(z.string()).default([]),
    emphasisColor: z.string().default("#F2A555"),
  })
  .default({
    enabled: false,
    text: "",
    emphasisWords: [],
    emphasisColor: "#F2A555",
  });

export const bigNumberHorizontalBars16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Section eyebrow chip (mono tracked-uppercase) at top. */
  sectionLabel: z.string().default(""),

  /** Hero number on the LEFT side. */
  heroNumber: heroNumberSchema,

  /** Bars stacked on the RIGHT side. */
  bars: z
    .array(barSchema)
    .default([
      { label: "Auth", value: 5, suffix: "", color: "#F2A555", sub: "" },
      { label: "Tools", value: 4, suffix: "", color: "#5BC0E8", sub: "" },
      { label: "Memory", value: 3, suffix: "", color: "#7CE49A", sub: "" },
      { label: "Audit", value: 3, suffix: "", color: "#9A8FFF", sub: "" },
      { label: "Other", value: 3, suffix: "", color: "#8B847A", sub: "" },
    ]),

  /** Max value for bar scaling (default = max(bars.value)). */
  maxValue: z.number().optional(),

  /** Per-bar entry stagger in frames. Default 4. */
  staggerFrames: z.number().default(4),
  /** Bar fill duration in seconds. */
  fillDurationSeconds: z.number().default(0.8),
  /** First-bar enter time (seconds). The hero count-up shares this start. */
  firstBarEnterSeconds: z.number().default(0.5),

  /** Optional emphasis pill below bars. */
  emphasisPill: emphasisPillSchema,

  /** Optional watermark in the bottom-right. */
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),

  // Wave-5 contract — transitionVerb in imperative voice for prompt generators.
  transitionVerb: z
    .string()
    .default(
      "Hero number on the LEFT counts up from 0 to value over 1.2 seconds using outQuart easing while bars on the RIGHT enter staggered 4 frames apart; each bar's fill width interpolates from 0 to (value/max)*containerWidth over 0.8 seconds with outQuart easing, and the bar's count value rolls up via countUp synced to the fill window.",
    ),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(40),
  showCaptions: z.boolean().default(false),
});
export type BigNumberHorizontalBars16x9Props = z.infer<
  typeof bigNumberHorizontalBars16x9Schema
>;
type BarProp = z.infer<typeof barSchema>;

// ─── Layout constants ───────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

const SECTION_LABEL_Y = 80;

// LEFT-half hero (x: 0 .. 960)
const LEFT_HALF_W = 960;
const HERO_NUMBER_FONT_SIZE = 280;
const HERO_LABEL_FONT_SIZE = 32;
const HERO_SUBLABEL_FONT_SIZE = 24;
const HERO_CENTER_Y = 540;

// RIGHT-half bars (x: 960 .. 1920)
const BARS_LEFT_X = 1000; // 40px gutter inside the right half
const BARS_RIGHT_PADDING = 80;
const BARS_TOP = 200;
const BARS_BOTTOM = 900;
const BARS_ZONE_HEIGHT = BARS_BOTTOM - BARS_TOP;
const BARS_AVAILABLE_W = CANVAS_W - BARS_LEFT_X - BARS_RIGHT_PADDING; // 840

// Bar row internals
const BAR_LABEL_W = 200; // category label column
const BAR_LABEL_GAP = 20; // gap before the fill track starts
const BAR_VALUE_W = 110; // count value column (reserved at the right)
const BAR_TRACK_W =
  BARS_AVAILABLE_W - BAR_LABEL_W - BAR_LABEL_GAP - BAR_VALUE_W; // 510
const BAR_TRACK_HEIGHT = 56;

// Emphasis pill zone
const PILL_Y = 940;

// ─── Single horizontal bar row ──────────────────────────────────────
const BarRow: React.FC<{
  bar: BarProp;
  index: number;
  topPx: number;
  enterFrame: number;
  fillDurationFrames: number;
  maxValue: number;
  inkColor: string;
  paperColor: string;
  mutedColor: string;
  accentColor: string;
  paletteMode: (typeof ALL_PALETTE_MODES)[number];
}> = ({
  bar,
  index,
  topPx,
  enterFrame,
  fillDurationFrames,
  maxValue,
  inkColor,
  paperColor,
  mutedColor,
  accentColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Fill progress 0 → 1 over fillDurationFrames, eased outQuart.
  const fillProgressLinear = interpolate(
    localFrame,
    [0, Math.max(1, fillDurationFrames)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const fillProgressEased = outQuart(fillProgressLinear);

  // Fraction of the track width this bar fills at its FINAL value.
  const targetFraction =
    maxValue > 0 ? Math.max(0, Math.min(1, bar.value / maxValue)) : 0;
  const fillFraction = targetFraction * fillProgressEased;
  const fillPx = BAR_TRACK_W * fillFraction;

  // The value count rolls up over the same window as the fill so the digits
  // land the moment the fill stops moving (Carlos V4 prescription).
  const animatedValue = countUp(localFrame, {
    from: 0,
    to: bar.value,
    startFrame: 0,
    durationFrames: fillDurationFrames,
    easing: "outQuart",
    decimals: 0,
  });

  // Label/track fade-in over 3 frames so a row doesn't pop fully formed before
  // its fill has started moving.
  const rowOpacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fillColor = bar.color && bar.color.length > 0 ? bar.color : accentColor;
  const valueFontSize = 38;
  const labelFontSize = 32;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: BARS_LEFT_X,
        width: BARS_AVAILABLE_W,
        height: BAR_TRACK_HEIGHT,
        display: "flex",
        alignItems: "center",
        opacity: rowOpacity,
      }}
    >
      {/* Category label (mono tracked) */}
      <div
        style={{
          width: BAR_LABEL_W,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: BAR_LABEL_GAP,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: labelFontSize,
            color: getBodyTextColor(paletteMode, inkColor, labelFontSize),
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {bar.label}
        </div>
        {bar.sub && (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 18,
              color: mutedColor,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            {bar.sub}
          </div>
        )}
      </div>

      {/* Track + fill */}
      <div
        style={{
          position: "relative",
          width: BAR_TRACK_W,
          height: BAR_TRACK_HEIGHT,
        }}
      >
        {/* Track background — muted ~15% alpha */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${mutedColor}26`,
            borderRadius: 10,
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
            borderRadius: 10,
          }}
        />
      </div>

      {/* Count value at the end of the row (tabular nums, accent-ish) */}
      <div
        style={{
          width: BAR_VALUE_W,
          paddingLeft: 18,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: valueFontSize,
          color: getBodyTextColor(paletteMode, inkColor, valueFontSize),
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          textAlign: "left",
          whiteSpace: "nowrap",
        }}
      >
        {Math.round(animatedValue)}
        {bar.suffix}
      </div>
    </div>
  );
};

// ─── Section label (top eyebrow chip) ───────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterFrames = Math.round(0.35 * fps);
  const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, enterFrames], [-6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.mono,
        fontWeight: 700,
        fontSize: 28,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const BigNumberHorizontalBars16x9: React.FC<
  BigNumberHorizontalBars16x9Props
> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  heroNumber,
  bars,
  maxValue,
  staggerFrames,
  fillDurationSeconds,
  firstBarEnterSeconds,
  emphasisPill,
  watermark,
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

  // Frame budget for the staggered bar entry + hero count-up.
  const baseStartFrame = Math.round(firstBarEnterSeconds * fps);
  const fillDurationFrames = Math.max(1, Math.round(fillDurationSeconds * fps));
  const heroCountFrames = Math.max(
    1,
    Math.round(heroNumber.countDurationSeconds * fps),
  );

  // Per-bar entry frames — accelerating cascade so row 5 doesn't drag.
  const barEnterFrames = bars.map((_, i) =>
    staggerEntry({
      index: i,
      baseStartFrame,
      staggerFrames,
      accelerate: true,
    }),
  );

  // Bar-scaling max value.
  const computedMax =
    maxValue !== undefined && maxValue > 0
      ? maxValue
      : bars.reduce((m, b) => Math.max(m, b.value), 0);

  // Hero count-up — shares the first-bar start so the LEFT and RIGHT halves
  // come alive on the same beat. outQuart easing matches the bar fills.
  const heroValue = countUp(frame, {
    from: 0,
    to: heroNumber.value,
    startFrame: baseStartFrame,
    durationFrames: heroCountFrames,
    easing: "outQuart",
    decimals: 0,
  });
  const heroOpacity = interpolate(
    frame,
    [baseStartFrame - 6, baseStartFrame + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Emphasis pill fade-in — lands after the last bar finishes its fill so the
  // viewer's eye is freed to read it.
  const lastBarEnter =
    barEnterFrames.length > 0
      ? barEnterFrames[barEnterFrames.length - 1]
      : baseStartFrame;
  const pillEnterFrame = lastBarEnter + fillDurationFrames + Math.round(0.2 * fps);
  const pillFadeFrames = Math.max(1, Math.round(0.35 * fps));

  // Hero label color — keep mono label in muted so the count stays the focal point.
  const heroLabelColor = resolvedMuted;
  const heroSublabelColor = resolvedMuted;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={
            audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)
          }
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant — anchored top-left, not centered) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section eyebrow chip — mono tracked uppercase */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* LEFT half — hero count-up number */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: LEFT_HALF_W,
          height: CANVAS_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 40,
          opacity: heroOpacity,
        }}
      >
        {/* Hero centerline lives near y=540 — flex centering above gives us
            that without absolute positioning, which keeps the label group glued
            to the number even if the font auto-resizes. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // Nudge so the visual center of the number sits at HERO_CENTER_Y.
            transform: `translateY(${HERO_CENTER_Y - CANVAS_H / 2}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: HERO_NUMBER_FONT_SIZE,
              color: resolvedAccent,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {heroNumber.prefix}
            {Math.round(heroValue)}
            {heroNumber.suffix}
          </div>
          {heroNumber.label && (
            <div
              style={{
                marginTop: 28,
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: HERO_LABEL_FONT_SIZE,
                color: heroLabelColor,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              {heroNumber.label}
            </div>
          )}
          {heroNumber.sublabel && (
            <div
              style={{
                marginTop: 10,
                fontFamily: FONT_STACKS.sans,
                fontWeight: 500,
                fontSize: HERO_SUBLABEL_FONT_SIZE,
                color: heroSublabelColor,
                letterSpacing: "0.02em",
              }}
            >
              {heroNumber.sublabel}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT half — stacked horizontal bars */}
      {(() => {
        const n = bars.length;
        if (n === 0) return null;
        // Distribute n bars evenly across BARS_TOP..BARS_BOTTOM. Each row sits
        // at the center of its slice, so the first row centerline is at
        // BARS_TOP + sliceHeight/2 and rows are sliceHeight apart.
        const sliceHeight = BARS_ZONE_HEIGHT / n;
        return bars.map((bar, i) => {
          const rowCenter = BARS_TOP + sliceHeight * (i + 0.5);
          const topPx = Math.round(rowCenter - BAR_TRACK_HEIGHT / 2);
          return (
            <BarRow
              key={`bar-${i}`}
              bar={bar}
              index={i}
              topPx={topPx}
              enterFrame={barEnterFrames[i]}
              fillDurationFrames={fillDurationFrames}
              maxValue={computedMax}
              inkColor={resolvedInk}
              paperColor={resolvedPaper}
              mutedColor={resolvedMuted}
              accentColor={resolvedAccent}
              paletteMode={palette}
            />
          );
        });
      })()}

      {/* Optional emphasis pill below the bars (Nate B Jones M10) */}
      {emphasisPill.enabled && emphasisPill.text && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: PILL_Y,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <EmphasisPill
            text={emphasisPill.text}
            emphasisWords={emphasisPill.emphasisWords}
            emphasisColor={
              emphasisPill.emphasisColor && emphasisPill.emphasisColor.length > 0
                ? emphasisPill.emphasisColor
                : resolvedAccent
            }
            baseColor={getBodyTextColor(palette, resolvedInk, 36)}
            borderColor={`${resolvedMuted}55`}
            background="transparent"
            fontSize={36}
            fontWeight={700}
            paddingX={36}
            paddingY={18}
            maxWidthPx={1400}
            enterFrame={pillEnterFrame}
            fadeInFrames={pillFadeFrames}
          />
        </div>
      )}

      {/* Optional word-by-word captions in the bottom third (gated) */}
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
