/**
 * StudioDeskTalkingHead16x9 — the convergent OWNED-MEDIA desk talking-head.
 *
 * Wave-7 Batch 3 (R4B / Hormozi batch) finding: the seated creator-at-desk
 * talking-to-camera look is the *dominant* 16:9 talking-head chassis across the
 * 6-creator long-form corpus. Evidence:
 *   - references/creators/alexhormozi/ANALYSIS.md §NEW-H9
 *     `StudioDeskFlannelTalkingHead` (lines 425–434): "Hormozi seated at a desk
 *     … purple/navy backdrop … the studio-desk chassis … is the OWNED-MEDIA
 *     chassis used for `educational` content." Line 434 explicitly notes the
 *     cross-creator overlap: "Igor and Matt both use comparable studio-desk
 *     chassises." Line 497 promotes it as "the convergent OWNED-MEDIA chassis
 *     for the 6-creator 16:9 corpus."
 *   - references/creators/theaiadvantage/ANALYSIS.md §Sub-brand B "Warm Podcast
 *     Studio" (line 20) + the persistent lower-third / handle-pill grammar
 *     (Igor's `@nate.b.jones`-equivalent chip), grounding the centered seated
 *     register with a name lower-third.
 *
 * DISTINCT FROM `StudioCompositor16x9` (Igor's P1): that composition is
 * presenter-LEFT + UI-mockup-RIGHT (a screen-rec compositing chrome). This one
 * has NO UI mockup pane — it is the bare centered/seated presenter talking to
 * camera, carried by a persistent lower-third name tag (+ optional topic chip)
 * over the shared dark-slate chassis. Different job: the compositor narrates a
 * product demo; the desk talking-head IS the host segment.
 *
 * Composition order (back-to-front, via DarkSlateChassis16x9):
 *   slate background → translucent avatar-glyph watermark
 *     → presenter tile (lower-center, rounded) → topic chip (upper area)
 *     → lower-third name tag → handle chip
 *
 * Timing (defaults assume 30fps; 150f = 5.0s host beat):
 *   0–10f   presenter tile fades up (opacity 0→1, +24px y-translate eased)
 *   8–18f   topic chip fades + slides down from above (if present)
 *   14–26f  lower-third name tag slides in from the left + fades (gold rule
 *           wipes in under the name)
 *   26f→    hold (no fade-out — this is a resting host register, cut on word
 *           boundaries like the other 16:9 chassis consumers)
 */
import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

/** Default presenter placeholder — the brand avatar, so Studio renders props-free. */
const DEFAULT_PRESENTER_IMAGE = "brand/logos/avatar-pixar.png";

export const studioDeskTalkingHeadSchema = z.object({
  /** Presenter display name shown in the lower-third (line 1). */
  presenterName: z.string().default("Armando Inteligencia"),
  /** Optional role/subtitle under the name (line 2). Defaults to the handle. */
  presenterRole: z.string().optional(),
  /** Optional small topic pill in the upper area, e.g. "GEMINI 3.2 FLASH". */
  topicChip: z.string().optional(),
  /**
   * Presenter image — a static asset path (resolved via `staticFile`) or a
   * full URL. Defaults to the brand avatar placeholder so the composition
   * renders in Studio with zero props.
   */
  presenterImage: z.string().default(DEFAULT_PRESENTER_IMAGE),
  /** Persistent handle chip lower-right (passed to the chassis). */
  handle: z.string().default("@armandointeligencia"),
  /** Total composition length in frames. Default 150 = 5.0s @ 30fps. */
  durationFrames: z.number().default(150),
  transitionVerb: z
    .string()
    .default(
      "Fade the seated presenter tile up from below, drop in the topic chip from above, then slide the lower-third name tag in from the left with its gold accent rule wiping under the name; hold the host register without fading out.",
    ),
});

export type StudioDeskTalkingHead16x9Props = z.infer<
  typeof studioDeskTalkingHeadSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing (frames, assuming the 150-frame default @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────

const PRESENTER_FADE_IN = { start: 0, end: 10 } as const;
const TOPIC_CHIP_IN = { start: 8, end: 18 } as const;
const LOWER_THIRD_IN = { start: 14, end: 26 } as const;
const PRESENTER_TRANSLATE_Y_PX = 24;
const TOPIC_TRANSLATE_Y_PX = -16;
const LOWER_THIRD_TRANSLATE_X_PX = -48;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const PRESENTER_TILE_WIDTH_PX = 560; // ~29% of the 1920 frame width
const PRESENTER_TILE_ASPECT = 4 / 3; // medium-close seated framing (H9 is 4:3-ish)
const PRESENTER_BORDER_RADIUS_PX = 28;
const LOWER_THIRD_BOTTOM_PX = 132; // sits clear above the chassis handle chip
const LOWER_THIRD_LEFT_PX = 96;
const TOPIC_CHIP_TOP_PX = 88;

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const StudioDeskTalkingHead16x9: React.FC<
  StudioDeskTalkingHead16x9Props
> = ({ presenterName, presenterRole, topicChip, presenterImage, handle }) => {
  const frame = useCurrentFrame();

  // A bare asset path is resolved through staticFile; an absolute URL passes
  // through untouched so callers can wire in a remote presenter frame.
  const presenterSrc = /^(https?:)?\/\//.test(presenterImage)
    ? presenterImage
    : staticFile(presenterImage);

  // Role line falls back to the handle so the lower-third always has a subtitle.
  const roleLine = presenterRole ?? handle;

  // Presenter tile: fade up + ease the y-translate to 0.
  const presenterOpacity = interpolate(
    frame,
    [PRESENTER_FADE_IN.start, PRESENTER_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const presenterY = interpolate(
    frame,
    [PRESENTER_FADE_IN.start, PRESENTER_FADE_IN.end],
    [PRESENTER_TRANSLATE_Y_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // Topic chip: fade + slide down from above.
  const topicProgress = interpolate(
    frame,
    [TOPIC_CHIP_IN.start, TOPIC_CHIP_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const topicY = interpolate(topicProgress, [0, 1], [TOPIC_TRANSLATE_Y_PX, 0]);

  // Lower-third: fade + slide in from the left. The gold accent rule shares the
  // same progress so it wipes in under the name as one unit.
  const lowerThirdProgress = interpolate(
    frame,
    [LOWER_THIRD_IN.start, LOWER_THIRD_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const lowerThirdX = interpolate(
    lowerThirdProgress,
    [0, 1],
    [LOWER_THIRD_TRANSLATE_X_PX, 0],
  );

  return (
    <DarkSlateChassis16x9
      handleChip={{ text: handle }}
      watermark={{
        glyph: (
          <Img
            src={presenterSrc}
            alt=""
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        ),
        opacity: 0.06,
        anchor: "center-right",
        widthPx: 820,
      }}
    >
      {/* Presenter tile — rounded, lower-center, soft entrance. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: `translate(-50%, ${presenterY}px)`,
          opacity: presenterOpacity,
          width: PRESENTER_TILE_WIDTH_PX,
          height: Math.round(PRESENTER_TILE_WIDTH_PX / PRESENTER_TILE_ASPECT),
          borderRadius: `${PRESENTER_BORDER_RADIUS_PX}px ${PRESENTER_BORDER_RADIUS_PX}px 0 0`,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.16)",
          borderBottom: "none",
          background: "linear-gradient(135deg, #1B2A40 0%, #0F1B2D 100%)",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.45)",
          pointerEvents: "none",
        }}
      >
        <Img
          src={presenterSrc}
          alt={presenterName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
          }}
        />
      </div>

      {/* Optional topic chip — small pill, upper area, centered. */}
      {topicChip ? (
        <div
          style={{
            position: "absolute",
            top: TOPIC_CHIP_TOP_PX,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: topicProgress,
            transform: `translateY(${topicY}px)`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 700,
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: BRAND.colors.textLight,
              padding: "10px 22px",
              borderRadius: 999,
              border: `1px solid ${BRAND.colors.accent}`,
              background: "rgba(212,175,55,0.10)",
              whiteSpace: "nowrap",
            }}
          >
            {topicChip}
          </div>
        </div>
      ) : null}

      {/* Lower-third name tag — slides in from the left, gold accent rule. */}
      <div
        style={{
          position: "absolute",
          left: LOWER_THIRD_LEFT_PX,
          bottom: LOWER_THIRD_BOTTOM_PX,
          opacity: lowerThirdProgress,
          transform: `translateX(${lowerThirdX}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          pointerEvents: "none",
        }}
      >
        {/* Gold accent rule — its width scales with the entrance progress. */}
        <div
          style={{
            width: `${Math.round(64 * lowerThirdProgress)}px`,
            height: 4,
            borderRadius: 2,
            background: BRAND.colors.accent,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.05,
            color: BRAND.colors.textLight,
            textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          }}
        >
          {presenterName}
        </div>
        <div
          style={{
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: 24,
            marginTop: 6,
            letterSpacing: "0.02em",
            color: BRAND.colors.accent,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {roleLine}
        </div>
      </div>
    </DarkSlateChassis16x9>
  );
};

export default StudioDeskTalkingHead16x9;
