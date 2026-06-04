/**
 * AbhiTweetCard — replica of abhishek.devini's "tweet-card" / chat-exchange scene.
 * FOREGROUND ONLY: the shared AbhiBackground (dark-grid-glow) is mounted separately
 * by the host AbhiScene9x16, so this renders transparent over it and draws ONLY the
 * local bubble + reply-card surfaces.
 *
 * Despite the "tweet-card" name, the corpus instance is a CHAT EXCHANGE: a mono
 * kicker pill leads, a giant two-tone headline rises word-by-word (one accent word),
 * then a right-aligned plain USER message bubble slides up, and finally a left-aligned
 * MODEL REPLY card slides up beneath it — the reply card carries an accent GLOW BORDER
 * and a header lockup (Anthropic burst spark + "● OPUS 4.8") above a ⚠ warning body line.
 *
 * Source ground-truth: DY6pP0FP4Qa 46.0–52.0s (DARK, accent amber `#FAB400`):
 *   kicker "● BACKBONE"; headline "It won't just nod along to keep you happy." (`nod`
 *   amber); user bubble "Let's just skip the migration and ship."; reply card
 *   "✳ OPUS 4.8 / ⚠ That'll drop user data. Bad plan — here's a safer path."
 * Alt instance: DYukIE0PFac 6.0–8.5s (two overlapping RESPONSE cards).
 *
 * Choreography (transitionVerb): "Headline fades up 6f; user bubble slides up + fades
 * 8f; reply card slides up beneath then its accent border-glow fades in ~6f."
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

/** "" sentinel = "caller did not override" (avoids zod v4 reflection on defaults). */
const S = "";

export const abhiTweetCardSchema = z.object({
  /** Single accent color — defaults to Claude amber (this scene's sampled hue). */
  accentColor: z.string().default("#FAB400"),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono kicker, UPPERCASE. Centered pill. */
  kicker: z.string().default("BACKBONE"),
  /** Two-tone headline words; one word index recolored to the accent. */
  headline: z.string().default("It won't just nod along to keep you happy."),
  /** Index (0-based, by word) of the single accent word. -1 = none. */
  headlineAccentWord: z.number().default(3),
  /** Headline cap-height as % of 720w (spec 7–12). */
  headlineSizePct: z.number().default(7.4),
  /** Right-aligned plain USER message bubble text. "" hides the bubble. */
  userMessage: z.string().default("“Let’s just skip the migration and ship.”"),
  /** Reply-card header label (after the spark), e.g. a model lockup. UPPERCASE mono. */
  replyAuthor: z.string().default("OPUS 4.8"),
  /** Leading glyph on the reply body line (warning / check / arrow). "" hides it. */
  replyGlyph: z.string().default("⚠"),
  /** Reply-card body text (the model's pushback). "" hides the whole reply card. */
  replyBody: z.string().default("That’ll drop user data. Bad plan — here’s a safer path."),
  /** Bottom mono caption that fades in last (accent dot prefix, UPPERCASE). "" hides it. */
  footerNote: z.string().default("IF YOUR PLAN'S BAD · IT'LL CALL IT OUT"),
});
export type AbhiTweetCardProps = z.infer<typeof abhiTweetCardSchema>;

const PX = 1080; // width basis: 1px@720-spec → 1.5px on this 1080-wide canvas
const k = (specPx720: number) => specPx720 * (PX / 720);

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(250,180,0,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiTweetCard: React.FC<Partial<AbhiTweetCardProps>> = (props) => {
  const p = abhiTweetCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const subInk = isDark ? "#C8C8CC" : "#19151F";
  const kickerGrey = isDark ? "#C8C8CC" : "#5A5A66";
  const accent = p.accentColor;

  // Local surface tokens (sampled from the source frames).
  const kickerPillBg = isDark ? "rgba(34,30,36,0.85)" : "rgba(244,244,250,0.88)";
  const kickerPillBorder = isDark
    ? "1px solid rgba(255,255,255,0.10)"
    : "1px solid rgba(12,12,18,0.08)";
  const userBubbleBg = isDark ? "#1E1B20" : "#F1EDF4";
  const userBubbleBorder = isDark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(12,12,18,0.06)";
  const replyCardBg = isDark ? "#16131A" : "#FBF7FB";

  // ── Geometry ──
  const marginX = k(56); // x≈8%
  const headlinePx = (p.headlineSizePct / 100) * PX;
  const kickerPx = k(14);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  //   f1–6    kicker pill fades + drops from y−16px (×1.5 → −24px), dot ignites
  //   f4–     headline rises word-by-word from +18px, ~4f apart; accent word
  //           tint-sweeps white→accent over ~8f on landing
  //   f20–28  user message bubble slides up +28px + fades over 8f
  //   f30–    reply card slides up +30px + fades (10–12f); then its accent
  //           border-glow fades in over ~6f; header spark + body reveal after
  // ============================================================

  // --- Kicker pill: fade + drop from y−24px over f1–6, accent dot glow f4 ---
  const kickerSp = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 170 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerSp, [0, 1], [-k(16), 0]);
  const kickerOpacity = kickerSp;
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Headline: word-by-word rise ~1 word / 4f, starting ~f4 ---
  const headWords = p.headline.split(" ");
  const HEAD_START = 4;
  const HEAD_STEP = 4;

  // --- User message bubble: slide up + fade over 8f, starting ~f20 ---
  const USER_START = 20;
  const userSp = spring({
    frame: frame - USER_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 130 },
    durationInFrames: 10,
  });
  const userY = interpolate(userSp, [0, 1], [k(28), 0]);
  const userOpacity = interpolate(frame, [USER_START, USER_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hasUser = p.userMessage.trim() !== S;

  // --- Reply card: slide up + fade (10–12f) from ~f30, then border-glow blooms ---
  const REPLY_START = 30;
  const replySp = spring({
    frame: frame - REPLY_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120 },
    durationInFrames: 12,
  });
  const replyY = interpolate(replySp, [0, 1], [k(30), 0]);
  const replyOpacity = interpolate(frame, [REPLY_START, REPLY_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Accent border-glow fades in ~6f after the card has mostly landed, then idles.
  const GLOW_START = REPLY_START + 6;
  const glowIn = interpolate(frame, [GLOW_START, GLOW_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Source glow is a RESTRAINED thin amber edge, not a neon bloom — keep the
  // breathe nearly imperceptible so the card edge reads as a soft halo, not a pulse.
  const glowBreathe = 1 + 0.05 * Math.sin((frame / 30) * Math.PI * 2);
  const glowAlpha = glowIn * glowBreathe;
  // Header lockup (spark + author) + body reveal after the card lands.
  const HEAD_REVEAL = REPLY_START + 8;
  const replyHeadOp = interpolate(frame, [HEAD_REVEAL, HEAD_REVEAL + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const BODY_REVEAL = REPLY_START + 11;
  const replyBodyOp = interpolate(frame, [BODY_REVEAL, BODY_REVEAL + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hasReply = p.replyBody.trim() !== S;

  // --- Footer mono caption: fades + rises in last (after the reply card lands) ---
  const FOOTER_START = REPLY_START + 18;
  const footerOp = interpolate(frame, [FOOTER_START, FOOTER_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const footerY = interpolate(frame, [FOOTER_START, FOOTER_START + 8], [k(10), 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const hasFooter = p.footerNote.trim() !== S;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Centered content column: kicker + headline ── */}
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: k(330),
        }}
      >
        {/* Kicker pill (centered) */}
        <div
          style={{
            transform: `translateY(${kickerY}px)`,
            opacity: kickerOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: k(8),
            padding: `${k(8)}px ${k(16)}px`,
            borderRadius: 999,
            background: kickerPillBg,
            border: kickerPillBorder,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: k(7),
              height: k(7),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${k(4) + dotGlow * k(7)}px ${hexA(
                accent,
                0.4 + dotGlow * 0.5,
              )}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: kickerPx,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: kickerGrey,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>

        {/* Giant two-tone headline (centered, word-by-word rise) */}
        <h1
          style={{
            margin: `${k(22)}px 0 0`,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: headlinePx,
            letterSpacing: "-0.02em",
            lineHeight: 1.06,
            textAlign: "center",
            color: ink,
            maxWidth: "84%",
            overflowWrap: "break-word",
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
            const isAccent =
              p.headlineAccentWord >= 0 && i === p.headlineAccentWord;
            // Accent word tint-sweeps white→accent L→R via a clip-revealed overlay.
            const sweep = interpolate(
              frame,
              [start + 4, start + 12],
              [0, 100],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.quad),
              },
            );
            // Per-word BLUR-IN (the source's signature reveal): each word arrives
            // out-of-focus and sharpens over ~7f as it springs up.
            const blurPx = interpolate(frame, [start, start + 7], [k(10), 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: k(13),
                  opacity: sp,
                  transform: `translateY(${interpolate(sp, [0, 1], [k(14), 0])}px)`,
                  filter: blurPx > 0.15 ? `blur(${blurPx}px)` : "none",
                  position: "relative",
                }}
              >
                <span style={{ color: ink }}>{w}</span>
                {isAccent ? (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      color: accent,
                      clipPath: `inset(0 ${100 - sweep}% 0 0)`,
                    }}
                  >
                    {w}
                  </span>
                ) : null}
              </span>
            );
          })}
        </h1>
      </AbsoluteFill>

      {/* ── User message bubble (right-aligned) ── */}
      {hasUser ? (
        <div
          style={{
            position: "absolute",
            right: marginX,
            top: k(660),
            maxWidth: k(470),
            opacity: userOpacity,
            transform: `translateY(${userY}px)`,
            padding: `${k(16)}px ${k(22)}px`,
            borderRadius: k(18),
            borderBottomRightRadius: k(6),
            background: userBubbleBg,
            border: userBubbleBorder,
            boxShadow: `0 ${k(10)}px ${k(30)}px ${hexA("#000000", isDark ? 0.4 : 0.12)}`,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: k(24),
            lineHeight: 1.3,
            letterSpacing: "-0.005em",
            color: subInk,
            textAlign: "left",
          }}
        >
          {p.userMessage}
        </div>
      ) : null}

      {/* ── Model reply card (left-aligned, accent glow border) ── */}
      {hasReply ? (
        <div
          style={{
            position: "absolute",
            left: marginX,
            top: k(800),
            width: k(610),
            opacity: replyOpacity,
            transform: `translateY(${replyY}px)`,
            padding: `${k(18)}px ${k(22)}px ${k(22)}px`,
            borderRadius: k(18),
            borderBottomLeftRadius: k(6),
            background: replyCardBg,
            border: `1.5px solid ${hexA(accent, 0.22 + 0.5 * glowAlpha)}`,
            boxShadow: `0 0 ${k(2) + k(14) * glowAlpha}px ${hexA(
              accent,
              0.22 * glowAlpha,
            )}, inset 0 0 ${k(20)}px ${hexA(accent, 0.05 * glowIn)}, 0 ${k(
              12,
            )}px ${k(34)}px ${hexA("#000000", isDark ? 0.5 : 0.14)}`,
            boxSizing: "border-box",
          }}
        >
          {/* Header lockup: Anthropic burst spark + author label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: k(8),
              opacity: replyHeadOp,
              marginBottom: k(10),
            }}
          >
            <Spark size={k(15)} color={accent} />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: k(13),
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {p.replyAuthor}
            </span>
          </div>

          {/* Body line: optional leading glyph + reply text */}
          <div
            style={{
              opacity: replyBodyOp,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: k(25),
              lineHeight: 1.32,
              letterSpacing: "-0.005em",
              color: ink,
            }}
          >
            {p.replyGlyph.trim() !== S ? (
              <span style={{ marginRight: k(8), color: accent }}>
                {p.replyGlyph}
              </span>
            ) : null}
            {p.replyBody}
          </div>
        </div>
      ) : null}

      {/* ── Footer mono caption (centered, accent dot prefix) ── */}
      {hasFooter ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: k(1010),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: k(8),
            opacity: footerOp,
            transform: `translateY(${footerY}px)`,
          }}
        >
          <span
            style={{
              width: k(6),
              height: k(6),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${k(6)}px ${hexA(accent, 0.7)}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: k(12),
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: isDark ? "#6E6E76" : "#7A7A86",
              whiteSpace: "nowrap",
            }}
          >
            {p.footerNote}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── Anthropic-style burst spark (radiating spokes), inline SVG ──
const Spark: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const spokes = 8;
  const c = 12;
  const rIn = 1.6;
  const rOut = 11;
  const lines = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * Math.PI * 2;
    const x1 = c + Math.cos(a) * rIn;
    const y1 = c + Math.sin(a) * rIn;
    const x2 = c + Math.cos(a) * rOut;
    const y2 = c + Math.sin(a) * rOut;
    return { x1, y1, x2, y2 };
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={color}
          strokeWidth={2.1}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
