import React from "react";
import { Composition, Folder, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { ExplainerVideo } from "./compositions/ExplainerVideo";
import { TalkingHead } from "./compositions/TalkingHead";
import { Listicle } from "./compositions/Listicle";
import { QuoteCard } from "./compositions/QuoteCard";
import { TechNewsFlash9x16 } from "./compositions/TechNewsFlash9x16";
import { DiagramExplainer9x16 } from "./compositions/DiagramExplainer9x16";
import { QuoteCard9x16 } from "./compositions/QuoteCard9x16";
import { BigNumberHero9x16 } from "./compositions/BigNumberHero9x16";
import { SplitWebcamScreen9x16 } from "./compositions/SplitWebcamScreen9x16";
import { TweetCardHero9x16 } from "./compositions/TweetCardHero9x16";
import { BenchmarkBars9x16 } from "./compositions/BenchmarkBars9x16";
import { LayerCardStack9x16 } from "./compositions/LayerCardStack9x16";
import { TerminalCommand9x16 } from "./compositions/TerminalCommand9x16";
import { NeuralNetwork9x16 } from "./compositions/NeuralNetwork9x16";
import { AnimatedCounter9x16, animatedCounter9x16Schema } from "./compositions/AnimatedCounter9x16";
import { AnimatedText9x16, animatedText9x16Schema } from "./compositions/AnimatedText9x16";
import { AgentThinking9x16, agentThinking9x16Schema } from "./compositions/AgentThinking9x16";
import { TokenStream9x16, tokenStream9x16Schema } from "./compositions/TokenStream9x16";
import { AttentionHeatmap9x16, attentionHeatmap9x16Schema } from "./compositions/AttentionHeatmap9x16";
import { TalkingHeadDynamic9x16, talkingHeadDynamic9x16Schema } from "./compositions/TalkingHeadDynamic9x16";
import { AnimatedTable9x16, animatedTable9x16Schema } from "./compositions/AnimatedTable9x16";
import { Sparkline9x16, sparkline9x16Schema } from "./compositions/Sparkline9x16";
import { ForceGraph9x16, forceGraph9x16Schema } from "./compositions/ForceGraph9x16";
import { KineticTypoCard9x16, kineticTypoCard9x16Schema } from "./compositions/KineticTypoCard9x16";
import { CircularLogoCarousel9x16, circularLogoCarousel9x16Schema } from "./compositions/CircularLogoCarousel9x16";
// Sprint 5 — new templates (schema lives in same .tsx file)
import { CodeDiffBeforeAfter9x16, codeDiffBeforeAfter9x16Schema } from "./compositions/CodeDiffBeforeAfter9x16";
import { TerminalBlock9x16, terminalBlock9x16Schema } from "./compositions/TerminalBlock9x16";
import { EditorBlock9x16, editorBlock9x16Schema } from "./compositions/EditorBlock9x16";
import { KineticEssay9x16, kineticEssay9x16Schema } from "./compositions/KineticEssay9x16";
import { OutroFollowCTA9x16, outroFollowCTA9x16Schema } from "./compositions/OutroFollowCTA9x16";
import { BigNumberDuel9x16, bigNumberDuel9x16Schema } from "./compositions/BigNumberDuel9x16";
import { LineChartAnnotated9x16, lineChartAnnotated9x16Schema } from "./compositions/LineChartAnnotated9x16";
import { BarChartList9x16, barChartList9x16Schema } from "./compositions/BarChartList9x16";
import { PipelineFlow9x16, pipelineFlow9x16Schema } from "./compositions/PipelineFlow9x16";
import { TitledDossierCard9x16, titledDossierCard9x16Schema } from "./compositions/TitledDossierCard9x16";
import { GeminiFrameWrapper9x16, geminiFrameWrapper9x16Schema } from "./compositions/GeminiFrameWrapper9x16";
import { CamcorderFrame9x16, camcorderFrame9x16Schema } from "./compositions/CamcorderFrame9x16";
import { KeyedFounderOverBroll9x16, keyedFounderOverBroll9x16Schema } from "./compositions/KeyedFounderOverBroll9x16";
import { GenerativeBrollWithDiegeticUI9x16, generativeBrollWithDiegeticUI9x16Schema } from "./compositions/GenerativeBrollWithDiegeticUI9x16";
import { WhiteboardScene9x16, whiteboardScene9x16Schema } from "./compositions/WhiteboardScene9x16";
import { IllustratedConcept9x16, illustratedConcept9x16Schema } from "./compositions/IllustratedConcept9x16";
import { YouTubeEndCard9x16, youTubeEndCard9x16Schema } from "./compositions/YouTubeEndCard9x16";
import { PollCTA9x16, pollCTA9x16Schema } from "./compositions/PollCTA9x16";
import { YouTubeCalloutArrows9x16, youTubeCalloutArrows9x16Schema } from "./compositions/YouTubeCalloutArrows9x16";
// Sprint 5 — new templates (schema lives in ./compositions/schemas.ts)
import { FauxProductUI9x16 } from "./compositions/FauxProductUI9x16";
import { NewsClipCitation9x16 } from "./compositions/NewsClipCitation9x16";
import { TestimonialCard9x16 } from "./compositions/TestimonialCard9x16";
import { PricingTierCard9x16 } from "./compositions/PricingTierCard9x16";
import { LockedFeatureRow9x16 } from "./compositions/LockedFeatureRow9x16";
// Sprint 6 / Wave-5 — new templates (schema lives in same .tsx file)
import { TweetCard9x16, tweetCard9x16Schema } from "./compositions/TweetCard9x16";
import { RankedTierList9x16, rankedTierList9x16Schema } from "./compositions/RankedTierList9x16";
import { AppConnect9x16, appConnect9x16Schema } from "./compositions/AppConnect9x16";
import { VennDiagram9x16, vennDiagram9x16Schema } from "./compositions/VennDiagram9x16";
import { DecisionTree9x16, decisionTree9x16Schema } from "./compositions/DecisionTree9x16";
import { BrandedOpener9x16, brandedOpener9x16Schema } from "./compositions/BrandedOpener9x16";
import { BrollListicle9x16, brollListicle9x16Schema } from "./compositions/BrollListicle9x16";
import { KineticMacroTypeOpener9x16, kineticMacroTypeOpenerSchema } from "./compositions/KineticMacroTypeOpener9x16";
// Wave-6 — 16:9 horizontal templates
import { HormoziTweetCardListicle16x9, hormoziTweetCardListicle16x9Schema } from "./compositions/HormoziTweetCardListicle16x9";
import { BeforeAfterText16x9, beforeAfterText16x9Schema } from "./compositions/BeforeAfterText16x9";
import { BigNumberHorizontalBars16x9, bigNumberHorizontalBars16x9Schema } from "./compositions/BigNumberHorizontalBars16x9";
import { SplitScreenInterviewLayout16x9, splitScreenInterviewLayout16x9Schema } from "./compositions/SplitScreenInterviewLayout16x9";
import { TitleCardKineticTwoLine16x9, titleCardKineticTwoLine16x9Schema } from "./compositions/TitleCardKineticTwoLine16x9";
import { PipelineFlow16x9, pipelineFlow16x9Schema } from "./compositions/PipelineFlow16x9";
import { ThreeRowLabeledCardStack16x9, threeRowLabeledCardStackSchema } from "./compositions/ThreeRowLabeledCardStack16x9";
import { EquationCardChain16x9, equationCardChainSchema } from "./compositions/EquationCardChain16x9";
import { SectionDividerTitleCard16x9, sectionDividerTitleCardSchema } from "./compositions/SectionDividerTitleCard16x9";
import { StudioCompositor16x9, studioCompositorSchema } from "./compositions/StudioCompositor16x9";
import { MemeLoopDiagram16x9, memeLoopDiagramSchema } from "./compositions/MemeLoopDiagram16x9";
import { KeynoteSlidePIP16x9, keynoteSlidePIPSchema } from "./compositions/KeynoteSlidePIP16x9";
import { LiveEventAudienceMicSplitScreen16x9, liveEventAudienceMicSplitScreenSchema } from "./compositions/LiveEventAudienceMicSplitScreen16x9";
import { StudioDeskTalkingHead16x9, studioDeskTalkingHeadSchema } from "./compositions/StudioDeskTalkingHead16x9";
import { FlipChartLiveDrawing16x9, flipChartLiveDrawingSchema } from "./compositions/FlipChartLiveDrawing16x9";
import { KaraokeWithBlueChipPullout9x16, karaokeWithBlueChipPulloutSchema } from "./compositions/KaraokeWithBlueChipPullout9x16";
import { ThreeStageRisingBars16x9, threeStageRisingBarsSchema } from "./compositions/ThreeStageRisingBars16x9";
import { TopHeroBottomTrioCards16x9, topHeroBottomTrioCardsSchema } from "./compositions/TopHeroBottomTrioCards16x9";
import { SpeakerOverlayScene16x9, speakerOverlayScene16x9Schema } from "./compositions/SpeakerOverlayScene16x9";
import { SpeakerOverlayScene9x16, speakerOverlayScene9x16Schema } from "./compositions/SpeakerOverlayScene9x16";
import { BigNumberHero16x9, bigNumberHero16x9Schema } from "./compositions/BigNumberHero16x9";
import { TweetCardHero16x9, tweetCardHero16x9Schema } from "./compositions/TweetCardHero16x9";
import { BarChartList16x9, barChartList16x9Schema } from "./compositions/BarChartList16x9";
import { AnimatedTable16x9, animatedTable16x9Schema } from "./compositions/AnimatedTable16x9";
import { DecisionTree16x9, decisionTree16x9Schema } from "./compositions/DecisionTree16x9";
import { LineChartAnnotated16x9, lineChartAnnotated16x9Schema } from "./compositions/LineChartAnnotated16x9";
import { Sparkline16x9, sparkline16x9Schema } from "./compositions/Sparkline16x9";
import { BenchmarkBars16x9, benchmarkBars16x9Schema } from "./compositions/BenchmarkBars16x9";
import { LayerCardStack16x9, layerCardStack16x9Schema } from "./compositions/LayerCardStack16x9";
import { DiagramExplainer16x9, diagramExplainer16x9Schema } from "./compositions/DiagramExplainer16x9";
import { KineticEssay16x9, kineticEssay16x9Schema } from "./compositions/KineticEssay16x9";
import { VennDiagram16x9, vennDiagram16x9Schema } from "./compositions/VennDiagram16x9";
import { ForceGraph16x9, forceGraph16x9Schema } from "./compositions/ForceGraph16x9";
import { NeuralNetwork16x9, neuralNetwork16x9Schema } from "./compositions/NeuralNetwork16x9";
import { RankedTierList16x9, rankedTierList16x9Schema } from "./compositions/RankedTierList16x9";
import { TestimonialCard16x9, testimonialCard16x9Schema } from "./compositions/TestimonialCard16x9";
import {
  explainerSchema,
  talkingHeadSchema,
  listicleSchema,
  quoteCardSchema,
  techNewsFlashSchema,
  diagramExplainerSchema,
  quoteCard9x16Schema,
  bigNumberHero9x16Schema,
  splitWebcamScreen9x16Schema,
  tweetCardHero9x16Schema,
  benchmarkBars9x16Schema,
  layerCardStack9x16Schema,
  terminalCommand9x16Schema,
  neuralNetwork9x16Schema,
  fauxProductUI9x16Schema,
  newsClipCitation9x16Schema,
  testimonialCard9x16Schema,
  pricingTierCard9x16Schema,
  lockedFeatureRow9x16Schema,
} from "./compositions/schemas";
import { BRAND, BRAND_LOGO_FILENAMES } from "./brand";
import "./brand/fonts";

// Tail padding so the audio doesn't get cut off — adds ~0.5s of black at the end.
const TAIL_SECONDS = 0.5;

/**
 * Compute durationInFrames from the audio file length. Falls back to a sane default
 * if the URL is empty (Studio default-props case) or unreachable.
 */
async function calcDurationFromAudio({
  props,
}: {
  props: { audioUrl?: string };
}): Promise<{ durationInFrames: number }> {
  if (!props.audioUrl || props.audioUrl.length === 0) {
    return { durationInFrames: 300 }; // 10s placeholder
  }
  try {
    const url = props.audioUrl.startsWith("http")
      ? props.audioUrl
      : staticFile(props.audioUrl);
    const seconds = await getAudioDurationInSeconds(url);
    return { durationInFrames: Math.max(30, Math.ceil((seconds + TAIL_SECONDS) * 30)) };
  } catch (err) {
    console.warn("[calcDurationFromAudio] could not read", props.audioUrl, err);
    return { durationInFrames: 300 };
  }
}

const captionDefaults = {
  enabled: true,
  fontSize: 36,
  color: BRAND.colors.textLight,
  highlightColor: BRAND.colors.accent,
  position: "bottom" as const,
  backgroundColor: "rgba(15,27,45,0.75)",
};

const captionDefaultsVertical = {
  ...captionDefaults,
  fontSize: 42,
  position: "center" as const,
};

const watermarkDefaults = {
  enabled: true,
  logo: "avatar" as const,
  position: "bottom-right" as const,
  size: 96,
  opacity: 0.9,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Landscape-16x9">
        <Composition
          id="ExplainerVideo"
          component={ExplainerVideo}
          schema={explainerSchema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "5 Claves para Implementar IA",
            script: "La inteligencia artificial está transformando los negocios.",
            audioUrl: "",
            wordTimings: [],
            backgroundColor: BRAND.colors.primary,
            gradientTo: BRAND.colors.backgroundDark,
            accentColor: BRAND.colors.accent,
            textColor: BRAND.colors.textLight,
            fontFamily: "Inter, sans-serif",
            captions: captionDefaults,
            watermark: watermarkDefaults,
          }}
        />

        <Composition
          id="TalkingHead"
          component={TalkingHead}
          schema={talkingHeadSchema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Hablemos de IA",
            script: "",
            audioUrl: "",
            speakerImageUrl: "",
            wordTimings: [],
            backgroundColor: BRAND.colors.backgroundDark,
            nameTag: BRAND.name,
            nameTagColor: BRAND.colors.accent,
            captions: captionDefaults,
            watermark: watermarkDefaults,
          }}
        />

        <Composition
          id="Listicle"
          component={Listicle}
          schema={listicleSchema}
          durationInFrames={600}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Top 5 Tendencias de IA",
            items: [
              { number: 1, title: "Automatización Inteligente", description: "Los procesos se optimizan solos" },
              { number: 2, title: "IA Generativa", description: "Creación de contenido con IA" },
              { number: 3, title: "Machine Learning", description: "Aprendizaje continuo de datos" },
            ],
            audioUrl: "",
            wordTimings: [],
            backgroundColor: BRAND.colors.primary,
            gradientTo: BRAND.colors.backgroundDark,
            accentColor: BRAND.colors.accent,
            textColor: BRAND.colors.textLight,
            secondsPerItem: 5,
            captions: captionDefaults,
            watermark: watermarkDefaults,
          }}
        />

        <Composition
          id="QuoteCard"
          component={QuoteCard}
          schema={quoteCardSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote: "La mejor manera de predecir el futuro es crearlo.",
            author: "Peter Drucker",
            audioUrl: "",
            wordTimings: [],
            backgroundColor: BRAND.colors.backgroundDark,
            quoteColor: BRAND.colors.textLight,
            authorColor: BRAND.colors.accent,
            fontFamily: "Georgia, serif",
            captions: { ...captionDefaults, enabled: false },
            watermark: watermarkDefaults,
          }}
        />
      </Folder>

      <Folder name="Vertical-9x16">
        <Composition
          id="ExplainerVideoVertical"
          component={ExplainerVideo}
          schema={explainerSchema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "5 Claves de IA",
            script: "",
            audioUrl: "",
            wordTimings: [],
            backgroundColor: BRAND.colors.primary,
            gradientTo: BRAND.colors.backgroundDark,
            accentColor: BRAND.colors.accent,
            textColor: BRAND.colors.textLight,
            fontFamily: "Inter, sans-serif",
            captions: captionDefaultsVertical,
            watermark: { ...watermarkDefaults, size: 80 },
          }}
        />

        <Composition
          id="DiagramExplainer9x16"
          component={DiagramExplainer9x16}
          schema={diagramExplainerSchema}
          durationInFrames={1320}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "EL FLUJO",
            breadcrumb: { text: "Claude Code", date: "Subagents" },
            subjectTool: undefined,
            palette: "cream" as const,
            nodes: [
              { title: "Escribes una función", sublabel: "$ you" },
              { title: "Claude invoca al subagente", sublabel: "auto · proactive" },
              { title: "Reviewer lee y analiza", sublabel: "Read · Grep · Glob", ghosted: true },
            ],
            sequenceStepSeconds: 1.4,
            firstNodeDelaySeconds: 0.4,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 44,
            showWatermark: false,
          }}
        />

        <Composition
          id="DiagramExplainer9x16Dark"
          component={DiagramExplainer9x16}
          schema={diagramExplainerSchema}
          durationInFrames={1320}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "EL FLUJO",
            breadcrumb: { text: "Claude Code", date: "Subagents" },
            subjectTool: undefined,
            palette: "dark" as const,
            nodes: [
              { title: "Escribes una función", sublabel: "$ you" },
              { title: "Claude invoca al subagente", sublabel: "auto · proactive" },
              { title: "Reviewer lee y analiza", sublabel: "Read · Grep · Glob", ghosted: true },
            ],
            sequenceStepSeconds: 1.4,
            firstNodeDelaySeconds: 0.4,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 44,
            showWatermark: false,
          }}
        />

        <Composition
          id="TechNewsFlash9x16"
          component={TechNewsFlash9x16}
          schema={techNewsFlashSchema}
          durationInFrames={1320}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            overlays: [
              {
                kind: "chip" as const,
                text: "FILTRACIÓN",
                startSeconds: 0,
                endSeconds: 3,
              },
              {
                kind: "huge" as const,
                text: "GEMINI 3.2 FLASH",
                startSeconds: 0,
                endSeconds: 3,
              },
            ],
            paperColor: "#FAF7F2",
            inkColor: "#1A1A1A",
            accentColor: "#B33A2A",
            mutedColor: "#6B6760",
            captionFontSize: 48,
            useHeroTransitions: false,
          }}
        />

        <Composition
          id="QuoteCard9x16"
          component={QuoteCard9x16}
          schema={quoteCard9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            quote: "La mejor manera de predecir el futuro es crearlo.",
            author: "Peter Drucker",
            authorRole: undefined,
            breadcrumb: { text: "Anthropic", date: "On Creativity" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            // A4 audit: quote IS the text layer — captions compete with it.
            showCaptions: false,
          }}
        />

        <Composition
          id="QuoteCard9x16Dark"
          component={QuoteCard9x16}
          schema={quoteCard9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            quote: "La mejor manera de predecir el futuro es crearlo.",
            author: "Peter Drucker",
            authorRole: undefined,
            breadcrumb: { text: "Anthropic", date: "On Creativity" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            // A4 audit: quote IS the text layer — captions compete with it.
            showCaptions: false,
          }}
        />

        <Composition
          id="BigNumberHero9x16"
          component={BigNumberHero9x16}
          schema={bigNumberHero9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            number: "15×",
            kicker: "GEMINI 3.2 FLASH",
            subtitle: "más barato que GPT-5",
            caption: undefined,
            countUp: false,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="BigNumberHero9x16Dark"
          component={BigNumberHero9x16}
          schema={bigNumberHero9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            number: "15×",
            kicker: "GEMINI 3.2 FLASH",
            subtitle: "más barato que GPT-5",
            caption: undefined,
            countUp: false,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="TweetCardHero9x16"
          component={TweetCardHero9x16}
          schema={tweetCardHero9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            tweet: {
              name: "Armando Inteligencia",
              handle: "armandointeligencia",
              avatarUrl: "",
              body: "Gemini 3.2 Flash filtra benchmarks: 15× más barato que GPT-5 con casi el mismo score. Esto cambia el cálculo para todos los que están construyendo con LLMs.",
              timestamp: "May 18",
              verified: true,
              replies: 142,
              retweets: 980,
              likes: 4500,
            },
            artifactImageUrl: "",
            faceCamImageUrl: "",
            artifactStack: undefined,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            // A4 audit: tweet body IS the text layer — captions compete with it.
            showCaptions: false,
          }}
        />

        {/*
         * R4C bilawal.ai Wave-7 Batch 3 Pattern N1 — dual-pane "input → output"
         * artifact stack variant. Mirrors the B21 BeforeAfterText16x9-VS pattern:
         * same base composition, exercises the new `artifactStack` prop so the
         * Remotion Studio surfaces the showcase-an-AI-pipeline mode directly.
         * Reference: references/creators/bilawal.ai/ANALYSIS.md §N1
         * (reels DY0YpxjPrYV "sketched flight path → drone POV" and
         *  DYu6vmbPQQW "screenshot → GoPro POV").
         */}
        <Composition
          id="TweetCardHero9x16-DualPane"
          component={TweetCardHero9x16}
          schema={tweetCardHero9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            tweet: {
              name: "Armando Inteligencia",
              handle: "armandointeligencia",
              avatarUrl: "",
              body: "Sketched a flight path on Google Earth → drone POV in 10s. Multimodal pipeline shipping today.",
              timestamp: "May 26",
              verified: true,
              replies: 142,
              retweets: 980,
              likes: 4500,
            },
            artifactImageUrl: "",
            faceCamImageUrl: "",
            artifactStack: {
              input: {
                src: `brand/logos/${BRAND_LOGO_FILENAMES.letters}`,
                altText: "Input artifact placeholder",
                label: "INPUT",
              },
              output: {
                src: `brand/logos/${BRAND_LOGO_FILENAMES.avatarLetters}`,
                altText: "Generated output placeholder",
                label: "OUTPUT",
              },
              gapPx: 16,
            },
            breadcrumb: { text: "Bilawal · Pattern N1", date: "Input → Output" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="BenchmarkBars9x16"
          component={BenchmarkBars9x16}
          schema={benchmarkBars9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Precio por millón de tokens (entrada)",
            subtitle: undefined,
            bars: [
              { label: "Gemini 3.2 Flash", value: "$0.25", widthPct: 0.07, color: "" },
              { label: "GPT-5.5", value: "$3.75", widthPct: 1.0, color: "#6B6760" },
            ],
            sourceCaption: "Filtración Google AI Studio · 5 mayo 2026",
            barStaggerSeconds: 0.3,
            barAnimSeconds: 0.8,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="BenchmarkBars9x16Dark"
          component={BenchmarkBars9x16}
          schema={benchmarkBars9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Precio por millón de tokens (entrada)",
            subtitle: undefined,
            bars: [
              { label: "Gemini 3.2 Flash", value: "$0.25", widthPct: 0.07, color: "" },
              { label: "GPT-5.5", value: "$3.75", widthPct: 1.0, color: "#6B6760" },
            ],
            sourceCaption: "Filtración Google AI Studio · 5 mayo 2026",
            barStaggerSeconds: 0.3,
            barAnimSeconds: 0.8,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="SplitWebcamScreen9x16"
          component={SplitWebcamScreen9x16}
          schema={splitWebcamScreen9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            webcamImageUrl: "",
            screenImageUrl: "",
            callouts: [
              {
                text: "BOOM",
                keyword: "Gemini",
                fallbackStartSeconds: 1.0,
                endSeconds: 2.5,
                position: "seam-left" as const,
              },
              {
                text: "15× MÁS BARATO",
                keyword: "barato",
                fallbackStartSeconds: 3.5,
                endSeconds: 6.0,
                position: "seam-center" as const,
              },
            ],
            breadcrumb: { text: "Midu.dev", date: "Reaction" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="LayerCardStack9x16"
          component={LayerCardStack9x16}
          schema={layerCardStack9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Las 3 capas del AI coding",
            cards: [
              { badge: "Layer 1", headline: "Vibe Coding", body: "Le pides a la IA un prompt y aceptas lo que salga. Rápido, sin revisión.", icon: "✦" },
              { badge: "Layer 2", headline: "AI Agentic Coding", body: "Un agente itera solo: planea, escribe, prueba y arregla bugs en loop.", icon: "◆" },
              { badge: "Layer 3", headline: "AI-Assisted Coding", body: "Tú escribes, la IA sugiere. Autocompletado tipo Copilot con tu juicio al volante.", icon: "▲" },
            ],
            cardStaggerSeconds: 0.4,
            breadcrumb: { text: "Gemini 3.2 Flash", date: "Filtración" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: true,
          }}
        />

        <Composition
          id="LayerCardStack9x16Dark"
          component={LayerCardStack9x16}
          schema={layerCardStack9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Las 3 capas del AI coding",
            cards: [
              { badge: "Layer 1", headline: "Vibe Coding", body: "Le pides a la IA un prompt y aceptas lo que salga. Rápido, sin revisión.", icon: "✦" },
              { badge: "Layer 2", headline: "AI Agentic Coding", body: "Un agente itera solo: planea, escribe, prueba y arregla bugs en loop.", icon: "◆" },
              { badge: "Layer 3", headline: "AI-Assisted Coding", body: "Tú escribes, la IA sugiere. Autocompletado tipo Copilot con tu juicio al volante.", icon: "▲" },
            ],
            cardStaggerSeconds: 0.4,
            breadcrumb: { text: "Gemini 3.2 Flash", date: "Filtración" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: true,
          }}
        />

        <Composition
          id="TerminalCommand9x16"
          component={TerminalCommand9x16}
          schema={terminalCommand9x16Schema}
          durationInFrames={420}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            windowTitle: "zsh — claude-code · 80×24",
            lines: [
              { prompt: "$", command: "claude code", output: ["Welcome to Claude Code v1.2.3", "Type /help for commands"], kind: "command" as const },
              { prompt: "$", command: 'claude "review the auth flow with the security subagent"', output: [], kind: "command" as const },
              { prompt: "→", command: "Dispatching subagent: security-reviewer", output: ["Reading src/auth/*.ts (8 files)", "Running grep for hardcoded secrets…", "✓ no secrets found"], kind: "output" as const },
              { prompt: "✓", command: "Review complete — 0 critical, 2 advisories", output: [], kind: "success" as const },
            ],
            charsPerSecond: 35,
            outputDelaySeconds: 0.4,
            ansiAccent: true,
            fontSize: 30,
            breadcrumb: { text: "Claude Code", date: "Subagents" },
            subjectTool: "claude-code",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="NeuralNetwork9x16"
          component={NeuralNetwork9x16}
          schema={neuralNetwork9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Cómo aprende un modelo",
            subtitle: undefined,
            layers: [4, 6, 6, 4],
            layerLabels: ["INPUT", "HIDDEN 1", "HIDDEN 2", "OUTPUT"],
            firstWaveDelaySeconds: 0.5,
            waveIntervalSeconds: 0.9,
            pulsePropagateSeconds: 0.4,
            showLayerLabels: true,
            breadcrumb: { text: "Deep Learning", date: "Forward Pass" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="NeuralNetwork9x16Dark"
          component={NeuralNetwork9x16}
          schema={neuralNetwork9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Cómo aprende un modelo",
            subtitle: undefined,
            layers: [4, 6, 6, 4],
            layerLabels: ["INPUT", "HIDDEN 1", "HIDDEN 2", "OUTPUT"],
            firstWaveDelaySeconds: 0.5,
            waveIntervalSeconds: 0.9,
            pulsePropagateSeconds: 0.4,
            showLayerLabels: true,
            breadcrumb: { text: "Deep Learning", date: "Forward Pass" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="AnimatedCounter9x16"
          component={AnimatedCounter9x16}
          schema={animatedCounter9x16Schema}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            target: 15,
            prefix: "",
            suffix: "×",
            decimals: 0,
            audioAnchorKeyword: undefined,
            countDurationSeconds: 1.8,
            kicker: "GEMINI 3.2 FLASH",
            subtitle: "más barato que GPT-5.5",
            caption: "$0.25 / $2.00 por millón de tokens",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="AnimatedText9x16BlurIn"
          component={AnimatedText9x16}
          schema={animatedText9x16Schema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            text: "GEMINI 3.2 FLASH",
            subtitle: undefined,
            revealStyle: "blur-in" as const,
            revealDurationSeconds: 0.8,
            audioAnchorKeyword: undefined,
            scrambleCharPool: "",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="AnimatedText9x16Scramble"
          component={AnimatedText9x16}
          schema={animatedText9x16Schema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            text: "GEMINI 3.2 FLASH",
            subtitle: undefined,
            revealStyle: "scramble-decrypt" as const,
            revealDurationSeconds: 1.0,
            audioAnchorKeyword: undefined,
            scrambleCharPool: "",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="AgentThinking9x16Dark"
          component={AgentThinking9x16}
          schema={agentThinking9x16Schema}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            caption: "Claude está pensando...",
            showThinkingDots: true,
            orbRadiusPx: 250,
            breathingPeriodSeconds: 2.4,
            breadcrumb: { text: "Subagent", date: "Working" },
            subjectTool: "claude-code",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="TokenStream9x16"
          component={TokenStream9x16}
          schema={tokenStream9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "GEMINI 3.2 FLASH genera:",
            text: "$0.25 por millón de tokens de entrada. Dos dólares por millón de salida. Latencia menos de 200ms.",
            tokensArray: [],
            tokensPerSecond: 10,
            showCursor: true,
            breadcrumb: { text: "Gemini 3.2", date: "Streaming" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="AttentionHeatmap9x16Dark"
          component={AttentionHeatmap9x16}
          schema={attentionHeatmap9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Cómo Gemini ATIENDE",
            rowLabels: ["Gemini", "3.2", "Flash", "es", "muy", "rápido"],
            colLabels: ["Gemini", "3.2", "Flash", "es", "muy", "rápido"],
            weights: [
              [1.00, 0.35, 0.30, 0.40, 0.30, 0.35],
              [0.40, 0.95, 0.45, 0.30, 0.35, 0.30],
              [0.35, 0.50, 0.90, 0.35, 0.40, 0.45],
              [0.30, 0.30, 0.35, 0.85, 0.50, 0.40],
              [0.35, 0.40, 0.30, 0.45, 0.92, 0.55],
              [0.40, 0.35, 0.45, 0.30, 0.50, 0.98],
            ],
            fillDurationSeconds: 1.6,
            showActiveGlow: true,
            breadcrumb: { text: "Gemini 3.2 Flash", date: "Attention" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="TalkingHeadDynamic9x16"
          component={TalkingHeadDynamic9x16}
          schema={talkingHeadDynamic9x16Schema}
          durationInFrames={540}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            faceCamSrc: "",
            voiceoverSrc: "",
            brollClips: [],
            segments: [
              // Stephan's grammar: ~1 cut/sec on HARD_CUT, mixing FACE_FULL +
              // BROLL_FULL + SPLIT modes. Empty brollSrc is fine for FACE_FULL.
              { startSeconds: 0,  endSeconds: 3,  cropMode: "FACE_FULL" as const,          brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
              { startSeconds: 3,  endSeconds: 6,  cropMode: "SPLIT_50_TOP_BROLL" as const, brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
              { startSeconds: 6,  endSeconds: 9,  cropMode: "BROLL_FULL" as const,         brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
              { startSeconds: 9,  endSeconds: 12, cropMode: "SPLIT_50_TOP_FACE" as const,  brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
              { startSeconds: 12, endSeconds: 15, cropMode: "FACE_FULL" as const,          brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
              { startSeconds: 15, endSeconds: 18, cropMode: "SPLIT_33_TOP_FACE" as const,  brollSrc: "", transitionIn: "HARD_CUT" as const, transitionFrames: 0 },
            ],
            breadcrumb: { text: "Stephan", date: "Pattern" },
            subjectTool: "claude-code",
            palette: "dark" as const,
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
          }}
        />

        <Composition
          id="AnimatedTable9x16"
          component={AnimatedTable9x16}
          schema={animatedTable9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Modelo · Precio · Latencia · GPT-5.5 score",
            subtitle: undefined,
            headers: ["Modelo", "Precio/M", "Latencia", "Score"],
            rows: [
              ["Gemini 3.2 Flash", "$0.25", "<200ms", "92%"],
              ["GPT-5.5", "$3.75", "~600ms", "100%"],
            ],
            highlightRowIndex: 0,
            rowStaggerSeconds: 0.2,
            headerDelaySeconds: 0.4,
            sourceCaption: "Filtración Google AI Studio · 5 mayo 2026",
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="AnimatedTable9x16Dark"
          component={AnimatedTable9x16}
          schema={animatedTable9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Modelo · Precio · Latencia · GPT-5.5 score",
            subtitle: undefined,
            headers: ["Modelo", "Precio/M", "Latencia", "Score"],
            rows: [
              ["Gemini 3.2 Flash", "$0.25", "<200ms", "92%"],
              ["GPT-5.5", "$3.75", "~600ms", "100%"],
            ],
            highlightRowIndex: 0,
            rowStaggerSeconds: 0.2,
            headerDelaySeconds: 0.4,
            sourceCaption: "Filtración Google AI Studio · 5 mayo 2026",
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="Sparkline9x16"
          component={Sparkline9x16}
          schema={sparkline9x16Schema}
          durationInFrames={210}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            kicker: "ENCUESTA MCKINSEY",
            title: "Adopción IA · Q1–Q4 2025",
            data: [12, 18, 24, 38, 52, 67, 78, 89],
            valueFormat: "{v}%",
            decimals: 0,
            showAreaFill: true,
            showTrendBadge: true,
            drawDurationSeconds: 1.2,
            sourceCaption: "McKinsey 2026 State of AI",
            breadcrumb: { text: "McKinsey", date: "State of AI 2026" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="Sparkline9x16Dark"
          component={Sparkline9x16}
          schema={sparkline9x16Schema}
          durationInFrames={210}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            kicker: "ENCUESTA MCKINSEY",
            title: "Adopción IA · Q1–Q4 2025",
            data: [12, 18, 24, 38, 52, 67, 78, 89],
            valueFormat: "{v}%",
            decimals: 0,
            showAreaFill: true,
            showTrendBadge: true,
            drawDurationSeconds: 1.2,
            sourceCaption: "McKinsey 2026 State of AI",
            breadcrumb: { text: "McKinsey", date: "State of AI 2026" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="ForceGraph9x16"
          component={ForceGraph9x16}
          schema={forceGraph9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "El ecosistema Claude",
            nodes: [
              { id: "claude",  label: "Claude",  weight: 1.8 },
              { id: "code",    label: "Code",    weight: 1 },
              { id: "web",     label: "Web",     weight: 1 },
              { id: "api",     label: "API",     weight: 1 },
              { id: "agents",  label: "Agents",  weight: 1 },
              { id: "mcp",     label: "MCP",     weight: 1 },
              { id: "skills",  label: "Skills",  weight: 1 },
              { id: "plugins", label: "Plugins", weight: 1 },
            ],
            edges: [
              { source: "claude", target: "code" },
              { source: "claude", target: "web" },
              { source: "claude", target: "api" },
              { source: "claude", target: "agents" },
              { source: "claude", target: "mcp" },
              { source: "claude", target: "skills" },
              { source: "claude", target: "plugins" },
              { source: "code",   target: "agents" },
              { source: "agents", target: "mcp" },
              { source: "mcp",    target: "skills" },
              { source: "skills", target: "plugins" },
            ],
            focusNodeId: "claude",
            showNodeLabels: true,
            rotateSlowly: false,
            breadcrumb: { text: "Anthropic", date: "Ecosistema" },
            subjectTool: "claude-code",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="ForceGraph9x16Dark"
          component={ForceGraph9x16}
          schema={forceGraph9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "El ecosistema Claude",
            nodes: [
              { id: "claude",  label: "Claude",  weight: 1.8 },
              { id: "code",    label: "Code",    weight: 1 },
              { id: "web",     label: "Web",     weight: 1 },
              { id: "api",     label: "API",     weight: 1 },
              { id: "agents",  label: "Agents",  weight: 1 },
              { id: "mcp",     label: "MCP",     weight: 1 },
              { id: "skills",  label: "Skills",  weight: 1 },
              { id: "plugins", label: "Plugins", weight: 1 },
            ],
            edges: [
              { source: "claude", target: "code" },
              { source: "claude", target: "web" },
              { source: "claude", target: "api" },
              { source: "claude", target: "agents" },
              { source: "claude", target: "mcp" },
              { source: "claude", target: "skills" },
              { source: "claude", target: "plugins" },
              { source: "code",   target: "agents" },
              { source: "agents", target: "mcp" },
              { source: "mcp",    target: "skills" },
              { source: "skills", target: "plugins" },
            ],
            focusNodeId: "claude",
            showNodeLabels: true,
            rotateSlowly: false,
            breadcrumb: { text: "Anthropic", date: "Ecosistema" },
            subjectTool: "claude-code",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="KineticTypoCard9x16"
          component={KineticTypoCard9x16}
          schema={kineticTypoCard9x16Schema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            topLabel: "UNFOLD 2010TX",
            lines: ["Spent 40 years", "perfecting", "consonant traits"],
            lineStaggerSeconds: 0.25,
            showBrushWipe: true,
            brushWipeFrames: 12,
            bottomBadge: "Reel · 01/12",
            breadcrumb: undefined,
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="CircularLogoCarousel9x16"
          component={CircularLogoCarousel9x16}
          schema={circularLogoCarousel9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "The LLM line-up",
            centerText: "VS",
            logos: [],
            logoStaggerSeconds: 0.25,
            carouselRadiusPx: 360,
            logoCardSizePx: 140,
            audioAnchorKeyword: undefined,
            continuousRotationDegPerSec: 0,
            showBrandNames: true,
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        {/* ─── Sprint 5 — Batch 2 new templates ───────────────────── */}

        <Composition
          id="CodeDiffBeforeAfter9x16"
          component={CodeDiffBeforeAfter9x16}
          schema={codeDiffBeforeAfter9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "REFACTOR",
            before: {
              language: "ts" as const,
              code: "function add(a, b) {\n  return a + b;\n}",
              lineMarkers: [],
            },
            after: {
              language: "ts" as const,
              code: "const add = (a: number, b: number): number =>\n  a + b;",
              lineMarkers: [],
            },
            beforeLabel: "ANTES",
            afterLabel: "DESPUÉS",
            conclusionText: "Type-safe, one-liner.",
            breadcrumb: { text: "TypeScript", date: "Refactor" },
            subjectTool: null,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            beforeEnterSeconds: 0.5,
            afterEnterSeconds: 3.0,
            arrowDrawSeconds: 2.5,
          }}
        />

        <Composition
          id="TerminalBlock9x16"
          component={TerminalBlock9x16}
          schema={terminalBlock9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "TERMINAL",
            windowTitle: "zsh — claude-code · 80×24",
            lines: [
              { kind: "prompt" as const, text: "$ claude code" },
              { kind: "output" as const, text: "Welcome to Claude Code v1.2.3" },
              { kind: "success" as const, text: "✓ Ready" },
            ],
            chapterChip: null,
            breadcrumb: { text: "Claude Code", date: "Subagents" },
            subjectTool: "claude-code",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.5,
            typewriter: true,
            font: "firaCode" as const,
          }}
        />

        <Composition
          id="EditorBlock9x16"
          component={EditorBlock9x16}
          schema={editorBlock9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "EDITOR",
            filename: "Root.tsx",
            breadcrumbPath: ["src", "Root.tsx"],
            code: "export const RemotionRoot = () => {\n  return <Composition id=\"X\" />;\n};",
            language: "tsx" as const,
            highlightedLines: [2],
            sideAnnotation: null,
            breadcrumb: { text: "Remotion", date: "Setup" },
            subjectTool: null,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.5,
          }}
        />

        <Composition
          id="KineticEssay9x16"
          component={KineticEssay9x16}
          schema={kineticEssay9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            lines: [
              {
                text: "El modelo",
                style: "sans-bold" as const,
                emphasizeWords: [],
                emphasisColor: "",
                italicEmphasis: false,
                align: "center" as const,
                strikethrough: false,
              },
              {
                text: "no es el foso",
                style: "serif-italic" as const,
                emphasizeWords: ["foso"],
                emphasisColor: "",
                italicEmphasis: false,
                align: "center" as const,
                strikethrough: false,
              },
            ],
            sectionLabel: "",
            breadcrumb: { text: "Essay", date: "Kinetic" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            firstLineDelaySeconds: 0.6,
            sequenceStepSeconds: 1.2,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="OutroFollowCTA9x16"
          component={OutroFollowCTA9x16}
          schema={outroFollowCTA9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            ctaTitle: "SÍGUEME",
            ctaSubtitle: "PARA MÁS OPINIONES TÉCNICAS",
            ctaAccentLine: "SOBRE IA",
            handle: "@armandointeligencia",
            showMascot: false,
            breadcrumb: { text: "Armando Inteligencia", date: "Outro" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="BigNumberDuel9x16"
          component={BigNumberDuel9x16}
          schema={bigNumberDuel9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "PRECIO POR M TOKENS",
            left: {
              value: 0.25,
              prefix: "$",
              suffix: "",
              decimals: 2,
              label: "Gemini 3.2 Flash",
              tagline: "Input · per 1M tokens",
              sourceIcon: "",
              accentColor: "",
              brandLogo: "",
            },
            right: {
              value: 3.75,
              prefix: "$",
              suffix: "",
              decimals: 2,
              label: "GPT-5.5",
              tagline: "Input · per 1M tokens",
              sourceIcon: "",
              accentColor: "",
              brandLogo: "",
            },
            vsSeparator: true,
            conclusionLine: "15× cheaper, same accuracy.",
            enterLeftSeconds: 0.4,
            enterRightSeconds: 0.7,
            countDurationSeconds: 1.0,
            breadcrumb: { text: "Google", date: "Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="LineChartAnnotated9x16"
          component={LineChartAnnotated9x16}
          schema={lineChartAnnotated9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "ADOPCIÓN IA",
            xLabels: ["Q1", "Q2", "Q3", "Q4"],
            series: [
              {
                name: "Adopción",
                color: "",
                values: [12, 34, 58, 82],
                annotations: [{ atIndex: 3, text: "82%" }],
              },
            ],
            yMin: undefined,
            yMax: undefined,
            showAxes: true,
            showValueReadout: true,
            drawDurationSeconds: 1.2,
            enterSeconds: 0.5,
            breadcrumb: { text: "McKinsey", date: "State of AI" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="BarChartList9x16"
          component={BarChartList9x16}
          schema={barChartList9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "MODELOS",
            bars: [
              { label: "GEMINI 3.2", value: 92, suffix: "%", color: "", decimals: 0 },
              { label: "GPT-5.5", value: 100, suffix: "%", color: "", decimals: 0 },
              { label: "CLAUDE 4.7", value: 95, suffix: "%", color: "", decimals: 0 },
            ],
            direction: "ltr" as const,
            staggerFrames: 4,
            fillDurationSeconds: 0.8,
            maxValue: undefined,
            breadcrumb: { text: "Benchmarks", date: "2026" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="PipelineFlow9x16"
          component={PipelineFlow9x16}
          schema={pipelineFlow9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "EL PIPELINE",
            stages: [
              { name: "implementation-agent", body: "Writes the first draft", kind: "agent" as const },
              { name: "test-runner", body: "Runs the test suite", kind: "tool" as const },
              { name: "review-agent", body: "Checks for issues", kind: "check" as const },
            ],
            footerLabel: "PIPELINE",
            arrowStyle: "accent" as const,
            sequenceStepSeconds: 1.0,
            firstStageDelaySeconds: 0.4,
            breadcrumb: { text: "Claude Code", date: "Subagents" },
            subjectTool: "claude-code",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="TitledDossierCard9x16"
          component={TitledDossierCard9x16}
          schema={titledDossierCard9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            kicker: "DOSSIER",
            heroTitle: "AI CODING",
            primaryStat: { value: "$2-3M", label: "PER PROJECT, PER YEAR" },
            bullets: [
              { text: "Agents handle the loop" },
              { text: "Humans review the diff" },
              { text: "10× shipping velocity" },
            ],
            conclusionLine: "The new default.",
            enterSeconds: 0.5,
            bulletStaggerSeconds: 0.25,
            breadcrumb: { text: "AI Coding", date: "2026" },
            subjectTool: undefined,
            palette: "true-black" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="GeminiFrameWrapper9x16"
          component={GeminiFrameWrapper9x16}
          schema={geminiFrameWrapper9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            scenes: [
              {
                chapter: "HOOK",
                headline: "Gemini 3.2 Flash",
                body: "15× cheaper, almost the same accuracy.",
                bullets: [],
                durationSeconds: 4.0,
              },
            ],
            handle: "@armandointeligencia",
            brandLogoText: "Google",
            particleColors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
            particleCount: 80,
            showTopProgressBar: true,
            showChapterStepper: true,
            showInsetBorder: true,
            showHandle: true,
            breadcrumb: { text: "Google", date: "I/O 2026" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            brandId: undefined,
          }}
        />

        <Composition
          id="CamcorderFrame9x16"
          component={CamcorderFrame9x16}
          schema={camcorderFrame9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            brandTitle: "ARMANDO INTELLIGENCE",
            classification: "CLASSIFICATION: SECRET//NOFORN",
            timestamp: "",
            scenes: [
              {
                chapter: "RECON",
                headline: "Target Acquired",
                body: "Gemini 3.2 Flash spotted in the wild.",
                durationSeconds: 4.0,
              },
            ],
            showRecIndicator: true,
            showIconRail: true,
            showCornerBrackets: true,
            liveTimecode: true,
            totalSlides: undefined,
            currentSlide: 1,
            showNoiseColumns: true,
            breadcrumb: { text: "Intel", date: "Recon" },
            subjectTool: undefined,
            palette: "warm-black" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            brandId: undefined,
          }}
        />

        <Composition
          id="KeyedFounderOverBroll9x16"
          component={KeyedFounderOverBroll9x16}
          schema={keyedFounderOverBroll9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            brollClips: [],
            founderClip: {
              src: "",
              isPlaceholder: true,
              bottomOffset: 0,
              height: 1400,
              align: "center" as const,
            },
            captionMode: "chunked" as const,
            sectionLabel: "CASE STUDY · 02",
            breadcrumb: { text: "Founder", date: "Case Study" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 56,
            brandId: undefined,
          }}
        />

        <Composition
          id="GenerativeBrollWithDiegeticUI9x16"
          component={GenerativeBrollWithDiegeticUI9x16}
          schema={generativeBrollWithDiegeticUI9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            brollClips: [],
            diegeticUI: {
              kind: "editor" as const,
              title: "~/src/compositions/X.tsx",
              code: "export const X = () => <div>Hello</div>;",
              language: "tsx" as const,
              filename: "X.tsx",
              breadcrumbPath: ["src", "compositions", "X.tsx"],
              browserUrl: "",
              markdown: "",
              terminalLines: [],
              centerYpx: 800,
              width: 800,
              height: 560,
              rotationDegrees: -3,
              glow: true,
              glowColor: "",
            },
            secondaryUI: null,
            sectionLabel: "DIEGETIC UI",
            showCaptions: true,
            captionMode: "chunked" as const,
            breadcrumb: { text: "Generative B-roll", date: "Pattern" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 56,
            brandId: undefined,
          }}
        />

        <Composition
          id="WhiteboardScene9x16"
          component={WhiteboardScene9x16}
          schema={whiteboardScene9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Marketing",
            items: [
              { text: "Brand voice", check: "checked" as const },
              { text: "Distribution", check: "empty" as const },
              { text: "Retention", check: "empty" as const },
            ],
            arrows: [],
            paperPattern: "blank" as const,
            sectionLabel: "",
            breadcrumb: { text: "Whiteboard", date: "Brainstorm" },
            subjectTool: undefined,
            palette: "paper" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            firstItemDelaySeconds: 0.5,
            sequenceStepSeconds: 0.9,
            showCaptions: false,
            brandId: undefined,
          }}
        />

        <Composition
          id="IllustratedConcept9x16"
          component={IllustratedConcept9x16}
          schema={illustratedConcept9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            illustrationSrc: "",
            captionLine: "una idea con forma",
            bullets: [],
            sectionLabel: "CONCEPTO",
            layoutMode: "centered" as const,
            kenBurns: true,
            kenBurnsZoomFactor: 1.04,
            breadcrumb: { text: "Idea", date: "Concept" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="YouTubeEndCard9x16"
          component={YouTubeEndCard9x16}
          schema={youTubeEndCard9x16Schema}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "AI CODING",
            callToAction: "WATCH NOW",
            handle: "@armandointeligencia",
            thumbnailSrc: "",
            showYouTubeGlyph: true,
            showCornerBrackets: true,
            showCalloutArrows: false,
            calloutTargets: [],
            blurredBgSrc: "",
            breadcrumb: { text: "YouTube", date: "End Card" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            enterSeconds: 0,
            showCaptions: false,
            captionFontSize: 38,
            brandId: undefined,
          }}
        />

        <Composition
          id="PollCTA9x16"
          component={PollCTA9x16}
          schema={pollCTA9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            question: "¿Cuál usas más?",
            options: [
              { label: "Gemini", icon: "🤖" },
              { label: "Claude", icon: "🧠" },
              { label: "GPT", icon: "✨" },
            ],
            closingLine: undefined,
            handle: "@armandointeligencia",
            showCommentArrow: true,
            breadcrumb: { text: "Poll", date: "CTA" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            staggerSeconds: 0.3,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="YouTubeCalloutArrows9x16"
          component={YouTubeCalloutArrows9x16}
          schema={youTubeCalloutArrows9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            imageSrc: "",
            heroLabel: "MIRA",
            callouts: [
              {
                targetXPx: 540,
                targetYPx: 900,
                labelXPx: 760,
                labelYPx: 760,
                label: "#1",
              },
            ],
            arrowDashed: true,
            animateArrows: true,
            sectionLabel: "LOOK HERE",
            breadcrumb: { text: "Callout", date: "Pattern" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            staggerSeconds: 0.25,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="FauxProductUI9x16"
          component={FauxProductUI9x16}
          schema={fauxProductUI9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            brandTitle: "ARMANDO INTELLIGENCE",
            classification: "CLASSIFICATION: SECRET//NOFORN",
            timestamp: "",
            innerBg: null,
            bracket: null,
            callouts: [],
            showCornerBrackets: true,
            showIconRail: true,
            showRecIndicator: true,
            showGlobeMinimap: false,
            showWaveformCard: false,
            sectionLabel: "",
            breadcrumb: { text: "HUD", date: "Mission Control" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 56,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="NewsClipCitation9x16"
          component={NewsClipCitation9x16}
          schema={newsClipCitation9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            source: { name: "INDEPENDENT", logoColor: "#D62828", logoTextColor: "#FFFFFF" },
            byline: "By Andrew Buncombe · Apr 14, 2026",
            headline: "SECRET PASSWORDS AND CRYPTOPAYMENTS",
            dek: "How a generation of AI tools are reshaping the way we work.",
            image: null,
            pullQuote: null,
            sectionLabel: "PRESS",
            breadcrumb: { text: "Press", date: "Cite" },
            subjectTool: undefined,
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.5,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="TestimonialCard9x16"
          component={TestimonialCard9x16}
          schema={testimonialCard9x16Schema}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            quote: "This is the kind of testimonial that lands.",
            attribution: { name: "Carlos Cuamatzin", title: "Founder", brand: "MED" },
            brandLogo: undefined,
            sectionLabel: "TESTIMONIO",
            breadcrumb: { text: "Testimonial", date: "Pull-Quote" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            enterSeconds: 0.5,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="PricingTierCard9x16"
          component={PricingTierCard9x16}
          schema={pricingTierCard9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            tiers: [
              {
                name: "FREE",
                price: "$0",
                mask: false,
                revealedAtSeconds: undefined,
                features: ["1 user", "100 renders/mo"],
                color: "",
                highlighted: false,
              },
              {
                name: "PRO",
                price: "$29",
                mask: false,
                revealedAtSeconds: undefined,
                features: ["Unlimited users", "10K renders/mo", "Priority support"],
                color: "",
                highlighted: true,
              },
              {
                name: "ENTERPRISE",
                price: "???",
                mask: true,
                revealedAtSeconds: 5,
                features: ["Custom SLA", "Dedicated infra"],
                color: "",
                highlighted: false,
              },
            ],
            sectionLabel: "PRECIOS",
            conclusionLine: undefined,
            breadcrumb: { text: "Pricing", date: "Tiers" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            staggerSeconds: 0.3,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        <Composition
          id="LockedFeatureRow9x16"
          component={LockedFeatureRow9x16}
          schema={lockedFeatureRow9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "FUNCIONES",
            rows: [
              { feature: "Multiple workspaces", state: "available" as const, modifier: undefined, color: "" },
              { feature: "Custom domains", state: "locked-tier" as const, modifier: "PRO", color: "" },
              { feature: "Mobile app", state: "soon" as const, modifier: "Q3 2026", color: "" },
              { feature: "Live collaboration", state: "beta" as const, modifier: "BETA", color: "" },
              { feature: "EU data residency", state: "locked-region" as const, modifier: "US ONLY", color: "" },
            ],
            breadcrumb: { text: "Features", date: "Roadmap" },
            subjectTool: undefined,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            enterSeconds: 0.4,
            staggerSeconds: 0.18,
            showCaptions: true,
            brandId: undefined,
          }}
        />

        {/* ─── Sprint 6 / Wave-5 — new templates ─────────────────────── */}

        <Composition
          id="TweetCard9x16"
          component={TweetCard9x16}
          schema={tweetCard9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "",
            author: {
              avatarSrc: "",
              name: "Armando Inteligencia",
              handle: "@armandointeligencia",
              verified: true,
            },
            body: "Gemini 3.2 Flash leaked. The benchmarks are unreal.",
            mediaSrc: "",
            mediaAspect: "1:1" as const,
            counters: { likes: 4500, retweets: 980, replies: 142, views: 0 },
            timestamp: "May 18",
            brand: "twitter" as const,
            transitionVerb:
              "Avatar scale-pops 0→1 over 8 frames, then handle and name slide in from the left over 12 frames, then body text reveals line-by-line at 6-frame stagger, then media image scale-pops 0.9→1 with shadow blur-in, then like and retweet counters roll up.",
            enterStartSeconds: 0.4,
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="RankedTierList9x16"
          component={RankedTierList9x16}
          schema={rankedTierList9x16Schema}
          durationInFrames={420}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Top 5 reasons Gemini 3.2 Flash matters",
            subtitle: "",
            sectionLabel: "RANKED",
            items: [
              { rank: "5", label: "Hits 92% of GPT-5.5's score", sub: "", color: "" },
              { rank: "4", label: "Sub-200ms latency", sub: "", color: "" },
              { rank: "3", label: "Native 1M-token context", sub: "", color: "" },
              { rank: "2", label: "Free tier in AI Studio", sub: "", color: "" },
              { rank: "1", label: "15× cheaper than GPT-5.5", sub: "$0.25 / 1M tokens", color: "" },
            ],
            revealDirection: "bottom-up" as const,
            revealFrames: 10,
            holdFrames: 14,
            firstItemEnterSeconds: 1.0,
            sideBySideHost: false,
            transitionVerb:
              "Each list item slides up from below one-at-a-time (translateY 20 → 0 over 10 frames), each held 14 frames before the next starts. NOT a continuous stagger — each tier has its own dwell beat.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 38,
            showCaptions: false,
          }}
        />

        <Composition
          id="AppConnect9x16"
          component={AppConnect9x16}
          schema={appConnect9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "INTEGRATION",
            leftApp: { name: "Gmail", iconSrc: "", brandColor: "#EA4335" },
            rightApp: { name: "Gemini", iconSrc: "", brandColor: "#4285F4" },
            connector: "arc" as const,
            endMarker: "dot" as const,
            notifications: [
              { fromApp: "right" as const, title: "Gemini cleaned your inbox", body: "47 emails archived", timestamp: "now" },
              { fromApp: "right" as const, title: "Smart replies drafted", body: "3 ready to send", timestamp: "now" },
              { fromApp: "right" as const, title: "Priority sorted", body: "Top 5 emails pinned", timestamp: "now" },
            ],
            notificationCascade: { intervalFrames: 4, heldFrames: 60, enterFrames: 8 },
            iconsEnterStartSeconds: 0.4,
            connectorDrawStartSeconds: 0.8,
            cascadeStartSeconds: 1.6,
            transitionVerb:
              "Left and right app icons slide in from opposite sides, then an arc draws between them L→R over 16 frames with a static dot at the tip (NEVER an animated arrowhead), then 3 notification toasts drop from the top of the right app in 4-frame succession, each held 60 frames.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 36,
            showCaptions: false,
          }}
        />

        <Composition
          id="VennDiagram9x16"
          component={VennDiagram9x16}
          schema={vennDiagram9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "THE TRIANGLE",
            title: "Precio · Velocidad · Calidad",
            mode: "3-circle-stacked" as const,
            circles: [
              { label: "PRECIO", sub: "$0.25/M", color: "#5BC0E8", fillOpacity: 0.35 },
              { label: "VELOCIDAD", sub: "<200ms", color: "#E89B7A", fillOpacity: 0.35 },
              { label: "CALIDAD", sub: "92% GPT-5.5", color: "#7CE49A", fillOpacity: 0.35 },
            ],
            intersectionLabel: "Gemini 3.2 Flash",
            intersectionSub: "",
            circleEnterSeconds: 0.5,
            circleStaggerSeconds: 0.6,
            outlineDrawFrames: 20,
            fillFadeFrames: 12,
            intersectionLabelStartSeconds: 3.5,
            transitionVerb:
              "Each circle drifts in from off-frame (translateX from ±400 to 0 over 14 frames), its outline draws via stroke-dashoffset, then its fill fades in alpha-blended on overlap. The center-intersection label fades in LAST after all circles are settled.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 36,
            showCaptions: false,
          }}
        />

        <Composition
          id="DecisionTree9x16"
          component={DecisionTree9x16}
          schema={decisionTree9x16Schema}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "DECIDE",
            title: "¿Usar Gemini Flash?",
            subtitle: "",
            rootNode: { label: "¿Usar Gemini Flash?", sub: "", color: "" },
            children: [
              { label: "Sí, para todo", sub: "Tareas rutinarias", color: "#7CE49A" },
              { label: "Con A/B test", sub: "Producción crítica", color: "#5BC0E8" },
              { label: "Esperar 3.5", sub: "Más capacidad", color: "#E89B7A" },
            ],
            layout: "radial-fan" as const,
            edgeTipMarker: "dot" as const,
            rootEnterSeconds: 0.4,
            edgeDrawStartSeconds: 1.2,
            edgeDrawFrames: 18,
            edgeStaggerFrames: 6,
            labelRevealAfterEdgeFrames: 4,
            transitionVerb:
              "Central root node fades in first; child edges draw outward from root via stroke-dashoffset over 18 frames, staggered by 6 frames each; labels fade in 4 frames AFTER each edge completes; place a static dot at each edge tip — DO NOT animate arrowheads (Tella's rule).",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 36,
            showCaptions: false,
          }}
        />

        <Composition
          id="BrandedOpener9x16"
          component={BrandedOpener9x16}
          schema={brandedOpener9x16Schema}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            hero: {
              kind: "text-glyph" as const,
              char: "@",
              fontSizePx: 320,
              color: "",
            },
            brandTitle: "ARMANDO INTELLIGENCE",
            brandTagline: "AI · Brand · Voice",
            textPosition: "below" as const,
            heroEnterFrames: 12,
            heroOvershoot: 1.2,
            holdSeconds: 1.5,
            exitFrames: 8,
            stingFrame: 0,
            transitionVerb:
              "Hero brand-tic scales from 0 → 1.2 overshoot → 1.0 over 12 frames using a snappy spring, brand wordmark slides in below the hero with a 4-frame stagger, the composition holds 1.5 seconds, then fades out over 8 frames into the main video content.",
            subjectTool: "gemini",
            palette: "warm-black" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 36,
            showCaptions: false,
            backgroundGradient: "",
          }}
        />

        <Composition
          id="KineticMacroTypeOpener9x16"
          component={KineticMacroTypeOpener9x16}
          schema={kineticMacroTypeOpenerSchema}
          durationInFrames={45}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            word: "RUNTIME",
            bgColor: "#000000",
            textColor: "#FFFFFF",
            fontSizePx: 540,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            durationFrames: 45,
            zoomIntensity: 0.5,
            transitionVerb:
              "Hold the macro-typed word stationary against pure black; if zoomIntensity > 0, scale up subtly from 0.95 to 1.0 over the full duration.",
          }}
        />

        <Composition
          id="BrollListicle9x16"
          component={BrollListicle9x16}
          schema={brollListicle9x16Schema}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            broll: { kind: "solid" as const, color: "#0E0E10" },
            hook: {
              text: "Por qué Gemini 3.2 Flash importa",
              position: "top" as const,
              edgePx: 180,
              background: "#FFFFFF",
              color: "#0A0A0A",
              fontSize: 56,
              maxWidthPx: 920,
            },
            opener: {
              enabled: false,
              hero: "",
              eyebrow: "",
              dek: "",
              durationFrames: 60,
            },
            emojiStrip: {
              enabled: true,
              emojis: ["⚡", "💸", "🚀"],
              topPx: 220,
            },
            beats: [
              { variant: "pill" as const, numberPrefix: "1", title: "10× más barato que GPT-5", bottomLine: "", enterSeconds: 1.5, visibleSeconds: 3 },
              { variant: "pill" as const, numberPrefix: "2", title: "Latencia bajo 200ms", bottomLine: "", enterSeconds: 5, visibleSeconds: 3 },
              { variant: "pill" as const, numberPrefix: "3", title: "92% en benchmarks", bottomLine: "", enterSeconds: 8.5, visibleSeconds: 3 },
            ],
            beatFadeInFrames: 8,
            beatFadeOutFrames: 8,
            captionMode: "karaoke" as const,
            sectionLabel: "",
            transitionVerb:
              "B-roll plays continuously underneath; persistent hook pill stays at top for the entire duration; chapter beats crossfade in mid-frame one after another (8-frame fade in, hold visibleFrames, 8-frame fade out); optional 60-frame opening title card scale-pops at the start; karaoke captions burn over the lower third.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 58,
          }}
        />
      </Folder>

      <Folder name="Landscape-16x9-Wave6">
        <Composition
          id="HormoziTweetCardListicle16x9"
          component={HormoziTweetCardListicle16x9}
          schema={hormoziTweetCardListicle16x9Schema}
          durationInFrames={420}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "WISDOM · GEMINI 3.2",
            headline: "",
            mode: "stack" as const,
            items: [
              {
                number: 1,
                author: {
                  avatarSrc: "",
                  name: "Armando Inteligencia",
                  handle: "@armandointeligencia",
                  verified: true,
                },
                body: "Gemini 3.2 Flash filtra benchmarks: 15× más barato que GPT-5 con casi el mismo score.",
              },
              {
                number: 2,
                author: {
                  avatarSrc: "",
                  name: "Armando Inteligencia",
                  handle: "@armandointeligencia",
                  verified: true,
                },
                body: "Latencia bajo 200ms cambia el cálculo: ahora puedes meter LLM en el loop sin sentir el delay.",
              },
              {
                number: 3,
                author: {
                  avatarSrc: "",
                  name: "Armando Inteligencia",
                  handle: "@armandointeligencia",
                  verified: true,
                },
                body: "El runtime cierra la brecha en 2026 — el modelo deja de ser el foso.",
              },
              {
                number: 4,
                author: {
                  avatarSrc: "",
                  name: "Armando Inteligencia",
                  handle: "@armandointeligencia",
                  verified: true,
                },
                body: "Si tu producto depende de un modelo caro, estás construyendo sobre arena.",
              },
            ],
            anchor: "right" as const,
            anchorInsetPx: 100,
            cardWidthPx: 720,
            numberedBadge: {
              strokeColor: "#C4F84A",
              textColor: "#FFFFFF",
              sizePx: 64,
              show: true,
            },
            stack: {
              append: "down" as const,
              cardGapPx: 28,
              stackBottomPx: 900,
              cardIntervalFrames: 60,
              slideInFrames: 14,
              maxVisibleCards: 5,
            },
            paginate: {
              visibleFrames: 90,
              slideInFrames: 14,
              slideOutFrames: 14,
              crossfade: true,
            },
            startSeconds: 0.4,
            yellowGlow: {
              enabled: false,
              text: "",
              subtitle: "",
              enterFrame: 60,
              visibleFrames: 120,
            },
            brand: "twitter" as const,
            transitionVerb:
              "In stack mode, each numbered tweet card slides in from below at 2-second intervals — as each new card enters from the bottom edge, the existing cards concurrently shift up to make room, building a visible stack of N cards anchored right. In paginate mode, each card slides up from below over 14 frames and holds 90 frames; when the next card enters, the current card concurrently slides up out the top while the next card slides up from below. The lime-green numbered badge overhangs the top-left corner of each card.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
            watermark: {
              enabled: true,
              logo: "avatar" as const,
              position: "bottom-right" as const,
              size: 120,
              opacity: 0.9,
            },
          }}
        />

        <Composition
          id="BeforeAfterText16x9"
          component={BeforeAfterText16x9}
          schema={beforeAfterText16x9Schema}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "THE RUNTIME GAP",
            left: {
              label: "GPT-5",
              body: "Closed",
              sub: "",
              accentColor: "#E07A6B",
            },
            right: {
              label: "GEMINI 3.2",
              body: "Open",
              sub: "",
              accentColor: "#7CE49A",
            },
            operator: {
              symbol: "VS",
              fontSize: 96,
              color: "",
              italic: true,
            },
            connectorGlyph: "",
            emphasisPill: {
              enabled: true,
              text: "The runtime gap closes in 2026",
              emphasisWords: ["runtime"],
              emphasisColor: "#F2A555",
            },
            enterSeconds: 0.4,
            columnStaggerFrames: 6,
            operatorEnterDelaySeconds: 0.3,
            transitionVerb:
              "Left column slides in from the left over 14 frames with blurInFocus; right column slides in from the right over 14 frames, staggered 6 frames after the left; central operator fades in 0.3 seconds after both columns settle; an optional emphasis pill below fades in last.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        {/*
         * R4B Nate B Jones VSContrastTwoColumn (pattern N5) variant — same
         * BeforeAfterText16x9 component, with the central glyph driven by
         * the new top-level `connectorGlyph: "VS"` prop instead of the
         * nested `operator.symbol`. Demonstrates the connectorGlyph
         * override path.
         * Reference: references/creators/natebjones/picks-wave7-batch3.json
         * → video ogTLWGBc3cE at t≈315s.
         */}
        <Composition
          id="BeforeAfterText16x9-VS"
          component={BeforeAfterText16x9}
          schema={beforeAfterText16x9Schema}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "THE RUNTIME GAP",
            left: {
              label: "Scoped Agent",
              body: "Trusted",
              sub: "",
              accentColor: "#7CE49A",
            },
            right: {
              label: "Unknown Actor",
              body: "Unverified",
              sub: "",
              accentColor: "#E07A6B",
            },
            operator: {
              symbol: "TO",
              fontSize: 96,
              color: "",
              italic: true,
            },
            connectorGlyph: "VS",
            emphasisPill: {
              enabled: true,
              text: "Identity is the new perimeter",
              emphasisWords: ["Identity"],
              emphasisColor: "#F2A555",
            },
            enterSeconds: 0.4,
            columnStaggerFrames: 6,
            operatorEnterDelaySeconds: 0.3,
            transitionVerb:
              "Left column slides in from the left over 14 frames with blurInFocus; right column slides in from the right over 14 frames, staggered 6 frames after the left; central operator fades in 0.3 seconds after both columns settle; an optional emphasis pill below fades in last.",
            breadcrumb: { text: "Nate B Jones", date: "VSContrastTwoColumn (N5)" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        <Composition
          id="BigNumberHorizontalBars16x9"
          component={BigNumberHorizontalBars16x9}
          schema={bigNumberHorizontalBars16x9Schema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "BENCHMARKS",
            heroNumber: {
              value: 92,
              label: "BENCHMARK",
              sublabel: "Gemini 3.2 Flash",
              countDurationSeconds: 1.2,
              prefix: "",
              suffix: "%",
            },
            bars: [
              { label: "Speed", value: 95, suffix: "%", color: "#5BC0E8", sub: "<200ms latency" },
              { label: "Quality", value: 92, suffix: "%", color: "#7CE49A", sub: "vs GPT-5.5" },
              { label: "Cost", value: 98, suffix: "%", color: "#F2A555", sub: "15× cheaper" },
              { label: "Context", value: 100, suffix: "%", color: "#9A8FFF", sub: "1M tokens" },
              { label: "Multimodal", value: 88, suffix: "%", color: "#E07A6B", sub: "img · video · audio" },
            ],
            maxValue: 100,
            staggerFrames: 4,
            fillDurationSeconds: 0.8,
            firstBarEnterSeconds: 0.5,
            emphasisPill: {
              enabled: true,
              text: "92% of GPT-5.5 at 1/15th the price",
              emphasisWords: ["92%", "1/15th"],
              emphasisColor: "#F2A555",
            },
            watermark: {
              enabled: true,
              logo: "avatar" as const,
              position: "bottom-right" as const,
              size: 120,
              opacity: 0.9,
            },
            transitionVerb:
              "Hero number on the LEFT counts up from 0 to value over 1.2 seconds using outQuart easing while bars on the RIGHT enter staggered 4 frames apart; each bar's fill width interpolates from 0 to (value/max)*containerWidth over 0.8 seconds with outQuart easing, and the bar's count value rolls up via countUp synced to the fill window.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        <Composition
          id="SplitScreenInterviewLayout16x9"
          component={SplitScreenInterviewLayout16x9}
          schema={splitScreenInterviewLayout16x9Schema}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            left: {
              videoSrc: "",
              imageSrc: "",
              nameTag: "Host",
              title: "@armandointeligencia",
              accentColor: "",
            },
            right: {
              videoSrc: "",
              imageSrc: "",
              nameTag: "Guest",
              title: "Gemini Researcher",
              accentColor: "",
            },
            lowerThird: {
              enabled: true,
              title: "The Real Gemini 3.2 Flash Story",
              subtitle: "Filtración de Google I/O 2026",
              enterFrame: 60,
              exitFrame: 300,
            },
            yellowGlow: {
              enabled: false,
              text: "",
              subtitle: "",
              enterFrame: 0,
              visibleFrames: 120,
            },
            desaturate: false,
            captionMode: "none" as const,
            sectionLabel: "INTERVIEW",
            transitionVerb:
              "Two video panels render side-by-side at 50/50 ratio for the entire composition duration (no transitions, persistent layout). Each speaker has a name tag below with optional accent-colored title. Optional lower-third banner crossfades in at enterFrame and out at exitFrame.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        <Composition
          id="TitleCardKineticTwoLine16x9"
          component={TitleCardKineticTwoLine16x9}
          schema={titleCardKineticTwoLine16x9Schema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            headline: "Gemini 3.2 Flash",
            subtitle: "The runtime question that defines 2026",
            eyebrow: "BENCHMARK BREAKDOWN",
            background: {
              color: "#0A0F1A",
              glowColor: "#5BC0E8",
              glowOpacity: 0.18,
              glowRadiusPx: 720,
            },
            typography: {
              headlineFontSize: 140,
              subtitleFontSize: 48,
              eyebrowFontSize: 24,
              headlineColor: "#FFFFFF",
              subtitleColor: "#9AA0A6",
              eyebrowColor: "#5BC0E8",
              headlineUppercase: false,
              eyebrowUppercase: true,
              letterSpacing: "-0.02em",
            },
            enterFrame: 0,
            fadeInFrames: 12,
            visibleFrames: 60,
            fadeOutFrames: 12,
            useBlurInFocus: true,
            transitionVerb:
              "Title card fades in over 12 frames using blurInFocus (14px → 0px blur, 0.96 → 1.0 scale, opacity 0 → 1), holds STATIC for 60 frames (no typewriter, no per-word reveal — this is the key difference from KineticTypoCard), then fades out over 12 frames. A soft radial glow halo sits behind the typography for depth.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            watermark: null,
            watermarkHandle: "@armandointeligencia",
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        {/*
          PipelineFlow16x9 is variable-N (2-6 stages) since R4B Nate N6.
          Default registration is N=4 (Nate's original
          `FourStageHorizontalFlowDiagram`). The N=3 sibling registration
          below renders Nate's `ThreeCardArrowFlow` example using the SAME
          component — just shorter `stages`.
        */}
        <Composition
          id="PipelineFlow16x9"
          component={PipelineFlow16x9}
          schema={pipelineFlow16x9Schema}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "THE PIPELINE",
            // Default N=4 — pass shorter `stages` for N=3 (Nate ThreeCardArrowFlow).
            stages: [
              { name: "Prompt", body: "User input", kind: "input" as const, color: "", enterOffsetSeconds: 0 },
              { name: "Gemini Flash", body: "Reasoning", kind: "agent" as const, color: "", enterOffsetSeconds: 0 },
              { name: "Tools", body: "MCP plugins", kind: "tool" as const, color: "", enterOffsetSeconds: 0 },
              { name: "Response", body: "Streaming", kind: "output" as const, color: "", enterOffsetSeconds: 0 },
            ],
            connectorStyle: "chevron" as const,
            emphasisPill: {
              enabled: true,
              text: "Gemini Flash makes local AI feel normal",
              emphasisWords: ["normal"],
              emphasisColor: "#F2A555",
            },
            firstStageDelaySeconds: 0.4,
            sequenceStepSeconds: 0.6,
            connectorDrawFrames: 10,
            pillEnterDelayAfterLastStageSeconds: 0.3,
            transitionVerb:
              "Each stage card slides up from below over 10 frames staggered by 0.6 seconds (cumulative); after each card lands, the connector to its right (chevron / arrow / + / →) draws via stroke-dashoffset over 10 frames; the emphasis-pill caption fades in 0.3 seconds after the last stage settles.",
            breadcrumb: { text: "Google", date: "I/O 2026 · Filtración" },
            subjectTool: "gemini",
            palette: "dark" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        {/*
          PipelineFlow16x9N3 — R4B Nate N6 ThreeCardArrowFlow variant.
          Same component, N=3 default props from Nate's `Messy Files →
          Key Questions → Clear Story` reference. Demonstrates that the
          ThreeCardArrowFlow shape is just a variable-N PipelineFlow with
          a shorter `stages` array. (Remotion composition IDs disallow
          underscores, so we suffix with bare "N3".)
        */}
        <Composition
          id="PipelineFlow16x9N3"
          component={PipelineFlow16x9}
          schema={pipelineFlow16x9Schema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "THE WORKFLOW",
            stages: [
              { name: "Messy Files", body: "Raw notes & docs", kind: "input" as const, color: "", enterOffsetSeconds: 0 },
              { name: "Key Questions", body: "What matters?", kind: "agent" as const, color: "", enterOffsetSeconds: 0 },
              { name: "Clear Story", body: "Structured narrative", kind: "output" as const, color: "", enterOffsetSeconds: 0 },
            ],
            connectorStyle: "arrow" as const,
            emphasisPill: {
              enabled: true,
              text: "Three steps from mess to message",
              emphasisWords: ["message"],
              emphasisColor: "#F2A555",
            },
            firstStageDelaySeconds: 0.4,
            sequenceStepSeconds: 0.6,
            connectorDrawFrames: 10,
            pillEnterDelayAfterLastStageSeconds: 0.3,
            transitionVerb:
              "Each stage card slides up from below over 10 frames staggered by 0.6 seconds (cumulative); after each card lands, the connector to its right (chevron / arrow / + / →) draws via stroke-dashoffset over 10 frames; the emphasis-pill caption fades in 0.3 seconds after the last stage settles.",
            breadcrumb: { text: "Nate B Jones", date: "ThreeCardArrowFlow" },
            subjectTool: null,
            palette: "cream" as const,
            paperColor: "",
            inkColor: "",
            accentColor: "",
            mutedColor: "",
            captionFontSize: 40,
            showCaptions: false,
          }}
        />

        <Composition
          id="ThreeRowLabeledCardStack16x9"
          component={ThreeRowLabeledCardStack16x9}
          schema={threeRowLabeledCardStackSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            rows: [
              { label: "TRACE", title: "Tool Calls" },
              { label: "WORKFLOW", title: "Task Outcome" },
              { label: "PRODUCT", title: "User Value" },
            ],
            caption: {
              text: "Three axes evaluate every agent",
              keyword: "evaluate",
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Stack three labeled cards top-to-bottom, each fading in and ramping a thin vertical rule between its left label tab and its right title; once all three rows are placed, the caption pill below fades in with one orange keyword.",
          }}
        />

        <Composition
          id="EquationCardChain16x9"
          component={EquationCardChain16x9}
          schema={equationCardChainSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            operands: [
              { text: "Bullseye", accentColor: "" },
              { text: "Boundaries", accentColor: "" },
            ],
            result: { text: "Good Search", accentColor: "" },
            caption: {
              text: "Two halves make good search",
              keyword: "good",
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Land the operand cards one by one left-to-right; after each card settles, its + separator pops in matching the next card's accent color; the final = and result card slide in last, then the caption pill fades in below with the keyword tinted orange.",
          }}
        />

        <Composition
          id="SectionDividerTitleCard16x9"
          component={SectionDividerTitleCard16x9}
          schema={sectionDividerTitleCardSchema}
          durationInFrames={30}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            title: "Section II",
            eyebrow: "PART OF A LONGER STORY",
            handle: "@armandointeligencia",
            durationFrames: 30,
            transitionVerb:
              "Fade in the eyebrow, then ramp the title up from below with a soft spring, hold for the breath-beat, then fade out.",
          }}
        />

        {/*
          StudioCompositor16x9 — Igor Pogany (theaiadvantage) P1, Wave-7 ADR-001
          §4.1 Rank 1. Brand-voice analog: dark-slate chassis with bottom-left
          presenter PIP + perspective-tilted glowing UI mockup on the right.
          Defaults use the brand avatar (`brand/logos/avatar-pixar.png`) as a
          static-image presenter placeholder and the avatar-letters lockup as
          a UI-mockup placeholder so the composition renders cleanly in Studio
          before real assets are wired in.
        */}
        <Composition
          id="StudioCompositor16x9"
          component={StudioCompositor16x9}
          schema={studioCompositorSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            uiMockup: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatarLetters}`),
              altText: "UI mockup placeholder",
              glowColor: "#3FB8FF",
            },
            presenter: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatar}`),
              isVideo: false,
              widthPx: 420,
            },
            caption: {
              text: "Studio compositor is the chassis",
              keyword: "chassis",
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Float the perspective-tilted UI mockup in from the right with a soft glow halo while the presenter PIP fades up from the lower-left corner; once both elements are settled, the caption pill below fades in with one orange keyword.",
          }}
        />

        <Composition
          id="MemeLoopDiagram16x9"
          component={MemeLoopDiagram16x9}
          schema={memeLoopDiagramSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            loopCards: [
              { label: "ChatGPT" },
              { label: "Claude" },
              { label: "Gemini" },
              { label: "Grok" },
            ],
            outlierPin: {
              label: "Llama",
              corner: "TR" as const,
            },
            arcColor: "#5BC0E8",
            arcStrokeWidth: 4,
            caption: {
              text: "The closed-source loop excludes one",
              keyword: "excludes",
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Pop in the four loop cards one by one in clockwise order from NE → SE → SW → NW; after the last card settles, the circular arc draws itself clockwise connecting them; the outlier corner card pops in last; finally the caption pill fades in below with the keyword tinted orange.",
          }}
        />

        {/*
          KeynoteSlidePIP16x9 — All-In Podcast P2 + P5 (Wave-7 ADR-001 §4.1
          Rank 2). Large keynote slide pinned left-two-thirds + white-bordered
          speaker face-cam PIP bottom-right + persistent event-lockup chyron
          anchored BL (the Summit default). Caption register = 'none' per
          allin grammar — no burned-in captions on this chassis. Defaults
          use the avatar-letters lockup as a placeholder slide and the
          avatar-pixar glyph as a static-image speaker so the composition
          renders cleanly in Studio before real assets are wired in.
        */}
        <Composition
          id="KeynoteSlidePIP16x9"
          component={KeynoteSlidePIP16x9}
          schema={keynoteSlidePIPSchema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            slide: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatarLetters}`),
              altText: "Keynote slide placeholder",
            },
            speaker: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatar}`),
              isVideo: false,
              widthPx: 420,
            },
            chyron: {
              brandToken: "ARMANDO",
              regionalEventToken: "SUMMIT",
              anchor: "BL" as const,
            },
            handle: "@armandointeligencia",
            durationFrames: 180,
            transitionVerb:
              "Fade up the slide on the left two-thirds while the white-bordered speaker PIP slides in from the lower-right; the persistent event chyron is present from frame 0 — never animates.",
          }}
        />

        {/*
          KeynoteSlidePIP16x9-Davos — Davos regional variant (allin §P12).
          Same component, chyron token swap (SUMMIT → DAVOS) and corner swap
          (BL → BR). Mirrors the B21 BeforeAfterText16x9-VS pattern of
          registering a second Studio entry for a token-swap variant of the
          same composition.
        */}
        <Composition
          id="KeynoteSlidePIP16x9-Davos"
          component={KeynoteSlidePIP16x9}
          schema={keynoteSlidePIPSchema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            slide: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatarLetters}`),
              altText: "Keynote slide placeholder",
            },
            speaker: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatar}`),
              isVideo: false,
              widthPx: 420,
            },
            chyron: {
              brandToken: "ARMANDO",
              regionalEventToken: "DAVOS",
              anchor: "BR" as const,
            },
            handle: "@armandointeligencia",
            durationFrames: 180,
            transitionVerb:
              "Fade up the slide on the left two-thirds while the white-bordered speaker PIP slides in from the lower-right; the persistent event chyron is present from frame 0 in the bottom-right corner — never animates.",
          }}
        />

        {/*
          LiveEventAudienceMicSplitScreen16x9 — Hormozi NEW-H7 (Wave-7 Batch 3
          Extension) + theaiadvantage auditorium-duel convergence pattern.
          Defaults use the brand avatar / avatar-letters lockup as static
          placeholders so the composition renders cleanly in Studio before
          real audience/speaker assets are wired in.
        */}
        <Composition
          id="LiveEventAudienceMicSplitScreen16x9"
          component={LiveEventAudienceMicSplitScreen16x9}
          schema={liveEventAudienceMicSplitScreenSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            left: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatar}`),
              isVideo: false,
              label: "AUDIENCE",
            },
            right: {
              src: staticFile(`brand/logos/${BRAND_LOGO_FILENAMES.avatarLetters}`),
              isVideo: false,
              label: "SPEAKER",
            },
            seam: {
              width: 0,
              color: "#FFFFFF",
            },
            caption: {
              text: "Two halves of the same coaching moment",
              keyword: "coaching",
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Crossfade in both panes simultaneously over 8 frames at chassis entry; if a seam is configured, it draws in 4 frames after the panes settle; name tag overlays fade in last.",
          }}
        />

        {/*
          StudioDeskTalkingHead16x9 — B15, Wave-7. The convergent owned-media
          desk talking-head (Hormozi/Adam Rosler/Matt Wolfe/Igor). Distinct from
          StudioCompositor16x9 (presenter-LEFT + UI-mockup-RIGHT): a centered
          seated presenter on the dark-slate chassis with a persistent
          lower-third name tag + optional topic chip, no UI-mockup pane.
        */}
        <Composition
          id="StudioDeskTalkingHead16x9"
          component={StudioDeskTalkingHead16x9}
          schema={studioDeskTalkingHeadSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            presenterName: "Armando Inteligencia",
            presenterRole: "@armandointeligencia",
            topicChip: "GEMINI 3.2 FLASH",
            presenterImage: "brand/logos/avatar-pixar.png",
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Fade the seated presenter tile up from below, drop in the topic chip from above, then slide the lower-third name tag in from the left with its gold accent rule wiping under the name; hold the host register without fading out.",
          }}
        />

        {/*
          FlipChartLiveDrawing16x9 — B17, Wave-7. Hormozi NEW-H8 flip-chart +
          Matt Wolfe easel convergence: a cream flip-chart pad over the slate
          chassis with marker-ink title and bullet labels revealed live via
          stroke-dashoffset hand-drawn marks. Self-schedules from durationFrames.
        */}
        <Composition
          id="FlipChartLiveDrawing16x9"
          component={FlipChartLiveDrawing16x9}
          schema={flipChartLiveDrawingSchema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            title: "WHO? METRICS? MARKET?",
            items: [
              { text: "LEADS", emphasis: true },
              { text: "SALES" },
              { text: "OPS" },
              { text: "FULFILLMENT" },
            ],
            markerColor: "#D4AF37",
            handle: "@armandointeligencia",
            durationFrames: 180,
            transitionVerb:
              "Settle a cream flip-chart pad onto the slate, write the title as marker ink with a hand-drawn underline, then reveal each bullet one-by-one with a text wipe and a stroke-dashoffset sharpie mark; jitter feels hand-drawn; never move the camera.",
          }}
        />

        {/*
          KaraokeWithBlueChipPullout9x16 — B24b, Wave-7. Nate B Jones C7 Shorts
          pattern: green-current-word karaoke baseline + a SCHEDULE of blue
          rounded-pill keyword chips sliding in from the right edge per beat.
          9:16 lives on the caption layer (no slate cards — ADR-001 Add. A.2).
        */}
        <Composition
          id="KaraokeWithBlueChipPullout9x16"
          component={KaraokeWithBlueChipPullout9x16}
          schema={karaokeWithBlueChipPulloutSchema}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calcDurationFromAudio}
          defaultProps={{
            audioUrl: "audio.mp3",
            wordTimings: [
              { text: "Claude", startFrame: 0, endFrame: 14, startSeconds: 0.0, endSeconds: 0.47 },
              { text: "is", startFrame: 15, endFrame: 22, startSeconds: 0.5, endSeconds: 0.73 },
              { text: "the", startFrame: 23, endFrame: 30, startSeconds: 0.77, endSeconds: 1.0 },
              { text: "best", startFrame: 31, endFrame: 52, startSeconds: 1.03, endSeconds: 1.73 },
              { text: "AI", startFrame: 53, endFrame: 74, startSeconds: 1.77, endSeconds: 2.47 },
              { text: "for", startFrame: 75, endFrame: 82, startSeconds: 2.5, endSeconds: 2.73 },
              { text: "writing", startFrame: 83, endFrame: 110, startSeconds: 2.77, endSeconds: 3.67 },
              { text: "production", startFrame: 111, endFrame: 140, startSeconds: 3.7, endSeconds: 4.67 },
              { text: "code", startFrame: 141, endFrame: 165, startSeconds: 4.7, endSeconds: 5.5 },
            ],
            keywordChipSchedule: [
              { word: "Claude", startMs: 0, endMs: 1700 },
              { word: "best AI", startMs: 1770, endMs: 3670 },
              { word: "production code", startMs: 3700, endMs: 5800 },
            ],
            chipColor: "#3FB8FF",
            chipTextColor: "#001018",
            activeWordColor: "#2ECC71",
            pastWordColor: "#FFFFFF",
            backgroundColor: "#000000",
            handle: "@armandointeligencia",
            durationFrames: 180,
            transitionVerb:
              "Hold the green-current-word karaoke baseline running underneath; for each beat, slide a blue rounded-pill keyword chip in from the right edge of the lower-third, hold while the keyword is spoken, then slide it back out before the next chip pulls in.",
          }}
        />

        {/*
          ThreeStageRisingBars16x9 — Nate N2. Three uppercase-labeled NARRATIVE
          bar towers (Then/Now/Next) rising L-to-R on the slate chassis; heights
          are categorical small/medium/large, not data. Distinct from
          BigNumberHorizontalBars16x9 (quantitative).
        */}
        <Composition
          id="ThreeStageRisingBars16x9"
          component={ThreeStageRisingBars16x9}
          schema={threeStageRisingBarsSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            bars: [
              { label: "THEN", heightLevel: "small" },
              { label: "NOW", heightLevel: "medium" },
              { label: "NEXT", heightLevel: "large" },
            ],
            caption: { text: "Each wave compounds the last", keyword: "compounds" },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Reveal three uppercase-labeled bar towers left-to-right, each rising from baseline to its target height with a soft ease-out while its accent border draws around it; once all three are placed, the caption pill fades in below with one orange keyword.",
          }}
        />

        {/*
          TopHeroBottomTrioCards16x9 — Nate N4. Hero card drops from above; once
          settled, three supporting cards rise from below L-to-R (label tab leads
          headline by ~50ms); caption pill fades in last. Hierarchy via vertical
          position, not type weight.
        */}
        <Composition
          id="TopHeroBottomTrioCards16x9"
          component={TopHeroBottomTrioCards16x9}
          schema={topHeroBottomTrioCardsSchema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(30, Math.round(props.durationFrames)),
          })}
          defaultProps={{
            hero: { label: "THE SHIFT", title: "Prompting as we knew it is obsolete" },
            supporting: [
              { label: "MODEL", title: "Reasons over instructions" },
              { label: "CONTEXT", title: "Goals beat step-by-steps" },
              { label: "WORKFLOW", title: "Verify, don't hand-hold" },
            ],
            caption: { text: "The new skill is framing the problem", keyword: "framing" },
            handle: "@armandointeligencia",
            durationFrames: 150,
            transitionVerb:
              "Land the hero card from above with a soft drop; once it settles, the three supporting cards rise from below in left-to-right sequence, each with its label tab fading in 50ms before its headline; finally the caption pill fades in below.",
          }}
        />

        {/*
          SpeakerOverlayScene16x9 / 9x16 — Wave-8 foundation. Full-bleed base
          talking-head footage (videoSrc) + configurable FloatingCaption + a
          slot for over-speaker overlay molecules. The enabler for "edit my
          talking-head video": subtitles + motion graphics composited onto real
          footage. videoSrc omitted here → renders a "BASE VIDEO" placeholder.
        */}
        <Composition
          id="SpeakerOverlayScene16x9"
          component={SpeakerOverlayScene16x9}
          schema={speakerOverlayScene16x9Schema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            caption: {
              wordTimings: [],
              position: "bottom-center",
              mode: "karaoke",
              register: "editorial",
              widthPct: 70,
              windowSize: 6,
              windowGapMs: 60,
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
            overlays: [
              {
                type: "BuildingBulletListOverSpeaker",
                props: {
                  heading: "EDICIÓN AUTOMÁTICA",
                  items: [
                    { text: "Transcribe" },
                    { text: "Subtítulos flotantes" },
                    { text: "Gráficos sobre ti" },
                    { text: "Corta silencios" },
                  ],
                  anchor: "left",
                  enterFrame: 6,
                  beatFrames: 22,
                  holdFrames: 100,
                },
              },
              {
                type: "IconPopOverSpeaker",
                props: { icon: "🎬", anchor: "top-right", enterFrame: 10, holdFrames: 110, sizePx: 150 },
              },
            ],
          }}
        />

        {/*
          SpeakerLayoutDemo16x9 — Wave-9 demo of the Tella-style scene-layout
          engine (D1) + a caption STYLE preset (D3) + a region-box emphasis
          molecule (D3). Same component, layout-mode defaultProps: cam+screen
          placeholders glide full-cam → corner-bubble → split with smooth tweens
          over Jack's framed gradient backdrop, hormozi-pop captions, a red
          region box on the screen during the corner-bubble phase.
        */}
        <Composition
          id="SpeakerLayoutDemo16x9"
          component={SpeakerOverlayScene16x9}
          schema={speakerOverlayScene16x9Schema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            caption: {
              style: "hormozi-pop",
              wordTimings: [
                { text: "Cambia", startFrame: 0, endFrame: 20, startSeconds: 0, endSeconds: 0.67 },
                { text: "de", startFrame: 21, endFrame: 30, startSeconds: 0.7, endSeconds: 1.0 },
                { text: "escena", startFrame: 31, endFrame: 60, startSeconds: 1.03, endSeconds: 2.0 },
                { text: "con", startFrame: 61, endFrame: 72, startSeconds: 2.03, endSeconds: 2.4 },
                { text: "un", startFrame: 73, endFrame: 82, startSeconds: 2.43, endSeconds: 2.73 },
                { text: "clic", startFrame: 83, endFrame: 110, startSeconds: 2.77, endSeconds: 3.67 },
              ],
              position: "bottom-center",
              mode: "karaoke",
              widthPct: 70,
              windowSize: 6,
              windowGapMs: 60,
            },
            handle: "@armandointeligencia",
            durationFrames: 300,
            baseLayout: "framed-backdrop",
            backdrop: { type: "gradient", angleDeg: 120, stops: ["#3B82F6", "#1E5FD8", "#0B3A9C"] },
            layoutTrack: [
              { id: "lay-0", startFrame: 0, endFrame: 90, layout: "full-cam", transition: { type: "cut" } },
              { id: "lay-1", startFrame: 90, endFrame: 210, layout: "corner-bubble-br-md", transition: { type: "smooth", durationFrames: 14 } },
              { id: "lay-2", startFrame: 210, endFrame: 300, layout: "split-5050", transition: { type: "smooth", durationFrames: 12 } },
            ],
            overlays: [
              {
                type: "RegionBoxAnnotation",
                props: { region: { x: 0.06, y: 0.16, w: 0.46, h: 0.3 }, color: "#E5484D", badge: "1", enter: "pop", enterFrame: 100, exitFrame: 205 },
              },
            ],
          }}
        />

        <Composition
          id="SpeakerOverlayScene9x16"
          component={SpeakerOverlayScene9x16}
          schema={speakerOverlayScene9x16Schema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            caption: {
              wordTimings: [],
              position: "center",
              mode: "karaoke",
              register: "editorial",
              widthPct: 70,
              fontSize: 64,
              windowSize: 6,
              windowGapMs: 60,
            },
            handle: "@armandointeligencia",
            durationFrames: 150,
          }}
        />

        {/* Wave-8 16:9 siblings (ADR-001 §4 adaptation, batch 1) */}
        <Composition
          id="BigNumberHero16x9"
          component={BigNumberHero16x9}
          schema={bigNumberHero16x9Schema}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            number: "15×",
            kicker: "GEMINI 3.2 FLASH",
            subtitle: "más barato que GPT-5",
            countUp: false,
            typography: { numberFontSize: 160, subtitleFontSize: 36, captionTextFontSize: 26, kickerFontSize: 28 },
            breadcrumb: { text: "Google", date: "Filtración" },
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 96, opacity: 0.9 },
            watermarkHandle: "@armandointeligencia",
            subjectTool: null,
            palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 36,
            showCaptions: false,
          }}
        />

        <Composition
          id="TweetCardHero16x9"
          component={TweetCardHero16x9}
          schema={tweetCardHero16x9Schema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            tweet: {
              name: "Armando Inteligencia",
              handle: "armandointeligencia",
              avatarUrl: "",
              body: "Gemini 3.2 Flash filtra benchmarks: 15× más barato que GPT-5 con casi el mismo score. Esto cambia el cálculo para todos los que están construyendo con LLMs.",
              timestamp: "May 18",
              verified: true,
              replies: 142, retweets: 980, likes: 4500,
            },
            artifactImageUrl: "",
            faceCamImageUrl: "",
            cardWidthPx: 760,
            bodyFontSize: 34,
            breadcrumb: { text: "Google", date: "Filtración" },
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 96, opacity: 0.9 },
            watermarkHandle: "@armandointeligencia",
            subjectTool: null,
            palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 34,
            showCaptions: false,
          }}
        />

        <Composition
          id="BarChartList16x9"
          component={BarChartList16x9}
          schema={barChartList16x9Schema}
          durationInFrames={210}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            sectionLabel: "LLM ADOPTION BY TEAM",
            bars: [
              { label: "Engineering", value: 82, suffix: "%", color: "#5BC0E8", decimals: 0 },
              { label: "Data Science", value: 67, suffix: "%", color: "#7CE49A", decimals: 0 },
              { label: "Product", value: 54, suffix: "%", color: "#9A8FFF", decimals: 0 },
              { label: "Design", value: 38, suffix: "%", color: "#F2A555", decimals: 0 },
              { label: "Operations", value: 21, suffix: "%", color: "#8B847A", decimals: 0 },
            ],
            direction: "ltr",
            staggerFrames: 4,
            fillDurationSeconds: 0.8,
            firstBarEnterSeconds: 0.5,
            breadcrumb: { text: "ANTHROPIC", date: "MAY 31, 2026" },
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            subjectTool: null,
            palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            sectionLabelFontSize: 30, labelFontSize: 40, valueFontSize: 48, captionFontSize: 36,
            showCaptions: false,
          }}
        />

        <Composition
          id="AnimatedTable16x9"
          component={AnimatedTable16x9}
          schema={animatedTable16x9Schema}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "",
            wordTimings: [],
            title: "Frontier Model Comparison",
            subtitle: "Across context, price, and speed (May 2026)",
            headers: ["Model", "Context", "$ / 1M in", "Tokens/s", "MMLU"],
            rows: [
              ["Claude Opus 4.8", "1M", "$5.00", "92", "89.1"],
              ["GPT-5.2", "400K", "$6.50", "78", "88.4"],
              ["Gemini 3.2 Pro", "2M", "$4.20", "104", "87.9"],
              ["Llama 4 405B", "256K", "$0.90", "61", "85.2"],
            ],
            highlightRowIndex: 0,
            rowStaggerSeconds: 0.2,
            headerDelaySeconds: 0.4,
            sourceCaption: "Source: vendor docs + internal benchmarks, May 2026",
            breadcrumb: { text: "ANTHROPIC", date: "MAY 31, 2026" },
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            subjectTool: null,
            palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            titleFontSize: 72, subtitleFontSize: 40, headerFontSize: 32, rowFontSize: 40, captionFontSize: 36,
            showCaptions: false,
          }}
        />

        {/* Wave-8 16:9 siblings (ADR-001 §4 adaptation, batch 2) */}
        <Composition
          id="DecisionTree16x9"
          component={DecisionTree16x9}
          schema={decisionTree16x9Schema}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Decide when to use AI",
            subtitle: "",
            sectionLabel: "",
            rootNode: { label: "AI for this task?", sub: "", color: "" },
            children: [
              { label: "Delegate to AI", sub: "Routine tasks", color: "#7CE49A" },
              { label: "Collaborate", sub: "Hard decisions", color: "#5BC0E8" },
              { label: "Avoid AI", sub: "Personal stuff", color: "#E89B7A" },
            ],
            layout: "radial-fan",
            edgeTipMarker: "dot",
            rootEnterSeconds: 0.4,
            edgeDrawStartSeconds: 1.2,
            edgeDrawFrames: 18,
            edgeStaggerFrames: 6,
            labelRevealAfterEdgeFrames: 4,
            palette: "dark",
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            breadcrumb: null,
            subjectTool: null,
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            titleFontSize: 56,
            audioUrl: "", wordTimings: [],
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="LineChartAnnotated16x9"
          component={LineChartAnnotated16x9}
          schema={lineChartAnnotated16x9Schema}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            sectionLabel: "MODEL ACCURACY",
            xLabels: ["Jan 2024", "Jul 2024", "Jan 2025", "Jul 2025", "Jan 2026"],
            series: [
              {
                name: "Accuracy",
                color: "",
                values: [62, 71, 80, 88, 94],
                annotations: [
                  { atIndex: 2, text: "GPT-4o" },
                  { atIndex: 4, text: "94%" },
                ],
              },
            ],
            showAxes: true,
            showValueReadout: true,
            drawDurationSeconds: 1.2,
            enterSeconds: 0.5,
            palette: "dark",
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            breadcrumb: null,
            subjectTool: null,
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            audioUrl: "", wordTimings: [],
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="Sparkline16x9"
          component={Sparkline16x9}
          schema={sparkline16x9Schema}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            kicker: "ADOPTION",
            title: "AI tool weekly actives",
            data: [12, 18, 24, 31, 40, 55, 68, 80, 92],
            valueFormat: "{v}%",
            decimals: 0,
            showAreaFill: true,
            showTrendBadge: true,
            drawDurationSeconds: 1.2,
            sourceCaption: "Source: internal telemetry",
            palette: "dark",
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            breadcrumb: null,
            subjectTool: null,
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            audioUrl: "", wordTimings: [],
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="BenchmarkBars16x9"
          component={BenchmarkBars16x9}
          schema={benchmarkBars16x9Schema}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Precio por millón de tokens",
            subtitle: "Input tokens — Mayo 2026",
            bars: [
              { label: "Gemini Flash", value: "$0.10", widthPct: 0.08, color: "#5BC0E8" },
              { label: "Claude Haiku", value: "$0.25", widthPct: 0.2, color: "#7CE49A" },
              { label: "GPT-4o mini", value: "$0.60", widthPct: 0.48, color: "" },
              { label: "GPT-4o", value: "$1.25", widthPct: 1.0, color: "" },
            ],
            sourceCaption: "Precios públicos — openai.com, anthropic.com, google.com",
            barStaggerSeconds: 0.3,
            barAnimSeconds: 0.8,
            palette: "dark",
            watermark: { enabled: true, logo: "avatar", position: "bottom-right", size: 120, opacity: 0.9 },
            breadcrumb: null,
            subjectTool: null,
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            titleFontSize: 72, subtitleFontSize: 38, labelFontSize: 40, valueFontSize: 44,
            audioUrl: "", wordTimings: [],
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="LayerCardStack16x9"
          component={LayerCardStack16x9}
          schema={layerCardStack16x9Schema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Las 3 capas de la IA",
            palette: "dark",
            cardStaggerSeconds: 0.35,
            showCaptions: false,
            watermarkHandle: "@armandointeligencia",
            cards: [
              { badge: "LAYER 1", headline: "Foundation", body: "The base layer that everything is built on.", icon: "⬛" },
              { badge: "LAYER 2", headline: "Reasoning", body: "Where models learn to think step-by-step.", icon: "🧩" },
              { badge: "LAYER 3", headline: "Agency", body: "Autonomous action with memory and tools.", icon: "🚀" },
            ],
          }}
        />

        <Composition
          id="DiagramExplainer16x9"
          component={DiagramExplainer16x9}
          schema={diagramExplainer16x9Schema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            sectionLabel: "EL FLUJO",
            palette: "dark",
            sequenceStepSeconds: 1.2,
            firstNodeDelaySeconds: 0.4,
            showCaptions: false,
            nodes: [
              { title: "Input", sublabel: "prompt" },
              { title: "Reasoning", sublabel: "chain-of-thought" },
              { title: "Output", sublabel: "completion" },
            ],
          }}
        />

        <Composition
          id="KineticEssay16x9"
          component={KineticEssay16x9}
          schema={kineticEssay16x9Schema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            palette: "dark",
            firstLineDelaySeconds: 0.6,
            sequenceStepSeconds: 1.2,
            showCaptions: false,
            lines: [
              { text: "El modelo", style: "sans-bold", align: "center" },
              { text: "no es el foso", style: "serif-italic", emphasizeWords: ["foso"], align: "center" },
            ],
          }}
        />

        <Composition
          id="VennDiagram16x9"
          component={VennDiagram16x9}
          schema={vennDiagram16x9Schema}
          durationInFrames={210}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "AI · Brand · Voice",
            mode: "3-circle-stacked",
            palette: "dark",
            intersectionLabel: "Sweet spot",
            circleEnterSeconds: 0.5,
            circleStaggerSeconds: 0.6,
            intersectionLabelStartSeconds: 3.5,
            showCaptions: false,
            circles: [
              { label: "AI", sub: "Tools", color: "#5BC0E8", fillOpacity: 0.35 },
              { label: "BRAND", sub: "Identity", color: "#E89B7A", fillOpacity: 0.35 },
              { label: "VOICE", sub: "Tone", color: "#7CE49A", fillOpacity: 0.35 },
            ],
          }}
        />

        <Composition
          id="ForceGraph16x9"
          component={ForceGraph16x9}
          schema={forceGraph16x9Schema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "", wordTimings: [], title: "Knowledge Graph",
            nodes: [
              { id: "a", label: "Claude", group: "LLM", weight: 1.5 },
              { id: "b", label: "GPT-4", group: "LLM", weight: 1 },
              { id: "c", label: "Gemini", group: "LLM", weight: 1 },
              { id: "d", label: "RAG", group: "Arch", weight: 1 },
              { id: "e", label: "Agent", group: "Arch", weight: 1.2 },
            ],
            edges: [
              { source: "a", target: "d" }, { source: "b", target: "d" },
              { source: "d", target: "e" }, { source: "c", target: "e" },
            ],
            focusNodeId: "a", showNodeLabels: true, rotateSlowly: false,
            breadcrumb: null, watermark: null, watermarkHandle: "@armandointeligencia",
            subjectTool: null, palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="NeuralNetwork16x9"
          component={NeuralNetwork16x9}
          schema={neuralNetwork16x9Schema}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "", wordTimings: [], title: "Red Neuronal", subtitle: "Propagación de activaciones",
            layers: [4, 6, 6, 4], layerLabels: ["INPUT", "HIDDEN 1", "HIDDEN 2", "OUTPUT"],
            firstWaveDelaySeconds: 0.5, waveIntervalSeconds: 0.9, pulsePropagateSeconds: 0.4,
            showLayerLabels: true, breadcrumb: null, watermark: null,
            watermarkHandle: "@armandointeligencia", subjectTool: null, palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 36, showCaptions: false,
          }}
        />

        <Composition
          id="RankedTierList16x9"
          component={RankedTierList16x9}
          schema={rankedTierList16x9Schema}
          durationInFrames={210}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "", wordTimings: [], title: "Top 5", subtitle: "", sectionLabel: "RANKING",
            items: [
              { rank: "5", label: "Automatización", sub: "Edge-TTS + Whisper", color: "" },
              { rank: "4", label: "Contexto largo", sub: "1M tokens", color: "" },
              { rank: "3", label: "Multi-agente", sub: "Orquestación", color: "" },
              { rank: "2", label: "Razonamiento", sub: "Chain-of-thought", color: "" },
              { rank: "1", label: "Agentes autónomos", sub: "El futuro es ahora", color: "" },
            ],
            revealDirection: "left-to-right", revealFrames: 10, holdFrames: 14,
            firstItemEnterSeconds: 1.0, breadcrumb: null, watermark: null,
            watermarkHandle: "@armandointeligencia", subjectTool: null, palette: "cream",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            captionFontSize: 36, showCaptions: true,
          }}
        />

        <Composition
          id="TestimonialCard16x9"
          component={TestimonialCard16x9}
          schema={testimonialCard16x9Schema}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            audioUrl: "", wordTimings: [],
            quote: "Esta herramienta transformó cómo producimos contenido — resultados en días, no semanas.",
            attribution: { name: "Armando González", title: "Fundador", brand: "Armando Inteligencia" },
            brandLogo: "", sectionLabel: "TESTIMONIO",
            breadcrumb: null, watermark: null, watermarkHandle: "@armandointeligencia",
            subjectTool: null, palette: "dark",
            paperColor: "", inkColor: "", accentColor: "", mutedColor: "",
            enterSeconds: 0.5, captionFontSize: 36, showCaptions: false,
          }}
        />
      </Folder>
    </>
  );
};
