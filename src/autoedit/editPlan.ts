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
  /**
   * Whisper per-word confidence 0..1 (emitted by transcribe.py; GPT56-FINDINGS
   * §2.4 — retained so hallucinated words like p≈0.004 prompts stay auditable).
   * `.optional()` (NOT `.default()`) on purpose: a `.default()`-only field
   * breaks Remotion `<Composition defaultProps>` typing (the Zod-v4 gotcha).
   */
  probability: z.number().optional(),
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
// Sources — v2 source-aware plans (GPT56-FINDINGS §1.2 / §5.5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Minimal ffprobe facts for a source file (GPT56 §5.5 `MediaProbe`). Every
 * field is `.optional()` — a probe may be partial (e.g. hash-only cataloging
 * before ffprobe runs), and optional-only keeps Remotion
 * `<Composition defaultProps>` typing intact (the Zod-v4 gotcha — see
 * OverlayInstance.behindSpeaker). Kept deliberately minimal; richer probe
 * artifacts belong in the job folder's `sources.json` (§5.1), not the plan.
 */
export const mediaProbeSchema = z.object({
  /** Container duration in seconds. */
  durationSeconds: z.number().optional(),
  /** Video stream frame rate. */
  fps: z.number().optional(),
  /** Video stream width in px. */
  width: z.number().optional(),
  /** Video stream height in px. */
  height: z.number().optional(),
  /** Whether the file has an audio stream (GPT56 §2.3 — audio-less inputs). */
  hasAudio: z.boolean().optional(),
});
export type MediaProbe = z.infer<typeof mediaProbeSchema>;

/**
 * One input file a v2 (source-aware) plan can cut from (GPT56 §5.5). `id` is
 * the stable key segments reference via `EditSegment.sourceId`; `path` is the
 * absolute/project-relative file path (same convention as `sourceVideo`).
 * `hash` is the content hash used for transcription caching (§5.1) and `probe`
 * the ffprobe facts — both `.optional()` so a plan can be authored before
 * hashing/probing has run (and per the Zod-v4 defaultProps gotcha).
 */
export const planSourceSchema = z.object({
  /** Stable id, e.g. "src-0". Referenced by `EditSegment.sourceId`. */
  id: z.string(),
  /** Absolute or project-relative path to the source media file. */
  path: z.string(),
  /** Content hash of the file (transcription-cache key, GPT56 §5.1). */
  hash: z.string().optional(),
  /** Minimal ffprobe facts (see mediaProbeSchema). */
  probe: mediaProbeSchema.optional(),
});
export type PlanSource = z.infer<typeof planSourceSchema>;

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
 * WHAT a v2 segment is, editorially (GPT56 §5.5). COMPLEMENTS — does not
 * replace — `mode`: `mode` says how the CAMERA behaves (stay on speaker vs cut
 * away), `kind` says what the MATERIAL is (a selected take, B-roll footage, or
 * room-tone filler between takes). A multi-take assembly needs both axes:
 * e.g. a `broll`-kind segment cut from source file 3 while `mode` stays
 * "speaker" on the base layout is a legal combination.
 *   - "take"      — a selected take span from a recording (the default the
 *                   v1→v2 migration stamps).
 *   - "broll"     — cutaway footage material.
 *   - "room-tone" — ambience/silence filler inserted between takes.
 */
export const segmentKindSchema = z.enum(["take", "broll", "room-tone"]);
export type SegmentKind = z.infer<typeof segmentKindSchema>;

/**
 * Per-segment CREATIVE color grade preset (harvested from browser-use/video-use,
 * 2026-06-26 — see docs/research/video-use/ANALYSIS.md). OPTIONAL on a segment:
 * when omitted, the segment uses ONLY the global HLG→SDR corrective LUT (the prior
 * behavior is unchanged). When set, the named `eq`/`hue` chain below is applied to
 * that segment's video BEFORE concat. Uses universally-available ffmpeg filters
 * (no extra LUT files), so it stays local/free.
 */
export const segmentGradeSchema = z.enum(["warm-cinematic", "neutral-punch", "cool", "mono"]);
export type SegmentGrade = z.infer<typeof segmentGradeSchema>;

/** ffmpeg per-segment grade filter chains, keyed by `SegmentGrade`. */
export const GRADE_FILTERS: Record<SegmentGrade, string> = {
  "warm-cinematic": "eq=contrast=1.06:saturation=1.10:gamma_r=1.04:gamma_b=0.97",
  "neutral-punch": "eq=contrast=1.10:saturation=1.06",
  cool: "eq=contrast=1.04:saturation=1.05:gamma_b=1.04:gamma_r=0.98",
  mono: "hue=s=0,eq=contrast=1.08",
};

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
  /** Optional per-segment creative grade (see segmentGradeSchema). Omitted →
   *  global correction only (unchanged behavior); keeps existing plans valid. */
  grade: segmentGradeSchema.optional(),
  // ── v2 source-aware fields (GPT56 §5.5) ──────────────────────────────────
  // All four are `.optional()` (NOT `.default()`) so every serialized v1 plan
  // on disk still parses AND Remotion `<Composition defaultProps>` typing
  // survives (the Zod-v4 gotcha — see OverlayInstance.behindSpeaker).
  /**
   * Which `EditPlan.sources` entry this segment cuts from (v2). References
   * `PlanSource.id`. Absent in v1 plans, where the whole timeline implicitly
   * reads `sourceVideo`; `migratePlanToSourceAware` fills it in.
   */
  sourceId: z.string().optional(),
  /**
   * Editorial material kind (GPT56 §5.5): take | broll | room-tone.
   * COMPLEMENTS `mode` (camera behavior) — see segmentKindSchema. Absent in
   * v1 plans; the migration stamps "take".
   */
  kind: segmentKindSchema.optional(),
  /**
   * Take-group provenance (GPT56 §5.2/§5.5): the clause-level group of
   * alternative takes this segment was chosen FROM. Lets QA/review trace a
   * cut back to its A/B/C decision. Absent for non-take material.
   */
  takeGroupId: z.string().optional(),
  /**
   * WHICH option within `takeGroupId` was selected (e.g. "opt-b"). Pairs with
   * `takes-decisions.json` (GPT56 §5.1) so the plan is auditable against the
   * human selection gate. Absent for non-take material.
   */
  takeOptionId: z.string().optional(),
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
  /**
   * Depth-compositing flag (foreground-matte handoff). When `true` the caption
   * layer renders BEHIND the speaker matte; when `false`/absent it renders in
   * FRONT (today's behavior). `.optional()` — see OverlayInstance.behindSpeaker.
   */
  behindSpeaker: z.boolean().optional(),
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
  // R4 brand-beat rewrite (GPT56 §2.6): logo pop for local brand assets, text
  // chip for brands without one. All registered in OVERLAY_REGISTRY.
  "BrandLogoPopOverSpeaker",
  "SentimentKeyword",
  // Purpose-made dual-aspect brand chip (Sol 0716 §2.6) — the suggester's
  // no-local-asset R4 fallback (replaces SentimentKeyword in that role).
  "BrandNameChip",
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
  /**
   * Depth-compositing flag (foreground-matte handoff). When `true` this overlay
   * renders BEHIND the speaker matte (the graphic appears to sit behind the
   * person); when `false`/absent it renders in FRONT of the matte, as today.
   * NOTE: `.optional()` (not `.default()`) — this is a NEW optional field and
   * Remotion `<Composition defaultProps>` types as `z.input & z.infer`, so a
   * `.default()`-only field breaks registrations (the Zod-v4 gotcha, ADR-003).
   */
  behindSpeaker: z.boolean().optional(),
});
export type OverlayInstance = z.infer<typeof overlayInstanceSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout track (Tella-style scene switching) — see docs/research/wave-9/
// TELLA-PRODUCT-RESEARCH.md §2/§3
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A normalized rectangular region on the canvas. All four position/size fields
 * are fractions in `[0..1]` of the canvas width/height, so a region survives any
 * aspect-ratio crop (Tella's "regions in 0..1" insight, §3.2). `shape`/`cornerRadiusPx`
 * describe the layer's border treatment (Tella's per-clip camera border, §2.3):
 *   - `rect`     — sharp corners
 *   - `rounded`  — rounded-rect using `cornerRadiusPx`
 *   - `squircle` — superellipse-ish (rendered as a large border-radius); Jack's cam
 *   - `circle`   — fully circular (Tella's round PiP bubble)
 * `cornerRadiusPx` is interpreted at the canvas's native resolution (px), so a
 * 16:9 1920×1080 and 9:16 1080×1920 can share the same value.
 */
export const regionShapeSchema = z.enum(["rect", "rounded", "squircle", "circle"]);
export type RegionShape = z.infer<typeof regionShapeSchema>;

export const regionSchema = z.object({
  /** Left edge as a fraction of canvas width, 0..1. */
  xPct: z.number(),
  /** Top edge as a fraction of canvas height, 0..1. */
  yPct: z.number(),
  /** Width as a fraction of canvas width, 0..1. */
  wPct: z.number(),
  /** Height as a fraction of canvas height, 0..1. */
  hPct: z.number(),
  /** Border radius in canvas px (used when `shape === 'rounded'`). */
  cornerRadiusPx: z.number().optional(),
  /** Border treatment for this layer. Defaults to `rounded` at render time. */
  shape: regionShapeSchema.optional(),
  /**
   * Content zoom (Ken Burns) for THIS layer — scales the video *inside* its
   * region, NOT the region box itself (so the framed window stays put while the
   * footage pushes in on the subject's face). `1` = no zoom (default). Values
   * >1 push in; the layer's `overflow:hidden` clips the magnified content. Used
   * for the "zoom on his face" beat. The renderer tweens this between segment
   * endpoints alongside the box geometry, so a smooth transition can grow the
   * zoom in/out. `.optional()` (NEW field) — Remotion `<Composition
   * defaultProps>` types as `z.input & z.infer`, so it MUST be `.optional()`.
   */
  camScale: z.number().optional(),
  /**
   * Focal point for `camScale`, as a fraction `[0..1]` of the layer box (the
   * point that stays fixed while zooming — e.g. `{x:0.5,y:0.38}` to push in on
   * a face sitting in the upper-middle of the frame). Defaults to centre
   * `{0.5,0.5}` when omitted. Tweened with `camScale`.
   */
  camFocusXPct: z.number().optional(),
  camFocusYPct: z.number().optional(),
});
export type Region = z.infer<typeof regionSchema>;

/**
 * A layout = where the (up to) two source layers sit. `cam` is the talking-head
 * camera; `screen` is the screen-share / B-roll plate. Either may be omitted
 * (omitted layer is not painted — Tella's "camera only" / "screen only"). Paint
 * order is fixed: screen behind, cam in front (matches the LayoutTrack stack).
 */
export const inlineLayoutSchema = z.object({
  cam: regionSchema.optional(),
  screen: regionSchema.optional(),
});
export type InlineLayout = z.infer<typeof inlineLayoutSchema>;

/**
 * A segment's layout is EITHER a named preset (resolved by `LayoutPresets.ts`)
 * OR an inline `{cam?, screen?}` region pair (a custom/freeform layout, Tella
 * §2.2 "custom layouts"). Kept as an open `string | inline` union so the preset
 * vocabulary can grow in `LayoutPresets.ts` without re-touching this model.
 */
export const layoutRefSchema = z.union([z.string(), inlineLayoutSchema]);
export type LayoutRef = z.infer<typeof layoutRefSchema>;

/**
 * Per-segment transition INTO this segment (Tella §2.5). `cut` swaps instantly
 * at `startFrame`; `smooth` tweens each layer's `{x,y,w,h,cornerRadius}` from the
 * previous segment's (or base layout's) region to this one over `durationFrames`
 * with an ease curve. The two options mirror Tella exactly (smooth | hard cut).
 */
export const layoutTransitionSchema = z.object({
  type: z.enum(["cut", "smooth"]),
  /** Tween length in frames (used when `type === 'smooth'`). */
  durationFrames: z.number().optional(),
});
export type LayoutTransition = z.infer<typeof layoutTransitionSchema>;

/**
 * One timed layout segment on the `layoutTrack`. `startFrame`/`endFrame` are
 * EDIT-time frames (frame-native, like everything else here). `layout` is a
 * preset name or inline regions. Uncovered frame ranges fall back to the
 * composition's base layout (Tella "gap → base" semantics, §3.3).
 */
export const layoutSegmentSchema = z.object({
  /** Stable id, e.g. "lay-0". */
  id: z.string().optional(),
  /** EDIT-time frame the segment begins. */
  startFrame: z.number(),
  /** EDIT-time frame the segment ends (exclusive). */
  endFrame: z.number(),
  /** Preset name OR inline `{cam?, screen?}` regions. */
  layout: layoutRefSchema,
  /** Transition INTO this segment. Defaults to a hard cut when omitted. */
  transition: layoutTransitionSchema.optional(),
});
export type LayoutSegment = z.infer<typeof layoutSegmentSchema>;

/**
 * Decorative backdrop behind the screen+cam composite (Jack's "framed scene",
 * itsjack/ANALYSIS.md §2). When present, the LayoutTrack paints a gradient (or a
 * solid) behind the layers; presets like `framed-backdrop` inset the layers so
 * the backdrop shows as a padded frame with rounded corners + soft shadow.
 */
export const backdropSchema = z.object({
  type: z.enum(["gradient", "solid"]).optional(),
  /** Gradient angle in degrees (CSS convention). */
  angleDeg: z.number().optional(),
  /** Gradient color stops, in order. For `solid`, the first stop is used. */
  stops: z.array(z.string()).optional(),
});
export type Backdrop = z.infer<typeof backdropSchema>;

/**
 * The speaker FOREGROUND MATTE (depth-matting handoff — a sibling agent owns
 * `src/matting/`). An alpha-channel video (`.mov` via `OffthreadVideo`) or an
 * RGBA PNG sequence of the speaker cut out from the background, composited ON TOP
 * of the LayoutTrack and behind-speaker overlays so captions/graphics can sit
 * BEHIND the speaker. `behindSpeaker`-flagged overlays/captions render below it.
 */
export const foregroundMatteSchema = z.object({
  /** Alpha .mov path/URL, or a printf-style RGBA PNG-sequence pattern. */
  src: z.string(),
  /** How `src` should be interpreted by the matte renderer. */
  kind: z.enum(["alpha-video", "png-sequence"]).optional(),
});
export type ForegroundMatte = z.infer<typeof foregroundMatteSchema>;

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
  /**
   * Schema version — bump ONLY on breaking changes to this shape.
   *
   * Deliberately UNCHANGED at `z.literal(1)` for the source-aware v2 additions:
   * nothing in the codebase switches on `version` (it is assigned once in
   * `buildEditPlan.ts` and never read), and every v2 field is additive +
   * `.optional()`, so v1 and v2 plans are the same wire shape. The v1/v2
   * distinction is "are `sources` present?" (see `isSourceAwarePlan`), NOT the
   * version number. Bumping the literal to 2 would make `parse` reject every
   * serialized v1 plan already on disk for zero benefit.
   */
  version: z.literal(1).default(1),
  /**
   * Absolute or project-relative path to the SOURCE talking-head video.
   * v1 single-source field — still REQUIRED in v2 plans. In a migrated
   * (source-aware) plan it MUST equal `sources[0].path`, so v1-only readers
   * keep working against the primary source.
   */
  sourceVideo: z.string(),
  /**
   * v2 (GPT56 §5.5): the input files this plan cuts from. When present,
   * segments reference these by `sourceId`. `.optional()` (NOT `.default()`)
   * — absent means "v1 single-source plan" (every segment implicitly reads
   * `sourceVideo`), and a `.default()`-only field breaks Remotion
   * `<Composition defaultProps>` typing (the Zod-v4 gotcha, ADR-003).
   */
  sources: z.array(planSourceSchema).optional(),
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
  /**
   * Tella-style scene track: timed layout segments overriding the base layout
   * for a frame range (TELLA-PRODUCT-RESEARCH.md §3). `.optional()` (NOT
   * `.default()`) — NEW field; a `.default()`-only optional breaks Remotion
   * `<Composition defaultProps>` typing (z.input & z.infer). Same for the
   * `baseLayout`/`backdrop`/`foregroundMatte` fields below.
   */
  layoutTrack: z.array(layoutSegmentSchema).optional(),
  /** Whole-duration default layout (preset name or inline regions). Used for any
   *  frame range not covered by a `layoutTrack` segment. */
  baseLayout: layoutRefSchema.optional(),
  /** Decorative gradient/solid backdrop behind the screen+cam composite (Jack's
   *  framed-scene look). */
  backdrop: backdropSchema.optional(),
  /** Speaker alpha matte composited on top of the layout layers, enabling
   *  behind-speaker depth compositing of overlays/captions. */
  foregroundMatte: foregroundMatteSchema.optional(),
  provenance: editPlanProvenanceSchema.default(() => editPlanProvenanceSchema.parse({})),
})
  // Referential integrity for source-aware plans (Sol 0716 §3.4: the schema
  // previously accepted duplicate source ids, a mismatched legacy mirror, and
  // dangling segment sourceIds — all of which make take assembly unsafe).
  // v1 plans (no `sources`) are untouched.
  .superRefine((plan, ctx) => {
    const sources = plan.sources;
    if (sources === undefined || sources.length === 0) return;

    const ids = new Set<string>();
    sources.forEach((s, i) => {
      if (ids.has(s.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["sources", i, "id"],
          message:
            `duplicate source id "${s.id}" — source ids must be unique so ` +
            `segment.sourceId resolves unambiguously (Sol 0716 §3.4). ` +
            `Rename one of the colliding sources.`,
        });
      }
      ids.add(s.id);
    });

    if (plan.sourceVideo !== sources[0].path) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceVideo"],
        message:
          `sourceVideo ("${plan.sourceVideo}") must mirror sources[0].path ` +
          `("${sources[0].path}") — the documented v1-compat invariant so ` +
          `v1-only readers keep working (Sol 0716 §3.4). Fix sourceVideo or ` +
          `reorder sources.`,
      });
    }

    plan.segments.forEach((seg, i) => {
      if (seg.sourceId !== undefined && !ids.has(seg.sourceId)) {
        ctx.addIssue({
          code: "custom",
          path: ["segments", i, "sourceId"],
          message:
            `segment "${seg.id}" references unknown sourceId ` +
            `"${seg.sourceId}" (known: ${[...ids].join(", ")}) — a dangling ` +
            `reference the render stage could never resolve (Sol 0716 §3.4). ` +
            `Add the matching source or fix the segment's sourceId.`,
        });
      }
    });
  });
export type EditPlan = z.infer<typeof editPlanSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// v1 ↔ v2 helpers (pure — no IO; GPT56 §5.5 "preserve a v1 parser/migration")
// ─────────────────────────────────────────────────────────────────────────────

/** The id given to the synthetic source a v1 plan's `sourceVideo` becomes. */
const V1_SOURCE_ID = "src-0";

/**
 * Is this plan fully source-aware (v2)? True iff `sources` is non-empty with
 * UNIQUE ids AND every segment carries a `sourceId` that RESOLVES to a known
 * source (Sol 0716 §3.4: the old check accepted dangling ids, so this
 * returned true while `sourceForSegment` returned undefined). A plan with
 * sources but a sourceId-less segment is half-migrated and NOT source-aware —
 * run `migratePlanToSourceAware` on it before multi-source consumption.
 */
export function isSourceAwarePlan(plan: EditPlan): boolean {
  if (plan.sources === undefined || plan.sources.length === 0) return false;
  const ids = new Set(plan.sources.map((s) => s.id));
  if (ids.size !== plan.sources.length) return false; // duplicate ids
  return plan.segments.every(
    (seg) => seg.sourceId !== undefined && ids.has(seg.sourceId),
  );
}

/**
 * Migrate a v1 (single-source) plan to the source-aware v2 shape (GPT56 §5.5:
 * "`sourceVideo` becomes `sources[0]`"). Idempotent: an already-source-aware
 * plan round-trips to an equivalent plan (same sources; sourceId/kind only
 * filled where absent, never overwritten).
 *
 * - Fills `sources = [{ id: opts.sourceId ?? "src-0", path: plan.sourceVideo }]`
 *   when the plan has no sources. When sources already exist they are kept
 *   verbatim and `opts.sourceId` is ignored (the ids are already fixed).
 * - Stamps `sourceId` (= sources[0].id) and `kind: "take"` on each segment,
 *   ONLY where absent — and ONLY when that fill is unambiguous (a genuine v1
 *   plan, or exactly ONE source). Sol 0716 §3.4: in a MULTI-source plan a
 *   missing `sourceId` means "take selection omitted"; silently filling it
 *   with `sources[0]` would convert an unmade decision into "select the first
 *   take", which is unsafe for take assembly — that half-migration now throws.
 * - Preserves the v1 invariant `sourceVideo === sources[0].path` by
 *   construction in the v1 → v2 case.
 * - Validates the result via `editPlanSchema.parse` (which also enforces
 *   unique source ids, the legacy mirror, and resolvable segment refs).
 *
 * @throws if an existing segment references a `sourceId` that is not in
 *   `sources` — a dangling reference the render stage could never resolve.
 * @throws if a multi-source plan has any segment WITHOUT a `sourceId` (the
 *   ambiguous half-migration described above).
 */
export function migratePlanToSourceAware(
  plan: EditPlan,
  opts?: { sourceId?: string },
): EditPlan {
  const sources: PlanSource[] =
    plan.sources !== undefined && plan.sources.length > 0
      ? plan.sources
      : [{ id: opts?.sourceId ?? V1_SOURCE_ID, path: plan.sourceVideo }];

  const knownIds = new Set(sources.map((s) => s.id));
  const fillId = sources[0].id;

  if (sources.length > 1) {
    const unassigned = plan.segments.filter((seg) => seg.sourceId === undefined);
    if (unassigned.length > 0) {
      throw new Error(
        `migratePlanToSourceAware: ${unassigned.length} segment(s) ` +
          `(${unassigned.map((s) => `"${s.id}"`).join(", ")}) have NO sourceId ` +
          `in a ${sources.length}-source plan — filling them with sources[0] ` +
          `("${fillId}") would silently turn "take selection omitted" into ` +
          `"select the first take" (Sol 0716 §3.4). Assign each segment's ` +
          `sourceId explicitly before migrating.`,
      );
    }
  }

  const segments = plan.segments.map((seg) => {
    const sourceId = seg.sourceId ?? fillId;
    if (!knownIds.has(sourceId)) {
      throw new Error(
        `migratePlanToSourceAware: segment "${seg.id}" references sourceId ` +
          `"${sourceId}", which is not in plan.sources (known ids: ` +
          `${[...knownIds].join(", ")}). Add a matching { id: "${sourceId}", ` +
          `path: ... } entry to plan.sources, or fix the segment's sourceId.`,
      );
    }
    return { ...seg, sourceId, kind: seg.kind ?? ("take" as const) };
  });

  return editPlanSchema.parse({ ...plan, sources, segments });
}

/**
 * Resolve the `PlanSource` a segment cuts from.
 *
 * - v2 plan (non-empty `sources`): strict lookup by `segment.sourceId`.
 *   Returns `undefined` for a dangling or absent sourceId — the caller must
 *   treat that as "cannot resolve", not fall back to `sourceVideo` (that is
 *   what `migratePlanToSourceAware` is for).
 * - v1 plan (no `sources`): DOCUMENTED FALLBACK — synthesizes the single v1
 *   source `{ id: "src-0", path: plan.sourceVideo }`, since every v1 segment
 *   implicitly reads `sourceVideo` (any stray `segment.sourceId` is ignored).
 */
export function sourceForSegment(
  plan: EditPlan,
  segment: EditSegment,
): PlanSource | undefined {
  if (plan.sources !== undefined && plan.sources.length > 0) {
    return plan.sources.find((s) => s.id === segment.sourceId);
  }
  return { id: V1_SOURCE_ID, path: plan.sourceVideo };
}
