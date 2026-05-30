# A5 — Brand-consistency critique · W21 wave-1 (12 variants)

> **Scope:** brand consistency ONLY — breadcrumb placement/style, watermark presence/style, accent-color discipline, palette behavior. Composition quality, motion, typography balance and content are out of scope for this audit (covered by A1–A4 / A6+).
>
> **Date:** 2026-05-25 · **Auditor:** brand-consistency critic
> **Inputs:** 12 preview JPGs under `output/2026-05-18-gemini-3-2-flash-leak/<variant>/preview-*.jpg` + `comparison-grid-v2.jpg`.
> **Spec source-of-truth:** `brand/config.json` (Armando Inteligencia: `#1B3A6E` navy / `#D4AF37` gold / `#FAF7F2` paper / `#0F1B2D` deep navy + Inter + Georgia, default watermark = `avatar-pixar.png` 96px bottom-right @ 0.9 opacity) · `src/components/BrandBreadcrumb.tsx` (universal "house grammar" element — uppercase, 0.22em tracking, top-80px, animated underline) · `src/components/BrandWatermark.tsx`.

---

## Pre-flight: what the brand spec actually mandates

From the source files:

| Element | Spec | Default value |
|---|---|---|
| Breadcrumb position | `topPx` prop, default 80 | 80px from top, centered horizontally |
| Breadcrumb type style | Inter 700, `letter-spacing: 0.22em`, uppercase, 30px | non-negotiable typographic mark |
| Breadcrumb accent | `accentColor` prop, default `#B33A2A` (editorial warm-red) | meant to flex per-tool (Gemini → blue, Anthropic → warm-red) |
| Breadcrumb underline | Animated draw-on, 120px max, 2px height, `accentColor` | should always be present |
| Watermark | Component exists, opt-in via `WatermarkStyle.enabled` | spec default: `avatar` logo, 96px, bottom-right, 0.9 opacity |
| Brand palette neutrals | `#FAF7F2` paper / `#0F1B2D` deep navy / `#1A1A1A` ink | only paper + deep-navy are wave-1-blessed |
| Brand accents | `#1B3A6E` navy / `#D4AF37` gold (primary) — `#B33A2A` editorial warm-red (variant) | one-accent-per-video rule (confirmed by midu.dev analysis) |
| **Per-video override (this wave)** | `subjectTool: gemini` → blue accent | All 12 variants should land on the same Gemini blue |

Cross-creator "house grammar" (from `references/creators/{carloscuamatzin,diysmartcode,bilawal.ai}/ANALYSIS.md`):

1. Breadcrumb is universal — every Carlos/DIY reel opens with `BRAND · DATE` tracked uppercase + thin colored underline. It's the single most-reused identity element in the reference set.
2. One accent color per video — confirmed across all three reference creators. Tool/topic dictates color, never the template.
3. Templates rotate; the breadcrumb anchors them. A viewer ID's the channel from the breadcrumb + type system + restraint — not from a logo lockup.
4. Watermark is rarely a giant logo bug — Carlos & DIY have NO persistent avatar/logo bug. Bilawal does a discreet end-card. Restraint is the brand signal.

---

## Variant-by-variant audit (5 questions each)

### 1. `remotion-v2-baseline` — editorial cream pull-quote
1. **Breadcrumb:** ❌ NO. There is a pill-shaped `FILTRACIÓN` chip at top-left in warm-red — but this is a **legacy section label**, NOT `BrandBreadcrumb`. No centered tracked uppercase + accent underline.
2. **Watermark:** ❌ No avatar. No logo. The pull-quote card at bottom is decoration, not brand mark.
3. **Accent match:** ❌ Warm-red `#B33A2A` (the editorial default), NOT Gemini blue. Off-spec for this subject.
4. **Feels @armandointeligencia?** Could pass as any editorial AI channel — actually closer to `carloscuamatzin`'s cream-flowchart aesthetic than to our own brand. No identity-anchoring element.
5. **Same-content test:** A viewer would NOT pair this with `tnf-blue` as the same channel — the chip-style label vs. centered-tracked-breadcrumb are totally different shapes.

### 2. `tnf-blue` — Tech News Flash (blue accent)
1. **Breadcrumb:** ⚠️ PARTIAL. Has the new tracked-uppercase `I/O 2026 · FILTRACIÓN` at top-center with a thin blue underline (correct!) — but ALSO has the legacy `FILTRACIÓN` warm-red pill at top-left overlapping it. **Double-labeling collision.**
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ⚠️ MOSTLY. Breadcrumb + underline are blue, but the legacy chip is still warm-red — two accents in one frame.
4. **Feels @armandointeligencia?** Closer than baseline, but the chip overlap kills credibility.
5. **Same-content test:** Without the chip overlap, this would pair beautifully with `tnf-transitions`. With it, looks like an unfinished refactor.

### 3. `tnf-transitions` — Tech News Flash w/ crossfade
1. **Breadcrumb:** ✅ YES at first frame (`GOOGLE I/O 2026 · FILTRACIÓN` tracked uppercase + blue underline) — the legacy chip from `tnf-blue` is REMOVED. Crossfade frame shows breadcrumb still anchored. Cleanest breadcrumb in the set.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ Pure Gemini blue throughout. One-accent discipline respected.
4. **Feels @armandointeligencia?** YES — most "house-grammar" variant. Could sit next to a `@carloscuamatzin` flowchart without looking borrowed.
5. **Same-content test:** Best anchor in the set. If this is the breadcrumb canon, every other template should adopt the EXACT same position/size/tracking.

### 4. `tweetcard` — TweetCardHero on dark
1. **Breadcrumb:** ⚠️ Shows `GOOGLE · FILTRACIÓN` (shorter form — no "I/O 2026" date). Position looks right (~80px top, centered). Underline present, blue.
2. **Watermark:** N/A — the tweet card itself acts as a "brand-author" surrogate (`@armandointeligencia` is the screen name on the card). Stronger identity signal than any other variant in the set.
3. **Accent match:** ✅ Gemini blue breadcrumb + Twitter-blue verified check (acceptable overload — Twitter blue ≈ Gemini blue).
4. **Feels @armandointeligencia?** YES — the screen-name on the tweet IS the brand signature. Bilawal.ai uses exactly this trick.
5. **Same-content test:** Pairs with `tnf-transitions`/`diagram-dark` because all three share the dark + blue-breadcrumb grammar. **Inconsistency:** breadcrumb text differs (`GOOGLE · FILTRACIÓN` vs `GOOGLE I/O 2026 · FILTRACIÓN` vs `GOOGLE · FILTRACIÓN`).

### 5. `diagram-cream` — DiagramExplainer (cream/light)
1. **Breadcrumb:** ✅ `GOOGLE · FILTRACIÓN`, tracked uppercase, blue underline, ~80px top, centered. CORRECT placement.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ All flow-arrows, card borders, sublabels in Gemini blue. Disciplined.
4. **Feels @armandointeligencia?** YES — this is the carloscuamatzin cream-flowchart pattern executed cleanly with our blue. Identity-correct.
5. **Same-content test:** Pairs with `diagram-dark` (dark mirror of same composition) and `tnf-transitions`. Strong.

### 6. `diagram-dark` — DiagramExplainer (deep navy)
1. **Breadcrumb:** ✅ Identical to `diagram-cream`. Position/size/tracking preserved across light↔dark. Excellent.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ Cards/arrows/sublabels all blue. Card text shifts to cream (`#FAF7F2`) for legibility — correct dark-mode behavior, palette stays in brand.
4. **Feels @armandointeligencia?** YES — deep navy (`#0F1B2D`) matches `brand.colors.backgroundDark` exactly. On-spec.
5. **Same-content test:** Pairs with `diagram-cream` PERFECTLY — same breadcrumb, same accent, only background flipped. This is the model behavior the other templates should mimic.

### 7. `quote-cream` — QuoteCard9x16 (cream)
1. **Breadcrumb:** ✅ `GOOGLE I/O 2026 · FILTRACIÓN` — long form (matches `tnf-transitions`), tracked uppercase, blue underline. Correct.
2. **Watermark:** ❌ No avatar. **However**, the composition uses `ARMANDO INTELIGENCIA` as an in-quote attribution — a textual brand signature. Acceptable substitute for this template only.
3. **Accent match:** ✅ Breadcrumb blue + decorative open/close quote marks blue + attribution blue. Single accent. Good.
4. **Feels @armandointeligencia?** YES — strongest single-frame brand authorship signal in the set (the channel name is literally on screen). But: the `AI Leadership Lab` sub-label below `ARMANDO INTELIGENCIA` is OFF-SPEC — that's a placeholder sub-brand from `brands.json`, not a real attribution. Looks confusing.
5. **Same-content test:** Pairs with `quote-dark`, `diagram-cream`. But the orphan `AI Leadership Lab` line breaks the family.

### 8. `quote-dark` — QuoteCard9x16 (dark)
1. **Breadcrumb:** ✅ Same as `quote-cream`, mirrored on dark.
2. **Watermark:** ❌ No avatar. Same in-quote attribution trick as cream.
3. **Accent match:** ✅ Disciplined Gemini blue throughout. Body type flipped to cream for legibility.
4. **Feels @armandointeligencia?** YES — model dark-mode of `quote-cream`.
5. **Same-content test:** Pairs cleanly with `quote-cream` (same caveat re: AI Leadership Lab sub-line).

### 9. `bignum-cream` — BigNumberHero (cream)
1. **Breadcrumb:** ✅ `GOOGLE · FILTRACIÓN` (short form), blue underline, ~80px. Correct.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ Big `×` glyph in Gemini blue, sub-label `GEMINI 3.2 FLASH` in blue. ONE accent. Excellent restraint — matches DIY's HeroPricing template grammar.
4. **Feels @armandointeligencia?** Closer to DIY than to us, but on-spec — the cream paper + blue accent IS the wave-1 voice.
5. **Same-content test:** Pairs with `bignum-dark`, `diagram-cream`. Consistent.

### 10. `bignum-dark` — BigNumberHero (dark)
1. **Breadcrumb:** ✅ Same `GOOGLE · FILTRACIÓN`, blue underline, mirrored on dark.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ The "15" digits render in cream (`#FAF7F2`) — that's a defensible dark-mode adaptation of "ink"; `×` and sub-label stay blue. Single accent.
4. **Feels @armandointeligencia?** YES — exact dark mirror of `bignum-cream`. Best light↔dark parity in the set alongside `diagram-{cream,dark}`.
5. **Same-content test:** Pairs cleanly. Model behavior.

### 11. `benchmark-cream` — BenchmarkBars (cream)
1. **Breadcrumb:** ✅ `GOOGLE · FILTRACIÓN`, blue underline. Correct.
2. **Watermark:** ❌ No avatar. Has `Filtración Google AI Studio · 5 mayo 2026` text-attribution near bottom-center — this is a *data source* citation, not a brand mark. OK.
3. **Accent match:** ✅ Gemini blue used for the GPT-5.5 bar (winning/highlighted) and for the breadcrumb. Gemini Flash bar is muted gray — semantically correct (smaller value = smaller visual weight), but slightly confusing brand-wise (the "winner" color is the COMPETITOR's bar). Color choice serves the data, not the brand. Acceptable.
4. **Feels @armandointeligencia?** Yes — but most "generic" of the set. Could pass as any data-journalism Reels.
5. **Same-content test:** Pairs with `benchmark-dark`, `bignum-cream`. Holds together.

### 12. `benchmark-dark` — BenchmarkBars (dark)
1. **Breadcrumb:** ✅ Same `GOOGLE · FILTRACIÓN`, blue underline. Correct.
2. **Watermark:** ❌ No avatar.
3. **Accent match:** ✅ Same accent strategy as cream variant, mirrored on dark.
4. **Feels @armandointeligencia?** Yes, dark mirror.
5. **Same-content test:** Pairs with cream sibling and `diagram-dark`. Consistent.

---

## Grid-level patterns observed (from `comparison-grid-v2.jpg`)

Reading the grid left-to-right, top-to-bottom:

- **Row 1 (hero/baseline):** Four DIFFERENT breadcrumb treatments side-by-side — warm-red chip (baseline), blue chip + tracked underline overlap (tnf-blue), bare tracked underline (tnf-transitions), bare tracked underline + dark bg (tweetcard). This single row IS the brand-consistency problem in miniature.
- **Row 2 (diagram + quote):** Four consistent tracked-uppercase breadcrumbs with blue underlines. Two cream, two dark. This row is the model — every other template should match its breadcrumb canon.
- **Row 3 (bignum + benchmark):** Same as row 2 — all four use the canonical tracked breadcrumb. Strong.
- **Lower-third / caption bars:** Three different bar styles across variants — warm-red left-border bar (baseline/tnf-blue), blue left-border bar (everywhere else), dark glass bar (dark variants). The blue left-border bar is winning by count. Should be standardized.

The grid makes the drift undeniable: **rows 2-3 are brand-correct, row 1 contains the offenders.** The fix is concentrated in 2 variants (`remotion-v2-baseline` and `tnf-blue`).

---

## Cross-cutting brand findings

### Breadcrumb is the brand. Treat it as one.

The reference creators (Carlos, DIY, Bilawal) all use the breadcrumb as their non-negotiable identity anchor. We have a beautiful `BrandBreadcrumb.tsx` component — but 2 of 12 variants don't use it (baseline, partial in tnf-blue) and the rest are inconsistent in the *content* string:

| Variant | Breadcrumb text |
|---|---|
| tnf-transitions / quote-{cream,dark} | `GOOGLE I/O 2026 · FILTRACIÓN` (long form) |
| tweetcard / diagram-{cream,dark} / bignum-{cream,dark} / benchmark-{cream,dark} | `GOOGLE · FILTRACIÓN` (short form) |
| tnf-blue | `I/O 2026 · FILTRACIÓN` (orphan) + chip overlap |
| baseline | `FILTRACIÓN` (chip only, no breadcrumb) |

Three different breadcrumb strings for the same story. Pick ONE per story and pass it as a `videoBrief.breadcrumb` field, not per-template.

### Watermark is missing across the board (and that's mostly fine)

11 of 12 variants have NO `BrandWatermark`. The spec sets `watermarkDefault = { avatar, 96px, bottom-right, 0.9 opacity }` but no composition opts in. Reference creators (Carlos, DIY) ALSO don't run persistent avatar bugs — restraint is the brand. **But** we should NOT pretend the brand mark doesn't exist:

- 9x16 viewer expectation: at minimum a brand mark on the last 1-2s ("end-card") so the post is attributable when cross-posted/screenshotted.
- For wave-1 we got lucky because two variants (`tweetcard`, `quote-{cream,dark}`) bake the channel name into the composition itself.
- Recommendation: ship the watermark on an **end-card hold frame**, not persistently — see fix #2.

### Accent discipline is mostly excellent

10/12 variants land on a single Gemini blue accent (✅). The two failures (`baseline` warm-red, `tnf-blue` mixed) are pre-refactor artifacts. Once those are fixed, the channel has clean one-accent-per-video discipline matching `midu.dev`.

### Palette behavior in dark mode is correct

The cream↔dark mirroring on `{diagram, quote, bignum, benchmark}` is excellent — backgrounds flip from `#FAF7F2` to `#0F1B2D` (both in `brand.colors`), body text flips to cream, accent stays identical. This is *the* pattern. The bignum digits flipping from `#1A1A1A` (ink) to `#FAF7F2` (cream) is the right call — those are the two brand neutrals, not arbitrary contrast picks.

### Sub-brand placeholder is leaking into output

`quote-{cream,dark}` shows `AI Leadership Lab` under the attribution line. That's the placeholder sub-brand text from `brand/brands.json` (`ai-leadership-lab.name`) — it should NOT be rendered as a tagline on an @armandointeligencia-default video. Suspect the composition is reading `brand.tagline` and rendering it directly. Either suppress when brandId === default, or wire it to a real `videoBrief.subtitle` field.

---

## Top 5 brand-consistency fixes (prioritized)

| # | Fix | Where | Why |
|---|---|---|---|
| 1 | **Kill the legacy warm-red `FILTRACIÓN` chip** on `remotion-v2-baseline` and `tnf-blue`. Replace with the canonical `BrandBreadcrumb` (centered, tracked uppercase, blue underline). | `src/compositions/ExplainerVideo.tsx` (baseline) + `src/compositions/TechNewsFlash9x16.tsx` (tnf-blue mode) | Row 1 of the grid is the only brand offender. One change unifies the wave. |
| 2 | **Standardize the breadcrumb string per VIDEO_REQUEST**, not per composition. Add `videoBrief.breadcrumb = { primary, date? }` so all 12 templates render IDENTICAL `GOOGLE I/O 2026 · FILTRACIÓN` (or whichever the brief picks). | `src/pipeline/generate.ts` → composition props plumbing | Eliminates the long-form/short-form/orphan trio observed above. |
| 3 | **Add a 60-frame end-card brand stamp** (avatar-pixar 96px center, fading in from 0 opacity over 0.5s, holding for 1.5s) appended to every 9x16 composition. NOT a persistent watermark — an end-card. | New `src/components/BrandEndCard.tsx` mounted as the final scene in every 9x16 root composition | Adds attribution without violating the restraint pattern reference creators use. |
| 4 | **Fix `quote-{cream,dark}` sub-tagline leak** — gate the `AI Leadership Lab` text on `brandId !== "armando-inteligencia"` OR replace with a real `videoBrief.attribution` field. | `src/compositions/QuoteCard9x16.tsx` | Currently rendering placeholder sub-brand data on a default-brand video. |
| 5 | **Lock the breadcrumb default position to `topPx=80, fontSizePx=30`** and prohibit per-composition overrides without a brand-system reason. Add a vitest snapshot that fails if any composition mounts `BrandBreadcrumb` with custom `topPx`/`fontSizePx`. | `src/components/BrandBreadcrumb.tsx` + new snapshot test | The component already DEFAULTS to these values — but without a test, drift is one PR away. |

---

## Answers to the specific questions

**Should we add the avatar watermark to all 9x16 compositions (currently absent)?**

Not as a persistent bug — that would break the restraint-as-brand pattern shared by Carlos / DIY / Bilawal. Yes as a 1.5s end-card hold on every 9x16. The current 11-of-12 "no watermark" state leaves us un-attributable on screenshot/clip — that's the actual risk. End-card solves it without visual cost.

**Does the breadcrumb need a consistent "default" position/style across compositions? Note any drift.**

Yes, and it ALREADY HAS one in `BrandBreadcrumb.tsx` (`topPx=80, fontSizePx=30, letterSpacing=0.22em`, underline animation built in). The drift is not in the component — it's in (a) two variants that don't mount it at all (baseline, tnf-blue partial), and (b) three different breadcrumb-text strings across the 12 variants for the same story. The component is correct; the *adoption* is incomplete and the *content* is per-composition instead of per-brief. Fix #1, #2, #5 above address all three drift modes.

---

## One-sentence brand grade per variant

| # | Variant | Grade | One-liner |
|---|---|---|---|
| 1 | remotion-v2-baseline | **D** | Off-spec warm-red chip + no canonical breadcrumb + no brand mark — reads as a generic editorial reel, not @armandointeligencia. |
| 2 | tnf-blue | **C-** | Has the right breadcrumb idea but collides with the legacy chip, producing two accents in one frame. |
| 3 | tnf-transitions | **A** | Cleanest brand expression in the set — canonical breadcrumb, one-accent discipline, model for the rest. |
| 4 | tweetcard | **A-** | Strong identity via the in-tweet `@armandointeligencia` screen name; only docked for the breadcrumb-text-string drift. |
| 5 | diagram-cream | **A-** | Carloscuamatzin-grade flowchart in our blue; on-spec breadcrumb; only missing the end-card mark. |
| 6 | diagram-dark | **A-** | Picture-perfect dark mirror of cream sibling; same caveat re: end-card. |
| 7 | quote-cream | **B** | Strong attribution signal, but the `AI Leadership Lab` placeholder sub-brand leaks through. |
| 8 | quote-dark | **B** | Same as cream sibling — same leak. |
| 9 | bignum-cream | **A-** | Disciplined single-accent execution, DIY-grade hero-number layout in our voice. |
| 10 | bignum-dark | **A-** | Model light↔dark parity; on-spec. |
| 11 | benchmark-cream | **B+** | On-spec breadcrumb + accent, but the data-driven color assignment (winner = blue = competitor) slightly muddies the "blue means us" cue. |
| 12 | benchmark-dark | **B+** | Same as cream sibling. |

**Set-level grade:** **B+** — the canonical breadcrumb + cream/dark palette + single-accent discipline are working in 10 of 12 variants; the wave is held back by 2 legacy-chip offenders and 2 sub-brand leaks. Resolve the 5 fixes above and this becomes a solid A wave.
