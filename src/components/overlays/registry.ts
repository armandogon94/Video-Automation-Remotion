/**
 * Over-speaker overlay registry (OV1–OV12).
 *
 * Maps an overlay TYPE NAME → its molecule component, so a data-driven layer
 * (SpeakerOverlayScene's `overlays` prop, and the autoedit EditPlan's
 * `overlayTrack` per ADR-003) can mount any overlay by name. Each molecule
 * self-validates its own props (schema.parse over a Partial), so the registry
 * stores them as loosely-typed components keyed by name; the molecule's own zod
 * schema is the prop contract, validated at render time.
 */
import type React from "react";
import { BuildingBulletListOverSpeaker } from "./BuildingBulletListOverSpeaker";
import { YellowGlowWordCallout } from "./YellowGlowWordCallout";
import { FloatingNumberedChipRow } from "./FloatingNumberedChipRow";
import { IconPopOverSpeaker } from "./IconPopOverSpeaker";
import { IconStatChipStack } from "./IconStatChipStack";
import { DiagnosticCalloutCard } from "./DiagnosticCalloutCard";
import { FloatingTweetCardOverSpeaker } from "./FloatingTweetCardOverSpeaker";
import { ColumnarNumberWithDividers } from "./ColumnarNumberWithDividers";
import { FloatingProductCard } from "./FloatingProductCard";
import { PersistentCornerBadge } from "./PersistentCornerBadge";
import { BrandLogoPopOverSpeaker } from "./BrandLogoPopOverSpeaker";
import { AnimatedOpenerTitleOverDarkSet } from "./AnimatedOpenerTitleOverDarkSet";
// Region-box object-emphasis molecules (Tier-1, NO AI — AZisk §2 OE1–OE4).
import { RegionBoxAnnotation } from "./RegionBoxAnnotation";
import { LumaHighlightBar } from "./LumaHighlightBar";
import { DimSurroundingsSpotlight } from "./DimSurroundingsSpotlight";
// Versatile multi-mode text reveal (behind-speaker depth OR on-screen).
import { RevealText } from "./RevealText";
// Wave-10 components (creator-mined, built in parallel).
import { CountUpStat } from "./CountUpStat";
import { SentimentKeyword } from "./SentimentKeyword";
import { ChapterTocRail } from "./ChapterTocRail";
import { SegmentedProgressBar } from "./SegmentedProgressBar";
import { GrowthCompareBars } from "./GrowthCompareBars";
import { MarkerSweepWord } from "./MarkerSweepWord";
// Wave-10 round A.
import { LowerThirdNameTag } from "./LowerThirdNameTag";
import { PullQuoteCard } from "./PullQuoteCard";
import { ChecklistTypeOn } from "./ChecklistTypeOn";
import { ComparisonVS } from "./ComparisonVS";
import { StatRowTriple } from "./StatRowTriple";
import { GradientHeadlineCard } from "./GradientHeadlineCard";
// Layout-punch content stack (austin.marchese grammar — kicker + title +
// progressive numbered liquid-glass cards beside a side-panel speaker).
import { SidePanelCards } from "./SidePanelCards";

type LooseOverlay = React.FC<Record<string, unknown>>;

export const OVERLAY_REGISTRY = {
  BuildingBulletListOverSpeaker,
  YellowGlowWordCallout,
  FloatingNumberedChipRow,
  IconPopOverSpeaker,
  IconStatChipStack,
  DiagnosticCalloutCard,
  FloatingTweetCardOverSpeaker,
  ColumnarNumberWithDividers,
  FloatingProductCard,
  PersistentCornerBadge,
  BrandLogoPopOverSpeaker,
  AnimatedOpenerTitleOverDarkSet,
  RegionBoxAnnotation,
  LumaHighlightBar,
  DimSurroundingsSpotlight,
  RevealText,
  CountUpStat,
  SentimentKeyword,
  ChapterTocRail,
  SegmentedProgressBar,
  GrowthCompareBars,
  MarkerSweepWord,
  LowerThirdNameTag,
  PullQuoteCard,
  ChecklistTypeOn,
  ComparisonVS,
  StatRowTriple,
  GradientHeadlineCard,
  SidePanelCards,
} as unknown as Record<string, LooseOverlay>;

export type OverlayType = keyof typeof OVERLAY_REGISTRY;

/** All registered overlay type names (for validation / Studio menus). */
export const OVERLAY_TYPES: string[] = Object.keys(OVERLAY_REGISTRY);
