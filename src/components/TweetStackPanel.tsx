/**
 * TweetStackPanel — Hormozi consensus pattern H2 (HormoziTweetCardStackBuild).
 *
 * Wave-6 Hormozi long-form consensus pattern H2
 *   (ref: docs/research/wave-6/alexhormozi-longform-consensus.md,
 *    frames: references/creators/alexhormozi/longform-frames/XGm2ERU9qtA/
 *      v2-anim-01-frame-012.jpg, v2-anim-05-frame-001.jpg,
 *    clips: docs/research/wave-6/references/alexhormozi/
 *      XGm2ERU9qtA-anim-04.mp4 (vote1 two cards visible),
 *      XGm2ERU9qtA-anim-02-v2.mp4 (vote2 stack build),
 *      XGm2ERU9qtA-anim-04-v2.mp4 (vote2),
 *      XGm2ERU9qtA-anim-05-v2.mp4 (vote2 append-up)).
 *
 *   transitionVerb: "Tweet cards arrive one at a time at cardIntervalFrames
 *   cadence; each new card slides into the stack from below (append='down') or
 *   above (append='up') over slideInFrames using outCubic; while the newest
 *   card slides in, the existing cards concurrently shift in the same direction
 *   to make room, so the visible stack always grows from a single anchor point."
 *
 * Choreography: a vertical stack of `<SocialPostCard variant="text-only">`
 * cards. New cards enter at a steady cadence, and as each newcomer slides into
 * place the EXISTING cards shift by exactly one slot in the same direction —
 * so the stack always grows from the same anchor edge (the bottom anchor for
 * append='down', the top anchor for append='up').
 *
 * Pure React FC. Reads `useCurrentFrame()` + `useVideoConfig()` internally so
 * the caller can drop it anywhere (top-level `<AbsoluteFill>` or inside a
 * `<Sequence>`). Each child `<SocialPostCard>` runs its OWN internal entry
 * choreography (avatar pop, name slide, body line-by-line) keyed off its
 * scheduled `enterStartFrame`.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SocialPostCard } from "./SocialPostCard";
import type { PaletteMode } from "../brand";
import { outCubic, outQuart, inOutCubic } from "../timing/easing";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TweetStackEntry {
  /** Author block — passed straight through to <SocialPostCard>. */
  author: {
    avatarSrc?: string;
    name: string;
    handle: string;
    verified?: boolean;
  };
  /** Tweet body text. Line breaks split into per-line reveals inside the card. */
  body: string;
  /** Optional numbered badge — Hormozi listicle pattern (1, 2, 3...). */
  numberedBadgeNumber?: number | string;
}

export interface TweetStackPanelProps {
  /** Tweet entries to stack. */
  entries: TweetStackEntry[];
  /** Direction new cards arrive from. Default 'down'. */
  append?: "down" | "up";
  /** Card width in px. Default 720. */
  cardWidthPx?: number;
  /** Vertical gap between cards in the stack (px). Default 28. */
  cardGapPx?: number;
  /** Horizontal anchor — left/center/right of canvas. Default 'right' (Hormozi most common). */
  anchor?: "left" | "center" | "right";
  /** Edge inset when anchor is left/right. Default 80. */
  anchorInsetPx?: number;
  /**
   * Where the bottom of the visible stack sits on the canvas (px from the top).
   * Default 880 — sized for a 1920×1080 16:9 canvas. For 9:16 (1080×1920),
   * pass something like 1700.
   */
  stackBottomPx?: number;
  /** Frame at which the first card enters. Default 0. */
  startFrame?: number;
  /** Frames between successive card entries. Default 60 (2s @ 30fps — Hormozi cadence). */
  cardIntervalFrames?: number;
  /** Frames each card takes to slide in. Default 14. */
  slideInFrames?: number;
  /** Easing for slide-in. Default 'outCubic'. */
  easing?: "outCubic" | "outQuart" | "inOutCubic";
  /** Accent color for numbered badges. Default lime #C4F84A (Hormozi). */
  badgeStrokeColor?: string;
  /** Badge diameter in px. Default 64. */
  badgeSizePx?: number;
  /**
   * Max cards visible at once. When adding the (N+1)th, the oldest scrolls off
   * the far edge. Default Infinity (the stack just keeps growing).
   */
  maxVisibleCards?: number;
  /** Palette mode for the SocialPostCards. Default 'cream'. */
  paletteMode?: PaletteMode;
  /** Brand variant for the cards. Default 'twitter'. */
  brand?: "twitter" | "linkedin" | "neutral";
  /**
   * Estimated rendered height per card (px). Used for the shift-math since we
   * don't measure cards via the DOM in Remotion's offscreen render pass.
   * Default 220 — tuned for short Hormozi-style tweet bodies (~2-3 lines).
   * Tune up if your bodies run longer.
   */
  estimatedCardHeightPx?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pickEase(
  name: NonNullable<TweetStackPanelProps["easing"]>,
): (t: number) => number {
  switch (name) {
    case "outQuart":
      return outQuart;
    case "inOutCubic":
      return inOutCubic;
    case "outCubic":
    default:
      return outCubic;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TweetStackPanel
// ─────────────────────────────────────────────────────────────────────────────

export const TweetStackPanel: React.FC<TweetStackPanelProps> = ({
  entries,
  append = "down",
  cardWidthPx = 720,
  cardGapPx = 28,
  anchor = "right",
  anchorInsetPx = 80,
  stackBottomPx = 880,
  startFrame = 0,
  cardIntervalFrames = 60,
  slideInFrames = 14,
  easing = "outCubic",
  badgeStrokeColor = "#C4F84A",
  badgeSizePx = 64,
  maxVisibleCards = Infinity,
  paletteMode = "cream",
  brand = "twitter",
  estimatedCardHeightPx = 220,
}) => {
  const frame = useCurrentFrame();
  // useVideoConfig() is read so the component is anchored to the current
  // composition (matches the rest of our motion primitives — SocialPostCard,
  // BrandBreadcrumb16x9, NotesAppFrame). We don't currently use width/height
  // for layout (anchor + stackBottomPx do that), but keeping the hook call
  // signals "this is a Remotion-aware component" and lets future overrides
  // (e.g. "centre on canvas width") read fps/width without an API change.
  useVideoConfig();

  const ease = pickEase(easing);
  const slotHeight = estimatedCardHeightPx + cardGapPx;

  // ── 1) Schedule per-card entry frames. ────────────────────────────────────
  // Card i enters at startFrame + i * cardIntervalFrames.
  const cardSchedule = entries.map((_, i) => startFrame + i * cardIntervalFrames);

  // ── 2) Determine which cards are currently in-flight / settled. ──────────
  // A card is "active" once frame >= its entry frame.
  const activeIndices: number[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (frame >= cardSchedule[i]) activeIndices.push(i);
  }

  // ── 3) Apply maxVisibleCards window: keep only the most-recent N. ────────
  // The cards that scrolled off the far edge still need to be rendered for
  // ONE more `slideInFrames` window so they can animate OUT of the stack as
  // their successor pushes them past the visible boundary; after that window
  // they unmount.
  const visibleStartIdx = Math.max(0, activeIndices.length - maxVisibleCards);
  const visibleIndices = activeIndices.slice(visibleStartIdx);

  // ── 4) Identify the newest in-flight card (drives the shift of every other
  //       card on screen). ───────────────────────────────────────────────────
  const newestIdx = visibleIndices.length > 0
    ? visibleIndices[visibleIndices.length - 1]
    : -1;
  const newestEntryFrame = newestIdx >= 0 ? cardSchedule[newestIdx] : 0;
  const newestProgressRaw =
    newestIdx >= 0
      ? interpolate(
          frame,
          [newestEntryFrame, newestEntryFrame + slideInFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;
  const newestProgress = ease(newestProgressRaw);

  // ── 5) Render each visible card with its own Y offset. ────────────────────
  //
  // For append='down', the newest card lives at the BOTTOM of the stack.
  // Slot 0 = bottom anchor, slot 1 = above it, etc.
  // For append='up', the newest card lives at the TOP of the stack.
  // Slot 0 = top anchor, slot 1 = below it, etc.
  //
  // While the newest is sliding in (progress < 1), every OTHER visible card
  // is interpolating from its previous slot to its new slot — shifted by one
  // in the same direction as the newcomer (away from the anchor edge).
  //
  // The newest card itself starts off-canvas in the SAME direction as the
  // anchor (below the bottom for append='down', above the top for
  // append='up') and slides into slot 0.

  // For positioning: we use a single `<AbsoluteFill>` and absolutely-position
  // each card. The horizontal anchor uses left/right insets; the vertical
  // anchor is computed off `stackBottomPx` (for 'down') or
  // `stackBottomPx - totalStackHeight` (for 'up' — top of where the stack
  // ends up sitting).

  // For 'up', we still measure from the TOP of the stack — that top is at
  // stackBottomPx - (maxVisible * cardHeight + (maxVisible - 1) * gap). To
  // keep the math simple AND give 'up' the same anchor semantics as 'down'
  // (the visible stack's far edge stays pinned), we treat `stackBottomPx`
  // as the BOTTOM of where the stack actually sits — for append='up', new
  // cards push DOWN, so the bottom stays put and the top grows upward.
  // ...except Hormozi's append-up reference (anim-05) shows the OPPOSITE:
  // the existing card stays put, and the NEW card lands ABOVE it. Net
  // effect: the BOTTOM anchor moves DOWN by one slot when a new card
  // appends "up". To square these two interpretations, we pin the bottom
  // of slot 0 to `stackBottomPx` in both modes; for 'up', the newcomer
  // arrives in slot (visibleCount - 1) — the top slot — and older cards
  // shift DOWN by one slot to make room. That matches Hormozi's behavior
  // and keeps the bottom edge of the stack visually anchored.

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {visibleIndices.map((entryIdx, visiblePos) => {
        const entry = entries[entryIdx];
        const isNewest = entryIdx === newestIdx;

        // Slot index within the current visible stack:
        //   - append='down': newest is at slot 0 (bottom); older cards stack upward.
        //     slot = (visibleIndices.length - 1) - visiblePos
        //   - append='up':   newest is at slot (visibleCount-1) (top);
        //     older cards sit below it. slot = visiblePos (older = lower slot
        //     since older indices come first in visibleIndices).
        //
        // Slot 0 always sits at `stackBottomPx` (its bottom edge pinned there
        // for append='down', or its bottom edge pinned there for append='up'
        // too — i.e. the bottom card stays at `stackBottomPx` in both modes).
        const settledSlot =
          append === "down"
            ? visibleIndices.length - 1 - visiblePos
            : visiblePos;

        // While the newest is sliding in, every OTHER card transitions from
        // its OLD slot (one closer to the anchor) to its NEW settled slot.
        // - For append='down': old cards were one slot LOWER (closer to bottom);
        //   they shift UP by one slot as the newcomer takes slot 0.
        //   OLD slot = settledSlot - 1; NEW slot = settledSlot.
        // - For append='up': old cards were one slot HIGHER (closer to top);
        //   they shift DOWN by one slot as the newcomer takes the top slot.
        //   OLD slot = settledSlot - 1; NEW slot = settledSlot.
        //
        // (Same formula in both directions because "old slot" in both modes
        // is the slot the card occupied BEFORE the newcomer existed.)
        const oldSlot = settledSlot - 1;
        const interpolatedSlot = isNewest
          ? settledSlot
          : oldSlot + (settledSlot - oldSlot) * newestProgress;

        // Convert slot index to Y position.
        // Slot 0's bottom is pinned to stackBottomPx → slot 0's top is at
        // stackBottomPx - estimatedCardHeightPx. Each successive slot moves
        // UP the canvas by one slotHeight (cardHeight + gap).
        const settledTopY =
          stackBottomPx - estimatedCardHeightPx - interpolatedSlot * slotHeight;

        // The newest card starts off-canvas in the anchor direction and
        // slides to its settled position.
        //   - append='down': enters from BELOW the anchor (Y starts at
        //     stackBottomPx + small offset, slides up to settledTopY).
        //   - append='up':   enters from ABOVE the top of the stack (Y starts
        //     above settledTopY and slides DOWN to it).
        //
        // We bias the off-canvas start by exactly one slot so the newcomer's
        // arrival mirrors the shift of the older cards.
        let topY = settledTopY;
        if (isNewest) {
          const offCanvasDelta =
            append === "down" ? slotHeight : -slotHeight;
          // At progress 0 the newcomer sits one slot in the anchor direction;
          // at progress 1 it sits at settledTopY.
          topY = settledTopY + offCanvasDelta * (1 - newestProgress);
        }

        // Opacity: newcomers fade in over the slide; everyone else stays
        // fully visible. We also fade OUT cards that have just scrolled off
        // the visible window (if maxVisibleCards is finite and a card was
        // bumped). Bumped cards aren't in visibleIndices at all, so we don't
        // render them — the cap on maxVisibleCards is a hard cut. A future
        // refinement could keep them mounted for one more slideInFrames to
        // animate them out; for now the cap is intentionally a hard limit.
        const opacity = isNewest
          ? interpolate(newestProgressRaw, [0, 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;

        // Horizontal anchor → left/right CSS positioning.
        const horizontalStyle: React.CSSProperties =
          anchor === "left"
            ? { left: anchorInsetPx, right: "auto" }
            : anchor === "right"
              ? { right: anchorInsetPx, left: "auto" }
              : {
                  left: "50%",
                  right: "auto",
                  transform: `translateX(-50%)`,
                };

        // For 'center' anchor we need to compose the centering transform
        // with the vertical positioning; we wrap each card in its own
        // absolutely-positioned div and use `top` for Y so the card's own
        // anchor logic (inside SocialPostCard) doesn't fight us.
        const baseTransform =
          anchor === "center" ? "translateX(-50%)" : "none";

        return (
          <div
            key={`tweet-stack-${entryIdx}`}
            style={{
              position: "absolute",
              top: topY,
              ...horizontalStyle,
              transform: baseTransform,
              opacity,
              willChange: "transform, top, opacity",
            }}
          >
            <SocialPostCard
              author={entry.author}
              body={entry.body}
              variant="text-only"
              // anchor='center' so SocialPostCard doesn't add its own
              // absolute positioning — our wrapper owns the layout.
              anchor="center"
              widthPx={cardWidthPx}
              enterStartFrame={cardSchedule[entryIdx]}
              paletteMode={paletteMode}
              brand={brand}
              numberedBadge={
                entry.numberedBadgeNumber !== undefined
                  ? {
                      number: entry.numberedBadgeNumber,
                      strokeColor: badgeStrokeColor,
                      sizePx: badgeSizePx,
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
