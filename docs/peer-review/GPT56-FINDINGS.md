# GPT-5.6 peer findings — AI Video Factory

**Review date:** 2026-07-09

**Reviewed revision:** `c4a37d6` (`main`, identical to `origin/main`)

**Reviewer stance:** independent peer review of `FABLE.md`, the July dogfood system, and the proposed multi-take editor. No production code was changed during this review.

Evidence labels are deliberate:

- **[CONFIRMED]** means I reproduced the behavior, inspected the cited code path, or looked at the cited rendered frame.
- **[OVERTURNED]** means the current evidence contradicts the prior conclusion or priority.
- **[HYPOTHESIS]** means the mechanism is plausible but this review did not establish the user-visible result.
- A historical finding can be **confirmed but resolved**: the original diagnosis was right, but it is no longer an open task on the reviewed revision.

Baseline commands on this checkout:

| command | result |
|---|---|
| `git status --short --branch`; `git rev-list --left-right --count origin/main...main` | clean `main`; `0 0` divergence |
| `npx tsc --noEmit` | exit 0 |
| `npm test -- --reporter=verbose` | 4 files, 40 tests, all pass; no stale-worktree duplication |
| `npm run lint` | exit 2; ESLint 10.1.0 cannot find `eslint.config.*` |
| `uv run pytest -q` | exit 126; `.venv/bin/pytest` still points at the former `Documents/...` location |
| `npm run render` | exit 1; `src/pipeline/render.ts` does not exist |
| runtime | Node 24.14.0; ffmpeg 8.1; uv 0.11.3 |

The decisive visual artifacts from this review are under `/tmp/gpt56-video-review.ykHWEW/`, `/tmp/gpt56-tech-review/`, and the explicitly named `/tmp/*.png`/`.jpg` files below. They are disposable review evidence, not new project assets.

## 1. Confirmed and overturned verdicts

### 1.1 Export-layer findings: confirmed historically, resolved now

**[CONFIRMED — RESOLVED] FABLE 4.1/4.2 (direction-dependent crop) and 4.5/4.6 (96 kHz/mono audio).** The prior failure analysis was correct. The current implementation now uses scale-to-cover followed by an exact center crop (`src/ffmpeg/commands.ts:24-30`), forces 48 kHz stereo after `loudnorm` (`src/ffmpeg/commands.ts:62-80`), and copies normalized audio through resize (`src/ffmpeg/commands.ts:19-22,52-58`). I exercised the real `normalizeAudio` and `resize` functions on a portrait, mono, 44.1 kHz synthetic input: the normalized output probed as 48 kHz stereo, and the square output was 64×64 without an ffmpeg error. These items should not remain in the active queue.

**[CONFIRMED — STILL OPEN STRATEGICALLY] Native-aspect rendering is not wired.** Correct crop math prevents crashes, but the main generator still maps `explainer` to the landscape `ExplainerVideo` (`src/pipeline/pipeline.ts:197-219`), renders one master, then derives all requested platforms in Stage 4 (`src/pipeline/pipeline.ts:266-280`). `ExplainerVideoVertical` is registered (`src/Root.tsx:343-365`) but the pipeline never selects it for a vertical platform. FABLE's strategic recommendation survives; its emergency export-bug priority does not.

### 1.2 Autoedit timing and cut findings: the single-source fixes hold; the multi-source equivalent does not

**[CONFIRMED — RESOLVED FOR SINGLE SOURCE] FABLE 4.3 cumulative timeline drift.** `toEditSegments` now accumulates seconds and rounds cumulative boundaries (`src/autoedit/silenceTrim.ts:232-269`); caption words are shifted in seconds and then converted to frames (`src/autoedit/buildEditPlan.ts:37-74`). This is the right correction.

**[CONFIRMED — RESOLVED MECHANISM, AUDIBILITY NOT ESTABLISHED] FABLE 4.4 zero-room audio fades.** Keeps now grow 50 ms into adjacent silence, with non-overlap and media-edge clamps (`src/autoedit/silenceTrim.ts:114-215`), and regression tests cover it (`src/autoedit/autoedit.test.ts:71-106`). The old dogfood renders predate this fix. Their joins did not show a digital discontinuity in a sample-domain check, but listening was never completed. Therefore “every cut audibly clips speech” was too strong; the mechanism was valid, the preventive fix is shipped, and auditory grading remains a human QA item rather than a current implementation blocker.

**[OVERTURNED] “The EDL/autoedit architecture is sound” as a statement about the requested folder-of-retakes product.** The single-source two-timeline model is good, but `EditPlan` v1 has one `sourceVideo` and segments without a source identifier (`src/autoedit/editPlan.ts:400-416`). The multi-source reel path instead accepts an ad hoc `ReelBeat[]` and builds scene props separately (`src/autoedit/renderFromPlan.ts:893-940`). The product's canonical artifact cannot presently represent “Option B came from file 3, then Option A from file 1,” and the two render paths have already drifted in correctness. The foundation should be retained but generalized to a source-aware EditPlan v2 before the take editor is built.

### 1.3 V24: entry timing fixed, lifecycle correctness not fixed

**[CONFIRMED] V24's original root cause and entry-timing fix.** `buildSceneProps` now forwards `fromFrame`/`toFrame` (`src/autoedit/renderFromPlan.ts:471-482`), and both scene variants mount a timed overlay in a rebasing `Sequence` (`src/compositions/SpeakerOverlayScene16x9.tsx:127-159`; `src/compositions/SpeakerOverlayScene9x16.tsx:100-131`). Remotion 4.0.443's own implementation returns the child directly for `layout="none"`, rather than introducing an `AbsoluteFill` (`node_modules/remotion/dist/cjs/Sequence.js:145-167`). Every current registry molecule uses its own `AbsoluteFill`; the no-wrapper choice is sound for the current registry.

**[OVERTURNED] “V24 fixed” if that means the entire planned overlay window now renders correctly.** A `Sequence` clips at `toFrame`; it does not adapt a molecule's internal outro to that window. `IconPopOverSpeaker` defaults to a 6-frame entrance, 60-frame hold, and 6-frame exit (`src/components/overlays/IconPopOverSpeaker.tsx:50-67,123-149`). The real Berman dogfood plan schedules it for frames 155–193 (38 frames), with the incompatible `label` prop (`.claude/worktrees/recursing-tu-dac74b/output/dogfood/berman-end2-plan.json:481-490`). In the real render, the brain is full-size at frame 192 and absent at frame 193: `/tmp/gpt56-video-review.ykHWEW/berman-f192.png` versus `berman-f193.png`; the dense strip is `berman-icon-exit-180-197.png`. This is a hard cut, not an exit animation.

**[CONFIRMED] The requested V24 regression test was never added.** `src/autoedit/renderFromPlan.test.ts:7-14` imports filter/transcript helpers but not `buildSceneProps`; a test search finds no `buildSceneProps` coverage. The two scene files also duplicate the timing code, so a future merge can regress one aspect independently.

### 1.4 Fable's quality-gate verdict is only partially obsolete

**[CONFIRMED — RESOLVED]** TypeScript is clean, and `vitest.config.ts:9-19` now excludes worktrees/Hyperframes. The current result is 4 files/40 tests once, rather than FABLE's duplicated 22-test run.

**[CONFIRMED — STILL OPEN]** Lint, pytest, and `npm run render` remain non-gates. Their broken scripts are still declared at `package.json:6-20`, and the exact current failures are in the baseline table above. FABLE's diagnosis remains correct for three of the four gates.

### 1.5 Composition quality: strong library, weaker production defaults

**[CONFIRMED, WITH NARROWER WORDING]** The library has a broad, deterministic, brand-aware motion vocabulary, and the liquid-glass family is a useful atom system. The claim should be “strong component library,” not “production-ready composition layer.” Current registered defaults can still violate owner-level delivery rules, and one layout-mode integration deletes the actual video (Finding 2.1).

**[CONFIRMED] FABLE V3/V17's empty-hook/build-then-hold pattern exists in two previously unrendered current forms.** I rendered both requested compositions:

```text
npx remotion render src/index.ts QuoteCard /tmp/gpt56-video-review.ykHWEW/QuoteCard.mp4 --log=error
npx remotion render src/index.ts ExplainerVideoVertical /tmp/gpt56-video-review.ykHWEW/ExplainerVideoVertical.mp4 --log=error
```

`QuoteCard` is 150 frames/5 s and `ExplainerVideoVertical` is 300 frames/10 s by ffprobe. I inspected `QuoteCard-sheet.png`, `QuoteCard-f0.png`, `ExplainerVideoVertical-sheet.png`, and `ExplainerVideoVertical-f0.png`. Both frame-zero images are essentially background plus the tiny watermark, contrary to the owner hard rule in `DOGFOOD-PLAYBOOK.md:239-243`. `QuoteCard` deliberately delays quote text to frames 15–40 and the author to 40–60 (`src/compositions/QuoteCard.tsx:30-57`). The vertical explainer is the landscape component on a taller canvas and contains only a centered title/bar for almost all ten seconds (`src/compositions/ExplainerVideo.tsx:34-53,64-123`; defaults at `src/Root.tsx:343-365`).

### 1.6 Priorities and product verdicts that should be overturned

**[OVERTURNED] Playbook §7.1's TF-IDF density filler as the next feature.** A guaranteed `MarkerSweepWord` every 15 seconds optimizes a score rather than an edit. It can emphasize the statistically unusual word even when the sentence has no visual teaching beat, and the current `SuggestStrategy` lacks segment/phrase context anyway (`src/autoedit/suggestOverlays.ts:70-78`). Correctness failures in transcription, source assembly, and layout rendering are ahead of density. A deterministic pass remains useful for candidate extraction and safety validation, not for manufacturing mandatory decoration.

**[OVERTURNED] FABLE's equal-weight 18-point rubric and ≥14 ship threshold.** A video can score timing 2, density 2, relevance 2, legibility 2, sync 0, safe area 2, cuts 0, dead air 2, brand 2 = **14/18** while captions are wholly unsynchronized and speech is clipped. Round 1 also counts `n/a` cells as zero—Berman end1 receives 8/18 even though timing and relevance had no overlay to grade (`docs/research/autoedit-dogfood/ROUNDS.md:4-13`). The score confounds “no opportunity” with “failure” and gives brand placement the same weight as intelligibility.

**[OVERTURNED BY OWNER DECISION] Archive Hyperframes.** FABLE's maintenance argument was rational, but the authoritative owner decision is to retain both engines and run a fair same-script comparison (`DOGFOOD-PLAYBOOK.md:222-227`). This review does not relitigate that decision.

**[CONFIRMED BUT DOWNGRADED] Grade after HLG→SDR LUT.** The math and current order are right (`src/autoedit/renderFromPlan.ts:229-250`, with tests at `src/autoedit/renderFromPlan.test.ts:58-75`). I inspected actual A/B frames from the HLG `IMG_3618.MOV`: `/tmp/gpt56-tech-review/grade-warm-before-left-after-right.png` and `grade-presets-before-left-after-right.png`. Across 3 s, 11 s, and 19 s, warm-cinematic old-vs-current mean ΔE76 was about 2.44–2.48 (p95 about 4.64–4.68; RGB MAE about 4.3/255), with no clipped channels. The difference is visible but modest—not the washed-out medium-severity defect FABLE anticipated. The correction is already shipped and should leave the queue.

**[OVERTURNED IN WORDING; STRUCTURAL CORE CONFIRMED] “Austin = nateherk reskinned, zero new templates.”** Same-rate motion strips support the narrower shared-family claim: Austin's warm card builds and Nate's cool staggered cards use the same broad glass-card scale/blur-resolve, stagger, and hold grammar. But the updated corpus did add one previously uncataloged feedback-loop layout, which the project subsequently built (`.claude/worktrees/recursing-tu-dac74b/references/creators/austin.marchese/ANALYSIS.md:89-105`). The accurate statement is: **the original 29-video corpus added no layout family; the updated corpus added one; there are now zero known unimplemented Austin layout families.** Kinetic fidelity of the current implementations is a separate question, and it does not pass unqualified (Finding 2.11 and Challenge 1).

## 2. New findings

### 2.1 [CRITICAL] Any non-empty `layoutTrack` replaces the recording with a placeholder and removes its audio

**Evidence.** `buildSceneProps` supplies the staged recording only as `videoSrc` (`src/autoedit/renderFromPlan.ts:484-489`). When a plan has `layoutTrack`, it forwards layout metadata but never sets `camSrc` or `screenSrc` (`src/autoedit/renderFromPlan.ts:492-502`). Both scenes switch to layout mode solely because `layoutTrack` is non-empty (`src/compositions/SpeakerOverlayScene16x9.tsx:215-228`; `src/compositions/SpeakerOverlayScene9x16.tsx:183-200`), and layout mode passes the undefined `camSrc` into `LayoutTrack` while ignoring `videoSrc` (`SpeakerOverlayScene16x9.tsx:265-276`; `SpeakerOverlayScene9x16.tsx:234-244`). `LayoutTrack` renders a labeled placeholder when a source is absent (`src/components/layout/LayoutTrack.tsx:283-347,409-415`).

I rendered a valid MP4 through scene props containing `videoSrc` plus a full-cam `layoutTrack`. The inspected frame `/tmp/layout-videoSrc-dropped-clean.jpg` is a blue well labeled **CAM**, not the input footage. Because the legacy `OffthreadVideo` is not mounted and no layout video exists, its audio is absent too.

**Required fix.** When a staged single-source clip enters layout mode, map it to `camSrc` (and define screen-source behavior explicitly). Add a rendered-frame integration test that uses a uniquely colored input and asserts it appears in both legacy and layout modes; ffprobe or an audio sample assertion must prove the voice track survives. Do this before enabling layout decisions in any semantic planner.

### 2.2 [HIGH] Multi-source video, caption, QA, and render-duration timelines use incompatible rounding

**Evidence.** Every input beat gets its own `fps=${fps}` before concat (`src/autoedit/renderFromPlan.ts:738-750`), so ffmpeg quantizes each beat independently. `buildCombinedTranscript` instead sums exact seconds and rounds the aggregate/word coordinates (`src/autoedit/renderFromPlan.ts:857-890`); the render is forced to that aggregate frame count (`src/autoedit/renderFromPlan.ts:915-924,963-970`). QA boundaries independently repeat the seconds math (`src/autoedit/renderFromPlan.ts:979-1005`).

The reproducible stress driver is `/tmp/gpt56-tech-review/filter-stress.mts`; it imports the actual exported builders. Twenty-five 1.03 s beats at 30 fps produced:

```text
REPEATED_PLAN_FRAMES=773
staged video: nb_read_frames=775, duration=25.833333
staged audio: duration=25.750000
```

Ten 10 ms beats produced plan=3 frames, video=2 frames, audio=0.100 s (`/tmp/gpt56-tech-review/filter-short-stress.mts`). Mixed 24/29.97/60 fps and portrait/landscape sources otherwise succeeded at 540×960, SAR 1:1, 30 fps, 48 kHz stereo, which confirms the recent SAR/audio normalization fixes while isolating the rounding defect.

**Failure mode.** Captions and cut-contact-sheet samples drift from the actual staged video; accumulated surplus video can be truncated by Remotion, while a sub-frame selected take can disappear visually.

**Required fix.** Establish one beat-timing function and use its boundaries everywhere. Prefer a single fps normalization after video concat, with cumulative boundary quantization, rather than an `fps` filter per input; reject or deliberately expand zero-frame beats. Whichever implementation is chosen, the staged video frame count, audio duration policy, transcript offsets, QA cut frames, and Remotion duration must derive from the same `BeatTiming[]`. Add ffprobe-backed tests for 25×1.03 s, 10 ms beats, and mixed source frame rates.

### 2.3 [HIGH] One audio-less file crashes the entire multi-source assembly

**Evidence.** Single-source staging probes `hasAudioStream` and supports `-an` (`src/autoedit/renderFromPlan.ts:375-397`). Multi-source staging probes only HDR (`src/autoedit/renderFromPlan.ts:790-807`), while its builder unconditionally references every `[i:a]` and maps `[aout]` (`src/autoedit/renderFromPlan.ts:753-772,815-840`). The actual builder, given one normal beat and one video-only beat, exits 234:

```text
Stream specifier ':a' ... matches no streams.
Error binding filtergraph inputs/outputs: Invalid argument
```

The reproducer is the `audioLess` case at `/tmp/gpt56-tech-review/filter-stress.mts:70-80`.

**Required fix.** Probe audio per source/beat. For a missing stream in a mixed reel, synthesize 48 kHz stereo silence for exactly that beat's canonical duration; when all beats are silent, allow a video-only staged output. Test mixed voiced/silent, all-silent, and silent B-roll between two voiced takes.

### 2.4 [CRITICAL] The generic Spanish Whisper prompt can still replace real Spanish speech

**Evidence.** The July fix only limits the literal default prompt to languages beginning with `es`; it still sends `"Transcripción en español con puntuación correcta."` for every Spanish source (`src/transcribe/transcribe.py:40-62`). On a 30.0 s montage made from real Spanish raw takes `IMG_3627.MOV`, `IMG_3629.MOV`, and `IMG_3632.MOV`, the exact current command was:

```text
uv run python src/transcribe/transcribe.py \
  --input /tmp/gpt56-tech-review/whisper-proper-nouns.wav \
  --model medium --language es --fps 30
```

It returned only six words at 21.25–28.71 s: **“Transcripción en español con puntuación correcta.”** The per-word probabilities include `en=0.0179` and `con=0.0041`, but those warnings are subsequently discarded. The same model/settings with no initial prompt returned 27 real words. Faster-whisper 1.2.1's local API supports `hotwords`; an explicit project glossary produced 31 real words including “Claude Cowork,” but one forced `Claude` had probability 0.008, proving that hints are not truth.

The wrapper emits each word's `probability` (`src/transcribe/transcribe.py:79-89`) and language probability (`src/transcribe/transcribe.py:96-104`), but `editPlanWordSchema` omits probability (`src/autoedit/editPlan.ts:49-55`). Autoedit's `safeParse` therefore strips it (`src/autoedit/cli.ts:95-101`). Autoedit also does not expose the Python wrapper's `--initial-prompt` (`src/autoedit/cli.ts:76-94`), and no hotword/glossary option exists.

**Required fix.** Remove the generic default prompt entirely. Add an optional per-project glossary/hotwords file, retain raw transcript plus word probability/language confidence in the plan, and flag low-confidence glossary matches for correction rather than silently accepting them. The cache key must include source content hash, model, language, glossary/hotwords hash, and transcriber version. A transcript-correction gate belongs before take clustering and decoration.

### 2.5 [HIGH] The overlay boundary contract is internally contradictory

There are three independent defects:

1. **Lifecycle clip:** the hard-cut V24 evidence in §1.3.
2. **Validated anchor can be overridden:** `props: {anchor: o.anchor, ...o.props}` means loose molecule props win over the top-level, schema-validated anchor (`src/autoedit/renderFromPlan.ts:476-480`). A loose `enterFrame` can likewise double-offset a `Sequence`-rebased molecule.
3. **Invalid windows become one-frame overlays:** scene schemas accept arbitrary numbers (`SpeakerOverlayScene16x9.tsx:60-72`; `SpeakerOverlayScene9x16.tsx:31-43`), and render code silently converts `toFrame <= fromFrame` to one frame with `Math.max(1, ...)` (`SpeakerOverlayScene16x9.tsx:141-150`; `SpeakerOverlayScene9x16.tsx:113-122`).

**Required fix.** Make scheduling fields authoritative and separate from content props. Validate integer, non-negative frames and `toFrame > fromFrame`, reject scheduling keys inside `props`, and introduce a registry lifecycle adapter so each molecule receives a local duration/exit that completes before unmount. Test `from-1`, `from`, `to-2`, `to-1`, and `to` pixels for every planner-emittable molecule.

### 2.6 [MEDIUM] Brand suggestions do not satisfy the component schema, so “Anthropic” becomes a brain

**Evidence.** R4 emits `IconPopOverSpeaker` with `{label, isBrandMark}` (`src/autoedit/suggestOverlays.ts:299-306`). That component accepts `icon`, anchor, timing, size, and glow fields, defaulting `icon` to 🧠 (`src/components/overlays/IconPopOverSpeaker.tsx:50-67`). Zod drops the unrecognized label/flag. The inspected real dogfood frame `berman-f192.png` therefore shows the brain for “Anthropic,” exactly as the playbook observed (`DOGFOOD-PLAYBOOK.md:170-172`). Existing tests only verify that words classify as brands (`src/autoedit/autoedit.test.ts:226-228`), not that emitted props render the intended mark.

**Required fix.** Use the already registered `BrandLogoPopOverSpeaker` when a local asset exists, and a text-chip molecule for an unknown brand. Validate planner output against the selected molecule's schema before plan serialization; never rely on Zod silently stripping semantic fields.

### 2.7 [MEDIUM] `FeedbackLoopCycle` does not meet its own 2–6-station and duration contracts

**Evidence from code and inspected frames:**

- The schema allows 2–6 stations (`src/compositions/FeedbackLoopCycleCore.tsx:93-114`), but arc endpoints are a fixed angular trim (`src/compositions/FeedbackLoopCycleCore.tsx:146-177`). At the default four stations, the inspected 16:9 and 9:16 frame-145 stills (`/tmp/feedback-loop-16x9-f145.png`, `/tmp/feedback-loop-9x16-f145.png`) show visibly disconnected arcs, especially in portrait. With six stations and the portrait default 27° trim (`src/compositions/FeedbackLoopCycle9x16.tsx:11-22`), each 60° sector leaves only about 6° of arc. The inspected `/tmp/gpt56-video-review.ykHWEW/FeedbackLoop-6stations.png` contains tiny detached dash/arrow fragments rather than a legible cycle.
- `holdSeconds=0` is legal, and calculated duration ends at `buildEnd` (`FeedbackLoopCycleCore.tsx:74-81,113-114,314-320`). The last arrow does not reach full opacity until `buildEnd+4` (`FeedbackLoopCycleCore.tsx:465-469`), and the center label until `buildEnd+10` (`FeedbackLoopCycleCore.tsx:341-347`), so legal content is truncated.
- The background begins with a translucent glow stop and has no explicit opaque base (`FeedbackLoopCycleCore.tsx:352-363`). A rendered PNG pixel sampled in the glow/background path had partial alpha; H.264 hides this by compositing to black, while reuse as a transparent layer can differ.
- No FeedbackLoop test exists.

**Required fix.** Compute arc intersections against each rectangular card boundary rather than trimming by degrees; impose a minimum usable arc or a distinct six-node layout. Include exit/build-tail frames in metadata even when hold is zero. Paint an opaque deep-navy base beneath the radial glow. Add schema-duration and 2/4/6-station visual regression cases.

### 2.8 [MEDIUM] `selfEvalRender` overstates what it evaluates and omits owner hard gates

**Evidence.** The module header says it catches audio pops (`src/autoedit/selfEvalRender.ts:4-10`), but implementation only probes duration and extracts before/after video frames (`src/autoedit/selfEvalRender.ts:95-145`). Its checklist covers visual discontinuity, subtitle/overlay overlap, window start, and grade (`src/autoedit/selfEvalRender.ts:148-166`); it has no audio measurement/listening artifact, frame-zero hook check, caption contrast measurement, overlay-window validity, or planner density/overlap check. The owner explicitly requires a non-caption visual at frame zero (`DOGFOOD-PLAYBOOK.md:239-243`).

**Required fix.** Rename claims to match implemented evidence, then add hard-gate results: frame-zero non-caption hook; A/V duration agreement; invalid/overlapping windows; caption safe-area and contrast metadata; audio-boundary waveform/spectrogram artifact plus a required listen checkbox when cuts exist. A contact sheet is evidence for a reviewer, not an automatic pass.

### 2.9 [MEDIUM] Owner decisions are documented but not wired into defaults

- Caption default is owner-selected `hormozi-pop` (`DOGFOOD-PLAYBOOK.md:211-212`), but CLI and both render paths still default to `editorial-cyan` (`src/autoedit/cli.ts:124,223-225`; `src/autoedit/renderFromPlan.ts:521,903`).
- Handle must be intermittent (`DOGFOOD-PLAYBOOK.md:214-218`), but both scene variants render `HandleChip` continuously in legacy and layout modes (`SpeakerOverlayScene16x9.tsx:257-260,287-292`; `SpeakerOverlayScene9x16.tsx:227-229,253-256`). There is no `handleWindows` field.
- Frame-zero visual hook is neither a plan invariant nor a self-eval check (Finding 2.8).

These are not cosmetic backlog notes: defaults are the behavior an autonomous agent will ship.

### 2.10 [MEDIUM] The current semantic extension seam cannot express its documented job

`SuggestStrategy` is `(words, opts) => OverlayInstance[]` (`src/autoedit/suggestOverlays.ts:70-78`). ADR-003 nevertheless says a future implementation with the same signature will also decide `mode: speaker|broll` per segment (`docs/research/wave-8/ADR-003-autoedit-pipeline.md:219-228`). It cannot: it receives neither segments nor media inventory and returns only overlays. It also cannot implement the playbook's “lower-third at the start of every kept segment” because segment boundaries are absent.

The replacement contract should accept a structured `PlanningContext` (sources, segments/phrases, words with confidence, aspect/safe areas, available local media, owner rules) and return a `DecorationPlan` containing overlay decisions, optional segment-mode/layout decisions, rationales, and uncertainty. Keep pure validators downstream so an agent cannot emit invalid windows or inaccessible styles.

### 2.11 [MEDIUM] The approved Austin atom contracts are incomplete, and fixed clocks erase the source's kinetic signature

This is not a request for more Austin templates. It is a contract-completion finding.

**Prompt card.** The approved spec requires both 9:16 and 16:9, a real `presenterSrc`, a PIP 6–10 frames after the card (about 12 for dense copy), then a second-read highlight (`docs/research/austin-anim/BUILD-SPEC.md:53-62`). Current registration has only `PromptCardPedagogy9x16` (`src/Root.tsx:2697-2703`); the component exposes placeholder `pipLabel/pipCaption` instead of media (`src/compositions/PromptCardPedagogy9x16.tsx:98-111,283-367`) and computes PIP only after all lines finish plus a default 40-frame delay (`PromptCardPedagogy9x16.tsx:406-418`). The highlight is scheduled from its line start (`PromptCardPedagogy9x16.tsx:474-519`), so default highlight begins around frame 68 while PIP begins around frame 101: the order is reversed.

I inspected Austin at equal 10 fps. In the source, the prompt card and real PIP assemble at about 805.7–806.5 s (`/tmp/gpt56-kinetic/HG-804-808-10fps.jpg`); the first magenta semantic highlight begins about 810.1 s (`HG-808-812-10fps.jpg`) as local faster-whisper places “The first feature” at 810.26 s. The source is cue-locked, not driven by a showcase clock.

**Feedback loop.** The source disassembles/defocuses the talking-head scene around 451.5 s, then builds stations from about 452–460 s over blurred/dimmed live footage (`/tmp/gpt56-kinetic/HG-loop-0.5s-large.png`). Locally transcribed cue words begin near 452.30 (“pick”), 454.78 (“measure”), 457.74 (“propose”), and 460.10 (“re-measure”). Current `FeedbackLoopCycle` hard-codes 30 frames per station and closes first-to-last in 4 s (`src/compositions/FeedbackLoopCycleCore.tsx:59-81,314-320,405-508`); its schema has no footage/background source and paints a navy takeover (`FeedbackLoopCycleCore.tsx:93-133,352-363`). It reproduces the diagram, not the source transition or teaching rhythm.

**Arc wipe.** The approved spec names a curved arc/streak and an `arcRadius` prop (`docs/research/austin-anim/BUILD-SPEC.md:81-86`). Current props omit `arcRadius` (`src/components/liquidglass/ArcLightWipe.tsx:39-57`) and rendering uses two tall, straight, rotated gradient `<div>` bands (`ArcLightWipe.tsx:123-173`). The inspected 15 fps strip `/tmp/gpt56-kinetic/ours-wipe-15fps.png` confirms a smooth diagonal double band, not an arc. Rename it `LightBandWipe` or implement the specified curved SVG path; smoothness does not establish fidelity.

**Required completion.** Extract a shared aspect-agnostic PromptCard core with 9:16/16:9 wrappers, real local presenter media, explicit `pipStartFrame` and `highlightStartFrame` (or word-anchor cues); give FeedbackLoop station cue frames and transparent/video-backed mode; and either restore the ArcLight `arcRadius` contract or correct its name/spec. The key reusable lesson is that planner-facing atoms need cue-frame inputs and lifecycle-to-window adaptation, not only fixed internal clocks.

## 3. Positions on the briefing's six challenge points

### Challenge 1 — “Austin = nateherk reskinned; zero new templates”

**Position: [OVERTURNED IN ITS PRESENT WORDING; STRUCTURAL CORE CONFIRMED].** Same-rate motion evidence supports the narrow claim that Austin and nateherk share a glass-card family: Austin's warm card builds (`/tmp/gpt56-kinetic/HG-0-5-10fps.jpg`, `2f-604-609-10fps.jpg`, `2f-624-629-10fps.jpg`) and Nate's cool staggered cards (`nate-12-18-10fps.jpg`) use the same broad scale/blur-resolve, stagger, and hold grammar. It does not support “identical timing,” and “zero new templates” is literally contradicted by the July re-check's one feedback-cycle layout (`.claude/worktrees/recursing-tu-dac74b/references/creators/austin.marchese/ANALYSIS.md:89-105`). The defensible statement is: **the original corpus added no new family; the updated corpus added one, which is now implemented; zero known layout gaps remain.**

The kinetic pass also overturns any claim that the current atoms faithfully reproduce source timing. Austin's prompt/PIP appears before the narration-locked semantic highlight, whereas current `PromptCardPedagogy` reverses that order; the source loop takes about eight seconds and follows spoken step cues, whereas the current loop closes in four; `ArcLightWipe` is a straight band, not its specified arc. The needed work is to finish cue/media/aspect contracts, not invent another layout family (Finding 2.11).

### Challenge 2 — density rules versus semantic strategy

**Position: overturn the queued density pass.** Do not add TF-IDF filler or a pseudo-linguistic “first noun-ish phrase” lower-third. Build the source-aware planning context and let a local agent propose semantically justified beats from packed transcripts. Retain small rules for high-precision candidate signals (explicit numerals, ordinals, known brands) and use deterministic code for cooldowns, safe areas, overlap, minimum/maximum duration, frame-zero hook, and schema validation. The agent proposes; the validator constrains; the user can inspect the rationale.

This is compatible with local/free operation: the project does not need a paid runtime API. An agent session can write a structured plan, and the deterministic rule strategy remains the offline fallback/baseline.

### Challenge 3 — hostile review of Fable's own code/docs

**Position: mixed.**

- `Sequence layout="none"` is correct for the current registry and is not the V24 defect.
- The V24 implementation fixed entry time but not exit choreography, scheduling-key ownership, window validation, or regression coverage (§1.3 and Finding 2.5).
- `FeedbackLoopCycle` fails legal edge cases and its geometric promise (Finding 2.7).
- The Austin P1 build spec is not actually complete: PromptCard lacks 16:9 and real `presenterSrc`, fixed-clock ordering is backwards, and ArcLight dropped its defining radius/curve contract (Finding 2.11).
- The playbook's brand-brain diagnosis is correct; its next-step density prescription is not.
- A blanket box-highlight default is not a substitute for fixing optional caption styles. The owner selected `hormozi-pop` as the production default, but when another style is intentionally selected it still needs a declared contrast treatment (stroke, backing/scrim, or boxed mode) and a bright-footage test. Preserve expressive styles; make their safety explicit.

### Challenge 4 — equal 18-point dogfood rubric

**Position: replace it before Round 2.** Use hard gates first, then a weighted score only for videos that pass them.

Hard gates:

1. Transcript/take integrity: no prompt hallucination, no missing selected span, reviewed low-confidence proper nouns.
2. Cut/audio integrity: no clipped speech, missing stream, click/pop, or A/V duration mismatch.
3. Caption integrity: text is correct, synchronized, legible, inside safe area, and non-overlapping.
4. Render integrity: selected source appears; no placeholder, invalid window, hard lifecycle clip, or missing first-frame hook.

Suggested 100-point quality score after gates pass:

| dimension | weight |
|---|---:|
| semantic/take choice and graphic relevance | 25 |
| cut naturalness and pacing | 20 |
| caption readability and rhythm | 20 |
| motion timing/choreography | 15 |
| hook and payoff | 10 |
| brand execution | 5 |
| density/variety | 5 |

Mark non-applicable dimensions `n/a` and renormalize the denominator. Never convert `n/a` to zero. Keep raw sub-scores and evidence links so totals cannot hide a gate failure.

### Challenge 5 — grade-before-LUT severity

**Position: Fable was mathematically right and operationally over-prioritized it.** Current LUT→grade order is correct and tested. The real-footage A/B is modest (details in §1.6), with no clipping or washout in the sampled warm/neutral/cool presets. Close the task; do not spend another round on it unless a new HDR source/preset visibly fails.

### Challenge 6 — Whisper medium + script alignment/correction

**Position: medium is not a correction system, and the current generic prompt is actively unsafe.** Pipeline script-to-timing alignment is appropriate only where an authored script exists. Autoedit needs raw-ASR preservation, optional project vocabulary, confidence retention, a correction gate, and cache provenance. The reproduced prompt hallucination in Finding 2.4 moves this ahead of overlay density and multi-take clustering: corrupted text makes take groups, captions, fillers, and animation triggers all wrong at once.

## 4. New animation patterns from outside the AI-creator niche

These are atoms/short sequences, not more monolithic templates. All use the existing Inter stack and Armando palette: navy `#1B3A6E`, gold `#D4AF37`, deep navy `#0F1B2D`, cream `#FAF7F2`. Each must expose 9:16 and 16:9-safe normalized geometry, explicit cue-frame inputs, and lifecycle-to-window adaptation; the kinetic audit shows fixed internal clocks are the present fidelity failure.

### 4.1 `BroadcastDataSting` — election/news live graphics

- **Use:** a sourced statistic, named development, or “what changed” sentence.
- **Props:** `kicker`, `headline`, `value?`, `source?`, `anchor`, `durationFrames=72`, `theme`.
- **Build choreography:** frame 0 already contains the cover-safe headline in a low-contrast settled plate; gold scan line crosses in frames 0–6; cream/navy plate clip-reveals 4–12; headline rises 9–18; numeric value counts 12–26; source slug holds through 54; plate collapses 54–66 and is absent by 72.
- **Construction:** transparent `AbsoluteFill`; lower-third or upper-third modes; 7% side inset and caption/handle exclusion zones. Reuse brand tokens, not newsroom red/blue.
- **Planner trigger:** explicit number + attributable claim, not every number. Require `source` when the language is evidentiary.

### 4.2 `SportsTelestratorPath` — coaching/replay annotation

- **Use:** point to a UI region, product feature, physical object, or process path while the speaker explains “aquí / esto / de aquí a aquí.”
- **Props:** normalized `points[]`, `targetBox?`, `label`, `freezeFrame?`, `dimAlpha`, `durationFrames=60..90`.
- **Build choreography:** freeze or reduce footage motion only when explicitly requested; dim surround over 0–5; gold SVG path draws via dash offset 4–18; arrowhead lands at 18; target ring pulses twice at 18–34; compact label plate appears 22–30; everything eases away in the last 8 frames.
- **Construction:** compose existing `RegionBoxAnnotation` and `DimSurroundingsSpotlight` concepts, but add a multi-point path primitive. Keep face/speaker exclusion geometry in planner context.
- **Planner trigger:** demonstrative phrase plus a known on-screen region; never invent coordinates from transcript alone.

### 4.3 `DocumentaryEvidenceLedger` — documentary/source-card language

- **Use:** quote, source document, date, receipt, changelog, or proof moment.
- **Props:** `quote`, `source`, `date?`, `evidenceImage?`, `highlightRange?`, `durationFrames=120..180`, `theme`.
- **Build choreography:** footage desaturates/dims 0–8; cream paper card enters with a 6 px deterministic registration offset 4–14; source/date slug appears immediately; quote reveals by clause 12–40; gold marker underline sweeps only the cited phrase 34–50; evidence remains readable for at least 60 frames; card leaves with a restrained vertical editorial wipe.
- **Construction:** no random film jitter. Use a seeded two-state 1–2 px registration imperfection at most; preserve readable text and a source line.
- **Planner trigger:** evidence/citation intent, direct quote, or named document—not generic emphasis.

### 4.4 `SemanticWordRelay` — kinetic-typography music-video grammar

- **Use:** a short rhythmic phrase whose word order is the teaching device (“captura, compara, elige”).
- **Props:** `tokens[]`, `emphasisIndices[]`, `layout=rail|grid|stack`, `durationFrames=60..90`, `accentIndex?`.
- **Build choreography:** the complete phrase is faint but cover-usable at frame 0; words snap from their sentence positions into a structured rail/grid over frames 0–24, one per stressed syllable/word timestamp; the semantic stress word becomes gold and 1.12×; connector rules resolve by 30; 12-frame payoff hold; mask-based exit finishes before unmount.
- **Construction:** use measured `fitText`/layout bounds, not fixed hero font sizes. Preserve word spaces and Spanish diacritics. No perpetual typewriter cursor.
- **Planner trigger:** parallel verb/noun list of 2–5 items with reliable word timings.

### 4.5 `DecisionScorebug` — sports/game-show comparison rail

- **Use:** A/B/C model choice, before/after, ranked alternatives, or a verdict—not the take-review UI itself.
- **Props:** `options[2..3]`, `activeIndex`, `metric?`, `values?`, `verdict`, `durationFrames=90`.
- **Build choreography:** all option slabs exist at frame 0 for cover use; active possession/playhead pulses 0–8; slabs flip around X over 6–16 without mirrored text; values count 12–30; winner receives a gold edge and others recede at 32; verdict locks by 42; clean exit 78–88.
- **Construction:** normalized side/stack modes, with box-highlight-grade contrast. Avoid faux gambling visuals; this is broadcast comparison grammar in brand colors.
- **Planner trigger:** explicit alternatives with a stated selection/metric.

## 5. Review of the proposed multi-take editor

**Verdict: approve the goal; amend the architecture before implementation.** The proposal correctly puts a human selection gate between transcription and final assembly, but Jaccard clustering + Markdown review + two incompatible EDL shapes will fail common retake behavior.

### 5.1 Keep it file-based and local, but make the artifacts first-class

No database or resident service is needed. A job folder can contain:

```text
job.json                    # job id, configuration, tool/model versions
sources.json                # ffprobe facts + content hashes
transcripts/<source>.json   # raw segments/words/confidence; never overwritten
transcript-corrections.json # user-approved text substitutions/spans
take-groups.json            # candidates + alignment/coverage evidence
REVIEW.html                 # local, static, playable A/B/C UI
takes-decisions.json        # chosen option or custom span per group
edit-plan.v2.json           # canonical source-aware EDL + decoration
qa/                         # contact sheets, boundary audio artifacts, report
```

Cache transcription by source content hash **and** model, language, glossary hash, faster-whisper version, and relevant decode settings. Filename/mtime alone is insufficient.

### 5.2 Replace token-set Jaccard with sequence-aware span alignment

The proposed threshold has both false positives and false negatives. Exact local calculation:

```text
0.833  “... cómo crear un video ...” vs “... cómo editar un video ...”
0.583  full sentence vs its real seven-word second-half retake
```

At a ≥0.6 threshold, the semantically different create/edit lines cluster, while the genuine partial retake does not. Bag-of-words similarity also discards word order.

Use this simple, local pipeline instead:

1. Unitize each source into clause-like spans using punctuation plus pauses; retain original chronological position.
2. Generate candidate pairs with normalized 3-gram winnowing/minhash-like fingerprints (cheap pruning only).
3. Run token-level local sequence alignment (Smith–Waterman or equivalent dynamic programming) on candidates.
4. Build a **variant graph**: nodes are source spans; aligned edges store canonical coverage, substitutions, insertions, and partial overlap.
5. Form take groups at clause/span level, allowing one option to cover only the second half. Do not force every source span into a take group; unique asides/B-roll remain chronological nodes.

This is deterministic, embedding-free, unit-testable, and more faithful to how people restart mid-sentence.

### 5.3 Ranking should explain, not decide

Auto-recommend with a transparent score using:

- canonical phrase coverage/completeness;
- no mid-word or mid-clause restart;
- filler and abandoned-start count;
- ASR confidence, especially proper nouns;
- silence head/tail suitable for a clean cut;
- clipping/SNR or obvious audio defects;
- chronology/last-take as a **weak** tiebreaker, not the main rule.

Never silently select the recommendation. Show the feature rationale (“complete; clean 180 ms lead-in; one low-confidence brand word”) and permit a custom in/out span.

### 5.4 Use a static local HTML review gate, not Markdown as the primary UI

The user asked to see and choose A/B/C. Markdown timestamps make comparison laborious. Reuse the existing `output/dogfood/REVIEW.html` pattern: one group per row, native video controls cued to each span, transcript/confidence, duration/timecode, recommendation rationale, and radio buttons. A small inline script can download/copy `takes-decisions.json`; no server/framework is required. Emit Markdown only as an audit/fallback artifact.

Partial-overlap options should visualize coverage, e.g. `first half [shared] | second half [Option C]`, and allow a composed choice when the best first and second halves come from different recordings.

### 5.5 Unify the EDL before assembly

Make the additive v2 shape source-aware:

```ts
sources: Array<{id: string; path: string; hash: string; probe: MediaProbe}>
segments: Array<{
  id: string;
  sourceId: string;
  source: TimeSpan;
  editStartFrame: number;
  editEndFrame: number;
  kind: "take" | "broll" | "room-tone";
  takeGroupId?: string;
  takeOptionId?: string;
  mode: "speaker" | "broll";
}>
```

Preserve a v1 parser/migration where `sourceVideo` becomes `sources[0]`. Both single- and multi-source rendering must consume the same plan and timing helper; delete the separate semantic meaning of `ReelBeat[]` after migration. This is the point that prevents every later fix from being implemented twice.

### 5.6 Be conservative about filler-word cuts

Spanish `este`, `pues`, or `o sea` can be discourse content, not disposable noise. A filler candidate should be removed only when:

- it is acoustically isolated by usable silence or the user explicitly selects removal;
- the resulting neighbors do not create a microscopic segment or unnatural jump;
- the minimum kept/cut duration and edge padding are enforced;
- captions and take coverage are regenerated from the final EDL.

Prefer hiding a filler from captions only when the audio remains intelligible; do not pretend text deletion removes sound. Offer “keep / remove / review” for ambiguous tokens.

### 5.7 Correct order of operations

The vertical slice should be:

```text
probe/hash → raw transcription → correction gate → clause/span graph
→ A/B/C review → source-aware EDL → conservative silence/filler edit
→ semantic decoration plan → deterministic validation → render → hard-gate QA
```

Decoration before take selection wastes work and can time graphics to a take that is later rejected. QA must sample the final selected joins, not synthetic boundaries derived from pre-quantized seconds.

## 6. Re-prioritized work queue

This queue is ordered by whether it advances the stated end goal safely. Every implementation item should end with TypeScript/tests and, where visual or media-related, an ffprobe/frame/audio artifact check.

### P0 — restore correctness and trustworthy inputs

1. **Remove the generic Spanish Whisper prompt; preserve confidence; add optional glossary/hotwords and a transcript-correction artifact.** Add the 30 s hallucination case (or a small redistributable synthetic fixture that reproduces it) as a regression. This blocks every downstream semantic feature.
2. **Fix layout-mode source/audio loss** and add a rendered-frame + audio integration test for both aspects.
3. **Fix multi-source timing and audio-less inputs** with one canonical `BeatTiming[]`; add the 25×1.03 s, 10 ms, mixed-fps/aspect, mixed-audio, and all-silent ffprobe tests.
4. **Repair the overlay lifecycle contract:** window validation, authoritative scheduling fields, lifecycle adapters, brand component/props validation, and V24 pixel-timing regression tests.
5. **Make the gates real:** ESLint flat config, repaired/recreated uv environment plus nonzero Python tests, and remove or repair the dead `npm run render` command. Keep the corrected Vitest scope.

### P1 — build the smallest complete multi-take product loop

6. **Add source-aware EditPlan v2 with v1 migration**; converge single/multi-source render orchestration before adding take logic.
7. **Implement ingest/cache plus clause unitization and sequence-aware take graph** on Armando's own rambling Spanish footage, including partial retakes and unique asides.
8. **Generate static `REVIEW.html` + `takes-decisions.json`** with playable A/B/C, confidence/rationale, custom spans, and partial-coverage display.
9. **Assemble selected takes and conservative silence/filler edits** through the unified plan; prove caption/audio/cut alignment on real multi-retake footage.
10. **Implement the richer semantic planning contract** (`PlanningContext → DecorationPlan`) through a local agent-authored plan. Keep deterministic rules as fallback/candidate signals and validators. Do not ship TF-IDF filler.
11. **Replace the rubric with hard gates + weighted score**, including actual audio review and owner frame-zero rule. Run Round 2 only after P0 and this rubric change.

### P2 — align production defaults and repair visible atoms

12. Wire owner defaults: `hormozi-pop`, intermittent handle windows, frame-zero hook plan/check, and intentional palette metadata.
13. Fix contrast contracts for the five optional unsafe caption styles without flattening every style into box-highlight; re-render over bright footage.
14. Repair `FeedbackLoopCycle` geometry/duration/opacity and add 2/4/6-station visual tests; then complete the approved Austin contracts: source-cued/video-backed FeedbackLoop, shared dual-aspect PromptCard with real presenter media, and a true arc or honestly renamed light-band wipe.
15. Redesign the current `QuoteCard` and `ExplainerVideoVertical` defaults around a cover-ready frame zero and content-driven duration; do not merely add more delayed animation.
16. Build at most two of the outside-genre atoms first—`SportsTelestratorPath` and `DocumentaryEvidenceLedger`—and dogfood them as semantic planner outputs before expanding the set. They most directly exercise graphics over real footage and evidence-grounded semantics.

### P3 — leverage and hygiene after the product loop works

17. Native-aspect render selection per platform; keep the now-correct crop as fallback.
18. Memoize bundle-once orchestration and clean staged `public/autoedit` clips after successful renders.
19. Run the owner-required fair Remotion/Hyperframes same-script bake-off; keep both until that evidence exists.
20. Validate/copy gallery-referenced outputs, then perform the already approved stale-worktree cleanup in a dedicated session. Current sizes are `.claude/worktrees` 11 GB, main `public` 11 MB, main `output` 1.6 MB.

### Explicitly removed from the near-term queue

- Re-fixing export crop/audio: confirmed resolved.
- Re-fixing single-source cumulative timing and silence padding: confirmed resolved.
- More grade-before/after-LUT work: correct and visually low-yield on tested footage.
- TF-IDF density filler/lower-thirds: wrong abstraction before semantic planning.
- More creator-template replication before the folder→A/B/C→finished-video vertical slice works.
