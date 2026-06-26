/**
 * VennDiagram9x16 — vertical (1080×1920) animated Venn diagram.
 *
 * Wave-5 Tella synthesis T6: 2- or 3-circle Venn with alpha-blended fills and
 * a center-intersection label revealed LAST. Each circle drifts in from
 * off-frame, its outline draws via stroke-dashoffset (pathDraw primitive),
 * then its fill fades in alpha-blended on overlap.
 *
 * Reference frames: docs/research/wave-5/tella-frames-dense/PrGYLd7yu1s/
 *   (Venn range 07:55-09:55, frames 06-07)
 * Synthesis: docs/research/wave-5/tella-motion-graphics-synthesis.md §T6
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Section label chip (tracking-spaced uppercase sans, accent)
 *   - Title (Inter Black ~80px, ink, y ≈ 300)
 *   - SVG viewBox 1080×1000 at y ≈ 500..1500
 *       · 2 or 3 circles: outline strokes draw via stroke-dashoffset; fills
 *         fade in alpha-blended after the outline finishes drawing.
 *       · Per-circle X drift: translateX(±400 → 0) eased over the entry.
 *       · Per-circle label sits at the outer edge of the circle.
 *       · Intersection label fades in LAST in the geometric overlap region.
 *   - Optional EditorialCaption strip at bottom.
 *
 * Motion grammar (verbatim cite from animation-replication-runbook §3.7):
 *   "Each circle drifts in from off-frame, alpha-blending where they overlap;
 *    the center-intersection label fades in last."
 *
 * SSR note: pure SVG + Remotion `interpolate` / `spring` — no DOM measurement,
 * no `window` access, no external libs. Deterministic across SSR + client.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  ALL_PALETTE_MODES,
} from "../brand";
import { pathDraw } from "../animation";

// ─── Schema (co-located — shared schemas.ts is not modified) ────────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const circleSchema_local = z.object({
  label: z.string().default(""),
  sub: z.string().default(""),
  color: z.string().default(""),
  /** Position override (px) — if absent, computed from mode. */
  cx: z.number().optional(),
  cy: z.number().optional(),
  radius: z.number().optional(),
  /** Fill opacity at the body (NOT the outline). Default 0.35 for nice overlap blending. */
  fillOpacity: z.number().default(0.35),
});

export const vennDiagram9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),

  /** Title shown above the diagram. */
  title: z.string().default("AI · Brand · Voice"),

  /** Mode: '2-circle' (horizontal pair) | '3-circle-stacked' (triangle) | '3-circle-horizontal' (row). */
  mode: z
    .enum(["2-circle", "3-circle-stacked", "3-circle-horizontal"])
    .default("3-circle-stacked"),

  /** Each circle: label + color + optional sub-label. */
  circles: z
    .array(circleSchema_local)
    .default([
      { label: "AI", sub: "Tools", color: "#5BC0E8", fillOpacity: 0.35 },
      { label: "BRAND", sub: "Identity", color: "#E89B7A", fillOpacity: 0.35 },
      { label: "VOICE", sub: "Tone", color: "#7CE49A", fillOpacity: 0.35 },
    ]),

  /** Center-intersection label (revealed LAST). */
  intersectionLabel: z.string().default("Sweet spot"),
  /** Optional sub-text under the intersection label. */
  intersectionSub: z.string().default(""),

  /** Per-circle entry timing. Each circle drifts in from off-frame. */
  circleEnterSeconds: z.number().default(0.5),
  /** Stagger between successive circles. */
  circleStaggerSeconds: z.number().default(0.6),
  /** Frames the outline draws around the circle. */
  outlineDrawFrames: z.number().default(20),
  /** Frames the fill fades in (after outline). */
  fillFadeFrames: z.number().default(12),
  /** When the intersection label reveals (seconds, after all circles settled). */
  intersectionLabelStartSeconds: z.number().default(3.5),

  // CRITICAL: transitionVerb (Wave-5 contract)
  transitionVerb: z
    .string()
    .default(
      "Each circle drifts in from off-frame (translateX from ±400 to 0 over 14 frames), its outline draws via stroke-dashoffset, then its fill fades in alpha-blended on overlap. The center-intersection label fades in LAST after all circles are settled.",
    ),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type VennDiagram9x16Props = z.infer<typeof vennDiagram9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const SVG_TOP = 500;
const SVG_LEFT = 0;
const SVG_W = 1080;
const SVG_H = 1000;

const SECTION_LABEL_Y = 200;
const TITLE_Y = 300;

// Per-circle drift distance (px in SVG viewBox units, which match the
// composition pixel grid because viewBox = SVG_W × SVG_H).
const DRIFT_PX = 400;
// Per-circle entry duration (frames it takes for the X drift to complete).
// The outline starts drawing once the drift settles.
const DRIFT_FRAMES = 14;

interface CirclePos {
  cx: number;
  cy: number;
  r: number;
  /** Sign of X drift on entry: -1 = drift from left, +1 = drift from right. */
  driftSign: -1 | 1;
  /** Where the circle's label sits (outer edge, away from intersection). */
  labelX: number;
  labelY: number;
  labelAlign: "start" | "middle" | "end";
}

/**
 * Resolve circle positions for a given mode. Returns one CirclePos per circle
 * up to the number of circles allowed by the mode (2 for "2-circle", 3 for
 * the others). Caller is responsible for slicing the result to circles.length.
 */
function defaultPositions(
  mode: VennDiagram9x16Props["mode"],
  count: number,
): CirclePos[] {
  if (mode === "2-circle") {
    // Horizontal pair: cx = [380, 700], cy = 900, r = 280
    const positions: CirclePos[] = [
      {
        cx: 380,
        cy: 900,
        r: 280,
        driftSign: -1,
        labelX: 220,
        labelY: 560,
        labelAlign: "middle",
      },
      {
        cx: 700,
        cy: 900,
        r: 280,
        driftSign: 1,
        labelX: 860,
        labelY: 560,
        labelAlign: "middle",
      },
    ];
    return positions.slice(0, count);
  }
  if (mode === "3-circle-horizontal") {
    // Row: cx = [300, 540, 780], cy = 900, r = 240
    const positions: CirclePos[] = [
      {
        cx: 300,
        cy: 900,
        r: 240,
        driftSign: -1,
        labelX: 170,
        labelY: 600,
        labelAlign: "middle",
      },
      {
        cx: 540,
        cy: 900,
        r: 240,
        driftSign: -1,
        labelX: 540,
        labelY: 600,
        labelAlign: "middle",
      },
      {
        cx: 780,
        cy: 900,
        r: 240,
        driftSign: 1,
        labelX: 910,
        labelY: 600,
        labelAlign: "middle",
      },
    ];
    return positions.slice(0, count);
  }
  // 3-circle-stacked: triangle.
  // Scaled down (r 280→235) and shifted up/in so all circles AND their outer
  // labels stay inside a ~56px safe-area margin on the 1080×1920 canvas. The
  // SVG is offset by SVG_TOP (500), so a circle at cy=1010 has its bottom edge
  // at 500+1010+235 = 1745 < 1864 (= 1920-56). Bottom labels sit centered well
  // inside the horizontal safe area (e.g. "VELOCIDAD" at x=290, not x=110, so
  // its left edge clears the margin instead of clipping off-frame).
  //   top:          (540, 700)  r=235
  //   bottom-left:  (330, 1010) r=235
  //   bottom-right: (750, 1010) r=235
  const positions: CirclePos[] = [
    {
      cx: 540,
      cy: 700,
      r: 235,
      driftSign: -1,
      labelX: 540,
      labelY: 410,
      labelAlign: "middle",
    },
    {
      cx: 330,
      cy: 1010,
      r: 235,
      driftSign: -1,
      labelX: 290,
      labelY: 1300,
      labelAlign: "middle",
    },
    {
      cx: 750,
      cy: 1010,
      r: 235,
      driftSign: 1,
      labelX: 790,
      labelY: 1300,
      labelAlign: "middle",
    },
  ];
  return positions.slice(0, count);
}

/**
 * Compute the geometric center of the intersection region for the given
 * positions. For 2-circle it's the midpoint of the two centers; for the
 * 3-circle layouts it's the centroid of the three centers. This is where
 * the intersection label sits.
 */
function intersectionCenter(positions: CirclePos[]): { x: number; y: number } {
  if (positions.length === 0) return { x: SVG_W / 2, y: SVG_H / 2 };
  const x = positions.reduce((acc, p) => acc + p.cx, 0) / positions.length;
  const y = positions.reduce((acc, p) => acc + p.cy, 0) / positions.length;
  return { x, y };
}

// ─── Section label chip ─────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 34,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Title above the diagram ───────────────────────────────────────
const Title: React.FC<{ text: string; inkColor: string; palette: VennDiagram9x16Props["palette"] }> = ({
  text,
  inkColor,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize: 80,
        color: getBodyTextColor(palette, inkColor, 80),
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        padding: "0 60px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Single Venn circle (outline + fill) ────────────────────────────
interface VennCircleProps {
  pos: CirclePos;
  color: string;
  fillOpacity: number;
  enterFrame: number;
  outlineDrawFrames: number;
  fillFadeFrames: number;
}

const VennCircle: React.FC<VennCircleProps> = ({
  pos,
  color,
  fillOpacity,
  enterFrame,
  outlineDrawFrames,
  fillFadeFrames,
}) => {
  const frame = useCurrentFrame();

  // ─── X drift (translateX from ±DRIFT_PX → 0 over DRIFT_FRAMES) ───
  const driftProgress = interpolate(
    frame,
    [enterFrame, enterFrame + DRIFT_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Ease-out cubic — fast settle, then crawl into final position.
  const eased = 1 - Math.pow(1 - driftProgress, 3);
  const translateX = pos.driftSign * DRIFT_PX * (1 - eased);

  // Whole-group fade-in over the drift (so the circle doesn't pop in at full
  // opacity at frame 0 of its sequence — fade up with the drift).
  const groupOpacity = interpolate(
    frame,
    [enterFrame, enterFrame + DRIFT_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Outline draw (stroke-dashoffset) ──────────────────────────────
  // Outline starts drawing once the circle has finished drifting in.
  const outlineStart = enterFrame + DRIFT_FRAMES;
  const pathLength = 2 * Math.PI * pos.r;
  const { dashArray, dashOffset } = pathDraw({
    frame,
    startFrame: outlineStart,
    durationFrames: outlineDrawFrames,
    pathLength,
    direction: "start-to-end",
    easing: "outCubic",
  });

  // ─── Fill fade (after outline finishes) ────────────────────────────
  const fillStart = outlineStart + outlineDrawFrames;
  const fillProgress = interpolate(
    frame,
    [fillStart, fillStart + fillFadeFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <g
      style={{
        transform: `translateX(${translateX}px)`,
        opacity: groupOpacity,
      }}
    >
      {/* Body fill — alpha-blended so overlapping circles mix nicely. */}
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={pos.r}
        fill={color}
        fillOpacity={fillOpacity * fillProgress}
        stroke="none"
      />
      {/* Outline — stroke-dashoffset draw. */}
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={pos.r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        /* Start at the top of the circle (12 o'clock) instead of the default
         * 3 o'clock origin — feels more natural for an outward draw. */
        transform={`rotate(-90 ${pos.cx} ${pos.cy})`}
      />
    </g>
  );
};

// ─── Circle label (outer edge, fades in with the outline) ───────────
const CircleLabel: React.FC<{
  pos: CirclePos;
  label: string;
  sub: string;
  color: string;
  enterFrame: number;
  inkColor: string;
  palette: VennDiagram9x16Props["palette"];
}> = ({ pos, label, sub, color, enterFrame, inkColor, palette }) => {
  const frame = useCurrentFrame();
  // Label appears once outline has been drawing for a couple frames so it
  // arrives WITH the outline, not after the fill — keeps cognitive load low.
  const labelStart = enterFrame + DRIFT_FRAMES + 4;
  const labelProgress = interpolate(frame, [labelStart, labelStart + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (!label) return null;
  const inkResolved = getBodyTextColor(palette, inkColor, 36);
  return (
    <g
      style={{ opacity: labelProgress }}
      textAnchor={pos.labelAlign}
    >
      <text
        x={pos.labelX}
        y={pos.labelY}
        fontFamily="Inter, sans-serif"
        fontWeight={800}
        fontSize={44}
        fill={color}
        letterSpacing="-0.01em"
      >
        {label}
      </text>
      {sub && (
        <text
          x={pos.labelX}
          y={pos.labelY + 38}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
          fontSize={26}
          fill={inkResolved}
          opacity={0.7}
          letterSpacing="0.02em"
        >
          {sub}
        </text>
      )}
    </g>
  );
};

// ─── Intersection label (centered in the overlap region, revealed LAST) ─
const IntersectionLabel: React.FC<{
  center: { x: number; y: number };
  label: string;
  sub: string;
  accentColor: string;
  inkColor: string;
  palette: VennDiagram9x16Props["palette"];
  startFrame: number;
}> = ({ center, label, sub, accentColor, inkColor, palette, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!label) return null;
  const enter = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const inkResolved = getBodyTextColor(palette, inkColor, 28);
  return (
    <g
      style={{
        opacity,
        transformOrigin: `${center.x}px ${center.y}px`,
        transform: `scale(${scale})`,
      }}
      textAnchor="middle"
    >
      {/* Soft "pill" backdrop so the label reads on top of the alpha-blended
       * intersection (which can be visually busy). */}
      <rect
        x={center.x - 180}
        y={center.y - 38}
        width={360}
        height={sub ? 96 : 60}
        rx={30}
        ry={30}
        fill={accentColor}
        fillOpacity={0.94}
      />
      <text
        x={center.x}
        y={center.y + 8}
        fontFamily="Inter, sans-serif"
        fontWeight={800}
        fontSize={36}
        fill="#FFFFFF"
        letterSpacing="-0.01em"
      >
        {label}
      </text>
      {sub && (
        <text
          x={center.x}
          y={center.y + 44}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
          fontSize={22}
          fill={inkResolved}
          opacity={0.95}
          letterSpacing="0.02em"
        >
          {sub}
        </text>
      )}
    </g>
  );
};

// ─── Composition ──────────────────────────────────────────────────
export const VennDiagram9x16: React.FC<VennDiagram9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  title,
  mode,
  circles,
  intersectionLabel,
  intersectionSub,
  circleEnterSeconds,
  circleStaggerSeconds,
  outlineDrawFrames,
  fillFadeFrames,
  intersectionLabelStartSeconds,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // ─── Resolve positions per circle ─────────────────────────────────
  // For "2-circle" mode we render at most 2 circles even if `circles` has 3.
  const maxCircles = mode === "2-circle" ? 2 : 3;
  const activeCircles = circles.slice(0, maxCircles);
  const defaultPos = defaultPositions(mode, activeCircles.length);

  const resolved = activeCircles.map((c, i) => {
    const base = defaultPos[i] ?? defaultPos[defaultPos.length - 1];
    const cx = c.cx ?? base.cx;
    const cy = c.cy ?? base.cy;
    const r = c.radius ?? base.r;
    // If the caller overrode cx, re-derive driftSign from which half of the
    // frame the circle sits in. Otherwise keep the default sign.
    const driftSign: -1 | 1 =
      c.cx !== undefined ? (cx < SVG_W / 2 ? -1 : 1) : base.driftSign;
    return {
      cx,
      cy,
      r,
      driftSign,
      labelX: base.labelX,
      labelY: base.labelY,
      labelAlign: base.labelAlign,
      color: c.color || resolvedAccent,
      label: c.label,
      sub: c.sub,
      fillOpacity: c.fillOpacity,
      enterFrame: Math.round((circleEnterSeconds + i * circleStaggerSeconds) * fps),
    };
  });

  const intersection = intersectionCenter(resolved);
  const intersectionStartFrame = Math.round(intersectionLabelStartSeconds * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "cream" || palette === "paper" ? "multiply" : "screen",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      <Title text={title} inkColor={resolvedInk} palette={palette} />

      {/* The Venn diagram itself — single SVG, viewBox matches outer rect so
       *  child coordinates are in composition pixels. */}
      <svg
        style={{
          position: "absolute",
          left: SVG_LEFT,
          top: SVG_TOP,
          width: SVG_W,
          height: SVG_H,
          overflow: "visible",
        }}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      >
        {/* Circles (bodies + outlines). Render bodies first across all circles
         *  so each fill alpha-blends with siblings, THEN outlines on top via
         *  the same component — the outline is part of the per-circle <g>, so
         *  this comes out OK because circles are drawn in array order: later
         *  circles' outlines naturally sit above earlier circles' fills. */}
        {resolved.map((c, i) => (
          <VennCircle
            key={`circle-${i}`}
            pos={{
              cx: c.cx,
              cy: c.cy,
              r: c.r,
              driftSign: c.driftSign,
              labelX: c.labelX,
              labelY: c.labelY,
              labelAlign: c.labelAlign,
            }}
            color={c.color}
            fillOpacity={c.fillOpacity}
            enterFrame={c.enterFrame}
            outlineDrawFrames={outlineDrawFrames}
            fillFadeFrames={fillFadeFrames}
          />
        ))}

        {/* Per-circle labels — drawn AFTER all circles so they always sit on
         *  top of any fill. */}
        {resolved.map((c, i) => (
          <CircleLabel
            key={`label-${i}`}
            pos={{
              cx: c.cx,
              cy: c.cy,
              r: c.r,
              driftSign: c.driftSign,
              labelX: c.labelX,
              labelY: c.labelY,
              labelAlign: c.labelAlign,
            }}
            label={c.label}
            sub={c.sub}
            color={c.color}
            enterFrame={c.enterFrame}
            inkColor={resolvedInk}
            palette={palette}
          />
        ))}

        {/* Intersection label — revealed LAST. */}
        <IntersectionLabel
          center={intersection}
          label={intersectionLabel}
          sub={intersectionSub}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          palette={palette}
          startFrame={intersectionStartFrame}
        />
      </svg>

      {/* Word-by-word captions (bottom strip) — uses resolvedMuted in border. */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
