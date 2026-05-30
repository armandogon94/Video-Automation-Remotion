# Bilawal.ai — Vote 1: Templates

**Voter:** V1 — Templates lane
**Creator:** @bilawal.ai (Bilawal Sidhu, ex-Google PM / spatial AI commentator)
**Corpus:** 7 reels × 8 frames = 56 frames sampled (min 15 covered, all 7 reels)
**Method:** frame-by-frame visual diff across `references/creators/bilawal.ai/*/frames/`
**Anchor doc:** `docs/research/E-15-template-typology.md` (our 15-template typology, Stream E)

> Do not blur reels — each reel maps to ONE template instance, and the framing/layout deltas between reels are the load-bearing signal. Three distinct templates emerged across the 7 reels.

---

## Template T-1 · "TweetHook + ScreenRec + PresenterPiP" (signature)

**Reels using it (3/7):** `DW_0tFaj2lU`, `DWeLzV4hxsp`, `DWwOcLEOHXI` — all three are Strait-of-Hormuz God's-Eye-View deep-dive reels (Mar–Apr 2026, 484–2,504 likes each).

**Visual structure** (HIGH confidence — identical layout across all 3 reels, all 24 sampled frames):
- Pure black canvas (`#000000`), 9:16 (1080×1920).
- **Top third (~y=200→y=560):** Tweet-style header — circular avatar (~96px) at left, bold white "Bilawal Sidhu" + blue verified checkmark, dimmer gray `@bilawalsidhu` handle, then a 3–5 line white sans-serif body caption (matches Twitter/X "Chirp"-like font, ~52px). Caption is **static for the full reel duration** — it's the hook, not a transcript.
- **Middle band (~y=580→y=1450):** A 16:9 letterbox of a desktop screen recording of Bilawal's custom "Strait of Hormuz God's Eye View" dashboard — multi-panel data viz on a dark canvas (left rail = KPI strip with `126.3 / 9.8 / -92.2%`, center = live animated map with vessel arrows + chokepoint overlay, right rail = selected-vessel detail card, bottom = scrubbable timeline with colored event dots).
- **Bottom-right of the screen-rec band:** small live webcam PiP of Bilawal (head-and-shoulders, beard, microphone visible) — present in `DW_0tFaj2lU` and `DWwOcLEOHXI`, **absent in `DWeLzV4hxsp`** (which is the same template with the PiP toggled off — same hero layout otherwise).
- Bottom ~470px is empty black (TikTok/IG UI safe zone).
- The final beat sometimes swaps the screen-rec for a referenced web article (BBC News article in `DW_0tFaj2lU` frame-07) — "proof drop" outro.

**Motion grammar** (MED confidence — inferred from 8-frame samples, not real-time playback):
- Header is locked / does not animate (no kinetic typography).
- Map is the motion engine: time scrubs forward, vessel arrows move, KPI numbers tick over (each sampled frame shows different timestamp + different KPI values: `FEB 27` → `APR 04` → `APR 08`).
- Right-rail "selected vessel" card swaps content as different ships are highlighted.
- Timeline dots at bottom act as a progress/chapter strip.
- Slight subtle scale/zoom on the screen-rec band between segments (the letterbox crop changes ~3–5% across frames, suggesting Ken-Burns-ish push).
- No big transitions — the screen recording IS the show.

**Map to our 20+ Stream-E typology:** **Hybrid — extends `TutorialMicro` (complexity 4)** with a fixed "tweet-style hook header" wrapper. Closest existing template is `TutorialMicro` (screen recording + overlay), but the persistent X-style header is novel for us. NOT covered by `TweetCardHero9x16` (which is a static tweet card, no embedded screen recording). **Propose new template: `TweetHookTutorial`** — top-anchored static tweet card + bottom screen-rec band + optional presenter PiP corner.

**Sprint priority: 🟠 MED.** This is Bilawal's highest-volume format (3 of his 7 sampled reels use it, 484/2429/2504 likes — solid mid-tier on his sample). But it requires a real working screen recording as input asset — we don't currently have a Strait-of-Hormuz-equivalent app to record. Build the *shell* (tweet header + 16:9 letterbox slot + PiP corner) so any future screen-rec or B-roll can drop in. Pair with our existing `TweetCardHero9x16` aesthetics for the header. Defer the screen-recording-asset side of the pipeline until a real story demands it (e.g. a Claude/Gemini live-demo reel we record from our own screen).

**Why not just reuse `TweetCardHero9x16`?** Our existing tweet-card template is full-bleed (card fills the safe area); Bilawal's version uses the tweet card as a **persistent top-anchored header** while the body of the reel is a live screen recording. The two compositions overlay rather than substitute. That's the new piece.

---

## Template T-2 · "Talking-Head + DataViz B-roll cutaway" (long-form essay)

**Reels using it (2/7):** `DWr9DkpDzsI` (1,022 likes, ~60s), `DXC96O6CPgC` (242 likes, ~43s). Both are Strait-of-Hormuz reels (a fourth in the series), but framed as essay/explainer not dashboard-tour.

**Visual structure** (HIGH confidence):
- 9:16, edge-to-edge — **no letterboxing, no tweet header.**
- Default shot is **full-bleed extreme close-up talking head** of Bilawal (waist-up, sometimes face-only, slightly blurred background workshop, on-axis ring-light, large foreground mic visible). Filmed vertical-native (not horizontal cropped).
- **B-roll cutaways every ~5–10s** that fully replace the talking head (no PiP):
  - `DWr9DkpDzsI` cutaways = his own data viz (ASCII-textured globe with satellite IDs `SAT-17988 / SAT-22230 / SAT-25876`, the same Strait-of-Hormuz map but isolated/fullscreen with kinetic-typography title `STRAIT OF HORMUZ` overlaid in thin tech-mono font).
  - `DXC96O6CPgC` cutaways = real-world news B-roll (Iran delegation arriving in Pakistan, ceasefire footage, faces mosaic-blurred in places).
- **Caption layer** runs throughout — bottom-centered white karaoke captions, 1–4 words at a time, all-caps Inter-style bold (`SO A FEW WEEKS AGO,` / `OPERATIONAL PICTURE` / `WHAT'S GOING ON.` / `LATEST OPEN SOURCE`).
- **`DXC96O6CPgC` adds a secondary upper-third caption** — small gray all-caps "context line" (`IRAN DELEGATION ARRIVES IN PAKISTAN FOR CEASEFIRE TALKS.`) sitting above the B-roll while the lower karaoke caption continues. Dual-layer caption system.

**Motion grammar** (MED confidence):
- Cuts are hard / J-cuts (presenter audio continues over B-roll).
- Captions are word-by-word reveal (TikTok-style karaoke), NOT phrase-fade.
- B-roll on dataviz cutaways has its own internal motion (globe rotates, map pans, title text has staggered character-in animation visible in `DWr9DkpDzsI` frame-03's `STRAIT OF HORMUZ` glyph wipe).
- No fancy transitions between talking-head and B-roll — straight cuts.

**Map to our 20+ Stream-E typology:** This is **`TalkingHeadDynamic9x16` + `TutorialMicro` blended**. We already have `TalkingHeadDynamic9x16` (presenter + dynamic caption layer); what's missing is the **B-roll cutaway slot** with the dual-layer caption (upper-third gray "context" + lower karaoke). **Extend `TalkingHeadDynamic9x16`** with: (a) named B-roll segments timed against the transcript, (b) optional upper-third context-caption track, (c) clean hard-cut transitions.

**Sprint priority: 🔴 HIGH.** This is THE most copyable / lowest-asset-cost Bilawal pattern for our setup. We already shoot talking-head; adding B-roll-cutaway timing + the dual caption layer is a small extension of an existing template. The dual-caption pattern (gray top context-line + white bottom karaoke) is also a direct upgrade for our `TalkingHeadDynamic9x16` — it lets a single narration track carry **two information streams** (what the presenter is saying + what's on-screen as context) without splitting the frame. Build this first.

**Open question (LOW confidence):** in `DXC96O6CPgC` the gray upper-third caption (`IRAN DELEGATION ARRIVES IN PAKISTAN FOR CEASEFIRE TALKS.`) might be a chyron sourced from the B-roll itself (i.e. baked into the news footage) rather than a Bilawal-authored overlay. Need to inspect the video file directly to confirm — but assuming it's authored, treat it as a separate caption track in the data model.

---

## Template T-3 · "HookBanner + Single B-roll Reaction" (short-form one-shot)

**Reels using it (2/7):** `DYGgyZJPG-M` (~10s, 1,214 likes — UFO/Santa-radar bit), `DYh_jS_vM4L` (~30s, **3,089 likes — HIGHEST in the sample**, Genie 3 + Street View demo).

**Visual structure** (HIGH confidence):
- 9:16, **black-bar letterbox top AND bottom** (~280px top, ~700px bottom). The active video region is a 1080×~1080-ish band centered vertically (the source B-roll is 16:9 and centered without crop).
- **Top of active band:** a single static white sans-serif headline / "hook banner" centered, 2–3 lines, ~62px:
  - `DYGgyZJPG-M`: "The Department of War UFO files are absolutely jaw dropping"
  - `DYh_jS_vM4L`: "Wow! You can now simulate real world places by grounding Genie 3 experiences with Street View. Maybe GTA 7 will look more like this?"
- `DYh_jS_vM4L` adds the **Tweet header chrome (avatar + name + verified)** above the caption — it's a tweet-card variant of this template (HIGH confidence).
- Below the hook banner: a single 16:9 B-roll clip plays edge-to-edge of the active band:
  - `DYGgyZJPG-M`: thermal/IR Santa-radar parody footage with HUD overlays (`ANDURIL LATTICE / CLASSIFICATION: SECRET//NOFORN / TRK ID: SANTA-01 / ALT: 35,000 FT`).
  - `DYh_jS_vM4L`: cycling AI-generated Genie 3 demos (yellow runner in plaza, racoon-rider in park, autonomous boat under bridge) — each clip is a "prompt sample," with watermark `Genie 3 / Created using Google Street View imagery` at bottom.
- **No talking head, no presenter, no karaoke caption** — the hook caption is the entire copy. Mute-watchable in 2 seconds.

**Motion grammar** (HIGH confidence on `DYGgyZJPG-M`, MED on `DYh_jS_vM4L`):
- Hook caption is **static for the full reel** (8/8 frames identical in `DYGgyZJPG-M`).
- B-roll either (a) plays through once as a single clip (`DYGgyZJPG-M`, 10s — minor camera pan visible between frame-04 and frame-07) or (b) cycles through 3–5 prompt samples with hard cuts (`DYh_jS_vM4L`, ~30s, each frame shows a different scene).
- Letterbox bars do not animate.
- Total effort to author: caption text + 1 video file. Cheapest possible template per second of content.

**Map to our 20+ Stream-E typology:** Close to **`QuoteCard9x16`** + **`TechNewsFlash9x16`** — same "static hook over single asset" pattern, but the asset is a **B-roll video clip, not a static portrait/screenshot**. Tweet-header variant (`DYh_jS_vM4L`) overlaps with `TweetCardHero9x16` (which we already have) but adds a video slot below the card. **Propose new template: `HookBannerBroll`** (or extend `TweetCardHero9x16` to accept a video asset slot below the card body).

**Sprint priority: 🔴 HIGH.** This is the **highest-engagement format in the sample (3,089 likes on `DYh_jS_vM4L`, beating all the Hormuz reels)**, AND it's the cheapest to produce — one caption + one video file. Every time we have a new model demo, leaked clip, or "look at this wild AI output" moment from the W21 calendar, this is the format. Direct extension of templates we already have (`TweetCardHero9x16`, `QuoteCard9x16`). Build the `video-asset` slot variant this sprint.

**Asset-pipeline note:** the B-roll source is usually NOT something we shoot — it's a vendor demo (Genie 3 from Google), a leaked clip, a thermal-cam parody, etc. So this template needs a clean "drop in an external mp4" path with the safe-area letterboxing handled automatically (letterbox-to-9:16 with hook-banner zone reserved). That's a single Remotion `<Sequence>` + an `<OffthreadVideo>` wrapped in a centered band, plus our existing tweet/quote card components above.

---

## Cross-reel summary table

| Reel ID | Template | Likes | Duration | Tweet hdr | Screen rec | Talking head | B-roll | Karaoke caption | Hook banner |
|---|---|---|---|---|---|---|---|---|---|
| `DW_0tFaj2lU` | T-1 TweetHookTutorial | 484 | ~144s | ✓ | ✓ | PiP | – | – | – |
| `DWeLzV4hxsp` | T-1 (no PiP variant) | 2,429 | ~55s | ✓ | ✓ | – | – | – | – |
| `DWr9DkpDzsI` | T-2 TalkingHead+Broll | 1,022 | ~60s | – | – | full | dataviz | ✓ single | – |
| `DWwOcLEOHXI` | T-1 TweetHookTutorial | 2,504 | ~163s | ✓ | ✓ | PiP | – | – | – |
| `DXC96O6CPgC` | T-2 TalkingHead+Broll | 242 | ~43s | – | – | full | news | ✓ dual-layer | – |
| `DYGgyZJPG-M` | T-3 HookBannerBroll | 1,214 | ~10s | – | – | – | parody HUD | – | ✓ |
| `DYh_jS_vM4L` | T-3 + tweet-hdr variant | **3,089** | ~30s | ✓ | – | – | AI demos | – | ✓ |

**Pattern:** Bilawal runs three templates in rotation. T-1 is his "investigation deep-dive" workhorse (longest, most asset-heavy, mid engagement). T-2 is his "essay" mode (medium length, presenter-led, swings hard on engagement based on B-roll quality). T-3 is his "drop" mode (shortest, cheapest, **highest engagement**). He picks template by story-type, not by mood.

---

## Recommendations for our typology

1. **Add `TweetHookTutorial` (T-1)** as a new complexity-3 template — top tweet-card + screen-rec band + optional PiP corner. 🟠 MED priority (deferred until we have a screen-rec asset pipeline).
2. **Extend `TalkingHeadDynamic9x16`** with B-roll cutaway slots + dual-layer caption (upper gray context-line + lower white karaoke). 🔴 HIGH — direct extension of existing template, biggest immediate upside for our weekly cadence.
3. **Extend `TweetCardHero9x16` / `QuoteCard9x16`** to accept a video B-roll asset slot below the card (= T-3). 🔴 HIGH — cheapest format, best engagement in this sample, fits every "look at this AI demo" story-type in W21+.
4. **Standardize the karaoke caption renderer** (1–4 words, all-caps Inter-bold, bottom-centered, word-by-word reveal) across all three new template variants — Bilawal uses identical caption styling in T-2's dual-layer variant; making it a shared component avoids three forks.

## Confidence audit

- **HIGH:** All three template identifications (T-1, T-2, T-3) — confirmed across multiple frames per reel with clear layout deltas between templates.
- **HIGH:** The static-vs-dynamic split in each template (T-1 header static, T-3 banner static, T-2 captions dynamic) — verified by comparing frame-00 to frame-07 of each reel.
- **MED:** Specific motion details (cut timing, animation curves, J-cut behavior) — inferred from 8-frame samples, not real playback. Need to scrub video files to verify timing.
- **MED:** Whether `DWeLzV4hxsp` is really T-1-without-PiP or a separate template — leaning T-1-variant because the tweet-header + screen-rec band geometry is byte-identical to the other two.
- **LOW:** The dual-caption claim in `DXC96O6CPgC` — gray upper-third caption MAY be a baked-in news chyron rather than authored overlay. Flagged in T-2 section. Inspect video before committing to a dual-track caption data model.
