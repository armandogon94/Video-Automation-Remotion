# CLAUDE.md — AI Video Factory

> **This file is the primary context for Claude Code when working in this project.**
> **Rendering engine:** Remotion. The Remotion-vs-Hyperframes bake-off is **closed — Remotion won** (see [BAKEOFF.md](BAKEOFF.md)); `hyperframes/` is an archived reference only.
> **Port allocation:** See [PORTS.md](PORTS.md) before changing any docker-compose ports. All ports outside the assigned ranges are taken by other projects.

---

## Project Overview

**AI Video Factory** — An automated video production pipeline that transforms text scripts into fully rendered, multi-platform videos with AI-generated voiceover and auto-captions, branded as **Armando Inteligencia** (@armandointeligencia).

**Pipeline:** Script (text/JSON) → TTS (Edge-TTS) → **Render (Remotion)** → Transcription (faster-whisper) → FFmpeg Post-Processing → Multi-Platform Export

**Primary use case:** Generating Spanish-language business/educational video content for YouTube, TikTok, Instagram Reels, and YouTube Shorts.

**Rendering engine — Remotion 4.0.443** (React/TSX, `src/`). A second engine, **Hyperframes**
(plain HTML + GSAP), was installed as a bake-off challenger on 2026-05-15 but the bake-off is
now **closed in Remotion's favour** (see [BAKEOFF.md](BAKEOFF.md)). `hyperframes/` remains in
the tree as an archived reference — it has 2 commits, no installed `node_modules`, and is not
on the active development path.

---

## CRITICAL CONSTRAINTS

### Local-Only Development
- **This project runs ONLY on macOS Apple Silicon (M1/M2/M3/M4)**
- **NOT deployed to any server** — the Hostinger VPS cannot handle video rendering (2 vCPU / 8GB RAM)
- **DO NOT** create: Traefik labels, VPS deployment configs, production Docker Compose, systemd services, Nginx configs
- `docker-compose.dev.yml` is for LOCAL development convenience only
- **Ignore the VPS-era leftovers in the repo root.** `VPS_DEPLOYMENT_GUIDE.md`, root
  `PORT-MAP.md`, `IMPLEMENTATION_QUICKSTART.md`, `Dockerfile`, and `main.py` are stale
  April-2026 research artifacts that predate the local-only decision and **directly
  contradict it**. They are historical only — do NOT follow any deployment/systemd/MongoDB
  instructions in them, and do not treat them as the current design. (`PORTS.md` is the
  current port doc; it points at the canonical multi-project `../PORT-MAP.md` in the parent
  directory, which is a different file from this project's stale root `PORT-MAP.md`.)

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
| Post-Processing | FFmpeg | 8.x (Homebrew) | Resize, crop, loudnorm, watermark, subtitle burn (libx264) |
| Runtime (JS) | Node.js | 24.14.0 | For Remotion + pipeline orchestration (see `.claude/tech-stack.md`) |
| Runtime (Python) | Python 3.11+ | via uv | For transcription (faster-whisper) + TTS (edge-tts) |
| Pipeline | tsx + execa | latest | TypeScript execution + subprocess management |
| CLI | Commander.js | latest | Command-line interface with subcommands |
| Package Manager (JS) | npm | latest (lockfile committed) | For Node.js dependencies |
| Package Manager (Python) | uv | latest | Fast Python package manager |
| Testing (JS) | vitest | v4.1.2 | Autoedit logic tests (`src/**/*.test.ts`) |
| Validation | zod | v4.3.6 | Composition prop schemas |

---

## Project Structure

> Regenerated from the actual tree on **2026-07-02** (the previous tree was an April
> snapshot and had drifted badly — several files it listed never existed, and the entire
> autoedit subsystem plus 100+ compositions were missing). Counts below are real; verify
> with `ls -R src | head -200` if in doubt.

```
10-Video-Automation-Remotion/
├── CLAUDE.md                    # This file — primary context
├── AGENTS.md                    # Specialist agent role definitions
├── BAKEOFF.md                   # Remotion-vs-Hyperframes bake-off — DECIDED (Remotion; see file)
├── PORTS.md                     # Port allocation (local-only; canonical map is ../PORT-MAP.md)
├── PLAN.md                      # Original implementation plan (historical)
├── README.md                    # GitHub-facing project README
├── package.json                 # Node deps + npm scripts (generate, autoedit, voices, …)
├── pyproject.toml               # Python deps (edge-tts, faster-whisper) via uv
├── tsconfig.json                # TypeScript configuration (strict)
├── remotion.config.ts           # Remotion CLI config
├── docker-compose.dev.yml       # LOCAL dev only — optional containers (rarely used)
├── .env.example                 # Placeholder only — the code reads NO project env vars (see file)
├── .gitignore                   # Git ignore rules (output/, node_modules/, scraped media, …)
├── .claude/                     # Local Claude Code memory (committed to git) — 12 md files
│   ├── scratchpad.md            # Session handoff — START HERE in a new session
│   ├── memory.md                # Persistent decisions, gotchas, dated session log
│   ├── NEXT-STEPS.md            # Resume backlog
│   ├── constraints-gotchas.md   # Live gotchas (Remotion/TTS/FFmpeg)
│   ├── tech-stack.md            # Authoritative versions (Node 24, etc.)
│   ├── arch-decisions.md        # ADR index (full ADRs live under docs/research/)
│   ├── file-map.md              # File inventory
│   ├── pipeline-architecture.md # Data flow + stages
│   ├── project-structure.md     # Structural notes
│   ├── coding-conventions.md · commands.md · OVERNIGHT-PLAN.md (archived run)
├── src/
│   ├── Root.tsx                 # Remotion root — registers all 130 compositions (~4k lines)
│   ├── index.ts                 # registerRoot(Root) entrypoint for the bundler
│   ├── compositions/            # 119 .tsx composition files (9:16 + 16:9 variants of most)
│   │   ├── ExplainerVideo.tsx · TalkingHead.tsx · Listicle.tsx · QuoteCard.tsx  # originals
│   │   ├── <Name>9x16.tsx / <Name>16x9.tsx  # ~73 vertical + ~37 landscape templates
│   │   ├── scenes/              # SpeakerOverlayScene + scene building blocks
│   │   ├── schemas.ts           # Shared prop/word-timing type (WordTiming)
│   │   └── index.ts             # Stale barrel — exports only the 4 originals, no consumers
│   ├── components/              # 118 files — shared React components + subfamilies:
│   │   ├── abhi/                # 25 files — abhi-shreyas creator-replica atoms
│   │   ├── overlays/            # 29 files — auto-edit overlay molecules + registry
│   │   ├── liquidglass/         # 7 files — iOS-glass atom family (tokens + atoms)
│   │   ├── captions/ · layout/ · chrome/ · chassis/ · primitives/
│   │   ├── AppConnect/ · HUDChrome/ · MacWindow/
│   │   ├── Caption.tsx · FloatingCaption.tsx · BrandWatermark*.tsx · …  # top-level components
│   ├── autoedit/                # 28 files — silence-trim → EDL → render subsystem (see below)
│   │   ├── cli.ts               # `npm run autoedit` entry
│   │   ├── silenceTrim.ts · buildEditPlan.ts · editPlan.ts   # EDL model (two-timeline)
│   │   ├── renderFromPlan.ts    # single-source + multi-source render drivers
│   │   ├── suggestOverlays.ts · packTranscript.ts · selfEvalRender.ts · bundleOnce.ts
│   │   └── run*.ts              # standalone QA/demo render drivers
│   ├── brand/                   # brands.ts · config.ts · palettes.ts · fonts.ts · index.ts
│   ├── timing/                  # align.ts (script↔whisper alignment) · easing.ts
│   ├── animation/               # 9 files — countUp, pathDraw, smartZoom, staggeredCascade, …
│   ├── matting/                 # RVM background-matte tooling (Python) — rvm_matte.py + luts/
│   ├── pipeline/                # Orchestration (TypeScript)
│   │   ├── generate.ts          # Main CLI entry point (`npm run generate`)
│   │   ├── pipeline.ts          # Pipeline orchestrator (TTS → render → whisper → export)
│   │   ├── templates.ts         # `npm run templates` (reads templates/*.json — display only)
│   │   └── voices.ts            # `npm run voices` (45 Spanish voice catalog)
│   ├── tts/generate.py          # Edge-TTS wrapper — audio + word timings
│   ├── transcribe/transcribe.py # faster-whisper wrapper — audio → words (JSON to stdout)
│   └── ffmpeg/commands.ts       # ALL FFmpeg command builders (resize, crop, loudnorm, export)
├── templates/                   # 9 template JSON configs — DISPLAY-ONLY (real defaults live
│   │                            #   in src/pipeline/pipeline.ts buildProps())
│   ├── explainer.json · talking-head.json · listicle.json · quote-card*.json
│   └── big-number-hero.json · diagram-explainer.json · tech-news-flash.json · split-webcam-screen.json
├── scripts/                     # 35 scripts — scraping (gallery-dl), keyframe extraction,
│   │                            #   gallery builders, one-off render drivers, LUT gen
├── docs/                        # research (ADRs, creator studies, video-use), codex-review, …
├── references/                  # creators/<handle>/ — scraped reels + frames + ANALYSIS.md
├── brand/                       # brand config + logos (source of truth, copied from project 17)
├── hyperframes/                 # ARCHIVED challenger engine — bake-off closed, see BAKEOFF.md
├── *.html                       # 12 root gallery/compare pages (INDEX.html is the entry point)
└── output/                      # Generated videos + comparison reports (gitignored)
```

### Compositions & families at a glance
- **130 registered compositions** in `src/Root.tsx` (most templates ship a `9x16` and a `16x9`
  variant — ~73 vertical, ~37 landscape files).
- **Creator-replica families:** `abhi/` (abhi-shreyas), a large cross-creator set (studied from
  the reference creators), and the **liquid-glass atom family** (`src/components/liquidglass/`,
  shipped 2026-06-26 from the austin.marchese / nateherk study).
- **Auto-edit subsystem (`src/autoedit/`):** takes a source video → detects silences →
  builds a two-timeline EDL (`editPlan.ts`) → renders the trimmed/graded/caption-overlaid
  result through Remotion. Reached via `npm run autoedit`. This is the largest subsystem and
  was entirely absent from the old tree.

---

## Commands

### Rendering (Remotion — Node 24, `node --version` → v24.14.0)

```bash
npm install                                                                   # First time
npm run dev                                                                   # Remotion Studio
npm run build                                                                 # Bundle for rendering

# Generate a branded video (Whisper on by default for accurate captions)
npm run generate -- --script "Tu texto" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube,reels

# Skip Whisper for fast iteration (uses approximate TTS timings)
npm run generate -- --script "Tu texto" --no-whisper

# Auto-edit an existing video (silence-trim → EDL → caption/overlay render)
npm run autoedit -- --help                                                    # see src/autoedit/cli.ts

# Discovery
npm run voices                                                                # List 45 Spanish voices
npm run templates                                                             # List templates
npx remotion compositions src/index.ts                                        # Sanity-check the 130 compositions

# Housekeeping
npm run clean:bundles                                                         # Remove leaked webpack bundle dirs
```

> **Note:** there is no working `npm run render` script — the `package.json` `render` entry
> points at `src/pipeline/render.ts`, which does not exist. Use `npm run generate` for the
> full pipeline, or `npx remotion render src/index.ts <CompId> <out.mp4>` for a single comp.

### Bake-off status — CLOSED (Remotion wins)

The Remotion-vs-Hyperframes bake-off was **decided in favour of Remotion** — all feature
investment (130 compositions, the auto-edit subsystem, the creator-replica and liquid-glass
families) went to the Remotion side, and the branded template library is now the product's
moat. `hyperframes/` is retained only as an archived reference (2 commits, no installed
`node_modules`, not on the active path). See [BAKEOFF.md](BAKEOFF.md) for the full verdict and
rationale. Do not build new features against Hyperframes.

### Testing

```bash
npm test                                                                      # vitest (autoedit logic tests, src/**/*.test.ts)
```

> **Reality check:** the JS tests live under `src/autoedit/*.test.ts` and cover the pure
> auto-edit logic (silence-trim parsing, EDL math, overlay classifiers, packTranscript).
> There is currently **no `tests/` directory, no `vitest.config.ts`, and no Python test
> suite** — earlier docs claimed a pytest suite that does not exist. `uv run pytest` collects
> zero tests today.

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
- **DevOps Engineer** — local dev setup, CLI design
- **Test Engineer** — vitest for the auto-edit logic (`src/**/*.test.ts`)
- **Code Reviewer** — quality checks before commits

---

## Key Decisions Log

Decisions are recorded in `.claude/memory.md`. Major decisions:
1. **Local-only** — VPS too weak for video rendering
2. **Edge-TTS over ElevenLabs** — free, good Spanish voices, sufficient quality
3. **faster-whisper over whisper.cpp** — better Python integration, word timestamps
4. **Simple TypeScript pipeline over BullMQ** — no need for Redis/queues for single-user local tool
5. **uv over pip** — faster, better dependency resolution
6. **Bake-off CLOSED — Remotion wins** (set up 2026-05-15; decided by revealed preference,
   recorded 2026-07-02) — Hyperframes 0.6.7 (Apache 2.0, plain HTML + GSAP) was installed
   alongside Remotion 4.0.443 as a challenger. Since then, 100% of feature work went to
   Remotion (130 compositions, the auto-edit subsystem, creator-replica + liquid-glass
   families) while Hyperframes received 2 commits and was never wired into production. The
   branded Remotion template library is the product's moat; re-platforming to HTML+GSAP is not
   a real option. Verdict and rationale: [BAKEOFF.md](BAKEOFF.md).
7. **Armando Inteligencia brand baked in** (2026-05-15) — colors (`#1B3A6E` navy, `#D4AF37`
   gold, `#0F1B2D` deep navy, `#FAF7F2` cream), Inter font, avatar-pixar watermark. Brand is
   applied across the Remotion composition library (now 130 compositions) via `src/brand/`
   (source of truth; 104 of 114 composition files import from it). Brand config originates
   from `brand/config.json` (copied from project 17 / Instagram Slides).
