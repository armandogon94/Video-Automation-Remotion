# @aiexplained-official (YouTube long-form 16:9) — visual + motion analysis

> **Scraped:** 2026-05-27 · Wave-7 · 12 videos picked, **12 of 12 processed (COMPLETE)** — backfilled 2026-05-29 (8 remaining picks added on top of the original 4).
> **Channel:** [AI Explained](https://www.youtube.com/@aiexplained-official) — Philip, 426K subs, English.
> **Niche match:** STRONG content / WEAK template-lift — same Anthropic/OpenAI/Google research-paper subject matter as @armandointeligencia, but the visual layer is almost entirely **fullscreen source-document overlays + voice-over cursor highlights**, not procedural Remotion-style motion molecules. The full-12 pass confirms this: the only Philip-authored chrome that recurs is the **big numbered list/chapter counter** (a single overlaid digit) and **fullscreen numbered chapter-divider cards** — everything else is the source material itself.
> **Tooling guess:** Premiere / Final Cut + screen-recording of PDF / browser / X / Substack. No evidence of templated chyrons, no procedural transitions, no React/GSAP signatures. He is editing, not compositing.

### Sample disclosure — COMPLETE (12 of 12)

All 12 picks from `picks-wave7.json` are now processed. The original 4 (Wave-7 first pass, 2026-05-28) plus the 8 backfilled on 2026-05-29:

| ID | Title | Frames | Processed |
|---|---|---|---|
| `chr2I7CZTfk` | Gemini 3 Pro: Breakdown | 30 | 2026-05-28 |
| `QVJcdfkRpH8` | Claude Opus 4.7 — A New Frontier | 37 | 2026-05-28 |
| `2_DPnzoiHaY` | Gemini 3.1 Pro and the Downfall of Benchmarks | 21 | 2026-05-28 |
| `WLdBimUS1IE` | GPT-5 has Arrived | 34 | 2026-05-28 |
| `jz0rNhfAKo8` | GPT 5.5 Arrives, DeepSeek V4 Drops… | 4 | 2026-05-29 |
| `Iar4yweKGoI` | Claude AI Co-founder Publishes 4 Big Claims | 4 | 2026-05-29 |
| `eczw9k3r6Ic` | When Will AI Models Blackmail You, and Why? | 4 | 2026-05-29 |
| `Xn_5aIhrJOE` | Claude 4: Full 120 Page Breakdown | 4 | 2026-05-29 |
| `9hv4nr_46Ao` | Nano Banana Pro: Did You Catch These 10 Details? | 4 | 2026-05-29 |
| `tVHZy-iml5Q` | Genie 3: The World Becomes Playable | 4 | 2026-05-29 |
| `FMMpUO1uAYk` | What the Freakiness of 2025 Tells Us About 2026 | 4 | 2026-05-29 |
| `g9ZJ8GMBlw4` | How Not to Read a Headline on AI | 4 | 2026-05-29 |

> **Backfill method note (2026-05-29):** the 8 new videos were downloaded at ≤480p one-at-a-time, surveyed via a single coarse contact-sheet montage (1 frame / 15 s) per video to locate animation ranges, then 2 representative dense frames were Read per video (within the image-budget cap). Source MP4s were deleted immediately after frame + clip extraction. **The catalog below is now a confirmed full-12 reading**, not a working hypothesis.

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

### Video 5 — `jz0rNhfAKo8` — "GPT 5.5 Arrives, DeepSeek V4 Drops, and the Compute War Intensifies"

- **URL:** https://www.youtube.com/watch?v=jz0rNhfAKo8
- **Duration:** 1519 s (~25 min) · 480p backfill, 30 fps
- **Frames available:** 4 (anim-01 ×2 = source-tweet, anim-02 ×2 = paper-sweep)
- **Reference clips:** `docs/research/wave-6/references/aiexplained/jz0rNhfAKo8-anim-01.mp4` (10 s), `jz0rNhfAKo8-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`jz0rNhfAKo8/frames/anim-01-frame-006.jpg`):** Fullscreen X/Twitter screen-rec of a **Noam Brown (@polynoamial) tweet** ("intelligence is a function of inference compute…") with a nested quote-tweet from Lisan al Gaib embedding an **Artificial Analysis intelligence-vs-cost scatter chart**. Full X left-nav + "Relevant people" / "What's happening" right rail visible; Philip's own `@AIExplainedYT` pinned bottom-left. The embedded chart is a static screenshot inside the tweet, not animated. → `SourceTweetAnchor`.
- **anim-02 (`jz0rNhfAKo8/frames/anim-02-frame-006.jpg`):** Fullscreen of the GPT-5.5 system card, section **9.1.2.7 "External Evaluations for Cyber Capabilities — UK AISI"**, page 33, with **three separate yellow text-marker highlights** on load-bearing sentences ("UK AISI judges that GPT-5.5 is the strongest performing model…", "The highest recorded success on this range is success on 3/10 attempts", "may indicate autonomous end-to-end cyberattack capability"). → `AcrobatPaperSweep`, multi-highlight variant.
- **transitionVerb:** _Static fullscreen source (tweet / PDF page); cursor parks; yellow marker pre-drawn on multiple sentences; cut between sources on voice-over beats._
- **Replicability:** ⚠️ LOW as template — confirms the two dominant source-overlay patterns; nothing Philip-authored beyond the highlights.

### Video 6 — `Iar4yweKGoI` — "Claude AI Co-founder Publishes 4 Big Claims about Near Future"

- **URL:** https://www.youtube.com/watch?v=Iar4yweKGoI
- **Duration:** 1333 s (~22 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = essay read-along, anim-02 ×2 = numbered chapter divider)
- **Reference clips:** `Iar4yweKGoI-anim-01.mp4` (10 s), `Iar4yweKGoI-anim-02.mp4` (8 s)

**Animation findings:**

- **anim-01 (`Iar4yweKGoI/frames/anim-01-frame-005.jpg`):** Fullscreen webpage render of the essay ("Machines of Loving Grace"-style co-founder essay), with a **persistent left-rail numbered Table-of-Contents sidebar** ("1. I'm sorry, Dave / 2. A surprising and terrible empowerment / 3. The odious apparatus / 4. Player piano / 5. Black seas of infinity / Humanity's test"), the **active section bolded**, and **multiple yellow text-marker highlight sweeps** on body sentences. → NEW `EssayReadAlongTOC` (a structured webpage variant of AcrobatPaperSweep — the numbered TOC rail is the new structural element).
- **anim-02 (`Iar4yweKGoI/frames/anim-02-frame-004.jpg`):** A **fullscreen numbered chapter-divider card** — large white section title on black ("#2 Permanent Underclass", "#3 Totalitarian Nightmare" elsewhere) with a colored number badge. This is the **"4 Big Claims" molecule** the brief asked us to watch for: Philip-authored chapter dividers between essay sections. → NEW `NumberedChapterDivider`.
- **transitionVerb:** _Essay scrolls with active-TOC-item highlighting; cut to a full-black divider card where the big number + section title fade/slam in; cut back to the essay at the next section._
- **Replicability:** 🟢 **HIGH for the two new patterns.** `NumberedChapterDivider` maps to a `ChapterDividerCard9x16` (big numeral + title, brand-navy bg). `EssayReadAlongTOC`'s **persistent numbered TOC rail with active-item highlight** is a transferable `<TocProgressRail>` chrome molecule.

### Video 7 — `eczw9k3r6Ic` — "When Will AI Models Blackmail You, and Why?"

- **URL:** https://www.youtube.com/watch?v=eczw9k3r6Ic
- **Duration:** 1580 s (~26 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = source-tweet+chart, anim-02 ×2 = paper figure)
- **Reference clips:** `eczw9k3r6Ic-anim-01.mp4` (10 s), `eczw9k3r6Ic-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`eczw9k3r6Ic/frames/anim-01-frame-004.jpg`):** Fullscreen X screen-rec of an **Anthropic (@AnthropicAI) tweet** ("New Anthropic Research: Agentic Misalignment") with an **embedded purple horizontal bar chart "Simulated Blackmail Rates Across Models"** + a reply containing a JSON transcript code-block. Full X chrome. → `SourceTweetAnchor` (the embedded bar chart is part of the tweet image, not a Philip overlay).
- **anim-02 (`eczw9k3r6Ic/frames/anim-02-frame-007.jpg`):** A **paper figure (Figure 4)** showing the "SummitBridge" email-client mockup with a **left dark overlay panel summarizing the AI's deliberation** ("The AI decides to blackmail the CTO" + structured bullet list of reasoning steps). Static paper screenshot. → `AcrobatPaperSweep` (figure variant).
- **transitionVerb:** _Static source; cursor sweep; cut between tweet and paper figure on voice-over._
- **Replicability:** ⚠️ LOW — both confirm existing dominant patterns.

### Video 8 — `Xn_5aIhrJOE` — "Claude 4: Full 120 Page Breakdown"

- **URL:** https://www.youtube.com/watch?v=Xn_5aIhrJOE
- **Duration:** 1145 s (~19 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = source-tweet w/ nested meme card, anim-02 ×2 = benchmark table)
- **Reference clips:** `Xn_5aIhrJOE-anim-01.mp4` (10 s), `Xn_5aIhrJOE-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`Xn_5aIhrJOE/frames/anim-01-frame-006.jpg`):** Fullscreen X screen-rec of an Emad (@EMostaque) tweet quoting a **Sam Bowman post that embeds the "YOU CAN JUST DO THINGS" serif meme-card image**. The eye-catching typographic card is part of a third-party tweet image — NOT a Philip-authored quote card. → `SourceTweetAnchor` (nested quote-tweet).
- **anim-02 (`Xn_5aIhrJOE/frames/anim-02-frame-005.jpg`):** Anthropic's official Claude 4 **benchmark comparison table** (rows: Agentic coding, Graduate-level reasoning, Agentic tool use, AIME 2025…; columns: Claude Opus 4 / Sonnet 4 / Sonnet 3.7 / OpenAI o3 / GPT-4.1 / Gemini 2.5 Pro) with the **subject Claude columns boxed in an orange outline**. → `BenchmarkTableTintedColumn` (orange-box variant — 2nd confirmed instance after chr2I7CZTfk's blue-fill).
- **transitionVerb:** _Static benchmark table; cursor sweeps the boxed subject columns row-by-row in voice-over timing._
- **Replicability:** ⚠️ LOW–MID — `BenchmarkTableTintedColumn` now confirmed twice (promoted below).

### Video 9 — `9hv4nr_46Ao` — "Nano Banana Pro: But Did You Catch These 10 Details?"

- **URL:** https://www.youtube.com/watch?v=9hv4nr_46Ao
- **Duration:** 896 s (~15 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = generated-image grid, anim-02 ×2 = browser-doc read-along)
- **Reference clips:** `9hv4nr_46Ao-anim-01.mp4` (10 s), `9hv4nr_46Ao-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`9hv4nr_46Ao/frames/anim-01-frame-004.jpg`):** A **6-panel grid of AI-generated images** (the same character across life scenarios — boardroom, neon-studio, hospital bed, etc.), shown full-bleed as the hero content. The montage showed **big numbered detail counters (1, 2, 3 … 7)** overlaid as listicle markers ("10 Details" format). → NEW `GeneratedImageGrid` (multi-panel image showcase) + the `NumberedDetailCounter` overlay.
- **anim-02 (`9hv4nr_46Ao/frames/anim-02-frame-008.jpg`):** Fullscreen browser screen-rec of the **OpenAI Platform pricing docs** (image-generation pricing table) with a **cursor highlight on a cell**. → live-webpage read-along (a browser-doc cousin of `AcrobatPaperSweep`).
- **transitionVerb:** _Big circled number pops onto a full-bleed generated-image grid; cut to the live pricing doc with cursor highlight._
- **Replicability:** 🟢 `NumberedDetailCounter` is a transferable overlay; `GeneratedImageGrid` is just an image grid.

### Video 10 — `tVHZy-iml5Q` — "Genie 3: The World Becomes Playable (DeepMind)"

- **URL:** https://www.youtube.com/watch?v=tVHZy-iml5Q
- **Duration:** 715 s (~12 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = world-model demo footage, anim-02 ×2 = author Substack)
- **Reference clips:** `tVHZy-iml5Q-anim-01.mp4` (10 s), `tVHZy-iml5Q-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`tVHZy-iml5Q/frames/anim-01-frame-005.jpg`):** Full-bleed **Genie 3 playable-world demo footage** (mountain-biking POV down a canyon road) with **Google's own interaction-control glyphs (arrow "→" + icon) bottom-left**. This is DeepMind's demo footage, not Philip's animation. → `MarketingTrailerBroll` (third-party demo, not-our-asset).
- **anim-02 (`tVHZy-iml5Q/frames/anim-02-frame-006.jpg`):** Fullscreen screen-rec of **Philip's OWN "AI Explained" Substack/newsletter** ("Deep-ish Thoughts on New Gemini DeepThink", with the Substack creator sidebar + "AI Explained Creator" at bottom-left). → `SourceTweetAnchor`, **author-as-anchor extended to his own newsletter** (not just X).
- **transitionVerb:** _Full-bleed third-party demo clip (no chrome); cut to author's own Substack post scrolling with cursor._
- **Replicability:** ⚫ demo footage = skip; 🟢 author-newsletter-anchor extends `SourceTweetAnchor` (use our own posts).

### Video 11 — `FMMpUO1uAYk` — "What the Freakiness of 2025 in AI Tells Us About 2026"

- **URL:** https://www.youtube.com/watch?v=FMMpUO1uAYk
- **Duration:** 2007 s (~33 min, longest pick) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = numbered counter + benchmark table, anim-02 ×2 = AISI report TOC essay)
- **Reference clips:** `FMMpUO1uAYk-anim-01.mp4` (10 s), `FMMpUO1uAYk-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`FMMpUO1uAYk/frames/anim-01-frame-007.jpg`):** **The single strongest composite frame in the corpus** — a **giant green circled "1" counter badge** overlaid on the left of a **benchmark comparison table** with the **Gemini 3 Pro column tinted pale blue** (rows: Humanity's Last Exam, GPQA Diamond, AIME 2025, SWE-Bench Verified, t2-bench…). Confirms BOTH `NumberedDetailCounter` AND `BenchmarkTableTintedColumn` in one shot. The video is a 33-min recap with the full counter sequence 1→10 visible across the montage.
- **anim-02 (`FMMpUO1uAYk/frames/anim-02-frame-006.jpg`):** An **AISI (AI Security Institute) report webpage** with a **persistent numbered "Executive Summary / 1. Introduction / 2. Agents / 3. Capabilities & risks…" left TOC rail** + yellow highlight sweep + a bottom title-card overlay. → 2nd confirmed `EssayReadAlongTOC`.
- **transitionVerb:** _Big circled section number sits beside the benchmark table; the pale-blue subject column persists; cut to the TOC-rail essay for the supporting citation._
- **Replicability:** 🟢 multiple — this video is the promotion lynchpin for `NumberedDetailCounter`, `BenchmarkTableTintedColumn`, and `EssayReadAlongTOC`.

### Video 12 — `g9ZJ8GMBlw4` — "How Not to Read a Headline on AI"

- **URL:** https://www.youtube.com/watch?v=g9ZJ8GMBlw4
- **Duration:** 1040 s (~17 min) · 480p backfill
- **Frames available:** 4 (anim-01 ×2 = source-tweet w/ highlight, anim-02 ×2 = live-app screen-rec)
- **Reference clips:** `g9ZJ8GMBlw4-anim-01.mp4` (10 s), `g9ZJ8GMBlw4-anim-02.mp4` (10 s)

**Animation findings:**

- **anim-01 (`g9ZJ8GMBlw4/frames/anim-01-frame-002.jpg`):** Fullscreen X screen-rec of **Alexander Wei's OpenAI IMO-gold tweet**, with a **yellow text-marker highlight drawn directly ON the tweet body** ("achieved a longstanding grand challenge in AI: gold medal-level performance"). → hybrid `SourceTweetAnchor` × `AcrobatPaperSweep` (marker-on-tweet). The montage also shows this video's **`NumberedChapterDivider` cards** with magenta number badges ("01. AI > MATHEMATICIANS?", "02. OPENAI > GOOGLE?", "03. Nothing till December?", "09. No Impact?") — 2nd confirmed instance of the divider pattern.
- **anim-02 (`g9ZJ8GMBlw4/frames/anim-02-frame-007.jpg`):** Fullscreen **ChatGPT agent-mode screen-rec** (live agent UI: user prompt, "Reading API documentation" tool-card with a Google Drive icon, and a video-player scrubber recording the agent's screen). → live-app screen-recording read-along.
- **transitionVerb:** _Marker sweep on a tweet; full-black magenta-numbered divider card slams in between headline segments; cut to a live-app screen-rec._
- **Replicability:** 🟢 `NumberedChapterDivider` now confirmed twice (Iar4yweKGoI + g9ZJ8GMBlw4) — promoted.

---

## Catalog of distinct patterns (CONFIRMED — full 12-of-12 sample)

8 patterns identified across 12 videos. Names in PascalCase per Wave-5 contract. Promotion rule: a pattern seen in **≥2 videos** is **confirmed**; single-video patterns stay preliminary.

### 1. `AcrobatPaperSweep` ✅ CONFIRMED (8/12) · ⚠️ low replicability as template

Fullscreen capture of Adobe Acrobat / a webpage reading an AI research paper / system card / blog, with the OS/app chrome (sidebar thumbnails, top toolbar, page indicator, zoom %) **deliberately left visible** as a credibility signal. **Yellow text-marker highlights** are drawn live across load-bearing sentences (often several per page in the full sample). Cursor parks near the highlight. No fade, no spring — just OS-native scroll + drawing. The single most-frequent visual mode in the channel.

- Seen in: chr2I7CZTfk (Google blog), QVJcdfkRpH8, WLdBimUS1IE, **jz0rNhfAKo8** (multi-highlight), **eczw9k3r6Ic** (paper figure), **Xn_5aIhrJOE** (120-pg system card), **9hv4nr_46Ao** (browser pricing doc), **g9ZJ8GMBlw4** (live-app screen-rec) — dominant in >65% of all frames.
- **transitionVerb (for replication attempt):** _Render the PDF page as a static <img>; overlay a yellow `rgba(255,235,0,0.45)` rectangle that animates `width: 0 → 100%` over 16 frames on the target sentence._
- Our slot: NEW `PaperQuoteHighlight16x9` mode — DEFER, low ROI unless we open a 16:9 lane.

### 2. `SourceTweetAnchor` ✅ CONFIRMED (5/12) · 🟢 moderate replicability

Fullscreen X/Twitter (or own-Substack) screen-recording centered on a post — **frequently Philip's OWN @AIExplainedYT / AI Explained newsletter** — with the full X sidebar + "What's happening" rail visible. Replies / quote-tweets / nested-quote-tweets / community-notes are scrolled into frame to extend the narrative; sometimes a yellow marker is drawn ON the tweet body. The author-as-anchor framing is rhetorical: "I posted this and N people responded — here's the consensus." The full sample shows this generalizes beyond X to **his own Substack** (tVHZy-iml5Q).

- Seen in: QVJcdfkRpH8/anim-01, **jz0rNhfAKo8** (Noam Brown + nested quote), **eczw9k3r6Ic** (Anthropic tweet + embedded chart), **Xn_5aIhrJOE** (Emad→Bowman nested quote), **tVHZy-iml5Q** (own Substack), **g9ZJ8GMBlw4** (marker-on-tweet hybrid).
- **transitionVerb:** _Render the tweet card centered with sidebars at 0.4 opacity; cursor sweeps to the body text; reply card fades up from below at +20 frames offset._
- Our slot: extend `TweetCardHero9x16` with a `replyChain?: Tweet[]` prop. Aligns with the `bilawal.ai` finding (TweetCardOverlay).

### 3. `BenchmarkTableTintedColumn` ✅ CONFIRMED (3/12) · ⚠️ low–mid replicability

Fullscreen screenshot of an official benchmark comparison table (Google's, OpenAI's, Anthropic's blog) — rows of benchmark names, columns of competing models, with **the subject model's column tinted pale blue OR boxed in an orange/red outline** to draw the eye. No motion in the table itself; voice-over reads row-by-row. The full sample shows two highlight treatments (pale-blue fill and orange box) for the same intent.

- Seen in: chr2I7CZTfk/anim-02 (blue fill), **Xn_5aIhrJOE** (orange box), **FMMpUO1uAYk** (blue fill + a `NumberedDetailCounter` badge beside it).
- **transitionVerb:** _Render the full benchmark table; reveal rows top-to-bottom at 8-frame stagger; persistent pale-blue column-fill on the subject column._
- Our slot: maps to a hypothetical `BenchmarkTableComparison16x9` — but we already have `BarChartList9x16` + the `natebjones` `NamedCardEquation` analog. Defer.

### 4. `MarketingTrailerBroll` ✅ CONFIRMED (2/12) · ⚠️ not-our-asset

Inline cuts to official model-launch marketing / demo footage (Google's Gemini 3 trailer, DeepMind's Genie 3 playable-world demos, OpenAI's GPT-5 trailer) — overlapping product screens, or full-bleed interactive-world POV clips with the vendor's own UI glyphs visible. **This footage is the vendor's, not Philip's** — fair-use editorial inclusion.

- Seen in: chr2I7CZTfk/anim-01 (Gemini 3 trailer), **tVHZy-iml5Q/anim-01** (Genie 3 playable-world demo w/ Google's control glyphs).
- **transitionVerb:** N/A — third-party clip import.
- Our slot: NONE — we'd be replicating a vendor's brand asset. Skip.

### 5. `MemeLoopDiagram` 🟢 highest replicability of the sample

Hand-drawn / iPad-whiteboard style **circular loop** of N (=4) competing brand cards with **each card labeled with the same mocking copy** ("Introducing the world's most powerful model" × 4), a "* YOU ARE HERE" red-marker pin on the current subject, and an **outsider card pinned to a corner** ("Deepseek: _I am just here :)_") for editorial counterpoint. The visual joke IS the choreography: same words at every node = the whole industry is in a loop.

- Seen in: 2_DPnzoiHaY/anim-01.
- **transitionVerb:** _Place 4 brand chips at N/E/S/W of a circle; draw a CW arc between them stroke-dashoffset over 24 frames; the "YOU ARE HERE" red-marker pin scale-pops at frame 30; the outsider corner card slides in from bottom-right at frame 40._
- Our slot: NEW `IronyCycleDiagram9x16` — solid Wave-7 candidate. Slots near our existing `BeforeAfterText16x9` / `VennDiagram9x16` neighborhood.
- Note: single-video on the full sample (only 2_DPnzoiHaY) → stays **preliminary**; no second instance surfaced in the 8 backfill videos.

### 6. `NumberedChapterDivider` ✅ CONFIRMED (2/12) · 🟢 HIGH replicability — NEW (backfill)

**Fullscreen chapter-divider card** Philip *does* author himself: a large bold section title on a near-black background with a **colored number badge** (white "#2 Permanent Underclass" / "#3 Totalitarian Nightmare"; magenta "01. AI > MATHEMATICIANS?" / "02. OPENAI > GOOGLE?" / "03. Nothing till December?" / "09. No Impact?"). Used to segment a multi-claim or multi-headline video into numbered chapters — the "4 Big Claims" molecule the brief flagged. This is the **only recurring Philip-authored chrome in the entire 12-video corpus** besides the counter badge.

- Seen in: **Iar4yweKGoI** (white "#N Title" between essay sections), **g9ZJ8GMBlw4** (magenta "0N. QUESTION?" between headline segments).
- **transitionVerb:** _Full-black card; big numeral + title slam/scale-in over ~8 frames (no easing softness — a hard editorial beat); hold ~1.5 s; hard-cut to the section content._
- Our slot: NEW `ChapterDividerCard9x16` — brand-navy bg, gold number badge, Inter bold title. Cheap, high-reuse for our news-roundup / listicle lanes.

### 7. `NumberedDetailCounter` ✅ CONFIRMED (2/12) · 🟢 HIGH replicability — NEW (backfill)

A **single large circled/badge digit** (e.g. a green circled "1") overlaid at the edge of otherwise-source content (a benchmark table, a generated-image grid) to mark position in an N-item listicle ("10 Details", a 1→10 year-end recap). Lighter-weight than a full divider card — it rides on top of live content rather than interrupting with a black card.

- Seen in: **9hv4nr_46Ao** (counters 1–7+ on generated-image grids), **FMMpUO1uAYk** (giant green "1" beside a benchmark table; full 1→10 sequence across the recap).
- **transitionVerb:** _Big circled numeral scale-pops in at the top-left of the frame, persists through the segment, cross-fades to the next number on cut._
- Our slot: extend `ChapterDividerCard9x16` with a lightweight `CounterBadge` mode (no full-screen takeover) — pairs with `BenchmarkTableTintedColumn` and `GeneratedImageGrid`.

### 8. `EssayReadAlongTOC` ✅ CONFIRMED (2/12) · 🟢 MID replicability — NEW (backfill)

A structured webpage-essay variant of `AcrobatPaperSweep`: fullscreen essay/report render with a **persistent left-rail numbered Table-of-Contents** whose **active section is bolded/highlighted** as the voice-over progresses, plus the usual yellow text-marker sweeps on body sentences. The numbered TOC rail is the new structural element — it gives the viewer a progress/where-am-I cue the bare PDF lacks.

- Seen in: **Iar4yweKGoI** (co-founder essay, 6-item TOC), **FMMpUO1uAYk** (AISI report, "Executive Summary / 1. Introduction / 2. Agents…" TOC).
- **transitionVerb:** _Render the essay body as a tall scroll; a left `<TocProgressRail>` lists numbered sections; the active item bolds (color token) as the scroll passes its anchor; yellow markers pre-drawn on key sentences._
- Our slot: NEW `<TocProgressRail>` chrome molecule — sits beside a long-text or article composition; the **active-item highlight** is the reusable bit. Lower priority than #6/#7 (depends on a long-text lane).

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

**Recommended priority ranks for Wave-7 build queue** (FINAL — based on the complete 12-of-12 sample):

| Rank | Pattern | Component | Effort | Why |
|---|---|---|---|---|
| 🟢 HIGH | `NumberedChapterDivider` ✅ confirmed 2/12 | NEW `ChapterDividerCard9x16` (gold number badge + Inter title on navy) | 0.5 d | Only recurring Philip-authored chrome in the corpus. Cheap, high-reuse for news-roundup / listicle lanes. Promoted from the backfill. |
| 🟢 HIGH | `NumberedDetailCounter` ✅ confirmed 2/12 | `CounterBadge` mode on `ChapterDividerCard9x16` (rides over live content) | 0.25 d | Lightweight overlay; pairs with benchmark tables + image grids. Promoted from the backfill. |
| 🟠 mid | `SourceTweetAnchor` extension ✅ confirmed 5/12 | Extend `TweetCardHero9x16` with `replyChain?: Tweet[]` + author-anchor framing (X **and** own-newsletter) | 0.5 d | Most-frequent Philip rhetorical device after the paper-sweep; cross-confirms `bilawal.ai`'s TweetCardOverlay. |
| 🟠 mid | `MemeLoopDiagram` (preliminary 1/12) | NEW `IronyCycleDiagram9x16` | 1.5 d | Highest single-video reuse, but no 2nd instance surfaced in the backfill — keep preliminary; build only if the editorial-humor lane is greenlit. |
| 🟢 low | `EssayReadAlongTOC` ✅ confirmed 2/12 | NEW `<TocProgressRail>` chrome | 1 d | DEFER until a long-text/article lane exists; the active-item-highlight rail is the reusable bit. |
| 🟢 low | `BenchmarkTableTintedColumn` ✅ confirmed 3/12 | mode on `BarChartList9x16` or new `BenchmarkTableComparison16x9` | 1 d | DEFER — overlaps with natebjones `NamedCardEquation`; supports both blue-fill and orange-box subject highlight. |
| 🟢 low | `PaperQuoteHighlight16x9` mode (from `AcrobatPaperSweep`) | NEW component, 16:9 only | 1 d | DEFER until we open a 16:9 lane. |
| ⚫ skip | `AcrobatPaperSweep` chrome itself ✅ confirmed 8/12 | (fake Acrobat / browser chrome) | — | Dominant mode but uncanny when faked. Show our OWN editor/browser if we want the vibe. |
| ⚫ skip | `MarketingTrailerBroll` ✅ confirmed 2/12 | (third-party brand asset) | — | Vendor assets, not ours to template. |
| ⚫ skip | `GeneratedImageGrid` (preliminary 1/12) | (just an image grid) | — | Not a motion molecule; a layout we already trivially support. |

**Non-template wins to document in `brand/voice.md`:**
- "Show the source, point with the cursor" as a tier-2 fallback when our compositions would otherwise force the content into a too-small chrome.
- Yellow text-marker as an emphasis device is OK editorially even if we don't fake the Acrobat chrome — we already do this via `EditorialCaption` highlight mode; cross-check whether `aiexplained` color (`#FFE800`-ish translucent) matches our existing emphasis token.

**Extension actions — DONE (2026-05-29 backfill):**
1. ✅ Frame extraction completed on all 8 remaining picks (`jz0rNhfAKo8`, `Iar4yweKGoI`, `eczw9k3r6Ic`, `Xn_5aIhrJOE`, `9hv4nr_46Ao`, `tVHZy-iml5Q`, `FMMpUO1uAYk`, `g9ZJ8GMBlw4`) — 4 frames + 2 ref clips each.
2. ✅ Findings: no animated tweet entrances (all static screen-recs, confirming the "editing not compositing" thesis). The `Iar4yweKGoI`-style numbered chapter card WAS found and recurs (`g9ZJ8GMBlw4`) → confirmed as `NumberedChapterDivider`. Two further new patterns surfaced: `NumberedDetailCounter` and `EssayReadAlongTOC`.
3. ✅ The backfill surfaced **3 new patterns** (`NumberedChapterDivider`, `NumberedDetailCounter`, `EssayReadAlongTOC`) and promoted 3 existing ones to confirmed (`BenchmarkTableTintedColumn`, `MarketingTrailerBroll`, `SourceTweetAnchor` count up) — queue re-ranked above. `MemeLoopDiagram` stays preliminary (no 2nd instance).

---

## Sources

- Scraper command: `npm run scrape:reels -- --handle aiexplained-official --count 12` (long-form via yt-dlp)
- Picks rationale: `references/creators/aiexplained/picks-wave7.json`
- Channel metadata: `references/creators/aiexplained/info.json`
- Frames: `references/creators/aiexplained/<id>/frames/anim-NN-frame-NN.jpg` for all 12 IDs
- Reference clips: `docs/research/wave-6/references/aiexplained/<id>-anim-NN.mp4` (24 clips total = 8 original + 16 backfill; all ≤2 MB, audio-stripped, ~8–10 s)
- YouTube channel: https://www.youtube.com/@aiexplained-official
- Animation replication contract: `docs/prompts/animation-replication-runbook.md` (transitionVerb rules)

---

## Image budget accounting

**Original pass (2026-05-28):** Frames READ: 8 (2 per video × 4 videos).

**Backfill pass (2026-05-29):** Frames READ: **24** — 1 coarse contact-sheet montage per video (8) + 2 dense representative frames per video (16). Each video surveyed with a single montage Read to locate animation ranges, then 2 dense single-path Reads per the operational rules. Source MP4s deleted immediately after extraction; scratch dir `/tmp/wave7-backfill-aiexplained/` removed at end.
