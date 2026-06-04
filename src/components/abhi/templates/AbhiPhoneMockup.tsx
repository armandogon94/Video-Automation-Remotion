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
 * AbhiPhoneMockup — replica of abhishek.devini's "phone-mockup" scene
 * (the "run it from your phone / mobile demo / pick-a-style preset" beat).
 * FOREGROUND ONLY: the shared AbhiBackground (DARK dark-grid-glow OR LIGHT
 * light-mesh) is mounted separately by the host AbhiScene9x16, so this renders
 * transparent over it — it only draws the local kicker pill + the phone surface.
 *
 * A tall rounded phone frame (notch / Dynamic-Island pill) floats centered over
 * the field with a gentle continuous bob + a slight parallax tilt. The app
 * screen inside reveals top-down: a small chip, a circular app icon, a two-tone
 * title, then a stack of list rows (org roster / chat / notification rows)
 * populating one-by-one ~3–4f/row, closing on a pagination-dot strip.
 *
 * Source ground-truth (CLEANEST): DYUcj5iPAxL ~23–27s (LIGHT mesh, "● PICK A
 * STYLE" kicker → frosted phone card: "● GLASS" chip + Anthropic burst icon +
 * "Multimodal / without the demo." + "PRESET — GRAPHIFY / Glass family
 * 1080×1920" row + pagination dots). Corpus alt: DX4GVwQPyaD ~46s (DARK iPhone
 * listing CEO/Engineers/Marketing/Copy rows top-down) — same device, dark mode.
 *
 * Choreography (transitionVerb):
 *   • Kicker pill fades + drops from y−16px over 6f (accent dot ignites 4f).
 *   • Phone rises +20px (or slides −80px from left) + scales 0.94→1 + fades over
 *     10–12f with a slight parallax tilt that settles to a gentle idle bob.
 *   • Screen chrome / chip / icon land first, then the title two-tone reveals,
 *     then list rows populate top-down ~3.5f/row (each fade + slide-in 6px).
 *   • Pagination dots pop in last (active dot accent-colored).
 *
 * Canvas 1080×1920 @30fps. Spec measures are % of 720w → px = specPx720 × 1.5.
 */

/** "" sentinel = "caller did not override" (avoids zod reflection on defaults). */
const S = "";

const rowSchema = z.object({
  /** Left label / glyph for the row (emoji or short caps, e.g. "👤" / "CEO"). */
  glyph: z.string().default(""),
  /** Bold primary line of the row. */
  title: z.string().default(""),
  /** Grey secondary caption (one line). "" hides it. */
  caption: z.string().default(""),
  /** Right-aligned mono status badge (UPPERCASE), e.g. "ACTIVE". "" hides it. */
  status: z.string().default(""),
});

export const abhiPhoneMockupSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + phone surface colors. */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Entrance: phone rises from below ("rise") or slides in from the left edge. */
  entrance: z.enum(["rise", "slide-left"]).default("rise"),

  /** Mono kicker pill above the phone, UPPERCASE. "" hides it. */
  kicker: z.string().default("PICK A STYLE"),

  /**
   * Optional kinetic headline ABOVE the phone (source's dominant element). Words
   * reveal one-by-one — pending words are greyed, landed words go solid ink with
   * the accent words tinted. "" hides the headline (kicker-only layout).
   */
  headline: z.string().default(""),
  /** Space-separated words within `headline` to recolor with the accent. */
  headlineAccentWords: z.string().default(""),

  /**
   * Phone screen tone. "auto" follows `mode`; "dark"/"light" force the screen
   * UI tone independent of the background (source uses a DARK app over LIGHT bg).
   */
  screenMode: z.enum(["auto", "dark", "light"]).default("auto"),

  /** Small chip at the top of the screen (mono caps, accent dot). "" hides it. */
  screenChip: z.string().default("GLASS"),
  /** Letter for the circular app icon (rendered as the Anthropic burst if "✳"). */
  appIcon: z.string().default("✳"),

  /** Two-tone screen title — ink words + the accent clause that follows. */
  titlePre: z.string().default("Multimodal"),
  /** The accent clause of the title (recolored). "" = none. */
  titleAccent: z.string().default("without the demo."),

  /** List rows populating top-down inside the screen (1–5). */
  rows: z.array(rowSchema).default([
    { glyph: "◆", title: "Glass family", caption: "1080×1920 · GRAPHIFY" },
    { glyph: "◇", title: "Mesh light", caption: "9:16 · pastel bloom" },
    { glyph: "▦", title: "Dark grid glow", caption: "warm radial · mono" },
  ]),

  /** Pagination dots under the screen; activeDot is 0-based. -1 = no dots. */
  dotCount: z.number().default(5),
  /** Which dot is the accent-active one. */
  activeDot: z.number().default(1),

  /**
   * Optional mono UPPERCASE footer line pinned to the bottom of the screen
   * (source's "ORG RUNNING · 24/7" status line). When set it REPLACES the
   * pagination dots. "" hides it.
   */
  screenFooter: z.string().default(""),
});

export type AbhiPhoneMockupProps = z.infer<typeof abhiPhoneMockupSchema>;
export type AbhiPhoneRow = z.infer<typeof rowSchema>;

// ── Palette ──────────────────────────────────────────────────────────────────
// DARK family (warm near-black). LIGHT family (frosted pastel-mesh).
const DARK = {
  ink: "#F2F2F4",
  grey: "#9A9AA0",
  phoneFill: "#15161D",
  phoneChrome: "#1A1B22",
  phoneEdge: "rgba(255,255,255,0.10)",
  rowFill: "rgba(255,255,255,0.05)",
  rowEdge: "rgba(255,255,255,0.08)",
  notch: "#000000",
  pillBg: "rgba(45,20,19,0.55)",
};
const LIGHT = {
  ink: "#0C0C12",
  grey: "#5A5A66",
  phoneFill: "#F6F2F7",
  phoneChrome: "#FBF8FB",
  phoneEdge: "rgba(255,255,255,0.85)",
  rowFill: "rgba(255,255,255,0.72)",
  rowEdge: "rgba(12,12,18,0.06)",
  notch: "#15131A",
  pillBg: "rgba(248,244,250,0.9)",
};

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

export const AbhiPhoneMockup: React.FC<Partial<AbhiPhoneMockupProps>> = (
  props,
) => {
  const p = abhiPhoneMockupSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 720→1080 scale factor for spec measures.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const isDark = p.mode === "dark";
  const C = isDark ? DARK : LIGHT;
  const accent = p.accentColor;

  // Screen tone can be forced independent of bg (source: dark app over light bg).
  const screenDark =
    p.screenMode === "dark" ? true : p.screenMode === "light" ? false : isDark;
  const SC = screenDark ? DARK : LIGHT;

  // ── Optional kinetic headline above the phone ──
  const headlineWords = p.headline.trim() === S ? [] : p.headline.trim().split(/\s+/);
  const hasHeadline = headlineWords.length > 0;
  const accentSet = new Set(
    p.headlineAccentWords
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0),
  );

  // ── Phone geometry: tall portrait frame, centered, ~52% of width wide. ──
  const phoneW = px(248); // ≈ 372px @1080 (≈ 34% of canvas — leaves mesh margins)
  const phoneH = phoneW * 2.05; // tall 9:18-ish device
  const phoneLeft = (width - phoneW) / 2;
  // When a headline is present the phone drops lower to clear it (source layout:
  // headline upper third, phone lower two-thirds).
  const phoneTop = (height - phoneH) / 2 + px(hasHeadline ? 86 : 28);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  // ============================================================

  // ── Kicker pill: fade + drop from y−16px over f1–6; accent dot ignites f2–6 ──
  const hasKicker = p.kicker.trim() !== S;
  const kickerSpring = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 120 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerSpring, [0, 1], [-px(16), 0]);
  const kickerOpacity = kickerSpring;
  const dotGlow = interpolate(frame, [2, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Kinetic headline: words land one-by-one (pending greyed, landed solid) ──
  const HEAD_START = 4;
  const HEAD_WORD_STEP = 4; // ~4f per word
  const wordState = (i: number): { t: number } => {
    const ws = HEAD_START + i * HEAD_WORD_STEP;
    const t = interpolate(frame, [ws, ws + 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { t };
  };

  // ── Phone frame: rise/slide + scale 0.94→1 + fade over ~12f from f6 ──
  const PHONE_START = 6;
  const phoneSpring = spring({
    frame: frame - PHONE_START,
    fps,
    config: { damping: 190, mass: 0.9, stiffness: 90 },
    durationInFrames: 14,
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.94, 1]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);
  const fromLeft = p.entrance === "slide-left";
  const phoneEnterX = fromLeft
    ? interpolate(phoneSpring, [0, 1], [-px(80), 0])
    : 0;
  const phoneEnterY = fromLeft
    ? 0
    : interpolate(phoneSpring, [0, 1], [px(20), 0]);
  // Parallax tilt: enters tilted, settles to a tiny idle bob/tilt.
  const tiltIn = interpolate(phoneSpring, [0, 1], [fromLeft ? 6 : -4, 0]);
  // Continuous idle float once landed (gentle bob + micro-tilt).
  const landed = interpolate(frame, [PHONE_START + 14, PHONE_START + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bobY = Math.sin((frame / 30) * Math.PI * 2 * 0.5) * px(6) * landed;
  const idleTilt = Math.sin((frame / 30) * Math.PI * 2 * 0.5 + 0.6) * 1.1 * landed;
  const phoneTilt = tiltIn + idleTilt;

  // ── On-screen content reveal schedule (after phone has mostly landed) ──
  const SCREEN_START = PHONE_START + 8; // f14
  const CHIP_START = SCREEN_START; // chip + icon land first
  const TITLE_START = SCREEN_START + 5; // two-tone title
  const ROWS_START = TITLE_START + 6; // first row begins
  const ROW_STEP = 3.5; // ~3–4f / row (spec)
  const DOTS_START = ROWS_START + p.rows.length * ROW_STEP + 3;

  // Generic "fade + slide-up" reveal helper for screen elements.
  const reveal = (start: number, dur = 6, slide = 8) => {
    const sp = spring({
      frame: frame - start,
      fps,
      config: { damping: 200, mass: 0.6, stiffness: 130 },
      durationInFrames: dur,
    });
    return {
      opacity: sp,
      ty: interpolate(sp, [0, 1], [px(slide), 0]),
    };
  };

  const chipR = reveal(CHIP_START, 6, 6);
  const iconSpring = spring({
    frame: frame - (CHIP_START + 2),
    fps,
    config: { damping: 170, mass: 0.6, stiffness: 150 },
    durationInFrames: 8,
  });
  const iconScale = interpolate(iconSpring, [0, 1], [0.6, 1]); // slight overshoot via spring
  const iconOpacity = iconSpring;

  // ── Title two-tone: ink pre lands, accent clause tint-sweeps L→R over 8f ──
  const titleR = reveal(TITLE_START, 7, 10);
  const sweepStart = TITLE_START + 5;
  const sweep = interpolate(frame, [sweepStart, sweepStart + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Pagination dots pop in last ──
  const dotsR = reveal(DOTS_START, 6, 4);

  // ── Phone screen padding / layout sizes ──
  const screenInset = px(10); // bezel thickness
  const screenRadius = px(30);
  const phoneRadius = px(40);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Local accent glow backer behind the phone (NOT a full background) ── */}
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: phoneTop + phoneH * 0.5,
          width: phoneW * 2.2,
          height: phoneW * 2.2,
          transform: `translate(-50%, -50%) scale(${interpolate(
            phoneSpring,
            [0, 1],
            [0.85, 1],
          )})`,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, ${hexA(
            accent,
            isDark ? 0.22 : 0.16,
          )} 0%, ${hexA(accent, 0.0)} 62%)`,
          opacity: phoneOpacity * (0.7 + 0.3 * landed),
          filter: "blur(40px)",
        }}
      />

      {/* ── Kicker pill (mono, accent dot), centered x50% y≈16% ── */}
      {hasKicker && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: px(190),
            display: "flex",
            justifyContent: "center",
            transform: `translateY(${kickerY}px)`,
            opacity: kickerOpacity,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: px(10),
              padding: `${px(9)}px ${px(18)}px`,
              borderRadius: px(999),
              background: C.pillBg,
              border: `1px solid ${
                isDark ? hexA(accent, 0.4) : "rgba(12,12,18,0.07)"
              }`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: `0 ${px(8)}px ${px(24)}px ${hexA("#000000", isDark ? 0.3 : 0.08)}`,
            }}
          >
            <span
              style={{
                width: px(9),
                height: px(9),
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.9 * dotGlow)}`,
              }}
            />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: px(15),
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isDark ? accent : C.ink,
                whiteSpace: "nowrap",
              }}
            >
              {p.kicker}
            </span>
          </div>
        </div>
      )}

      {/* ── Kinetic headline above the phone (word-by-word reveal) ── */}
      {hasHeadline && (
        <div
          style={{
            position: "absolute",
            left: px(48),
            right: px(48),
            top: px(hasKicker ? 286 : 250),
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: `${px(4)}px ${px(14)}px`,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: px(46),
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            textAlign: "center",
          }}
        >
          {headlineWords.map((w, i) => {
            const { t } = wordState(i);
            const isAccentWord = accentSet.has(
              w.toLowerCase().replace(/[.,!?;:]+$/, ""),
            );
            const landed = isAccentWord ? accent : C.ink;
            // pending = faded grey; lands to ink/accent as t→1
            const color = t >= 1 ? landed : C.grey;
            return (
              <span
                key={i}
                style={{
                  color,
                  opacity: interpolate(t, [0, 1], [0.35, 1]),
                  transform: `translateY(${interpolate(t, [0, 1], [px(6), 0])}px)`,
                  display: "inline-block",
                  transition: "none",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Phone device ── */}
      <div
        style={{
          position: "absolute",
          left: phoneLeft + phoneEnterX,
          top: phoneTop + phoneEnterY + bobY,
          width: phoneW,
          height: phoneH,
          opacity: phoneOpacity,
          transform: `perspective(${px(1400)}px) rotateY(${phoneTilt}deg) scale(${phoneScale})`,
          transformOrigin: "50% 50%",
          borderRadius: phoneRadius,
          background: C.phoneFill,
          border: `${px(2)}px solid ${C.phoneEdge}`,
          boxShadow: `0 ${px(36)}px ${px(90)}px ${hexA(
            "#000000",
            isDark ? 0.55 : 0.22,
          )}, 0 0 ${px(70)}px ${hexA(accent, isDark ? 0.1 : 0.08)}`,
          padding: screenInset,
          boxSizing: "border-box",
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: screenRadius,
            background: SC.phoneChrome,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: `${px(34)}px ${px(16)}px ${px(18)}px`,
            boxSizing: "border-box",
          }}
        >
          {/* Dynamic-Island / notch pill */}
          <div
            style={{
              position: "absolute",
              top: px(12),
              left: "50%",
              transform: "translateX(-50%)",
              width: px(70),
              height: px(20),
              borderRadius: px(999),
              background: SC.notch,
            }}
          />

          {/* Screen chip (mono caps, accent dot) */}
          {p.screenChip.trim() !== S && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                opacity: chipR.opacity,
                transform: `translateY(${chipR.ty}px)`,
                marginTop: px(8),
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(7),
                  padding: `${px(5)}px ${px(11)}px`,
                  borderRadius: px(999),
                  background: hexA(accent, screenDark ? 0.16 : 0.12),
                  border: `1px solid ${hexA(accent, 0.32)}`,
                }}
              >
                <span
                  style={{
                    width: px(6),
                    height: px(6),
                    borderRadius: "50%",
                    background: accent,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontWeight: 600,
                    fontSize: px(11),
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: screenDark ? accent : SC.ink,
                  }}
                >
                  {p.screenChip}
                </span>
              </div>
            </div>
          )}

          {/* Circular app icon (Anthropic burst when icon === "✳") */}
          {p.appIcon.trim() !== S && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: px(18),
              opacity: iconOpacity,
              transform: `scale(${iconScale})`,
            }}
          >
            <div
              style={{
                width: px(48),
                height: px(48),
                borderRadius: "50%",
                background: screenDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.9)",
                border: `1px solid ${SC.rowEdge}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 ${px(6)}px ${px(18)}px ${hexA("#000000", screenDark ? 0.4 : 0.1)}`,
              }}
            >
              {p.appIcon === "✳" ? (
                <AnthropicBurst color={accent} size={px(26)} />
              ) : (
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 900,
                    fontSize: px(22),
                    color: accent,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.appIcon}
                </span>
              )}
            </div>
          </div>
          )}

          {/* Two-tone screen title */}
          <div
            style={{
              marginTop: px(16),
              textAlign: "center",
              opacity: titleR.opacity,
              transform: `translateY(${titleR.ty}px)`,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: px(22),
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              padding: `0 ${px(6)}px`,
            }}
          >
            {p.titlePre.trim() !== S && (
              <span style={{ color: SC.ink }}>{p.titlePre}</span>
            )}
            {p.titleAccent.trim() !== S && (
              <>
                <br />
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ color: SC.ink }}>{p.titleAccent}</span>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      color: accent,
                      clipPath: `inset(0 ${100 - sweep}% 0 0)`,
                    }}
                  >
                    {p.titleAccent}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* List rows — populate top-down ~3.5f/row */}
          <div
            style={{
              marginTop: px(18),
              display: "flex",
              flexDirection: "column",
              gap: px(8),
            }}
          >
            {p.rows.map((row, i) => {
              const start = ROWS_START + i * ROW_STEP;
              const rr = reveal(start, 6, 8);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: px(10),
                    padding: `${px(9)}px ${px(11)}px`,
                    borderRadius: px(12),
                    background: SC.rowFill,
                    border: `1px solid ${SC.rowEdge}`,
                    opacity: rr.opacity,
                    transform: `translateY(${rr.ty}px)`,
                  }}
                >
                  {/* A bare "●" renders as a small solid accent status dot
                      (source roster look); any other glyph keeps the tile box. */}
                  {row.glyph.trim() === "●" ? (
                    <span
                      style={{
                        flex: "0 0 auto",
                        width: px(7),
                        height: px(7),
                        borderRadius: "50%",
                        background: accent,
                        boxShadow: `0 0 ${px(6)}px ${hexA(accent, 0.7)}`,
                      }}
                    />
                  ) : row.glyph.trim() !== S ? (
                    <span
                      style={{
                        flex: "0 0 auto",
                        width: px(24),
                        height: px(24),
                        borderRadius: px(7),
                        background: hexA(accent, screenDark ? 0.18 : 0.14),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONT_STACKS.sans,
                        fontWeight: 800,
                        fontSize: px(13),
                        color: accent,
                      }}
                    >
                      {row.glyph}
                    </span>
                  ) : null}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: FONT_STACKS.sans,
                        fontWeight: 700,
                        fontSize: px(13.5),
                        color: SC.ink,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.title}
                    </span>
                    {row.caption.trim() !== S && (
                      <span
                        style={{
                          display: "block",
                          fontFamily: FONT_STACKS.mono,
                          fontWeight: 500,
                          fontSize: px(9.5),
                          letterSpacing: "0.04em",
                          color: SC.grey,
                          marginTop: px(1),
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.caption}
                      </span>
                    )}
                  </span>
                  {row.status.trim() !== S && (
                    <span
                      style={{
                        flex: "0 0 auto",
                        fontFamily: FONT_STACKS.mono,
                        fontWeight: 600,
                        fontSize: px(8.5),
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: hexA(accent, 0.85),
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer status line (source: "ORG RUNNING · 24/7") — replaces dots */}
          {p.screenFooter.trim() !== S && (
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: px(6),
                opacity: dotsR.opacity,
                transform: `translateY(${dotsR.ty}px)`,
                paddingTop: px(10),
              }}
            >
              <span
                style={{
                  width: px(5),
                  height: px(5),
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 ${px(6)}px ${hexA(accent, 0.7)}`,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_STACKS.mono,
                  fontWeight: 600,
                  fontSize: px(9),
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: SC.grey,
                  whiteSpace: "nowrap",
                }}
              >
                {p.screenFooter}
              </span>
            </div>
          )}

          {/* Pagination dots (active dot accent) */}
          {p.screenFooter.trim() === S && p.dotCount > 0 && (
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: px(7),
                opacity: dotsR.opacity,
                transform: `translateY(${dotsR.ty}px)`,
                paddingTop: px(10),
              }}
            >
              {Array.from({ length: Math.min(p.dotCount, 8) }).map((_, i) => {
                const active = i === p.activeDot;
                return (
                  <span
                    key={i}
                    style={{
                      width: active ? px(16) : px(6),
                      height: px(6),
                      borderRadius: px(999),
                      background: active
                        ? accent
                        : screenDark
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(12,12,18,0.18)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Anthropic burst glyph (radiating spokes) — inline SVG, no external assets ──
const AnthropicBurst: React.FC<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  const spokes = 8;
  const cx = 12;
  const cy = 12;
  const rOuter = 11;
  const rInner = 3.2;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {Array.from({ length: spokes }).map((_, i) => {
        const ang = (i / spokes) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(ang) * rInner;
        const y1 = cy + Math.sin(ang) * rInner;
        const x2 = cx + Math.cos(ang) * rOuter;
        const y2 = cy + Math.sin(ang) * rOuter;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
