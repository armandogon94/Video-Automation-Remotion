# R3 — Graph, Neural-Network & CS Concept Visualizations for 9:16

> Wave-1 research deliverable. Source-cited playbook for animating knowledge
> graphs, neural networks, and CS algorithms in vertical motion video, with
> emphasis on what survives the bake-off constraints of Remotion (React/SSR)
> rendering at 1080×1920 / 30 fps.
>
> Brand context: Armando Inteligencia — `#1B3A6E` (navy primary), `#D4AF37`
> (gold accent), `#0F1B2D` (deep navy bg), `#FFFFFF` text on dark, Inter font.
> See `brand/config.json`.

---

## 0. Foundational principles (apply to all 8 categories)

These survived every channel we surveyed and should be treated as defaults
for every composition below.

### 0.1 — 3Blue1Brown / Manim aesthetic (Grant Sanderson)

Sanderson's videos are produced almost entirely in **Manim** (he wrote the
library; the Community fork is what we'd port from). Two principles dominate
his neural-network episodes and translate one-for-one to short-form:

- **One signal, one colour.** A node, an edge, a value, or a vector keeps the
  same hue across the entire scene. Colour changes only encode *semantic*
  state (activation high vs low, attended vs ignored, winner vs loser).
  Decorative gradients are absent. Source: [3Blue1Brown channel](https://www.youtube.com/c/3blue1brown),
  [Manning livevideo course](https://www.manning.com/livevideo/3blue1brown-neural-networks).
- **Motion is narration.** Every appearance, fade, or transform is timed to a
  spoken beat. Nothing animates "ambiently." This is enforced in Manim by
  `self.play(Anim, run_time=…)` blocks that are paced against the script
  read aloud first. Source: [How I animate 3Blue1Brown](https://3blue1brown.substack.com/p/how-i-animate-3blue1brown).
- **Static is the baseline, motion is the cue.** Sanderson lets diagrams sit
  still for seconds at a time; the audience reads them. Animation only fires
  when a new concept is introduced or a value changes. Most amateur reels
  over-animate — we should resist that.
- **Background is dead-flat dark.** Manim defaults to `#000000`; 3B1B uses a
  near-black. Maps cleanly to our `#0F1B2D` deep-navy bg.

### 0.2 — Manim-ML / ManimML (helblazer811)

[ManimML](https://github.com/helblazer811/ManimML) ([PyPI](https://pypi.org/project/manim-ml/),
[paper](https://arxiv.org/html/2306.17108v1)) gives us a *reference vocabulary*
for ML viz — FeedForwardLayer, ConvolutionalLayer, MaxPooling2DLayer,
ImageLayer, EmbeddingLayer, all with a built-in `make_forward_pass_animation()`.
Each layer renders as a column of stacked circles (FF) or stacked feature maps
(Conv); the forward pass is a wavefront of dot/colour activations propagating
left→right. We won't run Manim at render-time (it's heavy Python + LaTeX and
doesn't integrate with our Remotion pipeline) but **the visual grammar is
exactly what we want to mimic in TSX** — circle nodes per layer, edges drawn
underneath, wavefront pulse driven by `interpolate()` over a known beat
window.

### 0.3 — Distill.pub design language

[Distill](https://distill.pub/) ([Visualizing Weights](https://distill.pub/2020/circuits/visualizing-weights/),
[GNNs](https://distill.pub/2021/understanding-gnns/)) showed that ML viz
works when it commits to:

- **Few labels, high contrast.** Often only 2–3 labels visible per frame.
- **Direct manipulation visible.** Even a passive video benefits from
  *implied* interactivity — sliders, dropdowns drawn but not interactive.
- **Honest scales.** No log axes without saying so.

### 0.4 — 9:16 layout rules (derived from every category below)

- **Top 12% — header zone.** Section label + BrandBreadcrumb (~y=80).
- **Middle 70% — viz zone** (~y=260 to y=1420). All graph/diagram action here.
- **Bottom 18% — EditorialCaption strip** (~y=1580 to y=1920). Word-by-word
  caption like other Sprint-1 templates.
- **Safe-area inset 60px** on left/right (TikTok UI overlay zone).
- **Minimum text size 30px.** Anything smaller is illegible on a 6"
  phone held at arm's length.
- **Maximum 5–7 simultaneous animated objects.** Above that, attention
  fragments. ManimML papers cite the same heuristic ([arxiv:2306.17108](https://arxiv.org/html/2306.17108v1)).
- **15–25 second total runtime** for "concept" reels; 45–60s for
  step-throughs. Engagement halves past 30s on Reels ([SocialPilot 2026](https://www.socialpilot.co/blog/instagram-reels-algorithm)).

### 0.5 — Remotion-specific render constraints

This is the single biggest filter on library choice. Remotion renders via
headless Chrome ([Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals),
[SSR APIs](https://www.remotion.dev/docs/ssr-node)), so:

- **Anything that needs `window`/`document` at module-eval time** can break
  unless dynamically imported inside the component. This is *the* known
  failure mode for vis-network ([visjs/vis-network#2195](https://github.com/visjs/vis-network/issues/2195))
  and react-force-graph in Next.js SSR ([vasturiano/react-force-graph](https://github.com/vasturiano/react-force-graph)).
- **WebGL works inside Remotion's headless Chrome** but is non-deterministic
  across frames unless the simulation is seeded and stepped by frame number,
  not by wall-clock. Force layouts in particular must be pre-computed.
- **Pre-compute the layout, then animate the result.** Cheapest and most
  reliable pattern: run `d3-force` (or whichever simulation) to convergence
  *once* at composition mount with a fixed RNG seed, snapshot positions,
  then drive entrance/highlight animations with `interpolate()`/`spring()`
  on those frozen coordinates ([Remotion spring](https://www.remotion.dev/docs/spring),
  [interpolate](https://www.remotion.dev/docs/interpolate)).
- **SVG + Motion (framer-motion) is the sweet spot** for graph/tree
  primitives — fully deterministic, no canvas pixel-mismatch risk, GPU
  composited via CSS transforms.

---

## 1. Neural network architecture viz

### 1.1 Visual spec

- **Layout.** 3 layers vertical, top-to-bottom (input → hidden → output) on
  9:16. Each layer is a horizontal row of circles. Layer rows separated by
  ~360px so edges between them are long enough to read.
- **Nodes.** Circles `r=28`, fill `#0F1B2D` (deep navy), stroke 3px gold
  `#D4AF37` when inactive, fill flashes to gold + white text when activated.
- **Edges.** Straight lines between every node-pair, default stroke
  `rgba(255,255,255,0.08)` 1px. When the wavefront passes, edge thickens to
  3px and stroke colour interpolates from white to gold based on weight.
  Negative weights → red `#E5484D`.
- **Activation wavefront.** A faux "signal" travels layer by layer. Each
  layer activates for ~0.6 seconds (18 frames @ 30fps): nodes scale 1 → 1.15
  with `spring({ damping: 12, mass: 0.4 })`, edges to the *next* layer
  pulse during the same window.
- **Labels.** Only the input neurons and output neurons get labels (e.g.
  `"pixel"`, `"cat / dog / car"`). Hidden layer stays unlabelled — exactly
  how 3B1B does it.

### 1.2 Implementation recipe (Remotion)

```tsx
// Layer positions pre-computed at module scope (deterministic).
const layers = [
  { y: 380, n: 6, label: "input" },
  { y: 760, n: 8, label: null },
  { y: 1140, n: 4, label: "output" },
];
const nodes = layers.flatMap((L, li) =>
  Array.from({ length: L.n }, (_, i) => ({
    layer: li,
    x: 540 + (i - (L.n - 1) / 2) * 110,
    y: L.y,
  })),
);

// Per-layer wavefront window (frames)
const layerWindow = (li: number) => {
  const start = enterFrames + li * 18; // 0.6s per layer
  return { start, end: start + 18 };
};

// In render: SVG <line> for each cross-layer pair + <circle> per node,
// using interpolate(frame, [start, end], [0, 1]) to drive the pulse.
```

- **Complexity.** Low. ~250 LOC. No external libs; pure SVG + Remotion.
- **Library.** None required. Optional: `framer-motion` for spring on
  CSS-transform scale (Remotion's `spring()` is fine).
- **Don't use** `react-force-graph` here — feed-forward layout is grid, not
  force, and force-graph is canvas-only (loses crisp SVG strokes at 1080p).

### 1.3 Reference videos

1. **3Blue1Brown — "But what is a neural network?"** — `youtube.com/watch?v=aircAruvnKk` —
   1:14 to 2:30. The canonical input→hidden→output reveal. Note how each
   layer fades in fully before the next, and how edges are barely visible
   until weights start being introduced. ([channel](https://www.youtube.com/c/3blue1brown))
2. **ManimML demo — "Simple Neural Networks Visualization (Manim)"** —
   [`youtube.com/watch?v=9QCifx4MIoQ`](https://www.youtube.com/watch?v=9QCifx4MIoQ).
   The wavefront pulse is exactly what we replicate. Also useful as
   parameterization reference (layer count, neurons per layer).
3. **"Quantum Neural Networks explained in 3Blue1Brown style"** —
   [`youtube.com/watch?v=xL383DseSpE`](https://www.youtube.com/watch?v=xL383DseSpE).
   3rd-party recreation; shows the style is reproducible without
   Grant-level animation budget. Watch the layer-by-layer reveal at 0:30.

### 1.4 Schema (5 fields)

```ts
type NeuralNetwork9x16Props = {
  layers: Array<{ neurons: number; label?: string }>; // 2–5 layers, 3–10 neurons each
  activationPath?: number[]; // per-layer: which neuron index "fires brightest"
  edgeWeights?: "uniform" | "random-seeded" | number[][]; // visual only
  wavefrontSecondsPerLayer?: number; // default 0.6
  caption?: { text: string; audioSrc?: string }; // EditorialCaption strip
};
```

### 1.5 Use-case examples

- "Cómo aprende una red neuronal en 30 segundos" (intro reel for the AI series)
- "Esto es lo que pasa dentro de GPT cuando le escribes algo"
- "Una neurona, un peso, una decisión" (concept primer)

---

## 2. Attention matrix / heatmap

### 2.1 Visual spec

- **Layout.** Centered N×N grid (N = 6–10 tokens), each cell ~80px square,
  total ~640px wide centered on x=540. Tokens labelled along top edge
  (keys) and left edge (queries), Inter 32px.
- **Cells.** Background interpolates from `#0F1B2D` (low attention) to
  `#D4AF37` (high attention) on a perceptually-uniform scale. Optional:
  superimpose 2-decimal numeric value (e.g. `0.42`) at 24px Inter Mono when
  cell brightness > 0.4.
- **Reveal motion.** Two phases:
  1. **Grid build (0–1s):** cells appear top-left → bottom-right diagonal
     sweep, each cell fading from 0 to its target value over 6 frames.
  2. **Row sweep (1–4s):** a glowing 2px gold outline travels down the rows
     one at a time, highlighting "this query attends most to *that* key"
     pattern. Sync to narration tokens.
- **Optional decorations.** Connect a query token (left label) to its
  top-3 attended keys (top labels) with curved gold arcs during its row
  highlight. Removes when row finishes.

### 2.2 Implementation recipe

```tsx
// Pure SVG grid. No deps.
{cells.map(({ row, col, weight }) => {
  const cellEnter = interpolate(frame, [row * 2 + col * 2, row * 2 + col * 2 + 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fill = mixHex("#0F1B2D", "#D4AF37", weight * cellEnter);
  return <rect x={x0 + col * SZ} y={y0 + row * SZ} width={SZ} height={SZ} fill={fill} />;
})}
```

- **Complexity.** Very low. ~200 LOC. No libs beyond Remotion.
- **Source attention weights.** For demo content we hard-code a
  visually-pleasing matrix; for "real" stories pull from a pre-computed
  JSON (extract via `BertViz` once, then ship the static weights).

### 2.3 Reference videos

1. **AnimatedLLM project demo** — [animatedllm.github.io](https://animatedllm.github.io/)
   (also published as [arxiv:2601.04213](https://arxiv.org/html/2601.04213v2)).
   The single best reference for *how to make attention legible*. Their
   "row-highlight + arc to attended keys" pattern is directly portable.
2. **AttentionViz** — [catherinesyeh.github.io/attn-docs](https://catherinesyeh.github.io/attn-docs/)
   ([paper](https://arxiv.org/pdf/2305.03210)). Global-view embedding plot
   we won't replicate, but their per-head heatmap pattern (square grids with
   diagonal stripe = self-attention bias) is what we ship.
3. **Transformer Explainer (Georgia Tech)** — [CHI 2026 paper](https://dl.acm.org/doi/10.1145/3772318.3791725).
   Watch the query/key/value flow animation; the gold-arc-from-query-to-key
   visual is theirs.

### 2.4 Schema (6 fields)

```ts
type AttentionHeatmap9x16Props = {
  tokens: string[]; // 6–10 tokens (same for queries and keys)
  weights: number[][]; // NxN, values 0..1
  showNumeric?: boolean; // overlay numbers in bright cells
  highlightSequence?: number[]; // row indices to sweep in order; default 0..N-1
  rowDurationSeconds?: number; // default 0.6
  caption?: { text: string; audioSrc?: string };
};
```

### 2.5 Use-case examples

- "Esto es lo que mira un transformer cuando ve 'el gato come pescado'"
- "Cómo decide GPT qué palabra viene después"
- "Multi-head attention: 8 ojos mirando la misma frase"

---

## 3. Force-directed knowledge graph

### 3.1 Visual spec

- **Layout.** Pre-computed force simulation, deterministic seed. Bounded to
  a 960×960 square centered on the 9:16 frame at (540, 760). Nodes sized
  by `sqrt(degree)` (12px to 48px radius). Edges thin (`1px @ rgba(255,255,255,0.15)`).
- **Color hierarchy.** Default node fill navy `#1B3A6E`, "hero" node (the
  story's subject) fill gold `#D4AF37` and 1.5× larger. Cluster colours
  (optional): 4-color palette derived from brand — navy, gold, deep-navy,
  cream `#F5E6D3`.
- **Entrance motion.** Three beats:
  1. **Seed (0–0.5s):** hero node only, large gold pulse from r=0 → r=72.
  2. **Sprout (0.5–2.5s):** first-degree neighbors appear one by one
     (every ~0.1s), each "ejected" from hero via spring along its final
     vector. Edges draw with stroke-dasharray length animation.
  3. **Expansion (2.5–5s):** rest of the graph reveals in radial waves
     from the hero.
- **Camera (faked).** Slowly zoom out 1.05 → 1.0 over 6s using a CSS
  `transform: scale()` on the outer SVG — adds depth without runtime cost.

### 3.2 Implementation recipe

**Library decision tree:**

| Library | Verdict for our pipeline |
|---|---|
| [`react-force-graph`](https://github.com/vasturiano/react-force-graph) | **Skip.** Canvas-only, depends on browser globals at module-eval, and known SSR-failure when bundled (see Next.js dynamic-import workaround). Even if it renders inside Remotion's headless Chrome, you lose SVG sharpness. |
| [`cytoscape.js`](https://js.cytoscape.org/) | **Skip for SSR.** [Issue #954](https://github.com/cytoscape/cytoscape.js/issues/954) explicitly says SSR isn't supported — its renderer needs the DOM. WebGL preview exists ([Jan 2025 blog](https://blog.js.cytoscape.org/2025/01/13/webgl-preview/)) but doesn't change the SSR story. |
| [`vis-network`](https://www.npmjs.com/package/vis-network) | **Skip.** Same issue — requires `window` ([visjs/vis-network#2195](https://github.com/visjs/vis-network/issues/2195)). |
| `d3-force` (the simulation, not a renderer) | **Use.** Pure JS, no DOM dependency. Run it at module load with a seeded RNG to converge positions, then render with our own SVG. ([d3/d3-force](https://github.com/d3/d3-force), [D3 in Depth](https://www.d3indepth.com/force-layout/).) |
| `react-flow` | **Use for §6 (state machines) and §7 (control flow)**, not here. ReactFlow is a UI library for editor-style graphs with handles; it's overkill for an ambient knowledge-graph visual. |

```tsx
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force";
import seedrandom from "seedrandom";

// Precompute once. seedrandom for determinism.
const rng = seedrandom("ai-ecosystem-may-2026");
const sim = forceSimulation(nodes.map((n) => ({ ...n, x: rng() * 960, y: rng() * 960 })))
  .force("link", forceLink(edges).distance(120).strength(0.4))
  .force("charge", forceManyBody().strength(-260))
  .force("center", forceCenter(480, 480))
  .stop();
for (let i = 0; i < 300; i++) sim.tick(); // converge offline
// Now nodes[i].x and .y are stable; animate entrance via interpolate(frame, ...)
```

- **Complexity.** Medium. ~400 LOC including the simulation helper.
- **Caveat.** Force layout is *unreadable* above ~25 nodes in 9:16. Cap
  inputs at 20.

### 3.3 Reference videos

1. **Graph Data Visualization With GraphQL & react-force-graph** (William Lyon) —
   [`lyonwj.com/blog/graph-visualization-with-graphql-react-force-graph`](https://lyonwj.com/blog/graph-visualization-with-graphql-react-force-graph)
   ([dev.to mirror](https://dev.to/lyonwj/graph-data-visualization-with-graphql-react-force-graph-18pk)).
   Live demos of force-directed reveal patterns. Watch the
   "shoot-out from center" entrance.
2. **D3 force layout — [d3indepth.com/force-layout](https://www.d3indepth.com/force-layout/)** —
   reference scrubbing tool, useful for setting `charge` and `link.distance`
   without re-rendering.
3. **GeoGraphViz paper video** — [arxiv:2304.09864](https://arxiv.org/pdf/2304.09864).
   3D force-directed for KGs; we won't go 3D, but the cluster-collapse
   animation is great motion-language reference.

### 3.4 Schema (7 fields)

```ts
type ForceGraph9x16Props = {
  nodes: Array<{ id: string; label: string; cluster?: 0|1|2|3; hero?: boolean }>;
  edges: Array<{ source: string; target: string; weight?: number }>;
  seed?: string; // for reproducible layout
  revealMode?: "from-hero" | "radial-wave" | "all-at-once";
  showLabels?: "all" | "hero-only" | "top-degree-3";
  zoomMotion?: boolean; // default true
  caption?: { text: string; audioSrc?: string };
};
```

### 3.5 Use-case examples

- "El mapa del ecosistema Claude Code" (skills, agents, MCPs as clusters)
- "Esto es todo lo que conecta con un LLM" (LangChain ecosystem map)
- "Cuántas startups son dueñas de OpenAI" (entity-relationship reveal)

---

## 4. Tree / mind-map (recursive expansion)

### 4.1 Visual spec

- **Layout.** Root node centered horizontally at y=380. Tree grows
  *downward*, breadth-first. Use `d3-hierarchy.tree()` with
  `nodeSize([180, 240])` to compute coordinates; pure JS, SSR-safe.
- **Nodes.** Rounded rectangles (radius 12px), white fill, navy 2px border,
  Inter 28px label. Hero/root node uses gold border at 3px.
- **Edges.** Smooth-step (90° elbows) or quadratic bézier in navy, 2px,
  drawn with `stroke-dasharray` animation (pathLength 0 → totalLength
  over 18 frames).
- **Reveal beat.** Level by level: root at t=0, children of root at
  t=0.6s, grandchildren at t=1.2s, etc. Each level: edges draw first
  (0.3s), then child boxes spring in (0.3s).
- **Overflow.** If tree has > 12 nodes, auto-zoom out to fit before reveal
  (computed from layout bounds).

### 4.2 Implementation recipe

```tsx
import { hierarchy, tree } from "d3-hierarchy";
const root = tree<TreeNode>().nodeSize([180, 240])(hierarchy(rootData));
const nodes = root.descendants();
const links = root.links();

// Per-node enter window from its depth
const enterFrame = (depth: number) => firstEnter + depth * 18; // 0.6s/level
```

- **Library.** `d3-hierarchy` (SSR-safe, no DOM access). Optional:
  `framer-motion` for spring-on-mount of each node ([motion.dev React](https://motion.dev/docs/react)).
- [`react-d3-tree`](https://github.com/bkrem/react-d3-tree) is *interactive*-tree-shaped
  (zoomable, draggable) and uses `d3-selection.transition()` which the
  package readme itself warns can lag on big trees. Skip it; we just need
  the layout, which `d3-hierarchy` gives us directly.
- **Complexity.** Low–medium. ~300 LOC.

### 4.3 Reference videos

1. **Spanning Tree (Brian Yu) — channel** — [youtube.com/spanningtree](https://www.youtube.com/spanningtree).
   His recursion / tree visuals are crisp: levelled reveals, every node
   is a rectangle, no decoration. Closest reference to what we want.
2. **react-d3-tree demo** — [bkrem.github.io/react-d3-tree-demo](https://bkrem.github.io/react-d3-tree-demo/).
   Interactive collapse/expand reference for what the *finished* tree
   should look like.
3. **Sebastian Lague — "Coding Adventure: Ant and Slime Simulations"** —
   [youtube.com/@SebastianLague](https://www.youtube.com/channel/UCmtyQOKKmrMVaKuRXz02jbQ).
   Not a tree per se, but reference for how to make recursive reveals
   feel "alive" via spring + slight overshoot.

### 4.4 Schema (5 fields)

```ts
type MindMap9x16Props = {
  root: { label: string; children?: typeof root[] }; // recursive
  revealSecondsPerLevel?: number; // default 0.6
  edgeStyle?: "elbow" | "bezier";
  maxNodes?: number; // safety cap, default 16
  caption?: { text: string; audioSrc?: string };
};
```

### 4.5 Use-case examples

- "El árbol de subagentes de Claude Code" (story you specifically mentioned)
- "Categorías de skills de Anthropic en 2026"
- "Cómo se ramifica un prompt en un agente"

---

## 5. Algorithm step-through (sort / BFS / DFS / gradient descent)

### 5.1 Visual spec

This is actually two distinct sub-templates that share grammar:

**5.1a — Sort visualization** (bars + swap arcs)
- Vertical row of 8–12 horizontal bars in the middle 800px. Bar length
  proportional to value; navy fill, gold for "currently comparing", red
  for "swapping".
- Each comparison: 2 bars flash gold for 8 frames, then swap with curved
  motion (parabolic arc) over 12 frames if needed.
- Counter top-right: `swaps: N`, `comparisons: M`.

**5.1b — Graph traversal BFS/DFS** (force-graph + traversal pulse)
- Reuse §3 force-graph layout. Start node = gold pulse. BFS: ripple
  outward, frontier coloured gold, visited dimmed navy. DFS: same but
  one node at a time, dotted "current path" line drawn back to root.

**5.1c — Gradient descent** (contour + descending ball)
- 2D contour plot of a loss landscape (pre-rendered SVG of contours).
  A gold ball starts at top-right corner, hops downhill via discrete
  steps. Trace a fading trail behind.
- Counter top-right: `loss: 4.21 → 0.18`.

### 5.2 Implementation recipe

- **5.1a sort:** Pure SVG `<rect>` with `x` driven by `interpolate()` from
  current index to swap-partner index. Easiest of the three. ~200 LOC.
- **5.1b graph traversal:** Extends §3 ForceGraph9x16. Add a `traversalSequence`
  prop (precomputed BFS/DFS step list); animate node-fill timing from it. ~300 LOC.
- **5.1c gradient descent:** Pre-bake the contour SVG (export from
  matplotlib once, ship as `staticFile()`). Animate gold circle on top
  via `interpolate()` over a known descent path (also precomputed). ~250 LOC.

### 5.3 Reference videos

1. **VisuAlgo BFS/DFS** — [visualgo.net/en/dfsbfs](https://visualgo.net/en/dfsbfs).
   Reference for *frontier* visual language — gold ring around current node,
   solid fill for visited. ([Sorting visualizer](https://visualgo.net/en/sorting).)
2. **"Visualization of Quick sort (HD)"** —
   [youtube.com/watch?v=aXXWXz5rF64](https://www.youtube.com/watch?v=aXXWXz5rF64).
   30s, no audio, pure bars. This is essentially the energy of our 5.1a.
3. **Gradient Descent Viz** (lilipads) — [github.com/lilipads/gradient_descent_viz](https://github.com/lilipads/gradient_descent_viz).
   Shows 5 optimizers in parallel — bookmark for a future "Adam vs SGD"
   reel. Also [Jack McKew's 3D walkthrough](https://jackmckew.dev/3d-gradient-descent-in-python.html).

### 5.4 Schema (one per sub-template)

```ts
// 5.1a
type SortStepThrough9x16Props = {
  values: number[]; // 6–12 numbers
  algorithm: "bubble" | "insertion" | "selection"; // we render the swap sequence
  showCounters?: boolean;
  speed?: "slow" | "normal" | "fast";
  caption?: { text: string; audioSrc?: string };
};

// 5.1b
type GraphTraversal9x16Props = ForceGraph9x16Props & {
  startNode: string;
  algorithm: "bfs" | "dfs";
};

// 5.1c
type GradientDescent9x16Props = {
  contourSvgPath: string; // staticFile
  descentPath: Array<{ x: number; y: number; loss: number }>;
  caption?: { text: string; audioSrc?: string };
};
```

### 5.5 Use-case examples

- "BFS vs DFS, explicado en 20 segundos"
- "Por qué Adam le gana a SGD en 30s"
- "Cómo ordena una computadora 8 números" (kid-friendly intro)

---

## 6. State machine / finite automaton

### 6.1 Visual spec

- **Layout.** 3–6 circular states laid out around a circle or in a line.
  States are 90px-radius circles, navy fill, gold border. Accept-states
  get a second concentric gold ring (classic FA notation). Initial state
  has a thick gold arrow pointing into it from outside.
- **Edges.** Curved arrows between states, labels for each transition
  (Inter 26px, white on dark). Self-loops drawn as small circles on top of
  their state.
- **Active-state pulse.** Current state expands scale 1 → 1.2 + adds a
  gold glow (CSS `filter: drop-shadow(0 0 24px #D4AF37)`); inactive states
  fade to 60% opacity. As the input string is consumed character by
  character (one char per ~0.5s, synced to narration), the active state
  jumps; the consumed character glides from a top "input tape" into the
  current state.
- **Input tape (top).** Horizontal row of input characters at y=200, each
  in a 60×60 box. Consumed characters dim and shift left.

### 6.2 Implementation recipe

- **Library.** [`react-flow`](https://reactflow.dev/) is well-suited here —
  it gives free edge routing, custom-edge support
  ([Custom Edges](https://reactflow.dev/examples/edges/custom-edges)), and
  built-in [animated edges](https://reactflow.dev/examples/edges/animating-edges).
  But it ships with a lot of bag we won't use (handles, controls, minimap).
  For a single composition we're better off writing it ourselves in SVG
  (~350 LOC) and skipping the dep.
- For the active-pulse animation, use Remotion `spring()` keyed off the
  state-transition timeline.
- For inspiration on academic FA rendering, see the [Graphviz FA gallery](https://graphviz.org/Gallery/directed/fsm.html)
  and the [FSMIPR paper](https://arxiv.org/html/2409.17207v1) (auto-animated FSMs).

### 6.3 Reference videos

1. **VisuAlgo (general approach)** — same shop as §5; their active-node
   pulse + dimmed-rest pattern is the model. [visualgo.net](https://visualgo.net/en).
2. **FSMIPR demo (paper)** — [arxiv:2409.17207](https://arxiv.org/html/2409.17207v1).
   First reference for "input tape + active-state highlight + step-pulse"
   pattern done in academic motion.
3. **Stateflow live animation (MATLAB)** — [mathworks.com/help/stateflow/gs/get-started-introduction.html](https://www.mathworks.com/help/stateflow/gs/get-started-introduction.html).
   Visual reference for active-state glow.

### 6.4 Schema (6 fields)

```ts
type StateMachine9x16Props = {
  states: Array<{ id: string; label: string; accept?: boolean }>;
  initial: string;
  transitions: Array<{ from: string; to: string; on: string }>;
  input: string; // consumed character by character
  charDurationSeconds?: number; // default 0.5
  caption?: { text: string; audioSrc?: string };
};
```

### 6.5 Use-case examples

- "Cómo entiende una máquina si tu password es válido"
- "Un agente como máquina de estados: pensar → actuar → observar → pensar"
- "Regex animado: por qué `a*b` acepta 'aaab'"

---

## 7. Control-flow diagram (branches + loops)

### 7.1 Visual spec

- **Layout.** Vertical flow top-to-bottom, similar to our existing
  `DiagramExplainer9x16` but with **branching**. Diamonds for decisions,
  rectangles for actions, small filled circles for `start` / `end`.
- **Branches.** A diamond emits two arrows: left labelled "no", right
  labelled "yes" (or "false"/"true"). Branches re-merge at a later node
  (or terminate independently).
- **Loops.** Drawn as a back-edge — a curved arrow that goes from a node
  back to an earlier node, drawn with a *dashed* stroke (3px dashes) to
  distinguish from forward flow.
- **Active-path highlight.** As code "executes," the currently-traversed
  edge thickens to 4px gold for ~0.4s. Visited nodes get a subtle gold
  bottom-border tick; non-visited stay greyed.

### 7.2 Implementation recipe

- **Layout engine.** We need automatic vertical layout with branch + merge
  detection. Three options:
  - **`elkjs`** (Eclipse Layout Kernel ported to JS): heavy (700 KB),
    overkill, but layouts CFGs cleanly. Skip unless we add this template
    to the core set.
  - **`dagre`**: long-time React-Flow companion, layered DAG layout. SSR-safe.
    Recommended.
  - **Hand-authored layout in the template JSON.** Most reliable. The
    author specifies `{x, y}` per node and we just render. For a small
    template set (8 templates × 1 layout each) this is fine.
- **Recommendation.** Ship hand-authored coordinates first; add `dagre`
  later if user complaints accumulate.
- **Complexity.** Medium. ~400 LOC.
- Background reading on CFGs: [Wikipedia](https://en.wikipedia.org/wiki/Control-flow_graph),
  [GeeksForGeeks](https://www.geeksforgeeks.org/software-engineering/software-engineering-control-flow-graph-cfg/),
  [Tutorials Point](https://www.tutorialspoint.com/compiler_design/compiler_design_control_flow_graph.htm).

### 7.3 Reference videos

1. **Computerphile** — [youtube.com/user/Computerphile](https://www.youtube.com/user/Computerphile).
   They use hand-drawn-style CFGs constantly; reference for label
   placement and arrow weight.
2. **Fireship** — [youtube.com/c/Fireship](https://www.youtube.com/c/Fireship)
   ([fireship.dev](https://fireship.dev/)). Reference for *pacing* — his
   100-second-of-X explainers cram 6–10 flowchart frames into a minute
   without losing clarity.
3. **CFG primer video** — [Medium walkthrough by Can Özkan](https://can-ozkan.medium.com/demystifying-control-flow-graphs-cfg-in-software-engineering-a4203279b7a5).
   Static reference for if/else and while-loop CFG shapes; we replicate
   these shapes 1:1.

### 7.4 Schema (6 fields)

```ts
type ControlFlow9x16Props = {
  nodes: Array<{
    id: string;
    kind: "start" | "end" | "action" | "decision";
    label: string;
    x: number; y: number; // hand-authored
  }>;
  edges: Array<{ from: string; to: string; label?: string; backEdge?: boolean }>;
  executionPath?: string[]; // node-id sequence for the highlight animation
  stepSeconds?: number; // default 0.5
  caption?: { text: string; audioSrc?: string };
};
```

### 7.5 Use-case examples

- "Cómo funciona realmente un `for` loop"
- "El flujo de un retry exponencial"
- "Por qué tu agente entra en un infinite loop"

---

## 8. Token streaming visualization (LLM)

### 8.1 Visual spec

- **Two-zone layout.**
  - **Top zone (y=200 to y=900):** the growing output. Tokens appear one
    by one, monospace `JetBrains Mono` 44px (or Inter Mono fallback),
    centered. New token enters with 6-frame fade-in + 6-frame scale 1.2→1
    spring. The most-recent 1–2 tokens are highlighted gold (`#D4AF37`)
    then settle to white as the next token arrives.
  - **Bottom zone (y=1000 to y=1500):** a compact attention strip — a
    horizontal row of recently-attended *input* tokens. The current output
    token draws a 2px-gold arc (quadratic bézier) down to the input token
    it attended-to-most.
- **Caret.** Blinking gold underscore at insertion point, classic
  typewriter affordance.
- **Token rate.** ~5–8 tokens/sec (3.75–5 frames per token at 30fps),
  matching the actual LLM-streaming feel. Don't go faster — readers can't
  parse it.
- **End state.** Pause on the full text for ~2s, then the attention strip
  fades and the full text re-centers as the closing beat.

### 8.2 Implementation recipe

- **Pure Remotion** — no library needed. The typewriter effect is a couple
  of `interpolate()` calls per token. The attention arc is one `<path>`
  per output token, animated stroke-dasharray.
- **Reference libraries (for inspiration, not deps):**
  - [`flowtoken`](https://github.com/Ephibbs/flowtoken) — React lib for
    LLM-streaming UI animations (fade, blur, slide, etc.). Their easing
    curves and durations are well-tuned; copy the values.
  - [`TypeIt` + React](https://macarthur.me/posts/streaming-text-with-typeit/)
    — production typewriter implementation. Good for reading their
    *cursor-positioning* tricks.
- **Optional polish.** A faint "token-cost" counter in the corner (small
  Inter 24px gold): `tokens: 47 / cost: $0.0008`. Pure decoration — adds
  legitimacy for tech audiences.

### 8.3 Reference videos

1. **AnimatedLLM demo** — [animatedllm.github.io](https://animatedllm.github.io/)
   ([paper](https://arxiv.org/html/2601.04213v2)). Best-in-class teaching
   visualization for token-by-token generation with attention overlay.
   Their "input-token strip + output-token reveal + arc-between" is
   exactly the design we should ship.
2. **Transformer Explainer** — [poloclub.github.io/transformer-explainer](https://poloclub.github.io/transformer-explainer/)
   ([CHI'26](https://dl.acm.org/doi/10.1145/3772318.3791725)). Interactive
   live token generation; record a screen capture and study the
   timing/easing.
3. **Two Minute Papers — "How Do Neural Networks See The World?"** —
   [youtube.com/watch?v=1zvohULpe_0](https://www.youtube.com/watch?v=1zvohULpe_0).
   Not strictly token-stream, but reference for *narration-locked* reveal
   pacing.

### 8.4 Schema (6 fields)

```ts
type TokenStream9x16Props = {
  inputTokens: string[];        // shown in bottom strip
  outputTokens: string[];       // revealed one by one
  attentionTopK?: number[];     // per output token, index into inputTokens
  tokensPerSecond?: number;     // default 6
  showCostCounter?: boolean;    // default false
  caption?: { text: string; audioSrc?: string };
};
```

### 8.5 Use-case examples

- "Esto es lo que pasa cuando le escribes a ChatGPT"
- "Por qué los LLMs son token-by-token y no de golpe"
- "Cuánto cuesta una respuesta de Claude Opus, token por token"

---

## 9. NeuralNetwork9x16 — detailed build spec (this wave)

This is the composition shipping in Wave-1. Specs are explicit so it can be
built without further interpretation.

### 9.1 Composition metadata

- **id:** `NeuralNetwork9x16`
- **fps:** 30
- **width:** 1080
- **height:** 1920
- **durationInFrames:** computed as `enterFrames + layers.length * 18 + holdFrames + outroFrames` (default ~18s = 540 frames)
- **schema:** see `NeuralNetwork9x16Props` in §1.4

### 9.2 Final default props

```ts
{
  layers: [
    { neurons: 6, label: "input" },     // e.g. pixels / features
    { neurons: 8, label: null },        // hidden 1
    { neurons: 4, label: "output" },    // e.g. classes
  ],
  activationPath: [2, 5, 1],            // which neuron pulses brightest per layer
  edgeWeights: "random-seeded",         // deterministic from seed
  wavefrontSecondsPerLayer: 0.6,
  caption: { text: "Una neurona, un peso, una decisión.", audioSrc: undefined },
}
```

### 9.3 Layout math

- Layer y-positions: `[380, 760, 1140]` for a 3-layer default. For N layers,
  evenly distribute over y ∈ [380, 1140].
- Neuron x-positions per layer: centered on x=540, spacing 110px.
- Max neurons per layer = 10 (above this they crowd). Add a soft
  warning in the component if exceeded.

### 9.4 Color & stroke palette

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0F1B2D` | full-frame background |
| `node-inactive-fill` | `#0F1B2D` | inside circle, matches bg |
| `node-stroke` | `#D4AF37` | 3px |
| `node-active-fill` | `#D4AF37` | pulsed neuron |
| `node-active-text` | `#0F1B2D` | inside-active label |
| `edge-default` | `rgba(255,255,255,0.08)` | 1px |
| `edge-active-positive` | `#D4AF37` | 3px during pulse |
| `edge-active-negative` | `#E5484D` | 3px during pulse (red) |
| `label-text` | `#FFFFFF` | Inter 30px |
| `section-label` | `#D4AF37` | Inter 24px tracking-wider uppercase |

### 9.5 Motion timeline (default 18s clip)

| Frame | Time | Event |
|---|---|---|
| 0–30 | 0–1s | Background + BrandBreadcrumb + section label fade-in |
| 30–60 | 1–2s | Layer 1 (input) circles spring in from below; labels fade |
| 60–78 | 2–2.6s | Wavefront pulse layer 1 → edges to layer 2 light up |
| 78–96 | 2.6–3.2s | Layer 2 (hidden) circles spring in |
| 96–114 | 3.2–3.8s | Wavefront pulse layer 2 → edges to layer 3 light up |
| 114–132 | 3.8–4.4s | Layer 3 (output) circles spring in; winning class circle stays gold |
| 132–420 | 4.4–14s | Hold + EditorialCaption strip narration |
| 420–540 | 14–18s | Outro: full network fades to 60%, gold check-mark or "ANSWER: cat" label fades in over output |

### 9.6 Pseudocode skeleton

```tsx
export const NeuralNetwork9x16: React.FC<Props> = ({ layers, activationPath, edgeWeights, wavefrontSecondsPerLayer, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = getPalette(); // from src/brand

  const nodes = useMemo(() => computeNodePositions(layers), [layers]);
  const edges = useMemo(() => computeEdges(nodes, edgeWeights), [nodes, edgeWeights]);

  return (
    <AbsoluteFill style={{ background: palette.backgroundDark }}>
      <BrandBreadcrumb />
      <SectionLabel>RED NEURONAL</SectionLabel>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {/* edges UNDER nodes */}
        {edges.map((e) => (
          <NeuralEdge
            key={e.id}
            edge={e}
            frame={frame}
            fps={fps}
            wavefrontFrame={enterFrames + e.fromLayer * (wavefrontSecondsPerLayer * fps)}
          />
        ))}
        {nodes.map((n) => (
          <NeuralNode
            key={n.id}
            node={n}
            frame={frame}
            fps={fps}
            enterFrame={enterFrames + n.layer * (wavefrontSecondsPerLayer * fps)}
            isActive={activationPath?.[n.layer] === n.indexInLayer}
          />
        ))}
      </svg>

      <EditorialCaption text={caption?.text} audioSrc={caption?.audioSrc} />
    </AbsoluteFill>
  );
};
```

### 9.7 Testing notes

- Snapshot test 4 frames: 30 (header in), 90 (layer 2 pulsing), 132 (layer 3
  reveal), 420 (outro start).
- Visual regression: compare against a fixed seeded `edgeWeights="random-seeded"`.
- Performance: avoid `<filter>` SVG drop-shadows on more than 4 nodes
  simultaneously — Chrome filter perf is the usual frame-time killer
  inside Remotion.

---

## 10. Build-priority ranking for the other 7

Ranking is based on **(a)** how often the brand's content calendar likely
calls for it, **(b)** implementation cost, and **(c)** how different the
visual is from what we already ship.

| Rank | Template | Why now (or why later) | Est. effort |
|---|---|---|---|
| **1** | **§8 TokenStream9x16** | LLM-token reveal is the single most repeatable visual for the AI-news beat we publish (Gemini leak, GPT releases, Claude model launches). Cheap to build — no new libs. | 1–1.5 days |
| **2** | **§2 AttentionHeatmap9x16** | Pairs with TokenStream as a "and here's *why*" follow-up. Also cheap (pure SVG grid). Visually distinct from anything else in the set — different geometry (square grid) reads instantly as "matrix" / "attention." | 1 day |
| **3** | **§3 ForceGraph9x16** | Highest visual payoff per second; ecosystem-map reels travel well on Reels. But the most expensive of the three (d3-force + seeded RNG + deterministic layout pass) and easy to get *wrong* (cluttered graphs read as noise). Build third, plan for two iteration passes. | 2–3 days |
| 4 | §4 MindMap9x16 | Useful for the "Claude Code subagent tree" narrative and structural explainers; cheap (`d3-hierarchy`), and reuses many props from a future ForceGraph. | 1–1.5 days |
| 5 | §5 (Sort/BFS/GradientDescent) | High educational value but narrower content fit. Recommend shipping *only* §5.1b (graph traversal) first as it reuses ForceGraph9x16. Defer sort + gradient-descent to Wave 3. | 1 day (only 5.1b) |
| 6 | §6 StateMachine9x16 | Niche. Specific to agent-architecture or regex stories; nice-to-have. | 1.5–2 days |
| 7 | §7 ControlFlow9x16 | Lowest priority — we already have `DiagramExplainer9x16` which covers ~70% of the linear-flow use case. Build only when a story specifically needs branches + loops (e.g. "why your agent infinite-loops"). | 2 days |

**Three-template Wave-2 recommendation:** ship NeuralNetwork9x16 (this
wave), then TokenStream9x16 + AttentionHeatmap9x16 as a paired drop next
wave. Together they form a coherent "inside an LLM" trilogy and unlock the
densest cluster of content we publish.

---

## Appendix A — Sources

### Channels & creators

- [3Blue1Brown YouTube](https://www.youtube.com/c/3blue1brown) — animation language reference
- [3Blue1Brown: Neural Networks (Manning)](https://www.manning.com/livevideo/3blue1brown-neural-networks)
- [How I animate 3Blue1Brown (Substack)](https://3blue1brown.substack.com/p/how-i-animate-3blue1brown)
- [Two Minute Papers](https://www.youtube.com/channel/UCbfYPyITQ-7l4upoX8nvctg) — narration-locked pacing
- [Reducible](https://www.youtube.com/channel/UCK8XIGR5kRidIw2fWqwyHRA) — CS-concept animation
- [Welch Labs](https://www.youtube.com/channel/UConVfxXodg78Tzh5nNu85Ew) — math + ML hybrid drawing/Manim
- [Spanning Tree (Brian Yu)](https://www.youtube.com/spanningtree) — tree + recursion visuals
- [Sebastian Lague](https://www.youtube.com/channel/UCmtyQOKKmrMVaKuRXz02jbQ) — simulation polish
- [Computerphile](https://www.youtube.com/user/Computerphile) — CFG / hand-drawn aesthetic
- [Fireship](https://www.youtube.com/c/Fireship) — pacing reference for short-form tech

### Libraries

- [ManimML (helblazer811)](https://github.com/helblazer811/ManimML) · [PyPI](https://pypi.org/project/manim-ml/) · [paper arXiv:2306.17108](https://arxiv.org/html/2306.17108v1)
- [Manim Community](https://www.manim.community/)
- [d3-force](https://github.com/d3/d3-force) · [D3 in Depth: Force layout](https://www.d3indepth.com/force-layout/)
- [d3-hierarchy (tree layout)](https://github.com/d3/d3-hierarchy)
- [react-force-graph (vasturiano)](https://github.com/vasturiano/react-force-graph) · [npm](https://www.npmjs.com/package/react-force-graph)
- [cytoscape.js](https://js.cytoscape.org/) · [SSR issue #954](https://github.com/cytoscape/cytoscape.js/issues/954) · [WebGL preview blog](https://blog.js.cytoscape.org/2025/01/13/webgl-preview/)
- [vis-network](https://www.npmjs.com/package/vis-network) · [SSR issue #2195](https://github.com/visjs/vis-network/issues/2195)
- [react-d3-tree](https://github.com/bkrem/react-d3-tree) · [demo](https://bkrem.github.io/react-d3-tree-demo/) · [npm-compare vs react-arborist / react-treebeard](https://npm-compare.com/react-arborist,react-d3-tree,react-treebeard)
- [react-flow — animating edges](https://reactflow.dev/examples/edges/animating-edges) · [custom edges](https://reactflow.dev/examples/edges/custom-edges) · [animated SVG edge](https://reactflow.dev/ui/components/animated-svg-edge)
- [Motion (formerly framer-motion)](https://motion.dev/docs/react) · [SVG animation](https://motion.dev/docs/react-svg-animation)
- [flowtoken (Ephibbs)](https://github.com/Ephibbs/flowtoken) — LLM token-streaming UI
- [TypeIt + React (Alex MacArthur)](https://macarthur.me/posts/streaming-text-with-typeit/)
- [NN-SVG (alexlenail)](https://github.com/alexlenail/NN-SVG)
- [Animated SVG neural network example (CodePen)](https://codepen.io/leimapapa/pen/WNQvLMq)
- [Gradient Descent Viz (lilipads)](https://github.com/lilipads/gradient_descent_viz)
- [BertViz (jessevig)](https://github.com/jessevig/bertviz) · [Medium walkthrough](https://medium.com/@GaryFr0sty/visualize-attention-scores-of-llms-with-bertviz-3deb94b455b3)

### Visualization tools / papers

- [Distill.pub](https://distill.pub/) · [Visualizing Weights](https://distill.pub/2020/circuits/visualizing-weights/) · [Understanding Convolutions on Graphs](https://distill.pub/2021/understanding-gnns/)
- [AnimatedLLM demo](https://animatedllm.github.io/) · [arXiv:2601.04213](https://arxiv.org/html/2601.04213v2)
- [AttentionViz](https://catherinesyeh.github.io/attn-docs/) · [arXiv:2305.03210](https://arxiv.org/pdf/2305.03210)
- [Transformer Explainer (CHI 2026)](https://dl.acm.org/doi/10.1145/3772318.3791725)
- [VisuAlgo (algorithms)](https://visualgo.net/en) · [BFS/DFS](https://visualgo.net/en/dfsbfs) · [Sorting](https://visualgo.net/en/sorting) · [MST](https://visualgo.net/en/mst)
- [Graphviz finite-automaton gallery](https://graphviz.org/Gallery/directed/fsm.html)
- [FSMIPR paper](https://arxiv.org/html/2409.17207v1)
- [Karpathy nanoGPT](https://github.com/karpathy/nanogpt) · [Zero to Hero](https://karpathy.ai/zero-to-hero.html) · [build-nanogpt](https://github.com/karpathy/build-nanogpt)
- [DAAM (Diffusion attention maps)](https://github.com/castorini/daam)
- [Control-flow graph — Wikipedia](https://en.wikipedia.org/wiki/Control-flow_graph) · [GeeksForGeeks CFG](https://www.geeksforgeeks.org/software-engineering/software-engineering-control-flow-graph-cfg/)

### Remotion docs

- [The Fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [interpolate()](https://www.remotion.dev/docs/interpolate)
- [spring()](https://www.remotion.dev/docs/spring)
- [Animating properties](https://www.remotion.dev/docs/animating-properties)
- [SSR APIs (Node)](https://www.remotion.dev/docs/ssr-node) · [SSR legacy](https://www.remotion.dev/docs/ssr-legacy)
- [Supporting multiple fps](https://www.remotion.dev/docs/multiple-fps)

### Engagement / short-form
- [Instagram Reels Algorithm 2026 (SocialPilot)](https://www.socialpilot.co/blog/instagram-reels-algorithm)
- [Social Media Attention Span Stats 2026 (SQ Magazine)](https://sqmagazine.co.uk/social-media-attention-span-statistics/)
