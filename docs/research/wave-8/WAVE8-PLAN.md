# Wave 8 — Plan: toward "give me a talking-head video, get a finished edit"

> **North star (the future capability the user described 2026-05-30).** Given a vertical OR horizontal video of the user talking to camera, the pipeline should:
> 1. **Transcribe** the audio (faster-whisper, already wired) and burn **configurable-placement floating subtitles** (bottom-center / center / custom).
> 2. **Add motion graphics that illustrate the points** — both as (a) *cutaway B-roll* (monotone/colored background + motion graphic) and (b) **overlays composited ON TOP of the speaker** while they keep talking.
> 3. **Know when to cut** to B-roll vs. stay on the speaker.
> 4. **Trim dead air** — silences / non-talking stretches.
>
> Wave 8 does NOT build the orchestration yet. It builds the **templates + components** that make the above possible later, plus closes two analysis/coverage gaps.

---

## Current state (2026-05-30)
- 104 compositions registered · tsc clean · 22 creators analyzed.
- Aspect split: **20× 16:9, 65× 9:16, 19 starter/other.**
- 5 new templates already render cleanly with real story content (see `output/test-videos/index.html`).

---

## Workstream 1 — Motion-graphics-OVER-speaker (the strategic core)
**Gap:** our 16:9 lane treats motion graphics as full-screen cutaway scenes. Hormozi (and Adam Rosler, and the user's own future content) also composite graphics *over* the live talking-head: lower-thirds, floating stat pops, kinetic word callouts beside the head, arrows/circles annotating, list items building over the speaker. This is only mentioned in passing in `alexhormozi/ANALYSIS.md:6`, never developed.

- **1a (analysis, network):** Re-download a few Hormozi talking-head videos + analyze keyframes specifically for over-speaker overlay moments. Output: `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` cataloging the distinct over-speaker overlay patterns (each with a transitionVerb + anchor) and proposing concrete overlay components. Extend to Adam Rosler if time.
- **1b (build, after 1a):** A `SpeakerOverlayScene{16x9,9x16}` foundation composition: full-bleed base `videoSrc` (the speaker footage) + a caption layer + a slot for overlay molecules. Then the specific overlay molecules from 1a (e.g. `FloatingStatPop`, `KineticWordCalloutOverSpeaker`, `ArrowCircleAnnotation`, `BuildingListOverSpeaker`). These render with the base video so they composite onto real footage.

## Workstream 2 — Configurable floating subtitles (future-vision enabler, buildable now)
- `FloatingCaption` component: consumes whisper `wordTimings`, renders karaoke/sentence captions with **configurable position** (`bottom-center` default, `center`, `top`, `custom {x,y}`), width cap, and register (per ADR-002). Works over a base video. This is the subtitle half of the north star.

## Workstream 3 — 9:16 → 16:9 adaptation (the big parallel build)
Per ADR-001 §4, build 16:9 siblings for content-type templates that read horizontally. **Candidate set (~16), priority-ordered:**
| Priority | 16:9 sibling | Port from |
|---|---|---|
| High | BigNumberHero16x9 | BigNumberHero9x16 |
| High | TweetCardHero16x9 | TweetCardHero9x16 |
| High | BarChartList16x9 | BarChartList9x16 |
| High | AnimatedTable16x9 | AnimatedTable9x16 |
| High | DecisionTree16x9 | DecisionTree9x16 |
| Med | LineChartAnnotated16x9 | LineChartAnnotated9x16 |
| Med | Sparkline16x9 | Sparkline9x16 |
| Med | BenchmarkBars16x9 | BenchmarkBars9x16 |
| Med | LayerCardStack16x9 | LayerCardStack9x16 |
| Med | DiagramExplainer16x9 | DiagramExplainer9x16 |
| Med | KineticEssay16x9 | KineticEssay9x16 |
| Med | VennDiagram16x9 | VennDiagram9x16 |
| Med | ForceGraph16x9 | ForceGraph9x16 |
| Med | NeuralNetwork16x9 | NeuralNetwork9x16 |
| Low | RankedTierList16x9 | RankedTierList9x16 |
| Low | TestimonialCard16x9 | TestimonialCard9x16 |

**9:16-locked (NO sibling, per ADR-001 §4.2):** Outro/Poll/YouTubeEndCard/YouTubeCalloutArrows, Terminal/Editor/CodeDiff blocks, AgentThinking/TokenStream/AttentionHeatmap (interpretability), Camcorder/GeminiFrameWrapper/KeyedFounderOverBroll/GenerativeBrollWithDiegeticUI/IllustratedConcept/WhiteboardScene (b-roll wrappers), BrandedOpener/BrollListicle/LockedFeatureRow/PricingTierCard/FauxProductUI/NewsClipCitation/AppConnect/TweetCard/CircularLogoCarousel (Shorts-grammar). `*9x16Dark` variants get ONE 16:9 sibling, not two.

## Workstream 4 — Render + visually validate ALL untried templates
Extend `output/test-videos/` gallery to cover every new/untried template; visually inspect each frame vs. its reference clip; **improve any that diverge materially** from the reference look. (5 done + validated so far.)

---

## Execution model
- Network: only the Workstream-1a research agent (≤3 cap respected). Sequential download-extract-delete, hygiene rules, read `analyzed-videos.json`.
- Code agents build self-contained files; main session owns all `Root.tsx` registration (avoids the shared-file race).
- 16:9 siblings are independent → batch 4–6 agents at a time across waves.
- Validate-render after each build wave; fix divergences.

## Sequencing
1. **Now:** kick 1a (Hormozi over-speaker analysis, background) + build Workstream-2 `FloatingCaption` + Workstream-1b `SpeakerOverlayScene` foundation + first 3–4 Workstream-3 siblings.
2. **Next:** register + validate-render + commit; build over-speaker molecules from 1a; continue sibling waves.
3. **Later (north star):** the auto-edit orchestration (transcribe → subtitle → graphics-placement → B-roll-cut → silence-trim).
