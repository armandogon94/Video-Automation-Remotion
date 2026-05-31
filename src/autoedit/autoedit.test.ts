/**
 * Unit tests for the auto-edit pure functions (no IO, no ffmpeg, no model).
 * Covers the load-bearing logic: silencedetect parsing, keep-segment inversion,
 * edit-timeline mapping, word re-projection, and the rule-based overlay rules.
 */
import { describe, it, expect } from "vitest";
import {
  parseSilenceDetect,
  keepSegmentsFromSilences,
  toEditSegments,
} from "./silenceTrim.js";
import { shiftWordsToEditTimeline, buildEditPlan } from "./buildEditPlan.js";
import {
  suggestOverlays,
  isNumberBeat,
  isEmphasisBeat,
  isOrdinalBeat,
  isBrandBeat,
} from "./suggestOverlays.js";
import { editPlanSchema, type EditPlanWord } from "./editPlan.js";

// A representative real silencedetect stderr fragment.
const SAMPLE_STDERR = `
ffmpeg version 8.1
[silencedetect @ 0x600000] silence_start: 2.5
[silencedetect @ 0x600000] silence_end: 3.2 | silence_duration: 0.7
some other ffmpeg log line that should be ignored
[silencedetect @ 0x600000] silence_start: 8.0
[silencedetect @ 0x600000] silence_end: 9.0 | silence_duration: 1.0
`;

describe("parseSilenceDetect", () => {
  it("parses start/end pairs and ignores noise", () => {
    const out = parseSilenceDetect(SAMPLE_STDERR);
    expect(out).toEqual([
      { startSeconds: 2.5, endSeconds: 3.2 },
      { startSeconds: 8.0, endSeconds: 9.0 },
    ]);
  });

  it("handles a dangling silence_start (silence to EOF) as Infinity", () => {
    const out = parseSilenceDetect("silence_start: 10.0\n");
    expect(out).toEqual([{ startSeconds: 10.0, endSeconds: Infinity }]);
  });
});

describe("keepSegmentsFromSilences", () => {
  it("inverts silences into kept talking spans, clamping to duration", () => {
    const keeps = keepSegmentsFromSilences(
      [
        { startSeconds: 2.5, endSeconds: 3.2 },
        { startSeconds: 8.0, endSeconds: 9.0 },
      ],
      12,
    );
    expect(keeps).toEqual([
      { startSeconds: 0, endSeconds: 2.5 },
      { startSeconds: 3.2, endSeconds: 8.0 },
      { startSeconds: 9.0, endSeconds: 12 },
    ]);
  });

  it("clamps Infinity ends to the media duration", () => {
    const keeps = keepSegmentsFromSilences([{ startSeconds: 5, endSeconds: Infinity }], 10);
    expect(keeps).toEqual([{ startSeconds: 0, endSeconds: 5 }]);
  });
});

describe("toEditSegments", () => {
  it("concatenates kept spans onto a gap-free edit timeline", () => {
    const segs = toEditSegments(
      [
        { startSeconds: 0, endSeconds: 2 }, // 60 frames
        { startSeconds: 5, endSeconds: 8 }, // 90 frames, gap of 3s removed
      ],
      30,
    );
    expect(segs[0].editStartFrame).toBe(0);
    expect(segs[0].editEndFrame).toBe(60);
    // second segment starts right where the first ended (gap trimmed)
    expect(segs[1].editStartFrame).toBe(60);
    expect(segs[1].editEndFrame).toBe(150);
    expect(segs[1].source.startFrame).toBe(150); // 5s * 30
    expect(segs[1].mode).toBe("speaker");
  });
});

describe("shiftWordsToEditTimeline", () => {
  it("drops words in trimmed gaps and shifts kept words left", () => {
    const segs = toEditSegments(
      [
        { startSeconds: 0, endSeconds: 2 },
        { startSeconds: 5, endSeconds: 8 },
      ],
      30,
    );
    const words: EditPlanWord[] = [
      { text: "kept-a", startSeconds: 1, endSeconds: 1.5, startFrame: 30, endFrame: 45 },
      { text: "gap", startSeconds: 3, endSeconds: 3.5, startFrame: 90, endFrame: 105 }, // inside trimmed gap → dropped
      { text: "kept-b", startSeconds: 6, endSeconds: 6.5, startFrame: 180, endFrame: 195 },
    ];
    const out = shiftWordsToEditTimeline(words, segs, 30);
    expect(out.map((w) => w.text)).toEqual(["kept-a", "kept-b"]);
    // kept-b was at source frame 180; segment 2 maps source 150 → edit 60, shift = -90
    expect(out[1].startFrame).toBe(90);
  });
});

describe("overlay rule classifiers", () => {
  it("R1 number/stat", () => {
    expect(isNumberBeat("47%")).toBe(true);
    expect(isNumberBeat("$100")).toBe(true);
    expect(isNumberBeat("15x")).toBe(true);
    expect(isNumberBeat("million")).toBe(true);
    expect(isNumberBeat("hola")).toBe(false);
  });
  it("R3 emphasis (lexicon + ALL-CAPS)", () => {
    expect(isEmphasisBeat("secret")).toBe(true);
    expect(isEmphasisBeat("NEVER")).toBe(true); // also all-caps
    expect(isEmphasisBeat("SALES")).toBe(true); // all-caps token
    expect(isEmphasisBeat("casual")).toBe(false);
  });
  it("R2 ordinal", () => {
    expect(isOrdinalBeat("first")).toBe(true);
    expect(isOrdinalBeat("primero")).toBe(true);
    expect(isOrdinalBeat("cat")).toBe(false);
  });
  it("R4 brand", () => {
    expect(isBrandBeat("Claude")).toBe(true);
    expect(isBrandBeat("skool")).toBe(true);
    expect(isBrandBeat("banana")).toBe(false);
  });
});

describe("suggestOverlays (rule-based)", () => {
  it("emits a BuildingBulletList for an enumeration and stat callouts", () => {
    const fps = 30;
    const mk = (text: string, i: number): EditPlanWord => ({
      text,
      startSeconds: i,
      endSeconds: i + 0.4,
      startFrame: i * fps,
      endFrame: i * fps + 12,
    });
    // Enumeration ("First… second…") up front, then a clearly-separated stat
    // beat well past the enumeration span + cooldown.
    const words = [
      "First", "do", "this", "then", "second", "do", "that", // enumeration → OV3
      "and", "and", "and", "and", "and", "and", "and", "and", // filler past cooldown
      "you", "save", "$100", "with", "Claude", // $100 → OV1, Claude → IconPop
    ].map(mk);

    const overlays = suggestOverlays(words);
    const types = overlays.map((o) => o.type);
    expect(types).toContain("BuildingBulletListOverSpeaker");
    expect(types).toContain("YellowGlowWordCallout"); // $100 stat beat
    // Every overlay must carry valid frames and a reason.
    for (const o of overlays) {
      expect(o.toFrame).toBeGreaterThan(o.fromFrame);
      expect(o.reason.length).toBeGreaterThan(0);
      expect(o.confidence).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("buildEditPlan end-to-end (pure)", () => {
  it("produces a schema-valid plan; register=none yields no captions", () => {
    const fps = 30;
    const segments = toEditSegments([{ startSeconds: 0, endSeconds: 4 }], fps);
    const words: EditPlanWord[] = [
      { text: "$50", startSeconds: 1, endSeconds: 1.4, startFrame: 30, endFrame: 42 },
    ];

    const plan = buildEditPlan({
      sourceVideo: "/tmp/talk.mp4",
      aspect: "16:9",
      fps,
      sourceDurationFrames: 120,
      segments,
      sourceWords: words,
      caption: { register: "editorial", position: "bottom-center", mode: "karaoke" },
    });
    expect(editPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.captionTrack.wordTimings.length).toBe(1);
    expect(plan.overlayTrack.length).toBeGreaterThan(0);

    const noneePlan = buildEditPlan({
      sourceVideo: "/tmp/talk.mp4",
      aspect: "16:9",
      fps,
      sourceDurationFrames: 120,
      segments,
      sourceWords: words,
      caption: { register: "none", position: "bottom-center", mode: "karaoke" },
    });
    expect(noneePlan.captionTrack.wordTimings.length).toBe(0); // ADR-002 §3.3
  });
});
