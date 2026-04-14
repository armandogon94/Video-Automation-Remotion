# Project Structure — AI Video Factory

```
10-Video-Automation-Remotion/
├── CLAUDE.md                     # Primary context for Claude Code
├── README.md                     # GitHub-facing project README with Mermaid diagrams
├── PLAN.md                       # 5-phase implementation plan
├── AGENTS.md                     # 7 specialist agent role definitions
├── package.json                  # Node.js dependencies (Remotion, etc.)
├── pyproject.toml                # Python dependencies (edge-tts, faster-whisper)
├── package-lock.json             # Locked npm dependency tree
├── uv.lock                       # Locked Python dependency tree
├── tsconfig.json                 # TypeScript configuration (strict, ES2022, bundler)
├── remotion.config.ts            # Remotion CLI config (JPEG output, overwrite)
├── vitest.config.ts              # Vitest test configuration
├── Makefile                      # Dev commands (install, dev, build, render, test, clean)
├── docker-compose.dev.yml        # LOCAL dev only — optional Redis for future BullMQ
├── .gitignore                    # Excludes: node_modules, .venv, output/*, .env, dist
├── .env.example                  # Documented environment variables (no secrets)
├── .claude/                      # Local Claude Code memory (committed to git)
│   ├── memory.md                 # Persistent architectural decisions, gotchas, versions
│   ├── scratchpad.md             # Session handoff — current state, what's next, commands
│   ├── file-map.md               # Complete file inventory with purpose and status
│   ├── pipeline-architecture.md  # Pipeline flow diagrams and data transformations
│   ├── project-structure.md      # This file — detailed directory layout
│   ├── commands.md               # All development and deployment commands
│   ├── coding-conventions.md     # TypeScript, Python, and general conventions
│   └── constraints-gotchas.md    # Critical constraints, gotchas, common issues
├── src/
│   ├── index.ts                  # Remotion entry point → Root.tsx
│   ├── Root.tsx                  # Compositions registry
│   ├── compositions/             # Remotion React video templates
│   │   ├── index.ts              # Barrel exports
│   │   ├── schemas.ts            # All Zod prop schemas
│   │   ├── ExplainerVideo.tsx    # Gradient bg + animated title + captions (1920x1080)
│   │   ├── ExplainerVideoVertical.tsx # Same as above but 1080x1920 vertical
│   │   ├── TalkingHead.tsx       # Speaker image + overlay + name tag + captions
│   │   ├── Listicle.tsx          # Numbered items with slide-in animation
│   │   └── QuoteCard.tsx         # Animated quote mark + italic text + author
│   ├── components/               # Shared React components (used by all compositions)
│   │   ├── AnimatedText.tsx      # Spring-animated fade + translateY text
│   │   ├── Background.tsx        # Gradient background fill
│   │   └── Caption.tsx           # Word-by-word highlight captions (6-word window)
│   ├── pipeline/                 # Orchestration & CLI (TypeScript)
│   │   ├── generate.ts           # Commander.js CLI entry point (npm run generate)
│   │   ├── pipeline.ts           # Orchestrator: TTS → render → normalize → export
│   │   ├── voices.ts             # List Spanish voices (npm run voices)
│   │   ├── templates.ts          # List templates (npm run templates)
│   │   └── config.ts             # Pipeline configuration (composition mapping, etc.)
│   ├── tts/                      # Edge-TTS wrapper (Python)
│   │   └── generate.py           # TTS generation with sentence→word timing
│   ├── transcribe/               # faster-whisper wrapper (Python)
│   │   └── transcribe.py         # Audio transcription with word-level timestamps
│   └── ffmpeg/                   # FFmpeg command builders (TypeScript)
│       └── commands.ts           # resize, normalize, export, thumbnail, etc.
├── templates/                    # Video template JSON configs
│   ├── explainer.json            # Config for ExplainerVideo template
│   ├── talking-head.json         # Config for TalkingHead template
│   └── listicle.json             # Config for Listicle template
├── tests/                        # Test suites
│   ├── compositions/             # Vitest snapshot tests for compositions
│   └── python/                   # Pytest for TTS/transcription wrappers
├── output/                       # Generated videos (gitignored)
│   └── .gitkeep
├── public/                       # Static assets (used by Remotion staticFile())
│   ├── audio.mp3                 # Copied here during pipeline (Remotion constraint)
│   └── .gitkeep
└── dist/                         # Build output (gitignored)
```

## Key Directories

- **`.claude/`** — All persistent context, memory, and architectural decisions. Never write to global `~/.claude/`.
- **`src/compositions/`** — Remotion React templates. Each file is a self-contained video layout.
- **`src/pipeline/`** — TypeScript CLI and orchestrator. Coordinates TTS, rendering, normalization, export.
- **`src/tts/` & `src/transcribe/`** — Python wrappers. Edge-TTS for voiceover generation, faster-whisper for captions.
- **`src/ffmpeg/`** — FFmpeg command builders for audio normalization, video resizing, multi-platform export.
- **`templates/`** — JSON configuration files for each composition. Define titles, styling, durations.
- **`public/`** — Static assets. Audio file copied here during pipeline (Remotion's `staticFile()` constraint).
- **`output/`** — Generated videos directory (gitignored).
