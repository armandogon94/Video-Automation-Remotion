# Implementation Quick Start
## Ready-to-Use Code for Armando's Video Pipeline

---

## PART 1: Remotion Template (Ready to Copy)

### File: `src/BusinessTemplate.tsx`

```tsx
import React from 'react';
import {
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
  AbsoluteFill,
  Img,
  staticFile,
} from 'remotion';

interface BusinessTemplateProps {
  headline: string;
  subtitle?: string;
  bodyCopy: string;
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

const BusinessTemplate: React.FC<BusinessTemplateProps> = ({
  headline,
  subtitle = '',
  bodyCopy,
  accentColor = '#00d4ff',
  backgroundColor = '#0a0e27',
  backgroundImage,
}) => {
  const frame = useCurrentFrame();

  // Fade in headline (0-30 frames)
  const headlineOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slide in subtitle (20-50 frames)
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleScale = interpolate(frame, [20, 50], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade in body copy (40-70 frames)
  const bodyOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Background Image (if provided) */}
      {backgroundImage && (
        <Img
          src={backgroundImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${backgroundColor}00 0%, ${backgroundColor}ff 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '60px 40px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          color: 'white',
          gap: '30px',
        }}
      >
        {/* Headline */}
        <h1
          style={{
            fontSize: '54px',
            fontWeight: 'bold',
            margin: 0,
            opacity: headlineOpacity,
            color: accentColor,
            letterSpacing: '-1px',
            lineHeight: '1.2',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {headline}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '24px',
              fontWeight: '500',
              opacity: subtitleOpacity,
              transform: `scale(${subtitleScale})`,
              color: '#aaa',
              maxWidth: '600px',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Body Copy */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: '400',
            opacity: bodyOpacity,
            maxWidth: '600px',
            lineHeight: '1.6',
            color: '#ddd',
            marginTop: '20px',
          }}
        >
          {bodyCopy}
        </p>

        {/* Accent Line */}
        <div
          style={{
            width: '80px',
            height: '4px',
            backgroundColor: accentColor,
            borderRadius: '2px',
            marginTop: '30px',
            opacity: headlineOpacity,
          }}
        />
      </div>

      {/* Watermark/Logo (bottom-right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          fontSize: '14px',
          color: accentColor,
          opacity: 0.5,
          fontFamily: 'monospace',
        }}
      >
        armandointeligencia.com
      </div>
    </AbsoluteFill>
  );
};

// Export Composition for Remotion
export const MyCompositions = () => {
  return (
    <>
      <Composition
        id="BusinessVideo"
        component={BusinessTemplate}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          headline: 'Transformación Digital',
          subtitle: 'Estrategias para tu negocio',
          bodyCopy:
            'Automatiza tus procesos, escala tu empresa y lidera el mercado con inteligencia artificial.',
          accentColor: '#00d4ff',
          backgroundColor: '#0a0e27',
        }}
      />
    </>
  );
};

export default MyCompositions;
```

---

## PART 2: Complete Automation Script

### File: `pipeline.js`

```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const { renderMedia, getCompositions } = require('@remotion/renderer');
const { EdgeTTS } = require('@andresaya/edge-tts');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Configuration
const CONFIG = {
  WORKSPACE: './workspace',
  TEMP_DIR: './workspace/temp',
  OUTPUT_DIR: './workspace/output',
  REMOTION_PORT: 3000,
  VIDEO_FPS: 30,
  VIDEO_WIDTH: 1080,
  VIDEO_HEIGHT: 1920,
  QUALITY: 70, // 0-100, lower = faster
};

class VideoPipeline {
  constructor() {
    this.ensureDirectories();
  }

  ensureDirectories() {
    [CONFIG.TEMP_DIR, CONFIG.OUTPUT_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, stage = 'PIPELINE') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${stage}] ${message}`);
  }

  // ============================================
  // Step 1: Generate Spanish TTS Audio
  // ============================================
  async generateTTSAudio(text, voiceId = 'es-ES-AlvaroNeural') {
    this.log('Generating TTS audio...', 'TTS');

    const audioPath = path.join(CONFIG.TEMP_DIR, 'audio.mp3');

    try {
      const tts = new EdgeTTS({
        voice: voiceId,
        rate: 0, // Normal speed
      });

      const audioBuffer = await tts.synthesize(text);
      fs.writeFileSync(audioPath, audioBuffer);

      this.log(`Audio generated: ${audioPath}`, 'TTS');
      return audioPath;
    } catch (error) {
      this.log(`TTS Error: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // ============================================
  // Step 2: Get Audio Duration
  // ============================================
  async getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          this.log(`FFprobe Error: ${err.message}`, 'ERROR');
          reject(err);
          return;
        }

        const duration = metadata.format.duration;
        const durationFrames = Math.ceil(duration * CONFIG.VIDEO_FPS);

        this.log(
          `Audio duration: ${duration.toFixed(2)}s = ${durationFrames} frames`,
          'AUDIO'
        );

        resolve({ duration, durationFrames });
      });
    });
  }

  // ============================================
  // Step 3: Render Video with Remotion
  // ============================================
  async renderVideo(
    compositionId,
    props,
    durationFrames,
    outputPath
  ) {
    this.log(`Rendering ${compositionId}...`, 'REMOTION');

    try {
      await renderMedia({
        composition: {
          id: compositionId,
          width: CONFIG.VIDEO_WIDTH,
          height: CONFIG.VIDEO_HEIGHT,
          fps: CONFIG.VIDEO_FPS,
          durationInFrames: durationFrames,
          props: props,
        },
        serveUrl: `http://localhost:${CONFIG.REMOTION_PORT}`,
        outputLocation: outputPath,
        quality: CONFIG.QUALITY,
        onProgress: ({ rendered, total }) => {
          const percent = ((rendered / total) * 100).toFixed(1);
          process.stdout.write(
            `\r  Rendering: ${rendered}/${total} frames (${percent}%)`
          );
        },
      });

      console.log('\n');
      this.log(`Video rendered successfully`, 'REMOTION');
      return outputPath;
    } catch (error) {
      this.log(`Rendering Error: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // ============================================
  // Step 4: Generate Subtitles with Whisper
  // ============================================
  async generateSubtitles(videoPath) {
    this.log('Generating subtitles with Whisper...', 'WHISPER');

    const srtPath = path.join(CONFIG.TEMP_DIR, 'subtitles.srt');

    return new Promise((resolve, reject) => {
      // Call Python whisper script
      const python = spawn('python3', [
        'scripts/whisper_transcribe.py',
        videoPath,
        srtPath,
      ]);

      let errorOutput = '';

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          this.log(`Subtitles created: ${srtPath}`, 'WHISPER');
          resolve(srtPath);
        } else {
          this.log(`Whisper failed: ${errorOutput}`, 'ERROR');
          reject(new Error(`Whisper exited with code ${code}`));
        }
      });
    });
  }

  // ============================================
  // Step 5: Post-Process with FFmpeg
  // ============================================
  async postProcessWithFFmpeg(videoPath, srtPath) {
    this.log('Post-processing video...', 'FFMPEG');

    const outputs = {};
    const platforms = [
      {
        name: 'shorts',
        scale: '1080:1920',
        preset: 'fast',
      },
      {
        name: 'reels',
        scale: '1080:1920',
        preset: 'fast',
      },
      {
        name: 'tiktok',
        scale: '1080:1920',
        preset: 'fast',
      },
    ];

    for (const platform of platforms) {
      const outputPath = path.join(
        CONFIG.OUTPUT_DIR,
        `video_${platform.name}.mp4`
      );

      await this.ffmpegProcess(videoPath, outputPath, {
        subtitles: srtPath,
        scale: platform.scale,
        preset: platform.preset,
        normalize: true,
      });

      outputs[platform.name] = outputPath;
    }

    return outputs;
  }

  ffmpegProcess(inputPath, outputPath, options) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);

      // Apply filters
      const filters = [];

      if (options.scale) {
        filters.push(`scale=${options.scale}`);
      }

      if (options.subtitles) {
        filters.push(`subtitles=${options.subtitles}`);
      }

      if (filters.length > 0) {
        command.videoFilter(filters.join(','));
      }

      if (options.normalize) {
        command.audioFilter('loudnorm=I=-24:TP=-2:LRA=7');
      }

      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .preset(options.preset || 'veryfast')
        .outputOptions('-crf', '22')
        .output(outputPath)
        .on('progress', (progress) => {
          process.stdout.write(`\r  Progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log('\n');
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }

  // ============================================
  // Main Pipeline Orchestration
  // ============================================
  async run(script, title, options = {}) {
    console.log('\n' + '═'.repeat(70));
    console.log('AUTOMATED VIDEO PRODUCTION PIPELINE');
    console.log('═'.repeat(70) + '\n');

    const startTime = Date.now();

    try {
      // Step 1: Generate Audio
      const audioPath = await this.generateTTSAudio(
        script,
        options.voice || 'es-ES-AlvaroNeural'
      );

      // Step 2: Get Duration
      const { durationFrames } = await this.getAudioDuration(audioPath);

      // Step 3: Render Video
      const videoPath = path.join(CONFIG.TEMP_DIR, 'video_raw.mp4');

      await this.renderVideo('BusinessVideo', {
        headline: title,
        subtitle: options.subtitle || '',
        bodyCopy: script,
        accentColor: options.accentColor || '#00d4ff',
        backgroundColor: options.backgroundColor || '#0a0e27',
      }, durationFrames, videoPath);

      // Step 4: Generate Subtitles
      const srtPath = await this.generateSubtitles(videoPath);

      // Step 5: Post-Process
      const outputs = await this.postProcessWithFFmpeg(videoPath, srtPath);

      // Calculate total time
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Print results
      console.log('\n' + '═'.repeat(70));
      console.log('PIPELINE COMPLETE');
      console.log('═'.repeat(70));
      console.log(`Total time: ${totalTime} seconds\n`);
      console.log('Output files:');
      Object.entries(outputs).forEach(([platform, filePath]) => {
        const size = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
        console.log(`  ${platform.padEnd(10)}: ${filePath} (${size} MB)`);
      });
      console.log('\n');

      return outputs;
    } catch (error) {
      this.log(`FATAL ERROR: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  }
}

// ============================================
// CLI Interface
// ============================================
if (require.main === module) {
  const args = require('yargs')
    .option('script', {
      alias: 's',
      describe: 'Video script (Spanish text)',
      type: 'string',
      demandOption: true,
    })
    .option('title', {
      alias: 't',
      describe: 'Video title/headline',
      type: 'string',
      demandOption: true,
    })
    .option('subtitle', {
      describe: 'Optional subtitle',
      type: 'string',
    })
    .option('voice', {
      alias: 'v',
      describe: 'Spanish voice (es-ES-AlvaroNeural, es-MX-JorgeNeural, etc)',
      type: 'string',
      default: 'es-ES-AlvaroNeural',
    })
    .option('accentColor', {
      describe: 'Accent color (hex)',
      type: 'string',
      default: '#00d4ff',
    }).argv;

  const pipeline = new VideoPipeline();

  pipeline.run(args.script, args.title, {
    subtitle: args.subtitle,
    voice: args.voice,
    accentColor: args.accentColor,
  });
}

module.exports = VideoPipeline;
```

---

## PART 3: Python Whisper Script

### File: `scripts/whisper_transcribe.py`

```python
#!/usr/bin/env python3

import sys
import os
from faster_whisper import WhisperModel

def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def transcribe_to_srt(audio_path, output_srt_path):
    """Transcribe Spanish audio to SRT subtitles using Whisper"""

    print(f"Loading Whisper model... (first time will download ~500MB)", flush=True)

    # Load faster-whisper small model
    # Use int8 quantization for CPU speed (4x faster)
    model = WhisperModel("small", device="cpu", compute_type="int8")

    print(f"Transcribing: {audio_path}", flush=True)

    # Transcribe in Spanish
    segments, info = model.transcribe(
        audio_path,
        language="es",  # Spanish
        task="transcribe",
        beam_size=1,  # Single beam for CPU speed
    )

    # Collect segments and write SRT
    srt_content = []
    segment_count = 0

    for segment in segments:
        segment_count += 1
        start = format_timestamp(segment.start)
        end = format_timestamp(segment.end)
        text = segment.text.strip()

        srt_line = f"{segment_count}\n{start} --> {end}\n{text}\n"
        srt_content.append(srt_line)

        print(f"  [{segment_count}] {start} --> {end}")
        print(f"       {text}")

    # Write SRT file
    with open(output_srt_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(srt_content))

    print(f"\nSubtitles saved: {output_srt_path}")
    print(f"Total segments: {segment_count}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python whisper_transcribe.py <audio_path> <output_srt>")
        sys.exit(1)

    audio_path = sys.argv[1]
    output_srt = sys.argv[2]

    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found: {audio_path}")
        sys.exit(1)

    transcribe_to_srt(audio_path, output_srt)
```

---

## PART 4: Installation & Setup

### File: `setup.sh`

```bash
#!/bin/bash

echo "Setting up video pipeline..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Installing Python 3..."
    sudo apt-get install -y python3 python3-pip
fi

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "Installing FFmpeg..."
    sudo apt-get install -y ffmpeg
fi

# Create directories
mkdir -p workspace/temp workspace/output scripts

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

# Install Remotion browser
echo "Installing Chromium for Remotion..."
npx remotion browser ensure

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install faster-whisper pysrt ffmpeg-python

echo "Setup complete!"
echo ""
echo "To start Remotion dev server: npm run dev"
echo "To render a video: node pipeline.js --script \"Your script here\" --title \"Your title\""
```

---

## PART 5: Usage Examples

### Example 1: Basic Video Generation

```bash
# Make scripts executable
chmod +x pipeline.js setup.sh scripts/whisper_transcribe.py

# Install dependencies (one-time)
./setup.sh

# Start Remotion dev server in background
npm run dev &

# Wait for server to start (5 seconds)
sleep 5

# Generate a video
node pipeline.js \
  --script "Hola, bienvenido a mi canal de inteligencia artificial. Hoy te comparto 3 estrategias para escalar tu negocio. Primera: Automatiza tus procesos. Segunda: Analiza tus datos. Tercera: Optimiza tus recursos." \
  --title "3 Estrategias para tu Negocio" \
  --subtitle "Liderazgo Digital"
```

### Example 2: Different Spanish Voices

```bash
# Argentine Spanish
node pipeline.js \
  --script "Tu script aquí..." \
  --title "Mi Video" \
  --voice "es-AR-ElenaNeural"

# Mexican Spanish
node pipeline.js \
  --script "Tu script aquí..." \
  --title "Mi Video" \
  --voice "es-MX-JorgeNeural"

# Castilian (Spain)
node pipeline.js \
  --script "Tu script aquí..." \
  --title "Mi Video" \
  --voice "es-ES-AlvaroNeural"
```

### Example 3: Custom Colors

```bash
node pipeline.js \
  --script "Tu contenido..." \
  --title "Mi Video Premium" \
  --accentColor "#ff6600" \
  --voice "es-ES-AlvaroNeural"
```

### Example 4: Batch Processing

```bash
#!/bin/bash
# batch_render.sh

declare -a scripts=(
  "Script número 1"
  "Script número 2"
  "Script número 3"
)

declare -a titles=(
  "Título 1"
  "Título 2"
  "Título 3"
)

for i in ${!scripts[@]}; do
  echo "Rendering video $((i+1))..."
  node pipeline.js \
    --script "${scripts[$i]}" \
    --title "${titles[$i]}"
done

echo "All videos complete!"
```

---

## PART 6: Package.json

```json
{
  "name": "video-pipeline",
  "version": "1.0.0",
  "description": "Automated video production for Spanish business content",
  "main": "pipeline.js",
  "scripts": {
    "dev": "remotion studio",
    "render": "node pipeline.js",
    "build": "npm run render"
  },
  "dependencies": {
    "remotion": "4.0.441",
    "@remotion/cli": "4.0.441",
    "@remotion/renderer": "4.0.441",
    "@andresaya/edge-tts": "^3.0.0",
    "fluent-ffmpeg": "^2.1.2",
    "yargs": "^17.7.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

---

## TROUBLESHOOTING

### "Chrome Headless Shell not found"
```bash
npx remotion browser ensure
```

### "FFmpeg not found"
```bash
sudo apt-get install -y ffmpeg
# Verify:
ffmpeg -version
```

### "Whisper model download fails"
```bash
# Download manually
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small')"
```

### "Permission denied" errors
```bash
chmod +x *.js *.sh scripts/*.py
```

### High memory usage during rendering
```bash
# Reduce concurrency to 1:
# In pipeline.js, change:
quality: CONFIG.QUALITY,
# to:
concurrency: 1,
```

---

## NEXT STEPS

1. **Clone or create the files above**
2. **Run `./setup.sh` to install dependencies**
3. **Start with `node pipeline.js` for a test video**
4. **Customize the template for your brand**
5. **Build automation (cron, n8n, or scheduling)**

Good luck with automating your video production!
