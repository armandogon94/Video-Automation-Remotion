/**
 * FloatingProductCard — OV8 over-speaker overlay molecule.
 *
 * SPEC: references/creators/alexhormozi/OVERLAY-ANALYSIS.md §1 OV8
 * `FloatingProductCard` (book covers over speaker).
 *  - Anchor ref: `jfW6gL6hKhk@165s` & `@180s` (book covers "$100M MODELS",
 *    "$100M LEADS/OFFERS" floated beside his head, often with a "LINK IN THE
 *    DESCRIPTION" yellow callout).
 *  - What: one or more product/book-cover images composited to ONE side over
 *    the talking-head, frequently paired with a CTA callout (OV1-style).
 *  - transitionVerb: "Slide cover(s) in from the right with overshoot; optional
 *    slow idle bob; if multiple, fan them with a 6° rotation offset and 8-frame
 *    stagger."
 *  - Differs from cutaway: cover floats beside him vs. a full-screen
 *    product-shot cutaway.
 *  - Replicability: "`<img>` with slide-in; CTA pill reuses OV1."
 *
 * SHARED OVER-SPEAKER MOLECULE CONTRACT (identical across the overlays/ batch):
 *  - Transparent `AbsoluteFill` (no opaque fill; `pointerEvents:'none'`); the
 *    card group is positioned via a side/corner `anchor`, NEVER center
 *    (OVERLAY-ANALYSIS §2.1).
 *  - Inline zod `<name>Schema`, every field `.default()`ed; timing props
 *    `enterFrame` / `holdFrames` / optional `exitFrame`; animated relative to
 *    `enterFrame` via `useCurrentFrame()`.
 *  - Exports component + schema + inferred type; renders standalone with zero
 *    props (parses defaults).
 *
 * Dual-aspect (Tier-B): the card group is a px-sized cluster anchored to one
 * side of a transparent AbsoluteFill, so it renders correctly at any
 * composition dimension (16:9 and 9:16); the parent owns the slot.
 *
 * @dualAspect true — cited OV8.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../../brand";

/** Anchor vocabulary shared across all over-speaker molecules. NEVER center. */
const anchorEnum = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);

/** One product/book cover in the floating group. */
const coverSchema = z.object({
  /** Image src (absolute URL, data URI, or /public-relative — routed via
   *  staticFile). Empty → a tinted placeholder card with the title text. */
  src: z.string().default(""),
  /** Title shown on the placeholder when `src` is empty (and as alt text). */
  title: z.string().default("$100M OFFERS"),
});

export const floatingProductCardSchema = z.object({
  /** Covers to float in. 1–3 reads best; >1 fans with a rotation offset. */
  covers: z
    .array(coverSchema)
    .default([{ src: "", title: "$100M OFFERS" }]),
  /** Optional OV1-style CTA callout under the covers (e.g. link prompt). */
  cta: z.string().default("LINK IN THE DESCRIPTION"),
  /** Show the CTA callout. Default true. */
  showCta: z.boolean().default(true),
  /** Side/corner anchor (covers float BESIDE his head). Default 'right'. NEVER center. */
  anchor: anchorEnum.default("right"),
  /** Cover height in px (width derives from a 2:3 book aspect). Default 460. */
  coverHeightPx: z.number().default(460),
  /** Rotation offset per fanned cover in degrees. Default 6. */
  fanDegrees: z.number().default(6),
  /** Idle float-bob amplitude in px (0 disables). Default 4. */
  bobPx: z.number().default(4),
  /** Yellow accent for the CTA + placeholder. Default Hormozi yellow ~#FFE000. */
  yellow: z.string().default("#FFE000"),
  /** Frame the overlay begins entering. Default 0. */
  enterFrame: z.number().default(0),
  /** Frames to hold after the slide-in settles. Default 72. */
  holdFrames: z.number().default(72),
  /** Optional explicit exit frame. When omitted, derived from enter+slide+hold. */
  exitFrame: z.number().optional(),
});

export type FloatingProductCardProps = z.infer<typeof floatingProductCardSchema>;

type Anchor = z.infer<typeof anchorEnum>;
type Cover = z.infer<typeof coverSchema>;

/** Resolve a cover src — pass through absolute/data URLs, route the rest
 *  through Remotion's `staticFile` so it works in Studio + headless renders. */
function resolveSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

/** True when the anchor sits on the LEFT edge (slide-in direction flips). */
function isLeftAnchor(anchor: Anchor): boolean {
  return anchor === "top-left" || anchor === "bottom-left" || anchor === "left";
}

/** Absolute placement of the card group wrapper. NEVER center. */
function anchorPlacement(anchor: Anchor): React.CSSProperties {
  const inset = "6%";
  const base: React.CSSProperties = { position: "absolute" };
  switch (anchor) {
    case "top-left":
      return { ...base, top: inset, left: inset };
    case "top-right":
      return { ...base, top: inset, right: inset };
    case "bottom-left":
      return { ...base, bottom: inset, left: inset };
    case "bottom-right":
      return { ...base, bottom: inset, right: inset };
    case "left":
      return { ...base, top: "50%", left: inset };
    case "right":
      return { ...base, top: "50%", right: inset };
    case "lower-third":
      return { ...base, bottom: "22%", right: inset };
  }
}

/** Vertically-centering anchors translate their wrapper up by 50%. */
function isVerticallyCentered(anchor: Anchor): boolean {
  return anchor === "left" || anchor === "right";
}

export const FloatingProductCard: React.FC<
  Partial<FloatingProductCardProps>
> = (props) => {
  const {
    covers,
    cta,
    showCta,
    anchor,
    coverHeightPx,
    fanDegrees,
    bobPx,
    yellow,
    enterFrame,
    holdFrames,
    exitFrame,
  } = floatingProductCardSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;

  const SLIDE_IN = 12;
  const SLIDE_OUT = 10;
  const STAGGER = 8;
  const lastCoverDelay = STAGGER * Math.max(0, covers.length - 1);
  const derivedExit =
    enterFrame + SLIDE_IN + lastCoverDelay + holdFrames + SLIDE_OUT;
  const effectiveExit = exitFrame ?? derivedExit;

  if (frame < enterFrame || frame >= effectiveExit) return null;

  const leftSide = isLeftAnchor(anchor);
  const offDir = leftSide ? -1 : 1;

  // Group-level slide-out + fade over the final SLIDE_OUT frames.
  const exitX =
    offDir *
    interpolate(frame, [effectiveExit - SLIDE_OUT, effectiveExit], [0, 160], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const exitOpacity = interpolate(
    frame,
    [effectiveExit - SLIDE_OUT, effectiveExit],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Idle float-bob: slow ±bobPx sine on the whole group after settle.
  const bobY = bobPx === 0 ? 0 : Math.sin((local / fps) * 2 * Math.PI * 0.4) * bobPx;

  const placement = anchorPlacement(anchor);
  const centerYShift = isVerticallyCentered(anchor) ? "-50%" : "0px";
  const coverWidthPx = Math.round(coverHeightPx * (2 / 3)); // 2:3 book aspect.

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...placement,
          display: "flex",
          flexDirection: "column",
          alignItems: leftSide ? "flex-start" : "flex-end",
          gap: 22,
          opacity: exitOpacity,
          transform: `translate(${exitX}px, calc(${centerYShift} + ${bobY}px))`,
        }}
      >
        {/* Fanned cover cluster. */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {covers.map((cover, i) => (
            <CoverImage
              key={`cover-${i}`}
              cover={cover}
              index={i}
              total={covers.length}
              widthPx={coverWidthPx}
              heightPx={coverHeightPx}
              fanDegrees={fanDegrees}
              staggerFrames={STAGGER}
              slideInFrames={SLIDE_IN}
              offDir={offDir}
              local={local}
              fps={fps}
              yellow={yellow}
            />
          ))}
        </div>

        {/* OV1-style yellow CTA callout. */}
        {showCta && cta ? (
          <CtaCallout
            text={cta}
            yellow={yellow}
            local={local - (SLIDE_IN + lastCoverDelay)}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal: a single slide-in cover (image or tinted placeholder).
// ─────────────────────────────────────────────────────────────────────────────

const CoverImage: React.FC<{
  cover: Cover;
  index: number;
  total: number;
  widthPx: number;
  heightPx: number;
  fanDegrees: number;
  staggerFrames: number;
  slideInFrames: number;
  offDir: number;
  local: number;
  fps: number;
  yellow: string;
}> = ({
  cover,
  index,
  total,
  widthPx,
  heightPx,
  fanDegrees,
  staggerFrames,
  slideInFrames,
  offDir,
  local,
  fps,
  yellow,
}) => {
  const coverLocal = local - index * staggerFrames;

  // Slide in from the nearer edge with a 6px overshoot over ~12 frames.
  const slideIn = spring({
    frame: coverLocal,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.7 },
    durationInFrames: slideInFrames,
  });
  const slideX =
    offDir *
    interpolate(slideIn, [0, 0.7, 1], [140, -6, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const opacity = interpolate(coverLocal, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fan: center the rotation spread around 0 so a 1-cover group sits flat.
  const fanRotation =
    total <= 1 ? 0 : (index - (total - 1) / 2) * fanDegrees;

  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        marginLeft: index === 0 ? 0 : -Math.round(widthPx * 0.32),
        opacity,
        transform: `translateX(${slideX}px) rotate(${fanRotation}deg)`,
        transformOrigin: "bottom center",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 18px 44px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}
    >
      {cover.src ? (
        <Img
          src={resolveSrc(cover.src)}
          alt={cover.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(160deg, ${BRAND.colors.backgroundDark} 0%, ${BRAND.colors.primary} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            boxSizing: "border-box",
            border: `2px solid ${yellow}`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: Math.round(widthPx * 0.16),
              lineHeight: 1.05,
              color: yellow,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            {cover.title}
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal: OV1-style yellow CTA pill (scale-pop + glow).
// ─────────────────────────────────────────────────────────────────────────────

const CtaCallout: React.FC<{ text: string; yellow: string; local: number }> = ({
  text,
  yellow,
  local,
}) => {
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
    durationInFrames: 8,
  });
  const scale = interpolate(pop, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        opacity,
        fontFamily: FONT_STACKS.sans,
        fontWeight: 900,
        fontSize: 38,
        color: yellow,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        textShadow: `0 0 14px ${yellow}cc, 0 0 28px ${yellow}66, 0 2px 4px rgba(0,0,0,0.6)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export default FloatingProductCard;
