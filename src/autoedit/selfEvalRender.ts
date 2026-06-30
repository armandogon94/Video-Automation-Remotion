/**
 * selfEvalRender — a capped, pre-delivery QA pass over a rendered edit.
 *
 * WHY THIS EXISTS (harvested from browser-use/video-use, 2026-06-26)
 * -----------------------------------------------------------------
 * video-use renders a preview, then INSPECTS it at every cut boundary (filmstrip
 * at ±window) before showing the user — catching jump-cuts, audio pops, overlay
 * misalignment, and subtitle occlusion, capped at 3 passes (no infinite loops).
 * Our renderFromPlan.ts renders once and ships; it had no analog (the video-use
 * audit flagged this gap). This module adds that QA pass.
 *
 * What it does (ONE pass — the 3-pass cap belongs to the orchestrator that loops):
 *   1. Compute the cut boundaries on the OUTPUT timeline from the EditPlan.
 *   2. ffprobe the rendered mp4's real duration and compare to the plan
 *      (editDurationFrames / fps) — the one fully-automatable check.
 *   3. Extract the BEFORE/AFTER frame at each cut into a single contact sheet so
 *      a human or an LLM can eyeball jump-cuts / overlay misalignment / occlusion.
 *   4. Emit a markdown report with the automatable result + an inspection
 *      checklist keyed to the sheet.
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

  const report =
    `# Self-eval render QA — ${mp4Path}\n\n` +
    `Pass ${pass} of <=3.\n\n` +
    `**Duration:** expected ${expectedSeconds.toFixed(2)}s, actual ${actualSeconds.toFixed(2)}s ` +
    `(Δ ${durationDeltaSeconds.toFixed(3)}s) — ${durationOk ? "OK" : "MISMATCH ⚠️"}\n\n` +
    `**Cut boundaries:** ${boundaries.length}` +
    (cutsDropped > 0 ? ` (sheet shows ${sampled.length}, ${cutsDropped} sampled out)` : "") +
    `\n` +
    (contactSheetPath ? `**Contact sheet:** ${contactSheetPath} (each row = one cut: [before | after])\n` : "") +
    `\nInspect the contact sheet, then confirm:\n` +
    `- [ ] No visual discontinuity / flash / jump at any cut\n` +
    `- [ ] No subtitle hidden behind an overlay\n` +
    `- [ ] Overlays aligned at window start (no wrong-frame)\n` +
    `- [ ] Color grade consistent across segments\n\n` +
    `## Cuts\n` +
    sampled
      .map((c) => `- cut ${c.index} @ ${c.outputSeconds.toFixed(2)}s (after ${c.afterSegmentId}) — frames ${c.beforeFrame}|${c.afterFrame}`)
      .join("\n") +
    "\n";

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
    reportPath,
    report,
  };
}
