# @matthew_berman (YouTube long-form + Shorts) — visual + motion analysis

> **Creator:** Matthew Berman — 611K-subscriber AI/LLM news + tools commentator. English-language, US developer audience. Channel mission: "make the benefits of AI and emerging technology accessible to everyone." Workflow archetype: daily/weekly AI news + model launches + agent demos.
> **Scraped:** 2026-05-27 · 12 videos via `picks-wave7.json` (8 long-form 9–41 min + 4 Shorts 60s each). Reference clips at `docs/research/wave-6/references/matthewberman/<id>-anim-NN.mp4` (53 clips, 1280×720).
> **Niche match:** PARTIAL — adjacent to @armandointeligencia but in English and 95% long-form. Same AI-news lane as Carlos Cuamatzin and DIY Smart Code, different format (Matt's long-form 16:9 is closest to YouTube Shorts only on 4/12 picks; the other 8 are long-form covering benchmarks, model launches, X threads, agent demos).
> **Tooling guess:** Premiere Pro / DaVinci Resolve + Loom/QuickTime screen recordings. NOT procedural motion graphics — Matt's "graphics" are PIP picture-in-picture composites + scrolling browser captures + iPad whiteboard livestreams + occasional title chyrons. 0/12 videos contain a chart drawn in After Effects; the chart is always a screen recording of the source (Anthropic blog, X post, Tella benchmark, Recraft canvas). Captions are present only on the 4 Shorts (karaoke style); long-form has zero burned-in captions.

---

## Channel overview

Matt Berman's video grammar is the **AI-news anchorman**: a clean studio A-roll (Sennheiser/Shure mic, two black metal display shelves flanking with curated KAWS-style figures + a YouTube silver-play-button trophy backlit between them, beige back wall, soft 5500K key light from upper left) **cuts back-and-forth to a fixed PIP shot** where Matt's webcam sits in the top-right corner over whatever he's reading — an X tweet, a model-launch blog post, a benchmark scatter plot, or a CLI/terminal screenshot. The PIP is a **square-cornered red-bordered rectangle** (~22% of frame width on long-form 16:9) and is the SAME camera as A-roll, just composited. The "motion" is screen scrolling + occasional Loom-style green cursor highlight rings. Long-form runs 10–41 min; the most-engineered visuals are reserved for **Shorts and "diagram" videos** (e.g. `I0me2uEbfuE`, `KJrqRJzSErw`) where Matt switches to an **iPad whiteboard sketch (Procreate/Notability)** with handwritten labels and yellow/green highlighter swipes — additive build, one concept per beat.

The reused "house grammar" across all 12 videos: (1) A-roll studio talking head bookends every long-form, (2) PIP webcam top-right over every screen-recording B-roll, (3) zero burned-in captions on long-form but **karaoke word captions** on every Short, (4) one big bold black-title-card hook (white sans Impact-like) opens Shorts at the cold-open, (5) sponsor read in the middle with a logo card bottom-left and a different presenter outdoors (often Matt himself, casual outdoor B-roll), (6) cursor highlight rings (green outline circle) draw attention on screen-shares. The system is **production-light**: any senior video editor with Premiere can replicate every animation Matt uses — there is no procedural motion. This is exactly why he's a useful reference: **the compositional grammar is the value, not the animation tech**.

---

## Per-video distillation

### 1. `6LwQ8RbU9as` — "DeepSWE just changed the benchmark game..." (1023s / 17 min)
- URL: https://www.youtube.com/watch?v=6LwQ8RbU9as
- Animation segments: **5** (anim-01..05 — durations 21s, 32s, 42s, 47s, 42s = 184s total flagged, ~18% of video)
- Frames inspected: `anim-01-frame-007-t0s.jpg`, `anim-03-frame-014-t290s.jpg`
- **Findings:**
  - **`StudioAnchorAroll`** — anim-01 (frame 007) and anim-03 (frame 014). Matt centered, plaid shirt, the signature beige-wall + double-shelving + YouTube-silver-play-button backdrop. Identical framing in both clips (cuts are conversational, not visual).
    - Ref clips: `docs/research/wave-6/references/matthewberman/6LwQ8RbU9as-anim-01.mp4` (21s), `…-anim-03.mp4` (42s)
    - **transitionVerb:** "Hold a centered medium-shot talking-head with no on-screen graphics. The shot is static; cuts between angles are imperceptible because there are no angle changes — only a tighter face crop on emphasis beats."
    - Orientation: 16:9
    - Replicability: Already covered by `TalkingHead.tsx`. We do not need to replicate the studio plate — `BrandWatermark16x9` + a flat-color backdrop is sufficient. Add `productionMode: "anchorman"` flag for the static cuts.

---

### 2. `BrJdGP21B5g` — "Google just dropped Gemma 4... (WOAH)" (587s / 9.7 min)
- URL: https://www.youtube.com/watch?v=BrJdGP21B5g
- Animation segments: **5** (26s, 42s, 32s, 37s, 32s)
- Frames inspected: `anim-02-frame-014-t75s.jpg`, `anim-03-frame-010-t285s.jpg`
- **Findings:**
  - **`BenchmarkChartPip`** — anim-02. Dark scatter chart "Model Performance VS Size" (Elo Score vs Total Model Size, with `gemma-4-31B-thinking`, `glm-5`, `kimi-k2.5-thinking`, etc. plotted), Matt's webcam PIP top-right with red border. A **green cursor highlight ring** sits at the bottom of the chart pointing to a specific dot.
    - Ref clip: `BrJdGP21B5g-anim-02.mp4` (42s)
    - **transitionVerb:** "Pan-and-scan a static chart screenshot left-to-right while a green cursor-highlight ring orbits between the data points; the webcam PIP top-right is overlay-on-top throughout the entire pan."
    - Orientation: 16:9
    - Replicability: NEW — proposes `ChartPanWithCursorHighlight16x9`. Primitives needed: `CursorHighlightRing` (green outline circle, 4px stroke, soft glow), `WebcamPip` (red-bordered rounded-rect overlay, fixed corner, 22% width). Both are Sprint 2.
  - **`FullScreenShareWalkthrough`** — anim-03. Recraft AI canvas (V4 Pro generated image, "354%" zoom in browser chrome). NO webcam PIP visible — full bleed of the screen recording with the browser's actual cursor moving.
    - Ref clip: `BrJdGP21B5g-anim-03.mp4` (32s)
    - **transitionVerb:** "Display a full-bleed screen recording with no overlay — the source app's native cursor is the only motion. No chyron, no PIP, no captions."
    - Orientation: 16:9
    - Replicability: Trivial — `<Video>` Remotion component fills the canvas. Add to brand grammar as `RawScreenRecordingFullBleed` (no-op template, just a clean B-roll insert).

---

### 3. `GBISeUYMzoU` — "Cursor just beat EVERYONE." (1882s / 31 min)
- URL: https://www.youtube.com/watch?v=GBISeUYMzoU
- Animation segments: **7** (21s, 32s, 32s, 37s, 37s, 42s, 42s)
- Frames inspected: `anim-01-frame-007-t0s.jpg`, `anim-02-frame-010-t215s.jpg`, `anim-06-frame-014-t1340s.jpg`
- **Findings:**
  - **`TweetBenchmarkTablePip`** — anim-01. X.com (dark mode) Cursor tweet "Introducing Composer 2.5", with an EMBEDDED PASTED BENCHMARK TABLE showing Composer 2.5 / Opus 4.7 / GPT-5.5 / Composer 2 across Terminal-Bench 2.0, SWE-Bench Multilingual, CursorBench v3.1. Matt's webcam PIP top-right (square corners, no border this time — black bg blends). Live X "Relevant people" / "Spaces" sidebar visible right column.
    - Ref clip: `GBISeUYMzoU-anim-01.mp4` (21s)
    - **transitionVerb:** "Scroll a screenshot of an X post slowly down-then-up over 20 frames while the webcam PIP stays fixed top-right; highlight the active benchmark column in the embedded table with a pulsing orange outline."
    - Orientation: 16:9
    - Replicability: NEW — proposes `TweetCardScrollPip16x9`. Higher complexity than bilawal's `TweetCardOverlay9x16` because the tweet HAS an embedded data card.
  - **`SplitChartPip`** — anim-02. Bento-style split: scatter plot of CursorBench 3.1 score vs avg cost (Opus 4.7 xhigh, GPT-5.5 medium, Composer 2.5 dots) on left, Matt webcam right. SAME house pattern as `BrJdGP21B5g` anim-02.
    - Ref clip: `GBISeUYMzoU-anim-02.mp4` (32s)
    - **transitionVerb:** "Hold a static benchmark scatter on the left two-thirds of the frame; webcam PIP fills the right third with a thin tablet-bezel-style rounded rectangle."
    - Orientation: 16:9
    - Replicability: Covered by `SplitWebcamScreen9x16` if rotated to 16:9. NEW need: `SplitChartPip16x9` with `webcamShape: "tablet-bezel"`.
  - **`TweetReactionPip`** — anim-06. SpaceX tweet "SpaceXAI and @cursor_ai are now working closely together…" full thread visible (Beff/@beffjezos, vas, Aadit Sheth replies), PIP overlapping the X right sidebar.
    - Ref clip: `GBISeUYMzoU-anim-06.mp4` (42s)
    - **transitionVerb:** "Auto-scroll an X thread top-to-bottom at constant velocity (one viewport per 8 seconds); the webcam PIP top-right stays static and the right sidebar is allowed to crop under the webcam."
    - Orientation: 16:9
    - Replicability: Identical to bilawal's `TweetCardOverlay9x16` but **multi-tweet scrolling**. Proposes `TweetThreadScrollPip16x9` (Sprint 2).

---

### 4. `I0me2uEbfuE` — "Every AI Model Explained in 20 Minutes" (1235s / 20.5 min)
- URL: https://www.youtube.com/watch?v=I0me2uEbfuE
- Animation segments: **6** (19s, 42s, 42s, 42s, 47s, 52s)
- Frames inspected: `anim-01-frame-006-t0s.jpg`, `anim-04-frame-014-t420s.jpg`
- **Findings:**
  - **`SponsorBumperLogoCard`** — anim-01. Outdoor handheld walking shot (sponsor-talent or Matt strolling under redwoods), beige t-shirt, golden-hour light. Bottom-left **rounded white sponsor card** with iconic logo + brand wordmark ("MedOS" with abstract medical-XR icon).
    - Ref clip: `I0me2uEbfuE-anim-01.mp4` (19s)
    - **transitionVerb:** "Hold the outdoor B-roll shot; the bottom-left sponsor logo card scale-pops in over 6 frames at t=0, then holds for the entire segment."
    - Orientation: 16:9
    - Replicability: NEW — proposes `SponsorBumper16x9` template with `<SponsorLogoCard>` molecule (rounded-white pill, brand-color icon left, brand wordmark right).
  - **`HandDrawnConceptMap`** — anim-04. iPad/Procreate live drawing on white canvas. Hand-drawn black ink: "speed" label connected by a stem to a hand-drawn oval enclosing "Gemini". Matt webcam in red-bordered rounded-rect PIP on the right ~33% of the frame.
    - Ref clip: `I0me2uEbfuE-anim-04.mp4` (42s)
    - **transitionVerb:** "Draw each ink stroke at the pen's natural recording speed — the oval first, then the label inside, then the connecting stem upward to the floating attribute word; webcam PIP holds right edge throughout."
    - Orientation: 16:9 (whiteboard + PIP combined)
    - Replicability: NEW — proposes `HandDrawnConceptMap16x9`. Hard to procedural: requires hand-drawn vector strokes with **SVG path-draw animation**. Sprint 3 priority — high authenticity payoff.

---

### 5. `KJrqRJzSErw` — "Anthropic is in trouble" (60s SHORT)
- URL: https://www.youtube.com/watch?v=KJrqRJzSErw
- Animation segments: **2** (26s, 32s — covers the full 60s)
- Frames inspected: `anim-01-frame-009-t0s.jpg`, `anim-02-frame-010-t35s.jpg`
- **Findings:**
  - **`SplitVerticalSketchPlusFace`** — anim-01 & anim-02. Vertical 9:16 short. Top half = whiteboard sketch ("Anthropic Flywheel" handwritten title, yellow-highlighted "coding model" → "$$$" → green-highlighted "Enterprise AI coding"). Bottom half = Matt talking head with **burned-in karaoke captions** ("off its axle,", "this is a server,"). The sketch is ADDITIVE — anim-02 shows new elements: a hand-drawn server icon (rectangle with horizontal lines), a circular flywheel arrow, orange-highlighted "code" document icon.
    - Ref clips: `KJrqRJzSErw-anim-01.mp4` (26s), `…-anim-02.mp4` (32s)
    - **transitionVerb:** "Add one hand-drawn element to the whiteboard at a time, synced to the spoken word in the bottom-half caption — each new element fades in over 4 frames at the moment its name is spoken, then stays."
    - Orientation: 9:16
    - Replicability: NEW — proposes `SplitVerticalSketchPlusFace9x16`. Highest-value Shorts template Matt uses. Requires `HandDrawnElement` molecule with `revealAt: timestamp` prop wired to caption timeline.

---

### 6. `N4ZWCc_Fr3U` — "Opus 4.7 just dropped... and I'm confused." (1087s / 18 min)
- URL: https://www.youtube.com/watch?v=N4ZWCc_Fr3U
- Animation segments: **6** (21s, 42s, 42s, 47s, 47s, 42s)
- Frames inspected: `anim-04-frame-015-t580s.jpg`
- **Findings:**
  - **`HighlightedArticleScrollRead`** — anim-04. Dark-mode Anthropic blog post "Below are some highlights and notes from our early testing of Opus 4.7:" with the first bullet ("Instruction following…") **highlighted yellow** end-to-end. Matt's webcam PIP on the right. Green cursor highlight ring at bottom of frame on a different bullet.
    - Ref clip: `N4ZWCc_Fr3U-anim-04.mp4` (47s)
    - **transitionVerb:** "Pre-highlight one bullet (yellow background) in a long article screenshot; auto-scroll the article slowly bottom-to-top while the highlight stays in viewport for 80% of the segment, then scrolls past."
    - Orientation: 16:9
    - Replicability: Covered by combining `RawScreenRecordingFullBleed` + `WebcamPip` + a static `YellowMarkerHighlight` SVG overlay. Sprint 1-2 with existing primitives.

---

### 7. `ROKgDeeFAnk` — "New BEST AI Memory System" (60s SHORT)
- URL: https://www.youtube.com/watch?v=ROKgDeeFAnk
- Animation segments: **1** (11.5s — single short B-roll insert)
- Frames inspected: `anim-01-frame-004-t0s.jpg`
- **Findings:**
  - **`PopCultureFilmReferenceCutaway`** — anim-01. Fifth Element movie clip: Leeloo holding up her MULTIPASS ID card. Pure B-roll insert with NO overlay, NO caption, NO PIP — just the film clip dropped in as a visual punchline.
    - Ref clip: `ROKgDeeFAnk-anim-01.mp4` (11.5s)
    - **transitionVerb:** "Drop in a 4–8 second cinematic film clip at full bleed during the audio punchline; no caption, no overlay, the original clip's natural color grade and audio (ducked under VO) carries the cutaway."
    - Orientation: 9:16 (cropped from 16:9 source)
    - Replicability: Trivial component-wise (full-bleed `<Video>`), but **copyright/legal exposure**. Document as `PopCultureCutaway` pattern with a "do not ship without clearance" note in `brand/legal-notes.md`.

---

### 8. `a-IOrLvd9B4` — "Earth SHATTERING New AI Model" (60s SHORT)
- URL: https://www.youtube.com/watch?v=a-IOrLvd9B4
- Animation segments: **1** (13.5s)
- Frames inspected: `anim-01-frame-005-t0s.jpg`
- **Findings:**
  - **`BlackTitleHookCard`** — anim-01. Selfie/handheld vacation B-roll (Matt in green tee + backward cap, Hawaii lush background). Top-center BIG BLACK BOX with white sans (Impact-like) hook: `BEST AI MODEL` on line 1, `EVER` 1.5× larger on line 2, subtitle `(RESEARCHERS ARE TERRIFIED)` line 3 in regular weight. Karaoke caption near bottom ("most insane").
    - Ref clip: `a-IOrLvd9B4-anim-01.mp4` (13.5s)
    - **transitionVerb:** "Show a static black-rectangle title card with 3 lines (medium / extra-large / parenthetical) anchored top-center for the entire clip; below it, a karaoke caption advances word-by-word in sync with audio."
    - Orientation: 9:16
    - Replicability: NEW — proposes `BlackTitleHookCardShort9x16`. Direct upgrade path: bake the title card structure into `EditorialCaption` as variant `hookCardTop`. Sprint 1 priority.

---

### 9. `ak6fQ2Yjwy0` — "We only have 2 years..." (2465s / 41 min)
- URL: https://www.youtube.com/watch?v=ak6fQ2Yjwy0
- Animation segments: **6** (26s, 42s, 42s, 47s, 52s, 47s)
- Frames inspected: `anim-01-frame-009-t0s.jpg`, `anim-05-frame-017-t1640s.jpg`
- **Findings:**
  - **`StudioAnchorAroll`** — anim-01. Identical to video #1 except different shirt; same shelving, same lighting. (Pattern confirmed not video-specific.)
  - **`HighlightedArticleScrollRead`** — anim-05. Anthropic.com policy article "Four fronts of the competition" with sidebar TOC ("Two scenarios for the US and China in 2026", "Summary", etc.) on the left. Matt webcam top-right (smaller PIP here, ~18% width). Green cursor ring mid-text.
    - Ref clip: `ak6fQ2Yjwy0-anim-05.mp4` (52s)
    - **transitionVerb:** "Sticky-pin the TOC sidebar on the left while auto-scrolling the article body up at 1 viewport per 12 seconds; the webcam PIP shrinks to ~18% when an article has a left sidebar."
    - Orientation: 16:9
    - Replicability: Same as video #6 anim-04, with `webcamPipSize: "small"` variant when source has its own sidebar.

---

### 10. `dYG8JxtSgmM` — "Claude Code was just leaked... (WOAH)" (900s / 15 min)
- URL: https://www.youtube.com/watch?v=dYG8JxtSgmM
- Animation segments: **6** (26s, 42s, 42s, 42s, 47s, 30s)
- Frames inspected: `anim-01-frame-009-t0s.jpg`, `anim-04-frame-014-t515s.jpg`
- **Findings:**
  - **`TweetWithTerminalScreenshot`** — anim-01. X tweet from @Fried_rice "Claude code source code has been leaked via a map file in their npm registry!" with embedded screenshot of a macOS terminal showing `ls -alh` output of the leaked `src/` directory (entrypoints, main.tsx, cli, commands, utils, QueryEngine.ts, etc.). PIP red-bordered webcam top-right.
    - Ref clip: `dYG8JxtSgmM-anim-01.mp4` (26s)
    - **transitionVerb:** "Hold the tweet+terminal-screenshot composition static for the segment; the only motion is the cursor hover-tooltip that materializes over the linked download URL at ~30% progress, then dismisses."
    - Orientation: 16:9
    - Replicability: NEW molecule — `<TerminalScreenshotInline>` (monospace ls-output styled card, faux macOS chrome). Sprint 2.
  - **`TweetThreadDeepReadWithCodeBlock`** — anim-04. Numbered post heading "3. the permission system is designed to be configured, not clicked through" with body paragraph, then an inline DARK CODE BLOCK `policy > flag > local > project > user`, then more body. Webcam PIP red border top-right.
    - Ref clip: `dYG8JxtSgmM-anim-04.mp4` (42s)
    - **transitionVerb:** "Slow-scroll a numbered X long-post down-then-up over the segment; the embedded code block scales 1.0→1.05 on first reveal then settles."
    - Orientation: 16:9
    - Replicability: Same as `TweetThreadScrollPip16x9` (video #3 anim-06) plus a `<CodeBlock>` molecule (already in our primitives).

---

### 11. `mR2Rh9RtyR4` — "Turns out, HTML is King" (60s SHORT)
- URL: https://www.youtube.com/watch?v=mR2Rh9RtyR4
- Animation segments: **2** (21s, 37s)
- Frames inspected: `anim-01-frame-007-t0s.jpg`, `anim-02-frame-012-t25s.jpg`
- **Findings:**
  - **`BottomTickerCrawlPlusFace`** — anim-01. Vertical 9:16 talking head (cropped tighter from the same studio plate). Karaoke caption mid-frame ("oh my God, that's"). At the very bottom edge, a **horizontal text crawl** showing a doc excerpt: "communicate with us. It's simple, portable, has some rich text capability and is easy for you to edit. Claude has even gotten surprisingly good at…" — TWO lines of static-looking text crawling right-to-left at constant velocity.
    - Ref clip: `mR2Rh9RtyR4-anim-01.mp4` (21s)
    - **transitionVerb:** "Crawl a long text string right-to-left across the bottom 8% of the screen at constant velocity (~120 px/sec at 1080p); above it, render karaoke captions word-by-word at the vertical center."
    - Orientation: 9:16
    - Replicability: NEW — proposes `<BottomTickerCrawl>` molecule. Genuinely novel device in our reference set: combines news-broadcast "stock ticker" affordance with karaoke captions. Sprint 2 priority for Shorts.
  - **`VerticalTalkingHeadKaraokeShort`** — anim-02. Pure 9:16 cropped talking head with karaoke caption ("menus, buttons,"). No ticker. Baseline pattern for Shorts.
    - **transitionVerb:** "Hold a cropped 9:16 medium-shot of the speaker; render karaoke captions word-by-word at vertical 70%, one word visible at a time with a faint bg pill."
    - Orientation: 9:16
    - Replicability: Already covered by `TalkingHead9x16` + `EditorialCaption`.

---

### 12. `tNV9_I-zLO0` — "OpenAI just dropped GPT-5.5... (WOAH)" (1146s / 19 min)
- URL: https://www.youtube.com/watch?v=tNV9_I-zLO0
- Animation segments: **6** (26s, 37s, 42s, 42s, 42s, 42s)
- Frames inspected: `anim-01-frame-009-t0s.jpg`, `anim-05-frame-014-t745s.jpg`
- **Findings:**
  - **`HighlightedArticleScrollRead`** (OpenAI variant) — anim-01. OpenAI dark-mode launch post "We're releasing GPT-5.5, our smartest and most intuitive…" with top nav (Research / Products / Business / Developers / Company / Foundation), webcam PIP smaller this time top-right (no red border on the OpenAI bg, just the rectangle). Cursor visible mid-paragraph.
    - Ref clip: `tNV9_I-zLO0-anim-01.mp4` (26s)
    - **transitionVerb:** "Crop the article to a single column with the top nav bar pinned; auto-scroll bottom-to-top at 1 viewport per 14 seconds."
    - Orientation: 16:9
    - Replicability: same as video #6/#9 — `HighlightedArticleScrollRead`.
  - **`TabbedDemoSelectorWithEmbed`** — anim-05. OpenAI capability-showcase page with a TABBED DEMO SELECTOR ("Space mission app | **Earthquake tracker** | Dungeon game | 3D game") and a browser-frame mockup below showing the active demo (earthquake world map with red/blue plotted earthquakes). Pink gradient backdrop visible behind the mockup. Cursor hovering over active tab. Webcam PIP top-right.
    - Ref clip: `tNV9_I-zLO0-anim-05.mp4` (42s)
    - **transitionVerb:** "Click each tab in left-to-right order; on each click, cross-fade the embedded browser-mockup screenshot to the next demo over 12 frames; hold each demo for ~2.5 seconds before clicking again."
    - Orientation: 16:9
    - Replicability: NEW — proposes `TabbedDemoSelector16x9`. Useful for "model launch coverage" content where the source page has its own tabs. Sprint 2.

---

## Catalog of distinct patterns

Across the 12 videos, I extract **15 named patterns**. Most are **compositional grammars on top of static screen recordings**, not procedural animations. Re-used patterns across videos are noted with their `[video-ids]`.

| # | Pattern (PascalCase) | Description | transitionVerb (canonical) | Orientation | Videos |
|---|---|---|---|---|---|
| 1 | **`StudioAnchorAroll`** | Static centered medium-shot of Matt in studio plate, no overlays. The "carrier-wave" shot of every long-form. | "Hold a centered medium-shot talking-head with no on-screen graphics; cut between near-identical angles only on emphasis beats." | 16:9 | All long-form (8) |
| 2 | **`WebcamPipOverlay`** | A small (~22% width) red-bordered rounded-rect of the same studio webcam composited over a screen recording. The atomic primitive of half the patterns below. | "Compose a fixed-position webcam tile in the top-right corner over the underlying screen recording for the full segment duration." | 16:9 | 6LwQ8RbU9as, BrJdGP21B5g, GBISeUYMzoU, I0me2uEbfuE, N4ZWCc_Fr3U, ak6fQ2Yjwy0, dYG8JxtSgmM, tNV9_I-zLO0 |
| 3 | **`CursorHighlightRing`** | Green outline circle (~80px, 4px stroke) drawn around the user's pointer on screen recordings, à la Loom's highlight cursor. | "Track the pointer position and render a translucent green outline circle around it that fades in over 6 frames when motion stops and out when motion resumes." | 16:9 | BrJdGP21B5g, N4ZWCc_Fr3U, ak6fQ2Yjwy0 |
| 4 | **`TweetCardScrollPip16x9`** | Static X tweet screenshot (often with embedded benchmark table) auto-scrolled with the webcam PIP fixed. | "Scroll a screenshot of an X post slowly down-then-up over 20 frames while the webcam PIP stays fixed top-right." | 16:9 | GBISeUYMzoU (anim-01), dYG8JxtSgmM (anim-01) |
| 5 | **`TweetThreadScrollPip16x9`** | Multi-tweet X thread auto-scrolled at constant velocity. | "Auto-scroll an X thread top-to-bottom at one viewport per 8 seconds; the webcam PIP stays static and the right sidebar may crop under it." | 16:9 | GBISeUYMzoU (anim-06), dYG8JxtSgmM (anim-04) |
| 6 | **`BenchmarkChartPip`** / **`SplitChartPip`** | Dark scatter/line chart screenshot beside the webcam PIP. Either as overlay (BenchmarkChartPip) or true split (SplitChartPip). | "Hold a benchmark chart on the left two-thirds; webcam PIP fills the right third with a thin tablet-bezel-style rounded rectangle." | 16:9 | BrJdGP21B5g, GBISeUYMzoU |
| 7 | **`HighlightedArticleScrollRead`** | Auto-scrolling article (Anthropic/OpenAI/X long-post) with one bullet pre-highlighted yellow + webcam PIP. | "Pre-highlight one bullet in yellow; auto-scroll the article slowly bottom-to-top, holding the highlight in viewport for 80% of the segment." | 16:9 | N4ZWCc_Fr3U, ak6fQ2Yjwy0, tNV9_I-zLO0 |
| 8 | **`FullScreenShareWalkthrough`** | Full-bleed screen recording of an app (Recraft canvas, etc.) with native cursor only — no PIP, no overlay. | "Display a full-bleed screen recording with no overlay — the source app's native cursor is the only motion." | 16:9 | BrJdGP21B5g (anim-03) |
| 9 | **`HandDrawnConceptMap`** | iPad/Procreate hand-drawn explainer — labels, ovals, arrows added one-by-one synced to VO. Webcam PIP right side. | "Draw each ink stroke at the pen's natural recording speed; webcam PIP holds the right edge throughout." | 16:9 | I0me2uEbfuE (anim-04) |
| 10 | **`SplitVerticalSketchPlusFace`** | Vertical 9:16: top half hand-drawn sketch that builds additively, bottom half talking head with karaoke caption. | "Add one hand-drawn element to the whiteboard at a time, synced to the spoken word in the bottom-half caption — each new element fades in over 4 frames at the moment its name is spoken." | 9:16 | KJrqRJzSErw |
| 11 | **`BlackTitleHookCardShort`** | Vertical 9:16 selfie/B-roll with a big black-rectangle title card top-center: 3-line bold-white-sans hook + parenthetical subtitle. | "Show a static black-rectangle title card with 3 lines (medium / extra-large / parenthetical) anchored top-center; below it, karaoke captions advance word-by-word." | 9:16 | a-IOrLvd9B4 |
| 12 | **`SponsorBumperLogoCard`** | Outdoor sponsor read with a rounded white logo card bottom-left over outdoor B-roll. | "Hold the B-roll; the bottom-left sponsor logo card scale-pops in over 6 frames at t=0, then holds for the entire segment." | 16:9 | I0me2uEbfuE (anim-01) |
| 13 | **`BottomTickerCrawl`** | Bottom 8%-of-screen horizontal text crawl (news-broadcast ticker) underneath karaoke captions on Shorts. | "Crawl a long text string right-to-left across the bottom 8% of the screen at constant velocity (~120 px/sec at 1080p)." | 9:16 | mR2Rh9RtyR4 (anim-01) |
| 14 | **`TabbedDemoSelectorWithEmbed`** | Source page with tabs + embedded browser-mockup screenshot, cursor clicks tabs to switch demos. | "Click each tab in left-to-right order; on each click, cross-fade the embedded browser mockup to the next demo over 12 frames." | 16:9 | tNV9_I-zLO0 (anim-05) |
| 15 | **`PopCultureFilmReferenceCutaway`** | 4–8 second cinematic film clip dropped in as visual punchline. No caption, no overlay. | "Drop in a film clip at full bleed during the audio punchline; the clip's natural color grade carries the cutaway." | 9:16 (cropped from source) | ROKgDeeFAnk |

**Most-replicated atomic primitives** (counts):
- `WebcamPipOverlay`: 8/12 videos (the spine of his long-form grammar)
- `CursorHighlightRing`: 3/12
- `TweetCardScrollPip16x9` family: 4/12

---

## Comparison to other creators in our library

| Aspect | **Matt Berman** | `carloscuamatzin` | `diysmartcode` | `bilawal.ai` | `simonhoiberg` | `alexhormozi` | `natebjones` |
|---|---|---|---|---|---|---|---|
| Format | 16:9 long-form (8 videos 9–41 min) + 9:16 Shorts (4 × 60s) | 9:16 reels 2–3 min | 9:16 Shorts 1.5–3 min | 9:16 reels 9–164s | 9:16 reels (mostly raw studio) | 9:16 Shorts 13–48s | mixed |
| Captions on long-form | NONE (zero burned-in on 8/8 long-form) | yes (Spanish karaoke) | rare | yes | none | n/a | yes |
| Captions on Shorts | yes (karaoke, word-by-word) | yes | rare | yes | none | yes (heavy) | yes |
| Procedural motion graphics | NONE (0 charts in Remotion-style; all charts are screen-rec) | YES — animated diagrams, comparison charts | YES — typographic templates with rotating accent | NO — TweetCardOverlay static | NO — face-cam-only | NO — caption-only typography | NO — face-cam + captions |
| Dominant "house atom" | `WebcamPipOverlay` over scrolling screen-rec | rotating template families (6) | breadcrumb + emphasis-word + source pill | TweetCardOverlay over screen-rec | restraint + LayerCardStack on framework reels | persistent-top-hook-pill | karaoke + chapter cards |
| Hand-drawn iPad whiteboard | YES (KJrqRJzSErw, I0me2uEbfuE) — **unique in our library** | no | no | no | no | no | no |
| Sponsor bumper style | rounded logo card bottom-left + outdoor B-roll | n/a (no sponsors observed) | n/a | n/a | n/a | n/a | n/a |
| Studio plate complexity | HIGH (curated KAWS shelves, silver-play-button trophy, two-shelf symmetry) | LOW (flat color bg) | LOW (browser chrome focal) | LOW (face-cam over screen-rec) | MEDIUM (loft + string lights) | LOW (face-cam) | LOW |
| Lessons we can adopt | (1) `WebcamPipOverlay` as atomic primitive across all screen-share templates; (2) `CursorHighlightRing` molecule; (3) `HandDrawnConceptMap` for explainer slots; (4) `BlackTitleHookCardShort` for Shorts cold-opens; (5) `BottomTickerCrawl` as differentiated Shorts device | rotating template variety > single style | breadcrumb / emphasis-word discipline | TweetCardOverlay as authority signal | LayerCardStack and restraint | persistent top hook pill, karaoke discipline | chapter cards |
| What we DON'T adopt | The whole "studio plate" — our brand is text-on-color + brand watermark, not a real-world studio | (n/a — already adopt) | (n/a — already adopt) | TweetCardOverlay's specific dark/black palette | n/a | n/a | n/a |

**Headline cross-creator finding:** Matt Berman is the **only creator in our reference set who uses iPad hand-drawn whiteboard explainers** (`SplitVerticalSketchPlusFace9x16`, `HandDrawnConceptMap16x9`). This is also the **highest production-effort device he uses** — restricted to ~3 of 12 videos. If we want a differentiating long-form "explainer" tentpole, this is it. Carlos, DIY Smart Code, and Bilawal are all flat/typographic; only Matt brings the human-hand authenticity of a Procreate session.

**Headline anti-finding:** Matt's 16:9 long-form has **zero burned-in captions** on 8/8 long-form videos. This is the OPPOSITE of our brand discipline. He is willing to trust YouTube auto-captions + audio-on viewing; we serve a sound-off scroller and must keep our burned captions. Don't confuse "Matt doesn't caption long-form" with "we shouldn't either."

---

## Build priority queue addendum (new primitives / molecules / compositions)

Ranked by `(authority signal × replicability) ÷ engineering cost`. Inserts continue the wave-numbered queue established in earlier ANALYSIS docs.

| Rank | Item | Type | Sprint | Cost | Notes |
|---|---|---|---|---|---|
| 1 | **`WebcamPipOverlay`** — fixed-corner rounded-rect webcam compositor with optional red border, configurable corner + size (% of canvas) | Molecule | 1 | XS (~3h) | The atomic primitive that unlocks 5+ Matt templates AND is a generally useful B-roll device for any creator who screen-shares. Must accept a `<Video>` source or a still. |
| 2 | **`CursorHighlightRing`** — translucent outline circle drawn at runtime around a tracked cursor coordinate on a screen-rec | Molecule | 2 | M (~6h) | Needs cursor-position track ingestion (manual JSON of `[frame, x, y]` keypoints). Render fade-in/out on motion-end. Loom-style. Reusable across `HighlightedArticleScrollRead`, `BenchmarkChartPip`, `FullScreenShareWalkthrough`. |
| 3 | **`BlackTitleHookCardShort9x16`** — 9:16 composition: static black title card top-center (3 lines: medium / extra-large / parenthetical), bg = creator-provided B-roll or `<TalkingHead9x16>`, karaoke caption underneath | Composition | 1 | S (~5h) | Direct upgrade to our existing `EditorialCaption` variant. Production-light. Targets the cold-open hook of every Short. |
| 4 | **`TweetCardScrollPip16x9`** — 16:9 composition: full-bleed static tweet screenshot scrolled down-then-up + `<WebcamPipOverlay>` fixed top-right + optional `<PulsingOutline>` on a sub-region | Composition | 2 | S (~5h) | Differs from bilawal's 9:16 `TweetCardHero9x16` in orientation + scroll behaviour. |
| 5 | **`TweetThreadScrollPip16x9`** — same as #4 but with a multi-tweet thread auto-scrolled at constant velocity | Composition | 2 | S (~4h, after #4) | Composed atop #4 + `WebcamPipOverlay`. Hardcode `pixelsPerSecond` (default 120). |
| 6 | **`BenchmarkChartPip16x9` / `SplitChartPip16x9`** — 16:9 composition: chart screenshot panel left + webcam panel right (split) OR webcam overlay top-right (PIP) | Composition | 2 | S (~5h) | One composition with `chartLayout: "split" \| "overlay"` prop. |
| 7 | **`HighlightedArticleScrollRead16x9`** — 16:9 composition: article screenshot with pre-set yellow highlight on a target paragraph, auto-scrolled + `<WebcamPipOverlay>` + optional `<CursorHighlightRing>` | Composition | 2 | M (~7h) | Cleanest spec'd version: takes screenshot + highlight-rect coords + scroll target. Used in N4ZWCc_Fr3U, ak6fQ2Yjwy0, tNV9_I-zLO0. |
| 8 | **`SponsorBumper16x9`** — 16:9 composition: B-roll background + bottom-left `<SponsorLogoCard>` (rounded-white pill, brand icon left, brand wordmark right, optional URL) | Composition | 2 | S (~4h) | We don't currently have sponsors but the template doubles for "partner brand badge" use cases. Pre-build to future-proof monetization. |
| 9 | **`HandDrawnElement`** — SVG path component that animates a hand-drawn-style stroke (squiggly oval, label text in hand-font, connecting stem) using stroke-dasharray reveal | Primitive | 3 | L (~10h) | The hardest item on this list. Required for #10 and #11. Use Inkscape hand-tracing → SVG → Remotion. Single-purpose; only spend the budget if we ship the whiteboard tentpole. |
| 10 | **`HandDrawnConceptMap16x9`** — 16:9 composition: white canvas + N `<HandDrawnElement>`s revealed in order + `<WebcamPipOverlay>` right side | Composition | 3 | M (~6h, after #9) | Differentiating long-form template. **Only Matt does this in our reference set.** |
| 11 | **`SplitVerticalSketchPlusFace9x16`** — 9:16 composition: top half `<HandDrawnConceptMap>` (without PIP), bottom half `<TalkingHead9x16>` + karaoke caption | Composition | 3 | M (~6h, after #9) | Highest-payoff Shorts template Matt uses. The 9:16 sibling of #10. |
| 12 | **`BottomTickerCrawl`** — 9:16-friendly horizontal text crawl molecule in the bottom 8% of frame, constant velocity right-to-left | Molecule | 2 | S (~3h) | Cheap, very novel device for our Shorts. Can layer over any existing 9:16 template as a `<TickerOverlay text="…">` slot. |
| 13 | **`TabbedDemoSelector16x9`** — 16:9 composition: faux tab strip + cross-fading browser-mockup screenshot panel + `<WebcamPipOverlay>` | Composition | 2 | M (~6h) | Niche use case (model launch coverage with multi-demo pages), but cheap if #1 already shipped. |
| 14 | **`TerminalScreenshotInline`** — molecule rendering a faux macOS terminal card (titlebar + monospace body + optional `ls -alh` style row formatting) | Molecule | 2 | S (~3h) | Reusable across any "leaked source code" / "CLI demo" story. Compose into `TweetCardScrollPip16x9` body slot. |

**Top 3 priorities to start with (by ROI on agent-replicating Matt's grammar):**
1. `WebcamPipOverlay` (atomic — unlocks 6+ templates below it)
2. `BlackTitleHookCardShort9x16` (direct upgrade of EditorialCaption — huge Shorts hook lift)
3. `HighlightedArticleScrollRead16x9` (the most-reused long-form pattern in his videos)

**Differentiating long-form moonshot (Sprint 3):** the `HandDrawnElement` → `HandDrawnConceptMap16x9` → `SplitVerticalSketchPlusFace9x16` stack. High cost, **uniquely Matt** in our reference set, and the only path to "human craft" texture in our otherwise-procedural lineup.

---

## Sources

- Scraper command: video IDs in `picks-wave7.json` pulled via yt-dlp 2026.03.17; reference clips extracted by `scripts/extract-animations.ts` (Wave 6 pipeline) → `docs/research/wave-6/references/matthewberman/<id>-anim-NN.mp4`
- Per-video frames: `references/creators/matthewberman/<id>/frames/anim-NN-frame-MMM-tXs.jpg` (1,237 frames total across the 12 videos)
- Picks rationale: `references/creators/matthewberman/picks-wave7.json`
- Channel metadata: `references/creators/matthewberman/info.json`
- YouTube channel: https://www.youtube.com/@matthew_berman
- Image budget for this analysis: **22 reads** across 12 videos (within 24-max budget). Frame names + ffprobe durations + picks JSON provided all other evidence — no need to read all 1,237 frames.
