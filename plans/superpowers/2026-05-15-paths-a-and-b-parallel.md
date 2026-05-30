# Plan — Path A + Path B in Parallel

**Date:** 2026-05-15
**Branch:** claude/recursing-tu-dac74b
**Status:** Approved, executing

---

## Goal

Get this project ready for a side-by-side bake-off between **Remotion (incumbent)** and **Hyperframes (challenger)**, both fed by the same Spanish script the user will bring from project 17 (Instagram Slides). Path A polishes Remotion and applies the Armando Inteligencia brand. Path B installs Hyperframes as an isolated parallel engine. Both must be runnable from the same project folder.

## Confirmed decisions (from user, 2026-05-15)

| Decision | Choice | Why |
|---|---|---|
| Hyperframes location | `hyperframes/` subfolder inside this project | Same project root, separate package.json, separate CLI |
| Brand assets | Copy `brand/` + logos from project 17 into this project | Self-contained, matches "portable projects" preference |
| Hyperframes template scope now | All 5 templates (explainer, talking-head, listicle, quote, vertical) | Full parity day-one so the bake-off is fair |
| Remotion existing code | Preserved, not overwritten | Hyperframes is additive, not a replacement |

## Out of scope (explicitly)

- Actually rendering the first video — user is writing the script in project 17 and will deliver it later
- VPS/server deployment (project remains local-only)
- ElevenLabs / premium TTS (still Edge-TTS)
- Tests (vitest/pytest) — backlogged, not required for bake-off
- Skipped: Remotion `@remotion/captions` library swap — superseded by faster-whisper integration which is the better fix for the same problem

## Task list (ordered, low-risk first, riskiest last in each path)

### Phase 0 — Foundation (additive, zero risk to existing pipeline)

| # | Task | Files touched | Acceptance |
|---|---|---|---|
| 0.1 | Copy `brand/config.json` + 5 logos from project 17 into this project | `brand/config.json`, `brand/logos/*.png`, `public/brand/logos/*` | Files present; logos viewable |
| 0.2 | Create typed brand module | `src/brand/config.ts`, `src/brand/index.ts` | `import { BRAND } from "src/brand"` returns typed object |
| 0.3 | Update `.gitignore` for hyperframes build artifacts | `.gitignore` | `hyperframes/node_modules`, `hyperframes/output/`, `hyperframes/.cache/` ignored |

### Phase A — Remotion polish + rebrand (Path A)

| # | Task | Files touched | Acceptance |
|---|---|---|---|
| A.1 | Parallel multi-platform export with `Promise.all` | `src/pipeline/pipeline.ts`, `src/ffmpeg/commands.ts` | `--platforms youtube,tiktok,reels` emits all three; wall-clock < serial |
| A.2 | Apply brand to 5 compositions (gradients, fonts, colors) | `src/compositions/*.tsx`, `templates/*.json` | All 5 compositions default to navy `#1B3A6E` → `#0F1B2D` gradient with gold `#D4AF37` accent and Inter/Fraunces fonts |
| A.3 | Add `<BrandWatermark>` overlay component (avatar logo bottom-right) | `src/components/BrandWatermark.tsx`, all 5 compositions | All compositions show watermark; togglable via prop |
| A.4 | **Integrate faster-whisper into pipeline** (the captions fix) | `src/pipeline/pipeline.ts`, `src/transcribe/transcribe.py` (already exists, may need stdout-JSON tweak) | After TTS, pipeline calls `transcribe.py` on the generated audio and replaces approximate word timings with whisper-derived ones; falls back to TTS timings if whisper fails |
| A.5 | Sanity check: end-to-end smoke run | (none — just runs the existing `npm run generate`) | One short Spanish script produces an MP4 in `output/`. Don't commit the MP4, just verify the pipeline survived rebranding |

### Phase B — Hyperframes parallel install (Path B)

| # | Task | Files touched | Acceptance |
|---|---|---|---|
| B.1 | Scaffold `hyperframes/` with `npx hyperframes init` | `hyperframes/**` | `npx hyperframes preview` opens a browser preview from inside `hyperframes/` |
| B.2 | Wire Hyperframes to use the SAME Edge-TTS + FFmpeg + brand config | `hyperframes/scripts/*.ts`, `hyperframes/package.json` | Hyperframes pipeline calls `../src/tts/generate.py` and `../src/ffmpeg/commands.ts` patterns |
| B.3 | Port 5 templates to plain HTML compositions | `hyperframes/compositions/explainer.html`, `talking-head.html`, `listicle.html`, `quote.html`, `vertical.html` | Each composition loads in `hyperframes preview` with sample data |
| B.4 | Hyperframes parallel CLI with same flags as Remotion | `hyperframes/cli/generate.ts` | `npm run generate:hf -- --script "..." --voice "..." --template explainer --platforms youtube` produces an MP4 |

### Phase C — Docs + handoff hygiene

| # | Task | Files touched | Acceptance |
|---|---|---|---|
| C.1 | Update `.claude/scratchpad.md` with new state | `.claude/scratchpad.md` | Reflects rebrand done, whisper wired, hyperframes installed |
| C.2 | Add a top-level `BAKEOFF.md` explaining how to run the same script through both engines | `BAKEOFF.md` | Clear command examples for both engines |
| C.3 | Update `CLAUDE.md` if new commands added | `CLAUDE.md` | New `npm run generate:hf` documented if applicable |

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| faster-whisper first-run downloads ~500MB model — pipeline gets slow | Model auto-caches at `~/.cache/huggingface/hub/` — only first run; mention in docs |
| faster-whisper output shape differs from Edge-TTS shape → caption rendering breaks | Keep Edge-TTS approximate timings as fallback; whisper output is normalized to same `{text, startFrame, endFrame, startSeconds, endSeconds}` shape per `pipeline-architecture.md` |
| `npx hyperframes init` may install heavy deps or fail | Run in `hyperframes/` only; never pollute the root `node_modules` |
| Same FFmpeg output paths collide between Remotion and Hyperframes | Hyperframes writes to `hyperframes/output/`, Remotion writes to `output/` — different roots |
| Brand fonts (Inter, Fraunces) — Remotion needs `@remotion/google-fonts` import | Already installed at v4.0.443; use `loadFont()` |

## Verification at each phase boundary

- **End of Phase 0:** `ls brand/ public/brand/logos/ src/brand/` shows expected files
- **End of Phase A:** `npx remotion compositions src/index.ts` still lists 5 compositions; sanity smoke run produces an MP4
- **End of Phase B:** `cd hyperframes && npx hyperframes preview` opens browser preview; CLI accepts same flags as Remotion
- **End of Phase C:** Both `npm run generate` and `npm run generate:hf` documented and runnable

## What I won't decide for you mid-flight

- Whether to swap which engine is the default after the bake-off — that's a post-render decision
- Whether to delete Remotion code if Hyperframes wins — preservation is the user's call
- Whether to render a real branded video right now — user is writing the script in project 17 first
