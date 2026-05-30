/**
 * SceneByKind — dispatch to the right scene component based on overlay.kind.
 *
 * Single source of truth for "given an overlay, render its scene." Used by both the
 * Sequence path (for decoration/standalone overlays) and the TransitionSeries path
 * (for hero chains, where fadeMode = "in-group" lets the outer transition own opacity).
 */
import React from "react";
import type { TechNewsOverlay } from "../schemas";
import { ChipScene } from "./ChipScene";
import { HugeScene } from "./HugeScene";
import { SubtitleScene } from "./SubtitleScene";
import { CtaScene } from "./CtaScene";
import type { UseOverlayChoreographyOpts } from "./useOverlayChoreography";

export interface SceneByKindProps {
  overlay: TechNewsOverlay;
  durationFrames: number;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  fadeMode?: UseOverlayChoreographyOpts["fadeMode"];
}

export const SceneByKind: React.FC<SceneByKindProps> = ({
  overlay,
  durationFrames,
  inkColor,
  accentColor,
  mutedColor,
  fadeMode,
}) => {
  switch (overlay.kind) {
    case "chip":
      return (
        <ChipScene
          overlay={overlay}
          accentColor={accentColor}
          durationFrames={durationFrames}
          fadeMode={fadeMode}
        />
      );
    case "huge":
      return (
        <HugeScene
          overlay={overlay}
          inkColor={inkColor}
          mutedColor={mutedColor}
          durationFrames={durationFrames}
          fadeMode={fadeMode}
        />
      );
    case "subtitle":
      return (
        <SubtitleScene
          overlay={overlay}
          inkColor={inkColor}
          accentColor={accentColor}
          durationFrames={durationFrames}
          fadeMode={fadeMode}
        />
      );
    case "cta":
      return (
        <CtaScene
          overlay={overlay}
          accentColor={accentColor}
          durationFrames={durationFrames}
          fadeMode={fadeMode}
        />
      );
    default:
      return null;
  }
};
