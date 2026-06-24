/**
 * RankedTierList9x16 — Hormozi/Klaus ranked-tier listicle with held dwell beats.
 *
 * Wave-5 Tella synthesis T3 (frame refs:
 *   docs/research/wave-5/tella-frames-dense/ykBDqicGx0M/ Hormozi range ≈ 07:32-13:56):
 *   "List items appear bottom-to-top, each tier with a slight rest beat before the
 *    next slides in — not a flat stagger."
 *
 * The choreography is the whole point: this is NOT a continuous cascade.
 *   - Each item slides up from translateY(20) → 0 over `revealFrames` (default 10).
 *   - After settling, the item HOLDS in place for `holdFrames` (default 14)
 *     before the next item begins its entry.
 *   - This creates explicit dwell beats so the eye reads each tier as a discrete
 *     unit rather than scanning a sliding list.
 *   - Reveal direction defaults to "bottom-up" (Hormozi pattern): the most-
 *     valuable item is revealed LAST as the climax.
 *
 * Implementation reads from `heldStaggerState` (src/animation/heldStagger.ts).
 * During `phase === "entering"`: item interpolates translateY/opacity by progress.
 * During `phase === "held"`: item is locked at translateY(0) opacity(1) — `isHeld`
 *   marks it as the climax beat.
 *
 * Side-by-side host mode: if `sideBySideHost: true`, items render at ~50% width
 * anchored to the right edge of the frame, leaving the left ~540px clear for a
 * future TalkingHeadDynamic9x16 overlay or host clip.
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
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
  type PaletteMode,
} from "../brand";
import { ALL_PALETTE_MODES } from "../brand/palettes";
import { heldStaggerState } from "../animation/heldStagger";

// ─── Local schemas ──────────────────────────────────────────────────
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

const tierItemSchema = z.object({
  /** e.g. "Tier S", "#1", "Most important", or plain text. */
  rank: z.string().default(""),
  /** Main label. */
  label: z.string().default(""),
  /** Optional sub-line under the main label. */
  sub: z.string().default(""),
  /** Optional per-item color override. */
  color: z.string().default(""),
});
export type RankedTierItem = z.infer<typeof tierItemSchema>;

export const rankedTierList9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema_local).default([]),

  /** Title shown at the top BEFORE items reveal. */
  title: z.string().default("Top 5 razones"),
  /** Optional subtitle (mono tracked). */
  subtitle: z.string().default(""),
  /** Section eyebrow chip (uppercase tracked-letter-spacing). */
  sectionLabel: z.string().default(""),

  /** The tier items, given in REVEAL order (top-of-list = revealed LAST per Hormozi pattern,
   *  so the highest-value item appears as the climax). */
  items: z
    .array(tierItemSchema)
    .default([
      { rank: "5", label: "Item five", sub: "", color: "" },
      { rank: "4", label: "Item four", sub: "", color: "" },
      { rank: "3", label: "Item three", sub: "", color: "" },
      { rank: "2", label: "Item two", sub: "", color: "" },
      { rank: "1", label: "Item one", sub: "", color: "" },
    ]),

  /** Where the list reveals from. "bottom-up" (default — Hormozi pattern) or "top-down". */
  revealDirection: z.enum(["bottom-up", "top-down"]).default("bottom-up"),

  /** Per-item reveal duration in frames. Default 10 (Tella spec). */
  revealFrames: z.number().default(10),
  /** Per-item dwell beat AFTER reveal, before next item starts. Default 14. */
  holdFrames: z.number().default(14),
  /** First item's enter time in seconds. */
  firstItemEnterSeconds: z.number().default(1.0),

  /** Optional side-by-side host slot — if true, render items at half-width on the right,
   *  leaving 540px on left for a `<TalkingHeadDynamic9x16>` or host clip. */
  sideBySideHost: z.boolean().default(false),

  // CRITICAL: transitionVerb in imperative voice (the Wave-5 contract). This is
  // metadata for the prompt-engineering pipeline — it doesn't drive runtime
  // behavior, but it travels with the schema so downstream prompt generators
  // can describe the motion in imperative voice.
  transitionVerb: z
    .string()
    .default(
      "Each list item slides up from below one-at-a-time (translateY 20 → 0 over 10 frames), each held 14 frames before the next starts. NOT a continuous stagger — each tier has its own dwell beat.",
    ),

  // Brand chrome
  breadcrumb: breadcrumbSchema_local.nullable().default(null),
  subjectTool: z.string().nullable().default(null),
  // Default surface = true-black to match the adamrosler dark-procedural lane
  // this template is compared against (near-#000 paper, white ink, single
  // gold-glow climax row). The dark TierCard branch is purpose-built for this.
  // Override with "cream" for the original Hormozi/Tella light styling.
  palette: z.enum(ALL_PALETTE_MODES).default("true-black"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().default(36),
  showCaptions: z.boolean().default(true),
});
export type RankedTierList9x16Props = z.infer<typeof rankedTierList9x16Schema>;

// ─── Layout constants ───────────────────────────────────────────────
const FRAME_W = 1080;
const FRAME_H = 1920;

const BREADCRUMB_Y = 80;
const SECTION_LABEL_Y = 260;
const TITLE_Y = 380;

// Items area
const ITEMS_TOP_Y = 620;
const ITEMS_BOTTOM_Y = 1700;
const ITEMS_ZONE_HEIGHT = ITEMS_BOTTOM_Y - ITEMS_TOP_Y;

// Full-width and side-by-side widths
const ITEM_W_FULL = 880;
const ITEM_W_SIDE = 500;
const ITEM_H = 120;
const ITEM_GAP = 18;

// Left margin reserved for host clip when sideBySideHost is true.
const HOST_SLOT_WIDTH = 540;
const SIDE_RIGHT_MARGIN = 40;

// ─── Section label (mono tracked-uppercase) ─────────────────────────
const SectionLabel: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [-6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: SECTION_LABEL_Y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 30,
        color: accentColor,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ─── Title + subtitle ───────────────────────────────────────────────
const TitleBlock: React.FC<{
  title: string;
  subtitle: string;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
  centered: boolean;
  leftPx: number;
  widthPx: number;
}> = ({
  title,
  subtitle,
  inkColor,
  accentColor,
  mutedColor,
  paletteMode,
  centered,
  leftPx,
  widthPx,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [12, 0]);

  // Reserved unused: keep for potential future muted-subtitle styling.
  void mutedColor;

  // adamrosler accent-discipline: on dark surfaces the headline is WHITE/ink and
  // the gold accent is reserved for the single highlighted climax row (matching
  // his "white headline + one gold key element" pattern). On cream, keep the
  // original Hormozi/Tella accent-colored headline.
  const isDarkSurface =
    paletteMode === "dark" ||
    paletteMode === "warm-black" ||
    paletteMode === "true-black";
  const titleColor = isDarkSurface
    ? getBodyTextColor(paletteMode, inkColor, 84)
    : accentColor;

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_Y,
        left: leftPx,
        width: widthPx,
        textAlign: centered ? "center" : "left",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 84,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          color: titleColor,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: getBodyTextColor(paletteMode, inkColor, 28),
            opacity: 0.75,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ─── Single tier card ───────────────────────────────────────────────
const TierCard: React.FC<{
  item: RankedTierItem;
  visualIndex: number;
  revealIndex: number;
  /** True for the row that reveals LAST (the climax / "most-valuable" tier).
   *  This is the row that stays distinguished as the single glowing active row
   *  once it has landed — the Hormozi/adamrosler "one highlighted row" signature. */
  isClimax: boolean;
  topPx: number;
  leftPx: number;
  widthPx: number;
  baseStartFrame: number;
  revealFrames: number;
  holdFrames: number;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  mutedColor: string;
  paletteMode: PaletteMode;
}> = ({
  item,
  visualIndex,
  revealIndex,
  isClimax,
  topPx,
  leftPx,
  widthPx,
  baseStartFrame,
  revealFrames,
  holdFrames,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  paletteMode,
}) => {
  const frame = useCurrentFrame();

  const state = heldStaggerState({
    frame,
    index: revealIndex,
    baseStartFrame,
    revealFrames,
    holdFrames,
  });

  // Pre-entry: keep the card invisible so it doesn't paint before its beat.
  if (state.phase === "pre") return null;

  // Entering: interpolate translateY(20→0) + opacity(0→1) by progress.
  // Held / Past: locked at translateY(0) opacity(1).
  const entering = state.phase === "entering";
  const translateY = entering ? 20 - 20 * state.progress : 0;
  const opacity = entering ? state.progress : 1;

  const cardBg =
    paletteMode === "dark" || paletteMode === "warm-black" || paletteMode === "true-black"
      ? "#10172A"
      : "#FFFFFF";

  const itemAccent = item.color && item.color.length > 0 ? item.color : accentColor;

  // The single glowing ACTIVE row (adamrosler / Hormozi signature): the climax
  // tier stays distinguished with a persistent accent glow once it has landed —
  // not just during its brief dwell. Every other row reads as neutral chrome.
  // `state.phase === "held" | "past"` == "this row has finished revealing".
  const climaxRevealed =
    isClimax && (state.phase === "held" || state.phase === "past");

  // Held beat = the climax frame for this item. Lift it visually with a stronger
  // shadow so the eye sees the dwell as "this one matters".
  const cardShadow = climaxRevealed
    ? `0 0 0 2px ${itemAccent}, 0 12px 36px ${itemAccent}55, 0 2px 0 ${itemAccent}66`
    : state.isHeld
      ? paletteMode === "dark" ||
        paletteMode === "warm-black" ||
        paletteMode === "true-black"
        ? `0 10px 32px rgba(212, 160, 74, 0.22), 0 1px 0 rgba(212, 160, 74, 0.30)`
        : `0 10px 32px rgba(0, 0, 0, 0.10), 0 1px 0 ${itemAccent}33`
      : paletteMode === "dark" ||
          paletteMode === "warm-black" ||
          paletteMode === "true-black"
        ? `0 6px 20px rgba(212, 160, 74, 0.14), 0 1px 0 rgba(212, 160, 74, 0.20)`
        : `0 6px 20px rgba(0, 0, 0, 0.06), 0 1px 0 ${itemAccent}22`;

  // Suppress unused-paperColor warning while keeping it in the API.
  void paperColor;
  // visualIndex is used only as a stable React key driver — referenced by the
  // parent's map() but not needed inside the card.
  void visualIndex;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: leftPx,
        width: widthPx,
        height: ITEM_H,
        // Active (climax) row gets a faint accent wash so the single highlighted
        // row reads instantly even on light palettes; all others stay neutral.
        background: climaxRevealed ? `${itemAccent}14` : cardBg,
        border: `${climaxRevealed ? 3 : 2}px solid ${itemAccent}`,
        borderRadius: 16,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        boxShadow: cardShadow,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Rank — left column, big bold sans */}
      <div
        style={{
          flex: "0 0 auto",
          minWidth: 90,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          color: itemAccent,
          textAlign: "left",
        }}
      >
        {item.rank}
      </div>

      {/* Label + optional sub — center column, flex-grow */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 38,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: getBodyTextColor(paletteMode, inkColor, 38),
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </div>
        {item.sub && (
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontSize: 22,
              letterSpacing: "0.06em",
              color: mutedColor,
              opacity: 0.85,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.sub}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Composition ────────────────────────────────────────────────────
export const RankedTierList9x16: React.FC<RankedTierList9x16Props> = ({
  audioUrl,
  wordTimings,
  title,
  subtitle,
  sectionLabel,
  items,
  revealDirection,
  revealFrames,
  holdFrames,
  firstItemEnterSeconds,
  sideBySideHost,
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
  // Empty string in a color prop = "use palette default".
  const colors = resolveColors(palette, {
    paper: paperColor || undefined,
    ink: inkColor || undefined,
    accent: accentColor || undefined,
    muted: mutedColor || undefined,
  });

  const surfaceMode: "cream" | "dark" =
    palette === "dark" || palette === "warm-black" || palette === "true-black"
      ? "dark"
      : "cream";

  const resolvedAccent = subjectTool
    ? getToolAccentForSurface(subjectTool, surfaceMode)
    : colors.accent;
  const resolvedPaper = colors.paper;
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette as PaletteMode).grainOverlay;

  // ─── Layout the item list ─────────────────────────────────────────
  // Items are given in REVEAL order. The visual stack from top→bottom mirrors
  // that order (item[0] = top card, item[N-1] = bottom card).
  // revealDirection controls which visual position enters first:
  //   - "bottom-up": bottom card enters first; top card enters LAST (climax).
  //     => revealIndex(i) = items.length - 1 - i
  //   - "top-down": top card enters first; bottom card enters LAST.
  //     => revealIndex(i) = i
  const itemsW = sideBySideHost ? ITEM_W_SIDE : ITEM_W_FULL;
  const itemsLeft = sideBySideHost
    ? FRAME_W - itemsW - SIDE_RIGHT_MARGIN
    : (FRAME_W - itemsW) / 2;

  // Stack items vertically with a fixed gap, anchored to the BOTTOM of the
  // items zone — Hormozi's tier list visually grows from a stable baseline.
  const N = items.length;
  const stackH = N * ITEM_H + Math.max(0, N - 1) * ITEM_GAP;
  // Center the stack within the items zone, but anchor it from the bottom-up
  // so adding/removing items shifts the TOP of the stack, not the baseline.
  const stackTop = Math.max(
    ITEMS_TOP_Y,
    ITEMS_TOP_Y + Math.max(0, ITEMS_ZONE_HEIGHT - stackH),
  );

  const baseStartFrame = Math.round(firstItemEnterSeconds * fps);

  // The single glowing ACTIVE row (adamrosler / leaderboard signature): exactly
  // one row stays distinguished with a persistent accent glow. Prefer the literal
  // rank-"1" / winner row (matches adamrosler's gold #1 leaderboard row); fall
  // back to the climax row — the one that reveals LAST — when no plain "1" exists.
  const rankOneVisualIndex = items.findIndex((it) => it.rank.trim() === "1");
  const climaxVisualIndex = revealDirection === "bottom-up" ? 0 : N - 1;
  const activeVisualIndex =
    rankOneVisualIndex >= 0 ? rankOneVisualIndex : climaxVisualIndex;

  // Title block layout (left-aligned in side-by-side mode, centered otherwise).
  const titleLeft = sideBySideHost
    ? FRAME_W - itemsW - SIDE_RIGHT_MARGIN
    : (FRAME_W - ITEM_W_FULL) / 2;
  const titleWidth = sideBySideHost ? itemsW : ITEM_W_FULL;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio
          src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)}
        />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: surfaceMode === "dark" ? "screen" : "multiply",
          pointerEvents: "none",
        }}
      />

      {/* Universal house-grammar breadcrumb */}
      {breadcrumb && (
        <BrandBreadcrumb
          text={breadcrumb.text}
          date={breadcrumb.date}
          accentColor={resolvedAccent}
          topPx={BREADCRUMB_Y}
        />
      )}

      {/* Section label */}
      {sectionLabel && (
        <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />
      )}

      {/* Title + subtitle (always visible from frame 0) */}
      <TitleBlock
        title={title}
        subtitle={subtitle}
        inkColor={resolvedInk}
        accentColor={resolvedAccent}
        mutedColor={resolvedMuted}
        paletteMode={palette as PaletteMode}
        centered={!sideBySideHost}
        leftPx={titleLeft}
        widthPx={titleWidth}
      />

      {/* Reserved host slot indicator — invisible region (no drawn UI) but kept
          here as documentation: when sideBySideHost === true, the left
          HOST_SLOT_WIDTH px are intentionally empty for the host overlay. */}
      {sideBySideHost && (
        <AbsoluteFill
          style={{
            // No-op visual; this div is just a spec marker. Render nothing.
            pointerEvents: "none",
            // width box (debug only, kept opacity 0)
            left: 0,
            width: HOST_SLOT_WIDTH,
            opacity: 0,
          }}
        />
      )}

      {/* Tier cards */}
      {items.map((item, i) => {
        const topPx = stackTop + i * (ITEM_H + ITEM_GAP);
        const revealIndex =
          revealDirection === "bottom-up" ? N - 1 - i : i;
        return (
          <TierCard
            key={`tier-${i}`}
            item={item}
            visualIndex={i}
            revealIndex={revealIndex}
            isClimax={i === activeVisualIndex}
            topPx={topPx}
            leftPx={itemsLeft}
            widthPx={itemsW}
            baseStartFrame={baseStartFrame}
            revealFrames={revealFrames}
            holdFrames={holdFrames}
            paperColor={resolvedPaper}
            inkColor={resolvedInk}
            accentColor={resolvedAccent}
            mutedColor={resolvedMuted}
            paletteMode={palette as PaletteMode}
          />
        );
      })}

      {/* Word-by-word caption strip (bottom) */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 100,
            fontSize: captionFontSize,
            accentColor: resolvedAccent,
            mutedBorderColor: `${resolvedMuted}33`,
            maxWidthPx: 920,
            paperColor: resolvedPaper,
            inkColor: resolvedInk,
          }}
        />
      )}

      {/* Frame-bounds reference (no visual) to silence the unused FRAME_H constant. */}
      {FRAME_H > 0 ? null : null}
    </AbsoluteFill>
  );
};
