/**
 * KineticEssay16x9 — horizontal (1920×1080) multi-line typographic composition.
 *
 * 16:9 sibling of `KineticEssay9x16` (Carlos T23 landscape editorial type).
 * ADR-001-16x9-lane §2.1/§2.4/§5.1.
 *
 * Layout re-design for landscape editorial:
 *   Lines flow vertically but are anchored in the wider canvas with larger
 *   horizontal padding, creating a "magazine editorial" centered column of type.
 *   Font sizes are scaled DOWN per ADR §5.1 heuristic (9:16 110/92/84 → 16:9 88/72/66).
 *   The wider canvas gives the type more breathing room; no visual density is lost.
 *   The essay "column" width is capped at 1600px to maintain comfortable reading width.
 *
 *   - sans-bold  → 88px (was 110px)
 *   - serif-italic → 72px (was 92px)
 *   - sans-light → 66px (was 84px)
 *
 * Same house conventions as the 9:16 sibling:
 *   - blurInFocus entry per line
 *   - palette cream/dark via resolveColors
 *   - optional BrandBreadcrumb16x9 / BrandWatermark16x9
 *   - DarkSlateChassis16x9 wraps everything
 *
 * The 9:16 sibling uses a `Dark` variant gated on palette prop — this 16:9 comp
 * merges both into one composition with `palette` prop defaulting to `dark`.
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { SceneChapterChip } from "../components/HUDChrome/SceneChapterChip";
import { HeadlineEmphasis, Strikethrough } from "../components/TextEmphasis";
import { blurInFocus } from "../animation";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  ALL_PALETTE_MODES,
  FONT_STACKS,
} from "../brand";

// ─── Locally-redeclared schemas (per ADR §2.4 — no shared-file edits) ────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

const essayLineStyleEnum = z.enum(["sans-bold", "serif-italic", "sans-light"]);
export type EssayLineStyle16x9 = z.infer<typeof essayLineStyleEnum>;

const essayLineSchema_local = z.object({
  text: z.string().default(""),
  style: essayLineStyleEnum.default("sans-bold"),
  emphasizeWords: z.array(z.string()).optional(),
  emphasisColor: z.string().optional(),
  italicEmphasis: z.boolean().optional(),
  /** Per-line font size override. Defaults to 16:9-scaled style defaults. */
  fontSize: z.number().min(16).max(200).optional(),
  enterAtSeconds: z.number().optional(),
  align: z.enum(["left", "center", "right"]).default("center"),
  strikethrough: z.boolean().optional(),
});
export type KineticEssayLine16x9 = z.infer<typeof essayLineSchema_local>;

// ─── Public schema ────────────────────────────────────────────────────────────
export const kineticEssay16x9Schema = z.object({
  audioUrl: z.string().optional(),
  wordTimings: z.array(wordTimingSchema_local).optional(),
  lines: z
    .array(essayLineSchema_local)
    .default([
      {
        text: "El modelo",
        style: "sans-bold",
        align: "center",
      },
      {
        text: "no es el foso",
        style: "serif-italic",
        emphasizeWords: ["foso"],
        align: "center",
      },
    ]),
  sectionLabel: z.string().optional(),
  breadcrumb: breadcrumbSchema_local.nullable().optional(),
  watermark: watermarkSchema_local.nullable().optional(),
  watermarkHandle: z.string().optional(),
  subjectTool: z.string().nullable().optional(),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().optional(),
  inkColor: z.string().optional(),
  accentColor: z.string().optional(),
  mutedColor: z.string().optional(),
  /** ADR §5.1: 16:9 caption default 32–36 px. */
  captionFontSize: z.number().min(20).max(120).optional(),
  /** Seconds before the FIRST line enters. Default 0.6. */
  firstLineDelaySeconds: z.number().min(0).max(10).default(0.6),
  /** Seconds between consecutive line entries. Default 1.2. */
  sequenceStepSeconds: z.number().min(0.1).max(10).default(1.2),
  /** Show the bottom EditorialCaption strip. Default off — kinetic essays let the type carry. */
  showCaptions: z.boolean().default(false),
});
export type KineticEssay16x9Props = z.infer<typeof kineticEssay16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────────────
// Leave room for breadcrumb + chip at top, captions/safe area at bottom.
const STACK_TOP_OFFSET = 200; // from top of frame
const STACK_BOTTOM_OFFSET = 120; // from bottom of frame
const HORIZONTAL_PADDING = 160; // side gutters (wider canvas = more breathing room)
const LINE_GAP = 28;
const ESSAY_MAX_WIDTH = 1600;

/**
 * ADR §5.1: 16:9 font-size defaults scaled from 9:16 values.
 *   sans-bold:    110 → 88
 *   serif-italic:  92 → 72
 *   sans-light:    84 → 66
 */
const STYLE_DEFAULTS_16x9: Record<
  EssayLineStyle16x9,
  {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    fontStyle: "italic" | "normal";
  }
> = {
  "sans-bold": {
    fontSize: 88,
    fontWeight: 900,
    fontFamily: FONT_STACKS.sans,
    fontStyle: "normal",
  },
  "serif-italic": {
    fontSize: 72,
    fontWeight: 400,
    fontFamily: FONT_STACKS.serifItalic,
    fontStyle: "italic",
  },
  "sans-light": {
    fontSize: 66,
    fontWeight: 300,
    fontFamily: FONT_STACKS.sans,
    fontStyle: "normal",
  },
};

// ─── Single essay line ─────────────────────────────────────────────────────
const EssayLineView16x9: React.FC<{
  line: KineticEssayLine16x9;
  accentColor: string;
  inkColor: string;
}> = ({ line, accentColor, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const defaults = STYLE_DEFAULTS_16x9[line.style];
  const fontSize = line.fontSize ?? defaults.fontSize;
  const emphasisColor =
    line.emphasisColor && line.emphasisColor.length > 0
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

  // Strikethrough: starts 220ms after line settles, resolves over ~420ms.
  const strikeStart = Math.round(0.55 * fps);
  const strikeDur = Math.round(0.42 * fps);
  const strikeProgress = interpolate(
    frame,
    [strikeStart, strikeStart + strikeDur],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const isSerifItalic = line.style === "serif-italic";
  const hasAnyEmphasis = (line.emphasizeWords ?? []).length > 0;

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
    letterSpacing:
      defaults.fontStyle === "italic" ? "-0.005em" : "-0.02em",
  };

  const inner = (() => {
    if (!hasAnyEmphasis) {
      return <span>{line.text}</span>;
    }
    if (!isSerifItalic) {
      return (
        <HeadlineEmphasis
          text={line.text}
          emphasizeWords={line.emphasizeWords ?? []}
          emphasisColor={emphasisColor}
          baseColor={inkColor}
          italicEmphasis={line.italicEmphasis}
          fontWeight={defaults.fontWeight}
          fontSize={fontSize}
          fontFamily={defaults.fontFamily}
          letterSpacing={
            defaults.fontStyle === "italic" ? "-0.005em" : "-0.02em"
          }
          lineHeight={1.05}
          align={line.align}
        />
      );
    }
    // Serif-italic line — manual per-word recolor.
    const lowerSet = new Set(
      (line.emphasizeWords ?? []).map((w) => w.toLowerCase()),
    );
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
                fontStyle:
                  line.italicEmphasis && !isHit ? "normal" : "italic",
              }}
            >
              {tok}
            </span>
          );
        })}
      </span>
    );
  })();

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

// ─── Composition ─────────────────────────────────────────────────────────────
export const KineticEssay16x9: React.FC<KineticEssay16x9Props> = ({
  audioUrl,
  wordTimings,
  lines,
  sectionLabel,
  breadcrumb,
  watermark,
  watermarkHandle,
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
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  // Compute each line's enter frame.
  const layout = lines.map((line, i) => {
    const enterSec =
      line.enterAtSeconds !== undefined
        ? line.enterAtSeconds
        : firstLineDelaySeconds + i * sequenceStepSeconds;
    return { line, enterFrame: Math.round(enterSec * fps) };
  });

  return (
    <DarkSlateChassis16x9>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional chip eyebrow — centered, top third */}
      {(sectionLabel?.length ?? 0) > 0 && (
        <SceneChapterChip
          text={sectionLabel ?? ""}
          position="top-center"
          topPx={120}
          outlined
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
        />
      )}

      {/* Centered editorial essay column — landscape uses generous side gutters
          so the type reads as a premium magazine column at 1920px wide. */}
      <AbsoluteFill
        style={{
          top: STACK_TOP_OFFSET,
          bottom: STACK_BOTTOM_OFFSET,
          left: HORIZONTAL_PADDING,
          right: HORIZONTAL_PADDING,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
          gap: LINE_GAP,
        }}
      >
        {/* Inner column width cap for comfortable reading measure. */}
        <div
          style={{
            maxWidth: ESSAY_MAX_WIDTH,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
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
              <EssayLineView16x9
                line={entry.line}
                accentColor={resolvedAccent}
                inkColor={resolvedInk}
              />
            </Sequence>
          ))}
        </div>
      </AbsoluteFill>

      {/* Optional bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Optional bottom captions (off by default — Simon V5 essay grammar) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings ?? []}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize ?? 34,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </DarkSlateChassis16x9>
  );
};

export default KineticEssay16x9;
