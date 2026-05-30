/**
 * GenerativeBrollWithDiegeticUI9x16 — Simon Hoiberg V3 N4.
 *
 * The "hovering UI" pattern from `docs/critiques/wave-4/simonhoiberg-consensus.md`
 * and `docs/critiques/wave-4/simonhoiberg-vote3-redteam.md` (N4). Full-frame
 * AI-generated B-roll (Sora/Veo/Kling output) plays underneath while a Mac-
 * window UI mockup (e.g. a GitHub Pull-Request editor) floats centered in the
 * frame with a holographic glow halo + slight rotation. Optional secondary UI
 * (e.g. a terminal output) sits below the primary one — the two UIs read as
 * a single "diegetic" interface in the robot's world.
 *
 * Grammar:
 *   - <OffthreadVideo> per B-roll plate, each wrapped in <Sequence> for HARD
 *     CUTS at `startSeconds` boundaries (no transitions — cross-creator
 *     consensus).
 *   - Optional CSS `filter: saturate()` per-plate (default 1.0; callers
 *     desaturate plates that compete with the UI overlay's brand color).
 *   - Primary UI is a <MacWindow variant=…/> at centerYpx, rotated
 *     rotationDegrees, with a radial drop-shadow ring acting as the "hologram"
 *     glow. SecondaryUI renders below it at +gap.
 *   - SectionLabel chip top-left at y=200 (matching Simon's house grammar).
 *   - Captions: chunked / editorial / none.
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
} from "remotion";
import { z } from "zod";
import { ChunkedPhraseCaption } from "../components/captions/ChunkedPhraseCaption";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { MacWindow, type MacWindowVariant } from "../components/MacWindow";
import {
  getPalette,
  getToolAccentForSurface,
  resolveColors,
} from "../brand";

// ─── Shared sub-schemas (mirrored from compositions/schemas.ts) ──────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
export type GenerativeBrollWordTiming = z.infer<typeof wordTimingSchema>;

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});
export type GenerativeBrollBreadcrumb = z.infer<typeof breadcrumbSchema>;

// ─── B-roll plate ──────────────────────────────────────────────────────────
const brollClipSchema = z.object({
  src: z.string(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  /** Multiplier on CSS saturate. Default 1.0 (no change). Set 0.3 for a moody
   *  AI-plate vibe so the UI's brand color reads dominant. */
  saturation: z.number().default(1.0),
});
export type GenerativeBrollClip = z.infer<typeof brollClipSchema>;

// ─── Diegetic UI overlay ───────────────────────────────────────────────────
/**
 * A floating MacWindow UI overlay. Maps to the same `variant` discriminator as
 * MacWindow itself ("editor" | "browser" | "terminal" | "doc"). The "phone"
 * variant is deliberately not exposed here — the diegetic-UI pattern is built
 * around Mac-window-chrome surfaces (editor / terminal / browser / doc).
 */
const diegeticUIKindEnum = z.enum(["editor", "browser", "terminal", "doc"]);
export type DiegeticUIKind = z.infer<typeof diegeticUIKindEnum>;

const diegeticUISchema = z.object({
  kind: diegeticUIKindEnum,
  /** macOS title-bar string (e.g. `~/pulls/#3429 — GitHub`). */
  title: z.string().default(""),
  // Per-variant content fields. Only the ones matching `kind` are read.
  code: z.string().default(""),
  language: z.enum(["ts", "tsx", "json", "sh", "sql"]).default("ts"),
  filename: z.string().default(""),
  /** Editor breadcrumb path (e.g. `["src","compositions","X.tsx"]`). */
  breadcrumbPath: z.array(z.string()).default([]),
  /** For browser variant. */
  browserUrl: z.string().default(""),
  /** For doc variant — raw markdown. */
  markdown: z.string().default(""),
  /** For terminal variant — pre-rendered lines. */
  terminalLines: z
    .array(
      z.object({
        kind: z.enum(["prompt", "output", "comment"]).default("prompt"),
        text: z.string(),
      }),
    )
    .default([]),
  /** Centerline Y position of the UI overlay, in px. Default 800 (upper-mid). */
  centerYpx: z.number().default(800),
  /** Width of the UI in px. Default 800. */
  width: z.number().default(800),
  /** Height of the UI in px. Default 560. */
  height: z.number().default(560),
  /** Rotation in degrees for the holographic feel. Default -3. */
  rotationDegrees: z.number().default(-3),
  /** Whether to draw the glow halo behind. Default true. */
  glow: z.boolean().default(true),
  /** Glow color. Empty string = use accentColor. */
  glowColor: z.string().default(""),
});
export type DiegeticUI = z.infer<typeof diegeticUISchema>;

// ─── Composition schema ────────────────────────────────────────────────────
export const generativeBrollWithDiegeticUI9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  brollClips: z.array(brollClipSchema).default([]),
  diegeticUI: diegeticUISchema,
  /** Optional second UI overlay (renders below the primary). Null = none. */
  secondaryUI: diegeticUISchema.nullable().default(null),
  sectionLabel: z.string().default(""),
  showCaptions: z.boolean().default(true),
  captionMode: z.enum(["chunked", "editorial", "none"]).default("chunked"),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(56),
  brandId: z.string().optional(),
});
export type GenerativeBrollWithDiegeticUI9x16Props = z.infer<
  typeof generativeBrollWithDiegeticUI9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;
const SECTION_LABEL_TOP = 200;
const SECTION_LABEL_LEFT = 70;

// ─── Helpers ───────────────────────────────────────────────────────────────

function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

// ─── SectionLabel chip ─────────────────────────────────────────────────────
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

// ─── B-roll plate ──────────────────────────────────────────────────────────
const BrollPlate: React.FC<{
  clip: GenerativeBrollClip;
  fallbackBg: string;
}> = ({ clip, fallbackBg }) => {
  const resolved = resolveSrc(clip.src);
  const saturation = Number.isFinite(clip.saturation) ? clip.saturation : 1.0;
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
            filter: `saturate(${saturation})`,
            display: "block",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── Floating diegetic UI overlay ──────────────────────────────────────────
const DiegeticUIOverlay: React.FC<{
  ui: DiegeticUI;
  accentColor: string;
  paletteMode: "cream" | "dark";
}> = ({ ui, accentColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowColor = ui.glowColor || accentColor;
  // Compose the per-variant props for MacWindow.
  const titleBar = ui.title || undefined;

  const macWindowProps = (() => {
    switch (ui.kind) {
      case "editor":
        return {
          variant: "editor" as MacWindowVariant,
          editorProps: {
            filename: ui.filename || "main.tsx",
            breadcrumb:
              ui.breadcrumbPath.length > 0 ? ui.breadcrumbPath : undefined,
            code: ui.code,
            language: ui.language,
          },
        };
      case "browser":
        return {
          variant: "browser" as MacWindowVariant,
          browserProps: {
            url: ui.browserUrl || "github.com/armandointeligencia",
          },
        };
      case "terminal":
        return {
          variant: "terminal" as MacWindowVariant,
          terminalProps: {
            frame,
            fps,
            lines: ui.terminalLines.map((l) => ({
              kind: l.kind,
              text: l.text,
            })),
          },
        };
      case "doc":
        return {
          variant: "doc" as MacWindowVariant,
          docProps: {
            filename: ui.filename || "NOTES.md",
            markdown: ui.markdown,
          },
        };
    }
  })();

  return (
    <div
      style={{
        position: "absolute",
        top: ui.centerYpx,
        left: "50%",
        transform: `translate(-50%, -50%) rotate(${ui.rotationDegrees}deg)`,
        width: ui.width,
        height: ui.height,
        // The "hologram" glow — a soft radial halo behind the window. We render
        // it as a box-shadow ring on the wrapper so the rotation transform on
        // the parent carries the glow with the window as a single unit.
        boxShadow: ui.glow
          ? `0 0 80px 20px ${glowColor}55, 0 0 160px 40px ${glowColor}22, 0 30px 60px rgba(0,0,0,0.45)`
          : "0 30px 60px rgba(0,0,0,0.45)",
        borderRadius: 14,
      }}
    >
      <MacWindow
        {...macWindowProps}
        width={ui.width}
        height={ui.height}
        titleBar={titleBar}
        paletteMode={paletteMode}
      />
    </div>
  );
};

// ─── Captions selector ─────────────────────────────────────────────────────
const Captions: React.FC<{
  mode: "chunked" | "editorial" | "none";
  enabled: boolean;
  wordTimings: GenerativeBrollWordTiming[];
  fontSize: number;
  accentColor: string;
  paperColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({
  mode,
  enabled,
  wordTimings,
  fontSize,
  accentColor,
  paperColor,
  inkColor,
  mutedColor,
}) => {
  if (!enabled || mode === "none" || wordTimings.length === 0) return null;
  if (mode === "editorial") {
    return (
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 200,
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
  return (
    <ChunkedPhraseCaption
      wordTimings={wordTimings}
      style={{
        position: "bottom",
        distancePx: 240,
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
export const GenerativeBrollWithDiegeticUI9x16: React.FC<
  GenerativeBrollWithDiegeticUI9x16Props
> = ({
  audioUrl,
  wordTimings,
  brollClips,
  diegeticUI,
  secondaryUI,
  sectionLabel,
  showCaptions,
  captionMode,
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
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  const resolvedAudioUrl = resolveSrc(audioUrl);
  const fallbackBrollBg = `${resolvedInk}CC`;

  return (
    <AbsoluteFill style={{ background: resolvedInk }}>
      {resolvedAudioUrl && <Audio src={resolvedAudioUrl} />}

      {/* B-roll plates — one <Sequence> per clip, mounting boundaries ARE the
          hard cuts. Painter order: later index draws on top during overlaps,
          though the convention is non-overlapping windows. */}
      {brollClips.map((clip, i) => {
        const startFrame = Math.max(0, Math.round(clip.startSeconds * fps));
        const durationInFrames = Math.max(
          1,
          Math.round((clip.endSeconds - clip.startSeconds) * fps),
        );
        return (
          <Sequence
            key={`gen-broll-${i}`}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <BrollPlate clip={clip} fallbackBg={fallbackBrollBg} />
          </Sequence>
        );
      })}

      {/* Palette grain — sits ABOVE the B-roll, BELOW the UI overlay so the
          floating UI reads as foreground / pristine, while the plate behind
          gets the editorial tinted-grain treatment. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Primary UI overlay */}
      <DiegeticUIOverlay
        ui={diegeticUI}
        accentColor={resolvedAccent}
        paletteMode={palette}
      />

      {/* Optional secondary UI overlay */}
      {secondaryUI && (
        <DiegeticUIOverlay
          ui={secondaryUI}
          accentColor={resolvedAccent}
          paletteMode={palette}
        />
      )}

      {/* Breadcrumb (top) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Eyebrow chip */}
      <SectionLabel
        text={sectionLabel}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />

      {/* Captions */}
      <Captions
        mode={captionMode}
        enabled={showCaptions}
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
