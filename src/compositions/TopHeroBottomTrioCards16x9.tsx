/**
 * TopHeroBottomTrioCards16x9 — Nate B Jones's "hero card + supporting trio"
 * (pattern N4 from the Wave-7 Batch 3 Extension scoring of his 16:9 catalog).
 *
 * Reference anchors (Nate B Jones long-form):
 *   - ogTLWGBc3cE @ t≈920s — hero headline card with three supporting points
 *     rising beneath it ("Opus 4.7 / OpenAI 5.5 prompting obsolete" beat).
 *   - zP6TnEiueEc @ t≈830s — same molecular layout reused with a different
 *     headline + supporting triplet (Google I/O stitching MCP/A2A/AG-UI).
 *
 * The visual essence (ANALYSIS.md §2 N4): a HERO card lands from ABOVE with a
 * soft drop; once it settles, THREE supporting cards rise from BELOW in
 * left-to-right sequence. Each supporting card has its uppercase label tab fade
 * in ~50ms (≈1.5 frames @ 30fps) BEFORE its headline. The caption pill below —
 * exactly ONE keyword tinted TNF orange — fades in LAST.
 *
 * Reference framing: "Stripe Press headline + supporting points" — visual
 * hierarchy is carried by VERTICAL POSITION (hero on top, trio below), NOT by
 * type weight. So the hero is larger but the supporting cards do not lean on
 * heavier glyphs to compete; their subordination is positional.
 *
 * Composition order (back-to-front):
 *   DarkSlateChassis16x9 (slate + handle chip + caption pill slot)
 *     ↳ hero card (drop from above @ 0–14f)
 *     ↳ supporting card 1 (rise @ 18f; label @ 18f, headline @ ~19.5f)
 *     ↳ supporting card 2 (rise @ 28f; label @ 28f, headline @ ~29.5f)
 *     ↳ supporting card 3 (rise @ 38f; label @ 38f, headline @ ~39.5f)
 *   CaptionPillWithKeyword (startFrame=56, fade-in over 8f) — fades in last
 *
 * Pure-content beat: no audio, no captions, no watermark/breadcrumb chrome
 * beyond the chassis-provided handle chip. Slotted INTO a longer 16:9 piece as
 * one beat — exactly how Nate uses it.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const heroSchema = z.object({
  /** Optional small uppercase label above the hero title (e.g. "THE SHIFT"). */
  label: z.string().optional(),
  /** Hero headline. e.g. "Prompting as we knew it is obsolete". */
  title: z.string(),
  /** Optional accent color for the hero's label + top accent border. */
  accentColor: z.string().optional(),
});

const supportingSchema = z.object({
  /** Left/top "label tab" text (uppercase, tracked). e.g. "MODEL". */
  label: z.string(),
  /** Supporting headline. e.g. "Reasons over instructions". */
  title: z.string(),
  /** Optional accent color for the label tab + accent border. Defaults
   *  through the trio palette below if not supplied. */
  accentColor: z.string().optional(),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const topHeroBottomTrioCardsSchema = z.object({
  hero: heroSchema.default({
    label: "THE SHIFT",
    title: "Prompting as we knew it is obsolete",
  }),
  /** Exactly three supporting cards, rendered left-to-right beneath the hero. */
  supporting: z
    .array(supportingSchema)
    .length(3)
    .default([
      { label: "MODEL", title: "Reasons over instructions" },
      { label: "CONTEXT", title: "Goals beat step-by-steps" },
      { label: "WORKFLOW", title: "Verify, don't hand-hold" },
    ]),
  caption: captionSchema.default({
    text: "The new skill is framing the problem",
    keyword: "framing",
  }),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(150),
  transitionVerb: z
    .string()
    .default(
      "Land the hero card from above with a soft drop; once it settles, the three supporting cards rise from below in left-to-right sequence, each with its label tab fading in 50ms before its headline; finally the caption pill fades in below.",
    ),
});

export type TopHeroBottomTrioCards16x9Props = z.infer<
  typeof topHeroBottomTrioCardsSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const STACK_MAX_WIDTH_PX = 1320;
const HERO_TO_TRIO_GAP_PX = 40;
const TRIO_GAP_PX = 28;

const CARD_BG_RGBA = "rgba(20,30,55,0.6)";
const CARD_BORDER_RADIUS_PX = 14;
const CARD_ACCENT_BORDER_PX = 3;

const HERO_PADDING = "32px 44px";
const HERO_LABEL_FONT_SIZE_PX = 22;
const HERO_TITLE_FONT_SIZE_PX = 60;

const SUPPORTING_PADDING = "24px 28px";
const SUPPORTING_LABEL_FONT_SIZE_PX = 20;
const SUPPORTING_TITLE_FONT_SIZE_PX = 32;

/** Per-card accent palette — used when accentColor isn't supplied. Mirrors the
 *  Nate accent set documented in CaptionPillWithKeyword (TNF orange + a warm
 *  gold + a cyan). Hero gets index 0; supporting cards index by position. */
const DEFAULT_ACCENTS = [
  BRAND.colors.keywordOrange, // "TNF orange"
  "#D4AF37", // brand gold
  "#5BC0E8", // cyan
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Timing windows (frames @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────

/** Hero drops from above: opacity + translateY settle by frame 14. */
const HERO_DROP = { start: 0, end: 14 } as const;
const HERO_DROP_FROM_Y_PX = -48; // drop in from above

/** Supporting cards rise from below, staggered left-to-right. Each card: the
 *  label tab leads its headline by ≈50ms (≈1.5 frames @ 30fps). */
const SUPPORTING_RISE_DURATION = 12; // frames for the card's lift to settle
const SUPPORTING_RISE_FROM_Y_PX = 36; // rise up from below
const LABEL_LEADS_HEADLINE_FRAMES = 1.5; // 50ms @ 30fps
const LABEL_FADE_DURATION = 8;
const HEADLINE_FADE_DURATION = 8;

/** Start frames for each supporting card's entrance (left-to-right). */
const SUPPORTING_START_FRAMES: readonly [number, number, number] = [18, 28, 38];

/** Caption pill fades in last, after the trio has landed. */
const CAPTION_PILL_START_FRAME = 56;

// ─────────────────────────────────────────────────────────────────────────────
// Hero card
// ─────────────────────────────────────────────────────────────────────────────

interface HeroCardProps {
  label?: string;
  title: string;
  accentColor: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ label, title, accentColor }) => {
  const frame = useCurrentFrame();

  // Soft drop from above: opacity 0→1 and translateY -48→0, soft-out easing so
  // it reads as a place-down rather than a slam.
  const opacity = interpolate(frame, [HERO_DROP.start, HERO_DROP.end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const translateY = interpolate(
    frame,
    [HERO_DROP.start, HERO_DROP.end],
    [HERO_DROP_FROM_Y_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: CARD_BG_RGBA,
        borderRadius: CARD_BORDER_RADIUS_PX,
        borderTop: `${CARD_ACCENT_BORDER_PX}px solid ${accentColor}`,
        padding: HERO_PADDING,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      {label ? (
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: HERO_LABEL_FONT_SIZE_PX,
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: HERO_TITLE_FONT_SIZE_PX,
          color: "#FFFFFF",
          lineHeight: 1.08,
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Supporting card
// ─────────────────────────────────────────────────────────────────────────────

interface SupportingCardProps {
  label: string;
  title: string;
  accentColor: string;
  /** Frame at which this card begins its rise + label fade. */
  startFrame: number;
}

const SupportingCard: React.FC<SupportingCardProps> = ({
  label,
  title,
  accentColor,
  startFrame,
}) => {
  const frame = useCurrentFrame();

  // The card body rises from below: container opacity + translateY. This is
  // the card's "arrival"; the inner label/headline opacities are staggered on
  // top of it so the tab reads slightly before the headline.
  const riseEnd = startFrame + SUPPORTING_RISE_DURATION;
  const cardOpacity = interpolate(frame, [startFrame, riseEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const translateY = interpolate(
    frame,
    [startFrame, riseEnd],
    [SUPPORTING_RISE_FROM_Y_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // Label tab leads the headline by ~50ms.
  const labelOpacity = interpolate(
    frame,
    [startFrame, startFrame + LABEL_FADE_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const headlineStart = startFrame + LABEL_LEADS_HEADLINE_FRAMES;
  const headlineOpacity = interpolate(
    frame,
    [headlineStart, headlineStart + HEADLINE_FADE_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <div
      style={{
        flex: 1,
        opacity: cardOpacity,
        transform: `translateY(${translateY}px)`,
        background: CARD_BG_RGBA,
        borderRadius: CARD_BORDER_RADIUS_PX,
        borderLeft: `${CARD_ACCENT_BORDER_PX}px solid ${accentColor}`,
        padding: SUPPORTING_PADDING,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 700,
          fontSize: SUPPORTING_LABEL_FONT_SIZE_PX,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          opacity: headlineOpacity,
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: SUPPORTING_TITLE_FONT_SIZE_PX,
          color: "#FFFFFF",
          lineHeight: 1.18,
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const TopHeroBottomTrioCards16x9: React.FC<
  TopHeroBottomTrioCards16x9Props
> = ({ hero, supporting, caption, handle }) => {
  const heroAccent = hero.accentColor ?? DEFAULT_ACCENTS[0];

  // Caption pill is mounted inside the chassis's caption-pill slot (which
  // self-anchors above the handle chip). It reads useCurrentFrame() itself, so
  // we only need to hand it the keyword + its (composition-relative) start.
  const captionPill = (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      anchor="below-content"
      startFrame={CAPTION_PILL_START_FRAME}
      fontSize={36}
    />
  );

  return (
    <DarkSlateChassis16x9 handleChip={{ text: handle }} captionPill={captionPill}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: STACK_MAX_WIDTH_PX,
            display: "flex",
            flexDirection: "column",
            gap: HERO_TO_TRIO_GAP_PX,
          }}
        >
          {/* Hero — drops from above. */}
          <HeroCard
            label={hero.label}
            title={hero.title}
            accentColor={heroAccent}
          />

          {/* Supporting trio — rise from below, left-to-right. */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              gap: TRIO_GAP_PX,
            }}
          >
            {supporting.map((card, i) => {
              const accent =
                card.accentColor ?? DEFAULT_ACCENTS[i % DEFAULT_ACCENTS.length];
              return (
                <SupportingCard
                  key={`${card.label}-${i}`}
                  label={card.label}
                  title={card.title}
                  accentColor={accent}
                  startFrame={SUPPORTING_START_FRAMES[i]}
                />
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </DarkSlateChassis16x9>
  );
};

export default TopHeroBottomTrioCards16x9;
