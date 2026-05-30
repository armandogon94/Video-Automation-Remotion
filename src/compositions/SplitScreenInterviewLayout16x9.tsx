/**
 * SplitScreenInterviewLayout16x9 — Nate B Jones consensus pattern M7.
 *
 * 16:9 (1920×1080) split-screen webcam podcast/interview layout. TWO video
 * panels render side-by-side at 50/50 ratio and persist for the entire
 * composition duration — NO transitions between panels, NO crossfades into
 * the split, NO slides. It's a structural layout, not an episodic one.
 *
 * Visual structure (left → right):
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ ANTHROPIC · MAY 27, 2026                                         │  ← BrandBreadcrumb16x9
 *   │                                                                  │
 *   │   ┌──────────────────────┐  ┌──────────────────────┐             │
 *   │   │                      │  │                      │             │
 *   │   │   LEFT WEBCAM        │  │   RIGHT WEBCAM       │             │
 *   │   │   (OffthreadVideo,   │  │   (OffthreadVideo,   │             │
 *   │   │    object-cover)     │  │    object-cover)     │             │
 *   │   │                      │  │                      │             │
 *   │   └──────────────────────┘  └──────────────────────┘             │
 *   │        Nate B Jones             Guest Name                       │
 *   │        AI ANALYST               PARTNER, FOO CAP                 │
 *   │                                                                  │
 *   │ ┌────────────────────────────────────────────────────────────┐ ▒ │  ← optional lower-third
 *   │ │  ON: AGENT INFRASTRUCTURE                                  │   │     banner (crossfades)
 *   │ │  Why long-context RAG isn't dead yet                       │   │
 *   │ └────────────────────────────────────────────────────────────┘   │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 *   Optional YellowGlowLowerThird (Hormozi-style emphasis) can overlay
 *   the banner zone for cross-pattern remixing.
 *   BrandWatermark16x9 anchors bottom-right (handle alongside the logo).
 *
 * House-grammar parity with the rest of the library:
 *   - palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccentForSurface()
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional <BrandBreadcrumb16x9> top-left
 *   - optional <BrandWatermark16x9> bottom-right
 *   - optional caption strip (editorial or karaoke)
 *
 * Schema + type are exported at the bottom of the file (self-contained, like
 * BrollListicle9x16 — does NOT touch src/compositions/schemas.ts).
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { YellowGlowLowerThird } from "../components/YellowGlowLowerThird";
import { NameTagStackedLowerThird } from "../components/NameTagStackedLowerThird";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { ChunkedPhraseCaption } from "../components/captions/ChunkedPhraseCaption";
import {
  ALL_PALETTE_MODES,
  FONT_STACKS,
  getPalette,
  getToolAccentForSurface,
  resolveColors,
} from "../brand";

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Panels: 880×720 each, with a 40px gutter between them. Centered horizontally:
//   left  panel: x = 60..940
//   right panel: x = 980..1860
// Vertically anchored y = 140..860 (leaves room for breadcrumb above + name tags below).
const PANEL_W = 880;
const PANEL_H = 720;
const PANEL_TOP = 140;
const LEFT_PANEL_X = 60;
const RIGHT_PANEL_X = 980;
const NAME_TAG_Y = 880; // baseline for the name tag block under each panel
const PANEL_RADIUS = 18;

// Lower-third banner: anchored to the bottom 200px of the frame.
const LOWER_THIRD_HEIGHT = 200;
const LOWER_THIRD_TOP = CANVAS_H - LOWER_THIRD_HEIGHT;
const BANNER_FADE_FRAMES = 8;

// ─── Sub-schemas ───────────────────────────────────────────────────────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type SplitScreenInterviewWordTiming = z.infer<
  typeof wordTimingSchema_local
>;

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});
export type SplitScreenInterviewBreadcrumb = z.infer<
  typeof breadcrumbSchema_local
>;

const speakerSchema = z.object({
  /** Optional looping webcam <OffthreadVideo>. */
  videoSrc: z.string().default(""),
  /** Fallback still image used when videoSrc is empty. */
  imageSrc: z.string().default(""),
  /** Display name under the panel. */
  nameTag: z.string().default("Host"),
  /** Optional title/role line under the name (mono tracked uppercase). */
  title: z.string().default(""),
  /** Optional accent color for the name tag (empty = palette default). */
  accentColor: z.string().default(""),
});
export type SplitScreenInterviewSpeaker = z.infer<typeof speakerSchema>;

const lowerThirdSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  /** Frame at which the banner crossfades IN. */
  enterFrame: z.number().default(60),
  /** Frame at which the banner crossfades OUT. */
  exitFrame: z.number().default(300),
});
export type SplitScreenInterviewLowerThird = z.infer<typeof lowerThirdSchema>;

const yellowGlowSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().default(""),
  subtitle: z.string().default(""),
  enterFrame: z.number().default(0),
  visibleFrames: z.number().default(120),
});
export type SplitScreenInterviewYellowGlow = z.infer<typeof yellowGlowSchema>;

// ─── Composition schema ────────────────────────────────────────────────────
export const splitScreenInterviewLayout16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Left speaker. */
  left: speakerSchema.default({
    videoSrc: "",
    imageSrc: "",
    nameTag: "Host",
    title: "",
    accentColor: "",
  }),

  /** Right speaker. */
  right: speakerSchema.default({
    videoSrc: "",
    imageSrc: "",
    nameTag: "Guest",
    title: "",
    accentColor: "",
  }),

  /** Optional full-width lower-third banner overlay. */
  lowerThird: lowerThirdSchema.default({
    enabled: false,
    title: "",
    subtitle: "",
    enterFrame: 60,
    exitFrame: 300,
  }),

  /** Optional YellowGlowLowerThird overlay (Hormozi-style emphasis). */
  yellowGlow: yellowGlowSchema.default({
    enabled: false,
    text: "",
    subtitle: "",
    enterFrame: 0,
    visibleFrames: 120,
  }),

  /** Whether to desaturate the two video panels. Default false. */
  desaturate: z.boolean().default(false),

  /** Caption mode — match the rest of the long-form library. */
  captionMode: z.enum(["editorial", "karaoke", "none"]).default("none"),

  sectionLabel: z.string().default(""),

  // Wave-5 contract: every template schema exposes a transitionVerb describing
  // how its layers move. Consumed by the planner / template picker.
  transitionVerb: z
    .string()
    .default(
      "Two video panels render side-by-side at 50/50 ratio for the entire composition duration (no transitions, persistent layout). Each speaker has a name tag below with optional accent-colored title. Optional lower-third banner crossfades in at enterFrame and out at exitFrame.",
    ),

  // Brand chrome (16:9 variants).
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
export type SplitScreenInterviewLayout16x9Props = z.infer<
  typeof splitScreenInterviewLayout16x9Schema
>;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Resolve a media src: empty → null; absolute URL passes through; everything
 *  else is wrapped in staticFile(). */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

/** Crossfade opacity envelope between enterFrame and exitFrame. */
function bannerOpacity(
  frame: number,
  enterFrame: number,
  exitFrame: number,
  fadeFrames: number,
): number {
  if (frame < enterFrame) return 0;
  if (frame >= exitFrame) return 0;
  const inEnd = enterFrame + fadeFrames;
  const outStart = Math.max(inEnd, exitFrame - fadeFrames);
  if (frame < inEnd) {
    return interpolate(frame, [enterFrame, inEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (frame >= outStart) {
    return interpolate(frame, [outStart, exitFrame], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return 1;
}

// ─── Single 50%-width video panel ──────────────────────────────────────────
const SpeakerPanel: React.FC<{
  speaker: SplitScreenInterviewSpeaker;
  x: number;
  desaturate: boolean;
  accentColor: string;
  inkColor: string;
}> = ({ speaker, x, desaturate, accentColor, inkColor }) => {
  const videoSrc = resolveSrc(speaker.videoSrc);
  const imageSrc = resolveSrc(speaker.imageSrc);

  // Fallback when neither video nor image is provided: a paper-tinted ink block
  // (matches the SplitWebcamScreen9x16 fallback grammar). Obvious-but-on-brand.
  const fallbackBg = `${inkColor}22`;
  const filter = desaturate ? "saturate(0.4)" : "none";

  return (
    <div
      style={{
        position: "absolute",
        top: PANEL_TOP,
        left: x,
        width: PANEL_W,
        height: PANEL_H,
        overflow: "hidden",
        borderRadius: PANEL_RADIUS,
        background: fallbackBg,
        border: `2px solid ${accentColor}`,
        boxShadow: "0 12px 36px rgba(0,0,0,0.32), 0 2px 0 rgba(255,255,255,0.04)",
      }}
    >
      {videoSrc ? (
        <OffthreadVideo
          src={videoSrc}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            filter,
            display: "block",
          }}
        />
      ) : imageSrc ? (
        <Img
          src={imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            filter,
            display: "block",
          }}
        />
      ) : null}
    </div>
  );
};

// ─── Lower-third banner (full-width, semi-transparent dark base) ───────────
const LowerThirdBanner: React.FC<{
  banner: SplitScreenInterviewLowerThird;
  accentColor: string;
  inkColor: string;
}> = ({ banner, accentColor, inkColor }) => {
  const frame = useCurrentFrame();
  const opacity = bannerOpacity(
    frame,
    banner.enterFrame,
    banner.exitFrame,
    BANNER_FADE_FRAMES,
  );
  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: LOWER_THIRD_TOP,
        left: 0,
        width: CANVAS_W,
        height: LOWER_THIRD_HEIGHT,
        // Dark semi-transparent base over either palette — looks like a TV chyron.
        background: `linear-gradient(180deg, ${inkColor}00 0%, ${inkColor}E6 22%, ${inkColor}F2 100%)`,
        borderTop: `3px solid ${accentColor}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 80px",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 64,
          color: "#FFFFFF",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          textShadow: "0 2px 8px rgba(0,0,0,0.45)",
          maxWidth: CANVAS_W - 160,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {banner.title}
      </div>
      {banner.subtitle ? (
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: 28,
            color: accentColor,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            maxWidth: CANVAS_W - 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {banner.subtitle}
        </div>
      ) : null}
    </div>
  );
};

// ─── Section label chip (top-left eyebrow under breadcrumb) ────────────────
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
        top: 120,
        left: 60,
        padding: "8px 16px",
        background: `${inkColor}E6`,
        border: `1px solid ${accentColor}`,
        borderRadius: 4,
        fontFamily: FONT_STACKS.mono,
        fontWeight: 600,
        fontSize: 20,
        color: accentColor,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

// ─── Captions selector ─────────────────────────────────────────────────────
const Captions: React.FC<{
  mode: "editorial" | "karaoke" | "none";
  wordTimings: SplitScreenInterviewWordTiming[];
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
          distancePx: 60,
          fontSize,
          accentColor,
          mutedBorderColor: `${mutedColor}33`,
          maxWidthPx: 1400,
          paperColor,
          inkColor,
        }}
      />
    );
  }

  // karaoke — Hormozi step-function with TikTok stroke.
  return (
    <ChunkedPhraseCaption
      wordTimings={wordTimings}
      style={{
        position: "bottom",
        distancePx: 80,
        fontSize,
        textColor: "#FFFFFF",
        style: "drop-shadow",
        strokeWidthPx: 4,
        windowSize: 3,
        maxWidthPx: 1400,
      }}
    />
  );
};

// ─── Composition ───────────────────────────────────────────────────────────
export const SplitScreenInterviewLayout16x9: React.FC<
  SplitScreenInterviewLayout16x9Props
> = ({
  audioUrl,
  wordTimings,
  left,
  right,
  lowerThird,
  yellowGlow,
  desaturate,
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
  showCaptions,
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

  const resolvedAudio = resolveSrc(audioUrl);
  const captionsActive = showCaptions || captionMode !== "none";

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {/* Voiceover */}
      {resolvedAudio && <Audio src={resolvedAudio} />}

      {/* ── z=10: Left panel ── */}
      <SpeakerPanel
        speaker={left}
        x={LEFT_PANEL_X}
        desaturate={desaturate}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />

      {/* ── z=11: Right panel ── */}
      <SpeakerPanel
        speaker={right}
        x={RIGHT_PANEL_X}
        desaturate={desaturate}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />

      {/* ── z=12: Name tags under each panel ── */}
      <NameTagStackedLowerThird
        name={left.nameTag}
        title={left.title || undefined}
        accentColor={left.accentColor || resolvedAccent}
        mutedColor={resolvedMuted}
        inkColor={resolvedInk}
        top={NAME_TAG_Y}
        left={LEFT_PANEL_X}
        width={PANEL_W}
      />
      <NameTagStackedLowerThird
        name={right.nameTag}
        title={right.title || undefined}
        accentColor={right.accentColor || resolvedAccent}
        mutedColor={resolvedMuted}
        inkColor={resolvedInk}
        top={NAME_TAG_Y}
        left={RIGHT_PANEL_X}
        width={PANEL_W}
      />

      {/* ── z=20: Palette grain overlay (above panels, below overlays) ── */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* ── z=30: Optional full-width lower-third banner ── */}
      {lowerThird.enabled ? (
        <LowerThirdBanner
          banner={lowerThird}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
        />
      ) : null}

      {/* ── z=31: Optional YellowGlowLowerThird (Hormozi-style emphasis) ── */}
      {yellowGlow.enabled ? (
        <YellowGlowLowerThird
          text={yellowGlow.text}
          subtitle={yellowGlow.subtitle || undefined}
          enterFrame={yellowGlow.enterFrame}
          visibleFrames={yellowGlow.visibleFrames}
          fadeInFrames={6}
          fadeOutFrames={6}
          bottomPx={lowerThird.enabled ? 240 : 160}
        />
      ) : null}

      {/* ── z=40: Brand chrome ── */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}
      <SectionLabel
        text={sectionLabel}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />
      <BrandWatermark16x9
        style={{
          enabled: true,
          logo: "avatar",
          position: "bottom-right",
          size: 96,
          opacity: 0.9,
        }}
      />

      {/* ── z=50: Captions ── */}
      {captionsActive ? (
        <Captions
          mode={captionMode === "none" ? "editorial" : captionMode}
          wordTimings={wordTimings}
          fontSize={captionFontSize}
          accentColor={resolvedAccent}
          paperColor={resolvedPaper}
          inkColor={resolvedInk}
          mutedColor={resolvedMuted}
        />
      ) : null}
    </AbsoluteFill>
  );
};
