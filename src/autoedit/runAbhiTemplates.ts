#!/usr/bin/env node
/**
 * runAbhiTemplates — render each abhishek.devini-style replica template via the
 * AbhiScene9x16 host (background + foreground). Reads build-meta.json (bgProps +
 * demoProps + durationFrames per template). Bundle once, render many.
 * Outputs → output/abhi/<key>.mp4
 *   npx tsx src/autoedit/runAbhiTemplates.ts [onlyKey]
 */
import fs from "fs";
import path from "path";
import { bundleOnce as bundle } from "./bundleOnce";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/abhi");
const META: Record<string, { bgProps: Record<string, unknown>; demoProps: Record<string, unknown>; durationFrames: number }> =
  JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "docs/research/abhishek/build-meta.json"), "utf-8"));

async function main(): Promise<void> {
  const only = process.argv[2];
  const onlySet = only ? new Set(only.split(",").map((s) => s.trim()).filter(Boolean)) : null;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureBrowser();
  console.log("[abhi] bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });

  const keys = Object.keys(META).filter((k) => !onlySet || onlySet.has(k));
  const results: { name: string; file: string; dur: number }[] = [];
  for (const key of keys) {
    const m = META[key];
    const dur = Math.max(30, m.durationFrames);
    const inputProps = {
      background: m.bgProps,
      template: { type: key, props: m.demoProps },
      durationFrames: dur,
    };
    const composition = await selectComposition({ serveUrl, id: "AbhiScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${key}.mp4`);
    process.stdout.write(`[abhi] ${key} (${dur}f) … `);
    await renderMedia({
      composition: { ...composition, durationInFrames: dur, fps: FPS },
      serveUrl, codec: "h264", outputLocation: outAbs, inputProps,
    });
    console.log("done");
    results.push({ name: key, file: `output/abhi/${key}.mp4`, dur });
  }
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ ABHI TEMPLATES RENDERED — ${results.length} → ${OUT_DIR}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
