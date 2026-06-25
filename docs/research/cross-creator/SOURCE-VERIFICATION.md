# Cross-Creator SOURCE-frame Verification

Independent multi-agent audit of which reference scene each cross-creator template
is actually compared against in `CROSS-CREATOR-COMPARE.html`. Method: 55 source-picker
agents (read the comp note + the creator's real frames, pick the scene the template
replicates) -> 55 independent adversarial verifiers (vote real/false, default false when
uncertain). 110 agents total.

**Addresses GPT-5.5 codex-review ITER-1/ITER-2 HIGH finding** that the gallery
compared every row of a multi-template creator against one shared frame-set.

## Result: 19 verified, 36 rejected

### Key finding
Reference reels are **mixed-pattern** (one 30-60s reel covers many distinct scenes), so
*directory*-level source selection has a ceiling: even the correct reel often shows the
replicated pattern in only a subset of frames. True per-template fidelity needs
**frame-level** curation (specific frame files/ranges), and a handful of templates are
synthesized adaptations with no single clean source scene.

## Verified + pinned in `source-map.json` (18)

| Comp | Source | Changed |
|---|---|---|
| AnimatedCounter9x16 | adamrosler/7RhJawm2nw4/_fresh | confirm |
| DecisionTree9x16 | adamrosler/S5ZFkY756IY/_fresh | confirm |
| BeforeAfterText16x9 | natebjones/iUSdS-6uwr4/frames | confirm |
| PipelineFlow16x9 | natebjones/_fresh | confirm |
| BigNumberHero9x16 | motiondarwin/DN6w6Tjgbzx/frames | confirm |
| BarChartList9x16 | sahilbloom/_fresh `[fresh-rankedbars-redcalendar]` | confirm |
| TweetCardHero9x16 | bilawal.ai/DWeLzV4hxsp/frames | **yes** |
| TechNewsFlash9x16 | diysmartcode/rfzA7HWcpCQ/frames | confirm |
| LayerCardStack9x16 | simonhoiberg/DPT3n_PgEiU/frames | confirm |
| KeynoteSlidePIP16x9 | allin/ElhxzUO7YQM/frames | **yes** |
| SplitWebcamScreen9x16 | mreflow/b6Ek6-E5V88/frames | confirm |
| TalkingHeadDynamic9x16 | builtbystephan/DYkyJfxx5Lx/frames | confirm |
| BuilderDropPoster9x16 | builtbystephan/_new `[DZ8SE7JSTmR]` | **yes** |
| OpeningTitleCard9x16 | alexhormozi/zQvXS0vv3Ck/frames | **yes** |
| PaintStrokeRibbonBanner16x9 | aiexplained/_backcat/2AdkSYWB6LY | confirm |
| SpectrumSlider9x16 | abhishek.devini/_backcat/DXPok2jktuK | confirm |
| RingTopologyHopCounter9x16 | adamrosler/_backcat/prvqXkQDoBw | **yes** |
| RotatingVectorDial9x16 | adamrosler/_backcat/es79NbFQdzw | **yes** |

## Rejected — mixed-reel (right reel, needs frame-level pick) (7)

| Comp | Picked | Verifier reason | Suggested better dir |
|---|---|---|---|
| TerminalBlock9x16 | adamrosler/mZgCDFEBna0/frames | mZgCDFEBna0 is a mixed-pattern video: only 1 of 5 sampled frames (SKILL LIBRARY) matches TerminalBlock9x16; the others show data visualization, leaderboard, boo | adamrosler/OnRw0D0nnDI or adamrosler/lEH0kNy54Ao (check for NEW SESSION and PERSISTENT MEMORY frames mentioned in template notes as true terminal-block match) |
| NeuralNetwork9x16 | adamrosler/7RhJawm2nw4/_fresh | The _fresh directory mixes unrelated scenes (loss curves, network graph, learning diagnostics) rather than showing consistent neural network pattern; only 1 of  | 7RhJawm2nw4/frames |
| TokenStream9x16 | adamrosler/7RhJawm2nw4/_fresh | 7RhJawm2nw4/_fresh is a mixed neural-training narrative; frames 030/037 contain TokenStream motifs but the overall scene is loss-curve/network-node visualizatio | — |
| EquationCardChain16x9 | natebjones/woGB2vr5wTg/frames | The woGB2vr5wTg directory contains mixed scenes: frame 001 matches EquationCardChain16x9 perfectly, but frames 6 and 12 are talking-head footage with bookshelf  | natebjones/iUSdS-6uwr4/frames |
| KineticEssay9x16 | sahilbloom/_fresh | Only 1 frame matches the prefix filter; lacks multi-frame sequence proof of phrase-by-phrase kinetic reveal that defines the template. | — |
| TalkingHead | simonhoiberg/DPBv4qMkmXE/frames | DPBv4qMkmXE contains mixed scenes (listicles, screen demos, talking-head segments). While frame-02 shows a pure talking-head moment, the chosen directory is imp | simonhoiberg/DNVjkdEsKAj |
| ModelNameChipComparison9x16 | estebandiba/_new/DZ-pBwCEWFU | DZ-pBwCEWFU is a mixed-content compilation; only frame-055 depicts the model-comparison rail pattern, while frames-001, 019, 028 show unrelated scenes (reaction | — |

## Rejected — has a concrete better dir suggestion (same/other creator) (27)

| Comp | Picked | Verifier reason | Suggested better dir |
|---|---|---|---|
| RankedTierList9x16 | adamrosler/S5ZFkY756IY/_fresh | S5ZFkY756IY frames show a technical diagram (page table/memory visualization) with labeled boxes and connecting lines, not a ranked numbered list with big bold  | mZgCDFEBna0 |
| ForceGraph9x16 | adamrosler/7RhJawm2nw4/_fresh | The 7RhJawm2nw4/_fresh frames depict neural network learning/classification visualizations (with loss curves and output boxes), not the organic BGP-style force- | adamrosler/I9pjllzSNK0 |
| BigNumberDuel9x16 | adamrosler/gaGcC_OOGQ0/frames | gaGcC_OOGQ0 shows CPU/GPU architectural comparisons and stacked stream layouts, not a two-column magnitude-duel structure with enormous paired numbers and a ver | 7RhJawm2nw4 |
| EditorBlock9x16 | adamrosler/tY40HHLnNxE/frames | Source frames depict shell terminal and infographics, not VS-Code editor chrome with Finder breadcrumb and highlighted code line as required by EditorBlock9x16. | adamrosler/S5ZFkY756IY/_fresh |
| IllustratedConcept9x16 | adamrosler/7RhJawm2nw4/_fresh | Source frames show adamrosler's signature procedural neon technical diagrams (network graphs, curves, system flows) — fundamentally different from a centered-il | adamrosler/S5ZFkY756IY/_fresh |
| KineticTypoCard9x16 | adamrosler/7RhJawm2nw4 | 7RhJawm2nw4 frames depict a network-node animation, not the film-frame card + kinetic-typo text reveal pattern required by KineticTypoCard9x16. | S5ZFkY756IY |
| LockedFeatureRow9x16 | adamrosler/S5ZFkY756IY/_fresh | adamrosler S5ZFkY756IY source depicts technical architecture diagrams (fork/exec flows, memory layouts, process trees) with scattered nodes and multi-element co | — |
| PipelineFlow9x16 | adamrosler/S5ZFkY756IY/_fresh | Source frames show horizontal/branching diagram layouts (side-by-side boxes with hierarchical connections), not the vertical sequential stacking that PipelineFl | 7RhJawm2nw4/_fresh |
| TerminalCommand9x16 | adamrosler/7RhJawm2nw4/_fresh | 7RhJawm2nw4/_fresh frames depict neural network diagrams with overlaid terminal commands, not a pure TerminalCommand scene with typewriter animation as the prim | adamrosler/mZgCDFEBna0 |
| TitledDossierCard9x16 | adamrosler/7RhJawm2nw4/_fresh | Source frames 005/011/038 from 7RhJawm2nw4/_fresh depict data-visualization and diagram scenes with charts and diagnostic UI, not the text-stat dossier-card lay | S5ZFkY756IY/_fresh |
| TopHeroBottomTrioCards16x9 | natebjones/FtCdYhspm7w/frames | FtCdYhspm7w contains only talking-head scenes, not the hero+trio card graphics pattern that TopHeroBottomTrioCards16x9 requires. | ogTLWGBc3cE |
| ThreeStageRisingBars16x9 | natebjones/ogTLWGBc3cE/frames | Frames 005 and 009 show talking-head footage (person speaking on camera), not the three-stage rising bars pattern documented in the template spec. | natebjones/ogTLWGBc3cE/frames (use frames anim-01-frame-001 through anim-01-frame-013 only) |
| ThreeRowLabeledCardStack16x9 | natebjones/n0nC1kmztSk/frames | Source frames show outline-style cards (NamedCardEquation pattern), not filled translucent cards documented for ThreeRowLabeledCardStack16x9; card chrome treatm | natebjones/NRBQmwlILjk |
| KaraokeWithBlueChipPullout9x16 | natebjones/DVS-cTSVKv4/frames | Source shows multi-chip network diagram layout, not sequential single-chip slide-in/hold/slide-out karaoke pattern matching KaraokeWithBlueChipPullout9x16 signa | — |
| BenchmarkBars9x16 | sahilbloom/_fresh | Source frames show vertical stacked ranking bars (4-5 categories in red/green/blue/yellow) with different widths, not horizontal 2-item comparison bars; pattern | sahilbloom/lAg2-wWR5wU |
| BigNumberHorizontalBars16x9 | sahilbloom/_fresh | Source frames show full-width stacked bars with centered serif labels and no data values; template requires hero-number-left + bars-right split, rounded bars wi | _new |
| BrollListicle9x16 | sahilbloom/_fresh | fresh-editorial-brightcard shows static content labels (date + stacked pill cards), not the animated hook-and-numbered-chapters listicle structure that BrollLis | _new |
| GenerativeBrollWithDiegeticUI9x16 | sahilbloom/28r88tLhNhw/frames | Chosen frames depict talking-head podcast + 3-column bar chart patterns, not the faked-macOS-editor-window-with-syntax-highlighting-and-glow-halo diegetic UI pa | — |
| LineChartAnnotated9x16 | aiexplained/WLdBimUS1IE/frames | Source frames show a landscape-orientation PDF research paper with embedded side-by-side accuracy charts, not a 9x16 vertical video composition matching the Lin | aiexplained/2_DPnzoiHaY |
| QuoteCard9x16 | black.one.studio/DT1nIrLEcMA/frames | Frames show correct palette/layout (black field, minimal sans tagline, stark), but text reveals at t=0.1s rather than the signature late-arrival pattern (40-60% | black.one.studio/DUTmCQfAbPt |
| BrandedOpener9x16 | alexhormozi/zQvXS0vv3Ck/frames | The zQvXS0vv3Ck frames depict a talking-head teaching scene with an overlaid title card, not an isolated brand-opener moment; frames mix the opening card with o | — |
| Listicle | simonhoiberg/DPT3n_PgEiU/frames | This source video (DPT3n_PgEiU) demonstrates Simon's LayerCardStack pattern (white stacked cards, 9:16, purple accent, multi-item visibility), not the generic L | simonhoiberg/DPT3n_PgEiU |
| StudioCompositor16x9 | theaiadvantage/3mTMPEGWRWA/frames | The 3mTMPEGWRWA frames show a vertical split layout (terminal above, presenter below), not the corner-presenter + floating-UI-mockup pattern that StudioComposit | theaiadvantage/_fresh |
| ModelComparison2x2Grid16x9 | theaiadvantage/Q5GxIpzOxOI/frames | Frames show presenter introduction, B-roll, and warm-podcast scenes, not the 2x2 comparison grid layout with centered PIP specified in the template pattern. | theaiadvantage/kG0RkK69NyA |
| MatrixGridHeatmap9x16 | adamrosler/7RhJawm2nw4/_fresh | Frames show neural networks, loss curves, and diagrams—not the NxN grid-heatmap matrix pattern with row/col/cell wave animation specified by MatrixGridHeatmap9x | adamrosler/mZgCDFEBna0/_fresh |
| DocumentHighlightSwipe16x9 | aiexplained/_backcat/3sWH2e5xpdo | 3sWH2e5xpdo shows talking-head/conference footage with no document screenshot or translucent highlighter wipe effect; pattern is completely different from Docum | aiexplained/_backcat/KKF7kL0pGc4 |
| BeforeAfterSliderWipe9x16 | estebandiba/DYmdaniIglx/frames | Frames show static top-bottom split layout, not animated vertical slider/wipe pattern with handle. | — |

## Rejected — likely no clean single-scene source (adaptation / pattern not in creator) (2)

| Comp | Picked | Verifier reason | Suggested better dir |
|---|---|---|---|
| TitleCardKineticTwoLine16x9 | sahilbloom/Fj8HsHqyMA0/frames | Video Fj8HsHqyMA0 is primarily talking-head footage with a single quote-card overlay; it lacks the kinetic title-card pattern (centered kicker→hero→subtitle sta | — |
| VennDiagram9x16 | aiexplained/2_DPnzoiHaY/frames | Frames show IronyCycleDiagram (circular loop with 4 cards + arrows + "YOU ARE HERE" marker), not VennDiagram pattern (overlapping circles with intersection payo | — |

## Next layer (not yet done)

1. **Frame-level source-map** — extend `source-map.json` entries to accept an explicit
   frame list / glob, and run a curation pass to pick the exact frames per template.
2. Re-point the rows with a verified better dir (above) after a confirming pass.
3. Cross-creator note: `DiagramExplainer9x16`'s vertical-stacked-flowchart pattern actually
   matches **carloscuamatzin/DYqgAYfRqBf**, not its labeled creator midu.dev (kept on midu to
   preserve the row's creator framing).

