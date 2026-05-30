/**
 * AppConnect9x16 — Shabam-style app-icon "connect" + notification cascade.
 *
 * Wave-5 Tella synthesis template T5 (HIGH-VALUE), distilled from the Shabam
 * reel range 14:04-16:42 in `docs/research/wave-5/tella-frames-dense/ykBDqicGx0M/`
 * (see `docs/research/wave-5/tella-motion-graphics-synthesis.md` §T5, lines
 * 182-190). The pattern is a 3-act vignette used to show "Tool A + Tool B
 * working together → here's what they produce":
 *
 *   Act 1 (~0-1.5s)  Two app icons slide in from L/R and a connector
 *                    (arc by default, optional straight line) draws between
 *                    them. The connector tip is a STATIC dot / chevron that
 *                    fades in after the path-draw finishes — Tella's explicit
 *                    rule: "NEVER animate arrowheads in Remotion."
 *
 *   Act 2 (~1.5-4s)  A cascade of 2-5 iOS-style notification toasts drops
 *                    from the top of the connected app (right by default).
 *                    Each toast enters with `intervalFrames` (default 4)
 *                    of separation and holds for `heldFrames` (default 60).
 *                    Schedule is computed by `heldStaggerEntry` from
 *                    `src/animation/heldStagger.ts`.
 *
 *   Act 3 (~4s+)     Optional caption beat — EditorialCaption strip mounts
 *                    in the bottom third (gated by `showCaptions`).
 *
 * Composition uses the canonical house-grammar pattern (BrandBreadcrumb +
 * grain overlay + palette-aware ink/accent/muted) so it slots cleanly into
 * the existing Wave-3/4/5 9x16 lineup without visual drift.
 *
 * Layout (top → bottom):
 *   y=  80  BrandBreadcrumb (optional)
 *   y= 240  SectionLabel chip (tracking-spaced uppercase accent)
 *   y= 750  <AppIconPair> centered (200px icons + connector arc)
 *   y=1100  Notification toasts stack — each toast at topPx = 1100 + i*180
 *   y=1700+ EditorialCaption (bottom strip, gated)
 *
 * The transitionVerb prop is the Wave-5 "imperative voice" contract that
 * narrates the motion so downstream tools (script linters, voiceover
 * cue-sheets) can match audio beats to visual beats deterministically.
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
import { AppIconPair, NotificationToast } from "../components/AppConnect";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  ALL_PALETTE_MODES,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { heldStaggerEntry } from "../animation/heldStagger";

// ─── Local schemas ─────────────────────────────────────────────────
// Mirrors the AnimatedCounter9x16 / Sparkline9x16 pattern — `schemas.ts`
// exports the inferred WordTiming type but not the underlying zod schema,
// so each composition redeclares its own to stay self-contained.
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

const appSchema_local = z.object({
  name: z.string().default("Gmail"),
  iconSrc: z.string().default(""),
  brandColor: z.string().default("#EA4335"),
});

const notificationSchema_local = z.object({
  /** Which app the notification appears UNDER ('left' or 'right' app). Default 'right'. */
  fromApp: z.enum(["left", "right"]).default("right"),
  title: z.string().default(""),
  body: z.string().default(""),
  timestamp: z.string().default("now"),
});

const cascadeSchema_local = z.object({
  /** Frames between successive toast entries. Default 4. */
  intervalFrames: z.number().default(4),
  /** Frames each toast is held visible. Default 60. */
  heldFrames: z.number().default(60),
  /** Frames the toast takes to drop in. Default 8. */
  enterFrames: z.number().default(8),
});

// ─── Schema ────────────────────────────────────────────────────────
export const appConnect9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),
  sectionLabel: z.string().default(""),

  /** Left icon. */
  leftApp: appSchema_local.default({
    name: "Gmail",
    iconSrc: "",
    brandColor: "#EA4335",
  }),
  /** Right icon. */
  rightApp: appSchema_local.default({
    name: "ChatGPT",
    iconSrc: "",
    brandColor: "#10A37F",
  }),

  /** Connector style. */
  connector: z.enum(["line", "arc", "none"]).default("arc"),
  /** Connector tip marker (Tella's rule: NEVER animate arrowheads). */
  endMarker: z.enum(["dot", "chevron", "none"]).default("dot"),

  /** Notification cascade. */
  notifications: z.array(notificationSchema_local).default([
    {
      fromApp: "right",
      title: "GPT cleaned your inbox",
      body: "47 emails archived",
      timestamp: "now",
    },
    {
      fromApp: "right",
      title: "Smart replies drafted",
      body: "3 ready to send",
      timestamp: "now",
    },
    {
      fromApp: "right",
      title: "Priority sorted",
      body: "Top 5 emails pinned",
      timestamp: "now",
    },
  ]),

  /** Toast cascade timing. */
  notificationCascade: cascadeSchema_local.default({
    intervalFrames: 4,
    heldFrames: 60,
    enterFrames: 8,
  }),

  /** Timing knobs. */
  iconsEnterStartSeconds: z.number().default(0.4),
  connectorDrawStartSeconds: z.number().default(0.8),
  cascadeStartSeconds: z.number().default(1.6),

  // CRITICAL: transitionVerb in imperative voice (Wave-5 contract). Narrates
  // the motion so script-linters / voiceover cue-sheets can pair audio beats
  // to visual beats without re-deriving them from the choreography.
  transitionVerb: z
    .string()
    .default(
      "Left and right app icons slide in from opposite sides, then an arc draws between them L→R over 16 frames with a static dot at the tip (NEVER an animated arrowhead), then 3 notification toasts drop from the top of the right app in 4-frame succession, each held 60 frames.",
    ),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  palette: z.enum(ALL_PALETTE_MODES).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type AppConnect9x16Props = z.infer<typeof appConnect9x16Schema>;

// ─── Layout constants ──────────────────────────────────────────────
const SECTION_LABEL_Y = 240;
const ICON_PAIR_CENTER_Y = 750;
const ICON_SIZE_PX = 200;
const TOAST_STACK_TOP = 1100;
const TOAST_STACK_STEP = 180; // vertical spacing between successive toasts
const TOAST_WIDTH_PX = 720;

// Connector draw is intentionally fixed at 16 frames — Tella's reference range
// for the Shabam arc-draw beat, snappy enough to feel intentional without
// crowding the cascade that follows.
const CONNECTOR_DRAW_FRAMES = 16;
const ICON_ENTER_FRAMES = 14;

// ─── Section label chip ────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-8, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 38,
        color: accentColor,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Composition ───────────────────────────────────────────────────
export const AppConnect9x16: React.FC<AppConnect9x16Props> = ({
  audioUrl,
  wordTimings,
  sectionLabel,
  leftApp,
  rightApp,
  connector,
  endMarker,
  notifications,
  notificationCascade,
  iconsEnterStartSeconds,
  cascadeStartSeconds,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

  // Resolve color stack: palette defaults + per-color overrides.
  // Empty string in a color prop = "use palette default" (Zod schemas default to "" if unset).
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
  const resolvedMuted = colors.muted;
  const resolvedInk = colors.ink;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Treat any non-light palette as dark for blend-mode and overlay decisions.
  const paletteMode: PaletteMode = palette;
  const isDarkPalette =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black";

  // ─── Schedules ──────────────────────────────────────────────────
  const iconsEnterStartFrame = Math.round(iconsEnterStartSeconds * fps);
  const cascadeStartFrame = Math.round(cascadeStartSeconds * fps);

  // `connectorDrawStartSeconds` is intentionally NOT wired separately — the
  // <AppIconPair> molecule already computes connector start as
  // `enterStartFrame + iconEnterFrames` to guarantee the line draws AFTER the
  // icons settle (no overlap). We respect that internal contract and only
  // expose `iconsEnterStartSeconds` + `connectorDrawFrames` to callers.

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay (matches DiagramExplainer / Sparkline house grammar) */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: isDarkPalette ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
        />
      )}

      {/* Section label chip */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* ── Act 1: two app icons + connector ─────────────────────── */}
      <AppIconPair
        left={{
          name: leftApp.name,
          iconSrc: leftApp.iconSrc || undefined,
          brandColor: leftApp.brandColor,
        }}
        right={{
          name: rightApp.name,
          iconSrc: rightApp.iconSrc || undefined,
          brandColor: rightApp.brandColor,
        }}
        connector={connector}
        connectorColor={resolvedAccent}
        iconSizePx={ICON_SIZE_PX}
        centerYPx={ICON_PAIR_CENTER_Y}
        enterStartFrame={iconsEnterStartFrame}
        iconEnterFrames={ICON_ENTER_FRAMES}
        connectorDrawFrames={CONNECTOR_DRAW_FRAMES}
        endMarker={endMarker}
      />

      {/* ── Act 2: notification cascade ──────────────────────────── */}
      {notifications.map((n, i) => {
        // Per-index entry frame using heldStaggerEntry — each toast lands
        // `intervalFrames` after the previous one. `holdFrames=0` here
        // because the toast molecule already tracks its own hold; we only
        // need the stagger primitive to compute the cascade ENTRY schedule.
        const enterFrame =
          cascadeStartFrame +
          heldStaggerEntry({
            index: i,
            baseStartFrame: 0,
            revealFrames: notificationCascade.intervalFrames,
            holdFrames: 0,
          });

        return (
          <NotificationToast
            key={`toast-${i}`}
            app={
              n.fromApp === "left"
                ? {
                    name: leftApp.name,
                    iconSrc: leftApp.iconSrc || undefined,
                    brandColor: leftApp.brandColor,
                  }
                : {
                    name: rightApp.name,
                    iconSrc: rightApp.iconSrc || undefined,
                    brandColor: rightApp.brandColor,
                  }
            }
            title={n.title}
            body={n.body}
            timestamp={n.timestamp}
            widthPx={TOAST_WIDTH_PX}
            topPx={TOAST_STACK_TOP + i * TOAST_STACK_STEP}
            enterFrame={enterFrame}
            enterFrames={notificationCascade.enterFrames}
            heldFrames={notificationCascade.heldFrames}
            paletteMode={paletteMode}
          />
        );
      })}

      {/* ── Act 3: optional EditorialCaption strip ───────────────── */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 160,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
