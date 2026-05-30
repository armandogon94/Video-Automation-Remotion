# ADR-001 — Open a 16:9 horizontal template lane alongside the 9:16 vertical lane

> **Status:** Accepted (2026-05-28). Writing this ADR is the acceptance.
>
> **Authors:** Wave-7 research synthesis agent, building on Wave-6 voter consensus.
>
> **Supersedes:** Implicit "9:16-only" assumption baked into 67 of the 73 compositions registered in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/Root.tsx`.
>
> **Affects:** All future composition builds, the schema layer at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`, the brand chrome at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/`, the CLI at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/generate.ts`, and the smoke-render output tree under `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/output/`.
>
> **Addenda:** §A (2026-05-28, R4B Nate +15) — vocab and aspect-duality corrections. Scroll to bottom.
>
> **One-line:** We are formally splitting the template library into two aspect lanes — 9:16 (`*9x16` suffix, 1080×1920, Shorts/Reels/TikTok) and 16:9 (`*16x9` suffix, 1920×1080, YouTube long-form/landscape) — because at least six independent reference creators (seven if we count Hormozi long-form) cannot be served from a vertical-only library.

---

## 1. Context

Wave-6 and Wave-7 reference-creator analyses surfaced an architectural mismatch: our composition library is 9:16-only, but a growing fraction of the creators we have committed to learning from work primarily — and in several cases exclusively — in **16:9 horizontal long-form**. The mismatch was identified as load-bearing in the Wave-6 Nate B Jones consensus (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/natebjones-consensus.md` §4–§5–§8), and re-confirmed by every Wave-7 creator analysis since.

### 1.1 The six (seven) independent 16:9-native references

Each creator below has produced a stand-alone ANALYSIS.md (or voter-consensus document) under `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/` and `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/`. Each was scraped, frame-extracted, and pattern-cataloged independently — none of them are claims, they are evidence.

| # | Creator | Analysis path | Native aspect | Key 16:9 patterns identified | Sample size |
|---|---|---|---|---|---|
| 1 | **natebjones** (Nate B Jones) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS-VOTE1.md` + `ANALYSIS-VOTE2.md`; consensus at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/natebjones-consensus.md` | 16:9 long-form | `TitleCardKineticTwoLine` (5+ instances), `BeforeAfterTextComparison` (3), `PipelineFlow / FourStageHorizontalFlowDiagram` (2+), `TreeOfChildCardsWithEmphasisPill` (3), `BigNumberHorizontalBars` (1), `SplitScreenInterviewLayout` (structural) | 10 videos, 2 voters, 14+ animation ranges |
| 2 | **aiexplained** (Philip / AI Explained) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/aiexplained/ANALYSIS.md` | 16:9 long-form (11–34 min) | `MemeLoopDiagram` (the closed-loop "everyone is the world's best model" pattern), `TweetCardOwnAuthorAnchor`, `BenchmarkTableScreenshot` mode | 4 of 12 picks processed (partial, see §1.2) |
| 3 | **mreflow** (Matt Wolfe / Future Tools) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/mreflow/ANALYSIS.md` | 16:9 long-form + occasional 9:16 Shorts | **`NeonRingCircularFaceCamPIP16x9`** signature, `ArticleReadAlongWithNeonPIP16x9`, `AppGridScreenRecWithPIP16x9`, `HomeStudioTalkingHead16x9` | 4 of 12 (preliminary — see §1.2) |
| 4 | **sahilbloom** (Sahil Bloom) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/sahilbloom/ANALYSIS.md` | 16:9 long-form (5–38 min) + 9:16 Shorts | 12 patterns — `HeroChapterNumeral16x9`, `EditorialStepCard16x9`, `HorizontalBarRankedList16x9`, `ChartPlusBreakdown16x9` family, and the **captions taxonomy discovery** (`register='none'` for A-roll, karaoke for B-roll) | 12 videos, 1,186 dense frames |
| 5 | **theaiadvantage** (Igor Pogany / The AI Advantage) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/theaiadvantage/ANALYSIS.md` | 16:9 long-form (8 of 12 picks) + 9:16 Shorts (4) | 12 patterns — **`StudioCompositor16x9` is the CLOSEST analog to our brand voice across the entire 22-creator corpus**, plus `GlowingPromptBarMockup16x9`, `TwoByTwoModelComparison16x9`, `FiftyFiftyFeatureMapSplit16x9`, `WarmPodcastFullBleed16x9` | 12 videos |
| 6 | **allin** (All-In Podcast / Summit) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md` | 16:9 (1280×720 ref, 1920×1080 native) | `PersistentEventLockupChyron16x9` (11/12), `SlideDeckPlusSpeakerPIP16x9` (3+), `FiveSeatPanelArmchairWide16x9`, captions register `='none'` for A-roll | 12 videos, 1,273 frames |
| 7 | **alexhormozi** (long-form sibling) | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/alexhormozi-longform-consensus.md` | 16:9 long-form (10–80 min) | Six HIGH-confidence patterns including `HormoziTweetCardListicle`, `HormoziTweetCardStackBuild`, `PaginatedListSlideTransition`, `YellowGlowLowerThird`, `WhiteboardOverheadHandDraw` | 11 videos, 2 voters |

We treat creators 1–6 as the load-bearing six independent confirmations; Hormozi long-form is bonus evidence (counted separately because Hormozi has been our 9:16 Shorts reference since Wave-3, and his long-form library is structurally a different lane). Either way, **the floor of "16:9-native creators we want to learn from" is six and the ceiling is seven.**

### 1.2 Partial-sample disclosure

Two of the six analyses (aiexplained, mreflow) processed only a partial fraction of the Wave-7 pick set due to a prior scrape-agent stall. This is acknowledged in their respective ANALYSIS.md files and does **not** affect this ADR's conclusion: even the patterns documented in the partial samples are 16:9-native, and the under-sampling can only **increase** the number of 16:9 patterns we will need to support, not decrease it. We proceed conservatively from the already-confirmed pattern set.

### 1.3 Why six independent references is past the decision threshold

The wave-6 Nate consensus (`§F5 — Strategic decision: open the 16:9 lane`) already framed this as a binary: either build 16:9 siblings, or rotate his patterns into 9:16 (information loss) and skip the long-form lift. At one creator, "wait and gather more data" was defensible. At six creators with materially-different content but materially-similar aspect requirements, "wait" becomes a cost (re-research, re-frame-extract, re-analyze) without informational return. The Wave-6 → Wave-7 trend line is monotonic: every creator we scraped added 16:9 evidence; **none** added counter-evidence.

### 1.4 What the existing library does NOT serve

Out of 73 compositions registered in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/Root.tsx`:

- **4 are inherent 16:9** but inherited from the original Remotion starter (`ExplainerVideo`, `TalkingHead`, `Listicle`, `QuoteCard` — registered under `<Folder name="Landscape-16x9">`). They are general-purpose, not reference-creator-driven, and they predate the wave-6/7 research entirely.
- **6 are 16:9 reference-creator-driven** and live under `<Folder name="Landscape-16x9-Wave6">`: `HormoziTweetCardListicle16x9`, `BeforeAfterText16x9`, `BigNumberHorizontalBars16x9`, `SplitScreenInterviewLayout16x9`, `TitleCardKineticTwoLine16x9`, `PipelineFlow16x9`. These are the **proof of concept** that the lane is viable; this ADR formalizes the convention they already established.
- **The remaining 63** are `*9x16`-suffixed, schema-locked to 1080×1920, and have varying degrees of suitability for direct sibling porting (see §4 build-order table).

The brand chrome ships `BrandWatermark16x9` and `BrandBreadcrumb16x9` (at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandWatermark16x9.tsx` and `BrandBreadcrumb16x9.tsx`) but no other component has been audited for aspect awareness.

---

## 2. Decision

**We open a formal 16:9 template lane alongside the existing 9:16 lane.** Concretely, this means six committed conventions:

### 2.1 Naming

- 16:9 compositions take the **`16x9` suffix** (note the `x` lower-case, no colon, matching the existing `9x16` convention). Examples already shipped: `HormoziTweetCardListicle16x9`, `TitleCardKineticTwoLine16x9`, `BeforeAfterText16x9`, `PipelineFlow16x9`, `BigNumberHorizontalBars16x9`, `SplitScreenInterviewLayout16x9`.
- 9:16 compositions retain the existing **`9x16` suffix**. No retroactive renames.
- Files live in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/` flat — we do NOT introduce `landscape/` and `vertical/` subdirectories. The suffix carries the orientation.
- The Remotion `<Composition>` `id` matches the file name 1:1.
- The Remotion `<Folder>` registration in `Root.tsx` groups by lane: existing `<Folder name="Landscape-16x9">`, `<Folder name="Vertical-9x16">`, and `<Folder name="Landscape-16x9-Wave6">`. Future wave-X additions either join `Landscape-16x9-Wave6` (preserving its name as a historical marker) or introduce `Landscape-16x9-WaveN` for the next research cycle.

### 2.2 Brand chrome 16:9 variants

Brand chrome is **forked, not parameterized.** Layout deltas between 9:16 and 16:9 are large enough (corner geometry, padding, font sizes, handle text placement) that one component with an aspect prop would be a god-component. Already-shipped pattern:

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandWatermark.tsx` → 9:16 use
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandWatermark16x9.tsx` → 16:9 use, with `paddingPx: 64` default (vs. 48 for 9:16), `size: 120` default (vs. 96 for 9:16), and an optional `handle` text slot for the "presenter watermark" look common in Nate B Jones / Hormozi long-form.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandBreadcrumb.tsx` → 9:16 use
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandBreadcrumb16x9.tsx` → 16:9 use

The forked variants share the underlying `WatermarkStyle` and breadcrumb Zod schemas (defined in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`) so the **prop surface is identical**; only the visual render changes. Compositions choose by import statement.

**Future brand chrome that needs aspect awareness must follow the same fork-pattern** (do not retrofit an `aspect: '9:16' | '16:9'` prop onto a single component).

### 2.3 Aspect-aware vs aspect-neutral molecules

We split the component library into three tiers:

| Tier | Behavior | Examples |
|---|---|---|
| **A — Aspect-locked** | Component is hard-coded to one aspect; never reused cross-aspect. Forked sibling lives at `<Name>16x9.tsx`. | `BrandWatermark` / `BrandWatermark16x9`, `BrandBreadcrumb` / `BrandBreadcrumb16x9`. Most compositions themselves. |
| **B — Aspect-neutral** | Component renders the same logic in both aspects; the parent composition is responsible for sizing/positioning the slot. Schema has no aspect field. | `WebcamPipOverlay` (just shipped), `MagnifiedPullQuoteCard`, `NumberPrimitives`, `BulletSequenceCounter`, `TextEmphasis`, `IconObjectPair`, `Caption` / `BlackPillCaption`. |
| **C — Aspect-aware molecule (rare, opt-in only)** | Component accepts an `aspect: '9:16' \| '16:9'` discriminator and switches layout internally. Only used where the component cost is high (e.g. captions, where the same per-word logic serves both aspects). | `EditorialCaption` (planned), the captions library at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/`. |

**Default is Tier B.** A new molecule justifies Tier A only if the visual layout is structurally different (e.g. corner-anchored chrome). A new molecule justifies Tier C only if behavioral equivalence in both aspects requires actively-aware sizing logic, not just CSS-flow differences.

### 2.4 Schemas — aspect-aware vs aspect-neutral fields

In `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`:

- **Aspect-neutral fields** (no change required): `audioUrl`, `wordTimings`, `breadcrumb`, `subjectTool`, `palette`, paper/ink/accent/muted color overrides, `showCaptions`, semantic content (titles, items, quotes, tweets, code).
- **Aspect-aware fields** (must default per aspect): `fontSize` family (`captionFontSize`, hero numeral sizing, body sizing), padding/margin constants, `position` values (e.g. captions `position: 'bottom' | 'center'`), watermark `size`/`paddingPx`.
- **Aspect-locked fields** (only meaningful in one aspect): `cropMode` for `TalkingHeadDynamic9x16` (the four crop modes are designed for 1080×1920); long-form-only `chapter` index for `HeroChapterNumeral16x9`; `keyframes` for Hormozi tweet-stack pagination (16:9-specific layout math).

**Rule:** when a composition is duplicated for the other aspect, the **schema is duplicated too** (e.g. `titleCardKineticTwoLine16x9Schema` is distinct from `kineticTypoCard9x16Schema`). They may share underlying types via the shared `schemas.ts` re-exports (breadcrumb, palette, watermark style) but the composition-level schema is a separate Zod object. This is the established pattern in the six already-shipped Wave-6 16:9 schemas.

### 2.5 Captions positioning rules

Captions are the single most aspect-sensitive primitive in the library. The Wave-7 sahilbloom and allin analyses both surfaced a captions-register taxonomy that we adopt as the **default policy**:

| Aspect | Default register | Default position | Default font size | Reason |
|---|---|---|---|---|
| **9:16** | `karaoke` (TikTok-style per-word) | `bottom-third center` (~70% from top) | 42 px | High-density vertical viewer expects word-level highlight. Existing convention in `captionDefaultsVertical` at `Root.tsx:130–134`. |
| **16:9 A-roll (talking head)** | `none` | n/a | n/a | sahilbloom analysis P3, allin analysis P1/P2: long-form A-roll runs WITHOUT burned captions. YouTube viewers turn on CC. Igor / Hormozi / Nate / Matt Wolfe all default to "no captions on A-roll." |
| **16:9 B-roll / motion-graphic insert** | `karaoke` or `sentence` (italic-emphasis) | `bottom-center 70% width, max 3 lines` | 36 px | sahilbloom P7 + Igor `StudioCompositor16x9`: captions DO appear on B-roll / motion-graphic moments. Width caps at 70% of frame to keep the eye centered. |

Concretely:
- `EditorialCaption.tsx` (planned) gains a `register: 'karaoke' | 'sentence' | 'allCapsCenter' | 'none'` discriminator and an `aspect: '9:16' | '16:9'` prop (Tier C molecule per §2.3).
- 16:9 compositions whose **on-card text IS the text layer** (`TitleCardKineticTwoLine16x9`, `HormoziTweetCardListicle16x9`, etc.) default `showCaptions: false` — the burned-in text would compete. This mirrors the existing 9:16 convention used in `QuoteCard9x16`, `TweetCardHero9x16` (see comments at `Root.tsx:389–391, 513–515`).

### 2.6 What this decision does NOT do

This ADR intentionally **does not**:

- Specify which new templates will be built. That belongs in a separate build-plan document under `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/` (see §7 implementation pointers).
- Retroactively rename or refactor any existing composition.
- Mandate that every 9:16 composition gets a 16:9 sibling. The §4 scope table records explicitly which 9:16 templates need 16:9 siblings and which are 9:16-locked by content type.
- Change the Hyperframes engine path (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/hyperframes/`). The Hyperframes lane is governed separately by `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/BAKEOFF.md`. This ADR addresses Remotion-side only.

---

## 3. Existing 16:9 compositions (the lane is already partially open)

The Wave-6 build pass shipped six 16:9 compositions, registered in `Root.tsx` (lines 64–69 import, 2546–2925 registration). They establish the convention that this ADR formalizes.

| # | Composition | File | Source reference | Brand chrome used |
|---|---|---|---|---|
| 1 | `HormoziTweetCardListicle16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/HormoziTweetCardListicle16x9.tsx` | Hormozi consensus H1+H2+H3+H5 | `BrandWatermark16x9`, `BrandBreadcrumb16x9` |
| 2 | `BeforeAfterText16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/BeforeAfterText16x9.tsx` | Nate consensus H2 | `BrandWatermark16x9`, `BrandBreadcrumb16x9` |
| 3 | `BigNumberHorizontalBars16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/BigNumberHorizontalBars16x9.tsx` | Nate consensus M3 | `BrandWatermark16x9` |
| 4 | `SplitScreenInterviewLayout16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/SplitScreenInterviewLayout16x9.tsx` | Nate consensus M7 | `BrandWatermark16x9` |
| 5 | `TitleCardKineticTwoLine16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/TitleCardKineticTwoLine16x9.tsx` | Nate consensus H1 | `BrandWatermark16x9`, `BrandBreadcrumb16x9` |
| 6 | `PipelineFlow16x9` | `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/PipelineFlow16x9.tsx` | Nate consensus H7 + M1 | `BrandWatermark16x9`, `BrandBreadcrumb16x9` |

These six **are the existence proof** that the lane works: each ships a `1920 × 1080` Remotion `<Composition>` with `*16x9Schema` Zod schema, identical-prop-surface brand chrome variants, and the same `calculateMetadata` audio-driven duration pattern as the 9:16 catalog.

---

## 4. Scope — which existing 9:16 templates need 16:9 siblings?

Cross-referencing the 63 `*9x16` compositions against the 16:9 patterns identified in each of the six creator analyses, the templates fall into four scope buckets. **Highest-priority builds appear first.** Effort estimates are sourced from the relevant consensus documents (Nate consensus §5 / §8.2 ranking, sahilbloom P-series).

### 4.1 Build order (Wave-7 16:9 batch — priority order)

| Rank | New 16:9 composition | 9:16 sibling (if any) | Driving creator(s) | Effort | Notes |
|---|---|---|---|---|---|
| 1 | **`StudioCompositor16x9`** | none — net-new lane chassis | Igor (theaiadvantage P1 — 6/8 long-form picks) | M (4–8h) | **CLOSEST analog to our brand voice across the entire 22-creator corpus.** Pure-black BG with presenter bottom-left + UI mockup right with purple glow halo. Consumes the new `WebcamPipOverlay` molecule. Opens the long-form tutorial lane. |
| 2 | **`KeynoteSlidePIP16x9`** | none — diegetic stage chassis | allin P2 (`SlideDeckPlusSpeakerPIP16x9`, 3/12 + inferred more) | M (4–8h) | Large slide top-left two-thirds + white-bordered speaker PIP bottom-right + earth-starfield filler + persistent event-lockup chyron. Powers any "stage interview / keynote" content. Companion: `PersistentEventLockupChyron16x9` chrome (simpler add-on). |
| 3 | **`MemeLoopDiagram16x9`** | none | aiexplained (anim-01 in `2_DPnzoiHaY`, single instance but **highest-replicability finding** in his corpus) | S (1–2h) | 4 brand cards arranged at NE/SE/SW/NW with circular CW arc connecting them + 1 outlier corner pin + central mocking-label. The "everyone is the world's best model" cycle. |
| 4 | **`SectionDividerTitleCard16x9`** mode on `TitleCardKineticTwoLine16x9` | shares with `KineticTypoCard9x16` | natebjones (H1, 5+ instances, his single most-used template) | XS (<1h) | Already shipped — add a `mode: 'sectionDivider' \| 'kineticTwoLine'` discriminator. Static fade-in + long hold + fade-out variant for pure section breaks. |
| 5 | **`ChartPlusBreakdown16x9`** | none | sahilbloom (`HorizontalBarRankedList16x9` P4 + `HeroChapterNumeral16x9` P1) | M (4–8h) | Title left + 4–5 horizontal bars descending in width + color hierarchy. Reused for ranked-list essay content. Adjacent to existing `BarChartList9x16` but landscape, no labels-on-reveal. |
| 6 | **`NeonRingFaceCamPIPOverlay16x9`** | n/a — molecule, not composition | mreflow (`NeonRingCircularFaceCamPIP`, 2/2 long-form when PIP needed) | XS (<1h) | Aspect-neutral Tier-B molecule per §2.3 — slots into `StudioCompositor16x9` (rank 1), `ArticleReadAlongWithNeonPIP16x9` (future), and any 9:16 composition needing a faux-presenter PIP. The single most-portable chrome detail in the Wave-7 scrape. |
| 7 | **`ArticleReadAlongWithNeonPIP16x9`** | none | mreflow (anim-01 in `PKKN5be_my0`) | M (4–8h) | Full-bleed browser-rendered article + `<MagnifiedPullQuoteCard>` overlay + `NeonRingFaceCamPIPOverlay16x9` bottom-right. Most replicable Matt Wolfe pattern; pull-quote molecule already exists at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/MagnifiedPullQuoteCard.tsx`. |
| 8 | **`TreeOfChildCardsWithEmphasisPill16x9`** | `DecisionTree9x16` | natebjones (M2, 3 instances in `FtCdYhspm7w`) | M (4–8h) | Parent-header + 3–4 child cards in horizontal row + bottom emphasis pill. **Pre-build: re-extract dense frames at `FtCdYhspm7w` t=500–525 per Nate consensus §F4.** |
| 9 | **`HormoziTweetCardStackBuild16x9`** extension | shares schema with existing `HormoziTweetCardListicle16x9` | alexhormozi consensus H2 (`TweetStackVerticalBuild`) | S (1–2h) | Extend existing comp with stacked-multi-card variant. Append-down + append-up directions. |
| 10 | **`HeroChapterNumeral16x9`** + `<ChapterProgressTimeline>` molecule | could share with `BigNumberHero9x16` | sahilbloom P1 (HIGH — 2 videos: `qsmjQGw0uiU`, `Cl7EgF-XIPc`) | M (4–8h) | Single huge sans numeral (`02`, `06+`) filling 60% of vertical space + tiny top progress timeline w/ dots + lightning-bolt glyphs at chapter boundaries. |
| 11 | **`ModelComparisonGrid16x9`** | none | theaiadvantage P3 (`TwoByTwoModelComparison16x9`) | M (4–8h) | 4-cell grid (parameterizable 2/3/6) for "X vs Y" model comparisons. Confirms there's a 16:9 sibling pattern for the existing `BenchmarkBars9x16` content type. |
| 12 | **`FiftyFiftyFeatureMapSplit16x9`** | `SplitWebcamScreen9x16` | theaiadvantage P4 + mreflow Short variant inverted | M (4–8h) | Vertical 50/50 split with symmetric-feature UI comparison. Distinct from existing 9:16 split because layout is horizontal, presenter PIP bottom-right, no seam-caption. |
| 13 | **`GlowingPromptBarMockup16x9`** | n/a — molecule | theaiadvantage P2 (3/12 hits, atomic, reusable across both lanes) | S (1–2h) | Aspect-neutral molecule. Slots into `StudioCompositor16x9` and into 9:16 demo videos. |
| 14 | **`PersistentEventLockupChyron16x9`** | n/a — chrome | allin P1 (DOMINANT — 11/12) | XS (<1h) | Stage-bug-style two-line condensed-sans wordmark in dark-blue gradient panel anchored bottom-left/right. Brand chrome variant, not a composition. |
| 15 | **`EditorialStepCard16x9`** mode | shares with `KineticEssay9x16` | sahilbloom P2 (MED, 1 video but high-signal) | S (1–2h) | White BG, bold sans title with ONE italic-emphasized word + gray sub. Word-by-word fade-in at 4-frame stagger. |

### 4.2 9:16 templates that do NOT need 16:9 siblings

These are 9:16-locked because the content type, social platform, or layout grammar is inherently vertical. They are excluded from the Wave-7 16:9 build batch.

- `OutroFollowCTA9x16`, `PollCTA9x16`, `YouTubeEndCard9x16`, `YouTubeCalloutArrows9x16` — Shorts/Reels outros, platform-specific to vertical placement.
- `TerminalCommand9x16`, `TerminalBlock9x16`, `EditorBlock9x16`, `CodeDiffBeforeAfter9x16` — code/terminal blocks tuned to vertical fill. A 16:9 sibling would need a redesign, not a port.
- `AgentThinking9x16`, `TokenStream9x16`, `AttentionHeatmap9x16` — interpretability primitives sized for the 1080×1920 canvas. Defer until 16:9 demand surfaces.
- `CamcorderFrame9x16`, `GeminiFrameWrapper9x16`, `KeyedFounderOverBroll9x16`, `GenerativeBrollWithDiegeticUI9x16`, `IllustratedConcept9x16`, `WhiteboardScene9x16` — Wave-5 b-roll wrappers; vertical-specific frame chrome.
- `BrandedOpener9x16`, `BrollListicle9x16`, `LockedFeatureRow9x16`, `PricingTierCard9x16`, `TestimonialCard9x16`, `FauxProductUI9x16`, `NewsClipCitation9x16`, `RankedTierList9x16`, `VennDiagram9x16`, `AppConnect9x16`, `TweetCard9x16` — Shorts-grammar primitives. Add 16:9 siblings only when a specific creator analysis surfaces the pattern.

### 4.3 9:16 templates that may share schemas with future 16:9 siblings (Tier C candidates)

These compositions are layout-symmetric enough to share an underlying schema with a future 16:9 sibling, even though we will ship them as separate `*9x16.tsx` / `*16x9.tsx` files per §2.1:

- `KineticTypoCard9x16` ↔ `TitleCardKineticTwoLine16x9` (already exists; schema overlap on `lines[]`, `lineStaggerSeconds`, palette, captions).
- `DiagramExplainer9x16` ↔ a future `DiagramExplainer16x9`.
- `LayerCardStack9x16` ↔ a future `LayerCardStack16x9` (Igor `TwoByTwoModelComparison` is close kin).
- `BarChartList9x16` ↔ `BigNumberHorizontalBars16x9` (already exists; not a direct port but content-type sibling).
- `Sparkline9x16`, `LineChartAnnotated9x16`, `AnimatedTable9x16`, `BenchmarkBars9x16` — chart primitives sharing the breadcrumb/palette/audio chrome.
- `QuoteCard9x16` ↔ `QuoteCard` (the original 16:9 starter; effectively a sibling pair already).
- `TalkingHeadDynamic9x16` ↔ a future `TalkingHeadDynamic16x9` (sahilbloom + Igor "warm podcast" mode).

For these, when the 16:9 sibling is built, the schema can extend a shared base in `schemas.ts` (e.g. `baseKineticTypoSchema.merge(z.object({ aspect-locked fields }))`) rather than duplicating from scratch.

---

## 5. Consequences

### 5.1 Schema layer — width-aware font-size defaults

**Issue:** Schemas like `animatedCounter9x16Schema`, `bigNumberHero9x16Schema`, and `kineticTypoCard9x16Schema` were authored with `fontSize` defaults tuned for the 1080-wide canvas. When the same logical content is rendered into a 1920-wide canvas, the same px values look small (because 1920 px is ~78% wider than 1080 px but the perceived viewing distance is typically further away on landscape).

**Action:** Each 16:9 sibling schema sets its own `fontSize` defaults explicitly, calibrated against the reference clips. Heuristic baselines from the Wave-6/7 corpus:

- Hero numeral / headline: 9:16 default 240–280 px → 16:9 default 140–180 px (smaller because not vertically dominant, but visually punchier).
- Body text: 9:16 default 36–42 px → 16:9 default 30–36 px.
- Captions: 9:16 default 38–42 px → 16:9 default 32–36 px.
- Watermark handle: per `BrandWatermark16x9` already defaults to 48 px (vs 9:16 unset, defaults to none).

No retroactive change to existing 9:16 schemas. Future Tier-C molecules accepting `aspect` will branch defaults inside.

### 5.2 CLI / pipeline — aspect-ratio flag or inference

The CLI at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/generate.ts` currently selects compositions by `--template` flag. It does not have an aspect concept.

**Action:** add either:
- **Option A (preferred)**: infer aspect from the composition `id` suffix — `*16x9` → landscape, `*9x16` → vertical, no-suffix → 16:9 starter compositions. Pipeline routes downstream resize/transcode steps accordingly.
- **Option B (fallback)**: explicit `--aspect 16:9 | 9:16` CLI flag, validated against composition `id`.

This is implementation detail not blocked by this ADR, but explicitly called out as a downstream consequence. The `--platforms` flag (`youtube,reels,tiktok,shorts`) at `generate.ts` already implies aspect — landscape platforms (`youtube`) target 16:9, vertical platforms (`reels,tiktok,shorts`) target 9:16. Wiring `--platforms` → composition aspect → composition-id selection is the cleanest path.

### 5.3 Smoke renders — parallel output trees

**Issue:** the existing smoke-render flow assumes single-aspect output. With two lanes, regression detection requires rendering both side-by-side.

**Action:** the convention going forward is:

```
output/<YYYY-MM-DD-slug>/                                # per-request output (existing)
output/wave7-smoke-16x9/<comp-id>/master.mp4             # NEW — 16:9 smoke renders
output/wave7-smoke-9x16/<comp-id>/master.mp4             # NEW — 9:16 smoke renders
output/wave7-smoke-16x9/<comp-id>/keyframes/             # frame extraction for visual diff
output/wave7-smoke-9x16/<comp-id>/keyframes/
```

The smoke renderer iterates the appropriate `<Folder>` in `Root.tsx` and writes to the matching tree. CI / pre-commit gates check both trees independently. Visual diffs are computed per-aspect.

### 5.4 WebcamPipOverlay (just shipped) is the first aspect-neutral molecule

The freshly-shipped `WebcamPipOverlay` at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/WebcamPipOverlay.tsx` is a **Tier-B aspect-neutral molecule** per §2.3 — it has no aspect prop. It will be consumed by:

- `StudioCompositor16x9` (rank 1) — presenter bottom-left at 30% width.
- `KeynoteSlidePIP16x9` (rank 2) — speaker face-cam bottom-right at 30% width.
- `ArticleReadAlongWithNeonPIP16x9` (rank 7) — wrapped inside `NeonRingFaceCamPIPOverlay16x9` ring chrome.
- Future 9:16 compositions that need a faux-presenter inset.

This is the proof-of-pattern for the Tier-B convention: design molecules to be parent-positioned, not aspect-aware.

### 5.5 Documentation footprint

This ADR is the first document under `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/`. The directory previously did not exist. Future wave-7 docs (build plan, smoke-render comparisons, per-creator pattern-replication runbooks) should sit alongside it. The wave-6 directory's structure is the template — `<topic>.md` flat files at the wave root, references under `<wave>/references/<creator>/`.

### 5.6 Existing 9:16 compositions are unaffected

Critical: **nothing in the existing 9:16 lane is renamed, moved, or refactored.** The 63 `*9x16` compositions continue to render at 1080×1920 with their existing schemas. The 16:9 lane is purely additive. Pipeline backward compatibility is preserved.

### 5.7 Engineering cost

The Wave-7 16:9 batch of 15 ranked builds in §4.1 sums to **≈8–10 days of focused work** at the effort estimates documented. The chrome additions (`BrandWatermark16x9`, `BrandBreadcrumb16x9`, future `PersistentEventLockupChyron16x9`) are cheap. The chassis compositions (`StudioCompositor16x9`, `KeynoteSlidePIP16x9`) are the most expensive but each unlocks 3+ downstream creator-pattern replications.

---

## 6. Alternatives considered

### 6.1 Stay 9:16-only

**Approach:** continue building exclusively for the 1080×1920 canvas. Rotate horizontal-native creator patterns into vertical layouts by selecting "the dominant vertical slice" of the original 16:9 frame.

**Why rejected:**
- **Six independent reference creators cannot be served** by vertical rotations. Igor's `StudioCompositor16x9` is structurally horizontal (presenter LEFT + UI mockup RIGHT) — rotating it loses the left-right grammar that defines the pattern. Same for `SplitScreenInterviewLayout16x9` (Nate), `KeynoteSlidePIP16x9` (allin), `ChartPlusBreakdown16x9` (sahilbloom).
- **The Nate consensus explicitly flagged this** as load-bearing (§F5: "Without opening the 16:9 lane, Nate's contribution to our library is limited to chrome enhancements"). Igor consensus restated it.
- **Reproducing horizontal motion grammar in vertical is information loss**, not orientation translation. We would be choosing to ship lower-fidelity reproductions of every 16:9-native creator we want to learn from.

### 6.2 Single aspect-aware template with `aspect: '9:16' | '16:9'` prop

**Approach:** one composition file per content type, with an `aspect` discriminator. The component switches layout/grid/chrome internally.

**Why rejected:**
- **Caption behavior is too divergent.** 9:16 captions default to bottom-third center karaoke. 16:9 A-roll captions default to `none`. 16:9 B-roll captions are bottom-center 70%-width. A single component cannot route this without becoming a switch-statement god-component.
- **Grid layout is too divergent.** 9:16 compositions stack vertically by default (Hormozi tweet-card stack appends downward; bar charts stack horizontally; lists are vertical). 16:9 compositions row content horizontally (Igor `TwoByTwoModelComparison` is a 2×2 grid; `PipelineFlow16x9` is a horizontal chain; `SplitScreenInterviewLayout16x9` is a left/right split). The same "items" prop maps to fundamentally different rendering trees.
- **Brand chrome is divergent enough** that `BrandWatermark` / `BrandWatermark16x9` already chose to fork rather than parameterize (§2.2). Forcing compositions to do otherwise contradicts the chrome-layer precedent.
- **Schema sharing is still possible** (Tier-C molecules use `aspect` discriminator opt-in; sibling compositions can `extend()` a shared base schema). The fork-pattern doesn't preclude code sharing where it makes sense.

### 6.3 Build only chrome-level 16:9 (no compositions)

**Approach:** ship `BrandWatermark16x9` + `BrandBreadcrumb16x9` + `PersistentEventLockupChyron16x9` for cross-posting use, but do not build any 16:9-native compositions. Use Hormozi-9:16-style templates and rely on FFmpeg pad-and-letterbox for horizontal-platform delivery.

**Why rejected:**
- **Defeats the original motivation.** We want to reproduce Igor's `StudioCompositor16x9`, Nate's `BeforeAfterText16x9`, etc. — none of those are achievable as letterboxed 9:16 content. The whole point of opening the lane is to render those patterns at their native aspect.
- **Letterboxed Shorts on YouTube long-form is a known anti-pattern** for the YouTube algorithm. Cross-posting requires native-aspect content.

### 6.4 Wait for more data

**Approach:** keep researching. Add 6 more creators. Then decide.

**Why rejected:**
- **The threshold is already passed.** Six independent creators with materially-different content but materially-similar aspect requirements is past the noise floor.
- **The Wave-6 → Wave-7 trend is monotonic.** No creator we scraped weakened the 16:9 case; every one strengthened it. The expected information value of a 7th creator is near zero (we'd be confirming what we already know).
- **Continued delay has compound cost.** Every week we don't open the lane is a week where Wave-7 / Wave-8 research surfaces patterns we cannot build. The bottleneck has already shifted from "should we" to "what should we build first."

### 6.5 Open the lane but defer to Hyperframes engine

**Approach:** route 16:9 builds to Hyperframes (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/hyperframes/`) and keep Remotion as the 9:16 specialist.

**Why rejected:**
- **The bake-off has not selected a winner** (per `BAKEOFF.md`). Both engines render both aspects today. Routing by aspect would prematurely couple a research-stage engine choice to the production lane decision.
- **The six already-shipped 16:9 Remotion compositions prove Remotion handles the lane.** No technical blocker exists in the Remotion path. Hyperframes can ship parallel 16:9 templates per the bake-off protocol; that's orthogonal to this ADR.

---

## 7. Implementation pointers

### 7.1 Already-shipped 16:9 compositions in `src/Root.tsx`

Confirmed registered (counts and folders per §1.4):

- **Original starter (`<Folder name="Landscape-16x9">`):** `ExplainerVideo`, `TalkingHead`, `Listicle`, `QuoteCard` — 4 compositions, all 1920×1080. Lines 147–241 of `Root.tsx`.
- **Wave-6 reference-driven (`<Folder name="Landscape-16x9-Wave6">`):** `HormoziTweetCardListicle16x9`, `BeforeAfterText16x9`, `BigNumberHorizontalBars16x9`, `SplitScreenInterviewLayout16x9`, `TitleCardKineticTwoLine16x9`, `PipelineFlow16x9` — 6 compositions, all 1920×1080. Lines 2546–2925 of `Root.tsx`.

Future Wave-7 builds register under a new `<Folder name="Landscape-16x9-Wave7">` to preserve the wave-history audit trail.

### 7.2 Aspect-neutral molecule already in place — `WebcamPipOverlay`

Path: `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/WebcamPipOverlay.tsx`.

This component takes a parent-supplied position + size, an image / video source, and an optional rim treatment. It does NOT know its aspect — the parent composition is responsible for placing it. This is the canonical Tier-B pattern (§2.3):

- In `StudioCompositor16x9` (rank 1 build): parent positions it bottom-left, 30% width, alpha-keyed presenter.
- In `KeynoteSlidePIP16x9` (rank 2 build): parent positions it bottom-right, 30% width, white-bordered rounded rectangle frame.
- In `ArticleReadAlongWithNeonPIP16x9` (rank 7 build): parent wraps it in `NeonRingFaceCamPIPOverlay16x9` (rank 6), which provides the magenta ring outer chrome.
- In future 9:16 compositions: parent positions it wherever the design calls for — top, bottom-center, corner, etc.

This is the template for future molecules: **molecules are positioned by parents, not by themselves.**

### 7.3 Shared schema primitives (already in `schemas.ts`)

The 16:9 schemas already reuse the following aspect-neutral primitives from `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`:

- `breadcrumb` (text + date pair for chrome).
- `WatermarkStyle` (consumed by both `BrandWatermark.tsx` and `BrandWatermark16x9.tsx`).
- `palette` (`'cream' | 'dark'` discriminator).
- `subjectTool` (accent color routing).
- `wordTimings[]` (caption alignment).

Future 16:9 schemas continue to import from this file and extend with aspect-specific fields (font sizes, padding, layout positions).

### 7.4 Source of truth for build plans (NOT this ADR)

This ADR is the lane-opening decision and scope. **The actual build plan** — what gets built first, in what sprint, with what acceptance criteria, with what smoke-render comparisons — belongs in a separate document. Suggested path:

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/wave-7-16x9-build-plan.md`

That document should reference this ADR as its lane authority and enumerate per-template acceptance criteria, schema specifications, animation timing tables, and reference clip paths. It is out of scope for this ADR.

---

## 8. Open questions surfaced during writing

These do not block acceptance of the ADR but should be resolved before the first Wave-7 16:9 build sprint:

1. **Wave-7 16:9 Folder naming in `Root.tsx`.** New compositions could register under `<Folder name="Landscape-16x9-Wave7">` (preserving wave-history) OR under a single growing `<Folder name="Landscape-16x9">` (cleaner Studio UI). Recommend wave-history; revisit when the lane has >20 compositions.
2. **`EditorialCaption` aspect-aware API surface.** The captions library at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/` is the most-touched Tier-C candidate. The exact discriminator shape (`register: 'karaoke' | 'sentence' | 'allCapsCenter' | 'none'` × `aspect: '9:16' | '16:9'`) should be ratified in a separate captions API ADR.
3. **Smoke-render directory structure.** §5.3 proposes parallel `wave7-smoke-16x9/` and `wave7-smoke-9x16/` trees. The smoke-render orchestrator currently lives at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/scripts/` (per scratchpad). Wiring TBD.
4. **Hormozi long-form**: do we count him as the seventh 16:9 creator? The wave-6 alexhormozi-longform-consensus.md gives him 6 HIGH-confidence patterns in 16:9 long-form. He is currently only a 9:16 Shorts reference in the active library. Suggest: count him in the corpus, prioritize his patterns in a future Hormozi-specific build sprint (not Wave-7 batch — his Shorts patterns are already covered by `HormoziTweetCardListicle16x9`).
5. **aiexplained partial sample (4 of 12).** The remaining 8 picks (`jz0rNhfAKo8`, `Iar4yweKGoI`, `eczw9k3r6Ic`, `Xn_5aIhrJOE`, `9hv4nr_46Ao`, `tVHZy-iml5Q`, `FMMpUO1uAYk`, `g9ZJ8GMBlw4`) are unprocessed. The lane decision does not depend on them, but the Wave-7 build batch should re-process them before promoting any aiexplained pattern from "preliminary" to "confirmed."
6. **mreflow partial sample (4 of 12).** Same as #5 — 8 mid-list videos were lost in the prior scrape stall. Re-process before promoting Matt-Wolfe patterns.

---

## 9. Sources

Primary evidence cited above:

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/natebjones-consensus.md` — load-bearing Nate B Jones synthesis (§F5 frames the lane decision).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-6/alexhormozi-longform-consensus.md` — Hormozi long-form 16:9 consensus (6 HIGH-confidence patterns).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS-VOTE1.md` and `ANALYSIS-VOTE2.md` — voter analyses underlying the consensus.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/aiexplained/ANALYSIS.md` — `MemeLoopDiagram` discovery.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/mreflow/ANALYSIS.md` — `NeonRingFaceCamPIP` signature, partial 4/12 sample.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/sahilbloom/ANALYSIS.md` — 12 patterns, captions taxonomy discovery.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/theaiadvantage/ANALYSIS.md` — `StudioCompositor16x9` as closest brand-voice analog.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md` — Summit chyron + slide-PIP keynote chassis.

Code touched by this decision (read-only for the ADR itself):

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/Root.tsx` — 73 composition registrations across `<Folder name="Landscape-16x9">`, `<Folder name="Vertical-9x16">`, `<Folder name="Landscape-16x9-Wave6">`.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/` — 66 composition files (60 `*9x16` + 6 `*16x9` + 4 starter + index/schemas/scenes/utils).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts` — shared Zod primitives.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandWatermark.tsx` and `BrandWatermark16x9.tsx` — chrome fork pattern.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/BrandBreadcrumb.tsx` and `BrandBreadcrumb16x9.tsx` — chrome fork pattern.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/WebcamPipOverlay.tsx` — Tier-B aspect-neutral molecule (just shipped).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/generate.ts` — pipeline CLI awaiting aspect inference.

Companion ADRs / docs to author next:

- Wave-7 build plan: `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/wave-7-16x9-build-plan.md` (per §7.4).
- Captions API ADR: per open question #2.
- Animation-replication runbook (already exists, needs 16:9 supplement): `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/prompts/animation-replication-runbook.md`.

---

## Addendum A — Post-R4B Corrections (Nate B Jones +15 analysis)

> **Date:** 2026-05-28.
> **Trigger:** Round-4B (R4B) re-analysis of Nate B Jones landed +15 new videos (12 long-form 16:9 + 3 Shorts 9:16) per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/picks-wave7-batch3.json`. The new sample more than doubled the Nate corpus that fed the original ADR (10 → 25 long-form, 4 → 7 Shorts) and surfaced two corrections that the body of this ADR did not anticipate.
> **Scope:** Append-only refinement. Sections §1–§9 above remain authoritative for the lane-opening decision; this addendum amends only the §1.1 vocab table, the §4.1 build queue, and the §8 open questions.

### A.1 Correction 1 — 16:9 vocab refined

**What the ADR (and the R3 voter passes) hypothesized.** §1.1 row 1 enumerated Nate's 16:9 patterns as `TitleCardKineticTwoLine`, `BeforeAfterTextComparison`, `PipelineFlow / FourStageHorizontalFlowDiagram`, `TreeOfChildCardsWithEmphasisPill`, `BigNumberHorizontalBars`, `SplitScreenInterviewLayout`. Implicit in §4.1 (rank 5 `ChartPlusBreakdown16x9`, rank 11 `ModelComparisonGrid16x9`) and in the voter rank-7 `StackedProgressParentChild16x9` (per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS-VOTE1.md` §7) was the assumption that a broader chart-and-timeline vocabulary — concretely `ChartHero16x9`, `TimelineHorizontal16x9`, `SidebarSourceCitation16x9`, and `TwitterScreencap16x9` — would generalize across the long-form lane once more Nate videos were sampled.

**What R4B observed.** Across the 12 new long-form picks (`n0nC1kmztSk`, `NRBQmwlILjk`, `Poyi6X7rOwY`, `ltbzgzZZmgI`, `ogTLWGBc3cE`, `zP6TnEiueEc`, `725QE_LNXT4`, `LIkYVsxMpS8`, `dm3_Z-5PYnQ`, `adNErrz2aA0`, `jwtpMSRAPAQ`, `lqiwQiDglGk` — full list at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/picks-wave7-batch3.json`) **none of the four hypothesized templates appeared**. The chart-hero / timeline / sidebar-citation / twitter-screencap patterns were single-creator artifacts from the mreflow and aiexplained samples (per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/mreflow/ANALYSIS.md` and `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/aiexplained/ANALYSIS.md`), not lane-shared.

**Corrected shared 16:9 vocab.** What R4B confirmed actually generalizes across Nate's expanded corpus — and corroborates the "Stripe Press in motion" framing already noted at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS-VOTE2.md:25` — is a four-atom set:

| # | Atom | Evidence anchor |
|---|---|---|
| a | **Dark-slate slab + translucent brand-glyph watermark** as the universal card backplate | Nate VOTE2 §2 (`TitleCardKineticTwoLine`, slate slab + radial glow); VOTE1 §3 (`bookshelf+round-glasses watermark`) |
| b | **Typographic card stacks with role-coded accent borders** (orange/cyan/violet/green/yellow per Nate's 5-color taxonomy) | Nate VOTE1 §3 (5-color accent palette `#E07B3C` / `#52B8D6` / `#A35BC8` / `#3FA86B` / `#C8A23B`) |
| c | **Caption pill with one orange-tinted keyword** (single-word emphasis inside a bordered full-sentence pill) | Nate VOTE2 §2 ("Runtime makes local AI feel normal" with `Runtime` orange); VOTE1 §3 (emphasis-word caption pills used in 5+ of 11 long-form anims) |
| d | **Persistent handle chip lower-right** (creator-identity watermark with glyph + `@handle`) | Nate VOTE2 §2 ("lower-right handle chip fades in last"); VOTE1 §3 (`persistent CTA pill bottom-right` cycling between `read more on substack` and `@nate.b.jones`) |

The framing is editorial-magazine, not dashboard-software. "Stripe Press in motion" (Nate VOTE2 §2) is the load-bearing analogy: a small set of restrained typographic primitives reused across long form, with motion graphics earning their place by landing a payoff, not by decorating every beat. This contradicts the implicit assumption in §4.1 ranks 5/10/11 that Nate's lane would converge on chart-and-grid primitives.

### A.2 Correction 2 — Aspect duality is NEGATIVE

**What the ADR implied.** §2.5 ("Captions positioning rules"), §4.3 ("9:16 templates that may share schemas with future 16:9 siblings"), and the "Tier-C aspect-aware molecule" pattern in §2.3 collectively implied that 9:16 and 16:9 lanes share a substrate of atoms and that schema-level reuse is the default expectation when porting between aspects.

**What R4B observed.** In Nate's 25 long-form 16:9 + 7 Shorts 9:16 corpus, **none** of the four 16:9 atoms (a–d in §A.1) appear in any of the seven Shorts. The Shorts run pure talking-head + karaoke captions (green-and-white-on-black, per-word highlight) with the rare exception of a single outro motion graphic — per Nate VOTE2 §2 and the Shorts-mode description at VOTE2 §1. The slate-slab card chassis, the role-coded accent borders, the caption pill, and the persistent handle chip simply do not exist in his Shorts. His long-form and Shorts use **different visual grammars**, not the same vocab rescaled.

**Concrete pipeline implication.** When porting a 16:9 composition to a 9:16 sibling for cross-posting, the correct transformation is **not** a mechanical rescale of the 16:9 layout to 1080×1920. The correct transformation is:

1. **Strip the slate-slab cards entirely.** The 16:9 chassis (atom a) does not survive the aspect change.
2. **Rely on karaoke captions** as the primary text layer (matches Nate's existing Shorts grammar, the §2.5 9:16 default register, and the existing `captionDefaultsVertical` at `Root.tsx:130–134`).
3. **Use the blue pullout chip** introduced as Nate-pattern N (per the R4B analysis output) as the only persistent motion-graphic overlay — single-line callout, anchored top-right or bottom-third, fades in on emphasis word.

This codifies a stricter rule than §2.3's Tier-C "opt-in aspect-aware molecule" allows: for the Nate vocabulary specifically, **cross-aspect schema sharing is rejected**, and the §4.3 "Tier-C candidate" pairing of `KineticTypoCard9x16 ↔ TitleCardKineticTwoLine16x9` should be treated as two independent compositions with no shared schema base. Other lanes (Igor/sahilbloom captions taxonomy) may still admit Tier-C sharing — this addendum narrows the rule for Nate only.

### A.3 Revised top-3 16:9 build queue

The §4.1 ranked-15 build queue stays intact as the **template-level** queue. R4B's finding promotes three lower-level items above the rank-1 chassis templates because they are foundation primitives that unlock multiple §4.1 entries simultaneously:

| Revised rank | Item | §4.1 rank (if any) | Type | Rationale |
|---|---|---|---|---|
| **1** | **B25 `DarkSlateChassis`** molecule | n/a (new — foundation) | Tier-A aspect-locked molecule | Materializes atom (a). Unlocks `TitleCardKineticTwoLine16x9` (already shipped) + `StudioCompositor16x9` (§4.1 r1 backplate) + `KeynoteSlidePIP16x9` (§4.1 r2 backplate) + every future Nate-vocabulary 16:9 card. Highest-leverage single component in the R4B finding. |
| **2** | **B23 `CaptionPillWithKeyword`** molecule | n/a (new — vocab atom) | Tier-A aspect-locked molecule | Materializes atom (c). Touches **all four** of the Nate +15 patterns where a card has a payoff line. Direct evolution of existing `TextEmphasis.tsx` (per Nate VOTE1 §7 r4 `EmphasisPill`). |
| **3** | **B19 `EquationCardChain16x9`** template | n/a (extends VOTE1 r2 `NamedCardEquation16x9`) | Composition | The highest-reuse single template in Nate's expanded corpus per R4B: ≥4 confirmed instances across the +15 sample (anchored at picks `n0nC1kmztSk`, `NRBQmwlILjk`, `ogTLWGBc3cE`, `jwtpMSRAPAQ` per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/picks-wave7-batch3.json`). Consumes B25 + B23. |

**Original §4.1 top-3 (`StudioCompositor16x9`, `KeynoteSlidePIP16x9`, `MemeLoopDiagram16x9`)** remain on the queue, demoted to positions 4–6 of the revised order — **not removed**. They are still the highest-priority **chassis-template** builds; B25/B23/B19 are higher-leverage because they are foundation atoms that the chassis templates themselves depend on. Build order is now: B25 → B23 → B19 → `StudioCompositor16x9` → `KeynoteSlidePIP16x9` → `MemeLoopDiagram16x9` → §4.1 ranks 4–15 as written.

### A.4 Tasks unaffected by this addendum

The following §4.1 entries are untouched in scope, ownership, and acceptance criteria:

- **`StudioCompositor16x9`** (§4.1 r1, Igor / theaiadvantage P1) — still on queue; addendum only moves it down two ranks.
- **`KeynoteSlidePIP16x9`** (§4.1 r2, allin P2) — still on queue; same.
- **`MemeLoopDiagram16x9`** (§4.1 r3, aiexplained) — still on queue; same.
- All §4.1 ranks 4–15 — unchanged.
- All §4.2 9:16-locked exclusions — unchanged.
- All §5 consequences (schema width-aware defaults, CLI aspect inference, smoke-render parallel trees, Tier-B `WebcamPipOverlay` precedent) — unchanged.
- §6 Alternatives considered (stay 9:16-only, single aspect-aware template, chrome-only, wait, defer-to-Hyperframes) — unchanged; the Correction-2 finding strengthens the §6.2 rejection (aspect-aware single component) rather than weakens it.

### A.5 Open questions reshuffled

The §8 open-questions list gains two new items and re-prioritizes one:

7. **(NEW — promoted from §8 item 2)** The Captions API ADR (planned per §8 item 2) **MUST** explicitly address the captions-register × aspect matrix as a non-orthogonal product space. The R4B finding (Correction 2) makes this load-bearing: 9:16 captions and 16:9 captions are not the same primitive with different sizing — they are different primitives. Karaoke + blue pullout chip is the 9:16 default for the Nate-vocabulary cross-post; restrained orange-keyword caption pill is the 16:9 default. The Tier-C `aspect` discriminator on `EditorialCaption` (per §2.3 / §2.5) is necessary but not sufficient: the `register` enum itself must be tagged with which aspect lanes accept which registers.
8. **(NEW)** Whether `PersistentEventLockupChyron16x9` (allin P1, §4.1 r14) and the Nate atom (d) `Handle ChipLowerRight` are two instances of the same "creator-identity persistent chip" pattern family or two separate chrome primitives. They share: lower-right anchor, persistent-throughout-video lifetime, condensed-sans glyph + handle text. They differ: allin uses a stage-bug dark-blue gradient panel (per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md` P1), Nate uses a translucent pill with cycling labels (per VOTE1 §3). Recommend: unify under a `PersistentCreatorChip` family with `style: 'stageBug' \| 'cyclingPill'` variants, schema lives at `schemas.ts` next to `WatermarkStyle`. Resolve before building §4.1 r14.
