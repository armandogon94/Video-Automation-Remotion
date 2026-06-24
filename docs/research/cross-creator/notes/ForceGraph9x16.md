# ForceGraph9x16 ↔ adamrosler

**Creator pattern:** *AutonomousSystemGraph* — a role-colored force/node-edge graph on a
dark background.

**Reference frames:**
- `references/creators/adamrosler/I9pjllzSNK0/frames/frame-029.jpg` — "ROUTES REWRITTEN"
  BGP graph: circular **glowing nodes**, each filled with a **role color** (gold =
  your-ISP/source, red = transit/hijacker, teal = Google/destination); monospace UPPERCASE
  id INSIDE each node (`AS7007`) + a small muted role caption BELOW (`YOUR ISP`, `TRANSIT`,
  `HIJACKER`, `GOOGLE`); thin colored edges with directional arrowheads in an organic layout.
- `references/creators/adamrosler/7RhJawm2nw4/frames/frame-038.jpg` — neural-net node graph:
  blue glowing nodes with `INPUT`/`OUTPUT` flank labels; during backprop, nodes flip to
  green (active) / red (error). Same glowing-node + role-color grammar.

**Signature traits:** organic (non-grid) node layout · glowing **filled** nodes colored by
role/group · id label IN the node + role caption below · thin colored edges (often arrowed)
· one emphasized node.

## What matches
- Organic force layout (real `d3-force`, SSR-safe, deterministic) with a weighted focus node
  — structurally the right engine and grammar.
- Focus node gets accent fill + a **pulsing glow ring** — matches adamrosler's
  "one emphasized glowing node."
- Edge "draw-on" (stroke-dashoffset) staggered after node settle — clean reveal motion.
- Per-node `group` → role-color mapping IS supported in the template
  (`GROUP_PALETTE_DARK/CREAM`).

## What differs
- **Palette:** cross-creator render uses brand cream (Root `ForceGraph9x16` defaultProps set
  `palette: "cream"`; the comp's own schema actually defaults to `dark`). Brand-driven, not
  a template flaw — there is a `ForceGraph9x16Dark` registration that renders on dark.
- **Hollow satellites:** adamrosler fills EVERY node with a role color; ours leaves
  non-focus nodes hollow (paper fill + accent stroke) because the demo `nodes` carry no
  `group`. This is a content/props gap, not a template defect — supply `group` per node and
  they fill.
- **Label collisions:** with the dense default ecosystem graph the below-node labels overlap
  the large focus disc (`Claude`/`MCP` sit over the green node). adamrosler avoids this by
  putting the id INSIDE the node. This is a genuine legibility weakness on dense graphs.

## Decision
**VALIDATED — no edit.** The structural + motion grammar (force layout, glowing focus node,
staggered edge-draw, role-color support) is faithful. The two real gaps (hollow satellites,
below-node label collisions) are driven by content/props (no `group`, dense default graph)
rather than the template, and the safe fix (in-node id labels) risks regressing other
content that relies on below-node labels — better left as a recommendation than a blind edit.

**Recommendations (not made):**
- For adamrosler-style renders, pass `group` on every node so satellites fill with role
  colors, and consider an in-node short-id label variant to eliminate label/disc collisions
  on dense graphs.

**Score: 7/10** — VALIDATED. Right engine and motion; distance to reference is palette
(brand-driven) + un-grouped hollow nodes + below-node label crowding (content-driven).

---

## DEEP PASS 2 (adamrosler-diagrams cluster) — IMPROVED (closed palette + hollow-node gaps)

Re-confirmed the signature from FRESH neural-net frames
(`references/creators/adamrosler/7RhJawm2nw4/_fresh/frame-020.jpg`, `frame-038.jpg`):
black bg · SATURATED, GLOWING, FILLED role-colored discs · one emphasized hero node ·
thin edges. The prior pass left palette + hollow-nodes as recommendations because the
cream came from Root.tsx (not editable). The lever: the props JSON + the comp's OWN
`GROUP_PALETTE_DARK` constant (both mine).

**The cream/hollow render had 3 severe gaps (all visible @1.6/4.6s):** cream bg vs black;
non-focus nodes were thin hollow green outlines (no `group` in demo data); single-hue.

**Changes (minimal, high-confidence; copy unchanged):**
1. NEW `docs/research/cross-creator/props/ForceGraph9x16.json` (mine) — same Claude-ecosystem
   nodes/edges/labels verbatim from Root.tsx, but `palette: "dark"`, `subjectTool: ""`
   (frees the accent to the dark-palette GOLD #D4A04A so the focus disc reads as the
   adamrosler gold hero node), and a `group` on every satellite so they fill with role
   colors. `subjectTool: ""` (not omitted) is required because the runner shallow-merges
   the JSON over Root.tsx defaultProps, which pin `subjectTool: "claude-code"`.
2. `src/compositions/ForceGraph9x16.tsx` (mine):
   - `GROUP_PALETTE_DARK`: replaced the too-dim deep-brown/sage fills (low-contrast on the
     #0A0F1A paper) with SATURATED luminous role colors (gold/teal/mauve/coral/steel-blue)
     so grouped nodes read as glowing discs. `GROUP_PALETTE_CREAM` untouched.
   - Filled nodes (focus or grouped) get the existing `fg-pulse-glow` soft-glow filter on
     dark only; hollow paper nodes stay crisp. Makes nodes luminous like his.

**Re-rendered + re-extracted @0.3/1.6/4.6s — confirmed:** black bg, gold glowing hero
"Claude" disc + gold pulse ring, role-colored glowing satellites (gold/teal/magenta/coral),
white headline + node labels, thin edges. Force layout + edge-draw + pulse motion intact;
no regression. `tsc --noEmit` clean for this comp.

**Updated score: 9/10** — IMPROVED. Faithful adamrosler node-graph surface + glowing
role-colored filled discs + emphasized hero node. Remaining 1pt: labels still sit BELOW
nodes and lightly crowd dense discs; adamrosler puts the id INSIDE the node. Left as a
recommendation (an in-node-id variant) rather than a blind structural edit that could
regress other ForceGraph content relying on below-node labels.

**Verdict: IMPROVED (pass 2)** — dark surface + per-node role groups via props JSON +
brightened `GROUP_PALETTE_DARK` + node glow; gold glowing hero disc.
