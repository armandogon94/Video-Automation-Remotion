# A3 — Typography Critique (W21 Wave 1, 12 variants)

Audit scope: **typography only**. Timing, color theory, and information density are out of scope and addressed in sibling critiques.

Sources audited:
- 12 preview JPGs under `output/2026-05-18-gemini-3-2-flash-leak/{remotion-v2-baseline, tnf-blue, tnf-transitions, tweetcard, diagram-cream, diagram-dark, quote-cream, quote-dark, bignum-cream, bignum-dark, benchmark-cream, benchmark-dark}/preview-*.jpg`
- `output/2026-05-18-gemini-3-2-flash-leak/comparison-grid-v2.jpg`
- All composition TSX listed in the brief.

Project-wide type system (from `src/brand/fonts.ts` and inline `fontFamily` declarations):
- **Inter** (Google Fonts, weights 300/400/500/600/700/800 loaded; weight 900 is *used* by `BigNumberHero9x16` and the Diagram node-title at 800 — see Cross-template §1).
- **Georgia, 'Times New Roman', serif** — only used by `QuoteCard9x16` (body + decorative glyphs).
- **'JetBrains Mono', 'IBM Plex Mono', 'Menlo', ui-monospace, monospace** — `DiagramExplainer9x16` node sublabels only.
- **ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace** — `TweetCardHero9x16` engagement metrics row only.

---

## Per-template critique

### 1. `remotion-v2-baseline` (TechNewsFlash, hero = HugeScene "GEMINI 3.2 FLASH")

Files: `src/compositions/scenes/HugeScene.tsx`, `src/compositions/scenes/ChipScene.tsx`, `src/components/captions/EditorialCaption.tsx`.

1. **Font stack:** Inter throughout. Chip = Inter 800; hero = Inter 800; caption = Inter 700.
2. **Weight + size:** Hero at **132px / 800** (`HugeScene.tsx:53–55`) dominates as intended. Chip at **34px / 800** is *too heavy* relative to its 10×24 padding — the chip text feels packed corner-to-corner. Caption at **48px / 700** is correctly subordinate.
3. **Letter-spacing:** Hero `-0.025em` (`HugeScene.tsx:55`) is aggressive but correct for an 132px display setting; numerals "3.2" tighten cleanly. Chip `0.18em` (`ChipScene.tsx:47`) is disciplined. Caption `-0.005em` (`EditorialCaption.tsx:147`) is appropriate for 48px body.
4. **Line-height:** Hero 1.02 (`HugeScene.tsx:54`) is tight — works because "GEMINI 3.2 / FLASH" is two short lines, but any 3-line headline would feel claustrophobic. Caption 1.15 is healthy.
5. **Tracking-spaced uppercase:** Chip `FILTRACIÓN` at 0.18em is well-set; the `Ó` accent prints cleanly above the cap-height because Inter's diacritics extend correctly.
6. **Spanish accents:** Clean. `FILTRACIÓN` `Ó` is properly stacked.
7. **At-distance legibility:** Excellent. Hero readable from any thumbnail size.

**Grade: A−** — only issue is the chip's internal padding being too tight for an 800-weight 34px label.

---

### 2. `tnf-blue` (TNF + blue palette, hero = HugeScene + BrandBreadcrumb visible)

Files: same as above + `src/components/BrandBreadcrumb.tsx`.

1. **Font stack:** All Inter.
2. **Weight + size:** Breadcrumb at **30px / 700, 0.22em tracking** (`BrandBreadcrumb.tsx:89–91`) is well-judged. Hero 132/800 unchanged.
3. **Letter-spacing:** Breadcrumb `0.22em` is tight enough not to feel like a barcode, loose enough to read as "kicker". Good.
4. **Line-height:** Breadcrumb is single-line; no wrap risk for short text but `whiteSpace: "nowrap"` (`BrandBreadcrumb.tsx:93`) means a long string can clip off the right edge — **the visible image shows exactly this**: the chip "FILTRACIÓN" partially overlaps the breadcrumb "I/O 2026 · FILTRACIÓN" because both occupy the same y-band (top:60 chip vs topPx:80 breadcrumb).
5. **Tracking-spaced uppercase:** Disciplined.
6. **Spanish accents:** `FILTRACIÓN` × 2 renders clean.
7. **At-distance legibility:** Strong, with the caveat above.

**Grade: B** — the chip-on-top-of-breadcrumb collision is a typography/layout issue, not just a positioning one (no vertical guard rail enforced).

---

### 3. `tnf-transitions` (same as tnf-blue, with TransitionSeries hero crossfades)

Visually identical typography to `tnf-blue`. The breadcrumb at frame t=10.5s now reads "GOOGLE I/O 2026 · FILTRACIÓN" cleanly (no chip overlap), confirming the collision is template-state-dependent, not template-fundamental.

**Grade: B+** — same template, the second preview happens to land at a clean moment.

---

### 4. `tweetcard` (`TweetCardHero9x16`)

Files: `src/compositions/TweetCardHero9x16.tsx`.

1. **Font stack:** Inter for everything visible on the card (name, handle, body, timestamp). Engagement row uses **ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas** at 22px (`TweetCardHero9x16.tsx:132–134`). Two type-families on one card is editorially defensible (Twitter does this) but the mono is so small here it barely registers.
2. **Weight + size hierarchy:** Name **30/700**, handle **24/400**, body **46/500** (`TweetCardHero9x16.tsx:286–289`), timestamp **22/400**. The body at weight 500 is the right choice — 700 would compete with the name and feel screamy.
3. **Letter-spacing:** Body `-0.01em` (`TweetCardHero9x16.tsx:291`) is appropriate. Name has no explicit tracking (defaults to 0) — fine at 30/700.
4. **Line-height:** Body 1.25 (`TweetCardHero9x16.tsx:289`) — comfortable for a 5-line tweet. Name 1.1, handle 1.2 — both correct.
5. **Tracking-spaced uppercase:** Breadcrumb is the only uppercase element on this composition; disciplined.
6. **Spanish accents:** `cálculo`, `están` render clean in the body. No clipping.
7. **At-distance legibility:** Body **dominates** the frame — exactly the tweet-as-headline thesis. Engagement-row mono at 22px is unreadable on a phone in dim light, but it's decorative.

**Grade: A** — strongest typography of the set. The Twitter-mimic constraint *forces* sane decisions (body weight 500, large body size, tight line-height) that the other templates would benefit from copying.

---

### 5. `diagram-cream` (`DiagramExplainer9x16` + cream palette)

Files: `src/compositions/DiagramExplainer9x16.tsx`.

1. **Font stack:** Inter for node titles + section label; JetBrains Mono / IBM Plex Mono / Menlo fallback chain for sublabels (`DiagramExplainer9x16.tsx:116–117`).
2. **Weight + size:** Node title **58/800** (`DiagramExplainer9x16.tsx:103–105`). Sublabel **30px** mono. Section label "EL LEAK" **38/700, 0.22em** (`:213`).
3. **Letter-spacing:** Title `-0.015em` is appropriate for 58/800. Sublabel `0.02em` (mono, `:121`) is a touch loose; mono fonts already feel airy and 0.02em pushes them toward "Terminal" rather than "code annotation". Try 0em.
4. **Line-height:** Title 1.05 (`:106`) — tight, but the titles are single-line so it's fine.
5. **Tracking-spaced uppercase:** "EL LEAK" at 0.22em is disciplined and reads as the editorial section break it's meant to be.
6. **Spanish accents:** None in node titles in this preview. `FILTRACIÓN` in breadcrumb is clean.
7. **At-distance legibility:** Node titles at 58/800 read clearly. Sublabel mono at 30px in accent-blue at opacity 0.75 (`:120`) is borderline on the cream — see A2 color critique; from a *type* perspective, the size/weight combo holds.

**Grade: A−**

---

### 6. `diagram-dark` (same composition, dark palette)

Identical type stack. **One real typography concern**: the node title is now **cream-colored (`#F5EFE4`-ish) on a deep navy card**. The title text in the preview ("Filtraron Gemini 3.2 Flash", "15× más barato", "92% rendimiento GPT-5.5") shows visible aliasing/blurring on the smaller letters — likely a thin-stroke render artifact where Inter 800 on dark gets a fuzzy halo because the resolved ink color is cream, not pure white, *and* the card has a subtle box-shadow tinted gold. The numerals are clean (`tabular-nums` is implicit at this weight); diacritics on "más" `á` render OK.

**Grade: B+** — the dark-palette ink choice is undermining what should be the same A− as cream.

---

### 7. `quote-cream` (`QuoteCard9x16` + cream)

Files: `src/compositions/QuoteCard9x16.tsx`.

1. **Font stack:** **Georgia, 'Times New Roman', serif** for body + glyphs (`:69, :111`). Inter for author + role (`:206, :220`). **The only template that pairs serif + sans.**
2. **Weight + size:** Body **70px / 400 italic** (`:113–115`). Decorative open/close glyph **240px / 400** at opacity 0.35 (`:42–43, :73`). Author **34/700, 0.18em** uppercase. Role **24/500, 0.02em**.
3. **Letter-spacing:** Body `-0.005em` (`:120`) is the right call — Georgia at 70px italic does not need to be tightened further; this hairline tightening just snaps the rivers shut. Author 0.18em uppercase is disciplined.
4. **Line-height:** Body 1.18 (`:115`) — Georgia italic at 70px wants 1.20–1.25 for full breathing room; 1.18 is *almost* there but the descenders on `g`, `p` in "Gemini", "Google" feel a touch close to the next line's ascenders. Bump to 1.22.
5. **Tracking-spaced uppercase:** "ARMANDO INTELIGENCIA" at 34/700/0.18em is well-set. Compare to the Diagram section-label at 0.22em — the author block uses 0.18em deliberately for a denser editorial feel; this is consistent with the system.
6. **Spanish accents:** **Strongest test in the set** — `días`, `números` both render perfectly in Georgia italic; the í-acute and ú-acute hit the right baseline and don't collide with the line above.
7. **At-distance legibility:** Georgia italic at 70px reads from 6+ feet on a phone. The 240px decorative glyphs at 0.35 opacity register as a graphic element rather than text, which is correct.

**Grade: A** — by far the most editorial composition. The serif+sans pairing works.

---

### 8. `quote-dark` (same composition, dark palette)

Same stack. Body color is cream-on-near-black; **the same dark-palette rendering softness visible in diagram-dark also affects this**: the italic strokes look slightly anti-aliased into a gentle blur. Less offensive here because italic serif is *expected* to feel a little softer, but it's still suboptimal. Decorative glyphs lose presence on dark (accent navy on near-black is low contrast — color critique, not type).

**Grade: B+** — type structure is identical to cream's A; the dark-palette ink choice is the demerit.

---

### 9. `bignum-cream` (`BigNumberHero9x16` + cream)

Files: `src/compositions/BigNumberHero9x16.tsx`.

1. **Font stack:** Inter for everything (kicker, prefix, figure, suffix, subtitle, caption).
2. **Weight + size:** Kicker **34/700, 0.20em** uppercase (`:262–266`). Figure **420/900** (`:43, :313`). Suffix at 70% of figure size = **~294/900** in accent. Subtitle **62/600** (`:355–357`). Caption **32/500, 0.01em** (`:374–377`).
3. **Letter-spacing:** Figure `-0.04em` (`:316`) is aggressively tight — required at 420px (anything looser starts to feel like a sign at a car dealership). Subtitle `-0.015em` is correct. Kicker 0.20em is disciplined.
4. **Line-height:** Figure 0.92 (`:317`) — tight is right for a single-line stat. Subtitle 1.1, caption 1.2 — correct.
5. **Tracking-spaced uppercase:** Kicker "GEMINI 3.2 FLASH" at 34/700/0.20em is set well.
6. **Spanish accents:** `más`, `millón` in subtitle/caption render clean; `á` and `ó` don't collide.
7. **At-distance legibility:** **The whole template is built for distance.** A 420px figure dominates the canvas. Inter 900 numerals with `fontVariantNumeric: "tabular-nums"` (`:322`) keep "15", "23", "100" all looking the same width — important for any version that uses count-up animation.

**Grade: A** — best size hierarchy in the system. The 420 → 62 → 32 ratio is editorial perfection.

---

### 10. `bignum-dark` (same, dark palette)

Same stack. Cream-on-near-black for the "15" figure shows the same gentle softness as diagram-dark and quote-dark. At 420px the effect is minimal — the strokes are so massive that any anti-aliasing artifact disappears into the form. Subtitle at 62/600 also reads fine.

**Grade: A−** — only a tiny demerit for the same dark-palette ink color choice.

---

### 11. `benchmark-cream` (`BenchmarkBars9x16` + cream)

Files: `src/compositions/BenchmarkBars9x16.tsx`.

1. **Font stack:** Inter throughout.
2. **Weight + size:** Title **80/700** (`:54, :352`, auto-shrinks down to 64 for long titles). Subtitle **44/500**, auto-shrinks to 36. Bar label **42/600** (`:164–165`). Bar value **40 or 42 / 800** (`:142`). Source caption **28/400**.
3. **Letter-spacing:** Title `-0.015em` (`:356`) — good. Subtitle `-0.005em`, bar label `-0.01em` (`:167`), value `-0.01em` (`:223`). All within a reasonable editorial tightness band. Source caption `0.01em` (`:416`) — fine for the small size.
4. **Line-height:** Title 1.1, subtitle 1.2, source 1.3. All correct.
5. **Tracking-spaced uppercase:** None on this template (no kicker), which is a missed opportunity — see Top 5 below.
6. **Spanish accents:** `millón`, `Precio` render clean in title (visible: "Precio por millón de tokens (entrada)").
7. **At-distance legibility:** Title strong. Bar labels at 42/600 are a touch light — "Gemini 3.2 Flash" wraps to two lines inside a 280px label column, and the wrap break ("Gemini 3.2 / Flash") looks slightly awkward because line-height 1.1 is tight for a 42px setting. Should be 1.15.

**Grade: B+**

---

### 12. `benchmark-dark` (same, dark palette)

Same as cream + dark palette ink. Title at 80/700 in cream-on-near-black renders cleanly at this size (the dark-render softness is mostly a problem for medium-sized type, 24–60px). Bar labels still have the cramped 1.1 line-height issue.

**Grade: B+**

---

## Cross-template observations

### Font coherence

- **Inter as the default workhorse is the right call.** Five weights actually used (400, 500, 600, 700, 800) plus 900 for `BigNumberHero` give plenty of hierarchy without polyphony.
- **Georgia for QuoteCard is the right pairing.** The semantic split — sans for tech/news, serif italic for "this is a *quote*, slow down" — is exactly the editorial logic mainstream magazines use. The pairing works.
- **The two monospace stacks (`DiagramExplainer` sublabel vs `TweetCard` engagement) are not the same stack.** Diagram: `'JetBrains Mono', 'IBM Plex Mono', 'Menlo', ui-monospace, monospace`. Tweet: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. Both render OS-system-mono on most machines but they will diverge on machines where JetBrains Mono is locally installed (Diagram will switch, Tweet won't). **Consolidate to one stack in `src/brand/fonts.ts`.**

### Tracking discipline (uppercase elements)

| Element | Letter-spacing | File:line |
|---|---|---|
| `BrandBreadcrumb` text | 0.22em | `BrandBreadcrumb.tsx:91` |
| `DiagramExplainer` section label | 0.22em | `DiagramExplainer9x16.tsx:215` |
| `BigNumberHero` kicker | 0.20em | `BigNumberHero9x16.tsx:266` |
| `QuoteCard` author | 0.18em | `QuoteCard9x16.tsx:209` |
| `ChipScene` chip | 0.18em | `ChipScene.tsx:47` |

This is a **legitimate four-tier system** (0.22 / 0.20 / 0.18 / 0.18) but it's not documented anywhere. Pin it down: 0.22 = breadcrumb/section, 0.20 = kicker, 0.18 = author/chip. Move to brand tokens.

### Spanish accents

Across all 12 previews: **zero accent-rendering bugs.** Both Inter and Georgia render á/é/í/ó/ú/ñ/Á/É/Í/Ó/Ú/Ñ correctly with proper diacritic spacing. The `¿` and `¡` are not visible in this script but Inter handles them. No clipping, no fallback-font swaps.

### Obvious typography issues found

1. **Subtitle clipping in `BigNumberHero`** (`bignum-cream` preview): "más barato que GPT-5.5" looks tight against the figure column at the right; if the figure suffix is `x` (lowercase) instead of `×` the layout would shift. Not visible in v2 but a latent risk — there is no `text-align: center` enforcement on the subtitle relative to the centered number block, only via the flex column.
2. **Chip-vs-breadcrumb collision on `tnf-blue` at t=1s**: chip top:60 + height ~50 lands at y≈110; breadcrumb top:80 + height ~50 lands at y≈130. They occupy the same horizontal band. Needs a vertical guard rail.
3. **DiagramExplainer dark-palette title softness**: cream ink on near-black card looks anti-aliased; pure white might fix it.
4. **Benchmark bar-label wrap**: 1.1 line-height on a 42px multi-line label is too tight.

---

## Top 5 typography changes (prioritized by impact)

1. **Bump dark-palette ink from cream to pure `#FFFFFF` for body-size text (24–80px) only.** Applies to `DiagramExplainer9x16.tsx:72` (cardBg-adjacent), the resolved `inkColor` flowing into `SubtitleScene.tsx:51`, `BenchmarkBars9x16.tsx:354` and `:166`. The 100+ display sizes can keep cream — the softness only hurts small/medium. **Highest impact: fixes 3 templates at once.**
2. **Fix benchmark bar-label line-height from 1.1 to 1.15.** `src/compositions/BenchmarkBars9x16.tsx:166`. One number; eliminates the cramped "Gemini 3.2 / Flash" stack.
3. **Bump QuoteCard body line-height from 1.18 to 1.22.** `src/compositions/QuoteCard9x16.tsx:115`. Georgia italic at 70px needs the room.
4. **Add a y-guard so `ChipScene` never overlaps the breadcrumb.** Move chip to `top: 140` when a breadcrumb is mounted, else `top: 60`. `src/compositions/scenes/ChipScene.tsx:39`. Fixes the only real layout/type collision in the set.
5. **Consolidate the two monospace stacks into one brand token.** Add `mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"` to `src/brand/fonts.ts`, then import in both `DiagramExplainer9x16.tsx:116–117` and `TweetCardHero9x16.tsx:132–134`.

---

## One-sentence grade per template

| # | Template | Grade | One-sentence |
|---|---|---|---|
| 1 | `remotion-v2-baseline` | A− | Cleanest type system in the set; only the chip's 800-weight at 34px feels overpacked. |
| 2 | `tnf-blue` | B | Type itself is fine, but the chip overlaps the breadcrumb in this frame — a real layout bug. |
| 3 | `tnf-transitions` | B+ | Same template as #2 caught at a clean moment, so the type reads as it should. |
| 4 | `tweetcard` | A | Twitter-mimic constraints force the right decisions everywhere — strongest body-size readability of the 12. |
| 5 | `diagram-cream` | A− | Strong hierarchy; only nit is the mono sublabel could lose its 0.02em tracking. |
| 6 | `diagram-dark` | B+ | Same type structure as cream but the cream-ink-on-dark choice softens mid-size text. |
| 7 | `quote-cream` | A | The only template using serif italic and the only one that *needs* it; sets the editorial bar for the brand. |
| 8 | `quote-dark` | B+ | A-grade typography hurt only by the dark-palette ink color. |
| 9 | `bignum-cream` | A | Best size hierarchy in the system (420 → 62 → 32 is editorial perfection); tabular-nums prepared for count-up. |
| 10 | `bignum-dark` | A− | Same as #9 with a hairline demerit for dark-palette ink softness, mostly invisible at 420px. |
| 11 | `benchmark-cream` | B+ | Tight, well-sized — but the 42/600 bar-label needs more line-height for two-line wraps. |
| 12 | `benchmark-dark` | B+ | Same as #11 with the same bar-label issue. |

---

## Should we add a typeface beyond Inter + Georgia?

**Yes — add a real mono, no — don't add another serif or sans.**

- **Add JetBrains Mono officially** (load via `@remotion/google-fonts/JetBrainsMono`, weights 400 + 500). Right now both DiagramExplainer and TweetCard rely on font-fallback chains that resolve to OS-system mono on most rendering machines. JetBrains Mono is the visually-distinct "code annotation" mono our editorial system actually wants. Same Apache 2.0 license posture as Inter (OFL). This unlocks: (a) consistent terminal/code chip aesthetic, (b) supports a future `TerminalCard` or `CodeDiff` template without adding a font, (c) the sublabel `$0.25 / $2.00 / 1M tokens` already *looks* like JetBrains-Mono-not-rendered-as-such in `diagram-cream`.

- **Do not add another serif.** Georgia is doing exactly what we need for QuoteCard. Adding e.g. Playfair or Tiempos would compete editorially with no upside.

- **Do not add another sans.** Inter spans 100–900 plus tabular-nums plus excellent Spanish glyph coverage; it's a complete display + body system on its own. Adding e.g. Söhne or Söhne Mono Variable would burn licensing money for marginal aesthetic distinction.

**Net additions to `src/brand/fonts.ts`:** one line for JetBrains Mono. Everything else stays.
