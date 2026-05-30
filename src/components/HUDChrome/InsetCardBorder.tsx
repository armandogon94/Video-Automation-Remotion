/**
 * InsetCardBorder — a 1px rounded border that sits 24px inside the 1080×1920
 * safe area, giving the "card on stage" feel.
 *
 * Wave-4 consensus: persistent hairline chrome that visually frames the content
 * inside a card, without dominating it.
 */
import React from "react";
import { AbsoluteFill } from "remotion";

export interface InsetCardBorderProps {
  insetPx?: number; // default 24
  borderRadiusPx?: number; // default 28
  strokeWidth?: number; // default 1
  color?: string; // default rgba(255,255,255,0.10)
}

export const InsetCardBorder: React.FC<InsetCardBorderProps> = ({
  insetPx = 24,
  borderRadiusPx = 28,
  strokeWidth = 1,
  color = "rgba(255,255,255,0.10)",
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: insetPx,
          left: insetPx,
          right: insetPx,
          bottom: insetPx,
          border: `${strokeWidth}px solid ${color}`,
          borderRadius: borderRadiusPx,
          boxSizing: "border-box",
        }}
      />
    </AbsoluteFill>
  );
};
