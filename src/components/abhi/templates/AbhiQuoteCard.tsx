/**
 * AbhiQuoteCard — abhishek.devini "quote-card" FOREGROUND template.
 *
 * The editorial "credibility" beat — the ONLY place the high-contrast serif
 * (Playfair) appears in the system. A big accent open-quote glyph "❝" leads,
 * then a centered serif pull-quote builds line-by-line (the keyword clause set
 * bold), closing on an attribution row (name bold + role mono) anchored by an
 * accent left-border bar. Two surfaces: the canonical CREAM editorial card
 * (#E1D7C8, soft shadow + warm glow halo) or a transparent "bare" variant that
 * floats the quote straight over the shared AbhiBackground.
 *
 * FOREGROUND ONLY — the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host AbhiScene9x16. This renders TRANSPARENT over it;
 * the only opaque element is the local cream card surface (when enabled).
 *
 * Source ground-truth:
 *   • CLEANEST (cleanestRef): DXhkSFiD8dL ~38.3–44s (DARK, teal ❝ + "A faster,
 *     sharper thinker for fewer tokens." — keyword clause bold, word-group build).
 *   • CREAM card variant: DXUzK1fCLhF ~18–27s ("Like when the deck is on your
 *     laptop, but you aren't" on a #E1D7C8 card + "● LIVE · DISPATCH" pill).
 * Sampled hexes: cream fill #E1D7C8 (225,215,200); teal glyph ≈ #009080 (3,146,129).
 *
 * Choreography (transitionVerb):
 *   • Open-quote glyph scales 0.8→1 + fades over ~8f (leads, like a kicker).
 *   • Card surface (cream variant) scales 0.96→1 + fades up over ~10f under it.
 *   • Quote lines fade up from +14px line-by-line, ~6f apart; the keyword clause
 *     lands bold (no separate sweep — bold weight is the emphasis, per source).
 *   • Attribution slides in from x−18px ~6f after the last quote line, its accent
 *     left-border bar wiping down to full height.
 *   • A faint accent glow halo blooms behind the card over ~14f (self-contained
 *     supplement to the bg glow).
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = specPct/100*1080
 * (i.e. spec-px-at-720 × 1.5). Self-contained: only react / remotion / zod / brand.
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

/** "" sentinel = "caller did not override" (Zod v4 — no .shape/_def reflection). */
const AUTO = "";

export const abhiQuoteCardSchema = z.object({
  /** Background family this foreground sits over (drives ink + surface tints). */
  mode: z.enum(["dark", "light"]).default("dark"),
  /**
   * Local surface under the quote. "cream" = the canonical #E1D7C8 editorial
   * card (with shadow + warm halo). "bare" = no card, quote floats straight over
   * the shared background (the DXhkSFiD8dL dark variant).
   */
  surface: z.enum(["cream", "bare"]).default("cream"),
  /** Single accent color — defaults to OpenAI teal (cleanestRef accent). */
  accentColor: z.string().default("#009080"),

  /** Small mono pill, UPPERCASE, top-left of the card. "" hides it. */
  kicker: z.string().default("LIVE · DISPATCH"),

  /**
   * The pull-quote body. Wrap the emphasis clause in *asterisks* to set it BOLD
   * (the source's only emphasis device — e.g. "A *faster, sharper* thinker…").
   * Newlines are honored as hard line breaks; otherwise it auto-wraps + auto-fits.
   */
  quote: z
    .string()
    .default("Like when the deck is on your laptop, *but you aren't.*"),

  /** Attribution name (bold). "" hides the whole attribution row. */
  attributionName: z.string().default("Greg Brockman"),
  /** Attribution role / org (mono UPPERCASE). "" hides just the role line. */
  attributionRole: z.string().default("PRESIDENT · OPENAI"),

  /** Quote cap-height as % of 720w (spec serif ~4.6–6). px@1080 = pct/100*1080. */
  quoteSizePct: z.number().default(5.0),

  /** Override ink (quote) color; AUTO → surface/mode default. */
  inkColor: z.string().default(AUTO),
  /** Override muted (non-emphasis / role) color; AUTO → surface/mode default. */
  mutedColor: z.string().default(AUTO),
});
export type AbhiQuoteCardProps = z.infer<typeof abhiQuoteCardSchema>;

// ── helpers ──────────────────────────────────────────────────────────────────
const PX = (specPctOf720: number): number => (specPctOf720 / 100) * 1080;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(0,144,128,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

/** One emphasis-aware token: text + whether it sits inside *asterisks*. */
type Tok = { text: string; bold: boolean };

/** Split a quote line into bold/plain runs on *asterisk* pairs (keeps spaces). */
function tokenizeEmphasis(line: string): Tok[] {
  const out: Tok[] = [];
  const parts = line.split("*");
  // parts alternate plain, bold, plain, bold … (odd indices are inside *…*).
  parts.forEach((part, i) => {
    if (part === "") return;
    out.push({ text: part, bold: i % 2 === 1 });
  });
  return out.length > 0 ? out : [{ text: line, bold: false }];
}

/** Break a quote into display lines: honor "\n", else wrap to ~maxChars. */
function toLines(quote: string, maxChars: number): string[] {
  const hard = quote.replace(/\r/g, "").split("\n");
  const lines: string[] = [];
  for (const seg of hard) {
    const words = seg.split(" ").filter((w) => w.length > 0);
    if (words.length === 0) continue;
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      // measure on the stripped (no-asterisk) length so emphasis markers don't
      // count toward wrap width.
      if (next.replace(/\*/g, "").length > maxChars && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines.length > 0 ? lines : [quote];
}

export const AbhiQuoteCard: React.FC<Partial<AbhiQuoteCardProps>> = (props) => {
  const p = abhiQuoteCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isDark = p.mode === "dark";
  const accent = p.accentColor;
  const isCream = p.surface === "cream";

  // Ink + muted depend on the SURFACE first (cream card is always dark-on-cream),
  // then fall back to the background mode for the "bare" variant.
  const ink =
    p.inkColor !== AUTO
      ? p.inkColor
      : isCream
        ? "#2A241C" // warm near-black for the cream card
        : isDark
          ? "#F2F2F4"
          : "#0C0C12";
  const muted =
    p.mutedColor !== AUTO
      ? p.mutedColor
      : isCream
        ? "#7A6E5E" // warm taupe for the secondary clause on cream
        : isDark
          ? "#9A9AA0"
          : "#5A5A66";

  // ── geometry (centered editorial column) ─────────────────────────────────────
  const cardW = PX(84); // ≈ 84% of 720 → ~907px @1080
  const cardLeft = (width - cardW) / 2;
  const innerPadX = PX(5.5);
  const contentW = cardW - innerPadX * 2;

  // Auto-fit the quote: pick a size that keeps the longest line inside contentW.
  // Playfair-700 avg glyph advance ≈ 0.50·fontSize; bold runs slightly wider, so
  // budget 0.52. Start from quoteSizePct, shrink only if a line would overflow.
  const quotePxRaw = PX(p.quoteSizePct);
  // Wrap target: how many chars fit per line at the requested size.
  const maxChars = Math.max(
    14,
    Math.floor(contentW / (quotePxRaw * 0.52)),
  );
  const lines = toLines(p.quote, maxChars);
  const longestLineChars = lines.reduce(
    (m, l) => Math.max(m, l.replace(/\*/g, "").length),
    1,
  );
  const quotePx = Math.min(quotePxRaw, contentW / (longestLineChars * 0.52));
  const quoteGlyphPx = PX(8.2); // the big "❝" mark, ~8% cap-height
  const kickerPx = PX(1.5);

  const hasKicker = p.kicker.trim() !== "";
  const hasAttribution = p.attributionName.trim() !== "";
  const hasRole = p.attributionRole.trim() !== "";

  // ── timing (frames @30fps, scene-relative from 0, then HOLD) ──────────────────

  // Card surface: scale 0.96→1 + fade up over ~10f (cream variant only).
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 110 },
    durationInFrames: 12,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardRise = interpolate(cardSpring, [0, 1], [PX(2.4), 0]);
  const cardOpacity = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Kicker pill: fade + drop from y−14px over 6f.
  const KICK_START = isCream ? 4 : 0;
  const kickerOpacity = interpolate(
    frame,
    [KICK_START, KICK_START + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const kickerY = interpolate(frame, [KICK_START, KICK_START + 6], [-14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Open-quote glyph: scales 0.8→1 + fades over ~8f (leads the quote).
  const GLYPH_START = isCream ? 8 : 4;
  const glyphSpring = spring({
    frame: frame - GLYPH_START,
    fps,
    config: { damping: 180, mass: 0.6, stiffness: 130 },
    durationInFrames: 10,
  });
  const glyphScale = interpolate(glyphSpring, [0, 1], [0.8, 1]);
  const glyphOpacity = interpolate(
    frame,
    [GLYPH_START, GLYPH_START + 7],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Quote lines: fade up from +14px line-by-line, ~6f apart, starting after glyph.
  const LINES_START = GLYPH_START + 6;
  const LINE_STEP = 6;
  const lineReveal = (i: number) => {
    const start = LINES_START + i * LINE_STEP;
    const opacity = interpolate(frame, [start, start + 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ty = interpolate(frame, [start, start + 8], [PX(1.3), 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { opacity, ty };
  };

  // Attribution: slides in from x−18px ~6f after the last quote line; its accent
  // left-border bar wipes from 0→full height over ~8f.
  const ATTR_START = LINES_START + lines.length * LINE_STEP + 4;
  const attrSpring = spring({
    frame: frame - ATTR_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 130 },
    durationInFrames: 10,
  });
  const attrX = interpolate(attrSpring, [0, 1], [-PX(1.6), 0]);
  const attrOpacity = interpolate(frame, [ATTR_START, ATTR_START + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barGrow = interpolate(frame, [ATTR_START, ATTR_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Local accent glow halo behind the card: blooms over ~14f, then breathes ±4%.
  const bloomIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const breathe = 1 + 0.04 * Math.sin((frame / (fps * 1.6)) * Math.PI * 2);
  const haloScale = (0.96 + 0.04 * bloomIn) * breathe;

  // ── surface chrome ────────────────────────────────────────────────────────────
  const creamFill = "#E1D7C8";
  const creamEdge = hexA("#000000", 0.06);
  const pillFill = isCream
    ? hexA("#5A4F42", 0.9) // dark warm chip on cream (matches source pill)
    : isDark
      ? hexA("#1A1714", 0.7)
      : hexA("#FFFFFF", 0.78);
  const pillInk = isCream ? "#F2ECE1" : isDark ? "#C8C8CC" : "#5A5A66";
  const pillBorder = isCream
    ? hexA("#000000", 0.12)
    : hexA(accent, isDark ? 0.4 : 0.3);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontKerning: "normal" }}>
      {/* ── Local accent glow halo behind the card (NOT a full background) ── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "44%",
            left: "50%",
            width: "92%",
            height: "46%",
            transform: `translate(-50%, -50%) scale(${haloScale})`,
            background: `radial-gradient(ellipse at center, ${hexA(
              accent,
              isDark ? 0.5 : 0.3,
            )} 0%, ${hexA(accent, 0.18)} 38%, rgba(0,0,0,0) 70%)`,
            opacity: (isDark ? 0.5 : 0.32) * bloomIn,
            filter: "blur(70px)",
          }}
        />
      </AbsoluteFill>

      {/* ── Editorial column (centered) ── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: cardW,
            marginLeft: cardLeft - (width - cardW) / 2, // keep centered
            opacity: isCream ? cardOpacity : 1,
            transform: isCream
              ? `translateY(${cardRise}px) scale(${cardScale})`
              : undefined,
            transformOrigin: "50% 40%",
            borderRadius: PX(2.4),
            background: isCream ? creamFill : "transparent",
            border: isCream ? `1px solid ${creamEdge}` : "none",
            boxShadow: isCream
              ? `0 ${PX(2.2)}px ${PX(6.5)}px ${hexA("#000000", 0.5)}, 0 0 ${PX(
                  10,
                )}px ${hexA(accent, 0.1)}`
              : "none",
            padding: isCream
              ? `${PX(5.0)}px ${innerPadX}px ${PX(5.0)}px`
              : `0 ${innerPadX}px`,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Kicker pill (top-left of the card) */}
          {hasKicker ? (
            <div
              style={{
                alignSelf: "flex-start",
                opacity: kickerOpacity,
                transform: `translateY(${kickerY}px)`,
                display: "inline-flex",
                alignItems: "center",
                gap: PX(0.9),
                padding: `${PX(0.7)}px ${PX(1.4)}px`,
                borderRadius: 999,
                background: pillFill,
                border: `1px solid ${pillBorder}`,
                marginBottom: PX(2.6),
              }}
            >
              <span
                style={{
                  width: PX(0.62),
                  height: PX(0.62),
                  borderRadius: 999,
                  background: accent,
                  boxShadow: `0 0 ${PX(1.0)}px ${hexA(accent, 0.8)}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_STACKS.mono,
                  fontSize: kickerPx,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: pillInk,
                  whiteSpace: "nowrap",
                }}
              >
                {p.kicker}
              </span>
            </div>
          ) : null}

          {/* Big accent open-quote glyph "❝" — leads the quote */}
          <div
            style={{
              opacity: glyphOpacity,
              transform: `scale(${glyphScale})`,
              transformOrigin: "center bottom",
              fontFamily: FONT_STACKS.serif,
              fontWeight: 900,
              fontSize: quoteGlyphPx,
              lineHeight: 0.6,
              color: accent,
              marginBottom: PX(1.6),
              // The glyph: stacked open double-quote. Use the literal so the
              // serif renders its high-contrast comma forms (matches source).
              userSelect: "none",
            }}
          >
            &ldquo;
          </div>

          {/* Serif pull-quote, centered, line-by-line build */}
          <div
            style={{
              fontFamily: FONT_STACKS.serif,
              fontSize: quotePx,
              lineHeight: 1.18,
              letterSpacing: "-0.005em",
              textAlign: "center",
              color: ink,
              maxWidth: contentW,
            }}
          >
            {lines.map((line, i) => {
              const r = lineReveal(i);
              const toks = tokenizeEmphasis(line);
              return (
                <div
                  key={i}
                  style={{
                    opacity: r.opacity,
                    transform: `translateY(${r.ty}px)`,
                  }}
                >
                  {toks.map((t, j) => (
                    <span
                      key={j}
                      style={{
                        fontWeight: t.bold ? 700 : 400,
                        // Non-emphasis runs on later lines drift toward muted to
                        // mirror the source's two-tone quote (line 2 lighter).
                        color: t.bold ? ink : i > 0 ? muted : ink,
                      }}
                    >
                      {t.text}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Attribution row — accent left-border bar + name (bold) + role (mono) */}
          {hasAttribution ? (
            <div
              style={{
                marginTop: PX(3.4),
                alignSelf: "center",
                display: "flex",
                alignItems: "stretch",
                gap: PX(1.6),
                opacity: attrOpacity,
                transform: `translateX(${attrX}px)`,
              }}
            >
              {/* accent left-border bar — wipes down to full height */}
              <div
                style={{
                  width: PX(0.5),
                  borderRadius: 999,
                  background: accent,
                  transform: `scaleY(${barGrow})`,
                  transformOrigin: "top center",
                  boxShadow: `0 0 ${PX(1.4)}px ${hexA(accent, 0.5)}`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: PX(0.5),
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontSize: PX(2.2),
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.05,
                    color: ink,
                  }}
                >
                  {p.attributionName}
                </div>
                {hasRole ? (
                  <div
                    style={{
                      fontFamily: FONT_STACKS.mono,
                      fontSize: PX(1.4),
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: muted,
                    }}
                  >
                    {p.attributionRole}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
