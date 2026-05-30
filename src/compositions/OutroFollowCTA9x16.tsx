/**
 * OutroFollowCTA9x16 — vertical (1080×1920) branded follow-CTA card.
 *
 * Carlos T28 — the canonical "every reel needs a follow CTA card" template.
 * Referenced in docs/critiques/wave-4/carloscuamatzin-vote1-templates.md (T28).
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb at ~80px
 *   - Optional PixelMascot eyebrow (~120px tall)
 *   - "SÍGUEME" hero (Inter Black ~180px)
 *   - "PARA MÁS OPINIONES TÉCNICAS" subtitle (mono ~32px, tracked +0.22em)
 *   - "SOBRE IA" accent line (sans 80px, accent color)
 *   - @handle pill at bottom (mono ~40px)
 *   - 4-icon footer row (Sigue / Like / Comenta / Guarda)
 *   - Optional bottom EditorialCaption strip (off by default)
 *
 * House conventions: same as KineticEssay9x16 / QuoteCard9x16 / DiagramExplainer9x16
 *   - palette `cream` | `dark` via resolveColors(palette, overrides)
 *   - subjectTool tints accent via getToolAccentForSurface()
 *   - paper-grain overlay (multiply on cream, screen on dark)
 *   - audio mounted via <Audio> when audioUrl is set
 *   - EDITORIAL_SPRING for the staggered entry choreography
 *
 * Schemas redeclared locally to avoid touching shared source files (per brief —
 * mirrors KineticTypoCard9x16 + AnimatedText9x16 + KineticEssay9x16 convention).
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
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { PixelMascot } from "../components/BrandGlyphs";
import { EDITORIAL_SPRING } from "./scenes";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Locally-redeclared shared schemas (per brief) ─────────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

// ─── Public schema + props type ────────────────────────────────────────
export const outroFollowCTA9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  ctaTitle: z.string().default("SÍGUEME"),
  ctaSubtitle: z.string().default("PARA MÁS OPINIONES TÉCNICAS"),
  ctaAccentLine: z.string().default("SOBRE IA"),
  handle: z.string().default("@armandointeligencia"),
  /** When true, renders a PixelMascot above the hero. */
  showMascot: z.boolean().default(false),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  /** Seconds before the staggered entry begins. Default 0.4. */
  enterSeconds: z.number().min(0).max(10).default(0.4),
  /** Optional bottom EditorialCaption strip. Off by default. */
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type OutroFollowCTA9x16Props = z.infer<typeof outroFollowCTA9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────────
const MASCOT_SIZE = 120;
const MASCOT_TOP_Y = 220;
const HERO_TOP_Y = 520;
const SUBTITLE_GAP = 36;
const ACCENT_GAP = 56;
const HANDLE_BOTTOM_Y = 320; // distance from bottom
const ICONS_BOTTOM_Y = 200;

// ─── Footer icon (24px sans-stroke) ────────────────────────────────────
type IconKind = "follow" | "like" | "comment" | "save";

const FooterIcon: React.FC<{ kind: IconKind; color: string; size?: number }> = ({
  kind,
  color,
  size = 36,
}) => {
  const stroke = { stroke: color, strokeWidth: 2, fill: "none" } as const;
  switch (kind) {
    case "follow":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <circle cx={10} cy={9} r={3.5} {...stroke} />
          <path d="M3.5 19c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" {...stroke} />
          <line x1={18} y1={5} x2={18} y2={11} {...stroke} />
          <line x1={15} y1={8} x2={21} y2={8} {...stroke} />
        </svg>
      );
    case "like":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"
            {...stroke}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "comment":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M4 5h16v11H8l-4 4V5z"
            {...stroke}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "save":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M6 4h12v17l-6-4-6 4V4z"
            {...stroke}
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

// ─── Stagger helper — returns 0..1 progress for an item at offsetSec ───
function useStaggeredProgress(offsetSec: number, baseDelaySec: number): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = Math.round((baseDelaySec + offsetSec) * fps);
  const local = frame - startFrame;
  const progress = spring({
    frame: local,
    fps,
    config: EDITORIAL_SPRING,
  });
  return progress;
}

// ─── Composition ───────────────────────────────────────────────────────
export const OutroFollowCTA9x16: React.FC<OutroFollowCTA9x16Props> = ({
  audioUrl,
  wordTimings,
  ctaTitle,
  ctaSubtitle,
  ctaAccentLine,
  handle,
  showMascot,
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
  // Resolve color stack
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
  const resolvedOnAccent = getPalette(palette).onAccent;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Staggered entry — each element offsets by 0.12s after the previous so the
  // eye can follow MASCOT → HERO → SUBTITLE → ACCENT → HANDLE → ICONS in order.
  const mascotProgress = useStaggeredProgress(0.0, enterSeconds);
  const heroProgress = useStaggeredProgress(0.12, enterSeconds);
  const subtitleProgress = useStaggeredProgress(0.24, enterSeconds);
  const accentProgress = useStaggeredProgress(0.36, enterSeconds);
  const handleProgress = useStaggeredProgress(0.48, enterSeconds);
  const iconsProgress = useStaggeredProgress(0.6, enterSeconds);

  // Map progress → (opacity, translateY) for the editorial settle.
  const settle = (p: number): { opacity: number; translateY: number } => ({
    opacity: interpolate(p, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translateY: interpolate(p, [0, 1], [14, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  });

  const heroSettle = settle(heroProgress);
  const subtitleSettle = settle(subtitleProgress);
  const accentSettle = settle(accentProgress);
  const handleSettle = settle(handleProgress);
  const iconsSettle = settle(iconsProgress);
  const mascotSettle = settle(mascotProgress);

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

      {/* Optional pixel mascot eyebrow */}
      {showMascot && (
        <div
          style={{
            position: "absolute",
            top: MASCOT_TOP_Y,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: mascotSettle.opacity,
            transform: `translateY(${mascotSettle.translateY}px)`,
          }}
        >
          <PixelMascot
            size={MASCOT_SIZE}
            primaryColor={resolvedAccent}
            secondaryColor={resolvedInk}
            bobAmplitude={6}
            bobHz={1.0}
          />
        </div>
      )}

      {/* Hero "SÍGUEME" */}
      <div
        style={{
          position: "absolute",
          top: HERO_TOP_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: 180,
          color: resolvedInk,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          opacity: heroSettle.opacity,
          transform: `translateY(${heroSettle.translateY}px)`,
        }}
      >
        {ctaTitle}
      </div>

      {/* Subtitle "PARA MÁS OPINIONES TÉCNICAS" */}
      <div
        style={{
          position: "absolute",
          top: HERO_TOP_Y + 180 + SUBTITLE_GAP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.mono,
          fontWeight: 500,
          fontSize: 32,
          color: resolvedMuted,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: subtitleSettle.opacity,
          transform: `translateY(${subtitleSettle.translateY}px)`,
        }}
      >
        {ctaSubtitle}
      </div>

      {/* Accent line "SOBRE IA" */}
      <div
        style={{
          position: "absolute",
          top: HERO_TOP_Y + 180 + SUBTITLE_GAP + 32 + ACCENT_GAP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 80,
          color: resolvedAccent,
          letterSpacing: "-0.01em",
          lineHeight: 1.0,
          opacity: accentSettle.opacity,
          transform: `translateY(${accentSettle.translateY}px)`,
        }}
      >
        {ctaAccentLine}
      </div>

      {/* Handle pill */}
      <div
        style={{
          position: "absolute",
          bottom: HANDLE_BOTTOM_Y,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: handleSettle.opacity,
          transform: `translateY(${handleSettle.translateY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 32px",
            borderRadius: 999,
            border: `2px solid ${resolvedAccent}`,
            background: resolvedAccent,
            color: resolvedOnAccent,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          {handle}
        </div>
      </div>

      {/* 4-icon footer row */}
      <div
        style={{
          position: "absolute",
          bottom: ICONS_BOTTOM_Y,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 56,
          opacity: iconsSettle.opacity,
          transform: `translateY(${iconsSettle.translateY}px)`,
        }}
      >
        {(["follow", "like", "comment", "save"] as IconKind[]).map((kind, i) => (
          <div
            key={kind}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FooterIcon kind={kind} color={resolvedMuted} size={36} />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontSize: 18,
                color: resolvedMuted,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {(["Sigue", "Like", "Comenta", "Guarda"] as const)[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Optional bottom captions */}
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
