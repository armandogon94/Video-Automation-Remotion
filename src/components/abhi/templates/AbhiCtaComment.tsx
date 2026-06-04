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

/**
 * AbhiCtaComment — "cta-comment-outro" foreground template.
 *
 * The signature abhishek.devini closer: a centered "Comment "AI"" lockup with
 * a frosted mono kicker pill, a gradient/accent-swept giant headline word, a
 * subtitle, a handle pill, and a faint "follow for more" footer rule.
 *
 * FOREGROUND ONLY — the shared AbhiBackground (light-mesh by default for this
 * scene, dark-grid-glow supported via props) is mounted separately by the host
 * AbhiScene9x16. This component renders transparent over it.
 *
 * Choreography (transitionVerb, frames @30fps, scene-local timeline):
 *  - Kicker pill fades + drops from y-16px over f1-6 (dot ignites).
 *  - "Comment" fades up over 6f (from ~f6).
 *  - Giant "AI" snaps in scale 1.06->1 over ~8f (from ~f10) while the
 *    gradient/accent sweeps L->R across the glyphs + a glow bloom; a blinking
 *    caret bar pulses beside it.
 *  - Optional input bar slides up from +40px over 8f; send button pops
 *    (overshoot) 6f after.
 *  - Subtitle + handle pill rise from below 4-6f later, then a faint
 *    "follow for more" footer rule fades in last.
 */

// Mesh px measure: spec px-at-720 * 1.5 == px on the 1080-wide canvas.
const M = 1.5;

export const abhiCtaCommentSchema = z.object({
  /** Background family this foreground is tuned against. Drives ink defaults. */
  bgMode: z.enum(["dark", "light"]).default("light"),
  /** Single accent — used for the kicker dot, caret, and (if gradient off) the giant word. */
  accentColor: z.string().default("#FD9B00"),
  /** When true, the giant word is filled with a blue->purple->pink gradient
   *  (the LIGHT-mesh outro look) instead of the flat accent color. */
  useGradient: z.boolean().default(true),
  /** Gradient stops for the giant word (left -> right) when useGradient. */
  gradientFrom: z.string().default("#8789ED"),
  gradientMid: z.string().default("#9A8AF9"),
  gradientTo: z.string().default("#D99BCC"),

  kicker: z.string().default("GET THE LINK"),
  /** Small lead-in word above the giant word. */
  commentLabel: z.string().default("Comment"),
  /** The giant hero word — quoted by default ("AI"). */
  giantWord: z.string().default("“AI”"),
  subtitle: z.string().default("y te envío el repo de GitHub por DM."),

  /** Optional comment/input bar (off by default — the cleanest gradient outro omits it). */
  showInputBar: z.boolean().default(false),
  inputText: z.string().default("A I"),
  sendLabel: z.string().default("Post"),

  handle: z.string().default("@armandointeligencia"),
  /** Brand gradient stops for the handle text fill (left -> right). His source
   *  uses a holographic pill; we instead pour MY brand mix — navy -> gold ->
   *  navy — into the handle glyphs via background-clip:text. */
  handleFrom: z.string().default("#1B3A6E"),
  handleMid: z.string().default("#D4AF37"),
  handleTo: z.string().default("#1B3A6E"),
  /** Faint footer rule under the handle. Empty string hides it. */
  footer: z.string().default("FOLLOW FOR MORE"),
});

export type AbhiCtaCommentProps = z.infer<typeof abhiCtaCommentSchema>;

export const AbhiCtaComment: React.FC<Partial<AbhiCtaCommentProps>> = (
  props,
) => {
  const p = abhiCtaCommentSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.bgMode === "dark";

  // Ink palette per background family (never pure white / pure black).
  const inkHeadline = isDark ? "#F2F2F4" : "#0C0C12";
  const inkComment = isDark ? "#C8C8CC" : "#56606A";
  const inkSubtitle = isDark ? "#9A9AA0" : "#5A5A66";
  const inkKicker = isDark ? "#C8C8CC" : "#3A3A46";

  // Frosted-surface tokens.
  const pillFill = isDark ? "rgba(45,20,19,0.55)" : "rgba(255,255,255,0.62)";
  const pillBorder = isDark
    ? `1px solid ${hexA(p.accentColor, 0.35)}`
    : "1px solid rgba(255,255,255,0.85)";
  const pillShadow = isDark
    ? "0 6px 22px rgba(0,0,0,0.35)"
    : "0 8px 26px rgba(120,120,160,0.20)";
  const handleFill = isDark
    ? "rgba(24,26,33,0.55)"
    : "rgba(255,255,255,0.55)";

  // ---- Timeline helpers (scene-local, animate from 0 then HOLD) ----------
  const fadeUp = (start: number, dur: number, dy: number) => {
    const o = interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const ty = interpolate(frame, [start, start + dur], [dy, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { opacity: o, translateY: ty };
  };

  // Kicker pill — fade + drop from y-16px (24px on canvas) over f1-6.
  const kicker = fadeUp(1, 6, -16 * M);
  const dotGlow = interpolate(frame, [1, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Comment" — fades up from ~f6.
  const comment = fadeUp(6, 7, 14 * M);

  // Giant "AI" — snap in scale 1.06->1 over ~8f from f10.
  const aiStart = 10;
  const aiSpring = spring({
    frame: frame - aiStart,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.7 },
  });
  const aiOpacity = interpolate(frame, [aiStart, aiStart + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aiScale = interpolate(aiSpring, [0, 1], [1.06, 1]);
  // Gradient sweep L->R across the glyphs over ~8f.
  const sweep = interpolate(frame, [aiStart, aiStart + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Glow bloom behind the giant word — 8-14f, slower than the word.
  const bloom = interpolate(frame, [aiStart, aiStart + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bloomBreathe = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 1.1);
  // Blinking caret beside the giant word (~15f cycle).
  const caretOn = frame > aiStart + 6 && Math.floor(frame / 8) % 2 === 0;

  // Optional input bar — slides up +40px over 8f from f20.
  const inputBar = fadeUp(20, 8, 40 * M);
  const sendSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, stiffness: 170, mass: 0.6 },
  });
  const sendScale = interpolate(sendSpring, [0, 1], [0.4, 1]);

  // Subtitle + handle pill — rise 4-6f after the giant word group.
  const subtitle = fadeUp(22, 7, 16 * M);
  const handlePill = fadeUp(28, 8, 18 * M);

  // Footer rule — last.
  const footer = fadeUp(36, 8, 10 * M);

  // ---- Giant-word fill --------------------------------------------------
  const giantFill: React.CSSProperties = p.useGradient
    ? {
        backgroundImage: `linear-gradient(90deg, ${p.gradientFrom} 0%, ${p.gradientMid} 50%, ${p.gradientTo} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        // The sweep reveals saturation L->R; before the sweep the un-revealed
        // portion stays faint (washed toward the ink), matching the source.
        WebkitMaskImage: `linear-gradient(90deg, #000 ${sweep}%, rgba(0,0,0,0.18) ${Math.min(
          sweep + 18,
          100,
        )}%)`,
        maskImage: `linear-gradient(90deg, #000 ${sweep}%, rgba(0,0,0,0.18) ${Math.min(
          sweep + 18,
          100,
        )}%)`,
      }
    : {
        color: p.accentColor,
        WebkitMaskImage: `linear-gradient(90deg, #000 ${sweep}%, rgba(0,0,0,0.18) ${Math.min(
          sweep + 18,
          100,
        )}%)`,
        maskImage: `linear-gradient(90deg, #000 ${sweep}%, rgba(0,0,0,0.18) ${Math.min(
          sweep + 18,
          100,
        )}%)`,
      };

  const bloomColor = p.useGradient ? p.gradientMid : p.accentColor;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* Kicker pill — y18% */}
        <div
          style={{
            position: "absolute",
            top: `${18}%`,
            left: "50%",
            transform: `translate(-50%, ${kicker.translateY}px)`,
            opacity: kicker.opacity,
            display: "flex",
            alignItems: "center",
            gap: 10 * M,
            padding: `${9 * M}px ${18 * M}px`,
            borderRadius: 999,
            background: pillFill,
            border: pillBorder,
            boxShadow: pillShadow,
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: 8 * M,
              height: 8 * M,
              borderRadius: 999,
              background: p.accentColor,
              boxShadow: `0 0 ${10 * M * dotGlow}px ${hexA(
                p.accentColor,
                0.8,
              )}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: 14 * M,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: inkKicker,
            }}
          >
            {p.kicker}
          </span>
        </div>

        {/* Hero cluster — anchored so "Comment" sits at ~y35% */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* "Comment" lead-in */}
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 52 * M,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              color: inkComment,
              opacity: comment.opacity,
              transform: `translateY(${comment.translateY}px)`,
            }}
          >
            {p.commentLabel}
          </div>

          {/* Giant word with glow bloom */}
          <div
            style={{
              position: "relative",
              marginTop: 14 * M,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: aiOpacity,
              transform: `scale(${aiScale})`,
            }}
          >
            {/* Glow bloom backer */}
            <div
              style={{
                position: "absolute",
                width: 360 * M,
                height: 360 * M,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${hexA(
                  bloomColor,
                  0.34,
                )} 0%, ${hexA(bloomColor, 0)} 68%)`,
                opacity: bloom * 0.9,
                transform: `scale(${bloomBreathe})`,
                filter: "blur(6px)",
                zIndex: 0,
              }}
            />
            <span
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: 150 * M,
                letterSpacing: "-0.02em",
                lineHeight: 0.98,
                ...giantFill,
              }}
            >
              {p.giantWord}
            </span>
            {/* Blinking caret bar */}
            <span
              style={{
                position: "relative",
                zIndex: 1,
                marginLeft: 8 * M,
                width: 10 * M,
                height: 110 * M,
                borderRadius: 3 * M,
                background: p.accentColor,
                opacity: caretOn ? 0.9 : 0,
              }}
            />
          </div>

          {/* Subtitle */}
          <div
            style={{
              marginTop: 18 * M,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 30 * M,
              letterSpacing: "-0.005em",
              color: inkSubtitle,
              textAlign: "center",
              opacity: subtitle.opacity,
              transform: `translateY(${subtitle.translateY}px)`,
            }}
          >
            {p.subtitle}
          </div>

          {/* Optional input/comment bar */}
          {p.showInputBar ? (
            <div
              style={{
                marginTop: 26 * M,
                display: "flex",
                alignItems: "center",
                gap: 12 * M,
                padding: `${10 * M}px ${10 * M}px ${10 * M}px ${14 * M}px`,
                borderRadius: 999,
                minWidth: 360 * M,
                background: handleFill,
                border: pillBorder,
                boxShadow: pillShadow,
                backdropFilter: "blur(10px)",
                opacity: inputBar.opacity,
                transform: `translateY(${inputBar.translateY}px)`,
              }}
            >
              {/* avatar with accent ring */}
              <span
                style={{
                  width: 30 * M,
                  height: 30 * M,
                  borderRadius: "50%",
                  background: hexA(p.accentColor, 0.18),
                  border: `2px solid ${p.accentColor}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 700,
                  fontSize: 24 * M,
                  letterSpacing: "0.04em",
                  color: inkHeadline,
                }}
              >
                {p.inputText}
                <span style={{ opacity: caretOn ? 1 : 0, color: p.accentColor }}>
                  {" "}
                  |
                </span>
              </span>
              {/* send button */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${8 * M}px ${16 * M}px`,
                  borderRadius: 999,
                  background: p.accentColor,
                  color: "#0C0C12",
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize: 20 * M,
                  transform: `scale(${sendScale})`,
                }}
              >
                {p.sendLabel}
              </span>
            </div>
          ) : null}

          {/* Handle pill — navy->gold->navy brand gradient poured into the
              glyphs via background-clip:text (polished grotesk-mono). The
              Instagram glyph is tinted to the navy stop so the lockup reads as
              one branded unit. */}
          <div
            style={{
              marginTop: 24 * M,
              display: "flex",
              alignItems: "center",
              gap: 11 * M,
              padding: `${11 * M}px ${24 * M}px`,
              borderRadius: 999,
              background: handleFill,
              border: pillBorder,
              boxShadow: pillShadow,
              backdropFilter: "blur(10px)",
              opacity: handlePill.opacity,
              transform: `translateY(${handlePill.translateY}px)`,
            }}
          >
            <InstagramGlyph size={22 * M} color={p.handleFrom} />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: 24 * M,
                letterSpacing: "-0.005em",
                lineHeight: 1,
                textAlign: "center",
                backgroundImage: `linear-gradient(95deg, ${p.handleFrom} 0%, ${p.handleMid} 52%, ${p.handleTo} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {p.handle}
            </span>
          </div>

          {/* Footer rule */}
          {p.footer ? (
            <div
              style={{
                marginTop: 18 * M,
                display: "flex",
                alignItems: "center",
                gap: 10 * M,
                opacity: footer.opacity * 0.45,
                transform: `translateY(${footer.translateY}px)`,
              }}
            >
              <span
                style={{
                  width: 22 * M,
                  height: 1,
                  background: inkSubtitle,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_STACKS.mono,
                  fontWeight: 600,
                  fontSize: 13 * M,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: inkSubtitle,
                }}
              >
                {p.footer}
              </span>
              <span
                style={{
                  width: 22 * M,
                  height: 1,
                  background: inkSubtitle,
                }}
              />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- helpers --------------------------------------------------------------

/** Convert a #rrggbb hex to an rgba() string at the given alpha. */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const InstagramGlyph: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
    <circle cx={12} cy={12} r={4} />
    <circle cx={17.5} cy={6.5} r={0.6} fill={color} stroke={color} />
  </svg>
);
