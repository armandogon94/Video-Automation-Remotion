#!/usr/bin/env node
/**
 * runAvailV2 — fresh availability-beat treatments (the first 3 were rejected). Keeps
 * the B-roll pan and lays NEW RevealText motion-graphics on top to carry the
 * "beta / Plan Max / future" message, each a different reveal style. Foreground only
 * (the B-roll has no person to matte). Outputs → output/autoedit/availv2/.
 *   npx tsx src/autoedit/runAvailV2.ts
 */
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const DUR = 150;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/availv2");
const BROLL = "autoedit/avail-broll.mp4";
const CYAN = "#5BC0E8", GOLD = "#D4AF37", NAVY = "#1B3A6E";

interface Demo { name: string; blurb: string; overlays: { type: string; props: Record<string, unknown> }[] }

const DEMOS: Demo[] = [
  { name: "av1-rise-list", blurb: "Rise-line list (beta · Plan Max · futuro)",
    overlays: [{ type: "RevealText", props: { text: "VERSIÓN BETA\nSOLO PLAN MAX\nMARCA EL FUTURO", reveal: "rise-line", anchor: "lower-third", fontSize: 96, accent: "PLAN MAX", accentColor: CYAN, staggerFrames: 6, enterFrame: 6, holdFrames: DUR } }] },
  { name: "av2-typewriter", blurb: "Mono typewriter status line",
    overlays: [{ type: "RevealText", props: { text: "> DISPONIBILIDAD: BETA · PLAN MAX", reveal: "typewriter", anchor: "bottom-left", fontSize: 64, fontFamily: "monoCode", color: GOLD, uppercase: false, staggerFrames: 2, enterFrame: 6, holdFrames: DUR } }] },
  { name: "av3-maskwipe", blurb: "Mask-wipe hero headline",
    overlays: [{ type: "RevealText", props: { text: "SOLO PLAN MAX", reveal: "mask-wipe", anchor: "center", fontSize: 150, color: "#FFFFFF", accent: "MAX", accentColor: GOLD, revealFrames: 18, enterFrame: 8, holdFrames: DUR } }] },
  { name: "av4-word-by-word", blurb: "Word-by-word lower band",
    overlays: [{ type: "RevealText", props: { text: "POR AHORA SOLO EN PLAN MAX", reveal: "word-by-word", anchor: "lower-third", fontSize: 92, accent: "PLAN MAX", accentColor: GOLD, staggerFrames: 4, enterFrame: 6, holdFrames: DUR } }] },
  { name: "av5-ghost-macro", blurb: "Ghosted BETA macro + small label",
    overlays: [
      { type: "RevealText", props: { text: "BETA", reveal: "scale-in", anchor: "center", fontSize: 360, noWrap: true, opacityMax: 0.32, color: "#FFFFFF", outline: false, revealFrames: 22, enterFrame: 4, holdFrames: DUR } },
      { type: "RevealText", props: { text: "DISPONIBILIDAD", reveal: "fade-up", anchor: "top-center", fontSize: 64, color: CYAN, enterFrame: 16, holdFrames: DUR } },
    ] },
  { name: "av6-slide-statement", blurb: "Slide-in future statement (serif)",
    overlays: [{ type: "RevealText", props: { text: "el futuro del\ntrabajo con IA", reveal: "slide-left", anchor: "left", fontSize: 104, fontFamily: "serif", fontWeight: 600, uppercase: false, color: "#FFFFFF", outline: false, accent: "IA", accentColor: GOLD, revealFrames: 16, enterFrame: 8, holdFrames: DUR } }] },
];

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureBrowser();
  console.log("[availv2] bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  const results: { name: string; blurb: string; file: string }[] = [];
  for (const d of DEMOS) {
    const inputProps = {
      videoSrc: BROLL,
      overlays: d.overlays,
      caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
      handle: "@armandointeligencia",
      durationFrames: DUR,
    };
    const composition = await selectComposition({ serveUrl, id: "SpeakerOverlayScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${d.name}.mp4`);
    process.stdout.write(`[availv2] ${d.name} … `);
    await renderMedia({ composition: { ...composition, durationInFrames: DUR, fps: FPS }, serveUrl, codec: "h264", outputLocation: outAbs, inputProps });
    console.log("done");
    results.push({ name: d.name, blurb: d.blurb, file: `output/autoedit/availv2/${d.name}.mp4` });
  }
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ AVAIL V2 COMPLETE — ${results.length} treatments → ${OUT_DIR}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
