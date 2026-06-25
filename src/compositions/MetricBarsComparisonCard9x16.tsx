/**
 * MetricBarsComparisonCard9x16 — data-dense multi-metric comparison stack.
 *
 * Derived from @CodingFab "Language Insights" reel (references/creators/codingfab/
 * EePNWETYVYA/frames/, ≈ frame-02 t12.30s). The source layout is a vertical stack
 * of contender CARDS, where each card carries:
 *   - an eyebrow chip + bold contender name (left) and a small meta line (right),
 *   - a GRID of 4–7 labeled horizontal metric bars
 *     (left label · gradient fill · right-aligned numeric score), and
 *   - a use-case PILL row pinned to the bottom of the card.
 *
 * This is DENSER than our single-series ModelComparisonGrid2x2 / BenchmarkBars
 * (those plot one bar per row across one card). Here every card is its own
 * multi-bar mini-chart, so two contenders sit one above the other and the eye
 * reads them as parallel profiles.
 *
 * Rebrand: the CodingFab cyan/blue is replaced with our brand spine — navy
 * paper, gold card glow + score numerals — while an optional accentColor (default
 * CodingFab cyan #00D9A3) tints the bar fills so the "compare profiles" energy of
 * the source survives. Brand gold stays the structural border/score spine.
 *
 * Motion grammar (stagger reveals via spring()/interpolate()):
 *   - Title + subtitle fade/slide in at frame 0.
 *   - Cards enter SEQUENTIALLY: card[c] starts at cardEnterStagger frames after
 *     the previous, sliding up (translateY 28 → 0) + fading in.
 *   - Inside each card, bars fill left→right over ~0.6s, staggered per-row by
 *     barRowStagger frames after the card lands. Score numerals pop in once the
 *     fill reaches ≥92% of its target.
 *   - Use-case pills fade up after that card's bars finish.
 *
 * Palette prop: defaults to "dark" (brand navy spine, matching the source's dark
 * UI); "cream" is the light variant. Any of the 5 brand palette modes is accepted.
 *
 * GOTCHA honoured: no background-clip:text + transparent color anywhere — all
 * hero/score text uses SOLID colors so headless Chromium renders it correctly.
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { outCubic } from "../timing/easing";

// ─── Local schemas ──────────────────────────────────────────────────
const wordTimingSchema_local = z.object({
  text: z.string().default(""),
  startFrame: z.number().default(0),
  endFrame: z.number().default(0),
  startSeconds: z.number().default(0),
  endSeconds: z.number().default(0),
});

const breadcrumbSchema_local = z.object({
  text: z.string().default(""),
  date: z.string().default(""),
});

const metricBarSchema = z.object({
  /** Row label on the left, e.g. "AI/ML Strength". */
  label: z.string().default(""),
  /** Numeric score for this row. */
  value: z.number().default(0),
  /** Denominator the fill is measured against (e.g. 5 → "X/5", 100 → "X/100"). */
  max: z.number().default(5),
});
export type MetricBar = z.infer<typeof metricBarSchema>;

const contenderSchema = z.object({
  /** Contender headline name, e.g. "Python". */
  name: z.string().default(""),
  /** Small eyebrow chip above the name, e.g. "DYNAMIC · 1991". Empty = hidden. */
  eyebrow: z.string().default(""),
  /** Right-aligned meta line in the card header, e.g. "Born 1991". Empty = hidden. */
  meta: z.string().default(""),
  /** The 4–7 metric bars rendered as the card's mini-chart. */
  bars: z.array(metricBarSchema).default([]),
  /** Use-case pill row at the bottom of the card. */
  useCases: z.array(z.string()).default([]),
  /** Optional per-contender fill color override (empty = use accentColor). */
  color: z.string().default(""),
});
export type Contender = z.infer<typeof contenderSchema>;

export const metricBarsComparisonCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Top headline shown above the contender cards. */
  title: z.string().default("Language Insights"),
  /** Optional subtitle under the title. */
  subtitle: z.string().default("Comparing 2 languages side-by-side."),
  /** Section eyebrow chip (uppercase tracked). Empty = hidden. */
  sectionLabel: z.string().default(""),

  /** The contender cards (2–3 recommended), each a multi-bar mini-chart. */
  items: z
    .array(contenderSchema)
    .default([
      {
        name: "Python",
        eyebrow: "DYNAMIC",
        meta: "Born 1991",
        bars: [
          { label: "AI/ML Strength", value: 5, max: 5 },
          { label: "Web Strength", value: 4, max: 5 },
          { label: "Systems Strength", value: 2, max: 5 },
          { label: "Mobile Strength", value: 2, max: 5 },
          { label: "Enterprise", value: 4, max: 5 },
          { label: "Performance", value: 2, max: 5 },
          { label: "Learning Curve", value: 1, max: 5 },
        ],
        useCases: ["AI", "Data Science", "Backend", "Research"],
        color: "",
      },
      {
        name: "JavaScript",
        eyebrow: "DYNAMIC",
        meta: "Born 1995",
        bars: [
          { label: "AI/ML Strength", value: 3, max: 5 },
          { label: "Web Strength", value: 5, max: 5 },
          { label: "Systems Strength", value: 1, max: 5 },
          { label: "Mobile Strength", value: 3, max: 5 },
          { label: "Enterprise", value: 3, max: 5 },
          { label: "Performance", value: 3, max: 5 },
          { label: "Learning Curve", value: 2, max: 5 },
        ],
        useCases: ["Web", "Frontend", "Fullstack", "Apps"],
        color: "",
      },
    ]),

  /** Frames before the FIRST card enters. */
  firstCardEnterFrames: z.number().default(12),
  /** Frames between consecutive card entries. */
  cardEnterStagger: z.number().default(18),
  /** Per-row bar-fill stagger (frames) within a card, after the card lands. */
  barRowStagger: z.number().default(5),
  /** Bar-fill animation duration in seconds. */
  barAnimSeconds: z.number().default(0.6),

  // Metadata for the prompt-engineering pipeline — imperative-voice motion note.
  // Does not drive runtime behavior; travels with the schema for downstream
  // prompt generators.
  transitionVerb: z
    .string()
    .default(
      "Two contender cards slide up one-at-a-time (translateY 28 → 0). Inside each card, a grid of labeled horizontal bars fills left→right over 0.6s, staggered row-by-row, with the numeric score popping in as each fill lands; a use-case pill row fades up last.",
    ),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  /** Default surface = brand navy ("dark") to mirror the source's dark UI while
   *  keeping the gold/navy brand spine. Use "cream" for the light variant. */
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  /** Bar-fill accent. Empty sentinel = CodingFab cyan #00D9A3 (the source vibe).
   *  Brand gold remains the card border/score spine regardless. */
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(false),
});
export type MetricBarsComparisonCard9x16Props = z.infer<
  typeof metricBarsComparisonCard9x16Schema
>;

// ─── Layout constants ───────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

const BREADCRUMB_Y = 80;
const SECTION_LABEL_Y = 168;
const TITLE_Y = 222;

// Cards zone
const CARDS_TOP_Y = 470;
const CARDS_BOTTOM_Y = 1820;
const CARDS_ZONE_HEIGHT = CARDS_BOTTOM_Y - CARDS_TOP_Y;
const CARD_W = 960;
const CARD_LEFT = (FRAME_W - CARD_W) / 2;
const CARD_GAP = 36;
const CARD_PAD_X = 48;
const CARD_PAD_TOP = 40;
const CARD_PAD_BOTTOM = 36;

// Card header
const CARD_HEADER_H = 132;

// Bar rows
const BAR_LABEL_W = 360;
const BAR_LABEL_GAP = 20;
const BAR_SCORE_W = 96;
const BAR_TRACK_H = 16;
const BAR_VALUE_THRESHOLD = 0.92;

// Pills
const PILL_ROW_H = 70;

// CodingFab cyan — the optional source-faithful accent default.
const CODINGFAB_CYAN = "#00D9A3";

// ─── helpers ────────────────────────────────────────────────────────
function isDarkSurface(mode: PaletteMode): boolean {
  return mode === "dark" || mode === "warm-black" || mode === "true-black";
}

/** Per-row vertical step inside a card given how many bars it carries. */
function barRowStep(barCount: number, available: number): number {
  if (barCount <= 0) return 0;
  return available / barCount;
}

// ─── Section eyebrow ────────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: CARD_LEFT,
        width: CARD_W,
        textAlign: "left",
        fontFamily: FONT_STACKS.sans,
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

// ─── Title + subtitle ───────────────────────────────────────────────
const TitleBlock: React.FC<{
  title: string;
  subtitle: string;
  inkColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
}> = ({ title, subtitle, inkColor, mutedColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: CARD_LEFT,
        width: CARD_W,
        textAlign: "left",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: 88,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          color: getBodyTextColor(paletteMode, inkColor, 88),
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: 38,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
            color: mutedColor,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ─── Single metric bar row ──────────────────────────────────────────
const MetricBarRow: React.FC<{
  bar: MetricBar;
  topPx: number;
  /** Frame (composition-relative) at which this row begins filling. */
  enterFrame: number;
  barAnimFrames: number;
  fillColor: string;
  trackColor: string;
  labelColor: string;
  scoreColor: string;
}> = ({
  bar,
  topPx,
  enterFrame,
  barAnimFrames,
  fillColor,
  trackColor,
  labelColor,
  scoreColor,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - enterFrame;

  const safeMax = bar.max > 0 ? bar.max : 1;
  const targetFraction = Math.max(0, Math.min(1, bar.value / safeMax));

  const fillProgressLinear = interpolate(localFrame, [0, barAnimFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillProgress = outCubic(fillProgressLinear);
  const fillFraction = targetFraction * fillProgress;

  const labelOpacity = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Score numeral pops in once the fill nears its target.
  const scoreVisible = fillProgress >= BAR_VALUE_THRESHOLD;
  const scoreStart = Math.round(barAnimFrames * BAR_VALUE_THRESHOLD);
  const scoreOpacity = interpolate(localFrame, [scoreStart, scoreStart + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Integer scores render clean; fractional scores keep one decimal.
  const valueText = Number.isInteger(bar.value)
    ? `${bar.value}/${safeMax}`
    : `${bar.value.toFixed(1)}/${safeMax}`;

  const trackW = CARD_W - 2 * CARD_PAD_X - BAR_LABEL_W - BAR_LABEL_GAP - BAR_SCORE_W;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: CARD_PAD_X,
        right: CARD_PAD_X,
        height: 44,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Label */}
      <div
        style={{
          width: BAR_LABEL_W,
          paddingRight: BAR_LABEL_GAP,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: labelColor,
          opacity: labelOpacity,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {bar.label}
      </div>

      {/* Track + fill */}
      <div
        style={{
          position: "relative",
          width: trackW,
          height: BAR_TRACK_H,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: trackColor,
            borderRadius: BAR_TRACK_H / 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: trackW * fillFraction,
            background: fillColor,
            borderRadius: BAR_TRACK_H / 2,
            boxShadow: `0 0 16px ${fillColor}66`,
          }}
        />
      </div>

      {/* Score numeral (right-aligned, brand-gold spine) */}
      <div
        style={{
          width: BAR_SCORE_W,
          textAlign: "right",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          color: scoreColor,
          opacity: scoreVisible ? scoreOpacity : 0,
          whiteSpace: "nowrap",
        }}
      >
        {valueText}
      </div>
    </div>
  );
};

// ─── Use-case pill row ──────────────────────────────────────────────
const PillRow: React.FC<{
  pills: string[];
  topPx: number;
  enterFrame: number;
  accentColor: string;
  inkColor: string;
  paletteMode: PaletteMode;
}> = ({ pills, topPx, enterFrame, accentColor, inkColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 24, stiffness: 150, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  const dark = isDarkSurface(paletteMode);
  const pillBg = dark ? `${accentColor}1F` : `${accentColor}14`;
  const pillBorder = `${accentColor}66`;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: CARD_PAD_X,
        right: CARD_PAD_X,
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {pills.map((pill, i) => (
        <div
          key={`pill-${i}`}
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            background: pillBg,
            border: `1.5px solid ${pillBorder}`,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.01em",
            color: dark ? accentColor : getBodyTextColor(paletteMode, inkColor, 26),
          }}
        >
          {pill}
        </div>
      ))}
    </div>
  );
};

// ─── Single contender card ──────────────────────────────────────────
const ContenderCard: React.FC<{
  item: Contender;
  topPx: number;
  heightPx: number;
  cardEnterFrame: number;
  barRowStagger: number;
  barAnimFrames: number;
  inkColor: string;
  accentColor: string;
  goldColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
}> = ({
  item,
  topPx,
  heightPx,
  cardEnterFrame,
  barRowStagger,
  barAnimFrames,
  inkColor,
  accentColor,
  goldColor,
  mutedColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - cardEnterFrame,
    fps,
    config: { damping: 26, stiffness: 120, mass: 0.9 },
  });
  if (frame < cardEnterFrame) return null;
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [28, 0]);

  const dark = isDarkSurface(paletteMode);
  const fillColor =
    item.color && item.color.length > 0 ? item.color : accentColor;

  // Card surface: a touch lighter than the navy paper on dark, white on cream.
  const cardBg = dark ? "#101A2E" : "#FFFFFF";
  const trackColor = dark ? `${mutedColor}33` : `${mutedColor}26`;

  // Glowing brand-gold border (the source uses a glowing card outline).
  const cardShadow = `0 0 0 2px ${goldColor}, 0 0 38px ${goldColor}3A, 0 18px 50px rgba(0,0,0,0.35)`;

  // ── Internal vertical layout of the card ──
  const barsTop = CARD_PAD_TOP + CARD_HEADER_H;
  const pillsBlockH = item.useCases.length > 0 ? PILL_ROW_H + 22 : 0;
  const barsZone = heightPx - barsTop - CARD_PAD_BOTTOM - pillsBlockH;
  const step = barRowStep(item.bars.length, barsZone);
  const barsLandFrame =
    cardEnterFrame +
    Math.max(0, item.bars.length - 1) * barRowStagger +
    barAnimFrames;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: CARD_LEFT,
        width: CARD_W,
        height: heightPx,
        background: cardBg,
        borderRadius: 28,
        boxShadow: cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
        overflow: "hidden",
      }}
    >
      {/* Card header — eyebrow + name (left), meta (right) */}
      <div
        style={{
          position: "absolute",
          top: CARD_PAD_TOP,
          left: CARD_PAD_X,
          right: CARD_PAD_X,
          height: CARD_HEADER_H,
        }}
      >
        {item.eyebrow && (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: accentColor,
              marginBottom: 8,
            }}
          >
            {item.eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: 60,
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: getBodyTextColor(paletteMode, inkColor, 60),
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.name}
          </div>
          {item.meta && (
            <div
              style={{
                flex: "0 0 auto",
                fontFamily: FONT_STACKS.mono,
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: "0.02em",
                color: mutedColor,
                whiteSpace: "nowrap",
              }}
            >
              {item.meta}
            </div>
          )}
        </div>
      </div>

      {/* Metric bars grid */}
      {item.bars.map((bar, i) => (
        <MetricBarRow
          key={`bar-${i}`}
          bar={bar}
          topPx={barsTop + i * step + (step - 44) / 2}
          enterFrame={cardEnterFrame + i * barRowStagger}
          barAnimFrames={barAnimFrames}
          fillColor={fillColor}
          trackColor={trackColor}
          labelColor={mutedColor}
          scoreColor={goldColor}
        />
      ))}

      {/* Use-case pills */}
      {item.useCases.length > 0 && (
        <PillRow
          pills={item.useCases}
          topPx={heightPx - CARD_PAD_BOTTOM - PILL_ROW_H}
          enterFrame={barsLandFrame}
          accentColor={accentColor}
          inkColor={inkColor}
          paletteMode={paletteMode}
        />
      )}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const MetricBarsComparisonCard9x16: React.FC<
  MetricBarsComparisonCard9x16Props
> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  sectionLabel,
  items,
  firstCardEnterFrames,
  cardEnterStagger,
  barRowStagger,
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
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const surfaceMode: "cream" | "dark" = isDarkSurface(palette as PaletteMode)
    ? "dark"
    : "cream";

  // Brand-gold spine: card border + score numerals always speak brand gold,
  // regardless of the (cyan) bar-fill accent. Pull it from the palette's accent
  // on dark/true-black modes (gold), else use the hard brand gold.
  const goldColor =
    palette === "dark" || palette === "true-black"
      ? getPalette(palette as PaletteMode).accent
      : "#D4AF37";

  // Bar-fill accent. Order: explicit override > subjectTool tint > CodingFab cyan.
  const fillAccent = accentColor
    ? colors.accent
    : subjectTool
      ? getToolAccentForSurface(subjectTool, surfaceMode)
      : CODINGFAB_CYAN;

  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette as PaletteMode).grainOverlay;

  // ── Card stack layout ──
  const n = items.length;
  const totalGap = Math.max(0, n - 1) * CARD_GAP;
  const cardHeight = n > 0 ? (CARDS_ZONE_HEIGHT - totalGap) / n : 0;

  const barAnimFrames = Math.max(1, Math.round(barAnimSeconds * fps));

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={goldColor}
          topPx={BREADCRUMB_Y}
        />
      )}

      {/* Section eyebrow */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={fillAccent} />
      )}

      {/* Title + subtitle */}
      <TitleBlock
        title={title}
        subtitle={subtitle}
        inkColor={resolvedInk}
        mutedColor={resolvedMuted}
        paletteMode={palette as PaletteMode}
      />

      {/* Contender cards */}
      {items.map((item, c) => {
        const topPx = CARDS_TOP_Y + c * (cardHeight + CARD_GAP);
        const cardEnterFrame = firstCardEnterFrames + c * cardEnterStagger;
        return (
          <ContenderCard
            key={`card-${c}`}
            item={item}
            topPx={topPx}
            heightPx={cardHeight}
            cardEnterFrame={cardEnterFrame}
            barRowStagger={barRowStagger}
            barAnimFrames={barAnimFrames}
            inkColor={resolvedInk}
            accentColor={fillAccent}
            goldColor={goldColor}
            mutedColor={resolvedMuted}
            paletteMode={palette as PaletteMode}
          />
        );
      })}

      {/* Word-by-word caption strip (bottom) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 90,
            fontSize: captionFontSize,
            accentColor: fillAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Frame-bounds reference (no visual) to keep FRAME_H referenced. */}
      {FRAME_H > 0 ? null : null}
    </AbsoluteFill>
  );
};
