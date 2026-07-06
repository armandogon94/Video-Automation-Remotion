/** FeedbackLoopCycle9x16 — thin aspect wrapper; full impl in FeedbackLoopCycleCore. */
import React from "react";
import {
  FeedbackLoopCycleCore,
  feedbackLoopCycleSchema,
  type FeedbackLoopCycleProps,
} from "./FeedbackLoopCycleCore";

export const feedbackLoopCycle9x16Schema = feedbackLoopCycleSchema;

/** 9:16 tuning (1080×1920) — taller ellipse, narrower chips, smaller type. */
export const feedbackLoopCycle9x16Defaults: FeedbackLoopCycleProps =
  feedbackLoopCycleSchema.parse({
    ellipseRadiusXFrac: 0.32,
    ellipseRadiusYFrac: 0.23,
    centerYFrac: 0.55,
    headerTopFrac: 0.075,
    cardWidth: 300,
    stationFontSize: 27,
    titleFontSize: 56,
    arcTrimDeg: 27,
  });

export const FeedbackLoopCycle9x16: React.FC<FeedbackLoopCycleProps> = (
  props,
) => <FeedbackLoopCycleCore {...props} />;
