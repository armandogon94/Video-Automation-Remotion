/**
 * BrollListicle9x16 — Alex Hormozi-style B-roll + typography listicle.
 *
 * Source: `references/creators/alexhormozi/ANALYSIS.md` §6 priority queue rank #25.
 *
 * Hormozi's signature format compresses three structural layers into a single
 * 9×16 short:
 *   1. Continuous B-roll plate underneath (talking head OR sequenced cutaway
 *      clips with HARD CUTS at clip boundaries — no transitions).
 *   2. A persistent hook pill anchored at the top (or bottom) for the entire
 *      video duration. First-frame thumb-stop viewers see the promise from
 *      frame 0; the pill never animates out.
 *   3. A series of mid-frame "chapter card" beats that crossfade in/out one
 *      after another. Each beat is a single bullet of the listicle, either
 *      the `<ChapterCardPill>` (number + single-line title) or
 *      `<ChapterCardDoubleLine>` (large number / bold sans top line / italic
 *      serif quoted bottom line). Crossfade only — no scale, no slide.
 *
 * Optional layers:
 *   - `<OpeningTitleCard>` — 60-frame full-frame opener with PUNCHY_SPRING
 *     scale-pop on the hero word. Lives in a `<Sequence from={0}>` so it
 *     consumes only the first opener.durationFrames frames.
 *   - `<HookEmojiStrip>` — 3-emoji semantic row above the persistent hook
 *     (e.g. 📈❌🍀). Each emoji scale-pops via PUNCHY_SPRING with stagger.
 *
 * Captions burn over the lower third in karaoke style by default
 * (`<ChunkedPhraseCaption>` step-function with TikTok stroke) — Hormozi's
 * actual videos use Premiere-baked karaoke captions, and our karaoke variant
 * is the closest match. `editorial` swaps in the calm word-pill style;
 * `none` hides them entirely.
 *
 * Composition contract (build brief Wave-5):
 *   - <OffthreadVideo> for B-roll (NOT <Video>).
 *   - HARD CUTS between sequence clips (each clip in its own <Sequence>).
 *   - All Hormozi molecules sourced from src/components/HormoziOverlays.tsx.
 *   - TypeScript strict; no `any`.
 *   - Schema + props type exported at the bottom of the file.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { ChunkedPhraseCaption } from "../components/captions/ChunkedPhraseCaption";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  ALL_PALETTE_MODES,
  getPalette,
  getToolAccentForSurface,
  resolveColors,
} from "../brand";
import {
  ChapterCardDoubleLine,
  ChapterCardPill,
  HookEmojiStrip,
  OpeningTitleCard,
  PersistentHookPill,
} from "../components/HormoziOverlays";

// ─── Shared sub-schemas (mirrored from compositions/schemas.ts so this file
//     stays self-contained, matching the KeyedFounderOverBroll9x16 convention). ──
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type BrollListicleWordTiming = z.infer<typeof wordTimingSchema_local>;

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});
export type BrollListicleBreadcrumb = z.infer<typeof breadcrumbSchema_local>;

// ─── B-roll schemas ────────────────────────────────────────────────────────
const brollPersistentSchema = z.object({
  kind: z.literal("persistent"),
  src: z.string(),
  desaturate: z.boolean().default(false),
  kenBurns: z.boolean().default(true),
});
const brollSequenceClipSchema = z.object({
  src: z.string(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  desaturate: z.boolean().default(false),
});
const brollSequenceSchema = z.object({
  kind: z.literal("sequence"),
  clips: z.array(brollSequenceClipSchema),
});
const brollSolidSchema = z.object({
  kind: z.literal("solid"),
  color: z.string().default("#0E0E10"),
});

// ─── Beat schema ───────────────────────────────────────────────────────────
const beatSchema = z.object({
  /** Variant: "pill" → ChapterCardPill, "double-line" → ChapterCardDoubleLine. */
  variant: z.enum(["pill", "double-line"]).default("pill"),
  /** Optional number prefix (e.g. "1", "2", or "1#"). */
  numberPrefix: z.string().default(""),
  /** Main text — title for "pill", topLine for "double-line". */
  title: z.string(),
  /** Bottom line (only used by "double-line" variant). */
  bottomLine: z.string().default(""),
  /** When the beat enters (seconds, relative to composition start). */
  enterSeconds: z.number(),
  /** How long the beat is fully visible (excludes fade in/out). */
  visibleSeconds: z.number().default(2.5),
  /** Optional Y position override (default 960 for pill, 1100 for double-line). */
  topPx: z.number().optional(),
});
export type BrollListicleBeat = z.infer<typeof beatSchema>;

// ─── Composition schema ────────────────────────────────────────────────────
export const brollListicle9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** B-roll background — persistent clip, sequenced clips, or solid fallback. */
  broll: z
    .union([brollPersistentSchema, brollSequenceSchema, brollSolidSchema])
    .default({ kind: "solid" as const, color: "#0E0E10" }),

  /** Persistent hook pill at top — visible the entire video. */
  hook: z
    .object({
      text: z.string().default("How to do X better"),
      position: z.enum(["top", "bottom"]).default("top"),
      edgePx: z.number().default(180),
      background: z.string().default("#FFFFFF"),
      color: z.string().default("#0A0A0A"),
      fontSize: z.number().default(56),
      maxWidthPx: z.number().default(920),
    })
    .default({
      text: "How to do X better",
      position: "top" as const,
      edgePx: 180,
      background: "#FFFFFF",
      color: "#0A0A0A",
      fontSize: 56,
      maxWidthPx: 920,
    }),

  /** Optional 60-frame opening title card. */
  opener: z
    .object({
      enabled: z.boolean().default(false),
      hero: z.string().default(""),
      eyebrow: z.string().default(""),
      dek: z.string().default(""),
      durationFrames: z.number().default(60),
    })
    .default({
      enabled: false,
      hero: "",
      eyebrow: "",
      dek: "",
      durationFrames: 60,
    }),

  /** Optional emoji strip above the hook. */
  emojiStrip: z
    .object({
      enabled: z.boolean().default(false),
      emojis: z.array(z.string()).default(["📈", "❌", "🍀"]),
      topPx: z.number().default(220),
    })
    .default({
      enabled: false,
      emojis: ["📈", "❌", "🍀"],
      topPx: 220,
    }),

  /** Chapter beats — each is a card that appears for `visibleSeconds`. */
  beats: z.array(beatSchema).default([
    {
      variant: "pill" as const,
      numberPrefix: "1",
      title: "Stop trying to be liked",
      bottomLine: "",
      enterSeconds: 1,
      visibleSeconds: 2.5,
    },
    {
      variant: "pill" as const,
      numberPrefix: "2",
      title: "Be useful",
      bottomLine: "",
      enterSeconds: 4,
      visibleSeconds: 2.5,
    },
    {
      variant: "pill" as const,
      numberPrefix: "3",
      title: "Stay specific",
      bottomLine: "",
      enterSeconds: 7,
      visibleSeconds: 2.5,
    },
  ]),

  /** Beat crossfade frames (shared by all beats). */
  beatFadeInFrames: z.number().default(8),
  beatFadeOutFrames: z.number().default(8),

  /** Caption mode: "karaoke" (Hormozi style step-function), "editorial", or "none". */
  captionMode: z.enum(["karaoke", "editorial", "none"]).default("karaoke"),

  sectionLabel: z.string().default(""),

  // Wave-5 contract: every template's schema exposes a transitionVerb describing
  // how its layers move. This is consumed by the planner/template picker.
  transitionVerb: z
    .string()
    .default(
      "B-roll plays continuously underneath; persistent hook pill stays at top for the entire duration; chapter beats crossfade in mid-frame one after another (8-frame fade in, hold visibleFrames, 8-frame fade out); optional 60-frame opening title card scale-pops at the start; karaoke captions burn over the lower third.",
    ),

  // Brand chrome (typically minimal for Hormozi-style B-roll videos).
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(58),
});
export type BrollListicle9x16Props = z.infer<typeof brollListicle9x16Schema>;

type BrollProp = BrollListicle9x16Props["broll"];
type HookProp = BrollListicle9x16Props["hook"];
type OpenerProp = BrollListicle9x16Props["opener"];
type EmojiStripProp = BrollListicle9x16Props["emojiStrip"];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Resolve a src: empty → null; absolute URL passes through; everything else
 *  is wrapped in staticFile(). */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

// ─── B-roll layers ─────────────────────────────────────────────────────────

/**
 * Persistent (single-clip) B-roll. Optional Ken Burns scales from 1.0 → 1.05
 * across the composition duration (subtle push-in to keep static plates feeling
 * alive — Hormozi often uses a single talking-head plate the entire video).
 */
const PersistentBroll: React.FC<{
  src: string;
  desaturate: boolean;
  kenBurns: boolean;
}> = ({ src, desaturate, kenBurns }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const resolved = resolveSrc(src);
  if (!resolved) return null;

  const saturation = desaturate ? 0.3 : 1;

  // Ken Burns: 1.0 → 1.05 over the full composition. Subtle by design (Hormozi's
  // reference videos use barely-perceptible push-ins, not aggressive zooms).
  const burnsScale = kenBurns
    ? interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1.0, 1.05], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1.0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <OffthreadVideo
        src={resolved}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          transform: `scale(${burnsScale})`,
          transformOrigin: "center center",
          filter: `saturate(${saturation})`,
          display: "block",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Single sequenced B-roll plate (mounted by an enclosing <Sequence>; the mount/
 * unmount boundary IS the hard cut). NO transitions, NO opacity blending.
 */
const SequencedBrollPlate: React.FC<{
  src: string;
  desaturate: boolean;
}> = ({ src, desaturate }) => {
  const resolved = resolveSrc(src);
  if (!resolved) return null;

  const saturation = desaturate ? 0.3 : 1;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <OffthreadVideo
        src={resolved}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          filter: `saturate(${saturation})`,
          display: "block",
        }}
      />
    </AbsoluteFill>
  );
};

/** Top-level B-roll dispatcher. */
const BrollLayer: React.FC<{ broll: BrollProp }> = ({ broll }) => {
  const { fps } = useVideoConfig();

  if (broll.kind === "solid") {
    return <AbsoluteFill style={{ background: broll.color }} />;
  }

  if (broll.kind === "persistent") {
    return (
      <PersistentBroll
        src={broll.src}
        desaturate={broll.desaturate}
        kenBurns={broll.kenBurns}
      />
    );
  }

  // kind === "sequence" — each clip in its own <Sequence>. Mounting boundaries
  // are the hard cuts; the caller is responsible for non-overlapping ranges.
  return (
    <>
      {broll.clips.map((clip, i) => {
        const startFrame = Math.max(0, Math.round(clip.startSeconds * fps));
        const durationInFrames = Math.max(
          1,
          Math.round((clip.endSeconds - clip.startSeconds) * fps),
        );
        return (
          <Sequence
            key={`broll-clip-${i}`}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <SequencedBrollPlate src={clip.src} desaturate={clip.desaturate} />
          </Sequence>
        );
      })}
    </>
  );
};

// ─── Captions selector ─────────────────────────────────────────────────────
const Captions: React.FC<{
  mode: "karaoke" | "editorial" | "none";
  wordTimings: BrollListicleWordTiming[];
  fontSize: number;
  accentColor: string;
  paperColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({
  mode,
  wordTimings,
  fontSize,
  accentColor,
  paperColor,
  inkColor,
  mutedColor,
}) => {
  if (mode === "none" || wordTimings.length === 0) return null;

  if (mode === "editorial") {
    return (
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 220,
          fontSize,
          accentColor,
          mutedBorderColor: `${mutedColor}33`,
          maxWidthPx: 920,
          paperColor,
          inkColor,
        }}
      />
    );
  }

  // karaoke (default — Hormozi step-function with TikTok stroke).
  return (
    <ChunkedPhraseCaption
      wordTimings={wordTimings}
      style={{
        position: "bottom",
        distancePx: 280,
        fontSize,
        textColor: "#FFFFFF",
        style: "drop-shadow",
        strokeWidthPx: 4,
        windowSize: 3,
      }}
    />
  );
};

// ─── SectionLabel chip (top-left eyebrow, matches KeyedFounderOverBroll) ────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
  inkColor: string;
}> = ({ text, accentColor, inkColor }) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 70,
        padding: "10px 18px",
        background: `${inkColor}E6`,
        border: `1px solid ${accentColor}`,
        borderRadius: 4,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
        fontWeight: 600,
        fontSize: 22,
        color: accentColor,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────────
export const BrollListicle9x16: React.FC<BrollListicle9x16Props> = ({
  audioUrl,
  wordTimings,
  broll,
  hook,
  opener,
  emojiStrip,
  beats,
  beatFadeInFrames,
  beatFadeOutFrames,
  captionMode,
  sectionLabel,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
}) => {
  const { fps } = useVideoConfig();

  // Color stack — empty strings fall back to palette defaults.
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

  const resolvedAudioUrl = resolveSrc(audioUrl);

  return (
    <AbsoluteFill style={{ background: resolvedInk }}>
      {/* Voiceover */}
      {resolvedAudioUrl && <Audio src={resolvedAudioUrl} />}

      {/* ── z=0: B-roll layer ── */}
      <BrollLayer broll={broll} />

      {/* Subtle palette grain — sits above the B-roll for editorial unity but
          below all overlays. Light enough not to muddy the plate. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* ── z=10: Optional opening title card (one-shot intro) ── */}
      {opener.enabled && (
        <Sequence from={0} durationInFrames={opener.durationFrames} layout="none">
          <OpeningTitleCard
            hero={opener.hero}
            eyebrow={opener.eyebrow}
            dek={opener.dek}
            totalFrames={opener.durationFrames}
            layout="full-frame"
            background="rgba(0,0,0,0.55)"
          />
        </Sequence>
      )}

      {/* ── z=20: Persistent hook pill (visible frame 0 → end, no Sequence wrap) ── */}
      <PersistentHookPill
        text={hook.text}
        position={hook.position}
        edgePx={hook.edgePx}
        background={hook.background}
        color={hook.color}
        fontSize={hook.fontSize}
        maxWidthPx={hook.maxWidthPx}
        fadeInFrames={0}
      />

      {/* ── z=21: Optional emoji strip ── */}
      {emojiStrip.enabled && (
        <HookEmojiStrip
          emojis={emojiStrip.emojis}
          topPx={emojiStrip.topPx}
          fadeInFrames={0}
        />
      )}

      {/* ── z=30: Chapter beats ── */}
      {beats.map((beat, i) => {
        const enterFrame = Math.max(0, Math.round(beat.enterSeconds * fps));
        const visibleFrames = Math.max(
          1,
          Math.round(beat.visibleSeconds * fps),
        );
        const sequenceDuration =
          visibleFrames + beatFadeInFrames + beatFadeOutFrames;

        if (beat.variant === "double-line") {
          return (
            <Sequence
              key={`beat-${i}`}
              from={enterFrame}
              durationInFrames={sequenceDuration}
              layout="none"
            >
              <ChapterCardDoubleLine
                number={beat.numberPrefix}
                topLine={beat.title}
                bottomLine={beat.bottomLine}
                topPx={beat.topPx ?? 1100}
                enterFrame={0}
                fadeInFrames={beatFadeInFrames}
                visibleFrames={visibleFrames}
                fadeOutFrames={beatFadeOutFrames}
              />
            </Sequence>
          );
        }

        // variant === "pill"
        return (
          <Sequence
            key={`beat-${i}`}
            from={enterFrame}
            durationInFrames={sequenceDuration}
            layout="none"
          >
            <ChapterCardPill
              title={beat.title}
              numberPrefix={beat.numberPrefix || undefined}
              topPx={beat.topPx ?? 960}
              enterFrame={0}
              fadeInFrames={beatFadeInFrames}
              visibleFrames={visibleFrames}
              fadeOutFrames={beatFadeOutFrames}
            />
          </Sequence>
        );
      })}

      {/* ── z=39: Brand chrome (optional) ── */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}
      <SectionLabel
        text={sectionLabel}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />

      {/* ── z=40: Captions ── */}
      <Captions
        mode={captionMode}
        wordTimings={wordTimings}
        fontSize={captionFontSize}
        accentColor={resolvedAccent}
        paperColor={resolvedPaper}
        inkColor={resolvedInk}
        mutedColor={resolvedMuted}
      />
    </AbsoluteFill>
  );
};

// Re-export prop sub-types for callers that need them.
export type BrollListicleBroll = BrollProp;
export type BrollListicleHook = HookProp;
export type BrollListicleOpener = OpenerProp;
export type BrollListicleEmojiStrip = EmojiStripProp;
