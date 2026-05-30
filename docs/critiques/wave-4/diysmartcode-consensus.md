# @DIYSmartCode — Wave 4 Consensus (5 voters)

> **Method:** Jaccard-style consensus across 5 independent Opus voters. HIGH = ≥3, MED = 2, LOW = 1.
>
> **Headline:** Prior ANALYSIS.md identified ~3 templates from 3 cherry-picked videos. The 5-voter pass reveals **15 distinct templates + ~20 reusable components**, an entirely missed **GeminiFrame meta-template family**, no data-viz vocabulary in prior, and a **per-step rotating accent** that invalidates the "one accent per video" claim. V3 estimates **prior captured ~25% of what's on screen.**

---

## HIGH-CONFIDENCE FINDINGS (3+ voters)

### 1. Kit ≠ Template — per-subject themes over a shared skeleton 🔴 SHIP-FIRST
**Votes:** V1 §0 ("brand-themed kit pattern"), V2 §0 ("meta-finding"), V3 N1 ("GeminiFrame entire missed template"), V5 §0 ("two visual systems")

Same `NumberedStepCard` skeleton ships in 4-5 visual flavors:
- **Anthropic kit:** navy `#0F1B2D` + orange `#E07856` + green `#3FCB7B` + "ANTHROP\C" wordmark
- **Google I/O kit:** navy + Google-quartet `#4A8CFF #2BC971 #E8694A #F2C94C` + glass-frame canvas
- **Cream/Opinion kit:** paper `#F5EFE3` + terracotta `#B85A3F` + Georgia serif italic
- **AST-Grep kit:** black + neon orange `#FB7547` + lightning bolts
- **Storm dark (Anthropic-compliance):** near-black + lightning pattern + camcorder REC chrome

**Action:** Refactor schema — separate `theme` (palette + ambient pattern + fonts) from `template` (layout + content slots). One JSON for kit, one for template, orthogonal axes.

### 2. Per-step rotating accent — invalidates "one accent per video" 🔴
**Votes:** V1 §3 ("mono labels everywhere"), V3 N24 (explicit invalidation of prior), V4 §7 ("section accent color migration"), V5 §C ("System A over-served")

Each step in a `NumberedStepCard` series uses a different accent (step 02 purple, 03 green, 04 blue, 05 purple again). Same in `CamcorderListicle` (orange/purple/blue per row) and `0HIf4AlajNY` 2×2 grid. Prior claim was wrong.

**Action:** `palette: AccentColor[]` instead of `accentColor: string` in schema. Default per-step rotation through a 5-color palette.

### 3. Persistent HUD chrome: top progress bar + chapter stepper + handle + 1px card border 🔴
**Votes:** V1 T7+T14, V2 C1+C4, V3 N7+N8, V4 #1 ("persist chapter HUD")

The "world layer" that runs across the entire video without ever resetting:
- **TopScrubBar** — 4-6 px accent-colored line at the top filling L→R across the full reel
- **ChapterProgressNav** — 4-5 dots labeled `HOOK · WHAT · UPGRADES · SHIP · YOU` at bottom
- **Handle top-right** — `@DIYSMARTCODE` letter-spaced uppercase
- **1px rounded full-frame card border** — subtle inset gives "card on stage" feel

**Action:** Build `<HUDChrome>` overlay component that wraps any template with these 4 layers.

### 4. Additive layering (notebook mode) vs replacement (page-turn mode) — explicit modes 🔴
**Votes:** V4 #1 ("additive > slide replacement"), V1 multi-template support, V3 N7 chapter stepper compatible

Two grammars, one per reel-type:
- **Accumulation reels:** Old cards stay visible while new card lands on top — used when narrative is cumulative ("receipt → synthesis → pick").
- **Replacement reels:** Body region fully clears, bound by persistent HUD — used when sections are parallel ("Upgrade 01/02/03/04").

**Action:** Add `mode: 'accumulate' | 'replace'` to multi-card templates.

### 5. KeyValueRowsCard / SpecRow primitive 🔴
**Votes:** V1 T4, V2 K1/K2, V3 N10

Bordered rounded card holding stacked rows; each row = mono accent-color label (left, 80-120px wide) + body text (right, white sans). **Carries 70% of the educational payload** in a tiny repeatable component (V2's explicit assertion). Examples: `RUNS / Multiple Gemini Flash instances`, `MODEL / Gemini 3.5 Flash`, `TOOLS / Google apps + MCP`.

**Action:** Build `<SpecRow labelPill="TOOLS" body="..." labelColor="..." />` accepting stacking via flex children.

### 6. Mono small-caps with +200 letter-spacing as signature label 🔴
**Votes:** V1 §3 #2 ("counter + section-tag header is universal"), V2 T3 ("eyebrow / kicker"), V5 §1 (#2 typography lesson)

The single most recognizable typographic tic: **JetBrains Mono / IBM Plex Mono / Berkeley Mono at letter-spacing 0.2em uppercase** for every section opener (`THE CLAIM`, `WHERE IT SHIPS`, `UPGRADE 01`, `RELEASE v2.1.145`, `ANTHROPIC · MAY 19, 2026`). Used in MORE places than the headline sans.

**Action:** Build `<EyebrowKicker text="..." color={accent} />` shared component. Add `font-mono` token to brand config.

### 7. Single-word color emphasis inside headline 🔴
**Votes:** V1 T1 implicit, V2 T5 explicit ("Two-tone color-pop word"), V5 §1 ("italic-as-voice trick")

One word in accent color inside an otherwise-white headline (`"comments"` green, `"Zero"` green, `"19"` blue). The recolored word is what's audibly emphasized — a manual proxy for word-burn-in.

**Action:** Build `<HeadlineEmphasis text="..." accentWord="..." accentColor="..." />` — every video has 3-6 of these.

### 8. Continuous backdrop motion as "glue" (drifting pattern/particles) 🔴
**Votes:** V2 BG1/M6/M7, V3 N30 ("DRIFTS — not static"), V4 #4 ("continuous backdrop motion as glue")

Anthropic puzzle glyphs / Google color particles / AST lightning bolts — never static, slow parallax drift + slight rotation. V3 caught V2 frame-00 vs frame-05 with shapes MOVED. Prior called it "static pattern." Wrong.

**Action:** Build `<DriftingPattern>` with per-shape `xOffset = t * speed` GPU-friendly transform.

### 9. HugeNumeral with count-up + optional border-card frame 🔴
**Votes:** V1 T2, V2 T6/M5, V3 N17 (BigNumber sidecar variant)

Pre-headline mono kicker → giant numeric hero (240-460pt, accent color) → optional thin bordered card frame → sub-caption. Number rolls up to final value during voiceover beat (V4 confirms count-up sync).

**Action:** Extend `BigNumberHero9x16` with `borderedCard: boolean` + ensure all numbers route through shared `countUp` primitive (cross-creator pattern).

### 10. Hard cut on beat, slow cadence (7-35 s per section), no transitions 🔴
**Votes:** V1 implicit, V2 TR1 ("hard cut on beat — dominant"), V4 cadence band (7-35 s/section)

Snappy hard cuts only, audio-synced to voiceover. No crossfade, no whip-pan. 4-section reels run slowest (~25-35 s); 15-section enumeration reels run fastest (~7 s). Dwell stretches when section is dense (logo grid, code block), compresses when section is simple.

**Action:** Default to hard cuts; add `dwellBudget` parameter that scales with element count, not fixed.

### 11. Burned captions DO exist (rule is mode-specific, not absent) 🔴 (factual correction)
**Votes:** V3 N32 (explicit fact-check fail), V2 CAP1/CAP2 (per-slide static headline IS the caption + two-tone emphasis = manual proxy), V1 T1 ("lower half empty for caption burn-in")

Prior ANALYSIS said "NO burned-in captions." Wrong. The **Gemini family DOES burn captions** with word-level color highlighting (`"aren't static"` and `"move"` in green). The Anthropic family doesn't. Two-mode rule, not "no."

**Action:** Add `captionMode: 'none' | 'burned' | 'designed-only'` to schema.

---

## MED-CONFIDENCE FINDINGS (2 voters)

| Finding | Voters | Action |
|---|---|---|
| GeminiFrame meta-template (glass-frame canvas + 5-dot chapter stepper) | V1 T7, V3 N1 | Build `<GeminiFrameWrapper>` |
| CamcorderListicle (REC + viewfinder brackets + corner timecode) | V1 T15, V3 N2 | Build `<CamcorderFrame>` chrome variant |
| `<TerminalBlock>` AND `<EditorBlock>` as separate primitives | V3 N5+N6 | Build both — terminal ≠ editor (cross-creator with Carlos) |
| BarChartList horizontal data viz | V1 T9, V3 N4 | Extend BenchmarkBars or build new `<BarChartList>` |
| Strikethrough as semantic device | V3 N25, V4 timing quirk | Cross-creator with Carlos — same component |
| Multi-color gradient on big glyphs | V3 N26 | Add `fill: 'solid' \| 'gradient'` to text component |
| Italic-as-voice (Georgia serif italic accent word) | V5 §C, V1 T12 | Cross-creator with Carlos — same Playfair stack |
| Hand-drawn / penmark wavy underline | V3 N16 | Build `<PenmarkUnderline>` SVG component |
| LogoWall (6×4 grid of real-brand logos as credibility) | V3 N13 | Build `<LogoWall>` pulling from `logos/` registry |
| PricingTierCard with `???` masked engagement hook | V3 N12 | Add `mask?: boolean` prop |
| TweetEmbed (rotated tweet card flying in) | V1 T6 | Cross-creator with Bilawal — extend TweetCardHero |
| FloatingChipCluster (rotated -8°…+12°) | V3 N15 | Kinetic placement primitive |
| Theme inversion at CTA (key change before the drop) | V4 timing quirk | Add `ctaTheme` override prop |

---

## LOW-CONFIDENCE FINDINGS (1 voter)

- V3 N20 Lock-icon feature-gate row
- V3 N21 Engagement-poll CTA
- V3 N28 ambientGlow brand-set option
- V3 N29 stylized wordmark SVG (no font hacks)
- V5 contrast fails on small green/sky-blue mono labels (semantic, not just decorative)

---

## DELTA AGAINST PRIOR ANALYSIS.md

**Prior was right about:** breadcrumb / section label, one color-emphasized word per hero line, source attribution pill, subtle pattern bg, per-video accent matching subject brand.
**Prior was wrong about:** "no burned-in captions" (Gemini family burns captions), "one accent per video" (per-step rotation), "static pattern" (drifts continuously), "annotated screen recording" mischaracterization.
**Prior missed:** ~12 templates and ~15 components — entire GeminiFrame meta-template, Camcorder/REC variant, all data-viz vocabulary (bar charts, big-number sidecars, before→after), chapter-stepper + top-scrubber HUD system, strikethrough/gradient/underline emphasis modes.

---

## SPRINT 5 QUEUE (DIYSmart-derived only)

🔴 **Must build:**
1. `theme × template` schema split (orthogonal axes)
2. `<HUDChrome>` overlay (TopScrubBar + ChapterProgressNav + handle + 1px border)
3. `<SpecRow>` + `<KeyValueRowsCard>` primitive
4. `<EyebrowKicker>` mono-small-caps shared component
5. `<HeadlineEmphasis>` single-word-recolor headline
6. `<DriftingPattern>` continuous backdrop motion primitive
7. `<TerminalBlock>` + `<EditorBlock>` (cross-creator with Carlos)
8. Schema: `palette: AccentColor[]` per-step rotation + `captionMode` + `mode: 'accumulate' | 'replace'`

🟠 **Build later:**
- `<GeminiFrameWrapper>` glass-frame canvas variant
- `<CamcorderFrame>` REC viewfinder chrome variant
- `<BarChartList>` data viz
- `<LogoWall>` credibility primitive
- `<PenmarkUnderline>` SVG hand-drawn emphasis

🟢 **Skip:** PricingTierCard mask, LockedFeatureRow, PollCTA (low frequency).
