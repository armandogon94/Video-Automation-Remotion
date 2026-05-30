/**
 * KineticMacroTypeOpener9x16 — Bilawal's silent hook pattern (R4C bilawal.ai
 * Wave-7 Batch 3 Extension §N3).
 *
 * A single word, set so large that it OVERFLOWS both left and right edges of
 * the 1080px-wide frame — only the middle letters are visible. Pure black
 * background, white bold sans, ~1.5s hold. Designed to make the viewer
 * pause-to-read (silent hook, no motion = curiosity gap).
 *
 * Reference: bilawal.ai reel — 11.7K likes. ANALYSIS.md §N3.
 *
 * Visual intent:
 *   - Pure black bg (#000000 — NOT slate; Bilawal-specific true black).
 *   - 540px+ white bold sans, line-height 1.0, tight letter-spacing.
 *   - white-space: nowrap so the word overflows instead of wrapping.
 *   - Optional subtle scale-in (0.95 → 1.0) for emphasis, controlled by
 *     `zoomIntensity` (0 = static, 0.5 default = subtle, 2 = pronounced).
 *
 * This is a HOOK composition — it deliberately does NOT use DarkSlateChassis
 * (chassis is 16:9 + slate; this is 9:16 + pure black).
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand/fonts";

export const kineticMacroTypeOpenerSchema = z.object({
  word: z.string(),
  /** Background color. Default '#000000' (pure black per Bilawal). */
  bgColor: z.string().default("#000000"),
  /** Text color. Default white. */
  textColor: z.string().default("#FFFFFF"),
  /** Font size in px. Default 540 (overflows 1080px frame for ~6-letter words). */
  fontSizePx: z.number().default(540),
  /** Font weight. Default 900 (heaviest). */
  fontWeight: z.number().default(900),
  /** Letter spacing. Default '-0.05em' (tight for impact). */
  letterSpacing: z.string().default("-0.05em"),
  /** Total duration in frames. Default 45 (1.5s @ 30fps). */
  durationFrames: z.number().default(45),
  /** Optional zoom-in motion (0 = no zoom, 1 = subtle, 2 = pronounced). Default 0.5. */
  zoomIntensity: z.number().default(0.5),
  transitionVerb: z.string().default(
    "Hold the macro-typed word stationary against pure black; if zoomIntensity > 0, scale up subtly from 0.95 to 1.0 over the full duration.",
  ),
});

export type KineticMacroTypeOpenerProps = z.infer<
  typeof kineticMacroTypeOpenerSchema
>;

export const KineticMacroTypeOpener9x16: React.FC<
  KineticMacroTypeOpenerProps
> = ({
  word,
  bgColor,
  textColor,
  fontSizePx,
  fontWeight,
  letterSpacing,
  durationFrames,
  zoomIntensity,
}) => {
  const frame = useCurrentFrame();

  // Subtle scale-in: (1 - 0.05 * zoomIntensity) → 1.0 across the full duration.
  const scaleFrom = 1 - 0.05 * zoomIntensity;
  const scale = zoomIntensity > 0
    ? interpolate(frame, [0, durationFrames], [scaleFrom, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight,
          fontSize: fontSizePx,
          letterSpacing,
          lineHeight: 1.0,
          color: textColor,
          whiteSpace: "nowrap",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {word}
      </div>
    </AbsoluteFill>
  );
};
