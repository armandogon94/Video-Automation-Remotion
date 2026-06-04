# EquationCardChain16x9 ↔ natebjones

**Creator pattern:** NamedCardEquation (ANALYSIS-VOTE1 §4 #1 → promoted to N3).
**Reference frames:** `references/creators/natebjones/iUSdS-6uwr4/frames/vote1-anim-01-frame-008-t665s.jpg` (the live "Ollama + LM Studio + vLLM = Path" equation), neighbors frame-004 (empty slate showing the left-edge bookshelf+glasses watermark + dark radial gradient + persistent CTA pill bottom-right).

## Signature pattern
Inline "definition equation": N operand chips joined by typographic `+` operators, terminated by `=` and a result chip. Each chip = labeled noun phrase; result chip parallel in shape but different accent. Left→right stagger reveal, then a bottom emphasis/caption pill with exactly one keyword tinted orange. Dark-navy radial gradient slate, faint left-edge watermark, handle/CTA pill bottom-right. 5-accent band (orange/cyan/violet/green/gold).

## What matches (our render)
- Equation grammar `A + B = C` rendered as a single centered row — exact structural match.
- Per-chip accent + colored operators, result chip in TNF orange (`BRAND.colors.keywordOrange`).
- Left→right stagger: operand[0] lands, `+` pops, operand[1] lands, `=`+result slide in together, caption pill fades last (frames 1→2 confirm the cadence; 3/4 are the settled hold).
- Caption pill with single orange keyword ("good"), handle chip bottom-right.
- Accent palette (cyan/mint/gold + orange result) tracks Nate's 5-color band.

## What differs (intentional template choices, not defects)
- Chips are full **pills** (radius 999, left-accent border only); Nate's are **rounded rectangles with a full thin outline** + a bold-white headline **plus a smaller colored sub-label** (two-line). Ours is single-line.
- Operators are **colored to match the adjacent chip**; Nate's `+`/`=` are **muted gray**. This is locked in by the JSDoc brief as a deliberate divergence.
- No left-edge bookshelf watermark (chassis handle chip is our only persistent mark — documented NON-GOAL).
- Background radial gradient reads flatter than Nate's pronounced center-glow — this lives in the **shared** `DarkSlateChassis16x9` (21 consumers), NOT editable here. See recommendation.

## Verdict
Faithful capture of the equation PATTERN (layout, stagger, accent discipline, caption pill, chrome). Differences are documented generic-template decisions. **No edit — VALIDATE.**

**Score: 8/10**

## Recommendation (not made — shared molecule)
`DarkSlateChassis16x9` could deepen its center-glow radial gradient to better match Nate's pronounced vignette; deferred because the chassis is shared by 21 comps.
