/**
 * YouTubeCalloutArrows9x16 — standalone "cyan dashed callout arrows" pattern.
 *
 * Inspired by @simonhoiberg (wave-4 V3 N12 redteam):
 *   "N12: cyan dashed callout arrows + thumbnail-face. Simon labels the parts
 *    of his thumbnail in real time with dashed cyan lines, locking attention
 *    on specific spots."
 *
 * This template is an overlay-rich variant of a thumbnail / product-shot
 * composition: a centered image with cyan dashed-arrow callouts pointing to
 * specific spots. Each callout draws in via stroke-dashoffset animation.
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Centered image card (~720×900) at Y range 700-1100
 *   - Optional heroLabel (Inter Black ~80px) over the image
 *   - For each callout: SVG path from label origin to target (quadratic Bezier),
 *     stroke-dasharray "12 8", stroke-width 4, in `color` (default cyan)
 *   - Each callout LABEL renders at the label coordinates (white sans heavy w/
 *     cyan accent underline / chip)
 *   - Optional EditorialCaption strip at bottom
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
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// Local schemas.
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

const calloutSchema = z.object({
  /** Where the arrow tip lands (frame coordinates). */
  targetXPx: z.number(),
  targetYPx: z.number(),
  /** Where the label sits. */
  labelXPx: z.number(),
  labelYPx: z.number(),
  label: z.string(),
  /** Arrow color. Default cyan #5BC0E8. */
  color: z.string().optional(),
  /** Optional per-callout delay in seconds (relative to enterSeconds). */
  delaySeconds: z.number().optional(),
});

// ─── Schema ────────────────────────────────────────────────────────
export const youTubeCalloutArrows9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Main image (centered ~720×900). Empty = placeholder card. */
  imageSrc: z.string().default(""),
  /** Hero word over the image. */
  heroLabel: z.string().default(""),
  callouts: z.array(calloutSchema).default([]),
  /** Arrows are dashed by default. */
  arrowDashed: z.boolean().default(true),
  /** Should arrows draw in via stroke-dashoffset animation. */
  animateArrows: z.boolean().default(true),
  sectionLabel: z.string().default("LOOK HERE"),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  enterSeconds: z.number().min(0).max(5).default(0.4),
  staggerSeconds: z.number().min(0).max(3).default(0.25),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type YouTubeCalloutArrows9x16Props = z.infer<
  typeof youTubeCalloutArrows9x16Schema
>;

// ─── Layout constants ──────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

const IMAGE_W = 720;
const IMAGE_H = 900;
const IMAGE_TOP = 580;
const IMAGE_LEFT = (FRAME_W - IMAGE_W) / 2;

const HERO_LABEL_FONT_SIZE = 80;

const SECTION_LABEL_TOP = 360;

const CALLOUT_CYAN = "#5BC0E8";

// ─── Section label ─────────────────────────────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_TOP,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize: 36,
        color: accentColor,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Image card (centered) ─────────────────────────────────────────
const ImageCard: React.FC<{
  imageSrc: string | null;
  heroLabel: string;
  enterFrame: number;
}> = ({ imageSrc, heroLabel, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.96, 1.0]);
  return (
    <div
      style={{
        position: "absolute",
        left: IMAGE_LEFT,
        top: IMAGE_TOP,
        width: IMAGE_W,
        height: IMAGE_H,
        borderRadius: 18,
        overflow: "hidden",
        background: imageSrc
          ? `url(${imageSrc}) center / cover no-repeat`
          : `linear-gradient(135deg, #1a1f2e 0%, #2a3142 100%)`,
        boxShadow: "0 16px 44px rgba(0,0,0,0.5)",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {heroLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: imageSrc
              ? "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 100%)"
              : "transparent",
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: HERO_LABEL_FONT_SIZE,
              color: "#FFFFFF",
              letterSpacing: "-0.015em",
              textAlign: "center",
              padding: "0 24px",
              textShadow: "0 4px 14px rgba(0,0,0,0.6)",
              textTransform: "uppercase",
              lineHeight: 1.0,
            }}
          >
            {heroLabel}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Single callout: dashed-arrow path + label chip ────────────────
const Callout: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  label: string;
  dashed: boolean;
  animate: boolean;
  enterFrame: number;
}> = ({ fromX, fromY, toX, toY, color, label, dashed, animate, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Path geometry (quadratic Bezier with a slight bend perpendicular to
  // the straight line from origin → target).
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const bend = 80;
  const cx = midX + nx * bend;
  const cy = midY + ny * bend;

  // Approximate arc length for stroke-dasharray animation. We slightly
  // overestimate so the line fully draws before the dash pattern wraps.
  const approxLen = Math.hypot(cx - fromX, cy - fromY) + Math.hypot(toX - cx, toY - cy);

  // Draw-in progress (0 → 1 over ~0.4s).
  const drawDuration = Math.max(1, Math.round(0.4 * fps));
  const drawProgress = animate
    ? interpolate(localFrame, [0, drawDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Draw the whole path with the dash pattern AND clip via stroke-dashoffset
  // for the draw-on animation. We pass `pathLength` so the dashoffset value
  // maps directly to our approxLen reference frame.
  const dashOffset = animate ? approxLen * (1 - drawProgress) : 0;

  // Arrowhead direction at the target.
  const ahLen = 22;
  const ahWidth = 14;
  const tdx = toX - cx;
  const tdy = toY - cy;
  const tlen = Math.max(1, Math.hypot(tdx, tdy));
  const tnx = tdx / tlen;
  const tny = tdy / tlen;
  const pnx = -tny;
  const pny = tnx;
  const ax1 = toX - tnx * ahLen + pnx * ahWidth;
  const ay1 = toY - tny * ahLen + pny * ahWidth;
  const ax2 = toX - tnx * ahLen - pnx * ahWidth;
  const ay2 = toY - tny * ahLen - pny * ahWidth;
  const arrowheadOpacity = drawProgress > 0.85 ? (drawProgress - 0.85) / 0.15 : 0;

  // Label chip appears as the arrow lands.
  const labelOpacity = animate
    ? interpolate(localFrame, [0, drawDuration / 2, drawDuration], [0, 0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const labelTranslateY = interpolate(labelOpacity, [0, 1], [10, 0]);

  return (
    <>
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
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashed ? "12 8" : undefined}
          // stroke-dashoffset gives us a clean draw-on for both dashed and solid
          // paths without exotic dashArray gymnastics.
          strokeDashoffset={animate ? dashOffset : undefined}
          pathLength={animate ? approxLen : undefined}
        />
        {arrowheadOpacity > 0 && (
          <polygon
            points={`${toX},${toY} ${ax1},${ay1} ${ax2},${ay2}`}
            fill={color}
            opacity={arrowheadOpacity}
          />
        )}
      </svg>
      {/* Label chip rendered as HTML so we get proper font rendering. */}
      <div
        style={{
          position: "absolute",
          left: fromX,
          top: fromY,
          transform: `translate(-50%, -100%) translateY(${labelTranslateY}px)`,
          opacity: labelOpacity,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            color: "#0F1B2D",
            padding: "8px 18px",
            borderRadius: 999,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: "-0.01em",
            border: `3px solid ${color}`,
            boxShadow: `0 8px 20px ${color}44`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const YouTubeCalloutArrows9x16: React.FC<YouTubeCalloutArrows9x16Props> = ({
  audioUrl,
  wordTimings,
  imageSrc,
  heroLabel,
  callouts,
  arrowDashed,
  animateArrows,
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
  staggerSeconds,
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

  const enterFrames = Math.round(enterSeconds * fps);
  const staggerFrames = Math.max(1, Math.round(staggerSeconds * fps));
  // Image enters first, then callouts stagger in.
  const imageEnterFrame = enterFrames;
  const firstCalloutFrame = enterFrames + Math.round(0.35 * fps);

  const resolvedImageSrc = imageSrc
    ? imageSrc.startsWith("http")
      ? imageSrc
      : staticFile(imageSrc)
    : null;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      <ImageCard
        imageSrc={resolvedImageSrc}
        heroLabel={heroLabel}
        enterFrame={imageEnterFrame}
      />

      {/* Callouts (overlay) */}
      {callouts.map((c, i) => {
        const calloutDelayFrame =
          c.delaySeconds !== undefined
            ? enterFrames + Math.round(c.delaySeconds * fps)
            : firstCalloutFrame + i * staggerFrames;
        const color = c.color && c.color.length > 0 ? c.color : CALLOUT_CYAN;
        return (
          <Callout
            key={i}
            fromX={c.labelXPx}
            fromY={c.labelYPx}
            toX={c.targetXPx}
            toY={c.targetYPx}
            color={color}
            label={c.label}
            dashed={arrowDashed}
            animate={animateArrows}
            enterFrame={calloutDelayFrame}
          />
        );
      })}

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
