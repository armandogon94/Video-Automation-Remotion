/**
 * NotificationToast — single iOS-style notification toast molecule. Wave-5
 * Tella synthesis T5 (`docs/research/wave-5/tella-motion-graphics-synthesis.md`)
 * companion to `<AppIconPair>` — frame ref `ykBDqicGx0M/frame-10` shows 2–4
 * toasts cascading from the top of the connected app.
 *
 * This is the MOLECULE (a single toast). Compositions stack 2–4 of these via
 * the `heldStaggerState` primitive from `src/animation/heldStagger.ts` to
 * encode the actual cascade with explicit dwell beats between drops.
 *
 * Choreography:
 *   - Enter: `translateY(-100)` → 0 with an overshoot spring (1.04 → 1.0),
 *     opacity 0 → 1, over `enterFrames` (default 8).
 *   - Hold: stays in place for `heldFrames` (default 60).
 *   - Exit: fade + `translateY(-40)` over `exitFrames` (default 6).
 *
 * Palette-aware:
 *   - `cream` / `paper` palettes → white toast, dark text.
 *   - `dark` / `warm-black` / `true-black` → `#1A1A22` toast, light text.
 *
 * `isReply` adds a subtle scale-pop snap-in on top of the drop (1.06 → 1.0
 * over the last 3 frames of the enter phase) so reply callouts feel like a
 * tactile "tap" rather than another silent drop.
 */
import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_STACKS, getPalette, isDarkPalette, type PaletteMode } from "../../brand";

export interface NotificationToastApp {
  /** App display name (e.g. "ChatGPT", "Gmail"). */
  name: string;
  /** Optional PNG path relative to /public. If absent, render fallback rounded
   *  rect filled with `brandColor` showing the first letter of `name`. */
  iconSrc?: string;
  /** Fallback color for the in-toast app badge. Default `#3F3F46`. */
  brandColor?: string;
}

export interface NotificationToastProps {
  /** App that the notification is from. */
  app: NotificationToastApp;
  /** Toast title (large bold). */
  title: string;
  /** Toast body (smaller, 1-2 lines). */
  body: string;
  /** Right-side timestamp (e.g. "now", "2m ago"). */
  timestamp?: string;
  /** Toast width (px). Default 720. */
  widthPx?: number;
  /** Y position of toast (anchored top-left). */
  topPx: number;
  /** Left position. If omitted, the toast is centered horizontally in the
   *  parent (works inside any AbsoluteFill / Sequence). */
  leftPx?: number;
  /** Entry frame within the parent sequence. Default 0. */
  enterFrame?: number;
  /** Frames the toast takes to drop in. Default 8. */
  enterFrames?: number;
  /** Frames the toast holds. Default 60. */
  heldFrames?: number;
  /** Frames the toast takes to slide out. Default 6. */
  exitFrames?: number;
  /** Palette mode for background tinting. Default 'cream'. */
  paletteMode?: PaletteMode;
  /** When true, snaps with a subtle scale-pop on entry (reply / callback). */
  isReply?: boolean;
}

function resolveIconSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const clean = src.startsWith("/") ? src.slice(1) : src;
  return staticFile(clean);
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";
  return trimmed[0].toUpperCase();
}

/** Resolve toast surface + text colors from palette mode. We hand-pick the
 *  toast surface separately from `palette.paper` because the toast sits OVER
 *  whatever background the composition has — it always wants a contrast card
 *  surface (white-on-anything for light palettes, near-black-on-anything for
 *  dark palettes), not the palette's actual paper. */
function resolveToastColors(paletteMode: PaletteMode): {
  surface: string;
  ink: string;
  muted: string;
  divider: string;
  shadow: string;
} {
  if (isDarkPalette(paletteMode)) {
    return {
      surface: "#1A1A22",
      ink: "#F5F5F7",
      muted: "#9A9AA8",
      divider: "rgba(255,255,255,0.08)",
      shadow: "0 18px 40px rgba(0, 0, 0, 0.55)",
    };
  }
  // cream / paper / anything else light
  return {
    surface: "#FFFFFF",
    ink: "#1A1A1A",
    muted: "#6B6760",
    divider: "rgba(0,0,0,0.06)",
    shadow: "0 18px 40px rgba(15, 27, 45, 0.18)",
  };
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  app,
  title,
  body,
  timestamp,
  widthPx = 720,
  topPx,
  leftPx,
  enterFrame = 0,
  enterFrames = 8,
  heldFrames = 60,
  exitFrames = 6,
  paletteMode = "cream",
  isReply = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reference the palette for any future tint usage — keeps the toast in
  // visual conversation with the rest of the composition (e.g. accent hooks).
  void getPalette(paletteMode);

  const toastColors = resolveToastColors(paletteMode);

  // ---- Entry: spring drop with mild overshoot (1.04 → 1.0).
  // Use a slightly less damped profile than EDITORIAL_SPRING so the toast has
  // a tiny "land" instead of a critical-damped settle (Tella frames show the
  // toasts visibly bounce one beat).
  const enterRaw = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
    durationInFrames: enterFrames,
  });
  // 0 → 1; overshoots slightly past 1 with the chosen damping.
  const enterOpacity = interpolate(enterRaw, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // translateY from -100 → 0 with overshoot built into the spring.
  const enterY = interpolate(enterRaw, [0, 1], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Scale: 0.96 → 1.04 → 1.0 (matches the spring's overshoot pattern). We
  // sample the spring raw output and re-map so we don't have to add a second
  // spring instance.
  const enterScale = interpolate(enterRaw, [0, 0.7, 1], [0.96, 1.04, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- Reply scale-pop: an additional 1.06 → 1.0 over the last 3 frames of
  // the enter phase, so the toast "snaps" on landing. No-op when isReply=false.
  const replyPopStart = enterFrame + Math.max(0, enterFrames - 3);
  const replyScale = isReply
    ? interpolate(frame, [replyPopStart, enterFrame + enterFrames], [1.06, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // ---- Exit: fade + translateY(-40) over `exitFrames` once the held phase ends.
  const exitStart = enterFrame + enterFrames + heldFrames;
  const exitProgress = interpolate(frame, [exitStart, exitStart + exitFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = 1 - exitProgress;
  const exitY = -40 * exitProgress;

  // Combine entry + exit transforms. Before exit, exitY is 0 and exitOpacity 1.
  const composedY = enterY + exitY;
  const composedOpacity = enterOpacity * exitOpacity;
  const composedScale = enterScale * replyScale;

  // Hide entirely once exit completes — saves render work for sibling toasts
  // staggered behind this one.
  if (frame >= exitStart + exitFrames) return null;
  // Hide before entry begins so absolute-positioned ghosts don't leak.
  if (frame < enterFrame) return null;

  const horizontalStyle: React.CSSProperties =
    leftPx !== undefined
      ? { left: leftPx }
      : { left: "50%", marginLeft: -widthPx / 2 };

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        ...horizontalStyle,
        width: widthPx,
        opacity: composedOpacity,
        transform: `translateY(${composedY}px) scale(${composedScale})`,
        transformOrigin: "top center",
        background: toastColors.surface,
        borderRadius: 28,
        boxShadow: toastColors.shadow,
        // iOS toasts have a hair-thin border in dark mode for separation.
        border: isDarkPalette(paletteMode)
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.04)",
        padding: "20px 24px",
        fontFamily: FONT_STACKS.sans,
        color: toastColors.ink,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top row: app icon + name (left) and timestamp (right). */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* App badge: icon img if provided, fallback initial chip otherwise. */}
          {app.iconSrc ? (
            <Img
              src={resolveIconSrc(app.iconSrc)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: app.brandColor ?? "#3F3F46",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              {initialOf(app.name)}
            </div>
          )}
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: toastColors.muted,
            }}
          >
            {app.name}
          </span>
        </div>
        {timestamp ? (
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 500,
              fontSize: 16,
              color: toastColors.muted,
            }}
          >
            {timestamp}
          </span>
        ) : null}
      </div>

      {/* Title row — large bold. */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.2,
          letterSpacing: "-0.005em",
        }}
      >
        {title}
      </div>

      {/* Body row — smaller, 1-2 lines. We clamp to 2 lines via webkit line-clamp
       *  for predictable layout when the body string is longer than expected. */}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.35,
          color: toastColors.ink,
          opacity: 0.85,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {body}
      </div>
    </div>
  );
};
