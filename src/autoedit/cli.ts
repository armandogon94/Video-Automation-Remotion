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
 * RENDER (Part 2 — now REAL, see ADR-003 §6):
 *   6. render-from-plan: ffmpeg-trim the KEEP segments into a downscaled base clip
 *      staged under public/autoedit/, then render SpeakerOverlayScene{16x9,9x16}
 *      over it with caption/overlay/layout props built from the EditPlan, writing
 *      output/autoedit/<slug>-edit.mp4. Triggered by `--render`.
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
import { renderEditedVideo, type CaptionStyle } from "./renderFromPlan.js";

const CAPTION_STYLES: readonly CaptionStyle[] = [
  "classic", "hormozi-pop", "box-highlight", "editorial-cyan",
  "condensed-hype", "slide-clean", "blur-premium", "type-terminal",
];

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
  .option("--whisper-model <size>", "Whisper model: tiny|base|small|medium|large-v3 (owner default medium — better Spanish brand names; large-v3 only with loop-watch)", "medium")
  .option("--language <code>", "Audio language for whisper", "es")
  .option("--silence-db <db>", "silencedetect noise floor (dB, negative)", "-30")
  .option("--min-silence <sec>", "Minimum silence to trim (seconds)", "0.5")
  .option("--no-trim", "Skip silence-trim (keep the whole clip as one segment)")
  .option("--render", "Render the EditPlan to a finished MP4 (ffmpeg-trim + SpeakerOverlayScene)")
  .option("--caption-style <style>", "FloatingCaption preset: editorial-cyan|hormozi-pop|classic|… (with --render)", "editorial-cyan")
  .option("--handle <handle>", "Brand handle chip ('' hides it) (with --render)")
  .option("--slug <slug>", "Output slug for staged clip + final MP4 (with --render); defaults to the source filename")
  .option("--no-self-eval", "Skip the post-render self-eval QA pass (duration check + cut contact sheet)")
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
    const keeps = keepSegmentsFromSilences(silences, durationSeconds, {
      log: (m) => log("silence", m),
    });
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

  // ── 6. render-from-plan (REAL — Part 2) ────────────────────────────────────
  if (opts.render) {
    const captionStyle: CaptionStyle = CAPTION_STYLES.includes(opts.captionStyle)
      ? (opts.captionStyle as CaptionStyle)
      : "editorial-cyan";
    const slug =
      typeof opts.slug === "string" && opts.slug.length > 0
        ? opts.slug
        : path.basename(video).replace(/\.[^.]+$/, "");

    log("render", `ffmpeg-trim + SpeakerOverlayScene render (style=${captionStyle}, slug=${slug})...`);
    const result = await renderEditedVideo({
      plan,
      projectRoot,
      slug,
      captionStyle,
      handle: opts.handle,
      // commander maps `--no-self-eval` → opts.selfEval === false.
      selfEval: opts.selfEval !== false,
      log: (m) => log("render", m),
    });
    log("render", `staged clip  → ${result.stagedClipPath}`);
    log("render", `final video  → ${result.outputPath}`);
    log("render", `composition=${result.compositionId} frames=${result.durationInFrames} time=${result.elapsedSeconds.toFixed(1)}s`);
  }

  console.log("\n✓ autoedit complete.\n");
}

main().catch((err) => {
  console.error("\n✗ autoedit failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
