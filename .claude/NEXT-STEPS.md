# NEXT STEPS — resume backlog (updated 2026-06-25, second pass)

> Branch `claude/recursing-tu-dac74b` (worktree), NOT merged to `main`.
> Latest: tsc 0 · CROSS-CREATOR-COMPARE.html = 59 pairings · **127 registered comps** ·
> 0 leaked bundles. Resume any item with "continue with NEXT-STEPS #N".

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
### #4 — Fold in the Codex visual audit  ⟵ do when the MD lands
A Codex (gpt-5.5 high) frame-by-frame audit of CROSS-CREATOR-COMPARE.html + ABHI-COMPARE.html
is being run; it writes `docs/codex-review/VISUAL-AUDIT-FROM-CODEX.md`. When present: read it,
ground-truth each finding (Codex has false-positived before), fix real issues, re-render +
re-QA + commit. This is the highest-value next action.

### #0 — Merge `claude/recursing-tu-dac74b` → `main` (your call)
All of this + last session's work is on the branch; `main` is behind. Also `git worktree remove`
the two stale locked worktrees (agent-a590da53…, agent-ab34076a…).

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
