/**
 * NotesAppFrame — Wave-5 Tella-derived iOS-Notes-style chrome.
 *
 * Tella synthesis T4 (frame refs:
 *   docs/research/wave-5/tella-frames/ykBDqicGx0M/frame-06-t506.49s.jpg
 *   docs/research/wave-5/tella-frames/ykBDqicGx0M/frame-07-t590.91s.jpg):
 *   "iOS Notes app aesthetic — paper-color background, top status bar, large
 *    serif/sans title, date metadata, and a vertical list of items where each
 *    item slides up in turn with a brief dwell beat between entries."
 *
 * Choreography:
 *   - Title fades in (controllable via `animateTitle`)
 *   - First item begins entering `itemsStartOffsetFrames` frames after the title
 *   - Each item: translateY(60) → translateY(0), opacity 0 → 1, EDITORIAL_SPRING
 *   - heldStaggerState gives an explicit dwell after each item BEFORE the next
 *     one enters (T3-style ranked-tier rest beat)
 *
 * Chrome details:
 *   - Rounded paper-color rect (12px radius)
 *   - Top: status-bar row (9:41 / wifi / battery glyphs in mono)
 *   - Horizontal rule
 *   - Title (sans semibold ~64px), date sub-line (muted mono)
 *   - Body: vertical list with per-kind prefix glyph (dash / bullet / checkbox)
 *   - Per item supports an optional sub-text (paired by index via subItems)
 */
import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS, getPalette, type PaletteMode } from "../brand";
import { EDITORIAL_SPRING } from "../compositions/scenes";
import { heldStaggerState } from "../animation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotesItemKind = "bullet" | "checkbox" | "dash";

export interface NotesAppFrameProps {
  /** Top-bar title (e.g. "Marketing Ideas"). */
  title: string;
  /** Date / metadata shown small under the title. */
  dateLine?: string;
  /** List items that slide up one at a time. */
  items: string[];
  /** Optional sub-text under each item (paired by index). */
  subItems?: string[];
  /** Item type — bullet, checkbox, dash. Default 'dash' (iOS Notes default). */
  itemKind?: NotesItemKind;
  /** Whether the title fades in or is static. Default true. */
  animateTitle?: boolean;
  /** Frame at which the frame starts. */
  enterStartFrame?: number;
  /** Title entry duration. Default 10. */
  titleEnterFrames?: number;
  /** First item enters this many frames after the title. Default 12. */
  itemsStartOffsetFrames?: number;
  /** Per-item slide-up duration. Default 10. */
  itemEnterFrames?: number;
  /** Held duration AFTER each item before the next starts. Default 14. */
  itemHoldFrames?: number;
  /** Width of the notes frame. Default 880. */
  widthPx?: number;
  /** Height of the notes frame. Default 1200. */
  heightPx?: number;
  /** Palette mode. iOS Notes default = paper (warm off-white). */
  paletteMode?: PaletteMode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FRAME_RADIUS_PX = 12;
const STATUS_BAR_HEIGHT = 32;
const STATUS_BAR_FONT_SIZE = 16;
const TITLE_FONT_SIZE = 64;
const DATE_FONT_SIZE = 18;
const ITEM_FONT_SIZE = 32;
const SUB_ITEM_FONT_SIZE = 22;
const ITEM_GAP = 18;

// iOS Notes "paper" surface is slightly warmer than the project's paper palette
// when we're not already on `paper` mode — fallback yellow-tinted off-white.
function getNotesPaper(paletteMode: PaletteMode): string {
  switch (paletteMode) {
    case "dark":
      return "#15171C";
    case "warm-black":
      return "#13110F";
    case "true-black":
      return "#0A0A0A";
    case "paper":
      return "#FBF8F0";
    case "cream":
    default:
      return "#FBF8F0";
  }
}

function getDividerColor(paletteMode: PaletteMode): string {
  switch (paletteMode) {
    case "dark":
    case "warm-black":
    case "true-black":
      return "rgba(255,255,255,0.08)";
    case "paper":
    case "cream":
    default:
      return "rgba(0,0,0,0.10)";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status-bar glyphs (signal / wifi / battery — mono, monochromatic)
// ─────────────────────────────────────────────────────────────────────────────

const SignalGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width={18} height={12} viewBox="0 0 18 12" fill="none">
    <rect x={0} y={9} width={3} height={3} fill={color} />
    <rect x={5} y={6} width={3} height={6} fill={color} />
    <rect x={10} y={3} width={3} height={9} fill={color} />
    <rect x={15} y={0} width={3} height={12} fill={color} />
  </svg>
);

const WifiGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width={18} height={12} viewBox="0 0 18 12" fill="none">
    <path d="M9 11l-1.5-1.5a2 2 0 013 0L9 11z" fill={color} />
    <path
      d="M4 6.5a7 7 0 0110 0"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M1 3.5a11 11 0 0116 0"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const BatteryGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width={26} height={12} viewBox="0 0 26 12" fill="none">
    <rect
      x={0.6}
      y={0.6}
      width={22}
      height={10.8}
      rx={2.2}
      stroke={color}
      strokeWidth={1.2}
      fill="none"
    />
    <rect x={23.5} y={4} width={2} height={4} rx={0.8} fill={color} />
    <rect x={2} y={2} width={16} height={8} rx={1} fill={color} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Item prefix glyphs (dash / bullet / checkbox)
// ─────────────────────────────────────────────────────────────────────────────

const PrefixGlyph: React.FC<{ kind: NotesItemKind; color: string; sizePx: number }> = ({
  kind,
  color,
  sizePx,
}) => {
  switch (kind) {
    case "bullet":
      return (
        <svg width={sizePx} height={sizePx} viewBox="0 0 16 16" fill="none">
          <circle cx={8} cy={8} r={3.5} fill={color} />
        </svg>
      );
    case "checkbox":
      return (
        <svg width={sizePx} height={sizePx} viewBox="0 0 16 16" fill="none">
          <rect
            x={1.6}
            y={1.6}
            width={12.8}
            height={12.8}
            rx={3}
            stroke={color}
            strokeWidth={1.6}
            fill="none"
          />
          <path
            d="M4.5 8.5l2.2 2.2L11.5 5.5"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case "dash":
    default:
      return (
        <svg width={sizePx} height={sizePx} viewBox="0 0 16 16" fill="none">
          <rect x={3} y={7.2} width={10} height={1.6} rx={0.8} fill={color} />
        </svg>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NotesAppFrame
// ─────────────────────────────────────────────────────────────────────────────

export const NotesAppFrame: React.FC<NotesAppFrameProps> = ({
  title,
  dateLine,
  items,
  subItems,
  itemKind = "dash",
  animateTitle = true,
  enterStartFrame = 0,
  titleEnterFrames = 10,
  itemsStartOffsetFrames = 12,
  itemEnterFrames = 10,
  itemHoldFrames = 14,
  widthPx = 880,
  heightPx = 1200,
  paletteMode = "paper",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = getPalette(paletteMode);
  const localFrame = frame - enterStartFrame;

  const notesPaper = getNotesPaper(paletteMode);
  const dividerColor = getDividerColor(paletteMode);

  // ── Title entry ───────────────────────────────────────────────────────────
  const titleSpring = spring({
    frame: localFrame,
    fps,
    config: EDITORIAL_SPRING,
    durationInFrames: titleEnterFrames,
  });
  const titleOpacity = animateTitle
    ? interpolate(titleSpring, [0, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const titleTranslateY = animateTitle
    ? interpolate(titleSpring, [0, 1], [12, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Items start AFTER the title settles + the configured offset.
  const itemsBaseStart = titleEnterFrames + itemsStartOffsetFrames;

  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        background: notesPaper,
        borderRadius: FRAME_RADIUS_PX,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: FONT_STACKS.sans,
        color: palette.ink,
        boxShadow:
          paletteMode === "cream" || paletteMode === "paper"
            ? "0 14px 40px rgba(0,0,0,0.10)"
            : "0 14px 40px rgba(0,0,0,0.45)",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: STATUS_BAR_HEIGHT,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: FONT_STACKS.mono,
          fontSize: STATUS_BAR_FONT_SIZE,
          fontWeight: 600,
          color: palette.ink,
          flexShrink: 0,
        }}
      >
        <span style={{ letterSpacing: "0.02em" }}>9:41</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SignalGlyph color={palette.ink} />
          <WifiGlyph color={palette.ink} />
          <BatteryGlyph color={palette.ink} />
        </span>
      </div>

      {/* Horizontal rule below status bar */}
      <div
        style={{
          height: 1,
          background: dividerColor,
          width: "100%",
          flexShrink: 0,
        }}
      />

      {/* Title block */}
      <div
        style={{
          padding: "28px 28px 18px 28px",
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontSize: TITLE_FONT_SIZE,
            fontWeight: 600,
            lineHeight: 1.05,
            color: palette.ink,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {dateLine ? (
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT_STACKS.mono,
              fontSize: DATE_FONT_SIZE,
              fontWeight: 400,
              color: palette.muted,
              letterSpacing: "0.04em",
            }}
          >
            {dateLine}
          </div>
        ) : null}
      </div>

      {/* Item list */}
      <div
        style={{
          padding: "8px 28px 28px 28px",
          display: "flex",
          flexDirection: "column",
          gap: ITEM_GAP,
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        {items.map((item, i) => {
          const state = heldStaggerState({
            frame: localFrame,
            index: i,
            baseStartFrame: itemsBaseStart,
            revealFrames: itemEnterFrames,
            holdFrames: itemHoldFrames,
          });

          // Use EDITORIAL_SPRING for the overshoot via a per-item spring driven
          // by the held-stagger's enter window. We rebuild the local frame
          // window from the schedule so the spring lives in [0, itemEnterFrames].
          const step = itemEnterFrames + itemHoldFrames;
          const itemEnter = itemsBaseStart + i * step;
          const itemLocal = localFrame - itemEnter;
          const itemSpring = spring({
            frame: itemLocal,
            fps,
            config: EDITORIAL_SPRING,
            durationInFrames: itemEnterFrames,
          });

          // Pre-state: keep the item invisible BEFORE its turn.
          const visible =
            state.phase === "entering" ||
            state.phase === "held" ||
            state.phase === "past";

          const itemTranslateY = visible
            ? interpolate(itemSpring, [0, 1], [60, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 60;
          const itemOpacity = visible
            ? interpolate(itemSpring, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          const sub = subItems?.[i];

          return (
            <div
              key={`note-item-${i}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                opacity: itemOpacity,
                transform: `translateY(${itemTranslateY}px)`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  paddingTop: ITEM_FONT_SIZE * 0.25,
                }}
              >
                <PrefixGlyph
                  kind={itemKind}
                  color={palette.muted}
                  sizePx={16}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    fontFamily: FONT_STACKS.sans,
                    fontSize: ITEM_FONT_SIZE,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    color: palette.ink,
                  }}
                >
                  {item}
                </div>
                {sub ? (
                  <div
                    style={{
                      fontFamily: FONT_STACKS.sans,
                      fontSize: SUB_ITEM_FONT_SIZE,
                      fontWeight: 400,
                      lineHeight: 1.4,
                      color: palette.muted,
                    }}
                  >
                    {sub}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
