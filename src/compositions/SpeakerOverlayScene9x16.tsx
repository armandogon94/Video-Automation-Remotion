/**
 * SpeakerOverlayScene9x16 — 1080×1920 talking-head OVERLAY FOUNDATION.
 *
 * Vertical sibling of SpeakerOverlayScene16x9. Same LAYER STACK and asset
 * wiring; differs only in aspect-appropriate defaults (caption font size,
 * handle chip scale). See SpeakerOverlayScene16x9 for the full design notes.
 *
 * LAYER ORDER (bottom → top)
 * --------------------------
 *   1. Base video (full-bleed `OffthreadVideo`) — or a dark-slate placeholder
 *      backdrop with a muted "BASE VIDEO" label when no `videoSrc` is supplied.
 *   2. [FUTURE OVERLAY SLOT] — future overlay molecules mount here.
 *   3. FloatingCaption — the one concrete overlay for now.
 *   4. Optional handle chip (bottom-center, lifted above the caption safe-zone).
 *
 * STANDALONE-IN-STUDIO: every schema field is `.default()`ed.
 */
import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";
import { FloatingCaption, floatingCaptionSchema } from "../components/FloatingCaption";

// ─────────────────────────────────────────────────────────────────────────────
// Schema (inline zod, all fields .default()ed → renders standalone in Studio)
// ─────────────────────────────────────────────────────────────────────────────

export const speakerOverlayScene9x16Schema = z.object({
  /** Base talking-head footage. http(s) URL or path relative to public/.
   *  When empty, a dark-slate placeholder backdrop is rendered instead. */
  videoSrc: z.string().optional(),
  /** FloatingCaption props passed straight through. Vertical default uses a
   *  centered position + larger font tuned for the 9:16 safe zone. */
  caption: floatingCaptionSchema.default(() =>
    floatingCaptionSchema.parse({ position: "center", fontSize: 64 }),
  ),
  /** Brand handle chip. Empty string hides it. */
  handle: z.string().default("@armandointeligencia"),
  /** Composition length in frames. Default 150 = 5.0s @ 30fps. */
  durationFrames: z.number().default(150),
});

export type SpeakerOverlayScene9x16Props = z.infer<
  typeof speakerOverlayScene9x16Schema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Asset resolution
// ─────────────────────────────────────────────────────────────────────────────

/** http(s) URLs pass through; relative paths resolve via staticFile(). */
function resolveVideoSrc(src: string): string {
  return src.startsWith("http") ? src : staticFile(src);
}

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const SpeakerOverlayScene9x16: React.FC<
  SpeakerOverlayScene9x16Props
> = ({ videoSrc, caption, handle = "@armandointeligencia" }) => {
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
            background: `linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.backgroundDark} 100%)`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontSize: 72,
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

      {/* ── Layer 2: FUTURE OVERLAY SLOT ──────────────────────────────────────
          Future overlay molecules mount HERE — between the base video and the
          caption layer — so they composite over the footage but UNDER the
          captions. Intentionally empty for the W1b foundation. */}

      {/* ── Layer 3: FloatingCaption (the one concrete overlay for now) ─────── */}
      <FloatingCaption {...caption} />

      {/* ── Layer 4: optional handle chip (bottom-center) ─────────────────────*/}
      {handle.length > 0 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 64,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(15,27,45,0.65)",
            border: `1px solid ${BRAND.colors.accent}`,
            color: "#FFFFFF",
            fontFamily: FONT_STACKS.sans,
            fontSize: 30,
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

export default SpeakerOverlayScene9x16;
