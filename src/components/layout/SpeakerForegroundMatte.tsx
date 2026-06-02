/**
 * SpeakerForegroundMatte — the speaker, cut out, composited ON TOP.
 *
 * WHAT THIS IS
 * ------------
 * Renders the speaker's alpha-matted cutout (from the depth-matting stage — a
 * sibling agent owns `src/matting/`) full-bleed over the layout layers. With the
 * matte on top, overlays/captions flagged `behindSpeaker` can be painted BELOW it
 * so graphics appear to sit behind the person (see
 * docs/research/wave-9/SUBTITLES-AND-DEPTH-MATTING.md).
 *
 * SOURCE KINDS
 * ------------
 *   - `alpha-video`  — an alpha-channel `.mov` (e.g. ProRes 4444 / VP9 alpha),
 *     played via `OffthreadVideo` (transparent where the background was removed).
 *   - `png-sequence` — a printf-style RGBA PNG-sequence pattern; rendered as a
 *     frame-indexed `<Img>` (one PNG per frame).
 *
 * `src` may be an absolute http(s) URL or a path relative to public/ (resolved via
 * staticFile()) — same convention as the video layers. If `src` is empty, nothing
 * is rendered (the scene degrades to no behind-speaker compositing).
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { ForegroundMatte } from "../../autoedit/editPlan";

export interface SpeakerForegroundMatteProps {
  matte: ForegroundMatte;
}

function resolveSrc(src: string): string {
  return src.startsWith("http") ? src : staticFile(src);
}

/** Resolve a printf-style PNG-sequence pattern for the current frame. Supports a
 *  `%0Nd` token (e.g. `mattes/frame-%04d.png`); falls back to appending the frame
 *  if no token is present. */
function resolveSequenceSrc(pattern: string, frame: number): string {
  const match = pattern.match(/%0(\d+)d/);
  let resolved: string;
  if (match) {
    const width = Number.parseInt(match[1], 10);
    resolved = pattern.replace(/%0\d+d/, String(frame).padStart(width, "0"));
  } else {
    resolved = `${pattern}${frame}`;
  }
  return resolveSrc(resolved);
}

export const SpeakerForegroundMatte: React.FC<SpeakerForegroundMatteProps> = ({
  matte,
}) => {
  const frame = useCurrentFrame();
  const hasSrc = typeof matte.src === "string" && matte.src.length > 0;
  if (!hasSrc) return null;

  const kind = matte.kind ?? "alpha-video";
  const layerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    display: "block",
  };

  return (
    <AbsoluteFill>
      {kind === "png-sequence" ? (
        <Img src={resolveSequenceSrc(matte.src, frame)} style={layerStyle} />
      ) : (
        <OffthreadVideo src={resolveSrc(matte.src)} muted style={layerStyle} />
      )}
    </AbsoluteFill>
  );
};

export default SpeakerForegroundMatte;
