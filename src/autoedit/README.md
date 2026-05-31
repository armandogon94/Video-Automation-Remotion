# `src/autoedit` — auto-edit orchestration (scaffold)

> North star: **"give me a talking-head video, get a finished edit."**
> This directory is the **begin** slice: it produces a validated `EditPlan` JSON
> from a talking-head video. Rendering *from* the plan is the documented next
> integration step (see [ADR-003](../../docs/research/wave-8/ADR-003-autoedit-pipeline.md)).

## What it does today

```
video ──▶ ffprobe (duration)
      ──▶ ffmpeg silencedetect ──▶ keep-segments (dead air trimmed)
      ──▶ faster-whisper        ──▶ source-time word timings   [skipped if --register none]
      ──▶ buildEditPlan         ──▶ EditPlan JSON
                                    · caption track (FloatingCaption-shaped)
                                    · overlay track (rule-based OV1–OV12 suggestions)
                                    · kept segments on a trimmed edit timeline
```

## Run it

```bash
# 16:9, transcribe + trim + rule-based overlay suggestions → ./output/editplan.json
npx tsx src/autoedit/cli.ts --video ./footage/talk.mp4 --aspect 16:9

# 9:16, reuse a pre-computed whisper transcript (skip the transcribe step)
npx tsx src/autoedit/cli.ts --video ./footage/talk.mov --aspect 9:16 \
  --transcript ./output/word_timings_final.json --out ./output/plan.json

# Skip whisper entirely (no captions) — overlays only fire if a transcript is present
npx tsx src/autoedit/cli.ts --video ./footage/talk.mp4 --register none --no-trim

# See the deferred render-from-plan next-step (prints, does not render)
npx tsx src/autoedit/cli.ts --video ./footage/talk.mp4 --render
```

### Key flags

| Flag | Default | Meaning |
|---|---|---|
| `--video <path>` | — (required) | Source talking-head video. |
| `--aspect 16:9\|9:16` | `16:9` | Render-target aspect (drives which `SpeakerOverlayScene` consumes the plan). |
| `--transcript <json>` | — | Pre-computed whisper JSON `{ words: [...] }`; skips transcription. |
| `--register punchy\|editorial\|technical\|none` | `editorial` | ADR-002 caption register. `none` ⇒ no captions **and whisper is skipped**. |
| `--position bottom-center\|center\|top\|custom` | `bottom-center` | Caption placement (maps to `FloatingCaption.position`). |
| `--silence-db <db>` / `--min-silence <sec>` | `-30` / `0.5` | `silencedetect` tuning. |
| `--no-trim` | off | Keep the whole clip as one segment (skip silence-trim). |
| `--out <path>` | `./output/editplan.json` | Where to write the plan. |

## The `EditPlan` (what gets written)

A timeline artifact (zod-validated, `editPlan.ts`):

- **`segments`** — kept spans after silence-trim, each with a SOURCE range (what
  ffmpeg cuts) and an EDIT range (where it lands on the trimmed timeline), plus a
  per-span `mode` (`speaker` | `broll`).
- **`captionTrack`** — `register` + `position` + edit-time `wordTimings`
  (empty when `register === 'none'`). Shaped to drop straight into `FloatingCaption`.
- **`overlayTrack`** — timed `OverlayInstance[]`: `{ type: OV1..OV12 component
  name, anchor, fromFrame, toFrame, props, confidence, reason }`.

## What works vs. deferred

**Works now (real + tested):**
- `silencedetect` parse → keep-segments → edit-timeline mapping (validated against real ffmpeg output).
- Source-time → edit-time word re-projection across trimmed gaps.
- Rule-based overlay suggester (R1 stats, R2 enumerations, R3 emphasis, R4 brands).
- `EditPlan` zod model + CLI that writes the JSON.
- 12 passing unit tests (`autoedit.test.ts`).

**Deferred (documented TODOs — ADR-003 §5):**
- **LLM overlay pass** — semantic beat detection replacing the keyword rules
  (the `SuggestStrategy` seam in `suggestOverlays.ts` is the swap point).
- **Speaker-vs-B-roll cut detection** — currently every segment is `mode: 'speaker'`.
- **Render-from-plan** — feeding the `EditPlan` to `SpeakerOverlayScene{16x9,9x16}`
  through an overlay registry (the registry + ffmpeg-concat step are not built).

## Limitations

- `props` on overlays are minimally populated by the rules (e.g. callout text,
  enumeration items). Rich props (tweet bodies, chip labels, book covers) await
  the LLM pass.
- The brand/emphasis/ordinal lexicons are small and EN+ES only.
- No render output — this stage emits a plan, not a video.

## Tests

```bash
npx vitest run src/autoedit/autoedit.test.ts
```
