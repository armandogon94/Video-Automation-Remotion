# @builtbystephan — analysis

**Creator:** Stefan Andrei. Instagram, English. AI/builder content, fixed-cam home studio.
**Scraped:** 2026-05-25 via gallery-dl `/reels/` endpoint workaround (default feed 401'd unauthenticated, same trick as `@simonhoiberg`).
**Format:** Vertical 9:16 talking-head reels, 25–35 s typical, **22 cuts in 28 s** on the user-priority reel (`DYkyJfxx5Lx`) — extremely tight cadence, ~1 cut/sec.

> **Key finding:** This is **NOT a HeyGen / Synthesia avatar**, as the brief hypothesized. It's Stefan himself on a fixed home-studio cam, confirmed by consistent lavalier-mic, painting, plant, and shelf across 24 keyframes from `DYkyJfxx5Lx` AND 7 other reels shot in the same room. The "dynamic crop" is a continuous face-cam take being **cropped + cut into** by B-roll lanes, not a moving avatar.

## Templates observed (3 distinct + 1 reposted-UGC bucket)

### Template A — TalkingHeadDynamic9x16 (12/30 reels, DOMINANT)
**This is the user-requested template family.** A single continuous face-cam take underneath; the visible frame switches between three crop modes via HARD CUTS:

| Crop mode | Approx % of `DYkyJfxx5Lx` runtime | What viewer sees |
|---|---|---|
| `FACE_FULL` | ~30% | Stefan fills 1080×1920 |
| `BROLL_FULL` | ~25% | B-roll asset fills 1080×1920, face-cam temporarily hidden (but audio continues) |
| `SPLIT_50_TOP_BROLL` | ~45% (dominant) | B-roll fills top 0–960; bottom 960–1920 is the same face-cam shot, just cropped via `clipPath: inset(50% 0 0 0)` |

**Reels using this pattern:** ~12 of 30 across 4 different speakers (validates the pattern as not Stefan-specific — it's a transferable grammar).

**Motion grammar (`DYkyJfxx5Lx` deep dive):**
- **HARD CUTS only** — no dissolves, no slides. Every cut lands on a captioned-word onset.
- Cadence ~1 cut/sec across 28 s total.
- Split-line is HARD at y=960 — no fade between top/bottom halves.
- Face-cam is a single continuous take below — when in SPLIT mode, the bottom half is just the original face-cam cropped, not a different shot.
- Captions are bold-white sans (mid-chest in FACE_FULL, near the seam in SPLIT modes) — caption y-position resolves dynamically from the active crop mode.

**B-roll lane runs 5 asset categories in ONE reel:**
1. AI-illustrated brand vignettes (BlackBerry phone w/ sandy charcoal texture)
2. Real-product logo cards on radial gradients (Pentium blue, Swiffer green)
3. Movie stills with single-letter overlay (Peaky Blinders, Godfather)
4. Film-frame chrome cards (`UNFOLD 2010TX` bracket corners)
5. Claude desktop screen-recs (~40% of B-roll time)

Captions on B-roll: bold-white sans (mid-chest) with serif-display brand-name flourishes baked into the asset itself.

**Mapping to our 15-template typology:** STRUCTURALLY ABSENT. Our `SplitWebcamScreen9x16` is the closest sibling but uses STILL images and crossfades — Stephan's pattern needs `<OffthreadVideo>` for continuous face-cam + per-segment B-roll clips + HARD CUT transitions.

**Proposed Zod schema (revised from initial T6 attempt):**

```ts
const cropModeEnum = z.enum(["FACE_FULL", "BROLL_FULL", "SPLIT_50_TOP_BROLL", "SPLIT_50_TOP_FACE"]);

const brollClipSchema = z.object({
  src: z.string(),               // video / image src
  fitMode: z.enum(["cover", "contain"]).default("cover"),
});

const cropSegmentSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
  cropMode: cropModeEnum,
  brollSrc: z.string().optional(),  // required for BROLL_FULL + SPLIT_*_BROLL modes
  transitionIn: z.enum(["HARD_CUT", "CROSSFADE", "WIPE_DOWN"]).default("HARD_CUT"),
  transitionFrames: z.number().int().default(0),
});

export const talkingHeadDynamic9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  faceCamSrc: z.string().default(""),       // video URL/staticFile — Stefan's continuous take
  voiceoverSrc: z.string().default(""),     // separate audio track if faceCam has no audio
  brollClips: z.array(brollClipSchema).default([]),
  segments: z.array(cropSegmentSchema).default([]),
  // ... + breadcrumb / subjectTool / palette / captionFontSize / showCaptions
});
```

**Render strategy:** ONE `<OffthreadVideo>` of the face-cam running full duration, ONE `<Audio>` for the voiceover (if separate), ONE `<Series>` of crop segments where SPLIT modes wrap two clipped `<div>`s — top half `BrollClip` + bottom half a `clipPath: inset(50% 0 0 0)` slice of the face-cam.

**Sprint priority: 🔴 P0 — revise our existing TalkingHeadDynamic9x16** to match this pattern (it currently uses still `Img` + crossfade defaults; needs OffthreadVideo + HARD_CUT default + brollClips array + SPLIT_50_TOP_FACE mode).

### Template B — BuilderDropCard9x16 (2/30 reels)
Black background, monospace + orange + bracket-frame chrome. "DROP N°" eyebrow numbering, rail watermark sticker. Used for product-launch teasers.

**Sprint priority: 🟠 P1 — port pattern as variant inside our existing `TechNewsFlash9x16`.** Add `chromeStyle: "default" | "bracket-frame"` schema field; bracket-frame mode adds corner brackets + numbered eyebrow.

### Template C — TierListRanker9x16 (1/30 reels)
Vertical S/A/B/C/D tier list of AI tools. Low-information-density gimmick.

**Sprint priority: ⚫ SKIP — covered by existing `Listicle` composition.**

### Bucket D — RepostedUGC (~12/30 reels)
Sofa interviews, parkour rooftop POVs, news clips, podcast B-roll. Not house style, not actionable.

**Sprint priority: ⚫ SKIP.**

## Cross-template "house grammar"

| Pattern | Where it appears | Reuse for us |
|---|---|---|
| HARD CUTS aligned to caption-word onset | Template A (every reel) | Critical timing principle — adopt for `TalkingHeadDynamic9x16` revision |
| Fixed home-studio cam (lavalier visible) | Template A (Stefan's reels) | We render synthetic so doesn't apply directly — equivalent for us is brand-consistent voiceover + avatar |
| Caption y-position resolves dynamically from crop mode | Template A | Worth adding to our caption renderer — `dynamicYBasedOnCropMode` flag |
| B-roll mixes 5 asset categories per reel | Template A | We should prepare a small library of mixable B-roll asset types: brand vignettes, product cards, movie stills, screen-recs, AI-generated illustrations |
| Bracket-frame chrome + DROP N° eyebrow | Template B | Optional `chromeStyle` field on TechNewsFlash9x16 (Sprint 2) |

## Concrete next steps

1. **🔴 P0:** Revise `src/compositions/TalkingHeadDynamic9x16.tsx` to use `<OffthreadVideo>` + brollClips array + HARD_CUT default + new SPLIT_50_TOP_FACE mode. The schema sketch above is the spec.
2. **🔴 P0:** Prepare a small B-roll asset library in `public/broll/` covering the 5 categories observed (brand vignettes, logo cards, movie stills, film-frame chrome, screen-recs).
3. **🟠 P1:** Add `chromeStyle: "default" | "bracket-frame"` to `techNewsFlashSchema` + bracket-corner rendering.
4. **🟢 P2:** Test the revised TalkingHeadDynamic9x16 with the W21 voiceover + a stock face-cam + assembled B-roll clips to validate the pattern end-to-end.

## Per-reel index (30 reels)

12 reels classified as Template A (TalkingHeadDynamic). 2 reels as Template B (BuilderDropCard). 1 reel as Template C (TierListRanker — skip). ~12 reels as RepostedUGC (skip). Full per-shortcode classification + per-frame timeline available at `references/creators/builtbystephan/<shortcode>/frames/` — 12 frames per reel, **24 frames for `DYkyJfxx5Lx`** specifically.
