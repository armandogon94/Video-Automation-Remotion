# Nate B Jones — motion-graphics analysis (Voter #1)

> Independent vote. Voter #2 at `ANALYSIS-VOTE2.md`. Consensus at `docs/research/wave-6/natebjones-consensus.md`.

---

## 1. Voter metadata

| Field | Value |
|---|---|
| Voter | vote1 |
| Date | 2026-05-27 |
| Channel URL | https://www.youtube.com/@NateBJones |
| Channel total videos listed | 90 (60 long-form + 30 Shorts) |
| Videos analyzed for this vote | 6 (4 long-form 16:9 + 3 Shorts 9:16 — one Short overlaps as podcast-clip variant) |
| Selection methodology | Title-heuristic picks (view counts not returned by `--flat-playlist` for long-form). Long-form picks chosen by numbered/enumeration headlines (`5 Giants`, `12 Critical Pieces`, `RTX 5090 / Mac Studio / DGX Spark`) and editorial verbs (`Broke Down`, `Leak`, `tried all three`). Shorts picked by top view count (21k / 20k / 19k). |
| Picks JSON | `references/creators/natebjones/picks-vote1.json` |
| Animation ranges JSON | `references/creators/natebjones/animation-ranges-vote1.json` |
| Channel info JSON | `references/creators/natebjones/info.json` |
| Dense frames root | `references/creators/natebjones/<videoId>/frames/` (308 frames across 5 videos) |
| Reference clip root | `docs/research/wave-6/references/natebjones/<videoId>-vote1-anim-NN.mp4` (14 clips, durations 20–100s) |
| Scrape tool | gallery-dl (no auth, public channel) — see `info.json` "all_videos_listed: 90" |

**Per-video frame counts:**

| Video ID | Format | Animations analyzed | Frames |
|---|---|---|---|
| `FtCdYhspm7w` (Anthropic $2.5B leak) | long-form 16:9 | 7 | 107 |
| `iUSdS-6uwr4` (RTX 5090 / Mac Studio / DGX Spark) | long-form 16:9 | 2 | 30 |
| `woGB2vr5wTg` (5 Infrastructure Giants) | long-form 16:9 | 2 | 26 |
| `5RCsb9XMuIU` (AI memory mistake) | Short 9:16 | 1 (full duration) | 40 |
| `eszYRrsIdHg` (30¢ infinite memory) | Short 9:16 | 1 (full duration) | 38 |
| `oWIXee9h3nU` (Codex valued a house) | Short 9:16 | 1 (full duration) | 67 |

---

## 2. Channel overview

**Who he is.** Nate B Jones is a US-based AI/agentic-systems analyst with a Substack and YouTube channel, posting English-language deep dives on Anthropic / OpenAI / agent infrastructure. The dominant format is **20–52 minute long-form 16:9 essays** (60 of his 90 listed videos), with **30 Shorts in 9:16** as a side stream. His on-camera setup is a low-key home studio in front of a packed bookshelf with a Lego castle on top — he records multiple sessions in different rooms / outfits and cuts them together within a single long-form (we see at least 3 distinct rigs in `FtCdYhspm7w` / `iUSdS-6uwr4` / `woGB2vr5wTg`). The voice is "senior PM walking you through a leaked doc," not vlogger-energetic.

**Visual motifs.** The recurring design tokens are unmistakable: a **dark-navy radial-gradient backdrop** (~`#0F1A26` → `#152436` toward center), a faint **bookshelf+round-glasses watermark** ghosted at very low opacity on the left edge of fullscreen-card scenes, a **persistent CTA pill bottom-right** that crossfades between `read more on substack` and `@nate.b.jones` (the bookshelf+glasses logomark is always inside the pill), **chunky semi-bold sans typography** (a Söhne / Inter-class face) for headings, and a tight **5-color accent palette** (orange `#E07B3C`, cyan `#52B8D6`, violet `#A35BC8`, green `#3FA86B`, yellow/gold `#C8A23B`) used to differentiate cards/rows by category. Every fullscreen card has a faint elliptical vignette glow centered on the content. He uses **emphasis-word caption pills** at the bottom of cards — a single bordered pill containing a full sentence with ONE word colored orange (e.g. `Layered security architecture` → "Layered" orange; `Agentic harness translates lessons across implementations` → "harness" orange). The cadence inside long-form is `talking-head ↔ fullscreen-card ↔ short dark-gradient breath beat`. Shorts are a different design — almost no insert graphics, just TikTok-style word-by-word burned captions with a neon-green active word and a sliding CTA pill.

---

## 3. Per-video distillation

### 3.1 `FtCdYhspm7w` — "I Broke Down Anthropic's $2.5 Billion Leak. Your Agent Is Missing 12 Critical Pieces."
- **Duration:** 1613 s (~26 min) · **Format:** long-form 16:9 · **Animations sampled:** 7

**Anim 1 — `StackedProgressParentChild` (292–312 s)**
- *Visual.* Hero number 0 (orange `#E07B3C`, ~280pt semi-bold) with a faint stacked-layers monoline icon ghosted behind it, labeled "Primitives." Three child rows below stagger in: Orchestration / Integration / Foundation, each with a colored dot-progress strip and a right-aligned per-row count (3 / 5 / 4). Background: dark-navy radial gradient with persistent CTA pill bottom-right.
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-01-frame-001…013-t292s.jpg` (the inserted-graphic appears between talking-head beats — frames 010+ show the fullscreen card on its own).
- *Clip.* `docs/research/wave-6/references/natebjones/FtCdYhspm7w-vote1-anim-01.mp4` (22 s)
- **transitionVerb:** count-up + stagger-in
- **orientation:** 16:9
- **replicability:** Existing `countUp` + `staggeredCascade` primitives cover the motion. Layout needs a new molecule `StackedProgressCard` (parent hero number + 3 colored dot-progress child rows). Effort: M.

**Anim 2 — `TreeOfChildCards` (337–355 s)**
- *Visual.* Database/stack monoline icon + "Tool Registry" parent header, then 4 child cards arranged in a row: Description / Risk Level / Capabilities / Permissions, each card has a thin colored outline (cyan / violet / green / orange) with a monoline icon and a 2-line label. No central operator between cards — pure horizontal tree.
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-02-frame-001…012-t337s.jpg`
- *Clip.* `FtCdYhspm7w-vote1-anim-02.mp4` (20 s)
- **transitionVerb:** stagger-in
- **orientation:** 16:9
- **replicability:** Adjacent to our `DecisionTree9x16` but in 16:9 with a horizontal 4-up layout. Needs new molecule `TreeOfChildCards` or a 16:9 variant of `DecisionTree`. Effort: M.

**Anim 3 — `BigNumberHorizontalBars` (500–525 s)**
- *Visual.* Hero number `18` (orange, ~280pt) + small "Security Modules" label, then 5 stacked full-width horizontal colored bars: Auth (orange) / Validation (cyan) / Execution (violet) / Audit (green) / Recovery (yellow), each with a right-aligned single-digit count (3 / 4 / 5 / 3 / 3). Emphasis-word caption pill at the bottom: `**Layered** security architecture` (Layered in orange).
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-03-frame-014-t500s.jpg` is the fully-revealed state; earlier frames are mid-build.
- *Clip.* `FtCdYhspm7w-vote1-anim-03.mp4` (27 s)
- **transitionVerb:** count-up + bars-fill-in
- **orientation:** 16:9
- **replicability:** Combines `countUp` (hero number) + a new `BarChartFullWidth` molecule (horizontal stacked colored bars with right-aligned per-row counts). Closest existing template: `BarChartList9x16` — needs a 16:9 hero-number variant. Effort: M.

**Anim 4 — `SectionDividerTitleCard` (500–522 s, overlapping range)**
- *Visual.* "Security Stack" bold sans hero + "18 modules for one tool" light subtitle, centered on dark-navy radial gradient. Same bookshelf+glasses watermark suggestion + persistent CTA pill. Pure title card with no data.
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-04-frame-008-t500s.jpg`
- *Clip.* `FtCdYhspm7w-vote1-anim-04.mp4` (24 s)
- **transitionVerb:** fade-in
- **orientation:** 16:9
- **replicability:** Trivial — covered by `BrandedOpener9x16` rotated to 16:9, or by extending `TechNewsFlash9x16` headline pattern. Effort: S.

**Anim 5 — `DecisionTree3Cards` (1315–1345 s)**
- *Visual.* Anthropic-style black asterisk/sparkle icon + "Claude Code / Lessons & patterns" header, then orange "Operationalize" word with a vertical orange line connector, then 3 child cards: Custom Agent (cyan outline + spark icon) / Your Harness (violet + lightning) / Any Stack (green + stacked-layers). Full-width emphasis-pill at the bottom: `Agentic **harness** translates lessons across implementations` (harness in orange).
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-05-frame-020-t1315s.jpg` is the fully-revealed reveal.
- *Clip.* `FtCdYhspm7w-vote1-anim-05.mp4` (32 s)
- **transitionVerb:** stagger-in + line-draw
- **orientation:** 16:9
- **replicability:** Direct hit on existing `DecisionTree9x16` if we add a 16:9 variant and an `EmphasisPill` bottom slot. Effort: S–M.

**Anim 6 — `TwoColumnRedGreenContrast` (1320–1340 s)**
- *Visual.* JSON describes a Random/Scoped left-vs-right with red warning triangle + scattered person icons vs green check. Captured frames in this range only show talking-head + a dark-gradient breath beat (frame 013); the actual diagram frames may fall just outside the sampled bracket. Treat as a **two-column-with-icons compare** pattern based on JSON evidence.
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-06-frame-008…013-t1320s.jpg` (mostly talking-head and breath beat — diagram not captured in the sampled frames)
- *Clip.* `FtCdYhspm7w-vote1-anim-06.mp4` (22 s)
- **transitionVerb:** reveal each side then connect
- **orientation:** 16:9
- **replicability:** Adjacent to `VennDiagram9x16` and `CodeDiffBeforeAfter9x16`. Likely a new 16:9 `TwoColumnRedGreenContrast` molecule. Effort: M. **Confidence flag:** lower than other anims — the captured frames don't fully confirm the JSON description, treat as voter-#1 guess.

**Anim 7 — `TreeOfChildCardsWithEmphasisPill` (1395–1420 s)**
- *Visual.* Shield monoline icon + 3 child cards (Interactive green / Coordinator orange / Swarm Worker violet — each with icon + label + tiny gray subtitle), a mono-font badge "Permission state as first-class object" below, and a full-width bottom emphasis pill: `**3 types** of agent permission models` with "3 types" in orange.
- *Frames.* `FtCdYhspm7w/frames/vote1-anim-07-frame-001…017-t1395s.jpg` (frames show talking-head + CTA-pill mid-crossfade — same pattern as anim 5).
- *Clip.* `FtCdYhspm7w-vote1-anim-07.mp4` (27 s)
- **transitionVerb:** stagger-in
- **orientation:** 16:9
- **replicability:** Same template as anim 2 / anim 5 — needs a 3-card 16:9 row molecule. Effort: S (reuses Anim-2/5 molecule).

---

### 3.2 `iUSdS-6uwr4` — "RTX 5090, Mac Studio, or DGX Spark? I tried all three."
- **Duration:** 1956 s (~33 min) · **Format:** long-form 16:9 · **Animations sampled:** 2

**Anim 1 — `NamedCardEquation` (665–685 s)**
- *Visual.* Hero "equation" pattern: 4 cards across, separated by typographic operators. Card 1 `Ollama / daily use` (cyan outline) **+** Card 2 `LM Studio / evals` (green) **+** Card 3 `vLLM / serving` (violet) **=** Card 4 `Path / practical` (orange). Each card has a thin colored outline, white bold label, smaller colored sub-label. Big bookshelf+glasses watermark faint on the LEFT edge of the frame (not in the bottom-right CTA pill — this is the larger watermark variant). Bottom emphasis pill: `Use the runtime tier that **matches** the job` ("matches" in orange).
- *Frames.* `iUSdS-6uwr4/frames/vote1-anim-01-frame-008-t665s.jpg` is the fully-revealed state.
- *Clip.* `iUSdS-6uwr4-vote1-anim-01.mp4` (22 s)
- **transitionVerb:** stagger-in (left → right) with operators
- **orientation:** 16:9
- **replicability:** A signature Nate pattern — appears again in `woGB2vr5wTg` anim-02 with different content. Needs a new molecule `NamedCardEquation` (parameterized: N cards + N–1 operators between them, where the last operator is typically `=`). Effort: M.

**Anim 2 — `BeforeAfterTextComparison` (1790–1815 s)**
- *Visual.* Big gray "TO" arrow word centered at top, with two columns below. Left: orange underline + uppercase tracking label `DEFAULT` + bold sans `Cloud Home` + light italic `rented memory`. Right: cyan underline + `BETTER` + `Cloud Guest` + `specialist`. Same bookshelf+glasses LEFT-edge watermark. Bottom emphasis pill: `Own the **substrate** cloud models plug into`.
- *Frames.* `iUSdS-6uwr4/frames/vote1-anim-02-frame-005-t1790s.jpg` (fully revealed).
- *Clip.* `iUSdS-6uwr4-vote1-anim-02.mp4` (27 s)
- **transitionVerb:** column-fade-in (left first, then right)
- **orientation:** 16:9
- **replicability:** Adjacent to `CodeDiffBeforeAfter9x16` and `BigNumberDuel9x16` but in 16:9 with text-only (no code, no numbers). Needs new 16:9 `BeforeAfterText` molecule with the colored-underline+all-caps-label header device. Effort: M.

---

### 3.3 `woGB2vr5wTg` — "These 5 Infrastructure Giants Secretly Rule AI"
- **Duration:** 1220 s (~20 min) · **Format:** long-form 16:9 · **Animations sampled:** 2

**Anim 1 — `VsTextComparison` (340–360 s) — voter-#1 JSON misnamed**
- *Visual.* Captured frames show a 2-column text VS comparison: big gray "VS" word centered, Left: green underline + `CLEAR` + bold `Scoped Agent` + `revocable` (green). Right: orange underline + `FUZZY` + `Unknown Actor` + `risky` (orange). Bookshelf+glasses faint LEFT-edge watermark. (JSON labeled this as `fullscreen-title-card` but frame-001 clearly shows the VS comparison — voter #1 mis-described.)
- *Frames.* `woGB2vr5wTg/frames/vote1-anim-01-frame-003-t340s.jpg` (fully revealed VS).
- *Clip.* `woGB2vr5wTg-vote1-anim-01.mp4` (22 s)
- **transitionVerb:** column-fade-in
- **orientation:** 16:9
- **replicability:** Same molecule as `iUSdS-6uwr4/anim-2` (BeforeAfterText) — parameterize the central word so it can be `VS` / `TO` / `→`. Effort: S (variant of anim-2).

**Anim 2 — `NamedCardEquation` (370–390 s)**
- *Visual.* Second instance of the equation pattern with security content: `Principal / who acts` (cyan) **+** `Delegation / what scope` (orange) **+** `Audit Log / proof` (violet) **=** `Authority / safe agent` (green). Same large LEFT-edge bookshelf+glasses watermark, CTA pill bottom-right. (JSON described this as a "watermark-fade-transition breath beat" — voter #1 mis-categorized: the captured frame-001 shows the fully-formed 4-card equation; the breath beat appears at frame-008 within the same range.)
- *Frames.* `woGB2vr5wTg/frames/vote1-anim-02-frame-001-t370s.jpg` (equation fully revealed).
- *Clip.* `woGB2vr5wTg-vote1-anim-02.mp4` (22 s)
- **transitionVerb:** stagger-in (left → right) with operators
- **orientation:** 16:9
- **replicability:** Reuses the `NamedCardEquation` molecule proposed for `iUSdS-6uwr4/anim-1`. Effort: 0 (reuse). Confirms the pattern is a true Nate template, not a one-off.

---

### 3.4 `5RCsb9XMuIU` — "The massive mistake in AI memory" (Short)
- **Duration:** ~58 s · **Format:** Short 9:16 · **Animations sampled:** 1 (full duration)

**Anim 1 — `TikTokWordCaptionsWithCtaPill` (0–57 s)**
- *Visual.* Talking-head webcam, 9:16 vertical, no insert graphics. Lower-third has a 2-line stacked TikTok-style caption with all-caps bold sans typography: the **active word is neon green** (e.g. `DESIGNED`, `ANTHROPICS`) in a slightly larger weight, with **white upcoming words** above/around it. A persistent CTA pill sits bottom-right, sliding between `@nate.b.jones` and the bookshelf+glasses logomark only (it shrinks to just-the-icon during some beats).
- *Frames.* `5RCsb9XMuIU/frames/vote1-anim-01-frame-005-t0s.jpg`, `…-frame-020-t0s.jpg`.
- *Clip.* `5RCsb9XMuIU-vote1-anim-01.mp4` (59.7 s — entire Short)
- **transitionVerb:** karaoke-word-highlight + persistent-CTA-slide
- **orientation:** 9:16
- **replicability:** Direct match to our existing `EditorialCaption` + `ChunkedPhraseCaption` + `BrandWatermark`. Caption styling already supported; the missing piece is the **sliding/crossfading CTA pill that cycles between handle and "read more on substack"** — that's a small enhancement to `BrandWatermark` (add a `cycleLabels?: string[]` prop). Effort: S.

---

### 3.5 `eszYRrsIdHg` — "This 30-cent database gives your AI infinite memory" (Short)
- **Duration:** ~57 s · **Format:** Short 9:16 · **Animations sampled:** 1 (full duration)

**Anim 1 — `TikTokWordCaptionsWithCtaPill` (0–57 s)**
- *Visual.* Identical pattern to `5RCsb9XMuIU/anim-1`. Talking-head with TikTok captions (neon-green active word, white upcoming) + persistent CTA pill bottom-right. Confirms this is Nate's **only** Shorts template for solo-talking-head content — no inserted graphics, no number cards, no diagrams.
- *Frames.* `eszYRrsIdHg/frames/vote1-anim-01-frame-008-t0s.jpg`.
- *Clip.* `eszYRrsIdHg-vote1-anim-01.mp4` (56.8 s — entire Short)
- **transitionVerb:** karaoke-word-highlight + persistent-CTA-slide
- **orientation:** 9:16
- **replicability:** Reuses `EditorialCaption` + `BrandWatermark` cycle enhancement from `5RCsb9XMuIU/anim-1`. Effort: 0 (reuse).

---

### 3.6 `oWIXee9h3nU` — "Codex Just Valued A Random House In India. I Wasn't Ready." (Short)
- **Duration:** 100.5 s · **Format:** Short 9:16 (clipped from a 2-host podcast) · **Animations sampled:** 1 (full duration)

**Anim 1 — `Podcast2UpVerticalCrop` (0–100 s)**
- *Visual.* A 16:9 podcast clip (Nate + a second host at a wooden table with mics, against a beige wall + plant) is **letterboxed as a central horizontal band** in the 9:16 frame, with **heavily blurred extensions** above and below filling the rest of the vertical canvas. No captions visible in sampled frames. No emphasis pills. The CTA pill is absent from the sampled frames (may appear at the very start/end). Distinct from the other 2 Shorts — this is a podcast cutdown, not a vlog-style talking-head.
- *Frames.* `oWIXee9h3nU/frames/vote1-anim-01-frame-010-t0s.jpg`, `…-frame-040-t0s.jpg`.
- *Clip.* `oWIXee9h3nU-vote1-anim-01.mp4` (100.5 s — entire Short)
- **transitionVerb:** none (steady letterbox)
- **orientation:** 9:16
- **replicability:** Adjacent to `SplitWebcamScreen9x16` but with **blurred pillarbox extension** instead of a split. Could be a `PodcastLetterbox9x16` new template if we ever do podcast cutdowns, but currently low priority — we don't record podcasts. Effort: M but **deprioritize**.

---

## 4. Catalog of distinct patterns

| # | Pattern (PascalCase) | Frequency | transitionVerb | Orientation | Replicability — existing primitives | Replicability — new needed | Effort | Replication priority |
|---|---|---|---|---|---|---|---|---|
| 1 | `NamedCardEquation` | 2 (iUSdS anim-1, woGB2 anim-2) | stagger-in left→right with operators | 16:9 | `staggeredCascade`, `heldStagger` | New molecule: N labeled-cards + N–1 operators (typographic `+ / = / →`), thin-colored-outline card style, colored sub-labels | M | 🔴 high — 2 hits + very on-brand |
| 2 | `TreeOfChildCardsWithEmphasisPill` | 3 (FtCd anim-2, anim-5, anim-7) | stagger-in + optional line-draw | 16:9 | `staggeredCascade`, `pathDraw` | Parent-header + 3-or-4 child cards row + bottom emphasis-pill slot. Closest existing: `DecisionTree9x16` → needs 16:9 variant + emphasis-pill slot | S–M | 🔴 high — dominant Nate pattern (3 hits) |
| 3 | `BigNumberHorizontalBars` | 1 (FtCd anim-3) | count-up + bars-fill-in | 16:9 | `countUp` | New molecule: hero-number + N full-width colored bars with right-aligned per-row counts + bottom emphasis-pill. 16:9 variant of `BarChartList9x16` | M | 🟠 med — striking but only 1 hit |
| 4 | `StackedProgressParentChild` | 1 (FtCd anim-1) | count-up + stagger-in | 16:9 | `countUp`, `staggeredCascade` | New molecule: parent hero-number + 3 colored dot-progress child rows with per-row counts | M | 🟠 med |
| 5 | `BeforeAfterTextComparison` | 2 (iUSdS anim-2, woGB2 anim-1) | column-fade-in (left then right) | 16:9 | `blurInFocus`, `staggeredCascade` | New molecule: central typographic operator word (`TO / VS / →`), colored-underline tracking-labels above each column, bold-sans + light-italic-sub copy. Parameterize central word | M | 🔴 high — 2 hits |
| 6 | `TwoColumnRedGreenContrast` | 1 (FtCd anim-6, JSON-only, low-confidence) | reveal-each-side | 16:9 | `staggeredCascade` | Distinct from #5: uses warning-triangle + check icons + scattered person icons. Adjacent to `VennDiagram9x16` | M | 🟡 low — voter-#1 description not fully confirmed by sampled frames |
| 7 | `SectionDividerTitleCard` | 1+ (FtCd anim-4, likely common interstitial throughout long-form) | fade-in | 16:9 | — | Covered by `BrandedOpener9x16` if rotated to 16:9. Adds the bookshelf-watermark + radial-gradient palette | S | 🟢 trivial |
| 8 | `DarkGradientBreathBeat` | 1+ (FtCd anim-6 frame-013) | hold (no motion) | 16:9 | — | A deliberate 0.5–1.5 s pause card — pure dark-navy radial gradient + ghosted watermark + CTA pill only. **Editing pattern, not a template** — just a transition timing rule | XS | 🟢 trivial — document as a rhythm rule |
| 9 | `EmphasisWordCaptionPill` | 5+ (in FtCd anim-3, anim-5, anim-7, iUSdS anim-1, anim-2) | fade-in slightly delayed vs card | both | `blurInFocus` | A bordered rounded pill with a full-sentence caption where ONE word is colored orange. Already partially covered by `TextEmphasis.tsx` — needs a "bottom-anchored pill" wrapper variant | S | 🔴 high — appears in nearly every fullscreen card |
| 10 | `PersistentCtaPillCycling` | 6/6 videos (long-form and Shorts) | crossfade between labels every ~5–10 s | both | — | Enhancement to `BrandWatermark` / `BrandedOpener` — `cycleLabels?: string[]` plus a small monoline-logo icon prefix. The cycle alternates handle ↔ subscribe-CTA labels | S | 🔴 high — Nate's signature chrome, ALWAYS present |
| 11 | `LeftEdgeAvatarWatermark` | 2 (iUSdS anim-1/2, woGB2 anim-1/2) | static, ~6% opacity | 16:9 | — | A larger, faded version of the bookshelf+glasses logomark, ~30–40% of the canvas height, anchored to the left edge of fullscreen cards. Distinct from the bottom-right CTA pill. | XS | 🟠 med — secondary chrome detail |
| 12 | `TikTokWordCaptionsWithCtaPill` | 2 (5RCsb anim-1, eszY anim-1) | karaoke-word-highlight | 9:16 | `ChunkedPhraseCaption`, `EditorialCaption`, `BrandWatermark` | All covered by existing primitives. The only delta is the CTA pill cycle enhancement (#10) | 0–S | 🟢 already covered |
| 13 | `Podcast2UpVerticalCrop` | 1 (oWIXee anim-1) | none (steady letterbox + blurred pillarbox) | 9:16 | — | A `PodcastLetterbox9x16` template — central letterboxed clip + blurred pillarbox top/bottom. **Deprioritize** — we don't currently produce podcast cutdowns | M | ⚫ skip for now |

**Total distinct patterns: 13** (10 visual templates/molecules + 3 chrome/timing rules).

**Orientation breakdown:** 10 patterns are 16:9-only (long-form territory), 1 pattern is 9:16-only (`Podcast2UpVerticalCrop`), 1 pattern is shared (Shorts caption template), and chrome patterns 9 + 10 work in both. **The user's claim about "our style of animations" applies primarily to the 16:9 long-form work — see §6.**

---

## 5. Comparison to other creators in our library

| Creator | Shared patterns | Where Nate is unique |
|---|---|---|
| **`carloscuamatzin`** | Both heavily use `EmphasisWordCaptionPill`, both run a multi-template "library" (not a single house style), both use radial-gradient dark backgrounds for hero cards. Carlos has 6 templates; Nate has at least 10 distinct molecules in long-form. | Carlos's templates are mostly **9:16** (Spanish IG reels); Nate's are mostly **16:9**. Nate's `NamedCardEquation` and `TreeOfChildCardsWithEmphasisPill` are not in Carlos's library. |
| **`diysmartcode`** | Both use `BigNumberHero` patterns; both have a "top breadcrumb + accent label" device (Nate's version is the colored underline + tracking-spaced label in `BeforeAfterTextComparison`); both use one accent color per card. | DIYSmartCode uses **cream + warm-red CreamEditorial** as one of his three palettes — Nate does NOT do cream. Nate's color discipline is strictly dark-navy + 5 accents. DIYSmartCode uses NO burned-in captions; Nate burns captions on Shorts but not on long-form (long-form has voiceover-only with insert cards). |
| **`bilawal.ai`** | Both use **persistent chrome** in long-form (Bilawal: TweetCardOverlay over screen-rec; Nate: CTA pill + left-edge avatar watermark). | Bilawal's headline template is `TweetCardOverlay` — Nate has nothing like it. Bilawal trends toward Bloomberg-serif editorial; Nate is pure-sans Söhne/Inter. |
| **`simonhoiberg`** | Both have **editorial restraint** as the brand (Simon: 8/12 reels are undecorated studio talking-head; Nate: long-form is `talking-head ↔ fullscreen-card ↔ breath-beat`, with cards being the only graphics). Both use glassy radial gradients. | Simon's `LayerCardStack` (3 horizontal rounded white cards) is the inverse palette of Nate's dark cards. Simon is a 9:16 IG creator; Nate is primarily 16:9 long-form. |
| **`alexhormozi`** | Both rely on **caption layer typography** for Shorts (Hormozi has 13 caption-layer patterns; Nate has 1 — TikTok green-active-word). Both use a **persistent top/bottom hook pill**. | Hormozi has ZERO procedural motion graphics (per the existing analysis — "typography on video, NOT procedural motion graphics"). Nate has ~10 procedural patterns in long-form. **Nate's long-form is much closer to "our style" than Hormozi's Shorts are.** |

**Net read:** Nate occupies an **uncrowded slot** in the reference library — the **only creator** doing 16:9 long-form motion-graphic inserts with the specific Söhne-sans + dark-navy-radial + 5-accent + emphasis-pill grammar. This is meaningfully different from the 9:16 Carlos/Simon/Bilawal lane and from the no-motion Hormozi lane.

---

## 6. User-claim verification

**Claim:** "@NateBJones adds our style of animations."

**Verdict: ✅ Confirmed — but with two important caveats.**

**Evidence FOR the claim:**
- **Color palette overlap is exceptional.** Nate's dark-navy `#0F1A26` → `#152436` radial gradient is within 5% of our `#0F1B2D` deep navy from `brand/config.json`. His orange `#E07B3C` accent is within 10% of our gold `#D4AF37`. His use of cyan + violet + green + yellow as category colors is the same 5-accent palette family we use across our existing 67 compositions.
- **Typography is Inter / Söhne semi-bold for headings + light italics for sub-labels** — identical to our `brand/config.json` Inter directive.
- **Emphasis-word caption pill** (one word in orange inside a bordered rounded pill at the bottom of a hero card) is our `TextEmphasis.tsx` exact use-case. He uses it in 5+ of the 11 long-form anims sampled.
- **The `NamedCardEquation` and `TreeOfChildCardsWithEmphasisPill` molecules are direct cousins of our existing `DecisionTree9x16`, `VennDiagram9x16`, and `PipelineFlow9x16`** compositions. Adding 16:9 variants would slot them straight into our pipeline.
- **`countUp` + `staggeredCascade` + `blurInFocus`** — three of our existing primitives — cover roughly 80% of Nate's motion behavior in long-form. We do not need new motion primitives; we need new **layout molecules** to host them.

**Evidence AGAINST / caveats:**
- **Caveat 1 — orientation.** Nate's "our style" patterns are almost all **16:9 long-form**. The 9:16 Shorts use a very different design (talking-head + TikTok captions only, no graphics). Our existing 67 compositions are **9:16-only**. So we'd need to either (a) rotate his patterns into 9:16 (loses information density), (b) build a 16:9 sibling library of compositions, or (c) skip Nate's long-form pattern lift and only adopt the Shorts CTA-pill enhancement. **This is the load-bearing decision.**
- **Caveat 2 — recording rig.** Nate cuts together 2–3 different talking-head recording sessions per long-form (different beanies, sweaters, rooms — see `iUSdS-6uwr4` frame-010 vs `FtCdYhspm7w` frame-013). Our pipeline doesn't currently model multi-rig editing; long-form would require either accepting talking-head consistency or modeling this multi-setup behavior. **Out of scope for template lift, but a tooling note.**

**Top-3 evidence frames:**
1. `references/creators/natebjones/FtCdYhspm7w/frames/vote1-anim-03-frame-014-t500s.jpg` — `BigNumberHorizontalBars` with emphasis pill, color palette match, Söhne-class type
2. `references/creators/natebjones/FtCdYhspm7w/frames/vote1-anim-05-frame-020-t1315s.jpg` — `TreeOfChildCardsWithEmphasisPill`, decision-tree analogue with line connector + emphasis pill
3. `references/creators/natebjones/iUSdS-6uwr4/frames/vote1-anim-01-frame-008-t665s.jpg` — `NamedCardEquation` with 4 colored cards + `+/=` operators + emphasis pill + left-edge watermark

---

## 7. Build priority queue addendum

Ranked list of NEW primitives / molecules / compositions specific to Nate's library. Effort is XS (<1h), S (1–2h), M (4–8h), L (1–2d).

| Rank | Item | Type | Effort | Why |
|---|---|---|---|---|
| 1 | `BrandWatermark.cycleLabels` enhancement | Component prop | XS | Adds the persistent CTA pill cycling (Nate's signature chrome). Reusable across Shorts and long-form. Unlocks #4 below. |
| 2 | `NamedCardEquation16x9` | New composition (16:9) | M | Highest-frequency hero pattern (2 hits across different videos / different content domains — security + hardware). Maps to the agentic-systems content domain Armando also produces. |
| 3 | `TreeOfChildCardsWithEmphasisPill16x9` | New composition (16:9) | M | Dominant Nate pattern (3 hits in one video). Extends our existing `DecisionTree9x16` to 16:9 + adds emphasis-pill slot. |
| 4 | `EmphasisPill` shared molecule | Component (extends `TextEmphasis.tsx`) | S | A bordered rounded full-sentence pill with one word colored. Needed by every Nate hero card. Should also retrofit to our 9:16 compositions where appropriate. |
| 5 | `BeforeAfterText16x9` | New composition (16:9) | M | 2 hits (iUSdS + woGB2). Parameterized central operator word (`TO / VS / →`). Adjacent to `CodeDiffBeforeAfter9x16` but text-only. |
| 6 | `BigNumberHorizontalBars16x9` | New composition (16:9) | M | 1 hit but visually one of his strongest. Combines `countUp` + horizontal-stacked-bars. Different enough from `BarChartList9x16` (which is 9:16 and vertical-rows) to deserve a new composition. |
| 7 | `StackedProgressParentChild16x9` | New composition (16:9) | M | 1 hit. Parent-number + 3 colored dot-progress child rows. Adjacent to #6 but uses dot-progress instead of bars. Could be merged with #6 as a single `BigNumberWithChildRows16x9` if we want to consolidate. |
| 8 | `SectionDividerTitleCard16x9` | Variant of `BrandedOpener9x16` | S | The talking-head-to-fullscreen-card breath-beat title interstitial. Adds the bookshelf-style watermark + dark-navy radial-gradient palette. |
| 9 | `LeftEdgeAvatarWatermark` shared component | Component | XS | The faded large logomark anchored to the left edge of fullscreen cards. Easy add — single SVG + opacity + position prop. Refactor existing `BrandWatermark` to support edge-anchored variant. |
| 10 | `DarkGradientBreathBeat` editing rule | Documentation only | XS | Add a "rhythm rule" to `docs/prompts/animation-replication-runbook.md`: insert a 0.5–1.5 s pure-gradient pause between talking-head and fullscreen-card. No code — just a pipeline pacing instruction. |
| 11 | `TwoColumnRedGreenContrast16x9` | New composition (16:9) | M | Voter-#1 description only partially confirmed by frames — defer until Voter #2 confirms or until we sample the actual diagram frames. |
| 12 | `PodcastLetterbox9x16` | New composition (9:16) | M | Skip for now — we don't produce podcast cutdowns. Re-rank if our content mix changes. |

**Meta-recommendation:** Before building any 16:9 composition from Ranks 2–7, **decide whether the @armandointeligencia pipeline will support a 16:9 long-form mode**. Today our 67 compositions are 9:16-only. If long-form 16:9 stays out of scope, the *only* Nate adoption we should ship is **Rank 1 (cycleLabels) + Rank 4 (EmphasisPill) + Rank 9 (LeftEdgeAvatarWatermark)** — all small chrome refinements that retrofit our existing 9:16 catalog.

If we DO open a 16:9 lane, the build order is Rank 1 → 4 → 2 → 3 → 5 → 6/7 → 8 → 9 → 10 → 11 → 12.

---

## 8. Open questions for consensus pass

1. **Anim 6 (`TwoColumnRedGreenContrast`):** Sampled frames don't fully match the JSON description. Voter #2 should re-sample frames at t≈1325–1340 s in `FtCdYhspm7w` to confirm or refute.
2. **Anim 4 vs Anim 3 in `FtCdYhspm7w`:** The JSON has Anim 3 at `[500, 525]` and Anim 4 at `[500, 522]` — overlapping ranges. Anim 4's captured frames show a `SectionDividerTitleCard` ("Security Stack / 18 modules for one tool") while Anim 3's frames show `BigNumberHorizontalBars`. Likely the JSON authoring split a single 25-second composite scene into two ranges. Consensus should decide whether to treat as one composite scene or two distinct templates.
3. **`NamedCardEquation` operator semantics:** Both instances use `+` and `=`. Is the `=` always the final operator, or have we sampled too few instances? Voter #2 should look for any `→` or `:` variants.
4. **Shorts CTA pill exact dimensions / timing:** The pill crossfades between labels — at what rhythm? (Visual estimate from frame 013 of `FtCdYhspm7w/anim-7`: ~5–10s per label, with a ~0.3s crossfade.) Need a video clip review to nail the timing curve before shipping `cycleLabels`.

---

## 9. Sources

- Scrape tool: gallery-dl (channel-level metadata via `--flat-playlist`, no auth)
- Picks file: `references/creators/natebjones/picks-vote1.json`
- Animation ranges file: `references/creators/natebjones/animation-ranges-vote1.json`
- Channel metadata: `references/creators/natebjones/info.json`
- Dense frames: `references/creators/natebjones/<videoId>/frames/` (308 frames across 5 video IDs)
- Reference clips: `docs/research/wave-6/references/natebjones/<videoId>-vote1-anim-NN.mp4` (14 clips, 20–100 s)
- Runbook: `docs/prompts/animation-replication-runbook.md`
- Structure model: `references/creators/diysmartcode/ANALYSIS.md`
- Comparison creators: `references/creators/{carloscuamatzin,diysmartcode,bilawal.ai,simonhoiberg,alexhormozi}/ANALYSIS.md`
- Existing primitives: `src/animation/` (countUp, staggeredCascade, blurInFocus, rollingDigit, dwellBeat, pathDraw, heldStagger, smartZoom)
- Existing molecules: `src/components/` (BrandBreadcrumb, BrandWatermark, TextEmphasis, InfoCards, NumberPrimitives, HUDChrome/, MacWindow/, etc.)
- Channel URL: https://www.youtube.com/@NateBJones
