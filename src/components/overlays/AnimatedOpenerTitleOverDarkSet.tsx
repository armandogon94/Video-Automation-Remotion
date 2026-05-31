/**
 * AnimatedOpenerTitleOverDarkSet — OV12 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV12
 * `AnimatedOpenerTitleOverDarkSet`.
 *  - Anchor ref: `fr78adfAnuA@0s` ("HOW TO USE AI IN YOUR BUSINESS" + glowing
 *    purple AI-orb).
 *  - What: the cold-open title — large kinetic title text + a hero graphic,
 *    composited over a darkened/blurred version of his OWN set (not a flat bg).
 *    Borderline overlay/cutaway, but the set stays visible behind, so it's an
 *    over-(darkened-)speaker title at the top of a video.
 *  - transitionVerb: "Push the title up from below with a blur-to-sharp over 12
 *    frames; orbit/pulse the hero graphic behind it; darken the live base layer
 *    to ~40% brightness during the title, then lift back to 100% as it clears."
 *  - Differs from cutaway: base footage stays visible (dimmed) behind the title.
 *  - Replicability: "Title + brightness-dim on base `<Video>`."
 *
 * DIM STRATEGY (self-contained): per §2.6 only the opener dims the base. Because
 * this molecule must NOT edit `SpeakerOverlayScene*` or the base `<Video>`, the
 * dim is rendered as a SELF-CONTAINED dark scrim INSIDE this overlay's own
 * transparent AbsoluteFill — it fades in, holds during the title, then lifts
 * back to fully transparent as the title clears, leaving the set at 100%. This
 * reproduces the OV12 "darken to ~40% then lift" beat without touching the base
 * layer. (A scene-level `dimBaseTo` brightness filter, if/when wired, would be
 * the alternative; this molecule does not depend on it.)
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across the overlays/ batch):
 *  - Transparent `AbsoluteFill` (no opaque fill; `pointerEvents:'none'`); the
 *    TITLE block is anchored to a lower-third / corner, NEVER center
 *    (OVERLAY-ANALYSIS §2.1). The dim scrim is full-frame chrome, not content.
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type; renders standalone with zero
 *    props (parses defaults).
 *
 * Dual-aspect (Tier-B): title + hero orb sized in px, anchored to a side/lower
 * region of a transparent AbsoluteFill; renders at 16:9 and 9:16; parent owns slot.
 *
 * @dualAspect true — cited OV12.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

/** Title anchor — side/corner/lower-third over the (dimmed) set. NEVER center. */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);

export const animatedOpenerTitleOverDarkSetSchema = z.object({
  /** Opener title text (kinetic). */
  title: z.string().default("HOW TO USE AI\nIN YOUR BUSINESS"),
  /** Optional kicker line above the title (e.g. a topic / series label). */
  kicker: z.string().default(""),
  /** Title color. Default white. */
  color: z.string().default("#FFFFFF"),
  /** Hero-orb glow color (the "glowing purple AI-orb"). Default ~#6B3FD4. */
  orbColor: z.string().default("#6B3FD4"),
  /** Show the pulsing hero orb behind the title. Default true. */
  showOrb: z.boolean().default(true),
  /** Hero orb diameter (px). Default 520. */
  orbSizePx: z.number().default(520),
  /** Title block anchor over the dimmed set. Default 'lower-third'. NEVER center. */
  anchor: anchorEnum.default("lower-third"),
  /** Title font size (px). Default 110. */
  fontSizePx: z.number().default(110),
  /** How dark the self-contained scrim gets at peak (0 = none, 1 = black).
   *  ~0.6 reproduces the OV12 "set dimmed to ~40% brightness". Default 0.6. */
  dimTo: z.number().default(0.6),
  /** Safe-margin inset from the frame edges (%). Default 8. */
  insetPct: z.number().default(8),
  /** Frame the opener begins. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames to hold the full title (scrim at peak). Default 90. */
  holdFrames: z.number().default(90),
  /** Optional explicit exit frame. When omitted, derived from enter+push+hold. */
  exitFrame: z.number().optional(),
});

export type AnimatedOpenerTitleOverDarkSetProps = z.infer<
  typeof animatedOpenerTitleOverDarkSetSchema
>;

type Anchor = z.infer<typeof anchorEnum>;

/** Title-block placement over the dimmed set. NEVER center. */
function anchorPlacement(anchor: Anchor, inset: string): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", maxWidth: "84%" };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset, textAlign: "left" };
    case "top-right":
      return { ...base, top: inset, right: inset, textAlign: "right" };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset, textAlign: "left" };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset, textAlign: "right" };
    case "left":
      return { ...base, top: "50%", left: inset, transform: "translateY(-50%)", textAlign: "left" };
    case "right":
      return { ...base, top: "50%", right: inset, transform: "translateY(-50%)", textAlign: "right" };
    case "lower-third":
      return { ...base, bottom: "16%", left: inset, right: inset, maxWidth: "84%", textAlign: "left" };
  }
}

export const AnimatedOpenerTitleOverDarkSet: React.FC<
  Partial<AnimatedOpenerTitleOverDarkSetProps>
> = (props) => {
  const {
    title,
    kicker,
    color,
    orbColor,
    showOrb,
    orbSizePx,
    anchor,
    fontSizePx,
    dimTo,
    insetPct,
    enterFrame,
    holdFrames,
    exitFrame,
  } = animatedOpenerTitleOverDarkSetSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const PUSH_IN = 12;
  const CLEAR_OUT = 14;
  const derivedExit = enterFrame + PUSH_IN + holdFrames + CLEAR_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  // Self-contained dim scrim: fade in over PUSH_IN, hold at `dimTo`, lift back
  // to transparent over CLEAR_OUT (set returns to 100% as the title clears).
  const scrimIn = interpolate(local, [0, PUSH_IN], [0, dimTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrimOut = interpolate(
    frame,
    [effectiveExit - CLEAR_OUT, effectiveExit],
    [dimTo, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scrimAlpha = Math.min(scrimIn, scrimOut);

  // Title push: up from below with a blur-to-sharp over ~12 frames.
  const push = spring({
    frame: local,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.8 },
    durationInFrames: PUSH_IN,
  });
  const titleY = interpolate(push, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleBlur = interpolate(push, [0, 1], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleInOpacity = interpolate(local, [0, PUSH_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOutOpacity = interpolate(
    frame,
    [effectiveExit - CLEAR_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOpacity = Math.min(titleInOpacity, titleOutOpacity);

  // Hero orb: slow pulse + gentle orbit drift behind the title.
  const seconds = local / fps;
  const orbPulse = 0.85 + 0.15 * Math.sin(seconds * Math.PI * 1.2);
  const orbDriftX = Math.sin(seconds * Math.PI * 0.6) * 22;
  const orbDriftY = Math.cos(seconds * Math.PI * 0.6) * 16;

  const inset = `${insetPct}%`;
  const titleLines = title.split("\n");

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Self-contained dim scrim — chrome that darkens the live set behind. */}
      <AbsoluteFill style={{ background: `rgba(8,10,20,${scrimAlpha})` }} />

      {/* Hero orb (behind the title), drifting + pulsing. */}
      {showOrb ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: titleOpacity * 0.9,
          }}
        >
          <div
            style={{
              width: orbSizePx,
              height: orbSizePx,
              borderRadius: "50%",
              transform: `translate(${orbDriftX}px, ${orbDriftY}px) scale(${orbPulse})`,
              background: `radial-gradient(circle at 40% 40%, ${orbColor} 0%, ${orbColor}aa 35%, rgba(0,0,0,0) 72%)`,
              filter: "blur(6px)",
              boxShadow: `0 0 120px ${orbColor}cc, 0 0 220px ${orbColor}66`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Title block — anchored to lower-third / side, NEVER center. */}
      <div
        style={{
          ...anchorPlacement(anchor, inset),
          opacity: titleOpacity,
          transform: `${anchorPlacement(anchor, inset).transform ?? ""} translateY(${titleY}px)`.trim(),
          filter: `blur(${titleBlur}px)`,
        }}
      >
        {kicker ? (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: Math.round(fontSizePx * 0.26),
              color: orbColor,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 14,
              textShadow: `0 0 18px ${orbColor}88`,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: fontSizePx,
            color,
            lineHeight: 1.04,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            textShadow: "0 6px 28px rgba(0,0,0,0.7)",
          }}
        >
          {titleLines.map((line, i) => (
            <div key={`title-${i}`}>{line.length === 0 ? " " : line}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default AnimatedOpenerTitleOverDarkSet;
