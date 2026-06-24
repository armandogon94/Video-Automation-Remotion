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
Re-rendered (`runCrossCreatorReplicas.ts QuoteCard9x16`, 150f). Sampled bg = `(14,18,27)` ≈ `#0E121B` near-black with a warm top vignette (dark palette grain). Matches:
- **Near-black field** with subtle lit-from-above vignette ✓ (black.one.studio's exact lighting register)
- **Declarative period copy** ✓
- One-accent gold discipline on dark ✓

## DEEP QA pass 2 (2026-06-04) — CORRECTION to the "late-arriving reveal" claim
The prior "After" bullet claimed a "Late-arriving staggered reveal … frame@0.5s shows quote only; frame@4.5s adds divider + byline." **That is inaccurate.** I re-extracted 4 evenly-spaced frames (t≈1/2/3/4s) plus a t=0.2s frame and PIL-sampled identical pixels at the quote-glyph and author positions across all of them. Reality: the quote springs in at frame 0 (full by ~0.6s), glyphs fade by 0.5s, divider at 0.55s delay, author byline at 0.95s delay — i.e. **everything is on-screen within ~1.3s of a 5s clip.** That is an *opening stagger over the first second*, NOT black.one.studio's signature **late-arriving tagline** (hold a CLEAN/empty field for ~40–60% of the clip ≈ 2–3s, THEN fade the line in — ref "Not many. / Just one." appears only at t≈4.24s of a 5s clip). The most-transferable black.one.studio tactic per ANALYSIS.md (`🟡 Priority 3`, "the single most transferable mechanical tactic") is therefore **NOT implemented.**

Why I did NOT fix it here (conservative / scope): the comp reveals are all anchored to absolute `frame` and there is **no `revealDelaySeconds` prop** — QuoteBody/QuoteGlyph take no delay arg, and `Divider`/`AuthorBlock` `delaySec` values are hardcoded inside the comp (0.55 / 0.95). A correct fix needs (a) a new `revealDelaySeconds: z.number().default(0)` field on `quoteCard9x16Schema` in the **shared** `src/compositions/schemas.ts`, (b) threading that offset into all five reveal anchors in `QuoteCard9x16.tsx`, (c) setting it (~2.0s) ONLY in the cross-creator props JSON. (a) touches a shared file that backs every other agent's comp this run (a bad Zod edit breaks the whole bundle), and ANALYSIS.md itself frames this as a **cross-cutting change across THREE comps** (QuoteCard9x16, TweetCardHero9x16, BigNumberHero9x16) best done as its own dedicated task — not a per-pairing cross-creator tweak. Hardcoding a delay constant directly in the .tsx (the only single-file option) would also slow the **production cream** video and the other consumer (motiondarwin), which is too broad. So this stays a recommendation, not an edit.

## Decision
**Score: 7/10 — VALIDATED (prior IMPROVE confirmed; one prior claim corrected).** The dominant cluster axis (pure/near-black field), declarative period copy, one-accent gold discipline, and negative-space centered layout faithfully capture the *transferable* black.one.studio mood — achieved via the comp's own dark mode through a cross-creator props override, zero production risk. The remaining gaps (late-arriving reveal; minimal-sans-vs-serif chrome) are correctly out of minimal-safe scope.

## Recommended (NOT done — needs shared schema + cross-cutting task)
1. **Add `revealDelaySeconds` (default 0) to `quoteCard9x16Schema`** and thread it as an added offset into QuoteBody, both QuoteGlyphs, Divider, AuthorBlock; set ~2.0s in `docs/research/cross-creator/props/QuoteCard9x16.json`. Implements black.one.studio's late-arriving-tagline patience. ANALYSIS.md recommends shipping the SAME `revealDelaySeconds` on TweetCardHero9x16 + BigNumberHero9x16 in the same task (default 1.5s for TweetCardHero per the bilawal spec).
2. **Honest residual (comp identity, leave):** black.one.studio uses minimal sans + no quote glyphs; ours keeps serif-italic + decorative gold quote glyphs + byline because that literary-pull-quote chrome is QuoteCard9x16's core identity (needed for motiondarwin). Stripping it would be a structural rewrite that harms the other creator it serves.
