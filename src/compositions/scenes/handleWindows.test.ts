/**
 * Unit tests for the SHARED intermittent-handle window normalization
 * (Sol 2026-07-16 §3.1: the twin scenes accepted arbitrary numbers, clamped
 * reversed windows to a zero-opacity 1-frame flash, and double-mounted
 * coincident windows).
 */
import { describe, it, expect, vi } from "vitest";
import {
  handleWindowsSchema,
  normalizeHandleWindows,
  MIN_HANDLE_WINDOW_FRAMES,
} from "./handleWindows";

const silenced = <T>(fn: () => T): { result: T; warnings: string[] } => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const result = fn();
    return { result, warnings: warn.mock.calls.map((c) => String(c[0])) };
  } finally {
    warn.mockRestore();
  }
};

describe("handleWindowsSchema (Sol §3.1 — inputs were arbitrary numbers)", () => {
  it("accepts integer, non-negative windows", () => {
    expect(
      handleWindowsSchema.safeParse([{ fromFrame: 0, toFrame: 90 }]).success,
    ).toBe(true);
    expect(handleWindowsSchema.safeParse(undefined).success).toBe(true); // optional
  });

  it("rejects fractional and negative frames at the schema boundary", () => {
    expect(
      handleWindowsSchema.safeParse([{ fromFrame: 1.5, toFrame: 90 }]).success,
    ).toBe(false);
    expect(
      handleWindowsSchema.safeParse([{ fromFrame: -3, toFrame: 90 }]).success,
    ).toBe(false);
  });
});

describe("normalizeHandleWindows", () => {
  it("passes valid disjoint windows through, sorted by fromFrame", () => {
    const { result, warnings } = silenced(() =>
      normalizeHandleWindows([
        { fromFrame: 1350, toFrame: 1440 },
        { fromFrame: 0, toFrame: 90 },
      ]),
    );
    expect(result).toEqual([
      { fromFrame: 0, toFrame: 90 },
      { fromFrame: 1350, toFrame: 1440 },
    ]);
    expect(warnings).toEqual([]);
  });

  it("drops reversed/zero-length/negative/non-finite windows loudly (previously clamped to a zero-opacity 1-frame flash)", () => {
    const { result, warnings } = silenced(() =>
      normalizeHandleWindows([
        { fromFrame: 80, toFrame: 40 }, // reversed
        { fromFrame: 50, toFrame: 50 }, // zero-length
        { fromFrame: -10, toFrame: 20 }, // negative start
        { fromFrame: Number.NaN, toFrame: 60 }, // non-finite
        { fromFrame: 0, toFrame: 90 }, // the only survivor
      ]),
    );
    expect(result).toEqual([{ fromFrame: 0, toFrame: 90 }]);
    expect(warnings).toHaveLength(4);
    expect(warnings.join("\n")).toContain("toFrame > fromFrame");
  });

  it("merges overlapping and touching windows (coincident windows double-mounted the chip)", () => {
    const { result } = silenced(() =>
      normalizeHandleWindows([
        { fromFrame: 0, toFrame: 90 },
        { fromFrame: 60, toFrame: 150 }, // overlaps the first
        { fromFrame: 150, toFrame: 240 }, // touches the merged one
        { fromFrame: 400, toFrame: 500 }, // disjoint
      ]),
    );
    expect(result).toEqual([
      { fromFrame: 0, toFrame: 240 },
      { fromFrame: 400, toFrame: 500 },
    ]);
  });

  it("drops windows below the minimum visible duration (fade math degenerated to zero opacity on 1-frame windows)", () => {
    const { result, warnings } = silenced(() =>
      normalizeHandleWindows([
        { fromFrame: 0, toFrame: MIN_HANDLE_WINDOW_FRAMES - 1 }, // too short
        { fromFrame: 100, toFrame: 100 + MIN_HANDLE_WINDOW_FRAMES }, // exactly min → kept
      ]),
    );
    expect(result).toEqual([
      { fromFrame: 100, toFrame: 100 + MIN_HANDLE_WINDOW_FRAMES },
    ]);
    expect(warnings.join("\n")).toContain("minimum visible duration");
  });

  it("two sub-minimum windows that MERGE into a long-enough one are kept", () => {
    const { result } = silenced(() =>
      normalizeHandleWindows([
        { fromFrame: 0, toFrame: 5 },
        { fromFrame: 5, toFrame: 12 },
      ]),
    );
    expect(result).toEqual([{ fromFrame: 0, toFrame: 12 }]);
  });

  it("rounds fractional frames defensively (render-path callers may bypass the schema)", () => {
    const { result } = silenced(() =>
      normalizeHandleWindows([{ fromFrame: 0.4, toFrame: 90.6 }]),
    );
    expect(result).toEqual([{ fromFrame: 0, toFrame: 91 }]);
  });
});
