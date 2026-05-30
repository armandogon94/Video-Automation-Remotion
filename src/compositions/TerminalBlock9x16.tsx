/**
 * TerminalBlock9x16 — vertical (1080×1920) standalone terminal composition.
 *
 * DIYSmartCode vote3 N5 (docs/critiques/wave-4/diysmartcode-vote3-redteam.md):
 * a terminal mockup distinct from EditorBlock9x16 — single MacWindow variant
 * "terminal" centered, sized ~880×1080, with an optional SceneChapterChip
 * overlay and an optional outer card border. Typewriter mode (default ON)
 * uses the deliberate linear easing contract from `TerminalContent`.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Section label (tracked-uppercase warm-red sans) at ~y=250
 *   - Optional SceneChapterChip overlay (top-center) at ~y=340
 *   - TERMINAL window (centered, 880×1080) at ~y=440..1520
 *       · Editorial-spring entrance (calmer than punchy — typewriter does the work)
 *       · Optional thin accent border around the chrome card
 *   - Bottom: word-by-word EditorialCaption (~bottom 140px)
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
import { SceneChapterChip } from "../components/HUDChrome";
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
const WINDOW_W = 880;
const WINDOW_H = 1080;
const WINDOW_TOP = 440;
const SECTION_LABEL_Y = 250;
const CHIP_TOP_Y = 340;

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

const chapterChipSchema = z.object({
  text: z.string(),
  numberBadge: z.string().optional(),
});

const terminalLineSchema = z.object({
  kind: z.enum(["prompt", "output", "comment", "success", "error"]),
  text: z.string(),
  decorator: z.enum(["check", "cross", "arrow", "dot"]).optional(),
});

// ─── Section label (matches CodeDiffBeforeAfter convention) ─────────
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
export const TerminalBlock9x16: React.FC<TerminalBlock9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  windowTitle,
  lines,
  chapterChip,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
  typewriter,
  font,
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
  // Editorial-spring entrance (calmer settle — typewriter inside the window
  // already drives kinetic motion).
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

  // Pass a local frame to MacWindow's TerminalContent so the typewriter
  // starts AT the moment the chrome lands, not at composition frame 0.
  const terminalLocalFrame = Math.max(0, frame - enterFrame);

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

      {chapterChip ? (
        <SceneChapterChip
          text={chapterChip.text}
          numberBadge={chapterChip.numberBadge}
          position="top-center"
          topPx={CHIP_TOP_Y}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          outlined
        />
      ) : null}

      {/* TERMINAL WINDOW */}
      <div
        style={{
          position: "absolute",
          left: (FRAME_W - WINDOW_W) / 2,
          top: WINDOW_TOP,
          width: WINDOW_W,
          height: WINDOW_H,
          opacity: chromeOpacity,
          transform: `translateY(${chromeTranslateY}px)`,
          // Optional outer card border — thin accent ring so the
          // window reads as a brand artifact, not a screenshot.
          padding: 0,
          borderRadius: 16,
          boxShadow: `0 0 0 1px ${resolvedAccent}22`,
          background: "transparent",
        }}
      >
        <MacWindow
          variant="terminal"
          width={WINDOW_W}
          height={WINDOW_H}
          titleBar={windowTitle}
          paletteMode={palette}
          terminalProps={{
            lines,
            typewriter,
            font,
            frame: terminalLocalFrame,
            fps,
            fontSize: 28,
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
export const terminalBlock9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default(""),
  windowTitle: z.string().default("Terminal"),
  lines: z.array(terminalLineSchema).default([]),
  chapterChip: chapterChipSchema.nullable().default(null),
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
  typewriter: z.boolean().default(true),
  font: z.enum(["firaCode", "jetbrainsMono"]).default("firaCode"),
});

export type TerminalBlock9x16Props = z.infer<typeof terminalBlock9x16Schema>;
