# @simonhoiberg — Wave 4 Consensus (5 voters)

> **Method:** Jaccard-style consensus across 5 independent Opus voters. HIGH = ≥3, MED = 2, LOW = 1.
>
> **Headline:** Prior ANALYSIS lumped 8/12 reels into one "TalkingHeadStudio" template. V3 invalidates this: there are **at least 3 distinct studios** (CloseStudioWhiteBrick / LoftDeskWide / KeyedFounderOverBroll), and the highest-liked reel (186 likes vs 18-92 elsewhere) is **`KeyedFounderOverBroll9x16`** — chroma-key Simon over timed-Amazon/data-center B-roll — which prior wrote off as "talking head, don't replicate." Also missed entirely: **`GenerativeBrollWithDiegeticUI9x16`** — AI-generated robot-boardroom scene with floating GitHub UI as holographic projection. Simon's "polished" is the discipline to UNDER-edit.

---

## HIGH-CONFIDENCE FINDINGS (3+ voters)

### 1. Slow cadence + dwell beats — "polished" = discipline to under-edit 🔴 SHIP-FIRST
**Votes:** V1 (8/12 reels = static talking-head implies slow), V3 (~4s B-roll cuts), V4 (#3 "dwell beat" 1-1.5s zero parallax + cadence 5-25s/shot), V5 §A ("~70% no on-screen text — restraint as identity")

Simon **never sub-2s cuts**. Cadence band: 5-7 s on busy reels, 20-25 s on calm. The signature move is the **dwell beat** — after expressive frames, he physically arrests his body (hands stop, eyes locked, deadpan ~0.8-1.5 s). Held stillness AS climax.

V4: "An amateur version would (1) snap things in fully formed, (2) cut on a constant 2 s grid, (3) use bouncy springs everywhere, (4) leave the background dead. Simon does the opposite. **The discipline to under-edit is the polish.**"

**Action:** Pipeline needs `dwellBeat(durationMs=1200)` capability — zero-parallax / zero-animation scene that lands on the punchline word from Whisper transcript. Default cadence band 5-10s active / 20-25s calm.

### 2. Static YouTube end-card on hard-cut, holds 🔴
**Votes:** V1 T7 (≥5/12 endings), V2 #3 (top-10 ranked), V4 #5 ("the only animated graphic, and it STAYS STILL — hard cut, no motion graphics, no parallax, no shimmer")

Red YouTube glyph + "Watch Now" + thumbnail-sized card with corner brackets + `@SimonHoiberg`. **Where most creators escalate motion at CTA, Simon decelerates to a freeze.** Contrast with preceding edit IS the call to action.

**Action:** Build `<YouTubeEndCard>` template: blurred YouTube interface bg + Watch Now badge + thumbnail with corner brackets + handle. Hard cut in, 1.5-2 s hold, NO animation.

### 3. Layer-card stack with purple pill kicker 🔴
**Votes:** V1 T6 (2/12 reels but signature), V2 #1 (top-10 ranked), V3 N5+N6 (spec corrections), V5 §A (overlay card structure)

Three white rounded pill-cards (border-radius `9999px`, NOT 24px) bleeding 10% off the right edge. Purple `#5C2EE5` "Layer N" pill kicker + bold black headline. **Icons are pixelated/redacted brand logos** (Cursor/Lovable/v0), not "stylized." Vertical stagger entrance with elastic ease.

**Action:** Spec corrections to existing `LayerCardStack9x16`:
- `borderRadius: '9999px'` (pill)
- `width: '110%'` (bleed-right by 10%)
- `redactedIconMode: 'pixelate' | 'silhouette' | 'generic'` prop
- Vertical stagger entrance with elastic ease

### 4. Accent purple as CONTAINER ONLY, never as text fill 🔴
**Votes:** V2 #29 (`#5C2EE5` brand purple), V5 §C/D (#1 typography lesson "container only, not letterform fill"), V3 (consistent across reels)

Simon's purple is **never the color of letterforms** — only fills (kicker pill backgrounds, brand glyphs). Inside the pill, text is pure white. Black is reserved for primary headline. This is a hard tri-color rule.

**Action:** Promote our brand `#D4AF37` gold to "container fill only" by convention. Pill backgrounds + watermark plate. Navy + deep navy = text colors. Off-white = paper.

### 5. Brick wall + warm bokeh + wood desk = built once, shoot forever 🔴
**Votes:** V1 T1 (8/12 reels), V2 #4 (top-10 brick+desk), V5 §B (paper `#F1EDE8`, brick `~#B8B0AA`)

The set IS the watermark. Brick `#B8B0AA` cool grey-purple, warm bokeh fairy lights `#C9892F` highlights, light-wood desk foreground with iPad/stylus/iPhone props in the lower third — **the exact same arrangement across 8 reels.** No watermark, no logo, no chrome — the *consistency* is the brand.

**Action:** When we eventually shoot real footage: build the set once, lock the camera, light it once. Replicates in our pipeline via avatar-pixar against a generated consistent backdrop.

### 6. Center-locked MS + tight CU jumpcut combo 🔴
**Votes:** V2 #5 (top-10 transitions + shots), V4 #1 ("shot-scale jumps do the work that 'transitions' do for other creators")

Wide-medium torso (anchor) → wide drone B-roll → tight CU → ECU with brow furrow in 16 seconds. **Four shot scales, two physical locations, no transition effects.** The scale itself delivers the punctuation. Hard cuts only.

**Action:** Templates that support B-roll should support multiple shot-scale presets (wide-medium / chest-up / ECU) and rely on hard cuts between them.

### 7. Sentence-driven A/V, not beat grid 🔴
**Votes:** V4 #4 ("welded to sentence, not beat grid"), V3 (audio-visual sync addition), V1 implicit (hard cuts on sentence boundary)

Cuts ride speech, music rides cuts. No music-bar quantization, no kick-drum-on-beat. Closer to a podcast-clip editor than a TikTok editor.

**Action:** Sync cuts to phoneme/word boundaries from `src/timing/align.ts` Whisper output. NOT to BPM.

### 8. Single-weight, no italics, one-line headlines only 🔴
**Votes:** V1 (implicit single-weight bombs), V2 #13/14 (Inter Black on white card), V5 §D (#1+#2 typography lessons — single-weight bombs over multi-weight hierarchies)

Two type sizes total (big black headline + small white pill kicker). One family. No italic in any Simon overlay. **One-line headlines only** — fits on one line by design. Forces copywriting discipline ("Vibe Coding", not "What vibe coding actually means").

**Action:** Add `maxHeadlineLength: 14` validation to template schemas. Throw / truncate visibly if exceeded.

### 9. NO burned-in word-by-word captions on talking-head 🔴
**Votes:** V1 implicit, V2 #39 ("absent across 8/9 talking-head reels"), V5 §A ("70%+ frames carry no on-screen text")

Simon relies on platform auto-CC (IG/YouTube) or omits captions entirely. **Restraint is the brand.** If our pipeline's TikTok-style burned captions are a differentiator, that's an *opportunity*, not a copy target.

**Action:** For Simon-inspired templates (`TalkingHeadDynamic9x16` variants), default `captionsEnabled: false`.

### 10. Hard cuts everywhere — no whips, no zooms, no wipes 🔴
**Votes:** V2 §6 (transitions inventory = jumpcut + hard-cut + slide-up only), V3 (confirmed across reels), V4 #5 ("hard cut, no motion graphics, no parallax, no shimmer")

**Cross-creator with Bilawal + Carlos + Stephan + DIYSmart** — HARD CUT dominance is the strongest cross-creator consensus in all of Wave 4.

**Action:** Reject built-in transition effects across the codebase. Default everywhere to hard cuts on sentence boundaries.

---

## MED-CONFIDENCE FINDINGS (2 voters)

| Finding | Voters | Action |
|---|---|---|
| **`KeyedFounderOverBroll9x16`** (Template A3 — chroma-key over timed B-roll) — HIGHEST liked reel in scrape | V3 N3 🔴, V1 not noticed (missed entirely) | Build new template — Simon's highest-performing format |
| **`GenerativeBrollWithDiegeticUI9x16`** (AI robots + floating GitHub UI as holographic projection) — highest production value | V3 N4 🔴, V1 not noticed | Build — Veo/Sora B-roll + Remotion-composited UI overlay |
| Split-screen demo lock — continuous bottom, cutting top | V4 #2, V2 #45 (split-screen shot) | Already partially covered by `SplitWebcamScreen9x16` — verify cutting-top vs continuous-bottom timing |
| Whiteboard insert (Procreate marker on paper) — handheld, real | V1 T4, V5 §C (handwritten Procreate-style), V3 N7 (Ken Burns not static) | Build `<WhiteboardScene>` using actual SVG marker strokes, NOT a font |
| 3-tier easing: typography overshoots (~3-5%), structure soft-lands, status snaps | V4 §2 hierarchy, V2 #17 elastic ease | Codify as three easing constants in `src/timing/easing.ts` |
| Off-white paper `#F1EDE8`, NOT pure `#FFFFFF` | V5 §B/G #3, V2 brand-color #30 | Add `--brand-paper: #F1EDE8` token — cross-creator with Carlos |
| LayerCard icon redaction (pixelate competitor brand logos) | V3 N6 | Spec correction |
| Diegetic active screen recordings on desk props | V3 N9, V4 (background lights as motion proxy) | Future polish — Remotion-rendered mini screen-rec in lower-left |

---

## LOW-CONFIDENCE FINDINGS (1 voter)

- V3 N1 (3-studio split — interesting analytically but doesn't change spec)
- V3 N10 Wardrobe / jewelry semiotics (subtle wealth signifiers)
- V3 N11 Pen-as-pointer gesture
- V3 N12 YouTube end-card cyan callout arrows (sub-detail)
- V4 cold-open is most-edited; energy settles (one example only)

---

## DELTA AGAINST PRIOR ANALYSIS.md

**Prior was right about:** LayerCardStack9x16 as a real template, Pentagram-style restraint, YouTube end-card structure, recurring desk props.
**Prior was wrong about:** "8/12 = same template" (three distinct studios), "Template A is just talking head — don't replicate" (highest-performing is chroma-key composite), "no zoom-ins on Template C" (post-zoom + animated cursor exist), "Template E is static" (Ken Burns pan exists), LayerCard border-radius = 24px (actually pill `9999px`), icons are "stylized" (actually redacted brand logos), Template D bottom panel is studio (actually 3-source composite with AI broll behind keyed face).
**Prior missed:** `KeyedFounderOverBroll9x16` (highest-engagement format), `GenerativeBrollWithDiegeticUI9x16` (highest production value), Ken Burns on whiteboard, prop-reveal substituting for cutaway, dwell-beat as climax.

---

## SPRINT 5 QUEUE (Simon-derived only)

🔴 **Must build:**
1. `dwellBeat(durationMs=1200)` capability — zero-animation scene aligned to punchline word
2. `<YouTubeEndCard>` static end-card template (hard cut in, hold)
3. `LayerCardStack9x16` spec corrections: pill-radius `9999px`, bleed-right `10%`, `redactedIconMode` prop, elastic-ease stagger
4. `maxHeadlineLength: 14` validation across template schemas
5. `--brand-paper: #F1EDE8` token (off-white not pure white)
6. Default `captionsEnabled: false` for Simon-inspired TalkingHead variants
7. 3-tier easing constants in `src/timing/easing.ts`: `TYPE_OVERSHOOT`, `STRUCTURE_SOFTLAND`, `STATUS_SNAP`

🟠 **Build later:**
- `<KeyedFounderOverBroll9x16>` template — chroma-key Simon/avatar over timed B-roll
- `<GenerativeBrollWithDiegeticUI9x16>` template — Veo/Sora B-roll + composited UI overlay
- `<WhiteboardScene>` template with SVG marker strokes
- Verify `SplitWebcamScreen9x16` supports "continuous bottom, cutting top" pattern

🟢 **Skip / defer:**
- 3-studio split (analytical, not spec-driving)
- Wardrobe semiotics (production design, not codebase)
- Pen-as-pointer (production design)
