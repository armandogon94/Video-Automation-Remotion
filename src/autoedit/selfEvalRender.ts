/**
 * selfEvalRender — a capped, pre-delivery QA pass over a rendered edit.
 *
 * WHAT IT ACTUALLY CHECKS (honest scope — GPT-5.6 finding 2.8; Sol 0716 §3.2)
 * ------------------------------------------------------------
 * Automated evidence only:
 *   1. Duration probe: container duration vs the EditPlan's expected duration.
 *   2. A/V agreement gate: VIDEO-stream duration vs AUDIO-stream duration
 *      (flags drift > 0.1 s). Sol §3.2 overturned the old container-vs-audio
 *      comparison: mp4 container duration is max(streams), so a 1 s video with
 *      2 s audio probed container 2.0 vs audio 2.0 → false-zero delta while the
 *      video stream was half missing. Container duration is informational only.
 *   3. Frame-zero blank-frame diagnostic (owner hard rule, DOGFOOD-PLAYBOOK
 *      §9.9): extracts frame 0 to selfeval-frame0.png and computes the REAL
 *      per-pixel luma standard deviation over the decoded gray frame (Sol §3.2
 *      overturned the old (YHIGH−YLOW)/2.56 percentile estimate: a navy frame
 *      with a 7.4%-area gold hook bar has YLOW=YHIGH → "σ=0" while the true
 *      per-pixel σ ≈ 31, so valid sparse hook designs were falsely flagged).
 *      This stat is a HEURISTIC BLANK-FRAME FLAG only: it can say the frame is
 *      visually near-uniform; it can NEVER say the visual is a usable HOOK
 *      (SMPTE bars have huge σ and zero hook value). Hook judgement is a
 *      human/semantic decision — a plan invariant plus visual review.
 *   4. Cut contact sheet: the before|after frame at each cut, as evidence for a
 *      human or LLM reviewer. A contact sheet is evidence, not an automatic pass.
 *   5. A markdown report with the automatable results + an inspection checklist.
 *      Unchecked human boxes mean the corresponding hard gate is PENDING — not
 *      PASS — and a pending hard gate blocks scoring exactly like a failure
 *      (DOGFOOD-PLAYBOOK §4).
 *
 * WHAT IT DOES NOT CHECK (required human steps, listed in the checklist):
 *   - AUDIO: nothing here listens to the track. Pops/clicks at cut boundaries,
 *     loudness jumps, truncated words — all REQUIRE a human listen.
 *   - Whether frame 0's visual actually works as a hook/cover/thumbnail.
 *   - Jump-cut severity, overlay misalignment, subtitle occlusion.
 *
 * (Harvested from browser-use/video-use, 2026-06-26: render → inspect at every
 * cut boundary before showing the user, capped at 3 passes. The 3-pass cap
 * belongs to the orchestrator that loops; this module is ONE pass.)
 *
 * Pure-additive: it reads a finished mp4 + the plan; it changes no render output.
 */
import { execa } from "execa";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { EditPlan } from "./editPlan";

export interface CutBoundary {
  /** 1-based cut number. */
  index: number;
  /** Segment id this cut follows. */
  afterSegmentId: string;
  /** Last output frame of the outgoing segment (left side of the cut). */
  beforeFrame: number;
  /** First output frame of the incoming segment (right side of the cut). */
  afterFrame: number;
  /** Cut time on the output timeline, seconds. */
  outputSeconds: number;
}

/** Minimal structural view of a plan — keeps the core decoupled + unit-testable. */
export interface BoundarySpec {
  fps: number;
  /** Trimmed output duration in frames. */
  editDurationFrames: number;
  segments: Array<{ id: string; editStartFrame: number; editEndFrame: number }>;
}

/**
 * The cut boundaries on the OUTPUT timeline: the join between each consecutive
 * pair of kept segments (segment i's end meets segment i+1's start). A single
 * segment (or none) has no internal cuts.
 */
export function cutBoundariesFromPlan(plan: BoundarySpec): CutBoundary[] {
  const fps = plan.fps || 30;
  const segs = plan.segments ?? [];
  const out: CutBoundary[] = [];
  for (let i = 0; i < segs.length - 1; i++) {
    const cutFrame = segs[i].editEndFrame; // first frame of the next segment
    out.push({
      index: i + 1,
      afterSegmentId: segs[i].id,
      beforeFrame: Math.max(0, cutFrame - 1),
      afterFrame: cutFrame,
      outputSeconds: cutFrame / fps,
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame-zero blank-frame diagnostic (owner hard rule §9.9) — pure parts
// ─────────────────────────────────────────────────────────────────────────────

/** REAL per-pixel luma statistics of frame 0 (decoded gray plane). */
export interface FrameZeroLumaStats {
  /** Mean luma over every pixel. */
  mean: number;
  /** Population standard deviation over every pixel. */
  stddev: number;
  /** Number of pixels measured. */
  pixels: number;
}

/**
 * Compute the REAL per-pixel mean + standard deviation of a decoded grayscale
 * frame (one byte per pixel). Sol 0716 §3.2 overturned the previous
 * (YHIGH−YLOW)/2.56 percentile estimate — natural frames, title cards, and
 * sparse overlays are multimodal, so a navy frame with a 7.4%-area gold bar
 * measured "σ=0" (both percentiles landed on navy) while its true per-pixel σ
 * is ≈31. This is the exact statistic, not a distributional assumption.
 * Returns null for an empty buffer.
 */
export function computeLumaStats(gray: Uint8Array): FrameZeroLumaStats | null {
  const n = gray.length;
  if (n === 0) return null;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += gray[i];
  const mean = sum / n;
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const d = gray[i] - mean;
    sq += d * d;
  }
  return { mean, stddev: Math.sqrt(sq / n), pixels: n };
}

/** Near-flat threshold (owner §9.9 diagnostic): REAL per-pixel luma σ below
 *  this ⇒ frame 0 is near-uniform (likely blank — no visual on screen at t=0).
 *  A σ ABOVE the threshold is NOT hook evidence (Sol §3.2: SMPTE bars pass any
 *  spread stat); the hook decision itself stays human/semantic. */
export const FRAME_ZERO_LUMA_STDDEV_THRESHOLD = 6;

/** True ⇒ frame 0 looks near-flat/blank (heuristic diagnostic ONLY — never
 *  hook proof). */
export function evaluateFrameZeroStats(lumaStddev: number): boolean {
  return lumaStddev < FRAME_ZERO_LUMA_STDDEV_THRESHOLD;
}

/** A/V agreement tolerance, seconds (VIDEO stream vs AUDIO stream duration). */
export const AV_DURATION_TOLERANCE_SECONDS = 0.1;

export interface SelfEvalOptions {
  /** Where to write the contact sheet + report. Default: alongside the mp4. */
  outDir?: string;
  /** Cap the number of cuts sampled into the sheet (evenly) to keep it readable. */
  maxCutsInSheet?: number;
  /** Duration mismatch tolerance, seconds. */
  durationToleranceSeconds?: number;
  /** This pass's number (for the report header); the cap lives in the caller. */
  passNumber?: number;
}

export interface SelfEvalResult {
  boundaries: CutBoundary[];
  cutsSampled: number;
  cutsDropped: number;
  contactSheetPath: string | null;
  expectedSeconds: number;
  actualSeconds: number;
  durationDeltaSeconds: number;
  durationOk: boolean;
  /** Video-stream duration (seconds); null when absent/unreadable (Sol §3.2:
   *  the A/V gate compares STREAMS; container duration is informational). */
  videoSeconds: number | null;
  /** Audio-stream duration (seconds); null when absent/unreadable. */
  audioSeconds: number | null;
  /** |video stream − audio stream| duration; null when either is unreadable. */
  avDurationDeltaSeconds: number | null;
  /** True only when BOTH streams were probed AND the delta ≤ 0.1 s. */
  avDurationOk: boolean;
  /** Extracted first frame (owner §9.9 diagnostic); null if extraction failed. */
  frameZeroPath: string | null;
  /** REAL per-pixel luma stats of frame 0; null if the probe failed. */
  frameZeroStats: FrameZeroLumaStats | null;
  /** REAL per-pixel luma σ of frame 0; null if stats failed. */
  frameZeroLumaStddev: number | null;
  /** True ⇒ frame 0 is near-flat (per-pixel luma σ < 6) — likely BLANK at t=0.
   *  Heuristic diagnostic only; false is NOT evidence of a usable hook. */
  frameZeroSuspectEmpty: boolean;
  reportPath: string;
  report: string;
}

async function probeDurationSeconds(mp4Path: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    mp4Path,
  ]);
  return Number(stdout.trim());
}

/** Duration of the first stream of the given kind ("v:0" video / "a:0" audio);
 *  null when absent or "N/A". The A/V gate compares STREAM durations (Sol
 *  §3.2) — container duration is max(streams) and hides a short video track. */
async function probeStreamDurationSeconds(
  mp4Path: string,
  stream: "v:0" | "a:0",
): Promise<number | null> {
  try {
    const { stdout } = await execa("ffprobe", [
      "-v", "error",
      "-select_streams", stream,
      "-show_entries", "stream=duration",
      "-of", "csv=p=0",
      mp4Path,
    ]);
    const v = Number(stdout.trim());
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Extract frame 0 as a PNG. Returns the path, or null on failure. */
async function extractFrameZero(
  mp4Path: string,
  outDir: string,
): Promise<string | null> {
  const frameZeroPath = join(outDir, "selfeval-frame0.png");
  try {
    await execa("ffmpeg", [
      "-nostdin", "-loglevel", "error", "-y",
      "-i", mp4Path,
      "-vf", "select=eq(n\\,0)",
      "-frames:v", "1",
      frameZeroPath,
    ]);
    return frameZeroPath;
  } catch {
    return null;
  }
}

/** Decode frame 0 as a raw grayscale plane and compute REAL per-pixel luma
 *  stats (Sol §3.2 — no percentile/normal-distribution assumption). */
async function probeFrameZeroStats(
  mp4Path: string,
): Promise<FrameZeroLumaStats | null> {
  try {
    const { stdout } = await execa(
      "ffmpeg",
      [
        "-nostdin", "-loglevel", "error",
        "-i", mp4Path,
        "-vf", "select=eq(n\\,0),format=gray",
        "-frames:v", "1",
        "-f", "rawvideo", "-",
      ],
      { encoding: "buffer" },
    );
    return computeLumaStats(stdout);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Report (pure — unit-testable)
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportInput {
  mp4Path: string;
  pass: number;
  expectedSeconds: number;
  actualSeconds: number;
  durationDeltaSeconds: number;
  durationOk: boolean;
  videoSeconds: number | null;
  audioSeconds: number | null;
  avDurationDeltaSeconds: number | null;
  avDurationOk: boolean;
  boundaries: CutBoundary[];
  sampled: CutBoundary[];
  cutsDropped: number;
  contactSheetPath: string | null;
  frameZeroPath: string | null;
  frameZeroStats: FrameZeroLumaStats | null;
  frameZeroLumaStddev: number | null;
  frameZeroSuspectEmpty: boolean;
}

/** Assemble the markdown report: automatable results + the REQUIRED HUMAN
 *  inspection checklist (audio listening included — nothing here hears audio).
 *  Unchecked human boxes = the corresponding hard gate is PENDING, never PASS. */
export function buildReport(input: ReportInput): string {
  const avLine =
    input.videoSeconds === null
      ? `**A/V stream agreement:** video stream missing or unreadable ⚠️ — a rendered edit without a probeable video stream is broken\n\n`
      : input.audioSeconds === null || input.avDurationDeltaSeconds === null
        ? `**A/V stream agreement:** audio stream missing or unreadable ⚠️ — a talking-head edit without probeable audio is broken; listen check is mandatory\n\n`
        : `**A/V stream agreement:** video ${input.videoSeconds.toFixed(3)}s, audio ${input.audioSeconds.toFixed(3)}s ` +
          `(Δ ${input.avDurationDeltaSeconds.toFixed(3)}s) — ${input.avDurationOk ? "OK" : `MISMATCH ⚠️ (Δ > ${AV_DURATION_TOLERANCE_SECONDS}s)`} ` +
          `(container ${input.actualSeconds.toFixed(3)}s — informational only; Sol 0716 §3.2: container = max(streams) and can hide a short video track)\n\n`;

  const frameZeroLine =
    input.frameZeroPath === null
      ? `**Frame 0 (blank-frame diagnostic, owner §9.9):** extraction FAILED ⚠️ — inspect manually\n\n`
      : `**Frame 0 (blank-frame diagnostic, owner §9.9):** ${input.frameZeroPath}` +
        (input.frameZeroStats && input.frameZeroLumaStddev !== null
          ? ` — per-pixel luma σ=${input.frameZeroLumaStddev.toFixed(1)} ` +
            `(mean ${input.frameZeroStats.mean.toFixed(1)}, ${input.frameZeroStats.pixels}px)`
          : ` — luma stats unavailable ⚠️ (inspect the png)`) +
        `\n` +
        (input.frameZeroSuspectEmpty
          ? `⚠ frame 0 is near-flat (per-pixel luma σ < ${FRAME_ZERO_LUMA_STDDEV_THRESHOLD}) — likely BLANK at t=0 (owner hard rule §9.9)\n`
          : ``) +
        `NOTE: this σ is a blank-frame heuristic ONLY — passing it is NOT evidence of a\n` +
        `usable hook (Sol 0716 §3.2). The hook decision is the human checklist item below.\n\n`;

  return (
    `# Self-eval render QA — ${input.mp4Path}\n\n` +
    `Pass ${input.pass} of <=3.\n\n` +
    `Automated evidence: duration probe, A/V STREAM duration agreement, frame-0\n` +
    `blank-frame diagnostic, and a cut contact sheet. Audio is NOT analyzed by\n` +
    `this pass — the listen step below is a required human step.\n\n` +
    `**Duration (plan vs container):** expected ${input.expectedSeconds.toFixed(2)}s, actual ${input.actualSeconds.toFixed(2)}s ` +
    `(Δ ${input.durationDeltaSeconds.toFixed(3)}s) — ${input.durationOk ? "OK" : "MISMATCH ⚠️"}\n\n` +
    avLine +
    frameZeroLine +
    `**Cut boundaries:** ${input.boundaries.length}` +
    (input.cutsDropped > 0 ? ` (sheet shows ${input.sampled.length}, ${input.cutsDropped} sampled out)` : "") +
    `\n` +
    (input.contactSheetPath ? `**Contact sheet:** ${input.contactSheetPath} (each row = one cut: [before | after])\n` : "") +
    `\nInspect the artifacts, then confirm (REQUIRED HUMAN steps — none of these are\n` +
    `machine-verified; an UNCHECKED box means the matching hard gate is PENDING, not\n` +
    `PASS, and a pending hard gate blocks the weighted score exactly like a failure —\n` +
    `DOGFOOD-PLAYBOOK §4):\n` +
    `- [ ] frame 0 contains a non-caption visual hook (owner hard rule §9.9) — see selfeval-frame0.png\n` +
    `- [ ] LISTEN to the full audio track — pops/clicks at cut boundaries, loudness jumps, truncated words (this pass performs NO audio analysis)\n` +
    `- [ ] No visual discontinuity / flash / jump at any cut\n` +
    `- [ ] No subtitle hidden behind an overlay\n` +
    `- [ ] Overlays aligned at window start (no wrong-frame)\n` +
    `- [ ] Color grade consistent across segments\n\n` +
    `## Cuts\n` +
    input.sampled
      .map((c) => `- cut ${c.index} @ ${c.outputSeconds.toFixed(2)}s (after ${c.afterSegmentId}) — frames ${c.beforeFrame}|${c.afterFrame}`)
      .join("\n") +
    "\n"
  );
}

/** Run ONE self-eval pass over a rendered edit. */
export async function selfEvalRender(
  mp4Path: string,
  plan: EditPlan,
  opts: SelfEvalOptions = {},
): Promise<SelfEvalResult> {
  const outDir = opts.outDir ?? dirname(mp4Path);
  const maxCuts = opts.maxCutsInSheet ?? 16;
  const tol = opts.durationToleranceSeconds ?? 0.15;
  const pass = opts.passNumber ?? 1;
  await mkdir(outDir, { recursive: true });

  const boundaries = cutBoundariesFromPlan(plan);
  const expectedSeconds = plan.editDurationFrames / (plan.fps || 30);
  const actualSeconds = await probeDurationSeconds(mp4Path);
  const durationDeltaSeconds = Math.abs(actualSeconds - expectedSeconds);
  const durationOk = durationDeltaSeconds <= tol;

  // A/V agreement gate: VIDEO stream vs AUDIO stream duration (Sol §3.2 —
  // container duration is max(streams) and previously produced a false-zero
  // delta on a 1s-video/2s-audio file; it is now informational only).
  const videoSeconds = await probeStreamDurationSeconds(mp4Path, "v:0");
  const audioSeconds = await probeStreamDurationSeconds(mp4Path, "a:0");
  const avDurationDeltaSeconds =
    videoSeconds === null || audioSeconds === null
      ? null
      : Math.abs(videoSeconds - audioSeconds);
  const avDurationOk =
    avDurationDeltaSeconds !== null &&
    avDurationDeltaSeconds <= AV_DURATION_TOLERANCE_SECONDS;

  // Frame-zero blank-frame diagnostic (owner §9.9): extract the png + REAL
  // per-pixel luma stddev (heuristic blank flag, never hook evidence).
  const frameZeroPath = await extractFrameZero(mp4Path, outDir);
  const frameZeroStats = await probeFrameZeroStats(mp4Path);
  const frameZeroLumaStddev = frameZeroStats === null ? null : frameZeroStats.stddev;
  const frameZeroSuspectEmpty =
    frameZeroLumaStddev !== null && evaluateFrameZeroStats(frameZeroLumaStddev);

  // Sample cuts evenly if there are more than the sheet cap (never silently drop:
  // we report cutsDropped).
  let sampled = boundaries;
  let cutsDropped = 0;
  if (boundaries.length > maxCuts) {
    const step = boundaries.length / maxCuts;
    sampled = Array.from({ length: maxCuts }, (_, k) => boundaries[Math.floor(k * step)]);
    cutsDropped = boundaries.length - sampled.length;
  }

  // Build a contact sheet: each cut contributes its before|after output frame.
  let contactSheetPath: string | null = null;
  if (sampled.length > 0) {
    const frames = sampled.flatMap((c) => [c.beforeFrame, c.afterFrame]);
    const expr = frames.map((f) => `eq(n\\,${f})`).join("+");
    contactSheetPath = join(outDir, "selfeval-cuts.png");
    await execa("ffmpeg", [
      "-nostdin", "-loglevel", "error", "-y",
      "-i", mp4Path,
      "-vf", `select='${expr}',scale=240:-1,tile=2x${sampled.length}:padding=6:color=0x141414`,
      "-frames:v", "1",
      contactSheetPath,
    ]);
  }

  const report = buildReport({
    mp4Path,
    pass,
    expectedSeconds,
    actualSeconds,
    durationDeltaSeconds,
    durationOk,
    videoSeconds,
    audioSeconds,
    avDurationDeltaSeconds,
    avDurationOk,
    boundaries,
    sampled,
    cutsDropped,
    contactSheetPath,
    frameZeroPath,
    frameZeroStats,
    frameZeroLumaStddev,
    frameZeroSuspectEmpty,
  });

  const reportPath = join(outDir, "selfeval-report.md");
  await writeFile(reportPath, report, "utf8");

  return {
    boundaries,
    cutsSampled: sampled.length,
    cutsDropped,
    contactSheetPath,
    expectedSeconds,
    actualSeconds,
    durationDeltaSeconds,
    durationOk,
    videoSeconds,
    audioSeconds,
    avDurationDeltaSeconds,
    avDurationOk,
    frameZeroPath,
    frameZeroStats,
    frameZeroLumaStddev,
    frameZeroSuspectEmpty,
    reportPath,
    report,
  };
}
