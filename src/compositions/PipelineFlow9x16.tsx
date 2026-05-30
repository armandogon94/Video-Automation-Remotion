/**
 * PipelineFlow9x16 — vertical (1080×1920) typed-node pipeline flow chart.
 *
 * Carlos T18 (Wave-4 vote-1 critique, `docs/critiques/wave-4/carloscuamatzin-vote1-templates.md`):
 *   "3+ white rounded cards stacked vertically with monospace title in coral + body line,
 *    connected by big coral arrows pointing down. TYPED node families and a footer
 *    'PIPELINE' label."
 *
 * Sibling of DiagramExplainer9x16 (same family: vertical card-stack with coral down-arrows
 * between cards), but PipelineFlow is *typed* — each stage declares a kind (agent / tool /
 * check / output / input) that drives a small colored dot rendered next to the title.
 * Where DiagramExplainer is "a flow of thoughts" (generic concepts), PipelineFlow is "a
 * flow of work" (which agent / which tool / which check fires next). Plus a tracked
 * uppercase pill footer ("PIPELINE", "TRES AGENTES · UN PIPELINE") locks the metaphor.
 *
 * Visual structure (top → bottom):
 *   - BrandBreadcrumb (~y=80)
 *   - SectionLabel (tracking-spaced uppercase sans, accent, ~y=280)
 *   - STACK ZONE (y=420 → ~y=1500):
 *       · N stage cards (rounded 880×~180 rectangles, paper-color BG, thin accent border)
 *       · Each card: optional kind-dot (left) + mono title (Fira Code accent ~52px) +
 *         sans body line (Inter ink ~38px)
 *       · Between cards: 48px gap with a coral down-arrow SVG (draw-on 0.2s AFTER
 *         the target card enters)
 *   - Footer label: tracked-uppercase pill ("PIPELINE", mono +0.22em accent), ~y=1640
 *   - EditorialCaption (bottom strip, gated by showCaptions)
 *
 * Motion grammar:
 *   - Card[i] enters at firstStageDelaySeconds + i * sequenceStepSeconds (or its own
 *     `enterAtSeconds` if specified). Single editorial spring (damping 22 / stiffness 130).
 *   - Arrow draws 0.2s AFTER its target card enters (stroke grows from 0 → 1 over 0.35s).
 *   - Footer label fades in 0.4s after the LAST stage card enters.
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
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";

// ─── Schemas (declared locally — `wordTimingSchema` / `breadcrumbSchema` are
//     not yet exported from `./schemas`, only their inferred types are) ─────
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

const pipelineStageSchema = z.object({
  /** Monospace title — e.g. "implementation-agent". */
  name: z.string(),
  /** One-line sans body — e.g. "Writes the first draft". */
  body: z.string(),
  /** Optional typed kind. Drives the small colored dot left of the title. */
  kind: z
    .enum(["agent", "tool", "check", "output", "input"])
    .optional(),
  /** When set, this stage enters at this absolute second. */
  enterAtSeconds: z.number().optional(),
});
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const pipelineFlow9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default("EL PIPELINE"),
  stages: z.array(pipelineStageSchema).default([]),
  /** Tracked-uppercase pill label rendered under the stack. */
  footerLabel: z.string().default("PIPELINE"),
  /** Arrow palette hint — `accent` uses the palette accent (default); `coral` / `warm-red`
   *  pin to those exact hues regardless of palette. */
  arrowStyle: z.enum(["warm-red", "coral", "accent"]).default("accent"),
  /** Seconds between consecutive stage entries when `enterAtSeconds` is omitted. */
  sequenceStepSeconds: z.number().min(0.2).max(10).default(1.0),
  /** Seconds before the FIRST stage enters. */
  firstStageDelaySeconds: z.number().min(0).max(10).default(0.4),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z
    .enum(["cream", "dark", "warm-black", "true-black", "paper"])
    .default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type PipelineFlow9x16Props = z.infer<typeof pipelineFlow9x16Schema>;

// ─── Layout constants ───────────────────────────────────────────────
const CARD_W = 880;
const CARD_H = 180;
const CARD_GAP = 48; // vertical gap between cards (where arrows live)
const SECTION_LABEL_Y = 280;
const FIRST_CARD_Y = 420;
const FOOTER_Y_OFFSET = 80; // px below the LAST card's bottom edge
const KIND_DOT_SIZE = 14;

// ─── Kind → dot color ────────────────────────────────────────────────
// Carlos-corpus 5-family palette: each family is distinct at thumbnail size.
const KIND_COLORS: Record<NonNullable<PipelineStage["kind"]>, string> = {
  agent: "#6B6FD3", // indigo
  tool: "#5AB8C9", // cyan
  check: "#7DC9A0", // mint
  output: "#D4AF37", // gold
  input: "#B33A2A", // warm-red
};

/** Resolve the coral arrow color. `accent` defers to the composition accent;
 *  `coral` / `warm-red` are explicit pins from Carlos's reference palette. */
function resolveArrowColor(
  style: PipelineFlow9x16Props["arrowStyle"],
  accentColor: string,
): string {
  if (style === "coral") return "#E89B7A";
  if (style === "warm-red") return "#B33A2A";
  return accentColor;
}

// ─── A single stage card ─────────────────────────────────────────────
const StageCard: React.FC<{
  stage: PipelineStage;
  y: number;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  paletteMode: "cream" | "dark" | "warm-black" | "true-black" | "paper";
}> = ({ stage, y, paperColor, inkColor, accentColor, paletteMode }) => {
  // Inside <Sequence> frame 0 is the entry moment.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring (shared "Bloomberg" profile — damping 22 / stiffness 130 / mass 0.7).
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  // Card surface — paper on cream-family palettes, near-black slate on dark-family.
  const isDark =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black";
  const cardBg = isDark ? "#161D2B" : "#FFFFFF";
  const cardShadow = isDark
    ? "0 8px 28px rgba(212, 160, 74, 0.16), 0 1px 0 rgba(212, 160, 74, 0.22)"
    : "0 8px 28px rgba(179, 58, 42, 0.10), 0 1px 0 rgba(179, 58, 42, 0.18)";

  const kindColor = stage.kind ? KIND_COLORS[stage.kind] : undefined;
  // Body text uses pure white on dark for sharper anti-aliasing >30px (A3 audit).
  const bodyInk = getBodyTextColor(
    paletteMode === "warm-black" || paletteMode === "true-black" || paletteMode === "paper"
      ? "cream"
      : paletteMode,
    inkColor,
    38,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - CARD_W) / 2,
        top: y,
        width: CARD_W,
        minHeight: CARD_H,
        background: cardBg,
        border: `2px solid ${accentColor}`,
        borderRadius: 18,
        padding: "26px 36px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
        boxShadow: cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Title row: optional kind-dot + mono title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {kindColor && (
          <div
            style={{
              width: KIND_DOT_SIZE,
              height: KIND_DOT_SIZE,
              borderRadius: KIND_DOT_SIZE / 2,
              background: kindColor,
              boxShadow: `0 0 0 3px ${kindColor}22`,
              flex: "0 0 auto",
            }}
            aria-hidden
          />
        )}
        <div
          style={{
            fontFamily: FONT_STACKS.monoCode,
            fontWeight: 600,
            fontSize: 52,
            color: accentColor,
            letterSpacing: "-0.005em",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {stage.name}
        </div>
      </div>

      {/* Body line */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 500,
          fontSize: 38,
          color: bodyInk,
          lineHeight: 1.25,
          letterSpacing: "-0.005em",
          paddingLeft: kindColor ? KIND_DOT_SIZE + 16 : 0,
        }}
      >
        {stage.body}
      </div>
    </div>
  );
};

// ─── Down-arrow between two cards ────────────────────────────────────
const StageArrow: React.FC<{
  fromY: number;
  toY: number;
  arrowColor: string;
}> = ({ fromY, toY, arrowColor }) => {
  // Inside <Sequence>, frame is local — 0 at draw start.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = 0.35 * fps;
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cx = 1080 / 2;
  // Leave 18px gap at the bottom for the arrowhead triangle.
  const armLength = toY - fromY - 28;
  const visibleLen = armLength * progress;

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        pointerEvents: "none",
      }}
    >
      {/* Shaft — thicker than DiagramExplainer's 4px for the "BIG coral arrow" Carlos prescription. */}
      <line
        x1={cx}
        y1={fromY + 6}
        x2={cx}
        y2={fromY + 6 + visibleLen}
        stroke={arrowColor}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Arrowhead — only paints once shaft is mostly drawn. */}
      {progress > 0.9 && (
        <polygon
          points={`${cx - 18},${toY - 22} ${cx + 18},${toY - 22} ${cx},${toY - 2}`}
          fill={arrowColor}
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

// ─── Section label (top tracking-spaced uppercase) ────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
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
        fontSize: 38,
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

// ─── Footer label (tracked-uppercase mono pill under the stack) ──────
const FooterLabel: React.FC<{
  text: string;
  topPx: number;
  accentColor: string;
  inkColor: string;
  paletteMode: "cream" | "dark" | "warm-black" | "true-black" | "paper";
}> = ({ text, topPx, accentColor, inkColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 24, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);

  const isDark =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black";
  const pillBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
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
          fontFamily: FONT_STACKS.monoCode,
          fontWeight: 600,
          fontSize: 28,
          color: accentColor,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          padding: "12px 24px",
          border: `1.5px solid ${accentColor}`,
          borderRadius: 999,
          background: pillBg,
          whiteSpace: "nowrap",
          // inkColor is reserved for a future contrast variant; reference it so the
          // prop isn't reported as unused by --noUnusedParameters.
          textShadow: isDark ? `0 0 0 ${inkColor}` : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const PipelineFlow9x16: React.FC<PipelineFlow9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  stages,
  footerLabel,
  arrowStyle,
  sequenceStepSeconds,
  firstStageDelaySeconds,
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
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
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
  const resolvedGrain = getPalette(palette).grainOverlay;
  const arrowColor = resolveArrowColor(arrowStyle, resolvedAccent);

  // Layout: per-stage Y + enter frame.
  const layout = stages.map((stage, i) => {
    const y = FIRST_CARD_Y + i * (CARD_H + CARD_GAP);
    const enterSec =
      stage.enterAtSeconds !== undefined
        ? stage.enterAtSeconds
        : firstStageDelaySeconds + i * sequenceStepSeconds;
    const enterFrame = Math.round(enterSec * fps);
    return { stage, y, enterFrame };
  });

  // Footer sits below the LAST card's bottom edge.
  const lastCardBottom =
    layout.length > 0
      ? layout[layout.length - 1].y + CARD_H
      : FIRST_CARD_Y + CARD_H;
  const footerTopPx = lastCardBottom + FOOTER_Y_OFFSET;
  const footerEnterFrame =
    layout.length > 0
      ? layout[layout.length - 1].enterFrame + Math.round(0.4 * fps)
      : Math.round(firstStageDelaySeconds * fps);

  // muted color isn't surfaced visually here (cards are bordered, not muted-bordered),
  // but reading the value keeps the prop part of the public surface without unused warnings.
  void mutedColor;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay (cream: multiply vignette; dark: amber-tinted screen) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode:
            palette === "dark" ||
            palette === "warm-black" ||
            palette === "true-black"
              ? "screen"
              : "multiply",
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

      {/* Section label */}
      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* Arrows BETWEEN cards (each one draws 0.2s AFTER its target card enters) */}
      {layout.slice(0, -1).map((entry, i) => {
        const fromY = entry.y + CARD_H;
        const toY = layout[i + 1].y;
        const drawStartFrame =
          layout[i + 1].enterFrame + Math.round(0.2 * fps);
        return (
          <Sequence
            key={`arrow-${i}`}
            from={drawStartFrame}
            durationInFrames={9999}
            layout="none"
          >
            <StageArrow fromY={fromY} toY={toY} arrowColor={arrowColor} />
          </Sequence>
        );
      })}

      {/* Stage cards */}
      {layout.map((entry, i) => (
        <Sequence
          key={`stage-${i}`}
          from={entry.enterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <StageCard
            stage={entry.stage}
            y={entry.y}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            paletteMode={palette}
          />
        </Sequence>
      ))}

      {/* Footer label — appears once the last card has landed */}
      {footerLabel && layout.length > 0 && (
        <Sequence
          from={footerEnterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <FooterLabel
            text={footerLabel}
            topPx={footerTopPx}
            accentColor={resolvedAccent}
            inkColor={resolvedInk}
            paletteMode={palette}
          />
        </Sequence>
      )}

      {/* Word-by-word captions in the bottom strip */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 100,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${colors.muted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
