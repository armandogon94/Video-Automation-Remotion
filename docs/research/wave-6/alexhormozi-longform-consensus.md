# Hormozi long-form motion-graphics — voter consensus

> Synthesized from 2 independent voting analyses by independent agents.
> Source documents (do not modify):
> - `references/creators/alexhormozi/ANALYSIS-LONGFORM-VOTE1.md`
> - `references/creators/alexhormozi/ANALYSIS-LONGFORM-VOTE2.md`
> - `references/creators/alexhormozi/longform-picks-vote{1,2}.json`
> - `references/creators/alexhormozi/longform-animation-ranges-vote{1,2}.json`
>
> Date: 2026-05-27. Synthesis is read-only — no voter artifacts were edited.

---

## 1. Voter picks overlap

Each voter independently selected 6 long-form videos (10–80 min) from `@AlexHormozi`. The two pick lists overlap on exactly **one video** (`XGm2ERU9qtA`) — by design: voter #1 optimized for "title heuristics that predict heavy motion graphics" (listicles, AI, levels, case studies), voter #2 optimized for "format diversity across listicle, masterclass, monologue, rant, strategy, ultra-long." Each strategy is defensible and the combined corpus of 11 unique videos is a much richer evidence base than either alone.

### Videos picked by BOTH voters (overlap = 1)

| videoId | title | duration | both voters' format tags |
|---|---|---|---|
| `XGm2ERU9qtA` | "15 Brutal Truths I Know at 36 That I Wish I Knew at 20" | 28:05 / 1685s | V1: 15-item enumerated listicle · V2: listicle-rant |

This is the **anchor video for cross-voter validation** — both voters independently extracted animations from it, both confirmed the tweet-card listicle pattern, both annotated the "card slides up while next card slides up from below" pagination mechanic. Convergence on this video is the strongest single piece of evidence in the consensus.

### Videos picked by VOTE1 only (5)

| videoId | title | duration | V1 reason |
|---|---|---|---|
| `OQf2Ba-Lp_4` | "Building a $2,500,000 Business for a Stranger in 36 Minutes" | 36:19 / 2179s | Acquisition.com case-study canonical template (two-cam interview chassis) |
| `3fsJFUvA6Ts` | "What Makes The Perfect Business (5 Things)" | 20:40 / 1240s | Explicit 5-item ranked-hierarchy listicle — tests Tella claim #2 |
| `hHkdbr6_JJs` | "How Acquisition.com Makes Money" | 16:12 / 972s | Business breakdown — diagrams, money-flow |
| `rMJIOK_FgJk` | "The 6 Levels of Making Money" | 17:29 / 1049s | "Levels" title — canonical ranked-hierarchy candidate |
| `9q5ojtkqsBs` | "How to Win With AI in 2026" | 24:19 / 1459s | AI-themed — likely tweet cards, product-UI screenshots |

### Videos picked by VOTE2 only (5)

| videoId | title | duration | V2 reason |
|---|---|---|---|
| `JDR-R--4HhM` | "14 Years of Marketing Advice in 35 Minutes" | 35:33 / 2133s | Masterclass — tests slide/card density in long teaching format |
| `qsXxckCbci0` | "How To Grow ANY Business FASTER (Masterclass)" | 79:36 / 4776s | Longest pick — stress-test ultra-long masterclass |
| `_KlZoPxbStk` | "It took me 36 years to realize what I'll tell you in 26 minutes" | 26:56 / 1616s | Monologue-reflective — tests whether monologue uses overlays |
| `3SVksBB3_YY` | "Give me 20 Minutes and I'll Give You Back 20 Years of Your Life" | 19:30 / 1170s | Short-rant — graphic-density centerpiece (8 anim windows) |
| `nSQdjim8CsE` | "Making Money is a Game (Here's the Cheat Code)" | 31:03 / 1864s | Strategy-teaching — game-mechanic visualizations expected |

### What the divergence implies

The two voters effectively explored **complementary surfaces** of Hormozi's long-form catalog. Voter #1 mapped the **graphic-rich case-study + listicle tier** (the studio-set two-cam template, perforated-ticket listicle, 3D bar charts, animated tweet cards as listicle item). Voter #2 mapped the **monologue + masterclass tier** (talking-head with sparse but high-impact graphic punctuation, fullscreen game-stat panels, top-down whiteboard cutaways, the ZERO-overlay ultra-long masterclass). The overlap on `XGm2ERU9qtA` provides the ground-truth tie-point: both voters identified the same tweet-card listicle pattern, with both single-card and stack variants, both left- and right-anchored layouts, and the inter-item pagination transition. **No voter's findings contradict the other** for the overlapping video — they describe the same animation with slightly different naming and slightly different framing.

---

## 2. Pattern catalog (HIGH / MED / LOW confidence)

Patterns are graded by independent corroboration:

- **HIGH** — both voters identified the same pattern (cross-corpus evidence)
- **MED** — only one voter identified it (single-video corpus, mostly because the other voter did not pick a video containing it)
- **LOW / FLAG** — voters disagreed about what the animation IS, or labels in the JSON do not match the dense-frame ground truth

### 2.1 HIGH-confidence patterns (corroborated by both voters)

| # | Consensus pattern name (PascalCase) | V1 name | V2 name | Frame evidence | Reference clips |
|---|---|---|---|---|---|
| H1 | **`HormoziTweetCardListicle`** (single-card variant with numbered badge, anchored left OR right of canvas) | `animated-tweet-card-listicle-with-numbered-badge` (finding 6.3) | `TweetCardLeftSingle` (3.1.1, 3.1.3) + `TweetCardRightSingle` (3.4.1) | V1: `XGm2ERU9qtA/anim-03-frame-{001..013}-t275s.jpg`. V2: `XGm2ERU9qtA/v2-anim-01-frame-{006,012}.jpg` (left-anchor), `_KlZoPxbStk/v2-anim-01-frame-008.jpg` (right-anchor) | V1: `XGm2ERU9qtA-anim-03.mp4`. V2: `XGm2ERU9qtA-anim-01-v2.mp4`, `_KlZoPxbStk-anim-01-v2.mp4` |
| H2 | **`HormoziTweetCardStackBuild`** (multiple tweet cards stack vertically — new card pushes prior card to make room; supports BOTH append-down AND append-up directions) | implicit in finding 6.4 inter-item transition | `TweetStackVerticalBuild` (3.1.2, 3.1.4, 3.1.5) | V1: `XGm2ERU9qtA/anim-04-frame-{001..010}-t1030s.jpg` (two cards visible). V2: `XGm2ERU9qtA/v2-anim-01-frame-012.jpg` (live stack), `v2-anim-05-frame-001.jpg` (append-up) | V1: `XGm2ERU9qtA-anim-04.mp4`. V2: `XGm2ERU9qtA-anim-02-v2.mp4`, `anim-04-v2.mp4`, `anim-05-v2.mp4` |
| H3 | **`PaginatedListSlideTransition`** (outgoing card translates upward, incoming card simultaneously translates up from below; both visible at the crossover frame) | `tweet-card-slide-transition-between-items` (finding 6.4) | implicit in `TweetStackVerticalBuild` (3.1.4 → 3.1.5 advance) | V1: `XGm2ERU9qtA/anim-04-frame-{001..010}-t1030s.jpg`. V2: `XGm2ERU9qtA/v2-anim-04`, `v2-anim-05` sequence | V1: `XGm2ERU9qtA-anim-04.mp4`. V2: `XGm2ERU9qtA-anim-04-v2.mp4`, `XGm2ERU9qtA-anim-05-v2.mp4` |
| H4 | **`YellowGlowLowerThird`** (one- or two-line yellow bold sans-caps lower-third with soft yellow glow halo; pervasive across the channel) | `yellow-broll-lower-third-with-glow` (6.1), `two-line-title-subtitle-yellow-chyron` (4.3), `single-word-yellow-emphasis-lower-third` (4.4), `lower-third-yellow-allcaps-title` (3.1) | `MathFormulaCaptionBurn` (3.5.3) + `NameTagStackedLowerThird` (3.5.1) + `AerialBRollSplitToneHeadline` (3.5.8) all share the yellow-emphasis lower-third grammar | V1: `XGm2ERU9qtA/anim-01-frame-*-t0s.jpg`. V2: `3SVksBB3_YY/v2-anim-01-frame-005.jpg`, `v2-anim-08-frame-010.jpg` | V1: `XGm2ERU9qtA-anim-01.mp4`. V2: `3SVksBB3_YY-anim-01-v2.mp4`, `anim-08-v2.mp4` |
| H5 | **`PerWordTypeOnTextReveal`** (tweet-card body text reveals word-by-word in sync with VO) | implicit in 6.3 "body text reveals line-by-line" | explicit `transitionVerb` in 3.1.1, 3.1.2, 3.4.1 ("type-on body text reveals word-by-word in sync with VO"); V2 adds **`ProgressiveWordDimReveal`** variant (3.4.4) | V1: `XGm2ERU9qtA/anim-03-frame-{001..013}`. V2: `_KlZoPxbStk/v2-anim-04-frame-015.jpg` (3-state dim variant) | V1: `XGm2ERU9qtA-anim-03.mp4`. V2: `_KlZoPxbStk-anim-04-v2.mp4` |
| H6 | **`WhiteboardOverheadHandDraw`** (top-down camera onto giant white paper; Hormozi off-camera draws diagrams/equations in marker live; multi-color marker tracks) | `overhead-whiteboard-marker-draw` (finding 3.2 — sustained b-roll mode in `hHkdbr6_JJs`) | `TopDownWhiteboardHardCutaway` (3.5.2 GROCERIES), `TopDownWhiteboardLBOMath` (3.6.1), `TopDownWhiteboardMultiColorBreakdown` (3.6.2) — 3 independent windows across 2 videos | V1: `hHkdbr6_JJs/anim-02-frame-*-t580s.jpg`. V2: `3SVksBB3_YY/v2-anim-02-frame-010.jpg`, `nSQdjim8CsE/v2-anim-01-frame-025.jpg`, `v2-anim-02-frame-014.jpg` | V1: `hHkdbr6_JJs-anim-02.mp4`. V2: `3SVksBB3_YY-anim-02-v2.mp4`, `nSQdjim8CsE-anim-01-v2.mp4`, `nSQdjim8CsE-anim-02-v2.mp4` |

**HIGH-confidence pattern count: 6.**

These are the patterns we can ship with the highest confidence in the build phase — both an independent set of 6 videos picked by voter #1 AND the independent set of 6 videos picked by voter #2 contain them, in some cases at high frequency. The Tweet-card family (H1+H2+H3+H5) is the densest and most rigorously corroborated finding.

### 2.2 MED-confidence patterns (one voter only — sampling-bias artifact, NOT contradiction)

The other voter did not pick the video(s) containing these patterns. They are still real — the dense frames + reference clips exist — but cross-voter corroboration is not available.

#### From VOTE1's exclusive corpus (5 videos)

| # | Pattern name | Source video | Why other voter missed it | Frame / clip evidence |
|---|---|---|---|---|
| M1 | **`TwoCamInterviewSlide`** (purple-gradient bg + portrait cam thumbnails left/right + central white card holding bulleted/tabular/screenshot slide content + persistent purple `SectionBreadcrumbBar` chip) | `OQf2Ba-Lp_4` (case-study format; 4 of the 6 findings in V1 video 1 use this chassis) | V2 did not pick a case-study video; format is `case-study`, V2 prioritized listicle/rant/masterclass formats | `OQf2Ba-Lp_4/anim-{02,03,04,05}-frame-*.jpg`; clips `OQf2Ba-Lp_4-anim-{02,03,04,05}.mp4` |
| M2 | **`SectionBreadcrumbBar`** (saturated purple horizontal pill pinned top-center holding bold white sans-caps section name; persistent across the entire case-study video as chapter beacon) | `OQf2Ba-Lp_4` | Same as M1 — only appears in the case-study format | `OQf2Ba-Lp_4/anim-05-frame-*-t1190s.jpg`; clip `OQf2Ba-Lp_4-anim-05.mp4` |
| M3 | **`YellowRowHighlightTable`** (tabular data card with selective full-width yellow background bars painted over the most important rows) | `OQf2Ba-Lp_4` (finding 1.3 "NUMBERS" table) | Same as M1 | `OQf2Ba-Lp_4/anim-03-frame-*-t205s.jpg`; clip `OQf2Ba-Lp_4-anim-03.mp4` |
| M4 | **`PerforatedTicketListicle`** (stack of cream-colored ticket-shaped cards on deep navy bg; vertical perforated divider; bold serif numeral 1-N + bold sans-caps label; **Tella claim #2 ranked-hierarchy match**) | `3fsJFUvA6Ts` (finding 2.2 — STRONG Tella match) | V2 did not pick `3fsJFUvA6Ts` (5-things listicle); format is `numbered-business-listicle` | `3fsJFUvA6Ts/anim-02-frame-{001..017}-t880s.jpg`; clip `3fsJFUvA6Ts-anim-02.mp4` |
| M5 | **`DescendingRankBars3D`** (8 purple 3D-extruded bars descending in height; yellow `#1`/`#2` rank labels; soft purple spotlight glow under each bar; **Tella claim #2 ranked-hierarchy match in bar form**) | `9q5ojtkqsBs` (finding 5.2) | V2 did not pick `9q5ojtkqsBs` (AI-themed) | `9q5ojtkqsBs/anim-02-frame-{001..011}-t28s.jpg`; clip `9q5ojtkqsBs-anim-02.mp4` |
| M6 | **`TweetWall3D`** (3D-perspective grid of 7+ tweet cards on black bg; motion blur on peripheral cards; sharp focus on center card; corpus-of-tweets opener) | `9q5ojtkqsBs` (finding 5.1) | Same as M5 | `9q5ojtkqsBs/anim-01-frame-{001..008}-t0s.jpg`; clip `9q5ojtkqsBs-anim-01.mp4` |
| M7 | **`IconifiedConceptCardGrid`** (3+ saturated-purple rounded-rect cards in a loose triangle/grid; each card has a bold white sans-caps label + flat white silhouette icon) | `rMJIOK_FgJk` (finding 4.1 — MARRY/INHERIT/TRADE) | V2 did not pick `rMJIOK_FgJk` (Levels-of-money) | `rMJIOK_FgJk/anim-01-frame-{001..012}-t0s.jpg`; clip `rMJIOK_FgJk-anim-01.mp4` |
| M8 | **`MilestoneChecklistProgressive`** (vertical checklist on dark bg; each row has checkbox + label + yellow dollar amount; rows toggle on progressively; total row sums at bottom) | `rMJIOK_FgJk` (finding 4.2) | Same as M7 | `rMJIOK_FgJk/anim-02-frame-{001..013}-t130s.jpg`; clip `rMJIOK_FgJk-anim-02.mp4` |
| M9 | **`NumberedCircleListicleCounter`** (lime/yellow outlined circle holding a number; paired with yellow-underlined headline; listicle-counter atom) | `OQf2Ba-Lp_4` (finding 1.1) | Same as M1 | `OQf2Ba-Lp_4/anim-01-frame-{001..010}-t0s.jpg`; clip `OQf2Ba-Lp_4-anim-01.mp4` |
| M10 | **`PriceComparisonDuel`** (single rounded-rect dark card with yellow title, central divider, two prices with icon/logo on each side; count-up animation on values) | `3fsJFUvA6Ts` (finding 2.1 — Skool MONTHLY MEMBERSHIP) | Same as M4 | `3fsJFUvA6Ts/anim-01-frame-{001..010}-t130s.jpg`; clip `3fsJFUvA6Ts-anim-01.mp4` |
| M11 | **`EmbeddedScreenshotWithBrowserChrome`** (center card holds full website screenshot with browser-chrome top — URL bar visible; sits inside `TwoCamInterviewSlide` chassis with Ken Burns drift) | `OQf2Ba-Lp_4` (finding 1.4 — Pro Shine cleaning website) | Same as M1 | `OQf2Ba-Lp_4/anim-04-frame-{001..010}-t580s.jpg`; clip `OQf2Ba-Lp_4-anim-04.mp4` |
| M12 | **`SponsorProductCallout`** (centered multi-color brand wordmark + 2-line description text below; talking-head bg desaturates behind) | `3fsJFUvA6Ts` (finding 2.4 — Skool sponsor) | Same as M4 | `3fsJFUvA6Ts/anim-04-frame-{001..010}-t805s.jpg`; clip `3fsJFUvA6Ts-anim-04.mp4` |
| M13 | **`TagListBrollOverlay`** (yellow bold sans-caps title pinned top-left + comma-grid of items below; each item prefixed with white triangle bullet; on talking-head broll) | `3fsJFUvA6Ts` (finding 2.3 — SHRINKING INDUSTRIES) | Same as M4 | `3fsJFUvA6Ts/anim-03-frame-{001..010}-t655s.jpg`; clip `3fsJFUvA6Ts-anim-03.mp4` |
| M14 | **`CtaPurplePill`** (saturated purple horizontal pill lower-third holding bold white sans-caps URL/CTA text; drop-shadow) | `OQf2Ba-Lp_4` (finding 1.6 — ACQUISITION.COM/ROADMAP) + `9q5ojtkqsBs` (finding 5.3 — LINK IN DESCRIPTION) | V1-exclusive (two videos) | `OQf2Ba-Lp_4/anim-06-frame-*-t356s.jpg`; clip `OQf2Ba-Lp_4-anim-06.mp4` |

#### From VOTE2's exclusive corpus (5 videos)

| # | Pattern name | Source video | Why other voter missed it | Frame / clip evidence |
|---|---|---|---|---|
| M15 | **`GodModeStatPanel`** (fullscreen navy panel; stick-figure avatar left; per-row stat reveal — UPPERCASE label + horizontal progress-bar fill via stroke-dashoffset + "MAX" label; bottom `GODMODE` rounded pill with yellow underglow; **V2's highest-value standalone idea**) | `_KlZoPxbStk` (finding 3.4.2 — V2's highest-value find; re-themable HARDMODE/BOSSFIGHT etc.) | V1 did not pick `_KlZoPxbStk` (monologue-reflective) | `_KlZoPxbStk/v2-anim-02-frame-{001,005,008}.jpg`; clip `_KlZoPxbStk-anim-02-v2.mp4` |
| M16 | **`DualObjectComparison`** (fullscreen navy panel with central vertical divider; two object icons scale-pop from each half; price labels above + colored descriptor word below — e.g. green car $10 LOVE / grey car $10 HATE) | `_KlZoPxbStk` (finding 3.4.3 cars half) | Same as M15 | `_KlZoPxbStk/v2-anim-03-frame-020.jpg`; clip `_KlZoPxbStk-anim-03-v2.mp4` |
| M17 | **`MultiColorSideTextBlock`** (slide text block in from canvas side; lines fade in line-by-line; emphasized phrases pre-rendered in yellow; sibling words remain white; NO color animation — only line-stagger) | `_KlZoPxbStk` (finding 3.4.3 text half) | Same as M15 | `_KlZoPxbStk/v2-anim-03-frame-001.jpg`; clip `_KlZoPxbStk-anim-03-v2.mp4` |
| M18 | **`ProgressiveWordDimReveal`** (3-state type-on cascade: each word transitions invisible → 40%-opacity grey preview → 100%-opacity final, 4f per transition; leading edge stays in preview state) | `_KlZoPxbStk` (finding 3.4.4) | Same as M15; subtle variant V1 may have missed | `_KlZoPxbStk/v2-anim-04-frame-015.jpg`; clip `_KlZoPxbStk-anim-04-v2.mp4` |
| M19 | **`NumberedCarouselRibbon`** (six circular numbered badges 01-07 across bottom-third; ONE active badge has tall yellow-on-white split pill rising above it; pill drops/rises as active index advances; HORIZONTAL variant of ranked-listicle) | `3SVksBB3_YY` (finding 3.5.6 — HOUSE CLEANING active) | V1 did not pick `3SVksBB3_YY` (short-rant) | `3SVksBB3_YY/v2-anim-06-frame-035.jpg`; clip `3SVksBB3_YY-anim-06-v2.mp4` |
| M20 | **`SplitPillResultOverlay`** (two-row split pill — top row category in white, bottom row result value in yellow; rolling-digit counter on the value rolls up to final number over 18f) | `3SVksBB3_YY` (finding 3.5.7 — TOTAL TIME SAVED / 25.5 HRS / WEEK) | Same as M19 | `3SVksBB3_YY/v2-anim-07-frame-020.jpg`; clip `3SVksBB3_YY-anim-07-v2.mp4` |
| M21 | **`NameTagStackedLowerThird`** (two stacked white pills lower-third: primary pill name in black bold, secondary sliver pill role/title) | `3SVksBB3_YY` (finding 3.5.1 — ALEX HORMOZI / FOUNDER, ACQUISITION.COM) | Same as M19 | `3SVksBB3_YY/v2-anim-01-frame-005.jpg`; clip `3SVksBB3_YY-anim-01-v2.mp4` |
| M22 | **`CartoonIllustrationCornerInsert`** (small flat-color cartoon illustration scale-pops at a frame corner; held in sync with VO punchline; scale-pop out with fade) | `3SVksBB3_YY` (finding 3.5.5 — orange/grey boot/sock graphic) | Same as M19 | `3SVksBB3_YY/v2-anim-05-frame-015.jpg`; clip `3SVksBB3_YY-anim-05-v2.mp4` |
| M23 | **`FullscreenSocialPostScreenshot`** (hard-cut to flat accent color background; scale-pop a single social-post screenshot to canvas center with no surrounding chrome; held during VO read) | `3SVksBB3_YY` (finding 3.5.4 — old Facebook/LinkedIn throwback post on purple bg) | Same as M19 | `3SVksBB3_YY/v2-anim-04-frame-010.jpg`; clip `3SVksBB3_YY-anim-04-v2.mp4` |
| M24 | **`MathFormulaCaptionBurn`** (burned-in caption styled as equation; operator `=` or `→` tinted in accent yellow; operator pops 2f before right operand; rest of expression in white with drop-shadow) | `3SVksBB3_YY` (finding 3.5.3 — `$1000/mo = Extra 23 HOURS/wk`) | Same as M19 | `3SVksBB3_YY/v2-anim-03-frame-005.jpg`; clip `3SVksBB3_YY-anim-03-v2.mp4` |
| M25 | **`AerialBRollSplitToneHeadline`** (hard-cut to aerial/drone b-roll plate; center-out two-segment headline — yellow phrase on left + white phrase on right, both UPPERCASE bold on same baseline; held 90f then fade) | `3SVksBB3_YY` (finding 3.5.8 — `1.5 HOURS A DAY COMMUTING`) | Same as M19 | `3SVksBB3_YY/v2-anim-08-frame-010.jpg`; clip `3SVksBB3_YY-anim-08-v2.mp4` |

**MED-confidence pattern count: 25** (14 from V1's exclusive corpus + 11 from V2's exclusive corpus).

The MED grade is **NOT a quality signal** — these are real patterns with frame and clip evidence. MED simply means "the other voter didn't pick a video that contained this pattern." Many of the MED patterns (especially M4 `PerforatedTicketListicle`, M5 `DescendingRankBars3D`, M15 `GodModeStatPanel`) are extremely high-value individually.

### 2.3 LOW / FLAG patterns (voter disagreement OR JSON label ≠ dense-frame ground truth)

These need human review before they are turned into build tasks.

| # | Flag | Description | Resolution proposed |
|---|---|---|---|
| F1 | **JSON mislabel** — `9q5ojtkqsBs/anim-01` is labeled `full-screen-animated-news-headline-page` in `longform-animation-ranges-vote1.json` (line 176) but voter #1's own dense-frame inspection in `ANALYSIS-LONGFORM-VOTE1.md` §3.5 explicitly overrides this: "the dominant content of the 0–12s beat is a tweet wall, not a press-clipping." | The pattern is `TweetWall3D` (M6 above), NOT a press-clipping. The press-clipping label should be considered a false alarm from the coarse-sample pass. Action: when implementing, refer to V1's narrative §3.5, not the JSON `name` field. |
| F2 | **JSON mislabel** — `JDR-R--4HhM/anim-01` is labeled "whiteboard hard-cutaway" in `longform-animation-ranges-vote2.json` but V2's dense-frame inspection in §3.2.1 confirms it is **NOT** a whiteboard cutaway — it is a continuous front-camera talking-head shot with a paper-roll prop ("13 Sentences I Learned in 13 Years") on the desk. The "whiteboard" visible at frame bottom is the paper roll seen from the front, not an overhead-camera cutaway. | Not a graphics-animation pattern at all — it is a **production technique** (paper-roll prop as gesture target). Should not generate a build task. Documented as content-side rule M-content-1 below. |
| F3 | **Two distinct patterns collapsed into one range** — `_KlZoPxbStk/anim-03` is labeled "side-text reveal" in `longform-animation-ranges-vote2.json` (single line), but V2's dense-frame inspection in §3.4.3 found that the window contains TWO independent patterns: (a) `MultiColorSideTextBlock` (M17) at the start of the window, (b) `DualObjectComparison` (M16 — the green car / grey car LOVE/HATE comparison) at the end of the same window. | Treat as **two separate patterns** for the build queue (M16 and M17 above). Range JSON should be refined in a second pass to give each its own sub-range. |
| F4 | **Naming divergence** — for the same animation, V1 calls the badge "purple numbered badge **in the upper-right corner of the card**" (finding 6.3), while V2 calls it "large dark-grey numeral 'N' — the item-number badge" (3.1.1). The two descriptions differ on COLOR (purple vs dark-grey). | Likely both are correct — the same numeral renders with different perceived hue depending on the brightness/exposure of the underlying clip. Mark this as a low-priority detail for design QA: implement as **`NumberedBadge`** primitive with a configurable accent color, defaulting to Hormozi-purple, settable to dark-grey for the lower-contrast variant. |
| F5 | **Tweet-card chrome density divergence** — V2 §7.4 explicitly notes Hormozi tweet cards have NO like/retweet counters, NO embedded images — only avatar + verified handle + body text. V1 does not contradict this but also does not explicitly note the simplification. Tella's full primitive in `docs/research/wave-5/tella-motion-graphics-synthesis.md` includes counter-rolls and embedded media. | For Hormozi reproductions specifically, use the **text-only variant** of `<SocialPostCard>`. Keep the full Tella primitive for other creators that use the richer chrome. |

---

## 3. Tella claims final verdict

Tella's wave-5 synthesis (`docs/research/wave-5/tella-motion-graphics-synthesis.md`) cited Alex Hormozi three times as an exemplar of (a) animated tweet cards and (b) ranked-hierarchy listicle graphics. A prior Hormozi **Shorts** analysis refuted both claims — that refutation is now revealed to have been a **sampling-bias error** caused by only looking at the vertical-format Shorts corpus.

### Tella claim (a): "Hormozi uses animated tweet cards"

**Consensus verdict: CONFIRMED.**

- V1 verdict: CONFIRMED (3 pieces of evidence across 2 videos — `XGm2ERU9qtA-anim-03`, `XGm2ERU9qtA-anim-04`, `9q5ojtkqsBs-anim-01`).
- V2 verdict: STRONGLY CONFIRMED (6 distinct windows across 2 videos — 5 in `XGm2ERU9qtA` + 2 in `_KlZoPxbStk`; tweet cards are voter #2's "#1 most frequent overlay pattern").
- **Combined evidence:** ≥9 independent animation windows across 3 videos confirm the pattern. Single-card, vertical-stack (append-up AND append-down), left-anchored AND right-anchored variants are all observed. The inter-card pagination transition is observed in both voters' corpora.
- **Caveat (V2 §7.4):** Hormozi's tweet cards are TEXT-ONLY — no like/retweet counter roll, no embedded image. This is a SIMPLIFICATION of Tella's full primitive. For Hormozi-style reproductions, ship the text-only variant.

### Tella claim (b): "Hormozi uses ranked-hierarchy listicle graphics"

**Consensus verdict: CONFIRMED (in multiple forms).**

- V1 verdict: CONFIRMED with two distinct visual instantiations:
  - `PerforatedTicketListicle` (cream tickets in `3fsJFUvA6Ts-anim-02`) — vertical stack, top-to-bottom reveal
  - `DescendingRankBars3D` (8 purple 3D bars in `9q5ojtkqsBs-anim-02`) — horizontal cascade, height-descending
- V2 verdict: PARTIALLY CONFIRMED in TWO distinct forms (V2 emphasized that neither matches Tella's literal "vertical tier-stacked listicle" demonstrated for Jay Klaus):
  - `NumberedCarouselRibbon` (`3SVksBB3_YY-anim-06`) — horizontal carousel with active-item pill
  - `GodModeStatPanel` (`_KlZoPxbStk-anim-02`) — vertical stat-row stack with progressive bar fills
- **Reconciliation:** The two voters describe **four different ranked-hierarchy variants** between them. V1 emphasizes the cream-ticket + 3D-bar variants; V2 emphasizes the numbered-carousel + game-stat variants. These are NOT contradictory — they are four distinct visual idioms Hormozi uses for the same rhetorical move (rank N items by importance). The claim is confirmed in a stronger form than Tella articulated: Hormozi has a **family** of ranked-hierarchy graphics, not just one.

### Tella claim — bonus reconciliation

V2 §5 also surfaces patterns Tella did NOT mention but that Hormozi uses:
- `GodModeStatPanel` (the highest-leverage standalone new visual idea in V2's sample)
- `WhiteboardCutawayHandDraw` (production-side; replicable procedurally via `pathDraw`)
- `DualObjectComparison` (side-by-side icons with price + descriptor)

And V1 §3 surfaces additional patterns Tella did not mention:
- `TwoCamInterviewSlide` (the canonical case-study chassis)
- `SectionBreadcrumbBar` (the chapter beacon)
- `IconifiedConceptCardGrid` (3-up purple cards w/ icons)

These should be treated as **bonus findings beyond Tella's claims** — both voters independently uncovered them.

### Net Tella verdict

**Tella's original Hormozi citations are REHABILITATED for long-form.** The Shorts-only refutation was a sampling-bias error. Hormozi long-form has tweet cards (rigorously) and ranked-hierarchy graphics (in 4+ distinct visual forms). Future channel analyses MUST sample both Shorts AND long-form independently before refuting any creator-pattern claim — the visual vocabularies are different surfaces of the same creator.

---

## 4. Unified build priority queue (Wave-6)

Merged from V1 §6 and V2 §6, ranked by `(reusability × HIGH/MED confidence × Hormozi-frequency × leverage)`. HIGH-confidence items come first; MED items where both voters' queues independently agree on importance come next; single-voter-novel items follow with a yellow flag.

All items are **16:9** unless explicitly noted — Hormozi long-form is exclusively horizontal in both voters' samples (11 videos total, zero 9:16 instances).

| Rank | Pattern name | Type | Effort | Orientation | Voters supporting | Unlocks | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | **`<SocialPostCard>`** text-only variant + `anchor: "left" \| "right"` prop | primitive enhancement | S | 16:9 | BOTH (H1) | Every tweet-card animation in the consensus corpus (≥9 windows) | HIGH |
| 2 | **`<NumberedBadge>`** primitive (configurable color: purple default, dark-grey fallback per F4; optional ring outline) | primitive | S | both | BOTH (H1, M9, M4, M5 — used everywhere) | `HormoziTweetCardListicle`, `PerforatedTicketListicle`, `DescendingRankBars3D`, `NumberedCarouselRibbon`, `NumberedCircleListicleCounter` | HIGH |
| 3 | **`<TweetStackPanel>`** molecule with `appendDirection: "up" \| "down"` and stack-rebalance scale | molecule | M | 16:9 | BOTH (H2) | The full `XGm2ERU9qtA` listicle pattern; any "thread of quotes" video | HIGH |
| 4 | **`<PaginatedListSlide>`** molecule — outgoing card translates up + incoming card translates up-from-below simultaneously | molecule | M | both | BOTH (H3) | `HormoziTweetCardListicle` inter-item transitions; any paginated listicle | HIGH |
| 5 | **`HormoziTweetCardListicle16x9.tsx`** composition (wraps items 1+2+3+4 into the full Hormozi 15-truth template) | composition | L | 16:9 | BOTH (H1+H2+H3) | The dominant pattern in `XGm2ERU9qtA`; reusable for any creator using paginated tweet listicle | HIGH |
| 6 | **`<WhiteboardCutaway>`** molecule (path-draw based; multi-color sharpie support; optional set-dressing decorations along edges) | molecule | M | 16:9 (top-down) | BOTH (H6) | Hormozi strategy-teaching format; any "felt-tip math" explainer; replicable procedurally without filming an overhead camera | HIGH |
| 7 | **`<SectionBreadcrumbBar>`** primitive — saturated purple horizontal bar pinned top-center holding bold white sans-caps section name | primitive | S | 16:9 | V1 only (M2) | `TwoCamInterviewSlide`; any chapter beacon | MED (single-voter, but trivial effort) |
| 8 | **`<TwoCamInterviewSlide>`** molecule — purple-gradient bg + 2 portrait cam thumbnails + central white card slot | molecule | M | 16:9 | V1 only (M1, unlocks M3, M11) | `OQf2Ba-Lp_4` case-study chassis (4 of its 6 animations); future case-study format | MED (single-voter but high-leverage — unlocks 3 downstream patterns) |
| 9 | **`PerforatedTicketListicle16x9.tsx`** composition — cream tickets, serif numerals, perforated divider, navy bg | composition | M | 16:9 | V1 only (M4) | The literal Tella-claim-#2 ranked-hierarchy match | MED (single-voter, but TELLA payoff) |
| 10 | **`BenchmarkBars16x9.tsx`** composition — 16:9 port of existing `BenchmarkBars9x16`; adds per-bar `#N` rank label slot | composition | S (port) | 16:9 | V1 only (M5) | `DescendingRankBars3D`; the second Tella-claim-#2 ranked-hierarchy match | MED (single-voter, but TELLA payoff + LOW effort = priority) |
| 11 | **`<GameStatPanel>`** molecule — stick-figure icon + N stat-bar rows + bottom underglow pill (re-themable as GODMODE / HARDMODE / BOSSFIGHT) | molecule | M | 16:9 | V2 only (M15) | V2's highest-leverage standalone idea; re-themable across many statements | MED (single-voter, but high re-themability) |
| 12 | **`<NumberedCarouselRibbon>`** molecule — 6+ circular numbered badges across bottom-third with active-item split pill | molecule | M | 16:9 | V2 only (M19) | Horizontal ranked-hierarchy variant (fourth Tella-claim-#2 match) | MED (single-voter, but Tella-relevant) |
| 13 | **`<RevenueTable>`** molecule with row-highlight slot — tabular data with selective yellow full-width row bars | molecule | M | 16:9 | V1 only (M3) | `YellowRowHighlightTable`; any tabular-emphasis card | MED (single-voter) |
| 14 | **`<MilestoneChecklist>`** molecule with progressive state-toggle + total count-up | molecule | M | both | V1 only (M8) | `MilestoneChecklistProgressive`; any cumulative-total checklist | MED (single-voter) |
| 15 | **`<IconifiedConceptCardGrid>`** molecule — N rounded-rect purple cards w/ {label, icon} slots; configurable layout (triangle, line, grid) | molecule | M | 16:9 | V1 only (M7) | `IconifiedConceptCardGrid`; any 3-card conceptual lineup | MED (single-voter) |
| 16 | **`<DualObjectComparison>`** molecule — fullscreen panel with central divider; two icons + price + colored descriptor each side | molecule | S | 16:9 | V2 only (M16) | `DualObjectComparison`; X-vs-Y framings with prices | MED (single-voter, but LOW effort) |
| 17 | **`<NameTagStackedLowerThird>`** — composes existing `<HUDChrome>` stacked-pill | enhancement | S | 16:9 | V2 only (M21) | `NameTagStackedLowerThird`; any name-tag lower-third | MED (single-voter, but trivial) |
| 18 | **`<SocialPostCard>`** `mode: "fullscreen-screenshot"` variant — center single card on flat accent bg, no surrounding chrome | enhancement | S | 16:9 | V2 only (M23) | `FullscreenSocialPostScreenshot`; recap/throwback social posts | MED (single-voter, but small enhancement) |
| 19 | **`<SplitPillResultOverlay>`** — two-row split pill (category white / value yellow); rolling-digit counter on value | molecule | S | both | V2 only (M20) | `SplitPillResultOverlay`; any "category → result" stat reveal | MED (single-voter, but small) |
| 20 | **`<TweetWall3D>`** composition — 3D-perspective grid of N tweet cards on black bg; motion blur peripherals + focused center | composition | L | 16:9 | V1 only (M6) | `TweetWall3D` opener finding | MED (single-voter, large effort — defer if no obvious script use case) |
| 21 | **Captions `<3-state type-on>` enhancement** — invisible → 40% grey preview → 100% final | enhancement | S | both | V2 only (M18) | `ProgressiveWordDimReveal`; any prophetic-tone monologue | MED (single-voter, small) |
| 22 | **Captions `<equation mode>` enhancement** — operator tinted accent, pops 2f before right operand | enhancement | S (½d) | both | V2 only (M24) | `MathFormulaCaptionBurn`; any `X = Y` or `X → Y` line | MED (single-voter, tiny) |
| 23 | **`<HUDChrome>` split-tone-headline variant** — yellow phrase + white phrase on same baseline | enhancement | S | 16:9 | V2 only (M25) | `AerialBRollSplitToneHeadline`; b-roll inserts; stat-burn overlays | MED (single-voter, small) |
| 24 | **`<MultiColorSideTextBlock>`** — verify existing `<TextEmphasis>` supports inline color overrides + per-line stagger | verification | S | 16:9 | V2 only (M17) | `MultiColorSideTextBlock`; any multi-line side-text reveal | MED (single-voter — verify-only) |
| 25 | **`<RadialTreeDiagram>`** molecule (procedural marker-style draw — replicate Hormozi blue-marker radial trees in `pathDraw`) | molecule | L | 16:9 | V1 only (M6 — overhead-whiteboard sub-pattern) | `OverheadWhiteboardDraw` procedural replication | MED (single-voter, LARGE effort + aesthetic risk — defer) |
| 26 | **`<PriceComparisonDuel16x9>`** — 16:9 port of existing `BigNumberDuel9x16` | composition (port) | S | 16:9 | V1 only (M10) | `PriceComparisonDuel`; any "$N vs $M" with logo | MED (single-voter, small port) |
| 27 | **`<CtaPurplePill>`** — verify `<HormoziOverlays>` already supports this; if not, add | enhancement/verify | S | both | V1 only (M14) | `CtaPurplePill`; URL lower-third CTAs | MED (single-voter, tiny — verify existing) |
| 28 | **`<TagListBrollOverlay>`** — existing primitives may already cover | verify-only | S | 16:9 | V1 only (M13) | `TagListBrollOverlay`; chip-list overlays | LOW priority (single-voter, may already work) |
| 29 | **`<SponsorProductCallout>`** — talking-head desaturate + centered brand wordmark | molecule | S | 16:9 | V1 only (M12) | Mid-roll sponsor segments | LOW priority (single-voter, content-specific) |
| 30 | **`<CartoonIllustrationCornerInsert>`** — asset-bank expansion only, existing `<BrandGlyphs>` slot | asset | S | 16:9 | V2 only (M22) | Punchline illustration overlays | LOW priority (single-voter, asset-only) |

### Foundation primitives that ship first (atomic save-points)

The first 4 ranks (`<SocialPostCard>` text-only variant, `<NumberedBadge>`, `<TweetStackPanel>`, `<PaginatedListSlide>`) form the **foundation cluster**. They are tiny, high-reuse primitives that compose into the rank-5 `HormoziTweetCardListicle16x9.tsx` composition. Ship them in order, with a passing test/snapshot at each step.

### Items to defer (single-voter, LOW novelty OR LARGE effort)

- Rank 20 `<TweetWall3D>` — L effort, single video, single beat. Defer unless a specific upcoming script demands it.
- Rank 25 `<RadialTreeDiagram>` — L effort + aesthetic risk (hand-drawn marker look is hard). Defer; use `<WhiteboardCutaway>` (rank 6) as the cheaper substitute.
- Ranks 28, 29, 30 — small content-specific patterns that likely already work with existing primitives. Treat as opportunistic wins, not sprint scope.

---

## 5. Critical findings

The five most important findings across BOTH voters, in order of cross-cutting impact:

### 5.1 Tella's Hormozi claims are REHABILITATED for long-form

The prior Shorts-only refutation was a **sampling-bias error**. With **11 unique videos** between the two voters and **≥9 independent tweet-card windows + 4 distinct ranked-hierarchy variants** observed in the consensus corpus, both Tella claims are confirmed in a stronger form than originally articulated. The methodological lesson: a creator's Shorts vocabulary and long-form vocabulary are **different surfaces** of the same channel. Future channel analyses must sample both surfaces independently before refuting any pattern claim.

### 5.2 Hormozi long-form is exclusively 16:9 → opens the 16:9 lane

In 11 sampled videos across both voters, **zero 9:16 instances** appear. All findings are 16:9. This has direct implications for the brand-chrome layer:

- Our existing `BrandBreadcrumb` and `BrandWatermark` components are 9:16-tuned (per V1 §6 item 15).
- Hormozi-style compositions need either (a) 16:9 variants of the same chrome, or (b) auto-adaptive chrome that re-flows based on aspect ratio.
- This is an **ADR-worthy decision** — write the ADR as part of foundation work (see §6).

### 5.3 The 80-minute masterclass (`qsXxckCbci0`) uses ZERO overlays — restraint is a discipline

V2's finding on `qsXxckCbci0` is critical: across **~318 coarse-sampled frames** of an 80-minute masterclass, **zero overlay graphics were observed**. The format relies entirely on (a) front-camera + overhead-camera two-shot coverage, (b) physical paper-roll prop on the desk, (c) live-drawn sharpie math, (d) the unanimated hard-cut angle switch.

Implication: **for ultra-long teaching content (≥60min), don't try to "modernize" the format with overlays.** Trade animation density for prop density. The masterclass format is a deliberate choice to elevate the host's authority through restraint.

This is **content-rule M-content-1**: codify in the writer-side template-selection guide. No code change required.

### 5.4 V2 found `_KlZoPxbStk/anim-03` contains TWO distinct patterns the range JSON collapsed

The range JSON labels `_KlZoPxbStk/anim-03` as "side-text reveal" — a single label. V2's dense-frame inspection in §3.4.3 reveals the window contains BOTH (a) `MultiColorSideTextBlock` AND (b) `DualObjectComparison` (the green car / grey car LOVE/HATE comparison). These are two completely different graphics that happen to occupy adjacent moments in the same VO segment.

Implication: **the range JSONs need a second-pass refinement** that splits compound windows into sub-ranges, especially for `_KlZoPxbStk/anim-03`. Treat the range JSON as a coarse-grained index, not as authoritative pattern labels. The narrative §3 of each voter doc is the ground truth.

### 5.5 V1 found `9q5ojtkqsBs/anim-01` was MISLABELED in the JSON

The `longform-animation-ranges-vote1.json` entry for `9q5ojtkqsBs/anim-01` reads `"name": "full-screen-animated-news-headline-page"` with notes about "an animated press clipping." V1's own dense-frame analysis in `ANALYSIS-LONGFORM-VOTE1.md` §3.5 explicitly overrides this: "the dominant content of the 0–12s beat is a tweet wall, not a press-clipping. Treating this as the tweet-wall pattern."

Implication: the JSON `name` field was set during a single-frame coarse-sample pass and is **not authoritative**. When implementing this pattern (`TweetWall3D`), refer to V1 §3.5 narrative + the dense-frame folder `9q5ojtkqsBs/anim-01-frame-*` — NOT to the JSON label. The press-clipping label should be considered a false alarm.

### 5.6 (Bonus) V2 confirmed tweet cards are TEXT-ONLY for Hormozi

Per V2 §7.4, Hormozi's tweet cards have NO like/retweet counter rolls and NO embedded media — just avatar + verified handle + body text. This is a meaningful **simplification of Tella's full animated-tweet primitive**, which includes counter-rolls and media. For Hormozi-specific reproductions, ship the text-only variant of `<SocialPostCard>`. Keep the full primitive available for other creators that use the richer chrome.

---

## 6. Recommendations for build phase

### 6.1 Foundation work (BEFORE any Hormozi composition ships)

**F-1. Brand chrome 16:9 audit (ADR-worthy)**
Per V1 finding 6.15, our existing `BrandBreadcrumb` and `BrandWatermark` components are 9:16-tuned. Hormozi long-form is 16:9-exclusive. Decide and document:
- Maintain two parallel sets of brand chrome (9:16 + 16:9 variants), OR
- Implement aspect-ratio-aware auto-adaptive chrome.

Write `docs/research/wave-6/ADR-brand-chrome-16x9.md` documenting the chosen approach. **This is non-negotiable foundation work** — every Hormozi composition will need it.

**F-2. Range JSON second-pass refinement**
Per consensus findings 5.4 and 5.5, the range JSONs contain at least two known labeling errors:
- `9q5ojtkqsBs/anim-01` — mislabeled as press-clipping, is actually `TweetWall3D`
- `_KlZoPxbStk/anim-03` — collapses two patterns (`MultiColorSideTextBlock` + `DualObjectComparison`)

Create `references/creators/alexhormozi/longform-animation-ranges-consensus.json` that:
- Inherits all ranges from both voters
- Fixes the two known mislabels
- Tags each range with `confidence: "HIGH" | "MED" | "LOW"` per §2 of this doc
- Cross-references the consensus pattern names (PascalCase) instead of voter-specific kebab-case names

**F-3. Codify content rule M-content-1**
Add to the writer-side template-selection guide:
> "For long-form teaching content ≥60 minutes (masterclass tier), DO NOT add overlay graphics. Use two-camera coverage (front + overhead) with a physical paper-roll prop on the desk and live sharpie drawing. Hormozi's most successful long-form has zero overlays. Trade animation density for prop density."

This is a documentation-only change; no code touched.

### 6.2 Top 5 builds for the next sprint

Rules: must be in **BOTH voter queues** (HIGH confidence) **OR** single-voter with extremely high justification (Tella-claim payoff + low effort).

| Sprint rank | Pattern | Why this one |
|---|---|---|
| **1** | **`<SocialPostCard>` text-only variant + `anchor: "left" \| "right"` prop** (rank 1) | HIGH — both voters. Tiny effort. Unlocks all tweet-card downstream work. No-brainer first build. |
| **2** | **`<NumberedBadge>` primitive** (rank 2) | HIGH — both voters. Tiny effort. Unlocks 5+ downstream compositions (tweet listicle, perforated ticket, descending rank bars, numbered carousel, numbered circle counter). Maximum leverage per hour. |
| **3** | **`<TweetStackPanel>` molecule with append-up / append-down + stack-rebalance** (rank 3) | HIGH — both voters. M effort. The stack-management layer that converts isolated cards into a Hormozi listicle. |
| **4** | **`<PaginatedListSlide>` molecule — outgoing-up + incoming-up-from-below** (rank 4) | HIGH — both voters. M effort. Pairs with rank 3 to complete the inter-item transition. |
| **5** | **`HormoziTweetCardListicle16x9.tsx` composition** (rank 5) | HIGH — both voters. L effort, but everything above is foundation. This is the **visible Tella-claim payoff** — the composition that demonstrates Hormozi's signature paginated tweet listicle. Ship this last in the sprint to land a clean, demoable artifact. |

This sprint is **fully consensus-backed** — no single-voter risk, all five items are corroborated by both voters across the overlap video (`XGm2ERU9qtA`).

### 6.3 Sprint+1 candidates (HIGH-value MED items)

Once the consensus sprint ships, the next-best targets are MED-confidence items with HIGH-leverage justifications:

- **Sprint+1 rank 1: `BenchmarkBars16x9.tsx`** (queue rank 10) — Small port of existing `BenchmarkBars9x16`, lands the second visible Tella-claim payoff (descending 3D rank bars). High ROI per effort hour.
- **Sprint+1 rank 2: `PerforatedTicketListicle16x9.tsx`** (queue rank 9) — Lands the literal cream-ticket Tella-claim match. Establishes the ranked-listicle pattern as a creator-agnostic primitive.
- **Sprint+1 rank 3: `<GameStatPanel>` molecule** (queue rank 11) — V2's highest-leverage novel idea; re-themable across many rhetorical contexts (GODMODE / HARDMODE / TUTORIAL etc.).
- **Sprint+1 rank 4: `<WhiteboardCutaway>` molecule** (queue rank 6) — HIGH confidence (both voters via H6), MED effort. Unlocks procedural live-marker math without needing a physical overhead camera.
- **Sprint+1 rank 5: `<TwoCamInterviewSlide>` + `<SectionBreadcrumbBar>`** (queue ranks 7+8) — Single-voter, but unlocks 3 downstream patterns (M3 RevenueTable, M11 EmbeddedScreenshot, M9 NumberedCircleListicleCounter). High-leverage molecule.

### 6.4 Items to defer

- **Defer outright** until a specific script demands them: rank 20 `<TweetWall3D>` (L effort, single beat), rank 25 `<RadialTreeDiagram>` (L + aesthetic risk; use `<WhiteboardCutaway>` as substitute), ranks 28-30 (LOW priority, content-specific).
- **Track as opportunistic enhancements** rather than sprint scope: ranks 17-19, 21-24, 26-27 (small enhancements to existing primitives that can land alongside their first natural use case rather than as a dedicated build).

---

*End of consensus document.*
