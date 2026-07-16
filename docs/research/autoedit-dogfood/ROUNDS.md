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
