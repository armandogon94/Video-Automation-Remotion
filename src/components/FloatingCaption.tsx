/**
 * FloatingCaption — a configurable-position subtitle/caption overlay MOLECULE.
 *
 * WHY THIS EXISTS
 * ---------------
 * The talking-head overlay foundation (W1b) needs a caption layer that can sit
 * on top of ANY backdrop — real footage, a generated B-roll, a placeholder card.
 * Unlike `EditorialCaption` (which paints its own cream "paper" pill chassis) and
 * `CaptionPillWithKeyword` (which paints a translucent pill), FloatingCaption
 * renders ONLY text over a fully transparent `AbsoluteFill`. No backdrop, no
 * pill, no border — so the compositor below it shows through.
 *
 * WORD-TIMING REUSE
 * -----------------
 * The karaoke / per-word active-word logic is the SAME idiom established by
 * `EditorialCaption`: read `useCurrentFrame()`, chunk `wordTimings` into
 * non-overlapping windows via `nonOverlappingGroups` (src/timing/align.ts),
 * find the single active group by an absolute-frame range scan, and tint each
 * word active/past/future. We deliberately mirror that idiom here (rather than
 * importing EditorialCaption) because EditorialCaption couples the timing to its
 * paper chassis; FloatingCaption needs the timing WITHOUT the chassis. The
 * register palette is the ADR-002 / W7 cross-creator vocabulary, reused 1:1
 * from EditorialCaption (`punchy` / `editorial` / `technical`).
 *
 * MODES
 * -----
 *  - 'karaoke'  : per-word active/past/future tint inside the active window.
 *  - 'sentence' : the whole active window renders in one flat color (active
 *                 color), no per-word phasing — reads as a plain subtitle line.
 *
 * STYLE PRESETS (orthogonal axis — Wave-9 §1.2)
 * ---------------------------------------------
 * `style` is a NAMED BUNDLE OF DEFAULTS for the *typographic / animation* axis
 * (font, weight, case, per-word animation, and a recommended default register +
 * position). It is ORTHOGONAL to `register` (the COLOR axis — ADR-002 §7 #3) and
 * to `mode` (karaoke vs sentence). A preset only supplies DEFAULTS: any explicit
 * prop the caller passes (`register`, `mode`, `position`, `fontSize`, …) always
 * wins over the preset. Omitting `style` → `'classic'` → byte-identical to the
 * pre-preset behavior, so every existing call site is unchanged.
 *
 *  - 'classic'       : today's look (Inter 800, karaoke recolor + scale 1.06).
 *  - 'hormozi-pop'   : Montserrat Black 900 ALL-CAPS, spring word-pop, punchy.
 *  - 'box-highlight' : Inter 800 ALL-CAPS, active word gets a filled accent pill
 *                      behind it + dark ink (the "marker" look). LAYOUT change.
 *  - 'editorial-cyan': Inter 700 sentence-case, color-flip (no scale), editorial.
 *  - 'condensed-hype': Oswald 700 ALL-CAPS, vertical bounce spring, punchy.
 *  - 'slide-clean'   : Inter 600 sentence-case, slide-up per word, technical.
 *  - 'blur-premium'  : Inter 600 sentence-case, blur-in per word, editorial.
 *  - 'type-terminal' : JetBrains/Fira mono 500 as-typed, technical.
 *
 * POSITIONING
 * -----------
 * `position` resolves to an absolute placement on a transparent AbsoluteFill:
 *  - 'bottom-center' : horizontally centered, anchored ~12% up from the bottom.
 *  - 'center'        : centered both axes.
 *  - 'top'           : horizontally centered, anchored ~12% down from the top.
 *  - 'custom'        : anchored at (customXY.xPct, customXY.yPct) as percentages
 *                      of the frame, with the text block's own center on that
 *                      point (translate(-50%, -50%)).
 *
 * @dualAspect — sizes via per-aspect `fontSize` default supplied by the caller
 * (SpeakerOverlayScene16x9 / 9x16 pass appropriate defaults). Renders correctly
 * at any composition dimension.
 */
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand";
import { nonOverlappingGroups, type CaptionGroup } from "../timing/align";

// ─────────────────────────────────────────────────────────────────────────────
// Register palettes — reused 1:1 from EditorialCaption (ADR-002 / W7 taxonomy).
//  - 'punchy'    (Hormozi) : active = yellow, past = white,  future = white@0.30
//  - 'editorial' (Sahil)   : active = cyan,   past = white,  future = white@0.40
//  - 'technical' (Adam)    : active = white,  past = white,  future = white@0.55
// ─────────────────────────────────────────────────────────────────────────────

interface RegisterPalette {
  activeColor: string;
  pastColor: string;
  futureColor: string;
}

const REGISTER_PALETTES: Record<"punchy" | "editorial" | "technical", RegisterPalette> = {
  punchy: {
    activeColor: "#F1C232",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.30)",
  },
  editorial: {
    activeColor: "#5BC0E8",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.40)",
  },
  technical: {
    activeColor: "#FFFFFF",
    pastColor: "#FFFFFF",
    futureColor: "rgba(255,255,255,0.55)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Style presets — the TYPOGRAPHIC / ANIMATION axis (Wave-9 §1.2). ORTHOGONAL to
// `register` (color) and `mode` (karaoke/sentence). Each preset is a bundle of
// DEFAULTS only; an explicit caller prop always overrides the preset's default.
//
// `animation` drives the active-word transform:
//  - 'recolor'   : tiny scale(1.06) on the active word (classic).
//  - 'pop'       : spring scale 0.7→1.0 with overshoot (Hormozi bounce).
//  - 'box'       : filled accent pill behind the active word + dark ink.
//  - 'flip'      : color-flip only, no scale (calm editorial).
//  - 'bounce'    : vertical spring (translateY overshoot) per active word.
//  - 'slide-up'  : active word rises a few px + fades on becoming active.
//  - 'blur-in'   : active word fades from blurred → sharp.
//  - 'none'      : no per-word transform (used by 'type-terminal').
// ─────────────────────────────────────────────────────────────────────────────

type CaptionStyle =
  | "classic"
  | "hormozi-pop"
  | "box-highlight"
  | "editorial-cyan"
  | "condensed-hype"
  | "slide-clean"
  | "blur-premium"
  | "type-terminal";

type WordAnimation =
  | "recolor"
  | "pop"
  | "box"
  | "flip"
  | "bounce"
  | "slide-up"
  | "blur-in"
  | "none";

interface StylePreset {
  fontFamily: string;
  fontWeight: number;
  textTransform: React.CSSProperties["textTransform"];
  letterSpacing: string;
  animation: WordAnimation;
  defaultRegister: "punchy" | "editorial" | "technical";
  defaultPosition: FloatingCaptionProps["position"];
}

const STYLE_PRESETS: Record<CaptionStyle, StylePreset> = {
  classic: {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 800,
    textTransform: "none",
    letterSpacing: "-0.01em",
    animation: "recolor",
    defaultRegister: "editorial",
    defaultPosition: "bottom-center",
  },
  "hormozi-pop": {
    // Montserrat Black; FONT_STACKS.display falls back to Inter if the loader
    // hasn't run yet (e.g. SSR snapshot), matching the graceful-fallback note.
    fontFamily: FONT_STACKS.display,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "-0.01em",
    animation: "pop",
    defaultRegister: "punchy",
    defaultPosition: "bottom-center",
  },
  "box-highlight": {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0em",
    animation: "box",
    defaultRegister: "punchy",
    defaultPosition: "bottom-center",
  },
  "editorial-cyan": {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 700,
    textTransform: "none",
    letterSpacing: "-0.005em",
    animation: "flip",
    defaultRegister: "editorial",
    defaultPosition: "bottom-center",
  },
  "condensed-hype": {
    fontFamily: FONT_STACKS.condensed,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.01em",
    animation: "bounce",
    defaultRegister: "punchy",
    defaultPosition: "center",
  },
  "slide-clean": {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 600,
    textTransform: "none",
    letterSpacing: "0em",
    animation: "slide-up",
    defaultRegister: "technical",
    defaultPosition: "bottom-center",
  },
  "blur-premium": {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 600,
    textTransform: "none",
    letterSpacing: "0em",
    animation: "blur-in",
    defaultRegister: "editorial",
    defaultPosition: "bottom-center",
  },
  "type-terminal": {
    fontFamily: FONT_STACKS.monoCode,
    fontWeight: 500,
    textTransform: "none",
    letterSpacing: "0em",
    animation: "none",
    defaultRegister: "technical",
    defaultPosition: "bottom-center",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, every field .default()ed so it renders standalone)
// ─────────────────────────────────────────────────────────────────────────────

/** Per-word timing — same shape used across the repo (see schemas.ts WordTiming
 *  and EditorialCaption). Absolute frame coordinates drive the active-word scan. */
const floatingCaptionWordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

export const floatingCaptionSchema = z.object({
  /** Per-word timings. Same shape as schemas.ts `WordTiming`. */
  wordTimings: z.array(floatingCaptionWordTimingSchema).default([]),
  /**
   * Typographic/animation preset (orthogonal to `register` + `mode`; Wave-9
   * §1.2). Sets DEFAULT font/weight/case/animation + a recommended default
   * register and position. Explicit props below always override the preset's
   * defaults. Omitted → 'classic' → identical to the pre-preset behavior.
   */
  style: z
    .enum([
      "classic",
      "hormozi-pop",
      "box-highlight",
      "editorial-cyan",
      "condensed-hype",
      "slide-clean",
      "blur-premium",
      "type-terminal",
    ])
    .optional(),
  /** Where the caption block sits on the frame. When omitted, the active
   *  `style` preset's default position is used (`bottom-center` for 'classic'). */
  position: z
    .enum(["bottom-center", "center", "top", "custom"])
    .optional(),
  /** Used only when `position === 'custom'`. Percentages (0–100) of frame
   *  width/height; the text block centers itself on this point. */
  customXY: z
    .object({ xPct: z.number(), yPct: z.number() })
    .optional(),
  /** 'karaoke' = per-word active/past/future tint; 'sentence' = flat line.
   *  Defaults to 'karaoke' (preserves pre-preset behavior). */
  mode: z.enum(["karaoke", "sentence"]).default("karaoke"),
  /** ADR-002 register (COLOR) vocabulary — orthogonal to `style`. When omitted,
   *  the active `style` preset's default register is used ('editorial' for
   *  'classic', so existing call sites are unchanged). */
  register: z.enum(["punchy", "editorial", "technical"]).optional(),
  /** Caption block max width as a percentage of the frame width. */
  widthPct: z.number().default(70),
  /** Font size in px. When omitted, defaults to 56 (sensible for 1080-wide). */
  fontSize: z.number().optional(),
  /** Words per caption window (TikTok pacing). */
  windowSize: z.number().default(6),
  /** Minimum gap (ms) between consecutive windows. */
  windowGapMs: z.number().default(60),
  /** Optional themed GLOW color for the text (liquid-glass study, 2026-06-26).
   *  When set, replaces the default black drop-shadow with a colored neon glow
   *  (austin/nate liquid-glass caption look). Omitted → unchanged classic shadow. */
  glowColor: z.string().optional(),
  /** Optional slight rotation (deg) of the caption block — austin's tilted
   *  kinetic lines. Omitted → 0 (component default) → byte-identical to prior
   *  behavior, and keeps existing inline call sites valid (no required field). */
  rotationDegrees: z.number().optional(),
});

export type FloatingCaptionProps = z.infer<typeof floatingCaptionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Position resolution
// ─────────────────────────────────────────────────────────────────────────────

interface ResolvedPlacement {
  /** Outer wrapper that owns absolute placement of the text block. */
  wrapper: React.CSSProperties;
  /** Horizontal alignment of the (wrapping) text within the block. */
  textAlign: "center" | "left";
}

function resolvePlacement(
  position: FloatingCaptionProps["position"],
  customXY: FloatingCaptionProps["customXY"],
  widthPct: number,
): ResolvedPlacement {
  const widthStyle: React.CSSProperties = { width: `${widthPct}%` };

  if (position === "custom") {
    // Default to dead-center if customXY was not supplied alongside 'custom'.
    const xPct = customXY?.xPct ?? 50;
    const yPct = customXY?.yPct ?? 50;
    return {
      wrapper: {
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
        ...widthStyle,
      },
      textAlign: "center",
    };
  }

  if (position === "center") {
    return {
      wrapper: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        ...widthStyle,
      },
      textAlign: "center",
    };
  }

  if (position === "top") {
    return {
      wrapper: {
        position: "absolute",
        left: "50%",
        top: "12%",
        transform: "translateX(-50%)",
        ...widthStyle,
      },
      textAlign: "center",
    };
  }

  // 'bottom-center' (default): anchored ~12% up from the bottom edge.
  return {
    wrapper: {
      position: "absolute",
      left: "50%",
      bottom: "12%",
      transform: "translateX(-50%)",
      ...widthStyle,
    },
    textAlign: "center",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingCaption: React.FC<FloatingCaptionProps> = ({
  wordTimings,
  style = "classic",
  position,
  customXY,
  mode = "karaoke",
  register,
  widthPct = 70,
  fontSize,
  windowSize = 6,
  windowGapMs = 60,
  glowColor,
  rotationDegrees = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve the style preset. Explicit `register` / `position` props always win
  // over the preset's defaults (orthogonal-axis contract, Wave-9 §1.2).
  const preset = STYLE_PRESETS[style];
  const resolvedRegister = register ?? preset.defaultRegister;
  const resolvedPosition = position ?? preset.defaultPosition;
  const palette = REGISTER_PALETTES[resolvedRegister];
  const resolvedFontSize = fontSize ?? 56;

  // Chunk into non-overlapping windows in absolute frame coordinates — same
  // idiom as EditorialCaption. nonOverlappingGroups expects words with absolute
  // startFrame/endFrame; our wordTimings carry exactly those fields.
  const groups = useMemo<CaptionGroup[]>(
    () =>
      wordTimings.length === 0
        ? []
        : nonOverlappingGroups(
            wordTimings as unknown as Parameters<typeof nonOverlappingGroups>[0],
            windowSize,
            windowGapMs,
            0,
            fps,
          ),
    [wordTimings, fps, windowSize, windowGapMs],
  );

  if (groups.length === 0) return null;

  const active = groups.find(
    (g) => frame >= g.startFrame && frame < g.endFrame,
  );
  if (!active) return null;

  // 4-frame fade-in on group entry (no fade-out — next group hard-cuts).
  const fadeIn = interpolate(frame - active.startFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const placement = resolvePlacement(resolvedPosition, customXY, widthPct);

  // The active-word background pill is the ONE layout change (Wave-9 §1.2,
  // 'box-highlight'): only this preset draws a filled rect behind the active
  // word and flips the ink dark; all others leave the background transparent.
  const usesBoxPill = preset.animation === "box";

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeIn }}>
      <div style={placement.wrapper}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "6px 14px",
            textAlign: placement.textAlign,
            transform: rotationDegrees ? `rotate(${rotationDegrees}deg)` : undefined,
          }}
        >
          {active.words.map((w, i) => {
            const isActive = frame >= w.startFrame && frame <= w.endFrame;
            const isPast = frame > w.endFrame;

            // 'sentence' mode: flat active color for the whole line, no phasing.
            // Karaoke: active/past/future tint from the resolved register palette.
            const phaseColor =
              mode === "sentence"
                ? palette.activeColor
                : isActive
                  ? palette.activeColor
                  : isPast
                    ? palette.pastColor
                    : palette.futureColor;

            // Per-word entry progress (0→1) once a word becomes active — drives
            // the spring/slide/blur animations. Frozen at 1 once it has fired.
            const wordEntry = spring({
              frame: frame - w.startFrame,
              fps,
              config: { damping: 12, stiffness: 180, mass: 0.6 },
              durationInFrames: 12,
            });
            const animate = mode === "karaoke" && isActive;

            // Compute the transform + extra style per preset animation. Defaults
            // (recolor) keep the classic scale(1.06) so 'classic' is unchanged.
            let transform = "scale(1)";
            let filter: string | undefined;
            let color = phaseColor;
            const boxOn = usesBoxPill && isActive;

            switch (preset.animation) {
              case "pop":
                // Spring scale 0.7→1.0 with overshoot (Hormozi bounce).
                transform = animate
                  ? `scale(${interpolate(wordEntry, [0, 1], [0.7, 1])})`
                  : "scale(1)";
                break;
              case "bounce":
                // Vertical spring overshoot per active word.
                transform = animate
                  ? `translateY(${interpolate(wordEntry, [0, 1], [14, 0])}px)`
                  : "translateY(0px)";
                break;
              case "slide-up":
                // Rise a few px + fade as the word becomes active.
                transform = animate
                  ? `translateY(${interpolate(wordEntry, [0, 1], [16, 0])}px)`
                  : "translateY(0px)";
                break;
              case "blur-in":
                // Fade from blurred → sharp on becoming active.
                filter = animate
                  ? `blur(${interpolate(wordEntry, [0, 1], [8, 0])}px)`
                  : "blur(0px)";
                break;
              case "box":
                // Active word flips to dark ink against the accent pill; inactive
                // words keep the normal phase color.
                color = isActive ? "#0F1B2D" : phaseColor;
                break;
              case "flip":
              case "none":
                // No transform — calm color-flip / static.
                transform = "scale(1)";
                break;
              case "recolor":
              default:
                // Classic: tiny scale bump on the active word.
                transform = animate ? "scale(1.06)" : "scale(1)";
                break;
            }

            return (
              <span
                key={i}
                style={{
                  fontFamily: preset.fontFamily,
                  fontSize: resolvedFontSize,
                  fontWeight: preset.fontWeight,
                  textTransform: preset.textTransform,
                  letterSpacing: preset.letterSpacing,
                  lineHeight: 1.15,
                  color,
                  transform,
                  filter,
                  display: "inline-block",
                  // box-highlight: filled accent rect behind ONLY the active word.
                  ...(boxOn
                    ? {
                        background: palette.activeColor,
                        borderRadius: 8,
                        padding: "0 10px",
                      }
                    : null),
                  // Heavy text shadow so the caption stays legible over any
                  // backdrop (bright footage, busy B-roll) without a pill. The
                  // boxed active word drops the shadow (it has its own chip).
                  textShadow: boxOn
                    ? "none"
                    : glowColor
                      ? `0 0 12px ${glowColor}, 0 0 26px ${glowColor}, 0 2px 8px rgba(0,0,0,0.6)`
                      : "0 2px 8px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.9)",
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default FloatingCaption;
