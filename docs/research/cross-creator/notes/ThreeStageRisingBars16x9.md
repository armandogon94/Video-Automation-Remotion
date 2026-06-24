# ThreeStageRisingBars16x9 ↔ natebjones

**Creator pattern:** rising staged bars / N2 (ANALYSIS.md §2 N2).
**Reference frames:** `references/creators/natebjones/ogTLWGBc3cE/frames/anim-01-frame-001-t425s.jpg` — THE rising-tower reference: three boxes (THEN/NOW/NEXT) with a label-stack below each (uppercase tag + headline + sub-label), full thin accent outlines, the active NOW column highlighted cyan, left-edge bookshelf+glasses watermark, handle chip bottom-right. (zP6TnEiueEc anim-01@100s turned out to be the equation pattern, not bars.)

## Signature pattern
Three uppercase-labeled "chronology" towers reveal left-to-right; each rises baseline→target with a soft ease-out while its accent border draws in. Heights are NARRATIVE (categorical small/medium/large), not measured data. A caption pill with one orange keyword fades in last.

## What matches (our render)
- Three rising towers, accent translucent fill + drawn accent border (orange/gold/cyan), uppercase tracked white labels BELOW each tower — matches the labeled-tower structure.
- Motion: frame-1 (t=0.5s) shows tower 1 placed + tower 2 mid-rise + tower 3 absent → left→right staggered rise + border-draw, exactly the N2 transitionVerb. Caption pill ("Each wave compounds the last", "compounds" orange) fades in last.
- Accent discipline tracks Nate's palette; dark-slate slab + handle chip bottom-right.

## What differs (reasonable generic-template choices)
- **Heights:** ours is strictly ascending (THEN<NOW<NEXT); Nate's reference emphasizes the MIDDLE (NOW tallest) as the "current" beat. Both are valid chronologies; our default copy ("each wave compounds the last") justifies ascending, and heightLevel is per-bar configurable.
- **Labels:** ours has a single uppercase label per tower; Nate's stacks label + headline + sub-label below each tower. Ours is simpler but captures the "uppercase-labeled tower" core the N2 spec names.
- No left-edge watermark (chassis handle chip only — consistent with the other Nate comps).

## Verdict
Faithful capture of the N2 rising-tower pattern — three labeled towers, L→R staggered rise, border-draw, caption pill with orange keyword, correct accent band. **No edit — VALIDATE.**

**Score: 8/10**

## Recommendation (optional, not made)
Could add an optional headline + sub-label slot beneath each tower and an "emphasize middle" height preset to more closely echo Nate's NOW-tallest chronology frame. Not a defect; deferred.

---

## DEEP QA re-pass (cross-creator2, vs `_fresh/` frames)

Re-extracted 4 evenly-spaced frames (t=0.6/1.6/2.8/4.6s) from `output/cross-creator/ThreeStageRisingBars16x9.mp4` and re-read them against the natebjones signature pattern.

**Motion timing confirmed across the 4-frame sweep:**
- t=0.6s — tower-1 (orange) placed with its border fully drawn + label "THEN"; tower-2 (gold) is mid-rise with NO border yet; tower-3 absent. This is exactly the L→R staggered rise + border-draw-after-rise grammar.
- t=1.6s — all three towers placed (THEN<NOW<NEXT ascending), borders drawn, NO caption pill yet.
- t=2.8s & 4.6s — full layout holds steady WITH the caption pill ("Each wave **compounds** the last", "compounds" tinted orange) — pill lands last. Correct beat ordering.

**Palette/structure note (skeptic check):** Sampled bg RGB. Nate's `_fresh` slate is a near-neutral charcoal ~RGB(21–31,27–40) with a subtle radial brighten toward bottom-right (→45,58,75). Ours is flat brand deep-navy `#0F1B2D` ≈ RGB(15,26,44) — more saturated blue, no gradient. This is the documented intentional brand divergence (navy/gold) and is owned by the shared `DarkSlateChassis16x9`, NOT this comp. The flat-vs-radial slate is the same observation logged on the other Nate 16:9 comps; not a per-comp defect.

**Skeptic check on the "stacked label" recommendation:** Nate DOES stack kicker+headline+subline inside cards — but that is the *PipelineFlow* card pattern (frames 005/006/012), NOT the rising-bars beat. For the bars beat (single THEN/NOW/NEXT chronology labels), our single uppercase label is the correct, restrained read. The deferred recommendation stays deferred — adding stacked labels here would blur the N2 bars pattern into the H7 flow pattern.

**Verdict unchanged: VALIDATE, no edit. Score 8/10.** Faithful N2 capture; remaining gap (flat slate vs Nate's radial charcoal) is a deliberate brand choice living in the shared chassis.
