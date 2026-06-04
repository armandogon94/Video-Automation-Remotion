/**
 * AbhiBackground — the two signature background modes of abhishek.devini's reels,
 * the shared canvas every replica template renders on top of:
 *
 *   • "dark"  — near-black base + a faint square GRID overlay + a soft RADIAL accent
 *               GLOW behind the hero text (the accent color tracks the topic's brand,
 *               e.g. Anthropic orange). The glow gently breathes.
 *   • "light" — a soft pastel MESH gradient (peach / lavender / blue blobs over a
 *               light base) + a few floating rounded-square shapes that drift slowly.
 *
 * Parameterized so the STYLE-SPEC tokens can refine exact colors without touching the
 * structure. Pure inline-style + Remotion; no external deps.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const abhiBackgroundSchema = z.object({
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Accent color for the radial glow (dark mode). */
  accentColor: z.string().default("#E8743B"),
  /** Glow center as fraction of frame. */
  glowXPct: z.number().default(0.5),
  glowYPct: z.number().default(0.42),
  /** Glow strength 0..1 (peak opacity of the accent wash). */
  glowStrength: z.number().default(0.26),
  /** Dark base color (warm near-black; a vertical gradient is built from it). */
  darkBase: z.string().default("#08050B"),
  /** Show the faint square grid (dark mode). */
  showGrid: z.boolean().default(true),
  gridSpacingPx: z.number().default(72),
  /** Light-mode mesh blob colors + base. */
  meshBase: z.string().default("#E7E0EA"),
  meshA: z.string().default("#F9C8BA"),
  meshB: z.string().default("#CBC9F9"),
  meshC: z.string().default("#E0EEE7"),
  /** Floating rounded squares (light mode). */
  showSquares: z.boolean().default(true),
  /** Subtle motion on/off. */
  animate: z.boolean().default(true),
});
export type AbhiBackgroundProps = z.infer<typeof abhiBackgroundSchema>;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiBackground: React.FC<Partial<AbhiBackgroundProps>> = (props) => {
  const p = abhiBackgroundSchema.parse(props);
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (p.mode === "dark") {
    // Glow breathes ±8% over ~3s.
    const breathe = p.animate
      ? 1 + 0.08 * Math.sin((frame / (30 * 1.6)) * Math.PI)
      : 1;
    const gx = `${p.glowXPct * 100}%`;
    const gy = `${p.glowYPct * 100}%`;
    return (
      <AbsoluteFill style={{ background: `linear-gradient(178deg, ${p.darkBase} 0%, #110E12 55%, #0A0709 100%)` }}>
        {/* faint warm square grid */}
        {p.showGrid ? (
          <AbsoluteFill
            style={{
              backgroundImage: `linear-gradient(${hexA("#FFEFE2", 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${hexA("#FFEFE2", 0.045)} 1px, transparent 1px)`,
              backgroundSize: `${p.gridSpacingPx}px ${p.gridSpacingPx}px`,
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 85%)",
            }}
          />
        ) : null}
        {/* radial accent glow */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle ${Math.round(width * 0.55 * breathe)}px at ${gx} ${gy}, ${hexA(p.accentColor, p.glowStrength)} 0%, ${hexA(p.accentColor, p.glowStrength * 0.35)} 28%, transparent 62%)`,
          }}
        />
        {/* gentle bottom vignette for depth */}
        <AbsoluteFill
          style={{ background: `linear-gradient(180deg, transparent 60%, ${hexA("#000000", 0.5)} 100%)` }}
        />
      </AbsoluteFill>
    );
  }

  // ── light mesh ──
  const drift = p.animate ? Math.sin((frame / (30 * 4)) * Math.PI) : 0;
  return (
    <AbsoluteFill style={{ background: p.meshBase, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(closest-side at ${22 + drift * 4}% 24%, ${hexA(p.meshA, 0.95)}, transparent),` +
            `radial-gradient(closest-side at 84% ${30 - drift * 5}%, ${hexA(p.meshB, 0.92)}, transparent),` +
            `radial-gradient(closest-side at 40% 86%, ${hexA(p.meshC, 0.92)}, transparent),` +
            `radial-gradient(closest-side at 75% 78%, ${hexA(p.meshA, 0.6)}, transparent)`,
          filter: "saturate(1.05)",
        }}
      />
      {p.showSquares
        ? [
            { x: 0.1, y: 0.66, s: 96, r: -8, ph: 0 },
            { x: 0.84, y: 0.6, s: 120, r: 10, ph: 1.5 },
            { x: 0.12, y: 0.2, s: 70, r: 6, ph: 3 },
            { x: 0.9, y: 0.86, s: 64, r: -12, ph: 4.2 },
          ].map((q, i) => {
            const fy = p.animate ? Math.sin((frame / (30 * 3)) * Math.PI + q.ph) * 10 : 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${q.x * width}px`,
                  top: `${q.y * height + fy}px`,
                  width: q.s,
                  height: q.s,
                  borderRadius: q.s * 0.28,
                  background: hexA("#FFFFFF", 0.5),
                  border: `1px solid ${hexA("#FFFFFF", 0.7)}`,
                  boxShadow: `0 12px 40px ${hexA("#1B2A4A", 0.08)}`,
                  transform: `rotate(${q.r}deg)`,
                  backdropFilter: "blur(2px)",
                }}
              />
            );
          })
        : null}
    </AbsoluteFill>
  );
};
