/**
 * TitledDossierCard9x16 — vertical (1080×1920) "chapter break" dossier card.
 *
 * Bilawal V3 N7 (Wave-4 vote-3 critique, `docs/critiques/wave-4/bilawal-vote3-redteam.md`):
 *   "Kicker + massive hero title + amber primary stat + bullet dossier. Chapter break."
 *
 * Where TweetCardHero9x16 puts an external source on stage, TitledDossierCard puts a
 * SINGLE editorial POV on stage: a tracked-uppercase eyebrow names the chapter, the
 * hero title delivers the punch, one big amber number anchors the claim, and a 1-5
 * bullet "dossier" gives the receipts. Same Bilawal grammar (`true-black` palette,
 * amber accent, condensed sans hero) but built for the *chapter intercut* moment
 * rather than the tweet hook.
 *
 * Visual structure (top → bottom):
 *   - BrandBreadcrumb (~y=80)
 *   - Kicker eyebrow (mono tracked uppercase ~24px, accent, +0.22em, ~y=240)
 *   - Hero title (Inter Black ~140px, all-caps, accent, ~y=320 → ~y=540)
 *     · enters via `blurInFocus` (Carlos-style focus pull)
 *   - Primary stat block (~y=620):
 *       · `value` — sans ~120px, accent (the "amber number")
 *       · `label` — mono tracked uppercase under it, muted
 *   - Bullets dossier (~y=820): left-aligned list, accent bullet glyph + sans 38px ink,
 *     stagger-cascade entry (`staggerEntry` accelerating).
 *   - Optional conclusion line (~y=1480): serif italic, muted.
 *   - EditorialCaption (bottom strip, gated by showCaptions).
 *
 * Motion grammar:
 *   - Hero enters via `blurInFocus` 14→0px over ~270ms at `enterSeconds`.
 *   - Primary stat fades in 0.3s after the hero lands.
 *   - Bullets cascade in via `staggerEntry({ accelerate: true })` so later bullets
 *     arrive faster — keeps the eye moving down the list.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";
import { blurInFocus } from "../animation/blurInFocus";
import { staggerEntry } from "../animation";

// ─── Schemas (declared locally — kept self-contained, sibling pattern of
//     AnimatedCounter9x16 / AnimatedText9x16) ──────────────────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

const primaryStatSchema = z.object({
  /** The big figure — e.g. "$2-3M". */
  value: z.string(),
  /** Small tracked uppercase label under it — e.g. "PER SHIP, PER TRANSIT". */
  label: z.string(),
});
export type DossierPrimaryStat = z.infer<typeof primaryStatSchema>;

const dossierBulletSchema = z.object({
  text: z.string(),
});
export type DossierBullet = z.infer<typeof dossierBulletSchema>;

export const titledDossierCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Small mono tracked uppercase eyebrow (e.g. "SELECTIVE BLOCKADE"). */
  kicker: z.string().default(""),
  /** Massive condensed sans, all-caps (e.g. "TEHRAN'S TOLLBOOTH"). */
  heroTitle: z.string().default(""),
  /** Big amber stat. */
  primaryStat: primaryStatSchema.default({ value: "", label: "" }),
  /** 1-5 dossier bullets. */
  bullets: z.array(dossierBulletSchema).default([]),
  /** Optional italic serif conclusion line under the bullets. */
  conclusionLine: z.string().default(""),
  /** Seconds before the hero begins its blur-in. */
  enterSeconds: z.number().min(0).max(10).default(0.5),
  /** Seconds between consecutive bullet entries (accelerating cascade). */
  bulletStaggerSeconds: z.number().min(0.05).max(2).default(0.25),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z
    .enum(["cream", "dark", "warm-black", "true-black", "paper"])
    .default("true-black"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type TitledDossierCard9x16Props = z.infer<
  typeof titledDossierCard9x16Schema
>;

// ─── Layout constants ───────────────────────────────────────────────
const KICKER_Y = 240;
const HERO_TOP_Y = 320;
const HERO_BOTTOM_Y = 540;
const STAT_VALUE_Y = 620;
const STAT_LABEL_Y = 760;
const BULLETS_TOP_Y = 840;
const BULLET_LINE_HEIGHT = 90; // ~38px font * 1.3 line-height + breathing room
const CONCLUSION_Y_FROM_BULLET_END = 64;
const HERO_FONT_SIZE_BASE = 140;
const HERO_FONT_SIZE_MIN = 88; // shrink for long titles so they still fit 980px width
const STAT_VALUE_FONT_SIZE = 120;
const STAT_LABEL_FONT_SIZE = 22;

// ─── Hero title (blur-in focus pull) ─────────────────────────────────
const HeroTitle: React.FC<{
  text: string;
  enterFrame: number;
  accentColor: string;
}> = ({ text, enterFrame, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blur = blurInFocus({
    frame,
    startFrame: enterFrame,
    durationFrames: Math.round(0.27 * fps), // ~8 frames @ 30fps — Carlos prescription
  });

  // Auto-shrink the title for longer copy so it fits ≤980px wide on a 1080-wide canvas.
  // Heuristic — based on character count, conservative; favors readability.
  const len = text.length;
  let fontSize = HERO_FONT_SIZE_BASE;
  if (len > 22) fontSize = 120;
  if (len > 28) fontSize = 104;
  if (len > 36) fontSize = HERO_FONT_SIZE_MIN;

  return (
    <div
      style={{
        position: "absolute",
        top: HERO_TOP_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 50px",
        opacity: blur.opacity,
        filter: blur.filter,
        transform: blur.transform,
        // Reserve the hero band so the stat block below doesn't reflow.
        minHeight: HERO_BOTTOM_Y - HERO_TOP_Y,
      }}
    >
      <div
        style={{
          // #168: real condensed-sans display face (Oswald) for the hero
          // lockup — replaces the prior Inter-900 approximation. Oswald tops
          // out at 700, which is the intended heavy display weight here.
          fontFamily: FONT_STACKS.condensed,
          fontWeight: 700,
          fontSize,
          color: accentColor,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Kicker eyebrow ──────────────────────────────────────────────────
const Kicker: React.FC<{
  text: string;
  enterFrame: number;
  accentColor: string;
}> = ({ text, enterFrame, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.6 },
  });
  const opacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: KICKER_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.monoCode,
        fontWeight: 500,
        fontSize: 24,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Primary stat (value + tracked label) ────────────────────────────
const PrimaryStat: React.FC<{
  value: string;
  label: string;
  enterFrame: number;
  accentColor: string;
  mutedColor: string;
}> = ({ value, label, enterFrame, accentColor, mutedColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.92, 1.0]);

  // Auto-shrink the value too if it's very long ($2-3M is fine; "$120,000,000" would clip).
  let valueFontSize = STAT_VALUE_FONT_SIZE;
  if (value.length > 8) valueFontSize = 100;
  if (value.length > 12) valueFontSize = 80;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: STAT_VALUE_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: valueFontSize,
          color: accentColor,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center top",
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: "absolute",
          top: STAT_LABEL_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.monoCode,
          fontWeight: 500,
          fontSize: STAT_LABEL_FONT_SIZE,
          color: mutedColor,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity,
        }}
      >
        {label}
      </div>
    </>
  );
};

// ─── A single bullet row ────────────────────────────────────────────
const BulletRow: React.FC<{
  text: string;
  topPx: number;
  enterFrame: number;
  accentColor: string;
  inkColor: string;
}> = ({ text, topPx, enterFrame, accentColor, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.7 },
  });
  const opacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const translateX = interpolate(enter, [0, 1], [-14, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 100,
        right: 100,
        display: "flex",
        alignItems: "flex-start",
        gap: 18,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 38,
          color: accentColor,
          lineHeight: 1.25,
          flex: "0 0 auto",
        }}
        aria-hidden
      >
        •
      </div>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 500,
          fontSize: 38,
          color: inkColor,
          lineHeight: 1.25,
          letterSpacing: "-0.005em",
          flex: "1 1 auto",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Conclusion line (serif italic) ─────────────────────────────────
const ConclusionLine: React.FC<{
  text: string;
  topPx: number;
  enterFrame: number;
  mutedColor: string;
}> = ({ text, topPx, enterFrame, mutedColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 24, stiffness: 130, mass: 0.7 },
  });
  const opacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [8, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 100,
        right: 100,
        textAlign: "left",
        fontFamily: FONT_STACKS.serifItalic,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 34,
        color: mutedColor,
        lineHeight: 1.35,
        letterSpacing: "0em",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const TitledDossierCard9x16: React.FC<TitledDossierCard9x16Props> = ({
  audioUrl,
  wordTimings,
  kicker,
  heroTitle,
  primaryStat,
  bullets,
  conclusionLine,
  enterSeconds,
  bulletStaggerSeconds,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

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

  // Entry timing (all derived from `enterSeconds`).
  const enterFrame = Math.round(enterSeconds * fps);
  const kickerEnterFrame = enterFrame; // arrives with the hero
  const heroEnterFrame = enterFrame;
  // Stat fades in 0.3s after the hero starts (hero blur-in is ~0.27s — they overlap by design)
  const statEnterFrame = enterFrame + Math.round(0.3 * fps);
  // Bullets start cascading 0.4s after the stat — gives the eye time to absorb the figure.
  const bulletsBaseFrame = statEnterFrame + Math.round(0.4 * fps);

  // Per-bullet entry frames via accelerating staggerEntry. `bulletStaggerSeconds * fps`
  // expressed in frames, passed as the per-row stagger budget.
  const bulletStaggerFrames = Math.max(1, Math.round(bulletStaggerSeconds * fps));

  const bulletEntries = bullets.map((bullet, i) => ({
    bullet,
    topPx: BULLETS_TOP_Y + i * BULLET_LINE_HEIGHT,
    enterFrame: staggerEntry({
      index: i,
      baseStartFrame: bulletsBaseFrame,
      staggerFrames: bulletStaggerFrames,
      accelerate: true,
    }),
  }));

  // Conclusion sits below the last bullet.
  const conclusionTop =
    bullets.length > 0
      ? BULLETS_TOP_Y +
        (bullets.length - 1) * BULLET_LINE_HEIGHT +
        BULLET_LINE_HEIGHT +
        CONCLUSION_Y_FROM_BULLET_END
      : BULLETS_TOP_Y + CONCLUSION_Y_FROM_BULLET_END;
  // Conclusion enters 0.3s after the LAST bullet.
  const lastBulletFrame =
    bulletEntries.length > 0
      ? bulletEntries[bulletEntries.length - 1].enterFrame
      : bulletsBaseFrame;
  const conclusionEnterFrame = lastBulletFrame + Math.round(0.3 * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode:
            palette === "dark" ||
            palette === "warm-black" ||
            palette === "true-black"
              ? "screen"
              : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Kicker eyebrow (rendered if non-empty) */}
      {kicker && (
        <Kicker
          text={kicker}
          enterFrame={kickerEnterFrame}
          accentColor={resolvedAccent}
        />
      )}

      {/* Hero title (blur-in focus pull) */}
      {heroTitle && (
        <HeroTitle
          text={heroTitle}
          enterFrame={heroEnterFrame}
          accentColor={resolvedAccent}
        />
      )}

      {/* Primary stat (value + tracked label) — both render if either is non-empty */}
      {(primaryStat.value || primaryStat.label) && (
        <PrimaryStat
          value={primaryStat.value}
          label={primaryStat.label}
          enterFrame={statEnterFrame}
          accentColor={resolvedAccent}
          mutedColor={resolvedMuted}
        />
      )}

      {/* Bullets — staggered cascade */}
      {bulletEntries.map((entry, i) => (
        <BulletRow
          key={`bullet-${i}`}
          text={entry.bullet.text}
          topPx={entry.topPx}
          enterFrame={entry.enterFrame}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
        />
      ))}

      {/* Conclusion line (optional — serif italic) */}
      {conclusionLine && (
        <ConclusionLine
          text={conclusionLine}
          topPx={conclusionTop}
          enterFrame={conclusionEnterFrame}
          mutedColor={resolvedMuted}
        />
      )}

      {/* Word-by-word captions in the bottom strip */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 100,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
