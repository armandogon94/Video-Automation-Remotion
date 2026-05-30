/**
 * dwellBeat — held stillness as climax (Simon Hoiberg V4 finding).
 *
 * "After a string of expressive frames, Simon physically arrests his body — hands
 *  stop, eyes locked, deadpan for ≥0.8 s. Held stillness AS climax."
 *
 * In our pipeline this is a SCENE TYPE — a 1.0–1.5 s zero-parallax / zero-animation
 * window aligned to a punchline word in the Whisper transcript.
 *
 * Usage in a composition:
 *
 *   const beats = findDwellBeats(wordTimings, ["polished", "discipline"]);
 *   // returns [{ startFrame, endFrame, anchorWord }] — render frozen frames within those ranges.
 *
 * Helper for templates that opt-in to a "freeze on this word" behavior:
 *   isInDwellBeat(frame, beats) → boolean
 */
import type { WordTiming } from "../compositions/schemas";

export interface DwellBeat {
  /** First frame of the held window. */
  startFrame: number;
  /** Last frame (exclusive) of the held window. */
  endFrame: number;
  /** Which spoken word triggered this beat. */
  anchorWord: string;
}

export interface FindDwellBeatsOptions {
  /** Default dwell duration in frames (default 36 = 1.2s at 30fps). */
  durationFrames?: number;
  /** Anchor at word `startFrame` (true) or center on it (false). Default true. */
  anchorAtStart?: boolean;
  /** Case-insensitive matching. Default true. */
  caseInsensitive?: boolean;
}

/**
 * Find every dwell-beat window in a transcript by matching anchor keywords.
 *
 * Matches are exact word matches against the `text` field (after optional case-fold).
 * If a keyword appears multiple times, returns one beat per occurrence.
 */
export function findDwellBeats(
  wordTimings: WordTiming[],
  anchorKeywords: string[],
  opts: FindDwellBeatsOptions = {},
): DwellBeat[] {
  const {
    durationFrames = 36,
    anchorAtStart = true,
    caseInsensitive = true,
  } = opts;
  const normalizedKeywords = caseInsensitive
    ? new Set(anchorKeywords.map((k) => k.toLowerCase()))
    : new Set(anchorKeywords);
  const beats: DwellBeat[] = [];
  for (const w of wordTimings) {
    const wt = caseInsensitive ? w.text.toLowerCase() : w.text;
    // Strip surrounding punctuation for fairer matching: "polished," → "polished"
    const stripped = wt.replace(/^[^a-z0-9áéíóúüñ]+|[^a-z0-9áéíóúüñ]+$/giu, "");
    if (!normalizedKeywords.has(stripped)) continue;
    const start = anchorAtStart
      ? w.startFrame
      : Math.round((w.startFrame + w.endFrame) / 2 - durationFrames / 2);
    beats.push({
      startFrame: start,
      endFrame: start + durationFrames,
      anchorWord: w.text,
    });
  }
  return beats;
}

/**
 * True if the given frame falls inside any dwell beat.
 *
 * Use this in your composition to suppress per-frame animation:
 *
 *   const dwelling = isInDwellBeat(frame, beats);
 *   const opacity = dwelling ? holdOpacity : computedOpacity;
 */
export function isInDwellBeat(frame: number, beats: DwellBeat[]): boolean {
  return beats.some((b) => frame >= b.startFrame && frame < b.endFrame);
}

/**
 * Total dwell-time in seconds for analytics / over-edit detection.
 */
export function totalDwellSeconds(beats: DwellBeat[], fps: number): number {
  return beats.reduce((acc, b) => acc + (b.endFrame - b.startFrame) / fps, 0);
}
