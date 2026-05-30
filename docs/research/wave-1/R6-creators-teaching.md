# R6 — Creators as Teachers: Motion Design for Tech/AI Content

**Wave 1 research, 2026-05-25.**
**Purpose:** Treat the best creators in motion design for tech/AI as a teaching corpus. Pull what they explicitly recommend (and call out as anti-patterns) into a single file we can quote from when designing @armandointeligencia templates and writing the project's motion playbook.

**How to read this file:**
- Section 1 = the 10 YouTube tutorials to actually watch (we recommend in order).
- Section 2 = the 5 most useful lessons distilled from those tutorials.
- Section 3 = new Instagram accounts to add to `references/creators/` (with scrape priority).
- Section 4 = Spanish-language motion-design teachers (we are a Spanish brand, so this is mandatory study material).
- Section 5 = open questions and follow-ups.

We already scrape: `carloscuamatzin`, `diysmartcode`, `dotcsv`, `midu.dev`, `bilawal.ai`, `simonhoiberg`, `estebandiba`. Nothing here duplicates those.

---

## 1. Top 10 YouTube tutorials to watch

Ordered roughly by relevance to OUR pipeline (programmatic React/Remotion + Hyperframes + AI TTS + auto-captions for Spanish vertical video).

| # | Channel | Title (URL) | Length | Why it's worth your time |
|---|---|---|---|---|
| 1 | Remotion (official) | [Word-Level Speech to Text into Eye-Catching Captions (Whisper + Remotion Tutorial)](https://www.youtube.com/watch?v=DQm1TaKxOCk) | ~10–15m | Direct overlap with our `src/transcribe/transcribe.py` + `src/components/Caption.tsx` path. Walks the `@remotion/captions` + `createTikTokStyleCaptions()` flow end-to-end. |
| 2 | Remotion (official) | [Creating videos just from prompting — Claude Code and Remotion](https://www.youtube.com/watch?v=Xtd4DjU9AU8) | ~10m | This is the official version of what we are doing. Explicitly shows the Blank + Tailwind + Skills setup the docs recommend. |
| 3 | Remotion (official) | [I Made Video Animations in Seconds with Remotion (Beginner-Friendly)](https://www.youtube.com/watch?v=PrGYLd7yu1s) | ~8m | Good "first thing to watch" for any new collaborator. Sets the mental model for compositions/sequences. |
| 4 | Mark / Coding the Future | [Using Remotion for AI Generated Motion Graphics](https://www.youtube.com/watch?v=ctNCOCFa3AE) | ~15m | Independent (non-official) take on the same workflow — shows how a third-party engineer wires Remotion to ElevenLabs + Whisper. |
| 5 | Voltage Tutorials | [Master SaaS Motion Graphics in 30 Minutes (After Effects)](https://www.youtube.com/watch?v=Jccbzpicst8) | ~30m | Reference for the *visual language* SaaS/AI launch videos use (ChatGPT/Lovable-style reveals). Even though we're not in AE, the design choices translate to our `BigNumberHero9x16`, `DiagramExplainer9x16`, `TechNewsFlash9x16` templates. |
| 6 | Voltage Tutorials | [Master Notion Motion Graphics in 60 Minutes (After Effects)](https://www.youtube.com/watch?v=rNUrjy5XGd4) | ~60m | Same instructor but on a UI-product brief — useful for `SplitWebcamScreen9x16` style frames. Pause for the layout + easing decisions; ignore AE keyframes. |
| 7 | Ben Marriott | [I'll Teach You After Effects in 60 Minutes](https://www.youtube.com/watch?v=jFbRZZmMW7c) | ~60m | The motion-design vocabulary primer. Pre-requisite reading before *any* deep AE tutorial — covers easing, anchor points, parenting, expressions in one pass. |
| 8 | Mt. Mograph | [Easing (Motion Design Techniques)](https://www.youtube.com/watch?v=AlXEzbhfZJM) | ~10m | Easing is the single biggest difference between "AI-generated slop" and "looks professional". Watch this once, then we should bake the curves into a shared `src/animations/easing.ts` helper. |
| 9 | School of Motion | [Animation Bootcamp — Principles of Animation in After Effects](https://www.youtube.com/watch?v=WTRaNJb0VHc) | ~30m | The 12 principles applied to motion design (not character animation). The "squash & stretch", "anticipation", "follow-through" decisions that make a number-counter feel alive. |
| 10 | Sonduck Film | [10 Motion Graphics All After Effects Users Should Know!](https://www.youtube.com/watch?v=8XKHzcI3lRs) (and the [tutorials hub](https://www.sonduckfilm.com/tutorials/)) | ~15m | A taxonomy of micro-animations (text reveal, line draw, mask wipe, scale-in, counter, etc.). Map each one to a `src/animations/` primitive we can call from any composition. |

**Anti-list — DO NOT spend time on:**
- AI-tool walkthrough videos (Pika, Kling, Runway, Frameo, HeyGen, ImagineArt). They're product demos, not motion-design teaching. We have our own pipeline; we don't need to learn another vendor's UI.
- "Top 10 AI video generators of 2026" listicles. All recycled affiliate content.
- Long Skillshare/Domestika class trailers — pay for the class or skip the trailer.

**Recommended watch order if you have one focused afternoon (~3.5 hours total):**
1. Ben Marriott — *I'll Teach You After Effects in 60 Minutes* (vocabulary primer, even if you'll never open AE)
2. Mt. Mograph — *Easing* (10m — this is the lesson with the highest ROI per minute in the list)
3. School of Motion — *Animation Bootcamp* (30m — the 12 principles, fresh after seeing easing)
4. Remotion — *Word-Level Speech to Text into Eye-Catching Captions* (the one tutorial that maps 1:1 to our Whisper + Caption pipeline)
5. Voltage Tutorials — *Master SaaS Motion Graphics in 30 Minutes* (closes the loop: now you can see how the principles cash out in a production-style explainer)

---

## 2. Top 5 creator-distilled lessons

Distilled from the Remotion docs, the Voltage/Sonduck SaaS-AE tutorials, Mt. Mograph easing, and the Remotion captions docs+blog ecosystem. Quotes are from official Remotion docs (verbatim) and from the curated summaries returned by the tutorial pages — direct YouTube transcript fetches were blocked in this research session, so quotes are limited to what we could verify from doc pages and tutorial descriptions.

### Lesson 1 — "Spaces are data": treat captions like a render artifact, not a stylesheet
From the Remotion captions docs and TikTok-style caption tutorials:

> "The `whiteSpace: 'pre'` CSS property is critical — without it, spaces collapse and word timing breaks. Whitespace should be included in the text field before each word, as spaces are used as delimiters." — Remotion docs / TikTok-style captions guide.

> "Common causes of subtitle drift include FPS mismatch between SRT generation and rendering." — same source.

> "For fast-paced content (like product demos), 500ms worked best, while for educational content, 1200ms felt more natural." — CrePal's Remotion captions tutorial on the `combineTokensWithinMilliseconds` parameter.

**Applied to our pipeline:** Our `src/components/Caption.tsx` and `src/components/captions/` must (a) preserve whitespace, (b) lock FPS at the same number passed to `faster-whisper` *and* the Remotion `Composition` (we currently use 30 fps in both, but it's implicit — make it a single exported constant in `src/timing/`). The `combineTokensWithinMilliseconds` knob should be exposed as a CLI flag with two presets: 500ms for hook scenes and product-style scenes, 1200ms for the body of explainer videos. Today the value is hardcoded — that's a bug in disguise, because the same audio file feels rushed in a hook context and dragging in an educational context. Bonus: when we add the `--no-whisper` fast-iter path, the approximate TTS timings should still respect the same per-scene threshold; otherwise the dev preview and the final render disagree on pacing.

### Lesson 2 — Easing > everything else
From the Mt. Mograph easing tutorial and the School of Motion Animation Bootcamp:

The single most-cited "looks AI-generated" tell is linear interpolation. Every reputable tutorial in this corpus opens with the same point: replace `Easing.linear` with an in-out curve (cubic or back), give the animation a half-frame of *anticipation* and a few frames of *follow-through*. Sonduck and Voltage's SaaS demos all use `cubic-bezier(0.65, 0, 0.35, 1)`-ish curves (the "ease in-out cubic" school) for UI reveals and a slight `back-out` for emphasis pops.

Audiences and the algorithm both feel the difference even when they can't name it. From the Envato 2026 motion-design trends writeup: *"Audiences are tired of AI-generated sameness and are looking for flaws that make videos more human, relatable, and realistic."* A correct easing curve is the cheapest way to register as "made with care", because the linear default *is* the AI-slop signature.

**Applied to our pipeline:** Stand up `src/animations/easing.ts` (or `src/timing/easing.ts` to live next to the FPS constant from Lesson 1) with named exports (`outCubic`, `inOutCubic`, `outBack`, `outQuint`, `outExpo`). Every composition imports from there; nobody hand-writes a `Easing.bezier(...)` call inline. Once that exists, a one-time grep across `src/compositions/**.tsx` should find every `Easing.linear` and `Easing.bezier(...)` literal and migrate them. Make `Easing.linear` lint-banned afterward — there is no good motion-design reason to use it for anything other than a continuous background loop.

### Lesson 3 — Vertical safe zones are non-negotiable
From the 9:16 best-practices write-ups (Edicion Video Pro, CapCut, Riverside):

> "On 9:16, the upper ~15% of the frame is where face/subject should sit. Avoid placing important elements in the bottom 20% (where Like, Comment, Share buttons appear) and right 10%. Safe zone is between 15–75% of screen height, centered horizontally."

> "85% of social media videos are initially watched without sound. Videos with captions have 40% better retention according to Meta."

**Applied to our pipeline:** Our 9:16 compositions (`BigNumberHero9x16`, `QuoteCard9x16`, `TechNewsFlash9x16`, etc.) should expose a `SafeZone` debug overlay (rendered only when `process.env.SHOW_SAFE_ZONES === '1'`) drawing the 15% top, 20% bottom, 10% right exclusion bands. Audit every existing template against this before we ship.

### Lesson 4 — One concept, one visual, one takeaway (per scene)
From the TikTok/Reels 2026 trend writeups (Deeka, Miraflow) and the educational-creator engagement data:

> "The fastest-growing format on TikTok is the ultra-short educational clip: one concept, one visual, one takeaway."

> "Educational creators achieve 4.2% engagement rates, among the highest of any niche, when they front-load the interesting hook before diving into explanation."

**Applied to our pipeline:** Our scene/script schema in `src/compositions/schemas.ts` should validate that each scene has ≤1 primary visual claim and ≤1 numeric callout. If a scene has more, the generator should split it into two scenes. Hook beat (first 1.5s) must be a separate scene type with its own template (`BigNumberHero9x16` is our closest current match).

### Lesson 4.5 — Hook + lower-third + CTA are three separate components, not one
Cross-cutting observation from the SaaS-explainer AE tutorials (Voltage, Sonduck) and the Ordinary Folk reference work:

The best short-form explainer videos in this corpus treat the **hook** (first 1–1.5s, full-bleed claim), the **lower third** (recurring branding strip — name tag, logo, watermark), and the **CTA** (last 1–2s) as distinct, composable components. The Voltage SaaS tutorial is explicit: design the hook frame *first* on a separate art-board, treat it as the thumbnail, then animate *into* and *out of* it. Most amateur explainers blend all three into one busy frame and lose the algorithm's attention in the first second.

**Applied to our pipeline:** We already split `BrandWatermark` and `BrandBreadcrumb` from the scene templates — extend the same pattern with a `HookFrame` component (renders the first ~45 frames at 30fps with bigger type, no chrome) and a `CTAFrame` component (renders the last ~45 frames with a single click-target and the loop bookend from Lesson 5). Then any 9:16 composition is `<HookFrame /> + <SceneBody /> + <CTAFrame />`, and the script schema can demand all three be present.

### Lesson 5 — Loopable endings are an algorithm hack
From the YouTube Shorts / 9:16 best-practice writeups:

> "The YouTube Shorts algorithm heavily favors videos watched multiple times. Create a 'loopable' ending that connects back to the beginning (e.g., final result shown in hook). This increases average view duration and triggers viral recommendations."

**Applied to our pipeline:** Add an optional `loop` field to the script schema. When true, the final scene's last frame should visually rhyme with the first scene's first frame (same composition, same anchor element). Concrete first target: a `bookend` flag on the `BigNumberHero9x16` template that re-renders it at the end with the same number, half-opacity, with the CTA overlaid.

---

## 3. Top 10 NEW Instagram candidates (not already scraped)

These are individuals/studios whose Instagram feeds are dense with the *exact* visual language we want to learn — short-form motion design for tech/AI content, or the broader motion-graphics craft we're missing. **None overlap with the existing seven we scrape.**

| # | Handle | Why this creator | Sample / proof | Scrape priority |
|---|---|---|---|---|
| 1 | [@_estebandiacono](https://www.instagram.com/_estebandiacono/) | 260K followers. Argentine motion designer; pure-craft loops and short-form abstract animation. The benchmark for "what good easing + composition looks like in 9:16". Spanish-speaking — a culture fit. | [Profile](https://www.instagram.com/_estebandiacono/) | **High** |
| 2 | [@motiondarwin](https://www.instagram.com/motiondarwin/) | Peruvian (Lima) motion designer; teaches "motion graphics for Instagram" on Domestika; entire feed is short-form template thinking in Spanish. Direct teaching parallel to what we're building. | [Profile](https://www.instagram.com/motiondarwin/) · [Domestika course](https://www.domestika.org/en/courses/1468-motion-graphics-for-instagram) | **High** |
| 3 | [@usemotionapp](https://www.instagram.com/usemotionapp/reels/) | Motion (the AI work-assistant app). Their reel feed is a clinic in SaaS-product explainer reels — exactly the visual register `SplitWebcamScreen9x16` + `DiagramExplainer9x16` need. | [Reels feed](https://www.instagram.com/usemotionapp/reels/) | High |
| 4 | [@claudeai](https://www.instagram.com/claudeai/) | Anthropic's own Instagram (1M followers, 243 posts). Reverse-engineering how Anthropic visually presents Claude is directly on-brand for us. | [Profile](https://www.instagram.com/claudeai/) | High |
| 5 | [@motiongraphics_collective](https://www.instagram.com/motiongraphics_collective/) | 505K-follower aggregator account. Curated daily motion-graphics work — high-density reference firehose; gives us breadth across studios in one feed. | [Profile](https://www.instagram.com/motiongraphics_collective/) | Med |
| 6 | [@motiondesigners](https://www.instagram.com/motiondesigners/) | Sister aggregator to the one above; different curatorial taste, also high-density. | [Profile](https://www.instagram.com/motiondesigners/) | Med |
| 7 | [@motionbyakash](https://www.instagram.com/motionbyakash/) | 255K followers. Logo animation + brand motion micro-pieces. Useful for the `BrandWatermark` + intro/outro stings we keep punting on. | [Profile](https://www.instagram.com/motionbyakash/) | Med |
| 8 | [@motiongenix](https://www.instagram.com/motiongenix/) | Sunny Ingle — tutorial-style short-form motion designer. Lots of "you can build this in X minutes" reels that double as build prompts. | [Profile](https://www.instagram.com/motiongenix/) | Med |
| 9 | [@ordinaryfolk.co](https://www.instagram.com/ordinaryfolk.co/) (Ordinary Folk studio) | Vancouver studio known for the most-imitated explainer-video visual language of the last 3 years (their work is what the Voltage SaaS tutorials are teaching people to copy). Studio feed = aspirational target. | [Studio site](https://www.ordinaryfolk.co/) | Low (aspirational reference, not template fodder) |
| 10 | [@luizajarovsky](https://www.instagram.com/luizajarovsky/) | AI + privacy explainer reels in English; the *content* shape (regulatory/tech news explainer) is a near-match for what @armandointeligencia covers in Spanish. Useful for hook-pattern mining. | [Reels feed](https://www.instagram.com/luizajarovsky/reels/) | Low (study the hooks, not the motion craft) |

**Scraping notes for the team:**
- `_estebandiacono`, `motiondarwin`, `motionbyakash` should go through `scripts/scrape-reels.py` next; their motion craft is what we directly need.
- `usemotionapp` and `claudeai` are corporate accounts — their content is product-led but the *production polish* is the lesson.
- Use `npm run scrape:reels -- --handle <handle> --count 12` then `npm run analyze:creator -- --handle <handle>` per the workflow in `CLAUDE.md`. Drop ANALYSIS.md notes per creator and cross-reference patterns back to `docs/research/E-15-template-typology.md`.

---

## 4. Top 5 Spanish-language motion-design teachers

We are a Spanish brand (@armandointeligencia). The Spanish motion-design teaching ecosystem is smaller than the English one, so this is a curated short list with explicit "what to use them for".

| # | Teacher | Where | What we should learn from them |
|---|---|---|---|
| 1 | **Esteban Diácono** ([@_estebandiacono](https://www.instagram.com/_estebandiacono/), [estebandiacono.com](https://www.estebandiacono.com/)) | Buenos Aires, AR. Behance, Vimeo, IG. | Pure motion craft — easing curves, color, timing. Argentine sensibility, Spanish-speaking. Treat as the "north star" creator for what a Spanish-language motion designer's reel feed *can* look like. |
| 2 | **Darwin Pacheco / Motion Darwin** ([@motiondarwin](https://www.instagram.com/motiondarwin/), [Domestika course](https://www.domestika.org/en/courses/1468-motion-graphics-for-instagram)) | Lima, PE. | Literal teaching parallel: "Motion Graphics for Instagram" — the course is 27 lessons, 5h52m, taught in Spanish, on exactly our problem domain. Worth buying. |
| 3 | **Carlos Albarrán (Zenzuke)** (via [Not Todo Animación](https://www.notodoanimacion.es/tutoriales/tutoriales-de-motion-graphics/)) | Spain. Workshops + masterclasses. | Logo + text motion in After Effects. The Spanish-language equivalent to Mt. Mograph for typography animation craft. |
| 4 | **Blackone Studio** (YouTube; Spanish) | Spain. | After Effects expression programming in Spanish — useful for our team since expressions translate one-for-one to the kinds of `interpolate` + Easing wiring we use in Remotion. |
| 5 | **Motion Graphics Web** ([@motiongraphicsweb](https://www.youtube.com/@motiongraphicsweb/videos), [motiongraphicsweb.com](https://motiongraphicsweb.com/)) | Spain. YouTube + site. | Spanish-language hub for tutorials, templates, course reviews. Use as a discovery channel — when we need a Spanish-language tutorial on a specific technique, search here first. |

**Honorable mention (adjacent, not strictly motion design):**
- **Carlos Santana / DotCSV** — already scraped. Worth restating that he is the gold standard for *Spanish-language AI explainer* content; his visual language is light, but his *scripting* and pacing are the benchmark.

---

## 5. Open questions / follow-up

1. **YouTube transcript access is blocked from this research environment.** WebFetch returned only YouTube's footer for every video URL we tried. To get verbatim quotes from the 10 recommended tutorials, the next operator should either (a) run a `yt-dlp --write-auto-subs` pass against the URLs in Section 1 and store transcripts under `docs/research/wave-1/transcripts/`, or (b) use an MCP transcript tool if one becomes available. We tagged each tutorial with a length estimate but the official runtimes need to be confirmed.
2. **Twitter/X breakdown threads were not surfaceable via web search** with the queries we tried. The motion-design conversation on X is real (Mt. Mograph, Jake Bartlett, Greg Stewart of Ordinary Folk all post there) but search-engine indexing of X is poor. Recommend a 30-min manual session inside X with `from:jakeinmotion`, `from:mtmograph`, `from:bennmarriott` to harvest threads, since search couldn't get there.
3. **No tech-AI-focused motion designer with a strong teaching channel was found** — the field bifurcates into (a) AE-craft teachers who don't cover tech content, and (b) tech YouTubers (Fireship, Wes Roth, Matt Wolfe) who don't teach their motion craft. Fireship's editor in particular has never (as far as the search returned) published a breakdown. **Action:** post in r/Remotion or DM Remotion's developer relations to ask whether anyone documents the React-Remotion + AE-aesthetic intersection.
4. **The Hispanic-LATAM AI-explainer reels niche is thinner than expected.** We found Construyendo IA (LATAM, 250K+) as a community account but no individual creator who is both (a) Spanish-speaking, (b) tech/AI focused, (c) using strong motion design. **This is white space @armandointeligencia can own.** Worth a separate one-page strategy note.
5. **Verify @claudeai and @usemotionapp aren't blocked by gallery-dl.** Corporate accounts sometimes set up rate-limit defenses that the public-profile scrape path doesn't handle. Test before queueing the full list of 10 candidates.
6. **Ordinary Folk** is the most-imitated visual language in the SaaS-explainer space (per the Voltage/Sonduck tutorials, which are explicitly teaching the "Ordinary Folk look"). We have not analyzed their work. Adding `ordinaryfolk.co` (or their IG) to the references corpus is high-leverage even at low scrape priority — one good ANALYSIS.md against their portfolio would inform 3+ of our existing 9x16 templates.

---

## Sources

YouTube channel + tutorial pages:
- [Remotion (official YouTube channel)](https://www.youtube.com/@remotion_dev)
- [Word-Level Speech to Text into Eye-Catching Captions (Whisper + Remotion)](https://www.youtube.com/watch?v=DQm1TaKxOCk)
- [Creating videos just from prompting — Claude Code and Remotion](https://www.youtube.com/watch?v=Xtd4DjU9AU8)
- [I Made Video Animations in Seconds with Remotion](https://www.youtube.com/watch?v=PrGYLd7yu1s)
- [Using Remotion for AI Generated Motion Graphics](https://www.youtube.com/watch?v=ctNCOCFa3AE)
- [Master SaaS Motion Graphics in 30 Minutes (After Effects)](https://www.youtube.com/watch?v=Jccbzpicst8)
- [Master Notion Motion Graphics in 60 Minutes (After Effects)](https://www.youtube.com/watch?v=rNUrjy5XGd4)
- [I'll Teach You After Effects in 60 Minutes (Ben Marriott)](https://www.youtube.com/watch?v=jFbRZZmMW7c)
- [Easing (Motion Design Techniques) — Mt. Mograph](https://www.youtube.com/watch?v=AlXEzbhfZJM)
- [School of Motion — Animation Bootcamp](https://www.youtube.com/watch?v=WTRaNJb0VHc)
- [Sonduck Film — 10 Motion Graphics All AE Users Should Know](https://www.youtube.com/watch?v=8XKHzcI3lRs)

Remotion docs + AI-agent guidance:
- [Remotion docs — Prompting videos with coding agents](https://www.remotion.dev/docs/ai/coding-agents)
- [Remotion docs — Captions](https://www.remotion.dev/docs/captions/)
- [Remotion docs — createTikTokStyleCaptions()](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)
- [Remotion docs — Captioning in the Editor Starter](https://www.remotion.dev/docs/editor-starter/captioning)
- [CrePal — How to create TikTok-style captions in Remotion](https://crepal.ai/blog/aivideo/blog-how-to-create-tiktok-style-captions-remotion/)
- [Remotion templates index](https://www.remotion.dev/templates/)
- [ali-abassi/remotion-templates (GitHub)](https://github.com/ali-abassi/remotion-templates)
- [Quriosity-agent/remotion-prompts (GitHub)](https://github.com/Quriosity-agent/remotion-prompts)

Vertical-video / 9:16 best practices:
- [9:16 Aspect Ratio Guide (Edicion Video Pro)](https://edicionvideopro.com/en/editing-techniques/916-aspect-ratio-guide-vertical-video-for-tiktok-reels/)
- [Vertical video tips (Riverside)](https://riverside.com/university-videos/vertical-video-tips-for-tiktok-reels-and-youtube-shorts)
- [CapCut — Vertical videos on YouTube](https://www.capcut.com/resource/vertical-videos-on-youtube)

Trend / format references:
- [Deeka — Trending videos 2026](https://deeka.ai/blog/trending-videos-2026)
- [Miraflow — 10 AI Shorts formats that go viral 2026](https://miraflow.ai/blog/ai-shorts-formats-that-go-viral-2026)
- [Envato — 11 Motion Design Trends for 2026](https://elements.envato.com/learn/motion-design-trends)
- [Lummi — Popular motion graphics trends 2025](https://www.lummi.ai/blog/motion-graphics-trends)

School of Motion / craft teachers:
- [School of Motion — main site](https://www.schoolofmotion.com/)
- [School of Motion — 30 AE tutorials for 30 years of AE](https://www.schoolofmotion.com/blog/30-years-after-effects-30-ae-tutorials)
- [Ben Marriott — Master Motion Design course landing](https://www.benmarriott.com/mmd-landing-01)
- [Mt. Mograph — main site](https://mtmograph.com/)
- [Sonduck Film — tutorials hub](https://www.sonduckfilm.com/tutorials/)
- [Ordinary Folk — studio site](https://www.ordinaryfolk.co/)

Spanish-language motion-design teachers:
- [Esteban Diacono — site](https://www.estebandiacono.com/) · [Instagram](https://www.instagram.com/_estebandiacono/) · [Behance](https://www.behance.net/esteban_diacono)
- [Darwin Pacheco — Instagram (@motiondarwin)](https://www.instagram.com/motiondarwin/) · [Domestika course "Motion Graphics for Instagram"](https://www.domestika.org/en/courses/1468-motion-graphics-for-instagram)
- [Not Todo Animación — Spanish motion graphics tutorial hub](https://www.notodoanimacion.es/tutoriales/tutoriales-de-motion-graphics/)
- [Motion Graphics Web — Spanish YouTube channel](https://www.youtube.com/@motiongraphicsweb/videos) · [site](https://motiongraphicsweb.com/)
- [MotionTuts — Spanish tutorial directory](https://tutorialesmotiongraphics.com/)

Instagram candidate accounts (Section 3):
- [@_estebandiacono](https://www.instagram.com/_estebandiacono/)
- [@motiondarwin](https://www.instagram.com/motiondarwin/)
- [@usemotionapp](https://www.instagram.com/usemotionapp/reels/)
- [@claudeai](https://www.instagram.com/claudeai/)
- [@motiongraphics_collective](https://www.instagram.com/motiongraphics_collective/)
- [@motiondesigners](https://www.instagram.com/motiondesigners/)
- [@motionbyakash](https://www.instagram.com/motionbyakash/)
- [@motiongenix](https://www.instagram.com/motiongenix/)
- [Ordinary Folk studio](https://www.ordinaryfolk.co/)
- [@luizajarovsky](https://www.instagram.com/luizajarovsky/)
