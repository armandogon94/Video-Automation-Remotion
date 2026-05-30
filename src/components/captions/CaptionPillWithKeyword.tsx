/**
 * CaptionPillWithKeyword — the "one orange keyword caption pill" atomic molecule.
 *
 * WHY THIS EXISTS
 * ---------------
 * Per the R4B Wave-7 Batch 3 Extension finding (see
 * `references/creators/natebjones/ANALYSIS-VOTE1.md` row #9 and
 * `ANALYSIS-VOTE2.md` notes around the Runtime/Cards beat), Nate B Jones uses
 * a single recurring atom across ALL 6 new 16:9 patterns (N1–N6): a centered
 * bordered/translucent pill below the active content containing a full
 * sentence where exactly ONE word is tinted his signature TNF orange
 * (`#E07B3C`). Every other word stays warm-white.
 *
 * This is the "Stripe Press in motion" voice — refined, restrained, single
 * typographic highlight. It is NOT the punchy 9:16 register (yellow karaoke
 * active-word `#F1C232` from Hormozi) and NOT the editorial cyan
 * (`#5BC0E8` from Sahil Bloom). The keyword is set in code at composition
 * time, not driven by whisper alignment — that's what makes it a "typographic
 * highlight" instead of a karaoke active-word.
 *
 * USAGE
 * -----
 * Drop as a direct child of any 16:9 composition. It is intentionally NOT
 * wrapped in a `<Sequence>` — it reads `useCurrentFrame()` itself and applies
 * its own visibility window via `startFrame` / `endFrame` so parents can
 * place it anywhere in the tree without resetting frame coordinates.
 *
 *   <CaptionPillWithKeyword
 *     text="Runtime makes local AI feel normal"
 *     keyword="Runtime"
 *     anchor="absolute-bottom"
 *     bottomPx={120}
 *     startFrame={36}
 *     endFrame={150}
 *   />
 */

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { BRAND, FONT_STACKS } from "../../brand";

/**
 * Nate B Jones's signature accent — sampled from his fullscreen-card scenes
 * (e.g. the `Runtime` highlight and the `5+` count badges). Internally
 * nicknamed "TNF orange" after the recurring tint band identified during R4B
 * scoring. Now graduated to the brand palette as `BRAND.colors.keywordOrange`.
 *
 * Source: references/creators/natebjones/ANALYSIS-VOTE1.md §Visual motifs
 * ("a tight 5-color accent palette (orange `#E07B3C`, cyan ...)").
 */
const TNF_ORANGE = BRAND.colors.keywordOrange;

export interface CaptionPillWithKeywordProps {
  /** Full caption text. */
  text: string;
  /** Single word inside `text` to highlight. Case-sensitive exact match;
   *  if not found, no highlight applied. */
  keyword: string;
  /** Color of the highlighted keyword. Default: TNF orange accent. */
  keywordColor?: string;
  /** Background of the pill. Default: 'rgba(255,255,255,0.08)' (translucent
   *  over dark slate). */
  pillBg?: string;
  /** Anchor mode. Default 'below-content' (just centered, position left
   *  to parent). */
  anchor?: "below-content" | "lower-third" | "absolute-bottom";
  /** Absolute bottom offset in px when anchor='absolute-bottom'. Default 120. */
  bottomPx?: number;
  /** Font size in px. Default 36. */
  fontSize?: number;
  /** Padding inside pill. Default '12px 28px'. */
  padding?: string;
  /** Border radius. Default 999 (full pill). */
  borderRadius?: number;
  /** Optional in/out animation. Default 'fade' (8-frame fade in/out). */
  transitionVerb?: "fade" | "pop" | "none";
  /** Start frame (relative to parent). Default 0. */
  startFrame?: number;
  /** End frame (relative to parent). Default Infinity
   *  (renders until composition ends). */
  endFrame?: number;
}

/**
 * Splits `text` at the first case-sensitive occurrence of `keyword` and
 * returns three React fragments: prefix, keyword span (tinted), suffix.
 * If `keyword` isn't found OR is empty, returns the whole text as one
 * plain fragment so the caller can still render a valid pill.
 */
function renderTextWithKeyword(
  text: string,
  keyword: string,
  keywordColor: string,
): React.ReactNode {
  if (!keyword) {
    return text;
  }
  const idx = text.indexOf(keyword);
  if (idx < 0) {
    return text;
  }
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + keyword.length);
  const after = text.slice(idx + keyword.length);
  return (
    <>
      {before}
      <span style={{ color: keywordColor }}>{match}</span>
      {after}
    </>
  );
}

/**
 * The atom itself.
 *
 * - Reads `useCurrentFrame()` to drive its own visibility window
 *   (`startFrame` / `endFrame`) and fade envelope.
 * - Renders nothing (returns `null`) when the current frame falls outside
 *   the window — so it's safe to leave mounted across the full timeline.
 * - Positioning is controlled by `anchor`; the parent owns horizontal
 *   centering for `below-content`, and the molecule self-anchors for
 *   `lower-third` and `absolute-bottom`.
 */
export const CaptionPillWithKeyword: React.FC<CaptionPillWithKeywordProps> = ({
  text,
  keyword,
  keywordColor = TNF_ORANGE,
  pillBg = "rgba(255,255,255,0.08)",
  anchor = "below-content",
  bottomPx = 120,
  fontSize = 36,
  padding = "12px 28px",
  borderRadius = 999,
  transitionVerb = "fade",
  startFrame = 0,
  endFrame = Infinity,
}) => {
  const frame = useCurrentFrame();

  // Outside the visible window: render nothing.
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Fade envelope. The window's tail end is `endFrame`, which may be
  // Infinity — in that case there is no fade-out beat to compute, so we
  // hold at full opacity past startFrame + fadeInFrames.
  const FADE_FRAMES = 8;
  let opacity = 1;
  if (transitionVerb === "fade") {
    const fadeIn = interpolate(
      frame,
      [startFrame, startFrame + FADE_FRAMES],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.ease),
      },
    );
    let fadeOut = 1;
    if (Number.isFinite(endFrame)) {
      fadeOut = interpolate(
        frame,
        [endFrame - FADE_FRAMES, endFrame],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.ease),
        },
      );
    }
    opacity = Math.min(fadeIn, fadeOut);
  }
  // 'pop' and 'none' both render at full opacity inside the window.

  // Build the positioning style per anchor mode.
  const positionStyle: React.CSSProperties = (() => {
    switch (anchor) {
      case "absolute-bottom":
        return {
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: bottomPx,
        };
      case "lower-third":
        // center-y at 66% screen height → pill bottom sits at 33% from the
        // bottom edge so the optical centre of a short pill lands near the
        // lower-third line.
        return {
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "33%",
        };
      case "below-content":
      default:
        // Normal flow — parent decides where this lands and how it's
        // horizontally aligned. We still self-center the inline-block pill
        // so the caller can drop it into a flex column without extra work.
        return {
          display: "flex",
          justifyContent: "center",
        };
    }
  })();

  const pillStyle: React.CSSProperties = {
    display: "inline-block",
    background: pillBg,
    color: "#FFFFFF",
    fontFamily: FONT_STACKS.sans,
    fontWeight: 500,
    fontSize,
    letterSpacing: "0.01em",
    padding,
    borderRadius,
    opacity,
    whiteSpace: "nowrap",
  };

  return (
    <div style={positionStyle}>
      <div style={pillStyle}>
        {renderTextWithKeyword(text, keyword, keywordColor)}
      </div>
    </div>
  );
};

export default CaptionPillWithKeyword;
