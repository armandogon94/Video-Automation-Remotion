import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../../brand";

// ─── Brand palette (from the brand token; CYAN/WHITE are non-brand accents) ─────
const NAVY = BRAND.colors.primary;
const DEEP_NAVY = BRAND.colors.backgroundDark;
const GOLD = BRAND.colors.accent;
const CYAN = "#5BC0E8";
const WHITE = "#FFFFFF";

// ─── Schema ───────────────────────────────────────────────────────────────────

const statItemSchema = z.object({
  /** The big number / metric, e.g. "94%", "3.2M", "+47%" */
  value: z.string().default("0"),
  /** Short descriptive label beneath the number */
  label: z.string().default("Métrica"),
});

export const statRowTripleSchema = z.object({
  /**
   * 1–3 stat items rendered left→right.
   * Fewer than 3 centres the remaining items within the row.
   */
  stats: z
    .array(statItemSchema)
    .default([
      { value: "94%", label: "Precisión del modelo" },
      { value: "3.2M", label: "Usuarios activos" },
      { value: "+47%", label: "Crecimiento mensual" },
    ]),
  /** Anchor position — always lower-third for this molecule. */
  anchor: z
    .enum([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "left",
      "right",
      "lower-third",
    ])
    .default("lower-third"),
  /** Global frame at which the first stat begins to enter. */
  enterFrame: z.number().default(0),
  /** Frames each stat holds at full visibility before the optional exit. */
  holdFrames: z.number().default(72),
  /** Optional explicit frame to begin the fade-out exit. */
  exitFrame: z.number().optional(),
  /** Stagger between each stat's entrance in frames. Default 10. */
  staggerFrames: z.number().default(10),
  /** Colour for the large numeral. Alternates cyan / gold when "". */
  accentColor: z.string().default(""),
  /** Chip background colour. Default translucent deep-navy. */
  chipColor: z.string().default(""),
});

export type StatRowTripleProps = z.infer<typeof statRowTripleSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Alternates cyan → gold → cyan per index.
 * Overridden globally if accentColor is non-empty.
 */
function resolveAccent(accentColor: string, index: number): string {
  if (accentColor !== "") return accentColor;
  return index % 2 === 0 ? CYAN : GOLD;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StatRowTriple: React.FC<Partial<StatRowTripleProps>> = (rawProps) => {
  const p = statRowTripleSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const local = frame - p.enterFrame;

  // Determine the last frame of the last stat's entrance so we know the hold window.
  const lastStatEnterLocal = (p.stats.length - 1) * p.staggerFrames;
  const exitLocal = p.exitFrame !== undefined ? p.exitFrame - p.enterFrame : undefined;

  // Don't render before the overlay enters.
  if (local < 0) return null;

  // Compute block-level fade-out.
  let blockOpacity = 1;
  if (exitLocal !== undefined) {
    blockOpacity = interpolate(local, [exitLocal, exitLocal + 10], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (blockOpacity <= 0) return null;
  }

  // Anchor: lower-third full-width band — 6% safe inset from bottom.
  // The row is full-width, centred horizontally, sitting ~18% from the bottom.
  const safeInsetPx = Math.round(width * 0.06);

  const chipBg =
    p.chipColor !== ""
      ? p.chipColor
      : `rgba(15,27,45,0.82)`; // DEEP_NAVY at 82 % opacity

  const dividerColor = `rgba(255,255,255,0.18)`;

  // Void holdFrames + lastStatEnterLocal to satisfy TS strict (values are
  // semantically used as design intent; actual dwell enforced by exitFrame /
  // Sequence duration in the caller).
  void p.holdFrames;
  void lastStatEnterLocal;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Outer positioning wrapper — lower-third, full-width */}
      <div
        style={{
          position: "absolute",
          bottom: `${safeInsetPx}px`,
          left: `${safeInsetPx}px`,
          right: `${safeInsetPx}px`,
          opacity: blockOpacity,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
          // translucent pill container
          background: chipBg,
          borderRadius: 20,
          border: `1.5px solid rgba(91,192,232,0.22)`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(91,192,232,0.08)`,
          overflow: "hidden",
        }}
      >
        {p.stats.slice(0, 3).map((stat, i) => {
          const statLocal = local - i * p.staggerFrames;

          // Spring-in from below + fade.
          const entrySpring = spring({
            frame: statLocal,
            fps,
            config: { damping: 22, stiffness: 200, mass: 0.7 },
            durationInFrames: 16,
          });

          const translateY = interpolate(entrySpring, [0, 1], [28, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const statOpacity = interpolate(statLocal, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Number scale punch: 0.82 → 1.04 → 1.0 over 14 frames.
          const numScale = interpolate(
            statLocal,
            [0, 7, 14],
            [0.82, 1.04, 1.0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          if (statLocal < 0) {
            // Reserve the slot so layout doesn't jump when later items arrive.
            return (
              <div
                key={`stat-slot-${i}`}
                style={{ flex: 1, opacity: 0 }}
              />
            );
          }

          const accent = resolveAccent(p.accentColor, i);
          const isLast = i === p.stats.slice(0, 3).length - 1;

          return (
            <React.Fragment key={`stat-${i}`}>
              {/* Stat cell */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 28,
                  paddingBottom: 28,
                  paddingLeft: 16,
                  paddingRight: 16,
                  opacity: statOpacity,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {/* Big number */}
                <span
                  style={{
                    fontFamily: FONT_STACKS.condensed,
                    fontWeight: 700,
                    fontSize: 74,
                    lineHeight: 1,
                    color: accent,
                    letterSpacing: "-0.01em",
                    textShadow: `0 2px 12px rgba(0,0,0,0.55), 0 0 28px ${accent}55`,
                    transform: `scale(${numScale})`,
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stat.value}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 600,
                    fontSize: 22,
                    lineHeight: 1.25,
                    color: WHITE,
                    textAlign: "center",
                    marginTop: 10,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    textShadow: `0 1px 6px rgba(0,0,0,0.7)`,
                    maxWidth: 220,
                  }}
                >
                  {stat.label}
                </span>

                {/* Gold accent underline beneath the label */}
                <div
                  style={{
                    marginTop: 10,
                    width: 36,
                    height: 3,
                    borderRadius: 2,
                    background: accent,
                    opacity: 0.8,
                  }}
                />
              </div>

              {/* Thin divider — not after the last item */}
              {!isLast && (
                <div
                  style={{
                    width: 1.5,
                    alignSelf: "stretch",
                    background: dividerColor,
                    margin: "20px 0",
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default StatRowTriple;
