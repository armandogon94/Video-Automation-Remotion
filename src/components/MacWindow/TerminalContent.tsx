/**
 * TerminalContent — body of a MacWindow when variant === "terminal".
 *
 * Renders a sequence of typed lines with per-token syntax color (the Carlos
 * frame-04 `DX-pGXlxoq2` look — cyan `$` prompts, white commands, yellow args,
 * green strings, italic muted-gray comments, neon-green `✓`, neon-red `✗`).
 *
 * Optional typewriter mode types lines sequentially char-by-char at ~25-40 ms/
 * char with `linear` easing — the deliberate "watch me type" deception that
 * makes these scenes feel like real demos rather than baked screenshots.
 */
import React from "react";
import { FONT_STACKS } from "../../brand";
import { linear } from "../../timing/easing";

export type TerminalLineKind =
  | "prompt"
  | "output"
  | "comment"
  | "success"
  | "error";

export type TerminalDecorator = "check" | "cross" | "arrow" | "dot";

export interface TerminalLine {
  kind: TerminalLineKind;
  text: string;
  /** Optional left-side glyph rendered before the colored text. */
  decorator?: TerminalDecorator;
}

export interface TerminalContentProps {
  lines: TerminalLine[];
  /** Type-out animation across all lines (default off — static rendering). */
  typewriter?: boolean;
  /** Mono face — `firaCode` (default) keeps ligatures, `jetbrainsMono` is fallback. */
  font?: "firaCode" | "jetbrainsMono";
  /** Current frame (passed in so this component is pure). */
  frame: number;
  /** Composition FPS — used to convert ms/char into frames. */
  fps: number;
  /** Milliseconds per character when typewriter is on. Default 32 ms. */
  msPerChar?: number;
  /** Body text size in px. Default 28. */
  fontSize?: number;
  /** Background color of the body. Default deep terminal black. */
  background?: string;
  /** Padding around the body in px. Default 28. */
  padding?: number;
}

/** Token color palette — keep aligned with Carlos's terminal frame references. */
const TOKEN_COLORS = {
  prompt: "#5BC0EB", // cyan `$`
  command: "#F5F5F5", // bright white
  arg: "#FFB454", // warm yellow/orange
  string: "#7BD88F", // soft green
  comment: "#8C8C8C", // muted gray (italic)
  success: "#3FD771", // neon green ✓
  error: "#FF5F5F", // neon red ✗
  output: "#D0D0D0", // pale gray
  dim: "#6A6A6A",
} as const;

const DECORATOR_GLYPHS: Record<TerminalDecorator, string> = {
  check: "✓",
  cross: "✗",
  arrow: "→",
  dot: "•",
};

const DECORATOR_COLORS: Record<TerminalDecorator, string> = {
  check: TOKEN_COLORS.success,
  cross: TOKEN_COLORS.error,
  arrow: TOKEN_COLORS.prompt,
  dot: TOKEN_COLORS.dim,
};

/**
 * Cheap tokenizer for a prompt line. Splits on whitespace and labels the
 * first non-`$` token as the command, the rest as args. Wraps `"..."` and
 * `'...'` slices as strings, and trailing `#` segments as comments.
 *
 * This is intentionally simple — terminal scenes in the brand grammar use
 * 3-7 word commands, not full shell pipelines.
 */
interface TerminalToken {
  text: string;
  color: string;
  italic?: boolean;
}

function tokenizePromptLine(text: string): TerminalToken[] {
  const tokens: TerminalToken[] = [];
  // Split off trailing comment first (e.g. `npm test  # runs vitest`).
  let body = text;
  let trailingComment: string | null = null;
  const hashIdx = findCommentStart(text);
  if (hashIdx !== -1) {
    body = text.slice(0, hashIdx).trimEnd();
    trailingComment = text.slice(hashIdx);
  }

  const parts = body.split(/(\s+)/); // keep whitespace
  let sawCommand = false;
  for (const part of parts) {
    if (part === "") continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, color: TOKEN_COLORS.dim });
      continue;
    }
    if (part === "$") {
      tokens.push({ text: part, color: TOKEN_COLORS.prompt });
      continue;
    }
    if (/^["'].*["']$/.test(part)) {
      tokens.push({ text: part, color: TOKEN_COLORS.string });
      continue;
    }
    if (!sawCommand) {
      tokens.push({ text: part, color: TOKEN_COLORS.command });
      sawCommand = true;
      continue;
    }
    tokens.push({ text: part, color: TOKEN_COLORS.arg });
  }

  if (trailingComment) {
    tokens.push({
      text: " " + trailingComment,
      color: TOKEN_COLORS.comment,
      italic: true,
    });
  }
  return tokens;
}

/**
 * Find the start index of a trailing `#` comment, ignoring `#`s that fall
 * inside a quoted string. Returns -1 if no comment is present.
 */
function findCommentStart(text: string): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) return i;
  }
  return -1;
}

function tokenizeForKind(line: TerminalLine): TerminalToken[] {
  switch (line.kind) {
    case "prompt":
      return tokenizePromptLine(line.text);
    case "comment":
      return [{ text: line.text, color: TOKEN_COLORS.comment, italic: true }];
    case "success":
      return [{ text: line.text, color: TOKEN_COLORS.success }];
    case "error":
      return [{ text: line.text, color: TOKEN_COLORS.error }];
    case "output":
    default:
      return [{ text: line.text, color: TOKEN_COLORS.output }];
  }
}

export const TerminalContent: React.FC<TerminalContentProps> = ({
  lines,
  typewriter = false,
  font = "firaCode",
  frame,
  fps,
  msPerChar = 32,
  fontSize = 28,
  background = "#0E1116",
  padding = 28,
}) => {
  const fontFamily =
    font === "firaCode" ? FONT_STACKS.monoCode : FONT_STACKS.mono;
  const framesPerChar = Math.max(1, Math.round((msPerChar / 1000) * fps));

  // Precompute typewriter "char budget" per line so we can slice each line's
  // text down to the number of characters that should be visible by `frame`.
  //
  // `linear(t)` is used explicitly to honor the "deliberately linear" easing
  // contract for typewriter motion (typing speed should feel mechanical —
  // a real keystroke cadence, not a decelerating spring).
  const totalChars = lines.reduce((sum, l) => sum + l.text.length + 1, 0);
  const totalFrames = Math.max(1, totalChars * framesPerChar);
  const globalProgress = typewriter
    ? linear(Math.max(0, Math.min(1, frame / totalFrames)))
    : 1;
  const globalCharsVisible = Math.floor(globalProgress * totalChars);

  let elapsedChars = 0;
  const lineRenderables = lines.map((line) => {
    const fullText = line.text;
    const lineStart = elapsedChars;
    elapsedChars = lineStart + fullText.length + 1; // +1 for the newline tick

    const charsVisible = typewriter
      ? Math.max(0, Math.min(fullText.length, globalCharsVisible - lineStart))
      : fullText.length;

    return { line, charsVisible, fullText };
  });

  return (
    <div
      style={{
        background,
        padding,
        fontFamily,
        fontSize,
        lineHeight: 1.45,
        color: TOKEN_COLORS.output,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        boxSizing: "border-box",
        minHeight: 200,
      }}
    >
      {lineRenderables.map(({ line, charsVisible }, lineIdx) => {
        // Slice the line's text to the typewriter window, then tokenize.
        const slicedText = line.text.slice(0, charsVisible);
        const slicedLine: TerminalLine = { ...line, text: slicedText };
        const tokens = tokenizeForKind(slicedLine);
        const decorator = line.decorator;

        if (typewriter && charsVisible === 0) {
          return <div key={lineIdx} style={{ height: fontSize * 1.45 }} />;
        }

        return (
          <div
            key={lineIdx}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              whiteSpace: "pre-wrap",
            }}
          >
            {decorator ? (
              <span
                style={{
                  color: DECORATOR_COLORS[decorator],
                  fontWeight: 600,
                  minWidth: fontSize,
                  display: "inline-block",
                }}
              >
                {DECORATOR_GLYPHS[decorator]}
              </span>
            ) : null}
            <span>
              {tokens.map((tok, i) => (
                <span
                  key={i}
                  style={{
                    color: tok.color,
                    fontStyle: tok.italic ? "italic" : "normal",
                  }}
                >
                  {tok.text}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
};
