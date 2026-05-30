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
import { BRAND } from "../brand/index.js";

export interface PipelineConfig {
  script: string;
  voice: string;
  template: string;
  platforms: string[];
  outputDir: string;
  fps: number;
  rate: string;
  pitch: string;
  useWhisper: boolean;
  whisperModel: string;
  language: string;
  /** Template-specific options (mostly for the vertical 9x16 templates). */
  templateOptions?: TemplateOptions;
}

export interface TemplateOptions {
  palette?: "cream" | "dark";
  // BigNumberHero
  number?: string;
  kicker?: string;
  subtitle?: string;
  caption?: string;
  // QuoteCard9x16
  quote?: string;
  author?: string;
  authorRole?: string;
  // DiagramExplainer
  nodes?: unknown;
  sectionLabel?: string;
  // SplitWebcamScreen
  webcamImageUrl?: string;
  screenImageUrl?: string;
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
    useWhisper, whisperModel, language,
  } = config;
  const templateOptions: TemplateOptions = config.templateOptions ?? {};
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

  // ─── Stage 1.5: Whisper transcription (accurate word timings) ────
  let wordTimings = ttsData.words || [];
  let timingSource: "tts-approximate" | "whisper" = "tts-approximate";

  if (useWhisper) {
    log("Whisper", `Transcribing audio with ${whisperModel} model (first run ~500MB download)...`);
    try {
      const whisperResult = await execa(uv, [
        "run", "python", path.join(projectRoot, "src/transcribe/transcribe.py"),
        "--input", audioFile,
        "--model", whisperModel,
        "--language", language,
        "--fps", String(fps),
      ], { cwd: projectRoot });

      const whisperData = JSON.parse(whisperResult.stdout);
      if (whisperData.words && whisperData.words.length > 0) {
        wordTimings = whisperData.words;
        timingSource = "whisper";
        log("Whisper", `Replaced ${ttsData.wordCount} TTS timings with ${whisperData.wordCount} whisper-derived timings`);
      } else {
        log("Whisper", "Empty word list — falling back to TTS approximate timings");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log("Whisper", `Failed (${msg.slice(0, 120)}…) — falling back to TTS approximate timings`);
    }
  } else {
    log("Whisper", "Skipped (--no-whisper). Using TTS approximate timings.");
  }

  // Write final word timings (the ones actually used by Remotion) for inspection
  fs.writeFileSync(
    path.join(outputDir, "word_timings_final.json"),
    JSON.stringify({ source: timingSource, words: wordTimings }, null, 2),
  );

  // Copy audio to public/ for Remotion's staticFile() to access
  const publicDir = path.join(projectRoot, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioPath = path.join(publicDir, "audio.mp3");
  fs.copyFileSync(audioFile, publicAudioPath);
  const remotionAudioRef = "audio.mp3"; // relative to public/

  // Calculate duration from word timings
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 10;
  const durationInFrames = Math.ceil(audioDuration * fps);
  log("Pipeline", `Audio duration: ${audioDuration.toFixed(1)}s (${durationInFrames} frames) · timing source: ${timingSource}`);

  // ─── Stage 2: Remotion Render ────────────────────────────
  log("Render", `Bundling Remotion project...`);
  await ensureBrowser();

  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src/index.ts"),
  });
  log("Render", "Bundle ready");

  // Map template name to composition ID. For cream/dark vertical templates we resolve
  // the palette suffix here so the dispatcher table stays simple.
  const palette: "cream" | "dark" = templateOptions.palette === "dark" ? "dark" : "cream";
  const darkSuffix = palette === "dark" ? "Dark" : "";

  const compositionMap: Record<string, string> = {
    // Existing landscape templates (unchanged behavior).
    explainer: "ExplainerVideo",
    "talking-head": "TalkingHead",
    listicle: "Listicle",
    quote: "QuoteCard",
    // Existing landscape `quote-card` alias for the legacy QuoteCard composition.
    "quote-card": "QuoteCard",
    // Existing vertical news-flash template (wired into CLI here).
    "tech-news-flash": "TechNewsFlash9x16",
    // ─── New vertical 9x16 templates ─────────────────────────────────
    "diagram-explainer": `DiagramExplainer9x16${darkSuffix}`,
    "quote-card-9x16": `QuoteCard9x16${darkSuffix}`,
    "big-number-hero": `BigNumberHero9x16${darkSuffix}`,
    // SplitWebcamScreen9x16 has a single palette variant — ignore --palette here.
    "split-webcam-screen": "SplitWebcamScreen9x16",
  };
  const compositionId = compositionMap[template] || "ExplainerVideo";

  // Build input props based on template
  const inputProps = buildProps(template, {
    script,
    audioUrl: remotionAudioRef,
    wordTimings,
    fps,
    options: templateOptions,
    palette,
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
  data: {
    script: string;
    audioUrl: string;
    wordTimings: unknown[];
    fps: number;
    options: TemplateOptions;
    palette: "cream" | "dark";
  },
): Record<string, unknown> {
  const base = {
    audioUrl: data.audioUrl,
    wordTimings: data.wordTimings,
    captions: {
      enabled: true,
      fontSize: 36,
      color: BRAND.colors.textLight,
      highlightColor: BRAND.colors.accent,
      position: "bottom" as const,
      backgroundColor: "rgba(15,27,45,0.75)",
    },
    watermark: {
      enabled: true,
      logo: "avatar" as const,
      position: "bottom-right" as const,
      size: 96,
      opacity: 0.9,
    },
  };

  // Vertical-9x16 templates share an editorial color-override shape.
  const editorialBase = {
    audioUrl: data.audioUrl,
    wordTimings: data.wordTimings,
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 40,
    showCaptions: true,
    palette: data.palette,
  };

  switch (template) {
    case "talking-head":
      return {
        ...base,
        title: "",
        script: data.script,
        speakerImageUrl: "",
        backgroundColor: BRAND.colors.backgroundDark,
        nameTag: BRAND.name,
        nameTagColor: BRAND.colors.accent,
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
        backgroundColor: BRAND.colors.primary,
        gradientTo: BRAND.colors.backgroundDark,
        accentColor: BRAND.colors.accent,
        textColor: BRAND.colors.textLight,
        secondsPerItem: 5,
      };
    case "quote":
    case "quote-card":
      return {
        ...base,
        quote: data.script,
        author: "",
        backgroundColor: BRAND.colors.backgroundDark,
        quoteColor: BRAND.colors.textLight,
        authorColor: BRAND.colors.accent,
        fontFamily: "Georgia, serif",
      };
    case "tech-news-flash":
      // The TechNewsFlash9x16 composition is overlay-driven; without a brief there's
      // no good auto-mapping from a single script string to overlays. We feed audio +
      // word timings and let it render with empty overlays (the user is expected to
      // either edit `templates/tech-news-flash.json` to seed overlays in a follow-up,
      // or use the dedicated render scripts in `scripts/`).
      return {
        audioUrl: data.audioUrl,
        wordTimings: data.wordTimings,
        overlays: [],
        paperColor: "#FAF7F2",
        inkColor: "#1A1A1A",
        accentColor: "#B33A2A",
        mutedColor: "#6B6760",
        captionFontSize: 48,
        useHeroTransitions: false,
      };
    case "diagram-explainer": {
      const defaultNodes = [
        { title: "Escribes una función", sublabel: "$ you" },
        { title: "Claude invoca al subagente", sublabel: "auto · proactive" },
        { title: "Reviewer lee y analiza", sublabel: "Read · Grep · Glob", ghosted: true },
      ];
      const nodes = Array.isArray(data.options.nodes) ? data.options.nodes : defaultNodes;
      return {
        ...editorialBase,
        sectionLabel: data.options.sectionLabel ?? "EL FLUJO",
        breadcrumb: { text: "Claude Code", date: "Subagents" },
        nodes,
        sequenceStepSeconds: 1.4,
        firstNodeDelaySeconds: 0.4,
        captionFontSize: 44,
        showWatermark: false,
      };
    }
    case "quote-card-9x16":
      return {
        ...editorialBase,
        quote: data.options.quote ?? data.script,
        author: data.options.author ?? "Peter Drucker",
        authorRole: data.options.authorRole,
        breadcrumb: { text: "Anthropic", date: "On Creativity" },
      };
    case "big-number-hero":
      return {
        ...editorialBase,
        number: data.options.number ?? "15×",
        kicker: data.options.kicker ?? "GEMINI 3.2 FLASH",
        subtitle: data.options.subtitle ?? "más barato que GPT-5.5",
        caption: data.options.caption,
        countUp: false,
        breadcrumb: { text: "Google", date: "Filtración" },
      };
    case "split-webcam-screen":
      // Single-palette template — force cream defaults for color overrides.
      return {
        ...editorialBase,
        palette: "cream" as const,
        webcamImageUrl: data.options.webcamImageUrl ?? "",
        screenImageUrl: data.options.screenImageUrl ?? "",
        callouts: [],
        breadcrumb: { text: "Midu.dev", date: "Reaction" },
      };
    case "explainer":
    default:
      return {
        ...base,
        title: "",
        script: data.script,
        backgroundColor: BRAND.colors.primary,
        gradientTo: BRAND.colors.backgroundDark,
        accentColor: BRAND.colors.accent,
        textColor: BRAND.colors.textLight,
        fontFamily: "Inter, sans-serif",
      };
  }
}
