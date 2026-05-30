/**
 * WhiteboardScene9x16 — Simon T4 "handwritten Procreate-marker-on-paper" template.
 *
 * Inspired by @simonhoiberg's whiteboard reels analyzed in
 * docs/critiques/wave-4/simonhoiberg-consensus.md (MED finding "WhiteboardScene9x16",
 * Simon V5 lesson #1: "hand-drawn marker beats any font for educational warmth").
 *
 * Since we don't have actual marker brush textures, we approximate the hand-feel via:
 *   - PAPER_PALETTE (#F1EDE8 warm off-white) as the background, NOT pure white
 *   - Caveat (cursive Google font) for the title, with a Playfair-italic fallback
 *     baked into the font-family stack — Caveat itself is NOT loaded by this module
 *     (that's an out-of-scope font-licensing decision); the stack degrades gracefully
 *   - Per-line ±N° rotation jitter on each item so the list never reads as a grid
 *   - SVG checkboxes drawn with stroke-width 4 + sketchy stroke-linecap "round"
 *   - Wavy SVG arrows between items, drawn on with stroke-dasharray
 *
 * Layout (top → bottom on the 1080×1920 paper canvas):
 *   1. Optional paperPattern (lined / graph / blank) painted under everything
 *   2. Optional BrandBreadcrumb at the top
 *   3. Big handwritten title (Caveat, ~180px, slight tilt)
 *   4. Vertically stacked item list:
 *        [checkbox?]  [text]
 *                     [sub-text?]
 *      Each item enters via the accelerating staggerEntry() cascade.
 *   5. Optional wavy arrows between specific item pairs
 *   6. Optional EditorialCaption strip (default OFF per Simon V5 — captions kill warmth)
 */
import React, { useMemo } from "react";
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
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { staggerEntry } from "../animation/staggeredCascade";

// --- Schemas (kept local; the centralized schemas.ts file pins palette to
//     ["cream","dark"] which is too narrow for the whiteboard "paper" default). ---
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

const whiteboardItemSchema = z.object({
  text: z.string(),
  /** Optional sub-text below the main line (muted color). */
  sub: z.string().optional(),
  /** Optional checkbox glyph state. */
  check: z.enum(["empty", "checked", "crossed"]).optional(),
  /** Per-item rotation jitter in degrees. Default ±2 (alternates by index). */
  rotationDegrees: z.number().optional(),
  /** Per-item color override (allows red-pencil emphasis on key lines). */
  color: z.string().optional(),
  /** When set, this item enters at this absolute second. Otherwise sequential. */
  enterAtSeconds: z.number().optional(),
});
export type WhiteboardItem = z.infer<typeof whiteboardItemSchema>;

const whiteboardArrowSchema = z.object({
  fromIndex: z.number().int().min(0),
  toIndex: z.number().int().min(0),
  label: z.string().optional(),
});
export type WhiteboardArrow = z.infer<typeof whiteboardArrowSchema>;

export const whiteboardScene9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Hand-drawn title at the top (e.g. "Marketing"). */
  title: z.string().default(""),
  items: z.array(whiteboardItemSchema).default([]),
  /** Optional connecting arrows between item indices. */
  arrows: z.array(whiteboardArrowSchema).default([]),
  /** Background pattern. Default "blank". */
  paperPattern: z.enum(["lined", "graph", "blank"]).default("blank"),
  sectionLabel: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  /** Force paper palette by default — the whole concept is paper. */
  palette: z.enum(ALL_PALETTE_MODES).default("paper"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  /** Seconds before the FIRST item enters. Default 0.5. */
  firstItemDelaySeconds: z.number().min(0).max(10).default(0.5),
  /** Seconds between consecutive items (linear baseline; cascade accelerates). Default 0.9. */
  sequenceStepSeconds: z.number().min(0.1).max(5).default(0.9),
  /** Simon V5: hand-drawn warmth dies the moment captions land on top. Default OFF. */
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type WhiteboardScene9x16Props = z.infer<typeof whiteboardScene9x16Schema>;

// ─── Layout constants ───────────────────────────────────────────────
const TITLE_Y = 280;
const ITEMS_START_Y = 580;
const ITEM_GAP = 200; // vertical gap between item rows
const ITEM_INDENT_X = 130; // left padding from the page edge

// Hand-drawn font stack — Caveat first, then Permanent Marker, then italic serif
// fallback (Playfair italic IS loaded by brand/fonts.ts so this always degrades
// to a real italic face even if Caveat isn't installed locally).
const HANDWRITTEN_FONT = `'Caveat', 'Permanent Marker', ${FONT_STACKS.serifItalic}`;

// Per-line rotation jitter so the list never reads as a perfect grid.
// Alternates ±2° unless the item overrides via `rotationDegrees`.
function defaultJitter(index: number): number {
  const magnitudes = [1.4, -1.8, 2.2, -1.2, 1.6, -2.0];
  return magnitudes[index % magnitudes.length];
}

// ─── Paper-pattern background ───────────────────────────────────────
const PaperPattern: React.FC<{
  pattern: "lined" | "graph" | "blank";
  mutedColor: string;
}> = ({ pattern, mutedColor }) => {
  if (pattern === "blank") return null;

  if (pattern === "lined") {
    // Horizontal rules every 72px in muted ~12% alpha
    const lines: React.ReactNode[] = [];
    for (let y = 120; y < 1920; y += 72) {
      lines.push(
        <line
          key={`l-${y}`}
          x1={60}
          y1={y}
          x2={1020}
          y2={y}
          stroke={mutedColor}
          strokeWidth={1.2}
          strokeOpacity={0.18}
        />,
      );
    }
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none" }}
      >
        {lines}
      </svg>
    );
  }

  // Graph: dot grid every 60px
  const dots: React.ReactNode[] = [];
  for (let y = 80; y < 1920; y += 60) {
    for (let x = 60; x < 1080; x += 60) {
      dots.push(
        <circle
          key={`d-${x}-${y}`}
          cx={x}
          cy={y}
          r={1.8}
          fill={mutedColor}
          fillOpacity={0.22}
        />,
      );
    }
  }
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none" }}
    >
      {dots}
    </svg>
  );
};

// ─── SVG checkbox (empty / checked / crossed) ───────────────────────
const Checkbox: React.FC<{
  state: "empty" | "checked" | "crossed";
  color: string;
  sizePx?: number;
}> = ({ state, color, sizePx = 56 }) => {
  const inset = 4;
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox={`0 0 ${sizePx} ${sizePx}`}
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      {/* Outer square — slightly skewed to feel hand-drawn */}
      <rect
        x={inset}
        y={inset}
        width={sizePx - inset * 2}
        height={sizePx - inset * 2}
        rx={3}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {state === "checked" && (
        <polyline
          points={`${inset + 8},${sizePx / 2} ${sizePx / 2 - 2},${sizePx - inset - 10} ${sizePx - inset - 6},${inset + 10}`}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {state === "crossed" && (
        <g>
          <line
            x1={inset + 10}
            y1={inset + 10}
            x2={sizePx - inset - 10}
            y2={sizePx - inset - 10}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={sizePx - inset - 10}
            y1={inset + 10}
            x2={inset + 10}
            y2={sizePx - inset - 10}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

// ─── Hand-drawn title ───────────────────────────────────────────────
const HandDrawnTitle: React.FC<{
  text: string;
  inkColor: string;
}> = ({ text, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 130, mass: 0.7 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: HANDWRITTEN_FONT,
        fontWeight: 700,
        fontSize: 180,
        color: inkColor,
        lineHeight: 1.0,
        letterSpacing: "-0.01em",
        opacity,
        transform: `translateY(${translateY}px) rotate(-1.2deg)`,
        transformOrigin: "center center",
        fontStyle: "italic",
      }}
    >
      {text}
    </div>
  );
};

// ─── Section label (small, tracking-spaced uppercase, under title) ──
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y + 200,
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
      }}
    >
      {text}
    </div>
  );
};

// ─── Item row (checkbox + text + sub) ───────────────────────────────
const ItemRow: React.FC<{
  item: WhiteboardItem;
  index: number;
  y: number;
  inkColor: string;
  mutedColor: string;
  accentColor: string;
}> = ({ item, index, y, inkColor, mutedColor, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Inside <Sequence>, frame is already local — 0 at enter.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);

  const rotation = item.rotationDegrees ?? defaultJitter(index);
  const textColor = item.color || inkColor;
  // The text uses Inter heavy (not Caveat) per spec — main lines are
  // sans-serif, only the title is cursive. The rotation jitter alone is
  // enough to telegraph "handwritten" once paired with the paper texture.
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: ITEM_INDENT_X,
        right: ITEM_INDENT_X,
        display: "flex",
        alignItems: "flex-start",
        gap: 28,
        opacity,
        transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
        transformOrigin: "left center",
      }}
    >
      {item.check && (
        <div style={{ marginTop: 8 }}>
          <Checkbox state={item.check} color={accentColor} sizePx={56} />
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 68,
            color: textColor,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            textDecoration: item.check === "crossed" ? "line-through" : "none",
            textDecorationColor: item.check === "crossed" ? accentColor : undefined,
            textDecorationThickness: 4,
          }}
        >
          {item.text}
        </div>
        {item.sub && (
          <div
            style={{
              fontFamily: HANDWRITTEN_FONT,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 42,
              color: mutedColor,
              lineHeight: 1.1,
            }}
          >
            {item.sub}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Wavy arrow between two item rows ───────────────────────────────
const WavyArrow: React.FC<{
  fromY: number;
  toY: number;
  label: string | undefined;
  accentColor: string;
}> = ({ fromY, toY, label, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = 0.45 * fps;
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Wavy path: start near the source row right margin, gentle S-curve
  // down to the target row left margin. We anchor along the right gutter
  // (~x=860) so the arrow doesn't collide with the text column.
  const startX = 860;
  const startY = fromY + 30;
  const endX = 860;
  const endY = toY - 10;
  const ctrl1X = 980;
  const ctrl1Y = startY + (endY - startY) * 0.33;
  const ctrl2X = 740;
  const ctrl2Y = startY + (endY - startY) * 0.66;
  const d = `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;

  // Rough path length (cubic Bézier upper bound ≈ chord + sum of control offsets).
  // Using a generous constant 600 px works for the typical 200px row gap; the
  // dashoffset interpolation makes it draw-on regardless of actual length.
  const dashLen = 600;
  const dashOffset = dashLen * (1 - progress);

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
      <path
        d={d}
        fill="none"
        stroke={accentColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={dashLen}
        strokeDashoffset={dashOffset}
        opacity={0.85}
      />
      {/* Arrowhead — only draws once the path is mostly complete */}
      {progress > 0.85 && (
        <polygon
          points={`${endX - 10},${endY - 16} ${endX + 12},${endY - 12} ${endX},${endY + 6}`}
          fill={accentColor}
          opacity={interpolate(progress, [0.85, 1.0], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      )}
      {label && progress > 0.6 && (
        <text
          x={(startX + endX) / 2 + 28}
          y={(startY + endY) / 2}
          fill={accentColor}
          fontFamily={HANDWRITTEN_FONT}
          fontStyle="italic"
          fontSize={32}
          fontWeight={600}
          opacity={interpolate(progress, [0.6, 0.95], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const WhiteboardScene9x16: React.FC<WhiteboardScene9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  items,
  arrows,
  paperPattern,
  sectionLabel,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  firstItemDelaySeconds,
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

  // getToolAccentForSurface only accepts "cream" | "dark" — map the broader
  // palette set onto the closest surface light/dark bucket. "paper" is light.
  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette as PaletteMode).grainOverlay;

  // Per-item Y + enter frame. Use the accelerating cascade for entries when
  // no explicit enterAtSeconds is set.
  const baseFrame = Math.round(firstItemDelaySeconds * fps);
  const staggerFrames = Math.round(sequenceStepSeconds * fps);
  const layout = useMemo(
    () =>
      items.map((item, i) => {
        const y = ITEMS_START_Y + i * ITEM_GAP;
        const enterFrame =
          item.enterAtSeconds !== undefined
            ? Math.round(item.enterAtSeconds * fps)
            : staggerEntry({
                index: i,
                baseStartFrame: baseFrame,
                staggerFrames,
                accelerate: true,
              });
        return { item, y, enterFrame };
      }),
    [items, fps, baseFrame, staggerFrames],
  );

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Paper texture grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Optional lined / graph pattern */}
      <PaperPattern pattern={paperPattern} mutedColor={resolvedMuted} />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Title (hand-drawn cursive) */}
      {title && <HandDrawnTitle text={title} inkColor={resolvedInk} />}

      {/* Section label under the title */}
      {sectionLabel && <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />}

      {/* Arrows BETWEEN items — drawn after the TARGET item enters */}
      {arrows.map((arrow, i) => {
        const fromEntry = layout[arrow.fromIndex];
        const toEntry = layout[arrow.toIndex];
        if (!fromEntry || !toEntry) return null;
        const drawStartFrame = toEntry.enterFrame + Math.round(0.25 * fps);
        return (
          <Sequence
            key={`arrow-${i}`}
            from={drawStartFrame}
            durationInFrames={9999}
            layout="none"
          >
            <WavyArrow
              fromY={fromEntry.y}
              toY={toEntry.y}
              label={arrow.label}
              accentColor={resolvedAccent}
            />
          </Sequence>
        );
      })}

      {/* Item rows */}
      {layout.map((entry, i) => (
        <Sequence
          key={`item-${i}`}
          from={entry.enterFrame}
          durationInFrames={9999}
          layout="none"
        >
          <ItemRow
            item={entry.item}
            index={i}
            y={entry.y}
            inkColor={resolvedInk}
            mutedColor={resolvedMuted}
            accentColor={resolvedAccent}
          />
        </Sequence>
      ))}

      {/* Captions — opt-in, OFF by default (Simon V5 warns they kill warmth) */}
      {showCaptions && (
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
      )}
    </AbsoluteFill>
  );
};
