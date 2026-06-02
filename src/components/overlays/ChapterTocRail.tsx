import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

// ─── Schema ────────────────────────────────────────────────────────────────

const tocItemSchema = z.object({
  n: z.number(),
  label: z.string(),
});

export const chapterTocRailSchema = z.object({
  items: z
    .array(tocItemSchema)
    .default([
      { n: 1, label: "Introducción" },
      { n: 2, label: "El Problema" },
      { n: 3, label: "La Solución" },
      { n: 4, label: "Resultados" },
      { n: 5, label: "Conclusión" },
    ]),
  activeIndex: z.number().default(0),
  side: z.enum(["left", "right"]).default("right"),
  enterFrame: z.number().default(0),
  holdFrames: z.number().default(120),
  exitFrame: z.number().optional(),
  accentColor: z.string().default("#D4AF37"),
});

export type ChapterTocRailProps = z.infer<typeof chapterTocRailSchema>;

// ─── Brand constants ────────────────────────────────────────────────────────

const NAVY = "#1B3A6E";
const DEEP_NAVY = "#0F1B2D";
const GOLD = "#D4AF37";
const WHITE = "#FFFFFF";

// ─── Component ──────────────────────────────────────────────────────────────

export const ChapterTocRail: React.FC<Partial<ChapterTocRailProps>> = (
  rawProps
) => {
  const p = chapterTocRailSchema.parse(rawProps);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - p.enterFrame;
  const exit = p.exitFrame ?? p.enterFrame + 16 + p.holdFrames;

  // Outside visible window → render nothing
  if (frame < p.enterFrame || frame >= exit) return null;

  // ── Slide-in entrance (spring from off-screen) ──
  const slideProgress = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 180 },
    durationInFrames: 16,
  });

  // ── Slide-out exit (spring toward off-screen) ──
  const framesBeforeExit = exit - frame;
  const isExiting = framesBeforeExit <= 14;
  const exitProgress = isExiting
    ? spring({
        frame: 14 - framesBeforeExit,
        fps,
        config: { damping: 22, stiffness: 180 },
        durationInFrames: 14,
      })
    : 0;

  // Combined translate: enter from edge, exit toward edge
  // Rail width is ~220px + 6% inset (~65px for 1080 wide)
  const RAIL_WIDTH = 228;
  const INSET = 65; // ~6% of 1080

  const enterTranslateX =
    p.side === "right"
      ? interpolate(slideProgress, [0, 1], [RAIL_WIDTH + INSET, 0])
      : interpolate(slideProgress, [0, 1], [-(RAIL_WIDTH + INSET), 0]);

  const exitTranslateX =
    p.side === "right"
      ? interpolate(exitProgress, [0, 1], [0, RAIL_WIDTH + INSET])
      : interpolate(exitProgress, [0, 1], [0, -(RAIL_WIDTH + INSET)]);

  const translateX = enterTranslateX + exitTranslateX;

  // Overall container opacity — fade in quickly
  const containerOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Position ──
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: `translateY(-50%) translateX(${translateX}px)`,
    ...(p.side === "right" ? { right: INSET } : { left: INSET }),
    opacity: containerOpacity,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={containerStyle}>
        {p.items.map((item, idx) => (
          <RailItem
            key={item.n}
            item={item}
            isActive={idx === p.activeIndex}
            side={p.side}
            accentColor={p.accentColor}
            localFrame={local}
            fps={fps}
            itemIndex={idx}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Single rail item ────────────────────────────────────────────────────────

interface RailItemProps {
  item: { n: number; label: string };
  isActive: boolean;
  side: "left" | "right";
  accentColor: string;
  localFrame: number;
  fps: number;
  itemIndex: number;
}

const RailItem: React.FC<RailItemProps> = ({
  item,
  isActive,
  side,
  accentColor,
  localFrame,
  fps,
  itemIndex,
}) => {
  // Staggered entrance per item — each item pops in 3 frames after the previous
  const itemDelay = itemIndex * 3;
  const itemFrame = Math.max(0, localFrame - itemDelay);

  const itemEntrance = spring({
    frame: itemFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
    durationInFrames: 12,
  });

  const itemOpacity = interpolate(itemEntrance, [0, 1], [0, 1]);

  // Active item scale spring (pops to 1 immediately at full entrance)
  const activeScale = isActive
    ? interpolate(
        spring({
          frame: itemFrame,
          fps,
          config: { damping: 18, stiffness: 250 },
          durationInFrames: 12,
        }),
        [0, 1],
        [0.88, 1]
      )
    : 1;

  // Dim inactive items
  const dimOpacity = isActive ? 1 : 0.42;
  const combinedOpacity = itemOpacity * dimOpacity;

  // Gold tick bar width: animates in when active
  const tickScale = isActive
    ? spring({
        frame: itemFrame,
        fps,
        config: { damping: 14, stiffness: 220 },
        durationInFrames: 10,
      })
    : 0;

  const numberColor = isActive ? accentColor : WHITE;
  const labelColor = isActive ? WHITE : "rgba(255,255,255,0.7)";
  const labelWeight = isActive ? 700 : 400;

  // Chip background — slightly more opaque for active
  const chipAlpha = isActive ? 0.82 : 0.55;
  const chipBg = hexToRgba(DEEP_NAVY, chipAlpha);
  const chipBorder = isActive
    ? `1.5px solid ${accentColor}`
    : `1px solid rgba(255,255,255,0.12)`;

  // Layout direction: tick bar on the inner edge (toward center)
  // side=right → tick on the left of the chip
  // side=left  → tick on the right of the chip
  const tickBar = (
    <div
      style={{
        width: 4,
        height: 36,
        borderRadius: 2,
        backgroundColor: accentColor,
        transform: `scaleY(${tickScale})`,
        transformOrigin: "center",
        flexShrink: 0,
      }}
    />
  );

  const chipContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingLeft: side === "right" ? 0 : 12,
        paddingRight: side === "right" ? 12 : 0,
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: isActive ? accentColor : "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACKS.sans,
            fontSize: 13,
            fontWeight: 700,
            color: isActive ? DEEP_NAVY : numberColor,
            lineHeight: 1,
          }}
        >
          {item.n}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontSize: isActive ? 15 : 13,
          fontWeight: labelWeight,
          color: labelColor,
          letterSpacing: isActive ? 0.2 : 0,
          whiteSpace: "nowrap",
          textShadow: `0 1px 4px rgba(0,0,0,0.7)`,
        }}
      >
        {item.label}
      </span>
    </div>
  );

  return (
    <div
      style={{
        opacity: combinedOpacity,
        transform: `scale(${activeScale})`,
        transformOrigin: side === "right" ? "right center" : "left center",
        marginBottom: 8,
        transition: "none", // no CSS transitions — Remotion only
      }}
    >
      {/* Pill chip */}
      <div
        style={{
          display: "flex",
          flexDirection: side === "right" ? "row" : "row-reverse",
          alignItems: "center",
          gap: 0,
          backgroundColor: chipBg,
          border: chipBorder,
          borderRadius: 40,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: side === "right" ? 6 : 12,
          paddingRight: side === "right" ? 12 : 6,
          boxShadow: isActive
            ? `0 2px 16px rgba(0,0,0,0.45), 0 0 0 1px ${accentColor}33`
            : `0 1px 6px rgba(0,0,0,0.30)`,
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Tick bar — inner-edge side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: side === "right" ? 8 : 0,
            marginLeft: side === "left" ? 8 : 0,
          }}
        >
          {tickBar}
        </div>

        {chipContent}
      </div>
    </div>
  );
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
