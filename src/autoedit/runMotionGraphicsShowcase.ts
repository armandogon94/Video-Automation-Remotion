#!/usr/bin/env node
/**
 * runMotionGraphicsShowcase — composite OVERLAY MOLECULES over real footage (B-roll
 * AND talking-head) across ALL the claude-cowork clips, so the motion-graphics
 * components can be validated in context ("add motion graphics on top of the B-roll
 * so they convey the message … try as many as you want, across all videos").
 *
 * Each demo stages a color-corrected slice of a source .MOV into public/autoedit/
 * (HLG→SDR LUT + bt709 tags, same path as renderFromPlan), then renders
 * SpeakerOverlayScene9x16 with that clip as `videoSrc` and a set of overlays. Bundle
 * ONCE, render many (RAM-safe). Outputs → output/autoedit/mg/<name>.mp4.
 *
 *   npx tsx src/autoedit/runMotionGraphicsShowcase.ts
 *
 * Does NOT edit shared components, the registry, editPlan, or Root.
 */
import fs from "fs";
import path from "path";

import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import { execa } from "execa";

import { hdrColorFixFilter, hlgLutPath } from "./renderFromPlan.js";

const FPS = 30;
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const FOOTAGE = path.join(PROJECT_ROOT, "output/footage/claude-cowork");
const OUT_DIR = path.join(PROJECT_ROOT, "output/autoedit/mg");
const PUB_DIR = path.join(PROJECT_ROOT, "public/autoedit");

interface Overlay {
  type: string;
  props: Record<string, unknown>;
  behindSpeaker?: boolean;
}
interface Demo {
  name: string;
  blurb: string; // shown in the gallery
  clip: string;
  start: number;
  end: number; // capped to ≤ 8s of render
  overlays: Overlay[];
}

const PURPLE = "#6B3FD4";
const CYAN = "#5BC0E8";
const GOLD = "#D4AF37";

// hold = whole clip for persistent graphics
const H = 9999;

const DEMOS: Demo[] = [
  // ───────── Availability B-roll (the ask): 3 variants to pick from ─────────
  {
    name: "avail-bullets",
    blurb: "Avail B-roll + building bullet list (DISPONIBILIDAD)",
    clip: "IMG_3629", start: 42.7, end: 50.7,
    overlays: [{
      type: "BuildingBulletListOverSpeaker",
      props: { heading: "DISPONIBILIDAD", items: [{ text: "Versión beta" }, { text: "Solo Plan Max" }, { text: "El futuro del trabajo con IA" }], anchor: "left", enterFrame: 6, beatFrames: 20, holdFrames: H, accentColor: CYAN, markerColor: PURPLE, fontSize: 44 },
    }],
  },
  {
    name: "avail-chips",
    blurb: "Avail B-roll + icon stat chips",
    clip: "IMG_3629", start: 42.7, end: 50.7,
    overlays: [{
      type: "IconStatChipStack",
      props: { chips: [{ emoji: "🧪", label: "Versión beta" }, { emoji: "👑", label: "Solo Plan Max" }, { emoji: "🚀", label: "El futuro del trabajo" }], anchor: "bottom-left", enterFrame: 6, staggerFrames: 8, holdFrames: H, pillColor: PURPLE, fontSize: 36 },
    }],
  },
  {
    name: "avail-callout",
    blurb: "Avail B-roll + diagnostic callout card",
    clip: "IMG_3629", start: 42.7, end: 50.7,
    overlays: [{
      type: "DiagnosticCalloutCard",
      props: { label: "DISPONIBILIDAD:", body: "Beta · Solo Plan Max", anchor: "bottom-left", enterFrame: 6, holdFrames: H, labelColor: GOLD, bodyFontSize: 50 },
    }],
  },

  // ───────── Go ham: varied molecules across all the clips ─────────
  {
    name: "hook-stat",
    blurb: "Hook + big stat chip (8h → minutos)",
    clip: "IMG_3615", start: 35.1, end: 40.6,
    overlays: [{
      type: "IconStatChipStack",
      props: { chips: [{ numeral: "8 h → min", label: "reduce tu trabajo" }], anchor: "top-right", enterFrame: 8, holdFrames: H, pillColor: PURPLE, fontSize: 38 },
    }],
  },
  {
    name: "setup-brand",
    blurb: "Setup + brand wordmark pop (Claude Cowork)",
    clip: "IMG_3616", start: 40.8, end: 45.3,
    overlays: [{
      type: "BrandLogoPopOverSpeaker",
      props: { wordmark: "Claude Cowork", color: "#FFFFFF", revealColor: CYAN, letterReveal: true, anchor: "right", fontSizePx: 78, enterFrame: 8, holdFrames: H },
    }],
  },
  {
    name: "features-bullets",
    blurb: "Repurposed (off-cam) features clip as B-roll + feature bullets",
    clip: "IMG_3627", start: 15.2, end: 23.2,
    overlays: [{
      type: "BuildingBulletListOverSpeaker",
      props: { heading: "QUÉ HACE", items: [{ text: "Organiza carpetas" }, { text: "Analiza documentos" }, { text: "Crea reportes y Excel" }], anchor: "left", enterFrame: 6, beatFrames: 22, holdFrames: H, accentColor: GOLD, markerColor: PURPLE, fontSize: 44 },
    }],
  },
  {
    name: "features-chips",
    blurb: "Features B-roll + numbered chip row",
    clip: "IMG_3627", start: 23.4, end: 31.2,
    overlays: [{
      type: "FloatingNumberedChipRow",
      props: { count: 3, labels: ["Organiza", "Crea", "Resume"], anchor: "lower-third", enterFrame: 6, staggerFrames: 6, holdFrames: H, chipColor: PURPLE, activeChip: 1 },
    }],
  },
  {
    name: "how2-auto",
    blurb: "How-it-works + icon pop + glow word (EN AUTOMÁTICO)",
    clip: "IMG_3617", start: 91.2, end: 99.3,
    overlays: [
      { type: "IconPopOverSpeaker", props: { icon: "🤖", anchor: "top-right", enterFrame: 10, holdFrames: H, sizePx: 150, glowPulse: true, glowColor: CYAN } },
      { type: "YellowGlowWordCallout", props: { text: "EN AUTOMÁTICO", anchor: "bottom-left", enterFrame: 28, holdFrames: H, yellow: CYAN, fontSize: 92 } },
    ],
  },
  {
    name: "cta-callout",
    blurb: "CTA + diagnostic callout (¿es para tu empresa?)",
    clip: "IMG_3630", start: 16.1, end: 21.9,
    overlays: [{
      type: "DiagnosticCalloutCard",
      props: { label: "PARA TU EMPRESA:", body: "¿Es la decisión\ncorrecta?", anchor: "right", enterFrame: 8, holdFrames: H, labelColor: GOLD, bodyFontSize: 52 },
    }],
  },
  {
    name: "cta-comment",
    blurb: "CTA + comment-word glow + chat icon",
    clip: "IMG_3630", start: 25.4, end: 28.5,
    overlays: [
      { type: "IconPopOverSpeaker", props: { icon: "💬", anchor: "top-left", enterFrame: 6, holdFrames: H, sizePx: 140, glowPulse: true, glowColor: GOLD } },
      { type: "YellowGlowWordCallout", props: { text: "herramientas", anchor: "bottom-left", enterFrame: 14, holdFrames: H, yellow: GOLD, fontSize: 110 } },
    ],
  },
  {
    name: "follow-outro",
    blurb: "Follow + persistent badge + outro title",
    clip: "IMG_3632", start: 4.4, end: 12.4,
    overlays: [
      { type: "PersistentCornerBadge", props: { label: "@armandointeligencia", anchor: "top-left", enterFrame: 4, holdFrames: H } },
      { type: "AnimatedOpenerTitleOverDarkSet", props: { title: "ARMANDO\nINTELIGENCIA", kicker: "SÍGUEME", anchor: "lower-third", showOrb: true, orbColor: PURPLE, fontSizePx: 96, dimTo: 0.55, enterFrame: 10, holdFrames: H } },
    ],
  },
];

async function stage(d: Demo): Promise<string> {
  const w = 1080, h = 1920;
  const dur = Math.min(d.end - d.start, 8); // cap render length
  const colorFix = hdrColorFixFilter(true, hlgLutPath(PROJECT_ROOT));
  const vf =
    `${colorFix}scale=${w}:${h}:force_original_aspect_ratio=increase,` +
    `crop=${w}:${h},fps=${FPS},format=yuv420p,` +
    `setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709`;
  const outAbs = path.join(PUB_DIR, `mg-${d.name}.mp4`);
  await execa("ffmpeg", [
    "-y", "-ss", String(d.start), "-t", String(dur),
    "-i", path.join(FOOTAGE, `${d.clip}.MOV`),
    "-vf", vf, "-an", "-c:v", "libx264", "-crf", "19", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", outAbs,
  ]);
  return path.posix.join("autoedit", `mg-${d.name}.mp4`);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUB_DIR, { recursive: true });

  console.log(`[mg] staging ${DEMOS.length} clips…`);
  const staticRefs: Record<string, string> = {};
  for (const d of DEMOS) {
    staticRefs[d.name] = await stage(d);
    console.log(`  staged ${d.name}`);
  }

  console.log(`[mg] bundling…`);
  await ensureBrowser();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });

  const results: { name: string; blurb: string; file: string }[] = [];
  for (const d of DEMOS) {
    const durationInFrames = Math.round(Math.min(d.end - d.start, 8) * FPS);
    const inputProps: Record<string, unknown> = {
      videoSrc: staticRefs[d.name],
      handle: "@armandointeligencia",
      durationFrames: durationInFrames,
      caption: { wordTimings: [], style: "editorial-cyan", position: "bottom-center", mode: "karaoke", register: "editorial" },
      overlays: d.overlays,
    };
    const composition = await selectComposition({ serveUrl, id: "SpeakerOverlayScene9x16", inputProps });
    const outAbs = path.join(OUT_DIR, `${d.name}.mp4`);
    process.stdout.write(`[mg] render ${d.name} … `);
    await renderMedia({
      composition: { ...composition, durationInFrames, fps: FPS },
      serveUrl, codec: "h264", outputLocation: outAbs, inputProps,
    });
    console.log("done");
    results.push({ name: d.name, blurb: d.blurb, file: `output/autoedit/mg/${d.name}.mp4` });
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ MOTION-GRAPHICS SHOWCASE COMPLETE — ${results.length} demos → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("\n✗ runMotionGraphicsShowcase failed:", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
