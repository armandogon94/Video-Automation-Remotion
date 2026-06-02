/**
 * CountUpStat — a big number that counts up from 0 to `target` during the
 * entrance animation, with an optional prefix/suffix and a bold label beneath.
 * Anchored to a side or corner over live talking-head footage.
 *
 * Visual anatomy:
 *   ╭──────────────────────────────────────────╮
 *   │                                          │
 *   │  ┌──────────────────────┐                │
 *   │  │  [prefix]248[suffix] │  ← gold        │
 *   │  │  LABEL TEXT          │  ← white       │
 *   │  └──────────────────────┘                │
 *   │         (navy chip, 72% opacity)         │
 *   ╰──────────────────────────────────────────╯
 *
 * Entrance: chip pops in with a spring scale 0→1 (snappy, 10 frames); the
 * numeral simultaneously counts up from 0 to `target` using an ease-out
 * curve over the entrance window. Hold, then optional fade-out.
 *
 * Brand palette: navy #1B3A6E chip, gold #D4AF37 numeral, white #FFFFFF label.
 *
 * @dualAspect true — transparent AbsoluteFill; side/corner anchored with a 7%
 * safe inset so it works at 9:16 and 16:9.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
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

export const countUpStatSchema = z.object({
  /** The final numeric value the counter reaches. */
  target: z.number().default(248),
  /** Optional string prepended to the numeral (e.g. "$", "+"). */
  prefix: z.string().default(""),
  /** Optional string appended to the numeral (e.g. "%", "x", "M"). */
  suffix: z.string().default("%"),
  /** Bold label rendered beneath the numeral. */
  label: z.string().default("tasa de retención"),
  /** Decimal places to show (0 = integer, 1 = one decimal, etc.). */
  decimals: z.number().int().min(0).max(4).default(0),
  /** Side / corner anchor. NEVER center. */
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
    .default("bottom-left"),
  /** Frame the entrance animation starts. */
  enterFrame: z.number().default(0),
  /** Frames to hold the chip fully visible after the entrance settles. */
  holdFrames: z.number().default(72),
  /** Optional explicit frame to begin the fade-out. Derived when omitted. */
  exitFrame: z.number().optional(),
  /** Numeral color (brand gold or cyan). */
  accentColor: z.string().default("#D4AF37"),
});

export type CountUpStatProps = z.infer<typeof countUpStatSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Anchor helpers
// ─────────────────────────────────────────────────────────────────────────────

type AnchorKey = z.infer<typeof countUpStatSchema.shape.anchor>;

function anchorStyle(anchor: AnchorKey): React.CSSProperties {
  const inset = "7%";
  const base: React.CSSProperties = { position: "absolute" };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset };
    case "top-right":
      return { ...base, top: inset, right: inset };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset };
    case "left":
      return { ...base, top: "50%", left: inset, transform: "translateY(-50%)" };
    case "right":
      return { ...base, top: "50%", right: inset, transform: "translateY(-50%)" };
    case "lower-third":
      // Sits low in the frame, pushed toward the left — speaker typically right.
      return { ...base, bottom: "20%", left: inset };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const CountUpStat: React.FC<Partial<CountUpStatProps>> = (props) => {
  const p = countUpStatSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Number of frames over which the spring pops in + number counts up.
  const ENTER_FRAMES = 14; // ~14 frames for spring to settle (snappy config)
  const FADE_OUT_FRAMES = 10;

  const derivedExit =
    p.enterFrame + ENTER_FRAMES + p.holdFrames + FADE_OUT_FRAMES;
  const effectiveExit = p.exitFrame ?? derivedExit;

  // Outside the active window: render nothing.
  if (frame < p.enterFrame || frame >= effectiveExit) return null;

  const local = frame - p.enterFrame;

  // ── Chip pop-in: spring scale 0 → 1 (snappy, minimal bounce). ────────────
  const chipScale = spring({
    frame: local,
    fps,
    config: { damping: 20, stiffness: 220, mass: 0.8 },
    durationInFrames: ENTER_FRAMES,
  });

  // ── Chip + label fade-in: fade alongside the spring. ─────────────────────
  const fadeIn = interpolate(local, [0, ENTER_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Count-up: numeral eases from 0 → target over ENTER_FRAMES. ───────────
  const countProgress = interpolate(local, [0, ENTER_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const currentValue = countProgress * p.target;
  const displayValue = currentValue.toFixed(p.decimals);

  // ── Block fade-out. ───────────────────────────────────────────────────────
  const blockOpacity = interpolate(
    frame,
    [effectiveExit - FADE_OUT_FRAMES, effectiveExit],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    },
  );

  // ── Layout constants. ─────────────────────────────────────────────────────
  const CHIP_PADDING_H = 36;
  const CHIP_PADDING_V = 24;
  const NUMERAL_SIZE = 96;
  const LABEL_SIZE = 28;
  const NAVY_CHIP = "rgba(27, 58, 110, 0.82)"; // #1B3A6E at 82%

  const placement = anchorStyle(p.anchor);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...placement,
          opacity: blockOpacity,
          transform: `${placement.transform ?? ""} scale(${chipScale})`,
          transformOrigin: (() => {
            // Scale origin tracks the anchor side so it pops from the edge.
            switch (p.anchor) {
              case "top-left":
              case "left":
                return "top left";
              case "top-right":
                return "top right";
              case "bottom-left":
              case "lower-third":
                return "bottom left";
              case "bottom-right":
                return "bottom right";
              case "right":
                return "center right";
            }
          })(),
        }}
      >
        {/* Navy chip card */}
        <div
          style={{
            background: NAVY_CHIP,
            borderRadius: 20,
            paddingTop: CHIP_PADDING_V,
            paddingBottom: CHIP_PADDING_V,
            paddingLeft: CHIP_PADDING_H,
            paddingRight: CHIP_PADDING_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 6,
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)",
            // Thin gold accent border on the left edge.
            borderLeft: `5px solid ${p.accentColor}`,
            opacity: fadeIn,
          }}
        >
          {/* Numeral row: prefix + counting number + suffix */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
              gap: 0,
              lineHeight: 1,
            }}
          >
            {p.prefix ? (
              <span
                style={{
                  fontFamily: FONT_STACKS.condensed,
                  fontWeight: 700,
                  fontSize: Math.round(NUMERAL_SIZE * 0.55),
                  color: p.accentColor,
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  marginRight: 4,
                }}
              >
                {p.prefix}
              </span>
            ) : null}

            <span
              style={{
                fontFamily: FONT_STACKS.condensed,
                fontWeight: 700,
                fontSize: NUMERAL_SIZE,
                color: p.accentColor,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textShadow: "0 2px 16px rgba(0,0,0,0.65)",
                // Fixed character width so digits don't jump during count-up.
                fontVariantNumeric: "tabular-nums",
                minWidth: `${(String(Math.round(p.target)).length + p.decimals + (p.decimals > 0 ? 1 : 0)) * 0.62}em`,
              }}
            >
              {displayValue}
            </span>

            {p.suffix ? (
              <span
                style={{
                  fontFamily: FONT_STACKS.condensed,
                  fontWeight: 700,
                  fontSize: Math.round(NUMERAL_SIZE * 0.55),
                  color: p.accentColor,
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  marginLeft: 2,
                  alignSelf: "flex-end",
                  paddingBottom: Math.round(NUMERAL_SIZE * 0.05),
                }}
              >
                {p.suffix}
              </span>
            ) : null}
          </div>

          {/* Label */}
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: LABEL_SIZE,
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.2,
              textShadow: "0 1px 6px rgba(0,0,0,0.7)",
              maxWidth: 340,
            }}
          >
            {p.label}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default CountUpStat;
