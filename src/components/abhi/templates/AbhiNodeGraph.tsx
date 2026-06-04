/**
 * AbhiNodeGraph — replica of abhishek.devini's "node-graph" / constellation scene
 * (the "how it works / routing / second-brain" network beat). FOREGROUND ONLY:
 * the shared AbhiBackground (dark-grid-glow OR light-mesh) is mounted separately
 * by the host AbhiScene9x16, so this renders transparent — it draws ONLY the local
 * spoke edges, the radiating node dots, the central ringed hub node, the big stat,
 * and the kicker pill. NO full-screen background.
 *
 * Source ground-truth: DY6pP0FP4Qa 60–68s (DARK, "● DYNAMIC WORKFLOWS";
 * central ringed node "✳ 1 SESSION" coral-accent with dozens of dots spraying
 * outward along thin spokes, one upper sector amber-accent; BIG STAT "100+" +
 * label "SUBAGENTS · ONE SESSION"). Cross-checked vs the routing variant
 * DY4hA09PkjD 19–30s (edges draw downward with a traveling pulse dot into a
 * ringed hub) for the edge-draw + ring-node motif.
 *
 * Choreography (frames @30fps, scene-relative from 0, then HOLD):
 *   • Kicker pill fades + drops from y−16px over f1–6, accent dot ignites f4.
 *   • Central hub node scales 0.6→1 (overshoot) + glow blooms over f6–18;
 *     the spark glyph rays bloom; the accent ring sweeps round; node pulses.
 *   • Spokes draw OUTWARD from the hub, ~1 edge / 3f, each over ~6f (L→R / radial).
 *   • A chain of dots sprays out along each spoke once its edge lands (~1 dot/3f
 *     wave), each dot popping with a slight overshoot 0.8→1.05→1.
 *   • BIG STAT "100+" rises + counts/pops after the constellation is mostly built;
 *     the accent unit suffix ("+") pops separately; mono label fades up under it.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = (pct/100)*1080.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/** "" sentinel = "caller did not override" (no zod reflection on defaults). */
const S = "";

export const abhiNodeGraphSchema = z.object({
  /** Single accent color — defaults to abhishek coral (Anthropic family). */
  accentColor: z.string().default("#DE7854"),
  /** Background family this scene sits over — drives ink + node-surface colors. */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono kicker, UPPERCASE. */
  kicker: z.string().default("DYNAMIC WORKFLOWS"),
  /** Center node label (mono caps), e.g. "1 SESSION" / "OBSIDIAN VAULT". */
  hubLabel: z.string().default("1 SESSION"),
  /** Hub icon: "burst" = Anthropic spark; "switch" = ⇄ ring; "dot" = plain dot. */
  hubIcon: z.enum(["burst", "switch", "dot"]).default("burst"),
  /** Number of spokes radiating out of the hub. Clamped 6–28. */
  spokeCount: z.number().default(18),
  /** Dots per spoke (a chain sprays outward along each spoke). Clamped 2–6. */
  dotsPerSpoke: z.number().default(4),
  /**
   * Fraction (0..1) of the upper sector whose dots are accent-colored (the rest
   * are neutral grey/white). Matches the source's one amber sector. 0 = none.
   */
  accentSector: z.number().default(0.16),
  /** Big stat shown under the constellation, e.g. "100+". "" hides it. */
  stat: z.string().default("100+"),
  /** Which trailing chars of `stat` are recolored to accent (the unit suffix). */
  statSuffix: z.string().default("+"),
  /** Mono uppercase label under the stat. "" hides it. */
  statLabel: z.string().default("SUBAGENTS · ONE SESSION"),
});
export type AbhiNodeGraphProps = z.infer<typeof abhiNodeGraphSchema>;

const PX = 1080; // width basis: 1px@720-spec → 1.5px on this 1080-wide canvas

/** #RRGGBB + alpha → rgba(). Falls back to coral on a bad hex. */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(222,120,84,${alpha})`;
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

export const AbhiNodeGraph: React.FC<Partial<AbhiNodeGraphProps>> = (props) => {
  const p = abhiNodeGraphSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const grey = isDark ? "#9A9AA0" : "#5A5A66";
  const accent = p.accentColor;

  // Neutral dot / spoke colors per mode (source uses cool greys on dark).
  const dotNeutral = isDark ? "#C4C2CC" : "#3A3A46";
  const spokeColor = isDark ? "rgba(190,188,200,0.22)" : "rgba(40,40,60,0.20)";

  // ---- Constellation geometry (canvas-relative; hub above the stat) ----
  const CX = PX / 2; // 540
  const CY = 0.40 * 1920; // 768 — hub vertical center
  const hubR = 0.095 * PX; // ring node radius ≈ 102px
  const spokeInner = hubR + 0.012 * PX; // spokes start just outside the ring
  const spokeOuterMin = 0.30 * PX; // shortest spoke reach
  const spokeOuterMax = 0.42 * PX; // longest spoke reach

  const spokes = clamp(Math.round(p.spokeCount), 6, 28);
  const dotsPer = clamp(Math.round(p.dotsPerSpoke), 2, 6);
  const accentFrac = clamp(p.accentSector, 0, 1);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from 0, then HOLD.
  // ============================================================

  // --- Kicker pill: fade + drop from y−24px over f1–6, accent dot glow f4 ---
  const kickerProg = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.6, stiffness: 170 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerProg, [0, 1], [-24, 0]);
  const kickerOpacity = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Central hub node: scale 0.6→1 (overshoot) + glow bloom over f6–18 ---
  const HUB_START = 6;
  const hubSpring = spring({
    frame: frame - HUB_START,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 150 },
    durationInFrames: 14,
  });
  const hubScale = interpolate(hubSpring, [0, 1], [0.6, 1]);
  const hubOpacity = interpolate(frame, [HUB_START, HUB_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Bloom (ray reach / ring sweep) settles slightly after the disc lands.
  const hubBloom = interpolate(frame, [HUB_START + 2, HUB_START + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Continuous pulse on the hub glow once it's up.
  const hubPulse = 1 + Math.sin((frame / 30) * Math.PI * 2) * 0.06;
  // Accent ring sweep (clockwise stroke-dash reveal) over ~12f.
  const RING_START = HUB_START + 3;
  const ringSweep = interpolate(frame, [RING_START, RING_START + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Spokes + dot chains: edges draw OUTWARD ~1 edge/3f after the hub lands ---
  const SPOKE_START = HUB_START + 8; // edges begin once hub disc is mostly there
  const EDGE_STEP = 3; // ~1 edge / 3f
  const EDGE_DUR = 6; // each edge draws over ~6f
  const DOT_STEP = 3; // dots spray ~1 dot / 3f along the spoke

  // Deterministic pseudo-random so layout is stable per render (no Math.random).
  const rand = (seed: number): number => {
    const x = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
    return x - Math.floor(x);
  };

  // --- Big stat: rises + pops after the constellation is mostly built ---
  const hasStat = p.stat.trim() !== S;
  const STAT_START = SPOKE_START + spokes * EDGE_STEP - 6; // overlaps the last spokes
  const statSpring = spring({
    frame: frame - STAT_START,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 140 },
    durationInFrames: 12,
  });
  const statScale = interpolate(statSpring, [0, 1], [0.86, 1]);
  const statY = interpolate(statSpring, [0, 1], [0.022 * 1920, 0]);
  const statOpacity = interpolate(frame, [STAT_START, STAT_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Accent suffix pops separately, slightly after the digits land.
  const SUFFIX_START = STAT_START + 5;
  const suffixSpring = spring({
    frame: frame - SUFFIX_START,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 170 },
    durationInFrames: 8,
  });
  const suffixScale = interpolate(suffixSpring, [0, 1], [0.4, 1]);
  const suffixOpacity = interpolate(frame, [SUFFIX_START, SUFFIX_START + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Split the stat into base digits + accent suffix.
  const suffix = p.statSuffix;
  const statBase =
    suffix && p.stat.endsWith(suffix) ? p.stat.slice(0, -suffix.length) : p.stat;
  const statSuffixShown =
    suffix && p.stat.endsWith(suffix) ? suffix : "";

  // --- Stat label: mono caps fades up after the stat ---
  const hasLabel = p.statLabel.trim() !== S;
  const LABEL_START = STAT_START + 8;
  const labelOpacity = interpolate(frame, [LABEL_START, LABEL_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [LABEL_START, LABEL_START + 8], [0.012 * 1920, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ---- Precompute spoke + dot geometry ----
  type DotInfo = {
    x: number;
    y: number;
    r: number;
    start: number;
    isAccent: boolean;
  };
  type SpokeInfo = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    start: number;
    dots: DotInfo[];
  };

  const spokeData: SpokeInfo[] = [];
  for (let i = 0; i < spokes; i++) {
    // Angle: evenly spread, jittered slightly so it reads organic (not a clock).
    const base = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    const jitter = (rand(i + 1) - 0.5) * (Math.PI / spokes) * 0.9;
    const ang = base + jitter;
    const reach =
      spokeOuterMin + rand(i * 3 + 7) * (spokeOuterMax - spokeOuterMin);

    const x1 = CX + Math.cos(ang) * spokeInner;
    const y1 = CY + Math.sin(ang) * spokeInner;
    const x2 = CX + Math.cos(ang) * reach;
    const y2 = CY + Math.sin(ang) * reach;
    const start = SPOKE_START + i * EDGE_STEP;

    // Accent sector: a contiguous wedge of the UPPER arc gets accent dots.
    // angle near -90° (straight up) is the sector center; width = accentFrac of 2π.
    const upRef = -Math.PI / 2;
    let da = Math.abs(((ang - upRef + Math.PI) % (Math.PI * 2)) - Math.PI);
    const isAccentSpoke = accentFrac > 0 && da <= accentFrac * Math.PI;

    const dots: DotInfo[] = [];
    for (let d = 0; d < dotsPer; d++) {
      // Dots distributed from ~55% out to the tip, with small radial jitter.
      const t = 0.5 + (d / Math.max(1, dotsPer - 1)) * 0.55;
      const rr = spokeInner + (reach - spokeInner) * Math.min(1, t);
      const perp = (rand(i * 9 + d * 3 + 2) - 0.5) * 0.024 * PX; // tiny perpendicular spread
      const px2 = CX + Math.cos(ang) * rr - Math.sin(ang) * perp;
      const py2 = CY + Math.sin(ang) * rr + Math.cos(ang) * perp;
      const dr = (0.006 + rand(i * 5 + d) * 0.006) * PX; // 6.5–13px dots
      dots.push({
        x: px2,
        y: py2,
        r: dr,
        start: start + 2 + d * DOT_STEP,
        isAccent: isAccentSpoke,
      });
    }
    spokeData.push({ x1, y1, x2, y2, start, dots });
  }

  // SVG canvas covers the constellation region generously.
  const svgTop = CY - spokeOuterMax - 0.05 * PX;
  const svgH = 2 * (spokeOuterMax + 0.05 * PX);

  // ---- Kicker pill surface (DARK warm-glass / LIGHT frosted) ----
  const pillBg = isDark ? "rgba(51,28,6,0.55)" : "rgba(244,244,250,0.85)";
  const pillBorder = isDark
    ? `1px solid ${hexA(accent, 0.45)}`
    : "1px solid rgba(12,12,18,0.08)";
  const kickerPx = Math.round(0.02 * PX); // ~21.6px

  // Hub disc surface.
  const hubFill = isDark ? "#14111A" : "#FBF8FB";
  const hubEdge = isDark ? hexA(accent, 0.55) : hexA(accent, 0.7);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill (centered, y≈18%) ── */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "flex-start" }}
      >
        <div
          style={{
            marginTop: 0.165 * 1920,
            transform: `translateY(${kickerY}px)`,
            opacity: kickerOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: Math.round(kickerPx * 0.55),
            padding: `${Math.round(kickerPx * 0.62)}px ${Math.round(
              kickerPx * 0.95,
            )}px`,
            borderRadius: 999,
            background: pillBg,
            border: pillBorder,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: Math.round(kickerPx * 0.5),
              height: Math.round(kickerPx * 0.5),
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${6 + dotGlow * 10}px ${hexA(
                accent,
                0.4 + dotGlow * 0.5,
              )}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: kickerPx,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: grey,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>
      </AbsoluteFill>

      {/* ── Constellation: spokes + dots (SVG so edges can stroke-draw) ── */}
      <svg
        width={PX}
        height={svgH}
        viewBox={`0 ${svgTop} ${PX} ${svgH}`}
        style={{
          position: "absolute",
          left: 0,
          top: svgTop,
          width: PX,
          height: svgH,
          overflow: "visible",
        }}
      >
        {/* Spoke edges draw outward L→R via stroke-dash reveal. */}
        {spokeData.map((s, i) => {
          const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
          const draw = interpolate(
            frame,
            [s.start, s.start + EDGE_DUR],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const isAccentEdge =
            accentFrac > 0 && s.dots.length > 0 && s.dots[0].isAccent;
          return (
            <line
              key={`edge-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={
                isAccentEdge ? hexA(accent, 0.45) : spokeColor
              }
              strokeWidth={isAccentEdge ? 1.6 : 1.2}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
              opacity={draw <= 0 ? 0 : 1}
            />
          );
        })}

        {/* Dots spray outward along each spoke (pop with slight overshoot). */}
        {spokeData.map((s, i) =>
          s.dots.map((dot, di) => {
            const sp = spring({
              frame: frame - dot.start,
              fps,
              config: { damping: 11, mass: 0.5, stiffness: 190 },
              durationInFrames: 7,
            });
            const dScale = interpolate(sp, [0, 0.7, 1], [0.0, 1.05, 1]);
            const dOpacity = interpolate(
              frame,
              [dot.start, dot.start + 4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const color = dot.isAccent ? accent : dotNeutral;
            return (
              <circle
                key={`dot-${i}-${di}`}
                cx={dot.x}
                cy={dot.y}
                r={dot.r * dScale}
                fill={color}
                opacity={dOpacity * (dot.isAccent ? 0.95 : 0.72)}
              />
            );
          }),
        )}
      </svg>

      {/* ── Central ringed hub node ── */}
      <div
        style={{
          position: "absolute",
          left: CX - hubR,
          top: CY - hubR,
          width: hubR * 2,
          height: hubR * 2,
          opacity: hubOpacity,
          transform: `scale(${hubScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* Soft accent glow behind the disc (pulses). */}
        <div
          style={{
            position: "absolute",
            inset: -hubR * 0.7,
            borderRadius: "50%",
            background: `radial-gradient(circle at center, ${hexA(
              accent,
              0.45,
            )} 0%, ${hexA(accent, 0.12)} 45%, rgba(0,0,0,0) 70%)`,
            opacity: hubBloom * 0.9,
            filter: "blur(18px)",
            transform: `scale(${hubPulse})`,
          }}
        />
        {/* Disc fill. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: hubFill,
            border: `${0.0015 * PX}px solid ${
              isDark ? "rgba(255,255,255,0.08)" : "rgba(12,12,18,0.10)"
            }`,
            boxShadow: isDark
              ? `0 ${0.01 * PX}px ${0.03 * PX}px rgba(0,0,0,0.6)`
              : `0 ${0.008 * PX}px ${0.024 * PX}px rgba(0,0,0,0.14)`,
          }}
        />
        {/* Accent ring sweep (stroke-dash reveal). */}
        <svg
          width={hubR * 2}
          height={hubR * 2}
          viewBox={`0 0 ${hubR * 2} ${hubR * 2}`}
          style={{ position: "absolute", inset: 0 }}
        >
          {(() => {
            const r = hubR - 0.004 * PX;
            const c = 2 * Math.PI * r;
            return (
              <circle
                cx={hubR}
                cy={hubR}
                r={r}
                fill="none"
                stroke={hubEdge}
                strokeWidth={0.004 * PX}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - ringSweep)}
                transform={`rotate(-90 ${hubR} ${hubR})`}
              />
            );
          })()}
        </svg>
        {/* Hub contents: icon + mono label. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.006 * PX,
          }}
        >
          {p.hubIcon === "burst" ? (
            <HubBurst size={hubR * 0.7} accent={accent} bloom={hubBloom} />
          ) : p.hubIcon === "switch" ? (
            <SwitchGlyph size={hubR * 0.62} accent={accent} />
          ) : (
            <span
              style={{
                width: hubR * 0.28,
                height: hubR * 0.28,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 ${0.02 * PX}px ${hexA(accent, 0.8)}`,
              }}
            />
          )}
          {p.hubLabel.trim() !== S && (
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: 0.018 * PX,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ink,
                whiteSpace: "nowrap",
                marginTop: 0.004 * PX,
              }}
            >
              {p.hubLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Big stat + label (centered under the constellation) ── */}
      {hasStat && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0.585 * 1920,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${statY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: 0.155 * PX,
              letterSpacing: "-0.02em",
              lineHeight: 0.95,
              color: ink,
              opacity: statOpacity,
              transform: `scale(${statScale})`,
              transformOrigin: "50% 50%",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>{statBase}</span>
            {statSuffixShown !== "" && (
              <span
                style={{
                  color: accent,
                  opacity: suffixOpacity,
                  display: "inline-block",
                  transform: `scale(${suffixScale})`,
                  transformOrigin: "0% 100%",
                }}
              >
                {statSuffixShown}
              </span>
            )}
          </div>
          {hasLabel && (
            <span
              style={{
                marginTop: 0.018 * PX,
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: 0.026 * PX,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: grey,
                opacity: labelOpacity,
                transform: `translateY(${labelY}px)`,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {p.statLabel}
            </span>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Anthropic-style radiating burst glyph (pure SVG, rays bloom from center) ──
const HubBurst: React.FC<{ size: number; accent: string; bloom: number }> = ({
  size,
  accent,
  bloom,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const rays = 12;
  const inner = size * 0.12;
  const outer = size * 0.46 * Math.max(0.2, bloom);
  const strokeW = size * 0.07;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="hubBurstGlow">
          <stop offset="0%" stopColor={accent} stopOpacity={0.55 * bloom} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={size * 0.46} fill="url(#hubBurstGlow)" />
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * inner;
        const y1 = cy + Math.sin(a) * inner;
        const x2 = cx + Math.cos(a) * outer;
        const y2 = cy + Math.sin(a) * outer;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={inner * 0.9} fill={accent} />
    </svg>
  );
};

// ── Switchboard ⇄ glyph (two opposing arrows, pure SVG) ──
const SwitchGlyph: React.FC<{ size: number; accent: string }> = ({
  size,
  accent,
}) => {
  const sw = size * 0.09;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* top arrow → */}
      <path
        d="M4 9 H18 M14 5 L18 9 L14 13"
        stroke={accent}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* bottom arrow ← */}
      <path
        d="M20 15 H6 M10 11 L6 15 L10 19"
        stroke={accent}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
