# @estebandiba ("El IAS") — visual + motion analysis

> **Creator:** Esteban — Spanish AI/video-tools educator. Mid-tier IG following. Niche: video-generation models (Gemini Omni, LTX HDR, Sora, Veo, etc.) reviewed in Spanish.
> **Scraped:** 2026-05-24 via gallery-dl. Feed is **carousel-heavy** — out of the 12 most recent posts requested, only **3 were video reels** (the rest were 6+ slide carousels). Subsequent pagination attempts returned **401 Unauthorized** from Instagram's `/api/v1/feed/user/...` endpoint, so the sample is locked at 3. Durations: 12 s, 27 s, 47 s. Aspect mix: two 9:16 (1080×1920) and one **1:1 (1080×1080)**.
> **Template-value verdict:** **MIXED — one HIGH-value template, two non-design "format" reels.** The originally-pitched "cream-bg news-card" pattern from CREATORS.md candidate-pool notes was **NOT observed** in this 3-reel sample (likely lives in his carousel posts, which we don't scrape). What we DID get is one extremely on-brand cinematography-tool template + two A/B demo reels that lean on raw footage instead of motion graphics.

The headline finding: Esteban is **not a "many-template" creator** in the carloscuamatzin mold. He runs a **content-format** (AI video-tool review in Spanish) where the reel's design load depends on whether he's demoing the tool (low design, raw split-screens) or framing the announcement (high design, the cinematography-card template). One of those three modes is genuinely reusable for us.

---

## Templates observed

### Template A — CinematographyHUDCard (1/3 reels, HIGHEST design value)
**Reel using it:** `DYnF97hiZpJ` (27 s, 1:1 square) — "LTX HDR ya está aquí" launch reel.

**Visual structure (full-frame, 1080×1080):**
- **Bg:** flat **electric blue `#1A6FE8`-ish** (single saturated color, no gradient, no noise).
- **Top edge — faux camera HUD labels:** `FPS 24.000` (left), `SHUTTER 180.0` (center), `EI 800` (right). White sans-serif, small, evenly tracked. Reads like a Blackmagic / RED viewfinder overlay.
- **Left rail — exposure scale:** vertical EV ladder `2.0 / 1.0 / 0.0 / -1.0 / -2.0` in white sans.
- **Right rail — camera metadata stack:** `WB 5600K`, `T 2.8`, `ND 0.6`, `● REC` (red dot for REC). Stacked top→bottom.
- **Centerpiece — bracketed "monitor":** 16:9 video crop **framed by 4 white SVG corner brackets** (no full border — just corner markers). Inner video is the demo footage (DaVinci Resolve timelines, hiking shot, color scopes, etc.). Brackets size-lock to the inner crop.
- **Bottom-left — 3D clapperboard prop:** a rendered 3D black-and-white clapperboard sitting at a slight angle, labeled `LTX HDR / SCENE / TAKE 2.3 / ROLL`. Solid object, casts a soft shadow on the blue floor — suggests Spline or Blender export.
- **Bottom-right — headline + body type:**
  - Headline: `HDR ES AQUÍ` in **bold white condensed sans, all-caps, very large (~140 px)**.
  - Body: 2–3 lines, white regular sans (~36 px), sentence case: *"Del original al HDR LoRa. Menos compresión y más intención narrativa."*

**Motion grammar:**
- The HUD chrome (FPS/SHUTTER/EI/scale/WB/T/ND/REC, corner brackets, headline, clapperboard) is **completely static** for the duration. Zero animation on the frame.
- All motion lives **inside the bracketed monitor** — the inner crop cycles through demo clips (hiking shot → DaVinci comparison → black "HDR is here" title card → next demo) with hard cuts only.
- Inner video has its own internal text ("SDR to EXR Ready to grade", "HDR is here") that fades in/out — but those are part of the inner footage, not the outer composition.

**Map to our Stream-E typology:** **Strong NEW candidate.** Closest existing slots:
- Our `TechNewsFlash9x16` has the "headline + label" DNA but lacks the camera-viewfinder chrome and the bracketed inner-monitor frame.
- Our `SplitWebcamScreen9x16` shares the "video-inside-a-decorated-frame" idea but uses a webcam/screen-cap split, not a single bracketed monitor with HUD chrome around it.
- Bilawal's `TweetCardHero9x16` proposal is structurally similar (identity-card device on top + inner video below), but uses a tweet mockup instead of a camera-HUD chrome.

**Recommendation: ADD `ViewfinderHeroSquare1x1` (or `CinematographyHUDCard9x16`) as a template variant.** This is the most efficient pattern for **AI-tool launch reels** in our content lane — the chrome instantly signals "video / cinematography" and the bracketed inner monitor is a slot we can drop any demo MP4 into. Implementation is ~150 lines:
- Static `<AbsoluteFill>` with flat color bg.
- 4 SVG corner-bracket components positioned around an inner `<OffthreadVideo>` slot.
- Configurable label set: HUD top/left/right text strings (props).
- Headline + body slot bottom-right.
- Optional 3D-prop image asset bottom-left (clapperboard, microphone, lens, etc.) — `<Img>` with drop-shadow filter.
- Likely 1:1 by default with a 9:16 letterbox variant.

**Why this matters:** It's the **single most distinctive design pattern** in any reel we've scraped for the Spanish AI-creator lane, and it telegraphs "video/AI/professional" in <1 second. High authority signal ÷ effort.

---

### Template B — StackedSplitOriginalVsAI (1/3 reels, LOW unique design value)
**Reel using it:** `DYmdaniIglx` (47 s, 9:16) — "Gemini Omni" video-editing demo.

**Visual structure:**
- Frame is **vertically split into two equal panels** stacked top/bottom, separated by a thin black bar (~20 px black letterbox top, middle, bottom).
- **Top panel:** original handheld footage (selfie in grocery store, walking through aisles). Label `ORIGINAL` in **bold white sans, all-caps, top-left corner, ~50 px**, no background plate (heavy text shadow for legibility).
- **Bottom panel:** the same shot run through Gemini Omni (selfie face becomes a cow, grocery products labeled "Carne de Humano", herd of sheep appears in aisles). Label `Gemini Omni` in **bold white sans, sentence case** (note the case difference vs. the `ORIGINAL` label), same position/style.
- No accent color, no chrome, no logo, no caption track, no breadcrumb. The entire design IS the diff.

**Motion grammar:**
- Both panels play synchronized video — no animation on labels, no transitions between scenes within the panel (hard cuts), no zoom/pan.
- The "wow" is delivered by Gemini Omni doing the heavy lifting in the bottom panel.

**Map to our Stream-E typology:** **already covered.** This is essentially our `SplitWebcamScreen9x16` rotated 90° (horizontal-split → vertical-split) with the panel content swapped from "webcam+screen" to "before+after". A `mode: 'stacked-comparison'` prop on `SplitWebcamScreen9x16` would handle it (~20 lines).

**Recommendation:** **already specced — add a stacked-comparison mode.** Not a new template. The pattern is generic and not specific to Esteban; carlos and midu also do horizontal split-screen comparisons.

**Honest call:** The reel's value is the AI-tool diff, not the design. If our brand is going to do "before/after AI demo" reels we'd lean on this layout — but it doesn't tell us anything we don't already know about motion-design composition.

---

### Template C — IGStickerCaptionRawFootage (1/3 reels, ZERO design value)
**Reel using it:** `DYreLDtoRN-` (12 s, 9:16) — "Feria de Córdoba flamingo costume" (Gemini Omni-generated character composited into real footage).

**Visual structure:**
- **Bg:** raw 9:16 phone footage of a Spanish feria at night (illuminated Mudéjar-style fairground arches + palm trees + crowds).
- **Caption:** Instagram-native **rounded-rectangle black pill** (slightly transparent, very high corner radius — looks identical to the IG Stories caption sticker), centered upper-third. White bold sans, sentence case, 3 lines: *"Me dijeron que tenía que ir de flamenco a la feria"*. A second pill appears later with the punchline *"Creo que no entendí el concepto…"*.
- No watermark, no logo, no accent color, no other chrome.

**Motion grammar:**
- Pill captions fade/pop in once per beat, stay static — no per-word animation, no progress bar, nothing.
- The flamingo character (AI-generated) is composited into otherwise-real festival footage. That compositing is the joke; the design is irrelevant.

**Map to our Stream-E typology:** **not applicable / out of scope.** This is the IG-native "phone-and-stickers" caption style. We deliberately don't build that — our `EditorialCaption9x16` is the upgraded version (paper plate + active-word color highlight) and is strictly better for any reel where we want to look produced rather than casual.

**Recommendation:** **do not replicate.** Useful as a reminder that even high-niche creators occasionally drop a pure-iPhone reel for tone reasons (humor, behind-the-scenes). For us, the equivalent would be an Armando-personality micro-reel — and we'd still use `EditorialCaption` rather than IG stickers to keep brand consistency.

---

## Cross-template "house grammar"

| Pattern | Where it appears | Replicate for us? |
|---|---|---|
| **Single saturated flat-color bg** (electric blue in A) | A | **Maybe** — we use cream/navy/gold. The electric-blue tactic only works if the brand color is bright/saturated. Worth a one-off accent-mode for "tool launch" reels. |
| **Bracketed inner monitor** (4 corner SVG brackets around a video crop) | A | **Yes** — universal device, cheap to build, signals "viewfinder/screen/spotlight". |
| **Faux camera HUD chrome** (FPS/SHUTTER/EI/EV-ladder/WB/T/ND/REC) | A | **Yes for video-tool reels** — adds instant cinematography authority. Probably ONE prop set, not a regular pattern. |
| **3D rendered prop in corner** (clapperboard) | A | **Optional / aspirational** — requires Spline/Blender asset pipeline. Defer; substitute with a flat SVG icon if needed. |
| **Stacked split-screen ORIGINAL / Gemini Omni labels** | B | **Yes — already in `SplitWebcamScreen9x16` scope** with a stacked-comparison mode addition. |
| **IG-sticker rounded-pill caption** | C | **No** — we use `EditorialCaption9x16` (paper plate + active-word highlight). Strictly better for our brand. |
| **No watermark on any of the 3 reels** | A, B, C | **Diverges from us** — our brand bakes in the avatar-pixar watermark. Keep ours; Esteban's no-watermark choice is a personal-brand call we don't follow. |
| **Spanish copy: short headline + 2-line subtitle pattern** | A (and his carousel covers per CREATORS.md) | **Yes — matches our voice.** "HDR ES AQUÍ" + "Del original al HDR LoRa. Menos compresión y más intención narrativa." is exactly the cadence Armando uses. |

---

## What we replicate (priority for our 15-template build)

| Priority | Esteban pattern | Our template slot | Already specced? |
|---|---|---|---|
| 🟠 **2** | CinematographyHUDCard with bracketed inner monitor + 3D prop | NEW `ViewfinderHeroSquare1x1` (and 9:16 variant) | **No — propose adding.** Niche but high authority for AI-video-tool reels. |
| 🟡 3 | Stacked vertical split-screen (ORIGINAL / AI) | Variant on `SplitWebcamScreen9x16` | Yes — add `mode: 'stacked-comparison'` (~20 lines) |
| ⚫ — | IG-sticker caption pills on raw footage | — | **Skip.** Inferior to our `EditorialCaption`. |

---

## Concrete next steps

1. **Spec `ViewfinderHeroSquare1x1`** as an optional Stream-E template, scoped to "AI video-tool launch" reels. Props: `{ bgColor, hudLabels: {fps, shutter, ei, wb, t, nd}, evScale: boolean, monitorSrc: video, headline: string, body: string, prop?: { src, position } }`. ~150 lines.
2. **Augment `SplitWebcamScreen9x16`** with a `layout: 'stacked-comparison'` mode and a `label: { top, bottom }` prop pair. Use Esteban's reel as the visual reference.
3. **Re-scrape `@estebandiba` in 1–2 weeks** with `--count 30` once Instagram's 401 cools down — the carousel-heavy feed suggests his "news-card" template (the original reason this candidate made the pool) lives in slides, not reels, so we should also consider running `17-Instagram-Slides/src/cli/scrape.ts` against him for slide-cover patterns.
4. **Content-strategy note:** Esteban's tool-review-in-Spanish niche is our exact lane. Even at 3-reel depth, his **launch-reel cadence** (HDR ES AQUÍ → 2-line subtitle → demo clips inside the chrome) is a directly copyable structure for Armando's next "modelo X ya está aquí" reels.

---

## Per-reel index

| Shortcode | Duration | Aspect | Template | Date | Topic |
|---|---|---|---|---|---|
| `DYnF97hiZpJ` | 27 s | 1:1 | A — CinematographyHUDCard | 2026-05-21 | LTX HDR launch — bracketed monitor + camera HUD + 3D clapperboard + "HDR ES AQUÍ" headline |
| `DYmdaniIglx` | 47 s | 9:16 | B — StackedSplitOriginalVsAI | 2026-05-21 | Gemini Omni video-editing demo — top "ORIGINAL" panel, bottom "Gemini Omni" with cows + meat-product relabeling |
| `DYreLDtoRN-` | 12 s | 9:16 | C — IGStickerCaptionRawFootage | 2026-05-23 | Feria de Córdoba flamingo-costume gag, also a Gemini Omni composite, IG-pill captions only |

---

## Sources for replication

- Frames per reel: `references/creators/estebandiba/<shortcode>/frames/frame-NN-tXX.XXs.jpg`
- Original videos: `<shortcode>/video.mp4`
- Metadata + caption: `<shortcode>/metadata.json` (`description` field)

To re-scrape and refresh (after 401 cooldown): `python scripts/scrape-reels.py --handle estebandiba --count 30 && python scripts/extract-keyframes.py --handle estebandiba --frames 8`.

> **Scrape note 2026-05-24:** Requested 12 posts; only 3 were video reels (others were 6-slide carousels). Subsequent retries with `--count 30` and `--range 13-25` hit `401 Unauthorized` on `/api/v1/feed/user/4447058633/?count=30` — Instagram rate-limited the IP after the first successful pull. Waited 3 min and 2 min between retries; the 401 persisted. Three reels is enough to identify Template A as a high-value addition; broader template inventory (especially the cream-bg news-card pattern hypothesized in the candidate pool) will require a re-scrape from a clean session and/or a slide-scraper pass against his carousel posts.
