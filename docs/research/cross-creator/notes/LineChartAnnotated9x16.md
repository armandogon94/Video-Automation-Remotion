# LineChartAnnotated9x16 ↔ aiexplained

**Creator:** @aiexplained (Philip) — artificial-analysis / Metaculus line-chart aesthetic, near-flat academic screenshots, yellow highlight.
**Reference frames:** `references/creators/aiexplained/2_DPnzoiHaY/frames/anim-02-frame-005/008.jpg` (Metaculus "Forecasting Performance Over Time" scatter+trend chart). Corroborated by `references/creators/aiexplained/ANALYSIS.md` lines 86, 103, 118 (Metaculus / Artificial-Analysis / GPT-OSS figure charts).

## Important framing
ANALYSIS.md is explicit (line 305): aiexplained is the **outlier — he has effectively ZERO procedural motion chrome**. His "line charts" are *static fullscreen source screenshots* (Metaculus, Artificial Analysis, paper figures) with a cursor + live yellow PDF-marker, NOT a Remotion template. So the transferable signature is the **aesthetic of those analysis charts**, not a motion he authored.

## Signature pattern (the analysis-chart aesthetic)
- Clean light/white academic background; restrained, data-first.
- A rising hero trend line bottom-left → top-right (the "Frontier Model Trend").
- Axis labels + dashed reference gridlines; title top, small subtitle.
- Color-coded / starred markers at key data points, with **in-place labels at the terminus** (GPT-4o bottom-left, Claude Opus 4.5 top-right).
- A yellow highlight is his recurring *brand accent* (PDF text-marker / chart highlight).

## What matches (our "MCKINSEY · STATE OF AI / ADOPCIÓN IA" render)
- Clean cream academic background, data-first, generous negative space — matches the austere analysis-chart look.
- Rising hero trend line bottom-left → top-right (RGB sampled ~187,56,49 solid terracotta; monotonic rise confirmed y 1104→908→709) — the dominant transferable gesture.
- Axis tick labels (6 / 88 on Y, Q1–Q4 on X) + dashed horizontal gridlines — matches the gridded academic chart chrome.
- **End-point dot pings in** (ring + solid dot + inner highlight) with an **in-place value label "82%" at the terminus** — directly mirrors aiexplained's labeled end markers (star/dot + in-place model label at the line's end).
- Top-right value-readout chip counts up (56.4 → 82) synced to the line draw-on — a tasteful editorial addition consistent with the data-readout vibe.
- Motion: line draws on L→R via stroke-dashoffset, end-dot pings (outBack) as the line reaches the terminus, readout counts up — well-staged, stable final state (frames 1 & 3 identical, no regression).

## What differs (correctly, per brief)
- Accent is brand red, not aiexplained yellow. The yellow is HIS brand color (PDF marker) — per the brief we must NOT match it; our brand-equivalent highlight token would be gold #D4AF37, and the cross-creator data simply chose red. Not a defect.
- Hero line is solid, not dashed. aiexplained's trend lines are dashed, but (a) a solid swept hero line is our documented family DNA and the safer headless-render choice, and (b) stroke-dashoffset draw-on animation is incompatible with a pre-dashed stroke. Dashing would be risky and is not the load-bearing signature.
- Our own Spanish copy + McKinsey source. Correct — differing copy/source is expected.

## Score: 9/10 — VALIDATED (no edit)
Faithful capture of the aiexplained analysis-chart aesthetic: rising hero trend line on a clean academic light ground, axis + dashed-gridline chrome, an end-point dot that pings in, and an in-place value label at the terminus — exactly the labeled-endpoint trend gesture from the Metaculus/Artificial-Analysis references. The only divergences (yellow→brand accent, dashed→solid line) are deliberate brand/render-safety choices, not pattern failures. No change made.

---

## DEEP PASS (cross-creator round 2 — vs FRESH frames) — 2026-06-04

**Richer sources this pass:** the `_fresh/` set + the cited paper-figure frames now show aiexplained's
true line-chart register:
- `references/creators/aiexplained/2_DPnzoiHaY/frames/anim-02-frame-008.jpg` — Metaculus "Forecasting
  Performance Over Time": a dashed **Frontier-Model Trend** rising from GPT-4o (bottom-left) with a
  visible BEND, and **labeled star markers at MANY points along the line** (GPT-4o, Claude 3.5 Sonnet,
  OpenAI o1/o3 High, Claude Opus 4.5, GPT 5.1, Gemini 3 Pro).
- `references/creators/aiexplained/WLdBimUS1IE/frames/anim-02-frame-010.jpg` — GPT-OSS system-card
  Figure 3: twin accuracy-vs-effort line charts, both **concave/decelerating** (steep then flattening),
  with low/medium/high labels at each point.
- `_fresh/frame-048,036` — grouped benchmark BAR charts (Gemini Deep Think) with a **darker focal column**
  (sampled RGB(47,70,202) deep blue vs sibling RGB(68,146,254) sky blue) on white, value labels on top.

**Adversarial finding (the single biggest gap):** the prior render used default series `[12,34,58,82]`,
whose successive diffs are `[22,24,24]` — i.e. a near-collinear, **ruler-straight diagonal** with a
**single** end annotation. aiexplained's trend lines are NEVER straight: they have curvature (the whole
narrative of an AI-progress chart is the bend), and they carry **multiple in-place labeled waypoints**,
not one. A featureless straight segment reads as a placeholder, not as data.

**IMPROVED (props-only, safe):** added `docs/research/cross-creator/props/LineChartAnnotated9x16.json`
overriding only `xLabels` + `series` (kept sectionLabel/breadcrumb/palette/accent defaults):
- `values: [18,41,58,69,76,80]` → diffs `[23,17,11,7,4]` = a clean **decelerating concave curve** (the
  frontier/diminishing-returns shape from the GPT-OSS + Metaculus references).
- `xLabels: [2021..2026]` (6 pts, matches values length).
- TWO annotations — mid-waypoint `{atIndex:2,"GPT-4"}` (the inflection milestone, label below) and
  terminus `{atIndex:5,"80%"}` (label above) — mirroring aiexplained's named milestones marching up
  the trend. No .tsx change; Root.tsx defaultProps untouched.

**Re-render verified (frames /tmp/cc2_LineChartV2_*):** curve now has visible concavity; GPT-4 dot pings
as the line reaches index 2, terminus 80% dot pings on arrival (correct staggered "sweep across the
trend" beat); readout counts 18→80; final state stable (t=2.0s ≡ t=4.6s); no label/line collision.

**What still differs (correct, per brief):** brand red line not aiexplained yellow/dashed (yellow is HIS
PDF-marker brand color; solid swept line is our family DNA + the headless-render-safe choice; dashed is
incompatible with stroke-dashoffset draw-on). Spanish McKinsey copy is ours. These are intentional.

## Score: 9/10 → 9.5/10 — IMPROVED (props only)
The degenerate straight line was the one real defect; replacing it with a concave multi-waypoint trend
makes the chart unmistakably aiexplained's "frontier trend with named milestones" gesture while keeping
every brand/render-safety choice intact.
