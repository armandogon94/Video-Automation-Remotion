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
  .option("-t, --template <template>", "Video template (explainer|talking-head|listicle|quote)", "explainer")
  .option("-p, --platforms <platforms>", "Comma-separated platforms", "youtube")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option("--fps <fps>", "Video FPS", "30")
  .option("--rate <rate>", "Speech rate (e.g. +20%)", "+0%")
  .option("--pitch <pitch>", "Pitch adjustment (e.g. +10Hz)", "+0Hz")
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

try {
  const result = await runPipeline({
    script: opts.script,
    voice: opts.voice,
    template: opts.template,
    platforms: opts.platforms.split(",").map((s: string) => s.trim()),
    outputDir: path.resolve(opts.output),
    fps: parseInt(opts.fps),
    rate: opts.rate,
    pitch: opts.pitch,
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
