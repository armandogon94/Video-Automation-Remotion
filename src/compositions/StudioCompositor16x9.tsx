/**
 * StudioCompositor16x9 — Igor Pogany / theaiadvantage's signature P1 pattern.
 *
 * Per `references/creators/theaiadvantage/ANALYSIS.md` §P1 and Wave-7
 * `docs/research/wave-7/ADR-001-16x9-lane.md` §4.1 (Rank 1), this is "the
 * closest analog to our brand voice across the entire 22-creator corpus" —
 * it's where the 16:9 long-form lane opens.
 *
 * Visual essence (Igor's "Studio Compositor" sub-brand):
 *   • Dark-slate background (we use DarkSlateChassis16x9's default deep-navy
 *     instead of Igor's pure #0A0A0A — keeps every chassis consumer in family
 *     and avoids the "AI Studio preview" flatness called out by R4B).
 *   • Alpha-keyed presenter pinned bottom-left as a rectangle webcam PIP.
 *   • A floating UI mockup right-of-presenter, perspective-tilted ~5° on the
 *     Y axis with a soft blue/violet glow halo (Igor's signature chrome).
 *   • Optional caption pill (CaptionPillWithKeyword) below content, with
 *     exactly one orange keyword — the "Stripe Press in motion" voice.
 *
 * Composition order (back-to-front, via DarkSlateChassis16x9):
 *   slate background → UI mockup (right, centered y, tilted+glowing)
 *     → WebcamPipOverlay (bottom-left)
 *     → caption pill → handle chip
 *
 * Timing (defaults assume 30fps):
 *   0–8f   presenter PIP fades up (opacity 0→1, +16px y-translate eased)
 *   4–16f  UI mockup floats in from right (+120px x-translate → 0, 0→1 opacity,
 *          5° rotateY perspective tilt held throughout)
 *   24–32f caption pill fades in (if present) — CaptionPillWithKeyword's own
 *          internal 8-frame fade envelope from startFrame=24
 *   32f→   hold
 */
import React from "react";
import { Img, useCurrentFrame, interpolate, Easing } from "remotion";
import { z } from "zod";
import { DarkSlateChassis16x9 } from "../components/chassis/DarkSlateChassis16x9";
import { CaptionPillWithKeyword } from "../components/captions/CaptionPillWithKeyword";
import { WebcamPipOverlay } from "../components/WebcamPipOverlay";

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const uiMockupSchema = z.object({
  /** UI mockup image source (URL or static asset path). */
  src: z.string(),
  altText: z.string().optional(),
  /** Halo color (Igor's signature is a soft blue/violet glow). */
  glowColor: z.string().default("#3FB8FF"),
  /** Title-bar label shown on the floating screen panel (Igor's reference
   *  shows an app/window chrome around the mockup, e.g. a style picker).
   *  Keeps the focal element reading as a UI/screen mockup rather than a raw
   *  brand image even when only a placeholder source is supplied. */
  screenLabel: z.string().default("Studio Compositor"),
});

const presenterSchema = z.object({
  /** Presenter source — alpha-keyed video URL or a static image fallback. */
  src: z.string(),
  /** Treat `src` as a video (renders inside <WebcamPipOverlay>). When false,
   *  the src is rendered as an <Img> inside the PIP tile. */
  isVideo: z.boolean().default(false),
  /** PIP width in px. Default 420 — roughly 22% of 1920 frame width. */
  widthPx: z.number().default(420),
});

const captionSchema = z.object({
  text: z.string(),
  keyword: z.string(),
});

export const studioCompositorSchema = z.object({
  /** UI mockup image source (will tilt and float right). */
  uiMockup: uiMockupSchema,
  /** Presenter PIP source (alpha-keyed video or static image). */
  presenter: presenterSchema,
  /** Optional caption pill. */
  caption: captionSchema.optional(),
  handle: z.string().default("@armandointeligencia"),
  durationFrames: z.number().default(150),
  /** Per Wave-5 contract. */
  transitionVerb: z
    .string()
    .default(
      "Float the perspective-tilted UI mockup in from the right with a soft glow halo while the presenter PIP fades up from the lower-left corner; once both elements are settled, the caption pill below fades in with one orange keyword.",
    ),
});

export type StudioCompositor16x9Props = z.infer<typeof studioCompositorSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Timing windows (frames @ 30fps)
// ─────────────────────────────────────────────────────────────────────────────

const PRESENTER_FADE_IN = { start: 0, end: 8 } as const;
const PRESENTER_TRANSLATE_Y_PX = 16;
const UI_MOCKUP_FLOAT_IN = { start: 4, end: 16 } as const;
const UI_MOCKUP_TRANSLATE_X_PX = 120;
const CAPTION_START_FRAME = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

/** Floating screen-mockup panel — a fixed landscape (16:9) card so a square or
 *  portrait source crops into a screen instead of ballooning into a giant
 *  centered brand image. This is what makes the composition read as a studio
 *  compositor (large floating UI/screen mockup) rather than a brand card. */
const SCREEN_PANEL_WIDTH_PX = 1120;
const SCREEN_PANEL_HEIGHT_PX = 630;
const SCREEN_TITLEBAR_HEIGHT_PX = 44;
const UI_MOCKUP_RIGHT_INSET_PX = 80;
const PIP_EDGE_INSET_PX = 24;
/** Perspective tilt — Igor's reference is ~5° rotateY. We apply -5° so the
 *  mockup angles "toward" the presenter on the left (right edge tilts away,
 *  giving the floating-screen depth read). */
const PERSPECTIVE_PX = 2000;
const ROTATE_Y_DEG = -5;
/** Glow halo alpha hex appended to glowColor (40 ≈ 25% alpha). */
const GLOW_ALPHA_HEX = "40";
const GLOW_BLUR_RADIUS_PX = 40;

/** Brand palette (from brand/config.json). The procedural editor mock inside the
 *  window panel is painted in these so the focal element reads as an on-brand
 *  studio/editor dashboard rather than a redundant copy of the presenter avatar. */
const BRAND_NAVY = "#1B3A6E";
const BRAND_GOLD = "#D4AF37";
const PANEL_BODY_BG = "#0B0F15";
const PANEL_RAIL_BG = "#11161F";
const PANEL_PANEL_BG = "#0F141C";
const PANEL_HAIRLINE = "rgba(255,255,255,0.08)";

// ─────────────────────────────────────────────────────────────────────────────
// Procedural editor mock — the window-panel body content.
//
// Instead of cropping the brand avatar into the panel (which created a redundant
// "double avatar" against the presenter PIP), we paint a generic editor/dashboard
// UI: a left tool rail, a main canvas area with a brand-tinted preview block, and
// a right properties panel with placeholder rows + swatches. Brand-colored, fully
// procedural — no avatar image. A subtle "Studio Compositor · Preview" caption
// labels it as a placeholder editor surface.
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_RAIL_WIDTH_PX = 64;
const PROPS_PANEL_WIDTH_PX = 240;
const TOOL_RAIL_ICON_COUNT = 6;
const PROPS_ROW_COUNT = 5;
const SWATCH_COLORS = [BRAND_NAVY, BRAND_GOLD, "#3FB8FF", "#2BD49B"] as const;

const EditorMockBody: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        background: PANEL_BODY_BG,
      }}
    >
      {/* Left tool rail — a column of placeholder tool buttons. */}
      <div
        style={{
          width: TOOL_RAIL_WIDTH_PX,
          flexShrink: 0,
          background: PANEL_RAIL_BG,
          borderRight: `1px solid ${PANEL_HAIRLINE}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          paddingTop: 22,
        }}
      >
        {Array.from({ length: TOOL_RAIL_ICON_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background:
                i === 0 ? `${BRAND_GOLD}33` : "rgba(255,255,255,0.06)",
              border:
                i === 0
                  ? `1px solid ${BRAND_GOLD}88`
                  : "1px solid rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>

      {/* Main canvas area — toolbar strip + brand-tinted preview block + timeline. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          padding: 22,
          gap: 16,
        }}
      >
        {/* Toolbar strip. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 96,
              height: 14,
              borderRadius: 7,
              background: "rgba(255,255,255,0.14)",
            }}
          />
          <div
            style={{
              width: 56,
              height: 14,
              borderRadius: 7,
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 72,
              height: 24,
              borderRadius: 6,
              background: `${BRAND_GOLD}E6`,
            }}
          />
        </div>

        {/* Preview canvas — a brand-navy block with a centered play affordance. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${BRAND_NAVY} 0%, #0E1726 100%)`,
            border: `1px solid ${PANEL_HAIRLINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
              border: `2px solid ${BRAND_GOLD}AA`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Play triangle. */}
            <div
              style={{
                width: 0,
                height: 0,
                marginLeft: 6,
                borderTop: "16px solid transparent",
                borderBottom: "16px solid transparent",
                borderLeft: `26px solid ${BRAND_GOLD}`,
              }}
            />
          </div>
          <span
            style={{
              position: "absolute",
              bottom: 14,
              left: 16,
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Studio Compositor · Preview
          </span>
        </div>

        {/* Timeline strip — a few placeholder clip blocks. */}
        <div style={{ display: "flex", gap: 8, height: 30 }}>
          {[0.34, 0.18, 0.26, 0.12].map((w, i) => (
            <div
              key={i}
              style={{
                width: `${w * 100}%`,
                borderRadius: 6,
                background:
                  i === 1 ? `${BRAND_NAVY}` : "rgba(255,255,255,0.07)",
                border: `1px solid ${PANEL_HAIRLINE}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right properties panel — header, placeholder rows, color swatches. */}
      <div
        style={{
          width: PROPS_PANEL_WIDTH_PX,
          flexShrink: 0,
          background: PANEL_PANEL_BG,
          borderLeft: `1px solid ${PANEL_HAIRLINE}`,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 120,
            height: 14,
            borderRadius: 7,
            background: "rgba(255,255,255,0.16)",
          }}
        />
        {Array.from({ length: PROPS_ROW_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: 7 }}
          >
            <div
              style={{
                width: `${50 + (i % 3) * 12}%`,
                height: 9,
                borderRadius: 5,
                background: "rgba(255,255,255,0.10)",
              }}
            />
            <div
              style={{
                width: "100%",
                height: 18,
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${PANEL_HAIRLINE}`,
              }}
            />
          </div>
        ))}
        {/* Color swatch row. */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {SWATCH_COLORS.map((c) => (
            <div
              key={c}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: c,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UI mockup layer — handles the perspective tilt + glow halo + entrance anim.
// ─────────────────────────────────────────────────────────────────────────────

interface UiMockupLayerProps {
  mockup: z.infer<typeof uiMockupSchema>;
  rightAnchorPx: number;
}

const UiMockupLayer: React.FC<UiMockupLayerProps> = ({
  mockup,
  rightAnchorPx,
}) => {
  const frame = useCurrentFrame();

  // Slide-from-right + fade entrance.
  const opacity = interpolate(
    frame,
    [UI_MOCKUP_FLOAT_IN.start, UI_MOCKUP_FLOAT_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const translateX = interpolate(
    frame,
    [UI_MOCKUP_FLOAT_IN.start, UI_MOCKUP_FLOAT_IN.end],
    [UI_MOCKUP_TRANSLATE_X_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // CSS perspective tilt is held statically — the entrance animation is the
  // translate+fade only. The glow halo is a drop-shadow on the wrapper so the
  // floating screen panel reads as Igor's signature chrome.
  const filter = `drop-shadow(0 0 ${GLOW_BLUR_RADIUS_PX}px ${mockup.glowColor}${GLOW_ALPHA_HEX})`;
  const transform = `translateX(${translateX}px) perspective(${PERSPECTIVE_PX}px) rotateY(${ROTATE_Y_DEG}deg)`;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        right: rightAnchorPx,
        // translateY(-50%) for vertical centering is folded into the transform
        // chain below so the entrance translateX composes cleanly.
        transform: `translateY(-50%) ${transform}`,
        transformOrigin: "center right",
        opacity,
        width: SCREEN_PANEL_WIDTH_PX,
        height: SCREEN_PANEL_HEIGHT_PX,
        filter,
        pointerEvents: "none",
        // The mockup is framed as a window-chrome screen card so a square or
        // portrait source crops into a landscape screen instead of ballooning
        // into a giant centered brand image — this is the "large floating UI
        // mockup" focal element that makes the comp read as a compositor.
        borderRadius: 14,
        overflow: "hidden",
        background: "#0E1116",
        border: `1px solid ${mockup.glowColor}55`,
        boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Title bar — traffic-light dots + screen label (window chrome). */}
      <div
        style={{
          height: SCREEN_TITLEBAR_HEIGHT_PX,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingLeft: 18,
          paddingRight: 18,
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FF5F57",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FEBC2E",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28C840",
            }}
          />
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {mockup.screenLabel}
        </span>
      </div>

      {/* Screen body — a procedural editor/dashboard mock (NOT the avatar image)
       *  so the panel reads as a generic studio editor surface rather than a
       *  redundant copy of the presenter PIP. The `mockup.src` prop is retained
       *  in the schema for backwards compatibility but is intentionally not
       *  rendered as the panel content. */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <EditorMockBody />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Presenter PIP wrapper — adds the fade-up + translate-Y entrance envelope.
//
// `<WebcamPipOverlay>` already supports `enterFrame` / `fadeInFrames`, but its
// internal envelope only animates opacity — Igor's reference also includes a
// short y-translate. We wrap the PIP in a positioned div so we can layer the
// translate without forking the molecule.
// ─────────────────────────────────────────────────────────────────────────────

interface PresenterPipProps {
  presenter: z.infer<typeof presenterSchema>;
}

const PresenterPip: React.FC<PresenterPipProps> = ({ presenter }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [PRESENTER_FADE_IN.start, PRESENTER_FADE_IN.end],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );
  const translateY = interpolate(
    frame,
    [PRESENTER_FADE_IN.start, PRESENTER_FADE_IN.end],
    [PRESENTER_TRANSLATE_Y_PX, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    },
  );

  // For static-image presenters, render the image directly inside an
  // absolutely-positioned tile that mirrors WebcamPipOverlay's bottom-left
  // anchor (24px inset, configurable width, 16:9 aspect). For video sources,
  // delegate to <WebcamPipOverlay> which handles <OffthreadVideo>.
  if (presenter.isVideo) {
    return (
      <div
        style={{
          // We wrap the overlay in a translate-only layer so its absolute
          // self-positioning (bottom-left, inset 24) survives. The wrapper is
          // a non-positioned, full-size container so the child's `position:
          // absolute` resolves against the chassis's AbsoluteFill.
          position: "absolute",
          inset: 0,
          opacity,
          transform: `translateY(${translateY}px)`,
          pointerEvents: "none",
        }}
      >
        <WebcamPipOverlay
          videoSrc={presenter.src}
          anchor="bottom-left"
          insetPx={PIP_EDGE_INSET_PX}
          widthPx={presenter.widthPx}
          aspect="16:9"
        />
      </div>
    );
  }

  // Static-image presenter — render an <Img> inside a tile sized like the PIP.
  const heightPx = Math.round(presenter.widthPx / (16 / 9));
  return (
    <div
      style={{
        position: "absolute",
        bottom: PIP_EDGE_INSET_PX,
        left: PIP_EDGE_INSET_PX,
        width: presenter.widthPx,
        height: heightPx,
        borderRadius: 12,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.20)",
        background: "#1A1A1A",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: "none",
      }}
    >
      <Img
        src={presenter.src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          display: "block",
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const StudioCompositor16x9: React.FC<StudioCompositor16x9Props> = ({
  uiMockup,
  presenter,
  caption,
  handle,
}) => {
  const captionPillNode = caption ? (
    <CaptionPillWithKeyword
      text={caption.text}
      keyword={caption.keyword}
      startFrame={CAPTION_START_FRAME}
    />
  ) : undefined;

  return (
    <DarkSlateChassis16x9
      handleChip={{ text: handle }}
      captionPill={captionPillNode}
    >
      <UiMockupLayer
        mockup={uiMockup}
        rightAnchorPx={UI_MOCKUP_RIGHT_INSET_PX}
      />
      <PresenterPip presenter={presenter} />
    </DarkSlateChassis16x9>
  );
};

export default StudioCompositor16x9;
