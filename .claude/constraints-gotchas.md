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

- **Audio file persistence** — `public/audio.mp3` persists between runs; this can cause unwanted reuse. Consider cleaning up or generating unique filenames.
- **Word timing approximation** — TTS generates approximate word timings from sentence boundaries. For ACCURATE word timing, integrate faster-whisper transcription (currently NOT wired in).
- **Python output format** — Python scripts output JSON to stdout; TypeScript parses via `JSON.parse(result.stdout)`.

## FFmpeg Gotchas

- **ASS subtitle color format is BGR** — use `&HAABBGGRR` not RGB format (`&HAABBGGRR` where HH=alpha, RR=red reversed).
- **Seek positioning: `-ss` before vs. after `-i`** — use `-ss` BEFORE `-i` for keyframe-based seeking (faster); AFTER for exact seeking (slower).

## General Gotchas

- **No git repo yet** — the project has no `.git/` directory. You may need to `git init` and make initial commits.
- **Python virtual environment** — `uv` creates `.venv/` automatically; activate with `source .venv/bin/activate` for manual Python calls.
- **`main.py` at project root** — unused stub from `uv init`; can be deleted.
