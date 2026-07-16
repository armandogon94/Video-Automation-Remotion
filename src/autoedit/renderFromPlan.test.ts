/**
 * Unit tests for the PURE ffmpeg-filtergraph + transcript + scene-prop builders
 * in renderFromPlan.ts. The main body needs no IO / ffmpeg / Chrome — those
 * functions return strings and plain objects, so they are cheap to assert and
 * make the correctness fixes (FABLE §4.6/§4.7/§4.14/§4.16, Tasks
 * 2.3/2.4/2.9/2.10; GPT-5.6 Findings 2.1/2.2/2.3/2.5 + the V24 regression)
 * regression-safe. One trailing describe block runs a REAL ffmpeg/ffprobe
 * integration pass over tiny lavfi-generated clips (GPT-5.6 Findings 2.2/2.3);
 * it self-skips when ffmpeg/ffprobe are not on PATH.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { execaSync } from "execa";
import fs from "fs";
import os from "os";
import path from "path";
import {
  buildTrimConcatFilter,
  buildMultiSourceConcatFilter,
  buildCombinedTranscript,
  buildSceneProps,
  computeBeatTimings,
  hdrColorFixFilter,
  type ReelBeat,
  type ResolvedBeat,
} from "./renderFromPlan.js";
import { editPlanSchema } from "./editPlan.js";
import type { EditPlan, EditPlanWord, EditSegment } from "./editPlan.js";

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

describe("computeBeatTimings — GPT-5.6 Finding 2.2 (one canonical beat timing)", () => {
  const beat = (startSec: number, endSec: number, label?: string): ReelBeat => ({
    sourceFile: "/clip.mp4",
    startSec,
    endSec,
    ...(label ? { label } : {}),
  });

  it("25 × 1.03s @ 30fps: last editEndFrame is 773 and every boundary is within half a frame of ideal", () => {
    // GPT's exact stress case: the old per-input `fps` quantization staged 775
    // frames against a 773-frame plan. Cumulative quantization → 773 everywhere.
    const beats = Array.from({ length: 25 }, () => beat(0, 1.03));
    const timings = computeBeatTimings(beats, 30);
    expect(timings).toHaveLength(25);
    expect(timings[24].editEndFrame).toBe(773);
    // Per-boundary error vs the ideal (un-rounded) cumulative boundary: < 0.5
    // frame at every join (allow fp epsilon for the exact-half 772.5 boundary).
    let cum = 0;
    for (const t of timings) {
      cum += t.lenSeconds;
      expect(Math.abs(t.editEndFrame - cum * 30)).toBeLessThanOrEqual(0.5 + 1e-6);
    }
    // Contiguity: each beat starts exactly where the previous one ended.
    timings.forEach((t, i) => {
      expect(t.editStartFrame).toBe(i === 0 ? 0 : timings[i - 1].editEndFrame);
      expect(t.editEndFrame).toBeGreaterThan(t.editStartFrame);
    });
  });

  it("a 10 ms beat throws an actionable error instead of silently vanishing", () => {
    // GPT's sub-frame case: 10 ms @ 30fps quantizes to 0 frames. That take
    // would disappear from the staged video — must be an explicit error.
    expect(() => computeBeatTimings([beat(5, 5.01, "hook")], 30)).toThrow(
      /quantizes to 0 frames/,
    );
    // The message names the offending beat (index, label, file, range).
    expect(() => computeBeatTimings([beat(5, 5.01, "hook")], 30)).toThrow(
      /beat 0 \("hook"\) \[\/clip\.mp4 5s→5\.01s\]/,
    );
    // Ten 10 ms beats (GPT's exact driver): fails fast on the first one.
    const tiny = Array.from({ length: 10 }, () => beat(0, 0.01));
    expect(() => computeBeatTimings(tiny, 30)).toThrow(/beat 0/);
  });

  it("zero-length and reversed beats throw with the beat identified", () => {
    expect(() => computeBeatTimings([beat(2, 2)], 30)).toThrow(
      /non-positive length/,
    );
    expect(() => computeBeatTimings([beat(0, 1), beat(3, 1, "cta")], 30)).toThrow(
      /beat 1 \("cta"\).*non-positive length/,
    );
  });

  it("mixed beats: boundaries quantize CUMULATIVELY, not per beat", () => {
    // Two 1.015s beats: per-beat rounding would give 30 + 30 = 60 frames, but
    // the cumulative boundary is round(2.03 · 30) = round(60.9) = 61.
    const timings = computeBeatTimings(
      [beat(0, 1.015), beat(2, 3.015), beat(0, 0.5)],
      30,
    );
    expect(timings[0]).toMatchObject({
      index: 0,
      startSec: 0,
      endSec: 1.015,
      editStartFrame: 0,
      editEndFrame: 30, // round(30.45)
    });
    expect(timings[0].lenSeconds).toBeCloseTo(1.015, 10);
    expect(timings[1]).toMatchObject({
      index: 1,
      startSec: 2,
      endSec: 3.015,
      editStartFrame: 30,
      editEndFrame: 61, // round(60.9) — cumulative, NOT 30+30
    });
    expect(timings[2]).toMatchObject({
      index: 2,
      editStartFrame: 61,
      editEndFrame: 76, // round(2.53 · 30) = round(75.9)
    });
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

describe("buildMultiSourceConcatFilter — GPT-5.6 2.2 (single fps) + 2.3 (audio-less beats)", () => {
  const rb = (i: number, over: Partial<ResolvedBeat> = {}): ResolvedBeat => ({
    sourceFile: `/clip${i}.mp4`,
    startSec: 0,
    endSec: 3,
    isHdr: false,
    ...over,
  });

  it("per-beat frame quantization (Sol §2.3): fps+tpad+trim=end_frame on EVERY input chain; post-concat cap is a secondary invariant only", () => {
    const { filter } = buildMultiSourceConcatFilter(
      [rb(0), rb(1), rb(2)],
      1080,
      1920,
      30,
      "",
    );
    // Sol 2026-07-16 §2.3 OVERTURNED the single-post-concat-fps design: seconds
    // trims keep every source frame in range, the surplus accumulates across
    // joins (interior beats start 1–2 frames late), and a global tail cap only
    // conceals it by truncating the LAST beat. Each beat's chain must therefore
    // be forced to EXACTLY its canonical frame count BEFORE the concat.
    const concatIdx = filter.indexOf("concat=n=3:v=1:a=0[vcat]");
    expect(concatIdx).toBeGreaterThan(-1);
    // One quantization tail per input (3 × 3s beats → 90 frames each), all
    // BEFORE the concat.
    const tails = [...filter.matchAll(/fps=30,tpad=stop_mode=clone:stop=-1,trim=end_frame=90/g)];
    expect(tails).toHaveLength(3);
    for (const t of tails) expect(t.index).toBeLessThan(concatIdx);
    // Post-concat: NO fps resample (nothing left to fix), just the frame-exact
    // cap at the canonical total (270) as a no-op secondary invariant.
    expect(filter).toContain("[vcat]trim=end_frame=270[vout]");
    expect(filter.slice(concatIdx)).not.toContain("fps=");
    // Per-input normalization retained: scale/crop/format/setparams per beat.
    expect((filter.match(/scale=1080:1920/g) ?? []).length).toBe(3);
    expect((filter.match(/crop=1080:1920/g) ?? []).length).toBe(3);
    expect((filter.match(/format=yuv420p/g) ?? []).length).toBe(3);
    expect((filter.match(/setparams=range=tv/g) ?? []).length).toBe(3);
    // Per-input aformat (48k stereo fltp) retained on every audio chain, and
    // every voiced chain is pinned to its canonical length (apad + atrim).
    expect((filter.match(/aformat=sample_fmts=fltp/g) ?? []).length).toBe(3);
    expect((filter.match(/apad=whole_dur=3\.000000,atrim=end=3\.000000/g) ?? []).length).toBe(3);
  });

  it("mixed reel: the silent beat gets an anullsrc lavfi input in place of its [i:a]", () => {
    const { filter, lavfiInputs, hasAudio } = buildMultiSourceConcatFilter(
      [rb(0), rb(1, { hasAudio: false, startSec: 0, endSec: 1.03 }), rb(2)],
      1080,
      1920,
      30,
      "",
    );
    expect(hasAudio).toBe(true);
    // One synthesized-silence input, to be appended AFTER the 3 real sources.
    expect(lavfiInputs).toEqual([
      "anullsrc=channel_layout=stereo:sample_rate=48000",
    ]);
    // Input-index bookkeeping: real sources are inputs 0..2, so the silence is
    // ffmpeg input 3 — trimmed to exactly the beat's CANONICAL length (the
    // 1.03s beat spans edit frames 90→121 = 31 frames = 1.033333s; Sol §2.3).
    expect(filter).toContain("[3:a]atrim=start=0:end=1.033333,asetpts=PTS-STARTPTS");
    // The silent beat's non-existent audio stream is NEVER referenced.
    expect(filter).not.toContain("[1:a]");
    // Voiced beats keep their real audio chains.
    expect(filter).toContain("[0:a]atrim=");
    expect(filter).toContain("[2:a]atrim=");
    // The silence lands in the a1 slot, preserving beat order in the concat.
    expect(filter).toContain("[a0][a1][a2]concat=n=3:v=0:a=1[aout]");
    // Silence is normalized like every other chain (48k stereo fltp).
    expect((filter.match(/aformat=sample_fmts=fltp/g) ?? []).length).toBe(3);
  });

  it("all beats silent → video-only graph: no [aout], no anullsrc, hasAudio=false", () => {
    const { filter, lavfiInputs, hasAudio } = buildMultiSourceConcatFilter(
      [rb(0, { hasAudio: false }), rb(1, { hasAudio: false })],
      1080,
      1920,
      30,
      "",
    );
    expect(hasAudio).toBe(false);
    expect(lavfiInputs).toEqual([]);
    expect(filter).not.toContain("[aout]");
    expect(filter).not.toContain("anullsrc");
    expect(filter).not.toContain(":a]");
    expect(filter).toContain("[vout]");
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

  it("uses the PROVIDED BeatTiming[]: a word at beat 2's source start lands at beat 1's editEndFrame (Finding 2.2)", () => {
    const beats: ReelBeat[] = [
      { sourceFile: "/a.mp4", startSec: 0, endSec: 1.03 },
      { sourceFile: "/b.mp4", startSec: 10, endSec: 11 },
    ];
    // Deliberately NOT computeBeatTimings' output (that would give 31/61): if
    // buildCombinedTranscript re-derived offsets from seconds it would place the
    // word at frame 31 — landing at 40 proves the injected timings are used.
    const timings = [
      { index: 0, startSec: 0, endSec: 1.03, lenSeconds: 1.03, editStartFrame: 0, editEndFrame: 40 },
      { index: 1, startSec: 10, endSec: 11, lenSeconds: 1, editStartFrame: 40, editEndFrame: 70 },
    ];
    const wordsPerBeat: EditPlanWord[][] = [[], [w("segundo", 10, 10.3)]];
    const { words, totalFrames } = buildCombinedTranscript(beats, wordsPerBeat, 30, timings);
    expect(words).toHaveLength(1);
    expect(words[0].startFrame).toBe(timings[0].editEndFrame); // 40, not 31
    expect(words[0].startFrame).toBe(timings[1].editStartFrame);
    // totalFrames comes from the timings too, never re-summed seconds.
    expect(totalFrames).toBe(70);
  });

  it("default timings quantize offsets at beat boundaries — no mid-reel caption drift (Finding 2.2)", () => {
    // Beat 0 is 1.015s → canonical boundary round(30.45) = frame 30 (2.0 frames
    // of source become 1 output frame at the join). A word 0.48s into beat 1
    // must be measured from the QUANTIZED boundary (30/30 s → frame 44), not
    // from the exact seconds sum (1.495s → frame 45) the old code used.
    const beats: ReelBeat[] = [
      { sourceFile: "/a.mp4", startSec: 0, endSec: 1.015 },
      { sourceFile: "/b.mp4", startSec: 0, endSec: 1.015 },
    ];
    const wordsPerBeat: EditPlanWord[][] = [[], [w("drift", 0.48, 0.7)]];
    const { words, totalFrames } = buildCombinedTranscript(beats, wordsPerBeat, 30);
    expect(words[0].startFrame).toBe(44);
    expect(totalFrames).toBe(61); // round(2.03 · 30) — matches computeBeatTimings
  });

  it("clamps a straddling word's endFrame at the beat's canonical editEndFrame", () => {
    const beats: ReelBeat[] = [
      { sourceFile: "/a.mp4", startSec: 0, endSec: 1.015 },
      { sourceFile: "/b.mp4", startSec: 0, endSec: 1.015 },
    ];
    // Word starts inside beat 0 but its source end runs long past the beat.
    const wordsPerBeat: EditPlanWord[][] = [[w("largo", 0.9, 2.0)], []];
    const { words } = buildCombinedTranscript(beats, wordsPerBeat, 30);
    expect(words[0].endFrame).toBe(30); // beat 0's editEndFrame = round(30.45)
    expect(words[0].endSeconds).toBeCloseTo(1, 10); // 30 / 30fps
  });

  it("throws when the provided timings do not match the beats 1:1", () => {
    const beats: ReelBeat[] = [{ sourceFile: "/a.mp4", startSec: 0, endSec: 1 }];
    expect(() => buildCombinedTranscript(beats, [[]], 30, [])).toThrow(
      /timings length \(0\) does not match beats length \(1\)/,
    );
  });
});

describe("buildSceneProps — V24 regression + GPT-5.6 Findings 2.1 / 2.5", () => {
  type OverlayInstance = EditPlan["overlayTrack"][number];

  const makePlan = (overrides: Record<string, unknown> = {}): EditPlan =>
    editPlanSchema.parse({
      sourceVideo: "/source.mov",
      aspect: "9:16",
      sourceDurationFrames: 300,
      editDurationFrames: 240,
      ...overrides,
    });

  const ov = (overrides: Partial<OverlayInstance> = {}): OverlayInstance => ({
    id: "ov-0",
    type: "IconPopOverSpeaker",
    anchor: "top-right",
    fromFrame: 30,
    toFrame: 90,
    props: {},
    confidence: 0.5,
    reason: "",
    ...overrides,
  });

  const STAGED = "autoedit/test-clip.mp4";
  const build = (plan: EditPlan) =>
    buildSceneProps(plan, STAGED, 240, "editorial-cyan", undefined);

  it("forwards fromFrame/toFrame per overlay to the scene (V24 entry timing)", () => {
    const plan = makePlan({
      overlayTrack: [ov(), ov({ id: "ov-1", fromFrame: 100, toFrame: 150 })],
    });
    const overlays = build(plan).overlays as Record<string, unknown>[];
    expect(overlays).toHaveLength(2);
    expect(overlays[0]).toMatchObject({
      type: "IconPopOverSpeaker",
      fromFrame: 30,
      toFrame: 90,
    });
    expect(overlays[1]).toMatchObject({ fromFrame: 100, toFrame: 150 });
  });

  it("plan-level validated anchor overrides a conflicting props.anchor (Finding 2.5.2)", () => {
    const plan = makePlan({
      overlayTrack: [ov({ props: { anchor: "bottom-left", size: 200 } })],
    });
    const overlays = build(plan).overlays as { props: Record<string, unknown> }[];
    expect(overlays[0].props.anchor).toBe("top-right");
    // Non-scheduling content props still pass through untouched.
    expect(overlays[0].props.size).toBe(200);
  });

  it("strips scheduling keys (fromFrame/toFrame/enterFrame) arriving inside props (Finding 2.5.2)", () => {
    const plan = makePlan({
      overlayTrack: [
        ov({ props: { enterFrame: 12, fromFrame: 5, toFrame: 500, icon: "🔥" } }),
      ],
    });
    const overlays = build(plan).overlays as Record<string, unknown>[];
    const p = overlays[0].props as Record<string, unknown>;
    expect(p).not.toHaveProperty("enterFrame");
    expect(p).not.toHaveProperty("fromFrame");
    expect(p).not.toHaveProperty("toFrame");
    expect(p.icon).toBe("🔥");
    // Top-level scheduling stays authoritative (the validated plan window).
    expect(overlays[0].fromFrame).toBe(30);
    expect(overlays[0].toFrame).toBe(90);
  });

  it("injects exitFrame = window length so molecule outros finish before the Sequence unmount (§1.3 / Finding 2.5.1)", () => {
    // The Berman dogfood hard cut: IconPopOverSpeaker full-size at frame 192,
    // gone at 193 — its internal clock never knew the 38-frame window. The
    // injected LOCAL exitFrame (Sequence rebases to frame 0) is the window
    // length, so the outro completes exactly at unmount.
    const plan = makePlan({
      overlayTrack: [ov({ fromFrame: 155, toFrame: 193, props: { icon: "🧠" } })],
    });
    const overlays = build(plan).overlays as { props: Record<string, unknown> }[];
    expect(overlays[0].props.exitFrame).toBe(38); // 193 - 155
    expect(overlays[0].props.icon).toBe("🧠");
  });

  it("does NOT override an explicit props.exitFrame from the planner", () => {
    const plan = makePlan({
      overlayTrack: [ov({ props: { exitFrame: 25 } })], // window 30→90
    });
    const overlays = build(plan).overlays as { props: Record<string, unknown> }[];
    expect(overlays[0].props.exitFrame).toBe(25);
  });

  it("drops overlays with invalid windows (zero-length, reversed, negative, non-finite) and warns (Finding 2.5.3)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const plan = makePlan();
      // Assigned post-parse: editPlanSchema's z.number() rejects NaN, but
      // buildSceneProps is pure and must defend against hand-built plans too.
      plan.overlayTrack = [
        ov(), // valid — the only survivor
        ov({ id: "ov-zero", fromFrame: 50, toFrame: 50 }),
        ov({ id: "ov-rev", fromFrame: 80, toFrame: 40 }),
        ov({ id: "ov-neg", fromFrame: -10, toFrame: 20 }),
        ov({ id: "ov-nan", fromFrame: Number.NaN, toFrame: 60 }),
      ];
      const overlays = build(plan).overlays as Record<string, unknown>[];
      expect(overlays).toHaveLength(1);
      expect(overlays[0]).toMatchObject({ fromFrame: 30, toFrame: 90 });
      expect(warn).toHaveBeenCalledTimes(4);
      const warned = warn.mock.calls.map((c) => String(c[0])).join("\n");
      for (const id of ["ov-zero", "ov-rev", "ov-neg", "ov-nan"]) {
        expect(warned).toContain(id);
      }
      expect(warned).toContain("IconPopOverSpeaker");
    } finally {
      warn.mockRestore();
    }
  });

  it("non-empty layoutTrack maps the staged clip to camSrc AND keeps videoSrc (Finding 2.1)", () => {
    const plan = makePlan({
      layoutTrack: [{ startFrame: 0, endFrame: 120, layout: "full-cam" }],
    });
    const props = build(plan);
    expect(props.camSrc).toBe(STAGED);
    expect(props.videoSrc).toBe(STAGED);
    expect(props.layoutTrack).toBeDefined();
  });

  it("no layoutTrack → camSrc absent, legacy videoSrc mode untouched", () => {
    const props = build(makePlan());
    expect(props).not.toHaveProperty("camSrc");
    expect(props.videoSrc).toBe(STAGED);
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

// ─────────────────────────────────────────────────────────────────────────────
// REAL ffmpeg/ffprobe integration — GPT-5.6 Findings 2.2 + 2.3 end-to-end.
// Generates tiny lavfi clips (one WITHOUT audio), runs the actual built
// filtergraph through ffmpeg exactly as stageMultiSourceClip does, and asserts
// the staged video frame count equals the canonical BeatTiming plan and that
// synthesized silence keeps the audio track at full length. Self-skips when
// ffmpeg/ffprobe are not installed.
// ─────────────────────────────────────────────────────────────────────────────

const ffmpegAvailable = (() => {
  try {
    execaSync("ffmpeg", ["-version"]);
    execaSync("ffprobe", ["-version"]);
    return true;
  } catch {
    return false;
  }
})();

describe.skipIf(!ffmpegAvailable)(
  "multi-source staging integration (real ffmpeg) — Findings 2.2 + 2.3",
  () => {
    let dir: string;
    let clipA: string; // portrait, WITH audio
    let clipB: string; // landscape, NO audio (-an)
    let clipC: string; // square, WITH audio

    const gen = (out: string, size: string, withAudio: boolean) => {
      const videoIn = ["-f", "lavfi", "-i", `testsrc2=duration=1.5:size=${size}:rate=30`];
      const audioIn = withAudio
        ? ["-f", "lavfi", "-i", "sine=frequency=440:duration=1.5:sample_rate=48000"]
        : [];
      execaSync("ffmpeg", [
        "-y",
        ...videoIn,
        ...audioIn,
        ...(withAudio ? ["-map", "0:v", "-map", "1:a", "-c:a", "aac"] : ["-an"]),
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        out,
      ]);
    };

    beforeAll(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), "renderfromplan-it-"));
      clipA = path.join(dir, "a.mp4");
      clipB = path.join(dir, "b.mp4");
      clipC = path.join(dir, "c.mp4");
      gen(clipA, "320x568", true);
      gen(clipB, "640x360", false);
      gen(clipC, "320x320", true);
    }, 120_000);

    afterAll(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    /** Run ffmpeg with the built graph exactly as stageMultiSourceClip does. */
    const stage = (
      resolved: ResolvedBeat[],
      out: string,
      fps: number,
    ): { hasAudio: boolean } => {
      const { filter, lavfiInputs, hasAudio } = buildMultiSourceConcatFilter(
        resolved,
        540,
        960,
        fps,
        "",
      );
      const inputArgs = resolved.flatMap((b) => ["-i", b.sourceFile]);
      const lavfiArgs = lavfiInputs.flatMap((spec) => ["-f", "lavfi", "-i", spec]);
      const audioArgs = hasAudio
        ? ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
        : ["-an"];
      execaSync("ffmpeg", [
        "-y",
        ...inputArgs,
        ...lavfiArgs,
        "-filter_complex",
        filter,
        "-map",
        "[vout]",
        ...audioArgs,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        out,
      ]);
      return { hasAudio };
    };

    const probeFrames = (file: string): number =>
      Number(
        execaSync("ffprobe", [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-count_frames",
          "-show_entries",
          "stream=nb_read_frames",
          "-of",
          "csv=p=0",
          file,
        ]).stdout.trim(),
      );

    const probeAudioStreams = (file: string): string =>
      execaSync("ffprobe", [
        "-v",
        "error",
        "-select_streams",
        "a",
        "-show_entries",
        "stream=index",
        "-of",
        "csv=p=0",
        file,
      ]).stdout.trim();

    it(
      "mixed reel (fractional beats, one audio-less source): staged frames === plan frames, audio spans the full reel",
      () => {
        const beats: ReelBeat[] = [
          { sourceFile: clipA, startSec: 0, endSec: 1.03 },
          { sourceFile: clipB, startSec: 0.2, endSec: 1.0 }, // NO audio stream
          { sourceFile: clipC, startSec: 0, endSec: 1.03 },
        ];
        const fps = 30;
        const timings = computeBeatTimings(beats, fps);
        expect(timings.map((t) => t.editEndFrame)).toEqual([31, 55, 86]);

        const resolved: ResolvedBeat[] = beats.map((b) => ({
          ...b,
          isHdr: false,
          hasAudio: b.sourceFile !== clipB,
        }));
        const out = path.join(dir, "staged-mixed.mp4");
        const { hasAudio } = stage(resolved, out, fps);
        expect(hasAudio).toBe(true);

        // Staged video frame count === the canonical plan's last editEndFrame
        // (the 2.2 drift bug staged 775 vs plan 773 on GPT's stress case).
        expect(probeFrames(out)).toBe(timings[2].editEndFrame);

        // The audio-less middle beat got synthesized silence, so the audio
        // track spans the FULL reel (Σ len = 2.86s), not 2.06s with a hole.
        const audioDur = Number(
          execaSync("ffprobe", [
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=duration",
            "-of",
            "csv=p=0",
            out,
          ]).stdout.trim(),
        );
        expect(Math.abs(audioDur - 2.86)).toBeLessThan(0.1);
      },
      120_000,
    );

    it(
      "all-silent reel: stages a clean video-only clip (no audio stream) with plan-exact frames",
      () => {
        const beats: ReelBeat[] = [
          { sourceFile: clipB, startSec: 0, endSec: 1.0 },
          { sourceFile: clipB, startSec: 0.2, endSec: 1.2 },
        ];
        const fps = 30;
        const timings = computeBeatTimings(beats, fps);
        expect(timings.map((t) => t.editEndFrame)).toEqual([30, 60]);

        const resolved: ResolvedBeat[] = beats.map((b) => ({
          ...b,
          isHdr: false,
          hasAudio: false,
        }));
        const out = path.join(dir, "staged-silent.mp4");
        const { hasAudio } = stage(resolved, out, fps);
        expect(hasAudio).toBe(false);

        expect(probeFrames(out)).toBe(timings[1].editEndFrame);
        expect(probeAudioStreams(out)).toBe(""); // no audio stream at all
      },
      120_000,
    );

    it(
      "EVERY interior join lands on its canonical BeatTiming boundary (Sol §2.3: 25 × 1.03s unique-luma reel, mixed fps + aspect)",
      () => {
        // Sol's decisive reproduction: 25 unique-color 1.03s inputs. The old
        // global-tail-cap design staged 773 total frames but interior beats
        // started 1–2 frames late (canonical 185 → actual 186, 742 → 744) and
        // the last beat was silently truncated to compensate. This test walks
        // per-frame luma and asserts the transition frames EQUAL the canonical
        // editStartFrames — the final total is only the secondary invariant.
        const fps = 30;
        const clips: string[] = [];
        for (let i = 0; i < 25; i++) {
          const g = 10 + i * 9; // distinct flat grays, luma-separable
          const hex = g.toString(16).padStart(2, "0").repeat(3);
          // Mixed source characteristics on purpose: one 25fps and one 60fps
          // source, plus alternating portrait/landscape/square canvases.
          const rate = i === 5 ? 25 : i === 10 ? 60 : 30;
          const size = i % 3 === 0 ? "160x284" : i % 3 === 1 ? "320x180" : "160x160";
          const f = path.join(dir, `luma-${i}.mp4`);
          execaSync("ffmpeg", [
            "-y", "-f", "lavfi", "-i",
            `color=c=0x${hex}:size=${size}:rate=${rate}:duration=1.03`,
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", f,
          ]);
          clips.push(f);
        }
        const beats: ReelBeat[] = clips.map((sourceFile) => ({
          sourceFile,
          startSec: 0,
          endSec: 1.03,
        }));
        const timings = computeBeatTimings(beats, fps);
        expect(timings[24].editEndFrame).toBe(773);

        const resolved: ResolvedBeat[] = beats.map((b) => ({
          ...b,
          isHdr: false,
          hasAudio: false,
        }));
        const out = path.join(dir, "staged-luma.mp4");
        stage(resolved, out, fps);

        // Per-frame mean luma via signalstats; a beat boundary is any frame
        // whose YAVG jumps vs the previous frame.
        const meta = execaSync("ffmpeg", [
          "-nostdin", "-i", out,
          "-vf", "signalstats,metadata=print:file=-",
          "-f", "null", "-",
        ]).stdout;
        const yavgs = [...meta.matchAll(/lavfi\.signalstats\.YAVG=([0-9.]+)/g)].map(
          (m) => Number(m[1]),
        );
        expect(yavgs).toHaveLength(773); // final total — secondary invariant
        const actualStarts = [0];
        for (let f = 1; f < yavgs.length; f++) {
          if (Math.abs(yavgs[f] - yavgs[f - 1]) > 3) actualStarts.push(f);
        }
        // THE assertion: every interior join is frame-exact vs the canonical plan.
        expect(actualStarts).toEqual(timings.map((t) => t.editStartFrame));
      },
      240_000,
    );
  },
);
