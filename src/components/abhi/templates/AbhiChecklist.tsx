import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/**
 * AbhiChecklist — abhishek.devini "checklist-typeon" replica (FOREGROUND only).
 *
 * A glass/frosted "lint result" card: a mono kicker pill leads, a two-tone
 * grotesk headline lands, then the card scales up and a mono header crumb +
 * status chip type/pop in. Below, checklist rows reveal ONE AT A TIME from the
 * left, each with a round ✓ (good) / ✗ (bad) badge that POPS with a slight
 * overshoot ~3f AFTER its row text lands — the signature "staged build" beat.
 *
 * Renders TRANSPARENT over the shared AbhiBackground (mounted by AbhiScene9x16);
 * only LOCAL card/badge surfaces are drawn — NO full-screen background.
 *
 * Canvas 1080×1920 @ 30fps. STYLE-SPEC measures are % of 720w → px = pct/100×1080.
 *
 * transitionVerb: "Kicker fades+drops 6f; headline rises + accent word
 * tint-sweeps L→R ~8f; the card scales 0.96→1 + fades up 10–12f; the header
 * crumb + status chip pop after it lands; checklist rows then reveal one-by-one
 * (~5f stagger), each row sliding in from −x and fading, and its ✓/✗ badge
 * popping 3f later with a 0.7→1.08→1 overshoot + a soft valence-colored glow."
 *
 * Ground-truth: DYUcj5iPAxL 32–37s (LIGHT, "● LINT" + "Catches breaks before you
 * ever hit post." + frosted `/REELSTACK-LINT SRC/LAUNCH.TSX · ALL CLEAN` card with
 * green ✓ rows). Sampled hexes: check green #11C295, lavender accent #BA94FF.
 */

// "" sentinel = "caller did not override" (Zod v4 — never reflect .shape/_def).
const S = "";

const itemSchema = z.object({
  /** Row label text (auto-fits to the card width; wraps if needed). */
  text: z.string().default(""),
  /** Valence drives the badge: good = ✓ green/gold, bad = ✗ red/orange. */
  valence: z.enum(["good", "bad"]).default("good"),
});

export const abhiChecklistSchema = z.object({
  /** Background family this scene sits over — drives ink + card surface colors. */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Single accent color (default = Anthropic orange). */
  accentColor: z.string().default("#FD9B00"),
  /** Mono UPPERCASE kicker pill, e.g. "● LINT" / "THE CHECKLIST". */
  kicker: z.string().default("LINT"),
  /** Headline first clause (primary ink). */
  headline: z.string().default("Catches breaks before"),
  /** Headline trailing clause whose accent word recolors. "" => single line. */
  headlineTail: z.string().default("you ever hit"),
  /** The ONE accent-recolored word that ends the headline (tint-sweeps in). */
  headlineAccent: z.string().default("post."),
  /**
   * "bare" drops the frosted card chrome (border/fill/shadow + header bar) so the
   * rows sit directly on the background — matches the source's card-less variant
   * (dark teal "Trust the loop." checklist). "card" keeps the lint-card chrome.
   */
  surface: z.enum(["card", "bare"]).default("card"),
  /**
   * Header/row alignment: "center" (lint-card variant) or "left" (the source's
   * numbered-steps "Trust the loop." variant — kicker + headline hug the left).
   */
  align: z.enum(["center", "left"]).default("center"),
  /**
   * Row badge style: "check" = ✓/✗ disc (lint variant); "number" = thin-ring
   * step circle with an index (01,02…) joined by a vertical connector — the
   * source's staged-steps look. In "number" mode only the FIRST row is fully lit;
   * later rows dim (the "you are here" highlight).
   */
  badgeStyle: z.enum(["check", "number"]).default("check"),
  /** Mono crumb shown in the card header (filename / path). */
  cardCrumb: z.string().default("/reelstack-lint src/launch.tsx"),
  /** Mono status chip text on the right of the header (e.g. "ALL CLEAN"). */
  statusText: z.string().default("ALL CLEAN"),
  /**
   * Status chip valence: "good" => green/accent chip, "bad" => red/orange chip
   * (e.g. "3 ERRORS"). Independent of per-row valence.
   */
  statusValence: z.enum(["good", "bad"]).default("good"),
  /** Color used for ✓ good badges + ALL-CLEAN chip (sampled #11C295). */
  goodColor: z.string().default("#11C295"),
  /** Color used for ✗ bad badges + error chip. */
  badColor: z.string().default("#F5553A"),
  /** Checklist rows (3–6 ideal). Each reveals one-by-one. */
  items: z
    .array(itemSchema)
    .default([
      { text: "Safe zones (top 290 / bottom 422)", valence: "good" },
      { text: "Motion floor ≥ 4 layers", valence: "good" },
      { text: "Hero counter ≤ 256px font", valence: "good" },
      { text: "BEATS sourced from whisper SRT", valence: "good" },
      { text: "Audio duration matches durationInFrames", valence: "good" },
    ]),
});

export type AbhiChecklistProps = z.infer<typeof abhiChecklistSchema>;

/** #RRGGBB + alpha → rgba(). Falls back to Anthropic orange on bad input. */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(253,155,0,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

/** Round ✓ badge (filled disc + white check). */
const CheckBadge: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path
      d="M6.5 12.4 L10.3 16 L17.4 8.2"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/** Round ✗ badge (filled disc + white cross). */
const CrossBadge: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path
      d="M8.2 8.2 L15.8 15.8 M15.8 8.2 L8.2 15.8"
      stroke="#FFFFFF"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Thin-ring step badge with a 2-digit index (01, 02…). */
const NumberBadge: React.FC<{
  size: number;
  index: number;
  ringColor: string;
  textColor: string;
  fill: string;
}> = ({ size, index, ringColor, textColor, fill }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `${Math.max(1.5, size * 0.045)}px solid ${ringColor}`,
      background: fill,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
    }}
  >
    <span
      style={{
        fontFamily: FONT_STACKS.mono,
        fontWeight: 600,
        fontSize: size * 0.3,
        letterSpacing: "0.04em",
        color: textColor,
      }}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  </div>
);

export const AbhiChecklist: React.FC<Partial<AbhiChecklistProps>> = (props) => {
  const p = abhiChecklistSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const dark = p.mode === "dark";

  // px helper: STYLE-SPEC % of 720w → px on this 1080-wide canvas.
  const PX = (specPctOf720: number) => (specPctOf720 / 100) * width;

  // ── Ink palette ──
  const ink = dark ? "#F2F2F4" : "#0C0C12";
  const subInk = dark ? "#9A9AA0" : "#5A5A66";
  const accent = p.accentColor;

  const items = p.items.slice(0, 6);
  const n = Math.max(1, items.length);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  //   f0–6    kicker pill fades + drops from y−16px, accent dot ignites
  //   f3–12   headline rises (translateX) + accent word tint-sweeps L→R ~8f
  //   f10–22  card scales 0.96→1 + fades up (rise from +28px)
  //   f20–    header crumb + status chip pop after card lands
  //   f24+    rows reveal one-by-one (~5f stagger), each slide-in + fade,
  //           its ✓/✗ badge pops 3f later (0.7→1.08→1 overshoot + glow)
  // ============================================================

  // ── Kicker pill ──
  const kIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 6], [-16, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dotGlow = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });

  // ── Headline rise + accent tint-sweep ──
  const hIn = interpolate(frame, [3, 12], [0, 1], { extrapolateRight: "clamp" });
  const hY = interpolate(frame, [3, 12], [22, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Accent word clip-reveal sweep white→accent L→R over ~8f after headline lands.
  const SWEEP_START = 12;
  const sweep = interpolate(frame, [SWEEP_START, SWEEP_START + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Card entrance ──
  const CARD_START = 10;
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120 },
    durationInFrames: 12,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardOpacity = cardSpring;
  const cardRise = interpolate(cardSpring, [0, 1], [PX(2.6), 0]);

  // ── Header crumb + status chip pop after card lands ──
  const HEADER_START = CARD_START + 10;
  const headerIn = interpolate(frame, [HEADER_START, HEADER_START + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statusPop = spring({
    frame: frame - (HEADER_START + 3),
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 220 },
    durationInFrames: 9,
  });
  const statusScale = interpolate(statusPop, [0, 1], [0.7, 1]);

  // ── Rows reveal one-by-one ──
  const ROW_START = HEADER_START + 6;
  const ROW_STAGGER = 5; // ~5f/row (a touch slower than the ~3f data-table spec)
  const BADGE_DELAY = 3; // ✓/✗ pops 3f after its row text lands

  // ── Geometry: card centered x50% (lint variant) OR hugging the left (steps) ──
  const leftVariant = p.align === "left";
  const cardW = leftVariant ? width - 2 * PX(6) : PX(85); // full-ish width for steps
  const cardLeft = leftVariant ? PX(6) : (width - cardW) / 2;
  const headerH = PX(7);
  // Steps variant: taller rows, no side padding (rows hug the left), tighter gap.
  const rowGap = leftVariant ? PX(1.6) : PX(0.6);
  const rowPadX = leftVariant ? 0 : PX(3.2);
  const rowH = leftVariant ? PX(9.6) : PX(8.4);
  const cardBodyPadTop = leftVariant ? 0 : PX(2.2);
  const cardBodyPadBottom = leftVariant ? 0 : PX(2.6);
  // Header band only contributes height when it is actually shown.
  const headerBand = p.surface === "bare" ? 0 : headerH;
  const cardH = headerBand + cardBodyPadTop + cardBodyPadBottom + n * rowH + (n - 1) * rowGap;
  // Lint variant anchors the card lower-middle; steps variant starts higher so the
  // numbered list begins just under the headline (source ≈ 28% height).
  const cardTop = leftVariant
    ? height * 0.285
    : Math.min(height * 0.46, height - cardH - height * 0.12);

  // ── Type sizes ──
  const kickerSize = PX(2.0);
  const headlineSize = PX(6.2);
  const crumbSize = PX(1.85);
  const statusSize = PX(1.85);
  const rowTextSize = leftVariant ? PX(4.4) : PX(2.5);
  const badgeSize = leftVariant ? PX(5.6) : PX(3.6);

  // ── Card surface (DARK slate-glass / LIGHT frosted white) ──
  const bare = p.surface === "bare";
  const showHeader = !bare && (p.cardCrumb.trim() !== S || p.statusText.trim() !== S);
  const cardFill = bare
    ? "transparent"
    : dark
      ? "linear-gradient(180deg, rgba(22,24,30,0.78), rgba(14,15,20,0.72))"
      : "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(247,244,250,0.80))";
  const cardBorder = bare
    ? "transparent"
    : dark
      ? hexA("#FFFFFF", 0.08)
      : hexA("#0C0C12", 0.06);
  const headerBorder = dark ? hexA("#FFFFFF", 0.07) : hexA("#0C0C12", 0.07);
  const cardShadow = bare
    ? "none"
    : dark
      ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 ${PX(2.6)}px ${PX(7)}px rgba(0,0,0,0.5)`
      : `inset 0 1px 0 rgba(255,255,255,0.7), 0 ${PX(2.4)}px ${PX(6.5)}px rgba(40,30,60,0.14)`;

  const statusColor = p.statusValence === "bad" ? p.badColor : p.goodColor;

  const leftAlign = p.align === "left";
  const numberMode = p.badgeStyle === "number";
  const sideMargin = PX(6); // left/right text margin for the left-aligned variant

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* ── Kicker (pill when centered; plain mono caps when left-aligned) ── */}
      <div
        style={{
          position: "absolute",
          top: leftAlign ? height * 0.135 : height * 0.165,
          left: leftAlign ? sideMargin : 0,
          right: leftAlign ? sideMargin : 0,
          display: "flex",
          justifyContent: leftAlign ? "flex-start" : "center",
          opacity: kIn,
          transform: `translateY(${kY}px)`,
        }}
      >
        {leftAlign ? (
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: kickerSize,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: accent,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: PX(1.2),
            padding: `${PX(1.0)}px ${PX(2.0)}px`,
            borderRadius: 999,
            background: dark ? hexA(accent, 0.1) : "rgba(255,255,255,0.85)",
            border: dark
              ? `1px solid ${hexA(accent, 0.45)}`
              : `1px solid ${hexA("#0C0C12", 0.08)}`,
            boxShadow: dark
              ? `0 0 ${PX(3) * dotGlow}px ${hexA(accent, 0.2 * dotGlow)}`
              : `0 ${PX(0.8)}px ${PX(2.2)}px rgba(40,30,60,0.10)`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              width: kickerSize * 0.55,
              height: kickerSize * 0.55,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 ${kickerSize * 1.1 * dotGlow}px ${hexA(accent, 0.85 * dotGlow)}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: kickerSize,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: dark ? accent : subInk,
              whiteSpace: "nowrap",
            }}
          >
            {p.kicker}
          </span>
        </div>
        )}
      </div>

      {/* ── Two-tone headline (centered, or left-aligned for the steps variant) ── */}
      <div
        style={{
          position: "absolute",
          top: leftAlign ? height * 0.175 : height * 0.215,
          left: leftAlign ? sideMargin : PX(6),
          right: leftAlign ? sideMargin : PX(6),
          textAlign: leftAlign ? "left" : "center",
          opacity: hIn,
          transform: `translateY(${hY}px)`,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: headlineSize,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          color: ink,
        }}
      >
        <span>{p.headline}</span>
        {p.headlineTail.trim() !== S ? (
          <>
            {" "}
            <span>{p.headlineTail}</span>
          </>
        ) : null}
        {p.headlineAccent.trim() !== S ? (
          <>
            {" "}
            {/* Accent word: ink copy with accent copy clip-wiping over it L→R. */}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ color: ink }}>{p.headlineAccent}</span>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  color: accent,
                  clipPath: `inset(0 ${100 - sweep}% 0 0)`,
                }}
              >
                {p.headlineAccent}
              </span>
            </span>
          </>
        ) : null}
      </div>

      {/* ── Checklist card ── */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          opacity: cardOpacity,
          transform: `translateY(${cardRise}px) scale(${cardScale})`,
          transformOrigin: "50% 30%",
          borderRadius: PX(2.6),
          background: cardFill,
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
          backdropFilter: bare ? "none" : "blur(14px)",
          WebkitBackdropFilter: bare ? "none" : "blur(14px)",
          overflow: "hidden",
        }}
      >
        {/* Header: crumb (left) + status chip (right) */}
        {showHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: PX(2),
            height: headerH,
            padding: `0 ${rowPadX}px`,
            borderBottom: `1px solid ${headerBorder}`,
            opacity: headerIn,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: crumbSize,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: subInk,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {p.cardCrumb}
          </span>
          {p.statusText.trim() !== S ? (
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 700,
                fontSize: statusSize,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: statusColor,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transform: `scale(${statusScale})`,
                transformOrigin: "right center",
              }}
            >
              {p.statusText}
            </span>
          ) : null}
        </div>
        )}

        {/* Body: checklist rows */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: rowGap,
            padding: `${cardBodyPadTop}px ${rowPadX}px ${cardBodyPadBottom}px`,
          }}
        >
          {/* Number-steps variant: vertical connector "spine" joining the step
              circles (source's "Trust the loop." timeline). Centered on the badge
              column; grows downward as the rows reveal, brighter near the active
              (top) step and dimming below. Sits BEHIND the badges. */}
          {numberMode && n > 1
            ? (() => {
                const lineX = rowPadX + badgeSize / 2;
                // Connector runs from the first badge center to the last badge center.
                const firstCenter = cardBodyPadTop + rowH / 2;
                const fullSpan = (n - 1) * (rowH + rowGap);
                // Grow in sync with the row reveal (each row ~ROW_STAGGER apart),
                // finishing just after the last row's badge lands.
                const grow = interpolate(
                  frame,
                  [ROW_START, ROW_START + (n - 1) * ROW_STAGGER + BADGE_DELAY + 6],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                return (
                  <div
                    style={{
                      position: "absolute",
                      left: lineX - 1,
                      top: firstCenter,
                      width: 2,
                      height: fullSpan * grow,
                      borderRadius: 2,
                      background: `linear-gradient(180deg, ${hexA(accent, 0.55)} 0%, ${hexA(ink, 0.18)} 22%, ${hexA(ink, 0.14)} 100%)`,
                      zIndex: 0,
                    }}
                  />
                );
              })()
            : null}
          {items.map((it, i) => {
            const start = ROW_START + i * ROW_STAGGER;

            // Row text: slide-in from −x + fade over ~6f.
            const rowProg = spring({
              frame: frame - start,
              fps,
              config: { damping: 200, mass: 0.6, stiffness: 170 },
              durationInFrames: 8,
            });
            const rowX = interpolate(rowProg, [0, 1], [-PX(2.4), 0]);
            const rowOpacity = interpolate(frame - start, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            // Badge pops BADGE_DELAY frames after the row text lands, with a
            // 0.7→1.08→1 overshoot (the signature "✓ popping" beat).
            const badgeProg = spring({
              frame: frame - (start + BADGE_DELAY),
              fps,
              config: { damping: 9, mass: 0.5, stiffness: 240 },
              durationInFrames: 12,
            });
            const badgeScale = interpolate(badgeProg, [0, 1], [0.7, 1]);
            const badgeGlow = interpolate(frame - (start + BADGE_DELAY), [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const isBad = it.valence === "bad";
            const badgeColor = isBad ? p.badColor : p.goodColor;

            // Number-steps variant: only the FIRST step is "active" (full ink +
            // teal ring); later steps dim (the "you are here" highlight).
            const isActiveStep = i === 0;
            const stepRing = numberMode
              ? isActiveStep
                ? accent
                : hexA(ink, 0.22)
              : badgeColor;
            const stepNumColor = numberMode
              ? isActiveStep
                ? accent
                : hexA(ink, 0.4)
              : ink;
            const labelColor = numberMode
              ? isActiveStep
                ? ink
                : hexA(ink, 0.34)
              : ink;

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: leftVariant ? PX(2.6) : PX(2),
                  height: rowH,
                  opacity: rowOpacity,
                  transform: `translateX(${rowX}px)`,
                }}
              >
                {/* Badge: ✓/✗ disc (lint) OR thin-ring numbered step (steps) */}
                <div
                  style={{
                    width: badgeSize,
                    height: badgeSize,
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transform: `scale(${badgeScale})`,
                    boxShadow:
                      badgeGlow > 0 && (!numberMode || isActiveStep)
                        ? `0 0 ${badgeSize * 0.55 * badgeGlow}px ${hexA(stepRing, 0.5 * badgeGlow)}`
                        : "none",
                  }}
                >
                  {numberMode ? (
                    <NumberBadge
                      size={badgeSize}
                      index={i}
                      ringColor={stepRing}
                      textColor={stepNumColor}
                      fill="#0A0B10"
                    />
                  ) : isBad ? (
                    <CrossBadge size={badgeSize} color={badgeColor} />
                  ) : (
                    <CheckBadge size={badgeSize} color={badgeColor} />
                  )}
                </div>

                {/* Row label — mono (lint) OR bold grotesk (steps). Auto-wraps. */}
                <span
                  style={{
                    fontFamily: numberMode ? FONT_STACKS.sans : FONT_STACKS.mono,
                    fontWeight: numberMode ? 800 : 500,
                    fontSize: rowTextSize,
                    letterSpacing: numberMode ? "-0.02em" : "0.01em",
                    lineHeight: 1.1,
                    color: labelColor,
                    minWidth: 0,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {it.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
