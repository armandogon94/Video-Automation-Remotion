/**
 * suggestOverlays — RULE-BASED first-pass over-speaker overlay suggester.
 *
 * WHAT THIS DOES
 * --------------
 * North-star bullet 2 ("add motion graphics that illustrate the points"), first
 * pass. Scans the EDIT-time word timings + their text for spoken BEATS and emits
 * `OverlayInstance[]` on the overlay track, each pinned to the words that
 * triggered it. This is deterministic heuristics only — no model calls.
 *
 * RULES (each maps a beat → an OV1–OV12 molecule from OVERLAY-ANALYSIS §1)
 * -----------------------------------------------------------------------
 *   R1  spoken number / percentage / money   → YellowGlowWordCallout (OV1)
 *                                               (stat/number emphasis pop)
 *   R2  enumeration ("first… second…",        → BuildingBulletListOverSpeaker
 *       "1) 2) 3)", "primero… segundo…")        (OV3, the headline pattern)
 *   R3  emphasis keyword (CAPS / "huge",       → YellowGlowWordCallout (OV1)
 *       "never", "the key", "secret"…)           kept as a glow callout
 *   R4  named tool / brand                     → IconPopOverSpeaker (OV10/OV11,
 *                                               isBrandMark) → BrandLogoPop
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ LLM EXTENSION POINT (deferred — ADR-003 §5).                              │
 * │ This whole module is the "rule-based" stub. A later LLM pass should:      │
 * │   - replace R1–R4 with semantic beat detection (intent, not keywords),    │
 * │   - choose the BEST overlay type per beat (not 1 rule → 1 type),          │
 * │   - decide speaker-vs-broll (sets EditSegment.mode), and                  │
 * │   - fill richer molecule props (list items, chip labels, tweet body).     │
 * │ It MUST emit the SAME `OverlayInstance[]` shape, so `buildEditPlan`/the    │
 * │ renderer are unchanged. See the `SuggestStrategy` seam below.             │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * No Remotion / ffmpeg / network imports — pure logic, fully unit-testable.
 */
import {
  type EditPlanWord,
  type OverlayInstance,
  type OverlayType,
  type OverlayAnchor,
} from "./editPlan.js";

// ─────────────────────────────────────────────────────────────────────────────
// Strategy seam (the LLM extension point)
// ─────────────────────────────────────────────────────────────────────────────

export interface SuggestOverlaysOptions {
  /**
   * Cooldown (frames) after emitting an overlay before another may start, to
   * avoid stacking overlays on top of each other. Default 45 (~1.5s @ 30fps).
   */
  cooldownFrames?: number;
  /** Frames to hold a single-word callout after the triggering word. Default 24. */
  calloutHoldFrames?: number;
  /** Max overlays to emit (keeps the densest, highest-confidence). Default 24. */
  maxOverlays?: number;
  /**
   * Max spoken gap (SECONDS) between two consecutive ordinals for them to belong
   * to the SAME enumeration (FABLE §4.9 / Task 2.6). A larger gap starts a new
   * candidate group; only groups with ≥2 members emit a bullet-list overlay.
   * Default 8s.
   */
  maxOrdinalGapSeconds?: number;
  /**
   * Hard cap (SECONDS) on an enumeration overlay's span, so one enumeration can
   * never blanket most of the video. Default 15s.
   */
  maxEnumSpanSeconds?: number;
}

/**
 * The pluggable suggester contract. The rule-based implementation below
 * satisfies it; a future `llmSuggestStrategy` (ADR-003 §5) will satisfy the same
 * signature and can be swapped in `buildEditPlan` with zero downstream changes.
 */
export type SuggestStrategy = (
  words: EditPlanWord[],
  opts: SuggestOverlaysOptions,
) => OverlayInstance[];

// ─────────────────────────────────────────────────────────────────────────────
// Lexicons — intentionally small + overridable. (TODO: LLM replaces these.)
// ─────────────────────────────────────────────────────────────────────────────

/** Emphasis keywords (EN + ES). R3. Lowercased, accent-stripped before match. */
const EMPHASIS_WORDS = new Set([
  "huge", "massive", "never", "always", "secret", "key", "critical", "free",
  "best", "worst", "biggest", "important", "remember", "warning", "stop",
  "clave", "secreto", "nunca", "siempre", "gratis", "enorme", "importante",
  "recuerda", "cuidado", "mejor", "peor",
]);

/**
 * Ordinal / enumeration markers (EN + ES). R2. Deliberately EXCLUDES the
 * ultra-common Spanish connectives `luego`, `despues`, `siguiente` (FABLE §4.9 /
 * Task 2.6): they appear constantly in ordinary Spanish speech, so treating them
 * as enumeration markers made almost every Spanish talking-head trigger one giant
 * bogus bullet-list overlay. Kept: true ordinals + explicit sequence words.
 */
const ORDINAL_WORDS = new Set([
  "first", "second", "third", "fourth", "fifth", "next", "then", "finally",
  "primero", "segundo", "tercero", "cuarto", "quinto",
  "finalmente",
]);

/**
 * Known tool / brand wordmarks (R4). Match is on the ACCENT-STRIPPED lowercase
 * token. Small + curated on purpose; the LLM pass should replace this with NER.
 */
const BRAND_WORDS = new Set([
  "claude", "anthropic", "openai", "gpt", "chatgpt", "gemini", "google",
  "skool", "youtube", "tiktok", "instagram", "remotion", "whisper", "ffmpeg",
  "notion", "figma", "github", "stripe", "shopify",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Text classification helpers (pure)
// ─────────────────────────────────────────────────────────────────────────────

/** Lowercase + strip accents/punctuation (mirrors src/timing/align.ts `normalize`). */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%$]/gu, ""); // keep % and $ — they signal stats/money
}

/** R1: spoken number, percentage, or money. Catches "47%", "$100", "tres", "15x". */
export function isNumberBeat(raw: string): boolean {
  const n = normalize(raw);
  if (n.length === 0) return false;
  if (/[%$]/.test(n)) return true; // percentage or money sign
  if (/\d/.test(n)) return true; // any digit
  if (/^\d+x$/.test(n)) return true; // multiplier like "15x"
  // Spelled-out small numbers (EN + ES) that commonly carry a stat.
  const SPELLED = new Set([
    "hundred", "thousand", "million", "billion", "percent", "double", "triple",
    "cien", "mil", "millon", "millones", "ciento", "porciento", "doble", "triple",
  ]);
  return SPELLED.has(n);
}

export function isEmphasisBeat(raw: string): boolean {
  const n = normalize(raw);
  if (EMPHASIS_WORDS.has(n)) return true;
  // ALL-CAPS multi-letter token in the source text → editor-style emphasis.
  const lettersOnly = raw.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  return lettersOnly.length >= 3 && lettersOnly === lettersOnly.toUpperCase();
}

export function isOrdinalBeat(raw: string): boolean {
  return ORDINAL_WORDS.has(normalize(raw));
}

export function isBrandBeat(raw: string): boolean {
  return BRAND_WORDS.has(normalize(raw));
}

// ─────────────────────────────────────────────────────────────────────────────
// The rule-based strategy
// ─────────────────────────────────────────────────────────────────────────────

interface Beat {
  type: OverlayType;
  anchor: OverlayAnchor;
  fromFrame: number;
  toFrame: number;
  props: Record<string, unknown>;
  confidence: number;
  reason: string;
}

const DEFAULTS: Required<SuggestOverlaysOptions> = {
  cooldownFrames: 45,
  calloutHoldFrames: 24,
  maxOverlays: 24,
  maxOrdinalGapSeconds: 8,
  maxEnumSpanSeconds: 15,
};

/** An emitted overlay's suppression window on the edit timeline (frames). */
interface Interval {
  fromFrame: number;
  toFrame: number;
}

/** True if `frame` falls inside any emitted-overlay interval. */
function insideAny(frame: number, intervals: Interval[]): boolean {
  return intervals.some((iv) => frame >= iv.fromFrame && frame < iv.toFrame);
}

/**
 * Derive fps from the word timings (each carries BOTH frames and seconds). Used
 * to convert the second-based enumeration span cap into frames without threading
 * an fps argument through the `SuggestStrategy` seam. Falls back to 30 when no
 * word has a positive time (e.g. everything at t=0). Prefers a word at/after
 * `nearFrame` so the ratio reflects the local timeline.
 */
function fpsFromWords(words: EditPlanWord[], nearFrame: number): number {
  const usable = words.filter((w) => w.startSeconds > 0 && w.startFrame > 0);
  if (usable.length === 0) return 30;
  const anchor =
    usable.find((w) => w.startFrame >= nearFrame) ?? usable[usable.length - 1];
  const fps = anchor.startFrame / anchor.startSeconds;
  return Number.isFinite(fps) && fps > 0 ? fps : 30;
}

/**
 * Rule-based suggester. Single forward scan with priority R2 > R1 > R4 > R3 and
 * a cooldown so overlays don't pile up. Enumerations (R2) accumulate consecutive
 * ordinal-led phrases into ONE BuildingBulletListOverSpeaker rather than firing
 * per ordinal.
 */
export const ruleBasedStrategy: SuggestStrategy = (words, opts) => {
  const o = { ...DEFAULTS, ...opts };
  const beats: Beat[] = [];
  // Emitted enumeration windows: single-word rules are suppressed only INSIDE
  // these intervals, NOT globally before/after them (FABLE §4.9 / Task 2.6).
  const enumIntervals: Interval[] = [];

  // ── R2: group CONSECUTIVE ordinals that cluster in time into enumerations ──
  // Ordinals more than `maxOrdinalGapSeconds` apart belong to DIFFERENT groups
  // (an ordinal here and another 60s later is not one list). Only a group with
  // ≥2 ordinals within the gap budget emits a bullet-list, and its span is capped
  // at `maxEnumSpanSeconds`. This stops scattered connectives from producing one
  // giant overlay that blankets the whole video.
  const ordinalIdxs = words
    .map((w, i) => (isOrdinalBeat(w.text) ? i : -1))
    .filter((i) => i >= 0);

  const groups: number[][] = [];
  for (const idx of ordinalIdxs) {
    const cur = groups[groups.length - 1];
    if (
      cur &&
      words[idx].startSeconds - words[cur[cur.length - 1]].startSeconds <=
        o.maxOrdinalGapSeconds
    ) {
      cur.push(idx);
    } else {
      groups.push([idx]);
    }
  }

  for (const group of groups) {
    if (group.length < 2) continue; // a lone ordinal is not an enumeration
    const first = group[0];
    const last = group[group.length - 1];
    const items = group.map((idx) => {
      // Take the ordinal + up to the next 5 words (until the next ordinal) as the item.
      const stop = Math.min(idx + 6, group.find((j) => j > idx) ?? words.length);
      const text = words
        .slice(idx, stop)
        .map((w) => w.text)
        .join(" ")
        .trim();
      return { text };
    });
    const fromFrame = words[first].startFrame;
    const rawToFrame = words[Math.min(last + 5, words.length - 1)].endFrame;
    // Cap the span so one enumeration can never blanket most of the video.
    const spanCapFrames = Math.round(
      o.maxEnumSpanSeconds * fpsFromWords(words, fromFrame),
    );
    const toFrame = Math.min(rawToFrame, fromFrame + spanCapFrames);
    beats.push({
      type: "BuildingBulletListOverSpeaker",
      anchor: "left",
      fromFrame,
      toFrame,
      props: { items, numbered: true },
      confidence: 0.7,
      reason: `R2 enumeration: ${group.length} clustered ordinal markers`,
    });
    enumIntervals.push({ fromFrame, toFrame });
  }

  // ── R1 / R4 / R3 single-word scan (skips only beats INSIDE an R2 span) ──
  let cooldownUntil = -Infinity;
  for (const w of words) {
    // Interval-based enumeration suppression (only inside an emitted list span),
    // plus the short post-overlay cooldown for stacked single-word beats.
    if (insideAny(w.startFrame, enumIntervals)) continue;
    if (w.startFrame < cooldownUntil) continue;

    let beat: Beat | null = null;

    if (isNumberBeat(w.text)) {
      beat = {
        type: "YellowGlowWordCallout",
        anchor: "bottom-left",
        fromFrame: w.startFrame,
        toFrame: w.endFrame + o.calloutHoldFrames,
        props: { text: w.text.trim() || w.text },
        confidence: 0.6,
        reason: `R1 number/stat beat: "${w.text.trim()}"`,
      };
    } else if (isBrandBeat(w.text)) {
      beat = {
        type: "IconPopOverSpeaker",
        anchor: "top-right",
        fromFrame: w.startFrame,
        toFrame: w.endFrame + o.calloutHoldFrames,
        props: { label: w.text.trim(), isBrandMark: true },
        confidence: 0.55,
        reason: `R4 brand/tool beat: "${w.text.trim()}"`,
      };
    } else if (isEmphasisBeat(w.text)) {
      beat = {
        type: "YellowGlowWordCallout",
        anchor: "bottom-left",
        fromFrame: w.startFrame,
        toFrame: w.endFrame + o.calloutHoldFrames,
        props: { text: w.text.trim() },
        confidence: 0.45,
        reason: `R3 emphasis beat: "${w.text.trim()}"`,
      };
    }

    if (beat) {
      beats.push(beat);
      cooldownUntil = beat.fromFrame + o.cooldownFrames;
    }
  }

  // Sort by start, cap to maxOverlays keeping the highest-confidence, assign ids.
  const ranked = [...beats].sort((a, b) => b.confidence - a.confidence).slice(0, o.maxOverlays);
  const ordered = ranked.sort((a, b) => a.fromFrame - b.fromFrame);

  return ordered.map<OverlayInstance>((b, i) => ({
    id: `ov-${i}`,
    type: b.type,
    anchor: b.anchor,
    fromFrame: b.fromFrame,
    toFrame: b.toFrame,
    props: b.props,
    confidence: b.confidence,
    reason: b.reason,
  }));
};

/**
 * Public entry. Defaults to the rule-based strategy; pass a different
 * `strategy` (e.g. the future LLM strategy) to swap the implementation.
 */
export function suggestOverlays(
  words: EditPlanWord[],
  opts: SuggestOverlaysOptions = {},
  strategy: SuggestStrategy = ruleBasedStrategy,
): OverlayInstance[] {
  if (words.length === 0) return [];
  return strategy(words, opts);
}
