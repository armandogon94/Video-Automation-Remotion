# 2026 Tooling & MCP Survey — Spanish Vertical-Video Pipeline

> Research Stream D · 2026-05-18 · Opus deep research.
> Pipeline baseline (mayo 2026): Edge-TTS → faster-whisper medium → Remotion 4.0.443 + HyperFrames 0.6.7 → FFmpeg 8.1 → 1080×1920 H.264. Higgsfield already wired in via MCP. Stated priority: **templates + motion first; voice clone later.**

This survey ranks by **Impact × (1/Setup Cost)** — top entries should land within the next two weeks of work.

---

## Master Impact Table (ranked)

| Rank | Tool | Category | MCP | Cost | Setup | Why now |
|------|------|----------|-----|------|-------|---------|
| 1 | **LottieFiles Creator MCP** | Motion / Lottie | Yes (official, abril 2026) | Free tier + $9.99/mo Pro | LOW | Direct prompt-to-Lottie pipeline into Remotion's `@remotion/lottie` (v4.0.432+ aligned to 4.0.443). Highest leverage for "better motion". |
| 2 | **Pexels MCP server** (garylab) | B-roll / Stock | Yes (community) | Free, 200 req/h cap | LOW | Adds vertical 9×16 B-roll to fill template gaps. Pairs natively with Remotion `<OffthreadVideo>`. |
| 3 | **Mermaid → SVG + Excalidraw MCP** | Diagrams | Yes (`claude-mermaid`, `mcp_excalidraw`) | Free / OSS | LOW | Spanish explainer/listicle content desperately needs schemas. Render to SVG, drop into Remotion as `<Img>`. |
| 4 | **FFmpeg `lut3d` + free LUT packs** | Color grading | N/A | Free | LOW | Programmatic look-grading; bake the Armando Inteligencia look (navy/gold) into a `.cube` LUT once and reuse. Already have FFmpeg 8.1. |
| 5 | **Mubert API (Creator $14/mo)** | Music | Indirect (REST) | Sub $14–$199 / API custom | LOW–MED | Mood-tagged instrumental beds matched to script tone; commercially cleared on Pro+ tier. |
| 6 | **Auphonic API (free 2h/mo, then €11+)** | Audio mastering | No (REST) | Free 2h, then pay-as-you-go | LOW | One-call loudness normalization (EBU R128), de-noise, and leveling. Saves hand-tuning FFmpeg `loudnorm`. |
| 7 | **Recraft V4 API** | Image gen (vector + editorial) | No | $0.04/raster, $0.08/SVG | LOW | Best-in-class for vector cover thumbnails and brand-consistent editorial illustrations. Complements Higgsfield (photoreal). |
| 8 | **Ideogram v3 API** | Image gen (text-in-image) | No | $0.03–$0.09/img | LOW | 90–95% accurate Spanish text rendering for title cards, quote cards, hooks. Higgsfield can't hit this. |
| 9 | **Pixabay MCP** (Unlock-MCP) | B-roll / Stock | Yes | Free | LOW | Backup catalogue when Pexels is rate-limited or thin on a topic. |
| 10 | **Lottielab (manual editor)** | Motion / Lottie | No (Figma/desktop) | Free + paid tiers | LOW | Edit/tweak Lottie files locally before they go through `@remotion/lottie`. Not automatable, but for one-off polish. |
| 11 | **Rive + `@remotion/rive`** | Motion (state-machine vector) | No | Free under 1 editor / $19+ team | MED | True interactive vector with state machines and data binding inside Remotion. Higher ceiling than Lottie but real Rive-editor authoring time. |
| 12 | **Real-ESRGAN + RIFE (REAL Video Enhancer / OSS)** | Upscale + frame interp | No | Free (OSS, CLI) | MED | Optional final pass: smooth 30→60fps and recover detail. Apple Silicon NCNN backend works. |
| 13 | **HookScorer / HookScan / ViralScore** | Retention analysis | No (web only) | Free–sub | LOW | Pre-publish gut check on first 3 seconds of script. Useful, but no API — manual. |
| 14 | **Adobe Enhance Speech ($9.99/mo)** | Audio cleanup | No (browser only) | $9.99/mo | LOW | If/when you record real voice (not Edge-TTS), best free-tier speech cleanup on the market. No API. |
| 15 | **ElevenLabs Voice Isolator API** | Audio cleanup | No (REST) | 1000 chars / min audio | LOW | Useful for raw recorded VO; not needed for synthetic Edge-TTS today. |
| 16 | **Bria.ai API** | Image gen (commercial-safe) | No | Enterprise quote | MED | Trained exclusively on licensed Getty/Alamy/Envato — full IP indemnification. Worth evaluating if any image ever ends up in a Meta ad. |
| 17 | **Spline + `@remotion/spline`-via-R3F** | 3D web | No | Free + paid tiers | MED–HIGH | 3D scene injection for tech/product videos. Spline 2026 ships WebGPU (3× faster). Best when paired with React-Three-Fiber export. |
| 18 | **Manim Community v0.20.1** | Math/data animation | No | Free OSS | MED–HIGH | Python framework, needs LaTeX + Cairo. Worth it only for data-heavy content (financials, growth charts). |
| 19 | **Topaz Video AI** | Upscale (proprietary) | No, but has CLI | $299/yr personal | MED | Best quality upscaler on Apple Silicon, but CLI docs were pulled. Use only if your 1080p output ever needs a 4K master pass. |
| 20 | **Storyblocks API** | B-roll (enterprise) | No | $24k/yr min | HIGH | Skip until you have a clear ROI; the $24k floor doesn't pencil for a single-channel pipeline. |

(Full table includes 26 entries — Suno, Udio, Krisp, Epidemic Sound, IconScout, Adobe Firefly all reviewed and ranked lower / skipped.)

---

## Top 5 to add THIS MONTH

These five are the entire short list. Each one ships in <1 day of integration and visibly improves output.

### 1. LottieFiles Creator MCP + `@remotion/lottie`
```bash
npm install @remotion/lottie@4.0.443 lottie-web
```
```json
{
  "mcpServers": {
    "lottiefiles": {
      "command": "npx",
      "args": ["-y", "@lottiefiles/lottie-creator-mcp"]
    }
  }
}
```
Add a `<Lottie animationData={...} />` slot to every template; let Claude generate small accents (loading spinners, arrows, checkmarks, gold-navy brand pulses) on demand. Cache JSONs under `public/lottie/`.

### 2. Pexels MCP (vertical B-roll)
```bash
export PEXELS_API_KEY=...
```
```json
{
  "mcpServers": {
    "pexels": {
      "command": "npx",
      "args": ["-y", "@garylab/pexels-mcp-server"],
      "env": { "PEXELS_API_KEY": "${PEXELS_API_KEY}" }
    }
  }
}
```
New `src/pipeline/broll.ts` step — given the script's nouns (extracted by Claude), search Pexels for vertical clips matching, download to `output/<slug>/broll/`, expose as a `<BRollClip>` Remotion component.

### 3. Mermaid → SVG (via `claude-mermaid` MCP)
```bash
brew install node && npm install -g @mermaid-js/mermaid-cli @veelenga/claude-mermaid
```
A `Diagram` composition that renders an SVG produced by `mmdc -i diagram.mmd -o diagram.svg -t dark -b transparent`. Brand colors injected via Mermaid `themeVariables`.

### 4. FFmpeg `lut3d` color grading (Armando Inteligencia LUT)
1. In DaVinci Resolve free, color-grade one reference frame.
2. Right-click the clip → Generate 3D LUT (33 Point Cube) → save as `brand/armando.cube`.
3. Add to `src/ffmpeg/commands.ts`:
   ```ts
   const grade = `-vf "lut3d=file=brand/armando.cube:interp=tetrahedral,eq=saturation=1.05:gamma=0.98"`;
   ```

### 5. Mubert API (Creator $14/mo) for mood-matched music beds
```bash
curl -X POST https://api-b2b.mubert.com/v2/RecordTrackTTM \
  -H "Authorization: Bearer $MUBERT_KEY" \
  -d '{"mood":"inspiring","duration":60,"format":"mp3"}'
```
New step in `src/pipeline/pipeline.ts`: send Claude the script, get a `{mood, intensity, bpm_range}` tag, hit Mubert, mix at -22 LUFS under the VO with `amix` and `sidechaincompress`.

---

## Top 3 to evaluate NEXT QUARTER (worth higher setup)

### A. Rive + `@remotion/rive` (interactive vector animation)
Strictly better than Lottie for branded character-based or stateful motion. Animate the Armando avatar in Rive once (idle + wave + thinking states), pull into Remotion via `<RemotionRiveCanvas src={...} />`, swap into `TalkingHead`.

### B. Cartesia Sonic 3.5 voice clone (when voice clone arrives)
**Why Cartesia, not ElevenLabs:**
- Spanish coverage added jan 2026: 9 voices (Mexican, Colombian, Castilian) — directly aligned with @armandointeligencia.
- 75–90 ms TTFA streaming via WebSocket
- Instant Voice Cloning from 3 seconds of audio on Pro $5/mo; Pro Voice Cloning (fine-tuned) on Startup+.
- Pricing more rational than ElevenLabs Creator $22/mo for the same feature.

**Plan:** Record 3–10 min of Armando's voice → Cartesia Pro Voice Clone → swap `src/tts/generate.py` to a small `tts/cartesia.py` adapter that returns the same `(mp3_path, word_timestamps_json)` tuple Edge-TTS does. No other pipeline code changes.

### C. Real-ESRGAN + RIFE final-pass quality boost (OSS, free)
Doubles render time but produces 60fps motion smoothness when wanted. Use Apple Silicon NCNN backend.

---

## Vaporware / Skeptical Flags

- **"HookSnatcher" / "ViralPost"** — couldn't find real products. The actual space is **HookScorer, HookScan, ViralScore** — browser-only, no APIs. Build your own with a Claude scoring prompt instead.
- **Adobe Firefly API** — $1,000/mo enterprise minimum. Recraft + Ideogram cover the gap for ~$50/mo.
- **Storyblocks API** — $24k/yr floor. Skip.
- **Epidemic Sound Partner API** — partnership-gated, 12-month minimum. Skip.
- **Krisp SDK** — designed for real-time voice agents. Wrong shape for batch video.
- **Udio "fully licensed"** — Universal settlement was real, but the licensed model wasn't generally available as of mayo 2026.

---

## How the top 5 plug into the existing pipeline

```
script.md
   │
   ├── [NEW] Claude → {mood, bpm, broll_keywords, diagram_specs}
   │
   ├── Edge-TTS → audio.mp3 + word_timestamps.json     (unchanged)
   │
   ├── faster-whisper medium → captions.json           (unchanged)
   │
   ├── [NEW] Mubert REST → music.mp3
   ├── [NEW] Pexels MCP → broll/*.mp4
   ├── [NEW] mermaid CLI → diagrams/*.svg
   ├── [NEW] LottieFiles MCP → lottie/*.json (cached)
   │
   ├── Remotion render (uses @remotion/lottie, <BRollClip>, <Diagram>, brand LUT)
   │     OR Hyperframes render (HTML+GSAP path, same assets)
   │
   └── FFmpeg post:
         -vf "lut3d=brand/armando.cube,eq=saturation=1.05"
         -af "loudnorm=I=-16:LRA=11:TP=-1.5,sidechaincompress…"
         → output/<slug>/final-9x16.mp4
```

No file in `src/pipeline/` needs to be rewritten — each tool is a new step that produces an asset, then the existing Remotion compositions consume it via props.
