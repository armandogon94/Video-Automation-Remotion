#!/usr/bin/env node
/**
 * HyperFrames orchestrator for the 2026-05-18 "Gemini 3.2 Flash leak" video.
 * Reuses the SAME audio + TTS word-timings that the Remotion side renders from
 * (so the bake-off is fair). Fills templates/tech-news-flash.html with the
 * brief's 6 overlays + word-timings, writes hyperframes/index.html, runs
 * `hyperframes render`, then runs the same FFmpeg post-processing as Remotion.
 *
 * Run from project root (NOT from inside hyperframes/) — paths are absolute.
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";
import { fileURLToPath } from "url";

const SLUG = "2026-05-18-gemini-3-2-flash-leak";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HF_DIR = path.resolve(__dirname, "..");
const PROJECT_ROOT = path.resolve(HF_DIR, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "output", SLUG);
const HF_OUT = path.join(OUT_DIR, "hyperframes");
const FPS = 30;

function log(stage: string, msg: string) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${stage}] ${msg}`);
}

const OVERLAYS = [
  { kind: "chip", text: "FILTRACIÓN", startSeconds: 0, endSeconds: 3 },
  { kind: "huge", text: "GEMINI 3.2 FLASH", startSeconds: 0, endSeconds: 3 },
  { kind: "huge", text: "15× MÁS BARATO", startSeconds: 12, endSeconds: 14 },
  {
    kind: "subtitle",
    text: "$0.25 / $2.00 por millón de tokens",
    startSeconds: 14,
    endSeconds: 18,
  },
  {
    kind: "huge",
    text: "92% del rendimiento de GPT-5.5",
    startSeconds: 18,
    endSeconds: 22,
  },
  { kind: "huge", text: "<200ms latencia", startSeconds: 22, endSeconds: 26 },
  { kind: "cta", text: "LISTA HOY", startSeconds: 38, endSeconds: 43 },
];

async function main() {
  fs.mkdirSync(HF_OUT, { recursive: true });

  // ─── Inputs ──────────────────────────────────────────────
  const sharedAudio = path.join(OUT_DIR, "audio", "voiceover.mp3");
  const sharedTimings = path.join(OUT_DIR, "audio", "voiceover.timestamps.json");
  if (!fs.existsSync(sharedAudio) || !fs.existsSync(sharedTimings)) {
    throw new Error(`Missing shared audio/timings at ${OUT_DIR}/audio/. Run TTS first.`);
  }
  const ttsData = JSON.parse(fs.readFileSync(sharedTimings, "utf-8"));
  const wordTimings = ttsData.words as Array<{
    text: string;
    startSeconds: number;
    endSeconds: number;
    startFrame: number;
    endFrame: number;
  }>;
  const lastWord = wordTimings[wordTimings.length - 1];
  const audioDuration = lastWord ? lastWord.endSeconds + 0.5 : 45;
  log("Pipeline", `${wordTimings.length} words, ${audioDuration.toFixed(2)}s`);

  // ─── Copy audio into hyperframes/ (HF serves project-root assets) ───
  const hfAudio = path.join(HF_DIR, "audio.mp3");
  fs.copyFileSync(sharedAudio, hfAudio);
  log("Compose", `Audio staged at ${hfAudio}`);

  // ─── Fill template ───────────────────────────────────────
  const tplPath = path.join(HF_DIR, "templates", "tech-news-flash.html");
  let html = fs.readFileSync(tplPath, "utf-8");
  const replacements: Record<string, string> = {
    "{{DURATION_SECONDS}}": audioDuration.toFixed(2),
    "{{AUDIO_FILENAME}}": "audio.mp3",
    "{{OVERLAYS_JSON}}": JSON.stringify(OVERLAYS),
    "{{WORD_TIMINGS_JSON}}": JSON.stringify(wordTimings),
  };
  for (const [k, v] of Object.entries(replacements)) {
    html = html.split(k).join(v);
  }
  fs.writeFileSync(path.join(HF_DIR, "index.html"), html);

  // Also persist a copy under the output directory for the audit trail
  fs.writeFileSync(path.join(HF_OUT, "source.html"), html);
  log("Compose", "index.html written + archived to output/<slug>/hyperframes/source.html");

  // ─── Lint (catch errors before the slow render) ──────────
  const hfBin = path.join(HF_DIR, "node_modules/.bin/hyperframes");
  log("Lint", "Running hyperframes lint...");
  try {
    const lint = await execa(hfBin, ["lint"], { cwd: HF_DIR });
    const lastLine = lint.stdout.trim().split("\n").slice(-1)[0];
    log("Lint", lastLine);
    if (/[1-9]\d* error/i.test(lint.stdout)) {
      throw new Error(`hyperframes lint reported errors:\n${lint.stdout}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("[Lint] failed:");
      console.error(err.message);
    }
    throw err;
  }

  // ─── Render ─────────────────────────────────────────────
  log("Render", "hyperframes render -> raw.mp4 ...");
  const rawVideo = path.join(HF_OUT, "raw.mp4");
  const renderStart = Date.now();
  await execa(hfBin, ["render", "-o", rawVideo, "--fps", String(FPS)], {
    cwd: HF_DIR,
    stdio: "inherit",
  });
  const renderSec = (Date.now() - renderStart) / 1000;
  log("Render", `Raw render done in ${renderSec.toFixed(1)}s`);

  // ─── FFmpeg: normalize + master ──────────────────────────
  const masterFile = path.join(HF_OUT, "master.mp4");
  log("FFmpeg", "Normalizing audio + writing master...");
  const normStart = Date.now();
  await execa("ffmpeg", [
    "-y",
    "-i", rawVideo,
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    masterFile,
  ], { stdio: "ignore" });
  log("FFmpeg", `master.mp4 ready in ${((Date.now() - normStart) / 1000).toFixed(1)}s`);

  // ─── Platform encodings ─────────────────────────────────
  const platforms = [
    { name: "tiktok", vBitrate: "8M", aBitrate: "128k" },
    { name: "reels", vBitrate: "5M", aBitrate: "128k" },
    { name: "shorts", vBitrate: "8M", aBitrate: "128k" },
  ];
  for (const p of platforms) {
    const out = path.join(HF_OUT, `master.${p.name}.mp4`);
    log("Export", `${p.name} (${p.vBitrate})...`);
    await execa("ffmpeg", [
      "-y",
      "-i", masterFile,
      "-c:v", "libx264", "-b:v", p.vBitrate, "-maxrate", p.vBitrate, "-bufsize", "16M",
      "-preset", "medium", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", p.aBitrate,
      "-movflags", "+faststart",
      out,
    ], { stdio: "ignore" });
  }

  // ─── Report ─────────────────────────────────────────────
  const masterStats = fs.statSync(masterFile);
  const tiktokStats = fs.statSync(path.join(HF_OUT, "master.tiktok.mp4"));
  const reelsStats = fs.statSync(path.join(HF_OUT, "master.reels.mp4"));
  const shortsStats = fs.statSync(path.join(HF_OUT, "master.shorts.mp4"));

  console.log("\n✓ HyperFrames variant complete");
  console.log(`  Duration:     ${audioDuration.toFixed(2)}s`);
  console.log(`  Raw render:   ${renderSec.toFixed(1)}s`);
  console.log(`  master.mp4:           ${(masterStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  master.tiktok.mp4:    ${(tiktokStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  master.reels.mp4:     ${(reelsStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  master.shorts.mp4:    ${(shortsStats.size / 1024 / 1024).toFixed(2)} MB`);

  fs.writeFileSync(
    path.join(HF_OUT, "render.timings.json"),
    JSON.stringify(
      {
        slug: SLUG,
        template: "tech-news-flash",
        durationSeconds: audioDuration,
        renderSeconds: renderSec,
        sizesBytes: {
          master: masterStats.size,
          tiktok: tiktokStats.size,
          reels: reelsStats.size,
          shorts: shortsStats.size,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("\n✗ HyperFrames render failed:", err);
  process.exit(1);
});
