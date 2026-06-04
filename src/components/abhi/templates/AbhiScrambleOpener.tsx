/**
 * AbhiScrambleOpener — replica of abhishek.devini's "letter-scramble-opener"
 * cold-open hook. FOREGROUND ONLY: the shared AbhiBackground (light-mesh OR
 * dark-grid-glow) is mounted separately by the host AbhiScene9x16, so this
 * renders transparent over it and draws only local surfaces (the kicker pill,
 * the accent rule, an optional sub-line).
 *
 * Source ground-truth: DYukIE0PFac 0.0–4.0s (LIGHT mesh, "● 01 — HERETIC" pill,
 * "Strip the" near-black pre-line + giant red "CENSORSHIP." hero word whose
 * every glyph rapid-cycles random characters and resolves L→R over ~60f, a black
 * padlock holding dead-center during the scramble then fading out, and a sub-line
 * "right out of any open-source AI." typing in after it resolves).
 *
 * Choreography (frame-timed @30fps, scene-relative from frame 0, then HOLD):
 *   • f1–6    kicker pill fades + drops from y−16px (×1.5 → −24px); accent dot ignites f4.
 *   • f4–12   pre-line ("Strip the") fades up from +18px.
 *   • f6–66   hero word SCRAMBLES: each glyph swaps a random char ~every 1–2f and
 *             RESOLVES left→right — glyph i locks at ~f6 + i·(54/N). Pre-resolve
 *             glyphs render in a muted scramble ink; the resolved tail is accent.
 *   • f6–~58  central padlock holds at full opacity, then fades 0 as the word locks.
 *   • after   the accent rule wipes in L→R under the pre-line; the sub-line types on
 *             ~1 char / 2–3f with a blinking block caret.
 *   • ambient radial glow blooms behind the hero word over 14f, then breathes ±4%.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = specPx720 × 1.5.
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

/** "" sentinel = "caller did not override" (no zod reflection on defaults). */
const S = "";
/** AUTO sentinel for color fields that derive from `mode` when left untouched. */
const AUTO = "auto";

export const abhiScrambleOpenerSchema = z.object({
  /** Single accent color — the recolored hero word. Default = HERETIC red. */
  accentColor: z.string().default("#DC5867"),
  /** Background family this foreground sits over — drives ink + pill surfaces. */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Mono kicker pill text, UPPERCASE (e.g. "01 — HERETIC"). "" hides the pill. */
  kicker: z.string().default("01 — HERETIC"),
  /** Quiet pre-line above the hero word (sentence-case ink). "" hides it. */
  preLine: z.string().default("Strip the"),
  /** The hero word that scrambles + resolves L→R into the accent (incl. period). */
  heroWord: z.string().default("CENSORSHIP."),
  /** Optional sub-line that types on after the word resolves. "" hides it. */
  subLine: z.string().default("right out of any open-source AI."),
  /** Show the central padlock that holds over the word during the scramble. */
  showLock: z.boolean().default(true),
  /** Hero-word cap-height as % of 720w (spec 7–12). px@1080 = pct/100*1080. */
  heroSizePct: z.number().default(11),
  /** Resolve duration in frames (spec ~60f / 2s). The word locks L→R over this. */
  resolveFrames: z.number().default(54),
  /** First frame the scramble begins (after the pre-line lands). */
  scrambleStart: z.number().default(6),
  /** Override hero ink for unresolved/scramble glyphs. AUTO → muted mode default. */
  scrambleInk: z.string().default(AUTO),
});
export type AbhiScrambleOpenerProps = z.infer<typeof abhiScrambleOpenerSchema>;

const PX = 1080; // width basis: 1px@720-spec → 1.5px on this 1080-wide canvas
const px = (specPx720: number) => specPx720 * 1.5;

/** Glyph pool the scramble cycles through — caps + digits + mono symbols, the
 *  exact visual register of the source (`JQX4#`, `TO7!F`, `CEBIPW3@BIP`, …). */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?*$/<>";

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(220,88,103,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

/** Deterministic pseudo-random in [0,1) from two integer seeds (frame, index).
 *  Pure + stable per-frame so headless renders match Studio exactly. */
function rand(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const AbhiScrambleOpener: React.FC<Partial<AbhiScrambleOpenerProps>> = (
  props,
) => {
  const p = abhiScrambleOpenerSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#1A1A1A"; // pre-line / near-black ink
  const muted = isDark ? "#8A8A90" : "#5A5A66"; // labels / sub-line grey
  const accent = p.accentColor;
  const scrambleInk =
    p.scrambleInk !== AUTO
      ? p.scrambleInk
      : isDark
        ? hexA("#F2F2F4", 0.55)
        : hexA("#1A1A1A", 0.42);
  const lockColor = isDark ? "#F2F2F4" : "#0C0C12";

  // ── Geometry (left-aligned hook layout) ──
  const marginX = Math.round(0.065 * PX); // x≈6.5%
  const heroPxRaw = (p.heroSizePct / 100) * PX;
  // Auto-fit: keep the hero word inside ~88% of frame width (Inter-Black advance
  // ≈ 0.62·fontSize per cap glyph). Long words shrink instead of clipping.
  const heroChars = Math.max(p.heroWord.length, 1);
  const heroPx = Math.min(heroPxRaw, (PX * 0.88) / (heroChars * 0.62));
  const prePx = Math.round(heroPx * 0.46); // "Strip the" quieter line
  const kickerPx = Math.round(0.02 * PX); // ~2.0% → 21.6px
  const subPx = Math.round(0.034 * PX);

  // ============================================================
  // TIMING
  // ============================================================

  // ── Kicker pill: fade + drop from y−24px over f1–6, accent dot ignites f4 ──
  const kickerProg = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 170 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerProg, [0, 1], [-24, 0]);
  const kickerOpacity = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Pre-line ("Strip the"): fade up from +27px over f4–12 ──
  const preProg = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const preY = interpolate(preProg, [0, 1], [px(18), 0]);
  const preOpacity = interpolate(frame, [4, 11], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Hero scramble: per-glyph resolve L→R over `resolveFrames`, ~1 swap/1–2f ──
  const N = p.heroWord.length;
  const start = p.scrambleStart;
  // Each glyph i locks at lockFrame(i); the last glyph locks at start+resolveFrames.
  const lockFrame = (i: number): number =>
    start + (N <= 1 ? 0 : (i / (N - 1)) * p.resolveFrames);
  const finishFrame = start + p.resolveFrames; // whole word resolved by here
  const heroOpacity = interpolate(frame, [start - 2, start + 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Central padlock: holds full during scramble, fades as word locks ──
  const lockIn = interpolate(frame, [start - 1, start + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lockOut = interpolate(
    frame,
    [finishFrame - 10, finishFrame + 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lockOpacity = p.showLock ? lockIn * lockOut : 0;
  const lockBob = Math.sin((frame / fps) * Math.PI * 2 * 0.6) * px(3);

  // ── Accent rule under the pre-line: wipes in L→R once the word resolves ──
  const ruleStart = finishFrame + 2;
  const ruleW = interpolate(frame, [ruleStart, ruleStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ── Sub-line: types on ~1 char / 2.5f after the word resolves ──
  const hasSub = p.subLine.trim() !== S;
  const SUB_START = finishFrame + 4;
  const SUB_RATE = 2.5; // frames per character
  const subChars = Math.max(
    0,
    Math.min(p.subLine.length, Math.floor((frame - SUB_START) / SUB_RATE)),
  );
  const subTyped = p.subLine.slice(0, subChars);
  const subTypingDone = subChars >= p.subLine.length;
  const subVisible = frame >= SUB_START && hasSub;
  // block caret blinks ~15f cycle while typing/holding
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  const showCaret = subVisible && (!subTypingDone || caretOn);

  // ── Radial glow bloom behind hero word: in over 14f, then breathe ±4% ──
  const bloomIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const breathe = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2 * 0.66);
  const glowStrength = (isDark ? 0.34 : 0.16) * bloomIn;

  // ── Kicker pill surface (DARK warm-glass / LIGHT frosted white) ──
  const pillFill = isDark ? hexA("#2D1413", 0.55) : hexA("#FFFFFF", 0.72);
  const pillBorder = hexA(accent, isDark ? 0.5 : 0.35);

  // Vertical anchor of the hero block (centered band, left-aligned column).
  const blockTop = height * 0.41;
  const heroLineH = heroPx * 1.0;
  const heroCenterY = blockTop + prePx * 1.15 + heroLineH * 0.5;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontKerning: "normal" }}>
      {/* ── Local accent radial glow behind the hero word (NOT a full bg) ── */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${Math.round(
            width * 0.46 * breathe,
          )}px at ${marginX + width * 0.28}px ${heroCenterY}px, ${hexA(
            accent,
            glowStrength,
          )} 0%, ${hexA(accent, glowStrength * 0.4)} 30%, transparent 64%)`,
        }}
      />

      {/* ── Kicker pill (mono, accent dot), top-left ── */}
      {p.kicker.trim() !== S && (
        <div
          style={{
            position: "absolute",
            left: marginX,
            top: Math.round(0.13 * height),
            transform: `translateY(${kickerY}px)`,
            opacity: kickerOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: px(8),
            padding: `${px(7)}px ${px(13)}px`,
            borderRadius: px(8),
            background: pillFill,
            border: `1px solid ${pillBorder}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: `0 0 ${px(20)}px ${hexA(accent, 0.16 * dotGlow)}`,
          }}
        >
          <span
            style={{
              width: px(7),
              height: px(7),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${px(7)}px ${hexA(accent, 0.9 * dotGlow)}`,
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
              color: isDark ? accent : muted,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>
      )}

      {/* ── Hero block (left column: pre-line + scrambling hero word) ── */}
      <div
        style={{
          position: "absolute",
          left: marginX,
          right: px(28),
          top: blockTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* pre-line — "Strip the" */}
        {p.preLine.trim() !== S && (
          <div
            style={{
              transform: `translateY(${preY}px)`,
              opacity: preOpacity,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: prePx,
              letterSpacing: "-0.01em",
              lineHeight: 1.05,
              color: ink,
            }}
          >
            {p.preLine}
          </div>
        )}

        {/* accent rule — wipes in L→R under the pre-line once resolved */}
        <div
          style={{
            marginTop: px(6),
            marginBottom: px(2),
            height: px(2),
            width: `${ruleW * px(56)}px`,
            background: accent,
            borderRadius: px(2),
            opacity: ruleW > 0 ? 1 : 0,
            boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.5 * ruleW)}`,
          }}
        />

        {/* hero word — per-glyph scramble resolving L→R into the accent */}
        <div
          style={{
            position: "relative",
            marginTop: px(4),
            opacity: heroOpacity,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: heroPx,
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            whiteSpace: "nowrap",
          }}
        >
          {p.heroWord.split("").map((finalChar, i) => {
            const lock = lockFrame(i);
            const resolved = frame >= lock;
            // Spaces never scramble.
            const isSpace = finalChar === " ";
            // Swap the displayed glyph ~every 1–2 frames while unresolved.
            const swapTick = Math.floor(frame / 2) + i;
            const r = rand(swapTick, i);
            const display =
              resolved || isSpace
                ? finalChar
                : GLYPHS[Math.floor(r * GLYPHS.length)];
            // Tiny settle pop the instant a glyph locks (overshoot 1.12→1 / 3f).
            const pop = resolved
              ? interpolate(frame, [lock, lock + 3], [1.12, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.quad),
                })
              : 1;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `scale(${pop})`,
                  transformOrigin: "50% 60%",
                  color: resolved ? accent : scrambleInk,
                  whiteSpace: "pre",
                }}
              >
                {display === " " ? " " : display}
              </span>
            );
          })}

          {/* central padlock — holds over the word during the scramble */}
          {p.showLock && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, calc(-50% + ${lockBob}px))`,
                opacity: lockOpacity,
              }}
            >
              <LockGlyph size={heroPx * 0.74} color={lockColor} />
            </div>
          )}
        </div>

        {/* sub-line — types on after the word resolves */}
        {hasSub && (
          <div
            style={{
              marginTop: px(16),
              opacity: subVisible ? 1 : 0,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 600,
              fontSize: subPx,
              lineHeight: 1.25,
              color: muted,
              maxWidth: "86%",
            }}
          >
            {subTyped}
            {showCaret && (
              <span
                style={{
                  display: "inline-block",
                  width: px(3),
                  height: subPx * 0.9,
                  marginLeft: px(2),
                  marginBottom: px(-2),
                  background: accent,
                  verticalAlign: "baseline",
                }}
              />
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Inline padlock glyph (shackle + body), centered on its box. */
const LockGlyph: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ display: "block" }}
  >
    {/* shackle */}
    <path
      d="M30 44 V34 a20 20 0 0 1 40 0 V44"
      stroke={color}
      strokeWidth={11}
      strokeLinecap="round"
      fill="none"
    />
    {/* body */}
    <rect x={22} y={44} width={56} height={42} rx={9} fill={color} />
    {/* keyhole */}
    <circle cx={50} cy={61} r={5.5} fill="#ffffff" fillOpacity={0.92} />
    <rect
      x={47.5}
      y={61}
      width={5}
      height={12}
      rx={2}
      fill="#ffffff"
      fillOpacity={0.92}
    />
  </svg>
);
