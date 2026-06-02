/**
 * RevealText — a versatile text overlay with many ENTRANCE styles, used both as a
 * behind-speaker depth element (scene routes it under the foreground matte when
 * `behindSpeaker: true`) and as a foreground "text on screen" element. ONE component,
 * a `reveal` enum that swaps the entrance animation, so a single driver can fan out
 * dozens of "different ways text appears" variations.
 *
 * Reveal modes:
 *   pop          — spring scale 0.7→1.0 + fade (snappy)
 *   fade-up      — opacity 0→1 + translateY up
 *   slide-left   — slides in from the right, fades
 *   slide-up     — slides up from below
 *   scale-in     — settles down from 1.35× (zoom-in)
 *   blur-in      — de-blurs from 18px + fade
 *   typewriter   — characters reveal left→right (monospace-friendly)
 *   word-by-word — each word pops/fades in, staggered
 *   mask-wipe    — a left→right clip-path wipe reveal
 *   rise-line    — multi-line, each LINE rises + fades, staggered
 *
 * Pure Remotion (interpolate/spring) — no external deps. NEVER dead-center unless
 * `anchor:'center'` is explicitly chosen (depth hero words often want center).
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../brand";

const anchorEnum = z.enum([
  "top-left",
  "top-center",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
  "upper-third",
  "lower-third",
]);
type Anchor = z.infer<typeof anchorEnum>;

const revealEnum = z.enum([
  "pop",
  "fade-up",
  "slide-left",
  "slide-up",
  "scale-in",
  "blur-in",
  "typewriter",
  "word-by-word",
  "mask-wipe",
  "rise-line",
]);
type Reveal = z.infer<typeof revealEnum>;

const fontEnum = z.enum(["sans", "serif", "mono", "monoCode", "display"]);

export const revealTextSchema = z.object({
  /** Text. Use \n for line breaks (rise-line / multi-line modes). */
  text: z.string().default("TEXTO"),
  reveal: revealEnum.default("pop"),
  anchor: anchorEnum.default("center"),
  /** Optional single word/substring to paint in `accentColor`. */
  accent: z.string().default(""),
  accentColor: z.string().default("#5BC0E8"),
  color: z.string().default("#FFFFFF"),
  fontFamily: fontEnum.default("sans"),
  fontWeight: z.number().default(800),
  fontSize: z.number().default(120),
  lineHeight: z.number().default(1.04),
  letterSpacing: z.string().default("-0.01em"),
  uppercase: z.boolean().default(true),
  glow: z.boolean().default(false),
  glowColor: z.string().default("#5BC0E8"),
  outline: z.boolean().default(true),
  maxWidthPct: z.number().default(86),
  insetPct: z.number().default(7),
  /** Final opacity ceiling (e.g. 0.28 for a ghosted set-dressing word behind the
   *  speaker). Reveal animations multiply into this. Default 1. */
  opacityMax: z.number().default(1),
  /** Force a single non-wrapping line (macro hero word overflowing the frame). */
  noWrap: z.boolean().default(false),
  enterFrame: z.number().default(0),
  /** Animation length in frames (the reveal duration). */
  revealFrames: z.number().default(16),
  /** Per-unit stagger for typewriter/word-by-word/rise-line. */
  staggerFrames: z.number().default(3),
  holdFrames: z.number().default(9999),
  exitFrame: z.number().optional(),
});

export type RevealTextProps = z.infer<typeof revealTextSchema>;

function anchorStyle(anchor: Anchor, inset: string): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    display: "flex",
    padding: inset,
  };
  const map: Record<Anchor, React.CSSProperties> = {
    "top-left": { top: 0, left: 0, alignItems: "flex-start", justifyContent: "flex-start" },
    "top-center": { top: 0, left: 0, right: 0, alignItems: "flex-start", justifyContent: "center" },
    "top-right": { top: 0, right: 0, alignItems: "flex-start", justifyContent: "flex-end" },
    left: { top: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "flex-start" },
    center: { inset: 0, alignItems: "center", justifyContent: "center" },
    right: { top: 0, bottom: 0, right: 0, alignItems: "center", justifyContent: "flex-end" },
    "bottom-left": { bottom: 0, left: 0, alignItems: "flex-end", justifyContent: "flex-start" },
    "bottom-center": { bottom: 0, left: 0, right: 0, alignItems: "flex-end", justifyContent: "center" },
    "bottom-right": { bottom: 0, right: 0, alignItems: "flex-end", justifyContent: "flex-end" },
    "upper-third": { top: "16%", left: 0, right: 0, alignItems: "flex-start", justifyContent: "center" },
    "lower-third": { bottom: "18%", left: 0, right: 0, alignItems: "flex-end", justifyContent: "center" },
  };
  return { ...base, ...map[anchor] };
}

/** Paint the accent substring in accentColor within a line of text. */
function renderLine(line: string, accent: string, accentColor: string): React.ReactNode {
  if (!accent) return line;
  const idx = line.toLowerCase().indexOf(accent.toLowerCase());
  if (idx < 0) return line;
  return (
    <>
      {line.slice(0, idx)}
      <span style={{ color: accentColor }}>{line.slice(idx, idx + accent.length)}</span>
      {line.slice(idx + accent.length)}
    </>
  );
}

export const RevealText: React.FC<Partial<RevealTextProps>> = (props) => {
  const p = revealTextSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - p.enterFrame;

  const exit = p.exitFrame ?? p.enterFrame + p.revealFrames + p.holdFrames;
  if (frame < p.enterFrame || frame >= exit) return null;

  const text = p.uppercase ? p.text.toUpperCase() : p.text;
  const lines = text.split("\n");
  const accent = p.uppercase ? p.accent.toUpperCase() : p.accent;

  const family = FONT_STACKS[p.fontFamily] ?? FONT_STACKS.sans;
  const glow = p.glow ? `0 0 18px ${p.glowColor}cc, 0 0 36px ${p.glowColor}66` : "none";
  const outline = p.outline
    ? "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 2px 8px rgba(0,0,0,0.55)"
    : "0 2px 8px rgba(0,0,0,0.55)";
  const textShadow = [glow, outline].filter((s) => s !== "none").join(",");

  const prog = interpolate(local, [0, p.revealFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const popScale =
    0.7 +
    0.3 *
      spring({ frame: local, fps, config: { damping: 10, stiffness: 200, mass: 0.7 }, durationInFrames: p.revealFrames });

  const baseTextStyle: React.CSSProperties = {
    fontFamily: family,
    fontWeight: p.fontWeight,
    fontSize: p.fontSize,
    lineHeight: p.lineHeight,
    letterSpacing: p.letterSpacing,
    color: p.color,
    textShadow,
    margin: 0,
    maxWidth: `${p.maxWidthPct}%`,
    textAlign: p.anchor.includes("right") ? "right" : p.anchor.includes("left") ? "left" : "center",
    whiteSpace: p.noWrap ? "nowrap" : "pre-line",
  };

  // Per-mode wrapper transform/opacity applied to the whole block.
  let wrapStyle: React.CSSProperties = {};
  let inner: React.ReactNode = lines.map((l, i) => (
    <div key={i}>{renderLine(l, accent, p.accentColor)}</div>
  ));

  switch (p.reveal) {
    case "pop":
      wrapStyle = { transform: `scale(${popScale})`, opacity: interpolate(local, [0, 4], [0, 1], { extrapolateRight: "clamp" }) };
      break;
    case "fade-up":
      wrapStyle = { opacity: prog, transform: `translateY(${(1 - prog) * 48}px)` };
      break;
    case "slide-left":
      wrapStyle = { opacity: Math.min(1, prog * 1.4), transform: `translateX(${(1 - prog) * 140}px)` };
      break;
    case "slide-up":
      wrapStyle = { opacity: Math.min(1, prog * 1.4), transform: `translateY(${(1 - prog) * 90}px)` };
      break;
    case "scale-in":
      wrapStyle = { opacity: prog, transform: `scale(${1.35 - 0.35 * prog})` };
      break;
    case "blur-in":
      wrapStyle = { opacity: prog, filter: `blur(${(1 - prog) * 18}px)` };
      break;
    case "mask-wipe":
      wrapStyle = { clipPath: `inset(0 ${(1 - prog) * 100}% 0 0)` };
      break;
    case "typewriter": {
      const total = text.length;
      const shown = Math.floor(
        interpolate(local, [0, p.staggerFrames * total], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      );
      const partial = text.slice(0, shown);
      const caretOn = Math.floor(local / 8) % 2 === 0;
      inner = (
        <span>
          {partial.split("\n").map((l, i, arr) => (
            <React.Fragment key={i}>
              {renderLine(l, accent, p.accentColor)}
              {i < arr.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
          {shown < total && caretOn ? <span style={{ color: p.accentColor }}>▌</span> : null}
        </span>
      );
      break;
    }
    case "word-by-word": {
      const words = text.split(/(\s+)/); // keep spaces
      let wi = -1;
      inner = (
        <span>
          {words.map((w, i) => {
            if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
            wi += 1;
            const wl = local - wi * p.staggerFrames;
            const o = interpolate(wl, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const ty = (1 - o) * 24;
            const isAcc = accent && w.toLowerCase().includes(accent.toLowerCase());
            return (
              <span key={i} style={{ display: "inline-block", opacity: o, transform: `translateY(${ty}px)`, color: isAcc ? p.accentColor : undefined }}>
                {w}
              </span>
            );
          })}
        </span>
      );
      break;
    }
    case "rise-line":
      inner = lines.map((l, i) => {
        const ll = local - i * p.staggerFrames * 2;
        const o = interpolate(ll, [0, p.revealFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 40}px)`, overflow: "hidden" }}>
            {renderLine(l, accent, p.accentColor)}
          </div>
        );
      });
      break;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...anchorStyle(p.anchor, `${p.insetPct}%`), opacity: p.opacityMax }}>
        <div style={{ ...baseTextStyle, ...wrapStyle }}>{inner}</div>
      </div>
    </AbsoluteFill>
  );
};
