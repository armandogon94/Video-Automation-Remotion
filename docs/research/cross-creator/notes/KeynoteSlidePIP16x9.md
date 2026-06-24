# KeynoteSlidePIP16x9 ↔ allin (All-In Podcast / Summit)

**Creator source frames:** `references/creators/allin/ElhxzUO7YQM/frames/coarse-016.jpg`
(Jan Sramek keynote — canonical P2 slide+PIP), `oNJ_ouDNNT0/frames/` (Cathie Wood
ARK-chart slide+PIP). Pattern documented in `references/creators/allin/ANALYSIS.md`
§P2 `SlideDeckPlusSpeakerPIP16x9` + §P1 `PersistentEventLockupChyron16x9` + §P5 backdrop.

## Signature pattern (All-In Summit keynote mode)
- Large keynote slide pinned to the LEFT two-thirds of the frame.
- White-bordered (~4-6px) rounded-rect speaker face-cam PIP, bottom-RIGHT, ~30% width.
- Dark-navy starfield / earth-at-night satellite backdrop filling negative space.
- Persistent two-line event-lockup chyron in a dark-blue gradient panel corner
  ("ALL-IN" big + "SUMMIT" small) — present from frame 0, NEVER animates (stage bug).
- No burned-in captions on this chassis (allin grammar).

## What matches (CHROME + LAYOUT — slide/PIP regions are placeholders)
- **Slide:** large rounded rect, left two-thirds, drop-shadow, fades up 0–12f. Correct.
- **Speaker PIP:** white 4px border, rounded, drop-shadow, bottom-right, slides in
  from +60px x / fades in 8–20f (faint at frame ~4, settled by frame 2 sample) —
  matches the documented slide-up-and-fade entrance + anchor + white frame exactly.
- **Event chyron:** bottom-left, dark-blue VERTICAL GRADIENT panel (sampled top
  (25,52,97) ≈ #193461 → bottom (17,29,51)) — the exact "dark-blue gradient panel
  with vertical wash" from §P1. Two-line lockup: "ARMANDO" big + "SUMMIT" small
  condensed bold, white. Held statically, never animates. Faithful.
- **Background filler:** deep-navy `#0F1A2C` (15,26,44) — see note below.
- **Captions:** correctly absent (allin grammar = none).
- **Handle chip:** gold `@armandointeligencia` bottom-right (our standard chassis chrome).

## What differs (correct / intentional)
- Background filler is a flat dark-navy wash, not the literal earth-at-night
  satellite photo. The composition SUPPORTS an optional `backdrop` image at 0.3
  opacity (§P5) — it's simply not supplied in the demo props, so the slate slab
  shows through. This is a content choice, not a structural miss. Brand-appropriate.
- Our copy/avatar/wordmark differ — correct (generic template, our brand).

## Score: 9/10 — VALIDATED
Slide-left + white-bordered-PIP-bottom-right + persistent dark-blue-gradient
event-lockup chyron + no-captions grammar all match the All-In P2 signature, down
to the never-animate chyron and the slide-up PIP entrance. Left untouched — the
flat backdrop (vs satellite photo) is a supported, intentional content default,
not a chrome defect.

---

## DEEP adversarial re-pass (2026-06-04)

Re-extracted 4 frames of our clip (0.05s→4.5s) and re-read the allin SUMMIT
source frames `references/creators/allin/G2KvA4QD-IY/frames/coarse-048..058.jpg`
+ `HGbA6ze0_3M/frames/coarse-007..011.jpg`.

**RGB sampled from the real chyron (G2KvA4QD-IY coarse-058):**
- vertical accent bar / panel edge bottom-left = `(6,8,59)` → a **deep navy/blue**.
- lockup text = `(254,255,247)` → **white**.

This directly validates our chyron molecule's **navy vertical-gradient panel +
white condensed-bold two-line lockup** decision (`linear-gradient(180deg,#1a3a6e→
#0F1B2D)`, text `#FFFFFF`). The All-In lockup sits over/inside a navy element with
white text — exactly what we render. Our frames confirm: chyron present from frame 0
(visible in frame-0 entrance), NEVER animates, anchored BL ("ARMANDO" big / "SUMMIT"
small). The white-bordered PIP slides in from the lower-right (faint at frame 0,
settled by frame 2); the slide fades up on the left two-thirds. All confirmed.

**Skeptic's note:** some allin frames (the 4-up video-conference grid / fullscreen
speaker shots, e.g. HGbA6ze0_3M) show the "ALL IN" wordmark with no obvious panel
box. Our chyron always draws the navy panel. The molecule's own §P1 analysis cites
the navy panel as the DOMINANT lockup treatment (11/12), and the SUMMIT-set RGB
above confirms a navy element behind the lockup — so the panel is faithful to the
dominant pattern. `PersistentEventLockupChyron16x9` is a SHARED molecule (not edited
here). No change recommended — the navy-panel treatment is correct.

**Decision: VALIDATE, left UNTOUCHED.** No safe minimal in-comp edit available; the
flat backdrop default (vs an optional satellite `backdrop` image) is intentional.
