/**
 * BrandWatermark16x9 — 16:9 variant of `BrandWatermark.tsx`.
 *
 * Same role as the 9:16 watermark (persistent brand glyph anchored to a frame
 * corner) but tuned for the wider long-form canvas:
 *
 *   - Anchored bottom-right by default (same default as 9:16).
 *   - 64px default padding (up from 48px) so the watermark gets breathing room
 *     on the wider canvas.
 *   - Larger default touch target — `size` defaults to 120px (up from 96px).
 *   - Optional handle text rendered NEXT TO the logo at 48px font for the
 *     long-form "presenter watermark" look (Nate B Jones, Hormozi). Set to
 *     undefined to render the logo-only watermark like the 9:16 variant.
 *
 * Reuses the same `WatermarkStyle` schema as the 9:16 watermark so callers
 * just swap the import — no schema changes required.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND_LOGO_FILENAMES } from "../brand";
import { FONT_STACKS } from "../brand";
import type { WatermarkStyle } from "../compositions/schemas";

interface BrandWatermark16x9Props {
  style: WatermarkStyle;
  /** Optional handle text rendered alongside the logo, e.g. "@armandointeligencia". */
  handle?: string;
  /** Padding from the anchored edges in px. Default 64. */
  paddingPx?: number;
  /** Handle font size in px. Default 48. */
  handleFontSize?: number;
  /** Handle color. Default white. */
  handleColor?: string;
  /**
   * Chrome mode. Default `'full'` — renders the watermark normally.
   * Set to `'minimal'` to render NOTHING (brand-free output for cross-posting
   * to platforms where in-video watermarks aren't desirable). Per Adam Rosler
   * analysis: zero in-video watermark on 18/18 frames.
   */
  chrome?: "minimal" | "full";
}

const DEFAULT_PADDING = 64;
const DEFAULT_HANDLE_FONT_SIZE = 48;
const DEFAULT_SIZE_OVERRIDE = 120;

export const BrandWatermark16x9: React.FC<BrandWatermark16x9Props> = ({
  style,
  handle,
  paddingPx = DEFAULT_PADDING,
  handleFontSize = DEFAULT_HANDLE_FONT_SIZE,
  handleColor = "#FFFFFF",
  chrome = "full",
}) => {
  if (chrome === "minimal") return null;
  if (!style.enabled) return null;

  const filename = BRAND_LOGO_FILENAMES[style.logo];
  const src = staticFile(`brand/logos/${filename}`);

  // 16:9 gets a slightly larger default size if the caller left the schema
  // default in place (96). Any explicit size > 96 means the caller already
  // tuned it — respect their value.
  const renderedSize = style.size <= 96 ? DEFAULT_SIZE_OVERRIDE : style.size;

  const positionStyles: Record<
    WatermarkStyle["position"],
    React.CSSProperties
  > = {
    "bottom-right": {
      bottom: paddingPx,
      right: paddingPx,
      flexDirection: "row",
    },
    "bottom-left": {
      bottom: paddingPx,
      left: paddingPx,
      flexDirection: "row-reverse",
    },
    "top-right": {
      top: paddingPx,
      right: paddingPx,
      flexDirection: "row",
    },
    "top-left": {
      top: paddingPx,
      left: paddingPx,
      flexDirection: "row-reverse",
    },
  };

  const positionStyle = positionStyles[style.position];

  return (
    <div
      style={{
        position: "absolute",
        opacity: style.opacity,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: 16,
        ...positionStyle,
      }}
    >
      <Img
        src={src}
        style={{
          width: renderedSize,
          height: renderedSize,
          objectFit: "contain",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
        }}
      />
      {handle ? (
        <span
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: handleFontSize,
            color: handleColor,
            letterSpacing: "0.02em",
            textShadow: "0 2px 8px rgba(0,0,0,0.35)",
          }}
        >
          {handle}
        </span>
      ) : null}
    </div>
  );
};
