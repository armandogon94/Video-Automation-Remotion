import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/**
 * AbhiGridVsTerminal — abhishek.devini "grid-vs-terminal" split-comparison scene
 * (template #7). FOREGROUND ONLY: renders transparent over the host-mounted
 * AbhiBackground (dark-grid-glow OR light-mesh). Two side-by-side blocks —
 * LEFT a light/grid GUI card, RIGHT a dark terminal/log card — with a circular
 * accent "VS" badge floating between them.
 *
 * Ground truth: DXpZf2ziBYP 72–86s ("Replace it fully? Probably not." — cream
 * GUI card vs dark terminal card + orange VS badge).
 *
 * Choreography (transitionVerb):
 *  - Headline builds word-group by word-group (~12f).
 *  - Two solid placeholder squares slide up from below (~10f), then cross-fade
 *    their contents in (left→GUI grid, right→terminal text) over ~12f.
 *  - Circular accent VS badge pops scale 0→1 + slight rotate at ~f10.
 *  - Mono labels type under each (~6f); the terminal command types char-by-char.
 *
 * Canvas 1080×1920 @ 30fps. STYLE-SPEC measures are % of 720w → px = specPx×1.5.
 */

const PX = 1.5; // STYLE-SPEC authored at 720w; canvas is 1080w.

export const abhiGridVsTerminalSchema = z.object({
  /** Single accent color (default Anthropic orange). Recolors prompt/VS/badge. */
  accentColor: z.string().default("#FD9B00"),
  /** "dark" tunes inks for the dark-grid-glow bg; "light" for light-mesh. */
  mode: z.enum(["dark", "light"]).default("dark"),

  /** Mono UPPERCASE kicker (no leading dot — dot is drawn when `kickerDot`). */
  kicker: z.string().default("THE HONEST TAKE"),
  /** Draw the accent dot inside the kicker pill. Source's "honest take" beat
   *  has NO dot — set false to match it. */
  kickerDot: z.boolean().default(true),

  /** Two-tone headline. First clause = primary ink, second = de-emphasis/accent. */
  headlineLead: z.string().default("¿Reemplazarlo del todo?"),
  headlineTail: z.string().default("Probablemente no."),
  /** "accent" recolors the tail to accentColor; "muted" greys it (default). */
  tailStyle: z.enum(["accent", "muted"]).default("muted"),

  /** LEFT (light/GUI) card. */
  leftLabel: z.string().default("CLAUDE DESIGN · GUI"),
  leftChips: z.array(z.string()).default(["click", "draw", "comment"]),
  leftCaption: z.string().default("gana en click · draw · comment"),

  /** RIGHT (dark terminal) card. */
  rightLabel: z.string().default("HUASHU · TERMINAL"),
  rightCrumb: z.string().default("~/proyectos · zsh"),
  /** Command that types in after the prompt ">". */
  rightCommand: z.string().default("diseña una landing page"),
  /** Log lines that reveal after the command (grey). */
  rightLogs: z.array(z.string()).default([
    "[planeando] eligiendo variante…",
    "[generando] 3 direcciones en paralelo",
  ]),
  /** Final green success line (prefixed ✓). */
  rightSuccess: z.string().default("entregado en 4m 18s"),
  /** Accent bottom caption under the terminal. */
  rightCaption: z.string().default("cierra la brecha rápido."),

  /** Circular VS badge text. Empty "" hides it. */
  vsBadge: z.string().default("VS"),

  /**
   * Global two-tone caption that fades in BELOW both cards (the source's
   * "But if you live in your terminal — / this thing closes the gap fast."
   * line). First clause = primary ink, second clause = accent. "" hides it.
   */
  bottomLead: z.string().default(""),
  bottomTail: z.string().default(""),
});

export type AbhiGridVsTerminalProps = z.infer<typeof abhiGridVsTerminalSchema>;

// ── color helpers ──────────────────────────────────────────────────────────
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiGridVsTerminal: React.FC<Partial<AbhiGridVsTerminalProps>> = (
  props,
) => {
  const p = abhiGridVsTerminalSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const inkMuted = isDark ? "#8A8A90" : "#5A5A66";
  const tailColor = p.tailStyle === "accent" ? p.accentColor : inkMuted;
  const greenOk = "#42AE66";

  // ── Layout — explicit pixel geometry measured against the 720-source (×1.5) ──
  const cardTop = Math.round(440 * PX); // y≈34% → 660
  const cardW = Math.round(303 * PX); // each card ~42% wide → 454
  const cardH = Math.round(370 * PX); // ~29% tall → 555
  const leftX = Math.round(40 * PX); // x≈5.5% → 60
  const rightX = Math.round(372 * PX); // x≈51.6% → 558
  const cardRadius = Math.round(18 * PX);

  // ── Kicker (mono pill) — in first: fade + drop from y−16px over 6f ──────
  const kickerT = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerY = (1 - kickerT) * -16 * PX;
  const dotGlow = interpolate(frame, [2, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Headline: two clauses rise +18px, ~6f each, settle by ~f20 ─────────
  const headRise = (start: number) => {
    const s = spring({
      frame: frame - start,
      fps,
      config: { damping: 200, stiffness: 170, mass: 0.7 },
      durationInFrames: 14,
    });
    return {
      opacity: interpolate(s, [0, 1], [0, 1]),
      translateY: (1 - s) * 18 * PX,
    };
  };
  const leadH = headRise(4);
  const tailH = headRise(10);

  // ── Cards: placeholder squares slide up from below ~10f, then content
  //    cross-fades in over ~12f. Stagger left→right by 4f. ────────────────
  const cardStart = 18;
  const cardEnter = (delay: number) =>
    spring({
      frame: frame - (cardStart + delay),
      fps,
      config: { damping: 200, stiffness: 150, mass: 0.9 },
      durationInFrames: 12,
    });
  const leftS = cardEnter(0);
  const rightS = cardEnter(4);

  // content cross-fade starts once each card has mostly risen
  const leftContentFade = interpolate(frame, [cardStart + 8, cardStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightContentFade = interpolate(frame, [cardStart + 12, cardStart + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── VS badge: pops scale 0→1 + slight rotate at ~f10 (after cards rise) ──
  const vsStart = cardStart + 10;
  const vsS = spring({
    frame: frame - vsStart,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
    durationInFrames: 14,
  });
  const vsScale = interpolate(vsS, [0, 1], [0, 1]);
  const vsRotate = (1 - vsS) * -28; // settles from -28° → 0
  const vsPulse =
    1 + 0.04 * Math.sin(((frame - vsStart) / (fps * 1.4)) * Math.PI * 2);

  // ── Terminal type-on: command types ~1 char / 2.5f after content cross-fade ─
  const cmdStart = cardStart + 22;
  const cmdChars = Math.max(
    0,
    Math.min(
      p.rightCommand.length,
      Math.floor((frame - cmdStart) / 2.5),
    ),
  );
  const cmdDone = cmdChars >= p.rightCommand.length;
  const cmdEndFrame = cmdStart + p.rightCommand.length * 2.5;
  const caretOn = Math.floor(frame / 8) % 2 === 0; // ~15f blink cycle

  // log lines reveal ~5f/row after command finishes
  const logStart = cmdEndFrame + 4;
  const logRevealed = (i: number) =>
    frame >= logStart + i * 6
      ? interpolate(
          frame,
          [logStart + i * 6, logStart + i * 6 + 5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 0;
  const successStart = logStart + p.rightLogs.length * 6 + 2;
  const successFade = interpolate(frame, [successStart, successStart + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // bottom captions fade up after their card content
  const leftCapFade = interpolate(frame, [cardStart + 20, cardStart + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightCapFade = interpolate(frame, [successStart + 4, successStart + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // global bottom two-tone caption fades up after both cards have settled
  const bottomCapFade = interpolate(frame, [successStart + 10, successStart + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Shared text styles ─────────────────────────────────────────────────
  const monoLabel: React.CSSProperties = {
    fontFamily: FONT_STACKS.mono,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
  };
  const headFont: React.CSSProperties = {
    fontFamily: FONT_STACKS.sans,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    lineHeight: 0.98,
  };

  // light-card surface tokens
  const lightFill = "#FAF7FA";
  const lightInk = "#1A1A1A";
  const lightInkMuted = "#7A7580";

  // terminal tokens
  const termFill = "#0E1117";
  const termHeader = "#13141B";
  const termBorder = hexA("#FFFFFF", 0.06);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── KICKER PILL (mono, accent dot) — left x≈5.5% ── */}
      <div
        style={{
          position: "absolute",
          left: leftX,
          top: Math.round(186 * PX),
          transform: `translateY(${kickerY}px)`,
          opacity: kickerT,
          display: "inline-flex",
          alignItems: "center",
          gap: 9 * PX,
          padding: `${8 * PX}px ${15 * PX}px`,
          borderRadius: 999,
          background: isDark ? hexA("#221C24", 0.85) : hexA("#FFFFFF", 0.85),
          border: `1px solid ${isDark ? hexA("#FFFFFF", 0.1) : hexA("#0C0C12", 0.08)}`,
        }}
      >
        {p.kickerDot && (
          <span
            style={{
              width: 7 * PX,
              height: 7 * PX,
              borderRadius: 999,
              background: p.accentColor,
              boxShadow: `0 0 ${8 * PX * dotGlow}px ${hexA(p.accentColor, 0.9 * dotGlow)}`,
            }}
          />
        )}
        <span
          style={{
            ...monoLabel,
            fontSize: 14 * PX,
            color: isDark ? "#C8C8CC" : "#3A3A44",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ── HEADLINE (two-tone) — left x≈5.5%, y≈19% ── */}
      <div
        style={{
          position: "absolute",
          left: leftX,
          top: Math.round(232 * PX),
          width: Math.round(640 * PX),
          ...headFont,
          fontSize: 58 * PX,
          color: ink,
        }}
      >
        <span
          style={{
            display: "inline",
            opacity: leadH.opacity,
            transform: `translateY(${leadH.translateY}px)`,
          }}
        >
          {p.headlineLead}{" "}
        </span>
        <span
          style={{
            display: "inline",
            color: tailColor,
            opacity: tailH.opacity,
            transform: `translateY(${tailH.translateY}px)`,
          }}
        >
          {p.headlineTail}
        </span>
      </div>

      {/* ── LEFT CARD: light / GUI ── */}
      <div
        style={{
          position: "absolute",
          left: leftX,
          top: cardTop,
          width: cardW,
          height: cardH,
          borderRadius: cardRadius,
          background: lightFill,
          border: `1px solid ${hexA("#FFFFFF", 0.5)}`,
          boxShadow: `0 ${20 * PX}px ${56 * PX}px ${hexA("#000000", 0.35)}`,
          opacity: interpolate(leftS, [0, 1], [0, 1]),
          transform: `translateY(${(1 - leftS) * 46 * PX}px) scale(${interpolate(leftS, [0, 1], [0.95, 1])})`,
          overflow: "hidden",
          padding: `${18 * PX}px ${18 * PX}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...monoLabel,
            fontSize: 11 * PX,
            color: lightInkMuted,
            letterSpacing: "0.16em",
          }}
        >
          {p.leftLabel}
        </div>

        {/* tag chips */}
        <div style={{ display: "flex", gap: 8 * PX, marginTop: 13 * PX }}>
          {p.leftChips.map((c, i) => (
            <span
              key={i}
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: 11 * PX,
                color: "#3A3A40",
                background: "#ECE8EC",
                padding: `${5 * PX}px ${10 * PX}px`,
                borderRadius: 7 * PX,
                letterSpacing: "0.04em",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        {/* GUI mock surface (content cross-fades in) */}
        <div
          style={{
            marginTop: 16 * PX,
            height: 162 * PX,
            borderRadius: 10 * PX,
            background: "#FFFFFF",
            boxShadow: `inset 0 0 0 1px ${hexA("#000000", 0.05)}`,
            position: "relative",
            opacity: leftContentFade,
            overflow: "hidden",
          }}
        >
          {/* orange tile */}
          <div
            style={{
              position: "absolute",
              left: 24 * PX,
              top: 26 * PX,
              width: 58 * PX,
              height: 50 * PX,
              borderRadius: 10 * PX,
              background: p.accentColor,
            }}
          />
          {/* dark window over it (chat/comment bubble) */}
          <div
            style={{
              position: "absolute",
              left: 60 * PX,
              top: 44 * PX,
              width: 78 * PX,
              height: 44 * PX,
              borderRadius: 9 * PX,
              background: "#33302F",
            }}
          />
          {/* comment-bubble tail at the window's bottom-left */}
          <div
            style={{
              position: "absolute",
              left: 66 * PX,
              top: 84 * PX,
              width: 11 * PX,
              height: 11 * PX,
              background: "#33302F",
              transform: "rotate(45deg)",
              borderRadius: 2 * PX,
            }}
          />
          {/* grey text lines */}
          <div
            style={{
              position: "absolute",
              left: 24 * PX,
              top: 104 * PX,
              width: 150 * PX,
              height: 5 * PX,
              borderRadius: 99,
              background: "#C9C4CC",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 24 * PX,
              top: 118 * PX,
              width: 110 * PX,
              height: 5 * PX,
              borderRadius: 99,
              background: "#D9D5DC",
            }}
          />
        </div>

        {/* bottom caption */}
        <div
          style={{
            position: "absolute",
            left: 18 * PX,
            bottom: 18 * PX,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: 14 * PX,
            color: lightInk,
            opacity: leftCapFade,
          }}
        >
          {p.leftCaption}
        </div>
      </div>

      {/* ── RIGHT CARD: dark terminal ── */}
      <div
        style={{
          position: "absolute",
          left: rightX,
          top: cardTop,
          width: cardW,
          height: cardH,
          borderRadius: cardRadius,
          background: termFill,
          border: `1px solid ${termBorder}`,
          boxShadow: `0 ${20 * PX}px ${56 * PX}px ${hexA("#000000", 0.45)}`,
          opacity: interpolate(rightS, [0, 1], [0, 1]),
          transform: `translateY(${(1 - rightS) * 46 * PX}px) scale(${interpolate(rightS, [0, 1], [0.95, 1])})`,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* header band */}
        <div
          style={{
            ...monoLabel,
            fontSize: 11 * PX,
            color: p.accentColor,
            letterSpacing: "0.16em",
            padding: `${15 * PX}px ${18 * PX}px ${12 * PX}px`,
            background: termHeader,
            borderBottom: `1px solid ${termBorder}`,
          }}
        >
          {p.rightLabel}
        </div>

        {/* terminal body (content cross-fades in) */}
        <div
          style={{
            padding: `${16 * PX}px ${18 * PX}px`,
            fontFamily: FONT_STACKS.mono,
            fontSize: 13 * PX,
            lineHeight: 1.55,
            opacity: rightContentFade,
          }}
        >
          {/* crumb */}
          <div style={{ color: "#6E6E78", fontWeight: 500 }}>{p.rightCrumb}</div>

          {/* prompt + typed command */}
          <div style={{ color: "#D8D8DE", fontWeight: 500, marginTop: 4 * PX }}>
            <span style={{ color: p.accentColor, fontWeight: 700 }}>{"> "}</span>
            {p.rightCommand.slice(0, cmdChars)}
            {!cmdDone && caretOn ? (
              <span
                style={{
                  display: "inline-block",
                  width: 8 * PX,
                  height: 15 * PX,
                  marginLeft: 1,
                  transform: "translateY(2px)",
                  background: p.accentColor,
                }}
              />
            ) : null}
          </div>

          {/* log lines */}
          {p.rightLogs.map((line, i) => (
            <div
              key={i}
              style={{
                color: "#7E7E88",
                fontWeight: 500,
                marginTop: 4 * PX,
                opacity: logRevealed(i),
              }}
            >
              {line}
            </div>
          ))}

          {/* success line */}
          <div
            style={{
              color: greenOk,
              fontWeight: 700,
              marginTop: 6 * PX,
              opacity: successFade,
            }}
          >
            {"✓ "}
            {p.rightSuccess}
          </div>
        </div>

        {/* bottom accent caption */}
        <div
          style={{
            position: "absolute",
            left: 18 * PX,
            bottom: 18 * PX,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: 14 * PX,
            color: p.accentColor,
            opacity: rightCapFade,
          }}
        >
          {p.rightCaption}
        </div>
      </div>

      {/* ── VS BADGE (circular accent) — centered between cards ── */}
      {p.vsBadge !== "" ? (
        <div
          style={{
            position: "absolute",
            left: leftX + cardW + Math.round((rightX - (leftX + cardW)) / 2),
            top: cardTop + Math.round(cardH * 0.46),
            width: 56 * PX,
            height: 56 * PX,
            marginLeft: -28 * PX,
            marginTop: -28 * PX,
            borderRadius: 999,
            background: "#100B07",
            border: `2px solid ${p.accentColor}`,
            boxShadow: `0 0 ${22 * PX}px ${hexA(p.accentColor, 0.55)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(vsS, [0, 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `scale(${vsScale * vsPulse}) rotate(${vsRotate}deg)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 700,
              fontSize: 17 * PX,
              letterSpacing: "0.06em",
              color: p.accentColor,
            }}
          >
            {p.vsBadge}
          </span>
        </div>
      ) : null}

      {/* ── GLOBAL BOTTOM CAPTION (two-tone) — below both cards, fades + rises ── */}
      {p.bottomLead !== "" || p.bottomTail !== "" ? (
        <div
          style={{
            position: "absolute",
            left: leftX,
            top: cardTop + cardH + Math.round(42 * PX),
            width: Math.round(640 * PX),
            fontFamily: FONT_STACKS.sans,
            fontWeight: 800,
            fontSize: 30 * PX,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            opacity: bottomCapFade,
            transform: `translateY(${(1 - bottomCapFade) * 14 * PX}px)`,
          }}
        >
          {p.bottomLead !== "" ? (
            <span style={{ color: ink }}>{p.bottomLead}</span>
          ) : null}
          {p.bottomLead !== "" && p.bottomTail !== "" ? <br /> : null}
          {p.bottomTail !== "" ? (
            <span style={{ color: p.accentColor }}>{p.bottomTail}</span>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
