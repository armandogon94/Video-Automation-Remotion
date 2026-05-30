# Video Template Portfolio — @armandointeligencia
*15 templates for weekly Spanish-language AI/tech content, 1080×1920, 30–60s*
*Anti-aesthetic: cream paper `#FAF7F2` / ink-gray `#1A1A1A` / warm-red `#B33A2A` / Inter + Georgia*

> Research Stream E · 2026-05-18 · Opus deep research.

## Summary Table

| # | Slug (ES) | Category | Complexity | Motion Intensity | Asset Weight | Duration | Primary use |
|---|---|---|---|---|---|---|---|
| 1 | **QuoteCard** | quote / source | 1 | Low | Light (1 portrait + 1 quote) | 25–35s | Primary-source pull-quote |
| 2 | **BigNumberHero** | data / stat | 1 | Low–Mid | Light (number + 1 caption) | 20–30s | Single jaw-drop stat |
| 3 | **TechNewsFlash** | news / launch | 2 | Mid | Light (overlays only) | 35–45s | Leak / announcement *(EXISTING)* |
| 4 | **HotTake** | opinion / contrarian | 2 | Mid | Light (avatar + chip) | 30–40s | "Mi lectura" hot take |
| 5 | **Listicle5** | education / roundup | 2 | Mid | Mid (5 icons/logos) | 40–55s | Rapid-fire 5-item list |
| 6 | **FAQMythbuster** | education / Q&A | 2 | Mid | Light (text only) | 35–45s | Bust a viral myth |
| 7 | **PrediCtion** | forecast / agenda | 2 | Mid | Light (calendar grid) | 30–45s | Week-ahead forecast |
| 8 | **BeforeAfter** | comparison / transformation | 3 | Mid | Mid (2 screenshots / B-roll) | 30–40s | Split-frame transformation |
| 9 | **ComparisonTable** | comparison / matrix | 3 | Mid | Mid (2 logos + rows) | 40–55s | Two tools head-to-head |
| 10 | **ToolReview** | review / case | 3 | Mid | Mid (3–5 screenshots) | 45–60s | Pricing + features verdict |
| 11 | **TimelineRecap** | recap / news | 3 | Mid–High | Mid (4–7 thumbnails) | 45–60s | Week-in-review montage |
| 12 | **CaseStudy** | case / founder story | 3 | Mid | Mid (1 portrait + 2 stats) | 45–60s | Real founder example |
| 13 | **TutorialMicro** | how-to / education | 4 | High | Heavy (screen recording) | 40–60s | 30–60s how-to with overlay |
| 14 | **ChartReveal** | data viz / analysis | 4 | High | Mid (data JSON) | 35–50s | Animated chart-driven story |
| 15 | **DiagramExplainer** | education / systems | 5 | High | Heavy (SVG diagram) | 45–60s | Animated mechanism explainer |

**Build order: complexity 1→2 first** (covers 7/15 templates and ~60% of weekly stories), then 3, 4, 5 as the calendar demands them.

---

## Build-order recommendation

**Sprint 1 — Complexity 1**
Build `QuoteCard` + `BigNumberHero` — they reuse 80% of `TechNewsFlash9x16` infrastructure (overlay + caption renderers). 3 templates in active rotation within one sprint.

**Sprint 2 — Complexity 2**
Order by calendar demand: `HotTake` (opinion lane) → `Listicle5` (roundups) → `FAQMythbuster` (debunks) → `PrediCtion` (Monday agenda). Covers full week-of-stories typology.

**Sprint 3 — Complexity 3**
`BeforeAfter`, `ComparisonTable`, `ToolReview`, `TimelineRecap`, `CaseStudy` — multi-panel layouts + asset-heavy. Build only when a specific story routes there. Don't pre-build speculatively.

**Sprint 4+ — Complexity 4–5**
`TutorialMicro`, `ChartReveal`, `DiagramExplainer` — deep investments (1–2 day builds each). Defer until 4+ weeks of content has shipped on simpler templates.

---

## Coverage check

Every story in the W21 content calendar routes to a template here without re-authoring:
- Gemini 3.2 Flash leak → `TechNewsFlash` ✓ (already built)
- Pichai I/O quote → `QuoteCard`
- Antigravity hot take → `HotTake`
- Weekly recap → `TimelineRecap`
- MCP explainer → `DiagramExplainer`

The 15 templates cover every story-type listed in VOICE.md §7.

---

## Detailed template specs

> Each template's full spec (story spine, visual structure, typography hierarchy, motion techniques, assets needed, complexity, example story, Zod props schema) is preserved in the original Stream E report. Reproduced in full above for the highest-priority templates as the build proceeds. Full reference: agent output 2026-05-18.

### Complexity 1 templates (build first)

**QuoteCard** — primary-source pull-quote with avatar/portrait bottom-right, Georgia italic quote (88pt centered), warm-red quotation marks, attribution slug. Motion: marker sweep on quote marks, split-text reveal on quote text, slide-up attribution, chip pulse, CTA scale-in. Props schema includes `quote`, `author`, `source`, `date`, `portraitUrl`, `contextLine`, `tag: "CITA" | "OPINIÓN"`.

**BigNumberHero** — single huge number (360px Inter 900) with unit prefix/suffix, subtitle, context body, optional comparison strikethrough. Motion: counter ramp (odometer animation 0→target in 0.6s), scale-in spring, rule sweep (warm-red underline), strike-through animation, shrink-pivot. Props: `number`, `unitPrefix`, `unitSuffix`, `subtitle`, `contextLines`, `comparison`, `tag: "PRECIO" | "BENCHMARK" | "LATENCIA" | "TAMAÑO"`.

### Complexity 2 templates

**HotTake** — `OPINIÓN` chip swaps to `MI LECTURA`, consensus take in Georgia italic strikethrough, bulleted mechanism with warm-red square markers, implication in 78px, Georgia italic sign-off. Avatar pose swap (neutral → confident). Props: `hookText`, `consensusText`, `bullets[]`, `implicationText`, `signoffText`, `avatarUrlNeutral`, `avatarUrlConfident`.

**Listicle5** — title card (480px `5`), 5 items each with `0N` badge, item title (92px), body (44px), optional logo. Synthesis screen at end. Motion: number reveal flip, marker sweep under titles, counter advance, page wipe between items, synthesis stacking. Props: `hookTitle`, `items[5]`, `synthesisLine`.

**FAQMythbuster** — `MITO` chip + viral claim with strikethrough draw-in → `REALIDAD` chip swap → mechanism lines (78px, 3 lines cross-fade) → implication (64px) → source pin. Props: `mythText`, `realityLines[3]`, `implicationText`, `sourceLabel`.

**PrediCtion** — week label + hook + 3 events with day-pill badges (`LUN 19`), event title (78px), why (38px). Mini-calendar grid showing highlighted days. Props: `weekLabel`, `weekRangeLabel`, `events[3-4]`, `calendarLabel`.

### Complexity 3 templates

**BeforeAfter** — vertical split (1080×960 top `ANTES` / 1080×960 bottom `AHORA`), sweep marker traversing diff points, panel collapse (`ANTES` slides up, `AHORA` fills frame with corner thumbnail). Props: `beforeAssetUrl`, `afterAssetUrl`, `sweepMarkerCoords`, `implicationText`.

**ComparisonTable** — 2 logos + `VS` chip, 2-column matrix with 4-6 rows, winner-marker (warm-red dot), verdict split (`USA CLAUDE PARA:` / `USA GPT PARA:`). Props: `left`, `right`, `rows[]`, `verdict`.

**ToolReview** — tool logo + snapshot metadata (categoria/precio/stack/veredicto), 3 pros + 1-2 cons cards with check/X stamps, verdict split. Props: `tool`, `pros[]`, `cons[]`, `verdict`.

**TimelineRecap** — vertical timeline with day-pills, thumbnails, headlines, auto-scroll synced to voice-over, active-event highlight (warm-red border + scale 1.04), synthesis overlay. Props: `events[4-7]` (each with `narrationStartSeconds`, `narrationEndSeconds`), `synthesisText`.

**CaseStudy** — founder portrait + situation card, stack card (3-5 tools with logos), result card (before → arrow → after with delta), transferable lesson. Props: `founder`, `baseline[3]`, `stack[3-5]`, `result[]`, `lessonText`.

### Complexity 4-5 templates

**TutorialMicro** — `TIP` chip + 4-step screen recording with annotated callouts (warm-red circles + arrows), final result delta. Props: `steps[3-5]` (each with `recordingUrl`, `annotations[]`), `result`.

**ChartReveal** — animated SVG chart with axes draw-in, data line stroke-dasharray draw, milestone dots, inflection vertical rule, forecast extension (dotted), implication line. Props: `chart.points[]`, `chart.inflection`, `chart.forecast`.

**DiagramExplainer** — `MECANISMO` chip, faint warm-red grid, 3-7 nodes appearing one at a time with Georgia italic simile captions, SVG arrows drawing between nodes, data-packet traversal demo, whole-diagram dim + implication hero. Props: `nodes[]`, `edges[]`, `dataPacketPath[]`.

---

> Full props schemas, motion technique details, and example stories preserved in agent output (~7000 words). This file is the executive summary; consult the agent output for implementation specs.
