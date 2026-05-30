# @aiadvantage / The AI Advantage (Igor Pogany) — visual + motion analysis

> **Scraped:** 2026-05-27 (picks) · 2026-05-28 (extraction).
> **Wave 7, sample:** 12 videos — 8 long-form YouTube (2:54–15:26) + 4 Shorts (14–60s). Long-form 1280×720; Shorts 360×640.
> **Channel size:** ~1M subs (English-language AI news/tutorial anchor since 2023). Presenter: Igor Pogany.
> **Niche fit:** STRONG for our brand. English, but the **AI-tutorial + AI-news-roundup** lane is exactly the genre `@armandointeligencia` Spanish-language content occupies. Igor is the closest reference in our entire 22-creator set to a "polished AI explainer studio" — disciplined house grammar, recurring motion devices, deterministic typography. Niche ≈ Matt Wolfe (`@mreflow`) + production polish closer to Sahil Bloom (`@sahilbloom`).
> **Tooling guess:** **After Effects + Premiere** stack (NOT Remotion). Evidence: hand-keyed glow halos around UI mockups, organic color-shift gradients behind props, perspective-tilted 3D camera angles on chrome elements. Templates are AE comps reused per video, not procedural. This matches the production tier of the channel.

> **★ Strongest creator-to-build-target match for English/long-form 16:9.** Adam Rosler is the 9:16 Shorts sibling. Igor is the long-form-tutorial sibling.

---

## 1. Channel design philosophy

Igor runs **two parallel sub-brands** that are *visually distinct* and shouldn't be conflated:

### Sub-brand A — "Studio Compositor" (long-form tutorials + news)
Setup: presenter on **pure-black greenscreen-style background**, composited bottom-left/bottom-center over a virtual stage that holds glowing 3D-ish UI mockups, prompt bars, callout pills, and screen-rec windows. Talking-head and UI demo share the same frame. This is **8 of 12 picks** (kXK_C50MO2w, kG0RkK69NyA, 8BKGfajOnlY, Q5GxIpzOxOI, aK3lAZ5hhm0, 9Yhhwr0dyS4 — and as B-roll in 8TkCz3S85rA and K0UwutA4utA).

### Sub-brand B — "Warm Podcast Studio" (essay + Shorts)
Setup: presenter shot in **warm interior** (lamp, painting, curtains, vintage chair, blazer-over-tshirt or cardigan-vest layered look) with mic on tripod. Wider shot, more "thoughtful essayist" register. This is 8TkCz3S85rA, K0UwutA4utA, and the 4 Shorts. The same Igor, dressed up.

**Why this matters for replication:** our `TalkingHead.tsx` composition has ONE background mode. Igor's library proves two registers exist — *Studio Compositor* (tutorial/news, dark BG, integrated with screen-rec) and *Warm Podcast* (essay/short, warm BG, full-bleed face-cam). These are different jobs.

---

## 2. Per-video distillation

| # | ID | Title | Dur | Format | Dominant patterns |
|---|---|---|---|---|---|
| 1 | `kXK_C50MO2w` | How to Use Gemini Canvas in 2 Minutes | 175s | tutorial-short | StudioCompositor + GlowingPromptBarMockup + CalloutPillCursor |
| 2 | `kG0RkK69NyA` | New ChatGPT Library Explained & More News | 789s | news-roundup | FourUpProductGrid + StudioCompositor + CenteredPromptBarReveal |
| 3 | `8BKGfajOnlY` | Claude Opus 4.7 AMAZING Full Breakdown | 593s | review-breakdown | EmbeddedMarketingFootage + StudioCompositor + FauxUIPromptOverlay |
| 4 | `Q5GxIpzOxOI` | Nano Banana 2 Full Review | 800s | review-breakdown | TwoByTwoModelComparison + HighlightedPromptText + StudioCompositor |
| 5 | `aK3lAZ5hhm0` | Switch ChatGPT to Gemini | 624s | tutorial-howto | FiftyFiftyFeatureMapSplit + HighlightedPromptText + ZoomCropPan |
| 6 | `9Yhhwr0dyS4` | 10x Better Results with Gemini | 494s | tutorial-listicle | StudioCompositor + ScrollPanOverUIList + GlowingPromptBarMockup |
| 7 | `8TkCz3S85rA` | After 10,000 Hours of AI, 3 Things | 716s | essay-listicle | WarmPodcastFullBleed + TieredPyramidDiagram + StudioCompositorBroll |
| 8 | `K0UwutA4utA` | What You NEED to Know About AI in 2026 | 926s | essay-trend | WarmPodcastFullBleed + FiftyFiftyTweetSplit + StudioCompositorBroll |
| 9 | `BRKYEhJpOzE` | Claude Really is the Best Free AI Now | 18s | short-vertical | TopHeadlineBottomFaceCam9x16 + PaleGreenSerifHero + KaraokeCaption |
| 10 | `3mTMPEGWRWA` | Claude Code /goal Function | 14s | short-vertical | TopMacWindowBottomFaceCam9x16 + KaraokeCaption |
| 11 | `Kon8rORVmBE` | Huge Upgrade for Claude Code | 32s | short-vertical | MemeBrollOverlayCaption9x16 + KaraokeCaption |
| 12 | `0uTEcSu5aAg` | They're Finally Solving Hallucinations | 60s | short-vertical | TopBrollBottomFaceCam9x16 + KaraokeCaption |

---

## 3. Named patterns (12 distilled, sorted by load-bearing weight)

Each pattern below includes a **transitionVerb** per Wave-5 contract. These are imperative-tense single-sentence choreography prompts you would paste into a Claude Code session targeting Remotion.

### P1 — `StudioCompositor16x9` (chrome system, not a template per se)
**Where:** 6/8 long-form picks. The defining house grammar.
**Visual structure:**
- Pure-black background (RGB ~#0A0A0A) with a subtle radial-vignette toward lower-left
- Presenter composited bottom-left (~30% width, ~50% height, alpha-keyed not greenscreen-square)
- UI mockups floating right of presenter with a **soft purple/blue glow halo** (box-shadow: 0 0 80px rgba(140, 80, 255, 0.45)) and slight 3D perspective tilt (~5° rotateY)
- Optional small accent pills (e.g., "Shorter", "+ Comms 101 notes") that drop near the prompt bar with their own glow
- No watermark, no lower-third, no progress bar — the chrome IS the BG composite
**transitionVerb:** *"Presenter is held continuously bottom-left at 30% width; UI mockup elements scale-pop in from 0.85→1.0 with a 12-frame soft glow swell on entry; each new accent-pill enters by sliding 16px upward + fading 0→1 over 8 frames."*
**Maps to our library:** **NEW composition `StudioCompositor16x9`** — opens a 16:9 long-form lane. Reuses `<MacWindow>` molecule for inner UI mockups. **Build priority: HIGH** if we open the 16:9 lane (now 5/22 creators confirm: Nate, AI Explained, Matt Wolfe, Sahil, Igor).

### P2 — `GlowingPromptBarMockup16x9`
**Where:** kXK_C50MO2w, kG0RkK69NyA, 9Yhhwr0dyS4. Igor's most-reused diegetic prop.
**Visual structure:**
- Horizontal pill-shaped dark `#1A1A1F` prompt bar with soft purple/violet outer glow
- White typed text inside ("Help me write a five minute speech based on my notes")
- Optional attached "file pill" appears below it ("Comms 101 notes / PDF") with matching glow
- Blinking cursor at end of text
**transitionVerb:** *"Prompt bar fades in at 90% scale and settles to 100% over 14 frames; cursor blinks at 30-frame interval; typed text reveals character-by-character at ~3 chars/frame; if a file pill is shown, it slides up 24px + fades in 240 frames after the prompt-bar entrance."*
**Maps to:** **NEW molecule `<GlowingPromptBar>`** — slots into `StudioCompositor16x9`, but also into 9:16 demo videos. **Build priority: HIGH** (3/12 hits, atomic, reusable across both lanes).

### P3 — `TwoByTwoModelComparison16x9`
**Where:** Q5GxIpzOxOI (Nano Banana 2 vs ChatGPT Image 1.5 vs Nano Banana Pro vs Flux 2 Pro).
**Visual structure:**
- 4-cell grid on dark navy `#1A1F2E` BG, each cell ~440×330 px
- Each cell: model output image + bold white sans label ("Nano Banana 2", etc.) centered below
- Presenter PIP centered between rows ~150×180 px, no border, alpha-keyed
- No callout, no winner badge — comparison-by-eye
**transitionVerb:** *"Four cells reveal in clockwise order from top-left (TL→TR→BR→BL) each scale-pop 0.92→1.0 + fade 0→1 over 10 frames with 6-frame stagger; labels slide-up 20px below each cell 4 frames after the cell appears; presenter PIP holds continuously throughout."*
**Maps to:** **NEW composition `ModelComparisonGrid16x9`** with `cells: 4` (also supports 2 / 3 / 6). Confirms Wolfe's `StackedSplitScreenrecOverFaceCam` 9:16 pattern has a 16:9 sibling. **Build priority: HIGH** (uniquely Igor; great for "X vs Y" content).

### P4 — `FiftyFiftyFeatureMapSplit16x9`
**Where:** aK3lAZ5hhm0 (Gemini settings vs ChatGPT/Gems Editor side by side).
**Visual structure:**
- Vertical 50/50 split, hairline dividing line
- Left side: one product's UI screen-rec (e.g., Gemini Gems Editor)
- Right side: equivalent UI from competing product (ChatGPT Custom GPT) — same scroll position, same feature area
- Presenter face-cam composited bottom-right corner, ~25% width, no border
- No "VS" badge — feature-equivalence is implied by the framing
**transitionVerb:** *"Left and right panels enter simultaneously sliding in from opposite edges (L panel from x=-100%, R panel from x=+100%) over 20 frames with a 4-frame overlap at the midline; presenter PIP holds bottom-right throughout; the divider line draws top→bottom over 10 frames after both panels settle."*
**Maps to:** **EXTEND `SplitWebcamScreen9x16`** to also support **16:9 + symmetric-feature-comparison mode**. Currently our composition is 9:16-only with face-cam top + screen-rec bottom. **Build priority: MED** (1/12 but high-value tutorial device).

### P5 — `WarmPodcastFullBleed16x9`
**Where:** 8TkCz3S85rA, K0UwutA4utA, BRKYEhJpOzE bottom-half (×6 if you count both essay long-forms in their entirety).
**Visual structure:**
- Wide presenter shot, head + shoulders, mic visible in foreground
- Set: warm wood + soft lamplight + curtains/painting + vintage chair (visible in K0UwutA4utA wide), or simpler "wood-paneled corner with lamp" in essay
- Wardrobe: black blazer over t-shirt (essay register) or cardigan-vest over tshirt (Shorts register)
- No overlays, no captions, no watermark — production design carries authority
**transitionVerb:** *"Hold static — this is the resting register, not an animated unit. Cuts to other compositions (StudioCompositor, FullBleedBroll) are HARD CUTS on word boundaries every 4–8 seconds."*
**Maps to:** **EXTEND `TalkingHead.tsx`** with a **`mode: "warmPodcast" | "studioCompositor"` discriminated union**. The warm-podcast mode swaps BG (no green-screen compositing) and removes the lower-left watermark for the "essayist" register. **Build priority: LOW** (it's a styling, not a new template) but **schema lift is important** — our current template assumes one register.

### P6 — `HighlightedPromptText16x9` (atomic device)
**Where:** Q5GxIpzOxOI, aK3lAZ5hhm0. Appears 2+ times in each of those videos.
**Visual structure:**
- Inside a Gemini/ChatGPT prompt textarea, a span of text is **highlighted with a translucent blue rectangle** (rgba(80, 130, 220, 0.45)) — exactly as if the user dragged-selected the text with the cursor
- Cursor I-beam visible at the end of the highlight
**transitionVerb:** *"Highlight rectangle wipes in left-to-right across the target text span over 8 frames; cursor I-beam blinks at right edge throughout."*
**Maps to:** **NEW molecule `<HighlightedTextSpan>`** — wraps any text node. **Build priority: MED**. Sister molecule to AI Explained's yellow-PDF-highlight pattern (`PDFSystemCardYellowHighlight`). Confirms a **broader "selection-highlight" family** in the reference set.

### P7 — `TieredPyramidDiagram16x9`
**Where:** 8TkCz3S85rA (3-tier "AI For Answers / AI As a Daily Work Partner / AI Working For You").
**Visual structure:**
- Centered isoceles pyramid, 3 tiers stacked vertically, each tier is a horizontal trapezoid
- Active tier = bright lime green `#5CFF8A` with soft outer glow; inactive = dim teal `#2A4F3A`
- Tier labels in bold black sans (active) / desaturated gray (inactive)
- Background is a soft gray-to-white radial gradient (NOT the studio dark)
- Presenter PIP bottom-right with cropped alpha edge, presenter gesturing toward the pyramid
**transitionVerb:** *"Pyramid base reveals first (bottom tier scale-pop), then middle tier slides up 40px + fades in 200ms later, then top tier scale-pops with a 12-frame green glow swell; active tier highlight transitions bottom→middle→top synchronized with VO key beats (manually keyed by editor)."*
**Maps to:** **NEW composition `TieredPyramidDiagram16x9`** with `tiers: 3 | 4 | 5` and an `activeTier: number` prop. Sister to `RankedTierList9x16`. **Build priority: MED** (single-instance in sample, but the device is well-known editorial — Maslow's hierarchy etc.).

### P8 — `FiftyFiftyTweetSplit16x9`
**Where:** K0UwutA4utA at ~7:30 (Martin_DeVido tweet about Claude tending plants).
**Visual structure:**
- Vertical 50/50 split
- Left: full-fidelity X/Twitter dark-mode screenshot (avatar + handle + body + embedded video thumbnail + reply chain + reaction stats)
- Right: presenter face-cam (Warm Podcast register), centered
- No divider line — gap is implied by background
**transitionVerb:** *"Tweet card slides in from left edge over 18 frames + scales 0.95→1.0; presenter holds in right half continuously; if a reply thread is shown, replies stagger-in below the parent tweet over 6-frame intervals."*
**Maps to:** **EXTEND `TweetCardHero9x16`** to support a **16:9 + face-cam-right mode**. Matt Wolfe's `TweetReplyChainSlideIn` 9:16 has a 16:9 sibling here. **Build priority: MED**.

### P9 — `TopHeadlineBottomFaceCam9x16` (Shorts)
**Where:** BRKYEhJpOzE ("This is Sonnet 4.6").
**Visual structure:**
- Top 50% of 9:16 frame: pale green `#C6DDC8` BG with **large serif headline** (looks like Lyon / Source Serif, ~120pt) in near-black with subtle wave-line accents at top + bottom of the green panel
- Bottom 50%: face-cam (warm room) with **bold black-outlined white sans karaoke caption** centered horizontally near top of face-cam panel
- Caption uses Hormozi-style word-by-word reveal with one word highlighted on the beat
**transitionVerb:** *"Top half holds a serif headline statically; bottom half plays face-cam with karaoke caption advancing one word per audio segment; on key product reveal, headline scale-pops once with a 6-frame ease-out."*
**Maps to:** **NEW composition `SplitHeadlineFaceCamShort9x16`** — pairs with the EditorialCaption layer. Direct extension of `TitleCardKineticTwoLine` adapted to a horizontal-split layout. **Build priority: HIGH** for Shorts lane (Igor's signature short format).

### P10 — `TopMacWindowBottomFaceCam9x16` (Shorts)
**Where:** 3mTMPEGWRWA (Claude Code /goal function).
**Visual structure:**
- Same horizontal split as P9
- Top 50%: cream/beige `#EBE7DE` background framing a **macOS-style window** ("claude" title bar with traffic-light dots) showing a CLI terminal session with monospaced text, `claude` markers, status pills (`x 2 failing · 12 passing`), `/goal active (10s)` indicator
- Bottom 50%: face-cam (warm room) + karaoke caption
**transitionVerb:** *"MacWindow chrome scale-pops at start; CLI lines stagger-in top-to-bottom over 4-frame intervals; status pills appear after their parent line settles; cursor blinks throughout; bottom face-cam + karaoke caption hold continuously."*
**Maps to:** **EXTEND existing `<MacWindow>` molecule** (we already have it!) **+ new `SplitMacWindowFaceCamShort9x16` composition**. This is a **direct reuse opportunity** — `<MacWindow>` was built for AppConnect; it slots cleanly into Igor's CLI-demo shorts. **Build priority: HIGH**.

### P11 — `MemeBrollOverlayCaption9x16` (Shorts)
**Where:** Kon8rORVmBE (Office Space printer-smashing clip).
**Visual structure:**
- **Full-bleed pop-culture B-roll** (movie clip, meme video, recognizable scene) NO split-screen
- Karaoke caption layer floats over the B-roll, centered horizontally, vertically positioned in lower-third
- Same bold black-outlined white sans style
**transitionVerb:** *"Hold B-roll continuously; caption advances word-by-word with active-word bright white + past-word dimmed; on punchline word, caption scale-pops once."*
**Maps to:** Already covered by `EditorialCaption + <FullBleedBroll>` style. **No new composition needed**, but **document the "use pop-culture B-roll for emotional emphasis" Igor tactic** in `brand/voice.md`. Adjacent to Matthew Berman's `WebcamPipOverlay` but inverted (no face-cam, all B-roll). **Build priority: LOW** (no template lift; tactic worth noting).

### P12 — `TopBrollBottomFaceCam9x16` (Shorts)
**Where:** 0uTEcSu5aAg (electricity bill being slammed on table + "A number is").
**Visual structure:**
- Same horizontal split as P9 / P10
- Top 50%: stock B-roll (NOT meme — naturalistic illustration of the concept) — close-up hand slamming paper, plant in soil, etc.
- Bottom 50%: face-cam + karaoke caption
**transitionVerb:** *"Top B-roll plays continuously (held diegetic action); bottom face-cam + karaoke caption hold continuously; cut to next B-roll clip on the nearest hard word boundary every 3–5 seconds."*
**Maps to:** **NEW composition `SplitBrollFaceCamShort9x16`**. P9 + P10 + P12 are all variants of the **same "stacked-split 50/50" molecule** — the top-half content varies (headline / mac-window / B-roll). Recommend **one composition `StackedSplitFaceCamShort9x16` with a `topMode: "headline" | "macWindow" | "broll" | "imageGrid"` discriminated union**. **Build priority: HIGH** — this is Igor's dominant Shorts grammar.

---

## 4. Cross-creator findings — 16:9 lane confirmation

This is the **fifth** confirming reference for opening a 16:9 long-form lane in our library (currently 67 compositions, all 9:16):

| # | Creator | Format evidence | Confidence |
|---|---|---|---|
| 1 | `natebjones` | 4/4 long-form videos are 16:9 with deterministic procedural diagrams | HIGH |
| 2 | `aiexplained-official` | 4/4 sampled videos are 16:9 with PDF-screenshot + benchmark-table patterns | HIGH |
| 3 | `mreflow` | 2/2 sampled long-form are 16:9 with source-article + face-cam-circle overlay | HIGH |
| 4 | `sahilbloom` | 9/9 long-form essays are 16:9 with chapter cards + B-roll inserts | HIGH |
| 5 | **`theaiadvantage`** | **8/8 long-form are 16:9 with StudioCompositor + product-demo overlays** | **HIGH** |

**Recommendation:** the 16:9 ADR is now overdue. Open `docs/research/wave-7/ADR-001-16x9-lane.md` synthesizing all 5 creators. **Igor's `StudioCompositor16x9` is the closest analog to our brand voice** of any reference — it's where to start the 16:9 build.

---

## 5. Captions taxonomy — Igor confirms "punchy" register

Igor's Shorts use **bold black-outlined white sans karaoke captions** (matches Hormozi style, NOT Sahil's cyan-active). One word highlighted on the beat. No serif, no italic, no glow.

| Register | Style | Creator examples |
|---|---|---|
| **punchy** | Bold sans + black outline + word-pop on beat; yellow accent allowed | Hormozi, **Igor**, Berman Shorts |
| **editorial** | Cyan-active or yellow-stroke + italic word-emphasis + sentence-mode | Sahil, AI Explained |
| **technical** | Bright-white-active + dimmed-context + monospace context | Adam Rosler, Carlos |

**Action:** add `register: "punchy" | "editorial" | "technical"` discriminated union to our `EditorialCaption.tsx` and bind palette + outline + animation to the register. Igor's `register: "punchy"` is the second creator to validate the same style.

---

## 6. Anti-findings (what NOT to copy)

1. **No always-on watermark on long-form.** Igor's 16:9 videos run *without* a persistent brand watermark — the studio compositor IS the brand. Our `BrandWatermark` is good for Shorts and sound-off, but for any future 16:9 lane it should be *optional*.
2. **No burned-in captions on long-form.** All 8 long-form picks are caption-free for the A-roll dialogue. **Do NOT copy this** — our sound-off-scroller audience requires always-on captions. This is the same anti-finding noted on Matt Wolfe, Matthew Berman, AI Explained, and Sahil.
3. **No tier cards / callout pills as the dominant chrome.** The `info.json` we wrote from pre-scrape inspection guessed "tier cards, callout pills, big-number splashes." After frame extraction the reality is more restrained — UI mockups + prompt bars + comparison grids dominate, NOT chyron-style overlays. **Update `info.json` visual_signatures**.
4. **No animated arrowheads.** Igor uses static chevrons / cursor icons. Aligns with Tella runbook anti-rule.

---

## 7. Replicability vs existing primitives

| Igor pattern | Our existing primitive | Lift |
|---|---|---|
| P1 `StudioCompositor16x9` | NEW composition | M (3-4 days; opens 16:9 lane) |
| P2 `GlowingPromptBar` | NEW molecule | XS (4h) |
| P3 `ModelComparisonGrid16x9` | NEW composition | S (1 day; needs `cells: 2/3/4/6` schema) |
| P4 `FiftyFiftyFeatureMapSplit16x9` | EXTEND `SplitWebcamScreen9x16` | S (4h to add 16:9 + symmetric mode) |
| P5 `WarmPodcastFullBleed16x9` | EXTEND `TalkingHead.tsx` | XS (2h to add `mode` discriminated union) |
| P6 `HighlightedTextSpan` | NEW molecule | XS (3h; sister to PDF-highlight) |
| P7 `TieredPyramidDiagram16x9` | NEW composition | S (1 day) |
| P8 `FiftyFiftyTweetSplit16x9` | EXTEND `TweetCardHero9x16` | S (4h to add 16:9 + face-cam-right) |
| P9/P10/P12 `StackedSplitFaceCamShort9x16` | NEW composition with `topMode` union | M (1 day for unified molecule; reuses `<MacWindow>` and `EditorialCaption`) |
| P11 `MemeBrollOverlayCaption` | None needed (covered by existing) | 0 (document tactic in voice.md) |

**Total estimated lift:** ~7-8 days for full Igor-parity, including opening the 16:9 lane.

---

## 8. Build priority queue (appended to Wave-7 backlog)

| Rank | Item | Lift | Why |
|---|---|---|---|
| I1 | `<GlowingPromptBar>` molecule | XS | Reused 3x in sample; atomic; immediately useful in 9:16 too |
| I2 | `<HighlightedTextSpan>` molecule | XS | Sister to AI Explained yellow PDF highlight; reusable |
| I3 | `register: "punchy"` mode on `EditorialCaption` | XS | Second creator (after Hormozi) confirms this register exists |
| I4 | `StackedSplitFaceCamShort9x16` composition (topMode union) | M | Igor's dominant Shorts grammar; 4/4 picks |
| I5 | `mode: "warmPodcast" \| "studioCompositor"` on TalkingHead | XS | Two-register split is real; cheap to add |
| I6 | `StudioCompositor16x9` composition + 16:9 lane open | M | Closest to our brand voice in the reference set; opens lane |
| I7 | `ModelComparisonGrid16x9` (cells: 2/3/4/6) | S | Uniquely Igor; great for "X vs Y" content |
| I8 | `TieredPyramidDiagram16x9` | S | Editorial classic, single-instance but reusable |
| I9 | Extend `SplitWebcamScreen` to 16:9 + symmetric-comparison | S | Two creators now confirm 16:9 feature-map sibling |
| I10 | Extend `TweetCardHero` to 16:9 + face-cam-right | S | Two creators (Wolfe + Igor) confirm 16:9 sibling |
| I11 | Document "warm interior set" production design | doc | Authority signal lesson; goes in `brand/voice.md` |
| I12 | Document "register" caption taxonomy | doc | Wave-7 deliverable: register prop bindings |

**Top 3 to ship in Sprint A:** I1 (`<GlowingPromptBar>`), I4 (`StackedSplitFaceCamShort9x16`), I3 (`register: "punchy"`). All XS-S, all immediately useful in current 9:16 pipeline, none require the 16:9 lane decision.

**Sprint B (post 16:9 ADR):** I6 (`StudioCompositor16x9`) + I7 (`ModelComparisonGrid16x9`) — together open the 16:9 long-form lane with two compositions, which is the minimum viable 16:9 entry.

---

## 9. Sources

- Scraper command: `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]"` per video ID
- Frame extraction: ffmpeg `fps=1/15` coarse + `fps=1/1.5` dense (long-form), `fps=1/3` coarse for Shorts
- Reference clips: `docs/research/wave-6/references/theaiadvantage/<id>-anim-NN.mp4` (audio stripped, libx264 crf 28, scaled to 720w for long-form / 540w for Shorts; all <2 MB)
- Frames: `references/creators/theaiadvantage/<id>/frames/anim-NN-*.jpg`
- YouTube channel: https://www.youtube.com/@aiadvantage
- Image read budget consumed: 20 of max 24
- Source MP4s: **DELETED** after each extraction (none retained in `/tmp/wave7-aiadvantage/`)

---

## 10. Closest creator analogs

- **`mreflow` (Matt Wolfe)** — same niche (AI news roundup), same English-language tutorial lane, similar production tier. Igor is the polished/AE-templated sibling; Wolfe is the Loom-first sibling.
- **`sahilbloom`** — same Warm Podcast register for essays; different topic.
- **`adamrosler`** — sibling for the 9:16 Shorts grammar (split-screen + bold karaoke caption + dark BG variant).
- **`matthewberman`** — same English AI-news anchor but Matt's production is lower-tier (Loom + iPad whiteboard); Igor is the higher-budget version of the same job.
- **`carloscuamatzin`** — Spanish-language peer; visually distinct (cream/serif vs Igor's dark/sans) but same content niche.
