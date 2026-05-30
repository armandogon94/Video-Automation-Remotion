/**
 * CodeDiffBeforeAfter9x16 — vertical (1080×1920) before/after code diff composition.
 *
 * Carlos T8 (docs/critiques/wave-4/carloscuamatzin-vote1-templates.md):
 * Two code editor cards stacked vertically with red "Antes" / green "Después"
 * pill badges, line-by-line diff coloring (red strikeout for removed,
 * green for added), a connecting warm-red down-arrow between them, and an
 * optional accent conclusion chip below.
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb at ~y=80
 *   - Section label (tracked-uppercase warm-red sans, +0.22em) at ~y=250
 *   - BEFORE card (~380..820): MacWindow variant="editor", red "ANTES" pill top-left
 *   - Down-arrow (~880..920): warm-red SVG with stroke-dasharray draw-on
 *   - AFTER card (~950..1390): MacWindow variant="editor", green "DESPUÉS" pill top-left
 *   - Optional conclusion chip (~1450..1500): rounded, accent border
 *   - Bottom: word-by-word EditorialCaption
 *
 * Motion grammar (editorial spring — damping 22 / stiffness 130 / mass 0.7):
 *   - SectionLabel + BEFORE card enter at `beforeEnterSeconds` (default 0.5s)
 *   - AFTER card enters at `afterEnterSeconds` (default 3.0s)
 *   - Arrow draws-on at `arrowDrawSeconds` (default 2.5s), 0.4s stroke sweep
 *   - Conclusion chip fades in 0.5s after the AFTER card lands
 *
 * Schema lives at the BOTTOM of this file per project convention — central
 * `src/compositions/schemas.ts` is intentionally NOT edited.
 */
import React from "react";
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
const CARD_W = 940;
const CARD_H = 440;
const BEFORE_TOP = 380;
const ARROW_TOP = 880;
const ARROW_BOTTOM = 950;
const AFTER_TOP = 950;
const CONCLUSION_TOP = 1450;
const SECTION_LABEL_Y = 250;

// Diff line tint — red for removed, green for added, neutral for unchanged.
const DIFF_REMOVED_BG_DARK = "rgba(255, 95, 95, 0.16)";
const DIFF_REMOVED_BG_LIGHT = "rgba(179, 58, 42, 0.10)";
const DIFF_ADDED_BG_DARK = "rgba(63, 215, 113, 0.16)";
const DIFF_ADDED_BG_LIGHT = "rgba(63, 139, 63, 0.12)";

const DIFF_REMOVED_STRIPE = "#FF6B6B";
const DIFF_ADDED_STRIPE = "#3FD771";

// Pill badge colors (red ANTES, green DESPUÉS — non-negotiable diff convention).
const PILL_ANTES_BG = "#B33A2A";
const PILL_ANTES_INK = "#FFFFFF";
const PILL_DESPUES_BG = "#2F8B3D";
const PILL_DESPUES_INK = "#FFFFFF";

// ─── Local schemas (NOT exported from src/compositions/schemas.ts) ──
// We inline `wordTimingSchema` because the shared one isn't exported.
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

const lineMarkerSchema = z.object({
  /** 1-indexed line number within the code block. */
  line: z.number().int().min(1),
  /** Diff classification of this line. */
  kind: z.enum(["removed", "unchanged", "added"]),
});

const editorLanguageSchema = z.enum(["ts", "tsx", "json", "sh", "sql"]);

const codeBlockSchema = z.object({
  language: editorLanguageSchema.default("ts"),
  code: z.string().default(""),
  lineMarkers: z.array(lineMarkerSchema).default([]),
});

// ─── Pill badge ─────────────────────────────────────────────────────
const PillBadge: React.FC<{
  text: string;
  bg: string;
  ink: string;
  left: number;
  top: number;
}> = ({ text, bg, ink, left, top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      padding: "8px 18px",
      borderRadius: 999,
      background: bg,
      color: ink,
      fontFamily: FONT_STACKS.sans,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      lineHeight: 1,
      boxShadow: `0 4px 14px ${bg}55`,
      zIndex: 3,
    }}
  >
    {text}
  </div>
);

// ─── Diff stripe overlay ────────────────────────────────────────────
/**
 * Renders thin colored stripes BEHIND each diff-marked line of the
 * underlying MacWindow editor. We mimic `EditorContent`'s layout
 * math (lineHeight = fontSize * 1.5; padding 20; gutterWidth derived
 * from digits). This is intentionally a parallel render — keeps the
 * MacWindow primitive untouched and lets us paint diff colors without
 * modifying the editor body.
 */
const DiffStripes: React.FC<{
  lineMarkers: Array<{ line: number; kind: "removed" | "unchanged" | "added" }>;
  totalLines: number;
  fontSize: number;
  padding: number;
  bodyTopOffset: number;
  isDark: boolean;
}> = ({ lineMarkers, totalLines, fontSize, padding, bodyTopOffset, isDark }) => {
  const lineHeight = fontSize * 1.5;
  const gutterWidth = String(totalLines).length * (fontSize * 0.6) + 28;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: bodyTopOffset,
        bottom: 0,
        pointerEvents: "none",
      }}
    >
      {lineMarkers.map((m, i) => {
        if (m.kind === "unchanged") return null;
        const bg =
          m.kind === "removed"
            ? isDark ? DIFF_REMOVED_BG_DARK : DIFF_REMOVED_BG_LIGHT
            : isDark ? DIFF_ADDED_BG_DARK : DIFF_ADDED_BG_LIGHT;
        const stripe =
          m.kind === "removed" ? DIFF_REMOVED_STRIPE : DIFF_ADDED_STRIPE;
        return (
          <div
            key={`mark-${i}`}
            style={{
              position: "absolute",
              left: padding,
              right: padding,
              top: padding + (m.line - 1) * lineHeight - 1,
              height: lineHeight + 2,
              background: bg,
              borderLeft: `3px solid ${stripe}`,
              borderRadius: 3,
              // The strikeout effect for removed lines is conveyed by the
              // red tint + stripe — adding an actual text strike would
              // require touching MacWindow internals.
            }}
          >
            {/* Left margin glyph: + for added, − for removed. */}
            <div
              style={{
                position: "absolute",
                left: 6,
                top: 0,
                width: gutterWidth - 14,
                textAlign: "right",
                color: stripe,
                fontFamily: FONT_STACKS.monoCode,
                fontWeight: 700,
                fontSize: fontSize * 0.85,
                lineHeight: `${lineHeight}px`,
                opacity: 0.85,
              }}
            >
              {m.kind === "added" ? "+" : "−"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Section label (tracked-uppercase) ──────────────────────────────
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

// ─── Card wrapper (handles spring entrance + pill badge) ────────────
const DiffCard: React.FC<{
  top: number;
  pillText: string;
  pillBg: string;
  pillInk: string;
  block: { language: "ts" | "tsx" | "json" | "sh" | "sql"; code: string; lineMarkers: Array<{ line: number; kind: "removed" | "unchanged" | "added" }> };
  paletteMode: "cream" | "dark" | "warm-black" | "true-black" | "paper";
  filenameLabel: string;
}> = ({ top, pillText, pillBg, pillInk, block, paletteMode, filenameLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [22, 0]);

  const totalLines = Math.max(1, block.code.split("\n").length);
  const fontSize = 22;
  const padding = 20;
  // Approximate EditorContent's title-bar (40) + breadcrumb (filename row, ~30).
  const bodyTopOffset = 40 + 30;
  const isDark = isDarkPalette(paletteMode);

  return (
    <div
      style={{
        position: "absolute",
        left: (FRAME_W - CARD_W) / 2,
        top,
        width: CARD_W,
        height: CARD_H,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <MacWindow
        variant="editor"
        width={CARD_W}
        height={CARD_H}
        paletteMode={paletteMode}
        editorProps={{
          filename: filenameLabel,
          breadcrumb: [filenameLabel],
          code: block.code,
          language: block.language,
          fontSize,
          padding,
        }}
      />
      <DiffStripes
        lineMarkers={block.lineMarkers}
        totalLines={totalLines}
        fontSize={fontSize}
        padding={padding}
        bodyTopOffset={bodyTopOffset}
        isDark={isDark}
      />
      <PillBadge
        text={pillText}
        bg={pillBg}
        ink={pillInk}
        left={20}
        top={-18}
      />
    </div>
  );
};

// ─── Connecting down-arrow with stroke-dasharray draw-on ────────────
const ConnectingArrow: React.FC<{ accentColor: string }> = ({
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sweep = Math.max(0.25, 0.4 * fps); // ~0.4s sweep
  const progress = interpolate(frame, [0, sweep], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cx = FRAME_W / 2;
  const yTop = ARROW_TOP;
  const yBottom = ARROW_BOTTOM;
  const shaftLen = yBottom - yTop - 18; // leave room for arrowhead
  const drawn = shaftLen * progress;
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: 1920,
        pointerEvents: "none",
      }}
    >
      <line
        x1={cx}
        y1={yTop}
        x2={cx}
        y2={yTop + drawn}
        stroke={accentColor}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {progress > 0.9 && (
        <polygon
          points={`${cx - 14},${yBottom - 18} ${cx + 14},${yBottom - 18} ${cx},${yBottom}`}
          fill={accentColor}
          style={{
            opacity: interpolate(progress, [0.9, 1.0], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}
    </svg>
  );
};

// ─── Conclusion chip (rounded, accent border) ───────────────────────
const ConclusionChip: React.FC<{
  text: string;
  accentColor: string;
  paperColor: string;
  inkColor: string;
}> = ({ text, accentColor, paperColor, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: EDITORIAL_SPRING });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: CONCLUSION_TOP,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          padding: "14px 28px",
          border: `2px solid ${accentColor}`,
          borderRadius: 14,
          background: paperColor,
          color: inkColor,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "-0.005em",
          maxWidth: 880,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const CodeDiffBeforeAfter9x16: React.FC<CodeDiffBeforeAfter9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  before,
  after,
  beforeLabel,
  afterLabel,
  conclusionText,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  beforeEnterSeconds,
  afterEnterSeconds,
  arrowDrawSeconds,
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

  const beforeEnterFrame = Math.round(beforeEnterSeconds * fps);
  const afterEnterFrame = Math.round(afterEnterSeconds * fps);
  const arrowEnterFrame = Math.round(arrowDrawSeconds * fps);
  const conclusionEnterFrame =
    afterEnterFrame + Math.round(0.5 * fps);

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

      {/* Section label (enters with BEFORE card) */}
      <Sequence from={beforeEnterFrame} durationInFrames={9999} layout="none">
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      </Sequence>

      {/* BEFORE card */}
      <Sequence from={beforeEnterFrame} durationInFrames={9999} layout="none">
        <DiffCard
          top={BEFORE_TOP}
          pillText={beforeLabel}
          pillBg={PILL_ANTES_BG}
          pillInk={PILL_ANTES_INK}
          block={before}
          paletteMode={palette}
          filenameLabel="before"
        />
      </Sequence>

      {/* Connecting arrow */}
      <Sequence from={arrowEnterFrame} durationInFrames={9999} layout="none">
        <ConnectingArrow accentColor={resolvedAccent} />
      </Sequence>

      {/* AFTER card */}
      <Sequence from={afterEnterFrame} durationInFrames={9999} layout="none">
        <DiffCard
          top={AFTER_TOP}
          pillText={afterLabel}
          pillBg={PILL_DESPUES_BG}
          pillInk={PILL_DESPUES_INK}
          block={after}
          paletteMode={palette}
          filenameLabel="after"
        />
      </Sequence>

      {/* Conclusion chip */}
      {conclusionText ? (
        <Sequence
          from={conclusionEnterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <ConclusionChip
            text={conclusionText}
            accentColor={resolvedAccent}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
          />
        </Sequence>
      ) : null}

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

// ─── Schema export (lives at the BOTTOM, per project convention) ────
export const codeDiffBeforeAfter9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default(""),
  before: codeBlockSchema.default({ language: "ts", code: "", lineMarkers: [] }),
  after: codeBlockSchema.default({ language: "ts", code: "", lineMarkers: [] }),
  beforeLabel: z.string().default("ANTES"),
  afterLabel: z.string().default("DESPUÉS"),
  conclusionText: z.string().default(""),
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
  beforeEnterSeconds: z.number().min(0).default(0.5),
  afterEnterSeconds: z.number().min(0).default(3.0),
  arrowDrawSeconds: z.number().min(0).default(2.5),
});

export type CodeDiffBeforeAfter9x16Props = z.infer<
  typeof codeDiffBeforeAfter9x16Schema
>;
