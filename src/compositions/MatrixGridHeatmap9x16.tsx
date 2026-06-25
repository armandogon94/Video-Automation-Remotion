/**
 * MatrixGridHeatmap9x16 — vertical (1080×1920) attention-matrix / matmul
 * heatmap, replicating adamrosler's "inside the model" motion-graphic pattern.
 *
 * SOURCE FRAMES (studied):
 *   - references/creators/adamrosler/_backcat/ApCGuo1KufE/f04.jpg
 *       · "STANDARD ATTENTION" kicker over a fully-lit purple N×N matrix,
 *         "N" labels on the top and left edges, a corner-darkening, an "HBM"
 *         memory-bank pill below, and two mono accent lines (write/softmax/read
 *         + "64,000,000 ENTRIES / LAYER").
 *   - references/creators/adamrosler/_backcat/noZuNnJlezs/f04.jpg
 *       · near-black grid where vertical COLUMNS sweep bright blue, an inward
 *         arrow at the left edge, a bottom kicker line with a highlighted word.
 *
 * SYNTHESIS — the adamrosler grammar both frames share:
 *   - Dark near-black background, one saturated accent color + soft glow.
 *   - A rounded-cell N×N grid sitting in a darker recessed "panel".
 *   - Cells, whole rows, and whole columns light up to a target intensity on a
 *     SCHEDULE (the matmul / attention "wave"), each easing in + scaling from
 *     the cell center. This is the heart of the pattern.
 *   - Mono accent micro-labels (caps, tracked) and edge axis labels.
 *   - A hero headline + small kicker, single accent with glow.
 *
 * MOTION GRAMMAR (derived from useCurrentFrame — no Date.now / Math.random):
 *   - 0.0–0.5s  panel + grid scaffold fade/scale in (cells at base alpha).
 *   - kicker fades in early; headline reveals with a per-letter-free slide+fade.
 *   - highlightSchedule entries (kind: cell | row | col) each have a `frame`
 *     trigger; the targeted cells animate from base → target intensity over a
 *     short ease, with a glow pulse riding the leading edge (mirrors the
 *     column-sweep + cell-by-cell reveals in the source).
 *   - mono accent labels fade in last as the schedule settles.
 *
 * SELF-CONTAINED: imports only react, remotion, zod, ../brand (BRAND,
 * FONT_STACKS) + inline SVG. No external component deps.
 *
 * GOTCHAS honored:
 *   - Comp id has no underscore.
 *   - Hero/kicker/swept text use SOLID accent color (no background-clip:text)
 *     so headless renders don't show an opaque box.
 *   - All randomness/time derives from useCurrentFrame.
 */
import React, { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FONT_STACKS } from "../brand";

// ─── Schema (co-located; shared schemas.ts is not modified) ──────────────
const highlightEntrySchema = z.object({
  /** What lights up: a single cell, a whole row, or a whole column. */
  kind: z.enum(["cell", "row", "col"]).default("cell"),
  /** Frame at which this highlight begins animating in. */
  frame: z.number().default(0),
  /** Row index (used by "cell" and "row"). */
  row: z.number().default(0),
  /** Column index (used by "cell" and "col"). */
  col: z.number().default(0),
  /** Target intensity 0..1 the targeted cells ease toward. */
  intensity: z.number().min(0).max(1).default(1),
});

export const matrixGridHeatmap9x16Schema = z.object({
  audioUrl: z.string().default(""),
  /** Number of grid rows. */
  rows: z.number().int().min(1).max(24).default(10),
  /** Number of grid columns. */
  cols: z.number().int().min(1).max(24).default(10),
  /** Hero headline (solid accent, glow). */
  headline: z.string().default("ATTENTION IS A MATRIX"),
  /** Small kicker above the headline. */
  kicker: z.string().default("INSIDE THE MODEL"),
  /** Single saturated accent color (adamrosler discipline: one accent + glow). */
  accentColor: z.string().default("#6E63F6"),
  /** Near-black background. */
  backgroundColor: z.string().default("#0A0C12"),
  /**
   * Optional base intensity matrix [row][col] in 0..1 — the resting heatmap the
   * grid settles to. Missing/ragged entries default to a demo attention pattern
   * (banded diagonal, brighter near the lower-right "recent context" corner).
   */
  cellValues: z.array(z.array(z.number().min(0).max(1))).default([]),
  /** Reveal schedule: which cells/rows/cols light when. */
  highlightSchedule: z
    .array(highlightEntrySchema)
    .default([
      { kind: "col", frame: 40, row: 0, col: 3, intensity: 1 },
      { kind: "col", frame: 52, row: 0, col: 4, intensity: 0.95 },
      { kind: "row", frame: 72, row: 6, col: 0, intensity: 0.9 },
      { kind: "cell", frame: 92, row: 6, col: 4, intensity: 1 },
      { kind: "cell", frame: 102, row: 8, col: 7, intensity: 1 },
      { kind: "cell", frame: 110, row: 9, col: 9, intensity: 1 },
    ]),
  /** Axis labels. The top-left axis hint mirrors the source's "N" markers. */
  labels: z
    .object({
      rowAxis: z.string().default("N"),
      colAxis: z.string().default("N"),
      accentLabel: z.string().default("WRITE → SOFTMAX → READ"),
      footnote: z.string().default("64,000,000 ENTRIES / LAYER"),
    })
    .default({
      rowAxis: "N",
      colAxis: "N",
      accentLabel: "WRITE → SOFTMAX → READ",
      footnote: "64,000,000 ENTRIES / LAYER",
    }),
});
export type MatrixGridHeatmap9x16Props = z.infer<
  typeof matrixGridHeatmap9x16Schema
>;
type HighlightEntry = z.infer<typeof highlightEntrySchema>;

// ─── Layout constants ────────────────────────────────────────────────────
const WIDTH = 1080;
const HEIGHT = 1920;

// SVG panel region (the recessed grid card).
const PANEL_X = 110;
const PANEL_Y = 560;
const PANEL_W = WIDTH - PANEL_X * 2; // 860
const PANEL_H = 720;
const PANEL_RADIUS = 26;
const PANEL_INNER_PAD = 46; // space inside panel before the grid begins

const CELL_GAP = 6;
const CELL_RADIUS = 4;

// Animation tuning (frames @ 30fps).
const SCAFFOLD_IN = 14; // grid scaffold fade/scale
const HL_RISE = 12; // frames for a highlight to ease to target intensity
const HL_GLOW_TAIL = 10; // glow pulse tail after the rise

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Clamp helper kept local (no lodash). */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Build the resting base-intensity matrix. If the caller supplied cellValues we
 * normalize/pad it; otherwise we synthesize a demo attention pattern:
 *   - a soft causal band along the diagonal (each query attends near itself),
 *   - a brightening toward the lower-right "recent context" corner,
 *   - low ambient elsewhere so the grid structure always reads.
 */
function buildBaseMatrix(
  cellValues: number[][],
  rows: number,
  cols: number,
): number[][] {
  const out: number[][] = [];
  const hasInput = cellValues.length > 0;
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    const srcRow = cellValues[r] ?? [];
    for (let c = 0; c < cols; c++) {
      if (hasInput) {
        const v = srcRow[c];
        row.push(typeof v === "number" && Number.isFinite(v) ? clamp01(v) : 0.06);
        continue;
      }
      // Demo attention pattern.
      const rN = rows > 1 ? r / (rows - 1) : 0;
      const cN = cols > 1 ? c / (cols - 1) : 0;
      const diagDist = Math.abs(rN - cN);
      const band = Math.max(0, 1 - diagDist * 3.2) * 0.55; // causal band
      const corner = clamp01((rN + cN) / 2 - 0.35) * 0.7; // recent-context glow
      const ambient = 0.06;
      row.push(clamp01(ambient + band + corner));
    }
    out.push(row);
  }
  return out;
}

interface GridGeom {
  size: number;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
}

function layoutGrid(rows: number, cols: number): GridGeom {
  const availW = PANEL_W - PANEL_INNER_PAD * 2;
  const availH = PANEL_H - PANEL_INNER_PAD * 2;
  const cellW = (availW - CELL_GAP * (cols - 1)) / cols;
  const cellH = (availH - CELL_GAP * (rows - 1)) / rows;
  const size = Math.max(4, Math.min(cellW, cellH));
  const gridW = size * cols + CELL_GAP * (cols - 1);
  const gridH = size * rows + CELL_GAP * (rows - 1);
  const gridX = PANEL_X + (PANEL_W - gridW) / 2;
  const gridY = PANEL_Y + (PANEL_H - gridH) / 2;
  return { size, gridX, gridY, gridW, gridH };
}

/**
 * For a given cell (r,c) and the current frame, compute how much EXTRA intensity
 * the highlight schedule is adding on top of the base value, plus the glow
 * factor (0..1) riding the leading edge of any active highlight touching it.
 */
function highlightContribution(
  schedule: HighlightEntry[],
  r: number,
  c: number,
  frame: number,
): { add: number; glow: number } {
  let add = 0;
  let glow = 0;
  for (const e of schedule) {
    const targets =
      (e.kind === "cell" && e.row === r && e.col === c) ||
      (e.kind === "row" && e.row === r) ||
      (e.kind === "col" && e.col === c);
    if (!targets) continue;
    // Rise: ease from 0 → intensity over HL_RISE frames after e.frame.
    const rise = interpolate(frame, [e.frame, e.frame + HL_RISE], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    add = Math.max(add, e.intensity * rise);
    // Glow pulse: triangle envelope peaking as the rise completes.
    const g = interpolate(
      frame,
      [e.frame, e.frame + HL_RISE, e.frame + HL_RISE + HL_GLOW_TAIL],
      [0, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    glow = Math.max(glow, g);
  }
  return { add, glow };
}

/** Parse "#rrggbb" → {r,g,b}. Falls back to the accent default on bad input. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return { r: 110, g: 99, b: 246 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// ─── Composition ───────────────────────────────────────────────────────────
export const MatrixGridHeatmap9x16: React.FC<MatrixGridHeatmap9x16Props> = ({
  audioUrl,
  rows,
  cols,
  headline,
  kicker,
  accentColor,
  backgroundColor,
  cellValues,
  highlightSchedule,
  labels,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const safeRows = Math.max(1, Math.min(24, Math.round(rows)));
  const safeCols = Math.max(1, Math.min(24, Math.round(cols)));

  const base = useMemo(
    () => buildBaseMatrix(cellValues, safeRows, safeCols),
    [cellValues, safeRows, safeCols],
  );
  const geom = useMemo(
    () => layoutGrid(safeRows, safeCols),
    [safeRows, safeCols],
  );
  const accent = hexToRgb(accentColor);

  // ── Intro choreography ────────────────────────────────────────────
  const panelIn = interpolate(frame, [0, SCAFFOLD_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const panelScale = interpolate(panelIn, [0, 1], [0.94, 1]);

  const kickerOpacity = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerLetterSpacing = interpolate(frame, [6, 26], [14, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headlineOpacity = interpolate(frame, [16, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(frame, [16, 34], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Mono accent labels + axis labels settle in after the schedule mostly fires.
  const lastTrigger = highlightSchedule.reduce(
    (m, e) => Math.max(m, e.frame),
    0,
  );
  const labelsStart = lastTrigger + HL_RISE + 6;
  const labelsOpacity = interpolate(
    frame,
    [labelsStart, labelsStart + 16],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const axisOpacity = interpolate(frame, [SCAFFOLD_IN, SCAFFOLD_IN + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle exit fade so the comp closes cleanly when used as a scene.
  const exitFade = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Background ambient accent glow that subtly breathes (derived from frame).
  const breathe = 0.5 + 0.5 * Math.sin((frame / 30) * 1.1);
  const ambientGlowOpacity = 0.1 + 0.06 * breathe;

  const accentCss = `rgb(${accent.r}, ${accent.g}, ${accent.b})`;
  const panelFill = "#11141C";
  const panelStroke = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.28)`;

  // Cell center for transform-origin scaling (per-cell pop).
  const cellPop = (triggerFrame: number): number =>
    interpolate(frame, [triggerFrame, triggerFrame + HL_RISE], [0.86, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      <AbsoluteFill style={{ opacity: exitFade }}>
        {/* Ambient accent glow centered behind the grid panel. */}
        <div
          style={{
            position: "absolute",
            left: WIDTH / 2 - 520,
            top: PANEL_Y - 120,
            width: 1040,
            height: PANEL_H + 240,
            background: `radial-gradient(ellipse at center, ${accentCss} 0%, rgba(0,0,0,0) 62%)`,
            opacity: ambientGlowOpacity,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* ── Kicker ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 360,
            left: 0,
            width: WIDTH,
            textAlign: "center",
            fontFamily: FONT_STACKS.mono,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: kickerLetterSpacing,
            color: accentCss,
            opacity: kickerOpacity,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>

        {/* ── Hero headline (SOLID accent + glow — no clip:text) ───────── */}
        <div
          style={{
            position: "absolute",
            top: 410,
            left: 70,
            width: WIDTH - 140,
            textAlign: "center",
            fontFamily: FONT_STACKS.sans,
            fontSize: 70,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            color: BRAND.colors.textLight,
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            textShadow: `0 0 28px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.45)`,
          }}
        >
          {headline}
        </div>

        {/* ── SVG: panel + grid + axis labels ──────────────────────────── */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            pointerEvents: "none",
          }}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <defs>
            <filter id="mgh-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="mgh-panel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#161A24" />
              <stop offset="100%" stopColor="#0C0E15" />
            </linearGradient>
          </defs>

          {/* Recessed grid panel (scales in from center). */}
          <g
            transform={`translate(${WIDTH / 2} ${PANEL_Y + PANEL_H / 2}) scale(${panelScale}) translate(${-(WIDTH / 2)} ${-(PANEL_Y + PANEL_H / 2)})`}
            opacity={panelIn}
          >
            <rect
              x={PANEL_X}
              y={PANEL_Y}
              width={PANEL_W}
              height={PANEL_H}
              rx={PANEL_RADIUS}
              ry={PANEL_RADIUS}
              fill="url(#mgh-panel)"
              stroke={panelStroke}
              strokeWidth={1.5}
            />

            {/* Top axis label (col axis) — mirrors source "N" marker. */}
            <text
              x={geom.gridX + geom.gridW / 2}
              y={geom.gridY - 22}
              textAnchor="middle"
              fontFamily={FONT_STACKS.mono}
              fontSize={26}
              fontWeight={700}
              fill={BRAND.colors.textLight}
              opacity={axisOpacity * 0.85}
            >
              {labels.colAxis}
            </text>
            {/* Left axis label (row axis). */}
            <text
              x={geom.gridX - 26}
              y={geom.gridY + geom.gridH / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily={FONT_STACKS.mono}
              fontSize={26}
              fontWeight={700}
              fill={BRAND.colors.textLight}
              opacity={axisOpacity * 0.85}
              transform={`rotate(-90 ${geom.gridX - 26} ${geom.gridY + geom.gridH / 2})`}
            >
              {labels.rowAxis}
            </text>

            {/* Cells. */}
            {base.map((row, r) =>
              row.map((baseVal, c) => {
                const { add, glow } = highlightContribution(
                  highlightSchedule,
                  r,
                  c,
                  frame,
                );
                const intensity = clamp01(baseVal + add);
                // Base structure always reads (low border + faint fill).
                const fillAlpha = 0.05 + intensity * 0.95;
                const x = geom.gridX + c * (geom.size + CELL_GAP);
                const y = geom.gridY + r * (geom.size + CELL_GAP);
                const cx = x + geom.size / 2;
                const cy = y + geom.size / 2;

                // Per-cell pop scale: find the earliest active trigger for this
                // cell to drive the scale (cosmetic; defaults to settled = 1).
                let popTrigger = -999;
                for (const e of highlightSchedule) {
                  const targets =
                    (e.kind === "cell" && e.row === r && e.col === c) ||
                    (e.kind === "row" && e.row === r) ||
                    (e.kind === "col" && e.col === c);
                  if (targets && frame >= e.frame) {
                    popTrigger = Math.max(popTrigger, e.frame);
                  }
                }
                const pop = popTrigger > -999 ? cellPop(popTrigger) : 1;

                return (
                  <g key={`cell-${r}-${c}`}>
                    {/* Structural border — always faintly visible. */}
                    <rect
                      x={x}
                      y={y}
                      width={geom.size}
                      height={geom.size}
                      rx={CELL_RADIUS}
                      ry={CELL_RADIUS}
                      fill="none"
                      stroke={accentCss}
                      strokeOpacity={0.16}
                      strokeWidth={1}
                    />
                    {/* Intensity fill (scales from cell center). */}
                    <rect
                      x={x}
                      y={y}
                      width={geom.size}
                      height={geom.size}
                      rx={CELL_RADIUS}
                      ry={CELL_RADIUS}
                      fill={accentCss}
                      fillOpacity={fillAlpha}
                      transform={`translate(${cx} ${cy}) scale(${pop}) translate(${-cx} ${-cy})`}
                    />
                    {/* Glow pulse riding the leading edge of a highlight. */}
                    {glow > 0.01 ? (
                      <rect
                        x={x}
                        y={y}
                        width={geom.size}
                        height={geom.size}
                        rx={CELL_RADIUS}
                        ry={CELL_RADIUS}
                        fill="none"
                        stroke={accentCss}
                        strokeWidth={2}
                        strokeOpacity={0.9 * glow}
                        style={{ filter: "url(#mgh-glow)" }}
                      />
                    ) : null}
                  </g>
                );
              }),
            )}
          </g>
        </svg>

        {/* ── Mono accent labels below the panel (source: HBM lines) ────── */}
        <div
          style={{
            position: "absolute",
            top: PANEL_Y + PANEL_H + 70,
            left: 0,
            width: WIDTH,
            textAlign: "center",
            opacity: labelsOpacity,
          }}
        >
          {/* Memory-bank pill (mirrors the "HBM" capsule in the source). */}
          <div
            style={{
              display: "inline-block",
              padding: "18px 56px",
              borderRadius: 16,
              border: `1px solid rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.35)`,
              background: panelFill,
              fontFamily: FONT_STACKS.mono,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 10,
              color: BRAND.colors.textLight,
            }}
          >
            HBM
          </div>

          <div
            style={{
              marginTop: 56,
              fontFamily: FONT_STACKS.mono,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 1,
              color: accentCss,
              textShadow: `0 0 18px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.4)`,
            }}
          >
            {labels.accentLabel}
          </div>

          <div
            style={{
              marginTop: 26,
              fontFamily: FONT_STACKS.mono,
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#E0524A",
            }}
          >
            {labels.footnote}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
