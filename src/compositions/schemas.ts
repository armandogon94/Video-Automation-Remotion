import { z } from "zod";
import { BRAND } from "../brand";

const captionStyleSchema = z.object({
  enabled: z.boolean().default(true),
  fontSize: z.number().min(12).max(120).default(36),
  color: z.string().default(BRAND.colors.textLight),
  highlightColor: z.string().default(BRAND.colors.accent),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  backgroundColor: z.string().default("rgba(15,27,45,0.75)"),
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

const watermarkSchema = z.object({
  enabled: z.boolean().default(true),
  logo: z
    .enum(["glasses", "letters", "complete", "avatar", "avatarLetters"])
    .default("avatar"),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  size: z.number().min(40).max(240).default(96),
  opacity: z.number().min(0).max(1).default(0.9),
});

export type WatermarkStyle = z.infer<typeof watermarkSchema>;

// --- Explainer Video ---
export const explainerSchema = z.object({
  title: z.string().default(""),
  script: z.string().default(""),
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default(BRAND.colors.primary),
  gradientTo: z.string().default(BRAND.colors.backgroundDark),
  accentColor: z.string().default(BRAND.colors.accent),
  textColor: z.string().default(BRAND.colors.textLight),
  fontFamily: z.string().default("Inter, sans-serif"),
  captions: captionStyleSchema.default(captionStyleSchema.parse({})),
  watermark: watermarkSchema.default(watermarkSchema.parse({})),
});
export type ExplainerProps = z.infer<typeof explainerSchema>;

// --- Talking Head ---
export const talkingHeadSchema = z.object({
  title: z.string().default(""),
  script: z.string().default(""),
  audioUrl: z.string().default(""),
  speakerImageUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default(BRAND.colors.backgroundDark),
  nameTag: z.string().default(""),
  nameTagColor: z.string().default(BRAND.colors.accent),
  captions: captionStyleSchema.default(captionStyleSchema.parse({})),
  watermark: watermarkSchema.default(watermarkSchema.parse({})),
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
  backgroundColor: z.string().default(BRAND.colors.primary),
  gradientTo: z.string().default(BRAND.colors.backgroundDark),
  accentColor: z.string().default(BRAND.colors.accent),
  textColor: z.string().default(BRAND.colors.textLight),
  secondsPerItem: z.number().default(5),
  captions: captionStyleSchema.default(captionStyleSchema.parse({})),
  watermark: watermarkSchema.default(watermarkSchema.parse({})),
});
export type ListicleProps = z.infer<typeof listicleSchema>;

// --- Tech News Flash 9x16 (impeccable editorial style: cream paper + ink-gray + warm-red) ---
// Used for news-driven vertical videos with big-typography overlays.
const techNewsOverlaySchema = z.object({
  kind: z.enum(["chip", "huge", "subtitle", "cta"]),
  text: z.string(),
  subtext: z.string().optional(),
  startSeconds: z.number(),
  endSeconds: z.number(),
  /** Diagnostic — were these times resolved from a spoken-keyword anchor, or from a hardcoded fallback? */
  anchorSource: z.enum(["keyword", "fallback", "hardcoded"]).default("hardcoded").optional(),
});
export type TechNewsOverlay = z.infer<typeof techNewsOverlaySchema>;

/** Top-of-frame section label with thin underline ("ANTHROPIC · MAY 19, 2026"). Universal
 *  house-grammar element observed on every reference creator (Carlos + DIYSmartCode). */
const breadcrumbSchema = z.object({
  text: z.string(),
  date: z.string().optional(),
});
export type Breadcrumb = z.infer<typeof breadcrumbSchema>;

export const techNewsFlashSchema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  overlays: z.array(techNewsOverlaySchema).default([]),
  /** Optional top breadcrumb. Renders the universal house-grammar label. */
  breadcrumb: breadcrumbSchema.optional(),
  /** Optional subject tool slug (e.g. "claude", "openai", "gemini"). If set, the accent
   *  color auto-shifts to that tool's brand color via getToolAccent(). */
  subjectTool: z.string().optional(),
  paperColor: z.string().default("#FAF7F2"),
  inkColor: z.string().default("#1A1A1A"),
  accentColor: z.string().default("#B33A2A"),
  mutedColor: z.string().default("#6B6760"),
  captionFontSize: z.number().min(20).max(120).default(48),
  /** Optional brand identifier (default: armando-inteligencia). Reserved for cross-brand templates. */
  brandId: z.string().optional(),
  /** When true, sequential hero chains (≥2 contiguous non-overlapping huge/subtitle/cta
   *  overlays) render via <TransitionSeries> with fade crossfades. Default false to
   *  preserve the W21 v2 visual; opt-in for new renders that want smoother flow. */
  useHeroTransitions: z.boolean().default(false),
});
export type TechNewsFlashProps = z.infer<typeof techNewsFlashSchema>;

// --- Diagram Explainer 9x16 (Carlos-inspired cream flowchart) ---
// Vertically stacked rounded-rectangle cards connected by warm-red arrows.
// Used for mechanism/flow explainers ("how X works", "the loop", "the sequence").
const diagramNodeSchema = z.object({
  title: z.string(),
  sublabel: z.string().optional(),
  /** When set, this node enters at this absolute second (seconds). Otherwise it enters in
      sequential order driven by sequenceStepSeconds in the composition. */
  enterAtSeconds: z.number().optional(),
  /** When set, the node renders in "ghosted" (faded) state past this second.
      Useful for "future / not yet active" effect. */
  ghosted: z.boolean().optional(),
});
export type DiagramNode = z.infer<typeof diagramNodeSchema>;

export const diagramExplainerSchema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default("EL FLUJO"),
  /** Optional top breadcrumb (renders above the sectionLabel). */
  breadcrumb: breadcrumbSchema.optional(),
  /** Optional subject tool slug for accent auto-tint. */
  subjectTool: z.string().optional(),
  /** Palette mode. 'cream' = editorial Bloomberg, 'dark' = Carlos cosmic editorial. */
  palette: z.enum(["cream", "dark"]).default("cream"),
  nodes: z.array(diagramNodeSchema).default([]),
  /** Seconds between consecutive node entrances when enterAtSeconds is omitted. Default 1.4s. */
  sequenceStepSeconds: z.number().min(0.3).max(10).default(1.4),
  /** Seconds before the FIRST node enters. Default 0.4. */
  firstNodeDelaySeconds: z.number().min(0).max(10).default(0.4),
  /** Per-color overrides (optional — palette defaults are usually enough). Empty string means "use palette default". */
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(44),
  /** Watermark visibility for this composition. Default off (editorial restraint). */
  showWatermark: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type DiagramExplainerProps = z.infer<typeof diagramExplainerSchema>;

// --- Quote Card 9x16 (vertical editorial pull-quote, cream/dark palette) ---
// Bloomberg Businessweek / New Yorker pull-quote treatment. Massive decorative
// quote glyphs flanking a serif italic body, with a short accent divider and a
// tracking-spaced uppercase author block underneath.
export const quoteCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  quote: z.string().default("La mejor manera de predecir el futuro es crearlo."),
  author: z.string().default("Peter Drucker"),
  authorRole: z.string().optional(),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  // Per A4 audit: the serif italic pull-quote IS the text layer. A live caption
  // strip below it forces the eye to choose between two large text blocks
  // simultaneously and one is always behind the audio. Default OFF.
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type QuoteCard9x16Props = z.infer<typeof quoteCard9x16Schema>;

// --- Big Number Hero 9x16 (massive stat-hero, DIYSmartCode HeroPricing-inspired) ---
// ONE massive figure dominates ~50% of the vertical frame. Optional kicker eyebrow
// above, subtitle line below. Supports a leading prefix ($, €) and a trailing suffix
// (×, %, B, M, ↑, ↓) rendered in accent at ~70% size. Optional count-up animation.
export const bigNumberHero9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** The big figure. Can include a suffix like "×" or "%" or "B". e.g. "15×", "+47%", "$2.5B" */
  number: z.string().default("15×"),
  /** Small uppercase eyebrow above the number. Optional. */
  kicker: z.string().optional(),
  /** One-line context line under the number. */
  subtitle: z.string().default("más barato que GPT-5"),
  /** Optional small caption under the subtitle. */
  caption: z.string().optional(),
  /** When true, animate the figure from 0 to its target value during entry. Only works for pure-numeric figures. */
  countUp: z.boolean().default(false),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type BigNumberHero9x16Props = z.infer<typeof bigNumberHero9x16Schema>;

// --- Split Webcam Screen 9x16 (midu.dev WebcamScreenshareCallout-inspired) ---
// Top 50% = webcam image, bottom 50% = screen recording, with keyword-anchored
// callout overlays floating across the seam. Use this for "I tested Tool X" reaction
// videos where the creator's face + the screen demo are both essential.
const splitCalloutSchema = z.object({
  text: z.string(),
  /** When set + found in wordTimings, replaces startSeconds with the spoken-keyword start time. */
  keyword: z.string().optional(),
  /** Used only when keyword is missing/unfound. */
  fallbackStartSeconds: z.number(),
  endSeconds: z.number(),
  position: z.enum(["seam-left", "seam-center", "seam-right"]).default("seam-center"),
  /** Diagnostic — were these times resolved from a spoken-keyword anchor, or from a fallback? */
  anchorSource: z.enum(["keyword", "fallback"]).default("fallback").optional(),
});
export type SplitCallout = z.infer<typeof splitCalloutSchema>;

export const splitWebcamScreen9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** URL or staticFile-relative path to the webcam image. Empty = render fallback block. */
  webcamImageUrl: z.string().default(""),
  /** URL or staticFile-relative path to the screen recording image. Empty = render fallback block. */
  screenImageUrl: z.string().default(""),
  callouts: z.array(splitCalloutSchema).default([]),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type SplitWebcamScreen9x16Props = z.infer<typeof splitWebcamScreen9x16Schema>;

// --- Tweet Card Hero 9x16 (bilawal.ai TweetCardOverlay-inspired) ---
// Composed tweet card sitting on a pure-black hero zone above a screen-recording artifact.
// Use for "authority signal + product demo" videos where someone's tweet/post is the hook.
// Optional small face-cam corner inset on the artifact zone.
const tweetCardContentSchema = z.object({
  /** Display name (e.g. "Bilawal Sidhu"). */
  name: z.string(),
  /** Handle WITHOUT the @ (we add it). */
  handle: z.string(),
  /** Optional avatar image URL or staticFile-relative path. */
  avatarUrl: z.string().default(""),
  /** Tweet body text. Supports plain text + line breaks. */
  body: z.string(),
  /** Timestamp / context label shown on the right (e.g. "May 20"). */
  timestamp: z.string().optional(),
  /** Whether to show the verified-tick. */
  verified: z.boolean().default(false),
  /** Optional engagement metrics row. */
  replies: z.number().optional(),
  retweets: z.number().optional(),
  likes: z.number().optional(),
});
export type TweetCardContent = z.infer<typeof tweetCardContentSchema>;

// Single artifact pane inside the dual-pane stack (Bilawal Pattern N1).
// One <Img> + small "INPUT" / "OUTPUT" label tag pinned top-left.
const tweetCardHeroArtifactPaneSchema = z.object({
  /** URL or staticFile-relative path to the image inside this pane. */
  src: z.string(),
  /** Optional alt text for accessibility (ignored at render — kept for parity with web). */
  altText: z.string().optional(),
  /** Small uppercase pill in the top-left corner of the pane. */
  label: z.string().default("INPUT"),
});

// Dual-pane "input → output" artifact stack, per bilawal.ai Wave-7 Batch 3
// Pattern N1 (showcase-an-AI-pipeline). Two stacked rounded rectangles below
// the tweet card — input on top, generated output on bottom.
const tweetCardHeroArtifactStackSchema = z.object({
  input: tweetCardHeroArtifactPaneSchema,
  output: tweetCardHeroArtifactPaneSchema.extend({
    label: z.string().default("OUTPUT"),
  }),
  /** Gap in pixels between the input and output rectangles. */
  gapPx: z.number().default(16),
});

export const tweetCardHero9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  tweet: tweetCardContentSchema,
  /** URL or staticFile-relative path to the screen-recording / image artifact. Empty = paper-tinted fallback block. */
  artifactImageUrl: z.string().default(""),
  /** Optional face-cam image (~180×180 circle inset, bottom-right of artifact). Empty = no inset. */
  faceCamImageUrl: z.string().default(""),
  /**
   * Optional dual-pane "input → output" stack (bilawal.ai Pattern N1). When set,
   * the single artifact zone is replaced by two stacked rounded rectangles below
   * the tweet card (input on top, output on bottom) with sequential reveal motion.
   * When undefined, the composition renders byte-identically to before.
   */
  artifactStack: tweetCardHeroArtifactStackSchema.optional(),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  /** Dark is the default (bilawal's reference is dark); pass "cream" to flip. */
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  // Per A4 audit: the tweet body IS the text layer; captions add a second moving
  // text element competing for attention right under a static text element. The
  // viewer reads neither well. Default OFF.
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type TweetCardHero9x16Props = z.infer<typeof tweetCardHero9x16Schema>;
export type TweetCardHeroArtifactPane = z.infer<typeof tweetCardHeroArtifactPaneSchema>;
export type TweetCardHeroArtifactStack = z.infer<typeof tweetCardHeroArtifactStackSchema>;

// --- Benchmark Bars 9x16 (horizontal-bar comparison chart) ---
// Vertical 1080×1920 comparison template — bars animate from 0 to widthPct sequentially.
// Useful for pricing/perf/latency races (e.g. "15× cheaper", "92% performance").
const benchmarkBarSchema = z.object({
  /** Row label on the left (e.g. "Gemini 3.2 Flash"). */
  label: z.string(),
  /** Numeric value shown on the bar (e.g. "$0.25" or "92%" or "150ms"). Display only. */
  value: z.string(),
  /** Bar fill width as a 0..1 fraction of the max bar width. */
  widthPct: z.number().min(0).max(1),
  /** Optional per-bar fill color override (e.g. accent for winner, muted for loser). Empty = use accentColor. */
  color: z.string().default(""),
});
export type BenchmarkBar = z.infer<typeof benchmarkBarSchema>;

export const benchmarkBars9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().default("Precio por millón de tokens"),
  subtitle: z.string().optional(),
  bars: z.array(benchmarkBarSchema).default([]),
  /** Source / attribution caption at the bottom of the bars zone. Optional. */
  sourceCaption: z.string().optional(),
  /** Seconds between consecutive bar entries. Default 0.3s. */
  barStaggerSeconds: z.number().min(0).max(5).default(0.3),
  /** Seconds for each bar's fill animation. Default 0.8s. */
  barAnimSeconds: z.number().min(0.1).max(5).default(0.8),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type BenchmarkBars9x16Props = z.infer<typeof benchmarkBars9x16Schema>;

// --- Layer Card Stack 9x16 (simonhoiberg LayerCardStack-inspired) ---
// 2–4 white rounded cards stacked vertically with single-accent pill badges,
// on a glassmorphic palette-tinted backdrop. Staggered fade-up entrance.
const layerCardSchema = z.object({
  badge: z.string().optional(),
  headline: z.string(),
  body: z.string().default(""),
  icon: z.string().optional(),
});
export type LayerCard = z.infer<typeof layerCardSchema>;

export const layerCardStack9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  cards: z.array(layerCardSchema).default([]),
  /** Seconds between consecutive card entries. Default 0.4s. */
  cardStaggerSeconds: z.number().min(0.05).max(5).default(0.4),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type LayerCardStack9x16Props = z.infer<typeof layerCardStack9x16Schema>;

// --- Terminal Command 9x16 (simulated shell session, JetBrains Mono + ANSI palette) ---
// macOS-style window chrome holds a stream of typewritten commands + flushed outputs.
// Per R1 research: JetBrains Mono, Tokyo Night ANSI, ❯ Starship prompt, 530ms block-cursor,
// slice-based typewriter (never per-char opacity).
const terminalLineSchema = z.object({
  prompt: z.string().default("$"),
  command: z.string().default(""),
  output: z.array(z.string()).default([]),
  kind: z.enum(["command", "output", "error", "success"]).default("command"),
});
export type TerminalLine = z.infer<typeof terminalLineSchema>;

export const terminalCommand9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  windowTitle: z.string().default("zsh — claude-code · 80×24"),
  lines: z.array(terminalLineSchema).default([]),
  /** Typewriter speed for the command typing phase. Default 35 char/s. */
  charsPerSecond: z.number().min(5).max(200).default(35),
  /** Pause between a command finishing typing and its output flushing in. Default 0.4s. */
  outputDelaySeconds: z.number().min(0).max(5).default(0.4),
  /** When true, command-name keywords (npm/git/claude/etc.) are tinted accent. */
  ansiAccent: z.boolean().default(true),
  fontSize: z.number().min(16).max(60).default(30),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  /** Terminals look more native on dark. */
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type TerminalCommand9x16Props = z.infer<typeof terminalCommand9x16Schema>;

// --- Neural Network 9x16 (animated NN diagram, layers + edges + propagating activations) ---
// Per R3 research: SVG-rendered (no SSR-incompatible libs), deterministic pulse propagation.
export const neuralNetwork9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  /** Number of nodes in each layer. Length 2-6. Default [4, 6, 6, 4]. */
  layers: z.array(z.number().int().min(1).max(20)).default([4, 6, 6, 4]),
  /** Optional layer labels. Length should match layers. */
  layerLabels: z.array(z.string()).default([]),
  /** Time before the first activation wave fires. Default 0.5s. */
  firstWaveDelaySeconds: z.number().min(0).max(10).default(0.5),
  /** Time between consecutive activation waves. Default 0.9s. */
  waveIntervalSeconds: z.number().min(0.2).max(5).default(0.9),
  /** Time for a pulse to traverse one edge. Default 0.4s. */
  pulsePropagateSeconds: z.number().min(0.1).max(3).default(0.4),
  /** Show layer labels above each column. Default true. */
  showLayerLabels: z.boolean().default(true),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  showCaptions: z.boolean().default(false),
  brandId: z.string().optional(),
});
export type NeuralNetwork9x16Props = z.infer<typeof neuralNetwork9x16Schema>;

// --- Faux Product UI 9x16 (Bilawal V3 N4 — "I built a tool" Anduril-Lattice HUD) ---
// Full-frame near-black HUD with branded masthead, left icon rail, selection brackets,
// rolling-digit data callouts, optional satellite-globe PiP, and optional waveform card.
// The whole composition is a parody of mission-control / defense-tech product UIs.

const fauxProductUiBgSchema = z.object({
  /** Relative staticFile path or absolute URL. Empty + kind:"gradient" = solid gradient. */
  src: z.string().default(""),
  kind: z.enum(["video", "image", "gradient"]).default("gradient"),
});
export type FauxProductUiBg = z.infer<typeof fauxProductUiBgSchema>;

const fauxProductUiBracketSchema = z.object({
  /** Label drawn above-left of the bracket (e.g. "TRK 12-24-A (SANTA)"). */
  label: z.string().default(""),
  /** Horizontal center of the bracket, in 1080px coordinates. Default 540 = frame center. */
  centerXpx: z.number().default(540),
  /** Vertical center of the bracket, in 1920px coordinates. Default 960 = frame center. */
  centerYpx: z.number().default(960),
  width: z.number().default(600),
  height: z.number().default(400),
});
export type FauxProductUiBracket = z.infer<typeof fauxProductUiBracketSchema>;

const fauxProductUiCalloutSchema = z.object({
  /** Short uppercase label above the value (e.g. "ALT"). */
  label: z.string(),
  /** Starting value at frame 0. */
  from: z.number(),
  /** Final value at end of composition. */
  to: z.number(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  decimals: z.number().min(0).max(6).default(0),
  /** Anchor position (top-left of the callout card) in 1080×1920 coordinates. */
  position: z.object({
    xPx: z.number(),
    yPx: z.number(),
  }),
  /** Step interval in frames for the rolling ticker. Smaller = faster scroll. */
  stepFrames: z.number().min(1).max(60).default(3),
  /** Optional jitter amplitude — adds deterministic ±N noise on top of the rolling value. */
  jitterAmplitude: z.number().min(0).max(100).default(0),
});
export type FauxProductUiCallout = z.infer<typeof fauxProductUiCalloutSchema>;

export const fauxProductUI9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  brandTitle: z.string().default("ARMANDO INTELLIGENCE"),
  classification: z.string().default("CLASSIFICATION: SECRET//NOFORN"),
  /** Timestamp shown top-right of the masthead. Empty = auto-generate at render time. */
  timestamp: z.string().default(""),
  /** Inner B-roll or background. null = solid HUD background. */
  innerBg: fauxProductUiBgSchema.nullable().default(null),
  /** Selection bracket around the target. null = no bracket. */
  bracket: fauxProductUiBracketSchema.nullable().default(null),
  /** Data callouts that tick over time. */
  callouts: z.array(fauxProductUiCalloutSchema).default([]),
  showCornerBrackets: z.boolean().default(true),
  showIconRail: z.boolean().default(true),
  showRecIndicator: z.boolean().default(true),
  showGlobeMinimap: z.boolean().default(false),
  showWaveformCard: z.boolean().default(false),
  /** Floating eyebrow chip rendered near the top of the canvas. */
  sectionLabel: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  /** Dark is the default — HUDs read on black. */
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(56),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type FauxProductUI9x16Props = z.infer<typeof fauxProductUI9x16Schema>;

// --- News Clip Citation 9x16 (Bilawal V3 N6 — press-card overlay cite) ---
// Overlay-style news-clipping cite card. Renders as a standalone composition for now,
// but designed to be composed inside other templates as an overlay later.

const newsClipSourceSchema = z.object({
  name: z.string().default("INDEPENDENT"),
  logoColor: z.string().default("#D62828"),
  logoTextColor: z.string().default("#FFFFFF"),
});
export type NewsClipSource = z.infer<typeof newsClipSourceSchema>;

const newsClipImageSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
});
export type NewsClipImage = z.infer<typeof newsClipImageSchema>;

const newsClipPullQuoteSchema = z.object({
  text: z.string(),
  attribution: z.string().default(""),
});
export type NewsClipPullQuote = z.infer<typeof newsClipPullQuoteSchema>;

export const newsClipCitation9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  source: newsClipSourceSchema.default(newsClipSourceSchema.parse({})),
  byline: z.string().default("By Andrew Buncombe · Apr 14, 2026"),
  headline: z.string().default("SECRET PASSWORDS AND CRYPTOPAYMENTS"),
  dek: z.string().default(""),
  /** Optional inline image at right edge of card. null = no image. */
  image: newsClipImageSchema.nullable().default(null),
  /** Optional pull-quote at bottom of card. null = no pull-quote. */
  pullQuote: newsClipPullQuoteSchema.nullable().default(null),
  sectionLabel: z.string().default(""),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("dark"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  /** Seconds the card takes to slide/scale in. Default 0.5s. */
  enterSeconds: z.number().min(0).max(5).default(0.5),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type NewsClipCitation9x16Props = z.infer<typeof newsClipCitation9x16Schema>;

// --- Quote Card (16:9 landscape, legacy) ---
export const quoteCardSchema = z.object({
  quote: z.string().default(""),
  author: z.string().default(""),
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  backgroundColor: z.string().default(BRAND.colors.backgroundDark),
  quoteColor: z.string().default(BRAND.colors.textLight),
  authorColor: z.string().default(BRAND.colors.accent),
  fontFamily: z.string().default("Georgia, serif"),
  captions: captionStyleSchema.default(captionStyleSchema.parse({ enabled: false })),
  watermark: watermarkSchema.default(watermarkSchema.parse({})),
});
export type QuoteCardProps = z.infer<typeof quoteCardSchema>;

// --- Testimonial Card 9x16 (Carlos pull-quote MED finding) ---
// Wraps the <TestimonialCard> molecule from src/components/InfoCards into a
// full composition: cream/dark backdrop, BrandBreadcrumb, optional section
// label chip, centered Playfair italic pull-quote with left-edge accent glow,
// optional EditorialCaption at the bottom.
const testimonialAttributionSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  brand: z.string().optional(),
});
export type TestimonialAttributionProp = z.infer<typeof testimonialAttributionSchema>;

export const testimonialCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  quote: z.string().default("This is the kind of testimonial that lands."),
  attribution: testimonialAttributionSchema.default(testimonialAttributionSchema.parse({ name: "" })),
  /** Optional brand logo path (relative to /public or absolute URL). */
  brandLogo: z.string().optional(),
  sectionLabel: z.string().default("TESTIMONIO"),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(40),
  enterSeconds: z.number().min(0).max(10).default(0.5),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type TestimonialCard9x16Props = z.infer<typeof testimonialCard9x16Schema>;

// --- Pricing Tier Card 9x16 (DIYSmart V3 N12 — masked pricing engagement hook) ---
// Up to 3 vertically stacked tier cards. Each tier has a name, a price (optionally
// masked as "???" until revealedAtSeconds), an optional feature list, and an optional
// per-tier accent color. Highlighted tier renders larger with thicker accent border.
const pricingTierSchema = z.object({
  name: z.string(),
  price: z.string(),
  /** When true, price renders as "???" until revealedAtSeconds. Engagement hook. */
  mask: z.boolean().default(false),
  revealedAtSeconds: z.number().min(0).max(60).optional(),
  features: z.array(z.string()).default([]),
  /** Per-tier accent color override. Empty = use composition accent. */
  color: z.string().default(""),
  /** Highlight this tier (larger card + thicker border + accent glow). */
  highlighted: z.boolean().default(false),
});
export type PricingTier = z.infer<typeof pricingTierSchema>;

export const pricingTierCard9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  /** Up to 3 tiers. */
  tiers: z.array(pricingTierSchema).default([]),
  sectionLabel: z.string().default("PRECIOS"),
  /** Closing thought below the tiers. */
  conclusionLine: z.string().optional(),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  enterSeconds: z.number().min(0).max(10).default(0.4),
  staggerSeconds: z.number().min(0).max(5).default(0.3),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type PricingTierCard9x16Props = z.infer<typeof pricingTierCard9x16Schema>;

// --- Locked Feature Row 9x16 (DIYSmart V3 N20 — region/tier gating informational row) ---
// Vertical stack of feature rows. Each row: lock-or-check icon + feature name +
// right-aligned colored pill modifier (e.g. "US ONLY", "PRO", "Q3 2026", "BETA").
const lockedFeatureRowItemSchema = z.object({
  feature: z.string(),
  state: z.enum(["available", "locked-region", "locked-tier", "soon", "beta"]),
  /** Modifier shown as a pill on the right. e.g. "US ONLY", "PRO", "Q3 2026", "BETA". */
  modifier: z.string().optional(),
  /** Per-row color override. Empty = use default state color. */
  color: z.string().default(""),
});
export type LockedFeatureRowItem = z.infer<typeof lockedFeatureRowItemSchema>;

export const lockedFeatureRow9x16Schema = z.object({
  audioUrl: z.string().default(""),
  wordTimings: z.array(wordTimingSchema).default([]),
  sectionLabel: z.string().default("FUNCIONES"),
  rows: z.array(lockedFeatureRowItemSchema).default([]),
  breadcrumb: breadcrumbSchema.optional(),
  subjectTool: z.string().optional(),
  palette: z.enum(["cream", "dark"]).default("cream"),
  paperColor: z.string().default(""),
  inkColor: z.string().default(""),
  accentColor: z.string().default(""),
  mutedColor: z.string().default(""),
  captionFontSize: z.number().min(20).max(120).default(38),
  enterSeconds: z.number().min(0).max(10).default(0.4),
  staggerSeconds: z.number().min(0).max(5).default(0.18),
  showCaptions: z.boolean().default(true),
  brandId: z.string().optional(),
});
export type LockedFeatureRow9x16Props = z.infer<typeof lockedFeatureRow9x16Schema>;
