# CodingFab (@CodingFab) — ANALYSIS

**Platform:** YouTube (Shorts 9:16 + long-form 16:9) · **Added:** 2026-06-25
**Sample:** 24 Shorts scraped, 192 keyframes (8/video). Source videos deleted per
project policy; frames retained under `references/creators/codingfab/<id>/frames/`.
**Method:** 24 parallel Opus agents (one per Short) + 1 synthesis agent, judged
against our 121-composition inventory. Raw data: [SYNTHESIS.md](../../../docs/research/codingfab/SYNTHESIS.md).

---

## Who they are

English-language AI / coding / dev-tools channel. Two content modes:
1. **Fast-cut tech explainers** — AI models (Claude, DeepSeek, OpenRouter, Hugging
   Face), "15 programming languages" syntax/use-case comparisons, dev-tool news
   (Vercel, Cloudflare, GitHub, Vite), AI/ML/DL concept hierarchies, cybersecurity.
2. **"Build an app from scratch" Shorts** — React World-Cup game, trading simulator,
   hacker-defense arcade (screen-recording + procedural UI walkthrough).

Directly on-topic for our @armandointeligencia AI/coding vertical typology.

## House style (recurring across the 24 Shorts)

- **Dark near-black / deep-navy backgrounds** with accent-colored overlays.
- **Bold sans hero headlines** (Inter-like), often two-tone with one accent word.
- **Signature: a thin colored UNDERLINE rule** that wipes in under titles/stats
  (red/pink/gold) — the channel's single most recognizable motion trait.
- **Kinetic text entry** (scale/slide-in), staggered reveals, quick fades/cuts.
- **Accent palette:** cyan `#00D9A3` + gold + coral/red, on dark.
- **Multi-scene orchestration:** most Shorts chain 4–7 discrete scenes (hero →
  comparison → chart/diagram → stat → CTA) rather than one monolithic template.
- **Strong existing-vocabulary overlap:** comparisons, bar charts, counters,
  terminals, code, tier lists, pipelines, ML-stack diagrams — most of which our
  121-composition library already covers.

## Coverage verdict

Of 9 deduped distinct patterns: **13 of 24 videos map entirely to existing comps**
(comparison, counter, bar chart, kinetic title, tier list, pipeline, code/terminal).
The genuinely-novel, atomic, *procedural* (non-footage, non-sequencer) patterns →
**4 new templates built**. The rest were honestly classed as non-atomic and NOT
manufactured into templates (see "Not built").

## Built (4 new templates — navy/gold/cream rebrand, dark-default, 9:16, registered in Root.tsx)

| Template | Fills the gap | Source reel |
|---|---|---|
| `ConcentricHierarchyRadialCallout9x16` | nested **containment** rings + radial callouts (we had Venn/Force/Decision/Pipeline but no concentric-containment diagram) | `XrGDv4D6_ak` (AI⊃ML⊃DL) |
| `MetricBarsComparisonCard9x16` | per-item **multi-metric** bar grids (denser than single-series BenchmarkBars / ModelComparison2x2Grid) | `EePNWETYVYA` (15-languages) |
| `StatCardSequenceWithUnderlines9x16` | CodingFab's signature animated **colored-underline** stat reveal sequence | `lz0ddzEUTJQ` (Tokenmaxxing) |
| `AppScreenCarousel9x16` | procedural multi-**screen** phone-mockup walkthrough (FauxProductUI is single-screen only) | `nxDVmkv_A-U` (trading sim) |

Each is rendered to `output/cross-creator/<comp>.mp4` and added to the cross-creator
comparison gallery (head-to-head vs the CodingFab source frames it was built from,
pinned in `docs/research/cross-creator/source-map.json`).

## Not built (honest — covered / non-atomic)

- **GameProgressWalkthrough** — gameplay screen-recording + overlay (footage, not a
  procedural template).
- **ProductExplainerHeroSequence** — a multi-scene *sequencer* of existing comps
  (hero → comparison → screenshot → stat → CTA); belongs to a scene-stitcher, not one
  atomic template.
- **ComparisonFeatureExplainer**, **InteractiveUICarouselComparison** — covered by
  existing kinetic-title + comparison + callout combinations.
