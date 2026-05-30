/**
 * CircularLogoCarousel9x16 — vertical (1080×1920) clockwise-circular logo
 * carousel for tool/brand line-ups. Logos appear sequentially around a
 * central point (12 o'clock first, then clockwise), each entering with a
 * spring scale-in tied to an audio-anchored stagger.
 *
 * Pattern source: spotted on @builtbystephan reel `DYkyJfxx5Lx` — a
 * recurring "vs. line-up" visual where 6–8 tool logos materialise one at a
 * time around the perimeter of a circle, often around a central "VS" or
 * subject title, with a tight stagger (~0.2–0.3s) that feels percussive
 * against the voiceover.
 *
 * Sprint 2 / Wave-2 house grammar (consistent with TweetCardHero9x16 et al):
 *   - cream/dark palette resolution via inline resolveColors (since brand
 *     module is off-limits in this worktree)
 *   - optional BrandBreadcrumb at top (inline component)
 *   - optional centered title above the carousel zone
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - opt-in bottom caption strip (default OFF — the carousel speaks for itself)
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80, floats over paper)
 *   - Optional centered title (~y=350, Inter 700 ~58px, ink)
 *   - CIRCULAR CAROUSEL ZONE (centered at ~y=1050, ~900px × 900px):
 *       · Optional centerText label (Inter 800 ~96px, accent or ink)
 *       · Logo cards distributed on a circle (default radius 360px).
 *         Default 6–8 logos auto-distributed clockwise starting at 12 o'clock.
 *       · Each card: ~140×140px rounded-rect, white background, padding 16px,
 *         holds an <Img> (objectFit: contain). Optional brandName label
 *         below the card in small mono caps.
 *   - Optional caption strip (~y=1760, opt-in)
 *
 * Motion grammar:
 *   - Title fades in over ~0.3s starting at frame 0.
 *   - Center text fades in 0.15s after title.
 *   - Logo[i] enters at `logoStaggerSeconds * i` (default 0.25s — fast pace)
 *     with a spring scale 0.6 → 1.0 + opacity 0 → 1 + arc translation from
 *     ~140px offset toward final position. Spring config matches Sprint 1
 *     editorial profile (damping 22 / stiffness 130 / mass 0.7).
 *   - Continuous rotation: optional `continuousRotationDegPerSec` rotates the
 *     entire carousel block (logos counter-rotate so they stay upright).
 *     Default 0 (off).
 *   - Audio anchor: `audioAnchorKeyword` if found in wordTimings shifts the
 *     start of all logo reveals to the moment that word is spoken.
 *
 * Position math: for logo i with angle θ (degrees, 0=12 o'clock, clockwise):
 *   x = cx + r * sin(θ · π/180)
 *   y = cy − r * cos(θ · π/180)   (screen y grows downward, hence minus)
 */
import React, { useMemo } from "react";
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

// ─── Locally-declared schemas (worktree isolation: no schemas.ts/brand imports) ───

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

const logoEntrySchema = z.object({
  src: z.string(),
  brandName: z.string().optional(),
  /** Optional explicit angle in degrees (0=12 o'clock, 90=3 o'clock, clockwise). Auto-distributed if absent. */
  positionAngle: z.number().min(0).max(360).optional(),
});
export type CircularLogo = z.infer<typeof logoEntrySchema>;

export const circularLogoCarousel9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  centerText: z.string().optional(),
  logos: z.array(logoEntrySchema).default([]),
  /** Seconds between consecutive logo entrances. Default 0.25s (fast/percussive). */
  logoStaggerSeconds: z.number().min(0.05).max(3).default(0.25),
  /** Radius of the circle (px from center). Default 360. */
  carouselRadiusPx: z.number().min(100).max(500).default(360),
  /** Per-logo card size (px). Default 140. */
  logoCardSizePx: z.number().min(60).max(300).default(140),
  /** When set + found in wordTimings, the carousel reveal starts at that word's spoken time. */
  audioAnchorKeyword: z.string().optional(),
  /** Continuous rotation in degrees per second (negative=ccw). Default 0 (no continuous rotation). */
  continuousRotationDegPerSec: z.number().default(0),
  /** Show brand names under logos. */
  showBrandNames: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type CircularLogoCarousel9x16Props = z.infer<typeof circularLogoCarousel9x16Schema>;

// ─── Inline brand resolution (mirrors src/brand from main branch) ────────

type Palette = "cream" | "dark";

const PALETTES: Record<
  Palette,
  { paper: string; ink: string; accent: string; muted: string; grainOverlay: string }
> = {
  // Cream palette: warm editorial paper with deep navy ink + gold accent
  cream: {
    paper: "#F5EFE3",
    ink: "#0F1B2D",
    accent: "#D4AF37",
    muted: "#6F6A5F",
    grainOverlay:
      "radial-gradient(circle at 30% 20%, rgba(15,27,45,0.06) 0%, transparent 60%)",
  },
  // Dark palette: deep navy paper + cream ink + gold accent (Armando Inteligencia)
  dark: {
    paper: "#0F1B2D",
    ink: "#F5EFE3",
    accent: "#D4AF37",
    muted: "#8A93A4",
    grainOverlay:
      "radial-gradient(circle at 70% 20%, rgba(245,239,227,0.05) 0%, transparent 60%)",
  },
};

function resolveColors(
  palette: Palette,
  overrides: { paper?: string; ink?: string; accent?: string; muted?: string },
) {
  const base = PALETTES[palette];
  return {
    paper: overrides.paper ?? base.paper,
    ink: overrides.ink ?? base.ink,
    accent: overrides.accent ?? base.accent,
    muted: overrides.muted ?? base.muted,
  };
}

function getGrain(palette: Palette): string {
  return PALETTES[palette].grainOverlay;
}

/**
 * Subject-tool accent overrides — when known, the accent color is sourced
 * from the tool's brand palette so logos read as "this is about Tool X".
 * Tiny built-in table; mirrors the spirit of brand/tools-palette.
 */
const TOOL_ACCENTS: Record<string, string> = {
  openai: "#10A37F",
  chatgpt: "#10A37F",
  anthropic: "#D97757",
  claude: "#D97757",
  google: "#4285F4",
  gemini: "#4285F4",
  meta: "#0866FF",
  llama: "#0866FF",
  microsoft: "#00A4EF",
  copilot: "#00A4EF",
};

function getToolAccent(tool: string): string | null {
  return TOOL_ACCENTS[tool.toLowerCase()] ?? null;
}

// ─── Inline BrandBreadcrumb (matches house grammar shape) ────────────────

const BrandBreadcrumb: React.FC<{
  text: string;
  date?: string;
  accentColor: string;
}> = ({ text, date, accentColor }) => (
  <div
    style={{
      position: "absolute",
      top: 80,
      left: 60,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      fontSize: 24,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: accentColor,
        display: "inline-block",
      }}
    />
    <span style={{ color: accentColor }}>{text}</span>
    {date && (
      <span style={{ color: accentColor, opacity: 0.6, marginLeft: 6 }}>
        · {date}
      </span>
    )}
  </div>
);

// ─── Layout constants ────────────────────────────────────────────────────

const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const CAROUSEL_CENTER_X = FRAME_WIDTH / 2;
const CAROUSEL_CENTER_Y = 1050; // sits below the optional title, above optional caption
const TITLE_TOP = 350;
const ENTRY_ARC_DISTANCE = 140; // px the logo travels from its arc-offset toward final position

// ─── Helpers ─────────────────────────────────────────────────────────────

function resolveImageSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

function resolveAudioSrc(raw: string): string {
  return raw.startsWith("http") ? raw : staticFile(raw);
}

function findKeywordStartSeconds(
  wordTimings: CircularLogoCarousel9x16Props["wordTimings"],
  keyword: string,
): number | null {
  if (!keyword) return null;
  const needle = keyword.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "");
  if (!needle) return null;
  for (const w of wordTimings) {
    const haystack = w.text.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "");
    if (haystack === needle) return w.startSeconds;
  }
  return null;
}

/**
 * Compute the (x, y) on the circle for a given angle in degrees, where
 * 0 = 12 o'clock, 90 = 3 o'clock, growing clockwise.
 */
function angleToXY(
  angleDeg: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad), // minus because screen y grows downward
  };
}

// ─── Single logo card ────────────────────────────────────────────────────

const LogoCard: React.FC<{
  logo: CircularLogo;
  index: number;
  angleDeg: number;
  cardSize: number;
  radius: number;
  cx: number;
  cy: number;
  staggerFrames: number;
  startFrame: number;
  showBrandName: boolean;
  counterRotationDeg: number;
  inkColor: string;
  mutedColor: string;
}> = ({
  logo,
  index,
  angleDeg,
  cardSize,
  radius,
  cx,
  cy,
  staggerFrames,
  startFrame,
  showBrandName,
  counterRotationDeg,
  inkColor,
  mutedColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame - index * staggerFrames;
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  // Pre-roll: logo is fully hidden before its slot starts.
  const visible = localFrame >= 0;
  const opacity = visible ? interpolate(enter, [0, 1], [0, 1]) : 0;
  const scale = visible ? interpolate(enter, [0, 1], [0.6, 1.0]) : 0.6;

  // Final resting position on the circle.
  const final = angleToXY(angleDeg, radius, cx, cy);
  // Entry arc: start slightly further out along the same radial direction,
  // then ease into the final spot.
  const entryRadius = radius + ENTRY_ARC_DISTANCE;
  const entry = angleToXY(angleDeg, entryRadius, cx, cy);
  const renderX = visible
    ? interpolate(enter, [0, 1], [entry.x, final.x])
    : entry.x;
  const renderY = visible
    ? interpolate(enter, [0, 1], [entry.y, final.y])
    : entry.y;

  const imgSrc = resolveImageSrc(logo.src);
  const labelMaxWidth = cardSize + 40;

  return (
    <div
      style={{
        position: "absolute",
        left: renderX - cardSize / 2,
        top: renderY - cardSize / 2,
        width: cardSize,
        opacity,
        // Counter-rotate so the logo stays upright even when the parent carousel rotates.
        transform: `scale(${scale}) rotate(${counterRotationDeg}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          width: cardSize,
          height: cardSize,
          background: "#FFFFFF",
          borderRadius: Math.round(cardSize * 0.18),
          boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          padding: 16,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imgSrc ? (
          <Img
            src={imgSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `${mutedColor}22`,
              borderRadius: 8,
            }}
          />
        )}
      </div>
      {showBrandName && logo.brandName && (
        <div
          style={{
            marginTop: 10,
            width: labelMaxWidth,
            marginLeft: (cardSize - labelMaxWidth) / 2,
            textAlign: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: inkColor,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {logo.brandName}
        </div>
      )}
    </div>
  );
};

// ─── Optional opt-in bottom caption strip ────────────────────────────────

const InlineCaptionStrip: React.FC<{
  wordTimings: CircularLogoCarousel9x16Props["wordTimings"];
  fontSize: number;
  accentColor: string;
  inkColor: string;
  paperColor: string;
  mutedBorderColor: string;
}> = ({ wordTimings, fontSize, accentColor, inkColor, paperColor, mutedBorderColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSeconds = frame / fps;

  // Find the active word window (5-word rolling buffer).
  const activeIndex = wordTimings.findIndex(
    (w) => currentSeconds >= w.startSeconds && currentSeconds <= w.endSeconds,
  );
  if (activeIndex < 0) return null;

  const start = Math.max(0, activeIndex - 2);
  const window = wordTimings.slice(start, start + 5);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 60,
        padding: "18px 28px",
        background: `${paperColor}E6`,
        border: `1px solid ${mutedBorderColor}`,
        borderRadius: 16,
        fontFamily: "Inter, sans-serif",
        fontSize,
        fontWeight: 600,
        color: inkColor,
        textAlign: "center",
        letterSpacing: "-0.01em",
        lineHeight: 1.25,
        maxWidth: 920,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {window.map((w, i) => {
        const isActive = start + i === activeIndex;
        return (
          <span
            key={`${w.text}-${w.startFrame}-${i}`}
            style={{
              color: isActive ? accentColor : inkColor,
              marginRight: 8,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────

export const CircularLogoCarousel9x16: React.FC<CircularLogoCarousel9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  centerText,
  logos,
  logoStaggerSeconds,
  carouselRadiusPx,
  logoCardSizePx,
  audioAnchorKeyword,
  continuousRotationDegPerSec,
  showBrandNames,
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
  // Empty string in a color prop = "use palette default".
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const subjectAccent = subjectTool ? getToolAccent(subjectTool) : null;
  const resolvedAccent = subjectAccent ?? colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getGrain(palette);

  // Anchor frame for the entire reveal: either when the keyword is spoken, or 0.
  const anchorFrame = useMemo(() => {
    if (!audioAnchorKeyword) return 0;
    const seconds = findKeywordStartSeconds(wordTimings, audioAnchorKeyword);
    if (seconds === null) return 0;
    return Math.round(seconds * fps);
  }, [audioAnchorKeyword, wordTimings, fps]);

  const staggerFrames = Math.max(1, Math.round(logoStaggerSeconds * fps));

  // Title + center entry animations (relative to absolute frame 0, so they're
  // already on-screen by the time the audio-anchored carousel kicks in).
  const titleProgress = interpolate(frame, [0, Math.round(0.3 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const centerStart = Math.round(0.15 * fps);
  const centerProgress = interpolate(
    frame,
    [centerStart, centerStart + Math.round(0.3 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Auto-distribute logos that don't carry an explicit positionAngle.
  // Logos with explicit angles keep them; the rest fill the remaining slots
  // evenly, starting at 12 o'clock and going clockwise.
  const carouselAngles = useMemo(() => {
    const total = logos.length;
    if (total === 0) return [] as number[];
    const angles: (number | null)[] = logos.map((l) =>
      typeof l.positionAngle === "number" ? l.positionAngle : null,
    );
    const autoIndices: number[] = [];
    angles.forEach((a, i) => {
      if (a === null) autoIndices.push(i);
    });
    autoIndices.forEach((idx, i) => {
      angles[idx] = (i / autoIndices.length) * 360;
    });
    return angles as number[];
  }, [logos]);

  // Continuous rotation of the entire carousel (degrees).
  const continuousRotation = (continuousRotationDegPerSec * frame) / fps;
  // Counter-rotation so each logo card stays upright.
  const counterRotation = -continuousRotation;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && <Audio src={resolveAudioSrc(audioUrl)} />}

      {/* Palette-driven grain overlay — same convention as other Wave-2 comps */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (top-left) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional centered title above the carousel */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: TITLE_TOP,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 58,
            color: resolvedInk,
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [12, 0])}px)`,
          }}
        >
          {title}
        </div>
      )}

      {/* Carousel zone — continuously rotates as a whole when enabled.
          Positioned as a full-frame absolute layer so children can be
          placed in absolute coords relative to the frame. */}
      <AbsoluteFill
        style={{
          transform: `rotate(${continuousRotation}deg)`,
          transformOrigin: `${CAROUSEL_CENTER_X}px ${CAROUSEL_CENTER_Y}px`,
        }}
      >
        {/* Optional center text ("VS", "→", a subject label, etc.) */}
        {centerText && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: CAROUSEL_CENTER_Y - 64,
              textAlign: "center",
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 96,
              color: resolvedAccent,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              opacity: centerProgress,
              transform: `rotate(${counterRotation}deg) scale(${interpolate(centerProgress, [0, 1], [0.85, 1])})`,
              transformOrigin: "center center",
            }}
          >
            {centerText}
          </div>
        )}

        {/* The logo cards on the circle */}
        {logos.map((logo, i) => (
          <LogoCard
            key={`${logo.src}-${i}`}
            logo={logo}
            index={i}
            angleDeg={carouselAngles[i] ?? 0}
            cardSize={logoCardSizePx}
            radius={carouselRadiusPx}
            cx={CAROUSEL_CENTER_X}
            cy={CAROUSEL_CENTER_Y}
            staggerFrames={staggerFrames}
            startFrame={anchorFrame}
            showBrandName={showBrandNames}
            counterRotationDeg={counterRotation}
            inkColor={resolvedInk}
            mutedColor={resolvedMuted}
          />
        ))}
      </AbsoluteFill>

      {/* Opt-in bottom caption strip (default OFF — the carousel speaks for itself) */}
      {showCaptions && (
        <InlineCaptionStrip
          wordTimings={wordTimings}
          fontSize={captionFontSize}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          paperColor={resolvedPaper}
          mutedBorderColor={`${resolvedMuted}33`}
        />
      )}
    </AbsoluteFill>
  );
};
