/**
 * AbhiWaveformTranscript9x16 — a thin, standalone-renderable wrapper that
 * showcases the OPTIONAL transcript variant of AbhiWaveform (the
 * abhishek.devini "voiceover + caption strip" beat).
 *
 * WHY A WRAPPER: AbhiWaveform is a FOREGROUND-ONLY template. It renders
 * transparent and draws only the local audio-player UI (kicker pill / mic disc
 * / level-meter bars / label / transcript strip); the shared AbhiBackground is
 * normally mounted by the host AbhiScene9x16 chassis. To make a registered,
 * gallery-renderable composition we must supply that background context here,
 * then mount AbhiWaveform on top with showTranscript=true and a Spanish
 * transcript so the caption strip animates in.
 *
 * This wrapper:
 *   • mounts AbhiBackground (light-mesh for the cream palette, dark-grid-glow
 *     for the dark palette) so the transparent foreground has a canvas;
 *   • mounts AbhiWaveform in its canonical "center" voiceover layout with
 *     showTranscript=true and a sensible Spanish transcript default;
 *   • exposes a `palette` prop ("cream" default + "dark") that drives both the
 *     background mode and the waveform's ink/surface mode in lockstep.
 *
 * Canvas 1080×1920 @30fps. All schema fields .default(...) (Zod v4):
 * defaultProps = abhiWaveformTranscript9x16Schema.parse({}), so the comp is
 * standalone in Studio with zero required props.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import {
  AbhiBackground,
  abhiBackgroundSchema,
} from "../components/abhi/AbhiBackground";
import {
  AbhiWaveform,
  abhiWaveformSchema,
} from "../components/abhi/templates/AbhiWaveform";

/**
 * Palette switch. "cream" → light mesh background + light-ink waveform on the
 * brand cream family; "dark" → dark-grid-glow background + light-ink waveform
 * on the brand deep-navy family. Default cream.
 */
const PALETTES = {
  cream: {
    /** AbhiBackground "light" mesh, warmed toward the brand cream. */
    backgroundMode: "light" as const,
    waveformMode: "light" as const,
    meshBase: "#FAF7F2",
    glowAccent: "#D4AF37",
  },
  dark: {
    /** AbhiBackground "dark" grid-glow on the brand deep-navy. */
    backgroundMode: "dark" as const,
    waveformMode: "dark" as const,
    darkBase: "#0F1B2D",
    glowAccent: "#D4AF37",
  },
} as const;

export const abhiWaveformTranscript9x16Schema = z.object({
  /** Visual family: cream (light, default) or dark (deep-navy). */
  palette: z.enum(["cream", "dark"]).default("cream"),
  /** Primary accent (brand navy) — kicker dot, even bars, active word. */
  accentColor: z.string().default("#1B3A6E"),
  /** Secondary bar tone (brand gold) for the two-tone level meter. */
  secondaryColor: z.string().default("#D4AF37"),
  /** Mono kicker pill, UPPERCASE. */
  kicker: z.string().default("TU VOZ"),
  /** Mono label under the bars. */
  label: z.string().default("VOZ.WAV"),
  /** The Spanish transcript revealed word-by-word under the level meter. */
  transcript: z
    .string()
    .default(
      "Convertimos tu guion en una voz natural con subtitulos automaticos listos para publicar.",
    ),
  /** Number of level-meter bars. */
  barCount: z.number().int().min(6).max(80).default(11),
});
export type AbhiWaveformTranscript9x16Props = z.infer<
  typeof abhiWaveformTranscript9x16Schema
>;

export const AbhiWaveformTranscript9x16: React.FC<
  Partial<AbhiWaveformTranscript9x16Props>
> = (props) => {
  const p = abhiWaveformTranscript9x16Schema.parse(props);
  const pal = PALETTES[p.palette];

  // Build the background with palette-appropriate base/accent. AbhiBackground
  // parses partial props itself, so we only override what the palette dictates.
  const background =
    pal.backgroundMode === "dark"
      ? abhiBackgroundSchema.parse({
          mode: pal.backgroundMode,
          darkBase: pal.darkBase,
          accentColor: pal.glowAccent,
        })
      : abhiBackgroundSchema.parse({
          mode: pal.backgroundMode,
          meshBase: pal.meshBase,
        });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbhiBackground {...background} />
      <AbhiWaveform
        align="center"
        mode={pal.waveformMode}
        showMic
        showTranscript
        transcript={p.transcript}
        accentColor={p.accentColor}
        secondaryColor={p.secondaryColor}
        kicker={p.kicker}
        label={p.label}
        barCount={p.barCount}
      />
    </AbsoluteFill>
  );
};
