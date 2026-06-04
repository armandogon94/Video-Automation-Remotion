/**
 * AbhiBrandLockup — abhishek.devini "brand-lockup" FOREGROUND template (template #8).
 *
 * Giant two-line wordmark + spark/app icon + sub-label + GitHub repo/credit card.
 * The signature opener/closer of his tool reels (product intro / "introducing X" / outro
 * lockup). Renders TRANSPARENT over the shared AbhiBackground (dark-grid-glow OR
 * light-mesh) mounted separately by the host AbhiScene9x16 — only LOCAL card surfaces
 * are opaque here.
 *
 * Source ground-truth: DXpZf2ziBYP 5.5–9.5s ("HUASHU DESIGN." giant lockup + github
 * repo card). Two-line lockup: first line in primary ink, second line recolored accent
 * (including the terminal period). Kicker pill top-left, sub-label mono row, repo card
 * slides up from below at the bottom.
 *
 * Choreography (transitionVerb):
 *   - Spark/app icon scales 0→1 with a spoke/ray bloom over 8–10f (+ idle bob).
 *   - Lockup wordmark scales 0.9→1 + fades as one block over 8f; the accent line
 *     (line two, solid accent incl. its terminal period) drops in ~4f later.
 *   - Repo/credit card slides up from below +40px over 10f.
 *   - An accent glow pulse blooms behind ~14f (rendered by the bg; we add a faint
 *     local bloom too for self-containment).
 *
 * Canvas: 1080×1920 @ 30fps. STYLE-SPEC measures are % of 720w → px = specPct/100*1080
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

/** Sentinel for "use the mode-derived default" without zod reflection. */
const AUTO = "";

export const abhiBrandLockupSchema = z.object({
  /** Background family this foreground sits on (drives ink + surfaces). */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Single accent color (Anthropic orange default). */
  accentColor: z.string().default("#FD9B00"),

  /** Kicker pill text (mono UPPERCASE). The leading dot is rendered separately. */
  kicker: z.string().default("NEW · OPEN SOURCE"),
  /** Kicker lead glyph: "dot" (●) or "star" (★). */
  kickerGlyph: z.enum(["dot", "star"]).default("star"),

  /** Spark / app icon style. "burst" = Anthropic radiating spokes; "tile" = rounded
   *  app square w/ asterisk; "none" = omit (let the wordmark lead). */
  iconStyle: z.enum(["burst", "tile", "none"]).default("burst"),

  /** Two-line lockup. Line 2 is recolored to accent (incl. its terminal period). */
  lineOne: z.string().default("HUASHU"),
  lineTwo: z.string().default("DESIGN."),

  /** Mono sub-label row under the wordmark (UPPERCASE). "" hides it. */
  subLabel: z.string().default("A CLAUDE CODE SKILL · DEVINI LABS"),

  /** Repo / credit card. */
  showRepoCard: z.boolean().default(true),
  repoOwnerSlash: z.string().default("alchaincyf/huashu-design"),
  /** Left chip — accent-dotted "just dropped" status. */
  repoChipPrimary: z.string().default("JUST DROPPED"),
  /** Right chip — license / secondary note. */
  repoChipSecondary: z.string().default("Personal use license"),

  /** Override ink (headline) color; AUTO → mode default. */
  inkColor: z.string().default(AUTO),
  /** Override muted (label) color; AUTO → mode default. */
  mutedColor: z.string().default(AUTO),
});
export type AbhiBrandLockupProps = z.infer<typeof abhiBrandLockupSchema>;

// ── helpers ──────────────────────────────────────────────────────────────────
const PX = (specPctOf720: number): number => (specPctOf720 / 100) * 1080;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiBrandLockup: React.FC<Partial<AbhiBrandLockupProps>> = (props) => {
  const p = abhiBrandLockupSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isDark = p.mode === "dark";
  const ink =
    p.inkColor !== AUTO ? p.inkColor : isDark ? "#F2F2F4" : "#0C0C12";
  const muted =
    p.mutedColor !== AUTO ? p.mutedColor : isDark ? "#8A8A90" : "#5A5A66";
  const accent = p.accentColor;

  // Surface colors for local card / pill chrome (the only opaque elements).
  const pillFill = isDark ? hexA("#2D1413", 0.55) : hexA("#FFFFFF", 0.72);
  const pillBorder = hexA(accent, isDark ? 0.5 : 0.35);
  const cardFill = isDark ? "#13141B" : hexA("#FFFFFF", 0.82);
  const cardBorder = isDark ? hexA("#FFFFFF", 0.08) : hexA("#1B2A4A", 0.1);
  const chipFill = isDark ? hexA("#1B1C24", 0.9) : hexA("#FFFFFF", 0.7);

  // Layout (left-aligned lockup, x≈6%).
  const LEFT = PX(6); // ≈ 65px

  // ── timing ──────────────────────────────────────────────────────────────────
  // Spark icon: scale 0→1 with spoke bloom over ~9f.
  const iconSpring = spring({ frame, fps, config: { damping: 12, mass: 0.7 }, durationInFrames: 12 });
  const iconScale = interpolate(iconSpring, [0, 1], [0, 1]);
  const iconBob = Math.sin((frame / (fps * 2.4)) * Math.PI * 2) * 4; // idle bob ±4px
  const rayBloom = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Kicker pill: fade + drop from y−16px over 6f (lead element).
  const kickerIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerY = interpolate(frame, [0, 6], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dotGlow = interpolate(frame, [2, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line one: wordmark scales 0.9→1 + fades as one block over 8f (starts ~f6).
  const L1_START = 6;
  const l1Spring = spring({
    frame: frame - L1_START,
    fps,
    config: { damping: 14, mass: 0.8 },
    durationInFrames: 14,
  });
  const l1Scale = interpolate(l1Spring, [0, 1], [0.9, 1]);
  const l1Op = interpolate(frame, [L1_START, L1_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const l1Y = interpolate(l1Spring, [0, 1], [18, 0]);

  // Line two (accent): drops in ~4f later as a solid accent block (matches source —
  // "DESIGN." is fully orange incl. its terminal period from the moment it appears).
  const L2_START = L1_START + 4;
  const l2Spring = spring({
    frame: frame - L2_START,
    fps,
    config: { damping: 14, mass: 0.8 },
    durationInFrames: 14,
  });
  const l2Scale = interpolate(l2Spring, [0, 1], [0.9, 1]);
  const l2Op = interpolate(frame, [L2_START, L2_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const l2Y = interpolate(l2Spring, [0, 1], [18, 0]);

  // Sub-label fades up under the wordmark ~4f after line two.
  const SUB_START = L2_START + 6;
  const subIn = interpolate(frame, [SUB_START, SUB_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [SUB_START, SUB_START + 6], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Repo card: slides up from below +40px over 10f, starting after the wordmark.
  const CARD_START = L2_START + 10;
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 16, mass: 0.9 },
    durationInFrames: 16,
  });
  const cardY = interpolate(cardSpring, [0, 1], [PX(2.6), 0]); // +40px@720 → ~60px
  const cardOp = interpolate(frame, [CARD_START, CARD_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Chips pop in 3f after card lands (slight overshoot).
  const CHIP_START = CARD_START + 8;
  const chipSpring = spring({
    frame: frame - CHIP_START,
    fps,
    config: { damping: 11, mass: 0.6 },
    durationInFrames: 12,
  });
  const chipScale = interpolate(chipSpring, [0, 1], [0.7, 1]);

  // Local accent glow bloom behind the wordmark (~14f, self-contained supplement
  // to the bg's glow). Breathes after bloom.
  const bloomIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bloomBreathe = 1 + 0.04 * Math.sin((frame / (fps * 1.6)) * Math.PI * 2);

  // ── sizes (spec %s of 720 → px×1.5) ──────────────────────────────────────────
  const headlinePxRaw = PX(15.5); // ≈ 14–22% cap-height → render fontSize ~16% → ~250px
  // Auto-fit: shrink to keep the LONGEST wordmark line inside ~92% of frame width
  // (Inter-Black avg glyph advance ≈ 0.60·fontSize). Short words (HUASHU/DESIGN.)
  // stay big; long ones (INTELIGENCIA) shrink to fit instead of clipping.
  const longestChars = Math.max(p.lineOne.length, p.lineTwo.length, 1);
  const headlinePx = Math.min(headlinePxRaw, (1080 * 0.92) / (longestChars * 0.6));
  const kickerPx = PX(2.0); // ≈ 14px@720 → 21px
  const subPx = PX(1.9);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontKerning: "normal" }}>
      {/* local accent glow bloom behind the wordmark */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${Math.round(
            width * 0.42 * bloomBreathe
          )}px at ${LEFT + PX(20)}px ${height * 0.33}px, ${hexA(
            accent,
            (isDark ? 0.18 : 0.1) * bloomIn
          )} 0%, transparent 60%)`,
        }}
      />

      {/* ── KICKER PILL (top-left, y≈17%) ── */}
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: height * 0.17,
          opacity: kickerIn,
          transform: `translateY(${kickerY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: PX(1.1),
          padding: `${PX(1.0)}px ${PX(1.9)}px`,
          borderRadius: 999,
          background: pillFill,
          border: `1px solid ${pillBorder}`,
          backdropFilter: "blur(6px)",
        }}
      >
        <span
          style={{
            width: PX(0.85),
            height: PX(0.85),
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 ${PX(1.4) * dotGlow}px ${PX(0.7) * dotGlow}px ${hexA(
              accent,
              0.8 * dotGlow
            )}`,
            ...(p.kickerGlyph === "star"
              ? {
                  // star: render via clip-path on the accent square
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  borderRadius: 0,
                  width: PX(1.0),
                  height: PX(1.0),
                }
              : {}),
          }}
        />
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: kickerPx,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: ink,
            whiteSpace: "nowrap",
          }}
        >
          {p.kicker}
        </span>
      </div>

      {/* ── SPARK / APP ICON (left, above wordmark) ── */}
      {p.iconStyle !== "none" ? (
        <div
          style={{
            position: "absolute",
            left: LEFT,
            top: height * 0.23 + iconBob,
            width: PX(11),
            height: PX(11),
            transform: `scale(${iconScale})`,
            transformOrigin: "left center",
          }}
        >
          {p.iconStyle === "burst" ? (
            <BurstGlyph size={PX(11)} accent={accent} bloom={rayBloom} />
          ) : (
            <div
              style={{
                width: PX(11),
                height: PX(11),
                borderRadius: PX(2.6),
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 ${PX(1.2)}px ${PX(4)}px ${hexA(accent, 0.45)}`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 900,
                  fontSize: PX(6),
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                ✳
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* ── GIANT TWO-LINE LOCKUP WORDMARK (left, y≈30–46%) ── */}
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: height * (p.iconStyle === "none" ? 0.28 : 0.31),
          right: PX(4),
        }}
      >
        {/* line one — primary ink */}
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: headlinePx,
            letterSpacing: "-0.02em",
            lineHeight: 0.98,
            color: ink,
            opacity: l1Op,
            transform: `translateY(${l1Y}px) scale(${l1Scale})`,
            transformOrigin: "left top",
            whiteSpace: "pre",
          }}
        >
          {p.lineOne}
        </div>
        {/* line two — solid accent (incl. terminal period), always readable.
            NOTE: previously this used a background-clip:text gradient "tint sweep"
            which Chromium (Remotion's renderer) rendered as an opaque accent
            RECTANGLE over the glyphs, hiding line two. Solid accent text matches
            the source ("DESIGN." is fully orange) and removes that failure mode. */}
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 900,
            fontSize: headlinePx,
            letterSpacing: "-0.02em",
            lineHeight: 0.98,
            opacity: l2Op,
            transform: `translateY(${l2Y}px) scale(${l2Scale})`,
            transformOrigin: "left top",
            whiteSpace: "pre",
            color: accent,
          }}
        >
          {p.lineTwo}
        </div>

        {/* ── SUB-LABEL mono row ── */}
        {p.subLabel ? (
          <div
            style={{
              marginTop: PX(2.0),
              opacity: subIn,
              transform: `translateY(${subY}px)`,
              fontFamily: FONT_STACKS.mono,
              fontSize: subPx,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: muted,
              whiteSpace: "nowrap",
            }}
          >
            {p.subLabel}
          </div>
        ) : null}
      </div>

      {/* ── REPO / CREDIT CARD (bottom, y≈68%) ── */}
      {p.showRepoCard ? (
        <div
          style={{
            position: "absolute",
            left: LEFT,
            right: LEFT,
            top: height * 0.65,
            opacity: cardOp,
            transform: `translateY(${cardY}px)`,
            background: cardFill,
            border: `1px solid ${cardBorder}`,
            borderRadius: PX(2.6),
            padding: `${PX(2.6)}px ${PX(3.0)}px`,
            backdropFilter: "blur(8px)",
            boxShadow: isDark
              ? `0 ${PX(2)}px ${PX(6)}px ${hexA("#000000", 0.35)}`
              : `0 ${PX(2)}px ${PX(6)}px ${hexA("#1B2A4A", 0.12)}`,
            display: "flex",
            flexDirection: "column",
            gap: PX(1.8),
          }}
        >
          {/* tiny host crumb */}
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontSize: PX(1.3),
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            github.com
          </div>
          {/* owner/repo row with GitHub mark */}
          <div style={{ display: "flex", alignItems: "center", gap: PX(1.6) }}>
            <GitHubMark size={PX(4.2)} color={ink} />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontSize: PX(2.4),
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: ink,
                whiteSpace: "nowrap",
              }}
            >
              {p.repoOwnerSlash}
            </span>
          </div>
          {/* chip row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: PX(1.6),
              transform: `scale(${chipScale})`,
              transformOrigin: "left center",
            }}
          >
            {p.repoChipPrimary ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: PX(0.9),
                  padding: `${PX(0.7)}px ${PX(1.4)}px`,
                  borderRadius: 999,
                  background: hexA(accent, isDark ? 0.16 : 0.14),
                  border: `1px solid ${hexA(accent, 0.45)}`,
                }}
              >
                <span
                  style={{
                    width: PX(0.7),
                    height: PX(0.7),
                    borderRadius: 999,
                    background: accent,
                    boxShadow: `0 0 ${PX(1.0)}px ${hexA(accent, 0.8)}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontSize: PX(1.4),
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: isDark ? accent : "#0C0C12",
                  }}
                >
                  {p.repoChipPrimary}
                </span>
              </span>
            ) : null}
            {p.repoChipSecondary ? (
              <span
                style={{
                  padding: `${PX(0.7)}px ${PX(1.4)}px`,
                  borderRadius: 999,
                  background: chipFill,
                  border: `1px solid ${cardBorder}`,
                  fontFamily: FONT_STACKS.mono,
                  fontSize: PX(1.4),
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: muted,
                  whiteSpace: "nowrap",
                }}
              >
                {p.repoChipSecondary}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── Anthropic-style radiating burst glyph (pure SVG, draws rays from center) ──
const BurstGlyph: React.FC<{ size: number; accent: string; bloom: number }> = ({
  size,
  accent,
  bloom,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const rays = 12;
  const inner = size * 0.12;
  const outer = size * 0.46 * bloom;
  const strokeW = size * 0.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="burstGlow">
          <stop offset="0%" stopColor={accent} stopOpacity={0.55 * bloom} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={size * 0.46} fill="url(#burstGlow)" />
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * inner;
        const y1 = cy + Math.sin(a) * inner;
        const x2 = cx + Math.cos(a) * outer;
        const y2 = cy + Math.sin(a) * outer;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={inner * 0.9} fill={accent} />
    </svg>
  );
};

// ── GitHub mark (pure SVG path, octocat silhouette simplified) ──
const GitHubMark: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);
