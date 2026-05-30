# @mreflow (Matt Wolfe — YouTube) — visual + motion analysis

> **Scope:** PRELIMINARY 4-of-12 wave. The Wave-7 brief picked 12 videos (10 long-form + 2 Shorts) but the prior scrape/extract agent crashed before saving the 8 long-form mid-list videos AND **without saving any reference clips for the 4 surviving subdirs**. This analysis is written from frame evidence + picks-JSON titles/reasoning only.
>
> **Scraped:** 4 videos (2 long-form ≤12 min + 2 Shorts), **74 dense frames**, **0 reference clips**.
> **Niche match:** EXACT — Matt Wolfe (Future Tools) is the canonical English-language AI-news anchor. The Wave-3 candidate-pool entry called him "1:1 visual match to Armando." Long-form 16:9 + occasional 9:16 Shorts.
> **Tooling guess:** Premiere / DaVinci with **template chyrons** + manual karaoke captions, NOT Remotion-style procedural primitives. He leans heavily on **borrowed footage** (NVIDIA keynote, Sora app screen-recs, WSJ article reels, X posts) with light overlay chrome, not on procedurally-generated graphics.

Matt is closer to the `alexhormozi` model than to the `natebjones` / `diysmartcode` model: his "animations" are **typography + face-cam overlay on raw recordings**, not procedural charts/diagrams. That is itself a strong reference — it sets the lower bound for visual lift on a high-view-count AI-news channel.

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

## Catalog of patterns (PascalCase, honest about small sample)

> **Sample size caveat:** 4 videos. Pattern frequencies below are reported as `(observed / videos that could have shown it)` — not `/ 12`. Confidence is LOW for any pattern observed in only one video.

1. **`HotelDeskTalkingHead16x9`** (1/2 long-form) — full-bleed face-cam in a travel location, no chrome, no captions, no PIP. Used when the supporting B-roll IS the event he travelled to cover. **LOW replicability** (depends on travel).
2. **`HomeStudioTalkingHead16x9`** (1/2 long-form) — full-bleed face-cam in his home studio (RGB-lit shelves, headphones, beard-illustration framed logo). Default fallback when there's no B-roll. **MID replicability** — we'd need to invest in a comparable physical set.
3. **`BorrowedKeynoteFootageFullBleed16x9`** (1/2 long-form) — full-bleed reuse of someone else's keynote/event broadcast, NO Matt chrome added. Editorial discipline: let the source breathe. **LOW replicability** for our pipeline (we don't film keynotes), but the **"don't over-chrome the source"** lesson is portable.
4. **`ArticleReadAlongWithNeonPIP16x9`** (1/2 long-form) — full-bleed browser-rendered article (WSJ here) + a **magnified pull-quote card** with soft drop-shadow + serif body text + a **circular face-cam PIP with thick neon-magenta ring border** parked bottom-right. The pull-quote card lifts the key sentence out of the page body, scale-in suggested. **HIGH replicability** — we could ship a `<NeonRingFaceCamPIP>` component + a `<MagnifiedPullQuoteCard>` overlay over a static article screenshot today.
5. **`AppGridScreenRecWithPIP16x9`** (1/2 long-form) — full-bleed live screen-recording of an AI app (Sora feed here), Matt scrolling through it, same circular face-cam PIP bottom-right with the neon ring. **HIGH replicability** — same PIP component as #4 layered over any screen recording.
6. **`TopAndBottomSplitWithSeamCaption9x16`** (2/2 Shorts) — 9:16 vertical with a horizontal seam at ~45–55% height. Top: app screenshot (white bg for ChatGPT/Plaid, dark bg for X post). Bottom: face-cam. Karaoke caption sits **on the seam** as a black rounded pill. **HIGHEST replicability** — both Shorts in our scrape use this and the highest-view video (110K) is one of them. Closely related to our existing `SplitWebcamScreen9x16` but inverted (screen on top) with the seam-caption chrome as the differentiator.
7. **`FullBleedAIScreenshotPunchline9x16`** (1/2 Shorts) — variant of #6 where the screenshot zooms to full-bleed for the payoff sentence and the face-cam half is hidden. Used as a closer. **MID replicability** (it's just #6 with a runtime modifier).
8. **`NeonRingCircularFaceCamPIP`** (cross-template chrome, 2/2 long-form when PIP needed) — `border-radius: 50%`, thick neon-magenta/purple outer ring (~8–12 px), parked at bottom-right corner, ~280 px diameter on a 1280 px-wide frame (~22% of width). Color matches Matt's mic foam — deliberate brand-system tie-in. This is the **single most-portable chrome detail** from the scrape.

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

**Open question (for the queue triage):** Items 4–5 reignite the `natebjones` "do we open a 16:9 lane?" debate. Matt is the second strong reference for 16:9 long-form chrome in the corpus. If the answer remains "9:16 only for now," prioritize items 1–3 and 6–7; if 16:9 lane opens, all 7 ship together.

---

## Metadata — analysis scope and gaps

- **Scope:** PRELIMINARY — 4 of 12 wave-7 videos. The picks JSON named 12 (10 long-form + 2 Shorts); only 2 long-form (`JyWdgDcsmbk`, `PKKN5be_my0`) + 2 Shorts (`b6Ek6-E5V88`, `bQN-D8qeAgg`) were saved before the prior extract agent crashed. The 8 missing long-form videos include the AI News flagship (`8RLUaov5eLk`), the listicle marathons (`2u_T68P9H_U`, `p7SRuKWZMvQ`, `8Jw5Wa_8K0Y`), the Nano Banana pieces, and the ChatGPT browser launch — all the ones most likely to contain procedural chart/diagram chrome. **Matt's animation vocabulary may be undercounted here.**
- **Reference clips:** **None saved.** The brief allows for clip extraction but the prior agent did not save any before crashing, so this analysis is frame-only. Future extension should re-run the clip extractor for the 4 surviving subdirs AND fully scrape the 8 missing videos.
- **Image budget:** 8 frames read (at the 8-cap), 1 per video on the singletons + 4 across the dual-group `PKKN5be_my0` + sora-grid payoff confirmation + the b6Ek6 punchline frame.
- **Scratch:** `/tmp/wave7-mreflow/` (~46 MB of coarse JPGs) — cleaned up at the end of this run.
- **Voter count:** 1. Not consensus-graded; downstream Wave-6/7 voting pipeline can extend.

## Sources

- Scraper command (intended): `npm run scrape:shorts -- --url "https://www.youtube.com/@mreflow" --count 12` (Wave-7 brief).
- YouTube channel: https://www.youtube.com/@mreflow
- Future Tools site (his curation: https://www.futuretools.io)
- Picks JSON: `references/creators/mreflow/picks-wave7.json`
- Frames: `references/creators/mreflow/<videoId>/frames/anim-*-frame-NN.jpg` (and `anim-*-article-quote-NN.jpg`, `anim-*-sora-grid-NN.jpg` for `PKKN5be_my0`).
- Metadata: `references/creators/mreflow/<videoId>/metadata.info.json` (yt-dlp dump with storyboard URLs).
- Account-level info: `references/creators/mreflow/info.json`.
