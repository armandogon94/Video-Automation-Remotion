# @AlexHormozi — OVER-SPEAKER OVERLAY analysis (Wave-8)

> **NEW analytical axis (not previously cataloged).** All prior Hormozi work (Shorts `ANALYSIS.md` §1–7, long-form Wave-6 H1–H6/M1–M25, Wave-7 batch-3 NEW-H7…NEW-H13) cataloged either (a) caption-layer typography, or (b) **full-screen cutaway B-roll** — a graphic on a monotone/colored/dark background that *replaces* the speaker. This file catalogs the OPPOSITE: motion graphics **composited ON TOP OF / BESIDE Hormozi while he stays on-camera talking to the lens**. This is the architectural key to compositing graphics over the user's OWN talking-head footage.
>
> **Scraped:** 2026-05-31 · 4 videos pulled (480p) · 3 fully analyzed for over-speaker overlays + 1 surveyed-and-rejected (whiteboard-cutaway-only). All sources deleted after frame/clip extraction.
> **The distinction that defines this axis:** in a **cutaway** the speaker is GONE (graphic owns the whole frame on a flat bg). In an **over-speaker overlay** the live talking-head footage is still the base layer (his studio set, his face, his gestures all visible) and the graphic is a *transparent-background layer* pinned to a corner/side/lower-third, often occupying only 25–45% of the frame, leaving him visible and gesturing. Many Hormozi beats START as an over-speaker overlay then EXPAND into a full cutaway — the over-speaker phase is the one we want.
>
> **Why he can do this and Adam Rosler can't:** Hormozi shoots a real studio talking-head (`StudioDeskFlannelTalkingHead`, NEW-H9). The graphics are an editor-added layer over that footage. Adam Rosler has NO face-cam at all (his `ANALYSIS.md` line 267/273/285: "no face-cam, no studio, zero footage" — pure procedural graphics on dark bg). So over-speaker compositing is structurally impossible for Adam. See §5.

---

## 0. Videos processed

| ID | Title | Dur | Chassis | Over-speaker verdict |
|---|---|---|---|---|
| `sGakuNs9mT4` | How to Speak So Well People Give You Money | 21:28 | Studio-desk (H9) | **RICH** — yellow-glow word callouts, floating numbered-chip row, building bullet list, diagnostic callout card |
| `fr78adfAnuA` | How to Use AI in Your Business in 2026 | 15:53 | Studio-desk (H9) | **RICH** — side bullet menu, building question list, icon+stat chip stack, brain/emoji icon pops, brand-logo pop |
| `jfW6gL6hKhk` | If I Wanted to Make My First $100K in 2026 | 15:45 | Studio-desk (H9) | **RICHEST** — right-anchored building numbered list (multi-beat), columnar-number-with-dividers, floating tweet card, book-cover cards, summary "6 STEPS" recap list |
| `q9qBqnhdWKw` | how to outlearn everyone | 30:13 | Studio-desk (H9), but **whiteboard-cutaway-heavy** | **REJECTED** — graphics happen almost entirely in full-screen overhead-whiteboard cutaways (already cataloged H6). Almost no over-speaker compositing. Surveyed via 2 contact sheets, no dense reads spent. |

Frame anchors use `videoID@tNNNs` where tNNNs = seconds into the source. Coarse contact sheets (1f/15s, 6×5 tiles) and key dense frames saved under `references/creators/alexhormozi/<id>/frames/`.

---

## 1. The over-speaker overlay catalog (12 distinct patterns)

Each entry: **name · anchor · what it is · how it animates (transitionVerb) · how it differs from a full-screen cutaway · replicability.** Names are PascalCase, intended as future component names.

### OV1 — `YellowGlowWordCallout` *(the most frequent over-speaker beat)*
- **Anchor:** `sGakuNs9mT4@0s` ("saying the RIGHT WORDS"), `sGakuNs9mT4@90s` ("C.L.O.S.E.R framework"), `sGakuNs9mT4@120s` ("SALES"), `fr78adfAnuA@225s` ("NECESSARY EVIL"), `jfW6gL6hKhk@405s` ("...LEARNING / SAME CONDITION").
- **What:** 1–3 words in bold ALL-CAPS yellow (`~#FFE000`) with a soft yellow glow halo + thin black outline, pinned bottom-left or beside his head. Transparent bg — his studio set shows through. Distinct from the lower-third karaoke track: it's BIGGER, color-isolated, and positioned as a graphic, not a subtitle.
- **transitionVerb:** `Scale-pop the word group from 0.85→1.0 over 5 frames with a 2-frame overshoot; fade the yellow glow (text-shadow 0 0 14px rgba(255,224,0,0.8)) in over the same window; hold ~24 frames; cut out (no fade).`
- **Differs from cutaway:** lives in a corner over live footage; never owns the frame, never on a flat bg.
- **Replicability:** TRIVIAL. Pure CSS text + glow over a `<Video>` base. This is the #1 build.

### OV2 — `FloatingNumberedChipRow`
- **Anchor:** `sGakuNs9mT4@105s` (purple chips "1 2 3 4 5" floating in a horizontal row over him gesturing; `sGakuNs9mT4@195s` single enlarged "3" chip).
- **What:** a horizontal row of rounded-square purple chips, each a white-bold numeral, floated mid-frame OVER him. One chip enlarges/brightens as he names that item. (Note: at `sGakuNs9mT4@106s` this same overlay then EXPANDS into a full-screen C.L.O.S.E.R. acronym list on dark bg — confirming the overlay→cutaway escalation. The over-speaker phase is the row floating over him.)
- **transitionVerb:** `Stagger-in 5 chips left-to-right, 3 frames apart, each rising 12px with a spring settle; to highlight item N, scale chip N to 1.25 and lift sibling opacity down to 0.5 over 6 frames.`
- **Differs from cutaway:** chips float over the live set; the cutaway version (full acronym list) is on flat `#1a1530`.
- **Replicability:** EASY. Row of pill `<div>`s + active-index prop.

### OV3 — `BuildingBulletListOverSpeaker` *(the headline pattern — appears in all 3 rich videos)*
- **Anchor:** `sGakuNs9mT4@1260s` (5-item list bottom-left: "SPEAK LOUD ENOUGH / SPEAK SLOWLY ENOUGH… / ARTICULATE… / PAUSES / FREQUENCY OF VOICE"), `fr78adfAnuA@75s` (right-side menu "HIGH-LEVEL STRATEGY / HUMAN RESOURCES / COMMUNICATION / MARKETING"), `fr78adfAnuA@480s` (left questions "COULD A BOT DO SCHEDULING? / CAN IT TRANSCRIBE…? / CAN IT AUTOMATE?"), `jfW6gL6hKhk@510-570s` ("HOW TO LEARN" 1→5 numbered build), `jfW6gL6hKhk@90s` ("CUT ALL COST" + sub-bullets), `jfW6gL6hKhk@900-930s` ("6 STEPS TO GETTING YOUR FIRST $100,000" recap, 1→5).
- **What:** a heading (yellow bold caps) + a vertical list of bullets/numbered items, anchored to ONE side (left-third or right-third) over the live talking-head, occupying ~30–40% width and leaving him visible on the other side. Items **accumulate one per spoken beat** — the list literally builds while he keeps talking on camera. Bullets are small purple/yellow markers; body text is white sans with drop-shadow. Earlier-revealed items often dim to ~0.6 opacity so the newest item reads brightest.
- **transitionVerb:** `Fade+slide the heading in from the side edge over 8 frames; reveal each list item on its spoken beat — slide up 10px + fade 0→1 over 6 frames; when a new item appears, drop prior items to 0.6 opacity; hold the full list 30–60 frames after the last item, then fade the whole block out over 10 frames. Anchor block to left- or right-third (NEVER center — center is reserved for cutaways).`
- **Differs from cutaway:** anchored to one side over live footage; he's visible and gesturing toward it. The cutaway equivalent (e.g. `q9qBqnhdWKw`'s overhead whiteboard) replaces him entirely.
- **Replicability:** EASY–MEDIUM. List + per-item enter-frame array + dim-prior logic. **This is the single highest-leverage build for "graphics over the user's own footage."**

### OV4 — `IconStatChipStack`
- **Anchor:** `fr78adfAnuA@720s` (purple pill stack "⚡ FASTER / 💲 CHEAPER" lower-left over him), `sGakuNs9mT4@450s` ("5 FREQUENCY OF VOICE" — purple numeral chip + white pill label).
- **What:** a small vertical stack of 1–3 rounded pills, each `icon + bold-caps label`, anchored lower-left. Purple bg pills (`~#6B3FD4`), white text. A compact version of OV3 for 1–3 items.
- **transitionVerb:** `Slide each pill in from the left edge, 4 frames apart, with a 6px overshoot; pulse the icon (scale 1.0→1.15→1.0 over 8 frames) on entry.`
- **Differs from cutaway:** tiny corner element over live footage.
- **Replicability:** EASY. Pill component with `icon`+`label` props, stacked.

### OV5 — `DiagnosticCalloutCard` (label + body, over speaker)
- **Anchor:** `sGakuNs9mT4@1050s` & `@1125s` ("IT SOUNDS LIKE: / You have a / MARKETING ISSUE"), `fr78adfAnuA@615s` ("HUMAN PSYCHOLOGY IS NOT GONNA CHANGE" + glowing brain icon top-right).
- **What:** a 2–3 line text block — a small yellow caps LABEL line + larger white/yellow body — anchored top-left or top-right corner, transparent bg, over him. Reads like a "callout box" but without a box; held while he elaborates.
- **transitionVerb:** `Type-on or fade-in the label line first (6 frames), then fade the body line(s) in 6 frames later; optional accompanying icon scale-pops top-corner; hold for the spoken sentence; fade out 10 frames.`
- **Differs from cutaway:** corner-anchored over live footage; the cutaway version would be a full-screen equation/matrix on dark bg (e.g. `sGakuNs9mT4@1140s` "INCONSISTENT LEAD FLOW = MARKETING ISSUES").
- **Replicability:** EASY. Two stacked text runs + optional icon slot.

### OV6 — `FloatingTweetCardOverSpeaker` *(corrects a prior "REFUTED" finding)*
- **Anchor:** `jfW6gL6hKhk@465s` (an "Alex Hormozi @…" tweet card with avatar + verified check + body text, floated beside his head over the live set).
- **What:** a rounded white card styled as a social post (avatar, handle, verified badge, multi-line body), composited to one side over the talking-head.
- **Note:** the Shorts `ANALYSIS.md` §5 marked "Hormozi uses animated tweet cards" as **REFUTED for Shorts**. This **CONFIRMS it for long-form, as an over-speaker overlay** (not a Shorts pattern, not a full-screen one). The prior verdict stands for Shorts; this is a new long-form finding.
- **transitionVerb:** `Slide the card in from the right edge with a 6px overshoot over 8 frames; optional 0.3px idle float bob; hold; slide out.`
- **Differs from cutaway:** card floats beside him; M23 `FullscreenSocialPostScreenshot` (Wave-6) is the full-screen cutaway twin.
- **Replicability:** EASY. Reuse a `<SocialPostCard>` molecule, anchor to side.

### OV7 — `ColumnarNumberWithDividers`
- **Anchor:** `jfW6gL6hKhk@512s` (three large "1" numerals separated by thin vertical divider lines at lower-third, with a yellow label "ONE PRODUCT OR SERVICE" pinned under the active column — the "1 product / 1 avatar / 1 channel" framing).
- **What:** N large faint-white numerals in a row, separated by full-height thin divider strokes, anchored lower-third over him; a yellow caps label appears under whichever column he's naming.
- **transitionVerb:** `Draw the divider strokes top-to-bottom (stroke-dashoffset) over 8 frames; fade the numerals in; reveal/swap the active-column yellow label with a 4-frame slide-up as he names each.`
- **Differs from cutaway:** lower-third strip over live footage; he gestures up at it.
- **Replicability:** EASY. Flex row of numerals + dividers + active-label.

### OV8 — `FloatingProductCard` (book covers over speaker)
- **Anchor:** `jfW6gL6hKhk@165s` & `@180s` (book covers "$100M MODELS", "$100M LEADS/OFFERS" floated beside his head, often with a "LINK IN THE DESCRIPTION" yellow callout).
- **What:** one or more product/book-cover images composited to one side over the talking-head, frequently paired with a CTA callout (OV1-style).
- **transitionVerb:** `Slide cover(s) in from the right with overshoot; optional slow idle bob; if multiple, fan them with a 6° rotation offset and 8-frame stagger.`
- **Differs from cutaway:** cover floats beside him vs. a full-screen product-shot cutaway.
- **Replicability:** EASY. `<img>` with slide-in; CTA pill reuses OV1.

### OV9 — `PersistentCornerBadge`
- **Anchor:** `fr78adfAnuA@450s`+ (a framed Guinness-record photo as a persistent prop/badge top-left, present across many seconds), `jfW6gL6hKhk` recurring corner marks.
- **What:** a small image/logo badge held in a top corner across a long stretch — a persistent watermark-style overlay rather than a beat-synced one. (Hormozi's is partly a physical desk prop, but functionally reads as a corner badge layer.)
- **transitionVerb:** `Fade in once over 10 frames; hold persistently; never re-animate. Pin to corner with safe-margin padding.`
- **Differs from cutaway:** never owns the frame; it's chrome, like a logo bug.
- **Replicability:** TRIVIAL. Maps to existing `BrandWatermark.tsx` concept.

### OV10 — `IconPopOverSpeaker` (semantic icon beside head)
- **Anchor:** `fr78adfAnuA@390s` (emoji equation "🍎 = 🍎" floating beside his head), `fr78adfAnuA@615s` (glowing brain icon top-right), `fr78adfAnuA@180s` (purple briefcase icon growing).
- **What:** a single semantic icon/emoji (or a tiny icon equation) scale-popped beside his head over the live set — compresses a claim into a glyph. The over-speaker cousin of the Shorts `HookEmojiStrip` (pattern J).
- **transitionVerb:** `Scale-pop the icon 0→1.0 over 6 frames with overshoot; optional continuous glow pulse for "concept" icons (brain); hold for the spoken phrase; pop out.`
- **Differs from cutaway:** single glyph in a corner over footage, not a full illustrated scene.
- **Replicability:** EASY. Icon/emoji with scale-pop; reuse glow from OV1.

### OV11 — `BrandLogoPopOverSpeaker`
- **Anchor:** `fr78adfAnuA@945s` (the "skool" wordmark animating in beside him).
- **What:** a third-party or own brand wordmark/logo animated in to one side over the talking-head when he name-drops a tool/platform.
- **transitionVerb:** `Fade+scale the wordmark in (0.9→1.0, 6 frames); optional letter-by-letter color reveal; hold; fade out.`
- **Differs from cutaway:** logo beside him vs. a full-screen UI screenshot cutaway.
- **Replicability:** TRIVIAL. `<img>`/SVG with fade-scale.

### OV12 — `AnimatedOpenerTitleOverDarkSet`
- **Anchor:** `fr78adfAnuA@0s` ("HOW TO USE AI IN YOUR BUSINESS" + glowing purple AI-orb).
- **What:** the cold-open title — large kinetic title text + a hero graphic, composited over a darkened/blurred version of his own set (not a flat bg). Borderline between overlay and cutaway, but the set is still visible behind, so it's an over-(darkened-)speaker title.
- **transitionVerb:** `Push the title up from below with a blur-to-sharp over 12 frames; orbit/pulse the hero graphic behind it; darken the live base layer to ~40% brightness during the title, then lift back to 100% as it clears.`
- **Differs from cutaway:** base footage stays visible (dimmed) behind the title.
- **Replicability:** EASY–MEDIUM. Title + brightness-dim on base `<Video>`.

---

## 2. Cross-cutting grammar of Hormozi's over-speaker layer

1. **Anchor discipline:** over-speaker overlays NEVER sit center. They go **left-third, right-third, lower-third, or a corner**. Center-frame is reserved for full cutaways. This is the single most important rule for "composite over the user's own footage without covering their face."
2. **Color isolation:** the overlay layer speaks in **yellow (`~#FFE000`) for emphasis + purple (`~#6B3FD4`) for chips/structure**, distinct from the white karaoke caption track, so the eye separates "graphic" from "subtitle."
3. **Beat-synced accumulation:** lists/chips build one item per spoken beat (OV2, OV3, OV7), with prior items dimming. The audio carries the timing; the overlay is a visual checklist.
4. **Escalation:** several beats START as an over-speaker overlay then EXPAND to a full-screen cutaway (OV2 → C.L.O.S.E.R. acronym; OV5 → equation matrix). A `SpeakerOverlayScene` should support an optional `escalateToFullscreenAtFrame` to model this.
5. **Glow + drop-shadow for legibility:** every over-speaker graphic carries either a yellow glow or a thick black drop-shadow so it survives a bright/busy talking-head background — same sound-off-readability logic as the captions.
6. **Dim-the-base for titles only:** the base footage is dimmed only during the cold-open title (OV12); during beat overlays the base stays at full brightness.

---

## 3. Proposed components — transparent-bg overlays over a base talking-head video

Target foundation: a planned **`SpeakerOverlayScene`** = `full-bleed base <Video> (the talking-head) + caption layer + overlay slot`. Every component below renders into that overlay slot with a transparent background and an `anchor` prop. None of them touch the base video except OV12 (which dims it).

### Proposed `SpeakerOverlayScene` foundation (the chassis)
```
<SpeakerOverlayScene
  baseVideoSrc            // user's own talking-head footage (full-bleed)
  captions?               // existing src/components/captions/ track
  overlays={[             // array of timed overlay layers
    { component, anchor: 'left-third'|'right-third'|'lower-third'|'top-left'|'top-right'|'beside-head',
      startFrame, durationFrames, props, escalateToFullscreenAtFrame? }
  ]}
  dimBaseTo?              // 0–1, only used by opener titles (OV12)
/>
```
This is the architectural key requested: it lets us pin ANY of the molecules below over the user's OWN footage, beat-synced, without covering their face.

### Molecule / component list (maps each OV pattern → build)

| # | Component | Source pattern(s) | Anchor default | Effort | Notes / reuse |
|---|---|---|---|---|---|
| 1 | `<YellowGlowWordCallout text emphasis>` | OV1 | beside-head / lower-left | S | #1 priority; pure CSS glow. Reuse `TextEmphasis.tsx` `yellow-glow` style (Shorts pattern I/K). |
| 2 | `<BuildingListOverlay heading items activeIndex dimPrior>` | OV3 | left-third / right-third | M | **Highest leverage.** Beat-synced accumulation + dim-prior. The "graphics over your own footage" headline build. |
| 3 | `<NumberedChipRow chips activeIndex escalateAtFrame?>` | OV2 | center-band (over speaker) | S | Models overlay→cutaway escalation. |
| 4 | `<IconStatChipStack pills>` (icon+label, purple) | OV4 | lower-left | S | Compact OV3. |
| 5 | `<DiagnosticCalloutCard label body icon?>` | OV5 | top-left / top-right | S | Label+body text runs, no box. |
| 6 | `<FloatingSocialCard avatar handle body verified>` | OV6 | right-third (beside head) | S | Reuse/adapt a `SocialPostCard`; over-speaker anchor. Long-form-confirmed tweet card. |
| 7 | `<ColumnarNumbers values activeLabel>` | OV7 | lower-third | S | Numerals + dividers + active label. |
| 8 | `<FloatingProductCard images cta?>` | OV8 | right-third | S | Slide-in covers + optional OV1 CTA pill. |
| 9 | `<PersistentCornerBadge src>` | OV9 | top-left/right corner | S | Maps onto existing `BrandWatermark.tsx`. |
| 10 | `<IconPopOverSpeaker icon glow?>` | OV10, OV11 | beside-head / top corner | S | One molecule covers semantic-icon AND brand-logo pops (`isBrandMark` flag). |
| 11 | `<OpenerTitleOverDimmedSet title heroGraphic? dimBaseTo>` | OV12 | full-frame title, base dimmed | M | Only component that dims the base `<Video>`. |

**Build order recommendation:** (1) `SpeakerOverlayScene` chassis → (2) `YellowGlowWordCallout` → (3) `BuildingListOverlay` → then the rest are quick variations sharing the same anchor + enter/exit primitives. The anchor system + a shared `enter/hold/exit` timing helper covers ~80% of every molecule.

---

## 4. How this differs from everything already cataloged

| Already cataloged | This axis |
|---|---|
| Shorts `ANALYSIS.md` C/G/I/K/M = **caption-layer** typography (subtitle track) | Over-speaker overlays are a **separate graphic layer** above the caption track, color-isolated, side-anchored, beat-synced. |
| Wave-6 H1–H6 + Wave-7 H7–H13 = **full-screen cutaways** (whiteboard, split-cam, dashboards, letterbox quote) that REPLACE the speaker | Over-speaker overlays KEEP the speaker as the base layer; graphic owns ≤45% of frame, side/corner anchored. |
| Wave-6 M23 `FullscreenSocialPostScreenshot` (tweet owns frame) | OV6 floats the tweet card BESIDE him over live footage. |
| Wave-7 NEW-H9 `StudioDeskFlannelTalkingHead` (the base chassis) | This axis is what gets COMPOSITED ON TOP of that chassis. NEW-H9 is the canvas; OV1–OV12 are the paint. |

The escalation finding (overlay→cutaway, §2.4) is the bridge between the two axes: the same content beat can live in either, and Hormozi routinely promotes an over-speaker overlay into a full cutaway mid-beat.

---

## 5. Does Adam Rosler do the same? — NO (structural)

Skimmed `references/creators/adamrosler/ANALYSIS.md` (no new downloads).

- Adam has **no face-cam, no studio, zero real footage** — every reel is "pure procedural motion graphics on solid dark navy/black" (his §Tooling-guess, lines 5/267/273). His own cross-reference table (line 285) states the contrast explicitly: **"Hormozi: typography-over-real-video (face-cam under captions); Adam: typography-over-procedural-graphics."**
- Therefore **over-speaker compositing is structurally impossible for Adam** — there is no speaker to composite over. His graphics ARE the frame (they're all "cutaways" by our taxonomy, except there's nothing to cut away from).
- **Implication for our build:** Adam is the reference for the *full-screen procedural-graphic* lane (cutaway content); Hormozi is the only strong reference for the *over-your-own-footage* lane. The `SpeakerOverlayScene` chassis (§3) is a Hormozi-derived capability with no Adam analogue. If Armando records his own talking-head, OV1–OV12 are the patterns to layer over it; if he wants faceless procedural reels, that's the Adam/Nate lane instead.

Other face-cam creators in the set (per Wave-7 cross-creator notes: Igor, Matt Wolfe studio-desk chassis) are the candidates most likely to share this over-speaker layer — worth a future targeted pass.

---

## 6. Sources & disk hygiene

- Channel: https://www.youtube.com/@AlexHormozi
- Scraped: 2026-05-31 · `yt-dlp 2026.03.17` (`-f bestvideo[height<=480]+bestaudio`), `ffmpeg 8.1`
- Videos: `sGakuNs9mT4`, `fr78adfAnuA`, `jfW6gL6hKhk` (analyzed), `q9qBqnhdWKw` (surveyed, rejected — whiteboard-cutaway-only)
- Source MP4s held in `/tmp/wave8-overlay-hormozi/`, deleted ONE AT A TIME after each video's frame+clip extraction; scratch dir `rm -rf`'d at task end.
- Coarse contact sheets (1f/15s, 6×5 tiles) + key dense frames: `references/creators/alexhormozi/<id>/frames/` (`*_sheet_*.jpg`, `overlay-*.jpg`).
- Reference clips (audio-stripped, 480p, ≤2MB): `docs/research/wave-6/references/alexhormozi/<id>-overlay-{01,02}.mp4` (6 clips total, all <64KB).
- Image-read budget: ≤2 dense frame reads per video (single-path sequential), plus contact-sheet survey reads. No bundled multi-image reads.
