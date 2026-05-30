import brandJson from "../../brand/config.json";

export interface BrandColors {
  primary: string;
  accent: string;
  background: string;
  backgroundDark: string;
  text: string;
  textLight: string;
  muted: string;
  /** "TNF orange" — the one-keyword caption-pill accent from Nate B Jones's
   *  editorial 5-color accent palette (orange + cyan + mint + indigo + gold).
   *  Used to tint the single highlighted keyword in 16:9 caption pills. */
  keywordOrange: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
  accent: string;
}

export interface Brand {
  name: string;
  handle: string;
  colors: BrandColors;
  fonts: BrandFonts;
  logos: {
    glasses: string;
    letters: string;
    complete: string;
    avatar: string;
    avatarLetters: string;
  };
  logoSize: number;
  logoPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const brandBase = brandJson as Omit<Brand, "colors"> & {
  colors: Omit<BrandColors, "keywordOrange">;
};

export const BRAND: Brand = {
  ...brandBase,
  colors: {
    ...brandBase.colors,
    // "TNF orange" — one-keyword caption-pill accent (see BrandColors.keywordOrange).
    keywordOrange: "#E07B3C",
  },
};

export const BRAND_GRADIENT = {
  from: BRAND.colors.primary,
  to: BRAND.colors.backgroundDark,
} as const;

export const BRAND_LOGO_FILENAMES = {
  glasses: "logo-lentes.png",
  letters: "logo-letras.png",
  complete: "logo-completo.png",
  avatar: "avatar-pixar.png",
  avatarLetters: "avatar-pixar-letras.png",
} as const;
