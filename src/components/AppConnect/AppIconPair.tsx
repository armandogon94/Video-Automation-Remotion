/**
 * AppIconPair — two app icons that slide in from the L/R edges with a
 * connecting line (or arc) drawn between them, capped with a small end-marker
 * dot/chevron. Wave-5 Tella synthesis molecule T5 (`docs/research/wave-5/
 * tella-motion-graphics-synthesis.md`, frame refs `ykBDqicGx0M/frame-09` +
 * `frame-10`, the "Shabam"-style app handshake).
 *
 * Tella's explicit rule baked in here:
 *   "Remotion doesn't do an amazing job at arrows. Use a small dot or chevron
 *    at the edge tip instead — NEVER animate arrowheads."
 * So `endMarker` is a dot by default and the connector terminates with a
 * static shape that fades in AFTER the path-draw is finished, rather than a
 * tweened arrowhead.
 *
 * Choreography (all frames relative to `enterStartFrame`):
 *   0 ........................... left + right icons start sliding in from off-frame
 *   iconEnterFrames .............. icons settled
 *   iconEnterFrames ............... connector starts drawing via `pathDraw()`
 *   + connectorDrawFrames ........ connector done, end-marker fades in
 */
import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS } from "../../brand";
import { pathDraw } from "../../animation";
import { EDITORIAL_SPRING } from "../../compositions/scenes";

export interface AppIcon {
  /** App display name (e.g. "Gmail", "ChatGPT"). */
  name: string;
  /** Optional PNG path relative to /public. If absent, render a fallback rounded
   *  rect filled with `brandColor` showing the first letter of `name`. */
  iconSrc?: string;
  /** Fallback color when no iconSrc. Default `#3F3F46` (cool gray). */
  brandColor?: string;
  /** Optional accent halo behind the icon. */
  glow?: boolean;
}

export type AppIconPairConnector = "line" | "arc" | "none";
export type AppIconPairEndMarker = "dot" | "chevron" | "none";

export interface AppIconPairProps {
  left: AppIcon;
  right: AppIcon;
  /** Connector style — straight line (default) or arc above. */
  connector?: AppIconPairConnector;
  /** Connector color. Default `#D4AF37` (brand gold). */
  connectorColor?: string;
  /** Connector stroke width. Default 4. */
  connectorStrokePx?: number;
  /** Icon size in px (square). Default 200. */
  iconSizePx?: number;
  /** Vertical center of the pair (y in px). Default = composition center
   *  (resolved at render time via `useVideoConfig`). */
  centerYPx?: number;
  /** Width of the pair container (px). Default 880. */
  widthPx?: number;
  /** Entry choreography start frame. Default 0. */
  enterStartFrame?: number;
  /** Frames the icon slide-in takes. Default 14. */
  iconEnterFrames?: number;
  /** Frames the connector takes to draw, starts AFTER both icons are settled.
   *  Default 16. */
  connectorDrawFrames?: number;
  /** End marker — Tella's rule: NEVER animate arrowheads, use a static dot or
   *  chevron that fades in once the connector finishes drawing. Default 'dot'. */
  endMarker?: AppIconPairEndMarker;
}

/** Pass through absolute URLs / data URIs untouched; route relative paths via
 *  Remotion's `staticFile` so they resolve identically in Studio + headless. */
function resolveIconSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";
  return trimmed[0].toUpperCase();
}

const AppIconTile: React.FC<{
  icon: AppIcon;
  sizePx: number;
}> = ({ icon, sizePx }) => {
  const fallbackColor = icon.brandColor ?? "#3F3F46";
  const radius = Math.round(sizePx * 0.22); // iOS-style rounded square

  return (
    <div
      style={{
        position: "relative",
        width: sizePx,
        height: sizePx,
      }}
    >
      {icon.glow ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -sizePx * 0.18,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${fallbackColor}55 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(12px)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {icon.iconSrc ? (
        <Img
          src={resolveIconSrc(icon.iconSrc)}
          style={{
            position: "relative",
            width: sizePx,
            height: sizePx,
            borderRadius: radius,
            objectFit: "cover",
            // iOS-ish drop shadow gives the icon physical presence over the connector.
            boxShadow: "0 18px 36px rgba(15, 27, 45, 0.30)",
          }}
        />
      ) : (
        <div
          style={{
            position: "relative",
            width: sizePx,
            height: sizePx,
            borderRadius: radius,
            background: fallbackColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: Math.round(sizePx * 0.46),
            letterSpacing: "0.02em",
            boxShadow: "0 18px 36px rgba(15, 27, 45, 0.30)",
            textShadow: "0 2px 4px rgba(0,0,0,0.20)",
          }}
        >
          {initialOf(icon.name)}
        </div>
      )}
    </div>
  );
};

export const AppIconPair: React.FC<AppIconPairProps> = ({
  left,
  right,
  connector = "line",
  connectorColor = "#D4AF37",
  connectorStrokePx = 4,
  iconSizePx = 200,
  centerYPx,
  widthPx = 880,
  enterStartFrame = 0,
  iconEnterFrames = 14,
  connectorDrawFrames = 16,
  endMarker = "dot",
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const resolvedCenterY = centerYPx ?? Math.round(height / 2);

  // Icons slide in from off-frame using EDITORIAL_SPRING so the entry settles
  // calmly without overshoot — leaves headroom for the connector draw to feel
  // like the "moment of contact" rather than a competing animation beat.
  const iconSpringRaw = spring({
    frame: frame - enterStartFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: iconEnterFrames,
  });
  const iconOpacity = interpolate(iconSpringRaw, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Slide distance is half-width so they enter from clearly off-frame.
  const slideDistance = widthPx;
  const leftX = interpolate(iconSpringRaw, [0, 1], [-slideDistance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightX = interpolate(iconSpringRaw, [0, 1], [slideDistance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Connector geometry — compute in container-local coords (0..widthPx along x).
  // Center the SVG over the pair so we don't have to fight transforms for the
  // arc/line and end-marker math.
  const leftIconCx = iconSizePx / 2;
  const rightIconCx = widthPx - iconSizePx / 2;
  const connectorStartX = leftIconCx + iconSizePx / 2; // right edge of left icon
  const connectorEndX = rightIconCx - iconSizePx / 2; // left edge of right icon
  const connectorMidX = (connectorStartX + connectorEndX) / 2;
  const connectorY = iconSizePx / 2; // SVG vertical center matches icon center
  const arcLiftPx = 60;

  let connectorPath = "";
  let connectorLength = 0;
  let endMarkerX = connectorEndX;
  let endMarkerY = connectorY;

  if (connector === "line") {
    connectorPath = `M ${connectorStartX} ${connectorY} L ${connectorEndX} ${connectorY}`;
    connectorLength = Math.max(0, connectorEndX - connectorStartX);
    endMarkerX = connectorEndX;
    endMarkerY = connectorY;
  } else if (connector === "arc") {
    // Quadratic Bezier arcing upward, control point 60px above midpoint.
    const ctrlY = connectorY - arcLiftPx;
    connectorPath = `M ${connectorStartX} ${connectorY} Q ${connectorMidX} ${ctrlY} ${connectorEndX} ${connectorY}`;
    // Closed-form length is messy for a generic quad Bezier; approximate via
    // chord + control-distance average. Off by <2% for typical lifts, which is
    // imperceptible after the dashoffset trick (`pathDraw` ramps opacity in
    // the first 20% anyway, hiding any tail-flash).
    const chord = Math.hypot(
      connectorEndX - connectorStartX,
      0, // y-deltas cancel
    );
    const ctrlNet = Math.hypot(connectorMidX - connectorStartX, arcLiftPx) * 2;
    connectorLength = (chord + ctrlNet) / 2;
    endMarkerX = connectorEndX;
    endMarkerY = connectorY;
  }

  const connectorDraw = pathDraw({
    frame,
    startFrame: enterStartFrame + iconEnterFrames,
    durationFrames: connectorDrawFrames,
    pathLength: connectorLength || 1, // guard divide-by-zero for connector="none"
    direction: "start-to-end",
    easing: "outCubic",
  });

  // End marker fades in over 6 frames once the path is fully drawn.
  const endMarkerStart =
    enterStartFrame + iconEnterFrames + connectorDrawFrames;
  const endMarkerOpacity = interpolate(
    frame,
    [endMarkerStart, endMarkerStart + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // SVG canvas spans the connector horizontal range; pad a bit on top for the
  // arc lift and for the end marker's chevron strokes.
  const svgPaddingX = 24;
  const svgPaddingY = arcLiftPx + 24;
  const svgWidth = widthPx;
  const svgHeight = iconSizePx + svgPaddingY * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: resolvedCenterY,
        transform: "translate(-50%, -50%)",
        width: widthPx,
        height: iconSizePx,
        // Center the icons + SVG inside the container.
      }}
      aria-hidden
    >
      {/* Connector + end marker — drawn behind the icons so the icon shadow
       *  reads cleanly over the line. */}
      {connector !== "none" ? (
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`${-svgPaddingX} ${-svgPaddingY} ${svgWidth + svgPaddingX * 2} ${svgHeight}`}
          style={{
            position: "absolute",
            left: 0,
            top: -svgPaddingY,
            // Sit beneath the icons in stacking order.
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <path
            d={connectorPath}
            fill="none"
            stroke={connectorColor}
            strokeWidth={connectorStrokePx}
            strokeLinecap="round"
            strokeDasharray={connectorDraw.dashArray}
            strokeDashoffset={connectorDraw.dashOffset}
            style={{ opacity: connectorDraw.opacity }}
          />
          {endMarker === "dot" ? (
            <circle
              cx={endMarkerX}
              cy={endMarkerY}
              r={connectorStrokePx * 1.8}
              fill={connectorColor}
              style={{ opacity: endMarkerOpacity }}
            />
          ) : null}
          {endMarker === "chevron" ? (
            <path
              // Static chevron pointing at the right-edge tip — two short
              // strokes meeting at `endMarkerX,endMarkerY`. Sized off the
              // connector stroke so it scales with the line weight.
              d={`M ${endMarkerX - connectorStrokePx * 3} ${endMarkerY - connectorStrokePx * 3} L ${endMarkerX} ${endMarkerY} L ${endMarkerX - connectorStrokePx * 3} ${endMarkerY + connectorStrokePx * 3}`}
              fill="none"
              stroke={connectorColor}
              strokeWidth={connectorStrokePx}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: endMarkerOpacity }}
            />
          ) : null}
        </svg>
      ) : null}

      {/* Left icon — slides in from off-LEFT. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: iconOpacity,
          transform: `translateX(${leftX}px)`,
          zIndex: 1,
        }}
      >
        <AppIconTile icon={left} sizePx={iconSizePx} />
      </div>

      {/* Right icon — slides in from off-RIGHT. */}
      <div
        style={{
          position: "absolute",
          left: widthPx - iconSizePx,
          top: 0,
          opacity: iconOpacity,
          transform: `translateX(${rightX}px)`,
          zIndex: 1,
        }}
      >
        <AppIconTile icon={right} sizePx={iconSizePx} />
      </div>
    </div>
  );
};
