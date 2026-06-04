/**
 * AbhiWaveform — replica of abhishek.devini's "audio-waveform" scene
 * (voiceover / transcribe / audio-pipeline beat). FOREGROUND ONLY: the shared
 * AbhiBackground (light-mesh OR dark-grid-glow) is mounted separately by the host
 * AbhiScene9x16, so this renders transparent over it and draws only the LOCAL
 * glassy waveform pill + label (no full-screen background).
 *
 * Source ground-truth: DX9k8WDPZ2D ~76–82s (LIGHT-mesh, "10 / EXTRACT —
 * FFmpeg rips frames + audio." → a wide frosted pill holding a row of rounded
 * periwinkle vertical bars mirrored about a centerline, a travelling L→R wave,
 * with a "♪ AUDIO STREAM" mono label below). Sampled bar hex ≈ #6E6BFF; pill
 * fill ≈ frosted #F0E5F4. Second instance DYUcj5iPAxL (orange/lavender alternating
 * bars + mic icon + "VOICEOVER.WAV" label) — folded in via the two-tone bar option.
 *
 * Choreography (STYLE-SPEC "Charts/viz" + VOCABULARY buildNotes):
 *   • Kicker pill fades + drops from y−16px over f1–6; accent dot ignites f4.
 *   • Headline rises word-by-word from +18px (~6f each, ~5f stagger) at ~f6.
 *   • Glassy waveform pill scales 0.96→1 + fades up over ~10f at ~f10.
 *   • Bars spring up sequentially L→R (each scaleY 0→1 over ~2f, ~1 bar / 0.6f)
 *     from the pill centerline, then idle-oscillate continuously (a travelling
 *     sine wave modulating each bar's height).
 *   • Label ("♪ AUDIO STREAM") + optional mic icon fade up under the pill ~4f
 *     after the bars finish springing in.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = pct/100*1080.
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

export const abhiWaveformSchema = z.object({
  /** Single accent color — periwinkle for the transcribe/voiceover beats. */
  accentColor: z.string().default("#7076FD"),
  /**
   * Secondary bar color for the alternating two-tone variant (the DYUcj
   * orange/lavender look). "" = single-color bars (all in accentColor).
   */
  secondaryColor: z.string().default(""),
  /** Background family this scene sits over — drives ink + pill surface colors. */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Mono kicker pill, UPPERCASE (e.g. "11 / TRANSCRIBE" or "YOUR VOICE"). */
  kicker: z.string().default("11 / TRANSCRIBE"),
  /** Two-tone headline; the accent clause is recolored. "" hides the headline. */
  headlinePre: z.string().default("Transcribe"),
  /** The ONE clause recolored to the accent (often the terminal period word). */
  headlineAccent: z.string().default("everything."),
  /** Mono label under the pill (e.g. "AUDIO STREAM" / "VOICEOVER.WAV"). */
  label: z.string().default("AUDIO STREAM"),
  /** Show the small mic glyph left of the label. */
  showMic: z.boolean().default(true),
  /** Number of waveform bars in the pill (24–64 sensible; ~40 canonical). */
  barCount: z.number().int().min(8).max(80).default(42),
  /** Headline cap-height as % of 720w (spec 7–12). px@1080 = pct/100*1080. */
  headlineSizePct: z.number().default(8.2),
});
export type AbhiWaveformProps = z.infer<typeof abhiWaveformSchema>;

const PX = 1080; // 1px@720-spec → 1.5px on this 1080-wide canvas

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(112,118,253,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Deterministic per-bar "loudness envelope" in 0..1 — a smooth pseudo-random
 * profile so the resting waveform looks like real audio (not a flat row). Pure
 * function of the bar index, so it's identical every render (no Math.random).
 */
function barEnvelope(i: number, n: number): number {
  const t = i / Math.max(1, n - 1);
  const a =
    Math.sin(t * Math.PI * 6.0 + 0.6) * 0.5 +
    Math.sin(t * Math.PI * 13.0 + 1.7) * 0.28 +
    Math.sin(t * Math.PI * 21.0 + 3.1) * 0.16;
  // Map roughly [-0.94..0.94] → [0.18..1], then taper the very ends down a touch.
  const base = 0.55 + a * 0.45;
  const edgeTaper = Math.sin(t * Math.PI); // 0 at ends, 1 mid
  return Math.max(0.16, Math.min(1, base * (0.55 + 0.45 * edgeTaper)));
}

export const AbhiWaveform: React.FC<Partial<AbhiWaveformProps>> = (props) => {
  const p = abhiWaveformSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // 720→1080 scale helper for spec measures.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const kickerGrey = isDark ? "#9A9AA0" : "#5A5A66";
  const accent = p.accentColor;
  const hasSecondary = p.secondaryColor.trim() !== S;
  const n = Math.max(8, Math.floor(p.barCount));

  // ── Pill geometry (wide glassy pill, centered, lower-middle of frame) ──
  const pillW = px(632); // ≈ 88% of 720
  const pillH = px(150);
  const pillLeft = (width - pillW) / 2;
  const pillTop = px(720);
  const padX = px(34); // inner horizontal padding
  const padY = px(30); // inner vertical padding
  const innerW = pillW - padX * 2;
  const innerH = pillH - padY * 2;
  const centerY = pillTop + pillH / 2; // waveform mirror centerline
  const slot = innerW / n; // per-bar slot width
  const barW = slot * 0.5; // bar thickness (gaps between bars)
  const maxHalf = innerH / 2; // max half-height (mirrored up + down)

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  // ============================================================

  // ── Kicker: fade + drop from y−16px over f1–6; accent dot ignites f4 ──
  const KICK = 1;
  const kickSp = spring({
    frame: frame - KICK,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 120 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickSp, [0, 1], [-px(16), 0]);
  const kickerOpacity = kickSp;
  const dotGlow = interpolate(frame, [KICK + 3, KICK + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Headline: word-by-word rise from +18px, ~6f each, ~5f stagger ──
  const preWords = p.headlinePre.trim() === S ? [] : p.headlinePre.split(" ");
  const accWords = p.headlineAccent.trim() === S ? [] : p.headlineAccent.split(" ");
  const HEAD_START = 6;
  const HEAD_STEP = 5;
  const hasHeadline = preWords.length + accWords.length > 0;

  // ── Glassy pill: scale 0.96→1 + fade up over ~10f at ~f10 ──
  const PILL_START = 10;
  const pillSp = spring({
    frame: frame - PILL_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 110 },
    durationInFrames: 12,
  });
  const pillScale = interpolate(pillSp, [0, 1], [0.96, 1]);
  const pillOpacity = pillSp;
  const pillRise = interpolate(pillSp, [0, 1], [px(26), 0]);

  // ── Bars: spring up L→R after the pill lands (~1 bar / 0.6f) ──
  const BARS_START = PILL_START + 8;
  const BAR_STEP = 0.6; // frames between consecutive bars igniting
  const BAR_RISE = 3; // frames for one bar to reach full springiness
  const barsDoneAt = BARS_START + (n - 1) * BAR_STEP + BAR_RISE;

  // ── Label + mic: fade up under the pill, ~4f after bars finish ──
  const LABEL_START = barsDoneAt + 4;
  const labelSp = spring({
    frame: frame - LABEL_START,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 130 },
    durationInFrames: 8,
  });
  const labelOpacity = labelSp;
  const labelY = interpolate(labelSp, [0, 1], [px(10), 0]);

  // ── Idle oscillation: a travelling sine wave that modulates bar heights,
  //    continuous from frame 0 (so it's already breathing as bars land). ──
  const phase = (frame / fps) * Math.PI * 2; // 1 cycle / second base speed

  // Precompute each bar's current scaleY (0..1) combining entrance + idle.
  const bars = Array.from({ length: n }, (_, i) => {
    const env = barEnvelope(i, n); // resting loudness 0..1
    // Travelling-wave wobble: each bar oscillates with an index-phase offset so
    // the crest drifts L→R; amplitude scales with the bar's own envelope.
    const wobble =
      Math.sin(phase * 2.4 - i * 0.55) * 0.22 +
      Math.sin(phase * 1.3 - i * 0.31) * 0.12;
    const live = Math.max(0.12, Math.min(1, env * (1 + wobble)));

    // Entrance: bar i springs up starting BARS_START + i*BAR_STEP.
    const enterSp = spring({
      frame: frame - (BARS_START + i * BAR_STEP),
      fps,
      config: { damping: 170, mass: 0.4, stiffness: 200 },
      durationInFrames: BAR_RISE,
    });
    const scaleY = enterSp * live;
    const color = hasSecondary && i % 2 === 1 ? p.secondaryColor : accent;
    return { i, scaleY, color, env };
  });

  // ── Pill surface (DARK glass slate / LIGHT frosted white) ──
  const pillBg = isDark ? hexA("#15161D", 0.72) : hexA("#FFFFFF", 0.62);
  const pillBorder = isDark
    ? hexA("#FFFFFF", 0.08)
    : hexA("#FFFFFF", 0.7);
  const pillShadow = isDark
    ? `0 ${px(20)}px ${px(60)}px ${hexA("#000000", 0.5)}`
    : `0 ${px(20)}px ${px(48)}px ${hexA("#7E78B8", 0.22)}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill (mono, accent dot), LEFT x≈8% y≈12% ── */}
      <div
        style={{
          position: "absolute",
          left: px(56),
          top: px(150),
          display: "inline-flex",
          alignItems: "center",
          gap: px(10),
          padding: `${px(9)}px ${px(16)}px`,
          borderRadius: px(10),
          background: isDark ? hexA(accent, 0.1) : hexA("#FFFFFF", 0.75),
          border: `1px solid ${isDark ? hexA(accent, 0.45) : hexA("#0C0C12", 0.08)}`,
          boxShadow: isDark
            ? `0 0 ${px(22)}px ${hexA(accent, 0.18 * dotGlow)}`
            : `0 ${px(6)}px ${px(18)}px ${hexA("#7E78B8", 0.12)}`,
          opacity: kickerOpacity,
          transform: `translateY(${kickerY}px)`,
        }}
      >
        <span
          style={{
            width: px(9),
            height: px(9),
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.9 * dotGlow)}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: px(15),
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isDark ? accent : kickerGrey,
            whiteSpace: "nowrap",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ── Two-tone headline (left-aligned x≈8% y≈18%) ── */}
      {hasHeadline && (
        <div
          style={{
            position: "absolute",
            left: px(56),
            top: px(228),
            right: px(40),
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: (p.headlineSizePct / 100) * PX,
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            color: ink,
          }}
        >
          {preWords.map((w, i) => (
            <Word
              key={`pre-${i}`}
              text={w}
              frame={frame}
              fps={fps}
              px={px}
              start={HEAD_START + i * HEAD_STEP}
              color={ink}
            />
          ))}
          {accWords.map((w, i) => (
            <Word
              key={`acc-${i}`}
              text={w}
              frame={frame}
              fps={fps}
              px={px}
              start={HEAD_START + (preWords.length + i) * HEAD_STEP}
              color={accent}
            />
          ))}
        </div>
      )}

      {/* ── Glassy waveform pill ── */}
      <div
        style={{
          position: "absolute",
          left: pillLeft,
          top: pillTop,
          width: pillW,
          height: pillH,
          borderRadius: px(26),
          background: pillBg,
          border: `1px solid ${pillBorder}`,
          boxShadow: pillShadow,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          opacity: pillOpacity,
          transform: `translateY(${pillRise}px) scale(${pillScale})`,
          transformOrigin: "50% 50%",
          overflow: "hidden",
        }}
      >
        {/* top 1px lighter edge (glass highlight) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: isDark ? hexA("#FFFFFF", 0.1) : hexA("#FFFFFF", 0.85),
          }}
        />
      </div>

      {/* ── Waveform bars (drawn in their own absolutely-positioned layer so the
              pill's overflow:hidden clip + scale don't fight the bar transforms) ── */}
      <div
        style={{
          position: "absolute",
          left: pillLeft + padX,
          top: pillTop + padY,
          width: innerW,
          height: innerH,
          opacity: pillOpacity,
          transform: `translateY(${pillRise}px)`,
        }}
      >
        {bars.map(({ i, scaleY, color, env }) => {
          const half = Math.max(px(2), maxHalf * scaleY * (0.5 + 0.5 * env));
          const cy = innerH / 2; // local centerline
          const x = i * slot + (slot - barW) / 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: cy - half,
                width: barW,
                height: half * 2,
                borderRadius: barW,
                background: `linear-gradient(180deg, ${color} 0%, ${hexA(
                  color,
                  0.78,
                )} 100%)`,
                boxShadow: `0 0 ${px(6)}px ${hexA(color, 0.25)}`,
              }}
            />
          );
        })}
      </div>

      {/* ── Label (♪ / mic + AUDIO STREAM) under the pill ── */}
      {p.label.trim() !== S && (
        <div
          style={{
            position: "absolute",
            left: pillLeft + padX,
            top: pillTop + pillH + px(16),
            display: "inline-flex",
            alignItems: "center",
            gap: px(9),
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
          }}
        >
          {p.showMic ? (
            <MicGlyph px={px} color={accent} />
          ) : (
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontSize: px(15),
                color: accent,
                lineHeight: 1,
              }}
            >
              {"♪"}
            </span>
          )}
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: px(14),
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {p.label}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const Word: React.FC<{
  text: string;
  frame: number;
  fps: number;
  px: (n: number) => number;
  start: number;
  color: string;
}> = ({ text, frame, fps, px, start, color }) => {
  const sp = spring({
    frame: frame - start,
    fps,
    config: { damping: 190, mass: 0.6, stiffness: 130 },
    durationInFrames: 8,
  });
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: px(16),
        opacity: sp,
        transform: `translateY(${interpolate(sp, [0, 1], [px(18), 0])}px)`,
        color,
      }}
    >
      {text}
    </span>
  );
};

const MicGlyph: React.FC<{ px: (n: number) => number; color: string }> = ({
  px,
  color,
}) => (
  <svg
    width={px(16)}
    height={px(16)}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block" }}
  >
    <rect
      x="9"
      y="2.5"
      width="6"
      height="12"
      rx="3"
      fill={color}
    />
    <path
      d="M5.5 11.5a6.5 6.5 0 0 0 13 0"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      fill="none"
    />
    <line
      x1="12"
      y1="18"
      x2="12"
      y2="21.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);
