/**
 * KaraokeWithBlueChipPullout9x16 — Nate B Jones C7 Shorts pattern (9:16, 1080×1920, 30fps).
 *
 * Spec citation: references/creators/natebjones/ANALYSIS.md §2 "C7 — KaraokeWithBlueChipPullout9x16".
 * transitionVerb (honored precisely): "Hold the green-current-word karaoke baseline running
 * underneath; for each beat, slide a blue rounded-pill keyword chip in from the right edge of the
 * lower-third, hold while the keyword is spoken, then slide it back out before the next chip pulls in."
 *
 * Architecture
 * ------------
 * Two layers stacked on a dark/black background (per ANALYSIS Correction 2: Shorts STRIP slate
 * cards / watermark backplate and live on the caption layer):
 *
 *   1. Karaoke baseline — the existing `EditorialCaption` molecule, consumed READ-ONLY. We drive
 *      it in "custom" register with a transparent paper card so it reads as on-black karaoke, with
 *      the active word tinted Nate green (`activeWordColor`) and past words white.
 *
 *   2. Blue chip SCHEDULE — `EditorialCaption.pulloutChip` is a SINGLE per-render chip with a hard
 *      exit (no slide-out). The C7 transitionVerb requires a SCHEDULE of multiple chips that each
 *      slide IN and slide OUT, one per beat. So this composition owns the schedule: it maps
 *      `keywordChipSchedule` to whichever chip's [startMs,endMs] window contains the current frame
 *      and renders its OWN blue rounded-pill overlay with a symmetric slide-in / slide-out
 *      interpolation (no hard cut). Outside every window, no chip is shown.
 *
 * Plus a persistent `@armandointeligencia` handle chip lower-right (the ONLY continuous element
 * across Nate's 16:9 and 9:16 lanes — ANALYSIS Correction 2).
 *
 * Standalone-renderable: every schema field is `.default()`ed, including a short sample
 * `wordTimings` array and a `keywordChipSchedule` of 3 sample chips aligned to it.
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
  Easing,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { FONT_STACKS } from "../brand";

// ─── Local schema (shared schemas.ts intentionally untouched) ─────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const keywordChipSchema = z.object({
  /** Keyword text rendered inside the blue pill. */
  word: z.string(),
  /** Window start in milliseconds (chip begins sliding in around here). */
  startMs: z.number(),
  /** Window end in milliseconds (chip has slid back out by here). */
  endMs: z.number(),
});

export const karaokeWithBlueChipPulloutSchema = z.object({
  /** Audio track (staticFile path or absolute URL). Drives caption timing + duration. */
  audioUrl: z.string().default("audio.mp3"),
  /** Per-word karaoke timings (whisper-aligned in production). */
  wordTimings: z.array(wordTimingSchema).default([
    { text: "Claude", startFrame: 0, endFrame: 14, startSeconds: 0.0, endSeconds: 0.47 },
    { text: "is", startFrame: 15, endFrame: 22, startSeconds: 0.5, endSeconds: 0.73 },
    { text: "the", startFrame: 23, endFrame: 30, startSeconds: 0.77, endSeconds: 1.0 },
    { text: "best", startFrame: 31, endFrame: 52, startSeconds: 1.03, endSeconds: 1.73 },
    { text: "AI", startFrame: 53, endFrame: 74, startSeconds: 1.77, endSeconds: 2.47 },
    { text: "for", startFrame: 75, endFrame: 82, startSeconds: 2.5, endSeconds: 2.73 },
    { text: "writing", startFrame: 83, endFrame: 110, startSeconds: 2.77, endSeconds: 3.67 },
    { text: "production", startFrame: 111, endFrame: 140, startSeconds: 3.7, endSeconds: 4.67 },
    { text: "code", startFrame: 141, endFrame: 165, startSeconds: 4.7, endSeconds: 5.5 },
  ]),
  /**
   * SCHEDULE of blue keyword chips. At each frame, the chip whose [startMs,endMs]
   * window contains the current time slides in from the right into the lower-third,
   * holds while spoken (~1.5–2s), then slides back out before the next chip pulls in.
   */
  keywordChipSchedule: z.array(keywordChipSchema).default([
    { word: "Claude", startMs: 0, endMs: 1700 },
    { word: "best AI", startMs: 1770, endMs: 3670 },
    { word: "production code", startMs: 3700, endMs: 5800 },
  ]),
  /** Blue chip background (Nate's blue rounded pill). */
  chipColor: z.string().default("#3FB8FF"),
  /** Text color inside the blue chip. */
  chipTextColor: z.string().default("#001018"),
  /** Karaoke active (current) word color — Nate green. */
  activeWordColor: z.string().default("#2ECC71"),
  /** Karaoke past-word color (already-spoken words). */
  pastWordColor: z.string().default("#FFFFFF"),
  /** Composition background — Shorts grammar is dark/black. */
  backgroundColor: z.string().default("#000000"),
  /** Persistent lower-right handle chip text. */
  handle: z.string().default("@armandointeligencia"),
  /** Fallback duration (frames) when audio length cannot be derived. */
  durationFrames: z.number().min(1).default(180),
  /**
   * C7 transition verb — drives the chip motion. Default is Nate's C7 verb verbatim
   * (ANALYSIS.md §2 C7). Surfaced as a prop for traceability; the slide-in→hold→slide-out
   * envelope below IS this verb expressed in code.
   */
  transitionVerb: z
    .string()
    .default(
      "Hold the green-current-word karaoke baseline running underneath; for each beat, slide a blue rounded-pill keyword chip in from the right edge of the lower-third, hold while the keyword is spoken, then slide it back out before the next chip pulls in.",
    ),
});

export type KaraokeWithBlueChipPullout9x16Props = z.infer<
  typeof karaokeWithBlueChipPulloutSchema
>;

// ─── Layout constants ─────────────────────────────────────────────────────────
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;

// Chip slide envelope: time (ms) spent sliding in at the head of a window and
// sliding out at the tail. The middle is the "hold while spoken" beat.
const CHIP_SLIDE_MS = 280;

/**
 * Resolve the active chip for the current time. A chip is active while
 * `now ∈ [startMs, endMs)`. Returns the chip plus a 0→1→0 presence value:
 * ramps up over the first CHIP_SLIDE_MS (slide-in), holds at 1, ramps down over
 * the last CHIP_SLIDE_MS (slide-out). Symmetric so the chip never hard-cuts.
 */
function resolveActiveChip(
  schedule: KaraokeWithBlueChipPullout9x16Props["keywordChipSchedule"],
  nowMs: number,
): { word: string; presence: number } | null {
  const chip = schedule.find((c) => nowMs >= c.startMs && nowMs < c.endMs);
  if (!chip) return null;

  const windowLen = Math.max(1, chip.endMs - chip.startMs);
  // Clamp slide duration so in + out never exceed the window.
  const slide = Math.min(CHIP_SLIDE_MS, windowLen / 2);
  const intoWindow = nowMs - chip.startMs;
  const fromEnd = chip.endMs - nowMs;

  const inProgress = interpolate(intoWindow, [0, slide], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outProgress = interpolate(fromEnd, [0, slide], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { word: chip.word, presence: Math.min(inProgress, outProgress) };
}

// ─── Composition ──────────────────────────────────────────────────────────────
export const KaraokeWithBlueChipPullout9x16: React.FC<
  KaraokeWithBlueChipPullout9x16Props
> = ({
  audioUrl,
  wordTimings,
  keywordChipSchedule,
  chipColor,
  chipTextColor,
  activeWordColor,
  pastWordColor,
  backgroundColor,
  handle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nowMs = (frame / fps) * 1000;

  // Schedule is small; resolving per frame is cheap, but memoize against the
  // inputs that actually change frame-to-frame (nowMs) plus the schedule.
  const activeChip = useMemo(
    () => resolveActiveChip(keywordChipSchedule, nowMs),
    [keywordChipSchedule, nowMs],
  );

  // Slide-in from the RIGHT edge: presence 0 → chip parked at +120% (off-screen
  // right), presence 1 → chip at its resting 0 translate. Opacity rides the same
  // curve so the chip never appears mid-edge.
  const chipTranslatePct = activeChip ? (1 - activeChip.presence) * 120 : 120;
  const chipOpacity = activeChip ? activeChip.presence : 0;

  return (
    <AbsoluteFill style={{ background: backgroundColor }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* ── Layer 1: green-current-word karaoke baseline (read-only molecule) ── */}
      {/* Consumed without its pulloutChip prop — this composition owns the chip
          SCHEDULE itself (see Layer 2) because the molecule's single chip has a
          hard exit and cannot slide out. We pass a transparent paper card so the
          karaoke reads on black (Shorts grammar). register stays "custom" so the
          explicit accentColor (Nate green active word) and inkColor (white past
          words) win. */}
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 360,
          fontSize: 64,
          register: "custom",
          transition: "pop",
          paperColor: "transparent",
          mutedBorderColor: "transparent",
          accentColor: activeWordColor,
          inkColor: pastWordColor,
          maxWidthPx: 960,
          windowSize: 5,
        }}
      />

      {/* ── Layer 2: blue rounded-pill keyword chip SCHEDULE ── */}
      {/* One chip per beat slides in from the right edge into the lower-third,
          holds ~1.5–2s while the keyword is spoken, then slides back out before
          the next chip pulls in. Smooth slide via resolveActiveChip(); never a
          hard cut. */}
      {activeChip ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              bottom: "33%",
              right: "8%",
              transform: `translateX(${chipTranslatePct}%)`,
              opacity: chipOpacity,
            }}
          >
            <div
              style={{
                background: chipColor,
                color: chipTextColor,
                borderRadius: 999,
                padding: "14px 32px",
                fontFamily: FONT_STACKS.sans,
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {activeChip.word}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ── Persistent handle chip lower-right (only cross-lane element) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 64,
          fontFamily: FONT_STACKS.mono,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.82)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: "8px 20px",
          textTransform: "lowercase",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {handle}
      </div>

      {/* Hidden invariant guard — keeps FRAME_WIDTH/HEIGHT live for layout math. */}
      <span style={{ display: "none" }}>
        {FRAME_WIDTH}×{FRAME_HEIGHT}
      </span>
    </AbsoluteFill>
  );
};

export default KaraokeWithBlueChipPullout9x16;
