/**
 * PipelineFlow16x9 — Nate B Jones consensus pattern H7
 * (`FourStageHorizontalFlowDiagram`).
 *
 * Wave-6 source: `docs/research/wave-6/natebjones-consensus.md` row H7.
 *   "PipelineFlow16x9 / FourStageHorizontalFlowDiagram (sequential card reveal
 *    + drawn arrows between, caption pill below with one keyword tinted)"
 *
 * Reference clip: `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-02-v2.mp4`
 *   (Weights → Runtime → Endpoint → Tools — 4 named cards in a horizontal row,
 *    colored chevron operators between, emphasis pill caption below).
 * Frame evidence: `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-02-*.jpg`
 *
 * R4B Nate pattern N6 (Wave-7 batch-3, 2026-05-28):
 *   N=3 variant `ThreeCardArrowFlow` (Nate's `Messy Files → Key Questions →
 *   Clear Story` clip) folded into this variable-N PipelineFlow. The schema
 *   now accepts 2-6 stages; layout math distributes cards across the canvas
 *   with a fixed 80px connector gap, and per-stage entry frames scale with N
 *   (total reveal = N * sequenceStepSeconds). Default props stay at N=4 for
 *   back-compat. See `references/creators/natebjones/picks-wave7-batch3.json`
 *   and `references/creators/natebjones/ANALYSIS-VOTE2.md` for N6 evidence.
 *
 * Relationship to the 9:16 sibling:
 *   This is the HORIZONTAL counterpart of `PipelineFlow9x16` (a vertical chain
 *   of typed cards connected by big coral DOWN-arrows). Same "typed pipeline"
 *   metaphor (each card declares a `kind` that drives a small colored dot),
 *   but the row runs LEFT→RIGHT and the connectors are parameterized
 *   (chevron `>`, drawn SVG arrow with a static tip-dot, typographic `+`, or
 *   typographic `→`) rather than arrows-only. Pairs an editorial
 *   `<EmphasisPill>` (Nate M10) below the flow row so the recolored keyword
 *   lands a beat AFTER the last stage settles.
 *
 * Visual structure (16:9 — 1920×1080, left → right):
 *   - Palette background + grain overlay
 *   - BrandBreadcrumb16x9 (top-left, ~y=60)
 *   - Optional `sectionLabel` chip at top-center (~y=180)
 *   - FLOW ROW (~y=380 → ~y=620):
 *       · N stage cards (rounded ~360×240 rectangles on a paper / slate surface)
 *       · Per card: optional kind-dot (top-left, 12px) + mono title (top, ~36px)
 *         + sans body (multi-line, ~24px)
 *       · Between cards: a connector centered in the gap. Connector style is
 *         driven by `connectorStyle`:
 *            chevron        → static `>` glyph in accent color
 *            arrow          → SVG line drawn via `pathDraw` + static tip-dot
 *            operator-plus  → static `+` glyph in accent color
 *            operator-arrow → static `→` glyph in accent color
 *         Connector ENTERS (or DRAWS, for the arrow variant) only after both
 *         adjacent cards have landed.
 *   - <EmphasisPill> caption below the flow (~y=720)
 *   - BrandWatermark16x9 (bottom-right)
 *   - Audio + optional EditorialCaption strip
 *
 * Motion grammar (Wave-5 contract):
 *   - Card[i] enters at firstStageDelaySeconds + i * sequenceStepSeconds (or
 *     stage.enterOffsetSeconds added on top). 10-frame slide-up + fade via a
 *     spring (damping 22 / stiffness 130 / mass 0.7).
 *   - Connector[i] (between card[i] and card[i+1]) starts AFTER card[i+1] has
 *     landed (entry frame + 4 frames). The arrow variant draws via stroke-
 *     dashoffset over `connectorDrawFrames` frames. Static glyph variants fade
 *     in at the same start frame.
 *   - Emphasis pill fades in `pillEnterDelayAfterLastStageSeconds` after the
 *     last stage card lands.
 *
 * Wave-5 rule honored: NO animated arrowheads. The drawn-arrow connector ends
 * in a STATIC tip-dot that paints once the shaft is essentially fully drawn
 * (progress > 0.92). Chevron / operator variants are entirely static glyphs.
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { EmphasisPill } from "../components/TextEmphasis";
import { staggerEntry } from "../animation/staggeredCascade";
import { pathDraw } from "../animation/pathDraw";
import {
  ALL_PALETTE_MODES,
  getBodyTextColor,
  getPalette,
  getToolAccentForSurface,
  resolveColors,
  FONT_STACKS,
} from "../brand";

// ─── Local schemas (top-level `schemas.ts` is off-limits per the brief) ─────
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

const stageSchema = z.object({
  /** Mono title (e.g. "Weights"). Rendered in WHITE (Nate's headline is white;
   *  the per-card accent lives in the kicker + subline + border). */
  name: z.string().default(""),
  /** Sans body below the title — multi-line is fine. Rendered in the card's
   *  accent color, muted (Nate's subline). */
  body: z.string().default(""),
  /** Small uppercase tracking-spaced KICKER above the headline (Nate's
   *  category label, e.g. "MODEL" / "FIND"). When empty it falls back to the
   *  uppercased `kind` so every card carries a kicker like Nate's. */
  kicker: z.string().default(""),
  /** Optional kind — drives the per-card ACCENT (border + kicker + subline +
   *  corner dot), giving the row Nate's color-coded look. */
  kind: z
    .enum(["input", "agent", "tool", "check", "output"])
    .default("agent"),
  /** Optional accent override for THIS card (empty = the kind's accent). When
   *  set it keys the border, kicker, subline and dot for the card. */
  color: z.string().default(""),
  /** Optional offset (seconds) added to this stage's computed enter time. */
  enterOffsetSeconds: z.number().default(0),
});
export type PipelineFlowStage = z.infer<typeof stageSchema>;

const emphasisPillSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().default("Runtime makes local AI feel normal"),
  emphasisWords: z.array(z.string()).default(["Runtime"]),
  emphasisColor: z.string().default("#F2A555"),
});

export const pipelineFlow16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  sectionLabel: z.string().default(""),

  /**
   * Stages of the pipeline. Variable N=2-6 (R4B Nate pattern N6).
   * Default is N=4 (Nate's original `FourStageHorizontalFlowDiagram`); pass
   * shorter `stages` (e.g. 3 items) to get Nate's `ThreeCardArrowFlow` shape.
   */
  stages: z
    .array(stageSchema)
    .min(2)
    .max(6)
    .default([
      {
        name: "Weights",
        body: "GGUF / Safetensors",
        kicker: "",
        kind: "input",
        color: "",
        enterOffsetSeconds: 0,
      },
      {
        name: "Runtime",
        body: "llama.cpp / Ollama",
        kicker: "",
        kind: "tool",
        color: "",
        enterOffsetSeconds: 0,
      },
      {
        name: "Endpoint",
        body: "OpenAI-compatible",
        kicker: "",
        kind: "check",
        color: "",
        enterOffsetSeconds: 0,
      },
      {
        name: "Tools",
        body: "MCP / Plugins",
        kicker: "",
        kind: "output",
        color: "",
        enterOffsetSeconds: 0,
      },
    ]),

  /** Connector style between stages. */
  connectorStyle: z
    .enum(["chevron", "arrow", "operator-plus", "operator-arrow"])
    .default("chevron"),

  /** Caption pill below the flow (Nate M10 EmphasisPill). */
  emphasisPill: emphasisPillSchema.default({
    enabled: true,
    text: "Runtime makes local AI feel normal",
    emphasisWords: ["Runtime"],
    emphasisColor: "#F2A555",
  }),

  /** Timing knobs. */
  firstStageDelaySeconds: z.number().min(0).max(10).default(0.4),
  sequenceStepSeconds: z.number().min(0.1).max(10).default(0.6),
  connectorDrawFrames: z.number().min(1).max(120).default(10),
  pillEnterDelayAfterLastStageSeconds: z
    .number()
    .min(0)
    .max(10)
    .default(0.3),

  // Wave-5 contract — the choreography described in words.
  transitionVerb: z
    .string()
    .default(
      "Each stage card slides up from below over 10 frames staggered by 0.6 seconds (cumulative); after each card lands, the connector to its right (chevron / arrow / + / →) draws via stroke-dashoffset over 10 frames; the emphasis-pill caption fades in 0.3 seconds after the last stage settles.",
    ),

  // Brand chrome (16:9).
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(false),
});
export type PipelineFlow16x9Props = z.infer<typeof pipelineFlow16x9Schema>;

// ─── Layout constants ────────────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const SIDE_MARGIN = 120;
const CONNECTOR_GAP_PX = 80; // horizontal width reserved for each connector
const FLOW_TOP_Y = 380;
const CARD_H = 240;
const SECTION_LABEL_Y = 180;
const PILL_Y = 720;
const KIND_DOT_SIZE = 12;

// Kind → dot color (matches the 9:16 sibling's 5-family typed palette).
const KIND_COLORS: Record<PipelineFlowStage["kind"], string> = {
  input: "#B33A2A", // warm-red
  agent: "#6B6FD3", // indigo
  tool: "#5AB8C9", // cyan
  check: "#7DC9A0", // mint
  output: "#D4AF37", // gold
};

// ─── Single stage card ───────────────────────────────────────────────────
const StageCard: React.FC<{
  stage: PipelineFlowStage;
  x: number;
  y: number;
  width: number;
  height: number;
  paletteMode: PipelineFlow16x9Props["palette"];
  inkColor: string;
  accentColor: string;
}> = ({ stage, x, y, width, height, paletteMode, inkColor, accentColor }) => {
  // Inside <Sequence>, frame 0 == entry moment.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 10-frame editorial spring (same family as the 9:16 sibling).
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
    durationInFrames: 10,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [18, 0]);

  const isDark =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black";
  const cardBg = isDark ? "#161D2B" : "#FFFFFF";

  // Per-card ACCENT (Nate's color-coded flow): explicit `stage.color` wins,
  // else the kind's accent. This single hue keys the border, kicker, subline,
  // corner dot and the faint inner glow — so each card reads as its own color
  // (gray/blue/green/orange family) rather than a uniform blue row.
  const cardAccent = stage.color ? stage.color : KIND_COLORS[stage.kind];

  // Faint inner glow keyed to the card accent (Nate's cards carry a soft
  // accent-tinted halo, not a flat drop shadow).
  const cardShadow = `0 8px 28px ${cardAccent}1F, 0 0 0 1px ${cardAccent}1A inset`;

  // Headline is WHITE (or palette ink on light surfaces) — the accent never
  // colors the headline, it sits in the kicker/subline/border.
  const headlineColor = isDark ? "#FFFFFF" : inkColor || "#0F1B2D";
  // Subline rides the card accent, slightly muted, exactly like Nate's
  // "muted subline in the card's accent color".
  const sublineColor = `${cardAccent}D0`;
  // Kicker: explicit override, else the uppercased kind (INPUT/AGENT/...),
  // so every card carries a category label like Nate's FIND / SAVE / MAP.
  const kickerText = (stage.kicker || stage.kind).toUpperCase();
  // bodyInk is still referenced via getBodyTextColor on light palettes to keep
  // the helper import live and give a readable subline off-dark surfaces.
  const sublineResolved = isDark
    ? sublineColor
    : getBodyTextColor(paletteMode, inkColor, 28);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        background: cardBg,
        border: `2px solid ${cardAccent}`,
        borderRadius: 16,
        padding: "26px 28px 26px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Kind dot in top-left corner of card (reinforces the per-card accent) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: KIND_DOT_SIZE,
          height: KIND_DOT_SIZE,
          borderRadius: KIND_DOT_SIZE / 2,
          background: cardAccent,
          boxShadow: `0 0 0 3px ${cardAccent}22`,
        }}
        aria-hidden
      />

      {/* Kicker — small uppercase tracking-spaced category label, accent-tinted */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 18,
          color: cardAccent,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {kickerText}
      </div>

      {/* Headline — bold WHITE, the load-bearing word */}
      <div
        style={{
          fontFamily: FONT_STACKS.monoCode,
          fontWeight: 700,
          fontSize: 36,
          color: headlineColor,
          letterSpacing: "-0.005em",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {stage.name}
      </div>

      {/* Subline — accent-tinted muted, wraps to multi-line if needed */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 500,
          fontSize: 26,
          color: sublineResolved,
          lineHeight: 1.25,
          letterSpacing: "-0.005em",
          overflow: "hidden",
        }}
      >
        {stage.body}
      </div>
    </div>
  );
};

// ─── Connector between two adjacent cards ────────────────────────────────
const Connector: React.FC<{
  style: PipelineFlow16x9Props["connectorStyle"];
  /** Center X of the connector gap. */
  cx: number;
  /** Center Y of the flow row. */
  cy: number;
  /** Horizontal half-extent the connector may occupy. */
  halfWidth: number;
  accentColor: string;
  drawDurationFrames: number;
}> = ({ style, cx, cy, halfWidth, accentColor, drawDurationFrames }) => {
  // Inside <Sequence>, frame 0 == draw-start moment.
  const frame = useCurrentFrame();

  // Static-glyph variants: simple fade-in over the draw window.
  const fadeProgress = Math.max(
    0,
    Math.min(1, frame / Math.max(1, drawDurationFrames)),
  );

  if (style === "arrow") {
    // SVG line + STATIC tip-dot (Wave-5 rule: never animate arrowheads).
    // Shaft is `2 * halfWidth - 24` long; we leave 12px gap at each end.
    const padding = 12;
    const x1 = cx - halfWidth + padding;
    const x2 = cx + halfWidth - padding - 6; // leave room for tip dot
    const pathLength = x2 - x1;
    const { dashOffset, dashArray, opacity } = pathDraw({
      frame,
      startFrame: 0,
      durationFrames: drawDurationFrames,
      pathLength,
      direction: "start-to-end",
      easing: "outCubic",
    });
    const tipVisible = frame >= drawDurationFrames * 0.92 ? 1 : 0;

    return (
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CANVAS_W,
          height: CANVAS_H,
          pointerEvents: "none",
        }}
      >
        <line
          x1={x1}
          y1={cy}
          x2={x2}
          y2={cy}
          stroke={accentColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{ opacity }}
        />
        {/* Static tip-dot — NOT an animated arrowhead. */}
        <circle
          cx={x2 + 6}
          cy={cy}
          r={8}
          fill={accentColor}
          style={{ opacity: tipVisible }}
        />
      </svg>
    );
  }

  // Static-glyph variants: chevron, +, →
  let glyph: string;
  if (style === "operator-plus") {
    glyph = "+";
  } else if (style === "operator-arrow") {
    glyph = "→"; // →
  } else {
    glyph = "›"; // › single right-pointing angle quote, scales cleanly
  }

  // Slight slide-in for static glyphs (12px from the left, fades up).
  const translateX = (1 - fadeProgress) * -12;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - halfWidth,
        top: cy - 60,
        width: halfWidth * 2,
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeProgress,
        transform: `translateX(${translateX}px)`,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily:
            style === "chevron"
              ? FONT_STACKS.sans
              : FONT_STACKS.monoCode,
          fontWeight: 800,
          fontSize: style === "chevron" ? 96 : 72,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: "0",
        }}
      >
        {glyph}
      </span>
    </div>
  );
};

// ─── Section-label chip at top-center ────────────────────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
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
        fontSize: 30,
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

// ─── Composition ─────────────────────────────────────────────────────────
export const PipelineFlow16x9: React.FC<PipelineFlow16x9Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  stages,
  connectorStyle,
  emphasisPill,
  firstStageDelaySeconds,
  sequenceStepSeconds,
  connectorDrawFrames,
  pillEnterDelayAfterLastStageSeconds,
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

  // Resolve the color stack: palette defaults + per-prop overrides.
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

  // mutedColor isn't surfaced visually (cards are accent-bordered, not muted-
  // bordered); reference it so --noUnusedParameters stays happy AND so the
  // prop remains part of the public surface for future variants.
  void mutedColor;

  // Variable-N layout (R4B Nate N6): distribute N cards across the usable
  // width with a fixed connector gap between each adjacent pair. With N
  // stages there are (N-1) gaps, so:
  //   cardWidth = (usableWidth - (N-1) * CONNECTOR_GAP_PX) / N
  // The connector gap stays at a constant CONNECTOR_GAP_PX (80) — cards
  // expand for small N (e.g. N=3 → ~520px each) and compress for large N
  // (e.g. N=6 → ~227px each). Card stride = cardWidth + CONNECTOR_GAP_PX.
  const stageCount = Math.max(1, stages.length);
  const usableWidth = CANVAS_W - 2 * SIDE_MARGIN;
  const totalConnectorWidth = (stageCount - 1) * CONNECTOR_GAP_PX;
  const cardWidth = Math.floor(
    (usableWidth - totalConnectorWidth) / stageCount,
  );
  const cardY = FLOW_TOP_Y;
  const flowCenterY = cardY + CARD_H / 2;

  // Per-stage entry frames using the staggered-cascade helper (linear, not
  // accelerated, so consecutive cards land at exactly sequenceStepSeconds).
  // Total reveal frames scale with N: lastCard lands at
  //   baseStartFrame + (N-1) * staggerFrames
  // Callers can shrink sequenceStepSeconds for large N (e.g. step = budget/N)
  // if they need a fixed-budget reveal; default cadence keeps the N=4
  // behavior unchanged.
  const baseStartFrame = Math.round(firstStageDelaySeconds * fps);
  const staggerFrames = Math.round(sequenceStepSeconds * fps);

  const layout = stages.map((stage, i) => {
    const x = SIDE_MARGIN + i * (cardWidth + CONNECTOR_GAP_PX);
    const baseEnterFrame = staggerEntry({
      index: i,
      baseStartFrame,
      staggerFrames,
      accelerate: false,
    });
    const enterFrame =
      baseEnterFrame + Math.round(stage.enterOffsetSeconds * fps);
    return { stage, x, enterFrame };
  });

  // Connector i sits between card[i] and card[i+1] — center is at the midpoint
  // of the gap between them. It starts drawing 4 frames after card[i+1] lands.
  const connectorStart = (i: number): number =>
    layout[i + 1].enterFrame + 4;

  // Emphasis pill enters `pillEnterDelayAfterLastStageSeconds` after the last
  // stage card lands. Defensive fallback if `stages` is empty.
  const lastEnter =
    layout.length > 0
      ? layout[layout.length - 1].enterFrame
      : baseStartFrame;
  const pillEnterFrame =
    lastEnter + Math.round(pillEnterDelayAfterLastStageSeconds * fps);

  // Default watermark style — Nate's signature presenter watermark with handle.
  const watermarkStyle = {
    enabled: true as const,
    logo: "avatar" as const,
    position: "bottom-right" as const,
    size: 120,
    opacity: 0.9,
  };

  // Editorial caption muted border color (uses palette muted at 20% alpha).
  const mutedBorderColor = `${colors.muted}33`;

  return (
    <DarkSlateChassis16x9 slateColor={resolvedPaper}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
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

      {/* Universal house-grammar breadcrumb (top-left) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section label chip (top-center) */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* Connectors — render BEFORE cards so card shadows/borders sit on top */}
      {layout.slice(0, -1).map((_, i) => {
        const leftCardRight = layout[i].x + cardWidth;
        const rightCardLeft = layout[i + 1].x;
        const cx = (leftCardRight + rightCardLeft) / 2;
        const halfWidth = (rightCardLeft - leftCardRight) / 2;
        const fromFrame = connectorStart(i);
        return (
          <Sequence
            key={`connector-${i}`}
            from={fromFrame}
            durationInFrames={9999}
            layout="none"
          >
            <Connector
              style={connectorStyle}
              cx={cx}
              cy={flowCenterY}
              halfWidth={halfWidth}
              accentColor={resolvedAccent}
              drawDurationFrames={connectorDrawFrames}
            />
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
            x={entry.x}
            y={cardY}
            width={cardWidth}
            height={CARD_H}
            paletteMode={palette}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
          />
        </Sequence>
      ))}

      {/* Emphasis pill — fades in after the last stage settles */}
      {emphasisPill.enabled && (
        <Sequence
          from={pillEnterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <div
            style={{
              position: "absolute",
              top: PILL_Y,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <EmphasisPill
              text={emphasisPill.text}
              emphasisWords={emphasisPill.emphasisWords}
              emphasisColor={emphasisPill.emphasisColor}
              baseColor={resolvedInk}
              borderColor={`${resolvedAccent}55`}
              borderWidthPx={1.5}
              fontSize={42}
              fontWeight={600}
              paddingX={36}
              paddingY={18}
              maxWidthPx={1400}
              fadeInFrames={12}
            />
          </div>
        </Sequence>
      )}

      {/* Persistent presenter watermark */}
      <BrandWatermark16x9
        style={watermarkStyle}
        handle="@armandointeligencia"
      />

      {/* Optional word-by-word captions in the bottom strip */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 80,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </DarkSlateChassis16x9>
  );
};
