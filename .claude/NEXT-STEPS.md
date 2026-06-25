# NEXT STEPS — resume backlog (written 2026-06-25)

> Everything below is OPEN work, ordered by priority. To resume any item, just say
> "continue with NEXT-STEPS #N". All work this session is on branch
> `claude/recursing-tu-dac74b` (worktree), NOT merged to `main` (main is at 575e16d).
> State at handoff: tsc 0 errors · CROSS-CREATOR-COMPARE.html = 59 pairings ·
> 125 registered compositions · 0 leaked render bundles · working tree clean.

---

## 0. DECIDE: merge the branch to main  ⟵ do this first
All session work (per-template source frames, source-map audit, footage-well fixes,
AbhiWaveform variant, CodingFab + 4 templates) lives on `claude/recursing-tu-dac74b`.
`main` does not have it. Options: (a) merge branch → main, (b) keep on branch.
Also clean up the two locked stale worktrees (`agent-a590da53d970cc596`,
`agent-ab34076ac91f171e4`) via `git worktree remove`.

---

## 1. Cross-creator source-map — finish the audit tail (GPT-5.5 review)
The 110-agent + 72-agent audits pinned 33/55 rows to verified per-template (often
frame-level) source scenes. Remaining (see `docs/research/cross-creator/SOURCE-VERIFICATION.md`):
- **9 rows still on resolver fallback** (verifier rejected the round-2 re-pick):
  TerminalBlock9x16, BigNumberDuel9x16, LockedFeatureRow9x16, TitledDossierCard9x16,
  TopHeroBottomTrioCards16x9, TitleCardKineticTwoLine16x9, KineticEssay9x16,
  LineChartAnnotated9x16, ModelComparison2x2Grid16x9. → run one more frame-level
  curation round (some need a different reel; some genuinely lack a clean scene).
- **12 "adaptation / no clean single-scene source" templates** → add an explicit
  **`ADAPTED`** verdict + badge to `scripts/build-cross-creator-gallery.py` so they're
  not silently shown as VALIDATED. (Honesty fix Codex implied.)
- **DiagramExplainer9x16**: its real structural source is carloscuamatzin/DYqgAYfRqBf
  (cross-creator), kept on midu.dev to preserve the row's "↔ @creator" label — decide
  whether to relabel that row or keep it.

## 2. CodingFab follow-ups
- **Notes for the 4 new comps**: write `docs/research/cross-creator/notes/<comp>.md`
  for ConcentricHierarchyRadialCallout9x16, MetricBarsComparisonCard9x16,
  StatCardSequenceWithUnderlines9x16, AppScreenCarousel9x16 so the gallery shows a real
  score/verdict instead of the default "NEW".
- **ConcentricHierarchyRadialCallout9x16 polish** (optional): rings render faint and
  the band labels are a tight descending stack — legible but could be airier (bolder
  ring strokes, labels truly centered in their bands, fewer default rings).
- **Long-form 16:9**: only CodingFab Shorts were studied. Scrape his long-form tutorials
  (`npm run scrape:shorts` won't do /videos — use yt-dlp on @CodingFab/videos) for any
  16:9 patterns (he does live "build an app" tutorials).

## 3. New capability: SceneSequencer meta-composition (high-value, net-new)
Many creators (CodingFab especially) chain 4–7 discrete scenes per Short (hero →
comparison → chart → stat → CTA). We have lots of atomic templates but NO orchestrator
that stitches them into a full Short with transitions. Build a `SceneSequencer9x16` that
takes an ordered list of {comp, props, durationInFrames, transition} and renders a
complete multi-scene video. This unlocks "one script → full Short" instead of single
beats. (CodingFab's ProductExplainerHeroSequence is the canonical test case.)

## 4. Codex review of THIS session's new work (not yet reviewed)
Run a Codex (gpt-5.5 high) pass over: the 4 new CodingFab comps, the 4 footage-well
edits, the AbhiWaveform transcript variant, and the gallery/source-map changes. Build
contact sheets via `scripts/build-codex-review-sheets.py`, pipe to
`codex exec -m gpt-5.5 -c model_reasoning_effort=high`. Verify findings against ground
truth before applying (iter-2 once had a false "all videos broken" positive).

## 5. AbhiWaveform transcript variant — wire it up
The `showTranscript`/`transcript` props were ADDED (default off, consumers unaffected)
but never rendered/shown. Render a transcript-on demo and add it to ABHI-COMPARE.html so
the variant is visible (Codex's original #3 suggestion).

## 6. More reference creators (when wanted)
- `CREATORS.md` "Candidate pool" has un-scraped creators.
- `motiondarwin` + `zenzuke` scrapes stayed IP-throttled — re-attempt from a fresh IP /
  authenticated cookie.

---

### Quick resume commands
- Rebuild gallery: `./scripts/build-cross-creator-gallery.py`
- Render N comps (bundle once): `npx tsx src/autoedit/runCrossCreatorReplicas.ts "Comp1,Comp2"`
- Typecheck: `npx tsc --noEmit`
- Scrape a YouTube creator's shorts: `npm run scrape:shorts -- --handle <handle> --count 24`
- Extract keyframes: `npm run analyze:creator -- --handle <handle>`
- Galleries to open: `CROSS-CREATOR-COMPARE.html` (59 pairings), `ABHI-COMPARE.html` (23)
