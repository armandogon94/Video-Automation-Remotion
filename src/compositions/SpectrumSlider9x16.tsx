/**
 * SpectrumSlider9x16 — abhishek.devini "positioning spectrum / slider".
 *
 *   - Source frame: `references/creators/abhishek.devini/_backcat/DXPok2jktuK/f03.jpg`
 *     ("A calculated half-step"): a two-tone headline up top, then a 1-D
 *     horizontal CONTINUUM lower in the frame — a multi-color gradient TRACK
 *     between two named END-POLES (left label "Opus 4.6", right label
 *     "Mythos"), with a small circular MARKER easing to a point along the track,
 *     a value/label callout above the marker ("4.7 sits here") and a numeric
 *     read-out below it ("~50%"), plus min/max numbers under each end. It places
 *     a subject on a scale between two extremes.
 *
 * abhishek style (DARK mode chosen per brief): near-black warm base + faint
 * square grid masked to center + a soft radial accent GLOW behind the hero
 * text. Above the track sits a KICKER pill and a GIANT two-tone headline
 * (first line in ink, second line in the accent color). End-pole labels are
 * MONO, uppercase, tracked.
 *
 * Motion mirrors the source: everything settles top-down — kicker, then the
 * two headline lines, then the track draws in, then the MARKER SPRINGS from 0%
 * to `markerPositionPct` along the track (with the callout + value riding it).
 *
 * GOTCHAS honored:
 *   (a) comp id has no underscore.
 *   (b) hero/two-tone text uses SOLID colors (never background-clip:text) — the
 *       gradient lives only in the TRACK fill, which is a real element.
 *   (c) all motion derives from useCurrentFrame (no Date.now/Math.random).
 *
 * Self-contained: react + remotion + zod + ../brand + inline SVG only.
 * Local zod v4 schema; every field has a sensible DEMO `.default()` so it
 * renders real content with `{}` props. We do not touch shared source files.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand";

// ─── Public schema + types ─────────────────────────────────────────────
export const spectrumSlider9x16Schema = z.object({
  /** Small kicker pill above the headline. "" hides the pill. */
  kicker: z.string().default("Where it lands"),

  /**
   * Two-line headline. Use a single newline ("\n") to split — line 1 renders
   * in `inkColor`, line 2 in `accentColor` (the source's two-tone look). If
   * there's no newline the whole headline renders in ink.
   */
  headline: z.string().default("A calculated\nhalf-step"),

  /** Left end-pole label (the "low" extreme). */
  leftPole: z.string().default("Opus 4.6"),
  /** Right end-pole label (the "high" extreme). */
  rightPole: z.string().default("Mythos"),

  /** Numeric read-out under the left pole (e.g. version / floor). "" hides it. */
  leftPoleValue: z.string().default("4.6"),
  /** Numeric read-out under the right pole (e.g. version / ceiling). "" hides it. */
  rightPoleValue: z.string().default("5.0"),

  /** Final marker position along the track, 0 (left pole) → 100 (right pole). */
  markerPositionPct: z.number().min(0).max(100).default(46),

  /** Callout text ABOVE the marker. "" hides the callout. */
  markerLabel: z.string().default("4.7 sits here"),
  /** Value read-out BELOW the marker. "" hides it. */
  markerValue: z.string().default("~50%"),

  /**
   * Gradient stops painted left→right across the track. ≥2 colors. Default is
   * the source's blue→orange→gray sweep.
   */
  trackColors: z
    .array(z.string())
    .min(2)
    .default(["#5B6CF0", "#E8743B", "#9AA0AA"]),

  /** Accent color — headline line 2, kicker pill, marker ring, callout, glow. */
  accentColor: z.string().default("#E8743B"),

  /** Ink (primary text) color on the dark base. */
  inkColor: z.string().default("#F4EFE9"),
  /** Muted secondary text (poles / sub-numbers). */
  mutedColor: z.string().default("#8B8780"),
  /** Warm near-black base for the dark abhishek canvas. */
  darkBase: z.string().default("#08050B"),
});
export type SpectrumSlider9x16Props = z.infer<typeof spectrumSlider9x16Schema>;

// ─── helpers ───────────────────────────────────────────────────────────
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── component ───────────────────────────────────────────────────────────
export const SpectrumSlider9x16: React.FC<Partial<SpectrumSlider9x16Props>> = (
  props,
) => {
  const p = spectrumSlider9x16Schema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── layout constants (1080×1920) ──
  const trackInset = 150; // px from each edge to the track ends
  const trackY = height * 0.46; // vertical center of the track
  const trackWidth = width - trackInset * 2;
  const trackHeight = 14;
  const markerR = 22; // marker radius

  // ── breathing glow (derived from frame; no Date.now) ──
  const breathe = 1 + 0.08 * Math.sin((frame / (fps * 1.6)) * Math.PI);

  // ── reveal choreography (top-down) ──
  const kickerSpring = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const kickerOpacity = interpolate(kickerSpring, [0, 1], [0, 1]);
  const kickerY = interpolate(kickerSpring, [0, 1], [-18, 0]);

  const line1Op = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [6, 20], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const line2Op = interpolate(frame, [14, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [14, 30], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Track draws in from the left (clip-path width) starting ~frame 32.
  const trackDraw = interpolate(frame, [32, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // End-pole labels + ticks fade with the track.
  const polesOpacity = interpolate(frame, [40, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Marker springs 0 → markerPositionPct after the track is mostly drawn.
  const markerStart = 60;
  const markerProgress = spring({
    frame: frame - markerStart,
    fps,
    config: { damping: 14, stiffness: 70, mass: 1.1 },
  });
  const markerPct = interpolate(markerProgress, [0, 1], [0, p.markerPositionPct], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markerX = trackInset + (markerPct / 100) * trackWidth;
  // Callout/value ride in with the marker and settle.
  const calloutOpacity = interpolate(frame, [markerStart + 6, markerStart + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markerPop = interpolate(markerProgress, [0, 0.6, 1], [0.4, 1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── headline split ──
  const [hl1, hl2 = ""] = p.headline.split("\n");

  const trackGradient = `linear-gradient(90deg, ${p.trackColors.join(", ")})`;
  const monoStyle: React.CSSProperties = {
    fontFamily: FONT_STACKS.mono,
    letterSpacing: 1,
    textTransform: "uppercase",
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(178deg, ${p.darkBase} 0%, #110E12 55%, #0A0709 100%)`,
      }}
    >
      {/* faint warm square grid, masked to the center */}
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${hexA("#FFEFE2", 0.045)} 1px, transparent 1px), ` +
            `linear-gradient(90deg, ${hexA("#FFEFE2", 0.045)} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, #000 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, #000 30%, transparent 85%)",
        }}
      />
      {/* soft radial accent glow behind the hero text */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${Math.round(
            width * 0.55 * breathe,
          )}px at 50% 34%, ${hexA(p.accentColor, 0.24)} 0%, ${hexA(
            p.accentColor,
            0.08,
          )} 30%, transparent 62%)`,
        }}
      />
      {/* bottom vignette */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent 62%, ${hexA(
            "#000000",
            0.5,
          )} 100%)`,
        }}
      />

      {/* ── hero text block ── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: height * 0.16,
        }}
      >
        {/* kicker pill */}
        {p.kicker ? (
          <div
            style={{
              opacity: kickerOpacity,
              transform: `translateY(${kickerY}px)`,
              padding: "10px 22px",
              borderRadius: 999,
              border: `1px solid ${hexA(p.accentColor, 0.45)}`,
              background: hexA(p.accentColor, 0.1),
              color: p.accentColor,
              fontFamily: FONT_STACKS.mono,
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 34,
            }}
          >
            {p.kicker}
          </div>
        ) : null}

        {/* two-tone headline — SOLID colors only */}
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.04,
            textAlign: "center",
            letterSpacing: -2,
          }}
        >
          <div
            style={{
              color: p.inkColor,
              opacity: line1Op,
              transform: `translateY(${line1Y}px)`,
            }}
          >
            {hl1}
          </div>
          {hl2 ? (
            <div
              style={{
                color: p.accentColor,
                opacity: line2Op,
                transform: `translateY(${line2Y}px)`,
              }}
            >
              {hl2}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>

      {/* ── the spectrum / slider (absolute-positioned around trackY) ── */}
      {/* end-pole labels */}
      <div
        style={{
          position: "absolute",
          left: trackInset,
          top: trackY - 56,
          opacity: polesOpacity,
          ...monoStyle,
          color: p.inkColor,
          fontSize: 26,
          fontWeight: 500,
        }}
      >
        {p.leftPole}
      </div>
      <div
        style={{
          position: "absolute",
          right: trackInset,
          top: trackY - 56,
          opacity: polesOpacity,
          ...monoStyle,
          color: p.inkColor,
          fontSize: 26,
          fontWeight: 500,
          textAlign: "right",
        }}
      >
        {p.rightPole}
      </div>

      {/* track: muted base + gradient fill that draws in left→right */}
      <div
        style={{
          position: "absolute",
          left: trackInset,
          top: trackY - trackHeight / 2,
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight,
          background: hexA(p.mutedColor, 0.25),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: trackGradient,
            clipPath: `inset(0 ${(1 - trackDraw) * 100}% 0 0)`,
          }}
        />
      </div>

      {/* end ticks */}
      {[trackInset, trackInset + trackWidth].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - 1,
            top: trackY - trackHeight,
            width: 2,
            height: trackHeight * 2,
            background: hexA(p.mutedColor, 0.5),
            opacity: polesOpacity,
          }}
        />
      ))}

      {/* pole numeric read-outs under the ends */}
      {p.leftPoleValue ? (
        <div
          style={{
            position: "absolute",
            left: trackInset,
            top: trackY + 26,
            opacity: polesOpacity,
            color: p.mutedColor,
            fontFamily: FONT_STACKS.mono,
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          {p.leftPoleValue}
        </div>
      ) : null}
      {p.rightPoleValue ? (
        <div
          style={{
            position: "absolute",
            right: trackInset,
            top: trackY + 26,
            opacity: polesOpacity,
            color: p.mutedColor,
            fontFamily: FONT_STACKS.mono,
            fontSize: 22,
            letterSpacing: 1,
            textAlign: "right",
          }}
        >
          {p.rightPoleValue}
        </div>
      ) : null}

      {/* ── marker callout (above) ── */}
      {p.markerLabel ? (
        <div
          style={{
            position: "absolute",
            left: markerX,
            top: trackY - 86,
            transform: "translateX(-50%)",
            opacity: calloutOpacity,
            color: p.accentColor,
            fontFamily: FONT_STACKS.mono,
            fontSize: 24,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {p.markerLabel}
        </div>
      ) : null}

      {/* ── the marker dot (rides markerX, springs scale) ── */}
      <svg
        width={markerR * 2 + 12}
        height={markerR * 2 + 12}
        viewBox={`0 0 ${markerR * 2 + 12} ${markerR * 2 + 12}`}
        style={{
          position: "absolute",
          left: markerX - (markerR + 6),
          top: trackY - (markerR + 6),
          transform: `scale(${markerPop})`,
          transformOrigin: "center center",
          filter: `drop-shadow(0 0 14px ${hexA(p.accentColor, 0.55)})`,
        }}
      >
        <circle
          cx={markerR + 6}
          cy={markerR + 6}
          r={markerR}
          fill={p.darkBase}
          stroke={p.accentColor}
          strokeWidth={5}
        />
        <circle
          cx={markerR + 6}
          cy={markerR + 6}
          r={markerR * 0.42}
          fill={p.accentColor}
        />
      </svg>

      {/* ── marker value (below) ── */}
      {p.markerValue ? (
        <div
          style={{
            position: "absolute",
            left: markerX,
            top: trackY + 56,
            transform: "translateX(-50%)",
            opacity: calloutOpacity,
            color: p.inkColor,
            fontFamily: FONT_STACKS.sans,
            fontSize: 30,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {p.markerValue}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
