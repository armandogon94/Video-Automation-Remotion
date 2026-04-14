# Project Memory — AI Video Factory

> Persistent notes, decisions, patterns, and preferences learned during development.
> Updated at the end of each significant work session.

---

## Project Status: WORKING END-TO-END

The full pipeline is operational as of 2026-04-02. A single CLI command generates a complete video:
```bash
npm run generate -- --script "Your text" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
```

**Performance benchmark:** 14.6s to generate an 11.5s video (1920x1080 H.264+AAC, 446KB) on Apple Silicon.

---

## Architectural Decisions

### [Architect] Local-Only Execution (2026-04-01)
- **Decision:** Run all video rendering locally on macOS Apple Silicon, not on the Hostinger VPS
- **Reason:** VPS has only 2 vCPU / 8GB RAM — insufficient for Remotion's Chrome Headless Shell + FFmpeg rendering
- **Impact:** No Traefik labels, no production Docker Compose, no systemd services. Docker is dev-only.

### [Architect] Pipeline Orchestration: TypeScript + tsx + execa (2026-04-01)
- **Decision:** Use TypeScript pipeline with `tsx` for execution and `execa` for subprocess management
- **Alternatives rejected:** BullMQ+Redis (overkill for single user), N8N (extra dependency), plain Node.js child_process (rough edges)
- **Reason:** Single developer, local tool, no concurrency needs. Sequential pipeline is simpler and debuggable.
- **CLI:** Commander.js for argument parsing (35M+ weekly downloads, first-class TypeScript)

### [Architect] Dual Runtime: Node.js + Python via uv (2026-04-01)
- **Decision:** Node.js for Remotion/pipeline/FFmpeg, Python for TTS/transcription
- **Reason:** Remotion is React-based (requires Node.js). Edge-TTS and faster-whisper are Python libraries.
- **Bridge:** TypeScript pipeline calls Python scripts via `execa`, passing args and reading stdout/files.
- **Note:** `edge-tts-universal` (pure Node.js) exists but Python `edge-tts` was used for reliability. Future opportunity to eliminate Python for TTS.

### [Architect] Edge-TTS over ElevenLabs (2026-04-01)
- **Decision:** Use Edge-TTS (free) as primary TTS engine
- **Reason:** Free unlimited usage, **45 Spanish neural voices** (22 locales), generates timing data for caption sync
- **Best voices:** es-MX-JorgeNeural (professional male), es-MX-DaliaNeural (warm female), es-CO-GonzaloNeural (clear neutral)
- **Fallback:** ElevenLabs API can be added later as premium option

### [Architect] faster-whisper "small" model (2026-04-01)
- **Decision:** Use faster-whisper with "small" model for transcription
- **Reason:** ~88% accuracy for Spanish, ~500MB RAM with int8, fast enough for batch processing
- **Alternative:** whisper.cpp has better Metal GPU acceleration but worse Python integration

---

## Installed Versions (Pinned)

| Package | Version | Notes |
|---------|---------|-------|
| Remotion (all packages) | 4.0.443 | `--save-exact`, all packages same version |
| React | 19.2.4 | Required by Remotion |
| Zod | 4.3.6 | v4, compatible with @remotion/zod-types |
| tsx | latest | TypeScript execution |
| execa | latest | ESM-only subprocess management |
| Commander.js | latest | CLI framework |
| vitest | latest | Test runner (dev dep) |
| TypeScript | latest | Dev dep |
| edge-tts | 7.2.8 | Python, via uv |
| faster-whisper | 1.2.1 | Python, via uv |
| pytest | 9.0.2 | Python dev dep |
| Node.js | 24.14.0 | System |
| Python | 3.14.0 | System |
| FFmpeg | 8.1 | Homebrew |
| uv | 0.11.3 | Python package manager |

---

## User Preferences

- Content language is primarily **Spanish** (Mexican Spanish es-MX preferred)
- User creates business/educational content for multiple platforms (YouTube, TikTok, Reels, Shorts)
- User prefers CLI-based tools over web UIs
- User uses `uv` for Python package management
- Project memory must stay LOCAL in `.claude/` (not global `~/.claude/`)
- User wants portable projects — copying the folder should bring all context

---

## Research Findings (2026-04-02)

### Remotion v4
- Current stable: **v4.0.443**
- v5.0 planned but NOT released yet — stay on v4
- **Free for individuals** and companies < $1M revenue
- Works natively on Apple Silicon — Chrome Headless Shell has ARM64 builds
- Key API: `bundle()` (call once, reuse), `selectComposition()` (preferred over `getCompositions()`), `renderMedia()`
- Zod schemas integrate natively for props validation in Remotion Studio
- `calculateMetadata()` can dynamically set duration from audio length
- `@remotion/captions` has `createTikTokStyleCaptions()` — native animated captions (NOT yet integrated)

### Edge-TTS (v7.2.8)
- 45 Spanish neural voices across 22 locales
- **v7.2.8 only emits SentenceBoundary, NOT WordBoundary** — word timings approximated by distributing words evenly within sentence duration
- Timestamps come as 100-nanosecond ticks — divide by 10,000,000 for seconds
- Audio output: 48kbps CBR MP3 at 24kHz (fixed, cannot change)
- `edge-tts-universal` package available for pure Node.js usage (zero deps) — not yet evaluated

### faster-whisper (v1.2.1)
- CPU-only on Apple Silicon (no Metal/MPS) via CTranslate2
- `compute_type="int8"` best for ARM64 (becomes int8_float32)
- `word_timestamps=True` gives accurate per-word timing via `segment.words`
- **IMPORTANT:** `segments` is a generator — must `list(segments)` before reprocessing
- Models cached in `~/.cache/huggingface/hub/`
- "small" model: ~500MB RAM with int8, ~88% accuracy for Spanish
- "medium" model: ~1.3GB RAM with int8, ~92% accuracy — also fits 8GB Mac
- Do NOT use `distil-*` variants for Spanish (English-only in practice)
- No FFmpeg system dependency needed — `av` (PyAV) bundles its own

### FFmpeg (v8.1)
- ASS format essential for karaoke-style word-by-word captions
- VideoToolbox (`h264_videotoolbox`) available on macOS for HW acceleration
- Two-pass loudnorm recommended for accurate normalization
- Blurred background fill looks best for landscape→vertical conversion
- `xfade` filter for crossfade transitions between segments
- `-movflags +faststart` for web playback optimization

---

## Gotchas & Lessons Learned

### Remotion-Specific
- **`staticFile()` does NOT accept absolute paths** — audio/assets must be copied to `public/` directory and referenced by filename only (e.g., `staticFile("audio.mp3")`)
- **Folder names must match `[a-zA-Z0-9-]`** — no spaces, parentheses, or colons. Use "Landscape-16x9" not "Landscape (16:9)"
- **Webpack bundler resolves `.tsx` extensions directly** — do NOT use `.js` extensions in source imports (use `"./Root"` not `"./Root.js"`)
- Chrome Headless Shell downloads automatically on first `render` (~90MB). Already downloaded and cached.
- All Remotion packages MUST be the exact same version — use `--save-exact` and `npx remotion upgrade`

### Edge-TTS
- **v7.2.8 only emits SentenceBoundary** — word-level timing from edge-tts is approximate (evenly distributed within sentence). For accurate word timing, use faster-whisper post-transcription.
- Each `Communicate` instance can only call `stream()` once — create a new instance per request

### Pipeline
- Audio files must be copied from output dir to `public/` before Remotion render (staticFile constraint)
- Pipeline runs sequentially: TTS (~2s) → Bundle+Render (~10s) → FFmpeg normalize (~1s) → FFmpeg export (~2s)
- Python scripts output JSON to stdout, TypeScript parses it via `JSON.parse(result.stdout)`

### FFmpeg
- `-ss` before `-i` seeks by keyframe (faster), after `-i` seeks exactly (slower)
- ASS subtitle colors use BGR format (`&HAABBGGRR`), not RGB

---

## Session Log

### Session 1 — 2026-04-01/02: Project Setup, Research & Full Implementation

**Research Phase:**
- Ran 5 parallel research agents: Remotion v4, Edge-TTS, faster-whisper, FFmpeg, pipeline orchestration
- Key discoveries: 45 Spanish voices (not 11), `edge-tts-universal` Node.js package, `@remotion/captions`, faster-whisper only ~500MB with int8

**Infrastructure:**
- Created CLAUDE.md (project context), README.md (GitHub-facing with Mermaid diagrams), PLAN.md (updated, VPS refs removed)
- Set up .claude/ local memory directory
- Created Makefile, docker-compose.dev.yml (local Redis only), .gitignore, .env.example
- Created template JSON configs: explainer.json, talking-head.json, listicle.json

**Node.js Setup:**
- `npm init` with `"type": "module"` (ESM)
- Installed: remotion@4.0.443 (all packages), react@19.2.4, zod@4.3.6, tsx, execa, commander
- Dev deps: typescript, vitest, @types/react, @types/react-dom, @remotion/eslint-config
- Created tsconfig.json (ES2022, bundler resolution, strict) and remotion.config.ts

**Python Setup:**
- `uv init` + `uv add edge-tts faster-whisper` + `uv add --dev pytest`
- Creates pyproject.toml, .venv/, uv.lock

**Remotion Compositions (5 total):**
1. `ExplainerVideo` — gradient bg, animated title, accent bar, caption overlay
2. `TalkingHead` — speaker image/placeholder, gradient overlay, name tag, captions
3. `Listicle` — numbered items with slide-in animation, per-item sequences
4. `QuoteCard` — animated quote mark, italic text, author attribution, decorative line
5. `ExplainerVideoVertical` — same as Explainer but 1080x1920

**Shared Components:**
- `AnimatedText` — spring-animated fade+slide text
- `GradientBackground` — configurable CSS gradient fill
- `Caption` — word-by-word highlight with active/past/future coloring, windowed display (6 words)

**Schemas (Zod):**
- `explainerSchema`, `talkingHeadSchema`, `listicleSchema`, `quoteCardSchema`
- Shared: `wordTimingSchema`, `captionStyleSchema`

**Python Wrappers:**
- `src/tts/generate.py` — Edge-TTS with sentence→word timing approximation, CLI with `generate` and `voices` subcommands
- `src/transcribe/transcribe.py` — faster-whisper with word timestamps, SRT output, CLI interface

**FFmpeg Commands:**
- `src/ffmpeg/commands.ts` — resize (pad/crop/blur), normalizeAudio (loudnorm), extractThumbnail, exportMultiPlatform

**Pipeline & CLI:**
- `src/pipeline/pipeline.ts` — orchestrator: TTS → copy audio to public/ → bundle → render → normalize → export
- `src/pipeline/generate.ts` — Commander.js CLI entry point
- `src/pipeline/voices.ts` — list 45 Spanish voices
- `src/pipeline/templates.ts` — list available templates

**End-to-End Test:**
- Successfully generated a complete video: 14.6s pipeline time, 11.5s video duration, 1920x1080, H.264+AAC, 446KB
- Output files: audio.mp3, raw_video.mp4, normalized.mp4, video_*_youtube.mp4, video_*_thumbnail.jpg, word_timings.json

**Bugs Fixed:**
1. Remotion Folder names with special chars → changed to `Landscape-16x9`, `Vertical-9x16`
2. `.js` import extensions in Webpack → removed all `.js` extensions from source imports
3. Remotion staticFile() absolute path error → copy audio to `public/` dir, reference by filename
4. Edge-TTS WordBoundary not emitted in v7.2.8 → approximate word timing from SentenceBoundary
