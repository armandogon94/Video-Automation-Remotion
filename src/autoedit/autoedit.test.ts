/**
 * Unit tests for the auto-edit pure functions (no IO, no ffmpeg, no model).
 * Covers the load-bearing logic: silencedetect parsing, keep-segment inversion,
 * edit-timeline mapping, word re-projection, and the rule-based overlay rules.
 */
import { describe, it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseSilenceDetect,
  keepSegmentsFromSilences,
  snapKeepsToWordOnsets,
  toEditSegments,
  type KeepSpan,
} from "./silenceTrim.js";
import {
  shiftWordsToEditTimeline,
  buildEditPlan,
  evaluateTranscriptCoverage,
  MIN_WORDS_PER_SECOND,
  MAX_LOW_CONFIDENCE_SHARE,
} from "./buildEditPlan.js";
import {
  suggestOverlays,
  isNumberBeat,
  isEmphasisBeat,
  isOrdinalBeat,
  isBrandBeat,
  BRAND_ASSETS,
  SUGGESTER_PROP_SCHEMAS,
  validateBeatProps,
} from "./suggestOverlays.js";
import { editPlanSchema, type EditPlanWord } from "./editPlan.js";

/** Resolve a staticFile-relative asset path to its absolute public/ location. */
const publicPath = (rel: string): string =>
  fileURLToPath(new URL(`../../public/${rel}`, import.meta.url));

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
  it("inverts silences into kept talking spans, clamping to duration (no padding)", () => {
    const keeps = keepSegmentsFromSilences(
      [
        { startSeconds: 2.5, endSeconds: 3.2 },
        { startSeconds: 8.0, endSeconds: 9.0 },
      ],
      12,
      { padSeconds: 0 },
    );
    expect(keeps).toEqual([
      { startSeconds: 0, endSeconds: 2.5 },
      { startSeconds: 3.2, endSeconds: 8.0 },
      { startSeconds: 9.0, endSeconds: 12 },
    ]);
  });

  it("clamps Infinity ends to the media duration (no padding)", () => {
    const keeps = keepSegmentsFromSilences([{ startSeconds: 5, endSeconds: Infinity }], 10, {
      padSeconds: 0,
    });
    expect(keeps).toEqual([{ startSeconds: 0, endSeconds: 5 }]);
  });

  it("pads each kept edge into the adjacent silence (default 50ms) so fades land in silence", () => {
    const keeps = keepSegmentsFromSilences(
      [
        { startSeconds: 2.5, endSeconds: 3.2 },
        { startSeconds: 8.0, endSeconds: 9.0 },
      ],
      12,
    );
    // First keep: no left room (starts at 0), pads right into the 0.7s gap.
    // Middle keep: pads both edges 50ms into the surrounding gaps.
    // Last keep: pads left 50ms, no right room (ends at media duration).
    expect(keeps.length).toBe(3);
    expect(keeps[0].startSeconds).toBe(0);
    expect(keeps[0].endSeconds).toBeCloseTo(2.55, 6);
    expect(keeps[1].startSeconds).toBeCloseTo(3.15, 6);
    expect(keeps[1].endSeconds).toBeCloseTo(8.05, 6);
    expect(keeps[2].startSeconds).toBeCloseTo(8.95, 6);
    expect(keeps[2].endSeconds).toBe(12);
  });

  it("padded spans never overlap and clamp at the media edges", () => {
    const keeps = keepSegmentsFromSilences(
      [{ startSeconds: 4, endSeconds: 5 }],
      9,
    );
    // [0,4]+pad → [0,4.05] ; [5,9]+pad → [4.95,9]. No overlap; edges clamped.
    expect(keeps[0].startSeconds).toBe(0);
    expect(keeps[keeps.length - 1].endSeconds).toBe(9);
    for (let i = 1; i < keeps.length; i++) {
      expect(keeps[i].startSeconds).toBeGreaterThanOrEqual(keeps[i - 1].endSeconds);
    }
  });

  it("clamps pad to half the gap under a tiny minSilence (padded keeps still don't overlap)", () => {
    // Two keeps separated by only a 0.06s silence → half-gap is 0.03s < 0.05
    // default pad, so the pad is clamped to 0.03 on the touching edges.
    const keeps = keepSegmentsFromSilences(
      [{ startSeconds: 2.0, endSeconds: 2.06 }],
      5,
    );
    // keep0 [0,2] pads right by min(0.05, 0.03) = 0.03 → 2.03
    // keep1 [2.06,5] pads left by 0.03 → 2.03 (they meet, do not overlap)
    expect(keeps[0].endSeconds).toBeCloseTo(2.03, 5);
    expect(keeps[1].startSeconds).toBeCloseTo(2.03, 5);
    expect(keeps[1].startSeconds).toBeGreaterThanOrEqual(keeps[0].endSeconds - 1e-9);
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

describe("toEditSegments — cumulative drift (FABLE §4.3 / Task 2.2)", () => {
  it("quantizes from cumulative seconds so per-segment rounding does not accumulate", () => {
    const fps = 30;
    // 25 keeps of 1.03s each. round(1.03*30)=31, so the OLD per-segment code gave
    // 25*31 = 775; the correct cumulative answer is round(25*1.03*30) = 773.
    const keeps = Array.from({ length: 25 }, (_, i) => ({
      startSeconds: i * 1.03,
      endSeconds: (i + 1) * 1.03,
    }));
    const segs = toEditSegments(keeps, fps);
    const lastEnd = segs[segs.length - 1].editEndFrame;
    expect(lastEnd).toBe(Math.round(25 * 1.03 * fps)); // 773, not 775
    // Every boundary is within half a frame of the true cumulative position.
    let cum = 0;
    for (const s of segs) {
      expect(Math.abs(s.editStartFrame / fps - cum)).toBeLessThan(1 / (2 * fps));
      cum += s.source.endSeconds - s.source.startSeconds;
    }
  });

  it("is contiguous (each segment starts where the previous ended)", () => {
    const segs = toEditSegments(
      Array.from({ length: 10 }, (_, i) => ({
        startSeconds: i * 0.7,
        endSeconds: i * 0.7 + 0.5,
      })),
      30,
    );
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i].editStartFrame).toBe(segs[i - 1].editEndFrame);
    }
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

  it("clamps a word straddling a cut to the segment's edit end (FABLE §4.14 / Task 2.9)", () => {
    // One segment [0,2)s → edit end frame 60. A word starting at 1.9s but ending
    // at 2.6s (past the cut) must be clamped so its end never bleeds past frame 60.
    const segs = toEditSegments([{ startSeconds: 0, endSeconds: 2 }], 30);
    const words: EditPlanWord[] = [
      { text: "straddle", startSeconds: 1.9, endSeconds: 2.6, startFrame: 57, endFrame: 78 },
    ];
    const out = shiftWordsToEditTimeline(words, segs, 30);
    expect(out.length).toBe(1);
    expect(out[0].endFrame).toBeLessThanOrEqual(segs[0].editEndFrame);
    expect(out[0].endFrame).toBe(60);
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

  // FABLE §4.9 / Task 2.6 — Spanish-hostile enumeration heuristic.
  const fps = 30;
  const mkAt = (text: string, sec: number): EditPlanWord => ({
    text,
    startSeconds: sec,
    endSeconds: sec + 0.4,
    startFrame: Math.round(sec * fps),
    endFrame: Math.round(sec * fps) + 12,
  });

  it("does NOT build an enumeration from scattered Spanish connectives", () => {
    // `luego`/`después`/`siguiente` are common connectives, no longer ordinals,
    // and are spread far apart — must NOT produce a bullet-list overlay.
    const words = [
      mkAt("Hablamos", 0),
      mkAt("luego", 2),
      mkAt("de", 2.4),
      mkAt("esto", 2.8),
      mkAt("y", 20),
      mkAt("después", 21),
      mkAt("vemos", 21.5),
      mkAt("lo", 45),
      mkAt("siguiente", 46),
      mkAt("$100", 60), // a real stat beat, far from any (non-)ordinal
    ];
    const overlays = suggestOverlays(words);
    const types = overlays.map((o) => o.type);
    expect(types).not.toContain("BuildingBulletListOverSpeaker");
    // The stat beat is still emitted (not globally suppressed).
    expect(types).toContain("YellowGlowWordCallout");
  });

  it("builds ONE enumeration for clustered primero/segundo/tercero within 8s, sparing an earlier stat", () => {
    const words = [
      mkAt("$50", 0), // stat BEFORE the cluster — must survive
      mkAt("Tenemos", 5),
      mkAt("primero", 6),
      mkAt("la", 6.5),
      mkAt("estrategia", 7),
      mkAt("segundo", 9),
      mkAt("el", 9.5),
      mkAt("proceso", 10),
      mkAt("tercero", 12),
      mkAt("el", 12.5),
      mkAt("resultado", 13),
    ];
    const overlays = suggestOverlays(words);
    const enums = overlays.filter((o) => o.type === "BuildingBulletListOverSpeaker");
    expect(enums.length).toBe(1);
    // Span covers only the cluster (starts at ~frame 180 = 6s), not the video head.
    expect(enums[0].fromFrame).toBe(Math.round(6 * fps));
    // The $50 stat at t=0 is BEFORE the enumeration span and must NOT be suppressed.
    const stat = overlays.find(
      (o) => o.type === "YellowGlowWordCallout" && o.fromFrame < enums[0].fromFrame,
    );
    expect(stat).toBeTruthy();
  });
});

describe("R4 brand emission (GPT-5.6 finding 2.6)", () => {
  const fps = 30;
  const mkAt = (text: string, sec: number): EditPlanWord => ({
    text,
    startSeconds: sec,
    endSeconds: sec + 0.4,
    startFrame: Math.round(sec * fps),
    endFrame: Math.round(sec * fps) + 12,
  });

  it("every BRAND_ASSETS logo src points at a file that exists under public/", () => {
    for (const [token, asset] of Object.entries(BRAND_ASSETS)) {
      if (asset.kind === "logo") {
        expect(
          existsSync(publicPath(asset.src)),
          `BRAND_ASSETS["${token}"] src "${asset.src}" missing under public/`,
        ).toBe(true);
      }
    }
  });

  it('"Claude"/"Anthropic" emit the TEXT CHIP (never another company\'s mark); "Armando" emits the house logo', () => {
    // Semantic rule (owner-viewer expectation): a brand beat shows the NAMED
    // brand's mark or no branded mark at all. No local Claude/Anthropic logos
    // exist, so those fall through to the BrandNameChip (Sol 0716 §2.6); only
    // the house brand maps to a BrandLogoPopOverSpeaker with a real local asset.
    // Spaced > cooldown (45 frames = 1.5s) apart so all beats emit.
    const words = [
      mkAt("Probamos", 0),
      mkAt("Claude", 1),
      mkAt("hoy", 1.6),
      mkAt("con", 4),
      mkAt("Anthropic", 5),
      mkAt("por", 7.5),
      mkAt("Armando", 8.5),
    ];
    const overlays = suggestOverlays(words);
    const chips = overlays.filter((o) => (o.type as string) === "BrandNameChip");
    expect(chips.map((c) => String(c.props.text))).toEqual(
      expect.arrayContaining(["Claude", "Anthropic"]),
    );
    const logos = overlays.filter(
      (o) => (o.type as string) === "BrandLogoPopOverSpeaker",
    );
    expect(logos.length).toBe(1);
    const src = logos[0].props.logoSrc;
    expect(typeof src).toBe("string");
    expect(
      existsSync(publicPath(src as string)),
      `emitted logoSrc "${String(src)}" missing under public/`,
    ).toBe(true);
    // The defective shape must never come back.
    expect(overlays.map((o) => o.type as string)).not.toContain(
      "IconPopOverSpeaker",
    );
  });

  it("a known brand with NO local asset emits a BrandNameChip text chip carrying the word", () => {
    const words = [mkAt("usa", 0), mkAt("Skool", 1), mkAt("o", 4), mkAt("OpenAI", 5)];
    const overlays = suggestOverlays(words);
    const chips = overlays.filter((o) => (o.type as string) === "BrandNameChip");
    expect(chips.map((c) => c.props.text)).toEqual(["Skool", "OpenAI"]);
    // Never the brain-emoji fallback, never a fabricated logo file.
    expect(overlays.map((o) => o.type as string)).not.toContain("IconPopOverSpeaker");
    expect(overlays.map((o) => o.type as string)).not.toContain("BrandLogoPopOverSpeaker");
  });

  it("the legacy {label,isBrandMark} prop shape is gone and is rejected by planner validation", () => {
    const words = [mkAt("Claude", 1), mkAt("y", 4), mkAt("Skool", 5)];
    const overlays = suggestOverlays(words);
    expect(overlays.length).toBeGreaterThan(0);
    for (const o of overlays) {
      expect(o.props).not.toHaveProperty("label");
      expect(o.props).not.toHaveProperty("isBrandMark");
    }
    // Planner-side validation must reject the old shape outright (zod would
    // silently strip it and render the default 🧠 brain — finding 2.6).
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(
        validateBeatProps("IconPopOverSpeaker", {
          label: "Anthropic",
          isBrandMark: true,
        }),
      ).toBe(false);
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("validateBeatProps accepts schema-true props and rejects unknown molecule types", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(
        validateBeatProps("IconPopOverSpeaker", { icon: "🧠", anchor: "top-right" }),
      ).toBe(true);
      expect(
        validateBeatProps("BrandLogoPopOverSpeaker", {
          logoSrc: "brand/logos/logo-lentes.png",
        }),
      ).toBe(true);
      expect(validateBeatProps("NotARegisteredMolecule", {})).toBe(false);
      // Type errors on recognized keys also fail (not just unknown keys).
      expect(
        validateBeatProps("BrandNameChip", { text: 42 }),
      ).toBe(false);
    } finally {
      warn.mockRestore();
    }
  });

  it("every emitted beat's merged {anchor, ...props} passes its own molecule schema", () => {
    // A sample plan exercising all four rules: enumeration (R2), stat (R1),
    // brand with local asset + brand without (R4), emphasis keyword (R3).
    const words = [
      mkAt("First", 0),
      mkAt("plan", 0.5),
      mkAt("second", 2),
      mkAt("build", 2.5),
      mkAt("$100", 20),
      mkAt("Claude", 25),
      mkAt("Skool", 30),
      mkAt("secret", 35),
    ];
    const overlays = suggestOverlays(words);
    const types = new Set(overlays.map((o) => o.type as string));
    expect(types.size).toBeGreaterThanOrEqual(3); // meaningful coverage
    for (const o of overlays) {
      const schema =
        SUGGESTER_PROP_SCHEMAS[o.type as keyof typeof SUGGESTER_PROP_SCHEMAS];
      expect(schema, `suggester emitted unmapped type "${o.type}"`).toBeTruthy();
      // Validate the EXACT bag renderFromPlan mounts: {anchor, ...props}.
      const mounted = { anchor: o.anchor, ...o.props };
      expect(
        schema.safeParse(mounted).success,
        `${o.type} props failed its own schema: ${JSON.stringify(mounted)}`,
      ).toBe(true);
      expect(validateBeatProps(o.type, mounted)).toBe(true);
    }
  });
});

describe("snapKeepsToWordOnsets (Sol 0716 §4.2 — 'They'-class mid-word joins)", () => {
  const fps = 30;
  /** SOURCE-time words for the exact Round-2 berman join: "…it is. They will help you…" */
  const bermanWords: EditPlanWord[] = [
    { text: "it", startSeconds: 12.9, endSeconds: 13.1, startFrame: 387, endFrame: 393 },
    { text: "is.", startSeconds: 13.1, endSeconds: 13.5, startFrame: 393, endFrame: 405 },
    { text: "They", startSeconds: 13.7, endSeconds: 13.95, startFrame: 411, endFrame: 419 },
    { text: "will", startSeconds: 13.95, endSeconds: 14.2, startFrame: 419, endFrame: 426 },
    { text: "help", startSeconds: 14.2, endSeconds: 14.5, startFrame: 426, endFrame: 435 },
    { text: "you", startSeconds: 14.5, endSeconds: 14.7, startFrame: 435, endFrame: 441 },
  ];

  it('recovers the omitted "They" when the cut-in lands inside it (the exact "it is. They will" join)', () => {
    // silencedetect ate the pause AND the soft onset of "They": silence_end
    // landed mid-word, so the second keep starts INSIDE "They" [13.7,13.95).
    const keeps: KeepSpan[] = [
      { startSeconds: 0, endSeconds: 13.55 },
      { startSeconds: 13.8, endSeconds: 20 },
    ];

    // The bug shape first: captions jump "is." → "will" ("They" omitted).
    const before = shiftWordsToEditTimeline(bermanWords, toEditSegments(keeps, fps), fps);
    expect(before.map((w) => w.text)).toEqual(["it", "is.", "will", "help", "you"]);

    const snapped = snapKeepsToWordOnsets(keeps, bermanWords);
    // Boundary inside "They" → its start (13.7) − 0.12 pre-roll = 13.58.
    expect(snapped[1].startSeconds).toBeCloseTo(13.58, 6);
    expect(snapped[0]).toEqual(keeps[0]); // untouched boundaries pass through
    // Non-overlap preserved.
    expect(snapped[1].startSeconds).toBeGreaterThanOrEqual(snapped[0].endSeconds);

    // And the join is healed: "They" survives into audio AND captions.
    const after = shiftWordsToEditTimeline(bermanWords, toEditSegments(snapped, fps), fps);
    expect(after.map((w) => w.text)).toEqual(["it", "is.", "They", "will", "help", "you"]);
  });

  it("pulls a cut-out that clips mid-word back to before the onset (no truncated word-head bleeds through the join)", () => {
    // The first keep's END lands inside "They" → the rendered audio would carry
    // a clipped "They" head that the caption plan omits.
    const keeps: KeepSpan[] = [
      { startSeconds: 0, endSeconds: 13.85 },
      { startSeconds: 14.75, endSeconds: 20 }, // resumes in silence after "you"
    ];
    const snapped = snapKeepsToWordOnsets(keeps, bermanWords);
    // End boundary → "They".start (13.7) − 0.12 = 13.58: cut lands in silence.
    expect(snapped[0].endSeconds).toBeCloseTo(13.58, 6);
    expect(snapped[1]).toEqual(keeps[1]);
  });

  it("leaves boundaries that fall in silence (outside every word) unchanged", () => {
    const keeps: KeepSpan[] = [
      { startSeconds: 0, endSeconds: 13.6 }, // between "is." (ends 13.5) and "They" (starts 13.7)
      { startSeconds: 14.75, endSeconds: 20 }, // after "you" ends (14.7)
    ];
    expect(snapKeepsToWordOnsets(keeps, bermanWords)).toEqual(keeps);
  });

  it("skips a snap whose shift would exceed maxShiftSeconds", () => {
    // Boundary 0.30s into a word: shift needed = 0.30 + 0.12 = 0.42 > 0.35.
    const longWord: EditPlanWord[] = [
      { text: "extraordinarily", startSeconds: 5.0, endSeconds: 5.9, startFrame: 150, endFrame: 177 },
    ];
    const keeps: KeepSpan[] = [{ startSeconds: 5.3, endSeconds: 10 }];
    expect(snapKeepsToWordOnsets(keeps, longWord)).toEqual(keeps);
    // A wider maxShiftSeconds allows it.
    const wide = snapKeepsToWordOnsets(keeps, longWord, { maxShiftSeconds: 1 });
    expect(wide[0].startSeconds).toBeCloseTo(4.88, 6);
  });

  it("clamps a snapped start at 0 and at the previous keep's (snapped) end", () => {
    // Clamp at 0: word right at the media head.
    const headWord: EditPlanWord[] = [
      { text: "Hola", startSeconds: 0.05, endSeconds: 0.4, startFrame: 2, endFrame: 12 },
    ];
    const headKeeps = snapKeepsToWordOnsets(
      [{ startSeconds: 0.08, endSeconds: 5 }],
      headWord,
    );
    expect(headKeeps[0].startSeconds).toBe(0); // 0.05 − 0.12 clamped to 0

    // Clamp at the previous keep's end: target 10.28 − 0.12 = 10.16 < 10.2.
    const midWord: EditPlanWord[] = [
      { text: "ahora", startSeconds: 10.28, endSeconds: 10.6, startFrame: 308, endFrame: 318 },
    ];
    const clamped = snapKeepsToWordOnsets(
      [
        { startSeconds: 8, endSeconds: 10.2 },
        { startSeconds: 10.3, endSeconds: 15 },
      ],
      midWord,
    );
    expect(clamped[1].startSeconds).toBeCloseTo(10.2, 6);
    expect(clamped[1].startSeconds).toBeGreaterThanOrEqual(clamped[0].endSeconds);
  });

  it("skips an end snap that would shrink the keep below minKeepSeconds", () => {
    const word: EditPlanWord[] = [
      { text: "sí", startSeconds: 10.25, endSeconds: 10.7, startFrame: 308, endFrame: 321 },
    ];
    // Snapping the end to 10.25 − 0.12 = 10.13 would leave 0.13s < 0.2 min-keep.
    const keeps: KeepSpan[] = [{ startSeconds: 10.0, endSeconds: 10.3 }];
    expect(snapKeepsToWordOnsets(keeps, word)).toEqual(keeps);
  });

  it("honors a custom preRollSeconds", () => {
    const keeps: KeepSpan[] = [{ startSeconds: 0, endSeconds: 13.8 }];
    const snapped = snapKeepsToWordOnsets(keeps, bermanWords, { preRollSeconds: 0.2, maxShiftSeconds: 0.5 });
    expect(snapped[0].endSeconds).toBeCloseTo(13.5, 6); // 13.7 − 0.2
  });

  it("is pure: returns keeps unchanged with no words, and never mutates its inputs", () => {
    const keeps: KeepSpan[] = [{ startSeconds: 0, endSeconds: 13.8 }];
    const keepsCopy = JSON.parse(JSON.stringify(keeps));
    const wordsCopy = JSON.parse(JSON.stringify(bermanWords));

    expect(snapKeepsToWordOnsets([], bermanWords)).toEqual([]);
    expect(snapKeepsToWordOnsets(keeps, [])).toEqual(keeps);

    snapKeepsToWordOnsets(keeps, bermanWords);
    expect(keeps).toEqual(keepsCopy);
    expect(bermanWords).toEqual(wordsCopy);
  });
});

describe("evaluateTranscriptCoverage (blocking gate — triage #7 / Sol 0716 §2.1)", () => {
  const mkWords = (count: number, probability?: number): EditPlanWord[] =>
    Array.from({ length: count }, (_, i) => ({
      text: `w${i}`,
      startSeconds: i * 0.4,
      endSeconds: i * 0.4 + 0.3,
      startFrame: i * 12,
      endFrame: i * 12 + 9,
      ...(probability !== undefined ? { probability } : {}),
    }));

  it("passes a healthy transcript (2.5 w/s, high confidence)", () => {
    const res = evaluateTranscriptCoverage(mkWords(60, 0.9), 24);
    expect(res.failures).toEqual([]);
    expect(res.wordsPerSecond).toBeCloseTo(2.5, 6);
    expect(res.lowConfidenceShare).toBe(0);
  });

  it("fails sparse coverage below 0.9 w/s, naming both measured and threshold numbers", () => {
    // The §6 hallucination class: 6 words for 23s = 0.26 w/s.
    const res = evaluateTranscriptCoverage(mkWords(6, 0.9), 23);
    expect(res.failures.length).toBe(1);
    expect(res.failures[0]).toContain("0.26 words/s");
    expect(res.failures[0]).toContain(`${MIN_WORDS_PER_SECOND} words/s`);
    expect(res.failures[0]).toContain("6 words");
  });

  it("fails when more than 40% of probability-carrying words are low-confidence, naming the numbers", () => {
    const words = [...mkWords(12, 0.05), ...mkWords(8, 0.9)]; // 60% below p=0.15
    const res = evaluateTranscriptCoverage(words, 8); // 2.5 w/s — coverage OK
    expect(res.failures.length).toBe(1);
    expect(res.failures[0]).toContain("60%");
    expect(res.failures[0]).toContain(`${Math.round(MAX_LOW_CONFIDENCE_SHARE * 100)}%`);
    expect(res.lowConfidenceShare).toBeCloseTo(0.6, 6);
  });

  it("reports BOTH failures on a transcript that is sparse and low-confidence", () => {
    const res = evaluateTranscriptCoverage(mkWords(6, 0.01), 23);
    expect(res.failures.length).toBe(2);
  });

  it("does not count probability-less words toward the low-confidence share", () => {
    const words = [...mkWords(5, 0.05), ...mkWords(45)]; // only 5 carry a probability, all low
    const res = evaluateTranscriptCoverage(words, 20); // 2.5 w/s
    expect(res.assessedWordCount).toBe(5);
    expect(res.lowConfidenceShare).toBe(1);
    expect(res.failures.length).toBe(1); // low-confidence fires; coverage passes
  });

  it("exactly-at-threshold values pass (thresholds are strict)", () => {
    // Exactly 0.9 w/s: 9 words over 10s (both exactly representable doubles).
    expect(evaluateTranscriptCoverage(mkWords(9, 0.9), 10).failures).toEqual([]);
    // Exactly 40% low-confidence: 4 of 10 assessed, at healthy 2.5 w/s.
    const words = [...mkWords(4, 0.05), ...mkWords(6, 0.9)];
    expect(evaluateTranscriptCoverage(words, 4).failures).toEqual([]);
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
