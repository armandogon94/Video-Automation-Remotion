/**
 * ComparisonVS — side-by-side VS comparison overlay.
 *
 * Two labeled navy mini-panels slide in (left from the left edge, right from the
 * right edge) with a circular gold "VS" badge that pops in the center once both
 * panels have arrived.  Each panel shows a primary label and an optional
 * sub-label.  The whole unit is anchored in the lower-center zone (~60 % down
 * the 1080x1920 frame) — safely clear of the speaker's face (typically upper
 * half) and away from the caption strip (bottom 15 %).
 *
 * Brand palette: navy #1B3A6E panels, gold #D4AF37 VS badge, cyan #5BC0E8
 * panel accent stripe, white text.
 *
 * @dualAspect false — vertical 9:16 only (1080x1920 talking-head reel).
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../../brand";

// ─── Brand constants (from the brand token; CYAN/WHITE/panel are non-brand) ─────
const NAVY = BRAND.colors.primary;
const NAVY_PANEL = "rgba(27,58,110,0.88)";
const GOLD = BRAND.colors.accent;
const CYAN = "#5BC0E8";
const DEEP_NAVY = BRAND.colors.backgroundDark;
const WHITE = "#FFFFFF";

// ─── Schema ───────────────────────────────────────────────────────────────────
export const comparisonVSSchema = z.object({
  /** Primary label for the LEFT panel (e.g. "Antes", "Sin IA"). */
  leftLabel: z.string().default("Sin IA"),
  /** Optional sub-label / descriptor for the LEFT panel. */
  leftSub: z.string().default("Proceso manual"),
  /** Primary label for the RIGHT panel (e.g. "Después", "Con IA"). */
  rightLabel: z.string().default("Con IA"),
  /** Optional sub-label / descriptor for the RIGHT panel. */
  rightSub: z.string().default("Automatizado"),
  /**
   * Anchor zone for the overall block.
   * "lower-third" → ~57 % down, centered horizontally.
   * "bottom-left" / "bottom-right" → corner-pinned variants (uncommon).
   */
  anchor: z
    .enum(["lower-third", "bottom-left", "bottom-right"])
    .default("lower-third"),
  /** Accent color for the top stripe on each panel and the VS badge. */
  accentColor: z.string().default(GOLD),
  /** Frame at which the overlay begins entering. */
  enterFrame: z.number().default(0),
  /** Frames to hold at full visibility after the entrance settles. */
  holdFrames: z.number().default(90),
  /** Optional explicit frame at which to begin the fade-out. */
  exitFrame: z.number().optional(),
});

export type ComparisonVSProps = z.infer<typeof comparisonVSSchema>;

// ─── Anchor helpers ───────────────────────────────────────────────────────────

function resolveWrapperStyle(
  anchor: "lower-third" | "bottom-left" | "bottom-right",
): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute" };
  switch (anchor) {
    case "bottom-left":
      return { ...base, bottom: "8%", left: "6%" };
    case "bottom-right":
      return { ...base, bottom: "8%", right: "6%" };
    case "lower-third":
    default:
      // Center horizontally, placed ~57 % from the top (clear of face + captions).
      return {
        ...base,
        top: "57%",
        left: "50%",
        transform: "translateX(-50%)",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ComparisonVS: React.FC<Partial<ComparisonVSProps>> = (props) => {
  const p = comparisonVSSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Timing ────────────────────────────────────────────────────────────────
  const ENTER_DURATION = 14; // frames for panels to slide in
  const VS_DELAY = 10;       // frames after enter start before VS badge pops
  const FADE_OUT_FRAMES = 10;

  const derivedExit =
    p.enterFrame + ENTER_DURATION + p.holdFrames + FADE_OUT_FRAMES;
  const effectiveExit = p.exitFrame ?? derivedExit;

  if (frame < p.enterFrame || frame >= effectiveExit) return null;

  const local = frame - p.enterFrame;

  // ── Panel slide springs ───────────────────────────────────────────────────
  // Left panel slides in from the left (translateX: -120px → 0).
  const leftSlide = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 180, mass: 0.9 },
    durationInFrames: ENTER_DURATION,
  });
  const leftTranslateX = interpolate(leftSlide, [0, 1], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Right panel slides in from the right (translateX: +120px → 0).
  const rightSlide = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 180, mass: 0.9 },
    durationInFrames: ENTER_DURATION,
  });
  const rightTranslateX = interpolate(rightSlide, [0, 1], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Panel opacity — fade in over first 8 frames.
  const panelOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── VS badge pop spring ───────────────────────────────────────────────────
  const vsLocal = local - VS_DELAY;
  const vsScale = vsLocal <= 0
    ? 0
    : spring({
        frame: vsLocal,
        fps,
        config: { damping: 10, stiffness: 260, mass: 0.7 },
        durationInFrames: 12,
      });

  const vsOpacity = vsLocal <= 0
    ? 0
    : interpolate(vsLocal, [0, 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // ── Block fade-out ────────────────────────────────────────────────────────
  const blockOpacity = interpolate(
    frame,
    [effectiveExit - FADE_OUT_FRAMES, effectiveExit],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  if (blockOpacity <= 0) return null;

  // ── Layout constants ──────────────────────────────────────────────────────
  const PANEL_W = 340;
  const PANEL_H = 130;
  const GAP = 56; // gap between panels (VS badge lives in this space)
  const VS_BADGE_SIZE = 72;

  const wrapperPlacement = resolveWrapperStyle(p.anchor);

  // ── Panel renderer (shared structure for both sides) ──────────────────────
  const renderPanel = (
    label: string,
    sub: string,
    translateX: number,
    side: "left" | "right",
  ) => {
    const borderRadius =
      side === "left"
        ? { borderRadius: "18px 0 0 18px" }
        : { borderRadius: "0 18px 18px 0" };
    const accentBorder: React.CSSProperties =
      side === "left"
        ? { borderTop: `4px solid ${p.accentColor}`, borderLeft: `4px solid ${p.accentColor}` }
        : { borderTop: `4px solid ${p.accentColor}`, borderRight: `4px solid ${p.accentColor}` };

    return (
      <div
        style={{
          width: PANEL_W,
          height: PANEL_H,
          background: NAVY_PANEL,
          ...borderRadius,
          ...accentBorder,
          boxShadow: `0 8px 36px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          opacity: panelOpacity,
          transform: `translateX(${translateX}px)`,
          // Back-drop blur simulation via a second box-shadow ring in deep navy.
          outline: `1.5px solid rgba(255,255,255,0.08)`,
          flexShrink: 0,
        }}
      >
        {/* Primary label */}
        <span
          style={{
            fontFamily: FONT_STACKS.condensed,
            fontWeight: 700,
            fontSize: 40,
            color: WHITE,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            lineHeight: 1,
            textShadow: `0 2px 10px rgba(0,0,0,0.75), 0 0 2px ${DEEP_NAVY}`,
          }}
        >
          {label}
        </span>

        {/* Sub-label */}
        {sub !== "" ? (
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 500,
              fontSize: 22,
              color: CYAN,
              letterSpacing: "0.03em",
              lineHeight: 1,
              textShadow: `0 1px 6px rgba(0,0,0,0.7)`,
              textAlign: "center",
              maxWidth: PANEL_W - 32,
            }}
          >
            {sub}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: blockOpacity }}>
      <div
        style={{
          ...wrapperPlacement,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          // No extra gap — panels butt up to the VS zone; JS handles spacing.
        }}
      >
        {/* LEFT panel */}
        {renderPanel(p.leftLabel, p.leftSub, leftTranslateX, "left")}

        {/* VS badge zone — fixed width = GAP */}
        <div
          style={{
            width: GAP,
            height: PANEL_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: VS_BADGE_SIZE,
              height: VS_BADGE_SIZE,
              borderRadius: "50%",
              background: `radial-gradient(circle at 38% 38%, ${GOLD}, #A07C1A)`,
              boxShadow: `0 0 0 4px ${NAVY}, 0 6px 28px rgba(0,0,0,0.65), 0 2px 8px rgba(212,175,55,0.5)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: vsOpacity,
              transform: `scale(${vsScale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.condensed,
                fontWeight: 700,
                fontSize: 28,
                color: DEEP_NAVY,
                letterSpacing: "0.02em",
                lineHeight: 1,
                textShadow: `0 1px 0 rgba(255,255,255,0.25)`,
                userSelect: "none",
              }}
            >
              VS
            </span>
          </div>
        </div>

        {/* RIGHT panel */}
        {renderPanel(p.rightLabel, p.rightSub, rightTranslateX, "right")}
      </div>
    </AbsoluteFill>
  );
};

export default ComparisonVS;
