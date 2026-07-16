/**
 * SpeakerOverlayScene16x9 — 1920×1080 talking-head OVERLAY FOUNDATION.
 *
 * WHY THIS EXISTS
 * ---------------
 * The W1b foundation: the enabler for compositing subtitles + (future) motion
 * graphics ON TOP OF real talking-head footage. This composition owns the LAYER
 * STACK and asset wiring; the actual caption rendering is delegated to the
 * `FloatingCaption` molecule so the caption layer can be reused over any backdrop.
 *
 * LAYER ORDER (bottom → top)
 * --------------------------
 * Two modes, selected by whether a `layoutTrack` is supplied:
 *
 *   LEGACY (no layoutTrack, full back-compat — byte-identical to before):
 *     1. Base video (full-bleed `OffthreadVideo`) or a "BASE VIDEO" placeholder.
 *     2. [overlay slot] — registry overlay molecules.
 *     3. FloatingCaption.
 *     4. Optional handle chip (persistent, or windowed via `handleWindows` — owner §9.3).
 *
 *   LAYOUT MODE (a `layoutTrack` is present — Tella-style scene switching):
 *     1. LayoutTrack (gradient backdrop + screen layer + cam layer).
 *     2. behind-speaker overlays/caption (composited UNDER the matte).
 *     3. SpeakerForegroundMatte (speaker alpha on top — depth compositing).
 *     4. front overlays/caption.
 *     5. Optional handle chip (persistent, or windowed via `handleWindows` — owner §9.3).
 *
 * ASSET REFERENCING
 * -----------------
 * `videoSrc`/`camSrc`/`screenSrc` may be an absolute http(s) URL or a path
 * relative to `public/`. Relative paths resolve through Remotion `staticFile()`;
 * http URLs pass through untouched.
 *
 * STANDALONE-IN-STUDIO: every schema field is `.default()`ed or `.optional()`ed,
 * so the comp renders with no props (placeholder backdrop + empty caption).
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";
import { FloatingCaption, floatingCaptionSchema } from "../components/FloatingCaption";
import { OVERLAY_REGISTRY } from "../components/overlays/registry";
import { LayoutTrack } from "../components/layout/LayoutTrack";
import { SpeakerForegroundMatte } from "../components/layout/SpeakerForegroundMatte";
import {
  backdropSchema,
  foregroundMatteSchema,
  layoutRefSchema,
  layoutSegmentSchema,
} from "../autoedit/editPlan";
import {
  handleWindowsSchema,
  normalizeHandleWindows,
  type HandleWindow,
} from "./scenes/handleWindows";

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod; legacy fields .default()ed, NEW fields .optional()ed —
// Remotion <Composition defaultProps> types as z.input & z.infer, so every NEW
// optional field MUST be .optional() (not just .default()) or registration breaks.)
// ─────────────────────────────────────────────────────────────────────────────

/** An over-speaker overlay entry. `behindSpeaker` (NEW, optional) routes it under
 *  the foreground matte; absent/false renders it in front, as today. */
const sceneOverlaySchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()).default({}),
  behindSpeaker: z.boolean().optional(),
  /** EDIT-time window (frames). When present, the overlay mounts inside a
   *  <Sequence from={fromFrame}> so its internal enter animation starts AT its
   *  planned beat instead of scene frame 0 (the EditPlan overlayTrack contract —
   *  without this every suggested overlay fired at t=0 and was gone before its
   *  word was spoken). Absent → always mounted (legacy demo drivers).
   *  `.optional()` — NEW fields (Remotion defaultProps z.input & z.infer gotcha). */
  fromFrame: z.number().optional(),
  toFrame: z.number().optional(),
});

export const speakerOverlayScene16x9Schema = z.object({
  /** Base talking-head footage. http(s) URL or path relative to public/.
   *  When empty, a dark-slate placeholder backdrop is rendered instead.
   *  Used only in LEGACY mode (no `layoutTrack`). */
  videoSrc: z.string().optional(),
  /** FloatingCaption props passed straight through to the caption layer. */
  caption: floatingCaptionSchema.default(() => floatingCaptionSchema.parse({})),
  /** Brand handle chip rendered bottom-right. Empty string hides it. */
  handle: z.string().default("@armandointeligencia"),
  /** Intermittent handle-chip windows (owner decision, DOGFOOD-PLAYBOOK §9.3:
   *  the chip pops in/out at moments instead of sitting persistent). ABSENT →
   *  persistent chip, byte-identical legacy behavior (back-compat). PRESENT →
   *  windows are validated/merged by the SHARED `normalizeHandleWindows`
   *  (Sol 0716 §3.1), then the chip mounts once per window inside a
   *  <Sequence>, with a ~10-frame fade in/out. Frames are scene-local output
   *  frames. Default auto-windows (~3 s every ~45 s + final 4 s) are the
   *  PLANNER's responsibility — this scene deliberately hardcodes no cadence.
   *  `.optional()` — NEW field (Remotion defaultProps z.input & z.infer Zod-v4 gotcha). */
  handleWindows: handleWindowsSchema,
  /** Composition length in frames. Default 150 = 5.0s @ 30fps. */
  durationFrames: z.number().default(150),
  /** Over-speaker overlay molecules (OV1–OV12). Each names a registry overlay +
   *  props; optional `behindSpeaker` routes it under the foreground matte. */
  overlays: z.array(sceneOverlaySchema).optional(),

  // ── Scene-layout engine (Tella-style) — all NEW fields are .optional() ───────
  /** Camera (talking-head) stream for layout mode. */
  camSrc: z.string().optional(),
  /** Screen-share / B-roll stream for layout mode. */
  screenSrc: z.string().optional(),
  /** Timed layout segments. When present, the LayoutTrack REPLACES the single
   *  base-video layer (layout mode). */
  layoutTrack: z.array(layoutSegmentSchema).optional(),
  /** Whole-duration default layout (preset name or inline regions). */
  baseLayout: layoutRefSchema.optional(),
  /** Decorative backdrop behind the layout layers (framed-scene look). */
  backdrop: backdropSchema.optional(),
  /** Speaker alpha matte composited on top of the layout layers (depth comp). */
  foregroundMatte: foregroundMatteSchema.optional(),
  /** When true, the caption layer renders BEHIND the foreground matte. */
  captionBehindSpeaker: z.boolean().optional(),
});

export type SpeakerOverlayScene16x9Props = z.infer<
  typeof speakerOverlayScene16x9Schema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Asset resolution
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve a video source: http(s) URLs pass through; everything else is
 *  treated as a path relative to public/ and resolved via staticFile(). */
function resolveVideoSrc(src: string): string {
  return src.startsWith("http") ? src : staticFile(src);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-renderers
// ─────────────────────────────────────────────────────────────────────────────

type SceneOverlay = z.infer<typeof sceneOverlaySchema>;

/** Mount a list of registry overlays (skips unknown types). */
const OverlayLayer: React.FC<{ overlays: SceneOverlay[]; keyPrefix: string }> = ({
  overlays,
  keyPrefix,
}) => (
  <>
    {overlays.map((o, i) => {
      const Overlay = OVERLAY_REGISTRY[o.type];
      if (!Overlay) return null;
      const key = `${keyPrefix}-${o.type}-${i}`;
      const node = <Overlay {...(o.props as Record<string, unknown>)} />;
      // Timed overlays (EditPlan path): a Sequence rebases useCurrentFrame()
      // so the molecule's own enter/hold/exit run inside [fromFrame, toFrame).
      // layout="none" — molecules position themselves via AbsoluteFill.
      return o.fromFrame !== undefined ? (
        <Sequence
          key={key}
          from={o.fromFrame}
          durationInFrames={
            o.toFrame !== undefined
              ? Math.max(1, o.toFrame - o.fromFrame)
              : undefined
          }
          layout="none"
        >
          {node}
        </Sequence>
      ) : (
        <React.Fragment key={key}>{node}</React.Fragment>
      );
    })}
  </>
);

const HandleChip: React.FC<{ handle: string }> = ({ handle }) =>
  handle.length > 0 ? (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 40,
        padding: "8px 18px",
        borderRadius: 999,
        background: "rgba(15,27,45,0.65)",
        border: `1px solid ${BRAND.colors.accent}`,
        color: "#FFFFFF",
        fontFamily: FONT_STACKS.sans,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}
    >
      {handle}
    </div>
  ) : null;

/** Fades the chip in/out over ~10 frames of the Sequence-local clock (clamped;
 *  the fade shrinks to half the window when the window is under 20 frames). */
const HandleChipFade: React.FC<{ handle: string; durationInFrames: number }> = ({
  handle,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fade = Math.min(10, Math.max(1, Math.floor(durationInFrames / 2)));
  const fadeIn = interpolate(frame, [0, fade], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fade, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <HandleChip handle={handle} />
    </div>
  );
};

/** Handle-chip layer — owner decision §9.3 (intermittent handle).
 *  `handleWindows` ABSENT → persistent chip (legacy behavior, back-compat).
 *  PRESENT → windows are normalized by the SHARED `normalizeHandleWindows`
 *  (invalid dropped loudly, overlaps merged, sub-minimum flashes dropped —
 *  Sol 0716 §3.1), then one Sequence-mounted, fade-wrapped chip per window
 *  (an explicitly empty array means no appearances at all). */
const HandleChipLayer: React.FC<{
  handle: string;
  handleWindows?: HandleWindow[];
}> = ({ handle, handleWindows }) => {
  if (handleWindows === undefined) {
    return <HandleChip handle={handle} />;
  }
  return (
    <>
      {normalizeHandleWindows(handleWindows).map((w, i) => {
        const dur = w.toFrame - w.fromFrame; // ≥ MIN_HANDLE_WINDOW_FRAMES
        return (
          <Sequence
            key={`handle-${i}`}
            from={w.fromFrame}
            durationInFrames={dur}
            layout="none"
          >
            <HandleChipFade handle={handle} durationInFrames={dur} />
          </Sequence>
        );
      })}
    </>
  );
};

/** The dark-slate placeholder backdrop shown in LEGACY mode without a `videoSrc`. */
const BaseVideoPlaceholder: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.backgroundDark} 100%)`,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: FONT_STACKS.sans,
        fontSize: 64,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.22)",
        textTransform: "uppercase",
      }}
    >
      Base Video
    </div>
  </AbsoluteFill>
);

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const SpeakerOverlayScene16x9: React.FC<
  SpeakerOverlayScene16x9Props
> = ({
  videoSrc,
  caption,
  overlays = [],
  handle = "@armandointeligencia",
  handleWindows,
  camSrc,
  screenSrc,
  layoutTrack,
  baseLayout,
  backdrop,
  foregroundMatte,
  captionBehindSpeaker = false,
}) => {
  const { fps } = useVideoConfig();
  const hasVideo = typeof videoSrc === "string" && videoSrc.length > 0;
  const useLayoutMode = Array.isArray(layoutTrack) && layoutTrack.length > 0;
  const hasMatte =
    typeof foregroundMatte?.src === "string" && foregroundMatte.src.length > 0;

  // Partition overlays by their behind-speaker flag (only meaningful with a matte;
  // without one, everything renders in front, preserving today's behavior).
  const behindOverlays = overlays.filter((o) => o.behindSpeaker === true);
  const frontOverlays = overlays.filter((o) => o.behindSpeaker !== true);

  // ── LEGACY mode: byte-identical to the pre-layout foundation ───────────────
  if (!useLayoutMode) {
    return (
      <AbsoluteFill style={{ backgroundColor: BRAND.colors.backgroundDark }}>
        {hasVideo ? (
          <OffthreadVideo
            src={resolveVideoSrc(videoSrc as string)}
            muted={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        ) : (
          <BaseVideoPlaceholder />
        )}

        {/* Overlay slot (registry molecules) → caption → handle chip. */}
        <OverlayLayer overlays={overlays} keyPrefix="ov" />
        <FloatingCaption {...caption} />
        <HandleChipLayer handle={handle} handleWindows={handleWindows} />
      </AbsoluteFill>
    );
  }

  // ── LAYOUT mode: LayoutTrack replaces the single base-video layer ──────────
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.backgroundDark }}>
      {/* 1. LayoutTrack: backdrop + screen + cam. */}
      <LayoutTrack
        camSrc={camSrc}
        screenSrc={screenSrc}
        layoutTrack={layoutTrack}
        baseLayout={baseLayout}
        backdrop={backdrop}
        fps={fps}
      />

      {/* 2. Behind-speaker overlays + (optionally) caption, UNDER the matte. */}
      <OverlayLayer overlays={behindOverlays} keyPrefix="ov-behind" />
      {captionBehindSpeaker ? <FloatingCaption {...caption} /> : null}

      {/* 3. Speaker foreground matte (alpha) on top — depth compositing. */}
      {hasMatte ? (
        <SpeakerForegroundMatte matte={foregroundMatte as { src: string }} />
      ) : null}

      {/* 4. Front overlays + (default) caption, OVER the matte. */}
      <OverlayLayer overlays={frontOverlays} keyPrefix="ov-front" />
      {captionBehindSpeaker ? null : <FloatingCaption {...caption} />}

      {/* 5. Handle chip. */}
      <HandleChipLayer handle={handle} handleWindows={handleWindows} />
    </AbsoluteFill>
  );
};

export default SpeakerOverlayScene16x9;
