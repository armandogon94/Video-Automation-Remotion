# BeforeAfterText16x9 ↔ natebjones

**Creator pattern:** BeforeAfterContrastCards / VSContrastTwoColumn (ANALYSIS-VOTE1 §4 #4 "TO" + #5 "VS"; N5 in ANALYSIS.md).
**Reference frame (definitive):** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-04-frame-011-t1779s.jpg` — "DEFAULT · Cloud Home · rented memory" **TO** "BETTER · Cloud Guest · specialist" on dark slate, big LEFT-edge beanie+glasses watermark, CTA pill bottom-right.

## Signature pattern
Two-column conceptual contrast on dark slate. Each column stacks TOP→BOTTOM: **colored accent rule (ABOVE)** → uppercase tracked label (accent-colored) → large bold-white headline → muted colored sub-line. A central operator word (`TO` directional / `VS` adversarial) in **muted gray sans**, sitting high (near the rule line), fades in after the columns settle. Columns slide in left/right.

## What matches (our render)
- Two mirror-symmetric columns; colored tracked-uppercase labels (`GPT-5` orange / `GEMINI 3.2` green); colored accent rules; large white headline bodies (`Closed` / `Open`) — structural match.
- **Accent rule now sits ABOVE the label** (rule → label → headline), matching Nate's stacking order. (Was: rule BELOW the label.)
- Central operator between columns; emphasis pill below with one orange keyword ("runtime"); breadcrumb top-left + section-label chip + watermark bottom-right.
- Motion: frame-1 (t=0.5s) shows the LEFT column entering with **blurInFocus** before the RIGHT column + operator — matches "slide left, then right, then operator fades" choreography.
- Accent discipline (orange + green) tracks Nate's palette.

## Change made (IMPROVED)
`src/compositions/BeforeAfterText16x9.tsx`: `COLUMN_UNDERLINE_Y 444 → 368` — moves the colored accent rule from below the label to ~32px ABOVE it, so the column reads rule → label → headline → sub like Nate's contrast frames (and as ANALYSIS-VOTE1 §4 #4/#5 both describe). Updated the JSDoc ASCII diagram to match. typecheck clean; re-rendered + re-extracted — rule is now above the label, no regression to columns/operator/pill.

## What still differs (Root.tsx defaultProps / out of scope)
The cross-creator clip renders `{}` props → Remotion falls back to the composition's **Root.tsx `defaultProps`** (id `BeforeAfterText16x9`, ~line 2772), which set `operator: { symbol: "VS", italic: true }` → the **gold serif-italic "VS"**, plus the breadcrumb / section-label / emphasis-pill demo content. Nate's connector is **muted gray sans** (`TO`/`VS`). The composition's OWN schema default is `symbol: "TO", italic: false` (→ `operator.color || mutedColor`, gray sans) which natively matches Nate — so the gold-italic VS is a Root demo-prop choice, NOT a comp defect. Root.tsx is out of my edit scope.

- Column spread: our columns rest 160px from each far edge (wide center gap); Nate clusters them closer to center. Also lives in this comp but is a defensible 16:9 readability choice and a single data point — left unchanged (conservative).

## Verdict
**IMPROVED.** The clearest in-scope signature gap (accent rule below→above the label) is closed with a one-constant edit. The remaining gold-italic VS is a Root default, not the composition.

**Score: 8.5/10** (was 8 pre-edit).

## Recommendations (not made — out of edit scope)
- Root.tsx `BeforeAfterText16x9` defaultProps: set `operator.italic: false` + `operator.color: ""` (→ muted gray sans) to match Nate's connector. Optionally a thin underline-stroke under the operator word.
- Optional (low priority): tighten `LEFT_COLUMN_REST_X` so the two columns cluster nearer center like Nate's instance — would shift all call-sites, so deferred.
