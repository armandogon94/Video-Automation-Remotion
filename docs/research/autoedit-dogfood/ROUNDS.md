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
