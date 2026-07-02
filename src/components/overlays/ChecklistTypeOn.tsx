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

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const checklistTypeOnSchema = z.object({
  title: z.string().default("Pasos clave"),
  items: z
    .array(z.string())
    .default([
      "Definir tu nicho con claridad",
      "Crear contenido de alto valor",
      "Publicar con consistencia diaria",
      "Optimizar con datos reales",
    ]),
  anchor: z
    .enum(["bottom-left", "bottom-right", "left", "right", "lower-third"])
    .default("lower-third"),
  enterFrame: z.number().default(0),
  /** Frames each item is shown before the next one reveals (includes its own entrance) */
  framesPerItem: z.number().default(48),
  holdFrames: z.number().default(72),
  exitFrame: z.number().optional(),
  accentColor: z.string().default("#D4AF37"),
});

export type ChecklistTypeOnProps = z.infer<typeof checklistTypeOnSchema>;

// ---------------------------------------------------------------------------
// Brand palette (inline so the component is self-sufficient if brand file
// only exports FONT_STACKS — colours are spec-mandated constants)
// ---------------------------------------------------------------------------

const NAVY = BRAND.colors.primary;
const GOLD = BRAND.colors.accent;
const CYAN = "#5BC0E8";
const WHITE = "#FFFFFF";
const DEEP_NAVY = BRAND.colors.backgroundDark;

// ---------------------------------------------------------------------------
// Anchor → CSS position helper
// ---------------------------------------------------------------------------

type AnchorKey = ChecklistTypeOnProps["anchor"];

function anchorStyles(anchor: AnchorKey): React.CSSProperties {
  const inset = "6%";
  switch (anchor) {
    case "bottom-left":
      return { justifyContent: "flex-end", alignItems: "flex-start", padding: `0 0 ${inset} ${inset}` };
    case "bottom-right":
      return { justifyContent: "flex-end", alignItems: "flex-end", padding: `0 ${inset} ${inset} 0` };
    case "left":
      return { justifyContent: "center", alignItems: "flex-start", padding: `0 0 0 ${inset}` };
    case "right":
      return { justifyContent: "center", alignItems: "flex-end", padding: `0 ${inset} 0 0` };
    case "lower-third":
    default:
      return { justifyContent: "flex-end", alignItems: "flex-start", padding: `0 0 8% 7%` };
  }
}

// ---------------------------------------------------------------------------
// Sub-component: one checklist row
// ---------------------------------------------------------------------------

interface RowProps {
  text: string;
  localFrame: number;
  fps: number;
  accentColor: string;
  isLast: boolean;
}

const ENTRANCE_FRAMES = 12;
const BADGE_DELAY = 20; // frames after item start before badge pops

const ChecklistRow: React.FC<RowProps> = ({
  text,
  localFrame,
  fps,
  accentColor,
}) => {
  // Slide-up + fade for the row
  const rowEntrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 180 },
    durationInFrames: ENTRANCE_FRAMES,
  });

  const rowOpacity = interpolate(localFrame, [0, ENTRANCE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rowY = interpolate(rowEntrance, [0, 1], [24, 0]);

  // Gold badge scale-pop after the text has landed
  const badgeFrame = Math.max(0, localFrame - BADGE_DELAY);
  const badgeScale = spring({
    frame: badgeFrame,
    fps,
    config: { damping: 10, stiffness: 260 },
    durationInFrames: 14,
  });

  const badgeOpacity = interpolate(badgeFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        marginBottom: 18,
      }}
    >
      {/* Gold ✓ badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
          boxShadow: `0 0 12px ${accentColor}88`,
        }}
      >
        <span
          style={{
            color: DEEP_NAVY,
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: FONT_STACKS.sans,
          }}
        >
          ✓
        </span>
      </div>

      {/* Item text */}
      <span
        style={{
          fontFamily: FONT_STACKS.mono,
          fontSize: 30,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: "0.01em",
          lineHeight: 1.25,
          textShadow: `0 2px 8px ${DEEP_NAVY}cc, 0 0 2px ${DEEP_NAVY}`,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ChecklistTypeOn: React.FC<Partial<ChecklistTypeOnProps>> = (
  rawProps
) => {
  const p = checklistTypeOnSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - p.enterFrame;
  const totalRevealFrames = p.items.length * p.framesPerItem;
  const exit = p.exitFrame ?? p.enterFrame + totalRevealFrames + p.holdFrames;

  // Hide outside active window
  if (frame < p.enterFrame || frame >= exit) return null;

  // Panel entrance (slides up from bottom)
  const panelEntrance = spring({
    frame: local,
    fps,
    config: { damping: 24, stiffness: 160 },
    durationInFrames: 16,
  });
  const panelY = interpolate(panelEntrance, [0, 1], [40, 0]);
  const panelOpacity = interpolate(local, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitStart = exit - p.enterFrame - 16;
  const exitOpacity = interpolate(local, [exitStart, exit - p.enterFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const compositeOpacity = panelOpacity * exitOpacity;

  // Determine how many items are currently visible
  const visibleCount = Math.min(
    p.items.length,
    Math.floor(local / p.framesPerItem) + 1
  );

  // Title entrance
  const titleEntrance = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 200 },
    durationInFrames: 14,
  });
  const titleY = interpolate(titleEntrance, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        ...anchorStyles(p.anchor),
      }}
    >
      {/* Translucent navy panel */}
      <div
        style={{
          opacity: compositeOpacity,
          transform: `translateY(${panelY}px)`,
          background: `${NAVY}e0`,
          borderRadius: 20,
          borderLeft: `5px solid ${p.accentColor}`,
          padding: "28px 36px 28px 28px",
          maxWidth: 640,
          minWidth: 340,
          backdropFilter: "blur(6px)",
          boxShadow: `0 8px 40px ${DEEP_NAVY}99`,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 22,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {/* Cyan accent dot */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: CYAN,
              flexShrink: 0,
              boxShadow: `0 0 8px ${CYAN}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.display,
              fontSize: 24,
              fontWeight: 800,
              color: p.accentColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textShadow: `0 2px 6px ${DEEP_NAVY}`,
            }}
          >
            {p.title}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${p.accentColor}, transparent)`,
            marginBottom: 20,
            borderRadius: 1,
          }}
        />

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {p.items.slice(0, visibleCount).map((item, idx) => {
            const itemLocalFrame = local - idx * p.framesPerItem;
            return (
              <ChecklistRow
                key={idx}
                text={item}
                localFrame={Math.max(0, itemLocalFrame)}
                fps={fps}
                accentColor={p.accentColor}
                isLast={idx === p.items.length - 1}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
