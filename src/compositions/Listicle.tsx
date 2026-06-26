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
import { BrandWatermark } from "../components/BrandWatermark";

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
  watermark,
}) => {
  const { fps, width, durationInFrames } = useVideoConfig();
  const itemCount = Math.max(items.length, 1);

  // Title takes up to 2 seconds, but never more than ~30% of the clip so the
  // list always has room to play (short renders would otherwise be all-title).
  const titleFrames = Math.min(2 * fps, Math.floor(durationInFrames * 0.3));

  // Pace item reveals to fit the actual composition duration. `secondsPerItem`
  // is treated as an upper bound: on long comps each item gets its full window,
  // but on short clips the stagger compresses so EVERY item reveals in time
  // instead of stalling on item 1.
  const remainingFrames = Math.max(durationInFrames - titleFrames, 1);
  const stagger = Math.min(secondsPerItem * fps, remainingFrames / itemCount);

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

      {/* List items — staggered reveals that stack and persist so multiple
          items are on screen at once (e.g. a "Top 5" accumulating). */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 120px",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {items.map((item, i) => (
          <Sequence
            key={i}
            from={titleFrames + Math.round(i * stagger)}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <ListItem
              number={item.number}
              title={item.title}
              description={item.description}
              accentColor={accentColor}
              textColor={textColor}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Captions */}
      <Caption
        wordTimings={wordTimings}
        style={captions}
        containerWidth={width}
      />

      {/* Brand watermark */}
      <BrandWatermark style={watermark} />
    </AbsoluteFill>
  );
};
