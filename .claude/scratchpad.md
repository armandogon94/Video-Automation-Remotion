# Scratchpad — Session Handoff Notes

> These notes are for the NEXT Claude Code session to pick up where we left off.

---

## Current State: FULLY WORKING (2026-04-02)

The pipeline is **operational end-to-end**. You can generate videos right now:

```bash
cd "/Users/armandogonzalez/Documents/Claude/Deep Research Claude Code/10-Video-Automation-Remotion"
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
```

**Last successful test:** 14.6s to produce an 11.5s video at 1920x1080.

---

## What's Done (Phase 1-2 Complete)

- [x] npm + uv initialized with all dependencies
- [x] 5 Remotion compositions working (verified via `npx remotion compositions src/index.ts`)
- [x] Edge-TTS Python wrapper with sentence→word timing approximation
- [x] faster-whisper Python wrapper with word timestamps (NOT yet integrated into pipeline)
- [x] FFmpeg command builders (resize, normalize, thumbnail, multi-platform export)
- [x] Pipeline orchestrator (TTS → Render → FFmpeg → Export)
- [x] CLI with Commander.js (`npm run generate`, `npm run voices`, `npm run templates`)
- [x] End-to-end test passed

---

## What's NOT Done Yet (Phase 3-5)

### High Priority
- [ ] **Integrate faster-whisper into pipeline** — currently TTS generates approximate word timings by evenly distributing words within sentences. Adding a transcription step after TTS would give accurate word-level timestamps from the audio itself. This would make captions much more precise.
- [ ] **Multi-platform export in one run** — currently only generates one platform at a time. The `--platforms youtube,tiktok,reels` flag is parsed but should generate ALL formats in parallel.
- [ ] **Git init + first commit** — the repo has no git history yet
- [ ] **`npm run dev` (Remotion Studio)** — works but should be tested with real audio

### Medium Priority  
- [ ] **Better caption timing** — evaluate `@remotion/captions` with `createTikTokStyleCaptions()` for native Remotion captions (no FFmpeg subtitle burning needed)
- [ ] **Vertical video compositions** — ExplainerVideoVertical exists but TalkingHead/Listicle/QuoteCard don't have vertical variants
- [ ] **Template-specific defaults** — title extraction from script, auto-detect list items for Listicle
- [ ] **Batch generation** — process multiple scripts from a CSV/JSON file
- [ ] **Intro/outro concatenation** — FFmpeg xfade transitions between segments
- [ ] **Watermark overlay** — add logo/branding to videos

### Low Priority
- [ ] **Tests** — vitest snapshot tests for compositions, pytest for Python wrappers
- [ ] **`edge-tts-universal`** — evaluate Node.js TTS to potentially eliminate Python dependency
- [ ] **Background music mixing** — FFmpeg audio mixing
- [ ] **N8N webhook trigger** — external trigger for pipeline
- [ ] **ElevenLabs integration** — premium voice option
- [ ] **ASS subtitle burning** — for videos that need burned-in styled captions

---

## Key Files to Know

### Entry Points
- `src/pipeline/generate.ts` — CLI entry point (Commander.js)
- `src/pipeline/pipeline.ts` — Pipeline orchestrator (the "brain")
- `src/index.ts` → `src/Root.tsx` — Remotion entry point

### Compositions
- `src/compositions/schemas.ts` — All Zod schemas for props
- `src/compositions/ExplainerVideo.tsx` — Main template (gradient + text + captions)
- `src/compositions/TalkingHead.tsx` — Speaker with captions
- `src/compositions/Listicle.tsx` — Numbered list items
- `src/compositions/QuoteCard.tsx` — Animated quote

### Components
- `src/components/Caption.tsx` — Word-by-word highlight caption component (6-word window)
- `src/components/AnimatedText.tsx` — Spring-animated text
- `src/components/Background.tsx` — Gradient background

### Python
- `src/tts/generate.py` — Edge-TTS wrapper (generates audio.mp3 + word_timings.json)
- `src/transcribe/transcribe.py` — faster-whisper wrapper (NOT yet wired into pipeline)

### FFmpeg
- `src/ffmpeg/commands.ts` — resize, normalize, thumbnail, multi-platform export

### Config
- `package.json` — npm scripts, dependencies
- `pyproject.toml` — Python dependencies
- `tsconfig.json` — TypeScript config (ES2022, bundler, strict)
- `remotion.config.ts` — Remotion config (JPEG format, overwrite output)
- `templates/*.json` — Video template configurations

---

## Known Issues / Gotchas for Next Session

1. **Word timing is approximate** — Edge-TTS v7.2.8 only gives sentence boundaries. Words are evenly distributed within each sentence. Fix: integrate faster-whisper transcription step.

2. **Audio copied to public/** — The pipeline copies audio.mp3 to `public/` for Remotion's `staticFile()`. This file persists between runs and should be cleaned up or made unique per run.

3. **`main.py`** — uv created a `main.py` stub at project root during `uv init`. It's unused and can be deleted.

4. **No git repo** — The project has no `.git` directory yet. Should `git init` and make a first commit.

5. **Zod v4** — The project uses Zod v4.3.6 (not v3). `@remotion/zod-types@4.0.443` is compatible with Zod v4 since Remotion v4.0.426+.

6. **React 19** — Using React 19.2.4 which works with Remotion v4.0.443 but watch for compatibility if upgrading.

---

## Commands Reference

```bash
# Generate a video
npm run generate -- --script "Text" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube

# List 45 Spanish voices
npm run voices

# List templates
npm run templates

# Preview in Remotion Studio (visual editor)
npm run dev

# Verify compositions load
npx remotion compositions src/index.ts

# Run Python TTS directly
uv run python src/tts/generate.py generate --text "Hola" --voice "es-MX-JorgeNeural" --output-dir ./output

# Run Python transcription directly
uv run python src/transcribe/transcribe.py --input ./output/audio.mp3 --model small --language es
```
