# A2 — Color & Contrast Critique (Wave 1, 12 variants)

**Scope:** color, contrast, accent discipline ONLY. Timing, typography weight,
info density, layout: out of scope (covered in sibling A* critiques).

**Source of truth for palettes:**
- Cream — `src/brand/palettes.ts:29` — paper `#FAF7F2`, ink `#1A1A1A`, accent `#B33A2A` (warm editorial red), muted `#6B6760`.
- Dark — `src/brand/palettes.ts:40` — paper `#0A0F1A` (deep warm-navy black), ink `#F2E9D8` (warm cream), accent `#D4A04A` (warm amber/gold), muted `#7A6F5C`.
- Subject-tool override — `src/brand/tools-palette.ts:70` — `gemini` → `#4285F4` (Google blue), secondary `#9333EA`.

All 12 variants in this wave are about Gemini 3.2 Flash, so every composition
that wires `subjectTool="gemini"` should be threading `#4285F4` through the
accent slot, fully overriding the palette's `#B33A2A` (cream) or `#D4A04A`
(dark) defaults.

---

## What I'm looking for

1. **Accent discipline.** Reference creators (Carlos, DIYSmartCode) use exactly ONE accent. The micro-caption highlight color, the breadcrumb underline, the marker sweep, the icon — same hex.
2. **Subject-tool consistency.** Does Gemini-blue land everywhere or only on some elements while the cream/dark palette accent still leaks through?
3. **Contrast on a 6-inch phone in daylight.** Worst-case readability: muted-color sub-labels, accent-on-paper text, ink-on-cream small captions, cream-on-dark sub-labels.
4. **Cream ↔ dark parity.** Does each dark variant deliver the same visual punch as its cream sibling? Or does one mode look "right" while the other reads as a recoloured afterthought?
5. **Grain overlay.** Cream uses `radial-gradient(... rgba(255,255,255,0.6) ... rgba(0,0,0,0.02))` with `multiply` blend. Dark uses `radial-gradient(... rgba(212,160,74,0.12) ... rgba(0,0,0,0.40))` with `screen`. Does it actually feel like paper / cosmic night, or does it just dim the screen?
6. **Specific landmines.** White-on-white, blue-on-blue, "blue text on a 4% darker blue header" type failures.

---

## Variant-by-variant audit

### 1. `remotion-v2-baseline` — preview-t1.5s.jpg — **B+**

Single chip in top-left: `FILTRACIÓN` on `#B33A2A` warm-red. Caption pill at
bottom: ink-black "Filtraron Gemini tres punto" with red `dos` highlight and
muted-grey `Flash` trailing. Cream paper.

- **Accent discipline:** clean. ONE color (`#B33A2A`) on chip and caption highlight. This is the cleanest example in the wave.
- **Subject-tool consistency:** N/A — this variant intentionally does NOT use the Gemini-blue override. It's the channel-default editorial red. As a baseline it works, but it is the only variant in the lineup that does not carry the Gemini blue thread, which is a discontinuity inside the grid.
- **Contrast:** strong. Ink `#1A1A1A` on `#FAF7F2` is ~16:1. The warm red on cream is ~5:1, fine for chip text. White-on-red chip is ~5:1, just over WCAG AA Large.
- **Grain:** very subtle ellipse, barely visible at this preview. That's fine — the paper feels paper-like without distraction.
- **Concerns:** muted-grey `Flash` trailing word risks falling below 4.5:1. At ~`#6B6760` on `#FAF7F2` the contrast is ~5.1:1, just safe. Not a blocker.

### 2. `tnf-blue` — preview-t1s.jpg — **C**

Top breadcrumb shows `FILTRACIÓN` chip with a `#4285F4` blue background AND, immediately to its right, `I/O 2026 · FILTRACIÓN` breadcrumb text also in blue with a blue underline. Caption pill at bottom highlights `dos` in blue.

- **Accent discipline:** the breadcrumb area is doubled up — there is BOTH a solid blue chip AND a blue text breadcrumb on the same row. They overlap visually (the chip clips the breadcrumb). This reads as two competing accent treatments stacked. Pick one: chip OR text-breadcrumb, not both.
- **Subject-tool consistency:** blue is consistently applied (chip, breadcrumb text, breadcrumb underline, caption highlight) — good. But the visual collision in the top-left undermines the gain.
- **Contrast:** White-on-`#4285F4` chip text ≈ 3.7:1 — that's BELOW WCAG AA for normal body text and right at the boundary for large text. The blue breadcrumb text on cream is ~3.4:1 — same problem. On a small phone screen in sunlight this will hurt.
- **Grain:** invisible at this preview, neutral.
- **Concerns:** the white chip text on `#4285F4` is the weakest contrast pair in the entire wave. Google's own brand guidance does not put white text on `#4285F4` for small UI text — they use `#1A73E8` (a darker blue) for that. We should darken the on-paper blue, OR thicken the chip text, OR use the secondary `#9333EA` purple just for the breadcrumb so the blue is reserved for one role only.

### 3. `tnf-transitions` — preview-t10.5s.jpg + preview-t6.85s-crossfade.jpg — **B**

Same template as #2 but with the conflicting chip removed (only the text breadcrumb remains at top). Center: ink-black `15× MÁS BARATO`. Caption pill highlights `semana.` in blue.

- **Accent discipline:** much better than tnf-blue — single blue role (breadcrumb + caption highlight). The crossfade frame shows muted-grey ghost text (`GEMINI 3.2 FLASH`) which is the previous scene fading out; that's a transition artifact, not a palette decision.
- **Subject-tool consistency:** blue appears in breadcrumb and caption only. Hero text stays ink-black. Reads as a deliberate single-accent treatment. Good.
- **Contrast:** the breadcrumb text `GOOGLE I/O 2026 · FILTRACIÓN` is `#4285F4` on `#FAF7F2` at small caps size — same ~3.4:1 problem as #2 but smaller, so it actually hurts MORE here, not less.
- **Crossfade frame concern:** during crossfade, the ghosted muted-grey title can momentarily land inside the muted/`#6B6760` zone, sliding the page into 2.5:1 territory mid-transition. Acceptable if it's <300ms, but noticeable.
- **Grain:** neutral.

### 4. `tweetcard` — preview-t2s.jpg — **A-**

Dark paper (`#0A0F1A`). Top breadcrumb `GOOGLE · FILTRACIÓN` in blue. Center: white tweet card with verified-blue checkmark, black ink body, muted handle. Bottom caption pill on dark.

- **Accent discipline:** blue is the single accent — breadcrumb, underline, verified-check. The tweet card's white box is correctly treated as a "screenshot" surface, not an accent. ONE accent color, used precisely. This is the most disciplined of the dark variants.
- **Subject-tool consistency:** Gemini blue lands in three places and only those three. Excellent.
- **Contrast:** cream-text caption (`dos días antes...`) is white-on-dark, easily 12:1+. Blue breadcrumb on dark paper is ~5.5:1, comfortably AA. White tweet card is high contrast vs dark backdrop, which is exactly the "screenshot in a black void" feeling we want.
- **Grain:** the diagonal hatching is visible and adds the "moody social" quality without distracting from the tweet. Good.
- **Concerns:** verified-check blue (`#1D9BF0`-ish Twitter brand) is very close to but NOT identical to our subject-tool `#4285F4`. Two different blues within 12px of each other. Most viewers won't notice but a designer's eye will. Consider letting the verified-check inherit `resolvedAccent` so both blues unify, OR keep the Twitter blue intentional (it IS a tweet) and lean into the distinction by spacing them apart.

### 5. `diagram-cream` — preview-t25s.jpg — **B-**

Cream paper, three diagram boxes with blue borders, blue arrows between, blue "EL LEAK" header, blue monospace sub-labels (`5 mayo · builds iOS`, `$0.25 / $2.00 / 1M tokens`, `<200ms latencia`), blue caption-pill highlight on `Latencia:`.

- **Accent discipline:** ONE color, applied everywhere. Could be read as "perfect discipline" OR as "saturated to the point of bloating." I lean negative: the muted sub-labels under each diagram node should NOT be the same accent blue as the borders and arrows — they should be `muted` (`#6B6760`) so the node titles read as primary and the sub-labels recede. Right now everything fights for the same eye-level.
- **Subject-tool consistency:** absolutely consistent — too consistent.
- **Contrast:** the monospace blue sub-labels on cream are at ~3.2-3.4:1 — fails AA for small text. The node titles (`Filtraron Gemini 3.2 Flash`, `15× más barato`, `92% rendimiento GPT-5.5`) are ink-black on white-inside-cream — ~17:1, fine. Box borders are ~1px blue on cream — visually fine for borders but the whole assembly skews "blueprint diagram" rather than "editorial."
- **Cream/dark parity:** see #6.
- **Grain:** neutral on cream.
- **Concerns:** the white inner box on cream paper creates a faint nested-card effect — `#FFFFFF` on `#FAF7F2` is a 2-3% lightness step that reads as ghostly. Either drop the white inner fill (let it be cream) or push it to a stronger paper-vs-card contrast.

### 6. `diagram-dark` — preview-t25s.jpg — **B+**

Same diagram, dark paper. Boxes are deep navy (very close to `paper` itself), blue borders glow against the void, cream `#F2E9D8` titles, blue mono sub-labels.

- **Accent discipline:** same as #5 — single accent everywhere.
- **Subject-tool consistency:** consistent.
- **Contrast:** much better than the cream sibling. Cream-on-dark titles are ~12:1. Blue sub-labels on near-black boxes are ~5.5:1 — passes AA. The blue border glow with the `accentShadow` (`rgba(212,160,74,0.25)` — wait, this is the AMBER shadow from `DARK_PALETTE.accentShadow`, not a blue shadow) reads as a warm halo around blue borders. That's a sneaky bug: when `subjectTool` overrides the accent to blue, `accentShadow` is NOT recomputed; the shadow stays amber. The result here looks like a warm halo around cold-blue boxes, which is actually pretty (cosmic), but it's accidentally pretty — it would break in a brand where the warm-amber halo is jarring against a cold accent. **Cite:** `src/brand/palettes.ts:46` (`accentShadow: "rgba(212, 160, 74, 0.25)"`) is not propagated through the subject-tool override.
- **Cream/dark parity:** the dark version reads BETTER than cream. The cream variant feels like a blueprint print-out; the dark variant feels editorial. That's a parity failure — they should both feel editorial.
- **Grain:** `screen`-blended amber radial actually warms the top of the frame nicely. Reads cosmic-editorial, on brand.

### 7. `quote-cream` — preview-t8s.jpg — **B**

Cream paper, serif italic ink quote, blue `ARMANDO INTELIGENCIA` attribution, muted "AI Leadership Lab" sub-attribution, light-blue oversized quote glyphs, blue underline-mark between quote and attribution.

- **Accent discipline:** blue threads through quote-marks (light tint), underline, attribution. Three sub-roles, one hue — disciplined.
- **Subject-tool consistency:** good — every accent slot is blue.
- **Contrast:** the GIANT decorative quote glyphs are at very low-opacity blue (`~rgba(66,133,244,0.25)`-ish from the look) which is correct (they're decoration, not text). Attribution `ARMANDO INTELIGENCIA` at small caps blue on cream is ~3.4:1 — same recurring sub-AA issue as the other cream variants. The italic ink quote body is high contrast.
- **Cream/dark parity:** see #8.
- **Grain:** invisible.
- **Concerns:** sub-attribution `AI Leadership Lab` in `#6B6760` on cream is barely there — feels apologetic. Either commit to the byline or drop it.

### 8. `quote-dark` — preview-t8s.jpg — **A-**

Same layout on dark. Cream-italic quote, blue attribution, low-alpha blue quote glyphs.

- **Accent discipline:** same single-blue treatment, works better against dark.
- **Subject-tool consistency:** identical to cream sibling, threading is clean.
- **Contrast:** cream `#F2E9D8` italic body on `#0A0F1A` is ~14:1, gorgeous. Blue attribution on dark is ~5.5:1, passes AA. Sub-attribution `AI Leadership Lab` in `#7A6F5C` muted-warm-grey on dark is ~3.8:1 — at small body size it's marginal but acceptable.
- **Cream/dark parity:** dark wins decisively again. The serif italic on near-black reads "Bloomberg Businessweek night edition." The cream version reads "law firm pamphlet." This is a strong signal that the cream palette needs work, not that dark is over-tuned.
- **Grain:** the `screen` amber radial sits behind the quote glyphs and adds a candle-glow at the top of the frame. Pretty.

### 9. `bignum-cream` — preview-t1.5s.jpg — **C+**

Cream paper, blue `GEMINI 3.2 FLASH` micro-eyebrow, ink-black huge `15` and `×` symbol where the `×` is fully blue, ink `más barato que GPT-5.5`, muted `$0.25 / $2.00 por millón de tokens`, ink caption pill highlighting `dos` in blue.

- **Accent discipline:** blue lives in three roles — eyebrow text, the `×` glyph, and the caption highlight. The big oversized `×` rendered in solid blue is the BOLDEST single use of accent in the whole wave, and it works — your eye lands there and reads "15× something."
- **Subject-tool consistency:** clean — only the eyebrow, the multiplication symbol, and the caption highlight are blue. Everything else stays neutral.
- **Contrast:** eyebrow blue on cream is the same ~3.4:1 problem. The huge `×` in `#4285F4` on `#FAF7F2` is at gigantic size, so contrast is non-issue. Sub-caption muted on cream is ~5:1, safe.
- **Cream/dark parity:** see #10.
- **Concerns:** the blue `×` next to ink-black `15` creates a "two competing blacks" moment because `#4285F4` is dark enough at small sizes to read as a deep grey. At THIS size it's fine, but if the same composition was used with a smaller hero number the `×` would look like a typo. Also: the ink `15` and blue `×` have the same x-height visually but completely different optical weight — the blue swallows light and visually shrinks 10%. Consider making the `×` ~110% the size of the number when accent-coloured.

### 10. `bignum-dark` — preview-t1.5s.jpg — **B**

Same composition on dark. Cream `15`, blue `×`, blue eyebrow, cream sub-label, blue caption highlight.

- **Accent discipline:** identical clean treatment.
- **Subject-tool consistency:** clean.
- **Contrast:** cream `15` on dark is huge and ~14:1. Blue `×` on dark is ~5.5:1, fine. The blue eyebrow `GEMINI 3.2 FLASH` is small-caps blue on dark, ~5.5:1 — passes AA. Sub-caption `$0.25 / $2.00 por millón de tokens` is muted `#7A6F5C` on dark and reads as "barely there" (~3.8:1 at small size, marginal). It's almost invisible at preview scale — on a phone it will vanish.
- **Cream/dark parity:** roughly even — the cream version is slightly punchier here because the ink-black `15` is heavier than the cream `15`. Closest parity in the wave.
- **Concerns:** muted sub-label is too dim on dark.

### 11. `benchmark-cream` — preview-t3s.jpg — **D+**

Cream paper, ink-black title `Precio por millón de tokens (entrada)`, two horizontal bars: Gemini 3.2 Flash row with a TINY blue bar segment ($0.25) inside a much longer light-grey bar; GPT-5.5 row with a giant blue bar containing white-on-blue $3.75. Muted footer caption, ink caption pill highlighting `Y` in blue.

- **Accent discipline:** the SAME blue is used for (a) Gemini's tiny bar, (b) GPT-5.5's giant bar, and (c) the caption highlight. **This is the single biggest color-discipline failure in the wave.** Blue is supposed to represent "the subject we are tracking" (Gemini). Here, GPT-5.5 — the COMPETITOR being beaten — is rendered in the dominant Gemini-blue color while Gemini itself is a thin blue sliver. The visual reads "GPT-5.5 wins by a lot" even though the text says the opposite. The semantic mapping of accent is inverted.
- **Subject-tool consistency:** technically every blue IS Gemini's `#4285F4`, but applied to BOTH brands. The override needs to be aware that in a comparison chart, only the SUBJECT bar should get the accent — the comparator should be neutral (ink, or muted).
- **Contrast:** white `$3.75` on `#4285F4` ≈ 3.7:1, same sub-AA failure as the tnf-blue chip. The `$0.25` in dark text on light-grey is fine. Title and row labels in ink on cream are great.
- **Bar fill source:** `src/compositions/BenchmarkBars9x16.tsx:144` — `fillColor = bar.color && bar.color.length > 0 ? bar.color : accentColor`. Bars accept per-bar overrides but in this variant both bars are falling back to the resolved accent. Fix at the data layer: in the template JSON, set the Gemini bar to `accentColor` and the GPT-5.5 bar to `mutedColor` (or `inkColor`-at-low-opacity). Don't let both bars share the accent.
- **Grain:** neutral.
- **Verdict:** the semantic palette inversion is the most damaging single color choice in the wave. Either swap fills (GPT-5.5 muted, Gemini blue) or invert size emphasis.

### 12. `benchmark-dark` — preview-t3s.jpg — **D**

Same composition on dark. Cream title, tiny dark-empty bar for Gemini (with a blue-fill sliver showing `$0.25`), giant blue bar for GPT-5.5 (`$3.75` in DARK ink on blue), muted footer caption.

- **Accent discipline:** same inverted-semantic failure as #11.
- **Subject-tool consistency:** same.
- **Contrast:** dark-ink `$3.75` on `#4285F4` is ~5:1 — better than the white-on-blue cream version, actually passes AA. So the dark variant's text is more readable on its accent fill than the cream variant's is. That's an accident of `onAccent: "#0A0F1A"` being preserved. The Gemini-row text `$0.25` in cream on a near-dark background is fine.
- **Cream/dark parity:** dark has better in-bar text contrast, cream has better background-vs-bar contrast. Neither is right.
- **Grain:** screen-amber radial behind, neutral.
- **Concerns:** same as #11, the semantic inversion is the dominant problem. Dark mode just hides it slightly better because the dark Gemini-row background blends with the paper, drawing less attention to the "loser" track.

---

## Cross-cutting findings

### Accent discipline scoreboard

| Variant | Roles of blue | Verdict |
|---|---|---|
| remotion-v2-baseline | chip + caption highlight (RED) | Single accent, ONE role-class. |
| tnf-blue | chip + breadcrumb text + breadcrumb underline + caption | Stacking — chip and breadcrumb collide. |
| tnf-transitions | breadcrumb + underline + caption | Single accent, distributed clean. |
| tweetcard | breadcrumb + underline + verified-check | Clean, but verified-check uses Twitter blue, not Gemini blue. |
| diagram-cream | borders + arrows + header + sub-labels + caption | Over-applied — sub-labels should be muted. |
| diagram-dark | same | Same over-application, but reads better on dark. |
| quote-cream | quote-glyphs + underline + attribution + caption | Disciplined three-role use. |
| quote-dark | same | Disciplined; the strongest cream/dark twin. |
| bignum-cream | eyebrow + ×-glyph + caption | Bold and focused. |
| bignum-dark | same | Same. |
| benchmark-cream | both bars + caption | Semantic inversion failure. |
| benchmark-dark | same | Same. |

### Cream-vs-dark parity report

- **quote**: dark > cream by a wide margin. The cream serif italic feels institutional, the dark feels editorial.
- **diagram**: dark > cream. Cream reads "blueprint print-out" — the white-inside-cream nested boxes are the problem.
- **bignum**: closest to parity. Cream's ink-black `15` carries slightly more punch than cream's `15`, but both work.
- **benchmark**: both broken in the same way (semantic accent inversion); dark accidentally less offensive because the loser-row recedes into paper.

The pattern: **the cream palette consistently under-delivers** relative to dark in this wave. Two suspects:
1. The accent `#B33A2A` is bypassed by the Gemini override, so cream loses its warm-editorial character (the very thing the cream palette exists for) and becomes "white paper + Google blue diagram," which is not editorial — it's documentation.
2. The grain overlay on cream (`multiply` with white-radial) is so subtle it does nothing. The dark `screen`-blend amber radial is doing real visual work.

### Grain overlay

- Cream `multiply` + `rgba(255,255,255,0.6) → rgba(0,0,0,0.02)` — invisible at preview scale. Pointless. Either crank it (try `rgba(0,0,0,0.06)` at edges + a paper-grain noise PNG at 2-3% opacity) or remove it for honesty.
- Dark `screen` + `rgba(212,160,74,0.12) → rgba(0,0,0,0.40)` — visible, works, adds the warm halo. Keep.

### The `accentShadow` propagation bug

When `subjectTool` overrides `accent`, the accompanying `accentShadow` is NOT recomputed. See `src/compositions/BenchmarkBars9x16.tsx:270` — `resolvedAccent` is computed from the override, but downstream consumers of `colors.accentShadow` still pull the palette's amber/red shadow. In `diagram-dark` this lands as a warm-amber halo around cold-blue boxes (accidentally pretty); in a future tool override with a saturated cool color it could produce ugly muddy halos. The override needs to derive `accentShadow` from the resolved accent at the same alpha (e.g. `rgba(66,133,244,0.25)` when override is `#4285F4`).

### Specific contrast hot-spots (small-phone-screen risk)

| Where | Pair | Approx ratio | Status |
|---|---|---|---|
| tnf-blue chip white text | white on `#4285F4` | 3.7:1 | Fails AA for normal body, marginal for large. |
| Blue breadcrumb text on cream | `#4285F4` on `#FAF7F2` | 3.4:1 | Fails AA for normal, marginal for large caps. |
| Diagram-cream blue mono sub-labels | `#4285F4` on white-on-cream | 3.2:1 | Fails AA. |
| Quote-cream `ARMANDO INTELIGENCIA` blue caps | `#4285F4` on cream | 3.4:1 | Fails AA, large caps. |
| Bignum-cream blue eyebrow | `#4285F4` on cream | 3.4:1 | Fails AA. |
| Benchmark-cream `$3.75` white on blue | white on `#4285F4` | 3.7:1 | Fails AA. |
| Bignum-dark sub-caption | `#7A6F5C` on `#0A0F1A` | 3.8:1 | Marginal at small size. |

**Pattern:** every single cream-paper variant uses Gemini's `#4285F4` for small text. That hex is too light on `#FAF7F2`. The Gemini brand has a darker on-light variant (`#1A73E8` or `#1967D2`) precisely because Google itself does not put `#4285F4` on white for small text.

---

## Top 5 color changes (prioritized by impact)

1. **Fix benchmark semantic inversion** (`src/compositions/BenchmarkBars9x16.tsx:144` + the two `benchmark-*` templates under `templates/`). The subject bar (Gemini) should get the accent. The comparator (GPT-5.5) should be neutral — either `mutedColor` at ~0.4 alpha or `inkColor` at low alpha. Currently both bars share `accentColor`, which inverts the story.
2. **Add a "dark variant" of the Gemini accent for use on cream paper.** In `src/brand/tools-palette.ts:70`, the `gemini` entry should expose both `accent: "#4285F4"` (current, for dark paper) AND `accentOnLight: "#1A73E8"` (Google's own on-light variant). The composition layer picks based on `palette === "cream" ? accentOnLight : accent`. This single change fixes 5 of the 7 hot-spots above.
3. **Propagate `accentShadow` through `subjectTool` override** (`src/brand/palettes.ts:46` and the resolver in each composition, e.g. `src/compositions/BenchmarkBars9x16.tsx:270`). Derive shadow from the resolved accent at 0.25 alpha, don't pull it from the palette after override.
4. **Demote diagram sub-labels from accent-blue to muted** (`src/compositions/DiagramExplainer9x16.tsx` — the mono sub-label color slot). Sub-labels are recede-information; they should be `mutedColor`, not `resolvedAccent`. This single change makes diagram-cream feel editorial instead of "blueprint."
5. **Strengthen cream-paper grain or remove it** (`src/brand/palettes.ts:36-38`). The current `rgba(255,255,255,0.6) → rgba(0,0,0,0.02)` is invisible. Either crank the edge darkness to ~`rgba(0,0,0,0.08)` for a real vignette + add a 2-3% noise layer, or delete the overlay so cream paper is honestly flat.

---

## One-sentence color verdict per variant

| Variant | Grade | One-line |
|---|---|---|
| remotion-v2-baseline | **B+** | The cleanest single-accent treatment, but it's the only variant that does NOT carry the Gemini-blue thread — disconnects from the rest of the lineup. |
| tnf-blue | **C** | Blue chip + blue breadcrumb collide in the top-left and the white-on-`#4285F4` chip text fails AA. |
| tnf-transitions | **B** | Single-accent treatment lands, but the small-caps blue breadcrumb on cream is still ~3.4:1. |
| tweetcard | **A-** | The most disciplined dark variant in the wave; only nit is the verified-check Twitter-blue sitting next to a slightly different Gemini-blue. |
| diagram-cream | **B-** | Single-accent discipline taken too far — sub-labels and arrows in the same blue make the whole thing read as a blueprint, not editorial. |
| diagram-dark | **B+** | Same blueprint problem on dark, but the warm-amber `accentShadow` accidentally halos the blue boxes and makes it look cosmic. |
| quote-cream | **B** | Threaded clean, but the small-caps blue attribution flunks AA and the sub-attribution muted-grey is apologetic. |
| quote-dark | **A-** | Strongest cream-vs-dark parity winner; cream-italic on near-black is the wave's most editorial frame. |
| bignum-cream | **C+** | Bold use of blue `×` works visually but the eyebrow and caption blue are sub-AA on cream. |
| bignum-dark | **B** | Closest twin to its cream sibling; muted sub-caption barely readable on dark. |
| benchmark-cream | **D+** | Semantic inversion — GPT-5.5 (the loser) is rendered in dominant Gemini-blue while Gemini itself is a thin sliver; story is upside-down. |
| benchmark-dark | **D** | Same inversion; only saved from worse grade by accidental in-bar dark-text contrast. |

---

## Is the Gemini-blue subject-tool override well-tuned?

**No — it needs adjustment on cream, and the propagation is incomplete on both.**

Specific feedback on `#4285F4` (`src/brand/tools-palette.ts:70`):

1. **`#4285F4` is calibrated for use on dark or saturated backgrounds, not on `#FAF7F2` cream paper.** Google's own brand system uses `#4285F4` on dark surfaces and switches to `#1A73E8` (sometimes `#1967D2`) on light surfaces precisely because `#4285F4` has insufficient contrast on white/cream at typography sizes below ~24px. We are hitting that exact problem in 5 of the 6 cream variants. **Fix:** expose `accent` AND `accentOnLight` on the tool palette and let the composition pick based on `palette === "cream"`.

2. **The override only replaces `accent`, not the rest of the accent system.** `accentShadow` (`src/brand/palettes.ts:46`) and `onAccent` (`src/brand/palettes.ts:45`) are NOT recomputed. For the dark palette, `onAccent` is `#0A0F1A` (dark ink intended for amber/gold CTAs). That's coincidentally fine on `#4285F4` (~5:1) but it's coincidence, not design. For the cream palette, `onAccent` is `#FFFFFF` (white) intended for the warm-red CTA. White on `#4285F4` is ~3.7:1 and fails AA — and we see this exact failure in `tnf-blue` and `benchmark-cream`. **Fix:** when overriding `accent`, also derive `onAccent` as "whichever of white/dark-ink has higher contrast with the new accent" (a small `pickOnAccent(accent)` helper).

3. **The semantic role of the accent in comparison charts is undefined.** `BenchmarkBars9x16` lets the resolved accent fall through to ALL bars, which means in a Gemini-vs-GPT comparison both bars become Gemini-blue. The override needs awareness of "this accent represents the SUBJECT, not a generic highlight." Either: (a) bars must opt-in to the accent via explicit `bar.color`, with the default being `muted`, OR (b) the first bar inherits accent and subsequent bars default to muted, OR (c) the template author explicitly tags which bar is "the subject."

4. **Secondary `#9333EA` (Gemini purple) is defined but unused.** `src/brand/tools-palette.ts:71` — `secondary: "#9333EA"`. None of the 12 variants pull this. There are at least two roles where it would help: the breadcrumb (so blue stays reserved for one role per composition) and the diagram arrows (so the box borders can be blue while arrows are purple, separating "container" from "connection" semantically).

**Bottom line:** the choice of `#4285F4` is correct as the Gemini-tool-accent identifier. The problem is that it's being applied as a single hex across two palettes with very different contrast requirements, and the supporting colors (`onAccent`, `accentShadow`) aren't being recomputed when the override fires. Two-line fix in the resolver gets us most of the way.
