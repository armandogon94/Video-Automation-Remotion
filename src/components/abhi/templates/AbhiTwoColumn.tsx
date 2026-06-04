/**
 * AbhiTwoColumn — replica of abhishek.devini's "two-column-split" scene.
 * FOREGROUND ONLY: the shared AbhiBackground (dark-grid-glow OR light-mesh) is
 * mounted separately by the host AbhiScene9x16, so this renders transparent and
 * only draws its LOCAL panel/card surfaces.
 *
 * WHAT IT IS: two side-by-side labeled panels that slide in from OPPOSITE edges to
 * meet at center — a phone/messaging mockup on the LEFT and a green-tinted terminal
 * log on the RIGHT (the canonical "Text it. Walk away." sync beat) — joined by an
 * optional dashed accent connector curve with a dot travelling along it. The LEFT
 * panel pops chat bubbles in; the RIGHT panel reveals log rows one-by-one.
 *
 * Source ground-truth: DXUzK1fCLhF 9.0–18.0s (DARK, "Text it. Walk away." — iPhone
 * mockup with orange chat bubbles LEFT + green terminal `dispatch --run` log RIGHT,
 * accent #DE6D37). SCENE-INDEX confirms 3 instances; this is the cleanest.
 *
 * Choreography (transitionVerb / STYLE-SPEC timing):
 *   • f1–6   Kicker pill fades + drops from y−16px (×1.5 → −24px); dot ignites f4.
 *   • f6–    Headline word-by-word pop (~1 word / 4f), accent clause recolored.
 *   • f14–24 Left panel slides in from −40px (×1.5 → −60px) + fades over ~10f.
 *   • f16–26 Right panel slides in from +40px (×1.5 → +60px) + fades over ~10f.
 *   • f26–   Dashed connector curve draws L→R over ~14f; the dot travels along it.
 *   • f28–   Left chat bubbles pop in (~1 / 7f, slight overshoot).
 *   • f28–   Right terminal log rows reveal one-by-one (~3f/row), last row accent.
 *   • Ambient: panels idle-bob ±2px (independent phases) the whole hold.
 *
 * Canvas 1080×1920 @30fps. STYLE-SPEC measures are % of 720w → px = pct/100*1080
 * (helper `px(specPx720)` = specPx720 × width/720).
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

/** "" sentinel = "caller did not override" (no zod reflection on defaults). */
const S = "";

export const abhiTwoColumnSchema = z.object({
  /** Single accent color — defaults to Anthropic/Claude orange. */
  accentColor: z.string().default("#DE6D37"),
  /** Background family this scene sits over (drives ink + surface colors). */
  mode: z.enum(["dark", "light"]).default("dark"),
  /** Mono kicker, UPPERCASE, centered top. "" hides it. */
  kicker: z.string().default("HERE'S THE IDEA"),
  /** Two-tone headline (centered). Words from headlineAccentFrom recolor to accent. */
  headline: z.string().default("Text it. Walk away."),
  /** Word index (0-based) where the accent coloring begins. -1 = none. */
  headlineAccentFrom: z.number().default(-1),

  // ── LEFT panel (phone / messaging mockup) ──
  /** Title shown in the phone header (next to the avatar). */
  leftTitle: z.string().default("Claude Dispatch"),
  /** Mono caption under the phone title (rendered UPPERCASE, accent dot prefix). */
  leftStatus: z.string().default("ACTIVE"),
  /** Letter shown inside the round accent avatar. First glyph is used. */
  leftAvatar: z.string().default("C"),
  /**
   * Right-aligned chat bubbles that pop in progressively (accent-filled).
   * Up to ~4 read well; extra are accepted but may crowd the phone body.
   */
  leftBubbles: z.array(z.string()).default(["…", "fix the bug"]),
  /**
   * Optional GREY left-aligned "received" reply bubble that pops in LAST under
   * the user bubbles (source: "On it. Running now."). "" hides it.
   */
  leftReply: z.string().default(""),
  /** Small caption label under the LEFT panel (mono, UPPERCASE). "" hides it. */
  leftLabel: z.string().default("YOU TEXT"),

  // ── RIGHT panel (terminal / log) ──
  /** Window crumb to the right of the traffic-light dots (mono). */
  rightCrumb: z.string().default("dispatch --run"),
  /** Log rows revealed one-by-one. The LAST row is recolored to the accent. */
  rightRows: z
    .array(z.string())
    .default(["Parsing codebase…", "Locating bug in auth.ts", "Writing fix + tests"]),
  /**
   * Optional final highlighted SUMMARY row inside the terminal, drawn in a
   * subtle boxed strip below the log rows (source: "> auth.ts — bug patched.
   * 3 tests passing."). Reveals after the last log row. "" hides it.
   */
  rightSummary: z.string().default(""),
  /** Tint the terminal card green (signature look) vs neutral slate. */
  rightGreen: z.boolean().default(true),
  /** Small caption label under the RIGHT panel (mono, UPPERCASE). "" hides it. */
  rightLabel: z.string().default("CLAUDE RUNS"),
  /**
   * Optional sans subtitle under the RIGHT panel (source: "Full tasks. In the
   * background."). When set it replaces the mono panel labels for a cleaner
   * single-caption layout. "" hides it.
   */
  caption: z.string().default(""),

  /** Draw the dashed connector curve + travelling dot between the panels. */
  showConnector: z.boolean().default(true),
});
export type AbhiTwoColumnProps = z.infer<typeof abhiTwoColumnSchema>;

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(222,109,55,${a})`;
  }
  return `rgba(${r},${g},${b},${a})`;
}

export const AbhiTwoColumn: React.FC<Partial<AbhiTwoColumnProps>> = (props) => {
  const p = abhiTwoColumnSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 720→1080 scale factor for spec measures.
  const k = width / 720;
  const px = (specPx720: number): number => specPx720 * k;

  const accent = p.accentColor;
  const isDark = p.mode === "dark";
  const ink = isDark ? "#F2F2F4" : "#0C0C12";
  const grey = isDark ? "#8A8A90" : "#5A5A66";

  // ── Surface tokens (LOCAL surfaces only — never a full background) ──
  const phoneFill = isDark ? "#0D0A10" : "#15131B";
  const phoneEdge = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.14)";
  const phoneHeaderFill = isDark ? "#181520" : "#201C29";
  const termFill = p.rightGreen ? "#16271B" : "#13141B";
  const termChrome = p.rightGreen ? "#1A2E1F" : "#1A1B22";
  const termEdgeTop = p.rightGreen
    ? "rgba(120,210,140,0.30)"
    : "rgba(255,255,255,0.10)";
  const termLogInk = p.rightGreen ? "#A7C2A8" : "#9AA0A8";

  // ── Geometry (centered headline column, then two panels below) ──
  // Phone: x≈4–27% of 720, y≈28–56% of 1280.  Terminal: x≈44–96%, y≈31–52%.
  const phoneW = px(168);
  const phoneH = px(330);
  const phoneLeft = px(28);
  const panelTop = px(380);

  const termW = px(366);
  const termLeft = px(322);
  const termTop = px(390);

  // ============================================================
  // TIMING (frames @30fps), scene-relative from frame 0, then HOLD.
  // ============================================================

  // ── Headline: word-by-word pop ~1 word / 3f, starts ~f4 (source resolves fast) ──
  const headWords = p.headline.split(" ");
  const HEAD_START = 4;
  const HEAD_STEP = 3;

  // ── Panels slide ±40px (×1.5 → ±60px) from their own edges over ~10f ──
  const LEFT_START = 14;
  const RIGHT_START = 16;
  const slideSpring = (start: number) =>
    spring({
      frame: frame - start,
      fps,
      config: { damping: 200, mass: 0.8, stiffness: 110 },
      durationInFrames: 12,
    });
  const leftSp = slideSpring(LEFT_START);
  const rightSp = slideSpring(RIGHT_START);
  const leftX = interpolate(leftSp, [0, 1], [-px(40), 0]);
  const rightX = interpolate(rightSp, [0, 1], [px(40), 0]);
  const leftOpacity = leftSp;
  const rightOpacity = rightSp;

  // ── Ambient idle bob (independent phases), continuous under the hold ──
  const settle = interpolate(frame, [RIGHT_START + 12, RIGHT_START + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leftBob = Math.sin((frame / 30) * Math.PI * 2 * 0.5) * px(2) * settle;
  const rightBob =
    Math.sin((frame / 30) * Math.PI * 2 * 0.5 + 1.6) * px(2) * settle;

  // ── Dashed connector curve draws L→R over ~14f; dot travels along it ──
  const CONN_START = 26;
  const CONN_DUR = 14;
  const connDraw = interpolate(frame, [CONN_START, CONN_START + CONN_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // ── Left chat bubbles pop in (~1 / 7f), slight overshoot ──
  const BUBBLE_START = 28;
  const BUBBLE_STEP = 7;

  // ── Right log rows reveal one-by-one (~3f/row), last row accent ──
  const ROW_START = 28;
  const ROW_STEP = 9; // rows feel deliberate in the source (~one per ~9f)

  // Connector endpoints (right edge of phone → left edge of terminal, mid-height).
  const connY = panelTop + px(72);
  const connX0 = phoneLeft + phoneW;
  const connX1 = termLeft;
  const connMidY = connY - px(34);
  // Quadratic bezier control point makes the gentle "sync" arc.
  const bezier = `M ${connX0} ${connY} Q ${(connX0 + connX1) / 2} ${connMidY} ${connX1} ${connY}`;
  // Point along the curve for the travelling dot (param t = connDraw).
  const t = connDraw;
  const cx = (connX0 + connX1) / 2;
  const dotX =
    (1 - t) * (1 - t) * connX0 + 2 * (1 - t) * t * cx + t * t * connX1;
  const dotY =
    (1 - t) * (1 - t) * connY + 2 * (1 - t) * t * connMidY + t * t * connY;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── Kicker (mono, centered, accent letter-spacing) ── */}
      {p.kicker.trim() !== S && (
        <Kicker frame={frame} fps={fps} px={px} grey={grey} text={p.kicker} />
      )}

      {/* ── Headline (two-tone, centered) ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: px(220),
          textAlign: "center",
          fontFamily: FONT_STACKS.sans,
          fontWeight: 900,
          fontSize: px(43),
          lineHeight: 0.98,
          letterSpacing: "-0.03em",
          padding: `0 ${px(44)}px`,
        }}
      >
        {headWords.map((w, i) => {
          const start = HEAD_START + i * HEAD_STEP;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 190, mass: 0.6, stiffness: 130 },
            durationInFrames: 8,
          });
          const isAccent = p.headlineAccentFrom >= 0 && i >= p.headlineAccentFrom;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: px(14),
                opacity: sp,
                transform: `translateY(${interpolate(sp, [0, 1], [px(14), 0])}px)`,
                color: isAccent ? accent : ink,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* ── Dashed connector curve + travelling dot (drawn behind panels) ──
          The dashed path is revealed L→R by a growing clip rect (keeps real
          dashes, unlike a strokeDashoffset draw which would render solid). ── */}
      {p.showConnector && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <clipPath id="abhiTwoColConnClip">
              <rect
                x={connX0}
                y={0}
                width={(connX1 - connX0) * connDraw}
                height={height}
              />
            </clipPath>
          </defs>
          <path
            d={bezier}
            fill="none"
            stroke={hexA(accent, 0.55)}
            strokeWidth={px(2)}
            strokeDasharray={`${px(7)} ${px(7)}`}
            strokeLinecap="round"
            clipPath="url(#abhiTwoColConnClip)"
          />
          {connDraw > 0.02 && connDraw < 0.995 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={px(5)}
              fill={p.rightGreen ? "#34D3A0" : accent}
              style={{
                filter: `drop-shadow(0 0 ${px(6)}px ${hexA(
                  p.rightGreen ? "#34D3A0" : accent,
                  0.8,
                )})`,
              }}
            />
          )}
        </svg>
      )}

      {/* ── LEFT panel: phone / messaging mockup ── */}
      <div
        style={{
          position: "absolute",
          left: phoneLeft,
          top: panelTop,
          width: phoneW,
          height: phoneH,
          opacity: leftOpacity,
          transform: `translate(${leftX}px, ${leftBob}px)`,
          borderRadius: px(30),
          background: phoneFill,
          border: `${px(2)}px solid ${phoneEdge}`,
          boxShadow: `0 ${px(24)}px ${px(60)}px ${hexA("#000000", 0.55)}`,
          overflow: "hidden",
        }}
      >
        {/* Notch pill */}
        <div
          style={{
            position: "absolute",
            top: px(10),
            left: "50%",
            transform: "translateX(-50%)",
            width: px(46),
            height: px(9),
            borderRadius: px(6),
            background: "rgba(0,0,0,0.6)",
          }}
        />
        {/* Header: avatar + title + status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: px(9),
            padding: `${px(30)}px ${px(14)}px ${px(12)}px`,
            background: phoneHeaderFill,
            borderBottom: `1px solid ${hexA("#000000", 0.4)}`,
          }}
        >
          <div
            style={{
              width: px(22),
              height: px(22),
              borderRadius: "50%",
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_STACKS.sans,
              fontWeight: 800,
              fontSize: px(12),
              color: "#1A0E06",
              flexShrink: 0,
            }}
          >
            {p.leftAvatar.slice(0, 1)}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: FONT_STACKS.sans,
                fontWeight: 700,
                fontSize: px(11.5),
                color: ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.leftTitle}
            </div>
            {p.leftStatus.trim() !== S && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(4),
                  marginTop: px(2),
                }}
              >
                <span
                  style={{
                    width: px(5),
                    height: px(5),
                    borderRadius: "50%",
                    background: accent,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_STACKS.mono,
                    fontWeight: 600,
                    fontSize: px(7.5),
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: grey,
                  }}
                >
                  {p.leftStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat bubbles (right-aligned, pop in progressively) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: px(8),
            padding: `${px(14)}px ${px(12)}px`,
          }}
        >
          {p.leftBubbles.map((b, i) => {
            const start = BUBBLE_START + i * BUBBLE_STEP;
            const sp = spring({
              frame: frame - start,
              fps,
              config: { damping: 12, mass: 0.5, stiffness: 150 },
              durationInFrames: 12,
            });
            const sc = interpolate(sp, [0, 1], [0.6, 1]);
            return (
              <div
                key={i}
                style={{
                  alignSelf: "flex-end",
                  opacity: sp,
                  transform: `scale(${sc})`,
                  transformOrigin: "100% 50%",
                  maxWidth: "78%",
                  padding: `${px(7)}px ${px(11)}px`,
                  borderRadius: `${px(13)}px ${px(13)}px ${px(4)}px ${px(13)}px`,
                  background: accent,
                  color: "#1B0E05",
                  fontFamily: FONT_STACKS.sans,
                  fontWeight: 600,
                  fontSize: px(11),
                  lineHeight: 1.25,
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  boxShadow: `0 ${px(4)}px ${px(14)}px ${hexA(accent, 0.4)}`,
                }}
              >
                {b}
              </div>
            );
          })}

          {/* Grey received reply bubble (left-aligned), pops in last */}
          {p.leftReply.trim() !== S &&
            (() => {
              const start = BUBBLE_START + p.leftBubbles.length * BUBBLE_STEP;
              const sp = spring({
                frame: frame - start,
                fps,
                config: { damping: 12, mass: 0.5, stiffness: 150 },
                durationInFrames: 12,
              });
              const sc = interpolate(sp, [0, 1], [0.6, 1]);
              return (
                <div
                  style={{
                    alignSelf: "flex-start",
                    opacity: sp,
                    transform: `scale(${sc})`,
                    transformOrigin: "0% 50%",
                    maxWidth: "78%",
                    padding: `${px(7)}px ${px(11)}px`,
                    borderRadius: `${px(13)}px ${px(13)}px ${px(13)}px ${px(4)}px`,
                    background: isDark
                      ? "rgba(255,255,255,0.09)"
                      : "rgba(255,255,255,0.12)",
                    color: ink,
                    fontFamily: FONT_STACKS.sans,
                    fontWeight: 500,
                    fontSize: px(10.5),
                    lineHeight: 1.25,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {p.leftReply}
                </div>
              );
            })()}
        </div>
      </div>

      {/* ── RIGHT panel: green-tinted terminal / log ── */}
      <div
        style={{
          position: "absolute",
          left: termLeft,
          top: termTop,
          width: termW,
          opacity: rightOpacity,
          transform: `translate(${rightX}px, ${rightBob}px)`,
          borderRadius: px(14),
          background: termFill,
          border: `1px solid ${hexA("#000000", 0.3)}`,
          borderTop: `${px(1.5)}px solid ${termEdgeTop}`,
          boxShadow: `0 ${px(24)}px ${px(66)}px ${hexA("#000000", 0.5)}, 0 0 ${px(
            54,
          )}px ${hexA(p.rightGreen ? "#2FA74E" : accent, 0.1)}`,
          overflow: "hidden",
        }}
      >
        {/* Chrome: traffic dots + crumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: px(8),
            height: px(34),
            padding: `0 ${px(14)}px`,
            background: termChrome,
            borderBottom: `1px solid ${hexA("#000000", 0.3)}`,
          }}
        >
          <Dot px={px} color="#FF6F56" />
          <Dot px={px} color="#F4BC3E" />
          <Dot px={px} color="#2FA74E" />
          <span
            style={{
              marginLeft: px(8),
              fontFamily: FONT_STACKS.mono,
              fontSize: px(11),
              letterSpacing: "0.04em",
              color: termLogInk,
            }}
          >
            {p.rightCrumb}
          </span>
        </div>

        {/* Log body — rows reveal one-by-one, last row accent ── */}
        <div
          style={{
            minHeight: px(150),
            padding: `${px(16)}px ${px(16)}px ${px(18)}px`,
            fontFamily: FONT_STACKS.mono,
            fontSize: px(13),
            lineHeight: 1.05,
            display: "flex",
            flexDirection: "column",
            gap: px(11),
          }}
        >
          {p.rightRows.map((row, i) => {
            const start = ROW_START + i * ROW_STEP;
            const op = interpolate(frame, [start, start + 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const tx = interpolate(frame, [start, start + 5], [px(8), 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const isLast = i === p.rightRows.length - 1;
            const col = isLast ? accent : ink;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(8),
                  opacity: op,
                  transform: `translateX(${tx}px)`,
                  color: col,
                }}
              >
                <span
                  style={{
                    width: px(6),
                    height: px(6),
                    borderRadius: "50%",
                    border: `${px(1.2)}px solid ${
                      isLast ? accent : termLogInk
                    }`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row}
                </span>
              </div>
            );
          })}

          {/* Highlighted summary strip (source: "> auth.ts — bug patched…") */}
          {p.rightSummary.trim() !== S &&
            (() => {
              const start = ROW_START + p.rightRows.length * ROW_STEP + 4;
              const op = interpolate(frame, [start, start + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const sumGreen = p.rightGreen ? "#7FCF8E" : accent;
              return (
                <div
                  style={{
                    marginTop: px(3),
                    padding: `${px(7)}px ${px(9)}px`,
                    borderRadius: px(7),
                    background: p.rightGreen
                      ? "rgba(120,210,140,0.08)"
                      : hexA(accent, 0.08),
                    border: `1px solid ${
                      p.rightGreen
                        ? "rgba(120,210,140,0.18)"
                        : hexA(accent, 0.18)
                    }`,
                    color: sumGreen,
                    fontFamily: FONT_STACKS.mono,
                    fontSize: px(11),
                    opacity: op,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.rightSummary}
                </div>
              );
            })()}
        </div>
      </div>

      {/* ── RIGHT-panel sans subtitle (source: "Full tasks. In the background.") ── */}
      {p.caption.trim() !== S && (
        <div
          style={{
            position: "absolute",
            left: termLeft,
            top: termTop + px(210),
            width: termW,
            opacity: settle,
            fontFamily: FONT_STACKS.sans,
            fontWeight: 600,
            fontSize: px(15),
            letterSpacing: "-0.01em",
            color: grey,
          }}
        >
          {p.caption}
        </div>
      )}

      {/* ── Panel caption labels (mono, UPPERCASE) under each panel ── */}
      {p.leftLabel.trim() !== S && (
        <PanelLabel
          px={px}
          left={phoneLeft}
          width={phoneW}
          top={panelTop + phoneH + px(18)}
          opacity={settle}
          text={p.leftLabel}
          grey={grey}
        />
      )}
      {p.rightLabel.trim() !== S && (
        <PanelLabel
          px={px}
          left={termLeft}
          width={termW}
          top={panelTop + phoneH + px(18)}
          opacity={settle}
          text={p.rightLabel}
          grey={accent}
        />
      )}
    </AbsoluteFill>
  );
};

// ── Subcomponents ──

const Kicker: React.FC<{
  frame: number;
  fps: number;
  px: (n: number) => number;
  grey: string;
  text: string;
}> = ({ frame, fps, px, grey, text }) => {
  // Fade + drop from y−16px (×1.5 → −24px) over 6f.
  const sp = spring({
    frame: frame - 1,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 120 },
    durationInFrames: 6,
  });
  const ty = interpolate(sp, [0, 1], [-px(16), 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: px(150),
        textAlign: "center",
        opacity: sp,
        transform: `translateY(${ty}px)`,
        fontFamily: FONT_STACKS.mono,
        fontWeight: 600,
        fontSize: px(15),
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: grey,
      }}
    >
      {text}
    </div>
  );
};

const Dot: React.FC<{ px: (n: number) => number; color: string }> = ({
  px,
  color,
}) => (
  <span
    style={{
      width: px(10),
      height: px(10),
      borderRadius: "50%",
      background: color,
      display: "inline-block",
    }}
  />
);

const PanelLabel: React.FC<{
  px: (n: number) => number;
  left: number;
  width: number;
  top: number;
  opacity: number;
  text: string;
  grey: string;
}> = ({ px, left, width, top, opacity, text, grey }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      textAlign: "center",
      opacity,
      fontFamily: FONT_STACKS.mono,
      fontWeight: 600,
      fontSize: px(11),
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: grey,
    }}
  >
    {text}
  </div>
);
