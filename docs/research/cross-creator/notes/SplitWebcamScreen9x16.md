# SplitWebcamScreen9x16 ↔ mreflow (Matt Wolfe / Future Tools)

**Creator source frames:** `references/creators/mreflow/b6Ek6-E5V88` & `bQN-D8qeAgg`
frame-008 (TopAndBottomSplitWithSeamCaption9x16 — the 9:16 Shorts split);
`8Jw5Wa_8K0Y/frames/*` (16:9 corner-PIP variant). Pattern documented in
`references/creators/mreflow/ANALYSIS.md` §4/§5 (TopAndBottomSplitWithSeamCaption9x16).

## mreflow's signature split-screen pattern (9:16 Shorts)
- TOP ~45%: app / article / X-post screenshot (often on white).
- BOTTOM ~55%: full-bleed home-studio face-cam.
- A **black rounded PILL caption** ("using Plaid", "they just said") sitting
  EXACTLY on the seam — single TikTok-style word group, white sans, ~40px padding.
- Karaoke advances word-by-word (pop-in); `hard-cut` between split-mode and
  full-bleed-payoff mode. The seam-riding caption is the load-bearing chrome.

## What our template does (judging CHROME + LAYOUT — halves are placeholders)
NOTE: this comp is documented/registered as @midu.dev's "WebcamScreenshareCallout"
(Template A) — top webcam / bottom screen + big accent seam-callout words. We are
cross-checking it against mreflow's structurally-identical split.

**Structural matches (the pattern):**
- Two-half vertical split with a solid divider SEAM band straddling the midline. ✓
- A caption element that **rides the seam** at left / center / right anchors,
  keyword-anchored to spoken-word timings with a spring/pop-in entrance — this is
  exactly mreflow's seam-caption + karaoke-advance grammar. ✓ (Confirmed: "BOOM"
  pops in at seam-left ~1.6s, "15× MÁS BARATO" at seam-center ~4.2s.)
- Hard-cut / per-keyword advancement motion grammar. ✓
- Optional top breadcrumb chyron over the upper half. ✓

**What differs from mreflow specifically:**
- **Seam-caption treatment:** ours is BARE accent-colored Inter-800 words (130px,
  drop-shadow, no container). mreflow's is a **BLACK ROUNDED PILL** with white sans.
  This is mreflow's single most distinctive chrome element — but the naked-accent-
  word treatment is @midu.dev's OWN documented signature, and this comp is the
  midu.dev template. Forcing a black pill would make it LESS faithful to its
  registered owner (midu.dev) to chase mreflow's flavor.
- **Half assignment:** midu.dev = webcam-top / screen-bottom; mreflow = screen-top /
  face-bottom (inverted). But which footage goes in which half is a CONTENT/caller
  decision (`webcamImageUrl` / `screenImageUrl`), not template chrome — both halves
  are generic.
- Palette is cream/editorial (midu.dev house grammar), not mreflow's dark RGB studio.

## Score: 7/10 — VALIDATED (structural match; chrome belongs to midu.dev)
The split + seam + seam-riding keyword caption + karaoke timing + hard-cut grammar
faithfully capture the STRUCTURE of mreflow's TopAndBottomSplitWithSeamCaption.
The specific black-pill caption chrome is mreflow's flavor, but this template is
midu.dev's and its naked-accent-word seam callout is midu.dev's documented
signature. Per the cross-creator framing (don't break a different creator's owned
treatment), I am NOT swapping in a black pill — that would degrade fidelity to the
template's registered owner. Left UNTOUCHED.

RECOMMENDATION (not made): if a dedicated mreflow-flavored sibling is ever wanted,
add an opt-in `seamCaptionStyle: "pill" | "naked"` flag that wraps the CalloutOverlay
text in a black `border-radius:9999px` lozenge with white text + ~40px padding —
that would let one template serve both creators without changing the midu.dev default.
