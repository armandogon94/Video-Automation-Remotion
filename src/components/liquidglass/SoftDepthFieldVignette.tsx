/**
 * SoftDepthFieldVignette — a FOOTAGE reading-room overlay atom (Opus + Gemini
 * craft note, liquid-glass family).
 *
 * WHAT IT IS
 * ----------
 * Instead of a HARD card slapped over footage (which kills the texture and the
 * sense of place), this atom makes reading room for a list/caption by BLURRING +
 * DARKENING just ONE SIDE of the frame with a SOFT, FEATHERED edge — a "soft
 * depth-field vignette". The underlying footage stays visible through the panel:
 * it's pushed out of focus and dimmed, not covered. The feathered inner edge
 * means there is no hard seam, so a hand/gesture in the footage can point INTO
 * the overlay area without a visible boundary cutting across it.
 *
 * Craft target (Opus/Gemini): blur ~6–8 sigma, darken ~20–30%, feathered. The
 * defaults sit dead-center (blurSigma 7, darken 0.28, featherPct 22).
 *
 * HOW IT RENDERS
 * --------------
 * An AbsoluteFill (pointerEvents:"none") holding ONE side panel pinned to the
 * chosen edge:
 *   1. a backdrop-filter BLUR region (frosts the footage underneath — and yes,
 *      backdrop-filter blur IS honored in our Remotion renders; glassCardStyle
 *      relies on it too). Its own mask feathers the blur from full at the outer
 *      edge to none at the inner edge so the focus transition is gradual.
 *   2. a DARK linear-gradient on top of the blur, going from solid (`darken`
 *      alpha) at the outer edge to fully transparent at the inner edge — the
 *      `featherPct` band is the soft transition zone.
 *   3. an OPTIONAL subtle themed tint (a low-alpha wash of the theme glow) for
 *      brand cohesion when `tint` is on.
 *
 * It does NOT render children — it is an overlay the caller places OVER footage
 * and then positions the actual list/caption text into the cleared (blurred,
 * darkened) reading area itself.
 *
 * GOTCHAS HANDLED (headless Remotion): no background-clip:text /
 * -webkit-text-fill-color:transparent (there is no text here anyway). Pure CSS —
 * linear-gradient + mask + backdrop-filter + a tint wash. Fully static: nothing
 * derives from useCurrentFrame (a reading-room vignette holds steady under
 * footage), so it is trivially SSR-safe and frame-deterministic (no
 * Math.random / Date.now / window). This is an atom, not a comp, so no comp-id
 * concerns.
 *
 * Self-contained: imports only react and ./tokens (same folder).
 */
import React from "react";
import { lgTheme, withAlpha, type LiquidGlassTheme } from "./tokens";

export interface SoftDepthFieldVignetteProps {
  /** Which edge gets the reading-room panel. */
  side?: "left" | "right" | "bottom";
  /**
   * Panel width as a percentage of the frame width (for "left"/"right"). For
   * "bottom" this is reused as the panel HEIGHT percentage of the frame height.
   */
  widthPct?: number;
  /**
   * Panel height as a percentage of the frame height — ONLY used when
   * `side === "bottom"`. Falls back to `widthPct` when omitted so callers can
   * size a bottom panel with either prop.
   */
  heightPct?: number;
  /** backdrop-filter blur radius (px) applied to the footage under the panel. */
  blurSigma?: number;
  /** Darken strength at the outer (solid) edge — 0 (none) … 1 (black). */
  darken?: number;
  /**
   * Width of the feather/transition band as a percentage of the panel's own
   * extent — the soft zone where blur + darkening fade from full to none. The
   * inner edge of the panel is fully transparent so it melts into the footage.
   */
  featherPct?: number;
  /** Liquid-glass theme; selects the default tint hue when `tint` is on. */
  theme?: LiquidGlassTheme;
  /** When true, layers a subtle themed glow wash over the panel for cohesion. */
  tint?: boolean;
  /** Extra container styles (z-index, opacity multiplier, etc.). */
  style?: React.CSSProperties;
}

/**
 * Clamp helper kept local (mirrors withAlpha's clamping) so percentages and
 * alphas never escape sane bounds regardless of caller input.
 */
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const SoftDepthFieldVignette: React.FC<SoftDepthFieldVignetteProps> = ({
  side = "right",
  widthPct = 46,
  heightPct,
  blurSigma = 7,
  darken = 0.28,
  featherPct = 22,
  theme = "brand",
  tint = false,
  style,
}) => {
  const t = lgTheme(theme);

  // Panel extent along its axis (% of the relevant frame dimension).
  const extentPct =
    side === "bottom" ? clamp(heightPct ?? widthPct, 0, 100) : clamp(widthPct, 0, 100);
  // Feather band as a fraction of THIS panel's own extent (so a wider panel
  // gets a proportionally wider, softer transition zone).
  const feather = clamp(featherPct, 0, 100);
  const darkAlpha = clamp(darken, 0, 1);
  const blur = Math.max(0, blurSigma);

  // Gradient axis runs from the OUTER edge (solid) toward the INNER edge
  // (transparent). For "left" the outer edge is the left, so it runs to-right;
  // "right" runs to-left; "bottom" runs to-top.
  const toDirection =
    side === "left" ? "to right" : side === "right" ? "to left" : "to top";

  // The solid band holds full strength up to (100 - feather)% of the panel,
  // then feathers to nothing by the inner edge.
  const solidStopPct = clamp(100 - feather, 0, 100);

  // Dark gradient: solid `darkAlpha` black at the outer edge → transparent at
  // the inner edge, with the feather band as the transition.
  const darkGradient = `linear-gradient(${toDirection},
    rgba(0,0,0,${darkAlpha}) 0%,
    rgba(0,0,0,${darkAlpha}) ${solidStopPct}%,
    rgba(0,0,0,0) 100%)`;

  // Mask for the blur layer: the backdrop-filter blur is applied at full
  // strength on the outer side and feathered to none at the inner edge so the
  // FOCUS transition matches the darkening transition (no hard frost seam).
  const blurMask = `linear-gradient(${toDirection},
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) ${solidStopPct}%,
    rgba(0,0,0,0) 100%)`;

  // Optional themed tint wash — a low-alpha glow that also feathers inward.
  const tintGradient = tint
    ? `linear-gradient(${toDirection},
        ${withAlpha(t.glow, 0.14)} 0%,
        ${withAlpha(t.glow, 0.14)} ${solidStopPct}%,
        ${withAlpha(t.glow, 0)} 100%)`
    : undefined;

  // Pin the panel to the chosen edge and size it along its axis.
  const panelPosition: React.CSSProperties =
    side === "bottom"
      ? { left: 0, right: 0, bottom: 0, height: `${extentPct}%` }
      : side === "left"
        ? { top: 0, bottom: 0, left: 0, width: `${extentPct}%` }
        : { top: 0, bottom: 0, right: 0, width: `${extentPct}%` };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      {/* Side panel pinned to the chosen edge. */}
      <div style={{ position: "absolute", ...panelPosition }}>
        {/* Blur layer — frosts the footage underneath, feathered via mask so
         *  the out-of-focus region melts into the in-focus footage. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: blurMask,
            WebkitMaskImage: blurMask,
          }}
        />
        {/* Optional themed tint wash (subtle brand cohesion). */}
        {tintGradient ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: tintGradient,
            }}
          />
        ) : null}
        {/* Dark gradient — solid at the outer edge, transparent at the inner
         *  edge; this is what actually opens up the reading room. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: darkGradient,
          }}
        />
      </div>
    </div>
  );
};
