import React from "react";
import { Composition, Folder } from "remotion";
import { ExplainerVideo } from "./compositions/ExplainerVideo";
import { TalkingHead } from "./compositions/TalkingHead";
import { Listicle } from "./compositions/Listicle";
import { QuoteCard } from "./compositions/QuoteCard";
import {
  explainerSchema,
  talkingHeadSchema,
  listicleSchema,
  quoteCardSchema,
} from "./compositions/schemas";

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
            backgroundColor: "#1a1a2e",
            gradientTo: "#16213e",
            accentColor: "#ffd700",
            textColor: "#ffffff",
            fontFamily: "Inter, sans-serif",
            captions: {
              enabled: true,
              fontSize: 36,
              color: "#ffffff",
              highlightColor: "#ffd700",
              position: "bottom",
              backgroundColor: "rgba(0,0,0,0.7)",
            },
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
            backgroundColor: "#0a0a0a",
            nameTag: "Tu Nombre",
            nameTagColor: "#ffd700",
            captions: {
              enabled: true,
              fontSize: 36,
              color: "#ffffff",
              highlightColor: "#ffd700",
              position: "bottom",
              backgroundColor: "rgba(0,0,0,0.7)",
            },
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
            backgroundColor: "#0f0c29",
            gradientTo: "#302b63",
            accentColor: "#ffd700",
            textColor: "#ffffff",
            secondsPerItem: 5,
            captions: {
              enabled: true,
              fontSize: 36,
              color: "#ffffff",
              highlightColor: "#ffd700",
              position: "bottom",
              backgroundColor: "rgba(0,0,0,0.7)",
            },
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
            backgroundColor: "#1a1a2e",
            quoteColor: "#ffffff",
            authorColor: "#ffd700",
            fontFamily: "Georgia, serif",
            captions: {
              enabled: false,
              fontSize: 36,
              color: "#ffffff",
              highlightColor: "#ffd700",
              position: "bottom",
              backgroundColor: "rgba(0,0,0,0.7)",
            },
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
            backgroundColor: "#1a1a2e",
            gradientTo: "#16213e",
            accentColor: "#ffd700",
            textColor: "#ffffff",
            fontFamily: "Inter, sans-serif",
            captions: {
              enabled: true,
              fontSize: 42,
              color: "#ffffff",
              highlightColor: "#ffd700",
              position: "center",
              backgroundColor: "rgba(0,0,0,0.7)",
            },
          }}
        />
      </Folder>
    </>
  );
};
