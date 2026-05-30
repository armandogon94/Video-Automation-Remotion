/**
 * PhoneContent — iPhone bezel + messaging-app body for the MacWindow family.
 *
 * Sourced from the Carlos `DX0U2rZRBYY` frame-05 "iPhone + WhatsApp" look:
 * tall rounded-rect bezel with a notch, status bar (time / signal / battery),
 * and a sequence of staggered message bubbles arriving in order. Uses
 * `staggerEntry` for the per-bubble entrance so later messages arrive faster
 * (matches the Wave-4 accelerating-cascade default).
 *
 * Note: the parent MacWindow's chrome (traffic lights / title bar) does NOT
 * render when variant === "phone". The phone IS the window.
 */
import React from "react";
import { FONT_STACKS, getPalette, type PaletteMode } from "../../brand";
import { staggerEntry } from "../../animation";
import { interpolate } from "remotion";

export type PhoneApp = "whatsapp" | "imessage" | "telegram";

export interface PhoneContact {
  name: string;
  /** Optional avatar URL (rendered as 36×36 circle). */
  avatar?: string;
  /** Optional status line (e.g. "online", "last seen today at 14:32"). */
  status?: string;
}

export interface PhoneMessage {
  from: "me" | "them";
  text: string;
  /** Optional timestamp (e.g. "14:32"). */
  time?: string;
  /** Optional read-receipt ticks. */
  ticks?: "✓" | "✓✓";
}

export interface PhoneContentProps {
  app: PhoneApp;
  contact: PhoneContact;
  /** Status-bar time (e.g. "14:32"). */
  time: string;
  messages: PhoneMessage[];
  /** Current frame (passed in so the component is pure). */
  frame: number;
  /** Composition FPS. */
  fps: number;
  /** Width of the entire phone bezel in px. Default 420. */
  width?: number;
  /** Height of the entire phone bezel in px. Default 880. */
  height?: number;
  /** Palette mode of the parent — bezel adapts to true-black/cream/etc. */
  paletteMode?: PaletteMode;
  /** Frames between message arrivals. Default 12 (~400ms at 30fps). */
  staggerFrames?: number;
  /** Start-frame for the first message arrival. Default 0. */
  baseStartFrame?: number;
}

/** App-specific accent colors. */
const APP_THEMES = {
  whatsapp: {
    headerBg: "#075E54",
    headerText: "#FFFFFF",
    chatBg: "#ECE5DD",
    bubbleMe: "#DCF8C6",
    bubbleMeText: "#1A1A1A",
    bubbleThem: "#FFFFFF",
    bubbleThemText: "#1A1A1A",
    timeColor: "#7A8794",
    ticksColor: "#34B7F1",
  },
  imessage: {
    headerBg: "#F2F2F2",
    headerText: "#1A1A1A",
    chatBg: "#FFFFFF",
    bubbleMe: "#0B84FE",
    bubbleMeText: "#FFFFFF",
    bubbleThem: "#E9E9EB",
    bubbleThemText: "#1A1A1A",
    timeColor: "#8A8A8A",
    ticksColor: "#8A8A8A",
  },
  telegram: {
    headerBg: "#517DA2",
    headerText: "#FFFFFF",
    chatBg: "#D9E0E6",
    bubbleMe: "#E1FFC7",
    bubbleMeText: "#1A1A1A",
    bubbleThem: "#FFFFFF",
    bubbleThemText: "#1A1A1A",
    timeColor: "#7A8794",
    ticksColor: "#34A1E0",
  },
} as const;

export const PhoneContent: React.FC<PhoneContentProps> = ({
  app,
  contact,
  time,
  messages,
  frame,
  fps,
  width = 420,
  height = 880,
  paletteMode = "cream",
  staggerFrames = 12,
  baseStartFrame = 0,
}) => {
  const theme = APP_THEMES[app];
  const palette = getPalette(paletteMode);

  // Bezel color — true-black palette = phone disappears into the void.
  const bezelColor = paletteMode === "true-black" ? "#1C1C1E" : "#0A0A0A";
  const bezelOuterShadow =
    paletteMode === "true-black"
      ? "0 0 0 1px #1C1C1E"
      : `0 18px 48px ${palette.accentShadow}`;

  const bezelRadius = 56;
  const screenRadius = 40;
  const bezelPadding = 12;
  const screenWidth = width - bezelPadding * 2;
  const screenHeight = height - bezelPadding * 2;

  return (
    <div
      style={{
        width,
        height,
        background: bezelColor,
        borderRadius: bezelRadius,
        boxShadow: bezelOuterShadow,
        padding: bezelPadding,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: theme.chatBg,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Notch — pill slot at top center */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 26,
            background: "#0A0A0A",
            borderRadius: 14,
            zIndex: 10,
          }}
        />

        {/* Status bar — time / signal / battery */}
        <div
          style={{
            height: 36,
            minHeight: 36,
            background: theme.headerBg,
            color: theme.headerText,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_STACKS.sans,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{time}</span>
          <span style={{ opacity: 0.85 }}>5G  100%</span>
        </div>

        {/* App header — avatar + contact name + status */}
        <div
          style={{
            background: theme.headerBg,
            color: theme.headerText,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: FONT_STACKS.sans,
            borderBottom: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: contact.avatar
                ? `center / cover no-repeat url("${contact.avatar}")`
                : "rgba(255,255,255,0.25)",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {contact.name}
            </span>
            {contact.status ? (
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                {contact.status}
              </span>
            ) : null}
          </div>
        </div>

        {/* Messages list */}
        <div
          style={{
            flex: 1,
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
            fontFamily: FONT_STACKS.sans,
          }}
        >
          {messages.map((msg, i) => {
            const enterFrame = staggerEntry({
              index: i,
              baseStartFrame,
              staggerFrames,
              accelerate: true,
            });
            const opacity = interpolate(
              frame,
              [enterFrame, enterFrame + Math.round(fps * 0.2)],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const translateY = interpolate(
              frame,
              [enterFrame, enterFrame + Math.round(fps * 0.25)],
              [10, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );

            const isMe = msg.from === "me";
            const bubbleBg = isMe ? theme.bubbleMe : theme.bubbleThem;
            const bubbleColor = isMe ? theme.bubbleMeText : theme.bubbleThemText;
            const align = isMe ? "flex-end" : "flex-start";
            const radius = isMe
              ? "16px 16px 4px 16px"
              : "16px 16px 16px 4px";

            return (
              <div
                key={i}
                style={{
                  alignSelf: align,
                  maxWidth: "78%",
                  background: bubbleBg,
                  color: bubbleColor,
                  borderRadius: radius,
                  padding: "8px 12px",
                  fontSize: 14,
                  lineHeight: 1.35,
                  boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span>{msg.text}</span>
                {msg.time || msg.ticks ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      fontSize: 11,
                      color: theme.timeColor,
                    }}
                  >
                    {msg.time ? <span>{msg.time}</span> : null}
                    {msg.ticks ? (
                      <span style={{ color: theme.ticksColor }}>
                        {msg.ticks}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
