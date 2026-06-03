/**
 * Registry of abhishek.devini-style FOREGROUND template components. Each is a
 * full-frame React.FC that renders its content (kicker, headline, cards, numbers…)
 * over the shared AbhiBackground (mounted by AbhiScene9x16). Self-validating props
 * via each component's own zod schema. New templates (built in Phase 4) register here.
 */
import type React from "react";

type LooseTemplate = React.FC<Record<string, unknown>>;

export const ABHI_REGISTRY = {
  // populated by Phase-4 template components
} as unknown as Record<string, LooseTemplate>;

export const ABHI_TEMPLATE_TYPES: string[] = Object.keys(ABHI_REGISTRY);
