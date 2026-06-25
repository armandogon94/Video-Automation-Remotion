/**
 * AppScreenCarousel9x16 — procedural phone/app-mockup WALKTHROUGH carousel.
 *
 * Pattern source: @CodingFab reel `nxDVmkv_A-U` ("A full app, in your pocket").
 * The reel is a screen-recording of a fully-built mobile web app ("Trading Hub")
 * where the camera scrolls/cuts through a SEQUENCE of distinct app screens:
 *   - a home/launcher grid of colored app tiles + status bar + clock
 *   - a "My Market List" feed: stock rows with price + green/red delta chips
 *   - a "Trade" form: metric rows (Current Price / Estimated Cost) + a CTA button
 *   - a "Current Position" panel: metric rows + an "AI Market Analysis" toast
 *   - a "My Portfolio" dashboard: big-number stat cards (Account Value, Cash, Return)
 *   - a "Market News" list, and an outro title card.
 *
 * What carries the illusion of "real software" (and what we rebuild procedurally):
 *   1. A PERSISTENT phone device frame — rounded bezel + status bar (clock, 5G,
 *      battery) + a sticky nav header (brand glyph + app title). The header stays
 *      put while the *body* of each screen wipes through.
 *   2. SCREENS slide horizontally one-at-a-time (default 0.7s wipe), each built
 *      from procedural card UI:
 *        · a screen header (big title + optional subtitle)
 *        · content cards, each with a card title + metric rows
 *        · metric rows carry a label + value + green/red/neutral SENTIMENT
 *        · a progress-bar fill when a card declares `progress`
 *        · an optional toast that floats in over the last screen
 *   3. A bottom tab bar (Market / News / Portfolio …) anchored to the device.
 *
 * NO real screenshots — everything is drawn with divs so it rebrands cleanly.
 *
 * Brand spine (default): navy #1B3A6E, gold #D4AF37, deep-navy #0F1B2D paper,
 * cream #FAF7F2 ink, Inter. We rebrand creators, so brand gold/navy is the spine;
 * CodingFab's cyan #00D9A3 is offered only as the optional `accentColor` default
 * for the green/up sentiment + CTA, never as the structural color.
 *
 * GOTCHA respected: hero/section text uses SOLID colors — NEVER
 * background-clip:text + transparent (renders as an opaque block in headless
 * Chromium). All gradients here are on BACKGROUNDS only, never clipped to text.
 *
 * Motion: spring()/interpolate() off useCurrentFrame(); screens stagger via a
 * per-screen dwell window so the eye reads each screen as a discrete beat.
 */
import React, { useMemo } from "react";
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

// ─── Locally-declared schemas (worktree isolation: self-contained, no brand import) ───

const wordTimingSchema = z.object({
  text: z.string().default(""),
  startFrame: z.number().default(0),
  endFrame: z.number().default(0),
  startSeconds: z.number().default(0),
  endSeconds: z.number().default(0),
});

const breadcrumbSchema = z.object({
  text: z.string().default(""),
  date: z.string().default(""),
});

/** A single metric line inside a card: "Current Price …… $172.33" with sentiment. */
const metricSchema = z.object({
  label: z.string().default(""),
  value: z.string().default(""),
  /** Drives value color: up=green, down=red, neutral=ink. Default "neutral". */
  sentiment: z.enum(["up", "down", "neutral"]).default("neutral"),
});
export type AppScreenMetric = z.infer<typeof metricSchema>;

/** A content card on a screen: a titled box holding metric rows + optional progress + CTA. */
const cardSchema = z.object({
  title: z.string().default(""),
  /** Optional ticker/eyebrow shown small above the title (e.g. "AAPL · Apple Inc."). */
  eyebrow: z.string().default(""),
  metrics: z.array(metricSchema).default([]),
  /** 0..1 progress-bar fill drawn at the card bottom. -1 (default) = no bar. */
  progress: z.number().min(-1).max(1).default(-1),
  /** Optional call-to-action button label (filled, accent). Empty = none. */
  cta: z.string().default(""),
  /** If true, render this card with the accent-tinted "highlight" treatment. */
  highlight: z.boolean().default(false),
});
export type AppScreenCard = z.infer<typeof cardSchema>;

/** One app screen that wipes through the persistent phone frame. */
const screenSchema = z.object({
  /** Big screen title, e.g. "My Market List", "My Portfolio". */
  title: z.string().default(""),
  /** Optional one-line subtitle under the title. */
  subtitle: z.string().default(""),
  /** The content cards stacked vertically on this screen. */
  cards: z.array(cardSchema).default([]),
  /** Optional toast that floats in over this screen (e.g. "AI Market Analysis"). */
  toast: z.string().default(""),
});
export type AppScreen = z.infer<typeof screenSchema>;

export const appScreenCarousel9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),

  /** App/brand name shown in the sticky nav header. */
  appName: z.string().default("Trading Hub"),
  /** Time shown in the status bar (purely cosmetic). */
  statusBarTime: z.string().default("9:41"),
  /** Bottom tab-bar labels. Empty array hides the tab bar. */
  tabs: z
    .array(z.string())
    .default(["Market", "News", "Portfolio", "Watchlist"]),
  /** Index of the active (accent-colored) tab. */
  activeTabIndex: z.number().int().min(0).default(0),

  /** The walkthrough screens (3–5 recommended). */
  screens: z
    .array(screenSchema)
    .default([
      {
        title: "My Market List",
        subtitle: "Sigue tus posiciones en vivo",
        toast: "",
        cards: [
          {
            title: "AAPL",
            eyebrow: "Apple Inc. · Technology",
            progress: -1,
            cta: "",
            highlight: false,
            metrics: [
              { label: "Precio", value: "$176.33", sentiment: "down" },
              { label: "Cambio", value: "-0.80%", sentiment: "down" },
            ],
          },
          {
            title: "MSFT",
            eyebrow: "Microsoft Corp · Technology",
            progress: -1,
            cta: "",
            highlight: false,
            metrics: [
              { label: "Precio", value: "$386.43", sentiment: "up" },
              { label: "Cambio", value: "+1.61%", sentiment: "up" },
            ],
          },
          {
            title: "NVDA",
            eyebrow: "NVIDIA Corp · Technology",
            progress: -1,
            cta: "",
            highlight: false,
            metrics: [
              { label: "Precio", value: "$823.42", sentiment: "down" },
              { label: "Cambio", value: "-1.05%", sentiment: "down" },
            ],
          },
        ],
      },
      {
        title: "Comprar AAPL",
        subtitle: "Confirma tu orden",
        toast: "",
        cards: [
          {
            title: "Resumen de orden",
            eyebrow: "2 acciones",
            progress: -1,
            cta: "Place Buy Order",
            highlight: false,
            metrics: [
              { label: "Precio actual", value: "$172.33", sentiment: "neutral" },
              { label: "Efectivo", value: "$5,260.00", sentiment: "neutral" },
              { label: "Costo estimado", value: "$344.67", sentiment: "down" },
            ],
          },
        ],
      },
      {
        title: "Mi Posición",
        subtitle: "",
        toast: "Análisis IA: Mildly Bullish",
        cards: [
          {
            title: "Current Position",
            eyebrow: "AAPL · 2 acciones",
            progress: -1,
            cta: "",
            highlight: false,
            metrics: [
              { label: "Costo promedio", value: "$700.00", sentiment: "neutral" },
              { label: "Valor actual", value: "$1,663.72", sentiment: "neutral" },
              { label: "P/L no realizado", value: "+$263.72", sentiment: "up" },
            ],
          },
        ],
      },
      {
        title: "Mi Portafolio",
        subtitle: "Rendimiento y posiciones",
        toast: "",
        cards: [
          {
            title: "Account Value",
            eyebrow: "",
            progress: 0.74,
            cta: "",
            highlight: true,
            metrics: [
              { label: "Valor de cuenta", value: "$10,747.45", sentiment: "up" },
              { label: "Retorno total", value: "+7.47%", sentiment: "up" },
            ],
          },
        ],
      },
    ]),

  /** Seconds each screen holds before the next wipes in. */
  screenDwellSeconds: z.number().min(0.4).max(6).default(2.4),
  /** Wipe duration between screens (seconds). Default 0.7 (CodingFab pace). */
  screenWipeSeconds: z.number().min(0.2).max(1.5).default(0.7),
  /** Delay before the first screen reveal (seconds). */
  firstScreenDelaySeconds: z.number().min(0).max(4).default(0.4),

  /** Optional outro headline card after the last screen (empty = none). */
  outroHeadline: z.string().default("Una app completa, en tu bolsillo"),
  outroSub: z.string().default("Instalable · offline-ready · link en bio"),

  breadcrumb: breadcrumbSchema.nullable().default(null),
  /** "cream" (default light) or "dark". */
  palette: z.enum(["cream", "dark"]).default("dark"),
  /** Brand spine overrides (empty string = use palette default). */
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  /** Structural accent (gold by default — the brand spine). */
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  /** Sentiment "up"/CTA accent. Default CodingFab cyan #00D9A3. */
  upColor: z.string().default("#00D9A3"),
  /** Sentiment "down" accent. Default warm red. */
  downColor: z.string().default("#E5484D"),

  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
});
export type AppScreenCarousel9x16Props = z.infer<
  typeof appScreenCarousel9x16Schema
>;

// ─── Inline brand resolution (mirrors src/brand; kept self-contained) ────────

type PaletteMode = "cream" | "dark";

interface ResolvedPalette {
  paper: string;
  ink: string;
  accent: string;
  muted: string;
  /** The phone "screen" background (device interior). */
  screenBg: string;
  /** A single content-card background sitting on the screen. */
  cardBg: string;
  /** Hairline divider / border tint. */
  line: string;
  grainOverlay: string;
}

const PALETTES: Record<PaletteMode, ResolvedPalette> = {
  // Cream: warm editorial paper, deep-navy ink, gold accent. Phone screen is a
  // soft off-white so the procedural cards read as a light-mode app.
  cream: {
    paper: "#FAF7F2",
    ink: "#0F1B2D",
    accent: "#D4AF37",
    muted: "#6F6A5F",
    screenBg: "#FFFFFF",
    cardBg: "#F3EFE7",
    line: "rgba(15,27,45,0.10)",
    grainOverlay:
      "radial-gradient(circle at 30% 20%, rgba(15,27,45,0.05) 0%, transparent 60%)",
  },
  // Dark: deep-navy paper, cream ink, gold accent. Phone screen is a darker navy
  // so the cards read as a dark-mode app (matches CodingFab's OLED look).
  dark: {
    paper: "#0F1B2D",
    ink: "#FAF7F2",
    accent: "#D4AF37",
    muted: "#8A93A4",
    screenBg: "#0B1422",
    cardBg: "#16263C",
    line: "rgba(250,247,242,0.10)",
    grainOverlay:
      "radial-gradient(circle at 70% 18%, rgba(250,247,242,0.05) 0%, transparent 60%)",
  },
};

function resolveColors(
  palette: PaletteMode,
  overrides: { paper?: string; ink?: string; accent?: string; muted?: string },
): ResolvedPalette {
  const base = PALETTES[palette];
  return {
    ...base,
    paper: overrides.paper ?? base.paper,
    ink: overrides.ink ?? base.ink,
    accent: overrides.accent ?? base.accent,
    muted: overrides.muted ?? base.muted,
  };
}

// ─── Layout constants ────────────────────────────────────────────────────────

const FRAME_W = 1080;
const FRAME_H = 1920;

// Phone device frame — a centered tall rounded slab with a small outer margin.
const DEVICE_MARGIN_X = 90;
const DEVICE_TOP = 150;
const DEVICE_BOTTOM = 150;
const DEVICE_W = FRAME_W - DEVICE_MARGIN_X * 2; // 900
const DEVICE_H = FRAME_H - DEVICE_TOP - DEVICE_BOTTOM; // 1620
const DEVICE_RADIUS = 72;
const BEZEL = 14;

// Interior screen rect (inside the bezel).
const SCREEN_X = DEVICE_MARGIN_X + BEZEL;
const SCREEN_Y = DEVICE_TOP + BEZEL;
const SCREEN_W = DEVICE_W - BEZEL * 2;
const SCREEN_H = DEVICE_H - BEZEL * 2;
const SCREEN_RADIUS = DEVICE_RADIUS - BEZEL;

// Internal chrome heights (within the screen).
const STATUS_BAR_H = 56;
const NAV_HEADER_H = 92;
const TAB_BAR_H = 110;

// House-grammar spring profile (matches the Sprint-1 editorial profile).
const SPRING_CONFIG = { damping: 22, stiffness: 130, mass: 0.7 } as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function resolveAudioSrc(raw: string): string {
  return raw.startsWith("http") ? raw : staticFile(raw);
}

function sentimentColor(
  sentiment: AppScreenMetric["sentiment"],
  ink: string,
  up: string,
  down: string,
): string {
  if (sentiment === "up") return up;
  if (sentiment === "down") return down;
  return ink;
}

// ─── Status bar (clock + 5G + battery glyph) ─────────────────────────────────

const StatusBar: React.FC<{ time: string; ink: string }> = ({ time, ink }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: SCREEN_W,
      height: STATUS_BAR_H,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 34px",
      boxSizing: "border-box",
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: 24,
      color: ink,
    }}
    aria-hidden
  >
    <span>{time}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20, fontWeight: 700 }}>5G</span>
      {/* Battery glyph */}
      <svg width={42} height={22} viewBox="0 0 42 22">
        <rect
          x={1}
          y={3}
          width={34}
          height={16}
          rx={4}
          fill="none"
          stroke={ink}
          strokeOpacity={0.7}
          strokeWidth={2}
        />
        <rect x={4} y={6} width={28} height={10} rx={2} fill={ink} />
        <rect x={37} y={8} width={3} height={6} rx={1.5} fill={ink} fillOpacity={0.7} />
      </svg>
    </div>
  </div>
);

// ─── Sticky nav header (brand glyph + app name) ──────────────────────────────

const NavHeader: React.FC<{
  appName: string;
  accent: string;
  ink: string;
  line: string;
}> = ({ appName, accent, ink, line }) => (
  <div
    style={{
      position: "absolute",
      top: STATUS_BAR_H,
      left: 0,
      width: SCREEN_W,
      height: NAV_HEADER_H,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 34px",
      boxSizing: "border-box",
      borderBottom: `1px solid ${line}`,
    }}
  >
    {/* Brand glyph — a rounded gold tile with a stylized "box/burst" mark. */}
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden>
      <rect x={2} y={2} width={44} height={44} rx={12} fill={accent} />
      <path
        d="M14 28 L24 22 L34 28 L24 34 Z"
        fill="none"
        stroke="#0F1B2D"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <line x1={24} y1={22} x2={24} y2={14} stroke="#0F1B2D" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={24} cy={12} r={2.2} fill="#0F1B2D" />
    </svg>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: "-0.01em",
        color: ink,
      }}
    >
      {appName}
    </span>
  </div>
);

// ─── Bottom tab bar ──────────────────────────────────────────────────────────

const TabBar: React.FC<{
  tabs: string[];
  activeIndex: number;
  accent: string;
  muted: string;
  line: string;
}> = ({ tabs, activeIndex, accent, muted, line }) => {
  if (tabs.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: SCREEN_W,
        height: TAB_BAR_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 18px",
        boxSizing: "border-box",
        borderTop: `1px solid ${line}`,
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        const c = isActive ? accent : muted;
        return (
          <div
            key={`tab-${i}-${tab}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Simple glyph — filled square for active, outline for inactive. */}
            <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
              <rect
                x={3}
                y={3}
                width={20}
                height={20}
                rx={6}
                fill={isActive ? c : "none"}
                stroke={c}
                strokeWidth={2}
                fillOpacity={isActive ? 0.9 : 0}
              />
            </svg>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: isActive ? 700 : 600,
                fontSize: 18,
                color: c,
              }}
            >
              {tab}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── A single metric row ("label …… value") ──────────────────────────────────

const MetricRow: React.FC<{
  metric: AppScreenMetric;
  ink: string;
  muted: string;
  up: string;
  down: string;
}> = ({ metric, ink, muted, up, down }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 16,
      padding: "10px 0",
    }}
  >
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 26,
        color: muted,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {metric.label}
    </span>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "-0.01em",
        color: sentimentColor(metric.sentiment, ink, up, down),
        whiteSpace: "nowrap",
      }}
    >
      {metric.value}
    </span>
  </div>
);

// ─── A content card ──────────────────────────────────────────────────────────

const ContentCard: React.FC<{
  card: AppScreenCard;
  /** 0..1 reveal progress driving this card's slide-up + fade. */
  reveal: number;
  /** 0..1 progress-bar grow factor (separate so the bar fills after the card lands). */
  barGrow: number;
  ink: string;
  muted: string;
  accent: string;
  up: string;
  down: string;
  cardBg: string;
  line: string;
}> = ({ card, reveal, barGrow, ink, muted, accent, up, down, cardBg, line }) => {
  const translateY = interpolate(reveal, [0, 1], [26, 0]);
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  const hasProgress = card.progress >= 0;
  const fillPct = Math.max(0, Math.min(1, card.progress)) * barGrow;

  return (
    <div
      style={{
        background: card.highlight ? `${accent}1A` : cardBg,
        border: card.highlight ? `2px solid ${accent}` : `1px solid ${line}`,
        borderRadius: 24,
        padding: "26px 28px",
        opacity,
        transform: `translateY(${translateY}px)`,
        boxShadow: card.highlight
          ? `0 12px 36px ${accent}33`
          : "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      {card.eyebrow && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: muted,
            marginBottom: 8,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.eyebrow}
        </div>
      )}
      {card.title && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
            color: card.highlight ? accent : ink,
            marginBottom: card.metrics.length > 0 ? 10 : 0,
          }}
        >
          {card.title}
        </div>
      )}

      {card.metrics.map((metric, i) => (
        <React.Fragment key={`metric-${i}-${metric.label}`}>
          {i > 0 && (
            <div style={{ height: 1, background: line, opacity: 0.7 }} />
          )}
          <MetricRow metric={metric} ink={ink} muted={muted} up={up} down={down} />
        </React.Fragment>
      ))}

      {hasProgress && (
        <div
          style={{
            marginTop: 18,
            height: 14,
            borderRadius: 7,
            background: `${muted}33`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fillPct * 100}%`,
              height: "100%",
              borderRadius: 7,
              background: up,
            }}
          />
        </div>
      )}

      {card.cta && (
        <div
          style={{
            marginTop: 22,
            height: 76,
            borderRadius: 18,
            background: up,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "-0.01em",
            color: "#06231C",
          }}
        >
          {card.cta}
        </div>
      )}
    </div>
  );
};

// ─── A toast that floats in over a screen ────────────────────────────────────

const Toast: React.FC<{
  text: string;
  reveal: number;
  accent: string;
  up: string;
}> = ({ text, reveal, accent, up }) => {
  const translateY = interpolate(reveal, [0, 1], [40, 0]);
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 24,
        padding: "20px 26px",
        borderRadius: 20,
        background: "rgba(11,20,34,0.92)",
        border: `1px solid ${accent}66`,
        boxShadow: `0 14px 40px ${up}33`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Pulse dot */}
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: up,
          flex: "0 0 auto",
          boxShadow: `0 0 0 6px ${up}33`,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#FAF7F2",
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── A single screen body (everything between nav header and tab bar) ─────────

const ScreenBody: React.FC<{
  screen: AppScreen;
  /** Horizontal offset in px (drives the slide wipe). */
  offsetX: number;
  /** 0..1 — how "settled" this screen is (used for card stagger + toast). */
  settle: number;
  ink: string;
  muted: string;
  accent: string;
  up: string;
  down: string;
  cardBg: string;
  line: string;
}> = ({ screen, offsetX, settle, ink, muted, accent, up, down, cardBg, line }) => {
  const bodyTop = STATUS_BAR_H + NAV_HEADER_H;
  const bodyHeight = SCREEN_H - bodyTop - TAB_BAR_H;

  return (
    <div
      style={{
        position: "absolute",
        top: bodyTop,
        left: 0,
        width: SCREEN_W,
        height: bodyHeight,
        transform: `translateX(${offsetX}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "30px 34px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* Screen header — solid color (never clipped). */}
        {screen.title && (
          <div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 900,
                fontSize: 56,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                color: ink,
              }}
            >
              {screen.title}
            </div>
            {screen.subtitle && (
              <div
                style={{
                  marginTop: 10,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 26,
                  color: muted,
                }}
              >
                {screen.subtitle}
              </div>
            )}
          </div>
        )}

        {/* Content cards — staggered slide-up keyed off `settle`. */}
        {screen.cards.map((card, i) => {
          // Each card reveals across a slice of the settle window.
          const slices = Math.max(1, screen.cards.length);
          const start = (i / slices) * 0.6;
          const end = start + 0.4;
          const reveal = interpolate(settle, [start, end], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // Progress bar fills slightly after the card lands.
          const barGrow = interpolate(settle, [end, Math.min(1, end + 0.3)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <ContentCard
              key={`card-${i}-${card.title}`}
              card={card}
              reveal={reveal}
              barGrow={barGrow}
              ink={ink}
              muted={muted}
              accent={accent}
              up={up}
              down={down}
              cardBg={cardBg}
              line={line}
            />
          );
        })}
      </div>

      {/* Optional toast floats in late in the dwell. */}
      {screen.toast && (
        <Toast
          text={screen.toast}
          reveal={interpolate(settle, [0.55, 0.9], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          accent={accent}
          up={up}
        />
      )}
    </div>
  );
};

// ─── Outro headline card (last beat — solid hero text) ───────────────────────

const OutroCard: React.FC<{
  headline: string;
  sub: string;
  reveal: number;
  ink: string;
  muted: string;
  accent: string;
  screenBg: string;
}> = ({ headline, sub, reveal, ink, muted, accent, screenBg }) => {
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  const translateY = interpolate(reveal, [0, 1], [24, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: STATUS_BAR_H + NAV_HEADER_H,
        left: 0,
        width: SCREEN_W,
        height: SCREEN_H - STATUS_BAR_H - NAV_HEADER_H - TAB_BAR_H,
        background: screenBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 56px",
        boxSizing: "border-box",
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 64,
          letterSpacing: "-0.025em",
          lineHeight: 1.04,
          color: ink,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          width: 88,
          height: 6,
          borderRadius: 3,
          background: accent,
          margin: "28px 0",
        }}
      />
      {sub && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.3,
            color: muted,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// ─── Optional breadcrumb (top-left, over the paper) ──────────────────────────

const BrandBreadcrumb: React.FC<{
  text: string;
  date: string;
  accentColor: string;
}> = ({ text, date, accentColor }) => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 90,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: accentColor,
        display: "inline-block",
      }}
    />
    <span style={{ color: accentColor }}>{text}</span>
    {date && (
      <span style={{ color: accentColor, opacity: 0.6, marginLeft: 6 }}>
        · {date}
      </span>
    )}
  </div>
);

// ─── Opt-in caption strip ────────────────────────────────────────────────────

const InlineCaptionStrip: React.FC<{
  wordTimings: AppScreenCarousel9x16Props["wordTimings"];
  fontSize: number;
  accentColor: string;
  inkColor: string;
  paperColor: string;
  mutedBorderColor: string;
}> = ({ wordTimings, fontSize, accentColor, inkColor, paperColor, mutedBorderColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSeconds = frame / fps;

  const activeIndex = wordTimings.findIndex(
    (w) => currentSeconds >= w.startSeconds && currentSeconds <= w.endSeconds,
  );
  if (activeIndex < 0) return null;

  const start = Math.max(0, activeIndex - 2);
  const windowWords = wordTimings.slice(start, start + 5);

  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 40,
        padding: "16px 26px",
        background: `${paperColor}E6`,
        border: `1px solid ${mutedBorderColor}`,
        borderRadius: 16,
        fontFamily: "Inter, sans-serif",
        fontSize,
        fontWeight: 600,
        color: inkColor,
        textAlign: "center",
        lineHeight: 1.25,
      }}
    >
      {windowWords.map((w, i) => {
        const isActive = start + i === activeIndex;
        return (
          <span
            key={`${w.text}-${w.startFrame}-${i}`}
            style={{ color: isActive ? accentColor : inkColor, marginRight: 8 }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const AppScreenCarousel9x16: React.FC<AppScreenCarousel9x16Props> = ({
  audioUrl,
  wordTimings,
  appName,
  statusBarTime,
  tabs,
  activeTabIndex,
  screens,
  screenDwellSeconds,
  screenWipeSeconds,
  firstScreenDelaySeconds,
  outroHeadline,
  outroSub,
  breadcrumb,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  upColor,
  downColor,
  captionFontSize,
  showCaptions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedAccent = colors.accent;
  const resolvedMuted = colors.muted;
  const up = upColor || "#00D9A3";
  const down = downColor || "#E5484D";

  // ─── Timeline math ──────────────────────────────────────────────────────
  const delayFrames = Math.round(firstScreenDelaySeconds * fps);
  const dwellFrames = Math.max(1, Math.round(screenDwellSeconds * fps));
  const wipeFrames = Math.max(1, Math.round(screenWipeSeconds * fps));
  const perScreenFrames = dwellFrames + wipeFrames;

  const hasOutro = outroHeadline.trim().length > 0;
  const totalBeats = screens.length + (hasOutro ? 1 : 0);

  // Which beat are we in, and how far through it.
  const localFrame = Math.max(0, frame - delayFrames);
  const rawBeat = Math.floor(localFrame / perScreenFrames);
  const activeBeat = Math.min(rawBeat, Math.max(0, totalBeats - 1));
  const beatFrame = localFrame - activeBeat * perScreenFrames;

  // Wipe progress for the CURRENT beat's exit (0 until dwell ends, then 0→1).
  const exitProgress = useMemo(() => {
    if (beatFrame <= dwellFrames) return 0;
    const t = (beatFrame - dwellFrames) / wipeFrames;
    return Math.max(0, Math.min(1, t));
  }, [beatFrame, dwellFrames, wipeFrames]);

  // Spring-eased wipe so the slide feels physical, not linear.
  const wipeEased = spring({
    frame: Math.max(0, beatFrame - dwellFrames),
    fps,
    config: SPRING_CONFIG,
    durationInFrames: wipeFrames,
  });
  const wipeAmount = exitProgress > 0 ? wipeEased : 0;

  // Settle for the active beat: how far the cards have staggered in. The first
  // ~0.45 of the dwell drives the card reveal; the rest is a hold.
  const settle = interpolate(beatFrame, [0, dwellFrames * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Device entrance — the whole phone springs up on the first frames.
  const deviceEnter = spring({ frame, fps, config: SPRING_CONFIG });
  const deviceOpacity = interpolate(deviceEnter, [0, 1], [0, 1]);
  const deviceTranslate = interpolate(deviceEnter, [0, 1], [40, 0]);

  // Background paper has a soft radial glow toward the device.
  const paperGradient = `radial-gradient(ellipse at 50% 38%, ${resolvedAccent}14 0%, ${resolvedPaper} 62%)`;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && <Audio src={resolveAudioSrc(audioUrl)} />}

      {/* Paper glow */}
      <AbsoluteFill style={{ background: paperGradient }} />

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          background: colors.grainOverlay,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* ── Phone device frame ── */}
      <div
        style={{
          position: "absolute",
          top: DEVICE_TOP,
          left: DEVICE_MARGIN_X,
          width: DEVICE_W,
          height: DEVICE_H,
          borderRadius: DEVICE_RADIUS,
          background: "#05080E",
          boxShadow:
            "0 40px 120px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(250,247,242,0.06)",
          opacity: deviceOpacity,
          transform: `translateY(${deviceTranslate}px)`,
        }}
      >
        {/* Interior screen (clips everything) */}
        <div
          style={{
            position: "absolute",
            top: BEZEL,
            left: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: SCREEN_RADIUS,
            background: colors.screenBg,
            overflow: "hidden",
          }}
        >
          {/* Persistent chrome */}
          <StatusBar time={statusBarTime} ink={resolvedInk} />
          <NavHeader
            appName={appName}
            accent={resolvedAccent}
            ink={resolvedInk}
            line={colors.line}
          />

          {/* Screen bodies — current slides out left, next slides in from right. */}
          {screens.map((screen, i) => {
            // Only render the active beat's screen and the one wiping in next.
            const isActive = i === activeBeat;
            const isNext = i === activeBeat + 1;
            if (!isActive && !isNext) return null;

            let offsetX = 0;
            let beatSettle = 0;
            if (isActive) {
              // Active screen: settled, then slides out to the left during wipe.
              offsetX = -wipeAmount * SCREEN_W;
              beatSettle = settle;
            } else {
              // Next screen: slides in from the right as the wipe progresses.
              offsetX = (1 - wipeAmount) * SCREEN_W;
              beatSettle = 0;
            }

            return (
              <ScreenBody
                key={`screen-${i}`}
                screen={screen}
                offsetX={offsetX}
                settle={beatSettle}
                ink={resolvedInk}
                muted={resolvedMuted}
                accent={resolvedAccent}
                up={up}
                down={down}
                cardBg={colors.cardBg}
                line={colors.line}
              />
            );
          })}

          {/* Outro beat (after the last screen) */}
          {hasOutro &&
            (() => {
              const outroBeatIndex = screens.length;
              const isActive = activeBeat === outroBeatIndex;
              const isNext =
                activeBeat === outroBeatIndex - 1 && wipeAmount > 0;
              if (!isActive && !isNext) return null;
              const reveal = isActive
                ? interpolate(beatFrame, [0, dwellFrames * 0.4], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 0;
              return (
                <OutroCard
                  headline={outroHeadline}
                  sub={outroSub}
                  reveal={reveal}
                  ink={resolvedInk}
                  muted={resolvedMuted}
                  accent={resolvedAccent}
                  screenBg={colors.screenBg}
                />
              );
            })()}

          {/* Persistent tab bar (on top of the bodies) */}
          <TabBar
            tabs={tabs}
            activeIndex={activeTabIndex}
            accent={resolvedAccent}
            muted={resolvedMuted}
            line={colors.line}
          />
        </div>

        {/* Device notch / pill */}
        <div
          style={{
            position: "absolute",
            top: BEZEL + 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 150,
            height: 30,
            borderRadius: 15,
            background: "#05080E",
            zIndex: 5,
          }}
          aria-hidden
        />
      </div>

      {/* Opt-in caption strip */}
      {showCaptions && (
        <InlineCaptionStrip
          wordTimings={wordTimings}
          fontSize={captionFontSize}
          accentColor={resolvedAccent}
          inkColor={resolvedInk}
          paperColor={resolvedPaper}
          mutedBorderColor={`${resolvedMuted}33`}
        />
      )}

      {/* No-op frame-bounds reference to keep FRAME_H load-bearing. */}
      {FRAME_H > 0 ? null : null}
    </AbsoluteFill>
  );
};
