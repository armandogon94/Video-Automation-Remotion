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



---

# Round-2 — frame-level re-curation (the 36 flagged rows)

Second 72-agent pass (re-pick the correct reel + pin the EXACT frames that show the
pattern -> independent confirming vote). Frame-level selection now supported in
`source-map.json` (a `frames` basename list per entry) because reels are mixed-scene.

## Result: 15 verified & pinned (frame-level), 12 adaptations (no clean source), 9 still open

### Verified frame-level pins (added to source-map.json)

| Comp | Source reel | Frames |
|---|---|---|
| RankedTierList9x16 | adamrosler/mZgCDFEBna0/frames | frame-008.jpg, frame-009.jpg, frame-010.jpg, frame-011.jpg |
| ForceGraph9x16 | adamrosler/I9pjllzSNK0 | frame-025.jpg, frame-027.jpg, frame-029.jpg, frame-030.jpg |
| NeuralNetwork9x16 | adamrosler/7RhJawm2nw4/frames | frame-019.jpg, frame-020.jpg |
| TokenStream9x16 | adamrosler/7RhJawm2nw4/_fresh | frame-030.jpg, frame-031.jpg |
| EquationCardChain16x9 | natebjones/iUSdS-6uwr4/frames | vote1-anim-01-frame-005-t665s.jpg, vote1-anim-01-frame-006-t665s.jpg, vote1-anim-01-frame-007-t665s.jpg |
| ThreeStageRisingBars16x9 | natebjones/ogTLWGBc3cE/frames | anim-01-frame-001-t425s.jpg, anim-01-frame-002-t425s.jpg, anim-01-frame-003-t425s.jpg, anim-01-frame-004-t425s.jpg |
| ThreeRowLabeledCardStack16x9 | natebjones/n0nC1kmztSk/frames | anim-02-frame-005-t285s.jpg, anim-02-frame-006-t285s.jpg |
| KaraokeWithBlueChipPullout9x16 | natebjones/LDb0mXNowF4/frames | anim-01-frame-001-t21s.jpg, anim-01-frame-003-t21s.jpg, anim-01-frame-004-t21s.jpg, anim-01-frame-005-t21s.jpg, anim-02-frame-001-t42s.jpg, anim-02-frame-004-t42s.jpg |
| QuoteCard9x16 | black.one.studio/DUTmCQfAbPt/frames | frame-00-t00.10s.jpg, frame-01-t00.80s.jpg, frame-03-t02.20s.jpg |
| TalkingHead | simonhoiberg/DNVjkdEsKAj | frame-00-t00.20s.jpg, frame-01-t14.37s.jpg, frame-03-t42.71s.jpg, frame-05-t71.05s.jpg, frame-06-t85.22s.jpg |
| StudioCompositor16x9 | theaiadvantage/_fresh | frame-013.jpg |
| MatrixGridHeatmap9x16 | adamrosler/1eBmR1n0VNk/frames | frame-023.jpg, frame-024.jpg, frame-026.jpg, frame-028.jpg, frame-030.jpg |
| DocumentHighlightSwipe16x9 | aiexplained/Iar4yweKGoI/frames | anim-01-frame-005.jpg, anim-01-frame-012.jpg, anim-02-frame-004.jpg, anim-02-frame-008.jpg |
| BeforeAfterSliderWipe9x16 | estebandiba/_backcat/DYhW4eGglHv | frame-02.jpg, frame-04.jpg, frame-05.jpg, frame-07.jpg, frame-08.jpg |
| ModelNameChipComparison9x16 | estebandiba/_new/DZ-pBwCEWFU | frame-055.jpg, frame-064.jpg |

### Adaptations — no clean single-scene source in the labeled creator (left at fallback; NOT a render bug)

These templates were synthesized in the project typology, inspired by a creator's
*discipline* (palette/structure vocabulary) rather than copied from one scene. Honest
label: adaptation. Candidates for an explicit ADAPTED badge later.

| Comp | Why |
|---|---|
| EditorBlock9x16 | EditorBlock9x16 is an adaptation of adamrosler's dark-procedural language (monospace, tracked-uppercase headers, glow highlights, gold accents) but th |
| IllustratedConcept9x16 | Template is centered-illustration card; adamrosler creates only procedural neon diagrams. Improvement was palette-harmonization (cream→dark), not sour |
| KineticTypoCard9x16 | KineticTypoCard9x16 is a cross-creator adaptation from builtbystephan with no clean native scene in adamrosler's work; the warm-cream film-frame card  |
| PipelineFlow9x16 | No scene in adamrosler's reels depicts vertical sequential stacking; template replicates dark aesthetic (black bg, slate boxes, glowing borders, monos |
| TerminalCommand9x16 | 7RhJawm2nw4/_fresh frames show neural-net diagrams with overlaid terminal text (rejected); mZgCDFEBna0 contains UI elements but lacks the pure typewri |
| BenchmarkBars9x16 | Template is adaptation—Sahil demonstrates vertical ranked-bar lists (P4), not horizontal 2-item X-vs-Y benchmarks; _fresh frames show only the vertica |
| BigNumberHorizontalBars16x9 | The _fresh frames show only full-width stacked bars (Sahil's discipline), not the hero-number-left + bars-right split required by the template—the her |
| BrollListicle9x16 | BrollListicle9x16 replicates Alex Hormozi's listicle pattern (white hook pill + numbered chapter pills); sahilbloom's signature is HeroChapterNumeral  |
| GenerativeBrollWithDiegeticUI9x16 | Template depicts faked macOS editor window with code syntax + traffic lights + breadcrumb path; sahilbloom's actual diegetic-UI signature is email/Gma |
| BrandedOpener9x16 | No reel in @alexhormozi's catalog contains an isolated dark-bg brand-opener moment; all are talking-head with overlaid text. BrandedOpener9x16 is a va |
| VennDiagram9x16 | VennDiagram9x16 is an adaptation/realization of aiexplained's comparison discipline, not a scene from his actual videos; aiexplained's DNA is Benchmar |
| Listicle | No scene in simonhoiberg's corpus (12 analyzed reels + _backcat backlog) depicts the generic dark-navy/gold numbered listicle pattern. Simon's listicl |

### Still open after round-2 (verifier rejected the re-pick too)

| Comp | Reason |
|---|---|
| TerminalBlock9x16 | Frames show a neon GUI button/menu interface, not the line-by-line monospace terminal output (console logs with typewriter reveal) that TerminalBlock9 |
| BigNumberDuel9x16 | Frames depict adamrosler's source bordered-card duel pattern (orange headers, mini-spark, red pills), not a BigNumberDuel magnitude-duel replica (two  |
| LockedFeatureRow9x16 | Frames depict a data-structure vectors-visualization pattern, not the feature-gating-row pattern documented for LockedFeatureRow9x16. |
| TitledDossierCard9x16 | These frames show diagram/list scenes, not the title-hero-stat-bullet dossier card structure documented in the template. |
| TopHeroBottomTrioCards16x9 | Frames show a horizontal 4-card product flow, not the documented vertical hero+trio+pill pattern (hero top, 3 supporting cards below, emphasis pill la |
| TitleCardKineticTwoLine16x9 | Frames show comparison layouts, mid-transition text, and a countdown timer—none depict the centered kicker-hero-subtitle editorial stack documented fo |
| KineticEssay9x16 | Frames depict distinct video scenes with different copy and layouts, not the single unified sequential reveal progression that defines KineticEssay9x1 |
| LineChartAnnotated9x16 | Frames are static reference screenshots (Metaculus source), not animated LineChartAnnotated9x16 compositions; no motion, no line draw-on, no endpoint  |
| ModelComparison2x2Grid16x9 | Both frames show 3-column comparison layouts with left-side presenter PIP, not the documented 2x2 grid structure with four rounded cards. |

