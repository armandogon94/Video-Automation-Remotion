# @motiondarwin — Darwin Pacheco (visual analysis)

> Scraped 2026-05-25 via `/reels/` endpoint (regular feed returned 401, as with `simonhoiberg`).
> 12 reels, restructured into per-shortcode folders, 8 keyframes each.

## Niche fit — important caveat

The S2 brief described `@motiondarwin` as a "Spanish motion-design **teacher**." That label is half-right.
Darwin Pacheco is Spanish-speaking and posts Cinema 4D / motion-design content, but his Instagram is a
**demoreel feed**, not an instructional / news / commentary feed. Captions are short (1 line, English-ish:
"Soft body practice", "Folding papers", "Tunnel practice", "Crazy experiments in c4D + redshift").
There is no voiceover, no on-screen Spanish text, no listicle/quote/talking-head/news-card structure.
His ONE pedagogy reference is `@domestika course … using AI as an assistant to generate your own
resources` — a course promo, not a teaching reel.

**Reuse value for our @armandointeligencia content pipeline is LOW for direct template lifting,
HIGH for one specific use case:** background plates / B-roll generators / 3D objects we can drop
behind a `BigNumberHero9x16` or `QuoteCard9x16` to escape the flat-color-card monoculture. He is
the only creator in our reference set who works in Cinema 4D + Redshift / Octane at portfolio
quality — useful for sourcing aesthetic ideas, not template structures.

## Templates identified

Distinct visual "templates" found across the 12 reels. Format follows the carloscuamatzin/midu.dev
convention: one row per template, what it is, which reels use it, what it would map to in our Stream E
typology.

### T1 — SoftBody3DLoopSquare1x1 (3 reels: `C3WL_6YNDbR`, `C_mBRa3PJDe`, `DAIML3XhMeP`)

Pure Cinema 4D + Redshift soft-body / character-animation loop, 1:1 square, no text, no captions,
no UI chrome. Pink/red dominant palette in two of the three; high-key gradient backgrounds.
3–10s duration, tight loop. This is portfolio / "practice piece" content.

**Map to our typology:** none. Not a template, an aesthetic. **Reuse idea:** commission a one-time
3D asset library (5–10 looped sting elements) in Cinema 4D and drop them behind our cards as
animated background plates. Replicating this template natively in Remotion/Hyperframes is
out-of-scope (would need a Three.js scene per asset).

### T2 — Cinema4DAbstract3DScene9x16 (5 reels: `C3lxiWmNp9w` folding-papers, `C_oq4VFvnpC` wheel-of-fortune, `DHm4XAlNSTM` tunnel, `DPnE-X3jAN3` wires, `DYWI-v0hBpA` headphones)

Same as T1 but stretched to a wider aspect (some 9:16, some 1:1 in 9:16 frame) and using non-character
3D objects: paper grid, wheel of fortune, gradient sunrise tunnel, twisted wires, headphones product
render. Caption hashtags reveal these are practice pieces (#somtember, "Tunnel practice", "Crazy
experiments"). Some show on-screen After Effects tracking annotations (`x: 742  y: 706`) — a "WIP
behind-the-scenes" framing.

**Map to our typology:** none directly. **Reuse idea:** same as T1 — source as background plates.
The DPnE-X3jAN3 "tracking annotation" overlay is interesting as a "we built this" authenticity move
but doesn't fit our editorial brand.

### T3 — ClientExplainerVideo16x9 (3 reels: `DIdHBYeBSuZ` Request Network, `DJc0232huQ_` Remote payroll, `DN6w6Tjgbzx` Brevo Black Friday)

Commissioned client work for SaaS brands. Flat-vector character illustrations + UI mockups +
brand-color frame fill (Request Network = neon green grid on black; Remote = bright blue solid;
Brevo = pastel green). Built around UI screens (payroll table with "Approve" modal, sale popup with
"99% deliverability" stat card, character standing on platform under floating dashboard tiles).
**These are 16:9 (1280x720) commercial work**, not vertical IG-native.

**Map to our typology:** the **stat-card pattern** in `DN6w6Tjgbzx` (giant "99%" + label inside
rounded white card on solid green bg, paired with a UI mockup card) is a close cousin of our existing
`BigNumberHero9x16` — validates the "huge number + tiny label in card" composition. The **UI-screen-with-
modal-popup pattern** in `DJc0232huQ_` ("Approve payroll?" yellow modal floating over a payroll table
inside a brand-color frame) is one we don't have and is **NOT WORTH BUILDING** for our use case —
we'd need custom illustration per video. Skip.

### T4 — CollageKineticTypeOverPhoto9x16 (1 reel: `DU7Y1AIDqtC` Domestika course)

The one outlier. Composited photo collage (vintage purple Toyota MR2, cutout plane, ripped paper
edges, AI-generated rainbow rays) with a hand-drawn-look bubble word "freedom" + tiny floating
photo elements as kinetic-type center. Caption says he used AI as "an assistant to generate your
own resources, not to do all the work." This is the closest Darwin gets to social-media-native
explainer content — and he made it explicitly for promoting a Domestika course.

**Map to our typology:** loosely related to a "MotionCollageHook" pattern we don't have. **Skip** —
relies on hand-tuned After Effects work per shot, not a parameterizable template. Useful only as a
visual reference for hook-pacing on educational content.

## Sprint priority

**LOW.** Do not add a `@motiondarwin` template to Stream E. Take a Sprint 4+ side errand to:

1. Source 4–6 looped 3D background plates inspired by T1/T2 (could commission, render in Blender,
   or generate via a future video model) and add them as an optional `--background-plate <name>`
   flag for `BigNumberHero9x16` and `QuoteCard9x16`. This breaks our current flat-color-card
   monoculture without adding a whole template.
2. File `DJc0232huQ_` and `DN6w6Tjgbzx` away as visual references for any future "product feature
   showcase" template (if we ever pitch one to a sponsor).

Do NOT prioritize this over: `@rileybrown.ai` (builder lane, active templates), or any creator who
ships voiceover-driven Spanish educational reels at our cadence (still an open gap).

## Notes / failures

- `@motiondarwin` exists — gallery-dl resolved user ID 4704794897 — but the main `/api/v1/feed/user/`
  endpoint 401'd. The `/reels/` URL endpoint succeeded with no auth, same workaround as
  `@simonhoiberg` (2026-05-24). Updating `scripts/scrape-reels.py` to default to `/reels/` instead
  of `/` would prevent this manual fallback in the future — flagging but not changing in this turn
  (out of scope for analysis-only work).
- Fallback handles (`@darwin.pacheco_motion`, `@darwinpachecomotion`, `@darwinpachecomg`) were not
  needed — first variant worked once the URL was switched.
- Per-post `metadata.json` had no view counts because gallery-dl's metadata fields differ from
  instaloader's; can't sort by virality. Caption + visual inspection only.
