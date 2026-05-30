/**
 * BrandedOpener9x16 — Tella T9 visual-hook opener.
 *
 * A 30–60 frame "brand-tic" opener (mic / prop / icon / pixel mascot / text
 * glyph) that snaps into frame with an overshoot spring, briefly holds with
 * the brand wordmark + tagline beneath (or beside / above), and dissolves
 * out into the main video content.
 *
 *   - Per Tella's "visual hooks" pattern (`docs/research/wave-5/
 *     tella-motion-graphics-synthesis.md` §T9): viewers should *know* it's
 *     your video before they hear you talk — the recurring visual tic
 *     (Tella's pink fluffy mic, our own mascot / `@` glyph / brand image)
 *     does that work in the first ~2s.
 *   - Choreography is keyword-anchored by `transitionVerb` (Wave-5 contract):
 *     hero scale 0 → overshoot → 1.0 via PUNCHY_SPRING, wordmark slide-in
 *     with 4-frame stagger after the hero settles, dwell for `holdSeconds`,
 *     then fade out over `exitFrames`.
 *
 * NOTE on schemas: this composition redeclares its Zod schema locally rather
 * than exporting it from `src/compositions/schemas.ts`, because the task
 * brief explicitly forbids touching shared source files. The schema is
 * exported from this file as `brandedOpener9x16Schema` so Root.tsx can
 * import it directly when it is wired up.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
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
import { PUNCHY_SPRING } from "./scenes";
import { PixelMascot } from "../components/BrandGlyphs";
import { EditorialCaption } from "../components/captions/EditorialCaption";

// ─── Locally-redeclared shared schemas ─────────────────────────────────
// TODO: move these to src/compositions/schemas.ts when allowed; for now we
// redeclare them locally to avoid touching shared source files (per brief).
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

// ─── Hero variant schemas ─────────────────────────────────────────────
const heroImageSchema = z.object({
  kind: z.literal("image"),
  src: z.string(),
  /** Width in px. Default 360. */
  widthPx: z.number().default(360),
});

const heroPixelMascotSchema = z.object({
  kind: z.literal("pixel-mascot"),
  /** Pixel mascot size in px. Default 240. */
  sizePx: z.number().default(240),
  primaryColor: z.string().default("#D97757"),
});

const heroTextGlyphSchema = z.object({
  kind: z.literal("text-glyph"),
  /** Just a big stylized character (e.g. "@" or a single emoji). */
  char: z.string().default("@"),
  /** Font size in px. Default 320. */
  fontSizePx: z.number().default(320),
  color: z.string().default(""),
});

const heroSchema = z.discriminatedUnion("kind", [
  heroImageSchema,
  heroPixelMascotSchema,
  heroTextGlyphSchema,
]);

// ─── Public schema + types ─────────────────────────────────────────────
export const brandedOpener9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** The hero brand-tic — image / mascot / SVG glyph. */
  hero: heroSchema.default({
    kind: "text-glyph" as const,
    char: "@",
    fontSizePx: 320,
    color: "",
  }),

  /** Brand wordmark shown next to or under the hero. */
  brandTitle: z.string().default("ARMANDO INTELLIGENCE"),
  /** Optional tagline below. */
  brandTagline: z.string().default("AI · Brand · Voice"),

  /** Where the brand text goes relative to the hero. */
  textPosition: z.enum(["below", "right", "above"]).default("below"),

  /** Entry timing. */
  heroEnterFrames: z.number().default(12),
  /** Overshoot factor for the snappy spring (1.2 → 1.0 settle). */
  heroOvershoot: z.number().default(1.2),
  /** How long the opener holds before the main content. */
  holdSeconds: z.number().default(1.5),
  /** Exit animation duration. */
  exitFrames: z.number().default(8),

  /** Optional sound-effect cue marker (when to ping a "sting" — your render script handles the actual audio). */
  stingFrame: z.number().default(0),

  // CRITICAL: transitionVerb (Wave-5 contract)
  transitionVerb: z
    .string()
    .default(
      "Hero brand-tic scales from 0 → 1.2 overshoot → 1.0 over 12 frames using a snappy spring, brand wordmark slides in below the hero with a 4-frame stagger, the composition holds 1.5 seconds, then fades out over 8 frames into the main video content.",
    ),

  // Brand chrome (no breadcrumb on the opener typically)
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("warm-black"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(false),
  /** Opener-specific: full-frame background gradient. */
  backgroundGradient: z.string().default(""),
});
export type BrandedOpener9x16Props = z.infer<typeof brandedOpener9x16Schema>;
type HeroProp = z.infer<typeof heroSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Resolve a (potentially relative) image src — pass through absolute URLs
 * and data URIs, route everything else through Remotion's `staticFile` so
 * it works in Studio + headless renders alike.
 */
function resolveImgSrc(raw: string): string {
  if (/^(https?:)?\/\//.test(raw) || raw.startsWith("data:")) return raw;
  const clean = raw.startsWith("/") ? raw.slice(1) : raw;
  return staticFile(clean);
}

/**
 * Vertical centerline (in 1920px frame coordinates) for the hero based on
 * where the brand text sits. Picked so the *combined* hero + text block is
 * roughly visually centered after the wordmark settles in.
 *   - text below → hero sits high (y ≈ 820)
 *   - text right → hero on the horizontal midline (y ≈ 600)
 *   - text above → hero sits low  (y ≈ 1100)
 */
function pickHeroCenterY(textPosition: "below" | "right" | "above"): number {
  if (textPosition === "right") return 600;
  if (textPosition === "above") return 1100;
  return 820;
}

// ─── Sub-component: <HeroVisual> ───────────────────────────────────────
const HeroVisual: React.FC<{
  hero: HeroProp;
  inkColor: string;
}> = ({ hero, inkColor }) => {
  if (hero.kind === "pixel-mascot") {
    return (
      <PixelMascot
        size={hero.sizePx}
        primaryColor={hero.primaryColor}
        glow
        bobAmplitude={0}
      />
    );
  }

  if (hero.kind === "image") {
    return (
      <Img
        src={resolveImgSrc(hero.src)}
        style={{
          width: hero.widthPx,
          height: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  }

  // text-glyph
  const color = hero.color && hero.color.length > 0 ? hero.color : inkColor;
  return (
    <span
      style={{
        fontFamily: FONT_STACKS.sans,
        fontWeight: 900,
        fontSize: hero.fontSizePx,
        color,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        display: "inline-block",
      }}
    >
      {hero.char}
    </span>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const BrandedOpener9x16: React.FC<BrandedOpener9x16Props> = ({
  audioUrl,
  wordTimings,
  hero,
  brandTitle,
  brandTagline,
  textPosition,
  heroEnterFrames,
  heroOvershoot,
  holdSeconds,
  exitFrames,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
  backgroundGradient,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
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

  // ── Hero entry: snappy spring with overshoot 0 → overshoot → 1.0 ──
  // PUNCHY_SPRING gives the visible "kick" we want for the brand tic.
  const enterProgress = spring({
    frame,
    fps,
    config: {
      damping: PUNCHY_SPRING.damping,
      stiffness: PUNCHY_SPRING.stiffness,
      mass: PUNCHY_SPRING.mass,
    },
    // Clamp the spring's "settle" inside heroEnterFrames so the overshoot
    // beat is visible (the spring without `durationInFrames` would stretch
    // its rise across the whole composition).
    durationInFrames: Math.max(1, heroEnterFrames),
  });
  // Two-phase scale curve so the visible overshoot is preserved:
  //   progress 0.0 → 0.0
  //   progress 0.6 → heroOvershoot  (peak)
  //   progress 1.0 → 1.0            (settle)
  const heroScale = interpolate(
    enterProgress,
    [0, 0.6, 1],
    [0, heroOvershoot, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const heroOpacity = interpolate(enterProgress, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Wordmark slide-in: starts after the hero "settles" with a 4-frame
  // stagger between title and tagline. Slide from translateY(24) → 0. ──
  const wordmarkStartFrame = heroEnterFrames; // hero is fully settled here
  const titleEnterFrame = wordmarkStartFrame;
  const taglineEnterFrame = wordmarkStartFrame + 4; // 4-frame stagger
  const wordmarkInDuration = 10; // frames for each text line to fade+slide in

  const titleSlideProgress = interpolate(
    frame,
    [titleEnterFrame, titleEnterFrame + wordmarkInDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = titleSlideProgress;
  const titleTranslateY = interpolate(titleSlideProgress, [0, 1], [24, 0]);

  const taglineSlideProgress = interpolate(
    frame,
    [taglineEnterFrame, taglineEnterFrame + wordmarkInDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const taglineOpacity = taglineSlideProgress;
  const taglineTranslateY = interpolate(taglineSlideProgress, [0, 1], [24, 0]);

  // ── Composition-wide fade-out: last `exitFrames` of the comp lerp
  // opacity 1 → 0. Driven off durationInFrames so the opener cleanly
  // dissolves into whatever sequences play after it. ──
  const exitFadeStart = Math.max(0, durationInFrames - exitFrames);
  const compOpacity = interpolate(
    frame,
    [exitFadeStart, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Sanity check used only for documentation — not currently consumed by
  // the renderer (the audio sting is your render-script's job per spec).
  // `holdSeconds` shapes the recommended composition duration:
  //   total ≈ heroEnterFrames + holdSeconds*fps + exitFrames
  void holdSeconds;

  // Hero positioning: center horizontally; vertical placement depends on
  // where the wordmark sits relative to the hero.
  const heroCenterY = pickHeroCenterY(textPosition);

  // Wordmark stack layout. For "right", the text sits to the right of the
  // hero on the horizontal midline; otherwise it stacks vertically above
  // or below the hero with a consistent gap.
  const wordmarkVerticalGap = 64;
  const wordmarkSidewaysGap = 56;

  const wordmarkBlock = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: textPosition === "right" ? "flex-start" : "center",
        gap: 12,
        textAlign: textPosition === "right" ? "left" : "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 64,
          color: resolvedInk,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          lineHeight: 1.05,
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          willChange: "opacity, transform",
        }}
      >
        {brandTitle}
      </div>
      {brandTagline ? (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: 32,
            color: resolvedMuted,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            lineHeight: 1.2,
            opacity: taglineOpacity,
            transform: `translateY(${taglineTranslateY}px)`,
            willChange: "opacity, transform",
          }}
        >
          {brandTagline}
        </div>
      ) : null}
    </div>
  );

  // Hero + wordmark block layout — we render both inside a positioned
  // wrapper so the whole opener can be vertically tuned via heroCenterY.
  const heroBlock = (
    <div
      style={{
        transform: `scale(${heroScale})`,
        transformOrigin: "center center",
        opacity: heroOpacity,
        // Render the hero in a square box so the wordmark below aligns
        // predictably regardless of hero variant (image / mascot / glyph).
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        willChange: "transform, opacity",
        // Subtle accent halo to tie the hero to the brand accent color
        // (esp. nice on warm-black where ink is cream).
        filter: isDark
          ? `drop-shadow(0 0 28px ${resolvedAccent}55)`
          : `drop-shadow(0 8px 18px ${resolvedAccent}33)`,
      }}
    >
      <HeroVisual hero={hero} inkColor={resolvedInk} />
    </div>
  );

  // Combined layout — three cases, one positioned wrapper centered on
  // the configured heroCenterY.
  const sideBySide = textPosition === "right";

  // Background: explicit gradient overrides palette paper.
  const backgroundFill =
    backgroundGradient && backgroundGradient.length > 0
      ? backgroundGradient
      : resolvedPaper;

  return (
    <AbsoluteFill style={{ background: backgroundFill, opacity: compOpacity }}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      {/* Palette-driven paper-grain overlay (multiply on light, screen on dark). */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Centered opener stack — hero + wordmark.
       *
       * We place the whole block inside an AbsoluteFill flex column so it's
       * easy to swap between "text-below", "text-right" (row), and
       * "text-above" (column-reverse) without re-doing absolute math.
       */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            // Anchor the whole opener around the chosen vertical center.
            // We shift the block up by ~half its expected height (rough
            // visual centering — exact metrics depend on hero variant +
            // tagline presence, but this lands within ~40px of true
            // center for the three primary configurations).
            position: "absolute",
            top: heroCenterY,
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: sideBySide
              ? "row"
              : textPosition === "above"
                ? "column-reverse"
                : "column",
            alignItems: "center",
            justifyContent: "center",
            gap: sideBySide ? wordmarkSidewaysGap : wordmarkVerticalGap,
          }}
        >
          {heroBlock}
          {wordmarkBlock}
        </div>
      </AbsoluteFill>

      {/* Optional EditorialCaption strip — default OFF on the opener (the
       *  hero IS the visual hook; a third text layer competes for the eye). */}
      {showCaptions ? (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
