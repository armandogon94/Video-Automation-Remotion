/**
 * AttentionHeatmap9x16 — vertical (1080×1920) attention-matrix visualization.
 *
 * Part of the "inside an LLM" trilogy alongside NeuralNetwork9x16 and the
 * forthcoming TokenStream9x16. Per docs/research/wave-1/R3-graph-nn-cs.md §2,
 * an N×M grid of cells whose alpha = attention weight (0..1). The cells fill
 * in scan order (row-by-row, left-to-right) over `fillDurationSeconds`. An
 * optional accent glow follows the currently-scanning cell. After the scan
 * settles, the row/col labels fade in (they're hinted in low-alpha during the
 * scan so the grid never reads as orphaned).
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~80px)
 *   - Optional title (Inter 700 ~58px, y ≈ 320)
 *   - HEATMAP ZONE (~y=460..1500): SVG with the N×M matrix.
 *       · Default 6×6 grid, ~880×880px area centered horizontally
 *       · Each cell: rounded rect (radius 4), fill = accent at α=weight
 *       · 1px low-alpha accent border on every cell (grid structure)
 *       · Row labels left of grid (Inter 500 24-28px, muted)
 *       · Col labels above the grid (rotated -45° so long tokens fit)
 *       · Optional accent glow ring around the currently-scanning cell
 *   - Optional EditorialCaption bottom strip (default OFF)
 *
 * Motion grammar:
 *   - Cells fade in to their weight value over 0.1s once "scanned"
 *   - Scan order: row-by-row, L→R, evenly distributed over fillDurationSeconds
 *   - Active-cell glow follows the scan head
 *   - After the scan completes, a 0.4s settling pause then row/col labels
 *     fade in fully (they're at ~0.3 alpha during the scan as anchors)
 *
 * SVG conventions mirror NeuralNetwork9x16: single viewBox, <defs> filters
 * for the glow ring, no external libs.
 */
import React, { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Schema (co-located — shared schemas.ts is not modified) ────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

export const attentionHeatmap9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  /** Row labels (input tokens). e.g. ["The", "cat", "sat", "on", "the", "mat"]. */
  rowLabels: z.array(z.string()).default([]),
  /** Col labels (output tokens or query positions). */
  colLabels: z.array(z.string()).default([]),
  /** Attention weights as a 2D matrix [row][col], values in 0..1. */
  weights: z.array(z.array(z.number().min(0).max(1))).default([]),
  /** Seconds for the scan-fill animation. Default 1.6. */
  fillDurationSeconds: z.number().min(0.3).max(8).default(1.6),
  /** Show active-cell glow ring during scan. */
  showActiveGlow: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type AttentionHeatmap9x16Props = z.infer<typeof attentionHeatmap9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const HEATMAP_TOP = 460;
const HEATMAP_LEFT = 0;
const HEATMAP_W = 1080;
const HEATMAP_H = 1040;

// Inside the SVG viewBox:
// - Top band reserved for column labels (rotated)
// - Left band reserved for row labels
// - Remainder is the N×M grid area, capped at ~880px square
const SVG_COL_LABEL_BAND = 150; // top band
const SVG_ROW_LABEL_BAND = 150; // left band
const SVG_GRID_PAD_RIGHT = 50;
const SVG_GRID_PAD_BOTTOM = 40;
const SVG_GRID_MAX = 880;

const CELL_RADIUS = 4;
const CELL_GAP = 4; // px between cells
const ACTIVE_GLOW_RING_OFFSET = 6; // ring sits this far outside the cell

const SETTLING_PAUSE_SEC = 0.4;
const PER_CELL_FADE_SEC = 0.1;

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Resolve a usable 2D matrix from the (possibly empty / ragged) input. We
 * always return N rows × M cols where N=rowLabels.length and M=colLabels.length,
 * defaulting to 0 for any missing cell. This keeps the renderer simple and
 * the schema permissive.
 */
function normalizeWeights(
  weights: number[][],
  rows: number,
  cols: number,
): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    const srcRow = weights[r] ?? [];
    for (let c = 0; c < cols; c++) {
      const v = srcRow[c];
      row.push(typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);
    }
    out.push(row);
  }
  return out;
}

interface CellLayout {
  size: number;
  gridW: number;
  gridH: number;
  gridX: number; // top-left x of grid inside the SVG
  gridY: number; // top-left y of grid inside the SVG
}

function layoutGrid(rows: number, cols: number): CellLayout {
  // Available area inside the SVG (after label bands)
  const availW = HEATMAP_W - SVG_ROW_LABEL_BAND - SVG_GRID_PAD_RIGHT;
  const availH = HEATMAP_H - SVG_COL_LABEL_BAND - SVG_GRID_PAD_BOTTOM;
  const maxCellW = (availW - CELL_GAP * (cols - 1)) / Math.max(1, cols);
  const maxCellH = (availH - CELL_GAP * (rows - 1)) / Math.max(1, rows);
  // Square cells, capped so the overall grid never exceeds SVG_GRID_MAX
  const fromGridCap =
    (SVG_GRID_MAX - CELL_GAP * (Math.max(rows, cols) - 1)) / Math.max(1, Math.max(rows, cols));
  const size = Math.max(8, Math.min(maxCellW, maxCellH, fromGridCap));
  const gridW = size * cols + CELL_GAP * (cols - 1);
  const gridH = size * rows + CELL_GAP * (rows - 1);
  // Center the grid horizontally inside the post-label area.
  const gridX = SVG_ROW_LABEL_BAND + (availW - gridW) / 2;
  const gridY = SVG_COL_LABEL_BAND + (availH - gridH) / 2;
  return { size, gridW, gridH, gridX, gridY };
}

// ─── Composition ──────────────────────────────────────────────────
export const AttentionHeatmap9x16: React.FC<AttentionHeatmap9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  rowLabels,
  colLabels,
  weights,
  fillDurationSeconds,
  showActiveGlow,
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
  const frame = useCurrentFrame();
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

  // Defensive sizing: at least 1×1 so the renderer never divides by zero.
  const rows = Math.max(1, rowLabels.length);
  const cols = Math.max(1, colLabels.length);
  const matrix = useMemo(
    () => normalizeWeights(weights, rows, cols),
    [weights, rows, cols],
  );
  const layout = useMemo(() => layoutGrid(rows, cols), [rows, cols]);

  // Total number of cells & per-cell scan interval.
  const totalCells = rows * cols;
  // Each cell's "scan start" time is evenly distributed across fillDurationSeconds.
  // The cell then fades from 0 to its weight value over PER_CELL_FADE_SEC.
  const perCellStartSec =
    totalCells > 1 ? fillDurationSeconds / totalCells : fillDurationSeconds;

  // Whole-grid fade-in (separate from per-cell scan fill) — 0.3s establishing fade
  const gridContainerOpacity = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label-fade timing: labels start at ~0.3 alpha during the scan, then fade to
  // 1.0 over 0.4s starting `SETTLING_PAUSE_SEC` after the scan completes.
  const scanCompleteSec = fillDurationSeconds;
  const labelFullStartSec = scanCompleteSec + SETTLING_PAUSE_SEC;
  const labelFullStartFrame = Math.round(labelFullStartSec * fps);
  const labelOpacity = interpolate(
    frame,
    [labelFullStartFrame, labelFullStartFrame + Math.round(0.4 * fps)],
    [0.4, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const nowSec = frame / fps;

  // ── Render ────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
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

      {/* Optional title (centered, ~y=320) */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 320,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 58,
            lineHeight: 1.08,
            color: resolvedInk,
            letterSpacing: "-0.015em",
            opacity: gridContainerOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* HEATMAP ZONE — SVG 1080×1040 */}
      <svg
        style={{
          position: "absolute",
          top: HEATMAP_TOP,
          left: HEATMAP_LEFT,
          width: HEATMAP_W,
          height: HEATMAP_H,
          opacity: gridContainerOpacity,
          pointerEvents: "none",
        }}
        viewBox={`0 0 ${HEATMAP_W} ${HEATMAP_H}`}
      >
        <defs>
          <filter
            id="ah-active-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Column labels (above the grid, rotated -45°) ───────── */}
        <g>
          {colLabels.map((label, c) => {
            const cx = layout.gridX + c * (layout.size + CELL_GAP) + layout.size / 2;
            const cy = layout.gridY - 18;
            return (
              <text
                key={`col-label-${c}`}
                x={cx}
                y={cy}
                textAnchor="start"
                fontFamily="Inter, sans-serif"
                fontWeight={500}
                fontSize={26}
                fill={resolvedMuted}
                opacity={labelOpacity}
                transform={`rotate(-45 ${cx} ${cy})`}
              >
                {label}
              </text>
            );
          })}
        </g>

        {/* ── Row labels (left of the grid) ─────────────────────── */}
        <g>
          {rowLabels.map((label, r) => {
            const tx = layout.gridX - 18;
            const ty = layout.gridY + r * (layout.size + CELL_GAP) + layout.size / 2;
            return (
              <text
                key={`row-label-${r}`}
                x={tx}
                y={ty}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="Inter, sans-serif"
                fontWeight={500}
                fontSize={28}
                fill={resolvedMuted}
                opacity={labelOpacity}
              >
                {label}
              </text>
            );
          })}
        </g>

        {/* ── Cells (scan-order fill) ──────────────────────────── */}
        <g>
          {matrix.map((row, r) =>
            row.map((weight, c) => {
              const scanIdx = r * cols + c;
              const cellStartSec = scanIdx * perCellStartSec;
              const cellFadeT = interpolate(
                nowSec,
                [cellStartSec, cellStartSec + PER_CELL_FADE_SEC],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const fillAlpha = weight * cellFadeT;
              const x = layout.gridX + c * (layout.size + CELL_GAP);
              const y = layout.gridY + r * (layout.size + CELL_GAP);
              return (
                <g key={`cell-${r}-${c}`}>
                  {/* Border first — always visible at low alpha so the grid
                      reads even when weights are low / pre-scan. */}
                  <rect
                    x={x}
                    y={y}
                    width={layout.size}
                    height={layout.size}
                    rx={CELL_RADIUS}
                    ry={CELL_RADIUS}
                    fill="none"
                    stroke={resolvedAccent}
                    strokeOpacity={0.22}
                    strokeWidth={1}
                  />
                  {/* Fill — alpha = weight once scanned */}
                  <rect
                    x={x}
                    y={y}
                    width={layout.size}
                    height={layout.size}
                    rx={CELL_RADIUS}
                    ry={CELL_RADIUS}
                    fill={resolvedAccent}
                    fillOpacity={fillAlpha}
                  />
                </g>
              );
            }),
          )}
        </g>

        {/* ── Active-cell glow ring (follows the scan head) ──────── */}
        {showActiveGlow &&
          (() => {
            // Find the cell currently being scanned: scanIdx where
            // cellStartSec <= nowSec < cellStartSec + PER_CELL_FADE_SEC + a tail
            const ACTIVE_TAIL_SEC = 0.18;
            let activeIdx = -1;
            for (let i = 0; i < totalCells; i++) {
              const cellStart = i * perCellStartSec;
              if (
                nowSec >= cellStart &&
                nowSec < cellStart + PER_CELL_FADE_SEC + ACTIVE_TAIL_SEC
              ) {
                activeIdx = i;
              }
            }
            if (activeIdx < 0) return null;
            const r = Math.floor(activeIdx / cols);
            const c = activeIdx % cols;
            const cellStart = activeIdx * perCellStartSec;
            const localT = Math.max(
              0,
              Math.min(
                1,
                (nowSec - cellStart) / (PER_CELL_FADE_SEC + ACTIVE_TAIL_SEC),
              ),
            );
            // Triangle envelope: peaks mid-fade, eases out.
            const ringAlpha = localT < 0.5 ? localT * 2 : 1 - (localT - 0.5) * 2;
            const x = layout.gridX + c * (layout.size + CELL_GAP);
            const y = layout.gridY + r * (layout.size + CELL_GAP);
            return (
              <rect
                x={x - ACTIVE_GLOW_RING_OFFSET}
                y={y - ACTIVE_GLOW_RING_OFFSET}
                width={layout.size + ACTIVE_GLOW_RING_OFFSET * 2}
                height={layout.size + ACTIVE_GLOW_RING_OFFSET * 2}
                rx={CELL_RADIUS + ACTIVE_GLOW_RING_OFFSET}
                ry={CELL_RADIUS + ACTIVE_GLOW_RING_OFFSET}
                fill="none"
                stroke={resolvedAccent}
                strokeWidth={2}
                strokeOpacity={0.9 * ringAlpha}
                style={{ filter: "url(#ah-active-glow)" }}
              />
            );
          })()}
      </svg>

      {/* Word-by-word captions (bottom strip) — optional, default OFF */}
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
