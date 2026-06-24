# BigNumberDuel9x16 ↔ adamrosler

**Creator pattern:** *head-to-head comparison*. adamrosler does this two ways:
(a) **bordered chart-card duel** — `references/creators/adamrosler/7RhJawm2nw4/_fresh/frame-034.jpg`
& `frame-037.jpg`: two side-by-side rounded **bordered cards** (`flat loss` / `jagged loss`),
**orange** card headers, mini sparkline areas, muted-gray sublabels (`gradient died` /
`overshooting`), red `LR ↑` / `LR ↓` pill buttons; and
(b) **CPU vs GPU toggle** (`gaGcC_OOGQ0`) — two dashed-border pills, green-fill active + glow.
Both are **dark** with **warm/orange + red** accents.

**Our comp's lineage:** Carlos T14 *BigNumberDuel* — the "X vs Y" archetype as two enormous
figures + serif italic `vs` + per-side label/tagline + bottom verdict. This is a **magnitude
duel** (`$0.25` vs `$3.75`), a distinct and legitimate primitive from adamrosler's *chart-card*
duel.

**Signature traits to honor:** dark surface · warm accent discipline · paired structure with a
clear winner/verdict · tracked-uppercase eyebrow.

## What matches (strong)
- Paired two-column structure with per-side **label + sublabel** + a single **verdict line**
  ("15× …") — same "two contenders, one conclusion" rhetoric as the loss-card duel.
- Synchronized **count-up** on both figures (outQuart), staggered **wipe-in** (L from left,
  R from right), `vs` fades once both land, verdict fades after the slower side finishes —
  clean deterministic motion in the adamrosler register.
- Tracked-uppercase accent eyebrow (`PRECIO POR M TOKENS`) + accented `$` prefixes.

## What differed (round-1) → fixed
- **Palette:** baseline rendered **cream + Google-blue** (Root defaultProps `palette:"cream"` +
  `subjectTool:"gemini"`). adamrosler is **100% dark** with warm accents for every duel — the
  cream surface was the single biggest palette-discipline miss.

## Change made (IMPROVED)
- **`docs/research/cross-creator/props/BigNumberDuel9x16.json`** (new — mine to create):
  `palette:"dark"` + `subjectTool:""` (clears the inherited Gemini-blue so the dark palette's
  warm-gold `#D4A04A` carries the `$` prefixes + eyebrow) + Spanish copy
  (`15× más barato, misma precisión.`, `entrada · por 1M tokens`). **No `.tsx` change** — dark is
  already a first-class, tested mode (the documented Carlos dark-editorial palette).

## Verify
- Re-rendered; 4-frame check: dark navy bg, two cream Inter-900 figures counting `$0.25` /
  `$3.74→$3.75`, **gold** `$` prefixes + gold eyebrow, warm-gray serif `vs` + sublabels, white
  verdict. Wipe/count/vs/verdict timing intact; no regression. (`tsc` clean — no code touched.)

## What I deliberately did NOT do
- I did **not** bolt bordered chart-cards / pill buttons onto this comp. That is adamrosler's
  *chart-card* duel — a different primitive (closer to BenchmarkBars / a hypothetical DuelCards),
  and grafting it on would fight this template's Carlos magnitude-duel identity, exactly the
  over-reach the brief warns against. The magnitude-duel layout is correct as-is.

**Recommendation (not made — shared/Root):** the bordered-card+pill duel is a genuine adamrosler
primitive with no current home; worth a dedicated `DuelCards9x16` (two bordered panels, orange
headers, mini-spark slot, pill verdicts) rather than overloading BigNumberDuel.

**Score: 6/10 → 8/10.** Palette discipline now fully on-adamrosler (dark + warm gold); structure
is a faithful sibling of his duel rhetoric. Held back from 9–10 because his hallmark duel is the
*bordered-card* variant, which is intentionally a separate primitive.
