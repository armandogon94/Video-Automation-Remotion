/**
 * Text-Emphasis primitives — semantic emphasis modes for headline/caption layers.
 *
 * Synthesized from three creator critiques (Wave-4):
 *
 *  - Carlos Cuamatzin (vote 1, T5 single-word color emphasis, T21 anti-pattern X):
 *    "Recolor one word in the headline, keep the rest base. The recolored word
 *     IS the meaning. Don't underline, don't bold — just shift the hue."
 *
 *  - DIYSmartCode (vote 2 T5, vote 3 N25 / N16):
 *    "Strikethrough is not a visual flourish. It's the moment the speaker
 *     contradicts a prior claim — the line lands ON the syllable that negates."
 *    "Underline is a marker move, hand-drawn wavy, slightly off-baseline."
 *
 *  - Simon Willison V5 cascade:
 *    Headline reveal arrives word-by-word so the emphasized word is the LAST
 *    one to land — Carlos's "deferred-payoff" rhythm.
 *
 * Frame references:
 *   references/creators/diysmartcode/Jj3m_R2627Y/frames/frame-04.jpg
 *     (strikethrough through "The model is the moat.")
 *   references/creators/diysmartcode/6nVW14npcO4/frames/frame-03.jpg
 *     (wavy underline beneath "US-only")
 *
 * All four components are pure functional React — they accept `progress: number`
 * (or `revealProgress`) in [0, 1] and the parent composition is responsible for
 * driving that value via `useCurrentFrame` + `interpolate`. This keeps the
 * primitives composable in Storybook / vitest snapshots without a Remotion frame
 * context.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { linear, outCubic } from "../timing/easing";
import { FONT_STACKS } from "../brand";

// Brand-aligned warm-red used by all four primitives as the default emphasis
// stroke color. Matches Carlos's recolor accent (#B33A2A) — slightly muted
// vermillion that reads as "marker ink" on cream, not pure red alarm.
const WARM_RED = "#B33A2A";

// Deterministic pseudo-random — small, seedable, no Math.random() so renders
// are frame-stable across passes. Standard mulberry32 step.
function seededNoise(seed: number, index: number): number {
  let t = (seed + index * 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1; // [-1, 1]
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. <Strikethrough> — SVG stroke-dash animated line through text
// ─────────────────────────────────────────────────────────────────────────────

export interface StrikethroughProps {
  /** Animated reveal — line draws L→R from 0 to fullWidth. */
  progress: number; // 0..1
  /** Color of the strikethrough line. */
  color?: string; // default warm-red #B33A2A
  /** Line thickness in px. */
  thicknessPx?: number; // default 6
  /** Optional slight downward tilt (degrees). Carlos uses ~-2° tilt for "marker-quick" feel. */
  tiltDegrees?: number; // default -2
  /** Container that wraps the child text — line is drawn over the child. */
  children: React.ReactNode;
  /** Optional jitter amplitude (px) for hand-drawn feel. Default 1 (very subtle). */
  jitterAmplitude?: number;
  /** Deterministic seed for jitter. */
  seed?: number;
}

/**
 * Marker-style strikethrough that draws L→R over the wrapped child. The line is
 * rendered as a single SVG `<line>` whose stroke-dasharray is clipped to
 * `progress * length` so the visible portion grows linearly — matching the
 * "marker swipe" rhythm DIYSmart frame-04 demonstrates (the stroke is fast,
 * almost ballistic, no easing curve). For per-pixel jitter we sample three
 * deterministic offsets along the line and round-end the cap.
 */
export const Strikethrough: React.FC<StrikethroughProps> = ({
  progress,
  color = WARM_RED,
  thicknessPx = 6,
  tiltDegrees = -2,
  children,
  jitterAmplitude = 1,
  seed = 1,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, linear(progress)));

  // We don't know the rendered child width at JSX construction time. Using a
  // 100%-stretched SVG with `preserveAspectRatio="none"` lets the stroke scale
  // to the wrapper, and we compute the dash visibility in percentage space.
  // The internal viewBox is a unit line from x=0 to x=100.
  const visiblePct = clampedProgress * 100;
  const midY = 50;
  const jitterY1 = seededNoise(seed, 1) * jitterAmplitude;
  const jitterY2 = seededNoise(seed, 2) * jitterAmplitude;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        // Subtle padding so the stroke doesn't get clipped at the text edges.
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      {children}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: `rotate(${tiltDegrees}deg)`,
          transformOrigin: "center",
          overflow: "visible",
        }}
      >
        <line
          x1={0}
          y1={midY + jitterY1}
          x2={visiblePct}
          y2={midY + jitterY2}
          stroke={color}
          strokeWidth={thicknessPx}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. <PenmarkUnderline> — wavy hand-drawn SVG underline
// ─────────────────────────────────────────────────────────────────────────────

export interface PenmarkUnderlineProps {
  progress: number; // 0..1 — line draws L→R
  color?: string; // default warm-red
  thicknessPx?: number; // default 4
  widthPx?: number; // total stroke length
  /** Amplitude of the wave (px). Default 5. */
  waveAmplitudePx?: number;
  /** Wavelength in px (default 60 — long, lazy wave). */
  waveLengthPx?: number;
  children: React.ReactNode;
  /** Offset of the underline from the baseline of the text (default 4px below). */
  offsetPx?: number;
}

/**
 * Hand-drawn wavy underline — DIYSmart 6nVW14npcO4 frame-03 ("US-only" emphasis).
 * The wave is a sampled sine path that we reveal via stroke-dashoffset, so the
 * "ink" appears to flow L→R. `outCubic` easing matches the marker-decelerates-
 * at-the-end gesture (the speaker slows the underline as the word lands).
 */
export const PenmarkUnderline: React.FC<PenmarkUnderlineProps> = ({
  progress,
  color = WARM_RED,
  thicknessPx = 4,
  widthPx,
  waveAmplitudePx = 5,
  waveLengthPx = 60,
  children,
  offsetPx = 4,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, outCubic(progress)));

  // Sample the wave path. If widthPx wasn't provided we fall back to a
  // sensible default and rely on the container's inline-block sizing.
  const resolvedWidth = widthPx ?? 240;
  const samples = Math.max(8, Math.round(resolvedWidth / 4));
  const padding = waveAmplitudePx + thicknessPx;
  const svgHeight = waveAmplitudePx * 2 + thicknessPx * 2;
  const centerY = svgHeight / 2;

  let pathD = "";
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * resolvedWidth;
    const y =
      centerY + Math.sin((x / waveLengthPx) * Math.PI * 2) * waveAmplitudePx;
    pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  // Approximate path length: each sine arc segment is ~waveLengthPx of
  // horizontal travel plus the wave perimeter; the total stroke length we
  // need for stroke-dasharray is slightly longer than the straight width.
  // Using width × 1.1 gives a stable upper bound for the dasharray budget
  // without computing arc lengths at render time.
  const approxLength = resolvedWidth * 1.1;
  const dashOffset = approxLength * (1 - clampedProgress);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        paddingBottom: offsetPx + svgHeight,
      }}
    >
      {children}
      <svg
        width={resolvedWidth + padding * 2}
        height={svgHeight}
        viewBox={`${-padding} 0 ${resolvedWidth + padding * 2} ${svgHeight}`}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={thicknessPx}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={approxLength}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. <HeadlineEmphasis> — single-word recolor inside headline (Carlos T5)
// ─────────────────────────────────────────────────────────────────────────────

export interface HeadlineEmphasisProps {
  /** Full headline text. */
  text: string;
  /** Word(s) to emphasize — exact match. Multiple words allowed. */
  emphasizeWords: string[];
  /** Color applied to the emphasized words. */
  emphasisColor: string;
  /** Color applied to non-emphasized words. */
  baseColor?: string;
  /** Italic the emphasized words? (Carlos serif-italic-as-voice pattern). Default false. */
  italicEmphasis?: boolean;
  /** Font family for emphasized words (if italicEmphasis = true, suggests serif). */
  emphasisFontFamily?: string;
  /** Base font weight. Default 900. */
  fontWeight?: number;
  fontSize?: number; // default 120
  fontFamily?: string; // default FONT_STACKS.sans
  letterSpacing?: string; // default -0.02em
  lineHeight?: number; // default 1.05
  align?: "left" | "center" | "right"; // default 'center'
  /** Optional progress 0..1 — fades in word-by-word so emphasis arrives last (Carlos cascade pattern). */
  revealProgress?: number;
}

// Strip leading/trailing punctuation so "moat." still matches "moat".
function stripPunct(word: string): string {
  return word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
}

/**
 * Headline with single-word color emphasis. Splits `text` on whitespace and
 * applies `emphasisColor` (and optionally italic + serif family) to words whose
 * normalized form matches `emphasizeWords`. Optionally cascades word reveal so
 * the emphasized word lands LAST — implementing the Carlos "deferred-payoff"
 * rhythm where the recolored word is also the syllable the audio lands on.
 */
export const HeadlineEmphasis: React.FC<HeadlineEmphasisProps> = ({
  text,
  emphasizeWords,
  emphasisColor,
  baseColor = "#0F1B2D",
  italicEmphasis = false,
  emphasisFontFamily,
  fontWeight = 900,
  fontSize = 120,
  fontFamily = FONT_STACKS.sans,
  letterSpacing = "-0.02em",
  lineHeight = 1.05,
  align = "center",
  revealProgress,
}) => {
  const words = text.split(/(\s+)/); // keep whitespace tokens for layout fidelity
  const emphasizeSet = new Set(emphasizeWords.map((w) => w.toLowerCase()));
  const resolvedEmphasisFamily =
    emphasisFontFamily ?? (italicEmphasis ? FONT_STACKS.serifItalic : fontFamily);

  // Count only the non-whitespace tokens for cascade math.
  const wordTokens = words.filter((t) => !/^\s+$/.test(t));
  const totalWords = wordTokens.length;

  // Cascade: each word fades in over a 25% slice, with the emphasized word
  // anchored to land at progress = 1.0 (last) regardless of its position.
  const computeWordAlpha = (wordIndex: number, isEmphasized: boolean): number => {
    if (revealProgress === undefined) return 1;
    const p = Math.max(0, Math.min(1, revealProgress));
    // Emphasized word always arrives at the very end of the cascade.
    const slot = isEmphasized ? totalWords - 1 : wordIndex;
    const start = slot / totalWords;
    const end = (slot + 1) / totalWords;
    if (p <= start) return 0;
    if (p >= end) return 1;
    return (p - start) / (end - start);
  };

  let wordCounter = 0;

  return (
    <div
      style={{
        fontFamily,
        fontWeight,
        fontSize,
        letterSpacing,
        lineHeight,
        color: baseColor,
        textAlign: align,
      }}
    >
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        const normalized = stripPunct(token).toLowerCase();
        const isEmphasized = emphasizeSet.has(normalized);
        const idx = wordCounter++;
        const alpha = computeWordAlpha(idx, isEmphasized);

        return (
          <span
            key={i}
            style={{
              color: isEmphasized ? emphasisColor : baseColor,
              fontStyle: isEmphasized && italicEmphasis ? "italic" : "normal",
              fontFamily: isEmphasized ? resolvedEmphasisFamily : fontFamily,
              opacity: alpha,
              display: "inline-block",
              transform:
                revealProgress === undefined
                  ? undefined
                  : `translateY(${(1 - alpha) * 8}px)`,
              transition: "none",
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. <AntiPatternX> — Carlos T21 red diagonal X over a container
// ─────────────────────────────────────────────────────────────────────────────

export interface AntiPatternXProps {
  width: number;
  height: number;
  progress: number; // 0..1 — strokes draw in sequence (first \ then /)
  color?: string; // default warm-red
  thicknessPx?: number; // default 8
}

/**
 * Carlos T21 — a red diagonal X drawn corner-to-corner over a content card,
 * marking the contained card as the anti-pattern in a "this vs that" pairing.
 * Strokes draw sequentially (\ first, then /) with `outCubic` easing so each
 * stroke decelerates as it arrives at the opposite corner.
 */
export const AntiPatternX: React.FC<AntiPatternXProps> = ({
  width,
  height,
  progress,
  color = WARM_RED,
  thicknessPx = 8,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));

  // Stroke 1 (top-left → bottom-right): progress 0 → 0.5
  const stroke1Raw = Math.max(0, Math.min(1, clamped / 0.5));
  const stroke1 = outCubic(stroke1Raw);

  // Stroke 2 (top-right → bottom-left): progress 0.5 → 1
  const stroke2Raw = Math.max(0, Math.min(1, (clamped - 0.5) / 0.5));
  const stroke2 = outCubic(stroke2Raw);

  // Endpoint interpolation for each line.
  const s1x2 = stroke1 * width;
  const s1y2 = stroke1 * height;
  const s2x2 = width - stroke2 * width;
  const s2y2 = stroke2 * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <line
        x1={0}
        y1={0}
        x2={s1x2}
        y2={s1y2}
        stroke={color}
        strokeWidth={thicknessPx}
        strokeLinecap="round"
        opacity={stroke1Raw > 0 ? 1 : 0}
      />
      <line
        x1={width}
        y1={0}
        x2={s2x2}
        y2={s2y2}
        stroke={color}
        strokeWidth={thicknessPx}
        strokeLinecap="round"
        opacity={stroke2Raw > 0 ? 1 : 0}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. <EmphasisPill> — Nate B Jones M10 consensus pattern
// ─────────────────────────────────────────────────────────────────────────────
//
// Wave-6 consensus from natebjones, frequency 5+ instances:
// "bordered rounded pill at bottom of fullscreen card containing a full
//  sentence with ONE word colored orange". Reference frames:
//   references/creators/natebjones/FtCdYhspm7w/frames/vote1-anim-03-frame-006.jpg
//
// Differs from <HeadlineEmphasis> (Carlos T5) in three ways:
//   1. Renders the surrounding pill chrome (border + radius + padding), not
//      just the recolored text.
//   2. Reads `useCurrentFrame()` itself — driven by Remotion frame context,
//      not by a parent-supplied progress prop. Aligns with the "drop it in
//      and it animates" Wave-6 contract.
//   3. Default accent is Nate's signature orange-amber (#F2A555), not
//      Carlos's warm-red.

// Nate's signature accent — orange-amber emphasis color.
const NATE_ORANGE = "#F2A555";

export interface EmphasisPillProps {
  /** Full sentence body. */
  text: string;
  /** Word(s) to emphasize with the accent color — exact match, may be multiple. */
  emphasisWords: string[];
  /** Accent color for emphasized words (default orange-amber #F2A555 — Nate's signature). */
  emphasisColor?: string;
  /** Base text color (default white). */
  baseColor?: string;
  /** Pill background. Default transparent. */
  background?: string;
  /** Pill border (default 1px white at 30% opacity). */
  borderColor?: string;
  borderWidthPx?: number;
  /** Border radius (default 999 = full pill). */
  borderRadius?: number;
  /** Font size. Default 36. */
  fontSize?: number;
  /** Font weight. Default 700. */
  fontWeight?: number;
  /** Padding. Default 16px vertical / 32px horizontal. */
  paddingX?: number;
  paddingY?: number;
  /** Max width — pill wraps inside this. Default 1200 (16:9-friendly). */
  maxWidthPx?: number;
  /** Letter-spacing. Default 0. */
  letterSpacing?: string;
  /** Center the pill horizontally. Default true. */
  center?: boolean;
  /** Entry frame for fade-in. Default 0. */
  enterFrame?: number;
  /** Fade-in duration (frames). Default 8. */
  fadeInFrames?: number;
  /** Hold frames (excluding fades). Default Infinity (held until end). */
  visibleFrames?: number;
  /** Fade-out frames. Default 0 (no exit). */
  fadeOutFrames?: number;
  /** Whether emphasis words should also be italic. Default false (Nate uses just color, not italic). */
  italicEmphasis?: boolean;
  /** Font family. Default FONT_STACKS.sans. */
  fontFamily?: string;
  /** Optional drop shadow (for legibility on busy backgrounds). Default false. */
  shadow?: boolean;
}

/**
 * Nate B Jones M10 — Emphasis pill: bordered rounded container at the bottom
 * of a fullscreen card holding a full sentence with one (or several) accented
 * words. The component owns its own opacity animation by reading
 * `useCurrentFrame()` so callers can drop it into a composition without
 * threading a progress prop.
 *
 * Transition verb (Wave-5 contract):
 *   "Emphasis pill fades in over 8 frames; sentence body stays muted with the
 *    emphasized word(s) in accent color, optionally italic; holds for
 *    visibleFrames; optionally fades out over fadeOutFrames."
 *
 * Word matching is punctuation-tolerant — trailing `.`, `,`, `!`, `?` on a
 * word do not block the emphasis lookup. Matching is case-insensitive.
 */
export const EmphasisPill: React.FC<EmphasisPillProps> = ({
  text,
  emphasisWords,
  emphasisColor = NATE_ORANGE,
  baseColor = "#FFFFFF",
  background = "transparent",
  borderColor = "rgba(255, 255, 255, 0.3)",
  borderWidthPx = 1,
  borderRadius = 999,
  fontSize = 36,
  fontWeight = 700,
  paddingX = 32,
  paddingY = 16,
  maxWidthPx = 1200,
  letterSpacing = "0",
  center = true,
  enterFrame = 0,
  fadeInFrames = 8,
  visibleFrames = Infinity,
  fadeOutFrames = 0,
  italicEmphasis = false,
  fontFamily = FONT_STACKS.sans,
  shadow = false,
}) => {
  const frame = useCurrentFrame();

  // Compute opacity envelope: fade in → hold → fade out.
  const localFrame = frame - enterFrame;
  let opacity: number;
  if (localFrame < 0) {
    opacity = 0;
  } else if (localFrame < fadeInFrames) {
    opacity = fadeInFrames > 0 ? localFrame / fadeInFrames : 1;
  } else {
    const holdEnd = fadeInFrames + visibleFrames;
    if (localFrame < holdEnd) {
      opacity = 1;
    } else if (fadeOutFrames > 0 && localFrame < holdEnd + fadeOutFrames) {
      const t = (localFrame - holdEnd) / fadeOutFrames;
      opacity = 1 - Math.max(0, Math.min(1, t));
    } else if (fadeOutFrames > 0) {
      opacity = 0;
    } else {
      opacity = 1;
    }
  }

  // Strip trailing punctuation only — keep leading characters (handles
  // contractions like "you're." → "you're"). Conservative set requested by
  // the brief: `.`, `,`, `!`, `?`.
  const stripTrailing = (word: string): string =>
    word.replace(/[.,!?]+$/g, "");

  const emphasizeSet = new Set(emphasisWords.map((w) => w.toLowerCase()));
  const tokens = text.split(/(\s+)/); // preserve whitespace tokens

  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    maxWidth: maxWidthPx,
    paddingTop: paddingY,
    paddingBottom: paddingY,
    paddingLeft: paddingX,
    paddingRight: paddingX,
    background,
    border: `${borderWidthPx}px solid ${borderColor}`,
    borderRadius,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    color: baseColor,
    opacity,
    textAlign: "center",
    lineHeight: 1.3,
    boxShadow: shadow ? "0 4px 24px rgba(0, 0, 0, 0.45)" : undefined,
  };

  const wrapperStyle: React.CSSProperties = center
    ? {
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }
    : {
        display: "block",
        width: "100%",
      };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <span>
          {tokens.map((token, i) => {
            if (/^\s+$/.test(token)) {
              return <span key={i}>{token}</span>;
            }
            const normalized = stripTrailing(token).toLowerCase();
            const isEmphasized = emphasizeSet.has(normalized);
            return (
              <span
                key={i}
                style={{
                  color: isEmphasized ? emphasisColor : baseColor,
                  fontStyle:
                    isEmphasized && italicEmphasis ? "italic" : "normal",
                }}
              >
                {token}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};
