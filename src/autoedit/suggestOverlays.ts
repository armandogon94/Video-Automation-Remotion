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
 *   R4  named tool / brand                     → BrandLogoPopOverSpeaker (OV11)
 *       (GPT-5.6 finding 2.6)                    when a LOCAL logo asset exists
 *                                               (BRAND_ASSETS); otherwise a
 *                                               SentimentKeyword text chip.
 *                                               NEVER IconPopOverSpeaker with
 *                                               made-up {label,isBrandMark}
 *                                               props — Zod stripped those and
 *                                               rendered the default 🧠 brain.
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
 * No ffmpeg / network imports — pure logic, fully unit-testable. It DOES import
 * the zod prop schemas of the overlay molecules it emits (planner→component
 * coupling BY DESIGN, GPT-5.6 finding 2.6): the planner must never emit props
 * the target molecule's schema lacks, and the only source of truth for that
 * contract is the molecule's own exported schema. The schema imports pull in
 * remotion/react at module scope (schema evaluation only — nothing renders),
 * which is safe in Node/vitest.
 */
import {
  type EditPlanWord,
  type OverlayInstance,
  type OverlayType,
  type OverlayAnchor,
} from "./editPlan.js";
// Molecule prop schemas — the render-side contract each emitted beat must
// satisfy. Imported directly from the components (planner→component coupling
// by design; see header note).
import { yellowGlowWordCalloutSchema } from "../components/overlays/YellowGlowWordCallout";
import { buildingBulletListOverSpeakerSchema } from "../components/overlays/BuildingBulletListOverSpeaker";
import { iconPopOverSpeakerSchema } from "../components/overlays/IconPopOverSpeaker";
import { brandLogoPopOverSpeakerSchema } from "../components/overlays/BrandLogoPopOverSpeaker";
import { sentimentKeywordSchema } from "../components/overlays/SentimentKeyword";

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
  "armando", // own channel brand (@armandointeligencia) — has local logo assets
]);

// ─────────────────────────────────────────────────────────────────────────────
// Brand assets (GPT-5.6 finding 2.6)
// ─────────────────────────────────────────────────────────────────────────────

/** How a recognized brand token renders: a local logo image (routed through
 *  Remotion `staticFile`, so the path is /public-relative) or an emoji icon. */
export type BrandAsset =
  | { kind: "logo"; src: string }
  | { kind: "icon"; icon: string };

/**
 * Normalized brand token → local render asset. EXPLICIT + tiny on purpose.
 *
 * Rules (GPT-5.6 finding 2.6 remediation; stale-comment cleanup Sol 0716 §2.6):
 *  - SEMANTIC RULE (owner-viewer expectation): a brand beat shows the NAMED
 *    brand's mark or nothing branded at all. claude/anthropic are deliberately
 *    ABSENT here — mapping them to Armando's house logo would show the wrong
 *    company's mark — so they fall through to the `SentimentKeyword` text chip.
 *  - `kind:"logo"` src MUST point at a file that actually exists under
 *    `public/` (staticFile-relative). The only local logo assets today are our
 *    OWN house marks under `public/brand/logos/`, used only for the `armando`
 *    token. To add a third-party brand: drop its REAL logo PNG under
 *    `public/brand/logos/` and add an entry (the existence test enforces it).
 *  - DO NOT invent logo paths for third-party brands (openai, gemini, skool…).
 *    A brand token with NO entry here falls back to a `SentimentKeyword` text
 *    chip carrying the spoken word — never an IconPopOverSpeaker with props
 *    its schema lacks (that is exactly the Zod-strip → default-🧠 defect).
 *  - A regression test asserts every `kind:"logo"` src exists on disk.
 */
export const BRAND_ASSETS: Record<string, BrandAsset> = {
  armando: { kind: "logo", src: "brand/logos/logo-completo.png" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Planner-side prop validation (GPT-5.6 finding 2.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Molecule prop schema for every overlay type this suggester can emit — the
 * actual zod schemas exported by the components (planner→component coupling by
 * design). If a rule wants to emit a new molecule type, it MUST be added here
 * so its props are validated at emission time. Exported for tests.
 */
export const SUGGESTER_PROP_SCHEMAS = {
  YellowGlowWordCallout: yellowGlowWordCalloutSchema,
  BuildingBulletListOverSpeaker: buildingBulletListOverSpeakerSchema,
  IconPopOverSpeaker: iconPopOverSpeakerSchema,
  BrandLogoPopOverSpeaker: brandLogoPopOverSpeakerSchema,
  SentimentKeyword: sentimentKeywordSchema,
} as const;

/** Overlay type names the suggester is allowed to emit. */
export type SuggesterEmittableType = keyof typeof SUGGESTER_PROP_SCHEMAS;

/** Widened view of the schema map for lookup by arbitrary type name. */
type AnySuggesterSchema =
  (typeof SUGGESTER_PROP_SCHEMAS)[SuggesterEmittableType];

/**
 * Validate a beat's props against the TARGET molecule's own schema before the
 * beat ships. Two checks, both load-bearing (GPT-5.6 finding 2.6):
 *
 *  1. UNKNOWN-KEY check — plain `safeParse` on a zod object SILENTLY STRIPS
 *     unrecognized keys, which is precisely how `{label,isBrandMark}` became a
 *     default 🧠 brain. Any prop key the schema's shape lacks fails validation.
 *  2. `safeParse` — type/enum errors on the recognized keys.
 *
 * On failure: `console.warn` with the reason and return false — the caller
 * SKIPS the beat. Never ship semantically-stripped props again.
 */
export function validateBeatProps(
  type: string,
  props: Record<string, unknown>,
): boolean {
  const schema = (
    SUGGESTER_PROP_SCHEMAS as Record<string, AnySuggesterSchema | undefined>
  )[type];
  if (!schema) {
    console.warn(
      `[suggestOverlays] skipping beat: "${type}" is not a suggester-emittable molecule (no schema in SUGGESTER_PROP_SCHEMAS)`,
    );
    return false;
  }
  const unknownKeys = Object.keys(props).filter((k) => !(k in schema.shape));
  if (unknownKeys.length > 0) {
    console.warn(
      `[suggestOverlays] skipping ${type} beat: props not in the molecule schema (zod would silently strip them): ${unknownKeys.join(", ")}`,
    );
    return false;
  }
  const parsed = schema.safeParse(props);
  if (!parsed.success) {
    console.warn(
      `[suggestOverlays] skipping ${type} beat: props failed the molecule schema: ${parsed.error.message}`,
    );
    return false;
  }
  return true;
}

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
  /**
   * NOTE: `SuggesterEmittableType`, not editPlan's `OverlayType` — the suggester
   * may emit `BrandLogoPopOverSpeaker` / `SentimentKeyword` (both registered in
   * src/components/overlays/registry.ts and mountable by the scenes) which
   * editPlan.ts's `overlayTypeSchema` enum does not list yet. Extending that
   * enum is a one-line change owned by the editPlan/render wave task; until it
   * lands, `buildEditPlan`'s `editPlanSchema.parse` rejects brand beats LOUDLY
   * instead of silently rendering the wrong mark (preferred per finding 2.6).
   */
  type: SuggesterEmittableType;
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
      // R4 (GPT-5.6 finding 2.6): pick the molecule by what we can actually
      // render. Local logo asset → BrandLogoPopOverSpeaker (OV11). Emoji icon
      // mapping → IconPopOverSpeaker with a VALID `icon` prop. No local asset
      // → SentimentKeyword text chip carrying the spoken brand word. Props are
      // drawn ONLY from the target molecule's own schema (anchor is injected
      // top-level by the renderer; timing is owned by fromFrame/toFrame — no
      // loose enterFrame that could double-offset a Sequence-rebased molecule).
      const asset = BRAND_ASSETS[normalize(w.text)];
      const brandWord = w.text.trim();
      if (asset?.kind === "logo") {
        beat = {
          type: "BrandLogoPopOverSpeaker",
          anchor: "top-right",
          fromFrame: w.startFrame,
          toFrame: w.endFrame + o.calloutHoldFrames,
          props: { logoSrc: asset.src },
          confidence: 0.55,
          reason: `R4 brand/tool beat (local logo): "${brandWord}"`,
        };
      } else if (asset?.kind === "icon") {
        beat = {
          type: "IconPopOverSpeaker",
          anchor: "top-right",
          fromFrame: w.startFrame,
          toFrame: w.endFrame + o.calloutHoldFrames,
          props: { icon: asset.icon },
          confidence: 0.55,
          reason: `R4 brand/tool beat (icon mark): "${brandWord}"`,
        };
      } else {
        beat = {
          type: "SentimentKeyword",
          anchor: "top-right",
          fromFrame: w.startFrame,
          toFrame: w.endFrame + o.calloutHoldFrames,
          props: { text: brandWord, tone: "topic" },
          confidence: 0.55,
          reason: `R4 brand/tool beat (text chip, no local asset): "${brandWord}"`,
        };
      }
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
    // Cast documented on `Beat.type`: emittable names not yet in editPlan's
    // overlayTypeSchema enum (registry-registered; enum extension owned by the
    // editPlan/render wave task).
    type: b.type as OverlayType,
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
 *
 * EVERY emitted beat — whatever the strategy — is validated here against its
 * target molecule's own prop schema (`validateBeatProps`, GPT-5.6 finding 2.6).
 * The bag validated is `{anchor, ...props}`, mirroring exactly what
 * `renderFromPlan.buildSceneProps` mounts (`props: {anchor: o.anchor,
 * ...o.props}`), so a beat that passes here parses identically at render time.
 * Invalid beats are warned about and DROPPED, then ids are re-numbered dense.
 */
export function suggestOverlays(
  words: EditPlanWord[],
  opts: SuggestOverlaysOptions = {},
  strategy: SuggestStrategy = ruleBasedStrategy,
): OverlayInstance[] {
  if (words.length === 0) return [];
  return strategy(words, opts)
    .filter((o) => validateBeatProps(o.type, { anchor: o.anchor, ...o.props }))
    .map((o, i) => ({ ...o, id: `ov-${i}` }));
}
