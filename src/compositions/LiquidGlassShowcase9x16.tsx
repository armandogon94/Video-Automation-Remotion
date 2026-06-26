/**
 * LiquidGlassShowcase9x16 — a render-QA SHOWCASE for the liquid-glass atom family.
 *
 * WHY THIS EXISTS (austin.marchese + nateherk study, 2026-06-26)
 * -------------------------------------------------------------
 * The 3-reviewer animation study (Opus + Codex GPT-5.5 + Gemini 3.5 Flash — see
 * docs/research/austin-anim/FINAL-CONSENSUS.md) distilled austin/nate's motion
 * vocabulary into a small MATERIAL token layer (src/components/liquidglass/) plus
 * four reusable ATOMS. This composition exists to exercise ALL FOUR atoms in one
 * 5-second 9:16 frame over the deep-navy backdrop so a single headless render
 * proves the family draws correctly and on-brand (no background-clip rects, no
 * popped scales, themes all resolve). It is a VISUAL TEST HARNESS, not shipped
 * Spanish content — but it carries sensible Spanish copy so the render reads real.
 *
 * WHAT IT DEMONSTRATES (staggered entrances, all frame-deterministic):
 *   (a) a GLASS CARD (glassCardStyle) wrapped in GlowPulseOverlay showing a title
 *       — the two-stage "border settles crisp → glow blooms → pulse" rim;
 *   (b) a LitSphereGlyph numbered orb ("1") that DOCKS in with a spring overshoot
 *       and a settling specular highlight;
 *   (c) a ClauseHighlightPhrase line where the key phrase gets the inline-select
 *       highlight on the deliberate "second-read" beat (text settles, marker
 *       sweeps L→R a few frames later);
 *   (d) an ArcLightWipe light-bridge sweep around frame ~90 to cap the sequence.
 *
 * The single `theme` prop drives all four atoms (brand / warm / cool) so flipping
 * one token re-skins the whole showcase — warm/cool exist for austin/nate parity
 * studies, brand is the default Armando-Inteligencia navy/gold.
 *
 * GOTCHAS HANDLED (headless Remotion): every consumed atom is already headless-safe
 * (no background-clip:text / -webkit-text-fill-color:transparent — those paint as
 * opaque rects in headless Chromium). This file adds only solid-fill text, plain
 * backgrounds, and transforms — all derived from useCurrentFrame() (no
 * Math.random / Date.now / window). Comp id is [a-zA-Z0-9-]-safe (no underscores).
 *
 * Self-contained: imports react, remotion, zod, the four liquid-glass atoms +
 * tokens (sibling folder), and the house FONT_STACKS.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand/fonts";
import { ArcLightWipe } from "../components/liquidglass/ArcLightWipe";
import { ClauseHighlightPhrase } from "../components/liquidglass/ClauseHighlightPhrase";
import { GlowPulseOverlay } from "../components/liquidglass/GlowPulseOverlay";
import { LitSphereGlyph } from "../components/liquidglass/LitSphereGlyph";
import {
  glassCardStyle,
  lgTheme,
  withAlpha,
} from "../components/liquidglass/tokens";

// ─── Schema (every field defaulted so schema.parse({}) yields full defaultProps) ─
export const liquidGlassShowcase9x16Schema = z.object({
  /** Title rendered inside the glass card (atom a). */
  title: z.string().default("Material de vidrio líquido"),
  /** Kicker/eyebrow above the title (uppercase tracked, solid accent). */
  kicker: z.string().default("SHOWCASE · QA DE RENDER"),
  /** Number/glyph shown on the docking lit sphere (atom b). */
  orbGlyph: z.string().default("1"),
  /** Caption under the orb naming the step (atom b context). */
  orbCaption: z.string().default("El primer principio"),
  /** The line that gets the second-read highlight (atom c). */
  highlightText: z
    .string()
    .default(
      "La diferencia no está en el modelo, está en el contexto que le das.",
    ),
  /**
   * Inclusive word-index range(s) into the whitespace-split highlightText that
   * receive the inline-select marker. Default selects "el contexto que le das"
   * (words 9–13 of the default line).
   */
  highlightPhrases: z
    .array(z.object({ start: z.number().int(), end: z.number().int() }))
    .default([{ start: 9, end: 13 }]),
  /**
   * Liquid-glass theme — drives ALL four atoms. "brand" = navy/gold (default),
   * "warm" = austin burgundy/magenta, "cool" = nate cyan/teal (parity studies).
   */
  theme: z.enum(["brand", "warm", "cool"]).default("brand"),

  // CRITICAL: transitionVerb (house contract — imperative voice for the prompt
  // pipeline; does not drive runtime).
  transitionVerb: z
    .string()
    .default(
      "Staggered atom showcase: a glass card's rim settles crisp then blooms and pulses behind the title; a lit numbered sphere docks in with a spring overshoot as its specular settles; a clause line reveals then a translucent marker sweeps left-to-right over the key phrase on the second-read beat; finally an arc light-streak sweeps across the frame as a light-bridge cap.",
    ),
});
export type LiquidGlassShowcase9x16Props = z.infer<
  typeof liquidGlassShowcase9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

// Deep-navy backdrop with a faint warm-center radial so the glass rims separate.
const BG_DEEP_NAVY = "#0F1B2D";

// Staggered entrance frames (30fps, 150f total).
const CARD_START = 6; // glass card rim settle → bloom → pulse
const ORB_START = 36; // lit sphere docks in
const CLAUSE_START = 60; // clause text reveals, then second-read highlight
const WIPE_START = 90; // arc light-bridge sweep

export const LiquidGlassShowcase9x16: React.FC<LiquidGlassShowcase9x16Props> = ({
  title,
  kicker,
  orbGlyph,
  orbCaption,
  highlightText,
  highlightPhrases,
  theme,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Backdrop: deep navy with a soft theme-tinted glow at the top third so the
  // card + orb rims read against it (a flat vignette, NOT a lit body).
  const bgGradient = `radial-gradient(120% 80% at 50% 32%, ${withAlpha(
    t.glow,
    0.1,
  )} 0%, ${BG_DEEP_NAVY} 58%, #060B14 100%)`;

  // Orb caption fades in just after the orb has docked.
  const orbCaptionOpacity = interpolate(
    frame,
    [ORB_START + 14, ORB_START + 24],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{ background: bgGradient, fontFamily: FONT_STACKS.sans }}
    >
      {/* ── (a) GLASS CARD + GlowPulseOverlay rim — the title lockup. ───────── */}
      <GlowPulseOverlay
        theme={theme}
        startFrame={CARD_START}
        radius={32}
        borderWidth={2}
        glowSigma={22}
        style={{
          position: "absolute",
          top: 230,
          left: 90,
          width: FRAME_W - 180,
        }}
      >
        <div
          style={{
            ...glassCardStyle({ theme, radius: 32, padding: "54px 56px" }),
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {kicker ? (
            <div
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.accent, // SOLID accent — no background-clip.
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: 72,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              color: t.inkOnGlass, // SOLID ink on the translucent card.
            }}
          >
            {title}
          </div>
        </div>
      </GlowPulseOverlay>

      {/* ── (b) LitSphereGlyph — numbered orb docks in, then its caption. ───── */}
      <div
        style={{
          position: "absolute",
          top: 760,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <LitSphereGlyph
          glyph={orbGlyph}
          size={180}
          theme={theme}
          startFrame={ORB_START}
          dockOvershoot
        />
        {orbCaption ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: "-0.01em",
              color: t.inkOnGlass, // SOLID ink.
              opacity: orbCaptionOpacity,
            }}
          >
            {orbCaption}
          </div>
        ) : null}
      </div>

      {/* ── (c) ClauseHighlightPhrase — line reveals, then the second-read
       *  marker sweeps over the key phrase. ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 1200,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ClauseHighlightPhrase
          text={highlightText}
          phrases={highlightPhrases}
          variant="inline-select"
          theme={theme}
          startFrame={CLAUSE_START}
          fontSize={52}
          style={{ textAlign: "center", maxWidth: FRAME_W - 200 }}
        />
      </div>

      {/* ── (d) ArcLightWipe — the capping light-bridge sweep. ──────────────── */}
      <ArcLightWipe
        theme={theme}
        startFrame={WIPE_START}
        durationInFrames={28}
        direction="ltr"
        angleDeg={18}
      />
    </AbsoluteFill>
  );
};
