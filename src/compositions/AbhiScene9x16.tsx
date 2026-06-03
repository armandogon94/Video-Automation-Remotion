/**
 * AbhiScene9x16 — host composition for abhishek.devini-style FULL-SCREEN typographic
 * scenes. Renders the shared AbhiBackground (dark-grid-glow or light-mesh) and mounts
 * ONE foreground template (by name from ABHI_REGISTRY) on top. A render driver picks
 * the background + template + props; the template carries the choreography.
 *
 * 1080×1920, 30fps. Standalone-in-Studio: all fields default.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { AbhiBackground, abhiBackgroundSchema } from "../components/abhi/AbhiBackground";
import { ABHI_REGISTRY } from "../components/abhi/registry";

export const abhiScene9x16Schema = z.object({
  background: abhiBackgroundSchema.default(() => abhiBackgroundSchema.parse({})),
  /** Foreground template: a registered type name + its props. */
  template: z
    .object({
      type: z.string().default(""),
      props: z.record(z.string(), z.unknown()).default({}),
    })
    .default(() => ({ type: "", props: {} })),
  durationFrames: z.number().default(150),
});
export type AbhiScene9x16Props = z.infer<typeof abhiScene9x16Schema>;

export const AbhiScene9x16: React.FC<Partial<AbhiScene9x16Props>> = (props) => {
  const p = abhiScene9x16Schema.parse(props);
  const Template = p.template.type ? ABHI_REGISTRY[p.template.type] : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbhiBackground {...p.background} />
      {Template ? <Template {...(p.template.props as Record<string, unknown>)} /> : null}
    </AbsoluteFill>
  );
};
