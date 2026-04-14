# File Map — AI Video Factory

> Complete inventory of every project file with purpose and status.
> Use this to quickly understand the codebase in a new session.

---

## Project Root

| File | Purpose | Status |
|------|---------|--------|
| `CLAUDE.md` | Primary context for Claude Code — project overview, constraints, tech stack, conventions | Current |
| `README.md` | GitHub-facing README with Mermaid pipeline diagrams, voice table, full docs | Current |
| `PLAN.md` | Implementation plan with 5 phases, updated to remove VPS references | Current |
| `AGENTS.md` | 7 specialist agent role definitions (Architect, DevOps, Test, etc.) | Original |
| `PORT-MAP.md` | Port mapping reference (from original VPS plan, mostly irrelevant now) | Legacy |
| `VIDEO_PIPELINE_RESEARCH.md` | Original 54KB technical deep-dive (historical reference) | Legacy |
| `IMPLEMENTATION_QUICKSTART.md` | Original code examples (historical, superseded by actual code) | Legacy |
| `VPS_DEPLOYMENT_GUIDE.md` | VPS deployment guide (NOT applicable — local only) | Legacy |
| `package.json` | Node.js deps + npm scripts (generate, voices, templates, dev, test) | Current |
| `package-lock.json` | Locked dependency tree | Current |
| `pyproject.toml` | Python deps (edge-tts, faster-whisper, pytest) via uv | Current |
| `uv.lock` | Locked Python dependency tree | Current |
| `tsconfig.json` | TypeScript config (ES2022, bundler moduleResolution, strict) | Current |
| `remotion.config.ts` | Remotion CLI config (JPEG format, overwrite output) | Current |
| `Makefile` | Dev commands: install, dev, build, render, generate, test, lint, clean | Current |
| `docker-compose.dev.yml` | Local-only Redis (optional, for future BullMQ) | Current |
| `.gitignore` | Ignores node_modules, .venv, output/*, .env, dist, models | Current |
| `.env.example` | Documented env vars (ELEVENLABS_API_KEY, REMOTION_CONCURRENCY, etc.) | Current |
| `main.py` | **UNUSED** — stub created by `uv init`, can be deleted | Delete candidate |

---

## `.claude/` — Local Memory (Committed to Git)

| File | Purpose |
|------|---------|
| `memory.md` | Persistent architectural decisions, research findings, gotchas, session log |
| `scratchpad.md` | Session handoff notes — current state, what's done, what's next, known issues |
| `file-map.md` | This file — complete file inventory with purpose and status |

---

## `src/` — Source Code

### `src/compositions/` — Remotion Video Templates

| File | Purpose | Props Schema |
|------|---------|-------------|
| `schemas.ts` | All Zod schemas: explainer, talkingHead, listicle, quoteCard, wordTiming, captionStyle | — |
| `index.ts` | Barrel exports for all compositions and schemas | — |
| `ExplainerVideo.tsx` | Gradient bg + animated title + accent bar + caption overlay | `explainerSchema` |
| `TalkingHead.tsx` | Speaker image + gradient overlay + name tag + captions | `talkingHeadSchema` |
| `Listicle.tsx` | Numbered items with spring slide-in + per-item sequences | `listicleSchema` |
| `QuoteCard.tsx` | Animated quote mark + italic text + author + decorative line | `quoteCardSchema` |

### `src/components/` — Shared React Components

| File | Purpose |
|------|---------|
| `AnimatedText.tsx` | Spring-animated fade+translateY text (delay, fontSize, color, fontFamily props) |
| `Background.tsx` | GradientBackground component (from, to, direction props) |
| `Caption.tsx` | Word-by-word highlight captions — 6-word sliding window, active/past/future coloring |

### `src/pipeline/` — Pipeline Orchestration & CLI

| File | Purpose |
|------|---------|
| `pipeline.ts` | Main orchestrator: TTS → copy to public/ → bundle → render → normalize → export |
| `generate.ts` | Commander.js CLI entry point (`npm run generate`) |
| `voices.ts` | List 45 Spanish voices (`npm run voices`) |
| `templates.ts` | List available templates (`npm run templates`) |

### `src/tts/` — Text-to-Speech (Python)

| File | Purpose |
|------|---------|
| `generate.py` | Edge-TTS wrapper — `generate` subcommand outputs audio.mp3 + word_timings.json; `voices` subcommand lists Spanish voices. Word timings are approximate (sentence-level distributed). |

### `src/transcribe/` — Transcription (Python)

| File | Purpose |
|------|---------|
| `transcribe.py` | faster-whisper wrapper — outputs JSON to stdout with word-level timestamps. Supports `--output-srt`. **NOT yet wired into the pipeline.** |

### `src/ffmpeg/` — Video Post-Processing (TypeScript)

| File | Purpose |
|------|---------|
| `commands.ts` | FFmpeg command builders: `resize()` (pad/crop/blur), `normalizeAudio()`, `extractThumbnail()`, `exportMultiPlatform()` |

### `src/` — Remotion Entry

| File | Purpose |
|------|---------|
| `index.ts` | Remotion entry point — calls `registerRoot(RemotionRoot)` |
| `Root.tsx` | Registers all 5 compositions in folders: Landscape-16x9, Vertical-9x16 |

---

## `templates/` — Video Template Configs (JSON)

| File | Composition ID | Description |
|------|---------------|-------------|
| `explainer.json` | ExplainerVideo | Gradient bg, animated text, bottom captions |
| `talking-head.json` | TalkingHead | Speaker frame, word-by-word captions |
| `listicle.json` | Listicle | Numbered items with transitions |

---

## `public/` — Remotion Static Assets

| File | Purpose |
|------|---------|
| `audio.mp3` | Temporary — copied here by pipeline for Remotion's `staticFile()`. Overwritten each run. |

---

## `output/` — Generated Videos (Gitignored)

| File | Purpose |
|------|---------|
| `.gitkeep` | Keeps directory in git |
| `test-run/` | Last test output: audio.mp3, raw_video.mp4, normalized.mp4, *_youtube.mp4, *_thumbnail.jpg, word_timings.json |

---

## `tests/` — Test Suites (Empty)

| Directory | Purpose |
|-----------|---------|
| `tests/compositions/` | For vitest snapshot tests of Remotion compositions |
| `tests/python/` | For pytest tests of TTS and transcription wrappers |
