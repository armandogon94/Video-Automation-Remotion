# AnimatedCounter9x16 ↔ adamrosler

**Creator pattern:** *rollingDigit big-number count* — a large rolling/odometer numeral on
a dark background.

**Reference frames:**
- `references/creators/adamrosler/7RhJawm2nw4/frames/frame-043.jpg` — `step 3,200,000` in
  **blue monospace** with comma-thousands grouping, white sans label above
  ("then run it a trillion times.").
- `.../frame-038.jpg` — `step 1,523,835`; `.../frame-008.jpg` — `ERROR 2.54` (gold mono).
- `references/creators/adamrosler/2n4Mc8Bh8KQ/...` — `49B fires` (gold mono),
  `1.6T params` (white). Across the corpus the big number is consistently **monospace +
  comma-thousands**, colored gold/blue/green, with a small label above.

**Signature traits:** large **monospace** numeral · comma-thousands grouping · label above ·
accent color on the figure or suffix · count/odometer ramp.

## What matches
- The count mechanic is right: `0 → target` ramp with cubic ease-out, `tabular-nums` (no
  digit jitter), and **comma-thousands** grouping already in `formatNumber` — the structural
  rolling-digit signature is present.
- Kicker label above (`GEMINI 3.2 FLASH`, tracked uppercase accent) + accent-colored suffix
  (`×` in blue) mirror adamrosler's "label above / accent on the figure" layout.
- Pre-ramp scale-in + staged subtitle/caption reveal — clean motion.

## What differs
- **Font face:** our hero figure uses proportional **Inter 900**, whereas adamrosler's
  defining trait is a **monospace** numeral (`2,596,433`). For the shipped demo `target: 15`
  the figure is too small to exercise the rolling-comma look at all, so the divergence is
  mostly latent here.
- **Palette:** cross-creator render is brand cream (Root `AnimatedCounter9x16` defaultProps
  `palette: "cream"`; comp supports `dark`). Brand-driven, not a template flaw.

## Decision
**VALIDATED — no edit.** The structural pattern (ramping count, comma-thousands, tabular
figures, label-above, accent suffix) is faithfully captured. Swapping the hero face to
monospace is a *brand-identity* change (our house display face is Inter 900, the sibling
`BigNumberHero9x16` matches it), and the framing says capture the PATTERN with OUR brand —
not adopt the creator's font identity. Forcing mono here would be "fixing identity to match
theirs," which the brief warns against. So I leave the face as-is and record the option.

**Recommendation (not made):** if a future adamrosler-flavored counter is wanted, expose a
`figureFont: "sans" | "mono"` prop (default `sans`) and route the figure + prefix + suffix
through `FONT_STACKS.mono` when `"mono"` — this is the single change that would nail his
rolling-digit signature without disturbing the default brand look or `BigNumberHero9x16`.

**Score: 7/10** — VALIDATED. Count mechanic + comma-thousands + label/accent layout are
on-grammar; the remaining gap (proportional-vs-monospace figure, cream-vs-dark) is brand
identity, intentionally preserved per the cross-creator framing.
