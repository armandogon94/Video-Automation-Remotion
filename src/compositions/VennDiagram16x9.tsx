/**
 * VennDiagram16x9 — horizontal (1920×1080) animated Venn diagram.
 *
 * 16:9 sibling of `VennDiagram9x16` (Wave-5 Tella synthesis T6).
 * ADR-001-16x9-lane §2.1/§2.4/§5.1.
 *
 * The 9:16 source has NO separate `*Dark` variant — palette is a prop.
 * This 16:9 comp preserves the same pattern with `palette` defaulting to `dark`.
 *
 * Layout re-design for landscape:
 *   The SVG canvas is wider (1920×1080 viewBox) allowing larger circles and
 *   proper horizontal centering without cramping. For `2-circle` mode the pair
 *   sits centered with radius ~240px each; for `3-circle-stacked` the triangle
 *   is wider and taller to use the full horizontal space; for
 *   `3-circle-horizontal` the three circles are spaced across the width at ~200px
 *   radius each. Circle labels have room to breathe at the outer edges.
 *
 *   - Section label chip: top-center, tracking-spaced uppercase sans.
 *   - Title: Inter 900 ~72px, ink, centered.
 *   - SVG diagram: occupies y ≈ 120..980 (860px tall × 1920px wide).
 *   - Intersection label: same pill treatment, centered in overlap region.
 *   - Optional EditorialCaption at bottom.
 *
 * Motion grammar (preserved from 9:16):
 *   Each circle drifts in from off-frame (translateX from ±500 → 0 over 14f),
 *   outline draws via stroke-dashoffset, fill fades in alpha-blended on overlap.
 *   Center-intersection label fades in LAST after all circles are settled.
 *
 * Brand chrome: DarkSlateChassis16x9 + BrandBreadcrumb16x9 + BrandWatermark16x9.
 *
 * SSR note: pure SVG + Remotion `interpolate` / `spring` — no DOM measurement,
 * no `window` access, deterministic across SSR + client.
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
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  ALL_PALETTE_MODES,
  FONT_STACKS,
} from "../brand";
import { pathDraw } from "../animation";

// ─── Locally-redeclared schemas (per ADR §2.4 — no shared-file edits) ────────
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

const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

const circleSchema_local = z.object({
  label: z.string().default(""),
  sub: z.string().default(""),
  color: z.string().default(""),
  cx: z.number().optional(),
  cy: z.number().optional(),
  radius: z.number().optional(),
  fillOpacity: z.number().default(0.35),
});

// ─── Public schema ────────────────────────────────────────────────────────────
export const vennDiagram16x9Schema = z.object({
  audioUrl: z.string().optional(),
  wordTimings: z.array(wordTimingSchema_local).optional(),
  sectionLabel: z.string().optional(),
  title: z.string().default("AI · Brand · Voice"),
  mode: z
    .enum(["2-circle", "3-circle-stacked", "3-circle-horizontal"])
    .default("3-circle-stacked"),
  circles: z
    .array(circleSchema_local)
    .default([
      { label: "AI", sub: "Tools", color: "#5BC0E8", fillOpacity: 0.35 },
      { label: "BRAND", sub: "Identity", color: "#E89B7A", fillOpacity: 0.35 },
      { label: "VOICE", sub: "Tone", color: "#7CE49A", fillOpacity: 0.35 },
    ]),
  intersectionLabel: z.string().default("Sweet spot"),
  intersectionSub: z.string().optional(),
  circleEnterSeconds: z.number().default(0.5),
  circleStaggerSeconds: z.number().default(0.6),
  outlineDrawFrames: z.number().optional(),
  fillFadeFrames: z.number().optional(),
  intersectionLabelStartSeconds: z.number().default(3.5),
  /** Optional transitionVerb for agent documentation; not used in rendering. */
  transitionVerb: z.string().optional(),
  breadcrumb: breadcrumbSchema_local.nullable().optional(),
  watermark: watermarkSchema_local.nullable().optional(),
  watermarkHandle: z.string().optional(),
  subjectTool: z.string().nullable().optional(),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().optional(),
  inkColor: z.string().optional(),
  accentColor: z.string().optional(),
  mutedColor: z.string().optional(),
  /** ADR §5.1: 16:9 caption default 32–36 px. */
  captionFontSize: z.number().optional(),
  showCaptions: z.boolean().default(false),
});
export type VennDiagram16x9Props = z.infer<typeof vennDiagram16x9Schema>;

// ─── Layout constants (1920×1080 SVG viewBox) ─────────────────────────────
// The SVG sits within the composition at the full frame dimensions. The viewBox
// matches 1920×1080 so all circle coordinates are in composition pixels.
const SVG_W = 1920;
const SVG_H = 1080;

const SECTION_LABEL_Y = 52;
const TITLE_Y = 110;

// The Venn area sits below the title, leaving the bottom for captions.
// y range: 200..1020 = 820px of vertical space.
const VENN_TOP_Y = 200;
const VENN_H = 820;
const VENN_CY = VENN_TOP_Y + VENN_H / 2; // ≈ 610

// Horizontal drift for 16:9 — larger canvas means bigger drift feels natural.
const DRIFT_PX = 500;
const DRIFT_FRAMES = 14;

interface CirclePos16x9 {
  cx: number;
  cy: number;
  r: number;
  driftSign: -1 | 1;
  labelX: number;
  labelY: number;
  labelAlign: "start" | "middle" | "end";
}

/**
 * Default circle positions calibrated for the 1920×1080 canvas.
 * Circles are larger (r 280–300) because there's more horizontal room.
 */
function defaultPositions16x9(
  mode: VennDiagram16x9Props["mode"],
  count: number,
): CirclePos16x9[] {
  if (mode === "2-circle") {
    // Horizontal pair: well-spaced on the wide canvas.
    const positions: CirclePos16x9[] = [
      {
        cx: 680,
        cy: VENN_CY,
        r: 290,
        driftSign: -1,
        labelX: 380,
        labelY: VENN_CY - 320,
        labelAlign: "middle",
      },
      {
        cx: 1240,
        cy: VENN_CY,
        r: 290,
        driftSign: 1,
        labelX: 1540,
        labelY: VENN_CY - 320,
        labelAlign: "middle",
      },
    ];
    return positions.slice(0, count);
  }
  if (mode === "3-circle-horizontal") {
    // Row: three circles across the wide canvas, moderate overlap.
    const positions: CirclePos16x9[] = [
      {
        cx: 560,
        cy: VENN_CY,
        r: 250,
        driftSign: -1,
        labelX: 300,
        labelY: VENN_CY - 280,
        labelAlign: "middle",
      },
      {
        cx: 960,
        cy: VENN_CY,
        r: 250,
        driftSign: -1,
        labelX: 960,
        labelY: VENN_CY - 280,
        labelAlign: "middle",
      },
      {
        cx: 1360,
        cy: VENN_CY,
        r: 250,
        driftSign: 1,
        labelX: 1620,
        labelY: VENN_CY - 280,
        labelAlign: "middle",
      },
    ];
    return positions.slice(0, count);
  }
  // 3-circle-stacked (triangle): wider triangle on 1920px canvas.
  //   top:          (960, VENN_CY - 200)
  //   bottom-left:  (680, VENN_CY + 160)
  //   bottom-right: (1240, VENN_CY + 160)
  const positions: CirclePos16x9[] = [
    {
      cx: 960,
      cy: VENN_CY - 200,
      r: 290,
      driftSign: -1,
      labelX: 960,
      labelY: VENN_TOP_Y + 40,
      labelAlign: "middle",
    },
    {
      cx: 680,
      cy: VENN_CY + 160,
      r: 290,
      driftSign: -1,
      labelX: 380,
      labelY: VENN_CY + 500,
      labelAlign: "middle",
    },
    {
      cx: 1240,
      cy: VENN_CY + 160,
      r: 290,
      driftSign: 1,
      labelX: 1540,
      labelY: VENN_CY + 500,
      labelAlign: "middle",
    },
  ];
  return positions.slice(0, count);
}

/** Geometric center of the intersection region. */
function intersectionCenter16x9(
  positions: CirclePos16x9[],
): { x: number; y: number } {
  if (positions.length === 0) return { x: SVG_W / 2, y: SVG_H / 2 };
  const x =
    positions.reduce((acc, p) => acc + p.cx, 0) / positions.length;
  const y =
    positions.reduce((acc, p) => acc + p.cy, 0) / positions.length;
  return { x, y };
}

// ─── Section label ─────────────────────────────────────────────────────────
const SectionLabel16x9: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
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
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 28,
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

// ─── Title above diagram ───────────────────────────────────────────────────
const VennTitle16x9: React.FC<{
  text: string;
  inkColor: string;
  palette: VennDiagram16x9Props["palette"];
}> = ({ text, inkColor, palette }) => {
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
        fontFamily: FONT_STACKS.sans,
        fontWeight: 900,
        /* ADR §5.1: hero 16:9 headline 140–180px; supporting title scaled smaller. */
        fontSize: 72,
        color: getBodyTextColor(palette, inkColor, 72),
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        padding: "0 80px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Single Venn circle (outline + fill) ────────────────────────────────────
interface VennCircle16x9Props {
  pos: CirclePos16x9;
  color: string;
  fillOpacity: number;
  enterFrame: number;
  outlineDrawFrames: number;
  fillFadeFrames: number;
}

const VennCircle16x9: React.FC<VennCircle16x9Props> = ({
  pos,
  color,
  fillOpacity,
  enterFrame,
  outlineDrawFrames,
  fillFadeFrames,
}) => {
  const frame = useCurrentFrame();

  // X drift: ±DRIFT_PX → 0 over DRIFT_FRAMES, ease-out cubic.
  const driftProgress = interpolate(
    frame,
    [enterFrame, enterFrame + DRIFT_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const eased = 1 - Math.pow(1 - driftProgress, 3);
  const translateX = pos.driftSign * DRIFT_PX * (1 - eased);

  const groupOpacity = interpolate(
    frame,
    [enterFrame, enterFrame + DRIFT_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Outline draw starts after drift settles.
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

  // Fill fade starts after outline finishes.
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
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={pos.r}
        fill={color}
        fillOpacity={fillOpacity * fillProgress}
        stroke="none"
      />
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
        transform={`rotate(-90 ${pos.cx} ${pos.cy})`}
      />
    </g>
  );
};

// ─── Circle label ─────────────────────────────────────────────────────────
const CircleLabel16x9: React.FC<{
  pos: CirclePos16x9;
  label: string;
  sub: string;
  color: string;
  enterFrame: number;
  inkColor: string;
  palette: VennDiagram16x9Props["palette"];
}> = ({ pos, label, sub, color, enterFrame, inkColor, palette }) => {
  const frame = useCurrentFrame();
  const labelStart = enterFrame + DRIFT_FRAMES + 4;
  const labelProgress = interpolate(
    frame,
    [labelStart, labelStart + 10],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  if (!label) return null;
  const inkResolved = getBodyTextColor(palette, inkColor, 32);
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
        /* ADR §5.1: body 16:9 default 30–36px; label is heading-level = 40px. */
        fontSize={40}
        fill={color}
        letterSpacing="-0.01em"
      >
        {label}
      </text>
      {sub && (
        <text
          x={pos.labelX}
          y={pos.labelY + 34}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
          fontSize={24}
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

// ─── Intersection label ───────────────────────────────────────────────────
const IntersectionLabel16x9: React.FC<{
  center: { x: number; y: number };
  label: string;
  sub: string;
  accentColor: string;
  inkColor: string;
  palette: VennDiagram16x9Props["palette"];
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
  const inkResolved = getBodyTextColor(palette, inkColor, 24);
  return (
    <g
      style={{
        opacity,
        transformOrigin: `${center.x}px ${center.y}px`,
        transform: `scale(${scale})`,
      }}
      textAnchor="middle"
    >
      {/* Soft pill backdrop — wider to accommodate 16:9 label comfortably. */}
      <rect
        x={center.x - 200}
        y={center.y - 38}
        width={400}
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
        fontSize={34}
        fill="#FFFFFF"
        letterSpacing="-0.01em"
      >
        {label}
      </text>
      {sub && (
        <text
          x={center.x}
          y={center.y + 42}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
          fontSize={20}
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

// ─── Composition ─────────────────────────────────────────────────────────────
export const VennDiagram16x9: React.FC<VennDiagram16x9Props> = ({
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
  watermark,
  watermarkHandle,
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
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  // Resolve positions per circle.
  const maxCircles = mode === "2-circle" ? 2 : 3;
  const activeCircles = circles.slice(0, maxCircles);
  const defaultPos = defaultPositions16x9(mode, activeCircles.length);

  const resolved = activeCircles.map((c, i) => {
    const base = defaultPos[i] ?? defaultPos[defaultPos.length - 1];
    const cx = c.cx ?? base.cx;
    const cy = c.cy ?? base.cy;
    const r = c.radius ?? base.r;
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
      enterFrame: Math.round(
        (circleEnterSeconds + i * circleStaggerSeconds) * fps,
      ),
    };
  });

  const intersection = intersectionCenter16x9(resolved);
  const intersectionStartFrame = Math.round(
    intersectionLabelStartSeconds * fps,
  );

  return (
    <DarkSlateChassis16x9>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      <SectionLabel16x9 text={sectionLabel ?? ""} accentColor={resolvedAccent} />

      <VennTitle16x9 text={title} inkColor={resolvedInk} palette={palette} />

      {/* The Venn diagram — single SVG, viewBox matches 1920×1080. */}
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: SVG_W,
          height: SVG_H,
          overflow: "visible",
        }}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      >
        {/* Circles (fills + outlines). */}
        {resolved.map((c, i) => (
          <VennCircle16x9
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
            outlineDrawFrames={outlineDrawFrames ?? 20}
            fillFadeFrames={fillFadeFrames ?? 12}
          />
        ))}

        {/* Per-circle labels — drawn after all circles so always on top. */}
        {resolved.map((c, i) => (
          <CircleLabel16x9
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
        <IntersectionLabel16x9
          center={intersection}
          label={intersectionLabel}
          sub={intersectionSub ?? ""}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          palette={palette}
          startFrame={intersectionStartFrame}
        />
      </svg>

      {/* Optional bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Word-by-word captions — default OFF per ADR §2.5 */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings ?? []}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize ?? 34,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </DarkSlateChassis16x9>
  );
};

export default VennDiagram16x9;
