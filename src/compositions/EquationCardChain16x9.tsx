/**
 * EquationCardChain16x9 — Nate B Jones Wave-7 Batch 3 pattern N3.
 *
 * The highest-reuse 16:9 pattern in Nate's Wave-7 Batch 3 corpus (≥4
 * instances): an inline "definition equation" rendered as pill-shaped operand
 * cards joined by typographic `+` separators and one terminal `=` introducing
 * a result card. Example narrative the corpus repeatedly uses:
 *
 *     [Bullseye] + [Boundaries] = [Good Search]
 *
 * It's Nate's way of making a multi-part heuristic feel like a *formula* —
 * each operand reads as a labeled noun chip, the operators are subordinate
 * typographic punctuation, and the result card sits visually parallel to the
 * operands (same chip shape, different accent color) so the eye reads the
 * whole row as "A + B = C" without a heading.
 *
 * STRUCTURAL CONTRACT
 * -------------------
 * 1. **Chassis:** wraps `<DarkSlateChassis16x9>` for the slate background,
 *    handle chip and (optional) caption-pill slot — single source of truth
 *    for the editorial chrome. The chassis renders the slate, watermark
 *    (none here by default), handle chip, and the caption pill at the bottom.
 * 2. **Equation row:** a horizontally-centered flex row containing operand
 *    cards interleaved with `+` separators, terminated by a single `=` glyph
 *    and a result card.
 * 3. **Caption pill:** optional bordered pill below the equation, rendered via
 *    `<CaptionPillWithKeyword>` slotted into the chassis's `captionPill` prop
 *    so it inherits the chassis's centered absolute-bottom placement above the
 *    handle-chip layer. One word inside the caption tints orange.
 *
 * TIMING (Wave-5 contract — fixed @ 30fps unless `durationFrames` overridden)
 * --------------------------------------------------------------------------
 *   Per-operand cadence (8-frame entry + 6-frame `+` separator pop):
 *     operand[i]   lands at OPERAND_BASE_FRAME + i * 14
 *     plus[i]      pops in 8f after operand[i] lands (color = operand[i+1])
 *   After last operand lands + holds 8f:
 *     equals + result card slide in TOGETHER over 8f (color = result accent)
 *   8 frames after result settles:
 *     caption pill fades in over 8f
 *   Final 24f hold before the composition ends.
 *
 * Default 150-frame timeline @ 30fps with 3-card equation (2 operands + result):
 *     0–8f    operand[0] lands
 *     8–14f   plus[0] pops in (matches operand[1] accent)
 *     14–22f  operand[1] lands
 *     22–30f  hold
 *     30–38f  `=` glyph + result card slide in (matches result accent)
 *     38–46f  result holds
 *     46–54f  caption pill fades in
 *     54–150f hold
 *
 * The math generalises to N operands (min 2, max 4):
 *     equationDoneFrame = (N - 1) * 14 + 8 + 8 + 8   // last operand + hold + result slide
 *
 * VISUAL STYLE
 * ------------
 *   - Each card: rounded pill (border-radius 999), translucent slate
 *     bg (rgba(20,30,55,0.7)), accent-color left border (4px), white text,
 *     Inter font, 36px font size (between the 32-40 range from the brief).
 *   - Operators (`+`, `=`): bold Inter 48px, color = the right-adjacent
 *     card's accent. The brief locks this in: "+ color matches next operand's
 *     accent", "= color matches result card's accent".
 *   - EDITORIAL_SPRING profile (damping 22 / stiffness 130 / mass 0.7) for
 *     all card landings — firm settle, no bouncy overshoot. Matches the
 *     editorial-motion DNA Wave-3 named on the cream/dark templates.
 *
 * NON-GOALS
 * ---------
 *   - No `BrandWatermark16x9` overlay (the chassis handle chip is the only
 *     persistent brand mark needed for this pattern; Nate's reference frames
 *     show ONE chip lower-right, not a logo + handle stack).
 *   - No `EditorialCaption` / Whisper word strip (the caption pill IS the
 *     text layer; a karaoke strip would compete).
 *   - No section label / breadcrumb (Nate's equation cards are the title).
 *
 * REGISTRATION
 * ------------
 * Registered under `Landscape-16x9-Wave6` in `Root.tsx` with id
 * `EquationCardChain16x9`. Duration is dynamic via `calculateMetadata` —
 * it reads `props.durationFrames` and falls back to 150 when absent.
 */
import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";

// ─── Local constants ─────────────────────────────────────────────────────

/**
 * Nate B Jones's signature accent — "TNF orange" sampled from his fullscreen-
 * card scenes. Mirrors the local `TNF_ORANGE` in
 * `components/captions/CaptionPillWithKeyword.tsx` to keep the result-card
 * accent in family with the caption highlight. Kept local (not promoted to
 * brand/config.ts) because it's still scoped to the Nate 16:9 lane.
 */
const TNF_ORANGE = "#E07B3C";

/**
 * Default per-card accent palette, cycled through operand cards when no
 * per-card `accentColor` override is provided. Picked to track Nate's
 * 5-color accent band (orange + cyan + mint + indigo + gold) per
 * `references/creators/natebjones/ANALYSIS-VOTE1.md` §Visual motifs.
 */
const DEFAULT_OPERAND_ACCENTS = [
  "#5BC0E8", // cyan
  "#7DC9A0", // mint
  "#D4AF37", // gold
  "#A089E8", // soft indigo
] as const;

/**
 * Editorial spring — matches `EDITORIAL_SPRING` in
 * `compositions/scenes/useOverlayChoreography.ts` (damping 22 / stiffness 130 /
 * mass 0.7). Re-declared locally so this composition can stay decoupled from
 * the 9:16 scenes graph; the values are kept in lockstep.
 */
const EDITORIAL_SPRING = {
  damping: 22,
  stiffness: 130,
  mass: 0.7,
} as const;

// ─── Schema ──────────────────────────────────────────────────────────────

const operandSchema = z.object({
  text: z.string(),
  /** Per-card accent border / operator color. Default cycles through palette. */
  accentColor: z.string().optional(),
});

const resultSchema = z.object({
  text: z.string(),
  /** Per-result accent. Default TNF orange. */
  accentColor: z.string().optional(),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const equationCardChainSchema = z.object({
  operands: z.array(operandSchema).min(2).max(4),
  result: resultSchema,
  caption: captionSchema.optional(),
  /** Persistent handle chip lower-right. */
  handle: z.string().default("@armandointeligencia"),
  /** Total duration in frames. Default 150 (5s @ 30fps). */
  durationFrames: z.number().default(150),
  /** transitionVerb per Wave-5 contract. */
  transitionVerb: z
    .string()
    .default(
      "Land the operand cards one by one left-to-right; after each card settles, its + separator pops in matching the next card's accent color; the final = and result card slide in last, then the caption pill fades in below with the keyword tinted orange.",
    ),
});

export type EquationCardChainProps = z.infer<typeof equationCardChainSchema>;

// ─── Per-card timing helpers ─────────────────────────────────────────────

// Per-operand cadence: each operand lands 14 frames after the previous, with
// its `+` separator popping in 8 frames later (so the `+` sits in the visual
// pause between two operands).
const OPERAND_LAND_FRAMES = 8;
const PLUS_POP_FRAMES = 6;
const PER_OPERAND_STEP_FRAMES = OPERAND_LAND_FRAMES + PLUS_POP_FRAMES; // 14
const PRE_RESULT_HOLD_FRAMES = 8;
const RESULT_SLIDE_FRAMES = 8;
const POST_RESULT_HOLD_FRAMES = 8;
const CAPTION_FADE_FRAMES = 8;

/** First operand lands at frame 0 (the composition's t=0). */
const OPERAND_BASE_FRAME = 0;

interface ChainTimeline {
  operandEnterFrames: number[];
  plusEnterFrames: number[]; // one between each adjacent operand pair
  equalsAndResultEnterFrame: number;
  captionEnterFrame: number;
}

/**
 * Compute the per-element entry frames for an N-operand chain. The math is
 * purely a function of operand count — caption start derives from when the
 * result has visually settled.
 */
function computeTimeline(operandCount: number): ChainTimeline {
  const operandEnterFrames: number[] = [];
  for (let i = 0; i < operandCount; i++) {
    operandEnterFrames.push(OPERAND_BASE_FRAME + i * PER_OPERAND_STEP_FRAMES);
  }

  // `+` separator between operand[i] and operand[i+1] pops in AFTER operand[i]
  // has landed (operandEnterFrames[i] + OPERAND_LAND_FRAMES). There are
  // (operandCount - 1) plus separators.
  const plusEnterFrames: number[] = [];
  for (let i = 0; i < operandCount - 1; i++) {
    plusEnterFrames.push(operandEnterFrames[i] + OPERAND_LAND_FRAMES);
  }

  const lastOperandLandedFrame =
    operandEnterFrames[operandCount - 1] + OPERAND_LAND_FRAMES;
  const equalsAndResultEnterFrame =
    lastOperandLandedFrame + PRE_RESULT_HOLD_FRAMES;
  const captionEnterFrame =
    equalsAndResultEnterFrame +
    RESULT_SLIDE_FRAMES +
    POST_RESULT_HOLD_FRAMES;

  return {
    operandEnterFrames,
    plusEnterFrames,
    equalsAndResultEnterFrame,
    captionEnterFrame,
  };
}

// ─── Card primitive ──────────────────────────────────────────────────────

interface PillCardProps {
  text: string;
  accentColor: string;
  enterFrame: number;
  /** Slide distance in px from above for the entry animation. */
  slideFromPx?: number;
  /** Optional bump to font size for emphasis (the result card uses 40px). */
  fontSize?: number;
}

const PillCard: React.FC<PillCardProps> = ({
  text,
  accentColor,
  enterFrame,
  slideFromPx = 60,
  fontSize = 36,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: OPERAND_LAND_FRAMES,
  });

  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(enter, [0, 1], [-slideFromPx, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(20,30,55,0.7)",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 999,
        padding: "16px 32px",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 600,
        fontSize,
        color: "#FFFFFF",
        letterSpacing: "0.005em",
        whiteSpace: "nowrap",
        opacity,
        transform: `translateY(${translateY}px)`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.32)",
      }}
    >
      {text}
    </div>
  );
};

// ─── Operator primitives ─────────────────────────────────────────────────

interface PlusOperatorProps {
  /** Color matches the right-adjacent (next) operand's accent. */
  color: string;
  enterFrame: number;
}

/**
 * `+` separator — pops in (scale 0.6 → 1.0 + fade) over PLUS_POP_FRAMES. The
 * pop uses EDITORIAL_SPRING so it shares the calmer family as the cards.
 */
const PlusOperator: React.FC<PlusOperatorProps> = ({ color, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: PLUS_POP_FRAMES,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enter, [0, 1], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize: 48,
        lineHeight: 1,
        color,
        opacity,
        transform: `scale(${scale})`,
      }}
      aria-hidden
    >
      +
    </span>
  );
};

interface EqualsOperatorProps {
  /** Color matches the result card's accent. */
  color: string;
  enterFrame: number;
}

/**
 * `=` separator — slides up + fades in alongside the result card over
 * RESULT_SLIDE_FRAMES. Same EDITORIAL_SPRING family, no pop scale.
 */
const EqualsOperator: React.FC<EqualsOperatorProps> = ({
  color,
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: RESULT_SLIDE_FRAMES,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(enter, [0, 1], [-24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize: 48,
        lineHeight: 1,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
      aria-hidden
    >
      =
    </span>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────

export const EquationCardChain16x9: React.FC<EquationCardChainProps> = ({
  operands,
  result,
  caption,
  handle,
}) => {
  const timeline = computeTimeline(operands.length);

  // Resolve accent colors. Per-card override wins; otherwise cycle the default
  // palette so adjacent cards never share a color.
  // Treat both `undefined` and empty-string as "no override" so empty defaults
  // in Remotion Studio's Composition defaults (which require concrete schema
  // shape) still cycle through the palette correctly.
  const operandAccents = operands.map((op, i) =>
    op.accentColor && op.accentColor.length > 0
      ? op.accentColor
      : DEFAULT_OPERAND_ACCENTS[i % DEFAULT_OPERAND_ACCENTS.length],
  );
  const resultAccent =
    result.accentColor && result.accentColor.length > 0
      ? result.accentColor
      : TNF_ORANGE;

  // Pre-build the caption pill once so the chassis can render it in its
  // dedicated bottom slot. We pass an absolute startFrame; the pill renders
  // nothing before that frame.
  const captionNode = caption ? (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      startFrame={timeline.captionEnterFrame}
      transitionVerb="fade"
      fontSize={36}
      anchor="below-content"
    />
  ) : undefined;

  return (
    <DarkSlateChassis16x9
      handleChip={{ text: handle }}
      captionPill={captionNode}
    >
      {/* Horizontally + vertically centered equation row. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            flexWrap: "nowrap",
            // Leave breathing room from the side margins (matches the 120px
            // SIDE_MARGIN used by PipelineFlow16x9 for chassis consistency).
            maxWidth: 1680,
            padding: "0 120px",
          }}
        >
          {operands.map((operand, i) => (
            <React.Fragment key={`operand-${i}`}>
              <PillCard
                text={operand.text}
                accentColor={operandAccents[i]}
                enterFrame={timeline.operandEnterFrames[i]}
              />
              {i < operands.length - 1 ? (
                <PlusOperator
                  // Brief: "+ separator pops in matching the next card's
                  // accent color" → use operand[i+1]'s accent.
                  color={operandAccents[i + 1]}
                  enterFrame={timeline.plusEnterFrames[i]}
                />
              ) : null}
            </React.Fragment>
          ))}

          <EqualsOperator
            color={resultAccent}
            enterFrame={timeline.equalsAndResultEnterFrame}
          />
          <PillCard
            text={result.text}
            accentColor={resultAccent}
            enterFrame={timeline.equalsAndResultEnterFrame}
            fontSize={40}
          />
        </div>
      </div>
    </DarkSlateChassis16x9>
  );
};

export default EquationCardChain16x9;
