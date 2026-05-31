# ADR-003 — Auto-edit pipeline & the `EditPlan` data model

> **Status:** Accepted (2026-05-31). Writing this ADR is the acceptance, per the
> ADR-001/ADR-002 convention.
>
> **Author:** Wave-8 auto-edit scaffold agent (WS-C, "begin auto-edit orchestration").
>
> **Mandated by:** `docs/research/wave-8/WAVE8-PLAN.md` — "Later (north star): the
> auto-edit orchestration (transcribe → subtitle → graphics-placement →
> B-roll-cut → silence-trim)." This ADR + the `src/autoedit/` scaffold are the
> **begin** slice of that north star.
>
> **Relationship to prior ADRs:** subordinate to ADR-001 (16:9 lane) and ADR-002
> (caption register × aspect matrix). It does not reopen either; it specifies the
> orchestration layer that *consumes* the registers (ADR-002) and the render
> targets (the `SpeakerOverlayScene{16x9,9x16}` foundation, W1b).
>
> **One-line:** A talking-head video is auto-edited by producing a single
> serializable **`EditPlan`** — a trimmed timeline + caption track + over-speaker
> overlay track — which the render stage replays onto `SpeakerOverlayScene` +
> an overlay registry. This ADR fixes the data model and the phased plan; it
> scaffolds the analysis half and defers the LLM-assisted + render halves.

---

## 1. Context

### 1.1 The north star (restated)

Given a vertical OR horizontal video of the user talking to camera, the pipeline should:

1. **Transcribe** the audio and burn **configurable-placement floating subtitles**.
2. **Add motion graphics that illustrate the points** — both *cutaway B-roll* and
   **overlays composited ON TOP of the speaker**.
3. **Know when to cut** to B-roll vs. stay on the speaker.
4. **Trim dead air** — silences / non-talking stretches.

### 1.2 What already exists (the foundations this ADR builds on)

- **Transcription** — `src/transcribe/transcribe.py` (faster-whisper) emits
  word-level timings as `{ text, startSeconds, endSeconds, startFrame, endFrame, probability }`.
- **Subtitles** — `src/components/FloatingCaption.tsx` renders configurable-position
  karaoke/sentence captions from `wordTimings`, with the ADR-002 registers
  (`punchy | editorial | technical`) and positions (`bottom-center | center | top | custom`).
- **Render target** — `src/compositions/SpeakerOverlayScene16x9.tsx` (and its 9x16
  sibling) own the layer stack: `base video → [overlay slot] → FloatingCaption → handle chip`.
- **Over-speaker overlay vocabulary** — `references/creators/alexhormozi/OVERLAY-ANALYSIS.md`
  catalogs OV1–OV12; eight are built as molecules under `src/components/overlays/`
  (`YellowGlowWordCallout`, `FloatingNumberedChipRow`, `BuildingBulletListOverSpeaker`,
  `IconStatChipStack`, `DiagnosticCalloutCard`, `FloatingTweetCardOverSpeaker`,
  `ColumnarNumberWithDividers`, `IconPopOverSpeaker`).
- **FFmpeg builders** — `src/ffmpeg/commands.ts` (the `execa("ffmpeg", [...])` pattern).
- **Pipeline + CLI** — `src/pipeline/pipeline.ts` orchestrates TTS→render→export;
  `src/pipeline/generate.ts` is the Commander CLI.

### 1.3 The gap

There is no layer that *composes* transcript + silence analysis + overlay
placement into a single editable artifact, and no orchestrator that turns a raw
talking-head clip into a finished edit. Wave-8 built the **paint** (overlay
molecules) and the **canvas** (`SpeakerOverlayScene`); this ADR adds the
**painter's plan** — the `EditPlan` — and the analysis stage that authors it.

---

## 2. Decision: an `EditPlan` artifact between analysis and render

The architecture is a two-phase pipe with a serializable artifact in the middle:

```
                       ┌──────────────── ANALYSIS (this scaffold) ───────────────┐
  talking-head video ─▶│ ffprobe → silencedetect → keep-segments                  │
                       │ faster-whisper → source-time words  (skip if register=none)│
                       │ source→edit word re-projection                            │
                       │ rule-based overlay suggester (LLM-swappable seam)         │
                       │ buildEditPlan + zod-validate                              │
                       └───────────────────────────┬─────────────────────────────┘
                                                    ▼
                                          ┌───────────────────┐
                                          │   EditPlan JSON    │  ◀── the contract
                                          └─────────┬─────────-┘
                       ┌────────────────── RENDER (deferred — §6) ────────────────┐
                       │ ffmpeg-concat kept segments → trimmed base video          │
                       │ SpeakerOverlayScene{16x9,9x16}:                           │
                       │   base video + FloatingCaption(captionTrack)              │
                       │   + overlayRegistry(overlayTrack) into the overlay slot   │
                       │ @remotion/renderer → final mp4 → exportMultiPlatform      │
                       └──────────────────────────────────────────────────────────┘
```

**Why an explicit artifact (not a single in-memory pass):**
1. **Inspectable & editable.** The plan is JSON a human (or a review UI) can read,
   tweak, and re-render — overlays carry `confidence` + `reason` for exactly this.
2. **Strategy-swappable.** The rule-based suggester and the future LLM suggester
   produce the *same* `EditPlan`; the render stage never changes.
3. **Decoupled IO.** Analysis (ffmpeg + python) and render (Remotion) are separate
   processes; the plan is the clean hand-off, mirroring how `pipeline.ts` already
   writes `word_timings_final.json` as an inspectable intermediate.
4. **Frame-native, no drift.** Times are stored in BOTH seconds and frames at a
   known `fps`, so ffmpeg (seconds) and Remotion (frames) consumers never recompute.

---

## 3. The `EditPlan` data model

Defined + zod-validated in `src/autoedit/editPlan.ts`. Summary:

```
EditPlan {
  version: 1
  sourceVideo: string                 // path to the raw talking-head clip
  aspect: "16:9" | "9:16"
  fps: number
  sourceDurationFrames: number        // before trim
  editDurationFrames: number          // after trim
  segments: EditSegment[]             // kept spans after silence-trim
  captionTrack: CaptionTrack
  overlayTrack: OverlayInstance[]
  provenance: { overlaySource, cutSource, silenceSource, generatedAt }
}

EditSegment {                         // a KEPT span (silence-trim removed the gaps)
  id: "seg-0"
  source: TimeSpan                    // range in the SOURCE file (what ffmpeg cuts)
  editStartFrame, editEndFrame        // position on the TRIMMED timeline
  mode: "speaker" | "broll"           // per-span camera mode (B-roll cut = §5)
}

CaptionTrack {
  register: "punchy"|"editorial"|"technical"|"none"   // ADR-002
  position: "bottom-center"|"center"|"top"|"custom"    // FloatingCaption.position
  customXY?: { xPct, yPct }
  mode: "karaoke" | "sentence"
  wordTimings: EditPlanWord[]         // EDIT-time; EMPTY when register === "none"
}

OverlayInstance {
  id: "ov-3"
  type: OverlayType                   // closed enum = the 8 shipped OV molecules
  anchor: "top-left"|...|"lower-third" // NEVER "center" (OVERLAY-ANALYSIS §2.1)
  fromFrame, toFrame                  // EDIT-time
  props: Record<string, unknown>      // molecule-specific; validated by the registry (§4.3)
  confidence: 0..1
  reason: string                      // why-this-overlay, for review/LLM
}
```

### 3.1 Three load-bearing modeling choices

- **Source-time vs edit-time (the trim problem).** Silence-trim removes spans, so
  the rendered timeline is shorter than the source. `EditSegment` carries BOTH
  the source range (what ffmpeg cuts) and the edit position. Captions/overlays are
  authored against **edit-time** frames so they line up with what the viewer sees.
  `shiftWordsToEditTimeline` (in `buildEditPlan.ts`) re-projects whisper's
  source-time words onto the trimmed timeline (dropping words inside trimmed gaps).
- **`mode: speaker | broll` on the segment, not the overlay.** Per OVERLAY-ANALYSIS
  §0, an over-speaker *overlay* keeps the speaker visible (graphic ≤45% of frame,
  side-anchored); a *cutaway* replaces the speaker entirely. Those are different
  layers: overlays live on `overlayTrack`; a full cutaway is a `broll` segment.
  This is why `OverlayAnchor` deliberately **omits `center`** — center is reserved
  for cutaways, modeled as `mode: 'broll'`, not overlays.
- **Closed `type` enum, open `props`.** `OverlayType` is a fixed enum naming the
  eight shipped molecules, so planner and renderer agree on a set. `props` is a
  loose `z.record` because each molecule owns its own zod schema in a file other
  agents edit; re-declaring those here would couple this model to volatile files.
  The render registry (§4.3) validates `props` against the matching molecule
  schema at render time. (`register=none` ⇒ whisper skipped ⇒ no words ⇒ no
  word-driven overlays, but a transcript can still be supplied to drive them.)

---

## 4. Integration points

### 4.1 With the existing analysis tools

- **Whisper:** the CLI shells `src/transcribe/transcribe.py` exactly as
  `pipeline.ts` does (`uv run python … --input --model --language --fps`), then
  validates each word with `editPlanWordSchema` — the shapes already match 1:1.
- **FFmpeg:** `silenceTrim.detectSilences` uses the same `execa("ffmpeg", […])`
  idiom as `src/ffmpeg/commands.ts`. The exact command is documented in
  `silenceTrim.ts` and verified against real ffmpeg 8.1 output.

### 4.2 With the render target (`SpeakerOverlayScene`)

The `EditPlan` is shaped to drop into the W1b foundation:
- `captionTrack.{register, position, customXY, mode, wordTimings}` is exactly
  `FloatingCaption`'s prop surface (which `SpeakerOverlayScene` already mounts).
- `overlayTrack[]` is designed to mount into the **"FUTURE OVERLAY SLOT"** comment
  region in `SpeakerOverlayScene16x9.tsx` — each `OverlayInstance` becomes one
  absolutely-positioned overlay molecule, gated by `fromFrame`/`toFrame`.

### 4.3 The overlay registry (TODO — the one missing render-side piece)

The render step needs a `Record<OverlayType, { component, schema }>` registry
that maps an `OverlayInstance.type` → the molecule component + its zod schema, so
it can: (a) validate `props`, (b) render the component with `props` inside a
`<Sequence from={fromFrame} durationInFrames={toFrame-fromFrame}>`, anchored by
`anchor`. This registry is **intentionally not built in this scaffold** because
it imports the overlay molecule files that sibling agents are still editing
(WS-A2/A3). It is the first task of the render slice (§6).

---

## 5. Phased plan — scaffolded now vs deferred

| Capability | North-star bullet | Status | Where |
|---|---|---|---|
| Silence-trim (detect → keep-segments → edit timeline) | 4 | **Built + tested** | `silenceTrim.ts` |
| `EditPlan` data model (zod) | (the contract) | **Built + tested** | `editPlan.ts` |
| Source→edit word re-projection | 1 | **Built + tested** | `buildEditPlan.ts` |
| Caption track (register/position, `none`⇒skip whisper) | 1 | **Built + tested** | `buildEditPlan.ts` + CLI |
| Rule-based overlay suggester (R1–R4) | 2 | **Built + tested** | `suggestOverlays.ts` |
| CLI (`autoedit --video … --aspect …` → plan JSON) | (driver) | **Built** | `cli.ts` |
| **LLM overlay pass** (semantic beats, best-type choice, rich props) | 2 | **Deferred** | `SuggestStrategy` seam in `suggestOverlays.ts` |
| **Speaker-vs-B-roll cut detection** (sets `mode`) | 3 | **Deferred** | `EditSegment.mode` field exists; always `speaker` today |
| **Overlay registry** (`type → component+schema`) | (render) | **Deferred** | §4.3 |
| **Render-from-plan** (concat + SpeakerOverlayScene + remotion) | 1,2 | **Deferred** | §6 |

### 5.1 The LLM extension seam (deferred bullet 2 & 3)

`suggestOverlays.ts` exposes a `SuggestStrategy` type — `(words, opts) => OverlayInstance[]`.
The rule-based `ruleBasedStrategy` satisfies it today; a future `llmSuggestStrategy`
(same signature) can be passed to `buildEditPlan({ overlayStrategy })` with zero
downstream changes. The LLM pass should: replace keyword rules with semantic beat
detection, choose the best overlay type per beat, fill rich molecule props, and
additionally decide `mode: 'speaker' | 'broll'` per segment (the B-roll cut
decision, north-star bullet 3). The rule-based pass exists so the pipeline is
end-to-end runnable *without* a model — and so the LLM has a baseline to beat.

---

## 6. The CLI-wiring integration point (for the main session)

> **This is the exact hook the main session should add to `src/pipeline/generate.ts`.**
> WS-C did **not** edit `generate.ts` (sibling agents own it). Two clean options:

**Option A (recommended) — a sibling `autoedit` subcommand/script.** Add to
`package.json` scripts:

```jsonc
"autoedit": "tsx src/autoedit/cli.ts"
```

…so it runs as `npm run autoedit -- --video ./talk.mp4 --aspect 16:9`. The CLI is
already self-contained (`src/autoedit/cli.ts`); this only registers it.

**Option B — fold into the existing Commander CLI in `generate.ts`.** `generate.ts`
is a single top-level `program` for *script→video*. Auto-edit is *video→video*, a
different input contract, so the cleanest fold is to convert `generate.ts` into a
multi-command program and add an `autoedit` command, importing the orchestration
from `src/autoedit/`:

```ts
// in src/pipeline/generate.ts (main session — DO NOT have WS-C do this)
import { buildEditPlan } from "../autoedit/buildEditPlan.js";
import { detectSilences, keepSegmentsFromSilences, toEditSegments } from "../autoedit/silenceTrim.js";
// program.command("autoedit").requiredOption("--video …").option("--aspect …")…
//   → run the same steps as src/autoedit/cli.ts main()
```

Either way, the **render slice** (§4.3 registry + ffmpeg-concat + a
`renderFromEditPlan(plan)` that drives `SpeakerOverlayScene{16x9,9x16}` via
`@remotion/renderer`, reusing `src/pipeline/render.ts` + `src/ffmpeg/commands.ts`
+ `exportMultiPlatform`) is the next task. `cli.ts --render` currently prints this
intended sequence as a stub.

---

## 7. Consequences

**Positive:** a clean, inspectable contract; the analysis half runs today against
real ffmpeg + whisper; the LLM and render halves slot in behind stable seams; the
caption + overlay vocabularies (ADR-002, OVERLAY-ANALYSIS) are reused 1:1.

**Negative / risks:** rule-based overlay suggestions are coarse (keyword heuristics,
small EN+ES lexicons) — acceptable as a baseline, explicitly flagged for LLM
replacement. The overlay registry + render step are the critical-path remaining
work before the north star is end-to-end. The `props` looseness defers molecule
prop validation to render time (mitigated by the registry validating against each
molecule's own schema).

**Files added by this ADR's scaffold:**
`src/autoedit/{editPlan,silenceTrim,suggestOverlays,buildEditPlan,cli,index}.ts`,
`src/autoedit/autoedit.test.ts`, `src/autoedit/README.md`, and this ADR.
