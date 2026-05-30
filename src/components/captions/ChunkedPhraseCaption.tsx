/**
 * ChunkedPhraseCaption — Bilawal / Simon style burned captions.
 *
 * Wave-4 cross-creator HIGH-confidence finding:
 *   - Bilawal V4 #5: "Step-function pop on the syllable hit. No fade. Instant on,
 *     instant off. The rigidity of the timing IS the polish."
 *   - Bilawal V3 N9: "ChunkedPhraseCaption shared across templates not just one."
 *   - Carlos V3 chrome D: "TikTok-stroke caption variant for busy backgrounds."
 *
 * Difference vs EditorialCaption:
 *   - 2-4 word window (not 6)
 *   - NO background pill
 *   - Drop-shadow / TikTok stroke for legibility against busy backgrounds
 *   - Step-function reveal — no per-word fade-in, the whole window pops at once
 *
 * Use this on busy backgrounds (B-roll, screen-rec, dashboard). Use EditorialCaption
 * on calm backgrounds (cream paper, dark editorial).
 */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "../../compositions/schemas";
import { nonOverlappingGroups, type CaptionGroup } from "../../timing/align";

export type ChunkedCaptionStyle = "drop-shadow" | "tiktok-stroke";

/**
 * Caption "register" — cross-creator W7 taxonomy (Sahil Bloom ANALYSIS.md):
 *  - 'punchy'    (Hormozi)   : active = yellow #F1C232, past = white,         future = white@0.30
 *  - 'editorial' (Sahil)     : active = cyan   #5BC0E8, past = white,         future = white@0.40
 *  - 'technical' (Adam)      : active = white,          past = white,         future = white@0.55
 *  - 'custom'                : opt out — keep whatever the user passed in style props (existing behavior)
 *
 * Since chunked captions are step-function (the whole window is "active" at
 * once — no per-word past/future state inside a chunk), the register's
 * activeColor is the one that ships as `textColor` unless the caller has
 * explicitly set `textColor`. The past / future slots are still exported on
 * the palette type so call sites can reason about them uniformly with
 * EditorialCaption, but they don't render inside a single chunk.
 */
export type CaptionRegister = "punchy" | "editorial" | "technical" | "custom";

interface RegisterPalette {
  activeColor: string;
  pastColor: string;
  futureColor: string;
}

const REGISTER_PALETTES: Record<Exclude<CaptionRegister, "custom">, RegisterPalette> = {
  punchy: {
    activeColor: "#F1C232",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.30)",
  },
  editorial: {
    activeColor: "#5BC0E8",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.40)",
  },
  technical: {
    activeColor: "#FFFFFF",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.55)",
  },
};

export interface ChunkedPhraseCaptionStyle {
  position?: "bottom" | "center" | "top";
  distancePx?: number;
  fontSize?: number;
  textColor?: string;
  /** "drop-shadow" (Bilawal — black shadow under white type) or "tiktok-stroke" (Carlos — black stroke around white type). */
  style?: ChunkedCaptionStyle;
  /** Stroke width when `style === "tiktok-stroke"`. Default 4px. */
  strokeWidthPx?: number;
  /** Words per chunk window (Bilawal = 2–4, default 3). */
  windowSize?: number;
  /** Min gap between consecutive chunks. Default 30ms. */
  windowGapMs?: number;
  /** Trailing hold past last word (ms). Default 0 — chunks clear immediately. */
  trailingHoldMs?: number;
  maxWidthPx?: number;
  /** Optional uppercase transform (Bilawal / Simon signature). Default true. */
  uppercase?: boolean;
  letterSpacing?: string;
  /**
   * Caption "register" — sets active/past/future color palette to one of three modes:
   *  - 'punchy' (Hormozi style)    : active = yellow #F1C232, past = white, future = white@0.30
   *  - 'editorial' (Sahil style)   : active = cyan   #5BC0E8, past = white, future = white@0.40
   *  - 'technical' (Adam style)    : active = white,          past = white, future = white@0.55
   *  - 'custom' (or undefined)     : keep existing color props as-is (back-compat)
   *
   * When a preset is set, the palette's activeColor wins for `textColor` ONLY
   * if the caller did not explicitly pass `textColor`. Existing call sites that
   * don't pass `register` continue to render exactly as before.
   */
  register?: CaptionRegister;
}

interface ChunkedPhraseCaptionProps {
  wordTimings: WordTiming[];
  style?: ChunkedPhraseCaptionStyle;
}

const DEFAULT_STYLE: Required<Omit<ChunkedPhraseCaptionStyle, "register">> & {
  register: CaptionRegister;
} = {
  position: "bottom",
  distancePx: 380,
  fontSize: 64,
  textColor: "#FFFFFF",
  style: "drop-shadow",
  strokeWidthPx: 4,
  windowSize: 3,
  windowGapMs: 30,
  trailingHoldMs: 0,
  maxWidthPx: 980,
  uppercase: true,
  letterSpacing: "0.02em",
  register: "custom",
};

function getPositionStyle(
  position: NonNullable<ChunkedPhraseCaptionStyle["position"]>,
  distancePx: number,
): React.CSSProperties {
  if (position === "top") return { top: distancePx };
  if (position === "center") return { top: "50%", transform: "translateY(-50%)" };
  return { bottom: distancePx };
}

export const ChunkedPhraseCaption: React.FC<ChunkedPhraseCaptionProps> = ({
  wordTimings,
  style: userStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style: Required<Omit<ChunkedPhraseCaptionStyle, "register">> & {
    register: CaptionRegister;
  } = { ...DEFAULT_STYLE, ...userStyle };

  // Register palette resolution. If a preset register is set AND the caller did
  // not explicitly provide `textColor`, the preset's activeColor wins. Existing
  // call sites that don't pass `register` keep their current textColor exactly.
  const registerPalette: RegisterPalette | null =
    style.register !== "custom" ? REGISTER_PALETTES[style.register] : null;
  const resolvedTextColor =
    userStyle?.textColor !== undefined
      ? style.textColor
      : (registerPalette?.activeColor ?? style.textColor);

  const groups = useMemo<CaptionGroup[]>(
    () =>
      wordTimings.length === 0
        ? []
        : nonOverlappingGroups(
            wordTimings as unknown as Parameters<typeof nonOverlappingGroups>[0],
            style.windowSize,
            style.windowGapMs,
            style.trailingHoldMs,
            fps,
          ),
    [wordTimings, fps, style.windowSize, style.windowGapMs, style.trailingHoldMs],
  );

  if (groups.length === 0) return null;

  const active = groups.find((g) => frame >= g.startFrame && frame < g.endFrame);
  if (!active) return null;

  // STEP-FUNCTION: no fade-in, no fade-out. The whole chunk pops at once.
  // (Bilawal V4 #5 — "An eased caption says 'I am a video maker.' A stepped caption says 'I am the source.'")
  const text = active.words
    .map((w) => w.text)
    .join(" ");

  const renderedText = style.uppercase ? text.toUpperCase() : text;

  // Text rendering style:
  //  - drop-shadow: tight black shadow stack under white type (Bilawal)
  //  - tiktok-stroke: black stroke around white type (Carlos's busy-bg variant)
  const textShadow =
    style.style === "tiktok-stroke"
      ? `${style.strokeWidthPx}px 0 #000, -${style.strokeWidthPx}px 0 #000, 0 ${style.strokeWidthPx}px #000, 0 -${style.strokeWidthPx}px #000, ${style.strokeWidthPx}px ${style.strokeWidthPx}px #000, -${style.strokeWidthPx}px -${style.strokeWidthPx}px #000, ${style.strokeWidthPx}px -${style.strokeWidthPx}px #000, -${style.strokeWidthPx}px ${style.strokeWidthPx}px #000`
      : "2px 2px 0 rgba(0,0,0,0.6), 0 0 14px rgba(0,0,0,0.55)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...getPositionStyle(style.position, style.distancePx),
        }}
      >
        <div
          style={{
            maxWidth: style.maxWidthPx,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: style.fontSize,
            fontWeight: 900,
            letterSpacing: style.letterSpacing,
            lineHeight: 1.0,
            color: resolvedTextColor,
            textShadow,
            padding: "0 36px",
          }}
        >
          {renderedText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
