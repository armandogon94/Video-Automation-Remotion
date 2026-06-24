# LayerCardStack9x16 ↔ simonhoiberg (Template B)

**Creator signature pattern (Simon Høiberg, Template B "LayerCardStack"):** Per
references/creators/simonhoiberg/ANALYSIS.md §"Template B" and the actual reference frame
`simonhoiberg/DPT3n_PgEiU/frames/frame-00-t00.20s.jpg`:
- **3 horizontally rounded white cards** stacked vertically, ~85% frame width, ~24px corner
  radius, soft ~30%-opacity drop shadow, ~16px vertical gap.
- Per card: a small square colored icon at left, then a **purple `#5B2EE5`-filled badge**
  ("Layer 1/2/3") with white bold uppercase text, then the layer name in **black bold sans**
  ("Vibe Coding" / "AI Agentic Coding" / "AI-Assisted Coding") below the badge.
- **Glassmorphic blurred-studio backdrop** — his studio B-roll heavily blurred + warm-tinted
  so the original frame becomes pure ambient texture behind the cards.
- **ONE accent color per reel** (electric purple). No decoration, no captions, no breadcrumb in
  Simon's own version — radical restraint. Cards appear (fade-up stagger in the first ~600ms),
  stay static, then leave. "Highest informational-density ÷ visual-noise" pattern in his corpus.

(Note: the assigned reel DPT3n_PgEiU also contains GitHub/Linear UI B-roll + talking-head
frames; frame-00 is the one that carries the LayerCardStack signature.)

**What matches (strong, structural):**
- 3 white rounded cards (radius 28), ~85% width (STACK_MAX_WIDTH 920/1080), soft drop shadow,
  ~36px gap — dimensionally on-pattern.
- Per-card grammar identical: badge top-left + bold black headline + muted body, with a small
  monospace glyph top-right (our stand-in for Simon's square app icon).
- **Glassmorphic backdrop faked correctly** for headless render — Remotion's still renderer
  doesn't honor `backdrop-filter`, so the comp layers two accent-tinted radial gradients
  (warm halo upper-left + cool counter-glow lower-right) to simulate the blurred-studio depth.
  Smart, faithful substitution.
- **Single-accent discipline held:** sampled RGB — kicker (171,56,53) and all three badges
  (175,58,38 / 188,51,43) are the SAME warm-red/clay family. One accent throughout, exactly
  Simon's "one accent per reel" rule.
- **Staggered fade-up entrance** (spring scale 0.92→1, opacity 0→1, translateY 24→0, ~0.4s
  stagger; badge scale-pops 0.1s after its card lands) matches Simon's "cards fade-up in stagger
  then stay static" motion grammar.

**What I IMPROVED (minimal, safe, color-neutral):** Simon's defining "Layer N" badge is a
**rectangular chip with a small corner radius (~6px), NOT a full pill.** Our comp had
`borderRadius: 999` (full pill), which read as a different, softer token and broke the most
recognizable shape of the pattern. Changed the badge `borderRadius` `999 → 8` (one value, with
a comment citing the reference frame). Re-rendered + re-extracted: badges now read as squared
chips matching Simon's, with no regression to layout, color, shadow, backdrop, or motion.
Typecheck clean.

**What differs (correct / expected — left untouched):**
- **Accent hue is our warm-red/clay, not Simon's purple `#5B2EE5`.** This is intentional and
  CORRECT: the accent is content-driven via `subjectTool` → `getToolAccentForSurface` (the same
  single-accent system every Sprint-1 comp uses), so it stays "one accent per reel" in OUR
  brand. Hardcoding purple would break that system and contradicts the use-our-own-brand brief.
  NOT changed.
- We add a centered title ("Las 3 capas del AI coding") + a kicker breadcrumb; Simon's own
  reel is a title-less cold-open. Both are optional generic-template affordances and don't harm
  the pattern.
- Spanish copy vs Simon's English — expected.

**Score: 8.5/10 — IMPROVED.** Tightened the badge from a full pill to Simon's signature
squared chip (`borderRadius 999 → 8`). The rest is a faithful structural capture: 3 white
rounded cards, glassmorphic tinted backdrop, single-accent badges, bold-black headlines,
staggered fade-up. Accent hue left as our brand-driven warm-red by design.

**Files edited:** src/compositions/LayerCardStack9x16.tsx (badge borderRadius 999 → 8).
No shared-molecule changes.

---

## Re-verification pass (deep adversarial QA, diagram-ig cluster)

Re-extracted 4 evenly-spaced frames from `output/cross-creator/LayerCardStack9x16.mp4`
(dur 5.06s) and re-read Simon's canonical `DPT3n_PgEiU/frames/frame-00`. The prior
badge-radius fix (`999 → 8`) has landed and reads correctly.

**Fresh RGB sample (most-saturated pixel inside each badge, frame 4):** LAYER1 (199,47,42),
LAYER2 (199,48,37), LAYER3 (196,50,37) — all three badges are the SAME warm-red/clay hue
(tighter than the original note's estimate). Cards pure white (255,255,255); backdrop warm
tint upper area (239,224,217) fading to cream paper at the bottom. Single-accent discipline is
airtight.

**Structure vs Simon frame-00:** 3 white rounded cards, ~85% width, soft shadow, even gaps;
**squared** "LAYER N" chips (not pills) matching Simon's squared purple badges; bold near-black
headline + muted body per card; glassmorphic tinted backdrop faked with layered radial
gradients (Remotion still-render ignores backdrop-filter). All on-pattern.

**Motion (4 frames):** card 1 → card 1+2 → all 3, staggered fade-up (scale 0.92→1, translateY
24→0); badge scale-pops just after its card lands. Matches Simon's "cards fade-up then static".

**Verdict: 8.5/10 — VALIDATED (prior IMPROVED edit confirmed, no new edit).** Accent hue stays
our brand-driven warm-red by design (content-driven via subjectTool, never Simon's purple).
Typecheck clean (no edits this pass).
