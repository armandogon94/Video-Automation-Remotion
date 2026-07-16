/**
 * Tests for the source-aware EditPlan v2 additions + v1 migration helpers
 * (GPT56-FINDINGS §1.2 [OVERTURNED architecture verdict] / §5.5 exact shape).
 *
 * Pure schema/helper tests — no IO, no ffmpeg, no Remotion. Everything here
 * must hold for BOTH freshly built plans and serialized v1 plans on disk:
 * the v2 fields are additive and `.optional()`, `version` stays literal 1,
 * and the v1/v2 distinction is "are `sources` present?", not the version.
 */
import { describe, it, expect } from "vitest";
import {
  editPlanSchema,
  editSegmentSchema,
  isSourceAwarePlan,
  migratePlanToSourceAware,
  sourceForSegment,
  type EditPlan,
  type EditSegment,
} from "./editPlan.js";

/** A timeSpan helper (seconds + frames at 30 fps, like silenceTrim emits). */
const span = (startSeconds: number, endSeconds: number) => ({
  startSeconds,
  endSeconds,
  startFrame: Math.round(startSeconds * 30),
  endFrame: Math.round(endSeconds * 30),
});

/** A v1 segment literal — NO sourceId/kind/take* fields (pre-v2 shape). */
const v1Segment = (id: string, from: number, to: number, editStart: number): unknown => ({
  id,
  source: span(from, to),
  editStartFrame: editStart,
  editEndFrame: editStart + Math.round((to - from) * 30),
  mode: "speaker",
});

/**
 * Build a v1 plan the way `buildEditPlan` does: assemble the literal, then
 * validate through `editPlanSchema.parse` (defaults fill captionTrack,
 * overlayTrack, provenance, fps, version).
 */
const makeV1Plan = (): EditPlan =>
  editPlanSchema.parse({
    sourceVideo: "output/dogfood/berman-end2.mp4",
    aspect: "16:9",
    sourceDurationFrames: 900,
    editDurationFrames: 300,
    segments: [
      v1Segment("seg-0", 0, 5, 0),
      v1Segment("seg-1", 8, 13, 150),
    ],
  });

/** A hand-built, fully source-aware two-source v2 plan (GPT56 §5.5 shape). */
const makeV2TwoSourcePlan = (): EditPlan =>
  editPlanSchema.parse({
    sourceVideo: "takes/file-1.mov", // v1 field: MUST mirror sources[0].path
    aspect: "9:16",
    sourceDurationFrames: 900,
    editDurationFrames: 300,
    sources: [
      { id: "src-file-1", path: "takes/file-1.mov", hash: "abc123" },
      {
        id: "src-file-3",
        path: "takes/file-3.mov",
        probe: { durationSeconds: 42.5, fps: 30, width: 1080, height: 1920, hasAudio: true },
      },
    ],
    segments: [
      {
        ...(v1Segment("seg-0", 0, 5, 0) as object),
        sourceId: "src-file-3",
        kind: "take",
        takeGroupId: "grp-1",
        takeOptionId: "opt-b",
      },
      {
        ...(v1Segment("seg-1", 8, 13, 150) as object),
        sourceId: "src-file-1",
        kind: "take",
        takeGroupId: "grp-2",
        takeOptionId: "opt-a",
      },
    ],
  });

describe("EditPlan v2 schema (additive, non-breaking)", () => {
  it("parses a v1 plan unchanged: sources absent, segments without v2 fields", () => {
    const plan = makeV1Plan();
    expect(plan.version).toBe(1);
    expect(plan.sources).toBeUndefined();
    for (const seg of plan.segments) {
      expect(seg.sourceId).toBeUndefined();
      expect(seg.kind).toBeUndefined();
      expect(seg.takeGroupId).toBeUndefined();
      expect(seg.takeOptionId).toBeUndefined();
    }
  });

  it("parses a hand-built two-source v2 plan and reports it source-aware", () => {
    const plan = makeV2TwoSourcePlan();
    expect(plan.sources).toHaveLength(2);
    expect(plan.sources?.[1].probe?.hasAudio).toBe(true);
    expect(plan.segments[0].takeOptionId).toBe("opt-b");
    expect(isSourceAwarePlan(plan)).toBe(true);
  });

  it("rejects an invalid segment kind", () => {
    const bad = { ...(v1Segment("seg-0", 0, 5, 0) as object), kind: "outtake" };
    expect(() => editSegmentSchema.parse(bad)).toThrow();
  });

  it("keeps version at literal 1 for v2 plans (v1/v2 = sources present, not version)", () => {
    // Nothing in the codebase switches on `version`; a bumped literal would
    // reject every serialized v1 plan on disk. Guard that it stays 1.
    expect(makeV2TwoSourcePlan().version).toBe(1);
    expect(() => editPlanSchema.parse({ ...makeV1Plan(), version: 2 })).toThrow();
  });
});

describe("isSourceAwarePlan", () => {
  it("is false for a v1 plan", () => {
    expect(isSourceAwarePlan(makeV1Plan())).toBe(false);
  });

  it("is false when sources exist but a segment lacks sourceId (half-migrated)", () => {
    const plan = makeV2TwoSourcePlan();
    const half = editPlanSchema.parse({
      ...plan,
      segments: [plan.segments[0], v1Segment("seg-1", 8, 13, 150)],
    });
    expect(isSourceAwarePlan(half)).toBe(false);
  });
});

describe("migratePlanToSourceAware", () => {
  it("fills sources from sourceVideo and stamps sourceId + kind on every segment", () => {
    const migrated = migratePlanToSourceAware(makeV1Plan());
    expect(migrated.sources).toEqual([
      { id: "src-0", path: "output/dogfood/berman-end2.mp4" },
    ]);
    // v1 invariant: sourceVideo must equal sources[0].path in a migrated plan.
    expect(migrated.sourceVideo).toBe(migrated.sources?.[0].path);
    for (const seg of migrated.segments) {
      expect(seg.sourceId).toBe("src-0");
      expect(seg.kind).toBe("take");
    }
    expect(isSourceAwarePlan(migrated)).toBe(true);
  });

  it("validates its result through editPlanSchema (round-trips through parse)", () => {
    const migrated = migratePlanToSourceAware(makeV1Plan());
    expect(() => editPlanSchema.parse(migrated)).not.toThrow();
  });

  it("is idempotent: migrating twice deep-equals migrating once", () => {
    const once = migratePlanToSourceAware(makeV1Plan());
    const twice = migratePlanToSourceAware(once);
    expect(twice).toEqual(once);
  });

  it("honors a custom sourceId", () => {
    const migrated = migratePlanToSourceAware(makeV1Plan(), { sourceId: "berman-a" });
    expect(migrated.sources?.[0].id).toBe("berman-a");
    for (const seg of migrated.segments) expect(seg.sourceId).toBe("berman-a");
  });

  it("stamps kind only where absent — a pre-set kind survives", () => {
    const plan = makeV1Plan();
    const withKind = editPlanSchema.parse({
      ...plan,
      segments: [
        { ...plan.segments[0], kind: "broll" },
        plan.segments[1],
      ],
    });
    const migrated = migratePlanToSourceAware(withKind);
    expect(migrated.segments[0].kind).toBe("broll");
    expect(migrated.segments[1].kind).toBe("take");
  });

  it("throws an actionable error naming a dangling sourceId", () => {
    const plan = makeV2TwoSourcePlan();
    const dangling = editPlanSchema.parse({
      ...plan,
      segments: [
        plan.segments[0],
        { ...plan.segments[1], sourceId: "src-GHOST" },
      ],
    });
    expect(() => migratePlanToSourceAware(dangling)).toThrow(/src-GHOST/);
    expect(() => migratePlanToSourceAware(dangling)).toThrow(/seg-1/);
  });
});

describe("sourceForSegment", () => {
  it("synthesizes the v1 source for a plan without sources (documented fallback)", () => {
    const plan = makeV1Plan();
    expect(sourceForSegment(plan, plan.segments[0])).toEqual({
      id: "src-0",
      path: "output/dogfood/berman-end2.mp4",
    });
  });

  it("resolves by sourceId on a v2 plan", () => {
    const plan = makeV2TwoSourcePlan();
    expect(sourceForSegment(plan, plan.segments[0])?.path).toBe("takes/file-3.mov");
    expect(sourceForSegment(plan, plan.segments[1])?.path).toBe("takes/file-1.mov");
  });

  it("returns undefined for a dangling sourceId on a v2 plan (no silent fallback)", () => {
    const plan = makeV2TwoSourcePlan();
    const ghost: EditSegment = { ...plan.segments[0], sourceId: "src-GHOST" };
    expect(sourceForSegment(plan, ghost)).toBeUndefined();
  });
});

describe("serialization", () => {
  it("a migrated plan survives a JSON round-trip and re-parses deep-equal", () => {
    const migrated = migratePlanToSourceAware(makeV1Plan());
    const roundTripped = editPlanSchema.parse(JSON.parse(JSON.stringify(migrated)));
    expect(roundTripped).toEqual(migrated);
  });

  it("a hand-built v2 plan survives a JSON round-trip and stays source-aware", () => {
    const plan = makeV2TwoSourcePlan();
    const roundTripped = editPlanSchema.parse(JSON.parse(JSON.stringify(plan)));
    expect(roundTripped).toEqual(plan);
    expect(isSourceAwarePlan(roundTripped)).toBe(true);
  });
});
