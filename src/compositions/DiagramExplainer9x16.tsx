/**
 * DiagramExplainer9x16 — vertical (1080×1920) flow/mechanism explainer.
 *
 * Inspired by @carloscuamatzin's cream-flowchart pattern (analyzed at
 * references/creators/carloscuamatzin/ANALYSIS.md, reel DYqgAYfRqBf "EL FLUJO").
 *
 * Visual structure (top → bottom):
 *   - Section label (tracking-spaced uppercase sans, warm-red)
 *   - 2–4 rounded-rectangle "node cards" stacked vertically
 *     · Each card: white-on-cream with thin warm-red border
 *     · Bold sans title (Inter)
 *     · Optional mono-style sublabel (warm-red muted)
 *   - Warm-red downward arrows between cards (SVG path with stroke-dasharray draw-on)
 *   - Ghosted node(s) rendered with reduced opacity (= "not yet / future step")
 *   - Bottom-third: word-by-word EditorialCaption
 *
 * Each node enters sequentially: node[i] appears at firstNodeDelaySeconds + i*sequenceStepSeconds.
 * Arrows draw shortly after their TARGET node enters.
 *
 * v1: deterministic sequential timing (no audio-anchored triggers per node yet).
 * v2: add per-node `triggerKeyword` so each card lands when its keyword is spoken.
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
import type { DiagramExplainerProps, DiagramNode } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";

// Layout constants
const NODE_W = 880;
const NODE_H = 220;
const NODE_GAP = 56; // vertical gap between cards (where arrows live)
const SECTION_LABEL_Y = 360; // pushed down to make room for optional breadcrumb at top
const FIRST_NODE_Y = 500;

// ─── Node card ──────────────────────────────────────────────────────
const NodeCard: React.FC<{
  node: DiagramNode;
  y: number;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode?: "cream" | "dark";
}> = ({ node, y, paperColor, inkColor, accentColor, mutedColor, paletteMode = "cream" }) => {
  // NOTE: useCurrentFrame() inside <Sequence> returns frame relative to the sequence's
  // `from` — i.e. frame 0 is the moment this node enters. Don't subtract enterFrame here.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring (A1 audit): damping 22 / stiffness 130 / mass 0.7 is the
  // critically-damped "Bloomberg" profile shared by every cream/dark composition
  // (DiagramExplainer, BigNumberHero, QuoteCard9x16, BenchmarkBars title,
  // TweetCardHero). The punchier (15/110) profile lives in TechNewsFlash overlays
  // via useOverlayChoreography — don't mix them in the same template.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  // Ghosted nodes still need to read clearly; 0.45 was too faint. Use 0.62 instead.
  const opacity = interpolate(enter, [0, 1], [0, node.ghosted ? 0.62 : 1.0]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  // Card surface adapts to palette: cream → white card on cream, dark → near-black card on darker bg
  const cardBg = paletteMode === "dark" ? "#10172A" : "#FFFFFF";
  const cardShadow =
    paletteMode === "dark"
      ? `0 8px 28px rgba(212, 160, 74, 0.16), 0 1px 0 rgba(212, 160, 74, 0.22)`
      : `0 8px 28px rgba(179, 58, 42, 0.10), 0 1px 0 rgba(179, 58, 42, 0.18)`;

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - NODE_W) / 2,
        top: y,
        width: NODE_W,
        minHeight: NODE_H,
        background: cardBg,
        border: `2px solid ${accentColor}`,
        borderRadius: 14,
        padding: "30px 36px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        boxShadow: node.ghosted ? "none" : cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 58,
          // A3 audit: dark-palette body text >30px renders sharper as pure white
          // (cream ink anti-aliases soft on dark cards).
          color: getBodyTextColor(paletteMode, inkColor, 58),
          lineHeight: 1.05,
          textAlign: "center",
          letterSpacing: "-0.015em",
        }}
      >
        {node.title}
      </div>
      {node.sublabel && (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: 30,
            color: accentColor,
            opacity: 0.75,
            letterSpacing: "0.02em",
          }}
        >
          {node.sublabel}
        </div>
      )}
    </div>
  );
};

// ─── Arrow between two nodes ────────────────────────────────────────
const NodeArrow: React.FC<{
  fromY: number;
  toY: number;
  accentColor: string;
  ghosted?: boolean;
}> = ({ fromY, toY, accentColor, ghosted }) => {
  // Inside <Sequence>, frame is already local — 0 at draw start.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = 0.35 * fps;
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Arrow geometry: vertical line from (cx, fromY) → (cx, toY-12),
  // then arrowhead triangle.
  const cx = 1080 / 2;
  const armLength = toY - fromY - 24; // leave 24px gap for arrowhead at the bottom
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
        opacity: ghosted ? 0.35 : 1,
      }}
    >
      {/* shaft */}
      <line
        x1={cx}
        y1={fromY}
        x2={cx}
        y2={fromY + visibleLen}
        stroke={accentColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* arrowhead — only paints once shaft is fully drawn */}
      {progress > 0.92 && (
        <polygon
          points={`${cx - 12},${toY - 16} ${cx + 12},${toY - 16} ${cx},${toY}`}
          fill={accentColor}
          style={{
            opacity: interpolate(progress, [0.92, 1.0], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}
    </svg>
  );
};

// ─── Section label (top tracking-spaced uppercase) ───────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
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
        fontFamily: "Inter, sans-serif",
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

// ─── Composition ────────────────────────────────────────────────────
export const DiagramExplainer9x16: React.FC<DiagramExplainerProps> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  breadcrumb,
  subjectTool,
  palette,
  nodes,
  sequenceStepSeconds,
  firstNodeDelaySeconds,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
}) => {
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default" (Zod schemas default to "" if unset).
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  // Subject-tool-tinted accent override (overrides palette accent if subjectTool set)
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Compute each node's Y position + enter frame
  const layout = nodes.map((node, i) => {
    const y = FIRST_NODE_Y + i * (NODE_H + NODE_GAP);
    const enterSec =
      node.enterAtSeconds !== undefined
        ? node.enterAtSeconds
        : firstNodeDelaySeconds + i * sequenceStepSeconds;
    const enterFrame = Math.round(enterSec * fps);
    return { node, y, enterFrame };
  });

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay (cream uses subtle vignette, dark uses amber-tinted vignette) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (Carlos + DIYSmartCode pattern) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section label */}
      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* Arrows BETWEEN nodes (drawn under the cards) */}
      {layout.slice(0, -1).map((entry, i) => {
        const fromY = entry.y + NODE_H + 0;
        const toY = layout[i + 1].y;
        // Arrow draws 0.2s after the TARGET node enters
        const drawStartFrame = layout[i + 1].enterFrame + Math.round(0.2 * fps);
        return (
          <Sequence
            key={`arrow-${i}`}
            from={drawStartFrame}
            durationInFrames={9999}
            layout="none"
          >
            <NodeArrow
              fromY={fromY}
              toY={toY}
              accentColor={resolvedAccent}
              ghosted={layout[i + 1].node.ghosted}
            />
          </Sequence>
        );
      })}

      {/* Nodes themselves */}
      {layout.map((entry, i) => (
        <Sequence
          key={`node-${i}`}
          from={entry.enterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <NodeCard
            node={entry.node}
            y={entry.y}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            mutedColor={resolvedMuted}
            paletteMode={palette}
          />
        </Sequence>
      ))}

      {/* Word-by-word captions (bottom third) */}
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 160,
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
