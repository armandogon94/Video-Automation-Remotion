# BeforeAfterText16x9 ↔ natebjones

**Creator pattern:** BeforeAfterContrastCards / BeforeAfterTextComparison (ANALYSIS-VOTE2 §4 #5) + the N5 `VS` variant.
**Reference frames:** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-04-frame-011-t1779s.jpg` (the full "DEFAULT · Cloud Home · rented memory" → TO → "BETTER · Cloud Guest · specialist" layout); neighbors 006/009 are mid-transition.

## Signature pattern
Two-column conceptual contrast on dark slate. Each column: a short colored accent rule near the label → uppercase tracked label (accent-colored) → large white headline → muted colored sub-line. A central operator word (`TO` directional / `VS` adversarial) in **muted gray sans** with a thin underline-stroke that draws in. Columns slide in left/right, operator fades in after they settle.

## What matches (our render)
- Two mirror-symmetric columns, colored tracked-uppercase labels (`GPT-5` orange / `GEMINI 3.2` green), colored underline rules, large white headline bodies (`Closed` / `Open`) — exact structural match.
- Central operator word between the columns; emphasis pill below with one orange keyword ("runtime"); breadcrumb top-left + section-label chip + watermark bottom-right.
- Motion: frame-1 (t=0.5s) shows LEFT column entering with **blurInFocus** (blur clearly visible) before the RIGHT column and operator — matches "slide in left, then right, then operator fades" choreography.
- Accent discipline (orange + green/teal) tracks Nate's palette.

## What differs
- Accent rule sits **below** our label; Nate's sits **above** it. Minor ordering nuance — both pair a colored rule with the label near the headline.
- Cross-creator render shows the `VS` operator in **gold serif-italic**; Nate's connector (`TO` and the N5 `VS`) is **muted gray sans** with a thin underline-stroke. This look comes from the **Root.tsx default props** (`operator: { symbol: "VS", italic: true }`), NOT the composition — the comp's `Operator` defaults `color → mutedColor` and `italic: false` (muted gray sans), which natively matches the reference. Root.tsx is out of my edit scope.

## Verdict
The composition faithfully captures the pattern and natively supports the muted-gray-sans operator + underline that matches Nate. The gold-italic VS is a Root default prop choice, not a comp defect. **No edit — VALIDATE.**

**Score: 8/10**

## Recommendations (not made — out of edit scope)
- Root.tsx `BeforeAfterText16x9` default could set `operator.italic: false` and `operator.color: ""` (→ muted gray sans) to match Nate's connector exactly; optionally add a thin underline-stroke under the operator word.
- Optional comp tweak (low priority, would change all call-sites): move the colored rule **above** the label to mirror Nate's stacking order.
