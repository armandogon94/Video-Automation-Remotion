/**
 * CamcorderFrame9x16 — DIYSmart V1 T15 META-TEMPLATE.
 *
 * "Camcorder/REC viewfinder" meta-wrapper. Renders a near-black canvas with the
 * shared <MockOSChrome> as the frame furniture (REC dot + corner brackets +
 * left icon rail + brand title / classification banner). Adds:
 *   - Live HH:MM:SS timecode that scrubs forward per render frame.
 *   - Optional N/total pagination counter (bottom-left).
 *   - Subtle vertical ASCII-noise columns down both edges (deterministic via
 *     FNV-1a — no Math.random).
 *
 * Inner content is sequenced via `scenes` (chapter + headline + body) — same
 * "slot" pattern as <GeminiFrameWrapper9x16>, so the wrapper can host any of
 * our existing 9x16 templates.
 *
 * Wave-4 critique tie-in: DIYSmart V3 N2 red-team finding called out a missing
 * "Camcorder/REC" framing — this is the dedicated wrapper for that aesthetic.
 */
import React, { useMemo } from "react";
import { z } from "zod";
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
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { MockOSChrome } from "../components/BrandGlyphs";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Local schema fragments ───────────────────────────────────────────────────
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

const camcorderSceneSchema = z.object({
  /** Eyebrow chapter label (e.g. "RECON", "INTEL", "WRAP"). Tracked mono. */
  chapter: z.string(),
  /** Hero headline (Inter Black). */
  headline: z.string(),
  /** 1–3 lines of body copy. */
  body: z.string().default(""),
  /** Duration of this scene in seconds. */
  durationSeconds: z.number().min(0.5).max(60).default(3.0),
});
export type CamcorderScene = z.infer<typeof camcorderSceneSchema>;

export const camcorderFrame9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Brand title rendered in the top-left of the MockOSChrome. */
  brandTitle: z.string().default("ARMANDO INTELLIGENCE"),
  /** Classification banner (center of MockOSChrome). */
  classification: z.string().default("CLASSIFICATION: SECRET//NOFORN"),
  /** Static timestamp override. When empty AND `liveTimecode` is true, the timestamp
   *  auto-generates as HH:MM:SS based on the current frame / fps. */
  timestamp: z.string().default(""),
  scenes: z.array(camcorderSceneSchema).default([]),
  /** Show the pulsing red "● REC" indicator. */
  showRecIndicator: z.boolean().default(true),
  /** Show the left vertical icon rail. */
  showIconRail: z.boolean().default(true),
  /** Show corner viewfinder brackets. */
  showCornerBrackets: z.boolean().default(true),
  /** Live timecode advances per frame (HH:MM:SS). */
  liveTimecode: z.boolean().default(true),
  /** Total slides counter — when set, shows "NN / total" bottom-left. */
  totalSlides: z.number().int().min(1).max(999).optional(),
  /** Current slide number (used with totalSlides). Default 1. */
  currentSlide: z.number().int().min(1).max(999).default(1),
  /** Render the subtle garbled-character noise columns on both edges. */
  showNoiseColumns: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z
    .enum(["cream", "dark", "warm-black", "true-black", "paper"])
    .default("warm-black"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  brandId: z.string().optional(),
});
export type CamcorderFrame9x16Props = z.infer<typeof camcorderFrame9x16Schema>;

// ─── Layout constants ─────────────────────────────────────────────────────────
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const NOISE_COL_WIDTH = 36;
const NOISE_CHARS = "0123456789ABCDEF";

// ─── FNV-1a deterministic noise (no Math.random) ──────────────────────────────
function fnv1a(input: number): number {
  let h = 0x811c9dc5;
  let n = Math.floor(input) | 0;
  for (let i = 0; i < 8; i += 1) {
    h ^= n & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
    n = n >>> 8;
  }
  return h;
}

// ─── HH:MM:SS formatter ───────────────────────────────────────────────────────
function pad2(n: number): string {
  const v = Math.max(0, Math.floor(n));
  return v < 10 ? `0${v}` : `${v}`;
}

function formatTimecode(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

// ─── ASCII-noise column ───────────────────────────────────────────────────────
const NoiseColumn: React.FC<{
  side: "left" | "right";
  accentColor: string;
}> = ({ side, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const secondIndex = Math.floor(frame / fps);

  // ~50 glyph rows down the column
  const rowCount = 60;
  const rowHeight = FRAME_HEIGHT / rowCount;

  // Single column of glyphs hugging the edge
  const colIndex = side === "left" ? 0 : 1;

  const glyphs = useMemo(() => {
    const out: { ch: string; alpha: number; y: number }[] = [];
    for (let row = 0; row < rowCount; row += 1) {
      const seed = fnv1a(colIndex * 7919 + row * 31 + secondIndex);
      const charIdx = seed % NOISE_CHARS.length;
      const alpha = 0.10 + ((seed >> 8) % 100) / 1000; // 0.10..0.20
      out.push({
        ch: NOISE_CHARS[charIdx],
        alpha,
        y: row * rowHeight,
      });
    }
    return out;
  }, [colIndex, secondIndex, rowHeight]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: NOISE_COL_WIDTH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
        fontFamily: FONT_STACKS.mono,
        fontSize: 14,
        letterSpacing: "0.1em",
      }}
      aria-hidden
    >
      {glyphs.map((g, i) => (
        <div
          key={`g-${side}-${i}`}
          style={{
            position: "absolute",
            top: g.y,
            color: accentColor,
            opacity: g.alpha,
            lineHeight: 1,
          }}
        >
          {g.ch}
        </div>
      ))}
    </div>
  );
};

// ─── Scene slot — chapter eyebrow + headline + body ───────────────────────────
const SceneSlot: React.FC<{
  scene: CamcorderScene;
  accentColor: string;
  inkColor: string;
}> = ({ scene, accentColor, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        top: 460,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 28,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.mono,
          fontSize: 26,
          fontWeight: 600,
          color: accentColor,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
        }}
      >
        {scene.chapter}
      </div>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: 92,
          color: "#FFFFFF",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
        }}
      >
        {scene.headline}
      </div>
      {scene.body ? (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 300,
            fontSize: 38,
            color: inkColor,
            lineHeight: 1.35,
            opacity: 0.92,
            maxWidth: 800,
          }}
        >
          {scene.body}
        </div>
      ) : null}
    </div>
  );
};

// ─── Live timecode (auto-advances each frame) ─────────────────────────────────
const LiveTimecode: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalSeconds = frame / fps;
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        right: 96,
        fontFamily: FONT_STACKS.mono,
        fontSize: 22,
        fontWeight: 600,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        pointerEvents: "none",
      }}
    >
      TC {formatTimecode(totalSeconds)}
    </div>
  );
};

// ─── Composition ──────────────────────────────────────────────────────────────
export const CamcorderFrame9x16: React.FC<CamcorderFrame9x16Props> = ({
  audioUrl,
  wordTimings,
  brandTitle,
  classification,
  timestamp,
  scenes,
  showRecIndicator,
  showIconRail,
  showCornerBrackets,
  liveTimecode,
  totalSlides,
  currentSlide,
  showNoiseColumns,
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

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedInk = colors.ink;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Build sequence layout
  const sceneLayout = useMemo(() => {
    let cursor = 0;
    return scenes.map((s) => {
      const fromFrame = Math.round(cursor * fps);
      const durationFrames = Math.max(1, Math.round(s.durationSeconds * fps));
      cursor += s.durationSeconds;
      return { scene: s, fromFrame, durationFrames };
    });
  }, [scenes, fps]);

  // MockOSChrome timestamp:
  //   - If `liveTimecode` we render our own LiveTimecode element and SUPPRESS the
  //     chrome's own static timestamp (otherwise we'd render two timestamps).
  //   - Otherwise we forward the explicit `timestamp` string to MockOSChrome.
  const chromeTimestamp = liveTimecode ? undefined : timestamp || undefined;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #0E0E10 0%, #14110F 50%, #1A1614 100%)",
      }}
    >
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Subtle palette grain — Carlos warm-vignette feel */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* MockOSChrome supplies the camcorder frame furniture */}
      <MockOSChrome
        brandTitle={brandTitle}
        classification={classification}
        timestamp={chromeTimestamp}
        showCornerBrackets={showCornerBrackets}
        showRecIndicator={showRecIndicator}
        showIconRail={showIconRail}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        accentColor={resolvedAccent}
      />

      {/* Live timecode overrides the static chrome timestamp */}
      {liveTimecode ? <LiveTimecode accentColor={resolvedAccent} /> : null}

      {/* Garbled-character noise columns down both edges */}
      {showNoiseColumns ? (
        <>
          <NoiseColumn side="left" accentColor={resolvedAccent} />
          <NoiseColumn side="right" accentColor={resolvedAccent} />
        </>
      ) : null}

      {/* House-grammar breadcrumb (optional, below the brand title bar) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
          topPx={210}
        />
      )}

      {/* Scene slot — sequenced inner content */}
      {sceneLayout.map((entry, idx) => (
        <Sequence
          key={`scene-${idx}`}
          from={entry.fromFrame}
          durationInFrames={entry.durationFrames}
          layout="none"
        >
          <SceneSlot
            scene={entry.scene}
            accentColor={resolvedAccent}
            inkColor={resolvedInk}
          />
        </Sequence>
      ))}

      {/* Pagination counter (bottom-left) */}
      {totalSlides ? (
        <div
          style={{
            position: "absolute",
            bottom: 96,
            left: 96,
            fontFamily: FONT_STACKS.mono,
            fontSize: 22,
            fontWeight: 600,
            color: resolvedAccent,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          {pad2(currentSlide)} / {pad2(totalSlides)}
        </div>
      ) : null}

      {/* Word-by-word captions */}
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 260,
          fontSize: captionFontSize,
          accentColor: resolvedAccent,
          mutedBorderColor: `${colors.muted}33`,
          maxWidthPx: 880,
          paperColor: "rgba(14,14,16,0.65)",
          inkColor: "#FFFFFF",
        }}
      />
    </AbsoluteFill>
  );
};
