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
