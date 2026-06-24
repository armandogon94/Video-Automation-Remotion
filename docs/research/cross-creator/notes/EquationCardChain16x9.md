# EquationCardChain16x9 ↔ natebjones

**Creator pattern:** NamedCardEquation (ANALYSIS-VOTE1 §4 #1 → promoted to N3; ≥4 instances — Nate's highest-reuse 16:9 pattern).
**Reference frames (definitive):**
- `references/creators/natebjones/iUSdS-6uwr4/frames/vote1-anim-01-frame-006-t665s.jpg` — "Ollama + LM Studio + vLLM = Path" (cyan/green/violet/orange cards).
- `references/creators/natebjones/woGB2vr5wTg/frames/vote1-anim-02-frame-001-t370s.jpg` — "Principal + Delegation + Audit Log = Authority" (second instance, confirms it's a true template).

## Signature pattern
Inline "definition equation": N operand cards joined by typographic operators, terminated by `=` and a result card. Each card is a **rounded RECTANGLE** (radius ~14-16px) with a **thin full-perimeter colored outline** + soft matching glow, a bold-white title, and (in Nate's case) a smaller colored sub-label below. Operators `+`/`=` are **neutral slate-GRAY** (sampled rgb(53,64,69)/(61,74,79)) — never the card accent. Left→right stagger reveal. Big ghosted beanie+glasses watermark on the LEFT edge; CTA pill bottom-right. 5-accent band (orange/cyan/violet/green/gold).

## What matches (our render, post-edit)
- Equation grammar `A + B = C` as a single centered row — exact structural match.
- Left→right stagger: operand[0] lands, `+` pops, operand[1] lands, `=`+result slide in together, caption pill fades last (frames 1→2 confirm cadence; 3/4 are the settled hold).
- **Cards are now rounded rectangles with a full thin colored outline + soft accent-tinted glow** (cyan / green / orange) — matches Nate's card chrome. (Was: full pills with a left-only accent border.)
- **Operators `+`/`=` are now neutral gray** — matches Nate. (Was: colored to match the adjacent card.)
- Centered bold-white card titles; per-card accent discipline tracks Nate's 5-color band; result card in TNF orange.
- Caption pill with single orange keyword ("good"); handle chip bottom-right.

## Change made (IMPROVED)
`src/compositions/EquationCardChain16x9.tsx`:
1. `PillCard`: `borderRadius 999 → 16`, `borderLeft 4px → border: 1.5px solid accent` (all sides), added accent-tinted outer glow (`0 0 18px -2px ${accent}55`), centered text. Now reads as Nate's rounded-rectangle outline card, not a pill.
2. Added `OPERATOR_GRAY` (`#8B95A1`); both `+` and `=` now render gray. Removed the now-dead per-operator `color` prop + plumbing (interfaces + call sites) to keep the file honest.

typecheck clean (only the pre-existing project-wide `baseUrl` tsconfig deprecation warning); re-rendered + re-extracted — fix confirmed, no regression to stagger/caption.

## What still differs (intentional template choices / out of scope)
- No per-card **sub-label** (Nate's two-line card). Our operands are single-word noun chips and the schema has no sub-label field — adding one is a schema change, deferred (single-word chips read fine without it).
- No left-edge bookshelf/beanie watermark — chassis handle chip is our only persistent mark (documented NON-GOAL; would be a `DarkSlateChassis16x9` change, shared molecule).
- Handle is plain gold text, not Nate's beanie-icon CTA pill — lives in shared `DarkSlateChassis16x9`.

## Verdict
**IMPROVED.** The two biggest signature gaps (card SHAPE/border + operator color) are now closed with a minimal, fully-contained edit. Near-faithful capture of the NamedCardEquation pattern.

**Score: 9/10** (was 8 pre-edit).

## Recommendations (not made — shared molecule)
- `DarkSlateChassis16x9` could (a) render the faint center-glow radial gradient + (b) optionally accept a large left-edge ghosted-glyph watermark, to match Nate's fullscreen-card backdrop. Deferred — shared by ~21 comps.
- If a future variant wants Nate's two-line cards, add an optional `subLabel` to `operandSchema`/`resultSchema` (small, additive).
