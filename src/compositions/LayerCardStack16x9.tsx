/**
 * LayerCardStack16x9 — horizontal (1920×1080) "framework taxonomy" card composition.
 *
 * 16:9 sibling of `LayerCardStack9x16` (simonhoiberg Template B pattern).
 * ADR-001-16x9-lane §2.1/§2.4/§5.1.
 *
 * Layout re-design for landscape:
 *   Cards are spread HORIZONTALLY across the 1920px width, each as a fixed-width
 *   column rather than stacked vertically. Cards stagger in left-to-right using
 *   the same spring-scale + opacity + translateX entry (instead of translateY).
 *   A centered title sits above the card row. The glassmorphic backdrop uses a
 *   wider ellipse tuned for the 1920×1080 canvas.
 *
 * Supports 2–4 cards; at 2 cards each column is ~720px wide, at 3 ~560px, at
 * 4 ~440px — all comfortable on the 1920 canvas with 40px horizontal gutter.
 *
 * Brand chrome: DarkSlateChassis16x9 + BrandBreadcrumb16x9 + BrandWatermark16x9.
 * Palette prop defaults to `dark` per ADR §2.5 (16:9 B-roll default).
 *
 * Motion grammar:
 *   - Card[i] enters at `cardStaggerSeconds * i` (default 0.35s).
 *   - Per-card: spring scale 0.92→1.0 + opacity 0→1 + translateX −24→0.
 *   - Badge scales in ~0.1s after card lands.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb16x9 } from "../components/BrandBreadcrumb16x9";
import { BrandWatermark16x9 } from "../components/BrandWatermark16x9";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  ALL_PALETTE_MODES,
  FONT_STACKS,
} from "../brand";

// ─── Locally-redeclared schemas (per ADR §2.4 — no shared-file edits) ──────
const wordTimingSchema_local = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

const breadcrumbSchema_local = z.object({
  text: z.string(),
  date: z.string(),
});

const watermarkSchema_local = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

const layerCard16x9Schema_item = z.object({
  badge: z.string().optional(),
  headline: z.string().default(""),
  body: z.string().default(""),
  icon: z.string().optional(),
});
type LayerCard16x9Item = z.infer<typeof layerCard16x9Schema_item>;

// ─── Public schema ────────────────────────────────────────────────────────────
export const layerCardStack16x9Schema = z.object({
  audioUrl: z.string().optional(),
  wordTimings: z.array(wordTimingSchema_local).optional(),
  title: z.string().default(""),
  cards: z
    .array(layerCard16x9Schema_item)
    .min(2)
    .max(4)
    .default([
      {
        badge: "LAYER 1",
        headline: "Foundation",
        body: "The base layer that everything is built on.",
        icon: "⬛",
      },
      {
        badge: "LAYER 2",
        headline: "Reasoning",
        body: "Where models learn to think step-by-step.",
        icon: "🧩",
      },
      {
        badge: "LAYER 3",
        headline: "Agency",
        body: "Autonomous action with memory and tools.",
        icon: "🚀",
      },
    ]),
  /** Seconds between consecutive card entries. Default 0.35s. */
  cardStaggerSeconds: z.number().min(0.05).max(5).default(0.35),
  breadcrumb: breadcrumbSchema_local.nullable().optional(),
  watermark: watermarkSchema_local.nullable().optional(),
  watermarkHandle: z.string().default("@armandointeligencia"),
  subjectTool: z.string().nullable().optional(),
  palette: z.enum(ALL_PALETTE_MODES).default("dark"),
  paperColor: z.string().optional(),
  inkColor: z.string().optional(),
  accentColor: z.string().optional(),
  mutedColor: z.string().optional(),
  /** ADR §5.1: 16:9 caption default 32–36 px. */
  captionFontSize: z.number().min(20).max(120).optional(),
  showCaptions: z.boolean().default(false),
});

export type LayerCardStack16x9Props = z.infer<typeof layerCardStack16x9Schema>;

// ─── Layout constants (1920×1080) ─────────────────────────────────────────
const FRAME_W = 1920;
const FRAME_H = 1080;
const HORIZONTAL_GUTTER = 60; // outer edge padding
const CARD_GAP = 32; // gap between cards
const CARD_BORDER_RADIUS = 20;
const CARD_PADDING_V = 36;
const CARD_PADDING_H = 36;
const CARD_AREA_TOP = 220; // top of card area (title sits above)
const CARD_AREA_BOTTOM = FRAME_H - 80; // bottom safe area
const CARD_HEIGHT = CARD_AREA_BOTTOM - CARD_AREA_TOP;

// Per-card animation timing (frames @ 30fps).
const CARD_ENTER_DURATION_FRAMES = 14;
const BADGE_DELAY_AFTER_CARD_FRAMES = 3;

// ─── Glassmorphic backdrop (landscape variant) ─────────────────────────────
const GlassmorphicBackdrop16x9: React.FC<{
  palette: LayerCardStack16x9Props["palette"];
  accentColor: string;
  paperColor: string;
}> = ({ palette, accentColor, paperColor }) => {
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";
  const accentTint = `${accentColor}${isDark ? "38" : "24"}`;
  const ambient = isDark ? "#0A0F1A" : paperColor;
  return (
    <>
      <AbsoluteFill style={{ background: ambient }} />
      {/* Wide horizontal halo — tuned for 1920px width. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1800px 900px at 18% 30%, ${accentTint} 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: isDark
            ? "radial-gradient(ellipse 1400px 700px at 88% 80%, rgba(120, 160, 220, 0.08) 0%, transparent 60%)"
            : "radial-gradient(ellipse 1400px 700px at 88% 80%, rgba(40, 60, 90, 0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ─── A single landscape card ───────────────────────────────────────────────
const StackCard16x9: React.FC<{
  card: LayerCard16x9Item;
  index: number;
  leftPx: number;
  widthPx: number;
  staggerSeconds: number;
  palette: LayerCardStack16x9Props["palette"];
  accentColor: string;
  inkColor: string;
  mutedColor: string;
}> = ({
  card,
  index,
  leftPx,
  widthPx,
  staggerSeconds,
  palette,
  accentColor,
  inkColor,
  mutedColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  const delayFrames = Math.round(staggerSeconds * index * fps);
  const localFrame = frame - delayFrames;

  // Card entry: spring scale + opacity + translateX (horizontal entry for landscape).
  const enter = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardOpacity = localFrame < 0 ? 0 : interpolate(enter, [0, 1], [0, 1]);
  const cardScale = interpolate(enter, [0, 1], [0.92, 1.0]);
  const cardTranslateX = interpolate(enter, [0, 1], [-24, 0]);

  // Badge enters ~0.1s after card lands.
  const badgeLocalFrame =
    localFrame - (CARD_ENTER_DURATION_FRAMES + BADGE_DELAY_AFTER_CARD_FRAMES);
  const badgeEnter = spring({
    frame: Math.max(0, badgeLocalFrame),
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.6 },
  });
  const badgeOpacity =
    badgeLocalFrame < 0 ? 0 : interpolate(badgeEnter, [0, 1], [0, 1]);
  const badgeScale = interpolate(badgeEnter, [0, 1], [0.85, 1.0]);

  const cardBg = isDark ? "#161D2B" : "#FFFFFF";
  const cardInk = isDark ? inkColor : "#0F1419";
  const cardMuted = isDark ? mutedColor : "#4A4F58";

  return (
    <div
      style={{
        position: "absolute",
        top: CARD_AREA_TOP,
        left: leftPx,
        width: widthPx,
        height: CARD_HEIGHT,
        padding: `${CARD_PADDING_V}px ${CARD_PADDING_H}px`,
        background: cardBg,
        borderRadius: CARD_BORDER_RADIUS,
        boxShadow: isDark
          ? "0 18px 48px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)"
          : "0 18px 48px rgba(10,15,26,0.18), 0 2px 6px rgba(10,15,26,0.08)",
        opacity: cardOpacity,
        transform: `translateX(${cardTranslateX}px) scale(${cardScale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Top row — badge (left) + optional icon (right) */}
      {(card.badge || card.icon) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 36,
          }}
        >
          {card.badge ? (
            <div
              style={{
                background: accentColor,
                color: "#FFFFFF",
                fontFamily: FONT_STACKS.sans,
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 999,
                opacity: badgeOpacity,
                transform: `scale(${badgeScale})`,
                transformOrigin: "left center",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {card.badge}
            </div>
          ) : (
            <span />
          )}
          {card.icon && (
            <div
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 24,
                color: cardMuted,
                lineHeight: 1,
                opacity: cardOpacity,
              }}
            >
              {card.icon}
            </div>
          )}
        </div>
      )}

      {/* Headline — ADR §5.1: body-level sizing for card content in 16:9. */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.1,
          color: cardInk,
          letterSpacing: "-0.015em",
          flex: "none",
        }}
      >
        {card.headline}
      </div>

      {/* Body */}
      {card.body && (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.4,
            color: cardMuted,
            letterSpacing: "-0.005em",
            flex: 1,
          }}
        >
          {card.body}
        </div>
      )}
    </div>
  );
};

// ─── Title (optional, centered above card row) ─────────────────────────────
const CardTitle16x9: React.FC<{
  title: string;
  inkColor: string;
}> = ({ title, inkColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 24, stiffness: 140, mass: 0.6 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [10, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        /* ADR §5.1: headline 16:9 default 140–180 px. Using 100px for supporting title. */
        fontSize: 72,
        lineHeight: 1.1,
        color: inkColor,
        letterSpacing: "-0.02em",
        padding: "0 80px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {title}
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────
/**
 * Compute left position and width for each card so they are evenly spaced
 * across the available horizontal area.
 */
function computeCardLayout(
  count: number,
): Array<{ leftPx: number; widthPx: number }> {
  const totalWidth =
    FRAME_W - HORIZONTAL_GUTTER * 2 - CARD_GAP * (count - 1);
  const cardWidth = Math.floor(totalWidth / count);
  return Array.from({ length: count }, (_, i) => ({
    leftPx: HORIZONTAL_GUTTER + i * (cardWidth + CARD_GAP),
    widthPx: cardWidth,
  }));
}

// ─── Composition ─────────────────────────────────────────────────────────────
export const LayerCardStack16x9: React.FC<LayerCardStack16x9Props> = ({
  audioUrl,
  wordTimings,
  title,
  cards,
  cardStaggerSeconds,
  breadcrumb,
  watermark,
  watermarkHandle,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, palette)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;
  const isDark =
    palette === "dark" || palette === "warm-black" || palette === "true-black";

  const cardLayout = computeCardLayout(cards.length);

  return (
    <DarkSlateChassis16x9>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Glassmorphic blurred-studio backdrop */}
      <GlassmorphicBackdrop16x9
        palette={palette}
        accentColor={resolvedAccent}
        paperColor={resolvedPaper}
      />

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDark ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Optional top-left breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb16x9
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Optional centered title above card row */}
      {title && <CardTitle16x9 title={title} inkColor={resolvedInk} />}

      {/* Horizontally spread card row */}
      {cards.map((card, i) => (
        <StackCard16x9
          key={i}
          card={card}
          index={i}
          leftPx={cardLayout[i].leftPx}
          widthPx={cardLayout[i].widthPx}
          staggerSeconds={cardStaggerSeconds}
          palette={palette}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          mutedColor={resolvedMuted}
        />
      ))}

      {/* Optional bottom-right watermark */}
      {watermark && (
        <BrandWatermark16x9
          style={watermark}
          handle={watermarkHandle || undefined}
        />
      )}

      {/* Optional editorial caption strip — default OFF per ADR §2.5 */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings ?? []}
          style={{
            position: "bottom",
            distancePx: 60,
            fontSize: captionFontSize ?? 34,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 1400,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </DarkSlateChassis16x9>
  );
};

export default LayerCardStack16x9;
