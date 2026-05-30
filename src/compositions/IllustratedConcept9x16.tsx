/**
 * IllustratedConcept9x16 — Carlos T22 centered-AI-illustration template.
 *
 * Inspired by @carloscuamatzin's "illustrated concept" reels analyzed in
 * docs/critiques/wave-4/carloscuamatzin-vote1-templates.md (T22 IllustratedConcept).
 *
 * Pattern: a single centered AI-generated illustration acts as the visual hero,
 * with a top eyebrow chapter label, a serif-italic caption line below the image,
 * and optionally a short bullet list. The illustration itself is supplied as an
 * external asset (PNG/JPG path); this composition just renders the slot + frames
 * + Ken Burns motion. If no illustration is provided we render a styled placeholder
 * so the comp is always Studio-previewable.
 *
 * Layout (top → bottom on the 1080×1920 canvas):
 *   1. BrandBreadcrumb (~y=80)
 *   2. Section label chip (mono tracked-uppercase, ~y=220)
 *   3. Illustration:
 *        - "centered" → 800×800 centered on the page
 *        - "split"    → 1080×1080 spanning the full width, top half
 *      Optional subtle Ken Burns zoom (default ON, factor 1.04).
 *   4. captionLine — serif italic ~46px under the image
 *   5. Optional bullets — Inter 500 ~34px, staggered fade-in
 *   6. EditorialCaption at the bottom (default ON — there's room here, unlike
 *      QuoteCard, because the illustration carries the visual weight not text)
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { staggerEntry } from "../animation/staggeredCascade";
import { blurInFocus } from "../animation/blurInFocus";

// --- Local schemas (avoid touching the shared schemas.ts; palette enum here
//     allows the full PaletteMode set rather than the legacy cream|dark pair). ---
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

export const illustratedConcept9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Path to the illustration asset (PNG/JPG). Empty = render placeholder. */
  illustrationSrc: z.string().default(""),
  /** Serif-italic caption line under the image. */
  captionLine: z.string().default(""),
  /** Optional bullet list below the caption. */
  bullets: z.array(z.string()).default([]),
  sectionLabel: z.string().default(""),
  /** "centered" = 800×800 centered; "split" = 1080×1080 top half. */
  layoutMode: z.enum(["centered", "split"]).default("centered"),
  /** Subtle Ken Burns zoom on the illustration. Default true. */
  kenBurns: z.boolean().default(true),
  /** Final zoom factor at the end of the comp. Default 1.04. */
  kenBurnsZoomFactor: z.number().min(1.0).max(1.5).default(1.04),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  /** Seconds before the illustration block enters. Default 0.4. */
  enterSeconds: z.number().min(0).max(10).default(0.4),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type IllustratedConcept9x16Props = z.infer<typeof illustratedConcept9x16Schema>;

// ─── Layout constants ───────────────────────────────────────────────
const BREADCRUMB_Y = 80;
const SECTION_LABEL_Y = 220;
const IMAGE_TOP_CENTERED_Y = 420;
const IMAGE_SIZE_CENTERED = 800;
const IMAGE_TOP_SPLIT_Y = 360;
const IMAGE_SIZE_SPLIT = 1080;
const CAPTION_LINE_GAP = 60; // px below the image
const BULLETS_GAP = 40; // px below the caption line

// ─── Section label chip (mono, tracked uppercase) ───────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
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
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.mono,
        fontWeight: 500,
        fontSize: 28,
        color: accentColor,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Illustration slot (image or placeholder) ───────────────────────
const IllustrationSlot: React.FC<{
  src: string;
  layoutMode: "centered" | "split";
  kenBurns: boolean;
  kenBurnsZoomFactor: number;
  durationInFrames: number;
  paperColor: string;
  mutedColor: string;
  inkColor: string;
}> = ({
  src,
  layoutMode,
  kenBurns,
  kenBurnsZoomFactor,
  durationInFrames,
  paperColor,
  mutedColor,
  inkColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: blur-in-from-defocus (the dominant Carlos opener).
  const enter = blurInFocus({ frame, startFrame: 0, durationFrames: Math.round(0.28 * fps) });

  // Ken Burns: scale interpolates from 1.0 → kenBurnsZoomFactor across the
  // full sequence duration. Combine multiplicatively with the entry scale
  // so they don't fight each other.
  const burnsProgress = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burnsScale = kenBurns
    ? interpolate(burnsProgress, [0, 1], [1.0, kenBurnsZoomFactor])
    : 1.0;
  const finalScale = enter.scale * burnsScale;

  const width = layoutMode === "split" ? IMAGE_SIZE_SPLIT : IMAGE_SIZE_CENTERED;
  const height = width; // both modes are square slots
  const top = layoutMode === "split" ? IMAGE_TOP_SPLIT_Y : IMAGE_TOP_CENTERED_Y;
  const left = (1080 - width) / 2;

  const isPlaceholder = !src;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height,
        overflow: "hidden",
        borderRadius: layoutMode === "centered" ? 24 : 0,
        boxShadow:
          layoutMode === "centered"
            ? `0 24px 80px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)`
            : "none",
        opacity: enter.opacity,
        transform: `scale(${finalScale})`,
        filter: enter.filter,
        transformOrigin: "center center",
        background: paperColor,
      }}
    >
      {isPlaceholder ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `repeating-linear-gradient(45deg, ${paperColor}, ${paperColor} 24px, ${mutedColor}22 24px, ${mutedColor}22 48px)`,
            color: inkColor,
            fontFamily: FONT_STACKS.mono,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: 26,
            opacity: 0.7,
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 600 }}>Illustration slot</div>
          <div style={{ fontSize: 16, opacity: 0.6 }}>
            {layoutMode === "centered" ? `${width}×${height} · centered` : `${width}×${height} · split`}
          </div>
        </div>
      ) : (
        <Img
          src={src.startsWith("http") ? src : staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
};

// ─── Serif-italic caption line under the image ──────────────────────
const CaptionLine: React.FC<{
  text: string;
  y: number;
  inkColor: string;
  fromFrame: number;
}> = ({ text, y, inkColor, fromFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - fromFrame;
  if (localFrame < 0) return null;

  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily: FONT_STACKS.serifItalic,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 46,
        color: inkColor,
        lineHeight: 1.25,
        letterSpacing: "-0.005em",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Bullet list ────────────────────────────────────────────────────
const BulletList: React.FC<{
  bullets: string[];
  y: number;
  inkColor: string;
  accentColor: string;
  baseStartFrame: number;
}> = ({ bullets, y, inkColor, accentColor, baseStartFrame }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 120,
        right: 120,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {bullets.map((b, i) => (
        <Bullet
          key={i}
          text={b}
          inkColor={inkColor}
          accentColor={accentColor}
          fromFrame={staggerEntry({
            index: i,
            baseStartFrame,
            staggerFrames: 5,
            accelerate: true,
          })}
        />
      ))}
    </div>
  );
};

const Bullet: React.FC<{
  text: string;
  inkColor: string;
  accentColor: string;
  fromFrame: number;
}> = ({ text, inkColor, accentColor, fromFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - fromFrame;
  if (localFrame < 0) return null;
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [6, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 18,
        fontFamily: FONT_STACKS.sans,
        fontWeight: 500,
        fontSize: 34,
        color: inkColor,
        lineHeight: 1.3,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 12,
          height: 12,
          borderRadius: 12,
          background: accentColor,
          marginTop: 14,
        }}
      />
      <span>{text}</span>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const IllustratedConcept9x16: React.FC<IllustratedConcept9x16Props> = ({
  audioUrl,
  wordTimings,
  illustrationSrc,
  captionLine,
  bullets,
  sectionLabel,
  layoutMode,
  kenBurns,
  kenBurnsZoomFactor,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
  showCaptions,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

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

  const enterFrame = Math.round(enterSeconds * fps);

  // Y positions for caption + bullets depend on layoutMode (image is in a
  // different place + size).
  const imageBottomY =
    layoutMode === "split"
      ? IMAGE_TOP_SPLIT_Y + IMAGE_SIZE_SPLIT
      : IMAGE_TOP_CENTERED_Y + IMAGE_SIZE_CENTERED;
  const captionLineY = imageBottomY + CAPTION_LINE_GAP;
  const bulletsY = captionLineY + (captionLine ? 100 : 0) + BULLETS_GAP;

  // Caption + bullets enter shortly after the illustration finishes its blur-in.
  const captionFromFrame = enterFrame + Math.round(0.35 * fps);
  const bulletsFromFrame = captionFromFrame + Math.round(0.25 * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette grain overlay */}
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

      {/* Section label chip */}
      {sectionLabel && <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />}

      {/* Illustration slot (image or placeholder) — entrance gated on a Sequence
          so frame=0 inside the IllustrationSlot is the moment it enters. */}
      <Sequence from={enterFrame} durationInFrames={9999} layout="none">
        <IllustrationSlot
          src={illustrationSrc}
          layoutMode={layoutMode}
          kenBurns={kenBurns}
          kenBurnsZoomFactor={kenBurnsZoomFactor}
          // Ken Burns spans the REMAINDER of the composition after entry. Use
          // the outer durationInFrames so the zoom plays for the full lifetime
          // of the comp, not a fixed window.
          durationInFrames={Math.max(1, durationInFrames - enterFrame)}
          paperColor={resolvedPaper}
          mutedColor={resolvedMuted}
          inkColor={resolvedInk}
        />
      </Sequence>

      {/* Serif-italic caption line under the image */}
      {captionLine && (
        <CaptionLine
          text={captionLine}
          y={captionLineY}
          inkColor={resolvedInk}
          fromFrame={captionFromFrame}
        />
      )}

      {/* Bullet list under the caption */}
      {bullets.length > 0 && (
        <BulletList
          bullets={bullets}
          y={bulletsY}
          inkColor={resolvedInk}
          accentColor={resolvedAccent}
          baseStartFrame={bulletsFromFrame}
        />
      )}

      {/* Word-by-word captions in the bottom strip */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 140,
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
