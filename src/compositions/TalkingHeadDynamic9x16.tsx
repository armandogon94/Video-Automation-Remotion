/**
 * TalkingHeadDynamic9x16 — vertical (1080×1920) continuous face-cam composition
 * with B-roll cutaways via HARD CUTS, modelled on @builtbystephan's actual pattern.
 *
 * ⚠️ Revised 2026-05-25. The previous version assumed a HeyGen-style still-image
 * avatar and crossfade transitions; that was wrong. After analyzing 24 keyframes
 * of `DYkyJfxx5Lx` we confirmed Stefan is on a fixed home-studio cam — the
 * "dynamic crop" is a SINGLE continuous face-cam take being cut into by B-roll
 * lanes via HARD CUTS aligned to caption-word onsets. See
 * `references/creators/builtbystephan/ANALYSIS.md` (Template A) for the source
 * grammar and the schema sketch this composition implements.
 *
 * Render strategy:
 *   - ONE <OffthreadVideo> of `faceCamSrc` mounted full composition duration.
 *     This is the load-bearing constraint: the face-cam VIDEO ELEMENT must NEVER
 *     unmount across segment boundaries, otherwise its audio (if any) and its
 *     decoder state restart on every cut. So we mount it once at the bottom of
 *     the z-stack and overlay B-roll on top in BROLL_FULL mode (rather than
 *     swap the face-cam in/out via a <Series>).
 *   - ONE <Audio> for `voiceoverSrc` when the face-cam track is silent.
 *   - For each segment, an absolutely-positioned overlay layer that crops or
 *     reveals portions of the underlying face-cam via `clipPath` and renders
 *     the segment's B-roll asset in the complementary band.
 *
 * Five crop modes (per segment):
 *   - FACE_FULL          → face-cam fills 1080×1920 (no overlay). objectFit
 *                          cover, objectPosition center top so the face sits
 *                          in the upper ~60%.
 *   - BROLL_FULL         → B-roll asset fills 1080×1920 on top of the face-cam.
 *                          The face-cam keeps playing underneath (and keeps
 *                          producing audio if it has any) but is visually
 *                          hidden. Use this for the "Claude desktop screen-rec"
 *                          and "movie still" moments.
 *   - SPLIT_50_TOP_BROLL → B-roll fills top half (y 0..960); face-cam visible
 *                          in bottom half (y 960..1920). We achieve this by
 *                          dropping a `clipPath: inset(50% 0 0 0)` over a face-
 *                          cam clone and putting the B-roll in the top band.
 *                          The hard split-line lives at y=960 with NO seam
 *                          accent (matches @builtbystephan's grammar — no
 *                          decorative divider).
 *   - SPLIT_50_TOP_FACE  → face-cam fills top half (clipPath inset(0 0 50% 0));
 *                          B-roll fills bottom half. Mirror of SPLIT_50_TOP_BROLL.
 *   - SPLIT_33_TOP_FACE  → face-cam compressed to top 33% (y 0..640) via
 *                          clipPath inset(0 0 66.67% 0); B-roll fills 640..1920.
 *                          The "heavy graphics" moment.
 *
 * Transitions:
 *   - HARD_CUT (default, matches Stephan) → instant change at segment boundary,
 *     no opacity blend. Each segment overlay is mounted only during its active
 *     window.
 *   - CROSSFADE → opacity blend over `transitionFrames` (≥ 1). Use sparingly;
 *     Stephan never dissolves. We support this only because the original
 *     composition exposed it; the new default is HARD_CUT.
 *
 * NOTE: B-roll asset selection. Each segment carries a `brollSrc` that
 * resolves into a `brollClips` entry by index OR by literal src match. To keep
 * the schema simple and the caller's contract obvious, `brollSrc` is a
 * STRING (path or URL or empty); it matches against `brollClips[i].src` to
 * pick up the `fitMode` (cover/contain). When no match is found, the clip
 * defaults to cover.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Shared word-timing + breadcrumb schemas (mirrored from schemas.ts so this
//     file stays self-contained, matching the prior convention). ───────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type WordTiming = z.infer<typeof wordTimingSchema>;

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});
export type Breadcrumb = z.infer<typeof breadcrumbSchema>;

// ─── Schema ────────────────────────────────────────────────────────────────
const cropModeEnum = z.enum([
  "FACE_FULL",
  "BROLL_FULL",
  "SPLIT_50_TOP_BROLL",
  "SPLIT_50_TOP_FACE",
  "SPLIT_33_TOP_FACE",
]);
export type TalkingHeadCropMode = z.infer<typeof cropModeEnum>;

const brollClipSchema = z.object({
  /** B-roll asset URL or staticFile-relative path. Can be a video or image —
   *  callers are responsible for picking the right asset kind for the segment
   *  (we render via <Img> by default; future v2 may sniff extension). */
  src: z.string(),
  fitMode: z.enum(["cover", "contain"]).default("cover"),
});
export type BrollClip = z.infer<typeof brollClipSchema>;

const cropSegmentSchema = z.object({
  /** Segment start time in seconds (absolute from composition start). */
  startSeconds: z.number(),
  /** Segment end time in seconds (absolute). */
  endSeconds: z.number(),
  cropMode: cropModeEnum,
  /** B-roll asset for this segment. Looked up against `brollClips[*].src`
   *  for its fitMode; empty string is valid for FACE_FULL (no B-roll needed). */
  brollSrc: z.string().default(""),
  /** Transition into this segment from the previous one. Default HARD_CUT
   *  (Stephan's grammar). CROSSFADE only fires when transitionFrames > 0. */
  transitionIn: z.enum(["HARD_CUT", "CROSSFADE"]).default("HARD_CUT"),
  /** Crossfade duration in frames. Ignored for HARD_CUT. */
  transitionFrames: z.number().int().default(0),
});
export type CropSegment = z.infer<typeof cropSegmentSchema>;

export const talkingHeadDynamic9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Continuous face-cam video URL or staticFile-relative path. Mounted ONCE
   *  for the entire composition; never unmounted across segment changes. */
  faceCamSrc: z.string().default(""),
  /** Separate voiceover audio track. Use this when the faceCam video has no
   *  usable audio (e.g. it's a silent take and the script is TTS-generated).
   *  Empty = no extra audio layer. */
  voiceoverSrc: z.string().default(""),
  /** Pool of B-roll clips referenced by segments via `brollSrc`. */
  brollClips: z.array(brollClipSchema).default([]),
  segments: z.array(cropSegmentSchema).default([]),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type TalkingHeadDynamic9x16Props = z.infer<typeof talkingHeadDynamic9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;
const HALF_H = 960; // 50% mark
const THIRD_H = 640; // 33% mark (1920 / 3, rounded)

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Resolve src: empty = null (caller renders fallback), absolute URL passes
 *  through, everything else is wrapped in staticFile(). */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

/** Look up a brollSrc in the brollClips pool. Returns the fitMode (default "cover")
 *  for whichever entry matches by literal src. */
function resolveFitMode(
  brollSrc: string,
  pool: BrollClip[],
): "cover" | "contain" {
  if (!brollSrc) return "cover";
  const hit = pool.find((c) => c.src === brollSrc);
  return hit ? hit.fitMode : "cover";
}

/**
 * Compute opacity for a segment overlay at a given absolute frame.
 *
 * - HARD_CUT: 1 inside [startFrame, endFrame), else 0.
 * - CROSSFADE: ramps 0→1 over [startFrame - transitionFrames, startFrame)
 *   and stays at 1 until endFrame. The outgoing segment doesn't fade out —
 *   the incoming one fades in on top. This matches the visual feel of a
 *   crossfade without requiring two layers to be co-aware of each other.
 */
function segmentOpacity(
  frame: number,
  startFrame: number,
  endFrame: number,
  transitionIn: "HARD_CUT" | "CROSSFADE",
  transitionFrames: number,
  isFirst: boolean,
): number {
  if (frame >= endFrame) return 0;
  if (transitionIn === "HARD_CUT" || transitionFrames <= 0 || isFirst) {
    return frame >= startFrame ? 1 : 0;
  }
  // CROSSFADE: fade-in band starts `transitionFrames` BEFORE the segment's
  // hard start so the incoming layer overlaps the outgoing one's tail.
  const fadeInStart = startFrame - transitionFrames;
  if (frame < fadeInStart) return 0;
  if (frame >= startFrame) return 1;
  return interpolate(frame, [fadeInStart, startFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── Per-mode geometry ─────────────────────────────────────────────────────

/** clipPath inset string that REVEALS the named band of the face-cam (the rest
 *  is masked out). Format: inset(top right bottom left). 0 = no inset on that
 *  side, 50% = trim half from that side. */
const FACE_CLIP_TOP_HALF = "inset(0 0 50% 0)"; // keep top 0..960, trim bottom
const FACE_CLIP_BOTTOM_HALF = "inset(50% 0 0 0)"; // keep bottom 960..1920, trim top
const FACE_CLIP_TOP_THIRD = "inset(0 0 66.67% 0)"; // keep top 0..640, trim 67% from bottom

interface ModeLayout {
  /** When non-null, the face-cam is visually CLIPPED to this band via the given
   *  clipPath; the rest is transparent. Null means face-cam is fully visible
   *  underneath (FACE_FULL) or fully hidden (BROLL_FULL — B-roll covers it). */
  faceClipPath: string | null;
  /** When non-null, the B-roll asset is rendered at this band. */
  brollBand: { top: number; left: number; width: number; height: number } | null;
  /** When true, the underlying face-cam is fully covered by something else, so
   *  the face-cam clone on top is unnecessary. (Used for BROLL_FULL.) */
  hideFace: boolean;
  /** Where to anchor the bottom caption strip — different crop modes want a
   *  different caption y-position to avoid the seam. */
  captionPosition: "bottom" | "center";
}

function getLayoutForMode(mode: TalkingHeadCropMode): ModeLayout {
  switch (mode) {
    case "FACE_FULL":
      return {
        faceClipPath: null,
        brollBand: null,
        hideFace: false,
        captionPosition: "bottom",
      };
    case "BROLL_FULL":
      return {
        faceClipPath: null,
        brollBand: { top: 0, left: 0, width: FRAME_W, height: FRAME_H },
        hideFace: true,
        captionPosition: "bottom",
      };
    case "SPLIT_50_TOP_BROLL":
      return {
        // Face-cam visible in BOTTOM half (clip away the top half).
        faceClipPath: FACE_CLIP_BOTTOM_HALF,
        brollBand: { top: 0, left: 0, width: FRAME_W, height: HALF_H },
        hideFace: false,
        // Caption sits at bottom of frame but the face is at 960..1920, so
        // bottom-anchored captions read as on-top-of-shirt. Good.
        captionPosition: "bottom",
      };
    case "SPLIT_50_TOP_FACE":
      return {
        // Face-cam visible in TOP half (clip away the bottom half).
        faceClipPath: FACE_CLIP_TOP_HALF,
        brollBand: { top: HALF_H, left: 0, width: FRAME_W, height: FRAME_H - HALF_H },
        hideFace: false,
        captionPosition: "bottom",
      };
    case "SPLIT_33_TOP_FACE":
      return {
        // Face-cam compressed to top 33% (y 0..640).
        faceClipPath: FACE_CLIP_TOP_THIRD,
        brollBand: { top: THIRD_H, left: 0, width: FRAME_W, height: FRAME_H - THIRD_H },
        hideFace: false,
        captionPosition: "bottom",
      };
  }
}

// ─── Single segment overlay ────────────────────────────────────────────────
const SegmentOverlay: React.FC<{
  segment: CropSegment;
  faceCamSrc: string | null;
  brollClips: BrollClip[];
  fallbackFaceBg: string;
  fallbackBrollBg: string;
  opacity: number;
}> = ({ segment, faceCamSrc, brollClips, fallbackFaceBg, fallbackBrollBg, opacity }) => {
  // Don't pay for hidden layers.
  if (opacity <= 0) return null;

  const layout = getLayoutForMode(segment.cropMode);
  const brollSrc = resolveSrc(segment.brollSrc);
  const fitMode = resolveFitMode(segment.brollSrc, brollClips);

  // FACE_FULL: there's NOTHING to overlay — the underlying face-cam shows through.
  // We still render a layer so the opacity ramp during CROSSFADE works (it lets
  // the incoming "empty overlay" fade in over an outgoing B-roll layer, which
  // is the correct grammar for "B-roll fades back to face-cam"). For HARD_CUT
  // this is a no-op zero-cost div.
  if (segment.cropMode === "FACE_FULL") {
    return <AbsoluteFill style={{ opacity, pointerEvents: "none" }} />;
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* B-roll band — drawn FIRST so the (possibly clipped) face-cam clone
          sits on top of it in the visible band. */}
      {layout.brollBand && (
        <div
          style={{
            position: "absolute",
            top: layout.brollBand.top,
            left: layout.brollBand.left,
            width: layout.brollBand.width,
            height: layout.brollBand.height,
            overflow: "hidden",
            background: fallbackBrollBg,
          }}
        >
          {brollSrc && (
            <Img
              src={brollSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: fitMode,
                objectPosition: "center center",
                display: "block",
              }}
            />
          )}
        </div>
      )}

      {/* Face-cam clone, clipped to the visible band. We render a second
          <OffthreadVideo> at the SAME src + same playback time as the base
          face-cam — Remotion's deterministic frame addressing means both
          mounts paint the same frame, so this reads as one continuous shot.
          For BROLL_FULL we skip this entirely (hideFace = true). */}
      {!layout.hideFace && faceCamSrc && layout.faceClipPath && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: FRAME_W,
            height: FRAME_H,
            overflow: "hidden",
            background: fallbackFaceBg,
            clipPath: layout.faceClipPath,
          }}
        >
          <OffthreadVideo
            src={faceCamSrc}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Composition ───────────────────────────────────────────────────────────
export const TalkingHeadDynamic9x16: React.FC<TalkingHeadDynamic9x16Props> = ({
  audioUrl,
  wordTimings,
  faceCamSrc,
  voiceoverSrc,
  brollClips,
  segments,
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

  // Resolve color stack — empty strings fall back to palette defaults.
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

  const resolvedFaceCamSrc = resolveSrc(faceCamSrc);
  const resolvedVoiceoverSrc = resolveSrc(voiceoverSrc);
  const resolvedAudioUrl = resolveSrc(audioUrl);

  // Fallback colors for empty slots — on-brand but obviously "missing".
  const fallbackFaceBg = `${resolvedInk}33`; // ink @ ~20% alpha
  const fallbackBrollBg = resolvedPaper;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {/* Voiceover / external audio. `audioUrl` is the legacy slot used by the
          generation pipeline (TTS output); `voiceoverSrc` is a parallel slot
          for cases where the face-cam track is silent and the voiceover ships
          separately. Both can mount safely — Remotion mixes them. */}
      {resolvedAudioUrl && <Audio src={resolvedAudioUrl} />}
      {resolvedVoiceoverSrc && <Audio src={resolvedVoiceoverSrc} />}

      {/* BASE LAYER — continuous face-cam, mounted ONCE for the full duration.
          Muted by default to avoid double-audio when a separate voiceover is
          provided. If your face-cam has the load-bearing audio, set voiceoverSrc
          empty AND remove the `muted` attribute via composition customization
          (or re-mount with the audio enabled in a fork). */}
      {resolvedFaceCamSrc && (
        <AbsoluteFill>
          <OffthreadVideo
            src={resolvedFaceCamSrc}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
        </AbsoluteFill>
      )}

      {/* SEGMENT OVERLAY STACK — one absolute layer per segment, opacity-driven
          mount/unmount. For HARD_CUT (default) exactly one segment is visible
          at any frame; for CROSSFADE up to two stack during the fade band. */}
      {segments.map((segment, i) => {
        const startFrame = Math.round(segment.startSeconds * fps);
        const endFrame = Math.round(segment.endSeconds * fps);
        const opacity = segmentOpacity(
          frame,
          startFrame,
          endFrame,
          segment.transitionIn,
          segment.transitionFrames,
          i === 0,
        );
        return (
          <SegmentOverlay
            key={`seg-${i}`}
            segment={segment}
            faceCamSrc={resolvedFaceCamSrc}
            brollClips={brollClips}
            fallbackFaceBg={fallbackFaceBg}
            fallbackBrollBg={fallbackBrollBg}
            opacity={opacity}
          />
        );
      })}

      {/* Palette-driven grain overlay — sits above the image bands so the whole
          composition reads as one editorial unit. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Always-visible breadcrumb at top */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Word-by-word captions at the bottom strip. Note: caption y-position is
          static (bottom) regardless of active segment crop mode — this matches
          @builtbystephan's grammar where captions sit at mid-chest in FACE_FULL
          and just-above-the-bottom-edge in SPLIT modes (always near the face).
          A future v2 could derive y from active segment via lookup. */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 80,
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
