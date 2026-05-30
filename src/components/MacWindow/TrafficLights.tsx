/**
 * TrafficLights — the iconic macOS red/yellow/green window-control trio.
 *
 * Used as the left-cap of any MacWindow title bar. Sized at ~22px (large enough
 * to read at vertical-format viewport but not big enough to dominate the chrome).
 * Optional `title` renders centered in the title bar; optional `subtitle` adds
 * a faint secondary label (e.g. `— zsh`, `· compliance api`).
 */
import React from "react";
import { FONT_STACKS } from "../../brand";

export interface TrafficLightsProps {
  /** Diameter of each dot in px. Default 14. */
  dotSize?: number;
  /** Gap between dots in px. Default 8. */
  gap?: number;
  /** Optional title rendered centered in the bar. */
  title?: string;
  /** Optional dimmer subtitle appended after the title (e.g. `— zsh`). */
  subtitle?: string;
  /** Title-bar height in px. Default 44. */
  height?: number;
  /** Visual variant — `light` for cream palettes, `dark` for dark palettes. */
  variant?: "light" | "dark";
  /** Optional left-side icon glyph (e.g. a file-type emoji). Renders left of the title. */
  titleIcon?: React.ReactNode;
}

/**
 * The standard mac dot colors.
 * Slightly desaturated to read as "real Finder", not "cartoon traffic light".
 */
const DOT_COLORS = {
  red: "#FF5F57",
  yellow: "#FEBC2E",
  green: "#28C840",
} as const;

export const TrafficLights: React.FC<TrafficLightsProps> = ({
  dotSize = 14,
  gap = 8,
  title,
  subtitle,
  height = 44,
  variant = "light",
  titleIcon,
}) => {
  const barBg =
    variant === "dark"
      ? "linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%)"
      : "linear-gradient(180deg, #ECECEC 0%, #D5D5D5 100%)";
  const titleColor = variant === "dark" ? "#C8C8C8" : "#3A3A3A";
  const subtitleColor = variant === "dark" ? "#7C7C7C" : "#8A8A8A";
  const borderBottom =
    variant === "dark" ? "1px solid #0F0F0F" : "1px solid #B8B8B8";

  return (
    <div
      style={{
        position: "relative",
        height,
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        background: barBg,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        borderBottom,
        boxSizing: "border-box",
      }}
    >
      {/* Dots (left) */}
      <div
        style={{
          display: "flex",
          gap,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: DOT_COLORS.red,
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: DOT_COLORS.yellow,
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: DOT_COLORS.green,
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
            display: "inline-block",
          }}
        />
      </div>

      {/* Centered title */}
      {title ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            pointerEvents: "none",
            fontFamily: FONT_STACKS.sans,
            fontSize: 14,
            fontWeight: 500,
            color: titleColor,
          }}
        >
          {titleIcon ? (
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {titleIcon}
            </span>
          ) : null}
          <span>{title}</span>
          {subtitle ? (
            <span style={{ color: subtitleColor, fontWeight: 400 }}>
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
