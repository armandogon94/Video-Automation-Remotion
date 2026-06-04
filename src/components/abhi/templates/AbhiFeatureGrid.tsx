/**
 * AbhiFeatureGrid — abhishek.devini "feature-card-grid" (2×2) FOREGROUND template.
 *
 * Ground-truth source: DXpZf2ziBYP 17–21s (DARK, "Drop it into any coding agent."
 * — orange accent word, glowing center "huashu-design · SKILL" capsule, 2×2 grid of
 * agent cards: Claude Code / Cursor / Codex / OpenClaw, bottom mono caption fading in).
 *
 * Choreography (transitionVerb): headline settles first; the center capsule pops; the
 * four cards fade+rise in Z-order stagger (TL→TR→BL→BR), each scale 0.94→1 over ~6f,
 * ~5f apart. Each card carries its OWN color tint + a real inline-SVG brand logo
 * (Anthropic / OpenAI / Cursor / smiley). No accent top-border strip — the source
 * cards have a flat colored border only. A bottom mono caption fades up last.
 * Animates from frame 0, then HOLDS.
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

/** Which real brand logo to render in the card (inline SVG). */
const logoKindSchema = z.enum([
  "anthropic",
  "openai",
  "cursor",
  "smiley",
  "generic",
]);
type LogoKind = z.infer<typeof logoKindSchema>;

const cardSchema = z.object({
  index: z.string().default(""),
  title: z.string().default(""),
  desc: z.string().default(""),
  /** Real brand logo drawn (inline SVG) at the card's leading edge. */
  logo: logoKindSchema.default("generic"),
  /** Per-card accent — tints the card fill, border and logo individually. */
  cardColor: z.string().default("#FD9B00"),
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
  /** Exactly four cards, in TL, TR, BL, BR reading order. Each card carries its
   *  OWN color + real brand logo (matches the source's multi-color logo grid). */
  cards: z
    .array(cardSchema)
    .default([
      { index: "01", title: "Claude Code", desc: "Skills load natively", logo: "anthropic", cardColor: "#FD9B00" },
      { index: "02", title: "Cursor", desc: "Drop into the agent", logo: "cursor", cardColor: "#AEB4C2" },
      { index: "03", title: "Codex", desc: "Works out of the box", logo: "openai", cardColor: "#00A080" },
      { index: "04", title: "OpenClaw", desc: "Same skill, any host", logo: "smiley", cardColor: "#E8A22B" },
    ]),
  /** Accent color used by the kicker dot + center capsule (not the cards). */
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

/**
 * Real brand marks as inline SVG, single-color (currentColor) so each card can
 * tint its own logo. Paths are simplified but recognizable reproductions:
 *  - anthropic — the Anthropic "burst" of three diagonal slashes (Claude Code).
 *  - openai    — the OpenAI blossom / hexafoil knot (Codex).
 *  - cursor    — the Cursor caret/triangle.
 *  - smiley    — the OpenClaw smiley disc.
 *  - generic   — a neutral rounded-square placeholder.
 */
const BrandLogo: React.FC<{ kind: LogoKind; size: number; color: string }> = ({
  kind,
  size,
  color,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: { flex: "none" as const, display: "block" },
    "aria-hidden": true,
  };
  if (kind === "anthropic") {
    // The Anthropic burst — slashes splaying out from a shared lower-left pivot
    // (the source mark radiates rather than running parallel).
    return (
      <svg {...common} fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round">
        <line x1="5" y1="20" x2="10.5" y2="4.5" />
        <line x1="5" y1="20" x2="14.5" y2="6.5" />
        <line x1="5" y1="20" x2="18" y2="10" />
      </svg>
    );
  }
  if (kind === "openai") {
    // OpenAI hexafoil / blossom knot.
    return (
      <svg {...common} fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 3.2c2 0 3.6 1.6 3.6 3.6 1.7-1 3.9-.4 4.9 1.3s.4 3.9-1.3 4.9c1.7 1 2.3 3.2 1.3 4.9s-3.2 2.3-4.9 1.3c0 2-1.6 3.6-3.6 3.6s-3.6-1.6-3.6-3.6c-1.7 1-3.9.4-4.9-1.3s-.4-3.9 1.3-4.9c-1.7-1-2.3-3.2-1.3-4.9s3.2-2.3 4.9-1.3C8.4 4.8 10 3.2 12 3.2Z" />
        <path d="M12 8.4 15 10v4l-3 1.6L9 14v-4Z" />
      </svg>
    );
  }
  if (kind === "cursor") {
    // Pointer caret.
    return (
      <svg {...common} fill={color} stroke="none">
        <path d="M6 4l11.5 6.8-5 .9-2.4 4.6L6 4Z" />
      </svg>
    );
  }
  if (kind === "smiley") {
    // Filled disc with a smile + eyes (OpenClaw).
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9.2" fill={color} />
        <circle cx="9" cy="10" r="1.3" fill="#1A1208" />
        <circle cx="15" cy="10" r="1.3" fill="#1A1208" />
        <path d="M8 13.6c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4" fill="none" stroke="#1A1208" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    );
  }
  // generic — rounded square outline.
  return (
    <svg {...common} fill="none" stroke={color} strokeWidth={2}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
    </svg>
  );
};

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

  // ---- 2×2 cards: Z-order stagger TL→TR→BL→BR, each scale 0.94→1 over 6f ----
  // Source ground-truth lands ALL FOUR cards almost at once, very early (~0.5s):
  // by the time the pill has popped the whole 2×2 grid is already present and
  // settled. The prior 18/5 schedule dribbled the 4th card (OpenClaw) in as late
  // as ~1.5s. Start the grid as the capsule pops and tighten the stagger so the
  // full grid is in by ~f24 (≈0.8s), keeping only a subtle Z-order cascade.
  const CARD_START = 12;
  const CARD_STAGGER = 3;
  const cardAnim = (i: number) => {
    const local = frame - (CARD_START + i * CARD_STAGGER);
    const sp = spring({ frame: local, fps, config: { damping: 200, mass: 0.6 } });
    const scale = interpolate(sp, [0, 1], [0.94, 1]);
    const ty = interpolate(sp, [0, 1], [PX(22), 0]);
    const opacity = interpolate(local, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scale, ty, opacity };
  };

  // ---- Bottom footnote: fades up last (just after the grid lands ~f24) ----
  const footProg = interpolate(frame, [28, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Card surface tokens (per STYLE TOKENS). Per-card color tint is applied below.
  const cardBaseFill = isDark ? "#13141B" : "rgba(255,255,255,0.86)";
  const cardTopEdge = isDark ? hexA("#FFFFFF", 0.06) : hexA("#FFFFFF", 0.6);

  // Grid geometry (% of frame). Two columns, two rows. From source measurements.
  const gridLeft = 5.5;
  const gridRight = 94.5;
  const colGap = 2.0;
  const colW = (gridRight - gridLeft - colGap) / 2; // ≈ 43.5
  const rowTop = 46.0;
  // Source cards are single-line (icon + title), so the rows are shorter/tighter
  // than a 2-line card would need.
  const rowH = 5.7;
  const rowGap = 1.5;
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
      {/* ---- Kicker pill (left x≈5.5%, y≈15%) — clean outlined capsule, NO dot ---- */}
      <div
        style={{
          position: "absolute",
          left: "5.5%",
          top: "14.4%",
          transform: `translateY(${kY}px)`,
          opacity: kProg,
          display: "inline-flex",
          alignItems: "center",
          // Source pill is a fully-rounded capsule with mono text only — no leading dot.
          padding: `${PX(8)}px ${PX(18)}px`,
          borderRadius: 999,
          background: isDark ? hexA("#FFFFFF", 0.04) : hexA("#FFFFFF", 0.7),
          border: `1px solid ${isDark ? hexA("#FFFFFF", 0.12) : hexA("#000000", 0.08)}`,
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: PX(14),
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isDark ? "#C6C2C0" : "#3A3A44",
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
          // Source headline runs ~58px@720 — larger/bolder than the prior 50.
          fontSize: PX(58),
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

      {/* ---- 2×2 card grid (each card in its OWN color, with a real logo) ---- */}
      {p.cards.slice(0, 4).map((card, i) => {
        const pos = positions[i];
        const a = cardAnim(i);
        const cc = card.cardColor;
        // Per-card tint: a faint colored wash over the base surface + a colored
        // border. Matches the source's red/cool/teal/amber card palette.
        const fill = isDark
          ? `linear-gradient(100deg, ${hexA(cc, 0.16)} 0%, ${hexA(cc, 0.04)} 34%, ${cardBaseFill} 64%)`
          : `linear-gradient(135deg, ${hexA(cc, 0.12)} 0%, ${hexA("#FFFFFF", 0.86)} 80%)`;
        const border = hexA(cc, isDark ? 0.36 : 0.34);
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
              gap: PX(14),
              padding: `0 ${PX(18)}px`,
              overflow: "hidden",
            }}
          >
            {/* real brand logo, tinted to the card's color (no icon box) */}
            <BrandLogo kind={card.logo} size={PX(28)} color={cc} />
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
            fontWeight: 600,
            fontSize: PX(19),
            lineHeight: 1.35,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: isDark ? hexA("#FFFFFF", 0.46) : hexA("#000000", 0.46),
            padding: "0 6%",
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
