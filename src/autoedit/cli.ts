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

import {
  detectSilences,
  keepSegmentsFromSilences,
  snapKeepsToWordOnsets,
  toEditSegments,
  type KeepSpan,
} from "./silenceTrim.js";
import { buildEditPlan, evaluateTranscriptCoverage } from "./buildEditPlan.js";
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
/** Words + whole-file confidence extracted from a whisper JSON payload. */
interface TranscriptData {
  words: EditPlanWord[];
  /** faster-whisper's language-detection confidence (0..1); null when the
   *  payload lacks it (Sol 0716 §2.1: this was read and DISCARDED before). */
  languageProbability: number | null;
}

/** Parse a whisper JSON payload (live wrapper stdout OR a precomputed
 *  --transcript file — SAME shape, SAME validation; Sol 0716 §2.1 overturned
 *  the --transcript path skipping all quality checks). */
function parseTranscriptPayload(data: unknown): TranscriptData {
  const obj = data as { words?: unknown[]; languageProbability?: unknown };
  const words = (obj.words ?? [])
    // Validate each word against the shared shape (drops anything malformed).
    // `probability` is part of the shape (optional) so whisper confidence is
    // RETAINED, not stripped (GPT56-FINDINGS §2.4).
    .map((w) => editPlanWordSchema.safeParse(w))
    .filter((r): r is { success: true; data: EditPlanWord } => r.success)
    .map((r) => r.data);
  const languageProbability =
    typeof obj.languageProbability === "number" ? obj.languageProbability : null;
  return { words, languageProbability };
}

async function transcribe(
  video: string,
  projectRoot: string,
  model: string,
  language: string,
  fps: number,
  hotwords?: string,
  glossaryFile?: string,
): Promise<TranscriptData> {
  const uv = getUvPath();
  const args = [
    "run", "python", path.join(projectRoot, "src/transcribe/transcribe.py"),
    "--input", video,
    "--model", model,
    "--language", language,
    "--fps", String(fps),
  ];
  // Vocabulary bias via faster-whisper hotwords (GPT56-FINDINGS §2.4): explicit
  // --hotwords wins over --glossary-file (transcribe.py enforces the same).
  if (hotwords) args.push("--hotwords", hotwords);
  if (glossaryFile) args.push("--glossary-file", path.resolve(glossaryFile));
  const res = await execa(uv, args, { cwd: projectRoot });
  return parseTranscriptPayload(JSON.parse(res.stdout));
}

/** Below this language-detection confidence the whole transcript is suspect
 *  (wrong-language decode produces fluent nonsense at decent word probs). */
const LANGUAGE_PROBABILITY_SUSPECT_THRESHOLD = 0.6;

/**
 * Post-transcription hallucination heuristic (GPT56-FINDINGS §2.4; Sol 0716
 * §2.1): the old default prompt replaced 30 s of real Spanish speech with 6
 * prompt words at p≈0.004–0.018. Warn on stderr — naming WHICH signal fired —
 * when the transcript looks like a failure mode: mostly low-confidence words,
 * far too few words for the duration, or low language-detection confidence.
 * Runs on BOTH the live-whisper and the precomputed --transcript paths (the
 * bypass was Sol §2.1's overturn). Still a WARNING, not a blocker: the
 * 2026-07-16 multi-take experiment showed every real raw take trips the
 * words/second check, so a hard gate here needs the coverage/corrections
 * artifact first (queued — SOL-0716-TRIAGE.md).
 */
function warnIfTranscriptSuspect(
  words: EditPlanWord[],
  durationSeconds: number,
  languageProbability: number | null,
): void {
  const reasons: string[] = [];
  const withProb = words.filter((w) => typeof w.probability === "number");
  const lowProbShare =
    withProb.length === 0
      ? 0
      : withProb.filter((w) => (w.probability as number) < 0.15).length / withProb.length;
  if (lowProbShare > 0.3) {
    reasons.push(`${Math.round(lowProbShare * 100)}% of words below p=0.15`);
  }
  if (words.length < 1.5 * durationSeconds) {
    reasons.push(
      `${words.length} words for ${durationSeconds.toFixed(1)}s (< 1.5 w/s — expect ≈2.5–3)`,
    );
  }
  if (
    languageProbability !== null &&
    languageProbability < LANGUAGE_PROBABILITY_SUSPECT_THRESHOLD
  ) {
    reasons.push(
      `languageProbability ${languageProbability.toFixed(3)} < ${LANGUAGE_PROBABILITY_SUSPECT_THRESHOLD}`,
    );
  }
  if (reasons.length > 0) {
    console.error(
      `⚠ transcript quality suspect (possible hallucination): ${reasons.join("; ")} — review before editing`,
    );
  }
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
  .option("--hotwords <terms>", "Vocabulary bias for whisper (brand names, jargon); wins over --glossary-file")
  .option("--glossary-file <path>", "Newline/comma-separated term list joined into whisper hotwords")
  .option("--silence-db <db>", "silencedetect noise floor (dB, negative)", "-30")
  .option("--min-silence <sec>", "Minimum silence to trim (seconds)", "0.5")
  .option("--no-trim", "Skip silence-trim (keep the whole clip as one segment)")
  .option("--no-word-snap", "Skip snapping cut boundaries to word onsets (snap runs after silence-trim whenever a transcript exists)")
  .option("--force-transcript", "Proceed despite a FAILING transcript coverage gate (<0.9 words/s or >40% low-confidence words)")
  .option("--render", "Render the EditPlan to a finished MP4 (ffmpeg-trim + SpeakerOverlayScene)")
  .option("--caption-style <style>", "FloatingCaption preset: hormozi-pop (owner default, DOGFOOD-PLAYBOOK §9.1)|editorial-cyan|classic|… (with --render)", "hormozi-pop")
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

  // ── 2. silence-trim → KEEP spans (segments built in step 3.5, after the
  //       transcript is available for word-onset snapping) ────────────────────
  let keeps: KeepSpan[];
  if (opts.trim === false) {
    // --no-trim: one keep spanning the whole clip.
    keeps = [{ startSeconds: 0, endSeconds: durationSeconds }];
    log("silence", "skipped (--no-trim): 1 segment for the whole clip");
  } else {
    const silences = await detectSilences(video, {
      thresholdDb: parseFloat(opts.silenceDb),
      minSilenceSeconds: parseFloat(opts.minSilence),
    });
    keeps = keepSegmentsFromSilences(silences, durationSeconds, {
      log: (m) => log("silence", m),
    });
    log("silence", `${silences.length} silence(s) → ${keeps.length} kept span(s)`);
  }

  // ── 3. transcribe (skipped when register === 'none') ───────────────────────
  let sourceWords: EditPlanWord[] = [];
  if (register === "none") {
    log("whisper", "skipped (register=none → no captions, ADR-002 §3.3)");
  } else if (opts.transcript) {
    // Precomputed transcript: SAME payload parsing and SAME quality warning as
    // the live path (Sol 0716 §2.1: this branch previously bypassed
    // warnIfTranscriptSuspect entirely and discarded languageProbability).
    const parsed = parseTranscriptPayload(
      JSON.parse(fs.readFileSync(path.resolve(opts.transcript), "utf-8")),
    );
    sourceWords = parsed.words;
    log(
      "whisper",
      `loaded ${sourceWords.length} word timings from --transcript` +
        (parsed.languageProbability !== null
          ? ` (languageProbability=${parsed.languageProbability.toFixed(3)})`
          : ""),
    );
    warnIfTranscriptSuspect(sourceWords, durationSeconds, parsed.languageProbability);
  } else {
    log("whisper", `transcribing with '${opts.whisperModel}' model (first run downloads the model)...`);
    const parsed = await transcribe(
      video, projectRoot, opts.whisperModel, opts.language, fps,
      opts.hotwords, opts.glossaryFile,
    );
    sourceWords = parsed.words;
    log(
      "whisper",
      `transcribed ${sourceWords.length} words` +
        (parsed.languageProbability !== null
          ? ` (languageProbability=${parsed.languageProbability.toFixed(3)})`
          : ""),
    );
    warnIfTranscriptSuspect(sourceWords, durationSeconds, parsed.languageProbability);
  }

  // ── 3.25 BLOCKING transcript coverage gate (triage #7; Sol 0716 §2.1) ──────
  // The suspect-warning above is advisory; these floors mark a transcript that
  // is unsafe to cut against at all. Applies to live-whisper AND --transcript
  // inputs; register=none has no transcript, so nothing to gate.
  if (register !== "none") {
    const coverage = evaluateTranscriptCoverage(sourceWords, durationSeconds);
    if (coverage.failures.length > 0) {
      if (opts.forceTranscript) {
        console.error(
          `⚠ transcript coverage gate OVERRIDDEN by --force-transcript: ${coverage.failures.join("; ")} — G1 stays PENDING until the transcript is reviewed/corrected (DOGFOOD-PLAYBOOK §3.3)`,
        );
      } else {
        throw new Error(
          `transcript coverage gate FAILED: ${coverage.failures.join("; ")}. ` +
            `The transcript is too sparse/uncertain to cut against — captions and word-onset snapping would be built on missing words. ` +
            `Fix: burst-slice the source or retry with --whisper-model large-v3 / a corrected --transcript, ` +
            `or pass --force-transcript to proceed anyway (G1 stays PENDING).`,
        );
      }
    }
  }

  // ── 3.5 word-onset snap + segments (Sol 0716 §4.2 "They"-class joins) ──────
  // Snap cut boundaries that landed INSIDE a word to that word's onset −0.12s
  // pre-roll, so joins never clip mid-word. Runs only when a transcript exists
  // and silence-trim actually cut something; --no-word-snap disables it.
  if (opts.wordSnap !== false && opts.trim !== false && sourceWords.length > 0) {
    const snapped = snapKeepsToWordOnsets(keeps, sourceWords);
    const movedBoundaries = snapped.reduce(
      (n, s, i) =>
        n +
        (s.startSeconds !== keeps[i].startSeconds ? 1 : 0) +
        (s.endSeconds !== keeps[i].endSeconds ? 1 : 0),
      0,
    );
    log(
      "snap",
      movedBoundaries > 0
        ? `word-onset snap: moved ${movedBoundaries} cut boundar${movedBoundaries === 1 ? "y" : "ies"} to word onset −0.12s pre-roll (--no-word-snap to disable)`
        : "word-onset snap: no cut boundary landed inside a word (nothing to move)",
    );
    keeps = snapped;
  } else if (opts.wordSnap === false) {
    log("snap", "word-onset snap skipped (--no-word-snap)");
  }

  const segments = toEditSegments(keeps, fps);
  const trimmedFrames = sourceDurationFrames - (segments[segments.length - 1]?.editEndFrame ?? 0);
  log(
    "silence",
    `${segments.length} kept segment(s); trimmed ~${(trimmedFrames / fps).toFixed(2)}s of dead air`,
  );

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
      : "hormozi-pop"; // owner default (DOGFOOD-PLAYBOOK §9.1)
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
