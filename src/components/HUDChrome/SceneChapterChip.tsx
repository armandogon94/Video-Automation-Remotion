/**
 * SceneChapterChip — persistent tracked-uppercase eyebrow pill that any composition
 * can overlay anywhere on screen.
 *
 * Inspiration: DIYSmart V5 (wave-4 critique consensus, finding #9), Carlos's
 * "HALLAZGO 03" eyebrow chip. The chip rides ON TOP of the hero overlay as a
 * subtle "what chapter are we in" cue.
 *
 * Motion: spring-in entrance using EDITORIAL_SPRING (calmer than chip-DNA punchy),
 * because the chip is chrome and should not steal attention from the hero copy.
 */
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EDITORIAL_SPRING } from "../../compositions/scenes";
import { FONT_STACKS } from "../../brand";

export type SceneChapterChipPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface SceneChapterChipProps {
  text: string;
  position?: SceneChapterChipPosition;
  /** Distance from the top OR bottom edge (depending on `position`). Default 220. */
  topPx?: number;
  /** Outlined pill (default true) or filled. */
  outlined?: boolean;
  accentColor?: string;
  inkColor?: string;
  fontSize?: number; // default 22
  letterSpacing?: string; // default "0.22em"
  /** Optional small number badge inside the pill (e.g. "01" or "HALLAZGO 03"). */
  numberBadge?: string;
}

function resolveHorizontal(position: SceneChapterChipPosition): React.CSSProperties {
  switch (position) {
    case "top-left":
    case "bottom-left":
      return { left: 60, transform: "none" };
    case "top-right":
    case "bottom-right":
      return { right: 60, transform: "none" };
    case "top-center":
    case "bottom-center":
    default:
      return { left: "50%", transform: "translateX(-50%)" };
  }
}

function resolveVertical(
  position: SceneChapterChipPosition,
  topPx: number,
): React.CSSProperties {
  if (position.startsWith("bottom")) return { bottom: topPx };
  return { top: topPx };
}

export const SceneChapterChip: React.FC<SceneChapterChipProps> = ({
  text,
  position = "top-center",
  topPx = 220,
  outlined = true,
  accentColor = "#D4AF37",
  inkColor = "#F1ECE1",
  fontSize = 22,
  letterSpacing = "0.22em",
  numberBadge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-in entrance via EDITORIAL_SPRING (calmer settle).
  const scaleIn = spring({
    frame,
    fps,
    config: EDITORIAL_SPRING,
  });
  const opacity = Math.min(1, scaleIn);
  const scale = 0.92 + scaleIn * 0.08; // 0.92 → 1.00

  const baseHorizontal = resolveHorizontal(position);
  const baseVertical = resolveVertical(position, topPx);

  // Merge our spring transform with the centering transform (if any).
  const horizontalTransform =
    typeof baseHorizontal.transform === "string" &&
    baseHorizontal.transform !== "none"
      ? baseHorizontal.transform
      : "";
  const transform = `${horizontalTransform} scale(${scale})`.trim();

  return (
    <div
      style={{
        position: "absolute",
        ...baseHorizontal,
        ...baseVertical,
        transform,
        transformOrigin: position.includes("center") ? "center center" : "left center",
        opacity,
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 18px",
        borderRadius: 999,
        border: outlined
          ? `1px solid ${accentColor}`
          : "1px solid transparent",
        background: outlined ? "transparent" : accentColor,
        color: outlined ? accentColor : inkColor,
        fontFamily: FONT_STACKS.mono,
        fontWeight: 500,
        fontSize,
        letterSpacing,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {numberBadge ? (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 4,
            background: outlined ? accentColor : "rgba(0,0,0,0.18)",
            color: outlined ? inkColor : accentColor,
            fontSize: fontSize * 0.82,
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {numberBadge}
        </span>
      ) : null}
      <span>{text}</span>
    </div>
  );
};
