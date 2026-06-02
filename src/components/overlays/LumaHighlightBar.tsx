/**
 * LumaHighlightBar — a translucent colored highlight bar drawn BEHIND a row or
 * line of content (a code line, a UI row), wiped in left→right like a marker.
 * The "highlighter swipe" emphasis: NO AI, just a positioned rect.
 *
 * Source pattern: AZisk object-emphasis OE2 (`CodeLineLumaHighlight`) + step-card
 * highlighter (AZ2). See `references/creators/azisk/ANALYSIS.md` §2 OE2 —
 * "a single line/token of code … colored highlighter bar behind the line
 * (green=do-this, yellow=note)". The line's y-position is a known text row → a
 * fixed normalized bar. Pairs with `RegionBoxAnnotation` and step cards.
 *
 *   ╭──────────────────────────────────────────────╮
 *   │  ░░░░░░░░░░░░░░░░░░░░░░  ← highlight bar wipes │
 *   │  --env MLX_METAL_FAST_SYNCH=1   (line behind) │
 *   ╰──────────────────────────────────────────────╯
 *
 * transitionVerb (OE2): "Wipe the highlighter bar left→right behind the line
 * over ~8 frames (clip-path inset); hold for the spoken beat; fade out 8 frames."
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT:
 *  - Transparent `AbsoluteFill`; parent-positioned; inline zod schema with every
 *    field `.default()`ed (new optional fields use `.optional()`); enter/hold/exit
 *    timing driven by `useCurrentFrame()`. Exports component + schema + type.
 *
 * @dualAspect true — the bar is expressed in NORMALIZED (0–1) frame coordinates,
 * so it lands on the same row at any composition dimension. Cited AZisk OE2.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";

// AZisk highlighter sentiment greens/yellows (ANALYSIS §2 OE2: green=do, yellow=note).
const AZ_HIGHLIGHT_GREEN = "#3FB950";

/** Normalized bar (0–1 of frame width/height). A row, not a cutout. */
const barRegionSchema = z.object({
  x: z.number().min(0).max(1).default(0.08),
  y: z.number().min(0).max(1).default(0.5),
  w: z.number().min(0).max(1).default(0.6),
  h: z.number().min(0).max(1).default(0.07),
});

export const lumaHighlightBarSchema = z.object({
  /** Bar region in normalized (0–1) frame coordinates. */
  region: barRegionSchema.default({ x: 0.08, y: 0.5, w: 0.6, h: 0.07 }),
  /** Highlight color. Default AZisk highlighter green (do-this). */
  color: z.string().default(AZ_HIGHLIGHT_GREEN),
  /** Fill opacity (0–1). Translucent so the row behind reads through. Default 0.42. */
  fillOpacity: z.number().min(0).max(1).default(0.42),
  /** Corner radius in px. Default 6. */
  cornerRadiusPx: z.number().default(6),
  /** Enter animation. 'wipe' = left→right marker swipe; 'fade'. Default 'wipe'. */
  enter: z.enum(["wipe", "fade"]).default("wipe"),
  /** Frame the bar begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold at full opacity after entering. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit exit frame. When omitted, the bar holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type LumaHighlightBarProps = z.infer<typeof lumaHighlightBarSchema>;

/** Convert a hex (#RRGGBB) + opacity into an rgba() string. Falls back to the
 *  raw color (with no opacity applied) if it isn't a 6-digit hex. */
function withOpacity(color: string, opacity: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(color);
  if (!m) return color;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const LumaHighlightBar: React.FC<Partial<LumaHighlightBarProps>> = (
  props,
) => {
  const {
    region,
    color,
    fillOpacity,
    cornerRadiusPx,
    enter,
    enterFrame,
    holdFrames,
    exitFrame,
  } = lumaHighlightBarSchema.parse(props);

  const frame = useCurrentFrame();
  const local = frame - enterFrame;
  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  // Block fade-out envelope.
  let blockOpacity = 1;
  if (exitFrame !== undefined) {
    blockOpacity = interpolate(frame - exitFrame, [0, 8], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    });
    if (blockOpacity <= 0) return null;
  }

  const ENTER = 8;
  // 'wipe': clip-path reveals left→right. 'fade': opacity ramp, no wipe.
  const wipePct =
    enter === "wipe"
      ? interpolate(local, [0, ENTER], [0, 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.ease),
        })
      : 100;
  const enterOpacity =
    enter === "fade"
      ? interpolate(local, [0, ENTER], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          position: "absolute",
          left: `${region.x * 100}%`,
          top: `${region.y * 100}%`,
          width: `${region.w * 100}%`,
          height: `${region.h * 100}%`,
          background: withOpacity(color, fillOpacity),
          borderRadius: cornerRadiusPx,
          opacity: enterOpacity,
          clipPath: `inset(0 ${100 - wipePct}% 0 0)`,
        }}
      />
    </AbsoluteFill>
  );
};

export default LumaHighlightBar;
