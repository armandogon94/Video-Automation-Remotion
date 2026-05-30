/**
 * PersistentEventLockupChyron16x9 — All-In Podcast's signature corner chyron.
 *
 * Cited from R2C analysis of @allin (All-In Podcast / Summit):
 *   - `references/creators/allin/ANALYSIS.md` §P1 — DOMINANT pattern, 11/12 hit
 *     rate. A two-line stacked condensed-sans lockup ("ALL-IN" / "SUMMIT") sits
 *     inside a dark-blue vertical-gradient panel anchored to a bottom safe-area
 *     corner. Persistent throughout the entire clip — never animates.
 *   - `references/creators/allin/ANALYSIS.md` §P12 — `DavosRegionalChyronVariant16x9`:
 *     same panel, regional event token swap (SUMMIT → DAVOS) and anchor swap
 *     (bottom-left → bottom-right) for the Davos 2025 clip. Confirms a
 *     template-system: same lockup, swap event token + corner.
 *
 * Pure chrome molecule — never animates per allin grammar. Anchor swap (BL↔BR)
 * + regionalEventToken swap (SUMMIT↔DAVOS) capture the entire allin chyron family.
 *
 * This is NOT a Remotion `<Sequence>` — just a div tree. It is consumed as a
 * child by 16:9 templates (e.g. the upcoming `KeynoteSlidePIP16x9`).
 *
 * Stylistic notes:
 *   - No condensed-sans face is loaded in `src/brand/fonts.ts`. We approximate
 *     the All-In condensed look with Inter weight 800 + 0.05em letter-spacing
 *     + uppercase + tight line-height. If a true condensed face is added later,
 *     swap `FONT_STACKS.sans` for it.
 *   - `pointerEvents: 'none'` so the chyron never intercepts clicks in Studio.
 *   - The fade-in is OPT-IN via `fadeInOnFrame`. Default behavior is opacity 1
 *     from frame 0 (matches allin grammar exactly).
 */
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { FONT_STACKS } from "../../brand";

export type PersistentEventLockupChyronAnchor = "BL" | "BR" | "TL" | "TR";

export interface PersistentEventLockupChyronProps {
  /** Top line of stacked lockup. Default 'ARMANDO'. */
  brandToken?: string;
  /**
   * Bottom line — regional event token. e.g. 'SUMMIT', 'DAVOS', 'NYC'.
   * Default 'SUMMIT'.
   */
  regionalEventToken?: string;
  /** Corner anchor. Default 'BL' (bottom-left, the All-In default). */
  anchor?: PersistentEventLockupChyronAnchor;
  /** Distance from anchored edges in px. Default 32. */
  edgePx?: number;
  /** Width of the panel in px. Default 280. */
  widthPx?: number;
  /** Background gradient color (dark blue default). */
  panelBg?: string;
  /** Text color. Default white. */
  textColor?: string;
  /** Font size for the top line in px. Default 36. Bottom line renders at 0.7×. */
  fontSize?: number;
  /**
   * Optional frame to fade in on. If set, the chyron fades from 0 → 1 over
   * 8 frames starting at this frame. Otherwise opacity is 1 from frame 0 (the
   * All-In default — they never animate the chyron).
   */
  fadeInOnFrame?: number;
}

const FADE_IN_DURATION_FRAMES = 8;

export const PersistentEventLockupChyron16x9: React.FC<
  PersistentEventLockupChyronProps
> = ({
  brandToken = "ARMANDO",
  regionalEventToken = "SUMMIT",
  anchor = "BL",
  edgePx = 32,
  widthPx = 280,
  panelBg,
  textColor = "#FFFFFF",
  fontSize = 36,
  fadeInOnFrame,
}) => {
  const frame = useCurrentFrame();

  const opacity =
    fadeInOnFrame === undefined
      ? 1
      : interpolate(
          frame,
          [fadeInOnFrame, fadeInOnFrame + FADE_IN_DURATION_FRAMES],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

  // Brand-navy → deep-navy vertical gradient by default. Caller can override
  // with a single color or a custom gradient string via `panelBg`.
  const background =
    panelBg ?? "linear-gradient(180deg, #1a3a6e 0%, #0F1B2D 100%)";

  const anchorStyle: React.CSSProperties = {
    BL: { bottom: edgePx, left: edgePx },
    BR: { bottom: edgePx, right: edgePx },
    TL: { top: edgePx, left: edgePx },
    TR: { top: edgePx, right: edgePx },
  }[anchor];

  return (
    <div
      style={{
        position: "absolute",
        ...anchorStyle,
        width: widthPx,
        padding: "16px 24px",
        background,
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 2,
        opacity,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.0,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {brandToken}
      </span>
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: Math.round(fontSize * 0.7),
          lineHeight: 1.0,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {regionalEventToken}
      </span>
    </div>
  );
};
