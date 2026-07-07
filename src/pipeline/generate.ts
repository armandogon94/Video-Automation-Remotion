#!/usr/bin/env node
/**
 * CLI entry point — AI Video Factory
 * Usage: npx tsx src/pipeline/generate.ts --script "text" --voice "es-MX-JorgeNeural" --template explainer
 */
import { program } from "commander";
import path from "path";
import { runPipeline } from "./pipeline.js";

program
  .name("generate")
  .description("AI Video Factory — Generate videos from text scripts")
  .requiredOption("-s, --script <text>", "Script text to narrate")
  .option("-v, --voice <voice>", "Edge-TTS voice name", "es-MX-JorgeNeural")
  .option(
    "-t, --template <template>",
    "Video template (explainer|talking-head|listicle|quote|quote-card|tech-news-flash|diagram-explainer|quote-card-9x16|big-number-hero|split-webcam-screen)",
    "explainer",
  )
  .option("-p, --platforms <platforms>", "Comma-separated platforms", "youtube")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option("--fps <fps>", "Video FPS", "30")
  .option("--rate <rate>", "Speech rate (e.g. +20%)", "+0%")
  .option("--pitch <pitch>", "Pitch adjustment (e.g. +10Hz)", "+0Hz")
  .option("--whisper", "Use faster-whisper for accurate word timings (default: on)", true)
  .option("--no-whisper", "Skip whisper transcription — use approximate TTS timings only")
  .option("--whisper-model <size>", "Whisper model: tiny|base|small|medium|large-v3 (owner default medium — better Spanish brand names)", "medium")
  .option("--language <code>", "Audio language code for whisper", "es")
  // ─── Vertical-9x16 template options ────────────────────────────────
  .option("--palette <mode>", "Palette mode for cream/dark templates: cream|dark", "cream")
  // BigNumberHero9x16
  .option("--number <text>", "BigNumberHero: the hero figure (e.g. \"15×\", \"+47%\")")
  .option("--kicker <text>", "BigNumberHero: small uppercase eyebrow above the number")
  .option("--subtitle <text>", "BigNumberHero: one-line context under the number")
  .option("--caption <text>", "BigNumberHero: small caption under the subtitle")
  // QuoteCard9x16
  .option("--quote <text>", "QuoteCard9x16: the quote body (defaults to --script if omitted)")
  .option("--author <text>", "QuoteCard9x16: author attribution")
  .option("--author-role <text>", "QuoteCard9x16: author role/title")
  // DiagramExplainer9x16
  .option("--nodes <json>", "DiagramExplainer: JSON array of {title, sublabel?, ghosted?} (defaults to 3-node template)")
  .option("--section-label <text>", "DiagramExplainer: top section label")
  // SplitWebcamScreen9x16
  .option("--webcam-image <pathOrUrl>", "SplitWebcamScreen: webcam image (path or URL)")
  .option("--screen-image <pathOrUrl>", "SplitWebcamScreen: screen recording image (path or URL)")
  .parse();

const opts = program.opts();

console.log("\n╔══════════════════════════════════════╗");
console.log("║       AI Video Factory               ║");
console.log("╚══════════════════════════════════════╝\n");
console.log(`  Template:  ${opts.template}`);
console.log(`  Voice:     ${opts.voice}`);
console.log(`  Platforms: ${opts.platforms}`);
console.log(`  Output:    ${opts.output}`);
console.log(`  Script:    "${opts.script.substring(0, 60)}${opts.script.length > 60 ? "..." : ""}"`);
console.log("");

const startTime = Date.now();

// Parse --nodes JSON if provided.
let parsedNodes: unknown = undefined;
if (opts.nodes) {
  try {
    parsedNodes = JSON.parse(opts.nodes);
  } catch (err) {
    console.error("\n✗ Failed to parse --nodes JSON:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

try {
  const result = await runPipeline({
    script: opts.script,
    voice: opts.voice,
    template: opts.template,
    platforms: opts.platforms.split(",").map((s: string) => s.trim()),
    outputDir: path.resolve(opts.output),
    fps: parseInt(opts.fps, 10),
    rate: opts.rate,
    pitch: opts.pitch,
    useWhisper: opts.whisper !== false,
    whisperModel: opts.whisperModel,
    language: opts.language,
    templateOptions: {
      palette: opts.palette === "dark" ? "dark" : "cream",
      number: opts.number,
      kicker: opts.kicker,
      subtitle: opts.subtitle,
      caption: opts.caption,
      quote: opts.quote,
      author: opts.author,
      authorRole: opts.authorRole,
      nodes: parsedNodes,
      sectionLabel: opts.sectionLabel,
      webcamImageUrl: opts.webcamImage,
      screenImageUrl: opts.screenImage,
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ Pipeline complete in ${elapsed}s`);
  console.log(`  Duration: ${result.durationSeconds.toFixed(1)}s`);
  console.log(`  Words: ${result.wordTimings.length}`);
  console.log("  Files:");
  for (const [key, val] of Object.entries(result.exports)) {
    console.log(`    ${key}: ${val}`);
  }
} catch (error) {
  console.error("\n✗ Pipeline failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
