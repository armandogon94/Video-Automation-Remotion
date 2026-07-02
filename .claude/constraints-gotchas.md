# Critical Constraints & Gotchas

## Local-Only Development

- **This project runs ONLY on macOS Apple Silicon (M1/M2/M3/M4)**
- **NOT deployed to any server** — the Hostinger VPS cannot handle video rendering (2 vCPU / 8GB RAM)
- **DO NOT** create: Traefik labels, VPS deployment configs, production Docker Compose, systemd services, Nginx configs
- `docker-compose.dev.yml` is for LOCAL development convenience only

## Memory Storage

- **ALL project memory goes in `.claude/` within THIS project directory**
- **NEVER** write to `~/.claude/` or any global location
- **START HERE in a new session:** Read `.claude/scratchpad.md` first for quick context

## Remotion-Specific Gotchas

- **`staticFile()` only works with relative paths in `public/`** — absolute paths fail. The pipeline copies audio to `public/audio.mp3` before rendering.
- **Folder names in Remotion must match `[a-zA-Z0-9-]`** — no spaces, parentheses, or colons. Use "Landscape-16x9" not "Landscape (16:9)".
- **No file extensions in source imports** — use `import { Root } from "./Root"` not `"./Root.tsx"`. Webpack bundler resolves `.tsx` automatically.
- **All Remotion packages MUST be exactly the same version** — use `--save-exact` for all installations. Use `npx remotion upgrade` to upgrade everything atomically.

## Edge-TTS (v7.2.8) Gotchas

- **Only emits SentenceBoundary** — v7.2.8 does NOT emit WordBoundary events. Word timing is approximated by evenly distributing words within sentence duration.
- **Each Communicate instance can only call `stream()` once** — create a new instance per request.

## Pipeline Gotchas

- **Audio file persistence** — `public/audio.mp3` persists between runs; this can cause unwanted reuse. It is git-tracked but overwritten by every run, so it churns the working tree. Consider cleaning up or generating unique filenames.
- **Whisper IS wired in (since 2026-05-15).** Word timing accuracy has two modes: with `--whisper` (default) the pipeline transcribes `audio.mp3` with faster-whisper and uses per-word timestamps (`src/pipeline/pipeline.ts` stage 1.5 → `src/transcribe/transcribe.py`); with `--no-whisper` it falls back to Edge-TTS's approximate word timings (sentence boundaries spread evenly — see the Edge-TTS gotcha above). Do NOT re-add "whisper is planned/not wired" — it is implemented.
- **Python output format** — Python scripts output JSON to stdout; TypeScript parses via `JSON.parse(result.stdout)`.
- **`public/` is copied into EVERY webpack bundle.** Remotion's `bundle()` copies the entire `public/` dir (it had grown to ~1.3 GB — `public/matte` + accumulated staged auto-edit clips). Keep it lean: mattes under `public/matte` are referenced by compositions via `staticFile()` and must stay; staged auto-edit intermediates under `public/autoedit/` must not accumulate.
- **Renders and scraping must not run concurrently.** A render fetches fonts from Google Fonts; if the network is saturated by a scrape the font fetch breaks and captions render wrong.

## FFmpeg Gotchas

- **ASS subtitle color format is BGR** — use `&HAABBGGRR` not RGB format (`&HAABBGGRR` where HH=alpha, RR=red reversed).
- **Seek positioning: `-ss` before vs. after `-i`** — use `-ss` BEFORE `-i` for keyframe-based seeking (faster); AFTER for exact seeking (slower).

## General Gotchas

- **This IS a git repo.** (An old note here claimed "no git repo yet — you may need to `git init`" — that was false and dangerous; do NOT `git init`.) The repo is on branch `main`; the overnight/liquid-glass/video-use work was fast-forward-merged into `main` on 2026-06-26 (recorded in `memory.md`). There is no unmerged feature branch to worry about.
- **Node 24 is required** (`node --version` → v24.14.0). The `.claude/tech-stack.md` table is the authoritative version list; if CLAUDE.md and tech-stack.md ever disagree, tech-stack.md is more likely current.
- **Worktree hygiene** — never leave a merged worktree lying under `.claude/worktrees/`. `vitest`, `tsc`, and glob-based tools will pick up its copied files (e.g. duplicate `*.test.ts`) and double-count or mis-report. Remove merged worktrees with `git worktree remove`.
- **Python virtual environment** — `uv` creates `.venv/` automatically; activate with `source .venv/bin/activate` for manual Python calls. If the project directory was moved, the `.venv` shebangs can point at the old path — rebuild with `rm -rf .venv && uv sync`.
- **`main.py` at project root** — unused stub from `uv init`; a delete candidate (VPS-era leftover, not part of the pipeline).
