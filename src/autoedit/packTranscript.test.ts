import { describe, it, expect } from "vitest";
import { packWords, formatPhrases, packedSourcesToMarkdown } from "./packTranscript";

const W = (text: string, startSeconds: number, endSeconds: number) => ({
  text,
  startSeconds,
  endSeconds,
});

describe("packWords", () => {
  it("groups words with sub-threshold gaps into one phrase", () => {
    const phrases = packWords([W("Por", 7.5, 8.0), W("ahora", 8.05, 8.4), W("solo", 8.45, 8.9)]);
    expect(phrases).toHaveLength(1);
    expect(phrases[0].text).toBe("Por ahora solo");
    expect(phrases[0].startSeconds).toBe(7.5);
    expect(phrases[0].endSeconds).toBe(8.9);
    expect(phrases[0].wordCount).toBe(3);
  });

  it("breaks a new phrase on a silence gap >= gapSeconds", () => {
    // 0.6s gap between 'uno' (ends 1.0) and 'dos' (starts 1.6) > 0.5 default.
    const phrases = packWords([W("uno", 0.5, 1.0), W("dos", 1.6, 2.0), W("tres", 2.05, 2.4)]);
    expect(phrases).toHaveLength(2);
    expect(phrases[0].text).toBe("uno");
    expect(phrases[1].text).toBe("dos tres");
  });

  it("respects a custom gapSeconds", () => {
    // Same input, but a 0.7s threshold keeps it all together (gap was 0.6s).
    const phrases = packWords([W("uno", 0.5, 1.0), W("dos", 1.6, 2.0)], { gapSeconds: 0.7 });
    expect(phrases).toHaveLength(1);
  });

  it("returns [] for no words", () => {
    expect(packWords([])).toEqual([]);
  });
});

describe("formatPhrases / markdown", () => {
  it("zero-pads SSS.ss timecodes", () => {
    const line = formatPhrases([{ startSeconds: 7.54, endSeconds: 13.98, text: "hola", wordCount: 1 }]);
    expect(line).toBe("  [007.54-013.98] hola");
  });

  it("emits a per-source header with phrase count", () => {
    const md = packedSourcesToMarkdown([
      { name: "IMG_1", durationSeconds: 173.9, phrases: packWords([W("a", 0, 0.4), W("b", 0.45, 0.8)]) },
    ]);
    expect(md).toContain("## IMG_1  (duration: 173.9s, 1 phrases)");
    expect(md).toContain("[000.00-000.80] a b");
  });
});
