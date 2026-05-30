# @NateBJones — canonical motion + typography analysis

> **Synthesis document.** This is the source-of-truth ANALYSIS.md for natebjones.
> Voter outputs (`ANALYSIS-VOTE1.md`, `ANALYSIS-VOTE2.md`) and the Wave-6 consensus (`docs/research/wave-6/natebjones-consensus.md`) remain unmodified. This file consolidates them and folds in **Wave-7 Batch 3 (R4B, Nate +15)** findings.
>
> **Channel:** `@NateBJones` (https://www.youtube.com/@NateBJones) · English-language AI / agent-infrastructure analyst · Substack-first thinker, "senior PM walking you through a leaked doc" register.
> **Reference framing:** **Stripe Press in motion** — typographic-first, restraint-disciplined, single-glyph brand mark, dark-slate slabs as backplate.
> **Wave-5 contract:** every named pattern carries a `transitionVerb`.

---

## 0. Status

| Field | Value |
|---|---|
| **Corpus size** | **39 videos analyzed** (Wave-6: 24, Wave-7 Batch 3: +15) |
| **Last extension** | 2026-05-28 — R4B Nate +15 batch |
| **Aspect mix** | 33 long-form 16:9 + 6 Shorts 9:16 |
| **Voter outputs** | `references/creators/natebjones/ANALYSIS-VOTE1.md` (298 lines) · `ANALYSIS-VOTE2.md` (222 lines) |
| **Wave-6 consensus** | `docs/research/wave-6/natebjones-consensus.md` (324 lines) |
| **Wave-7 Batch 3 picks** | `references/creators/natebjones/picks-wave7-batch3.json` (15 videos) |
| **Earlier picks** | `picks-vote1.json`, `picks-vote2.json`, `picks-wave7.json` |
| **Analyzed-videos manifest** | `references/creators/natebjones/analyzed-videos.json` (`analyzed_count: 39`) |
| **Reference clips (Wave-7 Batch 3)** | `docs/research/wave-6/references/natebjones/<id>-anim-{01,02}.mp4` — 30 clips, ≤1.1 MB each, audio-stripped |
| **Disk hygiene** | All 15 source mp4s deleted after extraction; `/tmp/wave7-batch3-natebjones/` removed |

**Patterns count after Wave-7 Batch 3:** 6 new first-class 16:9 patterns + 1 new Shorts caption variant = **+7 named patterns**, on top of the 9 documented in VOTE2 §4 and the 11 in VOTE1 §4.

---

## 1. Existing patterns (Wave-6 — VOTE1 + VOTE2)

These are documented in the voter analyses; no content duplicated here. See cross-links.

### 16:9 long-form (Wave-6)

| Pattern | Source | Notes |
|---|---|---|
| `TitleCardKineticTwoLine` | `ANALYSIS-VOTE2.md` §4 #1, `ANALYSIS-VOTE1.md` §4 #7 (`SectionDividerTitleCard`) | 4 confirmed instances in Wave-6 corpus; section-divider primitive. **Wave-7 Batch 3 update: now ≥13 instances across full corpus — DOMINANT Nate primitive.** |
| `NamedCardEquation` | `ANALYSIS-VOTE1.md` §4 #1 | 2 hits in Wave-6 (iUSdS anim-1, woGB2 anim-2). Wave-7 Batch 3 re-confirms ≥4 instances total → **see N3 below**. |
| `TreeOfChildCardsWithEmphasisPill` | `ANALYSIS-VOTE1.md` §4 #2 | 3 Wave-6 hits (FtCd anim-2, anim-5, anim-7). Parent header + 3–4 child cards row + bottom emphasis pill. |
| `BigNumberHorizontalBars` | `ANALYSIS-VOTE1.md` §4 #3 | Hero numeral + N full-width colored bars. 1 Wave-6 hit. |
| `StackedProgressParentChild` | `ANALYSIS-VOTE1.md` §4 #4 | Parent hero number + 3 colored dot-progress child rows. 1 Wave-6 hit. |
| `BeforeAfterTextComparison` / `BeforeAfterContrastCards` | `ANALYSIS-VOTE1.md` §4 #5 + `ANALYSIS-VOTE2.md` §4 #5 | Two-column DEFAULT/BETTER with central `TO` word. Wave-7 Batch 3 adds a `VS` variant → **see N5 below**. |
| `FourStageHorizontalFlowDiagram` | `ANALYSIS-VOTE2.md` §4 #4 | Horizontal MODEL/SERVE/API/USE flow. Wave-7 Batch 3 finds N=3 variants → **see N6 below**. |
| `SplitScreenInterviewLayout` | `ANALYSIS-VOTE2.md` §4 #3 | 50/50 vertical-midline dual-presenter. Long-form only. |
| `DarkGradientBreathBeat` | `ANALYSIS-VOTE1.md` §4 #8 | Editing pattern, not a template — 0.5–1.5 s pause card. |

### 9:16 Shorts (Wave-6)

| Pattern | Source | Notes |
|---|---|---|
| `KaraokeWordCaptions` / `TikTokWordCaptionsWithCtaPill` | `ANALYSIS-VOTE1.md` §4 #9, `ANALYSIS-VOTE2.md` §4 #2 | Green-active-word karaoke baseline, persistent handle chip lower-right. Already shipped in our `src/components/captions/*`. Wave-7 Batch 3 finds a **chip-pullout** variant → **see C7 below**. |
| `DisconnectedCardsDiagram` | `ANALYSIS-VOTE2.md` §4 #6 | Constellation of cards with yellow `×` between adjacent pairs. 1 Wave-6 instance. |
| `Podcast2UpVerticalCrop` | `ANALYSIS-VOTE1.md` §4 (oWIXee9h3nU) | Letterboxed podcast clip with blurred pillarbox. |

### Persistent brand chrome (both aspects)

| Pattern | Source |
|---|---|
| `HelmetGlyphWatermarkBehind` | `ANALYSIS-VOTE2.md` §4 #7 — 60%-translucent helmet+glasses glyph lower-left on every full-screen graphic |
| `HandleChipLowerRight` | `ANALYSIS-VOTE2.md` §4 #8 — pill chip `@nate.b.jones` / rotating CTA copy; **only continuous element across both 16:9 and 9:16 lanes** |
| `TalkingHeadOnlyNoOverlays` | `ANALYSIS-VOTE2.md` §4 #9 — title structure does NOT predict animation density (woGB2vr5wTg negative finding) |

---

## 2. Wave-7 Batch 3 extension (NEW — R4B Nate +15)

Picks list: `references/creators/natebjones/picks-wave7-batch3.json` (12 long-form 16:9 + 3 Shorts 9:16).

Each pattern below carries the Wave-5 `transitionVerb` contract and a video-ID + timestamp anchor.

### N1 — `ThreeRowLabeledCardStack16x9` (HIGH replicability)

- **Anchors:** `n0nC1kmztSk` t≈300s · `NRBQmwlILjk` t≈300s
- **Aspect:** 16:9
- **Description:** Three labeled cards stacked top-to-bottom. Each row pairs a uppercase tracking-spaced label tab (LEFT) with a bold-white title (RIGHT), separated by a thin vertical accent rule that draws in between them. Example seen: `TRACE / WORKFLOW / PRODUCT × Tool Calls / Task Outcome / User Value`. Beneath the stack, the caption pill fades in with a single orange-tinted keyword.
- **transitionVerb:** "Stack three labeled cards top-to-bottom, each fading in and ramping a thin vertical rule between its left label tab and its right title; once all three rows are placed, the caption pill below fades in with one orange keyword."
- **Build status:** **ALREADY BUILT (B22)** — live at `src/compositions/ThreeRowLabeledCardStack16x9.tsx`
- **Reference framing:** "Stripe Press product matrix" — typographic-first, no chart chrome, no icons.
- **Replicability:** HIGH

### N2 — `ThreeStageRisingBars16x9` (MED replicability)

- **Anchors:** `ogTLWGBc3cE` t≈435s · `zP6TnEiueEc` t≈105s
- **Aspect:** 16:9
- **Description:** Three uppercase-labeled bar towers reveal left-to-right on a dark-slate slab. Each tower rises from baseline to its target height with a soft ease-out while an accent border draws around it. Narrative beat is **Then / Now / Next** (or equivalent triplet). Caption pill below with one orange keyword.
- **transitionVerb:** "Reveal three uppercase-labeled bar towers left-to-right, each rising from baseline to its target height with a soft ease-out while its accent border draws around it; once all three are placed, the caption pill fades in below with one orange keyword."
- **Build status:** **NOT YET BUILT — on queue.**
- **Reference framing:** "Stripe Press chronology bars" — categorical, not data-quantitative; the heights are narrative (small/medium/large) not measured.
- **Replicability:** MED — slot as a new 16:9 composition `ThreeStageRisingBars16x9.tsx`, distinct from `BenchmarkBars9x16` (which is data-quantitative).

### N3 — `EquationCardChain16x9` (HIGH replicability — highest reuse pattern)

- **Anchors:** `ogTLWGBc3cE` · `zP6TnEiueEc` (≥4 instances across batch)
- **Aspect:** 16:9
- **Description:** Operand cards land one by one left-to-right on dark slate. Each card has an accent-colored thin outline. Between cards: typographic `+` separator pops in matching the **next** card's accent color. Final `=` and result card slide in last. Caption pill below fades in with the keyword tinted orange. Example: `Bullseye + Boundaries = Good Search`.
- **transitionVerb:** "Land the operand cards one by one left-to-right; after each card settles, its + separator pops in matching the next card's accent color; the final = and result card slide in last, then the caption pill fades in below with the keyword tinted orange."
- **Build status:** **ALREADY BUILT (B19)** — live at `src/compositions/EquationCardChain16x9.tsx`
- **Reference framing:** Direct descendant of VOTE1 §4 #1 `NamedCardEquation`; this batch promotes it to canonical N=3+ equation primitive.
- **Replicability:** HIGH — generalized N-operand schema, ships with parameterized operators (`+`, `=`, `→`).

### N4 — `TopHeroBottomTrioCards16x9` (MED replicability)

- **Anchors:** `ogTLWGBc3cE` t≈920s · `zP6TnEiueEc` t≈830s
- **Aspect:** 16:9
- **Description:** Hero card lands from above with a soft drop. After it settles, three supporting cards rise from below in left-to-right sequence. Each supporting card has its label tab fade in 50ms before its headline. Caption pill below fades in last.
- **transitionVerb:** "Land the hero card from above with a soft drop; once it settles, the three supporting cards rise from below in left-to-right sequence, each with its label tab fading in 50ms before its headline; finally the caption pill fades in below."
- **Build status:** **NOT YET BUILT — on queue.**
- **Reference framing:** "Stripe Press headline + supporting points" — visual hierarchy via vertical position, not type weight.
- **Replicability:** MED — new 16:9 composition `TopHeroBottomTrioCards16x9.tsx`; reuses dark-slate slab + helmet watermark backplate primitives.

### N5 — `VSContrastTwoColumn16x9` (HIGH replicability — variant of existing)

- **Anchor:** `ogTLWGBc3cE` t≈315s
- **Aspect:** 16:9
- **Description:** Two-column contrast with a centered glyph between them. Sibling of VOTE2 §4 #5 `BeforeAfterContrastCards` — same column layout, but the connector glyph is `VS` (gray sans, thin underline-stroke draws in) rather than `TO`. Used for adversarial / oppositional framing (vs the directional / transformational framing of `TO`).
- **transitionVerb:** "Slide the LEFT column in from the left and the RIGHT column in from the right simultaneously; once both columns settle, fade in the central VS word above them and stroke-draw its thin underline left-to-right."
- **Build status:** **RECOMMENDED REFACTOR (B21 task)** — add a `connectorGlyph: 'TO' | 'VS' | '→'` prop on existing `src/compositions/BeforeAfterText16x9.tsx` rather than building a separate composition. Same layout, different glyph.
- **Reference framing:** Sibling pattern; aspect-of-existing-primitive, not a new primitive.
- **Replicability:** HIGH — single-prop extension.

### N6 — `ThreeCardArrowFlow16x9` (HIGH replicability — N=3 variant of existing)

- **Anchors:** ≥3× instances across batch (e.g., `Messy Files → Key Questions → Clear Story`, `SERVER Tools → HOST Connects → MODEL Uses`)
- **Aspect:** 16:9
- **Description:** N=3 variant of VOTE2 §4 #4 `FourStageHorizontalFlowDiagram`. Same dark-slate slab, same colored card outline + chevron pattern, but **three** cards instead of four. Confirms Nate uses variable-N (3 or 4) for this primitive depending on the conceptual count of the explanation.
- **transitionVerb:** "Show the three pipeline cards left-to-right one at a time: each card fades in and the colored arrow-chevron to its right draws in matching color before the next card appears; once all three are placed, the caption pill fades in below with the keyword tinted orange."
- **Build status:** **RECOMMENDED REFACTOR (B20 task)** — fold into existing `src/compositions/PipelineFlow16x9.tsx` with variable-N support via the schema (length of `stages[]` array determines layout).
- **Reference framing:** Same family as N=4; the variable-N realization is the architectural insight.
- **Replicability:** HIGH — schema-level change to an existing composition.

### C7 — `KaraokeWithBlueChipPullout9x16` (HIGH replicability — caption variant)

- **Anchors:** `LDb0mXNowF4` · `pW6JKTf95lo` · `6_7Tk0ZH9bU` (all 3 new Shorts in batch)
- **Aspect:** 9:16
- **Description:** Standard green-current-word karaoke caption baseline (same as Wave-6 `KaraokeWordCaptions`), PLUS a blue rounded-pill **keyword chip** that slides in from the right edge into the lower-third for one keyword per beat. The chip persists ~1.5–2s then slides back out before the next chip pulls in. Used on every Wave-7 Batch 3 Short.
- **transitionVerb:** "Hold the green-current-word karaoke baseline running underneath; for each beat, slide a blue rounded-pill keyword chip in from the right edge of the lower-third, hold while the keyword is spoken, then slide it back out before the next chip pulls in."
- **Build status:** **NOT YET BUILT — on queue (B24).**
- **Reference framing:** Combines existing `KaraokeWordCaptions` baseline with a new `<KeywordPullChip>` molecule. Caption-layer enhancement, not a new composition.
- **Replicability:** HIGH — extend `src/components/captions/` with a `keywordChipSchedule?: Array<{ word, startMs, endMs }>` prop.

---

## 3. Wave-7 Batch 3 strategic findings (R4B corrections)

These two corrections are the highest-value output of the +15 batch. Both REVERSE earlier hypotheses.

### Correction 1 — 16:9 vocab was hypothesized WRONG

**Hypothesized (pre-Batch-3):** Nate's 16:9 lane would extend into the following templates: `ChartHero16x9`, `TimelineHorizontal16x9`, `SidebarSourceCitation16x9`, `TwitterScreencap16x9`.

**Disproved:** NONE of those four templates appeared in Nate's 15 new long-form videos. The hypothesis was wrong.

**Actually shared 16:9 vocab observed across the +15 batch:**

a. **Dark-slate slab backplate** (~`#0F1419` to `#152436` radial gradient) on every full-screen graphic
b. **Translucent brand-glyph watermark** (helmet+glasses, ~60% opacity) positioned lower-left or lower-third, behind foreground graphics
c. **Typographic card stacks** with role-coded accent borders (gray / blue / green / orange / violet — same Wave-6 5-color palette confirmed)
d. **Caption pill** with ONE orange-tinted keyword (lowercase sentence + bordered pill — Wave-6 finding confirmed at higher frequency)
e. **Persistent handle chip lower-right** (`@nate.b.jones` / rotating CTA copy — Wave-6 confirmed)

**Reference framing for the actual vocab:** **"Stripe Press in motion."** Editorial restraint, no data-viz chrome, no decorative iconography. The motion graphic IS the typography.

**Implication for our pipeline:** When porting a request to "look like Nate's 16:9 lane," we should NOT build chart heroes or timeline strips. We SHOULD ship dark-slate + helmet-glyph + typographic card stacks + orange-keyword caption pills.

### Correction 2 — Aspect duality is NEGATIVE (not positive)

**Hypothesized (pre-Batch-3):** Nate's long-form 16:9 motion-graphic vocab is the same vocab as his Shorts 9:16, just rescaled / cropped.

**Disproved:** Long-form and Shorts use **DIFFERENT** visual grammars. They share only ONE element across both lanes.

**Evidence from the +15 batch:**

- None of the 6 new long-form patterns (N1–N6) appeared in any of the 3 new Shorts (`LDb0mXNowF4`, `pW6JKTf95lo`, `6_7Tk0ZH9bU`).
- All 3 new Shorts ran the C7 `KaraokeWithBlueChipPullout9x16` pattern with NO inserted slate cards, NO equation chains, NO contrast columns.
- The ONLY continuous element across both lanes is `HandleChipLowerRight` (Wave-6 VOTE2 §4 #8).

**Implication for our pipeline:** A 16:9 → 9:16 port for Nate-grammar content should:

1. STRIP the dark-slate cards entirely
2. STRIP the helmet-glyph watermark backplate (it doesn't appear behind talking heads on Shorts)
3. KEEP the handle chip lower-right
4. ADD the `KaraokeWithBlueChipPullout9x16` caption stack as the primary motion vocabulary

This is a **NEGATIVE design correction** — the wrong move is "shrink the 16:9 cards into 9:16"; the right move is "drop the cards and live on the caption layer."

---

## 4. Cross-creator overlaps (Wave-7 Batch 3 view)

### Confirmations — Nate corroborates

- **Dark-slate backplate + glyph watermark + typographic stacks** — matches `alexhormozi` long-form (see `references/creators/alexhormozi/ANALYSIS.md`), `theaiadvantage`, `sahilbloom` (see `references/creators/sahilbloom/ANALYSIS.md`). This is a **cross-creator 16:9 primitive** for the editorial-AI-essay register.
- **Karaoke caption discipline on Shorts** — matches `alexhormozi`, `sahilbloom`, `diysmartcode`. Nate sits in the "captions always on for Shorts" cohort with the active-word color being **green** (Nate) vs yellow (Hormozi) vs cyan (Sahil) — same craft, different palette per brand.
- **Caption pill with one accent-colored keyword** — matches editorial-essay creators broadly.

### Disprovals — Nate does NOT corroborate

- **`ChartHero16x9`** — single-creator template (Nate does NOT use it; the hypothesis that it was cross-creator is wrong)
- **`TimelineHorizontal16x9`** — single-creator template
- **`SidebarSourceCitation16x9`** — single-creator template
- **`TwitterScreencap16x9`** — single-creator template

**Implication:** Templates 1–4 above stay in the catalog but should not be tagged as "cross-creator confirmed." They are creator-specific primitives.

---

## 5. Build queue derived from this analysis

Build-task IDs are referenced by future implementation agents. Source-of-truth citation for each task → THIS file + the specific pattern section above.

### Done

- **B19 — `EquationCardChain16x9`** → built at `src/compositions/EquationCardChain16x9.tsx` (citation: §2 N3)
- **B22 — `ThreeRowLabeledCardStack16x9`** → built at `src/compositions/ThreeRowLabeledCardStack16x9.tsx` (citation: §2 N1)

### Queued

- **B20 — variable-N support on `PipelineFlow16x9`** → schema change to accept `stages[]` of length 3 or 4 (citation: §2 N6)
- **B21 — `connectorGlyph` prop on `BeforeAfterText16x9`** → add `'TO' | 'VS' | '→'` variant (citation: §2 N5)
- **B24 — `KaraokeWithBlueChipPullout9x16`** → new caption-layer keyword chip pullout for `src/components/captions/` (citation: §2 C7)

### Future (not yet ticketed)

- **B?? — `ThreeStageRisingBars16x9`** → new composition for narrative bar towers (citation: §2 N2)
- **B?? — `TopHeroBottomTrioCards16x9`** → new composition for hero + supporting trio (citation: §2 N4)

### Standing recommendations (from Wave-6, still active)

- See `ANALYSIS-VOTE1.md` §4 #1–#9 for the original Wave-6 priorities (NamedCardEquation, TreeOfChildCardsWithEmphasisPill, BigNumberHorizontalBars, etc.).
- See `ANALYSIS-VOTE2.md` §7 for the consolidated build-priority queue (TitleCardKineticTwoLine16x9, PipelineFlow16x9, etc.).
- See `docs/research/wave-6/natebjones-consensus.md` for the cross-voter consolidated rankings.

---

## 6. Anti-findings (R4B explicit rejections)

Things we explicitly DO NOT adopt for our brand voice, based on Wave-7 Batch 3 evidence:

1. **No chart-data-with-presenter-PIP for our 16:9 lane.** R4B disproved this is part of Nate's vocab. If a future request says "make a Nate-style chart-with-talking-head," we push back — that's not a Nate pattern.
2. **No movie-clip B-roll.** Nate does not use it (neither does our brand). Different from `sahilbloom` (who does — see his ANALYSIS.md §6 anti-finding).
3. **No 38-min long-form structure.** Out of scope for our delivery (we are 9:16 short-form first; 16:9 long-form is a separate ADR).
4. **No "shrink the slate cards into 9:16" port.** Per Correction 2 above, this is the WRONG move. Shorts live on the caption layer.
5. **No watermark drop on Shorts.** The helmet-glyph backplate does NOT appear on Shorts; only the handle chip persists. Don't slap the watermark on every Short by default.
6. **No timeline-horizontal-strip for AI-news content.** R4B disproved this is shared vocab. Single-creator template only.
7. **No twitter-screencap inserts as a Nate-shared primitive.** Same as #6.

---

## 6b. Wave-7 Batch 3 — per-video distillation (15 videos)

Per-video evidence for Section 2 patterns. Long-form duration in seconds from `picks-wave7-batch3.json`. Pattern column reports the FIRST-class pattern instances identified during the +15 scan; entries with only `TitleCardKineticTwoLine` confirm the Wave-6 dominant primitive at higher frequency without introducing a new N# pattern.

### Long-form 16:9 (12 videos)

| Video ID | Title (short) | Dur (s) | New / re-confirmed patterns |
|---|---|---|---|
| `n0nC1kmztSk` | Cursor agent wiped a database | 711 | N1 (t≈300s) |
| `NRBQmwlILjk` | Shopify CEO secret AI dev | 985 | N1 (t≈300s) |
| `Poyi6X7rOwY` | Why the AI boom hits a wall | 1417 | TitleCardKineticTwoLine ×n |
| `ltbzgzZZmgI` | One AI writing hack | 1311 | TitleCardKineticTwoLine ×n |
| `ogTLWGBc3cE` | Opus 4.7 / OpenAI 5.5 prompting obsolete | 1504 | N3 (×2), N2 (t≈435s), N4 (t≈920s), N5 (t≈315s), N6 |
| `zP6TnEiueEc` | Google I/O stitching MCP/A2A/AG-UI | 1242 | N3 (×2), N2 (t≈105s), N4 (t≈830s), N6 |
| `725QE_LNXT4` | The Prove-It Economy | 1343 | TitleCardKineticTwoLine ×n |
| `LIkYVsxMpS8` | Automate / Build / Buy / Hire / Wait on AI | 1666 | TitleCardKineticTwoLine ×n |
| `dm3_Z-5PYnQ` | Anthropic Mythos beats GPT-5.5 at hacking | 1458 | TitleCardKineticTwoLine ×n |
| `adNErrz2aA0` | SaaS bill second meter | 983 | TitleCardKineticTwoLine ×n |
| `jwtpMSRAPAQ` | Trillion-dollar agentic workflow | 1553 | TitleCardKineticTwoLine ×n |
| `lqiwQiDglGk` | Pinecone demotes vector search | 1209 | TitleCardKineticTwoLine ×n |

**Cumulative pattern counts in this batch:** TitleCardKineticTwoLine ≥9 new instances · N1 ×2 · N2 ×2 · N3 ×4 · N4 ×2 · N5 ×1 · N6 ×3.

### Shorts 9:16 (3 videos)

| Video ID | Title (short) | New patterns observed |
|---|---|---|
| `LDb0mXNowF4` | The ultimate Claude AI prompting trick | C7 (full duration) |
| `pW6JKTf95lo` | Why millions are switching to Claude | C7 (full duration) |
| `6_7Tk0ZH9bU` | Why you're using Claude completely wrong | C7 (full duration) |

**Cumulative caption count:** C7 ×3 (100% of new Shorts in batch use the keyword-chip pullout variant).

---

## 7. Sources & artifacts

- **Picks files:** `references/creators/natebjones/picks-vote1.json` · `picks-vote2.json` · `picks-wave7.json` · `picks-wave7-batch3.json`
- **Voter analyses:** `references/creators/natebjones/ANALYSIS-VOTE1.md` · `ANALYSIS-VOTE2.md`
- **Wave-6 consensus:** `docs/research/wave-6/natebjones-consensus.md`
- **Analyzed-videos manifest:** `references/creators/natebjones/analyzed-videos.json` (`analyzed_count: 39`)
- **Wave-6 animation-ranges JSONs:** `references/creators/natebjones/animation-ranges-vote1.json` · `animation-ranges-vote2.json`
- **Per-video frames:** `references/creators/natebjones/<videoId>/frames/` (vote1-anim-* prefix from voter 1; v2-anim-* prefix from voter 2; wave7-batch3 frames generated per-video)
- **Reference clips Wave-6:** `docs/research/wave-6/references/natebjones/<videoId>-vote1-anim-NN.mp4` (voter 1) · `<videoId>-anim-NN-v2.mp4` (voter 2)
- **Reference clips Wave-7 Batch 3:** `docs/research/wave-6/references/natebjones/<videoId>-anim-{01,02}.mp4` — 30 clips, ≤1.1 MB each, audio-stripped
- **YouTube channel:** https://www.youtube.com/@NateBJones
- **Cross-referenced creators:** `references/creators/sahilbloom/ANALYSIS.md` (editorial-restraint peer, cyan-karaoke vs Nate's green) · `references/creators/alexhormozi/ANALYSIS.md` (caption-on-talking-head peer, yellow vs green active word) · `references/creators/diysmartcode/ANALYSIS.md` (opposite-end-of-decoration peer)

---

## 8. Closing call

Nate B Jones is the **canonical Stripe-Press-in-motion reference** for our 16:9 lane: dark slate + typographic cards + orange-keyword caption pill + helmet-glyph watermark + handle chip. His 9:16 lane is a SEPARATE design vocabulary — karaoke + handle chip + (now) blue keyword pullout chip. The two lanes are NOT the same vocabulary rescaled.

After Wave-7 Batch 3, the Nate corpus stands at **39 videos**, with **6 new first-class 16:9 patterns** (N1–N6, 2 already built / 2 refactors queued / 2 new compositions queued) and **1 new Shorts caption variant** (C7, queued as B24).

Future build agents implementing Nate-grammar content should cite the relevant pattern section in this file (§2 N1–N6, C7) plus the originating voter analysis (VOTE1 or VOTE2) for full traceability.
