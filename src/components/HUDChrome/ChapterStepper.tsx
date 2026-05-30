/**
 * ChapterStepper — bottom-anchored 4-5 dot connected-rail with labels under each dot.
 *
 * Inspiration: DIYSmart's `eEy1oMeGfhQ` frame-01 (5-dot HOOK·WHAT·UPGRADES·SHIP·YOU)
 * and `rfzA7HWcpCQ` frame-02 (SETUP·CREATE·EVAL·DEPLOY·PUBLISH). Wave-4 critique
 * red-team finding N7.
 *
 * Active step is computed from current wall-clock seconds (frame / fps). Active dot is
 * enlarged (14px) + accent-colored; inactive dots are 8px and muted. Smooth color
 * crossfade between active states using interpolate over a short window.
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACKS } from "../../brand";

export interface ChapterStep {
  label: string;
  /** Wall-clock seconds when this chapter becomes active. */
  startSeconds: number;
}

export interface ChapterStepperProps {
  steps: ChapterStep[];
  bottomPx?: number; // default 220
  accentColor?: string;
  /** Default rgba(255,255,255,0.30). */
  inactiveColor?: string;
  fontSize?: number; // default 18
  letterSpacing?: string; // default "0.18em"
}

const ACTIVE_DOT = 14;
const INACTIVE_DOT = 8;
/** Crossfade window (frames) — short enough to feel "snap" but smooth. */
const CROSSFADE_FRAMES = 6;

/**
 * Hex/rgba color mixer — returns a CSS color that's `t` of the way from `from` to `to`.
 * Uses simple opacity layering (via interpolate on a property) where possible;
 * for hard color blending we just use the target color past the midpoint.
 *
 * For dot color we just gate at t > 0.5 — simple + matches the editorial "snap" feel.
 */
function pickColor(t: number, fromColor: string, toColor: string): string {
  return t >= 0.5 ? toColor : fromColor;
}

export const ChapterStepper: React.FC<ChapterStepperProps> = ({
  steps,
  bottomPx = 220,
  accentColor = "#D4AF37",
  inactiveColor = "rgba(255,255,255,0.30)",
  fontSize = 18,
  letterSpacing = "0.18em",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSeconds = frame / fps;

  if (steps.length === 0) return null;

  // Determine the currently-active step (highest index whose startSeconds <= now).
  let activeIndex = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (currentSeconds >= steps[i].startSeconds) {
      activeIndex = i;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: bottomPx,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {/* Connected rail (line under all dots). */}
      <div
        style={{
          position: "relative",
          height: ACTIVE_DOT,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* The rail (thin connector line). */}
        <div
          style={{
            position: "absolute",
            left: ACTIVE_DOT / 2,
            right: ACTIVE_DOT / 2,
            top: "50%",
            height: 1,
            background: inactiveColor,
            transform: "translateY(-50%)",
          }}
        />
        {/* The dots, evenly spaced. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex;
            // Compute crossfade progress for this dot toward its active state.
            const stepFrame = step.startSeconds * fps;
            const crossfade = interpolate(
              frame,
              [stepFrame, stepFrame + CROSSFADE_FRAMES],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const isPastStart = currentSeconds >= step.startSeconds;
            const color =
              isPastStart && isActive
                ? pickColor(crossfade, inactiveColor, accentColor)
                : isPastStart
                  ? accentColor
                  : inactiveColor;
            const size = isActive ? ACTIVE_DOT : INACTIVE_DOT;
            return (
              <div
                key={`dot-${idx}`}
                style={{
                  width: ACTIVE_DOT,
                  height: ACTIVE_DOT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: isActive ? `0 0 10px ${accentColor}66` : "none",
                    transition: "none",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels under each dot. */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;
          const isPastStart = currentSeconds >= step.startSeconds;
          return (
            <div
              key={`label-${idx}`}
              style={{
                flex: "1 1 0",
                textAlign: "center",
                fontFamily: FONT_STACKS.mono,
                fontWeight: isActive ? 700 : 500,
                fontSize,
                letterSpacing,
                textTransform: "uppercase",
                color: isPastStart ? accentColor : inactiveColor,
                opacity: isActive ? 1 : 0.85,
                lineHeight: 1.1,
              }}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
