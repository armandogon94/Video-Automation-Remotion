# Scratchpad — Session Handoff Notes

> These notes are for the NEXT Claude Code session to pick up where we left off.

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
