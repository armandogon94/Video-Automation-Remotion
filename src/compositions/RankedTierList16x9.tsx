/**
 * RankedTierList16x9 — horizontal (1920×1080) ranked-tier listicle.
 *
 * 16:9 sibling of RankedTierList9x16. Preserves the Hormozi/Klaus dwell-beat
 * choreography (heldStagger) but re-layouts for the wide canvas:
 *
 *   Landscape layout:
 *     ┌────────────────────────────────────────────────────────────────────┐
 *     │ BRAND BREADCRUMB                                         WATERMARK │
 *     │                                                                    │
 *     │  SECTION LABEL (eyebrow chip, top-left)                            │
 *     │                                                                    │
 *     │  TITLE (large left-aligned sans, ~160px)                           │
 *     │  SUBTITLE (mono tracked, smaller)                                  │
 *     │                                                                    │
 *     │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                              │
 *     │  │ #5 │ │ #4 │ │ #3 │ │ #2 │ │ #1 │  ← items as HORIZONTAL row   │
 *     │  └────┘ └────┘ └────┘ └────┘ └────┘                              │
 *     │                                                                    │
 *     │                                              (optional captions)  │
 *     └────────────────────────────────────────────────────────────────────┘
 *
 * Items render as a single horizontal row of equal-width columns that fills
 * the bottom ~340px of the canvas. The dwell-beat choreography from 9x16 is
 * preserved — each column enters with `translateX(-20 → 0)` (instead of Y),
 * holds for `holdFrames`, then the next column begins. `revealDirection`
 * controls whether the reveal sweeps left-to-right or right-to-left.
 *
 * ADR-001 §5.1 font defaults:
 *   - Title: 140px (hero numeral / headline, left-aligned).
 *   - Body label: 32px (vs 38px in 9x16 — narrower columns).
 *   - Sub-label: 20px.
 *   - Rank numeral: 56px (vs 64px).
 *   - captionFontSize default: 36px.
 *
 * `sideBySideHost` is NOT ported — the horizontal layout is already the
 * widened variant; the 9x16 side-by-side pattern has no landscape analogue.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { heldStaggerState } from "../animation/heldStagger";
import type { WatermarkStyle } from "./schemas";

// ─── Local schemas (self-contained — ADR-001 §2.4) ─────────────────────
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

const tierItemSchema = z.object({
  rank: z.string().default(""),
  label: z.string().default(""),
  sub: z.string().default(""),
  color: z.string().default(""),
});
export type RankedTierItem16x9 = z.infer<typeof tierItemSchema>;

export const rankedTierList16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  title: z.string().default("Top 5 razones"),
  subtitle: z.string().default(""),
  sectionLabel: z.string().default(""),

  /**
   * Items in REVEAL order. Left column = first revealed; right column = last
   * (climax) when `revealDirection = "left-to-right"` (the 16:9 default).
   */
  items: z
    .array(tierItemSchema)
    .default([
      { rank: "5", label: "Item five", sub: "", color: "" },
      { rank: "4", label: "Item four", sub: "", color: "" },
      { rank: "3", label: "Item three", sub: "", color: "" },
      { rank: "2", label: "Item two", sub: "", color: "" },
      { rank: "1", label: "Item one", sub: "", color: "" },
    ]),

  /**
   * Reveal direction for the horizontal row.
   * "left-to-right": leftmost column enters first (climax on the right).
   * "right-to-left": rightmost column enters first (climax on the left).
   */
  revealDirection: z
    .enum(["left-to-right", "right-to-left"])
    .default("left-to-right"),

  revealFrames: z.number().default(10),
  holdFrames: z.number().default(14),
  firstItemEnterSeconds: z.number().default(1.0),

  transitionVerb: z
    .string()
    .optional(),

  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.nullable().default(null),
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  /** ADR-001 §5.1: 16:9 default "cream". */
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type RankedTierList16x9Props = z.infer<typeof rankedTierList16x9Schema>;

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

const SECTION_LABEL_Y = 100;
const TITLE_Y = 160;

// Items horizontal row — occupies a fixed band at the bottom of the frame.
const ROW_TOP = 680;
const ROW_HEIGHT = 320;
const ROW_LEFT = 60;
const ROW_RIGHT = 60; // right-side margin
const ROW_GAP = 20;

// ─── Section label (eyebrow chip) ───────────────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: ROW_LEFT,
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        // ADR-001 §5.1: body 30px for 16:9 labels.
        fontSize: 30,
        color: accentColor,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [-6, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Title + subtitle ────────────────────────────────────────────────────
const TitleBlock: React.FC<{
  title: string;
  subtitle: string;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
}> = ({ title, subtitle, inkColor, accentColor, mutedColor, paletteMode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);
  void mutedColor;

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: ROW_LEFT,
        maxWidth: CANVAS_W - ROW_LEFT * 2,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          // ADR-001 §5.1: hero title 140px for 16:9.
          fontSize: 140,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          color: accentColor,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: getBodyTextColor(paletteMode, inkColor, 28),
            opacity: 0.75,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ─── Single tier column card ─────────────────────────────────────────────
const TierColumn: React.FC<{
  item: RankedTierItem16x9;
  revealIndex: number;
  leftPx: number;
  widthPx: number;
  baseStartFrame: number;
  revealFrames: number;
  holdFrames: number;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
}> = ({
  item,
  revealIndex,
  leftPx,
  widthPx,
  baseStartFrame,
  revealFrames,
  holdFrames,
  inkColor,
  accentColor,
  mutedColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();

  const state = heldStaggerState({
    frame,
    index: revealIndex,
    baseStartFrame,
    revealFrames,
    holdFrames,
  });

  if (state.phase === "pre") return null;

  const entering = state.phase === "entering";
  // 16:9: items slide in horizontally (translateX) rather than vertically.
  const translateX = entering ? -20 + 20 * state.progress : 0;
  const opacity = entering ? state.progress : 1;

  const cardBg =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black"
      ? "#10172A"
      : "#FFFFFF";

  const itemAccent = item.color && item.color.length > 0 ? item.color : accentColor;

  const cardShadow = state.isHeld
    ? paletteMode === "dark" ||
      paletteMode === "warm-black" ||
      paletteMode === "true-black"
      ? `0 10px 32px rgba(212, 160, 74, 0.22), 0 1px 0 rgba(212, 160, 74, 0.30)`
      : `0 10px 32px rgba(0, 0, 0, 0.10), 0 1px 0 ${itemAccent}33`
    : paletteMode === "dark" ||
        paletteMode === "warm-black" ||
        paletteMode === "true-black"
      ? `0 6px 20px rgba(212, 160, 74, 0.14), 0 1px 0 rgba(212, 160, 74, 0.20)`
      : `0 6px 20px rgba(0, 0, 0, 0.06), 0 1px 0 ${itemAccent}22`;

  return (
    <div
      style={{
        position: "absolute",
        top: ROW_TOP,
        left: leftPx,
        width: widthPx,
        height: ROW_HEIGHT,
        background: cardBg,
        border: `2px solid ${itemAccent}`,
        borderRadius: 16,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 14,
        boxShadow: cardShadow,
        opacity,
        transform: `translateX(${translateX}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Rank numeral — top area of the column card */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          // ADR-001 §5.1: rank numeral 56px (vs 64px in 9x16 — narrower columns).
          fontSize: 56,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          color: itemAccent,
        }}
      >
        {item.rank}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          // ADR-001 §5.1: body 32px for 16:9.
          fontSize: 32,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: getBodyTextColor(paletteMode, inkColor, 32),
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {item.label}
      </div>

      {/* Optional sub-label */}
      {item.sub && (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: 20,
            letterSpacing: "0.06em",
            color: mutedColor,
            opacity: 0.85,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {item.sub}
        </div>
      )}
    </div>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────
export const RankedTierList16x9: React.FC<RankedTierList16x9Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  sectionLabel,
  items,
  revealDirection,
  revealFrames,
  holdFrames,
  firstItemEnterSeconds,
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
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

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

  // ── Horizontal layout math ─────────────────────────────────────────
  const N = items.length;
  const totalRowW = CANVAS_W - ROW_LEFT - ROW_RIGHT;
  const itemW = Math.floor((totalRowW - (N - 1) * ROW_GAP) / N);

  const baseStartFrame = Math.round(firstItemEnterSeconds * fps);

  // ── Reveal index mapping ───────────────────────────────────────────
  // "left-to-right": column 0 gets revealIndex 0 (enters first).
  // "right-to-left": column N-1 gets revealIndex 0 (enters first).
  function revealIndexFor(colIdx: number): number {
    return revealDirection === "left-to-right" ? colIdx : N - 1 - colIdx;
  }

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Brand breadcrumb (16:9 variant) */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section label eyebrow chip */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* Title + subtitle */}
      <TitleBlock
        title={title}
        subtitle={subtitle}
        inkColor={resolvedInk}
        accentColor={resolvedAccent}
        mutedColor={resolvedMuted}
        paletteMode={palette as PaletteMode}
      />

      {/* Horizontal row of tier columns */}
      {items.map((item, i) => {
        const leftPx = ROW_LEFT + i * (itemW + ROW_GAP);
        const revIdx = revealIndexFor(i);
        return (
          <TierColumn
            key={`tier16-${i}`}
            item={item}
            revealIndex={revIdx}
            leftPx={leftPx}
            widthPx={itemW}
            baseStartFrame={baseStartFrame}
            revealFrames={revealFrames}
            holdFrames={holdFrames}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            mutedColor={resolvedMuted}
            paletteMode={palette as PaletteMode}
          />
        );
      })}

      {/* Bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark as WatermarkStyle}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Caption strip */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {CANVAS_H > 0 ? null : null}
    </AbsoluteFill>
  );
};

export default RankedTierList16x9;
