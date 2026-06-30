# Our pipeline vs video-use's "12 ffmpeg correctness rules" — audit (2026-06-26)

Read-only audit of `src/autoedit/renderFromPlan.ts` + `silenceTrim.ts` against the
12 production-correctness rules in browser-use/video-use's SKILL.md. Status after
this session's harvest. **Net: we satisfy or safely-N/A all 12.** The only items
to revisit are tied to the *future* LLM/transcript-semantic editing path, not current
correctness.

| # | Rule | Status | Notes |
|---|---|---|---|
| 1 | Subtitles applied LAST | ✅ by-arch | Captions are Remotion-rendered (FloatingCaption) as the top z-layer, not ffmpeg `subtitles=`. Overlays can't hide them. |
| 2 | Per-segment extract → lossless `-c copy` concat | ⚪ different-arch | We trim+concat via one `filter_complex` (single re-encode of the base clip); overlays/captions are composited in **Remotion**, not ffmpeg. No ffmpeg overlay double-encode to avoid — the rule's failure mode doesn't apply. |
| 3 | 30ms audio fades at cuts | ✅ **fixed this session** | `afade=t=in/out:d=0.03` on every segment (single- + multi-source), clamped for short keeps. Commit 09172e4. |
| 4 | Overlay `setpts=PTS-STARTPTS+T/TB` | ✅ by-arch | Overlay timing is frame-accurate in Remotion (Sequence `from`), not ffmpeg-composited — no PTS shifting needed. |
| 5 | Master SRT output-timeline offsets | ✅ by-arch | `buildEditPlan.shiftWordsToEditTimeline` re-projects SOURCE-time words onto the trimmed EDIT timeline, so caption timing is already output-correct (`output = word.start - segStart + segOffset`, done in frames). |
| 6 | Never cut inside a word | ✅ in-spirit | Cuts are at `silencedetect` intervals (noise=-30dB) — i.e. inter-word silence, not drifty word timestamps. Cuts land in the safe zone. |
| 7 | Pad every cut edge (30–200ms) | ⚪ N/A (current) | Padding exists in video-use to absorb 50–100ms word-timestamp drift; our cuts are at *detected silence* (the gap itself), so there's no drift to absorb. **Revisit IF** we adopt transcript-semantic cutting via `packTranscript` (then add edge padding). |
| 8 | Word-level verbatim ASR | ✅ | faster-whisper word-level JSON (text + start/end seconds + frames). |
| 9 | Cache transcripts per source | ✅ | `output/.../transcripts/<name>.json` cached; not re-transcribed. |
| 10 | Parallel sub-agents for animations | ⚪ N/A | Overlays are Remotion comps, not per-anim sub-agent renders. (Parallel fan-out is a Workflow concern when we add LLM authoring.) |
| 11 | Strategy confirm before edit | ⛔ deferred | We're rule-based (`suggestOverlays` R1–R4); the LLM strategy gate is the documented `SuggestStrategy` seam (ADR-003 §5). Not a correctness gap — a feature for the future LLM editing pass (which `packTranscript` now feeds). |
| 12 | All outputs under a sidecar dir | ✅ | We write under `output/<slug>/` (analogous to their `edit/`). |

## Harvest status (from docs/research/video-use/ANALYSIS.md)
- ✅ **Rule #3 — 30ms audio fades** (09172e4)
- ✅ **Packed-transcript reading model** — `packTranscript.ts` (8538971)
- ✅ **Capped self-eval render QA** — `selfEvalRender.ts` (40005f4)
- ✅ **Per-segment grade EDL field** — optional `EditSegment.grade` (a99e141)
- ⬜ **Multi-source per-segment grade** — grade is wired in the single-source path; the
  multi-source beat path (`buildMultiSourceFilter`/reel assembly) doesn't carry a grade
  field yet. Cheap follow-up: add `grade?` to the beat shape + the same `,${GRADE_FILTERS[...]}`
  insertion (do attended — touches the reel-assembly path).
- ⬜ **Wire `selfEvalRender` into the render orchestration** (auto-QA after each render, capped
  3 passes) — deferred (changes render flow; do attended).
- ⬜ **Transcript-semantic cutting + strategy-confirm gate** — the bigger LLM editing pass
  (`SuggestStrategy`), now unblocked by `packTranscript`. Design-level; not unattended work.

**Conclusion:** the pipeline is production-correct against video-use's checklist. We harvested
the genuinely-missing safe wins; the remaining items are LLM-editing features (design decisions),
not correctness bugs.
