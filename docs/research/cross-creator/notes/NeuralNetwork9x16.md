# NeuralNetwork9x16 ↔ adamrosler

**Creator pattern (adamrosler — the most direct match in the cluster):** his
`7RhJawm2nw4` IS a layered neural-net node graph.
FRESH frames:
- `references/creators/adamrosler/7RhJawm2nw4/_fresh/frame-020.jpg` — near-black bg,
  fully-connected node graph, BLUE glowing circular nodes, `INPUT`/`OUTPUT` flank
  labels, thin faint edges; during backprop one OUTPUT node flips RED ("WRONG").
- `frame-038.jpg` — same blue glowing-node grammar.

**Signature traits:** dark bg · blue glowing circular nodes · layer/flank labels
(INPUT/OUTPUT) · thin faint fully-connected edges · a "signal" that travels through
the net (activation / error propagation).

## Frame-by-frame (our 4 frames @0.3/1.6/3.0/4.6s vs his)

| Axis | Before (cream default) | After (dark + blue) | adamrosler |
|------|------------------------|---------------------|-----------|
| Surface | cream #FAF7F2 | near-black (dark paper) | near-black ✓ |
| Nodes | hollow, RED outline | hollow, BLUE outline + blue glow | blue glowing nodes ✓ |
| Layer labels | gray | gray INPUT/HIDDEN/OUTPUT | INPUT/OUTPUT labels ✓ |
| Edges | faint gray | faint warm-gray | thin faint edges ✓ |
| Pulses | red dots | BLUE traveling dots | signal traveling ✓ |
| Headline | dark ink | white/cream ink | white headline ✓ |
| Eyebrow | red | blue breadcrumb | accent eyebrow ✓ |

## Matches (signature pattern) — STRONG
- Layered columns (INPUT / HIDDEN 1 / HIDDEN 2 / OUTPUT) with uppercase tracked labels —
  exactly his neural-net layout grammar.
- Fully-connected thin faint edges between every pair of adjacent-layer nodes.
- **Forward-pass activation motion**: per-layer node-glow sweep + blue pulse dots
  traveling left→right wave-by-wave (`firstWaveDelay` 0.5s, `waveInterval` 0.9s,
  `pulsePropagate` 0.4s). This is his "signal travels through the network" concept,
  done as a continuous forward pass. Confirmed across the 4 frames (different layers lit
  at 1.6s vs 3.0s; pulses at distinct positions).

## Gap found (the single biggest)
- **Surface + accent color.** Default render was cream bg + brand-red nodes/pulses —
  tonally inverted from adamrosler's near-black bg + blue glowing nodes. Structure and
  motion were already faithful; only the palette was off-creator.

## Change made (minimal, high-confidence, props-only — copy untouched)
- NEW `docs/research/cross-creator/props/NeuralNetwork9x16.json` (mine): same
  title/layers/labels/timing verbatim from Root.tsx, but `palette: "dark"`,
  `accentColor: "#4F9BD8"` (adamrosler's electric/steel blue for nodes + pulses +
  eyebrow), and `subjectTool: ""` (so the blue accent override isn't overridden by a
  tool color). NO .tsx edit needed — the comp already supports dark + node glow + accent
  override; Root.tsx (not editable) was pinning `palette: "cream"`, and the runner merges
  the props JSON over it.

Re-rendered + re-extracted @1.6/3.0s — confirmed near-black bg, blue glowing nodes,
gray layer labels, faint edges, blue traveling pulses, white headline. Activation-wave
motion fully preserved; no regression. `tsc --noEmit` clean (no source change).

## Score
- Before: 6/10 (structure + motion faithful; surface/accent tonally inverted).
- After: **9/10** — among the closest matches in the whole set; hard to tell apart from
  his frame-020 at a glance. Not 10 only because his clip also shows a RED "WRONG" OUTPUT
  node during *backprop* — a different scene from our FORWARD-PASS breadcrumb, so omitting
  red-error nodes is correct, not a miss.

**Verdict: IMPROVED** — flipped the comparison surface to adamrosler's near-black + blue
glowing neural-net via a props JSON; activation-wave motion intact.
