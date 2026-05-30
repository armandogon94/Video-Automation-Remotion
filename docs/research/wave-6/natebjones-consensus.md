# Nate B Jones motion-graphics — voter consensus

> Synthesis of two independent voter analyses:
> - Voter 1: `references/creators/natebjones/ANALYSIS-VOTE1.md` (298 lines)
> - Voter 2: `references/creators/natebjones/ANALYSIS-VOTE2.md` (222 lines)
>
> Source artifacts:
> - Picks: `references/creators/natebjones/picks-vote{1,2}.json`
> - Animation ranges: `references/creators/natebjones/animation-ranges-vote{1,2}.json`
> - Channel info: `references/creators/natebjones/info.json`, `info-vote2.json`
> - Dense frames per voter (`vote1-anim-*` and `v2-anim-*` prefixed) under `references/creators/natebjones/<videoId>/frames/`
> - Reference clips: `docs/research/wave-6/references/natebjones/<videoId>-vote1-anim-NN.mp4` (voter 1) and `<videoId>-anim-NN-v2.mp4` (voter 2)
>
> This consensus does NOT modify either voter's analysis. Pure synthesis.

---

## 1. Voter picks overlap

Total unique videos sampled across both voters: **10** (6 vote1 + 8 vote2 – 4 overlaps). Vote1 analyzed 6 of its 8 picks (2 dropped: `tJB_8mfRgCo` not picked, `9aIYhjeYxzM` resume-download-incomplete). Vote2 analyzed all 8 of its picks.

| Video ID | Title (short) | Format | Vote1 status | Vote2 status |
|---|---|---|---|---|
| `iUSdS-6uwr4` | RTX 5090 / Mac Studio / DGX Spark | 16:9 long-form | analyzed (2 anims) | analyzed (4 anims) |
| `woGB2vr5wTg` | 5 Infrastructure Giants | 16:9 long-form | analyzed (2 anims) | analyzed (`TalkingHeadOnlyNoOverlays`) |
| `eszYRrsIdHg` | 30¢ database / infinite memory | 9:16 Short | analyzed (1 anim) | analyzed (talking-head + karaoke only) |
| `9aIYhjeYxzM` | GPT-5.5 vs Claude vs Gemini | 16:9 long-form | skipped (download incomplete) | analyzed (2 anims) |
| **Vote1-only picks** | | | | |
| `FtCdYhspm7w` | Anthropic $2.5B leak | 16:9 long-form | analyzed (7 anims) | not picked |
| `5RCsb9XMuIU` | AI memory mistake | 9:16 Short | analyzed (1 anim) | not picked |
| `oWIXee9h3nU` | Codex valued a house in India | 9:16 Short (podcast cutdown) | analyzed (1 anim) | not picked |
| **Vote2-only picks** | | | | |
| `z3pbrFKVyQE` | Infrastructure Nightmare Nobody Is Talking About | 16:9 long-form (46 min) | not picked | analyzed (1 anim — `SplitScreenInterviewLayout`) |
| `DVS-cTSVKv4` | How to build a 10-cent AI brain | 9:16 Short | not picked | analyzed (1 outro anim) |
| `xkC_WDLmfS8` | Why switching AI models is now impossible | 9:16 Short | not picked | analyzed (talking-head + karaoke only) |
| `x8Y404We8O8` | 2025 Prompting vs 2026 Prompting | 9:16 Short | not picked | analyzed (talking-head + karaoke only — negative finding) |

**Overlap summary**
- **Shared (both voters)**: 4 videos (`iUSdS-6uwr4`, `woGB2vr5wTg`, `eszYRrsIdHg`, `9aIYhjeYxzM`).
- **Vote1-exclusive**: 3 videos (1 long-form, 2 shorts).
- **Vote2-exclusive**: 4 videos (2 long-form, 2 shorts).
- The richest single video by motion-graphic density is **`FtCdYhspm7w`** (7 anims, vote1-only) — this is the largest information source vote2 missed.
- The single most-confirmed pattern (`TitleCardKineticTwoLine`) only emerged because vote2 sampled `9aIYhjeYxzM` while vote1 did not — vote1 saw its precursor in `iUSdS-6uwr4` but mis-labeled it (see §2 conflicts).

---

## 2. Pattern catalog (HIGH / MED / LOW)

Combining vote1 (13 patterns) and vote2 (9 patterns), normalizing equivalent names. Status is HIGH when both voters independently observed it (possibly under different names), MED when only one voter saw it.

### 2.1 HIGH-confidence patterns (both voters)

| # | Canonical pattern | Vote1 name(s) + evidence | Vote2 name(s) + evidence | Combined frequency | Clip paths |
|---|---|---|---|---|---|
| H1 | `TitleCardKineticTwoLine` (16:9 section divider — bold headline + muted subtitle on dark slate + soft radial glow) | `SectionDividerTitleCard` (FtCd anim-4, t=500–522s); also describes the "section-divider" character of iUSdS anim-1 and woGB2 anim-1 in animation-ranges-vote1.json (`guessedKind: fullscreen-title-card`) | `TitleCardKineticTwoLine` (iUSdS anim-01 t=132s "Cloud Or Local", iUSdS anim-03 t=653s "Runtime Defaults", 9aIYhjeYxzM anim-01 t=132s "Moving Frontier", 9aIYhjeYxzM anim-02 t=1182s "Reference Workflow") — **4 confirmed instances** | **5+ across 3 videos** — Nate's most-used template by a wide margin | vote1: `FtCdYhspm7w-vote1-anim-04.mp4`. vote2: `iUSdS-6uwr4-anim-01-v2.mp4`, `iUSdS-6uwr4-anim-03-v2.mp4`, `9aIYhjeYxzM-anim-01-v2.mp4`, `9aIYhjeYxzM-anim-02-v2.mp4` |
| H2 | `BeforeAfterTextComparison` (two-column text contrast on dark slate, central operator word `TO`/`VS`/`→`, colored underline + uppercase tracked label per column) | `BeforeAfterTextComparison` (iUSdS anim-2 t=1790–1815s "Cloud Home → Cloud Guest") + `VsTextComparison` (woGB2 anim-1 t=340–360s "Scoped Agent vs Unknown Actor", note vote1 corrected JSON mislabel) — **2 instances** | `BeforeAfterContrastCards` (iUSdS anim-04 t=1779–1796s — same "Cloud Home / Cloud Guest" pattern with central `TO` word) — **1 instance** | **3 instances across 2 videos** (the `iUSdS` instance is the same scene; the `woGB2` instance is a vote1-only confirmation that the template is reused with `VS` as the central word) | vote1: `iUSdS-6uwr4-vote1-anim-02.mp4`, `woGB2vr5wTg-vote1-anim-01.mp4`. vote2: `iUSdS-6uwr4-anim-04-v2.mp4` |
| H3 | `KaraokeWordCaptions` / `TikTokWordCaptionsWithCtaPill` (9:16 Shorts: per-word neon-green active highlight on white) | `TikTokWordCaptionsWithCtaPill` (5RCsb anim-1, eszY anim-1) | `KaraokeWordCaptions` (DVS-cTSVKv4, xkC_WDLmfS8, eszYRrsIdHg, x8Y404We8O8 — all 4 shorts) | 6+ Shorts in corpus | vote1: `5RCsb9XMuIU-vote1-anim-01.mp4`, `eszYRrsIdHg-vote1-anim-01.mp4`. vote2: all 4 vote2 short clips |
| H4 | `PersistentCtaPillCycling` / `HandleChipLowerRight` (lower-right pill cycling between `@nate.b.jones`, `read more on substack`, `Full guide`, etc., bookshelf+glasses glyph inside the pill) | `PersistentCtaPillCycling` (6/6 videos analyzed — explicitly called out as "Nate's signature chrome, ALWAYS present") | `HandleChipLowerRight` (persistent on every talking-head shot — both long-form and shorts) | Persistent on every Nate video in the corpus | Visible in every reference clip |
| H5 | `HelmetGlyphWatermarkBehind` / `LeftEdgeAvatarWatermark` (translucent bookshelf+glasses glyph behind fullscreen-card graphics, larger and edge-anchored — not the same as the bottom-right pill) | `LeftEdgeAvatarWatermark` (iUSdS anim-1/2, woGB2 anim-1/2) — "larger faded watermark on left edge of fullscreen cards" | `HelmetGlyphWatermarkBehind` (every full-screen graphic in long-forms) | Both voters confirm, both call out the same behavior | Visible inside H1/H2 reference clips |
| H6 | `TalkingHeadOnlyNoOverlays` (deliberate restraint — entire video is talking head with only the bottom-right CTA pill) | Implicit — vote1's whole §2 ("Visual motifs") emphasizes the `talking-head ↔ fullscreen-card ↔ breath beat` cadence with cards as the only graphics | `TalkingHeadOnlyNoOverlays` (explicit pattern from `woGB2vr5wTg` — entire 20 minutes of a listicle-titled video has ZERO insert overlays) | Confirmed as a brand choice, not an oversight | vote2 references the absence pattern in `woGB2vr5wTg` — calibration evidence |
| H7 | `PipelineFlow16x9` / `FourStageHorizontalFlowDiagram` (sequential card reveal + drawn arrows between, caption pill below with one keyword tinted) | Adjacent to `TreeOfChildCardsWithEmphasisPill` family (vote1 saw similar grammar but in a "row of named cards" layout — anim-2/5/7 in `FtCdYhspm7w`); vote1 also produced `NamedCardEquation` which is the same family with typographic operators | `FourStageHorizontalFlowDiagram` (iUSdS anim-02 t=577–596s — Weights → Runtime → Endpoint → Tools, colored chevrons between) | Family of related row-of-cards-with-operator/connector patterns, observed across multiple videos | vote1: `FtCdYhspm7w-vote1-anim-02.mp4`, `FtCdYhspm7w-vote1-anim-05.mp4`, `FtCdYhspm7w-vote1-anim-07.mp4`, `iUSdS-6uwr4-vote1-anim-01.mp4`, `woGB2vr5wTg-vote1-anim-02.mp4`. vote2: `iUSdS-6uwr4-anim-02-v2.mp4` |

### 2.2 MED-confidence patterns (one voter only)

| # | Pattern | Voter | Evidence | Why MED |
|---|---|---|---|---|
| M1 | `NamedCardEquation` (N labeled cards + N–1 typographic operators `+`/`=`/`→`, colored sub-labels, emphasis pill) | vote1 only | 2 instances (`iUSdS-6uwr4` anim-1 hardware-runtime equation, `woGB2vr5wTg` anim-2 security-authority equation) | Vote2 saw the same `iUSdS` video but mapped the row-of-cards-with-connectors instance to `FourStageHorizontalFlowDiagram` at a different timestamp (t=577s, not t=665s). The `=` operator is the distinguishing feature vote2 didn't observe |
| M2 | `TreeOfChildCardsWithEmphasisPill` (parent-header + 3–4 child-card row + bottom emphasis pill — `DecisionTree` family in 16:9) | vote1 only | 3 instances in `FtCdYhspm7w` (anim-2 Tool Registry, anim-5 Claude Code Operationalize, anim-7 Permission types) | Vote2 did not pick `FtCdYhspm7w`. The richest motion-graphic video in the corpus was vote1-exclusive |
| M3 | `BigNumberHorizontalBars` (hero count-up number + 5 stacked colored bars with per-row counts + emphasis pill) | vote1 only | 1 instance (`FtCdYhspm7w` anim-3 "Security Stack / 18 modules") | Vote2 did not pick `FtCdYhspm7w` |
| M4 | `StackedProgressParentChild` (parent hero number "0" / "Primitives" + 3 colored dot-progress child rows) | vote1 only | 1 instance (`FtCdYhspm7w` anim-1, t=292s) | Vote2 did not pick `FtCdYhspm7w` |
| M5 | `BenchmarkBarsPercent` (Framework Quality / 4 percent-labeled progress bars at 85%/72%/91%/68%) | vote1 only — JSON only | `animation-ranges-vote1.json` anim-4 (t=500–522s of `FtCdYhspm7w`) — listed as distinct from anim-3's `BigNumberHorizontalBars` but ranges overlap heavily | Vote1's prose §3 collapses this into the `SectionDividerTitleCard` description for anim-4 (the captured frame at t=500 shows the title card, not the percent bars). Frames + JSON disagree — flagged in vote1 §8 open questions |
| M6 | `TwoColumnRedGreenContrast` (left red-warning + scattered icons / right green-check, vertical divider — distinct from H2 because it uses icons instead of typography) | vote1 only | 1 instance (`FtCdYhspm7w` anim-6, t=1320–1340s) — vote1 self-flagged LOW confidence because the captured frames don't fully confirm the JSON description | Sampled frames mostly show talking-head and breath-beat; the actual diagram frames may fall outside the sampled bracket. Vote1 explicitly asked vote2 to re-sample at t≈1325–1340s (vote2 did not pick this video) |
| M7 | `SplitScreenInterviewLayout` (16:9 50/50 webcam podcast layout — persistent for entire video) | vote2 only | 1 instance (`z3pbrFKVyQE` t=580–595s representative, persistent for 95% of 46-min duration) | Vote1 did not pick `z3pbrFKVyQE`. Structural, not episodic |
| M8 | `DisconnectedCardsDiagram` (9:16 outro — irregular constellation of 4 product cards with yellow `×` marks between adjacent pairs) | vote2 only | 1 instance (`DVS-cTSVKv4` t=53–59s, the outro of a Short) | Vote1 did not pick `DVS-cTSVKv4`. Outro-of-a-Short — distinct from any vote1 pattern |
| M9 | `Podcast2UpVerticalCrop` (9:16 podcast clip with central letterboxed band + blurred pillarbox top/bottom) | vote1 only | 1 instance (`oWIXee9h3nU` full 100.5s) | Vote2 did not pick `oWIXee9h3nU`. Vote1 self-flagged as DEPRIORITIZED (we don't currently produce podcast cutdowns) |
| M10 | `EmphasisWordCaptionPill` (bordered rounded pill at bottom of fullscreen card containing a full sentence with ONE word colored orange — `Layered`, `harness`, `3 types`, `matches`, `substrate`) | vote1 only as a discrete pattern | 5+ instances across `FtCdYhspm7w` anim-3/5/7, `iUSdS-6uwr4` anim-1/2 | Vote2 observed the device inside `FourStageHorizontalFlowDiagram` ("caption pill 'Runtime makes local AI feel normal' with 'Runtime' tinted orange") and `BeforeAfterContrastCards` but did not catalog it as its own pattern. **Functionally HIGH** — both voters saw it; only vote1 cataloged it independently |
| M11 | `DarkGradientBreathBeat` (deliberate 0.5–1.5s pure-gradient pause card between talking-head and fullscreen-card — editing rhythm, not a template) | vote1 only | Observed in `FtCdYhspm7w` anim-6 frame-013; called out as "rhythm rule, not template" | Vote2 didn't catalog rhythm rules separately, but vote2's description of "section divider that fades in and fades out" implicitly includes the breath beat |

### 2.3 LOW-confidence / disagreements / conflicts

| Conflict | Vote1 | Vote2 | Resolution |
|---|---|---|---|
| **`iUSdS-6uwr4` row-of-cards layout** | Cataloged as `NamedCardEquation` (4 cards with `+` and `=` operators at t=665s) | Cataloged as `FourStageHorizontalFlowDiagram` (4 cards with chevron arrows at t=577s) | **These are two different scenes in the same video, not a conflict.** Vote1 saw t=665 (equation pattern). Vote2 saw t=577 (chevron-arrow pattern). Both are valid; they're sibling templates. Frequency: equation pattern has 2 instances (`iUSdS` + `woGB2`); chevron-arrow pattern has 1 instance (`iUSdS`) but is structurally close to `NamedCardEquation` and can share a base molecule |
| **`FtCdYhspm7w` anim-3 vs anim-4 (overlapping ranges)** | Anim-3 `BigNumberHorizontalBars` at [500, 525] and Anim-4 `SectionDividerTitleCard` at [500, 522] — vote1 explicitly flagged as open question (likely one composite 25-second scene split into two ranges) | Did not analyze `FtCdYhspm7w` | **Open** — needs frame re-sampling. Vote1 §8 open question #2. Action: re-extract frames at fine resolution between t=500 and t=525 to determine whether the title-card and bars-card are sequential within the same scene |
| **`woGB2vr5wTg` anim-1 JSON mislabel** | Vote1 noted: JSON anim-1 was labeled `fullscreen-title-card` but captured frames at t=340 clearly show a `VsTextComparison` (Scoped Agent vs Unknown Actor) — vote1 corrected the catalog | Did not catalog this video's animations at all (cataloged it as `TalkingHeadOnlyNoOverlays` for the entire duration) | **Conflict** — vote1 found 2 anims at t=340 and t=370. Vote2 saw nothing animated in this 20-min video. **Likely both are partially right:** the 2 anims vote1 found are real (visual evidence in frames), but the majority of the 20 minutes is indeed undecorated talking head, which is vote2's broader observation. Vote2's "ZERO overlays" is too strong; should be "essentially no overlays except 2 brief title-card moments in the 340–390s range" |
| **`woGB2vr5wTg` anim-2 `watermark-fade-transition` JSON** | Vote1 noted: JSON described this as "breath-beat" but captured frame-001 shows a fully-formed 4-card `NamedCardEquation` — vote1 cataloged the equation, not the breath beat | Not analyzed | Resolution: vote1's prose §3.3 wins — `NamedCardEquation` is the correct pattern at t=370–390s of `woGB2vr5wTg` |

---

## 3. User-claim final verdict

**The user said Nate "adds our style of animations."**

| Voter | Verdict | Caveats |
|---|---|---|
| Vote1 | **CONFIRMED** with two caveats | (1) Nate's "our style" patterns are almost all **16:9 long-form**, while our existing 67 compositions are 9:16-only; (2) Nate cuts together 2–3 different talking-head recording sessions per long-form (multi-rig editing not modeled in our pipeline) |
| Vote2 | **PARTIALLY CONFIRMED** | Match in *type* of motion graphic but NOT *quantity*. Nate uses **a narrow subset** of our library — section-divider title cards + occasional flow diagrams. He does NOT do animated charts, animated tables, animated counters, Venns, force graphs, token streams, terminal blocks, code diffs, tweet cards, or app-UI mockups. Nate's restraint is closer to Simon Hoiberg than to Carlos Cuamatzin |

### Consensus net verdict

**CONFIRMED with three important nuances:**

1. **Family match, density mismatch.** Both voters agree the *family* of motion graphics Nate uses (kinetic title cards, sequential card reveals with arrows/operators, before/after typography, emphasis-word caption pills) is the same family we already build. The mismatch is **per-video density**: Nate ships 1–7 motion-graphic moments per 20–46 min long-form; our composition library assumes much higher density. To "produce content like Nate," we should *under-build* relative to our default density.

2. **Orientation lane mismatch.** Nate's 16:9 long-form is the lane where his motion-graphic library lives. Our existing 67 compositions are 9:16-only. The user has explicitly stated they want 16:9 templates (per task brief), which **unblocks the largest part of Nate's playbook for us**. Without opening the 16:9 lane, Nate's contribution to our library is limited to chrome enhancements (`PersistentCtaPillCycling`, `EmphasisWordCaptionPill`, `LeftEdgeAvatarWatermark`).

3. **Restraint is the brand.** Both voters independently flagged Nate's deliberate restraint — vote2 explicitly called out `TalkingHeadOnlyNoOverlays` in `woGB2vr5wTg` (a 20-min "5 Infrastructure Giants" listicle video with ZERO listicle graphics) as a calibration point. This is unusual evidence: **the title structure of a Nate video does NOT predict whether he'll animate it.** This is meaningful for our pipeline if we want to faithfully replicate his style — we should add a "graphics density" knob, not always-on listicle reveals.

---

## 4. Orientation breakdown

This is load-bearing for build decisions because the user explicitly wants 16:9 templates.

### 4.1 16:9-only patterns (long-form territory)

These exist in Nate's 16:9 work and have no 9:16 analog in his corpus:

| Pattern | Voter support | Frequency | Notes |
|---|---|---|---|
| H1 `TitleCardKineticTwoLine` | both | 5+ | Highest-frequency Nate pattern. Direct sibling of our `KineticTypoCard9x16` |
| H2 `BeforeAfterTextComparison` | both | 3 | Adjacent to `CodeDiffBeforeAfter9x16` but text-only |
| H7 `PipelineFlow / FourStageHorizontalFlowDiagram` | both | 2+ family | Adjacent to `PipelineFlow9x16` but horizontal layout |
| M1 `NamedCardEquation` | vote1 only | 2 | Distinct from H7 because uses typographic operators (`+`, `=`) instead of arrows |
| M2 `TreeOfChildCardsWithEmphasisPill` | vote1 only | 3 | 16:9 variant of `DecisionTree9x16` |
| M3 `BigNumberHorizontalBars` | vote1 only | 1 | 16:9 variant of `BarChartList9x16` |
| M4 `StackedProgressParentChild` | vote1 only | 1 | Adjacent to M3 but uses dot-progress |
| M6 `TwoColumnRedGreenContrast` | vote1 only, low-conf | 1 | Defer pending re-sample |
| M7 `SplitScreenInterviewLayout` | vote2 only | 1 (structural) | 16:9 variant of `SplitWebcamScreen9x16` |

**9 patterns** are 16:9-only in Nate's corpus.

### 4.2 9:16-only patterns

| Pattern | Voter support | Frequency | Notes |
|---|---|---|---|
| H3 `KaraokeWordCaptions` | both | 6+ Shorts | Already covered by existing primitives |
| M8 `DisconnectedCardsDiagram` | vote2 only | 1 | Could be ported to 16:9 trivially — semantically not orientation-locked |
| M9 `Podcast2UpVerticalCrop` | vote1 only | 1 | Deprioritized — we don't produce podcast cutdowns |

**3 patterns** are 9:16-only in Nate's corpus.

### 4.3 Patterns that work in both orientations (chrome / cross-cutting)

| Pattern | Voter support | Notes |
|---|---|---|
| H4 `PersistentCtaPillCycling` / `HandleChipLowerRight` | both | Bottom-right chip — orientation-agnostic |
| H5 `HelmetGlyphWatermarkBehind` / `LeftEdgeAvatarWatermark` | both | Edge-anchored watermark — orientation-agnostic but positioning needs orientation prop |
| H6 `TalkingHeadOnlyNoOverlays` | both | A rule, not a template — applies in both orientations |
| M10 `EmphasisWordCaptionPill` | vote1 only as named pattern | Already partially covered by `<TextEmphasis>` in 9:16; needs port for 16:9 |
| M11 `DarkGradientBreathBeat` | vote1 only | Editing rhythm rule, orientation-agnostic |

**5 chrome/rule patterns** work in both orientations.

### 4.4 Recommendation: horizontal-first vs vertical-first build queue

**Horizontal-first builds (16:9 sibling compositions of existing 9:16 work):**
1. `TitleCardKineticTwoLine16x9` — direct port of `KineticTypoCard9x16`. The highest-ROI Nate addition.
2. `PipelineFlow16x9` — port of `PipelineFlow9x16`. Supports both chevron-arrow (vote2) and typographic-operator (vote1 `NamedCardEquation`) variants via a `connectorStyle` prop.
3. `BeforeAfterText16x9` — new molecule. Distinct from `CodeDiffBeforeAfter9x16` because it's plain typography on dark slate.
4. `TreeOfChildCardsWithEmphasisPill16x9` — 16:9 variant of `DecisionTree9x16` with emphasis-pill slot.

**Vertical-first builds (9:16 — retrofit and chrome only):**
1. `BrandWatermark.cycleLabels` enhancement — Nate's signature CTA cycle, deployable to existing 9:16 templates.
2. `EmphasisPill` molecule — extend `<TextEmphasis>` with a bordered-pill wrapper variant. Retrofits to existing 9:16 compositions.
3. `LeftEdgeAvatarWatermark` variant of `BrandWatermark` — small additive prop.

**Defer** the 9:16-only patterns until content needs arise:
- `DisconnectedCardsDiagram9x16` — single instance in corpus, can wait
- `Podcast2UpVerticalCrop` / `SplitScreenInterviewLayout16x9` — we don't produce podcast/interview content today

---

## 5. Unified build priority queue

Merged across both voters, ranked by ROI (cross-voter confidence × frequency × effort-to-ship × strategic fit with the 16:9-lane decision).

| Rank | Pattern (proposed name) | Type | Unlocks | Effort | Orientation | Voter support |
|---|---|---|---|---|---|---|
| 1 | `BrandWatermark.cycleLabels` enhancement | Component prop | Signature Nate chrome on every output (both engines, both orientations); also unlocks `HandleChipLowerRight` | XS (<1h) | Both | HIGH (both, H4) |
| 2 | `EmphasisPill` molecule (extend `<TextEmphasis>`) | Component | Caption-pill device used in 5+ Nate hero cards + retrofittable to existing 9:16 compositions | S (1–2h) | Both | HIGH (vote1 cataloged, vote2 observed inside H2/H7 frames — functionally HIGH) |
| 3 | `TitleCardKineticTwoLine16x9` | New composition | Most-frequent Nate pattern (5+ instances). Section-divider for long-form 16:9 lane. Sibling of `KineticTypoCard9x16` | S (1–2h) | 16:9 | HIGH (both, H1) |
| 4 | `PipelineFlow16x9` (with `connectorStyle: 'chevron' \| 'operator'` prop) | New composition (or generalize 9:16) | Sequential card reveal — covers BOTH vote1 `NamedCardEquation` (operators `+`/`=`) AND vote2 `FourStageHorizontalFlowDiagram` (chevron arrows). 3 instances combined | S–M (4–8h) | 16:9 | HIGH (both, H7 + M1) |
| 5 | `BeforeAfterText16x9` | New composition | Two-column conceptual contrast (3 instances across `iUSdS` + `woGB2`). Parameterize connector word (`TO` / `VS` / `→`) | M (4–8h) | 16:9 | HIGH (both, H2) |
| 6 | `LeftEdgeAvatarWatermark` variant of `BrandWatermark` | Component prop | Behind-the-card branding watermark — Nate's secondary chrome | XS (<1h) | Both | HIGH (both, H5) |
| 7 | `TreeOfChildCardsWithEmphasisPill16x9` | New composition (16:9 variant of `DecisionTree9x16`) | 3 instances in `FtCdYhspm7w`. Parent-header + 3–4 child cards + bottom emphasis pill | M (4–8h) | 16:9 | MED (vote1 only — M2; vote2 missed by not picking `FtCdYhspm7w`) |
| 8 | `SectionDividerTitleCard16x9` (consolidate with #3 or add as variant of `BrandedOpener9x16`) | Variant | Pure section break, no data. May be redundant with #3 if #3 supports a "no-data, headline-only" mode | S (1–2h) | 16:9 | HIGH (both, H1 subset) |
| 9 | `BigNumberHorizontalBars16x9` | New composition | Count-up hero + N full-width colored bars + emphasis pill. 16:9 variant of `BarChartList9x16` | M (4–8h) | 16:9 | MED (vote1 only — M3) |
| 10 | `StackedProgressParentChild16x9` (or merge with #9) | New composition | Parent hero number + 3 colored dot-progress child rows. Could be merged with #9 as one configurable `BigNumberWithChildRows16x9` | M (4–8h) | 16:9 | MED (vote1 only — M4) |
| 11 | `DarkGradientBreathBeat` editing-rule documentation | Doc only — `docs/prompts/animation-replication-runbook.md` addition | Pacing rule: 0.5–1.5 s pure-gradient pause between talking-head and fullscreen-card | XS | Both | MED (vote1 only — M11; vote2 implicit) |
| 12 | `SplitScreenInterviewLayout16x9` | New composition | 16:9 podcast/interview layout — vertical midline split. Sibling of `SplitWebcamScreen9x16` | M (4–8h) | 16:9 | MED (vote2 only — M7). Defer: we don't currently produce podcast/interview content |
| 13 | `DisconnectedCardsDiagram9x16` | New composition | 9:16 outro diagram with `×` marks between cards | M (4–8h) | 9:16 | MED (vote2 only — M8). Single corpus instance |
| 14 | `TwoColumnRedGreenContrast16x9` | New composition | Distinct from #5 because uses warning-triangle/check icons + scattered person icons | M (4–8h) | 16:9 | LOW (vote1 only, self-flagged low-confidence — M6). Defer pending frame re-sample |
| 15 | `Podcast2UpVerticalCrop` | New composition | 9:16 podcast clip with letterbox + blurred pillarbox. | M (4–8h) | 9:16 | LOW. Defer indefinitely — out of scope |

---

## 6. Critical findings

### F1 — Nate's restraint is a brand choice, not an oversight

Vote2 found that `woGB2vr5wTg` ("These 5 Infrastructure Giants Secretly Rule AI") — a 20-minute video with a listicle-titled hook — contains **zero listicle motion graphics**. The only persistent overlay is the lower-right `read more on substack` chip. Vote1 also picked this video but found 2 brief title-card moments (at t=340 and t=370). The combined picture: in a 20-minute "5 Giants" video, Nate ships **2 title cards and nothing else** — no numbered intros, no "1/5" badges, no item-reveal animations, no logos.

**Implication for our pipeline:** The title structure of a video does NOT predict graphics density. If we want to faithfully replicate Nate's style, our pipeline needs a `graphicsDensity: 'minimal' | 'standard' | 'high'` knob, or at minimum a "talking-head-only with chrome" template.

### F2 — Nate uses a NARROW SUBSET of our existing library

Vote2 explicitly states: "Nate does NOT do animated charts (bars, lines, sparklines, area), animated tables, animated counters, Venn diagrams, force graphs (real graphs with edges), token streams, terminal blocks, code diffs, tweet cards, or app-UI mockups. Those are large portions of our 60-composition library that have no Nate analog." Vote1's evidence supports this — even at vote1's higher pattern count (13 patterns vs vote2's 9), most patterns are variants of two molecules: (a) title cards, (b) row-of-cards with bottom emphasis pill.

**Implication:** Adopting Nate's full library does NOT require porting all 67 of our compositions to 16:9. The Nate adoption surface is ~6 16:9 compositions, plus chrome enhancements.

### F3 — `TitleCardKineticTwoLine` is Nate's tentpole — maps 1:1 to our existing `KineticTypoCard9x16` but in 16:9

Vote2 confirmed **4 instances** across `iUSdS-6uwr4` (2) and `9aIYhjeYxzM` (2), with vote1 adding a 5th implicit instance in `FtCdYhspm7w` (anim-4). Single most-frequent Nate template. Visual treatment: dark slate slab, bold white sans (Söhne/Inter) headline ~120px, muted gray subtitle, soft radial vignette glow, helmet watermark lower-left, fade-in (~12 frames) → hold (~80 frames) → fade-out. **Our existing `KineticTypoCard9x16.tsx` is structurally identical** — the only deliverable is a 16:9 sibling composition (or a `format` prop).

### F4 — Two frame/JSON discrepancies need a second-pass

Vote1 §8 open questions surface two issues vote1 self-flagged:
1. **`FtCdYhspm7w` anim-3 vs anim-4 overlapping ranges** at `[500, 525]` and `[500, 522]`. The JSON has anim-3 as `BigNumberHorizontalBars` (Security Stack / 18 modules) and anim-4 as `BenchmarkBarsPercent` (Framework Quality / 85%/72%/91%/68%), but vote1 prose collapses anim-4 to `SectionDividerTitleCard` (Security Stack title). Captured frames at t=500 only show the title card. **Likely one composite 25-second scene with title-card → bars sequence; the JSON's two ranges are over-counting.** Needs a fine-grained re-sample.
2. **`FtCdYhspm7w` anim-6 `TwoColumnRedGreenContrast`** — vote1 saw a description in the JSON of left-red-warning + right-green-check + scattered person icons but the sampled frames at t=1320–1340 mostly show talking-head and breath-beat, not the diagram. The diagram frames may fall outside the sampled bracket. **Confidence on this pattern is LOW.**

Both are vote1-only issues; vote2 did not pick `FtCdYhspm7w`. Action: re-extract dense frames at 1 frame / 1s in those ranges before shipping `BigNumberHorizontalBars16x9` or `TwoColumnRedGreenContrast16x9`.

### F5 — Strategic decision: open the 16:9 lane

Vote1 §6 explicitly flags this as the load-bearing decision: "Our existing 67 compositions are 9:16-only. So we'd need to either (a) rotate his patterns into 9:16 (loses information density), (b) build a 16:9 sibling library of compositions, or (c) skip Nate's long-form pattern lift and only adopt the Shorts CTA-pill enhancement."

**Per the user's task brief, the user has already answered YES — they want 16:9 templates.** This consensus document therefore proceeds assuming option (b). See §8 for the architectural choice between sibling compositions and a `format` prop.

---

## 7. Cross-creator comparison

Using existing analyses at `references/creators/{carloscuamatzin,diysmartcode,bilawal.ai,simonhoiberg,alexhormozi}/ANALYSIS.md`.

| Creator | Nate's relationship | Source |
|---|---|---|
| **Simon Hoiberg** | **Closest cohort.** Vote2 explicitly: "Nate sits in the same 'restraint cohort' as Simon (long-form)." Both creators trust talking head + voice + occasional payoff graphics, NOT continuous decoration. Simon's 8/12 reels are undecorated studio talking head with no captions; Nate's long-form follows the same philosophy with the addition of section-divider title cards | vote1 §5, vote2 §5 |
| **Alex Hormozi** | **Same Shorts captions baseline.** Both creators use per-word karaoke captions on talking-head Shorts (Nate: neon-green active word; Hormozi: similar treatment). Diverges in long-form: Hormozi has zero procedural motion graphics, Nate has 6+ in long-form | vote1 §5, vote2 §5 |
| **Carlos Cuamatzin** | **Inverse density.** Carlos rotates 6 distinct templates with high decoration density (cosmic-editorial, ranked-tier, etc.); Nate uses 1 dominant template (`TitleCardKineticTwoLine`) + 3 long-tail. Both use radial-gradient dark backgrounds. Carlos's `HeadlineEmphasis` pattern maps to Nate's `EmphasisWordCaptionPill` — same device (one-word emphasis in a sentence) but different layout (Carlos is inline-headline; Nate is bottom-anchored pill) | vote1 §5, vote2 §5 |
| **DIYSmartCode** | **Opposite vocabulary.** DIYSmartCode is heavily decorated (DarkChangelog with release pills, brand bars, GitHub footers); Nate is bare typography on dark slate. Vote2: "the same content type (technical AI content) supports radically different design vocabularies." Both have a "top tracking-spaced accent label" device (Nate's colored underline + uppercase label per column in `BeforeAfterText`) | vote1 §5, vote2 §5 |
| **Bilawal.ai** | **Similar tentpole archetype.** Both run one tentpole template (Bilawal: `TweetCardOverlay`; Nate: `TitleCardKineticTwoLine`) plus cinematic alternates. Bilawal's tentpole is attribution-first (his tweet IS the brand); Nate's is pacing-first (section breaks). Bilawal trends Bloomberg-serif editorial; Nate is pure-sans Söhne/Inter | vote1 §5, vote2 §5 |

### Specific cross-creator mappings

- **Nate's `EmphasisWordCaptionPill` ⟶ our existing `<TextEmphasis>` + Carlos's `HeadlineEmphasis`** — same device, different layout. Action: extend `<TextEmphasis>` with a bordered-pill wrapper.
- **Nate's `PersistentCtaPillCycling` (6/6 videos per vote1) ⟶ NOVEL — no other creator does this.** Bilawal has persistent chrome (`TweetCardOverlay`) but it's content, not a CTA. This is a unique Nate signature worth porting verbatim.
- **Nate's `TitleCardKineticTwoLine` ⟶ our existing `KineticTypoCard9x16`** in 16:9. 1:1 mapping per F3.
- **Nate's `BeforeAfterText` ⟶ adjacent to our `CodeDiffBeforeAfter9x16` and `BigNumberDuel9x16`** but text-only — needs a new composition.
- **Nate's `PipelineFlow / FourStageHorizontalFlowDiagram / NamedCardEquation` ⟶ our existing `PipelineFlow9x16` and `DecisionTree9x16`** in 16:9 with parameterized connector style.

**Net read:** Nate occupies an uncrowded slot in the reference library — the only creator doing 16:9 long-form motion-graphic inserts with the Söhne-sans + dark-navy-radial + 5-accent + emphasis-pill grammar. This is meaningfully different from the 9:16 Carlos/Simon/Bilawal lane and from the no-motion Hormozi lane.

---

## 8. Recommendations for build phase

### 8.1 16:9 strategy — sibling compositions vs `format` prop

**Decision: ship as `format: '9:16' | '16:9'` prop on the existing composition where the layout is orientation-agnostic; ship as new `<X>16x9` sibling composition where the layout is fundamentally different.**

| Composition | Approach | Rationale |
|---|---|---|
| `KineticTypoCard9x16` → add `format` prop | Prop | Layout is centered headline+subtitle, trivially supports both orientations. Sibling would be code duplication |
| `PipelineFlow9x16` → add `format` prop + `connectorStyle` prop | Prop | Sequential card reveal works in both orientations (vertical chain in 9:16, horizontal row in 16:9). Layout direction is the only delta |
| `DecisionTree9x16` → add `format` prop | Prop | Parent-header + child-card layout works in both orientations |
| `BeforeAfterText16x9` | New sibling | No 9:16 analog; the dark-slate-with-central-operator-word is a fundamentally new molecule |
| `BigNumberHorizontalBars16x9` | New sibling | Distinct from `BarChartList9x16` (which is vertical-rows in 9:16) — horizontal-bars layout is its own composition |
| `SplitScreenInterviewLayout16x9` | New sibling | Different aspect ratio orientation (vertical midline split) — not a prop on `SplitWebcamScreen9x16` |
| `BrandWatermark` → add `cycleLabels` + `edgeAnchor` props | Props | Chrome lives on top — single component, multiple variants |

**Justification:** `format` prop minimizes surface area where layouts are mirror-symmetric; new sibling compositions are reserved for cases where the 16:9 layout is structurally different (not just rotated).

### 8.2 Top 5 builds for next sprint (cross-voter consensus)

These are the patterns with HIGH-confidence voter support AND high frequency AND low-to-medium effort AND high strategic fit with the 16:9-lane decision:

1. **`BrandWatermark.cycleLabels` enhancement** (Rank 1) — XS effort, both engines, both orientations. Nate's signature chrome. Ship first.
2. **`EmphasisPill` extension of `<TextEmphasis>`** (Rank 2) — S effort, both orientations. Retrofits to existing 9:16 catalog AND unlocks every Nate 16:9 hero card.
3. **`TitleCardKineticTwoLine16x9` (or `format` prop on `KineticTypoCard9x16`)** (Rank 3) — S effort, 16:9 only. Most-frequent Nate pattern; biggest single ROI.
4. **`PipelineFlow16x9` with `connectorStyle` prop** (Rank 4) — S–M effort, 16:9. Covers BOTH `FourStageHorizontalFlowDiagram` (vote2) AND `NamedCardEquation` (vote1) via one parameterized composition.
5. **`BeforeAfterText16x9`** (Rank 5) — M effort, 16:9. Confirmed by both voters (3 instances across 2 videos), parameterizable central operator word.

These 5 builds together cover **all HIGH-confidence Nate patterns** plus the highest-MED chrome patterns. Estimated total effort: ~1.5 weeks of work.

### 8.3 Items to defer

| Item | Reason to defer |
|---|---|
| `TreeOfChildCardsWithEmphasisPill16x9` (Rank 7) | MED confidence (vote1 only — vote2 missed by not picking `FtCdYhspm7w`). Re-sample before shipping. **However**, frequency is high (3 instances in one video) so this should ship in the SECOND sprint, not deferred indefinitely |
| `BigNumberHorizontalBars16x9` / `StackedProgressParentChild16x9` (Ranks 9–10) | Single instances each, MED confidence. Consider merging into one `BigNumberWithChildRows16x9` composition |
| `SplitScreenInterviewLayout16x9` (Rank 12) | We don't produce podcast/interview content. Re-rank if content mix changes |
| `DisconnectedCardsDiagram9x16` (Rank 13) | Single corpus instance. Low novelty |
| `TwoColumnRedGreenContrast16x9` (Rank 14) | LOW confidence — vote1 self-flagged the description doesn't match captured frames. **Re-sample before shipping** |
| `Podcast2UpVerticalCrop` (Rank 15) | Out of scope |

### 8.4 Pre-build action items

Before starting the Top 5 builds:
1. **Re-sample frames** at `FtCdYhspm7w` t=500–525 and t=1320–1340 at 1 frame/1s to resolve F4 discrepancies.
2. **Confirm CTA-pill cycle timing** — vote1 §8 open question: pill crossfades between labels at ~5–10s with ~0.3s crossfade. Verify by stepping through `5RCsb9XMuIU` or `eszYRrsIdHg` reference clip frame-by-frame.
3. **Confirm `NamedCardEquation` operator semantics** — vote1 asks whether `=` is always the final operator. Sample any additional Nate videos with row-of-cards-with-connectors layouts to validate.
4. **Document the `DarkGradientBreathBeat` rhythm rule** in `docs/prompts/animation-replication-runbook.md` — 0.5–1.5s pure-gradient pause between talking-head and fullscreen-card. No code, just a pacing instruction for the pipeline.

---

## Appendix A — Sources

- Vote1 analysis: `references/creators/natebjones/ANALYSIS-VOTE1.md`
- Vote2 analysis: `references/creators/natebjones/ANALYSIS-VOTE2.md`
- Vote1 picks: `references/creators/natebjones/picks-vote1.json` (8 picks, 6 analyzed)
- Vote2 picks: `references/creators/natebjones/picks-vote2.json` (8 picks, all analyzed)
- Vote1 animation ranges: `references/creators/natebjones/animation-ranges-vote1.json` (14 entries)
- Vote2 animation ranges: `references/creators/natebjones/animation-ranges-vote2.json` (9 entries)
- Vote1 channel info: `references/creators/natebjones/info.json` (90 videos listed)
- Vote2 channel info: `references/creators/natebjones/info-vote2.json`
- Vote1 reference clips: `docs/research/wave-6/references/natebjones/<videoId>-vote1-anim-NN.mp4` (14 clips)
- Vote2 reference clips: `docs/research/wave-6/references/natebjones/<videoId>-anim-NN-v2.mp4` (8 clips)
- Vote1 dense frames: `references/creators/natebjones/<videoId>/frames/vote1-anim-*` (308 frames, 5 videos)
- Vote2 dense frames: `references/creators/natebjones/<videoId>/frames/v2-anim-*` (79 frames)
- Cross-creator references: `references/creators/{carloscuamatzin,diysmartcode,bilawal.ai,simonhoiberg,alexhormozi}/ANALYSIS.md`
- Existing 9:16 compositions referenced for porting: `src/compositions/{KineticTypoCard9x16,PipelineFlow9x16,DecisionTree9x16,BarChartList9x16,SplitWebcamScreen9x16,CodeDiffBeforeAfter9x16,BigNumberDuel9x16,VennDiagram9x16,ForceGraph9x16,BrandedOpener9x16,TalkingHeadDynamic9x16}.tsx`
- Existing components referenced for extension: `src/components/{BrandWatermark,TextEmphasis,InfoCards,NumberPrimitives}.tsx`, `src/components/{captions,HUDChrome,MacWindow}/`
- Runbook: `docs/prompts/animation-replication-runbook.md`
