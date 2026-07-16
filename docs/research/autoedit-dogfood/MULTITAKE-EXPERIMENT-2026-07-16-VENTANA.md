# Multi-take experiment #2 — "Ventana de Contexto PDF" folder (deadline-scoped run)

**Date:** 2026-07-16 · **Agent:** Claude Fable 5 · **Status:** IN PROGRESS (progress snapshots committed as stages land)
**Job folder (gitignored):** `output/multitake/ventana-pdf/` · **Method basis:** `MULTITAKE-EXPERIMENT-2026-07-16.md` (experiment #1) — burst-sliced transcription, agent-as-aligner grouping, ranking-explains-not-decides.

## What this is

Second run of the folder-of-retakes → take groups → A/B/C → edit-order pipeline, on the
raw iPhone footage for the **"Ventana de Contexto PDF"** piece:
`/Users/armandogonzalez/Downloads/Armando Inteligencia Media/Ventana de Contexto PDF/IMG_*.MOV`
(READ-ONLY source; 14 clips, 408.4 s total, filmed 2026-03-10 19:15–22:58). Screen
recordings and PNG/JPG assets in the same folder are b-roll/overlay material, not takes —
excluded from take analysis by design.

**Deadline scoping (differences vs experiment #1):**
- Whisper model **small** (not medium) — faster, but lower word accuracy and worse
  proper-noun handling; hotwords "Claude, ventana de contexto, PDF, tokens" partially
  compensate. Take-choice rationales that hinge on fine wording should be re-checked
  against a medium-model pass before any EDL is rendered.
- **Ground-truth comparison SKIPPED** — see PENDING section at the bottom.
- No REVIEW.html / proxy renders this round.

## Stage 1 — sources (probe + sha256) — DONE

`output/multitake/ventana-pdf/sources.json`. All 14 takes: HEVC 1080×1920 portrait
(hvc1), HLG (`arib-std-b67`), 30 fps, mono 44.1 kHz AAC. sha256 recorded per clip.

| take | dur (s) | note |
|---|---|---|
| IMG_6079 | 6.8 | |
| IMG_6080 | 29.4 | |
| IMG_6081 | 16.1 | |
| IMG_6083 | 13.7 | |
| IMG_6084 | 5.0 | |
| IMG_6088 | 12.3 | |
| IMG_6090 | 18.0 | |
| IMG_6091 | 20.4 | |
| IMG_6092 | 15.0 | |
| IMG_6093 | 16.9 | |
| IMG_6098 | 22.2 | |
| IMG_6101 | 187.0 | long take — likely multiple retakes inside |
| IMG_6102 | 38.7 | |
| IMG_6118 | 6.9 | filmed ~3.5 h after the rest (22:58 vs 19:15–19:50) — likely pickup/CTA |

## Stage 2 — audio extraction — DONE

16 kHz mono PCM WAVs at `output/multitake/ventana-pdf/audio/IMG_*.wav` (ffmpeg `-vn -ac 1 -ar 16000`).

## Stage 3 — burst-sliced transcription — PENDING

silencedetect −35 dB / 0.5 s → per-burst faster-whisper **small**, es,
`condition_on_previous_text=False`, hotwords, word probabilities kept, 0.15 s pad.
Artifacts: `transcripts/IMG_*.json`, `qa/bursts.json`.

## Stage 4 — take groups — PENDING

`take-groups.json` — A/B/C options + rationales; hook groups marked HUMAN-DECIDE
(experiment #1 rule 1: the hook was the one miss; always surface hook takes for
human/visual review).

## Stage 5 — edit-order proposal — PENDING

`edit-order-proposal.md` — hook → development → CTA using shoot-order prior (rule 4).

## PENDING: ground-truth comparison (next session)

Skipped this round for deadline. To do next session: fetch the published reel via the
**gallery-dl reels-metadata method** from experiment #1 (reels-tab metadata dump + direct
CDN `video_url`; the `/p/` page redirects to login). Find the reel by caption keywords
**"contexto" / "PDF"** on @armandointeligencia, then run the envelope cross-correlation
(100 Hz log-envelope ncc, `qa/envelope_match.py` pattern) to score order agreement and
take-choice agreement against this proposal. The proposal in this report was frozen
WITHOUT looking at the published reel — the blinding that experiment #1 flagged as
missing is therefore enforced this round by construction.
