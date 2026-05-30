/**
 * KineticEssay9x16 — vertical (1080×1920) multi-line typographic composition.
 *
 * Carlos T23 (KineticEssay) — the most copyable Carlos "look" because it's all
 * type, no assets. Referenced in
 *   docs/critiques/wave-4/carloscuamatzin-vote1-templates.md (T23)
 *   docs/critiques/wave-4/carloscuamatzin-vote5-type-color.md
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb at top (~80px)
 *   - Optional SceneChapterChip eyebrow (sectionLabel)
 *   - Centered vertical stack of 3–6 "essay lines"
 *       · Each line can be sans-bold / serif-italic / sans-light
 *       · Specific words inside the line can be recolored (accent) and italicized
 *       · Whole lines can be strikethrough (Carlos "anti-pattern" debate device)
 *   - Lines enter sequentially via blurInFocus (Carlos's dominant entry move)
 *   - Optional bottom EditorialCaption strip (default OFF — kinetic essays let
 *     the type carry the audio, per Simon V5)
 *
 * House conventions (mirrors DiagramExplainer9x16 / QuoteCard9x16):
 *   - palette `cream` | `dark` via resolveColors(palette, overrides)
 *   - subjectTool tints accent via getToolAccentForSurface()
 *   - paper-grain overlay (multiply on cream, screen on dark)
 *   - audio mounted via <Audio> when audioUrl is set
 *   - 3-family typography stack — Inter (sans), Playfair Italic (serifItalic), JetBrainsMono
 *
 * Schemas are redeclared locally to avoid touching shared source files (per
 * brief — same convention as KineticTypoCard9x16 + AnimatedText9x16).
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { SceneChapterChip } from "../components/HUDChrome/SceneChapterChip";
import { HeadlineEmphasis, Strikethrough } from "../components/TextEmphasis";
import { blurInFocus } from "../animation";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Locally-redeclared shared schemas (per brief — no shared-file edits) ──
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

const essayLineStyleEnum = z.enum(["sans-bold", "serif-italic", "sans-light"]);
export type EssayLineStyle = z.infer<typeof essayLineStyleEnum>;

const essayLineSchema = z.object({
  text: z.string(),
  /** Visual treatment of the LINE itself. Default sans-bold. */
  style: essayLineStyleEnum.default("sans-bold"),
  /** Words inside the line that get accent-colored. Exact match (case-insensitive). */
  emphasizeWords: z.array(z.string()).default([]),
  /** Per-line accent override; falls back to composition accentColor. */
  emphasisColor: z.string().default(""),
  /** When true, emphasized words also flip to serif italic (Carlos italic-as-voice). */
  italicEmphasis: z.boolean().default(false),
  /** Per-line font size override. Defaults to per-style default (110/92/84). */
  fontSize: z.number().min(20).max(220).optional(),
  /** Absolute enter time (seconds). When set, overrides the sequential cascade. */
  enterAtSeconds: z.number().optional(),
  /** Text alignment. Default center. */
  align: z.enum(["left", "center", "right"]).default("center"),
  /** When true, draws a strikethrough over the whole line (Carlos anti-pattern device). */
  strikethrough: z.boolean().default(false),
});
export type KineticEssayLine = z.infer<typeof essayLineSchema>;

// ─── Public schema + props type ────────────────────────────────────────
export const kineticEssay9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Sequence of lines that reveal one-by-one. */
  lines: z
    .array(essayLineSchema)
    .default([
      { text: "El modelo", style: "sans-bold", align: "center" } as KineticEssayLine,
      {
        text: "no es el foso",
        style: "serif-italic",
        emphasizeWords: ["foso"],
        italicEmphasis: false,
        align: "center",
      } as KineticEssayLine,
    ]),
  /** Small chip-eyebrow above the essay. Empty = no chip. */
  sectionLabel: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  /** Seconds before the FIRST line enters. Default 0.6. */
  firstLineDelaySeconds: z.number().min(0).max(10).default(0.6),
  /** Seconds between consecutive line entries when enterAtSeconds is omitted. Default 1.2. */
  sequenceStepSeconds: z.number().min(0.1).max(10).default(1.2),
  /** Show the bottom EditorialCaption strip. Default off — kinetic essays let the type carry. */
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type KineticEssay9x16Props = z.infer<typeof kineticEssay9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────────
const STACK_TOP_Y = 520; // leaves room for breadcrumb (~80) + optional chip (~220)
const STACK_BOTTOM_Y = 1600; // leaves room for caption strip / safe area
const LINE_GAP = 36; // breathing room between lines

// Per-style defaults — Carlos's 3-family stack.
const STYLE_DEFAULTS: Record<EssayLineStyle, { fontSize: number; fontWeight: number; fontFamily: string; fontStyle: "italic" | "normal" }> = {
  "sans-bold": {
    fontSize: 110,
    fontWeight: 900,
    fontFamily: FONT_STACKS.sans,
    fontStyle: "normal",
  },
  "serif-italic": {
    fontSize: 92,
    fontWeight: 400,
    fontFamily: FONT_STACKS.serifItalic,
    fontStyle: "italic",
  },
  "sans-light": {
    fontSize: 84,
    fontWeight: 300,
    fontFamily: FONT_STACKS.sans,
    fontStyle: "normal",
  },
};

// ─── Single essay line ─────────────────────────────────────────────────
const EssayLineView: React.FC<{
  line: KineticEssayLine;
  accentColor: string;
  inkColor: string;
}> = ({ line, accentColor, inkColor }) => {
  // Inside a <Sequence>, frame is local (0 at this line's entry).
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const defaults = STYLE_DEFAULTS[line.style];
  const fontSize = line.fontSize ?? defaults.fontSize;
  const emphasisColor = line.emphasisColor && line.emphasisColor.length > 0
    ? line.emphasisColor
    : accentColor;

  // Carlos's dominant entry move: blur-in over ~280ms.
  const entry = blurInFocus({
    frame,
    startFrame: 0,
    durationFrames: Math.round(0.32 * fps),
    startBlurPx: 16,
    startScale: 0.97,
  });

  // Strikethrough progress: starts 220ms AFTER the line settles (so the
  // viewer reads the line FIRST, then the marker crosses it out — Carlos's
  // debate device). Resolves over ~420ms.
  const strikeStart = Math.round(0.55 * fps);
  const strikeDur = Math.round(0.42 * fps);
  const strikeProgress = interpolate(
    frame,
    [strikeStart, strikeStart + strikeDur],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // The HeadlineEmphasis primitive expects a baseColor; align it to ink.
  // For serif-italic line style, we treat the whole line as italic by passing
  // through HeadlineEmphasis with italicEmphasis controlled per-word — for a
  // line whose style is serif-italic we'd want EVERY word italic, so we
  // sidestep HeadlineEmphasis and render directly with span recolor.
  const isSerifItalic = line.style === "serif-italic";
  const hasAnyEmphasis = line.emphasizeWords.length > 0;

  const containerStyle: React.CSSProperties = {
    width: "100%",
    textAlign: line.align,
    opacity: entry.opacity,
    filter: entry.filter,
    transform: entry.transform,
    fontFamily: defaults.fontFamily,
    fontWeight: defaults.fontWeight,
    fontStyle: defaults.fontStyle,
    fontSize,
    color: inkColor,
    lineHeight: 1.05,
    letterSpacing: defaults.fontStyle === "italic" ? "-0.005em" : "-0.02em",
  };

  // Inner content — HeadlineEmphasis for sans-bold/sans-light with mid-line
  // recolor; otherwise a per-word span recolor that preserves serif italic.
  const inner = (() => {
    if (!hasAnyEmphasis) {
      return <span>{line.text}</span>;
    }
    if (!isSerifItalic) {
      // HeadlineEmphasis handles cascade-less recolor cleanly.
      return (
        <HeadlineEmphasis
          text={line.text}
          emphasizeWords={line.emphasizeWords}
          emphasisColor={emphasisColor}
          baseColor={inkColor}
          italicEmphasis={line.italicEmphasis}
          fontWeight={defaults.fontWeight}
          fontSize={fontSize}
          fontFamily={defaults.fontFamily}
          letterSpacing={defaults.fontStyle === "italic" ? "-0.005em" : "-0.02em"}
          lineHeight={1.05}
          align={line.align}
        />
      );
    }
    // Serif-italic line — manual per-word recolor preserves italic stress.
    const lowerSet = new Set(line.emphasizeWords.map((w) => w.toLowerCase()));
    const tokens = line.text.split(/(\s+)/);
    return (
      <span>
        {tokens.map((tok, i) => {
          if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
          const normalized = tok
            .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")
            .toLowerCase();
          const isHit = lowerSet.has(normalized);
          return (
            <span
              key={i}
              style={{
                color: isHit ? emphasisColor : inkColor,
                fontStyle: line.italicEmphasis && !isHit ? "normal" : "italic",
              }}
            >
              {tok}
            </span>
          );
        })}
      </span>
    );
  })();

  // If serif-italic, the HeadlineEmphasis call would inject its own div with
  // its own font settings. To respect the line container we render `inner`
  // inside our wrapper. (When inner IS HeadlineEmphasis, it already owns
  // its container; we let it take over and skip the outer text wrapper.)
  const usesHeadlineEmphasis = hasAnyEmphasis && !isSerifItalic;

  const wrapped = line.strikethrough ? (
    <Strikethrough
      progress={strikeProgress}
      color={emphasisColor}
      thicknessPx={Math.max(4, Math.round(fontSize * 0.05))}
      tiltDegrees={-1.5}
    >
      {usesHeadlineEmphasis ? (
        <div style={{ width: "100%" }}>{inner}</div>
      ) : (
        <span>{inner}</span>
      )}
    </Strikethrough>
  ) : usesHeadlineEmphasis ? (
    <div style={{ width: "100%" }}>{inner}</div>
  ) : (
    <span>{inner}</span>
  );

  // When HeadlineEmphasis is the inner, it overrides typography on its own
  // root div; we still want the entry filter/transform/opacity, so wrap with
  // a div carrying those (but omit the typography we'd otherwise force).
  if (usesHeadlineEmphasis) {
    return (
      <div
        style={{
          width: "100%",
          textAlign: line.align,
          opacity: entry.opacity,
          filter: entry.filter,
          transform: entry.transform,
        }}
      >
        {wrapped}
      </div>
    );
  }

  return <div style={containerStyle}>{wrapped}</div>;
};

// ─── Composition ───────────────────────────────────────────────────────
export const KineticEssay9x16: React.FC<KineticEssay9x16Props> = ({
  audioUrl,
  wordTimings,
  lines,
  sectionLabel,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  firstLineDelaySeconds,
  sequenceStepSeconds,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  // Resolve color stack (palette defaults + per-color overrides — empty
  // string means "use palette default").
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

  // Compute each line's enter frame.
  const layout = lines.map((line, i) => {
    const enterSec =
      line.enterAtSeconds !== undefined
        ? line.enterAtSeconds
        : firstLineDelaySeconds + i * sequenceStepSeconds;
    return { line, enterFrame: Math.round(enterSec * fps) };
  });

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional chip eyebrow */}
      {sectionLabel.length > 0 && (
        <SceneChapterChip
          text={sectionLabel}
          position="top-center"
          topPx={180}
          outlined
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
        />
      )}

      {/* Centered vertical stack of essay lines */}
      <AbsoluteFill
        style={{
          top: STACK_TOP_Y,
          bottom: 1920 - STACK_BOTTOM_Y,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
          gap: LINE_GAP,
        }}
      >
        {layout.map((entry, i) => (
          <Sequence
            key={`essay-line-${i}`}
            from={entry.enterFrame}
            durationInFrames={9999}
            layout="none"
          >
            <EssayLineView
              line={entry.line}
              accentColor={resolvedAccent}
              inkColor={resolvedInk}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Optional bottom captions (off by default — Simon V5 essay grammar) */}
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
