/**
 * LayerCardStack9x16 — vertical (1080×1920) "framework taxonomy" stack composition.
 *
 * Inspired by @simonhoiberg's Template B "LayerCardStack" (analyzed at
 * references/creators/simonhoiberg/ANALYSIS.md — reels DPBv4qMkmXE +
 * DPT3n_PgEiU). 2–4 white rounded cards stacked vertically with single-accent
 * pill badges, sitting on a glassmorphic palette-tinted blurred backdrop.
 *
 * Highest informational-density-per-frame pattern in the Sprint 1 reference
 * corpus — compresses a 3-tier taxonomy into one static glance, then the VO
 * unpacks each tier. Perfect for "3 types of X" / "AI's 3 layers" reels.
 *
 * Same house grammar as the rest of Sprint 1:
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccent()
 *   - optional BrandBreadcrumb at top
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional bottom EditorialCaption strip
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~80px from top)
 *   - Optional centered title (Inter 700 ~64px)
 *   - STACK ZONE (vertical center): 2–4 cards stacked with ~36px gap.
 *     Each card:
 *       · White (cream palette) / near-black (dark palette) rounded rectangle,
 *         borderRadius 28, padding 40, max-width 920.
 *       · Optional accent badge (top-left): rounded pill, accent bg, white text,
 *         Inter 800 22px uppercase tracking-spaced.
 *       · Headline: Inter 700 52px, ink color.
 *       · Body: Inter 500 32px, muted color, line-height 1.3, 2-4 lines max.
 *       · Optional small icon top-right (28px, monospace/emoji string).
 *       · Subtle drop shadow.
 *   - Glassmorphic blurred backdrop: a radial-gradient palette-tinted plate
 *     simulating the blurred-studio depth (Remotion's static render doesn't
 *     play well with CSS backdrop-filter, so we fake it with two layered
 *     radial gradients).
 *   - Optional bottom EditorialCaption strip (toggleable).
 *
 * Motion grammar:
 *   - Card[i] enters at `cardStaggerSeconds * i` (default 0.4s).
 *   - Per-card animation: spring scale 0.92 → 1.0 + opacity 0 → 1 + translateY
 *     24 → 0 over ~0.5s. Editorial damping, no bounce.
 *   - Badge scales in ~0.1s after card lands (0.85 → 1.0 + opacity 0 → 1).
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type {
  LayerCardStack9x16Props,
  LayerCard,
  WordTiming,
} from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Layout constants ─────────────────────────────────────────────────
const STACK_MAX_WIDTH = 920;
const STACK_LEFT = (1080 - STACK_MAX_WIDTH) / 2;
const CARD_BORDER_RADIUS = 28;
const CARD_PADDING = 40;
const CARD_GAP = 36;
const STACK_CENTER_Y = 960; // vertical center of the 1920px frame

// Per-card animation timing (frames @ 30fps).
const CARD_ENTER_DURATION_FRAMES = 15; // ~0.5s
const BADGE_DELAY_AFTER_CARD_FRAMES = 3; // ~0.1s

// ─── Glassmorphic blurred backdrop ─────────────────────────────────────
// Simon's reference uses a CSS `backdrop-filter: blur(N)` over a B-roll layer.
// Remotion's still-frame renderer does NOT consistently honor backdrop-filter,
// so we fake the depth with two layered radial gradients tuned per palette:
//   - cream: warm cream highlight upper-left + soft warm-gray vignette
//   - dark : warm amber halo upper-left + deep navy vignette (matches Carlos)
const GlassmorphicBackdrop: React.FC<{
  palette: "cream" | "dark";
  paperColor: string;
  accentColor: string;
}> = ({ palette, paperColor, accentColor }) => {
  // Use the accent color at low alpha to subtly tint the "blurred studio" feel.
  // Hex8 alpha suffix (~14% on cream, ~22% on dark) keeps it readable but soft.
  const accentTint = `${accentColor}${palette === "dark" ? "38" : "24"}`;
  const ambient = palette === "dark" ? "#0A0F1A" : paperColor;
  return (
    <>
      {/* Base ambient fill — paper color so cards always read against something solid. */}
      <AbsoluteFill style={{ background: ambient }} />
      {/* Warm tinted halo upper-left, mimicking string-light bokeh on a blurred studio. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1200px 1400px at 20% 18%, ${accentTint} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      {/* Cool counter-glow lower-right for depth contrast (the "fluorescent tube" hint). */}
      <AbsoluteFill
        style={{
          background:
            palette === "dark"
              ? "radial-gradient(ellipse 1100px 1200px at 85% 88%, rgba(120, 160, 220, 0.10) 0%, transparent 60%)"
              : "radial-gradient(ellipse 1100px 1200px at 85% 88%, rgba(40, 60, 90, 0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ─── A single stack card ───────────────────────────────────────────────
const StackCard: React.FC<{
  card: LayerCard;
  index: number;
  topPx: number;
  staggerSeconds: number;
  palette: "cream" | "dark";
  accentColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({
  card,
  index,
  topPx,
  staggerSeconds,
  palette,
  accentColor,
  inkColor,
  mutedColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = Math.round(staggerSeconds * index * fps);
  const localFrame = frame - delayFrames;

  // Card entry — single spring scale 0.92 → 1.0 + opacity 0 → 1 + translateY 24 → 0.
  // Editorial damping, no overshoot (matches the rest of Sprint 1).
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardOpacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const cardScale = interpolate(enter, [0, 1], [0.92, 1.0]);
  const cardTranslateY = interpolate(enter, [0, 1], [24, 0]);

  // Badge enters ~0.1s after the card lands (which lands at ~CARD_ENTER_DURATION_FRAMES).
  const badgeLocalFrame =
    localFrame - (CARD_ENTER_DURATION_FRAMES + BADGE_DELAY_AFTER_CARD_FRAMES);
  const badgeEnter = spring({
    frame: Math.max(0, badgeLocalFrame),
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.6 },
  });
  const badgeOpacity =
    badgeLocalFrame < 0 ? 0 : interpolate(badgeEnter, [0, 1], [0, 1]);
  const badgeScale = interpolate(badgeEnter, [0, 1], [0.85, 1.0]);

  // Card background — white on cream palette, near-black slate on dark palette.
  // The dark variant uses a slate just-above-paper so cards still stand off the bg.
  const cardBg = palette === "dark" ? "#161D2B" : "#FFFFFF";
  // On the dark palette the card ink should be the warm-cream palette ink so text reads.
  // On cream, we use the resolved ink directly (near-black on white).
  const cardInk = palette === "dark" ? inkColor : "#0F1419";
  const cardMuted = palette === "dark" ? mutedColor : "#4A4F58";

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: STACK_LEFT,
        width: STACK_MAX_WIDTH,
        padding: CARD_PADDING,
        background: cardBg,
        borderRadius: CARD_BORDER_RADIUS,
        boxShadow:
          palette === "dark"
            ? "0 18px 48px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)"
            : "0 18px 48px rgba(10,15,26,0.18), 0 2px 6px rgba(10,15,26,0.08)",
        opacity: cardOpacity,
        transform: `translateY(${cardTranslateY}px) scale(${cardScale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Top row — badge (left) + optional icon (right) */}
      {(card.badge || card.icon) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 44,
          }}
        >
          {card.badge ? (
            <div
              style={{
                background: accentColor,
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "8px 18px",
                // Simon's signature "Layer N" badge is a rectangular chip with a
                // small corner radius (~6px), NOT a full pill. Matching that squared
                // form is the defining shape of this pattern (ref frame
                // simonhoiberg/DPT3n_PgEiU/frames/frame-00).
                borderRadius: 8,
                opacity: badgeOpacity,
                transform: `scale(${badgeScale})`,
                transformOrigin: "left center",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {card.badge}
            </div>
          ) : (
            <span /> /* keep flex spacer so icon stays right-aligned */
          )}
          {card.icon && (
            <div
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 28,
                color: cardMuted,
                lineHeight: 1,
                opacity: cardOpacity, /* tied to the card, not the badge */
              }}
            >
              {card.icon}
            </div>
          )}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.1,
          color: cardInk,
          letterSpacing: "-0.015em",
        }}
      >
        {card.headline}
      </div>

      {/* Body (optional — empty string renders nothing) */}
      {card.body && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.3,
            color: cardMuted,
            letterSpacing: "-0.005em",
          }}
        >
          {card.body}
        </div>
      )}
    </div>
  );
};

// ─── Title (optional, centered above the stack) ────────────────────────
const Title: React.FC<{
  title: string;
  inkColor: string;
  topPx: number;
}> = ({ title, inkColor, topPx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 24, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 64,
        lineHeight: 1.1,
        color: inkColor,
        letterSpacing: "-0.02em",
        padding: "0 60px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {title}
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────
/**
 * Estimate the rendered height of a single card so the stack can be vertically
 * centered without measuring DOM. Conservative — favors slightly tall over
 * tight so cards never collide.
 */
function estimateCardHeight(card: LayerCard): number {
  const padding = CARD_PADDING * 2;
  const headerRow = card.badge || card.icon ? 44 + 14 : 0;
  // Headline: ~52px * line-height 1.1, assume ~2 lines for long headlines.
  const headlineLines = card.headline.length > 36 ? 2 : 1;
  const headlineH = Math.round(52 * 1.1 * headlineLines);
  // Body: ~32px * 1.3, allow up to 4 lines (~120 chars).
  const bodyLines = card.body
    ? Math.min(4, Math.max(1, Math.ceil(card.body.length / 38)))
    : 0;
  const bodyH = bodyLines ? Math.round(32 * 1.3 * bodyLines) + 14 : 0;
  return padding + headerRow + headlineH + bodyH;
}

// ─── Composition ───────────────────────────────────────────────────────
export const LayerCardStack9x16: React.FC<LayerCardStack9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  cards,
  cardStaggerSeconds,
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

  // Compute per-card top positions so the whole stack is vertically centered.
  // The stack center sits at STACK_CENTER_Y; we lay cards out around it.
  const cardHeights = cards.map(estimateCardHeight);
  const totalStackHeight =
    cardHeights.reduce((sum, h) => sum + h, 0) +
    Math.max(0, cards.length - 1) * CARD_GAP;
  let cursorY = STACK_CENTER_Y - totalStackHeight / 2;
  // If a title is present, nudge the stack down so it doesn't collide.
  if (title) cursorY = Math.max(cursorY, 400);
  const cardTops: number[] = [];
  cards.forEach((_, i) => {
    cardTops.push(cursorY);
    cursorY += cardHeights[i] + CARD_GAP;
  });

  // Title sits above the stack with breathing room.
  const titleTop = Math.max(180, (cardTops[0] ?? STACK_CENTER_Y) - 130);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Glassmorphic blurred-studio backdrop (palette-tinted radial gradients) */}
      <GlassmorphicBackdrop
        palette={palette}
        paperColor={resolvedPaper}
        accentColor={resolvedAccent}
      />

      {/* Palette-driven grain overlay (consistent with the rest of Sprint 1) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional centered title */}
      {title && <Title title={title} inkColor={resolvedInk} topPx={titleTop} />}

      {/* The stack — 2–4 cards, vertically centered, staggered fade-up */}
      {cards.map((card, i) => (
        <StackCard
          key={i}
          card={card}
          index={i}
          topPx={cardTops[i]}
          staggerSeconds={cardStaggerSeconds}
          palette={palette}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          mutedColor={resolvedMuted}
        />
      ))}

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings as WordTiming[]}
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

// Re-export the Breadcrumb type so callers can safely import alongside the props type.
