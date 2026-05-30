/**
 * ChipScene — small warm-red pill chip in the top-left corner.
 *
 * Used as a "tag" or "section flag" that rides ON TOP OF the main hero overlay
 * (e.g. "FILTRACIÓN" chip riding on top of a "GEMINI 3.2 FLASH" huge headline).
 *
 * Decoration tier — partition() routes ChipScene into the "decoration" track, which
 * is always rendered via individual <Sequence> wrappers (never TransitionSeries) because
 * chips can freely overlap with hero overlays.
 */
import React from "react";
import { interpolate } from "remotion";
import type { TechNewsOverlay } from "../schemas";
import {
  useOverlayChoreography,
  type UseOverlayChoreographyOpts,
} from "./useOverlayChoreography";

export interface ChipSceneProps {
  overlay: TechNewsOverlay;
  accentColor: string;
  durationFrames: number;
  fadeMode?: UseOverlayChoreographyOpts["fadeMode"];
}

export const ChipScene: React.FC<ChipSceneProps> = ({
  overlay,
  accentColor,
  durationFrames,
  fadeMode,
}) => {
  const { opacity, scaleIn } = useOverlayChoreography({ durationFrames, fadeMode });
  const scale = interpolate(scaleIn, [0, 1], [0.9, 1.0]);

  return (
    <div
      style={{
        position: "absolute",
        // Per A3+A5 audit: the BrandBreadcrumb defaults to topPx:80 and ~50px
        // tall, so the chip used to collide with it at top:60. Push the chip
        // below the breadcrumb's underline (≈y=130) so they stack cleanly.
        top: 160,
        left: 60,
        padding: "10px 24px",
        background: accentColor,
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        boxShadow: "0 6px 22px rgba(179, 58, 42, 0.32)",
      }}
    >
      {overlay.text}
    </div>
  );
};
