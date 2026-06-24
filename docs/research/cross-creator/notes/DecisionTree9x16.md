# DecisionTree9x16 ↔ adamrosler

**Creator pattern (adamrosler — branching/fan-out diagrams):** a parent node fanning
out to multiple children via color-coded pointer lines, on a near-black bg, slate boxes
with colored glowing borders, monospace detail labels.
FRESH frames:
- `references/creators/adamrosler/S5ZFkY756IY/_fresh/frame-010.jpg` / `frame-013.jpg` —
  `PARENT PT` (blue glowing box) + `CHILD PT` (mauve box) fanning via dashed pointer lines
  down to a `PHYSICAL MEMORY` row of color-coded RO tiles. One parent → many children.
- `frame-004.jpg` — `fork()` parent doc → green dashed CHILD box (parent→child branch).

**Signature traits:** parent node → multiple children · color-coded connector lines (one
hue per branch) · slate boxes w/ colored glowing borders · monospace sub-labels ·
near-black bg.

## Frame-by-frame (our 4 frames @0.3/1.6/3.0/4.6s vs his)

| Axis | Before (cream default) | After (true-black) | adamrosler |
|------|------------------------|--------------------|-----------|
| Surface | cream #FAF7F2 | pure black | near/pure black ✓ |
| Root node | white, blue border | slate #10172A + blue glow border | blue PARENT box ✓ |
| Children | white, colored borders | slate + green/cyan/coral glow borders | color-coded boxes ✓ |
| Connectors | green/cyan/coral lines | same, glowing on black | color-coded pointer lines ✓ |
| Sub-labels | mono, colored | mono, colored | monospace detail ✓ |
| Title | dark ink | white | white headline ✓ |
| Tip marker | static dot | static dot | (no animated arrowhead) ✓ |

## Matches (signature pattern)
- One root → 3 children fan-out with per-branch color-coded connector lines — exactly his
  parent→children pointer-fan grammar (PARENT PT → PHYSICAL MEMORY tiles).
- Per-branch role colors (green `#7CE49A` / cyan `#5BC0E8` / coral `#E89B7A`) on edges +
  child borders + mono subs — his multi-color role discipline. (These were ALREADY faithful
  pre-change; only the background was wrong.)
- Blue root box = his blue PARENT box.
- **Staged motion**: root springs in, then child edges draw outward via stroke-dashoffset
  staggered 6f each, child labels fade in 4f AFTER their edge completes; a STATIC dot sits
  at each edge tip (Tella no-animated-arrowhead rule). Confirmed across frames (root+lines
  mid-draw @1.6s → all 3 children settled @4.6s).

## Gap found (the single biggest)
- **Surface inversion.** Default render was cream bg; adamrosler's branching diagrams are
  near-black. Structure, color-coding, and motion were already faithful.

## Change made (minimal, high-confidence, props-only — copy untouched)
- NEW `docs/research/cross-creator/props/DecisionTree9x16.json` (mine): same root/children/
  colors/timing verbatim from Root.tsx, but `palette: "true-black"` (→ slate #10172A boxes
  + black bg + glowing borders). Kept `subjectTool: "gemini"` so the root stays BLUE (matches
  his blue PARENT box). NO .tsx edit — the comp already ships a full dark branch (slate
  RootNodeCard/ChildNodeCard, white body text via getBodyTextColor); Root.tsx (not editable)
  pinned `palette: "cream"`, and the runner merges the props JSON over it.

Re-rendered + re-extracted @1.6/4.6s — confirmed pure-black bg, slate blue-bordered root,
green/cyan/coral-bordered children, color-coded fanning connectors with static dot tips,
mono subs, white titles. Staggered edge-draw + label-after-edge motion intact; no regression.
`tsc --noEmit` clean (no source change).

## Score
- Before: 6/10 (fan-out structure + per-branch color coding + motion faithful; cream surface
  off-creator).
- After: **9/10** — faithful adamrosler branching diagram: black bg, slate boxes with colored
  glowing borders, color-coded pointer-fan, monospace subs, static dot tips. Not 10 only
  because his pointer lines are sometimes DASHED (frame-010/013) where ours are solid — a
  minor, low-confidence nuance not worth a .tsx change (see recommendation).

## Recommendation (NOT made — would need a .tsx change in this comp)
- Optional: add an `edgeStyle: "solid" | "dashed"` prop so the connector lines can be dashed
  to match his page-table pointer style on certain scenes. Left as a recommendation to keep
  this pass minimal (the solid lines are also attested in his fork→child branch, frame-004).

**Verdict: IMPROVED** — flipped the comparison surface to adamrosler's black + slate
glowing-bordered nodes via a props JSON; per-branch color coding + staged fan-out intact.
