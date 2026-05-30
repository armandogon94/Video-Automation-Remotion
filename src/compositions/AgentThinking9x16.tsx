/**
 * AgentThinking9x16 — vertical (1080×1920) "the agent is processing" primitive.
 *
 * Per R4 (docs/research/wave-1/R4-robot-character.md) this is the highest-leverage
 * AI/agent visual signal we can ship: a brand-tinted breathing orb + 3-dot pulse +
 * caption underneath. Pure CSS / SVG, no Lottie / Rive / WebGL. Deterministic per
 * frame (everything is driven off useCurrentFrame()).
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - ORB ZONE (~y=600..1200): radial-gradient orb centered, 2 concentric rings,
 *     optional 3-dot "thinking" pulse underneath.
 *   - Caption ZONE (~y=1400..1700): Inter 600 caption, ink, 2–3 lines, centered.
 *   - Optional EditorialCaption bottom strip (default off).
 *
 * Motion grammar:
 *   - Orb fades in over 0.4s at frame 0 via a soft cubic ease.
 *   - Breathing loop: radius oscillates 240 ↔ 260 (configurable) on a 2.4s sinusoid;
 *     opacity oscillates 0.7 ↔ 1.0 in phase. Two outer rings breathe at +0.6s /
 *     +1.2s phase offsets at lower opacities so the whole orb "breathes" as a stack.
 *   - 3 thinking dots stagger by 200ms (6f @ 30fps); each dot's opacity cycles
 *     0.2 → 1.0 → 0.2 on a 0.9s period.
 *   - Caption fades in 0.8s after the orb appears.
 */
import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";
import { outCubic } from "../timing/easing";

// ─── Local schema (shared schemas.ts intentionally untouched) ─────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

export const agentThinking9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  caption: z.string().default("Procesando..."),
  /** Show the 3-dot thinking pulse below the orb. */
  showThinkingDots: z.boolean().default(true),
  /** Orb base radius in px. Default 250. */
  orbRadiusPx: z.number().min(80).max(400).default(250),
  /** Breathing period in seconds. Default 2.4s. */
  breathingPeriodSeconds: z.number().min(0.5).max(10).default(2.4),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AgentThinking9x16Props = z.infer<typeof agentThinking9x16Schema>;

// ─── Layout constants ─────────────────────────────────────────────────────────
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const ORB_CENTER_Y = 900; // vertical center of the orb (within the 600..1200 zone)
const CAPTION_TOP_Y = 1400;
const CAPTION_MAX_WIDTH = 880;
const CAPTION_LINE_HEIGHT = 1.18;

// Breathing amplitude — radius oscillates [radius-10, radius+10]
const BREATH_AMP_PX = 10;

// Thinking-dot geometry
const DOT_SIZE = 14;
const DOT_GAP = 12;
const DOT_STAGGER_MS = 200;
const DOT_CYCLE_SECONDS = 0.9;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Soft cubic ease-out 0 → 1. Clamps input; delegates to the shared `outCubic` curve. */
function easeOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return outCubic(clamped);
}

/**
 * Sinusoid in [0,1] of period `periodFrames`, offset by `phaseFrames`.
 * Returns 0 at the trough and 1 at the peak.
 */
function breath(frame: number, periodFrames: number, phaseFrames = 0): number {
  const t = ((frame + phaseFrames) % periodFrames) / periodFrames;
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
}

// ─── Composition ──────────────────────────────────────────────────────────────
export const AgentThinking9x16: React.FC<AgentThinking9x16Props> = ({
  audioUrl,
  wordTimings,
  caption,
  showThinkingDots,
  orbRadiusPx,
  breathingPeriodSeconds,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });
  const resolvedAccent =
    (accentColor && accentColor.length > 0)
      ? accentColor
      : subjectTool
        ? getToolAccentForSurface(subjectTool, palette)
        : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // ─── Orb entrance + breathing ────────────────────────────────────────────
  const entranceFrames = Math.round(0.4 * fps); // 12f @ 30fps
  const orbEnter = easeOut(frame / entranceFrames);
  const periodFrames = breathingPeriodSeconds * fps;

  // Core orb breath: radius and opacity oscillate together.
  const coreBreath = breath(frame, periodFrames, 0);
  const coreRadius = orbRadiusPx + BREATH_AMP_PX * (coreBreath * 2 - 1); // [-amp, +amp]
  const coreOpacity = interpolate(coreBreath, [0, 1], [0.7, 1.0]) * orbEnter;

  // Ring 1 — slight phase offset, lower opacity envelope.
  const ring1PhaseFrames = Math.round(0.6 * fps);
  const ring1Breath = breath(frame, periodFrames, ring1PhaseFrames);
  const ring1Radius = orbRadiusPx + 60 + BREATH_AMP_PX * 1.4 * (ring1Breath * 2 - 1);
  const ring1Opacity = interpolate(ring1Breath, [0, 1], [0.12, 0.32]) * orbEnter;

  // Ring 2 — larger phase offset, even lower opacity.
  const ring2PhaseFrames = Math.round(1.2 * fps);
  const ring2Breath = breath(frame, periodFrames, ring2PhaseFrames);
  const ring2Radius = orbRadiusPx + 130 + BREATH_AMP_PX * 1.8 * (ring2Breath * 2 - 1);
  const ring2Opacity = interpolate(ring2Breath, [0, 1], [0.06, 0.22]) * orbEnter;

  // ─── Thinking-dot pulses ─────────────────────────────────────────────────
  const dotCycleFrames = DOT_CYCLE_SECONDS * fps;
  const dotStaggerFrames = (DOT_STAGGER_MS / 1000) * fps;
  const dotOpacities: number[] = [0, 1, 2].map((i) => {
    const dotBreath = breath(frame, dotCycleFrames, i * dotStaggerFrames);
    // Cycle each dot 0.2 → 1.0 → 0.2 across its period.
    return interpolate(dotBreath, [0, 1], [0.2, 1.0]) * orbEnter;
  });
  const dotsRowWidth = DOT_SIZE * 3 + DOT_GAP * 2;
  const dotsRowY = ORB_CENTER_Y + orbRadiusPx + 80; // below the orb + breathing slack

  // ─── Caption fade-in (0.8s after orb appears) ───────────────────────────
  const captionStart = Math.round(0.8 * fps);
  const captionFadeFrames = Math.round(0.5 * fps);
  const captionOpacity = interpolate(
    frame,
    [captionStart, captionStart + captionFadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Outer breathing extent (used to size the SVG so nothing clips).
  const orbExtent = orbRadiusPx + 130 + BREATH_AMP_PX * 2;
  const svgSize = orbExtent * 2 + 40;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* ORB ZONE — centered around ORB_CENTER_Y */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ORB_CENTER_Y - svgSize / 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Multi-stop radial gradient: accent core → softened paper edge. */}
            <radialGradient id="orbCoreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={resolvedAccent} stopOpacity="0.95" />
              <stop offset="38%" stopColor={resolvedAccent} stopOpacity="0.70" />
              <stop offset="72%" stopColor={resolvedAccent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={resolvedPaper} stopOpacity="0" />
            </radialGradient>
            {/* Soft blur for the outer glow ring. */}
            <filter id="orbSoftBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Outer concentric ring (slowest breath) */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={ring2Radius}
            fill="none"
            stroke={resolvedAccent}
            strokeWidth={2}
            opacity={ring2Opacity}
          />

          {/* Middle concentric ring */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={ring1Radius}
            fill="none"
            stroke={resolvedAccent}
            strokeWidth={2.5}
            opacity={ring1Opacity}
          />

          {/* Core orb — radial gradient fill, breathes radius + opacity */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={coreRadius}
            fill="url(#orbCoreGradient)"
            opacity={coreOpacity}
          />

          {/* Inner highlight — small, brighter, sits on top */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={Math.max(20, coreRadius * 0.45)}
            fill={resolvedAccent}
            opacity={0.18 * orbEnter}
            filter="url(#orbSoftBlur)"
          />
        </svg>
      </div>

      {/* Thinking-dot pulse — sits below the orb */}
      {showThinkingDots && (
        <div
          style={{
            position: "absolute",
            top: dotsRowY,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: DOT_GAP,
            pointerEvents: "none",
          }}
        >
          {dotOpacities.map((opacity, i) => (
            <div
              key={i}
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: "50%",
                background: resolvedAccent,
                opacity,
              }}
            />
          ))}
          {/* Reserve width for stable horizontal centering (unused once gap renders) */}
          <span style={{ width: 0, height: 0, visibility: "hidden" }}>
            {dotsRowWidth}
          </span>
        </div>
      )}

      {/* CAPTION ZONE — primary text under the orb */}
      <div
        style={{
          position: "absolute",
          top: CAPTION_TOP_Y,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 100px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 56,
            color: resolvedInk,
            lineHeight: CAPTION_LINE_HEIGHT,
            letterSpacing: "-0.01em",
            maxWidth: CAPTION_MAX_WIDTH,
            textAlign: "center",
            opacity: captionOpacity,
          }}
        >
          {caption}
        </div>
      </div>

      {/* Bottom-strip word-by-word captions — gated by showCaptions (default off) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 140,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Hidden invariant guard — keeps the FRAME_WIDTH/HEIGHT constants live
          in case future code references them for layout math. */}
      <span style={{ display: "none" }}>
        {FRAME_WIDTH}×{FRAME_HEIGHT}
      </span>
    </AbsoluteFill>
  );
};
