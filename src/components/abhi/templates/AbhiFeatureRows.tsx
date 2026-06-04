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
 * AbhiFeatureRows — abhishek.devini "feature-rows-list" replica (FOREGROUND only).
 *
 * The workhorse list/explainer scene: a left-aligned mono kicker + a two-tone
 * grotesk headline, then 3–5 stacked rounded "glass" rows. Each row carries an
 * accent monoline ICON in a small square (left), a bold title, and an accent
 * mono sub-caption. Rows cascade up one-by-one from their bottom edge.
 *
 * Renders TRANSPARENT over the shared AbhiBackground (mounted by AbhiScene9x16).
 * Canvas 1080×1920 @ 30fps. Spec measures are % of 720w → px = specPx×1.5.
 *
 * transitionVerb: "Headline slides left-in ~8f; rows cascade up one-by-one
 * bottom-edge ~6f each with ~5f stagger (3-card list lands ~33f), each scaling
 * 0.96→1 + fade; accent icon/border/✓ badge pops 2–3f after its row lands
 * (solution checks bloom green glow)."
 *
 * Ground-truth: DXhkSFiD8dL 22–30s ("Five jobs. One model." — 5 teal-icon rows).
 */

// Built-in monoline icon glyphs (self-contained SVG, no external assets).
const ICON_KEYS = [
  "code",
  "globe",
  "chart",
  "doc",
  "bolt",
  "check",
  "search",
  "gear",
  "spark",
  "alert",
] as const;
type IconKey = (typeof ICON_KEYS)[number];

const rowSchema = z.object({
  /** Monoline icon glyph drawn in the left square. */
  icon: z.enum(ICON_KEYS).default("spark"),
  /** Bold row title. */
  title: z.string().default(""),
  /** Accent mono sub-caption under the title. */
  caption: z.string().default(""),
  /** Valence drives border/icon tint: neutral=accent, bad=red, good=green (+✓ badge). */
  valence: z.enum(["neutral", "bad", "good"]).default("neutral"),
});

export const abhiFeatureRowsSchema = z.object({
  /** Background family this scene is composed over (informs ink colors). */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Single accent color (default = Anthropic orange). */
  accentColor: z.string().default("#FD9B00"),
  /** Mono UPPERCASE kicker (left-aligned). "" => use default. */
  kicker: z.string().default("WHAT IT'S BUILT TO DO"),
  /** Headline first clause (primary ink). */
  headline: z.string().default("Cinco trabajos."),
  /** Headline second clause (recolored to accent). "" => single-tone headline. */
  headlineAccent: z.string().default("Un modelo."),
  /** Stacked rows (3–5 ideal). */
  rows: z.array(rowSchema).default([
    { icon: "code", title: "Escribe y depura código", caption: "abre PRs, arregla tests", valence: "neutral" },
    { icon: "globe", title: "Investiga en la web", caption: "lee, cita, decide", valence: "neutral" },
    { icon: "chart", title: "Analiza datos", caption: "tablas, gráficas, infiere", valence: "neutral" },
    { icon: "doc", title: "Documentos y hojas", caption: "redacta, edita, formatea", valence: "neutral" },
    { icon: "bolt", title: "Opera el software", caption: "clics, escribe, navega", valence: "neutral" },
  ]),
});
export type AbhiFeatureRowsProps = z.infer<typeof abhiFeatureRowsSchema>;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const Icon: React.FC<{ icon: IconKey; color: string; size: number; strokePx: number }> = ({
  icon,
  color,
  size,
  strokePx,
}) => {
  // Thin clean line-icon look like the source: convert a target rendered px
  // stroke into the 24-unit viewBox (svg scales viewBox 24 → `size` px).
  const sw = (strokePx * 24) / size;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "code":
      // Two chevrons spread apart: < >
      return (
        <svg {...common}>
          <path d="M9 8 4 12l5 4M15 8l5 4-5 4" />
        </svg>
      );
    case "globe":
      // Circle + equator + meridian + two curved longitude arcs.
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.4" />
          <path d="M3.6 12h16.8" />
          <path d="M12 3.6v16.8" />
          <path d="M12 3.6c-3.1 2.4-3.1 14 0 16.8" />
          <path d="M12 3.6c3.1 2.4 3.1 14 0 16.8" />
        </svg>
      );
    case "chart":
      // L-shaped axis + 3 distinct vertical bars rising left→right.
      return (
        <svg {...common}>
          <path d="M5 4v15.5h15" />
          <rect x="8" y="13" width="2.4" height="6.5" rx="0.5" />
          <rect x="12.3" y="9.5" width="2.4" height="10" rx="0.5" />
          <rect x="16.6" y="6" width="2.4" height="13.5" rx="0.5" />
        </svg>
      );
    case "doc":
      // Page with folded top-right corner + 2 text lines.
      return (
        <svg {...common}>
          <path d="M7 3.5h7L18 7.5v13H7z" />
          <path d="M14 3.5V7.5h4" />
          <path d="M9.6 13h6.8M9.6 16h4.8" />
        </svg>
      );
    case "bolt":
      // Open lightning-bolt outline.
      return (
        <svg {...common}>
          <path d="M13 3 5.5 13.5H11L11 21l7.5-10.5H13z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6.4" />
          <path d="M15.3 15.3 20 20" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 4 3 19.5h18z" />
          <path d="M12 10v4.5" />
          <circle cx="12" cy="17.4" r="0.4" />
        </svg>
      );
  }
};

export const AbhiFeatureRows: React.FC<Partial<AbhiFeatureRowsProps>> = (props) => {
  const p = abhiFeatureRowsSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const dark = p.mode === "dark";

  // px helper: spec % of 720w → 1080 px.
  const PX = (specPctOf720: number) => (specPctOf720 / 100) * width;

  // Ink palette.
  const ink = dark ? "#F2F2F4" : "#0C0C12";
  const subInk = dark ? "#9A9AA0" : "#5A5A66";
  const goodColor = "#34D3A0";
  const badColor = "#F5553A";

  // ── Kicker (in first; fade + drop from y−16px over 6f; dot ignites over 4f). ──
  const kIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 6], [-16, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dotGlow = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });

  // ── Headline slides left-in ~8f (group rise + tint-sweep on accent). ──
  const hIn = interpolate(frame, [3, 12], [0, 1], { extrapolateRight: "clamp" });
  const hX = interpolate(frame, [3, 12], [-28, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // Accent clause tint-sweep white→accent L→R over ~8f after the line lands.
  const accentMix = interpolate(frame, [12, 20], [0, 1], { extrapolateRight: "clamp" });
  const accentInk = accentMix < 1 ? hexA(p.accentColor, 0.25 + 0.75 * accentMix) : p.accentColor;

  // ── Rows cascade: each ~6f rise + fade, ~5f stagger, starting after headline. ──
  const rows = p.rows.slice(0, 5);
  const ROW_START = 14;
  const STAGGER = 5;

  // Vertical layout: rows centered x50%, band y≈28%→73% of height.
  const rowW = PX(89.5); // ~90% of 720w
  const bandTop = height * 0.275;
  const bandBottom = height * 0.735;
  const gap = PX(2.6);
  const n = rows.length;
  const rowH = (bandBottom - bandTop - gap * (n - 1)) / n;

  const iconSquare = rowH * 0.6;
  const iconInner = iconSquare * 0.56;
  // Thin, recognizable line icons (round caps/joins) — ~2.4px rendered @ 1080w.
  const iconStrokePx = Math.max(2, PX(0.22));
  const titleSize = Math.min(rowH * 0.31, PX(4.4));
  const captionSize = titleSize * 0.5;

  const kickerSize = PX(2.0);
  const headlineSize = PX(5.6);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* ── Kicker (left x6%, y≈15%) ── */}
      <div
        style={{
          position: "absolute",
          left: PX(6),
          top: height * 0.152,
          display: "flex",
          alignItems: "center",
          gap: PX(1.4),
          opacity: kIn,
          transform: `translateY(${kY}px)`,
          fontFamily: FONT_STACKS.mono,
          fontWeight: 600,
          fontSize: kickerSize,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: subInk,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: kickerSize * 0.6,
            height: kickerSize * 0.6,
            borderRadius: "50%",
            background: p.accentColor,
            boxShadow: `0 0 ${kickerSize * 1.2 * dotGlow}px ${hexA(p.accentColor, 0.85 * dotGlow)}`,
          }}
        />
        <span style={{ color: p.accentColor }}>{p.kicker}</span>
      </div>

      {/* ── Two-tone headline (left x6%, y≈18.5%) ── */}
      <div
        style={{
          position: "absolute",
          left: PX(6),
          top: height * 0.178,
          right: PX(6),
          opacity: hIn,
          transform: `translateX(${hX}px)`,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: headlineSize,
          letterSpacing: "-0.02em",
          lineHeight: 0.98,
          color: ink,
        }}
      >
        <span>{p.headline}</span>
        {p.headlineAccent ? (
          <>
            {" "}
            <span style={{ color: accentInk }}>{p.headlineAccent}</span>
          </>
        ) : null}
      </div>

      {/* ── Stacked rows ── */}
      {rows.map((row, i) => {
        const start = ROW_START + i * STAGGER;
        const enter = spring({
          frame: frame - start,
          fps,
          config: { damping: 200, mass: 0.7, stiffness: 170 },
          durationInFrames: 12,
        });
        const rowOpacity = interpolate(frame - start, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rowScale = interpolate(enter, [0, 1], [0.96, 1]);
        const rowY = interpolate(enter, [0, 1], [rowH * 0.42, 0]);

        const accentForValence =
          row.valence === "bad" ? badColor : row.valence === "good" ? goodColor : p.accentColor;

        // Icon/border pops 2–3f after the row lands (overshoot 0.8→1.05→1).
        const badgeProg = spring({
          frame: frame - (start + 4),
          fps,
          config: { damping: 12, mass: 0.6, stiffness: 220 },
          durationInFrames: 10,
        });
        const badgeScale = interpolate(badgeProg, [0, 1], [0.8, 1]);

        // Good rows bloom a green glow around the icon square.
        const goodGlow =
          row.valence === "good"
            ? interpolate(frame - (start + 4), [0, 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

        const top = bandTop + i * (rowH + gap);

        // Surface fill: subtle slate glass (dark) / frosted (light), tinted by valence.
        const surfaceFill = dark
          ? row.valence === "bad"
            ? "linear-gradient(180deg, rgba(40,18,16,0.55), rgba(20,10,10,0.5))"
            : row.valence === "good"
              ? "linear-gradient(180deg, rgba(14,30,24,0.55), rgba(9,18,16,0.5))"
              : "linear-gradient(180deg, rgba(22,24,30,0.62), rgba(14,15,20,0.55))"
          : "rgba(255,255,255,0.82)";

        const borderColor =
          row.valence === "neutral"
            ? dark
              ? hexA("#FFFFFF", 0.06)
              : hexA("#0C0C12", 0.08)
            : hexA(accentForValence, dark ? 0.45 : 0.55);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (width - rowW) / 2,
              top,
              width: rowW,
              height: rowH,
              opacity: rowOpacity,
              transform: `translateY(${rowY}px) scale(${rowScale})`,
              transformOrigin: "center bottom",
              display: "flex",
              alignItems: "center",
              gap: PX(2.4),
              paddingLeft: rowH * 0.2,
              paddingRight: rowH * 0.2,
              borderRadius: PX(2.6),
              background: surfaceFill,
              border: `1px solid ${borderColor}`,
              boxShadow: dark
                ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 40px rgba(0,0,0,0.35)"
                : "0 12px 32px rgba(27,42,74,0.10)",
              backdropFilter: "blur(6px)",
            }}
          >
            {/* Icon square */}
            <div
              style={{
                position: "relative",
                width: iconSquare,
                height: iconSquare,
                flex: "0 0 auto",
                borderRadius: iconSquare * 0.26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: hexA(accentForValence, dark ? 0.12 : 0.14),
                border: `1px solid ${hexA(accentForValence, dark ? 0.5 : 0.55)}`,
                transform: `scale(${badgeScale})`,
                boxShadow:
                  goodGlow > 0
                    ? `0 0 ${iconSquare * 0.5 * goodGlow}px ${hexA(goodColor, 0.6 * goodGlow)}`
                    : "none",
              }}
            >
              <Icon
                icon={row.valence === "good" ? "check" : row.icon}
                color={accentForValence}
                size={iconInner}
                strokePx={iconStrokePx}
              />
            </div>

            {/* Title + caption */}
            <div style={{ display: "flex", flexDirection: "column", gap: rowH * 0.05, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 800,
                  fontSize: titleSize,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.02,
                  color: ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.title}
              </div>
              <div
                style={{
                  fontFamily: FONT_STACKS.mono,
                  fontWeight: 500,
                  fontSize: captionSize,
                  letterSpacing: "0.04em",
                  color: row.valence === "neutral" ? subInk : hexA(accentForValence, 0.95),
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.caption}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
