# AnimatedCounter9x16 ↔ adamrosler

**Creator pattern:** *live-readout counter* — a large rolling/odometer numeral on a dark
background, monospace, comma-thousands, with a small label above.

**Reference frames (FRESH):**
- `references/creators/adamrosler/7RhJawm2nw4/_fresh/frame-010.jpg` — `ERROR 0.81` in large
  **orange monospace** (sampled ≈ #F5AA1C / `(245,170,28)`), white sentence-case caption above
  ("learning = one number goes down.").
- `.../_fresh/frame-030.jpg` — `step 2,907,583` in large **blue monospace**
  (sampled ≈ #73AAFA / `(115,170,250)`), comma-thousands, white caption above.
- Across the corpus the live counter is consistently **monospace + comma-thousands**, colored
  amber/blue/green, with a small label above and nothing else competing on the frame.

**Signature traits:** large **monospace** numeral · comma-thousands grouping · accent-colored
figure · small label above · count/odometer ramp · dark background.

## Round-1 baseline (cream + Inter 900) — the gap
The cross-creator render came out **cream** with the hero figure in proportional **Inter 900**.
The count mechanic (0→target ramp, cubic ease-out, `tabular-nums`, comma-thousands `formatNumber`)
and label-above/accent-suffix layout were already on-grammar, but the two *defining* traits of
adamrosler's live counter — **monospace digits** and a **dark** surface — were absent. The prior
pass classified mono-vs-sans as "brand identity" and declined. On a skeptical re-read against the
brief (which lists *typography hierarchy* and *palette/color discipline* as things to judge, and
treats the mono live-readout as part of the terminal/stat SIGNATURE, not a logo), this is the
single biggest, safest, highest-confidence win in the cluster.

## Change made (IMPROVED)
1. **`src/compositions/AnimatedCounter9x16.tsx`** — added `figureFont: "sans" | "mono"`
   (**default `"sans"`** → zero change to the shipped brand default or the `BigNumberHero9x16`
   sibling). When `"mono"`: the prefix + figure + suffix render in `FONT_STACKS.mono`
   (JetBrains Mono, loaded via @remotion/google-fonts so it rasterizes identically headless),
   weight 700, relaxed tracking (`0em` instead of `-0.04em`), and the **whole figure takes the
   accent color** (matching adamrosler's fully-orange `ERROR 0.81` / fully-blue `step 2,907,583`
   readouts) rather than ink-digits + accent-suffix.
2. **`docs/research/cross-creator/props/AnimatedCounter9x16.json`** (new — mine to create) —
   exercises the signature in OUR brand: `palette:"dark"`, `figureFont:"mono"`,
   `target:2907583` (shows the rolling-comma odometer), `subjectTool:""` (clears the stray
   `subjectTool:"gemini"` inherited from Root defaultProps so the figure uses the dark palette's
   warm-gold accent `#D4A04A` — brand-disciplined and adamrosler-orange-adjacent — instead of
   off-brand Google blue), plus Spanish kicker/subtitle/caption (our own copy).

## Verify
- `npx tsc --noEmit | grep AnimatedCounter` → clean.
- Re-rendered; 4-frame check: dark navy bg, **gold JetBrains-Mono** figure with slashed-zero,
  comma-thousands ramping `1,857,572 → 2,900,216 → 2,907,583` with no tabular jitter, gold tracked
  label `PASOS DE ENTRENAMIENTO`, cream subtitle, muted caption. Motion (pre-ramp scale-in →
  cubic-ease count → subtitle fade) intact; no regression.

## Decision
**IMPROVED.** Added a default-off `figureFont:"mono"` capability + an adamrosler-faithful dark
props demo. Shipped brand default (cream, Inter 900) is byte-for-byte unchanged.

**Score: 6/10 → 9/10.** Now matches the monospace + comma-thousands + dark + accent-figure live-
readout signature in our gold. Remaining 1pt: his counters often sit *over* a diagram (loss curve,
gradient ball); ours is a clean hero — a legitimate generic-template choice, not a defect.
