/**
 * ThreeStageRisingBars16x9 — Nate B Jones's "three-stage rising bar towers"
 * (pattern N2 from the Wave-7 Batch 3 Extension scoring of his 16:9 catalog).
 *
 * Reference anchors (Nate B Jones long-form):
 *   - ogTLWGBc3cE @ t≈435s — "Opus 4.7 / OpenAI 5.5 prompting obsolete" beat.
 *   - zP6TnEiueEc @ t≈105s — "Google I/O stitching MCP/A2A/AG-UI" beat.
 *   (citation: references/creators/natebjones/ANALYSIS.md §2 N2)
 *
 * THE PATTERN
 * -----------
 * Three uppercase-labeled bar towers reveal LEFT-TO-RIGHT on the brand's dark
 * slate slab. Each tower rises from its baseline up to a target height with a
 * soft ease-out while an accent-colored border draws around it. The narrative
 * beat is Then / Now / Next (or equivalent triplet) — crucially, the heights
 * are NARRATIVE (small / medium / large), NOT measured data quantities. This
 * is what distinguishes it from `BigNumberHorizontalBars16x9` (data bars) and
 * `BenchmarkBars9x16` (data-quantitative): the "Stripe Press chronology bars"
 * framing — categorical, not plotted.
 *
 * Once all three towers are placed, a single caption pill — exactly ONE
 * keyword tinted TNF orange — fades in below the towers.
 *
 * Composition order (back-to-front):
 *   DarkSlateChassis16x9 (slate + handle chip + caption pill slot)
 *     ↳ tower 1 (rise @ 0–18f,  border-draw @ 8–22f)
 *     ↳ tower 2 (rise @ 14–32f, border-draw @ 22–36f)
 *     ↳ tower 3 (rise @ 28–46f, border-draw @ 36–50f)
 *   CaptionPillWithKeyword (startFrame=56, fade-in over 8f)
 *
 * Like its N1 sibling this composition is intentionally pure-content: no audio,
 * no whisper captions, no chrome beyond the chassis handle chip. It is meant to
 * be slotted INTO a longer 16:9 piece as one beat — exactly how Nate uses it.
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

/** Narrative height level — small/medium/large keywords OR a raw 0–1 fraction
 *  of the available tower track (for fine-tuning), never a data quantity. */
const heightLevelSchema = z.union([
  z.enum(["small", "medium", "large"]),
  z.number().min(0).max(1),
]);

const barSchema = z.object({
  /** Uppercase tower label, e.g. "THEN" / "NOW" / "NEXT". */
  label: z.string(),
  /** Narrative height — 'small' | 'medium' | 'large', or a 0–1 fraction. */
  heightLevel: heightLevelSchema,
  /** Optional accent for the tower fill + drawn border. Falls through the
   *  default accent palette (by index) when omitted. */
  accentColor: z.string().optional(),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const threeStageRisingBarsSchema = z.object({
  bars: z
    .array(barSchema)
    .length(3)
    .default([
      { label: "THEN", heightLevel: "small" },
      { label: "NOW", heightLevel: "medium" },
      { label: "NEXT", heightLevel: "large" },
    ]),
  caption: captionSchema.default({
    text: "Each wave compounds the last",
    keyword: "compounds",
  }),
  handle: z.string().default("@armandointeligencia"),
  /** Total composition length in frames. Default 150 = 5.0s @ 30fps. */
  durationFrames: z.number().default(150),
  transitionVerb: z
    .string()
    .default(
      "Reveal three uppercase-labeled bar towers left-to-right, each rising from baseline to its target height with a soft ease-out while its accent border draws around it; once all three are placed, the caption pill fades in below with one orange keyword.",
    ),
});

export type ThreeStageRisingBars16x9Props = z.infer<
  typeof threeStageRisingBarsSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout + timing constants
// ─────────────────────────────────────────────────────────────────────────────

/** Total vertical track a tower can occupy (px). Tower baseline sits at the
 *  bottom of this track; the tallest narrative level fills ~96% of it. */
const TOWER_TRACK_HEIGHT_PX = 520;
const TOWER_WIDTH_PX = 220;
const TOWER_GAP_PX = 80;
const TOWER_BORDER_WIDTH_PX = 3;
const TOWER_BORDER_RADIUS_PX = 10;
const LABEL_FONT_SIZE_PX = 30;
const LABEL_MARGIN_TOP_PX = 24;

/** Narrative height levels → fraction of the available tower track. These are
 *  intentionally coarse, evenly-spaced "small/medium/large" steps so the bars
 *  read as a chronology, not a measured chart. */
const HEIGHT_LEVEL_FRACTION: Record<"small" | "medium" | "large", number> = {
  small: 0.4,
  medium: 0.68,
  large: 0.96,
};

/** Per-tower accent palette — used when bar.accentColor isn't supplied. Mirrors
 *  the Nate accent set documented in CaptionPillWithKeyword (TNF orange + a
 *  warm gold + a cyan). Index modulo 3 in tower order. */
const DEFAULT_ACCENTS = [
  BRAND.colors.keywordOrange, // "TNF orange"
  "#D4AF37", // warm gold
  "#5BC0E8", // cyan
] as const;

/** Per-tower timing windows (frames). Left-to-right stagger:
 *  tower 1: rise 0→18,  border 8→22
 *  tower 2: rise 14→32, border 22→36
 *  tower 3: rise 28→46, border 36→50
 *  caption pill: fades in starting frame 56 (8-frame envelope inside the pill).
 */
const TOWER_TIMINGS: ReadonlyArray<{
  riseStart: number;
  riseEnd: number;
  borderStart: number;
  borderEnd: number;
}> = [
  { riseStart: 0, riseEnd: 18, borderStart: 8, borderEnd: 22 },
  { riseStart: 14, riseEnd: 32, borderStart: 22, borderEnd: 36 },
  { riseStart: 28, riseEnd: 46, borderStart: 36, borderEnd: 50 },
];

const CAPTION_PILL_START_FRAME = 56;

/** Resolve a narrative height level to a 0–1 fraction of the tower track. */
function resolveHeightFraction(
  level: "small" | "medium" | "large" | number,
): number {
  if (typeof level === "number") {
    return Math.min(Math.max(level, 0), 1);
  }
  return HEIGHT_LEVEL_FRACTION[level];
}

// ─────────────────────────────────────────────────────────────────────────────
// Single tower
// ─────────────────────────────────────────────────────────────────────────────

interface TowerProps {
  label: string;
  heightFraction: number;
  accentColor: string;
  riseStart: number;
  riseEnd: number;
  borderStart: number;
  borderEnd: number;
}

const BarTower: React.FC<TowerProps> = ({
  label,
  heightFraction,
  accentColor,
  riseStart,
  riseEnd,
  borderStart,
  borderEnd,
}) => {
  const frame = useCurrentFrame();

  // Rise: the fill grows from baseline (0px) up to its target height with a
  // soft ease-out, so it decelerates into place rather than snapping.
  const targetHeight = TOWER_TRACK_HEIGHT_PX * heightFraction;
  const currentHeight = interpolate(
    frame,
    [riseStart, riseEnd],
    [0, targetHeight],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  // Border draw: opacity 0→1 over the border window. The border "draws around"
  // the tower by fading the accent stroke in just after the rise begins, held
  // at full strength forever after `borderEnd`.
  const borderOpacity = interpolate(
    frame,
    [borderStart, borderEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // Label fades in alongside the tail of the rise so it reads as "settling" on
  // top of the placed tower.
  const labelOpacity = interpolate(
    frame,
    [riseEnd - 6, riseEnd + 4],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {/* The tower track: a fixed-height column the fill grows within, anchored
          to the baseline (flex-end). */}
      <div
        style={{
          width: TOWER_WIDTH_PX,
          height: TOWER_TRACK_HEIGHT_PX,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: currentHeight,
            // Narrative fill: a translucent accent body. The accent border is
            // drawn separately as a ring overlay so its opacity can ramp
            // independently of the body.
            background: `${accentColor}26`, // ~15% alpha (hex alpha suffix)
            borderRadius: TOWER_BORDER_RADIUS_PX,
            boxSizing: "border-box",
          }}
        >
          {/* Accent border-draw overlay: an absolutely-tracked ring whose
              opacity ramps in over the border window, so the border reads as
              "drawing around" the tower after the rise begins. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `${TOWER_BORDER_WIDTH_PX}px solid ${accentColor}`,
              borderRadius: TOWER_BORDER_RADIUS_PX,
              opacity: borderOpacity,
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Uppercase tracked label under the tower. */}
      <div
        style={{
          opacity: labelOpacity,
          marginTop: LABEL_MARGIN_TOP_PX,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: LABEL_FONT_SIZE_PX,
          color: "#FFFFFF",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const ThreeStageRisingBars16x9: React.FC<
  ThreeStageRisingBars16x9Props
> = ({ bars, caption, handle }) => {
  // Caption pill is mounted inside the chassis's caption-pill slot (which
  // self-anchors above the handle chip). CaptionPillWithKeyword reads
  // useCurrentFrame() itself, so we only hand it a startFrame.
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
    <DarkSlateChassis16x9 handleChip={{ text: handle }} captionPill={captionPill}>
      {/* Centered row of 3 towers, baseline-aligned, vertically centered with
          a slight upward bias so the caption pill has breathing room below. */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: TOWER_GAP_PX,
          paddingBottom: 200,
        }}
      >
        {bars.map((bar, i) => {
          const timing = TOWER_TIMINGS[i];
          const accent =
            bar.accentColor ?? DEFAULT_ACCENTS[i % DEFAULT_ACCENTS.length];
          return (
            <BarTower
              key={`${bar.label}-${i}`}
              label={bar.label}
              heightFraction={resolveHeightFraction(bar.heightLevel)}
              accentColor={accent}
              riseStart={timing.riseStart}
              riseEnd={timing.riseEnd}
              borderStart={timing.borderStart}
              borderEnd={timing.borderEnd}
            />
          );
        })}
      </AbsoluteFill>
    </DarkSlateChassis16x9>
  );
};

export default ThreeStageRisingBars16x9;
