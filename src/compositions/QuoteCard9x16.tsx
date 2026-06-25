/**
 * QuoteCard9x16 — vertical (1080×1920) editorial pull-quote card.
 *
 * Visual reference: Bloomberg Businessweek / The New Yorker pull-quote treatment.
 * Same house grammar as DiagramExplainer9x16 + TechNewsFlash9x16:
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccent()
 *   - optional BrandBreadcrumb at top
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional bottom EditorialCaption strip
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~80px from top)
 *   - Decorative oversized opening glyph "“" upper-left of quote zone (low-opacity accent)
 *   - Serif italic quote body, centered, spring-in scale+fade
 *   - Decorative oversized closing glyph "”" mirrored bottom-right of quote zone
 *   - Short accent divider line (draws from center outward)
 *   - Author block (sans uppercase tracking-spaced) + optional muted role line
 *   - EditorialCaption strip in bottom zone (toggleable via showCaptions)
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
import type { QuoteCard9x16Props } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
} from "../brand";
import type { PaletteMode } from "../brand";

// Layout constants — quote zone sits in the vertical sweet spot above the caption strip.
const QUOTE_ZONE_TOP = 460; // accounts for breadcrumb (~80px) + breathing room
const QUOTE_ZONE_WIDTH = 880;
const QUOTE_ZONE_LEFT = (1080 - QUOTE_ZONE_WIDTH) / 2;

// Oversized decorative quote glyphs (Bloomberg pull-quote treatment).
const GLYPH_FONT_SIZE = 240;
const GLYPH_OPACITY = 0.35;

// ─── Decorative oversized quote glyph ──────────────────────────────────
const QuoteGlyph: React.FC<{
  glyph: "open" | "close";
  accentColor: string;
  delaySec: number;
}> = ({ glyph, accentColor, delaySec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Offset the entire reveal by delaySec (black.one.studio "arrive late" hold).
  const localFrame = frame - Math.round(delaySec * fps);
  if (localFrame < 0) return null;

  // Plain fade-in over the first ~0.5s, no scale (per spec).
  const fadeIn = interpolate(localFrame, [0, Math.round(0.5 * fps)], [0, GLYPH_OPACITY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isOpen = glyph === "open";
  const positionStyle: React.CSSProperties = isOpen
    ? { top: QUOTE_ZONE_TOP - 40, left: QUOTE_ZONE_LEFT - 30 }
    : { top: QUOTE_ZONE_TOP + 360, right: QUOTE_ZONE_LEFT - 30 };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: GLYPH_FONT_SIZE,
        lineHeight: 1,
        fontWeight: 400,
        color: accentColor,
        opacity: fadeIn,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {isOpen ? "“" : "”"}
    </div>
  );
};

// ─── Quote body (serif italic, spring-in) ──────────────────────────────
const QuoteBody: React.FC<{
  quote: string;
  inkColor: string;
  paletteMode: PaletteMode;
  delaySec: number;
}> = ({ quote, inkColor, paletteMode, delaySec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Offset the entire reveal by delaySec (black.one.studio "arrive late" hold).
  const localFrame = frame - Math.round(delaySec * fps);
  if (localFrame < 0) return null;

  // Editorial spring (A1 audit): damping 22 / stiffness 130 / mass 0.7. Shared
  // with DiagramExplainer / BigNumberHero / BenchmarkBars / TweetCardHero. The
  // divider/author blocks below use slightly snappier (s=160 / s=140) variants
  // by design to stagger naturally on top of this base settle.
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.95, 1.0]);

  return (
    <div
      style={{
        position: "absolute",
        top: QUOTE_ZONE_TOP,
        left: QUOTE_ZONE_LEFT,
        width: QUOTE_ZONE_WIDTH,
        textAlign: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 70,
        lineHeight: 1.18,
        // A3 audit: dark-palette body text >30px sharpens with pure white
        // (cream ink anti-aliases soft on near-black at body sizes).
        color: getBodyTextColor(paletteMode, inkColor, 70),
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        letterSpacing: "-0.005em",
      }}
    >
      {quote}
    </div>
  );
};

// ─── Divider line (draws from center outward) ──────────────────────────
const Divider: React.FC<{
  topPx: number;
  accentColor: string;
  delaySec: number;
}> = ({ topPx, accentColor, delaySec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - Math.round(delaySec * fps);
  if (localFrame < 0) return null;

  const draw = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 160, mass: 0.6 },
  });
  const widthPx = interpolate(draw, [0, 1], [0, 72]);

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: widthPx,
          height: 3,
          background: accentColor,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// ─── Author block (uppercase sans + optional muted role) ───────────────
const AuthorBlock: React.FC<{
  author: string;
  authorRole?: string;
  accentColor: string;
  mutedColor: string;
  topPx: number;
  delaySec: number;
}> = ({ author, authorRole, accentColor, mutedColor, topPx, delaySec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - Math.round(delaySec * fps);
  if (localFrame < 0) return null;

  const enter = spring({
    frame: localFrame,
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
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 34,
          color: accentColor,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {author}
      </div>
      {authorRole && (
        <div
          style={{
            marginTop: 12,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 24,
            color: mutedColor,
            letterSpacing: "0.02em",
          }}
        >
          {authorRole}
        </div>
      )}
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const QuoteCard9x16: React.FC<QuoteCard9x16Props> = ({
  audioUrl,
  wordTimings,
  quote,
  author,
  authorRole,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
  revealDelaySeconds,
}) => {
  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default" (Zod schemas default to "").
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  // Subject-tool-tinted accent override (overrides palette accent if subjectTool set).
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Vertical rhythm below the quote body.
  // Quote body sits at QUOTE_ZONE_TOP and is ~3-4 lines tall (~340px max).
  // Divider lands a touch below it; author block follows.
  const DIVIDER_TOP = QUOTE_ZONE_TOP + 380;
  const AUTHOR_TOP = DIVIDER_TOP + 36;

  // black.one.studio "arrive late" hold: shift every reveal layer's entrance by
  // this offset so the whole tagline appears after a 40–60% empty-frame hold.
  // revealDelay=0 (default) keeps the original immediate-reveal choreography.
  const revealDelay = revealDelaySeconds;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay (cream uses subtle vignette, dark uses amber-tinted vignette) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (Carlos + DIYSmartCode pattern) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Decorative oversized opening quote glyph (low-opacity accent) */}
      <QuoteGlyph glyph="open" accentColor={resolvedAccent} delaySec={revealDelay} />

      {/* Quote body (serif italic, spring-in) */}
      <QuoteBody
        quote={quote}
        inkColor={resolvedInk}
        paletteMode={palette}
        delaySec={revealDelay}
      />

      {/* Decorative oversized closing quote glyph */}
      <QuoteGlyph glyph="close" accentColor={resolvedAccent} delaySec={revealDelay} />

      {/* Short accent divider (draws from center outward, ~0.55s after reveal) */}
      <Divider topPx={DIVIDER_TOP} accentColor={resolvedAccent} delaySec={revealDelay + 0.55} />

      {/* Author block (lands 0.3s after divider completes ≈ 0.85s + spring tail) */}
      <AuthorBlock
        author={author}
        authorRole={authorRole}
        accentColor={resolvedAccent}
        mutedColor={resolvedMuted}
        topPx={AUTHOR_TOP}
        delaySec={revealDelay + 0.95}
      />

      {/* Word-by-word captions (bottom zone) — optional */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 200,
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
