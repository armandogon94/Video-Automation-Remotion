# Multi-take experiment #2 — "Ventana de Contexto PDF" folder (deadline-scoped run)

**Date:** 2026-07-16 · **Agent:** Claude Fable 5 · **Status:** proposal frozen; ground-truth comparison PENDING (see bottom)
**Job folder (gitignored):** `output/multitake/ventana-pdf/` · **Method basis:** `MULTITAKE-EXPERIMENT-2026-07-16.md` (experiment #1) — burst-sliced transcription, agent-as-aligner grouping, ranking-explains-not-decides.

## What this is

Second run of the folder-of-retakes → take groups → A/B/C → edit-order pipeline, on the
raw iPhone footage for the **"Ventana de Contexto PDF"** piece:
`/Users/armandogonzalez/Downloads/Armando Inteligencia Media/Ventana de Contexto PDF/IMG_*.MOV`
(READ-ONLY source; **14 takes, 408.4 s total**, filmed 2026-03-10 19:15–22:58). The two
screen recordings and the icon PNGs in the same folder are b-roll/overlay assets, not
takes — excluded from take analysis by design.

**Deadline scoping (differences vs experiment #1):** whisper **small** instead of medium
for this session's pass (speed; worse proper nouns — hotwords "Claude, ventana de
contexto, PDF, tokens" partially compensate); **no REVIEW.html/proxies**; **ground truth
skipped** (pending section below).

## Stage 1 — sources (probe + sha256) — DONE

`sources.json`: all 14 takes HEVC 1080×1920 portrait, HLG (`arib-std-b67`), 30 fps, mono
44.1 kHz AAC, sha256 per clip. Durations: 6079 6.8 · 6080 29.4 · 6081 16.1 · 6083 13.7 ·
6084 5.0 · 6088 12.3 · 6090 18.0 · 6091 20.4 · 6092 15.0 · 6093 16.9 · 6098 22.2 ·
**6101 187.0 (multi-retake block)** · 6102 38.7 · **6118 6.9 (pickup, filmed ~3.5 h
after the rest, same late session as the screen recordings)**.

## Stage 2 — audio — DONE

16 kHz mono PCM WAVs at `audio/IMG_*.wav` (ffmpeg `-vn -ac 1 -ar 16000`).

## Stage 3 — burst-sliced transcription — DONE (two passes, see finding 1)

silencedetect −35 dB/0.5 s → per-burst faster-whisper, es,
`condition_on_previous_text=False`, hotwords, word probabilities, 0.15 s pad.

- **This session:** model **small** → `transcripts/IMG_*.json` + `qa/bursts.json`
  (the long 6101 clip was still finishing in background at report freeze; 12/14 written).
- **Discovered on disk:** a prior 01:00 AM session had already run the SAME method with
  **medium** → `qa/burst-transcripts.json`, covering all 14 takes (29 bursts on 6101).
  **Grouping below used the medium pass as primary, small as cross-check.**

**Findings (small-vs-medium on identical bursts):**
1. **Hallucinations differ by model but hit the same quiet bursts** — small produced
   "www.tokens.com" (hotword-contaminated!) where medium produced "www.amazon.com";
   both low-p. Hotwords leak into hallucinations — probability-gating (exp#1 rule 6)
   remains mandatory, and hotword strings should be treated as suspect when they appear
   in near-silent bursts.
2. **Coverage discrepancy on the CTA tag:** the brand tag "y así podamos continuar
   Armando Inteligencia" (6098 @ 18.24–20.66) appears in the medium pass but NOT in this
   session's small pass — a dropped-coverage case exactly like exp#1's missing takes.
   Coverage-diffing two independent passes is a cheap validator worth keeping.
3. Small-model text quality was otherwise adequate for **grouping** (identical group
   structure would have resulted), but flubs like "Náxela, tómaga", "chahepete",
   "Alonga bastante" show it is NOT adequate for wording-level rationales or captions.

## Stage 4 — take groups — DONE

`take-groups.json`: **12 groups** (G01–G12), 21 usable options total, 3 groups marked
**HUMAN-DECIDE**:

- **G01 HOOK "Detente, no hagas esto"** — 3 takes (6079/6080/6081), textually
  IDENTICAL → per exp#1 rule 1 (the hook was exp#1's only miss) no auto-pick; A/B/C to
  human. B carries the re-record-cluster signal (rule 2), C the last-take prior.
- **G02–G09** — the narration spine; each beat has exactly ONE complete take
  (single-take shooting style for narration, unlike the Cowork shoot): problem ("No
  subas un PDF de 300 páginas a ChatGPT…"), "¿Pero por qué?", context-window limit,
  "crees que leyó los 20 capítulos", split+agents solution, "en ChatGPT no es tan
  sencillo", Claude/Claude Cowork beat, CTA+brand tag.
- **G10 demo-skit line 1** ("Hola ChatGPT, te tengo/hoy te traje todos estos libros…") —
  5 complete options inside IMG_6101 with a wording/blocking change mid-cluster: his
  on-set note **"mejor, es más visual así"** (85.2 s) splits the cluster; rec = E (last
  take, post-re-blocking) but HUMAN-DECIDE because his own note declares the criterion
  VISUAL. New footage class vs exp#1: retake cluster inside one long clip, with spoken
  self-direction as the cluster delimiter ("Otra vez, varias tomas y escojo la mejor").
- **G11 demo-skit line 2** ("Quiero que analices todos los capítulos…") — 2 flubbed
  fragments in 6101 + 2 clean takes in 6102 ("Otro tomo por si acaso" = safety-take
  marker); rec = D (last clean take). 6102 is a continuation clip for a line 6101
  kept flubbing — re-record-cluster across files (rule 2/5 hybrid).
- **G12 pickup "y mucho menos esto"** (6118) — single take; the open question is
  PLACEMENT (grammatically continues the hook; filmed with the screen recordings, so
  probably points at a second on-screen behavior) → HUMAN-DECIDE.
- Hard-excludes: on-set profanity/frustration (6092 @ 1.35), self-direction, false
  starts; one AMBIGUOUS burst flagged for human listen (6101 @ 127.6 "si quieres
  sentate ahorita…" — possibly an in-skit line, low-p transcript).

## Stage 5 — edit-order proposal — DONE (frozen blind)

`edit-order-proposal.md`: 12-step order. Narration spine follows shoot order (rule 4);
the demo skit (shot LAST but narratively a dramatization) is inserted at #2–3 right
after the hook; G12 placed at #5 with alternatives flagged. Cut points are burst spans —
must be word-onset-snapped (rule 7) before any EDL render. Screen recordings proposed
as cover for beats 8–10; icon PNGs for the Claude beat.

**Blinding note:** unlike experiment #1, this proposal was frozen with NO access to the
published reel — the comparison below can be run cleanly.

## Method deltas vs experiment #1 (what this run adds)

1. **Single-take narration spine + multi-take inserts** is a different shoot pattern
   than Cowork's all-retakes folder; grouping degenerates to pass-through for 8 of 12
   groups, and the interesting decisions concentrate in the hook + skit inserts.
2. **Spoken self-direction as cluster delimiter** ("varias tomas y escojo la mejor",
   "es más visual así", "otro tomo por si acaso") — parse these as structure, not noise:
   they mark cluster boundaries, safety takes, and the selection criterion itself.
3. **Two-model coverage diff** (small vs medium) caught a dropped CTA-tag burst —
   promote to a standard QA step when a second pass exists.
4. **Hotword contamination of hallucinations** (small model) — gate hotword-echo bursts.

## PENDING: ground-truth comparison (next session)

Fetch the published reel via the **gallery-dl reels-metadata method** from experiment #1
(reels-tab metadata dump + direct CDN `video_url`; the `/p/` page redirects to login).
Locate the reel on @armandointeligencia by caption keywords **"contexto" / "PDF"**. Then
run envelope cross-correlation (100 Hz log-envelope ncc, exp#1 `qa/envelope_match.py`
pattern) to score order agreement + take-choice agreement against this frozen proposal —
including whether he opened cold on the skit (proposal open question 4) and which
identical-text hook take he used (G01, the exp#1 blind spot).
