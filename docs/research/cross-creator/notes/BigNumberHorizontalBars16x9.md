# BigNumberHorizontalBars16x9 ↔ sahilbloom

**Creator (cross-creator judge):** @sahilbloom — horizontal-bar discipline (rounded
bars + tracks, mono labels, one-row-per-category, color-coding, sparse layout,
eased staggered fill with values landing on completion).
**NB:** the comp's own JSDoc credits Nate B Jones M3 ("Security Stack / 18 modules",
hero-number-left + bars-right) and relates to Hormozi's `GameStatPanel`. Here it is
judged against Sahil's transferable bar grammar, not pixel-matched to him.

**Reference (FRESH):** `references/creators/sahilbloom/_fresh/fresh-rankedbars-redcalendar-*.jpg`
(the "Red Calendar Protocol" 4-bar reveal — rounded color bars, mono/serif labels,
generous negative space) and §P9 ThreeColumnBarChartWithPeopleIcons (color-coded
group bars, ANALYSIS.md line 46). Sahil's own bars are CREAM-bg + single-accent-per-video;
this comp is dark-palette + per-metric color — both deliberate brand/content choices.

## What matches (our dark "GOOGLE · I/O 2026 · FILTRACIÓN / 92% Gemini 3.2 Flash" render)
- Rounded horizontal bars (radius 10) each with a muted track behind the fill, mono
  tracked-uppercase category label + mono muted sub-label, value at the row end
  (95/92/98/100/88%) — exactly Sahil's rounded-bar-with-track + mono-label grammar.
- Sparse, generously-spaced layout: 5 evenly-distributed rows in the right half,
  big breathing room, calm editorial register — matches Sahil's restraint.
- Color used to CODE each metric (cyan SPEED / green QUALITY / orange COST / purple
  CONTEXT / red MULTIMODAL), like Sahil's red/green/yellow people-icon group chart (§P9).
- **Motion verified across dense frames (0.65s, 0.85s):** hero number counts up
  0→92 (outQuart) while the RIGHT bars enter in an accelerating top-to-bottom
  stagger; each bar's fill eases 0→target and its value rolls up synced to the fill
  window; emphasis pill ("92% of GPT-5.5 at 1/15th the price") fades in after the
  last bar lands. Faithful to the eased-staggered-fill + value-on-complete beat.

## What differs (correctly, per brief)
- Dark palette (default `palette:"dark"`) vs Sahil's cream — differing brand palette
  is explicitly correct per the brief; the dark navy + blue accent is the Armando
  16:9 register.
- Hero-number-LEFT + bars-RIGHT split is a Nate B Jones device, not Sahil (his bars
  are full-width stacks). This is the template's own identity; the bar TREATMENT
  (the part we judge against Sahil) is faithful.
- Multi-color rows vs Sahil's single-accent-per-video — here color is content-coding,
  which matches his §P9 discipline; appropriate for a 5-metric panel.

## Change made (MINIMAL, high-confidence — a real layout DEFECT, not a style pref)
**Fixed a label↔bar collision.** The bottom row's 10-char label "MULTIMODAL"
(mono bold 32px + 0.08em tracking ≈ 207px) overflowed the `BAR_LABEL_W = 200px`
column (180px usable after the 20px gap) and ran INTO the red fill — the final "L"
was occluded, and its sub-label "img · video · audio" wrapped to two lines.
Confirmed with PIL: red fill leading edge sat at canvas x=1200, exactly the label-column
boundary.
- `BAR_LABEL_W` 200 → **248** (clears a ~10-char mono-bold label; `BAR_TRACK_W` is
  derived so it auto-shrinks 510→462px — bars still generously wide, right margin
  improves).
- Added `whiteSpace:"nowrap"` to the label so a long label never wraps to two lines.
- Typecheck clean (no BigNumberHorizontalBars errors); re-rendered; re-extracted:
  "MULTIMODAL" now reads in full with clean separation from the bar, sub-label on one
  line, and NO regression to hero / other bars / values / pill / watermark / motion.

## Score: 8/10 — IMPROVED
Faithful capture of Sahil's transferable horizontal-bar discipline (rounded bars +
tracks, mono labels, color-coding, sparse layout, eased staggered fill, value-on-complete),
with the brand-correct dark palette and the Nate hero-left split as the template's own
identity. Fixed the one genuine defect — a label overrunning its column into the fill —
with a contained two-constant + nowrap edit, verified by re-render.

## Recommendations (NOT made)
- Consider auto-fitting the label font (or measuring text) so arbitrarily long
  caller labels never clip regardless of the fixed column width — a generic-robustness
  improvement beyond this demo's longest label.
