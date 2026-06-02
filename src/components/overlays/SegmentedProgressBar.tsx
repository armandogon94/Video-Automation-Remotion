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

// ─── Schema ────────────────────────────────────────────────────────────────

export const segmentedProgressBarSchema = z.object({
  /** Total number of equal segments (1–20). */
  segments: z.number().int().min(1).max(20).default(5),
  /**
   * Overall fill level: 0 = empty, 1 = all segments full.
   * The segment currently being filled animates its partial fill.
   */
  progress: z.number().min(0).max(1).default(0.6),
  /** "top" pins the bar near the top edge; "bottom" pins it near the bottom. */
  anchor: z.enum(["top", "bottom"]).default("top"),
  /** Frame at which the bar slides in. */
  enterFrame: z.number().default(0),
  /** Frames the bar is held fully visible before it exits. */
  holdFrames: z.number().default(120),
  /**
   * Frame at which the bar slides out.
   * Defaults to enterFrame + 16 (entrance) + holdFrames + 12 (exit budget).
   */
  exitFrame: z.number().optional(),
  /** Primary filled-segment colour. */
  accentColor: z.string().default("#5BC0E8"),
  /** Secondary colour shown on alternating filled segments (or same as accent). */
  secondaryColor: z.string().default("#D4AF37"),
  /** Gap between segments as a fraction of one segment width (0–0.5). */
  gapRatio: z.number().min(0).max(0.5).default(0.12),
  /** Height of the bar in px. */
  barHeight: z.number().default(14),
  /** Safe-zone inset on left/right/top-or-bottom edges (px). */
  inset: z.number().default(72),
});

export type SegmentedProgressBarProps = z.infer<
  typeof segmentedProgressBarSchema
>;

// ─── Component ─────────────────────────────────────────────────────────────

const ENTRANCE_FRAMES = 14;
const EXIT_FRAMES = 10;

export const SegmentedProgressBar: React.FC<
  Partial<SegmentedProgressBarProps>
> = (rawProps) => {
  const p = segmentedProgressBarSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const local = frame - p.enterFrame;
  const exitFrame =
    p.exitFrame ?? p.enterFrame + ENTRANCE_FRAMES + p.holdFrames + EXIT_FRAMES;

  // Early/late culling
  if (frame < p.enterFrame || frame >= exitFrame + EXIT_FRAMES) return null;

  // ── Entrance spring (slides in from the chosen edge + fades) ──
  const entranceSpring = spring({
    frame: local,
    fps,
    config: { damping: 26, stiffness: 180 },
    durationInFrames: ENTRANCE_FRAMES,
  });

  const slideDistance = 32; // px
  const translateY = interpolate(
    entranceSpring,
    [0, 1],
    [p.anchor === "top" ? -slideDistance : slideDistance, 0]
  );
  const fadeIn = interpolate(entranceSpring, [0, 1], [0, 1]);

  // ── Exit (slide back + fade out) ──
  const localExit = frame - exitFrame;
  const exitProgress = interpolate(localExit, [0, EXIT_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitTranslate = interpolate(
    exitProgress,
    [0, 1],
    [0, p.anchor === "top" ? -slideDistance : slideDistance]
  );
  const exitFade = interpolate(exitProgress, [0, 1], [1, 0]);

  const opacity = fadeIn * exitFade;
  const translate = translateY + exitTranslate;

  // ── Bar dimensions ──
  const barWidth = width - p.inset * 2;
  const totalGapWidth =
    (p.segments - 1) *
    (barWidth / p.segments) *
    p.gapRatio;
  const segmentWidth = (barWidth - totalGapWidth) / p.segments;
  const gap = p.segments > 1 ? totalGapWidth / (p.segments - 1) : 0;

  // ── Progress fill animation ──
  // Animate the bar's fill from 0 → target progress over the entrance + a
  // short "count-up" period so the partially-filled active segment crawls in.
  const fillAnimDuration = ENTRANCE_FRAMES + Math.round(fps * 0.5);
  const animatedProgress = interpolate(
    local,
    [0, fillAnimDuration],
    [0, p.progress],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Number of completely filled segments + fraction of the active one
  const totalFilled = animatedProgress * p.segments;
  const fullSegments = Math.floor(totalFilled);
  const partialFill = totalFilled - fullSegments; // 0..1

  // ── Positioning ──
  const barPositionStyle: React.CSSProperties =
    p.anchor === "top"
      ? { top: p.inset }
      : { bottom: p.inset };

  // ── Colours ──
  const EMPTY_COLOR = "rgba(255,255,255,0.18)";
  const GLOW_NAVY = "rgba(15,27,45,0.55)";

  // Font stack reference — keeps the import live even if we don't render text
  void (FONT_STACKS.sans as string);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Outer wrapper — handles enter/exit motion */}
      <div
        style={{
          position: "absolute",
          left: p.inset,
          width: barWidth,
          transform: `translateY(${translate}px)`,
          opacity,
          ...barPositionStyle,
        }}
      >
        {/* Subtle dark backing chip for legibility over bright footage */}
        <div
          style={{
            position: "absolute",
            top: -6,
            left: -10,
            right: -10,
            bottom: -6,
            background: GLOW_NAVY,
            borderRadius: p.barHeight + 6,
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Segments row */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: p.barHeight,
            gap,
          }}
        >
          {Array.from({ length: p.segments }).map((_, i) => {
            const isFull = i < fullSegments;
            const isActive = i === fullSegments && partialFill > 0;
            const isEmpty = i > fullSegments;

            // Alternate accent/secondary for visual rhythm on filled segments
            const filledColor =
              i % 2 === 0 ? p.accentColor : p.secondaryColor;

            // Active segment: animate its fill width
            let bgStyle: React.CSSProperties;
            if (isFull) {
              bgStyle = { background: filledColor };
            } else if (isActive) {
              // Split the segment: filled portion left, empty right
              bgStyle = {
                background: `linear-gradient(to right, ${filledColor} ${partialFill * 100}%, ${EMPTY_COLOR} ${partialFill * 100}%)`,
              };
            } else if (isEmpty) {
              bgStyle = { background: EMPTY_COLOR };
            } else {
              bgStyle = { background: EMPTY_COLOR };
            }

            // Glow effect on filled segments
            const boxShadow =
              isFull || isActive
                ? `0 0 6px 1px ${filledColor}66`
                : "none";

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100%",
                  borderRadius: p.barHeight / 2,
                  boxShadow,
                  overflow: "hidden",
                  ...bgStyle,
                }}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
