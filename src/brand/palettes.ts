/**
 * Palette modes — cream, dark (Carlos cosmic editorial), warm-black (Carlos refined),
 * true-black (Bilawal OSINT), paper (Simon whiteboard).
 *
 * Wave-4 consensus added 3 modes beyond the original cream/dark pair:
 *   - `warm-black`: Carlos V5 — `#0A0608` → `#1B0F10` warm vignette, NOT pure #000.
 *   - `true-black`: Bilawal V5 — `#000000` true black so phone bezels vanish.
 *   - `paper`: Simon V5 — `#F1EDE8` warm off-white for whiteboard scenes.
 *
 * Templates accept a `palette` prop ("cream" | "dark" | "warm-black" | "true-black" | "paper").
 */

export interface Palette {
  /** Background fill. */
  paper: string;
  /** Primary text color. */
  ink: string;
  /** Accent color — borders, highlights, marker sweeps. */
  accent: string;
  /** Muted secondary text / borders. */
  muted: string;
  /** Color used for white-on-accent text inside CTAs (typically pure white on warm-red, dark-text on amber-gold for dark mode). */
  onAccent: string;
  /** Drop-shadow color for elevated elements (matches accent at low alpha). */
  accentShadow: string;
  /** Optional radial-gradient overlay color for "paper grain" feel. */
  grainOverlay: string;
}

export const CREAM_PALETTE: Palette = {
  paper: "#FAF7F2",
  ink: "#1A1A1A",
  accent: "#B33A2A", // warm editorial red
  muted: "#6B6760",
  onAccent: "#FFFFFF",
  accentShadow: "rgba(179, 58, 42, 0.25)",
  grainOverlay:
    "radial-gradient(ellipse at top, rgba(255,255,255,0.6) 0%, rgba(0,0,0,0.02) 100%)",
};

export const DARK_PALETTE: Palette = {
  paper: "#0A0F1A", // deep warm-navy black
  ink: "#F2E9D8", // warm cream text on dark
  accent: "#D4A04A", // warm amber/gold (matches Carlos's dark-editorial accent)
  muted: "#7A6F5C", // warm gray for sublabels
  onAccent: "#0A0F1A", // dark text on bright amber CTA
  accentShadow: "rgba(212, 160, 74, 0.25)",
  grainOverlay:
    "radial-gradient(ellipse at top, rgba(212, 160, 74, 0.12) 0%, rgba(0,0,0,0.40) 100%)",
};

// Carlos V5: "Adopt warm near-black + radial vignette (warm). Pure #000 is a Word-doc tell."
// Background = `#080608` → `#1B0F10` warm center via grainOverlay.
// Text = warm off-white `#F1ECE1` (not pure #FFFFFF — pure white = Word-doc tell).
export const WARM_BLACK_PALETTE: Palette = {
  paper: "#080608",
  ink: "#F1ECE1", // warm off-white (Carlos signature)
  accent: "#E89B7A", // coral / salmon (Carlos's "editorial concept" accent)
  muted: "#8B847A",
  onAccent: "#1A1410",
  accentShadow: "rgba(232, 155, 122, 0.28)",
  grainOverlay:
    "radial-gradient(ellipse at center, rgba(232, 155, 122, 0.10) 0%, rgba(0,0,0,0.50) 70%)",
};

// Bilawal V5: "true #000 black so letterbox bars vanish into the device bezel."
// Two-accent discipline: amber + cyan + nothing else (reds = negative, yellow = CTA only).
export const TRUE_BLACK_PALETTE: Palette = {
  paper: "#000000",
  ink: "#FFFFFF",
  accent: "#D4AF37", // our brand gold (replaces Bilawal's amber #E0B96A)
  muted: "#7A8794",
  onAccent: "#000000",
  accentShadow: "rgba(212, 175, 55, 0.30)",
  grainOverlay: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.04) 0%, rgba(0,0,0,0.0) 70%)",
};

// Simon V5: "Off-white paper #F1EDE8 (NOT pure #FFFFFF). Pure white reads as a UI
// rectangle; off-white reads as a sheet of paper." Used for whiteboard scenes.
export const PAPER_PALETTE: Palette = {
  paper: "#F1EDE8",
  ink: "#0A0A0A",
  accent: "#5C2EE5", // Simon's signature purple (container-only)
  muted: "#7C7E94",
  onAccent: "#FFFFFF",
  accentShadow: "rgba(92, 46, 229, 0.20)",
  grainOverlay:
    "radial-gradient(ellipse at top, rgba(255,255,255,0.55) 0%, rgba(0,0,0,0.03) 100%)",
};

export type PaletteMode =
  | "cream"
  | "dark"
  | "warm-black"
  | "true-black"
  | "paper";

export function getPalette(mode: PaletteMode = "cream"): Palette {
  switch (mode) {
    case "dark":
      return DARK_PALETTE;
    case "warm-black":
      return WARM_BLACK_PALETTE;
    case "true-black":
      return TRUE_BLACK_PALETTE;
    case "paper":
      return PAPER_PALETTE;
    case "cream":
    default:
      return CREAM_PALETTE;
  }
}

/**
 * Resolve effective colors for a composition: palette defaults + per-color overrides.
 * Lets users either pick a palette OR set individual hex colors.
 */
export function resolveColors(
  paletteMode: PaletteMode = "cream",
  overrides: Partial<Pick<Palette, "paper" | "ink" | "accent" | "muted">> = {},
): Palette {
  const base = getPalette(paletteMode);
  return {
    ...base,
    paper: overrides.paper ?? base.paper,
    ink: overrides.ink ?? base.ink,
    accent: overrides.accent ?? base.accent,
    muted: overrides.muted ?? base.muted,
    // onAccent + accentShadow + grainOverlay derive from the base palette
  };
}

/**
 * Body-text contrast lookup for dark-palette rendering (A3 audit).
 *
 * In the dark palette `ink` is `#F2E9D8` (warm cream) — gorgeous on display-size
 * type (~100px+) but anti-aliasing soft on medium-sized text. For body text
 * larger than 30px we switch to pure white to sharpen the rendered strokes
 * against the near-black paper. Smaller text + accents stay on the cream ink
 * so the warm character of the palette is preserved.
 *
 * On `warm-black` the ink is already #F1ECE1 (Carlos's signature warm-cream) —
 * leave as-is, no switch (warmth is the point).
 * On `true-black` the ink is already pure white — no switch needed.
 * On `paper` the ink is #0A0A0A — no contrast issue.
 *
 * No-op on cream / warm-black / true-black / paper modes.
 */
export function getBodyTextColor(
  paletteMode: PaletteMode,
  inkColor: string,
  fontSizePx: number,
): string {
  if (paletteMode === "dark" && fontSizePx > 30) return "#FFFFFF";
  return inkColor;
}

/**
 * True when the palette is a dark mode (any of dark / warm-black / true-black).
 * Useful for choosing PUNCHY vs EDITORIAL spring profiles, drop-shadow colors,
 * caption stroke color, etc.
 */
export function isDarkPalette(mode: PaletteMode): boolean {
  return mode === "dark" || mode === "warm-black" || mode === "true-black";
}

/**
 * The list of all valid palette modes — useful for Zod enums.
 */
export const ALL_PALETTE_MODES = [
  "cream",
  "dark",
  "warm-black",
  "true-black",
  "paper",
] as const satisfies readonly PaletteMode[];
