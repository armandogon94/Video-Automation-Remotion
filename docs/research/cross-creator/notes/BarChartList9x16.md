# BarChartList9x16 ↔ sahilbloom

**Creator:** @sahilbloom — HorizontalBarRankedList (editorial restraint, single accent).
**Reference:** The scraped frames at `references/creators/sahilbloom/0Q0vWA1xH_0/frames/anim-00-coarse-*` and `anim-01-dense-*` are all plain talking-head karaoke-caption Shorts (skipped per brief). The canonical bar pattern is documented in `references/creators/sahilbloom/ANALYSIS.md` §P4 "HorizontalBarRankedList16x9" (seen in video `lAg2-wWR5wU`, not frame-scraped here).

## Signature pattern (ANALYSIS.md §P4)
- Title top-left with a thin vertical separator on the left.
- 4–5 horizontal bars stacked left-aligned, descending in BOTH width AND color hierarchy (longest red, then green, blue, yellow).
- Bars have rounded ends. Sparse layout, no labels visible during reveal. Cream background.
- Motion: each bar grows width 0→final via L→R scaleX over ~12 frames eased-out cubic; bars stagger top-to-bottom at ~8-frame intervals; title fades in ~4 frames before the first bar.

## What matches (our "BENCHMARKS · 2026 / MODELOS" render)
- Horizontal bars, left-aligned mono labels (GEMINI 3.2 / GPT-5.5 / CLAUDE 4.7), rounded ends (BAR_RADIUS 12), cream background — exact structural match.
- Staggered top-to-bottom reveal (`staggerEntry` accelerating cascade) + width 0→final fill with `outQuart` easing — matches "L→R scaleX eased-out cubic, top-to-bottom stagger".
- Title/eyebrow fades in before the first bar (header 0→0.4s, bars start at 0.4s) — matches "title fades in before first bar".
- Sparse layout, generous negative space, single-accent monochrome discipline — matches Sahil's "one accent color per video" editorial restraint (ANALYSIS.md line 16/171).

## What differs (and why it's acceptable)
- **Title placement:** ours is centred (BrandBreadcrumb + centred section eyebrow); Sahil's is top-left with a left vertical separator rail. This is our consistent house grammar across the BarChart/eyebrow family, not a defect — the left-rail title is one creator's specific chrome.
- **Color hierarchy:** Sahil uses red/green/blue/yellow per row; ours is monochrome red. Per ANALYSIS.md line 171 our brand deliberately leans single-accent editorial — monochrome is MORE on-brand for us than a rainbow. The schema's per-bar `color` prop means the template *can* do multi-color; the cross-creator data just didn't.
- **Descending width:** Sahil's bars descend monotonically (ranked). Ours render in caller order (92 / 100 / 95, not sorted). This is the one genuinely Sahil-defining gesture we don't reproduce — but ANALYSIS.md §P4 itself prescribes the ranked-descending look as a NEW distinct `mode: "rankedReveal"`, NOT a change to this generic `BarChartList`. Force-sorting here would break the template's caller contract (callers may want a deliberate, non-value order).

## Score: 8/10 — VALIDATED (no edit)
Faithful capture of the transferable signature: horizontal rounded bars, left labels, sparse cream layout, single-accent discipline, and the stagger + L→R fill motion beat. The only un-reproduced Sahil gesture (descending-width ranked + multi-color rows) is, per ANALYSIS.md §P4, explicitly a separate future `rankedReveal` mode — out of scope for this base template and unsafe to force-sort here.

## Recommendation (NOT made — would change template contract / belongs in a new mode)
Add a `mode: "rankedReveal"` to `BarChartList9x16` that (a) sorts bars descending by value and (b) optionally drives an N-step color ramp across rows, to fully reproduce Sahil's §P4 ranked look as an opt-in. Leave default behaviour (caller-ordered, monochrome) unchanged.
