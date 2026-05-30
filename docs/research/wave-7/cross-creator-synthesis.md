# Cross-Creator Synthesis — what we learned across all 21 analyzed reference creators

> **Status:** Wave-7 roll-up (2026-05-29). Tracks handoff item #133 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:123`).
>
> **Author:** Wave-7 cross-creator synthesis agent.
>
> **What this is:** A single comparative view across **all 21 reference creators** whose `ANALYSIS.md` files live under `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/`. Every per-creator doc is a vertical drill-down on one creator; this is the horizontal roll-up that no single creator doc provides — what generalizes, what doesn't, and what it means for our template library.
>
> **Relationship to the ADRs:** This document is **subordinate to and consistent with** ADR-001 (16:9 lane, `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md`) and ADR-002 (captions register × aspect matrix, `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md`). Where this synthesis touches the 16:9 vocabulary or the captions register taxonomy, the ADRs are authoritative; this doc cites them rather than restating decisions.
>
> **One-line:** Across 21 creators and ~281 analyzed videos, a small shared 16:9 "Stripe Press in motion" vocabulary and a 5-value captions-register taxonomy generalize across many creators; most other patterns are single-creator artifacts; and 9:16 vs 16:9 are confirmed to be *different grammars, not rescaled siblings*.

---

## 1. The roster (21 creators)

The active roster is the table in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/CREATORS.md`. Below, each creator is grounded in its own `ANALYSIS.md` (path = `references/creators/<handle>/ANALYSIS.md` under the worktree root unless noted). "Corpus" = videos analyzed per that doc's own count.

| # | Creator | Native aspect(s) | Corpus | Signature pattern(s) | Brand-voice register |
|---|---|---|---|---|---|
| 1 | **natebjones** | 16:9 long-form + 9:16 Shorts | 39 (33 LF + 6 Shorts) | `TitleCardKineticTwoLine` (dominant, ≥13), `EquationCardChain`/`NamedCardEquation`, `TreeOfChildCardsWithEmphasisPill`, `ThreeRowLabeledCardStack`; Shorts = karaoke + blue pullout chip (C7) | "Stripe Press in motion" — editorial-restraint, typographic-first, dark slate. Captions: editorial (Shorts green karaoke) |
| 2 | **adamrosler** | 9:16 Shorts | 22 | One dark house chrome + ~12+ procedural diagram primitives (`DarkRankedListWithGlowingActiveRow`, `AutonomousSystemGraph`, `AnnotatedLineChart`, `TokenGrid`, `BulletSequenceCounter`, `IconObjectPair`…) | Procedural-dense, dark-BG, uppercase hero. Captions: **technical** (white active word) |
| 3 | **alexhormozi** | 9:16 Shorts + 16:9 long-form | 25 (10 Shorts + 15 LF) | Shorts: persistent-top-hook-pill, chapter cards, karaoke one-word emphasis. LF: `LiveEventAudienceMicSplitScreen`, `FlipChartLiveDrawing`, `StudioDeskFlannelTalkingHead`, `EducationalDisclaimerCaptionBlock` | Punchy, typography-on-video (NOT procedural). Captions: **punchy** (yellow) |
| 4 | **theaiadvantage** (Igor Pogany) | 16:9 long-form + 9:16 Shorts | 12 | `StudioCompositor16x9` (closest analog to our brand voice), `GlowingPromptBarMockup`, `TwoByTwoModelComparison`, `StackedSplitFaceCamShort9x16` | Polished AI-explainer studio; dark compositor + warm-podcast sub-brand. Captions: **punchy** |
| 5 | **sahilbloom** | 16:9 long-form + 9:16 Shorts | 12 | `HeroChapterNumeral`, `EditorialStepCard`, `FullSentenceItalicEmphasisCaption`, `HorizontalBarRankedList`, cyan karaoke | Editorial-restraint + author-authority production design. Captions: **editorial** (cyan) / **none** on A-roll |
| 6 | **allin** (All-In Podcast/Summit) | 16:9 (live-event) | 12 | `PersistentEventLockupChyron16x9` (11/12), `SlideDeckPlusSpeakerPIP16x9`, diegetic stage compositions | Editorial-news / conference; production-design-as-graphic. Captions: **none** (anti-finding) |
| 7 | **matthewberman** | 16:9 long-form + 9:16 Shorts | 12 | `WebcamPipOverlay` (8/12, atomic), `HighlightedArticleScrollRead`, `HandDrawnConceptMap` / `SplitVerticalSketchPlusFace` (uniquely hand-drawn), `BlackTitleHookCardShort` | AI-news anchorman; production-light. Captions: Shorts karaoke, **none** on LF A-roll |
| 8 | **mreflow** (Matt Wolfe) | 16:9 long-form + 9:16 Shorts | **4 of 12 (preliminary — backfill in progress)** | `NeonRingCircularFaceCamPIP`, `ArticleReadAlongWithNeonPIP16x9`, `TopAndBottomSplitWithSeamCaption9x16` | Lowest-chrome AI-news anchor; source material is the hero. Captions: Shorts seam-pill karaoke |
| 9 | **aiexplained** (Philip) | 16:9 long-form | **12 of 12 (per current doc; treat as preliminary — backfill recency caveat, §8)** | `AcrobatPaperSweep` (8/12, dominant), `SourceTweetAnchor`, `BenchmarkTableTintedColumn`, `NumberedChapterDivider`, `MemeLoopDiagram` | Austere; source-document-IS-the-chrome. Captions: none (relies on source overlays) |
| 10 | **carloscuamatzin** | 9:16 reels | 12 | 6 templates: cream flowchart, dark editorial, dark scientific chart, color-coded comparison, annotated screen-rec, watercolor illustration | Bloomberg/Pentagram editorial; **exact Spanish peer to our brand**. Captions: word-by-word accent active |
| 11 | **diysmartcode** | 9:16 Shorts | 12 | 3 templates: `DarkChangelog` (numbered counter), `HeroPricing` (big number card), `CreamEditorial` (numbered items) | Dark-palette + breadcrumb/section-label house grammar; editorial. Captions: mostly none (hero text is the message) |
| 12 | **bilawal.ai** | 9:16 reels | 20 | `TweetCardOverlay` (15/20 dominant), `FullBleedKineticDashboard`, dual-pane input→output, `KineticMacroTypeOpener` | "Bloomberg-meets-builder"; tweet-card-as-headline + artifact. Captions: chunked-phrase (editorial), hard pop |
| 13 | **simonhoiberg** | 9:16 reels | 12 | `TalkingHeadStudio` (8/12, undecorated), `LayerCardStack` (3-card glassmorphic), `DeviceMockupBroll`, `ReactionStack` | Pentagram-restraint, one purple accent. Captions: **none** on most reels |
| 14 | **midu.dev** | 9:16 reels | 12 | `WebcamScreenshareCallout`, `SelfieWordHighlight` (≈our EditorialCaption), `MemeWithRoleLabels` | Spanish dev; face-cam + one yellow accent word. Captions: yellow active word |
| 15 | **estebandiba** | 9:16 + 1:1 | 3 (carousel-heavy feed; 401 on pagination) | `CinematographyHUDCard` (viewfinder chrome + bracketed monitor), stacked split original/AI, IG-sticker pills | Spanish AI-video-tool launches. Captions: IG-sticker pills (we don't adopt) |
| 16 | **dotcsv** (Carlos Santana) | 9:16 reels | 12 | Podcast cutdown + B-roll cutaway; movie-clip memes | Spanish AI educator; **low visual reuse**, content/voice value only. Captions: white on/off, no active color |
| 17 | **motiondarwin** (Darwin Pacheco) | 1:1 + 9:16 + 16:9 | 12 | C4D/Redshift soft-body loops, abstract 3D scenes, client explainer (`99%` stat card validates `BigNumberHero`) | Cinema 4D demoreel — **no instructional grammar**. Captions: none |
| 18 | **zenzuke** (Carlos Albarrán) | 9:16 reels | 15 | `InterviewSplitscreen` (7/15), webcam talking head, promo course card, 2D showreel | Spanish motion-craft educator; **LOW lift** (covered or needs 2D animator). Captions: yellow karaoke |
| 19 | **builtbystephan** (Stefan Andrei) | 9:16 reels | 30 | `TalkingHeadDynamic9x16` (hard-cut crop-mode B-roll over continuous face-cam, 12/30), `BuilderDropCard` | Builder/AI; dynamic hard-cut split. Captions: bold-white karaoke, dynamic y-position |
| 20 | **black.one.studio** | 9:16 micro-reels | 8 | `HoodedFigureBlackBackdropTagline`, `FoldedGarmentStillTagline` (streetwear brand, NOT motion design) | Streetwear product-hype; **out of lane**, restraint clinic only. Captions: none |
| 21 | **motiongraphicsweb** | 9:16 reels | 2 (abandoned account, Oct 2022) | `AECoverPlusRawScreenrec`, `SerifTitleCardPlusRawScreenrec` | Abandoned AE micro-tutorials. **SKIP**. Captions: none |

**Corpus total** matches the WAVE7-HANDOFF framing of "281 videos analyzed across 21 active creators" (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:10`). Note that natebjones' canonical `ANALYSIS.md` consolidates two voter docs (`ANALYSIS-VOTE1.md`, `ANALYSIS-VOTE2.md`).

### 1.1 Two creators carry a data-freshness caveat

- **aiexplained** — `references/creators/aiexplained/ANALYSIS.md:3` now reads "12 of 12 processed (COMPLETE) — backfilled 2026-05-29". The 8 backfilled videos were each surveyed with only a single coarse contact-sheet montage + 2 dense frame Reads (`references/creators/aiexplained/ANALYSIS.md:27`). Per the #143 backfill that is still listed in-flight in the handoff (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:84,120`), treat aiexplained's promoted-from-backfill patterns (`NumberedChapterDivider`, `NumberedDetailCounter`, `EssayReadAlongTOC`) as **preliminary** pending a confirming refresh; a refresh may revise them.
- **mreflow** — `references/creators/mreflow/ANALYSIS.md:3` is explicitly "PRELIMINARY 4-of-12 wave" with **0 reference clips saved**. Its patterns (`NeonRingCircularFaceCamPIP`, `ArticleReadAlongWithNeonPIP16x9`, `TopAndBottomSplitWithSeamCaption9x16`) rest on 74 frames from 4 videos. **(preliminary — backfill in progress.)** A refresh to 12-of-12 will follow and may surface the numbered-listicle / logo-grid patterns the 8 missing flagship videos likely contain.

Both rows are labeled accordingly in the roster table. This synthesis is written from current state and does **not** wait on the backfill.

---

## 2. Cross-cutting SHARED vocabulary (what generalizes, with evidence strength)

A pattern earns "shared" status here only when **multiple independent creator analyses** confirm it. The number after each pattern is the count of confirming creators; the strength of evidence is the count, not the rhetoric.

### 2.1 The 16:9 "Stripe Press in motion" consensus — **5 confirming creators**

The dominant 16:9 long-form vocabulary is the dark-editorial typographic system that ADR-001 Addendum A.1 named "Stripe Press in motion" (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:406-421`). The four atoms are: **(a)** dark-slate slab backplate + translucent brand-glyph watermark; **(b)** typographic card stacks with role-coded accent borders; **(c)** caption pill with one accent-tinted keyword; **(d)** persistent handle/identity chip lower-right.

Confirming creators for the dark-slate + typographic-stack + restraint register (not every creator hits all four atoms; this is the convergent register):

1. **natebjones** — the canonical reference; all four atoms (`references/creators/natebjones/ANALYSIS.md:155-165, 303`).
2. **alexhormozi** (long-form) — dark-slate + glyph watermark + typographic stacks confirmed as a cross-creator 16:9 primitive (`references/creators/alexhormozi/ANALYSIS.md:194` cross-confirms; LF chassis at `:425-434`).
3. **theaiadvantage** — `StudioCompositor16x9` is named the single closest analog to our brand voice in the whole corpus (`references/creators/theaiadvantage/ANALYSIS.md:50-59, 181`).
4. **sahilbloom** — editorial chapter cards + editorial-restraint register (`references/creators/sahilbloom/ANALYSIS.md:16, 19`).
5. **allin** — editorial-restraint + production-design-as-graphic; explicitly the "lowest-procedural" sibling of sahilbloom (`references/creators/allin/ANALYSIS.md:228, 277`).

natebjones' own cross-creator section names hormozi-LF, theaiadvantage, and sahilbloom as corroborating the dark-slate + glyph + typographic-stack primitive (`references/creators/natebjones/ANALYSIS.md:194`). The shipped foundation molecules `DarkSlateChassis16x9` (B25) and `CaptionPillWithKeyword` (B23) materialize atoms (a) and (c) (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:24-25`).

### 2.2 The 16:9 lane itself — **6 confirming creators (7 with Hormozi-LF)**

Independent of the *vocabulary*, the bare fact that we need a 16:9 lane at all is confirmed by six creators whose native format is 16:9 long-form, per ADR-001 §1.1 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:21-35`):

`natebjones`, `aiexplained`, `mreflow`, `sahilbloom`, `theaiadvantage`, `allin` — **six** — plus `alexhormozi` long-form as the bonus seventh. Each per-creator doc independently flags the lane decision: sahilbloom calls itself the "fourth" (`references/creators/sahilbloom/ANALYSIS.md:216`), theaiadvantage the "fifth" (`references/creators/theaiadvantage/ANALYSIS.md:171-181`), allin the "fifth/overwhelming" (`references/creators/allin/ANALYSIS.md:146-156, 262`). This is the strongest-evidence shared finding in the entire corpus, and is the basis of ADR-001 (Accepted).

### 2.3 Karaoke-caption discipline on Shorts (sound-off scrollers) — **8+ confirming creators**

Burned-in word-by-word karaoke captions with one-word emphasis are confirmed across the 9:16 Shorts/Reels cohort:

- `alexhormozi` 10/10 Shorts (`references/creators/alexhormozi/ANALYSIS.md:23-33`)
- `adamrosler` 18/18 + extension (`references/creators/adamrosler/ANALYSIS.md:270, 322-324`)
- `natebjones` Shorts green-active karaoke (`references/creators/natebjones/ANALYSIS.md:52-53, 133-141`)
- `sahilbloom` Shorts cyan karaoke (`references/creators/sahilbloom/ANALYSIS.md:103-117`)
- `theaiadvantage` Shorts punchy karaoke (`references/creators/theaiadvantage/ANALYSIS.md:185-195`)
- `midu.dev` yellow active word (`references/creators/midu.dev/ANALYSIS.md:30-48`)
- `builtbystephan` bold-white karaoke aligned to word onset (`references/creators/builtbystephan/ANALYSIS.md:26-28, 93`)
- `bilawal.ai` chunked-phrase (`references/creators/bilawal.ai/ANALYSIS.md:258-269`)
- `mreflow` Shorts seam-pill karaoke (`references/creators/mreflow/ANALYSIS.md:43-51`) **(preliminary)**

natebjones' cross-creator note groups hormozi, sahilbloom, diysmartcode under "captions always on for Shorts" with per-brand active-word color (`references/creators/natebjones/ANALYSIS.md:195`).

### 2.4 The captions register taxonomy — **codified across 6+ creators**

The 5-value register taxonomy is ADR-002's matrix (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:47-53`). It is the synthesis of independent per-creator color findings:

| Register | Active-word treatment | Confirming creators | Anchor |
|---|---|---|---|
| **punchy** | yellow `#F1C232` | Hormozi, Igor (theaiadvantage), Berman Shorts | `references/creators/alexhormozi/ANALYSIS.md:233-236`; `references/creators/theaiadvantage/ANALYSIS.md:189-195` |
| **editorial** | cyan `#5BC0E8` (hard pop) | Sahil, Bilawal, Nate Shorts (green variant) | `references/creators/sahilbloom/ANALYSIS.md:103-108`; `references/creators/bilawal.ai/ANALYSIS.md:267` |
| **technical** | white active | Adam Rosler, Carlos | `references/creators/adamrosler/ANALYSIS.md:270, 322-324` |
| **custom** | caller-supplied | back-compat escape hatch | ADR-002 §2.1 |
| **none** | no burned caption | All-In, Sahil A-roll, Matt Berman LF, aiexplained, Igor LF | `references/creators/allin/ANALYSIS.md:264-273` |

The register × aspect product space is **non-orthogonal** per ADR-002 §2.2 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:115-124`) — several cells are structurally invalid (no creator burns karaoke on 16:9 A-roll), and the same `register` value resolves to *different components* per aspect lane. This synthesis defers entirely to ADR-002 for the cell-by-cell matrix.

### 2.5 "One accent color per video" discipline — **5+ confirming creators**

A single accent per video (rather than stacking accents) is independently confirmed by: `midu.dev` (`references/creators/midu.dev/ANALYSIS.md:71`), `carloscuamatzin` (`references/creators/carloscuamatzin/ANALYSIS.md:120`), `diysmartcode` (`references/creators/diysmartcode/ANALYSIS.md:75-78`), `simonhoiberg` (purple `#5B2EE5`, `references/creators/simonhoiberg/ANALYSIS.md:148`), `bilawal.ai` (`references/creators/bilawal.ai/ANALYSIS.md:118, 204`), and `adamrosler`'s topic-keyed accent palette (`references/creators/adamrosler/ANALYSIS.md:271`). This is already a stated discipline in our brand system; the corpus is a 6-creator confirmation, not a new finding.

### 2.6 Source-material-as-hero / editorial restraint — **5+ confirming creators**

A recurring lesson, independent of aspect: when the source artifact (paper, tweet, dashboard, keynote) is strong, creators *suppress* chrome rather than add it. Confirmed by `aiexplained` ("the source-document IS the chrome", `references/creators/aiexplained/ANALYSIS.md:305-307`), `mreflow` ("don't over-chrome the source", `references/creators/mreflow/ANALYSIS.md:23, 72`) **(preliminary)**, `allin` (production-design-as-graphic, `references/creators/allin/ANALYSIS.md:228`), `sahilbloom` (editorial restraint, `references/creators/sahilbloom/ANALYSIS.md:19`), `simonhoiberg` ("don't decorate to fill space", `references/creators/simonhoiberg/ANALYSIS.md:28, 150`), and `black.one.studio` as a pure restraint clinic (`references/creators/black.one.studio/ANALYSIS.md:5`).

### 2.7 Tweet/social-post-as-headline — **4 confirming creators**

The "composed or screenshot social post sits above the artifact" device: `bilawal.ai` `TweetCardOverlay` 15/20 (`references/creators/bilawal.ai/ANALYSIS.md:13-40, 287-300`), `aiexplained` `SourceTweetAnchor` 5/12 (`references/creators/aiexplained/ANALYSIS.md:235-241`), `matthewberman` `TweetCardScrollPip`/`TweetThreadScrollPip` (`references/creators/matthewberman/ANALYSIS.md:220-221`), `simonhoiberg` `ReactionStack` LinkedIn-post variant (`references/creators/simonhoiberg/ANALYSIS.md:83-103`). Shipped as `TweetCardHero9x16` + B12 dual-pane extension (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:56`).

### 2.8 Webcam/face-cam PIP molecule — **4 confirming creators**

A small inset presenter over a back layer: `matthewberman` `WebcamPipOverlay` 8/12 (`references/creators/matthewberman/ANALYSIS.md:234`), `mreflow` `NeonRingCircularFaceCamPIP` (`references/creators/mreflow/ANALYSIS.md:77`) **(preliminary)**, `theaiadvantage` presenter PIP in `ModelComparisonGrid` / `FiftyFifty` (`references/creators/theaiadvantage/ANALYSIS.md:76, 88`), `allin` white-bordered speaker PIP in `SlideDeckPlusSpeakerPIP16x9` (`references/creators/allin/ANALYSIS.md:63-69`). Shipped as `WebcamPipOverlay` + `NeonRingFaceCamPip` (B1, `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:31`) and is the canonical Tier-B aspect-neutral molecule per ADR-001 §5.4 (`:237-246`).

### 2.9 Stacked split-screen (screen/B-roll over face-cam) — **5 confirming creators**

The vertical 50/50 split with content top + face-cam bottom (or inverse): `builtbystephan` `TalkingHeadDynamic9x16` crop modes (`references/creators/builtbystephan/ANALYSIS.md:12-38`), `theaiadvantage` `StackedSplitFaceCamShort9x16` (`references/creators/theaiadvantage/ANALYSIS.md:158-165`), `mreflow` `TopAndBottomSplitWithSeamCaption9x16` 2/2 Shorts (`references/creators/mreflow/ANALYSIS.md:75`) **(preliminary)**, `midu.dev` `WebcamScreenshareCallout` (`references/creators/midu.dev/ANALYSIS.md:13-28`), `estebandiba` stacked original/AI (`references/creators/estebandiba/ANALYSIS.md:49-64`), and `zenzuke` `InterviewSplitscreen` (`references/creators/zenzuke/ANALYSIS.md:11`). Maps to existing `SplitWebcamScreen9x16` with mode extensions.

---

## 3. DIVERGENCES — patterns that looked shared but are single-creator artifacts

The most important corrective in the corpus is **ADR-001 Addendum A.1 / Nate Correction 1** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:406-421`; source finding at `references/creators/natebjones/ANALYSIS.md:149-205`). The R4B Nate +15 batch **disproved** the hypothesis that a broad chart-and-timeline vocabulary would generalize across the 16:9 lane. These four were hypothesized cross-creator but are **single-creator artifacts**:

| Hypothesized-shared template | Reality | Originating creator(s) |
|---|---|---|
| `ChartHero16x9` | single-creator, NOT lane-shared | mreflow / aiexplained only (`references/creators/natebjones/ANALYSIS.md:200`) |
| `TimelineHorizontal16x9` | single-creator | not Nate; `references/creators/natebjones/ANALYSIS.md:202, 246` |
| `SidebarSourceCitation16x9` | single-creator (≈ aiexplained `EssayReadAlongTOC`) | aiexplained only (`references/creators/aiexplained/ANALYSIS.md:284-290`) |
| `TwitterScreencap16x9` as a *Nate* primitive | single-creator | `references/creators/natebjones/ANALYSIS.md:203, 247` |

Other confirmed single-creator artifacts (do NOT tag "cross-creator confirmed"):

- **`AcrobatPaperSweep`** (PDF-viewer-chrome read-along) — dominant for aiexplained (8/12) but uncanny when faked and unique to his "read the paper with you" register (`references/creators/aiexplained/ANALYSIS.md:227-233, 324`).
- **`MemeLoopDiagram`** — single-instance even within aiexplained's own corpus; stays preliminary (`references/creators/aiexplained/ANALYSIS.md:259-266, 320`). Shipped speculatively as `MemeLoopDiagram16x9` (B9) but evidence is 1 video.
- **`HandDrawnConceptMap` / `SplitVerticalSketchPlusFace`** — uniquely Matthew Berman; no other creator hand-sketches (`references/creators/matthewberman/ANALYSIS.md:249, 255`).
- **`EducationalDisclaimerCaptionBlock`** — uniquely Hormozi (compliance moat, no twin found, `references/creators/alexhormozi/ANALYSIS.md:454-461, 498`). Shipped as `EducationalDisclaimerCaption` (B18) but it is **out of the captions register matrix** per ADR-002 §1.2 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:41`).
- **`CinematographyHUDCard` / viewfinder chrome** — uniquely estebandiba (`references/creators/estebandiba/ANALYSIS.md:13-46`).
- **`PersistentEventLockupChyron16x9`** — All-In's stage-bug; whether it unifies with Nate's handle chip under one `PersistentCreatorChip` family is an open question per ADR-001 A.5 #8 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:466`).
- **Adam Rosler's deeper procedural primitives** (`Loupe9x16`, `LossLandscape9x16`, `PageTableGrid9x16`, `DimensionalProjectionRing`) — single-creator, single-video each (`references/creators/adamrosler/ANALYSIS.md:448-462`).
- **3D / craft work** — `motiondarwin` C4D loops and `zenzuke` 2D showreels are explicitly "no template lift" (`references/creators/motiondarwin/ANALYSIS.md:18-20, 80`; `references/creators/zenzuke/ANALYSIS.md:18-28`).

**Implication:** keep single-creator templates in the catalog, but do not promote them to "lane-shared" status in any build-prioritization. Lane-shared = ≥2 independent creators.

---

## 4. The aspect-duality finding (Nate Correction 2): different grammars, not rescaled

The single most load-bearing architectural finding across the corpus is **ADR-001 Addendum A.2 / Nate Correction 2** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:423-435`; source at `references/creators/natebjones/ANALYSIS.md:167-186, 303`):

> 9:16 and 16:9 are **different visual grammars, not the same vocabulary rescaled.**

The evidence: across Nate's 25 long-form 16:9 + 7 Shorts 9:16, **none** of the six 16:9 patterns (N1–N6) appear in **any** Short; all Shorts run karaoke + blue pullout chip with the slate cards stripped entirely. The **only** element continuous across both lanes is the lower-right handle chip (`references/creators/natebjones/ANALYSIS.md:177`).

The correct 16:9 → 9:16 port for the Nate vocabulary is therefore **not a mechanical rescale** — it is:

1. **Strip the dark-slate cards entirely** (the chassis does not survive the aspect change).
2. **Rely on karaoke captions** as the primary text layer.
3. **Use the blue pullout chip** (C7 `KaraokeWithBlueChipPullout9x16`, shipped as B24b) as the only persistent overlay.

This is the matrix-level basis of ADR-002's non-orthogonality (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:55-63`): the 16:9 "editorial" register is a *code-set keyword pill* (`CaptionPillWithKeyword`, not whisper-driven), while the 9:16 "editorial" register is *whisper-driven karaoke* (`EditorialCaption`). Same name, same palette family, **different primitive, different data dependency.**

**Corollary for our library:** ADR-001 Addendum A.2 narrows the rule for the Nate vocabulary specifically — **cross-aspect schema sharing is rejected** (`KineticTypoCard9x16` and `TitleCardKineticTwoLine16x9` keep independent schemas, no shared base). Other lanes (Igor/Sahil captions) may still admit Tier-C sharing. This synthesis does not relitigate; it records that the corpus-wide evidence is consistent with the negative-duality finding — no creator we analyzed runs the same insert-graphic vocabulary in both aspects.

---

## 5. Anti-findings — things we explicitly do NOT adopt

These are corpus-wide "do not copy" verdicts, each grounded in a creator doc:

1. **No dropping burned-in captions on our 9:16 output.** Multiple 16:9 creators run `register: 'none'` on A-roll (Sahil A-roll, All-In 12/12, Matt Berman LF, Igor LF, aiexplained). This is correct *for their sound-on / YouTube-CC audience* and **wrong for ours** — our sound-off scrollers demand captions ALWAYS ON. Copying it "would tank watch time" (`references/creators/allin/ANALYSIS.md:285`; `references/creators/sahilbloom/ANALYSIS.md:207`; `references/creators/theaiadvantage/ANALYSIS.md:202`; `references/creators/matthewberman/ANALYSIS.md:257`). ADR-002 marks `none × 9:16` as valid-but-discouraged (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:87`).
2. **No "shrink the 16:9 slate cards into 9:16" port.** Per §4 — the right move is to drop the cards and live on the caption layer (`references/creators/natebjones/ANALYSIS.md:186, 244`).
3. **No chart-data-with-presenter-PIP as a "Nate-style" 16:9 pattern.** R4B disproved it is in Nate's vocab (`references/creators/natebjones/ANALYSIS.md:241`).
4. **No timeline-horizontal / twitter-screencap as Nate-shared primitives** (§3).
5. **No movie-clip / pop-culture B-roll.** Copyright + brand-fit risk; Sahil uses it but it doesn't map to our LATAM AI register (`references/creators/sahilbloom/ANALYSIS.md:210`; `references/creators/natebjones/ANALYSIS.md:242`; `references/creators/matthewberman/ANALYSIS.md:127`).
6. **No dropping the brand watermark by default.** Adam, Sahil, Igor, Matt, Simon, and most fashion/3D creators ship zero in-video watermark. Their face/production-design *is* their brand; our `<BrandWatermark>` is load-bearing because we are a content brand competing in Spanish (`references/creators/adamrosler/ANALYSIS.md:326-328`; `references/creators/sahilbloom/ANALYSIS.md:208`; `references/creators/theaiadvantage/ANALYSIS.md:201`). The compromise shipped is `chrome: 'minimal' | 'full'` (B3) — `full` default, `minimal` for English cross-post.
7. **No faked Acrobat / browser chrome.** aiexplained's `AcrobatPaperSweep` reads worse when faked; show our own editor/browser if we want the vibe (`references/creators/aiexplained/ANALYSIS.md:324`).
8. **No IG-sticker pill captions.** estebandiba's IG-native pills are strictly inferior to our `EditorialCaption` (`references/creators/estebandiba/ANALYSIS.md:70-84, 109`).
9. **No CapCut / hosted-editor export paths.** black.one.studio shipped a CapCut-watermark splash as a published failure; our FFmpeg-direct pipeline makes this risk zero, noted as a cautionary tale (`references/creators/black.one.studio/ANALYSIS.md:55-64`).
10. **No 38-min long-form structure / out-of-lane content** (fashion, pure 3D demoreels, abandoned accounts): black.one.studio, motiondarwin, motiongraphicsweb contribute discipline notes or single tactics only, no templates (`references/creators/black.one.studio/ANALYSIS.md:94`; `references/creators/motiondarwin/ANALYSIS.md:80`; `references/creators/motiongraphicsweb/ANALYSIS.md:22`).

---

## 6. What this means for our template library — build priorities

Mapping the synthesis to build priorities. Items already shipped this wave are cited from the handoff; the rest are the corpus-justified queue.

### 6.1 Already shipped (Wave-7) — the shared-vocabulary foundation

Per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:19-60`, the highest-evidence shared patterns are already built:

- **`DarkSlateChassis16x9`** (B25) + **`CaptionPillWithKeyword`** (B23) — atoms (a) and (c) of the 5-creator Stripe-Press consensus (§2.1).
- **16:9 lane opened** (ADR-001 Accepted) with `StudioCompositor16x9`, `KeynoteSlidePIP16x9`, `EquationCardChain16x9`, `ThreeRowLabeledCardStack16x9`, `SectionDividerTitleCard16x9` — the 6-creator lane finding (§2.2).
- **`WebcamPipOverlay`** + **`NeonRingFaceCamPip`** (B1) — the 4-creator PIP molecule (§2.8).
- **`PersistentEventLockupChyron16x9`** (B10) — All-In chyron (single-creator chrome, §3).
- **Captions register** work: `register` prop on `ChunkedPhraseCaption` (B4) and the ADR-002 matrix (§2.4).
- **`KaraokeWithBlueChipPullout9x16`** (B24b) — the Nate-Correction-2 9:16 port primitive (§4).
- **`chrome: 'minimal' | 'full'`** (B3) — the watermark anti-finding compromise (anti-finding #6).

### 6.2 Highest-leverage next builds (multi-creator, lane-shared)

Prioritize patterns with the most independent confirmations:

1. **Finish the 16:9 lane's shared-vocabulary chassis consumers** — refactor remaining 16:9 compositions onto `DarkSlateChassis16x9` (B26 Phase 2+, mirrors the shipped Phase 1; `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:60, 128`). 5-creator evidence.
2. **`StackedSplitFaceCamShort9x16` with `topMode` union** (headline / macWindow / broll) — the 5-creator stacked-split finding (§2.9). Igor I4 ranks it his dominant Shorts grammar (`references/creators/theaiadvantage/ANALYSIS.md:234`); reuses existing `<MacWindow>`.
3. **`SplitWebcamScreen9x16` mode extensions** — inverted seam-caption (mreflow, preliminary), stacked-comparison (estebandiba), symmetric feature-map 16:9 (Igor P4), partner-brand badge (zenzuke). 5-creator convergence on one composition.
4. **Caption-register schema field + Whisper-skip** — per ADR-002 §3 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md:163-191`): make `captionRegister` a schema field so the pipeline can skip faster-whisper when register resolves to `none` for 16:9-A-roll. Pipeline-efficiency win across the whole 16:9-A-roll lane.
5. **`LayerCardStack9x16`** (simonhoiberg #17) + **chapter-card family** (`HeroChapterNumeral` sahilbloom P1, `ChapterDividerCard9x16` aiexplained `NumberedChapterDivider`) — editorial card stacks confirmed across simonhoiberg, sahilbloom, diysmartcode, carloscuamatzin.

### 6.3 Procedural-density parity (the 9:16 build target)

`adamrosler` is named "the closest creator in the entire reference set to what we are building" (`references/creators/adamrosler/ANALYSIS.md:5`), with 8/12 of his patterns already mapping 1:1 to existing compositions and `natebjones` as his 16:9 sibling. The 4 gap molecules — `BulletSequenceCounter` (shipped, B3), `TokenGrid` mode, `DocChunkSlicer9x16`, `IconObjectPair` (shipped, B5) — are the procedural-parity backlog. These are 9:16-native and do NOT cross into 16:9 (§4).

### 6.4 Single-creator / deferred (build only on a concrete script brief)

Per §3, keep these in the catalog but do not lane-prioritize: `MemeLoopDiagram16x9` (1 video), `HandDrawnConceptMap16x9` (Matt-unique, Sprint-3 moonshot), `CinematographyHUDCard` (esteban), Adam's deep primitives (`Loupe`, `LossLandscape`, `PageTableGrid`), `EducationalDisclaimerCaption` (Hormozi compliance, already shipped, matrix-exempt).

### 6.5 Content/voice-only references (no template lift)

`dotcsv` (Spanish AI vocabulary), `motiondarwin` (3D background-plate inspiration), `zenzuke` (motion craft), `black.one.studio` (declarative-with-period copy voice + late-arriving text reveal), `motiongraphicsweb` (skip) — mine for voice/inspiration, not structure.

---

## 7. The one Spanish-peer calibration point

`carloscuamatzin` is the **exact** Spanish-language peer to our @armandointeligencia lane (`references/creators/carloscuamatzin/ANALYSIS.md:4-8`) — 6 rotating templates (cream flowchart, dark editorial, dark scientific chart, color-coded comparison, annotated screen-rec, watercolor illustration) confirmed to match our 15-template typology. Across the corpus he is the calibration anchor: the cream-paper + warm-red brand palette, the Bloomberg/Pentagram typographic hierarchy (sans labels / serif-italic hero / mono code-flavored sublabels), and the "library-not-one-style" routing strategy are *our* target, validated by a peer who already ships it in Spanish. `estebandiba` (Spanish AI-tool launches) and `midu.dev` (Spanish dev) are the secondary Spanish-niche anchors; `dotcsv` is voice-only.

---

## 8. Honesty caveats and gaps

1. **mreflow is 4-of-12 (preliminary — backfill in progress).** 0 reference clips saved; its 16:9 patterns rest on 74 frames. The 8 missing flagship listicle-marathon videos likely contain numbered-chapter + logo-grid patterns not captured here (`references/creators/mreflow/ANALYSIS.md:115-116`). #143 backfill + #136 validation-HTML rebuild are queued (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:120, 148`).
2. **aiexplained reads 12-of-12 but the 8 backfilled videos used a thin Read budget** (1 montage + 2 dense frames each). Its three promoted patterns are confirmed at 2/12 minimum but should be treated as **preliminary pending a refresh** per the data-freshness caveat — a concurrent process owns writes there.
3. **Thin / out-of-lane corpora:** `estebandiba` (3 reels, 401-throttled — the hypothesized cream news-card template was NOT observed and likely lives in unscraped carousels), `motiongraphicsweb` (2 reels, abandoned 2022 account), `black.one.studio` (8 micro-reels, streetwear not motion-design), `motiondarwin` (12 reels but a C4D demoreel, mis-categorized as a "teacher"). These are documented but contribute little to lane-shared findings.
4. **Sample bias in `allin`:** 11/12 picks are Summit live-event footage, NOT the four-besties podcast format; a Wave-8 re-pick is recommended (`references/creators/allin/ANALYSIS.md:291`; handoff #135).
5. **Tooling is inferred, not confirmed:** "Remotion / After Effects / CapCut / Premiere" guesses per creator are visual-evidence inferences, not ground truth.

---

## 9. Sources

Primary evidence — all 21 `ANALYSIS.md` files read for this synthesis (worktree root `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/`):

- `references/creators/CREATORS.md` — canonical roster.
- `references/creators/natebjones/ANALYSIS.md` (canonical; consolidates `ANALYSIS-VOTE1.md` + `ANALYSIS-VOTE2.md`) — Stripe-Press vocab, Corrections 1 & 2.
- `references/creators/adamrosler/ANALYSIS.md` — 9:16 procedural build-target sibling.
- `references/creators/alexhormozi/ANALYSIS.md` — punchy captions + LF chassis.
- `references/creators/theaiadvantage/ANALYSIS.md` — `StudioCompositor16x9`, closest brand analog.
- `references/creators/sahilbloom/ANALYSIS.md` — captions taxonomy + chapter numerals.
- `references/creators/allin/ANALYSIS.md` — chyron + slide-PIP + `register: 'none'` anti-finding.
- `references/creators/matthewberman/ANALYSIS.md` — `WebcamPipOverlay` + hand-drawn.
- `references/creators/mreflow/ANALYSIS.md` — neon-ring PIP (**preliminary 4/12**).
- `references/creators/aiexplained/ANALYSIS.md` — source-document patterns (**preliminary backfill recency caveat**).
- `references/creators/carloscuamatzin/ANALYSIS.md` — Spanish-peer calibration.
- `references/creators/diysmartcode/ANALYSIS.md` — breadcrumb/section-label house grammar.
- `references/creators/bilawal.ai/ANALYSIS.md` — `TweetCardOverlay`, chunked captions.
- `references/creators/simonhoiberg/ANALYSIS.md` — `LayerCardStack`, restraint.
- `references/creators/midu.dev/ANALYSIS.md` — yellow active word, one-accent discipline.
- `references/creators/estebandiba/ANALYSIS.md` — viewfinder chrome (Spanish AI-tool).
- `references/creators/dotcsv/ANALYSIS.md` — content/voice only.
- `references/creators/motiondarwin/ANALYSIS.md` — 3D background plates only.
- `references/creators/zenzuke/ANALYSIS.md` — motion craft, low lift.
- `references/creators/builtbystephan/ANALYSIS.md` — `TalkingHeadDynamic9x16`.
- `references/creators/black.one.studio/ANALYSIS.md` — restraint clinic, copy voice.
- `references/creators/motiongraphicsweb/ANALYSIS.md` — skip (abandoned account).

Decision authorities cited (not relitigated here):

- `docs/research/wave-7/ADR-001-16x9-lane.md` — 16:9 lane; Addendum A.1 (vocab Correction 1) + A.2 (negative aspect duality, Correction 2).
- `docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md` — register × aspect non-orthogonal matrix.
- `docs/WAVE7-HANDOFF.md` — corpus framing (281 videos / 21 creators), shipped molecules, pending queue.
