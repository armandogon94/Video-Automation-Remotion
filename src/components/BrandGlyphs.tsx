/**
 * BrandGlyphs — decorative brand primitives (LogoWall, PixelMascot, MockOSChrome).
 *
 * Three sibling components ship from one file so we get a single import surface
 * for "brand-glyph" type decorative chrome:
 *   - `<LogoWall>`        — Wave-4 N13 / consensus MED finding: credibility wall.
 *                           Grid of vendor logos that pops in row by row (Carlos /
 *                           DIYSmart "trusted by" pattern, e.g. diysmartcode
 *                           `fpNTqli9cs8` frame-03's 6x4 vendor grid).
 *   - `<PixelMascot>`     — Wave-4 T1 brand-specific pixel intro (Carlos's chunky
 *                           8-bit orange mascot). Rendered as an SVG-driven 12x12
 *                           pixel grid so there's no per-creator PNG dependency.
 *   - `<MockOSChrome>`    — Wave-4 Bilawal mock-OS chrome (Anduril Lattice-style
 *                           classification banner + corner brackets + REC dot +
 *                           left icon rail). Pure SVG/CSS — no external assets.
 *
 * All three are stateless React.FC primitives. Where motion is needed we read
 * `useCurrentFrame()` + `useVideoConfig()` and compose `staggerEntry` from the
 * shared animation kit instead of hand-rolling timing per call site.
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
import { FONT_STACKS } from "../brand";
import { staggerEntry } from "../animation";

// ---------------------------------------------------------------------------
// <LogoWall>
// ---------------------------------------------------------------------------

export interface LogoWallLogo {
  /** Display name shown as fallback if no svg. */
  name: string;
  /** Optional path to logo asset (relative to /public). */
  logoSrc?: string;
  /** Optional brand color used for fallback initials block. */
  brandColor?: string;
  /** Optional URL — purely metadata (not rendered). */
  href?: string;
}

export interface LogoWallProps {
  logos: LogoWallLogo[];
  columns?: number;
  cellSize?: number;
  gap?: number;
  /** Card container background. Default white card with subtle shadow. */
  background?: string;
  /** Padding inside card. Default 24. */
  padding?: number;
  /** Staggered reveal — logos pop in row by row. Default true. */
  staggerReveal?: boolean;
  startFrame?: number;
  /** Per-cell stagger in frames (default 2 — fast cascade). */
  staggerFrames?: number;
}

/** Resolve a logo src — pass through absolute URLs, route everything else
 *  through Remotion's `staticFile` so it works in Studio + headless renders. */
function resolveLogoSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  // `staticFile` already tolerates a leading slash — strip it for consistency.
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

function initialsOf(name: string): string {
  const cleaned = name.trim();
  if (cleaned.length === 0) return "??";
  // Prefer the first letter of the first two whitespace-separated tokens;
  // fall back to the first two characters of a single-token name.
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

const LogoCell: React.FC<{
  logo: LogoWallLogo;
  cellSize: number;
  enterFrame: number;
}> = ({ logo, cellSize, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fast, slightly-overshooting pop-in. `spring` is clamped past 1 so the cell
  // settles without bouncing visibly past the grid lines.
  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.6 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(progress, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fallbackColor = logo.brandColor ?? "#E0E0E0";

  return (
    <div
      style={{
        width: cellSize,
        height: cellSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {logo.logoSrc ? (
        <Img
          src={resolveLogoSrc(logo.logoSrc)}
          style={{
            maxWidth: "80%",
            maxHeight: "80%",
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: fallbackColor,
            borderRadius: 8,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: Math.round(cellSize * 0.38),
            color: "#FFFFFF",
            letterSpacing: "0.04em",
            textShadow: "0 1px 2px rgba(0,0,0,0.18)",
          }}
        >
          {initialsOf(logo.name)}
        </div>
      )}
    </div>
  );
};

export const LogoWall: React.FC<LogoWallProps> = ({
  logos,
  columns = 6,
  cellSize = 120,
  gap = 16,
  background = "#FFFFFF",
  padding = 24,
  staggerReveal = true,
  startFrame = 0,
  staggerFrames = 2,
}) => {
  if (logos.length === 0) return null;
  const safeColumns = Math.max(1, columns);

  return (
    <div
      style={{
        display: "inline-block",
        background,
        padding,
        borderRadius: 16,
        boxShadow: "0 12px 32px rgba(15, 27, 45, 0.18)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${safeColumns}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
          gap,
        }}
      >
        {logos.map((logo, idx) => {
          // Row-major stagger so each row pops in as a unit (rather than cell-
          // by-cell snaking, which reads as noise on a 6x4 grid).
          const row = Math.floor(idx / safeColumns);
          const col = idx % safeColumns;
          const orderIndex = staggerReveal ? row * safeColumns + col : 0;
          const enterFrame = staggerReveal
            ? staggerEntry({
                index: orderIndex,
                baseStartFrame: startFrame,
                staggerFrames,
              })
            : startFrame;
          return (
            <LogoCell
              key={`logo-${idx}-${logo.name}`}
              logo={logo}
              cellSize={cellSize}
              enterFrame={enterFrame}
            />
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// <PixelMascot>
// ---------------------------------------------------------------------------

export interface PixelMascotProps {
  /** Size in px (default 240 — composition is 12x12 pixel grid). */
  size?: number;
  /** Primary color (orange default per Carlos). */
  primaryColor?: string;
  /** Secondary color (eyes/highlights). */
  secondaryColor?: string;
  /** Optional bobbing animation amplitude in px (default 8). 0 = static. */
  bobAmplitude?: number;
  /** Bob frequency in Hz. Default 1.2. */
  bobHz?: number;
  /** Optional glow halo behind mascot. */
  glow?: boolean;
  /** Glow color (defaults to primaryColor at 30%). */
  glowColor?: string;
}

/**
 * 12x12 pixel grid. Digits map to:
 *   0 — empty (transparent)
 *   1 — primary color (orange body)
 *   2 — secondary color (dark — eyes / mouth)
 *
 * Reads as a chunky 8-bit "AI head" with two pixel eyes and a smile.
 */
const MASCOT_GRID: ReadonlyArray<ReadonlyArray<0 | 1 | 2>> = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
  [0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 0],
  [0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0],
] as const;

const GRID_SIZE = MASCOT_GRID.length;

export const PixelMascot: React.FC<PixelMascotProps> = ({
  size = 240,
  primaryColor = "#D97757",
  secondaryColor = "#1A1A1A",
  bobAmplitude = 8,
  bobHz = 1.2,
  glow = false,
  glowColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const seconds = frame / fps;
  const bobOffset =
    bobAmplitude === 0
      ? 0
      : Math.sin(seconds * bobHz * Math.PI * 2) * bobAmplitude;

  const cell = size / GRID_SIZE;
  const resolvedGlow = glowColor ?? `${primaryColor}4D`; // 4D ≈ 30% alpha hex.

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `translateY(${bobOffset}px)`,
        // `image-rendering: pixelated` keeps any downstream scaling crisp.
        imageRendering: "pixelated",
      }}
    >
      {glow ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -size * 0.25,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${resolvedGlow} 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "relative", display: "block" }}
        shapeRendering="crispEdges"
      >
        {MASCOT_GRID.map((row, y) =>
          row.map((value, x) => {
            if (value === 0) return null;
            const fill = value === 1 ? primaryColor : secondaryColor;
            return (
              <rect
                key={`p-${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill={fill}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// <MockOSChrome>
// ---------------------------------------------------------------------------

export interface MockOSChromeProps {
  /** Brand title (default "ARMANDO INTELLIGENCE"). */
  brandTitle?: string;
  /** Classification line (e.g. "CLASSIFICATION: SECRET//NOFORN" — parody pattern). */
  classification?: string;
  /** Timestamp shown top-right. */
  timestamp?: string;
  /** Show corner viewfinder brackets (default true). */
  showCornerBrackets?: boolean;
  /** Show "● REC" pulsing indicator (default true). */
  showRecIndicator?: boolean;
  /** Show left vertical icon rail (default true). 4 stacked monochrome icons. */
  showIconRail?: boolean;
  /** Width/height of the active area inside the chrome. Default 1080×1920. */
  width?: number;
  height?: number;
  /** Accent color (default green night-vision tint). */
  accentColor?: string;
}

/** Corner viewfinder bracket — an L of two stroked lines. `corner` selects
 *  which of the four corners this bracket sits in. Legs are 40px long. */
const CornerBracket: React.FC<{
  corner: "tl" | "tr" | "bl" | "br";
  color: string;
  leg?: number;
  thickness?: number;
  inset?: number;
}> = ({ corner, color, leg = 40, thickness = 3, inset = 32 }) => {
  const isTop = corner === "tl" || corner === "tr";
  const isLeft = corner === "tl" || corner === "bl";

  const position: React.CSSProperties = {
    position: "absolute",
    width: leg,
    height: leg,
    [isTop ? "top" : "bottom"]: inset,
    [isLeft ? "left" : "right"]: inset,
  };

  // Two absolutely-positioned bars form the L.
  return (
    <div style={position} aria-hidden>
      {/* Horizontal leg */}
      <div
        style={{
          position: "absolute",
          [isTop ? "top" : "bottom"]: 0,
          [isLeft ? "left" : "right"]: 0,
          width: leg,
          height: thickness,
          background: color,
        }}
      />
      {/* Vertical leg */}
      <div
        style={{
          position: "absolute",
          [isTop ? "top" : "bottom"]: 0,
          [isLeft ? "left" : "right"]: 0,
          width: thickness,
          height: leg,
          background: color,
        }}
      />
    </div>
  );
};

/** Tiny monochrome icon for the left rail — pure SVG, no external deps. */
const RailIcon: React.FC<{
  kind: "crosshair" | "satellite" | "waveform" | "stack";
  color: string;
  size?: number;
}> = ({ kind, color, size = 28 }) => {
  const stroke = { stroke: color, strokeWidth: 2, fill: "none" } as const;
  switch (kind) {
    case "crosshair":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={8} {...stroke} />
          <line x1={12} y1={2} x2={12} y2={6} {...stroke} />
          <line x1={12} y1={18} x2={12} y2={22} {...stroke} />
          <line x1={2} y1={12} x2={6} y2={12} {...stroke} />
          <line x1={18} y1={12} x2={22} y2={12} {...stroke} />
        </svg>
      );
    case "satellite":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={3} fill={color} />
          <path d="M4 12 A 8 8 0 0 1 20 12" {...stroke} />
          <path d="M7 12 A 5 5 0 0 1 17 12" {...stroke} />
        </svg>
      );
    case "waveform":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <line x1={3} y1={12} x2={3} y2={12} {...stroke} />
          <line x1={7} y1={8} x2={7} y2={16} {...stroke} />
          <line x1={11} y1={4} x2={11} y2={20} {...stroke} />
          <line x1={15} y1={9} x2={15} y2={15} {...stroke} />
          <line x1={19} y1={6} x2={19} y2={18} {...stroke} />
        </svg>
      );
    case "stack":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x={4} y={5} width={16} height={3} {...stroke} />
          <rect x={4} y={10} width={16} height={3} {...stroke} />
          <rect x={4} y={15} width={16} height={3} {...stroke} />
        </svg>
      );
  }
};

export const MockOSChrome: React.FC<MockOSChromeProps> = ({
  brandTitle = "ARMANDO INTELLIGENCE",
  classification,
  timestamp,
  showCornerBrackets = true,
  showRecIndicator = true,
  showIconRail = true,
  width = 1080,
  height = 1920,
  accentColor = "#3DDC84",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1Hz pulse for the REC dot. We compute opacity directly (rather than via
  // `interpolate`) since a continuous sine is cheap and avoids snap-back.
  const seconds = frame / fps;
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(seconds * Math.PI * 2));

  const monoCaps: React.CSSProperties = {
    fontFamily: FONT_STACKS.mono,
    color: accentColor,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {/* Top status bar — brand title left, classification center, timestamp right. */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 96,
          right: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span style={{ ...monoCaps, fontSize: 22 }}>{brandTitle}</span>
        {classification ? (
          <span
            style={{
              ...monoCaps,
              fontSize: 18,
              padding: "6px 12px",
              border: `1px solid ${accentColor}`,
              borderRadius: 4,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            {classification}
          </span>
        ) : null}
        {timestamp ? (
          <span style={{ ...monoCaps, fontSize: 20 }}>{timestamp}</span>
        ) : null}
      </div>

      {/* Corner viewfinder brackets (40px legs per spec). */}
      {showCornerBrackets ? (
        <>
          <CornerBracket corner="tl" color={accentColor} />
          <CornerBracket corner="tr" color={accentColor} />
          <CornerBracket corner="bl" color={accentColor} />
          <CornerBracket corner="br" color={accentColor} />
        </>
      ) : null}

      {/* Left vertical icon rail — 4 stacked monochrome icons. */}
      {showIconRail ? (
        <div
          style={{
            position: "absolute",
            left: 36,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            padding: "16px 8px",
            border: `1px solid ${accentColor}66`,
            borderRadius: 6,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <RailIcon kind="crosshair" color={accentColor} />
          <RailIcon kind="satellite" color={accentColor} />
          <RailIcon kind="waveform" color={accentColor} />
          <RailIcon kind="stack" color={accentColor} />
        </div>
      ) : null}

      {/* "● REC" pulsing indicator — top-right under the timestamp. */}
      {showRecIndicator ? (
        <div
          style={{
            position: "absolute",
            top: 130,
            right: 96,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#E63946",
              opacity: pulse,
              boxShadow: `0 0 12px rgba(230,57,70,${pulse * 0.8})`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              color: "#E63946",
              letterSpacing: "0.22em",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            REC
          </span>
        </div>
      ) : null}
    </div>
  );
};
