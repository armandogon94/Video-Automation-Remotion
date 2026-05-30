/**
 * Animation primitives — Wave-4 + Wave-5 consensus utilities.
 *
 * Build a number reveal:        `countUp` + `formatCount`.
 * Build a list reveal:          `staggerEntry` / `staggerSchedule`.
 * Build a tiered list reveal:   `heldStaggerState` / `heldStaggerSchedule`.   (Wave-5 / Tella)
 * Build an entry move:          `blurInFocus`.
 * Build a HUD counter:          `rollingDigit` / `rollingDate`.
 * Build a Simon-style climax:   `findDwellBeats` / `isInDwellBeat`.
 * Draw an SVG line / path:      `pathDraw` / `pathDrawStaggered`.            (Wave-5 / Tella)
 * Smart zoom on speaker:        `kenBurns` / `punchIn`.                       (Wave-5 / Tella)
 */
export {
  countUp,
  formatCount,
  type CountUpOptions,
  type CountUpEasing,
} from "./countUp";

export {
  staggerEntry,
  staggerSchedule,
  type StaggerOptions,
} from "./staggeredCascade";

export {
  blurInFocus,
  type BlurInFocusOptions,
  type BlurInFocusValues,
} from "./blurInFocus";

export {
  rollingDigit,
  rollingDate,
  type RollingDigitOptions,
  type RollingDateOptions,
} from "./rollingDigit";

export {
  findDwellBeats,
  isInDwellBeat,
  totalDwellSeconds,
  type DwellBeat,
  type FindDwellBeatsOptions,
} from "./dwellBeat";

export {
  pathDraw,
  pathDrawStaggered,
  type PathDrawOptions,
  type PathDrawValues,
  type PathDrawEasing,
  type PathDrawDirection,
} from "./pathDraw";

export {
  heldStaggerSchedule,
  heldStaggerEntry,
  heldStaggerState,
  type HeldStaggerOptions,
  type HeldStaggerOptionsForIndex,
  type HeldStaggerEntry,
  type HeldStaggerState,
  type HeldStaggerPhase,
} from "./heldStagger";

export {
  kenBurns,
  punchIn,
  type KenBurnsOptions,
  type PunchInOptions,
  type SmartZoomResult,
  type FocalPoint,
} from "./smartZoom";
