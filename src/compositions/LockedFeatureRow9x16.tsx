/**
 * LockedFeatureRow9x16 — vertical (1080×1920) feature-gating row stack.
 *
 * DIYSmart V3 N20. A vertical column of feature rows where each row has:
 *   - small lock-or-check icon (16px SVG, accent or muted)
 *   - feature name (Inter sans ~48px)
 *   - right-aligned colored pill in the row's state color (e.g. "US ONLY",
 *     "PRO", "Q3 2026", "BETA")
 *
 * Pill color per state:
 *   available     → mint #7CE49A
 *   locked-region → warm-red (palette accent)
 *   locked-tier   → gold #D4A04A
 *   soon          → indigo #6B6FD3
 *   beta          → cyan #5AB8C9
 *
 * House grammar (same as DiagramExplainer / BigNumberHero / PricingTierCard):
 *   - cream/dark palette resolution
 *   - optional subjectTool accent override
 *   - optional BrandBreadcrumb at top + SectionLabel chip
 *   - palette-driven grain overlay
 *   - optional bottom EditorialCaption strip
 *
 * Motion grammar:
 *   - Rows stagger in via `staggerEntry({ index, accelerate: true })`.
 *   - Per-row: editorial spring (damping 22 / stiffness 130 / mass 0.7),
 *     opacity 0 → 1 + translateY 12 → 0.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { LockedFeatureRow9x16Props, LockedFeatureRowItem } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { staggerEntry } from "../animation";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";

// ─── Layout constants ─────────────────────────────────────────────────
const SECTION_LABEL_Y = 220;
const ROWS_TOP_Y = 380;
const ROW_W = 920;
const ROW_H = 96;
const ROW_GAP = 18;
const ROW_RADIUS = 16;
const ICON_SIZE = 28; // visual size; SVG glyphs are 16×16 sized up to 28
const ICON_GUTTER = 18;
const PILL_RADIUS = 999;
const PILL_PADDING_X = 18;
const PILL_PADDING_Y = 8;

// Pill colors per state (works against both cream and dark backgrounds).
const STATE_PALETTE: Record<LockedFeatureRowItem["state"], string> = {
  available: "#7CE49A", // mint
  "locked-region": "#B33A2A", // warm-red (matches cream accent)
  "locked-tier": "#D4A04A", // gold
  soon: "#6B6FD3", // indigo
  beta: "#5AB8C9", // cyan
};

// Icon kind per state — locked states show a lock, "available" shows a check,
// "soon" shows a clock, "beta" shows a flask-ish dot.
type IconKind = "lock" | "check" | "clock" | "beta";
const STATE_ICON: Record<LockedFeatureRowItem["state"], IconKind> = {
  available: "check",
  "locked-region": "lock",
  "locked-tier": "lock",
  soon: "clock",
  beta: "beta",
};

// ─── Icons (inline SVG, 16×16 viewBox, scaled to ICON_SIZE) ────────────
const Icon: React.FC<{ kind: IconKind; color: string }> = ({ kind, color }) => {
  const common = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "lock":
      return (
        <svg {...common} aria-hidden>
          <rect x={3} y={7} width={10} height={7} rx={1.5} />
          <path d="M5 7V5.2a3 3 0 0 1 6 0V7" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 8.5l3 3 6.5-7" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} aria-hidden>
          <circle cx={8} cy={8} r={5.6} />
          <path d="M8 5v3.2l2 1.6" />
        </svg>
      );
    case "beta":
      return (
        <svg {...common} aria-hidden>
          <path d="M6 3v3.6L3.5 12a1.5 1.5 0 0 0 1.4 2h6.2a1.5 1.5 0 0 0 1.4-2L10 6.6V3" />
          <path d="M5.5 3h5" />
        </svg>
      );
  }
};

// ─── SectionLabel chip ────────────────────────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
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
        fontSize: 32,
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

// ─── Single feature row ───────────────────────────────────────────────
const FeatureRow: React.FC<{
  row: LockedFeatureRowItem;
  y: number;
  width: number;
  height: number;
  pillColor: string;
  inkColor: string;
  mutedColor: string;
  paletteMode: "cream" | "dark";
}> = ({ row, y, width, height, pillColor, inkColor, mutedColor, paletteMode }) => {
  // Inside <Sequence>, useCurrentFrame() is local — 0 at entry.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring entry.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);

  const isLocked =
    row.state === "locked-region" || row.state === "locked-tier";
  const iconColor = isLocked ? pillColor : mutedColor;

  // Row background sits subtly on the bg — a thin tinted plate, not a solid card.
  const rowBg =
    paletteMode === "dark"
      ? "rgba(255, 255, 255, 0.03)"
      : "rgba(0, 0, 0, 0.025)";
  const rowBorder =
    paletteMode === "dark"
      ? `1px solid rgba(255, 255, 255, 0.08)`
      : `1px solid rgba(0, 0, 0, 0.06)`;

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        top: y,
        width,
        height,
        background: rowBg,
        border: rowBorder,
        borderRadius: ROW_RADIUS,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        gap: ICON_GUTTER,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Lock / check icon */}
      <div
        style={{
          flex: `0 0 ${ICON_SIZE}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon kind={STATE_ICON[row.state]} color={iconColor} />
      </div>

      {/* Feature name */}
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: 44,
          color: getBodyTextColor(paletteMode, inkColor, 44),
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "-0.005em",
          opacity: isLocked ? 0.85 : 1,
        }}
      >
        {row.feature}
      </div>

      {/* Right-aligned state pill (only if modifier set) */}
      {row.modifier && (
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `${PILL_PADDING_Y}px ${PILL_PADDING_X}px`,
            borderRadius: PILL_RADIUS,
            background: pillColor,
            color: paletteMode === "dark" ? "#0A0F1A" : "#FFFFFF",
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            boxShadow:
              paletteMode === "dark"
                ? `0 0 0 1px ${pillColor}66, 0 2px 8px ${pillColor}44`
                : `0 2px 6px ${pillColor}33`,
          }}
        >
          {row.modifier}
        </div>
      )}
    </div>
  );
};

// ─── Composition ──────────────────────────────────────────────────────
export const LockedFeatureRow9x16: React.FC<LockedFeatureRow9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  rows,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
  staggerSeconds,
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

  // Compute Y positions + entry frames for each row.
  const baseStartFrame = Math.round(enterSeconds * fps);
  const staggerFrames = Math.round(staggerSeconds * fps);

  const layout = rows.map((row, i) => {
    const y = ROWS_TOP_Y + i * (ROW_H + ROW_GAP);
    const entryFrame = staggerEntry({
      index: i,
      baseStartFrame,
      staggerFrames,
      accelerate: true,
    });
    return { row, y, entryFrame };
  });

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

      {/* Section label chip */}
      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* Feature rows */}
      {layout.map((entry, i) => {
        const pillColor =
          entry.row.color || STATE_PALETTE[entry.row.state] || resolvedAccent;
        return (
          <Sequence
            key={`row-${i}`}
            from={entry.entryFrame}
            durationInFrames={9999}
            layout="none"
          >
            <FeatureRow
              row={entry.row}
              y={entry.y}
              width={ROW_W}
              height={ROW_H}
              pillColor={pillColor}
              inkColor={resolvedInk}
              mutedColor={resolvedMuted}
              paletteMode={palette}
            />
          </Sequence>
        );
      })}

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 140,
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
