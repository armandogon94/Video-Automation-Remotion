/**
 * AbhiKineticSubtitle — replica of abhishek.devini's "kinetic-subtitle" beat: the
 * connective-tissue text layer that appears inside most reels. FOREGROUND ONLY: the
 * shared AbhiBackground (dark-grid-glow OR light-mesh) is mounted separately by the
 * host AbhiScene9x16, so this renders transparent and draws ONLY the kinetic text.
 *
 * Two source variants (one component, `variant` prop):
 *   • "karaoke" (default) — a bottom caption line BUILDS word-by-word (~1 word / 6f,
 *     ≈5 w/s). The keyword word(s) recolor white→accent ON LANDING; an optional
 *     strike-through wipe sweeps L→R across a struck word over ~7f.
 *     Ground-truth: DYukIE0PFac 9.5–11s ("It just does it." — 'does it.' lavender).
 *   • "stacked" — the standalone PUNCH variant: 2–4 ALL-CAPS words with a terminal
 *     period, stacked vertically centered, ~17f apart, each its own color, snapping
 *     in with a scale-overshoot (1.18→0.97→1) + a per-word glow halo that blooms then
 *     settles. Ground-truth (CLEANEST ref): DXUzK1fCLhF 63–67s
 *     ("SAFER." green / "CHEAPER." orange / "SMOOTHER." white).
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = specPx720 × 1.5.
 * Animate from frame 0, then HOLD.
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
import { FONT_STACKS } from "../../../brand";

/** "" sentinel = "caller did not override" (avoids zod v4 reflection on defaults). */
const S = "";

export const abhiKineticSubtitleSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink color. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /**
   * "karaoke" = bottom word-by-word line (keyword recolors on landing).
   * "stacked" = standalone ALL-CAPS punch words, one per line, each own color.
   */
  variant: z.enum(["karaoke", "stacked"]).default("karaoke"),

  // ── KARAOKE-line fields ──────────────────────────────────────────────
  /** Whole caption string; split on spaces, revealed ~1 word / 6f. */
  text: z.string().default("Then talk to your agent. It just does it."),
  /**
   * Word index (0-based) where the accent keyword clause begins. The word AT this
   * index (and everything after) recolors white→accent on landing. -1 = none.
   */
  accentFrom: z.number().default(6),
  /**
   * Word index (0-based) to draw a strike-through wipe across (e.g. a negated
   * "buttons"/"panels"). -1 = no strike. Only the single word is struck.
   */
  strikeWord: z.number().default(-1),
  /** Vertical anchor of the karaoke line as % of 720w-relative 1280h (y, 0..100). */
  lineYPct: z.number().default(72),
  /** Caption cap-height as % of 720w (spec ~4–5.5). px@1080 = pct/100*1080. */
  karaokeSizePct: z.number().default(5.2),

  // ── STACKED-punch fields ─────────────────────────────────────────────
  /** Comma-separated punch words, e.g. "SAFER.,CHEAPER.,SMOOTHER." */
  punchWords: z.string().default("SAFER.,CHEAPER.,SMOOTHER."),
  /**
   * Comma-separated per-word colors aligned to punchWords. "accent" → accentColor,
   * "ink" → primary ink, "green"/"red" → success/negative tokens, or a #hex.
   * "" → fall back to a sensible cycle (accent → ink → accent …).
   */
  punchColors: z.string().default("green,accent,ink"),
  /** Punch cap-height as % of 720w (spec ~9–12). */
  punchSizePct: z.number().default(10.0),
  /** Frames between successive punch words landing. */
  punchStagger: z.number().default(17),

  // ── Shared overrides ─────────────────────────────────────────────────
  /** Success green (stacked "green" token + landing bloom on positive words). */
  successColor: z.string().default("#47B16A"),
  /** Negative red (stacked "red" token + strike-through color). */
  negativeColor: z.string().default("#F5553A"),
});
export type AbhiKineticSubtitleProps = z.infer<typeof abhiKineticSubtitleSchema>;

const PX = 1080; // width basis: 1px@720-spec → 1.5px on this 1080-wide canvas

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(253,155,0,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiKineticSubtitle: React.FC<Partial<AbhiKineticSubtitleProps>> = (
  props,
) => {
  const p = abhiKineticSubtitleSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // 720→1080 scale factor for spec measures.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";

  // Resolve a per-word color token → concrete hex.
  const resolveColor = (token: string): string => {
    const t = token.trim().toLowerCase();
    if (t === S || t === "accent") return p.accentColor;
    if (t === "ink" || t === "white") return ink;
    if (t === "green") return p.successColor;
    if (t === "red") return p.negativeColor;
    return token.trim(); // assume a literal #hex
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {p.variant === "stacked" ? (
        <StackedPunch
          p={p}
          frame={frame}
          fps={fps}
          px={px}
          ink={ink}
          resolveColor={resolveColor}
        />
      ) : (
        <KaraokeLine
          p={p}
          frame={frame}
          fps={fps}
          px={px}
          ink={ink}
        />
      )}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KARAOKE line — bottom caption building word-by-word, keyword recolors on land.
// ─────────────────────────────────────────────────────────────────────────────
const KaraokeLine: React.FC<{
  p: AbhiKineticSubtitleProps;
  frame: number;
  fps: number;
  px: (n: number) => number;
  ink: string;
}> = ({ p, frame, fps, px, ink }) => {
  const words = p.text.split(/\s+/).filter((w) => w.length > 0);

  // ── Cadence: ~1 word / 6f (≈5 w/s) ──
  const WORD_START = 2;
  const WORD_STEP = 6;

  const sizePx = (p.karaokeSizePct / 100) * PX;
  const top = `${p.lineYPct}%`;

  return (
    <div
      style={{
        position: "absolute",
        left: px(56),
        right: px(48),
        top,
        transform: "translateY(-50%)",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize: sizePx,
        lineHeight: 1.06,
        letterSpacing: "-0.015em",
        textAlign: "center",
        // Constrain so long captions WRAP instead of clipping the frame edge.
        maxWidth: "92%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {words.map((w, i) => {
        const start = WORD_START + i * WORD_STEP;

        // Each word springs up + fades, slight scale-overshoot on landing.
        const sp = spring({
          frame: frame - start,
          fps,
          config: { damping: 180, mass: 0.6, stiffness: 150 },
          durationInFrames: 8,
        });
        const op = interpolate(frame, [start, start + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ty = interpolate(sp, [0, 1], [px(12), 0]);
        // Overshoot: 1.04 peak ~mid-spring, settling to 1.
        const scl = interpolate(sp, [0, 0.55, 1], [0.96, 1.04, 1]);

        // Keyword recolor white→accent ON LANDING (after the word has risen).
        const isAccent = p.accentFrom >= 0 && i >= p.accentFrom;
        const landFrame = start + 4;
        const colorMix = interpolate(frame, [landFrame, landFrame + 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const color = isAccent ? blend(ink, p.accentColor, colorMix) : ink;
        const accentGlow =
          isAccent && colorMix > 0
            ? `0 0 ${px(18) * colorMix}px ${hexA(p.accentColor, 0.45 * colorMix)}`
            : "none";

        // Optional strike-through wipe across a single struck word, L→R ~7f.
        const isStruck = p.strikeWord === i;
        const strikeStart = landFrame + 1;
        const strikeProg = isStruck
          ? interpolate(frame, [strikeStart, strikeStart + 7], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            })
          : 0;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              position: "relative",
              marginRight: px(11),
              opacity: op,
              transform: `translateY(${ty}px) scale(${scl})`,
              color,
              textShadow: accentGlow,
            }}
          >
            {w}
            {isStruck ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "52%",
                  height: Math.max(2, px(3)),
                  background: p.negativeColor,
                  borderRadius: px(2),
                  transformOrigin: "left center",
                  transform: `scaleX(${strikeProg})`,
                  boxShadow: `0 0 ${px(6)}px ${hexA(p.negativeColor, 0.6)}`,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STACKED punch — ALL-CAPS words, one per line, snapping in with overshoot + glow.
// ─────────────────────────────────────────────────────────────────────────────
const StackedPunch: React.FC<{
  p: AbhiKineticSubtitleProps;
  frame: number;
  fps: number;
  px: (n: number) => number;
  ink: string;
  resolveColor: (token: string) => string;
}> = ({ p, frame, fps, px, ink, resolveColor }) => {
  const wordList = p.punchWords
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const colorList = p.punchColors.split(",").map((c) => c.trim());

  const FIRST_START = 4;
  const sizePx = (p.punchSizePct / 100) * PX;

  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: px(2),
      }}
    >
      {wordList.map((w, i) => {
        const start = FIRST_START + i * p.punchStagger;

        // Snap-in with scale-overshoot 1.18→0.97→1 over ~9f.
        const sp = spring({
          frame: frame - start,
          fps,
          config: { damping: 160, mass: 0.6, stiffness: 200 },
          durationInFrames: 9,
        });
        const op = interpolate(frame, [start, start + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scl = interpolate(sp, [0, 0.45, 0.75, 1], [1.18, 0.97, 1.02, 1]);

        // Per-word color (fall back to accent→ink cycle when token missing).
        const token =
          i < colorList.length && colorList[i] !== S
            ? colorList[i]
            : i % 2 === 0
              ? "accent"
              : "ink";
        const color = resolveColor(token);

        // Glow halo blooms on land (f start+2 → start+8) then settles to a low idle.
        const bloom = interpolate(
          frame,
          [start + 1, start + 7, start + 16],
          [0, 1, 0.4],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={i}
            style={{
              opacity: op,
              transform: `scale(${scl})`,
              transformOrigin: "50% 50%",
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: sizePx,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color,
              textShadow: `0 0 ${px(26) * bloom}px ${hexA(color, 0.55 * bloom)}`,
              whiteSpace: "nowrap",
            }}
          >
            {w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Linear color blend between two #RRGGBB hexes (t 0..1). ──
function blend(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [242, 242, 244];
  }
  return [r, g, b];
}
