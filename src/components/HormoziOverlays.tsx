/**
 * HormoziOverlays — typography-overlay molecules derived from Alex Hormozi's
 * Instagram Shorts corpus (`references/creators/alexhormozi/ANALYSIS.md`).
 *
 * Critical finding (ANALYSIS §5): Hormozi has ZERO procedural motion graphics
 * in his Shorts. ALL the density sits in TYPOGRAPHY OVERLAYS layered on top of
 * a B-roll talking head. The five molecules below extract those patterns so
 * any composition can drop them in without re-inventing the layout.
 *
 * Reference frames:
 *   - sXV44nHGfAA/frames/frame-04 → PersistentHookPill (top-of-frame pill)
 *   - sXV44nHGfAA/frames/frame-10 → ChapterCardPill   (mid-frame card)
 *   - JZOMOId-Ip0/frames/frame-15 → ChapterCardDoubleLine ("2# Prescribe \"the best\"")
 *   - z2P1l9WCwQ8/frames/frame-01 → HookEmojiStrip   (📈❌🍀 over the hook)
 *
 * Motion contract:
 *   - PersistentHookPill   — NO entrance by default (Hormozi convention: hook is
 *                            present from frame 0). Optional opacity fade-in.
 *   - ChapterCardPill      — crossfade in/out (no scale/slide; Hormozi cards just
 *                            swap with the spoken beat).
 *   - ChapterCardDoubleLine— text-only with drop-shadow; opacity crossfade.
 *   - OpeningTitleCard     — full-frame attention grab; PUNCHY_SPRING scale-pop
 *                            on the hero word (1.0 → 1.04 → 1.0 settle).
 *   - HookEmojiStrip       — per-emoji scale-pop via PUNCHY_SPRING + accelerating
 *                            stagger from `src/animation/staggeredCascade`.
 *
 * All five are pure React FCs that read `useCurrentFrame()` / `useVideoConfig()`
 * internally, so the caller mounts them at any depth (top-level AbsoluteFill or
 * inside a <Sequence> — Remotion handles relative time inside Sequences).
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS } from "../brand";
import { staggerEntry } from "../animation";
import { PUNCHY_SPRING } from "../compositions/scenes";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crossfade opacity envelope shared by ChapterCardPill / ChapterCardDoubleLine.
 *
 *    enterFrame → enterFrame+fadeIn  : opacity 0 → 1
 *    enterFrame+fadeIn → ...+visible : opacity = 1 (held)
 *    ...+visible → ...+visible+fadeOut: opacity 1 → 0
 *
 * If `visibleFrames` is undefined the card holds forever after the fade-in
 * completes (useful for "stays until next chapter swaps it" patterns).
 */
function crossfadeOpacity(
  frame: number,
  enterFrame: number,
  fadeInFrames: number,
  visibleFrames: number | undefined,
  fadeOutFrames: number,
): number {
  // Before entry — invisible.
  if (frame < enterFrame) return 0;

  const relative = frame - enterFrame;

  // Fade-in window.
  if (relative < fadeInFrames) {
    return interpolate(relative, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // No fade-out scheduled — hold at 1 forever.
  if (visibleFrames === undefined || fadeOutFrames <= 0) {
    return 1;
  }

  const visibleEnd = fadeInFrames + visibleFrames;
  if (relative < visibleEnd) return 1;

  // Fade-out window.
  return interpolate(
    relative,
    [visibleEnd, visibleEnd + fadeOutFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. <PersistentHookPill>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PersistentHookPill — white rounded pill at the top (or bottom) of frame that
 * carries the video's hook for the ENTIRE duration. By Hormozi convention this
 * has no entrance animation; it's there from frame 0 so first-frame thumb-stop
 * viewers see the promise immediately.
 */
export interface PersistentHookPillProps {
  /** Hook text (bold black sans). */
  text: string;
  /** Position. Default 'top'. */
  position?: "top" | "bottom";
  /** Distance from edge in px. Default 180. */
  edgePx?: number;
  /** Pill background. Default '#FFFFFF'. */
  background?: string;
  /** Text color. Default '#0A0A0A'. */
  color?: string;
  /** Border-radius. Default 9999 (full pill). */
  borderRadius?: number;
  /** Max width. Default 920. */
  maxWidthPx?: number;
  /** Font size. Default 56. */
  fontSize?: number;
  /** Font weight. Default 900. */
  fontWeight?: number;
  /** Optional fade-in (frames). Default 0 (appears immediately — Hormozi pattern). */
  fadeInFrames?: number;
  /** Pill horizontal padding. Default 36. */
  paddingX?: number;
  paddingY?: number;
}

export const PersistentHookPill: React.FC<PersistentHookPillProps> = ({
  text,
  position = "top",
  edgePx = 180,
  background = "#FFFFFF",
  color = "#0A0A0A",
  borderRadius = 9999,
  maxWidthPx = 920,
  fontSize = 56,
  fontWeight = 900,
  fadeInFrames = 0,
  paddingX = 36,
  paddingY = 22,
}) => {
  const frame = useCurrentFrame();

  const opacity =
    fadeInFrames > 0
      ? interpolate(frame, [0, fadeInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const verticalStyle: React.CSSProperties =
    position === "top" ? { top: edgePx } : { bottom: edgePx };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...verticalStyle,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: maxWidthPx,
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius,
          background,
          color,
          fontFamily: FONT_STACKS.sans,
          fontWeight,
          fontSize,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          textAlign: "center",
          opacity,
          boxShadow: "0 6px 22px rgba(0,0,0,0.18)",
          // Slight inner padding so the pill never looks cramped at narrow widths.
          boxSizing: "border-box",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. <ChapterCardPill>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ChapterCardPill — larger white pill mid-frame that swaps in for each new
 * "beat" of the explanation. Optional number prefix sits at the LEFT of the
 * first line. Crossfade only — no scale/slide (matches Hormozi reference).
 */
export interface ChapterCardPillProps {
  /** Chapter title — may be multi-line (split on \n). */
  title: string;
  /** Optional small number prefix (e.g. "4:" or "#3"). */
  numberPrefix?: string;
  /** Y position from frame top. Default 960 (center of a 1920-tall 9:16 frame). */
  topPx?: number;
  /** Pill background. Default '#FFFFFF'. */
  background?: string;
  /** Text color. Default '#0A0A0A'. */
  color?: string;
  /** Optional accent color for the numberPrefix. Default same as text color. */
  numberColor?: string;
  /** Max width. Default 880. */
  maxWidthPx?: number;
  /** Font size. Default 52. */
  fontSize?: number;
  /** Crossfade in (frames). Default 8. */
  fadeInFrames?: number;
  /** Crossfade out (frames). Default 8. Set 0 to hold forever. */
  fadeOutFrames?: number;
  /** Total visible frames (excluding fades). */
  visibleFrames?: number;
  /** Frame at which the card enters. */
  enterFrame?: number;
  /** Optional drop shadow. Default true. */
  shadow?: boolean;
}

export const ChapterCardPill: React.FC<ChapterCardPillProps> = ({
  title,
  numberPrefix,
  topPx = 960,
  background = "#FFFFFF",
  color = "#0A0A0A",
  numberColor,
  maxWidthPx = 880,
  fontSize = 52,
  fadeInFrames = 8,
  fadeOutFrames = 8,
  visibleFrames,
  enterFrame = 0,
  shadow = true,
}) => {
  const frame = useCurrentFrame();

  const opacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
    fadeOutFrames,
  );

  // Hard-cull when fully invisible so we don't keep an opacity:0 layer composited.
  if (opacity <= 0) return null;

  const lines = title.split("\n");
  const resolvedNumberColor = numberColor ?? color;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: topPx,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: maxWidthPx,
          padding: "32px 44px",
          borderRadius: 36,
          background,
          color,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          textAlign: "left",
          opacity,
          boxShadow: shadow ? "0 10px 36px rgba(0,0,0,0.22)" : "none",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {numberPrefix ? (
          <span
            style={{
              color: resolvedNumberColor,
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              // Prefix sits slightly larger than the body line so the index reads first.
              fontSize: fontSize * 1.05,
              lineHeight: 1.05,
              flexShrink: 0,
            }}
          >
            {numberPrefix}
          </span>
        ) : null}
        <span style={{ display: "block" }}>
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. <ChapterCardDoubleLine>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ChapterCardDoubleLine — Hormozi's "2# Prescribe \"the best\"" pattern. NO
 * pill background — just bold sans + italic-quoted serif text with a soft
 * drop-shadow for legibility on top of any B-roll.
 *
 * Reference: JZOMOId-Ip0/frames/frame-15-t22.50s.jpg.
 */
export interface ChapterCardDoubleLineProps {
  /** Number prefix (e.g. "2#" or "1." or "3:"). */
  number: string;
  /** Top line (sans bold). */
  topLine: string;
  /** Bottom line (italic-quoted serif). */
  bottomLine: string;
  /** Y position. Default 1100. */
  topPx?: number;
  /** Text color (no background — text only with drop-shadow). Default '#FFFFFF'. */
  color?: string;
  /** Shadow color. Default 'rgba(0,0,0,0.6)'. */
  shadowColor?: string;
  /** Number font size. Default 96. */
  numberFontSize?: number;
  /** Top line font size. Default 64. */
  topLineFontSize?: number;
  /** Bottom line font size. Default 44. */
  bottomLineFontSize?: number;
  /** Quote marks around bottomLine. Default true (Hormozi style). */
  quoted?: boolean;
  /** Entry frame. */
  enterFrame?: number;
  fadeInFrames?: number;
  visibleFrames?: number;
  fadeOutFrames?: number;
}

export const ChapterCardDoubleLine: React.FC<ChapterCardDoubleLineProps> = ({
  number,
  topLine,
  bottomLine,
  topPx = 1100,
  color = "#FFFFFF",
  shadowColor = "rgba(0,0,0,0.6)",
  numberFontSize = 96,
  topLineFontSize = 64,
  bottomLineFontSize = 44,
  quoted = true,
  enterFrame = 0,
  fadeInFrames = 6,
  visibleFrames,
  fadeOutFrames = 6,
}) => {
  const frame = useCurrentFrame();

  const opacity = crossfadeOpacity(
    frame,
    enterFrame,
    fadeInFrames,
    visibleFrames,
    fadeOutFrames,
  );

  if (opacity <= 0) return null;

  // Strong dual drop-shadow keeps the text legible on bright B-roll without a
  // pill background. The doubled shadow (offset + larger blur) is what makes
  // Hormozi's no-pill chapter lines work on any backdrop.
  const textShadow = `0 2px 6px ${shadowColor}, 0 6px 18px ${shadowColor}`;

  const renderedBottom = quoted ? `“${bottomLine}”` : bottomLine;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: topPx,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(940px, 88%)",
          textAlign: "left",
          opacity,
          color,
          textShadow,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: numberFontSize,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          {number}
        </div>
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: topLineFontSize,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
          }}
        >
          {topLine}
        </div>
        <div
          style={{
            fontFamily: FONT_STACKS.serifItalic,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: bottomLineFontSize,
            lineHeight: 1.18,
            letterSpacing: "0",
          }}
        >
          {renderedBottom}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. <OpeningTitleCard>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OpeningTitleCard — one-shot full-frame opener. PUNCHY_SPRING scale-pop on the
 * hero word delivers the snap-in moment; eyebrow (mono tracked-uppercase) and
 * dek (serif) frame the hero above and below.
 *
 *   layout = 'full-frame'  → full AbsoluteFill (background covers everything)
 *   layout = 'center-band' → centered horizontal band leaving B-roll visible
 *                             above & below (default fits Hormozi's pattern of
 *                             showing the talking head behind the title).
 */
export interface OpeningTitleCardProps {
  /** Big hero word (single line). */
  hero: string;
  /** Optional eyebrow above (small, mono tracked-uppercase). */
  eyebrow?: string;
  /** Optional dek/subtitle below. */
  dek?: string;
  /** Hero text color. Default '#FFFFFF'. */
  color?: string;
  /** Background color or gradient. Default 'transparent' (lets B-roll show). */
  background?: string;
  /** Hero font size. Default 200. */
  heroFontSize?: number;
  /** Whether the card occupies full-frame or centered band. */
  layout?: "full-frame" | "center-band";
  /** Total duration in frames. Default 60. */
  totalFrames?: number;
  /** Entry duration. Default 8 (snappy). */
  enterFrames?: number;
  /** Exit duration. Default 6. */
  exitFrames?: number;
  /** Optional scale-pop on hero. Default true (1.0 → 1.04 → 1.0). */
  popOnEnter?: boolean;
  /** Entry frame. */
  enterFrame?: number;
}

export const OpeningTitleCard: React.FC<OpeningTitleCardProps> = ({
  hero,
  eyebrow,
  dek,
  color = "#FFFFFF",
  background = "transparent",
  heroFontSize = 200,
  layout = "full-frame",
  totalFrames = 60,
  enterFrames = 8,
  exitFrames = 6,
  popOnEnter = true,
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relative = frame - enterFrame;

  // Opacity envelope: snap-in over enterFrames, hold, fade out over exitFrames.
  let opacity = 1;
  if (relative < 0) {
    opacity = 0;
  } else if (relative < enterFrames) {
    opacity = interpolate(relative, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (relative >= totalFrames - exitFrames) {
    opacity = interpolate(
      relative,
      [totalFrames - exitFrames, totalFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  if (opacity <= 0) return null;

  // Scale-pop on hero via PUNCHY_SPRING. The spring drives `t ∈ [0, ~1]` which
  // we then map to 1.0 → 1.04 → 1.0 (overshoot + settle). When `popOnEnter`
  // is false we leave the hero at scale 1.0.
  const popDriver = spring({
    frame: Math.max(0, relative),
    fps,
    config: PUNCHY_SPRING,
  });
  // popDriver climbs past 1 then settles to 1 due to PUNCHY_SPRING's overshoot.
  // We use 4% overshoot mapped from a synthetic ramp so the visual lands as
  // 1.00 → 1.04 → 1.00.
  const overshoot = popDriver > 1 ? popDriver - 1 : 0;
  const settle = popDriver < 1 ? 1 - popDriver : 0;
  const heroScale = popOnEnter ? 1 + overshoot * 0.04 - settle * 0.04 : 1;

  const containerLayout: React.CSSProperties =
    layout === "full-frame"
      ? {
          width: "100%",
          height: "100%",
          background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }
      : {
          width: "100%",
          padding: "120px 0",
          background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <div style={containerLayout}>
        {eyebrow ? (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 28,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color,
              marginBottom: 24,
              textAlign: "center",
              opacity: 0.92,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: heroFontSize,
            lineHeight: 0.96,
            letterSpacing: "-0.03em",
            color,
            textAlign: "center",
            transform: `scale(${heroScale})`,
            transformOrigin: "center center",
            textShadow: "0 4px 18px rgba(0,0,0,0.35)",
          }}
        >
          {hero}
        </div>
        {dek ? (
          <div
            style={{
              fontFamily: FONT_STACKS.serifItalic,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 36,
              lineHeight: 1.25,
              color,
              marginTop: 28,
              textAlign: "center",
              maxWidth: 820,
              opacity: 0.9,
            }}
          >
            {dek}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. <HookEmojiStrip>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HookEmojiStrip — 3-emoji semantic row above the persistent hook. Hormozi's
 * distinctive pattern (📈❌🍀 etc.) — the emojis carry the SECOND meaning of
 * the hook without adding more text. Each emoji scale-pops independently via
 * PUNCHY_SPRING staggered by `staggerEntry`.
 *
 * Reference: z2P1l9WCwQ8/frames/frame-01-t01.50s.jpg.
 */
export interface HookEmojiStripProps {
  /** Array of 2-4 emojis (e.g. ["📈", "❌", "🍀"]). */
  emojis: string[];
  /** Y position. Default 220 (above the persistent hook). */
  topPx?: number;
  /** Emoji size (px). Default 88. */
  size?: number;
  /** Spacing between emojis (px). Default 32. */
  gapPx?: number;
  /** Optional fade-in. Default 0. */
  fadeInFrames?: number;
  /** Entry frame. */
  enterFrame?: number;
  /** Optional drop-shadow on each emoji. Default true. */
  shadow?: boolean;
}

export const HookEmojiStrip: React.FC<HookEmojiStripProps> = ({
  emojis,
  topPx = 220,
  size = 88,
  gapPx = 32,
  fadeInFrames = 0,
  enterFrame = 0,
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Strip-level fade-in (independent of each emoji's scale-pop). Defaults to 0
  // so the strip is present immediately, matching Hormozi's instant-hook style.
  const stripOpacity =
    fadeInFrames > 0
      ? interpolate(frame - enterFrame, [0, fadeInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : frame >= enterFrame
        ? 1
        : 0;

  if (stripOpacity <= 0) return null;

  const dropShadow = shadow ? "0 4px 12px rgba(0,0,0,0.45)" : "none";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: topPx,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: gapPx,
          opacity: stripOpacity,
        }}
      >
        {emojis.map((emoji, i) => {
          // Per-emoji entry frame via accelerating cascade (later emojis arrive
          // proportionally faster — staggeredCascade default decay = 0.85).
          const itemEnter = staggerEntry({
            index: i,
            baseStartFrame: enterFrame,
            staggerFrames: 4,
            accelerate: true,
          });
          // Each emoji rides its own PUNCHY_SPRING from its individual entry frame.
          const popDriver = spring({
            frame: Math.max(0, frame - itemEnter),
            fps,
            config: PUNCHY_SPRING,
          });
          // 0 → 1.0 with PUNCHY_SPRING's overshoot baked in (lands ~1.05 then 1.0).
          const scale = Math.max(0, popDriver);

          return (
            <div
              key={i}
              style={{
                fontSize: size,
                lineHeight: 1,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                // Native emoji font with system fallbacks — never inherits the
                // brand sans (which would render emoji as text on some hosts).
                fontFamily:
                  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif",
                filter: shadow ? `drop-shadow(${dropShadow})` : "none",
              }}
            >
              {emoji}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
