/**
 * BrandNameChip — the purpose-made BRAND text chip for R4 brand beats that have
 * no local logo asset (Sol 0716 §2.6 queued item; replaces the borrowed
 * SentimentKeyword in that role).
 *
 * Visual: a gold-bordered liquid-glass pill (LG_THEMES tokens — navy/gold on
 * the `brand` theme, no hardcoded brand hexes) carrying the spoken brand word
 * in Inter bold, with an optional small logo slot (`logoSrc`) beside the word.
 *
 * Motion (liquid-glass two-stage + the standing overlay lifecycle contract):
 *   enterFrame → spring settle-in (scale + fade) → glow BLOOM on the gold rim
 *   → hold `holdFrames` → EXIT FADE over the final frames → hard-cull.
 *
 * Layout: side/corner anchored per the house anchor vocabulary (NEVER center),
 * with all sizes derived as FRACTIONS of the canvas min-dimension via
 * useVideoConfig — the chip reads identically at 1080×1920 and 1920×1080.
 *
 * @dualAspect true — 9:16 AND 16:9 (no absolute px tied to one canvas).
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";
import { glassCardStyle, glassGlow, lgTheme } from "../liquidglass/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

/** Anchor vocabulary shared across all over-speaker molecules. NEVER center. */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);

export const brandNameChipSchema = z.object({
  /**
   * The brand/tool word as SPOKEN (case preserved — "OpenAI", "Skool"; brand
   * wordmarks are case-sensitive, unlike SentimentKeyword's ALL-CAPS punch).
   */
  text: z.string().default("Claude"),

  /** Liquid-glass theme (brand = navy/gold; warm/cool = parity studies). */
  theme: z.enum(["brand", "warm", "cool"]).default("brand"),

  /**
   * Optional small logo slot. Absolute URL, data URI, or /public-relative
   * (routed via staticFile). Empty string → text-only pill.
   */
  logoSrc: z.string().default(""),

  /** Side/corner anchor per house convention. Default 'top-right' (the R4
   *  brand-beat slot, beside the speaker's head). NEVER center. */
  anchor: anchorEnum.default("top-right"),

  /** Frame at which the chip enters. Default 0 (Sequence-relative). */
  enterFrame: z.number().default(0),

  /** Frames to hold at full presence after the settle lands. Default 60. */
  holdFrames: z.number().default(60),

  /**
   * Optional explicit exit frame. If omitted, derived as:
   *   enterFrame + ENTER_FRAMES + holdFrames + EXIT_FRAMES
   */
  exitFrame: z.number().optional(),
});

export type BrandNameChipProps = z.infer<typeof brandNameChipSchema>;

type Anchor = z.infer<typeof anchorEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve a logo src — mirrors BrandGlyphs/BrandLogoPopOverSpeaker: pass
 *  through absolute/data URLs, route the rest through Remotion staticFile. */
function resolveLogoSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

/** Side/corner placement (percent insets scale with either canvas). */
function anchorPlacement(anchor: Anchor, inset: string): React.CSSProperties {
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
      // Canonical lower-third band; percent-based so it holds on both aspects.
      return { ...base, bottom: "24%", left: "50%", transform: "translateX(-50%)" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation constants (deterministic — fixed springs, no randomness)
// ─────────────────────────────────────────────────────────────────────────────

/** Frames for the settle-in (scale spring + fade). */
const ENTER_FRAMES = 10;

/** Frames the gold rim takes to bloom AFTER the card settles. */
const BLOOM_FRAMES = 8;

/** Frames for the exit fade (the standing lifecycle contract). */
const EXIT_FRAMES = 8;

/** Glass settles crisp, not bouncy — lower overshoot than SentimentKeyword. */
const SETTLE_SPRING = { damping: 14, stiffness: 180, mass: 0.8 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const BrandNameChip: React.FC<Partial<BrandNameChipProps>> = (props) => {
  const p = brandNameChipSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Frame local to this element's lifetime.
  const local = frame - p.enterFrame;

  // Derived exit frame (lifecycle contract: enter + settle + hold + exit fade).
  const derivedExit = p.enterFrame + ENTER_FRAMES + p.holdFrames + EXIT_FRAMES;
  const exit = p.exitFrame ?? derivedExit;

  // Hard-cull outside the active window.
  if (frame < p.enterFrame || frame >= exit) return null;

  // ── Aspect-agnostic sizing: fractions of the canvas min-dimension ───────
  // minDim = 1080 on BOTH 1080×1920 and 1920×1080, so the chip is identical.
  const minDim = Math.min(width, height);
  const fontSize = Math.round(minDim * 0.072); // ≈78px at 1080 min-dim
  const padY = Math.round(fontSize * 0.42);
  const padX = Math.round(fontSize * 0.85);
  const gap = Math.round(fontSize * 0.38);
  const logoHeight = Math.round(fontSize * 1.15);
  const borderWidth = Math.max(2, Math.round(minDim * 0.003)); // ≈3px gold rim
  const glowSigma = Math.round(minDim * 0.02);

  // ── Stage 1: settle-in (scale spring + fade) ─────────────────────────────
  const settle = spring({
    frame: local,
    fps,
    config: SETTLE_SPRING,
    durationInFrames: ENTER_FRAMES,
  });
  const scale = Math.max(0, 0.82 + 0.18 * settle);
  const enterOpacity = interpolate(local, [0, ENTER_FRAMES * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Stage 2: glow BLOOM on the gold rim after the card settles ──────────
  const bloom = interpolate(
    local,
    [ENTER_FRAMES, ENTER_FRAMES + BLOOM_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Exit: fade opacity down over EXIT_FRAMES ────────────────────────────
  const exitOpacity = interpolate(frame, [exit - EXIT_FRAMES, exit], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const t = lgTheme(p.theme);
  const card = glassCardStyle({
    theme: p.theme,
    radius: Math.round(fontSize * 1.2), // > half the chip height → true pill
    borderWidth,
    padding: `${padY}px ${padX}px`,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={anchorPlacement(p.anchor, "6%")}>
        <div
          style={{
            ...card,
            display: "flex",
            alignItems: "center",
            gap,
            opacity: enterOpacity * exitOpacity,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            // Keep the token layer's inner sheen, add the animated rim bloom.
            boxShadow: `${String(card.boxShadow)}, ${glassGlow(t.glow, glowSigma, bloom)}`,
          }}
        >
          {p.logoSrc.length > 0 ? (
            <Img
              src={resolveLogoSrc(p.logoSrc)}
              style={{ height: logoHeight, width: "auto", display: "block" }}
            />
          ) : null}
          <span
            style={{
              fontFamily: FONT_STACKS.sans, // Inter
              fontWeight: 700,
              fontSize,
              lineHeight: 1.0,
              letterSpacing: "0.01em",
              color: t.inkOnGlass,
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {p.text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default BrandNameChip;
