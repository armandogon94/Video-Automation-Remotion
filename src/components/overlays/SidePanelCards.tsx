/**
 * SidePanelCards — austin.marchese "punch" content stack: kicker + title +
 * numbered liquid-glass cards entering ONE BY ONE beside a side-panel speaker.
 *
 * Source pattern: @austin.marchese talking-head grammar (DENSE-loop2 rows 8–9 +
 * TH-scan row 6): the speaker punches from fullscreen into a rounded vertical
 * panel on one side while the other side fills with a card stack over a brand
 * gradient backdrop — "4 Data Pipelines you need to setup / [1] Your own
 * Inputs" style progressive numbered chips. See
 * docs/research/austin-anim/FINAL-CONSENSUS.md (liquid-glass material study).
 *
 *   ╭──────────────────────────────────────────────┬──────────╮
 *   │  EL PUNTO MÁS SERIO         ← kicker (gold)  │ ╭──────╮ │
 *   │  Si Anthropic gana…         ← title (cream)  │ │ cam  │ │
 *   │  ⑴ Posee todo el trabajo…   ← glass card     │ │panel │ │
 *   │  ⑵ ¿Cómo continúa…?         ← glass card     │ ╰──────╯ │
 *   ╰──────────────────────────────────────────────┴──────────╯
 *
 * transitionVerb: "Slide the kicker+title in on mount; reveal card i at
 * enterFrame + i·staggerFrames — slide up 24px + fade + scale .96→1 with a
 * spring; already-entered cards STAY; once all cards are in, run a subtle idle
 * rim-glow pulse so the stack never freezes."
 *
 * Meant for the LAYOUT-mode SpeakerOverlayScene: the LayoutTrack owns the cam
 * panel + gradient backdrop; this molecule owns ONLY the content stack (it
 * renders into a transparent AbsoluteFill). Deterministic — pure function of
 * useCurrentFrame(); no randomness, no hardcoded brand hexes (LG tokens only).
 *
 * Self-contained: reads `useCurrentFrame()` itself; safe to mount anywhere
 * (Sequence-rebased by the scene's overlay layer when fromFrame is set).
 *
 * @dualAspect true — sizes scale with canvas height (designed at 1080p); the
 * parent picks `side`/`widthFrac` per aspect. Source pattern: austin punch.
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
import { FONT_STACKS } from "../../brand";
import { glassCardStyle, glassGlow, lgTheme, withAlpha, LG_CREAM } from "../liquidglass/tokens";

const sidePanelCardSchema = z.object({
  /** Chip number (rendered inside the gold circle). */
  n: z.number(),
  /** Card headline. */
  title: z.string(),
  /** Optional dim sub-note under the headline. */
  note: z.string().default(""),
});

export const sidePanelCardsSchema = z.object({
  /** Mono, tracking-wide, gold eyebrow line above the title. */
  kicker: z.string().default("LOS 4 PILARES"),
  /** Bold cream headline under the kicker. */
  title: z.string().default("Lo que necesitas configurar"),
  /** The numbered cards, revealed one per beat. */
  cards: z
    .array(sidePanelCardSchema)
    .default([
      { n: 1, title: "Tus propias entradas", note: "los datos que tú controlas" },
      { n: 2, title: "Ingesta automática", note: "pipelines que fluyen solos" },
      { n: 3, title: "Procesamiento con skills", note: "probado y repetible" },
      { n: 4, title: "Salidas accionables", note: "reportes listos para usar" },
    ]),
  /** Which side of the canvas the stack occupies (the cam panel gets the other). */
  side: z.enum(["left", "right"]).default("left"),
  /** Stack width as a fraction of the canvas width. */
  widthFrac: z.number().default(0.52),
  /** Liquid-glass theme (brand = navy/gold; warm/cool = parity studies). */
  theme: z.enum(["brand", "warm", "cool"]).default("brand"),
  /** Block-relative frame card 0 enters (kicker+title always enter at 0). */
  enterFrame: z.number().default(0),
  /** Frames between successive card reveals (one per spoken beat). */
  staggerFrames: z.number().default(20),
  /** Vertical alignment of the whole stack. */
  alignY: z.enum(["top", "center"]).default("center"),
});

export type SidePanelCardsProps = z.infer<typeof sidePanelCardsSchema>;

/** Header (kicker+title) enter length, frames. */
const HEADER_IN = 12;
/** Per-card spring enter length, frames. */
const CARD_IN = 16;
/** Idle glow pulse period, frames (~2.8s @30fps — barely-there breathing). */
const PULSE_PERIOD = 84;

export const SidePanelCards: React.FC<Partial<SidePanelCardsProps>> = (props) => {
  const {
    kicker,
    title,
    cards,
    side,
    widthFrac,
    theme,
    enterFrame,
    staggerFrames,
    alignY,
  } = sidePanelCardsSchema.parse(props);

  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  // Designed at 1080p; scale typography/spacing with canvas height.
  const s = height / 1080;
  const t = lgTheme(theme);

  // ── Header (kicker → title) enters on mount ────────────────────────────────
  const headerPop = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 170, mass: 0.7 },
    durationInFrames: HEADER_IN,
  });
  const kickerOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titlePop = spring({
    frame: frame - 5,
    fps,
    config: { damping: 13, stiffness: 170, mass: 0.7 },
    durationInFrames: HEADER_IN,
  });
  const titleOpacity = interpolate(frame, [5, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Card reveal timeline (card i at enterFrame + i·staggerFrames) ──────────
  const lastEnterAt = enterFrame + Math.max(0, cards.length - 1) * staggerFrames;
  const allInAt = lastEnterAt + CARD_IN;
  // Subtle idle rim-glow pulse once every card has settled (no frozen tail).
  const idlePulse =
    frame >= allInAt
      ? 0.14 * Math.sin(((frame - allInAt) / PULSE_PERIOD) * Math.PI * 2)
      : 0;

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    width: `${widthFrac * 100}%`,
    ...(side === "left" ? { left: "4.2%" } : { right: "4.2%" }),
    // Center bias slightly ABOVE true middle so the stack's bottom edge clears
    // the bottom-center caption lane (keep below-78%-free rule).
    ...(alignY === "center"
      ? { top: "48%", transform: "translateY(-50%)" }
      : { top: "8%" }),
    display: "flex",
    flexDirection: "column",
  };

  const baseCard = glassCardStyle({
    theme,
    radius: 22 * s,
    borderWidth: 2,
    padding: `${16 * s}px ${22 * s}px`,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={panelStyle}>
        {/* Kicker — mono, tracking-wide, gold. */}
        {kicker ? (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: 25 * s,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: t.accent,
              opacity: kickerOpacity,
              transform: `translateY(${16 * (1 - headerPop)}px)`,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {kicker}
          </div>
        ) : null}

        {/* Title — bold cream. */}
        {title ? (
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: 46 * s,
              lineHeight: 1.14,
              color: LG_CREAM,
              marginTop: 14 * s,
              maxWidth: "100%",
              opacity: titleOpacity,
              transform: `translateY(${18 * (1 - titlePop)}px)`,
              textShadow: "0 2px 14px rgba(0,0,0,0.55)",
            }}
          >
            {title}
          </div>
        ) : null}

        {/* Numbered glass cards — one per beat; entered cards stay. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16 * s,
            marginTop: 28 * s,
          }}
        >
          {cards.map((card, i) => {
            const at = enterFrame + i * staggerFrames;
            const local = frame - at;
            if (local < 0) return null;

            const pop = spring({
              frame: local,
              fps,
              config: { damping: 13, stiffness: 170, mass: 0.7 },
              durationInFrames: CARD_IN,
            });
            const opacity = interpolate(local, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const rise = 24 * (1 - pop);
            const scale = 0.96 + 0.04 * pop;
            // Rim glow blooms as the card settles, then breathes with the pulse.
            const bloom = interpolate(local, [4, CARD_IN + 4], [0, 0.75], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const glowIntensity = Math.max(0, Math.min(1, bloom + idlePulse));

            return (
              <div
                key={card.n}
                style={{
                  ...baseCard,
                  boxShadow: `${String(baseCard.boxShadow)}, ${glassGlow(
                    t.glow,
                    18 * s,
                    glowIntensity,
                  )}`,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 20 * s,
                  opacity,
                  transform: `translateY(${rise}px) scale(${scale})`,
                  transformOrigin: side === "left" ? "left center" : "right center",
                }}
              >
                {/* Gold numbered chip — navy ink on gold. */}
                <div
                  aria-hidden
                  style={{
                    width: 52 * s,
                    height: 52 * s,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: t.accent,
                    color: t.inkOnLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 800,
                    fontSize: 26 * s,
                    boxShadow: `0 2px 12px ${withAlpha(t.glow, 0.35)}`,
                  }}
                >
                  {card.n}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4 * s,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_STACKS.sans,
                      fontWeight: 700,
                      fontSize: 30 * s,
                      lineHeight: 1.2,
                      color: t.inkOnGlass,
                    }}
                  >
                    {card.title}
                  </div>
                  {card.note ? (
                    <div
                      style={{
                        fontFamily: FONT_STACKS.sans,
                        fontWeight: 500,
                        fontSize: 21 * s,
                        lineHeight: 1.25,
                        color: withAlpha(t.inkOnGlass, 0.6),
                      }}
                    >
                      {card.note}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SidePanelCards;
