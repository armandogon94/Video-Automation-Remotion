/**
 * HugeScene — massive editorial headline filling the hero zone.
 *
 * Hero tier — when multiple huge scenes are sequential (back-to-back with no overlap),
 * partition() routes them into a hero chain that can optionally render via
 * <TransitionSeries> for crossfades between them.
 */
import React from "react";
import type { TechNewsOverlay } from "../schemas";
import {
  useOverlayChoreography,
  type UseOverlayChoreographyOpts,
} from "./useOverlayChoreography";

export interface HugeSceneProps {
  overlay: TechNewsOverlay;
  inkColor: string;
  mutedColor: string;
  durationFrames: number;
  fadeMode?: UseOverlayChoreographyOpts["fadeMode"];
}

export const HugeScene: React.FC<HugeSceneProps> = ({
  overlay,
  inkColor,
  mutedColor,
  durationFrames,
  fadeMode,
}) => {
  const { opacity, scale } = useOverlayChoreography({ durationFrames, fadeMode });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        paddingTop: 160, // bias slightly up so caption zone stays clear
      }}
    >
      <div
        style={{
          color: inkColor,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 132,
          lineHeight: 1.02,
          letterSpacing: "-0.025em",
          textAlign: "center",
          maxWidth: 920,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {overlay.text}
        {overlay.subtext && (
          <div
            style={{
              marginTop: 26,
              fontSize: 38,
              fontWeight: 500,
              color: mutedColor,
              letterSpacing: "0.04em",
            }}
          >
            {overlay.subtext}
          </div>
        )}
      </div>
    </div>
  );
};
