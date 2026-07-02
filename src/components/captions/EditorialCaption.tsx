/**
 * EditorialCaption — paginated word-by-word captions for the cream-paper / ink / warm-red
 * editorial style. Used by TechNewsFlash9x16, QuoteCard9x16, BigNumberHero9x16, etc.
 *
 * Pagination via `nonOverlappingGroups` from src/timing/align.ts — chunks aligned words
 * into fixed-size windows (default 6 words) with non-overlapping time boundaries.
 *
 * Architecture note: this component does NOT wrap each group in `<Sequence>`. Sequences
 * reset useCurrentFrame() to 0 inside them, which clashes with our active-word check that
 * uses ABSOLUTE w.startFrame. We render at the composition's top frame, find the active
 * group via a simple range scan, and render that single group. Cheaper too — one DOM tree
 * per frame instead of N.
 *
 * Bug fixes from W21:
 *  - Bug 1 (caption-group overlap): nonOverlappingGroups guarantees zero overlap;
 *    next-group start clamps current-group end.
 *  - Bug 2 (highlight phasing): per-word timing comes from `alignScriptToWhisper()`
 *    (script text + whisper-accurate timing), passed in as `wordTimings`.
 *
 * Bilawal R4C validation (2026-05-28): editorial register uses hard pops, not fades —
 * see references/creators/bilawal.ai/ANALYSIS.md "Wave-7 Batch 3 Extension" §
 * "Convergence with EditorialCaption / ChunkedPhraseCaption". Across 20 reels Bilawal's
 * chunks snap in/out with zero crossfade; large + briefly-on-screen text reads better
 * without a fade ramp. Consequence: `register='editorial'` now defaults `transition`
 * to `'pop'` (no fade-in) when the caller does not pass `transition` explicitly. All
 * other registers and any explicit `transition` value preserve prior 4-frame fade-in
 * behavior 1:1.
 */
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { WordTiming } from "../../compositions/schemas";
import { nonOverlappingGroups, type CaptionGroup } from "../../timing/align";

/**
 * Caption "register" — cross-creator W7 taxonomy (Sahil Bloom ANALYSIS.md):
 *  - 'punchy'    (Hormozi)   : active = yellow #F1C232, past = white,         future = white@0.30
 *  - 'editorial' (Sahil)     : active = cyan   #5BC0E8, past = white,         future = white@0.40
 *  - 'technical' (Adam)      : active = white,          past = white,         future = white@0.55
 *  - 'karaoke'   (natebjones/mreflow/builtbystephan) : ALL words solid white EXCEPT the
 *                              current word which is bright green #2ECC71. No dimming of
 *                              future words — classic karaoke read on a dark background.
 *  - 'custom'                : opt out — keep whatever the user passed in style props (existing behavior)
 *
 * When `register` is set to a preset, the palette is applied to internal active /
 * past / future colors ONLY IF the user has not explicitly provided the matching
 * style color props (accentColor / inkColor). When `register` is undefined or
 * 'custom', existing behavior is preserved 1:1.
 */
export type CaptionRegister =
  | "punchy"
  | "editorial"
  | "technical"
  | "karaoke"
  | "custom";

/**
 * Caption transition verb between paginated groups:
 *  - 'pop'  : hard cut — group appears at opacity 1 on its first frame, no ramp.
 *  - 'fade' : 4-frame opacity ramp from 0 → 1 on group entry (legacy default).
 *
 * Resolution order:
 *  1. If the caller passes `transition` explicitly, that value wins.
 *  2. Else if `register === 'editorial'`, default is `'pop'` (Bilawal R4C finding).
 *  3. Else default is `'fade'` (legacy behavior — all existing call sites land here).
 */
export type CaptionTransition = "pop" | "fade";

/**
 * Pullout-chip overlay — Nate B Jones C7 (`KaraokeWithBlueChipPullout9x16`).
 * A blue rounded-pill keyword chip slides into the lower-third from the right
 * (or left) edge IN ADDITION to the karaoke baseline. Used 3/3 of his new Shorts
 * in Wave-7 Batch 3. See `references/creators/natebjones/ANALYSIS.md` §2 C7.
 *
 * When `enterFrame` is omitted, the chip auto-syncs to the karaoke stream: it
 * enters at the start frame of the first wordTimings entry whose text contains
 * `keyword` (case-insensitive, punctuation-stripped substring match). If no
 * match is found, it falls back to `enterFrame = 0` (chip rides the whole
 * composition). This keeps the prop ergonomic for the common case where the
 * caller just types the keyword they want highlighted.
 */
export interface CaptionPulloutChip {
  /** The keyword text rendered inside the blue chip. */
  keyword: string;
  /** Background color of the chip. Default '#3FB8FF' (Nate blue). */
  color?: string;
  /** Text color inside chip. Default '#000'. */
  textColor?: string;
  /** Slide-in direction. Default 'right' (slides from right edge in). */
  slideDirection?: "left" | "right";
  /**
   * Frame at which the chip enters. When omitted, auto-syncs to the karaoke
   * stream (start frame of the first matching keyword). Falls back to 0 if no
   * matching word is found in `wordTimings`.
   */
  enterFrame?: number;
  /**
   * Frames the chip stays visible after entering. When omitted the chip stays
   * visible until the end of the composition.
   */
  visibleFrames?: number;
}

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
  // Karaoke: every word solid white, current word bright green. No future-word
  // dimming (futureColor is also solid white) — the read is "all white, one green".
  karaoke: {
    activeColor: "#2ECC71",
    pastColor: "#FFFFFF",
    futureColor: "#FFFFFF",
  },
};

export interface EditorialCaptionStyle {
  position?: "bottom" | "center" | "top";
  distancePx?: number;
  fontSize?: number;
  paperColor?: string;
  inkColor?: string;
  accentColor?: string;
  mutedBorderColor?: string;
  maxWidthPx?: number;
  /** Words per caption window. Default 6 (TikTok pacing). */
  windowSize?: number;
  /** Minimum gap (ms) between consecutive caption windows. Default 60ms. */
  windowGapMs?: number;
  /** Trailing hold (ms) past the last word in a group. Default 0 (group hides immediately when last word ends). */
  trailingHoldMs?: number;
  /**
   * Caption "register" — sets active/past/future color palette to one of four modes:
   *  - 'punchy' (Hormozi style)    : active = yellow #F1C232, past = white, future = white@0.30
   *  - 'editorial' (Sahil style)   : active = cyan   #5BC0E8, past = white, future = white@0.40
   *  - 'technical' (Adam style)    : active = white,          past = white, future = white@0.55
   *  - 'karaoke' (Nate/mreflow)    : active = green  #2ECC71, past = white, future = white (no dim)
   *  - 'custom' (or undefined)     : keep existing color props as-is (back-compat)
   *
   * When a preset is set, falls through to existing `accentColor` / `inkColor`
   * props ONLY if the caller explicitly provided them — otherwise the register
   * palette wins. This keeps existing call sites unchanged while letting new
   * call sites bind to a content-mode palette directly.
   */
  register?: CaptionRegister;
  /**
   * How the active group enters the screen. When unset, defaults to `'pop'` for
   * `register === 'editorial'` (per Bilawal R4C: hard pops, not crossfades) and
   * `'fade'` for every other register — which matches the prior 4-frame fade-in
   * for all existing call sites that don't pass `register` or `transition`.
   * Explicit values always win and preserve back-compat.
   */
  transition?: CaptionTransition;
  /**
   * Letter-casing applied to every caption word. 'none' (default) renders the
   * text verbatim — byte-identical to prior behavior. 'uppercase' forces caps,
   * the karaoke convention used by natebjones / mreflow / builtbystephan.
   */
  textTransform?: "none" | "uppercase";
  /**
   * When true, drops the paper card chassis (background, border, left accent
   * rule, padding, box-shadow) so the words float directly over the scene with
   * just a text stroke for legibility. Default false preserves the boxed card 1:1.
   */
  boxless?: boolean;
  /**
   * Gates the hardcoded left accent rule (the 4px colored `borderLeft`). Default
   * true preserves the existing accent bar. Set false to drop it (e.g. floating
   * karaoke). When `boxless` is true the bar is dropped regardless of this flag.
   */
  showAccentBar?: boolean;
}

interface EditorialCaptionProps {
  wordTimings: WordTiming[];
  style?: EditorialCaptionStyle;
  /**
   * Optional Nate-style blue keyword chip slid into the lower-third alongside
   * the karaoke captions. When undefined, render is byte-identical to prior
   * behavior — every existing call site lands here. See `CaptionPulloutChip`
   * for the schema and `references/creators/natebjones/ANALYSIS.md` §2 C7 for
   * the design citation.
   */
  pulloutChip?: CaptionPulloutChip;
}

type ResolvedEditorialCaptionStyle = Required<
  Omit<EditorialCaptionStyle, "register" | "transition">
> & {
  register: CaptionRegister;
};

const DEFAULT_STYLE: ResolvedEditorialCaptionStyle = {
  position: "bottom",
  distancePx: 240,
  fontSize: 48,
  paperColor: "#FAF7F2",
  inkColor: "#1A1A1A",
  accentColor: "#B33A2A",
  mutedBorderColor: "rgba(107, 103, 96, 0.2)",
  maxWidthPx: 960,
  windowSize: 6,
  windowGapMs: 60,
  trailingHoldMs: 0,
  register: "custom",
  textTransform: "none",
  boxless: false,
  showAccentBar: true,
};

function getPositionStyle(
  position: NonNullable<EditorialCaptionStyle["position"]>,
  distancePx: number,
): React.CSSProperties {
  if (position === "top") return { top: distancePx };
  if (position === "center") return { top: "50%", transform: "translateY(-50%)" };
  return { bottom: distancePx };
}

export const EditorialCaption: React.FC<EditorialCaptionProps> = ({
  wordTimings,
  style: userStyle,
  pulloutChip,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const style: ResolvedEditorialCaptionStyle = { ...DEFAULT_STYLE, ...userStyle };

  // Transition resolution. Explicit value from caller always wins (back-compat
  // for any caller already passing it). Otherwise: editorial register pops
  // (Bilawal R4C), every other register fades (legacy 4-frame ramp — what every
  // current call site renders today, since none of them pass `transition`).
  const resolvedTransition: CaptionTransition =
    userStyle?.transition !== undefined
      ? userStyle.transition
      : style.register === "editorial"
        ? "pop"
        : "fade";

  // Register palette resolution. If a preset register is set AND the caller did
  // not explicitly provide that color slot, the preset wins. This keeps every
  // existing call site type-checking and rendering exactly as before (because
  // they don't pass `register`, so it stays "custom" and this block is a no-op).
  const registerPalette: RegisterPalette | null =
    style.register !== "custom" ? REGISTER_PALETTES[style.register] : null;
  const activeColor =
    userStyle?.accentColor !== undefined
      ? style.accentColor
      : (registerPalette?.activeColor ?? style.accentColor);
  const pastColor =
    userStyle?.inkColor !== undefined
      ? style.inkColor
      : (registerPalette?.pastColor ?? style.inkColor);
  // Karaoke is "all words solid, one accent" — future words are NOT dimmed, even
  // when the caller passes an explicit inkColor (which for every other register
  // would derive a 40%-alpha future shade). For all other registers the prior
  // resolution is preserved 1:1: explicit inkColor → `${inkColor}66`, else the
  // register's futureColor, else the dimmed default ink.
  const futureColor =
    style.register === "karaoke"
      ? userStyle?.inkColor !== undefined
        ? style.inkColor
        : (registerPalette?.futureColor ?? style.inkColor)
      : userStyle?.inkColor !== undefined
        ? `${style.inkColor}66`
        : (registerPalette?.futureColor ?? `${style.inkColor}66`);

  // Pre-compute groups once per props change. nonOverlappingGroups uses absolute frame
  // coordinates (computed from startSeconds*fps), so we compare directly against `frame`.
  const groups = useMemo<CaptionGroup[]>(
    () =>
      wordTimings.length === 0
        ? []
        : nonOverlappingGroups(
            wordTimings,
            style.windowSize,
            style.windowGapMs,
            style.trailingHoldMs,
            fps,
          ),
    [wordTimings, fps, style.windowSize, style.windowGapMs, style.trailingHoldMs],
  );

  // Resolve the pullout chip's effective enter frame BEFORE the early-return
  // gates so that the chip can render even if no active karaoke group covers
  // the current frame (e.g. trailing silence after the last caption window).
  // Auto-sync: when `enterFrame` is omitted, scan wordTimings for the first
  // word whose text (lowercased, stripped of non-alphanumerics) contains the
  // keyword similarly normalized. Falls back to 0 when no match is found —
  // documented trade-off: caller can always pass `enterFrame` explicitly.
  const chipEnterFrame: number = pulloutChip
    ? pulloutChip.enterFrame !== undefined
      ? pulloutChip.enterFrame
      : (() => {
          const needle = pulloutChip.keyword
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");
          if (needle.length === 0) return 0;
          const match = wordTimings.find((w) =>
            w.text.toLowerCase().replace(/[^a-z0-9]+/g, "").includes(needle),
          );
          return match ? match.startFrame : 0;
        })()
    : 0;

  if (groups.length === 0) return null;

  // Find the active group for this frame.
  const active = groups.find(
    (g) => frame >= g.startFrame && frame < g.endFrame,
  );
  if (!active) return null;

  // Group-entry opacity. 'fade' = 4-frame ramp from 0 → 1 (legacy default for every
  // non-editorial register and for editorial when the caller passes transition='fade'
  // explicitly). 'pop' = constant 1 — hard cut on entry, per Bilawal R4C for editorial.
  // No fade-out either way (next group hard-cuts the current one).
  const fadeIn =
    resolvedTransition === "pop"
      ? 1
      : interpolate(
          frame - active.startFrame,
          [0, 4],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  // Pullout-chip animation. 8-frame slide-in from beyond the screen edge
  // (translateX 100% on the off-screen axis → 0). Opacity ramps the same 8
  // frames so the chip doesn't pop into existence at the edge. When
  // `visibleFrames` is set, after (enterFrame + visibleFrames) the chip
  // disappears (no slide-out — the C7 reference reads as a hard exit and we
  // avoid extra animation logic that the prop schema doesn't expose).
  const chipVisible: boolean = (() => {
    if (!pulloutChip) return false;
    if (frame < chipEnterFrame) return false;
    if (
      pulloutChip.visibleFrames !== undefined &&
      frame >= chipEnterFrame + pulloutChip.visibleFrames
    )
      return false;
    return true;
  })();

  const chipSlideDirection: "left" | "right" =
    pulloutChip?.slideDirection ?? "right";
  const chipColor: string = pulloutChip?.color ?? "#3FB8FF";
  const chipTextColor: string = pulloutChip?.textColor ?? "#000";

  // translateX progress: 1 (fully off-screen) → 0 (fully in place) over 8
  // frames after enterFrame. For 'right' the chip starts at +100% (past the
  // right edge) and slides to 0; for 'left' it starts at -100%.
  const chipSlideProgress: number = pulloutChip
    ? interpolate(
        frame - chipEnterFrame,
        [0, 8],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;
  const chipTranslatePct: number =
    chipSlideDirection === "right" ? chipSlideProgress * 100 : -chipSlideProgress * 100;
  const chipOpacity: number = pulloutChip
    ? interpolate(
        frame - chipEnterFrame,
        [0, 8],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  return (
    <>
      <AbsoluteFill style={{ opacity: fadeIn, pointerEvents: "none" }}>
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
              // boxless drops the entire card chassis (bg / borders / accent rule /
              // padding / shadow) so words float over the scene. Default (false)
              // renders the paper card 1:1 with prior behavior. The left accent
              // rule is additionally gated by showAccentBar.
              background: style.boxless ? "transparent" : style.paperColor,
              border: style.boxless
                ? "none"
                : `1px solid ${style.mutedBorderColor}`,
              borderLeft:
                style.boxless || !style.showAccentBar
                  ? undefined
                  : `4px solid ${style.accentColor}`,
              padding: style.boxless ? "0" : "20px 28px",
              maxWidth: style.maxWidthPx,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              // Boxless (karaoke) uses large text + a scale(1.06) active word, so a
              // fixed 12px gap lets the scaled word visually merge with neighbors
              // ("CLAUDEIS"). Widen the horizontal gap proportional to font size in
              // boxless mode only; boxed mode stays byte-identical at "6px 12px".
              gap: style.boxless
                ? `8px ${Math.max(16, Math.round(style.fontSize * 0.3))}px`
                : "6px 12px",
              boxShadow: style.boxless ? "none" : "0 4px 16px rgba(26, 26, 26, 0.06)",
            }}
          >
            {active.words.map((w, i) => {
              const isActive = frame >= w.startFrame && frame <= w.endFrame;
              const isPast = frame > w.endFrame;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: style.fontSize,
                    fontWeight: 700,
                    letterSpacing: "-0.005em",
                    lineHeight: 1.15,
                    textTransform: style.textTransform,
                    color: isActive
                      ? activeColor
                      : isPast
                        ? pastColor
                        : futureColor,
                    // Without the paper card behind the text, add a stroke so the
                    // words stay legible over arbitrary scene content. Boxed mode
                    // (default) keeps no stroke — byte-identical to prior render.
                    ...(style.boxless
                      ? {
                          WebkitTextStroke: "2px rgba(0,0,0,0.85)",
                          paintOrder: "stroke fill",
                          textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                        }
                      : null),
                    transform: isActive ? "scale(1.06)" : "scale(1)",
                    display: "inline-block",
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      {pulloutChip && chipVisible ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              // Lower-third placement: ~33% from bottom of the frame, offset
              // toward the slide-in edge so the chip sits in its "natural"
              // resting spot after sliding in. C7 reference: right-of-center.
              bottom: "33%",
              right: chipSlideDirection === "right" ? "8%" : undefined,
              left: chipSlideDirection === "left" ? "8%" : undefined,
              transform: `translateX(${chipTranslatePct}%)`,
              opacity: chipOpacity,
            }}
          >
            <div
              style={{
                background: chipColor,
                color: chipTextColor,
                borderRadius: 999,
                padding: "8px 20px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 28,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {pulloutChip.keyword}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};
