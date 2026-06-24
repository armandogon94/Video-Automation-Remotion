# TalkingHead ↔ simonhoiberg

**FOOTAGE-BASED COMP — judged on CHROME / LAYOUT only.** The centered gold circle in our
render is the placeholder where the speaker video goes (no `speakerImageUrl` supplied), not a
design element. I assessed the overlay chrome, not the empty subject area.

**Creator signature pattern (Simon Høiberg talking-head):** full-bleed vertical (9:16) person
on a heavily-blurred, warm-lit industrial-studio backdrop (string-light bokeh + orange tube
lights). Radically chrome-light: **no burned-in captions, no persistent name tag**, occasional
small rounded UI/feature card floating in a top corner (his LayerCardStack content surfacing as
an overlay). One accent (electric purple) when chrome does appear. Reference frames:
`simonhoiberg/DPBv4qMkmXE/frames/frame-03`, `DNVjkdEsKAj/frames/frame-03`,
`DMsj5dNPzK3/frames/frame-03`.

**Our TalkingHead chrome (what's actually on screen):**
- **Title** "Hablemos de IA" — top-center, white Inter 700 ~42px, timed fade in→hold→out
  (present frame 1, gone by frame 4). Clean.
- **Lower-third name tag** "Armando Inteligencia" bottom-left, white 28px with a gold vertical
  accent bar (sampled 202,172,86 ≈ `#D4AF37`), fades in ~frame 30–50. M21
  NameTagStackedLowerThird grammar.
- **Bottom gradient scrim** (transparent→rgba(0,0,0,0.8)) for lower-third legibility.
- **Avatar watermark** bottom-right.
- **No captions** — demo default `wordTimings: []`, so the caption layer renders nothing.
- Deep-navy background (`#0F1B2D`, sampled 15,26,44) shows only because there's no footage.

**What matches:**
- Single-accent discipline held — gold is the ONLY accent (name-tag bar). White text, navy
  ground, no second hue. Same "one accent" restraint as Simon's purple.
- **Caption-free by default** — incidentally matches Simon's no-burned-captions talking-head.
- Restrained, broadcast-clean lower-third; nothing gaudy.

**What differs (correct / expected):**
- Ours adds a tasteful lower-third name tag + timed title; Simon runs *chrome-minimal*
  (typically no name tag at all, just the occasional corner card). Our lower-third is a
  legitimate generic talking-head affordance, not a defect — and it's the M21 shared molecule,
  not something this comp owns.
- Navy flat background vs Simon's blurred warm studio — but that's the FOOTAGE layer (placeholder
  here), outside chrome scope.
- 16:9 vs Simon's 9:16.

**Why NO edit:** The chrome is clean, on-brand, single-accent, and defect-free (title timing,
name-tag bar, scrim, watermark all correct). Footage-based, so the subject area is out of scope.
The pairing to Simon is loose (he's chrome-minimal; ours adds a lower-third), but the shared
register — clean, caption-free, single-accent talking-head — is honored. The name tag lives in a
SHARED molecule (M21 / `BrandWatermark` + lower-third), which I'm constrained not to edit; and it
isn't wrong anyway. No safe, high-confidence change exists.

**Score: 6.5/10 — VALIDATED (clean, single-accent, caption-free talking-head chrome).** No edit
made. No shared-molecule changes recommended (M21 lower-third + watermark are correct as-is).
