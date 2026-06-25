/**
 * BuilderDropPoster9x16 — vertical (1080×1920) "Builder Drop" product-spec poster.
 *
 * Replicates @builtbystephan's recurring reel grammar: a full-screen DARK poster
 * laid on a dashed "blueprint" frame with small L-shaped corner tick-marks and a
 * thin vertical accent rail down the left edge. The anatomy (top → bottom):
 *
 *   - Dashed blueprint frame (inset ~40px) + 4 corner brackets + left accent rail
 *   - Top-left micro-metadata (mono caps): "BUILDER DROP # NNN" / "<date> · @handle"
 *   - Large two-tone headline (heavy sans) with ONE accent-colored word + period
 *   - Subhead (1-2 lines, mono, muted)
 *   - Optional bracketed product tag chip ([ SENDSHORT.AI ])
 *   - Inset framed MEDIA SLOT (rounded-rect placeholder w/ corner brackets) with
 *     1-3 floating labeled annotation chips positioned around it
 *   - Bottom row of lowercase tag-pills (bordered mono)
 *   - 2-3 item feature bullet list ("- item", mono) + a muted footnote line
 *   - Footer: @handle (accent) bottom-left, "# NNN · DROP / 01" (muted) bottom-right
 *
 * Reference frames studied: references/creators/builtbystephan/_new/
 *   DZ8SE7JSTmR_* (clip-farming, yellow accent, sentence-case headline),
 *   DZn0UAhxY48_* (multiplayer games, orange accent, all-caps headline),
 *   DZdYMc7yJdz_* (Higgsfield MCP, media slot + Click-to-Ad annotation chip).
 *
 * Entrance choreography (mirrors the source reveal order):
 *   1. Blueprint frame draws in (corner brackets pop, rail wipes down)        ~t0
 *   2. Metadata + headline rise/fade                                          ~t0.25s
 *   3. Subhead + tag chip rise                                                ~t0.55s
 *   4. Media slot scales in from 0.9 → 1.0                                    ~t0.85s
 *   5. Annotation chips pop (staggered)                                       ~t1.15s+
 *   6. Tag-pills + feature bullets stagger in                                 ~t1.5s+
 *   7. Footer fades in last                                                   ~t1.9s
 *
 * Self-contained: imports only react / remotion / zod + ../brand + inline SVG.
 * GOTCHA AVOIDED: no background-clip:text — all hero text uses SOLID colors so
 * headless Chromium does not render it as an opaque box.
 */
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { z } from "zod";
import { BRAND, FONT_STACKS } from "../brand";

// ─── Schemas (declared locally — self-contained sibling pattern) ──────────────
const annotationChipSchema = z.object({
  /** Short label, e.g. "Auto B-roll", "Click to Ad". */
  label: z.string().default(""),
  /** Single emoji/glyph rendered before the label. "" hides the icon. */
  icon: z.string().default(""),
  /** Horizontal position as a fraction of canvas width (0-1). */
  x: z.number().min(0).max(1).default(0.5),
  /** Vertical position as a fraction of canvas height (0-1). */
  y: z.number().min(0).max(1).default(0.5),
});
export type BuilderDropAnnotationChip = z.infer<typeof annotationChipSchema>;

export const builderDropPoster9x16Schema = z.object({
  /** Headline text. ONE word in it (matched against `accentWord`) renders in the
   *  accent color; everything else is ink. A trailing "." is appended in accent. */
  headline: z
    .string()
    .default("AI now edits your clips"),
  /** The single word inside `headline` to tint with the accent color. */
  accentWord: z.string().default("clips"),
  /** If true, the headline is rendered in ALL-CAPS condensed display (orange
   *  "MULTIPLAYER GAMES" style); if false, sentence-case heavy sans. */
  uppercaseHeadline: z.boolean().default(false),
  /** 1-2 line supporting subhead under the headline (mono, muted). */
  subhead: z
    .string()
    .default(
      "Drop your video. It finds viral moments, auto-captions & schedules your Shorts.",
    ),
  /** Drop number shown in metadata + footer (e.g. "041"). */
  dropNumber: z.string().default("041"),
  /** Date shown in the top-left metadata block. */
  date: z.string().default("JUN 24 2026"),
  /** Creator handle (with or without leading @). */
  handle: z.string().default("@armandointeligencia"),
  /** Optional bracketed product tag chip under the subhead ("" hides it). */
  productTag: z.string().default("SENDSHORT.AI"),
  /** Lowercase bordered tag-pills in the bottom row. */
  tags: z.array(z.string()).default(["auto edit", "captions", "scheduler"]),
  /** 2-3 feature bullets ("- item", mono). */
  bullets: z
    .array(z.string())
    .default([
      "Finds the viral moments automatically",
      "Word-by-word animated captions",
      "Schedules Shorts across platforms",
    ]),
  /** Footnote line under the bullets (small, muted). */
  footnote: z.string().default("This is what clip-farming looks like in 2026."),
  /** Floating annotation chips around the media slot (0-3 used). */
  annotationChips: z
    .array(annotationChipSchema)
    .default([
      { label: "Auto B-roll", icon: "🎬", x: 0.33, y: 0.6 },
      { label: "Auto Clip", icon: "✂️", x: 0.74, y: 0.66 },
      { label: "Auto Caption", icon: "💬", x: 0.66, y: 0.78 },
    ]),
  /** Label shown centered inside the empty media slot placeholder. */
  mediaLabel: z.string().default("PRODUCT DEMO"),
  /** Accent color (defaults to OUR brand gold). "" falls back to brand gold. */
  accentColor: z.string().default(""),
});
export type BuilderDropPoster9x16Props = z.infer<
  typeof builderDropPoster9x16Schema
>;

// ─── Palette (builtbystephan-discipline: near-black poster, ONE bright accent) ──
const POSTER_BG = "#08090C"; // near-black, slightly cooler than brand deep-navy
const POSTER_BG_GRAD = BRAND.colors.backgroundDark; // #0F1B2D — subtle radial lift
const INK = "#F4F5F7"; // near-white headline ink
const MUTED = "#8A91A0"; // mono metadata / subhead grey
const FAINT = "#3A4150"; // dashed frame + slot border
const SLOT_FILL = "#11141B"; // media slot interior

// ─── Layout constants (1080×1920 canvas) ──────────────────────────────
const FRAME_INSET = 40; // dashed blueprint frame inset from edges
const CONTENT_X = 88; // left text margin (inside the rail)
const META_Y = 150;
const HEADLINE_Y = 250;
const SUBHEAD_Y = 470;
const TAG_CHIP_Y = 580;
const SLOT_TOP = 690;
const SLOT_HEIGHT = 720;
const SLOT_X = 88;
const SLOT_W = 1080 - SLOT_X * 2;
const BOTTOM_BLOCK_Y = 1470;
const FOOTER_Y = 1840;

// ─── helper: spring-based fade+rise ────────────────────────────────────
const useRise = (
  enterFrame: number,
  opts?: { from?: number; damping?: number; stiffness?: number },
): { opacity: number; translateY: number; t: number } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const t = spring({
    frame: Math.max(0, local),
    fps,
    config: {
      damping: opts?.damping ?? 22,
      stiffness: opts?.stiffness ?? 130,
      mass: 0.7,
    },
  });
  const opacity = local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  const translateY = interpolate(t, [0, 1], [opts?.from ?? 16, 0]);
  return { opacity, translateY, t };
};

// ─── Blueprint frame: dashed rect + 4 corner brackets + left accent rail ──────
const BlueprintFrame: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Dashed rect draws via dashoffset; corner brackets pop after.
  const draw = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const W = 1080;
  const H = 1920;
  const x = FRAME_INSET;
  const y = FRAME_INSET;
  const w = W - FRAME_INSET * 2;
  const h = H - FRAME_INSET * 2;
  const perim = 2 * (w + h);

  // Corner brackets pop in (scale) shortly after the dashed rect starts.
  const bracket = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.5 },
  });
  const bLen = 46; // bracket arm length
  const corners: Array<[number, number, number, number, number, number]> = [
    // [hx1,hy1,hx2,hy2 (horizontal arm)] then vertical arm shares the corner
    [x, y, x + bLen, y, x, y + bLen], // top-left
    [w + x, y, w + x - bLen, y, w + x, y + bLen], // top-right
    [x, h + y, x + bLen, h + y, x, h + y - bLen], // bottom-left
    [w + x, h + y, w + x - bLen, h + y, w + x, h + y - bLen], // bottom-right
  ];

  // Left vertical accent rail wipes down.
  const railH = interpolate(frame, [4, 26], [0, h - 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Dashed blueprint rectangle */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill="none"
        stroke={FAINT}
        strokeWidth={1.5}
        strokeDasharray="10 9"
        strokeDashoffset={(1 - draw) * perim}
        opacity={0.85}
      />
      {/* Corner brackets (solid, accent-tinted) */}
      {corners.map(([cx, cy, hx, hy, vx, vy], i) => (
        <g
          key={`corner-${i}`}
          opacity={bracket}
          style={{
            transform: `scale(${interpolate(bracket, [0, 1], [0.4, 1])})`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={hx}
            y2={hy}
            stroke={accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy}
            x2={vx}
            y2={vy}
            stroke={accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      ))}
      {/* Left vertical accent rail */}
      <line
        x1={x + 18}
        y1={y + 60}
        x2={x + 18}
        y2={y + 60 + railH}
        stroke={accent}
        strokeWidth={2.5}
        opacity={0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Vertical micro-text running up the left rail ─────────────────────────────
const RailMicroText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [20, 34], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: FRAME_INSET + 4,
        top: "50%",
        transform: "translateY(-50%) rotate(180deg)",
        writingMode: "vertical-rl",
        fontFamily: FONT_STACKS.mono,
        fontSize: 13,
        letterSpacing: "0.4em",
        color: MUTED,
        textTransform: "uppercase",
        opacity,
        userSelect: "none",
      }}
    >
      {text}
    </div>
  );
};

// ─── Top-left metadata block ──────────────────────────────────────────────────
const MetaBlock: React.FC<{
  dropNumber: string;
  date: string;
  handle: string;
  accent: string;
}> = ({ dropNumber, date, handle, accent }) => {
  const { opacity, translateY } = useRise(8, { from: 10 });
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        top: META_Y,
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: FONT_STACKS.mono,
        fontSize: 17,
        letterSpacing: "0.18em",
        lineHeight: 1.7,
        textTransform: "uppercase",
      }}
    >
      <div style={{ color: accent }}>{`BUILDER DROP # ${dropNumber}`}</div>
      <div style={{ color: MUTED }}>{`${date} · ${handle}`}</div>
    </div>
  );
};

// ─── Two-tone headline (one accent word + accent period) ──────────────────────
const Headline: React.FC<{
  text: string;
  accentWord: string;
  uppercase: boolean;
  accent: string;
}> = ({ text, accentWord, uppercase, accent }) => {
  const { opacity, translateY } = useRise(8, {
    from: 22,
    damping: 24,
    stiffness: 120,
  });

  const words = text.split(" ").filter((w) => w.length > 0);
  const accentTarget = accentWord.trim().toLowerCase();

  // Auto-shrink for longer headlines so they stay within the content column.
  const len = text.length;
  let fontSize = uppercase ? 92 : 96;
  if (len > 18) fontSize = uppercase ? 82 : 88;
  if (len > 26) fontSize = uppercase ? 72 : 76;
  if (len > 38) fontSize = uppercase ? 60 : 64;

  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        right: 96,
        top: HEADLINE_Y,
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: uppercase ? FONT_STACKS.condensed : FONT_STACKS.sans,
        fontWeight: uppercase ? 700 : 800,
        fontSize,
        lineHeight: uppercase ? 0.98 : 1.04,
        letterSpacing: uppercase ? "0.005em" : "-0.025em",
        color: INK,
        textTransform: uppercase ? "uppercase" : "none",
      }}
    >
      {words.map((word, i) => {
        const normalized = word.replace(/[.,!?;:]/g, "").toLowerCase();
        const isAccent = normalized === accentTarget;
        return (
          <React.Fragment key={`hw-${i}`}>
            <span style={{ color: isAccent ? accent : INK }}>{word}</span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
      <span style={{ color: accent }}>.</span>
    </div>
  );
};

// ─── Subhead (mono, muted, 1-2 lines) ─────────────────────────────────────────
const Subhead: React.FC<{ text: string }> = ({ text }) => {
  const { opacity, translateY } = useRise(16, { from: 12 });
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        right: 130,
        top: SUBHEAD_Y,
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: FONT_STACKS.mono,
        fontSize: 24,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
        color: MUTED,
      }}
    >
      {text}
    </div>
  );
};

// ─── Bracketed product tag chip ([ NAME ]) ────────────────────────────────────
const ProductTagChip: React.FC<{ text: string; accent: string }> = ({
  text,
  accent,
}) => {
  const { opacity, translateY } = useRise(20, { from: 10 });
  return (
    <div
      style={{
        position: "absolute",
        left: CONTENT_X,
        top: TAG_CHIP_Y,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 16px",
        border: `1px solid ${accent}66`,
        borderRadius: 4,
        fontFamily: FONT_STACKS.mono,
        fontSize: 16,
        letterSpacing: "0.22em",
        color: accent,
        textTransform: "uppercase",
        background: `${accent}10`,
      }}
    >
      {`[ ${text} ]`}
    </div>
  );
};

// ─── Media slot (rounded-rect placeholder + corner brackets + label) ──────────
const MediaSlot: React.FC<{ label: string; accent: string }> = ({
  label,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = 26;
  const t = spring({
    frame: Math.max(0, frame - enter),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });
  const opacity = frame < enter ? 0 : interpolate(t, [0, 1], [0, 1]);
  const scale = interpolate(t, [0, 1], [0.9, 1]);

  const b = 34; // slot corner-bracket arm length
  const cornerStyle: React.CSSProperties = {
    position: "absolute",
    width: b,
    height: b,
    borderColor: accent,
    borderStyle: "solid",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: SLOT_X,
        top: SLOT_TOP,
        width: SLOT_W,
        height: SLOT_HEIGHT,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center top",
        borderRadius: 14,
        background: `linear-gradient(160deg, ${SLOT_FILL} 0%, #0B0D12 100%)`,
        border: `1px solid ${FAINT}`,
        overflow: "hidden",
      }}
    >
      {/* faint scan-grid to read as a "screen" placeholder */}
      <svg
        width={SLOT_W}
        height={SLOT_HEIGHT}
        viewBox={`0 0 ${SLOT_W} ${SLOT_HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: 0.35 }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={(SLOT_HEIGHT / 9) * (i + 1)}
            x2={SLOT_W}
            y2={(SLOT_HEIGHT / 9) * (i + 1)}
            stroke={FAINT}
            strokeWidth={1}
            opacity={0.4}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={(SLOT_W / 6) * (i + 1)}
            y1={0}
            x2={(SLOT_W / 6) * (i + 1)}
            y2={SLOT_HEIGHT}
            stroke={FAINT}
            strokeWidth={1}
            opacity={0.4}
          />
        ))}
      </svg>

      {/* corner brackets inside the slot */}
      <div
        style={{
          ...cornerStyle,
          top: 14,
          left: 14,
          borderWidth: "2px 0 0 2px",
          borderTopLeftRadius: 6,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          top: 14,
          right: 14,
          borderWidth: "2px 2px 0 0",
          borderTopRightRadius: 6,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 14,
          left: 14,
          borderWidth: "0 0 2px 2px",
          borderBottomLeftRadius: 6,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          bottom: 14,
          right: 14,
          borderWidth: "0 2px 2px 0",
          borderBottomRightRadius: 6,
        }}
      />

      {/* centered media label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* play-triangle glyph in a ring */}
        <svg width={84} height={84} viewBox="0 0 84 84">
          <circle
            cx={42}
            cy={42}
            r={40}
            fill="none"
            stroke={`${accent}88`}
            strokeWidth={2}
          />
          <path d="M34 28 L60 42 L34 56 Z" fill={accent} />
        </svg>
        <div
          style={{
            fontFamily: FONT_STACKS.mono,
            fontSize: 18,
            letterSpacing: "0.3em",
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// ─── Floating annotation chip (rounded pill, icon + label) ────────────────────
const AnnotationChip: React.FC<{
  chip: BuilderDropAnnotationChip;
  enterFrame: number;
  accent: string;
}> = ({ chip, enterFrame, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const t = spring({
    frame: Math.max(0, local),
    fps,
    config: { damping: 14, stiffness: 240, mass: 0.5 },
  });
  const opacity = local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  const scale = interpolate(t, [0, 1], [0.6, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${chip.x * 100}%`,
        top: `${chip.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        background: accent,
        color: "#10130A",
        fontFamily: FONT_STACKS.sans,
        fontWeight: 700,
        fontSize: 22,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
      }}
    >
      {chip.icon ? (
        <span style={{ fontSize: 20, lineHeight: 1 }}>{chip.icon}</span>
      ) : null}
      <span>{chip.label}</span>
    </div>
  );
};

// ─── Bottom block: tag-pills + feature bullets + footnote ─────────────────────
const TagPill: React.FC<{
  text: string;
  enterFrame: number;
  accent: string;
}> = ({ text, enterFrame, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const t = spring({
    frame: Math.max(0, local),
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.5 },
  });
  const opacity = local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  const ty = interpolate(t, [0, 1], [8, 0]);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px)`,
        padding: "6px 14px",
        border: `1px solid ${accent}55`,
        borderRadius: 4,
        fontFamily: FONT_STACKS.mono,
        fontSize: 15,
        letterSpacing: "0.16em",
        color: accent,
        textTransform: "uppercase",
        background: `${accent}0D`,
      }}
    >
      {text}
    </div>
  );
};

const FeatureBullet: React.FC<{
  text: string;
  enterFrame: number;
  accent: string;
}> = ({ text, enterFrame, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - enterFrame;
  const t = spring({
    frame: Math.max(0, local),
    fps,
    config: { damping: 22, stiffness: 180, mass: 0.6 },
  });
  const opacity = local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  const tx = interpolate(t, [0, 1], [-10, 0]);
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        opacity,
        transform: `translateX(${tx}px)`,
        fontFamily: FONT_STACKS.mono,
        fontSize: 22,
        lineHeight: 1.4,
        color: INK,
      }}
    >
      <span style={{ color: accent, flex: "0 0 auto" }}>-</span>
      <span style={{ flex: "1 1 auto", color: "#C7CCD6" }}>{text}</span>
    </div>
  );
};

// ─── Composition ──────────────────────────────────────────────────────────────
export const BuilderDropPoster9x16: React.FC<BuilderDropPoster9x16Props> = ({
  headline,
  accentWord,
  uppercaseHeadline,
  subhead,
  dropNumber,
  date,
  handle,
  productTag,
  tags,
  bullets,
  footnote,
  annotationChips,
  mediaLabel,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accent = accentColor || BRAND.colors.accent;
  const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const usedChips = annotationChips.slice(0, 3);

  // Stagger schedules.
  const chipBaseFrame = Math.round(1.15 * fps);
  const chipStagger = Math.round(0.16 * fps);
  const pillBaseFrame = Math.round(1.5 * fps);
  const pillStagger = Math.round(0.08 * fps);
  const bulletBaseFrame = Math.round(1.62 * fps);
  const bulletStagger = Math.round(0.12 * fps);
  const footnoteEnter = Math.round(1.95 * fps);
  const footerEnter = Math.round(1.95 * fps);

  const footnoteAnim = (() => {
    const local = frame - footnoteEnter;
    const t = spring({
      frame: Math.max(0, local),
      fps,
      config: { damping: 24, stiffness: 160, mass: 0.6 },
    });
    return local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  })();

  const footerAnim = (() => {
    const local = frame - footerEnter;
    const t = spring({
      frame: Math.max(0, local),
      fps,
      config: { damping: 24, stiffness: 160, mass: 0.6 },
    });
    return local < 0 ? 0 : interpolate(t, [0, 1], [0, 1]);
  })();

  // Bottom block vertical layout.
  const bulletsTopY = BOTTOM_BLOCK_Y + 56;
  const bulletLineH = 40;
  const footnoteY = bulletsTopY + bullets.length * bulletLineH + 18;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 18%, ${POSTER_BG_GRAD} 0%, ${POSTER_BG} 58%)`,
      }}
    >
      {/* Blueprint frame + corner brackets + accent rail */}
      <BlueprintFrame accent={accent} />
      <RailMicroText text={`builder drop ${dropNumber}`} />

      {/* Top-left metadata */}
      <MetaBlock
        dropNumber={dropNumber}
        date={date}
        handle={normalizedHandle}
        accent={accent}
      />

      {/* Headline */}
      <Headline
        text={headline}
        accentWord={accentWord}
        uppercase={uppercaseHeadline}
        accent={accent}
      />

      {/* Subhead */}
      {subhead ? <Subhead text={subhead} /> : null}

      {/* Product tag chip */}
      {productTag ? <ProductTagChip text={productTag} accent={accent} /> : null}

      {/* Media slot */}
      <MediaSlot label={mediaLabel} accent={accent} />

      {/* Floating annotation chips around the media slot */}
      {usedChips.map((chip, i) => (
        <AnnotationChip
          key={`chip-${i}`}
          chip={chip}
          enterFrame={chipBaseFrame + i * chipStagger}
          accent={accent}
        />
      ))}

      {/* Bottom: tag-pills row */}
      <div
        style={{
          position: "absolute",
          left: CONTENT_X,
          right: 96,
          top: BOTTOM_BLOCK_Y,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {tags.map((tag, i) => (
          <TagPill
            key={`pill-${i}`}
            text={tag}
            enterFrame={pillBaseFrame + i * pillStagger}
            accent={accent}
          />
        ))}
      </div>

      {/* Bottom: feature bullets */}
      <div
        style={{
          position: "absolute",
          left: CONTENT_X,
          right: 96,
          top: bulletsTopY,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {bullets.map((b, i) => (
          <FeatureBullet
            key={`bullet-${i}`}
            text={b}
            enterFrame={bulletBaseFrame + i * bulletStagger}
            accent={accent}
          />
        ))}
      </div>

      {/* Footnote line */}
      {footnote ? (
        <div
          style={{
            position: "absolute",
            left: CONTENT_X,
            right: 96,
            top: footnoteY,
            opacity: footnoteAnim * 0.7,
            fontFamily: FONT_STACKS.mono,
            fontSize: 15,
            letterSpacing: "0.05em",
            color: MUTED,
          }}
        >
          {`* ${footnote}`}
        </div>
      ) : null}

      {/* Footer: handle (accent, left) + drop counter (muted, right) */}
      <div
        style={{
          position: "absolute",
          left: CONTENT_X,
          top: FOOTER_Y,
          opacity: footerAnim,
          fontFamily: FONT_STACKS.mono,
          fontSize: 18,
          letterSpacing: "0.04em",
          color: accent,
        }}
      >
        {normalizedHandle}
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: FOOTER_Y,
          opacity: footerAnim,
          fontFamily: FONT_STACKS.mono,
          fontSize: 16,
          letterSpacing: "0.16em",
          color: MUTED,
          textTransform: "uppercase",
        }}
      >
        {`# ${dropNumber} · DROP / 01`}
      </div>
    </AbsoluteFill>
  );
};
