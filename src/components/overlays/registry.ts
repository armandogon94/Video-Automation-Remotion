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
} as unknown as Record<string, LooseOverlay>;

export type OverlayType = keyof typeof OVERLAY_REGISTRY;

/** All registered overlay type names (for validation / Studio menus). */
export const OVERLAY_TYPES: string[] = Object.keys(OVERLAY_REGISTRY);
