import React from "react";
import { AbsoluteFill } from "remotion";

interface GradientBackgroundProps {
  from: string;
  to: string;
  direction?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  from,
  to,
  direction = "to bottom right",
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${direction}, ${from}, ${to})`,
      }}
    />
  );
};
