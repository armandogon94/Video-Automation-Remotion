# Video Quality Overhaul — Roadmap (W21+)

> 2026-05-18 — Synthesizes 5 parallel Opus research streams + local bug diagnosis + asset hunt into a prioritized work plan.
> Source files: `docs/research/A-motion-design-typology.md`, `B-remotion-patterns.md`, `C-hyperframes-capabilities.md`, `D-tools-mcps-survey.md`, `E-15-template-typology.md`, `docs/ASSET_INVENTORY.md`, `src/timing/align.ts`.

---

## 0. The diagnosis (what's actually broken)

User watched the W21 bake-off renders and called three problems. We quantified them on the actual TTS output:

| Bug | Magnitude | Root cause | Fix |
|---|---|---|---|
| **Caption groups overlap when line count changes** | All 25/25 consecutive groups overlap by exactly 400ms (our hardcoded trailing buffer) | HF template draws each group with a `+0.4s` end-buffer past the last word | `nonOverlappingGroups()` in `src/timing/align.ts` |
| **Highlighted word ≠ spoken word** | TTS-distributed timing drifts ±1.2s vs whisper-derived timing by word ~17 | We used TTS approximate (sentence-distributed) timings, not whisper word-level | `alignScriptToWhisper()` in `src/timing/align.ts` — script text + whisper timing, ordinal-aligned |
| **Big overlays drift from voice** | The four middle overlays appear **3.7–5.6 SECONDS before** the keyword is spoken | Overlay timings hardcoded from the brief assuming a 35-45s base; actual TTS at +55% rate has totally different word positions | `anchorOverlays()` + `findKeyword()` in `src/timing/align.ts` — orchestrator resolves keyword to actual spoken time before render |

**Status:** the helper module `src/timing/align.ts` is built. Next step is wiring it into the orchestrator + into a refreshed `TechNewsFlash9x16` composition.

---

## 1. The architectural principle (single rule)

> **No animation in this pipeline uses a hardcoded frame.** Every timing comes from a whisper `startMs` / `endMs` of a known word.

This is the structural moat. Everything below is downstream of it.

---

## 2. The 5 things to install this month

From Stream D, ranked by impact ÷ setup-cost:

| # | Tool | Install command | What it unlocks |
|---|---|---|---|
| 1 | **LottieFiles Creator MCP + `@remotion/lottie@4.0.443`** | `npm install @remotion/lottie@4.0.443 lottie-web` + add MCP server | Per-prompt Lottie generation; accent micro-animations |
| 2 | **Pexels MCP** | `npx @garylab/pexels-mcp-server` + `PEXELS_API_KEY` env | Vertical 9×16 B-roll search; pairs with `<OffthreadVideo>` |
| 3 | **Mermaid → SVG (`claude-mermaid` MCP)** | `npm install -g @mermaid-js/mermaid-cli @veelenga/claude-mermaid` | Flowcharts / sequence diagrams as SVG → drop into Remotion `<Img>` |
| 4 | **FFmpeg `lut3d` + Armando LUT** | Generate `.cube` in DaVinci Resolve free, add `-vf "lut3d=file=brand/armando.cube"` to `src/ffmpeg/commands.ts` | One-line brand color grading applied to every render |
| 5 | **Mubert API (Creator $14/mo)** | REST endpoint, mix at -22 LUFS under VO with `sidechaincompress` | Mood-tagged music beds |

**Defer (next quarter):** Cartesia Sonic 3.5 for voice clone (better than ElevenLabs for Spanish — Mexican / Colombian / Castilian voices, $5/mo Pro, 3-second clone), `@remotion/rive` for character animation, Real-ESRGAN + RIFE for 60fps upscale.

---

## 3. The 15 templates (the strategic frame)

From Stream E. Build order is **complexity 1 → 2 → 3**, building each only when a real story routes there.

| Sprint | Templates | Why this batch |
|---|---|---|
| **Sprint 1** | QuoteCard · BigNumberHero | Reuse 80% of `TechNewsFlash9x16` infrastructure. Adds 2 templates for ~1 day of work. |
| **Sprint 2** | HotTake · Listicle5 · FAQMythbuster · PrediCtion | Covers full week-of-stories typology (opinion / roundup / debunk / Monday agenda). Mostly typography variations + reused motion. |
| **Sprint 3** | BeforeAfter · ComparisonTable · ToolReview · TimelineRecap · CaseStudy | Multi-panel layouts + asset-heavy. Build on demand — don't pre-build speculatively. |
| **Sprint 4+** | TutorialMicro · ChartReveal · DiagramExplainer | Deep investments (1–2 days each). Defer until 4+ weeks of content shipped on simpler templates. |

**Total coverage:** every story type listed in VOICE.md §7 has a template; no story should require re-authoring a composition.

---

## 4. The motion vocabulary (cap the variety on purpose)

From Stream A. **Rule: ≤ 3 different entrance animations per video.** Otherwise the visual language breaks down.

**Approved entrance palette** (use one each per role):
- `enterCalm` — Fade-and-rise (300ms, power2.out, 80ms stagger). Workhorse for body copy and bullets.
- `enterSnappy` — Scale-in (280ms spring, damping 18 / stiffness 140 / mass 0.6). Default for secondary text.
- `enterDramatic` — Mask reveal (600ms, expo.out, clip-path inset wipe). Headlines, pull quotes, big numbers — the "editorial" entrance.

**Approved emphasis devices** (use sparingly — ≤2 of any per 30s):
- Marker-highlight sweep (400ms warm-red gradient, slight rotation `-1.2°`)
- Counter roll (digit ticker for numbers, 800-1100ms)
- Color flash (1-frame warm-red punctuation on hard voice beats)
- Dotted underline reveal (SVG stroke-dasharray, 400ms)

**Approved transitions** (`@remotion/transitions`, ≤3 effect transitions per video):
- Hard cut (95% of cuts — DEFAULT)
- Clock-wipe (editorial page-turn feel)
- Slide (sequential, direction encodes meaning)
- Fade-through-cream (act breaks)

**Anti-patterns (banned):**
- Drop-shadow + glow on cream paper (anti-editorial)
- Scale-pulse on every word (MrBeast tell, kills emphasis)
- Neon/purple accents (violates brand)
- More than 2 transform properties per element per moment
- Effect transitions on every cut
- Camera shake / wiggle on text (AI-slop signature)
- Gradient text fills
- Generic sans (Roboto/Poppins/Open Sans) anywhere

---

## 5. The asset library to import (free wins)

From `docs/ASSET_INVENTORY.md`. Highest-priority new imports:

```bash
# 1. The 'avatar-solo' variant — useful for picture-in-picture face-cam style
cp "17-Instagram-Slides/brand/avatar/armando-avatar-solo.png" brand/logos/

# 2. Real Armando face video — for face-cam templates (HotTake, ToolReview)
mkdir -p public/face
cp "17-Instagram-Slides/references/armando-face/DVtjqDuDUF0.mp4" public/face/armando-talking-1080.mp4

# 3. Claude B-roll clips (1080×1920, ~5s each, perfect for cutaways)
mkdir -p public/broll/claude
cp ~/Downloads/Armando\ Inteligencia\ Media/Claude\ Diagramas\ Dinamicos/hf_*.mp4 public/broll/claude/

# 4. Secondary brand logos (305 AI, AI Leadership Lab, IA Ejecutiva 90) — defer until first cross-brand video
# Location: ~/Downloads/Armando Inteligencia/Logos Armando Inteligencia y 305 AI/Logos Finales/
```

---

## 6. Sprint 1 — concrete build plan (the next ~1 day of work)

**Goal:** ship a v2 `TechNewsFlash9x16` that fixes all 3 bugs + adds 2 new templates (`QuoteCard`, `BigNumberHero`) that reuse the new infrastructure.

### Step 1 — Wire `src/timing/align.ts` into the pipeline (~30 min)
- Modify `src/pipeline/pipeline.ts` so the orchestrator calls `alignScriptToWhisper(ttsWords, whisperWords)` after both TTS and whisper run
- Write the aligned word list to `output/<slug>/audio/voiceover.aligned.json` (next to TTS + whisper outputs)
- Both Remotion + HF orchestrators read the aligned list instead of TTS

### Step 2 — Add keyword-anchored overlays to `TechNewsFlash9x16` (~45 min)
- Schema change: each overlay becomes `{ kind, text, trigger: { keyword, leadIn?, duration?, occurrence? }, fallback? }`
- Orchestrator resolves trigger → `{ startSeconds, endSeconds }` via `anchorOverlays(specs, aligned)` BEFORE passing props to Remotion
- Composition stays pure (just consumes resolved `startSeconds`/`endSeconds`)
- This is the single biggest perceptual upgrade

### Step 3 — Replace caption renderer with `@remotion/captions` + `createTikTokStyleCaptions` (~45 min)
- `npm install @remotion/captions@4.0.443 @remotion/layout-utils@4.0.443 @remotion/media-utils@4.0.443`
- Delete the hand-rolled 6-word window in `ImpeccableCaption`
- Ship as a single `<EditorialCaption>` for now; add `<KaraokeCaption>` and `<TickerCaption>` variants in Sprint 2

### Step 4 — Adopt `calculateMetadata` for dynamic duration (~20 min)
- In `src/Root.tsx`, set `calculateMetadata` on every `<Composition>` to read MP3 length via `getAudioDurationInSeconds()`
- Remove all manual duration math from `pipeline.ts`

### Step 5 — Refactor `TechNewsFlash9x16` to scene components inside `<TransitionSeries>` (~60 min)
- New components: `src/compositions/scenes/{HookScene,ContextScene,DataScene,CTAScene}.tsx`
- Each scene a typed React component with its own props + entrance choreography
- Transitions: `clockWipe` between hook→context, `slide({ direction: "from-bottom" })` between context→cta
- Captions render OUTSIDE the `<TransitionSeries>` so they stay continuous

### Step 6 — Build `QuoteCard` template (~60 min)
- New composition `src/compositions/QuoteCard9x16.tsx`
- Schema includes `quote`, `author`, `source`, `date`, `portraitUrl`, `contextLine`, `ctaText`, `tag: "CITA" | "OPINIÓN"`
- Reuses `EditorialCaption`, `BrandWatermark`, scene transitions

### Step 7 — Build `BigNumberHero` template (~60 min)
- New composition `src/compositions/BigNumberHero9x16.tsx`
- Includes the **counter ramp** (odometer-style number animation)
- Schema includes `number`, `unitPrefix`, `unitSuffix`, `subtitle`, `contextLines`, `comparison`, `tag`

### Step 8 — Re-render the W21 Gemini 3.2 Flash video on the v2 pipeline (~15 min)
- Same script, same audio, new composition. Should fix all 3 bugs visibly.
- Compare side-by-side with the v1 render under `output/2026-05-18-gemini-3-2-flash-leak/` to validate the fix.

**Total estimate: ~5 hours of focused work. Splits nicely into 2 sessions.**

---

## 7. Sprint 2 — caption variants + 4 new templates (~1 day)

After Sprint 1 lands:

- Ship 2 more caption styles: `<KaraokeCaption>` (no card, active word gets dotted accent underline) + `<TickerCaption>` (single line bottom strip)
- Build `HotTake`, `Listicle5`, `FAQMythbuster`, `PrediCtion` — each ~1 hour because the infrastructure is reusable
- Add `PaperGrain` Canvas2D component (replaces static radial-gradient — biggest texture-level upgrade)
- Add `LottieAccent` slot to schemas; curate 6 Lottie files in `public/lottie/`
- Install LottieFiles Creator MCP + Pexels MCP (the top 2 tools from Stream D)

---

## 8. Sprint 3+ — on-demand templates as stories arrive

Templates 8–15 get built **only when a real W22+ story routes there**. Pre-building everything is waste — we don't know which 5 of the 8 we'll actually use until 4-6 weeks of content has shipped.

Triggers for build:
- `BeforeAfter` — first story where a workflow / UI change IS the news
- `ComparisonTable` — first two-tool head-to-head story
- `ToolReview` — first ≥1-week personal-use review (VOICE.md §10 — no shilling untested tools)
- `TimelineRecap` — first Friday/Sunday week-in-review
- `CaseStudy` — first real founder example we can verify
- `TutorialMicro` — first story that needs screen recording
- `ChartReveal` — first story where a curve IS the narrative
- `DiagramExplainer` — first mechanism explainer (MCP, RAG, agent loop)

---

## 9. Open questions for the user

1. **Sprint 1 sequencing:** OK with the 8-step order in §6? Or prefer to ship just Step 1–4 (bug fixes) first, then Steps 5–8 (templates) as a separate session?
2. **First v2 render:** re-render the Gemini 3.2 Flash video on the fixed pipeline first (validate the 3-bug fix), OR jump straight to writing W22's first new story for the new template?
3. **Tool install order:** Stream D recommends LottieFiles MCP + Pexels MCP first. Install both, or just one (then evaluate)?
4. **Cross-brand templates:** Stream E proposed sub-brand support (305 AI, AI Leadership Lab, IA Ejecutiva 90). Defer until first cross-brand video, or build the brand-set extension now as foundational work?

---

## 10. Reference indices

- Bug diagnosis (with exact deltas): see top of this file + `output/2026-05-18-gemini-3-2-flash-leak/`
- Asset inventory (4 sub-brands, B-roll, face footage): `docs/ASSET_INVENTORY.md`
- Audio-alignment helper module (already built): `src/timing/align.ts`
- Motion vocabulary: `docs/research/A-motion-design-typology.md`
- Remotion patterns: `docs/research/B-remotion-patterns.md`
- HyperFrames capabilities: `docs/research/C-hyperframes-capabilities.md`
- Tools + MCPs survey: `docs/research/D-tools-mcps-survey.md`
- 15-template typology: `docs/research/E-15-template-typology.md`
