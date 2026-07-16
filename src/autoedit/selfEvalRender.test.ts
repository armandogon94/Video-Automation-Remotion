import { describe, it, expect } from "vitest";
import {
  buildReport,
  cutBoundariesFromPlan,
  evaluateFrameZeroStats,
  lumaStddevEstimate,
  parseSignalStats,
  type ReportInput,
} from "./selfEvalRender";

const seg = (id: string, editStartFrame: number, editEndFrame: number) => ({
  id,
  editStartFrame,
  editEndFrame,
});

describe("cutBoundariesFromPlan", () => {
  it("returns N-1 boundaries for N segments, at each join", () => {
    const b = cutBoundariesFromPlan({
      fps: 30,
      editDurationFrames: 150,
      segments: [seg("seg-0", 0, 45), seg("seg-1", 45, 100), seg("seg-2", 100, 150)],
    });
    expect(b).toHaveLength(2);
    expect(b[0]).toMatchObject({ index: 1, afterSegmentId: "seg-0", beforeFrame: 44, afterFrame: 45 });
    expect(b[0].outputSeconds).toBeCloseTo(45 / 30);
    expect(b[1]).toMatchObject({ index: 2, afterSegmentId: "seg-1", beforeFrame: 99, afterFrame: 100 });
  });

  it("has no internal cuts for a single segment", () => {
    expect(cutBoundariesFromPlan({ fps: 30, editDurationFrames: 150, segments: [seg("seg-0", 0, 150)] })).toEqual([]);
  });

  it("has no cuts for an empty plan", () => {
    expect(cutBoundariesFromPlan({ fps: 30, editDurationFrames: 0, segments: [] })).toEqual([]);
  });

  it("clamps beforeFrame at 0 for a zero-length leading segment", () => {
    const b = cutBoundariesFromPlan({
      fps: 30,
      editDurationFrames: 60,
      segments: [seg("seg-0", 0, 0), seg("seg-1", 0, 60)],
    });
    expect(b[0].beforeFrame).toBe(0);
    expect(b[0].afterFrame).toBe(0);
  });
});

describe("evaluateFrameZeroStats (owner §9.9 near-flat threshold)", () => {
  it("flags a frame just under the threshold (5.9 → suspect empty)", () => {
    expect(evaluateFrameZeroStats(5.9)).toBe(true);
  });

  it("passes a frame just over the threshold (6.1 → not suspect)", () => {
    expect(evaluateFrameZeroStats(6.1)).toBe(false);
  });

  it("flags a perfectly flat frame (0)", () => {
    expect(evaluateFrameZeroStats(0)).toBe(true);
  });
});

describe("lumaStddevEstimate", () => {
  it("is 0 for a flat frame (10th == 90th percentile)", () => {
    expect(lumaStddevEstimate({ ylow: 16, yhigh: 16 })).toBe(0);
  });

  it("estimates sigma from the 10-90 percentile spread (spread/2.56)", () => {
    expect(lumaStddevEstimate({ ylow: 40, yhigh: 168 })).toBeCloseTo(50);
  });
});

describe("parseSignalStats", () => {
  const sample = [
    "frame:0    pts:0       pts_time:0",
    "lavfi.signalstats.YMIN=16",
    "lavfi.signalstats.YLOW=17",
    "lavfi.signalstats.YAVG=18.35",
    "lavfi.signalstats.YHIGH=20",
    "lavfi.signalstats.YMAX=235",
    "lavfi.signalstats.UMIN=118",
  ].join("\n");

  it("parses the luma keys out of metadata=print output", () => {
    expect(parseSignalStats(sample)).toEqual({
      ymin: 16,
      ylow: 17,
      yavg: 18.35,
      yhigh: 20,
      ymax: 235,
    });
  });

  it("returns null when a required key is missing", () => {
    expect(parseSignalStats("lavfi.signalstats.YMIN=16")).toBeNull();
    expect(parseSignalStats("")).toBeNull();
  });
});

describe("buildReport", () => {
  const baseInput = (over: Partial<ReportInput> = {}): ReportInput => ({
    mp4Path: "/out/edit.mp4",
    pass: 1,
    expectedSeconds: 5,
    actualSeconds: 5.01,
    durationDeltaSeconds: 0.01,
    durationOk: true,
    audioSeconds: 5.0,
    avDurationDeltaSeconds: 0.01,
    avDurationOk: true,
    boundaries: [],
    sampled: [],
    cutsDropped: 0,
    contactSheetPath: null,
    frameZeroPath: "/out/selfeval-frame0.png",
    frameZeroStats: { yavg: 100, ymin: 16, ymax: 235, ylow: 40, yhigh: 168 },
    frameZeroLumaStddev: 50,
    frameZeroSuspectEmpty: false,
    ...over,
  });

  it("always contains the frame-0 hook checklist line (owner hard rule §9.9)", () => {
    const report = buildReport(baseInput());
    expect(report).toContain(
      "- [ ] frame 0 contains a non-caption visual hook (owner hard rule §9.9) — see selfeval-frame0.png",
    );
  });

  it("lists audio listening as a REQUIRED HUMAN step", () => {
    const report = buildReport(baseInput());
    expect(report).toContain("REQUIRED HUMAN steps");
    expect(report).toContain("- [ ] LISTEN to the full audio track");
    expect(report).toContain("NO audio analysis");
  });

  it("attaches the frame-0 png path", () => {
    expect(buildReport(baseInput())).toContain("/out/selfeval-frame0.png");
  });

  it("warns when frame 0 is suspect-empty, and not otherwise", () => {
    const flagged = buildReport(baseInput({ frameZeroLumaStddev: 2, frameZeroSuspectEmpty: true }));
    expect(flagged).toContain("⚠ frame 0 is near-flat");
    const clean = buildReport(baseInput());
    expect(clean).not.toContain("⚠ frame 0 is near-flat");
  });

  it("reports A/V agreement and flags a >0.1s mismatch", () => {
    const ok = buildReport(baseInput());
    expect(ok).toContain("**A/V duration agreement:**");
    expect(ok).not.toContain("MISMATCH ⚠️ (Δ >");
    const bad = buildReport(
      baseInput({ audioSeconds: 4.7, avDurationDeltaSeconds: 0.31, avDurationOk: false }),
    );
    expect(bad).toContain("MISMATCH ⚠️ (Δ > 0.1s)");
  });

  it("flags a missing/unreadable audio stream", () => {
    const report = buildReport(
      baseInput({ audioSeconds: null, avDurationDeltaSeconds: null, avDurationOk: false }),
    );
    expect(report).toContain("audio stream missing or unreadable ⚠️");
  });
});
