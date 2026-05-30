/**
 * SectionDividerTitleCard16x9 — the canonical "minimal chassis consumer".
 *
 * R4B (Nate B Jones) finding: long-form scenes are punctuated by ~1s
 * "breath-beat" pause cards — chassis-only with a centered title and an
 * optional uppercase eyebrow above. No content, no chrome beyond the chassis's
 * handle chip. The breath beat lets a heavy scene land before the next idea.
 *
 * This is the cheapest possible `DarkSlateChassis16x9` consumer in the repo —
 * also serves as the reference example for future devs: copy, swap the body,
 * done.
 *
 * Default timing (30f @ 30fps = 1.0s):
 *   0–6f   eyebrow fades in
 *   4–12f  title ramps up from below (slight overlap reads as one entrance)
 *   12–22f hold (the breath beat)
 *   22–30f both fade out together
 */
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

export const sectionDividerTitleCardSchema = z.object({
  title: z.string(),
  /** Optional small label above the title (uppercase, tracked). */
  eyebrow: z.string().optional(),
  handle: z.string().default("@armandointeligencia"),
  /** Total composition length in frames. Default 30 = 1.0s breath beat @ 30fps. */
  durationFrames: z.number().default(30),
  transitionVerb: z
    .string()
    .default(
      "Fade in the eyebrow, then ramp the title up from below with a soft spring, hold for the breath-beat, then fade out.",
    ),
});

export type SectionDividerTitleCard16x9Props = z.infer<
  typeof sectionDividerTitleCardSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing (frames, assuming 30fps default duration)
// ─────────────────────────────────────────────────────────────────────────────

const EYEBROW_FADE_IN = { start: 0, end: 6 } as const;
const TITLE_RAMP_IN = { start: 4, end: 12 } as const;
const FADE_OUT = { start: 22, end: 30 } as const;
const TITLE_TRANSLATE_Y_PX = 16;

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const SectionDividerTitleCard16x9: React.FC<
  SectionDividerTitleCard16x9Props
> = ({ title, eyebrow, handle }) => {
  const frame = useCurrentFrame();

  // Eyebrow: fade in 0→6, fade out 22→30.
  const eyebrowIn = interpolate(
    frame,
    [EYEBROW_FADE_IN.start, EYEBROW_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const fadeOut = interpolate(
    frame,
    [FADE_OUT.start, FADE_OUT.end],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const eyebrowOpacity = eyebrowIn * fadeOut;

  // Title: opacity 0→1 and translateY 16→0 ramp on TITLE_RAMP_IN, then fade
  // out with the eyebrow. Soft-out easing gives the "spring settle" feel
  // without overshoot — overshoot at this scale just reads as jitter.
  const titleIn = interpolate(
    frame,
    [TITLE_RAMP_IN.start, TITLE_RAMP_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const titleOpacity = titleIn * fadeOut;
  const titleY = interpolate(
    frame,
    [TITLE_RAMP_IN.start, TITLE_RAMP_IN.end],
    [TITLE_TRANSLATE_Y_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  return (
    <DarkSlateChassis16x9 handleChip={{ text: handle }}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              opacity: eyebrowOpacity,
              fontFamily: FONT_STACKS.sans,
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_STACKS.sans,
            fontSize: 84,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.0,
            maxWidth: 1400,
          }}
        >
          {title}
        </div>
      </div>
    </DarkSlateChassis16x9>
  );
};

export default SectionDividerTitleCard16x9;
