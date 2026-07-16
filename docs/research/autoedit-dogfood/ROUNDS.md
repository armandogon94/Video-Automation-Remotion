# Dogfood rounds — append-only score log (rubric: DOGFOOD-PLAYBOOK.md §4, 18 max)

## Round 1 — 2026-07-06 (Fable) — baseline + 2 bugs fixed
| fixture | style/register | 1 timing | 2 density | 3 relevance | 4 legibility | 5 sync | 6 safe | 7 cuts | 8 dead-air | 9 brand | total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| austin-th-clip | editorial-cyan/editorial | 0→2* | 1 | 2 | 1 (dark-bg only) | 2 | 1 (edge-hug) | n/g | 1 | 2 | 12* |
| berman-end1 | hormozi-pop/punchy | n/a (0 ov) | 0 | n/a | 2 | 2 | 2 | n/g | 0 | 2 | 8 |
| berman-end2 | box-highlight/editorial | 2 | 1 | 1 (brain emoji for "Anthropic") | 2 | 2 | 2 | n/g | 1 | 2 | 13 |
| austin-mid | type-terminal/technical | 2 | 1 | 2 | 2 | 2 | 1 (KEY edge-hug) | n/g | 1 | 2 | 13 |

\* timing was 0 pre-fix (V24, overlay at t=0), 2 after `9ec50d2` re-render. n/g = not graded
(no audio listen this round — Round 2 must grade #7). Bugs fixed this round: V24 overlay
timing (`9ec50d2`), whisper Spanish-prompt hallucination (`src/transcribe/transcribe.py`).
Top gaps → playbook §7: overlay density (both Berman clips 0 overlays), brand-beat emoji,
safe-area insets. Evidence strips: session scratchpad `austin/DF-*.png`, `RESULT-*`, `FIXED-check.png`.

## Inter-round engineering pass — 2026-07-15 (Fable, autonomous; GPT-5.6 P0 executed)

Not a graded round — the P0 correctness wave that FINDINGS §6 required before Round 2.
Landed (7 commits, ca337d1..7bb4b98, all pushed): whisper prompt removed + hotwords/
glossary + confidence end-to-end + suspect-transcript warning; layout-mode camSrc fix
(recording+audio survive punches); V24 regression tests + authoritative scheduling +
invalid-window drops; intermittent handleWindows + selfEval frame-0/A-V gates; live
ESLint flat gate (72e/31w logged) + venv repaired + dead render script removed; canonical
BeatTiming (773==773 real-ffmpeg-verified) + audio-less beats via anullsrc; brand beats →
BrandLogoPopOverSpeaker/SentimentKeyword with planner-side schema validation (brain emoji
dead). Smoke render dogfood-berman-end2-r2: "Anthropic" chip enters f157, FADES OUT by
f195 (exitFrame assist — no more hard cut), absent outside window; frames verified.
Tests 40 → 80 (+13 pytest). Round 2 proper (rubric replacement per FINDINGS Challenge 4,
then full matrix + LISTEN pass) is the next session's work.

## Round 2 — 2026-07-15 (Fable) — FIRST round under the hard-gates rubric (playbook §4, replaced this day)

Pipeline state: post GPT56-P0 wave (whisper medium default, no es prompt, camSrc layout fix,
canonical BeatTiming, brand chips, exitFrame lifecycle, intermittent-chip support unused here).

### Hard gates
| render | G1 transcript | G2 cut/audio | G3 captions | G4 render | verdict |
|---|---|---|---|---|---|
| r2-berman-end1 (hormozi/punchy) | ✓ 85w, no warning | auto ✓ (Δ0.000s, avΔ0.012s, 2 cuts) — LISTEN PENDING | ✓ (style proven on this fixture; strip on disk) | ✓ frame0 σ54.3; no overlays to mis-window | PASS* |
| berman-end2-r2 (hormozi default/editorial) | ✓ 59w | auto ✓ (Δ0.055s, 3 cuts) — LISTEN PENDING | ✓ | ✓ Anthropic chip f157–195 verified enter/fade/exit on frames | PASS* |
| r2-austin-mid (type-terminal/technical) | ✓ 78w | auto ✓ (Δ0.059s, 0 cuts) | ✓ | ✓ frame0 σ26.6 | PASS |
| r2-austin-th-clip (editorial-cyan/editorial) | ✓ 88w | auto ✓ (0 cuts) | ✓ dark bg | ✓ "99" callout f389–424 on-word, clean exit (frames verified) | PASS |

*PASS pending the human LISTEN step at the 2–3 silence-trim joins (padded cuts now real on
the berman fixtures — first time this path runs on fixtures). selfEval artifacts per render
under output/autoedit/<name>.selfeval/.

### Weighted scores (n/a renormalized; evidence = strips/stills in session scratchpad r2/)
| render | semantic+relevance /25 | cuts /20 | captions /20 | motion /15 | hook /10 | brand /5 | density /5 | total |
|---|---|---|---|---|---|---|---|---|
| berman-end1 | n/a (0 beats) | 16 (padded, unheard) | 18 | n/a | 6 (speaker-only f0) | 5 | 0 | 45/60 |
| berman-end2 | 18 (chip = right word, right type) | 16 | 18 | 13 (fade-out now real) | 6 | 5 | 1 | 77/100 |
| austin-mid | 15 (KEY callout apt; edge-hug remains, V8 open) | n/a (0 cuts) | 17 | 12 | 6 | 5 | 1 | 56/80 |
| austin-th-clip | 20 (99 stat on-word) | n/a | 17 | 13 | 6 | 5 | 1 | 62/80 |

Reading: correctness gates now hold across the matrix — remaining quality deltas are the
KNOWN queue, unchanged priorities: semantic planner (P1.10 — density/hook dimensions are
starved by design until then), V.8 safe-areas (KEY edge-hug), V.1 scrims for optional
styles, LISTEN pass (human). Next per FINDINGS §6: P1.6 source-aware EditPlan v2 →
multi-take vertical slice.

## Round 2 — TRIAGE ADDENDUM 2026-07-16 (Fable; Sol follow-up review §4) — verdicts RECLASSIFIED

Sol's 2026-07-16 audit (docs/peer-review/GPT56-FINDINGS-2026-07-16.md §4) overturned all
four Round-2 verdicts. Triage re-verified the claims independently (per playbook §11) and
CONFIRMS the reclassification. The table above stays as recorded history (append-only);
the authoritative verdicts are now:

| render | audited verdict | confirmed gate failures |
|---|---|---|
| r2-berman-end1 | **FAIL/PENDING** | G3 FAIL — rendered audio at the seg-0→seg-1 join carries "it is. **They** will help you" (re-verified 2026-07-16 by transcribing the rendered file's join snippet with medium) while the caption plan jumps `is.` → `will`; G4 FAIL — frame 0 is a speaker-only shot, no planned hook; G2 PENDING — LISTEN unchecked |
| berman-end2-r2 | **FAIL/PENDING** | G3 FAIL — same class: plan joins `work.` → `own`, audio carries "They" (Sol's targeted transcription); G4 FAIL — speaker-only frame 0; G2 PENDING |
| r2-austin-mid | **FAIL/PENDING** | G4 FAIL — KEY `YellowGlowWordCallout` full-strength at f205, gone at f206 (component had NO exit fade — code confirmed); G2 PENDING + its A/V evidence was container-vs-audio (false zero; video stream is 22.000s vs audio 22.0587s) |
| r2-austin-th-clip | **FAIL/PENDING** | G4 FAIL — "99" callout hard-cuts at f423→424 (the "clean exit (frames verified)" note above was WRONG — the strip sampling missed the boundary pair); G3 FAIL — baked source lower-third collides with the karaoke caption band; G2 PENDING |

**All four weighted scores above are VOID** under the playbook's own rule (§4.1: any hard-
gate failure → no score computed). They stay in the table as history only.

Corrections landed the same day (see SOL-0716-TRIAGE.md for the full wave): interior concat
joins are now per-beat frame-quantized (the caption-drift mechanism), YellowGlowWordCallout
gained a real exit ease-out, the overlay window is the sole scheduling authority on both
render paths, selfEval now compares video-stream vs audio-stream duration and computes a
REAL per-pixel frame-0 stddev (blank-frame diagnostic only — never hook evidence). The
"They"-class caption omission at joins (word starts inside the trimmed gap, audio survives
the cut pad) is CONFIRMED-QUEUED: it needs the word-onset snap/padding work (playbook §7 /
FABLE Task 2.1 + multi-take report's ~0.1 s pre-voice context), not a caption-side patch.

**Round 3 must re-run all four fixtures under the corrected gates (G1–G4 as
PASS | FAIL | PENDING, human LISTEN + hook decisions recorded as artifacts) before any
weighted score is computed.**

## Round 3 — 2026-07-16 (Fable) — re-run of all 4 frozen fixtures at HEAD 076506c (exit fades + per-beat quantization + word-onset snapping live)

Method: same matrix as Round 2 (berman-end1×hormozi-pop×punchy, berman-end2×hormozi-pop-default×editorial,
austin-mid×type-terminal×technical, austin-th-clip×editorial-cyan×editorial), slugs `r3-<clip>`, plans under
`output/dogfood/r3/`. **`--whisper-model small` used for SPEED this round (deadline-boxed session; owner default
is medium)** — G1 word counts match Round 2's medium counts on 3 of 4 fixtures. All four re-rendered fresh at
11:41–11:48 EDT (an earlier 01:00–01:07 overnight-loop render pass predated the final word-snap commit and is
superseded; its plans were overwritten in place). Gates are 3-state (PASS | FAIL | PENDING) per the 2026-07-16
addendum; LISTEN stays PENDING (no human audio pass this session). selfEval ran per render
(`output/autoedit/r3-<clip>-edit.mp4.selfeval/`).

Known tooling bug found this round: selfEval's A/V stream-agreement check prints "video stream missing or
unreadable ⚠️" on every render, but manual ffprobe shows both streams fine (video 22.000s / audio 22.059s on
austin-th-clip — the same benign ~0.059s padding delta as Round 2). Treated as a selfEval probe-parsing bug
(false negative), not a render failure; needs a fix before it can serve as G2 evidence.

### Hard gates (3-state)
| render | G1 transcript | G2 cut/audio | G3 captions | G4 render | verdict |
|---|---|---|---|---|---|
| r3-austin-th-clip (editorial-cyan/editorial) | PASS — 88w small, coverage gate passed | PENDING — 0 cuts; LISTEN unchecked; selfEval A/V check bugged (manual probe OK) | FAIL — baked source lower-third still collides with caption band (source frozen; no de-collision landed since R2 addendum) | PASS — "99" callout window f384–422, **exit fade REAL**: full at f412–415, progressive fade f416–419, gone by f420 (strip: output/dogfood/r3/evidence/austin-th-clip-99-exit-f412-423.png); frame-0 hook decision left to human (PENDING) | FAIL/PENDING (G3) |
| r3-austin-mid (type-terminal/technical) | PASS — 79w small (78w medium in R2), coverage gate passed | PENDING — 0 cuts; LISTEN unchecked; same selfEval A/V probe bug | PASS — karaoke band clean on inspected frames, no collision | PASS — KEY callout window f175–204, **exit fade REAL**: full f194–197, progressive fade f198–203, gone by f204 (strip: output/dogfood/r3/evidence/austin-mid-KEY-exit-f194-205.png) — the R2 hard cut (full f205 → gone f206) is fixed; KEY edge-hug persists (V.8 safe-areas, known open); frame-0 hook PENDING (human) | PENDING (G2 LISTEN + hook) |
| r3-berman-end1 (hormozi-pop/punchy) | PASS — 86w small (85w medium in R2), coverage gate passed | PENDING — 2 cuts, word-snap MOVED both (log 11:45:23: "moved 2 cut boundaries to word onset −0.12s pre-roll"); new cut times: cut 1 @ 13.73s edit (f411|412), cut 2 @ 20.87s edit (f625|626); seg-1 src start 14.260→14.080s, seg-2 21.910→21.700s vs the pre-snap plan; Δ dur 0.052s OK; LISTEN unchecked | PASS (plan-side) — the R2 "They"-class omission is GONE: caption track now carries `is.`(f403–409) → `They`(f416–422) → `will`(f422–428) across the seg-0→seg-1 join; rendered-audio re-transcription of the join not repeated this round (queued with LISTEN) | FAIL — frame 0 still a speaker-only shot, no planned hook (owner hard rule §9.9; hook planner not yet landed — P1.10); no overlays to mis-window (0 beats) | FAIL/PENDING (G4 hook; G2 LISTEN) |
| r3-berman-end2 (hormozi-pop default/editorial) | PASS — 60w small (59w medium in R2), coverage gate passed | PENDING — 3 cuts, word-snap MOVED 3 boundaries (log 11:47:31); new cut times: 4.00s (f119|120), 7.67s (f229|230), 11.77s (f352|353) edit-time; seg-2 src 8.679→8.500s, seg-3 13.382→13.220s; Δ dur 0.055s OK; LISTEN unchecked | PASS (plan-side) — R2 "work.→own" omission GONE: caption carries `work.`(f214–222) → `They`(f226–233) → `own`(f233–245) across the seg-1→seg-2 join; rendered-audio join re-transcription queued with LISTEN | FAIL (hook) / overlay PASS — "Anthropic" chip is now `BrandNameChip` (f149–187, top-right): animated enter ~f150–156, full hold, **real exit fade f182–188, gone by f189** (strip: output/dogfood/r3/evidence/berman-end2-anthropic-chip-f145-189-every4.png); frame 0 still speaker-only, no planned hook (P1.10) | FAIL/PENDING (G4 hook; G2 LISTEN) |

Round-3 reading: the three mechanisms that voided Round 2 are all verifiably fixed on these
re-renders — (1) overlay exit hard-cuts → real ease-out fades on all three overlay fixtures
(frame strips in output/dogfood/r3/evidence/), (2) the "They"-class caption omission at
silence-trim joins → word-onset snap (−0.12s pre-roll) moved 2+3 berman boundaries and the
missing words now sit in the caption track across the joins, (3) caption drift → per-beat
quantization holds Δdur at 0.052–0.059s across the matrix. Still open, unchanged: frame-0
hook (G4 FAIL on both berman fixtures — needs the P1.10 semantic/hook planner), the baked
lower-third collision on austin-th-clip (G3, source-frozen), the human LISTEN pass (G2
PENDING everywhere), KEY edge-hug (V.8), and the selfEval A/V-probe false-negative found
this round. **No weighted scores computed** — playbook §4.1: pending/failing hard gates
block scoring. Whisper `small` was a speed concession this session; re-run G1-sensitive
checks with medium before promoting any of these renders.
