# @carloscuamatzin — Wave 4 Consensus (5 voters)

> **Method:** Jaccard-style consensus across 5 independent Opus voters (V1 Templates, V2 Components, V3 Red-team, V4 Motion, V5 Type+Color). HIGH = ≥3 voters converged, MED = 2 voters, LOW = 1 voter (recorded but not actioned without further evidence).
>
> **Headline:** Prior ANALYSIS.md identified ~6 templates and a static-S1 type/color system. The 5-voter pass reveals **28 distinct templates**, an entirely missed **UI Mockup DSL family** (the highest-leverage unlock), and refines the "one accent per video" rule to "**one accent per semantic role**". Single-agent S1 captured roughly **25-30% of what's actually on screen.**

---

## HIGH-CONFIDENCE FINDINGS (3+ voters agree)

### 1. The UI Mockup DSL is the single biggest missing piece 🔴 SHIP-FIRST
**Votes:** V1 (T5/T6/T7/T9), V2 (Top component #1 `<MacWindow>`), V3 (NEW finding #1-5)

Carlos's "code editor / terminal / browser / phone / markdown" screenshots are **not screen recordings** — they are pure React-templated mockups with hand-crafted code-as-data props, per-token syntax color, animated cursor blinks, side-pill ALLOW/DENY callouts. V3 calls out 5 distinct family members:
- `MacTerminalMock` (6 reels) — `lines[] = { kind: 'prompt'|'output'|'comment'|'success'|'error', text, tokens? }`
- `BrowserMockKanban` (1 reel) — any HTML body inside browser chrome
- `PhoneMessagingMock` (1 reel) — `app: 'whatsapp'|'imessage'|'telegram'`, sequential messages
- `MarkdownDocMock` (1 reel) — editor card w/ live "● EDITANDO" pill
- `AnnotatedCodeBlock` (composite) — extends `MacTerminalMock` with `lineDecorations[]` + `sideCallouts[]`

**Action:** Build `<MacWindow variant="terminal|browser|editor|phone|doc">` as a shared molecule. This is the **single highest-leverage component in the entire Wave-4 catalog.**

### 2. Three-family typography stack: Sans + Mono + Serif Italic 🔴
**Votes:** V1 (T23 KineticEssay), V2 (4.1-4.3), V5 (entire §1)

Our stack is Inter-only. Carlos runs **three voices**: Inter (geometric sans 800-900), Fira Code/JetBrains Mono (signature dev-tool chrome — appears in MORE places than the sans), Playfair Display Italic (editorial pull-quotes, contrastive `vs`, numeric percentages like `3%`, `1.4%`). Each font has a job: sans = hero declarations, mono = code/state/taxonomic tags, serif italic = "this is an idea, slow down."

**Action:** Add `Fira Code` + `Playfair Display Italic` to `brand/fonts.ts` via `@remotion/google-fonts`. Add `--font-mono` and `--font-serif` tokens to `brand/config.ts`.

### 3. ONE accent per SEMANTIC ROLE, not per scene 🔴 (rule refinement)
**Votes:** V3 (recommendation 5), V4 (covered transition discipline), V5 (top color lesson)

Prior S1 claimed "one accent per scene." False. V3 caught Carlos using 4 accents simultaneously in `PillTagStack` (taxonomic variety) and green+red simultaneously in `AnnotatedCodeBlock` (ALLOW vs DENY). The actual rule is **semantic-role binding**:
- Coral `#E89B7A` = editorial concept
- Gold `#D4A93B` = metric / proof
- Cyan `#5BC0E8` = data / system state
- Indigo `#9A8FFF` = process
- Mint green `#7CE49A` = success / "good"
- Red `#FF5757` = problem / "bad" / negative delta

**Action:** Refactor `subjectTool` accent override into `palette: { [semanticRole]: hex }`.

### 4. Slow cadence (~0.11 cuts/s) — the calmest in the corpus 🔴
**Votes:** V1 (long dwells implicit), V4 (explicit cadence table — median 0.11/s, vs TikTok 0.3-0.6), V3 ("no naked hard cuts between graphics")

One cut every ~9 seconds. The illusion of pace comes from **within-scene sub-animations** (counters ramp, bars fill, lines draw), not from cuts. V4 says: "**Nothing on screen is ever instantly true.**" V3 adds: "every transition is covered by a blackout pulse, particle shatter, or cross-blur ghost — no naked cuts between graphics."

**Action:** Default new templates to long-dwell + within-scene animation, NOT to short-shot cutting.

### 5. Numbers always count up — never set instantly 🔴
**Votes:** V1 (T14/T16/T17 counters explicit), V2 (5.6 counter primitive), V4 (top utility #2 `countUp`)

`countUp(from, to, durationMs=800, ease='easeOutQuart', syncedBar?)` should be the **only** way numbers ever appear. The bar fill, counter, percentage, and chart line all share the same ramp duration so they finish on the same syllable.

**Action:** Build `src/animation/countUp.ts` shared primitive used by `BigNumberHero9x16`, `BenchmarkBars9x16`, `Sparkline9x16`, `AnimatedCounter9x16`.

### 6. Warm near-black + radial vignette, NOT pure #000 🔴
**Votes:** V2 (7.1 "subtle radial gradient"), V4 (3.1 "radial vignette breathing"), V5 ("warm vignette is the entire mood difference")

Carlos's dark base is `#0A0608` → `#1B0F10` (warm center, NOT cool blue navy or pure black). The vignette breathes on a 3-4 s cycle. Our current `--bg-deep-navy: #0F1B2D` reads cold by comparison.

**Action:** Add `getPalette('dark').paper = warm-near-black` + breathing vignette layer to dark-mode templates.

### 7. Warm off-white text `#F1ECE1`, NOT pure `#FFFFFF` 🔴
**Votes:** V2 (4.6 caption color), V4 (color discipline), V5 (lesson #2)

Pure white on dark = "Word document tell." Warm off-white = "printed paper." One CSS variable swap, big mood lift.

**Action:** Define `--brand-ink-on-dark: #F1ECE1` token; refactor `getBodyTextColor` helper to return this instead of `#FFFFFF` for dark palette.

### 8. Staggered cascade for lists (accelerating, not linear) 🔴
**Votes:** V1 (T10/T11 stagger), V2 (5.5 "80-150ms stagger"), V4 (#3 `staggeredCascade` with `accelerate=true`)

5 hooks, 7 patterns, 3-step pipeline — all use 80-120 ms stagger BUT V4 caught that the stagger **accelerates** so later items don't bore the eye. Linear stagger feels mechanical.

**Action:** Build `src/animation/staggeredCascade.ts` with `accelerate: boolean` option.

### 9. Persistent SceneChapterChip overlay (kicker / chapter marker) 🔴
**Votes:** V1 (T26 chapter indicators), V2 (3.3 EyebrowLabel `+200 tracking`), V3 (Chrome A "Scene-Chapter Chip"), V5 ("tracked-uppercase label convention")

Every Carlos reel has a `CASO 05`, `INTENTO 1`, `HALLAZGO 03`, `EL FLUJO` tracked-uppercase pill anchored top-left/center for the duration of a chapter. It's the persistent thread that makes his videos feel like a single course rather than a string of clips.

**Action:** Build `<SceneChapterChip>` global overlay component that any template composes.

### 10. AmbientBackdrop layer always-on 🔴
**Votes:** V2 (7.1-7.5 backgrounds), V4 (#5 `ambientBackdrop`), V3 (continuous motion)

Drifting dust particles (30-60 dots), breathing vignette, optional matrix-rain / liquid-wave / particle-shatter. Never stops. Keeps the screen biologically "alive" during 5-8 s dwell beats.

**Action:** Build `<AmbientBackdrop>` with `{ vignettePulse, dustParticles, mode: 'wave' | 'matrix' | 'shatter' | 'none' }` props.

---

## MED-CONFIDENCE FINDINGS (2 voters)

| Finding | Voters | Action |
|---|---|---|
| `blurInFocus` entry move (gaussian 14→0px + scale 0.96→1, ~280 ms) | V4 #1, V3 NEW #11 | Build `src/animation/blurInFocus.ts` |
| Covered transitions only — `blackoutPulse / particleShatter / crossBlur` | V3, V4 #4 | `coveredTransition(kind: ...)` wrapper |
| TikTok-stroke caption mode for busy backgrounds | V3 chrome D, V5 captions | Add `EditorialCaption` `style: 'editorial' \| 'tiktok-stroke'` mode |
| Ghost-next caption preview (current word white, upcoming muted-gray) | V3 chrome C, V2 9.5 | Add `revealMode: 'binary' \| 'ghost-next'` |
| Strikethrough as semantic device (X over card, line through word) | V1 T21, V4 timing quirk | `Strikethrough` SVG component with stroke-dash animation |
| Cream/parchment alt palette `#F1ECE2` for editorial topics | V1 T17/T22, V2 7.2, V5 §2 | Already in `palette: 'cream'` — confirm warmth is right |
| Hand-drawn glyphs / cartoon character cards (illustrated concept) | V1 T22, V2 10.4 | Skip — high content cost, low template ROI |
| BrandProofCard / TestimonialCard (cream pull-quote) | V3 NEW #13-14 | Build `<TestimonialCard>` cream variant of QuoteCard9x16 |

---

## LOW-CONFIDENCE FINDINGS (1 voter — recorded, deferred)

- V1: 28-template enumeration with sprint-priority table (workable build queue)
- V2: 5 background stages × 10 React molecules combinatorial coverage hypothesis
- V3 NEW #6-#7 ServiceBeamConnector, GlyphLegendList
- V5: Specific hex sampling — useful for tokenization but eye-dropped

---

## DELTA AGAINST PRIOR ANALYSIS.md

**S1 was right about:** cream-flowchart node-card grammar, color-coded camp comparison, watercolor editorial illustration card, one-accent-per-scene (now refined).
**S1 was wrong about:** the entire UI-mockup family (called them "annotated screen recordings"), node titles font (claimed sans, actually mono), "one accent per scene" rule (refine to "per semantic role").
**S1 missed:** 22 of 28 templates, 11+ reusable molecules, the kinetic-essay typography signature, the always-on AmbientBackdrop layer, the glow-on-active-type filter, the dual-caption track (designed copy top + burned captions bottom).

---

## SPRINT 5 QUEUE (Carlos-derived only)

🔴 **Must build:**
1. `<MacWindow variant="terminal|browser|editor|phone|doc">` family — UI Mockup DSL
2. `src/animation/countUp.ts` shared primitive (all number reveals)
3. `src/animation/staggeredCascade.ts` with `accelerate` option
4. `src/animation/blurInFocus.ts` entry move
5. `<SceneChapterChip>` global overlay
6. `<AmbientBackdrop>` always-on layer
7. Brand tokens: `Fira Code` + `Playfair Display Italic` fonts, `--brand-ink-on-dark: #F1ECE1`, warm-near-black palette mode

🟠 **Build later:**
- `CodeDiffBeforeAfter9x16` (T8)
- `KineticEssay9x16` (T23) — multi-line serif/sans typography
- `BigNumberDuel9x16` (T14) — split-comparison BigNumberHero variant
- `LineChartAnnotated9x16` (T16) — extends Sparkline9x16 with annotations
- `PipelineFlow9x16` (T18) — vertical cards-with-arrows
- `OutroFollowCTA9x16` (T28)
- `TestimonialCard` cream pull-quote variant

🟢 **Skip / defer:**
- T1 pixel-mascot intro (brand-specific to Carlos)
- T22 IllustratedConcept (per-script image-gen cost)
- T24/T25 bespoke quadrant/market viz (low reuse)
