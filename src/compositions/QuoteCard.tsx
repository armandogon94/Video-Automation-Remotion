import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { QuoteCardProps } from "./schemas";
import { Caption } from "../components/Caption";

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  audioUrl,
  wordTimings,
  backgroundColor,
  quoteColor,
  authorColor,
  fontFamily,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  // Quote mark animation
  const quoteMarkScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Quote text fade in
  const textOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Author slide up
  const authorY = interpolate(frame, [40, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative line
  const lineWidth = interpolate(frame, [25, 55], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 120px",
        }}
      >
        {/* Large quote mark */}
        <div
          style={{
            fontSize: 200,
            color: `${authorColor}33`,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            transform: `scale(${quoteMarkScale})`,
            marginBottom: -60,
            alignSelf: "flex-start",
            marginLeft: 40,
          }}
        >
          {"\u201C"}
        </div>

        {/* Quote text */}
        <div
          style={{
            fontSize: 48,
            color: quoteColor,
            fontFamily,
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.5,
            opacity: textOpacity,
            maxWidth: width * 0.7,
          }}
        >
          {quote}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: authorColor,
            borderRadius: 2,
            margin: "30px 0",
          }}
        />

        {/* Author */}
        <div
          style={{
            fontSize: 32,
            color: authorColor,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            opacity: authorOpacity,
            transform: `translateY(${authorY}px)`,
          }}
        >
          {author}
        </div>
      </AbsoluteFill>

      {/* Captions */}
      <Caption
        wordTimings={wordTimings}
        style={captions}
        containerWidth={width}
      />
    </AbsoluteFill>
  );
};
