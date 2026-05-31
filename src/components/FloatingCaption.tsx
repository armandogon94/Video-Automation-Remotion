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
  /** Where the caption block sits on the frame. */
  position: z
    .enum(["bottom-center", "center", "top", "custom"])
    .default("bottom-center"),
  /** Used only when `position === 'custom'`. Percentages (0–100) of frame
   *  width/height; the text block centers itself on this point. */
  customXY: z
    .object({ xPct: z.number(), yPct: z.number() })
    .optional(),
  /** 'karaoke' = per-word active/past/future tint; 'sentence' = flat line. */
  mode: z.enum(["karaoke", "sentence"]).default("karaoke"),
  /** ADR-002 register vocabulary (reused from EditorialCaption). */
  register: z.enum(["punchy", "editorial", "technical"]).default("editorial"),
  /** Caption block max width as a percentage of the frame width. */
  widthPct: z.number().default(70),
  /** Font size in px. When omitted, defaults to 56 (sensible for 1080-wide). */
  fontSize: z.number().optional(),
  /** Words per caption window (TikTok pacing). */
  windowSize: z.number().default(6),
  /** Minimum gap (ms) between consecutive windows. */
  windowGapMs: z.number().default(60),
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
  position = "bottom-center",
  customXY,
  mode = "karaoke",
  register = "editorial",
  widthPct = 70,
  fontSize,
  windowSize = 6,
  windowGapMs = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const palette = REGISTER_PALETTES[register];
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

  const placement = resolvePlacement(position, customXY, widthPct);

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
          }}
        >
          {active.words.map((w, i) => {
            const isActive = frame >= w.startFrame && frame <= w.endFrame;
            const isPast = frame > w.endFrame;
            // 'sentence' mode: flat active color for the whole line, no phasing.
            const color =
              mode === "sentence"
                ? palette.activeColor
                : isActive
                  ? palette.activeColor
                  : isPast
                    ? palette.pastColor
                    : palette.futureColor;
            const scale = mode === "karaoke" && isActive ? "scale(1.06)" : "scale(1)";
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontSize: resolvedFontSize,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  color,
                  transform: scale,
                  display: "inline-block",
                  // Heavy text shadow so the caption stays legible over any
                  // backdrop (bright footage, busy B-roll) without a pill.
                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.9)",
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
