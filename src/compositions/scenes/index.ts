/**
 * Scene components for TechNewsFlash9x16 (and future news-flash variants).
 *
 * Each "kind" of overlay (chip / huge / subtitle / cta) has its own component file so we
 * can extend per-kind motion without touching the orchestrator.
 *
 * Architecture
 *   - Decorations (chips, overlapping heroes) → individual <Sequence> wrappers.
 *   - Hero chains (2+ contiguous non-overlapping huge/subtitle/cta) → optionally wrapped in
 *     <TransitionSeries> via `useHeroChainTransitions` to get crossfades between adjacent
 *     scenes (gated by composition prop to preserve current visual behavior by default).
 */
export { ChipScene } from "./ChipScene";
export { HugeScene } from "./HugeScene";
export { SubtitleScene } from "./SubtitleScene";
export { CtaScene } from "./CtaScene";
export { SceneByKind } from "./SceneByKind";
export {
  useOverlayChoreography,
  PUNCHY_SPRING,
  EDITORIAL_SPRING,
  type OverlayChoreography,
  type SpringProfile,
  type UseOverlayChoreographyOpts,
} from "./useOverlayChoreography";
export {
  partitionOverlays,
  isHeroKind,
  HERO_KINDS,
  type HeroChain,
  type HeroKind,
  type PartitionedOverlays,
} from "./partitionOverlays";
