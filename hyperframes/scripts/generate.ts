#!/usr/bin/env node
/**
 * Hyperframes-side video factory CLI.
 * Mirrors the Remotion CLI flags so the same script can be run through both engines for comparison.
 *
 *   tsx hyperframes/scripts/generate.ts --script "..." --voice "..." --template explainer --platforms youtube
 *
 * Pipeline:
 *   1. Edge-TTS (shared with Remotion side) → audio.mp3 + approximate word timings
 *   2. faster-whisper (optional) → accurate word timings
 *   3. Fill chosen template HTML with placeholders → hyperframes/index.html
 *   4. hyperframes render → raw_video.mp4
 *   5. FFmpeg normalize + multi-platform export (shared with Remotion side)
 */
import { program } from "commander";
import { execa } from "execa";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exportMultiPlatform, normalizeAudio } from "../../src/ffmpeg/commands.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HYPERFRAMES_DIR = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(HYPERFRAMES_DIR, "..");

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

function getUvPath(): string {
  const homeUv = path.join(process.env.HOME || "", ".local", "bin", "uv");
  if (fs.existsSync(homeUv)) return homeUv;
  return "uv";
}

function getHyperframesBin(): string {
  const local = path.join(HYPERFRAMES_DIR, "node_modules/.bin/hyperframes");
  if (fs.existsSync(local)) return local;
  return "hyperframes";
}

program
  .name("hyperframes-generate")
  .description("Armando Inteligencia · Hyperframes side of the video factory")
  .requiredOption("-s, --script <text>", "Script text to narrate")
  .option("-v, --voice <voice>", "Edge-TTS voice name", "es-MX-JorgeNeural")
  .option(
    "-t, --template <template>",
    "Template (explainer|talking-head|listicle|quote|vertical)",
    "explainer",
  )
  .option("-p, --platforms <platforms>", "Comma-separated platforms", "youtube")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option("--fps <fps>", "Video FPS", "30")
  .option("--rate <rate>", "Speech rate (e.g. +20%)", "+0%")
  .option("--pitch <pitch>", "Pitch adjustment", "+0Hz")
  .option("--whisper", "Use faster-whisper for accurate word timings (default on)", true)
  .option("--no-whisper", "Skip whisper — use approximate TTS timings only")
  .option("--whisper-model <size>", "Whisper model: tiny|base|small|medium|large-v3", "small")
  .option("--language <code>", "Audio language code", "es")
  .option("--title <title>", "Composition title (auto-derived from script if omitted)")
  .option("--author <name>", "Quote author (quote template only)", "Anónimo")
  .option("--name-tag <name>", "TalkingHead name tag", "Armando Inteligencia")
  .option("--items <json>", "Listicle items JSON (overrides newline split)")
  .option("--seconds-per-item <sec>", "Listicle seconds per item", "5")
  .parse();

const opts = program.opts();
const fps = parseInt(opts.fps);

const outputDir = path.resolve(opts.output);
fs.mkdirSync(outputDir, { recursive: true });

console.log("\n╔══════════════════════════════════════╗");
console.log("║   AI Video Factory · Hyperframes     ║");
console.log("╚══════════════════════════════════════╝");
console.log(`  Template:  ${opts.template}`);
console.log(`  Voice:     ${opts.voice}`);
console.log(`  Platforms: ${opts.platforms}`);
console.log(`  Output:    ${outputDir}`);
console.log("");

const startTime = Date.now();
const uv = getUvPath();

try {
  // ─── Stage 1: TTS ────────────────────────────────────────
  log("TTS", `Generating audio with voice ${opts.voice}...`);
  const ttsResult = await execa(uv, [
    "run", "python", path.join(PROJECT_ROOT, "src/tts/generate.py"),
    "generate",
    "--text", opts.script,
    "--voice", opts.voice,
    "--rate", opts.rate,
    "--pitch", opts.pitch,
    "--output-dir", outputDir,
    "--fps", String(fps),
  ], { cwd: PROJECT_ROOT });

  const ttsData = JSON.parse(ttsResult.stdout);
  const audioFile = path.join(outputDir, "audio.mp3");
  log("TTS", `Generated ${ttsData.wordCount} words → ${audioFile}`);

  // ─── Stage 1.5: Whisper ──────────────────────────────────
  let wordTimings: Array<{ text: string; startSeconds: number; endSeconds: number; startFrame: number; endFrame: number }> =
    ttsData.words || [];
  let timingSource: "tts-approximate" | "whisper" = "tts-approximate";

  if (opts.whisper !== false) {
    log("Whisper", `Transcribing with ${opts.whisperModel} model (first run downloads ~500MB)...`);
    try {
      const wResult = await execa(uv, [
        "run", "python", path.join(PROJECT_ROOT, "src/transcribe/transcribe.py"),
        "--input", audioFile,
        "--model", opts.whisperModel,
        "--language", opts.language,
        "--fps", String(fps),
      ], { cwd: PROJECT_ROOT });
      const wData = JSON.parse(wResult.stdout);
      if (wData.words?.length) {
        wordTimings = wData.words;
        timingSource = "whisper";
        log("Whisper", `Replaced TTS timings with ${wData.wordCount} whisper-derived timings`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log("Whisper", `Failed (${msg.slice(0, 100)}…) — falling back to TTS approximate timings`);
    }
  } else {
    log("Whisper", "Skipped (--no-whisper). Using TTS approximate timings.");
  }

  fs.writeFileSync(
    path.join(outputDir, "word_timings_final.json"),
    JSON.stringify({ source: timingSource, words: wordTimings }, null, 2),
  );

  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 10;
  log("Pipeline", `Audio duration: ${audioDuration.toFixed(1)}s · timing source: ${timingSource}`);

  // ─── Stage 2: Prepare composition ────────────────────────
  // Copy audio into hyperframes/ so the rendered HTML can reference it
  const hfAudio = path.join(HYPERFRAMES_DIR, "audio.mp3");
  fs.copyFileSync(audioFile, hfAudio);

  // Pick template
  const templatePath = path.join(HYPERFRAMES_DIR, "templates", `${opts.template}.html`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Unknown template "${opts.template}". Available: explainer, talking-head, listicle, quote, vertical`,
    );
  }
  let html = fs.readFileSync(templatePath, "utf-8");

  // Auto-derive title if not provided
  const title =
    opts.title ||
    opts.script.split(/[.,;\n]/)[0].slice(0, 80).trim() ||
    "Armando Inteligencia";

  // Build listicle items
  let items: Array<{ number: number; title: string; description: string }> = [];
  if (opts.items) {
    items = JSON.parse(opts.items);
  } else if (opts.template === "listicle") {
    const lines = opts.script.split("\n").map((l: string) => l.trim()).filter(Boolean);
    items = lines.slice(1).map((line: string, i: number) => ({
      number: i + 1,
      title: line,
      description: "",
    }));
  }

  // Fill placeholders
  const replacements: Record<string, string> = {
    "{{DURATION_SECONDS}}": audioDuration.toFixed(2),
    "{{TITLE}}": escapeHtml(title),
    "{{AUDIO_FILENAME}}": "audio.mp3",
    "{{WORD_TIMINGS_JSON}}": JSON.stringify(wordTimings),
    "{{NAME_TAG}}": escapeHtml(opts.nameTag),
    "{{ITEMS_JSON}}": JSON.stringify(items),
    "{{SECONDS_PER_ITEM}}": String(opts.secondsPerItem),
    "{{QUOTE_TEXT}}": escapeHtml(opts.script),
    "{{AUTHOR}}": escapeHtml(opts.author),
  };
  for (const [key, val] of Object.entries(replacements)) {
    html = html.split(key).join(val);
  }

  fs.writeFileSync(path.join(HYPERFRAMES_DIR, "index.html"), html);
  log("Compose", `index.html written (template=${opts.template}, duration=${audioDuration.toFixed(1)}s)`);

  // ─── Stage 3: Hyperframes render ─────────────────────────
  log("Render", "Running hyperframes render...");
  const rawVideoFile = path.join(outputDir, "raw_video.mp4");
  const hfBin = getHyperframesBin();
  await execa(hfBin, [
    "render",
    "-o", rawVideoFile,
    "--fps", String(fps),
  ], { cwd: HYPERFRAMES_DIR, stdio: "inherit" });
  log("Render", `Raw video → ${rawVideoFile}`);

  // ─── Stage 4: FFmpeg normalize ───────────────────────────
  log("FFmpeg", "Normalizing audio...");
  const normalizedFile = path.join(outputDir, "normalized.mp4");
  await normalizeAudio(rawVideoFile, normalizedFile);
  log("FFmpeg", `Normalized → ${normalizedFile}`);

  // ─── Stage 5: Multi-platform export ──────────────────────
  log("Export", `Exporting to ${opts.platforms}...`);
  const baseName = `video_${Date.now()}_hf`;
  const platforms = opts.platforms.split(",").map((s: string) => s.trim());
  const exports = await exportMultiPlatform({
    input: normalizedFile,
    outputDir,
    baseName,
    platforms: platforms as Array<"youtube" | "tiktok" | "reels" | "square">,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ Hyperframes pipeline complete in ${elapsed}s`);
  console.log(`  Duration:      ${audioDuration.toFixed(1)}s`);
  console.log(`  Words:         ${wordTimings.length}`);
  console.log(`  Timing source: ${timingSource}`);
  console.log("  Files:");
  for (const [key, val] of Object.entries(exports)) {
    console.log(`    ${key.padEnd(10)} ${val}`);
  }
} catch (err) {
  console.error("\n✗ Hyperframes pipeline failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
