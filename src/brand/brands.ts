/**
 * Brand-set support — the channel has 4 sub-brand identities:
 *   - Armando Inteligencia (default, main channel)
 *   - 305 AI (agency / B2B consulting)
 *   - AI Leadership Lab (executive education)
 *   - IA Ejecutiva 90 (90-day cohort program)
 *
 * Every composition should accept a `brandId` prop. When the prop is omitted,
 * we fall back to the default brand from `brands.json`.
 *
 * Until the sub-brands ship their first cross-brand video, their palettes are
 * placeholders that mirror Armando Inteligencia. Update `brand/brands.json`
 * when actual palettes are confirmed.
 */
import brandsJson from "../../brand/brands.json";

export type BrandId =
  | "armando-inteligencia"
  | "305-ai"
  | "ai-leadership-lab"
  | "ia-ejecutiva-90";

export interface BrandColors {
  primary: string;
  accent: string;
  background: string;
  backgroundDark: string;
  text: string;
  textLight: string;
  muted: string;
  /** Editorial-style cream paper background (impeccable look). */
  paper: string;
  /** Editorial ink color (text on cream). */
  ink: string;
  /** Editorial accent (warm-red for editorial templates). */
  editorialAccent: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
  accent: string;
}

export interface BrandWatermarkDefault {
  logo: string;
  size: number;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  opacity: number;
}

export interface BrandIdentity {
  id: BrandId;
  name: string;
  handle: string;
  tagline?: string;
  colors: BrandColors;
  fonts: BrandFonts;
  logoFolder: string;
  logoFiles: Record<string, string>;
  watermarkDefault: BrandWatermarkDefault;
}

interface BrandsFile {
  defaultBrandId: BrandId;
  brands: Record<BrandId, BrandIdentity>;
}

const parsed = brandsJson as unknown as BrandsFile;

export const BRANDS: Record<BrandId, BrandIdentity> = parsed.brands;
export const DEFAULT_BRAND_ID: BrandId = parsed.defaultBrandId;

/** Get a brand by id, falling back to default. */
export function getBrand(id?: BrandId | string): BrandIdentity {
  if (!id) return BRANDS[DEFAULT_BRAND_ID];
  const brand = BRANDS[id as BrandId];
  if (!brand) {
    if (typeof console !== "undefined") {
      console.warn(`[brand] Unknown brandId "${id}" — falling back to ${DEFAULT_BRAND_ID}.`);
    }
    return BRANDS[DEFAULT_BRAND_ID];
  }
  return brand;
}

/** Resolve a logo path (relative to project root or staticFile root) for a given brand + logo key. */
export function getBrandLogoPath(brandId: BrandId | string | undefined, logoKey: string): string {
  const brand = getBrand(brandId);
  const filename = brand.logoFiles[logoKey];
  if (!filename) {
    if (typeof console !== "undefined") {
      console.warn(`[brand] Brand ${brand.id} has no logo key "${logoKey}". Falling back to first available.`);
    }
    const firstKey = Object.keys(brand.logoFiles)[0];
    return `${brand.logoFolder}/${brand.logoFiles[firstKey]}`;
  }
  return `${brand.logoFolder}/${filename}`;
}
