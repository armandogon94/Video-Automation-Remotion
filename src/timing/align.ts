/**
 * Audio-driven timing helpers.
 *
 * Single source of truth for matching VISUAL events to AUDIO events.
 * Used by both the Remotion orchestrator and the HyperFrames orchestrator
 * so captions, big overlays, and any future motion stays in sync with the voice.
 *
 * Solves three bugs from the W21 first-render postmortem:
 *   1. Caption-group double-paint (use `nonOverlappingGroups`)
 *   2. Caption highlight phasing (use `alignScriptToWhisper` — script text + whisper timing)
 *   3. Big-overlay drift (use `findKeyword` to anchor overlays to spoken words, not hardcoded seconds)
 *
 * No Remotion / HyperFrames imports — pure logic.
 */

// ─── Types ──────────────────────────────────────────────────────────

export interface TimedWord {
  text: string;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
}

export interface WhisperWord {
  text: string;
  startSeconds: number;
  endSeconds: number;
  /** Optional — only present if whisper output includes it. */
  probability?: number;
}

export interface TTSWord extends TimedWord {
  /** Edge-TTS exposes this directly. */
}

export interface AlignedWord extends TimedWord {
  /** Where the timing originated. Useful for debugging caption drift. */
  source: "whisper" | "interpolated" | "tts-fallback";
}

export interface CaptionGroup {
  words: AlignedWord[];
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
}

// ─── Normalization ──────────────────────────────────────────────────

/**
 * Normalize a word for comparison: lowercase, strip punctuation + accents.
 * Spanish has accented vowels (á é í ó ú) and ñ — both must round-trip.
 *
 *   normalize("Gemini")          → "gemini"
 *   normalize("escandalosos.")   → "escandalosos"
 *   normalize("I/O")             → "io"
 *   normalize("noventa")         → "noventa"
 *   normalize("¡FILTRACIÓN!")    → "filtracion"
 */
export function normalize(s: string): string {
  return s
    .normalize("NFD") // decompose accents
    .replace(/[̀-ͯ]/g, "") // strip combining marks
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ""); // strip non-letter/number (kills punctuation)
}

// ─── Alignment ──────────────────────────────────────────────────────

/**
 * Align the SCRIPT's words (correct text, no transcription errors) to WHISPER's word
 * timings (accurate per-word boundaries). Returns AlignedWord[] with script text +
 * whisper timing.
 *
 * Strategy:
 *  - Walk both arrays in parallel.
 *  - At each step compare normalized text. Match → emit + advance both.
 *  - Whisper sometimes SPLITS one script word into multiple (e.g. "I/O" → "I", "barra",
 *    "diagonal", "O"). When the next whisper word doesn't match, look ahead up to
 *    `maxLookahead` whisper tokens for the script word. If found, advance whisper past
 *    the extras and span the whisper time across them. If not found within the window,
 *    fall back to interpolation from the neighbors.
 *  - Whisper sometimes MISSES a script word entirely. Detected via the look-ahead miss
 *    → interpolate timing from previous and next anchor.
 *
 * This is good enough for Spanish news-style audio where whisper's main failure mode is
 * splitting abbreviations and brand names. It is NOT a full edit-distance alignment.
 */
export function alignScriptToWhisper(
  scriptWords: TTSWord[],
  whisperWords: WhisperWord[],
  fps: number = 30,
  maxLookahead: number = 4,
): AlignedWord[] {
  const out: AlignedWord[] = [];
  let wi = 0; // whisper index

  for (let si = 0; si < scriptWords.length; si++) {
    const scriptWord = scriptWords[si];
    const targetNorm = normalize(scriptWord.text);

    if (targetNorm === "") {
      // pure punctuation in the script — emit with tts time as-is
      out.push({ ...scriptWord, source: "tts-fallback" });
      continue;
    }

    // Look for a match in the next maxLookahead whisper tokens, starting at wi.
    let matchAt = -1;
    for (let k = 0; k < maxLookahead && wi + k < whisperWords.length; k++) {
      const wn = normalize(whisperWords[wi + k].text);
      if (wn === "") continue;
      // exact normalize match, OR script word contains whisper word as prefix (handles
      // "I/O." vs "I" — whisper has a shorter version), OR whisper word contains script
      // word (handles cases where whisper merges).
      if (wn === targetNorm || wn.startsWith(targetNorm) || targetNorm.startsWith(wn)) {
        matchAt = wi + k;
        break;
      }
    }

    if (matchAt >= 0) {
      // Match found. Span time from whisper[wi] through whisper[matchAt].
      const startW = whisperWords[wi];
      const endW = whisperWords[matchAt];
      const startSeconds = startW.startSeconds;
      const endSeconds = endW.endSeconds;
      out.push({
        text: scriptWord.text,
        startSeconds,
        endSeconds,
        startFrame: Math.round(startSeconds * fps),
        endFrame: Math.round(endSeconds * fps),
        source: "whisper",
      });
      wi = matchAt + 1;
    } else {
      // No match in window. Interpolate from neighbors.
      const prev = out.length > 0 ? out[out.length - 1] : null;
      const lookaheadWhisper = whisperWords[wi];
      let interpStart: number;
      let interpEnd: number;
      if (prev && lookaheadWhisper) {
        // Linear interp between prev end and the next whisper start
        const span = lookaheadWhisper.startSeconds - prev.endSeconds;
        // Estimate this script word as 1 of N untraced script words; for simplicity assume 1.
        interpStart = prev.endSeconds + span * 0.1;
        interpEnd = prev.endSeconds + span * 0.9;
      } else if (prev) {
        interpStart = prev.endSeconds + 0.05;
        interpEnd = prev.endSeconds + 0.25;
      } else if (lookaheadWhisper) {
        interpStart = Math.max(0, lookaheadWhisper.startSeconds - 0.25);
        interpEnd = lookaheadWhisper.startSeconds;
      } else {
        // Worst case — use the TTS approximate timing
        out.push({ ...scriptWord, source: "tts-fallback" });
        continue;
      }
      out.push({
        text: scriptWord.text,
        startSeconds: interpStart,
        endSeconds: interpEnd,
        startFrame: Math.round(interpStart * fps),
        endFrame: Math.round(interpEnd * fps),
        source: "interpolated",
      });
    }
  }

  return out;
}

// ─── Keyword anchors (for audio-driven overlay timing) ──────────────

/**
 * Find when a keyword is FIRST spoken in the aligned word list. Returns null if not found.
 *
 * Used by orchestrators to anchor big-typography overlays to actual spoken time:
 *
 *   const t = findKeyword("Quince", aligned);
 *   overlays.push({ kind: "huge", text: "15× MÁS BARATO", startSeconds: t.startSeconds, ... });
 *
 * Matching is normalized (case-insensitive, accent-insensitive, punctuation-stripped).
 * If `keyword` is a multi-word phrase, all words must appear consecutively.
 */
export function findKeyword(keyword: string, aligned: AlignedWord[]): AlignedWord | null {
  const target = normalize(keyword);
  if (target === "") return null;
  // Multi-word keyword: split, find consecutive match.
  const targetTokens = keyword.split(/\s+/).map(normalize).filter(Boolean);
  if (targetTokens.length === 1) {
    return aligned.find((w) => normalize(w.text) === target) ||
           aligned.find((w) => normalize(w.text).startsWith(target)) ||
           null;
  }
  // Slide a window
  for (let i = 0; i + targetTokens.length <= aligned.length; i++) {
    let ok = true;
    for (let j = 0; j < targetTokens.length; j++) {
      if (normalize(aligned[i + j].text) !== targetTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      // Return a synthesized AlignedWord spanning the phrase
      const first = aligned[i];
      const last = aligned[i + targetTokens.length - 1];
      return {
        text: keyword,
        startSeconds: first.startSeconds,
        endSeconds: last.endSeconds,
        startFrame: first.startFrame,
        endFrame: last.endFrame,
        source: first.source,
      };
    }
  }
  return null;
}

/**
 * Anchor a list of overlays to their respective keywords in the spoken audio.
 * Each overlay describes a relative timing offset (e.g. enter 0.5s before keyword,
 * stay for 2.5s after). If keyword isn't found, falls back to the brief's hardcoded
 * timing so a missing keyword doesn't crash the render.
 */
export interface OverlayAnchorSpec {
  /** Whatever overlay shape the composition uses — passed through verbatim. */
  payload: Record<string, unknown>;
  /** Keyword to find in the aligned word list. */
  anchorKeyword: string;
  /** Seconds BEFORE the keyword's start to enter (positive = early entry). Default 0.3s. */
  leadInSeconds?: number;
  /** Total visible duration. Default 2.5s. */
  durationSeconds?: number;
  /** Fallback timing if the keyword isn't found in the audio. */
  fallback?: { startSeconds: number; endSeconds: number };
}

export interface AnchoredOverlay {
  payload: Record<string, unknown>;
  startSeconds: number;
  endSeconds: number;
  anchorMatched: boolean;
  anchorKeyword: string;
}

export function anchorOverlays(
  specs: OverlayAnchorSpec[],
  aligned: AlignedWord[],
): AnchoredOverlay[] {
  return specs.map((spec) => {
    const found = findKeyword(spec.anchorKeyword, aligned);
    const leadIn = spec.leadInSeconds ?? 0.3;
    const duration = spec.durationSeconds ?? 2.5;
    if (found) {
      return {
        payload: spec.payload,
        startSeconds: Math.max(0, found.startSeconds - leadIn),
        endSeconds: found.startSeconds - leadIn + duration,
        anchorMatched: true,
        anchorKeyword: spec.anchorKeyword,
      };
    }
    if (spec.fallback) {
      return {
        payload: spec.payload,
        startSeconds: spec.fallback.startSeconds,
        endSeconds: spec.fallback.endSeconds,
        anchorMatched: false,
        anchorKeyword: spec.anchorKeyword,
      };
    }
    // Last resort — invisible (zero duration). Surface as a render warning later.
    return {
      payload: spec.payload,
      startSeconds: 0,
      endSeconds: 0,
      anchorMatched: false,
      anchorKeyword: spec.anchorKeyword,
    };
  });
}

// ─── Caption windowing (no overlap) ─────────────────────────────────

/**
 * Split aligned words into non-overlapping caption groups. Each group ends BEFORE the next
 * one begins, so the renderer never paints two groups simultaneously (fixes Bug 1).
 *
 *   groupSize        — words per visible window (default 6, matches Caption.tsx)
 *   minGapMs         — minimum silent gap between groups so the swap reads (default 60ms)
 *   trailingHoldMs   — how long the LAST word of a group stays on screen after its endSeconds
 *                      (default 0 — group hides immediately when last word ends). The previous
 *                      bug shipped 400ms here, causing every transition to double-paint.
 */
export function nonOverlappingGroups(
  aligned: AlignedWord[],
  groupSize: number = 6,
  minGapMs: number = 60,
  trailingHoldMs: number = 0,
  fps: number = 30,
): CaptionGroup[] {
  const groups: CaptionGroup[] = [];
  const gap = minGapMs / 1000;
  const hold = trailingHoldMs / 1000;

  for (let i = 0; i < aligned.length; i += groupSize) {
    const slice = aligned.slice(i, i + groupSize);
    if (slice.length === 0) continue;
    const startSeconds = slice[0].startSeconds;
    const lastWordEnd = slice[slice.length - 1].endSeconds;
    const idealEnd = lastWordEnd + hold;
    // Clamp to NOT overlap into the next group's start (if any)
    const nextSliceStart =
      i + groupSize < aligned.length
        ? Math.max(0, aligned[i + groupSize].startSeconds - gap)
        : Number.POSITIVE_INFINITY;
    const endSeconds = Math.min(idealEnd, nextSliceStart);
    groups.push({
      words: slice,
      startSeconds,
      endSeconds,
      startFrame: Math.round(startSeconds * fps),
      endFrame: Math.round(endSeconds * fps),
    });
  }
  return groups;
}

// ─── Sanity / inspection ────────────────────────────────────────────

/**
 * Cheap diagnostic — report how many words landed where in the alignment.
 * Useful in render scripts to log how confident the audio sync is.
 */
export function summarizeAlignment(aligned: AlignedWord[]) {
  const counts = { whisper: 0, interpolated: 0, "tts-fallback": 0 };
  for (const w of aligned) counts[w.source]++;
  const total = aligned.length;
  return {
    total,
    counts,
    coverage: {
      whisper: total > 0 ? counts.whisper / total : 0,
      interpolated: total > 0 ? counts.interpolated / total : 0,
      ttsFallback: total > 0 ? counts["tts-fallback"] / total : 0,
    },
    durationSeconds: aligned.length > 0 ? aligned[aligned.length - 1].endSeconds : 0,
  };
}
