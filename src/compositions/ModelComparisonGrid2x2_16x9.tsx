/**
 * ModelComparisonGrid2x2_16x9 — theaiadvantage's dominant "four-up model
 * comparison" stage.
 *
 * Reference anchors (theaiadvantage `_fresh/`):
 *   - frame-003 / frame-005 / frame-007 — the canonical beat: a deep, slightly
 *     desaturated navy stage holds FOUR media tiles arranged 2×2 (two on the
 *     left half, two on the right half) with a wide center gutter. Each tile is
 *     a rounded media rect carrying a bold white label, and the alpha-keyed
 *     presenter sits in the CENTER-BOTTOM gap between the four tiles, his torso
 *     bridging the lower gutter.
 *   - The labels read as "model names" (Nano Banana 2 / ChatGPT Image 1.5 /
 *     Nano Banana Pro / Flux 2 Pro). frame-003 vs frame-005 vs frame-007 show
 *     the SAME grid skeleton reused beat-to-beat with only the tile media and
 *     labels swapped — so the template is the chassis, the cells are content.
 *
 * Anatomy (back-to-front):
 *   deep-navy stage
 *     ↳ optional title bar (top-center, fades in first)
 *     ↳ 2×2 grid of four rounded cards, each = top label chip + media slot
 *       (rounded placeholder rect, where generated-image/video footage is
 *       composited elsewhere) + optional small caption beneath
 *     ↳ presenter PIP — a rounded, white-bordered placeholder anchored in the
 *       center-bottom gap (footage composited elsewhere)
 *
 * Entrance choreography (mirrors the source reveal order):
 *   0–10f   title bar fades + lifts in
 *   staggered TL → TR → BL → BR, each cell does a fade + slight scale-pop
 *           (spring) so the four tiles "place down" in reading order
 *   last    the center PIP fades up from below, after the grid has settled
 *
 * Self-contained: react + remotion + zod + brand + inline SVG only. The media
 * slots and the PIP are placeholders by design — real footage/imagery is
 * composited over these slots downstream, exactly like the source where the
 * presenter is alpha-keyed in over the rendered grid.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema — EVERY field has a .default(); "" is the empty/override sentinel.
// ─────────────────────────────────────────────────────────────────────────────

const cellSchema = z.object({
  /** Top label chip text — typically a model name. e.g. "Nano Banana 2". */
  label: z.string().default(""),
  /**
   * Optional small caption beneath the media slot (e.g. a one-word verdict).
   * "" hides it.
   */
  caption: z.string().default(""),
  /**
   * Per-cell accent for the label chip + media-slot frame. "" falls back to the
   * composition-level accentColor.
   */
  accent: z.string().default(""),
});

export const modelComparisonGrid2x2Schema = z.object({
  /**
   * Exactly four cells, laid out TL, TR, BL, BR (reading order). The schema
   * enforces 4 so the 2×2 skeleton is always full.
   */
  cells: z
    .array(cellSchema)
    .length(4)
    .default([
      { label: "Nano Banana 2", caption: "", accent: "" },
      { label: "ChatGPT Image 1.5", caption: "", accent: "" },
      { label: "Nano Banana Pro", caption: "", accent: "" },
      { label: "Flux 2 Pro", caption: "", accent: "" },
    ]),
  /** Optional title bar text along the top. "" hides the title bar. */
  title: z.string().default("Same prompt, four models"),
  /** When true, render the center-bottom presenter PIP placeholder. */
  showCenterPip: z.boolean().default(true),
  /** Stage-wide accent (label chips, slot frames, PIP ring). */
  accentColor: z.string().default(BRAND.colors.accent),
  /** Lower-bug handle. "" hides it. */
  handle: z.string().default("@armandointeligencia"),
  /** Per Wave contract — narrates the intended motion for downstream tooling. */
  transitionVerb: z
    .string()
    .default(
      "Fade the title bar in first; then stagger the four cells in reading order (TL, TR, BL, BR) each with a slight scale-pop; finally fade the center presenter PIP up from below.",
    ),
});

export type ModelComparisonGrid2x2_16x9Props = z.infer<
  typeof modelComparisonGrid2x2Schema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Stage / layout constants (1920×1080)
// ─────────────────────────────────────────────────────────────────────────────

/** Deep desaturated navy stage — leans toward theaiadvantage's slate tone. */
const STAGE_TOP = "#1B2536";
const STAGE_BOTTOM = BRAND.colors.backgroundDark; // "#0F1B2D"

const STAGE_PADDING_X = 110;
const TITLE_BAR_TOP = 44;

/** Center gutter (px) between the left and right columns — the PIP lives here. */
const COLUMN_GUTTER = 300;
/** Vertical gap between the top and bottom rows. */
const ROW_GUTTER = 118;
/** Where the grid block sits vertically (leaves room for the title bar). */
const GRID_TOP = 150;
const GRID_BOTTOM = 86;

const CARD_RADIUS = 18;
const SLOT_RADIUS = 12;
const SLOT_BORDER = 3;

const LABEL_CHIP_RADIUS = 9;
const LABEL_FONT_SIZE = 30;
const CAPTION_FONT_SIZE = 22;
const TITLE_FONT_SIZE = 40;

/** Presenter PIP — rounded portrait tile in the center-bottom gutter. */
const PIP_WIDTH = 290;
const PIP_HEIGHT = 360;
const PIP_BORDER = 5;
const PIP_RADIUS = 22;
/** How far up from the stage bottom the PIP's base sits. */
const PIP_BOTTOM_INSET = 24;

const CARD_BG = "rgba(255,255,255,0.045)";
const SLOT_BG = "rgba(8,14,26,0.66)";
const LABEL_TEXT = BRAND.colors.textLight; // "#FFFFFF"
const CAPTION_TEXT = "rgba(255,255,255,0.66)";

// ─────────────────────────────────────────────────────────────────────────────
// Timing windows (frames @ 30fps) — entrance choreography.
// ─────────────────────────────────────────────────────────────────────────────

const TITLE_FADE = { start: 0, end: 10 } as const;
const TITLE_LIFT_PX = -16;

/** Cell entrance start frames in reading order: TL, TR, BL, BR. */
const CELL_START_FRAMES: readonly [number, number, number, number] = [
  12, 18, 24, 30,
];

/** PIP fades up after the BR cell has had time to settle. */
const PIP_FADE = { start: 44, end: 58 } as const;
const PIP_RISE_PX = 34;

// ─────────────────────────────────────────────────────────────────────────────
// Inline icon — a tiny "image" glyph drawn in each empty media slot so the
// placeholder reads as a media well even before footage is composited over it.
// ─────────────────────────────────────────────────────────────────────────────

const SlotMediaGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{ opacity: 0.5 }}
  >
    <rect
      x={3}
      y={4}
      width={18}
      height={16}
      rx={2.5}
      stroke={color}
      strokeWidth={1.4}
    />
    <circle cx={8.5} cy={9} r={1.8} fill={color} />
    <path
      d="M4 17l4.5-4.5 3 3L16 11l4 4.5"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Grid cell — top label chip + media slot + optional caption.
// ─────────────────────────────────────────────────────────────────────────────

interface GridCellProps {
  label: string;
  caption: string;
  accent: string;
  startFrame: number;
}

const GridCell: React.FC<GridCellProps> = ({
  label,
  caption,
  accent,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slight scale-pop on a spring + a fade, so the tile "places down".
  const pop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 150, mass: 0.7 },
  });
  const scale = interpolate(pop, [0, 1], [0.9, 1]);
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 9],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: CARD_BG,
        borderRadius: CARD_RADIUS,
        padding: 16,
        boxSizing: "border-box",
        boxShadow: "0 10px 34px rgba(0,0,0,0.42)",
      }}
    >
      {/* Top label chip */}
      {label !== "" ? (
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "100%",
            background: accent,
            color: "#0F1B2D",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: LABEL_FONT_SIZE,
            lineHeight: 1,
            letterSpacing: "0.005em",
            padding: "10px 18px",
            borderRadius: LABEL_CHIP_RADIUS,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 14,
          }}
        >
          {label}
        </div>
      ) : null}

      {/* Media slot — rounded placeholder rect */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          borderRadius: SLOT_RADIUS,
          background: SLOT_BG,
          border: `${SLOT_BORDER}px solid ${accent}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SlotMediaGlyph color={accent} />
      </div>

      {/* Optional small caption */}
      {caption !== "" ? (
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: CAPTION_FONT_SIZE,
            color: CAPTION_TEXT,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Presenter PIP — bordered placeholder in the center-bottom gutter.
// ─────────────────────────────────────────────────────────────────────────────

const PresenterPip: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [PIP_FADE.start, PIP_FADE.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const riseY = interpolate(
    frame,
    [PIP_FADE.start, PIP_FADE.end],
    [PIP_RISE_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: PIP_BOTTOM_INSET,
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
        transform: `translateX(-50%) translateY(${riseY}px)`,
        opacity,
        borderRadius: PIP_RADIUS,
        border: `${PIP_BORDER}px solid ${accent}`,
        background: SLOT_BG,
        boxSizing: "border-box",
        boxShadow: "0 14px 44px rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        overflow: "hidden",
      }}
    >
      {/* Simple presenter silhouette so the slot reads as a face-cam well. */}
      <svg
        width={120}
        height={120}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ opacity: 0.55 }}
      >
        <circle cx={12} cy={8.2} r={4} stroke={accent} strokeWidth={1.4} />
        <path
          d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"
          stroke={accent}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Presenter
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Title bar — top-center, fades + lifts in first.
// ─────────────────────────────────────────────────────────────────────────────

const TitleBar: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [TITLE_FADE.start, TITLE_FADE.end],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lift = interpolate(
    frame,
    [TITLE_FADE.start, TITLE_FADE.end],
    [TITLE_LIFT_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_BAR_TOP,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: TITLE_FONT_SIZE,
          color: LABEL_TEXT,
          letterSpacing: "0.01em",
          textAlign: "center",
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lower handle bug.
// ─────────────────────────────────────────────────────────────────────────────

const HandleBug: React.FC<{ handle: string; accent: string }> = ({
  handle,
  accent,
}) => (
  <div
    style={{
      position: "absolute",
      left: STAGE_PADDING_X,
      bottom: 30,
      fontFamily: FONT_STACKS.sans,
      fontWeight: 600,
      fontSize: 22,
      color: "rgba(255,255,255,0.42)",
      letterSpacing: "0.02em",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 3,
        background: accent,
        display: "inline-block",
      }}
    />
    {handle}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const ModelComparisonGrid2x2_16x9: React.FC<
  ModelComparisonGrid2x2_16x9Props
> = ({ cells, title, showCenterPip, accentColor, handle }) => {
  const resolveAccent = (cellAccent: string): string =>
    cellAccent !== "" ? cellAccent : accentColor;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${STAGE_TOP} 0%, ${STAGE_BOTTOM} 100%)`,
      }}
    >
      {title !== "" ? <TitleBar title={title} /> : null}

      {/* 2×2 grid block. A wide column gutter leaves the center channel open for
          the presenter PIP, exactly as in the source frames. */}
      <div
        style={{
          position: "absolute",
          top: GRID_TOP,
          bottom: GRID_BOTTOM,
          left: STAGE_PADDING_X,
          right: STAGE_PADDING_X,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          columnGap: COLUMN_GUTTER,
          rowGap: ROW_GUTTER,
        }}
      >
        {cells.map((cell, i) => (
          <GridCell
            key={`${cell.label}-${i}`}
            label={cell.label}
            caption={cell.caption}
            accent={resolveAccent(cell.accent)}
            startFrame={CELL_START_FRAMES[i]}
          />
        ))}
      </div>

      {showCenterPip ? <PresenterPip accent={accentColor} /> : null}

      {handle !== "" ? <HandleBug handle={handle} accent={accentColor} /> : null}
    </AbsoluteFill>
  );
};

export default ModelComparisonGrid2x2_16x9;
