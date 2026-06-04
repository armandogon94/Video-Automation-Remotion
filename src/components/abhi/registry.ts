/**
 * Registry of abhishek.devini-style FOREGROUND template components (23 — the full
 * vocabulary across his 18 reels). Each is a full-frame React.FC rendering content
 * over the shared AbhiBackground (mounted by AbhiScene9x16). Self-validating props.
 */
import type React from "react";
// Core 8
import { AbhiTitleCard } from "./templates/AbhiTitleCard";
import { AbhiBigStat } from "./templates/AbhiBigStat";
import { AbhiCtaComment } from "./templates/AbhiCtaComment";
import { AbhiTerminalCard } from "./templates/AbhiTerminalCard";
import { AbhiFeatureRows } from "./templates/AbhiFeatureRows";
import { AbhiFeatureGrid } from "./templates/AbhiFeatureGrid";
import { AbhiGridVsTerminal } from "./templates/AbhiGridVsTerminal";
import { AbhiBrandLockup } from "./templates/AbhiBrandLockup";
// Expansion 15
import { AbhiBrowserMockup } from "./templates/AbhiBrowserMockup";
import { AbhiKineticSubtitle } from "./templates/AbhiKineticSubtitle";
import { AbhiNodeGraph } from "./templates/AbhiNodeGraph";
import { AbhiBarChart } from "./templates/AbhiBarChart";
import { AbhiPhoneMockup } from "./templates/AbhiPhoneMockup";
import { AbhiComparisonTable } from "./templates/AbhiComparisonTable";
import { AbhiChecklist } from "./templates/AbhiChecklist";
import { AbhiTwoColumn } from "./templates/AbhiTwoColumn";
import { AbhiScrambleOpener } from "./templates/AbhiScrambleOpener";
import { AbhiQuoteCard } from "./templates/AbhiQuoteCard";
import { AbhiTweetCard } from "./templates/AbhiTweetCard";
import { AbhiWaveform } from "./templates/AbhiWaveform";
import { AbhiAppCard } from "./templates/AbhiAppCard";
import { AbhiLineChart } from "./templates/AbhiLineChart";
import { AbhiCodeDiff } from "./templates/AbhiCodeDiff";

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
  AbhiBrowserMockup,
  AbhiKineticSubtitle,
  AbhiNodeGraph,
  AbhiBarChart,
  AbhiPhoneMockup,
  AbhiComparisonTable,
  AbhiChecklist,
  AbhiTwoColumn,
  AbhiScrambleOpener,
  AbhiQuoteCard,
  AbhiTweetCard,
  AbhiWaveform,
  AbhiAppCard,
  AbhiLineChart,
  AbhiCodeDiff,
} as unknown as Record<string, LooseTemplate>;

export const ABHI_TEMPLATE_TYPES: string[] = Object.keys(ABHI_REGISTRY);
