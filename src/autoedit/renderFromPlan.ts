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

/**
 * The per-segment/per-beat FRAME QUANTIZATION tail (Sol 2026-07-16 §2.3): force
 * a video chain to EXACTLY `nFrames` frames at `fps` before concat. A seconds
 * `trim` keeps every source frame whose PTS falls in the range (a 1.03 s trim of
 * a 30 fps source physically contains 31 frames = 1.0333 s of media), so
 * seconds-trimmed chains accumulate tick surplus across joins — Sol's 25 ×
 * 1.03 s reproduction showed interior beats starting 1–2 frames late while a
 * global tail cap concealed the drift by truncating the LAST beat. Quantizing
 * each chain to its canonical frame count makes every interior join land
 * exactly on its `BeatTiming`/`EditSegment` boundary:
 *   - `fps` resamples the chain to the output frame grid;
 *   - `tpad=stop_mode=clone:stop=-1` clones the last frame indefinitely so a
 *     short chain (rare rounding/source-end deficit) can still reach the target;
 *   - `trim=end_frame=nFrames` cuts the chain to the exact canonical count.
 */
function frameQuantizeTail(fps: number, nFrames: number): string {
  return `fps=${fps},tpad=stop_mode=clone:stop=-1,trim=end_frame=${nFrames}`;
}

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

  let totalFrames = 0;

  segments.forEach((seg, i) => {
    const start = seg.source.startSeconds;
    const end = seg.source.endSeconds;
    // Canonical frame count for this segment (its edit-timeline length). The
    // staged chain is forced to EXACTLY this many frames (Sol §2.3) so every
    // interior concat join lands on the plan's editStartFrame — captions, QA
    // cut boundaries, and the render duration all derive from the same numbers.
    const nFrames = seg.editEndFrame - seg.editStartFrame;
    if (!Number.isFinite(nFrames) || nFrames <= 0) {
      throw new Error(
        `buildTrimConcatFilter: segment "${seg.id}" [${start}s→${end}s] has a ` +
          `non-positive edit length (${nFrames} frames from editStartFrame=` +
          `${seg.editStartFrame}, editEndFrame=${seg.editEndFrame}) — a ` +
          `zero-frame segment would silently vanish from the staged clip. Fix ` +
          `the segment's edit frames or remove it from the plan.`,
      );
    }
    totalFrames += nFrames;
    // The canonical output length of this segment in seconds — the AUDIO chain
    // is cut to the same length so A/V joins stay sample-aligned (Sol §2.3/§2.4).
    const lenOut = nFrames / fps;
    // Video: trim by source seconds, reset PTS so concat sees a 0-based stream,
    // then colorFix (HLG→SDR LUT) BEFORE the optional per-segment creative grade
    // so the grade lands in SDR space. `colorFix` already carries a trailing comma
    // (or is ""); the grade chain is a bare filter, so join them with a comma only
    // when a grade is present. Grade omitted → no-op. The chain ends with the
    // frame-quantization tail (exact canonical frame count — Sol §2.3).
    const gradeChain = seg.grade ? GRADE_FILTERS[seg.grade] : "";
    const colorChain = [colorFix ? colorFix.replace(/,$/, "") : "", gradeChain]
      .filter((s) => s.length > 0)
      .join(",");
    const colorPrefix = colorChain ? `,${colorChain}` : "";
    vParts.push(
      `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS${colorPrefix},` +
        `${frameQuantizeTail(fps, nFrames)}[v${i}]`,
    );
    vLabels.push(`[v${i}]`);
    if (hasAudio) {
      // Audio: trim the CANONICAL length (nFrames/fps, not the raw source
      // seconds) so audio joins land exactly where the quantized video joins
      // do, with a 30ms fade in/out at each segment boundary (video-use rule
      // #3) so concat joins don't pop, then normalize to 48kHz stereo fltp so
      // mixed mono/stereo takes don't downmix the reel. Fade clamped to half
      // the segment for very short keeps so in/out don't overlap. `apad` +
      // `atrim` pin the chain to exactly lenOut even on a source-end deficit.
      const aFade = Math.min(0.03, lenOut / 2);
      const aFadeOutSt = Math.max(0, lenOut - aFade).toFixed(3);
      aParts.push(
        `[0:a]atrim=start=${start}:end=${start + lenOut},asetpts=PTS-STARTPTS,` +
          `afade=t=in:st=0:d=${aFade},afade=t=out:st=${aFadeOutSt}:d=${aFade},` +
          `${AUDIO_NORMALIZE},apad=whole_dur=${lenOut.toFixed(6)},atrim=end=${lenOut.toFixed(6)}[a${i}]`,
      );
      aLabels.push(`[a${i}]`);
    }
  });

  const n = segments.length;
  const vConcat = `${vLabels.join("")}concat=n=${n}:v=1:a=0[vcat]`;
  // Downscale + center-crop to fill the canvas. colorFix lives per-segment
  // (above) and fps quantization lives per-segment too (Sol §2.3), so the
  // post-concat chain is scale-only plus a SECONDARY-INVARIANT total cap: with
  // exact per-segment frame counts the concat already totals `totalFrames`, so
  // the cap is a no-op guard, never a concealer of interior drift.
  const scale =
    `[vcat]scale=${width}:${height}:force_original_aspect_ratio=increase,` +
    // setsar=1 is defensive here (single-source segments share one input's SAR,
    // so this path doesn't hit the mismatch) — it keeps the output SAR square and
    // matches the multi-source chain. See buildMultiSourceConcatFilter.
    `crop=${width}:${height},setsar=1,format=yuv420p,${SETPARAMS_BT709},` +
    `trim=end_frame=${totalFrames}[vout]`;

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
 * Strip scheduling keys from a loose molecule prop bag (GPT-5.6 Finding 2.5.2;
 * Sol 2026-07-16 §2.5). `fromFrame`/`toFrame` are authoritative at the
 * overlay's TOP level (schema-validated, and they drive the scene's
 * per-overlay <Sequence>); a loose `enterFrame` inside `props` would
 * double-offset a molecule the Sequence has already rebased to local frame 0;
 * a loose `exitFrame` would compete with the derived window-length exit (the
 * dual-authority defect Sol overturned). Content props pass through untouched.
 */
function sanitizeOverlayProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const clean = { ...props };
  delete clean.fromFrame;
  delete clean.toFrame;
  delete clean.enterFrame;
  delete clean.exitFrame;
  return clean;
}

/** Loose overlay input accepted by the ONE scheduling adapter below — covers
 *  both the plan's `overlayTrack` entries and the multi-source driver overlays
 *  (which may omit `id`/`anchor` and, for always-on demos, the window). */
export interface SceneOverlayInput {
  id?: string;
  type: string;
  props: Record<string, unknown>;
  anchor?: string;
  behindSpeaker?: boolean;
  fromFrame?: number;
  toFrame?: number;
}

/** Scene-ready overlay produced by `sanitizeSceneOverlays`. */
export interface SceneOverlayOutput {
  type: string;
  props: Record<string, unknown>;
  behindSpeaker?: boolean;
  fromFrame?: number;
  toFrame?: number;
}

/**
 * THE single overlay-scheduling authority (Sol 2026-07-16 §2.5). Every render
 * path — single-source (`buildSceneProps`) AND multi-source
 * (`renderMultiSourcePlan`) — must pass overlays through here; the multi-source
 * renderer previously forwarded raw props straight to the scene, bypassing all
 * sanitizing (Sol §2.5 OVERTURNED).
 *
 * Rules:
 *  - WINDOWED overlay (both `fromFrame` and `toFrame` present): the top-level
 *    window is the SOLE scheduling authority. Invalid windows (non-finite,
 *    negative, `toFrame <= fromFrame`) drop the overlay loudly (Finding 2.5.3
 *    — the scenes would otherwise clamp to a 1-frame flash). Scheduling keys
 *    inside `props` (fromFrame/toFrame/enterFrame/exitFrame) are stripped, and
 *    the LOCAL `exitFrame` = window length is injected UNCONDITIONALLY so the
 *    molecule's outro completes exactly at the <Sequence> unmount. A
 *    caller-supplied `props.exitFrame` is dropped with a warning — Sol showed
 *    it let a child disappear early or outlive its window.
 *  - WINDOWLESS overlay (neither present): an always-on demo overlay, mounted
 *    without a <Sequence>; molecule-local scheduling props are the only clock
 *    it has, so its props pass through untouched.
 *  - PARTIAL window (exactly one of the two): planner bug — dropped loudly.
 */
export function sanitizeSceneOverlays(
  overlays: SceneOverlayInput[],
): SceneOverlayOutput[] {
  return overlays.flatMap((o) => {
    const oid = o.id ?? "(no id)";
    const windowless = o.fromFrame === undefined && o.toFrame === undefined;
    if (windowless) {
      return [
        {
          type: o.type,
          props: { ...o.props, ...(o.anchor !== undefined ? { anchor: o.anchor } : {}) },
          ...(o.behindSpeaker !== undefined ? { behindSpeaker: o.behindSpeaker } : {}),
        },
      ];
    }
    if (
      o.fromFrame === undefined ||
      o.toFrame === undefined ||
      !Number.isFinite(o.fromFrame) ||
      !Number.isFinite(o.toFrame) ||
      o.fromFrame < 0 ||
      o.toFrame <= o.fromFrame
    ) {
      console.warn(
        `[sanitizeSceneOverlays] dropping overlay id=${oid} type=${o.type}: ` +
          `invalid window fromFrame=${o.fromFrame} toFrame=${o.toFrame} ` +
          `(need finite, non-negative frames with toFrame > fromFrame)`,
      );
      return [];
    }
    if (o.props.exitFrame !== undefined) {
      console.warn(
        `[sanitizeSceneOverlays] overlay id=${oid} type=${o.type}: dropping ` +
          `props.exitFrame=${String(o.props.exitFrame)} — the top-level window ` +
          `[${o.fromFrame},${o.toFrame}) is the sole scheduling authority ` +
          `(derived local exitFrame=${o.toFrame - o.fromFrame})`,
      );
    }
    const cleanProps = sanitizeOverlayProps(o.props);
    return [
      {
        type: o.type,
        props: {
          ...cleanProps,
          // Lifecycle contract (GPT-5.6 §1.3 / Finding 2.5.1; Sol §2.5): the
          // scene's <Sequence> hard-clips at toFrame, but a molecule's INTERNAL
          // enter+hold+exit clock knows nothing about that window. The window
          // length is injected as the LOCAL exitFrame (the Sequence rebases the
          // molecule to frame 0) so molecules complete their outro exactly at
          // unmount; molecules without the prop ignore it (Zod strips unknowns).
          exitFrame: o.toFrame - o.fromFrame,
          ...(o.anchor !== undefined ? { anchor: o.anchor } : {}),
        },
        fromFrame: o.fromFrame,
        toFrame: o.toFrame,
        ...(o.behindSpeaker !== undefined ? { behindSpeaker: o.behindSpeaker } : {}),
      },
    ];
  });
}

/**
 * Build the `SpeakerOverlayScene{9x16,16x9}` input props from an EditPlan. The
 * caption is built from `captionTrack` (already edit-time-rebased word timings);
 * overlays are mapped straight from `overlayTrack` ({type, props, behindSpeaker});
 * `layoutTrack` is forwarded verbatim when present (the scene switches to layout
 * mode). The trimmed base clip is the `videoSrc` (staticFile ref) — and, in
 * layout mode, ALSO the `camSrc` (GPT-5.6 Finding 2.1; see the layout block).
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

  // Forward the plan's EDIT-time window + anchor to the scene through the ONE
  // scheduling adapter (Sol 2026-07-16 §2.5): fromFrame/toFrame drive the
  // scene's per-overlay <Sequence> (without them every overlay self-animated
  // from scene frame 0 — the "99 at t=0" bug); the schema-validated top-level
  // anchor WINS over any loose props.anchor; scheduling keys inside props are
  // stripped and the derived local exitFrame is injected unconditionally.
  const overlays = sanitizeSceneOverlays(plan.overlayTrack);

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
    // GPT-5.6 Finding 2.1 (CRITICAL): both scenes switch to layout mode purely
    // because layoutTrack is non-empty, and layout mode reads `camSrc` while
    // IGNORING `videoSrc`. Without camSrc the staged recording was replaced by
    // LayoutTrack's blue placeholder "CAM" well, and — because the legacy
    // OffthreadVideo never mounts in layout mode — the voice track vanished
    // with it. Map the staged single-source clip to the layout camera layer;
    // `videoSrc` stays set above for legacy (no-layout) mode.
    props.camSrc = stagedClipStaticRef;
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
// each beat's words onto the cumulative assembled timeline, with offsets taken
// from the canonical `computeBeatTimings` boundaries (GPT-5.6 Finding 2.2). The
// result is rendered through the same `SpeakerOverlayScene` foundation as the
// single-source path.

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

/** A beat paired with its probed source flags (one ffprobe pair per source). */
export interface ResolvedBeat extends ReelBeat {
  isHdr: boolean;
  /**
   * Whether this beat's source file has an audio stream (probed via
   * `hasAudioStream`, GPT-5.6 Finding 2.3). Optional for backward
   * compatibility with hand-built beats: omitted → treated as `true`.
   */
  hasAudio?: boolean;
}

/**
 * The ONE canonical placement of a beat on the assembled edit timeline
 * (GPT-5.6 Finding 2.2). Staged-video frame count, transcript offsets, QA cut
 * boundaries, and the Remotion render duration must ALL derive from this — the
 * old code let ffmpeg quantize each beat independently (`fps` per input) while
 * the transcript/QA/duration summed exact seconds, so the four timelines
 * drifted (25 × 1.03 s @ 30 fps: staged video 775 frames vs plan 773).
 */
export interface BeatTiming {
  /** Index into the `beats` array. */
  index: number;
  /** Source-time start of the kept range (copied from the beat). */
  startSec: number;
  /** Source-time end of the kept range (copied from the beat). */
  endSec: number;
  /** Beat length in seconds (endSec - startSec). */
  lenSeconds: number;
  /** First edit-timeline frame of this beat (inclusive). */
  editStartFrame: number;
  /** End edit-timeline frame of this beat (exclusive). */
  editEndFrame: number;
}

/**
 * Compute the canonical `BeatTiming[]` for a reel: CUMULATIVE seconds quantized
 * per boundary — `editStartFrame_i = round(fps·Σ_{j<i} len_j)` and
 * `editEndFrame_i = round(fps·Σ_{j<=i} len_j)` — the same scheme
 * `silenceTrim.toEditSegments` uses for the single-source path, so per-beat
 * rounding error never accumulates (each boundary is within half a frame of its
 * ideal position) and consecutive beats are exactly contiguous.
 *
 * Throws (rather than emitting a vanishing take) when a beat is non-positive or
 * quantizes to ZERO frames — GPT-5.6's 10 ms-beat stress case must be an
 * explicit, actionable error, not a beat that silently disappears from the reel.
 */
export function computeBeatTimings(beats: ReelBeat[], fps: number): BeatTiming[] {
  const timings: BeatTiming[] = [];
  let cumSeconds = 0;
  let prevEndFrame = 0;

  beats.forEach((b, i) => {
    const lenSeconds = b.endSec - b.startSec;
    const beatDesc =
      `beat ${i}${b.label ? ` ("${b.label}")` : ""} ` +
      `[${b.sourceFile} ${b.startSec}s→${b.endSec}s]`;
    if (!(lenSeconds > 0)) {
      throw new Error(
        `computeBeatTimings: ${beatDesc} has non-positive length ` +
          `(${lenSeconds}s) — every beat must keep a positive source range; ` +
          `fix its startSec/endSec or remove it from the reel.`,
      );
    }
    const editStartFrame = prevEndFrame; // = round(fps · Σ_{j<i} len_j)
    cumSeconds += lenSeconds;
    const editEndFrame = Math.round(cumSeconds * fps);
    if (editEndFrame === editStartFrame) {
      throw new Error(
        `computeBeatTimings: ${beatDesc} (${lenSeconds}s @ ${fps}fps) ` +
          `quantizes to 0 frames (editStartFrame === editEndFrame === ` +
          `${editStartFrame}) — a sub-frame take would silently vanish from ` +
          `the staged video. Lengthen the beat to at least one frame ` +
          `(≥ ${(1 / fps).toFixed(4)}s) or remove it from the reel.`,
      );
    }
    timings.push({
      index: i,
      startSec: b.startSec,
      endSec: b.endSec,
      lenSeconds,
      editStartFrame,
      editEndFrame,
    });
    prevEndFrame = editEndFrame;
  });

  return timings;
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
   *  EDIT-time frames (the assembled timeline). Routed through
   *  `sanitizeSceneOverlays` — the SAME scheduling authority as the
   *  single-source path (Sol 2026-07-16 §2.5). `fromFrame`/`toFrame` mount the
   *  overlay inside a scene <Sequence> so its enter animation starts at its
   *  beat (omit both for always-on demo overlays). */
  overlays?: SceneOverlayInput[];
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
  /**
   * The ONE canonical beat placement used for the staged video, transcript
   * offsets, QA cut boundaries, and the render duration (GPT-5.6 Finding 2.2).
   * Callers/QA must read boundaries from here, never re-derive them.
   */
  beatTimings: BeatTiming[];
}

/**
 * Build the `filter_complex` for a MULTI-INPUT assembly: trim one range from each
 * of `beats.length` ffmpeg inputs (`[i:v]`/`[i:a]`), apply that input's own HDR
 * color fix, scale+crop to the canvas, quantize EACH beat to its canonical
 * `BeatTiming` frame count (Sol 2026-07-16 §2.3 — see `frameQuantizeTail`),
 * then concat all video and all audio streams. Mirrors `buildTrimConcatFilter`
 * but with one input per beat instead of one input with many trims.
 *
 * Audio-less beats (GPT-5.6 Finding 2.3): a beat whose source has no audio
 * stream (`hasAudio: false`) gets 48 kHz stereo silence synthesized for exactly
 * its length via an extra `anullsrc` lavfi input, wired into the audio concat in
 * place of its (non-existent) `[i:a]`. When NO beat has audio, the graph is
 * video-only (no `[aout]`; caller must use `-an`).
 *
 * Returns the filtergraph (`[vout]` and, when `hasAudio`, `[aout]`), plus
 * `lavfiInputs` — the anullsrc specs the caller MUST append as
 * `-f lavfi -i <spec>` AFTER all real source inputs, in order (the filter's
 * input indices assume exactly that ordering).
 */
export function buildMultiSourceConcatFilter(
  beats: ResolvedBeat[],
  width: number,
  height: number,
  fps: number,
  lutPath = "",
): { filter: string; lavfiInputs: string[]; hasAudio: boolean } {
  if (beats.length === 0) {
    throw new Error(
      "buildMultiSourceConcatFilter: no beats provided — cannot build an empty concat graph.",
    );
  }
  const parts: string[] = [];
  const vLabels: string[] = [];
  const aLabels: string[] = [];
  const lavfiInputs: string[] = [];

  // The ONE canonical placement of every beat (GPT-5.6 Finding 2.2). Each beat's
  // video chain is forced to EXACTLY its canonical frame count below (Sol
  // 2026-07-16 §2.3), so every interior join lands on its editStartFrame.
  const timings = computeBeatTimings(beats, fps);

  // Any beat with audio → the reel carries an audio track and silent beats get
  // synthesized silence (mixed reel). NO beat with audio → video-only graph.
  const hasAudio = beats.some((b) => b.hasAudio !== false);

  beats.forEach((b, i) => {
    const colorFix = hdrColorFixFilter(b.isHdr, lutPath);
    // Canonical frame count + output length for THIS beat. Sol §2.3 overturned
    // the previous global-tail-cap design: seconds-trims kept every source frame
    // in range (1.03 s of 30 fps media = 31 frames), the surplus accumulated
    // across joins (interior beats started 1–2 frames late), and the global
    // `trim=end_frame` only truncated the LAST beat — concealing the drift the
    // canonical BeatTiming[] was supposed to remove. Per-beat quantization
    // (`frameQuantizeTail`) makes each join exact by construction.
    const nFrames = timings[i].editEndFrame - timings[i].editStartFrame;
    const lenOut = nFrames / fps;
    // Video: trim this input's range, reset PTS, per-source HDR color fix, then the
    // optional per-beat creative grade (grades in SDR space — FABLE §4.7), then
    // scale+crop to fill the canvas, then quantize to the canonical frame count.
    const gradeF = b.grade ? `${GRADE_FILTERS[b.grade]},` : "";
    parts.push(
      `[${i}:v]trim=start=${b.startSec}:end=${b.endSec},setpts=PTS-STARTPTS,` +
        `${colorFix}${gradeF}scale=${width}:${height}:force_original_aspect_ratio=increase,` +
        // setsar=1 normalizes the sample aspect ratio across differently-shaped
        // sources — without it, concat rejects a portrait+landscape reel with a
        // SAR-mismatch error (FABLE follow-up: pre-existing multi-aspect crash).
        `crop=${width}:${height},setsar=1,format=yuv420p,${SETPARAMS_BT709},` +
        `${frameQuantizeTail(fps, nFrames)}[v${i}]`,
    );
    vLabels.push(`[v${i}]`);

    if (!hasAudio) return; // all-silent reel: no audio chains at all.

    if (b.hasAudio !== false) {
      // Audio: the CANONICAL length (nFrames/fps — same numbers as the quantized
      // video chain, Sol §2.3/§2.4); 30ms fade in/out at each beat boundary
      // (video-use rule #3, 2026-06-26) so multi-source joins don't pop;
      // normalize to 48kHz stereo fltp so mixed mono/stereo beats don't silently
      // downmix the reel to mono (FABLE §4.6 / Task 2.4). Fade clamped to
      // half-beat for very short beats. `apad` + `atrim` pin the chain to
      // exactly lenOut even when the source runs out early.
      const aFade = Math.min(0.03, lenOut / 2);
      const aFadeOutSt = Math.max(0, lenOut - aFade).toFixed(3);
      parts.push(
        `[${i}:a]atrim=start=${b.startSec}:end=${b.startSec + lenOut},asetpts=PTS-STARTPTS,` +
          `afade=t=in:st=0:d=${aFade},afade=t=out:st=${aFadeOutSt}:d=${aFade},` +
          `${AUDIO_NORMALIZE},apad=whole_dur=${lenOut.toFixed(6)},atrim=end=${lenOut.toFixed(6)}[a${i}]`,
      );
    } else {
      // GPT-5.6 Finding 2.3: this beat's source has NO audio stream — referencing
      // `[i:a]` would abort the whole assembly ("Stream specifier ':a' matches no
      // streams"). Synthesize 48 kHz stereo silence for exactly this beat's
      // CANONICAL length instead, from an extra anullsrc lavfi input.
      //
      // INPUT-INDEX BOOKKEEPING: the real source files occupy ffmpeg inputs
      // [0 .. beats.length-1] (one `-i` per beat, in beat order — video refs above
      // stay `[i:v]`). The lavfi silence inputs are appended AFTER all of them, so
      // the k-th silence (k = lavfiInputs.length when this beat is reached) is
      // ffmpeg input index `beats.length + k`. stageMultiSourceClip appends
      // `-f lavfi -i <spec>` in exactly this order.
      const lavfiIndex = beats.length + lavfiInputs.length;
      lavfiInputs.push("anullsrc=channel_layout=stereo:sample_rate=48000");
      parts.push(
        `[${lavfiIndex}:a]atrim=start=0:end=${lenOut.toFixed(6)},asetpts=PTS-STARTPTS,` +
          `${AUDIO_NORMALIZE}[a${i}]`,
      );
    }
    aLabels.push(`[a${i}]`);
  });

  const n = beats.length;
  const vConcat = `${vLabels.join("")}concat=n=${n}:v=1:a=0[vcat]`;
  // SECONDARY INVARIANT ONLY (Sol §2.3): each beat is already quantized to its
  // exact canonical frame count above, so the concat totals `totalFrames` by
  // construction and this cap is a no-op guard. It must never again be the
  // mechanism that makes the total "right" — that design concealed interior
  // join drift by truncating the last beat.
  const totalFrames = timings[beats.length - 1].editEndFrame;
  const vOut = `[vcat]trim=end_frame=${totalFrames}[vout]`;

  const chains = [...parts, vConcat, vOut];
  if (hasAudio) {
    chains.push(`${aLabels.join("")}concat=n=${n}:v=0:a=1[aout]`);
  }
  return { filter: chains.join(";"), lavfiInputs, hasAudio };
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

  // Probe HDR + audio per source (each clip independently — sources may differ;
  // a screen recording without audio must NOT crash the reel — GPT-5.6 §2.3).
  const resolved: ResolvedBeat[] = [];
  for (const b of beats) {
    resolved.push({
      ...b,
      isHdr: await detectHdr(b.sourceFile),
      hasAudio: await hasAudioStream(b.sourceFile),
    });
  }

  const publicDir = path.join(projectRoot, "public", "autoedit");
  fs.mkdirSync(publicDir, { recursive: true });
  const absPath = path.join(publicDir, `${slug}.mp4`);
  const staticRef = path.posix.join("autoedit", `${slug}.mp4`);

  const { filter, lavfiInputs, hasAudio } = buildMultiSourceConcatFilter(
    resolved,
    width,
    height,
    fps,
    hlgLutPath(projectRoot),
  );

  const hdrCount = resolved.filter((b) => b.isHdr).length;
  const silentCount = resolved.filter((b) => b.hasAudio === false).length;
  log(
    `ffmpeg: assemble ${beats.length} beat(s) from ${beats.length} source(s) → ` +
      `${width}×${height}@${fps}fps (${hdrCount}/${beats.length} HDR→SDR` +
      `${silentCount > 0 && hasAudio ? `, ${silentCount}/${beats.length} silent → anullsrc` : ""}` +
      `${hasAudio ? "" : ", all beats silent → video-only (-an)"}) → ${absPath}`,
  );

  // One -i per beat, in order (ffmpeg inputs 0..n-1), THEN the anullsrc silence
  // inputs for audio-less beats (inputs n..n+k-1) — buildMultiSourceConcatFilter
  // computed its `[idx:a]` references assuming exactly this ordering.
  const inputArgs = resolved.flatMap((b) => ["-i", b.sourceFile]);
  const lavfiArgs = lavfiInputs.flatMap((spec) => ["-f", "lavfi", "-i", spec]);

  // Audio mapping/codec only when the reel has any audio (else a clean
  // video-only staged clip via -an), matching the single-source path.
  const audioArgs = hasAudio
    ? ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    : ["-an"];

  await execa("ffmpeg", [
    "-y",
    ...inputArgs,
    ...lavfiArgs,
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

  return { absPath, staticRef, resolved };
}

/**
 * Re-base each beat's SOURCE-time words onto the ASSEMBLED edit timeline and merge
 * them into one ordered word list. For beat `i`, keep words whose START falls in
 * `[startSec, endSec)`, then shift so the beat's `startSec` maps to that beat's
 * canonical `editStartFrame` (GPT-5.6 Finding 2.2: the offsets come from the ONE
 * `BeatTiming[]` the staged video/QA/render duration also use — the old code
 * summed exact seconds here while ffmpeg quantized per beat, so captions drifted
 * from the staged pixels). Word ends are clamped at the beat's `editEndFrame`
 * (FABLE §4.14 / Task 2.9: a straddling word must not bleed into the next beat).
 *
 * `timings` defaults to `computeBeatTimings(beats, fps)` for backward
 * compatibility; `renderMultiSourcePlan` passes its precomputed array so every
 * consumer shares identical numbers.
 */
export function buildCombinedTranscript(
  beats: ReelBeat[],
  wordsPerBeat: EditPlanWord[][],
  fps: number,
  timings: BeatTiming[] = computeBeatTimings(beats, fps),
): { words: EditPlanWord[]; totalFrames: number } {
  if (timings.length !== beats.length) {
    throw new Error(
      `buildCombinedTranscript: timings length (${timings.length}) does not ` +
        `match beats length (${beats.length}) — pass the BeatTiming[] computed ` +
        `by computeBeatTimings for these exact beats.`,
    );
  }
  const out: EditPlanWord[] = [];

  beats.forEach((b, i) => {
    const t = timings[i];
    // The beat's canonical placement, in seconds, on the assembled timeline.
    const offsetSeconds = t.editStartFrame / fps;
    const beatEndOnTimeline = t.editEndFrame / fps;
    const words = wordsPerBeat[i] ?? [];
    for (const w of words) {
      if (w.startSeconds < b.startSec || w.startSeconds >= b.endSec) continue;
      const newStartSeconds = w.startSeconds - b.startSec + offsetSeconds;
      const newEndSeconds = Math.min(
        beatEndOnTimeline,
        w.endSeconds - b.startSec + offsetSeconds,
      );
      const clampedEndSeconds = Math.max(newStartSeconds, newEndSeconds);
      const startFrame = Math.round(newStartSeconds * fps);
      const endFrame = Math.min(t.editEndFrame, Math.round(clampedEndSeconds * fps));
      out.push({
        text: w.text,
        startSeconds: newStartSeconds,
        endSeconds: clampedEndSeconds,
        startFrame,
        endFrame: Math.max(startFrame, endFrame),
      });
    }
  });

  return {
    words: out,
    totalFrames: timings.length > 0 ? timings[timings.length - 1].editEndFrame : 0,
  };
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

  // ── Canonical beat timings (GPT-5.6 Finding 2.2) ────────────────────────────
  // ONE cumulative quantization for everything downstream: the staged video's
  // frame count (via the single post-concat fps filter), the transcript offsets,
  // the QA cut boundaries, and the Remotion render duration. Throws early —
  // before any ffmpeg work — on zero-length or sub-frame beats.
  const beatTimings = computeBeatTimings(beats, fps);

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
    beatTimings,
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
    // Same scheduling authority as the single-source path (Sol 2026-07-16
    // §2.5: this path previously bypassed the sanitizer entirely, so raw
    // props.exitFrame / scheduling keys reached the scene unchecked).
    overlays: sanitizeSceneOverlays(opts.overlays ?? []),
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

  // ── QA: one capped self-eval pass. The cut boundaries come straight from the
  //     canonical BeatTiming[] (GPT-5.6 Finding 2.2) — no re-derived seconds
  //     math — so the contact sheet lands exactly on the staged beat joins. ──
  if (opts.selfEval !== false) {
    const boundarySegments: EditSegment[] = beatTimings.map((t) => ({
      id: `beat-${t.index}`,
      source: {
        startSeconds: t.startSec,
        endSeconds: t.endSec,
        startFrame: Math.round(t.startSec * fps),
        endFrame: Math.round(t.endSec * fps),
      },
      editStartFrame: t.editStartFrame,
      editEndFrame: t.editEndFrame,
      mode: "speaker" as const,
    }));
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
    beatTimings,
    elapsedSeconds,
  };
}
