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
