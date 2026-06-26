# Visual Audit From Codex

Audit run from repo root on 2026-06-25. I parsed `CROSS-CREATOR-COMPARE.html` and `ABHI-COMPARE.html`, probed every referenced video, extracted dense frames at 5 fps into `/tmp/audit`, and reviewed source-vs-render contact sheets. For ABHI rows, the source scene video is treated as the ground truth across the full source duration, including source-only tail frames when our render ends earlier. Intentional brand palette, copy, language, and placeholder-media differences were not counted.

No missing media, wrong aspect-ratio render, mojibake, blank full-video render, or opaque `background-clip:text` rectangle was found. The main failures are timing/tail mismatches in ABHI and a smaller set of CROSS layout/fidelity issues.

## Summary

| CompId | gallery | verdict | worst severity |
|---|---|---:|---:|
| RankedTierList9x16 | CROSS | OK | - |
| TerminalBlock9x16 | CROSS | OK | - |
| ForceGraph9x16 | CROSS | ISSUES | MEDIUM |
| AnimatedCounter9x16 | CROSS | OK | - |
| BigNumberDuel9x16 | CROSS | ISSUES | HIGH |
| DecisionTree9x16 | CROSS | OK | - |
| EditorBlock9x16 | CROSS | OK | - |
| IllustratedConcept9x16 | CROSS | OK | - |
| KineticTypoCard9x16 | CROSS | OK | - |
| LockedFeatureRow9x16 | CROSS | OK | - |
| NeuralNetwork9x16 | CROSS | OK | - |
| PipelineFlow9x16 | CROSS | OK | - |
| TerminalCommand9x16 | CROSS | OK | - |
| TitledDossierCard9x16 | CROSS | OK | - |
| TokenStream9x16 | CROSS | OK | - |
| EquationCardChain16x9 | CROSS | OK | - |
| BeforeAfterText16x9 | CROSS | OK | - |
| TopHeroBottomTrioCards16x9 | CROSS | OK | - |
| ThreeStageRisingBars16x9 | CROSS | OK | - |
| ThreeRowLabeledCardStack16x9 | CROSS | OK | - |
| PipelineFlow16x9 | CROSS | OK | - |
| KaraokeWithBlueChipPullout9x16 | CROSS | OK | - |
| BigNumberHero9x16 | CROSS | OK | - |
| BarChartList9x16 | CROSS | OK | - |
| BenchmarkBars9x16 | CROSS | OK | - |
| BigNumberHorizontalBars16x9 | CROSS | OK | - |
| TitleCardKineticTwoLine16x9 | CROSS | OK | - |
| KineticEssay9x16 | CROSS | OK | - |
| BrollListicle9x16 | CROSS | OK | - |
| GenerativeBrollWithDiegeticUI9x16 | CROSS | OK | - |
| LineChartAnnotated9x16 | CROSS | OK | - |
| TweetCardHero9x16 | CROSS | OK | - |
| TechNewsFlash9x16 | CROSS | ISSUES | LOW |
| QuoteCard9x16 | CROSS | OK | - |
| BrandedOpener9x16 | CROSS | OK | - |
| DiagramExplainer9x16 | CROSS | OK | - |
| VennDiagram9x16 | CROSS | ISSUES | MEDIUM |
| LayerCardStack9x16 | CROSS | OK | - |
| Listicle | CROSS | ISSUES | MEDIUM |
| TalkingHead | CROSS | OK | - |
| StudioCompositor16x9 | CROSS | ISSUES | HIGH |
| KeynoteSlidePIP16x9 | CROSS | OK | - |
| SplitWebcamScreen9x16 | CROSS | OK | - |
| TalkingHeadDynamic9x16 | CROSS | OK | - |
| BuilderDropPoster9x16 | CROSS | OK | - |
| ModelComparison2x2Grid16x9 | CROSS | OK | - |
| OpeningTitleCard9x16 | CROSS | OK | - |
| MatrixGridHeatmap9x16 | CROSS | OK | - |
| DocumentHighlightSwipe16x9 | CROSS | OK | - |
| PaintStrokeRibbonBanner16x9 | CROSS | OK | - |
| SpectrumSlider9x16 | CROSS | OK | - |
| BeforeAfterSliderWipe9x16 | CROSS | OK | - |
| ModelNameChipComparison9x16 | CROSS | OK | - |
| RingTopologyHopCounter9x16 | CROSS | OK | - |
| RotatingVectorDial9x16 | CROSS | OK | - |
| ConcentricHierarchyRadialCallout9x16 | CROSS | OK | - |
| MetricBarsComparisonCard9x16 | CROSS | OK | - |
| StatCardSequenceWithUnderlines9x16 | CROSS | OK | - |
| AppScreenCarousel9x16 | CROSS | OK | - |
| AbhiTitleCard | ABHI | ISSUES | HIGH |
| AbhiBigStat | ABHI | ISSUES | HIGH |
| AbhiTerminalCard | ABHI | OK | - |
| AbhiFeatureGrid | ABHI | OK | - |
| AbhiFeatureRows | ABHI | ISSUES | MEDIUM |
| AbhiGridVsTerminal | ABHI | ISSUES | HIGH |
| AbhiCtaComment | ABHI | OK | - |
| AbhiBrandLockup | ABHI | OK | - |
| AbhiBrowserMockup | ABHI | ISSUES | LOW |
| AbhiKineticSubtitle | ABHI | ISSUES | MEDIUM |
| AbhiNodeGraph | ABHI | ISSUES | HIGH |
| AbhiBarChart | ABHI | ISSUES | HIGH |
| AbhiPhoneMockup | ABHI | ISSUES | HIGH |
| AbhiComparisonTable | ABHI | ISSUES | MEDIUM |
| AbhiChecklist | ABHI | ISSUES | HIGH |
| AbhiTwoColumn | ABHI | OK | - |
| AbhiScrambleOpener | ABHI | ISSUES | MEDIUM |
| AbhiQuoteCard | ABHI | ISSUES | HIGH |
| AbhiTweetCard | ABHI | OK | - |
| AbhiWaveform | ABHI | ISSUES | HIGH |
| AbhiAppCard | ABHI | ISSUES | MEDIUM |
| AbhiLineChart | ABHI | ISSUES | HIGH |
| AbhiCodeDiff | ABHI | ISSUES | HIGH |

## Issues

### ForceGraph9x16

- [MEDIUM] `ForceGraph9x16`, `our-0005 @0.8s` through end: source keyframes show a force graph with visible links/edges between nodes; our render reveals a disconnected bubble cluster, so the graph reads as separate dots rather than a connected network. Fix by drawing persistent node-link edges and animating them with the node reveal.

### BigNumberDuel9x16

- [HIGH] `BigNumberDuel9x16`, worst at `our-0010 @1.8s`, persists through final hold: the two oversized values collide in the center. `$0.25` and `$3.74/$3.75` visually merge into a single unreadable string, and the second dollar sign overlaps the center gap. Fix by reducing the numeral size or enforcing fixed left/right columns with a larger gutter and a clear `VS` divider.

### TechNewsFlash9x16

- [LOW] `TechNewsFlash9x16`, `our-0001 @0.0s` onward: a thin red strip is visibly clipped at the top-left edge, separate from the intended lower progress rail. Fix by keeping the red bar/tag inside the top safe area or clipping it during entry.

### VennDiagram9x16

- [MEDIUM] `VennDiagram9x16`, `our-0012 @2.2s` through `our-0025 @4.8s`: the lower Venn group is oversized and too low. The orange/green circles run off canvas, and the `VELOCIDAD` label clips against the left edge. Fix by scaling the circle group down and shifting it up/right so labels remain inside a 48-64 px safe area.

### Listicle

- [MEDIUM] `Listicle`, `our-0011 @2.0s` through `our-0025 @4.8s`: source/reference pattern shows a multi-item list/card stack, but our 5-second render stalls after title plus a single item despite the "Top 5" framing. Fix by pacing the reveal so more list items enter within the comparison clip, or by changing the row/source to a single-item listicle reference.

### StudioCompositor16x9

- [HIGH] `StudioCompositor16x9`, all frames, worst around `our-0010 @1.8s`: source is a dark compositor/studio UI with presenter PIP and a large style-picker/mockup screen. Our render is a branded avatar/logo scene with no main UI mockup structure, so it misses the core composition. Fix by restoring a large floating UI/screen gallery, keeping the presenter PIP, and reducing/removing the giant avatar/logo fill.

### AbhiTitleCard

- [HIGH] `AbhiTitleCard`, `our-0003 @0.4s`: source has a browser/quota card at the top plus the title-card headline below; our render is a standalone title card without the browser-card layer. Fix by adding the browser/quota layer and matching the source tail transition, or remap the source scene to a pure title-card segment.

### AbhiBigStat

- [HIGH] `AbhiBigStat`, `source-0020 @3.8s`: source transitions from the 99% stat into an app/infinite-memory outro. Our render stays on the big-stat card for the whole clip. Fix by adding the app/infinite-memory tail or trimming/remapping the source to the isolated stat beat.

### AbhiFeatureRows

- [MEDIUM] `AbhiFeatureRows`, `our-0008 @1.4s`: our CTA chip appears much earlier than the source row/chip progression. Fix by delaying the CTA until after the row cascade reaches the same point as the source.

### AbhiGridVsTerminal

- [HIGH] `AbhiGridVsTerminal`, `source-0056 @11.0s`: source changes into a second "Personal use only" section, while our render remains on the split GUI/terminal composition. Fix by implementing the source tail scene or shortening/remapping the source to only the split-screen section.

### AbhiBrowserMockup

- [LOW] `AbhiBrowserMockup`, `our-0012 @2.2s`: matched frames are close, but our render has one extra held frame and the browser stack sits slightly high against the source. Fix by trimming to the 2.2s source duration and lowering the browser stack a few pixels.

### AbhiKineticSubtitle

- [MEDIUM] `AbhiKineticSubtitle`, `our-0013 @2.4s`: source has a large diagonal `OBSOLETE` stamp pop before settling; our render only shows a smaller settled stamp treatment. Fix by adding the big diagonal stamp pop/settle animation.

### AbhiNodeGraph

- [HIGH] `AbhiNodeGraph`, `our-0001 @0.0s` and `source-0026 @5.0s`: source starts in a held, labeled node/graph state and continues into a `MYTHOS` tail through 8.0s. Our render starts from an empty/brand reveal, lacks the same labeled node/edge drawing, and ends at 5.0s. Fix by matching the labeled graph state/timing and extending the timeline to the full 8s source duration.

### AbhiBarChart

- [HIGH] `AbhiBarChart`, `source-0026 @5.0s`: source runs 6.0s and includes a fade/text tail after the bar chart. Our render ends at 5.0s before those frames. Fix by extending to 6.0s and adding the final fade/text transition.

### AbhiPhoneMockup

- [HIGH] `AbhiPhoneMockup`, `our-0006 @1.0s`: source moves through multiple states, including a browser/product-card phase and then phone reposition/content changes. Our render holds a narrower phone mockup sequence and misses the early source states. Fix by implementing the full multi-state phone sequence and matching the 6.0s source timeline.

### AbhiComparisonTable

- [MEDIUM] `AbhiComparisonTable`, `our-0001 @0.0s`: source begins with a #1/stat intro before the table reveal; our render starts directly on the table. Fix by adding the opening hero/stat slate or remapping the source to begin at the table beat.

### AbhiChecklist

- [HIGH] `AbhiChecklist`, `our-0001 @0.0s` and `source-0026 @5.0s`: source is a 10.0s staged scene with an intro screenshot/card, quote sequence, and checklist later. Our render starts directly on the checklist and ends at 5.0s, skipping half the source choreography. Fix by restoring the full 10s sequence or splitting/remapping the source scene.

### AbhiScrambleOpener

- [MEDIUM] `AbhiScrambleOpener`, `our-0003 @0.4s`: source includes a lock/orbital particle-ring layer during the opener; our render lacks that extra lock/orbit visual system. Fix by adding the lock icon and orbit/particle background animation.

### AbhiQuoteCard

- [HIGH] `AbhiQuoteCard`, `our-0001 @0.0s`: source is 720x1280 and contains an app/task-card sequence before the quote-card-like state; our render is 1080x1920 and jumps to a standalone quote card. Fix by aligning export/source dimensions and recreating the full 9.0s source sequence, or remapping to a pure quote-card source segment.

### AbhiWaveform

- [HIGH] `AbhiWaveform`, `our-0016 @3.0s`: source transitions from the waveform/mic motif into a transcription/timeline UI, but our render remains a simple mic/waveform composition. Fix by adding the second-stage transcript/timeline UI.

### AbhiAppCard

- [MEDIUM] `AbhiAppCard`, `source-0034 @6.6s`: source has a shield/check tail at the end, while our render ends early or holds the app-card state. Fix by extending the final 0.4s and adding the shield/check outro.

### AbhiLineChart

- [HIGH] `AbhiLineChart`, `source-0026 @5.0s`: source duration is 6.5s and includes a fade-out/end hold after the line chart. Our render ends at 5.0s and misses frames `source-0026` through `source-0033`. Fix by extending to 6.5s and matching the source fade-out/hold.

### AbhiCodeDiff

- [HIGH] `AbhiCodeDiff`, `our-0012 @2.2s`: source transitions from code diff into a numeric "22 presets shipped" outro, while our render stays on the code diff panel. Fix by adding the count-up outro or remapping/trimming the source to a code-diff-only segment.

## Verified Clean

CROSS rows verified clean: `RankedTierList9x16`, `TerminalBlock9x16`, `AnimatedCounter9x16`, `DecisionTree9x16`, `EditorBlock9x16`, `IllustratedConcept9x16`, `KineticTypoCard9x16`, `LockedFeatureRow9x16`, `NeuralNetwork9x16`, `PipelineFlow9x16`, `TerminalCommand9x16`, `TitledDossierCard9x16`, `TokenStream9x16`, `EquationCardChain16x9`, `BeforeAfterText16x9`, `TopHeroBottomTrioCards16x9`, `ThreeStageRisingBars16x9`, `ThreeRowLabeledCardStack16x9`, `PipelineFlow16x9`, `KaraokeWithBlueChipPullout9x16`, `BigNumberHero9x16`, `BarChartList9x16`, `BenchmarkBars9x16`, `BigNumberHorizontalBars16x9`, `TitleCardKineticTwoLine16x9`, `KineticEssay9x16`, `BrollListicle9x16`, `GenerativeBrollWithDiegeticUI9x16`, `LineChartAnnotated9x16`, `TweetCardHero9x16`, `QuoteCard9x16`, `BrandedOpener9x16`, `DiagramExplainer9x16`, `LayerCardStack9x16`, `TalkingHead`, `KeynoteSlidePIP16x9`, `SplitWebcamScreen9x16`, `TalkingHeadDynamic9x16`, `BuilderDropPoster9x16`, `ModelComparison2x2Grid16x9`, `OpeningTitleCard9x16`, `MatrixGridHeatmap9x16`, `DocumentHighlightSwipe16x9`, `PaintStrokeRibbonBanner16x9`, `SpectrumSlider9x16`, `BeforeAfterSliderWipe9x16`, `ModelNameChipComparison9x16`, `RingTopologyHopCounter9x16`, `RotatingVectorDial9x16`, `ConcentricHierarchyRadialCallout9x16`, `MetricBarsComparisonCard9x16`, `StatCardSequenceWithUnderlines9x16`, `AppScreenCarousel9x16`.

ABHI rows verified clean: `AbhiTerminalCard`, `AbhiFeatureGrid`, `AbhiCtaComment`, `AbhiBrandLockup`, `AbhiTwoColumn`, `AbhiTweetCard`.
