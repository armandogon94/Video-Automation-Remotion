# Remotion 4 Deep Dive for @armandointeligencia Vertical Pipeline

> Research Stream B · 2026-05-18 · Opus deep research.
> Target: 1080×1920 Spanish AI/tech shorts, editorial cream-paper aesthetic, Remotion 4.0.443 + Edge-TTS + faster-whisper + FFmpeg.

---

## Eight high-quality vertical Remotion projects worth dissecting

### 1. `remotion-dev/template-tiktok` — the canonical TikTok caption template
- `<OffthreadVideo>` background, `<AbsoluteFill>` overlay band at `bottom: 350`, height 150px
- Pages of captions as `<Sequence>` driven by JSON timing
- Each page enters with a spring (`damping: 200`, `durationInFrames: 5`)
- Active word recolored `#39E508`, inactive white with 20px black stroke
- Uses `@remotion/captions` (`createTikTokStyleCaptions`), `@remotion/media-utils` (`getVideoMetadata`), `@remotion/layout-utils` (`fitText`)
- `calculateMetadata` reads the actual MP4 duration via `getVideoMetadata()` — composition length is never hardcoded
- `watchStaticFile()` re-fetches the JSON sidecar live in Studio when Whisper finishes
- `fitText({ withinWidth: width * 0.9 })` dynamically resizes each page
- **Transfer to us:** All of it. The canonical pattern for caption rendering.

### 2. `remotion-dev/template-prompt-to-video` — AI story → vertical video
- Yellow-on-black "shortTitle" intro block, then per-scene `<Background>` with Ken-Burns
- Three parallel `<Sequence>` arrays: images, text, audio — all driven by `timeline.json`
- `premountFor={3 * FPS}` so images decode 3 seconds before they appear
- `calculateMetadata` reads `timeline.json` at composition-load
- Multi-composition `<RemotionRoot>`: loops over every `*timeline.json` in `public/`
- **Transfer:** The 3-track timeline pattern (images / text / audio as separate `<Sequence>` arrays), `premountFor`, multi-composition discovery.

### 3. `remotion-dev/template-audiogram` — audio waveform vertical
- Cover art top, large title middle, live waveform bottom band
- Uses `useAudioData`, `visualizeAudio` from `@remotion/media-utils`
- `visualizeAudio({ fps, frame, audioData, numberOfSamples: 16 })` returns 16 amplitude values 0–1
- **Transfer:** Drive a single accent-color underline that pulses with Edge-TTS voiceover energy.

### 4. `remotion-dev/template-three` — 3D scene reveal
- `<ThreeCanvas>` forces `frameloop="never"` and only advances via Remotion's tick
- `layout="none"` mandatory on `<Sequence>` nested inside canvas
- **Transfer:** Skip unless we want a 3D logo sting. Higher ROI from procedural Canvas2D.

### 5. `Just-Moh-it/Mockoops` — mockup-style social videos
- Layered: device bezel PNG, screen content `<OffthreadVideo>`, animated emoji reactions, comment bubbles
- Uses `@remotion/transitions/slide`, `@remotion/lottie`
- **Transfer:** Small Lottie tags/badges that punctuate hooks.

### 6. `karelnagel/motionly` — JSON-driven motion graphics
- `<TransitionSeries>` with chainable presentations; each scene is its own React component
- Type-safe scene registry pattern
- **Transfer:** The registry pattern, treating every scene as typed component.

### 7. `gyoridavid/short-video-maker` — MCP-driven short factory
- Full-bleed `<OffthreadVideo>` Pexels clip cycling per sentence
- TikTok-style burned captions, voiceover, light music bed
- Whisper-derived caption timing matched to B-roll cycling
- **Transfer:** Same pipeline shape as ours + stock B-roll. Overlay B-roll as 40%×30% window inside cream frame, not full-bleed.

### 8. `aaurelions/short-video-maker` — fork with subtitle highlight variants
- Same concept as #7, but ships 4–5 caption styles (TikTok green, Karaoke red wipe, Subscribed yellow, Bouncy white)
- **Transfer:** Principle of 3–4 caption renderers selected per-video by template field. Directly solves "every video looks the same".

### 9-10. `FelippeChemello/podcast-maker` + `typeframes.com`
- Per-glyph staggered springs (`spring({ frame: frame - i * 2, ... })`) — "letters land in sequence"
- Animated mesh-gradient backgrounds drawn into `<canvas>` from `useCurrentFrame()`
- **Transfer:** Per-glyph stagger + canvas backgrounds.

---

## Ten advanced Remotion 4 patterns to adopt

### Pattern 1 — Audio-anchored overlay timing (the keyword trigger)
Use Edge-TTS + whisper word timings to anchor overlay entry on actual spoken keywords. Pipeline resolves `{ trigger: { keyword: "gemini", occurrence: 0 } }` to absolute frames BEFORE passing props to Remotion. Composition stays pure.

```ts
export function findKeywordFrame(words, keyword, fps, occurrence = 0) {
  const normalize = (s) => s.toLowerCase().replace(/[^\p{L}\d]/gu, "");
  const target = normalize(keyword);
  const matches = words.filter((w) => normalize(w.text).includes(target));
  const hit = matches[occurrence];
  if (!hit) return null;
  return { fromFrame: Math.round(hit.startFrame), durationFrames: Math.round(hit.endFrame - hit.startFrame) + Math.round(0.8 * fps) };
}
```

### Pattern 2 — Per-scene componentization inside `<Series>`
Replace giant overlay-window enum with real React components. `<HookScene>`, `<ContextScene>`, `<DataScene>`, `<CTAScene>` — each owning its own props, springs, layout.

```tsx
<Series>
  <Series.Sequence durationInFrames={hookFrames}><HookScene {...scenes.hook} /></Series.Sequence>
  <Series.Sequence durationInFrames={contextFrames} offset={-6}><ContextScene {...scenes.context} /></Series.Sequence>
  <Series.Sequence durationInFrames={ctaFrames}><CTAScene {...scenes.cta} /></Series.Sequence>
</Series>
```

### Pattern 3 — `@remotion/transitions` between scenes
`fade`, `slide`, `wipe`, `clockWipe`, `iris`, `flip`. Clock-wipe is the cleanest "editorial cut" — feels like a newspaper page turn.

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={hookFrames}><HookScene /></TransitionSeries.Sequence>
  <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 14 })} presentation={clockWipe({ width, height })} />
  <TransitionSeries.Sequence durationInFrames={contextFrames}><ContextScene /></TransitionSeries.Sequence>
</TransitionSeries>
```

### Pattern 4 — `createTikTokStyleCaptions` (replace our hand-rolled 6-word window)
Use Remotion's first-party caption library with proper TikTok-style word-by-word pagination. Handles long words, punctuation, sentence breaks.

```tsx
const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 900, // editorial pace; 1200 chunky, 400 frantic
});
```

### Pattern 5 — `<OffthreadVideo>` for B-roll inside the cream frame
Small ~720×720 silent stock video inset into cream paper layout — motion without abandoning editorial style. Pexels API supplies clips by keyword.

### Pattern 6 — `@remotion/lottie` for accent micro-animations
Small Lottie tags (red ink stamp "LEAK", tiny chart drawing itself, checkmark) punctuating hook moments. Use `useDelayRender("lottie")` to wait for JSON parsing.

### Pattern 7 — Audio-reactive accent (single subtle pulse, not a waveform)
Accent-red dotted underline pulses slightly in size on voice peaks. Subliminal — reads as "alive".

```tsx
const audioData = useAudioData(audioSrc);
const spectrum = visualizeAudio({ fps, frame, audioData, numberOfSamples: 4 });
const energy = Math.min(1, spectrum[0] * 4); // bass bin carries vocal energy
```

### Pattern 8 — `calculateMetadata` for dynamic duration from MP3
No more guessing `durationInFrames`. Read actual voiceover MP3 with `getAudioDurationInSeconds()`, add 0.5s tail.

```tsx
calculateMetadata={async ({ props }) => {
  const seconds = await getAudioDurationInSeconds(props.audioUrl);
  return { durationInFrames: Math.ceil((seconds + 0.5) * 30) };
}}
```

### Pattern 9 — `@remotion/zod-types` with `zColor()` for visual schema editing
Brand colors editable in Remotion Studio with color picker. Replace `z.string()` on color fields with `zColor()`.

### Pattern 10 — Procedural Canvas2D background drawn per-frame
Replace static cream paper with slowly shifting cream-paper grain drawn into `<canvas>` each frame. Deterministic noise seeded from frame number.

---

## Five anti-patterns

1. **One spring config copy-pasted everywhere.** Every overlay in our `TechNewsFlash9x16.tsx` uses identical `{ damping: 15, stiffness: 110 }`. Use a palette (`enterCalm`, `enterSnappy`, `enterDramatic`) and route per scene type.
2. **Linear opacity fades via `interpolate(frame, [0, 30], [0, 1])`.** Feel cheap. Replace with `spring()` or `interpolate(frame, [0, 6, 10, 14], [0, 1, 1.04, 1])` for tiny over-shoot.
3. **Centered, full-width text on every scene.** Default "absolute-fill, flex center" reads "AI generated". Break grid: left-align hooks, right-anchor context, off-center headlines.
4. **Hardcoded `durationInFrames` on `<Composition>`.** `calculateMetadata` + `getAudioDurationInSeconds` (Pattern #8) eliminates this. Amateur tell.
5. **One caption renderer, one font weight, one color.** Pick ONE accent ritual (active word in `#B33A2A`, past words ink-gray, future words 40% ink) and don't add second highlight.

---

## Top 5 concrete next steps for our pipeline

### 1. Rewrite `TechNewsFlash9x16.tsx` around `<TransitionSeries>` of scene components
Replace `overlays[]` enum + `<Sequence>` map with `scenes.{hook,context,data,cta}` and named scene components inside `<TransitionSeries>` with `clockWipe` between hook→context and `slide({direction:"from-bottom"})` between context→CTA.

### 2. Adopt `createTikTokStyleCaptions` + `fitText` and ship 3 caption variants
Delete the hand-rolled 6-word window. Wrap word timings in `Caption[]`, page with `createTikTokStyleCaptions({ combineTokensWithinMilliseconds: 900 })`. Ship three styles: `editorial-block`, `karaoke-underline`, `ticker`.

### 3. Wire `calculateMetadata` + `getAudioDurationInSeconds`
In `src/Root.tsx`, set `calculateMetadata` on every `<Composition>` to read MP3. Remove duration math from `pipeline.ts`.

### 4. Add `keywordTrigger` resolver to pipeline
Allow overlays/scenes/Lottie/B-roll to declare `{ trigger: { keyword: "filtración", occurrence: 0, lead: 0.2, hold: 0.8 } }`. Pipeline resolves to absolute `{ startSeconds, endSeconds }` from faster-whisper word timings BEFORE `npx remotion render`.

### 5. Replace static cream with `PaperGrain` canvas + add Lottie accent slot
Drop the existing `radial-gradient` div, mount `<PaperGrain>` Canvas2D component (Pattern #10). Add `lottieAccent?: { src, trigger, size }` in schema, wire `@remotion/lottie@4.0.443`. Curate ~6 Lottie files in `public/lottie/`.

---

## Sources

Remotion v4.0 blog, releases, showcase, docs (animating-properties, spring, interpolate, easing, audio-visualization, useAudioData, openAiWhisperApiToCaptions, captions/caption, @remotion/captions, @remotion/transitions, TransitionSeries, calculateMetadata, dynamic-metadata, getAudioDurationInSeconds, @remotion/lottie, @remotion/zod-types, zColor, Series, OffthreadVideo, prefetch), GitHub repos (template-tiktok, template-prompt-to-video, Mockoops, motionly, short-video-maker × 2, podcast-maker, typeframes.com).
