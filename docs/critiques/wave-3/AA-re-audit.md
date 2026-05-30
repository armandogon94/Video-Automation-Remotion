# AA — Wave-2 consolidated re-audit (3 variants × 5 dimensions)

> **Scope:** Re-grade the 2 Wave-2-fixed W21 variants (`benchmark-cream`, `benchmark-dark`, `tnf-blue`) across A1 (timing), A2 (color/contrast), A3 (typography), A4 (info density), A5 (brand) — comparing each grade against the Wave-1 baseline to measure whether the F1 mega-batch actually moved the needle.
>
> **Date:** 2026-05-25 · **Auditor:** wave-3 re-audit pass.
> **Wave-1 baseline:** `docs/critiques/wave-1/A{1,2,3,4,5}-*.md`
> **Wave-2 frames:** `output/2026-05-18-gemini-3-2-flash-leak/{benchmark-cream,benchmark-dark,tnf-blue}/preview-*.jpg`
>
> Grading scale: A+ / A / A− / B+ / B / B− / C+ / C / C− / D+ / D / D− / F. Deltas in plus-grades (`+1` = one tier up, `−1` = one tier down). Wave-1 grades for `benchmark-*` were unanimous across A1–A5 and `tnf-blue` was also covered everywhere, so each row has a real prior to subtract from.

---

## 1. benchmark-cream — Wave-2 re-audit

Frame inspected: `…/benchmark-cream/preview-t3s.jpg` (1080×1920, t=3s).

**Observed visual state at t=3s:**
- Top breadcrumb: `GOOGLE · I/O 2026 · FILTRACIÓN`, blue, tracked uppercase, centered, with thin blue underline beneath "2026".
- Title (ink-black, two lines): "Precio por millón de tokens / (entrada)".
- Two horizontal bars, label column left, value inside bar:
  - Gemini 3.2 Flash row: track is light-grey/cream, **filled portion is Gemini-blue** (`#4285F4`), small fill = `$0.25` in dark-ink text inside.
  - GPT-5.5 row: track is **warm-grey/taupe** (≈ `#6B6760`-ish muted), full-width fill, `$3.75` in white inside.
- Source caption near bottom-center: muted-grey "Filtración Google AI Studio · 5 mayo 2026".
- Caption pill at bottom: cream background, blue `Y` highlight, dim-grey "los números son escandalosos. Apareció" trailing.

| Dim | Wave-1 grade | Wave-2 grade | Δ | Specific change observed |
|---|---|---|---|---|
| A1 timing  | B    | B    | **0**  | Bars are fully landed at t=3s in both waves; stagger/animation behavior unchanged in this frame. The fade-in pattern looks identical; no evidence the F1 batch touched `BenchmarkBars9x16.tsx:105-130`. |
| A2 color   | D+   | A−   | **+5** | **Semantic inversion FIXED.** Gemini bar = blue (subject), GPT-5.5 bar = warm-muted-grey (comparator). The most damaging single color choice of Wave-1 is gone. The `$3.75` is now white on muted-grey (≈5.5:1, AA pass) instead of white-on-`#4285F4` (was 3.7:1, AA fail). The breadcrumb is still blue on cream (~3.4:1) but it's the only sub-AA element left on this variant. |
| A3 typography | B+ | B+ | **0**  | Title "Precio por millón de tokens (entrada)" wraps to two lines (no shrink-to-fit kicked in). Bar labels still read on two lines — `Gemini 3.2 / Flash` — same 1.1 line-height the Wave-1 critique flagged at `BenchmarkBars9x16.tsx:166`. Wave-2 batch did NOT touch this. |
| A4 density | A    | A    | **0**  | Layers still align: chart = data the audio cannot deliver, caption = audio tease ("Y los números son escandalosos"), voice = same tease. Three layers, three roles. Frame stays best-in-class. |
| A5 brand   | B+   | A−   | **+1** | Wave-1 docked this variant for "winner = blue = competitor" muddying the brand cue. With the semantic flip, blue now correctly means "us / Gemini" everywhere. Breadcrumb still on-spec. Only remaining brand hold-back: still no end-card / watermark (universal issue, not a per-variant defect). |

**Aggregate delta (5 dims):** **+6 grade-tiers** across 5 axes. Average grade Wave-1 → Wave-2: `B / B− mean → A−`. The single biggest win in the entire Wave-2 batch lands here, and it's exactly where it was promised (A2 #1).

---

## 2. benchmark-dark — Wave-2 re-audit

Frame inspected: `…/benchmark-dark/preview-t3s.jpg` (1080×1920, t=3s).

**Observed visual state at t=3s:**
- Top breadcrumb: same `GOOGLE · I/O 2026 · FILTRACIÓN`, blue (`#4285F4`), tracked uppercase. Reads clean on the near-black paper.
- Title in **bright cream-white** ("Precio por millón de tokens / (entrada)") — visibly crisper than the Wave-1 t=3s frame, no obvious halo.
- Two bars:
  - Gemini 3.2 Flash row: track is `#0A0F1A`-ish dark with subtle border, **fill is blue** (`#4285F4`), `$0.25` in cream-ink inside.
  - GPT-5.5 row: track is **warm-taupe muted** (≈`#7A6F5C`-ish), `$3.75` in DARK ink inside (≈12:1 — strong).
- Source caption: muted warm-grey "Filtración Google AI Studio · 5 mayo 2026" — readable but dim (same `#7A6F5C` on `#0F1B2D`-ish, ~3.8:1).
- Caption pill: dark-glass background, blue `Y`, cream "los números son escandalosos. Apareció" trailing.

| Dim | Wave-1 grade | Wave-2 grade | Δ | Specific change observed |
|---|---|---|---|---|
| A1 timing  | B    | B    | **0**  | Same observation as cream — bars settled by t=3s, no visible change to staggering or value-label late-pop. The 2-bar stagger problem the Wave-1 critique flagged (`barStaggerSeconds=0.3` too tight for n=2) is still present; F1 did not address `templates/benchmark-bars.json` defaults. |
| A2 color   | D    | A−   | **+5** | Semantic inversion FIXED — symmetric with cream sibling. GPT-5.5 bar = muted warm-grey, Gemini bar = blue. The dark variant accidentally HAD better in-bar contrast in Wave-1 (it scored D vs. cream's D+), so the gain is mostly in narrative clarity rather than contrast — but the change is the same magnitude. The amber `accentShadow` propagation bug (A2 cross-cutting #3) is no longer visually obvious on this frame because the only blue object is the small Gemini-row fill — but the bug is still in the code per A2:90/A2:196. |
| A3 typography | B+ | A−   | **+1** | Title clarity is **measurably better** in Wave-2 — the Wave-1 critique called out "visible aliasing/blurring on the smaller letters" at A3:94 on dark, and this frame shows clean stroke definition on "Precio por millón…". Suggests A3 Top-5 #1 ("bump dark ink from cream to pure `#FFFFFF` for 24-80px") was applied at least to the title. Bar-label line-height still 1.1 (unchanged). |
| A4 density | A    | A    | **0**  | Identical to cream's layer arrangement, identical verdict. Still best-in-class info density. |
| A5 brand   | B+   | A−   | **+1** | Same one-tier brand bump as cream: blue now consistently means "Gemini / subject" rather than coloring the competitor. Dark↔cream parity preserved. End-card still absent (universal). |

**Aggregate delta:** **+7 grade-tiers** across 5 axes. Average Wave-1 → Wave-2: `B / B− mean → A−`. The dark variant gained a hair more than cream because the dark-ink fix (A3) compounded with the semantic flip (A2/A5). This is the single biggest cumulative improvement of the three variants re-audited.

---

## 3. tnf-blue — Wave-2 re-audit

Frame inspected: `…/tnf-blue/preview-t1s.jpg` (1080×1920, t=1s).

**Observed visual state at t=1s:**
- Top-center breadcrumb: `GOOGLE · I/O 2026 · FILTRACIÓN`, Gemini-blue, tracked uppercase, blue underline animating under "2026".
- Top-LEFT: a rectangular **blue chip** with white "FILTRACIÓN" text — still present, now in BLUE (was warm-red in Wave-1) with white text inside.
- Hero center: huge "GEMINI 3.2 / FLASH" in ink-black Inter 800 on cream paper.
- Bottom caption pill: cream background with thin blue left-border, ink-black "Filtraron Gemini tres punto" with `dos` highlighted blue and `Flash` in muted grey trailing.

| Dim | Wave-1 grade | Wave-2 grade | Δ | Specific change observed |
|---|---|---|---|---|
| A1 timing  | B−   | B−   | **0**  | TechNewsFlash spring config (`useOverlayChoreography.ts:41-50`, default `damping:15, stiffness:110`) appears unchanged — chip and hero still arrive on the punchier spring with ~6% overshoot. F1 did NOT collapse the spring outlier into the editorial spring. The 6-frame hard fade-out also unchanged. None of A1 Top-5 #1/#4 landed for this variant. |
| A2 color   | C    | C+   | **+1** | Partial win. The legacy warm-red color on the corner chip IS gone — chip is now blue, matching the breadcrumb's accent. But the chip-text white-on-`#4285F4` contrast pair is **still 3.7:1, still sub-AA** (A2:49 hot-spot). The recoloring fixed accent discipline (now one hue) but not the readability failure. The breadcrumb text at ~3.4:1 on cream also persists — no `accentOnLight: #1A73E8` swap landed (A2 Top-5 #2 not done). |
| A3 typography | B  | B    | **0**  | The chip is still occupying the same vertical band as the breadcrumb (chip top:60 + height ~50 → y≈110; breadcrumb top:80 + height ~50 → y≈130). Wave-1 flagged this as "the chip-on-top-of-breadcrumb collision" (A3:43-44, Top-5 #4). In Wave-2 they no longer **overlap** because they're horizontally offset (chip is at top-left, breadcrumb is centered), so the collision is geometrically resolved on THIS frame, but no y-guard was added per the Wave-1 recommendation — a longer breadcrumb string would still collide. So the visible-defect is gone but the latent risk remains. |
| A4 density | C    | C    | **0**  | At t=1s, the eye still sees: chip "FILTRACIÓN" + breadcrumb "GOOGLE · I/O 2026 · FILTRACIÓN" (which contains "FILTRACIÓN" a SECOND time) + hero "GEMINI 3.2 FLASH" + caption "Filtraron Gemini tres punto dos Flash" + voice saying the same noun phrase. That's **the word "FILTRACIÓN" rendered twice in the same horizontal band** plus the Gemini model name in three surfaces plus audio. The redundancy that earned Wave-1's C is **unchanged**, possibly **worse** because the unified blue color makes the chip and breadcrumb visually more sympathetic and thus easier for the eye to pair them as "one repeated label." |
| A5 brand   | C−   | B−   | **+1** | Color discipline improved — both top-left and top-center elements now carry the SAME blue, so the "two accents in one frame" failure of Wave-1 is resolved. But the **double-labeling SHAPE collision is not fixed** (A5:45 "Double-labeling collision"). Wave-1 prescribed (A5 Top-5 #1): "Kill the legacy `FILTRACIÓN` chip on tnf-blue. Replace with the canonical `BrandBreadcrumb`." Wave-2 only RECOLORED the chip blue — it did not REMOVE it. The chip is still a non-canonical brand element living next to the canonical breadcrumb. Half-fix. |

**Aggregate delta:** **+2 grade-tiers** across 5 axes. Average Wave-1 → Wave-2: `C+ mean → B−`. The smallest movement of the three variants — and the only one with an honest case for being a "shallow fix" rather than a "real fix." See §"Regressions / shallow fixes" below.

---

## Aggregate scoreboard

| Variant | A1 Δ | A2 Δ | A3 Δ | A4 Δ | A5 Δ | Total tier Δ |
|---|---|---|---|---|---|---|
| benchmark-cream | 0 | +5 | 0 | 0 | +1 | **+6** |
| benchmark-dark  | 0 | +5 | +1 | 0 | +1 | **+7** |
| tnf-blue        | 0 | +1 | 0 | 0 | +1 | **+2** |

Total Wave-2 tier delta across 3 variants × 5 dims = **+15 tiers** (out of 15 dims). Two of the three variants jumped a half-letter or more; tnf-blue moved only fractionally. The F1 batch was clearly aimed at A2 (color) — which delivered — and at A5 (brand) — which delivered partially.

### Was the F1 mega-batch effective?

**Yes, but unevenly.** The batch landed two A2 fixes (the benchmark semantic inversion, dark-mode ink crispness) plus a small A5 cleanup (chip recolored on tnf-blue), and the benchmark variants moved from "weakest in the wave" to among the strongest. But the batch left ALL of A1's Top-5 untouched and only half-addressed A3, A4, A5 issues on `tnf-blue`.

**Fixes that moved grades:**
1. Benchmark semantic accent inversion (A2 cross-wave win) — biggest single change.
2. Dark-mode ink color (`cream → pure white` for body-sized text on dark) — visible crispness gain on `benchmark-dark` title.
3. Recolor `tnf-blue` legacy chip from warm-red to Gemini-blue (A2 → A5 chain) — improved accent discipline.

**Fixes that didn't (or weren't even attempted):**
1. **A1 timing changes — none landed.** Spring unification (A1 Top-5 #1), arrow causality (#2), DiagramExplainer stagger (#3), TechNewsFlash crossfade default (#4), TweetCard artifact start (#5) — all five appear to be exactly as Wave-1. The bars in both benchmark frames look identical to Wave-1 in timing. F1 had no timing work item, evidently.
2. **A2 cream-paper blue contrast** — the `accentOnLight: #1A73E8` swap (A2 Top-5 #2) did NOT land. Every cream-paper variant still has a sub-AA blue breadcrumb text (~3.4:1).
3. **A3 bar-label line-height (B+ → A-)** — `BenchmarkBars9x16.tsx:166` still at 1.1, still wraps "Gemini 3.2 / Flash" awkwardly. F1 left this on the floor.
4. **A4 redundancy** — no info-density work landed. `tnf-blue` still says "FILTRACIÓN" twice in the same row (chip + breadcrumb). The benchmark variants were already A on density so no movement needed there.
5. **A5 chip removal on tnf-blue** — the chip was RECOLORED, not REMOVED. The original A5 prescription was "kill the legacy chip; the canonical breadcrumb already lives in the same composition." Half-applied.

---

## Honest call-out: regressions and shallow fixes

### Regression 1: tnf-blue density may actually be *worse*

In Wave-1 the warm-red chip and the blue breadcrumb were chromatically dissimilar, which gave the eye a small reason to read them as TWO separate elements (one channel-default, one Gemini-flag). In Wave-2 they're the SAME blue. The eye now reads them as a single repeated label — the word "FILTRACIÓN" rendered TWICE in the same horizontal band, in the same color, with the same uppercase tracked styling. That's an A4 regression hiding inside an A2/A5 "fix." Grade stayed C only because Wave-1 was already calling this redundancy out — but the perceptual character changed for the worse.

### Regression 2: dark-mode `accentShadow` bug now slightly more exposed

In Wave-1 the warm-amber `accentShadow` accidentally haloed `diagram-dark` blue boxes prettily (A2:90). On `benchmark-dark` Wave-2 the bug is invisible because the blue object (Gemini bar) is small. But the bug is still in the code per A2:196 ("when `subjectTool` overrides `accent`, `accentShadow` is NOT recomputed"). The F1 batch did not fix the propagation; it just happened to not trigger on this frame. A future template that uses a large blue accent block on dark will surface it again.

### Shallow fix 1: tnf-blue is recolor, not refactor

Real fix per Wave-1 A5 #1 was REMOVE the chip and let the canonical breadcrumb own that role. Recoloring achieves visual harmony but not structural correctness. A canonical brand grammar component should not coexist with a non-canonical legacy element doing the same job — even if they're now the same color.

### Shallow fix 2: white-on-blue chip text still fails AA

The chip is now blue with white text. That's the EXACT pair Wave-1 flagged at 3.7:1 contrast (A2:49) as the wave's worst small-text contrast hot-spot. By recoloring the chip from warm-red (which had 5:1 white text) to Gemini-blue (which has 3.7:1 white text), Wave-2 actually **made the chip text LESS legible than Wave-1 had it**. That's a measurable regression on a specific contrast pair.

### Non-fix 1: end-card / watermark still absent

A5 Top-5 #3 ("60-frame end-card brand stamp") was zero-implemented. All three variants remain attribution-less when screenshotted/clipped. This isn't a Wave-2 regression — it's an unchanged pre-existing gap — but it remains the single biggest brand-system hole.

---

## Top 5 STILL-OUTSTANDING issues for Wave 4

Prioritized by `(impact × likelihood of regression / staleness) ÷ implementation cost`. Files cited so the next implementer can move directly.

### 1. **Remove the legacy chip on `tnf-blue` for real (A5 #1 + A4 redundancy + A2 chip-text contrast all fold into this one change)**

Why this is #1: three independent Wave-3 findings collapse into a single delete. The chip is what duplicates "FILTRACIÓN" (A4 density regression), the chip is what carries the 3.7:1 white-on-blue contrast pair (A2 hot-spot), and the chip is the non-canonical brand element living next to the canonical breadcrumb (A5 structural defect). Delete the chip and unify the label into the breadcrumb (which already says it). Estimated cost: one composition edit + a snapshot test refresh.

**Where:** `src/compositions/TechNewsFlash9x16.tsx` — the chip is being mounted by `ChipScene` even when a `BrandBreadcrumb` is also mounted. Add a guard so chip and breadcrumb cannot coexist (chip is a no-op when `breadcrumb` is present in the brief), OR remove the chip entry from the `tnf-blue` template JSON.

### 2. **Land the spring-unification (A1 Top-5 #1)**

The TechNewsFlash overlay default at `damping:15, stiffness:110` is still the brand's only motion DNA outlier. This is one config change with cross-template impact (every chip/huge/subtitle/cta scene in TNF). Until landed, the brand has two motion signatures and `tnf-blue` keeps reading "jumpier" than the editorial templates next to it in the comparison grid.

**Where:** `src/compositions/scenes/useOverlayChoreography.ts:41-49` — change default spring to `{ damping: 22, stiffness: 130, mass: 0.7 }`. Export as `EDITORIAL_SPRING` constant from `src/compositions/scenes/` and have every other composition import it.

### 3. **Ship `accentOnLight: #1A73E8` for the Gemini override on cream paper (A2 Top-5 #2)**

Every cream-paper variant still has small blue text (breadcrumb, eyebrows, attributions) failing WCAG AA at ~3.4:1. The current `#4285F4` is calibrated for dark backgrounds; Google's own brand system switches to `#1A73E8` on light surfaces. ONE field added to `src/brand/tools-palette.ts` and ONE conditional in the resolvers (`palette === "cream" ? accentOnLight : accent`) fixes 5 of 7 contrast hot-spots from the A2 audit.

**Where:** `src/brand/tools-palette.ts:70` add `accentOnLight: "#1A73E8"` to the `gemini` entry; resolvers in each composition (e.g. `BenchmarkBars9x16.tsx:270`) pick based on resolved palette.

### 4. **Add a 60-frame end-card with avatar-pixar watermark (A5 Top-5 #3)**

Still zero attribution surface on 11/12 variants (the tweetcard composition is the only one with an in-frame author signal). The proposal — a fade-in 96px avatar at center over the last 1.5s, NOT a persistent bug — preserves the restraint pattern the reference creators use while making screenshots/clips attributable.

**Where:** new `src/components/BrandEndCard.tsx`, mount as the final scene in every 9x16 root composition.

### 5. **Fix `BenchmarkBars9x16.tsx:166` bar-label line-height 1.1 → 1.15 (A3 Top-5 #2)**

Lowest-cost item on the list — one number. Eliminates the cramped "Gemini 3.2 / Flash" wrap on both benchmark variants (cream and dark). The benchmark composition is the strongest in the wave now post-A2 fix; this typography micro-fix pushes both variants from A− to a solid A and removes a visible defect in the brand's currently-best frame.

**Where:** `src/compositions/BenchmarkBars9x16.tsx:166`.

### Bonus (not in Top 5 but worth flagging)

- **Propagate `accentShadow` through the `subjectTool` override** (A2 Top-5 #3). Bug is dormant on the current 3 frames but will re-surface on any composition that puts a large blue element on dark paper. Two-line resolver helper.
- **Wave-2 left ALL of A1's Top-5 untouched** — A1 was effectively skipped. If Wave-4 has bandwidth, the next-highest-impact A1 items beyond the spring unification are: arrow causality in DiagramExplainer (A1 Top-5 #2) and the DiagramExplainer stagger 1.4s → 0.9s (A1 Top-5 #3). Neither was tested in this re-audit (no diagram frames provided) but the Wave-1 critique was unambiguous about their impact.

---

## One-paragraph executive summary

The F1 mega-batch was net-positive but uneven: it delivered a textbook A2 win on both benchmark variants (the Wave-1 D+/D semantic-inversion failure is now A−/A−, a +5 tier jump per variant), a small A3 dark-mode crispness gain on `benchmark-dark`, and a half-finished A5 cleanup on `tnf-blue` (chip recolored, not removed). `tnf-blue` moved only +2 tiers total and carries two new regressions hiding inside the "fix" (the chip text is now LESS legible than its Wave-1 warm-red version, and the duplicated-label problem is perceptually worse now that both labels share a color). A1 timing was entirely skipped. Wave-4 should prioritize removing the `tnf-blue` chip outright (folds three issues into one delete), then land the spring unification, then ship `accentOnLight` for cream-paper blue text. Each of those is a one-to-three-file change with cross-wave impact.
