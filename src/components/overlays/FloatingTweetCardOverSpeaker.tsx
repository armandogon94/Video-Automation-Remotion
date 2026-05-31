/**
 * FloatingTweetCardOverSpeaker — OV6 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV6
 * `FloatingTweetCardOverSpeaker`.
 *  - Anchor ref: `jfW6gL6hKhk@465s` (an "Alex Hormozi @…" tweet card with
 *    avatar + verified check + body text, floated beside his head over the
 *    live set).
 *  - What: a rounded white card styled as a social post (avatar, handle,
 *    verified badge, multi-line body), composited to one side over the
 *    talking-head.
 *  - Note: long-form-CONFIRMS the tweet card as an over-speaker overlay (the
 *    Shorts §5 "REFUTED for Shorts" verdict still stands for Shorts).
 *  - transitionVerb: "Slide the card in from the right edge with a 6px
 *    overshoot over 8 frames; optional 0.3px idle float bob; hold; slide out."
 *  - Differs from cutaway: card floats beside him; M23
 *    `FullscreenSocialPostScreenshot` is the full-screen cutaway twin.
 *  - Replicability: "Reuse a `<SocialPostCard>` molecule, anchor to side."
 *
 * REUSE: this wraps the existing `src/components/SocialPostCard.tsx`
 * (`variant: 'text-only'` — the Hormozi H1 tweet styling: avatar + name +
 * verified + line-by-line body, no media, no counter row) inside a transparent
 * floating overlay that owns the side anchor + slide-in/out + idle bob. The
 * card's own per-stage reveal choreography runs underneath the slide.
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across OV4–OV7):
 *  - Transparent `AbsoluteFill` (no opaque fill); `anchor` prop, NEVER center.
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type.
 *
 * @dualAspect true — the inner SocialPostCard is a px-sized card; this wrapper
 * anchors it to a side over a transparent AbsoluteFill, so it renders correctly
 * at any composition dimension (16:9 and 9:16). Cited OV6.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { SocialPostCard } from "../SocialPostCard";

/** Side/corner anchors — NEVER center (OVERLAY-ANALYSIS §2.1). Side anchors
 *  are the OV6 convention (card floats BESIDE his head). */
type OverSpeakerAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

/** Resolve a side/corner anchor → absolute placement of the card wrapper. */
function anchorPlacement(
  anchor: OverSpeakerAnchor,
  insetPx: number,
): React.CSSProperties {
  switch (anchor) {
    case "top-left":
      return { top: insetPx, left: insetPx };
    case "top-right":
      return { top: insetPx, right: insetPx };
    case "bottom-left":
      return { bottom: insetPx, left: insetPx };
    case "bottom-right":
      return { bottom: insetPx, right: insetPx };
    case "left":
      return { top: "50%", left: insetPx, transform: "translateY(-50%)" };
    case "right":
    default:
      return { top: "50%", right: insetPx, transform: "translateY(-50%)" };
  }
}

/** True when the anchor sits on the LEFT edge (slide-in direction flips). */
function isLeftAnchor(anchor: OverSpeakerAnchor): boolean {
  return anchor === "top-left" || anchor === "bottom-left" || anchor === "left";
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, every field .default()ed so it renders standalone)
// ─────────────────────────────────────────────────────────────────────────────

export const floatingTweetCardOverSpeakerSchema = z.object({
  /** Display name (e.g. "Alex Hormozi"). */
  name: z.string().default("Alex Hormozi"),
  /** Handle (e.g. "@AlexHormozi"). */
  handle: z.string().default("@AlexHormozi"),
  /** Avatar image src — absent → gray placeholder with the name's first letter. */
  avatarSrc: z.string().default(""),
  /** Show the verified-check glyph next to the name. */
  verified: z.boolean().default(true),
  /** Tweet body. Split on "\n" for the SocialPostCard line-by-line reveal. */
  body: z
    .string()
    .default("The fastest way to get rich\nis to solve an expensive problem."),
  /** Optional timestamp line (e.g. "Mar 13 · 2026"). */
  timestamp: z.string().default(""),
  /** Social brand chrome — verified-glyph tint. */
  brand: z.enum(["twitter", "linkedin", "neutral"]).default("twitter"),
  /** Card width in px (auto-fits down for short copy; this is the cap). Default 720. */
  widthPx: z.number().default(720),
  /** Side/corner anchor. Default right (card floats beside his head). NEVER center. */
  anchor: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right", "left", "right"])
    .default("right"),
  /** Safe-margin inset from frame edges in px. Default 90. */
  insetPx: z.number().default(90),
  /** Idle float-bob amplitude in px (set 0 to disable). Default 4. */
  bobPx: z.number().default(4),
  /** Frame the overlay begins entering (relative to the mounting Sequence). */
  enterFrame: z.number().default(0),
  /** Frames to hold after the slide-in settles. Default 60. */
  holdFrames: z.number().default(60),
  /** Optional explicit frame to begin the slide-out. When omitted, the card
   *  holds indefinitely. */
  exitFrame: z.number().optional(),
});

export type FloatingTweetCardOverSpeakerProps = z.infer<
  typeof floatingTweetCardOverSpeakerSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingTweetCardOverSpeaker: React.FC<
  FloatingTweetCardOverSpeakerProps
> = ({
  name = "Alex Hormozi",
  handle = "@AlexHormozi",
  avatarSrc = "",
  verified = true,
  body = "The fastest way to get rich\nis to solve an expensive problem.",
  timestamp = "",
  brand = "twitter",
  widthPx = 720,
  anchor = "right",
  insetPx = 90,
  bobPx = 4,
  enterFrame = 0,
  holdFrames = 60,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  if (local < 0) return null;
  void holdFrames; // documented dwell; enforced by caller's Sequence / exitFrame.

  const leftSide = isLeftAnchor(anchor);
  const offDir = leftSide ? -1 : 1; // off-screen direction for the slide.

  // Slide in from the nearer edge with a 6px overshoot over ~8 frames.
  const slideIn = spring({
    frame: local,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.7 },
    durationInFrames: 12,
  });
  // 0 → 1: translate from +120px off-edge, overshoot 6px past, settle at 0.
  const slideInX =
    offDir * interpolate(slideIn, [0, 0.7, 1], [120, -6, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const enterOpacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Idle float-bob: a slow ±bobPx vertical sine after the slide settles.
  const bobY = bobPx === 0 ? 0 : Math.sin((local / fps) * 2 * Math.PI * 0.4) * bobPx;

  // Slide-out + fade when exitFrame is set (10-frame envelope).
  let exitX = 0;
  let exitOpacity = 1;
  if (exitFrame !== undefined) {
    const exitLocal = frame - exitFrame;
    exitX =
      offDir *
      interpolate(exitLocal, [0, 10], [0, 120], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.ease),
      });
    exitOpacity = interpolate(exitLocal, [0, 10], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (exitOpacity <= 0) return null;
  }

  const placement = anchorPlacement(anchor, insetPx);
  const translateY = placement.transform === "translateY(-50%)" ? "-50%" : "0px";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...placement,
          opacity: enterOpacity * exitOpacity,
          // Compose the slide (X) + bob (Y) on top of any anchor vertical
          // centering (translateY(-50%)).
          transform: `translate(${slideInX + exitX}px, calc(${translateY} + ${bobY}px))`,
        }}
      >
        <SocialPostCard
          author={{
            name,
            handle,
            avatarSrc: avatarSrc || undefined,
            verified,
          }}
          body={body}
          timestamp={timestamp || undefined}
          brand={brand}
          variant="text-only"
          anchor="center"
          widthPx={widthPx}
          paletteMode="paper"
          enterStartFrame={enterFrame}
        />
      </div>
    </AbsoluteFill>
  );
};

export default FloatingTweetCardOverSpeaker;
