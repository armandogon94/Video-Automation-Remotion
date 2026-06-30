import { describe, it, expect } from "vitest";
import { cutBoundariesFromPlan } from "./selfEvalRender";

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
