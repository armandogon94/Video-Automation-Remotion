/**
 * ClauseHighlightPhrase — a "second-read" highlight ATOM (liquid-glass family).
 *
 * THE BEAT IT REPRODUCES
 * ----------------------
 * A human reading a sentence reads it ONCE clean, then goes back with a
 * highlighter and marks the phrase that matters. austin.marchese / nateherk
 * both lean on this: the line settles first, THEN a translucent marker sweeps
 * left→right over the key phrase a beat later (the "human-highlighter" arrival).
 * That deliberate lag — text settles, then highlight catches up — is the whole
 * point; it reads as emphasis, not decoration.
 *
 * TWO VARIANTS (both content-SIZED to the phrase, never full-width):
 *   - "inline-select" : a rounded translucent BAR painted BEHIND the phrase
 *     words (like a text-selection / marker swipe). Width grows 0→100%.
 *   - "focus-box"     : a thin rounded BORDER box drawn AROUND the phrase
 *     region (a "look here" frame). The border's right edge sweeps in 0→100%.
 *
 * Each phrase is a WORD-INDEX RANGE {start,end} (inclusive) into the
 * whitespace-split text. Multiple, non-overlapping or overlapping, phrases are
 * supported and each gets a small per-phrase stagger so several highlights land
 * in sequence rather than all at once.
 *
 * CHOREOGRAPHY (all derived from useCurrentFrame — deterministic / SSR-safe):
 *   1. Text reveals (fade + slight rise) over [startFrame, +textRevealFrames].
 *   2. After it settles, each highlight begins at
 *        startFrame + textRevealFrames + secondReadDelay + i*stagger
 *      and grows its width 0→100% over sweepFrames (eased L→R).
 *
 * GOTCHAS HANDLED (headless Remotion):
 *   - NO background-clip:text / -webkit-text-fill-color:transparent (that paints
 *     as an opaque rect in headless Chromium). All text uses SOLID fills.
 *   - Words keep their inter-word WHITESPACE so the line still wraps naturally
 *     (a known repo bug if the spaces are dropped when mapping over words).
 *
 * Self-contained: react + remotion + the sibling liquid-glass tokens + the house
 * FONT_STACKS. No DOM measurement, no window, no Math.random / Date.now.
 */
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT_STACKS } from "../../brand/fonts";
import {
  lgTheme,
  withAlpha,
  type LiquidGlassTheme,
} from "./tokens";

/** A contiguous run of words (inclusive indices into the whitespace-split text). */
export interface ClauseHighlightRange {
  /** First word index (inclusive, 0-based) into the whitespace-split text. */
  start: number;
  /** Last word index (inclusive) into the whitespace-split text. */
  end: number;
}

export type ClauseHighlightVariant = "inline-select" | "focus-box";

export interface ClauseHighlightPhraseProps {
  /** The line / block of text to render. */
  text?: string;
  /**
   * Phrase ranges to highlight, each {start,end} inclusive into the
   * whitespace-split words. Out-of-range / inverted ranges are clamped & dropped.
   */
  phrases?: ClauseHighlightRange[];
  /** "inline-select" = bar behind words; "focus-box" = border around words. */
  variant?: ClauseHighlightVariant;
  /** Highlight color. Defaults to the theme accent. */
  color?: string;
  /** Liquid-glass theme token set (drives the default color + ink). */
  theme?: LiquidGlassTheme;
  /** Text color. Defaults to the theme's on-glass ink (good on dark/footage). */
  ink?: string;
  /** Frame the whole atom starts on (text reveal begins here). */
  startFrame?: number;
  /** Frames the text takes to fade + rise into place. */
  textRevealFrames?: number;
  /** The "human-highlighter" lag: frames AFTER the text settles before the first
   *  highlight sweeps on. */
  secondReadDelay?: number;
  /** Frames each highlight takes to grow its width 0→100%. */
  sweepFrames?: number;
  /** Base font size (px). */
  fontSize?: number;
  /** Extra container styling (positioning, max-width, alignment, etc.). */
  style?: React.CSSProperties;
}

const DEFAULT_TEXT =
  "La diferencia no está en el modelo, está en el contexto que le das.";

/** Split on whitespace but KEEP the separators so the line still wraps. */
interface WordToken {
  /** The visible word (no surrounding whitespace). */
  word: string;
  /** Trailing whitespace that followed this word in the source (may be ""). */
  trailing: string;
  /** Index of this word among the visible words (used to match phrase ranges). */
  wordIndex: number;
}

function tokenize(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  // Capture each (run of non-space)(run of trailing space) pair so the spaces
  // travel WITH the word — never dropped, so the browser can still wrap the line.
  const re = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  let wordIndex = 0;
  while ((match = re.exec(text)) !== null) {
    tokens.push({ word: match[1], trailing: match[2], wordIndex });
    wordIndex += 1;
  }
  return tokens;
}

/** Clamp + sanitize phrase ranges against the actual word count. */
function sanitizeRanges(
  phrases: ClauseHighlightRange[],
  wordCount: number,
): ClauseHighlightRange[] {
  if (wordCount === 0) return [];
  const out: ClauseHighlightRange[] = [];
  for (const p of phrases) {
    const start = Math.max(0, Math.min(wordCount - 1, Math.floor(p.start)));
    const end = Math.max(0, Math.min(wordCount - 1, Math.floor(p.end)));
    if (end < start) continue; // inverted → skip
    out.push({ start, end });
  }
  return out;
}

/** Which phrase (if any) a given word index belongs to (first match wins). */
function phraseIndexFor(
  wordIndex: number,
  ranges: ClauseHighlightRange[],
): number {
  for (let i = 0; i < ranges.length; i++) {
    if (wordIndex >= ranges[i].start && wordIndex <= ranges[i].end) return i;
  }
  return -1;
}

/** Position of a word WITHIN its phrase: "only" | "first" | "last" | "mid". */
type WordSlot = "only" | "first" | "last" | "mid";
function slotFor(wordIndex: number, range: ClauseHighlightRange): WordSlot {
  const isFirst = wordIndex === range.start;
  const isLast = wordIndex === range.end;
  if (isFirst && isLast) return "only";
  if (isFirst) return "first";
  if (isLast) return "last";
  return "mid";
}

export const ClauseHighlightPhrase: React.FC<ClauseHighlightPhraseProps> = ({
  text = DEFAULT_TEXT,
  phrases = [],
  variant = "inline-select",
  color,
  theme = "brand",
  ink,
  startFrame = 0,
  textRevealFrames = 10,
  secondReadDelay = 8,
  sweepFrames = 8,
  fontSize = 48,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = lgTheme(theme);
  const highlightColor = color ?? t.accent;
  const inkColor = ink ?? t.inkOnGlass;

  const tokens = tokenize(text);
  const ranges = sanitizeRanges(phrases, tokens.length);

  // ── 1) Text reveal (fade + slight rise), eased so it "settles" ──────────────
  const revealEnd = startFrame + Math.max(1, textRevealFrames);
  const textProgress = interpolate(frame, [startFrame, revealEnd], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = textProgress;
  const textRise = (1 - textProgress) * Math.round(fontSize * 0.18);

  // ── 2) Per-phrase sweep timing (the second-read beat) ───────────────────────
  // Highlights wait until the text has settled, then sweep in sequence with a
  // small stagger so several phrases don't all land on the same frame.
  const sweep = Math.max(1, sweepFrames);
  const stagger = Math.max(2, Math.round(sweep * 0.6));
  const phraseSweepStart = (i: number): number =>
    revealEnd + secondReadDelay + i * stagger;
  const phraseProgress = (i: number): number =>
    interpolate(frame, [phraseSweepStart(i), phraseSweepStart(i) + sweep], [0, 1], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Marker geometry (derived from fontSize so it scales with the type).
  const padX = Math.round(fontSize * 0.16); // horizontal breathing room around words
  const padY = Math.round(fontSize * 0.1); // vertical breathing room
  const radius = Math.round(fontSize * 0.28);
  const borderWidth = Math.max(2, Math.round(fontSize * 0.045));

  return (
    <div
      style={{
        fontFamily: FONT_STACKS.sans,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.34,
        letterSpacing: "-0.01em",
        color: inkColor,
        opacity: textOpacity,
        transform: `translateY(${textRise}px)`,
        ...style,
      }}
    >
      {tokens.map((tok) => {
        const pIdx = phraseIndexFor(tok.wordIndex, ranges);
        const inPhrase = pIdx >= 0;

        // Plain word (not highlighted) — render with its trailing whitespace so
        // the line still wraps naturally.
        if (!inPhrase) {
          return (
            <span key={tok.wordIndex}>
              {tok.word}
              {tok.trailing}
            </span>
          );
        }

        const range = ranges[pIdx];
        const slot = slotFor(tok.wordIndex, range);
        const grow = phraseProgress(pIdx);

        // Round the OUTER corners of the phrase only (first word = left corners,
        // last word = right corners) so a multi-word phrase reads as one pill.
        const leftRound = slot === "only" || slot === "first";
        const rightRound = slot === "only" || slot === "last";
        const br = (on: boolean): number => (on ? radius : 0);

        // The marker is a positioned layer BEHIND the word. We grow its width
        // left→right via an inner fill that scales on the X axis from the left.
        const markerBackground =
          variant === "inline-select"
            ? withAlpha(highlightColor, 0.32)
            : "transparent";
        const markerBorder =
          variant === "focus-box"
            ? `${borderWidth}px solid ${withAlpha(highlightColor, 0.95)}`
            : "none";

        // Pad only the OUTER edges of the phrase so interior word seams stay flush.
        const padLeft = leftRound ? padX : 0;
        const padRight = rightRound ? padX : 0;

        return (
          <span
            key={tok.wordIndex}
            style={{
              position: "relative",
              // A small horizontal margin equal to the outer padding keeps the
              // text optically centered over the marker without shifting layout
              // for interior words.
              padding: `${padY}px ${padRight}px ${padY}px ${padLeft}px`,
              // Keep the highlighted run on one visual run where possible; if it
              // must wrap, each word still carries its own marker segment.
              whiteSpace: "pre",
            }}
          >
            {/* Marker layer — clipped, with an inner fill that sweeps L→R. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderTopLeftRadius: br(leftRound),
                borderBottomLeftRadius: br(leftRound),
                borderTopRightRadius: br(rightRound),
                borderBottomRightRadius: br(rightRound),
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "left center",
                  transform: `scaleX(${grow})`,
                  background: markerBackground,
                  border: markerBorder,
                  borderTopLeftRadius: br(leftRound),
                  borderBottomLeftRadius: br(leftRound),
                  borderTopRightRadius: br(rightRound),
                  borderBottomRightRadius: br(rightRound),
                }}
              />
            </span>
            {/* The word itself sits ABOVE the marker. SOLID fill only. */}
            <span style={{ position: "relative", color: inkColor }}>
              {tok.word}
            </span>
            {/* Trailing whitespace rides OUTSIDE the padded marker span so it
             *  never gets highlighted but still lets the line wrap. */}
            {tok.trailing ? <span>{tok.trailing}</span> : null}
          </span>
        );
      })}
    </div>
  );
};
