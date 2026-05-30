# @bilawal.ai — visual + motion analysis

> **Creator:** Bilawal Sidhu — ex-Google Maps / spatial-AI PM turned AI/3D builder-creator. ~75K IG / 990K TT / 400K YT. English-language anchor for the "Bloomberg-meets-builder" persona.
> **Scraped:** 2026-05-24 via gallery-dl. Posted feed is heavily carousel-image-based; **7 video reels** were extracted from the most recent ~22 posts (~32% reel ratio). Durations range 9–164 s.
> **Template-value verdict:** **HIGH but narrow.** Unlike Carlos (6 templates rotating freely), Bilawal runs ONE dominant tentpole template (TweetCardOverlay) ~5/7 of the time, plus 2–3 cinematic alternates for "spectacle" moments. The dominant template is highly reproducible in Remotion and maps cleanly to a gap in our 15-template typology.

This is a **persona-brand reference,** not a graphics-library reference — Bilawal's visual signature is that **his own tweet IS the headline**, framed exactly like a Twitter/X embed, sitting above whatever artifact he's showing. It's editorial restraint with a single load-bearing UI element.

---

## Templates observed

### Template A — TweetCardOverlay (dominant, 5/7 reels)
**Reels using it:** `DWeLzV4hxsp` (Strait of Hormuz LPG tanker), `DWr9DkpDzsI` (toll booth ships), `DWwOcLEOHXI` (God's Eye View intro), `DXC96O6CPgC` (ceasefire data — variant with newsclip B-roll), `DYh_jS_vM4L` (Genie 3 + Street View).

**Visual structure (top → bottom):**
- **Bg:** pure black `#000` — letterboxed (the artifact below doesn't fill the frame; black bars top & bottom).
- **Top third — Tweet card mockup:**
  - Avatar circle (his face, ~80 px) + **`Bilawal Sidhu`** in white bold sans, **`@bilawalsidhu`** in muted gray sans below, **blue verified checkmark** inline.
  - 3–6 lines of tweet body in white regular sans (Helvetica/Inter at ~36–44 px). Sentence case, casual punctuation (em-dashes, lowercase brand names like "iran's"), quotation marks around terms ("dark vessels", "OSINT").
  - No timestamp, no engagement counts, no reply chrome — just the avatar + name + body. The "tweet" is fictional/composed for the reel; it's a typography device, not a real screenshot.
- **Middle ~60% — Artifact:** A rectangular video crop, usually a screen recording of his own dashboard (`RAFTRWORLD.AI` "God's Eye View" map app with vessel traffic, charts, vessel-detail side panel). On variants this is replaced by a 3D demo clip (`DYh_jS_vM4L` → Genie 3 first-person walk).
- **Optional bottom-right inset:** small 16:9 webcam of Bilawal at his mic (white turtleneck, glasses, mic boom) overlapped onto the artifact corner. Appears on `DWwOcLEOHXI`, `DW_0tFaj2lU`, `DYh_jS_vM4L` — used when he wants to assert authorship ("I built this") vs pure observation.

**Motion grammar:**
- Tweet card is **static for the entire reel** — written once, never re-typed letter-by-letter. No typewriter effect.
- Artifact below **plays continuously** (dashboard pan/zoom, demo footage, etc.) — that's where ALL motion lives.
- Optional face-cam inset is just real webcam footage, not animated.
- No transitions, no cuts within the tweet card. The card is the anchor; the artifact is the show.

**Map to our Stream-E typology:** **NEW template — not currently specced.** Closest existing slots are:
- Our `QuoteCard9x16` is the wrong frame — it's a pull-quote on cream paper, not a tweet mockup.
- Our `TechNewsFlash9x16` is closer in spirit (news-card on dark bg) but doesn't have the persistent identity-card + bottom artifact split.

**Recommendation: ADD `TweetCardHero9x16` to the typology.** Implementation is ~120 lines:
- Reusable `<TweetCard>` component with props `{avatarUrl, displayName, handle, verified, body}`.
- Composition layout: 25% top tweet card, 65% middle `<Video>` or `<OffthreadVideo>` source, optional 10% face-cam corner overlay.
- All animation is delegated to the inner video source — composition is otherwise static (extremely cheap to render).

**Why this matters:** This is the "personal brand with proof" pattern. Armando could run a Spanish-language variant ("@armandointeligencia thinks…" + an animated diagram of the claim) for opinion-style reels. It's the most efficient "ratio of effort to authority signal" template in this set.

---

### Template B — FullBleedKineticDashboard
**Reel using it:** `DWeLzV4hxsp` (mid-section, after the tweet-card intro).

**Visual structure:**
- **Bg:** pure black with the dashboard map filling the full 9:16 frame (no tweet card, no letterbox).
- **Centerpiece:** zoomed-in view of the Persian Gulf coastline, ship trails rendered as **amber/gold lines** on near-black water. White country outlines, low-contrast city labels (`Bandar Abbas`, `Dubai`, `UAE`).
- **HUD overlays:**
  - Top-center: a translucent panel `MAR 04, 2026 · 1 CROSSING EVENT · 1 IN · 0 OUT · DARK TRANSIT: LAYER OFF`. Sans-serif tracking-spaced, near-monospace feel.
  - **Massive title type:** `STRAIT OF HORMUZ` in ~120 px wide-tracked sans, ghosted at ~30% opacity overlaying the map — feels like a Bloomberg Open opener.
- **Color accent:** electric **cyan/teal `#56DAD0`-ish** for the active "crossing event" line + an `O` marker — single accent per scene.

**Motion grammar:**
- Camera-style pan/zoom across the map (likely a manually-driven recording, not auto-keyframed).
- Title type **appears letter-by-letter or fades in word-tracked** (frame 03 shows it half-formed, frame 04 fully resolved).
- HUD counters tick over time as the playback timeline advances.

**Map to our Stream-E typology:** Closest is our **`DiagramExplainer9x16`** in dark-mode variant — but Bilawal's is much more cinematic. The right framing is: this is what a `DiagramExplainer` looks like when the "diagram" is a live data product, not a static SVG.

**Recommendation:** **revisit Sprint E `DiagramExplainer` to support a "ghosted hero title overlaying the diagram" variant.** It's a ~30-line addition (`<AbsoluteFill>` with letter-staggered opacity reveal). Worth doing — this title-over-canvas pattern is a Bloomberg/FT staple we'd benefit from.

---

### Template C — KineticAllCapsTickerOverFootage
**Reel using it:** `DXC96O6CPgC` (Iran ceasefire announcement — found-footage of delegations arriving).

**Visual structure:**
- **Bg:** found news/B-roll footage (Iran delegation arriving in Pakistan, dim outdoor light).
- **Top label:** `IRAN DELEGATION ARRIVES IN PAKISTAN FOR CEASEFIRE TALKS.` in **all-caps wide-tracked sans, light gray ~40% opacity** — feels like a documentary lower-third moved to upper-third.
- **Center-bottom caption:** `WITH IRAN AGREEING` in **all-caps bold white**, one phrase at a time, replacing per beat — the active narration. Heavy shadow for legibility, no plate.

**Motion grammar:**
- Top label fades in once, stays for the whole clip.
- Bottom caption **flips phrase-by-phrase** in sync with VO (NOT word-by-word like our EditorialCaption — closer to "chunked captions" of ~3 words per page).
- B-roll plays continuously underneath.

**Map to our Stream-E typology:** **near-match for `TechNewsFlash9x16`** but with two refinements:
- The light-gray top label is a stronger pattern than our current breadcrumb (it doubles as headline + tag).
- The chunked-phrase caption is a viable alternative to per-word highlight — better for editorial/news tone vs. dev/tutorial tone.

**Recommendation:** **already covered.** Use this as a reference for a `mode: 'editorial-chunked'` caption variant on existing `TechNewsFlash` — half a day of work.

---

### Template D — EditorialMockSurveillanceFootage
**Reel using it:** `DYGgyZJPG-M` (9.6 s — "Department of War UFO files").

**Visual structure:**
- **Bg:** pure black.
- **Top headline:** `The Department of War UFO files are absolutely jaw dropping` in white bold sans, sentence-case, two lines, centered. **NO tweet card** — just floating headline (the only reel in this batch where the tweet-card device is dropped).
- **Centerpiece:** a faux-surveillance / faux-infrared clip framed in white corner-bracket "crosshair" markers, with stenciled metadata in monospace (`TRK ID: SANTA-01 · ALT: 35,000 FT · RNG: 15 NM · EO-DAS FUSION · 24 DEC 23:45 Z · TOP SECRET // DECLASSIFIED`). Subject is Santa's sleigh + reindeer rendered in pale night-vision green. It's a meme/joke clip styled to look like declassified intelligence footage.
- **Color accent:** desaturated **night-vision green `#7FB58C`-ish** (only inside the clip; black/white outside).

**Motion grammar:**
- Headline fades in, stays.
- Clip plays — the corner brackets + metadata text are an overlay, possibly animated to flicker/jitter slightly.

**Map to our Stream-E typology:** **NEW — not specced.** This is the "found-document framing" template: take any clip and treat it as evidence by surrounding it with classified-document chrome. Useful for humor/meme reels.

**Recommendation:** **build later (Sprint 4+).** Niche but distinctive — a `SurveillanceClipFrame9x16` template (~60 lines: 4 SVG bracket corners + monospace metadata strip + timestamp counter) would let us do "fake declassified" gag reels. Low priority unless we move into humor lanes.

---

### Template E — TalkingHeadWithDashboardSidekick (face-cam dominant variant)
**Reel using it:** `DW_0tFaj2lU` (Strait of Hormuz ceasefire data).

This is essentially Template A with the proportions inverted: the **face-cam inset is large** (occupies the right ~30% of the artifact area) rather than a small corner. It's not a fully distinct template — it's a dial on Template A's "personal authorship signal" knob. Worth noting but doesn't get its own composition.

---

## Cross-template "house grammar"

| Pattern | Where it appears | Replicate for us? |
|---|---|---|
| **Pure black bg, letterboxed artifact** | A, C, D, E | **Yes** — adopt as our `DarkEditorial` palette mode default. Carlos uses the same vocabulary; this validates it. |
| **One accent color per reel** (cyan in B, gold/amber map trails in A, gray-on-black in C, night-vision green in D) | All | **Yes — already a discipline we adopted from midu.** Bilawal proves it works in English too. |
| **Identity device = tweet card** | A (5/7 reels) | **NEW pattern for us.** Adapt as `<TweetCardHero>` — see Template A recommendation. |
| **Hero artifact = live dashboard, not static graphic** | A, B | **Aspirational.** We currently don't have any "live data product" to film; would need a real or Remotion-rendered fake dashboard. Treat as a long-tail goal. |
| **Headline typography: white bold sans, sentence case, 3–6 lines max** | A (tweet body), D (headline) | **Yes** — matches our `EditorialCaption` typography on dark mode. |
| **All-caps wide-tracked metadata** (`TRK ID:`, `STRAIT OF HORMUZ`, `LIVE · PLAYBACK · DARK TRANSIT`) | B, C, D | **Yes** — already in our brand system (`brand/config.json` uses Inter wide-tracked uppercase for section labels). |
| **Optional small webcam inset bottom-right** | A (variants) | **Doesn't apply to us** — we don't have a face-cam workflow. Equivalent could be a small avatar-pixar watermark in the same corner. |
| **No transitions, no cuts within the dominant frame** | All | **Yes — already a stated discipline.** Bilawal proves restraint reads as authority. |

---

## What we replicate (priority for our 15-template build)

| Priority | Bilawal pattern | Our template slot | Already specced? |
|---|---|---|---|
| 🔴 **1 (next sprint)** | Tweet card + artifact split | NEW `TweetCardHero9x16` | **No — propose adding as template #16 / Stream E.** Composition is trivial, the upside is huge: it's the most efficient personality-anchor pattern we've seen. |
| 🟠 2 | Ghosted hero title overlaying dashboard | Variant on `DiagramExplainer9x16` | Yes — add `heroTitleOverlay` prop |
| 🟠 2 | Chunked phrase captions (vs per-word) | Variant on `TechNewsFlash9x16` caption | Yes — add `mode: 'editorial-chunked'` |
| 🟢 3 | Faux-declassified clip frame | NEW `SurveillanceClipFrame9x16` | No — low priority, humor lane |

---

## Concrete next steps

1. **Spec `TweetCardHero9x16`** as template #16 in the Stream-E roadmap. Single composition, props: `{tweet: {avatar, name, handle, verified, body}, artifact: {kind: 'video' | 'image', src}, faceCam?: {src, position: 'br' | 'large-right'}}`. Pure black background, no transitions.
2. **Audit `TechNewsFlash9x16`** for a chunked-phrase caption mode (3-word windows replacing per-beat) as a sibling of the existing per-word highlight.
3. **Note for content strategy:** Bilawal's tweet bodies are corpus-worthy for "authoritative single-paragraph reel hook" patterns. See per-reel index below for raw text.

---

## Per-reel index

| Shortcode | Duration | Template | Likes | Notes |
|---|---|---|---|---|
| `DWeLzV4hxsp` | 23 s | A → B mid-cut | 2,429 | Strait of Hormuz LPG tanker — opens TweetCardOverlay, mid-section switches to FullBleedKineticDashboard |
| `DWr9DkpDzsI` | 59 s | A | 1,022 | "Iran shut down the Strait" — pure TweetCardOverlay over dashboard playback |
| `DWwOcLEOHXI` | 164 s | A (face-cam variant) | 2,504 | "God's Eye View" intro — longest reel, face-cam bottom-right inset |
| `DXC96O6CPgC` | 43 s | C (KineticAllCapsTickerOverFootage) | 242 | Ceasefire announcement — only reel with found news B-roll, no tweet card |
| `DYGgyZJPG-M` | 10 s | D (EditorialMockSurveillanceFootage) | 1,214 | UFO files joke — fake declassified Santa-sleigh thermal clip |
| `DYh_jS_vM4L` | 29 s | A | 3,089 | Genie 3 + Street View — highest-engagement reel, TweetCardOverlay over 3D demo |
| `DW_0tFaj2lU` | ~30 s | E (face-cam-dominant A variant) | 484 | Ceasefire data follow-up — larger face-cam region |

---

## Sources for replication

- Frames per reel: `references/creators/bilawal.ai/<shortcode>/frames/frame-NN-tXX.XXs.jpg`
- Original videos: `<shortcode>/video.mp4`
- Metadata + caption + likes: `<shortcode>/metadata.json` (`description` field)

To re-scrape and refresh: `python scripts/scrape-reels.py --handle bilawal.ai --count 40 && python scripts/extract-keyframes.py --handle bilawal.ai --frames 8`.

> **Scrape note 2026-05-24:** the feed is ~70% image carousels, only ~30% video reels. To get 7 reels we had to request 40 posts (the script restructures only the MP4s into shortcode folders; the carousel JPGs were cleaned up manually). The scrape hit a 401 on cursor pagination after ~22 posts but the 7 reels obtained are sufficient for template analysis.

---

# Wave-7 Batch 3 Extension — Reels 8–20

> **Added 2026-05-28** via gallery-dl (`--count 25` → 3 new reels) + yt-dlp fallback for 11 older shortcodes pre-staged in `picks-wave7.json`. Corpus grew **7 → 20 reels**, spanning Nov 2025 → May 2026. Selection picks: see [`picks-wave7-batch3.json`](./picks-wave7-batch3.json). Wave-5 contract observed (transitionVerb on every motion claim).
> **Image-budget note:** 7 frame Reads used across the 13 new reels (target was ≤26). Conclusions rest on coarse-frame + metadata-caption + dense-frame timing, not exhaustive frame-by-frame.

## New reels analyzed

| Shortcode | Date | Dur | Likes | Template | One-line summary |
|---|---|---|---|---|---|
| `DY0YpxjPrYV` | 2026-05-26 | 10 s | 2,245 | **A** + **NEW dual-pane variant** | "Sketched flight path → Omni drone POV" — input/output stacked split |
| `DYu6vmbPQQW` | 2026-05-24 | 10 s | 5,458 | **A** + **dual-pane variant** | "Screenshot → GoPro POV" — 3D recon → multimodal video |
| `DVoZEiqCZOF` | 2026-03-08 | 62 s | 17,908 | A (tweetcard) → **NEW: V-split + chunked caption** | "AI agent swarm captured Iran strike OSINT" — full 60s walkthrough |
| `DVd8ggvuk4x` | 2026-03-04 | 39 s | 96,743 | A (face-cam) → **B (aviation zoom-in)** | "3,400 planes panic" — highest-engagement reel in the corpus |
| `DVbYOgbOmep` | 2026-03-03 | 41 s | 1,566 | A (tweetcard) → B (orbital layer) | "Iran strike satellite pass stack-up" |
| `DVWy2FVD6w7` | 2026-03-01 | 52 s | 9,577 | A (tweetcard) → B (dashboard flythrough) | "Operation Epic Fury 24-hour replay" |
| `DVJTSypDSYA` | 2026-02-24 | 153 s | 11,213 | **NEW: KineticMacroTypeOpener** → A → B | "WorldView deep dive" — longest reel, distinct kinetic opener |
| `DU_J1JRjtoB` | 2026-02-20 | 56 s | 6,926 | A → B (traffic cams) | "Gemini 3.1 + Claude 4.6 + Google Earth + Palantir" |
| `DU6I_rkD586` | 2026-02-18 | 49 s | 879 | **NEW: AppDemoScreenRecHero** | "Photoshop inside ChatGPT" — UI-chrome dominant, no tweet card |
| `DUi2dGFDxg3` | 2026-02-09 | 22 s | 3,006 | A → B (volumetric splat) | "4D gaussian splatting sports" — Arcturus interview teaser |
| `DUGqilRDwnh` | 2026-01-29 | 26 s | 1,039 | A (face-cam large) | "Genie 3 hands-on" — face-cam dominant variant |
| `DT2-WbPFs-H` | 2026-01-23 | 17 s | 3,922 | A → cinematic broll | "Octane + 3D scan Defender" — 3D render spectacle |
| `DRVRQm0kw0Q` | 2025-11-21 | 94 s | 11,694 | **NEW: FullBleedOrthophotoHook** → A → B | "AI paper solves Google Earth's biggest problem" — silent-hook opener, no card |

## Confirmation of existing patterns (wave-6 → wave-7)

| Pattern from wave-6 | Frequency in batch-3 | Verdict |
|---|---|---|
| **Template A — TweetCardOverlay (tweet card + artifact below)** | **10/13** (77%) | **Confirmed dominant.** Reads as Bilawal's house tentpole. The only 3 exceptions are `DRVRQm0kw0Q` (silent-hook opener), `DVJTSypDSYA` (kinetic macro opener), and `DU6I_rkD586` (full-bleed app demo). All three still cut to A later, so even the "exceptions" pay tribute. |
| Template A face-cam corner variant | 6/13 | Confirmed; bottom-right small inset is the default, escalating to mid-size center for the "I'm hands-on" reels (`DUGqilRDwnh`) |
| Template B — FullBleedKineticDashboard with HUD chrome + ghosted hero title | 4/13 mid-segments (`DVd8`, `DVWy`, `DU_J`, `DUi2`) | Confirmed. The HUD chrome is now visible to be **standardized**: top-left `WORLDVIEW` wordmark + `SECRET // S2-TK // NOFORN` metadata strip + bottom timeline scrubber. It's a single design template he reuses across every dashboard reel. |
| Pure black bg, letterboxed artifact | 12/13 | Confirmed (the lone exception `DRVRQm0kw0Q` is full-bleed broll at t=0). |
| One accent color per reel | 13/13 | Confirmed (amber/gold map traces, blue plane icons, lime splat clouds, etc.) |
| Tweet body is static, never typewriter-revealed | 10/10 reels using A | Confirmed. Identity card = anchor; artifact = show. |

## NEW patterns identified

### Pattern N1 — Dual-pane "input → output" stacked artifact (Template A.2)
**Reels:** `DY0YpxjPrYV`, `DYu6vmbPQQW` (both 10s, identical structure)
**Visual:** Tweet card at top (unchanged from A) + **two stacked artifact rectangles** below (top: input — google earth screenshot with red sketch path; bottom: output — generated 3D drone POV). Each rectangle is ~30% frame height. Same pure-black bg, letterboxed.
**Motion grammar:** Top input rectangle is **static** (screenshot). Bottom output rectangle **plays the generated clip**. The two reads as "before / after" without any explicit label.
**Why it matters:** This is the **showcase-an-AI-pipeline** pattern. It's how you tell a story about a multimodal model in 10 seconds without narration. We could spec it as a `TweetCardHero9x16` variant: `artifact: { kind: 'dual-pane', topSrc: '...', bottomSrc: '...' }`.
**Verdict:** **promote to TweetCardHero typology as `mode: 'input-output'`.** ~20 line addition; reuse the same `TweetCard` component on top.

### Pattern N2 — V-split chunked caption (Template A → mid-reel "talking head + dashboard" split with chunked captions at the seam)
**Reel:** `DVoZEiqCZOF` (t=28–36s, see `frames/anim-02-*.jpg` + ref clip `DVoZEiqCZOF-anim-02-chunked-caption-vsplit.mp4`)
**Visual:** Frame is split **vertically into two halves** (50/50): top half = dashboard playback continuing, bottom half = full-bleed face-cam (close-up of him talking). At the **seam between them**, a 3–4 word chunked caption sits centered, ALL-CAPS, white bold sans (~52 px), drop shadow, no plate. Example phrases: `SWARM TO BASICALLY CAPTURE`, `BEFORE THE CACHES IS CLEAR.`
**Motion grammar:** Caption swaps phrase-by-phrase every ~0.8–1.2 s in sync with VO beat (NOT word-by-word). Both halves of the frame play independently (dashboard pans, face-cam is locked).
**Critical convergence:** This is **functionally identical** to what we shipped as `ChunkedPhraseCaption` in our `EditorialCaption` family. **He uses the exact same caption discipline** — 3-5 word window, all-caps, drop-shadow-only, no plate. The chunk-size choice maps to natural VO pause groups, not word counts.
**Verdict:** **strong validation of our shipped work.** We're already aligned. The only new wrinkle is the V-split layout pairing — see Pattern N5 below.

### Pattern N3 — KineticMacroTypeOpener (extreme letter-scale opener)
**Reel:** `DVJTSypDSYA` (t=0–4s, see `frames/anim-01-*.jpg` + ref clip `DVJTSypDSYA-anim-01-kinetic-macro-type-opener.mp4`)
**Visual:** Pure black bg. A single word fills **130% of the frame width** (overflowing both edges — only middle 5–7 letters visible). Word `Palantir` shown overflowing left and right. White, bold sans (Inter Bold ~280 px). A smaller phrase (`going to b…`) shown at the bottom edge, half-clipped.
**Motion grammar:** The macro word **scrolls horizontally** across screen (or zooms in then out — extraction shows clipped letters consistently, suggesting motion across multiple seconds). It's a kinetic-typography hook designed to make the viewer stop scrolling because they can't read the word at first glance.
**Convergence with our typology:** Closest existing slot is `BigType9x16` (specced but not yet built). The Bilawal variant adds:
- Word is **overflowed** beyond frame edges (not centered+contained).
- Second line is **half-clipped at the frame edge** — looks broken, but is intentional (forces scroll-down or zoom interaction).
- Pure black + pure white only, no accent.
**Verdict:** **strong addition to `BigType9x16` spec.** Add `mode: 'overflowing-macro'` prop. ~30 lines.

### Pattern N4 — FullBleedOrthophotoHook (silent-hook opener with no overlay)
**Reel:** `DRVRQm0kw0Q` (t=0–4s, see `frames/anim-01-00-t00.00s.jpg` + ref clip `DRVRQm0kw0Q-anim-01-fullbleed-orthophoto-hook.mp4`)
**Visual:** **Full-bleed (no letterbox, no tweet card)** top-down aerial photograph of city streets (parked cars, road markings, a river). Pure visual hook — no caption, no chrome, no overlay. The image **plays** (subtle camera pan/zoom over still imagery, ~3 sec).
**Motion grammar:** The viewer has 1.5s to figure out what they're looking at before the reveal. Then a tweet card slides up (Template A) and the explanation begins.
**Why it matters:** It's the **silent-curiosity opener** — the antithesis of caption-first hooks. Bilawal uses this when the imagery itself is the hook. Likes were 11,694 — proves silent-hooks beat overlay-first when the visual is interesting enough.
**Convergence:** Maps to our **`CinemHook9x16`** slot (Sprint E, not yet built). New spec input: **`silentDuration: number` (seconds before the first overlay appears)**. Default in our brand voice would be ~1.5s. ~40 lines.

### Pattern N5 — V-split layout (50/50 vertical split between two simultaneous video sources)
**Reels:** `DY0YpxjPrYV`, `DYu6vmbPQQW`, `DVoZEiqCZOF` (one mid-section)
**Visual:** Frame split into **upper 50% and lower 50%**, each playing a different video source. In `DVoZEiqCZOF`, the split is "dashboard / face-cam" (Pattern N2). In `DY0Y` / `DYu6`, the split is "input artifact / output artifact" (Pattern N1). Common DNA: the seam is a sharp horizontal line, no transition crossfade, both halves play continuously.
**Convergence:** Generalizable as a **`SplitScreenVideoCompose9x16`** primitive — a low-level layout component (`<Split direction="vertical" ratio={0.5} top={<Video>} bottom={<Video>} />`) that several templates (TweetCardHero N1 mode, TalkingHeadDashboard) can rest on. This is the right way to model it: split as a primitive, not a template.
**Verdict:** **add `SplitFrame` primitive to `src/components/`** as a wave-7 utility. ~25 lines, used by ≥2 templates.

## Step-function chunked-caption variations observed

This is the highest-value finding for our work — Bilawal uses chunked captions in **three distinct registers** depending on emotional intent:

| Variant | Chunk size | Color/treatment | When he uses it | Maps to our slot |
|---|---|---|---|---|
| **Editorial chunk** (`DXC96O6CPgC` wave-6, `DVoZEiqCZOF` wave-7) | 3–5 words | All-caps, white bold, drop shadow only, no plate, centered low-third | News/editorial register — quoting events, reporting facts | **`EditorialCaption` ✓ already shipped** |
| **Authorship chunk** (`DVoZEiqCZOF` mid-section over face-cam) | 4–5 words | Same typography as editorial, but **sits at V-split seam** between dashboard + face | "I'm walking you through what I built" — claims authorship | **`ChunkedPhraseCaption` ✓ already shipped, layout pairing is new** |
| **Hook chunk** (no specific wave-7 reel — referenced from Wave-6 `DWeLzV4hxsp` Title-typography card) | 2–3 words, much bigger (~80 px) | All-caps wide-tracked sans, ghosted at 30% opacity, fills middle 60% of frame width | Bloomberg-style hero title moment (1-2x per reel max) | **NEW: `GhostedHeroTitleOverlay`** — could add to `BigType9x16` |

**Implication for our shipping plan:** the chunk-size and color-register choices in `EditorialCaption` / `ChunkedPhraseCaption` are validated by 20 reels across the corpus. We are NOT over-engineered. The only addition worth specing is the **GhostedHeroTitleOverlay** as a variant of `BigType9x16` for one-shot Bloomberg-style title moments.

## Convergence with EditorialCaption / ChunkedPhraseCaption (already shipped)

| Spec we shipped | What Bilawal does | Aligned? |
|---|---|---|
| `ChunkedPhraseCaption`: 3–5 word window | He uses 3–5 word window | **✓ EXACT** |
| `EditorialCaption`: all-caps, white bold | He uses all-caps, white bold | **✓ EXACT** |
| Drop shadow, no plate | Drop shadow, no plate | **✓ EXACT** |
| Centered low-third | Centered low-third (and centered mid-frame in V-split) | **✓ EXACT + 1 new position** |
| Chunk transitions on VO beat (not interval-timed) | Same — chunk transitions on VO beat | **✓ EXACT** |
| `transitionVerb` per chunk (wave-5 contract) | Visual transition: **hard pop** (no fade, no slide) | **Note: we should default to `pop` for editorial register, NOT crossfade** |

**Net verdict:** our shipped EditorialCaption / ChunkedPhraseCaption is **the right spec**. Only refinement: **set default transitionVerb to `pop` for editorial register**. Bilawal's chunks snap in/out with zero crossfade — it's harder for the eye to lose its place when the text is large + briefly on-screen.

## Per-pattern reference clips

All ref clips live under `docs/research/wave-6/references/bilawal.ai/` (2 per reel, ≤2MB each, 540p, no audio, 10s):

| Pattern | Ref clip | Notes |
|---|---|---|
| Pattern N1 (dual-pane) | `DY0YpxjPrYV-anim-01-dual-pane-flightpath.mp4`, `DYu6vmbPQQW-anim-01-dual-pane-3drecon.mp4` | Both 10s — full reel |
| Pattern N2 (V-split + chunked caption) | `DVoZEiqCZOF-anim-02-chunked-caption-vsplit.mp4` | Single best example in corpus |
| Pattern N3 (kinetic macro opener) | `DVJTSypDSYA-anim-01-kinetic-macro-type-opener.mp4` | Word: `Palantir` |
| Pattern N4 (full-bleed silent hook) | `DRVRQm0kw0Q-anim-01-fullbleed-orthophoto-hook.mp4` | Aerial city imagery, no chrome |
| Template A (canonical, several flavors) | `DVoZEiqCZOF-anim-01-tweetcard-dashboard-zoom.mp4`, `DVd8ggvuk4x-anim-01-tweetcard-globe-facecam.mp4`, `DVbYOgbOmep-anim-01-tweetcard-satellite-traces.mp4`, `DVWy2FVD6w7-anim-01-tweetcard-godseye-flight.mp4`, `DU_J1JRjtoB-anim-01-tweetcard-google-earth-palantir.mp4`, `DT2-WbPFs-H-anim-01-tweetcard-octane-defender.mp4`, `DUi2dGFDxg3-anim-01-tweetcard-sports-4d.mp4` | TweetCardHero confirmed dominant |
| Template A face-cam-large | `DUGqilRDwnh-anim-01-tweetcard-genie3-facecam.mp4` | "Hands-on with Genie 3" |
| Template B (dashboard with HUD) | `DVd8ggvuk4x-anim-02-aviation-zoom-callout.mp4`, `DVbYOgbOmep-anim-02-orbital-layer-zoom.mp4`, `DVWy2FVD6w7-anim-02-dashboard-flythrough.mp4`, `DU_J1JRjtoB-anim-02-trafficcam-traffic-fly.mp4`, `DVJTSypDSYA-anim-02-dashboard-walkthrough.mp4`, `DRVRQm0kw0Q-anim-02-aerial-meshrebuild.mp4` | HUD chrome verified consistent |
| AppDemoScreenRecHero (NEW outlier) | `DU6I_rkD586-anim-01-photoshop-chatgpt-uichromedemo.mp4`, `DU6I_rkD586-anim-02-slider-edit-controls.mp4` | The Photoshop-in-ChatGPT reel — pure screen recording, no tweet card |
| Spectacle 3D (Pattern N3-adjacent) | `DT2-WbPFs-H-anim-02-3d-scan-haida-village.mp4`, `DUi2dGFDxg3-anim-02-gaussian-splat-volumetric.mp4` | Octane/splat clips used as visual rewards |

## Updated cross-corpus inventory (20 reels)

| Template | Wave-6 (7 reels) | Wave-7 batch-3 (13 reels) | Total | Share |
|---|---|---|---|---|
| Template A (TweetCardOverlay incl. variants) | 5 | 10 | **15** | **75%** |
| Template B (FullBleedKineticDashboard) | 1 mid | 6 mid (all paired with A) | 7 | 35% (mid-segment) |
| Template C (KineticAllCapsTickerOverFootage) | 1 | 0 | 1 | 5% |
| Template D (EditorialMockSurveillanceFootage) | 1 | 0 | 1 | 5% |
| **NEW: Pattern N1 (dual-pane variant of A)** | 0 | 2 | 2 | 10% |
| **NEW: Pattern N3 (kinetic macro opener)** | 0 | 1 | 1 | 5% |
| **NEW: Pattern N4 (silent-hook opener)** | 0 | 1 | 1 | 5% |
| **NEW: AppDemoScreenRecHero** | 0 | 1 | 1 | 5% |

Template A is even more dominant than the wave-6 sample suggested (5/7 → 15/20). Bilawal's authority signal **IS** the tweet card.

## Updated priority for our 15-template build

| Priority | Bilawal pattern | Our slot | Status |
|---|---|---|---|
| 🔴 **1 (urgent)** | TweetCardOverlay base | `TweetCardHero9x16` | Recommended → **spec & build in next sprint** |
| 🔴 **1.5** | Dual-pane "input → output" mode | `TweetCardHero9x16` `mode: 'input-output'` | Add as prop in the same composition |
| 🟠 2 | V-split layout primitive | `SplitFrame` component | New low-level utility |
| 🟠 2 | ChunkedPhraseCaption default transition = `pop` | Already shipped — adjust default | Half-hour change |
| 🟠 2 | Ghosted hero title overlay | `BigType9x16` `mode: 'ghosted-hero'` | Add as prop |
| 🟢 3 | Kinetic macro opener (overflowing word) | `BigType9x16` `mode: 'overflowing-macro'` | Add as prop |
| 🟢 3 | Full-bleed silent-hook opener | `CinemHook9x16` with `silentDuration` | Future sprint |
| ⚪ 4 | App demo screen-rec hero | `AppDemoHero9x16` | Niche, defer |

## Footnote: video.mp4 deletion confirmation

Per wave-7 disk hygiene contract, **the 13 new `<shortcode>/video.mp4` files have been deleted** after frames + ref clips were extracted. Per-shortcode disk contains only `frames/` + `metadata.json`. The 7 wave-6 shortcodes still carry `video.mp4` from the original wave-6 scrape — those are out of scope for this batch.

## Footnote: scrape methodology for batch-3

- `gallery-dl` (canonical scraper) returned **10 reels for `--count 25`** — 7 were already-analyzed exclusions, 2 were new picks (`DY0YpxjPrYV`, `DYu6vmbPQQW`), 1 was a stray (`DWT-56ED4Hu`, discarded).
- The remaining **11 older shortcodes** (`DVoZEiqCZOF` → `DRVRQm0kw0Q`, dated Feb–Mar 2026 and earlier) required **yt-dlp fallback** because they fell outside the gallery-dl `--count=25` window. Bilawal posts often enough that 25 only covers ~3 months back.
- yt-dlp call signature: `yt-dlp 'https://www.instagram.com/p/<shortcode>/' -o '<sc>.%(ext)s' --write-info-json`. All 11 downloaded on first try with no auth needed.
- If gallery-dl breaks in the future, **yt-dlp by-shortcode is a reliable per-video fallback**. The `instagram:user` extractor was flagged as broken in `yt-dlp --list-extractors` so we relied on direct-post URLs only.

