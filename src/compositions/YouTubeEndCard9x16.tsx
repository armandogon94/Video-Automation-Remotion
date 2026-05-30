/**
 * YouTubeEndCard9x16 — static YouTube-style end-card on hard cut, holds.
 *
 * Inspired by @simonhoiberg (wave-4 critique, HIGH-confidence #2):
 *   "Static YouTube end-card on hard cut, holds. Where most creators escalate
 *    motion at the CTA, Simon decelerates to a freeze. No motion graphics, no
 *    parallax, no shimmer."
 *
 * The whole signature is that nothing moves. By default `enterSeconds = 0`
 * means a HARD CUT IN — element is present from frame 0 with full opacity
 * and no spring/translate.
 *
 * Layout (centered, vertical sweet spot):
 *   - Full-frame blurred YouTube-style backdrop (or solid dark + radial pattern)
 *   - Optional YouTube red play glyph (~120px) above the call-to-action
 *   - "WATCH NOW" subtitle in white sans-heavy ~70px
 *   - Mock thumbnail card 720×450 — rounded 16px
 *       · Optional white L-corner brackets (60px legs) framing the thumb
 *       · Optional thumbnailSrc backing image
 *       · Title text (Inter Black ~120px) centered over the thumbnail
 *   - Optional cyan dashed callout arrows (Simon V3 N12) curving from origin
 *     points to calloutTargets — drawn STATICALLY (no draw-on animation)
 *   - Handle at bottom (mono uppercase ~36px)
 *
 * Schema covers Simon V3 N12's "cyan dashed callout arrows" pattern as
 * optional decoration — turn on with `showCalloutArrows: true` and supply
 * `calloutTargets`.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// Local schemas (mirror KineticTypoCard9x16 inline-schema convention).
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

const calloutTargetSchema = z.object({
  label: z.string(),
  xPx: z.number(),
  yPx: z.number(),
});

// ─── Schema ────────────────────────────────────────────────────────
export const youTubeEndCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Big title shown over the mock thumbnail. */
  title: z.string().default("AI CODING"),
  /** Subtitle / "Watch Now" prompt. */
  callToAction: z.string().default("WATCH NOW"),
  /** Channel handle. */
  handle: z.string().default("@armandointeligencia"),
  /** Mock thumbnail image (placeholder if empty). */
  thumbnailSrc: z.string().default(""),
  /** Show YouTube red glyph (default true). */
  showYouTubeGlyph: z.boolean().default(true),
  /** Show corner-bracket frame around the thumbnail (Simon V3 N12). */
  showCornerBrackets: z.boolean().default(true),
  /** Cyan dashed callout arrows from face to product cards (Simon V3 N12). */
  showCalloutArrows: z.boolean().default(false),
  /** Callout arrow targets (e.g. rank labels #1 / #2). */
  calloutTargets: z.array(calloutTargetSchema).default([]),
  /** Blurred YouTube interface as background bg (gradient if no asset). */
  blurredBgSrc: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  /** Static — no animation. Just appear + hold. Default 0 = hard cut. */
  enterSeconds: z.number().min(0).max(5).default(0),
  /** Show captions strip below. Default off (this is a freeze CTA). */
  showCaptions: z.boolean().default(false),
  captionFontSize: z.number().min(20).max(120).default(38),
  brandId: z.string().optional(),
});
export type YouTubeEndCard9x16Props = z.infer<typeof youTubeEndCard9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

const GLYPH_SIZE = 120;
const GLYPH_TOP = 540;

const CTA_TOP = 690;
const CTA_FONT_SIZE = 70;

const THUMB_W = 720;
const THUMB_H = 450;
const THUMB_TOP = 820;
const THUMB_LEFT = (FRAME_W - THUMB_W) / 2;

const BRACKET_LEG = 60;
const BRACKET_STROKE = 6;
const BRACKET_INSET = -18; // brackets sit slightly outside the thumbnail

const HANDLE_BOTTOM = 220;
const HANDLE_FONT_SIZE = 36;

// YouTube red.
const YT_RED = "#FF0033";
// Default callout cyan (matches YouTubeCalloutArrows9x16 default).
const CALLOUT_CYAN = "#5BC0E8";

// ─── YouTube play glyph (rounded-rect + triangle) ──────────────────
const YouTubeGlyph: React.FC<{ top: number; visible: boolean }> = ({ top, visible }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <svg width={GLYPH_SIZE * 1.4} height={GLYPH_SIZE} viewBox="0 0 168 120">
        <rect x="0" y="0" width="168" height="120" rx="28" ry="28" fill={YT_RED} />
        <polygon points="64,32 64,88 116,60" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

// ─── Corner-bracket frame around the thumbnail ─────────────────────
const CornerBrackets: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  stroke: string;
}> = ({ left, top, width, height, stroke }) => {
  const x1 = left - BRACKET_INSET;
  const y1 = top - BRACKET_INSET;
  const x2 = left + width + BRACKET_INSET;
  const y2 = top + height + BRACKET_INSET;
  // Each bracket is two lines forming an L.
  const lines: Array<[number, number, number, number]> = [
    // top-left
    [x1, y1, x1 + BRACKET_LEG, y1],
    [x1, y1, x1, y1 + BRACKET_LEG],
    // top-right
    [x2, y1, x2 - BRACKET_LEG, y1],
    [x2, y1, x2, y1 + BRACKET_LEG],
    // bottom-left
    [x1, y2, x1 + BRACKET_LEG, y2],
    [x1, y2, x1, y2 - BRACKET_LEG],
    // bottom-right
    [x2, y2, x2 - BRACKET_LEG, y2],
    [x2, y2, x2, y2 - BRACKET_LEG],
  ];
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: FRAME_H,
        pointerEvents: "none",
      }}
    >
      {lines.map(([lx1, ly1, lx2, ly2], i) => (
        <line
          key={i}
          x1={lx1}
          y1={ly1}
          x2={lx2}
          y2={ly2}
          stroke={stroke}
          strokeWidth={BRACKET_STROKE}
          strokeLinecap="square"
        />
      ))}
    </svg>
  );
};

// ─── Static cyan dashed callout arrow (no draw-on animation) ───────
const StaticCalloutArrow: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  label: string;
}> = ({ fromX, fromY, toX, toY, color, label }) => {
  // Quadratic Bezier with a slight bend.
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  // Perpendicular bend: 80px off the midpoint, biased toward the upper side.
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const bend = 90;
  const cx = midX + nx * bend;
  const cy = midY + ny * bend;
  // Arrowhead direction at the target.
  const ahLen = 22;
  const ahWidth = 14;
  const tdx = toX - cx;
  const tdy = toY - cy;
  const tlen = Math.max(1, Math.hypot(tdx, tdy));
  const tnx = tdx / tlen;
  const tny = tdy / tlen;
  // Perpendicular
  const pnx = -tny;
  const pny = tnx;
  const ax1 = toX - tnx * ahLen + pnx * ahWidth;
  const ay1 = toY - tny * ahLen + pny * ahWidth;
  const ax2 = toX - tnx * ahLen - pnx * ahWidth;
  const ay2 = toY - tny * ahLen - pny * ahWidth;
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FRAME_W,
        height: FRAME_H,
        pointerEvents: "none",
      }}
    >
      <path
        d={`M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`}
        stroke={color}
        strokeWidth={4}
        strokeDasharray="12 8"
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        points={`${toX},${toY} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
      />
      {/* Label sits near the origin */}
      <text
        x={fromX}
        y={fromY - 14}
        fill={color}
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="34"
        textAnchor="middle"
        style={{ letterSpacing: "0.04em" }}
      >
        {label}
      </text>
    </svg>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const YouTubeEndCard9x16: React.FC<YouTubeEndCard9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  callToAction,
  handle,
  thumbnailSrc,
  showYouTubeGlyph,
  showCornerBrackets,
  showCalloutArrows,
  calloutTargets,
  blurredBgSrc,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  enterSeconds,
  showCaptions,
  captionFontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Static — Simon's signature is NO motion at the CTA. We support a tiny
  // `enterSeconds` ramp so callers can soften the hard cut if they want,
  // but the DEFAULT is 0 and the whole composition is otherwise immobile.
  const enterFrames = Math.max(0, Math.round(enterSeconds * fps));
  const opacity =
    enterFrames === 0
      ? 1
      : interpolate(frame, [0, enterFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Background: blurred image if provided, otherwise a dark radial pattern.
  // We deliberately do NOT animate the backdrop.
  const bgImage = blurredBgSrc
    ? blurredBgSrc.startsWith("http")
      ? blurredBgSrc
      : staticFile(blurredBgSrc)
    : null;

  const thumbBacking = thumbnailSrc
    ? thumbnailSrc.startsWith("http")
      ? thumbnailSrc
      : staticFile(thumbnailSrc)
    : null;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Backdrop — blurred YouTube interface or a dark radial fallback. */}
      <AbsoluteFill
        style={{
          background: bgImage
            ? `url(${bgImage}) center / cover no-repeat`
            : `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%), ${resolvedInk}`,
          filter: bgImage ? "blur(28px) brightness(0.5)" : "none",
          opacity,
        }}
      />

      {/* Palette grain (kept for house consistency, screen-blended on dark). */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
          opacity,
        }}
      />

      {/* Optional breadcrumb (sits above the freeze CTA). */}
      {breadcrumb && (
        <div style={{ opacity }}>
          <BrandBreadcrumb
            text={breadcrumb.text}
            date={breadcrumb.date}
            accentColor={resolvedAccent}
          />
        </div>
      )}

      {/* YouTube red play glyph. */}
      <div style={{ opacity }}>
        <YouTubeGlyph top={GLYPH_TOP} visible={showYouTubeGlyph} />
      </div>

      {/* WATCH NOW subtitle. */}
      <div
        style={{
          position: "absolute",
          top: CTA_TOP,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: CTA_FONT_SIZE,
          letterSpacing: "0.08em",
          color: "#FFFFFF",
          textTransform: "uppercase",
          opacity,
        }}
      >
        {callToAction}
      </div>

      {/* Mock thumbnail card. */}
      <div
        style={{
          position: "absolute",
          left: THUMB_LEFT,
          top: THUMB_TOP,
          width: THUMB_W,
          height: THUMB_H,
          borderRadius: 16,
          overflow: "hidden",
          background: thumbBacking
            ? `url(${thumbBacking}) center / cover no-repeat`
            : `linear-gradient(135deg, #1a1f2e 0%, #2a3142 100%)`,
          boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
          opacity,
        }}
      >
        {/* Title overlay sits inside the thumbnail. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: thumbBacking
              ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)"
              : "transparent",
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: 120,
              lineHeight: 0.95,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              textAlign: "center",
              padding: "0 32px",
              textShadow: "0 4px 18px rgba(0,0,0,0.6)",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
        </div>
      </div>

      {/* Optional corner-bracket frame. */}
      {showCornerBrackets && (
        <div style={{ opacity }}>
          <CornerBrackets
            left={THUMB_LEFT}
            top={THUMB_TOP}
            width={THUMB_W}
            height={THUMB_H}
            stroke="#FFFFFF"
          />
        </div>
      )}

      {/* Optional callout arrows (Simon V3 N12). */}
      {showCalloutArrows && calloutTargets.length > 0 && (
        <div style={{ opacity }}>
          {calloutTargets.map((target, i) => {
            // Origin point: alternate between left/right of the thumbnail.
            const fromX = i % 2 === 0 ? THUMB_LEFT - 80 : THUMB_LEFT + THUMB_W + 80;
            const fromY = THUMB_TOP + THUMB_H / 2;
            return (
              <StaticCalloutArrow
                key={i}
                fromX={fromX}
                fromY={fromY}
                toX={target.xPx}
                toY={target.yPx}
                color={CALLOUT_CYAN}
                label={target.label}
              />
            );
          })}
        </div>
      )}

      {/* Handle bottom. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: HANDLE_BOTTOM,
          textAlign: "center",
          fontFamily: FONT_STACKS.mono,
          fontWeight: 500,
          fontSize: HANDLE_FONT_SIZE,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity,
        }}
      >
        {handle}
      </div>

      {/* Optional captions strip (off by default — this is a freeze CTA). */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 100,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${colors.muted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
