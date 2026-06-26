/**
 * ConcentricHierarchyRadialCallout9x16 — nested CONTAINMENT hierarchy explainer.
 *
 * DERIVED FROM: @CodingFab "AI ≠ ML ≠ Deep Learning" reel
 *   (references/creators/codingfab/XrGDv4D6_ak/frames/).
 *   The source teaches a containment relationship ("one field, three layers" —
 *   AI contains ML contains Deep Learning) over a near-black radial-vignette
 *   background with bold white hero text + a single warm accent. CodingFab's
 *   own accent is cyan #00D9A3; we REBRAND to navy/gold but keep cyan available
 *   as an optional accentColor.
 *
 * PATTERN (net-new — we have Venn / Force / Decision / Pipeline diagrams but NO
 * concentric-containment diagram):
 *   - 4–6 CONCENTRIC RINGS drawn as nested SVG circles (e.g. AI ⊃ ML ⊃ DL ⊃ GenAI),
 *     each ring's label sitting inside its own band (the gap between its radius
 *     and the next-inner ring's radius).
 *   - RADIAL CONNECTOR LINES run from each ring's edge out to a CALLOUT BOX
 *     anchored around the viewport perimeter (top / right / bottom / left), the
 *     anchor chosen per-callout via trig so boxes fan out around the rings.
 *
 * CHOREOGRAPHY (staggered, all derived from useCurrentFrame — deterministic):
 *   1. Title fades/rises in at the top.
 *   2. Rings draw on OUTSIDE-IN, one every `ringStaggerSeconds` (~0.3s/ring):
 *      each ring's circumference draws via stroke-dashoffset and its band label
 *      fades in just after.
 *   3. Once the rings are down, radial connector lines animate outward (line
 *      length interpolates 0 → full from the ring edge toward its anchor).
 *   4. Callout boxes fade + scale into place at the end of each connector.
 *
 * GOTCHA HANDLED: hero / label text uses SOLID colors only. No CSS
 * background-clip:text + color:transparent (Remotion's headless Chromium paints
 * that as an opaque rectangle).
 *
 * Self-contained: imports only react, remotion, zod, and ../brand
 * (BRAND, FONT_STACKS). Pure SVG + trig, no DOM measurement, no window access,
 * no Math.random / Date.now — SSR-safe and frame-deterministic.
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

// ─── Schema (every field has a default so schema.parse({}) renders real content) ──
const ringSchema_local = z.object({
  /** Band label, e.g. "AI", "Machine Learning". */
  label: z.string().default(""),
  /** Optional one-line description shown under the band label. Empty = hidden. */
  description: z.string().default(""),
});

const calloutSchema_local = z.object({
  /** Callout heading (bold). */
  label: z.string().default(""),
  /** Optional supporting line under the heading. Empty = hidden. */
  description: z.string().default(""),
  /** Which perimeter edge the callout box anchors to. */
  position: z.enum(["top", "right", "bottom", "left"]).default("right"),
  /** Which ring (0 = outermost) the radial connector originates from. */
  ringIndex: z.number().int().default(0),
});

export const concentricHierarchyRadialCallout9x16Schema = z.object({
  /** Hero title above the rings. */
  title: z.string().default("One field. Three layers."),
  /** Optional eyebrow/kicker above the title (uppercase tracked). Empty = hidden. */
  kicker: z.string().default("AI ⊃ ML ⊃ DEEP LEARNING"),

  /** Concentric rings OUTERMOST → innermost. 3–6 supported (clamped). */
  rings: z
    .array(ringSchema_local)
    .default([
      { label: "Artificial Intelligence", description: "" },
      { label: "Machine Learning", description: "" },
      { label: "Deep Learning", description: "" },
      { label: "Generative AI", description: "" },
    ]),

  /** Callout boxes anchored around the perimeter, wired to a ring by index. */
  callouts: z
    .array(calloutSchema_local)
    .default([
      {
        label: "The umbrella",
        description: "Rules, search, planning — not just learning",
        position: "top",
        ringIndex: 0,
      },
      {
        label: "Data-driven",
        description: "Improves with more examples",
        position: "right",
        ringIndex: 1,
      },
      {
        label: "Neural nets",
        description: "Stacked layers learn features themselves",
        position: "left",
        ringIndex: 2,
      },
      {
        label: "The newest layer",
        description: "LLMs & diffusion live here",
        position: "bottom",
        ringIndex: 3,
      },
    ]),

  /** Palette: "cream" (light brand) or "dark" (deep-navy, matches CodingFab source). */
  palette: z.enum(["cream", "dark"]).default("dark"),
  /** Accent color spine. Brand gold by default; pass CodingFab cyan #00D9A3 to rebrand. */
  accentColor: z.string().default(BRAND.colors.accent),

  /** Seconds before the FIRST ring begins drawing (title gets the runway). */
  firstRingDelaySeconds: z.number().default(0.5),
  /** Stagger between successive rings drawing on (CodingFab ≈ 0.3s/ring). */
  ringStaggerSeconds: z.number().default(0.3),

  // CRITICAL: transitionVerb (house contract — imperative voice for the prompt
  // pipeline; does not drive runtime).
  transitionVerb: z
    .string()
    .default(
      "Concentric rings draw on outside-in one every ~0.3s (each circumference draws via stroke-dashoffset, then its band label fades in). After the rings settle, radial connector lines extend from each ring edge toward the perimeter, and callout boxes fade + scale into place at the line ends.",
    ),
});
export type ConcentricHierarchyRadialCallout9x16Props = z.infer<
  typeof concentricHierarchyRadialCallout9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

// The ring stack is centered horizontally, biased slightly below center to
// leave headroom for the title + kicker at the top.
const CENTER_X = FRAME_W / 2;
const CENTER_Y = 1080;
// Outermost ring radius; inner rings step inward by a fixed ratio.
const OUTER_RADIUS = 360;

const TITLE_TOP = 150;

// Callout box dimensions (px).
const CALLOUT_W = 300;
const CALLOUT_H_BASE = 92;

// ─── Palette resolution (two-mode, per brief: cream default-light + dark) ────
interface ResolvedPalette {
  bgGradient: string;
  vignette: string;
  ink: string;
  inkSoft: string;
  muted: string;
  ringIdle: string;
  ringBandFill: (alpha: number) => string;
  calloutBg: string;
  calloutBorder: string;
  connectorBase: string;
}

function resolvePalette(mode: "cream" | "dark", accent: string): ResolvedPalette {
  if (mode === "cream") {
    return {
      // Brand cream paper with a soft warm center.
      bgGradient: `radial-gradient(120% 90% at 50% 46%, #FFFFFF 0%, ${BRAND.colors.background} 100%)`,
      vignette:
        "radial-gradient(100% 72% at 50% 50%, rgba(0,0,0,0) 58%, rgba(15,27,45,0.10) 100%)",
      ink: BRAND.colors.text,
      inkSoft: "#3A4250",
      muted: BRAND.colors.muted,
      ringIdle: "rgba(27,58,110,0.70)", // strong navy outline so the rings read clearly
      ringBandFill: (a: number) => `rgba(27,58,110,${a})`,
      calloutBg: "#FFFFFF",
      calloutBorder: "rgba(27,58,110,0.28)",
      connectorBase: "rgba(27,58,110,0.55)",
    };
  }
  // dark — deep-navy near-black with a faint warm vignette (CodingFab source look).
  return {
    bgGradient: `radial-gradient(120% 90% at 50% 42%, ${BRAND.colors.backgroundDark} 0%, #060B14 100%)`,
    vignette:
      "radial-gradient(100% 70% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)",
    ink: "#F5F2EC",
    inkSoft: "#C9D2DE",
    muted: "#A6AFBF",
    ringIdle: "rgba(176,188,209,0.78)", // bright cool-grey outline, high contrast on near-black
    // Bands tinted with the navy spine so the gold accent + white text pop.
    ringBandFill: (a: number) => `rgba(54,92,150,${a})`,
    calloutBg: "rgba(15,27,45,0.92)",
    calloutBorder: accent,
    connectorBase: "rgba(212,175,55,0.65)",
  };
}

// ─── Perimeter anchor points for each edge (where a callout box centers) ─────
function anchorFor(position: "top" | "right" | "bottom" | "left"): {
  x: number;
  y: number;
  // Direction (unit-ish) from ring center toward the anchor, used to pick the
  // ring-edge attach point for the connector.
  dirX: number;
  dirY: number;
} {
  switch (position) {
    case "top":
      return { x: CENTER_X, y: 430, dirX: 0, dirY: -1 };
    case "bottom":
      return { x: CENTER_X, y: 1640, dirX: 0, dirY: 1 };
    case "left":
      return { x: 40 + CALLOUT_W / 2, y: CENTER_Y, dirX: -1, dirY: 0 };
    case "right":
    default:
      return { x: FRAME_W - 40 - CALLOUT_W / 2, y: CENTER_Y, dirX: 1, dirY: 0 };
  }
}

// ─── Title + kicker block ────────────────────────────────────────────────────
const TitleBlock: React.FC<{
  title: string;
  kicker: string;
  ink: string;
  accent: string;
  muted: string;
}> = ({ title, kicker, ink, accent, muted }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 },
    durationInFrames: 18,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [26, 0]);

  const kickerOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_TOP,
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 70px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {kicker ? (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent, // SOLID accent (no background-clip)
            opacity: kickerOpacity,
            marginBottom: 22,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: ink, // SOLID ink
        }}
      >
        {title}
      </div>
      {/* Accent underline rule (CodingFab signature short rule beneath the hero). */}
      <div
        style={{
          margin: "26px auto 0",
          width: 88,
          height: 5,
          borderRadius: 3,
          background: accent,
          opacity: kickerOpacity,
        }}
      />
      {/* Reference muted so it stays part of the styling API even if unused above. */}
      {muted.length === 0 ? <span style={{ color: muted }} /> : null}
    </div>
  );
};

// ─── A single concentric ring (band fill + outline draw + band label) ────────
interface RingViewProps {
  index: number;
  total: number;
  radius: number;
  innerRadius: number;
  label: string;
  description: string;
  startFrame: number;
  pal: ResolvedPalette;
  accent: string;
  isInnermost: boolean;
}

const RingView: React.FC<RingViewProps> = ({
  index,
  total,
  radius,
  innerRadius,
  label,
  description,
  startFrame,
  pal,
  accent,
  isInnermost,
}) => {
  const frame = useCurrentFrame();

  // Outline draw via stroke-dashoffset.
  const drawFrames = 20;
  const drawProgress = interpolate(
    frame,
    [startFrame, startFrame + drawFrames],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - drawProgress);

  // Band fill fades in just behind the outline.
  const fillProgress = interpolate(
    frame,
    [startFrame + 6, startFrame + drawFrames + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Band label fades + nudges up once the outline is mostly drawn.
  const labelStart = startFrame + drawFrames - 4;
  const labelProgress = interpolate(frame, [labelStart, labelStart + 12], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each band's fill alpha steps up toward the center so the nesting reads as a
  // depth gradient; the innermost ring carries the accent. A gentle but clearly
  // visible step (0.10 → 0.34) keeps each nested band distinct from its parent.
  const depth = total <= 1 ? 0 : index / (total - 1);
  const bandAlpha = 0.1 + depth * 0.24;

  // The innermost ring is the "payload" — outline it in the accent.
  const outlineColor = isInnermost ? accent : pal.ringIdle;
  // Stroke width is DERIVED from this ring's radius: larger (outer) rings get a
  // proportionally thicker outline so the concentric nesting reads at a glance,
  // clamped to a clearly-visible 4..9px range. The innermost accent ring gets a
  // small extra weight so the payload pops.
  const radiusStroke = (radius / OUTER_RADIUS) * 9;
  const outlineWidth = isInnermost
    ? Math.max(6, Math.min(9, radiusStroke + 2))
    : Math.max(4, Math.min(9, radiusStroke));

  // Label sits INSIDE this ring's own band — the vertical slot is the gap on the
  // 12-o'clock spine between THIS ring's top stroke and the NEXT-inner ring's top
  // stroke. We derive both edges from the radii so the label can never sit on a
  // stroke or bleed into the neighbouring band:
  //   bandTopY  = this ring's top stroke (CENTER_Y - radius), pushed in past the
  //               half-stroke so text clears the outline.
  //   bandBotY  = next-inner ring's top stroke (CENTER_Y - innerRadius), pulled
  //               up past its half-stroke for the same clearance.
  // The label baseline is placed a fixed inset below bandTopY; the description is
  // tucked under it and the whole block is clamped to stay above bandBotY, giving
  // each successive band's label clear separation (≈ a full band thickness apart)
  // with no overlap onto the ring stroke or the next label.
  const halfStroke = outlineWidth / 2;
  const innerHalfStroke = isInnermost ? halfStroke : 4; // approx inner ring stroke
  const bandTopY = CENTER_Y - radius + halfStroke;
  const bandBotY = CENTER_Y - innerRadius - innerHalfStroke;
  const slot = Math.max(0, bandBotY - bandTopY);

  // Label baseline: an inset below the band's top stroke. For roomy bands keep a
  // comfortable inset; for tight bands fall back to the band midpoint so the
  // label still reads centered rather than crowding either stroke.
  const BAND_LABEL_INSET = 34;
  const labelY =
    slot >= BAND_LABEL_INSET + 24
      ? bandTopY + BAND_LABEL_INSET
      : bandTopY + slot * 0.5;
  // Description tucked under the label, clamped so it never crosses the inner
  // stroke (bandBotY). Hidden implicitly by the caller when empty.
  const descOffset = Math.min(34, Math.max(22, bandBotY - labelY - 6));

  return (
    <g>
      {/* Band fill — a ring shape approximated by a filled circle that later
       *  rings paint over, producing a layered depth gradient. */}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={radius}
        fill={pal.ringBandFill(bandAlpha)}
        fillOpacity={fillProgress}
        stroke="none"
      />
      {/* Outline — stroke-dashoffset draw, starting at 12 o'clock. */}
      <circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={radius}
        fill="none"
        stroke={outlineColor}
        strokeWidth={outlineWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${CENTER_X} ${CENTER_Y})`}
        opacity={1}
      />
      {/* Band label (+ optional description). SOLID fills only. */}
      <g
        style={{ opacity: labelProgress }}
        transform={`translate(0 ${(1 - labelProgress) * -8})`}
        textAnchor="middle"
      >
        <text
          x={CENTER_X}
          y={labelY}
          fontFamily={FONT_STACKS.sans}
          fontWeight={isInnermost ? 900 : 800}
          fontSize={isInnermost ? 40 : 36}
          letterSpacing="-0.01em"
          fill={isInnermost ? accent : pal.ink}
        >
          {label}
        </text>
        {description ? (
          <text
            x={CENTER_X}
            y={labelY + descOffset}
            fontFamily={FONT_STACKS.mono}
            fontWeight={500}
            fontSize={21}
            letterSpacing="0.01em"
            fill={pal.muted}
          >
            {description}
          </text>
        ) : null}
      </g>
    </g>
  );
};

// ─── A radial connector line + its perimeter callout box ─────────────────────
interface CalloutViewProps {
  label: string;
  description: string;
  position: "top" | "right" | "bottom" | "left";
  ringRadius: number;
  startFrame: number;
  pal: ResolvedPalette;
  accent: string;
}

const CalloutView: React.FC<CalloutViewProps> = ({
  label,
  description,
  position,
  ringRadius,
  startFrame,
  pal,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const anchor = anchorFor(position);

  // Ring-edge attach point: ring center + direction * ringRadius.
  const edgeX = CENTER_X + anchor.dirX * ringRadius;
  const edgeY = CENTER_Y + anchor.dirY * ringRadius;

  // The connector stops just short of the callout box so it doesn't punch into it.
  const calloutH = description ? CALLOUT_H_BASE + 28 : CALLOUT_H_BASE;
  const boxEdgeX =
    position === "left"
      ? anchor.x + CALLOUT_W / 2
      : position === "right"
        ? anchor.x - CALLOUT_W / 2
        : anchor.x;
  const boxEdgeY =
    position === "top"
      ? anchor.y + calloutH / 2
      : position === "bottom"
        ? anchor.y - calloutH / 2
        : anchor.y;

  // Connector grows from the ring edge toward the box edge.
  const lineProgress = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tipX = edgeX + (boxEdgeX - edgeX) * lineProgress;
  const tipY = edgeY + (boxEdgeY - edgeY) * lineProgress;

  // Box pops in once the connector has nearly reached it.
  const boxEnter = spring({
    frame: frame - (startFrame + 12),
    fps,
    config: { damping: 200, stiffness: 140, mass: 0.7 },
    durationInFrames: 16,
  });
  const boxOpacity = interpolate(boxEnter, [0, 1], [0, 1]);
  const boxScale = interpolate(boxEnter, [0, 1], [0.82, 1]);

  return (
    <>
      {/* Radial connector line (SVG) — sits in the same coordinate grid. */}
      <svg
        width={FRAME_W}
        height={FRAME_H}
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <line
          x1={edgeX}
          y1={edgeY}
          x2={tipX}
          y2={tipY}
          stroke={pal.connectorBase}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Attach dot on the ring edge. */}
        <circle cx={edgeX} cy={edgeY} r={6} fill={accent} opacity={lineProgress} />
      </svg>

      {/* Callout box (HTML for crisp text + flex layout). */}
      <div
        style={{
          position: "absolute",
          left: anchor.x - CALLOUT_W / 2,
          top: anchor.y - calloutH / 2,
          width: CALLOUT_W,
          minHeight: calloutH,
          boxSizing: "border-box",
          padding: "16px 20px",
          borderRadius: 16,
          background: pal.calloutBg,
          border: `2px solid ${pal.calloutBorder}`,
          boxShadow: `0 10px 30px ${BRAND.colors.backgroundDark}40, 0 0 0 1px ${accent}1A`,
          opacity: boxOpacity,
          transform: `scale(${boxScale})`,
          transformOrigin: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: pal.ink,
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 19,
              lineHeight: 1.25,
              letterSpacing: "0.01em",
              color: pal.muted,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    </>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────
export const ConcentricHierarchyRadialCallout9x16: React.FC<
  ConcentricHierarchyRadialCallout9x16Props
> = ({
  title,
  kicker,
  rings,
  callouts,
  palette,
  accentColor,
  firstRingDelaySeconds,
  ringStaggerSeconds,
}) => {
  const { fps } = useVideoConfig();

  const pal = resolvePalette(palette, accentColor);

  // Clamp rings to 3..6 (the containment-hierarchy sweet spot).
  const activeRings = rings.slice(0, 6);
  const ringCount = Math.max(1, activeRings.length);

  // Compute each ring's radius: outermost = OUTER_RADIUS, stepping inward by a
  // ratio so bands have room for their labels. innerRadius[i] = radius[i+1].
  const radii: number[] = [];
  const step = OUTER_RADIUS / (ringCount + 0.6); // leave a solid core for the last band
  for (let i = 0; i < ringCount; i++) {
    radii.push(OUTER_RADIUS - i * step);
  }
  const innerRadiusFor = (i: number): number =>
    i + 1 < ringCount ? radii[i + 1] : Math.max(0, radii[i] - step * 0.6);

  const baseDelay = Math.round(firstRingDelaySeconds * fps);
  const ringStagger = Math.max(1, Math.round(ringStaggerSeconds * fps));
  const ringStartFrame = (i: number): number => baseDelay + i * ringStagger;

  // Callouts begin after the LAST ring has finished drawing on.
  const lastRingDone = ringStartFrame(ringCount - 1) + 24;
  const calloutStagger = Math.max(1, Math.round(0.18 * fps));

  return (
    <AbsoluteFill style={{ background: pal.bgGradient, fontFamily: FONT_STACKS.sans }}>
      {/* Vignette to deepen the corners (matches the CodingFab radial-glow look). */}
      <AbsoluteFill style={{ background: pal.vignette, pointerEvents: "none" }} />

      {/* Title + kicker. */}
      <TitleBlock
        title={title}
        kicker={kicker}
        ink={pal.ink}
        accent={accentColor}
        muted={pal.muted}
      />

      {/* Concentric rings — single SVG, viewBox == frame so child coords are in
       *  composition pixels. Bands are painted outer → inner so inner fills sit
       *  on top, producing the depth gradient. */}
      <svg
        width={FRAME_W}
        height={FRAME_H}
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {activeRings.map((ring, i) => (
          <RingView
            key={`ring-${i}`}
            index={i}
            total={ringCount}
            radius={radii[i]}
            innerRadius={innerRadiusFor(i)}
            label={ring.label}
            description={ring.description}
            startFrame={ringStartFrame(i)}
            pal={pal}
            accent={accentColor}
            isInnermost={i === ringCount - 1}
          />
        ))}
      </svg>

      {/* Radial connectors + perimeter callout boxes. Each callout wires to a
       *  ring by index; the connector originates at that ring's edge. */}
      {callouts.map((c, i) => {
        const safeRingIdx = Math.max(0, Math.min(ringCount - 1, c.ringIndex));
        return (
          <CalloutView
            key={`callout-${i}`}
            label={c.label}
            description={c.description}
            position={c.position}
            ringRadius={radii[safeRingIdx]}
            startFrame={lastRingDone + i * calloutStagger}
            pal={pal}
            accent={accentColor}
          />
        );
      })}
    </AbsoluteFill>
  );
};
