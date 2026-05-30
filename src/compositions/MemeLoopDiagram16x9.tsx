/**
 * MemeLoopDiagram16x9 — aiexplained "circular irony loop" pattern.
 *
 * WHY THIS EXISTS
 * ---------------
 * Wave-7 ADR-001 §4.1 Rank 3 flags this as the highest-replicability molecule
 * in the aiexplained reference corpus (see
 * `references/creators/aiexplained/ANALYSIS.md` §5 — "MemeLoopDiagram"). Even
 * though Philip used it only once (`2_DPnzoiHaY/anim-01`), the visual joke
 * generalises to any "the whole industry is in a loop" editorial beat:
 *
 *     [BrandA] ──CW arc──▶ [BrandB]
 *        ▲                     │
 *        │                     ▼
 *     [BrandD] ◀──────────  [BrandC]      pinned outlier ↳ [Llama]
 *
 * Each of the 4 brand cards sits at a corner-anchored position on a circular
 * arc. After all four land, the arc draws itself clockwise to close the loop.
 * An optional 5th "outlier corner pin" hangs at one image corner to represent
 * the meme's editorial counterpoint — the one that *isn't* participating in
 * the cycle.
 *
 * STRUCTURAL CONTRACT
 * -------------------
 * 1. **Chassis:** wraps `<DarkSlateChassis16x9>` for slate background + handle
 *    chip + caption-pill slot. Same single-source-of-truth chrome contract as
 *    every other Wave-6 16:9 template.
 * 2. **Loop cards:** 4 rounded-rect cards positioned at NE / SE / SW / NW
 *    (clockwise order matches the arc direction). Each card carries a label
 *    and an optional accent color border.
 * 3. **Circular arc:** an SVG circle centered at the frame's optical center
 *    (960, 540) with radius 360px. The stroke is drawn clockwise via
 *    stroke-dashoffset interpolation starting from the NE card's position.
 * 4. **Outlier corner pin:** optional 5th card pinned to one of the four image
 *    corners (TL / TR / BL / BR) with a distinct accent color (default red).
 *    It is intentionally OFF the loop — that is the joke.
 * 5. **Caption pill:** optional `<CaptionPillWithKeyword>` slotted into the
 *    chassis's `captionPill` prop. One word tints orange.
 *
 * TIMING (fixed @ 30fps unless `durationFrames` overridden)
 * ---------------------------------------------------------
 *     0–8f    NE card pops in (scale 0.5 → 1.0, opacity 0 → 1)
 *     8–16f   SE card pops in
 *     16–24f  SW card pops in
 *     24–32f  NW card pops in
 *     32–50f  circular arc draws clockwise from NE
 *     50–58f  outlier corner pin pops in (if present)
 *     64–72f  caption pill fades in
 *     72–150f hold
 *
 * REGISTRATION
 * ------------
 * Registered under `Landscape-16x9-Wave6` in `Root.tsx` with id
 * `MemeLoopDiagram16x9`. Duration is dynamic via `calculateMetadata` reading
 * `props.durationFrames` (default 150 = 5s @ 30fps).
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";

// ─── Constants ───────────────────────────────────────────────────────────

/** Frame center — 1920×1080. */
const FRAME_CENTER_X = 960;
const FRAME_CENTER_Y = 540;

/**
 * Loop card positions (centers). NE / SE / SW / NW in clockwise order so the
 * arc draws naturally in the same direction the cards land.
 */
const LOOP_CARD_CENTERS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 1440, y: 360 }, // 0 = NE
  { x: 1440, y: 720 }, // 1 = SE
  { x: 480, y: 720 }, // 2 = SW
  { x: 480, y: 360 }, // 3 = NW
];

const LOOP_CARD_SIZE_PX = 200;
const OUTLIER_PIN_SIZE_PX = 160;
const OUTLIER_PIN_EDGE_PADDING_PX = 48;

/** Arc geometry — concentric with the frame center, radius ≈ midway between
 * card-center and frame-center so the stroke threads through the loop cards. */
const ARC_RADIUS_PX = 360;

/**
 * Per-element timing offsets (frames @ 30fps). All windows are absolute against
 * the composition's t=0. Centralised here so the timeline reads at a glance and
 * stays in sync between the arc maths and the card maths.
 */
const TIMING = {
  cardEnterDurationFrames: 8,
  cardEnterFrames: [0, 8, 16, 24] as const, // NE / SE / SW / NW
  arcDrawStart: 32,
  arcDrawEnd: 50,
  outlierEnterStart: 50,
  outlierEnterEnd: 58,
  captionEnterFrame: 64,
} as const;

/**
 * Editorial spring — mirrors the EDITORIAL_SPRING profile used by
 * `EquationCardChain16x9` and the 9:16 overlay scenes. Calm settle, no
 * overshoot.
 */
const EDITORIAL_SPRING = {
  damping: 22,
  stiffness: 130,
  mass: 0.7,
} as const;

/** Default outlier accent — warm red contrasts cleanly with the loop's cyan. */
const DEFAULT_OUTLIER_ACCENT = "#E07A6B";

// ─── Schema ──────────────────────────────────────────────────────────────

const loopCardSchema = z.object({
  label: z.string(),
  /** Optional logo/image source for the card. Currently rendered as a label
   *  only — wired through for future visual upgrade. */
  src: z.string().optional(),
  /** Per-card border accent. Defaults to the shared `arcColor` when absent. */
  accentColor: z.string().optional(),
});

const outlierPinSchema = z.object({
  label: z.string(),
  corner: z.enum(["TL", "TR", "BL", "BR"]).default("TR"),
  accentColor: z.string().optional(),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const memeLoopDiagramSchema = z.object({
  /** 4 cards positioned at the cardinal-corner positions of the loop. Order:
   *  NE, SE, SW, NW (CW). */
  loopCards: z.array(loopCardSchema).length(4),
  /** Optional 5th card pinned at a corner (the meme's outlier). */
  outlierPin: outlierPinSchema.optional(),
  /** Color of the circular arc connecting the 4 cards. */
  arcColor: z.string().default("#5BC0E8"),
  /** Stroke width of the arc. Default 4. */
  arcStrokeWidth: z.number().default(4),
  caption: captionSchema.optional(),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(150),
  transitionVerb: z
    .string()
    .default(
      "Pop in the four loop cards one by one in clockwise order from NE → SE → SW → NW; after the last card settles, the circular arc draws itself clockwise connecting them; the outlier corner card pops in last; finally the caption pill fades in below with the keyword tinted orange.",
    ),
});

export type MemeLoopDiagram16x9Props = z.infer<typeof memeLoopDiagramSchema>;

// ─── Sub-components ──────────────────────────────────────────────────────

interface LoopCardProps {
  label: string;
  accentColor: string;
  centerX: number;
  centerY: number;
  enterFrame: number;
}

/**
 * One loop card — pops in with a spring scale + opacity ramp, then holds.
 * Positioned absolutely by its center coordinate so the parent doesn't have to
 * juggle flex math for the corner-anchored layout.
 */
const LoopCard: React.FC<LoopCardProps> = ({
  label,
  accentColor,
  centerX,
  centerY,
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: TIMING.cardEnterDurationFrames,
  });

  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enter, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - LOOP_CARD_SIZE_PX / 2,
        top: centerY - LOOP_CARD_SIZE_PX / 2,
        width: LOOP_CARD_SIZE_PX,
        height: LOOP_CARD_SIZE_PX,
        background: "rgba(20,30,55,0.7)",
        border: `3px solid ${accentColor}`,
        borderRadius: 24,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 16px 18px 16px",
        boxSizing: "border-box",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 28,
          color: "#FFFFFF",
          letterSpacing: "0.01em",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {label}
      </div>
    </div>
  );
};

interface CircularArcProps {
  color: string;
  strokeWidth: number;
}

/**
 * Circular arc — SVG circle drawn via stroke-dashoffset. Starts hidden
 * (offset = circumference), animates to fully drawn (offset = 0) over the
 * arc-draw window. The starting point is rotated to NE (-45° from the SVG
 * default 3-o'clock origin) so the visible stroke begins at the NE card and
 * sweeps clockwise.
 */
const CircularArc: React.FC<CircularArcProps> = ({ color, strokeWidth }) => {
  const frame = useCurrentFrame();
  const circumference = 2 * Math.PI * ARC_RADIUS_PX;

  const dashOffset = interpolate(
    frame,
    [TIMING.arcDrawStart, TIMING.arcDrawEnd],
    [circumference, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Rotate the circle by -45° around the frame center so the stroke
            origin (3 o'clock by default) lines up with the NE card. The arc
            then sweeps clockwise into SE → SW → NW back to NE. */}
        <g
          transform={`rotate(-45 ${FRAME_CENTER_X} ${FRAME_CENTER_Y})`}
        >
          <circle
            cx={FRAME_CENTER_X}
            cy={FRAME_CENTER_Y}
            r={ARC_RADIUS_PX}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            opacity={0.85}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

interface OutlierPinProps {
  label: string;
  corner: "TL" | "TR" | "BL" | "BR";
  accentColor: string;
}

/**
 * Outlier corner pin — small card anchored to one image corner with edge
 * padding. Pops in (scale + opacity) over `outlierEnterStart..End`. The
 * accent color contrasts the loop's cyan to read as editorially separate.
 */
const OutlierPin: React.FC<OutlierPinProps> = ({
  label,
  corner,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - TIMING.outlierEnterStart,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: TIMING.outlierEnterEnd - TIMING.outlierEnterStart,
  });

  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enter, [0, 1], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Resolve the corner anchor to absolute-position styles so a TL pin hugs
  // the top-left edge, BR hugs the bottom-right edge, etc.
  const cornerStyle: React.CSSProperties = (() => {
    switch (corner) {
      case "TL":
        return {
          top: OUTLIER_PIN_EDGE_PADDING_PX,
          left: OUTLIER_PIN_EDGE_PADDING_PX,
        };
      case "BL":
        return {
          bottom: OUTLIER_PIN_EDGE_PADDING_PX,
          left: OUTLIER_PIN_EDGE_PADDING_PX,
        };
      case "BR":
        return {
          bottom: OUTLIER_PIN_EDGE_PADDING_PX,
          right: OUTLIER_PIN_EDGE_PADDING_PX,
        };
      case "TR":
      default:
        return {
          top: OUTLIER_PIN_EDGE_PADDING_PX,
          right: OUTLIER_PIN_EDGE_PADDING_PX,
        };
    }
  })();

  return (
    <div
      style={{
        position: "absolute",
        width: OUTLIER_PIN_SIZE_PX,
        height: OUTLIER_PIN_SIZE_PX,
        background: "rgba(20,30,55,0.7)",
        border: `3px solid ${accentColor}`,
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 12px",
        boxSizing: "border-box",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
        ...cornerStyle,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 22,
          color: "#FFFFFF",
          letterSpacing: "0.01em",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────

export const MemeLoopDiagram16x9: React.FC<MemeLoopDiagram16x9Props> = ({
  loopCards,
  outlierPin,
  arcColor,
  arcStrokeWidth,
  caption,
  handle,
}) => {
  // Resolve each card's accent — per-card override wins, otherwise we share
  // the arc color so the loop reads as a single chromatic family.
  const loopCardAccents = loopCards.map((card) =>
    card.accentColor && card.accentColor.length > 0
      ? card.accentColor
      : arcColor,
  );

  // Outlier accent — explicit override wins, otherwise warm-red default.
  const outlierAccent =
    outlierPin?.accentColor && outlierPin.accentColor.length > 0
      ? outlierPin.accentColor
      : DEFAULT_OUTLIER_ACCENT;

  // Pre-build the caption pill so the chassis can drop it into its bottom slot.
  // The pill self-gates by `startFrame`; before that frame it renders nothing.
  const captionNode = caption ? (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      startFrame={TIMING.captionEnterFrame}
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
      {/* Loop cards + arc layered on a full-bleed canvas. Cards sit on top
          of the arc visually (rendered later in DOM order, no z-index needed). */}
      <AbsoluteFill>
        <CircularArc color={arcColor} strokeWidth={arcStrokeWidth} />

        {loopCards.map((card, i) => (
          <LoopCard
            key={`loop-card-${i}`}
            label={card.label}
            accentColor={loopCardAccents[i]}
            centerX={LOOP_CARD_CENTERS[i].x}
            centerY={LOOP_CARD_CENTERS[i].y}
            enterFrame={TIMING.cardEnterFrames[i]}
          />
        ))}

        {outlierPin ? (
          <OutlierPin
            label={outlierPin.label}
            corner={outlierPin.corner}
            accentColor={outlierAccent}
          />
        ) : null}
      </AbsoluteFill>
    </DarkSlateChassis16x9>
  );
};

export default MemeLoopDiagram16x9;
