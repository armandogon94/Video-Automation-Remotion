export { BRAND, BRAND_GRADIENT, BRAND_LOGO_FILENAMES } from "./config";
export type { Brand, BrandColors, BrandFonts } from "./config";

// Brand-set support (multi-brand templates) — opt-in by passing `brandId` prop.
export { BRANDS, DEFAULT_BRAND_ID, getBrand, getBrandLogoPath } from "./brands";
export type { BrandId, BrandIdentity, BrandWatermarkDefault } from "./brands";

// Tools palette — subject-brand-tinted accents (Claude=green, OpenAI=teal, etc.)
export {
  TOOLS_PALETTE,
  getToolAccent,
  getToolAccentForSurface,
  getToolPalette,
} from "./tools-palette";
export type { ToolPalette } from "./tools-palette";

// Palette modes — cream (default) vs dark (Carlos's cosmic editorial)
// Wave-4 additions: warm-black, true-black, paper.
export {
  CREAM_PALETTE,
  DARK_PALETTE,
  WARM_BLACK_PALETTE,
  TRUE_BLACK_PALETTE,
  PAPER_PALETTE,
  getPalette,
  resolveColors,
  getBodyTextColor,
  isDarkPalette,
  ALL_PALETTE_MODES,
} from "./palettes";
export type { Palette, PaletteMode } from "./palettes";

// Shared font stacks (per A3 audit — single mono stack + brand sans/serif).
export { FONT_STACKS } from "./fonts";
