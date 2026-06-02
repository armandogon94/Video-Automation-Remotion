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

// ─── Schema ──────────────────────────────────────────────────────────────────

export const markerSweepWordSchema = z.object({
  /** Full phrase to display */
  text: z.string().default("Inteligencia Artificial"),
  /** Optional word or substring to accent (bold + slightly larger). Must appear in text. */
  accent: z.string().default("Artificial"),
  /** Color of the highlighter marker bar */
  markerColor: z.string().default("#D4AF37"),
  /** Anchor position on the frame */
  anchor: z
    .enum([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "left",
      "right",
      "lower-third",
    ])
    .default("lower-third"),
  /** Frame on which the entrance animation begins */
  enterFrame: z.number().default(0),
  /** Frames to hold after entrance before exit begins */
  holdFrames: z.number().default(90),
  /** Frame on which the component disappears (defaults to enterFrame + 14 + holdFrames) */
  exitFrame: z.number().optional(),
  /** Accent chip / text color override */
  accentColor: z.string().default("#5BC0E8"),
});

export type MarkerSweepWordProps = z.infer<typeof markerSweepWordSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const SAFE_H = 0.07; // 7 % vertical inset
const SAFE_W = 0.06; // 6 % horizontal inset

// Marker sweep takes this many frames from start
const SWEEP_FRAMES = 14;
// Text fades in slightly after sweep starts
const TEXT_FADE_DELAY = 4;
const TEXT_FADE_FRAMES = 10;

// Exit: fade + slide down over these many frames
const EXIT_FRAMES = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the (justifyContent, alignItems, top/bottom/left/right) style
 * needed to place the chip at the requested anchor, expressed as an
 * AbsoluteFill child position object.
 */
function anchorStyles(
  anchor: MarkerSweepWordProps["anchor"],
  frameW: number,
  frameH: number
): React.CSSProperties {
  const insetX = Math.round(frameW * SAFE_W);
  const insetY = Math.round(frameH * SAFE_H);

  switch (anchor) {
    case "top-left":
      return { top: insetY, left: insetX };
    case "top-right":
      return { top: insetY, right: insetX };
    case "bottom-left":
      return { bottom: insetY, left: insetX };
    case "bottom-right":
      return { bottom: insetY, right: insetX };
    case "left":
      return { top: "50%", left: insetX, transform: "translateY(-50%)" };
    case "right":
      return { top: "50%", right: insetX, transform: "translateY(-50%)" };
    case "lower-third":
    default:
      // Classic lower-third: ~68 % down the frame, left-aligned
      return {
        top: Math.round(frameH * 0.68),
        left: insetX,
      };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const MarkerSweepWord: React.FC<Partial<MarkerSweepWordProps>> = (
  rawProps
) => {
  const p = markerSweepWordSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Local timeline (frames since enterFrame)
  const local = frame - p.enterFrame;

  // Compute exit frame
  const exit = p.exitFrame ?? p.enterFrame + SWEEP_FRAMES + p.holdFrames;

  // Bail when outside active window
  if (frame < p.enterFrame || frame >= exit) return null;

  // ── Exit phase ─────────────────────────────────────────────────────────────
  const exitLocal = frame - (exit - EXIT_FRAMES);
  const isExiting = exitLocal >= 0;

  const exitOpacity = isExiting
    ? interpolate(exitLocal, [0, EXIT_FRAMES], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const exitSlide = isExiting
    ? interpolate(exitLocal, [0, EXIT_FRAMES], [0, 18], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // ── Marker sweep: scaleX 0 → 1 (left-to-right clip) ───────────────────────
  // Use spring for a natural deceleration at the end of the sweep.
  const sweepProgress = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 160 },
    durationInFrames: SWEEP_FRAMES,
  });

  // Slight hand-drawn feel: the bar is skewed and not perfectly rectangular.
  // We encode the skew as a fixed CSS skew — it never animates, just sits there.
  const SKEW_DEG = -2.4; // degrees — subtle, like a real marker stroke

  // ── Text entrance: fade + tiny upward slide ────────────────────────────────
  const textFadeIn = interpolate(
    local,
    [TEXT_FADE_DELAY, TEXT_FADE_DELAY + TEXT_FADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const textSlideUp = interpolate(
    local,
    [TEXT_FADE_DELAY, TEXT_FADE_DELAY + TEXT_FADE_FRAMES],
    [8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Accent word pop (spring scale on the accent word) ─────────────────────
  const accentPop = spring({
    frame: local - (TEXT_FADE_DELAY + 2),
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const accentScale = interpolate(accentPop, [0, 1], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Layout ─────────────────────────────────────────────────────────────────
  const fontSize = Math.round(width * 0.062); // ~67 px at 1080 wide
  const lineHeight = 1.15;
  const paddingV = Math.round(fontSize * 0.28);
  const paddingH = Math.round(fontSize * 0.42);

  // Estimate chip height to position marker bar correctly.
  // We can't measure DOM here, so we calculate: fontSize * lineHeight + 2*paddingV
  const chipHeight = Math.round(fontSize * lineHeight + paddingV * 2);

  // The marker bar is slightly taller than the text line to look painted.
  const markerHeight = Math.round(fontSize * lineHeight * 1.12);
  const markerTop = Math.round((chipHeight - markerHeight) / 2);

  // Chip max width — clamp so long phrases don't overflow safe zone
  const chipMaxWidth = Math.round(width * (1 - SAFE_W * 2 - 0.02));

  // Anchor position
  const position = anchorStyles(p.anchor, width, height);

  // Split text into accent vs non-accent segments for inline rendering
  const accentIdx = p.accent ? p.text.indexOf(p.accent) : -1;
  const hasAccent = accentIdx !== -1 && p.accent.length > 0;

  type Segment = { part: string; isAccent: boolean };
  const segments: Segment[] = hasAccent
    ? [
        { part: p.text.slice(0, accentIdx), isAccent: false },
        { part: p.accent, isAccent: true },
        { part: p.text.slice(accentIdx + p.accent.length), isAccent: false },
      ].filter((s) => s.part.length > 0)
    : [{ part: p.text, isAccent: false }];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Positioned chip */}
      <div
        style={{
          position: "absolute",
          ...position,
          opacity: exitOpacity,
          transform: `translateY(${exitSlide}px)`,
          maxWidth: chipMaxWidth,
        }}
      >
        {/* Outer chip: navy background for legibility over busy footage */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            paddingTop: paddingV,
            paddingBottom: paddingV,
            paddingLeft: paddingH,
            paddingRight: paddingH,
            backgroundColor: "rgba(15, 27, 45, 0.72)", // deep-navy translucent
            borderRadius: 6,
            backdropFilter: "blur(2px)",
            overflow: "hidden", // keeps marker bar clipped inside chip
          }}
        >
          {/* ── Gold marker bar (sweeps left to right) ───────────────────── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: markerTop,
              left: 0,
              width: "100%",
              height: markerHeight,
              backgroundColor: p.markerColor,
              // transformOrigin left so scaleX sweeps from left edge
              transformOrigin: "left center",
              transform: `scaleX(${sweepProgress}) skewY(${SKEW_DEG}deg)`,
              // Slight opacity variation along the bar to mimic ink density
              opacity: 0.82,
              // Rounded right edge only (left snaps flush)
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            }}
          />

          {/* ── Text layer (renders above the marker bar) ─────────────────── */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              opacity: textFadeIn,
              transform: `translateY(${textSlideUp}px)`,
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 0,
              whiteSpace: "pre",
              fontFamily: FONT_STACKS.display,
              fontSize,
              fontWeight: 800,
              lineHeight,
              letterSpacing: "-0.01em",
              // Dark text-shadow for contrast on both light and dark footage
              textShadow:
                "0 1px 4px rgba(0,0,0,0.55), 0 0px 2px rgba(0,0,0,0.40)",
              color: "#FFFFFF",
            }}
          >
            {segments.map((seg, i) =>
              seg.isAccent ? (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    color: "#FFFFFF",
                    transform: `scale(${accentScale})`,
                    transformOrigin: "left bottom",
                    // Extra pop: slight underline in accentColor
                    borderBottom: `3px solid ${p.accentColor}`,
                    paddingBottom: 1,
                  }}
                >
                  {seg.part}
                </span>
              ) : (
                <span key={i}>{seg.part}</span>
              )
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
