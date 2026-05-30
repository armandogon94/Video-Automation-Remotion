# Bake-off — Remotion vs. Hyperframes

> Run the same Spanish script through both engines, compare the outputs.

This project carries **two independent rendering engines**:

- **Remotion** (incumbent) — React/TSX components, lives in `src/`.
- **Hyperframes** (challenger) — plain HTML + GSAP, lives in `hyperframes/`.

They share everything else (Edge-TTS for audio, faster-whisper for word timings, FFmpeg for post-processing, the Armando Inteligencia brand assets). Whichever engine you pick later is the variable being tested. Same script in, two MP4s out, judge visually.

---

## Prerequisites (one-time)

```bash
# Node 24 is required for Hyperframes (the Remotion side accepts ≥20).
nvm install 24.14.0
nvm use 24.14.0

# From project root
npm install
cd hyperframes && npm install && cd ..

# Python tooling (Edge-TTS + faster-whisper)
uv sync   # reads pyproject.toml + uv.lock
```

First run will download:
- Chrome Headless Shell (~90 MB) — for both Remotion and Hyperframes
- faster-whisper "small" model (~500 MB) — cached at `~/.cache/huggingface/`

After that, runs are warm.

---

## Run the same script through both engines

Pick the script + voice + template you want, then run **both** of these:

### Remotion side

```bash
npm run generate -- \
  --script "Tu texto en español aquí." \
  --voice "es-MX-JorgeNeural" \
  --template explainer \
  --platforms youtube,reels \
  --output ./output/remotion-run-1
```

Outputs in `output/remotion-run-1/`:
- `audio.mp3`
- `raw_video.mp4`
- `normalized.mp4`
- `video_<timestamp>_youtube.mp4`
- `video_<timestamp>_reels.mp4`
- `video_<timestamp>_thumbnail.jpg`
- `word_timings_final.json` (with `source: "whisper"` or `"tts-approximate"`)

### Hyperframes side

```bash
cd hyperframes
npm run generate -- \
  --script "Tu texto en español aquí." \
  --voice "es-MX-JorgeNeural" \
  --template explainer \
  --platforms youtube,reels \
  --output ./output/hf-run-1
cd ..
```

Outputs in `hyperframes/output/hf-run-1/`:
- Same files as the Remotion side, plus `_hf` baked into the filename so you can tell them apart at a glance.

### Compare

The two MP4s are now ready to view side-by-side. Same script, same voice, same captions timing source — only the rendering pipeline differs.

---

## Shared flags (both CLIs accept the same options)

| Flag | Default | What it does |
|---|---|---|
| `--script <text>` | required | Spanish script text |
| `--voice <name>` | `es-MX-JorgeNeural` | Any of 45 Edge-TTS Spanish voices |
| `--template <name>` | `explainer` | `explainer` · `talking-head` · `listicle` · `quote` · `vertical` |
| `--platforms <csv>` | `youtube` | `youtube` · `tiktok` · `reels` · `square` |
| `--output <dir>` | `./output` | Output directory |
| `--fps <n>` | `30` | Frame rate |
| `--rate <±%>` | `+0%` | Speech rate (e.g. `+20%`) |
| `--pitch <±Hz>` | `+0Hz` | Pitch adjustment |
| `--whisper` / `--no-whisper` | on | Use faster-whisper for accurate word timings |
| `--whisper-model <size>` | `small` | `tiny` · `base` · `small` · `medium` · `large-v3` |
| `--language <code>` | `es` | Language code for whisper |

### Hyperframes-only extras

| Flag | Default | Template that uses it |
|---|---|---|
| `--title <text>` | first sentence of script | all (overrides auto-derived title) |
| `--name-tag <text>` | `Armando Inteligencia` | `talking-head` |
| `--author <text>` | `Anónimo` | `quote` |
| `--items <json>` | parsed from script newlines | `listicle` |
| `--seconds-per-item <n>` | `5` | `listicle` |

---

## What to compare

After the two runs finish, look for:

1. **Caption sync.** Both pipelines feed the same Whisper word timings to their compositions. Disagreement = a rendering bug to flag.
2. **Animation feel.** Remotion (spring physics) vs. Hyperframes (GSAP easings). Different aesthetic.
3. **Font rendering.** Remotion uses `@remotion/google-fonts/Inter`. Hyperframes loads from Google Fonts CDN. Should match closely.
4. **Brand consistency.** Same navy + gold + watermark on both sides. If they look different, the brand config copied into `hyperframes/brand/` may have drifted from `brand/`.
5. **Render time.** Each pipeline logs total wall-clock time at the end. Compare for the same composition.
6. **Filesize and bitrate.** Both pipelines use the same FFmpeg post-processing (`exportMultiPlatform`), so per-platform exports should be near-identical bytes. Differences come from the *raw* MP4 each engine produces.

---

## Picking a winner (when ready)

If after a few real videos one engine consistently wins, the loser can be removed:

- **If Remotion wins:** delete `hyperframes/` entirely. Remove the `hyperframes` reference from `.gitignore` and `README.md`.
- **If Hyperframes wins:** delete `src/Root.tsx`, `src/compositions/`, `src/components/` (keep `src/brand/`, `src/tts/`, `src/transcribe/`, `src/ffmpeg/`, `src/pipeline/` if you want to keep the Edge-TTS + Whisper Python tooling). The pipeline orchestrator at `src/pipeline/pipeline.ts` would then either be deleted or rewritten to drive Hyperframes directly.

No need to decide today. Just collect data.

---

## Known issues / future work

- **Hyperframes `--platforms` runs FFmpeg post-processing serially within `hyperframes/scripts/generate.ts`.** The Remotion side parallelizes via `Promise.all` in `src/ffmpeg/commands.ts`. Both share `exportMultiPlatform` from the same file, so Hyperframes gets the parallel speedup for free.
- **Hyperframes' `index.html` is overwritten each run.** It's git-ignored. The committed placeholder version just tells future-you "run the generate CLI."
- **Per-template caption styling is duplicated.** If you tweak caption colors/spacing, you'll need to update 5 HTML files. Easy candidate for a shared partial later.
- **Engine swap mid-run is not supported.** Pick one engine per `generate` call.
