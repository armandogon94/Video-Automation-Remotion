/**
 * TestimonialCard9x16 — vertical (1080×1920) pull-quote testimonial composition.
 *
 * Wraps the <TestimonialCard> molecule (src/components/InfoCards) into a full
 * 9×16 composition with the standard house grammar:
 *   - BrandBreadcrumb at top
 *   - SectionLabel chip at ~220px
 *   - Centered Playfair-italic pull-quote with left-edge accent glow (the molecule)
 *   - Optional EditorialCaption at the bottom strip
 *
 * Resolves to Carlos Cuamatzin's MED finding cream-pull-quote pattern. Designed
 * for short-form "what they're saying" / social-proof beats inside a longer reel.
 *
 * v1: single static testimonial. v2 could rotate through multiple via keyword
 * triggers, but for now one testimonial = one composition.
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
import type { TestimonialCard9x16Props } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { TestimonialCard } from "../components/InfoCards";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Layout constants ─────────────────────────────────────────────────
const SECTION_LABEL_Y = 220;
const TESTIMONIAL_WIDTH = 880;

// ─── SectionLabel chip ────────────────────────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Editorial spring (A1 audit): single motion DNA across cream/dark templates.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 32,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const TestimonialCard9x16: React.FC<TestimonialCard9x16Props> = ({
  audioUrl,
  wordTimings,
  quote,
  attribution,
  brandLogo,
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

  // Card paper color: on cream palette, the molecule's default white-cream
  // (#FAF7F2) reads as the same surface as the bg. Lift the card a notch by
  // using a slightly brighter white. On dark, use a near-black warm card.
  const cardPaperColor = palette === "dark" ? "#10172A" : "#FFFFFF";
  const cardInkColor = palette === "dark" ? "#F2E9D8" : resolvedInk;

  const entryFrame = Math.round(enterSeconds * fps);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
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

      {/* Section label chip */}
      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* Centered testimonial card. The molecule reads its own frame, so we
          mount it at an absolute Y position and let it run its editorial-spring
          entry. We offset by `entryFrame` via translateY of the parent so the
          entire pull-quote slides in as one block. */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        <TestimonialCard
          quote={quote}
          attribution={attribution}
          brandLogo={brandLogo}
          accentColor={resolvedAccent}
          width={TESTIMONIAL_WIDTH}
          paperColor={cardPaperColor}
          inkColor={cardInkColor}
          startFrame={entryFrame}
        />
      </AbsoluteFill>

      {/* Word-by-word captions in the bottom strip — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
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
