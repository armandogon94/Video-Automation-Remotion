# R4 — Robot / Character / Agent Animation Patterns for Remotion

> **Wave 1 research.** Survey of animation techniques usable inside Remotion 4.0.443 compositions to depict "robots moving" or "AI agents working" — for AI/tech news, explainer, and educational videos under the **Armando Inteligencia** brand (`#1B3A6E` navy, `#D4AF37` gold, Inter type).
> Goal: decide which character-motion primitive(s) we build first, and which we explicitly avoid.

---

## TL;DR — Decision Matrix

| Approach | Remotion fit | Brand fit | License | Build effort | Verdict |
|----------|-------------|-----------|---------|--------------|---------|
| **Lottie via `@remotion/lottie`** | First-class | High | Lottie Simple License (commercial OK) | Low | **SHIP FIRST** |
| **CSS / SVG orb + thinking dots** | Native React, deterministic | Very high (restrained) | N/A | Very low | **SHIP FIRST** |
| **Anthropomorphized brand-logo SVGs** | Native SVG + interpolate | Very high | Public brand SVGs (verify each) | Low | **SHIP SECOND** |
| **Rive via `@remotion/rive`** | Officially supported | Medium | Free (community files vary) | Medium | **EXPLORE** |
| **Three.js / R3F via `@remotion/three`** | Officially supported | LOW for our brand | Free (model licenses vary) | High | **AVOID for editorial** |
| **Spline embed** | Code-import path documented | LOW | Free + Spline TOS | High | **AVOID** |
| **Sprite-sheet character loops** | Trivial (`<Img>` + `interpolate`) | Medium (pixel-art vibe) | Per-asset | Low | **NICHE** |
| **rough.js / Excalidraw hand-drawn** | Works (SVG render at frame) | Off-brand for AI-news | MIT | Medium | **AVOID for AI-news** |

---

## 1. Lottie character libraries

### What it is
JSON-based vector animations exported from After Effects (Bodymovin) or rive/lottie-creator tools. Remotion ships an official wrapper.

### Remotion compatibility
- Official package: `@remotion/lottie` + `lottie-web` peer dependency. Versions must be pinned exactly to match the Remotion version. ([docs.remotion.dev/lottie](https://www.remotion.dev/docs/lottie))
- `<Lottie animationData={...} />` seeks deterministically via `lottie-web`'s `.goToAndStop(frame)`.
- **Critical gotcha:** Lottie files that contain After Effects **Expressions** may render non-deterministically and flicker between frames. Remotion cannot fix this upstream. Always preview the file once at full framerate before committing it. ([Remotion lottie docs](https://www.remotion.dev/docs/lottie), [LottieFiles forum: unsupported features](https://forum.lottiefiles.com/t/unsupported-features/5889))
- Other unsupported AE features inside Lottie: Effects menu (Drop Shadow, Color Overlay), Blending Modes, Luma Mattes, Layer Effects. Filter on LottieFiles by "Lottie compatible" or test before shipping. ([elpassion blog on Lottie mistakes](https://www.elpassion.com/blog/lottie-who-common-mistakes-in-after-effects-animation-for-lottie))
- Load pattern in our pipeline: drop `.json` into `public/lottie/` and load with `staticFile()` + `fetch()` + `delayRender()`. ([Lottie via staticFile()](https://www.remotion.dev/docs/lottie/staticfile))

### License
**Lottie Simple License** (LottieFiles default for "Free" files): commercial use OK, no attribution required, but derivative works must be redistributed under the same license. This is compatible with our use (we *use*, not redistribute). Premium files include a separate commercial license. ([Lottie Simple License](https://lottiefiles.com/page/license), [Commercial use & attribution](https://help.lottiefiles.com/hc/en-us/articles/45243303062681-Commercial-Use-Attribution))

### Quality assessment
For our AI-news / explainer aesthetic, **stick to flat-vector, brand-color-tintable assets**. Avoid 3D-rendered-looking Lottie robots (they read as stock-y and date fast). Prefer Lottie files where the dominant strokes are a single color we can recolor by editing the JSON layers, or by overlaying a tinted `mix-blend-mode: color` layer.

### Reference URLs — 5+
- LottieFiles AI Robot collection: <https://lottiefiles.com/free-animations/ai-robot>
- LottieFiles AI Assistant collection: <https://lottiefiles.com/free-animations/ai-assistant>
- LottieFiles Robot collection: <https://lottiefiles.com/free-animations/robot>
- LottieFiles Neural Network: <https://lottiefiles.com/free-animations/neural-network>
- LottieFiles AI Brain: <https://lottiefiles.com/free-animations/artificial-intelligence-brain>
- LottieFiles Chatbot Typing (Seneca): <https://lottiefiles.com/free-animation/chatbot-typing-ojXoUEC17y>
- LottieFiles Typing Dots (Nattu Adnan): <https://lottiefiles.com/62-typing-dot>
- LottieFiles AI Robot (Birju Raikwar): <https://lottiefiles.com/9944-ai-robot>
- LottieFiles Robot AI (Alex Samokhvalov): <https://lottiefiles.com/37909-robot-ai>
- IconScout Robot Working at Computer: <https://iconscout.com/lottie-animations/robot-working-at-computer>
- IconScout Robot Waving: <https://iconscout.com/lottie-animations/robot-waving-hi>
- IconScout ChatGPT Logo Pack: <https://iconscout.com/lottie-animation-pack/chatgpt_187510>
- LottieFiles Speech Bubble collection: <https://lottiefiles.com/free-animations/speech-bubble>

### Build effort
**Low.** A `<LottieAgent src="thinking.json" loop />` wrapper around `<Lottie>` with brand-tint overlay = ~40 LOC. Already-supported pipeline.

---

## 2. Rive runtime

### What it is
Rive is a vector animation tool with its own runtime that supports **interactive state machines** (idle → thinking → speaking). The runtime is a WASM module.

### Remotion compatibility
- Official package: `@remotion/rive` exposing `<RemotionRiveCanvas>`. It accepts `src`, `fit`, `alignment`, `artboard`, `animation`, `onLoad`, `enableRiveAssetCdn`, `assetLoader`. ([RemotionRiveCanvas docs](https://www.remotion.dev/docs/rive/remotionrivecanvas))
- Renders to a `<canvas>` driven by Rive's WASM, and synchronizes to Remotion's frame clock. Works inside the standard Remotion render pipeline (headless Chrome / puppeteer-based bundle).
- For text overlays inside the Rive file, use the `onLoad` callback to fetch the artboard and set `textRun('name').text = '...'` — pattern shown in Rive's docs and used in Remotion examples.
- **No SSR-without-browser path:** the runtime requires a real DOM/canvas, so Node-only headless rendering won't work — but Remotion uses headless Chrome anyway, so this is fine.
- **State machines drive themselves by time/input**, not by Remotion frame index. For deterministic video output, prefer **named single animations** over state-machines unless you wire `onStateChange` to Remotion's `useCurrentFrame()`.

### Bundle / performance
- `@rive-app/canvas` WASM is ~78KB; `@rive-app/canvas-lite` is smaller. ([Rive Canvas vs WebGL](https://help.rive.app/runtimes/overview/web-js/canvas-vs-webgl))
- Canvas renderer is fine for one character on screen; use WebGL only if compositing many.
- ([Rive optimization in React](https://pixelpoint.io/blog/rive-react-optimizations/))

### License
Free runtime (MIT). Rive community files have per-file licenses — check each. Pro Rive subscription only required for editing, not for using community-downloaded `.riv` files in your own work.

### Quality assessment
**High** — Rive files are typically more "designed" than free Lottie. They support state-machine driven mouth/eye changes that read as genuine character. Risk: many community Rive characters lean cartoony/gaming, which clashes with our editorial Inter-typeset look. Be selective.

### Reference URLs
- Remotion Rive overview: <https://www.remotion.dev/docs/rive/>
- `<RemotionRiveCanvas>` API: <https://www.remotion.dev/docs/rive/remotionrivecanvas>
- npm package: <https://www.npmjs.com/package/@remotion/rive>
- Remotion 4.0 announcement (mentions Rive): <https://www.remotion.dev/blog/4-0>
- Rive React runtime: <https://rive.app/docs/runtimes/react/react>

### Build effort
**Medium.** One `<RemotionRiveCanvas>` line is trivial, but sourcing a brand-appropriate `.riv` (or commissioning one) is the real cost. Realistic first integration: 1-2 days including asset selection.

---

## 3. Three.js / React Three Fiber

### What it is
Full 3D scenes in WebGL, driven by R3F.

### Remotion compatibility
- Official `@remotion/three` package exposes `<ThreeCanvas width height>`. R3F otherwise behaves normally inside. ([Remotion Three docs](https://www.remotion.dev/docs/three))
- **CRITICAL RULE:** drive every animation with `useCurrentFrame()`, NEVER `useFrame()` — the latter ties to wall-clock and breaks deterministic rendering. ([devsvideo Remotion 3D guide](https://devsvideo.com/remotion/remotion-3d-threejs))
- Set `layout="none"` on `<Sequence>` children inside the canvas.
- Built-in `useGLTF` / `useAnimations` from `@react-three/drei` works for Mixamo-rigged GLTF characters. ([remotion-dev/remotion-three-gltf-example](https://github.com/remotion-dev/remotion-three-gltf-example))
- Performance cost on render: WebGL inside headless Chrome works but is the slowest of all approaches per frame; expect 2-4× slowdown vs Lottie.

### Quality assessment for our brand
**Mismatched.** Our editorial format (Armando Inteligencia AI-news) reads as serious / restrained / typographic. 3D rigged characters skew youth/gaming/Web3 — they undermine the credibility we want for tech-news content. The exception: **abstract 3D shapes** (a slowly rotating Apple-style metallic-blob "agent") could fit, but a CSS/SVG orb gets 90% of the same impression at 5% of the cost.

### License
Three.js (MIT), R3F (MIT), Mixamo characters (free for any use after Adobe ID signup). Per-model licenses on Sketchfab vary — filter on CC0 / CC-BY.

### Reference URLs
- Remotion Three template: <https://www.remotion.dev/templates/three>
- GitHub template-three: <https://github.com/remotion-dev/template-three>
- GLTF example: <https://github.com/remotion-dev/remotion-three-gltf-example>
- Remotion best-practices skill (3D rules): <https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/3d.md>
- R3F + Mixamo character tutorial: <https://codeworkshop.dev/blog/2021-01-20-react-three-fiber-character-animation>
- Creating animated GLTF chars with Mixamo + Blender: <https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/>

### Build effort
**High.** Asset prep (download → Blender → export GLB → wire up `useAnimations`) plus lighting tuning plus per-frame perf testing = 3-5 days for a single character composition. Not worth it for our use-case.

---

## 4. Spline 3D embed

### What it is
Browser-based 3D scene tool. Export as a `<spline-viewer>` web-component or as code copy-pasted into R3F.

### Remotion compatibility
- Official docs page exists. Path: copy Spline-generated code, remove the `OrthographicCamera` component, use Remotion's `useThree` hook to drive the camera. ([Remotion Spline import](https://www.remotion.dev/docs/spline))
- The `<spline-viewer>` web-component path is **not** recommended for Remotion — it's runtime-only and won't seek deterministically per frame.

### Verdict
Same conclusion as Three.js: high build cost, off-brand. **Skip.**

### Reference URLs
- Remotion Spline import: <https://www.remotion.dev/docs/spline>
- Spline Viewer docs: <https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer>

---

## 5. Sprite-sheet character loops

### What it is
A single PNG/WebP image holding N frames of a character, scrolled via `background-position` (CSS `steps()`) or `<Img>` clip + `interpolate()` (Remotion).

### Remotion compatibility
Trivial — use `interpolate(frame, [0, totalFrames], [0, -spriteWidth * (N-1)])` on a `transform: translateX(...)` of an inner `<Img>`. No external package needed.

### Quality assessment
For pixel-art / retro looks it's perfect; for clean AI-explainer aesthetic it tends to look 2010-era game UI. **Pass** unless we lean into a deliberate 8-bit segment (e.g., "back when AI was just chess").

### Reference URLs
- CSS sprite-sheet steps() walkthrough: <https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps>
- LogRocket guide: <https://blog.logrocket.com/making-css-animations-using-a-sprite-sheet/>
- Lean Rada notes on CSS sprite sheets: <https://leanrada.com/notes/css-sprite-sheets/>
- React Responsive Spritesheet lib: <https://github.com/danilosetra/react-responsive-spritesheet>
- Sprite CodePen: <https://codepen.io/birjolaxew/pen/AMBgYV>

### Build effort
**Low**, but **NICHE** — only build on demand.

---

## 6. CSS-only "AI thinking" loops

### What it is
Pulsing orbs, gradient blobs, breathing dots, mouth/eye morphs — driven by CSS keyframes or Remotion's `interpolate()` against `useCurrentFrame()`.

### Why this is our highest-leverage primitive
- Zero asset pipeline. Ships as TSX.
- 100% deterministic — Remotion renders are frame-perfect.
- Brand-tint native: orb gradient uses `#1B3A6E` → `#D4AF37` directly.
- Read as "AI presence" without anthropomorphizing — fits our editorial restraint.
- Cheap to iterate: each variant is a new 30-LOC component.

### Patterns to build
1. **Pulse orb** — radial gradient + breathing `scale()` + `box-shadow` glow halo. Loop 90 frames.
2. **Thinking dots** — three circles, staggered `opacity` keyframes (the chat-app "..." pattern).
3. **Gradient sweep** — animated `background-position` on a conic gradient — reads as "processing".
4. **Audio-reactive blob** — SVG `<path>` with `d` interpolated from word timestamps (the existing `transcribe.py` output gives us those).
5. **Neural-net edges** — small `<svg>` of 5-10 nodes with `<line>` strokes whose `stroke-dashoffset` cycles. Looks like "graph traversal".
6. **Speech-bubble + caret** — caret blink + bubble scale-in.

### Reference URLs
- CSS Loaders pulsing collection: <https://css-loaders.com/pulsing/>
- AI Glow Orb (CSS only) CodePen: <https://codepen.io/HomesteadMovies/pen/emOdgYa>
- Gradient Pulse Animation CodePen (martinrss3): <https://codepen.io/martinrss3/pen/ZEjvPZE>
- Gradient Pulse with `@property` (simeydotme): <https://codepen.io/simeydotme/pen/QwjEgmq>
- Pure CSS Blob (no SVG, no JS): <https://dev.to/prahalad/pure-css-blob-animation-no-svg-no-js-2f4m>
- SMIL + CSS morphing SVG blob: <https://codepen.io/nikkipantony/pen/rNVepmY>
- Florin Pop CSS pulse effect: <https://www.florin-pop.com/blog/2019/03/css-pulse-effect/>
- CSS-Tricks Blobs article: <https://css-tricks.com/blobs/>
- 32 CSS Blob Animations gallery: <https://freefrontend.com/css-blob-effects/>
- Glowing blurred backgrounds with CSS: <https://andrewwalpole.com/blog/glowing-blurred-backgrounds-with-css/>

### Build effort
**Very low.** Each variant ≤ 60 LOC. First variant in one sitting.

---

## 7. Anthropomorphized AI brand icons in motion

### What it is
Take the existing logo SVGs of ChatGPT, Claude, Gemini, Grok, etc., and give them personality: bounce, tilt-and-look, glow on "speech", pulse on "thinking", color-shift on "answer arrives".

### Remotion compatibility
Native — render an `<svg>` and interpolate `transform`, `filter`, `opacity` against `useCurrentFrame()`. Already the pattern in our `QuoteCard9x16.tsx` and other compositions.

### Quality assessment
**Highest brand fit for AI-news editorial.** When a story is "Anthropic ships X", the Claude mark literally walking on screen / nodding / shaking hands with a competitor's logo reads as journalism, not gaming. Carlos Cuamatzin–style restraint.

### Asset sources (verify license per-mark before commit — most AI logos are trademarks and require fair-use editorial framing)
- Free AI Company Logo Collection (SVG + PNG, 150+ logos): <https://ailogocollection.netlify.app/>
- Figma Community — AI Logos pack (ChatGPT, Perplexity, Claude, MJ, Gemini, Grok, Apple): <https://www.figma.com/community/file/1408473122429615761/ai-logos-chatgpt-perplexity-claude-midjourney-gemini-grok-apple-intelligence>
- Figma Community — Free AI Product Logos (Grok, DeepSeek, ChatGPT, Claude, Gemini, Manus): <https://www.figma.com/community/file/1471713433455637603/free-ai-product-logos-grok-deepseek-chatgpt-claude-gemini>
- IconScout ChatGPT logo animation pack (Lottie): <https://iconscout.com/lottie-animation-pack/chatgpt_187510>
- LottieFiles Chat GPT Animation Pack: <https://lottiefiles.com/marketplace/chat-gpt>

### License caveat
These are **trademarks**, not free clip-art. Editorial / journalism use is broadly allowed (fair use); building merch is not. Our use case (commenting on the AI industry) sits clearly in editorial.

### Build effort
**Low.** A `<BrandMarkActor mark="claude" action="nod" />` wrapper around `<Img>` / inline SVG + a small action library = 1 day. **Build second**, right after the CSS orb primitive.

---

## 8. Hand-drawn (rough.js / Excalidraw)

### What it is
`rough.js` is a 9KB lib that renders primitives in a hand-drawn / sketched style. Excalidraw uses it. ([roughjs.com](https://roughjs.com/), [Excalidraw repo](https://github.com/excalidraw/excalidraw))

### Remotion compatibility
Works — call rough.js on canvas inside a React component, re-render each Remotion frame. But: rough.js uses a random seed per call, so you must pin the seed to avoid jitter between frames.

### Quality assessment
**Off-brand for AI-news.** The Excalidraw aesthetic codes "casual classroom whiteboard" — that's the right move for our `guionizacion-formula100k` content but the wrong move for "@armandointeligencia AI-industry editorial". Reserve for occasional segment breaks (a hand-drawn diagram intermission inside a clean explainer).

### Reference URLs
- Rough.js: <https://roughjs.com/>
- Excalidraw repo: <https://github.com/excalidraw/excalidraw>
- Rough.js algorithms post: <https://shihn.ca/posts/2020/roughjs-algorithms/>

### Build effort
Medium. **Skip for wave 1.**

---

## Recommended primitive to build first

### Spec: `AgentThinking9x16` composition

> A 1080×1920 Remotion composition that depicts "the AI is processing this" as a centered **brand-tinted orb** (radial gradient `#1B3A6E` core → `#D4AF37` halo, soft `filter: blur(40px)` glow ring), breathing on a 90-frame loop (`scale: 0.92 → 1.08 → 0.92`), with a **thought-bubble caption** below ("Pensando…" / configurable string) using Inter 56pt, and **three staggered dots** (each appears every 12 frames, fades out after 36) as the universal "thinking" signifier. No external assets, no Lottie, no WebGL — pure TSX + `useCurrentFrame()`. Optional prop `mode: "thinking" | "speaking" | "answering"` swaps the dot pattern (speaking = waveform bars driven by mock or real word timestamps from `transcribe.py`).

**Why first:** Zero asset risk, brand-perfect, ships in one sitting, becomes a reusable building block for every other AI-themed composition (drop it into the corner of `TechNewsFlash9x16`, use it as a transition between sections in `BenchmarkBars9x16`, etc.). Once it ships and we like the look, layer Lottie / brand-logo actors on top of the same orb base.

---

## Top 5 Lottie files to commit to `public/lottie/`

Verify each loads cleanly (no AE Expressions → no flicker) before committing. Drop into `public/lottie/` and reference via `staticFile('lottie/<file>.json')`.

1. **Typing dots** (Nattu Adnan) — universal "thinking" overlay; tiny file; loops seamlessly. <https://lottiefiles.com/62-typing-dot>
2. **AI Brain neural-network** — for any "model is reasoning" beat. <https://lottiefiles.com/free-animations/artificial-intelligence-brain>
3. **Chatbot typing** (Seneca) — drop-in chat-bubble + typing combo for "user asked the AI" cutaways. <https://lottiefiles.com/free-animation/chatbot-typing-ojXoUEC17y>
4. **Speech bubble (animated pop-in)** — pair with brand-tinted text overlays for quote cards. <https://lottiefiles.com/free-animations/speech-bubble>
5. **Flat-vector AI Robot character** (pick one from Birju Raikwar / Alex Samokhvalov gallery — must be flat-vector recolorable, not a 3D render) — for the occasional "the agent is doing X" beat where a literal character helps storytelling. <https://lottiefiles.com/9944-ai-robot> or <https://lottiefiles.com/37909-robot-ai>

Naming convention: `public/lottie/<kebab-case>.json`, accompanied by a sibling `<name>.LICENSE.md` capturing the author and the LottieFiles URL.

---

## What NOT to build

### Anti-patterns to actively avoid

1. **Rigged 3D character (Mixamo dancer, anime mech) in Three.js.** Breaks our editorial restraint. Render cost is high. Looks like a Web3 deck.
2. **Spline scenes embedded as iframes.** Non-deterministic vs Remotion frame clock; performance hit on render; brand mismatch.
3. **Lottie files with AE Expressions or Effects.** Will flicker on render and you'll spend hours diagnosing. Test every Lottie at 30 fps before commit. ([Remotion lottie docs](https://www.remotion.dev/docs/lottie))
4. **Cartoony Rive characters** sourced from generic community packs. They drag the brand toward "edutainment for kids", not "AI industry editorial". If we use Rive, commission one in the brand palette.
5. **Excalidraw / hand-drawn for AI-news pieces.** Reserve for explainer / guionizacion content. Don't mix.
6. **Sprite-sheet pixel-art characters** outside of deliberate retro segments.
7. **Anthropomorphized brand-logo motion that mocks competitors.** Editorial = commentary, not satire. Keep movements neutral (nod, pulse, slide); avoid "claude punches gpt" style.
8. **Animations that don't tile cleanly over a 30/60/90-frame boundary.** Compositions are short loops on 30fps; non-tiling loops cause visible pops at scene boundaries.

---

## Wave-1 implementation plan (next steps)

1. **Build `AgentThinking9x16.tsx`** — spec above. Add to `src/Root.tsx`. 1 hour.
2. **Build `BrandMarkActor.tsx`** — `<BrandMarkActor mark="claude" | "gpt" | "gemini" action="nod" | "pulse" | "enter-left" />`. 2 hours including 3 brand SVGs into `public/brand/ai-marks/`.
3. **Commit the Top-5 Lottie files** with `.LICENSE.md` siblings. 30 min.
4. **Spike `<RemotionRiveCanvas>`** with one community `.riv` to confirm the renderer works in our pipeline before adding to the template library. 1 hour.
5. **Defer** Three.js / Spline indefinitely. Revisit only if a specific brief demands literal 3D.

---

## Sources

### Remotion docs
- [@remotion/lottie overview](https://www.remotion.dev/docs/lottie)
- [<Lottie> component](https://www.remotion.dev/docs/lottie/lottie)
- [Finding Lottie files (Remotion guidance)](https://www.remotion.dev/docs/lottie/lottiefiles)
- [Loading Lottie from staticFile()](https://www.remotion.dev/docs/lottie/staticfile)
- [Loading Lottie from URL](https://www.remotion.dev/docs/lottie/remote)
- [@remotion/rive overview](https://www.remotion.dev/docs/rive/)
- [<RemotionRiveCanvas> API](https://www.remotion.dev/docs/rive/remotionrivecanvas)
- [@remotion/three overview](https://www.remotion.dev/docs/three)
- [<ThreeCanvas>](https://www.remotion.dev/docs/three-canvas)
- [Spline import path](https://www.remotion.dev/docs/spline)
- [Remotion Three template](https://www.remotion.dev/templates/three)
- [remotion-three-gltf-example](https://github.com/remotion-dev/remotion-three-gltf-example)
- [Remotion 4.0 release notes](https://www.remotion.dev/blog/4-0)
- [Remotion skills repo — 3D rules](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/3d.md)
- [vercel-labs/json-render Lottie best practices](https://github.com/vercel-labs/json-render/blob/main/skills/remotion-best-practices/rules/lottie.md)

### Lottie ecosystem
- [LottieFiles AI Robot](https://lottiefiles.com/free-animations/ai-robot)
- [LottieFiles AI Assistant](https://lottiefiles.com/free-animations/ai-assistant)
- [LottieFiles Neural Network](https://lottiefiles.com/free-animations/neural-network)
- [LottieFiles AI Brain](https://lottiefiles.com/free-animations/artificial-intelligence-brain)
- [Chatbot Typing (Seneca)](https://lottiefiles.com/free-animation/chatbot-typing-ojXoUEC17y)
- [Typing Dots (Nattu Adnan)](https://lottiefiles.com/62-typing-dot)
- [Speech Bubble collection](https://lottiefiles.com/free-animations/speech-bubble)
- [Lottie Simple License](https://lottiefiles.com/page/license)
- [Commercial Use & Attribution](https://help.lottiefiles.com/hc/en-us/articles/45243303062681-Commercial-Use-Attribution)
- [Unsupported Lottie features (forum)](https://forum.lottiefiles.com/t/unsupported-features/5889)
- [Common Lottie mistakes (elpassion)](https://www.elpassion.com/blog/lottie-who-common-mistakes-in-after-effects-animation-for-lottie)
- [IconScout ChatGPT Animation Pack](https://iconscout.com/lottie-animation-pack/chatgpt_187510)
- [IconScout Robot Working at Computer](https://iconscout.com/lottie-animations/robot-working-at-computer)

### Rive ecosystem
- [Rive React runtime](https://rive.app/docs/runtimes/react/react)
- [Rive Canvas vs WebGL](https://help.rive.app/runtimes/overview/web-js/canvas-vs-webgl)
- [Preloading Rive WASM](https://help.rive.app/runtimes/overview/web-js/preloading-wasm)
- [Pixel Point — Rive React optimizations](https://pixelpoint.io/blog/rive-react-optimizations/)
- [rive-app/rive-react GitHub](https://github.com/rive-app/rive-react)
- [@remotion/rive on npm](https://www.npmjs.com/package/@remotion/rive)

### Three.js / Spline
- [Remotion 3D guide (devsvideo)](https://devsvideo.com/remotion/remotion-3d-threejs)
- [R3F character animation tutorial](https://codeworkshop.dev/blog/2021-01-20-react-three-fiber-character-animation)
- [Don McCurdy — Mixamo + Blender → glTF](https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/)
- [Spline Viewer docs](https://docs.spline.design/exporting-your-scene/web/exporting-as-spline-viewer)
- [Spline scene optimization](https://docs.spline.design/doc/how-to-optimize-your-scene/doczPMIye7Ko)

### CSS / SVG primitives
- [css-loaders.com pulsing collection](https://css-loaders.com/pulsing/)
- [AI Glow Orb CodePen](https://codepen.io/HomesteadMovies/pen/emOdgYa)
- [Gradient Pulse (martinrss3)](https://codepen.io/martinrss3/pen/ZEjvPZE)
- [Gradient Pulse @property (simeydotme)](https://codepen.io/simeydotme/pen/QwjEgmq)
- [Pure CSS Blob](https://dev.to/prahalad/pure-css-blob-animation-no-svg-no-js-2f4m)
- [SMIL morphing SVG blob](https://codepen.io/nikkipantony/pen/rNVepmY)
- [CSS-Tricks: Blobs!](https://css-tricks.com/blobs/)
- [32 CSS Blob Animations](https://freefrontend.com/css-blob-effects/)
- [Glowing blurred CSS backgrounds](https://andrewwalpole.com/blog/glowing-blurred-backgrounds-with-css/)

### Sprite sheet / hand-drawn
- [Treehouse: CSS sprite steps()](https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps)
- [LogRocket: CSS sprite animations](https://blog.logrocket.com/making-css-animations-using-a-sprite-sheet/)
- [react-responsive-spritesheet](https://github.com/danilosetra/react-responsive-spritesheet)
- [roughjs.com](https://roughjs.com/)
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)

### AI brand-logo collections
- [AI Logo Collection (SVG/PNG, 150+)](https://ailogocollection.netlify.app/)
- [Figma AI Logos pack](https://www.figma.com/community/file/1408473122429615761/ai-logos-chatgpt-perplexity-claude-midjourney-gemini-grok-apple-intelligence)
- [Figma Free AI Product Logos](https://www.figma.com/community/file/1471713433455637603/free-ai-product-logos-grok-deepseek-chatgpt-claude-gemini)
