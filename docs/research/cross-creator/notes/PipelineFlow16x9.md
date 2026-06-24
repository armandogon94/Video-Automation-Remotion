# PipelineFlow16x9 ↔ natebjones

**Creator pattern:** Nate B Jones H7 / `FourStageHorizontalFlowDiagram` (ANALYSIS-VOTE2 §3.2 anim-02, Pattern #4).
**Reference frames (FRESH — these literally show the graphic):**
- `references/creators/natebjones/_fresh/frame-005.jpg` — FIND·Materials → SAVE·Originals → MAP·Inventory (3 cards, blue/teal/orange).
- `references/creators/natebjones/_fresh/frame-006.jpg` / `frame-007.jpg` — same, with the centered caption pill below ("First find, preserve, **inventory**, then synthesize" — keyword tinted).
- `references/creators/natebjones/_fresh/frame-012.jpg` — AGENT·Source View → HUMAN·Correct It → DRAFT·Safer Work (blue/orange/green).
- Reference clip: `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-02-v2.mp4` (Weights→Runtime→Endpoint→Tools, 4 cards).

## Signature pattern (Nate's card anatomy — exact)
A horizontal row of rounded-rect cards reveal LEFT→RIGHT, each with a chevron/arrow drawn between after both adjacent cards land. **Each card carries a precise 3-line stack:**
1. small **uppercase tracking-spaced KICKER** at top, in the card's accent color, muted (FIND/SAVE/MAP; AGENT/HUMAN/DRAFT; MODEL/SERVE/API/USE);
2. bold **WHITE headline word** (Materials/Originals/Inventory);
3. small **muted subline in the card's accent color** (all sources / preserve / before draft).
Each card has its **OWN accent color** keying the **border + faint inner glow + kicker + subline** (blue / teal-green / orange / gray). A centered caption pill below fades in last with ONE keyword tinted.

## What matched BEFORE this pass
- L→R sequential card reveal + chevron connectors that enter after the next card lands; emphasis pill below with one keyword tinted orange ("normal"). Motion grammar = faithful.
- Rounded cards on dark slate, persistent handle chip + avatar watermark lower-right, top-left breadcrumb, centered section label ("THE PIPELINE").
- Verified across 4 frames (t=0.7/1.6/2.6/4.0s): 1 card → 2 cards+chevron → 4 cards+3 chevrons+pill-mid-fade → full + pill at full opacity. Correct beat ordering.

## Gaps found (skeptical compare vs _fresh frames) — and the fix
The card ANATOMY diverged from Nate's in 4 specific ways, all of which read as "uniform-blue terminal cards" instead of Nate's color-coded editorial flow:
1. **No kicker label.** Nate ALWAYS has the uppercase category label (FIND/SAVE/MAP). Ours had only headline+body. ← biggest single gap.
2. **Headline was blue (accent), not white.** Nate reserves accent for kicker/subline/border; the headline is white. Our blue headline flattened the hierarchy.
3. **Uniform border color.** All four of our cards shared one blue border; per-card color lived only in a tiny corner dot. Nate gives each card a distinct border hue.
4. **Subline was neutral gray**, not the card's accent color.

### IMPROVED (minimal, self-contained edit to `src/compositions/PipelineFlow16x9.tsx` only)
Reworked the `StageCard` molecule + `stageSchema` (no shared molecule, no Root/index, no props json touched):
- Introduced a single per-card `cardAccent = stage.color || KIND_COLORS[stage.kind]` that now keys the **border + faint inner-glow shadow + kicker + subline + corner dot** → cards are color-coded (INPUT=red, AGENT=indigo, TOOL=teal, OUTPUT=gold), echoing Nate's blue/teal/green/orange row.
- **Headline → white** (`#FFFFFF` on dark; palette ink on light). `stage.color` override still wins if a caller explicitly sets a headline tint.
- Added an **uppercase tracking-spaced KICKER** line above the headline; new optional `kicker` schema field (`.default("")`, Zod-safe) falls back to the uppercased `kind` so every card carries a label like Nate's.
- **Subline → accent-tinted muted** (`${cardAccent}D0` on dark) instead of flat gray.
- Back-compat preserved for the `PipelineFlow16x9N3` (N=3) registration in Root.tsx; `getBodyTextColor` import kept live for light-palette sublines.

Typecheck: clean (only preexisting `tsconfig baseUrl` TS5101 deprecation, unrelated). Re-rendered via `runCrossCreatorReplicas.ts PipelineFlow16x9`; re-extracted 4 frames — kicker/white-headline/per-card-border/accent-subline all landed, motion + pill timing unchanged (no regression).

## Residual differences (deliberate brand/template choices — NOT fixed)
- **Headline font is monospace (Fira Code)** vs Nate's proportional bold sans. This is the template's established "typed pipeline" identity (shared with `PipelineFlow9x16`); swapping the font family is a larger identity change than this QA pass warrants. Mono headlines are legitimately idiomatic for AI-infra content. Left as-is.
- **Chevron connectors are bright blue accent** vs Nate's subtler neutral-gray arrow. On-brand and legible; left as-is.
- Flat brand-navy slate vs Nate's near-neutral radial charcoal — the documented intentional brand divergence, owned by the shared `DarkSlateChassis16x9` (not this comp).

## Verdict
**IMPROVED.** Closed the single biggest fidelity gap — card anatomy now matches Nate's kicker→white-headline→accent-subline stack with per-card color-coded borders. Faithful capture of H7 `FourStageHorizontalFlowDiagram`.

**Score: 7/10 → 9/10** after the edit.

## Recommendation (optional, not made — shared/identity scope)
If a future "Nate-exact" variant is wanted, add a `headlineFont: "mono" | "sans"` prop so the headline can switch to a proportional bold sans (Inter) to fully match Nate's editorial type, while keeping mono as the default template identity. Not a defect; deferred (touches template identity, out of scope for a minimal QA edit).
