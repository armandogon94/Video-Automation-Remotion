/**
 * EditorBlock9x16 — vertical (1080×1920) standalone code-editor composition.
 *
 * DIYSmartCode vote3 N6 (docs/critiques/wave-4/diysmartcode-vote3-redteam.md):
 * a VS-Code style code editor mockup distinct from TerminalBlock9x16 — single
 * MacWindow variant "editor" centered, supports `highlightedLines` and
 * `sideAnnotation` (right-margin callout) on top of the EditorContent's
 * built-in glow-rectangle line highlight.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Section label (tracked-uppercase warm-red sans) at ~y=250
 *   - EDITOR window (centered, 940×1080) at ~y=440..1520 with Finder-style
 *     `breadcrumbPath > filename` row at the top
 *   - Bottom: word-by-word EditorialCaption
 *
 * Schema lives at the BOTTOM of this file per project convention.
 */
import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { MacWindow } from "../components/MacWindow";
import {
  FONT_STACKS,
  getPalette,
  getToolAccentForSurface,
  isDarkPalette,
  resolveColors,
} from "../brand";
import { EDITORIAL_SPRING } from "./scenes";

// ─── Layout constants ────────────────────────────────────────────────
const FRAME_W = 1080;
const WINDOW_W = 940;
const WINDOW_H = 1080;
const WINDOW_TOP = 440;
const SECTION_LABEL_Y = 250;

// ─── Local schemas ──────────────────────────────────────────────────
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

const sideAnnotationSchema = z.object({
  line: z.number().int().min(1),
  text: z.string(),
});

// ─── Section label ──────────────────────────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 36,
        color: accentColor,
        letterSpacing: "0.22em",
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
export const EditorBlock9x16: React.FC<EditorBlock9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  filename,
  breadcrumbPath,
  code,
  language,
  highlightedLines,
  sideAnnotation,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
}) => {
  const frame = useCurrentFrame();
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

  const enterFrame = Math.round(enterSeconds * fps);
  const localFrame = frame - enterFrame;
  const chromeEnter =
    localFrame < 0
      ? 0
      : spring({
          frame: localFrame,
          fps,
          config: EDITORIAL_SPRING,
        });
  const chromeOpacity = interpolate(chromeEnter, [0, 1], [0, 1]);
  const chromeTranslateY = interpolate(chromeEnter, [0, 1], [22, 0]);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDarkPalette(palette) ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* EDITOR WINDOW */}
      <div
        style={{
          position: "absolute",
          left: (FRAME_W - WINDOW_W) / 2,
          top: WINDOW_TOP,
          width: WINDOW_W,
          height: WINDOW_H,
          opacity: chromeOpacity,
          transform: `translateY(${chromeTranslateY}px)`,
          borderRadius: 16,
          boxShadow: `0 0 0 1px ${resolvedAccent}22`,
        }}
      >
        <MacWindow
          variant="editor"
          width={WINDOW_W}
          height={WINDOW_H}
          titleBar={filename}
          paletteMode={palette}
          editorProps={{
            filename,
            breadcrumb: breadcrumbPath,
            code,
            language,
            highlightedLines,
            sideAnnotation: sideAnnotation ?? undefined,
            fontSize: 24,
            padding: 22,
          }}
        />
      </div>

      {/* Word-by-word captions */}
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
    </AbsoluteFill>
  );
};

// ─── Schema export ──────────────────────────────────────────────────
export const editorBlock9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default(""),
  filename: z.string().default(""),
  breadcrumbPath: z.array(z.string()).default([]),
  code: z.string().default(""),
  language: z.enum(["ts", "tsx", "json", "sh", "sql"]).default("ts"),
  highlightedLines: z.array(z.number().int().min(1)).default([]),
  sideAnnotation: sideAnnotationSchema.nullable().default(null),
  breadcrumb: breadcrumbSchema.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z
    .enum(["cream", "dark", "warm-black", "true-black", "paper"])
    .default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  enterSeconds: z.number().min(0).default(0.5),
});

export type EditorBlock9x16Props = z.infer<typeof editorBlock9x16Schema>;
