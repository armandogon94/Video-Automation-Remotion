/**
 * TweetCard9x16 — vertical (1080×1920) animated tweet/social-post card.
 *
 * Wave-5 Tella-derived template (synthesis T2 in
 * docs/research/wave-5/tella-motion-graphics-synthesis.md): a Hormozi/Ali-Abdaal
 * style tweet card that becomes its own short-form video. The five-stage
 * choreography lives in the `<SocialPostCard>` molecule
 * (src/components/SocialPostCard.tsx) — this composition simply mounts it
 * inside the house-grammar chrome (breadcrumb + palette grain + caption strip)
 * for full 9×16 rendering.
 *
 * Visual structure (top → bottom on the 1080×1920 canvas):
 *   1. Optional BrandBreadcrumb (~y=80)
 *   2. SocialPostCard centered horizontally, top ≈ 520
 *        Stage choreography (from <SocialPostCard>):
 *          (i)   avatar scale-pops 0 → 1 over 8 frames
 *          (ii)  name + handle slide-in from the left over 12 frames
 *          (iii) body reveals line-by-line at a 6-frame stagger
 *          (iv)  attached image scale-pops 0.9 → 1 with shadow blur-in
 *          (v)   like / retweet / reply / view counters roll up
 *   3. Bottom EditorialCaption strip (gated by `showCaptions`)
 *
 * The `transitionVerb` schema field is metadata for the prompt-engineering
 * pipeline (animation-replication-runbook.md contract) — it doesn't drive
 * runtime behavior, but it travels with the schema so downstream prompt
 * generators can describe the motion in imperative voice.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { SocialPostCard } from "../components/SocialPostCard";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";

// ─── Local schemas ──────────────────────────────────────────────────
// Mirror the project pattern of inlining wordTiming + breadcrumb schemas
// rather than touching the shared schemas.ts.
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

const authorSchema = z
  .object({
    avatarSrc: z.string().default(""),
    name: z.string().default("Armando Gonzalez"),
    handle: z.string().default("@armandointeligencia"),
    verified: z.boolean().default(false),
  })
  .default({
    avatarSrc: "",
    name: "Armando Gonzalez",
    handle: "@armandointeligencia",
    verified: false,
  });

const countersSchema = z
  .object({
    likes: z.number().default(0),
    retweets: z.number().default(0),
    replies: z.number().default(0),
    views: z.number().default(0),
  })
  .default({
    likes: 0,
    retweets: 0,
    replies: 0,
    views: 0,
  });

export const tweetCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),

  // The post content
  author: authorSchema,
  body: z.string().default("Default tweet body — replace via props."),
  mediaSrc: z.string().default(""),
  mediaAspect: z.enum(["1:1", "4:5", "16:9"]).default("1:1"),
  counters: countersSchema,
  timestamp: z.string().default(""),
  brand: z.enum(["twitter", "linkedin", "neutral"]).default("twitter"),

  // CRITICAL: transitionVerb in imperative voice (the Wave-5 contract). This
  // is metadata for the prompt-engineering pipeline — it doesn't drive
  // runtime behavior, but it travels with the schema so downstream prompt
  // generators can describe the motion in imperative voice.
  transitionVerb: z
    .string()
    .default(
      "Avatar scale-pops 0→1 over 8 frames, then handle and name slide in from the left over 12 frames, then body text reveals line-by-line at 6-frame stagger, then media image scale-pops 0.9→1 with shadow blur-in, then like and retweet counters roll up.",
    ),

  // Choreography knobs
  enterStartSeconds: z.number().default(0.4),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type TweetCard9x16Props = z.infer<typeof tweetCard9x16Schema>;

// ─── Layout constants ───────────────────────────────────────────────
const BREADCRUMB_Y = 80;
const SECTION_LABEL_Y = 220;
const CARD_TOP_Y = 520; // top of the SocialPostCard wrapper (≈ y=600 visual centroid)
const CARD_WIDTH = 880;

// ─── Section label (mono tracked-uppercase) ─────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: accentColor,
        letterSpacing: "0.24em",
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
export const TweetCard9x16: React.FC<TweetCard9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  author,
  body,
  mediaSrc,
  mediaAspect,
  counters,
  timestamp,
  brand,
  enterStartSeconds,
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

  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default".
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  // Surface mode for tool-accent + grain blend
  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette as PaletteMode).grainOverlay;

  const enterStartFrame = Math.round(enterStartSeconds * fps);

  // Resolve media src for the card (passes through to SocialPostCard).
  // SocialPostCard renders <img src=...> directly, so we wrap relative
  // paths with staticFile() here.
  const resolvedMediaSrc = mediaSrc
    ? mediaSrc.startsWith("http")
      ? mediaSrc
      : staticFile(mediaSrc)
    : "";
  const resolvedAvatarSrc = author.avatarSrc
    ? author.avatarSrc.startsWith("http")
      ? author.avatarSrc
      : staticFile(author.avatarSrc)
    : "";

  // Counters: only forward keys that are non-zero so SocialPostCard's
  // truthy check renders only the chips the user actually populated.
  const cardCounters = {
    likes: counters.likes > 0 ? counters.likes : undefined,
    retweets: counters.retweets > 0 ? counters.retweets : undefined,
    replies: counters.replies > 0 ? counters.replies : undefined,
    views: counters.views > 0 ? counters.views : undefined,
  };

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
          accentColor={resolvedAccent}
          topPx={BREADCRUMB_Y}
        />
      )}

      {/* Section label */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* SocialPostCard centered horizontally inside a Sequence so the card's
          useCurrentFrame() starts at 0 when the choreography begins. The
          Sequence acts as the entry gate (enterStartFrame). Inside the card,
          all five stages are driven off SocialPostCard's own frame=0. */}
      <Sequence from={0} durationInFrames={9999} layout="none">
        <div
          style={{
            position: "absolute",
            top: CARD_TOP_Y,
            left: (1080 - CARD_WIDTH) / 2,
            width: CARD_WIDTH,
          }}
        >
          <SocialPostCard
            author={{
              avatarSrc: resolvedAvatarSrc || undefined,
              name: author.name,
              handle: author.handle,
              verified: author.verified,
            }}
            body={body}
            mediaSrc={resolvedMediaSrc || undefined}
            mediaAspect={mediaAspect}
            counters={cardCounters}
            timestamp={timestamp || undefined}
            widthPx={CARD_WIDTH}
            enterStartFrame={enterStartFrame}
            paletteMode={palette as PaletteMode}
            brand={brand}
          />
        </div>
      </Sequence>

      {/* Word-by-word caption strip (bottom) */}
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
