/**
 * FauxProductUI9x16 — Bilawal V3 N4 "I built a tool" composition.
 *
 * Six-layer Anduril-Lattice-style HUD parody. Every load-bearing illusion that
 * makes mission-control/defense-tech product screens read as "real software"
 * gets a layer of its own:
 *
 *   1. Masthead bar (top) ............. brand diamond glyph + brand title + classification
 *   2. Left-edge vertical icon rail ... 4 SVG glyphs in a tinted column
 *   3. Selection-bracket frame ........ white corner-only L brackets around a "target"
 *   4. Data callouts .................. 2-3 small mono cards with rolling-digit values
 *   5. Globe minimap PiP .............. lower-right SVG world-map placeholder
 *   6. Waveform mini-card ............. (optional) cyan SVG bars top-center
 *
 * House-grammar (same as the rest of Sprint 1+):
 *   - resolveColors(palette, overrides) for color stack
 *   - subjectTool optional accent shift
 *   - palette-driven grain overlay
 *   - BrandBreadcrumb floats over the top
 *   - ChunkedPhraseCaption at the bottom (busy background → step-function captions)
 *
 * Determinism:
 *   - No Math.random. All pseudo-random positions / amplitudes are seeded via a
 *     local FNV-1a hash (`fnv1a`) so the same `(label, frame)` always paints
 *     identically across renders and re-mounts.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { FauxProductUI9x16Props } from "./schemas";
import { ChunkedPhraseCaption } from "../components/captions/ChunkedPhraseCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { MockOSChrome } from "../components/BrandGlyphs";
import { RollingDigitTicker } from "../components/NumberPrimitives";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  FONT_STACKS,
} from "../brand";

// ─── Constants ──────────────────────────────────────────────────────────────

const FRAME_W = 1080;
const FRAME_H = 1920;

// HUD background — true near-black; #0E0E10 reads as "OLED dark" on phones.
const HUD_BG = "#0E0E10";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** FNV-1a 32-bit hash on a string. Deterministic across runs. */
function fnv1aString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Resolve a relative path through Remotion's staticFile, pass through absolute URLs. */
function resolveSrc(raw: string): string | null {
  if (!raw) return null;
  return /^(https?:)?\/\//.test(raw) || raw.startsWith("data:")
    ? raw
    : staticFile(raw.startsWith("/") ? raw.slice(1) : raw);
}

/** Build a default timestamp string ("MAY 25, 2026 · 12:34:56Z"). Used when none provided. */
function buildAutoTimestamp(frame: number, fps: number): string {
  // Use a fixed wall-clock base to keep snapshot tests deterministic. The
  // exposed value only advances with `frame` so screenshots stay stable.
  const baseEpoch = Date.UTC(2026, 4, 25, 12, 34, 0); // 2026-05-25 12:34:00 UTC
  const ms = baseEpoch + Math.round((frame / fps) * 1000);
  const d = new Date(ms);
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));
  return `${months[d.getUTCMonth()]} ${pad(d.getUTCDate())}, ${d.getUTCFullYear()} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
}

// ─── Selection bracket (4 corner L-brackets) ────────────────────────────────

const SelectionBracket: React.FC<{
  centerXpx: number;
  centerYpx: number;
  width: number;
  height: number;
  label: string;
  color: string;
  enter: number; // 0..1
}> = ({ centerXpx, centerYpx, width, height, label, color, enter }) => {
  const left = centerXpx - width / 2;
  const top = centerYpx - height / 2;

  // Each corner is a 56px L-bracket drawn as a polyline.
  const legLength = 56;
  const stroke = 3;

  const corners = [
    // top-left
    { x: left, y: top, points: `0,${legLength} 0,0 ${legLength},0` },
    // top-right
    {
      x: left + width - legLength,
      y: top,
      points: `0,0 ${legLength},0 ${legLength},${legLength}`,
    },
    // bottom-left
    {
      x: left,
      y: top + height - legLength,
      points: `0,0 0,${legLength} ${legLength},${legLength}`,
    },
    // bottom-right
    {
      x: left + width - legLength,
      y: top + height - legLength,
      points: `0,${legLength} ${legLength},${legLength} ${legLength},0`,
    },
  ];

  // Subtle breathing scale — pulses the bracket between 0.99 and 1.01.
  const breathe = 0.99 + 0.02 * enter;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: FRAME_W,
        height: FRAME_H,
        pointerEvents: "none",
        opacity: enter,
        transform: `scale(${breathe})`,
        transformOrigin: `${centerXpx}px ${centerYpx}px`,
      }}
      aria-hidden
    >
      {/* Label above-left of bracket */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: top - 36,
            left,
            fontFamily: FONT_STACKS.mono,
            fontSize: 18,
            fontWeight: 700,
            color,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textShadow: "0 1px 2px rgba(0,0,0,0.7)",
          }}
        >
          {label}
        </div>
      )}

      {corners.map((corner, i) => (
        <svg
          key={`corner-${i}`}
          style={{
            position: "absolute",
            top: corner.y,
            left: corner.x,
            overflow: "visible",
          }}
          width={legLength}
          height={legLength}
          viewBox={`0 0 ${legLength} ${legLength}`}
        >
          <polyline
            points={corner.points}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      ))}
    </div>
  );
};

// ─── Data callout card (with rolling-digit value) ───────────────────────────

const DataCallout: React.FC<{
  label: string;
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  decimals: number;
  xPx: number;
  yPx: number;
  stepFrames: number;
  jitterAmplitude: number;
  accentColor: string;
  durationSeconds: number;
  seed: number;
  enter: number; // 0..1
}> = ({
  label,
  from,
  to,
  prefix,
  suffix,
  decimals,
  xPx,
  yPx,
  stepFrames,
  jitterAmplitude,
  accentColor,
  durationSeconds,
  seed,
  enter,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: yPx,
        left: xPx,
        padding: "10px 14px",
        border: `1px solid ${accentColor}66`,
        borderRadius: 6,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(2px)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 8}px)`,
        fontFamily: FONT_STACKS.mono,
        minWidth: 120,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: `${accentColor}CC`,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <RollingDigitTicker
        from={from}
        to={to}
        startSeconds={0}
        endSeconds={Math.max(1, durationSeconds)}
        stepFrames={stepFrames}
        jitterAmplitude={jitterAmplitude}
        seed={seed}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        color="#FFFFFF"
        fontSize={28}
        fontWeight={700}
        letterSpacing="0.04em"
      />
    </div>
  );
};

// ─── Globe minimap (SVG world map placeholder) ──────────────────────────────

const GlobeMinimap: React.FC<{ accentColor: string; enter: number }> = ({
  accentColor,
  enter,
}) => {
  const size = 200;
  const right = 32;
  const bottom = 200;

  // Deterministic landmass blobs — a handful of ellipses at FNV-derived positions
  // form a stylized world map without needing a real geojson source.
  const blobs = React.useMemo(() => {
    const arr: Array<{ cx: number; cy: number; rx: number; ry: number }> = [];
    for (let i = 0; i < 7; i++) {
      const h = fnv1aString(`globe-blob-${i}`);
      const cx = 20 + (h % 60);
      const cy = 20 + ((h >> 8) % 60);
      const rx = 6 + ((h >> 16) % 14);
      const ry = 4 + ((h >> 20) % 10);
      arr.push({ cx, cy, rx, ry });
    }
    return arr;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        right,
        width: size,
        height: size,
        border: `1px solid ${accentColor}66`,
        borderRadius: 8,
        background: "rgba(0,0,0,0.6)",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 12}px)`,
        padding: 8,
        boxSizing: "border-box",
      }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          fontFamily: FONT_STACKS.mono,
          fontSize: 12,
          letterSpacing: "0.22em",
          color: accentColor,
          textTransform: "uppercase",
          fontWeight: 700,
          textShadow: "0 1px 2px rgba(0,0,0,0.7)",
        }}
      >
        GLOBAL VIEW
      </div>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{ display: "block" }}
      >
        {/* Sphere outline */}
        <circle
          cx={50}
          cy={50}
          r={42}
          fill="none"
          stroke={accentColor}
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        {/* Latitude / longitude wires */}
        <ellipse
          cx={50}
          cy={50}
          rx={42}
          ry={14}
          fill="none"
          stroke={accentColor}
          strokeOpacity={0.2}
          strokeWidth={0.6}
        />
        <ellipse
          cx={50}
          cy={50}
          rx={14}
          ry={42}
          fill="none"
          stroke={accentColor}
          strokeOpacity={0.2}
          strokeWidth={0.6}
        />
        {/* Stylized landmass blobs */}
        {blobs.map((b, i) => (
          <ellipse
            key={`blob-${i}`}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill={accentColor}
            fillOpacity={0.35}
          />
        ))}
        {/* Crosshair on target */}
        <circle
          cx={62}
          cy={42}
          r={3}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1}
        />
        <line
          x1={56}
          y1={42}
          x2={68}
          y2={42}
          stroke="#FFFFFF"
          strokeWidth={0.5}
        />
        <line
          x1={62}
          y1={36}
          x2={62}
          y2={48}
          stroke="#FFFFFF"
          strokeWidth={0.5}
        />
      </svg>
    </div>
  );
};

// ─── Waveform mini-card (cyan SVG bars) ─────────────────────────────────────

const WaveformCard: React.FC<{ frame: number; fps: number; enter: number }> = ({
  frame,
  fps,
  enter,
}) => {
  const cyan = "#00E5FF";
  const barCount = 14;
  const seconds = frame / fps;

  // Each bar has a deterministic phase from FNV(idx). Heights breathe between
  // 8 and 36 px per bar via a sin wave — no random, fully deterministic.
  const bars = Array.from({ length: barCount }).map((_, i) => {
    const phaseHash = fnv1aString(`waveform-${i}`);
    const phase = (phaseHash % 1000) / 1000;
    const wobble = Math.sin((seconds + phase * 2) * Math.PI * 1.6 + i * 0.4);
    const height = 8 + (wobble * 0.5 + 0.5) * 28;
    return { height };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: "50%",
        transform: `translateX(-50%) translateY(${(1 - enter) * 8}px)`,
        opacity: enter,
        padding: "10px 18px",
        border: `1px solid ${cyan}44`,
        borderRadius: 8,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
      aria-hidden
    >
      <span
        style={{
          fontFamily: FONT_STACKS.mono,
          fontSize: 12,
          color: cyan,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        AUDIO IN
      </span>
      <svg width={barCount * 6} height={40} viewBox={`0 0 ${barCount * 6} 40`}>
        {bars.map((b, i) => (
          <rect
            key={`bar-${i}`}
            x={i * 6}
            y={(40 - b.height) / 2}
            width={3}
            height={b.height}
            fill={cyan}
            rx={1}
          />
        ))}
      </svg>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────

export const FauxProductUI9x16: React.FC<FauxProductUI9x16Props> = ({
  audioUrl,
  wordTimings,
  brandTitle,
  classification,
  timestamp,
  innerBg,
  bracket,
  callouts,
  showCornerBrackets,
  showIconRail,
  showRecIndicator,
  showGlobeMinimap,
  showWaveformCard,
  sectionLabel,
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
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Color stack — palette defaults with optional per-color overrides.
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

  // HUD always paints on near-black regardless of palette; the palette only
  // influences accent + caption + grain tints (the chrome is the parody, not the bg).
  const bgColor = HUD_BG;

  const resolvedAudio = resolveSrc(audioUrl);
  const resolvedInnerBg = innerBg && innerBg.src ? resolveSrc(innerBg.src) : null;

  // Auto-timestamp falls back to a frame-driven UTC clock when none provided.
  const resolvedTimestamp = timestamp || buildAutoTimestamp(frame, fps);

  // House-grammar spring on the chrome (damping 22 / stiffness 130 / mass 0.7).
  const chromeEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const chromeOpacity = interpolate(chromeEnter, [0, 1], [0, 1]);

  // Bracket / callouts enter a touch after the chrome (~0.3s).
  const elementsStart = Math.round(0.3 * fps);
  const elementsEnter = spring({
    frame: frame - elementsStart,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });

  // Total seconds — used by the rolling-digit tickers as their end-of-scrub time.
  const totalSeconds = durationInFrames / fps;

  // HUD accent — cyan reads as "telemetry green" on dark; if the palette accent
  // is the cream/dark default warm-red we shift to a HUD-appropriate cyan-ish
  // tint instead. This keeps the parody visually consistent regardless of palette.
  const hudAccent = "#3DDC84"; // night-vision green, matches MockOSChrome's default

  return (
    <AbsoluteFill style={{ background: bgColor }}>
      {/* Voiceover */}
      {resolvedAudio && <Audio src={resolvedAudio} />}

      {/* INNER B-ROLL / IMAGE / GRADIENT — the "feed" being analyzed */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {innerBg && innerBg.kind === "video" && resolvedInnerBg ? (
          <OffthreadVideo
            src={resolvedInnerBg}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
              opacity: 0.6,
            }}
          />
        ) : innerBg && innerBg.kind === "image" && resolvedInnerBg ? (
          <Img
            src={resolvedInnerBg}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
              opacity: 0.6,
            }}
          />
        ) : (
          // Solid gradient — radial vignette + faint grid lines for "telemetry feel".
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at center, ${hudAccent}11 0%, ${bgColor} 70%)`,
              }}
            />
            {/* Hairline grid — gives the "scanned canvas" texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.18,
                backgroundImage: `linear-gradient(${hudAccent}22 1px, transparent 1px), linear-gradient(90deg, ${hudAccent}22 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </>
        )}
      </AbsoluteFill>

      {/* LAYER 1+2+3 — masthead, corner brackets, REC indicator, left icon rail.
          Provided by <MockOSChrome>. We use its built-in defaults but pass through
          our resolved brand title + classification + timestamp. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: chromeOpacity,
        }}
      >
        <MockOSChrome
          brandTitle={brandTitle}
          classification={classification}
          timestamp={resolvedTimestamp}
          showCornerBrackets={showCornerBrackets}
          showRecIndicator={showRecIndicator}
          showIconRail={showIconRail}
          width={FRAME_W}
          height={FRAME_H}
          accentColor={hudAccent}
        />
      </div>

      {/* Optional eyebrow chip — floats below the masthead. */}
      {sectionLabel && (
        <div
          style={{
            position: "absolute",
            top: 180,
            left: "50%",
            transform: `translateX(-50%) translateY(${(1 - chromeEnter) * 8}px)`,
            padding: "8px 16px",
            border: `1px solid ${hudAccent}66`,
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            fontFamily: FONT_STACKS.mono,
            fontSize: 16,
            color: hudAccent,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 700,
            opacity: chromeOpacity,
          }}
        >
          {sectionLabel}
        </div>
      )}

      {/* LAYER 3 — Selection bracket around the target. White corners with label. */}
      {bracket && (
        <SelectionBracket
          centerXpx={bracket.centerXpx}
          centerYpx={bracket.centerYpx}
          width={bracket.width}
          height={bracket.height}
          label={bracket.label}
          color="#FFFFFF"
          enter={elementsEnter}
        />
      )}

      {/* LAYER 4 — Data callouts with rolling-digit values. */}
      {callouts.map((callout, i) => {
        // Stagger each callout in by ~80ms relative to the bracket.
        const offsetFrames = Math.round(i * 0.08 * fps);
        const localEnter = spring({
          frame: frame - elementsStart - offsetFrames,
          fps,
          config: { damping: 22, stiffness: 130, mass: 0.7 },
        });
        return (
          <DataCallout
            key={`callout-${i}-${callout.label}`}
            label={callout.label}
            from={callout.from}
            to={callout.to}
            prefix={callout.prefix}
            suffix={callout.suffix}
            decimals={callout.decimals}
            xPx={callout.position.xPx}
            yPx={callout.position.yPx}
            stepFrames={callout.stepFrames}
            jitterAmplitude={callout.jitterAmplitude}
            accentColor={hudAccent}
            durationSeconds={totalSeconds}
            seed={fnv1aString(callout.label) % 65535}
            enter={localEnter}
          />
        );
      })}

      {/* LAYER 5 — Globe minimap PiP (optional). */}
      {showGlobeMinimap && (
        <GlobeMinimap accentColor={hudAccent} enter={elementsEnter} />
      )}

      {/* LAYER 6 — Waveform mini-card top-center (optional). */}
      {showWaveformCard && (
        <WaveformCard frame={frame} fps={fps} enter={elementsEnter} />
      )}

      {/* Palette-driven grain overlay — applied over everything for editorial unity. */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* House-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Bilawal-style step-function captions — designed for busy backgrounds. */}
      {showCaptions && (
        <ChunkedPhraseCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 220,
            fontSize: captionFontSize,
            textColor: "#FFFFFF",
            style: "tiktok-stroke",
            strokeWidthPx: 5,
            windowSize: 3,
            maxWidthPx: 920,
            uppercase: true,
            letterSpacing: "0.02em",
          }}
        />
      )}

      {/* Reference colors that are technically unused get a no-op reference so
          TypeScript's noUnusedLocals (if enabled) doesn't complain. They remain
          available for future overlays without re-threading props. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          color: resolvedInk,
          background: resolvedMuted,
          overflow: "hidden",
        }}
      />
    </AbsoluteFill>
  );
};

export type { FauxProductUI9x16Props } from "./schemas";
export { fauxProductUI9x16Schema } from "./schemas";
