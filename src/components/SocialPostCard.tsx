/**
 * SocialPostCard — Wave-5 Tella-derived animated tweet/post card.
 *
 * Tella synthesis T2 (frame ref:
 *   docs/research/wave-5/tella-frames/ykBDqicGx0M/frame-03-t253.24s.jpg):
 *   "Ali Abdaal-style tweet card with four-stage choreography — avatar pops,
 *    name slides in from left, body reveals line-by-line, image scale-pops
 *    with shadow blur-in, and counters roll up at the end."
 *
 * Five-stage choreography (sequenced via `enterStartFrame` + per-stage frames):
 *   (i)   avatar scale-pop 0 → 1 over 8 frames (EDITORIAL_SPRING)
 *   (ii)  name + handle slide-in from the left over 12 frames
 *   (iii) body text reveals line-by-line at a 6-frame stagger (split on \n)
 *   (iv)  attached image scale-pops 0.9 → 1 with shadow blur-in
 *   (v)   like / repost / reply / view counters roll up via <RollingDigitTicker>
 *
 * Brand variants:
 *   - "twitter"  — verified glyph in X-blue (#1DA1F2), small platform chrome
 *   - "linkedin" — verified glyph in LinkedIn blue (#0A66C2)
 *   - "neutral"  — verified glyph uses palette accent
 *
 * Wave-6 Hormozi consensus pattern H1 (HormoziTweetCardListicle —
 *   ref docs/research/wave-6/alexhormozi-longform-consensus.md, frames
 *   references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/v2-anim-01-frame-006.jpg
 *   and v2-anim-01-frame-012.jpg):
 *
 *   transitionVerb: "Text-only variant (Hormozi style): avatar scale-pops 0→1
 *   over 8 frames, then handle and name slide in from the left over 12 frames,
 *   then body text reveals line-by-line at 6-frame stagger. No media, no counter
 *   row. Optional NumberedBadge fades in synchronized with the avatar pop. Card
 *   can anchor left/center/right of canvas for 16:9 split-screen layouts."
 *
 *   Enabled by:
 *     - `variant: 'text-only'` — drops media + counter row even if provided
 *     - `anchor: 'left' | 'center' | 'right'` — absolute-positions the card
 *       against the canvas edge so a sibling element (e.g. talking head video)
 *       can fill the other side of a 16:9 frame
 *     - `numberedBadge` — overlays a <NumberedBadge> at the card's top-left
 *
 * Pure React FC. Reads its own frame via useCurrentFrame() — caller can mount
 * anywhere (top-level AbsoluteFill, inside a <Sequence>, etc).
 */
import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS, getPalette, type PaletteMode } from "../brand";
import { EDITORIAL_SPRING } from "../compositions/scenes";
import { staggerEntry } from "../animation";
import { blurInFocus } from "../animation/blurInFocus";
import { RollingDigitTicker } from "./NumberPrimitives";
import { NumberedBadge } from "./NumberedBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SocialPostCardAuthor {
  /** Avatar image src. Absent = rounded gray placeholder with the first letter of name. */
  avatarSrc?: string;
  /** Display name (e.g. "Ali Abdaal"). */
  name: string;
  /** Handle (e.g. "@aliabdaal"). */
  handle: string;
  /** Whether to show the verified-check glyph next to the name. */
  verified?: boolean;
}

export interface SocialPostCardCounters {
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
}

export interface SocialPostCardStages {
  /** Frame at which the avatar pop begins (relative to enterStartFrame). Default 0. */
  avatarPopFrame?: number;
  /** Duration in frames for the avatar scale-pop. Default 8. */
  avatarPopFrames?: number;
  /** Frame at which the name+handle slide-in begins. Default 4. */
  nameSlideFrame?: number;
  /** Duration in frames for the name slide. Default 12. */
  nameSlideFrames?: number;
  /** Frame at which the first body line begins to appear. Default 14. */
  bodyStartFrame?: number;
  /** Per-line stagger for the body reveal. Default 6. */
  bodyLineStaggerFrames?: number;
  /** Frame at which the attached image pops. Default = body settled + 6. */
  mediaPopFrame?: number;
  /** Duration in frames for the media pop. Default 10. */
  mediaPopFrames?: number;
  /** Frame at which counters begin rolling. Default = mediaPopFrame + 10. */
  counterRollFrame?: number;
  /** Duration in frames for the counter roll. Default 18. */
  counterRollFrames?: number;
}

/**
 * Optional numbered badge overlay (Hormozi listicle pattern H1).
 * When provided, a <NumberedBadge> is absolutely positioned at the top-left
 * corner of the card, overhanging slightly so it visually anchors the card edge.
 */
export interface SocialPostCardNumberedBadge {
  /** The numeral to display (e.g. 1, 2, "03"). */
  number: number | string;
  /** Stroke color. Default lime green #C4F84A. */
  strokeColor?: string;
  /** Number text color. Default white #FFFFFF. */
  textColor?: string;
  /** Badge diameter in px. Default 64. */
  sizePx?: number;
}

export interface SocialPostCardProps {
  /** Author block (avatar, name, handle, verified). */
  author: SocialPostCardAuthor;
  /** Body text. Will be split on newlines for line-by-line reveal. */
  body: string;
  /** Optional attached media (image). */
  mediaSrc?: string;
  /** Media aspect ratio (image 1:1, video preview 4:5 or 16:9). Default 16:9. */
  mediaAspect?: "1:1" | "4:5" | "16:9";
  /** Counters that roll up. */
  counters?: SocialPostCardCounters;
  /** Timestamp shown at bottom (e.g. "Mar 13 · 2026"). */
  timestamp?: string;
  /** Card width. Default 880. */
  widthPx?: number;
  /** Frame at which the card enters. */
  enterStartFrame?: number;
  /** Per-stage frame timings (relative to enterStartFrame). */
  stages?: SocialPostCardStages;
  /** Palette mode. */
  paletteMode?: PaletteMode;
  /** Brand variant — twitter (X), linkedin, or neutral generic. */
  brand?: "twitter" | "linkedin" | "neutral";
  /**
   * Render variant. Default 'standard'.
   * - 'standard'  — full Tella card (avatar + header + body + media + counters)
   * - 'text-only' — Hormozi H1: drops media and counter row even if `mediaSrc`
   *                 or `counters` are supplied. Card width auto-fits content
   *                 (with `widthPx` as the cap).
   */
  variant?: "standard" | "text-only";
  /**
   * Horizontal anchor on the canvas. Default 'center'.
   * - 'center' — caller controls positioning (current behavior, no inline pos)
   * - 'left'   — card uses `position: absolute; left: anchorInsetPx`
   * - 'right'  — card uses `position: absolute; right: anchorInsetPx`
   *
   * For 'left'/'right', the card is taken out of normal flow so a sibling
   * (e.g. talking head video) can occupy the other half of a 16:9 canvas.
   */
  anchor?: "left" | "center" | "right";
  /** Inset (px) from the canvas edge when anchor is 'left' or 'right'. Default 80. */
  anchorInsetPx?: number;
  /**
   * Optional NumberedBadge — when set, a numbered badge appears overhanging the
   * top-left corner of the card (Hormozi listicle pattern H1). The badge fades
   * in synchronized with the avatar pop.
   */
  numberedBadge?: SocialPostCardNumberedBadge;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CARD_RADIUS_PX = 16;
const AVATAR_SIZE_PX = 64;
const VERIFIED_BLUE_TWITTER = "#1DA1F2";
const VERIFIED_BLUE_LINKEDIN = "#0A66C2";

const ASPECT_RATIOS: Record<NonNullable<SocialPostCardProps["mediaAspect"]>, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getVerifiedColor(
  brand: NonNullable<SocialPostCardProps["brand"]>,
  accent: string,
): string {
  switch (brand) {
    case "twitter":
      return VERIFIED_BLUE_TWITTER;
    case "linkedin":
      return VERIFIED_BLUE_LINKEDIN;
    case "neutral":
    default:
      return accent;
  }
}

/**
 * Card surface color — slightly elevated over the palette `paper` so the card
 * reads as a separate UI element on cream/paper backgrounds, and stays
 * sufficiently lifted on dark backgrounds (#1A1A22 over true-black, etc.).
 */
function getCardSurface(paletteMode: PaletteMode): string {
  switch (paletteMode) {
    case "dark":
      return "#1A1F2A";
    case "warm-black":
      return "#161214";
    case "true-black":
      return "#1A1A22";
    case "paper":
      return "#FFFFFF";
    case "cream":
    default:
      return "#FFFFFF";
  }
}

function getCardBorder(paletteMode: PaletteMode): string {
  switch (paletteMode) {
    case "dark":
    case "warm-black":
    case "true-black":
      return "rgba(255,255,255,0.10)";
    case "paper":
    case "cream":
    default:
      return "rgba(0,0,0,0.10)";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VerifiedGlyph (check-in-circle SVG)
// ─────────────────────────────────────────────────────────────────────────────

const VerifiedGlyph: React.FC<{ color: string; sizePx: number }> = ({
  color,
  sizePx,
}) => {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 1l2.6 2.2 3.4-.4.6 3.4 3 1.8-1.4 3.2 1.4 3.2-3 1.8-.6 3.4-3.4-.4L12 21l-2.6-2.2-3.4.4-.6-3.4-3-1.8 1.4-3.2L2.4 8l3-1.8.6-3.4 3.4.4L12 1z"
        fill={color}
      />
      <path
        d="M9.5 12.5l1.8 1.8 3.7-4.3"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Counter row glyphs (heart, retweet, comment, eye)
// ─────────────────────────────────────────────────────────────────────────────

const HeartGlyph: React.FC<{ color: string; sizePx: number }> = ({
  color,
  sizePx,
}) => (
  <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3.5 1 4.5 2.5C11.5 6 13 5 15 5c3.5 0 5 4 3.5 7C19 16.5 12 21 12 21z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </svg>
);

const RetweetGlyph: React.FC<{ color: string; sizePx: number }> = ({
  color,
  sizePx,
}) => (
  <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none">
    <path
      d="M7 7h10l-2-2M17 17H7l2 2"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 7v6M7 17v-6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </svg>
);

const CommentGlyph: React.FC<{ color: string; sizePx: number }> = ({
  color,
  sizePx,
}) => (
  <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 5h16v11H8l-4 4V5z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </svg>
);

const EyeGlyph: React.FC<{ color: string; sizePx: number }> = ({
  color,
  sizePx,
}) => (
  <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.7} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SocialPostCard
// ─────────────────────────────────────────────────────────────────────────────

export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  author,
  body,
  mediaSrc,
  mediaAspect = "16:9",
  counters,
  timestamp,
  widthPx = 880,
  enterStartFrame = 0,
  stages,
  paletteMode = "cream",
  brand = "twitter",
  variant = "standard",
  anchor = "center",
  anchorInsetPx = 80,
  numberedBadge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = getPalette(paletteMode);

  // Stage defaults — all values are relative to enterStartFrame.
  const avatarPopFrame = stages?.avatarPopFrame ?? 0;
  const avatarPopFrames = stages?.avatarPopFrames ?? 8;
  const nameSlideFrame = stages?.nameSlideFrame ?? 4;
  const nameSlideFrames = stages?.nameSlideFrames ?? 12;
  const bodyStartFrame = stages?.bodyStartFrame ?? 14;
  const bodyLineStaggerFrames = stages?.bodyLineStaggerFrames ?? 6;

  const bodyLines = body.split("\n");
  // When body settles depends on how many lines × stagger; spring lasts ~10f.
  const bodySettledOffset =
    bodyStartFrame +
    staggerEntry({
      index: Math.max(0, bodyLines.length - 1),
      baseStartFrame: 0,
      staggerFrames: bodyLineStaggerFrames,
      accelerate: false,
    }) +
    10;

  const mediaPopFrame = stages?.mediaPopFrame ?? bodySettledOffset + 6;
  const mediaPopFrames = stages?.mediaPopFrames ?? 10;
  const counterRollFrame = stages?.counterRollFrame ?? mediaPopFrame + 10;
  const counterRollFrames = stages?.counterRollFrames ?? 18;

  const localFrame = frame - enterStartFrame;

  // ── Stage (i): avatar scale-pop ────────────────────────────────────────────
  const avatarLocal = localFrame - avatarPopFrame;
  const avatarSpring = spring({
    frame: avatarLocal,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: avatarPopFrames,
  });
  const avatarScale = interpolate(avatarSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const avatarOpacity = interpolate(avatarLocal, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Stage (ii): name + handle slide-in from left ───────────────────────────
  const nameLocal = localFrame - nameSlideFrame;
  const nameSpring = spring({
    frame: nameLocal,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: nameSlideFrames,
  });
  const nameTranslateX = interpolate(nameSpring, [0, 1], [-24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameOpacity = interpolate(nameLocal, [0, nameSlideFrames * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Stage (iv): media scale-pop + shadow blur-in ───────────────────────────
  const mediaLocal = localFrame - mediaPopFrame;
  const mediaSpring = spring({
    frame: mediaLocal,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: mediaPopFrames,
  });
  const mediaScale = interpolate(mediaSpring, [0, 1], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mediaBlur = blurInFocus({
    frame: mediaLocal,
    startFrame: 0,
    durationFrames: mediaPopFrames,
    startBlurPx: 10,
  });
  const mediaShadowOpacity = interpolate(
    mediaLocal,
    [0, mediaPopFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Card surface + chrome colors ───────────────────────────────────────────
  const cardSurface = getCardSurface(paletteMode);
  const cardBorder = getCardBorder(paletteMode);
  const verifiedColor = getVerifiedColor(brand, palette.accent);

  // Counter timing in WALL-CLOCK seconds (RollingDigitTicker uses its own frame).
  const counterStartSeconds = (enterStartFrame + counterRollFrame) / fps;
  const counterEndSeconds =
    (enterStartFrame + counterRollFrame + counterRollFrames) / fps;

  // ── Variant + anchor positioning ──────────────────────────────────────────
  const isTextOnly = variant === "text-only";

  // text-only cards auto-fit content (with widthPx as a maxWidth cap) so they
  // hug short Hormozi-style copy; standard cards keep a fixed widthPx.
  const sizing: React.CSSProperties = isTextOnly
    ? { width: "auto", maxWidth: widthPx }
    : { width: widthPx };

  // Anchor positioning — 'center' is the historical default (no inline pos,
  // caller decides); 'left'/'right' absolute-position against the canvas edge.
  const anchorStyle: React.CSSProperties =
    anchor === "left"
      ? { position: "absolute", left: anchorInsetPx, right: "auto", transform: "none" }
      : anchor === "right"
        ? { position: "absolute", right: anchorInsetPx, left: "auto", transform: "none" }
        : {};

  // ── NumberedBadge timing — fade in alongside the avatar pop ───────────────
  // NumberedBadge reads its own useCurrentFrame() relative to the enclosing
  // Sequence (not relative to enterStartFrame), so we compute the opacity here
  // using the same localFrame the avatar pop uses, then pass fadeInFrames={0}
  // to the badge and apply opacity on the wrapping div.
  const badgeSizePx = numberedBadge?.sizePx ?? 64;
  const badgeOpacity = numberedBadge
    ? interpolate(avatarLocal, [0, avatarPopFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Only opt into `position: relative` when we need it as a containing block
  // for the absolutely-positioned numbered badge — otherwise leave the
  // outer-positioning to whatever the caller already wires up (preserves
  // backward compatibility for every standard call site).
  const cardPosition: React.CSSProperties["position"] =
    anchorStyle.position ?? (numberedBadge ? "relative" : undefined);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        ...sizing,
        ...anchorStyle,
        position: cardPosition,
        background: cardSurface,
        borderRadius: CARD_RADIUS_PX,
        border: `1px solid ${cardBorder}`,
        padding: 22,
        boxShadow:
          paletteMode === "cream" || paletteMode === "paper"
            ? "0 8px 32px rgba(0,0,0,0.06)"
            : "0 8px 32px rgba(0,0,0,0.35)",
        boxSizing: "border-box",
        fontFamily: FONT_STACKS.sans,
        color: palette.ink,
      }}
    >
      {/* Hormozi-style numbered badge — overhangs the top-left corner. */}
      {numberedBadge ? (
        <div
          style={{
            position: "absolute",
            top: -16,
            left: -16,
            width: badgeSizePx,
            height: badgeSizePx,
            pointerEvents: "none",
            zIndex: 2,
            opacity: badgeOpacity,
          }}
        >
          <NumberedBadge
            number={numberedBadge.number}
            sizePx={badgeSizePx}
            strokeColor={numberedBadge.strokeColor ?? "#C4F84A"}
            textColor={numberedBadge.textColor ?? "#FFFFFF"}
            fadeInFrames={0}
          />
        </div>
      ) : null}
      {/* Header row: avatar + name + handle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: AVATAR_SIZE_PX,
            height: AVATAR_SIZE_PX,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#C8C8C8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: avatarOpacity,
            transform: `scale(${avatarScale})`,
            flexShrink: 0,
          }}
        >
          {author.avatarSrc ? (
            <img
              src={author.avatarSrc}
              alt={author.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                color: "#FFFFFF",
                fontFamily: FONT_STACKS.sans,
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + handle (slide-in) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transform: `translateX(${nameTranslateX}px)`,
            opacity: nameOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: FONT_STACKS.sans,
              fontSize: 22,
              fontWeight: 700,
              color: palette.ink,
              lineHeight: 1.1,
            }}
          >
            <span>{author.name}</span>
            {author.verified ? (
              <VerifiedGlyph color={verifiedColor} sizePx={20} />
            ) : null}
          </div>
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontSize: 18,
              color: palette.muted,
              lineHeight: 1.1,
            }}
          >
            {author.handle}
          </div>
        </div>
      </div>

      {/* Body — line by line */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bodyLines.map((line, i) => {
          const lineLocal =
            localFrame -
            (bodyStartFrame +
              staggerEntry({
                index: i,
                baseStartFrame: 0,
                staggerFrames: bodyLineStaggerFrames,
                accelerate: false,
              }));
          const lineSpring = spring({
            frame: lineLocal,
            fps,
            config: EDITORIAL_SPRING,
            durationInFrames: 10,
          });
          const lineOpacity = interpolate(lineSpring, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const lineTranslateY = interpolate(lineSpring, [0, 1], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`line-${i}`}
              style={{
                fontFamily: FONT_STACKS.sans,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.4,
                color: palette.ink,
                opacity: lineOpacity,
                transform: `translateY(${lineTranslateY}px)`,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                minHeight: line.length === 0 ? "1em" : undefined,
              }}
            >
              {line.length === 0 ? " " : line}
            </div>
          );
        })}
      </div>

      {/* Attached media — suppressed in 'text-only' variant (Hormozi H1). */}
      {!isTextOnly && mediaSrc ? (
        <div
          style={{
            marginTop: 18,
            width: "100%",
            aspectRatio: `${ASPECT_RATIOS[mediaAspect]}`,
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${cardBorder}`,
            transform: `scale(${mediaScale})`,
            transformOrigin: "center top",
            filter: `blur(${mediaBlur.blurPx}px)`,
            boxShadow: `0 18px 38px rgba(0,0,0,${mediaShadowOpacity * 0.18})`,
            background: paletteMode === "cream" || paletteMode === "paper"
              ? "#EEE"
              : "#222",
          }}
        >
          <img
            src={mediaSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : null}

      {/* Counter row — suppressed in 'text-only' variant (Hormozi H1). */}
      {!isTextOnly &&
      counters &&
      (counters.likes !== undefined ||
        counters.retweets !== undefined ||
        counters.replies !== undefined ||
        counters.views !== undefined) ? (
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 28,
            color: palette.muted,
            fontFamily: FONT_STACKS.mono,
            fontSize: 18,
          }}
        >
          {counters.replies !== undefined ? (
            <CounterChip
              glyph={<CommentGlyph color={palette.muted} sizePx={18} />}
              to={counters.replies}
              startSeconds={counterStartSeconds}
              endSeconds={counterEndSeconds}
              color={palette.muted}
            />
          ) : null}
          {counters.retweets !== undefined ? (
            <CounterChip
              glyph={<RetweetGlyph color={palette.muted} sizePx={18} />}
              to={counters.retweets}
              startSeconds={counterStartSeconds}
              endSeconds={counterEndSeconds}
              color={palette.muted}
            />
          ) : null}
          {counters.likes !== undefined ? (
            <CounterChip
              glyph={<HeartGlyph color={palette.muted} sizePx={18} />}
              to={counters.likes}
              startSeconds={counterStartSeconds}
              endSeconds={counterEndSeconds}
              color={palette.muted}
            />
          ) : null}
          {counters.views !== undefined ? (
            <CounterChip
              glyph={<EyeGlyph color={palette.muted} sizePx={18} />}
              to={counters.views}
              startSeconds={counterStartSeconds}
              endSeconds={counterEndSeconds}
              color={palette.muted}
            />
          ) : null}
        </div>
      ) : null}

      {/* Timestamp */}
      {timestamp ? (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_STACKS.mono,
            fontSize: 16,
            color: palette.muted,
            letterSpacing: "0.04em",
          }}
        >
          {timestamp}
        </div>
      ) : null}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CounterChip — internal helper, glyph + rolling number
// ─────────────────────────────────────────────────────────────────────────────

interface CounterChipProps {
  glyph: React.ReactNode;
  to: number;
  startSeconds: number;
  endSeconds: number;
  color: string;
}

const CounterChip: React.FC<CounterChipProps> = ({
  glyph,
  to,
  startSeconds,
  endSeconds,
  color,
}) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        lineHeight: 1,
      }}
    >
      {glyph}
      <RollingDigitTicker
        to={to}
        from={0}
        startSeconds={startSeconds}
        endSeconds={endSeconds}
        stepFrames={2}
        color={color}
        fontSize={18}
        fontWeight={500}
        letterSpacing="0.02em"
      />
    </span>
  );
};
