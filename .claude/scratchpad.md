# ☀️ OVERNIGHT RUN SUMMARY — 2026-06-25 (read this first)

Ran fully autonomous overnight (~01:10→04:00 EDT). Everything committed on branch
claude/recursing-tu-dac74b; tsc=0, 0 leaked render bundles, working tree clean.

## What got done
1. **Deep back-catalog scan (all 22 creators).** Enumerated EVERY video on each channel
   (thousands: midu 899, alexhormozi 4721 shorts, matthewberman 785, theaiadvantage 725,
   mreflow 715, bilawal 526, allin 479…) and deep-sampled ~150 previously-UNANALYZED
   back-catalog videos (frames in references/creators/<c>/_backcat/, videos deleted).
   Verdict: the existing library already covers ~everything → only **8 genuinely-new
   buildable patterns** surfaced.
2. **Built + registered 8 new templates** (now 55 cross-creator comps + 23 abhi):
   MatrixGridHeatmap9x16, DocumentHighlightSwipe16x9, PaintStrokeRibbonBanner16x9 (aiexplained),
   SpectrumSlider9x16 (abhishek), BeforeAfterSliderWipe9x16 + ModelNameChipComparison9x16
   (estebandiba), RingTopologyHopCounter9x16 + RotatingVectorDial9x16 (adamrosler).
3. **3 Codex (gpt-5.5, reasoning=high) review+fix cycles** — docs/codex-review/OVERNIGHT-ITER-{1,2,3}.md:
   - C1: fixed BeforeAfterSliderWipe label/handle collision + gallery blurb markdown cleanup.
   - C2: ModelNameChipComparison density (persistent model rail) + gallery "NEW" verdict for the 8 unscored comps.
   - C3: clean final pass (only NITs; all fixes hold).

## Review artifacts
- **CROSS-CREATOR-COMPARE.html** — 55 pairings (17 improved / 27 validated / 11 new). Open it.
- **ABHI-COMPARE.html** — 23 abhi templates.
- Codex reports: docs/codex-review/OVERNIGHT-ITER-{1,2,3}.md (+ earlier ITER-{1,2,3}.md).
- Per-comp notes: docs/research/cross-creator/notes/.

## Notes / open calls for you
- gpt-5.5-pro is blocked on the ChatGPT-account Codex; used gpt-5.5 at HIGH effort (strongest available).
- Footage/media-well comps (SplitWebcamScreen, TalkingHeadDynamic, ModelComparison2x2Grid,
  ModelNameChipComparison, BeforeAfterSliderWipe) intentionally render placeholder media wells —
  real footage/images composite at use time.
- Source material KEPT (back-catalog + _new + _fresh frames) for comparison until you sign off.

---

# Scratchpad — Session Handoff Notes

> These notes are for the NEXT Claude Code session to pick up where we left off.

---

## LATEST (2026-06-03): abhishek.devini replication COMPLETE — 23 templates, 5 cycles

Replicated Instagram creator **abhishek.devini**'s full motion-graphics vocabulary as a
Remotion template family. 18 reels scraped → 171 scenes → 23 distinct template types, all
built + frame-by-frame matched to source. **5 iteration cycles done; all 23 at 9–9.5/10.**

- Templates: `src/components/abhi/templates/*.tsx` (23) on shared `AbhiBackground.tsx`,
  mounted by `src/compositions/AbhiScene9x16.tsx` via `registry.ts`. Render config:
  `docs/research/abhishek/build-meta.json`. Driver: `src/autoedit/runAbhiTemplates.ts`
  (one key as argv, or all). Style spec + scene index: `docs/research/abhishek/`.
- Review here: **`ABHI-COMPARE.html`** (video head-to-head, all 23) + QA contact sheets
  `output/abhi-qa/abhi-qa-sheet-{1,2}.png` (`scripts/abhi-qa-contactsheet.py`).
- Source KEPT until user signs off: 18 reels `references/creators/abhishek.devini/*.mp4`,
  23 matched scene clips `output/abhi/source-scenes/*.mp4`. Replicas `output/abhi/*.mp4`.
- Full detail + gotchas: see `.claude/memory.md` (2026-06-03 abhi section). Key gotcha:
  Remotion headless renders `background-clip:text`+`color:transparent` as an OPAQUE box —
  use solid color for swept/hero text. Zod v4: never reflect `._def`/`.shape`.
- DEFERRED (user call): optional warm/intensify of shared dark-mode background glow.

---

## Current State: BAKE-OFF READY (2026-05-15)

The pipeline now runs through **two parallel engines** (Remotion + Hyperframes), both branded with Armando Inteligencia, both consuming the same Edge-TTS audio + faster-whisper word timings.

See `BAKEOFF.md` at the project root for the side-by-side run commands.

```bash
# Remotion side
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube

# Hyperframes side (requires Node 24 — see hyperframes/.nvmrc)
nvm use 24
cd hyperframes
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
```

---

## What landed in 2026-05-15 session

### Phase A — Remotion polish + rebrand
- **A.1 Parallel multi-platform export** — `src/ffmpeg/commands.ts:exportMultiPlatform` now uses `Promise.all` across platforms + thumbnail
- **A.2 Brand applied to all 5 compositions** — `src/brand/config.ts` is the typed source of truth (reads `brand/config.json`); colors/gradients/fonts updated in `schemas.ts`, `Root.tsx`, `pipeline.ts buildProps()`, all 3 template JSONs
- **A.3 BrandWatermark component** — `src/components/BrandWatermark.tsx` overlays a logo (default: avatar-pixar) in the chosen corner; wired into ExplainerVideo, TalkingHead, Listicle, QuoteCard, and the Vertical variant
- **A.4 faster-whisper wired into pipeline** — `pipeline.ts` runs whisper after TTS, replaces approximate word timings with accurate ones, falls back to TTS on failure. CLI flags: `--whisper` (default on), `--no-whisper`, `--whisper-model small`, `--language es`. Writes `output/word_timings_final.json` with `{source: "whisper" | "tts-approximate"}` for inspection.
- **A.5 Verified** — `npx tsc --noEmit` passes, `npx remotion compositions src/index.ts` lists all 5 compositions

### Phase B — Hyperframes parallel engine
- **Installed at `hyperframes/`** as a separate package with its own `package.json` / `node_modules` / `output/` (gitignored)
- **5 HTML templates** in `hyperframes/templates/`: explainer, talking-head, listicle, quote, vertical
- **All pass `hyperframes lint` with 0 errors, 0 warnings**
- **CLI wrapper** at `hyperframes/scripts/generate.ts` mirrors Remotion's flags exactly. Reuses `../src/ffmpeg/commands.ts` for normalize + multi-platform export so both engines share post-processing.
- **Shared brand assets** — `hyperframes/brand/` is a copy of root `brand/`. Logo files mirror at `hyperframes/brand/logos/avatar-pixar.png` etc.
- **Node 24 required** — `hyperframes/.nvmrc` pins it; Hyperframes' package needs >=22

### Phase 0 — Foundation
- **Brand config copied from project 17** into `brand/config.json` + `brand/logos/*.png` + `public/brand/logos/*.png`
- **Logos renamed** to kebab-case (the originals had spaces): `avatar-pixar.png`, `avatar-pixar-letras.png`, `logo-completo.png`, `logo-lentes.png`, `logo-letras.png`
- **`src/brand/` module** — typed wrapper around `brand/config.json`, also loads Inter via `@remotion/google-fonts`
- **`.gitignore` updated** to skip `hyperframes/node_modules/`, `hyperframes/output/`, etc.

---

## What's done across the project

- [x] All Phase 1-2 work from the original implementation
- [x] Armando Inteligencia branding on Remotion compositions
- [x] faster-whisper integration (the captions-quality fix)
- [x] Parallel multi-platform export
- [x] Hyperframes installed side-by-side with 5 templates and a wrapper CLI
- [x] BAKEOFF.md documents the side-by-side workflow
- [x] All Hyperframes templates pass `hyperframes lint` clean

## What's still on the backlog

### High priority — wait for the first real render
- [ ] **Bake-off with a real script** — user is writing their first Armando Inteligencia script in project 17 (Instagram Slides) and will hand it off when ready
- [ ] Render the same script through both engines and judge visually

### Medium priority
- [ ] Vertical variants for TalkingHead / Listicle / QuoteCard on the Remotion side (currently only `ExplainerVideoVertical` exists)
- [ ] Template-specific defaults (auto-detect listicle items, title extraction)
- [ ] Batch generation from a CSV/JSON of scripts
- [ ] Intro/outro concatenation with FFmpeg `xfade`
- [ ] Background music mixing
- [ ] Hyperframes templates: the 5 HTMLs duplicate caption styling; extract a shared partial

### Low priority
- [ ] vitest snapshot tests for Remotion compositions
- [ ] pytest for TTS + transcription wrappers
- [ ] Evaluate `edge-tts-universal` (pure Node — could drop Python TTS dep)
- [ ] ElevenLabs premium voice option
- [ ] Pre-existing: `tsconfig.json` uses deprecated `baseUrl` (TS 7 will remove — non-blocking)

---

## Known gotchas for next session

1. **Node 24 for Hyperframes** — `hyperframes/.nvmrc` pins it. Run `nvm use 24` before any `cd hyperframes && npm run ...` command. The Remotion side works on Node ≥20.
2. **Whisper first run downloads ~500MB** — the `small` model caches at `~/.cache/huggingface/hub/`. Subsequent runs are instant.
3. **Whisper output replaces TTS timings — fall back is automatic** — if whisper fails (model not yet downloaded, language mismatch), pipeline keeps approximate TTS timings and logs the fallback.
4. **Hyperframes `index.html` is per-run, gitignored** — the wrapper overwrites it each time the user generates a video. A committed placeholder version explains this to future-you.
5. **Hyperframes audio reference** — wrapper copies `output/audio.mp3` to `hyperframes/audio.mp3` (project root inside hyperframes/) so the `<audio src="audio.mp3">` in templates resolves.
6. **Two `output/` directories** — Remotion writes to root `output/`, Hyperframes to `hyperframes/output/`. Don't confuse them.
7. **Brand assets duplicated** — `brand/`, `public/brand/`, and `hyperframes/brand/`. If you update the brand config or swap a logo, update all three.

---

## Key files added/modified this session

### New
- `brand/config.json`, `brand/logos/*.png` (copied from project 17, renamed)
- `public/brand/logos/*.png` (for Remotion staticFile)
- `src/brand/config.ts`, `src/brand/index.ts`, `src/brand/fonts.ts`
- `src/components/BrandWatermark.tsx`
- `hyperframes/` — full sibling engine (package.json, hyperframes.json, meta.json, templates/, scripts/, brand/, .nvmrc, .gitignore)
- `BAKEOFF.md` — the side-by-side workflow doc
- `PROJECT_CONTEXT.html` — 15-slide presentation deck (kept for reference)
- `plans/superpowers/2026-05-15-paths-a-and-b-parallel.md`

### Modified
- `src/Root.tsx` — defaults use BRAND constants + watermark prop
- `src/compositions/schemas.ts` — defaults use BRAND, added `watermarkSchema`
- `src/compositions/{ExplainerVideo,TalkingHead,Listicle,QuoteCard}.tsx` — watermark prop wired
- `src/components/Caption.tsx` — gold left-border accent, rectangular pill
- `src/pipeline/pipeline.ts` — added Stage 1.5 Whisper + brand defaults in buildProps
- `src/pipeline/generate.ts` — added `--whisper` / `--no-whisper` / `--whisper-model` / `--language` flags
- `src/ffmpeg/commands.ts` — `exportMultiPlatform` now `Promise.all`
- `templates/{explainer,talking-head,listicle}.json` — brand colors
- `package.json` — added `@remotion/google-fonts@4.0.443` (exact)
- `.gitignore` — hyperframes/* artifacts

---

## Commands cheat sheet

```bash
# Remotion side
npm run generate -- --script "Texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
npm run generate -- --script "Texto" --no-whisper  # skip whisper (uses TTS approximate)
npm run dev                                         # Remotion Studio
npx remotion compositions src/index.ts              # list compositions
npm run voices                                      # list 45 Spanish voices
npm run templates                                   # list templates

# Hyperframes side
nvm use 24
cd hyperframes
npm run generate -- --script "Texto" --template explainer --platforms youtube
npm run preview                                     # Hyperframes Studio
npm run lint                                        # lint current index.html
```


---
## ▶ RESUME POINTER (updated 2026-07-02)
**All of the overnight / liquid-glass / video-use work IS merged to `main`** — the
`claude/recursing-tu-dac74b` branch was fast-forward-merged on 2026-06-26 (see `memory.md`).
There is NO unmerged branch and nothing to "decide about merging" — ignore the older pointer
below that said the work was unmerged.

Active plan: **`FABLE.md`** at the repo root is the current backlog (a deep technical + product
review + ordered fix plan, 2026-07-02). `.claude/NEXT-STEPS.md` holds the older creator-study
backlog. Start a new session by reading this scratchpad, then `FABLE.md`.

<details><summary>Historical pointer (2026-06-25, now stale — kept for the record)</summary>

Open backlog for next token window: `.claude/NEXT-STEPS.md`. All session work was on branch
`claude/recursing-tu-dac74b` (since merged). Say "continue with NEXT-STEPS #N" to resume.

</details>
