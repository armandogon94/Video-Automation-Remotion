/**
 * TitleCardKineticTwoLine16x9 — Nate B Jones consensus pattern H1.
 *
 * The most-used template across his long-form 16:9 corpus (5+ instances across
 * 3 videos): `iUSdS-6uwr4` anim-01 "Cloud Or Local" + anim-03 "Runtime
 * Defaults", `9aIYhjeYxzM` anim-01 "Moving Frontier" + anim-02 "Reference
 * Workflow", and `FtCdYhspm7w` anim-04 (the `SectionDividerTitleCard` instance
 * vote1 cataloged). Documented as H1 in
 * `docs/research/wave-6/natebjones-consensus.md`.
 *
 * Visual structure (1920 × 1080):
 *   - Full-frame dark-slate background (default `#0A0F1A`).
 *   - Soft accent-tinted radial glow halo sitting behind the typography stack
 *     for depth (default cyan `#5BC0E8` at 0.18 opacity, 720px radius).
 *   - Centered content stack:
 *       · Optional eyebrow (small mono uppercase tracked, accent color) at
 *         roughly y ≈ 400.
 *       · Headline (sans bold 140px, white, tight letter-spacing) centered on
 *         the midline (y ≈ 480 → 600 depending on line count).
 *       · Subtitle (sans muted-gray 48px, line-height 1.3) at roughly y ≈ 640.
 *   - Optional `<BrandBreadcrumb16x9>` top-left.
 *   - Optional `<BrandWatermark16x9>` bottom-right (logo + handle).
 *   - Optional caption strip (off by default — the on-card text IS the text
 *     layer, captions would compete).
 *
 * Motion grammar (transitionVerb):
 *   The whole card fades in over `fadeInFrames` (default 12) using
 *   `blurInFocus` (Carlos consensus utility — 14 → 0 px blur, 0.96 → 1.0
 *   scale, opacity 0 → 1), holds STATIC for `visibleFrames` (default 60 = 2 s),
 *   then fades out over `fadeOutFrames` (default 12). The soft radial halo
 *   sits behind the type for depth.
 *
 * Key difference vs `KineticTypoCard9x16`:
 *   `KineticTypoCard9x16` reveals N lines SEQUENTIALLY (per-line stagger with
 *   spring + opacity) and exits with a diagonal brush-wipe overlay — that's a
 *   typed-on / kinetic-typography card. THIS template is STATIC after the
 *   single fade-in: headline + subtitle + eyebrow all enter together, hold
 *   without per-word or per-line reveal, then fade out. Nate's section-divider
 *   cards do NOT animate per-word or per-line; they're a single beat with a
 *   long hold (~2 s) before the talking head returns. No typewriter, no
 *   per-line stagger, no brush-wipe — that is the H1 grammar.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import {
  ALL_PALETTE_MODES,
  FONT_STACKS,
  getPalette,
  getToolAccentForSurface,
  resolveColors,
} from "../brand";
import { blurInFocus } from "../animation/blurInFocus";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { EditorialCaption } from "../components/captions/EditorialCaption";

// ─── Locally-redeclared shared schemas ─────────────────────────────────
// Per the Wave-5 convention (mirrors BrandedOpener9x16 / KineticTypoCard9x16):
// shared schemas.ts doesn't export wordTimingSchema as a named value yet, so we
// redeclare it locally. Migration to the shared module is deferred work and
// the brief explicitly forbids editing schemas.ts.
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

// Watermark sub-schema mirrors `WatermarkStyle` in compositions/schemas.ts; we
// inline it here so this composition has no cross-comp prop coupling.
const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

// ─── Public schema + types ─────────────────────────────────────────────
export const titleCardKineticTwoLine16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Headline (large bold). */
  headline: z.string().default("Cloud Or Local"),
  /** Subtitle (smaller muted). */
  subtitle: z.string().default("The runtime question that defines 2026"),
  /** Optional eyebrow above the headline (small mono tracked). */
  eyebrow: z.string().default(""),

  /** Background style. */
  background: z
    .object({
      /** Dark slate base color. */
      color: z.string().default("#0A0F1A"),
      /** Optional radial glow color (center accent). */
      glowColor: z.string().default("#5BC0E8"),
      /** Glow intensity (0-1). Default 0.18. */
      glowOpacity: z.number().default(0.18),
      /** Glow radius (px). Default 720. */
      glowRadiusPx: z.number().default(720),
    })
    .default({
      color: "#0A0F1A",
      glowColor: "#5BC0E8",
      glowOpacity: 0.18,
      glowRadiusPx: 720,
    }),

  /** Typography. */
  typography: z
    .object({
      headlineFontSize: z.number().default(140),
      subtitleFontSize: z.number().default(48),
      eyebrowFontSize: z.number().default(24),
      headlineColor: z.string().default("#FFFFFF"),
      subtitleColor: z.string().default("#9AA0A6"),
      eyebrowColor: z.string().default("#5BC0E8"),
      headlineUppercase: z.boolean().default(false),
      eyebrowUppercase: z.boolean().default(true),
      letterSpacing: z.string().default("-0.02em"),
    })
    .default({
      headlineFontSize: 140,
      subtitleFontSize: 48,
      eyebrowFontSize: 24,
      headlineColor: "#FFFFFF",
      subtitleColor: "#9AA0A6",
      eyebrowColor: "#5BC0E8",
      headlineUppercase: false,
      eyebrowUppercase: true,
      letterSpacing: "-0.02em",
    }),

  /** Entry timing. */
  enterFrame: z.number().default(0),
  /** Fade-in frames (default 12 — Nate's smooth fade, not snappy). */
  fadeInFrames: z.number().default(12),
  /** Hold frames (default 60 = 2s at 30fps). */
  visibleFrames: z.number().default(60),
  /** Fade-out frames (default 12). */
  fadeOutFrames: z.number().default(12),
  /** Whether to apply blurInFocus on entry. Default true (Carlos-style). */
  useBlurInFocus: z.boolean().default(true),

  // Wave-5 contract
  transitionVerb: z
    .string()
    .default(
      "Title card fades in over 12 frames using blurInFocus (14px → 0px blur, 0.96 → 1.0 scale, opacity 0 → 1), holds STATIC for 60 frames (no typewriter, no per-word reveal — this is the key difference from KineticTypoCard), then fades out over 12 frames. A soft radial glow halo sits behind the typography for depth.",
    ),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  /** Optional watermark — if null, no watermark is rendered. */
  watermark: watermarkSchema_local.nullable().default(null),
  /** Optional handle text shown next to the watermark logo. */
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(40),
  showCaptions: z.boolean().default(false),
});
export type TitleCardKineticTwoLine16x9Props = z.infer<
  typeof titleCardKineticTwoLine16x9Schema
>;

// ─── Composition ───────────────────────────────────────────────────────
export const TitleCardKineticTwoLine16x9: React.FC<
  TitleCardKineticTwoLine16x9Props
> = ({
  audioUrl,
  wordTimings,
  headline,
  subtitle,
  eyebrow,
  background,
  typography,
  enterFrame,
  fadeInFrames,
  visibleFrames,
  fadeOutFrames,
  useBlurInFocus,
  breadcrumb,
  watermark,
  watermarkHandle,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve color stack (palette defaults + per-color overrides). Used for the
  // breadcrumb/watermark/caption chrome — the headline+subtitle+background use
  // their own dedicated style props (background.color + typography.*) so callers
  // can tune the dark-slate look independently of palette.
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
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  // ── Entry: blurInFocus over `fadeInFrames` starting at `enterFrame`. ──
  const entry = blurInFocus({
    frame,
    startFrame: enterFrame,
    durationFrames: Math.max(1, fadeInFrames),
  });

  // ── Exit: linear opacity ramp 1 → 0 over `fadeOutFrames` starting after
  // (enterFrame + fadeInFrames + visibleFrames). ──
  const exitStart = enterFrame + fadeInFrames + visibleFrames;
  const exitOpacity = interpolate(
    frame,
    [exitStart, exitStart + Math.max(1, fadeOutFrames)],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Card-level opacity / transform / filter. ──
  // If `useBlurInFocus` is true, we apply the Carlos blur+scale+opacity entry.
  // Otherwise we fall back to a pure opacity fade-in (no blur, no scale) so
  // callers can opt out of the defocus aesthetic.
  const entryOpacity = useBlurInFocus
    ? entry.opacity
    : interpolate(
        frame,
        [enterFrame, enterFrame + fadeInFrames],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
  const cardOpacity = entryOpacity * exitOpacity;
  const cardTransform = useBlurInFocus ? entry.transform : "scale(1)";
  const cardFilter = useBlurInFocus ? entry.filter : "none";

  // ── Layout typography. ──
  const headlineText = typography.headlineUppercase
    ? headline.toUpperCase()
    : headline;
  const eyebrowText = typography.eyebrowUppercase
    ? eyebrow.toUpperCase()
    : eyebrow;

  // Soft radial glow halo — placed full-frame and centered, a single
  // radial-gradient layer behind the typography.
  const glowBackground = `radial-gradient(circle at 50% 50%, ${background.glowColor}${alphaToHex(background.glowOpacity)} 0%, ${background.glowColor}00 ${Math.round(background.glowRadiusPx)}px)`;

  return (
    <DarkSlateChassis16x9 slateColor={background.color}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      {/* Palette-driven grain overlay — same convention as the 9:16 family.
          The dark-slate base is its own thing; the grain layer is the palette
          chrome's contribution so a `warm-black` caller looks textured. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Soft radial glow halo — sits behind the typography for depth. */}
      <AbsoluteFill
        style={{
          background: glowBackground,
          pointerEvents: "none",
          opacity: cardOpacity,
        }}
      />

      {/* Top-left breadcrumb (optional). */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}

      {/* Centered headline + subtitle + eyebrow stack — fades in together
          (NO per-line stagger, NO typewriter — this is the H1 distinction
          from KineticTypoCard9x16). */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
          opacity: cardOpacity,
          transform: cardTransform,
          transformOrigin: "center center",
          filter: cardFilter,
          willChange: "opacity, transform, filter",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            textAlign: "center",
            maxWidth: 1500,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: typography.eyebrowFontSize,
                color: typography.eyebrowColor,
                letterSpacing: "0.32em",
                textTransform: typography.eyebrowUppercase ? "uppercase" : "none",
                lineHeight: 1.1,
              }}
            >
              {eyebrowText}
            </div>
          ) : null}

          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: typography.headlineFontSize,
              color: typography.headlineColor,
              lineHeight: 1.05,
              letterSpacing: typography.letterSpacing,
              textTransform: typography.headlineUppercase ? "uppercase" : "none",
              // Subtle dark text-shadow lifts the white off the slate.
              textShadow: "0 4px 24px rgba(0,0,0,0.45)",
            }}
          >
            {headlineText}
          </div>

          {subtitle ? (
            <div
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 500,
                fontSize: typography.subtitleFontSize,
                color: typography.subtitleColor,
                lineHeight: 1.3,
                letterSpacing: "-0.005em",
                maxWidth: 1200,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>

      {/* Bottom-right watermark (optional — Nate's signature persistent
          handle-chip lives in this slot when callers want H4-style chrome). */}
      {watermark ? (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      ) : null}

      {/* Optional editorial caption strip (default OFF — see header docstring
          on why this competes with the on-card text). */}
      {showCaptions ? (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      ) : null}
    </DarkSlateChassis16x9>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Convert a 0..1 alpha to a 2-char hex suffix (e.g. 0.18 → "2E"). Used to
 * append an alpha channel to a 6-char hex color so we can write inline
 * `radial-gradient` stops without juggling rgba parse. Clamps out-of-range
 * inputs so callers can pass arbitrary numbers from the schema.
 */
function alphaToHex(a: number): string {
  const clamped = Math.max(0, Math.min(1, a));
  const byte = Math.round(clamped * 255);
  return byte.toString(16).padStart(2, "0").toUpperCase();
}
