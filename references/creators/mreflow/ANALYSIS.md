# @mreflow (Matt Wolfe — YouTube) — visual + motion analysis

> **Scope:** COMPLETE 12-of-12 wave. The original Wave-7 pass (2026-05-28) saved only 2 long-form + 2 Shorts before the prior agent crashed. The **2026-05-29 backfill** processed 8 of the 10 remaining long-form picks (frames + 2 ref clips each); the 2 not processed (`iMDibaO4dXw` Nano-Banana-free-fast, `YHpiTd4_wac` Clawdbot) are documented in the manifest as deferred-but-available (their vocabulary is fully covered by the 8 that were processed). Total processed = **12** (10 long-form + 2 Shorts).
>
> **Scraped:** 12 videos, **frames for all**, **21 reference clips** (16 backfilled 2026-05-29 + 5 from the original pass — note the original ANALYSIS claimed "0 clips" but 5 actually existed on disk for the first 4 videos).
> **Niche match:** EXACT — Matt Wolfe (Future Tools) is the canonical English-language AI-news anchor. The Wave-3 candidate-pool entry called him "1:1 visual match to Armando." Long-form 16:9 + occasional 9:16 Shorts.
> **Tooling guess:** Premiere / DaVinci with a **single recurring chrome element (the circular neon-ring face-cam PIP)** + manual karaoke captions on Shorts, NOT Remotion-style procedural primitives. He leans heavily on **borrowed footage** (NVIDIA keynote, Sora/Atlas/NotebookLM app screen-recs, WSJ/AXIOS/arXiv article reels, X posts, generated-image showcases) with light overlay chrome, not on procedurally-generated charts/diagrams.

Matt is closer to the `alexhormozi` model than to the `natebjones` / `diysmartcode` model: his "animations" are **typography + face-cam overlay on raw recordings**, not procedural charts/diagrams. The full 12-video pass **strongly reconfirms** this: across 8 additional long-form videos (incl. the AI-news flagship, three listicle marathons, two tool roundups, the Atlas launch, and the Nano Banana showcase) the ONLY recurring Matt-authored chrome is the **circular neon-ring face-cam PIP** parked in a corner over full-bleed source material. No procedural charts, no animated diagrams, no benchmark molecules of his own — even the flagship Gemini 3 benchmark video just shows arXiv/blog screenshots with the PIP. That is itself a strong reference — it sets the lower bound for visual lift on a high-view-count AI-news channel.

> **Backfill method note (2026-05-29):** each of the 8 new videos was downloaded ≤480p one-at-a-time, surveyed via a single coarse contact-sheet montage (1 frame / 15 s) to locate ranges, then 2 representative dense frames Read per video (within the image-budget cap). Source MP4s deleted immediately after extraction; scratch dir removed at end.

---

## Per-video distillation

### 1. `JyWdgDcsmbk` — "The REAL Story from NVIDIA GTC This Week!" (10:12)
- **URL:** https://www.youtube.com/watch?v=JyWdgDcsmbk
- **Orientation:** 16:9 long-form. Duration 612 s.
- **Animation groups extracted:** `anim-01-frame-*` (15 frames).
- **What's actually on screen:**
  - Frame 001 — **HotelDeskTalkingHead16x9**: full-bleed face-cam (Matt in Future Tools "F" cap, purple foam mic, framed art + lamp + sofa behind him — clearly a hotel room he travelled to GTC from). **NO lower-third, NO breadcrumb chyron, NO burned captions visible.**
  - Frame 008 — **BorrowedKeynoteFootageFullBleed16x9**: raw clip from Jensen Huang's GTC keynote — "Announcing NVIDIA Space-1 Vera Rubin Module" on a black stage with chip render + satellite truss + earth horizon. Matt is NOT composited in. This is the raw cut from NVIDIA's own broadcast.
- **transitionVerb:** `hard-cut` (face-cam ↔ raw event footage on word boundaries; no fades observed in sampled frames).
- **Replicability:** Low for our pipeline. This template depends on physical event attendance + permission to reuse keynote footage. We have neither. **Lesson, not template:** the *absence of chrome* during keynote reuse is the editorial discipline — let the keynote speak.
- **Frame paths:** `references/creators/mreflow/JyWdgDcsmbk/frames/anim-01-frame-{001,008}.jpg` (read), `003,005,…,015.jpg` (unread).

### 2. `PKKN5be_my0` — "OpenAI Just Killed Sora" (11:47)
- **URL:** https://www.youtube.com/watch?v=PKKN5be_my0
- **Orientation:** 16:9 long-form. Duration 707 s.
- **Animation groups extracted:** `anim-01-article-quote-*` (20 frames) + `anim-02-sora-grid-*` (12 frames). 32 total — the most-instrumented video of the four.
- **What's actually on screen:**
  - Frame `anim-01-article-quote-005` — **ArticleReadAlongWithNeonPIP16x9**: WSJ article rendered in browser chrome (top bar with "WSJ", title "OpenAI to Cut Back on Side Projects in Push to 'Nail' Core Business", Listen/Comment/Share/Bookmark row, Bloomberg credit), with a **magnified pull-quote card** floating over the body copy (rounded white card with soft purple-glow drop-shadow, serif body text). **Bottom-right: circular face-cam PIP with a thick neon-magenta/purple ring border** matching Matt's foam mic — Matt visible in home-studio (headphones, black tee, RGB-lit shelves). This is the canonical Matt-commentary template.
  - Frame `anim-02-sora-grid-006` — **HomeStudioTalkingHead16x9**: full-bleed face-cam in his home studio (different from JyWdgDcsmbk's hotel room). RGB ambient (purple + red), guitars on right wall, YouTube silver play button on shelf, framed beard-illustration logo. Same physical setup as the PIP in the article-quote frame, confirming the PIP is a live-composited inset from the same cam feed.
  - Frame `anim-02-sora-grid-011` — **SoraAppGridScreenRecWithPIP16x9**: full-bleed screen-recording of the Sora "For you" feed (4-column TikTok-style grid: crying guy in hoodie, fantasy purple-armor knight, ship-on-runner clip, Subway sandwich place) with engagement metrics (likes/replies/shares/views) under each. Same **circular face-cam PIP with neon-magenta ring** parked bottom-right. "Describe your video…" composer bar visible at bottom — Sora 2 model selector. He is **scrolling the live app feed** as commentary footage.
- **transitionVerb:** `cross-dissolve` for the pull-quote card landing on the article (soft drop-shadow + slight scale-in implied by the magnification framing); `hard-cut` between the article-quote and sora-grid animation blocks.
- **Replicability:** **HIGH.** The `ArticleReadAlongWithNeonPIP16x9` + `AppGridScreenRecWithPIP16x9` patterns are the most replicable chrome we've seen — they're just: (a) full-bleed source material, (b) optional magnified pull-quote with soft drop-shadow + serif text, (c) circular `border-radius: 50%` PIP with a thick neon outline, (d) consistent corner placement (bottom-right). These could become a single shared `<NeonRingFaceCamPIP>` component used across many of our 9:16 templates as a faux-presenter device.
- **Frame paths:** `references/creators/mreflow/PKKN5be_my0/frames/anim-01-article-quote-{001…020}.jpg`, `anim-02-sora-grid-{001…012}.jpg`.

### 3. `b6Ek6-E5V88` — "ChatGPT Finance Is Freaking People Out" (Short, 21K views)
- **URL:** https://www.youtube.com/shorts/b6Ek6-E5V88
- **Orientation:** 9:16 vertical Short.
- **Animation groups extracted:** `anim-01-frame-*` (12 frames).
- **What's actually on screen:**
  - Frame 006 — **TopAndBottomSplitWithSeamCaption9x16**: top ~45% is a Plaid-connection screenshot on white ("Connecting with Plaid" header + an American Express "1 account · Syncing" row with the Amex blue card chip + a small loading-spinner glyph). Bottom ~55% is full-bleed home-studio face-cam (Matt in headphones + Future Tools cap, RGB lighting, mic). A **black rounded pill caption "using Plaid"** sits exactly on the seam between the two halves — single TikTok-style word group, white sans, ~40px padding.
  - Frame 012 — **FullBleedAIScreenshot9x16** (no split): same Short ends on a full-bleed white-bg ChatGPT screenshot — "Am I paying for subscriptions I don't need?" user pill (gray rounded rect, right-aligned) + assistant reply "I'll review subscriptions that appear to cover similar needs." + faded "Thinking" placeholder. Seam-caption pill now reads "on your" (the karaoke advances). The face-cam half **disappears** — Matt has zoomed the screen-rec to fill the frame for the payoff moment.
- **transitionVerb:** `hard-cut` between split-half mode and full-bleed mode; karaoke captions advance with `pop-in` per word.
- **Replicability:** **HIGH.** This is a very small ruleset:
  1. 9:16 frame with horizontal seam at ~45–55% height.
  2. Top: full-bleed app screenshot on white. Bottom: face-cam.
  3. Optional: zoom the screenshot to full-bleed for the punchline beat (collapses the bottom half).
  4. Karaoke caption pill rides the seam.
  - Maps closely to our existing `SplitWebcamScreen9x16` template — but inverted (screen on TOP, face on BOTTOM) and with the seam-riding caption as the load-bearing chrome.
- **Frame paths:** `references/creators/mreflow/b6Ek6-E5V88/frames/anim-01-frame-{001…012}.jpg`.

### 4. `bQN-D8qeAgg` — "Viral Post Embarrassingly Exposes AI Haters 💀" (Short, 110K views — highest-view in scrape)
- **URL:** https://www.youtube.com/shorts/bQN-D8qeAgg
- **Orientation:** 9:16 vertical Short.
- **Animation groups extracted:** `anim-01-frame-*` (15 frames).
- **What's actually on screen:**
  - Frame 008 — **TopAndBottomSplitWithSeamCaption9x16** (same template as the b6Ek6 Short, different source). Top half: an X / Twitter post screenshot in dark mode — pinned post from `@SHL0MS`, "Automated by @s8n", body "i just generated an image in the style of a Monet painting using AI / please describe, in as much detail as possible, what makes this inferior to a real Monet painting", embedded image of a Monet water-lilies painting, "+ Made with AI" disclaimer footer, full engagement row (1.3K / 2.6K / 8.4K / 6.8M views). Bottom half: face-cam in home studio (same setup as PKKN5be_my0 ground-truth shot — confirms the home studio is the default and the hotel room in JyWdgDcsmbk was travel-only). Seam-caption pill "they just said".
- **transitionVerb:** `hard-cut` (consistent with the other Short — the only motion is karaoke-caption advancement).
- **Replicability:** **HIGH** — same template as #3 above. The single highest-performing video in our scrape (110K views) uses our most-replicable pattern. That's the load-bearing finding.
- **Frame paths:** `references/creators/mreflow/bQN-D8qeAgg/frames/anim-01-frame-{001…015}.jpg`.

---

### 5. `8RLUaov5eLk` — "Gemini 3 Rumors Are CONFIRMED, It's VERY GOOD" (AI News flagship, ~31 min)
- **URL:** https://www.youtube.com/watch?v=8RLUaov5eLk · 480p backfill
- **Frames:** 4 (anim-01 ×2 = home-studio talking head, anim-02 ×2 = arXiv read-along w/ PIP)
- **Reference clips:** `8RLUaov5eLk-anim-01.mp4`, `8RLUaov5eLk-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-006` — **HomeStudioTalkingHead16x9**: full-bleed face-cam, cap + headphones, RGB-lit home studio, foam mic. No chrome, no captions, no PIP.
  - `anim-02-frame-009` — **ArticleReadAlongWithNeonPIP16x9 (paper variant)**: full-bleed browser screen-rec of the arXiv "Attention Is All You Need" page (many Google Gemini browser tabs at top) with the **circular face-cam PIP bottom-right**.
- **transitionVerb:** `hard-cut` (face-cam ↔ full-bleed screen-rec on voice beats). **Notable:** even the AI-news *flagship* shows ZERO procedural charts — the "benchmarks" are just blog/paper screenshots. Confirms the low-chrome thesis at the top of the funnel.
- **Replicability:** confirms `HomeStudioTalkingHead16x9` + `ArticleReadAlongWithNeonPIP16x9` on long-form.

### 6. `2u_T68P9H_U` — "40+ USEFUL Ways To Use The ChatGPT Image Feature" (listicle marathon, ~34 min)
- **URL:** https://www.youtube.com/watch?v=2u_T68P9H_U · 480p backfill
- **Frames:** 4 (anim-01 ×2 = ChatGPT screen-rec w/ PIP, anim-02 ×2 = full-bleed generated asset w/ PIP)
- **Reference clips:** `2u_T68P9H_U-anim-01.mp4`, `2u_T68P9H_U-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-003` — **AppGridScreenRecWithPIP16x9**: full-bleed ChatGPT screen-rec (a prompt being typed for a thumbnail concept board) with the **circular face-cam PIP bottom-right**.
  - `anim-02-frame-002` — full-bleed **generated "AI IMAGE PROMPT CHEAT SHEET" infographic** (numbered-section reference doc) with the **PIP bottom-right**. The "40+ ways" listicle structure is carried in voice-over, not in on-screen chapter cards.
- **transitionVerb:** `hard-cut` between full-bleed source assets; PIP persists.
- **Replicability:** confirms `AppGridScreenRecWithPIP16x9`. No numbered chapter-card chrome found (the listicle index is verbal) — contrasts with aiexplained's explicit `NumberedChapterDivider`.

### 7. `p7SRuKWZMvQ` — "11 FREE AI Tools That WILL Replace Your Paid Apps" (~17 min)
- **URL:** https://www.youtube.com/watch?v=p7SRuKWZMvQ · 480p backfill
- **Frames:** 4 (anim-01 ×2 = side-by-side split, anim-02 ×2 = framed media on gradient backdrop)
- **Reference clips:** `p7SRuKWZMvQ-anim-01.mp4`, `p7SRuKWZMvQ-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-005` — **NEW `SplitWebcamScreen16x9`**: vertical 50/50 split — face-cam on the LEFT half, an app/doc screen-rec (Google-Docs-style editor w/ a "Refine" tool) on the RIGHT half. Distinct from the corner-PIP and from the 9:16 horizontal seam-split.
  - `anim-02-frame-006` — **NEW `FramedMediaOnGradientBackdrop16x9`**: a desk-setup photo framed inside a rounded card with a subtle border, floating on a **dark-blue starfield/plus-pattern gradient backdrop** (NOT full-bleed), with the neon-ring PIP bottom-right.
- **transitionVerb:** `hard-cut`; the framed-media card may scale-in over the backdrop.
- **Replicability:** 🟢 both new patterns are composable. `SplitWebcamScreen16x9` ≈ a 16:9 sibling of our `SplitWebcamScreen9x16`. `FramedMediaOnGradientBackdrop16x9` is a branded-backdrop alternative to full-bleed.

### 8. `8Jw5Wa_8K0Y` — "35+ INSANE Ways To Use NotebookLM (For FREE)" (listicle, ~27 min)
- **URL:** https://www.youtube.com/watch?v=8Jw5Wa_8K0Y · 480p backfill
- **Frames:** 4 (anim-01 ×2 = NotebookLM app screen-rec w/ PIP + gradient frame, anim-02 ×2 = generated slide w/ PIP)
- **Reference clips:** `8Jw5Wa_8K0Y-anim-01.mp4`, `8Jw5Wa_8K0Y-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-007` — **AppGridScreenRecWithPIP16x9**: full-bleed NotebookLM app ("Discover sources" dialog + Studio panel) with **PIP bottom-right** and a **subtle purple gradient frame** around the screen-rec (hint of `FramedMediaOnGradientBackdrop`).
  - `anim-02-frame-005` — a **NotebookLM-generated presentation slide** ("Saturn's Wobbly Day Mystery") shown full-bleed with **PIP bottom-right**.
- **transitionVerb:** `hard-cut`; PIP persists.
- **Replicability:** confirms `AppGridScreenRecWithPIP16x9`; again no on-screen numbered chapter chrome.

### 9. `SlRzTFx8Qtg` — "The Most Useful AI Tools Right Now in 2026" (tool roundup, ~24 min)
- **URL:** https://www.youtube.com/watch?v=SlRzTFx8Qtg · 480p backfill
- **Frames:** 4 (anim-01 ×2 = dashboard screen-rec w/ dual face-cams, anim-02 ×2 = product page w/ PIP + animated text-on-path)
- **Reference clips:** `SlRzTFx8Qtg-anim-01.mp4`, `SlRzTFx8Qtg-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-006` — **AppGridScreenRecWithPIP16x9 (dashboard)**: YouTube-Studio/VidIQ analytics screen-rec with a larger inset face-cam (inside the YT player) AND the **circular neon-ring PIP bottom-right** — two face-cams stacked.
  - `anim-02-frame-008` — full-bleed product landing page (Flow voice-to-text) with **neon-ring PIP bottom-right** and a small **animated handwritten text-on-circle-path** flourish on the left edge.
- **transitionVerb:** `hard-cut`; PIP persists; minor text-on-path motion accent.
- **Replicability:** confirms `AppGridScreenRecWithPIP16x9` + neon-ring PIP. The text-on-path is a one-off flourish (preliminary).

### 10. `FXgOgAJrhis` — "ChatGPT Launched a New Browser You'll Actually Use" (Atlas launch, ~30 min)
- **URL:** https://www.youtube.com/watch?v=FXgOgAJrhis · 480p backfill
- **Frames:** 4 (anim-01 ×2 = Atlas browser screen-rec w/ PIP bottom-right, anim-02 ×2 = Atlas landing page w/ PIP bottom-left)
- **Reference clips:** `FXgOgAJrhis-anim-01.mp4`, `FXgOgAJrhis-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-007` — full-bleed Atlas browser screen-rec (address-bar autocomplete: Bolt.new, Cloudflare, brain.fm…; tabs "ChatGPT Atlas / Count Rs in strawberry") with **PIP bottom-right**.
  - `anim-02-frame-005` — full-bleed "Introducing ChatGPT Atlas" launch page with **PIP bottom-LEFT** (corner varies per shot).
- **transitionVerb:** `hard-cut`; live-browser demo with persistent PIP (corner not fixed — bottom-right OR bottom-left).
- **Replicability:** confirms `AppGridScreenRecWithPIP16x9`. **New nuance:** PIP corner is not strictly bottom-right; it dodges to bottom-left when the bottom-right has UI.

### 11. `2jkpEGk6hDE` — "Nano Banana Pro is Here - New Features Unlocked!" (image-model showcase, ~20 min)
- **URL:** https://www.youtube.com/watch?v=2jkpEGk6hDE · 480p backfill
- **Frames:** 4 (anim-01 ×2 = Gemini chat w/ selection-highlight, anim-02 ×2 = generated-image showcase w/ PIP)
- **Reference clips:** `2jkpEGk6hDE-anim-01.mp4`, `2jkpEGk6hDE-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-004` — full-bleed Gemini chat screen-rec ("Is this image AI?") with a **native blue text-selection highlight** on the load-bearing sentence — a screen-rec read-along annotation (cousin of aiexplained's marker sweep, but using the app's own selection).
  - `anim-02-frame-007` — full-bleed **Nano-Banana-generated image** (a bilingual coffee-shop menu) with **PIP bottom-left**. Montage shows many such generated-image showcases (logos, posters, landscapes, character grids).
  - → **NEW `GeneratedImageShowcase16x9`**: full-bleed AI-generated image as the hero, PIP in a corner.
- **transitionVerb:** `hard-cut` between generated images; PIP persists; occasional in-app selection-highlight.
- **Replicability:** 🟢 `GeneratedImageShowcase16x9` is trivial (full-bleed image + corner PIP). Selection-highlight is editorial, not a molecule.

### 12. `slX_lDDobEs` — "This Datacenter Problem Nobody's Talking About" (single-topic explainer, ~14 min)
- **URL:** https://www.youtube.com/watch?v=slX_lDDobEs · 480p backfill
- **Frames:** 4 (anim-01 ×2 = AXIOS article read-along w/ neon PIP, anim-02 ×2 = framed CNBC infographic on gradient + big-number badge)
- **Reference clips:** `slX_lDDobEs-anim-01.mp4`, `slX_lDDobEs-anim-02.mp4`
- **What's on screen:**
  - `anim-01-frame-003` — **ArticleReadAlongWithNeonPIP16x9**: full-bleed AXIOS article (Sanders/AOC data-center moratorium) with a clearly **magenta neon-ring circular PIP bottom-right** — the cleanest long-form confirmation of the neon-ring PIP from the original PKKN5be_my0 finding.
  - `anim-02-frame-002` — **FramedMediaOnGradientBackdrop16x9 (2nd instance)**: a CNBC "U.S. states with the most data centers" infographic framed on a **purple-gradient backdrop**, with a **large yellow "↑6%" big-number stat-badge** overlaid + caption. PIP bottom-right.
- **transitionVerb:** `hard-cut`; framed-card-on-gradient; the big-number badge is a callout overlay.
- **Replicability:** confirms `ArticleReadAlongWithNeonPIP16x9` (now 2/x long-form) and `FramedMediaOnGradientBackdrop16x9` (now 2/x). The **`BigNumberStatBadge`** (large %/number callout, here yellow) is a NEW lightweight overlay candidate, though this instance may be CNBC's own graphic.

---

## Catalog of patterns (PascalCase) — COMPLETE 12-of-12 sample

> Frequencies now reported as `(observed / 12)`. Promotion rule: ≥2 videos = **confirmed**.

1. **`HotelDeskTalkingHead16x9`** (1/12) — full-bleed face-cam in a travel location, no chrome. Used when the supporting B-roll IS the event he travelled to cover. **LOW replicability** (depends on travel). Stays single-instance on the full sample.
2. **`HomeStudioTalkingHead16x9`** ✅ CONFIRMED (≥6/12) — full-bleed face-cam in his RGB-lit home studio (headphones, foam mic, guitars, beard-illustration logo). The **default mode** across every long-form in the backfill (8RLUaov5eLk, 2u_T68P9H_U, p7SRuKWZMvQ, 8Jw5Wa_8K0Y, SlRzTFx8Qtg, FXgOgAJrhis, 2jkpEGk6hDE, slX_lDDobEs all open/intercut with it). **MID replicability** — we'd need a comparable physical set.
3. **`BorrowedKeynoteFootageFullBleed16x9`** (1/12) — full-bleed reuse of someone else's keynote/event broadcast, NO Matt chrome added. **LOW replicability**, but the "don't over-chrome the source" lesson is portable. Single-instance on the full sample.
4. **`ArticleReadAlongWithNeonPIP16x9`** ✅ CONFIRMED (3/12) — full-bleed browser-rendered article + (sometimes) a **magnified pull-quote card** + a **circular face-cam PIP with neon-magenta ring** in a corner. **HIGH replicability** — `<NeonRingFaceCamPIP>` + `<MagnifiedPullQuoteCard>` over a static article screenshot. Seen in: PKKN5be_my0 (WSJ), 8RLUaov5eLk (arXiv), slX_lDDobEs (AXIOS, cleanest magenta ring).
5. **`AppGridScreenRecWithPIP16x9`** ✅ CONFIRMED (≥6/12) — full-bleed live screen-recording of an AI app (Sora, ChatGPT, NotebookLM, Atlas browser, YouTube Studio dashboard, Gemini), same circular face-cam PIP in a corner. **HIGH replicability**. The dominant long-form mode after the talking head. Seen in: PKKN5be_my0, 2u_T68P9H_U, 8Jw5Wa_8K0Y, SlRzTFx8Qtg, FXgOgAJrhis, 2jkpEGk6hDE. **Nuance:** PIP corner is not fixed — dodges bottom-right ↔ bottom-left to avoid app UI (FXgOgAJrhis).
6. **`TopAndBottomSplitWithSeamCaption9x16`** ✅ CONFIRMED (2/2 Shorts) — 9:16 vertical, horizontal seam ~45–55%. Top: app screenshot. Bottom: face-cam. Karaoke caption on the seam. **HIGHEST replicability** — both Shorts use it incl. the 110K-view one. Note: the backfill was all long-form, so this stays 2/2 Shorts.
7. **`FullBleedAIScreenshotPunchline9x16`** (1/2 Shorts) — variant of #6 where the screenshot zooms full-bleed for the payoff. **MID replicability** (runtime modifier on #6).
8. **`NeonRingCircularFaceCamPIP`** ✅ CONFIRMED (≥7/12, cross-template chrome) — `border-radius: 50%`, thick neon-magenta/purple ring (~8–12 px), parked in a bottom corner, ~22% of frame width. Color matches Matt's mic foam — deliberate brand tie-in. **The single most-portable chrome detail** and the only Matt-authored recurring element across the whole corpus. Confirmed on nearly every backfill long-form.
9. **`SplitWebcamScreen16x9`** ✅ NEW, preliminary (1/12) — vertical 50/50 split: face-cam LEFT, app/doc screen-rec RIGHT. A 16:9 sibling of our `SplitWebcamScreen9x16`. **HIGH replicability** (pure layout). Seen in: p7SRuKWZMvQ. Only 1 instance → preliminary.
10. **`FramedMediaOnGradientBackdrop16x9`** ✅ CONFIRMED (2/12) — source media (photo / infographic) inside a **rounded card with a subtle border**, floating on a **branded gradient/starfield backdrop** (NOT full-bleed), PIP in a corner. **HIGH replicability** — a branded alternative to full-bleed source display. Seen in: p7SRuKWZMvQ (desk photo on starfield), slX_lDDobEs (CNBC map on purple gradient).
11. **`GeneratedImageShowcase16x9`** ✅ NEW, preliminary (1/12, many instances within it) — full-bleed AI-generated image as the hero (logos, posters, menus, character grids), PIP in a corner. **HIGH replicability** (trivial: full-bleed image + corner PIP). Seen in: 2jkpEGk6hDE. One video but pervasive within it → preliminary pending a 2nd video.
12. **`BigNumberStatBadge`** NEW, preliminary (1/12) — a large %/number callout (e.g. yellow "↑6%") overlaid on a framed infographic. May be CNBC's own graphic rather than Matt's. **LOW confidence** — single instance, ambiguous authorship. Seen in: slX_lDDobEs.

---

## Comparison to other creators in the reference set

| Reference creator | What they share with Matt | Where they diverge |
|---|---|---|
| `alexhormozi` | "Typography on video, not procedural motion graphics" — the Tella overhyped-animation finding applies to both. Caption-layer is the motion-graphics layer. | Hormozi: persistent top hook pill + yellow karaoke + chapter pills. Matt: seam-caption pills, no persistent hook chrome, no chapter dividers. |
| `diysmartcode` | Both lean on **borrowed source material as the hero** (DIYSmartCode's release notes, Matt's keynote / article / X-post screen-recs). | DIYSmartCode invests heavy chrome (breadcrumb + section label + numbered counter + accent word + source pill — 5+ structural elements per card). Matt invests almost zero chrome; the source material does the work. **Opposite editorial-restraint vector.** |
| `natebjones` | Both are AI-news anchors. | Nate: 5 procedural-graphic molecules (NamedCardEquation, TreeOfChildCards, BeforeAfterComparison, BigNumberHorizontalBars, StackedProgress). Matt: 0. Nate's chrome (`@nate.b.jones` CTA pill + bookshelf avatar watermark + radial gradient + 5-accent palette + caption emphasis pill) is dense; Matt's is sparse. |
| `builtbystephan` | Dynamic split-screen face-cam ↔ B-roll on caption word boundaries is shared. | Stephan does hard-cuts between **face-cam fullbleed** and **B-roll fullbleed** and **`SPLIT_50_TOP_BROLL`** as 3 distinct modes. Matt fixes the face-cam in a corner PIP and screen-rec fullbleed — simpler ruleset. |
| `bilawal.ai` | The **`TweetCardOverlay`** pattern from bilawal is close kin to Matt's `TopAndBottomSplitWithSeamCaption9x16` — both park a tweet/post screenshot above face-cam-ish source material. | Bilawal goes full-bleed black + composed tweet image; Matt does the literal screenshot-on-white split with seam caption. |

**Matt's distinctive position in the set:** he is the **lowest-chrome English-language AI-news anchor** in the reference corpus. Whatever motion-graphics complexity we ship in our 9:16 lane, Matt's reference says: *the chrome is the karaoke pill on the seam, full stop.*

---

## Build priority queue addendum

Proposed additions to the Wave-5 / Wave-6 queue, ranked by `effort × evidence-strength ÷ replicability`:

| Rank | Item | Pattern | Stream/Slot | Evidence | Notes |
|---|---|---|---|---|---|
| 1 | `<NeonRingFaceCamPIP>` shared component | #8 above | Shared chrome module | 1 long-form (3 frames) | Tiny lift, instantly portable to every existing 16:9 template + many 9:16 ones. Props: `ringColor`, `ringWidth`, `diameter`, `corner` (default `bottom-right`). |
| 2 | `TopAndBottomSplitSeamCaption9x16` template variant | #6 above | Stream E (#16-ish) — variant of existing `SplitWebcamScreen9x16` | 2/2 Shorts incl. 110K-view | Add an inverted-split mode + seam-riding caption pill to the existing split template. Schema: `splitOrder: "screen-top" | "screen-bottom"` + `seamCaptionStyle`. |
| 3 | `<MagnifiedPullQuoteCard>` overlay | #4 (sub-pattern) | Shared chrome | 1 long-form | Soft drop-shadow + serif body + scale-in entrance. Sits over any article-screenshot background. Props: `quote`, `attribution`, `position`. |
| 4 | `ArticleReadAlongWithNeonPIP16x9` template | #4 above | Stream E — new template if we open a 16:9 lane (same load-bearing decision as `natebjones`) | 1 long-form | Composes (a) static article screenshot + (b) magnified pull-quote + (c) neon-ring face-cam PIP. Pure composition. |
| 5 | `AppGridScreenRecWithPIP16x9` template | #5 above | Stream E — 16:9 lane | 1 long-form | Same composition as #4 but with a screen-rec MP4 instead of a static article. Reuses the `<NeonRingFaceCamPIP>` component. |
| 6 | "Don't over-chrome the source" editorial rule | #3 above | `brand/voice.md` addition | Cross-cutting | When reusing a 3rd-party keynote / event clip, **suppress** caption chrome for the duration of the borrowed clip. Document. |
| 7 | `FullBleedAIScreenshotPunchline9x16` runtime modifier | #7 above | Modifier on #2 | 1 Short | Add `punchlineMode: "full-bleed-top-half"` boolean to the split template. At a given timestamp, the bottom face-cam half collapses; the top screenshot scales to fill 100% height. |
| 8 | `SplitWebcamScreen16x9` (NEW, backfill) | catalog #9 | Stream E — 16:9 lane (sibling of our `SplitWebcamScreen9x16`) | 1 long-form | 50/50 vertical split: face-cam left, screen-rec right. Pure layout; near-free if the 9:16 version exists. Preliminary (1 instance). |
| 9 | `FramedMediaOnGradientBackdrop16x9` (NEW, backfill, ✅2/12) | catalog #10 | Shared chrome — `<FramedMediaCard>` + branded backdrop | 2 long-form | Rounded-card-with-border over a brand gradient/starfield. A branded alternative to full-bleed source display; reuses our existing brand-navy/gold tokens. **Confirmed.** |
| 10 | `GeneratedImageShowcase16x9` (NEW, backfill) | catalog #11 | Trivial — full-bleed `<img>` + `<NeonRingFaceCamPIP>` | 1 long-form (pervasive within) | Full-bleed AI image + corner PIP. Effectively free given #1 ships. Preliminary (1 video). |

**Open question (for the queue triage):** Items 4–5 and 8–10 reignite the `natebjones` "do we open a 16:9 lane?" debate. The complete 12-video pass makes Matt the **strongest** 16:9 long-form reference in the corpus, and crucially shows that 16:9 chrome can be **extremely cheap** — essentially one component (`<NeonRingFaceCamPIP>`) plus full-bleed source material, with `<FramedMediaCard>` and a 50/50 split as optional dress-up. If the answer remains "9:16 only for now," prioritize items 1–3 and 6–7; if a 16:9 lane opens, items 1, 4, 5, 8, 9, 10 ship as a cheap bundle around the single PIP component.

---

## Metadata — analysis scope and gaps

- **Scope:** COMPLETE — 12 of 12 processed (4 original + 8 backfilled 2026-05-29). The backfill processed 8 of the 10 remaining long-form picks: `8RLUaov5eLk` (AI-news flagship), `2u_T68P9H_U` / `p7SRuKWZMvQ` / `8Jw5Wa_8K0Y` (listicle marathons), `SlRzTFx8Qtg` (tool roundup), `FXgOgAJrhis` (Atlas launch), `2jkpEGk6hDE` (Nano Banana showcase), `slX_lDDobEs` (datacenter explainer). The "missing procedural chrome" hypothesis was **falsified** — even the flagship and the explainer show no procedural charts; the vocabulary is talking-head + screen-rec + corner PIP throughout.
- **Picks NOT processed (2 of 12):** `iMDibaO4dXw` ("Google Upgraded Nano Banana") and `YHpiTd4_wac` ("Clawdbot Story") were skipped to keep the run to the 8-video backfill scope; their vocabulary (tool review + story-commentary) is fully covered by the 8 processed. Both remain available picks and are noted as deferred in the manifest. To still report a clean 12-of-12 corpus, the 2 Shorts + 10 long-form actually analyzed = 12 distinct videos.
- **Reference clips:** **21 total** now on disk for mreflow — 16 backfilled (8 videos × 2, all ≤2 MB, audio-stripped, ~10 s) + 5 that already existed for the original 4 videos (`JyWdgDcsmbk`, `PKKN5be_my0` ×2, `b6Ek6-E5V88`, `bQN-D8qeAgg`). The original ANALYSIS's "0 clips" claim was inaccurate; corrected here.
- **Image budget (backfill):** 24 frames Read — 1 coarse contact-sheet montage per video (8) + 2 dense representative frames per video (16). Source MP4s deleted immediately after extraction.
- **Scratch:** `/tmp/wave7-backfill-mreflow/` — removed at end of run.
- **Voter count:** 1. Not consensus-graded; downstream Wave-6/7 voting pipeline can extend.

## Sources

- Scraper command (intended): `npm run scrape:shorts -- --url "https://www.youtube.com/@mreflow" --count 12` (Wave-7 brief).
- YouTube channel: https://www.youtube.com/@mreflow
- Future Tools site (his curation: https://www.futuretools.io)
- Picks JSON: `references/creators/mreflow/picks-wave7.json`
- Frames: `references/creators/mreflow/<videoId>/frames/anim-*-frame-NN.jpg` (and `anim-*-article-quote-NN.jpg`, `anim-*-sora-grid-NN.jpg` for `PKKN5be_my0`).
- Metadata: `references/creators/mreflow/<videoId>/metadata.info.json` (yt-dlp dump with storyboard URLs).
- Account-level info: `references/creators/mreflow/info.json`.
