/**
 * TweetCardHero16x9 — horizontal (1920×1080) tweet-card-as-headline composition.
 *
 * 16:9 sibling of `TweetCardHero9x16` (per ADR-001 §2.1 — `16x9` suffix, flat in
 * src/compositions/, own inline schema per §2.4). Same semantic content fields
 * (tweet author/body/engagement, artifact image, optional face-cam, optional
 * dual-pane input→output stack) and the same entry-motion intent, RE-LAID-OUT
 * for landscape.
 *
 * The 9:16 version is three stacked horizontal zones (hero-black band → tweet
 * card → full-bleed-tall artifact below). A 16:9 port is NOT that stretched: on
 * a 1920-wide canvas the natural grammar is SIDE-BY-SIDE (the established 16:9
 * treatment — see HormoziTweetCardListicle16x9, where the tweet card is anchored
 * to one side leaving the other half for media). Here the tweet card sits on the
 * LEFT at a comfortable landscape width (~760px), and the artifact / dual-pane
 * stack occupies the RIGHT column. With no artifact and no stack, the tweet card
 * is centered and the right column collapses — a clean "just the tweet" card.
 *
 * Layout (left → right):
 *   - DarkSlateChassis16x9 dark-navy base + palette grain + handle chip chrome.
 *   - Optional BrandBreadcrumb16x9 top-left.
 *   - TWEET CARD — white rounded-rect, left column, ~760px wide, padded 40px,
 *     drop-shadow. Avatar + name + handle + verified tick header, then body,
 *     then optional engagement metrics row.
 *   - RIGHT COLUMN — single artifact <Img> (objectFit: cover, rounded), OR the
 *     dual-pane input→output stack (two rounded rects, sequential reveal), OR
 *     nothing (card centers). Optional circular face-cam inset bottom-right of
 *     the single-artifact pane.
 *   - Optional BrandWatermark16x9 bottom-right.
 *   - Optional bottom EditorialCaption strip (OFF by default — the tweet body IS
 *     the text layer, per ADR §2.5).
 *
 * Motion grammar (preserved from the 9:16 source):
 *   - Tweet card enters at frame 0: spring scale 0.95 → 1.0 + opacity 0 → 1.
 *   - Avatar circle has a subtle pulse on entry (scale 0.9 → 1.0).
 *   - Single artifact fades in ~0.2s after the card; face-cam 0.6s after that.
 *   - Dual-pane stack reveals sequentially — input first, then output.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
  ALL_PALETTE_MODES,
} from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Local schemas (self-contained — does NOT import the 9:16 schema; ADR §2.4)
// ─────────────────────────────────────────────────────────────────────────────

const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

const tweetCardContentSchema_local = z.object({
  /** Display name. */
  name: z.string().default("Armando Inteligencia"),
  /** Handle WITHOUT the @ (we add it). */
  handle: z.string().default("armandointeligencia"),
  /** Optional avatar image URL or staticFile-relative path. */
  avatarUrl: z.string().default(""),
  /** Tweet body text. Supports plain text + line breaks. */
  body: z.string().default(""),
  /** Timestamp / context label shown on the right (e.g. "May 20"). */
  timestamp: z.string().optional(),
  /** Whether to show the verified-tick. */
  verified: z.boolean().default(false),
  /** Optional engagement metrics row. */
  replies: z.number().optional(),
  retweets: z.number().optional(),
  likes: z.number().optional(),
});
type TweetCardContent16x9 = z.infer<typeof tweetCardContentSchema_local>;

const artifactPaneSchema_local = z.object({
  /** URL or staticFile-relative path to the image inside this pane. */
  src: z.string().default(""),
  /** Optional alt text (ignored at render — kept for parity). */
  altText: z.string().optional(),
  /** Small uppercase pill in the top-left corner of the pane. */
  label: z.string().default("INPUT"),
});
type ArtifactPane16x9 = z.infer<typeof artifactPaneSchema_local>;

const artifactStackSchema_local = z.object({
  input: artifactPaneSchema_local,
  output: artifactPaneSchema_local.extend({
    label: z.string().default("OUTPUT"),
  }),
  /** Gap in pixels between the input and output rectangles. */
  gapPx: z.number().default(20),
});

export const tweetCardHero16x9Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  tweet: tweetCardContentSchema_local.default({
    name: "Armando Inteligencia",
    handle: "armandointeligencia",
    avatarUrl: "",
    body: "",
    verified: true,
  }),
  /** URL / staticFile path to the right-column artifact. Empty = card centers. */
  artifactImageUrl: z.string().default(""),
  /** Optional circular face-cam inset, bottom-right of the artifact. Empty = none. */
  faceCamImageUrl: z.string().default(""),
  /**
   * Optional dual-pane "input → output" stack. When set, the single artifact is
   * replaced by two stacked rounded rectangles in the right column (input on
   * top, output on bottom) with sequential reveal motion.
   */
  artifactStack: artifactStackSchema_local.optional(),

  /** Tweet card width in px (left column). 16:9-calibrated. Default 760. */
  cardWidthPx: z.number().default(760),
  /** Tweet body font size — 16:9 band (vs 9:16 44–52). Default 34. */
  bodyFontSize: z.number().default(34),

  // Brand chrome (16:9 variants)
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  /** Optional watermark — if null, no watermark is rendered. */
  watermark: watermarkSchema_local.nullable().default(null),
  /** Optional handle text shown next to the watermark logo. */
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().default(null),
  /** Dark is the default (bilawal's reference is dark); pass "cream" to flip. */
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(34),
  /** Default OFF — the tweet body IS the text layer (ADR §2.5). */
  showCaptions: z.boolean().default(false),
});
export type TweetCardHero16x9Props = z.infer<typeof tweetCardHero16x9Schema>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants — landscape side-by-side rhythm.
// ─────────────────────────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const COLUMN_GUTTER = 80; // gap between the tweet card and the right column
const SIDE_MARGIN = 110; // outer left/right frame margin
const RIGHT_COL_RADIUS = 16;
const STACK_LABEL_PADDING = 16;

const CARD_PADDING = 40;
const CARD_BORDER_RADIUS = 28;

const FACECAM_SIZE = 200;
const FACECAM_MARGIN = 40;

// ─── Helpers ────────────────────────────────────────────────────────

function resolveImageSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

function formatEngagement(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}K`;
  }
  const v = n / 1_000_000;
  return `${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
}

// ─── Verified tick (inline SVG, Twitter/X blue) ─────────────────────
const VerifiedTick: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }}
    aria-hidden
  >
    <path
      fill="#1D9BF0"
      d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
    />
  </svg>
);

// ─── Engagement metric (reply / retweet / like) ─────────────────────
const EngagementItem: React.FC<{
  icon: "reply" | "retweet" | "like";
  count: number;
  color: string;
}> = ({ icon, count, color }) => {
  const glyph =
    icon === "reply" ? "\u{1F4AC}" : icon === "retweet" ? "\u{1F501}" : "♥";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: FONT_STACKS.mono,
        fontSize: 22,
        color,
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: 22, opacity: 0.85 }}>{glyph}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {formatEngagement(count)}
      </span>
    </div>
  );
};

// ─── Tweet card (left column) ───────────────────────────────────────
const TweetCard: React.FC<{
  tweet: TweetCardContent16x9;
  widthPx: number;
  bodyFontSize: number;
  leftPx: number;
  mutedColor: string;
}> = ({ tweet, widthPx, bodyFontSize, leftPx, mutedColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring — same critically-damped profile as the family; avatar
  // pulses slightly snappier on top of the card settle.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardOpacity = interpolate(enter, [0, 1], [0, 1]);
  const cardScale = interpolate(enter, [0, 1], [0.95, 1.0]);

  const avatarEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.6 },
  });
  const avatarScale = interpolate(avatarEnter, [0, 1], [0.9, 1.0]);

  const avatarSrc = resolveImageSrc(tweet.avatarUrl);

  // Cardinal near-black text inside the white card — matches Twitter/X.
  const cardInk = "#0F1419";
  const cardMuted = "#536471";

  const hasEngagement =
    typeof tweet.replies === "number" ||
    typeof tweet.retweets === "number" ||
    typeof tweet.likes === "number";

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: leftPx,
        width: widthPx,
        padding: CARD_PADDING,
        background: "#FFFFFF",
        borderRadius: CARD_BORDER_RADIUS,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        opacity: cardOpacity,
        transform: `translateY(-50%) scale(${cardScale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
      }}
    >
      {/* Header row — avatar + name/handle on the left, timestamp on the right. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar circle. */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              overflow: "hidden",
              background: `${mutedColor}33`,
              transform: `scale(${avatarScale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            {avatarSrc ? (
              <Img
                src={avatarSrc}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : null}
          </div>
          {/* Name + handle column. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 700,
                fontSize: 32,
                color: cardInk,
                lineHeight: 1.1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {tweet.name}
              {tweet.verified ? <VerifiedTick size={28} /> : null}
            </div>
            <div
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 400,
                fontSize: 25,
                color: cardMuted,
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              @{tweet.handle}
            </div>
          </div>
        </div>
        {/* Timestamp column. */}
        {tweet.timestamp ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 400,
              fontSize: 23,
              color: cardMuted,
              lineHeight: 1.2,
              paddingTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {tweet.timestamp}
          </div>
        ) : null}
      </div>

      {/* Tweet body. */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 500,
          fontSize: bodyFontSize,
          lineHeight: 1.3,
          color: cardInk,
          letterSpacing: "-0.01em",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {tweet.body}
      </div>

      {/* Optional engagement metrics row. */}
      {hasEngagement ? (
        <div
          style={{
            display: "flex",
            gap: 44,
            marginTop: 26,
            paddingTop: 18,
            borderTop: `1px solid ${cardMuted}22`,
          }}
        >
          {typeof tweet.replies === "number" ? (
            <EngagementItem icon="reply" count={tweet.replies} color={cardMuted} />
          ) : null}
          {typeof tweet.retweets === "number" ? (
            <EngagementItem
              icon="retweet"
              count={tweet.retweets}
              color={cardMuted}
            />
          ) : null}
          {typeof tweet.likes === "number" ? (
            <EngagementItem icon="like" count={tweet.likes} color={cardMuted} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

// ─── Artifact pane (single OR dual-pane stack member) ───────────────
const ArtifactPane: React.FC<{
  pane: ArtifactPane16x9;
  showLabel: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  yOffset: number;
  paperColor: string;
  inkColor: string;
}> = ({
  pane,
  showLabel,
  left,
  top,
  width,
  height,
  opacity,
  yOffset,
  paperColor,
  inkColor,
}) => {
  const src = resolveImageSrc(pane.src);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height,
        borderRadius: RIGHT_COL_RADIUS,
        overflow: "hidden",
        background: paperColor,
        opacity,
        transform: `translateY(${yOffset}px)`,
        boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
        boxSizing: "border-box",
      }}
    >
      {src ? (
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `repeating-linear-gradient(135deg, ${paperColor} 0px, ${paperColor} 18px, ${inkColor}08 18px, ${inkColor}08 19px)`,
          }}
        />
      )}
      {showLabel ? (
        <div
          style={{
            position: "absolute",
            top: STACK_LABEL_PADDING,
            left: STACK_LABEL_PADDING,
            padding: "6px 14px",
            borderRadius: 6,
            background: "rgba(10,15,26,0.72)",
            color: "#FFFFFF",
            fontFamily: FONT_STACKS.sans,
            fontSize: 16,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            lineHeight: 1,
          }}
        >
          {pane.label}
        </div>
      ) : null}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const TweetCardHero16x9: React.FC<TweetCardHero16x9Props> = ({
  audioUrl,
  wordTimings,
  tweet,
  artifactImageUrl,
  faceCamImageUrl,
  artifactStack,
  cardWidthPx,
  bodyFontSize,
  breadcrumb,
  watermark,
  watermarkHandle,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  const artifactSrc = resolveImageSrc(artifactImageUrl);
  const faceCamSrc = resolveImageSrc(faceCamImageUrl);

  // Does the right column carry anything? If not, center the tweet card.
  const hasRightColumn = Boolean(artifactStack) || Boolean(artifactSrc);

  // ── Column geometry ───────────────────────────────────────────────
  // Right column spans from (left margin + card width + gutter) to the right
  // margin, vertically inset top/bottom. When there is no right column, the
  // tweet card centers horizontally.
  const RIGHT_COL_TOP = 130;
  const RIGHT_COL_BOTTOM = 110;
  const rightColLeft = SIDE_MARGIN + cardWidthPx + COLUMN_GUTTER;
  const rightColWidth = CANVAS_W - rightColLeft - SIDE_MARGIN;
  const rightColHeight = CANVAS_H - RIGHT_COL_TOP - RIGHT_COL_BOTTOM;

  const cardLeft = hasRightColumn
    ? SIDE_MARGIN
    : Math.round((CANVAS_W - cardWidthPx) / 2);

  // ── Single-artifact timing ─────────────────────────────────────────
  const artifactStart = 6;
  const artifactEnd = artifactStart + Math.round(0.4 * fps);
  const artifactOpacity = interpolate(
    frame,
    [artifactStart, artifactEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const faceCamStart = artifactStart + Math.round(0.6 * fps);
  const faceCamEnd = faceCamStart + Math.round(0.4 * fps);
  const faceCamOpacity = interpolate(
    frame,
    [faceCamStart, faceCamEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Dual-pane stack timing — sequential "input causes output". ──────
  const cardLandedFrame = 15;
  const stackInputStart = cardLandedFrame + 8;
  const stackInputEnd = stackInputStart + Math.round(0.35 * fps);
  const stackInputOpacity = interpolate(
    frame,
    [stackInputStart, stackInputEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const stackInputY = interpolate(
    frame,
    [stackInputStart, stackInputEnd],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const stackOutputStart = stackInputStart + 6;
  const stackOutputEnd = stackOutputStart + Math.round(0.35 * fps);
  const stackOutputOpacity = interpolate(
    frame,
    [stackOutputStart, stackOutputEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const stackOutputY = interpolate(
    frame,
    [stackOutputStart, stackOutputEnd],
    [10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Stack pane geometry — two panes split the right column vertically.
  const stackGap = artifactStack?.gapPx ?? 20;
  const stackPaneHeight = Math.floor((rightColHeight - stackGap) / 2);

  return (
    <DarkSlateChassis16x9 slateColor={resolvedPaper}>
      {audioUrl ? (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      ) : null}

      {/* RIGHT COLUMN — single artifact (default) OR dual-pane stack. Rendered
          before the grain so the grain overlays it as one editorial frame. */}
      {!artifactStack && hasRightColumn ? (
        <div
          style={{
            position: "absolute",
            top: RIGHT_COL_TOP,
            left: rightColLeft,
            width: rightColWidth,
            height: rightColHeight,
            borderRadius: RIGHT_COL_RADIUS,
            overflow: "hidden",
            background: resolvedPaper,
            opacity: artifactSrc ? artifactOpacity : 1,
            boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
          }}
        >
          {artifactSrc ? (
            <Img
              src={artifactSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `repeating-linear-gradient(135deg, ${resolvedPaper} 0px, ${resolvedPaper} 18px, ${resolvedInk}08 18px, ${resolvedInk}08 19px)`,
              }}
            />
          )}
        </div>
      ) : null}

      {/* Optional circular face-cam inset — bottom-right of the single artifact. */}
      {!artifactStack && hasRightColumn && faceCamSrc ? (
        <div
          style={{
            position: "absolute",
            top: RIGHT_COL_TOP + rightColHeight - FACECAM_SIZE - FACECAM_MARGIN,
            left: rightColLeft + rightColWidth - FACECAM_SIZE - FACECAM_MARGIN,
            width: FACECAM_SIZE,
            height: FACECAM_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${resolvedAccent}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            opacity: faceCamOpacity,
          }}
        >
          <Img
            src={faceCamSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        </div>
      ) : null}

      {/* DUAL-PANE STACK — input on top, generated output below, sequential. */}
      {artifactStack ? (
        <>
          <ArtifactPane
            pane={artifactStack.input}
            showLabel
            left={rightColLeft}
            top={RIGHT_COL_TOP}
            width={rightColWidth}
            height={stackPaneHeight}
            opacity={stackInputOpacity}
            yOffset={stackInputY}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
          />
          <ArtifactPane
            pane={artifactStack.output}
            showLabel
            left={rightColLeft}
            top={RIGHT_COL_TOP + stackPaneHeight + stackGap}
            width={rightColWidth}
            height={stackPaneHeight}
            opacity={stackOutputOpacity}
            yOffset={stackOutputY}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
          />
        </>
      ) : null}

      {/* Palette-driven grain overlay — above the artifact so the whole frame
          reads as one editorial composition. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Top-left breadcrumb (16:9 variant). */}
      {breadcrumb ? (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      ) : null}

      {/* Tweet card — left column (or centered when no right column). */}
      <TweetCard
        tweet={tweet}
        widthPx={cardWidthPx}
        bodyFontSize={bodyFontSize}
        leftPx={cardLeft}
        mutedColor={resolvedMuted}
      />

      {/* Bottom-right watermark (optional). */}
      {watermark ? (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      ) : null}

      {/* Word-by-word captions in the bottom strip — gated by showCaptions. */}
      {showCaptions ? (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      ) : null}
    </DarkSlateChassis16x9>
  );
};

export default TweetCardHero16x9;
