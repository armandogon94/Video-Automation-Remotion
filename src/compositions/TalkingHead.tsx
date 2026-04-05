import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { TalkingHeadProps } from "./schemas";
import { Caption } from "../components/Caption";

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  title,
  audioUrl,
  speakerImageUrl,
  wordTimings,
  backgroundColor,
  nameTag,
  nameTagColor,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  const imageScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const nameTagOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Audio */}
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Speaker image or placeholder */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {speakerImageUrl ? (
          <Img
            src={
              speakerImageUrl.startsWith("http")
                ? speakerImageUrl
                : staticFile(speakerImageUrl)
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imageScale})`,
            }}
          />
        ) : (
          // Placeholder circle
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${nameTagColor}44, ${nameTagColor}88)`,
              border: `4px solid ${nameTagColor}`,
              transform: `scale(${imageScale})`,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Gradient overlay at bottom for readability */}
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.8))",
          }}
        />
      </AbsoluteFill>

      {/* Name tag */}
      {nameTag && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 60,
            opacity: nameTagOpacity,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 4,
              height: 40,
              backgroundColor: nameTagColor,
              borderRadius: 2,
            }}
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {nameTag}
          </span>
        </div>
      )}

      {/* Title at top */}
      {title && (
        <Sequence from={0} durationInFrames={90}>
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: 42,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </span>
          </div>
        </Sequence>
      )}

      {/* Captions */}
      <Caption
        wordTimings={wordTimings}
        style={captions}
        containerWidth={width}
      />
    </AbsoluteFill>
  );
};
