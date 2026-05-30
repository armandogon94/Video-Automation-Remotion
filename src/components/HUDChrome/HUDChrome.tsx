/**
 * HUDChrome — composing wrapper that overlays all the HUD chrome sub-components
 * into a single overlay layer.
 *
 * Wave-4 consensus: persistent HUD chrome (chip + scrub bar + chapter stepper +
 * handle + inset border) gives every template a consistent "world layer" wrap,
 * regardless of the inner composition.
 *
 * Reads palette via `getPalette()` for default colors so chrome defaults match
 * the active palette mode without the caller passing accent colors explicitly.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { getPalette, type PaletteMode } from "../../brand";
import { SceneChapterChip } from "./SceneChapterChip";
import { TopScrubBar } from "./TopScrubBar";
import { ChapterStepper, type ChapterStep } from "./ChapterStepper";
import { HandleTag } from "./HandleTag";
import { InsetCardBorder } from "./InsetCardBorder";

export interface HUDChromeProps {
  /** Total duration of the parent composition in seconds. */
  totalSeconds: number;
  /** If present, renders ChapterStepper at bottom. */
  steps?: ChapterStep[];
  /** If present, renders the SceneChapterChip eyebrow pill near the top. */
  chapterChip?: { text: string; numberBadge?: string };
  /** Handle / @-tag in the top corner (default @armandointeligencia). */
  handle?: string;
  accentColor?: string;
  paletteMode?: PaletteMode;
  showInsetBorder?: boolean; // default true
  showTopScrubBar?: boolean; // default true
  showHandle?: boolean; // default true
  /** Defaults to true iff `steps` is non-empty. */
  showChapterStepper?: boolean;
  /** Defaults to true iff `chapterChip` is provided. */
  showChapterChip?: boolean;
}

export const HUDChrome: React.FC<HUDChromeProps> = ({
  totalSeconds,
  steps,
  chapterChip,
  handle,
  accentColor,
  paletteMode = "cream",
  showInsetBorder = true,
  showTopScrubBar = true,
  showHandle = true,
  showChapterStepper,
  showChapterChip,
}) => {
  const palette = getPalette(paletteMode);
  const effectiveAccent = accentColor ?? palette.accent;
  const inkColor = palette.ink;

  const stepperEnabled =
    showChapterStepper ?? (Array.isArray(steps) && steps.length > 0);
  const chipEnabled = showChapterChip ?? chapterChip != null;

  // Inset border color follows the palette mode — light hairline on dark, dark on light.
  const insetBorderColor =
    paletteMode === "paper" || paletteMode === "cream"
      ? "rgba(0,0,0,0.08)"
      : "rgba(255,255,255,0.10)";

  // Handle color follows the palette ink with a touch of transparency.
  const handleColor =
    paletteMode === "paper" || paletteMode === "cream"
      ? "rgba(0,0,0,0.65)"
      : "rgba(255,255,255,0.85)";

  // Scrub-bar track color follows palette.
  const scrubTrackColor =
    paletteMode === "paper" || paletteMode === "cream"
      ? "rgba(0,0,0,0.08)"
      : "rgba(255,255,255,0.08)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {showInsetBorder ? <InsetCardBorder color={insetBorderColor} /> : null}

      {showTopScrubBar ? (
        <TopScrubBar
          totalSeconds={totalSeconds}
          accentColor={effectiveAccent}
          trackColor={scrubTrackColor}
        />
      ) : null}

      {showHandle ? (
        <HandleTag handle={handle} color={handleColor} />
      ) : null}

      {chipEnabled && chapterChip ? (
        <SceneChapterChip
          text={chapterChip.text}
          numberBadge={chapterChip.numberBadge}
          accentColor={effectiveAccent}
          inkColor={inkColor}
        />
      ) : null}

      {stepperEnabled && steps && steps.length > 0 ? (
        <ChapterStepper steps={steps} accentColor={effectiveAccent} />
      ) : null}
    </AbsoluteFill>
  );
};
