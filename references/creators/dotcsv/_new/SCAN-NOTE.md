# dotcsv — new-content scan 2026-06-24

Last scrape: 2026-05-23 (newest had was DYmnLaBCb3x / 2026-05-21).

## Access notes
- gallery-dl feed listing (`/api/v1/feed/user/<id>/`) returned **401 Unauthorized** and direct
  post URLs redirected to the IG login page after a short anonymous window — IP got throttled.
- Fallback per CLAUDE.md ("if gallery-dl breaks, fall back to yt-dlp") worked: **yt-dlp** resolved
  and downloaded individual post URLs fine. Channel enumeration via yt-dlp's instagram:user
  extractor is broken ("Unable to extract data"), so only the single newest post could be discovered.

## New video captured
- **DZDFsQaCVa2** (2026-06-01) — "Introducing Opus 4.8" / Claude Opus 4.8 review. Downloaded low-res
  via yt-dlp, 13 keyframes extracted here, video deleted.

## Pattern classification — ALL ALREADY-HAVE
Split-screen talking-head (top graphics half / bottom presenter) with hard-cut karaoke caption.
Top half rotates through: branded opener (Anthropic pixel-art title), Claude Code **terminal block**,
settings/usage-panel **screen recordings**, code/terminal text. One agent-orchestration tree
(frame-016: parent "Grok 4 Heavy / PROCESSING" node + AGENT 1/2/3 child cards each with a progress
bar + "MIN LEFT") — reads as pipeline/flow-diagram + node-graph + animated-counter, all already in library.
**No new buildable template.**

## Not fully discovered
1-2 posts likely exist between 2026-05-21 and 2026-06-01 that could not be enumerated (feed blocked).
Re-scan from a non-throttled IP / authenticated gallery-dl to confirm.
