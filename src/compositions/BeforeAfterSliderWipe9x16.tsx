/**
 * BeforeAfterSliderWipe9x16 — estebandiba "before/after media slider"
 * (1080×1920, vertical).
 *
 * Source frame:
 *   references/creators/estebandiba/_backcat/DYhW4eGglHv/frame-04.jpg
 *   ("NITIDEZ IMPOSIBLE" — a Yosemite valley render split by a vertical
 *   divider into a left half and a right half, the headline two-tone bold
 *   uppercase above, and a keyword-highlighted caption below.)
 *
 * Pattern replicated:
 *   - Near-black background (estebandiba's palette discipline = dark canvas +
 *     ONE saturated accent + a soft glow ring on the media frame).
 *   - A two-tone BOLD uppercase headline above the frame: the first words in
 *     white, the matched `accentWord` recolored to the accent (SOLID color,
 *     never background-clip:text — Remotion headless renders that as an opaque
 *     box; see project GOTCHAS).
 *   - A rounded MEDIA FRAME with a glowing accent border. Real media is
 *     composited at use time, so each half is rendered as a distinct
 *     PLACEHOLDER panel:
 *       · left  = muted / desaturated ("BEFORE")
 *       · right = accent-tinted ("AFTER")
 *     A draggable-look vertical DIVIDER with a round handle wipes across the
 *     frame (drives the reveal of how much of the AFTER panel is shown).
 *   - Small corner labels — "ANTES" (left, bottom) / "DESPUÉS" (right, top) —
 *     matching the before/after badge convention.
 *   - A keyword-highlighted caption below the frame (two highlighted tokens:
 *     one accent-tinted, one warm/red), revealed after the slider settles.
 *
 * Motion choreography (≈150 frames @ 30fps ≈ 5s):
 *   1. f0–14   headline two-tone words pop up word-by-word (spring + rise).
 *   2. f10–28  media frame springs in (scale 0.92→1 + glow ring fade).
 *   3. f24–96  divider wipes from `dividerStartPct` → `dividerEndPct`
 *              (ease-in-out), revealing the AFTER side; the handle rides it
 *              with a subtle settle bounce at the end.
 *   4. f70+    corner labels fade in; caption rises with keyword highlights.
 *
 * Schema is declared LOCALLY and exported (project convention — does NOT touch
 * src/compositions/schemas.ts). Every field has a `.default()` with real demo
 * values so the comp renders meaningful content with `{}` props.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../brand";

// ─── Canvas constants (1080×1920) ──────────────────────────────────────────
const CANVAS_W = 1080;
const CANVAS_H = 1920;

// Media frame geometry. Vertically centered-ish, leaving room for the headline
// above and the caption below (estebandiba's frame sits in the middle third).
const FRAME_W = 900;
const FRAME_H = 920;
const FRAME_X = (CANVAS_W - FRAME_W) / 2; // 90
const FRAME_Y = 470;
const FRAME_RADIUS = 36;

// Divider handle radius (the round "grab dot" mid-frame).
const HANDLE_R = 34;

// ─── Public schema + types ─────────────────────────────────────────────────
export const beforeAfterSliderWipe9x16Schema = z.object({
  /** Two-tone bold uppercase headline above the frame. Rendered ALL-CAPS. */
  headline: z.string().default("Nitidez Imposible"),

  /**
   * Single word inside `headline` to recolor with `accentColor`
   * (case-insensitive, first match). "" = no accent word. SOLID color only.
   */
  accentWord: z.string().default("Imposible"),

  /** Caption below the frame. Up to two `[bracketed]` runs are highlighted. */
  caption: z
    .string()
    .default(
      "Astra 2 [reconstruye] el detalle. Transforma animación en [ALTA GAMA].",
    ),

  /** Lower-left badge on the BEFORE (left) panel. */
  beforeLabel: z.string().default("ANTES"),
  /** Upper-right badge on the AFTER (right) panel. */
  afterLabel: z.string().default("DESPUÉS"),

  /** Big word stamped on the left placeholder panel. */
  leftMediaLabel: z.string().default("BEFORE"),
  /** Big word stamped on the right placeholder panel. */
  rightMediaLabel: z.string().default("AFTER"),

  /**
   * Divider sweep, as a percentage of frame width (0 = far left, 100 = far
   * right). The divider animates from `dividerStartPct` → `dividerEndPct`.
   * `dividerPct` is the resting/target value (kept for prop-override clarity).
   */
  dividerPct: z.number().default(50),
  dividerStartPct: z.number().default(24),
  dividerEndPct: z.number().default(62),

  /** Saturated accent (estebandiba electric blue). */
  accentColor: z.string().default("#1E6FFF"),
  /** Secondary highlight for the SECOND bracketed caption run (warm/red). */
  highlightColor: z.string().default("#E23B3B"),

  /** Near-black full-frame background. */
  backgroundColor: z.string().default("#050608"),
  /** Headline / primary text color. */
  textColor: z.string().default("#FFFFFF"),
});
export type BeforeAfterSliderWipe9x16Props = z.infer<
  typeof beforeAfterSliderWipe9x16Schema
>;

// ─── Helpers ────────────────────────────────────────────────────────────────

type HeadlineToken = { text: string; accent: boolean };

/** Flag the first word matching `accentWord` (case/punct-insensitive). */
function buildHeadlineTokens(
  headline: string,
  accentWord: string,
): HeadlineToken[] {
  const words = headline.split(/\s+/).filter((w) => w.length > 0);
  const target = accentWord.trim().toLowerCase();
  if (target.length === 0) {
    return words.map((text) => ({ text, accent: false }));
  }
  let matched = false;
  return words.map((text) => {
    const normalized = text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
    if (!matched && normalized === target) {
      matched = true;
      return { text, accent: true };
    }
    return { text, accent: false };
  });
}

type CaptionRun = { text: string; highlightIndex: number };

/**
 * Split caption into plain + `[bracketed]` runs. The Nth bracketed run gets
 * highlightIndex N (0-based, only first two are styled distinctly; further
 * ones reuse the accent). Plain runs have highlightIndex = -1.
 */
function parseCaption(caption: string): CaptionRun[] {
  const runs: CaptionRun[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let bracketCount = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(caption)) !== null) {
    if (m.index > lastIndex) {
      runs.push({ text: caption.slice(lastIndex, m.index), highlightIndex: -1 });
    }
    runs.push({ text: m[1], highlightIndex: bracketCount });
    bracketCount += 1;
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < caption.length) {
    runs.push({ text: caption.slice(lastIndex), highlightIndex: -1 });
  }
  return runs;
}

// ─── Corner badge ─────────────────────────────────────────────────────────
const CornerBadge: React.FC<{
  label: string;
  accentColor: string;
  textColor: string;
  opacity: number;
  position: "top-right" | "bottom-left";
}> = ({ label, accentColor, textColor, opacity, position }) => {
  const isTopRight = position === "top-right";
  return (
    <div
      style={{
        position: "absolute",
        ...(isTopRight
          ? { top: 26, right: 26 }
          : { bottom: 26, left: 26 }),
        opacity,
        padding: "10px 20px",
        borderRadius: 10,
        backgroundColor: isTopRight ? accentColor : "rgba(8,10,14,0.78)",
        border: isTopRight
          ? "none"
          : "1.5px solid rgba(255,255,255,0.55)",
        fontFamily: FONT_STACKS.display,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "0.10em",
        color: isTopRight ? "#FFFFFF" : textColor,
        boxShadow: isTopRight
          ? `0 6px 22px ${accentColor}66`
          : "0 6px 22px rgba(0,0,0,0.4)",
      }}
    >
      {label.toUpperCase()}
    </div>
  );
};

// ─── Placeholder media panel ───────────────────────────────────────────────
const PlaceholderPanel: React.FC<{
  variant: "before" | "after";
  label: string;
  accentColor: string;
}> = ({ variant, label, accentColor }) => {
  const isAfter = variant === "after";

  // Subtle diagonal-stripe texture so the placeholder reads as "media slot"
  // rather than a flat fill. Muted gray for BEFORE; accent-tinted for AFTER.
  const base = isAfter ? "#0E2A52" : "#23262B";
  const stripe = isAfter
    ? "rgba(30,111,255,0.18)"
    : "rgba(255,255,255,0.05)";
  const glassTop = isAfter
    ? `${accentColor}33`
    : "rgba(255,255,255,0.06)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: base,
        backgroundImage: `repeating-linear-gradient(135deg, ${stripe} 0px, ${stripe} 2px, transparent 2px, transparent 26px), linear-gradient(180deg, ${glassTop} 0%, transparent 55%)`,
        // BEFORE reads as desaturated; AFTER stays crisp/saturated.
        filter: isAfter
          ? "saturate(1.15) contrast(1.05)"
          : "grayscale(0.85) brightness(0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: FONT_STACKS.display,
          fontWeight: 900,
          fontSize: 116,
          letterSpacing: "0.04em",
          color: isAfter ? "#FFFFFF" : "rgba(255,255,255,0.42)",
          textShadow: isAfter
            ? `0 0 40px ${accentColor}cc, 0 8px 28px rgba(0,0,0,0.5)`
            : "0 6px 22px rgba(0,0,0,0.5)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────
export const BeforeAfterSliderWipe9x16: React.FC<
  BeforeAfterSliderWipe9x16Props
> = ({
  headline,
  accentWord,
  caption,
  beforeLabel,
  afterLabel,
  leftMediaLabel,
  rightMediaLabel,
  dividerPct,
  dividerStartPct,
  dividerEndPct,
  accentColor,
  highlightColor,
  backgroundColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineTokens = buildHeadlineTokens(headline, accentWord);
  const captionRuns = parseCaption(caption);

  // ── 1. Headline word-by-word pop (spring scale + rise) ──
  const HEAD_STAGGER = 5;

  // ── 2. Media frame spring-in (scale + glow ring) ──
  const frameEnter = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.9 },
    durationInFrames: 18,
  });
  const frameScale = interpolate(frameEnter, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameOpacity = interpolate(frameEnter, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Glow ring pulses subtly after settling (estebandiba's accent halo).
  const glowPulse =
    0.5 + 0.5 * Math.sin((Math.max(0, frame - 28) / fps) * Math.PI * 1.1);
  const glowAlpha = interpolate(glowPulse, [0, 1], [0.35, 0.7]);

  // ── 3. Divider wipe (ease-in-out) with end settle ──
  const wipeStart = 24;
  const wipeEnd = 96;
  const wipeProgress = interpolate(frame, [wipeStart, wipeEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // Settle bounce after the wipe lands (handle "drops into place").
  const settle = spring({
    frame: frame - wipeEnd,
    fps,
    config: { damping: 9, stiffness: 140, mass: 0.6 },
    durationInFrames: 22,
  });
  const settleWobble = interpolate(settle, [0, 1], [0, 1]);
  const livePct =
    interpolate(wipeProgress, [0, 1], [dividerStartPct, dividerEndPct]) +
    // tiny overshoot wobble that decays into the resting target
    Math.sin((1 - settleWobble) * Math.PI * 2) * (1 - settleWobble) * 1.6;
  const clampedPct = Math.max(2, Math.min(98, livePct));
  const dividerX = (clampedPct / 100) * FRAME_W;

  // The AFTER panel is revealed to the RIGHT of the divider; clip its left edge
  // to the divider line so the wipe reveals it. (We keep `dividerPct` referenced
  // so an override of the resting value reads through the start/end interpolation
  // — the demo defaults make start<resting<end so the sweep crosses center.)
  void dividerPct;

  // ── 4. Corner labels + caption reveal ──
  const labelOpacity = interpolate(frame, [70, 86], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionEnter = spring({
    frame: frame - 78,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.9 },
    durationInFrames: 20,
  });
  const captionOpacity = interpolate(captionEnter, [0, 1], [0, 1]);
  const captionRise = interpolate(captionEnter, [0, 1], [28, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Ambient accent glow bloom behind the frame (dark-canvas discipline). */}
      <div
        style={{
          position: "absolute",
          left: FRAME_X - 80,
          top: FRAME_Y - 60,
          width: FRAME_W + 160,
          height: FRAME_H + 120,
          background: `radial-gradient(closest-side, ${accentColor}26, transparent 72%)`,
          opacity: frameOpacity,
          filter: "blur(20px)",
        }}
      />

      {/* ── Headline (two-tone, word-by-word pop) ── */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          width: CANVAS_W,
          padding: "0 60px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          gap: "0 22px",
        }}
      >
        {headlineTokens.map((token, i) => {
          const tEnter = spring({
            frame: frame - i * HEAD_STAGGER,
            fps,
            config: { damping: 15, stiffness: 200, mass: 0.7 },
            durationInFrames: 14,
          });
          const wScale = interpolate(tEnter, [0, 1], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wRise = interpolate(tEnter, [0, 1], [34, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wOpacity = interpolate(tEnter, [0, 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={`${token.text}-${i}`}
              style={{
                display: "inline-block",
                transform: `translateY(${wRise}px) scale(${wScale})`,
                opacity: wOpacity,
                fontFamily: FONT_STACKS.display,
                fontWeight: 900,
                fontSize: 130,
                lineHeight: 1.0,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                color: token.accent ? accentColor : textColor,
                textShadow: token.accent
                  ? `0 0 38px ${accentColor}88`
                  : "none",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {/* ── Media frame (rounded, glowing accent border) ── */}
      <div
        style={{
          position: "absolute",
          left: FRAME_X,
          top: FRAME_Y,
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${frameScale})`,
          transformOrigin: "center center",
          opacity: frameOpacity,
          borderRadius: FRAME_RADIUS,
          // Outer glow ring (the estebandiba accent halo).
          boxShadow: `0 0 0 4px ${accentColor}, 0 0 ${30 + glowAlpha * 40}px ${Math.round(
            glowAlpha * 16,
          )}px ${accentColor}${"88"}, 0 30px 80px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Inner clipped media area. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: FRAME_RADIUS,
            overflow: "hidden",
          }}
        >
          {/* BEFORE panel = full-bleed base layer. */}
          <PlaceholderPanel
            variant="before"
            label={leftMediaLabel}
            accentColor={accentColor}
          />

          {/* AFTER panel = revealed to the RIGHT of the divider via clip-path. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 0 0 ${dividerX}px)`,
              WebkitClipPath: `inset(0 0 0 ${dividerX}px)`,
            }}
          >
            <PlaceholderPanel
              variant="after"
              label={rightMediaLabel}
              accentColor={accentColor}
            />
          </div>

          {/* Corner badges sit inside the clipped media area. */}
          <CornerBadge
            label={beforeLabel}
            accentColor={accentColor}
            textColor={textColor}
            opacity={labelOpacity}
            position="bottom-left"
          />
          <CornerBadge
            label={afterLabel}
            accentColor={accentColor}
            textColor={textColor}
            opacity={labelOpacity}
            position="top-right"
          />

          {/* ── Divider line + draggable handle ── */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: dividerX - 2,
              width: 4,
              height: "100%",
              backgroundColor: "#FFFFFF",
              boxShadow: `0 0 18px ${accentColor}, 0 0 6px rgba(255,255,255,0.9)`,
            }}
          />
          {/* Round grab-handle riding the divider, mid-height. */}
          <div
            style={{
              position: "absolute",
              top: FRAME_H / 2 - HANDLE_R,
              left: dividerX - HANDLE_R,
              width: HANDLE_R * 2,
              height: HANDLE_R * 2,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: `3px solid ${accentColor}`,
              boxShadow: `0 0 22px ${accentColor}aa, 0 6px 18px rgba(0,0,0,0.45)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inline SVG double-chevron (◀ ▶) — the "drag me" affordance. */}
            <svg
              width={34}
              height={20}
              viewBox="0 0 34 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 4 L5 10 L11 16"
                stroke={accentColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 4 L29 10 L23 16"
                stroke={accentColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Caption with keyword highlights ── */}
      <div
        style={{
          position: "absolute",
          top: FRAME_Y + FRAME_H + 70,
          left: 0,
          width: CANVAS_W,
          padding: "0 80px",
          textAlign: "center",
          opacity: captionOpacity,
          transform: `translateY(${captionRise}px)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: 52,
            lineHeight: 1.28,
            color: textColor,
          }}
        >
          {captionRuns.map((run, i) => {
            const color =
              run.highlightIndex < 0
                ? textColor
                : run.highlightIndex === 0
                  ? accentColor
                  : highlightColor;
            const weight = run.highlightIndex < 0 ? 600 : 800;
            return (
              <span key={i} style={{ color, fontWeight: weight }}>
                {run.text}
              </span>
            );
          })}
        </p>
      </div>
    </AbsoluteFill>
  );
};
