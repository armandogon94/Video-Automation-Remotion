/**
 * KeynoteSlidePIP16x9 — All-In Podcast's Summit chassis pattern.
 *
 * Per Wave-7 ADR-001 §4.1 Rank 2 and `references/creators/allin/ANALYSIS.md`
 * §P2 (`SlideDeckPlusSpeakerPIP16x9`) + §P5 (backdrop fill). The All-In
 * Summit/Davos broadcast grammar: a large keynote slide pinned to the left
 * two-thirds of the frame, a white-bordered face-cam PIP anchored in the
 * lower-right corner, and the persistent ALL-IN/SUMMIT corner chyron — which
 * is present from frame 0 and NEVER animates per the allin grammar finding.
 *
 * Composition order (back-to-front, via DarkSlateChassis16x9):
 *   slate background → optional dimmed backdrop image (earth-at-night) →
 *     keynote slide (left two-thirds, fades up) →
 *     speaker PIP (bottom-right, slides in from lower-right) →
 *     persistent event-lockup chyron (BL by default — never animates)
 *
 * Timing (defaults assume 30fps):
 *   0–12f  slide fades up (opacity 0 → 1)
 *   8–20f  speaker PIP slides in from the lower-right
 *          (translateX 60 → 0, opacity 0 → 1)
 *   0f+    chyron and backdrop are present from frame 0 (no animation)
 *
 * Caption register: 'none'. allin grammar (per ANALYSIS finding) — no
 * burned-in captions on this chassis. Voice-over still drives transcription
 * for accessibility, but we do NOT layer a CaptionPillWithKeyword.
 *
 * Variant: `KeynoteSlidePIP16x9-Davos` swaps the chyron anchor to BR and the
 * regional event token to `DAVOS` — mirrors B21's BeforeAfterText16x9-VS
 * pattern of registering a second Studio entry for a token-swap variant of
 * the same component.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import {
  PersistentEventLockupChyron16x9,
  type PersistentEventLockupChyronAnchor,
} from "../components/chrome/PersistentEventLockupChyron16x9";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const slideSchema = z.object({
  /** Large keynote slide image (or video URL — auto-detected). */
  src: z.string(),
  altText: z.string().optional(),
});

const speakerSchema = z.object({
  /** Speaker PIP source — video URL or static image. */
  src: z.string(),
  /** When true, the src is rendered via <OffthreadVideo>. */
  isVideo: z.boolean().default(false),
  /** PIP width in px. Default 420 — roughly 22% of 1920 frame width. */
  widthPx: z.number().default(420),
});

const backdropSchema = z.object({
  /** Backdrop image src (e.g. earth-at-night satellite imagery). */
  src: z.string(),
  /**
   * Opacity 0–1 — dimmed so the backdrop doesn't compete with the slide.
   * Default 0.3 matches the allin §P5 muted backdrop fill.
   */
  opacity: z.number().default(0.3),
});

const chyronAnchorEnum = z.enum(["BL", "BR", "TL", "TR"]);

const chyronSchema = z.object({
  /** Top line of the persistent lockup. Default 'ARMANDO'. */
  brandToken: z.string().default("ARMANDO"),
  /** Bottom line — regional event token. Default 'SUMMIT'. */
  regionalEventToken: z.string().default("SUMMIT"),
  /** Corner anchor. Default 'BL' (the allin Summit default). */
  anchor: chyronAnchorEnum.default("BL"),
});

export const keynoteSlidePIPSchema = z.object({
  /** Large slide image (the keynote deck). */
  slide: slideSchema,
  /** Speaker PIP (video or static image). */
  speaker: speakerSchema,
  /**
   * Optional backdrop image (e.g. earth-at-night satellite). If omitted, the
   * chassis's default slate slab shows through.
   */
  backdrop: backdropSchema.optional(),
  /** Chyron config (PersistentEventLockupChyron16x9). */
  chyron: chyronSchema.default({
    brandToken: "ARMANDO",
    regionalEventToken: "SUMMIT",
    anchor: "BL",
  }),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(180),
  /** Per Wave-5 contract. */
  transitionVerb: z
    .string()
    .default(
      "Fade up the slide on the left two-thirds while the white-bordered speaker PIP slides in from the lower-right; the persistent event chyron is present from frame 0 — never animates.",
    ),
});

export type KeynoteSlidePIP16x9Props = z.infer<typeof keynoteSlidePIPSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing windows (frames @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────

const SLIDE_FADE_IN = { start: 0, end: 12 } as const;
const SPEAKER_SLIDE_IN = { start: 8, end: 20 } as const;
const SPEAKER_TRANSLATE_X_PX = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const SLIDE_LEFT_INSET_PX = 80;
const SLIDE_MAX_WIDTH_PX = 1280;
const SLIDE_MAX_HEIGHT_PX = 720;
const SLIDE_BORDER_RADIUS_PX = 12;
const SLIDE_DROP_SHADOW = "0 12px 40px rgba(0,0,0,0.55)";

const SPEAKER_EDGE_INSET_PX = 80;
const SPEAKER_ASPECT_RATIO = 16 / 9;
const SPEAKER_BORDER_WIDTH_PX = 4;
const SPEAKER_BORDER_RADIUS_PX = 8;
const SPEAKER_DROP_SHADOW = "0 8px 32px rgba(0,0,0,0.5)";
/**
 * Extra vertical lift applied to the speaker PIP when the chyron is anchored
 * to the same bottom-right corner (Davos variant). The default chyron panel
 * is ~180px tall with a 32px edge inset, so we lift the PIP by ~220px to
 * clear it cleanly without overlap.
 */
const SPEAKER_LIFT_OVER_BR_CHYRON_PX = 220;

// ─────────────────────────────────────────────────────────────────────────────
// Slide layer — fades up on the left two-thirds.
//
// Heuristic for video-vs-image: callers pass a static image src by default
// (the keynote deck export). If a future caller wants a video slide, they
// can use a `.mp4`/`.webm`/`.mov` extension or a streamed URL and we'll
// pick that up via the extension check below.
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_EXTENSION_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

interface SlideLayerProps {
  slide: z.infer<typeof slideSchema>;
}

const SlideLayer: React.FC<SlideLayerProps> = ({ slide }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [SLIDE_FADE_IN.start, SLIDE_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  const looksLikeVideo = VIDEO_EXTENSION_RE.test(slide.src);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: SLIDE_LEFT_INSET_PX,
        transform: "translateY(-50%)",
        width: SLIDE_MAX_WIDTH_PX,
        maxHeight: SLIDE_MAX_HEIGHT_PX,
        borderRadius: SLIDE_BORDER_RADIUS_PX,
        overflow: "hidden",
        boxShadow: SLIDE_DROP_SHADOW,
        opacity,
        pointerEvents: "none",
        background: "#000",
      }}
    >
      {looksLikeVideo ? (
        <OffthreadVideo
          src={slide.src}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Img
          src={slide.src}
          alt={slide.altText ?? ""}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: SLIDE_MAX_HEIGHT_PX,
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Speaker PIP layer — white-bordered tile pinned bottom-right.
//
// Per the spec: 4px white border, rounded 8px, drop-shadow. Slides in from
// translateX +60 → 0 with a fade. Anchored 80px from the bottom-right edge by
// default; the chyron (when in BL anchor) is on the opposite side, so they
// don't fight for the same corner.
// ─────────────────────────────────────────────────────────────────────────────

interface SpeakerPipLayerProps {
  speaker: z.infer<typeof speakerSchema>;
  /** When true, the chyron occupies the same corner — lift the PIP to clear it. */
  liftToClearChyron: boolean;
}

const SpeakerPipLayer: React.FC<SpeakerPipLayerProps> = ({
  speaker,
  liftToClearChyron,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [SPEAKER_SLIDE_IN.start, SPEAKER_SLIDE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  const translateX = interpolate(
    frame,
    [SPEAKER_SLIDE_IN.start, SPEAKER_SLIDE_IN.end],
    [SPEAKER_TRANSLATE_X_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  const heightPx = Math.round(speaker.widthPx / SPEAKER_ASPECT_RATIO);
  const bottomPx =
    SPEAKER_EDGE_INSET_PX +
    (liftToClearChyron ? SPEAKER_LIFT_OVER_BR_CHYRON_PX : 0);

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomPx,
        right: SPEAKER_EDGE_INSET_PX,
        width: speaker.widthPx,
        height: heightPx,
        borderRadius: SPEAKER_BORDER_RADIUS_PX,
        overflow: "hidden",
        border: `${SPEAKER_BORDER_WIDTH_PX}px solid #FFFFFF`,
        boxShadow: SPEAKER_DROP_SHADOW,
        background: "#1A1A1A",
        opacity,
        transform: `translateX(${translateX}px)`,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      {speaker.isVideo ? (
        <OffthreadVideo
          src={speaker.src}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Img
          src={speaker.src}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Backdrop layer — optional dimmed image behind everything.
// ─────────────────────────────────────────────────────────────────────────────

interface BackdropLayerProps {
  backdrop: z.infer<typeof backdropSchema>;
}

const BackdropLayer: React.FC<BackdropLayerProps> = ({ backdrop }) => (
  <AbsoluteFill style={{ opacity: backdrop.opacity, pointerEvents: "none" }}>
    <Img
      src={backdrop.src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  </AbsoluteFill>
);

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const KeynoteSlidePIP16x9: React.FC<KeynoteSlidePIP16x9Props> = ({
  slide,
  speaker,
  backdrop,
  chyron,
  handle,
}) => {
  const chyronAnchor = chyron.anchor as PersistentEventLockupChyronAnchor;
  // The PIP lives in the bottom-right; if the chyron is also in BR, lift the
  // PIP up so it stacks above the chyron panel instead of overlapping it.
  const liftPipToClearChyron = chyronAnchor === "BR";

  return (
    <DarkSlateChassis16x9 handleChip={{ text: handle }}>
      {backdrop ? <BackdropLayer backdrop={backdrop} /> : null}
      <SlideLayer slide={slide} />
      <SpeakerPipLayer
        speaker={speaker}
        liftToClearChyron={liftPipToClearChyron}
      />
      <PersistentEventLockupChyron16x9
        brandToken={chyron.brandToken}
        regionalEventToken={chyron.regionalEventToken}
        anchor={chyronAnchor}
      />
    </DarkSlateChassis16x9>
  );
};

export default KeynoteSlidePIP16x9;
