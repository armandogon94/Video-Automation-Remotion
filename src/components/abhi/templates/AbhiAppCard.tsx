/**
 * AbhiAppCard — abhishek.devini "app-card" FOREGROUND template.
 *
 * A single app / product card: a rounded-square GRADIENT app icon (with a small
 * face glyph) scale-pops in inside concentric ring halos that pulse outward, then
 * the app NAME + one-line DESCRIPTION rise under it, and a small CTA / PRICE chip
 * pops in last. Optional floating "notification" chips (e.g. "thinking…",
 * "cooking up vibes") slide in beside the icon — the signature "playful UX /
 * it talks back" beat.
 *
 * FOREGROUND ONLY — the shared AbhiBackground (light-mesh OR dark-grid-glow) is
 * mounted separately by the host AbhiScene9x16, so this renders TRANSPARENT over
 * it. Only LOCAL surfaces (icon tile, name/desc card, chips) are drawn here.
 *
 * Source ground-truth: DXwq6HYoogv 40–47s (LIGHT-mesh, "07 — PLAYFUL UX" /
 * "while it thinks, it talks back." — centered multicolor gradient app icon with
 * a smiley face, concentric ring pulse, "thinking…" + "cooking up vibes" chips).
 * Sampled icon gradient: warm peach #FFAC7C → periwinkle #90AED3 → soft pink
 * #ECD6E4; light-mesh base #E5DFE8; near-black ink #0B0D11.
 *
 * Choreography (frames @30fps, scene-relative from frame 0, then HOLD):
 *   • Kicker pill — fade + drop from y−16px over f1–6; accent dot ignites f4.
 *   • App icon — scale 0→1 with a 1.08 overshoot over ~8f (starts ~f6).
 *   • Concentric rings — pulse outward (scale 0.6→1.6 + fade) over ~12f, looping.
 *   • Name — rises +18px + fades ~6f, ~f16.
 *   • Description — rises +14px + fades ~6f, ~f22.
 *   • CTA / price chip — pops scale 0.8→1 (1.06 overshoot) ~6f, ~f28 (LAST).
 *   • Notification chips — slide up +24px with a small bounce, staggered ~f20+.
 *
 * Canvas 1080×1920 @ 30fps. STYLE-SPEC measures are % of 720w → px = pct/100*1080
 * (i.e. spec-px-at-720 × 1.5). Self-contained: only react / remotion / zod / brand.
 */
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

/** Sentinel for "caller did not override" (no zod .shape/_def reflection). */
const AUTO = "";

const chipSchema = z.object({
  /** Chip label text. */
  text: z.string().default(""),
  /** Vertical placement relative to the icon: "above" or "below". */
  side: z.enum(["above", "below"]).default("below"),
  /** Horizontal nudge as % of width from icon center (−40..40). */
  offsetXPct: z.number().default(0),
  /** Reveal start frame (added on top of the base chip start). */
  delay: z.number().default(0),
});

export const abhiAppCardSchema = z.object({
  /** Background family this foreground sits on (drives ink + surfaces). */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Single accent color (Anthropic orange default; topic-tracked otherwise). */
  accentColor: z.string().default("#FD9B00"),

  /** Mono kicker pill, UPPERCASE. "" hides it. */
  kicker: z.string().default("07 — PLAYFUL UX"),
  /** Kicker lead glyph: dot (●) or star (★). */
  kickerGlyph: z.enum(["dot", "star"]).default("dot"),
  /** Layout for kicker + headline: CENTER (hero card) or LEFT (section). */
  align: z.enum(["center", "left"]).default("center"),

  /** Optional two-tone headline above the card. "" hides it. */
  headlinePre: z.string().default("while it thinks,"),
  /** The accent-recolored clause of the headline. "" → no accent split. */
  headlineAccent: z.string().default("it talks back."),

  /** App / product name shown under the icon. */
  appName: z.string().default("Aura"),
  /** One-line description below the name. */
  appDesc: z.string().default("A tiny AI companion that lives in your dock."),

  /** Small CTA / price chip text (e.g. "Get it", "Free", "$4 / mo"). "" hides. */
  ctaText: z.string().default("Get it free"),
  /** CTA chip style: "solid" (accent fill) or "outline" (accent hairline). */
  ctaStyle: z.enum(["solid", "outline"]).default("solid"),

  /** Icon face glyph: "smile" (peeking smiley), "spark" (asterisk), "none". */
  iconFace: z.enum(["smile", "spark", "none"]).default("smile"),
  /** Icon gradient stops (3). Defaults match the sampled source icon. */
  iconColorA: z.string().default("#FFAC7C"),
  iconColorB: z.string().default("#C9A9E6"),
  iconColorC: z.string().default("#A8D3C2"),

  /** Floating notification chips around the icon (decorative). */
  notifications: z.array(chipSchema).default([
    { text: "thinking…", side: "above", offsetXPct: 18, delay: 0 },
    { text: "cooking up vibes", side: "below", offsetXPct: -16, delay: 8 },
  ]),

  /** Override ink (headline / name) color; AUTO → mode default. */
  inkColor: z.string().default(AUTO),
  /** Override muted (desc / kicker) color; AUTO → mode default. */
  mutedColor: z.string().default(AUTO),
});
export type AbhiAppCardProps = z.infer<typeof abhiAppCardSchema>;
type ChipProps = z.infer<typeof chipSchema>;

// ── helpers ──────────────────────────────────────────────────────────────────
const PX = (specPctOf720: number): number => (specPctOf720 / 100) * 1080;

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

export const AbhiAppCard: React.FC<Partial<AbhiAppCardProps>> = (props) => {
  const p = abhiAppCardSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isDark = p.mode === "dark";
  const accent = p.accentColor;
  const centered = p.align === "center";

  const ink =
    p.inkColor.trim() !== AUTO ? p.inkColor : isDark ? "#F2F2F4" : "#0C0C12";
  const muted =
    p.mutedColor.trim() !== AUTO
      ? p.mutedColor
      : isDark
        ? "#9A9AA0"
        : "#5A5A66";

  const hasKicker = p.kicker.trim() !== "";
  const hasHeadline =
    p.headlinePre.trim() !== "" || p.headlineAccent.trim() !== "";
  const hasCta = p.ctaText.trim() !== "";

  // ── Geometry ───────────────────────────────────────────────────────────────
  const iconSize = PX(20); // 20% of 720 → 216px tile
  const iconRadius = iconSize * 0.26; // app-icon "squircle" corner
  const cx = width / 2;
  // Icon centered a touch below mid so the headline sits above it.
  const iconCy = height * 0.5;

  // ── Kicker pill: fade + drop from y−16px over f1–6, dot ignites f4 ──
  const kickerSp = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 130 },
    durationInFrames: 6,
  });
  const kickerY = interpolate(kickerSp, [0, 1], [-PX(2.2), 0]);
  const kickerOpacity = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Headline: pre rises ~f4, accent clause ~f10 ──
  const headPreSp = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const headAccSp = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });

  // ── App icon: scale 0→1 with overshoot ~8f (starts f6) ──
  const ICON_START = 6;
  const iconSp = spring({
    frame: frame - ICON_START,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 130 }, // bouncy overshoot
    durationInFrames: 18,
  });
  const iconScale = interpolate(iconSp, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
  });
  const iconOpacity = interpolate(frame, [ICON_START, ICON_START + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Idle bob after it lands.
  const iconBob = Math.sin((frame / 30) * Math.PI * 2) * PX(0.5);

  // ── Concentric ring pulse: scale 0.6→1.6 + fade, ~12f loop ──
  const RING_START = ICON_START + 4;
  const RING_PERIOD = 26;
  const ringPhase = (t: number) =>
    ((frame - RING_START - t) % RING_PERIOD) / RING_PERIOD;

  // ── Name: rise +18px + fade ~6f, f16 ──
  const NAME_START = 16;
  const nameSp = spring({
    frame: frame - NAME_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const nameY = interpolate(nameSp, [0, 1], [PX(1.7), 0]);
  const nameOpacity = interpolate(frame, [NAME_START, NAME_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Description: rise +14px + fade ~6f, f22 ──
  const DESC_START = 22;
  const descSp = spring({
    frame: frame - DESC_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const descY = interpolate(descSp, [0, 1], [PX(1.3), 0]);
  const descOpacity = interpolate(frame, [DESC_START, DESC_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── CTA / price chip: pop scale 0.8→1 with 1.06 overshoot ~6f, f28 (LAST) ──
  const CTA_START = 28;
  const ctaSp = spring({
    frame: frame - CTA_START,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 150 },
    durationInFrames: 14,
  });
  const ctaScale = interpolate(ctaSp, [0, 1], [0.8, 1], {
    extrapolateLeft: "clamp",
  });
  const ctaOpacity = interpolate(frame, [CTA_START, CTA_START + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Surfaces ────────────────────────────────────────────────────────────────
  const chipSurface = isDark
    ? "rgba(24,26,33,0.86)"
    : "rgba(255,255,255,0.82)";
  const chipBorder = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(12,12,18,0.06)";
  const chipText = isDark ? "#C8C8CC" : "#3A3A44";

  const pillBg = isDark ? "rgba(51,28,6,0.55)" : "rgba(255,255,255,0.78)";
  const pillBorder = isDark
    ? `1px solid ${hexA(accent, 0.45)}`
    : "1px solid rgba(12,12,18,0.07)";

  const kickerPx = PX(2.0);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Top: kicker + headline column ── */}
      <div
        style={{
          position: "absolute",
          top: PX(13),
          left: centered ? 0 : PX(6.5),
          right: centered ? 0 : PX(6),
          display: "flex",
          flexDirection: "column",
          alignItems: centered ? "center" : "flex-start",
          textAlign: centered ? "center" : "left",
          gap: PX(2.4),
        }}
      >
        {hasKicker && (
          <div
            style={{
              transform: `translateY(${kickerY}px)`,
              opacity: kickerOpacity,
              display: "inline-flex",
              alignItems: "center",
              gap: kickerPx * 0.55,
              padding: `${kickerPx * 0.6}px ${kickerPx * 0.95}px`,
              borderRadius: 999,
              background: pillBg,
              border: pillBorder,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {p.kickerGlyph === "star" ? (
              <StarGlyph size={kickerPx * 0.62} color={accent} glow={dotGlow} />
            ) : (
              <span
                style={{
                  width: kickerPx * 0.5,
                  height: kickerPx * 0.5,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 ${6 + dotGlow * 10}px ${hexA(
                    accent,
                    0.4 + dotGlow * 0.5,
                  )}`,
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: kickerPx,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: muted,
                whiteSpace: "nowrap",
              }}
            >
              {p.kicker}
            </span>
          </div>
        )}

        {hasHeadline && (
          <h1
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: PX(8.2),
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: centered ? "84%" : "92%",
              overflowWrap: "break-word",
            }}
          >
            {p.headlinePre.trim() !== "" && (
              <span
                style={{
                  display: "block",
                  color: muted,
                  fontWeight: 700,
                  fontSize: PX(5.4),
                  letterSpacing: "-0.01em",
                  opacity: headPreSp,
                  transform: `translateY(${interpolate(
                    headPreSp,
                    [0, 1],
                    [PX(1.6), 0],
                  )}px)`,
                }}
              >
                {p.headlinePre}
              </span>
            )}
            {p.headlineAccent.trim() !== "" && (
              <span
                style={{
                  display: "block",
                  color: ink,
                  opacity: headAccSp,
                  transform: `translateY(${interpolate(
                    headAccSp,
                    [0, 1],
                    [PX(1.8), 0],
                  )}px)`,
                }}
              >
                {p.headlineAccent}
              </span>
            )}
          </h1>
        )}
      </div>

      {/* ── Concentric ring pulse behind the icon ── */}
      {[0, 9, 18].map((delay, i) => {
        const ph = ringPhase(delay);
        const active = frame >= RING_START + delay;
        const ringScale = 0.55 + ph * 1.15;
        const ringOpacity = active
          ? interpolate(ph, [0, 0.15, 1], [0, 0.16, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx,
              top: iconCy + iconBob,
              width: iconSize * 1.5,
              height: iconSize * 1.5,
              marginLeft: -(iconSize * 1.5) / 2,
              marginTop: -(iconSize * 1.5) / 2,
              borderRadius: "50%",
              border: `${PX(0.22)}px solid ${hexA(accent, 0.4)}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
            }}
          />
        );
      })}

      {/* ── App icon tile ── */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: iconCy + iconBob,
          width: iconSize,
          height: iconSize,
          marginLeft: -iconSize / 2,
          marginTop: -iconSize / 2,
          opacity: iconOpacity,
          transform: `scale(${iconScale})`,
        }}
      >
        {/* soft accent bloom under the tile */}
        <div
          style={{
            position: "absolute",
            inset: `-${iconSize * 0.35}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hexA(
              accent,
              0.28,
            )} 0%, rgba(0,0,0,0) 65%)`,
            filter: `blur(${PX(2.5)}px)`,
          }}
        />
        <AppIconTile
          size={iconSize}
          radius={iconRadius}
          a={p.iconColorA}
          b={p.iconColorB}
          c={p.iconColorC}
          face={p.iconFace}
        />
      </div>

      {/* ── Notification chips around the icon ── */}
      {p.notifications.map((chip, i) => (
        <NotificationChip
          key={i}
          chip={chip}
          frame={frame}
          fps={fps}
          cx={cx}
          iconCy={iconCy + iconBob}
          iconSize={iconSize}
          width={width}
          surface={chipSurface}
          border={chipBorder}
          textColor={chipText}
          accent={accent}
          baseStart={20}
        />
      ))}

      {/* ── Name + description + CTA below the icon ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: iconCy + iconSize * 0.78,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: PX(1.5),
          padding: `0 ${PX(8)}px`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: PX(6.0),
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            color: ink,
            opacity: nameOpacity,
            transform: `translateY(${nameY}px)`,
          }}
        >
          {p.appName}
        </div>

        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: PX(3.0),
            lineHeight: 1.3,
            color: muted,
            maxWidth: "82%",
            opacity: descOpacity,
            transform: `translateY(${descY}px)`,
          }}
        >
          {p.appDesc}
        </div>

        {hasCta && (
          <div
            style={{
              marginTop: PX(1.4),
              opacity: ctaOpacity,
              transform: `scale(${ctaScale})`,
              display: "inline-flex",
              alignItems: "center",
              gap: PX(1.0),
              padding: `${PX(1.5)}px ${PX(3.4)}px`,
              borderRadius: 999,
              background:
                p.ctaStyle === "solid" ? accent : hexA(accent, 0.1),
              border:
                p.ctaStyle === "solid"
                  ? "none"
                  : `${PX(0.22)}px solid ${hexA(accent, 0.6)}`,
              boxShadow:
                p.ctaStyle === "solid"
                  ? `0 ${PX(1.4)}px ${PX(3.6)}px ${hexA(accent, 0.4)}`
                  : "none",
            }}
          >
            <span
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 800,
                fontSize: PX(2.9),
                letterSpacing: "-0.01em",
                color:
                  p.ctaStyle === "solid"
                    ? pickCtaInk(accent)
                    : accent,
              }}
            >
              {p.ctaText}
            </span>
            <ArrowGlyph
              size={PX(2.4)}
              color={p.ctaStyle === "solid" ? pickCtaInk(accent) : accent}
            />
          </div>
        )}
      </div>

      {/* ── Persistent handle footer (signature lockup) ── */}
      <div
        style={{
          position: "absolute",
          bottom: PX(3.4),
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(frame, [10, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: PX(1.7),
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: muted,
            display: "inline-flex",
            alignItems: "center",
            gap: PX(1.0),
          }}
        >
          <span
            style={{
              width: PX(0.9),
              height: PX(0.9),
              borderRadius: "50%",
              background: accent,
            }}
          />
          @abhishek.devini
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

const AppIconTile: React.FC<{
  size: number;
  radius: number;
  a: string;
  b: string;
  c: string;
  face: "smile" | "spark" | "none";
}> = ({ size, radius, a, b, c, face }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      background: `linear-gradient(135deg, ${a} 0%, ${b} 52%, ${c} 100%)`,
      boxShadow: `inset 0 ${size * 0.02}px ${size * 0.05}px rgba(255,255,255,0.45), 0 ${
        size * 0.06
      }px ${size * 0.16}px rgba(20,16,28,0.22)`,
      overflow: "hidden",
    }}
  >
    {/* glossy top sheen */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 46%)",
      }}
    />
    {/* soft radial color blob for depth */}
    <div
      style={{
        position: "absolute",
        left: "58%",
        top: "30%",
        width: "70%",
        height: "70%",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${withAlpha(b, 0.6)} 0%, rgba(0,0,0,0) 60%)`,
        filter: `blur(${size * 0.04}px)`,
      }}
    />
    {face === "smile" && (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* two dot eyes + a simple smile */}
        <circle cx="40" cy="46" r="5.2" fill="#2A2233" />
        <circle cx="62" cy="46" r="5.2" fill="#2A2233" />
        <path
          d="M38 60 Q50 72 64 60"
          stroke="#2A2233"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    )}
    {face === "spark" && (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d="M50 26 L54 46 L74 50 L54 54 L50 74 L46 54 L26 50 L46 46 Z"
          fill="#FFFFFF"
        />
      </svg>
    )}
  </div>
);

const NotificationChip: React.FC<{
  chip: ChipProps;
  frame: number;
  fps: number;
  cx: number;
  iconCy: number;
  iconSize: number;
  width: number;
  surface: string;
  border: string;
  textColor: string;
  accent: string;
  baseStart: number;
}> = ({
  chip,
  frame,
  fps,
  cx,
  iconCy,
  iconSize,
  width,
  surface,
  border,
  textColor,
  accent,
  baseStart,
}) => {
  if (chip.text.trim() === "") return null;
  const start = baseStart + chip.delay;
  // slide up +24px with a small bounce
  const sp = spring({
    frame: frame - start,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 140 },
    durationInFrames: 14,
  });
  const ty = interpolate(sp, [0, 1], [PX(2.2), 0], {
    extrapolateLeft: "clamp",
  });
  const op = interpolate(frame, [start, start + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // continuous gentle bob once settled
  const bob = Math.sin((frame / 30) * Math.PI * 2 + chip.delay) * PX(0.4);

  const xCenter = cx + (chip.offsetXPct / 100) * width;
  const yCenter =
    chip.side === "above"
      ? iconCy - iconSize * 0.7
      : iconCy + iconSize * 0.7;

  return (
    <div
      style={{
        position: "absolute",
        left: xCenter,
        top: yCenter,
        transform: `translate(-50%, calc(-50% + ${ty + bob}px))`,
        opacity: op,
        display: "inline-flex",
        alignItems: "center",
        gap: PX(0.9),
        padding: `${PX(1.0)}px ${PX(2.0)}px`,
        borderRadius: 999,
        background: surface,
        border: `${PX(0.18)}px solid ${border}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `0 ${PX(0.9)}px ${PX(2.4)}px rgba(20,16,28,0.14)`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: PX(0.8),
          height: PX(0.8),
          borderRadius: "50%",
          background: accent,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: PX(2.2),
          letterSpacing: "-0.005em",
          color: textColor,
        }}
      >
        {chip.text}
      </span>
    </div>
  );
};

const StarGlyph: React.FC<{ size: number; color: string; glow: number }> = ({
  size,
  color,
  glow,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      flexShrink: 0,
      filter: `drop-shadow(0 0 ${2 + glow * 6}px ${hexA(color, 0.5 + glow * 0.4)})`,
    }}
  >
    <path
      d="M12 2 L13.3 9.4 L20.7 8.1 L14.6 12.6 L17.9 19.5 L12 15 L6.1 19.5 L9.4 12.6 L3.3 8.1 L10.7 9.4 Z"
      fill={color}
    />
  </svg>
);

const ArrowGlyph: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8 H12 M8.5 4.5 L12.5 8 L8.5 11.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── small helpers ─────────────────────────────────────────────────────────────

/** Add alpha to a #RRGGBB hex; falls back gracefully on a bad value. */
function withAlpha(hex: string, a: number): string {
  return hexA(hex, a);
}

/** Pick a readable ink color (near-black vs off-white) for text on the accent
 *  fill, using perceived luminance of the accent. */
function pickCtaInk(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "#0C0C12";
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#0C0C12" : "#FFFFFF";
}
