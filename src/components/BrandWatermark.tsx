/**
 * BrandWatermark — persistent brand glyph anchored to a frame corner.
 *
 * Wave-6 enhancement (Nate B Jones consensus H4 — `PersistentCtaPillCycling`):
 * the watermark can OPTIONALLY cycle through a sequence of labels (e.g.
 * "@armandointeligencia", "newsletter.armando.ai", "Subscribe →") with each
 * shown for its `durationSeconds` and crossfaded between. When cycling is off
 * (the default) the watermark behaves exactly like before — a logo-only badge.
 */
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND_LOGO_FILENAMES } from "../brand";
import { FONT_STACKS } from "../brand";
import type { WatermarkStyle } from "../compositions/schemas";

export interface BrandWatermarkCycleLabel {
  /** Label text shown next to the logo while this cycle slot is active. */
  label: string;
  /** How long the label is shown before crossfading to the next, in seconds. */
  durationSeconds: number;
}

interface BrandWatermarkProps {
  style: WatermarkStyle;
  /**
   * Optional rotating labels. When `cycleEnabled && cycleLabels.length > 0`,
   * the watermark cycles through them — each shown for its `durationSeconds`
   * with a short crossfade between slots. Falls back to logo-only behavior
   * when cycling is off.
   */
  cycleLabels?: Array<BrandWatermarkCycleLabel>;
  /** Default false — keeps existing call sites unchanged. */
  cycleEnabled?: boolean;
  /** Crossfade between cycle slots in frames. Default 12. */
  cycleCrossfadeFrames?: number;
  /** Label color. Default white. */
  labelColor?: string;
  /** Label font size in px. Default 28. */
  labelFontSize?: number;
  /**
   * Chrome mode. Default `'full'` — renders the watermark normally.
   * Set to `'minimal'` to render NOTHING (brand-free output for cross-posting
   * to platforms where in-video watermarks aren't desirable). Per Adam Rosler
   * analysis: zero in-video watermark on 18/18 frames.
   */
  chrome?: "minimal" | "full";
}

const PADDING = 48;
const CROSSFADE_FRAMES_DEFAULT = 12;
const LABEL_FONT_SIZE_DEFAULT = 28;

/**
 * Select the current cycle slot for `frame` and return:
 *  - the active label
 *  - an opacity envelope (1 in the middle of the slot, fading to/from 0 at the
 *    boundaries so adjacent slots crossfade cleanly)
 *
 * Loops back to slot 0 after the last slot ends — total cycle length is the
 * sum of all `durationSeconds`.
 */
function selectCycleSlot(
  frame: number,
  fps: number,
  labels: ReadonlyArray<BrandWatermarkCycleLabel>,
  crossfadeFrames: number,
): { label: string; opacity: number } {
  // Convert every slot to frames once; bail to a 1-frame floor so a zero or
  // negative duration can't trap the playhead at slot 0.
  const slotFrames = labels.map((slot) =>
    Math.max(1, Math.round(slot.durationSeconds * fps)),
  );
  const totalFrames = slotFrames.reduce((sum, n) => sum + n, 0);
  const loopedFrame = ((frame % totalFrames) + totalFrames) % totalFrames;

  let cursor = 0;
  for (let i = 0; i < labels.length; i++) {
    const slotLen = slotFrames[i] ?? 1;
    const slotStart = cursor;
    const slotEnd = cursor + slotLen;
    if (loopedFrame >= slotStart && loopedFrame < slotEnd) {
      const local = loopedFrame - slotStart;
      const fadeIn =
        crossfadeFrames > 0 && local < crossfadeFrames
          ? interpolate(local, [0, crossfadeFrames], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;
      const fadeOut =
        crossfadeFrames > 0 && local >= slotLen - crossfadeFrames
          ? interpolate(
              local,
              [slotLen - crossfadeFrames, slotLen],
              [1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          : 1;
      const slot = labels[i];
      return {
        label: slot?.label ?? "",
        opacity: Math.min(fadeIn, fadeOut),
      };
    }
    cursor = slotEnd;
  }
  // Defensive fallback — shouldn't be reachable because loopedFrame < totalFrames.
  const first = labels[0];
  return { label: first?.label ?? "", opacity: 1 };
}

export const BrandWatermark: React.FC<BrandWatermarkProps> = ({
  style,
  cycleLabels,
  cycleEnabled = false,
  cycleCrossfadeFrames = CROSSFADE_FRAMES_DEFAULT,
  labelColor = "#FFFFFF",
  labelFontSize = LABEL_FONT_SIZE_DEFAULT,
  chrome = "full",
}) => {
  // Hooks must run unconditionally — call them before the enabled check.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (chrome === "minimal") return null;
  if (!style.enabled) return null;

  const filename = BRAND_LOGO_FILENAMES[style.logo];
  const src = staticFile(`brand/logos/${filename}`);

  const cycleActive =
    cycleEnabled && Array.isArray(cycleLabels) && cycleLabels.length > 0;
  const slot = cycleActive
    ? selectCycleSlot(frame, fps, cycleLabels, cycleCrossfadeFrames)
    : null;

  // Position styles. When cycling, lay out as a flex row so the label sits
  // next to the logo on the same baseline. The flex direction flips for
  // left-anchored positions so the label stays "inside" toward the frame.
  const isLeftAnchored =
    style.position === "bottom-left" || style.position === "top-left";

  const positionStyles: Record<WatermarkStyle["position"], React.CSSProperties> =
    {
      "bottom-right": { bottom: PADDING, right: PADDING },
      "bottom-left": { bottom: PADDING, left: PADDING },
      "top-right": { top: PADDING, right: PADDING },
      "top-left": { top: PADDING, left: PADDING },
    };

  return (
    <div
      style={{
        position: "absolute",
        opacity: style.opacity,
        pointerEvents: "none",
        display: "flex",
        flexDirection: isLeftAnchored ? "row-reverse" : "row",
        alignItems: "center",
        gap: cycleActive ? 14 : 0,
        ...positionStyles[style.position],
      }}
    >
      <Img
        src={src}
        style={{
          width: style.size,
          height: style.size,
          objectFit: "contain",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
        }}
      />
      {cycleActive && slot ? (
        <span
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: labelFontSize,
            color: labelColor,
            letterSpacing: "0.02em",
            textShadow: "0 2px 8px rgba(0,0,0,0.35)",
            opacity: slot.opacity,
            whiteSpace: "nowrap",
          }}
        >
          {slot.label}
        </span>
      ) : null}
    </div>
  );
};
