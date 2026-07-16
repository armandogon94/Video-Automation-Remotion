/**
 * selfEvalRender — a capped, pre-delivery QA pass over a rendered edit.
 *
 * WHAT IT ACTUALLY CHECKS (honest scope — GPT-5.6 finding 2.8)
 * ------------------------------------------------------------
 * Automated evidence only:
 *   1. Duration probe: container duration vs the EditPlan's expected duration.
 *   2. A/V agreement gate: container duration vs audio-stream duration
 *      (flags drift > 0.1 s).
 *   3. Frame-zero hook gate (owner hard rule, DOGFOOD-PLAYBOOK §9.9): extracts
 *      frame 0 to selfeval-frame0.png and computes a cheap luma-spread stat via
 *      ffmpeg signalstats (no ML). A near-flat frame is flagged as suspect —
 *      the stat can say the frame is visually EMPTY; it cannot say the visual
 *      is a usable HOOK. That judgement stays human.
 *   4. Cut contact sheet: the before|after frame at each cut, as evidence for a
 *      human or LLM reviewer. A contact sheet is evidence, not an automatic pass.
 *   5. A markdown report with the automatable results + an inspection checklist.
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
// Frame-zero hook gate (owner hard rule §9.9) — pure, unit-testable parts
// ─────────────────────────────────────────────────────────────────────────────

/** Luma statistics of frame 0, parsed from ffmpeg signalstats metadata. */
export interface FrameZeroStats {
  /** Mean luma. */
  yavg: number;
  /** Minimum luma. */
  ymin: number;
  /** Maximum luma. */
  ymax: number;
  /** Luma at the 10% point of the distribution. */
  ylow: number;
  /** Luma at the 90% point of the distribution. */
  yhigh: number;
}

/** Parse `lavfi.signalstats.*` keys from ffmpeg `metadata=print` output.
 *  Returns null when any required key is missing (e.g. the filter failed). */
export function parseSignalStats(metadataText: string): FrameZeroStats | null {
  const pick = (key: string): number | null => {
    const m = metadataText.match(
      new RegExp(`lavfi\\.signalstats\\.${key}=(-?[0-9]+(?:\\.[0-9]+)?)`),
    );
    return m ? Number(m[1]) : null;
  };
  const yavg = pick("YAVG");
  const ymin = pick("YMIN");
  const ymax = pick("YMAX");
  const ylow = pick("YLOW");
  const yhigh = pick("YHIGH");
  if (yavg === null || ymin === null || ymax === null || ylow === null || yhigh === null) {
    return null;
  }
  return { yavg, ymin, ymax, ylow, yhigh };
}

/** σ estimate from the 10–90 percentile luma spread. signalstats emits no
 *  direct stddev, so we approximate: for a normal distribution the 10%→90%
 *  span covers ≈2.56σ. Exactly 0 for a flat (single-luma) frame — which is
 *  the case this gate exists to catch. */
export function lumaStddevEstimate(
  stats: Pick<FrameZeroStats, "ylow" | "yhigh">,
): number {
  return (stats.yhigh - stats.ylow) / 2.56;
}

/** Near-flat threshold (owner §9.9 gate): luma σ below this ⇒ frame 0 is
 *  suspect-empty (no visual hook on screen at t=0). */
export const FRAME_ZERO_LUMA_STDDEV_THRESHOLD = 6;

/** True ⇒ frame 0 looks near-flat (suspect: no non-caption visual hook). */
export function evaluateFrameZeroStats(lumaStddev: number): boolean {
  return lumaStddev < FRAME_ZERO_LUMA_STDDEV_THRESHOLD;
}

/** A/V agreement tolerance, seconds (container vs audio-stream duration). */
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
  /** Audio-stream duration (seconds); null when absent/unreadable. */
  audioSeconds: number | null;
  /** |container − audio stream| duration; null when audio is unreadable. */
  avDurationDeltaSeconds: number | null;
  /** True only when the audio stream was probed AND the delta ≤ 0.1 s. */
  avDurationOk: boolean;
  /** Extracted first frame (owner §9.9 hook gate); null if extraction failed. */
  frameZeroPath: string | null;
  /** signalstats luma stats of frame 0; null if the probe failed. */
  frameZeroStats: FrameZeroStats | null;
  /** σ estimate from the 10–90 percentile luma spread; null if stats failed. */
  frameZeroLumaStddev: number | null;
  /** True ⇒ frame 0 is near-flat (luma σ < 6) — likely no visual hook at t=0. */
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

/** Duration of the first audio stream; null when absent or "N/A". */
async function probeAudioDurationSeconds(mp4Path: string): Promise<number | null> {
  try {
    const { stdout } = await execa("ffprobe", [
      "-v", "error",
      "-select_streams", "a:0",
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

/** Run signalstats over frame 0 only; parse the metadata=print output. */
async function probeFrameZeroStats(mp4Path: string): Promise<FrameZeroStats | null> {
  try {
    const { stdout } = await execa("ffmpeg", [
      "-nostdin", "-loglevel", "error",
      "-i", mp4Path,
      "-vf", "select=eq(n\\,0),signalstats,metadata=print:file=-",
      "-frames:v", "1",
      "-f", "null", "-",
    ]);
    return parseSignalStats(stdout);
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
  audioSeconds: number | null;
  avDurationDeltaSeconds: number | null;
  avDurationOk: boolean;
  boundaries: CutBoundary[];
  sampled: CutBoundary[];
  cutsDropped: number;
  contactSheetPath: string | null;
  frameZeroPath: string | null;
  frameZeroStats: FrameZeroStats | null;
  frameZeroLumaStddev: number | null;
  frameZeroSuspectEmpty: boolean;
}

/** Assemble the markdown report: automatable results + the REQUIRED HUMAN
 *  inspection checklist (audio listening included — nothing here hears audio). */
export function buildReport(input: ReportInput): string {
  const avLine =
    input.audioSeconds === null || input.avDurationDeltaSeconds === null
      ? `**A/V duration agreement:** audio stream missing or unreadable ⚠️ — a talking-head edit without probeable audio is broken; listen check is mandatory\n\n`
      : `**A/V duration agreement:** container ${input.actualSeconds.toFixed(2)}s, audio ${input.audioSeconds.toFixed(2)}s ` +
        `(Δ ${input.avDurationDeltaSeconds.toFixed(3)}s) — ${input.avDurationOk ? "OK" : `MISMATCH ⚠️ (Δ > ${AV_DURATION_TOLERANCE_SECONDS}s)`}\n\n`;

  const frameZeroLine =
    input.frameZeroPath === null
      ? `**Frame 0 (hook gate, owner §9.9):** extraction FAILED ⚠️ — inspect manually\n\n`
      : `**Frame 0 (hook gate, owner §9.9):** ${input.frameZeroPath}` +
        (input.frameZeroStats && input.frameZeroLumaStddev !== null
          ? ` — luma σ≈${input.frameZeroLumaStddev.toFixed(1)} ` +
            `(YAVG ${input.frameZeroStats.yavg.toFixed(1)}, spread ${input.frameZeroStats.ymin}–${input.frameZeroStats.ymax}, 10–90pct ${input.frameZeroStats.ylow}–${input.frameZeroStats.yhigh})`
          : ` — luma stats unavailable ⚠️ (inspect the png)`) +
        `\n` +
        (input.frameZeroSuspectEmpty
          ? `⚠ frame 0 is near-flat (luma σ < ${FRAME_ZERO_LUMA_STDDEV_THRESHOLD}) — likely NO visual hook on screen at t=0 (owner hard rule §9.9)\n`
          : ``) +
        `\n`;

  return (
    `# Self-eval render QA — ${input.mp4Path}\n\n` +
    `Pass ${input.pass} of <=3.\n\n` +
    `Automated evidence: duration probe, A/V duration agreement, frame-0 luma\n` +
    `stat, and a cut contact sheet. Audio is NOT analyzed by this pass — the\n` +
    `listen step below is a required human step.\n\n` +
    `**Duration (plan vs container):** expected ${input.expectedSeconds.toFixed(2)}s, actual ${input.actualSeconds.toFixed(2)}s ` +
    `(Δ ${input.durationDeltaSeconds.toFixed(3)}s) — ${input.durationOk ? "OK" : "MISMATCH ⚠️"}\n\n` +
    avLine +
    frameZeroLine +
    `**Cut boundaries:** ${input.boundaries.length}` +
    (input.cutsDropped > 0 ? ` (sheet shows ${input.sampled.length}, ${input.cutsDropped} sampled out)` : "") +
    `\n` +
    (input.contactSheetPath ? `**Contact sheet:** ${input.contactSheetPath} (each row = one cut: [before | after])\n` : "") +
    `\nInspect the artifacts, then confirm (REQUIRED HUMAN steps — none of these are machine-verified):\n` +
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

  // A/V agreement gate: container vs audio-stream duration.
  const audioSeconds = await probeAudioDurationSeconds(mp4Path);
  const avDurationDeltaSeconds =
    audioSeconds === null ? null : Math.abs(actualSeconds - audioSeconds);
  const avDurationOk =
    avDurationDeltaSeconds !== null &&
    avDurationDeltaSeconds <= AV_DURATION_TOLERANCE_SECONDS;

  // Frame-zero hook gate (owner §9.9): extract the png + cheap luma stat.
  const frameZeroPath = await extractFrameZero(mp4Path, outDir);
  const frameZeroStats = await probeFrameZeroStats(mp4Path);
  const frameZeroLumaStddev =
    frameZeroStats === null ? null : lumaStddevEstimate(frameZeroStats);
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
