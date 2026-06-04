/**
 * AbhiWaveform — replica of abhishek.devini's "audio-waveform / voiceover" scene.
 * FOREGROUND ONLY: the shared AbhiBackground (light-mesh OR dark-grid-glow) is
 * mounted separately by the host AbhiScene9x16, so this renders transparent over
 * it and draws only the LOCAL audio-player UI (no full-screen background).
 *
 * Source ground-truth (the canonical voiceover beat): a CENTERED audio-player —
 *   • a small rounded kicker pill ("YOUR VOICE") centered near the top, with an
 *     accent dot + mono caps;
 *   • a white circular MIC button (frosted disc, soft shadow) centered mid-frame;
 *   • a COMPACT centered row of rounded VERTICAL bars that alternate two tones
 *     (orange #FD824B + lavender #B792FF), mirrored about a centerline, idle-
 *     oscillating like a live level meter (NO visible surrounding pill);
 *   • a "VOICEOVER.WAV" mono caps label (dark ink) centered just below the bars.
 * Sampled bar hex: orange ≈ #FD824B, purple ≈ #B792FF. Mic disc ⌀≈150px centered
 * at ~42% height; bar cluster ⌀≈280px wide centered at ~56% height.
 *
 * A secondary "left headline + wide frosted pill + travelling horizontal wave"
 * layout (the DX9k EXTRACT beat) is still reachable via align:"left".
 *
 * Choreography:
 *   • Kicker pill fades + drops from y−16px over f1–6; accent dot ignites f4.
 *   • (left mode only) Headline rises word-by-word from +18px at ~f6.
 *   • Mic disc / pill scales 0.92→1 + fades up over ~12f at ~f10.
 *   • Bars spring up sequentially from the centre outwards (~1 bar / 0.6f),
 *     then idle-oscillate continuously (a travelling sine wave).
 *   • Label fades up under the bars ~4f after the bars finish springing in.
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
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/** "" sentinel = "caller did not override" (no zod reflection on defaults). */
const S = "";

export const abhiWaveformSchema = z.object({
  /** Single / primary accent color (kicker dot, label, and odd bars). */
  accentColor: z.string().default("#7076FD"),
  /**
   * Secondary bar color for the alternating two-tone variant. "" = single-tone
   * bars. The canonical voiceover beat uses orange (primary) + lavender (2nd).
   */
  secondaryColor: z.string().default(""),
  /** Background family this scene sits over — drives ink + surface colors. */
  mode: z.enum(["dark", "light"]).default("light"),
  /**
   * Layout family:
   *   "center" — CENTERED audio-player (kicker pill / mic disc / bars / label),
   *              the canonical voiceover look. NO big headline.
   *   "left"   — left headline + wide frosted pill holding a horizontal wave.
   */
  align: z.enum(["center", "left"]).default("center"),
  /** Mono kicker pill, UPPERCASE (e.g. "YOUR VOICE" or "11 / TRANSCRIBE"). */
  kicker: z.string().default("YOUR VOICE"),
  /** (left mode) Two-tone headline pre-clause. "" hides the headline. */
  headlinePre: z.string().default(""),
  /** (left mode) The ONE clause recolored to the accent. */
  headlineAccent: z.string().default(""),
  /** Mono label under the bars (e.g. "VOICEOVER.WAV" / "AUDIO STREAM"). */
  label: z.string().default("VOICEOVER.WAV"),
  /** Show the white circular MIC button above the bars (center mode). */
  showMic: z.boolean().default(true),
  /** Number of waveform bars (center: ~10–16 chunky; left: ~40 fine). */
  barCount: z.number().int().min(6).max(80).default(11),
  /** (left mode) Headline cap-height as % of 720w. px@1080 = pct/100*1080. */
  headlineSizePct: z.number().default(8.2),
});
export type AbhiWaveformProps = z.infer<typeof abhiWaveformSchema>;

const PX = 1080;

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
 * profile so the resting waveform looks like real audio. Pure fn of bar index.
 */
function barEnvelope(i: number, n: number): number {
  const t = i / Math.max(1, n - 1);
  const a =
    Math.sin(t * Math.PI * 6.0 + 0.6) * 0.5 +
    Math.sin(t * Math.PI * 13.0 + 1.7) * 0.28 +
    Math.sin(t * Math.PI * 21.0 + 3.1) * 0.16;
  const base = 0.55 + a * 0.45;
  const edgeTaper = Math.sin(t * Math.PI);
  return Math.max(0.16, Math.min(1, base * (0.55 + 0.45 * edgeTaper)));
}

export const AbhiWaveform: React.FC<Partial<AbhiWaveformProps>> = (props) => {
  const p = abhiWaveformSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const kickerGrey = isDark ? "#9A9AA0" : "#5A5A66";
  const accent = p.accentColor;
  const hasSecondary = p.secondaryColor.trim() !== S;
  const n = Math.max(6, Math.floor(p.barCount));
  const centerMode = p.align === "center";

  // For the canonical voiceover beat the bars read orange-first / lavender-second.
  // When a secondaryColor is supplied we treat accentColor as the ODD-bar tone and
  // secondaryColor as the EVEN-bar tone (matches the source's orange|purple cadence).
  const barA = accent; // even bars
  const barB = hasSecondary ? p.secondaryColor : accent; // odd bars

  // ── Common timing anchors (frames @30fps, scene-relative). ──
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

  const phase = (frame / fps) * Math.PI * 2;

  // ============================================================
  // CENTER (canonical voiceover-player) layout
  // ============================================================
  if (centerMode) {
    const cx = width / 2;
    const micD = px(118); // mic-disc diameter → ~177px on 1080 (source ⌀≈177px)
    const micCenterY = height * 0.42; // ~807/1920
    const barsCenterY = height * 0.535; // ~1027/1920 (source bar cluster center)
    const clusterW = px(203); // ~305px on 1080 canvas (source cluster w≈305px)
    const maxHalf = px(78); // max half-height of the tallest bar (source peak ≈68px)

    // Mic disc: scale 0.9→1 + fade up at ~f10.
    const MIC_START = 8;
    const micSp = spring({
      frame: frame - MIC_START,
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 110 },
      durationInFrames: 12,
    });
    const micScale = interpolate(micSp, [0, 1], [0.9, 1]);
    const micOpacity = micSp;

    // Bars spring up from the CENTRE outwards.
    const BARS_START = MIC_START + 8;
    const BAR_STEP = 0.6;
    const BAR_RISE = 3;
    const mid = (n - 1) / 2;
    const maxDist = Math.ceil(mid);
    const barsDoneAt = BARS_START + maxDist * BAR_STEP + BAR_RISE;

    const slot = clusterW / n;
    const barW = slot * 0.5;

    const bars = Array.from({ length: n }, (_, i) => {
      const env = barEnvelope(i, n);
      const wobble =
        Math.sin(phase * 2.4 - i * 0.7) * 0.26 +
        Math.sin(phase * 1.3 - i * 0.4) * 0.13;
      const live = Math.max(0.16, Math.min(1, env * (1 + wobble)));
      const dist = Math.abs(i - mid);
      const enterSp = spring({
        frame: frame - (BARS_START + dist * BAR_STEP),
        fps,
        config: { damping: 170, mass: 0.4, stiffness: 200 },
        durationInFrames: BAR_RISE,
      });
      const scaleY = enterSp * live;
      const color = i % 2 === 0 ? barA : barB;
      return { i, scaleY, color, env };
    });

    // Label fades up under the bars.
    const LABEL_START = barsDoneAt + 4;
    const labelSp = spring({
      frame: frame - LABEL_START,
      fps,
      config: { damping: 200, mass: 0.6, stiffness: 130 },
      durationInFrames: 8,
    });
    const labelOpacity = labelSp;
    const labelY = interpolate(labelSp, [0, 1], [px(10), 0]);

    const micDiscBg = isDark ? hexA("#1A1B22", 0.92) : hexA("#FFFFFF", 0.96);
    const micShadow = isDark
      ? `0 ${px(14)}px ${px(40)}px ${hexA("#000000", 0.5)}`
      : `0 ${px(14)}px ${px(36)}px ${hexA("#7E78B8", 0.28)}`;

    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {/* Kicker pill — CENTERED near the top. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: px(120),
            display: "flex",
            justifyContent: "center",
            opacity: kickerOpacity,
            transform: `translateY(${kickerY}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: px(10),
              padding: `${px(9)}px ${px(18)}px`,
              borderRadius: px(999),
              background: isDark ? hexA("#1A1B22", 0.7) : hexA("#FFFFFF", 0.78),
              border: `1px solid ${
                isDark ? hexA("#FFFFFF", 0.1) : hexA("#0C0C12", 0.07)
              }`,
              boxShadow: isDark
                ? `0 ${px(6)}px ${px(18)}px ${hexA("#000000", 0.4)}`
                : `0 ${px(6)}px ${px(18)}px ${hexA("#7E78B8", 0.12)}`,
            }}
          >
            <span
              style={{
                width: px(9),
                height: px(9),
                borderRadius: "50%",
                background: barB,
                boxShadow: `0 0 ${px(8)}px ${hexA(barB, 0.9 * dotGlow)}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: px(15),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: isDark ? "#D8D8DE" : kickerGrey,
                whiteSpace: "nowrap",
              }}
            >
              {p.kicker}
            </span>
          </div>
        </div>

        {/* White circular MIC button. */}
        {p.showMic && (
          <div
            style={{
              position: "absolute",
              left: cx - micD / 2,
              top: micCenterY - micD / 2,
              width: micD,
              height: micD,
              borderRadius: "50%",
              background: micDiscBg,
              border: `1px solid ${
                isDark ? hexA("#FFFFFF", 0.08) : hexA("#FFFFFF", 0.9)
              }`,
              boxShadow: micShadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: micOpacity,
              transform: `scale(${micScale})`,
              transformOrigin: "50% 50%",
            }}
          >
            <MicGlyph px={px} color={ink} size={46} />
          </div>
        )}

        {/* Compact centered vertical-bar cluster (mirrored, NO surround pill). */}
        <div
          style={{
            position: "absolute",
            left: cx - clusterW / 2,
            top: barsCenterY - maxHalf,
            width: clusterW,
            height: maxHalf * 2,
          }}
        >
          {bars.map(({ i, scaleY, color, env }) => {
            const half = Math.max(px(3), maxHalf * scaleY * (0.6 + 0.4 * env));
            const cy = maxHalf;
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
                  background: color,
                  boxShadow: `0 0 ${px(8)}px ${hexA(color, 0.3)}`,
                }}
              />
            );
          })}
        </div>

        {/* "VOICEOVER.WAV" label — centered below the bars. */}
        {p.label.trim() !== S && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: barsCenterY + maxHalf + px(28),
              display: "flex",
              justifyContent: "center",
              opacity: labelOpacity,
              transform: `translateY(${labelY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: px(20),
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: ink,
              }}
            >
              {p.label}
            </span>
          </div>
        )}
      </AbsoluteFill>
    );
  }

  // ============================================================
  // LEFT (headline + wide frosted pill + horizontal wave) layout
  // ============================================================
  const pillW = px(632);
  const pillH = px(150);
  const pillLeft = (width - pillW) / 2;
  const pillTop = px(720);
  const padX = px(34);
  const padY = px(30);
  const innerW = pillW - padX * 2;
  const innerH = pillH - padY * 2;
  const slot = innerW / n;
  const barW = slot * 0.5;
  const maxHalf = innerH / 2;

  const preWords = p.headlinePre.trim() === S ? [] : p.headlinePre.split(" ");
  const accWords = p.headlineAccent.trim() === S ? [] : p.headlineAccent.split(" ");
  const HEAD_START = 6;
  const HEAD_STEP = 5;
  const hasHeadline = preWords.length + accWords.length > 0;

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

  const BARS_START = PILL_START + 8;
  const BAR_STEP = 0.6;
  const BAR_RISE = 3;
  const barsDoneAt = BARS_START + (n - 1) * BAR_STEP + BAR_RISE;

  const LABEL_START = barsDoneAt + 4;
  const labelSp = spring({
    frame: frame - LABEL_START,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 130 },
    durationInFrames: 8,
  });
  const labelOpacity = labelSp;
  const labelY = interpolate(labelSp, [0, 1], [px(10), 0]);

  const bars = Array.from({ length: n }, (_, i) => {
    const env = barEnvelope(i, n);
    const wobble =
      Math.sin(phase * 2.4 - i * 0.55) * 0.22 +
      Math.sin(phase * 1.3 - i * 0.31) * 0.12;
    const live = Math.max(0.12, Math.min(1, env * (1 + wobble)));
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

  const pillBg = isDark ? hexA("#15161D", 0.72) : hexA("#FFFFFF", 0.62);
  const pillBorder = isDark ? hexA("#FFFFFF", 0.08) : hexA("#FFFFFF", 0.7);
  const pillShadow = isDark
    ? `0 ${px(20)}px ${px(60)}px ${hexA("#000000", 0.5)}`
    : `0 ${px(20)}px ${px(48)}px ${hexA("#7E78B8", 0.22)}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
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
          const cy = innerH / 2;
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
            <MicGlyph px={px} color={accent} size={16} />
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

const MicGlyph: React.FC<{
  px: (n: number) => number;
  color: string;
  size: number;
}> = ({ px, color, size }) => (
  <svg
    width={px(size)}
    height={px(size)}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block" }}
  >
    <rect x="9" y="2.5" width="6" height="12" rx="3" fill={color} />
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
