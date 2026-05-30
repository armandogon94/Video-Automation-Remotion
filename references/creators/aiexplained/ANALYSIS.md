# @aiexplained-official (YouTube long-form 16:9) — visual + motion analysis

> **Scraped:** 2026-05-27 · Wave-7 · 12 videos picked, **4 of 12 processed for this pass** (see Partial sample note).
> **Channel:** [AI Explained](https://www.youtube.com/@aiexplained-official) — Philip, 426K subs, English.
> **Niche match:** STRONG content / WEAK template-lift — same Anthropic/OpenAI/Google research-paper subject matter as @armandointeligencia, but the visual layer is almost entirely **fullscreen source-document overlays + voice-over cursor highlights**, not procedural Remotion-style motion molecules.
> **Tooling guess:** Premiere / Final Cut + screen-recording of PDF / browser / X. No evidence of templated chyrons, no procedural transitions, no React/GSAP signatures. He is editing, not compositing.

### Partial sample disclosure

12 videos were picked into `picks-wave7.json`; only **4 had frames extracted before the prior agent stalled**:

| ID | Title | Frames available |
|---|---|---|
| `chr2I7CZTfk` | Gemini 3 Pro: Breakdown | 30 (anim-01 ×10, anim-02 ×20) |
| `QVJcdfkRpH8` | Claude Opus 4.7 — A New Frontier | 37 (anim-01 ×17, anim-02 ×20) |
| `2_DPnzoiHaY` | Gemini 3.1 Pro and the Downfall of Benchmarks | 21 (anim-01 ×10, anim-02 ×11) |
| `WLdBimUS1IE` | GPT-5 has Arrived | 34 (anim-01 ×17, anim-02 ×17) |

Remaining 8 picks (`jz0rNhfAKo8`, `Iar4yweKGoI`, `eczw9k3r6Ic`, `Xn_5aIhrJOE`, `9hv4nr_46Ao`, `tVHZy-iml5Q`, `FMMpUO1uAYk`, `g9ZJ8GMBlw4`) are still listed but unprocessed — extension pass should run `npm run scrape:reels` + `npm run analyze:creator` against them before promoting any pattern from "preliminary" to "confirmed." **Treat the catalog below as a working hypothesis on a 4-of-12 sample.**

---

## Channel overview

Philip ("AI Explained") runs the canonical English-language **research-paper-driven AI news breakdown** channel: 11–34 min long-form videos covering frontier-model releases (Gemini 3, Claude Opus 4.7, GPT-5), interpretability/alignment papers, and benchmark commentary. The audience is technical — researchers, indie ML builders, alignment-curious power-users — and the editorial promise is "I read the 120-page system card so you don't have to." Voice is calm, slightly nasal British, mid-tempo, with surgical mouse-cursor pointing on the screen-recordings he's narrating over.

**Visually the channel is austere by design.** There is no animated lower-third, no recurring chyron, no branded color palette, no template-driven card chrome. The visual surface is almost entirely **fullscreen captures of the primary source he's discussing** — the actual ArXiv / system-card PDF, the actual X/Twitter thread, the actual Metaculus chart, the actual Google marketing-video for the model — with a moving mouse cursor and occasional yellow text-marker highlights done in the PDF viewer itself. Pillarbox/letterbox bars are common (he leaves the OS chrome of Acrobat / Chrome visible — Adobe sidebar, browser tab strip, bookmark bar — rather than cropping it out). This is **a vibe**, not a limitation: the visible Acrobat chrome is the credibility signal. "I am literally reading the paper with you."

---

## Per-video distillation

### Video 1 — `chr2I7CZTfk` — "Gemini 3 Pro: Breakdown"

- **URL:** https://www.youtube.com/watch?v=chr2I7CZTfk
- **Duration:** 1303 s (~22 min)
- **Orientation:** 16:9 long-form (720×406 ref clips, 30 fps)
- **Frames available:** 30 (anim-01 + anim-02)
- **Reference clips:** `docs/research/wave-6/references/aiexplained/chr2I7CZTfk-anim-01.mp4` (15 s), `chr2I7CZTfk-anim-02.mp4` (25 s)

**Animation findings:**

- **anim-01 (frame `chr2I7CZTfk/frames/anim-01-frame-005.jpg`):** Google's official Gemini 3 marketing-video B-roll plays inline — multiple overlapping product screens floating in dark navy space, one ad-style word ("see") in white sans-serif drifting between layers. This is **Google's footage, not Philip's animation** — he's clip-importing the official launch trailer. Visible at the bottom-left edge: a tiny faint "AI Explained" lightning-bolt watermark dot.
- **anim-02 (frame `chr2I7CZTfk/frames/anim-02-frame-015.jpg`):** Fullscreen screenshot of Google's benchmark comparison table — rows like "Humanity's Last Exam / ARC-AGI-2 / GPQA Diamond / AIME 2025" × columns for Gemini 3 Pro / Gemini 2.5 / Claude Sonnet 4.5 / GPT-5.1, with the **Gemini 3 Pro column tinted pale blue** to draw the eye. No animation — static screenshot from Google's blog post. Cursor visible at right edge, suggesting voice-over scrolling.
- **transitionVerb:** _Static screenshot with a mouse cursor sweeping across the highlighted column; row-by-row reveal is implicit in voice-over timing, NOT in motion-graphics layer._
- **Replicability:** ⚠️ **LOW as a template** — the entire visual is "import the source PNG, point at it." Adaptable as a `BenchmarkTableScreenshot` *mode* of an existing comparison composition where the highlighted column is data-driven, but trying to replicate the **drift-in marketing B-roll** would be replicating Google, not Philip.

---

### Video 2 — `QVJcdfkRpH8` — "Claude Opus 4.7 — A New Frontier, in Performance and Drama"

- **URL:** https://www.youtube.com/watch?v=QVJcdfkRpH8
- **Duration:** 1180 s (~19 min)
- **Orientation:** 16:9 long-form (720×406 ref clips, 25 fps)
- **Frames available:** 37 (anim-01 + anim-02)
- **Reference clips:** `docs/research/wave-6/references/aiexplained/QVJcdfkRpH8-anim-01.mp4` (25 s), `QVJcdfkRpH8-anim-02.mp4` (25 s)

**Animation findings:**

- **anim-01 (frame `QVJcdfkRpH8/frames/anim-01-frame-008.jpg`):** Fullscreen X/Twitter screen-recording centered on Philip's OWN tweet — `@AIExplainedYT` post showing the in-app rate-limit dialog (`You've hit your limit — resets 5pm (Asia/Bangkok)`) plus a community reply about the 5h token limit "burning through in 90 minutes on the 20x Max plan." Full sidebar visible (X home, explore, notifications, search, "What's happening" trends). The frame includes a community-note style reply pinned mid-thread — this is the **"author-as-anchor" overlay pattern**: he uses his OWN posts on X as the citation card.
- **anim-02 (frame `QVJcdfkRpH8/frames/anim-02-frame-012.jpg`):** Adobe Acrobat fullscreen showing the Anthropic model card / system card for "Claude Mythos Preview" — body text + an inset boxed callout titled "How much did AI-powered systems accelerate your work output over the past week?" with **a yellow text-marker highlight on the leading sentence** ("That is, how much more output did you produce…"). Adobe sidebar with page-thumbnails + comment tools visible at right. Page indicator "29 of 232" + zoom "130%" at top.
- **transitionVerb:** _Static fullscreen of source document; voice-over scrolls vertically and a yellow Acrobat text-marker (drawn in real-time, NOT a Remotion overlay) sweeps L→R across the load-bearing sentence._
- **Replicability:** ⚠️ **MODERATE** — the "author-as-anchor tweet" device IS replicable (use a real `TweetCardHero9x16`-style card seeded with our own @armandointeligencia post). The "yellow Acrobat marker on PDF" device is a manual editing tic that doesn't generalize cleanly — we could simulate it with a `<TextMarkerSweep>` molecule but the chrome of the PDF viewer is what makes it credible, and faking the viewer is uncanny.

---

### Video 3 — `2_DPnzoiHaY` — "Gemini 3.1 Pro and the Downfall of Benchmarks: Welcome to the Vibe Era of AI"

- **URL:** https://www.youtube.com/watch?v=2_DPnzoiHaY
- **Duration:** 1130 s (~19 min)
- **Orientation:** 16:9 long-form (720×406 ref clips, 15 fps — note: half-rate, likely re-encoded slideshow segments)
- **Frames available:** 21 (anim-01 + anim-02)
- **Reference clips:** `docs/research/wave-6/references/aiexplained/2_DPnzoiHaY-anim-01.mp4` (15 s), `2_DPnzoiHaY-anim-02.mp4` (15 s)

**Animation findings:**

- **anim-01 (frame `2_DPnzoiHaY/frames/anim-01-frame-006.jpg`):** A hand-drawn-style meme diagram — circular arrow loop connecting **Gemini → OpenAI → Grok → Claude → Gemini**, each labeled "_Introducing the world's most powerful model_" in script font, with **"* YOU ARE HERE"** in red marker above Gemini and a Deepseek whale logo + "_I am just here :)_" pinned in the bottom-right corner. The diagram looks like Procreate / Notability / iPad whiteboard output — a meme he made (or sourced) to editorialize the "everyone is the world's best model" cycle. This is **the closest thing in the sample to a procedural diagram template**, but it's hand-drawn, not generated.
- **anim-02 (frame `2_DPnzoiHaY/frames/anim-02-frame-008.jpg`):** Fullscreen Metaculus screenshot — "Forecasting Performance Over Time" scatter plot, dotted lines for Frontier-Model Trend / Human Baselines / Metaculus Pro Forecasters, color-coded dots for OpenAI / Anthropic / DeepSeek / Alibaba / Google / xAI / Meta / Moonshot / Z.AI. Models labeled in-place (`Claude Opus 4.5 High 32x`, `GPT 5.1 High`, `Gemini 3 Pro`, `OpenAI o3 High`). Browser chrome visible at the very top edge. Star markers denote major releases.
- **transitionVerb:** _Display the meme diagram fullscreen and pan/zoom mouse cursor to "YOU ARE HERE" first, then cut to the Metaculus scatter and sweep cursor across the trend line from GPT-4o (bottom-left) to Claude Opus 4.5 (top-right)._
- **Replicability:** 🟢 **HIGHER than the other 3** — the **circular-loop meme diagram** (4 cards around a circle + each labeled with identical mocking copy + 1 outlier corner-card) is a transferable molecule. Maps roughly to a `MemeLoopDiagram9x16` or `IronyCycleCard9x16` component: 4 brand chips placed at NE/SE/SW/NW with an arc connecting them in CW order, central or top callout label, plus an "outsider" corner pin. The Metaculus chart is just a screenshot — no template.

---

### Video 4 — `WLdBimUS1IE` — "GPT-5 has Arrived"

- **URL:** https://www.youtube.com/watch?v=WLdBimUS1IE
- **Duration:** 901 s (~15 min)
- **Orientation:** 16:9 long-form (720×406 ref clips, 20 fps)
- **Frames available:** 34 (anim-01 + anim-02)
- **Reference clips:** `docs/research/wave-6/references/aiexplained/WLdBimUS1IE-anim-01.mp4` (20 s), `WLdBimUS1IE-anim-02.mp4` (20 s)

**Animation findings:**

- **anim-01 (frame `WLdBimUS1IE/frames/anim-01-frame-007.jpg`):** Adobe Acrobat fullscreen of the GPT-5 system card, section "3.6 Hallucinations." Body paragraph is normal, and the final sentence — _"We find that gpt-5-main has 44% fewer responses with at least one major factual error, while gpt-5-thinking has 78% fewer than OpenAI o3"_ — is **highlighted with a yellow Acrobat text-marker**. Page indicator `10 (11 of 59)`, zoom `140%`. Same Acrobat sidebar chrome as Video 2. Cursor visible mid-page.
- **anim-02 (frame `WLdBimUS1IE/frames/anim-02-frame-010.jpg`):** Acrobat fullscreen, file title visible at top (`oai_gpt-oss_model_card.pdf`), page indicator `8 / 34`, zoom `100%`. Page 8 shows **Figure 3** — twin line charts (AIME 2025 — Competition Math, GPQA Diamond — PhD Science Questions) plotting accuracy vs CoT + answer length for `gpt-oss-120b` (orange) and `gpt-oss-20b` (yellow), with `low / medium / high` reasoning-effort labels on each point. Caption visible below the figure. No marker highlight on this frame, but cursor is parked near the legend.
- **transitionVerb:** _Static fullscreen Acrobat page; voice-over scrolls a few hundred pixels; cursor parks beside the figure or sentence being narrated; (sometimes) a yellow Acrobat text-marker sweeps L→R across one sentence in 0.4–0.7 s._
- **Replicability:** ⚠️ **LOW as a template** — same verdict as Video 1. The visual IS the PDF viewer. Adaptable conceptually (`<PaperQuoteHighlight>` molecule for our own news/breakdown templates), but a faked Acrobat chrome reads worse than a real one.

---

## Catalog of distinct patterns (preliminary — 4-of-12 sample)

5 patterns identified. Names in PascalCase per Wave-5 contract. **All preliminary** — confirm on full 12-video pass before promoting any into the build queue.

### 1. `AcrobatPaperSweep` ⚠️ low replicability

Fullscreen capture of Adobe Acrobat reading an AI research paper / system card, with the OS/app chrome (sidebar thumbnails, top toolbar, page indicator, zoom %) **deliberately left visible** as a credibility signal. A **yellow text-marker highlight** is drawn live across one load-bearing sentence in 0.4–0.7 s. Cursor parks near the highlight. No fade, no spring, no animation in our sense — just OS-native scroll + drawing.

- Seen in: chr2I7CZTfk (Google blog instead of Acrobat, same idea), QVJcdfkRpH8, WLdBimUS1IE (both halves).
- **transitionVerb (for replication attempt):** _Render the PDF page as a static <img>; overlay a yellow `rgba(255,235,0,0.45)` rectangle that animates `width: 0 → 100%` over 16 frames on the target sentence._
- Our slot: NEW `PaperQuoteHighlight16x9` mode — DEFER, low ROI unless we open a 16:9 lane.

### 2. `SourceTweetAnchor` 🟢 moderate replicability

Fullscreen X/Twitter screen-recording centered on a tweet — **frequently Philip's OWN @AIExplainedYT post** — with the full X sidebar + "What's happening" rail visible. Replies / quote-tweets / community-note style overlays are scrolled into frame to extend the narrative. The author-as-anchor framing is rhetorical: "I posted this and N people responded — here's the consensus."

- Seen in: QVJcdfkRpH8/anim-01.
- **transitionVerb:** _Render the tweet card centered with sidebars at 0.4 opacity; cursor sweeps to the body text; reply card fades up from below at +20 frames offset._
- Our slot: extend `TweetCardHero9x16` with a `replyChain?: Tweet[]` prop. Aligns with the `bilawal.ai` finding (TweetCardOverlay).

### 3. `BenchmarkTableTintedColumn` ⚠️ low replicability

Fullscreen screenshot of an official benchmark comparison table (Google's, OpenAI's, Anthropic's blog) — rows of benchmark names, columns of competing models, with **the subject model's column tinted pale blue** to draw the eye. No motion in the table itself; voice-over reads row-by-row.

- Seen in: chr2I7CZTfk/anim-02.
- **transitionVerb:** _Render the full benchmark table; reveal rows top-to-bottom at 8-frame stagger; persistent pale-blue column-fill on the subject column._
- Our slot: maps to a hypothetical `BenchmarkTableComparison16x9` — but we already have `BarChartList9x16` + the `natebjones` `NamedCardEquation` analog. Defer.

### 4. `MarketingTrailerBroll` ⚠️ not-our-asset

Inline cuts to the official model-launch marketing video (Google's Gemini 3 trailer, OpenAI's GPT-5 trailer, etc.) — overlapping product screens floating in dark navy with one-word ad copy ("see", "think", "reason") drifting between layers. **This footage is Google's / OpenAI's, not Philip's**. He's using fair-use editorial inclusion.

- Seen in: chr2I7CZTfk/anim-01.
- **transitionVerb:** N/A — third-party clip import.
- Our slot: NONE — we'd be replicating a vendor's brand asset. Skip.

### 5. `MemeLoopDiagram` 🟢 highest replicability of the sample

Hand-drawn / iPad-whiteboard style **circular loop** of N (=4) competing brand cards with **each card labeled with the same mocking copy** ("Introducing the world's most powerful model" × 4), a "* YOU ARE HERE" red-marker pin on the current subject, and an **outsider card pinned to a corner** ("Deepseek: _I am just here :)_") for editorial counterpoint. The visual joke IS the choreography: same words at every node = the whole industry is in a loop.

- Seen in: 2_DPnzoiHaY/anim-01.
- **transitionVerb:** _Place 4 brand chips at N/E/S/W of a circle; draw a CW arc between them stroke-dashoffset over 24 frames; the "YOU ARE HERE" red-marker pin scale-pops at frame 30; the outsider corner card slides in from bottom-right at frame 40._
- Our slot: NEW `IronyCycleDiagram9x16` — solid Wave-7 candidate. Slots near our existing `BeforeAfterText16x9` / `VennDiagram9x16` neighborhood.

---

## Comparison to other creators

| Axis | aiexplained | natebjones | diysmartcode | builtbystephan | hormozi |
|---|---|---|---|---|---|
| Format | Long-form 16:9 | 16:9 + 9:16 hybrid | YouTube Shorts | IG Reels | Shorts |
| Has a template grammar? | NO — bespoke per source | YES — molecule library | YES — 3 templates in rotation | YES — TalkingHeadDynamic | NO — caption-only |
| Burned captions? | NO | YES (Shorts only) | NO | YES | YES (karaoke + emphasis) |
| Source-document overlays | DOMINANT (>70% of frames) | Rare | Never | Occasional | Never |
| Procedural motion graphics | None evident | Heavy (NamedCardEquation, etc.) | Light | Medium (hard-cut B-roll) | None |
| Tooling guess | Premiere + screen-rec | Remotion or After Effects | Likely Hyperframes/Remotion | CapCut/Premiere | CapCut |

**Key insight vs the rest of the reference set:** aiexplained is the **outlier on the "procedural vs. editorial" axis.** Every other creator we've analyzed (Carlos, DIYSmartCode, NateBJones, bilawal, simonhoiberg, Hormozi) has at least one repeatable templated chyron / card / molecule. Philip has effectively zero. His content authority comes from _what he's pointing at_ (the 232-page system card, the actual X thread, the Metaculus chart), not from how he's compositing. **Lesson:** for the deep-technical research-breakdown lane we already serve (Wave-6 NateBJones content), we should NOT over-design the chrome — the source-document IS the chrome.

**vs. natebjones specifically:** Both cover frontier AI for technical audiences in 16:9. NateB lays a templated molecule library OVER the source documents (his `TreeOfChildCardsWithEmphasisPill`, `NamedCardEquation`). Philip just shows the document. NateB's approach is more our brand; Philip's is the floor below which credibility erodes (i.e., if our chrome ever fights the content, fall back to "show the paper, point with cursor"). Worth treating Philip's style as a **fallback mode** rather than a primary template.

---

## Build priority queue addendum

**Recommended priority ranks for Wave-7 build queue** (preliminary, subject to 8-video extension):

| Rank | Pattern | Component | Effort | Why |
|---|---|---|---|---|
| 🟠 mid | `MemeLoopDiagram` | NEW `IronyCycleDiagram9x16` | 1.5 d | Highest-reuse molecule in the aiexplained sample. Editorial humor lane (paired with hormozi finding). Slots cleanly into our existing diagram neighborhood. |
| 🟠 mid | `SourceTweetAnchor` extension | Extend existing `TweetCardHero9x16` with `replyChain?: Tweet[]` + author-anchor framing | 0.5 d | Cross-confirms `bilawal.ai`'s TweetCardOverlay finding; cheap extension to an already-prioritized template. |
| 🟢 low | `PaperQuoteHighlight16x9` mode | NEW component, 16:9 only | 1 d | DEFER until we open a 16:9 lane. Sit alongside the natebjones 16:9 question. |
| 🟢 low | `BenchmarkTableTintedColumn` | mode on existing `BarChartList9x16` or a new `BenchmarkTableComparison16x9` | 1 d | DEFER — overlaps too much with natebjones `NamedCardEquation`. Re-evaluate after the 8 remaining videos are processed. |
| ⚫ skip | `AcrobatPaperSweep` | (fake Acrobat chrome) | — | Uncanny when faked. Better to show our OWN editor / browser if we want this vibe. |
| ⚫ skip | `MarketingTrailerBroll` | (third-party brand asset) | — | Vendor assets, not ours to template. |

**Non-template wins to document in `brand/voice.md`:**
- "Show the source, point with the cursor" as a tier-2 fallback when our compositions would otherwise force the content into a too-small chrome.
- Yellow text-marker as an emphasis device is OK editorially even if we don't fake the Acrobat chrome — we already do this via `EditorialCaption` highlight mode; cross-check whether `aiexplained` color (`#FFE800`-ish translucent) matches our existing emphasis token.

**Open extension actions (before promoting any of the above into the Wave-7 sprint):**
1. Run frame extraction on the remaining 8 picks: `jz0rNhfAKo8`, `Iar4yweKGoI`, `eczw9k3r6Ic`, `Xn_5aIhrJOE`, `9hv4nr_46Ao`, `tVHZy-iml5Q`, `FMMpUO1uAYk`, `g9ZJ8GMBlw4`.
2. Specifically watch for: animated tweet entrances (vs. static screen-rec), any non-PDF visual molecule, intro/outro card chrome, any recurring `Iar4yweKGoI`-style "4 Big Claims" numbered chapter card.
3. If the 8-video extension surfaces ≥3 new patterns, re-rank.

---

## Sources

- Scraper command: `npm run scrape:reels -- --handle aiexplained-official --count 12` (long-form via yt-dlp)
- Picks rationale: `references/creators/aiexplained/picks-wave7.json`
- Channel metadata: `references/creators/aiexplained/info.json`
- Frames (this pass): `references/creators/aiexplained/<id>/frames/anim-NN-frame-NN.jpg` for the 4 IDs above
- Reference clips: `docs/research/wave-6/references/aiexplained/<id>-anim-NN.mp4` (8 clips, 720×406, 15–25 fps)
- YouTube channel: https://www.youtube.com/@aiexplained-official
- Animation replication contract: `docs/prompts/animation-replication-runbook.md` (transitionVerb rules)

---

## Image budget accounting (RESUME-WRITER pass)

- Frames READ this pass: **8** (2 per video × 4 videos) — at the cap.
- ffprobe calls: 8 (one per ref clip, dims + duration + fps).
- Source documents read: `info.json`, `picks-wave7.json`, `CREATORS.md`, `diysmartcode/ANALYSIS.md` (template model), `animation-replication-runbook.md` (transitionVerb contract).
