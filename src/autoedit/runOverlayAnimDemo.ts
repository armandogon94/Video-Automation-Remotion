#!/usr/bin/env node
/**
 * runOverlayAnimDemo — a short SHOWCASE proving the over-speaker molecules now
 * ENTER with a genuine animated pop (spring scale-in + overshoot, slide, glow),
 * not a static appear.
 *
 * Renders `SpeakerOverlayScene9x16` over the built-in dark-slate placeholder
 * backdrop (no `videoSrc`/`layoutTrack` → legacy placeholder mode) and mounts 3
 * over-speaker molecules whose entrances are staggered so each pop is isolated
 * and easy to frame-check:
 *
 *   • YellowGlowWordCallout     — spring scale 0.6→1.0 w/ overshoot + yellow glow
 *   • IconPopOverSpeaker        — spring scale-pop 0→1.0 + continuous glow pulse
 *   • BuildingBulletListOverSpeaker — heading + items each spring-pop in on beat
 *
 * One-shot driver (mirrors runDepthDemo.ts's direct bundle+render path). Does NOT
 * edit SpeakerOverlayScene / editPlan / registry / Root. Run:
 *   npx tsx src/autoedit/runOverlayAnimDemo.ts
 */
import fs from "fs";
import path from "path";

import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const DURATION = 150; // 5.0s @ 30fps — enough to see all three pops.

async function main(): Promise<void> {
  // Staggered entrances so each molecule's pop is isolated for frame-checking.
  const inputProps: Record<string, unknown> = {
    // No videoSrc + no layoutTrack → legacy placeholder backdrop ("Base Video").
    handle: "@armandointeligencia",
    durationFrames: DURATION,
    caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
    overlays: [
      {
        type: "YellowGlowWordCallout",
        props: {
          text: "RIGHT WORDS",
          anchor: "bottom-left",
          enterFrame: 10,
          holdFrames: 36,
          fontSize: 110,
        },
      },
      {
        type: "IconPopOverSpeaker",
        props: {
          icon: "🧠",
          anchor: "top-right",
          enterFrame: 56,
          holdFrames: 36,
          sizePx: 180,
          glowPulse: true,
        },
      },
      {
        type: "BuildingBulletListOverSpeaker",
        props: {
          heading: "HOW TO LEARN",
          items: [
            { text: "Speak loud enough" },
            { text: "Speak slowly" },
            { text: "Articulate" },
          ],
          anchor: "left",
          enterFrame: 96,
          beatFrames: 14,
          holdFrames: 30,
          fontSize: 40,
        },
      },
    ],
  };

  await ensureBrowser();
  console.log("[anim] bundling…");
  const serveUrl = await bundle({
    entryPoint: path.join(PROJECT_ROOT, "src/index.ts"),
  });

  const compositionId = "SpeakerOverlayScene9x16";
  console.log(`[anim] selecting ${compositionId}…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputDir = path.join(PROJECT_ROOT, "output", "autoedit");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "overlay-anim-demo.mp4");

  console.log(`[anim] rendering ${DURATION} frames → ${outputPath}`);
  const started = Date.now();
  await renderMedia({
    composition: { ...composition, durationInFrames: DURATION, fps: FPS },
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        process.stdout.write(`\r[anim] ${Math.round(progress * 100)}%   `);
      }
    },
  });
  const elapsed = (Date.now() - started) / 1000;

  console.log(`\n✓ OVERLAY ANIM DEMO COMPLETE`);
  console.log(`  output : ${outputPath}`);
  console.log(`  frames=${DURATION} @ ${FPS}fps · ${elapsed.toFixed(1)}s render`);
}

main().catch((err) => {
  console.error(
    "\n✗ runOverlayAnimDemo failed:",
    err instanceof Error ? (err.stack ?? err.message) : err,
  );
  process.exit(1);
});
