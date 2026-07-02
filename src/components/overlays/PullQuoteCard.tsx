/**
 * PullQuoteCard — editorial serif pull-quote overlay for 1080×1920 talking-head reels.
 *
 * Layout:
 *   ┌─────────────────────────────┐
 *   │  " (oversized gold glyph)   │
 *   │  Quote text (Playfair,      │
 *   │  serif italic, multi-line)  │
 *   │  ─────────────────────────  │
 *   │  — Nombre Apellido          │
 *   └─────────────────────────────┘
 *
 * Anchored center-low (bottom ~14% inset, left 7% inset).
 * Entrance: each word fades + rises in quick succession (~4 frames stagger).
 * Accent: oversized translucent gold quotation mark behind the first word.
 * Legibility: translucent navy chip (#1B3A6E at ~88%) behind the whole card.
 *
 * SHARED OVERLAY CONTRACT:
 *  - Transparent AbsoluteFill, pointerEvents:'none', NEVER dead-center.
 *  - Inline zod schema, every field .default()ed.
 *  - enterFrame / holdFrames / optional exitFrame timing props.
 *  - Animation driven by useCurrentFrame() only — no CSS transitions.
 *
 * @dualAspect true — anchored inside a transparent AbsoluteFill.
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
import { BRAND, FONT_STACKS } from "../../brand";

// ─── Brand palette (from the brand token; WHITE is a non-brand text color) ────
const NAVY = BRAND.colors.primary;
const GOLD = BRAND.colors.accent;
const DEEP_NAVY = BRAND.colors.backgroundDark;
const WHITE = "#FFFFFF";

// ─── Schema ──────────────────────────────────────────────────────────────────

export const pullQuoteCardSchema = z.object({
  /** The pull-quote text. Can contain spaces; rendered word-by-word. */
  quote: z.string().default("La inteligencia artificial no reemplaza al humano — lo amplifica."),
  /** Attribution line shown below the rule (the "— Nombre" line). */
  author: z.string().default("Armando González"),
  /**
   * Anchor position for the card block. NEVER dead-center.
   * center-low = bottom of frame, left-inset (editorial default).
   */
  anchor: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right", "left", "right", "lower-third"])
    .default("lower-third"),
  /** Frame on which the entrance animation begins. */
  enterFrame: z.number().default(0),
  /** Frames to hold after the last word has settled. */
  holdFrames: z.number().default(90),
  /** Explicit exit frame. Omit to derive from enter + words + hold. */
  exitFrame: z.number().optional(),
  /** Gold accent color for the decorative quotation glyph and rule. */
  accentColor: z.string().default(GOLD),
  /** Card background color (translucent navy chip). */
  chipColor: z.string().default(NAVY),
  /** Max width of the card as a fraction of the composition width (0–1). */
  maxWidthFraction: z.number().default(0.78),
});

export type PullQuoteCardProps = z.infer<typeof pullQuoteCardSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Anchor = PullQuoteCardProps["anchor"];

/** Resolve absolute CSS position for the card wrapper. Never center. */
function resolveAnchor(anchor: Anchor): React.CSSProperties {
  // Safe inset: 7% horizontal, 7% vertical from frame edges.
  const hInset = "7%";
  const vTop = "7%";
  const vBot = "7%";
  const base: React.CSSProperties = { position: "absolute" };

  switch (anchor) {
    case "top-left":
      return { ...base, top: vTop, left: hInset };
    case "top-right":
      return { ...base, top: vTop, right: hInset };
    case "bottom-left":
      return { ...base, bottom: vBot, left: hInset };
    case "bottom-right":
      return { ...base, bottom: vBot, right: hInset };
    case "left":
      return { ...base, top: "42%", left: hInset };
    case "right":
      return { ...base, top: "42%", right: hInset };
    case "lower-third":
    default:
      // Editorial default: left-anchored, bottom 14% — the "center-low" position.
      return { ...base, bottom: "14%", left: hInset };
  }
}

/** True when anchor sits on the right edge (text aligns right). */
function isRightAnchor(anchor: Anchor): boolean {
  return anchor === "top-right" || anchor === "bottom-right" || anchor === "right";
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PullQuoteCard: React.FC<Partial<PullQuoteCardProps>> = (props) => {
  const p = pullQuoteCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const local = frame - p.enterFrame;

  // Word-level stagger: ~4 frames between each word entering.
  const words = p.quote.split(/\s+/).filter((w) => w.length > 0);
  const WORD_STAGGER = 4;
  const WORD_ENTER = 10; // spring settle duration per word (frames)
  const AUTHOR_DELAY = words.length * WORD_STAGGER + WORD_ENTER + 6;
  const AUTHOR_ENTER = 10;
  const CHIP_ENTER = 8; // chip fades in first, faster than words

  // Derive exit frame from timing if not explicit.
  const derivedExit =
    p.enterFrame + AUTHOR_DELAY + AUTHOR_ENTER + p.holdFrames + 12;
  const effectiveExit = p.exitFrame ?? derivedExit;

  // Cull outside of active window.
  if (frame < p.enterFrame || frame >= effectiveExit) return null;

  // Exit: fade + slide down over last 12 frames.
  const EXIT_DUR = 12;
  const exitStart = effectiveExit - EXIT_DUR;
  const exitProgress = interpolate(frame, [exitStart, effectiveExit], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = 1 - exitProgress;
  const exitY = interpolate(exitProgress, [0, 1], [0, 32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chip (background card) fade-in.
  const chipOpacity = interpolate(local, [0, CHIP_ENTER], [0, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Decorative quotation glyph opacity (lags chip by a couple frames, more opaque).
  const glyphOpacity = interpolate(local, [CHIP_ENTER, CHIP_ENTER + 10], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Attribution line entrance spring (after last word).
  const authorLocal = local - AUTHOR_DELAY;
  const authorSpring = spring({
    frame: authorLocal,
    fps,
    config: { damping: 200 },
    durationInFrames: AUTHOR_ENTER,
  });
  const authorOpacity = interpolate(authorSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorY = interpolate(authorSpring, [0, 1], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rule line (horizontal divider) width expands left→right after first words settle.
  const ruleLocal = local - (words.length * WORD_STAGGER + WORD_ENTER);
  const ruleProgress = spring({
    frame: ruleLocal,
    fps,
    config: { damping: 200 },
    durationInFrames: 14,
  });

  const placement = resolveAnchor(p.anchor);
  const rightSide = isRightAnchor(p.anchor);
  const cardMaxWidth = Math.round(width * p.maxWidthFraction);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Outer wrapper: placement + exit animation */}
      <div
        style={{
          ...placement,
          maxWidth: cardMaxWidth,
          opacity: exitOpacity,
          transform: `translateY(${exitY}px)`,
        }}
      >
        {/* Chip: translucent navy background */}
        <div
          style={{
            position: "relative",
            background: DEEP_NAVY,
            opacity: chipOpacity,
            borderRadius: 14,
            padding: "28px 36px 32px 36px",
            boxSizing: "border-box",
            // Left border accent rule
            borderLeft: rightSide ? "none" : `4px solid ${p.accentColor}`,
            borderRight: rightSide ? `4px solid ${p.accentColor}` : "none",
          }}
        >
          {/* Decorative oversized gold quotation glyph */}
          <div
            style={{
              position: "absolute",
              top: -12,
              left: rightSide ? "auto" : 24,
              right: rightSide ? 24 : "auto",
              fontFamily: FONT_STACKS.serif,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 180,
              lineHeight: 1,
              color: p.accentColor,
              opacity: glyphOpacity / chipOpacity || 0,
              userSelect: "none",
              pointerEvents: "none",
              // Prevent glyph from affecting layout
              zIndex: 0,
            }}
          >
            &ldquo;
          </div>

          {/* Quote text: word-by-word animated entrance */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              fontFamily: FONT_STACKS.serif,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 1.28,
              color: WHITE,
              textAlign: rightSide ? "right" : "left",
              // Legibility shadow over busy footage
              textShadow: `0 2px 8px rgba(0,0,0,0.65)`,
              display: "flex",
              flexWrap: "wrap",
              gap: "0 12px",
              justifyContent: rightSide ? "flex-end" : "flex-start",
            }}
          >
            {words.map((word, i) => (
              <AnimatedWord
                key={`word-${i}`}
                word={word}
                index={i}
                local={local}
                fps={fps}
                stagger={WORD_STAGGER}
                enterDuration={WORD_ENTER}
              />
            ))}
          </div>

          {/* Horizontal rule — expands after words settle */}
          <div
            style={{
              marginTop: 20,
              marginBottom: 16,
              height: 1.5,
              background: p.accentColor,
              width: `${interpolate(ruleProgress, [0, 1], [0, 100], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}%`,
              opacity: 0.75,
              transformOrigin: rightSide ? "right center" : "left center",
              alignSelf: "flex-start",
            }}
          />

          {/* Attribution line */}
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: "0.03em",
              color: p.accentColor,
              textAlign: rightSide ? "right" : "left",
              opacity: authorOpacity,
              transform: `translateY(${authorY}px)`,
              textShadow: `0 1px 6px rgba(0,0,0,0.5)`,
            }}
          >
            — {p.author}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Internal: single animated word ─────────────────────────────────────────

const AnimatedWord: React.FC<{
  word: string;
  index: number;
  local: number;
  fps: number;
  stagger: number;
  enterDuration: number;
}> = ({ word, index, local, fps, stagger, enterDuration }) => {
  const wordLocal = local - index * stagger;

  const progress = spring({
    frame: wordLocal,
    fps,
    config: { damping: 200 },
    durationInFrames: enterDuration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${translateY}px)`,
        // Prevent stagger gaps from causing layout shifts
        willChange: "transform, opacity",
      }}
    >
      {word}
    </span>
  );
};

export default PullQuoteCard;
