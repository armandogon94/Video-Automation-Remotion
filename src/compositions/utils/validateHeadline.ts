/**
 * validateHeadline — Simon V5 typography lesson:
 *   "One-line headlines only. Every overlay text he uses fits on one line by design.
 *    This forces copywriting discipline ('Vibe Coding', not 'What vibe coding actually means')."
 *
 * Default `maxLength` is 14 characters (Wave-4 simonhoiberg consensus). Set higher
 * for templates that legitimately span 2 lines (KineticEssay, OutroFollowCTA).
 *
 * Behavior:
 *   - `mode: "throw"` — throws a clear error in dev / studio so the writer catches it.
 *   - `mode: "truncate"` — returns the truncated string + an ellipsis. Use in renders
 *     where we'd rather ship a shorter headline than crash the render.
 *   - `mode: "warn"` — logs a console warning + returns the original string.
 */
export interface ValidateHeadlineOptions {
  maxLength?: number;
  mode?: "throw" | "truncate" | "warn";
  /** Context label for the error / warning message. */
  context?: string;
}

const DEFAULT_MAX = 14;

export function validateHeadline(
  headline: string,
  opts: ValidateHeadlineOptions = {},
): string {
  const { maxLength = DEFAULT_MAX, mode = "warn", context = "headline" } = opts;
  if (headline.length <= maxLength) return headline;
  const msg = `[${context}] headline "${headline}" is ${headline.length} chars (max ${maxLength}). Simon V5: one-line headlines only.`;
  if (mode === "throw") throw new Error(msg);
  if (mode === "truncate") return headline.slice(0, maxLength - 1).trimEnd() + "…";
  console.warn(msg);
  return headline;
}
