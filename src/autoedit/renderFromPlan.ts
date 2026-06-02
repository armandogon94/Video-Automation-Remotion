/**
 * renderFromPlan — turn a validated `EditPlan` + its source video into a finished
 * MP4 by (1) cutting/concatenating the KEEP segments into a trimmed, downscaled
 * base clip and (2) rendering `SpeakerOverlayScene{9x16,16x9}` over that clip with
 * props derived from the plan.
 *
 * WHY THIS SHAPE
 * --------------
 * The EditPlan (editPlan.ts) is authored on TWO timelines: each `EditSegment` has
 * a SOURCE range (what ffmpeg cuts from the original file) and an EDIT range (where
 * it lands on the trimmed output). Captions/overlays in the plan are ALREADY
 * authored against EDIT-time frames (buildEditPlan.shiftWordsToEditTimeline did the
 * re-projection). So this module's only timeline job is the ffmpeg cut: extract the
 * source ranges and butt them together. The rendered base clip then starts at edit
 * frame 0, exactly where the plan's caption/overlay frames are measured from.
 *
 * TWO STAGES
 * ----------
 *   1. `trimAndStageBaseClip` — ffmpeg trim+concat the KEEP segments, downscale to
 *      the target aspect (4K HEVC source → 1080×1920 / 1920×1080), normalize fps to
 *      the plan fps, re-encode H.264. Staged UNDER `public/autoedit/` because
 *      Remotion `staticFile()` only resolves assets under `public/`.
 *   2. `renderEditedVideo` — bundle the Remotion project, `selectComposition` for
 *      the aspect-appropriate `SpeakerOverlayScene`, OVERRIDE its registered
 *      duration with the plan's `editDurationFrames`, and `renderMedia` with props
 *      built by `buildSceneProps` from the plan. Writes `output/autoedit/<slug>-edit.mp4`.
 *
 * CONSUMES (never edits) `SpeakerOverlayScene9x16` / `SpeakerOverlayScene16x9` and
 * `editPlan.ts`. Overriding `durationInFrames` on the `selectComposition` result is
 * the same idiom the main pipeline uses (`src/pipeline/pipeline.ts`).
 */
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { execa } from "execa";
import fs from "fs";
import path from "path";

import type { EditPlan, EditSegment } from "./editPlan.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public option / result shapes
// ─────────────────────────────────────────────────────────────────────────────

/** Typographic/animation preset forwarded to FloatingCaption (Wave-9 §1.2). */
export type CaptionStyle =
  | "classic"
  | "hormozi-pop"
  | "box-highlight"
  | "editorial-cyan"
  | "condensed-hype"
  | "slide-clean"
  | "blur-premium"
  | "type-terminal";

export interface RenderFromPlanOptions {
  /** The validated EditPlan (the analysis-stage artifact). */
  plan: EditPlan;
  /** Project root (where `src/index.ts` and `public/` live). */
  projectRoot: string;
  /** Slug used for the staged clip + final output filenames. */
  slug: string;
  /** Caption style preset (typographic axis). Default 'editorial-cyan'. */
  captionStyle?: CaptionStyle;
  /** Brand handle chip; "" hides it. Defaults to the scene default. */
  handle?: string;
  /** Progress callback (0..1) for the Remotion render. */
  onProgress?: (progress: number) => void;
  /** Logger; defaults to console.log with a [render] tag. */
  log?: (msg: string) => void;
}

export interface RenderFromPlanResult {
  /** Absolute path to the staged (trimmed, downscaled) base clip under public/. */
  stagedClipPath: string;
  /** staticFile()-relative path of the staged clip (what the scene receives). */
  stagedClipStaticRef: string;
  /** Absolute path to the final rendered MP4. */
  outputPath: string;
  /** Composition id that was rendered. */
  compositionId: string;
  /** Edit-timeline duration actually rendered, in frames. */
  durationInFrames: number;
  /** Wall-clock render time (ffmpeg trim + Remotion), in seconds. */
  elapsedSeconds: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aspect → canvas dimensions
// ─────────────────────────────────────────────────────────────────────────────

function dimensionsForAspect(aspect: EditPlan["aspect"]): {
  width: number;
  height: number;
  compositionId: string;
} {
  return aspect === "9:16"
    ? { width: 1080, height: 1920, compositionId: "SpeakerOverlayScene9x16" }
    : { width: 1920, height: 1080, compositionId: "SpeakerOverlayScene16x9" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — ffmpeg trim + concat the KEEP segments → staged base clip
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the ffmpeg `filter_complex` that trims each KEEP segment from the source
 * and concatenates them back-to-back, then scales to `width`×`height` (preserving
 * aspect via center-crop) and forces `fps`. Returns the filtergraph string with a
 * single labelled output `[vout]`.
 *
 * The scale uses `force_original_aspect_ratio=increase` + `crop` so a portrait 4K
 * source fills a 1080×1920 canvas with no letterboxing (matches the scene's
 * `objectFit: cover`). Audio segments are concatenated in parallel into `[aout]`.
 */
export function buildTrimConcatFilter(
  segments: EditSegment[],
  width: number,
  height: number,
  fps: number,
): { filter: string; hasAudio: boolean } {
  const vParts: string[] = [];
  const aParts: string[] = [];
  const vLabels: string[] = [];
  const aLabels: string[] = [];

  segments.forEach((seg, i) => {
    const start = seg.source.startSeconds;
    const end = seg.source.endSeconds;
    // Video: trim by source seconds, reset PTS so concat sees a 0-based stream.
    vParts.push(
      `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`,
    );
    vLabels.push(`[v${i}]`);
    // Audio: same trim window.
    aParts.push(
      `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}]`,
    );
    aLabels.push(`[a${i}]`);
  });

  const n = segments.length;
  const vConcat = `${vLabels.join("")}concat=n=${n}:v=1:a=0[vcat]`;
  const aConcat = `${aLabels.join("")}concat=n=${n}:v=0:a=1[aout]`;

  // Downscale + center-crop to fill the canvas, then normalize fps.
  const scale =
    `[vcat]scale=${width}:${height}:force_original_aspect_ratio=increase,` +
    `crop=${width}:${height},fps=${fps}[vout]`;

  const filter = [...vParts, ...aParts, vConcat, scale, aConcat].join(";");
  return { filter, hasAudio: true };
}

/**
 * Cut the KEEP segments out of the source video and concatenate them into one
 * trimmed, downscaled, fps-normalized H.264 clip staged under `public/autoedit/`.
 * Returns both the absolute path and the staticFile()-relative ref the scene needs.
 */
export async function trimAndStageBaseClip(
  plan: EditPlan,
  projectRoot: string,
  slug: string,
  log: (msg: string) => void,
): Promise<{ absPath: string; staticRef: string }> {
  const { width, height } = dimensionsForAspect(plan.aspect);

  const segments =
    plan.segments.length > 0
      ? plan.segments
      : // No-trim plan with no explicit segment: synthesize one full-span segment.
        [
          {
            id: "seg-0",
            source: {
              startSeconds: 0,
              endSeconds: plan.sourceDurationFrames / plan.fps,
              startFrame: 0,
              endFrame: plan.sourceDurationFrames,
            },
            editStartFrame: 0,
            editEndFrame: plan.sourceDurationFrames,
            mode: "speaker" as const,
          },
        ];

  const publicDir = path.join(projectRoot, "public", "autoedit");
  fs.mkdirSync(publicDir, { recursive: true });
  const absPath = path.join(publicDir, `${slug}.mp4`);
  const staticRef = path.posix.join("autoedit", `${slug}.mp4`);

  const { filter } = buildTrimConcatFilter(segments, width, height, plan.fps);

  log(
    `ffmpeg: trim ${segments.length} segment(s) → ${width}×${height}@${plan.fps}fps → ${absPath}`,
  );

  await execa("ffmpeg", [
    "-y",
    "-i",
    plan.sourceVideo,
    "-filter_complex",
    filter,
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    absPath,
  ]);

  return { absPath, staticRef };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene-prop builder — EditPlan → SpeakerOverlayScene props
// ─────────────────────────────────────────────────────────────────────────────

/** Map the plan's ADR-002 caption `register` to a FloatingCaption register. The
 *  scene's caption schema accepts only punchy|editorial|technical; 'none' captions
 *  never reach here (they produce empty wordTimings and we skip the caption). */
function mapRegister(
  register: EditPlan["captionTrack"]["register"],
): "punchy" | "editorial" | "technical" {
  return register === "none" ? "editorial" : register;
}

/** EditPlan caption position → FloatingCaption position (identical vocabulary). */
function mapPosition(
  position: EditPlan["captionTrack"]["position"],
): "bottom-center" | "center" | "top" | "custom" {
  return position;
}

/**
 * Build the `SpeakerOverlayScene{9x16,16x9}` input props from an EditPlan. The
 * caption is built from `captionTrack` (already edit-time-rebased word timings);
 * overlays are mapped straight from `overlayTrack` ({type, props, behindSpeaker});
 * `layoutTrack` is forwarded verbatim when present (the scene switches to layout
 * mode). The trimmed base clip is the `videoSrc` (staticFile ref).
 */
export function buildSceneProps(
  plan: EditPlan,
  stagedClipStaticRef: string,
  durationInFrames: number,
  captionStyle: CaptionStyle,
  handle: string | undefined,
): Record<string, unknown> {
  const ct = plan.captionTrack;
  const hasCaptions = ct.register !== "none" && ct.wordTimings.length > 0;

  const caption = {
    wordTimings: hasCaptions ? ct.wordTimings : [],
    style: captionStyle,
    position: mapPosition(ct.position),
    ...(ct.position === "custom" && ct.customXY ? { customXY: ct.customXY } : {}),
    mode: ct.mode,
    register: mapRegister(ct.register),
  };

  const overlays = plan.overlayTrack.map((o) => ({
    type: o.type,
    props: o.props,
    ...(o.behindSpeaker !== undefined ? { behindSpeaker: o.behindSpeaker } : {}),
  }));

  const props: Record<string, unknown> = {
    videoSrc: stagedClipStaticRef,
    caption,
    overlays,
    durationFrames: durationInFrames,
  };
  if (handle !== undefined) props.handle = handle;

  // Forward the layout track / scene-engine fields only when the plan carries
  // them (the scene switches into layout mode when layoutTrack is non-empty).
  if (plan.layoutTrack && plan.layoutTrack.length > 0) {
    props.layoutTrack = plan.layoutTrack;
    if (plan.baseLayout !== undefined) props.baseLayout = plan.baseLayout;
    if (plan.backdrop !== undefined) props.backdrop = plan.backdrop;
    if (plan.foregroundMatte !== undefined)
      props.foregroundMatte = plan.foregroundMatte;
    if (ct.behindSpeaker !== undefined)
      props.captionBehindSpeaker = ct.behindSpeaker;
  }

  return props;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — Remotion render
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bundle + render `SpeakerOverlayScene{aspect}` over the staged base clip, with the
 * plan's `editDurationFrames` overriding the composition's registered duration
 * (same idiom as src/pipeline/pipeline.ts). Writes the final MP4 and returns its path.
 */
export async function renderEditedVideo(
  opts: RenderFromPlanOptions,
): Promise<RenderFromPlanResult> {
  const { plan, projectRoot, slug } = opts;
  const log = opts.log ?? ((m: string) => console.log(`[render] ${m}`));
  const captionStyle = opts.captionStyle ?? "editorial-cyan";
  const started = Date.now();

  const { compositionId } = dimensionsForAspect(plan.aspect);
  const durationInFrames = Math.max(1, Math.round(plan.editDurationFrames));

  // ── Stage 1: trim + stage the base clip under public/ ──────────────────────
  const { absPath: stagedClipPath, staticRef: stagedClipStaticRef } =
    await trimAndStageBaseClip(plan, projectRoot, slug, log);
  log(`staged base clip → ${stagedClipPath} (staticFile: ${stagedClipStaticRef})`);

  // ── Stage 2: bundle + selectComposition + renderMedia ──────────────────────
  log("ensuring headless browser…");
  await ensureBrowser();

  log("bundling Remotion project…");
  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src/index.ts"),
  });

  const inputProps = buildSceneProps(
    plan,
    stagedClipStaticRef,
    durationInFrames,
    captionStyle,
    opts.handle,
  );

  log(`selecting composition ${compositionId}…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputDir = path.join(projectRoot, "output", "autoedit");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slug}-edit.mp4`);

  log(
    `rendering ${compositionId} · ${durationInFrames} frames @ ${plan.fps}fps · captions=${plan.captionTrack.wordTimings.length} · overlays=${plan.overlayTrack.length}`,
  );

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      fps: plan.fps,
    },
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      opts.onProgress?.(progress);
      if (progress !== undefined && Math.round(progress * 100) % 25 === 0) {
        log(`${Math.round(progress * 100)}%`);
      }
    },
  });

  const elapsedSeconds = (Date.now() - started) / 1000;
  log(`done → ${outputPath} (${elapsedSeconds.toFixed(1)}s)`);

  return {
    stagedClipPath,
    stagedClipStaticRef,
    outputPath,
    compositionId,
    durationInFrames,
    elapsedSeconds,
  };
}
