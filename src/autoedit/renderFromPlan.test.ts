/**
 * Unit tests for the PURE ffmpeg-filtergraph + transcript builders in
 * renderFromPlan.ts. No IO / ffmpeg / Chrome — these functions return strings and
 * arrays, so they are cheap to assert and make the correctness fixes (FABLE
 * §4.6/§4.7/§4.14/§4.16, Tasks 2.3/2.4/2.9/2.10) regression-safe.
 */
import { describe, it, expect } from "vitest";
import {
  buildTrimConcatFilter,
  buildMultiSourceConcatFilter,
  buildCombinedTranscript,
  hdrColorFixFilter,
  type ReelBeat,
} from "./renderFromPlan.js";
import type { EditPlanWord, EditSegment } from "./editPlan.js";

const seg = (
  i: number,
  startSeconds: number,
  endSeconds: number,
  grade?: EditSegment["grade"],
): EditSegment => ({
  id: `seg-${i}`,
  source: {
    startSeconds,
    endSeconds,
    startFrame: Math.round(startSeconds * 30),
    endFrame: Math.round(endSeconds * 30),
  },
  editStartFrame: 0,
  editEndFrame: Math.round((endSeconds - startSeconds) * 30),
  mode: "speaker",
  ...(grade ? { grade } : {}),
});

describe("buildTrimConcatFilter — Task 2.3 (grade order) + 2.4 (audio format)", () => {
  it("SDR + graded segment: grade present, NO lut3d, aformat on every audio chain", () => {
    const { filter, hasAudio } = buildTrimConcatFilter(
      [seg(0, 0, 2, "warm-cinematic"), seg(1, 5, 8)],
      1080,
      1920,
      30,
      false, // SDR
      "/luts/hlg.cube",
    );
    expect(hasAudio).toBe(true);
    // Grade lands only in the graded segment's chain, before concat.
    expect(filter).toContain("[v0]");
    expect(filter).toMatch(/trim=start=0:end=2,setpts=PTS-STARTPTS,eq=contrast=1\.06/);
    // SDR → no LUT anywhere.
    expect(filter).not.toContain("lut3d");
    // Audio normalized to 48k stereo fltp (not a bare aresample) in every chain.
    const aformatCount = (filter.match(/aformat=sample_fmts=fltp/g) ?? []).length;
    expect(aformatCount).toBe(2);
    expect(filter).not.toContain("aresample=48000[");
  });

  it("HDR: lut3d appears BEFORE the eq grade in the SAME segment chain, not after [vcat]", () => {
    const { filter } = buildTrimConcatFilter(
      [seg(0, 0, 2, "neutral-punch")],
      1080,
      1920,
      30,
      true, // HDR
      "/luts/hlg.cube",
    );
    const lutIdx = filter.indexOf("lut3d");
    const eqIdx = filter.indexOf("eq=contrast");
    expect(lutIdx).toBeGreaterThan(-1);
    expect(eqIdx).toBeGreaterThan(-1);
    expect(lutIdx).toBeLessThan(eqIdx); // LUT (tonemap) before grade → grade in SDR
    // The post-concat scale chain must NOT re-apply the LUT.
    const scalePart = filter.slice(filter.indexOf("[vcat]"));
    expect(scalePart).not.toContain("lut3d");
  });

  it("audio-less source: video-only graph, no [aout], no audio chains", () => {
    const { filter, hasAudio } = buildTrimConcatFilter(
      [seg(0, 0, 2)],
      1080,
      1920,
      30,
      false,
      "",
      false, // hasAudio=false
    );
    expect(hasAudio).toBe(false);
    expect(filter).not.toContain("[0:a]");
    expect(filter).not.toContain("[aout]");
    expect(filter).toContain("[vout]");
  });

  it("clamps the fade to half the segment for a very short (0.1s) keep", () => {
    const { filter } = buildTrimConcatFilter([seg(0, 0, 0.1)], 1080, 1920, 30);
    // 0.1s segment → fade d = min(0.03, 0.05) = 0.03; fade-out st = 0.1 - 0.03 = 0.070.
    expect(filter).toContain("afade=t=in:st=0:d=0.03");
    expect(filter).toContain("afade=t=out:st=0.070:d=0.03");
  });
});

describe("buildMultiSourceConcatFilter — Task 2.3 (per-beat grade) + 2.4 (audio)", () => {
  const beat = (
    i: number,
    isHdr: boolean,
    grade?: ReelBeat["grade"],
  ): ReelBeat & { isHdr: boolean } => ({
    sourceFile: `/clip${i}.mp4`,
    startSec: 0,
    endSec: 3,
    isHdr,
    ...(grade ? { grade } : {}),
  });

  it("applies lut3d only to the HDR beat and grade after the colorFix, per input index", () => {
    const { filter } = buildMultiSourceConcatFilter(
      [beat(0, true, "cool"), beat(1, false)],
      1080,
      1920,
      30,
      "/luts/hlg.cube",
    );
    // Input indices correct.
    expect(filter).toContain("[0:v]trim=");
    expect(filter).toContain("[1:v]trim=");
    // Beat 0 (HDR + grade): lut3d then eq, in order.
    const v0 = filter.slice(filter.indexOf("[0:v]"), filter.indexOf("[v0]"));
    expect(v0.indexOf("lut3d")).toBeGreaterThan(-1);
    expect(v0.indexOf("lut3d")).toBeLessThan(v0.indexOf("eq="));
    // Beat 1 (SDR, ungraded): no lut3d, no eq.
    const v1 = filter.slice(filter.indexOf("[1:v]"), filter.indexOf("[v1]"));
    expect(v1).not.toContain("lut3d");
    expect(v1).not.toContain("eq=");
    // Audio normalized (not bare aresample) on every beat.
    expect((filter.match(/aformat=sample_fmts=fltp/g) ?? []).length).toBe(2);
  });
});

describe("SAR normalization — mixed-aspect reel concat (FABLE follow-up)", () => {
  // A landscape beat scaled-to-cover a portrait canvas yields a non-1:1 SAR
  // (e.g. 10240:10239), while a portrait beat yields 1:1; ffmpeg `concat` rejects
  // the mismatch. Every per-input chain must carry setsar=1.
  it("buildMultiSourceConcatFilter: setsar=1 in EVERY per-input video chain", () => {
    const b = (i: number): ReelBeat & { isHdr: boolean } => ({
      sourceFile: `/clip${i}.mp4`,
      startSec: 0,
      endSec: 3,
      isHdr: false,
    });
    const { filter } = buildMultiSourceConcatFilter([b(0), b(1), b(2)], 1080, 1920, 30, "");
    expect((filter.match(/setsar=1/g) ?? []).length).toBe(3);
  });

  it("buildTrimConcatFilter: setsar=1 in the post-concat scale chain (defensive)", () => {
    const { filter } = buildTrimConcatFilter([seg(0, 0, 2)], 1080, 1920, 30, false, "");
    expect(filter.slice(filter.indexOf("[vcat]"))).toContain("setsar=1");
  });
});

describe("buildCombinedTranscript — Task 2.9 boundary clamp", () => {
  const w = (text: string, s: number, e: number): EditPlanWord => ({
    text,
    startSeconds: s,
    endSeconds: e,
    startFrame: Math.round(s * 30),
    endFrame: Math.round(e * 30),
  });

  it("rebases words per beat and clamps a straddling word to the beat's rebased end", () => {
    const beats: ReelBeat[] = [
      { sourceFile: "/a.mp4", startSec: 0, endSec: 2 },
      { sourceFile: "/b.mp4", startSec: 10, endSec: 13 },
    ];
    const wordsPerBeat: EditPlanWord[][] = [
      // starts inside beat 0 but ends past its end (2s) → clamp to 2s on-timeline.
      [w("straddle", 1.9, 2.5), w("outside", 3, 3.4)],
      [w("second", 10.5, 10.9)],
    ];
    const { words, totalFrames } = buildCombinedTranscript(beats, wordsPerBeat, 30);
    // "outside" started past beat 0's end → dropped. "straddle" + "second" kept.
    expect(words.map((x) => x.text)).toEqual(["straddle", "second"]);
    // straddle clamped: on-timeline end ≤ beat 0 length (2s → frame 60).
    expect(words[0].endFrame).toBeLessThanOrEqual(60);
    // second rebased: beat 1 starts at offset 2s; 10.5 - 10 + 2 = 2.5s → frame 75.
    expect(words[1].startFrame).toBe(75);
    // total = 2 + 3 = 5s → 150 frames.
    expect(totalFrames).toBe(150);
  });
});

describe("hdrColorFixFilter — Task 2.10 apostrophe quoting", () => {
  it("emits ffmpeg-correct single-quote escaping for a path containing an apostrophe", () => {
    const out = hdrColorFixFilter(true, "/Users/Armando's Projects/hlg.cube");
    // Correct ffmpeg idiom: each ' becomes '\'' inside the surrounding quotes.
    expect(out).toBe("lut3d=file='/Users/Armando'\\''s Projects/hlg.cube',");
    // The broken old idiom (a literal \' ) must NOT appear.
    expect(out).not.toContain("Armando\\'s");
  });

  it("returns empty string for an SDR source", () => {
    expect(hdrColorFixFilter(false, "/luts/hlg.cube")).toBe("");
  });
});
