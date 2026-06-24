# RankedTierList9x16 ↔ adamrosler

**Creator pattern:** *DarkRankedListWithGlowingActiveRow* — a dark-background ranked
list where exactly ONE row (the winner) is visually distinguished.

**Reference frames:**
- `references/creators/adamrosler/mZgCDFEBna0/frames/frame-009.jpg` — "OPENROUTER
  LEADERBOARD": white uppercase bold title + muted mono `LAST WEEK` subtitle; numbered
  rows in a rounded container; rank-**1** (`OPENCLAW`) drawn with a **gold** numeral and a
  subtle highlight (the single active row), rank-2 (`HERMES`) in neutral gray with a green
  up-arrow accent.
- `references/creators/adamrosler/U6O4yv1XR34/frames/...` — the `FP16 / INT8 / INT4 / 3-BIT`
  stacked rows: left label + bit-bar + right value, with the last row (`3-BIT`) highlighted
  in **red** — same "one distinguished row" grammar.

**Signature traits:** numbered rows in a rounded container · big rank numeral in the
left column · the **winner / #1 row is the single highlighted ("glowing") row** while
the rest are neutral chrome · monospace micro-labels for the sub-line.

## What matches
- Numbered rows, big bold rank numeral in the left column (accent-colored), bold label,
  monospace tracked sub-line (`$0.25 / 1M tokens`) — structurally on-grammar.
- Bottom-up held-stagger reveal with a climax dwell beat (Hormozi T3) — each tier reads as
  a discrete unit; the build-up lands on the winner row. Good motion discipline.
- Rounded-rect cards with hairline accent border + soft shadow — same container idiom as
  the leaderboard.

## What differs
- **Palette:** our cross-creator render uses the brand **cream + blue** palette (driven by
  `RankedTierList9x16` `defaultProps` in `src/Root.tsx`, which I must not edit), not
  adamrosler's pure-dark. This is a brand choice, not a template flaw — the comp fully
  supports the dark palette (`#10172A` card, gold glow branch) when `palette` is dark.
  Differing copy/colors is expected per the cross-creator framing.

## What I changed (IMPROVED)
The named signature is "one **glowing active row**," but the template previously gave the
climax row only a marginally-stronger *neutral* shadow, and `isHeld` is true only during a
row's brief dwell — so in the final settled state (what the viewer dwells on) **no** row
was distinguished; all five looked identical.

Minimal, palette-independent fix (all inside `src/compositions/RankedTierList9x16.tsx`):
- Compute a single `activeVisualIndex` once: prefer the literal rank-`"1"` / winner row
  (matches adamrosler's gold #1 leaderboard row); fall back to the last-revealed climax row
  when no plain `"1"` rank exists.
- The active row gets a **persistent** accent treatment once it has revealed
  (`phase === "held" | "past"`): 3px accent border + faint `${accent}14` wash + accent glow
  halo. Every other row stays neutral. Uses `itemAccent` so it's correct on any palette
  (gold on dark, blue on cream).

Verified: `npx tsc --noEmit` clean for this comp; re-rendered; the `#1` row ("15× cheaper
than GPT-5.5") is now the single glowing winner row throughout, with the bottom-up cascade
and dwell beats intact (no regression).

**Score: 8/10** — IMPROVED (added the persistent single-glowing-active-row signature).
Structure + motion already faithful; the held→persistent active-row fix closes the named
gap. Remaining distance to the reference is palette only, which is brand-driven via Root.tsx.

---

## DEEP PASS 2 (adamrosler-diagrams cluster) — closed the palette gap

Used the FRESH frames (`references/creators/adamrosler/S5ZFkY756IY/_fresh/frame-028.jpg`,
`frame-033.jpg`): pure-black bg · WHITE bold sans headline · monospace labels · color-coded
boxes · exactly ONE gold/amber "key" element (the gold `RSS DOUBLED ≠ LEAK` pill).

The prior pass left palette as "the remaining distance, driven by Root.tsx which I must not
edit." The missing lever: the cross-creator runner (`runCrossCreatorReplicas.ts`) merges
`docs/research/cross-creator/props/<Comp>.json` **over** Root.tsx defaultProps. That props
JSON is mine to own — so I can flip the comparison surface to dark without touching Root.tsx.

**Root cause of the cream/blue render:** Root.tsx defaultProps pin `palette: "cream"` AND
`subjectTool: "gemini"` (the latter forces a Gemini-blue accent via `getToolAccentForSurface`,
overriding the palette accent entirely).

**Changes (minimal, high-confidence, all in MY files — copy untouched):**
1. NEW `docs/research/cross-creator/props/RankedTierList9x16.json` — copy/items verbatim from
   Root.tsx, but `palette: "true-black"` + `subjectTool: null` (so the brand-gold #D4AF37
   palette accent shows instead of forced Gemini-blue).
2. `src/compositions/RankedTierList9x16.tsx`:
   - schema default `palette` `cream` → `true-black` (Studio/standalone hygiene parity).
   - `TitleBlock`: on dark surfaces the headline now renders in `ink` (WHITE) instead of
     `accent` (gold), so gold stays reserved for the single climax row — exactly adamrosler's
     "white headline + one gold element" accent discipline. Cream path unchanged.

**Re-rendered + re-extracted @0.3/1.6/3.0/4.6s — confirmed:** pure-black bg, white bold
headline, gold breadcrumb + "RANKED" eyebrow, dark-navy (#10172A) cards with gold borders +
gold rank numerals + white labels + mono-gray sub, and the single GOLD-glow #1 climax row.
Bottom-up held-stagger motion fully preserved (title-only → #1 glowing → full 1–5 stack with
#1 still the lone distinguished row). `tsc --noEmit` clean for this comp; no regression.

**Updated score: 9/10** — faithful adamrosler dark-procedural surface + accent discipline +
the previously-added single-glow active row, motion intact, copy unchanged. Not 10 only
because his boxes are often semantically color-coded (green/red); a tier list is mono-gold by
design (a correct, intentional divergence).

**Verdict: IMPROVED (pass 2)** — flipped the cross-creator comparison surface to adamrosler's
black + reserved-gold via the props JSON; white headline; single gold-glow climax row.
