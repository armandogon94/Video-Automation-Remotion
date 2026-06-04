/**
 * AbhiTerminalCard — replica of abhishek.devini's "terminal-mockup-card" scene
 * (install / run-it beat). FOREGROUND ONLY: the shared AbhiBackground (dark mode)
 * is mounted separately by the host AbhiScene9x16, so this renders transparent.
 *
 * Source ground-truth: DXpZf2ziBYP ~19.5–26.5s (DARK, `$ npx skills add …` orange
 * progress bar → `✓ installed · 20 skills · 0 errors`, two-tone bottom subtitle).
 *
 * Choreography (transitionVerb):
 *   • Headline pops word-by-word (~1 word / 4f).
 *   • Terminal card scales 0.96→1 + fades up over 10–12f.
 *   • Command types in char-by-char (~2 chars/f) with a blinking block caret.
 *   • Orange progress bar fills 0→100% width over ~18f.
 *   • Green `✓ installed …` success line pops in LAST.
 *   • Bottom two-tone kinetic subtitle rises under it.
 *
 * Canvas 1080×1920 @30fps. Spec measures are % of 720w → px = specPx720 × 1.5.
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

/** "" sentinel = "caller did not override" (avoids zod reflection on defaults). */
const S = "";

export const abhiTerminalCardSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Mono kicker, UPPERCASE. */
  kicker: z.string().default("ONE-LINE INSTALL"),
  /** Two-tone headline words; the accent word(s) recolored via headlineAccentFrom. */
  headline: z.string().default("Type. Paste. Watch."),
  /** Index (0-based, by word) where the accent coloring begins. -1 = none. */
  headlineAccentFrom: z.number().default(2),
  /** Terminal window path crumb (right of the traffic-light dots). */
  pathCrumb: z.string().default("~/projects · zsh"),
  /** Grey comment line above the command. */
  commentLine: z.string().default("# one line. all 20 skills."),
  /** The command typed after the `$` prompt. */
  command: z.string().default("npx skills add alchaincyf/huashu-design"),
  /** Dim "resolving …" line that the progress bar tracks. */
  resolvingLine: z.string().default("resolving alchaincyf/huashu-design..."),
  /** Final green success line (rendered after `✓`). */
  successLine: z.string().default("installed · 20 skills · 0 errors"),
  /** Green used for the ✓ + success line. */
  successColor: z.string().default("#34D3A0"),
  /** Bottom two-tone kinetic subtitle (whole string). */
  subtitle: z.string().default("Then talk to your agent. No buttons. No panels."),
  /** Word index where the subtitle accent coloring begins. -1 = none. */
  subtitleAccentFrom: z.number().default(4),
});
export type AbhiTerminalCardProps = z.infer<typeof abhiTerminalCardSchema>;

const INK = "#F2F2F4"; // warm off-white (never pure white)
const GREY = "#8A8A90"; // labels / comment grey
const CARD_FILL = "#13141B";
const CARD_CHROME = "#1A1B22";
const CARD_EDGE = "rgba(255,255,255,0.07)";

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiTerminalCard: React.FC<Partial<AbhiTerminalCardProps>> = (props) => {
  const p = abhiTerminalCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // 720→1080 scale factor for spec measures.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const accent = p.accentColor;

  // ── Headline: word-by-word pop ~1 word / 4f, starts ~f4 ──
  // Source ground-truth has NO big headline between the pill and the terminal —
  // it goes pill → terminal → bottom subtitle. An empty `headline` suppresses it
  // entirely and pulls the pill down + the terminal up to match the source frame.
  const hasHeadline = p.headline.trim() !== S;
  const headWords = hasHeadline ? p.headline.split(" ") : [];
  const HEAD_START = 4;
  const HEAD_STEP = 4;

  // ── Terminal card: scale 0.96→1 + fade up, 10–12f, starting ~f10 ──
  const CARD_START = 10;
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 110 },
    durationInFrames: 12,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardRise = interpolate(cardSpring, [0, 1], [px(28), 0]);

  // Inner rows reveal after the card has mostly landed.
  const COMMENT_START = CARD_START + 8; // # comment line
  const CMD_START = COMMENT_START + 4; // $ prompt + typed command
  const TYPE_RATE = 2; // chars per frame
  const typedChars = Math.max(
    0,
    Math.min(p.command.length, Math.floor((frame - CMD_START) * TYPE_RATE)),
  );
  const typedCmd = p.command.slice(0, typedChars);
  const typingDone = typedChars >= p.command.length;

  // resolving line appears once typing finishes.
  const RESOLVE_START = CMD_START + Math.ceil(p.command.length / TYPE_RATE) + 2;
  const resolveOpacity = interpolate(
    frame,
    [RESOLVE_START, RESOLVE_START + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Orange progress bar: fill 0→100% width over ~18f ──
  const BAR_START = RESOLVE_START + 3;
  const BAR_DUR = 18;
  const barFill = interpolate(frame, [BAR_START, BAR_START + BAR_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ── Green success line pops LAST (after bar fills) ──
  const OK_START = BAR_START + BAR_DUR + 2;
  const okSpring = spring({
    frame: frame - OK_START,
    fps,
    config: { damping: 180, mass: 0.6, stiffness: 130 },
    durationInFrames: 8,
  });
  const okOpacity = okSpring;
  const okY = interpolate(okSpring, [0, 1], [px(8), 0]);

  // ── Blinking block caret on the command line while typing/holding ──
  const caretOn = Math.floor(frame / 8) % 2 === 0; // ~15f cycle (on/off 8f)
  const showCaret = frame >= CMD_START && !typingDone ? true : frame >= CMD_START && caretOn;

  // ── Bottom kinetic subtitle: word-by-word ~1 word / 6f ──
  const subWords = p.subtitle.split(" ");
  const SUB_START = OK_START + 4;
  const SUB_STEP = 5;

  // Card geometry (centered horizontally; spec ~84% wide, y top ~25%).
  const cardW = px(636); // ≈ 84% of 720 → 954px @1080
  const cardLeft = (width - cardW) / 2;

  // Vertical seating: with a headline, pill@150 / card@372. Without (the source
  // layout), drop the pill to ~15.7% (px≈201) and raise the card to ~25%
  // (480px = px(320)) so the stack reads pill → terminal → subtitle like source.
  const pillTop = hasHeadline ? px(150) : px(196);
  const cardTop = hasHeadline ? px(372) : px(320);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill (mono, accent border, no dot), LEFT x≈8% ── */}
      <KickerPill
        frame={frame}
        fps={fps}
        px={px}
        accent={accent}
        text={p.kicker}
        top={pillTop}
        showDot={hasHeadline}
      />

      {/* ── Headline (two-tone, left-aligned) — only when provided ── */}
      {hasHeadline && (
      <div
        style={{
          position: "absolute",
          left: px(56),
          top: px(220),
          right: px(40),
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: px(52),
          lineHeight: 0.98,
          letterSpacing: "-0.02em",
          color: INK,
        }}
      >
        {headWords.map((w, i) => {
          const start = HEAD_START + i * HEAD_STEP;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 190, mass: 0.6, stiffness: 130 },
            durationInFrames: 8,
          });
          const isAccent = p.headlineAccentFrom >= 0 && i >= p.headlineAccentFrom;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: px(16),
                opacity: sp,
                transform: `translateY(${interpolate(sp, [0, 1], [px(14), 0])}px)`,
                color: isAccent ? accent : INK,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      )}

      {/* ── Terminal card ── */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          // Source seats the terminal high (~25% down), right under the kicker/
          // headline, with the breathing room below it for the bottom subtitle.
          top: cardTop,
          width: cardW,
          opacity: cardOpacity,
          transform: `translateY(${cardRise}px) scale(${cardScale})`,
          transformOrigin: "50% 30%",
          borderRadius: px(16),
          background: CARD_FILL,
          border: `1px solid ${CARD_EDGE}`,
          boxShadow: `0 ${px(24)}px ${px(70)}px ${hexA("#000000", 0.55)}, 0 0 ${px(
            60,
          )}px ${hexA(accent, 0.08)}`,
          overflow: "hidden",
        }}
      >
        {/* Chrome bar: 3 traffic-light dots + path crumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: px(10),
            height: px(36),
            padding: `0 ${px(16)}px`,
            background: CARD_CHROME,
            borderBottom: `1px solid ${hexA("#000000", 0.35)}`,
          }}
        >
          <Dot px={px} color="#FC6F62" />
          <Dot px={px} color="#F3B22D" />
          <Dot px={px} color="#2FA74E" />
          <span
            style={{
              marginLeft: px(10),
              fontFamily: FONT_STACKS.mono,
              fontSize: px(13),
              letterSpacing: "0.04em",
              color: GREY,
            }}
          >
            {p.pathCrumb}
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            padding: `${px(22)}px ${px(20)}px ${px(26)}px`,
            fontFamily: FONT_STACKS.mono,
            fontSize: px(17),
            lineHeight: 1.7,
          }}
        >
          {/* comment line */}
          <div
            style={{
              color: GREY,
              opacity: interpolate(
                frame,
                [COMMENT_START, COMMENT_START + 4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            {p.commentLine}
          </div>

          {/* $ command line */}
          <div
            style={{
              color: INK,
              opacity: frame >= CMD_START ? 1 : 0,
              marginTop: px(6),
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <span style={{ color: accent, fontWeight: 700 }}>$ </span>
            {typedCmd}
            {showCaret ? (
              <span
                style={{
                  display: "inline-block",
                  width: px(10),
                  height: px(20),
                  marginLeft: px(2),
                  marginBottom: px(-3),
                  background: INK,
                }}
              />
            ) : null}
          </div>

          {/* resolving line + progress bar */}
          <div style={{ opacity: resolveOpacity, marginTop: px(12) }}>
            <div style={{ color: hexA("#8A8A90", 0.85), fontSize: px(13.5) }}>
              {p.resolvingLine}
            </div>
            <div
              style={{
                marginTop: px(8),
                height: px(5),
                width: "100%",
                borderRadius: px(3),
                background: hexA("#FFFFFF", 0.06),
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${barFill * 100}%`,
                  borderRadius: px(3),
                  background: `linear-gradient(90deg, ${accent}, #FFB23C)`,
                  boxShadow: `0 0 ${px(10)}px ${hexA(accent, 0.6)}`,
                }}
              />
            </div>
          </div>

          {/* ✓ success line — pops in last */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(8),
              marginTop: px(14),
              opacity: okOpacity,
              transform: `translateY(${okY}px)`,
              color: p.successColor,
              fontWeight: 600,
            }}
          >
            <CheckBadge px={px} color={p.successColor} />
            <span>{p.successLine}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom two-tone kinetic subtitle ── */}
      <div
        style={{
          position: "absolute",
          left: px(56),
          right: px(48),
          top: px(900),
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: px(40),
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
        }}
      >
        {subWords.map((w, i) => {
          const start = SUB_START + i * SUB_STEP;
          const op = interpolate(frame, [start, start + 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const ty = interpolate(frame, [start, start + 6], [px(10), 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const isAccent = p.subtitleAccentFrom >= 0 && i >= p.subtitleAccentFrom;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: px(12),
                opacity: op,
                transform: `translateY(${ty}px)`,
                color: isAccent ? accent : INK,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const KickerPill: React.FC<{
  frame: number;
  fps: number;
  px: (n: number) => number;
  accent: string;
  text: string;
  top: number;
  showDot: boolean;
}> = ({ frame, fps, px, accent, text, top, showDot }) => {
  // Fade + drop from y−16px over 6f; accent dot ignites 4f.
  const sp = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 120 },
    durationInFrames: 6,
  });
  const op = sp;
  const ty = interpolate(sp, [0, 1], [-px(16), 0]);
  const dotGlow = interpolate(frame, [2, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: px(56),
        top,
        display: "inline-flex",
        alignItems: "center",
        // Source pill is dot-less mono text → tighter gap when no dot.
        gap: showDot ? px(10) : 0,
        padding: `${px(9)}px ${px(18)}px`,
        // Source pill is fully pill-rounded (not the rounded-rect r10).
        borderRadius: px(999),
        background: hexA(accent, 0.1),
        border: `1px solid ${hexA(accent, 0.45)}`,
        boxShadow: `0 0 ${px(22)}px ${hexA(accent, 0.18 * dotGlow)}`,
        opacity: op,
        transform: `translateY(${ty}px)`,
      }}
    >
      {showDot ? (
      <span
        style={{
          width: px(9),
          height: px(9),
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.9 * dotGlow)}`,
        }}
      />
      ) : null}
      <span
        style={{
          fontFamily: FONT_STACKS.mono,
          fontWeight: 600,
          fontSize: px(15),
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Dot: React.FC<{ px: (n: number) => number; color: string }> = ({ px, color }) => (
  <span
    style={{
      width: px(11),
      height: px(11),
      borderRadius: "50%",
      background: color,
      display: "inline-block",
    }}
  />
);

const CheckBadge: React.FC<{ px: (n: number) => number; color: string }> = ({ px, color }) => (
  <span
    style={{
      width: px(18),
      height: px(18),
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: `${px(1.5)}px solid ${color}`,
      flex: "0 0 auto",
    }}
  >
    <svg width={px(11)} height={px(11)} viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6.2 L4.8 8.5 L9.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);
