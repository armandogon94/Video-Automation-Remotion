# Commands & Usage Reference

## Video Generation (End-to-End)

```bash
# MAIN ENTRY POINT — generates a complete video in one command
npm run generate -- \
  --script "5 claves para implementar IA en tu empresa" \
  --voice "es-MX-JorgeNeural" \
  --template "explainer" \
  --platforms youtube,tiktok,reels

# List available Spanish voices (45 total)
npm run voices

# List available templates
npm run templates
```

## Development

```bash
# Start Remotion Studio (visual composition preview)
npm run dev

# Bundle Remotion for rendering
npm run build

# List loaded compositions
npx remotion compositions src/index.ts
```

## Testing

```bash
# Run JavaScript tests (vitest)
npm test

# Run Python tests (pytest)
uv run pytest

# Test Python TTS directly
uv run python src/tts/generate.py generate \
  --text "Hola mundo" \
  --voice "es-MX-JorgeNeural" \
  --output-dir ./output

# Test Python transcription directly
uv run python src/transcribe/transcribe.py \
  --input ./output/audio.mp3 \
  --model small \
  --language es
```

## Utilities

```bash
# Verify Remotion installation
npx remotion --version

# Verify FFmpeg installation
ffmpeg -version

# List Python dependencies
uv pip list
```

## Raw Remotion Render (Advanced)

```bash
# Render directly to MP4 without pipeline
npx remotion render \
  src/index.ts \
  ExplainerVideo \
  ./output/raw.mp4 \
  --props '{"script":"Text","voice":"es-MX-JorgeNeural","audioUrl":"audio.mp3","wordTimings":[],"style":{}}'
```
