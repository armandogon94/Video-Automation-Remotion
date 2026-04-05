import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { ExplainerProps } from "./schemas";
import { GradientBackground } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { Caption } from "../components/Caption";

export const ExplainerVideo: React.FC<ExplainerProps> = ({
  title,
  script,
  audioUrl,
  wordTimings,
  backgroundColor,
  gradientTo,
  accentColor,
  textColor,
  fontFamily,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Title animation
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Accent bar animation
  const barWidth = interpolate(frame, [15, 45], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <GradientBackground from={backgroundColor} to={gradientTo} />

      {/* Audio */}
      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Title Section */}
      <Sequence from={0} durationInFrames={Math.min(durationInFrames, 9999)}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeOut,
          }}
        >
          {/* Title */}
          {title && (
            <div
              style={{
                transform: `scale(${titleScale})`,
                marginBottom: 20,
              }}
            >
              <AnimatedText
                text={title}
                fontSize={64}
                color={textColor}
                fontFamily={fontFamily}
              />
            </div>
          )}

          {/* Accent bar */}
          <div
            style={{
              width: barWidth,
              height: 4,
              backgroundColor: accentColor,
              borderRadius: 2,
              marginBottom: 30,
            }}
          />

          {/* Script text (if no audio/captions, show as static text) */}
          {script && wordTimings.length === 0 && (
            <AnimatedText
              text={script}
              delay={20}
              fontSize={32}
              color={`${textColor}cc`}
              fontFamily={fontFamily}
              style={{ maxWidth: width * 0.75, padding: "0 40px" }}
            />
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Captions overlay */}
      <Caption
        wordTimings={wordTimings}
        style={captions}
        containerWidth={width}
      />
    </AbsoluteFill>
  );
};
