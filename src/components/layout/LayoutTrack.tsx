/**
 * LayoutTrack — Tella-style scene-layout renderer.
 *
 * WHAT THIS IS
 * ------------
 * Renders the two source video layers — `screenSrc` behind, `camSrc` in front —
 * positioned per the ACTIVE layout segment at the current frame, tweening their
 * `{x,y,w,h,cornerRadius}` during a `smooth` transition (Tella's signature
 * "bubble glides + grows/shrinks"). Hard-cuts otherwise. Uncovered frame ranges
 * fall back to `baseLayout`. When the active layout is the framed-backdrop look,
 * a gradient backdrop is painted behind the layers (Jack's framed scene).
 *
 * See docs/research/wave-9/TELLA-PRODUCT-RESEARCH.md §2.5/§3.3 (transition
 * semantics) and references/creators/itsjack/ANALYSIS.md §2 (framed backdrop).
 *
 * SLOTS INTO THE STACK
 * --------------------
 * This is the bottom-most visual layer of `SpeakerOverlayScene{16x9,9x16}` when a
 * `layoutTrack` is supplied — it replaces the single full-bleed base video. The
 * overlay slot, captions, foreground matte and handle chip composite ON TOP of it
 * unchanged.
 *
 * STANDALONE-IN-STUDIO: if a layer's src is missing, a labeled placeholder box is
 * drawn at that layer's region so the layout structure is visible without assets.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FONT_STACKS } from "../../brand";
import type {
  Backdrop,
  InlineLayout,
  LayoutSegment,
  LayoutRef,
  Region,
} from "../../autoedit/editPlan";
import {
  FRAMED_BACKDROP_DEFAULT,
  resolveLayout,
  type LayoutAspect,
} from "./LayoutPresets";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface LayoutTrackProps {
  /** Camera (talking-head) source. http(s) URL or path relative to public/. */
  camSrc?: string;
  /** Screen-share / B-roll source. http(s) URL or path relative to public/. */
  screenSrc?: string;
  /** Timed layout segments overriding the base layout for a frame range. */
  layoutTrack: LayoutSegment[];
  /** Whole-duration default layout (preset name or inline regions). */
  baseLayout?: LayoutRef;
  /** Decorative backdrop behind the layers (framed-scene look). */
  backdrop?: Backdrop;
  /** Frames per second (used to derive the canvas aspect default). */
  fps: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Asset resolution (same convention as the SpeakerOverlayScene comps)
// ─────────────────────────────────────────────────────────────────────────────

function resolveVideoSrc(src: string): string {
  return src.startsWith("http") ? src : staticFile(src);
}

// ─────────────────────────────────────────────────────────────────────────────
// Region maths
// ─────────────────────────────────────────────────────────────────────────────

/** A region resolved to concrete pixel CSS for a given canvas size, plus the
 *  border-radius treatment (px) and the content zoom (Ken Burns). `scale`/`focus`
 *  scale the VIDEO inside the box (not the box itself), so the framed window stays
 *  put while the footage pushes in on a focal point. */
interface ResolvedBox {
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
  radiusPx: number;
  /** Content zoom factor (1 = no zoom). */
  scale: number;
  /** Focal point as a fraction [0..1] of the box (kept fixed while zooming). */
  focusXPct: number;
  focusYPct: number;
}

/** Compute the effective corner radius (px) for a region at a canvas size. */
function regionRadiusPx(region: Region, canvasW: number, canvasH: number): number {
  const shape = region.shape ?? "rounded";
  switch (shape) {
    case "rect":
      return 0;
    case "circle":
      // Half the smaller pixel dimension → a circle/pill.
      return Math.min(region.wPct * canvasW, region.hPct * canvasH) / 2;
    case "squircle":
      // Large-but-bounded radius for the superellipse-ish look.
      return Math.min(
        region.cornerRadiusPx ?? 28,
        (Math.min(region.wPct * canvasW, region.hPct * canvasH) / 2) * 0.6,
      );
    case "rounded":
    default:
      return region.cornerRadiusPx ?? 14;
  }
}

function regionToBox(region: Region, canvasW: number, canvasH: number): ResolvedBox {
  return {
    leftPx: region.xPct * canvasW,
    topPx: region.yPct * canvasH,
    widthPx: region.wPct * canvasW,
    heightPx: region.hPct * canvasH,
    radiusPx: regionRadiusPx(region, canvasW, canvasH),
    scale: region.camScale ?? 1,
    focusXPct: region.camFocusXPct ?? 0.5,
    focusYPct: region.camFocusYPct ?? 0.5,
  };
}

/** Linear-blend two boxes by `t` in [0..1] (the smooth-transition tween). Also
 *  blends the content zoom + focal point so a transition can grow/shrink the
 *  Ken-Burns push alongside the box geometry. */
function lerpBox(a: ResolvedBox, b: ResolvedBox, t: number): ResolvedBox {
  const mix = (x: number, y: number): number => x + (y - x) * t;
  return {
    leftPx: mix(a.leftPx, b.leftPx),
    topPx: mix(a.topPx, b.topPx),
    widthPx: mix(a.widthPx, b.widthPx),
    heightPx: mix(a.heightPx, b.heightPx),
    radiusPx: mix(a.radiusPx, b.radiusPx),
    scale: mix(a.scale, b.scale),
    focusXPct: mix(a.focusXPct, b.focusXPct),
    focusYPct: mix(a.focusYPct, b.focusYPct),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout resolution
// ─────────────────────────────────────────────────────────────────────────────

function isInlineLayout(ref: LayoutRef | undefined): ref is InlineLayout {
  return typeof ref === "object" && ref !== null;
}

/** Resolve a `LayoutRef` (preset name OR inline regions) to a concrete
 *  `{cam?, screen?}` region pair. Unknown preset names → empty layout. */
function resolveRef(ref: LayoutRef | undefined, aspect: LayoutAspect): InlineLayout {
  if (ref === undefined) return {};
  if (isInlineLayout(ref)) return ref;
  return resolveLayout(ref, aspect) ?? {};
}

/** Does this layout call for the framed-backdrop gradient? True for the
 *  `framed-backdrop` preset name (string refs only — inline layouts opt in via
 *  the explicit `backdrop` prop). */
function refIsFramed(ref: LayoutRef | undefined): boolean {
  return typeof ref === "string" && ref === "framed-backdrop";
}

interface ActiveLayout {
  layout: InlineLayout;
  /** The framed-backdrop flag for the currently-displayed layout. During a
   *  smooth transition we keep the backdrop on if EITHER endpoint is framed. */
  framed: boolean;
}

/**
 * Compute the active layout for `frame`: find the covering segment, resolve its
 * regions, and — if it has a `smooth` transitionIn and we're inside the tween
 * window — blend from the previous layout (prior segment or base) into it.
 */
function computeActive(
  frame: number,
  layoutTrack: LayoutSegment[],
  baseRef: LayoutRef | undefined,
  aspect: LayoutAspect,
  canvasW: number,
  canvasH: number,
): { cam?: ResolvedBox; screen?: ResolvedBox; framed: boolean } {
  const segments = [...layoutTrack].sort((a, b) => a.startFrame - b.startFrame);
  const idx = segments.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame,
  );

  // Gap → base layout.
  if (idx === -1) {
    const base = resolveRef(baseRef, aspect);
    return layoutToBoxes(base, refIsFramed(baseRef), canvasW, canvasH);
  }

  const seg = segments[idx];
  const target = resolveRef(seg.layout, aspect);
  const targetFramed = refIsFramed(seg.layout);

  const transition = seg.transition;
  const dur = transition?.durationFrames ?? 0;
  const inTween =
    transition?.type === "smooth" &&
    dur > 0 &&
    frame < seg.startFrame + dur;

  if (!inTween) {
    return layoutToBoxes(target, targetFramed, canvasW, canvasH);
  }

  // Previous layout = prior segment (if adjacent/stacked) else base.
  const prevSeg = idx > 0 ? segments[idx - 1] : undefined;
  const prevRef: LayoutRef | undefined =
    prevSeg && prevSeg.endFrame >= seg.startFrame ? prevSeg.layout : baseRef;
  const prev = resolveRef(prevRef, aspect);
  const prevFramed = refIsFramed(prevRef);

  const raw = (frame - seg.startFrame) / dur;
  const t = interpolate(raw, [0, 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const prevBoxes = layoutToBoxes(prev, prevFramed, canvasW, canvasH);
  const targetBoxes = layoutToBoxes(target, targetFramed, canvasW, canvasH);

  return {
    cam: tweenLayer(prevBoxes.cam, targetBoxes.cam, t),
    screen: tweenLayer(prevBoxes.screen, targetBoxes.screen, t),
    // Keep the backdrop visible if either endpoint is framed.
    framed: prevFramed || targetFramed,
  };
}

/** Tween between two optional boxes. If one side is missing, the layer fades in/out
 *  from/to the other side's geometry (handled by opacity in the renderer), so here
 *  we just return the present box when only one exists. */
function tweenLayer(
  a: ResolvedBox | undefined,
  b: ResolvedBox | undefined,
  t: number,
): ResolvedBox | undefined {
  if (a && b) return lerpBox(a, b, t);
  return b ?? a;
}

function layoutToBoxes(
  layout: InlineLayout,
  framed: boolean,
  canvasW: number,
  canvasH: number,
): { cam?: ResolvedBox; screen?: ResolvedBox; framed: boolean } {
  return {
    cam: layout.cam ? regionToBox(layout.cam, canvasW, canvasH) : undefined,
    screen: layout.screen
      ? regionToBox(layout.screen, canvasW, canvasH)
      : undefined,
    framed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer renderers
// ─────────────────────────────────────────────────────────────────────────────

interface VideoLayerProps {
  box: ResolvedBox;
  src?: string;
  label: string;
  /** Soft drop-shadow separating the layer from the backdrop (framed scene). */
  shadow: boolean;
  muted: boolean;
}

const VideoLayer: React.FC<VideoLayerProps> = ({ box, src, label, shadow, muted }) => {
  const hasSrc = typeof src === "string" && src.length > 0;
  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: box.leftPx,
    top: box.topPx,
    width: box.widthPx,
    height: box.heightPx,
    borderRadius: box.radiusPx,
    overflow: "hidden",
    boxShadow: shadow ? "0 8px 38px rgba(0,0,0,0.32)" : undefined,
  };
  // Content zoom (Ken Burns): scale the inner video about its focal point. With
  // `transform-origin` at the focus fraction and a scale >1, the magnified video
  // is clipped by the wrapper's overflow:hidden, so the framed window is fixed
  // while the footage pushes in on the focal point (e.g. the face).
  const zoomed = box.scale !== 1;
  const innerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    display: "block",
    ...(zoomed
      ? {
          transform: `scale(${box.scale})`,
          transformOrigin: `${box.focusXPct * 100}% ${box.focusYPct * 100}%`,
        }
      : {}),
  };
  return (
    <div style={wrapperStyle}>
      {hasSrc ? (
        <OffthreadVideo
          src={resolveVideoSrc(src)}
          muted={muted}
          style={innerStyle}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.backgroundDark} 100%)`,
            border: "2px dashed rgba(255,255,255,0.18)",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACKS.sans,
              fontSize: Math.max(16, Math.min(48, box.widthPx * 0.1)),
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.32)",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

/** CSS for the framed-scene gradient backdrop. */
function backdropBackground(backdrop: Backdrop | undefined): string {
  const b = backdrop ?? FRAMED_BACKDROP_DEFAULT;
  const stops = b.stops && b.stops.length > 0 ? b.stops : FRAMED_BACKDROP_DEFAULT.stops;
  if (b.type === "solid") return stops[0];
  const angle = b.angleDeg ?? FRAMED_BACKDROP_DEFAULT.angleDeg;
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const LayoutTrack: React.FC<LayoutTrackProps> = ({
  camSrc,
  screenSrc,
  layoutTrack,
  baseLayout,
  backdrop,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const aspect: LayoutAspect = height >= width ? "9:16" : "16:9";

  const active = computeActive(
    frame,
    layoutTrack ?? [],
    baseLayout,
    aspect,
    width,
    height,
  );

  return (
    <AbsoluteFill>
      {/* Framed-scene gradient backdrop (Jack's signature) — painted when the
          active layout calls for it, OR when an explicit `backdrop` prop is
          supplied (inline layouts opt in via the explicit prop — this is the
          documented `refIsFramed` contract; previously only the preset path
          painted it, so inline punch layouts fell back to the flat scene bg). */}
      {active.framed || backdrop !== undefined ? (
        <AbsoluteFill style={{ background: backdropBackground(backdrop) }} />
      ) : null}

      {/* Screen layer (behind). Cam audio is the talking-head track, so the screen
          layer is muted to avoid double audio. */}
      {active.screen ? (
        <VideoLayer
          box={active.screen}
          src={screenSrc}
          label="Screen"
          shadow={active.framed}
          muted
        />
      ) : null}

      {/* Cam layer (in front). */}
      {active.cam ? (
        <VideoLayer
          box={active.cam}
          src={camSrc}
          label="Cam"
          shadow={active.framed}
          muted={false}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export default LayoutTrack;
