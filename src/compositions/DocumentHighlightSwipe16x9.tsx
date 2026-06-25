/**
 * DocumentHighlightSwipe16x9 — horizontal (1920×1080) "highlighter over a
 * screenshotted document" composition replicating aiexplained's signature move.
 *
 * SOURCE (aiexplained back-catalog):
 *   - 2AdkSYWB6LY/02.jpg — OpenAI GPT-4 blog post; ONE sentence struck through with
 *     a translucent black box, plus a separate scribbled redaction lower down.
 *   - Tf1nooXtUHE/02.jpg — Llama-3 paper "Data Mix" section; TWO lines highlighted
 *     in translucent YELLOW over real serif body text.
 *   - 3sWH2e5xpdo/06.jpg — Altman interview blog; a multi-line quote highlighted in
 *     translucent YELLOW that runs OVER the dark serif text (text stays readable).
 *
 * THE PATTERN (what this comp does):
 *   A light "document" panel — a rounded off-white sheet floating on a soft grey
 *   stage — holds a column of mock body text. Over exactly ONE target line a
 *   TRANSLUCENT highlighter rectangle wipes LEFT → RIGHT (its width animates 0 →
 *   full via `interpolate`) to reveal-emphasize that sentence. Because the
 *   highlight sits over REAL text at ~0.5 alpha, the underlying words stay
 *   readable — this is the whole point, so we DO NOT use background-clip:text
 *   (which headless Remotion renders as an opaque box; see project GOTCHA).
 *
 * Three document chrome styles (`docStyle`):
 *   - "paper" — academic-paper look: numbered section heading, justified-ish serif
 *     body, generous margins (mirrors the Llama-3 paper frame).
 *   - "blog"  — article column: a title + byline rule, slightly larger serif body
 *     (mirrors the OpenAI / Altman blog frames).
 *   - "tweet" — a single tweet card: avatar dot + display name + @handle, then the
 *     tweet body lines, with a faint footer rule.
 *
 * Highlight colors (`highlightColor`): yellow (default, ~#FFE37A) / magenta / blue
 * / grey — each rendered at ~0.5 alpha so the ink shows through, mirroring the
 * yellow-on-serif frames (and the magenta/black variant from 2AdkSYWB6LY).
 *
 * Self-contained per the cross-creator new-comp brief: imports only react,
 * remotion, zod and the brand tokens (PAPER_PALETTE / FONT_STACKS) + inline SVG.
 * No shared chassis/caption components, no new deps.
 *
 * Motion (≈120 frames @ 30fps):
 *   - Stage + document card fade/scale in (0 → ~14f).
 *   - Body lines settle (card carries them — no per-line stagger; the doc is a
 *     "screenshot", it appears whole, like aiexplained's freeze-frame).
 *   - Highlighter holds off until ~26f (reader's eye lands on the page first),
 *     then sweeps L→R over the target line across ~22f with a marker-like ease,
 *     overshooting a hair past the line end (a real highlighter runs off the word).
 *   - A subtle "wet ink" leading edge (slightly darker cap) rides the sweep.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { PAPER_PALETTE, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema — every field has a .default() so `{}` props render real demo content.
// ─────────────────────────────────────────────────────────────────────────────

const highlightColorEnum = z.enum(["yellow", "magenta", "blue", "grey"]);
export type DocumentHighlightColor = z.infer<typeof highlightColorEnum>;

const docStyleEnum = z.enum(["paper", "blog", "tweet"]);
export type DocumentStyle = z.infer<typeof docStyleEnum>;

export const documentHighlightSwipe16x9Schema = z.object({
  /** Document chrome: academic paper, blog article, or single tweet card. */
  docStyle: docStyleEnum.default("blog"),
  /** Small eyebrow / section label shown at the top of the document. */
  title: z.string().default("Why this changes everything"),
  /**
   * The document body, one entry per visual line. Keep lines short enough to fit
   * the column; long lines are clamped to a single row (ellipsis) so the
   * highlight rectangle always maps cleanly to one line.
   */
  docLines: z
    .array(z.string())
    .default([
      "Over the past two years, we rebuilt our entire stack and,",
      "together with our partners, co-designed a supercomputer from",
      "the ground up for this exact workload. A year ago, we trained",
      "the first test run of the system end to end. We found and",
      "fixed the bugs, and the result is our most capable model yet —",
      "it answers harder questions, follows longer instructions, and",
      "refuses to step outside of the guardrails we set for it.",
    ]),
  /** 0-based index into docLines of the sentence to highlight. */
  highlightLineIndex: z.number().int().min(0).default(4),
  /** Highlighter color — translucent over the real text (no background-clip). */
  highlightColor: highlightColorEnum.default("yellow"),
  /** Tweet display name (docStyle="tweet" only). */
  tweetName: z.string().default("AI Explained"),
  /** Tweet @handle (docStyle="tweet" only). */
  tweetHandle: z.string().default("@aiexplained"),
  /** Frame the highlighter sweep begins. The doc appears first; eye lands; sweep. */
  highlightStartFrame: z.number().int().min(0).default(26),
  /** How many frames the L→R sweep takes. */
  highlightSweepFrames: z.number().int().min(4).default(22),
  /** Document panel background. Off-white "sheet of paper", not pure white. */
  paperColor: z.string().default(PAPER_PALETTE.paper),
  /** Body ink color. */
  inkColor: z.string().default(PAPER_PALETTE.ink),
  /** Soft stage color behind the document card. */
  stageColor: z.string().default("#DFE3E8"),
});
export type DocumentHighlightSwipe16x9Props = z.infer<
  typeof documentHighlightSwipe16x9Schema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Highlight color table — fill at ~0.5 alpha (ink shows through), plus a slightly
// stronger leading-edge "wet ink" cap so the sweep reads as a real marker tip.
// ─────────────────────────────────────────────────────────────────────────────

interface HighlightInk {
  fill: string;
  edge: string;
}
const HIGHLIGHT_INKS: Record<DocumentHighlightColor, HighlightInk> = {
  // aiexplained's default — warm school-highlighter yellow.
  yellow: { fill: "rgba(255, 227, 122, 0.55)", edge: "rgba(247, 201, 72, 0.72)" },
  // the magenta scribble variant (2AdkSYWB6LY) as a clean swipe.
  magenta: { fill: "rgba(255, 64, 160, 0.45)", edge: "rgba(233, 30, 140, 0.66)" },
  blue: { fill: "rgba(96, 170, 255, 0.45)", edge: "rgba(48, 132, 240, 0.66)" },
  grey: { fill: "rgba(120, 128, 140, 0.40)", edge: "rgba(86, 94, 108, 0.62)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants (1920×1080). The document is a centered card; styles tune the
// column width and type scale to mirror paper / blog / tweet sources.
// ─────────────────────────────────────────────────────────────────────────────

const CARD_WIDTH = 1180;
const CARD_PAD_X = 96;
const CARD_PAD_Y = 84;
const LINE_HEIGHT = 1.62; // generous leading so a highlight box has room

interface StyleSpec {
  fontFamily: string;
  bodyFontSize: number;
  titleFontSize: number;
  bodyWeight: number;
  /** Extra horizontal padding of the highlight beyond the glyph run (marker bleed). */
  highlightBleedX: number;
  /** Vertical padding of the highlight box around the cap height. */
  highlightPadY: number;
}

const STYLE_SPECS: Record<DocumentStyle, StyleSpec> = {
  paper: {
    fontFamily: FONT_STACKS.serif,
    bodyFontSize: 33,
    titleFontSize: 30,
    bodyWeight: 400,
    highlightBleedX: 6,
    highlightPadY: 5,
  },
  blog: {
    fontFamily: FONT_STACKS.serif,
    bodyFontSize: 36,
    titleFontSize: 44,
    bodyWeight: 400,
    highlightBleedX: 7,
    highlightPadY: 6,
  },
  tweet: {
    fontFamily: FONT_STACKS.sans,
    bodyFontSize: 38,
    titleFontSize: 34,
    bodyWeight: 400,
    highlightBleedX: 8,
    highlightPadY: 7,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// One document line. The highlight is a translucent rect layered UNDER the text
// span (so the ink stays crisp on top) whose width animates 0 → full L→R. Width
// is expressed as a fraction of this line's rendered width via a measuring
// wrapper that sizes to its content; the highlight uses width:`${pct}%`.
// ─────────────────────────────────────────────────────────────────────────────

const DocLine: React.FC<{
  text: string;
  isTarget: boolean;
  sweepProgress: number; // 0 → 1 for the target line
  spec: StyleSpec;
  ink: HighlightInk;
  inkColor: string;
}> = ({ text, isTarget, sweepProgress, spec, ink, inkColor }) => {
  // The leading "wet" cap is visible only while the sweep is in flight.
  const edgeOpacity = isTarget
    ? interpolate(sweepProgress, [0, 0.04, 0.92, 1], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        position: "relative",
        // inline-block so the wrapper hugs the glyph run → highlight % maps to text width
        display: "inline-block",
        maxWidth: "100%",
        fontFamily: spec.fontFamily,
        fontWeight: spec.bodyWeight,
        fontSize: spec.bodyFontSize,
        lineHeight: LINE_HEIGHT,
        color: inkColor,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {/* Translucent highlight rectangle (under the text). SOLID translucent fill —
          NOT background-clip — so the words underneath remain readable. */}
      {isTarget && sweepProgress > 0 ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: -spec.highlightBleedX,
            top: `${(spec.highlightPadY * -1) + 2}px`,
            bottom: `${spec.highlightPadY}px`,
            width: `calc(${(sweepProgress * 100).toFixed(3)}% + ${
              spec.highlightBleedX * 2
            }px)`,
            background: ink.fill,
            borderRadius: 4,
            // marker texture: a touch of skew + soft top/bottom feathering
            boxShadow: `inset 0 6px 10px -8px ${ink.edge}, inset 0 -6px 10px -8px ${ink.edge}`,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        >
          {/* Wet leading edge — a slightly stronger vertical band at the marker tip. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: 14,
              background: `linear-gradient(90deg, ${"rgba(0,0,0,0)"} 0%, ${ink.edge} 100%)`,
              opacity: edgeOpacity,
              filter: "blur(0.6px)",
            }}
          />
        </div>
      ) : null}

      {/* The actual line text — always fully opaque, sits ABOVE the highlight. */}
      <span style={{ position: "relative" }}>{text}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Document chrome headers (paper / blog / tweet) — inline SVG only.
// ─────────────────────────────────────────────────────────────────────────────

const PaperHeader: React.FC<{ title: string; ink: string; muted: string }> = ({
  title,
  ink,
  muted,
}) => (
  <div style={{ marginBottom: 34 }}>
    <div
      style={{
        fontFamily: FONT_STACKS.mono,
        fontSize: 20,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: muted,
        marginBottom: 10,
      }}
    >
      3.1.2 &nbsp;Section
    </div>
    <div
      style={{
        fontFamily: FONT_STACKS.serif,
        fontWeight: 700,
        fontSize: 34,
        color: ink,
        lineHeight: 1.15,
      }}
    >
      {title}
    </div>
  </div>
);

const BlogHeader: React.FC<{
  title: string;
  ink: string;
  muted: string;
  accent: string;
}> = ({ title, ink, muted, accent }) => (
  <div style={{ marginBottom: 38 }}>
    <div
      style={{
        fontFamily: FONT_STACKS.serif,
        fontWeight: 800,
        fontSize: 52,
        color: ink,
        lineHeight: 1.08,
        letterSpacing: "-0.01em",
        marginBottom: 18,
      }}
    >
      {title}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 30,
          height: 4,
          borderRadius: 2,
          background: accent,
        }}
      />
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontSize: 22,
          color: muted,
          letterSpacing: "0.02em",
        }}
      >
        Research · 6 min read
      </span>
    </div>
  </div>
);

const TweetHeader: React.FC<{
  name: string;
  handle: string;
  ink: string;
  muted: string;
  accent: string;
}> = ({ name, handle, ink, muted, accent }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      marginBottom: 34,
    }}
  >
    {/* Avatar — inline SVG roundel */}
    <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="32" fill={accent} />
      <circle cx="32" cy="25" r="11" fill="rgba(255,255,255,0.95)" />
      <path
        d="M12 58c0-12 9-19 20-19s20 7 20 19z"
        fill="rgba(255,255,255,0.95)"
      />
    </svg>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 30,
            color: ink,
          }}
        >
          {name}
        </span>
        {/* verified check — inline SVG */}
        <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.8-1 3 1 3-2.6 1.8-1 3-3.2-.1L12 22.5 9.4 20.6l-3.2.1-1-3L2.6 16l1-3-1-3 2.6-1.8 1-3 3.2.1L12 1.5z"
            fill={accent}
          />
          <path
            d="M8.2 12.2l2.6 2.6 5-5"
            fill="none"
            stroke="#fff"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontSize: 24,
          color: muted,
        }}
      >
        {handle}
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const DocumentHighlightSwipe16x9: React.FC<
  DocumentHighlightSwipe16x9Props
> = ({
  docStyle,
  title,
  docLines,
  highlightLineIndex,
  highlightColor,
  tweetName,
  tweetHandle,
  highlightStartFrame,
  highlightSweepFrames,
  paperColor,
  inkColor,
  stageColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spec = STYLE_SPECS[docStyle];
  const ink = HIGHLIGHT_INKS[highlightColor];
  const muted = PAPER_PALETTE.muted;
  const accent = HIGHLIGHT_INKS[highlightColor].edge;

  // ── Card entry: spring scale + fade (the "screenshot" pops onto the stage). ──
  const cardEnter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.9 },
  });
  const cardScale = interpolate(cardEnter, [0, 1], [0.965, 1]);
  const cardOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Highlighter sweep: width fraction 0 → ~1.0, eased like a marker stroke.
  //    A real highlighter accelerates, runs steady, then lifts — Easing.inOut
  //    captures that. It overshoots a hair (1.0) past the run so the last word
  //    is fully covered. ──
  const sweepProgress = interpolate(
    frame,
    [highlightStartFrame, highlightStartFrame + highlightSweepFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 0.85, 0.3, 1),
    },
  );

  const targetIndex = Math.min(
    Math.max(0, highlightLineIndex),
    Math.max(0, docLines.length - 1),
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 38%, ${lighten(
          stageColor,
        )} 0%, ${stageColor} 70%, ${darken(stageColor)} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* The document "screenshot" card. */}
      <div
        style={{
          width: CARD_WIDTH,
          maxWidth: "82%",
          background: paperColor,
          borderRadius: 22,
          padding: `${CARD_PAD_Y}px ${CARD_PAD_X}px`,
          boxShadow:
            "0 40px 80px -30px rgba(15, 27, 45, 0.45), 0 8px 24px -12px rgba(15, 27, 45, 0.30)",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          transformOrigin: "center center",
        }}
      >
        {docStyle === "paper" ? (
          <PaperHeader title={title} ink={inkColor} muted={muted} />
        ) : docStyle === "tweet" ? (
          <TweetHeader
            name={tweetName}
            handle={tweetHandle}
            ink={inkColor}
            muted={muted}
            accent={accent}
          />
        ) : (
          <BlogHeader
            title={title}
            ink={inkColor}
            muted={muted}
            accent={accent}
          />
        )}

        {/* Body column. Each line is its own row so the highlight maps to one line. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {docLines.map((line, i) => (
            <div key={i} style={{ display: "block" }}>
              <DocLine
                text={line}
                isTarget={i === targetIndex}
                sweepProgress={i === targetIndex ? sweepProgress : 0}
                spec={spec}
                ink={ink}
                inkColor={inkColor}
              />
            </div>
          ))}
        </div>

        {/* Tweet footer rule (tweet style only). */}
        {docStyle === "tweet" ? (
          <div
            style={{
              marginTop: 34,
              paddingTop: 22,
              borderTop: `1px solid ${muted}33`,
              fontFamily: FONT_STACKS.sans,
              fontSize: 22,
              color: muted,
              letterSpacing: "0.01em",
            }}
          >
            10:24 AM · Replying to the timeline · 1.2M Views
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ─── Tiny color helpers (no deps) — nudge the stage gradient lighter/darker. ──
// Operate on #RRGGBB hex; clamp to [0,255]. Used only for the soft stage vignette.
function shift(hex: string, delta: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 0xff) + delta);
  const g = clamp(((n >> 8) & 0xff) + delta);
  const b = clamp((n & 0xff) + delta);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
const lighten = (hex: string): string => shift(hex, 14);
const darken = (hex: string): string => shift(hex, -22);

export default DocumentHighlightSwipe16x9;
