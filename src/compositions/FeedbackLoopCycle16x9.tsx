/** FeedbackLoopCycle16x9 — thin aspect wrapper; full impl in FeedbackLoopCycleCore. */
import React from "react";
import {
  FeedbackLoopCycleCore,
  feedbackLoopCycleSchema,
  type FeedbackLoopCycleProps,
} from "./FeedbackLoopCycleCore";

export const feedbackLoopCycle16x9Schema = feedbackLoopCycleSchema;

/** 16:9 tuning (1920×1080) — wide ellipse, larger type (the core defaults). */
export const feedbackLoopCycle16x9Defaults: FeedbackLoopCycleProps =
  feedbackLoopCycleSchema.parse({});

export const FeedbackLoopCycle16x9: React.FC<FeedbackLoopCycleProps> = (
  props,
) => <FeedbackLoopCycleCore {...props} />;
