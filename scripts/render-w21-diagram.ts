#!/usr/bin/env node
/**
 * W21 "Gemini 3.2 Flash leak" — DiagramExplainer9x16 renderer.
 *
 * Renders the W21 voiceover (audio + word timings already pre-computed) onto
 * the DiagramExplainer9x16 composition in BOTH `cream` and `dark` palettes,
 * mapping the news narrative onto Carlos's cream-flowchart node grammar.
 *
 * Inputs (must already exist):
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.mp3
 *   output/2026-05-18-gemini-3-2-flash-leak/audio/voiceover.aligned.json
 *   public/voiceover-2026-05-18-gemini-3-2-flash-leak.mp3 (staged copy)
 *
 * Outputs:
 *   output/2026-05-18-gemini-3-2-flash-leak/diagram-cream/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/diagram-cream/preview-t25s.jpg
 *   output/2026-05-18-gemini-3-2-flash-leak/diagram-dark/master.mp4
 *   output/2026-05-18-gemini-3-2-flash-leak/diagram-dark/preview-t25s.jpg
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const FPS = 30;

type AlignedWord = {
  text: string;
  startFrame: number;
  endFrame: number;
  startSeconds: number;
  endSeconds: number;
  source?: string;
};

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

async function main() {
  // ── 1. Read inputs ──────────────────────────────────────────────
  const audioFile = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const alignedFile = path.join(OUT_DIR, "audio", "voiceover.aligned.json");

  if (!fs.existsSync(audioFile)) throw new Error(`Missing audio at ${audioFile}`);
  if (!fs.existsSync(alignedFile)) throw new Error(`Missing aligned JSON at ${alignedFile}`);

  const alignedRaw = JSON.parse(fs.readFileSync(alignedFile, "utf-8")) as
    | AlignedWord[]
    | { words: AlignedWord[] };
  const wordTimings: AlignedWord[] = Array.isArray(alignedRaw)
    ? alignedRaw
    : alignedRaw.words;
  if (!wordTimings.length) throw new Error("Empty wordTimings");

  // Strip the `source` diagnostic — composition schema doesn't expect it (extra
  // keys are fine in Zod by default but keep payload clean).
  const cleanWordTimings = wordTimings.map(({ text, startFrame, endFrame, startSeconds, endSeconds }) => ({
    text,
    startFrame,
    endFrame,
    startSeconds,
    endSeconds,
  }));

  // ── 2. Duration ─────────────────────────────────────────────────
  const lastWord = cleanWordTimings[cleanWordTimings.length - 1];
  const audioDuration = lastWord.endSeconds + 0.5;
  const durationInFrames = Math.ceil(audioDuration * FPS);
  log("Pipeline", `Duration: ${audioDuration.toFixed(2)}s · ${durationInFrames} frames @${FPS}fps`);

  // ── 3. Stage audio in public/ ───────────────────────────────────
  const publicDir = path.join(PROJECT_ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const publicAudioName = `voiceover-${SLUG}.mp3`;
  const publicAudioPath = path.join(publicDir, publicAudioName);
  if (!fs.existsSync(publicAudioPath)) {
    fs.copyFileSync(audioFile, publicAudioPath);
    log("Render", `Audio staged at public/${publicAudioName}`);
  } else {
    log("Render", `Audio already staged at public/${publicAudioName}`);
  }

  // ── 4. Bundle once ──────────────────────────────────────────────
  await ensureBrowser();
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });
  log("Render", `Bundle ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  // ── 5. Shared input props (palette overridden per render) ───────
  // Nodes mapped to W21 narrative beats, timed to spoken keywords.
  const nodes = [
    { title: "Filtraron Gemini 3.2 Flash", sublabel: "5 mayo · builds iOS", enterAtSeconds: 0.5 },
    { title: "15× más barato", sublabel: "$0.25 / $2.00 / 1M tokens", enterAtSeconds: 14.5 },
    { title: "92% rendimiento GPT-5.5", sublabel: "<200ms latencia", enterAtSeconds: 22.5 },
    { title: "Lista hoy", sublabel: "vuelves a encender features", enterAtSeconds: 36.0, ghosted: false },
  ];

  const baseInputProps = {
    audioUrl: publicAudioName,
    wordTimings: cleanWordTimings,
    sectionLabel: "EL LEAK",
    breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
    subjectTool: "gemini",
    nodes,
    sequenceStepSeconds: 1.4,
    firstNodeDelaySeconds: 0.4,
    // Empty strings = let palette drive the colors.
    paperColor: "",
    inkColor: "",
    accentColor: "",
    mutedColor: "",
    captionFontSize: 44,
    showWatermark: false,
  };

  // ── 6. Render two variants ──────────────────────────────────────
  const variants: Array<{ palette: "cream" | "dark"; dir: string }> = [
    { palette: "cream", dir: path.join(OUT_DIR, "diagram-cream") },
    { palette: "dark", dir: path.join(OUT_DIR, "diagram-dark") },
  ];

  for (const v of variants) {
    fs.mkdirSync(v.dir, { recursive: true });
    const inputProps = { ...baseInputProps, palette: v.palette };

    log("Render", `Selecting composition for palette=${v.palette}...`);
    const composition = await selectComposition({
      serveUrl,
      id: "DiagramExplainer9x16",
      inputProps,
    });

    const mp4Path = path.join(v.dir, "master.mp4");
    log("Render", `Rendering ${durationInFrames} frames -> ${mp4Path}`);
    const renderStart = Date.now();
    await renderMedia({
      composition: { ...composition, durationInFrames },
      serveUrl,
      codec: "h264",
      audioCodec: "aac",
      outputLocation: mp4Path,
      inputProps,
      onProgress: ({ progress }) => {
        if (progress !== undefined) {
          const pct = Math.round(progress * 100);
          if (pct % 10 === 0 && pct > 0) {
            process.stdout.write(`\r[Render ${v.palette}] ${pct}%`);
          }
        }
      },
    });
    process.stdout.write("\n");
    const renderSec = (Date.now() - renderStart) / 1000;
    const stats = fs.statSync(mp4Path);
    log(
      "Render",
      `${v.palette} done in ${renderSec.toFixed(1)}s · ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    );

    // Extract representative JPG frame at t=25s (mid-narrative)
    const jpgPath = path.join(v.dir, "preview-t25s.jpg");
    log("FFmpeg", `Extracting preview-t25s.jpg for ${v.palette}...`);
    await execa(
      "ffmpeg",
      ["-y", "-ss", "25", "-i", mp4Path, "-frames:v", "1", "-q:v", "2", jpgPath],
      { stdio: "ignore" },
    );
  }

  // ── 7. Report ───────────────────────────────────────────────────
  console.log("\n✓ W21 DiagramExplainer renders complete");
  for (const v of variants) {
    const mp4 = path.join(v.dir, "master.mp4");
    const jpg = path.join(v.dir, "preview-t25s.jpg");
    const mp4Stats = fs.statSync(mp4);
    const jpgStats = fs.statSync(jpg);
    console.log(`  [${v.palette}] master.mp4: ${mp4} (${(mp4Stats.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`  [${v.palette}] preview-t25s.jpg: ${jpg} (${(jpgStats.size / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error("\n✗ Render failed:", err);
  process.exit(1);
});
