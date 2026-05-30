# A1 — Timing critique (W21 wave-1, 12 variants)

Scope: motion timing only. Entry choreography, dwell, exit, transition pacing,
audio-visual sync. Color/typography/info-density are owned by sister agents.

Frame budget assumed: 30 fps. References below cite seconds AND frames.

Source artefacts inspected:
- `output/2026-05-18-gemini-3-2-flash-leak/comparison-grid-v2.jpg`
- `…/remotion-v2-baseline/preview-t1.5s.jpg`
- `…/tnf-transitions/preview-t6.85s-crossfade.jpg`, `…/preview-t10.5s.jpg`
- `…/diagram-cream/preview-t25s.jpg`
- `…/bignum-cream/preview-t1.5s.jpg`
- `…/benchmark-cream/preview-t3s.jpg`
- `…/quote-cream/preview-t8s.jpg`
- `…/tweetcard/preview-t2s.jpg`

Source code inspected:
- `src/compositions/DiagramExplainer9x16.tsx`
- `src/compositions/BigNumberHero9x16.tsx`
- `src/compositions/BenchmarkBars9x16.tsx`
- `src/compositions/TweetCardHero9x16.tsx`
- `src/compositions/QuoteCard9x16.tsx`
- `src/compositions/TechNewsFlash9x16.tsx`
- `src/compositions/scenes/useOverlayChoreography.ts`
- `src/compositions/scenes/{ChipScene,HugeScene}.tsx`
- `src/components/captions/EditorialCaption.tsx`
- `templates/diagram-explainer.json`, `src/compositions/schemas.ts`

---

## 0. House spring — the seed of every problem

`useOverlayChoreography.ts:41-50` ships the **default** spring used by every
TechNewsFlash chip/huge/subtitle/cta scene:

```
spring({ damping: 15, stiffness: 110, mass: 0.7 })
scale: 0.86 → 1.00
fadeIn:  frames 0..4   (≈133ms)
fadeOut: last 6 frames (≈200ms)
```

Meanwhile the **editorial** spring used everywhere else
(`DiagramExplainer9x16.tsx:62-66`, `BigNumberHero9x16.tsx:167-171`,
`BenchmarkBars9x16` via interpolate, `QuoteCard9x16.tsx:95-99`,
`TweetCardHero9x16.tsx:156-160`) is:

```
spring({ damping: 22, stiffness: 130, mass: 0.7 })
```

That is **two different rest signatures across the same brand.** With
`damping=15, stiffness=110, mass=0.7`, Remotion's spring overshoots ~6% and
settles by ~f24. With `damping=22, stiffness=130, mass=0.7` it's critically
damped (no overshoot) and lands ~f18. The first reads "punchy / modern", the
second reads "editorial / Bloomberg". Side-by-side in the 4×3 grid the chip
springs read jumpier than the cream-template entries. **Pick one and reuse**
(see Top 5 #1).

---

## 1. TechNewsFlash9x16 (cols 1 & 2 of grid — `remotion-v2-baseline`, `tnf-transitions`)

### What's encoded
- Per-overlay scale-in (`scaleIn`) lands at frame ~18 (~600ms) via the punchy
  spring above.
- Fade-in 4 frames (~133ms), fade-out 6 frames (~200ms) on every overlay
  when not inside a TransitionSeries (`useOverlayChoreography.ts:56-65`).
- Crossfade variant: 15-frame fade (`TechNewsFlash9x16.tsx:57`, ~500ms)
  between consecutive hero overlays via `TransitionSeries`.
- Chip rides on top of huge — chip has its own `scale: 0.9 → 1.0` mini-pulse
  (`ChipScene.tsx:33`).

### Does it feel right?
The chip + huge pairing on the baseline (col 1, t=1.5s) is **good**: chip
appears f0..f4, huge starts entering simultaneously and lands by f18 — they
finish together, which reads as a single beat. Caption strip is decoupled
(its own fade-in over 4 frames). All correct.

The 6-frame fade-out is **too aggressive** for an "editorial" voice. 200ms is
TikTok/jump-cut territory. On the baseline variant where each overlay
hard-cuts to the next, the eye registers a flicker. The 500ms crossfade in
`tnf-transitions` is the obvious fix — and the t=6.85s crossfade frame
(col 2, row 1) literally shows two overlays at 50% each: clean, no flicker.

The chip pulse (`scale 0.9 → 1.0`) is **redundant** with the parent's
`scale 0.86 → 1.0`. The chip ends up scaling twice (parent × local), so the
chip visibly *grows* into the corner. It should pulse OR ride the parent,
not both.

### What to change
- `useOverlayChoreography.ts:62` — bump fade-out window from 6 → 10 frames
  (133→333ms). Baseline variant will stop flickering between cuts.
- `useOverlayChoreography.ts:44-48` — align defaults to the editorial spring
  (`damping: 22, stiffness: 130`). Removes 6% overshoot.
- `ChipScene.tsx:33` — drop the local 0.9→1.0 scale; rely on parent `scaleIn`.
- **Always render hero chains with `useHeroTransitions: true`.** The 15-frame
  fade is objectively cleaner than the hard-cut baseline; there is no good
  reason to ship the no-transition variant.

### Verdict
- `remotion-v2-baseline`: **B−** (hard cuts feel cheap; spring overshoots)
- `tnf-transitions`: **B+** (crossfade saves it; spring still overshoots)
- `tnf-blue` (col 1 inferred): same engine, same grade.

---

## 2. DiagramExplainer9x16 (cols 1 & 2 row 2 — `diagram-cream`, `diagram-dark`)

### What's encoded (`DiagramExplainer9x16.tsx`)
- `firstNodeDelaySeconds: 0.4` (line 165 schema default) — first node lands
  ~f12.
- `sequenceStepSeconds: 1.4` (line 163 schema default) — each subsequent
  node 1.4s after the prior.
- Node entry: editorial spring (damping 22 / stiff 130) → opacity 0→1,
  translateY 16px→0 (lines 62-69).
- Arrows draw over **0.35s** (`duration = 0.35 * fps`, line 141), starting
  `0.2s after target node enters` (line 304). Arrowhead pops only when shaft
  is ≥92% drawn (line 176).
- Section label springs in once at top (line 199).

### Does it feel right?
The t=25s frame (3 nodes + 2 arrows) tells the whole story: each beat is
**too widely spaced**. 1.4s between nodes for a 3-node diagram = 2.8s of
build, then ~10s of dwell on the static result. The whisper-aligned caption
strip is the only thing moving by t=8s. On a 9:16 reel where the median
viewer drops at 3s, a 2.8s reveal that doesn't sync to the voiceover wastes
the entire hook window.

The arrow draw at 0.35s is correct (matches the spring lands of the node
above and below). But starting the arrow `0.2s after the target node enters`
means the arrow draws into a card that already settled — the arrow should
START at the SAME frame as the target node and complete WITH it, so the
target lands feeling "delivered by" the arrow. Currently target lands first,
then a delayed line crawls toward it. Reverse the causality.

The 16px translateY is timid; with ~0.6s spring duration the eye barely
catches the motion. Either bump to 40-60px (more legible motion) or drop the
translate entirely and let scale do the work.

### What to change
- `templates/diagram-explainer.json:24` — lower `sequenceStepSeconds`
  default from 1.4 → 0.9. For a 3-node diagram, total build collapses from
  2.8s to 1.8s, freeing 1s of dwell that can carry the voiceover's
  "y resultado:" beat. (And expose `triggerKeyword` per node — already
  flagged as v2 in the file header comment, line 21.)
- `DiagramExplainer9x16.tsx:304` — change `drawStartFrame` to
  `layout[i].enterFrame + Math.round(0.05 * fps)` (start arrow ~50ms after
  the SOURCE node enters, target node enters as the arrowhead lands).
- `DiagramExplainer9x16.tsx:69` — bump `translateY` range from `[16, 0]` to
  `[48, 0]`.

### Inter-template consistency
Spring config matches BigNumberHero, BenchmarkBars (title), QuoteCard, and
TweetCard — **good consistency** on the editorial side. The only outlier is
the TechNewsFlash overlay default (issue #0).

### Verdict
- `diagram-cream`: **C+** (timing is editorial but inert — stagger too slow,
  arrow causality inverted)
- `diagram-dark`: same engine, same grade.

---

## 3. BigNumberHero9x16 (cols 1 & 2 row 3 — `bignum-cream`, `bignum-dark`)

### What's encoded (`BigNumberHero9x16.tsx`)
- Number: editorial spring (damping 22, stiff 130). Scale 0.78→1.0,
  opacity 0→1 over frames 0..9 (~300ms) (lines 167-176).
- Suffix (`×`, `%`, `B`): springs in 0.15s after figure with a slightly
  punchier spring (damping 20, stiff 150). Scale 0.6→1.0 (lines 195-202).
- Kicker fade 0..10 frames (~333ms, line 209).
- Subtitle: starts `0.9 * fps` = f27, fades over 9 frames (lines 216-221).
- Optional `countUp`: ramps 0→target across 18 frames (lines 180-184).

### Does it feel right?
**This is the strongest template in the wave.** Look at t=1.5s for
`bignum-cream` (col 1 row 3): "15×" with the × clearly delayed-entering,
caption strip below independently animating. The 0.15s suffix offset is
exactly right — long enough to register as a separate beat, short enough to
not feel disjointed.

The 0.78→1.0 scale on a 420px figure means the number physically grows
~93px on each axis during entry. With the cream backdrop and 0.6s spring
that lands by f18, this is the cleanest hero moment in the wave.

Minor: subtitle starts at f27 (900ms) but the number is fully landed by
f18 (600ms). That's a **300ms gap of stillness** which on its own is fine
— it's the rhythmic breath before the supporting line. Keep.

The `countUp` over 600ms is **too slow** for a 15× hero. The eye doesn't
need to count digits scrolling on small two-character figures; counting
visibly only earns its keep on 3+ digit numbers. Gate `countUp` on
`figure.length >= 3`, or shorten to 300ms for short figures.

### What to change
- `BigNumberHero9x16.tsx:180` — make `countUpDuration` adaptive:
  `Math.round((parts.figure.length >= 3 ? 0.6 : 0.3) * fps)`.
- `BigNumberHero9x16.tsx:172` — try 0.82→1.0 instead of 0.78→1.0. The
  current scale is *just* far enough to wobble in peripheral vision.

### Verdict
- `bignum-cream`: **A−** (best hero timing in the wave)
- `bignum-dark`: same engine, same grade.

---

## 4. BenchmarkBars9x16 (cols 3 & 4 row 3 — `benchmark-cream`, `benchmark-dark`)

### What's encoded (`BenchmarkBars9x16.tsx`)
- Title fade-in 0..0.4s (line 277).
- Subtitle fade-in `0.2s..0.6s` (line 281-287).
- `barStaggerSeconds: 0.3` default (schema line 339).
- `barAnimSeconds: 0.8` default (schema line 341).
- Per-bar: label 0..0.1s, track 0..0.15s, fill cubic-ease-out over 0.8s
  (lines 105-130). Value label fades in when fill ≥95% (lines 132-138).
- Source caption fades in `0.2s after last bar completes` (line 311).

### Does it feel right?
The t=3s frame (col 3 row 3) shows both bars fully filled with values
visible. With `staggerSeconds=0.3` and `animSeconds=0.8`, total build for
2 bars = `0.3 + 0.8 = 1.1s`. At t=3s we should be ~1.5s past completion —
the bars are dwelling. This is correct, but the **0.3s stagger between only
2 bars is barely perceptible** — they read almost simultaneous. For 2 bars
specifically, increase stagger to 0.5s so the second bar visibly lags
behind the first ("Gemini lands first, then GPT-5.5 stretches past"). The
narrative *requires* you to see #1 finish before #2 starts growing.

The cubic-ease-out on the fill (line 127) is correct — bar decelerates as
it lands, mimicking physical mass. Good.

The value-label fade trigger at ≥95% (line 132) is **subtle but wrong**:
the label appears AFTER the bar visibly settles. It should appear at ≥85%
so the label rides the last bit of the fill — currently it pops in *after*
the bar stops moving, which reads as a separate event.

### What to change
- `templates/benchmark-bars.json` (or schema default): for n=2 bars, default
  `barStaggerSeconds` to 0.5; for n>=3, keep 0.3. Or make it data-driven:
  `0.6 / Math.max(1, bars.length - 1)` so total stagger is bounded.
- `BenchmarkBars9x16.tsx:133-134` — change `valueLabelVisible` threshold
  and `valueFadeStart` from 0.95 → 0.80. Label rides the fill home.

### Verdict
- `benchmark-cream`: **B** (math is right, stagger too tight for 2 bars,
  value-label pop late)
- `benchmark-dark`: same engine, same grade.

---

## 5. QuoteCard9x16 (cols 3 & 4 row 2 — `quote-cream`, `quote-dark`)

### What's encoded (`QuoteCard9x16.tsx`)
- Quote body: editorial spring (damping 22 / stiff 130). Scale 0.95→1.0,
  opacity 0→1 (lines 95-101).
- Quote glyphs (large `"` `"`): plain fade over 0..0.5s (lines 54-57).
- Divider: starts at **0.55s**, spring draws 0→72px wide (lines 139-144).
- Author block: starts at **0.95s**, spring + translateY 10→0 (line 315).

### Does it feel right?
The t=8s frame (col 3 row 2) shows everything settled — quote, divider,
author "ARMANDO INTELIGENCIA / AI Leadership Lab". This is dwell, not
entry — but the entry sequence (0s → 0.95s) is the question.

The 0.95s entry → author is **too slow**. Sequence:
- 0.0s — quote body starts spring
- 0.55s — divider starts (quote barely settled at ~0.6s)
- 0.95s — author starts
- ~1.4s — author fully landed

The whole compose takes 1.4s on a card that displays for 8-15s. That's fine
in absolute terms BUT the divider draw (`spring → interp 0..72px`) takes
~0.6s itself, meaning divider doesn't fully draw until ~1.15s, then author
starts. **Compress the chain.** Bring author to 0.7s, divider to 0.45s.

The quote scale 0.95→1.0 is **too subtle**. For an editorial quote, either
commit to a real scale (0.88→1.0) or drop the transform and use opacity
alone with a slow 0.6s fade for newspaper-stillness. Currently the 5% scale
reads as a sub-pixel jitter, not a deliberate motion.

### What to change
- `QuoteCard9x16.tsx:306` (divider) — `delaySec={0.45}`.
- `QuoteCard9x16.tsx:316` (author) — `delaySec={0.75}`.
- `QuoteCard9x16.tsx:101` — try `scale: [0, 1] → [1.0, 1.0]` (no scale) +
  longer opacity fade (0→1 over 18 frames) for genuine editorial calm.

### Verdict
- `quote-cream`: **B−** (entry chain too long; quote scale invisible)
- `quote-dark`: same engine, same grade.

---

## 6. TweetCardHero9x16 (col 4 row 1 — `tweetcard`)

### What's encoded (`TweetCardHero9x16.tsx`)
- Tweet card: editorial spring (damping 22 / stiff 130). Scale 0.95→1.0,
  opacity 0→1 (lines 156-162).
- Avatar: separate spring (damping 18 / stiff 160). Scale 0.9→1.0
  (lines 165-170).
- Artifact image: fade-in over **frames 6..18** (lines 368-375) — starts
  0.2s after card, completes ~0.6s.
- Face-cam: starts 0.6s after artifact, fades over 0.4s (lines 378-385).

### Does it feel right?
The t=2s frame shows the tweet card settled on the near-black hero zone
with empty artifact zone below. At t=2s, by the timing model, the card
landed at f18, artifact at f18, face-cam at f30 — everything should be on
screen. The empty bottom zone suggests this variant was rendered without
an `artifactImageUrl`, so the fallback hairline-pattern block is showing
(which is correct per `TweetCardHero9x16.tsx:430-437`).

**The card entry is the right timing.** Scale 0.95→1.0 + opacity over
0.6s on a card-shaped object is appropriate — cards should snap in
crisply, not wobble.

The avatar mini-spring (damping 18, stiff 160) lands ~f14, before the
card lands at f18. So **the avatar pre-settles inside a still-scaling
card**. That ordering is visually fine (avatar is always smaller than
its container, so it can finish first) but means avatar gets two
animations (card scale × avatar scale). Compound scale on a 56px
circle is invisible noise — drop the avatar spring entirely.

The 0.2s offset before artifact is too short. Card lands at f18 (0.6s);
artifact starts fading at f6 (0.2s). The artifact begins fading in
**while the card is still scaling** — both are moving simultaneously,
which fights for the eye. Push artifact start to f18 (0.6s) so the card
"settles, then the artifact appears underneath."

### What to change
- `TweetCardHero9x16.tsx:165-170` — delete the avatar local spring; let
  the parent card scale own it.
- `TweetCardHero9x16.tsx:368` — `const artifactStart = 18;` (lands AFTER
  the card settles, not concurrent with it).
- Once artifact starts after card, push face-cam to `artifactStart +
  Math.round(0.4 * fps)` so it appears after the artifact fade completes,
  not during it.

### Verdict
- `tweetcard`: **B** (card itself is right; artifact/avatar/facecam
  cascade overlaps when it should stagger)

---

## 7. EditorialCaption (universal — bottom strip of every template)

### What's encoded (`EditorialCaption.tsx`)
- Active group fade-in over 4 frames (~133ms, line 104-109).
- No fade-out — next group hard-cuts in (line 103 comment).
- Active word: scale 1.06 + accent color; past word: ink color; future:
  ink at 40% alpha (lines 149-156).
- Window size 6 words default; 60ms gap between windows.

### Does it feel right?
The 1.06 scale-up on the active word is **too subtle** for word-level
emphasis. TikTok caption convention is 1.10-1.18. Current looks like a
hover state, not an emphasis. The hard-cut between groups (no fade-out) is
correct — pause-and-jump matches voice cadence — but combined with a
133ms fade-in, transitions feel "drift in / snap out" which is mismatched.
Either both ends snap (group hard-in/hard-out) or both ends drift (~150ms
each).

### What to change
- `EditorialCaption.tsx:154` — `transform: isActive ? "scale(1.12)" : "scale(1)"`.
- `EditorialCaption.tsx:104` — drop fade-in to 2 frames (~66ms) for
  hard-cut symmetry, OR add a 4-frame fade-out before group end.

### Verdict
- `EditorialCaption`: **B** (correct architecture; active-word emphasis
  too timid; in/out asymmetry)

---

## Inter-template consistency report

| Template | Spring config | Notes |
|---|---|---|
| TechNewsFlash overlays | d=15, s=110, m=0.7 | **outlier — overshoots** |
| DiagramExplainer node | d=22, s=130, m=0.7 | editorial baseline |
| DiagramExplainer label | d=22, s=140 | minor variant, fine |
| BigNumberHero number | d=22, s=130, m=0.7 | editorial baseline |
| BigNumberHero suffix | d=20, s=150, m=0.6 | snappier — justified |
| BenchmarkBars title | (fade only) | no spring — fine |
| QuoteCard body | d=22, s=130, m=0.7 | editorial baseline |
| QuoteCard divider | d=22, s=160, m=0.6 | snappier — fine |
| QuoteCard author | d=24, s=140, m=0.6 | snappier — fine |
| TweetCard | d=22, s=130, m=0.7 | editorial baseline |
| TweetCard avatar | d=18, s=160, m=0.6 | **redundant w/ parent** |

Six of eight templates already converged on `d=22, s=130, m=0.7` as the
"editorial spring." TechNewsFlash and the TweetCard avatar are the only
true outliers. Worth codifying as a shared constant:
`src/compositions/scenes/useOverlayChoreography.ts` or
`src/timing/springs.ts`.

---

## Top 5 timing changes (prioritized by impact)

1. **Unify the spring config across all overlays.** Change
   `useOverlayChoreography.ts:44-48` default from
   `{ damping: 15, stiffness: 110, mass: 0.7 }` to
   `{ damping: 22, stiffness: 130, mass: 0.7 }`. Then export an
   `EDITORIAL_SPRING` constant from `src/compositions/scenes/` and have
   every other composition import it. **Why:** removes the visible
   overshoot in TechNewsFlash and gives the whole brand one motion DNA.
   *File:* `src/compositions/scenes/useOverlayChoreography.ts:41-49`.

2. **Reverse arrow causality in DiagramExplainer.** Currently arrow starts
   0.2s AFTER the target node lands. Should start 0.05s after the SOURCE
   node lands so the arrow arrives WITH the target node. Cuts perceived
   build time by ~30% per node-pair. *File:*
   `src/compositions/DiagramExplainer9x16.tsx:304` (change
   `layout[i + 1].enterFrame` → `layout[i].enterFrame`).

3. **Tighten DiagramExplainer stagger 1.4s → 0.9s.** Current 1.4s default
   makes a 3-node diagram take 2.8s of build on a reel that loses 50% of
   viewers by t=3s. *File:* `templates/diagram-explainer.json:24`
   (`sequenceStepSeconds`), `src/compositions/schemas.ts:163`
   (default value).

4. **Always render TechNewsFlash with `useHeroTransitions: true`.** The
   500ms crossfade is objectively cleaner than the 200ms hard-fade-out
   between hero overlays. The `tnf-transitions` variant proves it. There
   is no reason to keep the baseline behaviour. *File:*
   `src/compositions/schemas.ts` — set the `useHeroTransitions` default
   to `true` (currently default `false` per
   `TechNewsFlash9x16.tsx` doc-comment line 16).

5. **Push TweetCardHero artifact start from f6 → f18.** Card and artifact
   currently animate concurrently; staggering them makes the card "land,
   then reveal what it's about." Cascade face-cam to f30 → f30 + 12.
   *File:* `src/compositions/TweetCardHero9x16.tsx:368`
   (`const artifactStart = 18`), and `:378`
   (face-cam start = `artifactStart + Math.round(0.4 * fps)`).

---

## One-line verdicts

| Variant | Grade |
|---|---|
| TechNewsFlash baseline (`remotion-v2-baseline`, `tnf-blue`) | **B−** |
| TechNewsFlash with transitions (`tnf-transitions`) | **B+** |
| DiagramExplainer (`diagram-cream`, `diagram-dark`) | **C+** |
| BigNumberHero (`bignum-cream`, `bignum-dark`) | **A−** |
| BenchmarkBars (`benchmark-cream`, `benchmark-dark`) | **B** |
| QuoteCard (`quote-cream`, `quote-dark`) | **B−** |
| TweetCardHero (`tweetcard`) | **B** |
| EditorialCaption (universal strip) | **B** |

Wave-1 average: **B−**. The motion language is on the right track
(editorial spring is correctly chosen for most templates) but three
solvable issues drag the average down: the TechNewsFlash spring outlier,
the over-spaced DiagramExplainer stagger, and the inverted arrow
causality. Land the Top-5 list and the wave moves to **B+**.
