/**
 * SentimentKeyword — a 1-3 word ALL-CAPS keyword that scale-pops in with
 * overshoot and a THICK contrasting stroke (not glow). Color-coded by a
 * `tone` prop enum so the viewer reads the sentiment before the word lands.
 *
 *   tone="topic"    → cyan   #5BC0E8  (informational beat)
 *   tone="positive" → gold   #D4AF37  (win / growth / benefit)
 *   tone="neutral"  → navy   #1B3A6E  (definition / context)
 *   tone="alert"    → red    #E50914  (risk / warning / contrast)
 *
 * Layout: anchored lower-third / bottom, 7% inset from frame edges.
 * Entrance: spring scale-pop 0 → 1.0 with overshoot (damping=8 = bouncy).
 * Hold + optional exit fade.
 *
 * Use case: punch a single spoken word to camera on a 1080×1920 vertical
 * talking-head reel. Drop it inside any <Sequence> — frame is relative.
 *
 * @dualAspect false — 9:16 only (lower-third y-pos is hardcoded for 1920px).
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

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

export const sentimentKeywordSchema = z.object({
  /**
   * The keyword text (1-3 words). Rendered ALL-CAPS internally so you can pass
   * mixed-case from the timeline and the visual stays consistent.
   */
  text: z.string().default("RENTABLE"),

  /**
   * Sentiment tone — controls fill color and stroke color.
   *   topic    → cyan  fill  + deep-navy stroke  (informational)
   *   positive → gold  fill  + deep-navy stroke  (win / growth)
   *   neutral  → navy  fill  + white stroke      (definition)
   *   alert    → red   fill  + white stroke      (risk / warning)
   */
  tone: z
    .enum(["topic", "positive", "neutral", "alert"])
    .default("positive"),

  /**
   * Horizontal + vertical anchor for the chip block. NEVER center.
   * Default 'lower-third' (bottom-center band, ~24% from bottom).
   */
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

  /** Frame at which the keyword enters. Default 0. */
  enterFrame: z.number().default(0),

  /**
   * How many frames to hold at full scale after the pop lands.
   * Default 72 (3 s @ 24 fps).
   */
  holdFrames: z.number().default(72),

  /**
   * Optional explicit exit frame. If omitted, derived as:
   *   enterFrame + POP_IN_FRAMES + holdFrames + EXIT_FRAMES
   */
  exitFrame: z.number().optional(),

  /**
   * Accent / fill color override. When provided, overrides the tone fill color
   * (the stroke still comes from the tone). Useful for one-off brand moments.
   */
  /** Explicit fill override. Empty string → use the tone's fill color. */
  accentColor: z.string().default(""),
});

export type SentimentKeywordProps = z.infer<typeof sentimentKeywordSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Tone palette
// ─────────────────────────────────────────────────────────────────────────────

interface ToneColors {
  fill: string;
  stroke: string;
  /** Text rendered on top of the chip — always white or deep-navy for contrast. */
  text: string;
  /** Translucent backing chip color (dark scrim behind the letterforms). */
  chip: string;
}

const TONE_MAP: Record<SentimentKeywordProps["tone"], ToneColors> = {
  topic: {
    fill: "#5BC0E8",      // brand cyan
    stroke: "#0F1B2D",    // deep-navy — max contrast against cyan
    text: "#0F1B2D",
    chip: "rgba(15,27,45,0.72)",
  },
  positive: {
    fill: "#D4AF37",      // brand gold
    stroke: "#0F1B2D",    // deep-navy
    text: "#0F1B2D",
    chip: "rgba(15,27,45,0.72)",
  },
  neutral: {
    fill: "#1B3A6E",      // brand navy
    stroke: "#FFFFFF",    // white stroke pops on dark
    text: "#FFFFFF",
    chip: "rgba(255,255,255,0.08)",
  },
  alert: {
    fill: "#E50914",      // signal red
    stroke: "#FFFFFF",
    text: "#FFFFFF",
    chip: "rgba(15,27,45,0.72)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Anchor positioning helper
// ─────────────────────────────────────────────────────────────────────────────

type AnchorValue = SentimentKeywordProps["anchor"];

function anchorStyle(anchor: AnchorValue): React.CSSProperties {
  // Safe inset ~7% so the chip never bleeds into unsafe zones.
  const edgePct = "7%";
  const base: React.CSSProperties = {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  switch (anchor) {
    case "top-left":
      return { ...base, top: edgePct, left: edgePct };
    case "top-right":
      return { ...base, top: edgePct, right: edgePct };
    case "bottom-left":
      return { ...base, bottom: edgePct, left: edgePct };
    case "bottom-right":
      return { ...base, bottom: edgePct, right: edgePct };
    case "left":
      return { ...base, top: "45%", left: edgePct, transform: "translateY(-50%)" };
    case "right":
      return { ...base, top: "45%", right: edgePct, transform: "translateY(-50%)" };
    case "lower-third":
      // Sits ~24% from the bottom — the canonical "lower third" band on 9:16.
      return { ...base, bottom: "24%", left: "50%", transform: "translateX(-50%)" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation constants
// ─────────────────────────────────────────────────────────────────────────────

/** Frames for the spring pop-in (0 → 1.0 with overshoot). */
const POP_IN_FRAMES = 10;

/** Frames for the fade-out exit. */
const EXIT_FRAMES = 6;

/**
 * Spring config: damping=8 gives a pronounced bouncy overshoot that reads as
 * "punch" on a fast caption cut. stiffness=220 keeps it snappy.
 */
const POP_SPRING = { damping: 8, stiffness: 220, mass: 0.7 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const SentimentKeyword: React.FC<Partial<SentimentKeywordProps>> = (
  props,
) => {
  const p = sentimentKeywordSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame local to this element's lifetime.
  const local = frame - p.enterFrame;

  // Derived exit frame.
  const derivedExit = p.enterFrame + POP_IN_FRAMES + p.holdFrames + EXIT_FRAMES;
  const exit = p.exitFrame ?? derivedExit;

  // Hard-cull outside active window.
  if (frame < p.enterFrame || frame >= exit) return null;

  // ── Scale-pop entrance (spring, bouncy overshoot) ──────────────────────
  const popScale = spring({
    frame: local,
    fps,
    config: POP_SPRING,
    durationInFrames: POP_IN_FRAMES,
  });
  // Clamp min so the chip never renders at a negative scale during frame 0.
  const scale = Math.max(0, popScale);

  // ── Exit: fade opacity down over EXIT_FRAMES ───────────────────────────
  const opacity = interpolate(
    frame,
    [exit - EXIT_FRAMES, exit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Tone colors ────────────────────────────────────────────────────────
  const toneColors = TONE_MAP[p.tone];

  // When an explicit accentColor is provided it overrides the tone fill only
  // (not the stroke — the stroke is the legibility anchor).
  const fillColor = p.accentColor !== "" ? p.accentColor : toneColors.fill;

  // Stroke width: thick — ~6% of font-size equivalent at 120px = ~7px.
  // We replicate a stroke via a multi-layer text-shadow (one shadow per
  // cardinal direction + diagonals) because CSS paint-order / WebKit-stroke
  // is not available in Remotion's headless renderer. 8 directions × 4px
  // offset produce a solid 4px stroke on all sides.
  const sw = 5; // half-stroke radius in px
  const stroke = toneColors.stroke;
  const textShadow = [
    // Cardinal
    `${sw}px 0 0 ${stroke}`,
    `-${sw}px 0 0 ${stroke}`,
    `0 ${sw}px 0 ${stroke}`,
    `0 -${sw}px 0 ${stroke}`,
    // Diagonals
    `${sw}px ${sw}px 0 ${stroke}`,
    `-${sw}px ${sw}px 0 ${stroke}`,
    `${sw}px -${sw}px 0 ${stroke}`,
    `-${sw}px -${sw}px 0 ${stroke}`,
    // Slightly wider for solidity (fills corners)
    `${sw + 1}px ${sw + 1}px 0 ${stroke}`,
    `-${sw + 1}px ${sw + 1}px 0 ${stroke}`,
    `${sw + 1}px -${sw + 1}px 0 ${stroke}`,
    `-${sw + 1}px -${sw + 1}px 0 ${stroke}`,
  ].join(", ");

  const keyword = p.text.toUpperCase();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={anchorStyle(p.anchor)}>
        {/* Outer wrapper: opacity (exit fade) + scale (spring pop) applied here
            so both transforms compose on the same element — no double stacking. */}
        <div
          style={{
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            // Translucent navy chip behind the letterforms for legibility over
            // any footage background. The chip background is separate from the
            // text fill so dark-tone keywords still read on dark B-roll.
            background: toneColors.chip,
            borderRadius: 12,
            // Asymmetric padding: more horizontal so the chip breathes.
            padding: "14px 28px",
            // Thin inner border in the fill color so the chip silhouette reads
            // even when chip bg blends into footage.
            boxShadow: `0 0 0 3px ${fillColor}`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.display,
              fontWeight: 900,
              fontSize: 120,
              lineHeight: 1.0,
              letterSpacing: "0.04em",
              color: fillColor,
              textShadow,
              whiteSpace: "nowrap",
              // Prevent the browser from collapsing letter-spacing at render time.
              display: "inline-block",
            }}
          >
            {keyword}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SentimentKeyword;
