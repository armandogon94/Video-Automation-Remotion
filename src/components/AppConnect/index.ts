/**
 * AppConnect — Wave-5 Tella synthesis T5 molecules.
 *
 * Two molecules ship from this folder:
 *   - `<AppIconPair>`        — two app icons + drawn connector (line / arc).
 *   - `<NotificationToast>`  — single iOS-style notification toast (compose
 *                              multiple via `heldStaggerState` from
 *                              `src/animation/heldStagger.ts` to encode a
 *                              cascade with explicit dwell beats).
 *
 * Reference: `docs/research/wave-5/tella-motion-graphics-synthesis.md`
 * (section T5, frame refs `tella-frames/ykBDqicGx0M/frame-09` and `frame-10`).
 */
export { AppIconPair } from "./AppIconPair";
export type {
  AppIcon,
  AppIconPairProps,
  AppIconPairConnector,
  AppIconPairEndMarker,
} from "./AppIconPair";

export { NotificationToast } from "./NotificationToast";
export type {
  NotificationToastApp,
  NotificationToastProps,
} from "./NotificationToast";
