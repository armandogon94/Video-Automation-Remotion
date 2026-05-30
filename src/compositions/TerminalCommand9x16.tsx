/**
 * TerminalCommand9x16 — vertical (1080×1920) simulated shell-session composition.
 *
 * Visual reference: a Claude Code / Cursor / Vercel CLI demo frame. A centered
 * macOS-style window chrome (rounded corners + traffic-light dots + title) holds
 * a stream of typewritten commands and their flush-on-complete outputs.
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb at top (~80px)
 *   - TERMINAL WINDOW (centered, 940px × ~1400px, borderRadius 16)
 *       · Mac-style traffic-light dots top-left of header (red/yellow/green)
 *       · Optional centered window title ("zsh — claude-code · 80×24")
 *       · Subtle inner 1px border at low alpha
 *       · Near-black background (cream-mode #0B1020, dark-mode #020812)
 *   - INSIDE: monospaced sequential lines stream in
 *       · Each line: optional `prompt` ($) + `command` + optional `output[]` lines
 *       · Typewriter effect per character (charsPerSecond, default 35)
 *       · Block cursor (▌) blinks at 50% duty at end of current typing line
 *       · Output lines fade in instantly after command+outputDelaySeconds
 *       · Prompt color: green-ish; command: cream/ink; output: dim
 *       · Error/success kinds tint command line (red / green)
 *       · ansiAccent regex-tints command names (npm/git/claude/etc.) in accent
 *   - Optional bottom EditorialCaption strip (default off — terminals are self-explanatory)
 *
 * Motion grammar:
 *   - Window chrome lands at frame 0 (spring fade-in)
 *   - First line begins typing immediately after chrome lands
 *   - Each char appears one frame at charsPerSecond pace
 *   - After a command finishes, wait outputDelaySeconds, then flush outputs
 *   - Next line begins after this line's outputs flush
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
import type {
  TerminalCommand9x16Props,
  TerminalLine,
} from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette, FONT_STACKS } from "../brand";

// ─── Layout constants ───────────────────────────────────────────────────────
const WINDOW_WIDTH = 940;
const WINDOW_HEIGHT = 1400;
const WINDOW_LEFT = (1080 - WINDOW_WIDTH) / 2;
const WINDOW_TOP = 260; // accounts for optional breadcrumb (~80px) + breathing room
const WINDOW_RADIUS = 16;
const HEADER_HEIGHT = 56;
const CONTENT_PADDING_X = 32;
const CONTENT_PADDING_Y = 28;
const LINE_HEIGHT_RATIO = 1.45;

// Per A3 audit: standardize on the shared FONT_STACKS.mono so JetBrains Mono
// is the consistent code-annotation face across every composition.
const MONO_FONT_STACK = FONT_STACKS.mono;

// Terminal-specific colors (window chrome is intentionally darker than the
// palette paper so it reads as "an app window on the page").
const TERMINAL_BG_DARK = "#020812";
const TERMINAL_BG_CREAM = "#0B1020";
const PROMPT_COLOR_DARK = "#7EC699";
const PROMPT_COLOR_CREAM = "#3B7B4F";
const COMMAND_COLOR_DARK = "#E7E7E7";
const COMMAND_COLOR_CREAM = "#E7E7E7"; // window is dark in both modes; text stays light
const OUTPUT_COLOR_DARK = "#9CA3AF";
const OUTPUT_COLOR_CREAM = "#9CA3AF";
const ERROR_COLOR = "#FF6B6B";
const SUCCESS_COLOR = "#4ADE80";

// Regex that tints recognizable CLI command tokens with the resolved accent.
// Conservative list to avoid mis-tinting prose: well-known dev/AI CLIs only.
const ACCENT_TOKEN_REGEX =
  /\b(npm|npx|pnpm|yarn|bun|git|claude|cursor|vercel|next|node|deno|python|uv|pip|docker|kubectl|gh|curl|wget|ssh|brew|cargo|rustc|go|make)\b/g;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Pre-compute when each line/output starts and how long the command line takes
 * to type. Returns timings in frames (relative to frame 0 = first char of line 0).
 *
 * For each line i:
 *   - commandStartFrame: when char 0 of the command begins typing
 *   - commandEndFrame:   when the last char is on-screen
 *   - outputStartFrame:  commandEndFrame + outputDelay
 *   - lineEndFrame:      outputStartFrame (no per-output stagger; outputs flush at once)
 *
 * The next line's commandStartFrame = previous lineEndFrame.
 */
interface LineTiming {
  commandStartFrame: number;
  commandEndFrame: number;
  outputStartFrame: number;
  lineEndFrame: number;
}

function computeLineTimings(
  lines: TerminalLine[],
  charsPerSecond: number,
  outputDelaySeconds: number,
  fps: number,
  startOffsetFrames: number,
): LineTiming[] {
  const framesPerChar = fps / charsPerSecond;
  const outputDelayFrames = Math.round(outputDelaySeconds * fps);
  const timings: LineTiming[] = [];
  let cursor = startOffsetFrames;
  for (const line of lines) {
    const commandStartFrame = cursor;
    const commandLen = line.command.length;
    const commandEndFrame =
      commandStartFrame + Math.max(1, Math.ceil(commandLen * framesPerChar));
    const outputStartFrame = commandEndFrame + outputDelayFrames;
    const lineEndFrame = outputStartFrame;
    timings.push({
      commandStartFrame,
      commandEndFrame,
      outputStartFrame,
      lineEndFrame,
    });
    cursor = lineEndFrame;
  }
  return timings;
}

/**
 * Tint command-name tokens (npm, git, claude…) with the accent color when
 * ansiAccent is enabled. Returns an array of React nodes that can be embedded
 * inside a <span>.
 */
function tintCommandTokens(
  text: string,
  accentColor: string,
  enabled: boolean,
  keyPrefix: string,
): React.ReactNode[] {
  if (!enabled || !text) return [text];
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  // Local regex with lastIndex reset (the global one is shared module-wide).
  const re = new RegExp(ACCENT_TOKEN_REGEX.source, "g");
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }
    out.push(
      <span key={`${keyPrefix}-tok-${i++}`} style={{ color: accentColor, fontWeight: 600 }}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
}

// ─── Mac-style window chrome ────────────────────────────────────────────────
const TrafficLights: React.FC = () => {
  const dots = [
    { color: "#FF5F57", border: "#E0443E" }, // red
    { color: "#FEBC2E", border: "#DEA123" }, // yellow
    { color: "#28C840", border: "#1AAB29" }, // green
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        top: (HEADER_HEIGHT - 14) / 2,
        display: "flex",
        gap: 8,
      }}
    >
      {dots.map((d, idx) => (
        <div
          key={idx}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: d.color,
            border: `1px solid ${d.border}`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Blinking block cursor (50% duty, ~1.6s period) ─────────────────────────
const BlinkCursor: React.FC<{ color: string; fontSize: number }> = ({
  color,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const periodFrames = Math.max(1, Math.round(1.6 * fps));
  const phase = frame % periodFrames;
  const visible = phase < periodFrames / 2;
  return (
    <span
      style={{
        display: "inline-block",
        width: Math.round(fontSize * 0.55),
        height: fontSize,
        marginLeft: 2,
        verticalAlign: "text-bottom",
        background: visible ? color : "transparent",
        transition: "none",
      }}
    />
  );
};

// ─── Single rendered terminal line ──────────────────────────────────────────
const TerminalLineView: React.FC<{
  line: TerminalLine;
  timing: LineTiming;
  fontSize: number;
  isLastLine: boolean;
  ansiAccent: boolean;
  promptColor: string;
  commandColor: string;
  outputColor: string;
  accentColor: string;
  index: number;
}> = ({
  line,
  timing,
  fontSize,
  isLastLine,
  ansiAccent,
  promptColor,
  commandColor,
  outputColor,
  accentColor,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Don't render anything before this line is reached.
  if (frame < timing.commandStartFrame) return null;

  // Characters revealed so far.
  const framesPerChar = fps / 30; // unused; we re-derive below from timing window
  const elapsed = frame - timing.commandStartFrame;
  const totalCmdFrames = Math.max(1, timing.commandEndFrame - timing.commandStartFrame);
  const charProgress = Math.min(1, elapsed / totalCmdFrames);
  const visibleChars = Math.floor(charProgress * line.command.length);
  const visibleText = line.command.slice(0, visibleChars);
  const isTyping = frame < timing.commandEndFrame;
  void framesPerChar; // retain symbol; behavior is timing-window-driven for stability

  // Output visibility — flush in once we've crossed outputStartFrame.
  const outputsVisible = frame >= timing.outputStartFrame;

  // Resolve per-kind command color.
  let resolvedCommandColor = commandColor;
  if (line.kind === "error") resolvedCommandColor = ERROR_COLOR;
  if (line.kind === "success") resolvedCommandColor = SUCCESS_COLOR;

  return (
    <div style={{ marginBottom: Math.round(fontSize * 0.35) }}>
      {/* Command row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          fontFamily: MONO_FONT_STACK,
          fontSize,
          lineHeight: LINE_HEIGHT_RATIO,
          color: resolvedCommandColor,
        }}
      >
        {line.prompt && (
          <span style={{ color: promptColor, fontWeight: 700, flexShrink: 0 }}>
            {line.prompt}
          </span>
        )}
        <span style={{ wordBreak: "break-word" }}>
          {tintCommandTokens(
            visibleText,
            accentColor,
            ansiAccent && line.kind === "command",
            `line-${index}`,
          )}
          {/* Cursor only on the line that is currently typing OR the last line idle */}
          {(isTyping || (isLastLine && !outputsVisible)) && (
            <BlinkCursor color={resolvedCommandColor} fontSize={fontSize} />
          )}
        </span>
      </div>

      {/* Output rows (flush all at once with a fast fade) */}
      {line.output.length > 0 && outputsVisible && (
        <div
          style={{
            marginTop: Math.round(fontSize * 0.25),
            marginLeft: line.prompt ? Math.round(fontSize * 0.9) : 0,
            opacity: interpolate(
              frame,
              [timing.outputStartFrame, timing.outputStartFrame + 4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          {line.output.map((row, j) => (
            <div
              key={`out-${index}-${j}`}
              style={{
                fontFamily: MONO_FONT_STACK,
                fontSize,
                lineHeight: LINE_HEIGHT_RATIO,
                color: outputColor,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {row}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────
export const TerminalCommand9x16: React.FC<TerminalCommand9x16Props> = ({
  audioUrl,
  wordTimings,
  windowTitle,
  lines,
  charsPerSecond,
  outputDelaySeconds,
  ansiAccent,
  fontSize,
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

  // Terminal interior is always dark; "palette" mostly drives outer page & captions.
  const terminalBg = palette === "dark" ? TERMINAL_BG_DARK : TERMINAL_BG_CREAM;
  const promptColor = palette === "dark" ? PROMPT_COLOR_DARK : PROMPT_COLOR_CREAM;
  const commandColor = palette === "dark" ? COMMAND_COLOR_DARK : COMMAND_COLOR_CREAM;
  const outputColor = palette === "dark" ? OUTPUT_COLOR_DARK : OUTPUT_COLOR_CREAM;

  // Editorial spring (A1 audit): damping 22 / stiffness 130 / mass 0.7. The
  // chrome should land calmly — punchy springs would compete with the typewriter
  // animation inside the window.
  const chromeEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const chromeOpacity = interpolate(chromeEnter, [0, 1], [0, 1]);
  const chromeScale = interpolate(chromeEnter, [0, 1], [0.985, 1.0]);

  // First line begins typing after the chrome has visually landed (~0.5s).
  const typingStartOffset = Math.round(0.5 * fps);

  // Pre-compute per-line timings once. Recompute if lines/charsPerSecond change.
  const timings = useMemo(
    () =>
      computeLineTimings(
        lines,
        charsPerSecond,
        outputDelaySeconds,
        fps,
        typingStartOffset,
      ),
    [lines, charsPerSecond, outputDelaySeconds, fps, typingStartOffset],
  );

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

      {/* House-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* TERMINAL WINDOW */}
      <div
        style={{
          position: "absolute",
          top: WINDOW_TOP,
          left: WINDOW_LEFT,
          width: WINDOW_WIDTH,
          height: WINDOW_HEIGHT,
          borderRadius: WINDOW_RADIUS,
          background: terminalBg,
          boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.35)`,
          border: `1px solid rgba(255,255,255,0.06)`,
          overflow: "hidden",
          opacity: chromeOpacity,
          transform: `scale(${chromeScale})`,
          transformOrigin: "center top",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            position: "relative",
            height: HEADER_HEIGHT,
            background: "rgba(255,255,255,0.04)",
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrafficLights />
          {windowTitle && (
            <div
              style={{
                fontFamily: MONO_FONT_STACK,
                fontSize: 18,
                color: "rgba(231,231,231,0.65)",
                letterSpacing: "0.02em",
                userSelect: "none",
              }}
            >
              {windowTitle}
            </div>
          )}
        </div>

        {/* Content area — sequential lines */}
        <div
          style={{
            padding: `${CONTENT_PADDING_Y}px ${CONTENT_PADDING_X}px`,
            height: WINDOW_HEIGHT - HEADER_HEIGHT,
            overflow: "hidden",
          }}
        >
          {lines.map((line, i) => (
            <TerminalLineView
              key={`line-${i}`}
              line={line}
              timing={timings[i]}
              fontSize={fontSize}
              isLastLine={i === lines.length - 1}
              ansiAccent={ansiAccent}
              promptColor={promptColor}
              commandColor={commandColor}
              outputColor={outputColor}
              accentColor={resolvedAccent}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Optional word-by-word captions (default OFF — terminals are self-explanatory) */}
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

// Silence unused-import warnings for types only referenced in the schema.
