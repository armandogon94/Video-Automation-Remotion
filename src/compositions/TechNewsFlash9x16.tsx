/**
 * TechNewsFlash9x16 — vertical (1080×1920) news-flash composition.
 *
 * Refactored 2026-05-24 (Sprint 1 Step 5): per-kind overlay components are now extracted
 * into `./scenes/{ChipScene,HugeScene,SubtitleScene,CtaScene}.tsx`. This file is now a
 * thin orchestrator that:
 *
 *   1) Resolves palette + accent color (palette → tools-palette override).
 *   2) Mounts the BrandBreadcrumb (universal house-grammar element).
 *   3) Partitions overlays into "hero chains" (sequential huge/subtitle/cta with no
 *      overlap) vs "decorations" (chips + any overlapping hero).
 *   4) Renders decorations as individual <Sequence>s — preserves the overlapping-overlay
 *      behavior that the W21 render relies on (chip riding on top of huge).
 *   5) Renders hero chains as individual <Sequence>s by default, OR as <TransitionSeries>
 *      with crossfades when `useHeroTransitions` is true. Default false to keep the W21
 *      visual unchanged; opt-in for new renders that want the smoother flow.
 *   6) Mounts EditorialCaption in the bottom strip.
 *
 * Layout
 *   ┌──────────────────────────────────────┐
 *   │  [chip]                              │  ← decoration (top-left)
 *   │                                      │
 *   │           [hero scene]               │  ← hero zone (vertical center)
 *   │                                      │
 *   │     [word-by-word captions]          │  ← bottom third
 *   │                                      │
 *   └──────────────────────────────────────┘
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { TechNewsFlashProps, TechNewsOverlay } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface } from "../brand";
import {
  SceneByKind,
  partitionOverlays,
  type HeroChain,
} from "./scenes";

// 15-frame crossfade for hero-chain transitions (~0.5s @ 30fps).
// TransitionSeries overlaps adjacent scenes by `durationInFrames`, so each chain
// member effectively absorbs half the transition on each side. To preserve the
// caller's original overlay timing we extend interior scenes by the full
// transition length (boundary scenes only extend on the interior side).
const TRANSITION_FRAMES = 15;

interface HeroChainRenderProps {
  chain: HeroChain;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  useTransitions: boolean;
}

/**
 * Render a single hero chain.
 * - If `useTransitions` is false OR the chain has only 1 member, falls back to one
 *   <Sequence> per member (= the legacy behavior).
 * - If `useTransitions` is true AND chain.length ≥ 2, wraps all members in a single
 *   absolute <Sequence> + <TransitionSeries> with fade crossfades between members.
 */
const HeroChainRender: React.FC<HeroChainRenderProps> = ({
  chain,
  inkColor,
  accentColor,
  mutedColor,
  useTransitions,
}) => {
  const { fps } = useVideoConfig();

  // Single-member chain or transitions disabled → plain Sequence per member.
  if (!useTransitions || chain.members.length < 2) {
    return (
      <>
        {chain.members.map((overlay, i) => {
          const fromFrame = Math.round(overlay.startSeconds * fps);
          const durationFrames = Math.max(
            1,
            Math.round((overlay.endSeconds - overlay.startSeconds) * fps),
          );
          return (
            <Sequence
              key={`hero-${chain.startSeconds}-${i}`}
              from={fromFrame}
              durationInFrames={durationFrames}
              layout="none"
            >
              <SceneByKind
                overlay={overlay}
                durationFrames={durationFrames}
                inkColor={inkColor}
                accentColor={accentColor}
                mutedColor={mutedColor}
                fadeMode="standalone"
              />
            </Sequence>
          );
        })}
      </>
    );
  }

  // Multi-member chain WITH transitions → single absolute Sequence + TransitionSeries.
  // Each interior member is padded by TRANSITION_FRAMES so the overlap nets out and the
  // chain's total visible time still matches sum(overlay durations).
  const chainStartFrame = Math.round(chain.startSeconds * fps);
  const chainTotalFrames = Math.round((chain.endSeconds - chain.startSeconds) * fps);

  return (
    <Sequence
      from={chainStartFrame}
      durationInFrames={chainTotalFrames + TRANSITION_FRAMES * (chain.members.length - 1)}
      layout="none"
    >
      <TransitionSeries>
        {chain.members.map((overlay, i) => {
          const baseDuration = Math.max(
            1,
            Math.round((overlay.endSeconds - overlay.startSeconds) * fps),
          );
          // Pad each scene by TRANSITION_FRAMES (added to the next-side boundary)
          // so the overlap from the transition is absorbed and visible time is preserved.
          const isLast = i === chain.members.length - 1;
          const paddedDuration = baseDuration + (isLast ? 0 : TRANSITION_FRAMES);

          return (
            <React.Fragment key={`hc-${i}`}>
              <TransitionSeries.Sequence durationInFrames={paddedDuration}>
                <SceneByKind
                  overlay={overlay}
                  durationFrames={paddedDuration}
                  inkColor={inkColor}
                  accentColor={accentColor}
                  mutedColor={mutedColor}
                  fadeMode="in-group"
                />
              </TransitionSeries.Sequence>
              {!isLast && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </Sequence>
  );
};

/**
 * Render a decoration overlay (chip OR a hero overlay that overlaps another hero).
 * Always a single <Sequence>, never wrapped in TransitionSeries.
 */
const DecorationRender: React.FC<{
  overlay: TechNewsOverlay;
  index: number;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
}> = ({ overlay, index, inkColor, accentColor, mutedColor }) => {
  const { fps } = useVideoConfig();
  const fromFrame = Math.round(overlay.startSeconds * fps);
  const durationFrames = Math.max(
    1,
    Math.round((overlay.endSeconds - overlay.startSeconds) * fps),
  );
  return (
    <Sequence
      key={`dec-${index}`}
      from={fromFrame}
      durationInFrames={durationFrames}
      layout="none"
    >
      <SceneByKind
        overlay={overlay}
        durationFrames={durationFrames}
        inkColor={inkColor}
        accentColor={accentColor}
        mutedColor={mutedColor}
        fadeMode="standalone"
      />
    </Sequence>
  );
};

// ─── Top-level composition ───────────────────────────────────────────
export const TechNewsFlash9x16: React.FC<TechNewsFlashProps> = ({
  audioUrl,
  wordTimings,
  overlays,
  breadcrumb,
  subjectTool,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  useHeroTransitions,
}) => {
  // Subject-tool-tinted accent override: if subjectTool is set, resolve to that tool's
  // brand color via the tools-palette lookup; else fall back to caller-supplied accent.
  // TechNewsFlash9x16 is always cream-paper — use the cream-surface accent so the
  // Gemini blue lands at the AA-passing #1A73E8 instead of dark-tuned #4285F4
  // (Wave-3 AA re-audit A2 Top-5 #2 / §"Top 5 still-outstanding" #3).
  const resolvedAccent = subjectTool ? getToolAccentForSurface(subjectTool, "cream") : accentColor;

  // Partition overlays into hero chains (sequential heros) and decorations (chips +
  // overlapping heroes). Same data model — the partition is purely about rendering path.
  const { heroChains, decorations } = partitionOverlays(overlays);

  return (
    <AbsoluteFill style={{ background: paperColor }}>
      {/* Voiceover */}
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Subtle paper grain — very faint radial gradient so cream paper isn't sterile */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,255,255,0.6) 0%, rgba(0,0,0,0.02) 100%)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (Carlos + DIYSmartCode pattern) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Hero chains — sequential huge/subtitle/cta overlays, optionally crossfaded */}
      {heroChains.map((chain, i) => (
        <HeroChainRender
          key={`chain-${i}`}
          chain={chain}
          inkColor={inkColor}
          accentColor={resolvedAccent}
          mutedColor={mutedColor}
          useTransitions={useHeroTransitions}
        />
      ))}

      {/* Decorations — chips + any overlapping hero — always individual Sequences */}
      {decorations.map((overlay, i) => (
        <DecorationRender
          key={`dec-${i}`}
          overlay={overlay}
          index={i}
          inkColor={inkColor}
          accentColor={resolvedAccent}
          mutedColor={mutedColor}
        />
      ))}

      {/* Word-by-word captions in bottom third — @remotion/captions paginated,
          non-overlapping by construction (fixes Bug 1 from W21 postmortem). */}
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 240,
          fontSize: captionFontSize,
          paperColor,
          inkColor,
          accentColor: resolvedAccent,
          mutedBorderColor: `${mutedColor}33`,
          maxWidthPx: 960,
        }}
      />
    </AbsoluteFill>
  );
};
