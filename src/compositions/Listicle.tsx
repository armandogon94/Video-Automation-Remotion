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
import type { ListicleProps } from "./schemas";
import { GradientBackground } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { Caption } from "../components/Caption";

const ListItem: React.FC<{
  number: number;
  title: string;
  description: string;
  accentColor: string;
  textColor: string;
}> = ({ number, title, description, accentColor, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 15 } });
  const x = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 30,
        opacity,
        transform: `translateX(${x}px)`,
        maxWidth: "80%",
      }}
    >
      {/* Number circle */}
      <div
        style={{
          width: 80,
          height: 80,
          minWidth: 80,
          borderRadius: "50%",
          backgroundColor: accentColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 36,
          fontWeight: 800,
          color: "#000000",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {number}
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: textColor,
            fontFamily: "Inter, sans-serif",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 28,
              color: `${textColor}aa`,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export const Listicle: React.FC<ListicleProps> = ({
  title,
  items,
  audioUrl,
  wordTimings,
  backgroundColor,
  gradientTo,
  accentColor,
  textColor,
  secondsPerItem,
  captions,
}) => {
  const { fps, width } = useVideoConfig();
  const framesPerItem = secondsPerItem * fps;

  // Title takes first 2 seconds
  const titleFrames = 2 * fps;

  return (
    <AbsoluteFill>
      <GradientBackground from={backgroundColor} to={gradientTo} />

      {audioUrl && (
        <Audio src={audioUrl.startsWith("http") ? audioUrl : staticFile(audioUrl)} />
      )}

      {/* Title sequence */}
      <Sequence from={0} durationInFrames={titleFrames}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <AnimatedText
            text={title}
            fontSize={64}
            color={textColor}
          />
        </AbsoluteFill>
      </Sequence>

      {/* List items */}
      {items.map((item, i) => (
        <Sequence
          key={i}
          from={titleFrames + i * framesPerItem}
          durationInFrames={framesPerItem}
        >
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: "0 80px",
            }}
          >
            <ListItem
              number={item.number}
              title={item.title}
              description={item.description}
              accentColor={accentColor}
              textColor={textColor}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Captions */}
      <Caption
        wordTimings={wordTimings}
        style={captions}
        containerWidth={width}
      />
    </AbsoluteFill>
  );
};
