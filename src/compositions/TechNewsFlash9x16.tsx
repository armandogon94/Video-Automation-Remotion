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
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
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

// ─── dark-changelog chrome (DIYSmartCode "DarkChangelog" Short grammar) ───────
// All of the following only mount when mode === "dark-changelog". They are purely
// additive — the "default" mode never references any of them.

/** Canonical DIYSmartCode bottom-stepper rail (used when stepperSteps is empty). */
const DEFAULT_STEPPER_STEPS = ["SETUP", "CREATE", "EVAL", "DEPLOY", "PUBLISH"];

/** Tiny deterministic hash → [0,1) so particle positions are stable across frames
 *  and renders (no Math.random — Remotion renders frames out of order). */
const seeded = (n: number): number => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * CosmicGradientBackdrop — deep navy → green-tinted radial blends with a faint
 * warm bloom on the right, plus a field of softly-drifting particle dots. Mirrors
 * the @DIYSmartCode "agentic era" backdrop (navy top, green-tint lower body, red
 * bloom upper-right).
 */
const CosmicGradientBackdrop: React.FC<{ accentColor: string }> = ({
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 28 deterministic dots in Google-brand-ish colors (matches the source's
  // multi-color speckle), each with its own slow vertical drift + twinkle.
  const dotColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", accentColor];
  const dots = Array.from({ length: 28 }, (_, i) => {
    const baseX = seeded(i + 1) * 100;
    const baseY = seeded(i + 17) * 100;
    const radius = 2 + seeded(i + 41) * 5;
    const driftAmp = 1.5 + seeded(i + 67) * 3.5;
    const phase = seeded(i + 89) * Math.PI * 2;
    const t = (frame / Math.max(1, durationInFrames)) * Math.PI * 2;
    const y = baseY + Math.sin(t + phase) * driftAmp;
    const twinkle =
      0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2 + phase));
    const color = dotColors[i % dotColors.length];
    return { baseX, y, radius, twinkle, color, key: i };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Deep cosmic base: navy core, green-tint lower body */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, #16223C 0%, #0C1424 42%, #070C16 100%)",
        }}
      />
      {/* Green wash rising from the lower-center */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 60% at 45% 88%, rgba(52,168,83,0.20) 0%, rgba(52,168,83,0.0) 60%)",
        }}
      />
      {/* Warm bloom upper-right (the source's red/orange glow) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 45% at 88% 22%, rgba(234,67,53,0.16) 0%, rgba(234,67,53,0.0) 55%)",
        }}
      />
      {/* Particle field */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1080 1920"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {dots.map((d) => (
          <circle
            key={`dot-${d.key}`}
            cx={(d.baseX / 100) * 1080}
            cy={(d.y / 100) * 1920}
            r={d.radius}
            fill={d.color}
            opacity={d.twinkle}
          />
        ))}
      </svg>
      {/* Thin inset frame border (the source has a subtle rounded inner border) */}
      <AbsoluteFill
        style={{
          margin: 18,
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 28,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * TopProgressSweep — thin accent bar pinned to the very top edge whose width
 * grows with overall playback progress (the source's top "loading" line).
 */
const TopProgressSweep: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 6,
        width: `${pct * 100}%`,
        background: accentColor,
        boxShadow: `0 0 14px ${accentColor}`,
      }}
    />
  );
};

/**
 * ChangelogCounter — the big numbered counter ("01"/"02"/"03") sitting under the
 * breadcrumb. SOLID accent color (per the headless-Chromium background-clip gotcha)
 * with a soft accent glow. Springs in on mount.
 */
const ChangelogCounter: React.FC<{ counter: string; accentColor: string }> = ({
  counter,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 132,
          lineHeight: 1,
          color: accentColor, // SOLID — never background-clip:text in headless Chromium
          letterSpacing: "0.02em",
          textShadow: `0 0 36px ${accentColor}55`,
        }}
      >
        {counter}
      </span>
    </div>
  );
};

/**
 * BottomStepper — persistent progress rail along the bottom (SETUP·CREATE·EVAL·
 * DEPLOY·PUBLISH). The active step's dot is filled + glowing and its label is bright;
 * the rest are muted. The rail fill grows up to the active node.
 */
const BottomStepper: React.FC<{
  steps: string[];
  activeIndex: number;
  accentColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({ steps, activeIndex, accentColor, inkColor, mutedColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const count = steps.length;
  const clampedActive = Math.min(Math.max(activeIndex, 0), Math.max(0, count - 1));
  // Rail spans from the first node center to the last node center.
  const railFillPct = count > 1 ? clampedActive / (count - 1) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 56,
        opacity,
      }}
    >
      {/* Rail row */}
      <div style={{ position: "relative", height: 18 }}>
        {/* Base rail */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "5%",
            right: "5%",
            height: 2,
            background: `${mutedColor}55`,
          }}
        />
        {/* Active fill rail */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "5%",
            width: `${railFillPct * 90}%`,
            height: 2,
            background: accentColor,
            boxShadow: `0 0 10px ${accentColor}99`,
          }}
        />
        {/* Nodes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {steps.map((_, i) => {
            const isActive = i === clampedActive;
            const isDone = i < clampedActive;
            const dot = isActive ? 18 : 12;
            return (
              <div
                key={`node-${i}`}
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: "50%",
                  background:
                    isActive || isDone ? accentColor : `${mutedColor}66`,
                  boxShadow: isActive ? `0 0 16px ${accentColor}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Labels row */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {steps.map((label, i) => {
          const isActive = i === clampedActive;
          return (
            <span
              key={`label-${i}`}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: isActive ? 800 : 600,
                fontSize: 22,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: isActive ? accentColor : mutedColor,
                textShadow: isActive ? `0 0 12px ${accentColor}55` : "none",
                // Keep each label visually anchored to its node.
                flex: "0 0 auto",
                ...(i === 0
                  ? { textAlign: "left" as const }
                  : i === steps.length - 1
                    ? { textAlign: "right" as const }
                    : { textAlign: "center" as const }),
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
      {/* Spacer so labels never overlap the inkColor caption region — purely
          structural; inkColor referenced to keep prop meaningful. */}
      <div style={{ height: 0, color: inkColor }} />
    </div>
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
  mode,
  counter,
  stepperSteps,
  stepperActiveIndex,
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

  // dark-changelog mode flag. When false, EVERY branch below renders identically to the
  // original (additive-only contract). The cosmic backdrop, top sweep, numbered counter,
  // and bottom stepper only mount when this is true.
  const isDarkChangelog = mode === "dark-changelog";
  const resolvedSteps =
    stepperSteps.length > 0 ? stepperSteps : DEFAULT_STEPPER_STEPS;

  return (
    <AbsoluteFill style={{ background: paperColor }}>
      {/* Voiceover */}
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* dark-changelog: deep cosmic gradient + particle field (covers the base paper). */}
      {isDarkChangelog && <CosmicGradientBackdrop accentColor={resolvedAccent} />}

      {/* Subtle paper grain — very faint radial gradient so cream paper isn't sterile.
          Skipped in dark-changelog mode where the multiply blend would muddy the cosmic
          gradient. Default mode renders it exactly as before. */}
      {!isDarkChangelog && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,255,255,0.6) 0%, rgba(0,0,0,0.02) 100%)",
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
      )}

      {/* dark-changelog: thin top progress sweep growing with playback. */}
      {isDarkChangelog && <TopProgressSweep accentColor={resolvedAccent} />}

      {/* Universal house-grammar breadcrumb (Carlos + DIYSmartCode pattern) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* dark-changelog: big numbered counter under the breadcrumb. */}
      {isDarkChangelog && counter !== "" && (
        <ChangelogCounter counter={counter} accentColor={resolvedAccent} />
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

      {/* dark-changelog: persistent bottom progress stepper (SETUP·CREATE·EVAL·DEPLOY·
          PUBLISH) with the active step lit. Pinned to bottom; clears the caption strip. */}
      {isDarkChangelog && (
        <BottomStepper
          steps={resolvedSteps}
          activeIndex={stepperActiveIndex}
          accentColor={resolvedAccent}
          inkColor={inkColor}
          mutedColor={mutedColor}
        />
      )}
    </AbsoluteFill>
  );
};
