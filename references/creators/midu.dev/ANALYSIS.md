# @midu.dev — analysis

**Creator:** Miguel Ángel Durán ("midudev") — Spanish dev/AI GitHub Star, ~590K IG followers.
**Scraped:** 2026-05-23 via gallery-dl (12 most recent posts).
**Format:** Short-form Instagram reels (15–26 s). Snappy, talking-head-driven, with **one strong color callout per shot** as the recurring motif. Three distinct templates identified.

> **Honest read:** unlike carloscuamatzin/diysmartcode whose visual grammar is mostly *graphic*, midu's is mostly *face-on-camera* + a single color-emphasized word burned over the frame. The "Remotion-able" patterns are narrower than the research agent predicted — most of the editorial design lives in his **YouTube long-form** thumbnails, not in his IG reels. But the SelfieWordHighlight template (B below) is a near-perfect match to a pattern we already ship, so it validates our direction.

---

## Templates observed

### Template A — WebcamScreenshareCallout (split-stack with colored callout word)
**Reels using it:** `DYPnhQPiY4s` (VS Code "SVG" extension demo), `DYr1q_Zn1JN`.

**Visual structure:**
- Top half: webcam selfie of midu talking to camera. Studio is recognizable (purple LED + Funko shelf — branding via background, not graphics).
- Bottom half: full screen recording of his code editor / app being demoed.
- **Callout:** a single Spanish or English word in **massive yellow sans-serif** floats over the seam between webcam and screenshare (`SVG`, etc.). The callout names the tool/concept being shown.
- No watermark, no breadcrumb. Brand identity is the consistent studio background + the yellow accent.

**Motion grammar:**
- Webcam + screenshare are stacked from t=0 (no transition).
- Callout word fades in once the keyword is spoken (~600 ms ease-in). It stays for ~2–3 s then crossfades to the next callout.

**Map to our typology:** **Stream E #11 ScreenRecCallout** — already in the roadmap. The split-stack layout (webcam over screenshare) is a clear pattern we should add to our DiagramExplainer family, OR as a fresh `SplitWebcamScreen9x16` template. The callout-word-anchored-to-keyword pattern is exactly what our `anchorOverlays` helper does — direct reuse.

**Recommendation:** **build `SplitWebcamScreen9x16` template** as a follow-on to `DiagramExplainer9x16`. Layout is trivial (50/50 vertical split); the smart part is the keyword-anchored callout overlay, which we already have plumbing for.

### Template B — SelfieWordHighlight (selfie close-up with word-highlight caption)
**Reels using it:** `DYSYMBHDeeN` ("lo importante es" with "importante" yellow), `DYU1vm0DV1-`, `DYXg1B2FGxA`, `DYcXqp5ASea`, `DYhhOPbiHZO`, `DYj5imcE8ZL`.

**Visual structure:**
- Full-bleed selfie close-up (face fills 60–70% of frame). Same studio background.
- Caption: large bold sans-serif, 3–5 words per beat, bottom-third.
  - Inactive words: white.
  - Highlighted (currently-spoken) word: **bright yellow `#FFD400`**.
- Caption has no background plate — text sits directly over the face. Heavy text shadow for legibility.

**Motion grammar:**
- Caption changes word-by-word in sync with speech (word-highlight pattern, not page-flip).
- Camera is static the entire clip — only the caption animates.

**Map to our typology:** **near-identical to our existing EditorialCaption** (single-word active-color highlight + per-word reveal). Validates the pattern as a proven Spanish-language idiom. The differences are surface-level:
- Their highlight is yellow; ours is editorial warm-red on cream / warm-amber on dark — both valid.
- Theirs has no paper plate; ours has the option. Both work; ours is more "Bloomberg," theirs is more "creator vlog."

**Recommendation:** **already covered**. No new template needed. We could add a `paperPlate: false` variant of `TalkingHead9x16` for the bare-face look, but it's a 5-line prop tweak, not a new composition.

### Template C — MemeRepost with pill-style role labels
**Reels using it:** `DYZy-yoGpTu` ("Desarrollador" / "Claude Code" / "2 horas antes de la entrega" over a viral dog+cat-driving meme), `DYmrAevjY3E`, `DYpPmPTjQZk`.

**Visual structure:**
- Picture: a viral/found meme (animal video, cinematic clip, etc.) — not midu's own footage.
- Text labels: 1–3 **black pill-shaped chips** (`background-color: black; color: white; border-radius: 999px; padding: 6px 18px`) labeling characters or the time-context. Each label is a short word/phrase ("Desarrollador", "Claude Code").

**Motion grammar:**
- Labels pop in with a soft scale-up (~150 ms spring) on their respective beats.
- Picture itself is the meme video, not animated by midu.

**Map to our typology:** **not in our roadmap, but trivially addable.** Pill-label-over-found-footage is a powerful low-effort format for relatable dev/AI humor — it's how midu cross-pollinates between meme culture and his audience. Adding a `MemeWithRoleLabels9x16` composition would be ~80 lines (pill component + 1–3 timed positions).

**Recommendation:** **build later** as a "humor lane" template once the educational lane (TechNewsFlash + DiagramExplainer + QuoteCard + BigNumberHero) is complete. Useful for breaking up the feed with relatable dev jokes — same content category Carlos doesn't touch but DIYSmartCode flirts with in his "developer pain" hooks.

---

## Cross-template patterns ("midu house grammar")

| Pattern | Where it appears | Reuse for us? |
|---|---|---|
| Bright yellow `#FFD400` as the singular accent color | A, B (every caption highlight + every callout) | Already covered by our `tools-palette` system — if subject is Cursor (purple) or Anthropic (warm-orange) we tint accordingly. The lesson is **commit to ONE accent per video.** |
| Studio background as branding | A, B (purple LED + Funko shelf) | Doesn't apply — we render synthetic, not real studios. Our equivalent is the paper texture + breadcrumb. |
| No watermark, no logo | A, B, C | We DO want a small avatar watermark for brand recall. Difference of philosophy — midu is a personality brand (his face IS the watermark), Armando Inteligencia is a content brand. |
| One concept per reel, ≤30 s | All | Validates our "vertical reel = single message" assumption. Our long ones (>45 s) should be re-checked against this. |

---

## Concrete next steps from this analysis

1. **No new template needed urgently.** Template B is already covered.
2. **Sprint 2 candidate:** `SplitWebcamScreen9x16` (Template A) — captures the 50/50 webcam-over-screenrec layout. Useful for "I tested Tool X" reaction videos.
3. **Sprint 3 candidate:** `MemeWithRoleLabels9x16` (Template C) — humor lane.
4. **Color discipline reminder:** their entire reel feed uses one yellow accent. We should audit our recent renders and make sure we're picking ONE accent per video (palette default OR `subjectTool` override), not stacking accent + brand-gold + warm-red simultaneously.

---

## Per-reel index

| Shortcode | Duration | Template | Notes |
|---|---|---|---|
| DYPnhQPiY4s | 26 s | A (SplitWebcamScreen) | "Better SVG" VS Code extension launch |
| DYr1q_Zn1JN | 15 s | A (SplitWebcamScreen) | — |
| DYSYMBHDeeN | 26 s | B (SelfieWordHighlight) | "lo importante es..." |
| DYU1vm0DV1- | ~20 s | B (SelfieWordHighlight) | — |
| DYXg1B2FGxA | ~22 s | B (SelfieWordHighlight) | — |
| DYcXqp5ASea | ~20 s | B (SelfieWordHighlight) | — |
| DYhhOPbiHZO | 24 s | B (SelfieWordHighlight) | — |
| DYj5imcE8ZL | 26 s | B (SelfieWordHighlight) | — |
| DYZy-yoGpTu | ~18 s | C (MemeWithRoleLabels) | dog+cat driving meme — Desarrollador / Claude Code |
| DYmrAevjY3E | 15 s | C (MemeWithRoleLabels) | — |
| DYpPmPTjQZk | ~16 s | C (MemeWithRoleLabels) | — |
| DYe8akjDU1C | — (image) | — | static post (not a reel) |
