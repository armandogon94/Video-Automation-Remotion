/**
 * buildEditPlan — compose transcript + silence-segments + overlay-suggestions
 * + caption config into a single `EditPlan`.
 *
 * THE CORE TRANSFORM
 * ------------------
 * Silence-trim removes gaps, so SOURCE time ≠ EDIT time. This module owns the
 * one tricky bit: re-projecting SOURCE-time word timings onto the trimmed EDIT
 * timeline (`shiftWordsToEditTimeline`). Words that fall inside a trimmed gap are
 * dropped; words inside a kept segment are shifted left by the cumulative amount
 * trimmed before them. Overlays are then suggested from the SHIFTED (edit-time)
 * words, so every overlay frame already lines up with the rendered output.
 *
 * Pure logic + zod validation, no IO. The CLI (`cli.ts`) supplies the inputs
 * (whisper JSON, ffmpeg silences) and writes the result.
 */
import {
  editPlanSchema,
  type EditPlan,
  type EditPlanAspect,
  type EditPlanWord,
  type EditSegment,
  type CaptionTrack,
} from "./editPlan.js";
import { suggestOverlays, type SuggestOverlaysOptions, type SuggestStrategy } from "./suggestOverlays.js";

// ─────────────────────────────────────────────────────────────────────────────
// Source-time → edit-time word projection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Re-project SOURCE-time words onto the trimmed EDIT timeline defined by
 * `segments`. A word is kept iff its START falls within a kept segment's source
 * range; it is then shifted so that segment's source start maps to its
 * `editStartFrame`. Words inside trimmed gaps are dropped.
 */
export function shiftWordsToEditTimeline(
  words: EditPlanWord[],
  segments: EditSegment[],
  fps: number,
): EditPlanWord[] {
  if (segments.length === 0) return words; // no-trim plan → identity
  const out: EditPlanWord[] = [];

  for (const w of words) {
    const seg = segments.find(
      (s) =>
        w.startSeconds >= s.source.startSeconds &&
        w.startSeconds < s.source.endSeconds,
    );
    if (!seg) continue; // word fell inside a trimmed gap

    // Shift in SECONDS off the segment's edit-timeline start (FABLE §4.3 / Task
    // 2.2): the segment's edit frames are now quantized from cumulative seconds
    // (silenceTrim.toEditSegments), so shifting pre-rounded frames would re-import
    // the drift we just removed. Derive frames from the shifted seconds instead.
    const shiftSeconds = seg.editStartFrame / fps - seg.source.startSeconds;
    const newStartSeconds = w.startSeconds + shiftSeconds;
    let newEndSeconds = w.endSeconds + shiftSeconds;

    // Clamp the word END at the segment's edit boundary (FABLE §4.14 / Task 2.9):
    // a word straddling a cut otherwise keeps its full source duration and its
    // karaoke highlight bleeds into the next segment's first word.
    const segEditEndSeconds = seg.editEndFrame / fps;
    if (newEndSeconds > segEditEndSeconds) newEndSeconds = segEditEndSeconds;
    if (newEndSeconds < newStartSeconds) newEndSeconds = newStartSeconds;

    out.push({
      text: w.text,
      startSeconds: newStartSeconds,
      endSeconds: newEndSeconds,
      startFrame: Math.round(newStartSeconds * fps),
      endFrame: Math.min(seg.editEndFrame, Math.round(newEndSeconds * fps)),
      // Carry ASR word confidence through re-projection (GPT56-FINDINGS §2.4 —
      // downstream correction gates need it; field is .optional() on the schema).
      ...(w.probability !== undefined ? { probability: w.probability } : {}),
    });
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transcript coverage gate — pure evaluator (triage #7; Sol 0716 §2.1)
// ─────────────────────────────────────────────────────────────────────────────

/** Blocking floor for word coverage (words per second of source media). Real
 *  raw takes from the 2026-07-16 multi-take experiment sit below the 1.5 w/s
 *  WARNING line (long thinking pauses) but well above this: under 0.9 w/s the
 *  transcript is missing so much speech that captions and word-onset snapping
 *  would be built on holes. */
export const MIN_WORDS_PER_SECOND = 0.9;
/** Blocking ceiling for the share of low-confidence words. */
export const MAX_LOW_CONFIDENCE_SHARE = 0.4;
/** A word below this ASR probability counts as low-confidence (same line the
 *  cli suspect-warning has always used). */
export const LOW_CONFIDENCE_PROBABILITY = 0.15;

export interface TranscriptCoverageResult {
  /** words.length / durationSeconds. */
  wordsPerSecond: number;
  /** Share of probability-carrying words below {@link LOW_CONFIDENCE_PROBABILITY};
   *  0 when no word carries a probability (nothing to assess). */
  lowConfidenceShare: number;
  /** How many words carried a probability (the share's denominator). */
  assessedWordCount: number;
  /** Human-readable blocking failures, each naming the measured number and the
   *  threshold it broke. Empty ⇒ the gate passes. */
  failures: string[];
}

/**
 * Evaluate the BLOCKING transcript coverage gate. Pure — the cli turns a
 * non-empty `failures` into a hard exit unless `--force-transcript` is passed.
 *
 * This is deliberately a lower bar than `warnIfTranscriptSuspect` (cli.ts):
 * the warning flags "review before editing" territory (≥1.5 w/s expected,
 * languageProbability), while these floors mark transcripts that are unsafe to
 * cut against at all — the §6 hallucination class (6 words for 23 s) and
 * wrong-language decodes where most words carry near-zero confidence.
 */
export function evaluateTranscriptCoverage(
  words: EditPlanWord[],
  durationSeconds: number,
): TranscriptCoverageResult {
  const wordsPerSecond = durationSeconds > 0 ? words.length / durationSeconds : 0;
  const withProb = words.filter((w) => typeof w.probability === "number");
  const lowConfidenceShare =
    withProb.length === 0
      ? 0
      : withProb.filter((w) => (w.probability as number) < LOW_CONFIDENCE_PROBABILITY).length /
        withProb.length;

  const failures: string[] = [];
  if (wordsPerSecond < MIN_WORDS_PER_SECOND) {
    failures.push(
      `word coverage ${wordsPerSecond.toFixed(2)} words/s (${words.length} words over ` +
        `${durationSeconds.toFixed(1)}s) is below the ${MIN_WORDS_PER_SECOND} words/s minimum`,
    );
  }
  if (lowConfidenceShare > MAX_LOW_CONFIDENCE_SHARE) {
    failures.push(
      `${Math.round(lowConfidenceShare * 100)}% of ${withProb.length} probability-carrying ` +
        `words are below p=${LOW_CONFIDENCE_PROBABILITY} (maximum ${Math.round(
          MAX_LOW_CONFIDENCE_SHARE * 100,
        )}%)`,
    );
  }

  return {
    wordsPerSecond,
    lowConfidenceShare,
    assessedWordCount: withProb.length,
    failures,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildEditPlan
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildEditPlanInput {
  sourceVideo: string;
  aspect: EditPlanAspect;
  fps: number;
  /** SOURCE video duration in frames (before trim). */
  sourceDurationFrames: number;
  /** Kept segments from silenceTrim.toEditSegments (already edit-mapped). */
  segments: EditSegment[];
  /** SOURCE-time word timings from whisper. Empty when register === 'none'. */
  sourceWords: EditPlanWord[];
  /** Caption register + position (ADR-002). 'none' → no captions, no overlays-from-words still run. */
  caption: Pick<CaptionTrack, "register" | "position" | "mode"> &
    Partial<Pick<CaptionTrack, "customXY">>;
  /** Overlay suggester knobs. */
  overlayOptions?: SuggestOverlaysOptions;
  /** Swap the suggester (rule-based default; LLM later — ADR-003 §5). */
  overlayStrategy?: SuggestStrategy;
}

/**
 * Compose all inputs into a validated `EditPlan`. Steps:
 *   1. Shift source words → edit-time words (across trimmed gaps).
 *   2. Build the caption track (empty wordTimings when register === 'none').
 *   3. Suggest overlays from the edit-time words (skipped entirely when there
 *      are no words — e.g. register 'none' with no transcript).
 *   4. Assemble + validate via the zod schema.
 */
export function buildEditPlan(input: BuildEditPlanInput): EditPlan {
  const {
    sourceVideo, aspect, fps, sourceDurationFrames, segments,
    sourceWords, caption, overlayOptions, overlayStrategy,
  } = input;

  const editWords = shiftWordsToEditTimeline(sourceWords, segments, fps);

  const editDuration =
    segments.length === 0
      ? sourceDurationFrames
      : segments[segments.length - 1].editEndFrame;

  const captionTrack: CaptionTrack = {
    register: caption.register,
    position: caption.position,
    customXY: caption.customXY,
    mode: caption.mode,
    // ADR-002 §3.3: when register === 'none', no burned-in captions.
    wordTimings: caption.register === "none" ? [] : editWords,
  };

  // Overlays are suggested from the edit-time words regardless of caption
  // register (a 'none'-caption video can still get over-speaker graphics), but
  // only if we actually have words to scan.
  const overlayTrack =
    editWords.length === 0
      ? []
      : suggestOverlays(editWords, overlayOptions ?? {}, overlayStrategy);

  const plan: EditPlan = {
    version: 1,
    sourceVideo,
    aspect,
    fps,
    sourceDurationFrames,
    editDurationFrames: editDuration,
    segments,
    captionTrack,
    overlayTrack,
    provenance: {
      overlaySource: overlayStrategy ? "llm-assisted" : "rule-based",
      cutSource: "none", // speaker-vs-broll cut detection is deferred (ADR-003 §5)
      silenceSource: segments.length > 0 ? "ffmpeg-silencedetect" : "none",
      generatedAt: new Date().toISOString(),
    },
  };

  // Validate before returning — guarantees the artifact matches the contract.
  return editPlanSchema.parse(plan);
}
