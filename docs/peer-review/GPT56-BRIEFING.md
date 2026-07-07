# Briefing for GPT-5.6 — peer review of the AI Video Factory (from Claude Fable 5)

> **Written 2026-07-06 by Claude Fable 5** (the model that ran the July audit + dogfood rounds).
> You are being brought in as a PEER — treat everything below as claims from a colleague of
> comparable capability, not as ground truth. Your value is precisely that you will read the
> same evidence with different priors. Where you disagree with me, SAY SO with evidence
> (file:line, a frame you extracted, a command you ran). A confirmed disagreement is worth
> more to Armando than ten polite agreements.

---

## 0. Ground rules (non-negotiable project constraints)

- LOCAL-ONLY, macOS Apple Silicon. Never propose VPS/Docker-prod/cloud rendering.
- FREE/LOCAL tooling only (Edge-TTS, faster-whisper, ffmpeg, Remotion). No required paid APIs.
- Single developer (Armando) + agent sessions. Simplicity beats enterprise scaffolding.
- Brand: navy `#1B3A6E`, gold `#D4AF37`, deep-navy `#0F1B2D`, cream `#FAF7F2`, Inter.
  Spanish-first content.
- All project memory lives in `.claude/` inside the project. Read `.claude/scratchpad.md`
  and `.claude/NEXT-STEPS.md` first in any new session.
- Verified render gotchas (all currently clean — do not reintroduce): no
  `background-clip:text` (opaque box in headless Chrome), no `Math.random`/`Date.now` in
  comps, `<OffthreadVideo>` never `<Video>`, comp ids `[a-zA-Z0-9-]`, Zod v4 defaultProps
  convention (content fields `.default()` and Root supplies complete defaults; NEW fields
  `.optional()`), overlay molecules self-animate from local frame 0 so timed mounting MUST
  wrap them in `<Sequence from>`.

## 1. Read these, in this order (they are the evidence base)

1. `FABLE.md` (repo root) — my full audit: findings V1–V24, each with file:line, failure
   scenario, fix, confidence; a phased fix plan Opus is executing; visual-QA addenda
   (§14.x) covering 220 rendered videos frame-by-frame.
2. `docs/research/autoedit-dogfood/DOGFOOD-PLAYBOOK.md` + `ROUNDS.md` — the repeatable
   talking-head→edited-video benchmark (fixtures, rubric, round-1 scores, ordered gap queue).
3. `docs/research/austin-anim/FINAL-CONSENSUS.md` + `references/creators/austin.marchese/ANALYSIS.md`
   — the 3-reviewer creator study my template verdicts lean on.
4. `docs/research/E-15-template-typology.md` + `references/creators/CREATORS.md` — the
   template taxonomy and the 20+ studied creators.
5. `.claude/memory.md` (tail sections, 2026-07 entries) — the decision log.

## 2. What happened in July (compressed)

- Full technical audit (FABLE.md): 3 empirically-reproduced ffmpeg export bugs (square
  export crashes from 9:16 masters; reels/tiktok from 16:9 keeps a 607px strip; all audio
  ships 96kHz), fake quality gates (lint/pytest/render script all broken), docs ~60% stale.
- Frame-level motion QA of ~220 rendered videos (5 parallel reviewers + freezedetect):
  2 overlay collisions + 58% empty-frame duty cycle in the one shipped production video;
  systemic "build-then-freeze" in 35+ templates; 5/8 caption styles contrast-unsafe;
  keyword banners clipping off-frame in deliverable reels.
- austin.marchese re-check: +2 new uploads, verdict holds (his system = nateherk's
  liquid-glass reskinned warm; atoms not templates); built the one missing layout as
  `FeedbackLoopCycle16x9/9x16`.
- Dogfood rounds on REAL footage (austin + Matthew Berman, with permission): found + fixed
  **V24** (all EDL overlays fired at t=0 — `buildSceneProps` dropped `fromFrame/toFrame`,
  scenes mounted overlays untimed; commit `9ec50d2`) and a **whisper hallucination** (the
  hardcoded Spanish `initial_prompt` became the literal transcript of an English clip;
  fixed in `src/transcribe/transcribe.py`).
- Everything merged to `main` and pushed; Opus is executing the FABLE plan in parallel
  sessions (expect the tree to have moved since this briefing).

## 3. My perspective — and where I am most likely to be wrong

State of the codebase, as I see it: **the composition layer is genuinely strong** (130+
comps, zero unsafe-cast/nondeterminism/contrast-gotcha violations at audit time), **the
delivery layer is the weak link** (multi-platform export bugs, caption contrast, overlay
density), and **the EDL/autoedit architecture is sound** (two-timeline model, pure-function
core, now with timed overlays). The product bet — a branded template library + an automatic
talking-head editor — is coherent and the dogfood loop is the right forcing function.

Places where a different perspective could overturn me — CHECK THESE:

1. **"Austin = nateherk reskinned, 0 new templates."** Three reviewers agreed, but all
   three worked from FRAME SAMPLES (1/3s stills + strips). A reviewer who watches clips at
   full speed may find TIMING signatures (easing personality, beat rhythm, audio-sync
   choices) that stills structurally cannot show. If you can, watch 2–3 austin videos in
   motion (`references/creators/austin.marchese/HGCHgD4uGgY/video.mp4` etc. are on disk)
   and audit the ATOM FIDELITY of our liquid-glass family against them (render
   `LiquidGlassShowcase9x16` / `PromptCardPedagogy9x16` / `FeedbackLoopCycle16x9` and
   compare side-by-side). My fidelity check was structural, not kinetic.
2. **The overlay-suggestion heuristics (`src/autoedit/suggestOverlays.ts`).** I graded them
   "too sparse" and queued a density pass (playbook §7.1). An alternative view: density
   rules are the wrong road entirely, and the right move is jumping straight to the
   LLM/strategy pass (ADR-003 §5 seam, `SuggestStrategy`) with the packed transcript. I
   chose incremental rules because they're testable; you may weigh the tradeoff differently.
3. **My own writing is now part of the codebase.** FABLE.md's fix plan, the playbook, the
   V24 fix, `FeedbackLoopCycleCore.tsx` — audit MY work with the same hostility I applied
   to everything else (author bias is real; e.g., check my `<Sequence layout="none">`
   choice against overlays that might RELY on the extra absolute-fill wrapper, and my
   caption-scrim recommendation vs simply defaulting everyone to box-highlight).
4. **The 18-point dogfood rubric** weights all 9 checks equally. Retention data would say
   hook quality and caption sync matter far more than brand-chip placement. If you have a
   better weighting argument, change the rubric BEFORE more rounds accumulate scores.
5. **Grade-before-LUT (FABLE 4.7)**: I asserted per-segment creative grades should apply
   AFTER the HLG→SDR tonemap. The math direction is right but the visual severity is
   unmeasured — a quick A/B render would confirm or kill that task's priority.
6. **Whisper "small" + alignScriptToWhisper**: I recommended aligning captions to script
   text (pipeline) and testing `medium` for Spanish brand names. For the AUTOEDIT path
   (no script exists — speech is the source), caption text = whisper text; errors there
   need a different mitigation (vocabulary hints? a correction pass?). I did not design one.

## 4. Specific hunting grounds (things I did NOT fully cover)

- **Audio at cut boundaries.** Nobody has LISTENED yet. FABLE 4.4 predicts the 30ms fades
  clip word tails (keeps end exactly at `silence_start`). Listen to
  `output/autoedit/dogfood-*-edit.mp4` cuts; if audible, Task 2.1 (50ms padding) jumps the queue.
- **`QuoteCard` and `ExplainerVideoVertical`** have never been rendered in current form.
  Render + inspect both.
- **The multi-source reel path under stress**: mixed-fps sources, portrait+landscape beats,
  beats shorter than 0.5s. The filtergraph builders are exported and untested
  (`buildMultiSourceConcatFilter`).
- **Silence-trim on REAL rambling footage** (multiple retakes, long pauses, false starts).
  All dogfood clips so far are single clean takes — the trim logic has effectively not been
  dogfooded (`0 silences` in every round-1 clip).
- **Animation vocabulary from OUTSIDE the studied creators.** Our whole motion language
  descends from austin/nate/abhi/hormozi-style AI-tech creators. Armando explicitly wants
  fresh directions: propose 3–5 motion patterns from OTHER genres (broadcast design, sports
  graphics, editorial/documentary, kinetic-typography music videos) that fit the brand and
  can be built as atoms on the existing liquid-glass/token system. Concrete build-specs,
  not moodboards.
- **The 12 root gallery HTMLs + `_template-previews`** reference renders that may have
  drifted after Opus's fixes — stale previews misrepresent current comps.

## 5. The end-to-end editor Armando wants (design to review, then build)

Armando's spec, in his own words (paraphrased from 2026-07-06): *"I give you the folder
where my videos are. You transcribe everything. I record several attempts of the same line
until it comes out right — you detect the 3 candidate takes, show me Option A/B/C, I pick
B. You cut the silences, my mistakes, the filler words, put captions and animations on the
right words, and hand me the finished video."*

Proposed architecture (REVIEW THIS before anyone builds it — it composes existing pieces):

1. **Ingest**: `--folder <dir>` → for each clip: ffprobe + whisper (word-level, cached
   per-file hash) → `packTranscript` per source (already built: `src/autoedit/packTranscript.ts`).
2. **Take clustering**: sliding-window similarity over packed phrases (normalized
   Levenshtein or embedding-free token Jaccard ≥ 0.6 across ≥ 8 words) → groups of
   near-duplicate spans = "takes of the same line". Pure function, unit-testable, no ML needed.
3. **Take review gate** (the human-in-the-loop step Armando described): emit
   `takes-review.md` — per group: Option A/B/C with timestamps + transcript + a one-line
   auto-recommendation (prefer: last take, fewest fillers, no mid-word restart). Armando
   answers "B" (or an agent session asks him interactively).
4. **EDL assembly**: chosen spans → `ReelBeat[]` (multi-source path) or single-source
   `EditSegment[]`; silence-trim within chosen spans; filler-word removal = word-level cut
   list (whisper gives us word timestamps; cutting "um/eh/este/o sea" is a segment-split
   operation on the EDL — design the minimum-cut-length rule carefully, FABLE 4.15).
5. **Decoration**: the existing suggestOverlays (post density-pass) or the LLM strategy
   seam; captions per Armando's chosen default style.
6. **QA**: `selfEvalRender` + the dogfood rubric; deliver with the before/after HTML
   pattern (`output/dogfood/REVIEW.html` is the reference implementation).

Known open questions in this design: how to handle takes that PARTIALLY overlap (he
re-records only the second half of a sentence); ordering when he records B-roll asides
between takes; whether the review gate should be markdown-file-based (works today) or a
tiny local web UI (nicer, more code). Take a position.

## 5.5 Owner decisions of 2026-07-06 (constraints on your recommendations)

Armando ruled on several open questions AFTER most of this briefing was written — his
decisions override anything contrary above or in FABLE.md. Authoritative list:
`docs/research/autoedit-dogfood/DOGFOOD-PLAYBOOK.md` §9. Highlights that affect YOU:
- **Hyperframes stays.** He wants BOTH engines as creative options and suspects (correctly)
  that the "Remotion wins" verdict reflects investment bias, not a fair test. Do not
  recommend deletion; DO consider designing the fair side-by-side (same script, both
  engines) as part of your review.
- **Sampling honesty:** my 220-video motion QA used 5 fps strips on short comps (plus
  freezedetect on every frame) but only ~1 fps on long videos — kinetic nuance on long-form
  and on austin's originals is UNDER-analyzed. Playbook §10 has the cheap deep-motion
  protocol (motion-locate first, then 10–15 fps windows). Running it on austin's punch/card
  moments is high-value work you could do or direct.
- Caption default hormozi-pop; density = austin rhythm (8–15 s); handle chip intermittent
  (windowed, not persistent — component change pending); whisper medium +
  `condition_on_previous_text=False` (his own loop-bug report, now in code); both palettes
  stay; hard rule: frame 0 must carry a thumbnail-worthy visual hook.

## 6. Deliverable I ask of you

Write `docs/peer-review/GPT56-FINDINGS.md` with: (1) verdicts you CONFIRMED vs OVERTURNED
from FABLE.md/the playbook, each with evidence; (2) new findings with file:line or
frame-level proof; (3) your position on §3's six challenge points; (4) 3–5 new animation
patterns with build-specs; (5) your review of the §5 editor design (approve/amend, with
specifics); (6) a re-prioritized queue if you disagree with playbook §7. Commit nothing
else; Armando + Opus will route the work.
