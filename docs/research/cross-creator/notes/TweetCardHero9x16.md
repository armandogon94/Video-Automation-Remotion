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

## What differs (RESOLVED 2026-06-04 — DEEP QA pass 2)
- **PRIOR STATE:** the cross-creator render showed a timestamp ("May 18") + an engagement row (reply/RT/like = 142/980/4.5K). ANALYSIS.md Template A is unambiguous and repeats it three times: Bilawal deliberately shows **"No timestamp, no engagement counts, no reply chrome — just the avatar + name + body."** It is a *defining* trait of his editorial-restraint signature, not incidental. The reply chrome is a CHROME/structure axis difference (the axis this QA judges), not a copy difference — so the prior "leave it, content choice" rationale was too lenient for the bilawal pairing specifically.
- **ROOT CAUSE:** there was no props override for this comp, so the runner passed `{}` and Remotion fell back to `src/Root.tsx` `defaultProps`, which bake in `timestamp:"May 18"` + `replies/retweets/likes`. Root.tsx is out-of-scope to edit; the in-scope fix is the props override file.
- **FIX (in-scope, minimal, safe):** added `docs/research/cross-creator/props/TweetCardHero9x16.json` supplying a complete `tweet` object with ONLY `{name, handle, avatarUrl:"", body, verified:true}` — no `timestamp`, no `replies/retweets/likes`. Verified Remotion merges `inputProps` over `defaultProps` with a **shallow top-level spread** (`{...defaultProps, ...inputProps}`, `node_modules/remotion/dist/esm/index.mjs:671-675`), so the override's `tweet` object *replaces* Root's `tweet` wholesale → engagement/timestamp fields are genuinely absent → `hasEngagement` is false and `tweet.timestamp &&` is falsy → both hidden, and the card auto-shrinks to hug the body. Copy is unchanged (Spanish content preserved per the rules).
- This is surgical to the bilawal cross-creator render only. The generic template still exposes the full chrome via optional props; the `TweetCardHero9x16-DualPane` Studio composition and Root.tsx defaults are untouched, so the 5 other creators that DO want full tweet chrome are unaffected.
- Cross-creator render supplies no artifact image, so the middle/bottom is the dark fallback band — which actually reinforces the letterboxed-black look rather than detracting.

## Decision
**Score: 9/10 → IMPROVED to faithful.** The template already captured Bilawal's TweetCardOverlay signature (white card, top-quarter anchor, near-black letterboxed field, avatar/bold-name/muted-handle/blue-tick anatomy, static-card grammar, one-accent discipline). The single remaining gap — reply chrome + timestamp that Bilawal deliberately omits — is now removed via a props override, so the card reads as exactly "avatar + name + body." Re-rendered and confirmed (engagement row + "May 18" gone, card hugs body, no regression to breadcrumb/palette/typography).
