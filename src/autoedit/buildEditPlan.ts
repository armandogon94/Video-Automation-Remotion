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

    const shiftFrames = seg.editStartFrame - seg.source.startFrame;
    const shiftSeconds = shiftFrames / fps;
    out.push({
      text: w.text,
      startSeconds: w.startSeconds + shiftSeconds,
      endSeconds: w.endSeconds + shiftSeconds,
      startFrame: w.startFrame + shiftFrames,
      endFrame: w.endFrame + shiftFrames,
    });
  }

  return out;
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
