/**
 * PromptCardPedagogy9x16 — austin.marchese's signature TEACHING module.
 *
 * THE BEAT IT REPRODUCES (austin.marchese liquid-glass study, 2026-06-26)
 * ----------------------------------------------------------------------
 * austin's "here is the exact prompt I used" moments are pedagogical, not
 * decorative: a copyable prompt / recipe sits in a glass card that fills the
 * upper portion of the frame, with DELIBERATELY REDUCED internal motion so a
 * viewer can PAUSE and READ (or screenshot) it. The card settles, its rim
 * "powers on" (GlowPulseOverlay), the prompt lines fade in line-by-line, and a
 * beat later one key line gets the "second-read" highlight (ClauseHighlightPhrase)
 * — the human-highlighter arrival that says "this clause is the whole trick."
 * THEN a small portrait PIP "rail" card lands in the lower-right, after the
 * prompt has already settled (pipDelayFrames), so the teaching object reads
 * first and the presenter second.
 *
 * COMPOSITION (1080×1920, 150f @30fps):
 *   - UPPER ~65% : the copyable prompt/recipe glass card.
 *       · glassCardStyle frosted fill + GlowPulseOverlay animated rim.
 *       · promptTitle (sans) over a monospace-ish, copy-friendly promptLines
 *         block — generous line-height, left-aligned, low motion.
 *       · ONE promptLine (highlightLineIndex) is rendered through
 *         ClauseHighlightPhrase so its key phrase gets the second-read sweep.
 *   - LOWER-RIGHT : a portrait PIP rail card (solid colored placeholder block +
 *       a small "TU" label — NO external images), wrapped in its own
 *       GlowPulseOverlay rim, landing pipDelayFrames AFTER the prompt card.
 *   - OPTIONAL : a LitSphereGlyph step-number bead (off by default via showOrb).
 *   - Deep-navy background with a faint warm vignette. Motion stays CALM.
 *
 * GOTCHA HANDLED (headless Remotion):
 *   - NO background-clip:text / -webkit-text-fill-color:transparent (paints as an
 *     opaque rect headless). All text uses SOLID fills.
 *   - The PIP "portrait" is a solid colored block + label — no external image
 *     loads, so the comp renders standalone with no asset dependencies.
 *
 * Self-contained: react + remotion + zod + the liquid-glass atoms/tokens (same
 * family) + the house FONT_STACKS. Frame-deterministic (useCurrentFrame), no DOM
 * measurement, no window, no Math.random / Date.now — SSR-safe.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand/fonts";
import { ClauseHighlightPhrase } from "../components/liquidglass/ClauseHighlightPhrase";
import { GlowPulseOverlay } from "../components/liquidglass/GlowPulseOverlay";
import { LitSphereGlyph } from "../components/liquidglass/LitSphereGlyph";
import {
  glassCardStyle,
  lgTheme,
  withAlpha,
  type LiquidGlassTheme,
} from "../components/liquidglass/tokens";

// ─── Schema (every field has a default so schema.parse({}) yields full props) ──
const liquidGlassThemeSchema = z.enum(["brand", "warm", "cool"]);

export const promptCardPedagogy9x16Schema = z.object({
  /** Liquid-glass theme: brand (navy/gold, default), warm (austin), cool (nate). */
  theme: liquidGlassThemeSchema.default("brand"),

  /** Eyebrow / kicker above the title (uppercase tracked). Empty = hidden. */
  kicker: z.string().default("EL PROMPT EXACTO"),
  /** The prompt card heading (sans, bold). */
  promptTitle: z
    .string()
    .default("Plantilla de prompt para resumir reuniones"),

  /**
   * The copyable prompt / recipe body, ONE entry per line. Rendered in a
   * monospace face with generous spacing so a viewer can pause and read or
   * screenshot it. Keep lines short enough to fit without wrapping awkwardly.
   */
  promptLines: z
    .array(z.string())
    .default([
      "Actúa como mi jefe de operaciones.",
      "Resume esta reunión en 5 viñetas.",
      "Marca cada decisión y quién es responsable.",
      "Termina con los próximos pasos y sus fechas.",
    ]),

  /** Which promptLine gets the ClauseHighlightPhrase second-read sweep. */
  highlightLineIndex: z.number().int().default(2),
  /**
   * Inclusive word-index ranges within the highlighted line to mark. Out-of-range
   * / inverted ranges are clamped + dropped by the atom.
   */
  highlightPhrases: z
    .array(z.object({ start: z.number().int(), end: z.number().int() }))
    .default([{ start: 3, end: 6 }]),

  /** Label shown inside the portrait PIP placeholder block (no image loads). */
  pipLabel: z.string().default("TU"),
  /** Caption under the PIP rail card (e.g. presenter handle). Empty = hidden. */
  pipCaption: z.string().default("@armandointeligencia"),

  /** Show the optional LitSphereGlyph step-number bead. Off by default. */
  showOrb: z.boolean().default(false),
  /** The glyph on the step-number bead (only used when showOrb is true). */
  orbGlyph: z.string().default("1"),

  /** Frame the prompt card begins its settle → glow-bloom entrance. */
  cardStartFrame: z.number().int().default(6),
  /** Frames AFTER the prompt card settles before the PIP rail card lands. */
  pipDelayFrames: z.number().int().default(40),

  // CRITICAL: transitionVerb (house contract — imperative voice for the prompt
  // pipeline; does not drive runtime).
  transitionVerb: z
    .string()
    .default(
      "Prompt card settles crisp then its rim glow blooms; the prompt lines fade in one-by-one with reduced motion so the viewer can pause and read; a beat later one key line gets a left-to-right second-read highlight sweep; then a portrait PIP rail card lands in the lower-right with its own rim glow, after the prompt has already settled.",
    ),
});
export type PromptCardPedagogy9x16Props = z.infer<
  typeof promptCardPedagogy9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

// The prompt card occupies the upper ~65% of the frame.
const CARD_LEFT = 70;
const CARD_TOP = 230;
const CARD_WIDTH = FRAME_W - CARD_LEFT * 2;
const CARD_HEIGHT = 980; // ~ (230 + 980) / 1920 ≈ 63% of the frame height

// Portrait PIP rail card, anchored lower-right beneath the prompt card.
const PIP_WIDTH = 360;
const PIP_HEIGHT = 480;
const PIP_RIGHT = 70;
const PIP_BOTTOM = 150;

// Step-number bead (optional) — perched on the prompt card's top-left corner.
const ORB_SIZE = 116;

// ─── Background (deep-navy + faint warm vignette) ────────────────────────────
function backgroundStyle(theme: LiquidGlassTheme): React.CSSProperties {
  // Deep-navy base regardless of theme (the brief is explicit: deep-navy bg).
  // The vignette warms slightly toward the theme glow so the card reads "lit".
  const t = lgTheme(theme);
  return {
    background: `radial-gradient(120% 80% at 50% 38%, #142544 0%, #0F1B2D 52%, #070D18 100%)`,
    // A whisper of the theme glow in the upper area, behind the card.
    boxShadow: `inset 0 0 600px ${withAlpha(t.glow, 0.06)}`,
  };
}

// ─── Kicker + title block (lives at the top of the prompt card) ──────────────
interface CardHeaderProps {
  kicker: string;
  title: string;
  theme: LiquidGlassTheme;
  startFrame: number;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  kicker,
  title,
  theme,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Calm fade + slight rise; no spring bounce (this is a READ surface).
  const enter = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = (1 - enter) * 14;

  return (
    <div style={{ opacity: enter, transform: `translateY(${rise}px)` }}>
      {kicker ? (
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.accent, // SOLID accent (no background-clip)
            marginBottom: 16,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          color: t.inkOnGlass, // SOLID ink
        }}
      >
        {title}
      </div>
      {/* Short accent rule beneath the title (separates header from the recipe). */}
      <div
        style={{
          marginTop: 24,
          width: 96,
          height: 4,
          borderRadius: 3,
          background: t.accent,
        }}
      />
    </div>
  );
};

// ─── A single monospace prompt line (calm line-by-line fade) ─────────────────
interface PromptLineProps {
  text: string;
  theme: LiquidGlassTheme;
  startFrame: number;
}

const PromptLine: React.FC<PromptLineProps> = ({ text, theme, startFrame }) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Each line fades in slowly with a tiny horizontal nudge — REDUCED motion so
  // the block stays legible/pausable rather than animating distractingly.
  const enter = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nudge = (1 - enter) * 10;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        opacity: enter,
        transform: `translateX(${nudge}px)`,
      }}
    >
      {/* A subtle leading marker so the recipe reads as a copyable block. */}
      <span
        style={{
          fontFamily: FONT_STACKS.monoCode,
          fontWeight: 500,
          fontSize: 34,
          lineHeight: 1.5,
          color: withAlpha(t.accent, 0.85),
          flexShrink: 0,
        }}
      >
        ›
      </span>
      <span
        style={{
          fontFamily: FONT_STACKS.mono,
          fontWeight: 500,
          fontSize: 34,
          lineHeight: 1.5,
          letterSpacing: "0.005em",
          color: t.inkOnGlass, // SOLID ink
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Portrait PIP "rail" card (solid placeholder block + label, NO image) ─────
interface PortraitPipProps {
  label: string;
  caption: string;
  theme: LiquidGlassTheme;
  startFrame: number;
}

const PortraitPip: React.FC<PortraitPipProps> = ({
  label,
  caption,
  theme,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Calm slide-up + fade in (no overshoot) — the presenter arrives AFTER the
  // teaching object, quietly.
  const enter = interpolate(frame, [startFrame, startFrame + 16], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = (1 - enter) * 28;

  // The portrait is a solid colored block — a navy-to-deeper-navy wash with a
  // soft contact glow, NOT an external image. The "TU" label centers on it.
  const blockBg = `linear-gradient(160deg, ${withAlpha(
    t.glow,
    0.22,
  )} 0%, #16294a 40%, #0E1B30 100%)`;

  return (
    <GlowPulseOverlay
      theme={theme}
      startFrame={startFrame}
      radius={28}
      borderWidth={2}
      glowSigma={22}
      pulsePeriodFrames={60}
      style={{
        position: "absolute",
        right: PIP_RIGHT,
        bottom: PIP_BOTTOM,
        width: PIP_WIDTH,
        opacity: enter,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          ...glassCardStyle({ theme, radius: 28, borderWidth: 0, padding: 14 }),
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Solid placeholder portrait block (no asset load). */}
        <div
          style={{
            width: "100%",
            height: PIP_HEIGHT,
            borderRadius: 18,
            background: blockBg,
            border: `1px solid ${withAlpha(t.glow, 0.3)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: 110,
              letterSpacing: "0.04em",
              color: withAlpha(t.inkOnGlass, 0.9), // SOLID ink
              userSelect: "none",
            }}
          >
            {label}
          </span>
        </div>
        {caption ? (
          <div
            style={{
              textAlign: "center",
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 24,
              letterSpacing: "0.01em",
              color: withAlpha(t.inkOnGlass, 0.82), // SOLID ink
              paddingBottom: 4,
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
    </GlowPulseOverlay>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────
export const PromptCardPedagogy9x16: React.FC<PromptCardPedagogy9x16Props> = ({
  theme,
  kicker,
  promptTitle,
  promptLines,
  highlightLineIndex,
  highlightPhrases,
  pipLabel,
  pipCaption,
  showOrb,
  orbGlyph,
  cardStartFrame,
  pipDelayFrames,
}) => {
  const { fps } = useVideoConfig();
  const t = lgTheme(theme);

  // ── Timing derivation (all relative to cardStartFrame) ──────────────────────
  // The rim settles, then the header fades in, then the prompt lines stagger on
  // SLOWLY (reduced motion), then the highlight sweep, then the PIP lands.
  const headerStart = cardStartFrame + 8;
  const firstLineStart = headerStart + 14;
  const lineStagger = Math.max(1, Math.round(0.22 * fps)); // ~7f — calm cadence
  const lineStartFrame = (i: number): number =>
    firstLineStart + i * lineStagger;

  const lastLineDone = lineStartFrame(Math.max(0, promptLines.length - 1)) + 12;
  // The PIP arrives a fixed delay AFTER the prompt block has settled.
  const pipStart = lastLineDone + Math.max(0, Math.round(pipDelayFrames));

  // Resolve which line carries the second-read highlight (clamped).
  const safeHighlightIdx =
    promptLines.length === 0
      ? -1
      : Math.max(0, Math.min(promptLines.length - 1, highlightLineIndex));

  return (
    <AbsoluteFill
      style={{ ...backgroundStyle(theme), fontFamily: FONT_STACKS.sans }}
    >
      {/* The copyable prompt / recipe glass card — the upper ~65%. The rim is the
       *  signature two-stage settle → glow-bloom; the fill is the frosted glass.
       *  GlowPulseOverlay is the bordered wrapper; glassCardStyle (border 0)
       *  supplies the fill + sheen so the rim and the fill don't double up. */}
      <GlowPulseOverlay
        theme={theme}
        startFrame={cardStartFrame}
        radius={36}
        borderWidth={2}
        glowSigma={26}
        pulsePeriodFrames={75}
        style={{
          position: "absolute",
          left: CARD_LEFT,
          top: CARD_TOP,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
      >
        <div
          style={{
            ...glassCardStyle({ theme, radius: 36, borderWidth: 0, padding: 56 }),
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <CardHeader
            kicker={kicker}
            title={promptTitle}
            theme={theme}
            startFrame={headerStart}
          />

          {/* The recipe body — monospace, generous spacing, low motion. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            {promptLines.map((line, i) => {
              if (i === safeHighlightIdx) {
                // The key line: rendered through ClauseHighlightPhrase so its
                // phrase gets the human-highlighter second-read sweep AFTER the
                // line has settled. Wrapped in a row to match the marker gutter.
                return (
                  <div
                    key={`line-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 18,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_STACKS.monoCode,
                        fontWeight: 500,
                        fontSize: 34,
                        lineHeight: 1.5,
                        color: withAlpha(t.accent, 0.85),
                        flexShrink: 0,
                      }}
                    >
                      ›
                    </span>
                    <ClauseHighlightPhrase
                      text={line}
                      phrases={highlightPhrases}
                      variant="inline-select"
                      theme={theme}
                      startFrame={lineStartFrame(i)}
                      textRevealFrames={12}
                      secondReadDelay={14}
                      sweepFrames={10}
                      fontSize={34}
                      style={{
                        // Match the surrounding monospace recipe block so the
                        // highlighted line reads as part of the same recipe.
                        fontFamily: FONT_STACKS.mono,
                        fontWeight: 500,
                        lineHeight: 1.5,
                        letterSpacing: "0.005em",
                        flex: 1,
                      }}
                    />
                  </div>
                );
              }
              return (
                <PromptLine
                  key={`line-${i}`}
                  text={line}
                  theme={theme}
                  startFrame={lineStartFrame(i)}
                />
              );
            })}
          </div>
        </div>
      </GlowPulseOverlay>

      {/* Optional step-number bead, perched on the card's top-left corner. */}
      {showOrb ? (
        <LitSphereGlyph
          glyph={orbGlyph}
          size={ORB_SIZE}
          theme={theme}
          startFrame={cardStartFrame + 4}
          style={{
            position: "absolute",
            left: CARD_LEFT - ORB_SIZE * 0.32,
            top: CARD_TOP - ORB_SIZE * 0.42,
          }}
        />
      ) : null}

      {/* Portrait PIP rail card — lands AFTER the prompt card has settled. */}
      <PortraitPip
        label={pipLabel}
        caption={pipCaption}
        theme={theme}
        startFrame={pipStart}
      />
    </AbsoluteFill>
  );
};
