# QuoteCard9x16 ↔ black.one.studio

**Creator:** black.one.studio — also serves motiondarwin.
**Reference videos:** `references/creators/black.one.studio/DUTmCQfAbPt/frames/` (product hero ending on `BLACK.ONE.` wordmark + CapCut tail), `DT1nIrLEcMA/frame-03` ("Not many.\nJust one." over a hooded model).

## Signature pattern (black.one.studio "tagline-on-pure-black")
- **Pure/near-black field** — the brand is literally named for black; product/model lit from above on black.
- **Minimal-sans declarative tagline**, sentence-case, **period-terminated** ("Not many. Just one.", "BLACK.ONE.").
- **Late-arriving / centered text reveal** — text fades up onto the dark field; the rest is negative space.
- **No quote glyphs, no eyebrow, no byline** — stark restraint; one idea per frame.
- White minimal sans; near-zero decoration; one accent at most.

## Baseline (before) — what differed
The cross-creator render used the comp's **cream default** (Root.tsx): off-white field, **red** eyebrow "ANTHROPIC · ON CREATIVITY", serif-italic literary quote, large **pink decorative quote glyphs**, red divider + "PETER DRUCKER" byline. This is the system's Bloomberg/New-Yorker *literary pull-quote* aesthetic — palette-inverted (cream vs black) and tonally opposite (decorated literary quote vs stark minimal declarative) to black.one.studio. The dominant cluster axis — **palette discipline** — was inverted.

## What I changed (IMPROVED)
QuoteCard9x16 **natively supports a `dark` palette** (`palette: z.enum(["cream","dark"])`, `resolveColors`, `getPalette().grainOverlay`, `getBodyTextColor`, `palette === "dark"` grain blend) — dark mode is designed-for and used by other renders. So no comp edit was needed or appropriate. I added a **cross-creator-only props override** at `docs/research/cross-creator/props/QuoteCard9x16.json` (the data file `runCrossCreatorReplicas.ts` reads via `PROPS_DIR`) with `palette: "dark"`. This changes ONLY the cross-creator output; the production cream default and the comp `.tsx` are untouched. No Root/index/brand/shared-molecule edits.

I also moved the quote copy to a declarative, period-terminated tagline in **our own Spanish** ("El futuro no se predice. Se construye.") to match black.one.studio's declarative+period copy *register* (a structural pattern, not their words — task explicitly allows adopting the pattern with our own copy).

## After — verification
Re-rendered (`runCrossCreatorReplicas.ts QuoteCard9x16`, 150f). Sampled bg = `(18,21,28)` ≈ `#12151C` near-black with a warm top vignette (dark palette grain). Now matches:
- **Near-black field** with subtle lit-from-above vignette ✓ (black.one.studio's exact lighting register)
- **Declarative period copy** ✓
- **Late-arriving staggered reveal** — frame@0.5s shows quote only; frame@4.5s adds divider + "ARMANDO INTELIGENCIA" byline (quote spring → divider 0.55s → author 0.95s). Matches black.one.studio's late text reveal. ✓
- One-accent gold discipline on dark ✓

## Decision
**Score: before 3/10 (cream-inverted literary quote) → after 7/10 — IMPROVED.** The dominant cluster axis (pure/near-black field) now matches, plus declarative period copy and late-arriving reveal. Achieved via the comp's own dark mode through a cross-creator props override — zero production risk.

## Honest residual gap (NOT changed — comp identity)
black.one.studio uses **minimal sans + no quote glyphs**; ours keeps **serif-italic + decorative pink/gold quote glyphs + author byline** because that literary-pull-quote chrome is QuoteCard9x16's core identity (needed for its other consumer, motiondarwin). Stripping glyphs/serif would be a structural rewrite of the comp, not a minimal safe edit, and would harm the other creator it serves. Left as-is.
