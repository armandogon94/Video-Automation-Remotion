import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";

loadInter("normal", {
  weights: ["300", "400", "500", "600", "700", "800", "900"],
});

// Per A3 audit: standardize mono usage on JetBrains Mono so the editorial
// code-annotation look ships consistently rather than falling back to the OS
// mono on most rendering machines. Pin weights to the three the compositions
// actually use (400 body, 500 medium, 700 emphasis).
loadJetBrainsMono("normal", {
  weights: ["400", "500", "700"],
});

// Wave-4 Carlos V5 + DIYSmart V5 consensus: 3-family typography stack
// (sans + mono + serif italic) is the cross-creator HIGH-confidence finding.
// Fira Code adds programming ligatures (`→`, `=>`, `!=`) that Carlos's
// terminal scenes show explicitly — paired with JetBrains Mono per kit.
loadFiraCode("normal", {
  weights: ["400", "500", "600", "700"],
});

// Playfair Display Italic = the editorial "this is an idea, slow down" voice.
// Carlos uses it for hero italic words (CRITERIO/CAUSAL), numeric percentages
// (3%, 1.4%, 0.8%), and contrastive `vs` separators. DIYSmart V5 calls out
// the same italic-as-voice trick (Georgia serif in cream kit).
loadPlayfairDisplay("normal", { weights: ["400", "700", "900"] });
loadPlayfairDisplay("italic", { weights: ["400", "700", "900"] });

/**
 * Brand-wide font stacks. Import these instead of inlining font-family strings
 * in compositions — keeps both monospace usages aligned (per A3 audit) and lets
 * us swap a face globally if licensing changes.
 *
 * Wave-4 additions:
 *  - `monoCode` — Fira Code for terminal/editor mockup chrome (ligatures).
 *  - `serifItalic` — Playfair Display Italic for editorial accent words.
 */
export const FONT_STACKS = {
  sans: "Inter, sans-serif",
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  serifItalic: "'Playfair Display', Georgia, 'Times New Roman', serif",
  /** Loaded via @remotion/google-fonts so JetBrains Mono renders identically
   *  in Studio and in headless renders, with native fallbacks if the loader
   *  hasn't run yet (e.g. SSR snapshot). Used for body chrome / UI labels. */
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  /** Fira Code — preferred inside terminal/editor mockups for the ligature
   *  arrow + bold-comparator look (`=>`, `!==`, `→`). Falls back to JetBrains
   *  Mono if FiraCode isn't loaded yet. */
  monoCode: "'Fira Code', 'JetBrains Mono', ui-monospace, monospace",
} as const;
