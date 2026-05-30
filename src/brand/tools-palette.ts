/**
 * Tools palette — accent colors keyed to known AI/dev tool brands.
 *
 * Pattern observed in @DIYSmartCode reels: when a video is ABOUT a specific product,
 * the accent color shifts to that product's brand color (Anthropic green for Claude content,
 * etc.). This creates subtle subject-resonance without abandoning the channel's overall
 * visual identity.
 *
 * Usage in templates:
 *
 *   const accentColor = subjectTool
 *     ? getToolAccent(subjectTool)
 *     : BRAND.colors.editorialAccent;
 *
 * Add new tools as they come up in content. Keys are lowercase slugs.
 */

export interface ToolPalette {
  /** Canonical display name. */
  name: string;
  /** Primary accent color (used as borders, marker highlights, hero accents). */
  accent: string;
  /**
   * Optional accent color tuned for LIGHT surfaces (e.g. cream paper).
   * When a tool's `accent` is calibrated for dark backgrounds (notably Google's
   * `#4285F4`, which only hits ~3.4:1 on `#FAF7F2` cream), this provides a
   * surface-aware override that passes WCAG AA. Defaults to `accent` when omitted.
   *
   * Wave-3 AA re-audit (§"Top 5 still-outstanding" #3) prescribed this field
   * for the Gemini override on cream paper.
   */
  accentOnLight?: string;
  /** Optional secondary accent (for two-color compositions). */
  secondary?: string;
  /** Optional brand-specific font hint (Inter is the default everywhere). */
  fontHint?: string;
}

export const TOOLS_PALETTE: Record<string, ToolPalette> = {
  // Anthropic family
  claude: {
    name: "Claude",
    accent: "#D4724B", // Anthropic warm orange/copper
    secondary: "#3FA85C", // Anthropic green (used for "good" signals)
  },
  "claude-code": {
    name: "Claude Code",
    accent: "#3FA85C", // Anthropic green
    secondary: "#D4724B",
  },
  anthropic: {
    name: "Anthropic",
    accent: "#D4724B",
    secondary: "#3FA85C",
  },

  // OpenAI family
  openai: {
    name: "OpenAI",
    accent: "#10A37F", // OpenAI teal/green
    secondary: "#0F172A",
  },
  gpt: {
    name: "GPT",
    accent: "#10A37F",
  },
  chatgpt: {
    name: "ChatGPT",
    accent: "#10A37F",
  },
  codex: {
    name: "Codex",
    accent: "#10A37F",
    secondary: "#0F172A",
  },

  // Google family
  gemini: {
    name: "Gemini",
    accent: "#4285F4", // Google blue — calibrated for dark backgrounds
    // Google's brand-recommended blue for LIGHT surfaces. `#4285F4` only hits
    // ~3.4:1 on cream paper (#FAF7F2) — sub-AA. `#1A73E8` passes AA at ~4.6:1.
    // Wave-3 AA re-audit (A2 Top-5 #2 / §"Top 5 still-outstanding" #3) fix.
    accentOnLight: "#1A73E8",
    secondary: "#9333EA", // Gemini purple (used in marketing)
  },
  google: {
    name: "Google",
    accent: "#4285F4",
  },
  "google-io": {
    name: "Google I/O",
    accent: "#4285F4",
    secondary: "#EA4335", // Google red
  },
  bard: {
    name: "Bard",
    accent: "#4285F4",
  },

  // Microsoft / GitHub family
  copilot: {
    name: "GitHub Copilot",
    accent: "#7C3AED", // Copilot purple
  },
  github: {
    name: "GitHub",
    accent: "#7C3AED",
    secondary: "#24292F",
  },

  // Meta family
  meta: {
    name: "Meta",
    accent: "#1877F2", // Meta blue
  },
  llama: {
    name: "Llama",
    accent: "#0866FF",
  },

  // Other frequent subjects
  cursor: {
    name: "Cursor",
    accent: "#000000",
    secondary: "#7C3AED",
  },
  windsurf: {
    name: "Windsurf",
    accent: "#00C2A8",
  },
  perplexity: {
    name: "Perplexity",
    accent: "#1FB6A8",
  },
  vercel: {
    name: "Vercel",
    accent: "#000000",
    secondary: "#FF0080",
  },
  mistral: {
    name: "Mistral",
    accent: "#FF7000",
  },
  xai: {
    name: "xAI",
    accent: "#000000",
  },
  grok: {
    name: "Grok",
    accent: "#000000",
  },

  // Default fallback (channel's own editorial accent)
  default: {
    name: "Armando Inteligencia (default)",
    accent: "#B33A2A", // channel warm-red
  },
};

/** Get the accent color for a tool slug. Falls back to default (channel warm-red). */
export function getToolAccent(toolSlug: string | undefined | null): string {
  if (!toolSlug) return TOOLS_PALETTE.default.accent;
  const palette = TOOLS_PALETTE[toolSlug.toLowerCase()];
  return palette?.accent ?? TOOLS_PALETTE.default.accent;
}

/**
 * Get the accent color for a tool slug, choosing the surface-appropriate variant.
 *
 * Wave-4 widened to accept all 5 palette modes:
 *   - Light surfaces (`cream`, `paper`) → returns `accentOnLight` if defined, else `accent`.
 *   - Dark surfaces (`dark`, `warm-black`, `true-black`) → always returns `accent`.
 *
 * Use this in compositions where the same tool accent must be readable on both
 * cream and dark palettes (notably the Gemini override on cream paper, which is
 * sub-AA at the default `#4285F4`). Wave-3 AA re-audit fix.
 */
export function getToolAccentForSurface(
  toolSlug: string | undefined | null,
  paletteMode: "cream" | "dark" | "warm-black" | "true-black" | "paper",
): string {
  if (!toolSlug) return TOOLS_PALETTE.default.accent;
  const palette = TOOLS_PALETTE[toolSlug.toLowerCase()];
  if (!palette) return TOOLS_PALETTE.default.accent;
  // Light-surface buckets: cream + paper both prefer the AA-tuned light accent.
  const isLightSurface = paletteMode === "cream" || paletteMode === "paper";
  if (isLightSurface && palette.accentOnLight) return palette.accentOnLight;
  return palette.accent;
}

/** Get the full palette entry for a tool slug, or null if unknown. */
export function getToolPalette(toolSlug: string | undefined | null): ToolPalette | null {
  if (!toolSlug) return null;
  return TOOLS_PALETTE[toolSlug.toLowerCase()] ?? null;
}
