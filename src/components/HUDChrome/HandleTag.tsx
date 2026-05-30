/**
 * HandleTag — top-corner handle watermark (e.g. `@ARMANDOINTELIGENCIA`).
 *
 * Persistent attribution chrome that wraps any template — gives short-form
 * videos a consistent "creator" signal even when the watermark/avatar isn't visible.
 */
import React from "react";
import { FONT_STACKS } from "../../brand";

export interface HandleTagProps {
  handle?: string; // default "@armandointeligencia"
  position?: "top-right" | "top-left";
  topPx?: number; // default 60
  /** Distance from the LEFT or RIGHT edge depending on `position`. Default 60. */
  edgePx?: number;
  fontSize?: number; // default 22
  color?: string;
  uppercase?: boolean; // default true
  letterSpacing?: string; // default "0.15em"
}

export const HandleTag: React.FC<HandleTagProps> = ({
  handle = "@armandointeligencia",
  position = "top-right",
  topPx = 60,
  edgePx = 60,
  fontSize = 22,
  color = "rgba(255,255,255,0.85)",
  uppercase = true,
  letterSpacing = "0.15em",
}) => {
  const horizontal: React.CSSProperties =
    position === "top-left" ? { left: edgePx } : { right: edgePx };

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        ...horizontal,
        fontFamily: FONT_STACKS.mono,
        fontWeight: 500,
        fontSize,
        letterSpacing,
        color,
        textTransform: uppercase ? "uppercase" : "none",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {handle}
    </div>
  );
};
