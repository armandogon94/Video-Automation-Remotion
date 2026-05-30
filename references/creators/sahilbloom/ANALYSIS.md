# @Sahil_Bloom (YouTube long-form + Shorts) — visual + motion analysis

> **Scraped:** 2026-05-27 · 12 videos picked (Wave-7) · 9 long-form essays (60s–38 min) + 3 Shorts (60–82s).
> **Channel handle:** `@Sahil_Bloom` (NOT `@sahilbloom` — that's the IG handle, 404 on YouTube). Subs ~600K+ at scrape time.
> **Niche:** Finance / habits / productivity / self-development. NYT bestselling author ("The 5 Types of Wealth"), ex-private-equity. English-language anchor in the "thinking-style essay" lane.
> **Tooling guess:** Premiere / DaVinci with motion-graphic inserts pre-rendered in After Effects. Captions look CapCut/Premiere auto-cap with manual styling per scene. Deterministic typography but the chapter-card numerals + horizontal-bar reveals look like AE templates, not Remotion.
>
> **Honesty caveat:** 1,186 dense frames + 12 reference clips analyzed (audio stripped). Of the 9 long-form picks, the 38-min `Fj8HsHqyMA0` was sampled at 3 dense windows only — likely under-counts pattern variety. Patterns labeled `MED` confidence where they appeared in 1–2 videos.

---

## 1. Channel-level design philosophy

Sahil runs a **dual-engine** content op:

- **Long-form essays (5–38 min, 16:9):** Polished "video essay" with a face-cam A-roll, frequent B-roll inserts (stock cinematic + movie clips), and a small but consistent library of typographic / motion-graphic chapter cards. Captions are **selectively burned-in** — present during B-roll moments, absent during talking-head A-roll. House grammar is conservative editorial: high-contrast black-on-white serif-flavored sans, with one accent color per video.
- **Shorts (60–82s, 9:16):** Pure podcast cutdowns from his interview show + occasional motion-graphic Shorts. Talking-head Shorts use a **single-line ALL-CAPS karaoke caption** centered low. The motion-graphic Short (`28r88tLhNhw`) is a hybrid: face-cam intercut with explanatory 3D-flavored bar/column infographics.

He is **not** a Carlos/DIYSmartCode-style "motion-graphics-first" creator. The motion graphics are **anchors and transitions**, not the spine of the video. His distinctive moat is **editorial restraint + author authority** (book on shelf, neon "curiosity" sign, podcast-set production value).

**For our pipeline:** the highest-value lift is NOT the motion graphics themselves (we already have richer ones). It's the **chapter-card numeral system**, the **karaoke-caption discipline**, and the **"declared step / italic emphasis"** editorial title device used in `EvMEBzrDQVA` and `RYLrfpMSkoY`.

---

## 2. Per-video pattern distillation

### Long-form essays (16:9)

| Video ID | Title | Dur | Dominant patterns observed |
|---|---|---|---|
| `lAg2-wWR5wU` | Busy But Behind? (10 Min Fix) | 5:27 | Horizontal-bar list w/ descending widths + colored rows (red/green/blue/yellow) on cream; face-cam A-roll w/ B-roll Fight-Club style 2-line center-stacked typography ("YOU ARE / **VALUABLE**") |
| `qsmjQGw0uiU` | 13 Innocent Mistakes Destroying Your 20s | 8:05 | **HeroChapterNumeral** — huge `02`, `06`, etc. on saturated blue with top progress timeline (dots + lightning bolts); intercut with movie-clip B-roll captioned in cyan-active karaoke |
| `Cl7EgF-XIPc` | 11 Habits That Cost Me 30 Years | 6:22 | Right-aligned 3-line stacked typography ("Don't / **complain** / about") on face-cam, with one bold-white middle word; clean **HeroChapterNumeral outline** variant (`06+`, hairline-stroked, no fill) on pure white |
| `EvMEBzrDQVA` | Stop Setting Goals. Do This Instead. | 19:54 | **EditorialStepCard** — white BG, bold sans title with ONE italic-emphasized word ("Step One: Choose Your *Arena*") + gray sub; **HeroQuoteBulletReveal** with quoted hero line at top + dash bullets appearing one-at-a-time |
| `Fj8HsHqyMA0` | 34 money lessons | 37:53 | Studio A-roll at a desk (laptop + neon sign) — almost no chapter cards observed in sampled windows (under-sampled — confidence LOW for absence) |
| `AHb_AFtC-Yk` | The AI Boom Will Break Us | 19:04 | Stock-footage cinematic B-roll (B&W landscape) + attic-set A-roll; long-form essay structure w/ minimal typographic chrome in sampled windows |
| `JcfSxUg6dH0` | 7 skills that will outlast AI | 8:04 | **FakedEmailScreenshotCard** — composed Gmail-inbox card on dark BG as an in-essay prop ("need your advice…"); main A-roll set is the bookshelf-w/-neon-`curiosity`-sign studio |
| `RYLrfpMSkoY` | 15 harsh realities | 11:21 | **FullSentenceItalicEmphasisCaption** — burned-in sentence-style caption `"Get wealthy" is a *fantasy*.` (NOT karaoke — full sentence with one italic word); same studio set |
| `yTp2EhSUwmo` | Stop Wasting Your Life | 6:34 | B-roll heavy (gym, Tokyo cityscape) w/ **karaoke caption (cyan active + white past + light-blue future)** left-aligned low; face-cam in studio |

### Shorts (9:16)

| Video ID | Title | Dur | Dominant patterns observed |
|---|---|---|---|
| `c7ePpaEvVW4` | How to never be happy | 45s | Pure podcast cutdown (face-cam talking head, dark studio backdrop + mic) + single-word **ALL-CAPS WHITE-WITH-DROP-SHADOW caption** centered low |
| `28r88tLhNhw` | Stanford proved winners think like this | 82s | **Hybrid:** podcast face-cam intercut with a 3D-flavored **3-column bar chart** w/ people-icon glyphs on top (red/green/yellow), pill-style caption |
| `0Q0vWA1xH_0` | Parkinson's Law (work less) | 60s | Pure podcast cutdown, herringbone-shirt + chair + mic; same ALL-CAPS centered caption style |

---

## 3. Named patterns (12 distilled from the 12 videos)

Per the Wave-5 contract — each pattern includes a `transitionVerb` we can paste into a Zod schema. Confidence is HIGH only if pattern appeared in ≥2 distinct videos.

### P1 — `HeroChapterNumeral9x16` (HIGH)
*Seen in: `qsmjQGw0uiU` (filled, blue), `Cl7EgF-XIPc` (outline, white)*
- **Visual:** Single huge sans-serif numeral (`02`, `06+`) filling ~60% of vertical space. Filled-on-blue variant has a tiny **top progress timeline** (small dots + small lightning-bolt glyphs at chapter boundaries) marking position in the list. Outline-on-white variant has no chrome.
- **Orientation:** 16:9 in source; trivially adapts to 9:16.
- **transitionVerb:** "Numeral scale-pops 0.85→1 over 10 frames; if filled-on-blue, top progress timeline draws L→R via stroke-dashoffset over 18 frames with a small lightning-bolt glyph stamp-popping at the active chapter index."
- **Replicability:** ★★★★★ (8h). Slots into existing `BigNumberHero9x16` as a `chapter` mode + new shared `<ChapterProgressTimeline>` molecule.
- **Build priority:** **A** (top 3).

### P2 — `EditorialStepCard16x9` (MED)
*Seen in: `EvMEBzrDQVA`*
- **Visual:** Pure white BG, no chrome. Bold black sans-serif title at center with **ONE italic-emphasized word** (`Step One: Choose Your *Arena*`). Light-gray sub below. Vertical center, max ~7 words.
- **Orientation:** 16:9. Adapt to 9:16 with center stack.
- **transitionVerb:** "Title fades in word-by-word at 4-frame stagger; emphasized italic word scale-pops slightly larger on its frame; sub fades in 8 frames after the title completes."
- **Replicability:** ★★★★ (4h). Direct port to existing `TitleCardKineticTwoLine16x9` as a `editorialStep` mode w/ `emphasisIndex` prop.
- **Build priority:** **A**.

### P3 — `FullSentenceItalicEmphasisCaption` style for `EditorialCaption` (HIGH)
*Seen in: `RYLrfpMSkoY` (`"Get wealthy" is a *fantasy*.`), `EvMEBzrDQVA` (the step-card sub)*
- **Visual:** Burned-in caption that displays the **entire sentence at once** (not karaoke word-by-word), with one italic word per sentence. White text + soft drop shadow.
- **Orientation:** any.
- **transitionVerb:** "Sentence fades in as a single unit over 8 frames; italic word holds at 1.05× scale relative to siblings."
- **Replicability:** ★★★★★ (2h). New `mode: "sentence"` on `EditorialCaption.tsx` with `italicIndex` per-segment. Useful for `KineticEssay9x16` voice-overs.
- **Build priority:** **A**.

### P4 — `HorizontalBarRankedList16x9` (MED)
*Seen in: `lAg2-wWR5wU` ("The Red Calendar Protocol" — 4 bars in red/green/blue/yellow at descending widths on cream)*
- **Visual:** Title top-left with a thin vertical separator on the left. 4–5 horizontal bars stacked left-aligned, descending in both width AND color hierarchy (the longest red, then green, blue, yellow). Bars have rounded ends. Sparse layout, no labels visible during reveal.
- **Orientation:** 16:9.
- **transitionVerb:** "Each bar grows from width 0 → final width via L→R `scaleX` over 12 frames with eased-out cubic; bars stagger top-to-bottom at 8-frame intervals; title fades in 4 frames before the first bar."
- **Replicability:** ★★★★ (6h). Adjacent to `BarChartList9x16` / `BigNumberHorizontalBars16x9` but the **named-list + color-hierarchy + no-label-reveal** variant is distinct. Slot as new `mode: "rankedReveal"`.
- **Build priority:** **B**.

### P5 — `FightClubTwoLineCenterStack` for B-roll typography (MED)
*Seen in: `lAg2-wWR5wU` ("YOU ARE / **VALUABLE**"), implicit elsewhere*
- **Visual:** B-roll plate behind, two-line ALL-CAPS center-stacked typography where the **bottom line is dramatically larger** (~2× font size) than the top. White text, slight shadow.
- **Orientation:** any.
- **transitionVerb:** "Top line fades in from above (translateY(-12) → 0) over 8 frames; bottom large line scale-pops 0.92→1 over 10 frames, starting 4 frames after the top line."
- **Replicability:** ★★★★ (3h). New `mode: "fightClubStack"` on `TitleCardKineticTwoLine16x9`. Pairs with B-roll in `BrollListicle9x16`.
- **Build priority:** **B**.

### P6 — `RightAlignedThreeLineEmphasis` for talking-head typography (MED)
*Seen in: `Cl7EgF-XIPc` ("Don't / complain / about" — middle word much heavier)*
- **Visual:** Right-aligned 3-line stacked text on top of face-cam talking head. Light-gray top + bottom words, BIG bold-white middle word. Captioned-as-the-talking-head-speaks (single sentence broken into 3 lines).
- **Orientation:** 16:9 with face-cam left.
- **transitionVerb:** "Top word fades in over 6 frames; middle word scale-pops 0.9→1 with bold weight-shift over 8 frames; bottom word fades in 4 frames after the middle finishes."
- **Replicability:** ★★★ (4h). Specific. New `mode: "rightStacked3"` on `EditorialCaption` w/ `emphasisIndex`. Less reusable than P3.
- **Build priority:** **C**.

### P7 — `KaraokeCaptionCyanActive` for B-roll moments (HIGH)
*Seen in: `yTp2EhSUwmo` (Tokyo cityscape), `qsmjQGw0uiU` (movie clip — `You're anxious because`)*
- **Visual:** Burned-in **karaoke** caption left-aligned low. Active word **bright cyan**, already-spoken words solid white, upcoming words faded light-blue. Sans-serif, slight shadow.
- **Orientation:** any.
- **transitionVerb:** "Caption renders all words simultaneously at their final positions; active-word index transitions through the sentence at speech cadence; colors snap between past/active/future palettes — no slide animation, only color swap."
- **Replicability:** ★★★★★ (3h). We have `EditorialCaption` + `BlackPillCaption`; add a `karaokeCyan` style variant + `activeColor`/`pastColor`/`futureColor` props.
- **Build priority:** **A**.

### P8 — `AllCapsCenterCaptionWithDropShadow` for Shorts (HIGH)
*Seen in: `c7ePpaEvVW4`, `0Q0vWA1xH_0`, `28r88tLhNhw` (between-graphic moments)*
- **Visual:** Single line of **ALL-CAPS** white sans-serif with a soft black drop shadow, centered horizontally, low in the frame (~70% from top). One short phrase per moment (2–4 words). NOT karaoke — phrase swaps per chunk.
- **Orientation:** 9:16.
- **transitionVerb:** "Phrase fades in over 4 frames + slight upward drift (translateY(6) → 0); held until next phrase swap; outgoing phrase fades out over 4 frames."
- **Replicability:** ★★★★★ (2h). Trivial. New `mode: "allCapsCenter"` on `EditorialCaption.tsx` w/ optional drop-shadow strength. Already very close to what `<EditorialCaption>` can do — needs a Shorts variant.
- **Build priority:** **A**.

### P9 — `ThreeColumnBarChartWithPeopleIcons9x16` (MED)
*Seen in: `28r88tLhNhw`*
- **Visual:** 9:16 frame with light pastel BG. **3 vertical columns** of different heights (looks 3D-extruded — soft rounded tops). Each column has a colored circular badge on top containing a stylized **group-of-people icon** matching column color (red / green / yellow). Centered group, vertically balanced.
- **Orientation:** 9:16.
- **transitionVerb:** "Each column grows from height 0 → final height (`scaleY` from baseline) over 14 frames; columns stagger left-to-right at 6-frame intervals; circular badge with icon scale-pops 0.8→1 starting 3 frames before its column completes."
- **Replicability:** ★★★ (8h). Single-instance; useful only if we build a "comparing groups of people" template. Could become a new `RankedColumnsWithBadges9x16` or extend `BenchmarkBars9x16`.
- **Build priority:** **C**.

### P10 — `HeroQuoteBulletReveal16x9` (MED)
*Seen in: `EvMEBzrDQVA`*
- **Visual:** White BG, no chrome. Centered hero **bolded sentence at the top** ("You did spend more time with them, but it left you feeling miserable") then dash-prefixed sub-bullets ("- Distraction from connection") revealed below, left-aligned.
- **Orientation:** 16:9.
- **transitionVerb:** "Hero quote fades in word-by-word at 3-frame stagger; each dash bullet slides up from translateY(8) → 0 over 8 frames, holding 24 frames before the next bullet starts (NOT a continuous stagger)."
- **Replicability:** ★★★★ (5h). Adjacent to `Listicle.tsx` / `PaginatedListSlide.tsx`. Worth a `mode: "quoteAndDashBullets"` extension.
- **Build priority:** **B**.

### P11 — `FakedEmailScreenshotCard9x16` (LOW)
*Seen in: `JcfSxUg6dH0` (Gmail-inbox card on dark BG with `need your advice — uncertain what to focus on`)*
- **Visual:** Composed faux email/Gmail card centered on dark background. Looks like a screenshot but is clearly composed — left-aligned subject, sender row, body paragraph. Used as a **diegetic prop** for "imagine you got this email" essay device.
- **Orientation:** 9:16 in this video, adapts to 16:9.
- **transitionVerb:** "Card scale-pops 0.95→1 + slight rotation correction (1° → 0°) over 12 frames; body text reveals line-by-line at 6-frame stagger inside the card."
- **Replicability:** ★★★ (10h). Close to `GenerativeBrollWithDiegeticUI9x16` and the spirit of `TweetCardHero9x16`. Could be a `FakedEmailCard9x16` template if we have a use case (e.g., "imagine getting this email from your future self").
- **Build priority:** **D**.

### P12 — `StudioSetAuthorityWithNeonSign` (LOW — production, not template)
*Seen in: `JcfSxUg6dH0`, `RYLrfpMSkoY`, `Fj8HsHqyMA0`*
- **Visual:** A-roll studio with neon sign on shelves ("curiosity", "ty"-truncated), bookcase with the author's own book face-out, often a podcast mic and chair. Not animated — it's the **production design**.
- **Replicability:** N/A — out-of-scope for our pipeline (we'd ape this in physical production, not Remotion).
- **What we steal:** the principle that **author authority is established visually before any motion graphic plays**. Document for `brand/voice.md` next edit.
- **Build priority:** **N** (not a template, a content-production note).

---

## 4. Cross-video grammar

### Always-present elements
- **Burned-in captions are conditional, not constant.** Captions ON during B-roll, OFF during face-cam essays where the author's hands and eyes carry the meaning. *Different from our discipline* (we burn always) — document for future A/B.
- **One accent color per video.** `lAg2-wWR5wU` red, `qsmjQGw0uiU` saturated blue, `Cl7EgF-XIPc` black ink on white. Same restraint as DIYSmartCode.
- **Karaoke caption is cyan, not yellow.** Tella's Hormozi karaoke is yellow; Sahil's is cyan. We currently lean yellow — record cyan as a brand-friendly alternative for "editorial" vs "punchy" registers.
- **No watermark.** Sahil never shows his handle / book / channel-logo as a persistent overlay. He relies on production design + voice.

### Typography system
- **Sans bold body** (Inter / Söhne / Lato-bold family) for hero / chapter numerals
- **Sans italic** for the ONE emphasized word per editorial title — same device as DIYSmartCode (which uses serif italic). His is sans-italic because the whole brand reads more techy.
- **No serif anywhere observed.** Distinct from DIYSmartCode's CreamEditorial.
- **All-caps centered low** for Shorts captions (single phrase per moment).

### Color discipline
- **One accent per video.** Confirmed pattern. Adopt for our brand-set: `accentColor` override per request.
- **Saturated chapter-card BGs** (royal blue at full saturation). Not the muted navy of our brand defaults — this is **assertive editorial**. Pair w/ outline-on-white as the "calm" variant.
- **Karaoke palette = `#00E5FF`-ish cyan active + `#FFFFFF` past + `#A8C5D9`-ish faded blue future.**

### Captions taxonomy (cross-pattern summary)
1. **Karaoke cyan** for B-roll moments (P7)
2. **All-caps centered low** for Shorts (P8)
3. **Full-sentence with italic emphasis** for editorial moments (P3)
4. **Right-aligned 3-line stacked** for talking-head w/ emphasis (P6)
5. **No caption at all** for the long quiet talking-head essay moments

This taxonomy is more nuanced than what we currently ship — we have `EditorialCaption` + `BlackPillCaption` + word-by-word, but no "no caption" discipline. Worth recording: **muting captions during pure A-roll is a craft decision, not a bug**.

---

## 5. What we adopt (Wave-7 build priority queue)

| Rank | Pattern | Slot | Effort | Priority |
|---|---|---|---|---|
| 1 | P3 `FullSentenceItalicEmphasisCaption` → `EditorialCaption mode:"sentence"` | New mode on existing component | 2h | A |
| 2 | P8 `AllCapsCenterCaptionWithDropShadow` → `EditorialCaption mode:"allCapsCenter"` | New mode | 2h | A |
| 3 | P7 `KaraokeCaptionCyan` → caption-style variant (`activeColor`, `pastColor`, `futureColor` props) | Variant on existing caption molecules | 3h | A |
| 4 | P1 `HeroChapterNumeral` → `BigNumberHero9x16 mode:"chapter"` + new `<ChapterProgressTimeline>` molecule | Extend `BigNumberHero9x16` + new molecule | 8h | A |
| 5 | P2 `EditorialStepCard16x9` → `TitleCardKineticTwoLine16x9 mode:"editorialStep"` w/ `emphasisIndex` | Extend existing | 4h | A |
| 6 | P10 `HeroQuoteBulletReveal16x9` → `Listicle.tsx mode:"quoteAndDashBullets"` | Extend existing | 5h | B |
| 7 | P4 `HorizontalBarRankedList16x9` → `BarChartList9x16 mode:"rankedReveal"` | Extend existing | 6h | B |
| 8 | P5 `FightClubTwoLineCenterStack` → `TitleCardKineticTwoLine16x9 mode:"fightClubStack"` | Extend existing | 3h | B |
| 9 | P6 `RightAlignedThreeLineEmphasis` → `EditorialCaption mode:"rightStacked3"` | Extend existing | 4h | C |
| 10 | P9 `ThreeColumnBarChartWithPeopleIcons9x16` → new `RankedColumnsWithBadges9x16` | New composition | 8h | C |
| 11 | P11 `FakedEmailScreenshotCard9x16` → new `FakedEmailCard9x16` | New composition | 10h | D |
| — | P12 Studio-set authority cue | `brand/voice.md` documentation | 30min | doc-only |

**Top 5 (Sprint priority A):** all caption-layer enhancements + 2 chapter-card upgrades. Total estimated effort: ~19h. Strongest ROI item is the **karaoke cyan variant** — instant unlock for the entire editorial register we currently can't render.

**Architectural note:** items 1, 2, 3, 6, 9 are all `EditorialCaption.tsx` mode extensions. Worth a one-pass refactor that introduces a `mode: "karaokeYellow" | "karaokeCyan" | "sentence" | "allCapsCenter" | "rightStacked3"` discriminated union before adding new modes piecemeal.

---

## 6. Anti-findings (things we should NOT copy)

1. **Don't drop captions during A-roll.** Sahil can because his face-cam carries meaning + his audience watches with sound. Our @armandointeligencia audience scrolls without sound — captions ALWAYS ON is correct for us.
2. **Don't ditch our watermark.** Sahil's authority is established by production design (neon sign, bookcase, mic). We don't have that physical signal — `<BrandWatermark>` is doing load-bearing work in our brand grammar. Keep it.
3. **Don't copy the 38-min long-form structure.** Out of our delivery scope. We're 9:16 short-form first; 16:9 long-form is a separate ADR not yet decided.
4. **Don't use movie clips as B-roll.** Copyright risk + brand-fit (Sahil's "American educator" register doesn't map to "Spanish-language LATAM AI agency founder"). Use AI-generated b-roll instead.

---

## 7. Open questions for downstream

- **16:9 lane decision** (already flagged by `natebjones`, `aiexplained`, `mreflow`): Sahil is the **fourth** confirming 16:9 reference. If we open a 16:9 lane, ranks 4–8 above gain immediate value. If we stay 9:16-only, ranks 4, 5, 6, 7, 8 either get cropped or skipped. **Recommend dedicated ADR `docs/research/wave-7/ADR-001-16x9-lane.md` synthesizing all 4 references.**
- **Karaoke-cyan vs karaoke-yellow A/B?** We have data points: Hormozi yellow (punchy), Sahil cyan (editorial), Adam Rosler bright-white (technical). All three may map to different content lanes — worth codifying as `register: "punchy" | "editorial" | "technical"` and binding caption palette to it.
- **Captions-on vs captions-off A/B?** Sahil's discipline is a craft choice. Should we test "captions off during pure A-roll" for our long-form? Risk: sound-off scrollers churn. Reward: more cinematic register. Decide in the same 16:9 ADR.

---

## 8. Sources & artifacts

- **Picks:** `references/creators/sahilbloom/picks-wave7.json` (12 videos)
- **Frames:** `references/creators/sahilbloom/<videoId>/frames/anim-NN-frame-MMM.jpg` — 1,186 total. Coarse = 1 fr/15s (long-form) or 1 fr/3s (Shorts). Dense = 1 fr/1.5s at 3 windows per long-form, full duration for Shorts.
- **Reference clips:** `docs/research/wave-6/references/sahilbloom/<videoId>-anim-01.mp4` — 12 clips, ~3.3 MB total, audio-stripped, ≤544 KB each, scaled to 360–480 px wide.
- **YouTube channel:** https://www.youtube.com/@Sahil_Bloom
- **Pipeline:** `yt-dlp` (no auth, public videos) + `ffmpeg` + `ffprobe`. No Instagram artifacts (IG handle 401's).
- **Compared with:** `references/creators/diysmartcode/ANALYSIS.md` (closest peer — both lean editorial / restraint discipline; Sahil is sans-italic, DIY is serif-italic), `references/creators/alexhormozi/ANALYSIS.md` (caption taxonomy reference — Sahil cyan vs Hormozi yellow).

---

## 9. Closing call

**Sahil Bloom is HIGH-value as a caption-layer + editorial-typography reference, NOT as a motion-graphics reference.** Our motion-graphic library is already more procedural and richer than his. Where he wins is **what NOT to render** — the discipline of caption-off A-roll moments, the single italic word, the saturated-blue chapter card with a tiny progress timeline. Ship the Sprint-A items (~19h) for instant editorial register lift; defer ranks B–D until a content brief actually calls for them. Tooling guess (After Effects templates piped through Premiere) means there's no template registry to mine — every pattern needs hand-replication via the runbook in §2 of `docs/prompts/animation-replication-runbook.md`.
