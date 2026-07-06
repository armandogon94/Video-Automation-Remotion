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
import { bundleOnce as bundle } from "./bundleOnce";
import {
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { execa } from "execa";
import fs from "fs";
import path from "path";

import type {
  EditPlan,
  EditPlanWord,
  EditSegment,
  SegmentGrade,
} from "./editPlan.js";
import { GRADE_FILTERS } from "./editPlan.js";
import { selfEvalRender } from "./selfEvalRender.js";

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
  /**
   * Run one capped `selfEvalRender` QA pass after the render (duration check +
   * cut contact sheet). Default true; pass false (`--no-self-eval`) to skip it.
   * One mandatory pass + a loud log — the 3-pass loop is the future orchestrator's
   * job (FABLE Task 2.11).
   */
  selfEval?: boolean;
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
/**
 * Absolute path to the HLG→SDR 3D LUT. The cube encodes the FULL tonemap as a
 * deterministic per-pixel RGB function (HLG arib-std-b67 inverse-OETF → OOTF system
 * gamma 1.2 → exposure gain 2.0 → bt2020→bt709 gamut matrix → bt709 OETF →
 * saturation 0.65), generated by `scripts/gen_hlg_lut.py`. See that script for the
 * exact math. Lives under `src/matting/luts/` so it ships with the repo.
 */
export function hlgLutPath(projectRoot: string): string {
  return path.join(projectRoot, "src", "matting", "luts", "hlg_to_sdr.cube");
}

/**
 * ffmpeg OUTPUT flags that TAG the staged clip as bt709 SDR (they relabel the
 * stream; they do NOT convert pixels). After `lut3d` the pixels are already bt709
 * SDR, but ffmpeg otherwise copies the source's HLG/bt2020 tags onto the output —
 * so a player/Remotion (OffthreadVideo → Chromium) would see HLG tags and re-tonemap
 * the already-converted frames, shifting skin red/oversaturated. Tagging bt709 makes
 * downstream decoders interpret the SDR pixels correctly. Safe for genuinely-SDR
 * sources too (the staged clip is always meant to be bt709 for the Remotion stage).
 */
const SDR_TAG_ARGS = [
  "-colorspace",
  "bt709",
  "-color_primaries",
  "bt709",
  "-color_trc",
  "bt709",
] as const;

/**
 * filtergraph tail that stamps bt709 SDR onto the OUTPUT FRAMES. The `-color_trc` /
 * `-color_primaries` OUTPUT options are ignored when a filtergraph is present (the
 * encoder reads frame-side color metadata, which the filters inherit from the HLG
 * source) — so without this the staged clip stays tagged `arib-std-b67`/`bt2020`
 * and Remotion re-tonemaps it (skin shifts red). `setparams` is the canonical way to
 * relabel frames after the LUT has already made the pixels bt709. Pixels unchanged.
 */
const SETPARAMS_BT709 =
  "setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709";

/**
 * Escape a filesystem path for use inside an ffmpeg filtergraph option value
 * wrapped in single quotes (`lut3d=file='...'`).
 *
 * Inside ffmpeg single quotes a backslash is LITERAL and a `'` TERMINATES the
 * quote — so the old `\\'` idiom was wrong (FABLE §4.16 / Task 2.10). The correct
 * ffmpeg idiom to embed an apostrophe is `'\''` (close-quote, escaped-quote,
 * reopen-quote): every `'` in the path becomes `'\''`, and the call sites keep
 * wrapping the whole value in the outer single quotes. Spaces and `/` pass through
 * untouched. Example: `a'b` → `a'\''b`, wrapped → `'a'\''b'`.
 */
function escapeFilterArg(p: string): string {
  return p.split("'").join("'\\''");
}

/**
 * The HDR→SDR color-fix prefix for a filter chain (trailing comma so it can be
 * prepended to a scale chain), or "" for an SDR source.
 *
 * iPhone .MOV is HLG/bt2020 10-bit; rendered as-is it looks oversaturated/wrong, and
 * a naive `colorspace` transfer-swap only fixes the gamut (leaving the HLG transfer
 * curve un-inverted → wrong tone + saturation). Instead we apply a baked 3D LUT
 * (`lut3d`, native to this ffmpeg — no zscale/libplacebo needed) that performs the
 * correct HLG→bt709 tonemap matched to the reference grade. Shared by the
 * single-source (`buildTrimConcatFilter`) and multi-source
 * (`buildMultiSourceConcatFilter`) paths so the SAME fix is applied everywhere.
 */
export function hdrColorFixFilter(isHdr: boolean, lutPath: string): string {
  return isHdr && lutPath
    ? `lut3d=file='${escapeFilterArg(lutPath)}',`
    : "";
}

/**
 * Uniform audio-normalization tail appended to every per-segment/per-beat audio
 * chain: force 48kHz stereo `fltp`. Without it, ffmpeg's `concat` silently
 * negotiates a mixed set of mono/stereo trims down to the LOWEST common layout —
 * one mono take drags the WHOLE reel to mono with no error (FABLE §4.6 / Task
 * 2.4). Also normalizes the sample format so `concat` accepts the inputs.
 */
const AUDIO_NORMALIZE = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo";

export function buildTrimConcatFilter(
  segments: EditSegment[],
  width: number,
  height: number,
  fps: number,
  isHdr = false,
  lutPath = "",
  hasAudio = true,
): { filter: string; hasAudio: boolean } {
  const vParts: string[] = [];
  const aParts: string[] = [];
  const vLabels: string[] = [];
  const aLabels: string[] = [];

  // HDR→SDR corrective LUT, applied PER SEGMENT before the creative grade (FABLE
  // §4.7 / Task 2.3). The grade presets (eq/hue) are display-referred SDR chains;
  // running them on HLG-encoded bt2020 pixels (the old post-concat ordering) gave
  // a source-dependent look. colorFix→grade grades in bt709 SDR space, matching
  // the multi-source path and video-use's own extract→concat→grade order.
  const colorFix = hdrColorFixFilter(isHdr, lutPath);

  segments.forEach((seg, i) => {
    const start = seg.source.startSeconds;
    const end = seg.source.endSeconds;
    // Video: trim by source seconds, reset PTS so concat sees a 0-based stream,
    // then colorFix (HLG→SDR LUT) BEFORE the optional per-segment creative grade
    // so the grade lands in SDR space. `colorFix` already carries a trailing comma
    // (or is ""); the grade chain is a bare filter, so join them with a comma only
    // when a grade is present. Grade omitted → no-op.
    const gradeChain = seg.grade ? GRADE_FILTERS[seg.grade] : "";
    const colorChain = [colorFix ? colorFix.replace(/,$/, "") : "", gradeChain]
      .filter((s) => s.length > 0)
      .join(",");
    const colorPrefix = colorChain ? `,${colorChain}` : "";
    vParts.push(
      `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS${colorPrefix}[v${i}]`,
    );
    vLabels.push(`[v${i}]`);
    if (hasAudio) {
      // Audio: same trim window, with a 30ms fade in/out at each segment boundary
      // (video-use rule #3) so concat joins don't pop, then normalize to 48kHz
      // stereo fltp so mixed mono/stereo takes don't downmix the reel. Fade
      // clamped to half the segment for very short keeps so in/out don't overlap.
      const aDur = end - start;
      const aFade = Math.min(0.03, aDur / 2);
      const aFadeOutSt = Math.max(0, aDur - aFade).toFixed(3);
      aParts.push(
        `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,` +
          `afade=t=in:st=0:d=${aFade},afade=t=out:st=${aFadeOutSt}:d=${aFade},` +
          `${AUDIO_NORMALIZE}[a${i}]`,
      );
      aLabels.push(`[a${i}]`);
    }
  });

  const n = segments.length;
  const vConcat = `${vLabels.join("")}concat=n=${n}:v=1:a=0[vcat]`;
  // Downscale + center-crop to fill the canvas, then normalize fps. colorFix now
  // lives per-segment (above), so the post-concat chain is scale-only.
  const scale =
    `[vcat]scale=${width}:${height}:force_original_aspect_ratio=increase,` +
    // setsar=1 is defensive here (single-source segments share one input's SAR,
    // so this path doesn't hit the mismatch) — it keeps the output SAR square and
    // matches the multi-source chain. See buildMultiSourceConcatFilter.
    `crop=${width}:${height},setsar=1,fps=${fps},format=yuv420p,${SETPARAMS_BT709}[vout]`;

  const parts = [...vParts, ...aParts, vConcat, scale];
  if (hasAudio) {
    parts.push(`${aLabels.join("")}concat=n=${n}:v=0:a=1[aout]`);
  }
  return { filter: parts.join(";"), hasAudio };
}

/**
 * Detect an HDR source (bt2020 primaries or HLG/PQ transfer) via ffprobe, so the
 * staging step can convert it to bt709 SDR. iPhone recordings are HLG
 * (`color_transfer=arib-std-b67`, `color_primaries=bt2020`). Returns false on any
 * probe error (SDR-safe default).
 */
async function detectHdr(sourcePath: string): Promise<boolean> {
  try {
    const { stdout } = await execa("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=color_transfer,color_primaries,color_space",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      sourcePath,
    ]);
    return /b67|arib|smpte2084|bt2020/i.test(stdout);
  } catch {
    return false;
  }
}

/**
 * True if `sourcePath` has at least one audio stream. Screen recordings and some
 * exports have none — mapping a hardcoded `[0:a]` at them makes ffmpeg fail with a
 * cryptic "Stream specifier ':a' matches no streams" (FABLE §4.8 / Task 2.5).
 * Returns false on any probe error (build a video-only graph, which is safe).
 */
async function hasAudioStream(sourcePath: string): Promise<boolean> {
  try {
    const { stdout } = await execa("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a",
      "-show_entries",
      "stream=index",
      "-of",
      "csv=p=0",
      sourcePath,
    ]);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
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

  const isHdr = await detectHdr(plan.sourceVideo);
  const sourceHasAudio = await hasAudioStream(plan.sourceVideo);
  const { filter, hasAudio } = buildTrimConcatFilter(
    segments,
    width,
    height,
    plan.fps,
    isHdr,
    hlgLutPath(projectRoot),
    sourceHasAudio,
  );

  log(
    `ffmpeg: trim ${segments.length} segment(s) → ${width}×${height}@${plan.fps}fps` +
      `${isHdr ? " (HDR bt2020/HLG → bt709 SDR)" : ""}` +
      `${hasAudio ? "" : " (no audio stream → -an)"} → ${absPath}`,
  );

  // Video mapping + codec are always present; audio mapping/codec only when the
  // source actually has an audio stream (else `-an` for a clean video-only clip).
  const audioArgs = hasAudio
    ? ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    : ["-an"];

  await execa("ffmpeg", [
    "-y",
    "-i",
    plan.sourceVideo,
    "-filter_complex",
    filter,
    "-map",
    "[vout]",
    ...audioArgs,
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    ...SDR_TAG_ARGS,
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

  // Forward the plan's EDIT-time window + anchor to the scene. fromFrame/toFrame
  // drive the scene's per-overlay <Sequence> (without them every overlay
  // self-animated from scene frame 0 — the "99 at t=0" bug); anchor rides in
  // props so molecules that accept it place themselves per the plan (an
  // explicit props.anchor from the suggester still wins via the spread).
  const overlays = plan.overlayTrack.map((o) => ({
    type: o.type,
    props: { anchor: o.anchor, ...o.props },
    fromFrame: o.fromFrame,
    toFrame: o.toFrame,
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

  // ── QA: one capped self-eval pass (duration check + cut contact sheet) ──────
  if (opts.selfEval !== false) {
    await runSelfEval(
      outputPath,
      { fps: plan.fps, editDurationFrames: durationInFrames, segments: plan.segments },
      log,
    );
  }

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

/**
 * Run one `selfEvalRender` pass over a finished mp4 and log the result loudly.
 * `selfEvalRender` only reads `fps`, `editDurationFrames`, and `segments`, so a
 * minimal EditPlan-shaped view suffices (the multi-source path synthesizes one
 * from the beats' cumulative frames). Never throws — QA is advisory, so a probe
 * failure is logged, not fatal (FABLE Task 2.11: one mandatory pass + loud log).
 */
async function runSelfEval(
  outputPath: string,
  planLike: Pick<EditPlan, "fps" | "editDurationFrames" | "segments">,
  log: (msg: string) => void,
): Promise<void> {
  try {
    const evalResult = await selfEvalRender(outputPath, planLike as EditPlan, {
      passNumber: 1,
    });
    log(
      evalResult.durationOk
        ? `self-eval OK (Δ ${evalResult.durationDeltaSeconds.toFixed(3)}s) — report: ${evalResult.reportPath}`
        : `self-eval DURATION MISMATCH (Δ ${evalResult.durationDeltaSeconds.toFixed(3)}s) — inspect ${evalResult.reportPath}`,
    );
  } catch (err) {
    log(`self-eval skipped (${err instanceof Error ? err.message : String(err)})`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MULTI-SOURCE assembly — stitch one beat from EACH of N source files
// ═════════════════════════════════════════════════════════════════════════════
//
// WHY A SEPARATE PATH
// -------------------
// `renderEditedVideo` above harvests N KEEP segments from ONE source file (a
// single `[0:v]`/`[0:a]` input). A reel built from "best takes" instead pulls
// ONE clean range from EACH of several DIFFERENT files. ffmpeg therefore needs N
// `-i` inputs (`[0]…[n-1]`), one trim per input, the per-source HDR color fix
// applied to ITS OWN input (each clip is probed independently), all scaled to the
// same canvas and concatenated. The combined transcript is assembled by re-basing
// each beat's words onto the cumulative assembled timeline (offset = sum of all
// prior beats' durations). The result is rendered through the same
// `SpeakerOverlayScene` foundation as the single-source path.

/** One beat of a multi-source reel: a clean range cut from its OWN source file. */
export interface ReelBeat {
  /** Absolute path to this beat's source video. */
  sourceFile: string;
  /** Start of the kept range in source-time seconds. */
  startSec: number;
  /** End of the kept range in source-time seconds (exclusive). */
  endSec: number;
  /** Optional label for logging/debug (e.g. "hook", "cta"). */
  label?: string;
  /**
   * Optional per-beat creative grade (same presets as EditSegment.grade). Applied
   * AFTER this beat's HLG→SDR colorFix, so it grades in SDR space (FABLE §4.7 /
   * Task 2.3 — closes the documented multi-source-grade gap). Omitted → no grade.
   */
  grade?: SegmentGrade;
}

/** A beat paired with its probed HDR flag (one ffprobe per source). */
interface ResolvedBeat extends ReelBeat {
  isHdr: boolean;
}

export interface RenderMultiSourceOptions {
  /** Ordered beats — each contributes one trimmed range from its own file. */
  beats: ReelBeat[];
  /**
   * SOURCE-time words per beat, ALIGNED 1:1 with `beats` by index. Each beat's
   * words are filtered to its [startSec, endSec) range and re-based onto the
   * assembled timeline before being merged into the caption track.
   */
  wordsPerBeat: EditPlanWord[][];
  /** Output aspect — only "9:16" ships a multi-source driver today. */
  aspect: EditPlan["aspect"];
  /** Frames per second of the assembled timeline. */
  fps: number;
  /** Project root (where `src/index.ts` and `public/` live). */
  projectRoot: string;
  /** Slug used for the staged clip + final output filenames. */
  slug: string;
  /** Caption style preset. Default 'editorial-cyan'. */
  captionStyle?: CaptionStyle;
  /** Caption position. Default 'bottom-center'. */
  captionPosition?: EditPlan["captionTrack"]["position"];
  /** Caption mode. Default 'karaoke'. */
  captionMode?: EditPlan["captionTrack"]["mode"];
  /** Brand handle chip; "" hides it. Defaults to the scene default. */
  handle?: string;
  /** Optional over-speaker overlays ({type, props, behindSpeaker?}) timed to
   *  EDIT-time frames (the assembled timeline). Passed straight to the scene.
   *  `fromFrame`/`toFrame` mount the overlay inside a scene <Sequence> so its
   *  enter animation starts at its beat (omit both for always-on demo overlays). */
  overlays?: {
    type: string;
    props: Record<string, unknown>;
    behindSpeaker?: boolean;
    fromFrame?: number;
    toFrame?: number;
  }[];
  /** Progress callback (0..1) for the Remotion render. */
  onProgress?: (progress: number) => void;
  /** Logger; defaults to console.log with a [reel] tag. */
  log?: (msg: string) => void;
  /** Run one capped self-eval QA pass after render. Default true. */
  selfEval?: boolean;
}

export interface RenderMultiSourceResult extends RenderFromPlanResult {
  /** Number of beats stitched into the assembled clip. */
  beatCount: number;
  /** Edit-timeline duration in seconds. */
  durationSeconds: number;
}

/**
 * Build the `filter_complex` for a MULTI-INPUT assembly: trim one range from each
 * of `beats.length` ffmpeg inputs (`[i:v]`/`[i:a]`), apply that input's own HDR
 * color fix, scale+crop to the canvas, normalize fps, then concat all video and
 * all audio streams. Mirrors `buildTrimConcatFilter` but with one input per beat
 * instead of one input with many trims. Returns the filtergraph with `[vout]`/`[aout]`.
 */
export function buildMultiSourceConcatFilter(
  beats: ResolvedBeat[],
  width: number,
  height: number,
  fps: number,
  lutPath = "",
): { filter: string } {
  const parts: string[] = [];
  const vLabels: string[] = [];
  const aLabels: string[] = [];

  beats.forEach((b, i) => {
    const colorFix = hdrColorFixFilter(b.isHdr, lutPath);
    // Video: trim this input's range, reset PTS, per-source HDR color fix, then the
    // optional per-beat creative grade (grades in SDR space — FABLE §4.7), then
    // scale+crop to fill the canvas and normalize fps (same chain as single-source).
    const gradeF = b.grade ? `${GRADE_FILTERS[b.grade]},` : "";
    parts.push(
      `[${i}:v]trim=start=${b.startSec}:end=${b.endSec},setpts=PTS-STARTPTS,` +
        `${colorFix}${gradeF}scale=${width}:${height}:force_original_aspect_ratio=increase,` +
        // setsar=1 normalizes the sample aspect ratio across differently-shaped
        // sources — without it, concat rejects a portrait+landscape reel with a
        // SAR-mismatch error (FABLE follow-up: pre-existing multi-aspect crash).
        `crop=${width}:${height},setsar=1,fps=${fps},format=yuv420p,${SETPARAMS_BT709}[v${i}]`,
    );
    vLabels.push(`[v${i}]`);
    // Audio: same trim window; 30ms fade in/out at each beat boundary (video-use
    // rule #3, 2026-06-26) so multi-source joins don't pop; normalize to 48kHz
    // stereo fltp so mixed mono/stereo beats don't silently downmix the reel to
    // mono (FABLE §4.6 / Task 2.4). Fade clamped to half-beat for very short beats.
    const aDur = b.endSec - b.startSec;
    const aFade = Math.min(0.03, aDur / 2);
    const aFadeOutSt = Math.max(0, aDur - aFade).toFixed(3);
    parts.push(
      `[${i}:a]atrim=start=${b.startSec}:end=${b.endSec},asetpts=PTS-STARTPTS,` +
        `afade=t=in:st=0:d=${aFade},afade=t=out:st=${aFadeOutSt}:d=${aFade},` +
        `${AUDIO_NORMALIZE}[a${i}]`,
    );
    aLabels.push(`[a${i}]`);
  });

  const n = beats.length;
  const vConcat = `${vLabels.join("")}concat=n=${n}:v=1:a=0[vout]`;
  const aConcat = `${aLabels.join("")}concat=n=${n}:v=0:a=1[aout]`;

  return { filter: [...parts, vConcat, aConcat].join(";") };
}

/**
 * Probe each beat's source for HDR, build the multi-input filtergraph, and run
 * ffmpeg with one `-i` per beat → a single trimmed, downscaled, fps-normalized
 * H.264 clip staged under `public/autoedit/`. Returns absolute + staticFile paths.
 */
async function stageMultiSourceClip(
  beats: ReelBeat[],
  aspect: EditPlan["aspect"],
  fps: number,
  projectRoot: string,
  slug: string,
  log: (msg: string) => void,
): Promise<{ absPath: string; staticRef: string; resolved: ResolvedBeat[] }> {
  const { width, height } = dimensionsForAspect(aspect);

  // Probe HDR per source (each clip independently — sources may differ).
  const resolved: ResolvedBeat[] = [];
  for (const b of beats) {
    resolved.push({ ...b, isHdr: await detectHdr(b.sourceFile) });
  }

  const publicDir = path.join(projectRoot, "public", "autoedit");
  fs.mkdirSync(publicDir, { recursive: true });
  const absPath = path.join(publicDir, `${slug}.mp4`);
  const staticRef = path.posix.join("autoedit", `${slug}.mp4`);

  const { filter } = buildMultiSourceConcatFilter(
    resolved,
    width,
    height,
    fps,
    hlgLutPath(projectRoot),
  );

  const hdrCount = resolved.filter((b) => b.isHdr).length;
  log(
    `ffmpeg: assemble ${beats.length} beat(s) from ${beats.length} source(s) → ` +
      `${width}×${height}@${fps}fps (${hdrCount}/${beats.length} HDR→SDR) → ${absPath}`,
  );

  // One -i per beat, in order.
  const inputArgs = resolved.flatMap((b) => ["-i", b.sourceFile]);

  await execa("ffmpeg", [
    "-y",
    ...inputArgs,
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
    ...SDR_TAG_ARGS,
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    absPath,
  ]);

  return { absPath, staticRef, resolved };
}

/**
 * Re-base each beat's SOURCE-time words onto the ASSEMBLED edit timeline and merge
 * them into one ordered word list. For beat `i`, keep words whose START falls in
 * `[startSec, endSec)`, then shift so the beat's `startSec` maps to the cumulative
 * offset (sum of all prior beats' durations). Mirrors `shiftWordsToEditTimeline`'s
 * math but across multiple sources with a running offset.
 */
export function buildCombinedTranscript(
  beats: ReelBeat[],
  wordsPerBeat: EditPlanWord[][],
  fps: number,
): { words: EditPlanWord[]; totalFrames: number } {
  const out: EditPlanWord[] = [];
  let offsetSeconds = 0;

  beats.forEach((b, i) => {
    const beatLenSeconds = b.endSec - b.startSec;
    const beatEndOnTimeline = offsetSeconds + beatLenSeconds;
    const words = wordsPerBeat[i] ?? [];
    for (const w of words) {
      if (w.startSeconds < b.startSec || w.startSeconds >= b.endSec) continue;
      const newStartSeconds = w.startSeconds - b.startSec + offsetSeconds;
      // Clamp the word END at this beat's rebased end (FABLE §4.14 / Task 2.9): a
      // word straddling a beat boundary otherwise keeps its full source duration
      // and its caption bleeds into the next beat's first word.
      const newEndSeconds = Math.min(
        beatEndOnTimeline,
        w.endSeconds - b.startSec + offsetSeconds,
      );
      out.push({
        text: w.text,
        startSeconds: newStartSeconds,
        endSeconds: Math.max(newStartSeconds, newEndSeconds),
        startFrame: Math.round(newStartSeconds * fps),
        endFrame: Math.round(Math.max(newStartSeconds, newEndSeconds) * fps),
      });
    }
    offsetSeconds += beatLenSeconds;
  });

  return { words: out, totalFrames: Math.round(offsetSeconds * fps) };
}

/**
 * Assemble N best-take beats (each from its OWN file) into one staged clip and
 * render `SpeakerOverlayScene{aspect}` over it with a combined karaoke caption
 * track. The single-source `renderEditedVideo` analog for multi-source reels.
 */
export async function renderMultiSourcePlan(
  opts: RenderMultiSourceOptions,
): Promise<RenderMultiSourceResult> {
  const { beats, wordsPerBeat, aspect, fps, projectRoot, slug } = opts;
  const log = opts.log ?? ((m: string) => console.log(`[reel] ${m}`));
  const captionStyle = opts.captionStyle ?? "editorial-cyan";
  const started = Date.now();

  if (beats.length === 0) throw new Error("renderMultiSourcePlan: no beats provided.");

  const { width, height, compositionId } = dimensionsForAspect(aspect);

  // ── Stage 1: trim + assemble the multi-source base clip ─────────────────────
  const { absPath: stagedClipPath, staticRef: stagedClipStaticRef } =
    await stageMultiSourceClip(beats, aspect, fps, projectRoot, slug, log);
  log(`staged assembled clip → ${stagedClipPath} (staticFile: ${stagedClipStaticRef})`);

  // ── Combined transcript (re-based onto the assembled timeline) ──────────────
  const { words: combinedWords, totalFrames } = buildCombinedTranscript(
    beats,
    wordsPerBeat,
    fps,
  );
  const durationInFrames = Math.max(1, totalFrames);
  log(
    `combined transcript: ${combinedWords.length} words across ${beats.length} beats · ` +
      `${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)}s)`,
  );

  // ── Build scene props directly (clean captions only — no overlays for v1) ───
  const caption = {
    wordTimings: combinedWords,
    style: captionStyle,
    position: opts.captionPosition ?? "bottom-center",
    mode: opts.captionMode ?? "karaoke",
    register: "editorial" as const,
  };
  const inputProps: Record<string, unknown> = {
    videoSrc: stagedClipStaticRef,
    caption,
    overlays: opts.overlays ?? [],
    durationFrames: durationInFrames,
  };
  if (opts.handle !== undefined) inputProps.handle = opts.handle;

  // ── Stage 2: bundle + selectComposition + renderMedia ───────────────────────
  log("ensuring headless browser…");
  await ensureBrowser();

  log("bundling Remotion project…");
  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, "src/index.ts"),
  });

  log(`selecting composition ${compositionId} (${width}×${height})…`);
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const outputDir = path.join(projectRoot, "output", "autoedit");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slug}.mp4`);

  log(`rendering ${compositionId} · ${durationInFrames} frames @ ${fps}fps · captions=${combinedWords.length}`);

  await renderMedia({
    composition: { ...composition, durationInFrames, fps },
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

  // ── QA: one capped self-eval pass. Synthesize a BoundarySpec from the beats'
  //     cumulative edit frames so the cut contact sheet lands at each beat join. ──
  if (opts.selfEval !== false) {
    const boundarySegments: EditSegment[] = [];
    let cursorSeconds = 0;
    beats.forEach((b, i) => {
      const lenSeconds = b.endSec - b.startSec;
      const editStartFrame = Math.round(cursorSeconds * fps);
      const editEndFrame = Math.round((cursorSeconds + lenSeconds) * fps);
      boundarySegments.push({
        id: `beat-${i}`,
        source: {
          startSeconds: b.startSec,
          endSeconds: b.endSec,
          startFrame: Math.round(b.startSec * fps),
          endFrame: Math.round(b.endSec * fps),
        },
        editStartFrame,
        editEndFrame,
        mode: "speaker",
      });
      cursorSeconds += lenSeconds;
    });
    await runSelfEval(
      outputPath,
      { fps, editDurationFrames: durationInFrames, segments: boundarySegments },
      log,
    );
  }

  const elapsedSeconds = (Date.now() - started) / 1000;
  log(`done → ${outputPath} (${elapsedSeconds.toFixed(1)}s)`);

  return {
    stagedClipPath,
    stagedClipStaticRef,
    outputPath,
    compositionId,
    durationInFrames,
    durationSeconds: durationInFrames / fps,
    beatCount: beats.length,
    elapsedSeconds,
  };
}
