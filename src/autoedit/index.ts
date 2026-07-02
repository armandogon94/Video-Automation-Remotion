/**
 * src/autoedit — auto-edit orchestration (begin: design + scaffold).
 *
 * Public surface. See docs/research/wave-8/ADR-003-autoedit-pipeline.md for the
 * architecture and the deferred (LLM-assisted) roadmap.
 */
export * from "./editPlan.js";
export {
  parseSilenceDetect,
  keepSegmentsFromSilences,
  toEditSegments,
  editDurationFrames,
  detectSilences,
  type SilenceInterval,
  type KeepSpan,
  type SilenceDetectOptions,
  type KeepSegmentsOptions,
} from "./silenceTrim.js";
export {
  suggestOverlays,
  ruleBasedStrategy,
  isNumberBeat,
  isEmphasisBeat,
  isOrdinalBeat,
  isBrandBeat,
  type SuggestStrategy,
  type SuggestOverlaysOptions,
} from "./suggestOverlays.js";
export {
  buildEditPlan,
  shiftWordsToEditTimeline,
  type BuildEditPlanInput,
} from "./buildEditPlan.js";
