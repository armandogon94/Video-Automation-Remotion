#!/usr/bin/env node
/**
 * runComboDemos — STACK multiple overlay components over one clip to preview "loaded"
 * looks (what a real beat with several graphics feels like). Each component starts
 * from its known-good demoProps (/tmp/all_demoprops.json) with per-combo overrides
 * (anchor / enterFrame stagger / behindSpeaker), so props always validate.
 * Outputs → output/autoedit/combo/.
 *   npx tsx src/autoedit/runComboDemos.ts
 */
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const DUR = 150;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/combo");
const BASE: Record<string, Record<string, unknown>> = JSON.parse(
  fs.readFileSync("/tmp/all_demoprops.json", "utf-8"),
);
const FULL = { xPct: 0, yPct: 0, wPct: 1, hPct: 1, shape: "rect" as const };

interface Layer { key: string; over?: Record<string, unknown>; behind?: boolean }
interface Combo { name: string; blurb: string; clip: string; matte?: string; dur?: number; layers: Layer[] }

const PLATES = {
  benefit: { clip: "autoedit/IMG_3618.mp4", matte: "matte/IMG_3618/fg/%04d.png" },
  follow: { clip: "autoedit/depth-follow.mp4" },
  hook: { clip: "autoedit/depth-hook.mp4" },
  avail: { clip: "autoedit/avail-broll.mp4" },
};

const COMBOS: Combo[] = [
  { name: "cb1-context-hud", blurb: "Progress bar + section rail + name tag (full context)", clip: PLATES.hook.clip,
    layers: [
      { key: "SegmentedProgressBar", over: { anchor: "top", enterFrame: 4 } },
      { key: "ChapterTocRail", over: { enterFrame: 10 } },
      { key: "LowerThirdNameTag", over: { enterFrame: 18 } },
    ] },
  { name: "cb2-stat-punch", blurb: "Count-up stat + sentiment keyword + corner badge", clip: PLATES.benefit.clip,
    layers: [
      { key: "CountUpStat", over: { anchor: "top-left", enterFrame: 6 } },
      { key: "SentimentKeyword", over: { text: "AUTOMÁTICO", tone: "positive", enterFrame: 26 } },
      { key: "PersistentCornerBadge", over: { enterFrame: 2 } },
    ] },
  { name: "cb3-compare-progress", blurb: "VS comparison + progress bar", clip: PLATES.follow.clip,
    layers: [
      { key: "SegmentedProgressBar", over: { anchor: "top", enterFrame: 4 } },
      { key: "ComparisonVS", over: { enterFrame: 14 } },
    ] },
  { name: "cb4-stats-marker", blurb: "Stat row + marker-sweep keyword", clip: PLATES.avail.clip,
    layers: [
      { key: "MarkerSweepWord", over: { text: "PLAN MAX", anchor: "left", enterFrame: 8 } },
      { key: "StatRowTriple", over: { enterFrame: 18 } },
    ] },
  { name: "cb5-depth-caption", blurb: "Text BEHIND you + caption in front + progress", clip: PLATES.benefit.clip, matte: PLATES.benefit.matte, dur: 135,
    layers: [
      { key: "RevealText", behind: true, over: { text: "NETFLIX", reveal: "pop", anchor: "upper-third", fontSize: 200, color: "#E50914", glow: true, glowColor: "#E50914", enterFrame: 6 } },
      { key: "RevealText", over: { text: "no has podido\nterminar en NETFLIX", reveal: "fade-up", anchor: "lower-third", fontSize: 80, accent: "NETFLIX", accentColor: "#5BC0E8", uppercase: false, enterFrame: 18 } },
      { key: "SegmentedProgressBar", over: { anchor: "top", enterFrame: 2 } },
    ] },
  { name: "cb6-quote-badge", blurb: "Pull-quote + corner badge", clip: PLATES.follow.clip,
    layers: [
      { key: "PullQuoteCard", over: { enterFrame: 6 } },
      { key: "PersistentCornerBadge", over: { enterFrame: 2 } },
    ] },
];

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureBrowser();
  console.log("[combo] bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  const results: { name: string; blurb: string; file: string }[] = [];
  for (const c of COMBOS) {
    const dur = c.dur ?? DUR;
    const overlays = c.layers.map((l) => ({
      type: l.key,
      behindSpeaker: l.behind === true ? true : undefined,
      props: { ...(BASE[l.key] ?? {}), holdFrames: dur, ...(l.over ?? {}) },
    }));
    const common = {
      caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
      handle: "@armandointeligencia",
      durationFrames: dur,
      overlays,
    };
    const inputProps: Record<string, unknown> = c.matte
      ? { ...common, camSrc: c.clip, layoutTrack: [{ id: "lay-0", startFrame: 0, endFrame: dur, layout: { cam: FULL } }], foregroundMatte: { src: c.matte, kind: "png-sequence" } }
      : { ...common, videoSrc: c.clip };
    const composition = await selectComposition({ serveUrl, id: "SpeakerOverlayScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${c.name}.mp4`);
    process.stdout.write(`[combo] ${c.name} … `);
    await renderMedia({ composition: { ...composition, durationInFrames: dur, fps: FPS }, serveUrl, codec: "h264", outputLocation: outAbs, inputProps });
    console.log("done");
    results.push({ name: c.name, blurb: c.blurb, file: `output/autoedit/combo/${c.name}.mp4` });
  }
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ COMBO DEMOS COMPLETE — ${results.length} → ${OUT_DIR}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
