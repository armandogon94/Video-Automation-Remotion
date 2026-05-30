# R5 — Kinetic Typography & Text-Reveal Patterns

> **Wave 1 research, 2026-05-25.** Companion to R1 (motion-design typology) and the existing `EditorialCaption` (word-by-word reveal with active-word highlight in `src/components/captions/EditorialCaption.tsx`).
>
> **Goal:** Expand our text-animation toolbox beyond the editorial word-highlight pattern. Survey 12 reveal techniques used in AI/tech motion content, pick the 5 worth implementing as composable primitives, and spec a single `AnimatedText9x16` composition that can render any of them.

---

## TL;DR

The Spanish-language AI/tech vertical-video category is dominated by **word-by-word bold captions with one highlighted keyword**, **scramble/decrypt reveals** (hacker-coded AI aesthetic), **blur-in fade**, **scale-in punch**, and **typewriter** with caret. Everything else is supporting punctuation. Of the 12 patterns surveyed, **5 deserve to be first-class primitives** in our Remotion toolbox; 3 are anti-patterns that look amateur or AI-generated and should be avoided.

Top 5 build order: **TypewriterCaret → BlurIn → ScaleInPunch → ScrambleDecrypt → HighlightSweep**.

---

## Pattern Survey (12 patterns)

For each pattern: **visual description / where it shines / Remotion recipe (5-8 lines pseudocode) / reference**.

---

### 1. Typewriter (char-by-char or word-by-word with caret)

**Visual:** Characters appear one at a time as if being typed, with a blinking caret. Pause between sentences sells the "writing" feeling.

**Where it shines:**
- AI-generated text demos ("ChatGPT typing", "Claude responding")
- Code-reveal scenes
- "Here's what I asked the AI: …" framing
- Works at 9:16 if the line wraps are pre-computed (no reflow shift mid-typing)
- **Accent-safe** for Spanish: emit the full grapheme cluster per tick, not raw `charAt` (avoid splitting combining diacritics — use `Array.from(str)` not `str.split('')`)

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const chars = Array.from(text); // grapheme-safe for "ñ", "á", emoji
const charsPerSec = 30; // ~typing speed; spring at end to crisp the last char
const visible = Math.min(chars.length, Math.floor((frame / fps) * charsPerSec));
const shown = chars.slice(0, visible).join("");
const caretOn = Math.floor(frame / (fps / 2)) % 2 === 0;
return <span>{shown}<span style={{opacity: caretOn ? 1 : 0}}>▌</span></span>;
// CRITICAL: use string slicing, NOT per-char opacity — Remotion docs explicitly warn
// against per-char opacity for typewriter (renders 1000+ DOM nodes per frame).
```

**Reference:** [remotion-dev/typewriter (official repo)](https://github.com/remotion-dev/typewriter); [Remotion text-animations skill rules](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md). YouTube AI-news creators use this for any "I asked the model" beat.

---

### 2. Scramble / Hacker / Decrypt

**Visual:** Each character cycles through random glyphs (`!@#$%^`, katakana, binary) then "lands" on the final character. Adjacent characters resolve at slightly different rates so the whole word locks in over ~400-800ms.

**Where it shines:**
- AI model name reveals ("**GPT-5**", "**Gemini 3**") — the "decrypt" feels like the AI being summoned
- Big-number reveals where the final number matters more than the transition
- AI-coded content lane in general (very on-brand for our "AI news" pieces like `2026-05-18-gemini-3-2-flash-leak`)
- **Spanish caveat:** the alphabet pool should include `ñ á é í ó ú ¿ ¡` so the scramble visually matches the destination character set

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const startFrame = 0;
const lockDurationFrames = fps * 0.6;
const charPool = "ABCDEFGHIJ!@#$%01ñáéíóú";
return Array.from(text).map((finalChar, i) => {
  const lockAt = startFrame + i * 2 + lockDurationFrames; // stagger lock time
  const locked = frame >= lockAt;
  // Seeded random per (frame, i) so it's deterministic for SSR rendering
  const r = mulberry32(frame * 31 + i)();
  const shown = locked ? finalChar : charPool[Math.floor(r * charPool.length)];
  return <span key={i}>{shown}</span>;
});
```

**Reference:** [Motion.dev ScrambleText](https://motion.dev/docs/react-scramble-text) (uses motion values, no re-renders — good model for Remotion port); [shadcn DecryptedText](https://www.shadcn.io/text/decrypted-text); [Use-Scramble hook docs](https://www.use-scramble.dev/).

---

### 3. Blocky Reveal (mask wipe across text)

**Visual:** A solid color block sits over the text, then slides off (or shrinks) left-to-right, revealing the text behind it like a sliding door. Sometimes the block changes color as it sweeps (brand-accent → text behind).

**Where it shines:**
- Hard cuts between sections / chapter cards
- Tech brand reveals (paired with logo)
- Editorial "headline" treatment — exact fit for our current `cream paper + warm red` aesthetic
- Works flawlessly with Spanish accents (the mask doesn't care what's behind it)

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const progress = spring({frame, fps, config: {damping: 200, stiffness: 100}});
// clip-path inset wipes the block off to the right
const inset = `inset(0 ${(1 - progress) * 100}% 0 0)`;
return (
  <div style={{position: "relative", display: "inline-block"}}>
    <span>{text}</span>
    <div style={{
      position: "absolute", inset: 0,
      background: brand.accent,
      clipPath: `inset(0 0 0 ${progress * 100}%)`, // block slides right
    }}/>
  </div>
);
```

**Reference:** [CSS-Tricks animating clip-path](https://css-tricks.com/animating-with-clip-path/); [Codrops stagger reveal](https://tympanus.net/codrops/2020/06/17/making-stagger-reveal-animations-for-text/).

---

### 4. Word Swap / Scroll ("this is X" where X cycles)

**Visual:** A static prefix ("This is …" / "AI for …") with a slot that cycles through values via vertical slide or flip. Most modern variant: each new word slides up while the old word slides up-and-out, like a slot machine that lands on each value.

**Where it shines:**
- Hook scenes ("AI for **doctors / lawyers / founders / you**")
- Pricing / comparison scenes
- Listicle openings — could replace static numbered intros in `Listicle.tsx`
- **Width gotcha:** the slot needs to fit the longest word, or animate `width` alongside content (looks better but cost = layout thrash)

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const wordIdx = Math.floor(frame / (fps * 1.2)) % words.length;
const localFrame = frame % (fps * 1.2);
const offsetY = interpolate(localFrame, [0, fps * 0.25], [40, 0], {extrapolateRight: "clamp"});
const opacity = interpolate(localFrame, [0, fps * 0.2], [0, 1], {extrapolateRight: "clamp"});
return (
  <div style={{display: "inline-flex"}}>
    <span>This is </span>
    <span style={{overflow: "hidden", display: "inline-block"}}>
      <span style={{transform: `translateY(${offsetY}px)`, opacity, display: "inline-block"}}>
        {words[wordIdx]}
      </span>
    </span>
  </div>
);
```

**Reference:** [Codrops rotating words](https://tympanus.net/codrops/2012/04/17/rotating-words-with-css-animations/); [Fancy Components text-rotate](https://www.fancycomponents.dev/docs/components/text/text-rotate).

---

### 5. Split-Text Fade (each word/letter fades in independently)

**Visual:** Text is split into words (or letters) and each one fades in with a small stagger (50-80ms). No movement, just opacity. Quiet, premium, editorial.

**Where it shines:**
- Quote cards (already used implicitly via our caption highlight, but as a *first-impression* reveal it stands alone)
- "Long sentence that needs to land" — manifesto beats
- Works in any language, accent-safe
- At 9:16: fades to focal-point well because there's no horizontal motion competing with the vertical scroll affordance

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const staggerFrames = 3; // ~50ms at 60fps
return text.split(" ").map((word, i) => {
  const start = i * staggerFrames;
  const opacity = interpolate(frame, [start, start + 15], [0, 1], {extrapolateRight: "clamp"});
  return <span key={i} style={{opacity, marginRight: "0.3em"}}>{word}</span>;
});
```

**Reference:** [Framer Motion text variants (Frontend.fyi)](https://www.frontend.fyi/v/staggered-text-animations-with-framer-motion); [web.dev split-text-animations](https://web.dev/articles/building/split-text-animations).

---

### 6. Letter Rise / Fall (slide-in from below/above)

**Visual:** Each letter starts ~30-50px below its final position with opacity 0, then springs up and into place. Stagger between letters = 30-50ms.

**Where it shines:**
- Hero titles
- Brand reveals
- Section transitions paired with a sound design "whoosh"
- Risk: at small font sizes (captions), the vertical motion is invisible — only use for hero text >72px
- Accents: combining marks may animate separately if you split by `char` — use grapheme clusters

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
return Array.from(text).map((ch, i) => {
  const startFrame = i * 2;
  const y = spring({frame: frame - startFrame, fps, from: 40, to: 0, config: {damping: 14}});
  const opacity = interpolate(frame - startFrame, [0, 10], [0, 1], {extrapolateRight: "clamp"});
  return <span key={i} style={{display: "inline-block", transform: `translateY(${y}px)`, opacity}}>{ch === " " ? " " : ch}</span>;
});
```

**Reference:** [Motion.dev stagger tutorial](https://motion.dev/tutorials/js-stagger); [Codrops TypographyMotion](https://github.com/codrops/TypographyMotion).

---

### 7. Blur-In (very blurry → crisp)

**Visual:** Text starts with `filter: blur(20px)` and `opacity: 0`, transitions to `blur(0)` and `opacity: 1` over ~500ms. Looks like the text is "focusing in" from out-of-focus, very cinematic and very on-brand for AI/tech (echoes generative-imagery diffusion aesthetic).

**Where it shines:**
- "Reveal the answer" moments
- Quote intros
- Hero text where letter-rise would feel too playful
- **Best of all in 9:16** — works at any font size, no horizontal-motion conflict
- Spanish: blur is glyph-agnostic, fully safe

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const progress = spring({frame, fps, config: {damping: 200, stiffness: 80}});
const blurPx = interpolate(progress, [0, 1], [24, 0]);
const opacity = interpolate(progress, [0, 0.6], [0, 1], {extrapolateRight: "clamp"});
return <span style={{filter: `blur(${blurPx}px)`, opacity, willChange: "filter"}}>{text}</span>;
// PERF: CSS filter blur is GPU-accelerated in Chromium; safe at 1080x1920 for short clips.
// For multi-element scenes, prefer staggered blur per WORD (not per letter) — letter-level
// blur creates ~30+ composite layers per frame and tanks render speed.
```

**Reference:** [Cruip blur-reveal with Framer Motion](https://cruip.com/blur-reveal-effect-with-framer-motion-and-tailwind-css/); [Remotion animating properties](https://www.remotion.dev/docs/animating-properties).

---

### 8. Scale-In Punch (oversized → final scale with overshoot)

**Visual:** Text starts at scale 1.3-1.5x with opacity 0, springs DOWN to scale 1 with overshoot to 0.95 → 1.02 → 1. Lands with a "thump". Often paired with a 1-frame white flash or shadow pop.

**Where it shines:**
- Big-number scenes (drops in then settles)
- Statement headlines ("**$1B raised**", "**100M users**")
- Lower-thirds reveals
- Tech-news flash style — perfect for `TechNewsFlash9x16`
- At 9:16: scale should pivot from the *center of the visible composition*, not center of bounding box (or it pops out of frame on long headlines)

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const scale = spring({frame, fps, from: 1.4, to: 1, config: {damping: 8, mass: 0.8, stiffness: 120}});
const opacity = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: "clamp"});
return <span style={{display: "inline-block", transform: `scale(${scale})`, opacity, transformOrigin: "center"}}>{text}</span>;
```

**Reference:** [Remotion spring() docs](https://www.remotion.dev/docs/spring); [Motionscript bounce & overshoot](https://www.motionscript.com/articles/bounce-and-overshoot.html).

---

### 9. Underline Draw-On (text static, underline animates)

**Visual:** Text appears static; an underline (or marker stroke) draws itself left-to-right beneath one or more words. SVG path with animated `stroke-dashoffset`.

**Where it shines:**
- Keyword emphasis inside an already-revealed sentence ("AI **agents** are eating software")
- Slow editorial pace — pairs with `EditorialCaption`'s warm-red accent
- *Not* a primary reveal — a secondary emphasis layer

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const progress = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
const pathLen = 200; // measured once via getTotalLength()
return (
  <span style={{position: "relative", display: "inline-block"}}>
    {text}
    <svg style={{position: "absolute", left: 0, bottom: -4, width: "100%", height: 8, overflow: "visible"}}>
      <path d="M0 4 Q 100 0 200 4" stroke={brand.accent} strokeWidth={4} fill="none"
        strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - progress)} />
    </svg>
  </span>
);
```

**Reference:** [CSS-Tricks SVG line animation](https://css-tricks.com/svg-line-animation-works/); [ishadeed custom underlines](https://ishadeed.com/article/custom-underline-svg/); [Envato highlight-text packs](https://elements.envato.com/highlight-text-6PSUWEX).

---

### 10. Number Ticker (rolling digits / odometer)

**Visual:** Each digit is its own column. To go from 0 → 1234, each digit column animates from its current digit to the next. Premium variant: trailing digits flicker through intermediate values; leading digits snap.

**Where it shines:**
- Statistic reveals ("**12,847** AI startups funded in 2026")
- Price drops
- Time-to-launch countdowns
- Already a sibling pattern to `BigNumberHero9x16`
- Spanish: number formatting (thousand separator `1.234,56` in Spanish vs `1,234.56` in English) — use `Intl.NumberFormat('es-MX')` not string concat

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const value = interpolate(frame, [0, fps * 1.5], [0, target], {extrapolateRight: "clamp"});
const formatted = new Intl.NumberFormat("es-MX").format(Math.floor(value));
return Array.from(formatted).map((d, i) => (
  <span key={i} style={{display: "inline-block", width: "0.7em", textAlign: "center", fontVariantNumeric: "tabular-nums"}}>
    {d}
  </span>
));
// For TRUE odometer (each digit rolls within its column), use a vertical stack of 0-9
// and translateY(-digit * lineHeight). More work, very satisfying.
```

**Reference:** [HubSpot Odometer.js](https://github.hubspot.com/odometer/docs/welcome/); [Motion AnimateNumber](https://motion.dev/docs/react-animate-number); [shadcn Sliding Number](https://www.shadcn.io/text/sliding-number).

---

### 11. Sentence Stream (line-by-line accumulation with prior lines dimming)

**Visual:** A new line appears at the bottom. The previous line fades to 50% opacity. The line before that fades to 25%. As more lines stream in, older lines slide up and fade out. Like a terminal log or a transcript view.

**Where it shines:**
- "Build-up" monologues ("Then AI happened. / Then jobs changed. / Then we adapted.")
- Transcript-style scenes (paired with a TTS line per sentence)
- Quoting AI output line-by-line ("Claude responded:")
- 9:16 friendly because it uses vertical real estate efficiently — 3-4 lines visible
- This is essentially what `EditorialCaption` does at *word* granularity; this is the *sentence* version

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const sentenceDuration = fps * 1.5;
const visibleCount = Math.floor(frame / sentenceDuration) + 1;
return (
  <div style={{display: "flex", flexDirection: "column", gap: 8}}>
    {sentences.slice(0, visibleCount).map((s, i) => {
      const age = visibleCount - i - 1;
      const opacity = Math.max(0.15, 1 - age * 0.35);
      return <div key={i} style={{opacity, transition: "opacity 0.3s"}}>{s}</div>;
    })}
  </div>
);
```

**Reference:** Pattern is informal but widely used — Lex Fridman / Karpathy [Lexicap](https://karpathy.ai/lexicap/) transcripts inspire the visual; closest doc is [Framer Motion staggered reveal](https://medium.com/@onifkay/creating-staggered-animations-with-framer-motion-0e7dc90eae33).

---

### 12. Highlight Sweep (rectangle marker sweeps across text)

**Visual:** A colored rectangle (highlighter marker) sweeps across one or more words from left to right, leaving a translucent fill behind. Looks like a real marker pen.

**Where it shines:**
- Keyword emphasis (a beefier version of #9 underline)
- Editorial/notes aesthetic — fits the cream-paper + warm-red brand
- Combined with `EditorialCaption`'s active-word highlight: caption reveals, then highlight-sweep on the keyword for double emphasis
- Spanish accents safe

**Recipe (Remotion):**
```tsx
const frame = useCurrentFrame();
const progress = spring({frame, fps, config: {damping: 200, stiffness: 90}});
return (
  <span style={{position: "relative", display: "inline-block", padding: "0 4px"}}>
    <span style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(90deg, ${brand.accent}88 0%, ${brand.accent}88 100%)`,
      transformOrigin: "left center",
      transform: `scaleX(${progress})`,
      zIndex: -1, borderRadius: 2,
    }}/>
    {text}
  </span>
);
```

**Reference:** [MarkerHighlight.js](https://marker-highlight.solarise.dev/); [shadcn Highlight Text](https://www.shadcn.io/text/highlight-text); [CodeMyUI marker pen effect](https://codemyui.com/marker-pen-effect-on-text-animation/).

---

## Library / Tooling Survey

| Library | Versioning | Remotion fit | Notes |
|---|---|---|---|
| **GSAP SplitText** | GSAP 3.x (Apache 2.0 as of 2024) | **Poor.** GSAP is timeline-based and assumes a wall-clock — Remotion is frame-deterministic. Possible via `gsap.to({}, {duration, onUpdate})` with manual frame mapping, but you're fighting the tool. | [GSAP SplitText guide](https://www.annnimate.com/blog/gsap-text-animation-splittext-guide). Best for *web* not for SSR-rendered video. |
| **anime.js v4** | v4 (2024, MIT) | **Poor**, same reason as GSAP — timeline-driven. | [GSAP vs anime.js 2026](https://www.wmtips.com/technologies/compare/anime.js-vs-gsap/) |
| **framer-motion / motion** | motion v11+ (2026) | **OK-ish**, but Remotion already gives you `spring()` and `interpolate()` — no upside. Their `MotionValue` system bypasses React rerender which is interesting for live web, irrelevant for video where every frame is rerendered. | [Framer Motion text variants](https://medium.com/@onifkay/creating-staggered-animations-with-framer-motion-0e7dc90eae33) |
| **react-typed / typewriter-effect** | typewriter-effect 2.22 | **Avoid for video.** Both use `setInterval` / wall-clock — non-deterministic across SSR render and Studio preview. Build it from `useCurrentFrame()`. | [Remotion typewriter rules](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md) |
| **use-scramble / motion ScrambleText** | motion v11+ | **OK** as algorithm reference but port the logic, don't import — same wall-clock issue. | [use-scramble.dev](https://www.use-scramble.dev/) |
| **Remotion `interpolate()` + `spring()`** | 4.0.443 | **The right tool.** Frame-deterministic, SSR-safe, all 12 patterns above are implementable in pure Remotion primitives. | [Remotion animating properties](https://www.remotion.dev/docs/animating-properties) |
| **shadcn/io text components** | rolling release | Good **algorithm reference** (DecryptedText, SlidingNumber, HighlightText) — copy the logic into Remotion-native components. | [shadcn.io/text](https://www.shadcn.io/text) |

**Verdict:** for our pipeline, **avoid wall-clock-driven libraries**. Build every reveal from `useCurrentFrame()` + `interpolate()` / `spring()`. Use shadcn/io and motion.dev source as *reference* for the math, not as runtime dependencies.

---

## "AI News" Fast-Cut Style (very short scenes, ~0.3-0.5s each)

What makes the AI-news fast-cut feel work:

1. **Word-level swap with hard cuts** — no fade between scenes, just slam-cut to the next word filling the screen. Each word held for 6-12 frames at 30fps.
2. **Scale-in punch + blur-in combined** — gives "weight" to each word despite the short duration.
3. **Underlined keyword** per 3-5 word phrase (one persistent emphasis layer that survives the cuts).
4. **Smash zooms** between scenes — preceding scene scales up 1.0 → 1.3 in last 4 frames, next scene starts at 0.7 → 1.0.
5. **Submagic / OpusClip** templates encode this — 35+ animated-caption styles with pop/bounce/shake/scale per word, auto-bolded keywords. Aesthetic inspired by Alex Hormozi, MrBeast, ColdFusion. ([Submagic review 2026](https://aitoolscoop.com/tool/submagic/), [OpusClip TikTok caption practices](https://www.opus.pro/blog/tiktok-caption-subtitle-best-practices))
6. **Lower-middle third positioning** — captions sit below the speaker but above TikTok's right-side button stack. White text, black 4-6px outline. ([Blitzcut 2026 caption styles](https://blitzcutai.com/blog/best-caption-style-tiktok))

**Editorial verdict for Armando Inteligencia:** the fast-cut style fits the AI-news content lane (`tech-news-flash`, `big-number-hero`, `quote-card-9x16`) but should be **paced down** for the editorial brand — 0.5-0.7s per word, not 0.3s. Combine with the cream-paper + warm-red palette to avoid the generic "AI clickbait" feel.

---

## 3Blue1Brown / Karpathy / Lex Fridman patterns worth borrowing

- **3Blue1Brown's `Write` and `FadeIn` (manim primitives):** every reveal is followed by `self.wait()` — the *pause after* the reveal is as important as the reveal itself. Translate: each `AnimatedText9x16` instance should have a `holdFrames` prop *after* the reveal completes (default ~30 frames = 1s at 30fps). Don't cut immediately. ([3Blue1Brown manim demo](https://www.3blue1brown.com/lessons/manim-demo/))
- **Lexicap / Karpathy transcript style:** monospace, dense, sentence-stream pattern (#11). Borrow for any "transcript reveal" scene. ([Lexicap](https://karpathy.ai/lexicap/))
- **Lex Fridman lower-thirds:** static, premium-feeling, white-on-translucent-dark, no animation beyond a 200ms fade-in. **Anti-pattern lesson:** when the subject is conversation, ANY caption animation distracts. Reserve our heavy reveals for scene transitions, not for ongoing dialogue.
- **Apple WWDC kinetic typography:** scale + blur + sequenced word-stagger, always with crisp white text on color. Each word held ~1.0-1.5s. The pacing is what sells the "premium" feel — too fast = chaotic, too slow = boring. ([Apple WWDC 2013 kinetic typography breakdown](https://finalcutprotutorials.wordpress.com/2014/12/24/kinetic-typography-apple-wwdc-2013-keynote-speech/))

---

## Build-Priority Ranking (top 5 to add as composable primitives)

Ordered by **(impact on our content lanes) × (implementation cost)**:

| # | Pattern | Why first | Est. build (hrs) |
|---|---|---|---|
| 1 | **TypewriterCaret** | Already implied by AI-tech aesthetic; ChatGPT/Claude scenes are constant in our content. Lowest implementation cost. | 1-2 |
| 2 | **BlurIn** | Universal "premium" reveal; works at every font size and length. Composable with everything else. Trivial to implement. | 1 |
| 3 | **ScaleInPunch** | Hero/headline/big-number scenes need this. Already half-implemented via `spring()`. | 1-2 |
| 4 | **ScrambleDecrypt** | Highest on-brand for AI/tech model-name reveals. Slightly more code (seeded random for SSR determinism). | 3-4 |
| 5 | **HighlightSweep** | Editorial-perfect fit for cream-paper + warm-red brand. Replaces / augments the per-word color highlight in `EditorialCaption`. | 2-3 |

**Defer to a later wave:**
- Letter Rise (#6) — beautiful but heavy at letter-level for long sentences in Spanish; do it when we have a clear use case
- Number Ticker (#10) — `BigNumberHero9x16` already exists; ticker is an enhancement, not new capability
- Sentence Stream (#11) — situationally useful, lower priority than the top 5
- Word Swap (#4) — wait until a hook composition actually needs it
- Blocky Reveal (#3) — solved by ScaleInPunch + BlurIn for 80% of our cases
- Underline Draw (#9) — overlaps heavily with HighlightSweep; pick one

---

## `AnimatedText9x16` Composition Spec

Single composition that accepts a `revealStyle` enum and renders any of the top 5 patterns. Schema sketch (Zod, matching our convention in `src/compositions/schemas.ts`):

```typescript
// src/compositions/AnimatedText9x16.tsx
import { z } from "zod";

export const animatedTextRevealStyleSchema = z.enum([
  "typewriter",      // #1: char-by-char with blinking caret
  "blur-in",         // #7: blur 24px → 0, opacity 0 → 1
  "scale-punch",     // #8: scale 1.4 → 1 with spring overshoot
  "scramble",        // #2: chars cycle through pool, lock per-position
  "highlight-sweep", // #12: rectangle sweeps L→R behind text
]);

export const animatedText9x16Schema = z.object({
  text: z.string(),                                          // the line to reveal
  revealStyle: animatedTextRevealStyleSchema,
  // Pacing
  revealDurationFrames: z.number().int().min(1).default(30), // frames to complete the reveal
  holdFrames: z.number().int().min(0).default(45),           // hold after reveal (3B1B's wait())
  // Layout
  fontSize: z.number().int().min(12).max(240).default(96),
  fontFamily: z.string().default("Inter"),
  fontWeight: z.union([z.number(), z.string()]).default(800),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  maxWidthPx: z.number().int().default(900),
  position: z.enum(["top", "center", "bottom"]).default("center"),
  // Brand
  color: z.string().default("#1A1A1A"),         // ink
  accentColor: z.string().default("#B33A2A"),   // warm red, used by highlight-sweep + caret
  backgroundColor: z.string().default("#FAF7F2"), // cream paper
  // Style-specific overrides (all optional)
  scrambleCharPool: z.string().optional(),      // default includes ñáéíóú¿¡
  blurStartPx: z.number().default(24),
  scaleFrom: z.number().default(1.4),
  caretChar: z.string().default("▌"),
  // Audio sync hook (optional)
  startFrame: z.number().int().default(0),      // when in the parent timeline does this begin
});

export type AnimatedText9x16Props = z.infer<typeof animatedText9x16Schema>;
```

**Internal switch:**

```typescript
export const AnimatedText9x16: React.FC<AnimatedText9x16Props> = (props) => {
  const frame = useCurrentFrame() - props.startFrame;
  if (frame < 0) return null;

  const reveal = (() => {
    switch (props.revealStyle) {
      case "typewriter":      return <Typewriter {...props} frame={frame} />;
      case "blur-in":         return <BlurIn       {...props} frame={frame} />;
      case "scale-punch":     return <ScalePunch   {...props} frame={frame} />;
      case "scramble":        return <Scramble     {...props} frame={frame} />;
      case "highlight-sweep": return <HighlightSweep {...props} frame={frame} />;
    }
  })();

  return (
    <AbsoluteFill style={{
      background: props.backgroundColor,
      justifyContent: props.position === "center" ? "center" : props.position === "top" ? "flex-start" : "flex-end",
      alignItems: "center",
      padding: 80,
    }}>
      <div style={{
        maxWidth: props.maxWidthPx,
        fontSize: props.fontSize,
        fontFamily: props.fontFamily,
        fontWeight: props.fontWeight as never,
        color: props.color,
        textAlign: props.textAlign,
        lineHeight: 1.15,
      }}>
        {reveal}
      </div>
    </AbsoluteFill>
  );
};
```

Each reveal sub-component is ~30-50 lines, lives in `src/components/text-reveals/`, takes `{text, frame, ...styleOverrides}` and returns a React node. This keeps `AnimatedText9x16.tsx` thin (just routing) and makes each primitive independently testable with vitest snapshots.

**Composition root registration** (in `src/Root.tsx`):

```typescript
<Composition
  id="AnimatedText9x16"
  component={AnimatedText9x16}
  schema={animatedText9x16Schema}
  durationInFrames={300}  // overridden at render time via calculateMetadata
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{ text: "Hola mundo", revealStyle: "blur-in" } as AnimatedText9x16Props}
  calculateMetadata={({props}) => ({
    durationInFrames: props.revealDurationFrames + props.holdFrames,
  })}
/>
```

---

## Anti-Patterns (avoid — these look AI-generated or amateur)

1. **Per-letter rainbow color cycling** — RGB-cycle through the spectrum letter-by-letter. Screams 2008 Geocities or template-mill TikTok. The cream-paper editorial brand should NEVER use color cycling.
2. **Multiple reveal styles in one scene** — typewriter intro, then blur-in subtitle, then scale-punch keyword, then scramble closer. Picking one primitive per scene and one accent layer (e.g. blur-in for the line + highlight-sweep on one keyword) reads as "designed". Stacking 4 primitives reads as "tutorial-followed".
3. **Continuous letter wave / sinewave bobbing** — letters bobbing up and down on a sine while text is on screen. AI-news template-mill aesthetic, makes captions hard to read, signals low-effort.
4. **3D rotation reveals (cube flip, perspective tilt)** — looks like After Effects 2014 demo content. Modern motion design has moved away from gratuitous 3D for text. Use sparingly only when the content is specifically about 3D / VR / spatial computing.
5. **Excessive bounce / wobble after settle** — spring config with damping < 6 means text keeps wobbling for 500ms+ after "landing". Reads as cartoony. Keep damping ≥ 8 for text, save the wobble for *icons* and *number tickers*.

---

## Implementation Notes for the Pipeline

- **Determinism:** every reveal must derive output purely from `frame` so SSR rendering matches Studio preview byte-for-byte. The scramble pattern needs a seeded PRNG (`mulberry32(frame * 31 + i)`), never `Math.random()`.
- **Grapheme safety:** always split with `Array.from(text)`, never `text.split('')`. Spanish `ñ`, `á`, `é`, `í`, `ó`, `ú`, `¿`, `¡` are single graphemes — splitting them as code units corrupts the diacritic. (Emoji likewise.)
- **Performance ceiling:** per-letter components at high stagger (e.g. blur per letter on a 60-char sentence) = 60 composite layers. Budget says **prefer per-word over per-letter** for any pattern that uses `filter:`. Per-letter is fine for `transform:` and `opacity:` (cheap), expensive for `filter:` (creates a stacking context per element).
- **Audio sync:** all 5 primitives accept `startFrame` so they can be triggered by word-timing data from `alignScriptToWhisper()` (already in `src/timing/align.ts`). For TTS-paced reveals, pass `revealDurationFrames = wordEndFrame - wordStartFrame`.
- **Spanish caption width:** Spanish text expands 15-30% vs English ([Teck Translations](https://www.teck-translations.com/navigating-the-visual-challenges-of-spanish-english-business-translations/)). Set `maxWidthPx: 900` default, not 700. Reveal-style choice should also factor: typewriter looks worse on long lines than blur-in does.

---

## Sources

- [Remotion text-animations skill rules (remotion-dev/skills)](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md)
- [Remotion typewriter official template](https://github.com/remotion-dev/typewriter)
- [Remotion animating properties](https://www.remotion.dev/docs/animating-properties)
- [Remotion spring() docs](https://www.remotion.dev/docs/spring)
- [Remotion interpolate() docs](https://www.remotion.dev/docs/interpolate)
- [Free Remotion templates collection (reactvideoeditor)](https://github.com/reactvideoeditor/remotion-templates)
- [Motion.dev ScrambleText](https://motion.dev/docs/react-scramble-text)
- [Motion.dev AnimateNumber](https://motion.dev/docs/react-animate-number)
- [Motion.dev stagger tutorial](https://motion.dev/tutorials/js-stagger)
- [use-scramble.dev](https://www.use-scramble.dev/)
- [shadcn/io text components](https://www.shadcn.io/text) — DecryptedText, SlidingNumber, HighlightText, Sliding Number
- [Framer Motion text variants tutorial (Frontend.fyi)](https://www.frontend.fyi/v/staggered-text-animations-with-framer-motion)
- [Framer Motion text animation patterns (ogblocks)](https://ogblocks.dev/blog/framer-motion-text-animation)
- [GSAP SplitText practical guide 2026](https://www.annnimate.com/blog/gsap-text-animation-splittext-guide)
- [GSAP vs Anime.js 2026 comparison (wmtips)](https://www.wmtips.com/technologies/compare/anime.js-vs-gsap/)
- [Codrops stagger reveal animations for text](https://tympanus.net/codrops/2020/06/17/making-stagger-reveal-animations-for-text/)
- [Codrops TypographyMotion](https://github.com/codrops/TypographyMotion)
- [Codrops rotating words with CSS animations](https://tympanus.net/codrops/2012/04/17/rotating-words-with-css-animations/)
- [Fancy Components text-rotate](https://www.fancycomponents.dev/docs/components/text/text-rotate)
- [CSS-Tricks animating with clip-path](https://css-tricks.com/animating-with-clip-path/)
- [CSS-Tricks SVG line animation](https://css-tricks.com/svg-line-animation-works/)
- [web.dev split-text-animations](https://web.dev/articles/building/split-text-animations)
- [Cruip blur-reveal effect with Framer Motion + Tailwind](https://cruip.com/blur-reveal-effect-with-framer-motion-and-tailwind-css/)
- [ishadeed custom underlines with SVG](https://ishadeed.com/article/custom-underline-svg/)
- [MarkerHighlight.js animated text highlighting](https://marker-highlight.solarise.dev/)
- [CodeMyUI marker pen effect on text](https://codemyui.com/marker-pen-effect-on-text-animation/)
- [Envato highlight-text After Effects pack](https://elements.envato.com/highlight-text-6PSUWEX)
- [HubSpot Odometer.js](https://github.hubspot.com/odometer/docs/welcome/)
- [Motionscript bounce and overshoot mathematics](https://www.motionscript.com/articles/bounce-and-overshoot.html)
- [Blitzcut best TikTok caption styles 2026](https://blitzcutai.com/blog/best-caption-style-tiktok)
- [OpusClip TikTok caption best practices 2026](https://www.opus.pro/blog/tiktok-caption-subtitle-best-practices)
- [Submagic review 2026 (AI Tools Coop)](https://aitoolscoop.com/tool/submagic/)
- [3Blue1Brown Manim demo](https://www.3blue1brown.com/lessons/manim-demo/)
- [Karpathy Lexicap (Lex Fridman whisper captions)](https://karpathy.ai/lexicap/)
- [Apple WWDC 2013 kinetic typography breakdown (Final Cut tutorials)](https://finalcutprotutorials.wordpress.com/2014/12/24/kinetic-typography-apple-wwdc-2013-keynote-speech/)
- [Kinetic typography 2026 trends (IK Agency)](https://www.ikagency.com/graphic-design-typography/kinetic-typography/)
- [Motion graphics 2026 trends (criticatv)](https://www.criticatv.com/motion-graphics-trends-how-visual-storytelling-is-evolving-in-2026/)
- [Spanish translation visual challenges (Teck Translations)](https://www.teck-translations.com/navigating-the-visual-challenges-of-spanish-english-business-translations/)
- [Modern typography templates for AI video creators (StoryShort)](https://storyshort.ai/en/blog/modern-typography-templates-for-ai-video-creators)
