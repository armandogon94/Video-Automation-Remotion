/**
 * GrowthCompareBars — staggered vertical bar chart overlay.
 *
 * Two or three labeled vertical bars grow from a baseline to target heights
 * to compare values. Each bar animates with a staggered spring entrance so the
 * reveal feels dynamic. A value caption sits on top of each bar once grown.
 * Great for before/after or trio comparisons anchored center-low or right over
 * talking-head footage (1080x1920 9:16).
 *
 * Brand: Armando Inteligencia — navy #1B3A6E, gold #D4AF37, cyan #5BC0E8.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

// ─── Brand constants ───────────────────────────────────────────────────────────
const NAVY = "#1B3A6E";
const GOLD = "#D4AF37";
const CYAN = "#5BC0E8";
const DEEP_NAVY = "#0F1B2D";
const WHITE = "#FFFFFF";

// ─── Bar item schema ───────────────────────────────────────────────────────────
const barItemSchema = z.object({
  /** Short label displayed below the bar (e.g. "Antes", "Después"). */
  label: z.string().default(""),
  /**
   * Target fill as a percentage of the bar track, 0–100.
   * 100 = full track height. Use proportional values for meaningful comparison.
   */
  valuePct: z.number().min(0).max(100).default(60),
  /** Value string displayed above the bar top (e.g. "3x", "87%", "2.4M"). */
  valueCaption: z.string().default(""),
  /**
   * Optional fill color for this bar. Falls back to the component's
   * `accentColor` prop when omitted.
   */
  color: z.string().optional(),
});

// ─── Main schema ───────────────────────────────────────────────────────────────
export const growthCompareBarsSchema = z.object({
  /** 2–3 bars to compare. More than 3 will render but may feel crowded. */
  bars: z
    .array(barItemSchema)
    .default([
      { label: "Antes", valuePct: 22, valueCaption: "22%", color: NAVY },
      { label: "Después", valuePct: 87, valueCaption: "87%", color: GOLD },
    ]),
  /**
   * Where to anchor the chart panel.
   * "center-low" places it horizontally centered in the lower 40% of the frame.
   * "right" places it in the right third, vertically centered.
   * "bottom-right" places it at the lower-right corner.
   */
  anchor: z
    .enum(["center-low", "right", "bottom-right"])
    .default("center-low"),
  /** Fallback accent color when a bar does not specify its own color. */
  accentColor: z.string().default(CYAN),
  /**
   * Height of the bar track in px (the tallest bar will reach this height
   * when valuePct === 100). Adjust for layout density.
   */
  trackHeightPx: z.number().default(320),
  /**
   * Width of each bar column in px.
   */
  barWidthPx: z.number().default(72),
  /**
   * Gap between bars in px.
   */
  gapPx: z.number().default(28),
  /** Safe inset from frame edges in px (~7% of 1080px = 75px). */
  insetPx: z.number().default(80),
  /** Optional title line above the chart (e.g. "Tasa de conversión"). */
  title: z.string().default(""),
  /** Frame at which the overlay starts entering. */
  enterFrame: z.number().default(0),
  /** Frames to hold at full visibility after all bars have grown. */
  holdFrames: z.number().default(90),
  /** Optional explicit frame to begin fade-out. Omit for no auto-exit. */
  exitFrame: z.number().optional(),
  /**
   * Per-bar stagger in frames.
   * Bar i begins its grow animation at enterFrame + i * staggerFrames.
   */
  staggerFrames: z.number().default(10),
});

export type GrowthCompareBarsProps = z.infer<typeof growthCompareBarsSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve the CSS absolute placement for the chart wrapper based on the
 * anchor value and edge inset.
 */
function resolveAnchorStyle(
  anchor: "center-low" | "right" | "bottom-right",
  insetPx: number,
): React.CSSProperties {
  switch (anchor) {
    case "right":
      return {
        position: "absolute",
        right: insetPx,
        top: "50%",
        transform: "translateY(-50%)",
      };
    case "bottom-right":
      return {
        position: "absolute",
        right: insetPx,
        bottom: insetPx + 60,
      };
    case "center-low":
    default:
      return {
        position: "absolute",
        bottom: insetPx + 120,
        left: "50%",
        transform: "translateX(-50%)",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GrowthCompareBars: React.FC<Partial<GrowthCompareBarsProps>> = (
  props,
) => {
  const p = growthCompareBarsSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - p.enterFrame;
  const exit = p.exitFrame ?? p.enterFrame + p.holdFrames + 200;

  // Before enter or after exit: render nothing.
  if (frame < p.enterFrame || frame >= exit) return null;

  // Block-level fade-out when exitFrame is defined.
  const blockOpacity =
    p.exitFrame !== undefined
      ? interpolate(frame, [p.exitFrame, p.exitFrame + 12], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  if (blockOpacity <= 0) return null;

  // Overall panel slide-up entrance (all bars share this container entrance).
  const panelSlide = spring({
    frame: local,
    fps,
    config: { damping: 180, stiffness: 120 },
    durationInFrames: 16,
  });
  const panelTranslateY = interpolate(panelSlide, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const anchorStyle = resolveAnchorStyle(p.anchor, p.insetPx);

  // Total panel width so the baseline rule spans all bars.
  const panelWidth =
    p.bars.length * p.barWidthPx + (p.bars.length - 1) * p.gapPx;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          ...anchorStyle,
          opacity: panelOpacity,
          transform: `${anchorStyle.transform ?? ""} translateY(${panelTranslateY}px)`.trim(),
        }}
      >
        {/* Optional title above chart */}
        {p.title ? (
          <div
            style={{
              fontFamily: FONT_STACKS.condensed,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: WHITE,
              textShadow: `0 2px 8px rgba(0,0,0,0.7), 0 0 2px ${DEEP_NAVY}`,
              textAlign: "center",
              marginBottom: 14,
              width: panelWidth,
              whiteSpace: "nowrap",
            }}
          >
            {p.title}
          </div>
        ) : null}

        {/* Chart area: bars sit side by side, growing from the bottom */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: p.gapPx,
            height: p.trackHeightPx + 64, // +64 for the value caption above bars
            position: "relative",
          }}
        >
          {p.bars.map((bar, i) => {
            const barColor = bar.color ?? p.accentColor;
            const targetH = Math.max(4, (bar.valuePct / 100) * p.trackHeightPx);

            // Staggered spring for this bar's grow.
            const barLocal = local - i * p.staggerFrames;
            const growSpring = spring({
              frame: Math.max(0, barLocal),
              fps,
              config: { damping: 22, stiffness: 140, mass: 0.9 },
              durationInFrames: 18,
            });
            const barHeight = barLocal <= 0 ? 0 : interpolate(
              growSpring,
              [0, 1],
              [0, targetH],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );

            // Value caption fades in once the bar is mostly grown (~12 frames
            // after bar local start).
            const captionOpacity =
              barLocal <= 0
                ? 0
                : interpolate(barLocal, [10, 18], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });

            // Subtle scale pop for the value caption on entry.
            const captionScale =
              barLocal <= 0
                ? 0.7
                : interpolate(
                    spring({
                      frame: Math.max(0, barLocal - 10),
                      fps,
                      config: { damping: 16, stiffness: 200, mass: 0.5 },
                      durationInFrames: 12,
                    }),
                    [0, 1],
                    [0.7, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  );

            return (
              <div
                key={`bar-col-${i}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: p.barWidthPx,
                  position: "relative",
                  height: p.trackHeightPx + 64,
                  justifyContent: "flex-end",
                }}
              >
                {/* Value caption above bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: p.trackHeightPx + 8 - (p.trackHeightPx - targetH),
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    opacity: captionOpacity,
                    transform: `scale(${captionScale})`,
                    transformOrigin: "center bottom",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_STACKS.display,
                      fontWeight: 900,
                      fontSize: 26,
                      color: WHITE,
                      textShadow: `0 2px 8px rgba(0,0,0,0.8), 0 0 1px ${DEEP_NAVY}`,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {bar.valueCaption}
                  </span>
                </div>

                {/* The bar itself — grows upward from the baseline */}
                <div
                  style={{
                    width: p.barWidthPx,
                    height: barHeight,
                    borderRadius: "8px 8px 3px 3px",
                    background: `linear-gradient(to top, ${barColor}CC, ${barColor})`,
                    boxShadow: `0 4px 18px ${barColor}66, inset 0 1px 0 rgba(255,255,255,0.18)`,
                    transition: "none",
                    flexShrink: 0,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Subtle inner highlight strip */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      width: "30%",
                      height: "100%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)",
                      borderRadius: "8px 8px 0 0",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Baseline rule */}
        <div
          style={{
            width: panelWidth,
            height: 3,
            background: `linear-gradient(to right, ${NAVY}80, ${CYAN}CC, ${NAVY}80)`,
            borderRadius: 2,
            marginTop: 0,
          }}
        />

        {/* Labels row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: p.gapPx,
            marginTop: 10,
          }}
        >
          {p.bars.map((bar, i) => {
            const labelOpacity =
              local - i * p.staggerFrames <= 0
                ? 0
                : interpolate(
                    local - i * p.staggerFrames,
                    [2, 12],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  );

            return (
              <div
                key={`bar-label-${i}`}
                style={{
                  width: p.barWidthPx,
                  display: "flex",
                  justifyContent: "center",
                  opacity: labelOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 700,
                    fontSize: 20,
                    color: WHITE,
                    textShadow: `0 1px 6px rgba(0,0,0,0.8)`,
                    textAlign: "center",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    background: `${DEEP_NAVY}CC`,
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default GrowthCompareBars;
