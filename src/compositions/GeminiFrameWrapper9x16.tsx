/**
 * GeminiFrameWrapper9x16 — DIYSmart V3 N1 META-TEMPLATE.
 *
 * Wraps the entire 9:16 frame in a rounded "glass canvas" with:
 *   - Deep-space navy gradient (`#0A1A2E` → `#0E2238`) with multi-color glow blooms.
 *   - Animated particle bokeh tinted in Google-brand colors (default: blue/red/yellow/green).
 *     Positions seeded via FNV-1a — DETERMINISTIC across renders (no Math.random).
 *   - Top-center Google wordmark, top-right @handle (via HUDChrome HandleTag).
 *   - HUDChrome supplies the persistent overlays: inset border + top scrub bar
 *     + chapter stepper (bottom 5-dot pacing rail) + handle.
 *
 * "Slot" pattern: each `scene` is rendered into the framed canvas as a `<Sequence>`
 * with its own chapter eyebrow + headline + body. Pass an empty `scenes` array
 * to render the wrapper alone (e.g. for cold-open / outro stings).
 *
 * Wave-4 critique tie-in: DIYSmart V3 missed an "entire-frame glass-frame wrap"
 * template (N1 GeminiFrame). This is that wrapper, generalized to host ANY of
 * our existing 9x16 templates inside its slot zone in future revisions.
 */
import React, { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { HUDChrome } from "../components/HUDChrome";
import type { ChapterStep } from "../components/HUDChrome";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Local schema fragments ───────────────────────────────────────────────────
const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});

const geminiSceneSchema = z.object({
  /** Eyebrow chapter label (e.g. "HOOK", "WHAT", "UPGRADES"). Tracked mono. */
  chapter: z.string(),
  /** Hero headline (Inter Black). */
  headline: z.string(),
  /** 1–3 lines of body copy under the headline. */
  body: z.string().default(""),
  /** Optional bullet list rendered under the body. */
  bullets: z.array(z.string()).default([]),
  /** Duration of this scene in seconds. */
  durationSeconds: z.number().min(0.5).max(60).default(3.0),
});
export type GeminiScene = z.infer<typeof geminiSceneSchema>;

export const geminiFrameWrapper9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Inner content rendered inside the framed canvas. Empty => wrapper alone. */
  scenes: z.array(geminiSceneSchema).default([]),
  /** Handle / @-tag rendered in the top corner. */
  handle: z.string().default("@armandointeligencia"),
  /** Top-center brand wordmark (default "Google"). */
  brandLogoText: z.string().default("Google"),
  /** Particle bokeh tint colors. */
  particleColors: z
    .array(z.string())
    .default(["#4285F4", "#EA4335", "#FBBC05", "#34A853"]),
  /** Particle count (default 80). */
  particleCount: z.number().int().min(0).max(400).default(80),
  showTopProgressBar: z.boolean().default(true),
  showChapterStepper: z.boolean().default(true),
  showInsetBorder: z.boolean().default(true),
  showHandle: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z
    .enum(["cream", "dark", "warm-black", "true-black", "paper"])
    .default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  brandId: z.string().optional(),
});
export type GeminiFrameWrapper9x16Props = z.infer<
  typeof geminiFrameWrapper9x16Schema
>;

// ─── Layout constants ─────────────────────────────────────────────────────────
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const FRAME_INSET = 48; // px between physical edge and the rounded glass canvas
const GLASS_RADIUS = 56;

// ─── FNV-1a deterministic noise (no Math.random) ──────────────────────────────
function fnv1a(input: number): number {
  let h = 0x811c9dc5;
  let n = Math.floor(input) | 0;
  for (let i = 0; i < 8; i += 1) {
    h ^= n & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
    n = n >>> 8;
  }
  return h;
}

/** Map an FNV hash into [0, 1). */
function hashToUnit(input: number): number {
  return (fnv1a(input) >>> 0) / 0xffffffff;
}

// ─── Particle bokeh field ─────────────────────────────────────────────────────
interface Particle {
  baseX: number; // 0..1
  baseY: number; // 0..1
  radius: number; // px
  color: string;
  parallax: number; // 0..1 — drift amplitude
  phaseSeconds: number; // sinusoid phase
  baseOpacity: number;
}

const ParticleField: React.FC<{
  count: number;
  colors: string[];
  width: number;
  height: number;
}> = ({ count, colors, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  const particles = useMemo<Particle[]>(() => {
    if (count <= 0 || colors.length === 0) return [];
    const out: Particle[] = [];
    for (let i = 0; i < count; i += 1) {
      const colorIdx = fnv1a(i * 0x85ebca6b + 17) % colors.length;
      out.push({
        baseX: hashToUnit(i * 2654435761 + 1),
        baseY: hashToUnit(i * 2654435761 + 2),
        radius: 4 + hashToUnit(i * 2654435761 + 3) * 14,
        color: colors[colorIdx],
        parallax: 0.004 + hashToUnit(i * 2654435761 + 4) * 0.016,
        phaseSeconds: hashToUnit(i * 2654435761 + 5) * 6.28,
        baseOpacity: 0.18 + hashToUnit(i * 2654435761 + 6) * 0.4,
      });
    }
    return out;
  }, [count, colors]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {particles.map((p, idx) => {
        // Slow elliptical drift driven by frame seconds + per-particle phase.
        const driftX = Math.sin(seconds * 0.4 + p.phaseSeconds) * p.parallax;
        const driftY = Math.cos(seconds * 0.3 + p.phaseSeconds) * p.parallax;
        const cx = (p.baseX + driftX) * width;
        const cy = (p.baseY + driftY) * height;
        // Twinkle: gentle opacity oscillation, never fully off.
        const twinkle =
          0.6 + 0.4 * Math.sin(seconds * 1.1 + p.phaseSeconds * 1.7);
        const opacity = p.baseOpacity * twinkle;
        return (
          <circle
            key={`p-${idx}`}
            cx={cx}
            cy={cy}
            r={p.radius}
            fill={p.color}
            opacity={opacity}
            style={{ filter: "blur(2px)" }}
          />
        );
      })}
    </svg>
  );
};

// ─── Scene slot — chapter eyebrow + headline + body ───────────────────────────
const SceneSlot: React.FC<{
  scene: GeminiScene;
  accentColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({ scene, accentColor, inkColor, mutedColor }) => {
  // Inside a <Sequence>, useCurrentFrame() is local to the sequence's `from`.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        right: 96,
        top: 380,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 28,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Eyebrow chapter label */}
      <div
        style={{
          fontFamily: FONT_STACKS.mono,
          fontSize: 28,
          fontWeight: 600,
          color: accentColor,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
        }}
      >
        {scene.chapter}
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: 96,
          color: "#FFFFFF",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
        }}
      >
        {scene.headline}
      </div>

      {/* Body */}
      {scene.body ? (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 300,
            fontSize: 40,
            color: inkColor,
            lineHeight: 1.35,
            opacity: 0.92,
            maxWidth: 820,
          }}
        >
          {scene.body}
        </div>
      ) : null}

      {/* Bullets */}
      {scene.bullets.length > 0 ? (
        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {scene.bullets.map((b, i) => (
            <li
              key={`b-${i}`}
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 400,
                fontSize: 34,
                color: mutedColor,
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                lineHeight: 1.3,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: accentColor,
                  flex: "0 0 auto",
                  transform: "translateY(-4px)",
                }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

// ─── Composition ──────────────────────────────────────────────────────────────
export const GeminiFrameWrapper9x16: React.FC<GeminiFrameWrapper9x16Props> = ({
  audioUrl,
  wordTimings,
  scenes,
  handle,
  brandLogoText,
  particleColors,
  particleCount,
  showTopProgressBar,
  showChapterStepper,
  showInsetBorder,
  showHandle,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Build sequence layout: each scene gets a `from` (in frames) and a duration.
  const sceneLayout = useMemo(() => {
    let cursor = 0;
    return scenes.map((s) => {
      const fromFrame = Math.round(cursor * fps);
      const durationFrames = Math.max(1, Math.round(s.durationSeconds * fps));
      cursor += s.durationSeconds;
      return { scene: s, fromFrame, durationFrames };
    });
  }, [scenes, fps]);

  const totalSceneSeconds = useMemo(
    () => scenes.reduce((acc, s) => acc + s.durationSeconds, 0),
    [scenes],
  );

  // ChapterStepper steps — drive from scene chapter labels + cumulative starts.
  const chapterSteps = useMemo<ChapterStep[]>(() => {
    let cursor = 0;
    return scenes.map((s) => {
      const step: ChapterStep = { label: s.chapter, startSeconds: cursor };
      cursor += s.durationSeconds;
      return step;
    });
  }, [scenes]);

  // Total seconds for the persistent HUD scrub bar — fall back to composition
  // duration when there are no scenes.
  const hudTotalSeconds =
    totalSceneSeconds > 0 ? totalSceneSeconds : durationInFrames / fps;

  return (
    <AbsoluteFill style={{ background: "#06101F" }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Deep-space gradient layer */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #0A1A2E 0%, #0C1E33 50%, #0E2238 100%)",
        }}
      />

      {/* Multi-color glow blooms (soft positioned radial gradients) */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(66,133,244,0.28) 0%, rgba(66,133,244,0) 65%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            right: -180,
            width: 880,
            height: 880,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(234,67,53,0.20) 0%, rgba(234,67,53,0) 65%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 600,
            right: -260,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(251,188,5,0.16) 0%, rgba(251,188,5,0) 65%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: -200,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,168,83,0.18) 0%, rgba(52,168,83,0) 65%)",
            filter: "blur(20px)",
          }}
        />
      </AbsoluteFill>

      {/* Animated particle bokeh — deterministic via FNV-1a positions */}
      <ParticleField
        count={particleCount}
        colors={particleColors}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
      />

      {/* Rounded glass-canvas frame: subtle inner border + soft outer shadow */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: FRAME_INSET,
            left: FRAME_INSET,
            right: FRAME_INSET,
            bottom: FRAME_INSET,
            borderRadius: GLASS_RADIUS,
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "inset 0 0 80px rgba(66,133,244,0.06), 0 0 0 1px rgba(255,255,255,0.04)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.0) 100%)",
          }}
        />
      </AbsoluteFill>

      {/* Palette grain overlay (use multiply on light, screen on dark) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode:
            palette === "cream" || palette === "paper" ? "multiply" : "screen",
          pointerEvents: "none",
        }}
      />

      {/* Top-center brand wordmark (e.g. "Google") */}
      {brandLogoText ? (
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 500,
              fontSize: 30,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.04em",
            }}
          >
            {brandLogoText}
          </div>
        </div>
      ) : null}

      {/* House-grammar breadcrumb (optional, sits below the wordmark) */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
          topPx={160}
        />
      )}

      {/* Scene slot — sequenced inner content */}
      {sceneLayout.map((entry, idx) => (
        <Sequence
          key={`scene-${idx}`}
          from={entry.fromFrame}
          durationInFrames={entry.durationFrames}
          layout="none"
        >
          <SceneSlot
            scene={entry.scene}
            accentColor={resolvedAccent}
            inkColor={resolvedInk}
            mutedColor={resolvedMuted}
          />
        </Sequence>
      ))}

      {/* Persistent HUD chrome (top scrub bar + chapter stepper + handle + inset border) */}
      <HUDChrome
        totalSeconds={hudTotalSeconds}
        steps={
          showChapterStepper && chapterSteps.length > 0
            ? chapterSteps
            : undefined
        }
        handle={handle}
        accentColor={resolvedAccent}
        paletteMode="dark"
        showInsetBorder={showInsetBorder}
        showTopScrubBar={showTopProgressBar}
        showHandle={showHandle}
        showChapterStepper={showChapterStepper && chapterSteps.length > 0}
      />

      {/* Word-by-word captions */}
      <EditorialCaption
        wordTimings={wordTimings}
        style={{
          position: "bottom",
          distancePx: 280,
          fontSize: captionFontSize,
          accentColor: resolvedAccent,
          mutedBorderColor: `${resolvedMuted}33`,
          maxWidthPx: 880,
          paperColor: "rgba(10,26,46,0.65)",
          inkColor: "#FFFFFF",
        }}
      />
    </AbsoluteFill>
  );
};
