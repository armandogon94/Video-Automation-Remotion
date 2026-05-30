/**
 * DarkSlateChassis16x9 — the foundation 16:9 chassis (molecule).
 *
 * Wave-7 Batch 3 (R4B) finding: Nate B Jones, Matthew Berman, Adam Rosler,
 * theaiadvantage and Alex Hormozi all converge on the SAME base look for 16:9
 * long-form. The vocabulary the consensus docs use is "Stripe Press in
 * motion" — a dark-navy slate slab (NOT pure #000) with three layers of
 * persistent chrome:
 *
 *   1. A translucent brand-glyph watermark behind content (large, low opacity,
 *      anchored — Nate's helmet/glasses mark; for us, the avatar-pixar glyph).
 *   2. A persistent handle chip lower-right (Nate's `@nate.b.jones` pill;
 *      for us, `@armandointeligencia` in brand gold).
 *   3. An optional caption-pill slot at the bottom (intended for B23's
 *      `<CaptionPillWithKeyword>` — one-keyword-tinted bordered pill).
 *
 * This component is a *molecule*, not a composition. Templates wrap their
 * content in it to inherit the chassis; the chassis registers nothing with
 * Remotion's composition root. It is composable with the existing
 * `BrandWatermark16x9` and `BrandBreadcrumb16x9` primitives — if a template
 * wants to layer the corner-anchored logo+handle watermark from
 * `BrandWatermark16x9` on top, it just passes it as a child.
 *
 * Render order back-to-front:
 *   slate background → watermark glyph → children → caption pill → handle chip
 *
 * Why not pure black? Per R4B consensus: pure `#000` reads as "AI Studio
 * preview" — flat, cheap. The slate (`#0F1B2D` deep navy, BRAND.colors
 * .backgroundDark) reads as editorial / Stripe Press. The default uses the
 * brand's `backgroundDark` token so the chassis stays in family with every
 * other branded surface.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND, FONT_STACKS } from "../../brand";

export interface DarkSlateChassisProps {
  /** Background slate color. Default: brand deep navy `#0F1B2D`. */
  slateColor?: string;
  /** Optional translucent brand glyph watermarked behind content. */
  watermark?: {
    /** SVG path, `<Img>`, or arbitrary React node. */
    glyph: React.ReactNode;
    /** Opacity 0–1. Default 0.08 (Nate-equivalent low-key). */
    opacity?: number;
    /** Horizontal anchor for the glyph. Default `'center-right'`. */
    anchor?: "center" | "center-right" | "center-left";
    /** Rendered width in px. Default 720. */
    widthPx?: number;
  };
  /** Persistent handle chip lower-right. */
  handleChip?: {
    /** Handle text, e.g. `"@armandointeligencia"`. */
    text: string;
    /** Chip text color. Defaults to brand gold (`#D4AF37`). */
    color?: string;
  };
  /**
   * Slot for the caption pill. Intended to receive a
   * `<CaptionPillWithKeyword>` from B23, but any React node is accepted.
   * Rendered centered ~bottom: 100px, ABOVE the handle chip layer.
   */
  captionPill?: React.ReactNode;
  /** Main content layer. */
  children: React.ReactNode;
}

const HANDLE_CHIP_EDGE_PADDING_PX = 24;
const HANDLE_CHIP_FONT_SIZE_PX = 24;
const CAPTION_PILL_BOTTOM_PX = 100;
const DEFAULT_WATERMARK_OPACITY = 0.08;
const DEFAULT_WATERMARK_WIDTH_PX = 720;

/**
 * Resolve the watermark's horizontal anchor to absolute-position styles that
 * keep the glyph vertically centered while sliding it left/right per the
 * `anchor` prop. We use translate(-50%, -50%) for true center and explicit
 * `left`/`right` for the side anchors so the glyph hugs the edge cleanly.
 */
function resolveWatermarkAnchor(
  anchor: NonNullable<DarkSlateChassisProps["watermark"]>["anchor"],
): React.CSSProperties {
  switch (anchor) {
    case "center":
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    case "center-left":
      return {
        top: "50%",
        left: 0,
        transform: "translate(-25%, -50%)",
      };
    case "center-right":
    default:
      return {
        top: "50%",
        right: 0,
        transform: "translate(25%, -50%)",
      };
  }
}

export const DarkSlateChassis16x9: React.FC<DarkSlateChassisProps> = ({
  slateColor = BRAND.colors.backgroundDark,
  watermark,
  handleChip,
  captionPill,
  children,
}) => {
  const watermarkOpacity = watermark?.opacity ?? DEFAULT_WATERMARK_OPACITY;
  const watermarkWidth = watermark?.widthPx ?? DEFAULT_WATERMARK_WIDTH_PX;
  const watermarkAnchorStyle = watermark
    ? resolveWatermarkAnchor(watermark.anchor ?? "center-right")
    : null;

  const handleChipColor = handleChip?.color ?? BRAND.colors.accent;

  return (
    <AbsoluteFill style={{ backgroundColor: slateColor }}>
      {/* 1. Translucent brand-glyph watermark — behind all content. */}
      {watermark && watermarkAnchorStyle ? (
        <div
          style={{
            position: "absolute",
            width: watermarkWidth,
            opacity: watermarkOpacity,
            pointerEvents: "none",
            ...watermarkAnchorStyle,
          }}
        >
          {watermark.glyph}
        </div>
      ) : null}

      {/* 2. Main content layer. */}
      {children}

      {/* 3. Caption pill slot — sits above the handle chip. */}
      {captionPill ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: CAPTION_PILL_BOTTOM_PX,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {captionPill}
        </div>
      ) : null}

      {/* 4. Persistent handle chip lower-right. */}
      {handleChip ? (
        <div
          style={{
            position: "absolute",
            right: HANDLE_CHIP_EDGE_PADDING_PX,
            bottom: HANDLE_CHIP_EDGE_PADDING_PX,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: HANDLE_CHIP_FONT_SIZE_PX,
            color: handleChipColor,
            letterSpacing: "0.02em",
            textShadow: "0 2px 8px rgba(0,0,0,0.45)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {handleChip.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
