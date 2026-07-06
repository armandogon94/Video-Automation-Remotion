/**
 * FeedbackLoopCycleCore — circular feedback-loop (process-cycle) diagram.
 *
 * SOURCE (austin.marchese new-video study, 2026-07-06)
 * -----------------------------------------------------
 * Replicates the process-cycle pattern from austin.marchese video HGCHgD4uGgY
 * (t≈450–470): 2–6 liquid-glass STATION chips placed evenly on an implied
 * ellipse, popping in sequentially; after each station lands, a DASHED ARC
 * draws along the ellipse to the NEXT station, capped by a small arrowhead
 * that fades in as the arc completes. The last arc closes the cycle back to
 * station 1. The library already has linear PipelineFlow and network
 * RingTopology — this fills the missing "process cycle" slot.
 *
 * STRUCTURE (aspect-pair de-duplication)
 * --------------------------------------
 * This file is the FULL implementation, layout-agnostic via useVideoConfig()
 * (all geometry is fraction-of-canvas driven). `FeedbackLoopCycle16x9.tsx` and
 * `FeedbackLoopCycle9x16.tsx` are thin wrappers that only tune default props
 * (ellipse proportions, card width, font sizes). Register the wrappers in
 * Root.tsx with content-driven durations via `calcFeedbackLoopDuration`.
 *
 * MOTION GRAMMAR (all frame-deterministic — no Math.random / Date.now)
 * --------------------------------------------------------------------
 *   - Intro (15f): kicker + title fade/slide in at the top.
 *   - Station i pops at INTRO + i·30 (scale 0.92→1 spring + fade, 12f).
 *   - Arc i (station i → i+1) draws over the next 18f via an SVG mask whose
 *     white stroke's dashoffset animates pathLength→0 (interpolate, outCubic,
 *     clamped) — revealing a DASHED stroke so the dashes appear to draw along
 *     the arc. A static-shape arrowhead (oriented along the path tangent)
 *     fades in as the arc completes. Arc i finishes exactly when station i+1
 *     pops — the cycle hands off beat to beat.
 *   - IDLE (never a frozen tail — repo motion-defect #1): after the build the
 *     station rims pulse (GlowPulse-style glow-intensity oscillation, ~1.5s
 *     cycle, glassGlow token colors) and the dashes CRAWL continuously along
 *     every arc (small strokeDashoffset drift, modulo the dash period).
 *
 * THEMING: all colors derive from LG_THEMES (src/components/liquidglass/tokens)
 * + BRAND — no hardcoded brand hexes. No background-clip:text anywhere.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";
import {
  glassCardStyle,
  glassGlow,
  lgTheme,
  withAlpha,
  type LiquidGlassThemeTokens,
} from "../components/liquidglass/tokens";

// ─── Timing constants (30fps grid; formula is fps-agnostic in frames) ───────
const INTRO_FRAMES = 15;
const POP_FRAMES = 12;
const ARC_FRAMES = 18;
const STEP_FRAMES = POP_FRAMES + ARC_FRAMES; // 30 — one full station beat
const GLOW_PULSE_PERIOD_FRAMES = 45; // ~1.5s at 30fps
const DASH_ON = 16;
const DASH_GAP = 12;
const DASH_PERIOD = DASH_ON + DASH_GAP;
const DASH_CRAWL_PX_PER_FRAME = 0.45; // subtle idle drift along the arcs

/**
 * Content-driven duration (repo rule: literal durations truncate content):
 *   intro(15) + stations.length × (12 pop + 18 arc) + hold × fps.
 */
export function calcFeedbackLoopDuration(
  stations: unknown[],
  holdSeconds: number,
  fps: number,
): number {
  return (
    INTRO_FRAMES + stations.length * STEP_FRAMES + Math.round(holdSeconds * fps)
  );
}

// ─── Schema (zod v4 — every field defaulted so schema.parse({}) is complete) ─
const stationSchema = z.object({
  /** Short 1–2 line chip title. */
  title: z.string(),
  /** Optional tiny italic note rendered below the chip. */
  note: z.string().default(""),
});
export type FeedbackLoopStation = z.infer<typeof stationSchema>;

export const feedbackLoopCycleSchema = z.object({
  /** Small mono uppercase tracking-wide eyebrow above the title. */
  kicker: z.string().default("PROCESO · LOOP"),
  /** Headline at the top of the frame. */
  title: z.string().default("El loop de optimización"),
  /** 2–6 cycle stations, placed counterclockwise starting at the top. */
  stations: z
    .array(stationSchema)
    .min(2)
    .max(6)
    .default([
      { title: "Elige una meta específica", note: "" },
      { title: "Mide el resultado", note: "si no cumple la meta" },
      { title: "Propón una solución y aplícala", note: "" },
      { title: "Vuelve a medir y continúa", note: "" },
    ]),
  /** Optional label in the middle of the ellipse (fades in after the build). */
  centerLabel: z.string().default(""),
  /** Liquid-glass theme — drives ALL colors (brand / warm / cool). */
  theme: z.enum(["brand", "warm", "cool"]).default("brand"),
  /** Idle-hold after the cycle closes (glow pulse + dash crawl continue). */
  holdSeconds: z.number().min(0).default(2),

  // Layout knobs — tuned per aspect by the thin wrappers.
  /** Ellipse horizontal radius as a fraction of canvas WIDTH. */
  ellipseRadiusXFrac: z.number().min(0.1).max(0.45).default(0.3),
  /** Ellipse vertical radius as a fraction of canvas HEIGHT. */
  ellipseRadiusYFrac: z.number().min(0.1).max(0.45).default(0.26),
  /** Ellipse center Y as a fraction of canvas height. */
  centerYFrac: z.number().min(0.3).max(0.7).default(0.58),
  /** Header (kicker) top edge as a fraction of canvas height. */
  headerTopFrac: z.number().min(0).max(0.3).default(0.055),
  /** Station chip width in px. */
  cardWidth: z.number().min(160).max(640).default(340),
  /** Station chip title font size in px. */
  stationFontSize: z.number().min(16).max(60).default(30),
  /** Headline font size in px. */
  titleFontSize: z.number().min(24).max(140).default(64),
  /** Angular padding (deg) trimmed off each arc end so arcs meet card EDGES. */
  arcTrimDeg: z.number().min(5).max(45).default(24),
});
export type FeedbackLoopCycleProps = z.infer<typeof feedbackLoopCycleSchema>;

// ─── Arc geometry (sampled elliptical polyline, counterclockwise) ───────────
interface ArcGeom {
  d: string;
  length: number;
  endX: number;
  endY: number;
  /** Tangent direction at the arc end, in degrees (for the arrowhead). */
  endAngleDeg: number;
}

function buildArc(
  fromDeg: number,
  toDeg: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  trimDeg: number,
): ArcGeom {
  // Counterclockwise on screen = decreasing angle; trim both ends so the arc
  // starts/ends at the card edges instead of under the cards.
  const a0 = fromDeg - trimDeg;
  const a1 = toDeg + trimDeg;
  const steps = 40;
  const pts: Array<{ x: number; y: number }> = [];
  for (let s = 0; s <= steps; s++) {
    const deg = a0 + ((a1 - a0) * s) / steps;
    const rad = (deg * Math.PI) / 180;
    pts.push({ x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) });
  }
  let length = 0;
  for (let s = 1; s <= steps; s++) {
    length += Math.hypot(pts[s].x - pts[s - 1].x, pts[s].y - pts[s - 1].y);
  }
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const tail = pts[steps];
  const prev = pts[steps - 1];
  const endAngleDeg =
    (Math.atan2(tail.y - prev.y, tail.x - prev.x) * 180) / Math.PI;
  return { d, length, endX: tail.x, endY: tail.y, endAngleDeg };
}

// ─── Station chip (liquid-glass, pop-in spring + idle glow pulse) ───────────
const StationChip: React.FC<{
  station: FeedbackLoopStation;
  x: number;
  y: number;
  popStartFrame: number;
  buildEndFrame: number;
  cardWidth: number;
  fontSize: number;
  theme: FeedbackLoopCycleProps["theme"];
  tokens: LiquidGlassThemeTokens;
}> = ({
  station,
  x,
  y,
  popStartFrame,
  buildEndFrame,
  cardWidth,
  fontSize,
  theme,
  tokens,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - popStartFrame);

  const pop = spring({
    frame: local,
    fps,
    config: { damping: 20, stiffness: 150, mass: 0.8 },
    durationInFrames: POP_FRAMES,
  });
  const scale = interpolate(pop, [0, 1], [0.92, 1]);
  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow: ramps in with the pop, then PULSES after the build completes
  // (GlowPulse-style opacity oscillation, ~1.5s period) — the idle motion.
  const glowRamp = interpolate(local, [0, POP_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse =
    frame >= buildEndFrame
      ? 0.22 *
        Math.sin(
          ((frame - buildEndFrame) / GLOW_PULSE_PERIOD_FRAMES) * Math.PI * 2,
        )
      : 0;
  const glowIntensity = glowRamp * (0.6 + pulse);
  const glass = glassCardStyle({ theme, radius: 20, padding: "18px 22px" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: cardWidth,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          ...glass,
          boxShadow: `${String(glass.boxShadow)}, ${glassGlow(tokens.glow, 20, glowIntensity)}`,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize,
            lineHeight: 1.22,
            letterSpacing: "-0.01em",
            color: tokens.inkOnGlass, // solid ink — no background-clip.
          }}
        >
          {station.title}
        </div>
      </div>
      {station.note ? (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 10,
            maxWidth: cardWidth * 1.15,
            fontFamily: FONT_STACKS.serifItalic,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: Math.round(fontSize * 0.72),
            lineHeight: 1.25,
            textAlign: "center",
            color: withAlpha(tokens.accent, 0.92),
            whiteSpace: "nowrap",
          }}
        >
          {station.note}
        </div>
      ) : null}
    </div>
  );
};

// ─── Composition core ────────────────────────────────────────────────────────
export const FeedbackLoopCycleCore: React.FC<FeedbackLoopCycleProps> = ({
  kicker,
  title,
  stations,
  centerLabel,
  theme,
  holdSeconds,
  ellipseRadiusXFrac,
  ellipseRadiusYFrac,
  centerYFrac,
  headerTopFrac,
  cardWidth,
  stationFontSize,
  titleFontSize,
  arcTrimDeg,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tokens = lgTheme(theme);
  void holdSeconds; // consumed by calcFeedbackLoopDuration in Root's metadata

  const n = Math.max(2, stations.length);
  const cx = width / 2;
  const cy = height * centerYFrac;
  const rx = width * ellipseRadiusXFrac;
  const ry = height * ellipseRadiusYFrac;
  const sweep = 360 / n;
  const buildEnd = INTRO_FRAMES + n * STEP_FRAMES;

  // Station i sits at -90° − i·sweep (top first, then counterclockwise:
  // for the default N=4 → top, left, bottom, right).
  const stationDeg = (i: number): number => -90 - i * sweep;
  const stationPos = (i: number): { x: number; y: number } => {
    const rad = (stationDeg(i) * Math.PI) / 180;
    return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) };
  };

  // Header entrance (intro beat).
  const headerOpacity = interpolate(frame, [0, INTRO_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerShift = interpolate(frame, [0, INTRO_FRAMES], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Center label fades in once the cycle closes.
  const centerOpacity = interpolate(
    frame,
    [buildEnd - 6, buildEnd + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Idle dash crawl — continuous, so the tail is never frozen.
  const crawlOffset = -((frame * DASH_CRAWL_PX_PER_FRAME) % DASH_PERIOD);

  // Backdrop: deep navy with a soft theme-tinted top glow (flat vignette).
  // NOTE: keep this a simple 2-stop radial — a 3-stop variant with two
  // low-alpha glow stops rendered as hard banded rings in headless Chromium.
  const bgGradient = `radial-gradient(120% 90% at 50% 24%, ${withAlpha(
    tokens.glow,
    0.055,
  )} 0%, ${BRAND.colors.backgroundDark} 55%, rgba(4, 8, 16, 1) 100%)`;

  return (
    <AbsoluteFill
      style={{ background: bgGradient, fontFamily: FONT_STACKS.sans }}
    >
      {/* ── Header: kicker + title ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: height * headerTopFrac,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
          transform: `translateY(${headerShift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: Math.round(titleFontSize * 0.42),
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: tokens.accent,
            marginBottom: 16,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: titleFontSize,
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            color: tokens.inkOnGlass,
            margin: "0 auto",
            maxWidth: width * 0.86,
          }}
        >
          {title}
        </div>
      </div>

      {/* ── Dashed arcs + arrowheads (under the chips) ─────────────────── */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          {stations.map((_, i) => {
            const arcStart = INTRO_FRAMES + i * STEP_FRAMES + POP_FRAMES;
            const geom = buildArc(
              stationDeg(i),
              stationDeg(i + 1),
              cx,
              cy,
              rx,
              ry,
              arcTrimDeg,
            );
            const progress = interpolate(
              frame - arcStart,
              [0, ARC_FRAMES],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            return (
              <mask
                key={`flc-mask-${i}`}
                id={`flc-arc-mask-${i}`}
                maskUnits="userSpaceOnUse"
              >
                {/* Solid reveal stroke: dashoffset length→0 draws the arc. */}
                <path
                  d={geom.d}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeDasharray={`${geom.length}`}
                  strokeDashoffset={geom.length * (1 - progress)}
                />
              </mask>
            );
          })}
        </defs>
        {stations.map((_, i) => {
          const arcStart = INTRO_FRAMES + i * STEP_FRAMES + POP_FRAMES;
          const geom = buildArc(
            stationDeg(i),
            stationDeg(i + 1),
            cx,
            cy,
            rx,
            ry,
            arcTrimDeg,
          );
          const arrowOpacity = interpolate(
            frame - arcStart,
            [ARC_FRAMES - 2, ARC_FRAMES + 4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <g key={`flc-arc-${i}`}>
              <g mask={`url(#flc-arc-mask-${i})`}>
                {/* The visible DASHED stroke — its dashes crawl forever. */}
                <path
                  d={geom.d}
                  fill="none"
                  stroke={withAlpha(tokens.glow, 0.9)}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={`${DASH_ON} ${DASH_GAP}`}
                  strokeDashoffset={crawlOffset}
                />
              </g>
              {/* Arrowhead: oriented along the path tangent at the arc end. */}
              <g
                transform={`translate(${geom.endX.toFixed(2)} ${geom.endY.toFixed(
                  2,
                )}) rotate(${geom.endAngleDeg.toFixed(2)})`}
                opacity={arrowOpacity}
              >
                <polygon points="10,0 -10,-9 -10,9" fill={tokens.glow} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── Station chips ──────────────────────────────────────────────── */}
      {stations.map((station, i) => {
        const pos = stationPos(i);
        return (
          <StationChip
            key={`flc-station-${i}`}
            station={station}
            x={pos.x}
            y={pos.y}
            popStartFrame={INTRO_FRAMES + i * STEP_FRAMES}
            buildEndFrame={buildEnd}
            cardWidth={cardWidth}
            fontSize={stationFontSize}
            theme={theme}
            tokens={tokens}
          />
        );
      })}

      {/* ── Optional center label ──────────────────────────────────────── */}
      {centerLabel ? (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            transform: "translate(-50%, -50%)",
            maxWidth: rx * 1.2,
            textAlign: "center",
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: Math.round(stationFontSize * 0.9),
            letterSpacing: "0.08em",
            lineHeight: 1.3,
            color: withAlpha(tokens.inkOnGlass, 0.78),
            opacity: centerOpacity,
          }}
        >
          {centerLabel}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
