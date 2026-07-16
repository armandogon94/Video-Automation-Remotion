# Follow-up peer review — P0 verification, new-code hostile review, and Round 2 audit

**Review date:** 2026-07-16

**Prior review:** `docs/peer-review/GPT56-FINDINGS.md` at `c4a37d6`

**Implementation range reviewed:** `c4a37d6..1ad7bc1`

**Scope discipline:** local repository and local artifacts only; no commit-message claim was accepted as evidence.

## Executive verdict

The range contains several substantive fixes: the generic Whisper prompt is gone, optional hotwords and word probabilities work on real Spanish speech, layout mode now receives `camSrc`, silent beats receive synthetic audio when necessary, and Claude/Anthropic no longer receive the owner's house logo. Those changes are worth keeping.

The range is not ready for the Round 2 PASS verdicts recorded in `ROUNDS.md`. The global `trim=end_frame` makes the final duration exact while concealing accumulated **interior** concat offsets. Overlay scheduling still has two authorities and at least one planner-emitted molecule hard-cuts. The frame-zero luma calculation is neither a statistically sound standard-deviation estimate nor a semantic hook check. All four Round 2 renders have a failed or pending hard gate, so none qualifies as PASS under the new rubric.

The source-aware EditPlan work is a useful compatibility scaffold, not yet the authoritative v2 contract requested in the prior review. The owner's multi-take experiment strengthens the case for finishing that contract, but it also supplies new evidence that burst-aware ingest and transcript coverage must precede automated take selection.

## 1. Verification method and baseline

- **[CONFIRMED]** The relevant TypeScript suite passes: `npx vitest run src/autoedit/renderFromPlan.test.ts src/autoedit/suggestOverlays.test.ts src/autoedit/editPlan.test.ts src/autoedit/selfEvalRender.test.ts` reported **91/91** passing tests. The complete Vitest run reported **97/97**. The renderer tests exercised real ffmpeg for mixed-audio and all-silent plans.
- **[CONFIRMED]** `python3 -m pytest src/transcribe/tests -q` reported **13/13** passing tests, including prompt/hotword/confidence coverage.
- **[CONFIRMED]** `npx tsc --noEmit` completed successfully.
- **[OVERTURNED]** The newly live lint command is not yet a green quality gate. `npm run lint -- --no-cache` reported **68 errors and 31 warnings**. At least one error is in this review range (`prefer-const` at `src/autoedit/buildEditPlan.ts:58`); the remainder includes existing repository debt. “ESLint can execute” is confirmed, but “lint is a passing hard gate” is not.
- **[HYPOTHESIS]** A local Remotion render could not be completed in this restricted process. Bundling succeeded, but Chrome failed its macOS sandbox bootstrap with `Permission denied`. Consequently, layout behavior is confirmed at the prop/component level and by tests, but its final rendered pixels/audio remain explicitly downgraded below.

The media checks used `ffprobe`, `ffmpeg`, and the repository's own TypeScript entry points. Temporary diagnostic media and contact sheets were written under `/tmp/gpt56-followup`, not to the repository.

## 2. P0 follow-up verification

### 2.1 Prior finding 2.4 — Whisper prompt, hotwords, and confidence

#### Verdict

- **[CONFIRMED]** The harmful generic default prompt has been removed. The wrapper defaults `initial_prompt` and `hotwords` to `None` and passes only caller-provided values into faster-whisper (`src/transcribe/transcribe.py:31-67`, `src/transcribe/transcribe.py:93-129`).
- **[CONFIRMED]** Optional Spanish-first vocabulary assistance is implemented. The CLI accepts repeatable `--hotword` and `--glossary`, normalizes both sources, and forwards the result to the Python wrapper (`src/autoedit/cli.ts:76-107`, `src/autoedit/cli.ts:143-151`).
- **[CONFIRMED]** Per-word confidence is emitted by the wrapper and represented in EditPlan transcript words (`src/transcribe/transcribe.py:149-165`, `src/autoedit/editPlan.ts:49-62`). The plan builder preserves the optional probability while shifting timestamps (`src/autoedit/buildEditPlan.ts:68-76`).
- **[OVERTURNED]** Confidence is not preserved end-to-end as a complete review contract. The CLI reads only the returned `words` array and discards `languageProbability` (`src/autoedit/cli.ts:98-106`), while the low-confidence check is only a warning based on word probability share or words/second (`src/autoedit/cli.ts:109-126`). The precomputed `--transcript` path bypasses that warning entirely (`src/autoedit/cli.ts:217-244`). There is still no canonical correction artifact or cache/provenance field in the production EditPlan path.

#### Concrete reproduction

A 12-second Spanish excerpt was extracted from `output/multitake/claude-cowork/ground-truth.mp4` and transcribed with the locally cached `medium` model, `language=es`, and project-relevant hotwords. The wrapper produced 40 words, `languageProbability=1`, minimum word probability `0.5189`, and mean word probability `0.9192`. The opening was a faithful Spanish sentence about reducing work and Anthropic/Claude; no generic-prompt hallucination appeared.

**Disposition:** close the narrow prompt/hotword/per-word-confidence defect. Keep the broader correction/provenance portion of prior P0-1 open. The multi-take evidence in section 5 makes a blocking coverage check more urgent than a warning-only confidence heuristic.

### 2.2 Prior finding 2.1 — layout-mode `camSrc`

#### Verdict

- **[CONFIRMED]** The staged source reference is now assigned to both `videoSrc` and `camSrc` whenever a non-empty layout track is present (`src/autoedit/renderFromPlan.ts:540-566`). This directly repairs the missing-source branch identified in the prior review.
- **[CONFIRMED]** Both scene twins select layout rendering when a track exists and pass the received camera source through to `LayoutTrack` (`src/compositions/SpeakerOverlayScene16x9.tsx:303-369`, `src/compositions/SpeakerOverlayScene9x16.tsx:275-333`). `LayoutTrack` renders media through `OffthreadVideo`, and the camera media path is not forcibly muted (`src/components/layout/LayoutTrack.tsx:283-320`, `src/components/layout/LayoutTrack.tsx:408-416`).
- **[CONFIRMED]** The unit assertion covering staged `camSrc` passes (`src/autoedit/renderFromPlan.test.ts:536-550`).
- **[HYPOTHESIS]** Final layout-mode pixels and audible program audio are probably repaired, but the requested rendered-frame/audio proof is unobtainable in this sandbox because Remotion's Chrome process cannot launch. No Round 2 plan contains a `layoutTrack`, so those outputs cannot substitute for that evidence.

**Disposition:** accept the code-path fix, but retain a small rendered integration test for both aspect ratios as the closure condition. A single-source camera assignment also does not define how a future screen source should be selected; that must remain an explicit multi-source layout decision rather than silently reusing the camera file.

### 2.3 Prior finding 2.2 — canonical `BeatTiming[]` and the final-frame cap

#### Verdict

- **[CONFIRMED]** The new `computeBeatTimings` helper correctly converts cumulative exact durations into a canonical sequence of edit-frame boundaries (`src/autoedit/renderFromPlan.ts:748-815`). Transcript remapping and QA sampling consume that canonical timing (`src/autoedit/renderFromPlan.ts:1097-1141`, `src/autoedit/renderFromPlan.ts:1238-1257`).
- **[OVERTURNED]** The ffmpeg staging path does **not** consume each beat's canonical target frame count. It trims each input in seconds, concatenates, applies one post-concat `fps`, and finally caps the complete stream with `trim=end_frame=totalFrames` (`src/autoedit/renderFromPlan.ts:915-934`, `src/autoedit/renderFromPlan.ts:973-994`). The cap fixes only the tail length. It hides interior join drift rather than preventing it.
- **[OVERTURNED]** The added 25-beat regression asserts only the final frame total (`src/autoedit/renderFromPlan.test.ts:695-735`). It cannot detect a wrong join that is compensated by truncating the last beat.

#### Decisive reproduction

I generated 25 unique-color ffmpeg inputs, each exactly 1.03 seconds, and ran the production staged-input builder at 30 fps with all beats audio-less. The output was exactly 773 frames, but pixel/color transitions revealed these boundaries:

```text
canonical starts: 0,31,62,93,124,155,185,216,247,...,680,711,742
actual starts:    0,31,62,93,124,155,186,217,248,...,682,713,744
```

The seventh beat starts one frame late; the final beat starts two frames late. `trim=end_frame=773` then shortens the final beat to 29 frames. This is precisely the failure mode the canonical timing design was supposed to remove.

**Disposition:** reject the final-frame cap as the timing fix. Pass `BeatTiming[]` into the staging builder and force each video beat to `editEndFrame - editStartFrame` before concat. Apply the same canonical duration to its voiced or synthetic audio. Add unique-color/pattern assertions at **every interior boundary**, plus the mixed-fps/aspect and 10 ms cases from the prior review. A final total-frame assertion should remain, but only as a secondary invariant.

### 2.4 Prior finding 2.3 — `anullsrc` for audio-less beats

#### Verdict

- **[CONFIRMED]** The builder probes audio presence per source (`src/autoedit/renderFromPlan.ts:1012-1021`). Voiced beats get an audio trim/reset chain, while silent beats receive duration-bounded `anullsrc` whenever the combined output needs audio (`src/autoedit/renderFromPlan.ts:911-970`). An entirely silent plan correctly omits the output audio stream (`src/autoedit/renderFromPlan.ts:935-994`, `src/autoedit/renderFromPlan.ts:1045-1077`).
- **[CONFIRMED]** The real-ffmpeg mixed-audio and all-silent cases pass in the test suite (`src/autoedit/renderFromPlan.test.ts:695-762`). The 25-color reproduction also completed without an audio-filter crash.
- **[HYPOTHESIS]** Synthetic silence is currently durationed from the same second-based trim that produced the interior timing offsets. No crash remains, but exact A/V join alignment should be rechecked after the per-beat frame fix.

**Disposition:** close the audio-less-input crash. Fold the silence duration into the corrected canonical beat staging work rather than reopening the basic `anullsrc` design.

### 2.5 Prior finding 2.5 — scheduling authority and `exitFrame` lifecycle

#### Verdict

- **[CONFIRMED]** The normal single-source prop builder strips molecule-local `fromFrame`, `toFrame`, and `enterFrame`, validates top-level window/anchor values, and injects a derived `exitFrame` (`src/autoedit/renderFromPlan.ts:445-460`, `src/autoedit/renderFromPlan.ts:489-537`). That is a meaningful reduction in competing schedule fields.
- **[OVERTURNED]** Top-level scheduling is not fully authoritative. A caller-supplied `props.exitFrame` wins over the derived window length (`src/autoedit/renderFromPlan.ts:523-530`), allowing the child to disappear early or outlive the intended local schedule. The separate multi-source renderer passes overlay props directly into the scene (`src/autoedit/renderFromPlan.ts:1194-1198`), bypassing the sanitizer entirely.
- **[CONFIRMED]** `IconPopOverSpeaker` and `SentimentKeyword` implement genuine exit transitions (`src/components/overlays/IconPopOverSpeaker.tsx:123-149`, `src/components/overlays/SentimentKeyword.tsx:188-222`). Extracted frames 190–195 of `output/autoedit/dogfood-berman-end2-r2-edit.mp4` confirm the Anthropic chip fading before it disappears.
- **[OVERTURNED]** The lifecycle contract is not universal. `YellowGlowWordCallout` explicitly culls at `exitFrame` with no exit fade (`src/components/overlays/YellowGlowWordCallout.tsx:150-169`). In `output/autoedit/r2-austin-mid-edit.mp4`, the KEY callout remains full-strength through frame 205 and vanishes at frame 206. In `output/autoedit/r2-austin-th-clip-edit.mp4`, 99 remains full-strength through frame 423 and vanishes at frame 424. Those boundaries match the plans (`output/dogfood/r2/austin-mid-plan.json:653-659`, `output/dogfood/r2/austin-th-clip-plan.json:733-739`).

**Disposition:** the scheduling/lifecycle P0 is only partially fixed. Make the top-level window the sole authority; derive the child-local exit unconditionally after validating that the component has enough entrance/hold/outro budget. Route single- and multi-source rendering through the same adapter. Every planner-emittable molecule needs a tested exit contract, including exact pixels around the boundary in both aspect ratios.

### 2.6 Prior finding 2.6 — brand emission and Claude/Anthropic override

#### Verdict

- **[CONFIRMED — AGREE WITH THE OVERRIDE]** Claude and Anthropic should emit a text-based `SentimentKeyword` chip, not any owner/house logo. The brand map contains only Armando's owned mark, and the suggestion logic deliberately chooses text for Claude/Anthropic (`src/autoedit/suggestOverlays.ts:161-168`, `src/autoedit/suggestOverlays.ts:430-470`). This is semantically correct: substituting the owner's logo would make a false brand claim.
- **[CONFIRMED]** Brand props receive schema validation before emission (`src/autoedit/suggestOverlays.ts:195-235`), and the suggestion tests pass. The Round 2 Berman plan contains the expected Anthropic `SentimentKeyword` rather than a logo (`output/dogfood/berman-end2-plan-r2.json:537-548`).
- **[OVERTURNED]** The chosen fallback is not yet a fully compliant brand atom for this project's presentation constraints. `SentimentKeyword` documents itself as 9:16-only (`src/components/overlays/SentimentKeyword.tsx:15-19`) yet is used in a 16:9 render, and its palette permits cyan and red as well as the required navy `#1B3A6E` and gold `#D4AF37` (`src/components/overlays/SentimentKeyword.tsx:107-132`). The current chip is legible in the Berman render, but “semantically correct fallback” does not equal “finished dual-aspect brand treatment.”

**Disposition:** retain the no-logo override. Replace the generic sentiment atom with a dual-aspect `BrandNameChip` (or an equivalent neutral label) using the project navy/gold contract. Also remove the stale nearby comment that says Claude/Anthropic map to house marks before the subsequent comment correctly says they do not (`src/autoedit/suggestOverlays.ts:149-165`).

## 3. Hostile review of newly introduced code

### 3.1 `handleWindows` in both scene twins

- **[CONFIRMED]** Both scene twins implement intermittent handle sequences (`src/compositions/SpeakerOverlayScene16x9.tsx:91-101`, `src/compositions/SpeakerOverlayScene16x9.tsx:229-256`; `src/compositions/SpeakerOverlayScene9x16.tsx:65-75`, `src/compositions/SpeakerOverlayScene9x16.tsx:202-229`).
- **[OVERTURNED]** The inputs are not production-safe. The schemas accept arbitrary numbers without requiring integers, non-negative starts, or `endFrame > startFrame`; rendering silently converts invalid/reversed windows into at least one frame (`src/compositions/SpeakerOverlayScene16x9.tsx:91-101`, `src/compositions/SpeakerOverlayScene16x9.tsx:229-256`; `src/compositions/SpeakerOverlayScene9x16.tsx:65-75`, `src/compositions/SpeakerOverlayScene9x16.tsx:202-229`). A one-frame window receives zero-opacity fade math in the 16:9 twin (`src/compositions/SpeakerOverlayScene16x9.tsx:204-225`). Overlap is not merged, so coincident windows can duplicate/darken the same chip.
- **[OVERTURNED]** The feature is not wired into the production plan/render path. `buildSceneProps` accepts only the persistent `handle` string and sets that one prop; it has no `handleWindows` input (`src/autoedit/renderFromPlan.ts:470-476`, `src/autoedit/renderFromPlan.ts:540-566`). The current EditPlan has no corresponding owner-default cadence field. Repository search found no `handleWindows` test, and the Round 2 strips show a persistent handle.
- **[HYPOTHESIS]** Because the twin implementations are copied rather than shared, their behavior is likely to diverge as lifecycle fixes are added. The existing line-level differences already make a shared component/schema the lower-risk design.

**Required follow-up:** extract one validated handle-window component, reject or normalize invalid/overlapping intervals, define a minimum visible duration, wire an intentional default cadence into the authoritative plan, and test both aspects and boundary frames.

### 3.2 `selfEvalRender` frame-zero luma gate

- **[OVERTURNED]** `(YHIGH - YLOW) / 2.56` is not a statistically sound estimate of pixel standard deviation for arbitrary video frames. The implementation assumes a normal distribution from two percentile endpoints (`src/autoedit/selfEvalRender.ts:117-133`); natural images, title cards, and sparse overlays are commonly multimodal or heavy-tailed.
- **[CONFIRMED]** A synthetic navy frame with a high-contrast gold bar occupying 7.4% of pixels produced `YLOW=YHIGH=63`, so the implementation reported zero “stddev.” The actual two-level population has an approximate standard deviation of 26. Conversely, a no-hook SMPTE-bars frame produced a large spread and passed. The metric can reject a valid sparse design and accept meaningless color variation.
- **[OVERTURNED]** Luma spread is not evidence of the owner's “substantive visual hook at frame zero” rule. `output/autoedit/r2-berman-end1-edit.mp4` and `output/autoedit/dogfood-berman-end2-r2-edit.mp4` begin with an ordinary speaker shot plus handle, yet their visual variation can pass the luma threshold. The two Austin clips begin with meaningful source-baked graphics, but that is a semantic observation, not something the percentile spread establishes.
- **[OVERTURNED]** The A/V duration gate compares container duration against audio duration, not video-stream duration (`src/autoedit/selfEvalRender.ts:177-202`, `src/autoedit/selfEvalRender.ts:334-340`). A synthetic file with 1.0 seconds of video and 2.0 seconds of audio passed with container duration 2.0, audio duration 2.0, and delta 0. The video stream was still only 1.0 second.
- **[CONFIRMED]** The generated reports leave every human listen/watch checkbox unchecked (`src/autoedit/selfEvalRender.ts:264-307`). That is honest artifact generation, but it means the output is a smoke-test packet, not a completed self-evaluation.

**Required follow-up:** rename the luma value to a percentile-spread score and use it only to flag near-uniform/blank frames. Probe and compare video-stream duration to audio-stream duration. Treat the frame-zero hook as a plan invariant plus explicit human/visual-semantic review. Do not convert either heuristic into a PASS without durable evidence.

### 3.3 `DOGFOOD-PLAYBOOK` section 4 hard gates

- **[CONFIRMED]** The rubric now says that any hard-gate failure prevents weighted scoring, which is the correct structure (`docs/research/autoedit-dogfood/DOGFOOD-PLAYBOOK.md:116-144`). Weighted criteria are appropriate only after correctness and review gates pass.
- **[OVERTURNED]** G1 is not currently a hard transcript gate. Its evidence allows “plan + CLI warning absent,” but the warning checks only low-probability share and words/second (`docs/research/autoedit-dogfood/DOGFOOD-PLAYBOOK.md:124-129`, `src/autoedit/cli.ts:109-126`), and precomputed transcripts bypass it (`src/autoedit/cli.ts:217-244`). The real multi-take report shows five of sixteen published speech spans missing from full-file transcription even though probability alone is not the issue (`docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:30-46`).
- **[OVERTURNED]** G2 and G4 depend on the self-evaluation defects above. A container/audio comparison cannot prove A/V integrity, and luma variation cannot prove a semantic hook. Human listening remains unchecked in every Round 2 self-eval packet.
- **[OVERTURNED]** The implementation lacks a durable three-state gate model. “Not yet listened to” is neither PASS nor FAIL; it must be `PENDING`, and a pending hard gate must suppress the weighted score exactly like a failure.

**Required follow-up:** record each gate as `PASS | FAIL | PENDING`, require an artifact path and reviewer for every PASS, make transcript coverage/corrections explicit, and calculate no weighted score until all gates are confirmed PASS.

### 3.4 EditPlan v2, migration, and `sourceForSegment`

- **[CONFIRMED]** The range adds useful additive source metadata, optional per-segment source/take fields, a v1-compatible migration helper, and source lookup (`src/autoedit/editPlan.ts:86-118`, `src/autoedit/editPlan.ts:174-216`, `src/autoedit/editPlan.ts:600-647`). Existing v1 plans continue to parse, and the relevant tests pass.
- **[OVERTURNED]** This is not yet an authoritative EditPlan v2 wire contract. The top-level schema still has `version: 1`; source awareness is inferred from the presence of optional fields (`src/autoedit/editPlan.ts:500-527`, `src/autoedit/editPlan.ts:568-579`). The documented rule that legacy `sourceVideo` mirror `sources[0].path` is not enforced (`src/autoedit/editPlan.ts:514-527`).
- **[OVERTURNED]** Referential integrity is incomplete. `isSourceAwarePlan` checks that sources exist and that segments have a `sourceId`, but not that IDs are unique or resolvable (`src/autoedit/editPlan.ts:568-579`). A local schema exercise accepted duplicate source IDs and mismatched `sourceVideo`; a dangling segment returned true from `isSourceAwarePlan` while `sourceForSegment` returned `undefined` (`src/autoedit/editPlan.ts:639-647`).
- **[OVERTURNED]** Migration can hide a malformed half-migration. It fills every missing segment source with `sources[0]` before checking known IDs (`src/autoedit/editPlan.ts:600-625`). In a two-source plan this silently converts “selection omitted” into “select the first source,” which is unsafe for take assembly.
- **[OVERTURNED]** Renderer convergence from prior section 5.5 is not complete. The production renderer still describes and invokes a separate multi-source path (`src/autoedit/renderFromPlan.ts:698-709`), and the newly added source resolver is not the universal source authority for staging, scheduling, layout, and transcript timing.

**Required follow-up:** introduce an explicit discriminated schema version (or an equally strict top-level discriminator); enforce unique source IDs, required source/kind fields for every v2 segment, cross-reference integrity, and the legacy mirror invariant. Migrate only a genuine v1 plan and reject partially source-aware inputs. Both single- and multi-source rendering must then resolve media through the same canonical segment/timing layer.

### 3.5 New quality-gate claims

- **[CONFIRMED]** ESLint flat configuration and Python tests are now executable; the previous “tool cannot run” condition is repaired.
- **[OVERTURNED]** An executable command is not a hard gate until it passes. The current 68-error lint result means the repository cannot yet claim green lint in a release or dogfood verdict.

## 4. Round 2 PASS audit against actual artifacts

### 4.1 Evidence inspected

The documented verdict table and scores are at `docs/research/autoedit-dogfood/ROUNDS.md:32-60`. I inspected all four self-eval directories beside their rendered files under `output/autoedit/`, all available Round 2 plans under `output/dogfood/r2/`, and the second Berman plan at `output/dogfood/berman-end2-plan-r2.json`. I extracted frame zero, full-duration contact sheets, and exact overlay-exit neighborhoods with ffmpeg. I also probed each video and audio stream independently.

The independent probes reported:

| Render | Video stream | Audio stream | Container/self-eval consequence |
|---|---:|---:|---|
| Austin mid | 22.000 s / 660 frames | 22.0587 s | self-eval compares ~22.0587 container to audio and reports delta 0 |
| Austin thought-leader | 22.000 s / 660 frames | 22.0587 s | same false-zero pattern |
| Berman end1 | 24.0333 s / 721 frames | 24.0213 s | small, real stream delta |
| Berman end2 | 23.4333 s / 703 frames | 23.4880 s | small, real stream delta |

The Austin self-eval reports expose the flawed duration evidence directly (`output/autoedit/r2-austin-mid-edit.mp4.selfeval/selfeval-report.md:5-23`, `output/autoedit/r2-austin-th-clip-edit.mp4.selfeval/selfeval-report.md:5-23`). The Berman reports and all four human checklists remain incomplete (`output/autoedit/r2-berman-end1-edit.mp4.selfeval/selfeval-report.md:9-28`, `output/autoedit/dogfood-berman-end2-r2-edit.mp4.selfeval/selfeval-report.md:9-29`). `ROUNDS.md` itself records that listening was still pending (`docs/research/autoedit-dogfood/ROUNDS.md:45-47`).

### 4.2 `berman-end1` — documented `PASS*`

- **[OVERTURNED]** G3 caption correctness fails at an edit join. The first segment ends at source/edit frame 412 (`output/dogfood/r2/berman-end1-plan.json:9-30`), and the caption sequence resumes with “will” directly after “is.” (`output/dogfood/r2/berman-end1-plan.json:428-452`). Targeted medium-model transcription of both the source and the rendered join hears “It is. **They** will help…”. The audio retains “They”; the plan/captions omit it.
- **[OVERTURNED]** G4 fails. Frame zero is a normal speaker-only shot with the persistent handle, not a substantive planned visual hook. The weighted table even describes the frame-zero state as speaker-only (`docs/research/autoedit-dogfood/ROUNDS.md:52-53`).
- **[OVERTURNED]** G2 is pending because the required human listening check is unchecked (`output/autoedit/r2-berman-end1-edit.mp4.selfeval/selfeval-report.md:18-24`). A waveform sample did not show a gross full-scale discontinuity at the sampled cuts, but that is not evidence of inaudibility.

**Audited verdict: FAIL/PENDING, not PASS. Do not calculate a weighted score.**

### 4.3 `berman-end2` — documented `PASS*`

- **[OVERTURNED]** G3 caption correctness fails. The plan joins `work.` directly to `own` (`output/dogfood/berman-end2-plan-r2.json:224-248`), while targeted transcription of the source/render hears “knowledge work. **They** own all software…”; the rendered audio also carries an adjacent “And that's…” phrase that is not represented faithfully by the displayed word plan.
- **[OVERTURNED]** G4 fails for the same speaker-only frame-zero condition as end1.
- **[CONFIRMED]** The Anthropic text chip itself has a real fade at its exit; this particular overlay is not the lifecycle failure.
- **[OVERTURNED]** G2 remains pending because the listen/watch checklist is unchecked (`output/autoedit/dogfood-berman-end2-r2-edit.mp4.selfeval/selfeval-report.md:19-25`).

**Audited verdict: FAIL/PENDING, not PASS. Do not calculate a weighted score.**

### 4.4 `austin-mid` — documented `PASS`

- **[CONFIRMED]** Frame zero contains a substantive source-baked prompt card, so the human-semantic portion of G4's opening-hook requirement is present.
- **[OVERTURNED]** G4's no-hard-lifecycle-clip condition fails. The KEY `YellowGlowWordCallout` is fully present at frame 205 and absent at frame 206, exactly at its planned window boundary (`output/dogfood/r2/austin-mid-plan.json:653-659`). The component has no exit fade (`src/components/overlays/YellowGlowWordCallout.tsx:150-169`).
- **[OVERTURNED]** G2 has not been completed. The report's human checks are blank, and its A/V delta is based on container duration rather than the 22.000-second video stream (`output/autoedit/r2-austin-mid-edit.mp4.selfeval/selfeval-report.md:5-23`).

**Audited verdict: FAIL/PENDING, not PASS. Do not calculate a weighted score.**

### 4.5 `austin-th-clip` — documented `PASS`

- **[CONFIRMED]** Frame zero contains a substantive source-baked “Skill-Driven Data Ingestion” treatment.
- **[OVERTURNED]** G4 fails: the 99 `YellowGlowWordCallout` remains full-strength at frame 423 and disappears at frame 424 (`output/dogfood/r2/austin-th-clip-plan.json:733-739`; lifecycle code at `src/components/overlays/YellowGlowWordCallout.tsx:150-169`).
- **[OVERTURNED]** G3 fails visual legibility/overlap review in the extracted strip: the source's own baked lower-third and the added karaoke captions occupy the same early-frame visual band, producing a duplicate/colliding text hierarchy.
- **[OVERTURNED]** G2 remains pending and uses the same container/audio false-zero duration evidence (`output/autoedit/r2-austin-th-clip-edit.mp4.selfeval/selfeval-report.md:5-23`).

**Audited verdict: FAIL/PENDING, not PASS. Do not calculate a weighted score.**

### 4.6 Round 2 record quality

- **[OVERTURNED]** The numeric scores at `docs/research/autoedit-dogfood/ROUNDS.md:52-55` are invalid under the playbook's own rule because every render has at least one failed or pending gate.
- **[OVERTURNED]** `output/dogfood/REVIEW-R2.html` says all overlays fade and describes the 99 exit as a fade (`output/dogfood/REVIEW-R2.html:33-36`, `output/dogfood/REVIEW-R2.html:72-76`), but the exact frames and component code show a hard cut.
- **[HYPOTHESIS]** The listening verdicts cannot be recovered from repository evidence. The review page says listening is still required and provides buttons (`output/dogfood/REVIEW-R2.html:33-60`), but there is no durable completed decision artifact. Until a human reviewer records that evidence, G2 must remain `PENDING`.

## 5. Multi-take experiment and amended P1 ordering

### 5.1 What the experiment actually establishes

- **[CONFIRMED]** The experiment uses the owner's real Spanish footage and includes a published ground-truth reel, raw takes, a report, burst transcripts, a take-group artifact, and a playable review page (`docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:8-26`). This is much stronger product evidence than synthetic clip permutations.
- **[CONFIRMED]** Full-file Whisper missed five of sixteen published speech spans, and all nine raw clips tripped the current words/second warning (`docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:30-46`). Burst slicing improved recovery. This elevates speech-burst coverage and caching/provenance ahead of automated selection quality.
- **[CONFIRMED]** The reported order score is 1.0 and take selection is 14/15, but the report correctly notes that grouping was sequence-aware/manual and the evaluation was not blinded (`docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:48-82`). `output/multitake/claude-cowork/take-groups.json:6-24` likewise records burst verification and manual sequence-aware alignment.
- **[OVERTURNED]** The experiment is not yet the complete P1 product loop. Repository inspection found no `takes-decisions.json`, no v2 assembled proposal generated from decisions, and no decision-capable radio/custom-span UI. The existing `REVIEW.html` is a useful playable presentation, not an authoritative selection artifact. The published ground-truth reel is the comparison target, not proof that the pipeline assembled the proposed reel.
- **[CONFIRMED]** The report's own misses—coverage, burst boundaries, partial retakes, and word-onset padding—are the correct next engineering targets (`docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:84-104`, `docs/research/autoedit-dogfood/MULTITAKE-EXPERIMENT-2026-07-16.md:111-144`).

### 5.2 Amended P1 ordering

The prior high-level order was directionally correct: authoritative plan → ingest/graph → review decisions → assembly → semantic decoration. The new evidence changes the granularity and moves the broken “hard gates” work back to P0.

#### P0 reopen/finish before scoring more dogfood

1. **Fix per-beat frame staging and interior-boundary tests.** Remove reliance on the global tail cap.
2. **Finish the single-authority overlay lifecycle**, including `YellowGlowWordCallout`, direct/multi-source paths, and validated intermittent handles.
3. **Repair self-eval and hard-gate state.** Probe video-vs-audio streams, treat hook evaluation semantically, and represent human work as pending. Re-audit Round 2 only afterward.
4. **Finish the transcript correction/coverage gate and make lint green.** A warning that every real raw take trips is not a useful acceptance gate.

#### P1 — smallest complete multi-take product loop

1. **Finish authoritative EditPlan v2 and converge render orchestration.** This remains prior item 6 and stays first; the current optional-field scaffold is insufficient for safe take decisions.
2. **Productionize burst-aware ingest/cache and transcript provenance.** Preserve raw file hash, model/config, burst boundaries, word probabilities, coverage status, and corrections.
3. **Automate the sequence-aware variant graph on the frozen Claude Cowork fixture.** The current manual grouping is now a valuable oracle. Include partial retakes and unique asides rather than forcing every take into a whole-clause slot.
4. **Turn the playable review page into a decision gate.** Add A/B/C/custom/composed-span controls, partial-coverage display, confidence/rationale, and export a validated `takes-decisions.json`.
5. **Assemble from those decisions through the unified plan.** Add word-onset snap/padding (the experiment suggests roughly 0.1 seconds of pre-voice context as a test point), then prove source choice, order, caption timing, audio continuity, and every join against the published ground truth.
6. **Only then implement the richer semantic decoration planner.** Decoration must consume the selected/assembled timeline, not raw take candidates.
7. **Run a corrected hard-gate dogfood round and only then apply weighted scoring.** This replaces prior P1 item 11; the rubric structure is useful, but its evidence machinery belongs in P0.

**[CONFIRMED]** The multi-take experiment does not justify moving take-selection logic ahead of EditPlan/render convergence. It does justify splitting prior ingest/graph item 7 into three explicit milestones—coverage-safe ingest, automated grouping, and decision persistence—because only the first two have partial evidence and the current grouping still contains manual judgment.

## 6. Final acceptance queue

The following conditions should be required before the next PASS claim:

1. A 25×1.03-second unique-pattern test proves every interior join and the final duration.
2. Both layout aspects produce a rendered pixel and audible-audio integration artifact.
3. Every planner-emittable overlay has top-level authoritative timing and an exact boundary-frame lifecycle test.
4. Video-stream duration is compared with audio-stream duration; container duration is informational only.
5. A frame-zero hook PASS names the planned hook and links a human/semantic visual decision; luma is only a blank-frame diagnostic.
6. Transcript coverage/corrections are durable, including burst-level recovery on the Claude Cowork fixture.
7. Every dogfood hard gate is explicitly `PASS`, never inferred from an unchecked report; no weighted score exists while any gate is `FAIL` or `PENDING`.
8. EditPlan v2 rejects duplicate/dangling source IDs, missing v2 source choices, and a mismatched legacy mirror; all render paths consume the same source/timing authority.
9. The multi-take review exports decisions, and the assembled proposal is compared to the published ground truth without manual substitution.
10. Lint, TypeScript, Python, and Vitest are all green in the same recorded run.

## 7. Bottom line

- **[CONFIRMED]** Accept the Whisper default-prompt removal, optional hotwords, word probabilities, `camSrc` propagation, audio-less `anullsrc`, and Claude/Anthropic no-logo semantic override.
- **[OVERTURNED]** Do not accept `trim=end_frame` as a correct BeatTiming implementation; it hides interior offsets.
- **[OVERTURNED]** Do not close overlay lifecycle/scheduling authority while custom `exitFrame`, direct multi-source props, and hard-cut molecules remain.
- **[OVERTURNED]** Do not use percentile luma spread as statistical standard deviation or hook proof, and do not use container-vs-audio duration as A/V sync proof.
- **[OVERTURNED]** Reclassify all four Round 2 PASS entries to FAIL/PENDING and remove their weighted scores until the gates have durable evidence.
- **[CONFIRMED]** Keep EditPlan v2 first in P1, but treat the current work as a migration scaffold. Use the real multi-take fixture to finish burst-safe ingest, automated sequence grouping, persisted review decisions, and unified assembly before semantic decoration.
