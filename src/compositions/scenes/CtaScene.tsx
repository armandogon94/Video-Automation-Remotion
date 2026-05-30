/**
 * CtaScene — full-bleed warm-red rectangle with massive white CTA text.
 *
 * Used as the closer beat — typically at the end of a 30-45s news flash to drive
 * a comment/follow/save action.
 *
 * Hero tier — eligible for TransitionSeries when in a sequential chain.
 */
import React from "react";
import type { TechNewsOverlay } from "../schemas";
import {
  useOverlayChoreography,
  type UseOverlayChoreographyOpts,
} from "./useOverlayChoreography";

export interface CtaSceneProps {
  overlay: TechNewsOverlay;
  accentColor: string;
  durationFrames: number;
  fadeMode?: UseOverlayChoreographyOpts["fadeMode"];
}

export const CtaScene: React.FC<CtaSceneProps> = ({
  overlay,
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
      }}
    >
      <div
        style={{
          background: accentColor,
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 156,
          letterSpacing: "-0.02em",
          padding: "28px 64px",
          opacity,
          transform: `scale(${scale})`,
          boxShadow: "0 12px 40px rgba(179, 58, 42, 0.35)",
        }}
      >
        {overlay.text}
      </div>
    </div>
  );
};
