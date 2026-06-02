#!/usr/bin/env node
/**
 * runNewOverlayDemos — render each Wave-10 component (built in parallel) over real
 * footage using its authored demoProps, so the new components can be validated.
 * Reads demoProps from /tmp/new_demoprops.json (written when the build workflow landed).
 * Outputs → output/autoedit/new/.
 *   npx tsx src/autoedit/runNewOverlayDemos.ts
 */
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const DUR = 120;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/new");
const DEMO_PROPS: Record<string, Record<string, unknown>> = JSON.parse(
  fs.readFileSync("/tmp/new_demoprops.json", "utf-8"),
);

// Rotate background clips for variety (all staged + color-correct + bt709).
const CLIPS = ["autoedit/IMG_3618.mp4", "autoedit/depth-follow.mp4", "autoedit/depth-hook.mp4", "autoedit/avail-broll.mp4"];

const ORDER = ["CountUpStat", "SentimentKeyword", "ChapterTocRail", "SegmentedProgressBar", "GrowthCompareBars", "MarkerSweepWord"];

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureBrowser();
  console.log("[new] bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  const results: { name: string; file: string }[] = [];
  for (let i = 0; i < ORDER.length; i++) {
    const key = ORDER[i];
    const props = { ...(DEMO_PROPS[key] ?? {}), enterFrame: 6, holdFrames: DUR };
    const inputProps = {
      videoSrc: CLIPS[i % CLIPS.length],
      overlays: [{ type: key, props }],
      caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
      handle: "@armandointeligencia",
      durationFrames: DUR,
    };
    const composition = await selectComposition({ serveUrl, id: "SpeakerOverlayScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${key}.mp4`);
    process.stdout.write(`[new] ${key} … `);
    await renderMedia({ composition: { ...composition, durationInFrames: DUR, fps: FPS }, serveUrl, codec: "h264", outputLocation: outAbs, inputProps });
    console.log("done");
    results.push({ name: key, file: `output/autoedit/new/${key}.mp4` });
  }
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ NEW OVERLAY DEMOS COMPLETE — ${results.length} → ${OUT_DIR}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
