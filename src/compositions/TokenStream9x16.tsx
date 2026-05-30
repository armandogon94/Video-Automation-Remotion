/**
 * TokenStream9x16 — vertical (1080×1920) "watching an LLM stream tokens" visualization.
 *
 * Per R3 §8 (docs/research/wave-1/R3-graph-nn-cs.md), this is the #1 next build in the
 * "inside an LLM" trilogy (TokenStream → AttentionHeatmap → ForceGraph). The visual is
 * the canonical IDE / chat-completion feel: tokens appear one-by-one in a monospaced
 * panel, each freshly-emitted token gets an accent glow for the moment it's "live,"
 * and a cursor blinks at the end once generation completes.
 *
 * Conventions: same house grammar as BigNumberHero9x16.tsx and QuoteCard9x16.tsx —
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccent()
 *   - optional BrandBreadcrumb at top
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional bottom EditorialCaption strip (off by default — the tokens ARE the copy)
 *
 * Visual structure (top → bottom):
 *   - Optional BrandBreadcrumb (~y=80)
 *   - Optional title (Inter 700 ~58px centered, ~y=260)
 *   - TOKENS PANEL (vertical center, ~y=480..1500): subtle near-black panel with a
 *     low-alpha accent border. Tokens render as monospaced spans L→R, wrapping
 *     naturally. Each enters with a ~0.15s fade-in + accent glow that decays once
 *     the next token emits. Final token holds active-glow until the cursor takes over.
 *   - Blinking accent cursor `▌` after all tokens emit (1.6s period, on by default).
 *   - Optional EditorialCaption strip (off by default).
 *
 * Motion grammar:
 *   - Token list: explicit `tokensArray` if provided, else `text.split(/\s+/)`.
 *   - Each token's reveal frame: `frame_i = (i / tokensPerSecond) * fps`.
 *   - Active-glow window for token i: from reveal frame to next token's reveal frame
 *     (or, for the last token, until the cursor starts blinking).
 *   - Cursor only appears after every token has emitted; blinks at a 1.6s period.
 */
import React, { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";

// ─── Local schemas (kept inline per build constraints — no edits to schemas.ts) ─────

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

export const tokenStream9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  /** The full string to tokenize (split by whitespace) — OR pass `tokensArray` for explicit control. */
  text: z
    .string()
    .default("La IA está cambiando todo. Cada día. En cada industria."),
  /** Explicit token array — overrides `text` if provided. */
  tokensArray: z.array(z.string()).default([]),
  /** Tokens per second. Default 8. */
  tokensPerSecond: z.number().min(1).max(60).default(8),
  /** Show blinking cursor after all tokens emit. */
  showCursor: z.boolean().default(true),
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
export type TokenStream9x16Props = z.infer<typeof tokenStream9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────────
const PANEL_LEFT = 60;
const PANEL_RIGHT = 60;
const PANEL_WIDTH = 1080 - PANEL_LEFT - PANEL_RIGHT;
const PANEL_TOP = 480;
const PANEL_BOTTOM = 1500;
const PANEL_PADDING_X = 56;
const PANEL_PADDING_Y = 60;
const PANEL_BORDER_RADIUS = 28;
const PANEL_BORDER_PX = 2;

const TITLE_TOP = 260;
const TITLE_FONT_SIZE = 58;

const TOKEN_FONT_SIZE = 48;
const TOKEN_LINE_HEIGHT = 1.34;
const TOKEN_FADE_IN_SECONDS = 0.15;
const TOKEN_GLOW_DECAY_SECONDS = 0.3;
const CURSOR_BLINK_PERIOD_SECONDS = 1.6;

const MONO_STACK =
  '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, Monaco, "Cascadia Mono", Consolas, "Liberation Mono", "Courier New", monospace';

// ─── Helpers ───────────────────────────────────────────────────────────

/**
 * Resolve which token strings to render. Explicit `tokensArray` always wins;
 * otherwise we whitespace-split `text` and drop empty fragments (so leading or
 * trailing whitespace doesn't produce a phantom token).
 */
function resolveTokens(text: string, tokensArray: string[]): string[] {
  if (tokensArray && tokensArray.length > 0) {
    return tokensArray;
  }
  return text.split(/\s+/).filter((t) => t.length > 0);
}

/**
 * Mix two hex colors (#RRGGBB) with a 0..1 weight (0 = a, 1 = b).
 * Used to fade the active token's accent glow back to the resting ink color.
 */
function mixHex(a: string, b: string, t: number): string {
  const clamp01 = Math.max(0, Math.min(1, t));
  const parse = (h: string): [number, number, number] | null => {
    const m = h.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };
  const aa = parse(a);
  const bb = parse(b);
  if (!aa || !bb) return b;
  const r = Math.round(aa[0] + (bb[0] - aa[0]) * clamp01);
  const g = Math.round(aa[1] + (bb[1] - aa[1]) * clamp01);
  const b2 = Math.round(aa[2] + (bb[2] - aa[2]) * clamp01);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b2)}`;
}

/** Append an 8-bit alpha (0..1) to a #RRGGBB string. Returns #RRGGBBAA. */
function withAlpha(hex: string, alpha: number): string {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${m[1]}${a}`;
}

// ─── Single token span ─────────────────────────────────────────────────
const TokenSpan: React.FC<{
  text: string;
  revealFrame: number;
  nextRevealFrame: number;
  isLast: boolean;
  cursorStartFrame: number;
  inkColor: string;
  accentColor: string;
  fps: number;
}> = ({
  text,
  revealFrame,
  nextRevealFrame,
  isLast,
  cursorStartFrame,
  inkColor,
  accentColor,
  fps,
}) => {
  const frame = useCurrentFrame();

  // Not yet emitted — render an invisible placeholder so the wrap geometry doesn't
  // jump when later tokens appear. The panel reserves its full final width via the
  // outer container; we still need the per-token slot.
  if (frame < revealFrame) {
    return (
      <span
        style={{
          opacity: 0,
          fontFamily: MONO_STACK,
          fontSize: TOKEN_FONT_SIZE,
          lineHeight: TOKEN_LINE_HEIGHT,
          color: inkColor,
          whiteSpace: "pre",
        }}
      >
        {text}{" "}
      </span>
    );
  }

  const fadeEnd = revealFrame + TOKEN_FADE_IN_SECONDS * fps;
  const opacity = interpolate(frame, [revealFrame, fadeEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Active-glow window: from this token's reveal to the next token's reveal.
  // For the final token, the glow holds until the cursor takes over.
  const glowWindowEnd = isLast ? cursorStartFrame : nextRevealFrame;
  const glowProgress = interpolate(
    frame,
    [revealFrame, Math.min(glowWindowEnd, revealFrame + TOKEN_GLOW_DECAY_SECONDS * fps)],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Once we're past the glow decay window we sit at resting ink color.
  const color = mixHex(inkColor, accentColor, glowProgress);
  const shadowAlpha = 0.55 * glowProgress;
  const textShadow =
    shadowAlpha > 0.02
      ? `0 0 18px ${withAlpha(accentColor, shadowAlpha)}, 0 0 6px ${withAlpha(
          accentColor,
          shadowAlpha * 0.7,
        )}`
      : "none";

  return (
    <span
      style={{
        opacity,
        color,
        fontFamily: MONO_STACK,
        fontSize: TOKEN_FONT_SIZE,
        lineHeight: TOKEN_LINE_HEIGHT,
        textShadow,
        whiteSpace: "pre",
        letterSpacing: "-0.005em",
      }}
    >
      {text}{" "}
    </span>
  );
};

// ─── Blinking cursor (appears after all tokens emit) ───────────────────
const BlinkingCursor: React.FC<{
  startFrame: number;
  accentColor: string;
  fps: number;
}> = ({ startFrame, accentColor, fps }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const periodFrames = CURSOR_BLINK_PERIOD_SECONDS * fps;
  const phase = ((frame - startFrame) % periodFrames) / periodFrames;
  // Square wave: visible for the first half of the period, hidden for the second.
  const visible = phase < 0.5;

  return (
    <span
      style={{
        opacity: visible ? 1 : 0,
        color: accentColor,
        fontFamily: MONO_STACK,
        fontSize: TOKEN_FONT_SIZE,
        lineHeight: TOKEN_LINE_HEIGHT,
        textShadow: `0 0 14px ${withAlpha(accentColor, 0.5)}`,
        marginLeft: -8,
      }}
    >
      ▌
    </span>
  );
};

// ─── Composition ───────────────────────────────────────────────────────
export const TokenStream9x16: React.FC<TokenStream9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  text,
  tokensArray,
  tokensPerSecond,
  showCursor,
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

  // Resolve color stack: palette defaults + per-color overrides (empty string = default).
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

  // Tokens + per-token reveal frame.
  const tokens = useMemo(
    () => resolveTokens(text, tokensArray),
    [text, tokensArray],
  );
  const framesPerToken = fps / tokensPerSecond;
  const revealFrames = useMemo(
    () => tokens.map((_, i) => Math.round(i * framesPerToken)),
    [tokens, framesPerToken],
  );
  // Cursor starts ~one extra slot after the last token's reveal so the final
  // token gets its full active-glow before the cursor takes over.
  const cursorStartFrame = revealFrames.length
    ? Math.round(revealFrames[revealFrames.length - 1] + framesPerToken)
    : 0;

  // Title fade-in (already on-screen well before the first token).
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Panel chrome: a near-black backing inside the resolved paper, plus a
  // low-alpha accent border so the panel reads as "this is the model output."
  // On cream paper we darken slightly (rgba) to keep the editorial feel.
  const panelBg =
    palette === "dark"
      ? withAlpha("#000000", 0.45)
      : "rgba(15, 27, 45, 0.045)";
  const panelBorder = withAlpha(resolvedAccent, 0.28);

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
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

      {/* Optional title */}
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
            fontSize: TITLE_FONT_SIZE,
            color: resolvedInk,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
      )}

      {/* Token panel (where the LLM "thinks out loud") */}
      <div
        style={{
          position: "absolute",
          top: PANEL_TOP,
          left: PANEL_LEFT,
          width: PANEL_WIDTH,
          height: PANEL_BOTTOM - PANEL_TOP,
          background: panelBg,
          borderRadius: PANEL_BORDER_RADIUS,
          border: `${PANEL_BORDER_PX}px solid ${panelBorder}`,
          padding: `${PANEL_PADDING_Y}px ${PANEL_PADDING_X}px`,
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          alignItems: "baseline",
        }}
      >
        {tokens.map((tok, i) => (
          <TokenSpan
            key={i}
            text={tok}
            revealFrame={revealFrames[i]}
            nextRevealFrame={
              i + 1 < revealFrames.length ? revealFrames[i + 1] : cursorStartFrame
            }
            isLast={i === tokens.length - 1}
            cursorStartFrame={cursorStartFrame}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            fps={fps}
          />
        ))}
        {showCursor && (
          <BlinkingCursor
            startFrame={cursorStartFrame}
            accentColor={resolvedAccent}
            fps={fps}
          />
        )}
      </div>

      {/* Bottom EditorialCaption strip — off by default; the tokens ARE the copy. */}
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
