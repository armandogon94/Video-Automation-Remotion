/**
 * HormoziTweetCardListicle16x9 — the Hormozi long-form HIGH-priority consensus
 * composition (patterns H1 + H2 + H3 fused into ONE 16:9 piece).
 *
 * This is the "Tella-claim payoff" — both Hormozi voters identified the
 * animated tweet-card listicle as the #1 most-rigorously-corroborated pattern
 * in his long-form catalog (15+ frame instances, 4+ reference clips).
 *
 *   - H1 (`SocialPostCard variant="text-only" + numberedBadge`):
 *       a single text-only tweet card with a lime-green numbered badge
 *       overhanging the top-left corner, anchored right of the canvas so a
 *       sibling talking-head video can occupy the left half.
 *   - H2 (`TweetStackPanel append='down'`):
 *       cards arrive one by one at 2-second intervals; each new card slides in
 *       from BELOW, and the existing cards concurrently shift UP to make room.
 *       The bottom of the stack stays pinned to `stackBottomPx`; the stack
 *       grows upward as items accumulate.
 *   - H3 (`PaginatedListSlide direction='up'`):
 *       a single card holds settled for `visibleFrames`, then the next card
 *       slides up from below WHILE the current card slides up out the top —
 *       both pages briefly visible at the crossover frame.
 *
 * The composition exposes a single `mode` prop (`'stack'` | `'paginate'`) that
 * switches between H2 and H3 — H1 is the per-card render shape, which is
 * shared between both modes because both modes render `<SocialPostCard
 * variant="text-only" numberedBadge={...}>` under the hood.
 *
 * Reference clips:
 *   - docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-03.mp4
 *       single-card listicle item (numbered badge)
 *   - docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-04.mp4
 *       stack build (two cards visible)
 *   - docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-04-v2.mp4
 *       pagination (outgoing-up + incoming-up-from-below)
 *   - docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-05-v2.mp4
 *       append-up variant
 *
 * Frame evidence:
 *   references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/
 *
 * Synthesis spec:
 *   docs/research/wave-6/alexhormozi-longform-consensus.md (sections H1, H2, H3)
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
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { TweetStackPanel, type TweetStackEntry } from "../components/TweetStackPanel";
import {
  PaginatedListSlide,
  type PaginatedListSlideEntry,
} from "../components/PaginatedListSlide";
import { SocialPostCard } from "../components/SocialPostCard";
import { YellowGlowLowerThird } from "../components/YellowGlowLowerThird";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";

// ─────────────────────────────────────────────────────────────────────────────
// Local schemas (kept self-contained — does NOT touch shared schemas.ts)
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
  size: z.number().min(40).max(240).default(120),
  opacity: z.number().min(0).max(1).default(0.9),
});

const authorSchema = z.object({
  avatarSrc: z.string().default(""),
  name: z.string().default("Alex Hormozi"),
  handle: z.string().default("@AlexHormozi"),
  verified: z.boolean().default(true),
});

const itemSchema = z.object({
  /** Number shown in the badge (defaults to position+1). */
  number: z.union([z.number(), z.string()]).default(""),
  /** Tweet author (defaults to channel-wide author). */
  author: authorSchema.default({
    avatarSrc: "",
    name: "Alex Hormozi",
    handle: "@AlexHormozi",
    verified: true,
  }),
  /** Tweet body text. */
  body: z.string().default(""),
});

const numberedBadgeSchema = z
  .object({
    /** Stroke color (default Hormozi lime #C4F84A). */
    strokeColor: z.string().default("#C4F84A"),
    /** Text color (default white). */
    textColor: z.string().default("#FFFFFF"),
    /** Badge size (px). Default 64. */
    sizePx: z.number().default(64),
    /** Whether to show numbers (default true). Set false for non-numbered card stacks. */
    show: z.boolean().default(true),
  })
  .default({
    strokeColor: "#C4F84A",
    textColor: "#FFFFFF",
    sizePx: 64,
    show: true,
  });

const stackOptionsSchema = z
  .object({
    /** Direction new cards arrive from. Default 'down'. */
    append: z.enum(["up", "down"]).default("down"),
    /** Vertical gap between cards. */
    cardGapPx: z.number().default(28),
    /** Where the bottom of the visible stack sits. */
    stackBottomPx: z.number().default(900),
    /** Frame between successive card entries. Default 60 (~2s). */
    cardIntervalFrames: z.number().default(60),
    /** Frames each card takes to slide in. */
    slideInFrames: z.number().default(14),
    /** Max cards visible at once. */
    maxVisibleCards: z.number().default(5),
  })
  .default({
    append: "down",
    cardGapPx: 28,
    stackBottomPx: 900,
    cardIntervalFrames: 60,
    slideInFrames: 14,
    maxVisibleCards: 5,
  });

const paginateOptionsSchema = z
  .object({
    /** Frames each card stays visible (excluding fades). */
    visibleFrames: z.number().default(90),
    /** Frames each card takes to slide in. */
    slideInFrames: z.number().default(14),
    /** Frames each card takes to slide out. */
    slideOutFrames: z.number().default(14),
    /** Whether to crossfade. */
    crossfade: z.boolean().default(true),
  })
  .default({
    visibleFrames: 90,
    slideInFrames: 14,
    slideOutFrames: 14,
    crossfade: true,
  });

const yellowGlowSchema = z
  .object({
    enabled: z.boolean().default(false),
    text: z.string().default(""),
    subtitle: z.string().default(""),
    /** When to enter (frames). */
    enterFrame: z.number().default(60),
    visibleFrames: z.number().default(120),
  })
  .default({
    enabled: false,
    text: "",
    subtitle: "",
    enterFrame: 60,
    visibleFrames: 120,
  });

export const hormoziTweetCardListicle16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Section eyebrow chip. */
  sectionLabel: z.string().default(""),
  /** Optional headline above the listicle. */
  headline: z.string().default(""),

  /** Mode of operation. Default 'stack'. */
  mode: z.enum(["stack", "paginate"]).default("stack"),

  /** The tweet/listicle items. */
  items: z
    .array(itemSchema)
    .default([
      {
        number: 1,
        author: {
          avatarSrc: "",
          name: "Alex Hormozi",
          handle: "@AlexHormozi",
          verified: true,
        },
        body: "The pain you avoid today is the pain you pay for tomorrow with interest.",
      },
      {
        number: 2,
        author: {
          avatarSrc: "",
          name: "Alex Hormozi",
          handle: "@AlexHormozi",
          verified: true,
        },
        body: "If you make $1M, you must learn to delegate. The skill that got you here will trap you here.",
      },
      {
        number: 3,
        author: {
          avatarSrc: "",
          name: "Alex Hormozi",
          handle: "@AlexHormozi",
          verified: true,
        },
        body: "Confidence isn't \"I will succeed.\" Confidence is \"I will be okay if I fail.\"",
      },
    ]),

  /** Horizontal anchor of the listicle. Default 'right' (Hormozi most common —
   *  leaves left half for talking head). */
  anchor: z.enum(["left", "center", "right"]).default("right"),
  /** Inset from canvas edge when anchor is left/right. Default 100. */
  anchorInsetPx: z.number().default(100),
  /** Card width (px). Default 720. */
  cardWidthPx: z.number().default(720),

  /** Numbered badge styling. */
  numberedBadge: numberedBadgeSchema,

  /** Stack mode options. */
  stack: stackOptionsSchema,

  /** Paginate mode options. */
  paginate: paginateOptionsSchema,

  /** First-item enter delay (seconds). */
  startSeconds: z.number().default(0.4),

  /** Optional Hormozi-style yellow lower-third overlay. */
  yellowGlow: yellowGlowSchema,

  /** Brand variant for cards. Default 'twitter'. */
  brand: z.enum(["twitter", "linkedin", "neutral"]).default("twitter"),

  // Wave-5 contract — transitionVerb in imperative voice for prompt generators.
  transitionVerb: z
    .string()
    .default(
      "In stack mode, each numbered tweet card slides in from below at 2-second intervals — as each new card enters from the bottom edge, the existing cards concurrently shift up to make room, building a visible stack of N cards anchored right. In paginate mode, each card slides up from below over 14 frames and holds 90 frames; when the next card enters, the current card concurrently slides up out the top while the next card slides up from below. The lime-green numbered badge overhangs the top-left corner of each card.",
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

  /** Watermark style. */
  watermark: watermarkSchema_local.default(watermarkSchema_local.parse({})),
});
export type HormoziTweetCardListicle16x9Props = z.infer<
  typeof hormoziTweetCardListicle16x9Schema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const SECTION_LABEL_Y = 70;
const HEADLINE_Y = 140;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pickItemAnchor(
  anchor: "left" | "center" | "right",
): "left" | "center" | "right" {
  return anchor;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section eyebrow chip
// ─────────────────────────────────────────────────────────────────────────────

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
        fontSize: 26,
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

// ─────────────────────────────────────────────────────────────────────────────
// Headline above the listicle (optional)
// ─────────────────────────────────────────────────────────────────────────────

const Headline: React.FC<{
  text: string;
  inkColor: string;
}> = ({ text, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterFrames = Math.round(0.45 * fps);
  const opacity = interpolate(frame, [4, 4 + enterFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [4, 4 + enterFrames], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: HEADLINE_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize: 56,
        color: inkColor,
        letterSpacing: "-0.01em",
        lineHeight: 1.1,
        padding: "0 120px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const HormoziTweetCardListicle16x9: React.FC<
  HormoziTweetCardListicle16x9Props
> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  headline,
  mode,
  items,
  anchor,
  anchorInsetPx,
  cardWidthPx,
  numberedBadge,
  stack,
  paginate,
  startSeconds,
  yellowGlow,
  brand,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
  watermark,
}) => {
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
  const resolvedGrain = getPalette(palette).grainOverlay;

  const startFrame = Math.round(startSeconds * fps);
  const itemAnchor = pickItemAnchor(anchor);

  // ── Stack mode: map items → TweetStackEntry[] ─────────────────────────────
  const stackEntries: TweetStackEntry[] = items.map((it, i) => {
    const numberValue =
      typeof it.number === "number"
        ? it.number
        : it.number && it.number.length > 0
          ? it.number
          : i + 1;
    return {
      author: {
        avatarSrc: it.author.avatarSrc || undefined,
        name: it.author.name,
        handle: it.author.handle,
        verified: it.author.verified,
      },
      body: it.body,
      numberedBadgeNumber: numberedBadge.show ? numberValue : undefined,
    };
  });

  // ── Paginate mode: map items → PaginatedListSlideEntry[] ──────────────────
  //
  // Each slide is a full-canvas wrapper containing one `<SocialPostCard>`. The
  // PaginatedListSlide molecule already provides absolute positioning + the
  // outgoing/incoming crossover; we just render the card inside, anchored per
  // the user's `anchor` prop.
  const paginateSlides: PaginatedListSlideEntry[] = items.map((it, i) => {
    const numberValue =
      typeof it.number === "number"
        ? it.number
        : it.number && it.number.length > 0
          ? it.number
          : i + 1;

    // Each slide's card uses `enterStartFrame=0` because PaginatedListSlide's
    // outer wrapper handles the slide-in choreography — letting SocialPostCard
    // ALSO run its own slide-in would double up the motion. By the time the
    // wrapper has finished its `slideInFrames`, SocialPostCard's internal
    // stages (avatar pop, name slide, body reveal) are also done, and the card
    // reads as fully settled by the time it hits the "settled" phase.
    const card = (
      <SocialPostCard
        author={{
          avatarSrc: it.author.avatarSrc || undefined,
          name: it.author.name,
          handle: it.author.handle,
          verified: it.author.verified,
        }}
        body={it.body}
        variant="text-only"
        anchor={itemAnchor}
        anchorInsetPx={anchorInsetPx}
        widthPx={cardWidthPx}
        enterStartFrame={0}
        paletteMode={palette}
        brand={brand}
        numberedBadge={
          numberedBadge.show
            ? {
                number: numberValue,
                strokeColor: numberedBadge.strokeColor,
                textColor: numberedBadge.textColor,
                sizePx: numberedBadge.sizePx,
              }
            : undefined
        }
      />
    );
    return { content: card };
  });

  return (
    <DarkSlateChassis16x9 slateColor={resolvedPaper}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant — anchored top-left). */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}

      {/* Section eyebrow chip — mono tracked uppercase. */}
      {sectionLabel ? (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      ) : null}

      {/* Optional headline above the listicle. */}
      {headline ? <Headline text={headline} inkColor={resolvedInk} /> : null}

      {/* The listicle itself — stack OR paginate. */}
      {mode === "stack" ? (
        <TweetStackPanel
          entries={stackEntries}
          append={stack.append}
          cardWidthPx={cardWidthPx}
          cardGapPx={stack.cardGapPx}
          anchor={itemAnchor}
          anchorInsetPx={anchorInsetPx}
          stackBottomPx={stack.stackBottomPx}
          startFrame={startFrame}
          cardIntervalFrames={stack.cardIntervalFrames}
          slideInFrames={stack.slideInFrames}
          badgeStrokeColor={numberedBadge.strokeColor}
          badgeSizePx={numberedBadge.sizePx}
          maxVisibleCards={stack.maxVisibleCards}
          paletteMode={palette}
          brand={brand}
        />
      ) : (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <PaginatedListSlide
            slides={paginateSlides}
            startFrame={startFrame}
            slideInFrames={paginate.slideInFrames}
            visibleFrames={paginate.visibleFrames}
            slideOutFrames={paginate.slideOutFrames}
            direction="up"
            crossfade={paginate.crossfade}
            canvasWidthPx={CANVAS_W}
            canvasHeightPx={CANVAS_H}
          />
        </AbsoluteFill>
      )}

      {/* Optional Hormozi yellow lower-third overlay. */}
      {yellowGlow.enabled && yellowGlow.text ? (
        <YellowGlowLowerThird
          text={yellowGlow.text}
          subtitle={yellowGlow.subtitle || undefined}
          enterFrame={yellowGlow.enterFrame}
          visibleFrames={yellowGlow.visibleFrames}
          fadeInFrames={8}
          fadeOutFrames={10}
        />
      ) : null}

      {/* Optional word-by-word captions in the bottom third (gated). */}
      {showCaptions ? (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${colors.muted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      ) : null}

      {/* Bottom-right brand watermark (16:9 variant). */}
      <BrandWatermark16x9 style={watermark} />
    </DarkSlateChassis16x9>
  );
};
