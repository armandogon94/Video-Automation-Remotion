# Tech Stack (Pinned Versions)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Video Rendering | Remotion (all packages) | v4.0.443 (--save-exact) | React-based, free for individuals (<$1M rev) |
| Captions | @remotion/captions | v4.0.443 | TikTok-style word-by-word animated captions (integrated in pipeline) |
| UI/React | React | v19.2.4 | Required by Remotion, strict TypeScript |
| Schema Validation | Zod | v4.3.6 | Validated input props for all compositions |
| TTS | Edge-TTS | v7.2.8 (Python) | Free, 45 Spanish neural voices, sentence-level word timestamps |
| Transcription | faster-whisper | v1.2.1 (Python) | CTranslate2, "small" model, CPU int8 on ARM64, word-level timestamps |
| Post-Processing | FFmpeg | v8.1 (Homebrew) | Normalize audio, resize/crop, export multi-platform, burn subtitles |
| Runtime (JS) | Node.js | 24.14.0 | For Remotion + pipeline orchestration |
| Runtime (Python) | Python | 3.14.0 | For TTS and transcription via uv |
| Pipeline Exec | tsx | latest | TypeScript execution engine |
| Subprocess Mgmt | execa | latest | ESM-only subprocess management |
| CLI Framework | Commander.js | latest | Command-line interface with subcommands |
| Package Manager (JS) | npm | latest (with lock) | For Node.js dependencies |
| Package Manager (Python) | uv | v0.11.3 | Fast Python package manager with lock |
| Testing (JS) | vitest | latest | Remotion composition snapshot tests |
| Testing (Python) | pytest | v9.0.2 | TTS/transcription wrapper tests |
| TypeScript | TypeScript | latest | Dev dep, strict mode enabled |

**Key:** All Remotion packages pinned to v4.0.443 exactly (`--save-exact`). Do NOT mix versions.

## Architecture Summary

**Pipeline:** Script (text/JSON) → TTS (Edge-TTS) → Remotion Render → Transcription (faster-whisper) → FFmpeg Post-Processing → Multi-Platform Export

**Primary use case:** Generating Spanish-language business/educational video content for YouTube, TikTok, Instagram Reels, and YouTube Shorts.

**Status:** FULLY WORKING END-TO-END (as of 2026-04-02). Pipeline is operational and tested.
