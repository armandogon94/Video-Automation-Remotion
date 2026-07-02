/**
 * silenceTrim — detect silent spans and derive the KEEP segments.
 *
 * WHAT THIS DOES
 * --------------
 * "Trim dead air" — north-star bullet 4 (WAVE8-PLAN). Given a video/audio file,
 * run ffmpeg's `silencedetect` audio filter, parse its stderr log into silence
 * intervals, then INVERT those intervals into the kept (talking) segments and
 * map them onto a trimmed edit timeline (`EditSegment[]`).
 *
 * The PARSING is the load-bearing, unit-testable core (`parseSilenceDetect`,
 * `keepSegmentsFromSilences`, `toEditSegments`) — all pure functions, no IO.
 * `detectSilences` is the thin ffmpeg shell that produces the raw log; it is the
 * only part that touches the filesystem / subprocess.
 *
 * THE FFMPEG COMMAND (exact)
 * --------------------------
 *   ffmpeg -hide_banner -nostats -i <input> \
 *     -af silencedetect=noise=<thresholdDb>dB:d=<minSilenceSeconds> \
 *     -f null -
 *
 * `silencedetect` writes lines to STDERR like:
 *   [silencedetect @ 0x...] silence_start: 12.345
 *   [silencedetect @ 0x...] silence_end: 13.901 | silence_duration: 1.556
 * We parse those pairs. (Follows the existing command-builder pattern in
 * `src/ffmpeg/commands.ts`: `execa("ffmpeg", [...])`.)
 *
 * No Remotion imports. `execa` is only imported inside `detectSilences`.
 */
import { execa } from "execa";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A detected silent interval, in seconds. */
export interface SilenceInterval {
  startSeconds: number;
  endSeconds: number;
}

/** A kept (talking) span in SOURCE-time seconds. */
export interface KeepSpan {
  startSeconds: number;
  endSeconds: number;
}

export interface SilenceDetectOptions {
  /** Noise floor in dB (more negative = stricter; ffmpeg default is -30). */
  thresholdDb?: number;
  /** Minimum silence duration to treat as a cut, in seconds (default 0.5). */
  minSilenceSeconds?: number;
}

const DEFAULT_THRESHOLD_DB = -30;
const DEFAULT_MIN_SILENCE_S = 0.5;
/**
 * Edge padding (seconds) grown into the silence on EACH side of a kept span.
 *
 * `silencedetect`'s `silence_start` is the instant audio drops below the noise
 * floor — i.e. the END of audible speech — and `silence_end` is where speech
 * RESUMES. A kept span therefore begins exactly on a word ONSET and ends exactly
 * on a word TAIL. The 30ms afade in/out applied per segment (renderFromPlan.ts)
 * would then ramp over the first/last 30ms of real speech. Padding each edge into
 * the adjacent silence gives those fades silent headroom (FABLE §4.4 / Task 2.1;
 * corrects FFMPEG-RULES-AUDIT.md rule 7's wrong "N/A" verdict). Clamped so padding
 * can never overlap a neighboring keep or run past the media edges.
 */
const DEFAULT_PAD_S = 0.05;

// ─────────────────────────────────────────────────────────────────────────────
// Pure parser — the unit-testable core
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse ffmpeg `silencedetect` stderr text into silence intervals.
 *
 * Robust to:
 *  - lines interleaved with other ffmpeg log noise,
 *  - a trailing `silence_start` with no matching `silence_end` (silence runs to
 *    EOF) — emitted with `endSeconds = Infinity` so the caller can clamp to the
 *    real media duration,
 *  - both `silence_end: X | silence_duration: Y` and bare `silence_end: X`.
 */
export function parseSilenceDetect(stderr: string): SilenceInterval[] {
  const intervals: SilenceInterval[] = [];
  let openStart: number | null = null;

  const startRe = /silence_start:\s*(-?\d+(?:\.\d+)?)/;
  const endRe = /silence_end:\s*(-?\d+(?:\.\d+)?)/;

  for (const line of stderr.split(/\r?\n/)) {
    const startMatch = startRe.exec(line);
    if (startMatch) {
      openStart = Math.max(0, parseFloat(startMatch[1]));
      continue;
    }
    const endMatch = endRe.exec(line);
    if (endMatch && openStart !== null) {
      const endSeconds = parseFloat(endMatch[1]);
      intervals.push({ startSeconds: openStart, endSeconds });
      openStart = null;
    }
  }

  // Dangling silence_start with no end → runs to EOF.
  if (openStart !== null) {
    intervals.push({ startSeconds: openStart, endSeconds: Infinity });
  }

  return intervals;
}

/** Options for {@link keepSegmentsFromSilences}. */
export interface KeepSegmentsOptions {
  /**
   * Drop kept spans shorter than this (seconds) BEFORE padding — avoids
   * 2-frame slivers between back-to-back silences. Default 0.2. Dropped spans
   * are logged (FABLE §4.15) so a vanished short word ("sí", "ok") is at least
   * visible rather than silently deleted.
   */
  minKeepSeconds?: number;
  /**
   * Edge padding (seconds) grown into the adjacent silence on each side of a
   * kept span AFTER the min-keep filter, so the per-segment 30ms afades land in
   * silence instead of on word onsets/tails (FABLE §4.4 / Task 2.1). Default
   * 0.05. Clamped to the media edges and to half the gap to the neighboring
   * keep, so padded keeps can never overlap.
   */
  padSeconds?: number;
  /** Optional logger for dropped-span diagnostics. Default: console.log. */
  log?: (msg: string) => void;
}

/**
 * Invert silence intervals into KEEP spans across [0, durationSeconds].
 *
 * Clamps any `Infinity` end to `durationSeconds`, drops spans shorter than
 * `minKeepSeconds` (logging how many were dropped), merges/sorts defensively so
 * callers can pass unsorted/overlapping silences, and finally grows a small
 * `padSeconds` edge back into the adjacent silence on each side of every kept
 * span (clamped so padded keeps can never overlap or exceed the media).
 */
export function keepSegmentsFromSilences(
  silences: SilenceInterval[],
  durationSeconds: number,
  options: KeepSegmentsOptions = {},
): KeepSpan[] {
  if (durationSeconds <= 0) return [];

  const minKeepSeconds = options.minKeepSeconds ?? 0.2;
  const padSeconds = Math.max(0, options.padSeconds ?? DEFAULT_PAD_S);
  const log = options.log ?? ((m: string) => console.log(m));

  // Normalize: clamp to [0, duration], sort, merge overlaps.
  const clamped = silences
    .map((s) => ({
      startSeconds: Math.max(0, Math.min(s.startSeconds, durationSeconds)),
      endSeconds: Math.max(0, Math.min(s.endSeconds, durationSeconds)),
    }))
    .filter((s) => s.endSeconds > s.startSeconds)
    .sort((a, b) => a.startSeconds - b.startSeconds);

  const merged: SilenceInterval[] = [];
  for (const s of clamped) {
    const last = merged[merged.length - 1];
    if (last && s.startSeconds <= last.endSeconds) {
      last.endSeconds = Math.max(last.endSeconds, s.endSeconds);
    } else {
      merged.push({ ...s });
    }
  }

  // Walk the gaps between silences — those are the kept spans.
  const rawKeeps: KeepSpan[] = [];
  let cursor = 0;
  for (const s of merged) {
    if (s.startSeconds > cursor) {
      rawKeeps.push({ startSeconds: cursor, endSeconds: s.startSeconds });
    }
    cursor = Math.max(cursor, s.endSeconds);
  }
  if (cursor < durationSeconds) {
    rawKeeps.push({ startSeconds: cursor, endSeconds: durationSeconds });
  }

  // Drop sub-minKeep slivers FIRST (before padding would inflate them past the
  // threshold), and surface the count so a vanished short word is visible.
  const kept = rawKeeps.filter(
    (k) => k.endSeconds - k.startSeconds >= minKeepSeconds,
  );
  const droppedCount = rawKeeps.length - kept.length;
  if (droppedCount > 0) {
    log(
      `silence-trim: dropped ${droppedCount} sub-${minKeepSeconds}s kept span(s) ` +
        `(short words between two pauses can vanish — see FABLE §4.15)`,
    );
  }

  if (padSeconds === 0) return kept;

  // Grow each edge into the adjacent silence, clamped to the media and to half
  // the gap to the neighboring keep (so no two padded keeps ever overlap).
  return kept.map((k, i) => {
    const prevEnd = i > 0 ? kept[i - 1].endSeconds : 0;
    const nextStart = i < kept.length - 1 ? kept[i + 1].startSeconds : durationSeconds;
    const leftRoom = Math.max(0, (k.startSeconds - prevEnd) / 2);
    const rightRoom = Math.max(0, (nextStart - k.endSeconds) / 2);
    const padLeft = Math.min(padSeconds, leftRoom, k.startSeconds);
    const padRight = Math.min(padSeconds, rightRoom, durationSeconds - k.endSeconds);
    return {
      startSeconds: Math.max(0, k.startSeconds - padLeft),
      endSeconds: Math.min(durationSeconds, k.endSeconds + padRight),
    };
  });
}

import {
  type EditSegment,
  type SpanMode,
} from "./editPlan.js";

/**
 * Map kept SOURCE spans onto a trimmed EDIT timeline as `EditSegment[]`.
 *
 * Concatenates kept spans back-to-back: the first kept span starts at edit
 * frame 0, each subsequent span starts where the previous ended (gaps removed).
 * Every segment gets BOTH source and edit frame coordinates (design principle 2
 * in editPlan.ts). `mode` defaults to `"speaker"` (the first pass keeps the
 * speaker on-camera; b-roll cut detection is the deferred LLM step).
 */
export function toEditSegments(
  keeps: KeepSpan[],
  fps: number,
  mode: SpanMode = "speaker",
): EditSegment[] {
  const segments: EditSegment[] = [];
  // Accumulate the edit-timeline position in SECONDS and quantize the cumulative
  // value ONCE per boundary (FABLE §4.3 / Task 2.2). ffmpeg concatenates segments
  // whose real durations are `endSeconds - startSeconds` (sample-accurate audio),
  // but the OLD code computed each segment's edit length independently as
  // `round(end·fps) - round(start·fps)` and summed those — each contributing up to
  // ±1 frame of error that random-walked across N cuts, drifting captions/overlays
  // from the audio by the end of a long edit. Quantizing the CUMULATIVE seconds
  // bounds every boundary's error to ±0.5 frame regardless of N (no accumulation).
  let editCursorSeconds = 0;

  keeps.forEach((k, i) => {
    const lengthSeconds = Math.max(0, k.endSeconds - k.startSeconds);
    const sourceStartFrame = Math.round(k.startSeconds * fps);
    const sourceEndFrame = Math.round(k.endSeconds * fps);
    const editStartFrame = Math.round(editCursorSeconds * fps);
    const editEndFrame = Math.round((editCursorSeconds + lengthSeconds) * fps);

    segments.push({
      id: `seg-${i}`,
      source: {
        startSeconds: k.startSeconds,
        endSeconds: k.endSeconds,
        startFrame: sourceStartFrame,
        endFrame: sourceEndFrame,
      },
      editStartFrame,
      editEndFrame,
      mode,
    });

    editCursorSeconds += lengthSeconds;
  });

  return segments;
}

/** Total trimmed edit-timeline length implied by a set of edit segments. */
export function editDurationFrames(segments: EditSegment[]): number {
  return segments.length === 0
    ? 0
    : segments[segments.length - 1].editEndFrame;
}

// ─────────────────────────────────────────────────────────────────────────────
// ffmpeg shell — the only IO in this module
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run ffmpeg `silencedetect` over `inputPath` and return parsed silence
 * intervals. Throws an actionable error if ffmpeg is missing or fails (per the
 * "error messages must be actionable" convention in CLAUDE.md).
 */
export async function detectSilences(
  inputPath: string,
  opts: SilenceDetectOptions = {},
): Promise<SilenceInterval[]> {
  const thresholdDb = opts.thresholdDb ?? DEFAULT_THRESHOLD_DB;
  const minSilence = opts.minSilenceSeconds ?? DEFAULT_MIN_SILENCE_S;

  try {
    // silencedetect logs to STDERR; -f null - discards the muxed output.
    const result = await execa(
      "ffmpeg",
      [
        "-hide_banner",
        "-nostats",
        "-i",
        inputPath,
        "-af",
        `silencedetect=noise=${thresholdDb}dB:d=${minSilence}`,
        "-f",
        "null",
        "-",
      ],
      { reject: false },
    );
    // ffmpeg writes the analysis to stderr regardless of exit status.
    const intervals = parseSilenceDetect(result.stderr ?? "");

    // A genuinely-failed run (corrupt file, no audio stream, bad path) exits
    // non-zero and emits no silence lines. Returning `[]` there silently means
    // "keep everything" — an untrimmed edit ships with no warning. Surface it
    // loudly instead (FABLE §4.8 / Task 2.5). A clip with zero silences exits 0,
    // so a legitimate no-silence result is untouched.
    if (result.exitCode !== 0 && intervals.length === 0) {
      const stderrTail = (result.stderr ?? "").split(/\r?\n/).slice(-6).join("\n");
      throw new Error(
        `silencedetect failed for "${inputPath}" (ffmpeg exit ${result.exitCode}, no silence data). ` +
          `Check the file is a valid media file with an audio stream. ffmpeg stderr tail:\n${stderrTail}`,
      );
    }

    return intervals;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `silencedetect failed for "${inputPath}". Is ffmpeg installed (brew install ffmpeg) and the path correct? Underlying error: ${msg}`,
    );
  }
}
