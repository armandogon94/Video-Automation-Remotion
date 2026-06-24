# BrollListicle9x16 ↔ sahilbloom

**Pass:** deep cross-creator adversarial QA (sahilbloom-kinetic-broll cluster)
**Date:** 2026-06-04
**Footage comp:** B-roll plate is a solid `#0E0E10` placeholder here — judged on GRAPHIC
CHROME / LAYOUT only.

## Creator signature (sahilbloom)
- Editorial restraint, cream/blue field, NO emoji decoration.
- "Content labels" = tight colored pill rows (red `#A0182C`, white italic-serif text —
  `fresh-editorial-brightcard.jpg` "Email Processing" / "Meetings/Calls") stacked under a
  small gray date header.
- Faked SaaS app-stack logo card (`fresh-saaslogos-gmail-cal-slack-zoom.jpg`).

## Our version (BrollListicle9x16.mp4)
Template origin = **Alex Hormozi** B-roll listicle (white hook pill + numbered chapter
pills + karaoke captions), cross-compared to sahilbloom.
- Persistent white hook pill (top): "Por qué Gemini 3.2 Flash importa" (bold black sans, 3
  lines).
- Numbered chapter beat pills crossfade in mid-frame: "1 10× más barato que GPT-5", etc.
- Blue breadcrumb top: "GOOGLE · I/O 2026 · FILTRACIÓN".

## DEFECT FOUND (fixed) — emoji/title collision
Root `defaultProps` set `emojiStrip.enabled = true` with `topPx: 220` while the hook pill is
`position:top, edgePx:180`. The hook text wraps to 3 lines, so the pill body spans ~y180–430
— and the emoji row at y220 rendered the ⚡💸🚀 glyphs *through* the title text ("Por qué",
"3.2 Flash" partially occluded by 💸🚀). `HookEmojiStrip` is documented as sitting "above" the
hook, an assumption that only holds for a short 1-line hook; with a tall multi-line pill
anchored to the top edge it overlaps. Genuine visual defect in any context, and emoji also
break sahilbloom's no-emoji editorial restraint.

## Change (IMPROVED) — minimal, safe, no Root.tsx / no .tsx edit
Added partial props override **`docs/research/cross-creator/props/BrollListicle9x16.json`**
setting `emojiStrip.enabled:false`. Remotion shallow-merges inputProps over registered
defaultProps at the top level, so every other key (hook, beats, breadcrumb, palette,
subjectTool) is preserved from Root — confirmed in the re-render: hook pill + beat pill both
still present, emoji gone, zero regression. Typecheck clean; re-rendered + re-extracted.

## Compare (skeptic, post-fix)
- **Chrome cleanliness:** now correct — pills render cleanly, no occlusion. ✓
- **"Content label" structure:** loose match — both stack labelled pills on a backing plate
  (sahilbloom's red-pill rows ≈ our white hook/beat pills). ✓ (structural only)
- **Register / palette:** DIVERGES — Hormozi-loud (white pills, karaoke captions, blue
  breadcrumb) vs sahilbloom-quiet (cream field, tight red italic-serif labels). This is an
  inherent template-lane difference, expected when a Hormozi template is stress-compared to
  an editorial creator. Not "fixable" without rebuilding the template into a different one.

## Decision: **IMPROVED** — 6/10 (was a broken render)
Fixed a real emoji-through-title collision; clip is now defect-free with clean listicle
chrome and is closer to sahilbloom's emoji-free restraint. Remaining gap (Hormozi-loud
register vs editorial calm) is a template-identity difference, not a defect — left as-is per
the generic-template brief.

## Files edited
- `docs/research/cross-creator/props/BrollListicle9x16.json` (new — emoji strip disabled)

## Recommended (NOT made — shared / Root-owned, out of my edit scope)
- **`src/components/HormoziOverlays.tsx` `HookEmojiStrip`:** default `topPx: 220` collides
  with a multi-line `PersistentHookPill` anchored at `edgePx: 180`. Consider making the strip
  position relative to the pill's measured height (or documenting that the strip is only safe
  with a 1-line hook). Shared molecule — described, not edited.
- **`src/Root.tsx` BrollListicle9x16 defaultProps:** either disable `emojiStrip` by default or
  raise the hook `edgePx` / lower the strip so the registered demo isn't broken out of the
  box. Root-owned — described, not edited.
