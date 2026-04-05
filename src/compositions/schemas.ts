import { z } from "zod";

const captionStyleSchema = z.object({
  enabled: z.boolean().default(true),
  fontSize: z.number().min(12).max(120).default(36),
  color: z.string().default("#ffffff"),
  highlightColor: z.string().default("#ffd700"),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  backgroundColor: z.string().default("rgba(0,0,0,0.7)"),
});

export type CaptionStyle = z.infer<typeof captionStyleSchema>;

const wordTimingSchema = z.object({
  text: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  startSeconds: z.number(),
  endSeconds: z.number(),
});

export type WordTiming = z.infer<typeof wordTimingSchema>;

// --- Explainer Video ---
export const explainerSchema = z.object({
  title: z.string().default(""),
  script: z.string().default(""),
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default("#1a1a2e"),
  gradientTo: z.string().default("#16213e"),
  accentColor: z.string().default("#ffd700"),
  textColor: z.string().default("#ffffff"),
  fontFamily: z.string().default("Inter, sans-serif"),
  captions: captionStyleSchema.default({}),
});
export type ExplainerProps = z.infer<typeof explainerSchema>;

// --- Talking Head ---
export const talkingHeadSchema = z.object({
  title: z.string().default(""),
  script: z.string().default(""),
  audioUrl: z.string().default(""),
  speakerImageUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default("#0a0a0a"),
  nameTag: z.string().default(""),
  nameTagColor: z.string().default("#ffd700"),
  captions: captionStyleSchema.default({}),
});
export type TalkingHeadProps = z.infer<typeof talkingHeadSchema>;

// --- Listicle ---
const listItemSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string().default(""),
});

export const listicleSchema = z.object({
  title: z.string().default(""),
  items: z.array(listItemSchema).default([]),
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default("#0f0c29"),
  gradientTo: z.string().default("#302b63"),
  accentColor: z.string().default("#ffd700"),
  textColor: z.string().default("#ffffff"),
  secondsPerItem: z.number().default(5),
  captions: captionStyleSchema.default({}),
});
export type ListicleProps = z.infer<typeof listicleSchema>;

// --- Quote Card ---
export const quoteCardSchema = z.object({
  quote: z.string().default(""),
  author: z.string().default(""),
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default("#1a1a2e"),
  quoteColor: z.string().default("#ffffff"),
  authorColor: z.string().default("#ffd700"),
  fontFamily: z.string().default("Georgia, serif"),
  captions: captionStyleSchema.default({}),
});
export type QuoteCardProps = z.infer<typeof quoteCardSchema>;
