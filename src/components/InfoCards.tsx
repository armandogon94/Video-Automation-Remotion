/**
 * InfoCards — Wave-4 cross-creator HIGH-confidence educational primitives.
 *
 * Three components carry ~70% of the educational payload across the corpus:
 *
 *   1. <SpecRow>           — DIYSmartCode K1: outlined-pill label + free-form body row.
 *                            Reference frames:
 *                              references/creators/diysmartcode/0HIf4AlajNY/frames/frame-02.jpg
 *                                (RUNS / MODE / SCORE rows)
 *                              references/creators/diysmartcode/rfzA7HWcpCQ/frames/frame-02.jpg
 *                                (TOOLS row)
 *   2. <KeyValueRowsCard>  — DIYSmartCode K2: stacked SpecRows in one card container,
 *                            with optional per-step ROTATING accent (Wave-4 V3 N24).
 *   3. <TestimonialCard>   — Carlos Cuamatzin MED: cream pull-quote with left-edge
 *                            green/accent glow + Playfair Display italic body.
 *                            Reference frame:
 *                              references/creators/carloscuamatzin/DYnCz7upOOM/frames/frame-02.jpg
 *                                (Farhan Thawar testimonial)
 *
 * Motion: EDITORIAL_SPRING for primary entry + accelerating per-row stagger via
 * staggerEntry from src/animation, with blurInFocus available on TestimonialCard.
 *
 * Pure React FCs. Each component reads its OWN frame via useCurrentFrame() so
 * the caller can mount them anywhere (top-level AbsoluteFill, inside a Sequence
 * — relative-time inside <Sequence> is handled by Remotion automatically).
 */
import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS } from "../brand";
import { staggerEntry } from "../animation";
import { blurInFocus } from "../animation/blurInFocus";
import { EDITORIAL_SPRING } from "../compositions/scenes";

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default 5-color rotation palette for KeyValueRowsCard (Wave-4 V3 N24).
 * coral / cyan / mint / indigo / red — each pair has enough hue distance to
 * read as "different category" at thumbnail size.
 */
const DEFAULT_ROTATION_PALETTE = [
  "#E89B7A", // coral
  "#5AB8C9", // cyan
  "#7DC9A0", // mint
  "#6B6FD3", // indigo
  "#B33A2A", // warm-red
] as const;

const CARD_RADIUS_PX = 16;
const PILL_RADIUS_PX = 999;
const ROW_RADIUS_PX = 14;

// ─────────────────────────────────────────────────────────────────────────────
// <SpecRow>
// ─────────────────────────────────────────────────────────────────────────────

export interface SpecRowProps {
  /** Short mono uppercase label (e.g. "TOOLS", "MODEL", "RUNS"). */
  label: string;
  /** Free-form body text (1-3 lines). */
  body: string;
  /** Accent color used for the pill outline + label. */
  accentColor?: string;
  /** Body text color (default warm-cream on dark, ink on cream — caller decides). */
  bodyColor?: string;
  /** Default 100% (fills container). */
  width?: number | string;
  /** Optional stagger entry index (used by KeyValueRowsCard to delay row N). */
  staggerIndex?: number;
  /** Frame at which entry begins (when used inside a Sequence, this is 0). */
  startFrame?: number;
  /** Optional left-pill width in px (default 180 — kept fixed so rows align). */
  labelPillWidth?: number;
  /** Type sizes; defaults { label: 22, body: 36 }. */
  fontSize?: { label: number; body: number };
}

const DEFAULT_LABEL_FONT = 22;
const DEFAULT_BODY_FONT = 36;
const DEFAULT_LABEL_PILL_WIDTH = 180;

/**
 * Outlined-pill label + free-form body row. Designed to live inside a
 * KeyValueRowsCard but standalone-safe.
 *
 *   ┌─────────────┐
 *   │   TOOLS     │   ast-grep · ripgrep · jq
 *   └─────────────┘
 *
 * Entry: 100ms stagger after `(startFrame + staggerIndex * 3)` frames; fade-in
 * + 8px slide-up via EDITORIAL_SPRING.
 */
export const SpecRow: React.FC<SpecRowProps> = ({
  label,
  body,
  accentColor = "#B33A2A",
  bodyColor = "#1A1A1A",
  width = "100%",
  staggerIndex = 0,
  startFrame = 0,
  labelPillWidth = DEFAULT_LABEL_PILL_WIDTH,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelSize = fontSize?.label ?? DEFAULT_LABEL_FONT;
  const bodySize = fontSize?.body ?? DEFAULT_BODY_FONT;

  // Per-row entry frame (100ms ≈ 3 frames @ 30fps stagger).
  const entryFrame = startFrame + staggerIndex * 3;
  const localFrame = frame - entryFrame;

  // Editorial-spring scaled to a 0..1 opacity + slide-up offset.
  const enter = spring({
    frame: localFrame,
    fps,
    config: EDITORIAL_SPRING,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(enter, [0, 1], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        width,
        padding: "14px 18px",
        borderRadius: ROW_RADIUS_PX,
        border: `1.5px solid ${accentColor}`,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Outlined pill label (left) */}
      <div
        style={{
          flex: `0 0 ${labelPillWidth}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 14px",
          borderRadius: PILL_RADIUS_PX,
          border: `1.5px solid ${accentColor}`,
          fontFamily: FONT_STACKS.mono,
          fontSize: labelSize,
          fontWeight: 600,
          color: accentColor,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
        }}
      >
        {label}
      </div>

      {/* Body text (right) */}
      <div
        style={{
          flex: "1 1 auto",
          fontFamily: FONT_STACKS.sans,
          fontSize: bodySize,
          fontWeight: 500,
          color: bodyColor,
          lineHeight: 1.25,
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {body}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// <KeyValueRowsCard>
// ─────────────────────────────────────────────────────────────────────────────

export interface KeyValueRowsCardRow {
  label: string;
  body: string;
  accentColor?: string;
}

export interface KeyValueRowsCardProps {
  rows: KeyValueRowsCardRow[];
  /** Default accent applied to rows without an override. */
  defaultAccent?: string;
  /** Default body color. */
  bodyColor?: string;
  /** Card container background (default transparent — sits on parent bg). */
  background?: string;
  /** Outer border color. Default thin warm-red on cream. */
  borderColor?: string;
  /** Outer card width (default 920). */
  width?: number;
  /**
   * Wave-4 DIYSmart V3 N24: per-step ROTATING accent. If true, cycles through
   * a 5-color palette by row index.
   */
  rotateAccent?: boolean;
  /** Rotation palette (default coral/cyan/mint/indigo/red). */
  rotationPalette?: string[];
  startFrame?: number;
  /** Per-row stagger gap in frames (default 4 — accelerating cascade). */
  staggerFrames?: number;
  /** Inner padding (default 32). */
  padding?: number;
  /** Vertical gap between rows (default 18). */
  rowGap?: number;
  /** Optional fixed pill width forwarded to each SpecRow (default 180). */
  labelPillWidth?: number;
  /** Optional font sizes forwarded to each SpecRow. */
  fontSize?: { label: number; body: number };
}

/**
 * Stacked SpecRows in a single card container.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │   ┌──────┐                                                │
 *   │   │ TOOLS│   ast-grep · ripgrep · jq                      │
 *   │   └──────┘                                                │
 *   │   ┌──────┐                                                │
 *   │   │ MODEL│   Claude Sonnet 4.5                            │
 *   │   └──────┘                                                │
 *   │   ┌──────┐                                                │
 *   │   │ RUNS │   3 / 3 passing                                │
 *   │   └──────┘                                                │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Rows cascade in via `staggerEntry` (accelerating decay). If `rotateAccent`,
 * cycles through `rotationPalette` so each row reads as its own category.
 */
export const KeyValueRowsCard: React.FC<KeyValueRowsCardProps> = ({
  rows,
  defaultAccent = "#B33A2A",
  bodyColor = "#1A1A1A",
  background = "transparent",
  borderColor,
  width = 920,
  rotateAccent = false,
  rotationPalette,
  startFrame = 0,
  staggerFrames = 4,
  padding = 32,
  rowGap = 18,
  labelPillWidth = DEFAULT_LABEL_PILL_WIDTH,
  fontSize,
}) => {
  const palette =
    rotationPalette && rotationPalette.length > 0
      ? rotationPalette
      : [...DEFAULT_ROTATION_PALETTE];

  const resolvedBorderColor = borderColor ?? defaultAccent;

  return (
    <div
      style={{
        width,
        padding,
        borderRadius: CARD_RADIUS_PX,
        background,
        border: `1.5px solid ${resolvedBorderColor}`,
        display: "flex",
        flexDirection: "column",
        gap: rowGap,
        boxSizing: "border-box",
      }}
    >
      {rows.map((row, i) => {
        const accent = row.accentColor
          ?? (rotateAccent ? palette[i % palette.length] : defaultAccent);

        // Use the accelerating-cascade scheduler so row N arrives slightly
        // earlier than a linear `i * staggerFrames` would predict.
        const rowEntryFrame = staggerEntry({
          index: i,
          baseStartFrame: startFrame,
          staggerFrames,
          accelerate: true,
        });

        // SpecRow expects an entry frame computed as startFrame + staggerIndex*3,
        // so feed it `staggerIndex=0` and `startFrame=rowEntryFrame` — that way
        // the row's local entry frame is exactly `rowEntryFrame`.
        return (
          <SpecRow
            key={`${row.label}-${i}`}
            label={row.label}
            body={row.body}
            accentColor={accent}
            bodyColor={bodyColor}
            staggerIndex={0}
            startFrame={rowEntryFrame}
            labelPillWidth={labelPillWidth}
            fontSize={fontSize}
          />
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// <TestimonialCard>
// ─────────────────────────────────────────────────────────────────────────────

export interface TestimonialAttribution {
  name: string;
  title?: string;
  brand?: string;
}

export interface TestimonialCardProps {
  /** The body of the testimonial (will render in serif italic). */
  quote: string;
  attribution: TestimonialAttribution;
  /** Optional brand logo path (relative to /public). */
  brandLogo?: string;
  /** Accent color — green/coral/gold; matches subject brand. */
  accentColor?: string;
  /** Default 880. */
  width?: number;
  /** Paper color (default cream #FAF7F2). */
  paperColor?: string;
  inkColor?: string;
  /** Show large opening quotation mark ornament (default true). */
  showQuoteMark?: boolean;
  startFrame?: number;
}

/**
 * Cream pull-quote card with left-edge accent glow.
 *
 *   ┃ ❝                                                          ┃
 *   ┃                                                            ┃
 *   ┃   This is the kind of testimonial that lands —             ┃
 *   ┃   short, attributed, and rendered in italic serif.         ┃
 *   ┃                                                            ┃
 *   ┃   ───────────────                                          ┃
 *   ┃   FARHAN THAWAR · VP ENGINEERING · SHOPIFY                  ┃
 *   ┃                                                            ┃
 *   (left edge = 4px accentColor glow)
 *
 * Entry: 12px slide-up + fade, with blurInFocus available for the body.
 */
export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  attribution,
  brandLogo,
  accentColor = "#7DC9A0", // signature green for testimonial mode
  width = 880,
  paperColor = "#FAF7F2",
  inkColor = "#1A1A1A",
  showQuoteMark = true,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  // Editorial spring entry (calm settle, almost zero overshoot).
  const enter = spring({
    frame: localFrame,
    fps,
    config: EDITORIAL_SPRING,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(enter, [0, 1], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Optional blur-in for the quote body (Carlos's editorial defocus entry).
  const blurValues = blurInFocus({
    frame: localFrame,
    startFrame: 0,
    durationFrames: 10,
    startBlurPx: 8,
    startScale: 0.985,
  });

  // Attribution string with bullet separators.
  const titleSegments: string[] = [];
  if (attribution.title) titleSegments.push(attribution.title);
  if (attribution.brand) titleSegments.push(attribution.brand);
  const titleLine = titleSegments.join("  ·  ");

  return (
    <div
      style={{
        position: "relative",
        width,
        padding: "44px 52px 40px 56px",
        borderRadius: CARD_RADIUS_PX,
        background: paperColor,
        // Left-edge 4px glow in accent color (the card's identifying feature).
        boxShadow: `inset 4px 0 0 ${accentColor}, 0 18px 48px -16px ${accentColor}33`,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Large opening quotation mark ornament (top-left). */}
      {showQuoteMark && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -20,
            left: 32,
            fontFamily: FONT_STACKS.serifItalic,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 120,
            lineHeight: 1,
            color: accentColor,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {"“"}
        </div>
      )}

      {/* Quote body — Playfair Display Italic, ~46px, line-height 1.3 */}
      <div
        style={{
          fontFamily: FONT_STACKS.serifItalic,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 46,
          lineHeight: 1.3,
          color: inkColor,
          filter: blurValues.filter,
          // Don't double-apply translate — we already animate the outer card.
        }}
      >
        {quote}
      </div>

      {/* Divider rule */}
      <div
        style={{
          marginTop: 32,
          marginBottom: 18,
          height: 1,
          width: 96,
          background: `${inkColor}33`,
        }}
      />

      {/* Attribution block */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {brandLogo && (
          <img
            src={brandLogo}
            alt=""
            style={{
              height: 32,
              width: "auto",
              opacity: 0.9,
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 24,
              color: inkColor,
              letterSpacing: "0.01em",
            }}
          >
            {attribution.name}
          </div>
          {titleLine && (
            <div
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 500,
                fontSize: 18,
                color: `${inkColor}AA`,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {titleLine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
