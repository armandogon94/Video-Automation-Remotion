# TweetCardHero9x16 ↔ bilawal.ai

**Creator:** bilawal.ai (Bilawal Sidhu) — also serves matthewberman / theaiadvantage / aiexplained / simonhoiberg / estebandiba.
**Reference video:** `references/creators/bilawal.ai/DVJTSypDSYA/frames/` (this particular reel is talking-head + CCTV/screen-record with yellow-highlight captions, NOT the tweet card). Signature pattern documented in `references/creators/bilawal.ai/ANALYSIS.md` → **Template A — TweetCardOverlay (dominant, 5/7 reels)**.

## Signature pattern (from ANALYSIS.md Template A)
- **Pure black `#000` bg, letterboxed** — artifact below does not fill frame; black bars top & bottom.
- **Tweet card in top third:** avatar circle + white-bold display name + muted-gray handle + **blue verified tick** inline; 3–6 lines of sentence-case white body. Card is the load-bearing identity anchor; "the tweet IS the headline."
- **Deliberately NO reply chrome:** ANALYSIS states "No timestamp, no engagement counts, no reply chrome — just the avatar + name + body. The 'tweet' is a typography device, not a real screenshot."
- Middle ~60% artifact (live dashboard / demo) carries all motion; tweet card is static the whole reel. Optional small face-cam corner inset.
- House grammar: one accent color per reel; pure-black-bg letterboxed.

## What matches (ours)
- **Palette discipline:** sampled bg = `(18,21,28)` ≈ near-black; hero zone `#0A0F1A`; card = pure `#FFFFFF`. Whole frame reads as one continuous letterboxed dark field — exactly Bilawal's "pure black, letterboxed." ✓
- **Card placement:** top ~25% (ANALYSIS layout literally specs "25% top tweet card"). ✓
- **Card anatomy:** avatar circle, bold display name, muted handle, blue verified tick sampled at `(26,154,241)` ≈ Twitter `#1D9BF0`. ✓
- **Typography hierarchy:** Inter bold name 30px / muted handle 24px / sentence-case body 46px wt-500. Matches "white bold sans name, muted gray handle, sentence-case body." ✓
- **Motion grammar:** card enters once (spring scale 0.95→1.0 + fade), then static — no typewriter, no re-type. Matches "written once, never re-typed." ✓
- **Brand substitution is correct:** our gold eyebrow `GOOGLE · FILTRACIÓN` + navy/gold accent replaces Bilawal's per-reel accent (gold/amber map trails). The "one accent per reel" discipline holds.

## What differs
- This render's *content* enabled the timestamp ("May 18") + engagement row (142/980/4.5K), which Bilawal deliberately omits. **This is a per-render content choice via optional props, not a template defect** — `tweet.timestamp` and `tweet.replies/retweets/likes` are all optional and the template correctly gates them (`hasEngagement` check, `tweet.timestamp &&`). The comp also serves 5 other creators (matthewberman, simonhoiberg, etc.) who DO show full tweet chrome, so keeping these optional-and-content-driven is the right generic-template call. Task instructions: differing content is correct; do not "fix" content to match the creator.
- Cross-creator render supplies no artifact image, so the middle/bottom is the dark fallback band — which actually reinforces the letterboxed-black look rather than detracting.

## Decision
**Score: 9/10 — VALIDATED.** The template faithfully captures Bilawal's TweetCardOverlay signature: white tweet card with full identity anatomy (avatar / bold name / muted handle / blue tick) anchored in the top quarter over a near-black letterboxed field, static-card-with-motion-delegated-elsewhere grammar, one-accent discipline. The reply-chrome present in this render is a per-content optional-prop choice the template correctly exposes, not a structural mismatch. Left untouched.
