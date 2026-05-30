# @motiongraphicsweb — analysis

**Scraped:** 2026-05-25. **Reels:** 2 (both Oct 11–12 2022, 0–2 likes each). **Method:** gallery-dl `/reels/` workaround. Canonical handle after redirect: `@motiongraphicsweb` (id `47415230361`). Fallbacks `@motiongraphics_web` and `@motion.graphics.web` 404'd.

> **Honest read:** Effectively-abandoned account — a one-week 2022 experiment, not an active education channel. The "motion-design education" framing in the R6 candidate pool was misleading. Treat as completed scrape with NO sprint-priority work.

## Templates observed (2)

### Template A — AECoverPlusRawScreenrec (`CjoH5mFIEC2`)
- COVER: bright off-white background, 3D yellow Ctrl/Alt/Supr keycaps in isometric, condensed-sans headline ("Atajos esenciales en After Effects"), small yellow pill tag.
- BODY: raw unprocessed AE CC 2019 screen-recording, gentle Ken Burns zoom.
- RECAP: serif-glyph-list cardboard panel — `p - Posición / r - Rotación / s - Escala / a - Pto. ancla / t - Opacidad`. 5 lines of monospace+serif typography.

### Template B — SerifTitleCardPlusRawScreenrec (`Cjk4DUgoKD7`)
- COVER: pure-black background, white Playfair-flavoured serif headline ("Cómo crear texto animado") + rotating red accent square.
- BODY: same raw AE-screen-rec body, no Ken Burns.
- RECAP: none.

No shared design system between A + B — two unrelated cover styles built one week apart.

## Sprint priority

**SKIP — no new template warranted.** Two transferable tactics worth logging in the backlog:
1. **3D keycap hero plate** → add as `chromeStyle: "3d-keycaps"` variant inside `TechNewsFlash9x16` for CLI/shortcut content stories.
2. **Serif-glyph-list recap** (each line is `<symbol> - <meaning>`) → new `ShortcutListRecap` content-mode variant on `BigNumberHero9x16` or as a standalone `ShortcutList9x16` template (probably not worth a full template until we have a concrete script use case).

## High/low value verdict

**LOW.** Account abandoned, 2-reel sample is too small to derive a transferable house grammar from, and the closest fit (AE screen-recordings) is already covered by `SplitWebcamScreen9x16` + `TerminalCommand9x16`. Do not re-scrape.

## Per-reel index

| Shortcode | Duration | Template | Notes |
|---|---|---|---|
| `CjoH5mFIEC2` | ~40 s | A — AECoverPlusRawScreenrec | Topic: AE keyboard shortcuts. 3D keycap cover + serif recap |
| `Cjk4DUgoKD7` | ~25 s | B — SerifTitleCardPlusRawScreenrec | Topic: text animation. Black-cover variant, no recap |
