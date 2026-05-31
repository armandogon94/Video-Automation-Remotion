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

/**
 * Invert silence intervals into KEEP spans across [0, durationSeconds].
 *
 * Clamps any `Infinity` end to `durationSeconds`, drops spans shorter than
 * `minKeepSeconds` (avoids 2-frame slivers between back-to-back silences), and
 * merges/sorts defensively so callers can pass unsorted, overlapping silences.
 */
export function keepSegmentsFromSilences(
  silences: SilenceInterval[],
  durationSeconds: number,
  minKeepSeconds = 0.2,
): KeepSpan[] {
  if (durationSeconds <= 0) return [];

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
  const keeps: KeepSpan[] = [];
  let cursor = 0;
  for (const s of merged) {
    if (s.startSeconds > cursor) {
      keeps.push({ startSeconds: cursor, endSeconds: s.startSeconds });
    }
    cursor = Math.max(cursor, s.endSeconds);
  }
  if (cursor < durationSeconds) {
    keeps.push({ startSeconds: cursor, endSeconds: durationSeconds });
  }

  return keeps.filter((k) => k.endSeconds - k.startSeconds >= minKeepSeconds);
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
  let editCursorFrame = 0;

  keeps.forEach((k, i) => {
    const sourceStartFrame = Math.round(k.startSeconds * fps);
    const sourceEndFrame = Math.round(k.endSeconds * fps);
    const lengthFrames = Math.max(0, sourceEndFrame - sourceStartFrame);
    const editStartFrame = editCursorFrame;
    const editEndFrame = editStartFrame + lengthFrames;

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

    editCursorFrame = editEndFrame;
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
    return parseSilenceDetect(result.stderr ?? "");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `silencedetect failed for "${inputPath}". Is ffmpeg installed (brew install ffmpeg) and the path correct? Underlying error: ${msg}`,
    );
  }
}
