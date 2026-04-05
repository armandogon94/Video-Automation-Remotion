/**
 * Pipeline orchestrator — runs all stages sequentially.
 * Script → TTS → Remotion Render → (optional: Transcribe) → FFmpeg Export
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import { exportMultiPlatform, normalizeAudio, extractThumbnail } from "../ffmpeg/commands.js";

export interface PipelineConfig {
  script: string;
  voice: string;
  template: string;
  platforms: string[];
  outputDir: string;
  fps: number;
  rate: string;
  pitch: string;
}

export interface PipelineResult {
  audioFile: string;
  rawVideoFile: string;
  normalizedFile: string;
  exports: Record<string, string>;
  wordTimings: unknown[];
  durationSeconds: number;
}

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

// Resolve uv binary path
function getUvPath(): string {
  const homeUv = path.join(process.env.HOME || "", ".local", "bin", "uv");
  if (fs.existsSync(homeUv)) return homeUv;
  return "uv";
}

export async function runPipeline(config: PipelineConfig): Promise<PipelineResult> {
  const {
    script, voice, template, platforms, outputDir, fps, rate, pitch,
  } = config;
  const projectRoot = path.resolve(import.meta.dirname, "../..");
  const uv = getUvPath();

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // ─── Stage 1: TTS ────────────────────────────────────────
  log("TTS", `Generating audio with voice ${voice}...`);
  const ttsResult = await execa(uv, [
    "run", "python", path.join(projectRoot, "src/tts/generate.py"),
    "generate",
    "--text", script,
    "--voice", voice,
    "--rate", rate,
    "--pitch", pitch,
    "--output-dir", outputDir,
    "--fps", String(fps),
  ], { cwd: projectRoot });

  const ttsData = JSON.parse(ttsResult.stdout);
  const audioFile = path.join(outputDir, "audio.mp3");
  log("TTS", `Generated ${ttsData.wordCount} words → ${audioFile}`);

  // Copy audio to public/ for Remotion's staticFile() to access
  const publicDir = path.join(projectRoot, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioPath = path.join(publicDir, "audio.mp3");
  fs.copyFileSync(audioFile, publicAudioPath);
  const remotionAudioRef = "audio.mp3"; // relative to public/

  // Calculate duration from word timings
  const wordTimings = ttsData.words || [];
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 10;
  const durationInFrames = Math.ceil(audioDuration * fps);
  log("TTS", `Audio duration: ${audioDuration.toFixed(1)}s (${durationInFrames} frames)`);

  // ─── Stage 2: Remotion Render ────────────────────────────
  log("Render", `Bundling Remotion project...`);
  await ensureBrowser();

  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src/index.ts"),
  });
  log("Render", "Bundle ready");

  // Map template name to composition ID
  const compositionMap: Record<string, string> = {
    explainer: "ExplainerVideo",
    "talking-head": "TalkingHead",
    listicle: "Listicle",
    quote: "QuoteCard",
  };
  const compositionId = compositionMap[template] || "ExplainerVideo";

  // Build input props based on template
  const inputProps = buildProps(template, {
    script,
    audioUrl: remotionAudioRef,
    wordTimings,
    fps,
  });

  log("Render", `Rendering ${compositionId} (${durationInFrames} frames)...`);
  const rawVideoFile = path.join(outputDir, "raw_video.mp4");

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  // Override duration based on audio
  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
    },
    serveUrl,
    codec: "h264",
    outputLocation: rawVideoFile,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        log("Render", `${Math.round(progress * 100)}%`);
      }
    },
  });
  log("Render", `Raw video → ${rawVideoFile}`);

  // ─── Stage 3: Audio Normalization ────────────────────────
  log("FFmpeg", "Normalizing audio...");
  const normalizedFile = path.join(outputDir, "normalized.mp4");
  await normalizeAudio(rawVideoFile, normalizedFile);
  log("FFmpeg", `Normalized → ${normalizedFile}`);

  // ─── Stage 4: Multi-Platform Export ──────────────────────
  log("Export", `Exporting to ${platforms.join(", ")}...`);
  const baseName = `video_${Date.now()}`;
  const exports = await exportMultiPlatform({
    input: normalizedFile,
    outputDir,
    baseName,
    platforms: platforms as Array<"youtube" | "tiktok" | "reels" | "square">,
  });

  log("Export", "All exports complete:");
  for (const [platform, filePath] of Object.entries(exports)) {
    log("Export", `  ${platform}: ${filePath}`);
  }

  return {
    audioFile,
    rawVideoFile,
    normalizedFile,
    exports,
    wordTimings,
    durationSeconds: audioDuration,
  };
}

function buildProps(
  template: string,
  data: { script: string; audioUrl: string; wordTimings: unknown[]; fps: number },
): Record<string, unknown> {
  const base = {
    audioUrl: data.audioUrl,
    wordTimings: data.wordTimings,
    captions: {
      enabled: true,
      fontSize: 36,
      color: "#ffffff",
      highlightColor: "#ffd700",
      position: "bottom" as const,
      backgroundColor: "rgba(0,0,0,0.7)",
    },
  };

  switch (template) {
    case "talking-head":
      return {
        ...base,
        title: "",
        script: data.script,
        speakerImageUrl: "",
        backgroundColor: "#0a0a0a",
        nameTag: "",
        nameTagColor: "#ffd700",
      };
    case "listicle":
      // Parse script into list items (split by newlines)
      const lines = data.script.split("\n").filter(Boolean);
      return {
        ...base,
        title: lines[0] || "Lista",
        items: lines.slice(1).map((line, i) => ({
          number: i + 1,
          title: line,
          description: "",
        })),
        backgroundColor: "#0f0c29",
        gradientTo: "#302b63",
        accentColor: "#ffd700",
        textColor: "#ffffff",
        secondsPerItem: 5,
      };
    case "quote":
      return {
        ...base,
        quote: data.script,
        author: "",
        backgroundColor: "#1a1a2e",
        quoteColor: "#ffffff",
        authorColor: "#ffd700",
        fontFamily: "Georgia, serif",
      };
    case "explainer":
    default:
      return {
        ...base,
        title: "",
        script: data.script,
        backgroundColor: "#1a1a2e",
        gradientTo: "#16213e",
        accentColor: "#ffd700",
        textColor: "#ffffff",
        fontFamily: "Inter, sans-serif",
      };
  }
}
