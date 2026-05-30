/**
 * TweetCardHero9x16 — vertical (1080×1920) tweet-card-as-headline composition.
 *
 * Inspired by @bilawal.ai's dominant "TweetCardOverlay" template (analyzed at
 * references/creators/bilawal.ai/ANALYSIS.md — Template A, 5/7 reels). A composed
 * tweet card sits on a near-black hero zone above a screen-recording / image
 * artifact below, with an optional small face-cam corner inset. The "tweet" is
 * a typography device — sentence-case body, avatar + name + handle + verified
 * tick — used as a load-bearing identity anchor for "personal brand with proof"
 * reels.
 *
 * Same house grammar as the rest of Sprint 1:
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccent()
 *   - optional BrandBreadcrumb at top (floats over the hero black zone)
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional bottom EditorialCaption strip
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~80px from top, floats over the hero zone)
 *   - HERO ZONE (y = 0..480): pure near-black background block (#0A0F1A on dark,
 *     resolvedInk on cream). The tweet card mounts on top of it.
 *   - TWEET CARD (centered in the hero zone, y ≈ 140): white rounded-rect card,
 *     ~880px wide, padded 36px, drop-shadow 0 12px 40px rgba(0,0,0,0.25).
 *     Contains:
 *       · Header row — avatar circle (56px), name (30px bold) + handle (24px
 *         muted) + verified tick column on the left, timestamp column on the right.
 *       · Tweet body — Inter 44–52px, weight 500, line-height 1.25, near-black.
 *       · Optional engagement metrics row (reply/retweet/like counts, small monospace).
 *   - ARTIFACT ZONE (y = 480..1728): screen-recording / image artifact rendered
 *     as <Img> with objectFit: cover. Fallback: paper-color block if URL empty.
 *   - OPTIONAL FACE-CAM INSET (bottom-right of artifact zone, ~180x180 circle):
 *     small circular <Img> overlapping the artifact's bottom-right corner.
 *   - BOTTOM ZONE (y = 1728..1920): EditorialCaption strip, distancePx: 60.
 *
 * Motion grammar:
 *   - Tweet card enters at frame 0: spring scale 0.95 → 1.0 + opacity 0 → 1 over ~0.5s.
 *   - Artifact image fades in over ~0.4s starting at frame 6 (small stagger after card).
 *   - Face-cam inset fades in 0.6s after artifact.
 *   - Avatar circle has a subtle pulse on entry (scale 0.9 → 1.0 over ~0.4s).
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
import type {
  TweetCardContent,
  TweetCardHero9x16Props,
  TweetCardHeroArtifactPane,
} from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, FONT_STACKS } from "../brand";

// Layout constants — three-zone vertical rhythm.
const HERO_ZONE_HEIGHT = 480; // top 25%
const ARTIFACT_TOP = HERO_ZONE_HEIGHT;
const ARTIFACT_HEIGHT = 1248; // 1728 - 480 = middle 65%

// Tweet card lives centered horizontally inside the hero zone.
const CARD_WIDTH = 880;
const CARD_LEFT = (1080 - CARD_WIDTH) / 2;
const CARD_TOP = 140; // floats inside the hero zone, leaves room for breadcrumb
const CARD_PADDING = 36;
const CARD_BORDER_RADIUS = 24;

// Face-cam inset: ~180px circle overlapping the bottom-right of the artifact zone.
const FACECAM_SIZE = 180;
const FACECAM_MARGIN = 40;

// ─── Dual-pane "input → output" artifact stack (bilawal.ai Pattern N1) ───
// Two stacked rounded rectangles centered horizontally below the tweet card.
// Each pane matches the tweet card's max-width and carries a small uppercase
// label pill in its top-left corner. The pair animates in sequentially:
// input first, then output (reads as "input causes output").
const STACK_PANE_WIDTH = CARD_WIDTH; // matches tweet card width
const STACK_PANE_RADIUS = 12;
const STACK_LABEL_PADDING = 14;

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Resolve an image source string. Empty = no source (caller renders a fallback block).
 * Absolute URLs pass through; everything else is wrapped in staticFile().
 */
function resolveImageSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

/**
 * Compact-format an engagement count: 1500 → "1.5K", 2400000 → "2.4M".
 * Returns the raw number stringified if below 1000.
 */
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

// ─── Tweet card ─────────────────────────────────────────────────────
const TweetCard: React.FC<{
  tweet: TweetCardContent;
  mutedColor: string;
}> = ({ tweet, mutedColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Editorial spring (A1 audit): damping 22 / stiffness 130 / mass 0.7. Same
  // critically-damped profile every cream/dark composition uses. The avatar
  // (d=18 / s=160) is intentionally snappier so it pulses lightly on top of
  // the card settle.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardOpacity = interpolate(enter, [0, 1], [0, 1]);
  const cardScale = interpolate(enter, [0, 1], [0.95, 1.0]);

  // Avatar subtle pulse — scale 0.9 → 1.0 over ~0.4s, slightly slower than the card.
  const avatarEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.6 },
  });
  const avatarScale = interpolate(avatarEnter, [0, 1], [0.9, 1.0]);

  const avatarSrc = resolveImageSrc(tweet.avatarUrl);

  // Cardinal near-black text color for the tweet card body — matches Twitter/X.
  const cardInk = "#0F1419";
  const cardMuted = "#536471"; // Twitter/X handle gray

  const hasEngagement =
    typeof tweet.replies === "number" ||
    typeof tweet.retweets === "number" ||
    typeof tweet.likes === "number";

  return (
    <div
      style={{
        position: "absolute",
        top: CARD_TOP,
        left: CARD_LEFT,
        width: CARD_WIDTH,
        padding: CARD_PADDING,
        background: "#FFFFFF",
        borderRadius: CARD_BORDER_RADIUS,
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
      }}
    >
      {/* Header row — avatar + name/handle on the left, timestamp on the right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar circle */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              overflow: "hidden",
              background: `${mutedColor}33`,
              transform: `scale(${avatarScale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            {avatarSrc && (
              <Img
                src={avatarSrc}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </div>
          {/* Name + handle column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 30,
                color: cardInk,
                lineHeight: 1.1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {tweet.name}
              {tweet.verified && <VerifiedTick size={26} />}
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 24,
                color: cardMuted,
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              @{tweet.handle}
            </div>
          </div>
        </div>
        {/* Timestamp column */}
        {tweet.timestamp && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 22,
              color: cardMuted,
              lineHeight: 1.2,
              paddingTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {tweet.timestamp}
          </div>
        )}
      </div>

      {/* Tweet body */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 46,
          lineHeight: 1.25,
          color: cardInk,
          letterSpacing: "-0.01em",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {tweet.body}
      </div>

      {/* Optional engagement metrics row */}
      {hasEngagement && (
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 22,
            paddingTop: 16,
            borderTop: `1px solid ${cardMuted}22`,
          }}
        >
          {typeof tweet.replies === "number" && (
            <EngagementItem icon="reply" count={tweet.replies} color={cardMuted} />
          )}
          {typeof tweet.retweets === "number" && (
            <EngagementItem icon="retweet" count={tweet.retweets} color={cardMuted} />
          )}
          {typeof tweet.likes === "number" && (
            <EngagementItem icon="like" count={tweet.likes} color={cardMuted} />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Artifact pane (dual-pane stack member) ─────────────────────────
const ArtifactPane: React.FC<{
  pane: TweetCardHeroArtifactPane;
  width: number;
  height: number;
  top: number;
  opacity: number;
  yOffset: number;
  paperColor: string;
  inkColor: string;
}> = ({ pane, width, height, top, opacity, yOffset, paperColor, inkColor }) => {
  const src = resolveImageSrc(pane.src);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: (1080 - width) / 2,
        width,
        height,
        borderRadius: STACK_PANE_RADIUS,
        overflow: "hidden",
        background: paperColor,
        opacity,
        transform: `translateY(${yOffset}px)`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
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
      {/* Label pill — translucent dark, top-left, uppercase, tracked */}
      <div
        style={{
          position: "absolute",
          top: STACK_LABEL_PADDING,
          left: STACK_LABEL_PADDING,
          padding: "6px 12px",
          borderRadius: 6,
          background: "rgba(10,15,26,0.72)",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          lineHeight: 1,
        }}
      >
        {pane.label}
      </div>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const TweetCardHero9x16: React.FC<TweetCardHero9x16Props> = ({
  audioUrl,
  wordTimings,
  tweet,
  artifactImageUrl,
  faceCamImageUrl,
  artifactStack,
  breadcrumb,
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

  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default" (Zod schemas default to "").
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

  // Hero zone is always near-black — on dark palette use #0A0F1A directly,
  // on cream palette use the resolved ink so the tweet card pops against it.
  const heroBg = palette === "dark" ? "#0A0F1A" : resolvedInk;

  const artifactSrc = resolveImageSrc(artifactImageUrl);
  const faceCamSrc = resolveImageSrc(faceCamImageUrl);

  // Artifact fade-in: starts at frame 6 (~0.2s after card), full opacity ~0.6s later.
  const artifactStart = 6;
  const artifactEnd = artifactStart + Math.round(0.4 * fps);
  const artifactOpacity = interpolate(
    frame,
    [artifactStart, artifactEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Face-cam fade-in: 0.6s after the artifact starts.
  const faceCamStart = artifactStart + Math.round(0.6 * fps);
  const faceCamEnd = faceCamStart + Math.round(0.4 * fps);
  const faceCamOpacity = interpolate(
    frame,
    [faceCamStart, faceCamEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ─── Dual-pane stack timing + layout ───────────────────────────────
  // Sequential reveal — "input causes output". The spring landing of the
  // tweet card resolves around frame 15 (~0.5s @ 30fps); we add a small
  // 8-frame settling buffer before the input pane fades in, then offset the
  // output pane another 6 frames so the eye reads input → output.
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
    [8, 0],
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
    [8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Compute stack layout when active. The two panes sit below the tweet card,
  // share the artifact zone vertical span, and each take (zone − gap) / 2.
  const stackGap = artifactStack?.gapPx ?? 16;
  // Top edge of the stack lives a hair below the bottom of the tweet card,
  // leaving the same breathing room the original single artifact had.
  const STACK_TOP_MARGIN = 28;
  const stackTop = ARTIFACT_TOP + STACK_TOP_MARGIN;
  const stackAvailableHeight = ARTIFACT_HEIGHT - STACK_TOP_MARGIN * 2;
  const stackPaneHeight = Math.floor((stackAvailableHeight - stackGap) / 2);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* HERO ZONE — pure near-black band, top 25% of the frame */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: HERO_ZONE_HEIGHT,
          background: heroBg,
        }}
      />

      {/* ARTIFACT ZONE — single screen-recording / image (default mode).
          When artifactStack is set, the dual-pane stack below replaces this. */}
      {!artifactStack && (
        <div
          style={{
            position: "absolute",
            top: ARTIFACT_TOP,
            left: 0,
            width: 1080,
            height: ARTIFACT_HEIGHT,
            overflow: "hidden",
            background: resolvedPaper,
            opacity: artifactSrc ? artifactOpacity : 1,
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
            // Fallback: subtle paper-color block with a hairline ink-tinted pattern so
            // the missing artifact is obvious but on-brand.
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `repeating-linear-gradient(135deg, ${resolvedPaper} 0px, ${resolvedPaper} 18px, ${resolvedInk}08 18px, ${resolvedInk}08 19px)`,
              }}
            />
          )}
        </div>
      )}

      {/* OPTIONAL FACE-CAM INSET — small circle, bottom-right of artifact zone.
          Only shown in single-artifact mode (the dual-pane stack owns that space). */}
      {!artifactStack && faceCamSrc && (
        <div
          style={{
            position: "absolute",
            top: ARTIFACT_TOP + ARTIFACT_HEIGHT - FACECAM_SIZE - FACECAM_MARGIN,
            left: 1080 - FACECAM_SIZE - FACECAM_MARGIN,
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
      )}

      {/* DUAL-PANE ARTIFACT STACK (bilawal.ai Pattern N1) — input on top,
          generated output on bottom, sequential reveal. */}
      {artifactStack && (
        <>
          <ArtifactPane
            pane={artifactStack.input}
            width={STACK_PANE_WIDTH}
            height={stackPaneHeight}
            top={stackTop}
            opacity={stackInputOpacity}
            yOffset={stackInputY}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
          />
          <ArtifactPane
            pane={artifactStack.output}
            width={STACK_PANE_WIDTH}
            height={stackPaneHeight}
            top={stackTop + stackPaneHeight + stackGap}
            opacity={stackOutputOpacity}
            yOffset={stackOutputY}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
          />
        </>
      )}

      {/* Palette-driven grain overlay — applied above the artifact so the whole frame
          reads as one editorial composition (matches Sprint 1 conventions). */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (floats over the hero black zone) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Tweet card — composed mockup, mounts on top of the hero zone */}
      <TweetCard tweet={tweet} mutedColor={resolvedMuted} />

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
