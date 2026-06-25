#!/usr/bin/env node
/**
 * runCrossCreatorReplicas — render each creator's SIGNATURE composition standalone
 * so it can be compared side-by-side against that creator's preserved source frames
 * (cross-creator validation/improvement pass — the sibling of runAbhiTemplates).
 *
 * Bundle once, render many. For each target composition id:
 *   - props: docs/research/cross-creator/props/<CompId>.json if present, else {}
 *     (these templates ship strong demo defaults, so {} already yields real content)
 *   - duration: min(composition's native durationInFrames, CAP) so comparison clips
 *     stay short/fast while still showing the entrance + settle.
 * Outputs → output/cross-creator/<CompId>.mp4
 *
 *   npx tsx src/autoedit/runCrossCreatorReplicas.ts [onlyCompId]
 */
import fs from "fs";
import path from "path";
import { bundleOnce as bundle } from "./bundleOnce";
import { ensureBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const FPS = 30;
const CAP = 150; // frames (5s) — comparison clips
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(PROJECT_ROOT, "output/cross-creator");
const PROPS_DIR = path.join(PROJECT_ROOT, "docs/research/cross-creator/props");

/** The signature composition per creator (each comp owned/edited by exactly one
 * compare-agent to avoid races). compId → primary creator it is compared against. */
const TARGETS: { comp: string; creator: string }[] = [
  // ── adamrosler cluster (dark procedural — closest match in the set) ──
  { comp: "RankedTierList9x16", creator: "adamrosler" },
  { comp: "TerminalBlock9x16", creator: "adamrosler" },
  { comp: "ForceGraph9x16", creator: "adamrosler" },
  { comp: "AnimatedCounter9x16", creator: "adamrosler" },
  { comp: "BigNumberDuel9x16", creator: "adamrosler" },
  { comp: "DecisionTree9x16", creator: "adamrosler" },
  { comp: "EditorBlock9x16", creator: "adamrosler" },
  { comp: "IllustratedConcept9x16", creator: "adamrosler" },
  { comp: "KineticTypoCard9x16", creator: "adamrosler" },
  { comp: "LockedFeatureRow9x16", creator: "adamrosler" },
  { comp: "NeuralNetwork9x16", creator: "adamrosler" },
  { comp: "PipelineFlow9x16", creator: "adamrosler" },
  { comp: "TerminalCommand9x16", creator: "adamrosler" },
  { comp: "TitledDossierCard9x16", creator: "adamrosler" },
  { comp: "TokenStream9x16", creator: "adamrosler" },
  // ── natebjones 16:9 deterministic-procedural ──
  { comp: "EquationCardChain16x9", creator: "natebjones" },
  { comp: "BeforeAfterText16x9", creator: "natebjones" },
  { comp: "TopHeroBottomTrioCards16x9", creator: "natebjones" },
  { comp: "ThreeStageRisingBars16x9", creator: "natebjones" },
  { comp: "ThreeRowLabeledCardStack16x9", creator: "natebjones" },
  { comp: "PipelineFlow16x9", creator: "natebjones" },
  { comp: "KaraokeWithBlueChipPullout9x16", creator: "natebjones" },
  // ── stat / number / chart lane ──
  { comp: "BigNumberHero9x16", creator: "motiondarwin" },
  { comp: "BarChartList9x16", creator: "sahilbloom" },
  { comp: "BenchmarkBars9x16", creator: "sahilbloom" },
  { comp: "BigNumberHorizontalBars16x9", creator: "sahilbloom" },
  { comp: "TitleCardKineticTwoLine16x9", creator: "sahilbloom" },
  { comp: "KineticEssay9x16", creator: "sahilbloom" },
  { comp: "BrollListicle9x16", creator: "sahilbloom" },
  { comp: "GenerativeBrollWithDiegeticUI9x16", creator: "sahilbloom" },
  { comp: "LineChartAnnotated9x16", creator: "aiexplained" },
  // ── card / news lane ──
  { comp: "TweetCardHero9x16", creator: "bilawal.ai" },
  { comp: "TechNewsFlash9x16", creator: "diysmartcode" },
  { comp: "QuoteCard9x16", creator: "black.one.studio" },
  { comp: "BrandedOpener9x16", creator: "alexhormozi" },
  // ── diagram / structure lane ──
  { comp: "DiagramExplainer9x16", creator: "midu.dev" },
  { comp: "VennDiagram9x16", creator: "aiexplained" },
  { comp: "LayerCardStack9x16", creator: "simonhoiberg" },
  { comp: "Listicle", creator: "simonhoiberg" },
  { comp: "TalkingHead", creator: "simonhoiberg" },
  // ── 16:9 studio / keynote + footage-layout validation ──
  { comp: "StudioCompositor16x9", creator: "theaiadvantage" },
  { comp: "KeynoteSlidePIP16x9", creator: "allin" },
  { comp: "SplitWebcamScreen9x16", creator: "mreflow" },
  { comp: "TalkingHeadDynamic9x16", creator: "builtbystephan" },
  // ── net-new templates (2026-06 discovery + QA build) ──
  { comp: "BuilderDropPoster9x16", creator: "builtbystephan" },
  { comp: "ModelComparison2x2Grid16x9", creator: "theaiadvantage" },
  { comp: "OpeningTitleCard9x16", creator: "alexhormozi" },
  // ── back-catalog net-new templates (2026-06) ──
  { comp: "MatrixGridHeatmap9x16", creator: "adamrosler" },
  { comp: "DocumentHighlightSwipe16x9", creator: "aiexplained" },
  { comp: "PaintStrokeRibbonBanner16x9", creator: "aiexplained" },
  { comp: "SpectrumSlider9x16", creator: "abhishek.devini" },
  { comp: "BeforeAfterSliderWipe9x16", creator: "estebandiba" },
  { comp: "ModelNameChipComparison9x16", creator: "estebandiba" },
  { comp: "RingTopologyHopCounter9x16", creator: "adamrosler" },
  { comp: "RotatingVectorDial9x16", creator: "adamrosler" },
];

function loadProps(comp: string): Record<string, unknown> {
  const p = path.join(PROPS_DIR, `${comp}.json`);
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch (e) {
      console.warn(`[cc] bad props json for ${comp}: ${(e as Error).message} — using {}`);
    }
  }
  return {};
}

async function main(): Promise<void> {
  const only = process.argv[2];
  const onlySet = only ? new Set(only.split(",").map((s) => s.trim()).filter(Boolean)) : null;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureBrowser();
  console.log("[cc] bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(PROJECT_ROOT, "src/index.ts") });

  const targets = TARGETS.filter((t) => !onlySet || onlySet.has(t.comp));
  const results: { comp: string; creator: string; file: string; dur: number }[] = [];
  for (const t of targets) {
    const inputProps = loadProps(t.comp);
    let composition;
    try {
      composition = await selectComposition({ serveUrl, id: t.comp, inputProps });
    } catch (e) {
      console.error(`[cc] FAILED selectComposition ${t.comp}: ${(e as Error).message}`);
      continue;
    }
    const dur = Math.min(composition.durationInFrames || CAP, CAP);
    const outAbs = path.join(OUT_DIR, `${t.comp}.mp4`);
    process.stdout.write(`[cc] ${t.comp} (${dur}f, ${composition.width}x${composition.height}) … `);
    try {
      await renderMedia({
        composition: { ...composition, durationInFrames: dur, fps: FPS },
        serveUrl, codec: "h264", outputLocation: outAbs, inputProps,
      });
      console.log("done");
      results.push({ comp: t.comp, creator: t.creator, file: `output/cross-creator/${t.comp}.mp4`, dur });
    } catch (e) {
      console.error(`FAILED render: ${(e as Error).message}`);
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));
  console.log(`\n✓ CROSS-CREATOR REPLICAS RENDERED — ${results.length}/${targets.length} → ${OUT_DIR}`);
}
main().catch((e) => { console.error(e instanceof Error ? e.stack : e); process.exit(1); });
