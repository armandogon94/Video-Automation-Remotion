/**
 * SubtitleScene — medium-large headline with a dotted accent underline.
 *
 * Used between hero `huge` overlays for slightly-quieter beats — e.g. a context
 * subtitle that frames the next huge headline.
 *
 * Hero tier — eligible for TransitionSeries when in a sequential chain.
 */
import React from "react";
import type { TechNewsOverlay } from "../schemas";
import {
  useOverlayChoreography,
  type UseOverlayChoreographyOpts,
} from "./useOverlayChoreography";

export interface SubtitleSceneProps {
  overlay: TechNewsOverlay;
  inkColor: string;
  accentColor: string;
  durationFrames: number;
  fadeMode?: UseOverlayChoreographyOpts["fadeMode"];
}

export const SubtitleScene: React.FC<SubtitleSceneProps> = ({
  overlay,
  inkColor,
  accentColor,
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
        paddingTop: 160,
      }}
    >
      <div
        style={{
          color: inkColor,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 78,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          textAlign: "center",
          maxWidth: 940,
          opacity,
          transform: `scale(${scale})`,
          borderBottom: `4px dotted ${accentColor}`,
          paddingBottom: 18,
          transformOrigin: "center center",
        }}
      >
        {overlay.text}
      </div>
    </div>
  );
};
