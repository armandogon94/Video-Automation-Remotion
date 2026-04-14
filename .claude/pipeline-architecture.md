# Pipeline Architecture — Technical Reference

> How the video generation pipeline works internally.

---

## Pipeline Flow

```
CLI (generate.ts)
  │
  ▼
Pipeline Orchestrator (pipeline.ts)
  │
  ├─── Stage 1: TTS ──────────────────────────────────────────────
  │    Call: uv run python src/tts/generate.py generate --text "..." --voice "..." --output-dir ./output
  │    Input:  Script text + voice name
  │    Output: output/audio.mp3 + output/word_timings.json
  │    Time:   ~2 seconds
  │    Note:   Word timings are APPROXIMATE (sentence-level, evenly distributed)
  │
  ├─── Copy audio to public/ ─────────────────────────────────────
  │    Copies output/audio.mp3 → public/audio.mp3
  │    Required because Remotion's staticFile() only reads from public/
  │
  ├─── Stage 2: Remotion Render ──────────────────────────────────
  │    1. bundle() — Webpack bundles src/index.ts (call once, ~1s)
  │    2. selectComposition() — loads composition with inputProps
  │    3. renderMedia() — Chrome Headless Shell renders frames → FFmpeg encodes H.264
  │    Input:  Template name + props (script, audioUrl, wordTimings, style)
  │    Output: output/raw_video.mp4 (1920x1080 H.264+AAC)
  │    Time:   ~10 seconds for 300 frames (10s video)
  │
  ├─── Stage 3: Audio Normalization ──────────────────────────────
  │    Call: ffmpeg -af loudnorm=I=-14:TP=-1.5:LRA=11
  │    Input:  raw_video.mp4
  │    Output: normalized.mp4
  │    Time:   ~1 second
  │
  └─── Stage 4: Multi-Platform Export ────────────────────────────
       For each platform:
         - YouTube: 1920x1080, pad mode (no change if already 16:9)
         - TikTok:  1080x1920, crop mode (center crop)
         - Reels:   1080x1920, crop mode
         - Square:  1080x1080, crop mode
       Also: extractThumbnail at t=2s
       Time: ~1-2 seconds per platform
```

---

## Data Flow: Script Text → Word Timings → Captions

### Current Flow (Approximate Timing)
```
Script text → Edge-TTS → SentenceBoundary events → Split words evenly within sentence → wordTimings[]
```

Each word timing has: `{ text, startFrame, endFrame, startSeconds, endSeconds }`

### Planned Improvement (Accurate Timing)
```
Audio.mp3 → faster-whisper (word_timestamps=True) → per-word timestamps → wordTimings[]
```

This would replace or supplement the TTS word timings with accurate audio-based timings.

---

## Template → Composition Mapping

| Template Name (CLI) | Composition ID (Remotion) | JSON Config |
|---------------------|--------------------------|-------------|
| `explainer` | `ExplainerVideo` | templates/explainer.json |
| `talking-head` | `TalkingHead` | templates/talking-head.json |
| `listicle` | `Listicle` | templates/listicle.json |
| `quote` | `QuoteCard` | (no JSON yet) |

Mapping lives in `pipeline.ts` → `compositionMap` object and `buildProps()` function.

---

## Props Construction (buildProps function)

The `buildProps()` function in `pipeline.ts` builds Remotion inputProps from CLI arguments:

- All templates get: `audioUrl` (relative to public/), `wordTimings`, `captions` style config
- `explainer`: adds title, script, backgroundColor, gradientTo, accentColor, textColor, fontFamily
- `talking-head`: adds title, script, speakerImageUrl, backgroundColor, nameTag, nameTagColor
- `listicle`: splits script by newlines → first line = title, rest = list items with auto-numbering
- `quote`: uses script as quote text, no author (would need to be passed separately)

---

## Python ↔ TypeScript Interface

### TTS (generate.py)
- **Called via:** `execa(uv, ["run", "python", "src/tts/generate.py", "generate", "--text", ..., "--output-dir", ...])`
- **Stdout:** JSON object with `{ voice, text, fps, wordCount, words: [...], audioFile }`
- **Files created:** `{outputDir}/audio.mp3`, `{outputDir}/word_timings.json`

### Transcription (transcribe.py) — NOT YET INTEGRATED
- **Would be called via:** `execa(uv, ["run", "python", "src/transcribe/transcribe.py", "--input", audioPath, "--model", "small", "--language", "es"])`
- **Stdout:** JSON object with `{ language, duration, fps, segments: [...], words: [...] }`
- **Words format:** Same as TTS: `{ text, startFrame, endFrame, startSeconds, endSeconds, probability }`

---

## FFmpeg Commands Used

| Operation | Command Pattern |
|-----------|----------------|
| Normalize audio | `ffmpeg -y -i input -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 192k output` |
| Resize (pad) | `ffmpeg -y -i input -vf "scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:..." output` |
| Resize (crop) | `ffmpeg -y -i input -vf "crop=ih*W/H:ih,scale=W:H:flags=lanczos" output` |
| Resize (blur bg) | `ffmpeg -y -i input -filter_complex "[0:v]scale=W:H,boxblur=20:5[bg];[0:v]scale=...[fg];[bg][fg]overlay=..." output` |
| Thumbnail | `ffmpeg -y -ss 2 -i input -frames:v 1 -q:v 2 output.jpg` |

All commands use: `-c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart`
