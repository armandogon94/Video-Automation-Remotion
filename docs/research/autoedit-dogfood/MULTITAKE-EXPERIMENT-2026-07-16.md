# Multi-take experiment #1 — retake ordering on owner footage vs the published reel

**Date:** 2026-07-15/16 · **Agent:** Claude Fable 5 · **Status:** complete, scores below
**Job folder (gitignored):** `output/multitake/claude-cowork/` · **Design basis:** `docs/peer-review/GPT56-FINDINGS.md` §5 (job folder §5.1, sequence-aware clustering §5.2, ranking-explains §5.3, HTML review gate §5.4)

## What this was

First run of the folder-of-retakes → take groups → A/B/C → edit-order pipeline on
**Armando's own raw footage**: the 9 iPhone HLG clips (`IMG_3615/16/17/18/27/28/29/30/32.MOV`,
4K portrait, 30 fps, ~13.2 min total) he filmed for the **Claude Cowork reel**, scored
against the reel he actually published (`instagram.com/p/DTqE-tgDSzy`, 2026-01-18,
70.6 s). The published reel is the REAL ground truth (not a proxy): fetched via
gallery-dl's reels-tab metadata dump + direct CDN `video_url` (the `/p/` page itself
redirects to login; the listing endpoint did not).

## Setup (artifacts per FINDINGS §5.1)

| artifact | content |
|---|---|
| `sources.json` | ffprobe facts + sha256 per clip (all HLG `arib-std-b67`, mono 48 kHz AAC) |
| `transcripts/<take>.json` | full-file faster-whisper medium, es, `condition_on_previous_text=False`, hotwords "Claude, Cowork, Anthropic, Claude Code, Armando Inteligencia", word probabilities kept |
| `qa/bursts.json`, `qa/burst-transcripts.json` | silencedetect speech bursts + per-burst re-transcription (see finding 1) |
| `take-groups.json` | 16 groups, 2–6 options each, coverage flags, recommendation + rationale |
| `edit-order-proposal.md` | 15-step hook→development→CTA proposal |
| `comparison.json` + `qa/envelope-matches.json` | published-beat → source-take identification + scores |
| `REVIEW.html` | static local page: per-group A/B/C `<video>` (540p proxies) with seek-to-span buttons, badges for my recommendation vs his actual pick, proposal-vs-actual table |

## Per-step results

### 1. Transcription: full-file whisper is structurally unreliable on multi-take footage

This is the round's most important infrastructure finding. The full-file transcripts
(medium model, correct settings) **silently dropped or smeared later retakes** in 4 of 9
clips: word timings stretched across silence gaps between attempts (IMG_3615: an 11 s
"gap" mid-sentence), and entire final takes were missing (IMG_3615 66.9–69.6,
IMG_3616 88.8–108.8, IMG_3629 126.7–138.6, IMG_3630 121.0–132.3). **Five of the sixteen
spans Armando actually published were invisible to the full-file transcript.** The fix
that worked: slice each clip into silencedetect speech bursts (−35 dB, 0.5 s), transcribe
each burst independently (same settings, model loaded once), map words back to absolute
time. A burst can't smear across 30 s. Every downstream artifact used burst-level spans.

Also reproduced: whisper noise-hallucinations on breath/quiet bursts ("Amara.org",
"www.alimmenta.com", "www.mooji.org", "Despacito") — all low-probability; a unitizer
must probability-gate them. The CLI words/s suspicion heuristic (<1.5 w/s) flags ALL nine
raw clips (raw takes are mostly silence) — useless as a suspicion signal for this footage
class; timing smear + dropped-burst coverage checks are the real signals.

### 2. Clustering (agent-as-aligner, FINDINGS §5.2)

16 take groups from ~123 bursts; 2–6 options per group; partial retakes kept with
coverage flags (e.g. G04-C covers only the second half; G06-D only the first clause);
on-set self-direction ("Ok, entonces estoy aquí", "¡Vámonos! Se va grabando", "No, leo
desde aquí"), an aborted take ending in profanity (IMG_3617 109.6–112.0 — hard-exclude),
and noise hallucinations left ungrouped. Token-set Jaccard would have failed exactly
where FINDINGS §5.2 predicted: the second-half-only pickups (3616@98.9, 3618 both takes)
and the script-variant wordings (G06-A "escribes…haces otra cosa" vs "describes…Netflix").

### 3. Ground-truth alignment (ASR-independent)

Published beats were matched to source takes by normalized cross-correlation of 100 Hz
log-envelopes between the reel audio and every take (`qa/envelope_match.py`) — the reel
reuses raw-take audio, so the true source peaks at ncc 0.78–0.98 while the same sentence's
OTHER takes score ≈0.4–0.55. Textually identical takes are thereby distinguishable.
Bonus: multi-clause beats that matched weakly as a whole (ncc 0.28–0.44) turned out to
contain **his internal cut points**; splitting at clause boundaries and re-matching
located every splice (e.g. beat 7 = 3617@82.7 + 3618@16.5, spliced between "final" and
"y Claude").

### 4. Scores

| metric | result |
|---|---|
| **Order agreement** (Kendall-τ-style, 16 beats = 120 pairs) | **1.000** |
| **Take-choice agreement** (15 groups with >1 plausible option) | **14/15 = 0.933** |

Honesty notes: (a) order was strongly determined — he filmed in script order, and
hook→mechanism→features→objections→availability→CTA is the standard arc, so 1.000
mostly validates that shoot order is a reliable prior, not that ordering is solved;
(b) the ground truth was transcribed in the same batch as the takes before the proposal
was frozen — recommendations were derived from take-intrinsic criteria (FINDINGS §5.3)
but strict blinding was not enforced; next round should freeze the proposal before
touching the ground truth.

### 5. Divergence analysis (the misses are the learning)

1. **G01 / beat 1 (the one miss).** Three takes of "Reduce tu trabajo de 8 horas…":
   A has a wording flub ("Reduzco el"), B and C are textually IDENTICAL. My §5.3 ranking
   picked C (cleaner silence head, last take). **He used B** (ncc 0.930 vs 0.544 at C).
   Text+audio features cannot explain the choice — B even sits 0.6 s after a false start.
   Inferred: a delivery/visual judgment (energy, expression, eye contact). Lesson: when
   takes tie on text, the system must show video side-by-side and NOT pretend the ranking
   can resolve it (ranking-explains-not-decides, exactly FINDINGS §5.3).
2. **Pickup takes dictate mid-sentence splice points.** Beat 7's published audio splices
   3617's "Describes el resultado final" onto 3618's "y Claude se encarga de todo…" —
   IMG_3618 is a 23 s clip filmed only to repair that sentence's tail, and its take
   begins mid-sentence, forcing the cut between "final" and "y". A per-group
   single-choice model cannot represent this; composed choices across files
   (FINDINGS §5.4's partial-coverage composition) are a launch requirement, not an edge
   case. (My proposal composed the same splice, so it scored as a match.)
3. **Publish-grade trimming is tighter than burst boundaries.** His cuts hug word onsets
   (beat 1 enters ≈0.11 s before voicing); one beat is tightened ~0.26 s mid-take
   (beat 13, between clauses); beats 3+4 lose ~0.5 s between clauses of a single take.
   Burst spans are selection artifacts; final EDL spans need word-onset snapping plus
   the existing 50 ms audio-fade padding.

Non-divergences worth recording: he kept the 11.9 s features enumeration essentially
untrimmed (b-roll covers it); GT-whisper "misses" the word "decisión" in beat 12a but
the 0.58 s low-p "para" almost certainly hides "decisión para" — ASR artifact, not an
edit decision.

## Decision rules learned (for the future planner)

1. **Last-take-wins is a strong prior, not a rule**: 14/15 groups used the final complete
   attempt — but the single exception was the HOOK, where he picked a middle take over an
   identical-text last take. Weight chronology heavily except on the hook beat; for hooks,
   always surface all complete takes for human/visual review.
2. **Re-record clusters signal intent**: when a cluster of false starts precedes a take
   (G04, G11, G15), that final take is what he was chasing — treat aborted-attempt density
   before a take as a positive selection signal for it.
3. **On-set "No." is a veto**: his spoken rejection right after G14-C's phrasing marks
   that wording as rejected; detect self-rejections ("No.", "No, verga.") and never
   auto-select the take they follow.
4. **Shoot order = script order**: clip filename chronology reproduced the published beat
   order perfectly; use it as the default ordering prior.
5. **Pickup clips exist**: a short clip whose takes all start mid-sentence (IMG_3618) is
   a tail-repair for the previous clip's sentence — join its group to the neighbor and
   plan a mid-sentence splice at the pickup's start.
6. **Transcribe bursts, not files**, keep per-word probabilities, and probability-gate
   whisper's noise hallucinations; validate that every speech burst has transcript
   coverage before clustering (missing-burst coverage is the true "suspect" signal).
7. **Snap final cut points to word onsets** (≈0.1 s pre-voicing), not burst edges.
8. **Envelope cross-correlation** (100 Hz log-envelope ncc) is a cheap, ASR-free way to
   (a) identify which take a published edit used and (b) locate hidden cut points — keep
   it in the QA toolbox for future proposal-vs-published evaluations.

## Follow-ups this unblocks

- EditPlan v2 (FINDINGS §5.5) must support composed per-beat sources (rule 5) and
  word-onset-snapped spans (rule 7).
- The take-review gate (`REVIEW.html` → `takes-decisions.json`) has its first real
  fixture; the pattern (proxy videos + seek-to-span + recommendation badges) worked in
  browser QA — G01 is the demo case for "ranking explains, human decides".
- Burst-sliced transcription should become the autoedit ingest default for multi-take
  folders; the full-file path stays only for single-take sources.
