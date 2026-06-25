# TechNewsFlash9x16 ↔ diysmartcode

**Creator:** diysmartcode — also serves estebandiba / motiongraphicsweb.
**Reference video:** `references/creators/diysmartcode/rfzA7HWcpCQ/frames/` (frame-01..03).

## Signature pattern (diysmartcode "DarkChangelog")
- **DARK palette:** deep navy/black cosmic field with a subtle multicolor particle drift + radial glow gradient (warm at edges).
- **Brand wordmark top-center** ("Google" colorful) + small `@GOOGLE` top-right; **thin segmented progress bar at the very top.**
- **Section label** under the wordmark — uppercase, wide-tracked, accent-colored (e.g. `PERSONAL AGENT`, `SPARK CONNECTS`, `GEMINI 3.5 FLASH` in red/orange).
- **Large numbered counter** ("02") in big accent numerals for changelog items.
- **Big white/bold hero headline** ("Built into your day.", "Beats 3.1 Pro. Half the price.") — declarative, period-terminated.
- **Bottom progress stepper:** `SETUP · CREATE · EVAL · DEPLOY · PUBLISH` segmented timeline with the active node highlighted.
- **Bottom caption strip** in tracked mono (`SPEED CHART · 3.5 FLASH TOP-RIGHT`).
- One accent color per reel.

## Baseline (before) — what differed
The cross-creator render used the comp's **production cream default** (Root.tsx `defaultProps`: paper `#FAF7F2`, ink `#1A1A1A`, red accent `#B33A2A`, overlays ending at 3s). Result: an off-white card with a **red** "FILTRACIÓN" tag + black "GEMINI 3.2 FLASH", and **blank cream from 3s→5s**. That inverts diysmartcode's defining dark palette and leaves the back half empty — a clear palette-discipline + density mismatch against this creator.

## What I changed (IMPROVED)
The comp `.tsx` is **deliberately hardcoded cream** ("TechNewsFlash9x16 is always cream-paper" — for Gemini-blue AA contrast on cream in the real W21 production video), so forcing dark inside the component would regress production. Instead I added a **cross-creator-only props override** at `docs/research/cross-creator/props/TechNewsFlash9x16.json` — the data file `runCrossCreatorReplicas.ts` is explicitly designed to read (`PROPS_DIR`). This changes ONLY the cross-creator output; the production cream default is untouched. No comp/Root/shared-molecule edits.

Override supplies the on-brand **DARK_PALETTE** (`brand/palettes.ts`): paper `#0A0F1A`, ink `#F2E9D8` (warm cream text), accent `#D4A04A` (amber/gold), muted `#7A6F5C`; a persistent **section-label breadcrumb** (`FILTRACIÓN · GOOGLE · GEMINI 3.2` — diysmartcode's always-on tracked label); and overlays extended to span the full 5s (chip 0–5s, huge headline 0–2.4s, subtitle "15× más barato que GPT-5." 2.4–5s) so the clip no longer goes blank.

## After — verification
Re-rendered (`runCrossCreatorReplicas.ts TechNewsFlash9x16`, 150f). Sampled bg = `(11,15,26)` ≈ `#0B0F1A` deep navy; hero text warm-cream `(241,234,218)`. Frames now show: gold section-label breadcrumb + underline at top, gold "FILTRACIÓN" chip, warm-cream bold hero on dark, then a subtitle with gold tracked rule filling the back half. Matches diysmartcode's dark field + accent section-label + bold declarative hero + one-accent discipline.

## Decision
**Score: before 4/10 (cream-inverted, half-empty) → after 8/10 — IMPROVED.** Now faithfully captures diysmartcode's dark-changelog palette, persistent accent section-label, and bold declarative hero with sustained cadence — without touching the production-cream comp.

## Recommended (NOT done — structural, out of minimal scope)
The comp lacks three diysmartcode structural elements I did not force in (each would be a large, risky addition, not a minimal safe edit):
- **Numbered counter** ("01/02/03") for changelog items.
- **Persistent bottom progress stepper** (`SETUP · CREATE · EVAL · DEPLOY · PUBLISH` segmented timeline).
- **Cosmic-gradient + particle-drift background.** diysmartcode's field is a deep blue→green radial gradient with floating multicolor bokeh + a thin colored progress bar at the very top. Ours renders `background: paperColor` (flat `#0A0F1A`) with only a white-on-multiply radial grain overlay (line 226/233) — which is a no-op on a dark paper, so our field reads dead-flat. The TechNewsFlash schema has NO gradient/particle field (unlike Listicle's `gradientTo`), so this needs new comp layers + schema, not a prop.
These would be a `mode: "dark-changelog"` variant on TechNewsFlash (new scene atoms) — worth a dedicated task, not a cross-creator tweak.

## DEEP QA pass 2 (2026-06-04) — re-verified, VALIDATED at 8/10
Re-extracted 4 evenly-spaced frames + re-sampled with PIL. Confirmed independently:
- bg = `(11,15,26)` = `#0B0F1A` deep navy (dark-palette override applied as claimed).
- Cadence is full across the whole 5s with NO blank frames: chip "FILTRACIÓN" persists 0–5s, huge "GEMINI 3.2 FLASH" 0–2.4s (frames 1–2), subtitle "15× más barato que GPT-5." + gold dotted rule 2.4–5s (frames 3–4). Motion progression reads cleanly huge→subtitle.
- Palette discipline (one warm-gold accent), persistent tracked section-label breadcrumb, and bold declarative hero all match diysmartcode's signature.
The prior agent's props-override IMPROVE was correct and the three remaining gaps are genuinely structural (need comp+schema work). No minimal/safe props win remains — forcing a 4th overlay or faux-gradient would invent content and risk colliding with the caption zone. **Left untouched; VALIDATED.**


## Phase-3 triple-vote (2026-06)
TechNewsFlash9x16 ↔ diysmartcode: 8/10 — IMPROVED: panel 8/9/8 PASS. dark-changelog mode (cosmic gradient + numbered counter + bottom stepper) faithfully captures diysmartcode. Minor open polish (bigger stepper nodes, centered counter block) left as backlog.
