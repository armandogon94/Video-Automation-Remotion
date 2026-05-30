/**
 * FlipChartLiveDrawing16x9 — the "live-drawing flip-chart pad" composition.
 *
 * Convergence of TWO independent 16:9 patterns:
 *
 *   • Alex Hormozi NEW-H8 `FlipChartLiveDrawing`
 *     (references/creators/alexhormozi/ANALYSIS.md §415–423, promoted from 2
 *     independent videos `8C_6qojTA78`, `jqo0lVveh98`): a standing easel with a
 *     large white paper flipchart pad parked stage-right; Hormozi hand-writes
 *     labels (`WHO? METRICS? MARKET? MODEL? MONEY?`, then sub-lists `LEADS,
 *     SALES, OPS…`) in green and black sharpie LIVE during the talk. The spec's
 *     transitionVerb: "reveal one bullet label per beat using stroke-dashoffset
 *     on a pre-traced SVG path that mimics sharpie handwriting; jitter stroke
 *     width ±0.4px to feel hand-drawn; alternate two marker colors … never
 *     animate camera — it's an in-scene prop, not an overlay."
 *
 *   • Matt Wolfe (mreflow) easel pattern
 *     (references/creators/mreflow/ANALYSIS.md §423 cross-ref + soft drop-shadow
 *     "magnified card" idiom from §31/§103): side-view easels for tech-explainer
 *     panels, plus the soft-drop-shadow card-over-surface look from his
 *     `<MagnifiedPullQuoteCard>`.
 *
 * The H8 spec is filmed B-roll (a physical easel beside the talker). For an
 * in-template procedural version we keep the SOUL of it — a cream pad over the
 * dark slate, hand-drawn marker labels that reveal one-by-one via SVG
 * stroke-dashoffset, the marker-underline "live drawing" feel — but present the
 * pad center-stage rather than as a far-right edge prop, so it reads as the
 * focal surface in a standalone card. Editorial, not cartoonish: subtle binding
 * clip + drop shadow, marker gold accent, no camera move.
 *
 * Wraps `DarkSlateChassis16x9` (Wave-7 Batch-3 base look) for the slate backplate
 * + persistent `@armandointeligencia` handle chip.
 *
 * Default timing (180f @ 30fps = 6.0s):
 *   0–14f    pad drops/settles onto the slate (scale + fade), binding clip lands
 *   10–26f   title fades/wipes in like marker ink, title underline draws L→R
 *   28f→…    items reveal one-by-one (text wipe + hand-drawn mark) on a stagger
 *            that distributes evenly across the remaining frames before fade-out
 *   last 12f everything fades out together
 *
 * Stagger math: reveals are spread so the LAST item finishes drawing with a
 * safety margin before FADE_OUT, regardless of `items.length` (2–5) or
 * `durationFrames`. See `computeItemSchedule`.
 */
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema — every field `.default()`ed so it renders with zero props.
// ─────────────────────────────────────────────────────────────────────────────

export const flipChartLiveDrawingSchema = z.object({
  /** Pad title, written at the top like a sharpie heading. */
  title: z.string().default("WHO? METRICS? MARKET?"),
  /**
   * 2–5 bullet/sketch labels that reveal one-by-one as if drawn live.
   * `emphasis` swaps the marker color (categories vs. body, per H8).
   */
  items: z
    .array(
      z.object({
        text: z.string(),
        emphasis: z.boolean().optional(),
      }),
    )
    .default([
      { text: "LEADS", emphasis: true },
      { text: "SALES" },
      { text: "OPS" },
      { text: "FULFILLMENT" },
    ]),
  /** Marker-style accent color. Default brand gold. */
  markerColor: z.string().default(BRAND.colors.accent),
  handle: z.string().default("@armandointeligencia"),
  /** Total composition length in frames. Default 180 = 6.0s @ 30fps. */
  durationFrames: z.number().default(180),
  transitionVerb: z
    .string()
    .default(
      "Settle a cream flip-chart pad onto the slate, write the title as marker ink with a hand-drawn underline, then reveal each bullet one-by-one with a text wipe and a stroke-dashoffset sharpie mark; jitter feels hand-drawn; never move the camera.",
    ),
});

export type FlipChartLiveDrawing16x9Props = z.infer<
  typeof flipChartLiveDrawingSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing constants (frames). Item schedule is derived from durationFrames so
// the reveal cadence always fits the available length.
// ─────────────────────────────────────────────────────────────────────────────

const PAD_SETTLE = { start: 0, end: 14 } as const;
const TITLE_INK = { start: 10, end: 26 } as const;
const TITLE_UNDERLINE = { start: 18, end: 34 } as const;
const ITEMS_START = 30;
const FADE_OUT_TAIL_FRAMES = 12;
/** Frames each item takes to draw (text wipe + mark). */
const ITEM_DRAW_FRAMES = 16;
const PAD_TRANSLATE_Y_PX = 28;

/**
 * Distribute item reveals evenly between `ITEMS_START` and the start of the
 * fade-out, leaving each item room to fully draw (`ITEM_DRAW_FRAMES`) before the
 * tail. Works for any 2–5 items and any reasonable `durationFrames`.
 */
function computeItemSchedule(
  itemCount: number,
  durationFrames: number,
): { start: number; end: number }[] {
  const fadeOutStart = durationFrames - FADE_OUT_TAIL_FRAMES;
  // Window in which the LAST item must START so it finishes before the tail.
  const lastItemLatestStart = Math.max(
    ITEMS_START,
    fadeOutStart - ITEM_DRAW_FRAMES,
  );
  const span = lastItemLatestStart - ITEMS_START;
  // Even stagger; guard div-by-zero when there is a single item.
  const step = itemCount > 1 ? span / (itemCount - 1) : 0;
  return Array.from({ length: itemCount }, (_, i) => {
    const start = Math.round(ITEMS_START + step * i);
    return { start, end: start + ITEM_DRAW_FRAMES };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const FlipChartLiveDrawing16x9: React.FC<
  FlipChartLiveDrawing16x9Props
> = ({ title, items, markerColor, handle, durationFrames }) => {
  const frame = useCurrentFrame();

  // Clamp to 2–5 items so layout + stagger stay legible (per H8 evidence).
  const visibleItems = items.slice(0, 5);

  const schedule = computeItemSchedule(visibleItems.length, durationFrames);

  // Global fade-out tail — applied as a multiplier to everything.
  const fadeOut = interpolate(
    frame,
    [durationFrames - FADE_OUT_TAIL_FRAMES, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Pad: scale-in + drop from above + fade as it "settles" onto the slate.
  const padIn = interpolate(frame, [PAD_SETTLE.start, PAD_SETTLE.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const padScale = interpolate(padIn, [0, 1], [0.94, 1]);
  const padY = interpolate(padIn, [0, 1], [PAD_TRANSLATE_Y_PX, 0]);
  const padOpacity = padIn * fadeOut;

  // Title "ink": opacity + a left-to-right wipe to simulate marker writing.
  const titleInk = interpolate(frame, [TITLE_INK.start, TITLE_INK.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  // Title underline: stroke-dashoffset draw L→R (hand-drawn marker stroke).
  const titleUnderlineDraw = interpolate(
    frame,
    [TITLE_UNDERLINE.start, TITLE_UNDERLINE.end],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <DarkSlateChassis16x9 handleChip={{ text: handle }}>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        {/* ── The flip-chart / easel pad: cream paper over the slate ──────── */}
        <div
          style={{
            position: "relative",
            opacity: padOpacity,
            transform: `translateY(${padY}px) scale(${padScale})`,
            transformOrigin: "top center",
            width: 1280,
            minHeight: 720,
            backgroundColor: "#FBF7EC",
            borderRadius: 10,
            // Soft drop-shadow reads as a physical page lifted off the slate
            // (Matt Wolfe magnified-card idiom).
            boxShadow:
              "0 28px 60px rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.06) inset",
            padding: "92px 96px 80px",
            display: "flex",
            flexDirection: "column",
            // Faint ruled-paper feel without being cartoonish.
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 47px, rgba(27,58,110,0.05) 47px, rgba(27,58,110,0.05) 48px)",
          }}
        >
          {/* Binding / clip at the top of the pad. */}
          <PadBinding />

          {/* Title written as marker ink, with a hand-drawn underline. */}
          <div style={{ position: "relative", marginBottom: 56 }}>
            <div
              style={{
                // Wipe in left-to-right to simulate the marker laying down ink.
                clipPath: `inset(0 ${(1 - titleInk) * 100}% 0 0)`,
                fontFamily: FONT_STACKS.sans,
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                lineHeight: 1.05,
                color: BRAND.colors.primary,
              }}
            >
              {title}
            </div>
            {/* Underline: a single hand-drawn marker stroke (stroke-dashoffset). */}
            <svg
              width="100%"
              height="22"
              viewBox="0 0 1000 22"
              preserveAspectRatio="none"
              style={{ display: "block", marginTop: 10, overflow: "visible" }}
            >
              <path
                d="M4 13 C 180 4, 360 19, 540 10 S 880 5, 996 12"
                fill="none"
                stroke={markerColor}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={titleUnderlineDraw}
              />
            </svg>
          </div>

          {/* ── Bullet labels: revealed one-by-one as if drawn live ───────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            {visibleItems.map((item, i) => (
              <FlipChartItem
                key={`${i}-${item.text}`}
                text={item.text}
                emphasis={item.emphasis ?? false}
                markerColor={markerColor}
                frame={frame}
                start={schedule[i].start}
                end={schedule[i].end}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </DarkSlateChassis16x9>
  );
};

export default FlipChartLiveDrawing16x9;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The binding/clip strip at the top edge of the pad — a slim slate bar with two
 * rings, so the cream page reads as a sheet clamped to an easel.
 */
const PadBinding: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: 220,
      height: 18,
      borderRadius: 9,
      backgroundColor: BRAND.colors.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: "#FBF7EC",
        opacity: 0.85,
      }}
    />
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: "#FBF7EC",
        opacity: 0.85,
      }}
    />
  </div>
);

interface FlipChartItemProps {
  text: string;
  emphasis: boolean;
  markerColor: string;
  frame: number;
  start: number;
  end: number;
  index: number;
}

/**
 * A single bullet label. Reveals in two beats:
 *   1. text wipes in L→R (marker ink), riding up a few px as it lands;
 *   2. a hand-drawn mark (a sharpie tick for emphasis items, a short underline
 *      otherwise) draws via stroke-dashoffset.
 * Body items use the brand primary navy ("black sharpie"); emphasis items use
 * the marker color ("green/category sharpie" in the H8 evidence).
 */
const FlipChartItem: React.FC<FlipChartItemProps> = ({
  text,
  emphasis,
  markerColor,
  frame,
  start,
  end,
  index,
}) => {
  const inkMid = start + Math.round((end - start) * 0.6);

  // Text wipe (ink laying down) over the first ~60% of the draw window.
  const wipe = interpolate(frame, [start, inkMid], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  // Slight rise as the label lands.
  const riseY = interpolate(frame, [start, inkMid], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Hand-drawn mark draws over the back ~40% of the window.
  const markDraw = interpolate(frame, [inkMid, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const textColor = emphasis ? markerColor : BRAND.colors.primary;
  // Faux hand-drawn jitter: tiny per-item baseline tilt so the list isn't
  // mechanically straight (the H8 "feels hand-drawn" note).
  const tilt = (index % 2 === 0 ? -1 : 1) * 0.4;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        transform: `translateY(${riseY}px) rotate(${tilt}deg)`,
      }}
    >
      {/* Marker bullet dot. */}
      <span
        style={{
          flex: "0 0 auto",
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: markerColor,
          opacity: wipe,
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
            fontFamily: FONT_STACKS.sans,
            fontSize: 52,
            fontWeight: emphasis ? 800 : 600,
            letterSpacing: emphasis ? "0.02em" : "0",
            color: textColor,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
        {/* Emphasis items get a circled-ish sharpie underline; body items a
            short flat marker tick. Both via stroke-dashoffset. */}
        <svg
          width="100%"
          height="16"
          viewBox="0 0 600 16"
          preserveAspectRatio="none"
          style={{ display: "block", marginTop: 6, overflow: "visible" }}
        >
          <path
            d={
              emphasis
                ? "M6 9 C 140 2, 320 14, 470 7 S 560 5, 594 9"
                : "M6 9 C 120 6, 260 11, 360 8"
            }
            fill="none"
            stroke={emphasis ? markerColor : BRAND.colors.muted}
            strokeWidth={emphasis ? 6 : 4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={markDraw}
          />
        </svg>
      </div>
    </div>
  );
};
