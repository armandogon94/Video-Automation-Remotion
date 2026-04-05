# AI Video Factory — Implementation Plan
## Programmatic Video Generation, Auto-Captioning & Multi-Platform Export

> **Updated 2026-04-02** — Revised for LOCAL-ONLY execution on macOS Apple Silicon.
> Previous plan targeted Hostinger VPS; that approach was abandoned due to insufficient resources.

---

## PROJECT OVERVIEW

Automated video production pipeline:
- **Remotion v4** for programmatic React-based video creation
- **FFmpeg** for video processing, subtitle burning (ASS format), format conversion
- **faster-whisper** for local transcription on Apple Silicon (CPU, int8)
- **Edge-TTS (FREE)** for text-to-speech — 45 Spanish neural voices with word timestamps
- **@remotion/captions** for TikTok-style word-by-word animated captions
- Reusable template system with Zod-validated props
- Multi-platform export (YouTube 16:9, TikTok/Reels 9:16, Instagram 1:1)
- CLI-first: `npm run generate -- --script "text" --voice "es-MX-JorgeNeural" --template "explainer"`

**Why it matters:** Video is the dominant content format. This pipeline automates the entire flow from script text to multi-platform video output, saving 500+ hours/year.

**Execution:** LOCAL ONLY on macOS Apple Silicon. Not deployed to any server.

---

## REFERENCE DOCUMENTS

- **README.md** — GitHub-facing project documentation with pipeline architecture
- **CLAUDE.md** — Claude Code context file with conventions and constraints
- **AGENTS.md** — Specialist agent role definitions
- **.claude/memory.md** — Architectural decisions and research findings
- **VIDEO_PIPELINE_RESEARCH.md** — Original 54KB technical deep-dive (historical reference)
- **IMPLEMENTATION_QUICKSTART.md** — Original code examples (historical reference)

---

## TECH STACK (RESEARCHED 2026-04-02)

- **Video Creation:** Remotion v4.x (React-based, FREE for individuals/<$1M revenue)
- **Animated Captions:** @remotion/captions (TikTok-style word-by-word)
- **Video Processing:** FFmpeg 6.x (Homebrew, VideoToolbox HW acceleration)
- **Transcription:** faster-whisper (CTranslate2, "small" model, ~2GB RAM, int8 on ARM64)
- **TTS:** Edge-TTS (FREE, 45 Spanish neural voices, word-level timestamps)
- **Pipeline Orchestration:** TypeScript + tsx + execa (sequential, typed, debuggable)
- **CLI:** Commander.js (subcommands, auto-help, TypeScript generics)
- **Props Validation:** Zod (integrates with Remotion Studio)
- **Runtime:** Node.js 22 LTS + Python 3.11+ (via uv)
- **Testing:** vitest (JS) + pytest (Python)
- **Storage:** Local filesystem (output/ directory, gitignored)

---

## COMPLETE PIPELINE ARCHITECTURE

```
Script (text/JSON)
    |
    v
TTS Engine (Edge-TTS or ElevenLabs)
    |  Output: audio.mp3 + duration metadata
    v
Remotion Renderer (React → frames → MP4)
    |  Input: script + audio + template props
    |  Output: raw_video.mp4
    v
Whisper Transcription (faster-whisper)
    |  Input: audio track
    |  Output: subtitles.srt (Spanish)
    v
Translation (Claude API / DeepL)
    |  Input: subtitles.srt
    |  Output: subtitles_en.srt (English)
    v
FFmpeg Post-Processing
    |  - Burn subtitles
    |  - Resize for platforms (1920x1080, 1080x1920)
    |  - Audio normalization
    |  - Add watermark/logo
    v
Multi-Platform Export
    - youtube_1080p.mp4
    - tiktok_vertical.mp4
    - reels_vertical.mp4
    - thumbnail.jpg
```

---

## REMOTION: HOW IT WORKS

Remotion renders React components frame-by-frame using Chrome Headless Shell, then encodes via FFmpeg.

### Core Concepts
- **Composition:** A React component + metadata (width, height, fps, duration)
- **Sequence:** Offsets child frame numbers for timing control
- **useCurrentFrame():** Hook that returns the current frame number
- **interpolate():** Maps frame numbers to animated values (opacity, position, scale)

### Installation

```bash
# Create new Remotion project
npx create-video@latest my-video-project

# Or add to existing project (KEEP ALL VERSIONS IDENTICAL)
npm i --save-exact remotion@4.0.441 @remotion/cli@4.0.441 @remotion/renderer@4.0.441
```

### Rendering Commands

```bash
# Render a video from CLI
npx remotion render src/index.tsx MyComposition output.mp4

# With dynamic props from JSON file
npx remotion render --props=./data.json src/index.tsx MyComposition output.mp4

# Optimized for VPS (2 vCPU, 8GB RAM)
npx remotion render \
  --concurrency=1 \
  --quality=70 \
  src/index.tsx MyComposition output.mp4
```

### Programmatic Rendering (Node.js)

```javascript
const { renderMedia, getCompositions } = require('@remotion/renderer');

async function renderVideo(props, outputPath) {
  const compositions = await getCompositions('./path/to/bundle');
  const composition = compositions.find(c => c.id === 'BusinessVideo');

  await renderMedia({
    composition: { ...composition, props },
    serveUrl: 'http://localhost:3000',
    outputLocation: outputPath,
    codec: 'h264',
    onProgress: ({ rendered, total }) => {
      console.log(`${rendered}/${total} frames`);
    },
  });
}
```

### Batch Rendering (Multiple Videos)

```javascript
const videos = [
  { headline: "5 Claves del Liderazgo IA", bodyText: "..." },
  { headline: "Machine Learning para CEOs", bodyText: "..." },
  { headline: "Automatiza tu Empresa", bodyText: "..." },
];

for (const [i, props] of videos.entries()) {
  await renderVideo(props, `./output/video_${i}.mp4`);
  console.log(`Video ${i+1}/${videos.length} complete`);
}
```

---

## TTS (TEXT-TO-SPEECH) OPTIONS

### Edge-TTS (FREE — Recommended to Start)

```bash
# Install
pip install edge-tts --break-system-packages

# Generate Spanish audio
edge-tts --voice "es-MX-JorgeNeural" \
  --text "Cinco claves para implementar IA en tu empresa" \
  --write-media audio.mp3 \
  --write-subtitles subs.vtt
```

**Available Spanish Voices:**
| Voice | Accent | Gender | Best For |
|-------|--------|--------|----------|
| es-MX-JorgeNeural | Mexican | Male | Professional content |
| es-MX-DaliaNeural | Mexican | Female | Warm, engaging |
| es-ES-AlvaroNeural | Castilian | Male | European Spanish |
| es-AR-ElenaNeural | Argentine | Female | Southern audience |

### ElevenLabs (Premium Quality)

```python
import requests

response = requests.post(
    "https://api.elevenlabs.io/v1/text-to-speech/voice_id",
    headers={"xi-api-key": "YOUR_KEY"},
    json={
        "text": "Cinco claves para implementar IA en tu empresa",
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}
    }
)
with open("audio.mp3", "wb") as f:
    f.write(response.content)
```

---

## WHISPER TRANSCRIPTION ON VPS

### faster-whisper (RECOMMENDED for 8GB RAM)

```bash
pip install faster-whisper --break-system-packages
```

```python
from faster_whisper import WhisperModel

# Use "small" model for VPS (requires ~2GB RAM)
model = WhisperModel("small", device="cpu", compute_type="int8")

segments, info = model.transcribe("audio.mp3", language="es")

# Generate SRT file
with open("subtitles.srt", "w") as f:
    for i, segment in enumerate(segments, 1):
        start = format_timestamp(segment.start)
        end = format_timestamp(segment.end)
        f.write(f"{i}\n{start} --> {end}\n{segment.text.strip()}\n\n")
```

**Model Comparison for VPS:**
| Model | RAM | Speed | Spanish Accuracy |
|-------|-----|-------|-----------------|
| tiny | 1GB | 32x realtime | ~75% |
| base | 1GB | 16x realtime | ~80% |
| small | 2GB | 6x realtime | ~88% (recommended) |
| medium | 5GB | 2x realtime | ~92% |

---

## FFMPEG ESSENTIAL COMMANDS

### Burn Subtitles into Video
```bash
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'" output.mp4
```

### Resize for Platforms
```bash
# YouTube (1920x1080)
ffmpeg -i input.mp4 -vf "scale=1920:1080" -c:a copy youtube.mp4

# TikTok/Reels vertical (1080x1920)
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" tiktok.mp4
```

### Audio Normalization
```bash
ffmpeg -i input.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:v copy output.mp4
```

### Extract Thumbnail
```bash
ffmpeg -i input.mp4 -ss 00:00:05 -frames:v 1 -q:v 2 thumbnail.jpg
```

### Concatenate Intro + Main + Outro
```bash
# Create file list
echo "file 'intro.mp4'" > list.txt
echo "file 'main.mp4'" >> list.txt
echo "file 'outro.mp4'" >> list.txt

ffmpeg -f concat -safe 0 -i list.txt -c copy final.mp4
```

### Add Watermark
```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=W-w-10:H-h-10" output.mp4
```

---

## REMOTION VIDEO TEMPLATE

### File: `src/VideoTemplate.tsx`

```typescript
import { Composition, useCurrentFrame, interpolate } from 'remotion';
import { FadeInText } from './components/FadeInText';
import { Background } from './components/Background';

export const MyVideoTemplate = () => {
  const frame = useCurrentFrame();

  // Animation values
  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, 15],
    [0.5, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Background />

      <div style={{
        opacity,
        transform: `scale(${scale})`,
      }}>
        <FadeInText text="Your Title Here" />
      </div>
    </div>
  );
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideoTemplate}
      durationInFrames={300}  // 10 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
```

---

## WHISPER TRANSCRIPTION

### File: `scripts/transcribe.py`

```python
import whisper
from pathlib import Path
import json

def transcribe_video(video_path: str, language: str = "en") -> dict:
    """Transcribe video using Whisper"""

    # Load Whisper model (medium or large for accuracy)
    model = whisper.load_model("medium")

    # Transcribe
    result = model.transcribe(
        video_path,
        language=language,
        verbose=True
    )

    # Extract segments with timing
    segments = []
    for segment in result["segments"]:
        segments.append({
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"]
        })

    return {
        "text": result["text"],
        "segments": segments,
        "language": result["language"]
    }

# Usage
transcript = transcribe_video("video.mp4")
with open("transcript.json", "w") as f:
    json.dump(transcript, f)
```

---

## AUTO-CAPTIONING

### File: `scripts/generate_captions.py`

```python
import json
import pysub
from typing import List

def create_srt_from_transcript(transcript: dict) -> str:
    """Create SRT subtitle file from transcript"""

    subs = pysub.SubRipFile()

    for i, segment in enumerate(transcript["segments"]):
        start_ms = int(segment["start"] * 1000)
        end_ms = int(segment["end"] * 1000)
        text = segment["text"].strip()

        sub = pysub.SubRip(
            index=i + 1,
            start=pysub.time_to_ms(start_ms),
            end=pysub.time_to_ms(end_ms),
            content=text
        )
        subs.append(sub)

    return subs.to_string()

def translate_captions(srt_content: str, source_lang: str, target_lang: str) -> str:
    """Translate subtitles using Claude"""
    from anthropic import Anthropic

    client = Anthropic()

    # Extract text from SRT
    lines = srt_content.split('\n')
    text_lines = [line for line in lines if line and not line[0].isdigit() and '-->' not in line]
    text_to_translate = '\n'.join(text_lines)

    # Translate
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": f"Translate these subtitles from {source_lang} to {target_lang}, keeping line breaks:\n\n{text_to_translate}"
            }
        ]
    )

    translated_text = message.content[0].text

    # Reconstruct SRT
    text_lines_translated = translated_text.split('\n')
    result_lines = []
    text_idx = 0

    for line in lines:
        if line and not line[0].isdigit() and '-->' not in line and line.strip():
            if text_idx < len(text_lines_translated):
                result_lines.append(text_lines_translated[text_idx])
                text_idx += 1
        else:
            result_lines.append(line)

    return '\n'.join(result_lines)

# Usage
with open("transcript.json") as f:
    transcript = json.load(f)

# English captions
srt_en = create_srt_from_transcript(transcript)
with open("captions_en.srt", "w") as f:
    f.write(srt_en)

# Spanish captions
srt_es = translate_captions(srt_en, "English", "Spanish")
with open("captions_es.srt", "w") as f:
    f.write(srt_es)
```

---

## FFMPEG VIDEO PROCESSING

### File: `scripts/process_video.sh`

```bash
#!/bin/bash

# Parameters
INPUT_VIDEO=$1
OUTPUT_DIR=$2
CAPTIONS_EN=$3
CAPTIONS_ES=$4

# Add English captions (burned in)
ffmpeg -i "$INPUT_VIDEO" \
  -vf "subtitles=$CAPTIONS_EN:force_style='FontSize=24,PrimaryColour=&H00FFFFFF&'" \
  "$OUTPUT_DIR/video_en.mp4"

# Add Spanish captions
ffmpeg -i "$INPUT_VIDEO" \
  -vf "subtitles=$CAPTIONS_ES:force_style='FontSize=24,PrimaryColour=&H00FFFFFF&'" \
  "$OUTPUT_DIR/video_es.mp4"

# Generate TikTok version (9:16 aspect ratio, vertical)
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  "$OUTPUT_DIR/tiktok_version.mp4"

# Generate Instagram Reel (9:16)
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  "$OUTPUT_DIR/instagram_reel.mp4"

# Generate YouTube Short (vertical, with padding)
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  "$OUTPUT_DIR/youtube_short.mp4"

# Generate Twitter video (16:9, standard)
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1280:720" \
  "$OUTPUT_DIR/twitter_video.mp4"

echo "All formats generated successfully"
```

---

## FASTAPI VIDEO GENERATION SERVER

### File: `server/main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os
from pathlib import Path
import json
import asyncio

app = FastAPI(title="Video Generation Service")

class VideoRequest(BaseModel):
    title: str
    description: str
    thumbnail_url: str = None
    duration_seconds: int = 60
    music_url: str = None
    generate_captions: bool = True
    languages: list = ["en", "es"]
    export_formats: list = ["youtube", "tiktok", "instagram", "twitter"]

@app.post("/generate-video")
async def generate_video(req: VideoRequest):
    """Generate video from template"""

    output_dir = f"/videos/{req.title.replace(' ', '_')}"
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    try:
        # Step 1: Render Remotion video
        render_cmd = [
            "npx", "remotion", "render",
            "src/index.tsx",
            "MyVideo",
            f"{output_dir}/video_base.mp4",
            "--props", json.dumps({
                "title": req.title,
                "description": req.description,
                "duration": req.duration_seconds
            })
        ]

        result = subprocess.run(render_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"Remotion render failed: {result.stderr}")

        # Step 2: Transcribe if captions requested
        if req.generate_captions:
            transcribe_cmd = ["python", "scripts/transcribe.py", f"{output_dir}/video_base.mp4"]
            subprocess.run(transcribe_cmd)

            # Step 3: Generate captions in multiple languages
            for lang in req.languages:
                caption_cmd = ["python", "scripts/generate_captions.py", lang]
                subprocess.run(caption_cmd, cwd=output_dir)

        # Step 4: Process video for all platforms
        for platform in req.export_formats:
            process_cmd = ["bash", "scripts/process_video.sh", f"{output_dir}/video_base.mp4", output_dir]
            subprocess.run(process_cmd)

        return {
            "success": True,
            "output_dir": output_dir,
            "video_path": f"{output_dir}/video_base.mp4",
            "formats": req.export_formats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## LOCAL DOCKER (OPTIONAL)

Only Redis for optional future BullMQ integration. See `docker-compose.dev.yml`.

**No production Docker setup.** All rendering runs natively on macOS.

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation
- Initialize git repo, npm, uv
- Install Remotion v4, tsx, execa, commander, zod, vitest
- Install faster-whisper, pytest via uv
- Create first Remotion composition (ExplainerVideo) with Zod schema
- Create CLI skeleton with Commander.js

### Phase 2: Pipeline Core
- Edge-TTS integration (evaluate `edge-tts-universal` Node.js vs Python `edge-tts`)
- faster-whisper Python wrapper script (JSON stdout)
- Pipeline orchestrator (TypeScript, sequential stages)
- FFmpeg command builders (resize, normalize, subtitles)

### Phase 3: Templates & Captions
- @remotion/captions integration for TikTok-style word-by-word captions
- ExplainerVideo template (gradient background + animated text)
- TalkingHead template (speaker frame + caption overlay)
- Listicle template (numbered items + transitions)
- QuoteCard template (animated quote + author)

### Phase 4: Post-Processing & Export
- Multi-platform resize (16:9, 9:16, 1:1 with smart crop/pad/blur)
- Audio normalization (EBU R128 two-pass, -14 LUFS for YouTube)
- Subtitle burning (ASS format for styled captions)
- Thumbnail extraction (scene-change detection)
- Video concatenation (intro + main + outro with xfade)

### Phase 5: Polish
- vitest snapshot tests for compositions
- pytest tests for Python wrappers
- Batch generation from CSV/JSON
- Error handling and progress reporting
- Documentation updates

---

**AI Video Factory Version:** 2.0
**Status:** Project structure and research complete. Ready for implementation.
