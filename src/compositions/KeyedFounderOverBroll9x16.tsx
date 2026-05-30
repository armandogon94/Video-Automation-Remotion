/**
 * KeyedFounderOverBroll9x16 — Simon Hoiberg V3 N3 (MED finding).
 *
 * Simon's HIGHEST-engagement vertical format (186 likes vs 18–92 for the rest
 * of the corpus) — a chroma-keyed founder cutout floats over rotating
 * Amazon / data-center / generative B-roll, captions step-function below.
 *
 * Grammar (per `docs/critiques/wave-4/simonhoiberg-consensus.md`,
 * `docs/critiques/wave-4/simonhoiberg-vote3-redteam.md` Template A3):
 *   - Full-frame OffthreadVideo B-roll, ≤30% saturation (cross-creator V5
 *     desaturation rule — busy plates should never compete with the founder).
 *   - HARD CUTS between B-roll clips at their `startSeconds` boundaries.
 *     Each plate lives in its own `<Sequence>` keyed by index; mounting/
 *     unmounting is the cut. No transitions, no opacity blends.
 *   - A SECOND OffthreadVideo holds the keyed founder track (alpha-channel
 *     MP4 or WebM). When `founderClip.isPlaceholder === true` we render an
 *     `<Img>` silhouette instead — useful before a keyed render exists.
 *     The founder anchors to the BOTTOM EDGE of the 9×16 frame and is
 *     ~1400px tall by default (about 73% of the 1920 height) so the head
 *     reads ~upper-third over the plate.
 *   - SectionLabel chip top-left at y=200 (mono tracked-uppercase eyebrow,
 *     matching Simon's house grammar).
 *   - Captions: step-function ChunkedPhraseCaption by default ("chunked"),
 *     EditorialCaption optional ("editorial"), or off ("none").
 *
 * Pattern requirements (from the build brief):
 *   - <OffthreadVideo> for B-roll (NOT <Video>).
 *   - Each B-roll clip in <Sequence from={start*fps} durationInFrames=…>.
 *   - TypeScript strict, no `any`.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ChunkedPhraseCaption } from "../components/captions/ChunkedPhraseCaption";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getPalette,
  getToolAccentForSurface,
  resolveColors,
} from "../brand";

// ─── Shared sub-schemas (mirrored from compositions/schemas.ts so this file
//     stays self-contained, matching the TalkingHeadDynamic9x16 convention). ──
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type KeyedFounderWordTiming = z.infer<typeof wordTimingSchema>;

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});
export type KeyedFounderBreadcrumb = z.infer<typeof breadcrumbSchema>;

// ─── B-roll plate schema ────────────────────────────────────────────────────
const brollClipSchema = z.object({
  /** Asset path or absolute URL. Relative paths route through staticFile(). */
  src: z.string(),
  /** Absolute start time of this clip on the composition timeline (seconds). */
  startSeconds: z.number(),
  /** Absolute end time (seconds). Defines the <Sequence> durationInFrames. */
  endSeconds: z.number(),
  /** When true (default), apply CSS `filter: saturate(0.3)`. */
  desaturate: z.boolean().default(true),
  /** Multiplier on object-fit cover scale (1.0 = neutral cover, 1.1 = subtle push-in). */
  zoomFactor: z.number().default(1.0),
});
export type KeyedFounderBrollClip = z.infer<typeof brollClipSchema>;

// ─── Founder clip schema ────────────────────────────────────────────────────
const founderClipSchema = z.object({
  /** Keyed (alpha) MP4/WebM URL/path — OR a PNG silhouette when `isPlaceholder`. */
  src: z.string(),
  /** When true, `src` is a static PNG silhouette rendered via <Img> instead of OffthreadVideo. */
  isPlaceholder: z.boolean().default(false),
  /** Pixel offset from the bottom edge of the 9×16 frame. Default 0 (touches bottom). */
  bottomOffset: z.number().default(0),
  /** Height of the founder in px. Default 1400 (~73% of 1920). */
  height: z.number().default(1400),
  /** Horizontal alignment. Default "center". */
  align: z.enum(["left", "center", "right"]).default("center"),
});
export type KeyedFounderClip = z.infer<typeof founderClipSchema>;

// ─── Composition schema ────────────────────────────────────────────────────
export const keyedFounderOverBroll9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Sequenced B-roll plates behind the founder. Rendered in <Sequence> stacks. */
  brollClips: z.array(brollClipSchema).default([]),
  /** The keyed founder (or PNG silhouette placeholder). */
  founderClip: founderClipSchema,
  /** Caption rendering mode. "chunked" = ChunkedPhraseCaption (default — Simon/Bilawal
   *  step-function). "editorial" = EditorialCaption (cream/dark word-pill). "none". */
  captionMode: z.enum(["chunked", "editorial", "none"]).default("chunked"),
  /** Floating top-left eyebrow chip ("CASE STUDY · 02"). */
  sectionLabel: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  /** Subject-tool tint (e.g. "amazon", "claude"). Overrides palette accent if set. */
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(56),
  brandId: z.string().optional(),
});
export type KeyedFounderOverBroll9x16Props = z.infer<
  typeof keyedFounderOverBroll9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;
const SECTION_LABEL_TOP = 200;
const SECTION_LABEL_LEFT = 70;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Resolve a src: empty → null; absolute URL passes through; everything else
 *  is wrapped in staticFile(). */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

/** Horizontal anchor mapping for the founder. */
function alignToLeftStyle(
  align: "left" | "center" | "right",
  founderHeight: number,
): React.CSSProperties {
  // We don't know the founder's intrinsic aspect ratio at render-time, so we
  // size by height and let width auto-resolve. Anchor horizontally via
  // left/right percent + a translate so "center" pins the founder's midline.
  if (align === "left") {
    return { left: 40, height: founderHeight, width: "auto" };
  }
  if (align === "right") {
    return { right: 40, height: founderHeight, width: "auto" };
  }
  return {
    left: "50%",
    transform: "translateX(-50%)",
    height: founderHeight,
    width: "auto",
  };
}

// ─── SectionLabel chip (top-left eyebrow) ──────────────────────────────────
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
        top: SECTION_LABEL_TOP,
        left: SECTION_LABEL_LEFT,
        padding: "10px 18px",
        background: `${inkColor}E6`, // ink @ ~90% alpha
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

// ─── B-roll plate (single sequenced clip) ──────────────────────────────────
const BrollPlate: React.FC<{
  clip: KeyedFounderBrollClip;
  fallbackBg: string;
}> = ({ clip, fallbackBg }) => {
  const resolved = resolveSrc(clip.src);
  const saturation = clip.desaturate ? 0.3 : 1;
  const zoom = Number.isFinite(clip.zoomFactor) && clip.zoomFactor > 0
    ? clip.zoomFactor
    : 1.0;

  return (
    <AbsoluteFill style={{ background: fallbackBg, overflow: "hidden" }}>
      {resolved && (
        <OffthreadVideo
          src={resolved}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            filter: `saturate(${saturation})`,
            display: "block",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── Founder layer (keyed video OR placeholder PNG) ────────────────────────
const FounderLayer: React.FC<{
  founder: KeyedFounderClip;
}> = ({ founder }) => {
  const resolved = resolveSrc(founder.src);
  if (!resolved) return null;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    bottom: founder.bottomOffset,
    display: "block",
    pointerEvents: "none",
    ...alignToLeftStyle(founder.align, founder.height),
  };

  if (founder.isPlaceholder) {
    return <Img src={resolved} style={baseStyle} />;
  }

  return (
    <OffthreadVideo
      src={resolved}
      muted
      // Alpha-channel video is decoded with its key already applied; we render
      // it as a plain video element absolutely positioned over the B-roll.
      style={baseStyle}
    />
  );
};

// ─── Captions selector ─────────────────────────────────────────────────────
const Captions: React.FC<{
  mode: "chunked" | "editorial" | "none";
  wordTimings: KeyedFounderWordTiming[];
  fontSize: number;
  accentColor: string;
  paperColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({ mode, wordTimings, fontSize, accentColor, paperColor, inkColor, mutedColor }) => {
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
  // chunked (default)
  return (
    <ChunkedPhraseCaption
      wordTimings={wordTimings}
      style={{
        position: "bottom",
        distancePx: 260,
        fontSize,
        textColor: "#FFFFFF",
        style: "tiktok-stroke",
        strokeWidthPx: 4,
        windowSize: 3,
      }}
    />
  );
};

// ─── Composition ───────────────────────────────────────────────────────────
export const KeyedFounderOverBroll9x16: React.FC<
  KeyedFounderOverBroll9x16Props
> = ({
  audioUrl,
  wordTimings,
  brollClips,
  founderClip,
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

  // FPS is needed to convert each clip's seconds → frame indices for its <Sequence>.
  const { fps } = useVideoConfig();

  const fallbackBrollBg = `${resolvedInk}CC`; // ink @ ~80% alpha

  return (
    <AbsoluteFill style={{ background: resolvedInk }}>
      {/* Voiceover */}
      {resolvedAudioUrl && <Audio src={resolvedAudioUrl} />}

      {/* B-roll stack — each plate gets its own <Sequence>. Mounting boundaries
          ARE the hard cuts; no cross-fade. Plates whose windows don't overlap
          self-evidently produce instant cuts. Plates whose windows DO overlap
          render painter-order (later index on top), but our convention is that
          callers schedule non-overlapping `startSeconds`/`endSeconds` ranges. */}
      {brollClips.map((clip, i) => {
        const startFrame = Math.max(0, Math.round(clip.startSeconds * fps));
        const durationInFrames = Math.max(
          1,
          Math.round((clip.endSeconds - clip.startSeconds) * fps),
        );
        return (
          <Sequence
            key={`broll-${i}`}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <BrollPlate clip={clip} fallbackBg={fallbackBrollBg} />
          </Sequence>
        );
      })}

      {/* Founder layer — mounted for the FULL composition duration. The keyed
          alpha channel (or PNG) lets the underlying B-roll show through. */}
      <FounderLayer founder={founderClip} />

      {/* Palette grain overlay sits above everything for editorial unity. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top breadcrumb (optional) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Floating eyebrow chip top-left */}
      <SectionLabel
        text={sectionLabel}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />

      {/* Captions */}
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
