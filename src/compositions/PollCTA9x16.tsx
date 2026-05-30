/**
 * PollCTA9x16 — engagement-poll CTA end card.
 *
 * Inspired by @diysmartcode (wave-4 V3 N21):
 *   "Engagement-poll CTA: end card asking 'Which side are you on?' with 2-3
 *    option chips. Drives comments by giving the viewer a low-friction
 *    binary/ternary choice."
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Centered question (Playfair serif italic ~92px, ink color on paper)
 *   - 2-3 option pills below, horizontally staggered in (~140 tall × ~360 wide)
 *       · Each pill: rounded button, optional icon (emoji/char) + label
 *   - Optional closing line (italic serif, smaller) under the pills
 *   - "Comment ↓" hint + handle at bottom (arrow points downward to the
 *     comment box in the IG/TT UI)
 *   - Optional EditorialCaption strip
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
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";
import type { PaletteMode } from "../brand";

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

const pollOptionSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  /** Optional micro-icon (emoji or single character). */
  icon: z.string().optional(),
});

// ─── Schema ────────────────────────────────────────────────────────
export const pollCTA9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  question: z.string().default("Which side are you on?"),
  options: z.array(pollOptionSchema).default([]),
  /** Closing thought below options. */
  closingLine: z.string().optional(),
  handle: z.string().default("@armandointeligencia"),
  /** "Comment ↓" hint with arrow pointing down. */
  showCommentArrow: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  enterSeconds: z.number().min(0).max(5).default(0.4),
  staggerSeconds: z.number().min(0).max(3).default(0.3),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type PollCTA9x16Props = z.infer<typeof pollCTA9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const FRAME_W = 1080;

const QUESTION_TOP = 420;
const QUESTION_FONT_SIZE = 92;

const PILL_TOP = 760;
const PILL_W = 360;
const PILL_H = 140;
const PILL_GAP_X = 32;
const PILL_GAP_Y = 36;

const CLOSING_TOP_AFTER_PILLS = 56;
const CLOSING_FONT_SIZE = 40;

const COMMENT_HINT_BOTTOM = 320;
const HANDLE_BOTTOM = 230;

// ─── Question (Playfair italic, spring-in) ─────────────────────────
const Question: React.FC<{
  text: string;
  inkColor: string;
  paletteMode: PaletteMode;
  enterFrame: number;
}> = ({ text, inkColor, paletteMode, enterFrame }) => {
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
  const scale = interpolate(enter, [0, 1], [0.95, 1.0]);

  return (
    <div
      style={{
        position: "absolute",
        top: QUESTION_TOP,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: FONT_STACKS.serifItalic,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: QUESTION_FONT_SIZE,
        lineHeight: 1.05,
        color: getBodyTextColor(paletteMode, inkColor, QUESTION_FONT_SIZE),
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center top",
        letterSpacing: "-0.015em",
      }}
    >
      {text}
    </div>
  );
};

// ─── Option pill (rounded button) ──────────────────────────────────
const OptionPill: React.FC<{
  label: string;
  icon?: string;
  bg: string;
  accentColor: string;
  enterFrame: number;
  x: number;
  y: number;
}> = ({ label, icon, bg, accentColor, enterFrame, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Editorial spring shared with the rest of the brand.
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [18, 0]);

  // Auto-pick text color for contrast based on bg lightness.
  const textColor = isLightHex(bg) ? "#0F1B2D" : "#FFFFFF";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: PILL_W,
        height: PILL_H,
        background: bg,
        borderRadius: PILL_H / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "0 28px",
        boxShadow: `0 8px 28px ${accentColor}33, 0 1px 0 rgba(255,255,255,0.08) inset`,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: 56,
            lineHeight: 1,
            color: textColor,
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 800,
          fontSize: 44,
          color: textColor,
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
};

function isLightHex(hex: string): boolean {
  // Naive luminance check; default to dark text if the color is light.
  if (!hex.startsWith("#")) return false;
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (n.length !== 6) return false;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6;
}

// ─── Comment hint with downward arrow ──────────────────────────────
const CommentHint: React.FC<{
  color: string;
  enterFrame: number;
}> = ({ color, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: COMMENT_HINT_BOTTOM,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 32,
        color,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>Comenta abajo</span>
      <svg width="36" height="28" viewBox="0 0 36 28">
        <path
          d="M 18 2 L 18 22 M 8 14 L 18 24 L 28 14"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const PollCTA9x16: React.FC<PollCTA9x16Props> = ({
  audioUrl,
  wordTimings,
  question,
  options,
  closingLine,
  handle,
  showCommentArrow,
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

  const questionEnterFrame = Math.round(enterSeconds * fps);
  const firstPillFrame = Math.round((enterSeconds + 0.25) * fps);
  const stagger = Math.max(1, Math.round(staggerSeconds * fps));

  // Layout the pills. 1 row if count<=2, otherwise wrap.
  const total = options.length;
  const rowCount = total <= 2 ? 1 : 2; // 3 options → row1=2, row2=1; 2 options → 1 row
  const pillsRow1 = total <= 2 ? total : 2;
  const pillsRow2 = total <= 2 ? 0 : total - 2;

  const row1TotalW = pillsRow1 * PILL_W + (pillsRow1 - 1) * PILL_GAP_X;
  const row1Left = (FRAME_W - row1TotalW) / 2;
  const row2TotalW = pillsRow2 * PILL_W + Math.max(0, pillsRow2 - 1) * PILL_GAP_X;
  const row2Left = (FRAME_W - row2TotalW) / 2;

  const pillsBottomY =
    PILL_TOP + rowCount * PILL_H + (rowCount - 1) * PILL_GAP_Y;
  const closingTop = pillsBottomY + CLOSING_TOP_AFTER_PILLS;

  const lastPillEnterFrame = firstPillFrame + (total - 1) * stagger;
  const closingEnterFrame = lastPillEnterFrame + Math.round(0.2 * fps);
  const commentEnterFrame = closingEnterFrame + Math.round(0.2 * fps);

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

      {/* Question (Playfair italic) */}
      <Question
        text={question}
        inkColor={resolvedInk}
        paletteMode={palette}
        enterFrame={questionEnterFrame}
      />

      {/* Option pills */}
      {options.map((opt, i) => {
        const row = i < 2 ? 0 : 1;
        const indexInRow = row === 0 ? i : i - 2;
        const rowLeft = row === 0 ? row1Left : row2Left;
        const x = rowLeft + indexInRow * (PILL_W + PILL_GAP_X);
        const y = PILL_TOP + row * (PILL_H + PILL_GAP_Y);
        const bg = opt.color && opt.color.length > 0 ? opt.color : resolvedAccent;
        return (
          <OptionPill
            key={i}
            label={opt.label}
            icon={opt.icon}
            bg={bg}
            accentColor={resolvedAccent}
            enterFrame={firstPillFrame + i * stagger}
            x={x}
            y={y}
          />
        );
      })}

      {/* Optional closing line */}
      {closingLine && (
        <ClosingLine
          text={closingLine}
          inkColor={resolvedInk}
          paletteMode={palette}
          top={closingTop}
          enterFrame={closingEnterFrame}
        />
      )}

      {/* Comment hint with downward arrow */}
      {showCommentArrow && (
        <CommentHint color={resolvedAccent} enterFrame={commentEnterFrame} />
      )}

      {/* Handle bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: HANDLE_BOTTOM,
          textAlign: "center",
          fontFamily: FONT_STACKS.mono,
          fontWeight: 500,
          fontSize: 32,
          color: resolvedMuted,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {handle}
      </div>

      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 130,
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

// ─── Closing line (italic serif, fades in) ─────────────────────────
const ClosingLine: React.FC<{
  text: string;
  inkColor: string;
  paletteMode: PaletteMode;
  top: number;
  enterFrame: number;
}> = ({ text, inkColor, paletteMode, top, enterFrame }) => {
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
  const translateY = interpolate(enter, [0, 1], [10, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily: FONT_STACKS.serifItalic,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: CLOSING_FONT_SIZE,
        lineHeight: 1.25,
        color: getBodyTextColor(paletteMode, inkColor, CLOSING_FONT_SIZE),
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};
