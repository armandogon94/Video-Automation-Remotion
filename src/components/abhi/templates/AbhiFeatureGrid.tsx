/**
 * AbhiFeatureGrid — abhishek.devini "feature-card-grid" (2×2) FOREGROUND template.
 *
 * Ground-truth source: DXpZf2ziBYP 17–21s (DARK, "Drop it into any coding agent."
 * — orange accent word, glowing center "huashu-design · SKILL" capsule, 2×2 grid of
 * agent cards: Claude Code / Cursor / Codex / OpenClaw, bottom mono caption fading in).
 *
 * Choreography (transitionVerb): headline settles first; the center capsule pops; the
 * four cards fade+rise in Z-order stagger (TL→TR→BL→BR), each scale 0.94→1 over ~6f,
 * ~5f apart; each card's accent top-border + icon wipe/pop in 2–3f after it lands; a
 * bottom mono caption fades up last. Animates from frame 0, then HOLDS.
 *
 * Renders TRANSPARENT over the shared AbhiBackground (mounted by the host). Only the
 * local card/pill surfaces are opaque. Pure inline styles, self-contained.
 *
 * Canvas 1080×1920 @ 30fps. STYLE-SPEC measures are % of 720w → px = specPx × 1.5.
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

const cardSchema = z.object({
  index: z.string().default(""),
  title: z.string().default(""),
  desc: z.string().default(""),
  /** Mono glyph drawn in the small accent icon square (top-left of the card). */
  glyph: z.string().default(""),
  /** When true the card gets the accent-tint fill + brighter accent border. */
  accentTint: z.boolean().default(false),
});

export const abhiFeatureGridSchema = z.object({
  /** Mono kicker (uppercase, letter-spaced). */
  kicker: z.string().default("AGENT-AGNOSTIC"),
  /** Two-tone headline. Words inside {curly braces} recolor to the accent. */
  headline: z.string().default("Drop it into {any}\ncoding agent."),
  /** Optional glowing center capsule label (mono). Empty string hides it. */
  capsuleLabel: z.string().default("huashu-design"),
  /** Small chip text inside the capsule (e.g. SKILL). Empty hides the chip. */
  capsuleChip: z.string().default("SKILL"),
  /** Bottom mono caption that fades in last. Empty hides it. */
  footnote: z.string().default("+ OPENCLAW · HERMES · ANY SKILLS-COMPATIBLE AGENT"),
  /** Exactly four cards, in TL, TR, BL, BR reading order. */
  cards: z
    .array(cardSchema)
    .default([
      { index: "01", title: "Claude Code", desc: "Skills load natively", glyph: "≋", accentTint: false },
      { index: "02", title: "Cursor", desc: "Drop into the agent", glyph: "▸", accentTint: false },
      { index: "03", title: "Codex", desc: "Works out of the box", glyph: "◎", accentTint: false },
      { index: "04", title: "OpenClaw", desc: "Same skill, any host", glyph: "☺", accentTint: true },
    ]),
  /** Single accent color (default Anthropic orange). */
  accentColor: z.string().default("#FD9B00"),
  /** DARK vs LIGHT styling of the foreground surfaces (must match the bg mode). */
  mode: z.enum(["dark", "light"]).default("dark"),
});
export type AbhiFeatureGridProps = z.infer<typeof abhiFeatureGridSchema>;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Split a two-tone headline string on {accent} markers into colored runs. */
function parseTwoTone(s: string): { text: string; accent: boolean }[] {
  const out: { text: string; accent: boolean }[] = [];
  const re = /\{([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ text: s.slice(last, m.index), accent: false });
    out.push({ text: m[1], accent: true });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), accent: false });
  return out;
}

export const AbhiFeatureGrid: React.FC<Partial<AbhiFeatureGridProps>> = (props) => {
  const p = abhiFeatureGridSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const subInk = isDark ? "#9A9AA0" : "#5A5A66";
  const accent = p.accentColor;

  // 1080 = 720 × 1.5
  const PX = (specPx720: number) => specPx720 * 1.5;

  // ---- Kicker pill: fade + drop from y−16px over 6f ----
  const kProg = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const kY = (1 - kProg) * -PX(11);

  // ---- Headline: two lines slide-up + clear, staggered ~5f ----
  const headlineLines = p.headline.split("\n");
  const lineProgress = (i: number): number =>
    spring({ frame: frame - 2 - i * 5, fps, config: { damping: 200, mass: 0.7 } });

  // ---- Center capsule: pops scale 0.9→1 + fade, glow blooms, after headline ~f12 ----
  const capProg = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200, mass: 0.6 },
  });
  const capScale = interpolate(capProg, [0, 1], [0.9, 1]);
  const capGlow = interpolate(frame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- 2×2 cards: Z-order stagger TL→TR→BL→BR, each scale 0.94→1 over 6f, ~5f apart ----
  const CARD_START = 18;
  const CARD_STAGGER = 5;
  const cardAnim = (i: number) => {
    const local = frame - (CARD_START + i * CARD_STAGGER);
    const sp = spring({ frame: local, fps, config: { damping: 200, mass: 0.6 } });
    const scale = interpolate(sp, [0, 1], [0.94, 1]);
    const ty = interpolate(sp, [0, 1], [PX(22), 0]);
    const opacity = interpolate(local, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // Accent top-border wipes L→R 2–3f after the card lands.
    const borderWipe = interpolate(local, [3, 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { scale, ty, opacity, borderWipe };
  };

  // ---- Bottom footnote: fades up last ----
  const footProg = interpolate(frame, [42, 54], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Card surface tokens (per STYLE TOKENS).
  const cardBaseFill = isDark ? "#13141B" : "rgba(255,255,255,0.86)";
  const cardBaseBorder = isDark ? hexA("#FFFFFF", 0.07) : hexA("#000000", 0.08);
  const cardTopEdge = isDark ? hexA("#FFFFFF", 0.06) : hexA("#FFFFFF", 0.6);

  // Grid geometry (% of frame). Two columns, two rows. From source measurements.
  const gridLeft = 5.5;
  const gridRight = 94.5;
  const colGap = 2.0;
  const colW = (gridRight - gridLeft - colGap) / 2; // ≈ 43.5
  const rowTop = 46.0;
  const rowH = 7.4;
  const rowGap = 1.4;
  const cardX = (col: number) => gridLeft + col * (colW + colGap);
  const cardY = (row: number) => rowTop + row * (rowH + rowGap);
  const positions = [
    { col: 0, row: 0 }, // TL
    { col: 1, row: 0 }, // TR
    { col: 0, row: 1 }, // BL
    { col: 1, row: 1 }, // BR
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* ---- Kicker pill (left x≈5.5%, y≈15%) ---- */}
      <div
        style={{
          position: "absolute",
          left: "5.5%",
          top: "14.4%",
          transform: `translateY(${kY}px)`,
          opacity: kProg,
          display: "inline-flex",
          alignItems: "center",
          gap: PX(8),
          padding: `${PX(8)}px ${PX(14)}px`,
          borderRadius: PX(12),
          background: isDark ? hexA("#FFFFFF", 0.06) : hexA("#FFFFFF", 0.7),
          border: `1px solid ${isDark ? hexA("#FFFFFF", 0.1) : hexA("#000000", 0.08)}`,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            width: PX(7),
            height: PX(7),
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${PX(9)}px ${hexA(accent, 0.9)}`,
          }}
        />
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: PX(14),
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isDark ? "#C8C8CC" : "#3A3A44",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ---- Headline (left x6%, two-tone, two lines) ---- */}
      <div
        style={{
          position: "absolute",
          left: "5.8%",
          top: "17.4%",
          right: "6%",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: PX(50),
          lineHeight: 0.98,
          letterSpacing: "-0.02em",
          color: ink,
        }}
      >
        {headlineLines.map((line, i) => {
          const lp = lineProgress(i);
          return (
            <div
              key={i}
              style={{
                display: "block",
                opacity: lp,
                transform: `translateY(${(1 - lp) * PX(18)}px)`,
                filter: `blur(${(1 - lp) * 6}px)`,
              }}
            >
              {parseTwoTone(line).map((run, j) => (
                <span key={j} style={{ color: run.accent ? accent : ink }}>
                  {run.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* ---- Center glowing capsule (● label · SKILL) ---- */}
      {p.capsuleLabel ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "38.5%",
            transform: `translate(-50%, -50%) scale(${capScale})`,
            opacity: capProg,
            display: "inline-flex",
            alignItems: "center",
            gap: PX(11),
            padding: `${PX(10)}px ${PX(16)}px`,
            borderRadius: PX(28),
            background: isDark ? "#15110D" : hexA("#FFFFFF", 0.9),
            border: `1px solid ${hexA(accent, 0.55)}`,
            boxShadow: `0 0 ${PX(34)}px ${hexA(accent, 0.45 * capGlow)}, inset 0 1px 0 ${hexA("#FFFFFF", 0.08)}`,
          }}
        >
          <span
            style={{
              width: PX(18),
              height: PX(18),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${PX(14)}px ${hexA(accent, 0.85)}`,
              flex: "none",
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: PX(17),
              letterSpacing: "0.01em",
              color: ink,
            }}
          >
            {p.capsuleLabel}
          </span>
          {p.capsuleChip ? (
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: PX(11),
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: accent,
                padding: `${PX(3)}px ${PX(7)}px`,
                borderRadius: PX(6),
                background: hexA(accent, 0.14),
                border: `1px solid ${hexA(accent, 0.4)}`,
              }}
            >
              {p.capsuleChip}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ---- 2×2 card grid ---- */}
      {p.cards.slice(0, 4).map((card, i) => {
        const pos = positions[i];
        const a = cardAnim(i);
        const fill = card.accentTint
          ? isDark
            ? "linear-gradient(135deg, #271C13 0%, #1C1510 100%)"
            : hexA(accent, 0.1)
          : cardBaseFill;
        const border = card.accentTint
          ? hexA(accent, 0.45)
          : cardBaseBorder;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${cardX(pos.col)}%`,
              top: `${cardY(pos.row)}%`,
              width: `${colW}%`,
              height: `${rowH}%`,
              transform: `translateY(${a.ty}px) scale(${a.scale})`,
              opacity: a.opacity,
              borderRadius: PX(14),
              background: fill,
              border: `1px solid ${border}`,
              boxShadow: isDark
                ? `0 ${PX(8)}px ${PX(24)}px rgba(0,0,0,0.4), inset 0 1px 0 ${cardTopEdge}`
                : `0 ${PX(8)}px ${PX(20)}px rgba(20,16,30,0.12), inset 0 1px 0 ${cardTopEdge}`,
              display: "flex",
              alignItems: "center",
              gap: PX(13),
              padding: `0 ${PX(18)}px`,
              overflow: "hidden",
            }}
          >
            {/* accent top-border wipe L→R */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: PX(2.5),
                width: `${a.borderWipe * 100}%`,
                background: `linear-gradient(90deg, ${accent} 0%, ${hexA(accent, 0)} 100%)`,
                borderTopLeftRadius: PX(14),
              }}
            />
            {/* small accent icon square */}
            <div
              style={{
                width: PX(34),
                height: PX(34),
                flex: "none",
                borderRadius: PX(9),
                background: hexA(accent, isDark ? 0.14 : 0.12),
                border: `1px solid ${hexA(accent, 0.4)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accent,
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: PX(18),
                lineHeight: 1,
              }}
            >
              {card.glyph || card.index}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: PX(2), minWidth: 0 }}>
              <span
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize: PX(19),
                  letterSpacing: "-0.01em",
                  color: ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {card.title}
              </span>
              {card.desc ? (
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontWeight: 500,
                    fontSize: PX(11),
                    letterSpacing: "0.04em",
                    color: subInk,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {card.desc}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* ---- Bottom mono footnote (fades in last) ---- */}
      {p.footnote ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "70.5%",
            textAlign: "center",
            opacity: footProg,
            transform: `translateY(${(1 - footProg) * PX(8)}px)`,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: PX(12),
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isDark ? hexA("#FFFFFF", 0.32) : hexA("#000000", 0.36),
            padding: "0 8%",
          }}
        >
          <span style={{ color: isDark ? hexA("#FFFFFF", 0.22) : hexA("#000000", 0.26) }}>— </span>
          {p.footnote}
          <span style={{ color: isDark ? hexA("#FFFFFF", 0.22) : hexA("#000000", 0.26) }}> —</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export default AbhiFeatureGrid;
