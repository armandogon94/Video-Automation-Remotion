/**
 * DiagramExplainer16x9 — horizontal (1920×1080) flow/mechanism explainer.
 *
 * 16:9 sibling of `DiagramExplainer9x16` (Carlos-inspired cream flowchart).
 * ADR-001-16x9-lane §2.1/§2.4/§5.1.
 *
 * Layout re-design for landscape:
 *   Nodes are arranged HORIZONTALLY in a single row across the 1920px canvas.
 *   Arrows between nodes are HORIZONTAL (left→right), drawn via stroke-dashoffset.
 *   Section label sits top-left, title sits center-left.
 *   The wider canvas allows larger nodes with more breathing room between them.
 *
 *   - Section label chip: tracking-spaced uppercase sans, accent, top-center.
 *   - Title: Inter 900 ~80px, ink, centered.
 *   - NODE ROW (vertically centered): 2–4 nodes arranged horizontally.
 *     Each node: rounded-rect with border + bold sans title + optional sublabel.
 *   - Horizontal arrows between nodes draw via stroke-dashoffset.
 *   - Ghosted nodes render at 0.62 opacity.
 *   - Optional bottom EditorialCaption strip.
 *
 * Brand chrome: DarkSlateChassis16x9 + BrandBreadcrumb16x9 + BrandWatermark16x9.
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
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

const diagramNode16x9Schema_item = z.object({
  title: z.string().default(""),
  sublabel: z.string().default(""),
  enterAtSeconds: z.number().optional(),
  ghosted: z.boolean().optional(),
});
type DiagramNode16x9Item = z.infer<typeof diagramNode16x9Schema_item>;

// ─── Public schema ────────────────────────────────────────────────────────────
export const diagramExplainer16x9Schema = z.object({
  audioUrl: z.string().optional(),
  wordTimings: z.array(wordTimingSchema_local).optional(),
  sectionLabel: z.string().default("EL FLUJO"),
  /** Title above the node row. */
  title: z.string().optional(),
  breadcrumb: breadcrumbSchema_local.nullable().optional(),
  watermark: watermarkSchema_local.nullable().optional(),
  watermarkHandle: z.string().optional(),
  subjectTool: z.string().nullable().optional(),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  nodes: z
    .array(diagramNode16x9Schema_item)
    .min(2)
    .max(4)
    .default([
      { title: "Input", sublabel: "prompt" },
      { title: "Reasoning", sublabel: "chain-of-thought" },
      { title: "Output", sublabel: "completion" },
    ]),
  /** Seconds between consecutive node entrances. Default 1.2s. */
  sequenceStepSeconds: z.number().min(0.3).max(10).default(1.2),
  /** Seconds before the FIRST node enters. Default 0.4. */
  firstNodeDelaySeconds: z.number().min(0).max(10).default(0.4),
  paperColor: z.string().optional(),
  inkColor: z.string().optional(),
  accentColor: z.string().optional(),
  mutedColor: z.string().optional(),
  /** ADR §5.1: 16:9 caption default 32–36 px. */
  captionFontSize: z.number().min(20).max(120).optional(),
  showCaptions: z.boolean().default(false),
});

export type DiagramExplainer16x9Props = z.infer<
  typeof diagramExplainer16x9Schema
>;

// ─── Layout constants (1920×1080) ─────────────────────────────────────────
const FRAME_W = 1920;
const FRAME_H = 1080;
const HORIZONTAL_GUTTER = 80;
const NODE_GAP = 60; // horizontal gap between nodes (where arrows live)
const NODE_H = 180;
const NODE_BORDER_RADIUS = 14;
const NODE_ROW_CENTER_Y = FRAME_H / 2; // vertical center for the node row
const SECTION_LABEL_Y = 80;
const TITLE_Y = 150;

// Arrow draw duration (frames).
const ARROW_DRAW_FRAMES = 18;

// ─── Section label ─────────────────────────────────────────────────────────
const SectionLabel16x9: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
  if (!text) return null;
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

// ─── Title above node row ──────────────────────────────────────────────────
const DiagramTitle16x9: React.FC<{
  text: string;
  inkColor: string;
  palette: DiagramExplainer16x9Props["palette"];
}> = ({ text, inkColor, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 900,
        /* ADR §5.1: hero 16:9 headline 140–180px; supporting title smaller. */
        fontSize: 64,
        color: getBodyTextColor(palette, inkColor, 64),
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        padding: "0 80px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Node card (horizontal variant) ────────────────────────────────────────
const NodeCard16x9: React.FC<{
  node: DiagramNode16x9Item;
  leftPx: number;
  widthPx: number;
  accentColor: string;
  inkColor: string;
  palette: DiagramExplainer16x9Props["palette"];
}> = ({ node, leftPx, widthPx, accentColor, inkColor, palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring (same profile as 9:16 sibling).
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, node.ghosted ? 0.62 : 1.0]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";
  const cardBg = isDark ? "#10172A" : "#FFFFFF";
  const cardShadow = isDark
    ? `0 8px 28px rgba(212, 160, 74, 0.16), 0 1px 0 rgba(212, 160, 74, 0.22)`
    : `0 8px 28px rgba(179, 58, 42, 0.10), 0 1px 0 rgba(179, 58, 42, 0.18)`;

  return (
    <div
      style={{
        position: "absolute",
        left: leftPx,
        top: NODE_ROW_CENTER_Y - NODE_H / 2,
        width: widthPx,
        height: NODE_H,
        background: cardBg,
        border: `2px solid ${accentColor}`,
        borderRadius: NODE_BORDER_RADIUS,
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        boxShadow: node.ghosted ? "none" : cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          /* ADR §5.1: body text 16:9 default 30–36 px; node title is emphasis size. */
          fontSize: 44,
          color: getBodyTextColor(palette, inkColor, 44),
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
            fontSize: 24,
            color: accentColor,
            opacity: 0.75,
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {node.sublabel}
        </div>
      )}
    </div>
  );
};

// ─── Horizontal arrow between nodes ────────────────────────────────────────
const NodeArrow16x9: React.FC<{
  fromX: number;
  toX: number;
  accentColor: string;
  ghosted?: boolean;
}> = ({ fromX, toX, accentColor, ghosted }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, ARROW_DRAW_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cy = NODE_ROW_CENTER_Y;
  const arrowBodyLength = toX - fromX - 16; // leave 16px gap for arrowhead
  const visibleLen = arrowBodyLength * progress;

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: FRAME_H,
        pointerEvents: "none",
        opacity: ghosted ? 0.35 : 1,
      }}
    >
      {/* Shaft */}
      <line
        x1={fromX}
        y1={cy}
        x2={fromX + visibleLen}
        y2={cy}
        stroke={accentColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Arrowhead — paints once shaft is near its final position. */}
      {progress > 0.9 && (
        <polygon
          points={`${toX - 14},${cy - 10} ${toX - 14},${cy + 10} ${toX},${cy}`}
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

// ─── Helpers ───────────────────────────────────────────────────────────────
/**
 * Compute left position and width for each node so they are evenly spaced
 * across the available horizontal area.
 */
function computeNodeLayout(
  count: number,
): Array<{ leftPx: number; widthPx: number }> {
  const totalWidth =
    FRAME_W - HORIZONTAL_GUTTER * 2 - NODE_GAP * (count - 1);
  const nodeWidth = Math.floor(totalWidth / count);
  return Array.from({ length: count }, (_, i) => ({
    leftPx: HORIZONTAL_GUTTER + i * (nodeWidth + NODE_GAP),
    widthPx: nodeWidth,
  }));
}

// ─── Composition ─────────────────────────────────────────────────────────────
export const DiagramExplainer16x9: React.FC<DiagramExplainer16x9Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  title,
  breadcrumb,
  watermark,
  watermarkHandle,
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

  const nodeLayout = computeNodeLayout(nodes.length);

  // Compute each node's enter frame.
  const layout = nodes.map((node, i) => {
    const enterSec =
      node.enterAtSeconds !== undefined
        ? node.enterAtSeconds
        : firstNodeDelaySeconds + i * sequenceStepSeconds;
    const enterFrame = Math.round(enterSec * fps);
    return { node, enterFrame, layout: nodeLayout[i] };
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

      {/* Section label (uppercase tracking-spaced) */}
      <SectionLabel16x9
        text={sectionLabel}
        accentColor={resolvedAccent}
      />

      {/* Optional title above the node row */}
      <DiagramTitle16x9
        text={title ?? ""}
        inkColor={resolvedInk}
        palette={palette}
      />

      {/* Horizontal arrows BETWEEN nodes (drawn under the cards) */}
      {layout.slice(0, -1).map((entry, i) => {
        const fromX = entry.layout.leftPx + entry.layout.widthPx;
        const toX = layout[i + 1].layout.leftPx;
        // Arrow draws 0.2s after the TARGET node enters.
        const drawStartFrame = layout[i + 1].enterFrame + Math.round(0.2 * fps);
        return (
          <Sequence
            key={`arrow-${i}`}
            from={drawStartFrame}
            durationInFrames={9999}
            layout="none"
          >
            <NodeArrow16x9
              fromX={fromX}
              toX={toX}
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
          <NodeCard16x9
            node={entry.node}
            leftPx={entry.layout.leftPx}
            widthPx={entry.layout.widthPx}
            accentColor={resolvedAccent}
            inkColor={resolvedInk}
            palette={palette}
          />
        </Sequence>
      ))}

      {/* Optional bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Word-by-word captions — default OFF per ADR §2.5 */}
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

export default DiagramExplainer16x9;
