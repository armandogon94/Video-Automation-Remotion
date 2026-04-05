# Automated Video Editing Pipeline Research
## For Armando's AI Influencer Brand (armandointeligencia.com)
### Targeting: Spanish-speaking Business Leaders | Deployment: Hostinger VPS KVM2 (2 vCPU, 8GB RAM)

---

## EXECUTIVE SUMMARY

Building a complete automated video production pipeline requires integrating **Remotion** (programmatic video generation), **FFmpeg** (encoding/post-processing), **Whisper** (transcription), and **TTS** (text-to-speech). For a 2 vCPU/8GB RAM VPS, the key strategy is **sequential processing** with optimized settings rather than parallel rendering.

### Complete Pipeline Architecture:
```
Script (text) → TTS (audio generation) → Remotion (video composition)
→ Whisper (transcription) → FFmpeg (post-processing) → Multi-platform export
```

**Estimated costs:** $0 - $50/month depending on TTS choice (free edge-tts vs. paid ElevenLabs)

---

## 1. REMOTION DEEP DIVE

### What is Remotion?

Remotion is a **framework for creating videos programmatically using React**. Instead of using traditional video editors, you write JSX/React components that define video frames, and Remotion renders them into MP4, WebM, or other formats.

**Key concept:** Each frame number is passed to your React component, which renders visual content. Remotion captures all frames and encodes them into video via FFmpeg.

Sources:
- [Remotion Fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [Creating Videos with React: Clipcat Guide](https://www.clipcat.com/blog/create-videos-programmatically-using-react-a-beginners-guide-to-remotion/)

### Installation & Setup

**For Node.js 16+ (or Bun 1.0.3+):**

```bash
# Create new project
npx create-video@latest

# Or install in existing project
npm i --save-exact remotion@4.0.441 @remotion/cli@4.0.441
npm i --save-exact @remotion/renderer@4.0.441
```

**Critical:** Keep all Remotion packages at the SAME version (remove ^ from package.json).

Sources:
- [Official Installation Guide](https://www.remotion.dev/docs/)
- [Brownfield Installation](https://www.remotion.dev/docs/brownfield)

### Compositions & Sequences (Core Concepts)

**Composition:** A React component registered for rendering, combining JSX + metadata (width, height, fps, durationInFrames).

**Sequence:** A component that offsets child frame numbers. Example:
```jsx
<Sequence from={60}>
  <TextAnimation /> {/* Receives frame 0 when video is at frame 60 */}
</Sequence>
```

Sequences can be nested and cascade timing.

Sources:
- [Sequence Component](https://www.remotion.dev/docs/sequence)
- [Composition Documentation](https://www.remotion.dev/docs/composition)

### Rendering Pipeline: CPU vs GPU

**For your 2 vCPU/8GB VPS:**

- **CPU Rendering:** Remotion uses Chrome Headless Shell (not full Chrome), which disables GPU
- **Headless mode performance loss:** ~30-50% slower than GPU rendering
- **Memory usage:** Default uses ~50% of system RAM; configurable via `--concurrency` flag

**Optimal settings for 2 vCPU/8GB:**
```bash
npx remotion render \
  --concurrency=1 \
  --quality=70 \
  --height=1080 \
  --width=1920 \
  src/index.tsx MyComposition out.mp4
```

- `--concurrency=1`: Single render process (avoid memory thrashing)
- `--quality=70`: Reduce quality to speed up rendering
- Results: ~1-2 minutes per 30-second video

**Better approach:** Use `npx remotion benchmark` to find YOUR optimal concurrency settings.

Sources:
- [Performance Tips](https://www.remotion.dev/docs/performance)
- [Server-Side Rendering](https://www.remotion.dev/docs/ssr)
- [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell)

### Remotion & FFmpeg Integration

Remotion uses **FFmpeg internally** for final encoding. When you render:
1. Remotion renders all frames as images
2. FFmpeg encodes them into video

Codec options: H.264 (fast, compatible), H.265/HEVC (smaller files, slower), VP8/VP9 (slow but WebM-compatible).

### Remotion Pricing & Licensing

**Good news for your use case:**
- **Free for individuals and companies with ≤3 people**
- Commercial license required for larger teams
- Self-hosted rendering = no additional costs
- Remotion Lambda = optional (costs $0.00001-0.00003 per frame, usually cheaper than AWS if you render <1000 videos/month)

Sources:
- [License & Pricing](https://www.remotion.dev/docs/license)
- [Lambda Cost Example](https://www.remotion.dev/docs/lambda/cost-example)

---

## 2. REMOTION TEMPLATE SYSTEM

### Template Architecture for Reusable Videos

A reusable template structure:

```jsx
// src/MyVideoTemplate.tsx
import { Composition, Sequence, interpolate, useCurrentFrame } from 'remotion';

interface VideoProps {
  headline: string;
  bodyText: string;
  backgroundColor: string;
  accentColor: string;
  backgroundImageUrl?: string;
}

export const MyTemplate: React.FC<VideoProps> = ({
  headline,
  bodyText,
  backgroundColor,
  accentColor,
  backgroundImageUrl,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <div style={{ backgroundColor, width: '100%', height: '100%' }}>
      {backgroundImageUrl && (
        <img src={backgroundImageUrl} style={{ width: '100%', height: '100%' }} />
      )}
      <h1 style={{ opacity, color: accentColor }}>{headline}</h1>
      <p>{bodyText}</p>
    </div>
  );
};

export const compositions = [
  <Composition
    id="MyVideo"
    component={MyTemplate}
    durationInFrames={900} // 30 seconds at 30fps
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{
      headline: 'Default Title',
      bodyText: 'Default content',
      backgroundColor: '#000',
      accentColor: '#fff',
    }}
  />,
];
```

### Pass JSON Data to Remotion

Two methods:

**1. CLI inline (Linux/macOS only):**
```bash
npx remotion render \
  --props='{"headline":"Liderazgo Empresarial","bodyText":"10 claves..."}' \
  src/index.tsx MyVideo out.mp4
```

**2. CLI with JSON file (all platforms, recommended):**
```bash
# data.json
{
  "headline": "Liderazgo Empresarial",
  "bodyText": "10 claves para escalar tu negocio",
  "backgroundColor": "#1a1a1a",
  "accentColor": "#00d4ff"
}

# Render command
npx remotion render --props=./data.json src/index.tsx MyVideo out.mp4
```

### Programmatic Rendering (Node.js)

For automation scripts:

```javascript
const { renderMedia } = require('@remotion/renderer');
const { getCompositions } = require('@remotion/renderer');

(async () => {
  const compositions = await getCompositions('./path/to/bundle');

  const composition = compositions.find(c => c.id === 'MyVideo');

  await renderMedia({
    composition: {
      ...composition,
      props: {
        headline: 'Mi Titulo',
        bodyText: 'Mi contenido',
      },
    },
    serveUrl: 'http://localhost:3000', // Dev server
    outputLocation: './out/video.mp4',
    onProgress: ({ rendered, total }) => {
      console.log(`${rendered}/${total} frames rendered`);
    },
  });
})();
```

### Available Templates for Spanish Content

**Official Remotion Templates:**
- [Remotion Templates Directory](https://www.remotion.dev/templates/)
- [Template Hello World](https://github.com/remotion-dev/template-helloworld)

**Community Templates (YouTube Shorts/Reels):**
- [reactvideoeditor/remotion-templates](https://github.com/reactvideoeditor/remotion-templates) - Free effects & animations
- [ali-abassi/remotion-templates](https://github.com/ali-abassi/remotion-templates) - Captions, visualizers, transitions
- [RemotionTemplates.dev](https://remotiontemplates.dev/) - Professional templates
- [short-video-maker](https://github.com/aaurelions/short-video-maker) - AI-powered short-form videos

**Dimensions for Spanish platforms:**
- YouTube Shorts: 1080x1920 (vertical, 9:16)
- Instagram Reels: 1080x1920 or 1080x1080
- TikTok: 1080x1920

Sources:
- [Remotion Templates](https://github.com/reactvideoeditor/remotion-templates)
- [Composition System](https://www.remotion.dev/docs/composition)
- [Props Documentation](https://www.remotion.dev/docs/passing-props)

---

## 3. REMOTION + TEXT-TO-SPEECH INTEGRATION

### TTS Cost Comparison

| Service | Cost | Spanish Support | Latency | Best For |
|---------|------|---|---------|----------|
| **Edge-TTS** | **FREE** | Yes (11 voices) | 1-2s | Budget-conscious, offline |
| **OpenAI TTS** | $15/1M chars | Yes | 1-2s | Cost-effective, quality |
| **ElevenLabs** | $80-160/1M chars | Yes (regional) | 500ms | Premium quality, naturalness |
| **Google Cloud TTS** | $16/1M chars | Yes | 1-2s | Enterprise, multilingual |

**For Spanish business content:** ElevenLabs (Multilingual v2 + Flash v2.5) provides the most natural-sounding results with business-appropriate tone and regional Spanish accent support.

Sources:
- [TTS API Comparison 2026](https://www.speechmatics.com/company/articles-and-news/best-tts-apis-in-2025-top-12-text-to-speech-services-for-developers)
- [ElevenLabs vs OpenAI](https://vapi.ai/blog/elevenlabs-vs-openai)

### Option 1: Free Edge-TTS (Microsoft)

**NPM Package:** `@andresaya/edge-tts`

```bash
npm install @andresaya/edge-tts
```

```javascript
// generate-audio.js
const { EdgeTTS } = require('@andresaya/edge-tts');

async function generateSpanishAudio(text, outputPath) {
  const tts = new EdgeTTS({
    voice: 'es-ES-AlvaroNeural', // Spanish (Spain)
    rate: 0, // 0 = normal speed
    volume: 100,
  });

  const audio = await tts.synthesize(text);

  const fs = require('fs');
  fs.writeFileSync(outputPath, audio);

  console.log(`Audio saved to ${outputPath}`);
}

generateSpanishAudio('Hola, bienvenido a mi canal', 'output.mp3');
```

**Spanish voices available:**
- `es-ES-AlvaroNeural` - Castilian male
- `es-ES-ElviraNeural` - Castilian female
- `es-MX-JorgeNeural` - Mexican Spanish
- `es-AR-ElenaNeural` - Argentine Spanish

**Advantages:**
- Completely free
- No API key needed
- Offline capable
- Reliable

**Disadvantages:**
- Less natural than paid services
- No emotional control
- Basic voice options

Sources:
- [@andresaya/edge-tts on npm](https://www.npmjs.com/package/@andresaya/edge-tts)
- [GitHub: edge-tts](https://github.com/rany2/edge-tts)

### Option 2: ElevenLabs (Premium)

**NPM Package:** `elevenlabs-js` (official SDK)

```bash
npm install @elevenlabs/elevenlabs-js
```

```javascript
// elevenlabs-tts.js
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";

async function generateWithElevenLabs(text, outputPath) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  // Spanish (Castilian) voice IDs
  // List: https://elevenlabs.io/voice-library
  const voiceId = 'JBFqnCBsd6RMkjVY5Zva'; // Example: Aurora (professional)

  const audio = await elevenlabs.generate({
    voice_id: voiceId,
    model_id: 'eleven_multilingual_v2', // Supports 29 languages
    text: text,
    output_format: 'mp3_128',
  });

  const fs = require('fs');
  fs.writeFileSync(outputPath, audio);

  console.log(`Audio generated: ${outputPath}`);
}

generateWithElevenLabs(
  '10 estrategias para escalar tu negocio...',
  'audio.mp3'
);
```

**Pricing:** $0.06-0.08 per 1K characters at volume (Google's TTS is $16/1M = $0.016/1K for comparison).

For a 300-word Spanish script (~2000 chars): ~$0.12-0.16 per video.

**Pro tip:** ElevenLabs monthly free tier includes 10,000 characters.

Sources:
- [ElevenLabs JavaScript SDK](https://github.com/elevenlabs/elevenlabs-js)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing/api)
- [Spanish TTS Comparison](https://www.resemble.ai/spanish-tts/)

### Get Audio Duration & Sync to Video

```javascript
// audio-duration.js
const fs = require('fs');
const mp3Parser = require('mp3-parser'); // npm install mp3-parser

function getAudioDurationInFrames(audioPath, fps = 30) {
  const buffer = fs.readFileSync(audioPath);
  const frames = mp3Parser.parse(buffer);

  const durationSeconds = frames.duration;
  const durationFrames = Math.ceil(durationSeconds * fps);

  console.log(`Duration: ${durationSeconds}s = ${durationFrames} frames at ${fps}fps`);
  return durationFrames;
}

// Or use ffmpeg-probe:
const ffprobeStatic = require('ffprobe-static');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfprobePath(ffprobeStatic.path);

function getAudioDurationFFprobe(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
}
```

### Integration: TTS → Remotion Composition

```javascript
// pipeline.js - Complete workflow
const { renderMedia } = require('@remotion/renderer');
const { EdgeTTS } = require('@andresaya/edge-tts');
const ffmpeg = require('fluent-ffmpeg');

async function generateVideoWithAudio(script, outputPath) {
  // Step 1: Generate TTS audio
  console.log('Step 1: Generating audio...');
  const audioPath = './temp/audio.mp3';
  const tts = new EdgeTTS({
    voice: 'es-ES-AlvaroNeural',
  });

  const audio = await tts.synthesize(script);
  fs.writeFileSync(audioPath, audio);

  // Step 2: Get audio duration
  const duration = await getAudioDurationFFprobe(audioPath);
  const durationFrames = Math.ceil(duration * 30); // 30fps

  console.log(`Audio duration: ${duration}s = ${durationFrames} frames`);

  // Step 3: Render video with audio
  console.log('Step 2: Rendering video...');
  await renderMedia({
    composition: {
      id: 'MyVideo',
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: durationFrames,
      props: {
        audioPath: audioPath,
        transcript: script,
      },
    },
    serveUrl: 'http://localhost:3000',
    outputLocation: outputPath,
    inputProps: {
      audioPath: audioPath,
    },
  });

  console.log(`Video saved to ${outputPath}`);
}

generateVideoWithAudio(
  'Hola, bienvenido a mi canal de negocios...',
  './output/video.mp4'
);
```

Sources:
- [ElevenLabs API](https://elevenlabs.io/docs/api-reference/introduction)
- [Remotion Audio Documentation](https://www.remotion.dev/docs/using-audio)
- [Audio Duration Sync](https://crepal.ai/blog/aivideo/blog-how-to-fix-remotion-audio-out-of-sync/)

---

## 4. FFmpeg AUTOMATION SCRIPTS

### Core FFmpeg Commands for Content Creators

FFmpeg is the backbone of your post-processing pipeline. All of these are CPU-friendly and work on 2vCPU systems.

### 4.1 Burn Subtitles/Captions

```bash
# Add SRT subtitle file to video
ffmpeg -i input.mp4 -vf subtitles=subs.srt -c:v libx264 -crf 22 -c:a aac output.mp4

# Requirements:
# - ffmpeg compiled with --enable-libass
# - SRT file format:
# 1
# 00:00:00,000 --> 00:00:05,000
# First subtitle text
#
# 2
# 00:00:05,000 --> 00:00:10,000
# Second subtitle text
```

**Check if your FFmpeg has libass:**
```bash
ffmpeg -version | grep libass
# Output should show: --enable-libass
```

### 4.2 Resize for Multiple Platforms

```bash
# YouTube Shorts (1080x1920 vertical, 16:9 aspect assumed)
ffmpeg -i input.mp4 -vf "scale=-1:1920" -c:v libx264 -crf 22 output_shorts.mp4

# Instagram Reels (1080x1920)
ffmpeg -i input.mp4 -vf "scale=1080:1920" -c:v libx264 -crf 22 output_reels.mp4

# TikTok (1080x1920, 9:16)
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" output_tiktok.mp4

# YouTube (1920x1080, 16:9)
ffmpeg -i input.mp4 -vf "scale=1920:1080" -c:v libx264 -crf 22 output_yt.mp4
```

**Scale filter explanation:**
- `scale=1920:1080` - Exact dimensions
- `scale=-1:1920` - Maintain aspect ratio, set height to 1920
- `force_original_aspect_ratio` - Keep aspect ratio
- `pad` - Add letterbox if needed

### 4.3 Audio Normalization (EBU R128 standard)

For consistent loudness across all videos:

```bash
# Single-pass (fast, lower quality)
ffmpeg -i input.mp4 -af loudnorm=I=-24:TP=-2:LRA=7 -c:v copy output.mp4

# Double-pass (slow, best quality) - two commands:
# Pass 1: Analyze
ffmpeg -i input.mp4 -af loudnorm=I=-24:TP=-2:LRA=7:print_format=json -f null -

# Pass 2: Apply (copy JSON stats from pass 1)
ffmpeg -i input.mp4 -af 'loudnorm=I=-24:TP=-2:LRA=7:measured_I=-23.5:measured_LRA=5.3:measured_TP=-1.2:measured_thresh=-31.5:offset=1.2' output.mp4
```

**Parameters:**
- `I=-24` - Target integrated loudness (-24 LUFS for streaming)
- `TP=-2` - Maximum true peak (+0 is loudest allowed)
- `LRA=7` - Loudness range (7 LUFS for speech)

For business/educational content, use `-24 LUFS` (streaming standard).

### 4.4 Extract Thumbnail

```bash
# Get frame at 5 seconds
ffmpeg -i input.mp4 -ss 00:00:05 -frames:v 1 -q:v 2 thumbnail.jpg

# Get frame at 50% of video duration
ffmpeg -i input.mp4 -vf "select=eq(n\,floor(FRAME_NR/2))" -frames:v 1 -q:v 2 thumbnail.jpg
```

### 4.5 Concatenate Videos (Intro + Main + Outro)

```bash
# Create concat.txt
file 'intro.mp4'
file 'main.mp4'
file 'outro.mp4'

# Concatenate
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

### 4.6 Add Logo/Watermark Overlay

```bash
# Add PNG logo at bottom-right, 20% opacity
ffmpeg -i input.mp4 -i logo.png \
  -filter_complex "[0:v][1:v] overlay=W-w-10:H-h-10:alpha=0.2[out]" \
  -map "[out]" -map 0:a -c:a aac output.mp4

# Positioning: 10px from right (W-w-10), 10px from bottom (H-h-10)
# W/H = video width/height, w/h = logo width/height
```

### 4.7 Extract Audio

```bash
# Extract audio as MP3
ffmpeg -i input.mp4 -q:a 0 -map a audio.mp3
```

### 4.8 Trim/Cut Video by Timestamp

```bash
# Start at 10s, duration 30s
ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:30 -c copy output_trimmed.mp4
```

### 4.9 Change Speed

```bash
# Slow down to 0.5x speed
ffmpeg -i input.mp4 -filter:v "setpts=2*PTS" output_slow.mp4

# Speed up to 2x
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" output_fast.mp4

# Speed with audio (setpts affects video, atempo affects audio)
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" output_fast.mp4
```

### Complete Batch Processing Script (Node.js + fluent-ffmpeg)

```javascript
// batch-process.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Make sure ffmpeg is in PATH or specify path:
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
// ffmpeg.setFfprobePath('/usr/bin/ffprobe');

async function processVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);

    if (options.subtitles) {
      command.videoFilter(`subtitles=${options.subtitles}`);
    }

    if (options.resize) {
      command.videoFilter(`scale=${options.resize}`);
    }

    if (options.normalize) {
      command.audioFilter('loudnorm=I=-24:TP=-2:LRA=7');
    }

    command
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions('-crf', '22')
      .output(outputPath)
      .on('progress', (progress) => {
        console.log(`  Progress: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', () => {
        console.log(`  Completed: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`  Error: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

async function batchProcess(inputDir, outputDir) {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.mp4'));

  console.log(`Processing ${files.length} videos...`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}_processed.mp4`);

    console.log(`Processing: ${file}`);

    await processVideo(inputPath, outputPath, {
      subtitles: './subs.srt',
      resize: '1080:1920',
      normalize: true,
    });
  }

  console.log('All videos processed!');
}

// Usage
batchProcess('./videos_raw', './videos_processed');
```

**Installation:**
```bash
npm install fluent-ffmpeg
```

Sources:
- [FFmpeg Subtitles Guide](https://www.bannerbear.com/blog/how-to-add-subtitles-to-a-video-file-using-ffmpeg/)
- [FFmpeg Batch Processing](https://www.ffmpeg.media/articles/batch-processing-automate-multiple-files)
- [Audio Normalization with loudnorm](https://medium.com/@peter_forgacs/audio-loudness-normalization-with-ffmpeg-1ce7f8567053)
- [FFmpeg Node.js Integration](https://creatomate.com/blog/how-to-use-ffmpeg-in-nodejs)

---

## 5. WHISPER FOR TRANSCRIPTION & SUBTITLES

### OpenAI Whisper Overview

Whisper is a robust automatic speech recognition (ASR) model trained on 680K hours of multilingual and multitask supervised data from the web.

**For Spanish:** Whisper performs well but with caveats - accuracy depends on audio quality and accent. WER (Word Error Rate) for Spanish is ~15-20% on noisy audio.

Sources:
- [OpenAI Whisper Intro](https://openai.com/index/whisper/)
- [Whisper on GitHub](https://github.com/openai/whisper)
- [Spanish Transcription Performance](https://github.com/openai/whisper/discussions/1736)

### Whisper Model Size Comparison

| Model | File Size | VRAM | RAM | Speed (on CPU) | Accuracy | Best For |
|-------|-----------|------|-----|---|----------|----------|
| **tiny** | 75 MB | ~1 GB | 273 MB | 10x real-time | 60% | Fast testing |
| **base** | 142 MB | ~1 GB | 500 MB | 4x real-time | 75% | Podcasts, lectures |
| **small** | 466 MB | ~2 GB | 1.5 GB | 1.5x real-time | 85% | Good balance |
| **medium** | 1.5 GB | ~5 GB | 3.5 GB | 0.5x real-time | 92% | High quality |
| **large** | 2.9 GB | ~10 GB | 5-8 GB | Very slow | 95% | Not practical on 2vCPU |

**For your 2vCPU/8GB VPS:** Use **small** or **base** models. Avoid large/medium unless you have spare capacity.

Sources:
- [Whisper Model Sizes](https://whisper-api.com/blog/models/)
- [Model Size Comparison](https://whishper.net/reference/models/)

### Faster-Whisper (Recommended for VPS)

**Faster-Whisper** is 2-6x faster with less memory than OpenAI's Whisper, using CTranslate2 C++ inference engine.

```bash
pip install faster-whisper

# Quantization support (int8 = 4x faster)
pip install faster-whisper[cuda]
```

```python
# faster_whisper_example.py
from faster_whisper import WhisperModel

# Load model (downloads automatically)
model = WhisperModel("base", device="cpu", compute_type="int8")

# Transcribe Spanish audio
segments, info = model.transcribe(
    "audio.mp3",
    language="es",  # Spanish
    task="transcribe"  # or "translate" for English
)

# Output as SRT
from pysrt import SubRipFile, SubRipItem
from pysrt.arrow import Arrow

srt = SubRipFile()

for i, segment in enumerate(segments, 1):
    item = SubRipItem()
    item.index = i
    item.start = Arrow.fromdatetime(segment.start)
    item.end = Arrow.fromdatetime(segment.end)
    item.content = segment.text.strip()
    srt.append(item)

srt.save("output.srt")
print("Subtitles saved to output.srt")
```

**Performance on 2vCPU/8GB:**
- Base model (int8 quantization): ~0.5x real-time (60 seconds of audio = ~2 minutes processing)
- Small model (int8): ~1-2x real-time (acceptable)

Sources:
- [Faster-Whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- [Faster-Whisper Performance](https://medium.com/@johnidouglasmarangon/build-a-speech-to-text-service-in-python-with-faster-whisper-39ad3b1e2305)

### Whisper.cpp (Lightest Option)

**whisper.cpp** is a C++ port using GGML quantization. Minimal dependencies, ~100MB RAM for small models.

```bash
# Clone and build
git clone https://github.com/ggml-org/whisper.cpp
cd whisper.cpp
make

# Download model
bash models/download-ggml-model.sh base

# Transcribe
./main -m models/ggml-base.bin -l es audio.mp3 -osrt

# Output: audio.srt (SRT subtitles)
```

**Advantages:**
- ~4x faster than faster-whisper on CPU
- Single binary, no Python/CUDA needed
- Works on Raspberry Pi
- GGML quantization: int8 or fp16

**Trade-off:** Slightly less accurate but negligible for business content.

Sources:
- [whisper.cpp GitHub](https://github.com/ggml-org/whisper.cpp)
- [Whisper CPP Guide](https://medium.com/@bhuwanmishra_59371/a-starter-guide-to-whisper-cpp-f238817fd876)

### OpenAI API (Paid, Simplest)

If you don't want to manage local models:

```javascript
// whisper-api.js
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

async function transcribeSpanish(audioPath) {
  const transcript = await openai.createTranscription(
    fs.createReadStream(audioPath),
    'whisper-1',
    undefined,
    'srt',  // Output format: SRT subtitles
    1,      // Temperature for variability
    'es'    // Spanish
  );

  return transcript.data;
}

// Cost: $0.02 per minute of audio
// 30-min video = $0.60
```

### Dual-Language Subtitles (Spanish + English)

```python
# bilingual_subtitles.py
from faster_whisper import WhisperModel
from deepl import translate_text

model = WhisperModel("base", device="cpu", compute_type="int8")

# Transcribe in Spanish
segments_es, _ = model.transcribe("audio.mp3", language="es")

# Translate to English using DeepL
import deepl

translator = deepl.Translator(auth_key="YOUR_DEEPL_KEY")  # Free tier available

srt_es = []
srt_en = []

for i, segment in enumerate(segments_es, 1):
    text_es = segment.text.strip()
    result = translator.translate_text(text_es, source_lang="ES", target_lang="EN-US")
    text_en = result.text

    srt_es.append(f"""{i}
{format_timestamp(segment.start)} --> {format_timestamp(segment.end)}
{text_es}
""")

    srt_en.append(f"""{i}
{format_timestamp(segment.start)} --> {format_timestamp(segment.end)}
{text_en}
""")

# Save both
with open("output_es.srt", "w", encoding="utf-8") as f:
    f.write("\n".join(srt_es))

with open("output_en.srt", "w", encoding="utf-8") as f:
    f.write("\n".join(srt_en))

print("Bilingual subtitles created!")
```

Sources:
- [Faster-Whisper API](https://github.com/SYSTRAN/faster-whisper)
- [DeepL API for Translation](https://www.deepl.com/)
- [Subtitle Translation with DeepL](https://www.assemblyai.com/blog/create-multi-lingual-subtitles-with-assemblyai-and-deepl/)

---

## 6. COMPLETE VIDEO PRODUCTION PIPELINE

### End-to-End Workflow Architecture

```
┌─────────────────────────────────────────────────────────┐
│ INPUT: Script (text)                                    │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  1. TTS (Audio) │ ← Edge-TTS (free) or ElevenLabs
        │ ~2-5 seconds    │
        └────────┬────────┘
                 │
        ┌────────▼──────────┐
        │ 2. Get duration   │ ← FFprobe
        │ Calculate frames  │
        └────────┬──────────┘
                 │
        ┌────────▼─────────────────┐
        │ 3. Remotion rendering    │
        │ (audio + visuals)        │
        │ ~60-120 sec for 30s vid  │
        └────────┬─────────────────┘
                 │
        ┌────────▼──────────────┐
        │ 4. Whisper (optional) │ ← Transcription
        │ Generate captions     │
        │ ~30-60 sec            │
        └────────┬──────────────┘
                 │
        ┌────────▼───────────────────┐
        │ 5. FFmpeg Post-Processing  │
        │ - Burn subtitles          │
        │ - Normalize audio          │
        │ - Resize for platforms     │
        │ ~30-60 seconds             │
        └────────┬───────────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ OUTPUT: Multi-platform videos │
        │ - YouTube Shorts (1080x1920)  │
        │ - Instagram Reels (1080x1920) │
        │ - TikTok (1080x1920)          │
        └───────────────────────────────┘

TOTAL TIME: ~3-5 minutes for 30-second video on 2vCPU/8GB
```

### Complete Automation Script (Node.js + Python)

```javascript
// videoPipeline.js - Main orchestrator
const { spawn } = require('child_process');
const { renderMedia } = require('@remotion/renderer');
const { EdgeTTS } = require('@andresaya/edge-tts');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class VideoPipeline {
  constructor(workDir = './workspace') {
    this.workDir = workDir;
    this.tempDir = path.join(workDir, 'temp');
    this.outputDir = path.join(workDir, 'output');

    // Create directories
    [this.tempDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  async log(message, stage = 'PIPELINE') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${stage}] ${message}`);
  }

  // Step 1: Generate TTS Audio
  async generateAudio(text, lang = 'es-ES-AlvaroNeural') {
    await this.log('Generating TTS audio...', 'TTS');

    const audioPath = path.join(this.tempDir, 'audio.mp3');

    const tts = new EdgeTTS({
      voice: lang,
      rate: 0,
    });

    const audio = await tts.synthesize(text);
    fs.writeFileSync(audioPath, audio);

    await this.log(`Audio saved: ${audioPath}`, 'TTS');
    return audioPath;
  }

  // Step 2: Get audio duration
  async getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) reject(err);
        const duration = metadata.format.duration;
        const fps = 30;
        const durationFrames = Math.ceil(duration * fps);

        this.log(`Audio duration: ${duration.toFixed(2)}s = ${durationFrames} frames`, 'AUDIO');
        resolve({ duration, durationFrames });
      });
    });
  }

  // Step 3: Render video
  async renderVideo(audioPath, durationFrames, title, outputPath) {
    await this.log('Starting Remotion render...', 'REMOTION');

    await renderMedia({
      composition: {
        id: 'BusinessTemplate',
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: durationFrames,
      },
      serveUrl: 'http://localhost:3000',
      outputLocation: outputPath,
      inputProps: {
        title: title,
        audioPath: audioPath,
      },
      onProgress: ({ rendered, total }) => {
        const percent = ((rendered / total) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${rendered}/${total} (${percent}%)`);
      },
    });

    console.log('\n');
    await this.log(`Video rendered: ${outputPath}`, 'REMOTION');
  }

  // Step 4: Generate subtitles
  async generateSubtitles(videoPath) {
    await this.log('Generating subtitles with Whisper...', 'WHISPER');

    // Call Python script for whisper
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        'scripts/whisper_transcribe.py',
        videoPath,
        path.join(this.tempDir, 'subtitles.srt'),
      ]);

      python.on('close', (code) => {
        if (code === 0) {
          const srtPath = path.join(this.tempDir, 'subtitles.srt');
          this.log(`Subtitles created: ${srtPath}`, 'WHISPER');
          resolve(srtPath);
        } else {
          reject(new Error(`Whisper failed with code ${code}`));
        }
      });
    });
  }

  // Step 5: Post-process with FFmpeg
  async postProcess(videoPath, srtPath, outputDir) {
    await this.log('Post-processing with FFmpeg...', 'FFMPEG');

    const results = {};

    // YouTube Shorts (1080x1920)
    const shortsPath = path.join(outputDir, 'video_shorts.mp4');
    await this.ffmpegProcess(videoPath, shortsPath, {
      subtitles: srtPath,
      scale: '1080:1920',
      normalize: true,
    });
    results.shorts = shortsPath;

    // Instagram Reels (1080x1920)
    const reelsPath = path.join(outputDir, 'video_reels.mp4');
    await this.ffmpegProcess(videoPath, reelsPath, {
      subtitles: srtPath,
      scale: '1080:1920',
      normalize: true,
    });
    results.reels = reelsPath;

    // TikTok (1080x1920)
    const tiktokPath = path.join(outputDir, 'video_tiktok.mp4');
    await this.ffmpegProcess(videoPath, tiktokPath, {
      subtitles: srtPath,
      scale: '1080:1920',
      normalize: true,
    });
    results.tiktok = tiktokPath;

    await this.log('Post-processing complete', 'FFMPEG');
    return results;
  }

  async ffmpegProcess(inputPath, outputPath, options) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);

      if (options.subtitles) {
        command.videoFilter(`subtitles=${options.subtitles}`);
      }

      if (options.scale) {
        command.videoFilter(`scale=${options.scale}`);
      }

      if (options.normalize) {
        command.audioFilter('loudnorm=I=-24:TP=-2:LRA=7');
      }

      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions('-crf', '22')
        .output(outputPath)
        .on('progress', (progress) => {
          process.stdout.write(`\r  ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log('\n');
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  // Main pipeline orchestration
  async run(script, title) {
    try {
      console.log('═'.repeat(60));
      console.log('VIDEO PRODUCTION PIPELINE');
      console.log('═'.repeat(60));

      // Step 1
      const audioPath = await this.generateAudio(script);

      // Step 2
      const { durationFrames } = await this.getAudioDuration(audioPath);

      // Step 3
      const videoPath = path.join(this.tempDir, 'video_raw.mp4');
      await this.renderVideo(audioPath, durationFrames, title, videoPath);

      // Step 4
      const srtPath = await this.generateSubtitles(videoPath);

      // Step 5
      const outputs = await this.postProcess(videoPath, srtPath, this.outputDir);

      console.log('\n' + '═'.repeat(60));
      console.log('PIPELINE COMPLETE');
      console.log('═'.repeat(60));
      console.log('Output files:');
      Object.entries(outputs).forEach(([platform, path]) => {
        console.log(`  ${platform}: ${path}`);
      });

      return outputs;
    } catch (error) {
      console.error('Pipeline error:', error.message);
      throw error;
    }
  }
}

// Usage
(async () => {
  const pipeline = new VideoPipeline('./workspace');

  const script = `
    Hola, soy tu asistente de inteligencia artificial.
    Hoy te comparto 3 estrategias para escalar tu negocio.
    Primera: Automatización de procesos.
    Segunda: Análisis de datos.
    Tercera: Optimización de recursos.
  `;

  const outputs = await pipeline.run(script, 'Mi Primer Video de IA');
})();
```

### Companion Whisper Python Script

```python
# scripts/whisper_transcribe.py
import sys
from faster_whisper import WhisperModel

def transcribe_to_srt(audio_path, output_srt_path):
    """Transcribe Spanish audio to SRT subtitles"""

    # Load model (downloads if needed)
    model = WhisperModel("small", device="cpu", compute_type="int8")

    print(f"Transcribing: {audio_path}")

    # Transcribe Spanish audio
    segments, info = model.transcribe(
        audio_path,
        language="es",
        task="transcribe"
    )

    # Write SRT file
    with open(output_srt_path, 'w', encoding='utf-8') as f:
        for i, segment in enumerate(segments, 1):
            start = format_timestamp(segment.start)
            end = format_timestamp(segment.end)
            text = segment.text.strip()

            f.write(f"{i}\n{start} --> {end}\n{text}\n\n")

    print(f"Subtitles saved to: {output_srt_path}")

def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)

    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

if __name__ == "__main__":
    audio_path = sys.argv[1]
    output_path = sys.argv[2]

    transcribe_to_srt(audio_path, output_path)
```

Sources:
- [Video Pipeline Architecture](https://medium.com/@kamaljp/text-to-video-pipeline-python-automation-using-open-ai-models-f4341555c8d9)
- [Automation Workflow](https://flowlu.com/blog/productivity/video-production-workflow/)

---

## 7. DOCKER DEPLOYMENT FOR VIDEO PIPELINE

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  remotion-dev:
    image: node:22-bookworm-slim
    working_dir: /app
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./package.json:/app/package.json
      - ./output:/app/output
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=development
    command: >
      sh -c "npm install &&
             npx remotion browser ensure &&
             npm run dev"

  video-processor:
    build: ./docker/processor
    volumes:
      - ./workspace:/workspace
      - ./scripts:/app/scripts
    environment:
      - FFMPEG_CONCURRENCY=1
      - WHISPER_MODEL=small
    command: python3 /app/scripts/pipeline.py

  whisper:
    image: "jart/whisper"  # Docker image with whisper.cpp
    volumes:
      - ./audio:/audio
      - ./output:/output
    command: >
      /whisper/main
      -m /whisper/models/ggml-small.bin
      -l es
      -osrt
      /audio/input.mp3

services:
  storage:
    image: minio/minio:latest
    volumes:
      - ./minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"

  ffmpeg-worker:
    image: "jrottenberg/ffmpeg:5.0"
    volumes:
      - ./input:/input
      - ./output:/output
      - ./scripts:/scripts
    working_dir: /
    entrypoint: /bin/bash
    command: /scripts/process.sh
```

### Dockerfile for Processing Service

```dockerfile
# docker/processor/Dockerfile
FROM python:3.11-slim-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/ /app/scripts/

# Set resource limits
ENV PYTHONUNBUFFERED=1
ENV OMP_NUM_THREADS=1

CMD ["python3", "/app/scripts/pipeline.py"]
```

### requirements.txt for Python Services

```
faster-whisper==0.10.0
ffmpeg-python==0.2.1
pydub==0.25.1
python-dotenv==1.0.0
requests==2.31.0
```

### Running on Your VPS

```bash
# SSH into VPS
ssh root@your-hostinger-vps

# Clone your video project
git clone https://github.com/yourusername/video-pipeline.git
cd video-pipeline

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create necessary directories
mkdir -p workspace/temp workspace/output scripts

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Run a pipeline render
docker exec video-processor python3 /app/scripts/pipeline.py \
  --script "Tu script aquí" \
  --title "Tu titulo"
```

### Resource Management for 2 vCPU / 8GB

```yaml
# docker-compose.yml - with resource limits
services:
  video-processor:
    build: ./docker/processor
    deploy:
      resources:
        limits:
          cpus: '1.5'        # Use max 1.5 of 2 vCPU
          memory: 5G         # Use max 5GB of 8GB
        reservations:
          cpus: '1'
          memory: 3G
```

Sources:
- [Remotion Docker Guide](https://www.remotion.dev/docs/docker)
- [Docker Compose Video Pipeline](https://www.scotthavird.com/blog/remotion-docker-template/)
- [FFmpeg in Docker](https://oneuptime.com/blog/post/2026-02-08-how-to-run-ffmpeg-in-docker-for-video-processing/)

---

## 8. AUTO-TRANSLATION & MULTI-LANGUAGE SUBTITLES

### SRT File Translation Pipeline

```python
# translate_subtitles.py
import re
from typing import List, Tuple
import requests
import json

class SRTTranslator:
    def __init__(self, deepl_api_key: str):
        """Initialize with DeepL API key"""
        self.api_key = deepl_api_key
        self.deepl_url = "https://api-free.deepl.com/v1/translate"  # Free tier

    def parse_srt(self, srt_path: str) -> List[dict]:
        """Parse SRT file into subtitle objects"""
        subtitles = []

        with open(srt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split by double newline
        blocks = content.strip().split('\n\n')

        for block in blocks:
            lines = block.strip().split('\n')
            if len(lines) >= 3:
                subtitles.append({
                    'index': int(lines[0]),
                    'time': lines[1],  # Keep original timestamps
                    'text': '\n'.join(lines[2:])
                })

        return subtitles

    def translate_text(self, text: str, target_lang: str) -> str:
        """Translate text using DeepL API"""
        payload = {
            'auth_key': self.api_key,
            'text': text,
            'target_lang': target_lang,
        }

        response = requests.post(self.deepl_url, data=payload)
        response.raise_for_status()

        result = response.json()
        return result['translations'][0]['text']

    def translate_srt(
        self,
        input_srt: str,
        output_srt: str,
        target_lang: str = 'EN'  # DeepL language code
    ):
        """Translate entire SRT file"""
        subtitles = self.parse_srt(input_srt)

        print(f"Translating {len(subtitles)} subtitles to {target_lang}...")

        translated = []
        for i, sub in enumerate(subtitles):
            translated_text = self.translate_text(sub['text'], target_lang)

            translated_sub = {
                'index': sub['index'],
                'time': sub['time'],
                'text': translated_text
            }
            translated.append(translated_sub)

            if (i + 1) % 5 == 0:
                print(f"  Translated {i + 1}/{len(subtitles)}")

        # Write translated SRT
        with open(output_srt, 'w', encoding='utf-8') as f:
            for sub in translated:
                f.write(f"{sub['index']}\n{sub['time']}\n{sub['text']}\n\n")

        print(f"Saved to {output_srt}")

# Usage
if __name__ == "__main__":
    import os

    deepl_key = os.getenv("DEEPL_API_KEY")

    translator = SRTTranslator(deepl_key)

    # Translate Spanish to English
    translator.translate_srt(
        'subtitles_es.srt',
        'subtitles_en.srt',
        'EN'
    )

    # Translate Spanish to Portuguese
    translator.translate_srt(
        'subtitles_es.srt',
        'subtitles_pt.srt',
        'PT'
    )
```

### Using Claude API for Premium Translations

```python
# claude_subtitle_translation.py
import os
from anthropic import Anthropic

class ClaudeSubtitleTranslator:
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"

    def translate_subtitle_batch(self, subtitles: list, target_lang: str) -> list:
        """
        Translate multiple subtitles while maintaining context
        (Claude understands context better than word-by-word translation)
        """

        # Join all texts for context
        full_text = ' '.join([s['text'] for s in subtitles])

        prompt = f"""Translate the following Spanish subtitles to {target_lang}.

IMPORTANT:
- Keep the translation natural and conversational
- Maintain the emotional tone
- Keep timing information (I'll add it back)
- Format: Just return the translations, one per line

Subtitles:
{json.dumps([s['text'] for s in subtitles], ensure_ascii=False, indent=2)}"""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        translations = message.content[0].text.strip().split('\n')

        # Reconstruct with timing
        translated = []
        for i, sub in enumerate(subtitles):
            if i < len(translations):
                translated.append({
                    'index': sub['index'],
                    'time': sub['time'],  # Keep original timing
                    'text': translations[i].strip()
                })

        return translated

# Usage with batch processing
translator = ClaudeSubtitleTranslator(os.getenv("ANTHROPIC_API_KEY"))

# Parse Spanish SRT
subtitles_es = parse_srt('subtitles_es.srt')

# Translate to English
subtitles_en = translator.translate_subtitle_batch(subtitles_es, "English")

# Write output
write_srt('subtitles_en.srt', subtitles_en)
```

### Dual-Language Video with FFmpeg

```bash
# Create video with both Spanish and English subtitles
# (Users can select which subtitle track to display)

ffmpeg -i video.mp4 \
  -i subtitles_es.srt \
  -i subtitles_en.srt \
  -c:v copy \
  -c:a copy \
  -c:s mov_text \
  -metadata:s:s:0 language=spa \
  -metadata:s:s:1 language=eng \
  output_dual.mp4
```

Sources:
- [DeepL API for Translation](https://www.deepl.com/)
- [SRT Subtitle Translation Tools](https://github.com/destrangis/srttranslate)
- [Subtitle Translation Guide](https://www.assemblyai.com/blog/create-multi-lingual-subtitles-with-assemblyai-and-deepl/)

---

## 9. N8N INTEGRATION (Optional Automation)

If you want to trigger video generation from webhooks or schedules using N8N:

### N8N Workflow for Video Generation

```json
{
  "nodes": [
    {
      "name": "Webhook: New Video Request",
      "type": "webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "video-request",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Read Script Data",
      "type": "set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": {
            "script": "={{ $json.body.script }}",
            "title": "={{ $json.body.title }}",
            "language": "={{ $json.body.language || 'es-ES-AlvaroNeural' }}"
          }
        }
      }
    },
    {
      "name": "Execute Command: Render Video",
      "type": "executeCommand",
      "position": [650, 300],
      "parameters": {
        "command": "cd /app && node render.js --script='{{ $node[\"Read Script Data\"].json.script }}' --title='{{ $node[\"Read Script Data\"].json.title }}'"
      }
    },
    {
      "name": "Upload to Cloudinary",
      "type": "cloudinary",
      "position": [850, 300],
      "parameters": {
        "operation": "upload",
        "file": "={{ $node[\"Execute Command: Render Video\"].json.outputPath }}"
      }
    }
  ]
}
```

**Limitations on N8N for video processing:**
- Execute Command node disabled by default (security)
- Large file transfers can timeout
- Better to call your pipeline via HTTP API

**Recommended approach:** Expose a REST API endpoint that N8N can call:

```javascript
// api.js - Express server for video generation
const express = require('express');
const { VideoPipeline } = require('./pipeline');

const app = express();
app.use(express.json());

const pipeline = new VideoPipeline();

app.post('/api/generate-video', async (req, res) => {
  const { script, title, language } = req.body;

  try {
    res.json({ status: 'processing', jobId: Date.now() });

    // Run pipeline asynchronously
    const outputs = await pipeline.run(script, title, language);

    console.log('Video generation complete:', outputs);
  } catch (error) {
    console.error('Pipeline error:', error);
  }
});

app.listen(3333, () => {
  console.log('API listening on port 3333');
});
```

Then in N8N, use HTTP node to POST to `http://your-vps:3333/api/generate-video`.

Sources:
- [N8N Execute Command](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/)
- [N8N Binary Data](https://docs.n8n.io/data/binary-data/)

---

## 10. RESOURCE REQUIREMENTS & COST ANALYSIS

### Memory & CPU Usage by Component

| Component | Model | CPU | RAM | Time (30s video) |
|-----------|-------|-----|-----|---|
| TTS | Edge-TTS | 0.2 vCPU | 100 MB | 5 sec |
| Remotion | Default | 1.5 vCPU | 4-5 GB | 120 sec |
| Whisper | small/int8 | 1.0 vCPU | 1.5 GB | 45 sec |
| FFmpeg | H.264 | 0.8 vCPU | 500 MB | 60 sec |
| **TOTAL** | **Combined** | **~3.5 vCPU (sequential)** | **~6 GB** | **~230 sec (~4 min)** |

**For 2 vCPU/8GB VPS:** Run components **sequentially**, not in parallel.

### Monthly Cost Breakdown (Estimated)

**Hostinger KVM2 (2vCPU/8GB):** ~$15-20/month

**TTS Costs (for 40 videos/month @ 300 words each):**
- Edge-TTS: $0
- OpenAI TTS: ~$18/month ($0.015 per 1000 chars)
- ElevenLabs: ~$80/month

**Transcription (Whisper):**
- Self-hosted (CPU): $0 (already in VPS)
- OpenAI Whisper API: ~$24/month (40 videos × 30 sec × $0.02/min)

**Translation (optional):**
- DeepL Free tier: $0 (500K chars/month)
- Claude API: ~$5/month (for 40 videos × 2000 chars)

**CDN/Storage (optional, if storing videos off-site):**
- Cloudinary free tier: $0 (25GB/month)
- AWS S3 egress: ~$10-20/month

**TOTAL MONTHLY:**
- Minimum (free TTS + self-hosted): ~$20 (VPS only)
- Optimal (OpenAI TTS + self-hosted Whisper): ~$40-60
- Premium (ElevenLabs + OpenAI Whisper): ~$110-130

### Single Video Rendering Timeline

```
Input: "Hola, soy tu asistente..."
  ↓ [5 sec] TTS Generation
Audio file (MP3)
  ↓ [2 sec] Duration calc
Calculate frames: 900 frames @ 30fps
  ↓ [120 sec] Remotion Render
Raw video (1080x1920)
  ↓ [45 sec] Whisper transcription
SRT subtitles
  ↓ [60 sec] FFmpeg processing (3 versions)
Output: video_shorts.mp4, video_reels.mp4, video_tiktok.mp4

TOTAL: ~4 minutes for complete workflow
(Suitable for batch processing multiple videos overnight)
```

### Performance Optimization Tips for 2vCPU/8GB

1. **Reduce Remotion concurrency to 1** (avoid memory thrashing)
2. **Use quality=70 instead of 100** (saves ~30% rendering time)
3. **Process videos sequentially** (queue system)
4. **Pre-render audio** (don't render TTS for each attempt)
5. **Use smaller Whisper model** (base instead of small)
6. **Enable FFmpeg GPU if available** (but likely not on Hostinger KVM2)

---

## 11. SPECIFIC RECOMMENDATIONS FOR ARMANDO

### For armandointeligencia.com (Spanish business content)

**Recommended Stack:**

1. **TTS:** Edge-TTS (free, decent quality) or OpenAI Mini ($0.60 per million chars)
   - Spanish voice: `es-ES-AlvaroNeural` (professional, neutral accent)

2. **Video Generation:** Remotion with custom business template
   - 1080x1920 vertical (YouTube Shorts/Reels/TikTok)
   - Animated text, gradient backgrounds, professional fonts
   - 30 second videos (900 frames @ 30fps)

3. **Transcription:** Faster-Whisper (small model, int8 quantized)
   - Runs on CPU, ~45 seconds per 30-second video
   - Spanish accuracy: ~85-90% (good enough for business)

4. **Post-processing:** FFmpeg batch script
   - Burn Spanish subtitles
   - Normalize audio to -24 LUFS
   - Generate 3 platform versions (Shorts/Reels/TikTok)

5. **Hosting:** Current Hostinger KVM2
   - Runs complete pipeline in ~4 minutes per video
   - Can process 30+ videos per day if queued at night

### Estimated Monthly Output

**Video capacity:** 40-50 fully produced videos per month
- 1-2 per day (run at 11 PM - 3 AM, automatic publishing at 6 AM)
- Each video: 2-3 minutes rendering + captions + multi-format

**Cost:** $20-40/month (VPS + free TTS)

**Time investment:**
- 2 hours/day script writing
- 0 hours for rendering/editing (fully automated)

### Implementation Roadmap

**Week 1-2:** Setup
- Deploy Remotion on VPS
- Create business video template
- Install FFmpeg, Whisper.cpp

**Week 3:** Integration
- Build Node.js automation script
- Create Edge-TTS integration
- Setup Whisper transcription

**Week 4:** Launch
- Generate first 10 test videos
- Optimize render times
- Setup scheduled renders

**Ongoing:** Content production
- Write scripts (main time investment)
- Let automation handle video generation
- Publish to YouTube Shorts, Instagram Reels, TikTok

---

## USEFUL RESOURCES & LINKS

### Official Documentation
- [Remotion Official Docs](https://www.remotion.dev/docs/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [ElevenLabs API](https://elevenlabs.io/docs/api-reference/introduction)

### GitHub Repositories
- [Remotion](https://github.com/remotion-dev/remotion)
- [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper)
- [whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- [edge-tts Node.js](https://github.com/andresayac/edge-tts)

### Community & Tutorials
- [Remotion Templates](https://github.com/reactvideoeditor/remotion-templates)
- [RemotionTemplates.dev](https://remotiontemplates.dev/)
- [Remotion YouTube Tutorials](https://www.youtube.com/results?search_query=remotion+tutorial)
- [FFmpeg Video Editing Guide](https://www.ffmpeg.media/)

### Tools & Services
- [DeepL Translation](https://www.deepl.com/)
- [Cloudinary (CDN/Storage)](https://cloudinary.com/)
- [N8N Automation](https://n8n.io/)

---

## CONCLUSION

Building an automated video production pipeline for your Spanish business content is **absolutely feasible** on Hostinger KVM2. The complete stack (TTS → Remotion → Whisper → FFmpeg) can produce 1-2 polished videos per day with **zero manual editing**.

**Key takeaway:** Invest in **script writing** (the most important step), let **automation handle rendering**, and focus on **content strategy** for your audience.

The technology is mature, proven, and affordable. Your competitive advantage will be consistent, high-quality content at scale—something most business creators can't match.

---

**Document prepared for:** Armando (armandointeligencia.com)
**Platform:** Hostinger VPS KVM2 (2 vCPU, 8GB RAM)
**Target audience:** Spanish-speaking business leaders
**Last updated:** March 2026
