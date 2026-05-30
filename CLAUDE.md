# CLAUDE.md — AI Video Factory

> **This file is the primary context for Claude Code when working in this project.**
> **Bake-off note:** This project ships TWO rendering engines in parallel — see [BAKEOFF.md](BAKEOFF.md).
> **Port allocation:** See [PORTS.md](PORTS.md) before changing any docker-compose ports. All ports outside the assigned ranges are taken by other projects.

---

## Project Overview

**AI Video Factory** — An automated video production pipeline that transforms text scripts into fully rendered, multi-platform videos with AI-generated voiceover and auto-captions, branded as **Armando Inteligencia** (@armandointeligencia).

**Pipeline:** Script (text/JSON) → TTS (Edge-TTS) → **Render (Remotion OR Hyperframes)** → Transcription (faster-whisper) → FFmpeg Post-Processing → Multi-Platform Export

**Primary use case:** Generating Spanish-language business/educational video content for YouTube, TikTok, Instagram Reels, and YouTube Shorts.

**Two rendering engines run side-by-side (since 2026-05-15):**
- **Remotion 4.0.443** (React/TSX) — `src/` — the original engine, Node ≥20 OK
- **Hyperframes 0.6.7** (plain HTML + GSAP, Apache 2.0) — `hyperframes/` — the challenger, requires Node 24 (see `hyperframes/.nvmrc`)

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

## Video spec handoff

Sibling content agents — currently the Claude Code session running inside `17-Instagram-Slides` — drop video briefs into this pipeline by writing a self-contained `VIDEO_REQUEST.md` under THEIR own project. The canonical incoming-spec path that THIS project watches is:

```
/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/17-Instagram-Slides/video-requests/<YYYY-MM-DD-slug>/VIDEO_REQUEST.md
```

Each project owns its own files. The originator (`17-Instagram-Slides`) retains the canonical brief; this project (`10-Video-Automation-Remotion`) only READS from that path and WRITES all rendered artifacts (raw audio, faster-whisper transcripts, MP4s, comparison reports) under its own `output/<YYYY-MM-DD-slug>/`. There are no cross-project writes. The slug is dated (`YYYY-MM-DD`) and matches between the originator's spec folder and this project's output folder, so the two halves of the pipeline always pair by name. The reverse handoff is a `REPORT.md` written at `output/<slug>/REPORT.md` inside this project — the sibling agent is expected to read it at that absolute path; we do not push it back into `17-Instagram-Slides`. When picking up a new session, scan `17-Instagram-Slides/video-requests/` for any dated folder whose matching `output/<slug>/REPORT.md` is still missing — those are the open requests.

This convention was declared on 2026-05-18 alongside the first piece in the W21 content calendar (`2026-05-18-gemini-3-2-flash-leak`). The image-gen sibling-agent contract (image briefs ↔ image artifacts) uses the same pattern.

---

## Reference creators (visual + motion learning)

We study other creators' video work to inform our own template design. The canonical list lives at:

```
references/creators/CREATORS.md
```

Each creator has a folder `references/creators/<handle>/` containing:
- `info.json` — gallery-dl account-level metadata
- `<shortcode>/video.mp4` — the downloaded reel
- `<shortcode>/metadata.json` — per-post metadata (caption, view count, etc.)
- `<shortcode>/frames/frame-NN-tXX.XXs.jpg` — N evenly-spaced keyframes for visual analysis
- `ANALYSIS.md` — human/agent-written distillation: identified templates, color palette, motion patterns, hooks corpus, which patterns to replicate in our 15-template typology

### Workflow

```bash
# Add a new creator: edit references/creators/CREATORS.md, then:
npm run scrape:reels -- --handle <handle> --count 12

# Extract keyframes for analysis (8 frames per reel by default):
npm run analyze:creator -- --handle <handle>

# Then: open frames, write ANALYSIS.md, cross-reference with docs/research/E-15-template-typology.md
```

### Workflow notes
- Before scraping a creator: check `references/creators/<handle>/analyzed-videos.json` to skip already-analyzed videos (regen via `uv run python scripts/sync-analyzed-manifests.py`; convention at [docs/conventions/analyzed-videos-manifest.md](docs/conventions/analyzed-videos-manifest.md))
- Replicating motion graphics from other creators? → [docs/prompts/animation-replication-runbook.md](docs/prompts/animation-replication-runbook.md)

### Tooling note (May 2026)

Instagram rotates GraphQL `doc_id`s aggressively, breaking `instaloader.Profile.get_posts()` periodically. The sibling project's `17-Instagram-Slides/src/cli/scrape.ts` uses instaloader and inherits this fragility. **Our `scripts/scrape-reels.py` uses gallery-dl instead** — it's been more resilient (no auth needed for public profiles, no hardcoded doc_ids). If gallery-dl ever breaks too, fall back to yt-dlp with the `instagram:user` extractor (also intermittently broken — check `yt-dlp --list-extractors | grep instagram` for `(CURRENTLY BROKEN)` markers).

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

### Remotion side (Node ≥20)

```bash
npm install                                                                   # First time
npm run dev                                                                   # Remotion Studio
npm run build                                                                 # Bundle for rendering

# Generate a branded video (Whisper on by default for accurate captions)
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube,reels

# Skip Whisper for fast iteration (uses approximate TTS timings)
npm run generate -- --script "Tu texto" --no-whisper

# Discovery
npm run voices                                                                # List 45 Spanish voices
npm run templates                                                             # List templates
npx remotion compositions src/index.ts                                        # Sanity-check compositions
```

### Hyperframes side (Node 24 required — see `hyperframes/.nvmrc`)

```bash
nvm use 24
cd hyperframes
npm install                                                                   # First time
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
npm run preview                                                               # Hyperframes Studio
npm run lint                                                                  # Lint current index.html
```

Same flags as Remotion + template-specific extras (`--name-tag`, `--author`, `--items`, `--seconds-per-item`, `--title`). See [BAKEOFF.md](BAKEOFF.md) for the side-by-side workflow.

### Testing

```bash
npm test                                                                      # vitest
uv run pytest                                                                 # Python tests
```

### Python tools (shared between both engines, via uv)

```bash
uv run python src/tts/generate.py generate --text "Hola mundo" --voice "es-MX-JorgeNeural" --output-dir ./output
uv run python src/transcribe/transcribe.py --input ./output/audio.mp3 --model small --language es
ffmpeg -version
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
6. **Bake-off setup over engine choice** (2026-05-15) — Hyperframes 0.6.7 (Apache 2.0, plain HTML + GSAP) is installed alongside Remotion 4.0.443 so the same script can be rendered through both for direct visual comparison before committing to one. Engine winner is a post-bake-off decision.
7. **Armando Inteligencia brand baked in** (2026-05-15) — colors (`#1B3A6E` navy, `#D4AF37` gold, `#0F1B2D` deep navy), Inter font, avatar-pixar watermark applied across all 5 Remotion compositions and all 5 Hyperframes templates. Brand source: `brand/config.json` (copied from project 17 / Instagram Slides).
