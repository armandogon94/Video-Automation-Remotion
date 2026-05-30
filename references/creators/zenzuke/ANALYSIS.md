# @zenzuke — Carlos Albarrán (motion-design teacher, ES)

**Scraped:** 2026-05-25 · **Reels analyzed:** 15 · **Method:** gallery-dl `/reels/` endpoint (regular feed 401'd, same workaround as `simonhoiberg` / `builtbystephan`).

**Bio fit:** Spanish-language motion designer (Spain), runs Masterbrand's Motion Branding course, teaches via livestreams + interview cutdowns. Author of professional showreels (Logitech, Secforce/Woork). Niche match for **motion craft / educator** axis but NOT our **AI/tech news** axis — mine for *motion grammar*, not story templates.

## Distinct templates seen (5)

| # | Template | Reels | Layout | Motion grammar | Maps to ours? |
|---|---|---|---|---|---|
| 1 | **InterviewSplitscreen9x16** | DJY-TMCgQ8l, DJbjA2IvRdB, DJeH4Dfh5mC, DJgslLrMIix, DJjRbqQKgK0, DJl2NjGsp2E, DJoa-TLMieH (7/15) | Top guest face-cam / bottom host face-cam. Yellow karaoke caption on top frame. Green border + `PINTAMONGUERS` partner badge bottom edge | Static split, pure cut + word-sync caption | Covered by `SplitWebcamScreen9x16`. Steal partner-brand bottom badge |
| 2 | **WebcamTalkingHead9x16** | CbLlLkHF7pF, CbPZL2Glibr, Ch5O2avsRlp (3/15) | Single webcam center, bottom karaoke (2-line, white-on-black box OR plain white w/ shadow). Sometimes letterbox-blur top+bottom | Slow caption rhythm ~2s chunks, no jump cuts | Covered by `TalkingHead.tsx` + `EditorialCaption`. Skip |
| 3 | **PromoCourseCard9x16** | DXyYr79tKL4 (1/15) | Face-cam + corner brand logo + bottom-left stack: `BRAND MENTOR / CARLOS ALBARRÁN (ZENZUKE) / Master in Motion Designer / + INFO / Masterbrand.es/motion` | Stack holds, subtle scale-on-cap | New `SponsorCardOverlay9x16` sub-mode. Mid value — defer until we have product |
| 4 | **ShowreelLandscapeWithPromptCard9x16** | C4gF3qjNMDU, CZ_RqwNFGOI (2/15) | Pre-roll blue card "PLEASE ROTATE YOUR PHONE" w/ wireframe icon → 16:9 cinematic 2D anim letterboxed → end credit text bottom-right | Cinematic, 4–10s shots, eased camera moves | Out of scope (needs 2D animator) |
| 5 | **ProcessBreakdownTiers9x16** | CxsoCaatTU2, DR2UEO5CHqI (2/15) | Stacked horizontal tiers w/ pink labels (FINAL/LINES/BASIC SHAPES) OR character in 1:1 letterboxed pure-color square | Sequenced tier reveal synced to voice beat | Adjacent to `DiagramExplainer9x16` — informs layered-reveal mode if/when we build illustrative explainers |

## Honest sprint-priority call

**LOW.** 10/15 already covered by existing compositions; 1/15 (promo card) is ~½ day *when* we sell a course; 4/15 need a 2D animator.

**Transferable tactics (no new template needed):**
1. Optional `partnerBrandUrl` prop on `SplitWebcamScreen9x16` (~1h).
2. "Rotate your phone" 1s pre-roll card for 16:9→9:16 remixes (low cost).
3. Yellow karaoke caption variant w/ black stroke — already trivial via `Caption.tsx` color override.

## High/low value verdict

**LOW value.** zenzuke's reach is built on craft-level 2D animation (T4+T5, can't replicate) and a 7-part interview cutdown series (T1, already covered). T2 talking-heads are the floor of what we already ship. Do NOT prioritize re-scraping. Closest analogue: `motiondarwin`.
