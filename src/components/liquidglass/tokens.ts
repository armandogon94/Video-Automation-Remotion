/**
 * liquidGlass/tokens — the shared "liquid-glass" MATERIAL token layer.
 *
 * WHY THIS EXISTS (austin.marchese + nateherk study, 2026-06-26)
 * -------------------------------------------------------------
 * A 3-reviewer animation study (Opus + Codex GPT-5.5 + Gemini 3.5 Flash, all in
 * agreement — see docs/research/austin-anim/FINAL-CONSENSUS.md) concluded that
 * @austin.marchese's motion vocabulary is @nateherk's "liquid-glass" design
 * system RESKINNED warm: translucent rounded-rect cards with a glowing rim,
 * a soft inner highlight, and a two-stage "settle → glow-bloom" entrance. It is
 * a MATERIAL, not a new template — so it lives here as reusable tokens that any
 * existing composition can adopt, with **warm-vs-cool as a token, not a fork**:
 *   - `brand` : our Armando-Inteligencia navy/gold (the default).
 *   - `warm`  : austin's burgundy/magenta/orange (parity / reference renders).
 *   - `cool`  : nate's cyan/teal (parity / reference renders).
 *
 * Pairs with the GlowPulseOverlay atom (two-stage rim-settle → glow-bloom) and is
 * consumed by LitSphereGlyph, ClauseHighlightPhrase, PromptCardPedagogy, etc.
 */
import type React from "react";
import { BRAND } from "../../brand/config";

/** Cream paper accent (matches the project brand note; not in brand/config.json). */
export const LG_CREAM = "#FAF7F2";

export type LiquidGlassTheme = "brand" | "warm" | "cool";

export interface LiquidGlassThemeTokens {
  /** Primary glow / rim accent (the "powered-on" hue). */
  glow: string;
  /** Solid border color (settles crisp BEFORE the glow blooms). */
  border: string;
  /** Translucent card fill (sits over a dark or footage backdrop). */
  fill: string;
  /** Secondary accent (underlines, sub-metric chips, highlights). */
  accent: string;
  /** Ink color for text that sits ON a light/cream card. */
  inkOnLight: string;
  /** Ink color for text that sits ON the translucent dark card. */
  inkOnGlass: string;
}

/**
 * The three reskins. `brand` is the only one used in shipped Spanish content;
 * `warm` / `cool` exist so we can render austin/nate parity studies from the
 * SAME atoms by flipping one token, never by forking a component.
 */
export const LG_THEMES: Record<LiquidGlassTheme, LiquidGlassThemeTokens> = {
  brand: {
    glow: BRAND.colors.accent, // #D4AF37 gold
    border: "rgba(212,175,55,0.85)",
    fill: "rgba(27,58,110,0.22)", // navy #1B3A6E @ low alpha
    accent: BRAND.colors.accent,
    inkOnLight: BRAND.colors.primary,
    inkOnGlass: "#FFFFFF",
  },
  warm: {
    glow: "#D4477F", // austin magenta
    border: "rgba(212,71,127,0.85)",
    fill: "rgba(184,92,75,0.20)", // burgundy #B85C4B @ low alpha
    accent: "#E08A3C", // warm orange
    inkOnLight: "#7A2540",
    inkOnGlass: "#FFFFFF",
  },
  cool: {
    glow: "#3FD0C9", // nate teal/cyan
    border: "rgba(63,208,201,0.85)",
    fill: "rgba(16,40,54,0.30)",
    accent: "#5BC0E8",
    inkOnLight: "#0B3A42",
    inkOnGlass: "#FFFFFF",
  },
};

/** Resolve a theme token set, defaulting to `brand`. */
export function lgTheme(theme: LiquidGlassTheme = "brand"): LiquidGlassThemeTokens {
  return LG_THEMES[theme];
}

/**
 * Box-shadow string for the signature rim glow. `sigma` ~ the blur radius in px;
 * `intensity` (0..1) scales the alpha so callers can animate the glow BLOOM
 * independently of the (crisp) border — see GlowPulseOverlay's two-stage timing.
 */
export function glassGlow(color: string, sigma = 18, intensity = 1): string {
  const a = Math.max(0, Math.min(1, intensity));
  // Two stacked shadows: a tight rim + a wide bloom, both alpha-scaled.
  return [
    `0 0 ${Math.round(sigma * 0.5)}px ${withAlpha(color, 0.55 * a)}`,
    `0 0 ${Math.round(sigma * 1.6)}px ${withAlpha(color, 0.35 * a)}`,
  ].join(", ");
}

/**
 * The base "glass card" CSS. Translucent fill + crisp border + frosted blur +
 * soft inner top-highlight (the liquid-glass sheen). Glow is intentionally NOT
 * baked in here — wrap with GlowPulseOverlay so the bloom can animate on settle.
 */
export function glassCardStyle(opts: {
  theme?: LiquidGlassTheme;
  radius?: number;
  borderWidth?: number;
  padding?: number | string;
}): React.CSSProperties {
  const t = lgTheme(opts.theme);
  const radius = opts.radius ?? 28;
  const borderWidth = opts.borderWidth ?? 2;
  return {
    background: t.fill,
    border: `${borderWidth}px solid ${t.border}`,
    borderRadius: radius,
    padding: opts.padding ?? 0,
    // Frosted glass — already used in ~12 components per the source audit.
    backdropFilter: "blur(14px) saturate(1.2)",
    WebkitBackdropFilter: "blur(14px) saturate(1.2)",
    // Soft inner sheen (top highlight) + a hairline base shadow for depth.
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 30px rgba(0,0,0,0.35)`,
  };
}

/** Add an alpha channel to a #rrggbb hex (passes rgba()/hsl()/named through). */
export function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const m = /^#([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!m) return color; // already rgba()/hsl()/named — leave as-is
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
