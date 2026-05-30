/**
 * ChapterProgressTimeline — Wave-7 cross-creator molecule
 *
 * Source: Sahil Bloom analysis pattern #4 `HeroChapterNumeral9x16`. Sahil's
 * mid-roll chrome consistently shows "where am I in the talk" via a horizontal
 * progress bar of N segments — one per chapter / numeral — with the active
 * segment lit in accent, past segments dimmed, future segments stubbed.
 *
 * Wave-5 contract:
 *   "Horizontal progress timeline of N segments; active segment fills accent
 *   over `animateFrames` from `startFrame`, past segments dim to 50% opacity,
 *   future segments stub at 15%. Optional labels below each segment in mono
 *   tracked uppercase."
 *
 * Pure React FC reading `useCurrentFrame()` ONLY when `animateActiveFill` is on.
 * No video config needed — purely visual chrome.
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { FONT_STACKS } from "../brand";

export interface ChapterProgressTimelineChapter {
  label: string;
  sub?: string;
}

export interface ChapterProgressTimelineProps {
  /** Chapter labels (ordered). */
  chapters: Array<ChapterProgressTimelineChapter>;
  /** Active chapter index (0-based). */
  activeIndex: number;
  /** Y position (px). */
  topPx?: number;
  /** Total width (px). Default 920. */
  widthPx?: number;
  /** Segment height (px). Default 8. */
  segmentHeightPx?: number;
  /** Gap between segments (px). Default 6. */
  gapPx?: number;
  /** Accent color for active segment. */
  accentColor?: string;
  /** Past color. Default rgba(255,255,255,0.50). */
  pastColor?: string;
  /** Future color. Default rgba(255,255,255,0.15). */
  futureColor?: string;
  /** Show labels below segments. Default true. */
  showLabels?: boolean;
  /** Label font size. Default 18. */
  labelFontSize?: number;
  /** Label font family. Default mono. */
  labelFontFamily?: string;
  /** Letter spacing on labels. Default 0.18em. */
  labelLetterSpacing?: string;
  /** Animate the active fill (0 → 1 over animateFrames). Default true. */
  animateActiveFill?: boolean;
  animateFrames?: number;
  /** Frame at which animation begins. */
  startFrame?: number;
  /** Active scale factor (e.g. 1.2 = active segment 20% bigger). Default 1.0 (no scale). */
  activeScale?: number;
}

const DEFAULTS = {
  topPx: 120,
  widthPx: 920,
  segmentHeightPx: 8,
  gapPx: 6,
  accentColor: "#F1C232",
  pastColor: "rgba(255,255,255,0.50)",
  futureColor: "rgba(255,255,255,0.15)",
  showLabels: true,
  labelFontSize: 18,
  labelFontFamily: FONT_STACKS.mono,
  labelLetterSpacing: "0.18em",
  animateActiveFill: true,
  animateFrames: 18,
  startFrame: 0,
  activeScale: 1.0,
} as const;

export const ChapterProgressTimeline: React.FC<ChapterProgressTimelineProps> = (props) => {
  const frame = useCurrentFrame();

  const topPx = props.topPx ?? DEFAULTS.topPx;
  const widthPx = props.widthPx ?? DEFAULTS.widthPx;
  const segmentHeightPx = props.segmentHeightPx ?? DEFAULTS.segmentHeightPx;
  const gapPx = props.gapPx ?? DEFAULTS.gapPx;
  const accentColor = props.accentColor ?? DEFAULTS.accentColor;
  const pastColor = props.pastColor ?? DEFAULTS.pastColor;
  const futureColor = props.futureColor ?? DEFAULTS.futureColor;
  const showLabels = props.showLabels ?? DEFAULTS.showLabels;
  const labelFontSize = props.labelFontSize ?? DEFAULTS.labelFontSize;
  const labelFontFamily = props.labelFontFamily ?? DEFAULTS.labelFontFamily;
  const labelLetterSpacing = props.labelLetterSpacing ?? DEFAULTS.labelLetterSpacing;
  const animateActiveFill = props.animateActiveFill ?? DEFAULTS.animateActiveFill;
  const animateFrames = props.animateFrames ?? DEFAULTS.animateFrames;
  const startFrame = props.startFrame ?? DEFAULTS.startFrame;
  const activeScale = props.activeScale ?? DEFAULTS.activeScale;

  const { chapters, activeIndex } = props;
  if (chapters.length === 0) return null;

  // Active fill ramp: 0 → 1 over [startFrame, startFrame + animateFrames].
  // When animation is off, jumps straight to 1.
  const fillProgress = animateActiveFill
    ? interpolate(frame, [startFrame, startFrame + animateFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Segment width derived from total - gaps. We rely on flexbox `flex: 1` per
  // segment to keep this resolution-agnostic; the width prop just sizes the
  // outer container.
  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: "50%",
        transform: "translateX(-50%)",
        width: widthPx,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pointerEvents: "none",
      }}
    >
      {/* Bar row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: gapPx,
          width: "100%",
        }}
      >
        {chapters.map((_, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          // Base color for the segment "track" (the slot color).
          const trackColor = isPast ? pastColor : isActive ? futureColor : futureColor;
          // For the active segment, the fill goes 0 → 1 in accent across the track.
          const segmentScale = isActive ? activeScale : 1.0;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: segmentHeightPx,
                background: trackColor,
                borderRadius: segmentHeightPx / 2,
                position: "relative",
                overflow: "hidden",
                transform: `scaleY(${segmentScale})`,
                transformOrigin: "center",
              }}
            >
              {/* Active fill overlay — only renders on the active segment. */}
              {isActive ? (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${fillProgress * 100}%`,
                    background: accentColor,
                    borderRadius: segmentHeightPx / 2,
                  }}
                />
              ) : null}
              {/* Past segments are painted directly in `trackColor` (= pastColor),
                  so they read as "completed" at 50% white without an overlay. */}
            </div>
          );
        })}
      </div>

      {/* Labels row */}
      {showLabels ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: gapPx,
            width: "100%",
            marginTop: 12,
          }}
        >
          {chapters.map((c, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            const labelColor = isActive ? accentColor : isPast ? pastColor : futureColor;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: labelFontFamily,
                    fontSize: labelFontSize,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: labelLetterSpacing,
                    textTransform: "uppercase",
                    color: labelColor,
                    lineHeight: 1.1,
                  }}
                >
                  {c.label}
                </div>
                {c.sub ? (
                  <div
                    style={{
                      fontFamily: labelFontFamily,
                      fontSize: Math.max(10, labelFontSize - 4),
                      fontWeight: 400,
                      letterSpacing: labelLetterSpacing,
                      textTransform: "uppercase",
                      color: labelColor,
                      opacity: 0.75,
                      marginTop: 2,
                      lineHeight: 1.1,
                    }}
                  >
                    {c.sub}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
