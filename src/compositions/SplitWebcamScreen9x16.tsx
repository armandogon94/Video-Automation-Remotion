/**
 * SplitWebcamScreen9x16 — vertical (1080×1920) split-screen reaction/demo composition.
 *
 * Inspired by @midu.dev's "WebcamScreenshareCallout" template (analyzed at
 * references/creators/midu.dev/ANALYSIS.md — Template A). Top half is webcam,
 * bottom half is screen recording, and keyword-anchored callout overlays float
 * across the seam.
 *
 * Same house grammar as the rest of Sprint 1:
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccent()
 *   - optional BrandBreadcrumb at top
 *   - palette-driven paper-grain overlay (multiply on cream, screen on dark)
 *   - optional bottom EditorialCaption strip (overlaps the bottom screen recording)
 *
 * Layout (top → bottom):
 *   - Optional BrandBreadcrumb (~80px from top, floats over webcam half)
 *   - TOP HALF (y = 0..960px): webcam <Img> with cover fit (or fallback color block)
 *   - DIVIDER SEAM (y = 940..980, 40px tall): horizontal accent band, the visual seam
 *   - BOTTOM HALF (y = 960..1920): screen recording <Img> with cover fit (or fallback)
 *   - Callout overlays: massive Inter 800 single-words/short-phrases (font-size 130,
 *     color = accent, drop shadow). Anchored near the seam zone, one of three x-anchors.
 *     Each callout's startSeconds is REPLACED with the spoken-keyword start time when
 *     `keyword` is set AND found in `wordTimings` (preserving the original duration).
 *   - EditorialCaption strip at the bottom (overlaps the bottom screen recording).
 *
 * Motion grammar for callouts:
 *   - Enter spring-in: scale 0.75 → 1.0 over ~0.4s, opacity 0 → 1 over ~0.2s.
 *   - Hold with a soft drop shadow.
 *   - Exit fade-out over the last 0.3s of the callout window.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type {
  WordTiming,
  SplitCallout,
  SplitWebcamScreen9x16Props,
} from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { getToolAccentForSurface, resolveColors, getPalette } from "../brand";
import { findKeyword, type AlignedWord } from "../timing/align";

// Layout constants — vertical seam at the 50% mark (y = 960), with a 40px accent band
// straddling it (940..980).
const HALF_HEIGHT = 960;
const SEAM_TOP = 940;
const SEAM_HEIGHT = 40;

// Callout zone — anchored to the seam, with three horizontal positions.
const CALLOUT_Y = 900;
const CALLOUT_FONT_SIZE = 130;

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Resolve the effective startSeconds for a callout.
 *
 * If `keyword` is set AND found in `wordTimings`, returns the spoken-keyword start time.
 * Otherwise returns `fallbackStartSeconds`. Used to anchor callouts to the actual audio.
 */
function resolveCalloutStart(callout: SplitCallout, wordTimings: WordTiming[]): number {
  if (!callout.keyword) return callout.fallbackStartSeconds;
  // wordTimings shape (from schemas.ts) is structurally compatible with AlignedWord
  // for findKeyword's purposes — it only reads text/startSeconds/endSeconds/startFrame/endFrame.
  const aligned = wordTimings as unknown as AlignedWord[];
  const hit = findKeyword(callout.keyword, aligned);
  return hit ? hit.startSeconds : callout.fallbackStartSeconds;
}

/**
 * Resolve an image source string. Empty = no source (caller renders a fallback block).
 * Absolute URLs pass through; everything else is wrapped in staticFile().
 */
function resolveImageSrc(raw: string): string | null {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : staticFile(raw);
}

// ─── Empty-state placeholder panel ──────────────────────────────────
/**
 * Rich labeled placeholder rendered ONLY when a half has no media source.
 *
 * Communicates the intended split layout even without footage: each panel
 * is clearly labeled with its role ("SCREEN / B-ROLL" on top, "FACE-CAM" on
 * bottom), framed with a hairline border + rounded corners, a tasteful
 * diagonal-hatch ghost field for texture, a brand glyph, and a small muted
 * "PLACEHOLDER" caption so the frame reads as a finished layout in the
 * cross-creator gallery rather than an empty media well.
 *
 * Colors are passed in pre-resolved (palette defaults + overrides) so this
 * stays consistent with the rest of the composition. No background-clip:text
 * is used — all text is painted with solid colors (Remotion headless Chromium
 * renders background-clip:text as an opaque rectangle).
 */
const PlaceholderPanel: React.FC<{
  role: "screen" | "facecam";
  paper: string;
  ink: string;
  accent: string;
  muted: string;
}> = ({ role, paper, ink, accent, muted }) => {
  const isScreen = role === "screen";
  const roleLabel = isScreen ? "SCREEN / B-ROLL" : "FACE-CAM";
  const roleHint = isScreen
    ? "Demo capture or supporting footage drops here"
    : "Creator webcam drops here";

  // Ghost field: subtle diagonal hatch in ink, so the empty panel reads as a
  // deliberately-styled placeholder surface rather than a flat color block.
  const hatch = `repeating-linear-gradient(45deg, ${ink}0A 0px, ${ink}0A 2px, transparent 2px, transparent 16px)`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Top panel sits a hair darker (ink wash) than the paper-toned bottom panel
        // so the seam-split is legible even when both halves are empty.
        background: isScreen ? `${ink}14` : paper,
        backgroundImage: hatch,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Hairline inner border + rounded corners, inset so the seam band stays clean.
        boxSizing: "border-box",
        padding: 28,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          border: `2px solid ${ink}26`,
          borderRadius: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          textAlign: "center",
          padding: 40,
        }}
      >
        {/* Brand glyph — solid accent disc with the role initial (no gradients/clip). */}
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 24,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 24px ${ink}24`,
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 56,
              lineHeight: 1,
              color: paper,
            }}
          >
            {isScreen ? "▦" : "◉"}
          </span>
        </div>

        {/* Role label — large, solid ink, the headline of the panel. */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: ink,
          }}
        >
          {roleLabel}
        </div>

        {/* One-line muted hint describing what belongs here. */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.25,
            color: muted,
            maxWidth: 720,
          }}
        >
          {roleHint}
        </div>

        {/* Muted "PLACEHOLDER" caption pill — small, low-key, accent-bordered. */}
        <div
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            border: `2px solid ${accent}`,
            background: `${accent}1A`,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.14em",
            color: accent,
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: accent,
              display: "inline-block",
            }}
          />
          PLACEHOLDER
        </div>
      </div>
    </div>
  );
};

// ─── Single callout overlay ─────────────────────────────────────────
const CalloutOverlay: React.FC<{
  callout: SplitCallout;
  durationFrames: number;
  accentColor: string;
}> = ({ callout, durationFrames, accentColor }) => {
  // Inside <Sequence>, useCurrentFrame() is local — 0 at callout entry.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-in: scale 0.75 → 1.0 over ~0.4s
  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.6 },
  });
  const scale = interpolate(enter, [0, 1], [0.75, 1.0]);

  // Opacity in over ~0.2s (6f @ 30fps)
  const opacityIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade out over the last 0.3s (9f @ 30fps) of the callout window
  const fadeOutFrames = Math.round(0.3 * fps);
  const opacityOut = interpolate(
    frame,
    [Math.max(0, durationFrames - fadeOutFrames), durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(opacityIn, opacityOut);

  // Horizontal anchor — left / center / right at the seam zone.
  const positionStyle: React.CSSProperties = (() => {
    if (callout.position === "seam-left") {
      return { left: 80, textAlign: "left" as const, transformOrigin: "left center" };
    }
    if (callout.position === "seam-right") {
      return { right: 80, textAlign: "right" as const, transformOrigin: "right center" };
    }
    return {
      left: 0,
      right: 0,
      textAlign: "center" as const,
      transformOrigin: "center center",
    };
  })();

  return (
    <div
      style={{
        position: "absolute",
        top: CALLOUT_Y,
        ...positionStyle,
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: CALLOUT_FONT_SIZE,
        lineHeight: 1.0,
        color: accentColor,
        letterSpacing: "-0.03em",
        opacity,
        transform: `scale(${scale})`,
        textShadow:
          "0 4px 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.6)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {callout.text}
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const SplitWebcamScreen9x16: React.FC<SplitWebcamScreen9x16Props> = ({
  audioUrl,
  wordTimings,
  webcamImageUrl,
  screenImageUrl,
  callouts,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default" (Zod schemas default to "").
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  // Subject-tool-tinted accent override (overrides palette accent if subjectTool set).
  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  const webcamSrc = resolveImageSrc(webcamImageUrl);
  const screenSrc = resolveImageSrc(screenImageUrl);

  // Empty-state base color per half — when a source IS provided the <Img> covers
  // this; when absent the rich PlaceholderPanel paints over it. Kept paper/ink-toned
  // so the seam-split stays legible behind the placeholder.
  const webcamFallbackBg = `${resolvedInk}22`; // ink at ~13% alpha
  const screenFallbackBg = resolvedPaper;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* TOP HALF — webcam image (or rich labeled FACE-CAM placeholder) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: HALF_HEIGHT,
          overflow: "hidden",
          background: webcamFallbackBg,
        }}
      >
        {webcamSrc ? (
          <Img
            src={webcamSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        ) : (
          <PlaceholderPanel
            role="facecam"
            paper={resolvedPaper}
            ink={resolvedInk}
            accent={resolvedAccent}
            muted={resolvedMuted}
          />
        )}
      </div>

      {/* BOTTOM HALF — screen recording image (or rich labeled SCREEN / B-ROLL placeholder) */}
      <div
        style={{
          position: "absolute",
          top: HALF_HEIGHT,
          left: 0,
          width: 1080,
          height: 1920 - HALF_HEIGHT,
          overflow: "hidden",
          background: screenFallbackBg,
        }}
      >
        {screenSrc ? (
          <Img
            src={screenSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        ) : (
          <PlaceholderPanel
            role="screen"
            paper={resolvedPaper}
            ink={resolvedInk}
            accent={resolvedAccent}
            muted={resolvedMuted}
          />
        )}
      </div>

      {/* DIVIDER SEAM — solid accent band straddling the 50% line (y 940..980) */}
      <div
        style={{
          position: "absolute",
          top: SEAM_TOP,
          left: 0,
          width: 1080,
          height: SEAM_HEIGHT,
          background: resolvedAccent,
          boxShadow:
            "0 4px 14px rgba(0,0,0,0.30), 0 -4px 14px rgba(0,0,0,0.30)",
        }}
      />

      {/* Palette-driven grain overlay — applied above the images so the whole frame reads
          as one editorial composition (matches Sprint 1 conventions). */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb (floats over the webcam half) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Callout overlays — each in its own <Sequence>, anchored at the resolved start time
          (keyword anchor if found, otherwise the fallback). Duration is always preserved. */}
      {callouts.map((callout, i) => {
        const effectiveStart = resolveCalloutStart(callout, wordTimings);
        const originalDuration = Math.max(
          0.1,
          callout.endSeconds - callout.fallbackStartSeconds,
        );
        const fromFrame = Math.round(effectiveStart * fps);
        const durationFrames = Math.max(1, Math.round(originalDuration * fps));
        return (
          <Sequence
            key={`callout-${i}`}
            from={fromFrame}
            durationInFrames={durationFrames}
            layout="none"
          >
            <CalloutOverlay
              callout={callout}
              durationFrames={durationFrames}
              accentColor={resolvedAccent}
            />
          </Sequence>
        );
      })}

      {/* Word-by-word captions (bottom strip — overlaps the bottom screen recording) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 80,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
