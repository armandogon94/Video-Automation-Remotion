/**
 * KineticTypoCard9x16 — vertical (1080×1920) Unfold-inspired film-frame card
 * with a layered kinetic-typography stack reveal and a diagonal brush-wipe
 * exit transition.
 *
 * Inspired by @builtbystephan reel `DYkyJfxx5Lx` (frames 3.45 → 4.14, scene
 * "Spent 40 years…"). Documented as NF-2 in
 * `docs/critiques/wave-3/stephan-vote4-redteam.md`:
 *
 *   "Two times in 28 seconds Stefan uses kinetic typography… This is core
 *    to his 'premium edit' aesthetic. We must build it."
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb at top (~y=80)
 *   - Centered "film-frame" card ~720×900 px
 *       · Warm-cream paper texture (#E8D9B8 base + radial grain)
 *       · L-bracket corner markers in ink (4 corners, ~50px legs, 3px stroke)
 *       · Top + bottom sprocket-hole strips (rectangular cutouts simulating
 *         film perforations, evenly spaced)
 *       · Top label `UNFOLD 2010TX` in tracking-spaced uppercase mono
 *       · Optional bottom-right small badge (date / sequence number)
 *   - 3–5 lines of bold ink type inside the card, revealed sequentially
 *     (per-line stagger ~0.25s) — each line scales 0.95 → 1.0 + opacity 0 → 1
 *     over ~0.3s
 *   - Optional diagonal brush-wipe exit: SVG mask wipes bottom-left →
 *     top-right over `brushWipeFrames`; card fades to 0 opacity as wipe
 *     completes.
 *
 * Motion grammar:
 *   - Card lands frame 0–9 (scale 0.96 → 1.0 + opacity 0 → 1).
 *   - Lines reveal sequentially after a ~0.2s settle, each with a soft spring.
 *   - Optional brush wipe runs in the LAST `brushWipeFrames` of the composition
 *     duration: card opacity ramps 1 → 0 against an animated SVG mask.
 */
import React, { useMemo } from "react";
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
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// Local schemas (mirror Sparkline9x16 / AnimatedCounter9x16 convention — the
// shared schemas.ts doesn't export the wordTimingSchema/breadcrumbSchema as
// named values yet; shared-schema migration is deferred work).
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

// ─── Schema ────────────────────────────────────────────────────────
export const kineticTypoCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  topLabel: z.string().default("UNFOLD 2010TX"),
  /** Lines to render inside the film-frame card. Each reveals sequentially. */
  lines: z.array(z.string()).default([]),
  /** Seconds between consecutive line reveals. */
  lineStaggerSeconds: z.number().min(0.05).max(3).default(0.25),
  /** Show brush-wipe exit transition. */
  showBrushWipe: z.boolean().default(true),
  /** Frames for the brush wipe. */
  brushWipeFrames: z.number().int().min(6).max(60).default(12),
  /** Bottom-right badge (optional, like date/sequence). */
  bottomBadge: z.string().optional(),
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
export type KineticTypoCard9x16Props = z.infer<typeof kineticTypoCard9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const CARD_WIDTH = 720;
const CARD_HEIGHT = 900;
const CARD_CENTER_X = 1080 / 2;
const CARD_CENTER_Y = 1920 / 2;
const CARD_LEFT = CARD_CENTER_X - CARD_WIDTH / 2;
const CARD_TOP = CARD_CENTER_Y - CARD_HEIGHT / 2;

const CORNER_LEG = 50;     // L-bracket leg length (px)
const CORNER_STROKE = 3;   // L-bracket stroke width
const CORNER_INSET = 22;   // distance from card edge to L-bracket

const SPROCKET_STRIP_H = 28;     // height of the perforation strip
const SPROCKET_HOLE_W = 24;
const SPROCKET_HOLE_H = 14;
const SPROCKET_HOLE_GAP = 18;

const TOP_LABEL_FONT_SIZE = 22;
const TOP_LABEL_OFFSET = SPROCKET_STRIP_H + 24;
const BOTTOM_BADGE_FONT_SIZE = 16;
const BOTTOM_BADGE_OFFSET = SPROCKET_STRIP_H + 18;

const TEXT_BLOCK_PAD_X = 60;
const TEXT_BLOCK_PAD_TOP = TOP_LABEL_OFFSET + 60;
const TEXT_BLOCK_PAD_BOTTOM = BOTTOM_BADGE_OFFSET + 60;

// Auto-shrink the per-line type so 1-line and 5-line stacks both fill nicely.
function lineFontSizeFor(lineCount: number, maxCharsInLine: number): number {
  // Base size scales with how many lines we have to fit vertically.
  const base = lineCount <= 2 ? 84 : lineCount === 3 ? 72 : lineCount === 4 ? 60 : 52;
  // Then shrink for long single-line content (e.g. 22+ chars).
  if (maxCharsInLine <= 12) return base;
  if (maxCharsInLine <= 18) return Math.round(base * 0.9);
  if (maxCharsInLine <= 24) return Math.round(base * 0.78);
  return Math.round(base * 0.66);
}

// ─── Composition ────────────────────────────────────────────────────
export const KineticTypoCard9x16: React.FC<KineticTypoCard9x16Props> = ({
  audioUrl,
  wordTimings,
  topLabel,
  lines,
  lineStaggerSeconds,
  showBrushWipe,
  brushWipeFrames,
  bottomBadge,
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
  const { fps, durationInFrames } = useVideoConfig();

  // Resolve color stack (palette defaults + per-color overrides).
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

  // The film-card paper is warm-cream regardless of outer palette (the card IS
  // a paper element sitting on the palette backdrop). Ink on the card is near-
  // black for ink-on-paper contrast. The outer palette only affects the
  // background canvas, breadcrumb, captions, and brush-wipe-exit overlay.
  const cardPaper = "#E8D9B8";
  const cardInk = "#16110A";
  const cardMuted = "#7A6A50";

  // Card landing — frames 0..9.
  const cardEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardScale = interpolate(cardEnter, [0, 1], [0.96, 1.0]);
  const cardOpacity = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lines reveal sequentially after a small settle.
  const settleFrames = Math.round(0.2 * fps);
  const staggerFrames = Math.max(1, Math.round(lineStaggerSeconds * fps));
  const lineRevealFrames = Math.round(0.3 * fps);

  // Brush-wipe exit — runs in the last `brushWipeFrames` of the composition.
  const wipeStart = Math.max(0, durationInFrames - brushWipeFrames);
  const wipeProgress = showBrushWipe
    ? interpolate(frame, [wipeStart, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const cardExitOpacity = showBrushWipe
    ? interpolate(wipeProgress, [0, 1], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Precompute typography sizing.
  const maxChars = useMemo(
    () => lines.reduce((m, l) => Math.max(m, l.length), 0),
    [lines],
  );
  const lineFontSize = useMemo(
    () => lineFontSizeFor(lines.length, maxChars),
    [lines.length, maxChars],
  );

  // Sprocket-hole strip — generate enough rectangles to span the card width.
  const sprocketCount = Math.floor(CARD_WIDTH / (SPROCKET_HOLE_W + SPROCKET_HOLE_GAP));
  const sprocketStartX =
    (CARD_WIDTH - sprocketCount * (SPROCKET_HOLE_W + SPROCKET_HOLE_GAP) + SPROCKET_HOLE_GAP) / 2;

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

      {/* The film-frame card (positioned absolute, centered) */}
      <div
        style={{
          position: "absolute",
          left: CARD_LEFT,
          top: CARD_TOP,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          opacity: cardOpacity * cardExitOpacity,
          transform: `scale(${cardScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Paper background + soft grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: cardPaper,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.18)",
          }}
        />
        {/* Subtle paper grain — radial gradient + a faint dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.06) 100%)",
            pointerEvents: "none",
            mixBlendMode: "multiply",
          }}
        />

        {/* Top sprocket-hole strip */}
        <SprocketStrip
          y={0}
          width={CARD_WIDTH}
          stripH={SPROCKET_STRIP_H}
          holeW={SPROCKET_HOLE_W}
          holeH={SPROCKET_HOLE_H}
          startX={sprocketStartX}
          gap={SPROCKET_HOLE_GAP}
          count={sprocketCount}
          paperColor={cardPaper}
          inkColor={cardInk}
        />

        {/* Bottom sprocket-hole strip */}
        <SprocketStrip
          y={CARD_HEIGHT - SPROCKET_STRIP_H}
          width={CARD_WIDTH}
          stripH={SPROCKET_STRIP_H}
          holeW={SPROCKET_HOLE_W}
          holeH={SPROCKET_HOLE_H}
          startX={sprocketStartX}
          gap={SPROCKET_HOLE_GAP}
          count={sprocketCount}
          paperColor={cardPaper}
          inkColor={cardInk}
        />

        {/* L-bracket corner markers (4 corners) */}
        <CornerBrackets
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          inset={CORNER_INSET}
          leg={CORNER_LEG}
          stroke={CORNER_STROKE}
          color={cardInk}
        />

        {/* Top label — UNFOLD 2010TX */}
        <div
          style={{
            position: "absolute",
            top: TOP_LABEL_OFFSET,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontWeight: 600,
            fontSize: TOP_LABEL_FONT_SIZE,
            color: cardInk,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          {topLabel}
        </div>

        {/* Text stack — sequential reveal */}
        <div
          style={{
            position: "absolute",
            top: TEXT_BLOCK_PAD_TOP,
            bottom: TEXT_BLOCK_PAD_BOTTOM,
            left: TEXT_BLOCK_PAD_X,
            right: TEXT_BLOCK_PAD_X,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: Math.round(lineFontSize * 0.12),
          }}
        >
          {lines.map((line, i) => {
            const lineStart = settleFrames + i * staggerFrames;
            const lineSpring = spring({
              frame: Math.max(0, frame - lineStart),
              fps,
              config: { damping: 22, stiffness: 130, mass: 0.7 },
            });
            const lineScale = interpolate(lineSpring, [0, 1], [0.95, 1.0]);
            const lineOpacity = interpolate(
              frame,
              [lineStart, lineStart + lineRevealFrames],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div
                key={`${i}-${line}`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: lineFontSize,
                  color: cardInk,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  opacity: lineOpacity,
                  transform: `scale(${lineScale})`,
                  transformOrigin: "center center",
                  maxWidth: "100%",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>

        {/* Optional bottom-right badge */}
        {bottomBadge && (
          <div
            style={{
              position: "absolute",
              bottom: BOTTOM_BADGE_OFFSET,
              right: 36,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontWeight: 500,
              fontSize: BOTTOM_BADGE_FONT_SIZE,
              color: cardMuted,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {bottomBadge}
          </div>
        )}

        {/* Brush-wipe overlay — diagonal bottom-left → top-right ink wipe */}
        {showBrushWipe && wipeProgress > 0 && (
          <BrushWipeOverlay
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            progress={wipeProgress}
            inkColor={cardInk}
          />
        )}
      </div>

      {/* Word-by-word captions in the bottom strip — opt-in (default off; the
          on-card text IS the text layer, captions would compete with it). */}
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

// ─── Sub-components ─────────────────────────────────────────────────

const SprocketStrip: React.FC<{
  y: number;
  width: number;
  stripH: number;
  holeW: number;
  holeH: number;
  startX: number;
  gap: number;
  count: number;
  paperColor: string;
  inkColor: string;
}> = ({ y, width, stripH, holeW, holeH, startX, gap, count, paperColor, inkColor }) => {
  const holes = Array.from({ length: count });
  const holeY = (stripH - holeH) / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width,
        height: stripH,
        background: paperColor,
        borderTop: `1px solid ${inkColor}22`,
        borderBottom: `1px solid ${inkColor}22`,
      }}
    >
      {holes.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: holeY,
            left: startX + i * (holeW + gap),
            width: holeW,
            height: holeH,
            background: inkColor,
            borderRadius: 3,
            opacity: 0.88,
          }}
        />
      ))}
    </div>
  );
};

const CornerBrackets: React.FC<{
  width: number;
  height: number;
  inset: number;
  leg: number;
  stroke: number;
  color: string;
}> = ({ width, height, inset, leg, stroke, color }) => {
  // Each corner = two thin rectangles meeting at the corner.
  const corners: Array<{
    h: { left: number; top: number; w: number; h: number };
    v: { left: number; top: number; w: number; h: number };
  }> = [
    {
      // top-left
      h: { left: inset, top: inset, w: leg, h: stroke },
      v: { left: inset, top: inset, w: stroke, h: leg },
    },
    {
      // top-right
      h: { left: width - inset - leg, top: inset, w: leg, h: stroke },
      v: { left: width - inset - stroke, top: inset, w: stroke, h: leg },
    },
    {
      // bottom-left
      h: { left: inset, top: height - inset - stroke, w: leg, h: stroke },
      v: { left: inset, top: height - inset - leg, w: stroke, h: leg },
    },
    {
      // bottom-right
      h: { left: width - inset - leg, top: height - inset - stroke, w: leg, h: stroke },
      v: { left: width - inset - stroke, top: height - inset - leg, w: stroke, h: leg },
    },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute",
              left: c.h.left,
              top: c.h.top,
              width: c.h.w,
              height: c.h.h,
              background: color,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: c.v.left,
              top: c.v.top,
              width: c.v.w,
              height: c.v.h,
              background: color,
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Diagonal brush-wipe overlay — an SVG that paints an ink-colored brush stroke
 * sweeping from bottom-left to top-right of the card. The stroke advances via
 * stroke-dashoffset; an opacity ramp follows so the wipe LEAVES rather than
 * remains.
 */
const BrushWipeOverlay: React.FC<{
  width: number;
  height: number;
  progress: number; // 0..1
  inkColor: string;
}> = ({ width, height, progress, inkColor }) => {
  // Brush path: diagonal arc from bottom-left to top-right, with two slight
  // bezier control points to give it an organic curve (not a straight line).
  const path = `M ${-30} ${height + 30} C ${width * 0.35} ${height * 0.85}, ${width * 0.65} ${height * 0.2}, ${width + 30} ${-30}`;
  // Approximate path length — diagonal of a slightly-curved arc across the
  // card. Slightly over-estimate so the dash fully covers when progress=1.
  const pathLen = Math.round(Math.sqrt(width * width + height * height) * 1.15);
  const dashOffset = pathLen * (1 - progress);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <path
        d={path}
        stroke={inkColor}
        strokeWidth={Math.max(120, Math.round(height * 0.18))}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={pathLen}
        strokeDashoffset={dashOffset}
        opacity={0.92}
      />
    </svg>
  );
};
