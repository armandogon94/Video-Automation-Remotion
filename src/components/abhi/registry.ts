/**
 * Registry of abhishek.devini-style FOREGROUND template components. Each is a
 * full-frame React.FC that renders its content (kicker, headline, cards, numbers…)
 * over the shared AbhiBackground (mounted by AbhiScene9x16). Self-validating props
 * via each component's own zod schema. Built in Phase 4 from the STYLE-SPEC.
 */
import type React from "react";
import { AbhiTitleCard } from "./templates/AbhiTitleCard";
import { AbhiBigStat } from "./templates/AbhiBigStat";
import { AbhiCtaComment } from "./templates/AbhiCtaComment";
import { AbhiTerminalCard } from "./templates/AbhiTerminalCard";
import { AbhiFeatureRows } from "./templates/AbhiFeatureRows";
import { AbhiFeatureGrid } from "./templates/AbhiFeatureGrid";
import { AbhiGridVsTerminal } from "./templates/AbhiGridVsTerminal";
import { AbhiBrandLockup } from "./templates/AbhiBrandLockup";

type LooseTemplate = React.FC<Record<string, unknown>>;

export const ABHI_REGISTRY = {
  AbhiTitleCard,
  AbhiBigStat,
  AbhiCtaComment,
  AbhiTerminalCard,
  AbhiFeatureRows,
  AbhiFeatureGrid,
  AbhiGridVsTerminal,
  AbhiBrandLockup,
} as unknown as Record<string, LooseTemplate>;

export const ABHI_TEMPLATE_TYPES: string[] = Object.keys(ABHI_REGISTRY);
