/**
 * AbhiBrowserMockup — replica of abhishek.devini's "browser-mockup" scene, his
 * single MOST-used template (25 instances in the corpus). A macOS browser window
 * (traffic-light dots + URL bar) framing a website / product UI, floating centered
 * over the bg with a soft accent glow; it rises + scales in.
 *
 * FOREGROUND ONLY — the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host AbhiScene9x16. This renders transparent over it,
 * drawing ONLY the local chassis surface + an accent glow backer behind it. No
 * full-screen background.
 *
 * Source ground-truth: DXpZf2ziBYP 0.0–2.2s (DARK, red accent) — a `claude.ai/design`
 * browser window with traffic-light chrome, an inner "● WEEKLY LIMIT REACHED" mono
 * kicker, the bold headline "You've hit your Claude Design quota." and a grey meta
 * line "Resets in 6 days · 14 hrs · 22 min". The whole chassis rises + scales in
 * under a top "● RATE LIMITED · QUOTA HIT" pill, with a soft accent bloom behind it.
 *
 * Choreography (transitionVerb):
 *   • Top status pill clip-reveals above the chassis (fade + drop from y−16px, 6f).
 *   • Browser chassis rises +28px + scales 0.95→1 + fades over 10–12f.
 *   • Chrome dots ignite (overshoot) ~2f after the chassis lands; URL crumb types on.
 *   • Inner content cross-dissolves in row-by-row (kicker → headline → meta), ~4f each.
 *   • Accent glow bloom blooms behind the chassis over ~14f, then idle-breathes.
 *   • Optional red-laser strikethrough sweep for "hook" scenes (DXpZf2ziBYP quota hook).
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = (specPx/100)*1080.
 * TS strict; ZOD v4 (no schema reflection — "" sentinel detects overrides).
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

export const abhiBrowserMockupSchema = z.object({
  /** Single accent color — defaults to Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),

  /** Top status pill above the chassis (mono UPPERCASE). "" hides it. */
  statusPill: z.string().default("RATE LIMITED · QUOTA HIT"),

  /** Browser URL/path crumb shown in the chrome bar (right of the dots). */
  urlCrumb: z.string().default("claude.ai/design"),

  /**
   * Inner content kicker (small mono UPPERCASE label above the headline). The
   * dot + this label recolor to accent. "" hides it.
   */
  innerKicker: z.string().default("WEEKLY LIMIT REACHED"),
  /** Bold inner headline (the page's hero line). Auto-fits to the chassis width. */
  innerHeadline: z.string().default("You've hit your Claude Design quota."),
  /** Grey meta / sub line under the headline (e.g. timestamps, counts). "" hides it. */
  innerMeta: z.string().default("Resets in 6 days · 14 hrs · 22 min"),

  /**
   * Optional product-UI chip row rendered inside the page below the meta line
   * (gives the framed-website feel). Empty array hides the row.
   */
  uiChips: z.array(z.string()).default([]),

  /**
   * Red-laser strikethrough sweep across the headline (the DXpZf2ziBYP "hook"
   * device). When true a glowing line wipes L→R over the headline after it lands.
   */
  strikeHook: z.boolean().default(false),

  /** Inner headline cap-height as % of 720w (spec ~3.6 → 38px). */
  headlineSizePct: z.number().default(3.6),
  /** Chassis width as % of 720w (spec ~89 → 960px @1080). */
  chassisWidthPct: z.number().default(88.5),
});
export type AbhiBrowserMockupProps = z.infer<typeof abhiBrowserMockupSchema>;

const PX = 1080; // width basis: spec% of 720 → px = (specPct/100)*1080

/** #RRGGBB + alpha → rgba(). Falls back to orange if the hex is malformed. */
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

export const AbhiBrowserMockup: React.FC<Partial<AbhiBrowserMockupProps>> = (
  props,
) => {
  const p = abhiBrowserMockupSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const accent = p.accentColor;

  // ── Palette (DARK off-white / LIGHT ink) ──────────────────────────────────
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const grey = isDark ? "#8A8A90" : "#5A5A66";
  // Chassis surfaces — sampled from the source (#13141B body / #1C1B22 chrome).
  const chassisFill = isDark ? "#13141B" : "rgba(255,255,255,0.92)";
  const chromeFill = isDark ? "#1C1B22" : "#EDEAF2";
  const chassisEdge = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(12,12,18,0.08)";
  const chromeRule = isDark ? "rgba(0,0,0,0.35)" : "rgba(12,12,18,0.06)";
  const crumbGrey = isDark ? "#9A9AA0" : "#7A7682";

  // ── Geometry (spec % of 720w → px on 1080) ────────────────────────────────
  const px = (specPct: number) => (specPct / 100) * PX;
  const chassisW = (p.chassisWidthPct / 100) * PX;
  const chassisLeft = (PX - chassisW) / 2;
  const headlinePx = (p.headlineSizePct / 100) * PX;
  const kickerPx = px(1.95); // ~21px mono labels

  const hasStatusPill = p.statusPill.trim() !== S;
  const hasInnerKicker = p.innerKicker.trim() !== S;
  const hasInnerMeta = p.innerMeta.trim() !== S;
  const hasChips = p.uiChips.length > 0;

  // ==========================================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  //   f1–6    top status pill fades + drops from y−16px, accent dot ignites
  //   f8–20   browser chassis rises +28px + scales 0.95→1 + fades (10–12f)
  //   f0–14   accent glow bloom blooms behind the chassis (slower)
  //   f~20    chrome dots overshoot-pop, URL crumb types on (~2 chars/f)
  //   f24+    inner content cross-dissolves row-by-row (kicker→headline→meta→chips)
  //   f~46    optional red-laser strikethrough wipes L→R over the headline
  // ==========================================================================

  // ── Top status pill: fade + drop from y−24px over f1–6, dot glow f4 ──
  const pillProg = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.55, stiffness: 130 },
    durationInFrames: 6,
  });
  const pillY = interpolate(pillProg, [0, 1], [-px(2.2), 0]);
  const pillOpacity = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillDotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Browser chassis: rise +28px + scale 0.95→1 + fade over ~9f, from f4 ──
  // Source pops the WHOLE card (chassis + all inner rows) in by ~0.4s (≈f12) and
  // reserves the late beat purely for the strikethrough; the previous f8 start
  // with f22 inner rows revealed everything ~2× too slow vs the 2.2s source.
  const CHASSIS_START = 4;
  const chassisSpring = spring({
    frame: frame - CHASSIS_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 130 },
    durationInFrames: 10,
  });
  const chassisScale = interpolate(chassisSpring, [0, 1], [0.95, 1]);
  const chassisRise = interpolate(chassisSpring, [0, 1], [px(2.6), 0]);
  const chassisOpacity = interpolate(frame, [CHASSIS_START, CHASSIS_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Accent glow bloom behind the chassis: 0→1 over 14f, then idle-breathe ──
  const bloomIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const breathe = Math.sin((frame / 30) * Math.PI * 2) * 0.04;
  const glowScale = (0.96 + 0.04 * bloomIn) * (1 + breathe * bloomIn);
  // Source glow is a DIM maroon wash, barely above the base — keep it subtle.
  const glowOpacity = (isDark ? 0.2 : 0.34) * bloomIn;

  // ── Chrome dots overshoot-pop ~2f after the chassis lands ──
  const DOTS_START = CHASSIS_START + 6;
  const dotsSpring = spring({
    frame: frame - DOTS_START,
    fps,
    config: { damping: 140, mass: 0.5, stiffness: 170 },
    durationInFrames: 8,
  });
  const dotScale = interpolate(dotsSpring, [0, 0.6, 1], [0.4, 1.08, 1], {
    extrapolateRight: "clamp",
  });

  // ── URL crumb types on ~3 chars/f (fast) right as the dots pop ──
  // Source has the full "claude.ai/design" crumb up almost instantly, so this
  // types quickly (≈5f for 16 chars) rather than dragging across the scene.
  const CRUMB_START = DOTS_START + 1;
  const crumbChars = Math.max(
    0,
    Math.min(p.urlCrumb.length, Math.floor((frame - CRUMB_START) * 3)),
  );
  const typedCrumb = p.urlCrumb.slice(0, crumbChars);
  const crumbCaretOn = Math.floor(frame / 8) % 2 === 0;
  const crumbTyping = crumbChars < p.urlCrumb.length && frame >= CRUMB_START;

  // ── Inner content cross-dissolves row-by-row (~2f each), tight after chassis ──
  // Source has the kicker + headline + meta all up by ~0.4s (≈f12); reveal rows
  // land in quick succession right as the chassis settles rather than trailing it.
  const INNER_START = CHASSIS_START + 5;
  const rowReveal = (rowIndex: number) => {
    const start = INNER_START + rowIndex * 2;
    return interpolate(frame, [start, start + 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };
  const rowRise = (rowIndex: number) => {
    const start = INNER_START + rowIndex * 2;
    return interpolate(frame, [start, start + 5], [px(0.9), 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  };

  // ── Optional red-laser strikethrough sweep over the headline ──
  // Fires LATE (near the 66f / 2.2s end) — the whole card is already settled, so
  // the strike reads as the closing "you're cut off" punch, like the source.
  const STRIKE_START = 46;
  const strikeProg = p.strikeHook
    ? interpolate(frame, [STRIKE_START, STRIKE_START + 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      })
    : 0;
  const STRIKE_RED = "#F5553A";

  // Status pill surface (red-tinted in the hook scene, else accent-tinted).
  const pillTint = p.strikeHook ? STRIKE_RED : accent;
  const pillBg = isDark ? hexA(pillTint, 0.1) : hexA(pillTint, 0.12);
  const pillBorder = `1px solid ${hexA(pillTint, isDark ? 0.45 : 0.4)}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Local accent glow backer behind the chassis (NOT a full background) ── */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            width: "82%",
            height: "40%",
            transform: `translate(-50%, -50%) scale(${glowScale})`,
            background: `radial-gradient(ellipse at center, ${hexA(
              accent,
              0.55,
            )} 0%, ${hexA(accent, 0.18)} 38%, rgba(0,0,0,0) 70%)`,
            opacity: glowOpacity,
            filter: "blur(70px)",
          }}
        />
      </AbsoluteFill>

      {/* ── Top status pill (mono, accent dot), centered y≈16% ── */}
      {hasStatusPill && (
        <div
          style={{
            position: "absolute",
            top: px(15.5),
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            transform: `translateY(${pillY}px)`,
            opacity: pillOpacity,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: px(0.9),
              padding: `${px(1.0)}px ${px(1.9)}px`,
              borderRadius: 999,
              background: pillBg,
              border: pillBorder,
              boxShadow: `0 0 ${px(3)}px ${hexA(pillTint, 0.2 * pillDotGlow)}`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: px(0.85),
                height: px(0.85),
                borderRadius: "50%",
                background: pillTint,
                boxShadow: `0 0 ${px(0.6 + pillDotGlow * 1.2)}px ${hexA(
                  pillTint,
                  0.5 + pillDotGlow * 0.5,
                )}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: kickerPx,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: pillTint,
                whiteSpace: "nowrap",
              }}
            >
              {p.statusPill}
            </span>
          </div>
        </div>
      )}

      {/* ── Browser chassis ── */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            top: px(23.5),
            left: chassisLeft,
            width: chassisW,
            opacity: chassisOpacity,
            transform: `translateY(${chassisRise}px) scale(${chassisScale})`,
            transformOrigin: "50% 35%",
            borderRadius: px(1.5),
            background: chassisFill,
            border: `1px solid ${chassisEdge}`,
            boxShadow: `0 ${px(2.6)}px ${px(7.5)}px ${hexA(
              "#000000",
              isDark ? 0.55 : 0.18,
            )}, 0 0 ${px(6)}px ${hexA(accent, 0.08)}`,
            overflow: "hidden",
          }}
        >
          {/* Chrome bar: 3 traffic-light dots + URL crumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(0.85),
              height: px(3.6),
              padding: `0 ${px(1.6)}px`,
              background: chromeFill,
              borderBottom: `1px solid ${chromeRule}`,
            }}
          >
            <TrafficDot px={px} color="#FC6157" scale={dotScale} />
            <TrafficDot px={px} color="#F4BD4F" scale={dotScale} />
            <TrafficDot px={px} color="#61C354" scale={dotScale} />
            <span
              style={{
                marginLeft: px(1.0),
                fontFamily: FONT_STACKS.mono,
                fontWeight: 500,
                fontSize: px(1.55),
                letterSpacing: "0.04em",
                color: crumbGrey,
                whiteSpace: "nowrap",
              }}
            >
              {typedCrumb}
              {crumbTyping && crumbCaretOn ? (
                <span
                  style={{
                    display: "inline-block",
                    width: px(0.7),
                    height: px(1.5),
                    marginLeft: px(0.15),
                    marginBottom: px(-0.2),
                    background: crumbGrey,
                    verticalAlign: "middle",
                  }}
                />
              ) : null}
            </span>
          </div>

          {/* Page body */}
          <div
            style={{
              padding: `${px(2.4)}px ${px(2.6)}px ${px(2.8)}px`,
              minHeight: px(13),
            }}
          >
            {/* inner kicker (accent mono) */}
            {hasInnerKicker && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(0.8),
                  opacity: rowReveal(0),
                  transform: `translateY(${rowRise(0)}px)`,
                  marginBottom: px(1.4),
                }}
              >
                <span
                  style={{
                    width: px(0.8),
                    height: px(0.8),
                    borderRadius: "50%",
                    background: accent,
                    boxShadow: `0 0 ${px(0.7)}px ${hexA(accent, 0.7)}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontWeight: 600,
                    fontSize: px(1.5),
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: accent,
                  }}
                >
                  {p.innerKicker}
                </span>
              </div>
            )}

            {/* headline (bold ink, auto-fits via maxWidth + wrap) */}
            <div
              style={{
                position: "relative",
                opacity: rowReveal(1),
                transform: `translateY(${rowRise(1)}px)`,
                fontFamily: FONT_STACKS.sans,
                fontWeight: 800,
                fontSize: headlinePx,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: ink,
                maxWidth: "100%",
                overflowWrap: "break-word",
              }}
            >
              {p.innerHeadline}
              {/* red-laser strikethrough sweep (hook scenes) */}
              {p.strikeHook && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    height: px(0.26),
                    width: `${strikeProg * 100}%`,
                    background: STRIKE_RED,
                    borderRadius: px(0.3),
                    boxShadow: `0 0 ${px(0.7)}px ${hexA(STRIKE_RED, 0.7)}`,
                  }}
                />
              )}
            </div>

            {/* meta / sub line (grey) */}
            {hasInnerMeta && (
              <div
                style={{
                  marginTop: px(1.5),
                  opacity: rowReveal(2),
                  transform: `translateY(${rowRise(2)}px)`,
                  fontFamily: FONT_STACKS.mono,
                  fontWeight: 500,
                  fontSize: px(1.55),
                  letterSpacing: "0.02em",
                  color: grey,
                }}
              >
                {p.innerMeta}
              </div>
            )}

            {/* optional product-UI chip row */}
            {hasChips && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: px(0.9),
                  marginTop: px(2.2),
                  opacity: rowReveal(3),
                  transform: `translateY(${rowRise(3)}px)`,
                }}
              >
                {p.uiChips.map((chip, i) => (
                  <span
                    key={i}
                    style={{
                      padding: `${px(0.7)}px ${px(1.3)}px`,
                      borderRadius: px(0.9),
                      fontFamily: FONT_STACKS.mono,
                      fontWeight: 600,
                      fontSize: px(1.4),
                      letterSpacing: "0.04em",
                      color: i === 0 ? accent : grey,
                      background: isDark
                        ? hexA(i === 0 ? accent : "#FFFFFF", i === 0 ? 0.1 : 0.05)
                        : hexA(i === 0 ? accent : "#0C0C12", i === 0 ? 0.1 : 0.05),
                      border: `1px solid ${hexA(
                        i === 0 ? accent : isDark ? "#FFFFFF" : "#0C0C12",
                        i === 0 ? 0.4 : 0.1,
                      )}`,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const TrafficDot: React.FC<{
  px: (n: number) => number;
  color: string;
  scale: number;
}> = ({ px, color, scale }) => (
  <span
    style={{
      width: px(1.05),
      height: px(1.05),
      borderRadius: "50%",
      background: color,
      transform: `scale(${scale})`,
      display: "inline-block",
    }}
  />
);
