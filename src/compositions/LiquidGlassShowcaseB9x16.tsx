/**
 * LiquidGlassShowcaseB9x16 — a render-QA SHOWCASE for the TWO net-new background /
 * depth atoms in the liquid-glass family: RibbonParallax + SoftDepthFieldVignette.
 *
 * WHY THIS EXISTS (austin.marchese + nateherk study; Opus craft note)
 * ------------------------------------------------------------------
 * The first showcase (LiquidGlassShowcase9x16) exercises the FOUR foreground atoms
 * (GlowPulseOverlay rim, LitSphereGlyph, ClauseHighlightPhrase, ArcLightWipe). The
 * 3-reviewer study (see docs/research/austin-anim/FINAL-CONSENSUS.md) also flagged
 * TWO atmosphere atoms that the original showcase does NOT cover:
 *   (1) RibbonParallax — the "alive background": austin/nate frames never sit on a
 *       DEAD backdrop; under the (otherwise static) cards a slow, heavily-blurred
 *       wash of themed color drifts on its OWN clock, independent of foreground.
 *   (2) SoftDepthFieldVignette — instead of a hard card over footage, ONE side of
 *       the frame is blurred + darkened with a feathered edge to open up "reading
 *       room" for a list/caption while the underlying texture stays visible.
 *
 * This composition exists so a single headless render proves BOTH draw correctly,
 * on-brand, and compose together: a drifting RibbonParallax fills the whole frame
 * as ambient color, and a SoftDepthFieldVignette pinned to the RIGHT edge opens a
 * darkened/blurred reading panel over that drift — with a short 3-item Spanish list
 * painted into the cleared area so the depth-field effect is visibly doing its job
 * (the list reads crisp; the drift behind it is pushed back and dimmed).
 *
 * The single `theme` prop drives BOTH atoms (brand / warm / cool) so flipping one
 * token re-skins the whole showcase. `brand` is the default Armando-Inteligencia
 * navy/gold; warm/cool exist for austin/nate parity studies.
 *
 * GOTCHAS HANDLED (headless Remotion): both consumed atoms are already headless-safe
 * (no background-clip:text / -webkit-text-fill-color:transparent — those paint as
 * opaque rects in headless Chromium). This file adds only solid-fill text, plain
 * backgrounds, and transforms — and the only motion it introduces (list entrance)
 * derives purely from useCurrentFrame() (no Math.random / Date.now / window). Comp
 * id is [a-zA-Z0-9-]-safe (no underscores). backdrop-filter blur IS honored in our
 * Remotion renders, which is what makes the SoftDepthFieldVignette panel frost.
 *
 * Self-contained: imports react, remotion, zod, the two atoms + tokens (sibling
 * folder), and the house FONT_STACKS. Touches no existing file (Root.tsx/tokens.ts
 * untouched — this comp is not auto-registered anywhere; see the registration
 * contract returned alongside this file).
 */
import React from "react";
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand/fonts";
import { RibbonParallax } from "../components/liquidglass/RibbonParallax";
import { SoftDepthFieldVignette } from "../components/liquidglass/SoftDepthFieldVignette";
import {
  glassCardStyle,
  lgTheme,
  withAlpha,
} from "../components/liquidglass/tokens";

// ─── Schema (every field defaulted so schema.parse({}) yields full defaultProps) ─
export const liquidGlassShowcaseB9x16Schema = z.object({
  /** Eyebrow/kicker above the list title (uppercase tracked, solid accent). */
  kicker: z.string().default("FONDO VIVO · CAMPO DE PROFUNDIDAD"),
  /** Heading rendered above the list, inside the cleared reading panel. */
  title: z.string().default("Tres capas, una sola lectura"),
  /**
   * The short Spanish list painted into the SoftDepthFieldVignette's reading
   * area. Three items reads best — the panel is sized for a compact list, not a
   * paragraph. Each item gets a numbered glyph chip and staggers in.
   */
  items: z
    .array(z.string())
    .default([
      "El fondo deriva en su propio reloj.",
      "El panel desenfoca y oscurece la footage.",
      "El texto queda nítido sobre el campo difuso.",
    ]),
  /**
   * Liquid-glass theme — drives BOTH atoms (RibbonParallax hues + vignette tint)
   * AND the list chrome. "brand" = navy/gold (default), "warm" = austin
   * burgundy/magenta, "cool" = nate cyan/teal (parity studies).
   */
  theme: z.enum(["brand", "warm", "cool"]).default("brand"),

  // ── RibbonParallax (background atom) knobs, all defaulted. ──────────────────
  /** Number of drifting ribbons/blobs (1..3); 3 reads as a full ambient wash. */
  ribbonCount: z.number().int().default(3),
  /** Ribbon drift-clock multiplier (1 = base; kept slow so it never competes). */
  ribbonSpeed: z.number().default(1),
  /** Master opacity of the ribbon layer (kept moderate so text wins). */
  ribbonOpacity: z.number().default(0.55),
  /** Blur (px) on the whole ribbon stack so blobs fuse into ambient color. */
  ribbonBlurSigma: z.number().default(80),

  // ── SoftDepthFieldVignette (depth atom) knobs, all defaulted. ──────────────
  /** Reading-panel width as a % of the frame width (pinned to the right edge). */
  panelWidthPct: z.number().default(60),
  /** backdrop-filter blur (px) the panel applies to the ribbon drift beneath. */
  panelBlurSigma: z.number().default(8),
  /** Darken strength at the panel's outer (right) edge — 0..1 black alpha. */
  panelDarken: z.number().default(0.42),
  /** Feather band as a % of the panel's own width (the soft inner transition). */
  panelFeatherPct: z.number().default(26),
  /** Layer a subtle themed glow wash over the panel for brand cohesion. */
  panelTint: z.boolean().default(true),

  // CRITICAL: transitionVerb (house contract — imperative voice for the prompt
  // pipeline; does not drive runtime).
  transitionVerb: z
    .string()
    .default(
      "Atmosphere + depth showcase: a heavily-blurred themed color wash drifts continuously across the whole frame on its own slow clock; a feathered reading-room panel pinned to the right edge blurs and darkens that drift to open clear space; a kicker, a heading, then a numbered three-item Spanish list fade and rise into the cleared area in a gentle stagger so the depth-field separation reads.",
    ),
});
export type LiquidGlassShowcaseB9x16Props = z.infer<
  typeof liquidGlassShowcaseB9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

// Deep-navy backdrop UNDER the ribbon drift so the blurred blobs read against a
// dark body (the ribbons are alpha'd; without a dark base they would wash grey).
const BG_DEEP_NAVY = "#0F1B2D";

// Staggered entrance frames (30fps, 150f total). The atoms themselves are
// background/static; only the LIST text animates, so all timing lives here.
const KICKER_START = 8; // eyebrow fades in first
const TITLE_START = 16; // heading rises in
const LIST_START = 30; // first list item; each subsequent item +LIST_STAGGER
const LIST_STAGGER = 14; // frames between consecutive list items

/** One list row: numbered chip + Spanish text, fading + rising on its own beat. */
const ListItem: React.FC<{
  index: number;
  text: string;
  startFrame: number;
  glow: string;
  ink: string;
  chipFill: string;
}> = ({ index, text, startFrame, glow, ink, chipFill }) => {
  const frame = useCurrentFrame();

  // Fade + rise: opacity 0→1 over 14f, translateY 18px→0 with an ease-out so the
  // row "settles" rather than slides. Frame-deterministic (useCurrentFrame only).
  const appear = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(appear, [0, 1], [18, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        opacity: appear,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Numbered glyph chip — solid themed fill, solid ink (no background-clip). */}
      <div
        style={{
          flex: "0 0 auto",
          width: 64,
          height: 64,
          borderRadius: 18,
          background: chipFill,
          border: `2px solid ${withAlpha(glow, 0.9)}`,
          boxShadow: `0 0 18px ${withAlpha(glow, 0.45)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_STACKS.mono,
          fontWeight: 700,
          fontSize: 32,
          color: glow, // SOLID accent glyph.
        }}
      >
        {index + 1}
      </div>
      {/* Item text — solid ink so it reads crisp over the darkened/blurred panel. */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.18,
          letterSpacing: "-0.01em",
          color: ink, // SOLID ink on the cleared reading area.
          paddingTop: 4,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const LiquidGlassShowcaseB9x16: React.FC<
  LiquidGlassShowcaseB9x16Props
> = ({
  kicker,
  title,
  items,
  theme,
  ribbonCount,
  ribbonSpeed,
  ribbonOpacity,
  ribbonBlurSigma,
  panelWidthPct,
  panelBlurSigma,
  panelDarken,
  panelFeatherPct,
  panelTint,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);

  // Kicker + title share the same fade+rise vocabulary as the list rows.
  const kickerAppear = interpolate(
    frame,
    [KICKER_START, KICKER_START + 12],
    [0, 1],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleAppear = interpolate(
    frame,
    [TITLE_START, TITLE_START + 14],
    [0, 1],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleTranslateY = interpolate(titleAppear, [0, 1], [20, 0]);

  // The numbered-chip fill: a low-alpha themed tint so the chip reads as glass,
  // not a solid block, against the blurred panel.
  const chipFill = withAlpha(t.glow, 0.16);

  return (
    <AbsoluteFill
      style={{ background: BG_DEEP_NAVY, fontFamily: FONT_STACKS.sans }}
    >
      {/* ── (1) RibbonParallax — the drifting "alive background" atom. It is the
       *  FIRST child so everything else paints on top; it fills the whole frame
       *  as ambient themed color drifting on its own slow clock. ───────────── */}
      <RibbonParallax
        theme={theme}
        speed={ribbonSpeed}
        count={ribbonCount}
        opacity={ribbonOpacity}
        blurSigma={ribbonBlurSigma}
      />

      {/* ── (2) SoftDepthFieldVignette — the depth atom. Pinned to the RIGHT
       *  edge, it blurs + darkens the ribbon drift with a feathered inner edge
       *  to open a reading panel. It does NOT render the list — we paint that
       *  over the cleared area ourselves (next block). ─────────────────────── */}
      <SoftDepthFieldVignette
        side="right"
        widthPct={panelWidthPct}
        blurSigma={panelBlurSigma}
        darken={panelDarken}
        featherPct={panelFeatherPct}
        theme={theme}
        tint={panelTint}
      />

      {/* ── List content painted INTO the cleared (blurred + darkened) reading
       *  area on the right. Right-aligned block so it sits over the solid edge,
       *  not the feathered melt-into-footage inner edge. ──────────────────── */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: 360,
            right: 90,
            // Constrain to the solid part of the panel (panel width minus the
            // feather band and the outer padding) so text never runs into the
            // soft inner edge where the darkening fades out.
            width: FRAME_W * (panelWidthPct / 100) - 150,
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          {kicker ? (
            <div
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: t.accent, // SOLID accent — no background-clip.
                opacity: kickerAppear,
              }}
            >
              {kicker}
            </div>
          ) : null}

          {title ? (
            <div
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 900,
                fontSize: 62,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: "#FFFFFF", // SOLID white heading over the dark panel.
                opacity: titleAppear,
                transform: `translateY(${titleTranslateY}px)`,
                marginBottom: 12,
              }}
            >
              {title}
            </div>
          ) : null}

          {/* The 3-item Spanish list, each row on its own staggered beat. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            {items.map((item, i) => (
              <ListItem
                key={i}
                index={i}
                text={item}
                startFrame={LIST_START + i * LIST_STAGGER}
                glow={t.glow}
                ink={t.inkOnGlass}
                chipFill={chipFill}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* ── A small left-edge glass chip labels the LEFT (in-focus) side so the
       *  depth split is unambiguous in the QA render: the left stays sharp (just
       *  the drift), the right is the reading panel. Uses glassCardStyle so the
       *  card-material itself is also exercised in this showcase. ──────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 70,
          ...glassCardStyle({ theme, radius: 22, padding: "20px 28px" }),
          opacity: interpolate(frame, [LIST_START, LIST_START + 16], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: t.accent, // SOLID accent.
          }}
        >
          Fondo enfocado
        </div>
      </div>
    </AbsoluteFill>
  );
};
