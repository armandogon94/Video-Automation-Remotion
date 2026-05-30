# @black.one.studio (Black.One.) — visual + motion analysis

> **Creator:** Black.One. — a streetwear / clothing micro-brand (hooded sweatshirts), NOT a motion-design studio as initially classified. Brand wordmark: `BLACK.ONE.` in a thin extended sans, all-caps, periods after each token. Handle is a typo-resistant `@black.one.studio` (the two fallbacks `@blackone.studio` and `@blackonestudio` both 404 on Instagram — see "Scrape failures" below).
> **Scraped:** 2026-05-25 via gallery-dl. **8 reels** retrieved (Instagram returned a `NotFoundError` after #8 on the `/posts/` endpoint and the same 8 on `/reels/`, suggesting that's the full publicly-paginated set for this account right now). Date range: 2026-01-22 → 2026-02-11. Durations: **all 5.0–7.0 s — micro-reels.** Aspect mix: 4 are 360×640 low-res 9:16 (older posts, ~30–35 KB MP4) and 3 are 720×1280 9:16 (newer posts, ~75–95 KB). One is the CapCut splash (see DUZyu-gEZBi).
> **Niche relevance:** **LOW for our @armandointeligencia AI/dev/education lane** — the brand is fashion product-hype, not tech content. **MEDIUM for visual reuse**: the editorial restraint (single light source, true black backdrop, one-line typographic tagline) is a transferable mood, but the design SUBSTANCE is "look at a hoodie" and we don't sell hoodies. **HIGH as a discipline reference**: this is a clinic in *what to leave out*.

The headline finding: Black.One.'s entire content strategy is **one micro-reel + one printed-on-shirt tagline**, shipped every 1–3 days. Every reel is either (a) a hooded model on a black backdrop or (b) a folded hoodie product still on a black surface, with a single white sans-serif word or two-word phrase appearing late in the clip. No captions track, no music chrome, no breadcrumb, no logo dingbat, no progress bar. The "design" is the production restraint plus the typography pairing on the garment itself.

---

## Templates observed

### Template A — HoodedFigureBlackBackdropTagline (4/8 reels, HIGHEST design value)
**Reels using it:** `DT1nIrLEcMA` (5 s, "Not many. / Just one."), `DUCPdU7gU4j` (5 s, "BLACK.ONE." wordmark), `DTy1UOFD732` (5 s, "BLACK.ONE. / Identity. Worn."), `DUmdeAWER0k` (5 s, "Presence.")

**Visual structure (9:16, 720×1280):**
- **Bg:** **pure / near-pure black** (`#000000` to `#0A0A0A`). No gradient, no vignette outside what the lighting naturally provides. Camera-original noise only — no post-grain layered on.
- **Subject:** young Black male model wearing a **black beanie + black hoodie** (the brand's hero garment), centered, mid-shot (chest to top-of-head), eyeline straight to camera.
- **Single hard side-key light** (left in most reels, right in `DT1nIrLEcMA`) sculpting the face and shoulders. **Negative space dominates** — model fills ~30–40% of the frame, the rest is true black.
- **Garment branding:** `BLACK.ONE.` printed across the chest of the hoodie in **thin extended white sans, all-caps, ~30 px high in the rendered frame**, centered.
- **Tagline overlay:** a **single short sentence** in **white thin extended sans (visually a Helvetica Neue Thin / Inter Light / SF Pro Display Thin)**, **lowercase + sentence case**, set ~middle-third of the frame, **~70 px** for the body taglines (`Presence.`, `Identity. Worn.`) and **~110 px bold** for the imperative (`Not many. / Just one.`). Always ends with a period — the period is part of the brand voice.

**Motion grammar:**
- Subject is **nearly still** (subtle natural head sway / breathing — not a fashion-shot strut). Held mid-shot with no zoom, no dolly, no pan. ~5 s of held-frame.
- Text **fades in late** (around t=2–4 s of a 5 s clip) on hold, no kinetic typography, no per-letter reveal, no animated underline. Pure crossfade or simple opacity ramp.
- Some reels end with the wordmark replacing the tagline (or vice versa) via a slow crossfade — no hard cut.

**Map to our Stream-E typology:** **partial overlap, mostly out-of-lane.** Closest existing slot is `EditorialQuote9x16` / `QuoteCard9x16` — both share the "single typographic line on a calm background" DNA. But:
- Our quote cards are **navy `#1B3A6E` with gold `#D4AF37` accent**, not black-on-black.
- Our quote cards have a **branded watermark + breadcrumb** in the corner; Black.One. has NEITHER, and the absence is intentional.
- Our quote cards center text in negative space, not over a portrait.

**Recommendation:** **Do NOT replicate as a new template.** The "model + tagline" composition is a fashion-brand convention that doesn't fit AI/dev content. **Borrow ONE specific tactic:** the **"late-arriving single-line tagline"** rhythm — let our `QuoteCard9x16` (and the proposed `TweetCardHero9x16`) hold a clean visual for 1.5–2 s before the text fades in, instead of presenting everything at t=0. That patience reads as confidence. ~5-line CSS-transition tweak, no new template needed.

---

### Template B — FoldedGarmentStillTagline (3/8 reels, MEDIUM design value)
**Reels using it:** `DT4UNmRjFK0` (5 s, "BLACK.ONE." wordmark only), `DT8iNtqErj4` (5 s, "Nothing extra."), `DUTmCQfAbPt` (5 s, "BLACK.ONE." wordmark only)

**Visual structure:**
- **Bg:** **black fabric surface** (looks like the same hoodie's material laid flat as a backdrop — soft, slightly textured weave catches the side light). Pure-black recede behind, creating depth without color.
- **Subject:** the folded hoodie (drawstrings visible top, `BLACK.ONE.` wordmark across the center fold), placed at ~30° angle in the upper-mid third of the frame. Single hard side-key light from upper-left, throwing the fold shadows toward bottom-right.
- **Tagline:** same thin extended white sans, lowercase + sentence case, ~70 px, positioned in the **lower third** below the garment.

**Motion grammar:**
- Slow ~1° rotation or no motion at all — sometimes a barely-perceptible zoom-in (a few percent over 5 s). The garment is the entire show.
- Text fades in around t=2–3 s, holds to end. No per-letter animation.

**Map to our Stream-E typology:** **not applicable.** We don't ship product-still reels — we ship explainer / quote / news-flash / split-screen. The pattern is brand-specific.

**Recommendation:** **Do NOT replicate.** This is a "we own a product photo" template, and our brand has nothing physical to photograph. The only takeaway is the **side-key lighting + true-black backdrop** as an option for any *thing we ever want to hero (a hardware/laptop B-roll, an open-book shot)* — not actionable for the current 15-template build.

---

### Template C — CapCutSplashOnly (1/8 reels, ZERO design value)
**Reel using it:** `DUZyu-gEZBi` (7 s)

**Visual structure:**
- Frame is **entirely the CapCut watermark splash** — black background with the white `CapCut` wordmark + bowtie logo centered. No brand content visible in any sampled keyframe.
- 8 keyframes extracted, ALL identical (the CapCut splash, ~no animation across the clip).

**Likely cause:** the creator exported a draft from the CapCut free tier without removing the auto-appended outro, OR uploaded a placeholder reel that was never replaced. Either way, **this is a publish error** — there is no design content to analyze.

**Recommendation:** **Skip.** Useful only as a real-world reminder: if our pipeline ever runs through a free editor that appends a watermark, we ship a published failure. Our pipeline uses FFmpeg directly so this risk is zero, but worth noting if we ever evaluate a hosted editor (CapCut, Riverside, etc.).

---

## Cross-template "house grammar"

| Pattern | Where it appears | Replicate for us? |
|---|---|---|
| **Pure black backdrop** | A, B | **Sometimes** — a darker accent variant alongside our navy/cream defaults. The Black.One. discipline is "true black so the garment edge disappears" — for us that would map to a `DarkMode` variant of `QuoteCard9x16` (charcoal `#0F1B2D` we already have in brand). |
| **Single hard side-key light** | A, B | **Yes for B-roll** — if we ever shoot a physical-prop hero (book, hardware), this lighting reads "premium / restrained" instantly. Out of scope for the 15-template build but a directing note. |
| **Thin extended white sans, all-caps wordmark / lowercase sentence-case taglines** | A, B | **No** — our brand pair is bold Inter + gold accent. Their type is too cold / fashion-coded for AI/dev. But the *single-period punctuation* (`Presence.`) is a copywriting move worth stealing for our quote cards: *"Modelos rotos.", "Promesa rota.", "Beta cerrada."* — declarative + period adds finality. |
| **Late-arriving text (text fades in around t=40–60% of clip duration)** | A, B | **Yes — high-priority.** This is the single most transferable mechanical tactic from Black.One. — see priority below. |
| **Micro-reels (5–7 s, never longer)** | A, B, C | **Maybe — A/B test.** Our reels run 15–45 s. A 5–7 s "tagline-only" format could work as a *brand interstitial* between our explainer drops (an "Armando says" beat). Worth ONE experiment, not a regular cadence. |
| **No watermark, no breadcrumb, no logo dingbat** | A, B | **Diverges from us** — we bake in the avatar-pixar watermark on every composition. Keep ours; the no-mark choice is a luxury-brand affordance Black.One. earns by having the wordmark on the garment itself. |
| **No captions track, no voiceover** | A, B, C | **Diverges from us** — captions are core to our format. Skip. |
| **Real product / model subject** (not motion graphics) | A, B | **N/A** — we don't have physical product to feature. |

---

## What we replicate (priority for our 15-template build)

| Priority | Black.One. pattern | Our template slot | Already specced? |
|---|---|---|---|
| 🟡 **3** | **Late-arriving single-line tagline** (hold visual 40–60% of clip duration, THEN fade text in) | Cross-cutting CSS-transition tweak on `QuoteCard9x16`, `TweetCardHero9x16`, `BigNumberHero9x16` | Partial — our compositions already support delays but default to t=0 reveals. ~5-line `delay` prop change per template. |
| 🟡 3 | **Declarative-with-period copy voice** (`Presence.` / `Nothing extra.` / `Identity. Worn.`) | Copywriting note for any quote / hero card | N/A — copy convention, not template change. Document in `brand/voice.md` next time it's edited. |
| ⚫ — | Hooded-model + tagline | — | Out of lane. We don't shoot people. |
| ⚫ — | Folded-garment still + tagline | — | Out of lane. We don't shoot product. |
| ⚫ — | Black-on-black true-black backdrop | — | Optional `darkMode` variant for `QuoteCard9x16` someday; not urgent. |
| ⚫ — | CapCut splash outro | — | Cautionary tale only. Do NOT replicate. |

**Sprint priority:** ⚫ — **no template changes warranted.** The only concrete asks are (a) document the "declarative + period" copywriting convention in the brand voice doc the next time it's touched, and (b) when implementing the proposed `TweetCardHero9x16` from `bilawal.ai`, ship it with a default 1.5 s text-reveal delay (Black.One.'s late-arriving tagline pattern) rather than t=0 reveal.

---

## Concrete next steps

1. **No new template proposed.** Black.One. is a creative-discipline reference, not a structure reference.
2. **When editing `brand/voice.md` next**, add a "Spanish single-word declarative" example set inspired by Black.One.: `Listo.` / `Aquí.` / `Otra vez.` / `Presente.` / `Suficiente.` — these are the cadence Armando uses on serious-tone reels and they now have a documented justification.
3. **When implementing `TweetCardHero9x16`** (specced in `bilawal.ai/ANALYSIS.md`), set the default text-reveal delay to **1500 ms** instead of t=0. Cite this analysis in the PR description so the rationale (Black.One.'s late-arriving-tagline patience reads as confidence) survives the merge.
4. **No re-scrape needed.** The 8-reel set captured the entire pattern repertoire; this brand is *deliberately* repetitive. A re-scrape in a quarter would just reconfirm the same 3 templates.

---

## Per-reel index

| Shortcode | Duration | Aspect | Resolution | Template | Date | Tagline |
|---|---|---|---|---|---|---|
| `DTy1UOFD732` | 5.0 s | 9:16 | 360×640 | A — HoodedFigure | 2026-01-22 | `BLACK.ONE.` + `Identity. Worn.` |
| `DT1nIrLEcMA` | 5.0 s | 9:16 | 360×638 | A — HoodedFigure | 2026-01-23 | `Not many. / Just one.` |
| `DT4UNmRjFK0` | 5.1 s | 9:16 | 360×640 | B — FoldedGarmentStill | 2026-01-24 | `BLACK.ONE.` (wordmark only) |
| `DT8iNtqErj4` | 5.1 s | 9:16 | 360×640 | B — FoldedGarmentStill | 2026-01-25 | `Nothing extra.` |
| `DUCPdU7gU4j` | 5.1 s | 9:16 | 720×1280 | A — HoodedFigure | 2026-01-28 | `BLACK.ONE.` (wordmark only) |
| `DUTmCQfAbPt` | 5.1 s | 9:16 | 720×1280 | B — FoldedGarmentStill | 2026-02-03 | `BLACK.ONE.` (wordmark only) |
| `DUZyu-gEZBi` | 7.0 s | 9:16 | 720×1280 | C — CapCutSplashOnly | 2026-02-06 | (publish error — CapCut splash only) |
| `DUmdeAWER0k` | 5.1 s | 9:16 | 720×1280 | A — HoodedFigure | 2026-02-11 | `Presence.` |

---

## Scrape failures

- `@blackone.studio` — **404 NotFoundError** via gallery-dl (Instagram's `/api/v1/users/web_profile_info/` returns no such user).
- `@blackonestudio` — **404 NotFoundError** via gallery-dl.
- `@black.one.studio` — **partial success.** The first 8 posts on the `/posts/` endpoint downloaded successfully (including 7 video reels + 1 .webp image post, `DTy0kHyD6b6`, which was discarded by the scraper as non-video and removed during restructure). On the 9th item Instagram returned `NotFoundError: Requested user could not be found`, which is most likely a **rate-limit masquerading as a 404** (gallery-dl re-resolves the profile mid-pagination and Instagram throttles the re-resolve). A retry on `https://www.instagram.com/black.one.studio/reels/` after a 30 s cooldown returned the **same 8 shortcodes** — same set, no overflow — suggesting the public reel-archive depth is genuinely 8 right now (the account may have hidden older posts) rather than a deeper history being gated.

## Sources for replication

- Frames per reel: `references/creators/black.one.studio/<shortcode>/frames/frame-NN-tXX.XXs.jpg`
- Original videos: `<shortcode>/video.mp4`
- Per-post metadata: `<shortcode>/metadata.json` (captions are nearly all empty — the design IS the brand)
- Account metadata: `references/creators/black.one.studio/info.json`

To re-scrape (after rate-limit cooldown): `python scripts/scrape-reels.py --handle black.one.studio --count 20 && python scripts/extract-keyframes.py --handle black.one.studio --frames 8`.
