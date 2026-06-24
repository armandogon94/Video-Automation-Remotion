# StudioCompositor16x9 ↔ theaiadvantage (Igor Pogany)

**Creator source frames:** `references/creators/theaiadvantage/3mTMPEGWRWA/frames/anim-*.jpg`

## Signature pattern (theaiadvantage "Studio Compositor")
- Presenter cutout/PIP pinned to a corner over a near-black dark stage.
- Large glowing UI mockup (terminal / app card) floating in the remaining space, soft blue/violet glow halo, slight perspective tilt.
- Single short caption with exactly one accent (orange) keyword; rest white.
- Persistent handle/brand mark in a corner.

NOTE: the `anim-00`/`anim-01` reference frames in this folder happen to be the
light Claude-Code terminal-UI inserts the creator floats over their footage —
i.e. the "floating UI mockup" element of the pattern. The talking-head footage
is the presenter cutout. Both halves of the signature are present in the corpus.

## What matches (judging CHROME + LAYOUT only — video region is a placeholder)
- **Stage color:** deep-navy `#0F1A2C` (sampled (15,26,44)) — brand-family dark
  stage, the documented intentional swap for Igor's pure `#0A0A0A`. Same flat
  "compositor" read.
- **Presenter PIP:** small rounded-rect tile, bottom-left, subtle white 20% border,
  drop shadow — correct corner-anchored presenter chrome.
- **Floating content:** large element on the right, perspective rotateY tilt + soft
  glow drop-shadow halo, vertically centered — matches the floating-UI signature.
- **Caption pill:** centered-bottom, white body + exactly ONE orange keyword
  ("chassis" sampled (212,122,60) ≈ #D47A3C). Accent discipline is correct (one
  accent only) — this is Igor's "Stripe Press in motion" restraint.
- **Handle chip:** gold `@armandointeligencia` bottom-right, persistent.
- **Motion:** confirmed across early frames — presenter PIP fades up first
  (frame ~4, bottom-left, content area still empty), then UI mockup floats in
  from the right (4–16f) with the tilt held, then caption fades in (24f+). This
  is the documented signature beat (corner element settles, content floats into
  the open area).

## What differs (correct / intentional)
- Deep-navy vs pure black — documented brand decision, keeps chassis family
  consistent. Faithful to the pattern, not the pixel.
- Our copy/avatar/wordmark differ — correct (generic template, our brand).

## Score: 9/10 — VALIDATED
Chrome, layout proportions, single-orange-accent discipline, corner-presenter +
floating-tilted-glowing-content structure, and entrance choreography all capture
theaiadvantage's signature. Left untouched — no safe improvement needed.

---

## DEEP adversarial re-pass (2026-06-04) — vs `_fresh/` frames

Re-extracted 4 frames of our clip (0.2s→4.5s) and read the FRESH source frames
`references/creators/theaiadvantage/_fresh/frame-001..013.jpg` (these show the
actual GRAPHICS, not plain talking-head).

**New finding — theaiadvantage runs TWO co-existing sub-patterns:**
1. **2×2 model-comparison grid** (DOMINANT in `_fresh/`): four output cells in a
   2×2 grid, each labelled BELOW in bold white sans, presenter face-cam PIP filling
   the centre gap, flat dark-slate stage (frame-001/003/005/007).
2. **Floating-UI-mockup + corner presenter** (`_fresh/frame-013`, `3mTMPEGWRWA`):
   one large UI/app screenshot floating with a glow, presenter to the side — the
   sub-pattern THIS comp implements (per ADR-001 §4.1 / ANALYSIS §P1).

Our render of sub-pattern (2) re-confirmed faithful: deep-navy stage, small
presenter PIP bottom-left (white-20% border, drop shadow), large `rotateY(-5°)`
perspective-tilted UI mockup right with `#3FB8FF` glow halo, one-orange-keyword
caption pill, gold handle chip. Motion beat verified across the 4 frames: PIP fades
up first → mockup floats in from right (tilt held) → caption fades in 24f+ → hold.

**Decision: VALIDATE, left UNTOUCHED.** Rebuilding StudioCompositor into a 2×2 grid
would be a spec-level pivot, not a minimal QA fix, and it faithfully renders its
documented floating-UI signature. The DEMO placeholder UI-mockup happens to be the
brand lockup, so the caption text slightly overlaps the lockup's own text in this
render only — with a real app screenshot that overlap vanishes; not a chrome defect.

**Recommendation (NOT made — new comp, out of scope):** theaiadvantage's dominant
fresh-frame look is the 2×2 labelled comparison grid w/ centre-gap presenter PIP. If
the typology wants that beat, add a NEW `ModelComparisonGrid2x2_16x9` composition
rather than rewriting StudioCompositor — distinct signatures, both worth owning.
