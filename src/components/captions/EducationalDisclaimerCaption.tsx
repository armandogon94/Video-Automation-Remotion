/**
 * EducationalDisclaimerCaption — Hormozi's compliance-moat molecule.
 *
 * Cited finding: R4A Hormozi +15 (Wave-7 Batch 3) NEW-H12
 * `EducationalDisclaimerCaptionBlock`. See
 * `references/creators/alexhormozi/ANALYSIS.md` → "Wave-7 Batch 3 Extension" §
 * "NEW-H12 — EducationalDisclaimerCaptionBlock" (videos `fr78adfAnuA`,
 * `XsWSvz-aewA`, `-j8_YCWZ05Q`, `sGakuNs9mT4`, `jfW6gL6hKhk`, `uWdIgftpvBI`).
 *
 * The Hormozi reference: 3-line white sans-serif caption at bottom-center,
 * fade in over 8 frames, hold ~90 frames, fade out over 12 frames. Text reads
 * roughly "Information shared here is for educational purposes only / Individuals
 * and business owners should evaluate their own business strategies, and identify
 * any potential risks / The information shared here is not a guarantee of
 * success. Your results may vary." plus a Copyright line. Hormozi's compliance
 * moat for money / investment / business-coaching content.
 *
 * Hormozi is currently the only creator in our corpus using this pattern (no
 * cross-creator twin found in Wave-7), but the molecule is intentionally
 * generalizable to any educational / legal / compliance overlay — think:
 *  - "Not financial advice"
 *  - "For educational purposes only"
 *  - "Past performance does not guarantee future results"
 *  - "Results not typical. Your results may vary."
 *
 * Atomic overlay molecule: render as a child of any chassis (e.g. inside
 * <DarkSlateChassis16x9>{children}</DarkSlateChassis16x9>) alongside the
 * composition's primary content. Stateless — all timing math is computed
 * inline per frame (no useMemo needed).
 *
 * @dualAspect true — renders in both 9:16 and 16:9; parent positions/sizes the slot (Tier-B per ADR-001 §2.3). Source pattern: H12 (reshapes to 2-line in 9:16 per ANALYSIS §4).
 */
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export interface EducationalDisclaimerCaptionProps {
  /** 1-3 lines of disclaimer text. Each line renders on its own row. */
  lines: string[];
  /** Vertical anchor. Default 'bottom'. */
  anchor?: "bottom" | "top" | "center";
  /** Distance from anchored edge in px. Default 80 (above handle chip). */
  edgePx?: number;
  /** Font size. Default 18 (small, restrained, like real disclaimers). */
  fontSize?: number;
  /** Text color. Default rgba(255,255,255,0.6) — half-transparent white. */
  textColor?: string;
  /** Background. Default 'transparent' (no plate). Set rgba bg if wanted. */
  bgColor?: string;
  /** Padding inside if bg is set. Default '12px 24px'. */
  padding?: string;
  /** Border radius if bg is set. Default 8. */
  borderRadius?: number;
  /** Max width of the block. Default 900. */
  maxWidthPx?: number;
  /** Frame at which fade-in begins. Default 0. */
  startFrame?: number;
  /** Fade-in duration (frames). Default 8. */
  fadeInFrames?: number;
  /** Hold duration (frames). Default 90. */
  holdFrames?: number;
  /** Fade-out duration (frames). Default 12. */
  fadeOutFrames?: number;
}

export const EducationalDisclaimerCaption: React.FC<
  EducationalDisclaimerCaptionProps
> = ({
  lines,
  anchor = "bottom",
  edgePx = 80,
  fontSize = 18,
  textColor = "rgba(255,255,255,0.6)",
  bgColor = "transparent",
  padding = "12px 24px",
  borderRadius = 8,
  maxWidthPx = 900,
  startFrame = 0,
  fadeInFrames = 8,
  holdFrames = 90,
  fadeOutFrames = 12,
}) => {
  const frame = useCurrentFrame();

  // Guard: no content → render nothing.
  if (!lines || lines.length === 0) return null;

  // Total cycle window:
  //   [startFrame, startFrame + fadeInFrames + holdFrames + fadeOutFrames)
  // Outside this window we render null to avoid any DOM impact.
  const fadeInEnd = startFrame + fadeInFrames;
  const holdEnd = fadeInEnd + holdFrames;
  const fadeOutEnd = holdEnd + fadeOutFrames;

  if (frame < startFrame || frame >= fadeOutEnd) return null;

  // Opacity: fade-in (Easing.out) → hold → fade-out (Easing.in).
  let opacity: number;
  if (frame < fadeInEnd) {
    opacity = interpolate(frame, [startFrame, fadeInEnd], [0, 1], {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < holdEnd) {
    opacity = 1;
  } else {
    opacity = interpolate(frame, [holdEnd, fadeOutEnd], [1, 0], {
      easing: Easing.in(Easing.ease),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Anchor positioning — absolute coords, centered horizontally.
  const positionStyle: React.CSSProperties =
    anchor === "top"
      ? {
          position: "absolute",
          top: edgePx,
          left: "50%",
          transform: "translateX(-50%)",
        }
      : anchor === "center"
        ? {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }
        : {
            position: "absolute",
            bottom: edgePx,
            left: "50%",
            transform: "translateX(-50%)",
          };

  return (
    <div
      style={{
        ...positionStyle,
        opacity,
        pointerEvents: "none",
        maxWidth: maxWidthPx,
        background: bgColor,
        padding: bgColor !== "transparent" ? padding : undefined,
        borderRadius: bgColor !== "transparent" ? borderRadius : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize,
        letterSpacing: "0.02em",
        lineHeight: 1.3,
        color: textColor,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};
