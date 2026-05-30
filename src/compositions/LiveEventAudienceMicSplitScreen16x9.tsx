/**
 * LiveEventAudienceMicSplitScreen16x9 — Hormozi NEW-H7 +
 * theaiadvantage (Igor Pogany) "auditorium-duel convergence" pattern.
 *
 * Per `references/creators/alexhormozi/ANALYSIS.md` (Wave-7 Batch 3 Extension,
 * NEW-H7 LiveEventAudienceMicSplitScreen) and
 * `references/creators/theaiadvantage/ANALYSIS.md` (auditorium-duel
 * convergence pattern), this template captures the live-event coaching
 * moment: a single shared frame split 50/50 horizontally, with the
 * audience-member-with-mic on one half and the speaker-on-stage on the
 * other. Both halves crossfade in simultaneously at chassis entry — that
 * 8-frame seam crossfade IS the pattern's signature transition verb. The
 * two halves read as "two halves of the same conversation" rather than as
 * two separate clips.
 *
 * Visual essence:
 *   • 50/50 horizontal split via the SplitFrame primitive (B11).
 *   • LEFT pane: audience member with mic (typically).
 *   • RIGHT pane: speaker on stage (typically).
 *   • Optional 2px white vertical seam (Bilawal-style hard division — off
 *     by default so the Hormozi look reads as a single continuous frame).
 *   • Optional bottom-left name tag overlays per pane.
 *   • Optional caption pill below the split (CaptionPillWithKeyword).
 *   • Persistent handle chip + dark-slate chassis from DarkSlateChassis16x9.
 *
 * Timing (frames @ 30fps):
 *   0–8f   both panes crossfade in simultaneously (opacity 0→1).
 *   8–12f  optional seam draws in (scaleX 0→1 from center) — only if seam
 *          width > 0.
 *  12–20f  name tag labels fade in (only on panes that supply a label).
 *  24–32f  caption pill fades in (CaptionPillWithKeyword's own internal
 *          fade envelope starts at frame 24).
 *  32f→   hold.
 */
import React from "react";
import { Img, OffthreadVideo, useCurrentFrame, interpolate, Easing } from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";
import { SplitFrame } from "../components/primitives/SplitFrame";
import { FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const paneSchema = z.object({
  src: z.string(),
  isVideo: z.boolean().default(false),
  /** Optional bottom-left name tag overlay (e.g. "AUDIENCE", "SPEAKER"). */
  label: z.string().optional(),
});

const seamSchema = z
  .object({
    /** Seam width in px. 0 = no visible seam (Hormozi look). 2 = Bilawal-style
     *  hard division. */
    width: z.number().default(0),
    color: z.string().default("#FFFFFF"),
  })
  .default({ width: 0, color: "#FFFFFF" });

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const liveEventAudienceMicSplitScreenSchema = z.object({
  left: paneSchema,
  right: paneSchema,
  /** Seam config. Default: no visible seam (Hormozi look). */
  seam: seamSchema,
  /** Optional caption pill below the split. */
  caption: captionSchema.optional(),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(150),
  /** Per Wave-5 contract. */
  transitionVerb: z
    .string()
    .default(
      "Crossfade in both panes simultaneously over 8 frames at chassis entry; if a seam is configured, it draws in 4 frames after the panes settle; name tag overlays fade in last.",
    ),
});

export type LiveEventAudienceMicSplitScreen16x9Props = z.infer<
  typeof liveEventAudienceMicSplitScreenSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing windows (frames @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────

const PANE_FADE_IN = { start: 0, end: 8 } as const;
const SEAM_DRAW_IN = { start: 8, end: 12 } as const;
const LABEL_FADE_IN = { start: 12, end: 20 } as const;
const CAPTION_START_FRAME = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const LABEL_EDGE_INSET_PX = 32;
const LABEL_FONT_SIZE_PX = 28;
const LABEL_PADDING = "10px 20px";
const LABEL_BG = "rgba(15,27,45,0.70)";
const LABEL_RADIUS_PX = 8;

// ─────────────────────────────────────────────────────────────────────────────
// PaneContent — handles Img/OffthreadVideo conditional + optional label overlay.
//
// This is intentionally a local helper inside the composition file because it
// only makes sense in the context of the audience/speaker split-screen — it's
// not a general-purpose pane primitive. The crossfade and label-fade envelopes
// are driven here via useCurrentFrame so the SplitFrame primitive stays
// time-agnostic.
// ─────────────────────────────────────────────────────────────────────────────

interface PaneContentProps {
  src: string;
  isVideo: boolean;
  label?: string;
}

const PaneContent: React.FC<PaneContentProps> = ({ src, isVideo, label }) => {
  const frame = useCurrentFrame();

  // Both panes crossfade in simultaneously — same envelope on left and right.
  const paneOpacity = interpolate(
    frame,
    [PANE_FADE_IN.start, PANE_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // Label fades in last, after the panes have settled.
  const labelOpacity = interpolate(
    frame,
    [LABEL_FADE_IN.start, LABEL_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    display: "block",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: paneOpacity,
      }}
    >
      {isVideo ? (
        <OffthreadVideo src={src} style={mediaStyle} />
      ) : (
        <Img src={src} style={mediaStyle} />
      )}
      {label ? (
        <div
          style={{
            position: "absolute",
            left: LABEL_EDGE_INSET_PX,
            bottom: LABEL_EDGE_INSET_PX,
            padding: LABEL_PADDING,
            background: LABEL_BG,
            borderRadius: LABEL_RADIUS_PX,
            color: "#FFFFFF",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: LABEL_FONT_SIZE_PX,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            opacity: labelOpacity,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SeamLayer — optional vertical seam that draws in after the panes settle.
//
// Only renders when seam.width > 0. The seam scales horizontally from the
// center outward, so the divide reads as a "wipe-out from the middle" rather
// than a sudden line appearance. We render this OUTSIDE SplitFrame so we
// don't double-count gap width in SplitFrame's flex layout — instead the
// SplitFrame is given gapPx = seam.width (which reserves the strip), and we
// overlay the animated seam line on top of that strip via an absolutely-
// positioned full-height div centered horizontally.
// ─────────────────────────────────────────────────────────────────────────────

interface SeamLayerProps {
  width: number;
  color: string;
}

const SeamLayer: React.FC<SeamLayerProps> = ({ width, color }) => {
  const frame = useCurrentFrame();

  if (width <= 0) {
    return null;
  }

  const scaleY = interpolate(
    frame,
    [SEAM_DRAW_IN.start, SEAM_DRAW_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width,
        backgroundColor: color,
        transform: `translateX(-50%) scaleY(${scaleY})`,
        transformOrigin: "center center",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const LiveEventAudienceMicSplitScreen16x9: React.FC<
  LiveEventAudienceMicSplitScreen16x9Props
> = ({ left, right, seam, caption, handle }) => {
  const captionPillNode = caption ? (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      startFrame={CAPTION_START_FRAME}
    />
  ) : undefined;

  return (
    <DarkSlateChassis16x9
      handleChip={{ text: handle }}
      captionPill={captionPillNode}
    >
      <SplitFrame
        split="horizontal"
        ratio={0.5}
        gapPx={seam.width}
        seamColor={seam.color}
        firstChild={
          <PaneContent
            src={left.src}
            isVideo={left.isVideo}
            label={left.label}
          />
        }
        secondChild={
          <PaneContent
            src={right.src}
            isVideo={right.isVideo}
            label={right.label}
          />
        }
      />
      <SeamLayer width={seam.width} color={seam.color} />
    </DarkSlateChassis16x9>
  );
};

export default LiveEventAudienceMicSplitScreen16x9;
