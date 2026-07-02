/**
 * ModelNameChipComparison9x16 — estebandiba's labeled model-comparison clip reel.
 *
 * Reference anchors (estebandiba `_backcat/`):
 *   - DZw-e2jogUt/frame-02.jpg — a vertical 9:16 frame split into stacked media
 *     bands, each carrying a top-left WHITE LABEL in a bold geometric sans
 *     ("Original", "Seedance 2", "Gemini Omni"). The labels read as model names
 *     and the SAME source clip is shown processed by each model.
 *   - DYkcWeXIYZv/frame-02.jpg — the single-clip variant: ONE full-frame media
 *     area with a persistent top-left NAME CHIP ("Original" → "Gemini Omni
 *     Edit") and an extra top-right tag ("Character Replace"). The reel CUTS
 *     between the same clip processed by N models while the chip swaps.
 *
 * This composition replicates the DYkcWeXIYZv pattern — a single full-frame
 * media well that CUTS between N models on a fixed schedule (perModelSeconds),
 * with a persistent top-left name chip that swaps to the active model's name on
 * each cut. Because the real processed clip is composited over the media well
 * downstream, the well is rendered here as a RICH labeled PLACEHOLDER: a
 * clearly-titled "FOOTAGE" panel (per-model deterministic tint + role tag +
 * dashed drop-target card + muted "PLACEHOLDER" caption) sitting BEHIND the
 * persistent model-comparison rail. The comparison therefore reads as a real,
 * finished layout even before footage is dropped in, and the cut still reads
 * because the tint/role label cycle with the chip.
 *
 * Anatomy (back-to-front):
 *   full-frame media well — RICH "FOOTAGE" placeholder panel:
 *     ↳ per-model deterministic tint gradient + faint no-signal hatch
 *     ↳ corner registration ticks
 *     ↳ top "FOOTAGE" role strip (accent dot) + per-model SOURCE/GRADED tag
 *     ↳ centered dashed drop-target card holding the clip glyph
 *     ↳ "FOOTAGE PANEL" label + muted gold "PLACEHOLDER" caption
 *   persistent model-comparison rail (right edge) — STAYS VISIBLE over the panel
 *   top-left NAME CHIP (solid dark rounded-rect, bold white text, accent dot)
 *     — swaps on each model cut with a quick slide+fade
 *   optional top-right small TAG chip (e.g. "AI Edit")
 *   optional progress dots (N of M) under the name chip
 *   bottom caption bar
 *
 * Motion (mirrors the source's hard reel cuts):
 *   - The media well does a fast cross-cut on each model boundary: the outgoing
 *     model fades/scales out over ~4f as the incoming one snaps in — a clip-reel
 *     "cut", not a slow dissolve.
 *   - The name chip text swaps with a 6f slide-up + fade keyed to the same
 *     boundary, so the label always matches the visible model.
 *   - Progress dots fill to the active index.
 *
 * GOTCHAS honored:
 *   - Composition id "ModelNameChipComparison9x16" has no underscore.
 *   - Hero/label text uses SOLID color (never background-clip:text) so Remotion's
 *     headless Chromium doesn't render it as an opaque box.
 *   - No Date.now / Math.random — the active model + all motion derive purely
 *     from useCurrentFrame.
 *
 * Self-contained: react + remotion + zod + brand + inline SVG only.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─────────────────────────────────────────────────────────────────────────────
// Schema — EVERY field has a .default(); demo defaults render real content
// with {} props. "" is the empty/override sentinel where applicable.
// ─────────────────────────────────────────────────────────────────────────────

export const modelNameChipComparison9x16Schema = z.object({
  /**
   * Ordered model names the reel cuts through. The first is conventionally the
   * untouched source ("Original"); the rest are the models that reprocessed it.
   */
  models: z
    .array(z.string())
    .min(1)
    .default(["Original", "Aleph 2", "Seedance 2", "Ray 3.2", "Gemini Omni"]),

  /** Seconds each model is held on screen before the reel cuts to the next. */
  perModelSeconds: z.number().default(1.2),

  /** Bottom caption bar text. "" hides the caption bar. */
  caption: z.string().default("Same clip, five models — which one wins?"),

  /**
   * Persistent top-right tag chip (e.g. the edit type). "" hides it.
   * Matches the source's "Character Replace" upper-right tag.
   */
  tag: z.string().default("AI Edit"),

  /** Accent color for the chip dot, progress dots, and media-well frame. */
  chipAccent: z.string().default(BRAND.colors.accent),

  /** When true, show the small "N of M" progress dots under the name chip. */
  showProgressDots: z.boolean().default(true),

  /** Lower-corner handle bug. "" hides it. */
  handle: z.string().default("@armandointeligencia"),
});

export type ModelNameChipComparison9x16Props = z.infer<
  typeof modelNameChipComparison9x16Schema
>;

/**
 * Content-driven total duration = one window per model. Mirrors the component's
 * own `modelCount × framesPerModel` schedule so `calculateMetadata` holds every
 * model on screen instead of truncating extra models at a literal length.
 */
export function computeModelNameChipComparisonFrames(
  props: Pick<ModelNameChipComparison9x16Props, "models" | "perModelSeconds">,
  fps: number,
): number {
  const modelCount = Math.max(1, props.models.length);
  const framesPerModel = Math.max(1, Math.round(props.perModelSeconds * fps));
  return modelCount * framesPerModel;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants (1080×1920).
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_BG = BRAND.colors.backgroundDark; // "#0F1B2D" — deep navy letterbox

/** Media well inset from the stage edges (slim letterbox, source-style). */
const WELL_INSET = 28;
const WELL_RADIUS = 26;
const WELL_BORDER = 3;

const CHIP_TOP = 60;
const CHIP_LEFT = 60;
const CHIP_RADIUS = 14;
const CHIP_FONT = 52;
const CHIP_BG = "rgba(8,12,22,0.82)";

const TAG_TOP = 64;
const TAG_RIGHT = 60;
const TAG_FONT = 30;

const DOTS_GAP = 16;
const DOT_SIZE = 18;

const CAPTION_FONT = 38;
const CAPTION_BOTTOM = 96;

/** Cut transition length (frames) — fast, reel-style, not a slow dissolve. */
const CUT_FRAMES = 5;
/** Name-chip swap slide length (frames). */
const CHIP_SWAP_FRAMES = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic per-model tint. Derived from the model's index so the same
// model always gets the same hue — no Math.random. The placeholder media well
// is filled with a diagonal gradient between two hues so each cut reads as a
// visibly different "processed clip".
// ─────────────────────────────────────────────────────────────────────────────

interface Tint {
  top: string;
  bottom: string;
  label: string;
}

/** A small fixed palette of cinematic placeholder tints, cycled by index. */
const TINTS: readonly Tint[] = [
  { top: "#2B3A52", bottom: "#141E30", label: "SOURCE" }, // neutral navy
  { top: "#3A2A45", bottom: "#1A1024", label: "GRADED" }, // plum
  { top: "#402A24", bottom: "#1C100C", label: "GRADED" }, // ember
  { top: "#1F3A38", bottom: "#0C1E1C", label: "GRADED" }, // teal
  { top: "#2E3550", bottom: "#10162A", label: "GRADED" }, // indigo
  { top: "#3C3320", bottom: "#1A150A", label: "GRADED" }, // amber
];

function tintForIndex(index: number): Tint {
  return TINTS[index % TINTS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule helper — maps the current frame to the active model index and the
// local progress through the current model's hold window.
// ─────────────────────────────────────────────────────────────────────────────

interface Schedule {
  activeIndex: number;
  /** Frame at which the active model's window began. */
  windowStart: number;
  /** Frames into the active model's window. */
  intoWindow: number;
}

function scheduleAt(
  frame: number,
  modelCount: number,
  framesPerModel: number,
): Schedule {
  const safePer = Math.max(1, framesPerModel);
  const rawIndex = Math.floor(frame / safePer);
  const activeIndex = Math.min(rawIndex, modelCount - 1);
  const windowStart = activeIndex * safePer;
  return { activeIndex, windowStart, intoWindow: frame - windowStart };
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand palette (mirrors src/brand tokens; pinned locally so the placeholder
// reads on-brand even if BRAND.colors.accent is overridden via chipAccent).
//   navy #1B3A6E · gold #D4AF37 · deep-navy #0F1B2D · cream #FAF7F2
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = {
  navy: "#1B3A6E",
  gold: "#D4AF37",
  deepNavy: "#0F1B2D",
  cream: "#FAF7F2",
} as const;

/** Hairline (1px) border in cream at a given alpha — for the finished-panel look. */
const hairline = (alpha: number): string => `1px solid rgba(250,247,242,${alpha})`;

// ─────────────────────────────────────────────────────────────────────────────
// Inline media glyph — a film/clapper-ish frame drawn in the empty well so the
// placeholder reads as a video clip well before footage is composited over it.
// ─────────────────────────────────────────────────────────────────────────────

const ClipGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width={132}
    height={132}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{ opacity: 0.92 }}
  >
    <rect
      x={2.5}
      y={5}
      width={19}
      height={14}
      rx={2.5}
      stroke={color}
      strokeWidth={1.2}
    />
    <path
      d="M10 9.2v5.6l4.6-2.8z"
      fill={color}
    />
    <path
      d="M2.5 9h19M7 5l-1.2 4M12 5l-1.2 4M17 5l-1.2 4"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Corner registration ticks — subtle viewfinder marks on the media well.
// ─────────────────────────────────────────────────────────────────────────────

const CornerTicks: React.FC<{ color: string }> = ({ color }) => {
  const len = 38;
  const off = 26;
  const w = 3;
  const corner = (
    style: React.CSSProperties,
    horiz: React.CSSProperties,
    vert: React.CSSProperties,
  ): React.ReactNode => (
    <div style={{ position: "absolute", ...style }}>
      <div
        style={{
          position: "absolute",
          width: len,
          height: w,
          background: color,
          borderRadius: w,
          ...horiz,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: w,
          height: len,
          background: color,
          borderRadius: w,
          ...vert,
        }}
      />
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
      {corner({ top: off, left: off }, { top: 0, left: 0 }, { top: 0, left: 0 })}
      {corner(
        { top: off, right: off },
        { top: 0, right: 0 },
        { top: 0, right: 0 },
      )}
      {corner(
        { bottom: off, left: off },
        { bottom: 0, left: 0 },
        { bottom: 0, left: 0 },
      )}
      {corner(
        { bottom: off, right: off },
        { bottom: 0, right: 0 },
        { bottom: 0, right: 0 },
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Media well — the full-frame placeholder for the active model's clip. Renders
// the current AND the outgoing model during a cut so the cross-cut reads.
// ─────────────────────────────────────────────────────────────────────────────

interface MediaLayerProps {
  index: number;
  opacity: number;
  scale: number;
  accent: string;
}

const MediaLayer: React.FC<MediaLayerProps> = ({
  index,
  opacity,
  scale,
  accent,
}) => {
  const tint = tintForIndex(index);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        borderRadius: WELL_RADIUS - WELL_BORDER,
        overflow: "hidden",
        background: `linear-gradient(150deg, ${tint.top} 0%, ${tint.bottom} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* subtle vignette so the placeholder reads with depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 38%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.34) 100%)",
        }}
      />

      {/* Faint diagonal "no-signal" hatch so the empty panel reads as an
          intentional placeholder surface rather than a flat color field. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(45deg, #FAF7F2 0 2px, rgba(0,0,0,0) 2px 26px)",
        }}
      />

      <CornerTicks color="rgba(250,247,242,0.55)" />

      {/* ── Top role strip: this panel IS the footage well. Label it. ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "30px 36px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(15,27,45,0.72)",
            border: hairline(0.18),
            borderRadius: 10,
            padding: "10px 18px",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: accent,
              boxShadow: `0 0 14px ${accent}cc`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_STACKS.condensed,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "0.22em",
              color: PALETTE.cream,
              textTransform: "uppercase",
            }}
          >
            Footage
          </span>
        </div>
        {/* per-model role tag (SOURCE / GRADED) */}
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: "0.28em",
            color: "rgba(250,247,242,0.6)",
            textTransform: "uppercase",
            background: "rgba(15,27,45,0.55)",
            border: hairline(0.14),
            borderRadius: 8,
            padding: "8px 14px",
          }}
        >
          {tint.label}
        </div>
      </div>

      {/* ── Centered framed glyph card — the "drop footage here" target. ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            width: 248,
            height: 248,
            borderRadius: 28,
            border: `2px dashed rgba(250,247,242,0.32)`,
            background: "rgba(15,27,45,0.34)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)",
          }}
        >
          <ClipGlyph color={PALETTE.cream} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.condensed,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "0.16em",
              color: PALETTE.cream,
              textTransform: "uppercase",
            }}
          >
            Footage Panel
          </div>
          {/* muted PLACEHOLDER caption — the panel-role caption */}
          <div
            style={{
              fontFamily: FONT_STACKS.mono,
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "0.36em",
              color: PALETTE.gold,
              textTransform: "uppercase",
              opacity: 0.82,
            }}
          >
            Placeholder
          </div>
        </div>
      </div>

      {/* thin inner accent line at the bottom of the well as a "now playing" cue */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 5,
          background: accent,
          opacity: 0.7,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Name chip — persistent top-left, swaps text on each model cut.
// ─────────────────────────────────────────────────────────────────────────────

interface NameChipProps {
  name: string;
  accent: string;
  /** 0→1 swap progress for the active label (slide-up + fade-in). */
  swapEnter: number;
}

const NameChip: React.FC<NameChipProps> = ({ name, accent, swapEnter }) => {
  const y = interpolate(swapEnter, [0, 1], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(swapEnter, [0, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: CHIP_TOP,
        left: CHIP_LEFT,
        background: CHIP_BG,
        borderRadius: CHIP_RADIUS,
        padding: "18px 26px 18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        maxWidth: 760,
        boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 5,
          background: accent,
          flexShrink: 0,
          boxShadow: `0 0 16px ${accent}99`,
        }}
      />
      {/* Clip the swap motion to the chip's text box only. */}
      <span style={{ overflow: "hidden", display: "inline-block" }}>
        <span
          style={{
            display: "inline-block",
            transform: `translateY(${y}px)`,
            opacity,
            fontFamily: FONT_STACKS.display,
            fontWeight: 900,
            fontSize: CHIP_FONT,
            lineHeight: 1.05,
            color: "#FFFFFF", // SOLID — never background-clip:text
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          {name}
        </span>
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Top-right tag chip.
// ─────────────────────────────────────────────────────────────────────────────

const TagChip: React.FC<{ tag: string }> = ({ tag }) => (
  <div
    style={{
      position: "absolute",
      top: TAG_TOP,
      right: TAG_RIGHT,
      background: "rgba(8,12,22,0.7)",
      borderRadius: 10,
      padding: "12px 18px",
      fontFamily: FONT_STACKS.sans,
      fontWeight: 700,
      fontSize: TAG_FONT,
      color: "rgba(255,255,255,0.92)",
      letterSpacing: "0.01em",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}
  >
    {tag}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Progress dots — N of M, filled to the active index.
// ─────────────────────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{
  count: number;
  activeIndex: number;
  accent: string;
}> = ({ count, activeIndex, accent }) => (
  <div
    style={{
      position: "absolute",
      top: CHIP_TOP + 116,
      left: CHIP_LEFT + 6,
      display: "flex",
      gap: DOTS_GAP,
      alignItems: "center",
    }}
  >
    {Array.from({ length: count }).map((_, i) => {
      const active = i === activeIndex;
      const past = i < activeIndex;
      return (
        <span
          key={i}
          style={{
            width: active ? DOT_SIZE + 18 : DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE,
            background: active
              ? accent
              : past
                ? "rgba(255,255,255,0.7)"
                : "rgba(255,255,255,0.28)",
            transition: "none",
          }}
        />
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Persistent model rail — the FULL list of compared models down the right edge,
// active one highlighted. Gives the frame comparison density even on a still
// (the temporal cut alone read too sparse).
// ─────────────────────────────────────────────────────────────────────────────

const ModelRail: React.FC<{ models: string[]; activeIndex: number; accent: string }> = ({
  models,
  activeIndex,
  accent,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "flex-end",
        opacity,
      }}
    >
      {models.map((m, i) => {
        const active = i === activeIndex;
        const past = i < activeIndex;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: active ? accent : "rgba(8,12,22,0.66)",
              border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999,
              padding: active ? "9px 18px" : "7px 14px",
              opacity: active ? 1 : past ? 0.72 : 0.42,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                background: active ? "#0A0C12" : past ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
              }}
            />
            <span
              style={{
                fontFamily: FONT_STACKS.mono,
                fontWeight: active ? 700 : 500,
                fontSize: active ? 26 : 22,
                letterSpacing: "0.01em",
                color: active ? "#0A0C12" : "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              {m}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bottom caption bar.
// ─────────────────────────────────────────────────────────────────────────────

const CaptionBar: React.FC<{ caption: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: CAPTION_BOTTOM,
        display: "flex",
        justifyContent: "center",
        padding: "0 64px",
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(8,12,22,0.78)",
          borderRadius: 16,
          padding: "20px 32px",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 600,
          fontSize: CAPTION_FONT,
          lineHeight: 1.25,
          color: "#FFFFFF",
          textAlign: "center",
          maxWidth: 920,
          boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
        }}
      >
        {caption}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Handle bug.
// ─────────────────────────────────────────────────────────────────────────────

const HandleBug: React.FC<{ handle: string; accent: string }> = ({
  handle,
  accent,
}) => (
  <div
    style={{
      position: "absolute",
      right: WELL_INSET + 22,
      bottom: WELL_INSET + 22,
      fontFamily: FONT_STACKS.sans,
      fontWeight: 600,
      fontSize: 24,
      color: "rgba(255,255,255,0.6)",
      letterSpacing: "0.02em",
      display: "flex",
      alignItems: "center",
      gap: 9,
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 3,
        background: accent,
        display: "inline-block",
      }}
    />
    {handle}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────────────────

export const ModelNameChipComparison9x16: React.FC<
  ModelNameChipComparison9x16Props
> = ({
  models,
  perModelSeconds,
  caption,
  tag,
  chipAccent,
  showProgressDots,
  handle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const modelCount = Math.max(1, models.length);
  const framesPerModel = Math.max(1, Math.round(perModelSeconds * fps));

  const { activeIndex, intoWindow } = scheduleAt(
    frame,
    modelCount,
    framesPerModel,
  );
  const prevIndex = Math.max(0, activeIndex - 1);

  // ── Cross-cut: at each window start the incoming model snaps in while the
  // outgoing model fades out over CUT_FRAMES. The very first window has no
  // outgoing layer. ──
  const cutT = interpolate(intoWindow, [0, CUT_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const isFirstWindow = activeIndex === 0;
  const showOutgoing = !isFirstWindow && intoWindow < CUT_FRAMES;

  const incomingOpacity = cutT;
  // Subtle scale-pop on the incoming clip (1.04 → 1.0) for a "punch" cut.
  const incomingScale = interpolate(cutT, [0, 1], [1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outgoingOpacity = 1 - cutT;

  // ── Name-chip swap: re-key the slide on each window so the label animates in
  // with its model. Use a spring on intoWindow clamped to CHIP_SWAP_FRAMES. ──
  const chipSwap = spring({
    frame: intoWindow,
    fps,
    config: { damping: 16, stiffness: 200, mass: 0.6 },
    durationInFrames: CHIP_SWAP_FRAMES,
  });

  return (
    <AbsoluteFill style={{ background: STAGE_BG }}>
      {/* Full-frame media well (inset letterbox). */}
      <div
        style={{
          position: "absolute",
          inset: WELL_INSET,
          borderRadius: WELL_RADIUS,
          border: `${WELL_BORDER}px solid ${chipAccent}`,
          background: "#0A1220",
          overflow: "hidden",
          boxShadow: "0 20px 70px rgba(0,0,0,0.6)",
        }}
      >
        {/* Outgoing model (only during a cut). */}
        {showOutgoing ? (
          <MediaLayer
            index={prevIndex}
            opacity={outgoingOpacity}
            scale={1}
            accent={chipAccent}
          />
        ) : null}

        {/* Incoming / active model. */}
        <MediaLayer
          index={activeIndex}
          opacity={isFirstWindow ? interpolate(frame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) : incomingOpacity}
          scale={incomingScale}
          accent={chipAccent}
        />

        {/* Persistent overlays live INSIDE the well so they sit over the clip. */}
        <NameChip
          name={models[activeIndex] ?? ""}
          accent={chipAccent}
          swapEnter={chipSwap}
        />

        {tag !== "" ? <TagChip tag={tag} /> : null}

        {showProgressDots && modelCount > 1 ? (
          <ProgressDots
            count={modelCount}
            activeIndex={activeIndex}
            accent={chipAccent}
          />
        ) : null}

        {modelCount > 1 ? (
          <ModelRail models={models} activeIndex={activeIndex} accent={chipAccent} />
        ) : null}

        {caption !== "" ? <CaptionBar caption={caption} /> : null}

        {handle !== "" ? (
          <HandleBug handle={handle} accent={chipAccent} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export default ModelNameChipComparison9x16;
