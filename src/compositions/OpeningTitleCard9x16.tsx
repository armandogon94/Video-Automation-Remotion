/**
 * OpeningTitleCard9x16 — alexhormozi "opening title card" (ANALYSIS Pattern E).
 *
 * A single topic HEADLINE inside a SOLID dark rounded-rectangle (~12px radius
 * — NOT a pill), bold white ALL-CAPS centered geometric sans, shown ONCE as a
 * snap-in opener at t=0 and held.
 *
 *   - Source: `references/creators/alexhormozi/ANALYSIS.md` §Pattern E
 *     ("OpeningTitleCard"). Best frame:
 *     `references/creators/alexhormozi/zQvXS0vv3Ck/frames/frame-10-t15.00s.jpg`
 *     — "THE FOUR PILLARS OF TRUE INFLUENCE": large solid-bg dark rounded
 *     rectangle, bold white ALL CAPS sans, centered, used once at t=0–4s.
 *   - DISTINCT from `BrandedOpener9x16` (a brand wordmark/tic). This is a
 *     GENERIC topic-headline opener — reusable across any video's first beat.
 *
 * Motion: the card + text SNAP in together as one unit — a spring scale from
 * ~0.9 with a slight overshoot at t=0 — then hold. (Single solid color for the
 * headline / accent word; we never lean on background-clip:text because
 * Remotion's headless Chromium renders that as an opaque box.)
 *
 * NOTE on schemas: this composition declares its Zod schema locally and
 * exports it as `openingTitleCard9x16Schema` so Root.tsx can import it when it
 * is wired up. Every field has a `.default()`; "" is the empty/override
 * sentinel. We do not touch shared source files.
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
import { FONT_STACKS } from "../brand";

// ─── Public schema + types ─────────────────────────────────────────────
export const openingTitleCard9x16Schema = z.object({
  /** The topic headline. Rendered ALL-CAPS regardless of input casing. */
  headline: z.string().default("The Four Pillars of True Influence"),

  /**
   * Optional single word to recolor (case-insensitive match against the
   * headline's words). "" = no accent word. SOLID color only (no gradient
   * text) — see file header re: Remotion headless background-clip gotcha.
   */
  accentWord: z.string().default("Influence"),

  /** Solid card fill — near-black by default. */
  cardColor: z.string().default("#0E0E10"),
  /** Headline color — white by default. */
  textColor: z.string().default("#FFFFFF"),
  /** Color used for the optional accent word. */
  accentColor: z.string().default("#D4AF37"),

  /** Card corner radius in px (~14 = Hormozi's tight rounded-rect, NOT a pill). */
  radiusPx: z.number().default(14),

  /** Full-frame background behind the card. */
  backgroundColor: z.string().default("#1B3A6E"),

  /** Headline font size in px. */
  fontSizePx: z.number().default(96),

  /**
   * Snap-in window (frames). Card + text scale 0.9 → overshoot → 1.0 across
   * this span, then hold for the rest of the composition.
   */
  snapInFrames: z.number().default(14),
  /** Overshoot peak for the snap (1.0 = none; ~1.04 = subtle Hormozi kick). */
  overshoot: z.number().default(1.04),
});
export type OpeningTitleCard9x16Props = z.infer<
  typeof openingTitleCard9x16Schema
>;

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Split the headline into render tokens, flagging the (first) token that
 * matches `accentWord` case-insensitively so it can be recolored. Punctuation
 * around a word is tolerated in the match but preserved in the output.
 */
type HeadlineToken = { text: string; accent: boolean };

function buildTokens(headline: string, accentWord: string): HeadlineToken[] {
  const words = headline.split(/\s+/).filter((w) => w.length > 0);
  const target = accentWord.trim().toLowerCase();
  if (target.length === 0) {
    return words.map((text) => ({ text, accent: false }));
  }
  let matched = false;
  return words.map((text) => {
    const normalized = text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
    if (!matched && normalized === target) {
      matched = true;
      return { text, accent: true };
    }
    return { text, accent: false };
  });
}

// ─── Composition ───────────────────────────────────────────────────────
export const OpeningTitleCard9x16: React.FC<OpeningTitleCard9x16Props> = ({
  headline,
  accentWord,
  cardColor,
  textColor,
  accentColor,
  radiusPx,
  backgroundColor,
  fontSizePx,
  snapInFrames,
  overshoot,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Snap-in: spring 0 → 1 clamped to snapInFrames so the kick is visible
  // (an un-clamped spring would smear its rise across the whole comp). ──
  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
    durationInFrames: Math.max(1, snapInFrames),
  });

  // Two-phase scale so the overshoot beat reads: 0.9 → overshoot → 1.0.
  const scale = interpolate(enter, [0, 0.6, 1], [0.9, overshoot, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(enter, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tokens = buildTokens(headline, accentWord);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 72px",
      }}
    >
      {/* Card + text snap in together as a single unit. */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          opacity,
          willChange: "transform, opacity",
          backgroundColor: cardColor,
          borderRadius: radiusPx,
          padding: "56px 64px",
          maxWidth: 880,
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_STACKS.display,
            fontWeight: 900,
            fontSize: fontSizePx,
            lineHeight: 1.04,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            textAlign: "center",
            color: textColor,
            // No background-clip text — SOLID per-word color spans only.
            display: "block",
          }}
        >
          {tokens.map((token, i) => (
            <React.Fragment key={`${token.text}-${i}`}>
              <span style={{ color: token.accent ? accentColor : textColor }}>
                {token.text}
              </span>
              {i < tokens.length - 1 ? " " : null}
            </React.Fragment>
          ))}
        </h1>
      </div>
    </AbsoluteFill>
  );
};
