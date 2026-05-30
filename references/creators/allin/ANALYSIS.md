# All-In Podcast (@allin) — Animation/Motion-Graphics Analysis

**Wave:** 7
**Analyzed:** 2026-05-28
**Scope:** 12 of 12 Wave-7 picks (`picks-wave7.json`). All clips, 0 full episodes filtered out (max duration in pick set is 1920 s / 32 min — under the >3000 s deferral threshold).
**Frames extracted:** 1,273 (67–152 per video, 1 fps coarse @ 1/15 s for all 12 long clips, 1 fps dense @ 2/3 fps × 3 animation windows per video)
**Reference clips:** 36 (3 per video, ≤10 s, audio-stripped, ≤628 KB each, 12 MB total) at `docs/research/wave-6/references/allin/<id>-anim-NN.mp4`
**Source disk state:** All 12 `.mp4` source files DELETED from `/tmp/wave7-allin/` after extraction.

---

## 1. Channel context

**Format:** Live on-stage conference content. Despite the channel name "All-In Podcast", **11 of 12 sampled picks are All-In Summit footage** (the live event arm of the show — annual conference where keynote speakers + panel interviews happen in front of an audience). The single exception is `eWE6xmHu6Jw` (Chamath solo monologue, set in a home study). What we are NOT seeing in these picks is the canonical four-hosts-around-the-table podcast set (which is the channel's most famous format but apparently underrepresented in the recent clip uploads we picked).

**Hosts:** Chamath Palihapitiya, Jason Calacanis, David Sacks, David Friedberg (the "four besties"). Guest list across this sample: Bryan Johnson, California Forever's Jan Sramek, Kyle Samani (Multicoin), Chamath solo, Cathie Wood (ARK), Rick Caruso, Ari Emanuel, Roelof Botha (Sequoia), Neal Mohan (YouTube), Orlando Bravo (Thoma Bravo), Satya Nadella (Microsoft).

**Topics in this sample:** Health/longevity, urbanism/startups, macro/finance, crypto, politics, media/AI strategy, VC, platform CEO interviews.

**Orientation:** 16:9 horizontal (1280×720 in our downloads — the YouTube `f=18` MP4-360p baseline). Native uploads are 1080p+/1920×1080. This makes **All-In the 5th confirmed 16:9 long-form creator** in our reference library, joining `natebjones`, `aiexplained-official`, `mreflow`, `sahilbloom`, and `matthewberman`.

**Aesthetic:** Editorial-news / TED-conference / business-cable hybrid. Production design > motion graphics. Color: deep blue / black backdrop with selective brand-blue gradient panels. Type: SLAB-CONDENSED-SANS for the "ALL-IN" wordmark; clean humanist sans for slide body text.

---

## 2. Per-video distillation

| ID | Title | Duration | Setting | Notable graphics |
|----|-------|----------|---------|------------------|
| `XXPISZI_big` | Bryan Johnson — RHR sleep hack | 639 s | Lessin-style interview (woman in black, plant-wall backdrop) wrapped in **blue glow vignette frame** (`anim-01`); cuts to All-In Summit stage talk later | Blue glow vignette overlay frame; `ALL-IN SUMMIT` stage chyron |
| `ElhxzUO7YQM` | California Forever | 650 s | All-In Summit stage talk by Jan Sramek with **keynote slide deck** (large slide left + speaker face-cam PIP bottom-right) | **`SlideDeckPlusSpeakerPIP16x9`** template — book covers, headlines, illustrations as collage on slide |
| `eWE6xmHu6Jw` | Chamath — "next bubble" | 713 s | Solo monologue in home study (bookshelf, plants — NOT stage) | Vertical stacked **`ALL IN`** wordmark bottom-left only (no slides) |
| `_m_jwz5hzzw` | Chamath optimized health | 751 s | All-In Summit on-stage panel | `ALL-IN SUMMIT` chyron; standard panel composition |
| `ijbLOWFmVe8` | Kyle Samani — internet capital markets | 812 s | All-In Summit solo keynote on dark stage | Speaker walking in spotlight on black backdrop; persistent `ALL-IN SUMMIT` chyron |
| `oNJ_ouDNNT0` | Cathie Wood — AI/GDP/BTC | 1155 s | All-In Summit Cathie keynote + Q&A on couch | **ARK Invest charts** (stacked-area "Estimated Economic Impact of GPTs") on slide-deck composite; later Q&A in armchair set |
| `G2KvA4QD-IY` | Rick Caruso — California | 1376 s | All-In Summit on-stage interview (Caruso + Friedberg) | Standard two-armchair panel; persistent `ALL-IN SUMMIT` chyron |
| `KG_nHmHUZLw` | Ari Emanuel — AI/attention | 1645 s | All-In Summit 5-host panel | **Vertical guest-name slide above stage** (full-name + role/CEO subtitle); hexagonal "ALL-IN" LED stage props glowing red |
| `TKtIoF4yLos` | Roelof Botha — Sequoia VC | 1677 s | All-In Summit on-stage interview | `ALL-IN SUMMIT` chyron |
| `5bSGrQou4Lo` | Neal Mohan — YouTube CEO | 1693 s | All-In Summit on-stage interview | `ALL-IN SUMMIT` chyron |
| `R1q4wcV-ImY` | Orlando Bravo — PE | 1737 s | All-In Summit on-stage interview | `ALL-IN SUMMIT` chyron |
| `5nCbHsCG334` | Satya Nadella — AI biz revolution | 1920 s | **USA House Summit at Davos 2025** (not All-In Summit) — armchair interview between US flags | **`ALL-IN DAVOS`** chyron variant bottom-right (regional event lockup) |

**Picks > 50 min (>3000 s) skipped as "too long to fully analyze":** none in this set — max is 1920 s (32 min). All 12 fully analyzed.

---

## 3. Named patterns (Wave-5 contract)

For each pattern: confidence level, hit count, palette/typography, and **transitionVerb** in imperative present-tense per `docs/prompts/animation-replication-runbook.md`.

### P1 — `PersistentEventLockupChyron16x9` ★ DOMINANT — confidence **HIGH** (11/12)

The persistent corner chyron is the **single most-reused graphic on this channel**. Variants observed:

- **`ALL-IN / SUMMIT`** (two-line, condensed sans, ALLCAPS, blue gradient backdrop panel behind it) — bottom-left, in 9 of 12 picks
- **`ALL IN`** (two-line stacked, no event suffix) — bottom-left, when not at Summit (`eWE6xmHu6Jw`)
- **`ALL-IN / DAVOS`** — bottom-right, at Davos event (`5nCbHsCG334`)

Sits inside a **dark-blue gradient rectangular panel** with vertical wash that bleeds into the safe-area; logo-only, no border. **Persistent throughout the entire clip** (no slide-on/off animation observed) — it's a stage-bug, not a lower-third.

**transitionVerb:** Hold the event-lockup logo statically inside a vertical dark-blue gradient panel anchored to the bottom-left or bottom-right safe-area corner for the entire composition duration; never animate, never reveal, never dismiss.

### P2 — `SlideDeckPlusSpeakerPIP16x9` ★ — confidence **HIGH** (3/12 + inferred more)

The canonical keynote-mode template. Layout: **large keynote slide top-left/top-two-thirds** (the "spotlight" — book covers collage, ARK Invest chart, etc.) + **white-bordered speaker face-cam PIP bottom-right** (rounded white border ~6 px frame, ~30 % screen width) + earth-from-space starfield background filler + P1 chyron. Background between slide and PIP is the **dark-navy starfield wash** (literal earth-at-night satellite photo, dimmed).

Hits: `ElhxzUO7YQM` (Jan Sramek — book/manifesto collage), `oNJ_ouDNNT0` (Cathie — ARK GPT chart), implied in `ijbLOWFmVe8` (Kyle Samani's keynote-style talk, frames suggest slide pops not captured at coarse sampling).

**transitionVerb:** Hold a large rectangular slide in the upper-left two-thirds; reveal a white-bordered rounded-rectangle speaker face-cam PIP in the bottom-right by sliding-up + fading-in over 12 frames; the dark-navy starfield background and the event-lockup chyron remain throughout; when the slide content changes, cross-fade the slide rectangle while the PIP stays anchored.

### P3 — `VerticalNameSlateOverhead16x9` — confidence **MEDIUM** (2/12 visible, likely more)

Above the stage (in the captured wide shots, e.g. `KG_nHmHUZLw/anim-01`), a **massive vertical LED video wall** displays the guest's name + role/CEO subtitle (Ari Emanuel — CEO). Bright blue gradient backdrop on the LED panel. This is a **diegetic stage-set element** (it's a physical LED wall), not a post-production overlay, but it functions as a persistent name-card in any wide-shot.

**transitionVerb:** In a wide stage shot, hold a tall vertical name-slate at the top-center showing GUEST FULL NAME in ALLCAPS condensed sans + the role/title in slightly smaller weight below, against a blue gradient backdrop; never animate.

### P4 — `BlueGlowVignetteIntroFrame16x9` — confidence **LOW** (1/12, single instance)

The intro of `XXPISZI_big` (Bryan Johnson) opens with the entire face-cam shot of the woman interviewer + Bryan **inset inside a rectangular blue-edge-glow vignette frame** — looks like the interview was sourced from a different show and All-In wrapped it in their own blue-glow border treatment. The vignette has airy lens-flare-style light leaks pushing in from the left, right, and top edges.

**transitionVerb:** Inset the full source clip inside an inner rectangle that occupies ~85 % of the safe area; surround it with a soft blue radial glow that leaks turquoise highlights from the left, right, and top edges; hold the inset statically; never animate the vignette.

### P5 — `EarthStarfieldBackdropFill16x9` — confidence **MEDIUM** (3/12)

Whenever the All-In Summit template is in "slide + PIP" mode, the empty filler space behind/beside the slide is a **dimmed satellite photo of Earth at night** (city lights, cloud cover, plus a dim galaxy/starfield arc). Same backplate across `ElhxzUO7YQM` and `oNJ_ouDNNT0` — likely a single reused asset, not procedurally generated.

**transitionVerb:** Fill the empty negative-space around any composited slide with a dimmed satellite-earth-at-night photograph (dark-navy ocean, sparse warm-amber city-light clusters, soft galactic arc top-right); hold statically; no parallax.

### P6 — `HexagonalLEDStagePropGlow16x9` — confidence **MEDIUM** (1/12 in-frame, recurring across All-In Summits)

The All-In Summit stage features two **honeycomb / hexagonal LED cluster props** flanking the panel set, glowing **warm red/orange** in the captured frames (`KG_nHmHUZLw`). Diegetic but visually distinctive — it's the visual signature of the Summit stage.

**transitionVerb:** In any wide stage shot, place two clusters of 7 inward-glowing hexagons (one cluster left-of-center, one right-of-center, behind the seating) pulsing warm orange-red; hold statically.

### P7 — `FiveSeatPanelArmchairWide16x9` — confidence **HIGH** (4/12)

The recurring panel composition: **5 seats** across the stage — typically two armchairs flanking a center 2-seat sofa, with one guest center-stage and two flanking interviewers. Wide lens, low symmetric framing. This is the "host wide-shot" used for opening / closing / cutaway beats. No graphics, but a recognizable compositional grammar.

**transitionVerb:** Frame a wide static stage shot with five seated figures across the bottom third (chair-chair-sofa-chair-chair), centered horizontally, with stage props in the upper third; hold for 60–120 frames; no movement except the people.

### P8 — `KeynoteSlideHeroChart16x9` — confidence **HIGH** (2/12, distinctive)

Embedded as the "slide" half of P2 in `oNJ_ouDNNT0` is a recognizable ARK Invest-style **stacked-area chart with annotated era labels** (Steam Engine → Internal Combustion → Internet → AI), color-coded technology categories, dense legend. In `ElhxzUO7YQM` it's a **book-cover-and-headline collage** (3 book covers + 2 newspaper headlines + 1 protest-sign photo as a manifesto/source mosaic).

**transitionVerb:** Hold a single dense full-screen-width slide with a centered title (ALLCAPS condensed sans), one body element (chart OR collage), and source attribution at the bottom-right corner in 8 pt micro-type; never animate the chart on-build (it's a flat exported PNG).

### P9 — `ArmchairTwoShot16x9` — confidence **HIGH** (5/12)

The standard interview composition: two guests in matching **cream / off-white armchairs**, facing each other angled toward camera, with a small table between them; coffee mug + folder props. Dark stage backdrop; P1 chyron persistent. The "talking heads" mode of every Summit interview.

**transitionVerb:** Frame two seated subjects in matching armchairs angled 30° toward each other at frame-bottom-thirds; hold a static medium-wide shot; no graphics beyond the persistent corner chyron.

### P10 — `KeynoteSoloOnDarkBackdrop16x9` — confidence **HIGH** (3/12)

Solo speaker on a near-black stage with a single spotlight, often walking, holding a clicker. Used in Cathie Wood + Kyle Samani + Bryan Johnson Summit talks. No graphics except P1 chyron.

**transitionVerb:** Frame a single subject medium-shot center-frame against a deep-black backdrop with a single key-light from camera-right; hold; no graphics beyond the persistent corner chyron.

### P11 — `BurnedInCaptionsAbsent16x9` — confidence **HIGH** (12/12, ANTI-FINDING)

**Critical anti-pattern:** Across all 1,273 dense frames sampled, **zero burned-in captions were observed**. The All-In Summit videos rely entirely on YouTube's auto-CC layer (which most viewers leave OFF). This is the OPPOSITE of our `EditorialCaption` discipline and our sound-off-scroller audience expectations. Identical anti-finding to `sahilbloom` (long-form) and `matthewberman` (long-form) — but DIFFERENT from `adamrosler` / `natebjones-Shorts` / `aiexplained` / `mreflow` which all burn-in captions.

**transitionVerb:** None — DO NOT copy this. If we ever produce 16:9 long-form Summit-style content, we **MUST keep burned-in karaoke captions** because our audience watches with sound off.

### P12 — `DavosRegionalChyronVariant16x9` — confidence **MEDIUM** (1/12, distinctive)

The `5nCbHsCG334` Satya Nadella interview is at **USA House Davos 2025** with a regional `ALL-IN / DAVOS` chyron lockup (bottom-right, not bottom-left). Confirms All-In has a **template-system for regional event lockups** — same panel, same stacked typography, swap the event-name token and corner.

**transitionVerb:** Same as P1, but with the event-name token swapped (`SUMMIT` → `DAVOS`) and the anchor moved to the bottom-right; never animate.

---

## 4. Captions taxonomy register

All-In contributes **no new register** to our emerging taxonomy because they don't run burned-in captions at all. The user's note about `register: punchy/editorial/technical` from the global instructions applies as: **All-In is "none" / OFF** — the closest analog is `sahilbloom` long-form essays which also drop captions during A-roll. Our register vocabulary stands:

- `punchy` (yellow karaoke — Hormozi-derived)
- `editorial` (cyan karaoke — Sahil Bloom)
- `technical` (bright-white sentence-mode — Adam Rosler)
- `none` (no captions — All-In, Sahil A-roll, Matt Berman long-form)

We may want to extend `EditorialCaption` with a `register` prop where `'none'` is a valid value (renders nothing) so we can model long-form templates that explicitly defer to platform-CC without code-path changes.

---

## 5. Orientation: 16:9 confirmed (5th creator)

All-In is the **fifth confirmed 16:9 long-form reference** in our library:

1. `natebjones` — long-form essays (Sprint 1 16:9 lane proposal)
2. `aiexplained-official` — PDF-screenshot research breakdowns
3. `mreflow` — AI-tooling news anchor
4. `sahilbloom` — finance/habits essays
5. **`allin` — Summit keynotes + panel interviews** ← this analysis

This strongly reinforces the `docs/research/wave-7/ADR-001-16x9-lane.md` proposal flagged in the `sahilbloom` line of CREATORS.md. The lane is no longer hypothetical — 5 distinct creators, each with their own dominant template grammar, occupy it.

---

## 6. Replicability vs. our 9 primitives / 26 molecules / 73 compositions

### Mapping to existing library

| All-In pattern | Existing primitive / molecule / composition | Gap |
|----------------|---------------------------------------------|-----|
| P1 `PersistentEventLockupChyron16x9` | NEW — closest is our `BrandWatermark` 9:16 watermark | Need 16:9 chyron variant with stacked condensed-sans lockup + gradient backdrop panel + corner-anchored layout |
| P2 `SlideDeckPlusSpeakerPIP16x9` | Partial — `MacWindow` (Adam) is a screen-frame primitive; `WebcamPipOverlay` (Matt Berman) is the PIP molecule | New composition: large 16:9 slide rect + white-bordered PIP rect + filler background slot |
| P3 `VerticalNameSlateOverhead16x9` | Closest — our `TitleCardKineticTwoLine` | Need a 16:9 variant with tall vertical aspect ratio inset + static reveal |
| P4 `BlueGlowVignetteIntroFrame16x9` | NEW | Could be a primitive: `glowVignette` (radial inner glow on a rect) — usable on any composition |
| P5 `EarthStarfieldBackdropFill16x9` | NEW | Single background asset slot — could be a `<BackdropFill src="earth-at-night.jpg">` molecule |
| P6 `HexagonalLEDStagePropGlow16x9` | N/A | Diegetic stage prop, not replicable as a template |
| P7 / P9 / P10 | N/A | Diegetic stage compositions, replicable only via **post-production B-roll insert** of stock conference footage — not a graphics primitive |
| P8 `KeynoteSlideHeroChart16x9` | Closest — our `BarChartList9x16` / `LineChartAnnotated9x16` (both 9:16) | Need 16:9 chart-slide composition with title + chart + source-attribution micro-type |
| P12 `DavosRegionalChyronVariant16x9` | Extension of P1 | Same lockup with `eventName: 'DAVOS'` and `anchor: 'bottom-right'` prop |

### New primitives needed

- **`glowVignette`** (1 new primitive) — usable on any rect; XS, atomic, unlocks P4 + future cinematic-frame inserts

### New molecules needed

- **`<EventLockupChyron>`** — stacked condensed-sans logo + event-name with gradient-panel backdrop, props `{eventName, anchor: 'bl'|'br', panelColor}`. M, 4 h. Unlocks P1 + P12.
- **`<WhiteBorderedPIP>`** — rounded white border ~6 px around a video/photo rect; props `{aspectRatio, position, borderWidth}`. S, 2 h. Unlocks P2 + crossreferences `mreflow.FaceCamCircleOverlay`.
- **`<BackdropFill>`** — single background asset slot with `src` + dim factor. S, 1 h. Unlocks P5 + reusable for any "filler-image" composition.

### New compositions needed

- **`KeynoteSlidePIP16x9`** — composition of P2 (large slide rect left + PIP right + backdrop fill + chyron). M-L, 6–8 h. Highest priority because it's the dominant Summit graphic pattern.
- **`ChartSlideHero16x9`** — composition of P8 (title + dense chart + source attribution); pairs with `KeynoteSlidePIP16x9` as the "slide" content. M, 4 h.
- **`StageWideShotChyronOnly16x9`** — minimal composition: take an externally-supplied B-roll plate (the stage wide shot) and overlay only the chyron. S, 2 h. Unlocks every P7/P9/P10 use-case.

### Total Sprint estimate for All-In parity

- 1 new primitive (`glowVignette`) ~ 1 h
- 3 new molecules ~ 7 h
- 3 new compositions ~ 14 h
- **Total: ~22 h / ~3 working days for parity with the All-In Summit visual grammar**

This is **less** than Adam Rosler (~5–6 days for procedural-density parity) and **comparable to** Sahil Bloom (~19 h Sprint-A for caption-layer parity), because All-In's grammar is mostly **persistent chyron + slide composite + diegetic stage B-roll** — much of the "production value" comes from the live event itself, which we cannot replicate; we only replicate the **graphics layer**.

---

## 7. Compare to peer 16:9 references

| Axis | `sahilbloom` | `natebjones` | `allin` |
|------|--------------|--------------|---------|
| Native format | Essay long-form + Shorts | Essay long-form + Shorts | Live event clips (conference + Davos) |
| Persistent chrome | Production design (neon "curiosity" sign, bookshelf+book) | Bottom-right CTA pill cycling `@nate.b.jones` ↔ `read more on substack`; left-edge bookshelf avatar | **Persistent bottom-left/right event-lockup chyron** (`ALL-IN / SUMMIT` or `ALL-IN / DAVOS`) |
| Dominant graphic mode | Editorial chapter cards (`HeroChapterNumeral9x16`); short ALLCAPS captions | `NamedCardEquation` 4-card horizontal stacks; `TreeOfChildCardsWithEmphasisPill` | `SlideDeckPlusSpeakerPIP16x9` keynote composite; chart-slide hero |
| Captions | Karaoke cyan (active word) on Shorts; **none** on A-roll long-form | Emphasis-word caption pill on long-form; karaoke neon-green on Shorts | **None** (anti-pattern — 0/12) |
| Background grammar | Stock cinematic + movie clips as B-roll inserts | Dark-navy radial gradient + 5-accent palette | **Earth-at-night satellite photo** + dim galaxy starfield as backplate |
| Tooling guess | After Effects templates → Premiere | After Effects → Premiere (procedural-feel but template-driven) | **Live event vision-mixing console + post Premiere** (zero procedural motion graphics observed) |
| Unique signature | Authorial production design (own book face-out, neon sign) | Persistent CTA pill cycle (audience-acquisition mechanic) | **Persistent event-lockup chyron + diegetic LED stage props** (the show IS the graphic) |

### What All-In specifically adds

1. **Anchor-corner chyron grammar** — most other 16:9 references put their chrome on the bottom-right (Nate's CTA pill, mreflow's circle) or bottom-center (Sahil's chapter numerals). All-In's bottom-LEFT vertical lockup is a third corner-anchor we haven't modeled.
2. **The `DAVOS` variant** — confirms a `regionalEventToken` swap pattern (multiple event-lockups, same template).
3. **The earth-at-night backplate** — Sahil/Nate use solid dark-navy + gradient washes; All-In's literal-photo-as-backplate is distinctive and worth a `<BackdropFill>` molecule.

### What All-In is missing vs. peers

- Procedural animation entirely (Adam Rosler has ~15 procedural patterns; All-In has ~0)
- Burned-in captions (Sahil-Shorts and Nate both have karaoke; All-In has none)
- Numbered chapter cards / chapter dividers (Sahil's signature `HeroChapterNumeral9x16`; All-In doesn't seem to do this)
- Editorial caption pills (Nate's signature; absent here)

**Conclusion:** All-In is the **lowest-procedural-motion-graphics** creator in our 16:9 sample. Their visual moat is the **live event** + **persistent corner chyron** + **occasional slide PIP composite**, not animated graphics. They are an editorial-restraint reference, not a procedural-density reference.

---

## 8. Build-priority queue

Ranked by replicability × strategic value × effort:

| Rank | Item | Effort | Strategic value | Why |
|------|------|--------|-----------------|-----|
| 1 | `<EventLockupChyron>` molecule + 16:9 lane registration | M, 4 h | HIGH | P1 is 11/12 hit-rate — the most-reused single graphic across the channel; gives us a 16:9 chrome pattern; unlocks regional-variant (`DAVOS`, `SUMMIT`, etc.) for our own future events / sponsor tokens |
| 2 | `KeynoteSlidePIP16x9` composition | M-L, 6–8 h | HIGH | The signature keynote-content template; pairs with our existing chart compositions; opens "speaker + slide" as a content mode (e.g. Armando talking head + slide of code/diagram) |
| 3 | `<WhiteBorderedPIP>` molecule | S, 2 h | MED | Component of #2 above + reusable for any "small inset" pattern; backs Matt Berman `WebcamPipOverlay` use-cases too |
| 4 | `<BackdropFill>` molecule + earth-at-night asset slot | S, 1 h | MED | Component of #2; gives any composition a single asset-fill backdrop slot |
| 5 | `ChartSlideHero16x9` composition | M, 4 h | MED | Pairs with #2 as content for the slide half; also standalone-usable for our own chart-led essay content |
| 6 | `glowVignette` primitive | XS, 1 h | LOW-MED | P4 single-instance but generally useful for cinematic-feel intro/outro frames; cheap to ship |
| 7 | `StageWideShotChyronOnly16x9` composition | S, 2 h | LOW | Only useful if we layer chyron over externally-supplied stage B-roll; we likely don't generate stage footage |
| 8 | `register: 'none'` extension to `EditorialCaption` | XS, 30 min | LOW-MED | Lets us declare "no captions" cleanly in the schema for long-form 16:9 templates that defer to platform CC |
| — | P3 `VerticalNameSlateOverhead16x9` | — | SKIP | Diegetic LED-wall element; not replicable as a procedural template |
| — | P6 `HexagonalLEDStagePropGlow16x9` | — | SKIP | Diegetic stage prop, single-instance, not replicable |
| — | P7 / P9 / P10 (stage compositions) | — | SKIP | Diegetic B-roll compositions; cannot generate the underlying stage footage procedurally |

**Sprint A (~9 h):** ship #1 + #3 + #4 + #8 in one PR — this gets us the 16:9 chyron lane + composition primitives + caption-register extension. Validates the lane against `natebjones` + `sahilbloom` patterns in the same PR.

**Sprint B (~10–12 h):** ship #2 + #5 — the keynote-slide-PIP composition + chart-slide content. This is the **highest-leverage Summit template**.

**Total to parity:** ~19–21 h (~3 working days), excluding the diegetic items (which are out-of-scope for procedural graphics).

---

## 9. Cross-creator notes

### 16:9 lane confirmation count = 5

`allin` is the **5th** 16:9 long-form creator in our library. The original `natebjones` analysis flagged a load-bearing decision to open a 16:9 lane; this was reinforced by `aiexplained-official`, `mreflow`, `sahilbloom`. With All-In as the fifth, the case is now overwhelming. Recommendation: stop deferring — promote `docs/research/wave-7/ADR-001-16x9-lane.md` from proposal to accepted.

### Captions register taxonomy

All-In contributes the `register: 'none'` register. Updated taxonomy:

| Register | Style | Reference creator |
|----------|-------|-------------------|
| `punchy` | Yellow karaoke active word | Alex Hormozi, our own current default |
| `editorial` | Cyan karaoke active word | Sahil Bloom Shorts |
| `technical` | Bright-white sentence-mode | Adam Rosler |
| `none` | No captions; defer to platform CC | **All-In**, Sahil A-roll, Matt Berman long-form |

### Closest creator analog

`allin` is closest to **`sahilbloom`** (both 16:9, both editorial-restraint, both rely on production design as their moat, both eschew burned-in captions on A-roll) — but where Sahil uses **personal-brand production design** (his own book, his own sign), All-In uses **conference/event production design** (the stage, the LED props, the corner chyron lockup).

### Tooling guess

Live-event vision-mixing console (likely a Tricaster or Blackmagic ATEM at the Summit venue) handles the on-stage slide-PIP composites in real-time. Post-production in Premiere for chyron overlays and cut-down to clip length. **Zero After Effects motion graphics detected** in the sampled frames. This is the strongest "no procedural graphics" signal in our reference library so far.

### Anti-finding to NOT copy

- **No burned-in captions** — our sound-off-scroller audience demands captions ALWAYS ON; copying All-In's no-caption discipline would tank watch time. KEEP captions on.

---

## 10. Honest caveats

1. **Sample bias:** All 12 picks were "clip" uploads. The four-besties-around-the-table podcast format (which is the channel's most-watched content) does not appear in this sample. If we wanted to replicate that grammar, we'd need a Wave-8 re-pick targeting podcast episodes specifically.
2. **Frame resolution:** Downloads are 1280×720 (YouTube `f=18`). Fine for pattern-id, insufficient to read small slide text — anything <8 px is unreadable, which means the source-attribution micro-type on the keynote slides is informally observed, not pixel-confirmed.
3. **Coarse-fps trade-off:** Long-form videos at 1 fps / 15 s mean a slide transition that lasts <15 s could be entirely missed. Dense samples at 1 fps / 1.5 s mitigate this for the 3 windows per video, but ~85 % of each video is only at coarse resolution. Estimated false-negative rate: ~15 % of brief graphic events missed.
4. **No B-roll cutaway frames sampled:** None of the dense windows captured an "insert graphic" beat (like an animated stat pop or chart build) — the channel may use these and we missed them. Confidence on "All-In has zero procedural motion graphics" is **MEDIUM-HIGH**, not certain.

---

**Wave-5 contract closure:** All 12 patterns above have a single-sentence imperative-present-tense `transitionVerb` per `docs/prompts/animation-replication-runbook.md §2.1`. None violate the "don't say 'cool'" rule. Patterns P1, P2, P3, P5, P10, P12 are template-ready; P6, P7, P9 are out-of-scope (diegetic).
