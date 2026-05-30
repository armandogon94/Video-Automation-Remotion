/**
 * SplitFrame — generalizable two-pane split layout primitive.
 *
 * WHY THIS EXISTS
 * ---------------
 * Per the R4C Wave-7 Batch 3 Extension finding on bilawal.ai
 * (see `references/creators/bilawal.ai/ANALYSIS.md`, pattern N5), Bilawal's
 * "V-split chunked caption" template puts a dashboard / b-roll in the top 50%
 * and a face-cam in the bottom 50%, with a chunked caption pill anchored AT
 * the seam between the two panes. The split-frame itself is NOT bound to that
 * single template — it is a low-level layout primitive that recurs across
 * many short-form patterns:
 *
 *   - V-split caption-at-seam (Bilawal pattern N5)
 *   - Two-camera face cam (PIP-style host + b-roll)
 *   - Dashboard + host commentary (top: data, bottom: face)
 *   - Before/after split (left: before, right: after)
 *   - Split-screen comparison (left: option A, right: option B)
 *
 * This primitive is intentionally dumb: it owns layout only. Animation,
 * caption rendering, frame-driven motion, etc. are delegated to the children
 * and to the `seamOverlay` slot. It does NOT call `useCurrentFrame` and has
 * no time dependency, so it composes cleanly inside any `<Sequence>`.
 *
 * USAGE
 * -----
 * Pair with `CaptionPillWithKeyword` (or any caption molecule) via the
 * `seamOverlay` slot to reproduce Bilawal's V-split caption-at-seam pattern:
 *
 *   <SplitFrame
 *     split="vertical"
 *     ratio={0.5}
 *     seamBorder="2px solid white"
 *     firstChild={<DashboardBroll src={dashboardSrc} />}
 *     secondChild={<FaceCam src={faceSrc} />}
 *     seamOverlay={
 *       <CaptionPillWithKeyword
 *         text="Runtime makes local AI feel normal"
 *         keyword="Runtime"
 *         anchor="relative"
 *         startFrame={36}
 *         endFrame={150}
 *       />
 *     }
 *   />
 */

import React from "react";
import { AbsoluteFill } from "remotion";

export interface SplitFrameProps {
  /** Split orientation. 'vertical' = top/bottom panes; 'horizontal' = left/right panes. Default 'vertical'. */
  split?: "vertical" | "horizontal";
  /** Ratio of first pane (0-1). Default 0.5 (50/50). */
  ratio?: number;
  /** Gap between panes in px. Default 0. */
  gapPx?: number;
  /** Color of the gap/seam strip. Default 'transparent'. */
  seamColor?: string;
  /** Optional seam border (e.g. '2px solid white' for Bilawal's hard division). Default none. */
  seamBorder?: string;
  /** First pane content (top if vertical, left if horizontal). */
  firstChild: React.ReactNode;
  /** Second pane content (bottom if vertical, right if horizontal). */
  secondChild: React.ReactNode;
  /** Optional overlay rendered AT the seam (e.g. a CaptionPillWithKeyword). Centered on the split line. */
  seamOverlay?: React.ReactNode;
}

export const SplitFrame: React.FC<SplitFrameProps> = ({
  split = "vertical",
  ratio = 0.5,
  gapPx = 0,
  seamColor = "transparent",
  seamBorder,
  firstChild,
  secondChild,
  seamOverlay,
}) => {
  const isVertical = split === "vertical";
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isVertical ? "column" : "row",
    width: "100%",
    height: "100%",
  };

  const firstPaneStyle: React.CSSProperties = {
    flex: clampedRatio,
    overflow: "hidden",
    position: "relative",
  };

  const secondPaneStyle: React.CSSProperties = {
    flex: 1 - clampedRatio,
    overflow: "hidden",
    position: "relative",
  };

  // Seam (gap) strip — only rendered if gapPx > 0 or a seamBorder is requested.
  // When gapPx === 0 but seamBorder is set, we still render a 0-height/width
  // strip whose border provides the hard division line.
  const showSeamStrip = gapPx > 0 || Boolean(seamBorder);

  const seamStripStyle: React.CSSProperties = isVertical
    ? {
        width: "100%",
        height: gapPx,
        backgroundColor: seamColor,
        ...(seamBorder
          ? { borderTop: seamBorder, borderBottom: seamBorder }
          : {}),
        flexShrink: 0,
      }
    : {
        height: "100%",
        width: gapPx,
        backgroundColor: seamColor,
        ...(seamBorder
          ? { borderLeft: seamBorder, borderRight: seamBorder }
          : {}),
        flexShrink: 0,
      };

  // Overlay sits absolutely on top of the panes, centered on the split line.
  // For vertical splits, the split line is at `top: ratio * 100%`.
  // For horizontal splits, the split line is at `left: ratio * 100%`.
  const overlayStyle: React.CSSProperties = isVertical
    ? {
        position: "absolute",
        top: `${clampedRatio * 100}%`,
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      }
    : {
        position: "absolute",
        left: `${clampedRatio * 100}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      };

  return (
    <AbsoluteFill>
      <div style={containerStyle}>
        <div style={firstPaneStyle}>{firstChild}</div>
        {showSeamStrip ? <div style={seamStripStyle} /> : null}
        <div style={secondPaneStyle}>{secondChild}</div>
      </div>
      {seamOverlay ? <div style={overlayStyle}>{seamOverlay}</div> : null}
    </AbsoluteFill>
  );
};
