# CLAUDE.md — AI Video Factory

> **This file is the primary context for Claude Code when working in this project.**

---

## Project Overview

**AI Video Factory** — An automated video production pipeline that transforms text scripts into fully rendered, multi-platform videos with AI-generated voiceover and auto-captions.

**Pipeline:** Script (text/JSON) → TTS (Edge-TTS) → Remotion Render → Transcription (faster-whisper) → FFmpeg Post-Processing → Multi-Platform Export

**Primary use case:** Generating Spanish-language business/educational video content for YouTube, TikTok, Instagram Reels, and YouTube Shorts.

---

## CRITICAL CONSTRAINTS

### Local-Only Development
- **This project runs ONLY on macOS Apple Silicon (M1/M2/M3/M4)**
- **NOT deployed to any server** — the Hostinger VPS cannot handle video rendering (2 vCPU / 8GB RAM)
- **DO NOT** create: Traefik labels, VPS deployment configs, production Docker Compose, systemd services, Nginx configs
- `docker-compose.dev.yml` is for LOCAL development convenience only

### Memory Storage
- **ALL project memory goes in `.claude/` within THIS project directory**
- **NEVER** write to `~/.claude/` or any global location
- `.claude/memory.md` — persistent decisions, research findings, gotchas, session log
- `.claude/scratchpad.md` — session handoff notes (current state, what's done/next, known issues)
- `.claude/file-map.md` — complete file inventory with purpose and status
- `.claude/pipeline-architecture.md` — how the pipeline works internally (data flow, commands)
- **START HERE:** Read `.claude/scratchpad.md` first in a new session for quick context

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Video Rendering | Remotion | v4.0.443 | React-based, free for individuals (<$1M rev) |
| Captions | @remotion/captions | v4.x | TikTok-style word-by-word animated captions |
| TTS | Edge-TTS | v7.2.8 | Free, 45 Spanish neural voices, word timestamps |
| Transcription | faster-whisper | v1.2.1 | CTranslate2, "small" model, CPU int8 on ARM64 |
| Post-Processing | FFmpeg | 6.x+ | Installed via Homebrew, VideoToolbox HW accel |
| Runtime (JS) | Node.js | 22 LTS | For Remotion + pipeline orchestration |
| Runtime (Python) | Python 3.11+ | via uv | For transcription (faster-whisper) |
| Pipeline | tsx + execa | latest | TypeScript execution + subprocess management |
| CLI | Commander.js | latest | Command-line interface with subcommands |
| Package Manager (JS) | npm | latest | For Node.js dependencies |
| Package Manager (Python) | uv | latest | Fast Python package manager |
| Testing (JS) | vitest | latest | Remotion composition tests |
| Testing (Python) | pytest | latest | Transcription wrapper tests |

---

## Project Structure

```
10-Video-Automation-Remotion/
├── CLAUDE.md                    # This file — primary context
├── AGENTS.md                    # Specialist agent role definitions
├── PLAN.md                      # Implementation plan
├── README.md                    # GitHub-facing project README
├── package.json                 # Node.js dependencies (Remotion, etc.)
├── pyproject.toml               # Python dependencies (edge-tts, faster-whisper)
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest test configuration
├── docker-compose.dev.yml       # LOCAL dev only — optional containers
├── .gitignore                   # Git ignore rules
├── .claude/                     # Local Claude Code memory (committed to git)
│   ├── memory.md                # Persistent notes, decisions, patterns
│   └── scratchpad.md            # Temporary working notes
├── src/
│   ├── compositions/            # Remotion video templates
│   │   ├── index.ts             # Root composition exports
│   │   ├── ExplainerVideo.tsx   # Text-on-screen explainer template
│   │   ├── TalkingHead.tsx      # Talking head with captions
│   │   ├── Listicle.tsx         # Listicle with transitions
│   │   └── QuoteCard.tsx        # Animated quote card
│   ├── components/              # Shared React components for compositions
│   │   ├── AnimatedText.tsx
│   │   ├── Background.tsx
│   │   ├── Caption.tsx
│   │   └── ProgressBar.tsx
│   ├── pipeline/                # Orchestration scripts (TypeScript)
│   │   ├── generate.ts          # Main CLI entry point
│   │   ├── pipeline.ts          # Pipeline orchestrator
│   │   └── config.ts            # Pipeline configuration
│   ├── tts/                     # Edge-TTS wrapper (Python)
│   │   ├── generate.py          # TTS generation with word timestamps
│   │   └── voices.py            # Voice catalog and selection
│   ├── transcribe/              # faster-whisper wrapper (Python)
│   │   ├── transcribe.py        # Audio transcription
│   │   └── formats.py           # SRT/VTT/JSON output formatters
│   └── ffmpeg/                  # FFmpeg command builders (TypeScript)
│       ├── commands.ts          # FFmpeg command construction
│       ├── resize.ts            # Multi-platform resize
│       └── subtitles.ts         # Subtitle burning
├── templates/                   # Video template JSON configs
│   ├── explainer.json
│   ├── talking-head.json
│   └── listicle.json
├── tests/                       # Test suites
│   ├── compositions/            # Vitest snapshot tests
│   └── python/                  # Pytest for TTS/transcription
└── output/                      # Generated videos (gitignored)
    └── .gitkeep
```

---

## Commands

```bash
# Development
npm run dev                      # Start Remotion Studio (preview compositions)
npm run build                    # Bundle Remotion for rendering

# Video Generation (CLI)
npm run generate -- --script "Your text" --voice "es-MX-JorgeNeural" --template "explainer"
npm run generate -- --script-file ./scripts/my-script.json --template "listicle"

# Rendering
npm run render -- --comp ExplainerVideo --props ./data.json --out ./output/video.mp4

# Testing
npm test                         # Run all vitest tests
uv run pytest                    # Run Python tests

# Python tools (via uv)
uv run python src/tts/generate.py --text "Hola mundo" --voice "es-MX-JorgeNeural"
uv run python src/transcribe/transcribe.py --audio ./output/audio.mp3

# FFmpeg (called by pipeline, but can run standalone)
ffmpeg -version                  # Verify FFmpeg installation
```

---

## Coding Conventions

### TypeScript (Remotion + Pipeline)
- **Strict TypeScript** — `strict: true` in tsconfig
- **Functional components** — no class components in Remotion compositions
- **Zod schemas** for all input props validation
- **camelCase** for variables/functions, **PascalCase** for components/types
- **No `any` types** — use `unknown` + type narrowing
- **ESM imports** — use `import`/`export`, not `require`

### Python (TTS + Transcription)
- **Python 3.11+** with type hints on all functions
- **snake_case** for everything
- **uv** for dependency management (not pip directly)
- **Pydantic** for data validation where applicable
- **pathlib.Path** for file paths (not string concatenation)

### General
- **No secrets in code** — use `.env` files (gitignored)
- **Error messages must be actionable** — what happened + what to do
- **No unnecessary abstractions** — keep it simple for a single-developer tool
- **Spanish content** is the default language; English is secondary

---

## Agent Roles

See `AGENTS.md` for the 7 specialist roles. Key roles for this project:
- **Software Architect** — pipeline design, module boundaries
- **DevOps Engineer** — Docker dev setup, CLI design
- **Test Engineer** — vitest for compositions, pytest for Python
- **Code Reviewer** — quality checks before commits

---

## Key Decisions Log

Decisions are recorded in `.claude/memory.md`. Major decisions:
1. **Local-only** — VPS too weak for video rendering
2. **Edge-TTS over ElevenLabs** — free, good Spanish voices, sufficient quality
3. **faster-whisper over whisper.cpp** — better Python integration, word timestamps
4. **Simple TypeScript pipeline over BullMQ** — no need for Redis/queues for single-user local tool
5. **uv over pip** — faster, better dependency resolution
