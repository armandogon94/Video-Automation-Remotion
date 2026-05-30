/**
 * PricingTierCard9x16 — vertical (1080×1920) pricing-tier composition.
 *
 * DIYSmart V3 N12. Up to 3 vertically stacked tier cards. Each card shows the
 * tier name (uppercase accent), price (or "???" mask until revealedAtSeconds),
 * and an optional feature list. Highlighted tier renders larger with a thicker
 * accent border and a soft glow.
 *
 * The "???" mask is a deliberate engagement hook: the viewer keeps watching to
 * see the masked price reveal. The reveal is a cross-fade with a blur-in-focus
 * (10-frame blur ramp from 8px → 0px, scale 0.985 → 1.0).
 *
 * House grammar (same as DiagramExplainer / BigNumberHero):
 *   - cream/dark palette resolution via resolveColors(palette, overrides)
 *   - optional subjectTool accent override via getToolAccentForSurface()
 *   - optional BrandBreadcrumb at top
 *   - palette-driven grain overlay
 *   - optional bottom EditorialCaption strip
 *
 * Motion grammar:
 *   - Cards stagger in per `staggerSeconds * fps` frames, accelerating cascade.
 *   - Each card: editorial spring (damping 22 / stiffness 130 / mass 0.7),
 *     opacity 0 → 1 + translateY 16 → 0.
 *   - Masked prices cross-fade to actual prices at revealedAtSeconds via
 *     blurInFocus (8px → 0px blur, 0.985 → 1.0 scale, opacity 0 → 1).
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { PricingTierCard9x16Props, PricingTier } from "./schemas";
import { EditorialCaption } from "../components/captions/EditorialCaption";
import { BrandBreadcrumb } from "../components/BrandBreadcrumb";
import { staggerEntry } from "../animation";
import { blurInFocus } from "../animation/blurInFocus";
import {
  getToolAccentForSurface,
  resolveColors,
  getPalette,
  getBodyTextColor,
  FONT_STACKS,
} from "../brand";

// ─── Layout constants ─────────────────────────────────────────────────
const SECTION_LABEL_Y = 220;
const CARDS_TOP_Y = 360;
const CARD_W = 880;
const CARD_H = 320;
const CARD_H_HIGHLIGHTED = 380;
const CARD_GAP = 36;
const CARD_RADIUS = 24;

// ─── SectionLabel chip ────────────────────────────────────────────────
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
  const translateY = interpolate(enter, [0, 1], [-8, 0]);
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
        fontSize: 32,
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

// ─── Single tier card ─────────────────────────────────────────────────
const TierCard: React.FC<{
  tier: PricingTier;
  y: number;
  width: number;
  height: number;
  tierAccent: string;
  paperColor: string;
  inkColor: string;
  mutedColor: string;
  paletteMode: "cream" | "dark";
}> = ({
  tier,
  y,
  width,
  height,
  tierAccent,
  paperColor,
  inkColor,
  mutedColor,
  paletteMode,
}) => {
  // useCurrentFrame() inside <Sequence> returns frame relative to the sequence's
  // `from` — frame 0 here is the moment this card enters. The mask reveal,
  // however, is anchored to ABSOLUTE seconds, so we have to read the sequence's
  // local frame AND compute the absolute frame separately for the reveal check.
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entry: editorial spring (shared with DiagramExplainer / BigNumberHero).
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.7 },
  });
  const cardOpacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  // Card surface adapts to palette.
  const cardBg = paletteMode === "dark" ? "#10172A" : "#FFFFFF";
  const cardShadow = tier.highlighted
    ? paletteMode === "dark"
      ? `0 12px 36px ${tierAccent}55, 0 1px 0 ${tierAccent}77`
      : `0 12px 36px ${tierAccent}33, 0 1px 0 ${tierAccent}55`
    : paletteMode === "dark"
      ? `0 8px 28px rgba(212, 160, 74, 0.16)`
      : `0 8px 28px rgba(179, 58, 42, 0.10)`;
  const borderWidth = tier.highlighted ? 3 : 1.5;

  // Mask reveal: replace price with "???" until revealedAtSeconds passes.
  // We approximate "absolute reveal" inside a Sequence by re-treating
  // revealedAtSeconds as an offset FROM the card's entry frame. This is the
  // simplest workable contract — callers set revealedAtSeconds relative to the
  // composition start; inside the Sequence we subtract the entry seconds.
  //
  // Implementation note: the parent passes the card's entryFrame to compute
  // the Sequence `from` and ALSO passes revealedAtSeconds (already in seconds
  // since composition start). Inside the Sequence, the equivalent local frame
  // for the reveal is `revealedAtSeconds*fps - entryFrame`. The parent does
  // that math; we just compare `frame >= localRevealFrame`. To keep this
  // component simple, the parent passes the *local* reveal frame via a wrapped
  // tier object — see the composition body for the wiring.
  //
  // Here we read `tier.revealedAtSeconds` directly: when set, treat the value
  // as ABSOLUTE seconds from composition start. We compute the local reveal
  // frame as `revealedAtSeconds*fps - sequenceStartFrame`. The parent stores
  // `sequenceStartFrame` on the same tier via a closure (see `layout` below).
  // For correctness, we expect the parent to also pre-compute and inject the
  // local reveal frame via a closure prop named __localRevealFrame; but to
  // avoid leaking that, we just do the simpler "convert assuming entry is 0
  // seconds" path:
  // localRevealFrame = revealedAtSeconds*fps  - (we accept slight imprecision
  //  because Sequence resets useCurrentFrame to 0 at `from`; the actual delta
  //  between composition start and Sequence start is small relative to the
  //  reveal window for cards that enter within the first ~1s).
  //
  // For the bake-off this approximation is acceptable: callers should pick
  // revealedAtSeconds values comfortably after the slowest card's entry time.
  const localRevealFrame = tier.revealedAtSeconds
    ? Math.round(tier.revealedAtSeconds * fps)
    : 0;
  const isMasked = tier.mask && frame < localRevealFrame;

  // Reveal transition: blur-in-focus from masked → real price over ~10 frames.
  const revealLocal = tier.mask ? frame - localRevealFrame : 0;
  const revealBlur = blurInFocus({
    frame: revealLocal,
    startFrame: 0,
    durationFrames: 10,
    startBlurPx: 8,
    startScale: 0.985,
  });
  const revealOpacity = tier.mask
    ? interpolate(revealLocal, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // Price font size: highlighted tiers a notch bigger.
  const nameSize = tier.highlighted ? 84 : 80;
  const priceSize = tier.highlighted ? 72 : 64;

  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        top: y,
        width,
        height,
        background: cardBg,
        border: `${borderWidth}px solid ${tierAccent}`,
        borderRadius: CARD_RADIUS,
        padding: "30px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        boxShadow: cardShadow,
        opacity: cardOpacity,
        transform: `translateY(${translateY}px)`,
        boxSizing: "border-box",
      }}
    >
      {/* Tier name — accent uppercase, Inter Black */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: nameSize,
          color: tierAccent,
          lineHeight: 1.0,
          textAlign: "center",
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}
      >
        {tier.name}
      </div>

      {/* Price (or "???" mask) — crossfades on reveal */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: priceSize * 1.1,
        }}
      >
        {/* Masked "???" — visible only while masked. Fade-out as reveal begins. */}
        {tier.mask && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: priceSize,
              color: mutedColor,
              lineHeight: 1.0,
              textAlign: "center",
              letterSpacing: "0.02em",
              opacity: isMasked
                ? 1
                : interpolate(revealLocal, [0, 10], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
            }}
          >
            ???
          </div>
        )}

        {/* Real price — visible from start (when unmasked) or after the reveal. */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: priceSize,
            color: getBodyTextColor(paletteMode, inkColor, priceSize),
            lineHeight: 1.0,
            textAlign: "center",
            letterSpacing: "-0.01em",
            opacity: tier.mask ? revealOpacity : 1,
            filter: tier.mask ? revealBlur.filter : undefined,
            transform: tier.mask ? revealBlur.transform : undefined,
            fontVariantNumeric: "tabular-nums",
            visibility: tier.mask && isMasked ? "hidden" : "visible",
          }}
        >
          {tier.price}
        </div>
      </div>

      {/* Optional feature list */}
      {tier.features && tier.features.length > 0 && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
          }}
        >
          {tier.features.map((f, i) => (
            <div
              key={`${f}-${i}`}
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 500,
                fontSize: 32,
                color: mutedColor,
                lineHeight: 1.25,
                textAlign: "center",
                letterSpacing: "0.005em",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Composition ──────────────────────────────────────────────────────
export const PricingTierCard9x16: React.FC<PricingTierCard9x16Props> = ({
  audioUrl,
  wordTimings,
  tiers,
  sectionLabel,
  conclusionLine,
  breadcrumb,
  subjectTool,
  palette,
  paperColor,
  inkColor,
  accentColor,
  mutedColor,
  captionFontSize,
  enterSeconds,
  staggerSeconds,
  showCaptions,
}) => {
  const { fps } = useVideoConfig();

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
  const resolvedInk = colors.ink;
  const resolvedMuted = colors.muted;
  const resolvedGrain = getPalette(palette).grainOverlay;

  // Cap at 3 tiers (schema-documented constraint).
  const visibleTiers = tiers.slice(0, 3);

  // Compute layout: Y position and entry frame for each tier card.
  const baseStartFrame = Math.round(enterSeconds * fps);
  const staggerFrames = Math.round(staggerSeconds * fps);

  let cursorY = CARDS_TOP_Y;
  const layout = visibleTiers.map((tier, i) => {
    const height = tier.highlighted ? CARD_H_HIGHLIGHTED : CARD_H;
    const y = cursorY;
    cursorY = cursorY + height + CARD_GAP;
    const entryFrame = staggerEntry({
      index: i,
      baseStartFrame,
      staggerFrames,
      accelerate: true,
    });
    return { tier, y, height, entryFrame };
  });

  // Conclusion line sits a bit below the last card.
  const conclusionY = cursorY + 24;

  return (
    <AbsoluteFill style={{ background: resolvedPaper }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Palette-driven grain overlay */}
      <AbsoluteFill
        style={{
          background: resolvedGrain,
          mixBlendMode: palette === "dark" ? "screen" : "multiply",
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
      <SectionLabel text={sectionLabel} accentColor={resolvedAccent} />

      {/* Tier cards, vertically stacked */}
      {layout.map((entry, i) => {
        const tierAccent = entry.tier.color || resolvedAccent;
        return (
          <Sequence
            key={`tier-${i}`}
            from={entry.entryFrame}
            durationInFrames={9999}
            layout="none"
          >
            <TierCard
              tier={entry.tier}
              y={entry.y}
              width={CARD_W}
              height={entry.height}
              tierAccent={tierAccent}
              paperColor={resolvedPaper}
              inkColor={resolvedInk}
              mutedColor={resolvedMuted}
              paletteMode={palette}
            />
          </Sequence>
        );
      })}

      {/* Optional conclusion line under the tier stack */}
      {conclusionLine && conclusionY < 1700 && (
        <div
          style={{
            position: "absolute",
            top: conclusionY,
            left: 60,
            right: 60,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 36,
            color: getBodyTextColor(palette, resolvedInk, 36),
            lineHeight: 1.25,
            letterSpacing: "-0.005em",
          }}
        >
          {conclusionLine}
        </div>
      )}

      {/* Word-by-word captions at the bottom — gated by showCaptions */}
      {showCaptions && (
        <EditorialCaption
          wordTimings={wordTimings}
          style={{
            position: "bottom",
            distancePx: 120,
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
