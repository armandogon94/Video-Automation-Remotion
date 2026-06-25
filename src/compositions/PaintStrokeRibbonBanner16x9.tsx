/**
 * PaintStrokeRibbonBanner16x9 — aiexplained's hand-painted numbered section banner.
 *
 * SOURCE (aiexplained back-catalog):
 *   - 2AdkSYWB6LY/04.jpg  "8. Image to Text Abilities Analysed"  (clearest)
 *   - KKF7kL0pGc4/05.jpg
 *   - dbgL00a7_xs/03.jpg
 *
 * Pattern: over a faint light document area, an IRREGULAR hand-painted
 * hot-pink/magenta brush-stroke ribbon (rough top/bottom edges + a few stray
 * paint-fleck droplets to the right of the stroke) sits as a lower-third /
 * section banner. On top: a leading section NUMBER ("8.") and a white
 * transitional-serif ITALIC title. The whole stroke WIPES IN left→right like a
 * brush being dragged across the screen, then the number + text settle on.
 *
 * Palette discipline (aiexplained): bright near-white document bg + ONE
 * saturated magenta accent + white text. No glow, no gradients on the type.
 *
 * Headless-render gotchas honored:
 *   - SOLID white title color (no background-clip:text) so the type isn't an
 *     opaque box in headless renders.
 *   - No Date.now / Math.random — all jitter is derived from a deterministic
 *     seeded PRNG so the brush shape + flecks are stable across renders.
 *   - Composition id has no underscore.
 *
 * Default timing (120f @ 30fps = 4.0s):
 *    0–48f   brush wipes in L→R (expanding clipPath, eased like a drag)
 *   18–40f   section number pops in (spring)
 *   30–58f   title slides up + fades in (settles after the stroke passes it)
 *   96–120f  whole banner fades out
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema — every field has a DEMO default so {} props renders real content.
// ─────────────────────────────────────────────────────────────────────────────

export const paintStrokeRibbonBannerSchema = z.object({
  /** Leading section number, shown before the title (e.g. "8"). */
  number: z.string().default("8"),
  /** Banner title text (serif italic). */
  title: z.string().default("Image to Text Abilities Analysed"),
  /** Hand-painted ribbon color. Default = aiexplained hot magenta. */
  strokeColor: z.string().default("#E6147D"),
  /** Number + title color. Default white. */
  textColor: z.string().default("#FFFFFF"),
  /** Use serif-italic type (true, the aiexplained look) vs upright sans. */
  serif: z.boolean().default(true),
  /** Vertical placement of the ribbon. */
  position: z.enum(["lower-third", "center"]).default("lower-third"),
  /** Faint document/content area above the banner (aiexplained light bg). */
  showContentArea: z.boolean().default(true),
  /** Page background behind everything. */
  backgroundColor: z.string().default("#FFFFFF"),
});

export type PaintStrokeRibbonBanner16x9Props = z.infer<
  typeof paintStrokeRibbonBannerSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing (frames @ 30fps default)
// ─────────────────────────────────────────────────────────────────────────────

const WIPE = { start: 0, end: 48 } as const;
const NUMBER_POP = { start: 18 } as const;
const TITLE_IN = { start: 30, end: 58 } as const;
const FADE_OUT = { start: 96, end: 120 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry — the SVG canvas the brush lives in (matches comp aspect 16:9).
// ─────────────────────────────────────────────────────────────────────────────

const VB_W = 1920;
const VB_H = 1080;

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic PRNG — mulberry32. No Math.random (unavailable in some render
// contexts); seeded so the brush + flecks are byte-stable across renders.
// ─────────────────────────────────────────────────────────────────────────────

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build an irregular hand-painted brush-ribbon path with rough top/bottom
 * edges. The stroke spans [x0,x1] horizontally and is centered on cy with a
 * nominal half-height of h; both edges wobble via the seeded RNG so the ribbon
 * reads as a single dragged brush rather than a clean rectangle.
 */
function buildBrushPath(
  x0: number,
  x1: number,
  cy: number,
  h: number,
  rng: () => number,
): string {
  const steps = 26;
  const span = x1 - x0;
  const top: Array<[number, number]> = [];
  const bottom: Array<[number, number]> = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + span * t;
    // Taper the ends so the stroke thins like a real brush lift-off.
    const endTaper = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.45;
    const baseH = h * (0.55 + 0.45 * endTaper);
    const wobbleTop = (rng() - 0.5) * h * 0.42;
    const wobbleBot = (rng() - 0.5) * h * 0.42;
    top.push([x, cy - baseH + wobbleTop]);
    bottom.push([x, cy + baseH + wobbleBot]);
  }

  // Smooth the edges with quadratic segments through midpoints (rough but flowy).
  const toSmooth = (pts: Array<[number, number]>): string => {
    let d = "";
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [cx, cyy] = pts[i];
      const mx = (px + cx) / 2;
      const my = (py + cyy) / 2;
      d += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
    return d;
  };

  const [sx, sy] = top[0];
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  d += toSmooth(top);
  // round the right cap down to the bottom edge
  const rightTop = top[top.length - 1];
  const rightBot = bottom[bottom.length - 1];
  d += ` Q ${(rightTop[0] + h * 0.5).toFixed(1)} ${cy.toFixed(1)} ${rightBot[0].toFixed(1)} ${rightBot[1].toFixed(1)}`;
  // walk the bottom edge back to the left
  const bottomRev = [...bottom].reverse();
  d += toSmooth(bottomRev);
  // round the left cap back up
  const leftBot = bottomRev[bottomRev.length - 1];
  d += ` Q ${(leftBot[0] - h * 0.5).toFixed(1)} ${cy.toFixed(1)} ${sx.toFixed(1)} ${sy.toFixed(1)} Z`;
  return d;
}

interface Fleck {
  cx: number;
  cy: number;
  r: number;
}

/** A few stray paint-fleck droplets flung off the right end of the stroke. */
function buildFlecks(x1: number, cy: number, h: number, rng: () => number): Fleck[] {
  const n = 6;
  const flecks: Fleck[] = [];
  for (let i = 0; i < n; i++) {
    flecks.push({
      cx: x1 + 20 + rng() * h * 1.6,
      cy: cy + (rng() - 0.5) * h * 2.4,
      r: 4 + rng() * 11,
    });
  }
  return flecks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const PaintStrokeRibbonBanner16x9: React.FC<
  PaintStrokeRibbonBanner16x9Props
> = ({
  number,
  title,
  strokeColor,
  textColor,
  serif,
  position,
  showContentArea,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ribbon vertical center + thickness, by position.
  const cy = position === "center" ? VB_H * 0.5 : VB_H * 0.66;
  const half = 86; // nominal brush half-height in viewBox units

  // Deterministic shape (stable seed → identical across renders).
  const path = React.useMemo(() => {
    const rng = makeRng(0x9e3779b1);
    return buildBrushPath(140, 1520, cy, half, rng);
  }, [cy]);
  const flecks = React.useMemo(() => {
    const rng = makeRng(0x1234abcd);
    return buildFlecks(1520, cy, half, rng);
  }, [cy]);

  // Brush wipe: reveal width grows L→R. Ease like a hand dragging the brush —
  // quick start, slight settle — via Easing.out(cubic).
  const wipeProgress = interpolate(frame, [WIPE.start, WIPE.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Reveal extends a bit past the stroke so the flecks pop in last.
  const revealW = interpolate(wipeProgress, [0, 1], [0, VB_W]);

  // Section number: spring pop once the brush front has passed its position.
  const numberSpring = spring({
    frame: frame - NUMBER_POP.start,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });
  const numberScale = interpolate(numberSpring, [0, 1], [0.4, 1]);
  const numberOpacity = interpolate(
    frame,
    [NUMBER_POP.start, NUMBER_POP.start + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Title: slide up + fade in after the stroke has swept across it.
  const titleIn = interpolate(frame, [TITLE_IN.start, TITLE_IN.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const titleY = interpolate(titleIn, [0, 1], [22, 0]);

  // Whole-banner fade out.
  const bannerFade = interpolate(frame, [FADE_OUT.start, FADE_OUT.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleFontFamily = serif ? FONT_STACKS.serifItalic : FONT_STACKS.sans;
  const titleFontStyle: React.CSSProperties["fontStyle"] = serif
    ? "italic"
    : "normal";

  // Text vertical center matches the ribbon center (% of canvas).
  const textTopPct = (cy / VB_H) * 100;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Faint document / content area above the banner (aiexplained light bg) */}
      {showContentArea ? (
        <ContentArea cyPct={textTopPct} ink={BRAND.colors.text} />
      ) : null}

      {/* The hand-painted ribbon + flecks, with the brush wipe-in clipPath. */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: bannerFade }}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Expanding rect = the brush front sweeping left→right. */}
          <clipPath id="psrb-wipe">
            <rect x={0} y={0} width={revealW} height={VB_H} />
          </clipPath>
          {/* Subtle inner darkening near the bottom edge for paint depth. */}
          <linearGradient id="psrb-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
            <stop offset="42%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.16} />
          </linearGradient>
        </defs>

        <g clipPath="url(#psrb-wipe)">
          {/* Main ribbon */}
          <path d={path} fill={strokeColor} />
          {/* Paint depth shading following the same shape */}
          <path d={path} fill="url(#psrb-shade)" />
          {/* Stray paint flecks flung off the right end */}
          {flecks.map((f, i) => (
            <circle
              key={i}
              cx={f.cx}
              cy={f.cy}
              r={f.r}
              fill={strokeColor}
              opacity={0.92 - i * 0.06}
            />
          ))}
        </g>
      </svg>

      {/* Number + title typeset on top of the ribbon. */}
      <AbsoluteFill style={{ opacity: bannerFade }}>
        <div
          style={{
            position: "absolute",
            left: "9%",
            top: `${textTopPct}%`,
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "baseline",
            gap: 22,
            maxWidth: "78%",
          }}
        >
          {/* Section number */}
          <div
            style={{
              fontFamily: titleFontFamily,
              fontStyle: titleFontStyle,
              fontWeight: 700,
              fontSize: 92,
              lineHeight: 1,
              color: textColor,
              transform: `scale(${numberScale})`,
              transformOrigin: "left bottom",
              opacity: numberOpacity,
              whiteSpace: "nowrap",
            }}
          >
            {number}.
          </div>

          {/* Title */}
          <div
            style={{
              fontFamily: titleFontFamily,
              fontStyle: titleFontStyle,
              fontWeight: 600,
              fontSize: 78,
              lineHeight: 1.05,
              color: textColor,
              opacity: titleIn,
              transform: `translateY(${titleY}px)`,
              textShadow: "0 2px 10px rgba(0,0,0,0.18)",
            }}
          >
            {title}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Faint content area above the banner — mimics aiexplained's document frame:
// a small uppercase label + a few light placeholder text lines.
// ─────────────────────────────────────────────────────────────────────────────

const ContentArea: React.FC<{ cyPct: number; ink: string }> = ({
  cyPct,
  ink,
}) => {
  const lineColor = `${ink}22`;
  const lines = [0.62, 0.78, 0.7, 0.55, 0.66, 0.4];
  return (
    <div
      style={{
        position: "absolute",
        left: "9%",
        right: "12%",
        top: "10%",
        // keep the document clear of the banner area
        bottom: `${100 - cyPct + 12}%`,
        opacity: 0.9,
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: ink,
          marginBottom: 8,
        }}
      >
        Visual inputs
      </div>
      {lines.map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            width: `${Math.round(w * 100)}%`,
            backgroundColor: lineColor,
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
};

export default PaintStrokeRibbonBanner16x9;
