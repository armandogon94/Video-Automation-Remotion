/**
 * EditPlan — the auto-edit data model.
 *
 * WHAT THIS IS
 * ------------
 * The single serializable artifact the auto-edit pipeline produces and the
 * render step consumes. An `EditPlan` describes a FINISHED EDIT of a
 * talking-head video as a timeline of decisions, independent of how it was
 * derived (rule-based now, LLM-assisted later — see ADR-003 §5). It is the
 * contract between:
 *   - the analysis stage (transcribe → silence-trim → overlay-suggest), and
 *   - the render stage (`SpeakerOverlayScene{16x9,9x16}` + the overlay
 *     registry consuming `overlayTrack`, `captionTrack`, `segments`).
 *
 * DESIGN PRINCIPLES
 * -----------------
 * 1. **Frame-native.** Every time is stored in BOTH seconds and frames at a
 *    known `fps`. Remotion is frame-driven; ffmpeg is seconds-driven; we carry
 *    both so neither consumer has to recompute (and risk rounding drift).
 * 2. **Source-time vs edit-time.** Silence-trim removes spans, so the rendered
 *    timeline is SHORTER than the source. Each kept segment records its source
 *    range AND its position on the trimmed edit timeline (`editStartFrame`).
 *    Overlays/captions are authored against EDIT-time frames so they line up
 *    with what the viewer actually sees.
 * 3. **Tracks, not a flat list.** Captions, overlays, and per-span camera mode
 *    are independent tracks layered over the kept segments — mirrors the
 *    `SpeakerOverlayScene` layer stack (base video → overlay slot → caption).
 * 4. **Closed vocabulary, open props.** `overlayType` is the OV1–OV12 vocabulary
 *    from `references/creators/alexhormozi/OVERLAY-ANALYSIS.md`, mapped 1:1 to
 *    the component names under `src/components/overlays/`. `props` is an
 *    intentionally-loose `z.record` because each overlay molecule owns its own
 *    zod schema; the registry (see ADR-003 §4.3) validates `props` against the
 *    matching molecule schema at render time. We do NOT re-declare every
 *    molecule schema here (that would couple this model to files other agents
 *    own and edit).
 *
 * No Remotion / ffmpeg imports — pure zod + types, so it can run in the CLI,
 * in tests, and (eventually) inside a Remotion composition's prop validation.
 */
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Per-word timing — same shape as the whisper output (`transcribe.py`) and the
 *  repo-wide `WordTiming` (see `src/schemas.ts`, `FloatingCaption`). Carried on
 *  the caption track so the karaoke renderer has per-word boundaries. */
export const editPlanWordSchema = z.object({
  text: z.string(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  startFrame: z.number(),
  endFrame: z.number(),
});
export type EditPlanWord = z.infer<typeof editPlanWordSchema>;

/** A time window expressed in BOTH units (see design principle 1). */
export const timeSpanSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
  startFrame: z.number(),
  endFrame: z.number(),
});
export type TimeSpan = z.infer<typeof timeSpanSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Segment track — the kept spans after silence-trim
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-span camera mode. `speaker` = stay on the talking-head (overlays
 * composite OVER the live footage — the OV1–OV12 lane). `broll` = cut away to a
 * full-screen motion-graphic/B-roll plate (the speaker is GONE for this span;
 * see OVERLAY-ANALYSIS §0 cutaway-vs-overlay distinction). The first pass emits
 * only `speaker`; `broll` cut detection is the deferred LLM step (ADR-003 §5).
 */
export const spanModeSchema = z.enum(["speaker", "broll"]);
export type SpanMode = z.infer<typeof spanModeSchema>;

/**
 * A KEPT segment of the source video (silence-trim removed the gaps between
 * segments). `source*` = where it lives in the ORIGINAL file (what ffmpeg cuts);
 * `edit*` = where it lands on the trimmed output timeline (what overlays/captions
 * are authored against). For a no-trim plan, source and edit ranges are equal.
 */
export const editSegmentSchema = z.object({
  /** Stable id, e.g. "seg-0". */
  id: z.string(),
  /** Range in the SOURCE video — the cut ffmpeg performs. */
  source: timeSpanSchema,
  /** Frame on the trimmed EDIT timeline where this segment begins. */
  editStartFrame: z.number(),
  /** Frame on the trimmed EDIT timeline where this segment ends (exclusive). */
  editEndFrame: z.number(),
  /** Camera mode for this span. */
  mode: spanModeSchema,
});
export type EditSegment = z.infer<typeof editSegmentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Caption track
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The caption track. `register` follows ADR-002 (punchy/editorial/technical/
 * none). When `register === 'none'` the renderer skips the caption layer
 * entirely AND the analysis stage may skip whisper (ADR-002 §3.3 / the task
 * brief: "when register='none' skip whisper"). `position` maps 1:1 to
 * `FloatingCaption.position`. `wordTimings` are EDIT-time frames (already
 * shifted across trimmed gaps).
 */
export const captionTrackSchema = z.object({
  register: z.enum(["punchy", "editorial", "technical", "none"]).default("editorial"),
  /** Mirrors FloatingCaption.position. */
  position: z
    .enum(["bottom-center", "center", "top", "custom"])
    .default("bottom-center"),
  /** Used only when position === 'custom'. */
  customXY: z.object({ xPct: z.number(), yPct: z.number() }).optional(),
  mode: z.enum(["karaoke", "sentence"]).default("karaoke"),
  /** EDIT-time per-word timings. Empty when register === 'none'. */
  wordTimings: z.array(editPlanWordSchema).default([]),
});
export type CaptionTrack = z.infer<typeof captionTrackSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Overlay track
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The OV1–OV12 over-speaker overlay vocabulary, named by their concrete
 * component files under `src/components/overlays/`. Kept as a closed enum so the
 * planner and the render registry agree on a fixed set; extend deliberately
 * when a new molecule lands. Mapping (OV# → component → enum member):
 *   OV1  YellowGlowWordCallout        → "YellowGlowWordCallout"
 *   OV2  FloatingNumberedChipRow      → "FloatingNumberedChipRow"
 *   OV3  BuildingBulletListOverSpeaker→ "BuildingBulletListOverSpeaker"
 *   OV4  IconStatChipStack            → "IconStatChipStack"
 *   OV5  DiagnosticCalloutCard        → "DiagnosticCalloutCard"
 *   OV6  FloatingTweetCardOverSpeaker → "FloatingTweetCardOverSpeaker"
 *   OV7  ColumnarNumberWithDividers   → "ColumnarNumberWithDividers"
 *   OV10/OV11 IconPopOverSpeaker      → "IconPopOverSpeaker"
 * OV8/OV9/OV12 have no shipped molecule yet (see OVERLAY-ANALYSIS §3) — omitted
 * from the enum until their components exist; the suggester never emits them.
 */
export const overlayTypeSchema = z.enum([
  "YellowGlowWordCallout",
  "FloatingNumberedChipRow",
  "BuildingBulletListOverSpeaker",
  "IconStatChipStack",
  "DiagnosticCalloutCard",
  "FloatingTweetCardOverSpeaker",
  "ColumnarNumberWithDividers",
  "IconPopOverSpeaker",
]);
export type OverlayType = z.infer<typeof overlayTypeSchema>;

/**
 * Anchor vocabulary. Superset of the per-molecule anchor enums (every shipped
 * molecule's `anchor` enum is a subset of this). The OVERLAY-ANALYSIS §2.1
 * "anchor discipline" rule holds: NEVER center for over-speaker overlays —
 * `center` is intentionally ABSENT here (it is reserved for full B-roll
 * cutaways, which are modeled by `EditSegment.mode === 'broll'`, not overlays).
 */
export const overlayAnchorSchema = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
  "lower-third",
]);
export type OverlayAnchor = z.infer<typeof overlayAnchorSchema>;

/**
 * A single timed overlay instance on the overlay track.
 *
 * `fromFrame`/`toFrame` are EDIT-time frames. `props` is the molecule-specific
 * prop bag, validated against the matching molecule schema by the render
 * registry (ADR-003 §4.3) — we keep it loose here on purpose (see design
 * principle 4). `confidence` + `reason` are carried so a later LLM pass (or a
 * human review UI) can rank/prune/explain suggestions.
 */
export const overlayInstanceSchema = z.object({
  /** Stable id, e.g. "ov-3". */
  id: z.string(),
  /** OV1–OV12 component name (closed vocabulary). */
  type: overlayTypeSchema,
  /** Side/corner anchor (never center). */
  anchor: overlayAnchorSchema,
  /** EDIT-time frame the overlay enters. */
  fromFrame: z.number(),
  /** EDIT-time frame the overlay exits (exclusive). */
  toFrame: z.number(),
  /** Molecule-specific props. Validated by the render registry, not here. */
  props: z.record(z.string(), z.unknown()).default({}),
  /** 0–1 suggester confidence (rule-based heuristics or LLM score). */
  confidence: z.number().min(0).max(1).default(0.5),
  /** Human-readable why-this-overlay, for review/debug. */
  reason: z.string().default(""),
});
export type OverlayInstance = z.infer<typeof overlayInstanceSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EditPlan — the top-level artifact
// ─────────────────────────────────────────────────────────────────────────────

export const editPlanAspectSchema = z.enum(["16:9", "9:16"]);
export type EditPlanAspect = z.infer<typeof editPlanAspectSchema>;

/** Provenance for each stage, so a reader/tooling knows what produced the plan. */
export const editPlanProvenanceSchema = z.object({
  /** "rule-based" now; "llm-assisted" once §5 lands. */
  overlaySource: z.enum(["rule-based", "llm-assisted"]).default("rule-based"),
  cutSource: z.enum(["none", "rule-based", "llm-assisted"]).default("none"),
  silenceSource: z.enum(["ffmpeg-silencedetect", "none"]).default("none"),
  /** ISO-8601 timestamp the plan was generated. */
  generatedAt: z.string().default(""),
});
export type EditPlanProvenance = z.infer<typeof editPlanProvenanceSchema>;

export const editPlanSchema = z.object({
  /** Schema version — bump on breaking changes to this shape. */
  version: z.literal(1).default(1),
  /** Absolute or project-relative path to the SOURCE talking-head video. */
  sourceVideo: z.string(),
  aspect: editPlanAspectSchema,
  fps: z.number().default(30),
  /** Duration of the SOURCE video in frames (before trim). */
  sourceDurationFrames: z.number(),
  /** Duration of the TRIMMED edit timeline in frames (after silence-trim). */
  editDurationFrames: z.number(),
  /** Kept spans after silence-trim, in edit-timeline order. */
  segments: z.array(editSegmentSchema).default([]),
  /** The single caption track. */
  captionTrack: captionTrackSchema.default(() => captionTrackSchema.parse({})),
  /** Timed overlay instances, in `fromFrame` order. */
  overlayTrack: z.array(overlayInstanceSchema).default([]),
  provenance: editPlanProvenanceSchema.default(() => editPlanProvenanceSchema.parse({})),
});
export type EditPlan = z.infer<typeof editPlanSchema>;
