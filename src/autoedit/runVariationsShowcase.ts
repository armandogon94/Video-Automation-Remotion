#!/usr/bin/env node
/**
 * runVariationsShowcase — fan out MANY "different ways text appears" demos over real
 * footage, in two dimensions, using the new RevealText component:
 *   • DEPTH  — text rendered BEHIND the speaker (routed under the RVM foreground
 *              matte) with varied reveal modes / positions / scales / opacities.
 *   • TEXT   — the same RevealText on-screen (foreground), one demo per reveal mode
 *              so every entrance style can be compared side by side.
 *
 * Reuses the 3 already-staged + matted plates (IMG_3618, depth-follow, depth-hook)
 * so NO extra staging is needed. Bundle once, render many. Outputs → output/autoedit/var/.
 *   npx tsx src/autoedit/runVariationsShowcase.ts
 */
import fs from "fs";
import path from "path";

import { bundleOnce as bundle } from "./bundleOnce";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const DUR = 90; // 3s per demo — enough to see reveal + hold
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/var");

const NAVY = "#1B3A6E";
const GOLD = "#D4AF37";
const CYAN = "#5BC0E8";
const RED = "#E50914";

// Matted plates (plate staticFile ref + matte png-sequence pattern).
const PLATES = {
  benefit: { plate: "autoedit/IMG_3618.mp4", matte: "matte/IMG_3618/fg/%04d.png" },
  follow: { plate: "autoedit/depth-follow.mp4", matte: "matte/depth-follow/fg/%04d.png" },
  hook: { plate: "autoedit/depth-hook.mp4", matte: "matte/depth-hook/fg/%04d.png" },
} as const;

const FULL = { xPct: 0, yPct: 0, wPct: 1, hPct: 1, shape: "rect" as const };

interface Demo {
  name: string;
  blurb: string;
  // Optional: the demo literals below never set this, so at runtime `d.category`
  // is `undefined` and the `d.category === "depth"` branch is never taken (every
  // demo renders via the foreground/`text` path). Kept optional to preserve that
  // exact runtime behavior while satisfying the type checker.
  category?: "depth" | "text";
  plate: keyof typeof PLATES;
  props: Record<string, unknown>; // RevealText props
}

// ───────── DEPTH: text BEHIND the speaker, many ways ─────────
const DEPTH: Demo[] = [
  { name: "d01-ghost-macro", blurb: "Ghosted macro word INTELIGENCIA behind (28%, scale-in)", plate: "benefit",
    props: { text: "INTELIGENCIA", reveal: "scale-in", anchor: "center", fontSize: 280, noWrap: true, opacityMax: 0.3, color: "#FFFFFF", outline: false, revealFrames: 22 } },
  { name: "d02-chapter-numeral", blurb: "Giant chapter numeral 01 pops in behind (gold)", plate: "hook",
    props: { text: "01", reveal: "pop", anchor: "center", fontSize: 620, color: GOLD, opacityMax: 0.85, glow: true, glowColor: GOLD, revealFrames: 12 } },
  { name: "d03-keyword-top", blurb: "NETFLIX hero word top, behind head (red, pop)", plate: "benefit",
    props: { text: "NETFLIX", reveal: "pop", anchor: "upper-third", fontSize: 200, color: RED, glow: true, glowColor: RED, revealFrames: 12 } },
  { name: "d04-typewriter", blurb: "Typewriter ARMANDO INTELIGENCIA behind (cyan caret)", plate: "follow",
    props: { text: "ARMANDO\nINTELIGENCIA", reveal: "typewriter", anchor: "center", fontSize: 150, color: "#FFFFFF", accent: "INTELIGENCIA", accentColor: CYAN, fontFamily: "mono", staggerFrames: 3 } },
  { name: "d05-rise-stat", blurb: "8 HORAS → MINUTOS rises line-by-line behind", plate: "hook",
    props: { text: "8 HORAS\nA MINUTOS", reveal: "rise-line", anchor: "center", fontSize: 175, color: "#FFFFFF", accent: "MINUTOS", accentColor: GOLD, staggerFrames: 5 } },
  { name: "d06-side-mask", blurb: "FUTURO wipes in at the side, behind shoulder", plate: "benefit",
    props: { text: "FUTURO", reveal: "mask-wipe", anchor: "right", fontSize: 190, color: CYAN, opacityMax: 0.9, revealFrames: 18 } },
  { name: "d07-word-by-word", blurb: "EL FUTURO DEL TRABAJO words pop in behind (lower)", plate: "follow",
    props: { text: "EL FUTURO DEL TRABAJO", reveal: "word-by-word", anchor: "lower-third", fontSize: 110, color: "#FFFFFF", accent: "FUTURO", accentColor: CYAN, staggerFrames: 4 } },
  { name: "d08-blur-brand", blurb: "COWORK de-blurs in behind (navy, half opacity)", plate: "hook",
    props: { text: "COWORK", reveal: "blur-in", anchor: "center", fontSize: 320, color: NAVY, opacityMax: 0.55, outline: false, revealFrames: 20 } },
  { name: "d09-slide-up", blurb: "AUTOMÁTICO slides up behind (gold)", plate: "benefit",
    props: { text: "AUTOMÁTICO", reveal: "slide-up", anchor: "center", fontSize: 175, color: GOLD, glow: true, glowColor: GOLD, revealFrames: 16 } },
  { name: "d10-macro-overflow", blurb: "IA macro overflowing frame behind (ghosted)", plate: "follow",
    props: { text: "IA", reveal: "scale-in", anchor: "center", fontSize: 900, noWrap: true, opacityMax: 0.22, color: "#FFFFFF", outline: false, revealFrames: 24 } },
];

// ───────── TEXT: same component on-screen, one per reveal mode ─────────
const TEXT: Demo[] = [
  { name: "t01-pop", blurb: "pop — spring scale + fade", plate: "benefit",
    props: { text: "REDUCE TU\nTRABAJO", reveal: "pop", anchor: "lower-third", fontSize: 130, accent: "TRABAJO", accentColor: CYAN } },
  { name: "t02-fade-up", blurb: "fade-up — opacity + rise", plate: "follow",
    props: { text: "ARMANDO\nINTELIGENCIA", reveal: "fade-up", anchor: "center", fontSize: 140, accent: "INTELIGENCIA", accentColor: GOLD } },
  { name: "t03-slide-left", blurb: "slide-left — enters from right", plate: "hook",
    props: { text: "EL FUTURO\nDEL TRABAJO", reveal: "slide-left", anchor: "left", fontSize: 120, accentColor: CYAN } },
  { name: "t04-slide-up", blurb: "slide-up — rises from below", plate: "benefit",
    props: { text: "EN AUTOMÁTICO", reveal: "slide-up", anchor: "lower-third", fontSize: 120, color: GOLD } },
  { name: "t05-scale-in", blurb: "scale-in — settles from 1.35×", plate: "follow",
    props: { text: "SÍGUEME", reveal: "scale-in", anchor: "center", fontSize: 200, color: CYAN, glow: true, glowColor: CYAN } },
  { name: "t06-blur-in", blurb: "blur-in — de-blurs", plate: "hook",
    props: { text: "CLAUDE\nCOWORK", reveal: "blur-in", anchor: "center", fontSize: 150, accent: "COWORK", accentColor: GOLD } },
  { name: "t07-typewriter", blurb: "typewriter — chars reveal + caret", plate: "benefit",
    props: { text: "$ claude --cowork", reveal: "typewriter", anchor: "center", fontSize: 90, fontFamily: "monoCode", color: "#FFFFFF", accent: "cowork", accentColor: CYAN, uppercase: false, staggerFrames: 3 } },
  { name: "t08-word-by-word", blurb: "word-by-word — staggered pops", plate: "follow",
    props: { text: "COMENTA LA PALABRA HERRAMIENTAS", reveal: "word-by-word", anchor: "lower-third", fontSize: 96, accent: "HERRAMIENTAS", accentColor: GOLD, staggerFrames: 4 } },
  { name: "t09-mask-wipe", blurb: "mask-wipe — left→right reveal", plate: "hook",
    props: { text: "ANTHROPIC", reveal: "mask-wipe", anchor: "center", fontSize: 200, color: "#FFFFFF", revealFrames: 18 } },
  { name: "t10-rise-line", blurb: "rise-line — multi-line stagger", plate: "benefit",
    props: { text: "ORGANIZA\nCREA\nRESUME", reveal: "rise-line", anchor: "left", fontSize: 130, accentColor: CYAN, staggerFrames: 5 } },
  { name: "t11-serif-quote", blurb: "serif elegant fade-up (editorial)", plate: "follow",
    props: { text: "el futuro del\ntrabajo con IA", reveal: "fade-up", anchor: "center", fontSize: 110, fontFamily: "serif", fontWeight: 600, uppercase: false, color: "#FFFFFF", outline: false, glow: false } },
  { name: "t12-mono-terminal", blurb: "mono terminal typewriter (gold)", plate: "hook",
    props: { text: ">_ INICIANDO IA...", reveal: "typewriter", anchor: "bottom-left", fontSize: 80, fontFamily: "monoCode", color: GOLD, uppercase: false, staggerFrames: 2 } },
];

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("[var] bundling…");
  await ensureBrowser();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });

  const all: Demo[] = [...DEPTH, ...TEXT];
  const results: { name: string; blurb: string; category?: string; file: string }[] = [];

  for (const d of all) {
    const pl = PLATES[d.plate];
    const inputProps: Record<string, unknown> =
      d.category === "depth"
        ? {
            camSrc: pl.plate,
            layoutTrack: [{ id: "lay-0", startFrame: 0, endFrame: DUR, layout: { cam: FULL } }],
            foregroundMatte: { src: pl.matte, kind: "png-sequence" },
            overlays: [{ type: "RevealText", behindSpeaker: true, props: { ...d.props, enterFrame: 6, holdFrames: DUR } }],
            caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
            handle: "@armandointeligencia",
            durationFrames: DUR,
          }
        : {
            videoSrc: pl.plate,
            overlays: [{ type: "RevealText", props: { ...d.props, enterFrame: 6, holdFrames: DUR } }],
            caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
            handle: "@armandointeligencia",
            durationFrames: DUR,
          };

    const composition = await selectComposition({ serveUrl, id: "SpeakerOverlayScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${d.name}.mp4`);
    process.stdout.write(`[var] ${d.category} ${d.name} … `);
    await renderMedia({
      composition: { ...composition, durationInFrames: DUR, fps: FPS },
      serveUrl, codec: "h264", outputLocation: outAbs, inputProps,
    });
    console.log("done");
    results.push({ name: d.name, blurb: d.blurb, category: d.category, file: `output/autoedit/var/${d.name}.mp4` });
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ VARIATIONS SHOWCASE COMPLETE — ${results.length} demos → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("\n✗ runVariationsShowcase failed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
