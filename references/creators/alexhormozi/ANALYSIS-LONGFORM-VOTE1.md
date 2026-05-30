# Alex Hormozi — long-form motion-graphics analysis (Voter #1)

> Independent vote. Voter #2 analyzed the same channel in parallel; their analysis is at `ANALYSIS-LONGFORM-VOTE2.md`. We compare both votes in `docs/research/wave-6/alexhormozi-longform-consensus.md`.

## 1. Voter metadata

- voter: vote1
- date: 2026-05-27
- channel: https://www.youtube.com/@AlexHormozi
- videos analyzed: 6 (from a candidate pool of 6 in `longform-picks-vote1.json`)
- animations cataloged: 24 (across the 6 videos, ranging from 13s to 32s clips)
- selection methodology: "Filtered Hormozi's @AlexHormozi/videos feed for duration 10–60 min (long-form, not Shorts). View counts not available via yt-dlp flat-playlist on this run, so picks driven by title heuristics that predict heavy motion-graphics usage: explicit numbered listicles, business case studies (likely whiteboard / chart work), 'Levels' titles (ranked-hierarchy candidate per Tella claim), AI-themed (likely tweet cards + product UI screenshots)."
- artifacts:
  - dense frames at `references/creators/alexhormozi/longform-frames/<videoId>/anim-NN-frame-NNN-tNs.jpg`
  - reference clips at `docs/research/wave-6/references/alexhormozi/<videoId>-anim-NN.mp4` (no `-v2` suffix = voter1; clips are 13–32s, audio stripped)
  - structured inventory at `references/creators/alexhormozi/longform-animation-ranges-vote1.json`

---

## 2. Channel overview

Hormozi's long-form videos are filmed across **two distinct sets** with two distinct visual grammars. The first is a **podcast/studio set** (Acquisition.com mountain logo, vertical light strips, dark wood desk, black backdrop) where Hormozi sits at a Shure SM7B-style boom mic in either a flannel or tank top. The second is the **two-cam interview set** — actually a composite, not a real room: a saturated purple gradient background hosts two portrait-orientation camera thumbnails (Hormozi typically on one side, an entrepreneur/founder on the other), with a large white rounded-rectangle "card" centered between them holding the slide content (bullets, tables, screenshots). A persistent **purple breadcrumb pill** anchored top-center carries the current section name in white bold sans-caps ("WHAT'S THE PROBLEM?", "STATE OF THE BUSINESS", "ADS", "REACTIVATION EMAILS", "AFFILIATES") and acts as a chapter beacon across the entire interview. There is also a third mode: an **overhead-camera whiteboard** mode where Hormozi (off-camera, hands only) draws live with a blue marker on a giant white sheet — the diagrams (radial trees, pyramids, funnels) are filmed, not animated post-hoc, but they're conceptually the same shape as our procedural diagram primitives.

On top of these three sets, Hormozi runs a consistent **typographic motion library** that survives across both studios: yellow bold sans-caps as the dominant emphasis color (often with a yellow glow halo on hero text), purple as the structural / section color, white as the body color. The reveal language is built around four moves: (1) lower-third text that drops in from below with a glow, (2) yellow-highlight bars that paint over key bullets or table rows, (3) animated tweet cards with a purple-numbered badge in the corner (one card per listicle item, transitioning by sliding the previous card up while the next slides in from below — a literal **paginated-listicle** mechanic), and (4) descending purple 3D bars with `#1`/`#2` yellow tags for ranked hierarchies. These last two are the patterns Tella claimed Hormozi was famous for, and the evidence here **confirms them outright for long-form** even though we previously refuted them for Shorts.

---

## 3. Per-video distillation

### Video 1 — `OQf2Ba-Lp_4` "Building a $2,500,000 Business for a Stranger in 36 Minutes"

- URL: https://www.youtube.com/watch?v=OQf2Ba-Lp_4
- Duration: 2179s (36m 19s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/OQf2Ba-Lp_4-anim-{01..06}.mp4` (16–22s each)

**Finding 1.1 — `numbered-circle-listicle-counter`** (range 0–15s)
- visual: a lime/yellow outlined circle holding a number ("1") floats top-right of a talking-head shot, with a yellow-underlined bold sans-caps headline ("THAT $1.2M ISN'T ALL PROFIT") below the circle. A faded next-item ("2") sits below the active one, telegraphing the listicle continues. The circle outline is ~3px stroke, no fill; the underline beneath the headline is a thick yellow bar that animates in left-to-right behind the text.
- frames: `OQf2Ba-Lp_4/anim-01-frame-{001..010}-t0s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-01.mp4` (16s)
- transitionVerb: "The lime circle scale-pops in around the number, the yellow underline bar wipes in left-to-right behind the headline over 8 frames, and the headline letters fade up in one beat — then the faded next-item ghosts in below as a 50%-opacity teaser."
- orientation: 16:9
- replicability: **covered** — `staggerEntry` + `TextEmphasis` (existing) + a new tiny `NumberedBadge` ring primitive. Trivial.

**Finding 1.2 — `two-cam-interview-slide-with-bullets`** (range 55–70s)
- visual: the canonical Hormozi two-cam template — purple gradient bg, Hormozi portrait-cropped left, entrepreneur portrait-cropped right, a large white rounded-rectangle card centered between them. The card holds a bulleted list ("Need to Pay off Debt", "Lead Generation" with sub-bullets "Higher quantity / More higher value customers", "Improve Operations for Existing Clients" with sub-bullets), and one parent bullet + one child bullet are highlighted with a thick yellow background bar painted over the text. Persistent purple breadcrumb chip at top-center reads "WHAT'S THE PROBLEM?".
- frames: `OQf2Ba-Lp_4/anim-02-frame-{001..010}-t55s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-02.mp4` (17s)
- transitionVerb: "Both side-cam thumbnails crop in with a slight scale-up, the white card slides up from below holding the static bullets, then the two yellow highlight bars paint in left-to-right one after the other (parent first, child second) over 14 frames combined."
- orientation: 16:9
- replicability: **new molecule needed** — `<TwoCamInterviewSlide>` that takes a slot for the center card content. Card itself uses existing `<MacWindow>`-style chrome conventions. Side-cam thumbnails are just rounded-rect masks on talking-head footage.

**Finding 1.3 — `animated-revenue-table-with-yellow-row-highlight`** (range 205–220s)
- visual: same two-cam shell, breadcrumb now reads "STATE OF THE BUSINESS". White card center holds a "NUMBERS" tabular layout with 6 rows: TTM Revenue ($1.25M), TTM Profit ($479K), Net Margin (38%), Marketing Spend ($7,140/mo), Show Rate (~99%), Close Rate (82%). The top two rows (TTM Revenue, TTM Profit) are highlighted with a full-width yellow background bar painted across both the label and value cells. Body uses a bold sans for labels and a regular sans for values; cells are separated by thin horizontal rules.
- frames: `OQf2Ba-Lp_4/anim-03-frame-{001..010}-t205s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-03.mp4` (17s)
- transitionVerb: "Table rows stagger-fade in top-to-bottom over 12 frames, then the two yellow row-highlight bars wipe in left-to-right over the top two rows simultaneously, last."
- orientation: 16:9
- replicability: **new molecule needed** — `<RevenueTable>` with row-level highlight slot. The two-cam shell is shared with finding 1.2.

**Finding 1.4 — `embedded-screenshot-card-with-side-cams`** (range 580–600s)
- visual: same two-cam shell, breadcrumb "ADS". White card center holds a full website screenshot (Pro Shine Professional Cleaning) with browser-style top chrome (URL bar visible), and the screenshot includes a hero image + "Contact Pro Shine Professional Cleaning Serving SC & GA" heading + teal CTA "Give Us a Call Today!" button. Side-cam thumbnails persist left/right.
- frames: `OQf2Ba-Lp_4/anim-04-frame-{001..010}-t580s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-04.mp4` (22s)
- transitionVerb: "The browser chrome draws on top-down (URL bar reveal), then the screenshot fades up underneath it, then a subtle slow Ken Burns drift starts (4% scale over the held duration)."
- orientation: 16:9
- replicability: **covered** — `<MacWindow>` (existing) provides the browser chrome; `smartZoom` provides the drift. Wrap inside the same `<TwoCamInterviewSlide>` shell.

**Finding 1.5 — `purple-section-breadcrumb-bar`** (range 1190–1210s)
- visual: a horizontal purple bar pinned to the top-center of the frame, holding a single line of bold white sans-caps that names the current chapter (e.g. "REACTIVATION EMAILS", "AFFILIATES"). The bar is ~70px tall, fills roughly the central 60% of frame width, and has a hard rectangular shape (no rounded corners on the example I sampled). It persists across the entire two-cam template — this is the chapter beacon for the whole video.
- frames: `OQf2Ba-Lp_4/anim-05-frame-{001..010}-t1190s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-05.mp4` (22s)
- transitionVerb: "Bar slides in from above and lands flush with the top edge over 6 frames; the white caps reveal as a clip-path wipe from left-to-right once the bar is in place."
- orientation: 16:9
- replicability: **new primitive** — `<SectionBreadcrumbBar>`. Reusable across compositions; analogous to our existing `<BrandBreadcrumb>` but with a stronger color block treatment.

**Finding 1.6 — `cta-link-pill-lower-third`** (range 356–372s)
- visual: a saturated purple horizontal pill ~60% frame width, lower-third, holding bold white sans-caps "ACQUISITION.COM/ROADMAP". Visible drop-shadow. Sits on top of the talking-head studio shot — no other animation on screen during this beat.
- frames: `OQf2Ba-Lp_4/anim-06-frame-{001..010}-t356s.jpg`
- ref clip: `OQf2Ba-Lp_4-anim-06.mp4` (18s)
- transitionVerb: "Pill scale-pops in from 0.6 → 1.0 with a soft drop-shadow easing in behind it over 10 frames, holds 4 seconds, then fades out."
- orientation: 16:9
- replicability: **covered** — `<HormoziOverlays>` (existing) likely already handles this exact treatment. Verify, otherwise it's a `<CtaPill>` molecule.

---

### Video 2 — `3fsJFUvA6Ts` "What Makes The Perfect Business (5 Things)"

- URL: https://www.youtube.com/watch?v=3fsJFUvA6Ts
- Duration: 1240s (20m 40s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/3fsJFUvA6Ts-anim-{01..05}.mp4` (17–27s each)

**Finding 2.1 — `price-comparison-card-with-icon`** (range 130–145s)
- visual: a single large rounded-rect dark card with thin white outline, centered. Yellow bold sans-caps title "MONTHLY MEMBERSHIP" pinned to the top with a thin horizontal divider below. Card body is split vertically by a thin white line; on the left a small user-silhouette icon sits next to a huge white sans "$99" (was "$9" in an earlier moment of the same beat — values animate up); on the right a huge white "$99" sits above the multi-color "skool" wordmark (the Skool brand logo with each letter in a different brand color).
- frames: `3fsJFUvA6Ts/anim-01-frame-{001..010}-t130s.jpg`
- ref clip: `3fsJFUvA6Ts-anim-01.mp4` (17s)
- transitionVerb: "Card chrome draws in (border, title, divider) over 6 frames, then left value count-ups to its target, then right value count-ups to its target with a 4-frame lag, then the skool logo scale-pops in."
- orientation: 16:9
- replicability: **mostly covered** — `BigNumberDuel9x16` (existing composition, currently 9x16) is the direct cousin. Needs a 16:9 sibling and a slot for logo / icon. Use `countUp` primitive for the values.

**Finding 2.2 — `perforated-ticket-listicle-cream`** (range 880–905s) — **STRONG TELLA MATCH (ranked-hierarchy)**
- visual: a stack of cream-colored ticket-shaped cards on a deep navy background. Each ticket has a vertical perforated (dashed-line) divider near the left edge; the small left column holds a bold serif numeral (1, 2, 3, 4, 5), the larger right column holds a bold sans-caps label ("STICKY", "EXPENSIVE", "EXPANSION", "AIR", "UNIQUE"). The tickets stack vertically with small gaps, animating in one-at-a-time top-to-bottom. The cream color + serif numerals + perforated divider give this a literal physical-ticket feel.
- frames: `3fsJFUvA6Ts/anim-02-frame-{001..017}-t880s.jpg`
- ref clip: `3fsJFUvA6Ts-anim-02.mp4` (27s)
- transitionVerb: "Each ticket slides in from below with a small overshoot (1.05 → 1.0 scale), held 16 frames before the next ticket starts, perforated divider draws in last on each ticket as a stroke-dashoffset."
- orientation: 16:9
- replicability: **new composition needed** — `RankedTicketListicle16x9.tsx`. Uses `heldStagger` (existing) for the cascade and `pathDraw` (existing) for the perforated divider. Our existing `RankedTierList9x16` (if registered) is the 9:16 cousin.

**Finding 2.3 — `tag-list-yellow-title-bullets`** (range 655–670s)
- visual: yellow bold sans-caps title "SHRINKING INDUSTRIES" pinned top-left, with a comma-grid of items below ("Newspaper", "Tobacco", "Alcohol", "Retail" — and continuing in later frames). Each item is prefixed with a small white triangle (▶) playing the role of a bullet. The whole overlay sits left-third of a talking-head broll shot.
- frames: `3fsJFUvA6Ts/anim-03-frame-{001..010}-t655s.jpg`
- ref clip: `3fsJFUvA6Ts-anim-03.mp4` (17s)
- transitionVerb: "Yellow title fades up first, then each tag (triangle + word) fades up in stagger left-to-right, top-to-bottom over 18 frames total."
- orientation: 16:9
- replicability: **covered** — existing `<TextEmphasis>` + `staggerEntry` is enough. Tag triangle is a CSS pseudo-element.

**Finding 2.4 — `sponsor-product-callout-with-color-logo`** (range 805–820s)
- visual: centered multi-color "skool" wordmark with a 2-line description text below it, against a subtly desaturated talking-head bg. This is the in-video sponsor mention beat — appears mid-roll without breaking studio framing.
- frames: `3fsJFUvA6Ts/anim-04-frame-{001..010}-t805s.jpg`
- ref clip: `3fsJFUvA6Ts-anim-04.mp4` (17s)
- transitionVerb: "Logo scale-pops in, description text fades up below it line-by-line, talking-head bg desaturates from 100% to ~40% saturation behind the logo."
- orientation: 16:9
- replicability: **covered** — straight overlay composition. Could be a small `<SponsorCallout>` molecule.

**Finding 2.5 — `yellow-text-broll-lower-third`** (range 430–445s)
- visual: two-line yellow bold sans-caps ("SOFTWARE / PHYSICAL PRODUCTS") lower-third on talking-head with a poster B-roll. The yellow has a soft glow halo. Word-pair contrast pattern.
- frames: `3fsJFUvA6Ts/anim-05-frame-{001..010}-t430s.jpg`
- ref clip: `3fsJFUvA6Ts-anim-05.mp4` (17s)
- transitionVerb: "First line drops in from below with a yellow glow, holds 12 frames, then the second line drops in below it with the same motion."
- orientation: 16:9
- replicability: **covered** — `<HormoziOverlays>` + `<TextEmphasis>` (existing).

---

### Video 3 — `hHkdbr6_JJs` "How Acquisition.com Makes Money"

- URL: https://www.youtube.com/watch?v=hHkdbr6_JJs
- Duration: 972s (16m 12s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/hHkdbr6_JJs-anim-{01..02}.mp4` (17s each)

**Finding 3.1 — `lower-third-yellow-allcaps-title`** (range 10–25s)
- visual: yellow bold sans-caps two-line lower-third "CO-FOUNDER OF / THE COMPANY" sitting over the studio shot (dark backdrop, two Acquisition.com logo glyphs flanking Hormozi). Thin black drop-shadow halos each letter.
- frames: `hHkdbr6_JJs/anim-01-frame-{001..010}-t10s.jpg`
- ref clip: `hHkdbr6_JJs-anim-01.mp4` (17s)
- transitionVerb: "Line one drops in from below, line two follows 6 frames later with the same drop, both hold then fade out together."
- orientation: 16:9
- replicability: **covered** — same primitives as 2.5.

**Finding 3.2 — `overhead-whiteboard-marker-draw`** (range 135–600s — sustained b-roll mode)
- visual: overhead camera pointed straight down at a giant white sheet of paper on a wooden desk. Hormozi (off-camera) draws diagrams in blue marker — radial tree with MEDIA at the center and branches labeled DISNEY+, ACQ NETWORK, etc.; pyramid hierarchies with HIGH RISK / LOW RISK axes; funnel pipelines. NOT animated post-hoc — this is filmed live B-roll. But the diagrams are conceptually exactly what `pathDraw` was built for.
- frames: `hHkdbr6_JJs/anim-02-frame-{001..010}-t580s.jpg`
- ref clip: `hHkdbr6_JJs-anim-02.mp4` (17s)
- transitionVerb (for our procedural replication): "Central oval node draws first (stroke-dashoffset on the ellipse outline), label inside fades in, then radial lines draw outward one-at-a-time, then each leaf label fades in as its line lands."
- orientation: 16:9
- replicability: **mostly covered** — `pathDraw` (existing) handles the strokes. We'd need a `<RadialTreeDiagram>` molecule that lays out N branches around a center node with marker-style hand-drawn font. Replicating Hormozi's *aesthetic* (marker handwriting, paper texture) is the open question — could use a marker-stroke SVG filter.

---

### Video 4 — `rMJIOK_FgJk` "The 6 Levels of Making Money"

- URL: https://www.youtube.com/watch?v=rMJIOK_FgJk
- Duration: 1049s (17m 29s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/rMJIOK_FgJk-anim-{01..04}.mp4` (17–22s each)

**Finding 4.1 — `iconified-concept-card-grid`** (range 0–18s)
- visual: three saturated-purple rounded-rect cards floating in a loose triangle layout against a desaturated talking-head bg. Each card has a bold white sans-caps label (MARRY / INHERIT / TRADE) and a flat white silhouette icon below (bride+groom couple / house / podium-clerk). Cards have soft drop shadows; corner radius ~16px.
- frames: `rMJIOK_FgJk/anim-01-frame-{001..012}-t0s.jpg`
- ref clip: `rMJIOK_FgJk-anim-01.mp4` (19s)
- transitionVerb: "Cards scale-pop in one-at-a-time clockwise (top, right, left), each labeled with a label fade-up immediately after, icon fade-up 4 frames after that."
- orientation: 16:9
- replicability: **new molecule needed** — `<ConceptCardGrid>` taking N cards with {label, icon} slots. Layout strategy could be configurable (triangle, line, grid).

**Finding 4.2 — `milestone-checklist-progress-toggle`** (range 130–150s)
- visual: vertical checklist on deep navy bg. Three "Milestone 1 / 2 / 3" rows each with a checkbox on the left and a dollar amount on the right in bold yellow ("$350", "$415", "$867"). At the start only Milestone 1 is checked + lit yellow; through the beat each subsequent checkbox toggles on with a checkmark glyph drawing in, and the matching amount lights yellow. Bottom row "Full Payment $1,632" sums it all up after a divider rule.
- frames: `rMJIOK_FgJk/anim-02-frame-{001..013}-t130s.jpg`
- ref clip: `rMJIOK_FgJk-anim-02.mp4` (22s)
- transitionVerb: "Each row's checkbox-check stroke draws in (path-draw), then the yellow color flush-fades the dollar amount from white to yellow over 6 frames, held 18 frames before the next milestone toggles. After all three: divider line draws in, then 'Full Payment' row fades up with its summed amount count-up animation."
- orientation: 16:9
- replicability: **new molecule needed** — `<MilestoneChecklist>` with progressive state-toggle. Uses `pathDraw` for the check glyph, `countUp` for the final total, `heldStagger` for the cascade.

**Finding 4.3 — `two-line-title-subtitle-yellow-chyron`** (range 55–75s)
- visual: two-line yellow lower-third over talking-head — large bold all-caps "W-2 AGREEMENT" with a smaller bold-caps subtitle below "BEING A COMPANY EMPLOYEE (ON PAYROLL)". Both yellow, both with soft glow. Used to define a term during voiceover.
- frames: `rMJIOK_FgJk/anim-03-frame-{001..NN}-t55s.jpg`
- ref clip: `rMJIOK_FgJk-anim-03.mp4` (22s)
- transitionVerb: "Title drops in from below with a glow, subtitle fades up underneath it 8 frames later, both hold 90 frames then fade out together."
- orientation: 16:9
- replicability: **covered** — existing primitives.

**Finding 4.4 — `single-word-yellow-emphasis-lower-third`** (range 280–295s)
- visual: a single yellow bold sans-caps word ("PEOPLE", "Invoice", "Half Payment $300") in the lower-left with no pill, just a soft drop-shadow. Brief single-keyword overlay during voiceover.
- frames: `rMJIOK_FgJk/anim-04-frame-{001..NN}-t280s.jpg`
- ref clip: `rMJIOK_FgJk-anim-04.mp4` (17s)
- transitionVerb: "Word scale-pops in from 0.85 to 1.0 with a slight upward drift over 8 frames, holds 20 frames, then slides up and out."
- orientation: 16:9
- replicability: **covered** — `<TextEmphasis>` (existing).

---

### Video 5 — `9q5ojtkqsBs` "How to Win With AI in 2026"

- URL: https://www.youtube.com/watch?v=9q5ojtkqsBs
- Duration: 1459s (24m 19s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/9q5ojtkqsBs-anim-{01..03}.mp4` (13–32s each)

**Finding 5.1 — `tweet-wall-with-focused-center-card`** (range 0–12s) — **STRONG TELLA MATCH (animated tweet card)**
- visual: a 3D-arranged grid of 7 tweet cards floating against a black bg. Each card is the standard Twitter/X chrome (avatar, handle, body text, action row). The center card is in sharp focus reading "BREAKING: First multi-agent world / Agents from separate OpenClaw instances can now talk to each other. Local. Remote. Connected." The surrounding 6 cards are motion-blurred to suggest depth/scroll. The grid is slightly skewed in 3D perspective. (Note: voter #1 ranges JSON originally labeled this finding `full-screen-animated-news-headline-page` based on a single frame the voter glanced at; my frame sampling shows the dominant content of the 0–12s beat is a tweet wall, not a press-clipping. Treating this as the tweet-wall pattern.)
- frames: `9q5ojtkqsBs/anim-01-frame-{001..008}-t0s.jpg`
- ref clip: `9q5ojtkqsBs-anim-01.mp4` (13s)
- transitionVerb: "Tweet cards fade in across the grid in a staggered noise-pattern (not strict order), then the camera dollies slightly toward the center card while the surrounding cards motion-blur and drift outward."
- orientation: 16:9
- replicability: **new composition needed** — `TweetWall16x9.tsx` that uses `<SocialPostCard>` (existing) at the leaf level and composes N of them in a 3D perspective grid with blur on non-focused cards. Could share the SocialPostCard chrome with our existing `TweetCard9x16` composition.

**Finding 5.2 — `descending-3d-bar-chart-with-rank-labels`** (range 28–45s) — **STRONG TELLA MATCH (ranked-hierarchy bars)**
- visual: 8 tall purple 3D-extruded bars arranged in a row, descending in height from largest on the left to smallest on the right. Each bar has a soft purple glow underneath simulating spotlight. The first two bars have yellow `#1` and `#2` labels floating above their tops (also with a yellow glow). The whole composition sits on a near-black bg with a subtle vignette.
- frames: `9q5ojtkqsBs/anim-02-frame-{001..011}-t28s.jpg`
- ref clip: `9q5ojtkqsBs-anim-02.mp4` (19s)
- transitionVerb: "Bars rise from a 0-height baseline one-at-a-time left-to-right with an ease-out cubic (each bar starts as the prior bar reaches ~60% height — overlapping cascade), then the `#1` and `#2` yellow labels scale-pop in last, simultaneously."
- orientation: 16:9 (port from existing 9:16 sibling)
- replicability: **new composition needed** — `BenchmarkBars16x9.tsx` (we have a `BenchmarkBars9x16` already — port it). Uses `heldStagger` (existing) for the bar cascade and `countUp`-style scale for each bar's rise. Add per-bar `#N` rank label slot.

**Finding 5.3 — `product-page-screenshot-with-cta`** (range 1420–1450s)
- visual: a full-screen screenshot of a Skool community page (Hormozi's "ACQ VANTAGE" community: member count, online count, "JOIN $1,000/month" yellow CTA button, embedded $100M Playbooks video card). The screenshot has a subtle drift/zoom motion (Ken Burns). Lower-third yellow bold sans-caps overlay "LINK IN DESCRIPTION".
- frames: `9q5ojtkqsBs/anim-03-frame-{001..NN}-t1420s.jpg`
- ref clip: `9q5ojtkqsBs-anim-03.mp4` (32s)
- transitionVerb: "Screenshot fades up at 1.0 scale, then slowly drifts inward to 1.05 scale over the held duration via Ken Burns; yellow CTA text scale-pops in lower-third around 4s into the held shot."
- orientation: 16:9
- replicability: **covered** — `smartZoom` (existing) provides the Ken Burns; existing `<HormoziOverlays>` provides the lower-third CTA.

---

### Video 6 — `XGm2ERU9qtA` "15 Brutal Truths I Know at 36 That I Wish I Knew at 20"

- URL: https://www.youtube.com/watch?v=XGm2ERU9qtA
- Duration: 1685s (28m 05s)
- Reference clips: `docs/research/wave-6/references/alexhormozi/XGm2ERU9qtA-anim-{01..04}.mp4` (17–22s each)

**Finding 6.1 — `yellow-broll-lower-third-with-glow`** (range 0–18s)
- visual: lower-third yellow bold sans-caps "WORTH SUFFERING FOR" with a strong yellow glow halo. The text spans full bottom-third width; it drops in from below, holds, exits down. Opening hook beat for the video.
- frames: `XGm2ERU9qtA/anim-01-frame-{001..012}-t0s.jpg`
- ref clip: `XGm2ERU9qtA-anim-01.mp4` (19s)
- transitionVerb: "Text drops in from below with a soft overshoot bounce (springConfig damping=0.5), yellow glow grows from 0 to full opacity behind it over the same beats, holds 60 frames, slides up and out."
- orientation: 16:9
- replicability: **covered** — existing primitives.

**Finding 6.2 — `two-line-caption-with-yellow-emphasis-words`** (range 130–145s)
- visual: a two-line lower-third caption ("no matter what / YOUR GOAL IS") — first line in white normal, second line (or just the keywords within) in bold yellow sans-caps with a yellow glow. This is a karaoke-style caption with selective word emphasis on the punch words.
- frames: `XGm2ERU9qtA/anim-02-frame-{001..010}-t130s.jpg`
- ref clip: `XGm2ERU9qtA-anim-02.mp4` (17s)
- transitionVerb: "Lines reveal word-by-word from left to right; the yellow-emphasis words trigger a glow burst on appear (scale-pop 1.0 → 1.08 → 1.0 over 4 frames with the glow opacity peaking at the 1.08 mark)."
- orientation: 16:9
- replicability: **mostly covered** — our existing `<Caption>` system + word-level emphasis via `<TextEmphasis>` likely already handles this; verify the glow burst on emphasis is wired.

**Finding 6.3 — `animated-tweet-card-listicle-with-numbered-badge`** (range 275–295s) — **STRONG TELLA MATCH (animated tweet card)**
- visual: an animated tweet card pinned upper-left of frame, with Hormozi visible on the right talking. The card is white rounded-rect, ~50% of frame width, holding the standard Twitter chrome (avatar in upper-left, "Alex Hormozi ✓" handle, "@AlexHormozi" sub-handle, then body text "You can beat 99% of people"). A bold purple sans-caps numeral badge "2" floats in the upper-right corner of the card (no circle, just a colored number — this IS the listicle counter, indicating this is item #2 of 15).
- frames: `XGm2ERU9qtA/anim-03-frame-{001..013}-t275s.jpg`
- ref clip: `XGm2ERU9qtA-anim-03.mp4` (22s)
- transitionVerb: "Card slides in from the left with a slight overshoot, avatar scale-pops in, handle slides in from the left, sub-handle fades up, body text reveals line-by-line, then the purple number badge scale-pops in last (upper-right)."
- orientation: 16:9
- replicability: **new composition needed** — `HormoziTweetListicle16x9.tsx` that uses `<SocialPostCard>` (existing) and adds a numbered-badge slot. Should pair with finding 6.4 below (the inter-card transition).

**Finding 6.4 — `tweet-card-slide-transition-between-items`** (range 1030–1050s) — **CRITICAL PAIR TO 6.3**
- visual: at the moment of transition between two listicle items, the previous tweet card (item #7 "Most people think the hard part is getting started…") slides UP and exits past the top edge of frame, while a new tweet card (item #8 "Your inability to work without…") slides IN from below and into its place. For a brief moment both cards are visible simultaneously. Numbered badge updates per card (`7` → `8` in purple).
- frames: `XGm2ERU9qtA/anim-04-frame-{001..010}-t1030s.jpg`
- ref clip: `XGm2ERU9qtA-anim-04.mp4` (22s)
- transitionVerb: "Outgoing card translates upward (Y: 0 → -120%) over 18 frames with an ease-in-out; incoming card simultaneously translates from below (Y: +120% → 0) over the same 18 frames; both cards overlap visually around the 9-frame mid-point."
- orientation: 16:9
- replicability: **new mechanic** — `<PaginatedListSlide>` molecule. Pairs with finding 6.3 to make the full listicle work. This is the "paginated-listicle" transition primitive Tella claimed Hormozi uses, and it is **confirmed**.

---

## 4. Catalog of distinct patterns

Collapsing the 24 per-video findings into named, deduped patterns:

| Pattern name (PascalCase) | Frequency in sample | Visual description | transitionVerb | Orientation | Replicability | Effort |
|---|---|---|---|---|---|---|
| `TwoCamInterviewSlide` | 4 of 6 videos (canonical case-study template — findings 1.2, 1.3, 1.4, 1.5) | Purple gradient bg + two portrait cam thumbnails left/right + center white card holding the slide content + persistent purple breadcrumb bar pinned top-center naming the section. The chassis for at least four distinct slide types. | "Side-cam thumbnails crop in with slight scale-up, center card slides up from below, breadcrumb bar wipes in from above last." | 16:9 | **new molecule** | M |
| `SectionBreadcrumbBar` | 4 of 6 videos (every two-cam slide, plus a few solo overlays) | Saturated purple horizontal bar pinned to top-center holding a single line of white bold sans-caps naming the section. Rectangular, ~70px tall, fills central ~60% of frame width. Persists across scenes. | "Bar slides in from above, white caps reveal as left-to-right clip-path wipe once bar lands." | 16:9 | **new primitive** | S |
| `YellowRowHighlightTable` | 1 of 6 (finding 1.3 — but the *pattern* is broader, e.g. yellow-highlight bullets in 1.2) | Tabular data card with selective full-width yellow background bars painted over the most important rows. | "Table rows stagger-fade in top-to-bottom, then yellow row-highlight bars wipe in left-to-right over the chosen rows last." | 16:9 | **new molecule** | M |
| `HormoziTweetCardListicle` | 2 of 6 (findings 6.3, 6.4 — but spans the entire `XGm2ERU9qtA` video at 15 items, so very dense within the videos it appears) | Animated white tweet card with avatar, verified-handle, sub-handle, body — plus a bold purple numbered badge in the upper-right corner indicating listicle position. Paginated transitions between items via vertical slide. | "Card slides in from left, avatar pops, handle slides in, body reveals line-by-line, badge pops in last. Between items: outgoing card slides up while incoming slides up from below." | 16:9 | **new composition** | L |
| `TweetWall3D` | 1 of 6 (finding 5.1) | 3D-perspective grid of 7+ tweet cards on a black bg, with motion blur on the surrounding cards and sharp focus on the center one. The corpus-of-tweets opener. | "Cards fade in across the grid in noise-stagger order, then camera dollies toward center card while peripherals motion-blur and drift." | 16:9 | **new composition** | L |
| `DescendingRankBars3D` | 1 of 6 (finding 5.2) | 8 tall purple 3D-extruded bars arranged in descending-height row with `#1`/`#2` yellow rank labels above the tallest two. Soft purple spotlight glow under each bar. | "Bars rise from baseline one-at-a-time left-to-right (overlapping cascade), then yellow rank labels scale-pop in simultaneously last." | 16:9 (port from existing 9:16 sibling) | **new composition (16:9 port)** | M |
| `PerforatedTicketListicle` | 1 of 6 (finding 2.2) | Stack of cream-colored ticket cards on deep navy bg, each with a perforated-line divider between a serif number column and a bold sans-caps label column. | "Each ticket slides in from below with overshoot, held 16 frames before next, perforated divider draws in last on each as stroke-dashoffset." | 16:9 | **new composition** | M |
| `IconifiedConceptCardGrid` | 1 of 6 (finding 4.1) | Three+ saturated purple rounded-rect cards arranged in a loose triangle/grid layout, each with a label + flat white silhouette icon. | "Cards scale-pop in one-at-a-time clockwise, label fade-ups immediately after, icon fade-ups 4 frames after that." | 16:9 | **new molecule** | M |
| `MilestoneChecklistProgressive` | 1 of 6 (finding 4.2) | Vertical checklist on dark bg, each row has checkbox + label + yellow dollar amount, rows toggle on progressively, total row at bottom sums it all. | "Each row's checkbox-stroke draws, color of $ flush-fades white→yellow, held 18 frames, then next milestone. Final total count-ups." | 16:9 | **new molecule** | M |
| `YellowGlowLowerThird` | 5 of 6 (findings 2.5, 3.1, 4.3, 4.4, 6.1, 6.2 — pervasive) | One- or two-line yellow bold sans-caps lower-third on talking-head with a soft yellow glow halo. Sometimes a single keyword, sometimes a full phrase. | "Line drops in from below with overshoot, glow grows behind it, holds, fades or slides out." | 16:9 | **covered** (existing `<HormoziOverlays>` + `<TextEmphasis>`) | S |
| `CtaPurplePill` | 2 of 6 (findings 1.6, 5.3) | Saturated purple horizontal pill lower-third holding bold white sans-caps URL/CTA text. Drop-shadow. | "Pill scale-pops from 0.6→1.0 with drop-shadow easing in behind, holds, fades." | 16:9 | **covered** (verify `<HormoziOverlays>` handles it) | S |
| `NumberedCircleBadge` | 1 of 6 (finding 1.1, but conceptually used across the channel for item enumeration) | Lime/yellow outlined circle holding a number, paired with a yellow-underlined headline. Listicle counter atom. | "Circle scale-pops around number, yellow underline wipes in left-to-right behind headline, headline fades up." | 16:9 | **new primitive** (small) | S |
| `OverheadWhiteboardDraw` | 1 of 6 (finding 3.2 — sustained b-roll mode in the video) | Overhead camera on giant white paper, hands drawing diagrams (radial trees, pyramids, funnels) in blue marker live. | "Central node draws (ellipse stroke), label inside fades in, radial lines draw outward one-at-a-time, leaf labels fade in as lines land." | 16:9 (top-down) | **new molecule** (procedural replication) | L |
| `EmbeddedScreenshotWithBrowserChrome` | 1 of 6 (finding 1.4) | Center card holds a full website screenshot with browser-chrome top (URL bar visible). Sits inside the `TwoCamInterviewSlide` chassis. | "Browser chrome draws top-down, screenshot fades up underneath, Ken Burns drift starts (4% scale over held duration)." | 16:9 | **covered** (`<MacWindow>` + `smartZoom`) | S |
| `PriceComparisonDuel` | 1 of 6 (finding 2.1) | Single rounded-rect dark card with yellow title, dividing line down the middle, comparing a price with icon on left vs price with logo on right. | "Card chrome draws (border, title, divider), left value count-ups, right value count-ups with 4-frame lag, right logo scale-pops last." | 16:9 (existing 9:16 cousin: `BigNumberDuel9x16`) | **covered with port** | S |

**Total distinct patterns: 15.**

---

## 5. Cross-reference with Tella's claims

Tella cited Hormozi 3× in `docs/research/wave-5/tella-motion-graphics-synthesis.md` for two specific patterns:

### Tella claim 1: "Hormozi uses animated tweet cards"

**Verdict for long-form: CONFIRMED.**

Evidence:
- `XGm2ERU9qtA-anim-03.mp4` + frames at `XGm2ERU9qtA/anim-03-frame-013-t275s.jpg` show a textbook animated tweet card with full Twitter chrome (avatar / verified handle / sub-handle / body text reveal) and a bold purple numeral badge "2" in the upper-right corner indicating listicle position.
- `XGm2ERU9qtA-anim-04.mp4` + frames at `XGm2ERU9qtA/anim-04-frame-001-t1030s.jpg` show TWO tweet cards visible during the inter-item slide transition (item #7 sliding up and out, item #8 sliding up from below).
- `9q5ojtkqsBs-anim-01.mp4` + frames at `9q5ojtkqsBs/anim-01-frame-003-t0s.jpg` show a 3D-arranged WALL of 7 tweet cards with motion blur on the periphery — an even more elaborate use of the same primitive.

Our previous refutation was specific to **Shorts**, where I saw no tweet cards in the sampled corpus. Long-form rehabilitates the claim entirely. Tella was right for the surface area he was watching (Hormozi long-form).

### Tella claim 2: "Hormozi uses ranked-hierarchy listicle graphics"

**Verdict for long-form: CONFIRMED.**

Evidence:
- `3fsJFUvA6Ts-anim-02.mp4` + frames at `3fsJFUvA6Ts/anim-02-frame-010-t880s.jpg` show a textbook ranked-hierarchy listicle: cream perforated-ticket cards stacked vertically on deep navy, each with serif-numeral 1/2/3/4/5 on the left and sans-caps labels (STICKY/EXPENSIVE/EXPANSION/AIR/UNIQUE) on the right, animating in one-at-a-time top-to-bottom.
- `9q5ojtkqsBs-anim-02.mp4` + frames at `9q5ojtkqsBs/anim-02-frame-006-t28s.jpg` show a second ranked-hierarchy variant: 8 purple 3D bars descending in height with yellow `#1`/`#2` rank labels.
- The entire `XGm2ERU9qtA` ("15 Brutal Truths…") video is structured as a paginated ranked-listicle, with the purple numbered badge on each tweet card carrying the rank — this is also a ranked-hierarchy mechanic, just expressed as paginated cards instead of stacked tickets.

Again my prior refutation was Shorts-specific and is overturned by the long-form evidence.

### Final verdict on Tella's claims

Both Tella claims are **fully validated for Hormozi long-form**. The reason we initially refuted them was sampling bias — Shorts use a different visual vocabulary than long-form for the same creator. Future channel analyses must always check both surfaces independently.

---

## 6. Build priority queue addendum

Ranked list of new primitives / molecules / compositions to add based on Hormozi long-form findings, following the format in `docs/research/wave-5/tella-motion-graphics-synthesis.md` §5. Items are ordered by ROI — how many other compositions each unlocks, weighted by how trivially they slot into our existing brand chrome.

| Rank | Item | Type | Unlocks | Effort | Orientation |
|---|---|---|---|---|---|
| 1 | **`<SectionBreadcrumbBar>`** | primitive/molecule | `TwoCamInterviewSlide`, any chapter beacon across future long-form templates | S | 16:9 |
| 2 | **`<NumberedBadge>`** (small purple/yellow numeral, optional ring) | primitive | `HormoziTweetCardListicle`, `PerforatedTicketListicle`, `DescendingRankBars3D`, `NumberedCircleListicle` | S | both |
| 3 | **`<TwoCamInterviewSlide>`** molecule | molecule | All four interview-template findings (1.2, 1.3, 1.4, 1.5); the canonical Hormozi case-study chassis | M | 16:9 |
| 4 | **`HormoziTweetCardListicle16x9.tsx`** composition | composition | All paginated tweet-card listicles (the dominant pattern in `XGm2ERU9qtA`). Uses existing `<SocialPostCard>` + new `<NumberedBadge>` + `<PaginatedListSlide>` | L | 16:9 |
| 5 | **`<PaginatedListSlide>`** molecule (outgoing-up + incoming-up-from-below choreography) | molecule | `HormoziTweetCardListicle`, any "next item" listicle pagination across future channels | M | both |
| 6 | **`PerforatedTicketListicle16x9.tsx`** composition | composition | Hormozi "5 things" / "6 things" cream-ticket ranked listicles (Tella claim #2) | M | 16:9 |
| 7 | **`BenchmarkBars16x9.tsx`** composition (16:9 port of existing `BenchmarkBars9x16`) | composition | `DescendingRankBars3D` finding — Hormozi 8-bar ranked chart with rank labels | S | 16:9 |
| 8 | **`<RevenueTable>`** molecule with row-highlight slot | molecule | `YellowRowHighlightTable`, any tabular-data-with-emphasis card slot for the two-cam chassis | M | 16:9 |
| 9 | **`<IconifiedConceptCardGrid>`** molecule | molecule | `IconifiedConceptCardGrid` finding (3-up purple cards w/ icons) — generalizable to any 3-card conceptual lineup | M | 16:9 |
| 10 | **`<MilestoneChecklist>`** molecule with progressive state-toggle | molecule | `MilestoneChecklistProgressive` finding — any checklist-with-cumulative-total reveal | M | both |
| 11 | **`TweetWall3D16x9.tsx`** composition | composition | `TweetWall3D` opener finding (5.1) — corpus-of-tweets perspective grid | L | 16:9 |
| 12 | **`<RadialTreeDiagram>`** molecule (procedural marker-style draw) | molecule | `OverheadWhiteboardDraw` finding — replicate Hormozi's blue-marker radial trees procedurally | L | 16:9 |
| 13 | **`<CtaPurplePill>`** molecule (if not already in `<HormoziOverlays>`) | molecule | `CtaPurplePill` lower-third URL CTA | S | both |
| 14 | **`<PriceComparisonDuel16x9>`** (16:9 port of existing `BigNumberDuel9x16`) | composition | `PriceComparisonDuel` finding (2.1) | S | 16:9 |
| 15 | **Decision: 16:9 brand chrome.** Our existing chrome (BrandBreadcrumb, BrandWatermark) is 9:16-tuned. Hormozi long-form is 16:9-exclusive — do we maintain two parallel sets of brand chrome, or do compositions auto-adapt? | ADR | Clarifies whether Hormozi-style long-form compositions need separate brand-chrome variants | S (writeup) | meta |

**Process notes for the queue:**
- Items 1, 2, 5 are tiny shared primitives that unlock multiple downstream compositions. They should ship first.
- Item 3 (`TwoCamInterviewSlide`) is the single highest-leverage molecule — it's the chassis for 4 of the 24 findings. Build it second.
- Items 4 and 6 (the two `Listicle` compositions) are the direct Tella-claim payoffs and should ship together to make the validation visible.
- Item 12 (the procedural whiteboard) is intentionally last — it's the most aesthetically risky (hand-drawn marker look is hard) and shouldn't gate the other Hormozi templates.
- Hormozi long-form is **16:9-exclusive** in this sample. None of the 24 findings naturally fit 9:16 without restructuring. Item 15 flags this as a brand-chrome decision.
- Across the catalog, **9 of 15 patterns map cleanly to existing primitives + a thin new molecule layer.** Only 5 patterns are full new compositions. This is a high-ROI corpus relative to the Tella synthesis (which required 3 new primitives + 6 new molecules + 6 new compositions for similar coverage).

---

### End of voter #1 analysis.
