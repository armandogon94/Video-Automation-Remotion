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
import { FONT_STACKS } from "../../brand";

// ─── Schema ──────────────────────────────────────────────────────────────────

export const lowerThirdNameTagSchema = z.object({
  /** Nombre principal (línea 1, en negrita, blanco) */
  name: z.string().default("Armando González"),
  /** Rol o título (línea 2, dorado) */
  role: z.string().default("Fundador · IA & Negocios"),
  /** Arroba / handle (línea 2 secundaria, opcional). Pasar "" para omitir. */
  handle: z.string().default("@armandointeligencia"),
  /** Fotograma en que aparece el overlay */
  enterFrame: z.number().default(0),
  /** Fotogramas que permanece visible tras la entrada */
  holdFrames: z.number().default(90),
  /** Fotograma de salida. Si se omite se calcula automáticamente. */
  exitFrame: z.number().optional(),
  /** Color de acento (tick dorado por defecto) */
  accentColor: z.string().default("#D4AF37"),
});

export type LowerThirdNameTagProps = z.infer<typeof lowerThirdNameTagSchema>;

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const NAVY       = "#1B3A6E";
const DEEP_NAVY  = "#0F1B2D";
const GOLD       = "#D4AF37";
const WHITE      = "#FFFFFF";

// ─── Safe-inset constants (percentage of 1080-wide × 1920-tall canvas) ────────

const INSET_X = 64;   // px from left edge
const INSET_Y = 148;  // px from bottom edge (inside lower-third safe area)

// ─── Duration of slide-in animation (frames) ──────────────────────────────────

const ENTER_FRAMES = 14;

// ─── Component ───────────────────────────────────────────────────────────────

export const LowerThirdNameTag: React.FC<Partial<LowerThirdNameTagProps>> = (
  rawProps
) => {
  const p = lowerThirdNameTagSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Localise frame to this overlay's timeline
  const local = frame - p.enterFrame;
  const exit  = p.exitFrame ?? p.enterFrame + ENTER_FRAMES + p.holdFrames;

  // Outside active window → render nothing
  if (frame < p.enterFrame || frame >= exit) return null;

  // ── Entrance spring (drives X translation + opacity of bar) ───────────────
  const slideProgress = spring({
    frame: local,
    fps,
    config: { damping: 24, stiffness: 180 },
    durationInFrames: ENTER_FRAMES,
  });

  // Bar slides in from the left (starts 120 px off-screen to the left)
  const barTranslateX = interpolate(slideProgress, [0, 1], [-120, 0]);

  // Opacity of the whole block fades in over first 8 local frames
  const blockOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Exit fade (over last 8 frames before exitFrame) ───────────────────────
  const localExit  = exit - p.enterFrame;
  const exitFadeStart = localExit - 8;
  const exitOpacity   = interpolate(local, [exitFadeStart, localExit], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const combinedOpacity = blockOpacity * exitOpacity;

  // ── Role line: staggered fade-in after the bar ────────────────────────────
  const roleOpacity = interpolate(local, [6, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Handle visibility: show only when handle prop is not empty string
  const showHandle = p.handle !== "";

  // ── Geometry ──────────────────────────────────────────────────────────────
  // Gold accent tick: 4 px wide, full bar height
  const TICK_W   = 5;
  const BAR_PAD_X  = 20;
  const BAR_PAD_Y  = 14;
  const NAME_SIZE  = 40;
  const ROLE_SIZE  = 24;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/*
       * Container anchored to the bottom-left safe area.
       * AbsoluteFill is 1080 × 1920; we push with absolute positioning.
       */}
      <div
        style={{
          position: "absolute",
          bottom: INSET_Y,
          left: INSET_X,
          opacity: combinedOpacity,
          transform: `translateX(${barTranslateX}px)`,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        {/* Gold accent tick ─────────────────────────────────────────────── */}
        <div
          style={{
            width: TICK_W,
            borderRadius: 2,
            background: p.accentColor,
            flexShrink: 0,
            alignSelf: "stretch",
          }}
        />

        {/* Navy bar ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: NAVY,
            // Subtle dark border at top + right for contrast over bright footage
            boxShadow: `0 2px 24px 0 rgba(15,27,45,0.72), inset 0 0 0 1px rgba(91,192,232,0.10)`,
            borderRadius: "0 8px 8px 0",
            paddingTop: BAR_PAD_Y,
            paddingBottom: BAR_PAD_Y,
            paddingLeft: BAR_PAD_X,
            paddingRight: BAR_PAD_X + 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* NAME line ──────────────────────────────────────────────────── */}
          <span
            style={{
              fontFamily: FONT_STACKS.display,
              fontSize: NAME_SIZE,
              fontWeight: 800,
              color: WHITE,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              textShadow: `0 2px 8px rgba(15,27,45,0.85)`,
              whiteSpace: "nowrap",
            }}
          >
            {p.name}
          </span>

          {/* ROLE + HANDLE line ──────────────────────────────────────────── */}
          <div
            style={{
              opacity: roleOpacity,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontSize: ROLE_SIZE,
                fontWeight: 600,
                color: GOLD,
                lineHeight: 1.2,
                letterSpacing: "0.2px",
                textShadow: `0 1px 6px rgba(15,27,45,0.75)`,
                whiteSpace: "nowrap",
              }}
            >
              {p.role}
            </span>

            {showHandle && (
              <>
                {/* Divider dot */}
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.40)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontSize: ROLE_SIZE - 4,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.2,
                    letterSpacing: "0px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.handle}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
