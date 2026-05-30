/**
 * ThreeRowLabeledCardStack16x9 — Nate B Jones's "labeled three-row card stack"
 * (pattern N1 from the Wave-7 Batch 3 Extension scoring of his 16:9 catalog).
 *
 * Reference anchors (Nate B Jones long-form):
 *   - n0nC1kmztSk @ t≈300s — TRACE / WORKFLOW / PRODUCT × Tool Calls / Task
 *     Outcome / User Value triplet, used as a "three-axis evaluation rubric"
 *     beat.
 *   - NRBQmwlILjk @ t≈300s — same molecular layout reused with a different
 *     conceptual triplet (label-left + title-right card rows on dark slate).
 *
 * The visual essence of the pattern is THREE stacked horizontal cards, each
 * carrying a left "label tab" (uppercase, tracked, accent-colored), a thin
 * vertical rule that ramps in shortly after the card body fades in, and a
 * "title" on the right of the rule (white, ~36–48px Inter). All three rows sit
 * on the brand's dark slate chassis, and a single caption pill — exactly ONE
 * keyword tinted TNF orange — fades in below the stack after row 3 lands.
 *
 * Composition order (back-to-front):
 *   DarkSlateChassis16x9 (slate + handle chip + caption pill slot)
 *     ↳ row 1 (fade @ 0–10f, rule @ 10–14f)
 *     ↳ row 2 (fade @ 14–24f, rule @ 24–28f)
 *     ↳ row 3 (fade @ 28–38f, rule @ 38–42f)
 *   CaptionPillWithKeyword (startFrame=50, fade-in over 8f)
 *
 * This composition is intentionally pure-content: no audio, no captions, no
 * watermark/breadcrumb chrome other than the chassis-provided handle chip. It
 * is meant to be slotted INTO a longer 16:9 piece as one beat — exactly how
 * Nate uses it.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const rowSchema = z.object({
  /** Left "label tab" text (uppercase, tracked). e.g. "TRACE". */
  label: z.string(),
  /** Right-side title text. e.g. "Tool Calls". */
  title: z.string(),
  /** Optional accent color for the label tab + vertical rule. Defaults
   *  through the row palette below if not supplied. */
  accentColor: z.string().optional(),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const threeRowLabeledCardStackSchema = z.object({
  rows: z.array(rowSchema).length(3),
  caption: captionSchema.optional(),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(150),
  transitionVerb: z
    .string()
    .default(
      "Stack three labeled cards top-to-bottom, each fading in and ramping a thin vertical rule between its left label tab and its right title; once all three rows are placed, the caption pill below fades in with one orange keyword.",
    ),
});

export type ThreeRowLabeledCardStack16x9Props = z.infer<
  typeof threeRowLabeledCardStackSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const CARD_MAX_WIDTH_PX = 1200;
const CARD_PADDING_PX = 24;
const CARD_BORDER_RADIUS_PX = 12;
const CARD_BG_RGBA = "rgba(20,30,55,0.6)";
const ROW_GAP_PX = 24;
const LABEL_TAB_WIDTH_PX = 200;
const RULE_WIDTH_PX = 2;
const RULE_MARGIN_PX = 24;
const TITLE_FONT_SIZE_PX = 44; // mid-point of spec range 36–48

/** Per-row accent palette — used when row.accentColor isn't supplied. Mirrors
 *  the Nate accent set documented in CaptionPillWithKeyword (TNF orange + a
 *  warm gold + a cyan). Index modulo 3 in row order. */
const DEFAULT_ACCENTS = [
  BRAND.colors.keywordOrange, // "TNF orange"
  "#D4AF37",
  "#5BC0E8",
] as const;

/** Per-row timing windows (frames). Mirrors the brief exactly:
 *  row 1: fade 0→10, rule 10→14
 *  row 2: fade 14→24, rule 24→28
 *  row 3: fade 28→38, rule 38→42
 *  caption pill: fades in starting frame 50 (8-frame envelope inside the pill).
 */
const ROW_TIMINGS: ReadonlyArray<{
  fadeStart: number;
  fadeEnd: number;
  ruleStart: number;
  ruleEnd: number;
}> = [
  { fadeStart: 0, fadeEnd: 10, ruleStart: 10, ruleEnd: 14 },
  { fadeStart: 14, fadeEnd: 24, ruleStart: 24, ruleEnd: 28 },
  { fadeStart: 28, fadeEnd: 38, ruleStart: 38, ruleEnd: 42 },
];

const CAPTION_PILL_START_FRAME = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Single row
// ─────────────────────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  title: string;
  accentColor: string;
  fadeStart: number;
  fadeEnd: number;
  ruleStart: number;
  ruleEnd: number;
}

const LabeledCardRow: React.FC<RowProps> = ({
  label,
  title,
  accentColor,
  fadeStart,
  fadeEnd,
  ruleStart,
  ruleEnd,
}) => {
  const frame = useCurrentFrame();

  // Card fade-in: opacity 0→1 with a subtle 8px upward translate that settles
  // by `fadeEnd`. Soft-out easing makes the lift feel like a place-down rather
  // than a slide.
  const opacity = interpolate(frame, [fadeStart, fadeEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const translateY = interpolate(frame, [fadeStart, fadeEnd], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // Vertical rule: scaleY 0→1, origin top — looks like the rule "draws down"
  // from the top of the card. Held at 1 forever after `ruleEnd`.
  const ruleScaleY = interpolate(frame, [ruleStart, ruleEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: CARD_BG_RGBA,
        borderRadius: CARD_BORDER_RADIUS_PX,
        padding: CARD_PADDING_PX,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        width: "100%",
        // The card is its own layout context for the rule's full-height span.
        position: "relative",
      }}
    >
      {/* Left label tab — horizontal text, uppercase + tracked, accent color. */}
      <div
        style={{
          width: LABEL_TAB_WIDTH_PX,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 28,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>

      {/* Thin vertical rule between label tab and title — ramps in second. */}
      <div
        style={{
          width: RULE_WIDTH_PX,
          background: accentColor,
          marginLeft: RULE_MARGIN_PX,
          marginRight: RULE_MARGIN_PX,
          alignSelf: "stretch",
          transform: `scaleY(${ruleScaleY})`,
          transformOrigin: "top center",
        }}
      />

      {/* Right title — Inter 44px, white, semi-bold. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: TITLE_FONT_SIZE_PX,
          color: "#FFFFFF",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const ThreeRowLabeledCardStack16x9: React.FC<
  ThreeRowLabeledCardStack16x9Props
> = ({ rows, caption, handle }) => {
  // Caption pill is mounted inside the chassis's caption-pill slot (which
  // self-anchors above the handle chip). We compute its startFrame relative
  // to the composition; CaptionPillWithKeyword reads useCurrentFrame() itself.
  const captionPill = caption ? (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      anchor="below-content"
      startFrame={CAPTION_PILL_START_FRAME}
      fontSize={36}
    />
  ) : null;

  return (
    <DarkSlateChassis16x9
      handleChip={{ text: handle }}
      captionPill={captionPill}
    >
      {/* Centered column of 3 cards, max-width 1200px, vertically centered. */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: CARD_MAX_WIDTH_PX,
            display: "flex",
            flexDirection: "column",
            gap: ROW_GAP_PX,
          }}
        >
          {rows.map((row, i) => {
            const timing = ROW_TIMINGS[i];
            const accent =
              row.accentColor ?? DEFAULT_ACCENTS[i % DEFAULT_ACCENTS.length];
            return (
              <LabeledCardRow
                key={`${row.label}-${i}`}
                label={row.label}
                title={row.title}
                accentColor={accent}
                fadeStart={timing.fadeStart}
                fadeEnd={timing.fadeEnd}
                ruleStart={timing.ruleStart}
                ruleEnd={timing.ruleEnd}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </DarkSlateChassis16x9>
  );
};

export default ThreeRowLabeledCardStack16x9;
