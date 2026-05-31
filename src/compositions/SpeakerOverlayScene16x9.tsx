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
 *   1. Base video (full-bleed `OffthreadVideo`) — or a dark-slate placeholder
 *      backdrop with a muted "BASE VIDEO" label when no `videoSrc` is supplied,
 *      so the structure is visible in Studio without a real asset.
 *   2. [FUTURE OVERLAY SLOT] — clearly-commented region where future overlay
 *      molecules (big-number pops, B-roll cards, kinetic type) will mount.
 *   3. FloatingCaption — the one concrete overlay for now.
 *   4. Optional handle chip (bottom-right).
 *
 * ASSET REFERENCING
 * -----------------
 * `videoSrc` may be an absolute http(s) URL or a path relative to `public/`.
 * Relative paths are resolved through Remotion `staticFile()`; http URLs pass
 * through untouched — same convention as the existing video-consuming comps.
 *
 * STANDALONE-IN-STUDIO: every schema field is `.default()`ed, so the comp renders
 * with no props. With no `videoSrc` it shows the placeholder; the FloatingCaption
 * default `wordTimings` is empty so it renders nothing until real timings arrive.
 */
import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";
import { FloatingCaption, floatingCaptionSchema } from "../components/FloatingCaption";
import { OVERLAY_REGISTRY } from "../components/overlays/registry";

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, all fields .default()ed → renders standalone in Studio)
// ─────────────────────────────────────────────────────────────────────────────

export const speakerOverlayScene16x9Schema = z.object({
  /** Base talking-head footage. http(s) URL or path relative to public/.
   *  When empty, a dark-slate placeholder backdrop is rendered instead. */
  videoSrc: z.string().optional(),
  /** FloatingCaption props passed straight through to the caption layer.
   *  Default is the fully-resolved FloatingCaption defaults (parse of `{}`). */
  caption: floatingCaptionSchema.default(() => floatingCaptionSchema.parse({})),
  /** Brand handle chip rendered bottom-right. Empty string hides it. */
  handle: z.string().default("@armandointeligencia"),
  /** Composition length in frames. Default 150 = 5.0s @ 30fps. */
  durationFrames: z.number().default(150),
  /** Over-speaker overlay molecules (OV1–OV12), mounted between the base video
   *  and the caption layer. Each entry names a registry overlay + its props.
   *  This is the EditPlan `overlayTrack` render target (ADR-003). */
  overlays: z
    .array(
      z.object({
        type: z.string(),
        props: z.record(z.string(), z.unknown()).default({}),
      }),
    )
    .optional(),
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
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const SpeakerOverlayScene16x9: React.FC<
  SpeakerOverlayScene16x9Props
> = ({ videoSrc, caption, overlays = [], handle = "@armandointeligencia" }) => {
  const hasVideo = typeof videoSrc === "string" && videoSrc.length > 0;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.backgroundDark }}>
      {/* ── Layer 1: base video (full-bleed) OR placeholder backdrop ───────── */}
      {hasVideo ? (
        <OffthreadVideo
          src={resolveVideoSrc(videoSrc)}
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
        <AbsoluteFill
          style={{
            // Dark-slate deep-navy placeholder so the layer structure is
            // visible in Studio without a real asset.
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
      )}

      {/* ── Layer 2: over-speaker overlay molecules (OV1–OV12) ────────────────
          Mounted from the data-driven `overlays` array via the registry, so an
          EditPlan (ADR-003) can place graphics over the footage by name. Each
          molecule owns its own enter/hold/exit timing + anchor and composites
          over the footage but UNDER the captions. */}
      {overlays.map((o, i) => {
        const Overlay = OVERLAY_REGISTRY[o.type];
        return Overlay ? (
          <Overlay key={`${o.type}-${i}`} {...(o.props as Record<string, unknown>)} />
        ) : null;
      })}

      {/* ── Layer 3: FloatingCaption (the one concrete overlay for now) ─────── */}
      <FloatingCaption {...caption} />

      {/* ── Layer 4: optional handle chip (bottom-right) ──────────────────────*/}
      {handle.length > 0 ? (
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
      ) : null}
    </AbsoluteFill>
  );
};

export default SpeakerOverlayScene16x9;
