/**
 * BeforeAfterText16x9 — Nate B Jones consensus pattern H2
 * (BeforeAfterTextComparison).
 *
 * 16:9 (1920×1080) two-column TEXT contrast on dark slate with a central
 * operator word/symbol. NOT a code diff (see CodeDiffBeforeAfter9x16.tsx for
 * that — it pairs MacWindow editor cards with line-by-line diff stripes).
 * This template is for free-form noun phrases like:
 *   "Cloud Home" → "Cloud Guest"
 *   "Scoped Agent" VS "Unknown Actor"
 *
 * Visual structure (left → right):
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │ ANTHROPIC · MAY 27, 2026                                             │  ← BrandBreadcrumb16x9
 *   │                                                                      │
 *   │           ┌─────────────────┐  TO  ┌─────────────────┐               │
 *   │           │ DEFAULT         │      │ BETTER          │               │
 *   │           │ ─────           │      │ ─────           │               │
 *   │           │ Cloud Home      │      │ Cloud Guest     │               │
 *   │           │ (sub-line)      │      │ (sub-line)      │               │
 *   │           └─────────────────┘      └─────────────────┘               │
 *   │                                                                      │
 *   │           ┌──────── optional emphasis pill ────────┐                 │
 *   │                                                                      │
 *   │                                              [logo @armandointe…]    │
 *   └──────────────────────────────────────────────────────────────────────┘
 *
 * Entry choreography (Wave-5 transitionVerb):
 *   1. Left column slides in from the left over 14 frames with blurInFocus
 *      (blur 14→0, scale 0.96→1, opacity 0→1), translating from x=-120 to
 *      its resting x=160.
 *   2. Right column slides in from the right with the same blurInFocus,
 *      staggered `columnStaggerFrames` frames after the left.
 *   3. Central operator fades in over 8 frames, starting
 *      `operatorEnterDelaySeconds` after both columns settle.
 *   4. Optional emphasis pill fades in 12 frames after the operator settles.
 *
 * Schema + type are exported at the BOTTOM (project convention — does NOT
 * touch src/compositions/schemas.ts).
 */
import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { EmphasisPill } from "../components/TextEmphasis";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { blurInFocus } from "../animation/blurInFocus";
import {
  ALL_PALETTE_MODES,
  FONT_STACKS,
  getPalette,
  getToolAccentForSurface,
  isDarkPalette,
  resolveColors,
} from "../brand";

// ─── Layout constants (1920×1080 canvas) ───────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Each column occupies a 600px-wide slot anchored 160px from the canvas edge.
// Mirror-symmetric around the vertical center line (x=960).
const COLUMN_W = 600;
const LEFT_COLUMN_REST_X = 160;
const RIGHT_COLUMN_REST_X = 160; // measured from the RIGHT edge
const COLUMN_SLIDE_DISTANCE = 120; // px the column travels during entry

// Vertical anchors for the body block (y=540 is the canvas center).
const COLUMN_LABEL_Y = 400;
const COLUMN_BODY_Y = 480;
const COLUMN_SUB_Y = 640;
const COLUMN_UNDERLINE_Y = 444; // sits 4px below the 32px label baseline
const COLUMN_UNDERLINE_W = 200;
const COLUMN_UNDERLINE_H = 4;

// Operator anchor (canvas center).
const OPERATOR_X = CANVAS_W / 2;
const OPERATOR_Y = 540;

// Emphasis pill anchor.
const EMPHASIS_PILL_Y = 860;

// Section label chip (top-center, below breadcrumb).
const SECTION_LABEL_Y = 120;

// ─── Local sub-schemas (intentionally NOT exported from schemas.ts) ────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});
type LocalWordTiming = z.infer<typeof wordTimingSchema_local>;

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const columnSchema = z.object({
  /** Header label — mono tracked uppercase, accent-colored. e.g. "DEFAULT", "BEFORE", "OLD". */
  label: z.string().default("DEFAULT"),
  /** Body content (sans bold, large). Supports "\n" for multi-line. */
  body: z.string().default("Cloud Home"),
  /** Optional sub-line in muted color below the body. */
  sub: z.string().default(""),
  /** Accent color for the underline + the header label. */
  accentColor: z.string().default("#E07A6B"),
});
type LocalColumn = z.infer<typeof columnSchema>;

const operatorSchema = z.object({
  /** The operator word or symbol. Default "TO" — also "VS" / "→" / "vs". */
  symbol: z.string().default("TO"),
  /** Operator font size in px. */
  fontSize: z.number().default(96),
  /** Operator color. Empty string falls back to muted palette color. */
  color: z.string().default(""),
  /** Render operator in Playfair Italic? (Editorial "vs" look.) */
  italic: z.boolean().default(false),
});
type LocalOperator = z.infer<typeof operatorSchema>;

const emphasisPillSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().default(""),
  emphasisWords: z.array(z.string()).default([]),
  emphasisColor: z.string().default("#F2A555"),
});
type LocalEmphasisPill = z.infer<typeof emphasisPillSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Resolve a media src: empty → null; absolute URL passes through; everything
 *  else is wrapped in staticFile(). */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

// ─── Column block (label + underline + body + sub) ─────────────────────────
const ColumnBlock: React.FC<{
  column: LocalColumn;
  /** Slide-in direction — "left" enters from off-canvas left, "right" from off-canvas right. */
  side: "left" | "right";
  /** Frame at which this column begins entering. */
  enterStartFrame: number;
  /** Entry duration in frames. */
  enterDurationFrames: number;
  inkColor: string;
  mutedColor: string;
}> = ({
  column,
  side,
  enterStartFrame,
  enterDurationFrames,
  inkColor,
  mutedColor,
}) => {
  const frame = useCurrentFrame();

  const entry = blurInFocus({
    frame,
    startFrame: enterStartFrame,
    durationFrames: enterDurationFrames,
    startBlurPx: 14,
    startScale: 0.96,
  });

  // Slide-in: translate from off-canvas toward the resting position. The
  // resting position is `LEFT_COLUMN_REST_X` from the relevant edge, so we
  // translate from `-COLUMN_SLIDE_DISTANCE` (still on-screen but offset) to 0.
  const slidePx = interpolate(
    entry.opacity, // re-use the same eased 0..1 envelope from blurInFocus
    [0, 1],
    [side === "left" ? -COLUMN_SLIDE_DISTANCE : COLUMN_SLIDE_DISTANCE, 0],
  );

  const containerLeft =
    side === "left" ? LEFT_COLUMN_REST_X : CANVAS_W - RIGHT_COLUMN_REST_X - COLUMN_W;

  // Each line of the body renders on its own row so "Cloud\nGuest" wraps
  // visually. We split on "\n" and render an array of divs.
  const bodyLines = column.body.split("\n");

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: containerLeft,
        width: COLUMN_W,
        height: CANVAS_H,
        opacity: entry.opacity,
        filter: entry.filter,
        transform: `translateX(${slidePx}px) scale(${entry.scale.toFixed(4)})`,
        transformOrigin: side === "left" ? "left center" : "right center",
        pointerEvents: "none",
      }}
    >
      {/* Header label — mono tracked uppercase in the column accent color. */}
      <div
        style={{
          position: "absolute",
          top: COLUMN_LABEL_Y,
          left: 0,
          width: COLUMN_W,
          textAlign: "center",
          fontFamily: FONT_STACKS.mono,
          fontWeight: 700,
          fontSize: 32,
          color: column.accentColor,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {column.label}
      </div>

      {/* Colored underline below the label. */}
      <div
        style={{
          position: "absolute",
          top: COLUMN_UNDERLINE_Y,
          left: (COLUMN_W - COLUMN_UNDERLINE_W) / 2,
          width: COLUMN_UNDERLINE_W,
          height: COLUMN_UNDERLINE_H,
          background: column.accentColor,
          borderRadius: 2,
        }}
      />

      {/* Body block — sans bold, large, ink-colored. */}
      <div
        style={{
          position: "absolute",
          top: COLUMN_BODY_Y,
          left: 0,
          width: COLUMN_W,
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 96,
          color: inkColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        {bodyLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Optional sub-line in muted color. */}
      {column.sub ? (
        <div
          style={{
            position: "absolute",
            top: COLUMN_SUB_Y,
            left: 0,
            width: COLUMN_W,
            textAlign: "center",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: 36,
            color: mutedColor,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
          }}
        >
          {column.sub}
        </div>
      ) : null}
    </div>
  );
};

// ─── Central operator (TO / VS / → / vs) ───────────────────────────────────
const Operator: React.FC<{
  operator: LocalOperator;
  enterStartFrame: number;
  mutedColor: string;
}> = ({ operator, enterStartFrame, mutedColor }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [enterStartFrame, enterStartFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const resolvedColor = operator.color || mutedColor;
  const fontFamily = operator.italic
    ? FONT_STACKS.serifItalic
    : FONT_STACKS.sans;

  return (
    <div
      style={{
        position: "absolute",
        top: OPERATOR_Y - operator.fontSize / 2,
        left: 0,
        width: CANVAS_W,
        textAlign: "center",
        fontFamily,
        fontWeight: operator.italic ? 700 : 800,
        fontStyle: operator.italic ? "italic" : "normal",
        fontSize: operator.fontSize,
        color: resolvedColor,
        letterSpacing: operator.italic ? "0" : "0.05em",
        lineHeight: 1,
        opacity,
        pointerEvents: "none",
      }}
    >
      {operator.symbol}
    </div>
  );
};

// ─── Section label chip (top-center under breadcrumb) ──────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
  inkColor: string;
}> = ({ text, accentColor, inkColor }) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        width: CANVAS_W,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          background: `${inkColor}E6`,
          border: `1px solid ${accentColor}`,
          borderRadius: 4,
          fontFamily: FONT_STACKS.mono,
          fontWeight: 600,
          fontSize: 20,
          color: accentColor,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────────
export const BeforeAfterText16x9: React.FC<BeforeAfterText16x9Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  left,
  right,
  operator,
  connectorGlyph,
  emphasisPill,
  enterSeconds,
  columnStaggerFrames,
  operatorEnterDelaySeconds,
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
  // `connectorGlyph` is the top-level convenience prop for the central
  // operator glyph (e.g. "VS", "→", "⇒", "↔"). When non-empty it overrides
  // the nested `operator.symbol`; when empty (default) the nested
  // `operator.symbol` is used so existing call-sites are bit-identical.
  // See R4B Nate B Jones VSContrastTwoColumn (pattern N5) finding.
  const resolvedOperator = connectorGlyph
    ? { ...operator, symbol: connectorGlyph }
    : operator;
  const { fps } = useVideoConfig();

  // Color stack — empty strings fall back to palette defaults.
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

  const resolvedAudio = resolveSrc(audioUrl);

  // Entry timeline:
  //   leftEnterFrame   = enterSeconds * fps
  //   rightEnterFrame  = leftEnterFrame + columnStaggerFrames
  //   operatorEnter    = rightEnterFrame + 14 (entry duration) + operatorEnterDelaySeconds * fps
  //   pillEnter        = operatorEnter + 8 + 12  (operator settle + 12 frames)
  const enterDurationFrames = 14;
  const leftEnterFrame = Math.round(enterSeconds * fps);
  const rightEnterFrame = leftEnterFrame + columnStaggerFrames;
  const operatorEnterFrame =
    rightEnterFrame +
    enterDurationFrames +
    Math.round(operatorEnterDelaySeconds * fps);
  const pillEnterFrame = operatorEnterFrame + 8 + 12;

  // Captions are optional — we use EditorialCaption when both showCaptions and
  // word timings are provided.
  const captionsActive = showCaptions && wordTimings.length > 0;

  // Body text color: on light palettes use ink, on dark palettes use white for
  // maximum contrast against the slate background per the H2 reference frames.
  const bodyTextColor = isDarkPalette(palette) ? "#FFFFFF" : resolvedInk;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {/* Voiceover */}
      {resolvedAudio && <Audio src={resolvedAudio} />}

      {/* ── z=10: LEFT column ── */}
      <ColumnBlock
        column={left}
        side="left"
        enterStartFrame={leftEnterFrame}
        enterDurationFrames={enterDurationFrames}
        inkColor={bodyTextColor}
        mutedColor={resolvedMuted}
      />

      {/* ── z=11: RIGHT column ── */}
      <ColumnBlock
        column={right}
        side="right"
        enterStartFrame={rightEnterFrame}
        enterDurationFrames={enterDurationFrames}
        inkColor={bodyTextColor}
        mutedColor={resolvedMuted}
      />

      {/* ── z=12: Central operator ── */}
      <Operator
        operator={resolvedOperator}
        enterStartFrame={operatorEnterFrame}
        mutedColor={resolvedMuted}
      />

      {/* ── z=20: Palette grain overlay ── */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDarkPalette(palette) ? "screen" : "multiply",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* ── z=30: Optional emphasis pill (bottom) ── */}
      {emphasisPill.enabled ? (
        <div
          style={{
            position: "absolute",
            top: EMPHASIS_PILL_Y,
            left: 0,
            width: CANVAS_W,
            pointerEvents: "none",
          }}
        >
          <EmphasisPill
            text={emphasisPill.text}
            emphasisWords={emphasisPill.emphasisWords}
            emphasisColor={emphasisPill.emphasisColor}
            baseColor={bodyTextColor}
            borderColor={`${resolvedMuted}55`}
            enterFrame={pillEnterFrame}
            fadeInFrames={10}
            maxWidthPx={1400}
            fontSize={36}
          />
        </div>
      ) : null}

      {/* ── z=40: Brand chrome ── */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}
      <SectionLabel
        text={sectionLabel}
        accentColor={resolvedAccent}
        inkColor={resolvedInk}
      />
      <BrandWatermark16x9
        style={{
          enabled: true,
          logo: "avatar",
          position: "bottom-right",
          size: 96,
          opacity: 0.9,
        }}
      />

      {/* ── z=50: Captions ── */}
      {captionsActive ? (
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
      ) : null}
    </AbsoluteFill>
  );
};

// ─── Schema export (lives at the BOTTOM, per project convention) ───────────
export const beforeAfterText16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  sectionLabel: z.string().default(""),

  /** Left column. */
  left: columnSchema.default({
    label: "DEFAULT",
    body: "Cloud Home",
    sub: "",
    accentColor: "#E07A6B",
  }),

  /** Right column. */
  right: columnSchema.default({
    label: "BETTER",
    body: "Cloud Guest",
    sub: "",
    accentColor: "#7CE49A",
  }),

  /** Central operator. */
  operator: operatorSchema.default({
    symbol: "TO",
    fontSize: 96,
    color: "",
    italic: false,
  }),

  /**
   * Top-level convenience glyph for the central operator. Supports any
   * single- or multi-character string (e.g. `"TO"`, `"VS"`, `"→"`, `"=>"`,
   * `"⇒"`, `"↔"`). When non-empty this overrides `operator.symbol`; when
   * empty (default) the nested `operator.symbol` is used so existing call
   * sites remain bit-identical.
   *
   * Spec deviation: the original prop request was `default("TO")`; we use
   * `default("")` to preserve back-compat with the existing nested
   * `operator.symbol` flow (e.g. Root.tsx defaults set `operator.symbol`
   * to `"VS"` and must continue rendering "VS" without explicit
   * `connectorGlyph`).
   *
   * Originally surfaced by R4B Nate B Jones `VSContrastTwoColumn16x9`
   * (pattern N5) — sibling of BeforeAfter with `VS` glyph instead of `TO`.
   * Reference anchor: references/creators/natebjones/picks-wave7-batch3.json
   * → video `ogTLWGBc3cE` at t≈315s.
   */
  connectorGlyph: z.string().default(""),

  /** Optional bottom emphasis pill. */
  emphasisPill: emphasisPillSchema.default({
    enabled: false,
    text: "",
    emphasisWords: [],
    emphasisColor: "#F2A555",
  }),

  /** Entry timing — seconds before the left column begins entering. */
  enterSeconds: z.number().default(0.4),

  /** Frames between left and right column entries. */
  columnStaggerFrames: z.number().default(6),

  /** Seconds after both columns settle before the operator fades in. */
  operatorEnterDelaySeconds: z.number().default(0.3),

  // Wave-5 contract: describes the layered motion for the planner.
  transitionVerb: z
    .string()
    .default(
      "Left column slides in from the left over 14 frames with blurInFocus; right column slides in from the right over 14 frames, staggered 6 frames after the left; central operator fades in 0.3 seconds after both columns settle; an optional emphasis pill below fades in last.",
    ),

  // Brand chrome (16:9 variants).
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(40),
  showCaptions: z.boolean().default(false),
});

export type BeforeAfterText16x9Props = z.infer<typeof beforeAfterText16x9Schema>;
