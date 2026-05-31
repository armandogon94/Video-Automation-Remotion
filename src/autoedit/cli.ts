#!/usr/bin/env node
/**
 * autoedit CLI — "give me a talking-head video, get an EditPlan."
 *
 * Usage:
 *   npx tsx src/autoedit/cli.ts --video <path> --aspect 16:9 [options]
 *
 * Pipeline (this scaffold):
 *   1. probe duration (ffprobe)
 *   2. detect silences (ffmpeg silencedetect)        → keep-segments → EditSegment[]
 *   3. transcribe (faster-whisper via uv)            → SOURCE-time word timings
 *        · SKIPPED when --register none (ADR-002 §3.3 — no captions ⇒ no whisper)
 *   4. buildEditPlan(...)                            → validated EditPlan
 *   5. write <out> JSON
 *
 * DEFERRED (documented stub, NOT run here — see ADR-003 §5 / §6):
 *   6. render-from-plan: feed the EditPlan to SpeakerOverlayScene{16x9,9x16}
 *      + an overlay registry. `--render` only prints the intended next step.
 *
 * No edits to src/pipeline/generate.ts — wiring point documented in ADR-003 §6.
 */
import { program } from "commander";
import { execa } from "execa";
import fs from "fs";
import path from "path";

import { detectSilences, keepSegmentsFromSilences, toEditSegments } from "./silenceTrim.js";
import { buildEditPlan } from "./buildEditPlan.js";
import { editPlanWordSchema, type EditPlanWord, type EditPlanAspect } from "./editPlan.js";

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function log(stage: string, msg: string): void {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

/** Resolve uv binary (same convention as src/pipeline/pipeline.ts). */
function getUvPath(): string {
  const homeUv = path.join(process.env.HOME ?? "", ".local", "bin", "uv");
  return fs.existsSync(homeUv) ? homeUv : "uv";
}

/** Probe media duration in seconds via ffprobe. */
async function probeDurationSeconds(input: string): Promise<number> {
  const res = await execa("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    input,
  ]);
  const seconds = parseFloat((res.stdout ?? "").trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(
      `Could not read a valid duration from "${input}" via ffprobe (got "${res.stdout}"). Is the file a valid media file?`,
    );
  }
  return seconds;
}

/**
 * Transcribe via the existing faster-whisper wrapper and return SOURCE-time
 * words in the EditPlan word shape. Reuses src/transcribe/transcribe.py exactly
 * as the main pipeline does.
 */
async function transcribe(
  video: string,
  projectRoot: string,
  model: string,
  language: string,
  fps: number,
): Promise<EditPlanWord[]> {
  const uv = getUvPath();
  const res = await execa(
    uv,
    [
      "run", "python", path.join(projectRoot, "src/transcribe/transcribe.py"),
      "--input", video,
      "--model", model,
      "--language", language,
      "--fps", String(fps),
    ],
    { cwd: projectRoot },
  );
  const data: unknown = JSON.parse(res.stdout);
  const words = (data as { words?: unknown[] }).words ?? [];
  // Validate each word against the shared shape (drops anything malformed).
  return words
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => r.data);
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI definition
// ─────────────────────────────────────────────────────────────────────────────

program
  .name("autoedit")
  .description("Auto-edit a talking-head video into an EditPlan (transcribe → silence-trim → overlay-suggest)")
  .requiredOption("--video <path>", "Source talking-head video")
  .option("--aspect <ratio>", "16:9 | 9:16", "16:9")
  .option("--transcript <json>", "Pre-computed whisper JSON (skips the transcribe step)")
  .option("--out <path>", "EditPlan JSON output path", "./output/editplan.json")
  .option("--fps <fps>", "Timeline FPS", "30")
  .option("--register <reg>", "Caption register: punchy|editorial|technical|none (ADR-002)", "editorial")
  .option("--position <pos>", "Caption position: bottom-center|center|top|custom", "bottom-center")
  .option("--whisper-model <size>", "Whisper model: tiny|base|small|medium|large-v3", "small")
  .option("--language <code>", "Audio language for whisper", "es")
  .option("--silence-db <db>", "silencedetect noise floor (dB, negative)", "-30")
  .option("--min-silence <sec>", "Minimum silence to trim (seconds)", "0.5")
  .option("--no-trim", "Skip silence-trim (keep the whole clip as one segment)")
  .option("--render", "(stub) Print the deferred render-from-plan next step and exit")
  .parse();

async function main(): Promise<void> {
  const opts = program.opts();
  const projectRoot = path.resolve(import.meta.dirname, "../..");

  const video = path.resolve(opts.video);
  const aspect = (opts.aspect === "9:16" ? "9:16" : "16:9") as EditPlanAspect;
  const fps = parseInt(opts.fps, 10);
  const register = ["punchy", "editorial", "technical", "none"].includes(opts.register)
    ? opts.register
    : "editorial";
  const position = ["bottom-center", "center", "top", "custom"].includes(opts.position)
    ? opts.position
    : "bottom-center";
  const outPath = path.resolve(opts.out);

  if (!fs.existsSync(video)) {
    console.error(`\n✗ Source video not found: ${video}`);
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║       AI Video Factory — autoedit    ║");
  console.log("╚══════════════════════════════════════╝\n");
  log("autoedit", `video=${video}`);
  log("autoedit", `aspect=${aspect} fps=${fps} register=${register} position=${position}`);

  // ── 1. duration ──────────────────────────────────────────────────────────
  const durationSeconds = await probeDurationSeconds(video);
  const sourceDurationFrames = Math.ceil(durationSeconds * fps);
  log("probe", `duration=${durationSeconds.toFixed(2)}s (${sourceDurationFrames} frames)`);

  // ── 2. silence-trim ────────────────────────────────────────────────────────
  let segments = [];
  if (opts.trim === false) {
    // --no-trim: one segment spanning the whole clip.
    segments = toEditSegments(
      [{ startSeconds: 0, endSeconds: durationSeconds }],
      fps,
    );
    log("silence", "skipped (--no-trim): 1 segment for the whole clip");
  } else {
    const silences = await detectSilences(video, {
      thresholdDb: parseFloat(opts.silenceDb),
      minSilenceSeconds: parseFloat(opts.minSilence),
    });
    const keeps = keepSegmentsFromSilences(silences, durationSeconds);
    segments = toEditSegments(keeps, fps);
    const trimmedFrames = sourceDurationFrames - (segments[segments.length - 1]?.editEndFrame ?? 0);
    log(
      "silence",
      `${silences.length} silence(s) → ${segments.length} kept segment(s); trimmed ~${(trimmedFrames / fps).toFixed(2)}s of dead air`,
    );
  }

  // ── 3. transcribe (skipped when register === 'none') ───────────────────────
  let sourceWords: EditPlanWord[] = [];
  if (register === "none") {
    log("whisper", "skipped (register=none → no captions, ADR-002 §3.3)");
  } else if (opts.transcript) {
    const tj: unknown = JSON.parse(fs.readFileSync(path.resolve(opts.transcript), "utf-8"));
    const raw = (tj as { words?: unknown[] }).words ?? [];
    sourceWords = raw
      .map((w) => editPlanWordSchema.safeParse(w))
      .filter((r): r is { success: true; data: EditPlanWord } => r.success)
      .map((r) => r.data);
    log("whisper", `loaded ${sourceWords.length} word timings from --transcript`);
  } else {
    log("whisper", `transcribing with '${opts.whisperModel}' model (first run downloads the model)...`);
    sourceWords = await transcribe(video, projectRoot, opts.whisperModel, opts.language, fps);
    log("whisper", `transcribed ${sourceWords.length} words`);
  }

  // ── 4. build the plan ───────────────────────────────────────────────────────
  const plan = buildEditPlan({
    sourceVideo: video,
    aspect,
    fps,
    sourceDurationFrames,
    segments,
    sourceWords,
    caption: { register, position, mode: "karaoke" },
  });
  log("plan", `caption words=${plan.captionTrack.wordTimings.length} · overlays=${plan.overlayTrack.length} · editDuration=${(plan.editDurationFrames / fps).toFixed(2)}s`);

  // ── 5. write ──────────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  log("write", `EditPlan → ${outPath}`);

  // ── 6. render-from-plan (DEFERRED stub) ────────────────────────────────────
  if (opts.render) {
    console.log("\n[render] DEFERRED (ADR-003 §5/§6). The render step will:");
    console.log("  · ffmpeg-concat the kept segments into a trimmed base video,");
    console.log("  · feed EditPlan.captionTrack to FloatingCaption (already built),");
    console.log("  · resolve EditPlan.overlayTrack[].type through an overlay registry");
    console.log("    (src/autoedit/overlayRegistry — TODO) into the SpeakerOverlayScene overlay slot,");
    console.log("  · render via @remotion/renderer (see src/pipeline/render.ts).");
    console.log("  Not executed in this scaffold.\n");
  }

  console.log("\n✓ autoedit complete.\n");
}

main().catch((err) => {
  console.error("\n✗ autoedit failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
