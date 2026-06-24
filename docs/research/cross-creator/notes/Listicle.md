# Listicle ↔ simonhoiberg

**Creator signature pattern (Simon Høiberg):** Simon's "listicle" register is NOT a
dark-background line-item list — it IS the **white-rounded-card stack** (the
LayerCardStack Template B: 3 white cards, squared single-accent "Layer N" badges, bold
black headlines, glassmorphic blurred-studio backdrop). His other format is a clean,
caption-free vertical talking-head over a blurred warm-lit studio. He has no
dark-navy-gradient numbered-line listicle anywhere in the reference corpus
(`references/creators/simonhoiberg/*/frames/`).

**Our Listicle (what it actually is):** a legacy GENERIC 16:9 (1920×1080) numbered
listicle — Armando-brand navy gradient (sampled `#1B3A6E`→`#0E1A2A`, RGB 27,57,109 →
14,26,42), a gold (`#D4AF37`, sampled 212,175,42) circular number chip with black numeral,
white bold headline + muted sub-line, slide-in-from-right entrance (spring damping 15),
avatar watermark bottom-right. Title holds frames 0–60 (2s), then item 1 slides in and
holds; the 5.056s comparison clip only ever surfaces the title + item 1, which is the
expected window for a 5s cap with `secondsPerItem: 5`.

**What matches (register-level only):**
- Single-accent discipline held — gold is the ONLY accent (number chip + nothing else);
  the rest is navy/white/muted. This mirrors Simon's "one accent per reel" rule, in our brand.
- Clean, legible, low-noise type hierarchy (bold headline / muted sub). Caption-free in this
  render (no wordTimings supplied), which incidentally aligns with Simon's caption-free style.

**What differs (this is a LOOSE pairing, by assignment — not a content/brand issue):**
- **Wrong structural family.** Simon's listicle = white card STACK (all tiers visible at once
  for max info-density). Ours = one centered line-item per screen on a dark void, sequential.
  These are different layout archetypes. Our project already captures Simon's actual listicle
  pattern in **LayerCardStack9x16** (validated separately). The plain `Listicle` is a generic
  template that happens to be pointed at Simon in the matrix.
- Dark navy surface vs Simon's blurred-studio light/glass backdrop.
- 16:9 vs Simon's 9:16.

**Why NO edit:** There is no clear, safe, high-confidence win. The only way to make this
"more Simon" would be to reshape it into white stacked cards — which would (a) duplicate
LayerCardStack9x16, (b) destroy the generic dark-listicle template that other content relies
on, and (c) violate "judge the pattern, don't rebuild the template." Every other candidate
change (re-balancing the centered block, swapping the slide direction, tightening the spring)
is subjective, not a defect. The template is internally coherent and on-brand; it simply isn't
a Simon-derived design. Leaving it untouched is the correct call.

**Score: 5/10 — VALIDATED (as a clean generic listicle; weak match to Simon's actual
listicle archetype, which lives in LayerCardStack9x16).** No edit made. No shared-molecule
changes recommended. If the matrix wants a *faithful* Simon listicle comparison, point this
row at **LayerCardStack9x16** instead of the generic `Listicle`.
