/**
 * AbhiCodeDiff — replica of abhishek.devini's "code-diff" / code-editor scene.
 * FOREGROUND ONLY: the shared AbhiBackground (LIGHT-mesh by default, also DARK)
 * is mounted separately by the host AbhiScene9x16, so this renders transparent.
 *
 * Source ground-truth: DYUcj5iPAxL 37.0–41.0s (LIGHT mesh, indigo accent #6E78F0).
 * A dark macOS code-editor card floats centered: top chrome = 3 traffic-light dots
 * + `src/ReelStack.tsx` filename tab + `REACT · TS` badge (right). Below, a
 * line-number gutter (1…N) and syntax-highlighted code that REVEALS line-by-line
 * (~4f/row) with a block caret on the newest line. A diff variant tints `+` added
 * rows green and `-` removed rows red (with a left rail), so the same card serves
 * the literal "code diff" beat. A bottom two-tone headline ("Built on Remotion",
 * accent on the payoff word) + mono sub-label rises after the code lands.
 *
 * Choreography:
 *   • Kicker pill fades + drops from y−16px over f1–6; accent dot ignites f4.
 *   • Editor card scales 0.96→1 + fades up (+28px) over ~10f from ~f8.
 *   • Code rows reveal top-down ~4f/row (gutter number + row tint + text), each
 *     fading + sliding 8px; a block caret blinks on the newest revealed row.
 *   • Diff rows: removed (−) red-tinted, added (+) green-tinted, with a wipe-in
 *     left rail 2f after the row lands.
 *   • Bottom headline rises word-group by word-group after the last row reveals;
 *     the accent clause tint-sweeps white→accent L→R over ~8f. Mono sub-label
 *     fades up under it.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = (spec/100)*1080,
 * i.e. specPx@720 × 1.5. TS strict: no any/!. Zod v4: "" sentinel, no reflection.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { FONT_STACKS } from "../../../brand";

/** "" sentinel = "caller did not override" (avoids zod reflection on defaults). */
const S = "";

/** Token kinds → syntax colors (editor theme). */
const tokenKindEnum = z.enum([
  "plain",
  "keyword",
  "string",
  "func",
  "type",
  "comment",
  "number",
  "tag",
  "punct",
]);
export type AbhiCodeDiffTokenKind = z.infer<typeof tokenKindEnum>;

/** A single inline token: text + kind. */
const tokenSchema = z.object({
  t: z.string().default(""),
  k: tokenKindEnum.default("plain"),
});

/** A code row: indent (# of 2-space steps), diff flavor, and tokens. */
const rowSchema = z.object({
  /** Indentation depth (each step = ~2 mono chars). */
  indent: z.number().default(0),
  /** Diff status: "" none, "add" green +, "del" red −, "ctx" dim context. */
  diff: z.enum(["", "add", "del", "ctx"]).default(""),
  /** Inline tokens making up the line (left→right). */
  tokens: z.array(tokenSchema).default([]),
});

export const abhiCodeDiffSchema = z.object({
  /** Single accent color — tracks the topic brand. Default Anthropic orange. */
  accentColor: z.string().default("#FD9B00"),
  /** Background family this scene sits over (drives ink + sub-label color). */
  mode: z.enum(["dark", "light"]).default("light"),
  /** Mono kicker pill text (UPPERCASE). */
  kicker: z.string().default("FOUNDATION"),
  /** Editor filename tab (left of the chrome bar). */
  fileName: z.string().default("src/ReelStack.tsx"),
  /** Right-aligned language/format badge in the chrome bar. */
  langBadge: z.string().default("REACT · TS"),
  /** Code rows, revealed top-down. */
  rows: z
    .array(rowSchema)
    .default([
      {
        indent: 0,
        diff: "",
        tokens: [
          { t: "import", k: "keyword" },
          { t: " { ", k: "punct" },
          { t: "Audio, Sequence", k: "plain" },
          { t: " } ", k: "punct" },
          { t: "from", k: "keyword" },
          { t: " ", k: "plain" },
          { t: '"remotion"', k: "string" },
          { t: ";", k: "punct" },
        ],
      },
      { indent: 0, diff: "", tokens: [] },
      {
        indent: 0,
        diff: "",
        tokens: [
          { t: "// whisper-locked beats · 1080×1920 · 30fps", k: "comment" },
        ],
      },
      {
        indent: 0,
        diff: "",
        tokens: [
          { t: "export const", k: "keyword" },
          { t: " ReelStack ", k: "plain" },
          { t: "= () => (", k: "punct" },
        ],
      },
      {
        indent: 1,
        diff: "del",
        tokens: [
          { t: "<Sequence", k: "tag" },
          { t: " durationInFrames", k: "type" },
          { t: "={", k: "punct" },
          { t: "900", k: "number" },
          { t: "}>", k: "punct" },
        ],
      },
      {
        indent: 1,
        diff: "add",
        tokens: [
          { t: "<Sequence", k: "tag" },
          { t: " durationInFrames", k: "type" },
          { t: "={", k: "punct" },
          { t: "1740", k: "number" },
          { t: "}>", k: "punct" },
        ],
      },
      {
        indent: 2,
        diff: "add",
        tokens: [
          { t: "<Hook ", k: "tag" },
          { t: "/> ", k: "punct" },
          { t: "<Reveal ", k: "tag" },
          { t: "/> ", k: "punct" },
          { t: "<Proof ", k: "tag" },
          { t: "/>", k: "punct" },
        ],
      },
      {
        indent: 1,
        diff: "",
        tokens: [{ t: "</Sequence>", k: "tag" }],
      },
      {
        indent: 0,
        diff: "",
        tokens: [{ t: ");", k: "punct" }],
      },
    ]),
  /** Bottom headline — ink words that lead the payoff. "" hides the headline. */
  captionPre: z.string().default("Built on"),
  /** Bottom headline — the ONE accent clause (tint-sweeps white→accent). */
  captionAccent: z.string().default("Remotion"),
  /** Mono sub-label under the headline (UPPERCASE-ish). "" hides it. */
  subLabel: z.string().default("REACT · TYPESCRIPT · 30 FPS"),
});
export type AbhiCodeDiffProps = z.infer<typeof abhiCodeDiffSchema>;
type Row = z.infer<typeof rowSchema>;
type Token = z.infer<typeof tokenSchema>;

// ── Editor surface colors (sampled from source) ──
const CARD_FILL = "#1B1A23"; // editor body
const CARD_CHROME = "#221F27"; // top chrome bar
const CARD_EDGE = "rgba(255,255,255,0.08)";
const GUTTER = "#5B5A66"; // line-number grey
const DOT_RED = "#F86C58";
const DOT_AMBER = "#F9B831";
const DOT_GREEN = "#12B336";

// Syntax theme (editor-on-dark).
const SYNTAX: Record<AbhiCodeDiffTokenKind, string> = {
  plain: "#E6E4EC",
  keyword: "#B6A6EC", // purple
  string: "#E6915A", // warm orange
  func: "#7FB2F0",
  type: "#79C0C8",
  comment: "#6E6C7A",
  number: "#E6915A",
  tag: "#7FB2F0",
  punct: "#9B98A6",
};

// Diff row tints + rails.
const DIFF_ADD_BG = "rgba(56,190,118,0.12)";
const DIFF_ADD_RAIL = "#38BE76";
const DIFF_DEL_BG = "rgba(232,90,84,0.12)";
const DIFF_DEL_RAIL = "#E85A54";

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(253,155,0,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiCodeDiff: React.FC<Partial<AbhiCodeDiffProps>> = (props) => {
  const p = abhiCodeDiffSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 720→1080 scale factor for spec measures.
  const k = width / 720;
  const px = (specPx720: number) => specPx720 * k;

  const accent = p.accentColor;
  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const subInk = isDark ? "#9A9AA0" : "#6A6676";
  const kickerInk = isDark ? "#C8C8CC" : "#3A3742";

  // ── Editor card geometry (centered; ~82% wide, mid-frame) ──
  const cardW = px(592); // ≈ 82% of 720 → 888px @1080
  const cardLeft = (width - cardW) / 2;
  const cardTop = px(360);

  // ── Card entrance: scale 0.96→1 + fade up, ~8f from f3 (lands fast, like
  //    the source where the editor is already present + typing by ~0.08 of the clip) ──
  const CARD_START = 3;
  const cardSpring = spring({
    frame: frame - CARD_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 140 },
    durationInFrames: 8,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const cardRise = interpolate(cardSpring, [0, 1], [px(28), 0]);

  // ── Code rows reveal top-down ~3f/row right after the card lands ──
  const ROWS_START = CARD_START + 6; // ~f9 (line 1 typing by ~0.08 of a 4s clip)
  const ROW_STEP = 3;
  const rows = p.rows;
  // Index of the most-recently revealed row (for the block caret).
  const lastRevealed = Math.max(
    -1,
    Math.min(rows.length - 1, Math.floor((frame - ROWS_START) / ROW_STEP)),
  );
  const allRevealed = lastRevealed >= rows.length - 1;
  const lastRowStart = ROWS_START + (rows.length - 1) * ROW_STEP;

  // Block caret blinks ~15f cycle; sits on the newest revealed row.
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  // Mono row metrics (editor body).
  const codeSize = px(18);
  const rowH = px(30);
  const gutterW = px(34);
  const indentPx = px(15); // ~2 mono chars per indent step

  // ── Bottom headline rises after the code finishes (only if provided) ──
  const hasCaption = p.captionPre.trim() !== S || p.captionAccent.trim() !== S;
  const hasSub = p.subLabel.trim() !== S;
  const CAP_START = Math.max(ROWS_START + 12, lastRowStart + 4);
  const preWords = p.captionPre.trim() === S ? [] : p.captionPre.split(" ");
  const CAP_STEP = 5;

  // Accent clause tint-sweep white→accent L→R over ~8f after it rises.
  const accentRiseStart = CAP_START + preWords.length * CAP_STEP;
  const accRise = spring({
    frame: frame - accentRiseStart,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const accY = interpolate(accRise, [0, 1], [px(12), 0]);
  const accOpacity = interpolate(
    frame,
    [accentRiseStart, accentRiseStart + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const sweepStart = accentRiseStart + 3;
  const sweep = interpolate(frame, [sweepStart, sweepStart + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Sub-label fade up after the headline.
  const SUB_START = accentRiseStart + 8;
  const subProg = spring({
    frame: frame - SUB_START,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 150 },
    durationInFrames: 8,
  });
  const subY = interpolate(subProg, [0, 1], [px(10), 0]);
  const subOpacity = interpolate(frame, [SUB_START, SUB_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionTop = cardTop + px(20) + rowH * rows.length + px(96);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker pill (centered, mono, accent dot) ── */}
      <KickerPill frame={frame} fps={fps} px={px} accent={accent} text={p.kicker} ink={kickerInk} isDark={isDark} />

      {/* ── Editor card ── */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          opacity: cardOpacity,
          transform: `translateY(${cardRise}px) scale(${cardScale})`,
          transformOrigin: "50% 35%",
          borderRadius: px(16),
          background: CARD_FILL,
          border: `1px solid ${CARD_EDGE}`,
          boxShadow: `0 ${px(26)}px ${px(72)}px ${hexA("#000000", isDark ? 0.55 : 0.28)}, 0 0 ${px(
            60,
          )}px ${hexA(accent, 0.07)}`,
          overflow: "hidden",
        }}
      >
        {/* Chrome bar: traffic-light dots + filename tab + lang badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: px(9),
            height: px(40),
            padding: `0 ${px(18)}px`,
            background: CARD_CHROME,
            borderBottom: `1px solid ${hexA("#000000", 0.3)}`,
          }}
        >
          <Dot px={px} color={DOT_RED} />
          <Dot px={px} color={DOT_AMBER} />
          <Dot px={px} color={DOT_GREEN} />
          <span
            style={{
              marginLeft: px(14),
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: px(14),
              letterSpacing: "0.02em",
              color: "#B7B5C2",
            }}
          >
            {p.fileName}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: FONT_STACKS.mono,
              fontWeight: 600,
              fontSize: px(11.5),
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#76747F",
            }}
          >
            {p.langBadge}
          </span>
        </div>

        {/* Code body — fixed min-height so the dark editor panel is always a
            solid near-black block (like the source), even before rows reveal. */}
        <div
          style={{
            padding: `${px(16)}px 0 ${px(22)}px 0`,
            minHeight: rowH * rows.length + px(38),
            fontFamily: FONT_STACKS.monoCode,
            fontSize: codeSize,
            lineHeight: 1,
          }}
        >
          {rows.map((row, i) => (
            <CodeRow
              key={i}
              row={row}
              index={i}
              frame={frame}
              px={px}
              startFrame={ROWS_START + i * ROW_STEP}
              rowH={rowH}
              gutterW={gutterW}
              indentPx={indentPx}
              codeSize={codeSize}
              isNewest={i === lastRevealed}
              caretOn={caretOn}
              allRevealed={allRevealed}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom two-tone headline + mono sub-label ── */}
      {hasCaption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Math.min(captionTop, height - px(220)),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: `0 ${px(56)}px`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_STACKS.sans,
              fontWeight: 900,
              fontSize: px(54),
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              textAlign: "center",
              maxWidth: "92%",
              overflowWrap: "break-word",
            }}
          >
            {preWords.map((w, i) => {
              const start = CAP_START + i * CAP_STEP;
              const sp = spring({
                frame: frame - start,
                fps,
                config: { damping: 200, mass: 0.7, stiffness: 150 },
                durationInFrames: 8,
              });
              const op = interpolate(frame, [start, start + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const ty = interpolate(sp, [0, 1], [px(12), 0]);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    marginRight: px(14),
                    color: ink,
                    opacity: op,
                    transform: `translateY(${ty}px)`,
                  }}
                >
                  {w}
                </span>
              );
            })}
            {p.captionAccent.trim() !== S ? (
              <span
                style={{
                  display: "inline-block",
                  position: "relative",
                  opacity: accOpacity,
                  transform: `translateY(${accY}px)`,
                }}
              >
                {/* ink base copy + accent copy wiping over it L→R */}
                <span style={{ color: ink }}>{p.captionAccent}</span>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    color: accent,
                    clipPath: `inset(0 ${100 - sweep}% 0 0)`,
                  }}
                >
                  {p.captionAccent}
                </span>
              </span>
            ) : null}
          </div>

          {hasSub ? (
            <div
              style={{
                marginTop: px(14),
                fontFamily: FONT_STACKS.mono,
                fontWeight: 600,
                fontSize: px(16),
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: subInk,
                opacity: subOpacity,
                transform: `translateY(${subY}px)`,
                textAlign: "center",
              }}
            >
              {p.subLabel}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── A single revealed code row (gutter number + diff tint + tokens + caret) ──
const CodeRow: React.FC<{
  row: Row;
  index: number;
  frame: number;
  px: (n: number) => number;
  startFrame: number;
  rowH: number;
  gutterW: number;
  indentPx: number;
  codeSize: number;
  isNewest: boolean;
  caretOn: boolean;
  allRevealed: boolean;
}> = ({
  row,
  index,
  frame,
  px,
  startFrame,
  rowH,
  gutterW,
  indentPx,
  codeSize,
  isNewest,
  caretOn,
  allRevealed,
}) => {
  const op = interpolate(frame, [startFrame, startFrame + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [startFrame, startFrame + 5], [px(8), 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const isAdd = row.diff === "add";
  const isDel = row.diff === "del";
  const isCtx = row.diff === "ctx";
  const rowBg = isAdd ? DIFF_ADD_BG : isDel ? DIFF_DEL_BG : "transparent";
  const railColor = isAdd ? DIFF_ADD_RAIL : isDel ? DIFF_DEL_RAIL : "transparent";

  // Rail wipes in 2f after the row lands.
  const railH = interpolate(
    frame,
    [startFrame + 2, startFrame + 7],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Diff sign glyph (+ / −) drawn in the gutter margin.
  const sign = isAdd ? "+" : isDel ? "−" : "";
  const signColor = isAdd ? DIFF_ADD_RAIL : DIFF_DEL_RAIL;

  // Caret sits at end of the newest revealed row while it's still the frontier.
  const showCaret = isNewest && !allRevealed ? true : isNewest && caretOn;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: rowH,
        opacity: op,
        transform: `translateY(${ty}px)`,
        background: rowBg,
      }}
    >
      {/* diff rail (wipes top→bottom) */}
      {row.diff === "add" || row.diff === "del" ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: px(3),
            height: `${railH * 100}%`,
            background: railColor,
          }}
        />
      ) : null}

      {/* gutter line number */}
      <span
        style={{
          flex: "0 0 auto",
          width: gutterW,
          textAlign: "right",
          paddingRight: px(12),
          fontFamily: FONT_STACKS.mono,
          fontSize: px(14),
          color: GUTTER,
          opacity: 0.85,
          userSelect: "none",
        }}
      >
        {index + 1}
      </span>

      {/* diff sign */}
      <span
        style={{
          flex: "0 0 auto",
          width: px(14),
          textAlign: "center",
          fontFamily: FONT_STACKS.monoCode,
          fontWeight: 700,
          fontSize: codeSize,
          color: signColor,
        }}
      >
        {sign}
      </span>

      {/* code text */}
      <span
        style={{
          paddingLeft: row.indent * indentPx + px(4),
          paddingRight: px(18),
          whiteSpace: "pre",
          opacity: isCtx ? 0.6 : 1,
        }}
      >
        {row.tokens.map((tok: Token, ti: number) => (
          <span
            key={ti}
            style={{
              color: SYNTAX[tok.k],
              fontWeight: tok.k === "keyword" || tok.k === "func" ? 600 : 500,
              fontStyle: tok.k === "comment" ? "italic" : "normal",
            }}
          >
            {tok.t}
          </span>
        ))}
        {showCaret ? (
          <span
            style={{
              display: "inline-block",
              width: px(9),
              height: codeSize,
              marginLeft: px(3),
              marginBottom: px(-2),
              background: "#E6E4EC",
              verticalAlign: "middle",
            }}
          />
        ) : null}
      </span>
    </div>
  );
};

// ── Centered kicker pill (mono, accent dot ignites) ──
const KickerPill: React.FC<{
  frame: number;
  fps: number;
  px: (n: number) => number;
  accent: string;
  text: string;
  ink: string;
  isDark: boolean;
}> = ({ frame, fps, px, accent, text, ink, isDark }) => {
  const sp = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 130 },
    durationInFrames: 6,
  });
  const op = interpolate(frame, [1, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(sp, [0, 1], [-px(16), 0]);
  const dotGlow = interpolate(frame, [4, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillBg = isDark ? hexA(accent, 0.1) : "rgba(255,255,255,0.7)";
  const pillBorder = isDark
    ? `1px solid ${hexA(accent, 0.4)}`
    : "1px solid rgba(12,12,18,0.07)";
  return (
    <div
      style={{
        position: "absolute",
        top: px(150),
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: op,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: px(10),
          padding: `${px(9)}px ${px(18)}px`,
          borderRadius: 999,
          background: pillBg,
          border: pillBorder,
          boxShadow: isDark ? `0 0 ${px(20)}px ${hexA(accent, 0.16 * dotGlow)}` : "none",
        }}
      >
        <span
          style={{
            width: px(9),
            height: px(9),
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${px(8)}px ${hexA(accent, 0.9 * dotGlow)}`,
          }}
        />
        <span
          style={{
            fontFamily: FONT_STACKS.mono,
            fontWeight: 600,
            fontSize: px(15),
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: ink,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

const Dot: React.FC<{ px: (n: number) => number; color: string }> = ({ px, color }) => (
  <span
    style={{
      width: px(11),
      height: px(11),
      borderRadius: "50%",
      background: color,
      display: "inline-block",
    }}
  />
);
