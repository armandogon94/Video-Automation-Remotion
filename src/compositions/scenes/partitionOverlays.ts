/**
 * partitionOverlays — split a flat overlay array into two tracks:
 *
 *   - heroChains:  contiguous (or near-contiguous) sequences of hero-tier overlays
 *                  ("huge" | "subtitle" | "cta") that play back-to-back with NO overlap.
 *                  Chains of length ≥ 2 are eligible for <TransitionSeries> crossfades.
 *                  Single-overlay chains stay on Sequence orchestration.
 *
 *   - decorations: chip overlays + any hero overlay that overlaps with another hero
 *                  (i.e. the hero data model is being used for overlapping windows, which
 *                  TransitionSeries can't represent). These ALWAYS render via individual
 *                  <Sequence> wrappers.
 *
 * The classification is conservative — when in doubt, an overlay goes to `decorations` so
 * we never break the existing visual behavior. Chains require strict back-to-back ordering
 * (end_i == start_{i+1} ± tolerance) AND none of the chain members overlapping a chip or
 * another hero.
 */
import type { TechNewsOverlay } from "../schemas";

export type HeroKind = "huge" | "subtitle" | "cta";
export const HERO_KINDS: ReadonlySet<HeroKind> = new Set<HeroKind>([
  "huge",
  "subtitle",
  "cta",
]);

export function isHeroKind(kind: TechNewsOverlay["kind"]): kind is HeroKind {
  return HERO_KINDS.has(kind as HeroKind);
}

export interface HeroChain {
  /** Always ≥ 1. */
  members: TechNewsOverlay[];
  /** Absolute seconds — chain start = members[0].startSeconds, end = members[last].endSeconds. */
  startSeconds: number;
  endSeconds: number;
}

export interface PartitionedOverlays {
  /** Single-member chains stay here too (they render as plain Sequences in the composition). */
  heroChains: HeroChain[];
  /** Chips + any hero overlay that overlaps another hero (= can't be put in a chain). */
  decorations: TechNewsOverlay[];
}

/**
 * Two windows are "contiguous" if there's no gap and no overlap (within a small tolerance).
 * Tolerance defaults to 1/30s (one frame at 30fps) so rounded times from align.ts still
 * register as continuous.
 */
function contiguous(a: TechNewsOverlay, b: TechNewsOverlay, toleranceSec = 1 / 30): boolean {
  return Math.abs(b.startSeconds - a.endSeconds) <= toleranceSec;
}

function overlaps(a: TechNewsOverlay, b: TechNewsOverlay): boolean {
  return a.startSeconds < b.endSeconds && b.startSeconds < a.endSeconds;
}

export function partitionOverlays(overlays: TechNewsOverlay[]): PartitionedOverlays {
  // Sort by start time; ties broken by end time (shorter first).
  const sorted = [...overlays].sort((x, y) => {
    if (x.startSeconds !== y.startSeconds) return x.startSeconds - y.startSeconds;
    return x.endSeconds - y.endSeconds;
  });

  // First pass: identify which overlays overlap with ANY other overlay.
  const overlapsAnyone = new Set<number>();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].startSeconds >= sorted[i].endSeconds) break; // j sorted after i, no more overlap possible
      if (overlaps(sorted[i], sorted[j])) {
        overlapsAnyone.add(i);
        overlapsAnyone.add(j);
      }
    }
  }

  const heroChains: HeroChain[] = [];
  const decorations: TechNewsOverlay[] = [];

  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];

    // Non-heroes always go to decorations.
    if (!isHeroKind(cur.kind)) {
      decorations.push(cur);
      i++;
      continue;
    }

    // Heroes that overlap anyone (even another hero) go to decorations to preserve overlap behavior.
    if (overlapsAnyone.has(i)) {
      decorations.push(cur);
      i++;
      continue;
    }

    // Try to grow a chain forward from `i`.
    const chain: TechNewsOverlay[] = [cur];
    let j = i + 1;
    while (
      j < sorted.length &&
      isHeroKind(sorted[j].kind) &&
      !overlapsAnyone.has(j) &&
      contiguous(chain[chain.length - 1], sorted[j])
    ) {
      chain.push(sorted[j]);
      j++;
    }

    heroChains.push({
      members: chain,
      startSeconds: chain[0].startSeconds,
      endSeconds: chain[chain.length - 1].endSeconds,
    });
    i = j;
  }

  return { heroChains, decorations };
}
