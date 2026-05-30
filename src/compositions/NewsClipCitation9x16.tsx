/**
 * NewsClipCitation9x16 — Bilawal V3 N6 "press-card overlay" cite composition.
 *
 * Overlay-style news-clipping cite card. Renders as a STANDALONE composition for
 * now; long-term it's a candidate to be composed inside other templates as an
 * overlay layer (e.g. atop a FauxProductUI HUD or a TalkingHead segment) — the
 * shape of the card is deliberately self-contained so it composes cleanly.
 *
 * House-grammar (matches the rest of Sprint 1+):
 *   - resolveColors(palette, overrides) for color stack
 *   - subjectTool optional accent override
 *   - palette-driven grain overlay
 *   - BrandBreadcrumb floats over the top
 *   - EditorialCaption (NOT ChunkedPhraseCaption) at the bottom — the card is
 *     calm/serif, captions should match (not clash with) that calm.
 *
 * Determinism:
 *   - No Math.random. All animation is frame-driven via Remotion's spring +
 *     interpolate. No pseudo-random positioning is needed for this template.
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
import type { NewsClipCitation9x16Props } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Layout constants ───────────────────────────────────────────────────────

const FRAME_W = 1080;
const FRAME_H = 1920;

const CARD_WIDTH = 920;
const CARD_HEIGHT = 1400;
const CARD_LEFT = (FRAME_W - CARD_WIDTH) / 2;
const CARD_TOP = (FRAME_H - CARD_HEIGHT) / 2;
const CARD_PADDING = 56;
const CARD_BORDER_RADIUS = 18;

// Dark plate background of the card — feels like a tactile press-clipping
// against the surrounding palette. Stays the same regardless of frame palette.
const CARD_PLATE = "#0F0F12";

// Serif stacks. We lean on Playfair Display when available for the headline,
// fallback through the standard system serif chain so it still renders in
// environments where the font isn't loaded.
const SERIF_DISPLAY =
  '"Playfair Display", "EB Garamond", Georgia, "Times New Roman", serif';
const SERIF_TEXT = '"EB Garamond", Georgia, "Times New Roman", serif';

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("data:")
    ? raw
    : staticFile(raw.startsWith("/") ? raw.slice(1) : raw);
}

// ─── Composition ────────────────────────────────────────────────────────────

export const NewsClipCitation9x16: React.FC<NewsClipCitation9x16Props> = ({
  audioUrl,
  wordTimings,
  source,
  byline,
  headline,
  dek,
  image,
  pullQuote,
  sectionLabel,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve color stack from palette + overrides.
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

  // Card entry — spring scale 0.96 → 1.0 + opacity 0 → 1 over ~enterSeconds.
  // The spring is clamped to enterSeconds so the timing matches the schema
  // contract (caller can lengthen / shorten the entry to taste).
  const cardEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
    durationInFrames: Math.max(6, Math.round(enterSeconds * fps)),
  });
  const cardOpacity = interpolate(cardEnter, [0, 1], [0, 1]);
  const cardScale = interpolate(cardEnter, [0, 1], [0.96, 1.0]);

  const resolvedAudio = resolveSrc(audioUrl);
  const resolvedImageSrc = image ? resolveSrc(image.src) : null;

  // Card text colors — fixed near-white / near-grey on the dark plate so the
  // press-clipping reads consistently regardless of the outer palette choice.
  const cardHeadColor = "#FFFFFF";
  const cardBodyColor = "#E6E6E6";
  const cardMutedColor = "#9A9A9F";

  // Source block sizing — short brand names (3-4 chars) get a square chip,
  // longer ones (Bloomberg, Independent) get a wider rectangle.
  const sourceBlockHeight = 56;
  const sourceBlockMinWidth = 200;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {resolvedAudio && <Audio src={resolvedAudio} />}

      {/* Soft radial vignette behind the card so it pops on cream too. */}
      <AbsoluteFill
        style={{
          background:
            palette === "dark"
              ? `radial-gradient(ellipse at center, ${resolvedAccent}11 0%, ${resolvedPaper} 75%)`
              : `radial-gradient(ellipse at center, ${resolvedInk}11 0%, ${resolvedPaper} 75%)`,
        }}
      />

      {/* Optional eyebrow chip — floats above the card. */}
      {sectionLabel && (
        <div
          style={{
            position: "absolute",
            top: CARD_TOP - 56,
            left: "50%",
            transform: `translateX(-50%) translateY(${(1 - cardEnter) * 8}px)`,
            padding: "8px 16px",
            border: `1px solid ${resolvedAccent}66`,
            borderRadius: 999,
            background: palette === "dark" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.85)",
            fontFamily: FONT_STACKS.mono,
            fontSize: 16,
            color: resolvedAccent,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: cardOpacity,
          }}
        >
          {sectionLabel}
        </div>
      )}

      {/* CITATION CARD */}
      <div
        style={{
          position: "absolute",
          top: CARD_TOP,
          left: CARD_LEFT,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: CARD_PLATE,
          borderRadius: CARD_BORDER_RADIUS,
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          padding: CARD_PADDING,
          boxSizing: "border-box",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* SOURCE LOGO BLOCK */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: source.logoColor,
            color: source.logoTextColor,
            height: sourceBlockHeight,
            minWidth: sourceBlockMinWidth,
            padding: "0 24px",
            fontFamily: SERIF_DISPLAY,
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            alignSelf: "flex-start",
            borderRadius: 2,
          }}
        >
          {source.name}
        </div>

        {/* BYLINE — mono, tracked, muted */}
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_STACKS.mono,
            fontSize: 18,
            letterSpacing: "0.18em",
            color: cardMutedColor,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {byline}
        </div>

        {/* HEADLINE + optional inline image — flex row if image is present */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 28,
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF_DISPLAY,
                fontWeight: 800,
                fontSize: 62,
                lineHeight: 1.08,
                color: cardHeadColor,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              {headline}
            </h1>

            {/* DEK — serif italic, muted-white */}
            {dek && (
              <p
                style={{
                  margin: "22px 0 0 0",
                  fontFamily: SERIF_TEXT,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 32,
                  lineHeight: 1.4,
                  color: cardBodyColor,
                  letterSpacing: "0.005em",
                }}
              >
                {dek}
              </p>
            )}
          </div>

          {/* Optional inline image at right edge (1:1, 200×200) */}
          {image && resolvedImageSrc && (
            <div
              style={{
                width: 200,
                height: 200,
                flexShrink: 0,
                borderRadius: 6,
                overflow: "hidden",
                background: "#222",
                border: `1px solid ${cardMutedColor}33`,
              }}
            >
              <Img
                src={resolvedImageSrc}
                alt={image.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>

        {/* Spacer pushes pullQuote to bottom of card. */}
        <div style={{ flex: 1 }} />

        {/* Optional pull-quote at bottom */}
        {pullQuote && (
          <div
            style={{
              borderTop: `1px solid ${cardMutedColor}33`,
              paddingTop: 28,
              marginTop: 28,
            }}
          >
            <blockquote
              style={{
                margin: 0,
                fontFamily: SERIF_TEXT,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 38,
                lineHeight: 1.35,
                color: cardHeadColor,
                letterSpacing: "0.005em",
                position: "relative",
              }}
            >
              {/* Decorative opening curly quote in accent color */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -28,
                  left: -8,
                  fontSize: 80,
                  lineHeight: 1,
                  color: resolvedAccent,
                  fontFamily: SERIF_DISPLAY,
                  fontWeight: 900,
                }}
              >
                “
              </span>
              {pullQuote.text}
            </blockquote>
            {pullQuote.attribution && (
              <div
                style={{
                  marginTop: 16,
                  fontFamily: FONT_STACKS.mono,
                  fontSize: 16,
                  letterSpacing: "0.18em",
                  color: cardMutedColor,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                — {pullQuote.attribution}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* House-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* EditorialCaption — calm captions match the calm card */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 80,
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

export type { NewsClipCitation9x16Props } from "./schemas";
export { newsClipCitation9x16Schema } from "./schemas";
