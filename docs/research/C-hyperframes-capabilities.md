# HyperFrames v0.6.7+ Deep Dive — What We're NOT Using (May 2026)

> Research Stream C · 2026-05-18 · Opus deep research.

## Executive summary

The local install in this project is using maybe **10% of what the framework offers**. Biggest missed surface area: the **registry of 95+ blocks/components** (transitions, captions, charts, maps, VFX, social cards) installable with a single `npx hyperframes add <slug>`, and the **six runtime adapters** (`gsap`, `animejs`, `css`, `lottie`, `three`, `waapi`) that let any library with a `seek()`-shaped API render frame-perfectly — something Remotion architecturally cannot do for libraries that own their own clock (this is the headline differentiator).

---

## Registry / catalog inventory (95 items total)

### Examples (8 full starter projects)
`warm-grain` (closest to our aesthetic), `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`

### Caption components (18) — every one alternative to our hand-rolled GSAP captions
`caption-pill-karaoke`, `caption-neon-accent`, `caption-weight-shift`, `caption-emoji-pop`, `caption-editorial-emphasis`, `caption-parallax-layers`, `caption-glitch-rgb`, `caption-matrix-decode`, `caption-particle-burst`, `caption-texture`, `caption-clip-wipe`, `caption-kinetic-slam`, `caption-gradient-fill`, `caption-neon-glow`, `caption-highlight`, `caption-blend-difference`

All install with `npx hyperframes add <name>` and consume standard `transcript.json` word-timestamp shape produced by `npx hyperframes transcribe`.

### Utility components (7)
`grain-overlay` (animated film-grain, paper texture for free), `shimmer-sweep`, `grid-pixelate-wipe`, `texture-mask-text`, `vignette`, `parallax-zoom`, `parallax-unzoom`

### Social / overlay blocks (11)
`instagram-follow`, `tiktok-follow`, `yt-lower-third`, `x-post`, `reddit-post`, `spotify-card`, `macos-notification`, `app-showcase`, `vpn-youtube-spot`, `blue-sweater-intro-video`, `apple-money-count`

### Map / data visualization blocks (10)
`us-map`, `us-map-bubble`, `us-map-hex`, `us-map-flow`, `world-map`, `spain-map`, `north-korea-locked-down`, `nyc-paris-flight`, `data-chart`, `flowchart`

### Shader transitions (14 — true GLSL shaders)
`chromatic-radial-split`, `cinematic-zoom`, `cross-warp-morph`, `domain-warp-dissolve`, `flash-through-white`, `glitch`, `gravitational-lens`, `light-leak`, `ridged-burn`, `ripple-waves`, `sdf-iris`, `swirl-vortex`, `thermal-distortion`, `whip-pan`

### VFX blocks (8)
`vfx-text-cursor`, `vfx-liquid-background`, `vfx-iphone-device` (real GLTF iPhone 15 Pro + MacBook Pro with live HTML-in-Canvas screen content via Three.js), `vfx-magnetic`, `vfx-portal`, `vfx-liquid-glass`, `vfx-shatter`, `ui-3d-reveal`, `logo-outro`

**We're shipping zero of these in `tech-news-flash.html`.**

---

## Examples directory (full reference templates)

1. **`warm-grain`** — closest to our current production template. Cream `#f5f0e0` paper background, GSAP timeline, layered grain noise via CSS `@keyframes grain-noise` + paper PNG. Useful baseline.
2. **`kinetic-type`** — `1920×1080` root with sub-composition loaded via `data-composition-src="compositions/main-graphics.html"`. Demonstrates the multi-file sub-composition pattern.
3. **`nyt-graph`** — animated bar + line chart, NYT typography. Reference for `data-chart` block usage.
4. **`decision-tree`** — flowchart with SVG connectors and sticky-note nodes.
5. **`product-promo`** — assets-heavy showcase. Best template for hero product reveals.
6. **`swiss-grid`** — typographic Swiss-style grid system.
7. **`vignelli`** — editorial Massimo-Vignelli aesthetic.
8. **`play-mode`** — music player UI overlay.

---

## 10 advanced capabilities we're NOT using

### 1. Shader transitions between scenes
GPU-accelerated GLSL transitions without writing WebGL. `npx hyperframes add whip-pan` (or any of 14 shaders). Mount on overlapping track between two scenes.

```html
<div data-composition-id="whip-pan" data-composition-src="compositions/blocks/whip-pan.html"
     data-start="4.5" data-duration="0.6" data-track-index="2"
     data-variable-values='{"from":"#scene-a","to":"#scene-b"}'></div>
```

### 2. Lottie via `window.__hfLottie`
After Effects exports rendered frame-accurately because HF pauses Lottie and calls `goToAndStop(timeMs)` per frame.

```html
<script>
  const anim = lottie.loadAnimation({ container: el, loop: false, autoplay: false, path: "assets/logo.json" });
  window.__hfLottie = window.__hfLottie || [];
  window.__hfLottie.push(anim);
</script>
```

### 3. Three.js scenes via `hf-seek` events
Real 3D — GLTF models, AnimationMixer, camera moves — rendered deterministically.

```js
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
```

For GLTF: `function renderAt(t) { mixer.setTime(t); renderer.render(scene, camera); }`.

### 4. Anime.js via `window.__hfAnime`
Anime.js v4 timelines render frame-accurately — adapter calls `instance.seek(timeMs)` on every animation pushed.

### 5. WAAPI via `document.getAnimations()`
Native Web Animations API becomes seekable — zero library weight. Requirements: `fill: "both"`, finite `iterations`, no `animation.finished` Promise reliance.

### 6. Caption blocks from the registry (vs our custom GSAP captions)
18 prebuilt caption styles. Swap in `caption-kinetic-slam` for TikTok energy, `caption-editorial-emphasis` for editorial, `caption-neon-glow` for stylized — one-line install. **Highest-ROI upgrade** because we have 18 ready-made styles and we're hand-rolling one.

### 7. Audio-reactive blocks (beat-sync, waveform)
Pre-sample audio with Web Audio API at composition init → build per-frame amplitude array → key GSAP/Three.js/WAAPI values off `amplitudes[Math.floor(time * fps)]` on `hf-seek`. Deterministic — perfect for TikTok beat-drop intros.

### 8. Marker / annotation systems
Handwritten circles, marker sweeps, sketchout — SVG-stroke animations via GSAP DrawSVG or WAAPI animating `stroke-dashoffset`. Point at things during narration.

### 9. Brand kit / theme tokens via `data-composition-variables` + Tailwind v4 `@theme`
Single composition that renders any brand by overriding declared variables at render time.

```html
<html data-composition-variables='[
  {"id":"primary","type":"color","label":"Primary","default":"#1B3A6E"},
  {"id":"accent","type":"color","label":"Accent","default":"#D4AF37"}
]'>
```
```bash
npx hyperframes render --variables '{"title":"Gemini 3.2 Flash Leak","accent":"#FF3B30"}'
```

Collapses our 5 separate templates into one parametrized render.

### 10. Tailwind v4 browser-runtime
Tailwind utility classes inside compositions with zero build step. `npx hyperframes init my-video --tailwind`. Genuinely zero-config — paste a Claude Design / v0.dev artifact and it renders.

---

## Lint rules + gotchas

### Lint errors (must fix)
- Missing `data-composition-id` on root element
- Missing `class="clip"` on timed visible elements (renders permanently otherwise)
- Overlapping timelines on same `data-track-index`
- Unmuted `<video>` elements when `data-has-audio="true"` not set
- Deprecated attributes (`data-layer`, `data-end` → use `data-track-index`, `data-duration`)
- Unregistered GSAP timelines (must be on `window.__timelines[id]`)

### Render constraints
- `--fps`: 24, 30, 60 (60 doubles render time)
- `--quality`: draft/standard/high
- `--format`: mp4/mov/webm/png-sequence (WebM is the only format with transparency)
- `--workers`: 1-8 or auto (each spawns Chrome instance)
- `--docker`: byte-identical reproducible output (BeginFrame mode)
- `--strict` / `--strict-all`: fail render on lint errors

### Two capture modes
- **BeginFrame mode** (Linux + `chrome-headless-shell`, `--docker`): atomic compositor frames, byte-for-byte reproducible
- **Screenshot mode** (macOS, Windows, auto-fallback): real-time Chrome + screenshots

### Determinism rules
- Canonical clock: `t = frame / fps`
- No `Date.now()`, `performance.now()`, clock deltas
- No unseeded randomness, no render-time network fetches
- Fixed `fps`, `width`, `height`, finite duration only
- Three.js: pin `renderer.setPixelRatio(1)` and `renderer.setSize(W, H, false)`

### Common-mistakes booby traps
- **Animating `<video>` dimensions with GSAP** halts frame rendering — animate a wrapper `<div>` instead
- **Calling `video.play()` / `audio.currentTime`** — framework owns media playback via `data-start` / `data-media-start` / `data-volume`
- **Composition duration = GSAP timeline duration**, not `data-duration` on video. Extend with `tl.set({}, {}, 283)` to match longer video.
- **Oversized source images** — Chrome decodes JPEG/PNG to raw RGBA. 7000×5000 = 140MB decoded. Resize to ≤ 2× canvas dimensions.
- **Heavy `backdrop-filter: blur()` stacks** — drops preview to 5-10fps. Keep ≤ 2-3 layers; radii ≤ 64px.
- **Whisper `.en` model on non-English audio** silently translates instead of transcribing. Use `small` for non-English; pass `--language es`.
- **Tailwind dynamic class names** (`bg-${color}-500`) won't render — Tailwind scans static DOM.

### Version compatibility
- Node.js ≥ 22 required (`hyperframes/.nvmrc` pins Node 24)
- GSAP pinned at 3.14.2 in skills' examples
- Anime.js 4.0.2 IIFE
- Three.js 0.181.2 via ESM CDN
- Tailwind v4.2.4 browser runtime (NOT v3)

---

## When HyperFrames actually beats Remotion (5 use cases)

1. **GSAP-driven motion (our current core).** Remotion races GSAP at wall-clock during render. HF pauses GSAP and calls `timeline.totalTime(frame / fps)` per frame. Every CodePen GSAP demo just works.

2. **Audio-reactive / beat-sync intros.** Sampling audio amplitude offline + driving GSAP/Three.js/WAAPI from `hf-seek` events is clean in HF.

3. **One-off creative HTML pasted from Claude Design / v0 / CodePen.** When an LLM hands you HTML+CSS+GSAP, HF runs it as-is. Remotion requires translating every JSX-incompatible idiom.

4. **Three.js / WebGL scenes (3D product spins, iPhone-on-pedestal showcases).** HF's `hf-seek` event + existing `vfx-iphone-device` registry block give you real GLTF + HTML-in-Canvas in 10 minutes.

5. **Open-source licensing + zero per-render fees.** Apache 2.0 — relevant if Armando Inteligencia ever commercializes (templates marketplace, white-label for clients).

### Where Remotion still wins
- **Distributed rendering at scale** (Remotion Lambda)
- **Visual snapshot testing** (vitest integration)
- **TypeScript-typed props end-to-end**
- **React component reuse**

---

## Highest-ROI next moves (ranked)

1. Run `npx hyperframes add caption-pill-karaoke` (or `caption-kinetic-slam` for TikTok energy) — replace our custom Caption with a registry block. Biggest visible quality jump for least work.
2. Add `whip-pan` or `chromatic-radial-split` shader transition between news-flash segments.
3. Convert 5 Remotion-ported templates to single composition + `data-composition-variables` for primary/accent/brand/title. Collapses 5 files into 1 parametrized render.
4. Run `hyperframes init . --tailwind` on a new variant for rapid styling iteration.
5. Try `vfx-iphone-device` for the next product/leak-themed video.

## Sources

GitHub heygen-com/hyperframes (registry/registry.json, registry/examples/*, skills/{lottie,three,animejs,waapi,css-animations,gsap,tailwind,hyperframes-cli,hyperframes-media}, docs/concepts/{frame-adapters,data-attributes,compositions,determinism,variables}.mdx, docs/guides/hyperframes-vs-remotion.mdx). Local install at `hyperframes/` (v0.6.7).
