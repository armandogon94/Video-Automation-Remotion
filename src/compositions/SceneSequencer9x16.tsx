/**
 * SceneSequencer9x16 — multi-scene Short orchestrator (1080×1920, fps 30).
 *
 * PURPOSE
 * Most creators (esp. CodingFab) chain 4–7 discrete SCENES per Short:
 *   hook/hero → comparison → stat/chart → bullets → CTA.
 * We have 120+ atomic templates but no single composition that stitches several
 * scenes into one full Short. This is that orchestrator.
 *
 * DESIGN
 * The schema's `scenes` field is an array of a DISCRIMINATED UNION (field `kind`).
 * Each scene carries its own content fields PLUS a per-scene `durationInFrames`
 * (default 75 ≈ 2.5s @30fps) and an entrance `transition`
 * ("fade" | "slideUp" | "none", default "fade").
 *
 * A curated set of SELF-CONTAINED in-file scene renderers (we deliberately do
 * NOT import the 120+ atomic comps — this file stands alone):
 *   - kind="hero"        kicker + big two-tone headline + accent underline
 *   - kind="comparison"  two labeled columns with a VS divider + bullet rows
 *   - kind="stat"        big hero number + label + supporting line + animated underline
 *   - kind="bullets"     title + staggered checklist
 *   - kind="cta"         headline + handle/CTA chip
 *
 * The scenes play back-to-back with Remotion <Series> (Series.Sequence per scene,
 * each with its own durationInFrames). The per-scene entrance transition is a
 * MANUAL opacity/translate cross-fade driven by spring()/interpolate — lower risk
 * than @remotion/transitions and fully self-contained.
 *
 * A subtle persistent progress bar across the very top shows scene position.
 *
 * Brand: navy #1B3A6E / gold #D4AF37 / deep-navy #0F1B2D / cream #FAF7F2.
 * Palette prop: "cream" (default light) and "dark".
 *
 * GOTCHA observed across this codebase: never use background-clip:text +
 * color:transparent — Remotion's headless Chromium paints that as an opaque
 * rectangle. All hero/headline text uses SOLID color.
 */
import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, CREAM_PALETTE, resolveColors, getPalette, FONT_STACKS, type PaletteMode } from "../brand";

// ─── Brand constants (sourced from the brand token — never re-literal hexes) ──
const BRAND_NAVY = BRAND.colors.primary;
const BRAND_GOLD = BRAND.colors.accent;
const BRAND_DEEP_NAVY = BRAND.colors.backgroundDark;
const BRAND_CREAM = CREAM_PALETTE.paper;

const FRAME_W = 1080;
const FRAME_H = 1920;
const CONTENT_LEFT = 96;
const CONTENT_WIDTH = FRAME_W - CONTENT_LEFT * 2;

const DEFAULT_SCENE_FRAMES = 75; // ≈ 2.5s @30fps

// ─── Shared per-scene fields ────────────────────────────────────────
const transitionSchema = z.enum(["fade", "slideUp", "none"]).default("fade");

const sceneBaseFields = {
  /** Frames this scene holds the screen (its own entrance + dwell). */
  durationInFrames: z.number().int().min(15).max(900).default(DEFAULT_SCENE_FRAMES),
  /** Entrance transition applied at the start of this scene's window. */
  transition: transitionSchema,
};

// A bullet row shared by comparison + bullets scenes.
const bulletRowSchema = z.object({
  text: z.string().default(""),
  /** Empty-string = use the scene/palette accent for the check/marker. */
  accent: z.string().default(""),
});

// ─── Discriminated-union scene schema ───────────────────────────────
const heroSceneSchema = z.object({
  kind: z.literal("hero"),
  /** Small tracked-uppercase kicker above the headline. Empty = none. */
  kicker: z.string().default("AI VIDEO FACTORY"),
  /** First (ink-colored) part of the headline. */
  headline: z.string().default("Build full Shorts"),
  /** Second (accent-colored) part of the headline. Empty = single-tone. */
  headlineAccent: z.string().default("from scenes."),
  ...sceneBaseFields,
});

const comparisonSceneSchema = z.object({
  kind: z.literal("comparison"),
  /** Small tracked-uppercase title above the two columns. Empty = none. */
  title: z.string().default("Old way vs new way"),
  leftLabel: z.string().default("Manual"),
  rightLabel: z.string().default("Sequencer"),
  leftRows: z.array(bulletRowSchema).default([
    { text: "Render each clip", accent: "" },
    { text: "Stitch in an editor", accent: "" },
    { text: "Re-export per platform", accent: "" },
  ]),
  rightRows: z.array(bulletRowSchema).default([
    { text: "One composition", accent: "" },
    { text: "Scenes back-to-back", accent: "" },
    { text: "Render once", accent: "" },
  ]),
  ...sceneBaseFields,
});

const statSceneSchema = z.object({
  kind: z.literal("stat"),
  /** Hero figure string shown solid (e.g. "7×", "$0.25", "92%"). */
  number: z.string().default("7×"),
  /** Small tracked-uppercase label above the figure. Empty = none. */
  label: z.string().default("FASTER ASSEMBLY"),
  /** Supporting line under the animated underline. Empty = none. */
  supporting: z.string().default("vs editing scenes by hand"),
  /** Empty-string = use the scene/palette accent for the figure + underline. */
  accent: z.string().default(""),
  ...sceneBaseFields,
});

const bulletsSceneSchema = z.object({
  kind: z.literal("bullets"),
  title: z.string().default("What you get"),
  rows: z.array(bulletRowSchema).default([
    { text: "Hero, comparison, stat scenes", accent: "" },
    { text: "Per-scene transitions", accent: "" },
    { text: "A clean CTA outro", accent: "" },
  ]),
  ...sceneBaseFields,
});

const ctaSceneSchema = z.object({
  kind: z.literal("cta"),
  headline: z.string().default("Follow for more"),
  /** Handle / CTA chip text (e.g. "@armandointeligencia"). Empty = none. */
  handle: z.string().default("@armandointeligencia"),
  /** Empty-string = use the scene/palette accent for the chip fill. */
  accent: z.string().default(""),
  ...sceneBaseFields,
});

const sceneSchema = z.discriminatedUnion("kind", [
  heroSceneSchema,
  comparisonSceneSchema,
  statSceneSchema,
  bulletsSceneSchema,
  ctaSceneSchema,
]);

export type Scene = z.infer<typeof sceneSchema>;

// ─── Default scene reel (5 scenes → 375 frames @ default duration) ──
const DEFAULT_SCENES: Scene[] = [
  {
    kind: "hero",
    kicker: "AI VIDEO FACTORY",
    headline: "Build full Shorts",
    headlineAccent: "from scenes.",
    durationInFrames: DEFAULT_SCENE_FRAMES,
    transition: "fade",
  },
  {
    kind: "comparison",
    title: "Old way vs new way",
    leftLabel: "Manual",
    rightLabel: "Sequencer",
    leftRows: [
      { text: "Render each clip", accent: "" },
      { text: "Stitch in an editor", accent: "" },
      { text: "Re-export per platform", accent: "" },
    ],
    rightRows: [
      { text: "One composition", accent: "" },
      { text: "Scenes back-to-back", accent: "" },
      { text: "Render once", accent: "" },
    ],
    durationInFrames: DEFAULT_SCENE_FRAMES,
    transition: "slideUp",
  },
  {
    kind: "stat",
    number: "7×",
    label: "FASTER ASSEMBLY",
    supporting: "vs editing scenes by hand",
    accent: "",
    durationInFrames: DEFAULT_SCENE_FRAMES,
    transition: "fade",
  },
  {
    kind: "bullets",
    title: "What you get",
    rows: [
      { text: "Hero, comparison, stat scenes", accent: "" },
      { text: "Per-scene transitions", accent: "" },
      { text: "A clean CTA outro", accent: "" },
    ],
    durationInFrames: DEFAULT_SCENE_FRAMES,
    transition: "slideUp",
  },
  {
    kind: "cta",
    headline: "Follow for more",
    handle: "@armandointeligencia",
    accent: "",
    durationInFrames: DEFAULT_SCENE_FRAMES,
    transition: "fade",
  },
];

// ─── Top-level schema (every field has a .default) ──────────────────
export const sceneSequencer9x16Schema = z.object({
  scenes: z.array(sceneSchema).default(DEFAULT_SCENES),
  /** Surface palette. "cream" = brand light (default), "dark" = deep-navy. */
  palette: z.enum(["cream", "dark"]).default("cream"),
  /** Global accent override. Empty-string = brand gold / palette accent. */
  accentColor: z.string().default(""),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  mutedColor: z.string().default(""),
  /** Show the persistent top progress bar across the whole Short. */
  showProgressBar: z.boolean().default(true),
});

export type SceneSequencer9x16Props = z.infer<typeof sceneSequencer9x16Schema>;

/**
 * Total composition duration = Σ per-scene `durationInFrames`. Mirrors the
 * component's own `safeScenes` fallback so `calculateMetadata` in Root.tsx
 * yields a length that always fits the content (no truncation in Studio or
 * direct `npx remotion render`).
 */
export function computeSceneSequencerFrames(
  scenes: SceneSequencer9x16Props["scenes"],
): number {
  const safeScenes = scenes.length > 0 ? scenes : DEFAULT_SCENES;
  return safeScenes.reduce((sum, s) => sum + s.durationInFrames, 0);
}

/**
 * Total composition duration for the DEFAULT scene reel (5 × 75 = 375 frames
 * ≈ 12.5s). Retained for callers that want the default-props length directly.
 */
export const SCENE_SEQUENCER_DEFAULT_TOTAL_FRAMES =
  computeSceneSequencerFrames(DEFAULT_SCENES);

// ─── Resolved color bundle shared by every scene renderer ───────────
interface ResolvedColors {
  paper: string;
  ink: string;
  accent: string;
  muted: string;
  isDark: boolean;
  grainOverlay: string;
}

// ─── Entrance transition hook ───────────────────────────────────────
/**
 * Returns the opacity + Y-offset (px) for a scene's entrance, given its
 * scene-local frame and the requested transition. Each Series.Sequence
 * resets the frame to 0 at its own start, so we read the local frame.
 */
function useEntrance(
  transition: "fade" | "slideUp" | "none",
): { opacity: number; translateY: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (transition === "none") {
    return { opacity: 1, translateY: 0 };
  }

  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
    durationInFrames: Math.round(0.5 * fps),
  });

  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY =
    transition === "slideUp" ? interpolate(enter, [0, 1], [60, 0]) : 0;

  return { opacity, translateY };
}

// ─── Scene chrome wrapper (entrance + centered content column) ──────
const SceneFrame: React.FC<{
  transition: "fade" | "slideUp" | "none";
  children: React.ReactNode;
}> = ({ transition, children }) => {
  const { opacity, translateY } = useEntrance(transition);
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: CONTENT_LEFT,
          top: 0,
          width: CONTENT_WIDTH,
          height: FRAME_H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ─── Small reusable bits ────────────────────────────────────────────
const Kicker: React.FC<{ text: string; color: string }> = ({ text, color }) =>
  text ? (
    <div
      style={{
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        marginBottom: 28,
      }}
    >
      {text}
    </div>
  ) : null;

const CheckRow: React.FC<{
  text: string;
  markerColor: string;
  inkColor: string;
  localFrame: number;
  delayFrames: number;
  fontSize?: number;
}> = ({ text, markerColor, inkColor, localFrame, delayFrames, fontSize = 46 }) => {
  const o = interpolate(localFrame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(localFrame, [delayFrames, delayFrames + 10], [-22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 18,
        opacity: o,
        transform: `translateX(${x}px)`,
      }}
    >
      <span
        style={{
          flex: "0 0 auto",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: fontSize * 0.8,
          lineHeight: 1.1,
          color: markerColor,
        }}
      >
        ✓
      </span>
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.2,
          color: inkColor,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Scene renderers ────────────────────────────────────────────────
const HeroScene: React.FC<{
  scene: Extract<Scene, { kind: "hero" }>;
  colors: ResolvedColors;
}> = ({ scene, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Accent underline wipes in after the headline settles.
  const underline = interpolate(frame, [Math.round(0.45 * fps), Math.round(0.9 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Kicker text={scene.kicker} color={colors.accent} />
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 116,
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ color: colors.ink }}>{scene.headline}</span>
        {scene.headlineAccent ? (
          <>
            {" "}
            <span style={{ color: colors.accent }}>{scene.headlineAccent}</span>
          </>
        ) : null}
      </div>
      <div
        style={{
          marginTop: 36,
          width: 360,
          height: 10,
          borderRadius: 5,
          background: colors.accent,
          transform: `scaleX(${underline})`,
          transformOrigin: "left center",
          boxShadow: `0 0 18px ${colors.accent}55`,
        }}
      />
    </>
  );
};

const ComparisonScene: React.FC<{
  scene: Extract<Scene, { kind: "comparison" }>;
  colors: ResolvedColors;
}> = ({ scene, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colDelay = Math.round(0.25 * fps);
  const rowStagger = Math.round(0.12 * fps);

  const Column: React.FC<{
    label: string;
    rows: { text: string; accent: string }[];
    markerColor: string;
  }> = ({ label, rows, markerColor }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 48,
          color: colors.ink,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {rows.map((r, i) => (
        <CheckRow
          key={`row-${label}-${i}`}
          text={r.text}
          markerColor={r.accent && r.accent.length > 0 ? r.accent : markerColor}
          inkColor={colors.ink}
          localFrame={frame}
          delayFrames={colDelay + i * rowStagger}
          fontSize={38}
        />
      ))}
    </div>
  );

  return (
    <>
      {scene.title ? (
        <Kicker text={scene.title} color={colors.muted} />
      ) : null}
      <div style={{ display: "flex", alignItems: "stretch", gap: 28 }}>
        <Column
          label={scene.leftLabel}
          rows={scene.leftRows}
          markerColor={colors.muted}
        />
        {/* VS divider */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, width: 2, background: `${colors.muted}55` }} />
          <div
            style={{
              fontFamily: FONT_STACKS.serif,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 54,
              color: colors.accent,
            }}
          >
            vs
          </div>
          <div style={{ flex: 1, width: 2, background: `${colors.muted}55` }} />
        </div>
        <Column
          label={scene.rightLabel}
          rows={scene.rightRows}
          markerColor={colors.accent}
        />
      </div>
    </>
  );
};

const StatScene: React.FC<{
  scene: Extract<Scene, { kind: "stat" }>;
  colors: ResolvedColors;
}> = ({ scene, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const figureColor =
    scene.accent && scene.accent.length > 0 ? scene.accent : colors.accent;

  const figureEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.7 },
  });
  const figureScale = interpolate(figureEnter, [0, 1], [0.7, 1]);

  const underline = interpolate(
    frame,
    [Math.round(0.4 * fps), Math.round(0.85 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const supportingStart = Math.round(0.85 * fps);
  const supportingO = interpolate(
    frame,
    [supportingStart, supportingStart + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <>
      {scene.label ? <Kicker text={scene.label} color={colors.muted} /> : null}
      <div
        style={{
          fontFamily: FONT_STACKS.serif,
          fontWeight: 700,
          fontSize: 280,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: figureColor, // SOLID — never background-clip:text
          textShadow: `0 0 40px ${figureColor}55, 0 0 14px ${figureColor}33`,
          transform: `scale(${figureScale})`,
          transformOrigin: "left center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {scene.number}
      </div>
      <div
        style={{
          marginTop: 26,
          width: 320,
          height: 8,
          borderRadius: 4,
          background: figureColor,
          transform: `scaleX(${underline})`,
          transformOrigin: "left center",
          boxShadow: `0 0 14px ${figureColor}55`,
        }}
      />
      {scene.supporting ? (
        <div
          style={{
            marginTop: 34,
            fontFamily: FONT_STACKS.serif,
            fontWeight: 400,
            fontSize: 52,
            lineHeight: 1.2,
            color: colors.ink,
            opacity: supportingO,
            maxWidth: CONTENT_WIDTH,
          }}
        >
          {scene.supporting}
        </div>
      ) : null}
    </>
  );
};

const BulletsScene: React.FC<{
  scene: Extract<Scene, { kind: "bullets" }>;
  colors: ResolvedColors;
}> = ({ scene, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleStagger = Math.round(0.25 * fps);
  const rowStagger = Math.round(0.14 * fps);
  return (
    <>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 86,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: colors.ink,
          marginBottom: 48,
        }}
      >
        {scene.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {scene.rows.map((r, i) => (
          <CheckRow
            key={`bullet-${i}`}
            text={r.text}
            markerColor={r.accent && r.accent.length > 0 ? r.accent : colors.accent}
            inkColor={colors.ink}
            localFrame={frame}
            delayFrames={titleStagger + i * rowStagger}
            fontSize={52}
          />
        ))}
      </div>
    </>
  );
};

const CtaScene: React.FC<{
  scene: Extract<Scene, { kind: "cta" }>;
  colors: ResolvedColors;
}> = ({ scene, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chipColor =
    scene.accent && scene.accent.length > 0 ? scene.accent : colors.accent;
  const chipEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130, mass: 0.7 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const chipScale = interpolate(chipEnter, [0, 1], [0.85, 1]);
  // Dark mode wants dark text on the bright gold chip; cream wants cream text.
  const chipText = colors.isDark ? BRAND_DEEP_NAVY : BRAND_CREAM;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 100,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          color: colors.ink,
          textAlign: "center",
        }}
      >
        {scene.headline}
      </div>
      {scene.handle ? (
        <div
          style={{
            transform: `scale(${chipScale})`,
            padding: "26px 56px",
            borderRadius: 999,
            background: chipColor,
            boxShadow: `0 0 34px ${chipColor}55`,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: 52,
            letterSpacing: "0.01em",
            color: chipText,
          }}
        >
          {scene.handle}
        </div>
      ) : null}
    </div>
  );
};

// ─── Dispatch one scene to its renderer ─────────────────────────────
const SceneBody: React.FC<{ scene: Scene; colors: ResolvedColors }> = ({
  scene,
  colors,
}) => {
  switch (scene.kind) {
    case "hero":
      return <HeroScene scene={scene} colors={colors} />;
    case "comparison":
      return <ComparisonScene scene={scene} colors={colors} />;
    case "stat":
      return <StatScene scene={scene} colors={colors} />;
    case "bullets":
      return <BulletsScene scene={scene} colors={colors} />;
    case "cta":
      return <CtaScene scene={scene} colors={colors} />;
    default: {
      // Exhaustiveness guard — never reached if the union is complete.
      const _exhaustive: never = scene;
      return _exhaustive;
    }
  }
};

// ─── Persistent top progress bar ────────────────────────────────────
const ProgressBar: React.FC<{
  totalFrames: number;
  accentColor: string;
  trackColor: string;
}> = ({ totalFrames, accentColor, trackColor }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, Math.max(1, totalFrames)], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: FRAME_W,
        height: 12,
        background: trackColor,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: accentColor,
          boxShadow: `0 0 12px ${accentColor}88`,
        }}
      />
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const SceneSequencer9x16: React.FC<SceneSequencer9x16Props> = ({
  scenes,
  palette,
  accentColor,
  paperColor,
  inkColor,
  mutedColor,
  showProgressBar,
}) => {
  const base = resolveColors(palette as PaletteMode, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const isDark = palette === "dark";
  // Brand-anchored defaults: gold accent + navy/cream surfaces unless overridden.
  const resolvedAccent =
    accentColor && accentColor.length > 0 ? accentColor : BRAND_GOLD;
  const resolvedPaper =
    paperColor && paperColor.length > 0
      ? paperColor
      : isDark
        ? BRAND_DEEP_NAVY
        : BRAND_CREAM;
  const resolvedInk =
    inkColor && inkColor.length > 0 ? inkColor : isDark ? BRAND_CREAM : BRAND_NAVY;
  const resolvedMuted = base.muted;
  const grainOverlay = getPalette(palette as PaletteMode).grainOverlay;

  const colors: ResolvedColors = {
    paper: resolvedPaper,
    ink: resolvedInk,
    accent: resolvedAccent,
    muted: resolvedMuted,
    isDark,
    grainOverlay,
  };

  // Guard against an empty scenes array so Series always has ≥1 child.
  const safeScenes = scenes.length > 0 ? scenes : DEFAULT_SCENES;
  const totalFrames = computeSceneSequencerFrames(scenes);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {/* Soft brand-navy radial glow behind content. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 46% at 40% 48%, ${
            isDark ? "rgba(27,58,110,0.42)" : "rgba(27,58,110,0.07)"
          } 0%, rgba(0,0,0,0) 72%)`,
          pointerEvents: "none",
        }}
      />
      {/* Palette grain overlay. */}
      <AbsoluteFill
        style={{
          background: grainOverlay,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Scenes back-to-back. */}
      <Series>
        {safeScenes.map((scene, i) => (
          <Series.Sequence
            key={`scene-${i}-${scene.kind}`}
            durationInFrames={scene.durationInFrames}
          >
            <SceneFrame transition={scene.transition}>
              <SceneBody scene={scene} colors={colors} />
            </SceneFrame>
          </Series.Sequence>
        ))}
      </Series>

      {/* Persistent progress bar spanning the entire Short. */}
      {showProgressBar && (
        <ProgressBar
          totalFrames={totalFrames}
          accentColor={resolvedAccent}
          trackColor={isDark ? "rgba(255,255,255,0.10)" : "rgba(15,27,45,0.10)"}
        />
      )}
    </AbsoluteFill>
  );
};
