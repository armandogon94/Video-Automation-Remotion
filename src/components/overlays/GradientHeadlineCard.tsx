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
import { BRAND, FONT_STACKS } from "../../brand";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const gradientHeadlineCardSchema = z.object({
  title: z.string().default("INTELIGENCIA ARTIFICIAL"),
  kicker: z.string().default(""),
  anchor: z
    .enum([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "left",
      "right",
      "lower-third",
    ])
    .default("lower-third"),
  enterFrame: z.number().default(0),
  holdFrames: z.number().default(72),
  exitFrame: z.number().optional(),
  accentColor: z.string().default("#D4AF37"),
});

export type GradientHeadlineCardProps = z.infer<
  typeof gradientHeadlineCardSchema
>;

// ---------------------------------------------------------------------------
// Brand palette (inline to keep the component self-contained)
// ---------------------------------------------------------------------------

const NAVY = BRAND.colors.primary;
const DEEP_NAVY = BRAND.colors.backgroundDark;
const GOLD = BRAND.colors.accent;
const WHITE = "#FFFFFF";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GradientHeadlineCard: React.FC<
  Partial<GradientHeadlineCardProps>
> = (props) => {
  const p = gradientHeadlineCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const local = frame - p.enterFrame;
  const exitFrame = p.exitFrame ?? p.enterFrame + 16 + p.holdFrames;

  // Bail outside active window
  if (frame < p.enterFrame || frame >= exitFrame) return null;

  const totalActiveFrames = exitFrame - p.enterFrame;
  const outStartLocal = totalActiveFrames - 12;

  // ---- Entrance: full-frame fade+scale in (0-16 frames) -------------------
  const entranceDuration = 16;
  const entryProgress = spring({
    frame: local,
    fps,
    config: { damping: 200 },
    durationInFrames: entranceDuration,
  });

  // ---- Exit: fade+scale out (last 12 frames) ------------------------------
  const exitProgress = spring({
    frame: local - outStartLocal,
    fps,
    config: { damping: 200 },
    durationInFrames: 12,
  });

  const overlayOpacity = interpolate(entryProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) - interpolate(exitProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overlayScale = interpolate(entryProgress, [0, 1], [1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Moving sheen: a diagonal highlight that sweeps across ---------------
  // Cycles slowly across the full hold window
  const sheenCycleFrames = Math.max(fps * 2.5, 1);
  const sheenT = (local % sheenCycleFrames) / sheenCycleFrames;
  // Map 0→1 to -120%→+220% so the sheen sweeps cleanly off-screen
  const sheenX = interpolate(sheenT, [0, 1], [-120, 220]);

  // ---- Headline mask-wipe (clip-path) --------------------------------------
  // Reveals from left → right over 22 frames, delayed 8 frames after entrance
  const titleDelay = 8;
  const titleRevealDuration = 22;
  const titleWipe = interpolate(
    local,
    [titleDelay, titleDelay + titleRevealDuration],
    [0, 110],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // ---- Gold rule grows from centre out -------------------------------------
  const ruleDelay = titleDelay + 10;
  const ruleDuration = 16;
  const ruleScale = interpolate(
    local,
    [ruleDelay, ruleDelay + ruleDuration],
    [0, 1],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // ---- Kicker rises in from below ------------------------------------------
  const kickerDelay = ruleDelay + 8;
  const kickerDuration = 18;
  const kickerProgress = spring({
    frame: local - kickerDelay,
    fps,
    config: { damping: 200 },
    durationInFrames: kickerDuration,
  });
  const kickerY = interpolate(kickerProgress, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerOpacity = interpolate(kickerProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hasKicker = p.kicker !== "";
  const accent = p.accentColor !== "" ? p.accentColor : GOLD;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: overlayOpacity,
        transform: `scale(${overlayScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* ---- Background gradient wash ---- */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, ${DEEP_NAVY} 60%, #050d18 100%)`,
        }}
      />

      {/* ---- Subtle radial vignette for depth ---- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(91,192,232,0.08) 0%, transparent 65%)",
        }}
      />

      {/* ---- Moving diagonal sheen ---- */}
      <AbsoluteFill
        style={{
          overflow: "hidden",
          opacity: 0.45,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: `${sheenX}%`,
            width: "18%",
            height: "140%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
          }}
        />
      </AbsoluteFill>

      {/* ---- Content block — vertically and horizontally centered ---- */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "8%",
          paddingRight: "8%",
          gap: 0,
        }}
      >
        {/* Headline with mask-wipe clip */}
        <div
          style={{
            overflow: "hidden",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              clipPath: `inset(0 ${100 - titleWipe}% 0 0)`,
              WebkitClipPath: `inset(0 ${100 - titleWipe}% 0 0)`,
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.display,
                fontWeight: 900,
                fontSize: `${Math.round(height * 0.092)}px`,
                lineHeight: 1.0,
                letterSpacing: "0.04em",
                color: WHITE,
                textTransform: "uppercase",
                textShadow: `0 0 60px rgba(91,192,232,0.5), 0 4px 24px rgba(0,0,0,0.85)`,
                display: "block",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {p.title}
            </span>
          </div>
        </div>

        {/* Gold rule */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: `${Math.round(height * 0.028)}px`,
            marginBottom: `${Math.round(height * 0.022)}px`,
          }}
        >
          <div
            style={{
              height: 4,
              width: `${Math.round(width * 0.48)}px`,
              background: `linear-gradient(90deg, transparent 0%, ${accent} 20%, ${accent} 80%, transparent 100%)`,
              borderRadius: 2,
              transform: `scaleX(${ruleScale})`,
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* Kicker */}
        {hasKicker && (
          <div
            style={{
              transform: `translateY(${kickerY}px)`,
              opacity: kickerOpacity,
              textAlign: "center",
              width: "100%",
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 500,
                fontSize: `${Math.round(height * 0.038)}px`,
                lineHeight: 1.35,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.82)",
                textTransform: "uppercase",
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                display: "block",
              }}
            >
              {p.kicker}
            </span>
          </div>
        )}
      </AbsoluteFill>

      {/* ---- Thin cyan accent line at top edge ---- */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent 0%, #5BC0E8 40%, ${accent} 70%, transparent 100%)`,
          opacity: interpolate(local, [0, entranceDuration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
