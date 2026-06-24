# PipelineFlow9x16 ↔ adamrosler

**Creator pattern (adamrosler — process/flow diagrams):** stacked rounded boxes on a
near-black bg, connected by arrows, monospace labels, color-coded box borders, and one
glowing key pill.
FRESH frames:
- `references/creators/adamrosler/S5ZFkY756IY/_fresh/frame-004.jpg` — `fork()` flow: blue
  doc box → green DASHED `CHILD` box, green outlined `0 BYTES COPIED` box, green pill-ish
  callout. Monospace throughout.
- `frame-013.jpg` — `PARENT PT` (blue glowing border) / `CHILD PT` (mauve border) boxes +
  `PHYSICAL MEMORY` container with red RO tiles. Slate boxes w/ colored glowing borders.
- `frame-028.jpg` / `frame-033.jpg` — green/red color-coded boxes + a GOLD key pill.

**Signature traits:** near-black bg · slate boxes with colored glowing borders · monospace
labels · connector arrows · multi-color accents (green success / red / blue) · one key pill.

## Frame-by-frame (our 4 frames @0.3/1.6/3.0/4.6s vs his)

| Axis | Before (cream default) | After (true-black) | adamrosler |
|------|------------------------|--------------------|-----------|
| Surface | cream #FAF7F2 | pure black | near/pure black ✓ |
| Boxes | white, green border | slate #161D2B + green glow border | slate + colored glow border ✓ |
| Titles | mono green | mono green | monospace ✓ |
| Arrows | green down-arrows | green down-arrows | connector arrows ✓ |
| Kind-dots | indigo/cyan/mint | indigo/cyan/mint | multi-color accents ✓ |
| Body | dark ink | white | white labels ✓ |
| Pill | green outline | green outline (glow) | green/gold key pill ✓ |

## Matches (signature pattern)
- Vertical stack of rounded boxes + BIG down-arrows between them — his flow grammar.
- Monospace box titles (`implementation-agent`, `test-runner`, `review-agent`) — his
  monospace label discipline.
- Typed kind-dots (agent=indigo / tool=cyan / check=mint) give the multi-color accent
  variety he uses (green/red/blue per role).
- Tracked-uppercase mono "PIPELINE" pill footer = his "one key pill" element.
- **Sequential staged reveal**: each box springs in one-at-a-time (1.0s step), and each
  connector arrow draws on 0.2s AFTER its target box lands. Confirmed across the 4 frames
  (1 box → 2 boxes+arrow → 3 boxes+arrows+pill). Clean staged build.

## Gap found (the single biggest)
- **Surface inversion.** Default render was cream bg (the green accent itself was already
  faithful to his green flow boxes — it came from `subjectTool: "claude-code"`). Only the
  near-black background + slate boxes were missing.

## Change made (minimal, high-confidence, props-only — copy untouched)
- NEW `docs/research/cross-creator/props/PipelineFlow9x16.json` (mine): same stages/labels/
  timing verbatim from Root.tsx, but `palette: "true-black"` (→ slate #161D2B boxes + gold-
  glow card shadow + black bg), `accentColor: "#3FB68B"` (a vivid green that pops on black,
  matching his green flow boxes), and `subjectTool: ""` (so the explicit green override
  isn't replaced by the tool accent). NO .tsx edit needed — the comp already ships a full
  dark-family branch (slate cards, dark pill); Root.tsx (not editable) pinned
  `palette: "cream"`, and the runner merges the props JSON over it.

Re-rendered + re-extracted @1.6/4.6s — confirmed pure-black bg, slate green-bordered glowing
boxes, mono green titles, green arrows, indigo/cyan/mint kind-dots, white body, green pill.
Staged reveal motion intact; no regression. `tsc --noEmit` clean (no source change).

## Score
- Before: 6/10 (flow structure + motion + green accent faithful; cream surface off-creator).
- After: **9/10** — faithful adamrosler dark process-flow: slate boxes w/ glowing colored
  borders, monospace, connector arrows, multi-color dots, key pill. Not 10 only because his
  boxes sometimes mix per-box border colors (blue PARENT / mauve CHILD / red RO) and reserve
  GOLD for the single key pill; ours uses a uniform green accent + a green pill (also attested
  in his frame-004). A per-box-border-color + gold-pill variant would need a .tsx change —
  see recommendation.

## Recommendation (NOT made — would need a .tsx change in this comp)
- Optional: let `FooterLabel` take an independent `pillColor` (default = accent) so the key
  pill can be GOLD while boxes stay green — exactly adamrosler's "green flow + one gold pill"
  (frame-028). And/or a per-stage `borderColor` so boxes can be individually color-coded
  (blue/mauve/red) like his PARENT/CHILD/RO boxes. Left as a recommendation to keep this pass
  minimal and avoid regressing the shared Carlos-corpus styling the comp was authored for.

**Verdict: IMPROVED** — flipped the comparison surface to adamrosler's black + slate
glowing-bordered boxes via a props JSON; green flow accent + staged reveal intact.
