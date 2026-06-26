/**
 * LitSphereGlyph — a lit, 3D specular SPHERE/orb for numbered step / chapter
 * lockups.
 *
 * WHY THIS EXISTS (Opus + Gemini verification, 2026-06-26)
 * -------------------------------------------------------
 * The repo has NO specular / 3D-sphere primitive — every radial-gradient in the
 * codebase is a FLAT vignette (background glow, soft contact shadow), never a
 * shaded body with a light source. Numbered step/chapter lockups (austin's
 * "01 / 02 / 03" liquid-glass beads, nate's chapter dots) want an orb that
 * reads as a physical, lit sphere: a bright lit hemisphere, a dark TERMINATOR
 * on the far side, and a tight SPECULAR highlight offset toward the light.
 *
 * This atom builds that purely in CSS — no SVG filters, no external libs, no
 * canvas. The "3D" is three stacked radial-gradients on one round element:
 *   1. BODY   — a radial-gradient whose center is offset toward `lightAngle`,
 *               running bright (near the light) → mid → dark TERMINATOR (far
 *               side). This is the core shading that sells the sphere.
 *   2. AMBIENT/RIM — a faint cool counter-light on the shadow side so the
 *               terminator doesn't go dead black (real spheres catch bounce).
 *   3. SPECULAR — a small, bright, tight radial-gradient hotspot placed at the
 *               light-facing quadrant; this is the "wet"/glassy glint.
 * A soft CONTACT SHADOW is a separate blurred ellipse under the orb, and the
 * glyph/number is centered on top in bold Inter (inkOnGlass).
 *
 * DOCK-IN (deterministic, frame-driven):
 *   - The whole orb scales 0.6 → 1 with a spring overshoot over ~14f from
 *     `startFrame` (set `dockOvershoot=false` for a clean ease, no bounce).
 *   - As it docks, the light "settles": the specular + terminator shift SLIGHTLY
 *     (the body-gradient center and the specular position ease from a slightly
 *     flatter / more head-on lighting toward the final `lightAngle`), so the
 *     sphere appears to catch the light as it lands rather than being pre-lit.
 *   - ANTICIPATION (optional): show a "?" for the first ~12f, then quick
 *     cross-fade + scale morph into the real glyph (the "reveal the number"
 *     beat used over a teased step).
 *
 * GOTCHA HANDLED (headless Remotion):
 *   - NO background-clip:text / -webkit-text-fill-color:transparent (paints as
 *     an opaque rect in headless Chromium). The glyph is a SOLID-colored text
 *     node. All shading is real radial-gradients on background layers.
 *
 * Self-contained: imports only react + remotion + the liquidglass tokens (same
 * folder) + FONT_STACKS. Pure CSS, no DOM measurement, no window/Date.now/
 * Math.random — SSR-safe and frame-deterministic.
 *
 * @dualAspect Aspect-agnostic atom (a fixed-size orb); drop into any composition.
 */
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACKS } from "../../brand/fonts";
import { lgTheme, withAlpha, type LiquidGlassTheme } from "./tokens";

export interface LitSphereGlyphProps {
  /** The glyph/number centered on the orb (e.g. "1", "02", "A"). */
  glyph?: string;
  /** Diameter of the sphere in px. */
  size?: number;
  /** Liquid-glass theme (drives the default body color + ink). */
  theme?: LiquidGlassTheme;
  /** Sphere body / glow hue. Defaults to the theme's glow accent. */
  bodyColor?: string;
  /**
   * Light source direction in degrees, CSS convention (0 = up/12-o'clock,
   * 90 = right, 180 = down, 270 = left). The lit hemisphere + specular sit
   * toward this angle; the terminator sits opposite. Default 135 = lower-right.
   */
  lightAngle?: number;
  /** Frame (local to the enclosing Sequence) at which the dock-in begins. */
  startFrame?: number;
  /** Spring overshoot on the dock-in scale. false = clean ease, no bounce. */
  dockOvershoot?: boolean;
  /** Show "?" for the first ~12f, then morph to the real glyph. */
  anticipation?: boolean;
  /** Extra styles merged onto the outer wrapper (positioning, margins, etc.). */
  style?: React.CSSProperties;
}

// Anticipation beat: how long the "?" holds before morphing to the glyph, and
// the cross-fade/scale window for the morph itself.
const ANTICIPATION_HOLD = 12;
const MORPH_FRAMES = 6;
// Dock-in duration (frames). The spring/ease both resolve within this window.
const DOCK_FRAMES = 14;

/**
 * Convert a CSS-convention angle (0 = up, clockwise) to a unit vector in screen
 * space (x → right, y → down). Used to place the light-facing offset for the
 * body gradient + the specular highlight.
 */
function angleToVector(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  // 0° → up (0,-1); 90° → right (1,0); rotates clockwise.
  return { x: Math.sin(rad), y: -Math.cos(rad) };
}

export const LitSphereGlyph: React.FC<LitSphereGlyphProps> = ({
  glyph = "1",
  size = 120,
  theme = "brand",
  bodyColor,
  lightAngle = 135,
  startFrame = 0,
  dockOvershoot = true,
  anticipation = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = lgTheme(theme);
  const body = bodyColor ?? t.glow;
  const ink = t.inkOnGlass;

  // ── Dock-in scale: 0.6 → 1 over DOCK_FRAMES, optional spring overshoot ──────
  const local = frame - startFrame;
  const docked = dockOvershoot
    ? spring({
        frame: local,
        fps,
        // Lively but controlled overshoot (~6-8% past 1 before settling).
        config: { damping: 11, stiffness: 170, mass: 0.7 },
        durationInFrames: DOCK_FRAMES,
      })
    : interpolate(local, [0, DOCK_FRAMES], [0, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const scale = interpolate(docked, [0, 1], [0.6, 1]);
  // Fade the whole orb in over the first few frames of the dock so it doesn't
  // pop at 0.6 scale.
  const appear = interpolate(local, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Light "settle": as the orb docks, the lighting eases from a flatter,
  // more head-on direction toward the final lightAngle, so the specular +
  // terminator visibly SHIFT into place rather than being pre-lit. `settle`
  // 0 → 1 tracks the dock progress (clamped, monotonic). ──────────────────────
  const settle = interpolate(local, [0, DOCK_FRAMES], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Start ~22° "earlier" (more toward straight-up / head-on) and rotate into the
  // target as it lands. The magnitude of the light offset also grows slightly so
  // the sphere reads flatter at first, then gains depth.
  const liveAngle = lightAngle - (1 - settle) * 22;
  const dir = angleToVector(liveAngle);
  const lightStrength = interpolate(settle, [0, 1], [0.78, 1]);

  // Body-gradient center: pushed toward the light by ~30% of the radius so the
  // bright lobe sits on the lit side and the far side falls into the terminator.
  const bodyOffsetPct = 30 * lightStrength;
  const bodyCx = 50 + dir.x * bodyOffsetPct;
  const bodyCy = 50 + dir.y * bodyOffsetPct;

  // Specular hotspot: further toward the light (~62% of radius) and small/tight.
  const specOffsetPct = 62 * lightStrength;
  const specCx = 50 + dir.x * specOffsetPct;
  const specCy = 50 + dir.y * specOffsetPct;
  // Specular sharpens as it settles (wider+softer at first, tight glint at rest).
  const specRadius = interpolate(settle, [0, 1], [26, 18]);
  const specAlpha = interpolate(settle, [0, 1], [0.55, 0.92]);

  // Ambient bounce on the shadow side (opposite the light) so the terminator
  // catches a faint cool counter-light instead of going dead black.
  const ambientCx = 50 - dir.x * 34;
  const ambientCy = 50 - dir.y * 34;

  // ── BODY shading: bright lobe (lit side) → mid body → dark terminator. The
  // three radial-gradients stack (specular on top, then body, then ambient). ──
  const specularLayer = `radial-gradient(circle at ${specCx}% ${specCy}%, ${withAlpha(
    "#FFFFFF",
    specAlpha,
  )} 0%, ${withAlpha("#FFFFFF", specAlpha * 0.45)} ${specRadius * 0.4}%, rgba(255,255,255,0) ${specRadius}%)`;

  const bodyLayer = `radial-gradient(circle at ${bodyCx}% ${bodyCy}%, ${lighten(
    body,
    0.55,
  )} 0%, ${body} 38%, ${darken(body, 0.42)} 72%, ${darken(body, 0.68)} 100%)`;

  const ambientLayer = `radial-gradient(circle at ${ambientCx}% ${ambientCy}%, ${withAlpha(
    lighten(body, 0.35),
    0.28,
  )} 0%, rgba(0,0,0,0) 46%)`;

  // Contact shadow under the orb (separate blurred ellipse). Drops straight down
  // a touch regardless of light, so the orb feels seated on a surface.
  const shadowW = size * 0.78;
  const shadowH = size * 0.18;

  // ── Glyph vs anticipation "?" cross-fade/scale morph. ───────────────────────
  let glyphOpacity = 1;
  let glyphScale = 1;
  let questionOpacity = 0;
  let questionScale = 1;
  if (anticipation) {
    const morphStart = ANTICIPATION_HOLD;
    // "?" holds full, then fades+shrinks out across the morph window.
    questionOpacity = interpolate(
      local,
      [morphStart, morphStart + MORPH_FRAMES],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    questionScale = interpolate(
      local,
      [morphStart, morphStart + MORPH_FRAMES],
      [1, 1.25],
      { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    // Glyph fades+grows in over the same window (cross-fade).
    glyphOpacity = interpolate(
      local,
      [morphStart, morphStart + MORPH_FRAMES],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    glyphScale = interpolate(
      local,
      [morphStart, morphStart + MORPH_FRAMES],
      [0.7, 1],
      { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  // Glyph font-size scales with the orb; trims for multi-char glyphs ("02").
  const glyphLen = Math.max(1, glyph.length);
  const glyphFontSize = size * (glyphLen >= 2 ? 0.42 : 0.5);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: appear,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        ...style,
      }}
    >
      {/* Contact shadow — blurred ellipse seated under the orb. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -size * 0.06,
          width: shadowW,
          height: shadowH,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${withAlpha(
            "#000000",
            0.45,
          )} 0%, rgba(0,0,0,0) 72%)`,
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />

      {/* The lit sphere — stacked radial-gradients (specular, body, ambient). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          // Layer order: specular on top → body → ambient bounce at the base.
          backgroundImage: `${specularLayer}, ${bodyLayer}, ${ambientLayer}`,
          // A faint outer rim glow in the body hue so the orb separates from a
          // dark backdrop (the liquid-glass "powered-on" cue).
          boxShadow: `0 0 ${Math.round(size * 0.16)}px ${withAlpha(
            body,
            0.45,
          )}, inset 0 ${Math.round(size * 0.04)}px ${Math.round(
            size * 0.08,
          )}px ${withAlpha("#FFFFFF", 0.18)}`,
        }}
      />

      {/* Anticipation "?" (only when enabled and still visible). */}
      {anticipation && questionOpacity > 0.001 ? (
        <span
          style={{
            position: "relative",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: glyphFontSize,
            lineHeight: 1,
            color: ink, // SOLID color — no background-clip text.
            opacity: questionOpacity,
            transform: `scale(${questionScale})`,
            textShadow: `0 2px 6px ${withAlpha("#000000", 0.35)}`,
            userSelect: "none",
          }}
        >
          ?
        </span>
      ) : null}

      {/* The glyph / number — centered, bold Inter, solid inkOnGlass. */}
      {!anticipation || glyphOpacity > 0.001 ? (
        <span
          style={{
            position: anticipation ? "absolute" : "relative",
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: glyphFontSize,
            lineHeight: 1,
            letterSpacing: glyphLen >= 2 ? "-0.02em" : "0",
            color: ink, // SOLID color — no background-clip text.
            opacity: anticipation ? glyphOpacity : 1,
            transform: `scale(${anticipation ? glyphScale : 1})`,
            textShadow: `0 2px 6px ${withAlpha("#000000", 0.35)}`,
            userSelect: "none",
          }}
        >
          {glyph}
        </span>
      ) : null}
    </div>
  );
};

// ── Local color helpers (mix a #rrggbb hex toward white / black). Kept inline so
// the atom stays self-contained against the tokens module's withAlpha. ─────────
function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function parseHex(color: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/** Mix a hex color toward white by `amount` (0..1). Non-hex passes through. */
function lighten(color: string, amount: number): string {
  const c = parseHex(color);
  if (!c) return color;
  const a = Math.max(0, Math.min(1, amount));
  const r = clampChannel(c.r + (255 - c.r) * a);
  const g = clampChannel(c.g + (255 - c.g) * a);
  const b = clampChannel(c.b + (255 - c.b) * a);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Mix a hex color toward black by `amount` (0..1). Non-hex passes through. */
function darken(color: string, amount: number): string {
  const c = parseHex(color);
  if (!c) return color;
  const a = Math.max(0, Math.min(1, amount));
  const r = clampChannel(c.r * (1 - a));
  const g = clampChannel(c.g * (1 - a));
  const b = clampChannel(c.b * (1 - a));
  return `rgb(${r}, ${g}, ${b})`;
}
