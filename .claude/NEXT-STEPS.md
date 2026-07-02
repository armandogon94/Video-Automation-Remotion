# NEXT STEPS — resume backlog (updated 2026-06-30; merge-state corrected 2026-07-02)

> **All work below is merged to `main`.** The `claude/recursing-tu-dac74b` branch was
> fast-forward-merged on 2026-06-26; there is no unmerged branch. Resume any item with
> "continue with NEXT-STEPS #N".
> Latest: tsc 0 · liquid-glass atom family shipped (austin/nate) · video-use harvest landed.
>
> **The active backlog is now `FABLE.md`** (repo root, 2026-07-02) — a deep technical + product
> review with an ordered fix plan (export-layer bugs, quality gates, then this creator-study
> backlog). Treat FABLE.md's phases as the primary priority order; the items below are the
> older creator-study backlog and largely lower-priority than FABLE's Phase 1–3.

---

## 🌙 video-use harvest — DONE overnight (2026-06-30)

Analyzed browser-use/video-use (it's an AI video EDITOR that *uses* Remotion/Hyperframes, NOT a
competitor — full memo `docs/research/video-use/ANALYSIS.md` + `FFMPEG-RULES-AUDIT.md`). Verdict:
harvest-ideas-keep-stack. Landed (each tsc-clean + tested + atomic commit):
- ✅ **30ms audio fades at every cut** — `renderFromPlan.ts` both paths (09172e4).
- ✅ **packed-transcript generator** — `src/autoedit/packTranscript.ts` + tests (8538971); CLI →
  takes_packed.md from faster-whisper JSON. The reading substrate for future LLM editing.
- ✅ **capped self-eval render QA** — `src/autoedit/selfEvalRender.ts` + tests (40005f4):
  ffprobe duration check + before|after cut contact sheet + checklist.
- ✅ **optional per-segment grade** — `EditSegment.grade` + `GRADE_FILTERS` (a99e141), single-source path.

**Open follow-ups (do ATTENDED — touch render/cut flow):**
1. Multi-source per-segment grade (add `grade?` to the reel-assembly beat shape; same filter insertion).
2. Wire `selfEvalRender` into the render orchestration (auto-QA, cap 3 passes).
3. Transcript-semantic cutting + strategy-confirm gate (the `SuggestStrategy`/ADR-003 §5 LLM pass —
   now unblocked by packTranscript). Design-level.
4. (optional) reels-vs-reels pilot: fork video-use `transcribe.py` → faster-whisper (keep free), then
   edit the same `output/footage/claude-cowork/IMG_36*.MOV` both ways and compare.

---

## 🌙 austin.marchese animation study — IN PROGRESS OVERNIGHT (2026-06-26 ~2am)

**Trigger:** user flagged @austin.marchese (anchor `TP73qyFWDcY`) as a nateherk animation cousin;
asked for ≥25 videos analyzed by 3 reviewers (me + Codex GPT-5.5 xhigh + Antigravity/Gemini Flash).

- ✅ **29 videos** scraped → frames + 223 contact sheets (sources deleted; `jdLFeBkiy3M` dead).
- ✅ **Reviewer #1 — RE-RUN ON OPUS** (`docs/research/austin-anim/MY-CATALOG-OPUS.md`; was Haiku, user
  flagged the weak model): CONFIRMS austin = reskinned nate, **0 new-template gaps (NOT overturned)**,
  but stricter than Haiku — surfaced **2 source-verified NET-NEW atoms** (`LitSphereGlyph` lit-3D-orb,
  `ArcLightWipe` swoosh transition — both grep-confirmed absent in `src/`), **dropped** ScrambleResolveText
  (AnimatedText9x16 already has mulberry32 scramble), +10 craft details beyond Codex's 18. Build plan
  refreshed → `docs/research/austin-anim/BUILD-SPEC.md`.
- ✅ **Reviewer #2 (Codex xhigh): DONE 29/29** (capped at 16, finished via 4:12 AM cron after the
  4:07 reset; crons retired). **2-of-3 consensus** `docs/research/austin-anim/CODEX-CONSENSUS.md`:
  AGREES austin = reskinned nate, **0 new-template gaps, ZERO divergence**; adds **18 subtle-craft
  details** + elevates **PromptCardPedagogy** (its #1 most-replicable, 11+ videos).
- ⏳ **Reviewer #3 (Gemini Flash):** headless `agy` is BROKEN (generic greeting / stall). USER runs
  `docs/research/austin-anim/ANTIGRAVITY-PROMPTS.md` (29 + nate) in the Antigravity IDE tomorrow.

**✅ BUILT (2026-06-26) — liquid-glass atom layer (tsc clean + render-QA'd):** `src/components/liquidglass/`
= `tokens.ts` (brand/warm/cool themes, glassCardStyle, glassGlow) + `GlowPulseOverlay` (two-stage
border-settle→glow-bloom) + `LitSphereGlyph` (lit 3D orb, opt-in, `?`-anticipation) + `ArcLightWipe`
(swoosh transition) + `ClauseHighlightPhrase` (focus-box + inline-select). `FloatingCaption` got
`glowColor` + `rotationDegrees` (optional, backward-compat). 2 registered comps:
`LiquidGlassShowcase9x16` + `PromptCardPedagogy9x16` (render QA: `output/qa-liquidglass/*-sheet.png`).
Dropped ScrambleResolveText (AnimatedText9x16 already has scramble). NOT new templates — an ATOM layer.

**nate cool-teal variant:** already covered — pass `theme="cool"` to any liquid-glass atom (tokens carry
nate's cyan/teal). No separate nate build needed; nate's AGY pass is still optional (bonus block in
ANTIGRAVITY-PROMPTS.md). Optional follow-up: adopt GlowPulseOverlay across existing card comps.

**Resume:** "continue austin build" once Codex MDs (`docs/research/austin-anim/ANALYSIS-FROM-CODEX-*.md`)
+ Gemini MDs exist → triangulate → build the 3 additive pieces → render/QA → ANALYSIS/CREATORS → commit.

---

## DONE this pass (2026-06-25 second session)
- ✅ **#3 SceneSequencer9x16** — net-new multi-scene orchestrator (hero/comparison/stat/
  bullets/cta via <Series> + transitions + progress bar). Registered, rendered, QA'd.
- ✅ **#2 CodingFab notes** — 4 notes/<comp>.md added; gallery now scores them NEW 8–9/10.
- ✅ **#2 ConcentricHierarchy polish** — bolder visible rings + single-line non-overlapping
  labels (dropped redundant in-band descriptions). Re-rendered, QA clean.
- ✅ **#5 AbhiWaveform transcript** — AbhiWaveformTranscript9x16 wrapper registered + rendered;
  fixed a real wrap bug (word spans lacked inter-word whitespace → long transcript overflowed;
  added breakable space + canvas-relative chip). showTranscript-only, 73 consumers unaffected.

## CONSCIOUSLY SKIPPED (with reasons — not oversights)
- **#1 ADAPTED badge** — cosmetic; "adaptation" is debatable for legit templates (Venn,
  Benchmark…). The real Codex concern (unscored rows shown VALIDATED) was already fixed.
- **#1 DiagramExplainer relabel** — repointing to carloscuamatzin would drop midu.dev from
  the gallery entirely (revisionist). Observation stays in SOURCE-VERIFICATION.md.

---

## STILL OPEN
### #4 — Fold in the Codex visual audit  ✅ MD HAS LANDED (verify + close)
The Codex (gpt-5.5 high) frame-by-frame audit of CROSS-CREATOR-COMPARE.html + ABHI-COMPARE.html
was run and its output exists: `docs/codex-review/VISUAL-AUDIT-FROM-CODEX.md` (plus
`VISUAL-AUDIT-FROM-GEMINI-FLASH.md`, `VISUAL-AUDIT-FROM-GEMINI-PRO.md`, and a
`VISUAL-AUDIT-RESPONSE.md` that indicates it was already processed). Remaining action is to
confirm the response captured every real finding and close the item — not "wait for the MD to
land." (`FABLE.md` §14 is a newer, more thorough visual pass; prefer it for visual defects.)

### #0 — Merge `claude/recursing-tu-dac74b` → `main`  ✅ DONE (2026-06-26)
This is complete. The branch was fast-forward-merged into `main` on 2026-06-26 (recorded in
`memory.md`); `main` is NOT behind. Do not attempt to re-merge an already-merged branch. Stale
worktrees under `.claude/worktrees/` (if any remain) can be removed with `git worktree remove`.

### #1 tail — cross-creator source-map (low yield, optional)
9 rows still on resolver fallback (two adversarial passes already; diminishing returns):
TerminalBlock9x16, BigNumberDuel9x16, LockedFeatureRow9x16, TitledDossierCard9x16,
TopHeroBottomTrioCards16x9, TitleCardKineticTwoLine16x9, KineticEssay9x16,
LineChartAnnotated9x16, ModelComparison2x2Grid16x9.

### #6 — More reference creators (needs you to name targets / accept scraping)
CREATORS.md "Candidate pool"; retry IP-throttled motiondarwin + zenzuke from a fresh IP.
NOTE: scraping must NOT run concurrent with renders (breaks Remotion font fetch).

### Small nits (optional)
- AbhiWaveformTranscript9x16 is registered + rendered but NOT a row in ABHI-COMPARE.html
  (the gallery derives source from the comp id, and there's no distinct transcript source
  scene — would need a per-row source-override field + a duplicate/symlinked source).
- SceneSequencer9x16 durationInFrames is a fixed literal 375; a calculateMetadata could make
  it auto-size to the summed scene durations when a user supplies a custom scenes array.

### Quick resume commands
- Rebuild gallery: `./scripts/build-cross-creator-gallery.py`
- Render N comps (bundle once, cross-creator TARGETS): `npx tsx src/autoedit/runCrossCreatorReplicas.ts "Comp1,Comp2"`
- Render a single non-TARGET comp: `npx remotion render src/index.ts <CompId> output/showcase/<CompId>.mp4 --log=error`
- Typecheck: `npx tsc --noEmit`
