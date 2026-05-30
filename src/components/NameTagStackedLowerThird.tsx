/**
 * NameTagStackedLowerThird — a two-line speaker name tag stacked under a panel:
 * a bold sans display name with an optional mono tracked-uppercase role/title
 * line beneath it. The signature lower-name-tag treatment used under each
 * webcam panel in split-screen interview layouts.
 *
 *   ┌──────────────────────┐
 *   │      LEFT WEBCAM      │
 *   └──────────────────────┘
 *          Nate B Jones        ← bold sans, accent-colored
 *          AI ANALYST          ← optional mono tracked uppercase, muted
 *
 * Matt/All-In consensus pattern M21. Pure presentational FC — it does NOT read
 * `useCurrentFrame()`; the parent owns timing/visibility. It is also aspect-
 * NEUTRAL: the parent positions and sizes the slot via `top` / `left` / `width`
 * (no hard-coded full-frame geometry), so the same component drops into both
 * 9:16 and 16:9 layouts.
 *
 * Colors come from the parent's resolved palette stack (accent / muted / ink),
 * NOT from hard-coded values; typography uses the house FONT_STACKS / BRAND.
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent positions/sizes the slot (Tier-B per ADR-001 §2.3). Source pattern: M21.
 */
import React from "react";
import { BRAND, FONT_STACKS } from "../brand";

export interface NameTagStackedLowerThirdProps {
  /** Display name (always shown). Bold sans, accent-colored. */
  name: string;
  /** Optional role/title line beneath the name (mono, tracked, uppercase). */
  title?: string;
  /** Accent color for the name line. Default BRAND.colors.accent. */
  accentColor?: string;
  /** Muted color for the title line. Default BRAND.colors.muted. */
  mutedColor?: string;
  /** Ink color used for the 1px name text-shadow. Default BRAND.colors.text. */
  inkColor?: string;
  /** Absolute top offset (px). Default 880 (M7 split-screen baseline). */
  top?: number;
  /** Absolute left offset (px). Default 0. */
  left?: number;
  /** Block width (px) — also caps the ellipsis/truncation. Default 880. */
  width?: number;
  /** Name font size (px). Default 42. */
  nameFontSize?: number;
  /** Title font size (px). Default 24. */
  titleFontSize?: number;
}

export const NameTagStackedLowerThird: React.FC<
  NameTagStackedLowerThirdProps
> = ({
  name,
  title,
  accentColor = BRAND.colors.accent,
  mutedColor = BRAND.colors.muted,
  inkColor = BRAND.colors.text,
  top = 880,
  left = 0,
  width = 880,
  nameFontSize = 42,
  titleFontSize = 24,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: nameFontSize,
          color: accentColor,
          lineHeight: 1.0,
          letterSpacing: "-0.01em",
          textShadow: `0 1px 0 ${inkColor}`,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          maxWidth: width,
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </div>
      {title ? (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: titleFontSize,
            color: mutedColor,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: width,
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
      ) : null}
    </div>
  );
};

export default NameTagStackedLowerThird;
