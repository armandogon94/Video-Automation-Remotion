/**
 * HUDChrome family — persistent world-layer overlays that wrap any template.
 *
 * Each sub-component can be used standalone, OR composed together via the
 * `HUDChrome` wrapper. Wave-4 critique consensus (DIYSmart + Carlos) calls
 * this "persistent HUD chrome" — chrome that wraps any inner composition.
 */
export { SceneChapterChip } from "./SceneChapterChip";
export type {
  SceneChapterChipProps,
  SceneChapterChipPosition,
} from "./SceneChapterChip";

export { TopScrubBar } from "./TopScrubBar";
export type { TopScrubBarProps } from "./TopScrubBar";

export { ChapterStepper } from "./ChapterStepper";
export type { ChapterStep, ChapterStepperProps } from "./ChapterStepper";

export { HandleTag } from "./HandleTag";
export type { HandleTagProps } from "./HandleTag";

export { InsetCardBorder } from "./InsetCardBorder";
export type { InsetCardBorderProps } from "./InsetCardBorder";

export { HUDChrome } from "./HUDChrome";
export type { HUDChromeProps } from "./HUDChrome";
