/**
 * AnimatedText9x16 — vertical (1080×1920) kinetic-typography hero card.
 *
 * Single composition that routes a `revealStyle` enum to one of 5 reveal
 * sub-components, all derived from R5 research (docs/research/wave-1/R5-
 * kinetic-typography.md). Each reveal is purely frame-deterministic (SSR-safe)
 * and grapheme-cluster-safe for Spanish accents (`ñ á é í ó ú ¿ ¡`).
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb at top (~80px) — universal house grammar
 *   - Hero text vertical-centered (Inter 900, 120–180px, auto-shrunk by length)
 *   - Optional subtitle below in Inter 500 muted
 *   - Optional bottom EditorialCaption strip (gated by showCaptions)
 *
 * Reveal grammar:
 *   1. typewriter      — slice-based char-by-char with 530ms blinking caret ▌
 *   2. blur-in         — filter blur 30px→0 + opacity 0→1 over 0.6s, static text
 *   3. scale-punch     — scale 0.3→1.0 with overshoot spring (damping 8 — punchy)
 *   4. scramble-decrypt— per-char seeded scramble (mulberry32), settles L→R over 1.0s
 *   5. highlight-sweep — accent rect sweeps L→R behind text; swept area inverts
 *
 * House conventions followed (matching BigNumberHero9x16 + QuoteCard9x16):
 *   - palette `cream` | `dark` resolution via resolveColors(palette, overrides)
 *   - subjectTool tints the accent via getToolAccent()
 *   - paper-grain overlay (multiply on cream, screen on dark)
 *   - audio mounted via <Audio> when audioUrl is set
 *
 * NOTE on schemas: this composition redeclares its Zod schema locally rather
 * than exporting it from `src/compositions/schemas.ts`, because the task
 * brief explicitly forbids touching shared source files. The schema is
 * exported from this file as `animatedText9x16Schema` so Root.tsx can import
 * it directly. TODO: when the shared-schema policy allows it, move this
 * schema into `schemas.ts` alongside the other 9x16 schemas.
 */
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Locally-redeclared shared schemas ─────────────────────────────────
// TODO: move these to src/compositions/schemas.ts when allowed; for now we
// redeclare them locally to avoid touching shared source files (per brief).
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

// ─── Public schema + types ─────────────────────────────────────────────
const revealStyleEnum = z.enum([
  "typewriter",
  "blur-in",
  "scale-punch",
  "scramble-decrypt",
  "highlight-sweep",
]);
export type RevealStyle = z.infer<typeof revealStyleEnum>;

export const animatedText9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  text: z.string().default("GEMINI 3.2 FLASH"),
  subtitle: z.string().optional(),
  revealStyle: revealStyleEnum.default("blur-in"),
  /** Duration of the reveal animation. Default 0.8s. */
  revealDurationSeconds: z.number().min(0.2).max(5).default(0.8),
  /** When set + found in wordTimings, the reveal starts at the spoken-keyword time. */
  audioAnchorKeyword: z.string().optional(),
  /** Hex color seed for scramble pool. Default uses all-caps Latin alphanumeric. */
  scrambleCharPool: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AnimatedText9x16Props = z.infer<typeof animatedText9x16Schema>;

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Seeded PRNG. Pure-deterministic, returns a function that yields 0..1 floats.
 * We use this for the scramble reveal so SSR-render output matches Studio preview.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Auto-shrink the hero font size based on character count, so very long lines
 * still fit in 1080px width. Range 120–180px (Inter 900).
 */
function pickHeroFontSize(text: string): number {
  const len = Array.from(text).length;
  if (len <= 12) return 180;
  if (len <= 18) return 156;
  if (len <= 26) return 138;
  if (len <= 36) return 124;
  return 120;
}

/** Resolve the reveal start frame: keyword-anchored if found, else 0. */
function resolveStartFrame(
  audioAnchorKeyword: string | undefined,
  wordTimings: AnimatedText9x16Props["wordTimings"],
): number {
  if (!audioAnchorKeyword) return 0;
  const needle = audioAnchorKeyword.trim().toLowerCase();
  if (!needle) return 0;
  const hit = wordTimings.find(
    (w) => w.text.trim().toLowerCase().replace(/[.,!?¿¡]/g, "") === needle,
  );
  return hit ? Math.max(0, Math.floor(hit.startFrame)) : 0;
}

// ─── Reveal sub-component: typewriter ──────────────────────────────────
const TypewriterReveal: React.FC<{
  text: string;
  fontSize: number;
  inkColor: string;
  accentColor: string;
  localFrame: number;
  fps: number;
  revealDurationSeconds: number;
}> = ({ text, fontSize, inkColor, accentColor, localFrame, fps, revealDurationSeconds }) => {
  // Use grapheme-safe iteration (Array.from) for Spanish accents/emoji.
  const chars = useMemo(() => Array.from(text), [text]);
  const totalChars = chars.length;
  const durationFrames = Math.max(1, Math.round(revealDurationSeconds * fps));
  // Linear progression for "typing" cadence (no easing — typing has constant speed).
  const visibleCount = Math.min(
    totalChars,
    Math.max(0, Math.floor((localFrame / durationFrames) * totalChars)),
  );
  // CRITICAL: slice-based, NEVER per-char opacity (Remotion docs warn against
  // 1000-node renders per frame).
  const shown = chars.slice(0, visibleCount).join("");

  // 530ms blink cycle (per R1/R5 spec: matches macOS terminal cadence).
  const blinkPeriodFrames = Math.max(1, Math.round((0.53 * fps) * 2));
  const caretOn = Math.floor(localFrame / (blinkPeriodFrames / 2)) % 2 === 0;
  // Hide caret entirely once typing is complete AND held for ~0.8s.
  const typingDone = visibleCount >= totalChars;
  const holdAfterDoneFrames = Math.round(0.8 * fps);
  const caretVisible = !typingDone || localFrame < durationFrames + holdAfterDoneFrames;

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize,
        color: inkColor,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
        textAlign: "center",
        maxWidth: 980,
      }}
    >
      <span>{shown}</span>
      <span
        style={{
          color: accentColor,
          opacity: caretVisible && caretOn ? 1 : 0,
          marginLeft: "0.04em",
        }}
      >
        ▌
      </span>
    </div>
  );
};

// ─── Reveal sub-component: blur-in ─────────────────────────────────────
const BlurInReveal: React.FC<{
  text: string;
  fontSize: number;
  inkColor: string;
  localFrame: number;
  fps: number;
  revealDurationSeconds: number;
}> = ({ text, fontSize, inkColor, localFrame, fps, revealDurationSeconds }) => {
  // Static text — only filter + opacity animate.
  const durationFrames = Math.max(1, Math.round(revealDurationSeconds * fps));
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blurPx = interpolate(progress, [0, 1], [30, 0]);
  const opacity = interpolate(progress, [0, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize,
        color: inkColor,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
        textAlign: "center",
        maxWidth: 980,
        filter: `blur(${blurPx}px)`,
        opacity,
        willChange: "filter, opacity",
      }}
    >
      {text}
    </div>
  );
};

// ─── Reveal sub-component: scale-punch ─────────────────────────────────
const ScalePunchReveal: React.FC<{
  text: string;
  fontSize: number;
  inkColor: string;
  localFrame: number;
  fps: number;
}> = ({ text, fontSize, inkColor, localFrame, fps }) => {
  // Overshoot spring — damping 8 (punchy), distinct from QuoteCard's editorial 22.
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 8, mass: 0.8, stiffness: 120 },
  });
  const scale = interpolate(enter, [0, 1], [0.3, 1.0]);
  const opacity = interpolate(localFrame, [0, Math.round(0.2 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize,
        color: inkColor,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
        textAlign: "center",
        maxWidth: 980,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        opacity,
        display: "inline-block",
      }}
    >
      {text}
    </div>
  );
};

// ─── Reveal sub-component: scramble-decrypt ────────────────────────────
const DEFAULT_SCRAMBLE_POOL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*¿¡ñÑáéíóúÁÉÍÓÚ";

const ScrambleDecryptReveal: React.FC<{
  text: string;
  fontSize: number;
  inkColor: string;
  accentColor: string;
  scrambleCharPool: string;
  localFrame: number;
  fps: number;
  revealDurationSeconds: number;
}> = ({
  text,
  fontSize,
  inkColor,
  accentColor,
  scrambleCharPool,
  localFrame,
  fps,
  revealDurationSeconds,
}) => {
  // Grapheme-safe iteration (Array.from, never str.split('')).
  const chars = useMemo(() => Array.from(text), [text]);
  const pool = useMemo(() => {
    const raw = scrambleCharPool && scrambleCharPool.length > 0
      ? scrambleCharPool
      : DEFAULT_SCRAMBLE_POOL;
    return Array.from(raw);
  }, [scrambleCharPool]);

  const totalChars = chars.length;
  const durationFrames = Math.max(1, Math.round(revealDurationSeconds * fps));
  // Each char locks at: (i / totalChars) * durationFrames. So char 0 settles
  // first, char N-1 settles at the very end of the reveal window.
  const perCharLockFrames = totalChars > 0 ? durationFrames / totalChars : 1;

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize,
        color: inkColor,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
        textAlign: "center",
        maxWidth: 980,
        whiteSpace: "pre-wrap",
      }}
    >
      {chars.map((finalChar, i) => {
        // Preserve spaces / line breaks as-is (don't scramble whitespace).
        if (finalChar === " " || finalChar === "\n" || finalChar === "\t") {
          return <span key={i}>{finalChar}</span>;
        }
        const lockAt = Math.round((i + 1) * perCharLockFrames);
        const locked = localFrame >= lockAt;
        if (locked) {
          return <span key={i}>{finalChar}</span>;
        }
        // Deterministic per (frame, i) — ticks every 2 frames so it visibly cycles.
        const tick = Math.floor(localFrame / 2);
        const rand = mulberry32(tick * 1009 + i * 31)();
        const idx = Math.floor(rand * pool.length);
        const ghost = pool[idx] ?? finalChar;
        return (
          <span key={i} style={{ color: accentColor }}>
            {ghost}
          </span>
        );
      })}
    </div>
  );
};

// ─── Reveal sub-component: highlight-sweep ─────────────────────────────
const HighlightSweepReveal: React.FC<{
  text: string;
  fontSize: number;
  inkColor: string;
  paperColor: string;
  accentColor: string;
  localFrame: number;
  fps: number;
  revealDurationSeconds: number;
}> = ({
  text,
  fontSize,
  inkColor,
  paperColor,
  accentColor,
  localFrame,
  fps,
  revealDurationSeconds,
}) => {
  // Text is static; only the sweeping rectangle + its clip mask animate.
  const durationFrames = Math.max(1, Math.round(revealDurationSeconds * fps));
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Layered approach: a fixed-size container holds 3 copies of the text:
  //   - Layer 1: ink-colored text (always fully visible underneath)
  //   - Layer 2: accent rectangle, scaleX growing 0→1 from left
  //   - Layer 3: paper-colored text clip-pathed to ONLY show inside the swept area
  // This produces the "inverted text inside the sweep" effect.
  const inset = `inset(0 ${(1 - progress) * 100}% 0 0)`;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0.08em 0.18em",
      }}
    >
      {/* Layer 1 — base ink text (visible outside the sweep) */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize,
          color: inkColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          display: "inline-block",
          maxWidth: 980,
          textAlign: "center",
        }}
      >
        {text}
      </span>

      {/* Layer 2 — accent sweep rectangle */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: accentColor,
          transformOrigin: "left center",
          transform: `scaleX(${progress})`,
          pointerEvents: "none",
        }}
      />

      {/* Layer 3 — paper-colored text, clipped to ONLY appear inside the sweep */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "0.08em 0.18em",
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize,
          color: paperColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          display: "inline-block",
          maxWidth: 980,
          textAlign: "center",
          clipPath: inset,
          WebkitClipPath: inset,
          pointerEvents: "none",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const AnimatedText9x16: React.FC<AnimatedText9x16Props> = ({
  audioUrl,
  wordTimings,
  text,
  subtitle,
  revealStyle,
  revealDurationSeconds,
  audioAnchorKeyword,
  scrambleCharPool,
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
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Optional audio-anchored start (uses provided wordTimings).
  const startFrame = useMemo(
    () => resolveStartFrame(audioAnchorKeyword, wordTimings),
    [audioAnchorKeyword, wordTimings],
  );
  const localFrame = Math.max(0, frame - startFrame);

  const heroFontSize = pickHeroFontSize(text);

  const reveal = (() => {
    switch (revealStyle) {
      case "typewriter":
        return (
          <TypewriterReveal
            text={text}
            fontSize={heroFontSize}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            localFrame={localFrame}
            fps={fps}
            revealDurationSeconds={revealDurationSeconds}
          />
        );
      case "blur-in":
        return (
          <BlurInReveal
            text={text}
            fontSize={heroFontSize}
            inkColor={resolvedInk}
            localFrame={localFrame}
            fps={fps}
            revealDurationSeconds={revealDurationSeconds}
          />
        );
      case "scale-punch":
        return (
          <ScalePunchReveal
            text={text}
            fontSize={heroFontSize}
            inkColor={resolvedInk}
            localFrame={localFrame}
            fps={fps}
          />
        );
      case "scramble-decrypt":
        return (
          <ScrambleDecryptReveal
            text={text}
            fontSize={heroFontSize}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            scrambleCharPool={scrambleCharPool}
            localFrame={localFrame}
            fps={fps}
            revealDurationSeconds={revealDurationSeconds}
          />
        );
      case "highlight-sweep":
        return (
          <HighlightSweepReveal
            text={text}
            fontSize={heroFontSize}
            inkColor={resolvedInk}
            paperColor={resolvedPaper}
            accentColor={resolvedAccent}
            localFrame={localFrame}
            fps={fps}
            revealDurationSeconds={revealDurationSeconds}
          />
        );
      default:
        return null;
    }
  })();

  // Subtitle fades in 0.25s after the reveal completes.
  const subtitleStartFrame =
    Math.round(revealDurationSeconds * fps) + Math.round(0.25 * fps);
  const subtitleOpacity = interpolate(
    localFrame,
    [subtitleStartFrame, subtitleStartFrame + Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven paper-grain overlay */}
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

      {/* Centered hero stack — reveal + optional subtitle */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        {reveal}

        {subtitle && (
          <div
            style={{
              marginTop: 56,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 44,
              color: resolvedMuted,
              lineHeight: 1.2,
              maxWidth: 880,
              textAlign: "center",
              letterSpacing: "0.005em",
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>

      {/* Bottom EditorialCaption strip — optional */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
