# BrandedOpener9x16 ↔ alexhormozi

**Creator:** alexhormozi.
**Reference video:** `references/creators/alexhormozi/Z1tOBULRiIQ/frames/` (stage talking-head with center-bottom white karaoke captions "1 constraint" / "is somehow gonna"). Opener/title-card signature documented in `references/creators/alexhormozi/ANALYSIS.md` → **Pattern E — Opening-title-card**.

## Signature pattern (ANALYSIS Pattern E — Opening-title-card)
- **Large solid-bg dark rounded-RECTANGLE** (corner radius ~12px — explicitly NOT a pill), **bold white ALL-CAPS sans headline, centered**, used ONCE at t=0–4s (e.g. "THE FOUR PILLARS OF TRUE INFLUENCE").
- Adjacent Hormozi house grammar: persistent white top hook-pill (Pattern A) and center caption-layer (Pattern C, the karaoke pills visible in this reel's frames). The opener archetype itself is the dark-rectangle topic card.

## Archetype framing
Our `BrandedOpener9x16` is a **Tella-T9 "visual-hook brand-tic" opener** (per its docstring): a recurring brand glyph (`@`) + wordmark that snaps in with an overshoot spring so viewers recognize the channel in the first ~2s. Hormozi's opener is a **topic-headline card** (the video's thesis in a dark rectangle). Different opener *purposes* — but they share the same visual discipline, which is what we judge as a pattern.

## What matches
- **Solid dark field:** sampled bg `(8,6,9)` ≈ `#080608` (warm-black palette) — matches Hormozi's "solid-bg dark" title card exactly. ✓
- **Bold white ALL-CAPS sans, centered:** "ARMANDO INTELLIGENCE" rendered fontWeight 800, `textTransform: uppercase`, centered; tagline "AI · BRAND · VOICE" also uppercase tracked. Matches "bold white ALL CAPS sans, centered." ✓
- **Single-use opener, snap-in entrance:** hero scales 0 → 1.2 overshoot → 1.0 (PUNCHY_SPRING) then holds, wordmark slides up with 4-frame stagger, comp fades out — a once-at-t0 opener. Matches "used ONCE at t=0–4s" with a richer (but same-family) snap entrance. Verified across our 4 frames: frame@0.6s logo brightening in, frames@1.8/3.0/4.2s fully settled and held. ✓
- **One-accent restraint + premium dark register** ✓

## What differs
- **No rounded-rectangle plate:** Hormozi contains the headline in a solid dark rounded-rect (~12px radius); ours is a free-floating glyph + wordmark on the field. This is the defining structural delta.
- **Brand wordmark vs video topic:** ours states the brand identity ("ARMANDO INTELLIGENCE / AI · BRAND · VOICE"); Hormozi's states the video thesis. This is correct — differing copy/purpose per the brief; do not "fix" content to match.

## Decision
**Score: 8/10 — VALIDATED.** The opener faithfully captures Hormozi's Opening-title-card shared discipline: solid dark field, bold white ALL-CAPS centered sans, single-use snap-in opener. It remains its own brand-tic archetype (the `@` glyph + wordmark is its identity, serving the Tella visual-hook pattern), which is the correct generic-template posture. Left untouched — forcing Hormozi's topic-rectangle plate would change this comp's archetype and isn't a minimal/safe edit.

## Recommended (NOT done — would change archetype)
For a tighter Hormozi-specific opener, a sibling `OpeningTitleCard9x16` variant could wrap a **topic headline** in a solid dark rounded-rectangle (~12px radius, ~75% width, bold white ALL-CAPS, centered, single-use). That is ANALYSIS Pattern E's "new molecule `<OpeningTitleCard>`" — a dedicated build, not a tweak to this brand-tic opener.
