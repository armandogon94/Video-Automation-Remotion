/**
 * TestimonialCard16x9 — horizontal (1920×1080) landscape pull-quote
 * testimonial composition.
 *
 * 16:9 sibling of TestimonialCard9x16. Re-laid out for the wide canvas as
 * a side-by-side landscape quote card:
 *
 *   ┌─────────────────────────────────────────────────────────────────────┐
 *   │  BRAND BREADCRUMB                                          WATERMARK │
 *   │                                                                      │
 *   │  ┌──────────────────────────────────────┐  ┌──────────────────────┐ │
 *   │  │                                      │  │  SECTION LABEL CHIP  │ │
 *   │  │  " This is the kind of testimonial   │  │                      │ │
 *   │  │    that lands — short, attributed,   │  │  ATTRIBUTION NAME    │ │
 *   │  │    and rendered in italic serif.     │  │  Title · Brand       │ │
 *   │  │                                      │  │  (Brand logo)        │ │
 *   │  └──────────────────────────────────────┘  └──────────────────────┘ │
 *   │                                                                      │
 *   │                                                 (optional captions) │
 *   └─────────────────────────────────────────────────────────────────────┘
 *
 * LEFT panel: Playfair Italic pull-quote (the cream card with left-edge
 *   accent glow, same molecule as 9x16).
 * RIGHT panel: author attribution block with section-label chip, name
 *   in large sans, title+brand in mono tracked, optional logo — laid out
 *   as a separate styled div.
 *
 * This composition consumes the same `<TestimonialCard>` molecule as the
 * 9x16 source. The molecule's `width` prop is set to fill the LEFT half
 * of the canvas (~860px) while the RIGHT half carries the attribution
 * separately — this is the landscape idiom: quote body left, speaker
 * context right.
 *
 * ADR-001 §5.1 font defaults:
 *   - Quote body inside the molecule: 46px (molecule default, unchanged —
 *     fits the wider card naturally).
 *   - Attribution name: 56px (vs inline 24px in the molecule — lifted to
 *     hero size on the right panel).
 *   - Attribution title/brand: 28px mono tracked.
 *   - Section label: 28px.
 *   - captionFontSize default: 36px.
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
import { TestimonialCard } from "../components/InfoCards";
import { getToolAccentForSurface, resolveColors, getPalette, FONT_STACKS } from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
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

const testimonialAttributionSchema_local = z.object({
  name: z.string(),
  title: z.string().optional(),
  brand: z.string().optional(),
});

export const testimonialCard16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** The pull-quote body (Playfair Display Italic in the molecule). */
  quote: z.string().default("This is the kind of testimonial that lands."),
  attribution: testimonialAttributionSchema_local.default(
    testimonialAttributionSchema_local.parse({ name: "" }),
  ),
  /** Optional brand logo path (relative to /public or absolute URL). */
  brandLogo: z.string().optional(),

  /** Eyebrow chip above the attribution block. */
  sectionLabel: z.string().default("TESTIMONIO"),

  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  watermark: watermarkSchema_local.nullable().default(null),
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),

  /** ADR-001 §5.1: 16:9 default "dark" (covers both surfaces via prop). */
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),

  /** Entry delay for the card molecule in seconds. Default 0.5s. */
  enterSeconds: z.number().min(0).max(10).default(0.5),

  /** ADR-001 §5.1: 16:9 default 36px caption font. */
  captionFontSize: z.number().min(20).max(120).default(36),
  showCaptions: z.boolean().default(false),
});
export type TestimonialCard16x9Props = z.infer<typeof testimonialCard16x9Schema>;

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Two-column split: left quote panel + right attribution panel.
// Both panels are vertically centred in the content zone
// (top 100px reserved for breadcrumb, bottom 100px for captions/watermark).
const CONTENT_TOP = 100;
const CONTENT_BOTTOM = 980;
const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP;

const COLUMN_GAP = 80;
const QUOTE_PANEL_W = 920; // slightly wider than half: quote text benefits from room.
const QUOTE_PANEL_LEFT = 60;
const ATTR_PANEL_LEFT = QUOTE_PANEL_LEFT + QUOTE_PANEL_W + COLUMN_GAP;
const ATTR_PANEL_W = CANVAS_W - ATTR_PANEL_LEFT - 60;

// ─── Right attribution panel ─────────────────────────────────────────────
const AttributionPanel: React.FC<{
  sectionLabel: string;
  attribution: { name: string; title?: string; brand?: string };
  brandLogo?: string;
  accentColor: string;
  inkColor: string;
  mutedColor: string;
  enterSeconds: number;
}> = ({
  sectionLabel,
  attribution,
  brandLogo,
  accentColor,
  inkColor,
  mutedColor,
  enterSeconds,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entryFrame = Math.round(enterSeconds * fps);

  // Spring-in after the same delay as the quote card molecule.
  const enter = spring({
    frame: frame - entryFrame,
    fps,
    config: { damping: 22, stiffness: 130 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(enter, [0, 1], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleSegments: string[] = [];
  if (attribution.title) titleSegments.push(attribution.title);
  if (attribution.brand) titleSegments.push(attribution.brand);
  const titleLine = titleSegments.join("  ·  ");

  return (
    <div
      style={{
        position: "absolute",
        top: CONTENT_TOP,
        left: ATTR_PANEL_LEFT,
        width: ATTR_PANEL_W,
        height: CONTENT_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Section label eyebrow chip */}
      {sectionLabel && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            // ADR-001 §5.1: label 28px for 16:9.
            fontSize: 28,
            color: accentColor,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {sectionLabel}
        </div>
      )}

      {/* Horizontal accent rule */}
      <div
        style={{
          width: 64,
          height: 3,
          background: accentColor,
          borderRadius: 2,
        }}
      />

      {/* Attribution name — hero size for the right panel */}
      {attribution.name && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            // ADR-001 §5.1: attribution name 56px in 16:9 right panel.
            fontSize: 56,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: inkColor,
          }}
        >
          {attribution.name}
        </div>
      )}

      {/* Title · Brand in mono tracked */}
      {titleLine && (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            // ADR-001 §5.1: body 28px for 16:9.
            fontSize: 28,
            letterSpacing: "0.08em",
            color: mutedColor,
            lineHeight: 1.3,
          }}
        >
          {titleLine}
        </div>
      )}

      {/* Optional brand logo */}
      {brandLogo && (
        <img
          src={brandLogo}
          alt=""
          style={{ height: 40, width: "auto", opacity: 0.85 }}
        />
      )}
    </div>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────
export const TestimonialCard16x9: React.FC<TestimonialCard16x9Props> = ({
  audioUrl,
  wordTimings,
  quote,
  attribution,
  brandLogo,
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
  enterSeconds,
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
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Card colors: lifted slightly vs base palette (same logic as 9x16).
  const cardPaperColor = surfaceMode === "dark" ? "#10172A" : "#FFFFFF";
  const cardInkColor = surfaceMode === "dark" ? "#F2E9D8" : resolvedInk;

  const entryFrame = Math.round(enterSeconds * fps);

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

      {/* LEFT panel: TestimonialCard molecule — vertically centred.
          The molecule animates its own entry spring from `startFrame`.
          We position the outer wrapper so it's vertically centred in the
          content zone (CONTENT_TOP..CONTENT_BOTTOM). */}
      <div
        style={{
          position: "absolute",
          top: CONTENT_TOP,
          left: QUOTE_PANEL_LEFT,
          width: QUOTE_PANEL_W,
          height: CONTENT_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <TestimonialCard
          quote={quote}
          attribution={attribution}
          brandLogo={brandLogo}
          accentColor={resolvedAccent}
          width={QUOTE_PANEL_W}
          paperColor={cardPaperColor}
          inkColor={cardInkColor}
          startFrame={entryFrame}
        />
      </div>

      {/* RIGHT panel: attribution block slides in slightly after the card */}
      <AttributionPanel
        sectionLabel={sectionLabel}
        attribution={attribution}
        brandLogo={undefined}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
        mutedColor={resolvedMuted}
        enterSeconds={enterSeconds}
      />

      {/* Bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark as WatermarkStyle}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Caption strip — default OFF (quote text is the text layer) */}
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

      {/* Silence CANVAS_H / CANVAS_W references. */}
      {CANVAS_H > 0 && CANVAS_W > 0 ? null : null}
    </AbsoluteFill>
  );
};

export default TestimonialCard16x9;
