# KaraokeWithBlueChipPullout9x16 ↔ natebjones

**Creator pattern:** Nate B Jones C7 / `KaraokeWithBlueChipPullout9x16` (Shorts caption variant).
**Spec citation:** `references/creators/natebjones/ANALYSIS.md` §2 C7 (anchors `LDb0mXNowF4`, `pW6JKTf95lo`, `6_7Tk0ZH9bU` — C7 ran on 100% of the Wave-7 Batch-3 Shorts).
**Reference frames:** `references/creators/natebjones/DVS-cTSVKv4/frames/v2-anim-01-frame-001..004-t54s.jpg` — the green-current-word karaoke baseline on talking-head footage + lower-right `@nate.b.jones` handle-glyph pill.

## Signature pattern (C7)
Standard green-current-word karaoke caption baseline (bold, lower third, current word GREEN / others WHITE, heavy dark stroke for legibility over footage) PLUS a **blue rounded-pill keyword chip** that slides in from the RIGHT edge into the lower-third for ONE keyword per beat, holds ~1.5–2s while spoken, then slides back out before the next chip pulls in. Persistent handle chip lower-right is the only continuous chrome. Per ANALYSIS §"Implication" (lines 179-182): Nate-grammar Shorts STRIP the dark-slate cards AND the helmet watermark backplate — pure talking head + caption layer.

## What matches (our render — verified across t=0.5/1.3/2.5/3.9s)
- **Blue keyword chip pullout** — THE distinguishing C7 feature — works exactly: chip "Claude" → "best AI" → "production code" slides in from the right into the lower-third, one per beat, smooth slide-in/hold/slide-out (no hard cut). This composition owns the chip SCHEDULE itself (the molecule's single chip can't slide out) — implemented correctly.
- **Green current word + white spoken words** karaoke baseline running continuously underneath. Matches Nate's "HAS **BUILT** A" (BUILT green).
- **Pure black background, NO slate cards, NO watermark backplate** — correctly follows the C7 "strip everything" Shorts grammar.
- **Persistent handle chip lower-right** (`@armandointeligencia` pill) — matches Nate's lower-right handle pill (only cross-lane chrome).
- Bold heavy caption type in the lower third; chip color `#3FB8FF` reads as Nate's "blue rounded pill". Faithful.

## Gaps found (skeptical compare vs ref frame-001) — ALL in the shared molecule, NOT this comp
The karaoke *text styling* diverges from Nate's in four ways, but every one is owned by the shared `src/components/captions/EditorialCaption.tsx` molecule (consumed here read-only in `register: "custom"`), which is OFF-LIMITS for this QA pass. Documented, not edited:
1. **Case.** Nate's karaoke is consistently **UPPERCASE** ("WALLED GARDEN OF", "HAS BUILT A"). Ours renders sentence-case ("Claude is the best AI"). `EditorialCaption` has NO `textTransform`/`uppercase` style prop (word `fontFamily: "Inter"` + casing are hardcoded at lines ~378-398) — cannot be flipped from this comp via props.
2. **Upcoming-word color.** Nate shows past AND upcoming words solid WHITE (only current is green). Ours dims upcoming words to `${inkColor}66` (white @40% → gray). `futureColor` is hardcoded in `EditorialCaption` (~line 236).
3. **Left accent bar.** `EditorialCaption` always draws a `borderLeft: 4px solid ${accentColor}` (green rule) at line 359 — Nate has NO left rule; his caption is centered with no bar. Not gated by any prop.
4. **Alignment / box.** `EditorialCaption` forces `justifyContent: center` inside a bordered box; Nate's karaoke floats with just a text stroke, no box border.

The blue chip text is title-case ("best AI"); Nate's Shorts lean all-caps, but the C7 chip glyph isn't directly visible in the available frames, so uppercasing the chip would be a guess (low confidence) — left as-is.

## Verdict
**VALIDATE — no in-comp edit.** Everything `KaraokeWithBlueChipPullout9x16.tsx` actually owns (blue chip pullout motion + schedule, black bg, handle chip) is a faithful capture of the C7 pattern, and the chip-pullout motion timing is correct across the 4-frame sweep. The remaining fidelity gaps are entirely karaoke-text-styling concerns living in the shared `EditorialCaption` molecule, which the brief forbids me from editing. No safe, high-confidence change exists within this composition's surface.

**Score: 8/10** (faithful C7; capped by shared-molecule karaoke styling that reads less "Nate" than uppercase-all-white-no-bar would).

## RECOMMENDED shared-molecule change (NOT made — `EditorialCaption` is off-limits)
To make every Nate-grammar Shorts caption (this comp + any future C7 sibling) match Nate's karaoke more closely, add to `src/components/captions/EditorialCaption.tsx` a small, additive set of style options (all defaulted so no existing call site changes):
- `textTransform?: "none" | "uppercase"` (default `"none"`) — applied to each word span; pass `"uppercase"` from this comp.
- A `register: "karaoke"` preset (or a `futureColor` style override) so past AND future words are solid white with only the current word green — instead of the dimmed-future custom-register behavior.
- `showAccentBar?: boolean` (default `true`) gating the hardcoded `borderLeft` rule at line 359, and a `boxless?: boolean` to drop the box border/background — so on-footage karaoke can float with a text stroke (no left bar, no box), matching Nate's Shorts.
Then this comp would set `register: "karaoke"`, `textTransform: "uppercase"`, `showAccentBar: false`, `boxless: true` to reach ~10/10 against Nate's reference — with zero risk to the ~20 other comps that consume `EditorialCaption`, since all new options default to today's behavior.


## Phase-3 triple-vote (2026-06)
KaraokeWithBlueChipPullout9x16 ↔ natebjones: 8/10 — IMPROVED: panel 8/8/8 PASS; proactively fixed the karaoke inter-word spacing collapse (active scaled word merging with neighbors, "CLAUDEIS") by widening the flex word-gap proportional to font size in boxless mode (boxed renders byte-unchanged).
