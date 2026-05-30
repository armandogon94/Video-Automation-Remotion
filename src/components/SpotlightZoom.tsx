/**
 * SpotlightZoom — Wave-5 Tella-derived molecule (T8).
 *
 * Synthesis ref: `docs/research/wave-5/tella-motion-graphics-synthesis.md` §T8
 *   "Rect-mask + outside-blur — Tella demos this in her editor; this is the
 *    Remotion-native equivalent. Zoom into a rectangle of the source content,
 *    blur everything outside the rect, optionally dim the surround, hold, then
 *    release."
 *
 * Frame refs:
 *   - `tella-frames/ykBDqicGx0M/frame-13-t1097.40s.jpg`
 *   - `tella-frames/ykBDqicGx0M/frame-14-t1181.82s.jpg`
 *
 * --- How it works ---
 *
 * We render the same `children` TWICE, in the same DOM tree, both wrapped in
 * a single shared "zoom layer" so the transform math only happens once:
 *
 *   <ZoomLayer transform={punchIn(...)}>
 *     <BlurredLayer>{children}</BlurredLayer>         (filter: blur(N))
 *     <DimOverlay svg-mask-with-rect-hole />          (optional dim)
 *     <SharpLayer clip-path={inset to rect}>{children}</SharpLayer>
 *     <SpotlightBorder rect={rect} />                 (optional stroke)
 *   </ZoomLayer>
 *   <SpotlightLabel rect={rect} />                    (optional label)
 *
 * The `transform-origin` on the zoom layer is the *spotlight rect's center*,
 * so the rect stays anchored as scale ramps from 1 → zoomFactor → 1.
 *
 * Both sharp and blurred layers are full-frame copies of `children`, so the
 * clip-path on the sharp layer only needs to reference the rect's coordinates
 * in the children's own (untransformed) coordinate space.
 *
 * Because we don't know the parent composition's pixel dimensions from
 * children alone, we read them from `useVideoConfig()`. The SVG mask is sized
 * to that frame so the dim overlay's rect-hole lines up exactly.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { punchIn } from "../animation/smartZoom";

export interface SpotlightZoomRect {
  /** Position + size of the spotlight rect (px), in the children's coordinate space. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Optional corner radius. Default 12. */
  borderRadius?: number;
}

export interface SpotlightZoomBorder {
  color: string;
  widthPx: number;
}

export interface SpotlightZoomLabel {
  text: string;
  color?: string;
  fontSize?: number;
}

export interface SpotlightZoomProps {
  /** Source content to spotlight (typically a <MacWindow> or <OffthreadVideo>). */
  children: React.ReactNode;
  /** Spotlight target rect (defines what stays sharp). */
  targetRect: SpotlightZoomRect;
  /** Zoom factor when spotlight is active (1.0 = no zoom, 1.5 = 50% zoom in). Default 1.4. */
  zoomFactor?: number;
  /** Gaussian blur (px) applied OUTSIDE the spotlight rect. Default 8. */
  blurPx?: number;
  /** Frame at which the spotlight begins (within parent Sequence). Default 0. */
  startFrame?: number;
  /** Frames the zoom-in takes. Default 8. */
  zoomInFrames?: number;
  /** Frames the spotlight stays held. Default 40. */
  heldFrames?: number;
  /** Frames the zoom-out takes. Default 8. */
  zoomOutFrames?: number;
  /** Outside dim opacity (0..1). Default 0 (no dim, just blur). Set 0.35 for a subtle vignette. */
  outsideDimOpacity?: number;
  /** Border around the spotlight rect (rendered on top). Default null (no border). */
  spotlightBorder?: SpotlightZoomBorder | null;
  /** Optional label rendered above the spotlight (e.g. "Look here"). */
  label?: SpotlightZoomLabel;
}

/**
 * Compute the focal point (0..1 normalized) of the spotlight rect, relative
 * to the full frame. Passed to `punchIn` so the zoom anchors on the rect.
 */
function focalForRect(
  rect: SpotlightZoomRect,
  frameWidth: number,
  frameHeight: number,
): { x: number; y: number } {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return {
    x: frameWidth > 0 ? cx / frameWidth : 0.5,
    y: frameHeight > 0 ? cy / frameHeight : 0.5,
  };
}

export const SpotlightZoom: React.FC<SpotlightZoomProps> = ({
  children,
  targetRect,
  zoomFactor = 1.4,
  blurPx = 8,
  startFrame = 0,
  zoomInFrames = 8,
  heldFrames = 40,
  zoomOutFrames = 8,
  outsideDimOpacity = 0,
  spotlightBorder = null,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: frameWidth, height: frameHeight } = useVideoConfig();

  const focal = focalForRect(targetRect, frameWidth, frameHeight);

  // Drive scale + translate via punchIn. We pass `factor = zoomFactor`, so the
  // resulting transform string is the zoom-layer's CSS transform.
  const zoom = punchIn({
    frame,
    fps,
    startFrame,
    framesIn: zoomInFrames,
    factor: zoomFactor,
    heldFrames,
    framesOut: zoomOutFrames,
    focal,
  });

  // Outside-blur intensity ramps up with the zoom and back out — keyed to the
  // same in/held/out phases so the un-blurred frames at rest stay crisp.
  const blurStart = startFrame;
  const blurInDone = startFrame + zoomInFrames;
  const heldEnd = blurInDone + heldFrames;
  const blurOutDone = heldEnd + zoomOutFrames;
  const liveBlurPx = interpolate(
    frame,
    [blurStart, blurInDone, heldEnd, blurOutDone],
    [0, blurPx, blurPx, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const liveDimOpacity = interpolate(
    frame,
    [blurStart, blurInDone, heldEnd, blurOutDone],
    [0, outsideDimOpacity, outsideDimOpacity, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const borderRadius = targetRect.borderRadius ?? 12;

  // Clip-path inset for the sharp layer: we want to show ONLY the rect.
  // `inset(top right bottom left round R)` measures from the layer's edges.
  const insetTop = targetRect.y;
  const insetRight = Math.max(0, frameWidth - (targetRect.x + targetRect.width));
  const insetBottom = Math.max(0, frameHeight - (targetRect.y + targetRect.height));
  const insetLeft = targetRect.x;
  const sharpClipPath = `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round ${borderRadius}px)`;

  // Unique mask id so multiple <SpotlightZoom>s on one frame don't collide.
  const maskId = React.useId();

  // Anchor the zoom on the rect's center. CSS transform-origin lets us set
  // this in pixels, so the rect feels "pinned" through the zoom.
  const centerX = targetRect.x + targetRect.width / 2;
  const centerY = targetRect.y + targetRect.height / 2;
  const transformOrigin = `${centerX}px ${centerY}px`;

  // Label sits ABOVE the rect in UNTRANSFORMED coordinates so we render it
  // INSIDE the zoom layer too — it scales with the spotlight.
  const labelText = label?.text;
  const labelColor = label?.color ?? "#FFFFFF";
  const labelFontSize = label?.fontSize ?? 28;
  const labelGap = 16; // px above the rect
  const labelTop = targetRect.y - labelGap;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Single shared zoom layer — both sharp + blurred copies live inside. */}
      <AbsoluteFill
        style={{
          transform: zoom.transform,
          transformOrigin,
        }}
      >
        {/* Blurred background copy. Sits at the bottom of the zoom layer. */}
        <AbsoluteFill
          style={{
            filter: liveBlurPx > 0 ? `blur(${liveBlurPx.toFixed(2)}px)` : "none",
            // Tiny scale so the blur edges don't show the frame border.
            transform: liveBlurPx > 0 ? "scale(1.02)" : "none",
          }}
        >
          {children}
        </AbsoluteFill>

        {/* Optional outside-dim overlay with a rect-hole cut via SVG mask. */}
        {outsideDimOpacity > 0 && (
          <AbsoluteFill style={{ opacity: liveDimOpacity, pointerEvents: "none" }}>
            <svg
              width={frameWidth}
              height={frameHeight}
              viewBox={`0 0 ${frameWidth} ${frameHeight}`}
              style={{ display: "block" }}
            >
              <defs>
                <mask id={maskId}>
                  {/* White = visible (dim shows). Black rect = hole (no dim). */}
                  <rect x={0} y={0} width={frameWidth} height={frameHeight} fill="white" />
                  <rect
                    x={targetRect.x}
                    y={targetRect.y}
                    width={targetRect.width}
                    height={targetRect.height}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x={0}
                y={0}
                width={frameWidth}
                height={frameHeight}
                fill="#000000"
                mask={`url(#${maskId})`}
              />
            </svg>
          </AbsoluteFill>
        )}

        {/* Sharp copy, clipped to ONLY the spotlight rect. */}
        <AbsoluteFill style={{ clipPath: sharpClipPath, WebkitClipPath: sharpClipPath }}>
          {children}
        </AbsoluteFill>

        {/* Spotlight border rendered ON TOP of the sharp copy, still inside
            the zoom layer so it scales with the rect. */}
        {spotlightBorder && (
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                top: targetRect.y,
                left: targetRect.x,
                width: targetRect.width,
                height: targetRect.height,
                border: `${spotlightBorder.widthPx}px solid ${spotlightBorder.color}`,
                borderRadius,
                boxSizing: "border-box",
              }}
            />
          </AbsoluteFill>
        )}

        {/* Optional label above the rect (in the zoom layer, so it scales). */}
        {labelText && (
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                left: targetRect.x,
                width: targetRect.width,
                top: labelTop,
                transform: "translateY(-100%)",
                color: labelColor,
                fontSize: labelFontSize,
                fontWeight: 700,
                fontFamily: "Inter, system-ui, sans-serif",
                textAlign: "center",
                textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                letterSpacing: "-0.01em",
              }}
            >
              {labelText}
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
