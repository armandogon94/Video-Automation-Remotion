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
 * AbhiTitleCard — "title-card-two-tone" (abhishek.devini core headline template).
 *
 * The single most-used scene in the corpus: a letter-spaced mono "● NN / WORD"
 * kicker pill leads in, then a giant extra-bold grotesk headline rises word-group
 * by word-group from below; the white words land first and the ONE accent clause
 * tint-sweeps white→accent left→right; a soft radial glow blooms behind it all.
 *
 * FOREGROUND ONLY — the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host. This renders transparent over it, drawing only
 * the kicker pill surface + a local accent-tinted glow backer behind the headline.
 *
 * Source ground-truth: DXpZf2ziBYP 2.2–5.5s, DARK, "One open-source repo."
 * (accent orange on "open-source"). Canvas 1080×1920 @ 30fps; spec measures are
 * % of 720w, so px = specPx@720 × 1.5.
 */

// "" sentinel lets callers override a field while every field still has a
// concrete .default(...) (Zod v4 — no .shape/_def reflection used anywhere).
const SENTINEL = "";

export const abhiTitleCardSchema = z.object({
  /** Mono kicker, e.g. "THE FIX ↓" or "01 / THE FIX". Rendered UPPERCASE. */
  kicker: z.string().default("THE FIX ↓"),
  /**
   * White (ink) words that lead the headline. May be multi-word; rendered as the
   * primary-ink portion. Lands first, before the accent clause sweeps.
   */
  headlinePre: z.string().default("One"),
  /** The ONE clause recolored to the accent. Tint-sweeps white→accent L→R. */
  headlineAccent: z.string().default("open-source"),
  /** Trailing ink words after the accent clause (often ends with a period). */
  headlinePost: z.string().default("repo."),
  /** Optional sub / kinetic line under the headline (mono-ish). "" hides it. */
  subtitle: z.string().default(""),
  /** Single accent color (Anthropic orange default). */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over — drives ink + pill surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Layout: numbered-section headlines are LEFT; intro/outro hero cards CENTER. */
  align: z.enum(["left", "center"]).default("left"),
  /** Headline cap-height as % of 720w (spec 7–12). px@1080 = pct/100*1080. */
  headlineSizePct: z.number().default(10.4),
});

export type AbhiTitleCardProps = z.infer<typeof abhiTitleCardSchema>;

const PX = 1080; // width basis: 1px@720-spec → 1.5px on this 1080-wide canvas

export const AbhiTitleCard: React.FC<Partial<AbhiTitleCardProps>> = (props) => {
  const p = abhiTitleCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const kickerGrey = isDark ? "#9A9AA0" : "#5A5A66";
  const centered = p.align === "center";

  // ---- Geometry (spec % of 720w → px on 1080) ----
  const marginX = centered ? 0 : Math.round(0.065 * PX); // x≈6.5%
  const headlinePx = (p.headlineSizePct / 100) * PX; // cap-height-ish font size
  const kickerPx = Math.round(0.02 * PX); // ~2.0% → 21.6px

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  //   f1–6   kicker fades + drops from y−16px (×1.5 → −24px), dot ignites
  //   f8–    headline groups rise from +18px (×1.5 → +27px), ~6f apart,
  //          settling by ~f20; white groups first, accent clause sweeps ~8f
  //   f0–14  radial glow blooms behind (slower than the text)
  // ============================================================

  // --- Kicker: fade + drop from y−24px over f1–6, accent dot glow f4 ---
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

  // --- Headline word-groups: pre (white) lands first, then accent, then post ---
  const groupStarts = [8, 14, 20]; // ~6f apart
  const riseFor = (startFrame: number) => {
    const prog = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 150 },
      durationInFrames: 8,
    });
    return {
      translateY: interpolate(prog, [0, 1], [27, 0]),
      opacity: interpolate(frame, [startFrame, startFrame + 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      blur: interpolate(prog, [0, 1], [10, 0]),
    };
  };
  const preR = riseFor(groupStarts[0]);
  const accR = riseFor(groupStarts[1]);
  const postR = riseFor(groupStarts[2]);

  // Accent tint-sweep white→accent, L→R over ~8f after the accent group rises.
  // Implemented as a clip-reveal: an accent-colored copy wipes over the white copy.
  const sweepStart = groupStarts[1] + 4;
  const sweep = interpolate(frame, [sweepStart, sweepStart + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Radial glow bloom behind headline: scale 0.96→1 + opacity over 14f,
  //     then idle breathe ±4% over ~30f (continuous). ---
  const bloomIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const breathe = Math.sin((frame / 30) * Math.PI * 2) * 0.04;
  const glowScale = (0.96 + 0.04 * bloomIn) * (1 + breathe * bloomIn);
  const glowOpacity = (isDark ? 0.55 : 0.42) * bloomIn;

  // --- Subtitle (optional): fade up from +18px starting ~f22 ---
  const hasSub = p.subtitle.trim() !== SENTINEL;
  const subProg = spring({
    frame: frame - 24,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const subY = interpolate(subProg, [0, 1], [18, 0]);
  const subOpacity = interpolate(frame, [24, 31], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Kicker pill surface (DARK warm-glass / LIGHT frosted) ----
  const pillBg = isDark ? "rgba(51,28,6,0.55)" : "rgba(244,244,250,0.85)";
  const pillBorder = isDark
    ? `1px solid ${hexA(p.accentColor, 0.45)}`
    : "1px solid rgba(12,12,18,0.08)";

  const headlineStyle: React.CSSProperties = {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 900,
    fontSize: headlinePx,
    letterSpacing: "-0.02em",
    lineHeight: 0.98,
    margin: 0,
    textAlign: centered ? "center" : "left",
    // Constrain so long copy WRAPS instead of overflowing the right edge.
    maxWidth: centered ? "86%" : "88%",
    paddingRight: centered ? 0 : marginX * 0.5,
    boxSizing: "border-box",
    overflowWrap: "break-word",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Local accent radial glow backer (NOT a full background) */}
      <AbsoluteFill
        style={{
          alignItems: centered ? "center" : "flex-start",
          justifyContent: "center",
          paddingLeft: centered ? 0 : marginX * 0.4,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "62%",
            left: centered ? "50%" : "34%",
            width: "78%",
            height: "44%",
            transform: `translate(-50%, -50%) scale(${glowScale})`,
            background: `radial-gradient(ellipse at center, ${hexA(
              p.accentColor,
              0.9,
            )} 0%, ${hexA(p.accentColor, 0.35)} 36%, rgba(0,0,0,0) 70%)`,
            opacity: glowOpacity,
            filter: "blur(60px)",
          }}
        />
      </AbsoluteFill>

      {/* Foreground content column */}
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: centered ? "center" : "flex-start",
          justifyContent: "center",
          padding: centered ? "0 8%" : `0 8% 0 ${marginX}px`,
          gap: Math.round(0.026 * PX),
        }}
      >
        {/* Kicker pill */}
        <div
          style={{
            transform: `translateY(${kickerY}px)`,
            opacity: kickerOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: Math.round(kickerPx * 0.55),
            padding: `${Math.round(kickerPx * 0.62)}px ${Math.round(
              kickerPx * 0.95,
            )}px`,
            borderRadius: 999,
            background: pillBg,
            border: pillBorder,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: Math.round(kickerPx * 0.5),
              height: Math.round(kickerPx * 0.5),
              borderRadius: "50%",
              background: p.accentColor,
              boxShadow: `0 0 ${6 + dotGlow * 10}px ${hexA(
                p.accentColor,
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
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: kickerGrey,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>

        {/* Giant two-tone headline */}
        <h1 style={headlineStyle}>
          {/* Pre (white/ink) */}
          {p.headlinePre.trim() !== SENTINEL && (
            <span
              style={{
                display: "inline-block",
                color: ink,
                transform: `translateY(${preR.translateY}px)`,
                opacity: preR.opacity,
                filter: `blur(${preR.blur}px)`,
              }}
            >
              {p.headlinePre}
              {p.headlineAccent.trim() !== SENTINEL ? " " : ""}
            </span>
          )}

          {/* Accent clause — white copy with accent copy wiping over it L→R */}
          {p.headlineAccent.trim() !== SENTINEL && (
            <span
              style={{
                display: "inline-block",
                position: "relative",
                transform: `translateY(${accR.translateY}px)`,
                opacity: accR.opacity,
                filter: `blur(${accR.blur}px)`,
              }}
            >
              <span style={{ color: ink }}>{p.headlineAccent}</span>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  color: p.accentColor,
                  clipPath: `inset(0 ${100 - sweep}% 0 0)`,
                }}
              >
                {p.headlineAccent}
              </span>
              {p.headlinePost.trim() !== SENTINEL ? " " : ""}
            </span>
          )}

          {/* Post (white/ink) — terminal period often lives here */}
          {p.headlinePost.trim() !== SENTINEL && (
            <span
              style={{
                display: "inline-block",
                color: ink,
                transform: `translateY(${postR.translateY}px)`,
                opacity: postR.opacity,
                filter: `blur(${postR.blur}px)`,
              }}
            >
              {p.headlinePost}
            </span>
          )}
        </h1>

        {/* Optional subtitle */}
        {hasSub && (
          <div
            style={{
              transform: `translateY(${subY}px)`,
              opacity: subOpacity,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 600,
              fontSize: Math.round(0.038 * PX),
              lineHeight: 1.25,
              color: kickerGrey,
              textAlign: centered ? "center" : "left",
              maxWidth: "84%",
            }}
          >
            {p.subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** #RRGGBB + alpha → rgba(). Accepts already-hashed 6-digit hex. */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(253,155,0,${alpha})`;
  }
  return `rgba(${r},${g},${b},${alpha})`;
}
