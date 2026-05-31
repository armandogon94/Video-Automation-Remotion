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

/** Ordinal / enumeration markers (EN + ES). R2. */
const ORDINAL_WORDS = new Set([
  "first", "second", "third", "fourth", "fifth", "next", "then", "finally",
  "primero", "segundo", "tercero", "cuarto", "quinto", "luego", "despues",
  "finalmente", "siguiente",
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
};

/**
 * Rule-based suggester. Single forward scan with priority R2 > R1 > R4 > R3 and
 * a cooldown so overlays don't pile up. Enumerations (R2) accumulate consecutive
 * ordinal-led phrases into ONE BuildingBulletListOverSpeaker rather than firing
 * per ordinal.
 */
export const ruleBasedStrategy: SuggestStrategy = (words, opts) => {
  const o = { ...DEFAULTS, ...opts };
  const beats: Beat[] = [];
  let cooldownUntil = -Infinity;

  // ── R2 first: collect enumeration runs (ordinal word + the ~6 words after) ──
  const ordinalIdxs = words
    .map((w, i) => (isOrdinalBeat(w.text) ? i : -1))
    .filter((i) => i >= 0);

  if (ordinalIdxs.length >= 2) {
    const first = ordinalIdxs[0];
    const last = ordinalIdxs[ordinalIdxs.length - 1];
    const items = ordinalIdxs.map((idx) => {
      // Take the ordinal + up to the next 5 words (until the next ordinal) as the item.
      const stop = Math.min(
        idx + 6,
        ordinalIdxs.find((j) => j > idx) ?? words.length,
      );
      const text = words
        .slice(idx, stop)
        .map((w) => w.text)
        .join(" ")
        .trim();
      return { text };
    });
    const fromFrame = words[first].startFrame;
    const toFrame = words[Math.min(last + 5, words.length - 1)].endFrame;
    beats.push({
      type: "BuildingBulletListOverSpeaker",
      anchor: "left",
      fromFrame,
      toFrame,
      props: { items, numbered: true },
      confidence: 0.7,
      reason: `R2 enumeration: ${ordinalIdxs.length} ordinal markers detected`,
    });
    // Block single-word rules from firing INSIDE the enumeration span.
    cooldownUntil = toFrame;
  }

  // ── R1 / R4 / R3 single-word scan (skips anything inside an R2 span) ──
  for (const w of words) {
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
