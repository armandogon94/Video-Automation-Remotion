# Alex Hormozi — long-form motion-graphics analysis (Voter #2)

> Independent vote. Voter #1 is at `ANALYSIS-LONGFORM-VOTE1.md`. Comparison consensus is at `docs/research/wave-6/alexhormozi-longform-consensus.md`.
>
> This document was written from voter #2's own picks and dense-frame extraction, with **no consultation of voter #1's artifacts** (`longform-picks-vote1.json`, `longform-animation-ranges-vote1.json`, or `ANALYSIS-LONGFORM-VOTE1.md` were not opened). Convergence/divergence with voter #1 is for the consensus reviewer to assess.

---

## 1. Voter metadata

| Field | Value |
|---|---|
| voter | `vote2` |
| date | 2026-05-27 |
| channel | Alex Hormozi (`@alexhormozi`) — YouTube long-form |
| videos analyzed | 6 (selected for format diversity) |
| selection methodology | Hand-picked across listicle-rant, masterclass, monologue, short-rant, strategy-teaching, and one ultra-long masterclass to stress-test "do long-form Hormozi videos use animations at all?" Avoided extreme outliers (>9000s and <600s) so the sample reflects the modal long-form duration band of 1100–4800s. |
| selection inputs | `references/creators/alexhormozi/longform-picks-vote2.json` |
| animation ranges | `references/creators/alexhormozi/longform-animation-ranges-vote2.json` |
| dense frames | `references/creators/alexhormozi/longform-frames/<videoId>/v2-anim-NN-frame-NNN.jpg` — voter #2 frames are prefixed `v2-` to coexist with voter #1's dense extraction in the shared directory |
| reference clips | `docs/research/wave-6/references/alexhormozi/<videoId>-anim-NN-v2.mp4` — 20 clips total, `-v2` suffix |
| sampling | coarse scan at 1f/15s on each video, plus targeted 1f/5s and 1f/3s probes inside suspected animation windows; ranges below are conservative wall-clock windows around each visible event |

Six videos × N animation windows = **20 reference clips and ~273 dense frames** were extracted before the prior agent crashed. This document distills what those artifacts actually show.

---

## 2. Channel overview

Alex Hormozi's long-form is, structurally, **podcast-style talking head with sparse, high-impact graphic punctuation**. The dominant frame is a single-angle medium shot in a softly-lit studio with white slat-light backdrop, mic stand visible, Acquisition.com triangle logo on the tank top and the cap. There is a permanent burned-in word-by-word caption track at the bottom of every frame (white text with a black drop-shadow, the standard YouTube-shorts caption look retrofitted onto the long-form). That caption track is the *baseline* — it is not what we are cataloging here. Below the caption baseline, animations appear **in bursts**: a sequence of tweet cards stacks vertically over 30–60 seconds, then graphics disappear for 3–8 minutes of pure talking head, then a fullscreen game-stat graphic interrupts for one beat, then back to talking head. Density is bursty, not constant.

When animations *do* appear, the visual vocabulary is narrow and ruthlessly reused: (a) right-side or left-side stacked **Twitter/X screenshots with item-number badges**, (b) **fullscreen game-style stat panels** (LIFE/STRENGTH/MONEY/LOOKS bars at MAX, navy bg, yellow accents, "GODMODE" pill), (c) **side-by-side object-comparison icons** (two cars with $10 prices, LOVE green / HATE grey), (d) **multi-color emphasized side-text blocks** (white bg or screen-aligned text where 2-3 key words are yellow or red), (e) **top-down whiteboard hard-cutaways** where Hormozi himself live-draws multi-color marker math, (f) **lower-third name-tag and category pill lower-thirds** (yellow-on-white split pills), (g) **numbered carousel ribbons** across the bottom-third with circular badges 01–07 and a single active item pill, (h) **aerial b-roll with burned-in headline text-on-bg**, (i) **fullscreen social-post screenshots** (his own old Facebook/Instagram posts blown up on a purple background). The masterclass and ultra-long formats lean on (e) physical props and the angle-switch cutaway rather than overlaid graphics — they trade animation density for prop density and overhead-camera angle changes.

---

## 3. Per-video distillation

### 3.1 `XGm2ERU9qtA` — "15 Brutal Truths I Know at 36 That I Wish I Knew at 20"
- URL: `https://www.youtube.com/watch?v=XGm2ERU9qtA`
- duration: 28:05 (1685s) · format: listicle-rant
- animation count: 5 visible animation windows in the coarse sample
- frame dir: `references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/v2-anim-*.jpg`

#### Findings

**Finding 3.1.1 — TweetCardStackEnter (anim-01)**
- time range: 290–320s
- description: A single Twitter/X screenshot card slides in on the *left* side of the frame, occupying roughly the left 45% of the canvas; Hormozi remains visible at right, mid-gesture. Card has the standard X chrome — circle avatar, "Alex Hormozi" bold name + grey @handle, blue verified check, white card background with subtle border, dark body text rendered as if type-on (each word appearing aligned with his spoken word). Top-right of the card sits a large dark-grey numeral "2" — the item-number badge. The card does NOT scale-pop; it slides in from off-frame-left.
- frame refs: `v2-anim-01-frame-001.jpg` (clean talking head, no card yet) → `v2-anim-01-frame-006.jpg` (card mid-reveal, partial body text) → `v2-anim-01-frame-012.jpg` (full card + card #3 beginning to stack below)
- reference clip: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-01-v2.mp4` (12.05s)
- **transitionVerb**: `Slide tweet-card in from off-frame-left to anchor at left 45% of canvas over 14 frames; type-on body text reveals word-by-word in sync with VO; item-number badge "N" fades in top-right of card on card arrival.`
- orientation: 16:9
- replicability: existing primitives suffice — `<SocialPostCard>` (already a Wave-5 molecule) for the card chrome, `heldStagger.ts` for the word-aligned reveal, `blurInFocus.ts` for the badge entrance. **No new primitive needed** for a single card.

**Finding 3.1.2 — TweetCardVerticalStack (anim-02)**
- time range: 320–360s (continues from 3.1.1)
- description: Second tweet card appears *below* the first, identical chrome and styling but with badge "3". Both cards stay on screen simultaneously, vertically stacked, hugging the left edge with a small vertical gap. The first card is now fully revealed and slightly compressed in scale (~85%) to make room for the second. Body text in the second card type-reveals during its entrance.
- frame refs: `v2-anim-02-frame-006.jpg` (talking head no cards), `v2-anim-02-frame-010.jpg` (full talking head — coarse sample missed the actual stack moment; refer back to `v2-anim-01-frame-012.jpg` from the previous window which shows the live stack)
- reference clip: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-02-v2.mp4` (14.05s)
- **transitionVerb**: `Compress existing card to 85% scale and translate it up; slide new card in from off-frame-bottom-left below it; type-on body text; held N frames before next card.`
- orientation: 16:9
- replicability: needs a **new molecule** `<TweetStackPanel>` that maintains an array of `<SocialPostCard>` children and re-flows scale/translate when a new card is appended. Or extend `<SocialPostCard>` with a `stackIndex` + `totalInStack` prop that handles its own layout math. **One new molecule, ~half day of work.**

**Finding 3.1.3 — TweetCardLeftSingle (anim-03)**
- time range: 720–760s
- description: Solo card returns later, now on the *left* again but with badge "5" — same chrome, same type-on body. Confirms the cards reset to a single-card layout between bursts (i.e., when the "list" advances past the visible stack, prior cards are dismissed off-frame and the next card enters solo).
- frame refs: `v2-anim-03-frame-006.jpg` (talking head between cards), broader anim-03 sequence
- reference clip: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-03-v2.mp4` (12.01s)
- **transitionVerb**: same as 3.1.1 with badge "N".
- orientation: 16:9
- replicability: covered by 3.1.1.

**Finding 3.1.4 — TweetCardStackedAdvance (anim-04)**
- time range: 1010–1080s
- description: Sequential cards "7" and "8" appear stacked vertically (card "7" enters first, then "8" stacks below — the "hardest part is continuing" pair). Same left-anchored 45%-width layout, same chrome, same type-on. Shows the stack can hold ≥2 simultaneous items.
- frame refs: `v2-anim-04-frame-006.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-04-v2.mp4` (15.01s)
- **transitionVerb**: identical to 3.1.2.
- orientation: 16:9
- replicability: covered by 3.1.2.

**Finding 3.1.5 — TweetCardEnterAbove (anim-05)**
- time range: 1040–1090s (overlaps the tail of 3.1.4)
- description: Card "9" ("the most dangerous person quote") enters *above* the previous stack — i.e., the stack grew upward, not downward, in this beat. Suggests the layout rule is "newest card claims the most prominent slot," and the prominent slot may be top or bottom depending on the prior card's position.
- frame refs: `v2-anim-05-frame-001.jpg` (card "9" mid-entrance with truncated body, "8" still visible below)
- reference clip: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-05-v2.mp4` (12.01s)
- **transitionVerb**: `Slide new card in from off-frame-top-left above existing stack; translate prior stack down to accommodate; type-on body text reveals word-by-word.`
- orientation: 16:9
- replicability: confirms `<TweetStackPanel>` molecule needs to support BOTH top-append and bottom-append directions (a `direction: "up" | "down"` prop on the append call).

---

### 3.2 `JDR-R--4HhM` — "14 Years of Marketing Advice in 35 Minutes"
- URL: `https://www.youtube.com/watch?v=JDR-R--4HhM`
- duration: 35:33 (2133s) · format: masterclass
- animation count: 1 in the coarse sample (verified to be sparse — this is the "talking head + paper props" mode)
- frame dir: `references/creators/alexhormozi/longform-frames/JDR-R--4HhM/v2-anim-*.jpg`

#### Findings

**Finding 3.2.1 — TalkingHeadWithLongPaperProp (anim-01, mislabeled in ranges JSON as "whiteboard cutaway")**
- time range: 580–615s
- description: Inspection of dense frames `v2-anim-01-frame-005.jpg` through `v2-anim-01-frame-023.jpg` shows the camera stays on Hormozi the entire window. He is referring to and writing on a wide white **paper roll** laid across his desk (the "13 Sentences I Learned in 13 Years" prop visible in earlier frames). There is NO hard-cutaway to a top-down whiteboard. The "whiteboard" in the coarse-sample label was actually the paper roll seen from the front camera with handwritten ink visible at the bottom edge of frame. Two glowing Acquisition.com logos float in the background (decorative set-dressing, not animation).
- frame refs: `v2-anim-01-frame-005.jpg`, `v2-anim-01-frame-010.jpg`, `v2-anim-01-frame-015.jpg`, `v2-anim-01-frame-020.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/JDR-R--4HhM-anim-01-v2.mp4` (15.06s)
- **transitionVerb**: N/A — this is not an overlay animation; it is a static prop in a continuous talking-head shot.
- orientation: 16:9
- replicability: this is **not a graphics animation to replicate**. It is a *production* technique — having a long visible prop the host can gesture toward. Worth noting in the build queue as a *content-side* rule ("masterclass-style videos may use a paper-roll prop as a substitute for graphic overlays") but does not generate a primitive task.

**Format takeaway:** the 35-minute masterclass uses ~0 overlay animations. This is a deliberate stylistic choice — masterclass videos lean on prop density, not graphic density. **Voter #2 confirms voter #1's likely finding that the masterclass format is animation-sparse.**

---

### 3.3 `qsXxckCbci0` — "How To Grow ANY Business FASTER (Masterclass)"
- URL: `https://www.youtube.com/watch?v=qsXxckCbci0`
- duration: 79:36 (4776s) · format: masterclass-long
- animation count: **0** (excluded from dense extraction)
- frame dir: none — no dense frames were extracted because coarse sampling at 1f/15s across ~318 frames showed zero overlay graphics

#### Findings

**Finding 3.3.1 — No overlay graphics in 80-minute masterclass**
- The video is entirely two-camera coverage: a front-facing medium shot of Hormozi and a top-down overhead of the desk. He live-draws diagrams and equations on a wide paper roll using sharpies (multi-color marker, just like the whiteboard cutaways in the shorter videos). The angle-switch between the two cameras is an unanimated hard cut.
- The closest thing to an "animation" is the angle switch itself, which is itself unanimated — it is a pure cut.
- frame refs: none extracted
- reference clip: none extracted
- **transitionVerb**: N/A
- orientation: 16:9
- replicability: same conclusion as 3.2 — this is a content-format choice, not a graphics technique. **Don't try to "modernize" the 80-minute masterclass with overlays — Hormozi's most successful long-form has none.**

**Format takeaway:** for ultra-long (≥60-minute) masterclass content, plan two-camera coverage + paper-roll prop. Overlays are *unnecessary and would dilute* the format. The graphic-rich format is reserved for the 18–32 minute "rant" / "listicle-rant" tier (videos 3.1 and 3.4 and 3.5).

---

### 3.4 `_KlZoPxbStk` — "It took me 36 years to realize what I'll tell you in 26 minutes"
- URL: `https://www.youtube.com/watch?v=_KlZoPxbStk`
- duration: 26:56 (1616s) · format: monologue-reflective
- animation count: 4 visible animation windows
- frame dir: `references/creators/alexhormozi/longform-frames/_KlZoPxbStk/v2-anim-*.jpg`

#### Findings

**Finding 3.4.1 — TweetCardRightSingle (anim-01)**
- time range: 0–25s (opening cold-open)
- description: Tweet card occupies the *right* half of the canvas. Same X chrome — avatar, "Alex Hormozi" name, @handle, verified check, white card, dark body. The card body type-reveals word-by-word: "It's not about doing what you love. It's about finding something that you love enough that it's worth suffering [for]." This is the cold-open hook, before Hormozi himself appears full-frame — establishes that the tweet card is the *headline*, and the talking-head shot becomes the *commentary* on it.
- frame refs: `v2-anim-01-frame-008.jpg` (Hormozi on left, card on right with full body, key word "suffering" visible)
- reference clip: `docs/research/wave-6/references/alexhormozi/_KlZoPxbStk-anim-01-v2.mp4` (12.01s)
- **transitionVerb**: `Slide tweet-card in from off-frame-right to anchor at right 50% of canvas over 14 frames; type-on body text reveals word-by-word in sync with VO.`
- orientation: 16:9
- replicability: covered by 3.1.1's primitive — the only diff is the `anchor: "right"` prop on `<SocialPostCard>` / `<TweetStackPanel>`. Confirms the molecule must support both left-anchored and right-anchored layouts.

**Finding 3.4.2 — GodModeStatPanel (anim-02) — HIGHEST-VALUE NEW PATTERN**
- time range: 295–320s
- description: Fullscreen cutaway — Hormozi disappears entirely. Background is a deep navy gradient. Centered left: a large white stick-figure icon (the "player avatar" silhouette, like a video-game character select). Centered right: a vertical list of game-stat rows, each row consisting of: an UPPERCASE white label (`LIFE`, `STRENGTH`, `MONEY`, `LOOKS`), a long horizontal progress bar in a thin grey trough, the bar fill rendered as a yellow gradient pinned at MAX, and the text `MAX` in yellow at the right end of the bar. A row at the bottom reads `DIFFICULTY` + a small white dot/checkmark icon + the text `VERY EASY` in yellow. Bottom-left: a rounded-rect outlined pill with the word `GODMODE` in white, lit by a soft yellow underglow.
- frame refs: `v2-anim-02-frame-001.jpg` (clean panel, all bars at MAX), `v2-anim-02-frame-005.jpg` (DIFFICULTY row now visible with VERY EASY), `v2-anim-02-frame-008.jpg` (cuts back to Hormozi)
- reference clip: `docs/research/wave-6/references/alexhormozi/_KlZoPxbStk-anim-02-v2.mp4` (12.05s)
- **transitionVerb**: `Hard-cut to fullscreen navy panel; stick-figure stays static on left; per-row reveal stagger — label appears, progress bar fills left-to-right via stroke-dashoffset to 100%, "MAX" label fades in 4 frames after the bar settles; rows stagger 8 frames apart top-to-bottom; final "GODMODE" pill scale-pops at bottom-left after all rows settle.`
- orientation: 16:9
- replicability: **needs one new molecule** `<GameStatPanel>` composed of (a) the stick-figure SVG asset (existing `BrandGlyphs` library can house it), (b) a `<StatBar>` row that takes `{label, fill: 0..1, color, units?}` and animates the fill, (c) the bottom pill label using `<HUDChrome>` rounded-pill component. Existing `pathDraw.ts` handles the bar fill via stroke-dashoffset; `heldStagger.ts` handles the row stagger; `dwellBeat.ts` ensures the panel holds long enough to read. **High-value because the same molecule can be re-themed for OTHER game-frame statements** (a `HARDMODE` variant with low bars, a `BOSSFIGHT` variant, etc.) — this is Hormozi's most reusable visual idea in the sample.

**Finding 3.4.3 — SideBySideObjectComparison (anim-03, mislabeled in ranges JSON as "side-text reveal")**
- time range: 440–470s
- description: Fullscreen cutaway again. Background navy. Two object icons placed side-by-side with a thin white vertical divider down the middle. Left icon: a stylized green car silhouette with `$10` price label above it and the word `LOVE` in yellow below it. Right icon: an identical grey car silhouette with `$10` price label and the word `HATE` in yellow below it. The point is visual: same price ($10) but the LEFT car is "loved" (green) and the RIGHT is "hated" (grey). Cars appear via scale-pop, then the colored price label and the descriptor word fade in. The "side-text reveal" mislabel from the coarse pass is actually a *different* moment in the same window — Hormozi visible left, screen-aligned multi-color text on the right that reads "The goal is to **REFRAME YOUR LIVING EXPERIENCE** so that **BAD THINGS ARE GOOD** / Not to try and **ONLY EXPERIENCE GOOD THINGS**" with the bolded segments in yellow.
- frame refs: `v2-anim-03-frame-001.jpg` (multi-color side-text reveal version), `v2-anim-03-frame-010.jpg` (talking head between), `v2-anim-03-frame-020.jpg` (the cars side-by-side with LOVE/HATE labels)
- reference clip: `docs/research/wave-6/references/alexhormozi/_KlZoPxbStk-anim-03-v2.mp4` (14.01s)
- **transitionVerb (cars)**: `Hard-cut to fullscreen navy panel with central vertical divider; left and right object icons scale-pop 0.8 → 1 from their respective halves over 8 frames; price labels fade in above icons; descriptor words ("LOVE" / "HATE") fade in below icons in yellow; tinting on the left icon switches to accent-green via a color-mix tween over 12 frames.`
- **transitionVerb (multi-color side-text)**: `Slide multi-line text block in from off-frame-right; lines fade in line-by-line at 6-frame stagger; sibling words remain white while emphasized phrases are pre-rendered in yellow (NO color animation — only the line-fade).`
- orientation: 16:9
- replicability: **two patterns in one window.** The side-by-side comparison needs a new molecule `<DualObjectComparison>` that takes `{leftIcon, leftLabel, leftPrice, leftAccent, rightIcon, rightLabel, rightPrice, rightAccent}`. Could be built on top of existing `<InfoCards>` if its two-up layout is parameterizable. The multi-color side-text is already covered by existing `<TextEmphasis>` if it supports inline color overrides + per-line stagger.

**Finding 3.4.4 — ProgressiveWordDimReveal (anim-04)**
- time range: 1175–1215s
- description: Another right-side tweet card, same chrome. Body text reads "There is nothing wrong with you if you are pursuing something for the purpose of [something that]". The phrase `something that` at the tail of the visible reveal is rendered in **a lighter grey than the rest** of the visible text — i.e., the type-on isn't a binary "appeared / not appeared" — it has an intermediate "appearing dimly, will brighten as VO catches up" state. This is a small but distinctive variation on the simple type-on.
- frame refs: `v2-anim-04-frame-015.jpg` (the progressive dimming clearly visible — "something that" is grey while preceding text is full black)
- reference clip: `docs/research/wave-6/references/alexhormozi/_KlZoPxbStk-anim-04-v2.mp4` (14.01s)
- **transitionVerb**: `Type-on body text in 3-state cascade: each word transitions from invisible → 40% opacity grey (preview state) → 100% opacity black (final state), 4 frames per transition; the leading edge stays in the "preview" state while preceding words are committed to "final".`
- orientation: 16:9
- replicability: requires a *new variant* of the existing type-on text reveal — the captions library at `src/components/captions/` already does per-word reveal, but needs a 3-state tween instead of 2-state. **Small enhancement, not a new molecule** — ~half day of work in the existing caption renderer.

---

### 3.5 `3SVksBB3_YY` — "Give me 20 Minutes and I'll Give You Back 20 Years of Your Life"
- URL: `https://www.youtube.com/watch?v=3SVksBB3_YY`
- duration: 19:30 (1170s) · format: short-rant
- animation count: 8 visible animation windows — **the highest-density video in the sample**
- frame dir: `references/creators/alexhormozi/longform-frames/3SVksBB3_YY/v2-anim-*.jpg`

This is the centerpiece. The shorter the rant, the higher the graphic density.

#### Findings

**Finding 3.5.1 — NameTagLowerThird (anim-01)**
- time range: 0–15s
- description: Cold-open b-roll of Hormozi exiting an office building toward a parked SUV. Mid-shot, the lower-third reveals a name tag in two stacked pills: bottom row WHITE pill with bold black text `ALEX HORMOZI`, top sliver WHITE pill with smaller text `FOUNDER, ACQUISITION.COM`. The pills slide in from off-frame-left with a soft shadow.
- frame refs: `v2-anim-01-frame-005.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-01-v2.mp4` (12.01s)
- **transitionVerb**: `Slide two stacked pills in from off-frame-left to anchor at left 30% of bottom-third; primary pill enters 4 frames before secondary; held 60 frames; slide out to the left at end.`
- orientation: 16:9
- replicability: existing — `<HUDChrome>` already supports stacked-pill lower-thirds. Use as-is.

**Finding 3.5.2 — TopDownWhiteboardHardCutaway (anim-02)**
- time range: 55–90s
- description: Hard-cut to a top-down overhead shot. White butcher paper covers the desk. Hormozi's hands enter frame from the bottom, holding a red sharpie. He live-draws the word `GROCERIES` in capital-letter handwriting at the top-left of the visible paper. A faint laundry-detergent jug sits in the lower-right corner of frame as set-dressing. The "animation" here is the **physical writing** captured in real time — not a digital overlay.
- frame refs: `v2-anim-02-frame-010.jpg` (mid-write — "GROCERIES" partially written)
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-02-v2.mp4` (15.01s)
- **transitionVerb**: N/A — this is captured live, not animated. Can be **simulated** in Remotion with: `Hard-cut to top-down whiteboard layout; render handwritten text via pre-traced SVG path + stroke-dashoffset over (textLength × 2) frames; jitter the rendered stroke width by ±0.3px to mimic hand variation.`
- orientation: 16:9
- replicability: **needs new molecule** `<WhiteboardCutaway>` — a fullscreen white-bg layout with a `handwrittenText` prop, rendering via pathDraw stroke-dashoffset on a hand-drawn font (Caveat / Permanent Marker), optionally with set-dressing decorations (cup, marker, prop) along the edges. Already partially supported by `pathDraw.ts` primitive. **One new molecule, half day.**

**Finding 3.5.3 — BurnedInMathFormulaCaption (anim-03)**
- time range: 215–250s
- description: Front-camera shot of Hormozi sitting at desk with two large green `$100M MONEY MODELS` poster backgrounds behind him. Lower-third area shows burned-in white text that reads as a math equation: a `$1000/mo = Extra 23 HOURS/wk` style formula (per the coarse-sample notes). Sampled frames `anim-03-frame-005.jpg` and `anim-03-frame-010.jpg` confirm the talking-head shot with the poster backdrop but the dense sample mostly caught the talking-head intervals between the formula appearances — the formula itself is in the standard burned-caption track styled bigger and with a yellow equation operator.
- frame refs: `v2-anim-03-frame-005.jpg`, `v2-anim-03-frame-010.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-03-v2.mp4` (12.01s)
- **transitionVerb**: `Render math-formula caption as a horizontal line with operator (= or →) tinted in accent yellow; rest of expression in white with strong drop-shadow; word-by-word reveal but the operator pops 2 frames before the right operand.`
- orientation: 16:9
- replicability: this is a *variant* of the existing burned-caption track at `src/components/captions/`. Specifically, an "equation mode" where left-operand, operator, right-operand are styled as a single chunk. Small enhancement, not a new component.

**Finding 3.5.4 — FullScreenSocialPostScreenshot (anim-04)**
- time range: 280–320s
- description: Fullscreen cutaway with a vivid purple background (#7E1FE3 / Instagram-story purple, eyeballed). Centered: a screenshot of an Alex Hormozi Facebook or LinkedIn post from "about 7 years ago" — the post has the standard social chrome (small profile photo top-left, name, date, body text spanning the card, an embedded image of him + presumably his wife in a car), reading "Here's a throwback from about 7 years ago. We had just become 'millionaires.' We still lived on $4000/mo..." etc. The screenshot is rendered at maybe 60% width of the canvas, centered, with no border. It scale-pops into place from ~0.92 to 1.0 over 6 frames and then holds for the duration of the read.
- frame refs: `v2-anim-04-frame-005.jpg` (talking head with $100M poster), `v2-anim-04-frame-020.jpg` (talking head with poster), the actual social-post screenshot moment lies in the gap — captured in `v2-anim-04-frame-010.jpg` (the previous question batch)
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-04-v2.mp4` (13.05s)
- **transitionVerb**: `Hard-cut to flat purple background; scale-pop social-post screenshot 0.92 → 1 over 6 frames centered on canvas; held N frames during VO read; hard-cut out.`
- orientation: 16:9
- replicability: **leverage existing `<SocialPostCard>`** — but extend with a `mode: "embedded" | "fullscreen-screenshot"` variant. The fullscreen variant centers a single card on a flat accent background with no surrounding chrome. **Small enhancement to an existing molecule.**

**Finding 3.5.5 — CartoonIllustrationOverlay (anim-05)**
- time range: 350–400s
- description: Talking-head shot of Hormozi with the `$100M MONEY MODELS` poster backdrop. A flat-color cartoon illustration of a boot/sock graphic (orange and grey) overlays the top-left corner. The overlay is small (maybe 20% of canvas width) and stays static. This is a "joke insert" — visual joke punctuation tied to the line he's saying. The vacuum-cleaner appears as a *physical prop* he wheels into frame later in the same window (different from the boot graphic).
- frame refs: `v2-anim-05-frame-005.jpg`, `v2-anim-05-frame-015.jpg` (Hormozi gesturing at the on-screen item), `v2-anim-05-frame-025.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-05-v2.mp4` (12.01s)
- **transitionVerb**: `Scale-pop flat-color illustration 0.85 → 1 anchored at top-left corner with a small offset from the frame edge; held N frames in sync with VO punchline; scale-pop out 1 → 0.85 with fade.`
- orientation: 16:9
- replicability: existing — `<BrandGlyphs>` library can host an "illustration overlay" slot. Generic enough that no new molecule is needed; just an asset-bank expansion.

**Finding 3.5.6 — NumberedCarouselRibbon (anim-06)**
- time range: 400–460s
- description: Across the bottom-third of the frame, six **circular badges** are arranged horizontally: `01` `02` `03` `04` `05` `06` `07` (the last one slightly out of frame). The badges are dark-navy / muted-grey circles with white numerals. ONE of the badges (in the sampled frame, `03`) has a tall **yellow-on-white split pill** rising above it: yellow circle with `03` numeral on the left of the pill, white pill body extending to the right with the category label `HOUSE CLEANING` in bold black. This is the "active item" marker — it cycles as the VO advances through the list. Hormozi remains center-frame above the ribbon, tossing a vacuum cleaner in the frame at this moment.
- frame refs: `v2-anim-06-frame-010.jpg` (just the talking head and poster), `v2-anim-06-frame-020.jpg` (whiteboard math cutaway — also in this window), `v2-anim-06-frame-035.jpg` (the active carousel with `03 HOUSE CLEANING` pill clearly visible)
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-06-v2.mp4` (15.06s)
- **transitionVerb**: `Render six circular numbered badges in a horizontal row across bottom-third; the "active" badge index N has a tall yellow-on-white split pill rising above it (yellow N badge on left, white pill body on right with category label); when the active index advances, the prior pill drops back into a plain circle and the new index pill rises — slide vertical 12 frames, no horizontal movement.`
- orientation: 16:9
- replicability: **needs new molecule** `<NumberedCarouselRibbon>` with props `{items: [{label}], activeIndex, accentColor}`. Composes existing `<HUDChrome>` rounded pills and number badges. **One new molecule, ~half day.**

**Finding 3.5.7 — WhiteboardCloseUpWithBurnedOverlay (anim-07)**
- time range: 760–800s
- description: Cutaway to a close-up whiteboard frame. Multi-color handwritten content covers the left side — green numerals in boxes (`$750`, `$60`, `$200`, `$300`), and a multi-color list of items with hour-counts (`13.5`, `4`, `6`, `2`, `Sleep`). Centered-right on the whiteboard, **burned-in over the live shot**, is a yellow-on-white split pill that reads `TOTAL TIME SAVED:` (white pill on top) `25.5 HRS / WEEK` (yellow-on-white pill below). The overlay sits on top of the whiteboard imagery, suggesting they comp the overlay AFTER capturing the whiteboard.
- frame refs: `v2-anim-07-frame-005.jpg` (talking-head with poster), `v2-anim-07-frame-010.jpg` (talking head), `v2-anim-07-frame-020.jpg` (the whiteboard close-up with overlay clearly visible)
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-07-v2.mp4` (12.01s)
- **transitionVerb**: `Hard-cut to whiteboard close-up; reveal yellow-on-white split-pill lower-third over the imagery — top pill says category, bottom pill says result value in yellow; rolling-digit counter on the result value rolls up to final number over 18 frames; held N frames; cut out.`
- orientation: 16:9
- replicability: composite of existing `<HUDChrome>` lower-third pill + `rollingDigit.ts` primitive on the value + a *new* whiteboard-bg variant of the `<WhiteboardCutaway>` molecule from 3.5.2 (the same fullscreen-whiteboard layout but in close-up rather than top-down). **Already covered if 3.5.2 builds — this is the same molecule used differently.**

**Finding 3.5.8 — AerialBRollHeadlineBurnIn (anim-08)**
- time range: 815–845s
- description: Cutaway to top-down aerial drone b-roll. First clip: a busy multi-lane road with cars and a tree-lined neighborhood. Second clip: a large parking lot crammed with cars. Burned over the road clip is a centered headline reading `1.5 HOURS A DAY` (yellow uppercase bold) `COMMUTING` (white uppercase bold) — the two phrases on the same baseline with the yellow phrase on the left and the white phrase on the right.
- frame refs: `v2-anim-08-frame-005.jpg` (talking head with poster), `v2-anim-08-frame-010.jpg` (the road aerial with the `1.5 HOURS A DAY COMMUTING` headline), `v2-anim-08-frame-015.jpg` (the parking-lot aerial, headline gone)
- reference clip: `docs/research/wave-6/references/alexhormozi/3SVksBB3_YY-anim-08-v2.mp4` (12.05s)
- **transitionVerb**: `Hard-cut to aerial b-roll plate; center-out reveal of a two-tone headline — yellow phrase on the left, white phrase on the right, both UPPERCASE bold sans, both on the same baseline; headline holds 90 frames then fades; hard-cut to next b-roll plate.`
- orientation: 16:9
- replicability: leverages existing `<TextEmphasis>` (for the two-tone treatment) and a *new* layout primitive — a horizontally-centered two-segment headline. Or extend `<HUDChrome>` with a "split-tone headline" variant. Small enhancement.

---

### 3.6 `nSQdjim8CsE` — "Making Money is a Game (Here's the Cheat Code)"
- URL: `https://www.youtube.com/watch?v=nSQdjim8CsE`
- duration: 31:03 (1864s) · format: strategy-teaching
- animation count: 2 in the coarse sample (both whiteboard cutaways)
- frame dir: `references/creators/alexhormozi/longform-frames/nSQdjim8CsE/v2-anim-*.jpg`

#### Findings

**Finding 3.6.1 — TopDownWhiteboardLBOMath (anim-01)**
- time range: 580–620s
- description: Hard-cut from talking head (Hormozi at desk with `$100M MONEY MODELS` book on table and Acquisition.com box prop) to a top-down overhead shot of the same desk but now the paper roll dominates the frame. Hormozi's hand enters with a green sharpie and live-draws an LBO math breakdown: `LBO`, `21/$21`, `100 = $2000`, `25 × $21 = $525`, `$80 × $500 ≈ $4000`. The math is written in green marker; an earlier `$53` annotation is visible at left in green.
- frame refs: `v2-anim-01-frame-005.jpg` (talking head), `v2-anim-01-frame-014.jpg` (talking head), `v2-anim-01-frame-025.jpg` (the top-down LBO math overhead)
- reference clip: `docs/research/wave-6/references/alexhormozi/nSQdjim8CsE-anim-01-v2.mp4` (15.06s)
- **transitionVerb**: same as 3.5.2 (`<WhiteboardCutaway>` with live-draw or path-traced handwriting).
- orientation: 16:9
- replicability: covered by 3.5.2's molecule.

**Finding 3.6.2 — TopDownWhiteboardMultiColorBreakdown (anim-02)**
- time range: 880–920s
- description: Same overhead format, but now with multi-color marker work. Visible content: a `$53` in a green box at left of the paper, with arrows pointing to `$525` and `$4000`. Center: a list `LEADS 100 = $2000`, `SALES 15 = $7500`, `SHOP 12 = ~$2000`. Right: handwritten `7%` and `~100`. Multiple sharpie colors visible at the top-right of frame. The "animation" is again the live-drawing — Hormozi's hand enters frame with the sharpie and writes a number.
- frame refs: `v2-anim-02-frame-005.jpg`, `v2-anim-02-frame-014.jpg` (the multi-color breakdown clearly visible), `v2-anim-02-frame-025.jpg`
- reference clip: `docs/research/wave-6/references/alexhormozi/nSQdjim8CsE-anim-02-v2.mp4` (15.01s)
- **transitionVerb**: extends 3.5.2's verb — `<WhiteboardCutaway>` with **multi-color** sharpie support: support 3+ color tracks with independent stroke-dashoffset reveals, each color appearing in time with VO emphasis.
- orientation: 16:9
- replicability: extends 3.5.2's `<WhiteboardCutaway>` with `colorTracks: Array<{color, paths}>` instead of a single text. **Small extension.**

**Format takeaway:** strategy-teaching format mixes talking head + whiteboard cutaways heavily. No tweet cards, no fullscreen game-stat panels — those are reserved for the listicle-rant and monologue formats.

---

## 4. Catalog of distinct patterns

Patterns named in PascalCase. Frequency = how many distinct animation windows in this sample exhibit the pattern. Effort = engineering time to ship a reusable primitive/molecule/composition (S=≤1d, M=2–3d, L=4–7d).

| # | PatternName | Frequency (windows) | transitionVerb summary | Orientation | Replicability (existing/new) | Effort |
|---|---|---|---|---|---|---|
| 1 | **TweetCardLeftSingle** | 2 (XGm2ERU9qtA anim-01, anim-03) | Slide in from left, type-on body, item-number badge top-right | 16:9 | existing: `<SocialPostCard>` + `heldStagger` | S |
| 2 | **TweetCardRightSingle** | 1 (_KlZoPxbStk anim-01) | Slide in from right, anchor at right 50%, type-on body | 16:9 | existing: same as #1 with `anchor: "right"` prop | S |
| 3 | **TweetStackVerticalBuild** | 3 (XGm2ERU9qtA anim-02, anim-04, anim-05) | Append new card above or below existing stack; existing cards translate to accommodate; type-on new body | 16:9 | new molecule `<TweetStackPanel>` wrapping `<SocialPostCard>` | M |
| 4 | **GodModeStatPanel** | 1 (_KlZoPxbStk anim-02) | Fullscreen navy panel; stick-figure left; stat rows reveal top-to-bottom with bar fill via stroke-dashoffset and MAX label; bottom pill scale-pops | 16:9 | new molecule `<GameStatPanel>` (HIGHEST-VALUE — re-themable as HARDMODE / BOSSFIGHT etc.) | M |
| 5 | **DualObjectComparison** | 1 (_KlZoPxbStk anim-03 cars half) | Fullscreen navy panel with vertical divider; two icons scale-pop from each half; price labels fade in above; colored descriptor word below | 16:9 | new molecule `<DualObjectComparison>` (or extension of `<InfoCards>`) | S |
| 6 | **MultiColorSideTextBlock** | 1 (_KlZoPxbStk anim-03 text half) | Slide text block in from right; lines fade in line-by-line; emphasized phrases pre-tinted yellow (no color animation) | 16:9 | existing: `<TextEmphasis>` if it supports inline color overrides + per-line stagger | S |
| 7 | **ProgressiveWordDimReveal** | 1 (_KlZoPxbStk anim-04) | Type-on body in 3-state cascade: invisible → 40%-opacity grey → 100%-opacity black, with the leading edge always in "preview" state | 16:9 | enhancement to existing word-by-word captions in `src/components/captions/` (3-state instead of 2-state) | S |
| 8 | **WhiteboardCutawayHandDraw** | 3 (3SVksBB3_YY anim-02, nSQdjim8CsE anim-01, anim-02) | Hard-cut to top-down white-paper layout; handwritten text via SVG path + stroke-dashoffset; multi-color marker support; optional set-dressing decorations along edges | 16:9 | new molecule `<WhiteboardCutaway>` (path-draw based) | M |
| 9 | **NameTagStackedLowerThird** | 1 (3SVksBB3_YY anim-01) | Slide two stacked pills in from off-frame-left; primary 4f before secondary; held 60f; slide out | 16:9 | existing: `<HUDChrome>` stacked-pill lower-third | S |
| 10 | **NumberedCarouselRibbon** | 1 (3SVksBB3_YY anim-06) | Six circular numbered badges across bottom-third; active badge has tall yellow-on-white split pill rising above it; pill drops/rises as active index advances | 16:9 | new molecule `<NumberedCarouselRibbon>` | M |
| 11 | **SplitPillResultOverlay** | 1 (3SVksBB3_YY anim-07) | Two-row split pill — top row category in white, bottom row value in yellow; rolling-digit counter on the value | 16:9 | composite of existing `<HUDChrome>` + `rollingDigit` | S |
| 12 | **AerialBRollSplitToneHeadline** | 1 (3SVksBB3_YY anim-08) | Hard-cut to aerial b-roll; center-out two-segment headline — yellow phrase + white phrase on same baseline | 16:9 | enhancement to `<HUDChrome>` (split-tone headline variant) | S |
| 13 | **CartoonIllustrationCornerInsert** | 1 (3SVksBB3_YY anim-05) | Scale-pop flat-color illustration at top-left corner; held in sync with VO punchline; scale-pop out with fade | 16:9 | existing: `<BrandGlyphs>` + asset-bank expansion | S |
| 14 | **FullscreenSocialPostScreenshot** | 1 (3SVksBB3_YY anim-04) | Hard-cut to flat accent background; scale-pop a single social-post card to canvas center; no chrome around it; held during VO read | 16:9 | enhancement to `<SocialPostCard>` with `mode: "fullscreen-screenshot"` | S |
| 15 | **MathFormulaCaptionBurn** | 1 (3SVksBB3_YY anim-03) | Burned-in caption styled as equation — operator (= or →) pops 2 frames before right operand, operator tinted yellow, rest white | 16:9 | enhancement to existing captions | S |

**Total: 15 patterns, 8 of which need NEW primitive/molecule work** (#3, #4, #5, #7, #8, #10, #14 partial, #15 partial). The remaining 7 are covered by existing `src/animation/` and `src/components/` primitives or by small enhancements.

---

## 5. Cross-reference with Tella's claims

In `docs/research/wave-5/tella-motion-graphics-synthesis.md`, Tella cites Alex Hormozi at timestamps 00:18, 04:42, 07:42 of her recreation video as an exemplar of **(a) listicle/ranked-hierarchy style** and **(b) animated-tweet style**.

### Verdict on (a) ranked-hierarchy listicles in long-form
**PARTIALLY CONFIRMED.** Voter #2 found ONE pattern that maps directly onto Tella's "listicle / ranked hierarchy": the **NumberedCarouselRibbon** in `3SVksBB3_YY` anim-06 (six circular badges with an active-item pill). It is NOT a vertical "bottom-to-top tier reveal" of the kind Tella demonstrated for Jay Klaus — Hormozi's version is **horizontal carousel** rather than vertical hierarchy. The closer match to Tella's vertical-hierarchy claim is the **GodModeStatPanel** stat-row reveal (`_KlZoPxbStk` anim-02), which DOES stagger items top-to-bottom with held dwell beats. So: ranked-hierarchy exists, but in TWO different forms — horizontal carousel ribbon AND vertical stat-row stack — neither of which is the "tier-stacked listicle" Tella showed for Jay Klaus.

**Frame evidence:** `references/creators/alexhormozi/longform-frames/3SVksBB3_YY/v2-anim-06-frame-035.jpg` (carousel ribbon active-item state), `references/creators/alexhormozi/longform-frames/_KlZoPxbStk/v2-anim-02-frame-005.jpg` (GodMode stat-row stack).

### Verdict on (b) animated tweet cards in long-form
**STRONGLY CONFIRMED.** Voter #2 found 6 distinct animation windows across 2 videos featuring tweet cards: `XGm2ERU9qtA` (5 windows — anim-01 through anim-05 are all tweet cards) and `_KlZoPxbStk` (anim-01 and anim-04). They are the **#1 most frequent overlay pattern** in voter #2's sample, with both single-card and vertical-stack variants, both left-anchored and right-anchored layouts, and both straight type-on and progressive-dim type-on variants. Tella's claim that Hormozi uses animated-tweet style is unambiguous.

**Frame evidence:** `references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/v2-anim-01-frame-006.jpg`, `v2-anim-01-frame-012.jpg` (stack build), `references/creators/alexhormozi/longform-frames/_KlZoPxbStk/v2-anim-01-frame-008.jpg` (right-anchored variant), `v2-anim-04-frame-015.jpg` (progressive-dim variant).

### Bonus verdict — patterns Tella did NOT mention that ARE present
- **GodModeStatPanel** (fullscreen video-game stat HUD) — Tella did not cite this. It is arguably Hormozi's highest-leverage standalone visual idea because it is so re-themable.
- **WhiteboardCutawayHandDraw** (top-down live-draw cutaways) — Tella did not cite this. It is structurally a *production technique* more than a graphic pattern (it depends on filming an overhead second angle), but the resulting on-screen artifact CAN be simulated entirely in Remotion via pathDraw.
- **DualObjectComparison** (side-by-side icons with price + descriptor) — Tella did not cite this. It's specific to Hormozi's "two things look the same but one costs more" rhetorical move.

### Bonus verdict — patterns Tella mentioned that voter #2 did NOT find
- **Tweet card with embedded media + counter roll-up** — Tella's full animated-tweet primitive (avatar pop → text reveal → media pop → counter roll) was NOT observed in voter #2's sample. Hormozi's tweet cards are TEXT ONLY — no embedded image, no like/retweet counter shown animated. The chrome shows handles and verified check but the like/retweet numbers at the bottom of a real tweet are absent. This is a meaningful simplification of Tella's full primitive — for Hormozi specifically, we only need the text-reveal portion of `<SocialPostCard>`, NOT the media+counter portion.

---

## 6. Build priority queue addendum

Ranked by (reusability × deficit-from-existing-primitives × Hormozi-frequency). All items here are gaps the voter #2 sample reveals; the consensus document will merge with voter #1's queue.

| Rank | Item | Layer | Why it ranks | Estimated effort | Powers |
|---|---|---|---|---|---|
| 1 | `<TweetStackPanel>` molecule with `anchor: "left" \| "right"` and `appendDirection: "up" \| "down"` | molecule | Highest frequency overlay (6+ windows), and we already have `<SocialPostCard>` for the card chrome — just need the stack management layer. | M (1–2 days) | Hormozi listicle-rant format; any "build a thread of quotes" video |
| 2 | `<GameStatPanel>` molecule (stick-figure or icon left + stat rows right + bottom pill label) | molecule | Highest re-themability per single appearance — same molecule themes as GODMODE / HARDMODE / BOSSFIGHT / TUTORIAL / etc. Voter #2's most novel visual idea from this sample. | M (1–2 days) | Hormozi-style "game framing of life" videos; framework reveals; capability matrix slides |
| 3 | `<WhiteboardCutaway>` molecule with multi-color sharpie support (path-draw based) | molecule | Three windows across two videos use this. Decouples Hormozi from needing a literal physical whiteboard shot — can be 100% Remotion-rendered with `pathDraw.ts`. Re-usable for any "live-draw equation" beat. | M (1–2 days) | Hormozi strategy-teaching format; any explainer that wants "felt-tip math" aesthetic |
| 4 | `<NumberedCarouselRibbon>` molecule | molecule | One window in this sample, but maps directly onto Tella's listicle-hierarchy claim in horizontal form. High-value because it's the only carousel-style ranked listicle in the corpus. | M (~1 day) | Step-by-step process videos; numbered tutorials; "we cover N topics" intros |
| 5 | `<DualObjectComparison>` molecule (two icons with price + descriptor on a navy split-screen) | molecule | One window, but a complete and self-contained rhetorical pattern. Re-usable for any "X vs Y" framing where both sides have a number attached. | S (≤1 day) | Comparison content; pricing decoy slides; before/after pricing |
| 6 | Enhancement: `<SocialPostCard>` gains a `mode: "fullscreen-screenshot"` variant | enhancement | Lets us reuse the existing card chrome for both "embedded in talking head" and "fullscreen screenshot on color background" usage. | S (≤1 day) | All social-post recap videos; "remember that post I made N years ago" callbacks |
| 7 | Enhancement: word-by-word caption renderer gains 3-state (invisible → preview → final) tweening | enhancement | Specific to Hormozi's progressive-dim tweet style but worth shipping because it's a generally-richer text reveal that other creators might want to opt into. | S (≤1 day) | Any tweet card; any quote card; any prophetic-tone monologue |
| 8 | Enhancement: `<HUDChrome>` gains "split-tone headline" (yellow phrase + white phrase same baseline) | enhancement | Single-window appearance but cleanly composable; useful for any aerial-b-roll or burned-stat overlay. | S (≤1 day) | b-roll inserts; stat-burn headlines; transition overlays |
| 9 | Enhancement: captions support "equation mode" (operator tinted in accent, pops 2f before right operand) | enhancement | Small caption-renderer addition. | S (½ day) | Any "X = Y" or "X → Y" caption line in any explainer |
| 10 | Content rule (NOT code): masterclass format (≥35 min) uses paper-roll prop instead of overlays | rule | Codify as a writer-side rule in the template-selection guide. No code change. | none | Long-form Spanish masterclass videos under Armando Inteligencia |

### Effort summary
- **5 new molecules** (#1, #2, #3, #4, #5): ~6–8 engineering days
- **4 enhancements** to existing components (#6, #7, #8, #9): ~3 engineering days
- **1 content rule** (#10): documentation only
- **Existing primitives suffice for**: TweetCard single-card (left or right), NameTag lower-third, SplitPill result overlay, Cartoon illustration corner insert — covered by `<SocialPostCard>`, `<HUDChrome>`, `<BrandGlyphs>`, `pathDraw`, `heldStagger`, `rollingDigit`.

---

## 7. Voter #2 caveats and gaps

1. **Coarse sampling missed some moments.** The 1f/15s coarse scan combined with 1f/3s targeted probes is a strong sample but is not exhaustive. The masterclass (`qsXxckCbci0`) was scanned at ~318 frames over 80 minutes and showed zero overlays — but a denser scan could plausibly find one or two interstitial graphics. Confidence on the "ultra-long masterclass = zero overlays" claim is medium-high, not certain.

2. **Animation range labels were occasionally wrong on dense inspection.** Notably (a) `_KlZoPxbStk` anim-03 was labeled "side-text reveal" but actually contains BOTH the multi-color side-text AND the side-by-side cars comparison; (b) `JDR-R--4HhM` anim-01 was labeled "whiteboard hard-cutaway" but is actually a continuous talking-head shot with a paper-roll prop. The findings above reflect the dense-frame ground truth, not the coarse-sample labels.

3. **The two-cars comparison (anim-03 cars half in `_KlZoPxbStk`) was almost missed.** Only the targeted dense extraction caught it — at coarse 1f/15s, it sits in a single frame window. Worth flagging that this kind of fast-cut graphic insert can be invisible to coarse-scan voting and may have been under-counted across the broader Hormozi long-form catalog.

4. **No counters / no like-retweet / no media in tweet cards.** Voter #2 did not observe any animated counter, like-counter roll, or embedded image inside a tweet card. The cards are pure text-reveal. This **diverges from Tella's full animated-tweet primitive** which includes counter-rolls. Consensus document should reconcile.

5. **All 6 videos are 16:9.** Hormozi's long-form output is exclusively horizontal. No 9:16 (Shorts) or 1:1 (Reels) was sampled here; the Shorts catalog is a separate corpus.

---

## 8. Artifact inventory (everything written/extracted before this doc)

For reproducibility / the consensus reviewer:

```
references/creators/alexhormozi/
├── longform-picks-vote2.json                                    # this voter's 6 picks
├── longform-animation-ranges-vote2.json                         # this voter's animation windows
├── longform-frames/
│   ├── XGm2ERU9qtA/   v2-anim-{01-05}-frame-{001-013}.jpg       # ~60 frames
│   ├── _KlZoPxbStk/   v2-anim-{01-04}-frame-{001-027}.jpg       # ~81 frames
│   ├── 3SVksBB3_YY/   v2-anim-{01-08}-frame-{001-040}.jpg       # ~125 frames
│   ├── nSQdjim8CsE/   v2-anim-{01-02}-frame-{001-027}.jpg       # ~54 frames
│   └── JDR-R--4HhM/   v2-anim-{01}-frame-{001-023}.jpg          # ~23 frames
docs/research/wave-6/references/alexhormozi/
├── 3SVksBB3_YY-anim-{01-08}-v2.mp4    (12.0–15.1s each, 8 clips)
├── XGm2ERU9qtA-anim-{01-05}-v2.mp4    (12.0–15.0s each, 5 clips)
├── _KlZoPxbStk-anim-{01-04}-v2.mp4    (12.0–14.0s each, 4 clips)
├── nSQdjim8CsE-anim-{01-02}-v2.mp4    (15.0–15.1s each, 2 clips)
└── JDR-R--4HhM-anim-{01}-v2.mp4       (15.06s, 1 clip)
```

Total: **20 reference clips** (matches the brief's prior agent's stated extraction count) + **~343 dense frames** across 5 videos (the 6th video, `qsXxckCbci0`, has no extracted frames — see §3.3).

---

*End of voter #2 analysis.*
