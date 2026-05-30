# Motion Design Typology — @armandointeligencia

> Research Stream A · 2026-05-18 · Opus deep research.
> Audience: Spanish-speaking founders 25–35. Aesthetic: editorial (Bloomberg Businessweek + Reuters + Pentagram), cream paper `#FAF7F2` + ink `#1A1A1A` + warm red `#B33A2A`, Inter + Georgia italic. Format: 1080×1920 @ 30 fps, 30–60 s. Engine: Remotion 4 / HyperFrames 0.6 driven by Edge-TTS word timestamps + faster-whisper.

The point of variety is not novelty — it is *editorial rhythm*. Bloomberg Businessweek under Richard Turley layered "irony, sarcasm and visual spin overlaid on a calm, modernist set of grids and type styles — a blend of restraint and mania." That is the target: 80 % restraint, 20 % deliberate disruption.

---

## 1. ENTRANCE animations

Twelve patterns. Each has a job. Mix at most **3 different entrances per video**, otherwise the language breaks down.

### 1.1 Scale-in (soft pop)
- **Job:** Quiet emphasis. Default entrance for body/secondary text.
- **Curve:** `spring({ damping: 18, stiffness: 140, mass: 0.6 })` — slight overshoot, no bounce. In GSAP/HF: `power2.out`.
- **Duration:** 280–350 ms (~9–11 frames at 30 fps).
- **Reference:** Bloomberg Originals lower-thirds. Body copy in Apple keynote slides.
- **Avoid:** Big overshoot — that reads MrBeast, not editorial.

### 1.2 Slide-in × 4 directions (cardinal entrance)
- **Job:** Establishes spatial hierarchy. Slide-up = "new fact arriving." Slide-down = "context from above (date, source, location)." Slide-left = "next item in a sequence." Slide-right = "previous/return."
- **Curve:** `power3.out` / cubic-bezier `(0.22, 1, 0.36, 1)` ("ease-out-quart"). Travel: 24–48 px (never the full screen — small distance = expensive look).
- **Duration:** 400–500 ms.
- **Reference:** Vox explainer lower-thirds; Reuters Graphics annotations; Wendover Productions chart labels. Bloomberg Businessweek "fact card" pattern.

### 1.3 Mask reveal (clip-path wipe)
- **Job:** The single most "editorial" entrance. Headlines, pull quotes, big numbers. Word stays still — its container reveals.
- **Mechanic:** `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` left-to-right, OR vertical `inset(100% 0 0 0)` → `0` for a "rising from baseline" feel. GSAP SplitText 3.13+ with `mask: "lines"`.
- **Curve:** `expo.out` / cubic `(0.16, 1, 0.3, 1)`.
- **Duration:** 600–800 ms (line), 400 ms (word).
- **Reference:** Pentagram editorial covers; Cartier/Bottega web reveals; The Pudding long-reads; GSAP Vault "split-text-reveal."
- **Why it fits this brand:** No transform on the letterforms themselves → typography stays "printed," motion lives in negative space.

### 1.4 Typewriter
- **Job:** Conveys *receipt* — leaked memo, breaking news, AI prompt, code snippet. Use it when the *act of being typed* is the message.
- **Mechanic:** Reveal one character every 30–60 ms; blinking caret (450 ms square wave).
- **Duration:** Variable — bound to character count, capped at 1.5 s; if longer, switch to mask reveal.
- **Reference:** Johnny Harris (Vox Borders) when displaying texts/emails; Reuters Tech briefings; CIA-leak coverage in Vice.
- **Caveat:** Don't typewriter a headline if the voiceover is already reading it — viewer reads faster than the typist.

### 1.5 Blur-to-clear (focus pull)
- **Job:** Conceptual focus — moves attention from background to text, mimics a camera rack-focus.
- **Mechanic:** `filter: blur(12px)` → `blur(0)` with synchronous `opacity 0 → 1`. Small `translateY(8px) → 0`.
- **Curve:** `power2.out`.
- **Duration:** 500–650 ms.
- **Reference:** Aceternity UI "blur-fade-in"; Apple product pages; Daily Brain title cards.
- **Anti-pattern:** Do not chain with scale — pick blur OR scale, not both.

### 1.6 Fade-and-rise
- **Job:** Workhorse for stacked-list items, bullet beats, captions during exposition. The least loud entrance.
- **Mechanic:** `opacity 0 → 1` + `translateY(16px → 0)`.
- **Curve:** `power2.out` / `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard).
- **Duration:** 300 ms with **80 ms stagger** between siblings (`stagger: 0.08, from: "start"`).
- **Reference:** Notion onboarding; Linear changelog; Vox short-form bullet reveals.

### 1.7 Color flash (frame-flash)
- **Job:** Punctuation. One frame of warm-red `#B33A2A` over white text, then back to ink. Marks a hard beat in the voice.
- **Mechanic:** Single frame at 33 ms (1 frame @ 30 fps) of inverted color OR red overlay at 0.9 opacity, then snap back.
- **Duration:** 33–66 ms total.
- **Reference:** A24 trailer titling; Vox "Borders" act-break titles; Russian propaganda-collage pieces by Studio Nejc Prah for Businessweek.
- **Use sparingly:** ≤ 2 per 30 s.

### 1.8 Marker-highlight sweep
- **Job:** Editorial emphasis on a noun/verb inside a sentence — the visual equivalent of underlining with a highlighter while reading.
- **Mechanic:** Behind-text `<span>` with `background: linear-gradient(120deg, #B33A2A 0%, #B33A2A 100%)`, `background-size: 0% 100%` → `100% 100%` with `transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1)` ("ease-in-out-cubic"). Slight rotation `-1.2°` and irregular height (e.g., 0.6× line-height, offset down) so it reads hand-drawn, not generated.
- **Duration:** 350–500 ms, ideally **driven by whisper word timestamp** (see §7.1).
- **Reference:** MarkerHighlight.js; Stripe docs hover; magic-ui `Highlighter`; Vox infographic annotations.

### 1.9 Split-text staggered word reveal
- **Job:** Hero opener (first 2 seconds). One sentence breaks into words; each word slides up from `translateY(110%)` inside a `mask: lines` wrapper.
- **Mechanic:** GSAP SplitText `mask: "words"` + `stagger: { each: 0.04, from: "start" }`, `ease: "expo.out"`, `y: "110%" → 0`.
- **Duration:** Full sentence completes in **<800 ms**; individual word transform 420 ms.
- **Reference:** Bottega Veneta site; Nike "You Can't Stop Sport"; Codrops "Stagger Reveal" patterns; Wendover Productions chapter titles.

### 1.10 Magnetic kerning (tracking-in)
- **Job:** Logo/section header. Letters start spaced wide, snap to natural kerning. Reads "settling into focus."
- **Mechanic:** `letter-spacing: 0.6em → 0em`, paired `opacity 0 → 1`.
- **Curve:** `power4.out`.
- **Duration:** 700–900 ms. Used once at intro and once at outro/CTA.
- **Reference:** Christopher Doyle title cards for Wong Kar-wai; modern fashion editorial covers; Future Now segment intros.

### 1.11 Iris/Spotlight reveal
- **Job:** Reveals a single icon, portrait, or stat inside an expanding circle. Theatrical.
- **Mechanic:** `clip-path: circle(0% at 50% 50%)` → `circle(75% at 50% 50%)`.
- **Curve:** `power3.inOut`.
- **Duration:** 600 ms.
- **Reference:** Silent-era films; Wes Anderson trailers; The Pudding "Vampires of Lemberg" intro. Use ≤ 1 per video.

### 1.12 Counter roll (digit ticker)
- **Job:** Numeric reveal — "$120 B," "47 %," "11×." The number *earns* its appearance by counting up.
- **Mechanic:** `interpolate(frame, [0, 30], [0, target], { easing: Easing.out(Easing.cubic) })` with `Math.round`. Pair with subtle scale-in 0.92 → 1.0 on settle.
- **Duration:** 800–1100 ms.
- **Reference:** Bloomberg Originals stat cards; The Economist data shorts; Wendover "How much does X cost" beats.

---

## 2. SCENE TRANSITIONS

Rule from professional motion design and HyperFrames docs: **~95 % of cuts are hard cuts.** Effect transitions are reserved for 2–3 moments per video — hooks, act breaks, payoffs.

### 2.1 Hard cut
- **When:** Default. Between every beat. Especially: stat → stat, fact → fact, line of voiceover → next line.
- **Why:** Pacing. Effect on every cut destroys momentum and signals "template video."

### 2.2 Fade-through-cream (color punch)
- **When:** Act break — moving from "problem" to "solution" frame, or hook → exposition.
- **Mechanic:** 200 ms fade to `#FAF7F2` (or warm red `#B33A2A` for high-stakes pivots) → 200 ms reveal of new scene.
- **Reference:** Vox documentary chapter breaks; Bloomberg Originals "after-the-break."

### 2.3 Swipe wipe (directional)
- **When:** Sequential — slide 2 of 5, next item in a list. Direction encodes meaning: right-to-left = forward in time, left-to-right = back.
- **Mechanic:** Old scene exits `translateX(-100%)`, new enters `translateX(100%) → 0`. `power3.inOut`, 500 ms total.
- **Reference:** Apple Keynote "slide" transition; Wendover map sequences.

### 2.4 Shape morph
- **When:** Conceptual equivalence — "this AI tool" → "looks like" → "that AI tool." Logo → product. Rare; once per video max.
- **Mechanic:** SVG path morph via Flubber/`pathDataToPolys`; or use a circle/rect intermediary that scales between frames.
- **Reference:** Apple keynote icons; School of Motion morph tutorial.

### 2.5 Zoom punch (push-in transition)
- **When:** Drama spike — revealing the headline, the dollar amount, the punchline.
- **Mechanic:** Scale 1.0 → 1.15 over 200 ms on outgoing scene, hard cut, incoming scene starts at 1.05 → 1.0. Optional 4 px directional motion blur frame.
- **Curve:** `power4.in` on outgoing.
- **Reference:** A24 trailers; Wendover when a number is "huge"; Mr Beast (short-form) reveal beats.
- **Caveat:** Cinematic motion feels like breathing — slow and controlled. If you *notice* the zoom while watching, it's too fast.

### 2.6 Parallax push (layered slide)
- **When:** Establishing scene, especially when introducing a "where" (city, dataset, product).
- **Mechanic:** Background layer slides 40 px, mid layer 80 px, foreground 120 px — same direction, same duration (800 ms, `power2.inOut`).
- **Reference:** Pudding longreads; Vox Borders title sequences; Wendover map intros.

### 2.7 Paper turn (page flip)
- **When:** "Chapter break" in a listicle or multi-part explainer. Reinforces editorial/print metaphor — perfect for our brand.
- **Mechanic:** 3D `rotateY(0deg → -180deg)` on a card with back-face hiding; subtle drop shadow during mid-rotation.
- **Duration:** 600 ms, `power2.inOut`.
- **Reference:** The New York Times Magazine app; Pentagram editorial digital editions; Apple Books page flip.

### 2.8 Iris in/out
- **When:** Bookend transitions only — open the video, close the video. Theatrical, references silent cinema and old TV news.
- **Mechanic:** Same as §1.11 but applied to the whole frame.
- **Duration:** 700 ms.
- **Reference:** Wes Anderson; classic Looney Tunes outro; modern usage in Bloomberg Quicktake.

---

## 3. CAPTION / KINETIC TYPOGRAPHY

Edge-TTS gives word timestamps for free. Whisper refines them. Every caption pattern below should be **driven from these timestamps** (see §7), never from hardcoded frames.

### 3.1 Word-by-word highlight
- **Pattern:** Full caption line is visible the whole page; *current* word gets warm-red `#B33A2A` + scale 1.06; spoken words fade to 70 % opacity.
- **When:** Default for talking-head explainers and voiceover.
- **Trigger:** `frame >= word.startMs * fps / 1000 && frame < word.endMs * fps / 1000`.

### 3.2 Line build (cumulative reveal)
- **Pattern:** Caption builds word-by-word; previous words stay at full opacity. By end of phrase the line is complete.
- **When:** Emphasis on the *sentence's growing meaning* — quotes, definitions, claims.
- **Reference:** Vox/Nas Daily caption style.

### 3.3 Word reveal (Submagic/Opus default)
- **Pattern:** 1–3 words on screen at a time, replaced on each whisper word. Big, centered.
- **When:** Hook + first 5 s; high-energy stretches.
- **Reference:** Submagic/Opus templates; Mr Beast (short-form). Per-word color contrast (yellow for numbers, red for verbs) gives the "designed" feel.

### 3.4 Emphasized-verb pop
- **Pattern:** Linguistic POS-tag pass: verbs and superlatives get an extra `scale 1.0 → 1.15 → 1.0` over 180 ms when spoken.
- **When:** Argumentative content — "**revoluciona**," "**rompe**," "**multiplica**."
- **Implementation:** Pre-process script with simple POS tagger (spaCy es) and tag verbs at pipeline time, then bind to whisper word.

### 3.5 Marker underline (timestamp-anchored)
- **Pattern:** §1.8 sweep, but its 400 ms tween starts at the keyword's `startMs`. The marker draws *while* the word is spoken.
- **When:** Once or twice per video — the moment you'd say "this is the point."

### 3.6 3D depth pop
- **Pattern:** Word lifts toward camera: `translateZ(0 → 30px)` + drop shadow `0 8px 16px rgba(26,26,26,0.18)`.
- **When:** Single-word reveals only ("LEAK," "BANNED," "GRATIS"). Pair with a hard cut.
- **Caveat:** Drop shadows on cream paper kill the editorial feel unless very subtle — keep blur ≤ 16 px and opacity ≤ 0.18.

### 3.7 Bouncing baseline
- **Pattern:** Per word, baseline drops 4 px and recovers (`spring` with damping 8, stiffness 200) on its spoken frame.
- **When:** Playful segments only. Limit to lifestyle/cultural pieces; avoid on hard tech news.

### 3.8 ASR mouth-sync (syllable pulse)
- **Pattern:** Per *syllable* (split whisper word by vowel groups in Spanish — a, e, i, o, u), scale the caption character or logo `1.0 → 1.04 → 1.0` over 80 ms. Tiny, almost subliminal.
- **When:** On the channel watermark/logo while talking-head speaks — creates the illusion the brand "breathes with the voice."
- **Reference:** Visyllable / viseme work in academic lip-sync; Vox lower-third pulsing logos.

---

## 4. EMPHASIS DEVICES

### 4.1 Big-number scale-in
Counter roll (§1.12) at 240 % font size. Number lives center-frame; supporting label (`MM USD`, `% YoY`) at 32 px below in Georgia italic. Hold 1.2 s after settle.

### 4.2 Dotted underline reveal
Behind a noun: SVG `stroke-dasharray` draws a 2 px dotted line across the width, 400 ms, `power2.out`. Editorial alternative to highlight when the word is already inside a sentence.

### 4.3 Marker highlight sweep
§1.8 — the dominant emphasis device for this brand. Warm red, irregular height, slight rotation. ~2× per 30 s.

### 4.4 Callout arrow
Hand-drawn-feel SVG arrow (use a noisy stroke filter, not a perfect curve) draws from caption toward an on-screen element using `stroke-dashoffset` animation, 500 ms, `power3.inOut`. Reference: Vox infographics; The Pudding annotations; XKCD-style drawn arrows.

### 4.5 Parenthesis brackets
Two thin `[` `]` brackets in warm red animate in around a word — left bracket slides from left, right from right, meeting at the word. Editorial annotation feel — Bloomberg Businessweek uses this in pull quotes.

### 4.6 Pulsing border
A 2 px ink border around a screenshot/logo, animated `opacity 0.4 → 1.0 → 0.4` at 1.2 Hz. Use only on the visual that needs investigation — never on text.

### 4.7 Accent-color flash
§1.7 frame-flash on a full word — single frame swap of `color: #1A1A1A` → `#B33A2A` → back. Mark a hard beat in voice.

### 4.8 Split-screen comparison
Vertical split: left half = "antes" (cream), right half = "después" (warm red tint or inverted). Use `clip-path: inset(0 50% 0 0)` and `inset(0 0 0 50%)`. Hold 1.5–2 s. Reference: Wendover comparison shots; Bloomberg Quicktake "X vs Y."

---

## 5. STORY SPINE PATTERNS

Five templates for 30–60 s. Each is a beat sheet — when you write the script, match it to one of these and tag every word range to a beat.

### 5.1 Hook + Stakes + Payoff (Jenny Hoyos)
- **0–3 s** — Hook with a power word (Spanish equivalents: "filtrado," "prohibido," "gratis," "secreto"). Visual: typewriter §1.4 or zoom punch §2.5 onto the headline.
- **3–6 s** — Foreshadow: "Y esto cambia todo para…" Sets the open loop.
- **6–25 s** — Story / mechanism: but/then progression. Every beat = hard cut + new fact card.
- **25–34 s** — Payoff: the answer, with marker-highlight §1.8 on the key noun. End on the emotional high.
- **Reference:** Jenny Hoyos's playbook; documented 90 % retention target; 34 s sweet spot for Shorts.

### 5.2 Problem + Solution
- **0–5 s** — Problem stated as observation. Cream background, ink text, no flourish.
- **5–15 s** — Pain elaboration (3 supporting beats; fade-and-rise §1.6 list).
- **15–20 s** — Pivot — fade-through-cream §2.2, single line "Hay una forma."
- **20–50 s** — Solution mechanic, 2–3 steps, each a paper-turn §2.7.
- **50–60 s** — CTA / next-step. Magnetic kerning §1.10 on outro.
- **Reference:** Daily Brain explainers; Future Now product breakdowns.

### 5.3 Before + After
- **0–4 s** — "Esto era X." Split-screen §4.8 muted.
- **4–10 s** — Trigger event ("entonces salió Gemini 3").
- **10–40 s** — After-state explained, 3 beats.
- **40–55 s** — Compare side-by-side, holding 2 s on each delta.
- **55–60 s** — Takeaway line, marker-highlight on the verdict.
- **Reference:** Vox Borders before/after maps; Wendover infrastructure shorts.

### 5.4 Listicle 5-beat
- **0–4 s** — Promise: "5 herramientas que…" Number §4.1 hero.
- **5×8 s blocks** — Each item: paper-turn §2.7 in → big number "1/5" top-left → name (split-text reveal §1.9) → 5 s of evidence → out.
- **54–60 s** — Recap or twist (Hoyos's "ending with a twist" — surprise: "pero la 6 es la mejor").
- **Reference:** BuzzFeed Tasty for pacing; Jenny Hoyos for end-twist; Wendover when ranking countries/airlines.

### 5.5 Head-to-head comparison
- **0–5 s** — Two logos / two names introduced side-by-side via parallax push §2.6.
- **5–45 s** — 3–4 rounds; each round = split-screen §4.8 holding a metric. Counter rolls §1.12 race against each other.
- **45–55 s** — Winner declared with accent-color flash §4.7 on the victor's name.
- **55–60 s** — Editorial verdict in Georgia italic ("…pero depende de tu caso de uso").
- **Reference:** Marques Brownlee phone comparisons; Bloomberg Originals "X vs Y" shorts.

---

## 6. ANTI-PATTERNS

1. **Drop-shadow + glow on cream paper.** Editorial print never glows. Heavy shadows on `#FAF7F2` turn it into a stock-template look. Max shadow: `0 8px 16px rgba(26,26,26,0.12)`, and only on elevated objects (cards, photos), never on text.
2. **Constant scale pulsing on captions.** If every word pops, none does. The MrBeast spring-on-every-word is *anti-editorial*. Pulse only on emphasized words (§3.4) — ≤ 15 % of total words.
3. **Neon / purple accents.** Violates brand. Also violates the editorial reference set — no Bloomberg, Reuters, or Pentagram work uses neon. Stick to ink, cream, and the warm red. One accent color, period.
4. **Stacked motion (scale + position + rotation + blur all at once).** HyperFrames doc: "choose either scale or position as the main motion, not both every time." When everything moves, the eye can't track meaning. Rule: **2 properties max per element per moment.**
5. **Effect transitions on every cut.** ~95 % of pro cuts are hard. If you use a swipe, a fade, a morph and a zoom punch in 30 s, the video reads "template." Cap effect transitions at 2–3 per video.
6. **Decorative camera shake / wiggle on text.** The "AI video slop" signature. Editorial text is *still* — it earns motion only when arriving or being emphasized.
7. **Gradient text fills.** Reads "AI tool slick" — exactly the anti-aesthetic. Solid ink, solid red, solid cream. If you want richness, use the *paper texture* not the typeface.
8. **Generic sans (Roboto/Poppins/Open Sans) showing up in any chart, watermark, or footer.** Inter everywhere, Georgia italic for accent. Mixed defaults betray the brand.

---

## 7. AUDIO-ANCHORED TIMING

Single rule: **No animation in this pipeline uses a hardcoded frame.** Every timing comes from the whisper `startMs` / `endMs` of a known word. This is the channel's structural moat.

### 7.1 Keyword-trigger entrance
Title/overlay enters at the exact frame the keyword is spoken. Pipeline accepts a `triggers: [{ word: "Gemini", overlay: "ScreenshotA" }]` array; during render, look up `word.startMs` in the caption JSON; compute `triggerFrame = round(startMs * fps / 1000)`; pass into composition as a prop; mount overlay with §1.3 mask reveal starting at that frame.

### 7.2 Per-word caption scaling/coloring
§3.1 — every caption character is rendered, but per-frame we compute which word is "current" by binary-searching the timestamp array and apply scale + color only to that word. Caption never drifts because it *is* the timestamp.

### 7.3 Audio amplitude → visual density
Background particle density, paper-grain intensity, or accent-shape size driven by `visualizeAudio()` from `@remotion/media-utils`. Pass numSamples=16 for smooth amplitude curves; multiply by `0.4` so the effect is subliminal (max ±15 %). When the voiceover gets louder/more emphatic, the background subtly intensifies — viewers register the energy without noticing the mechanic.

### 7.4 Syllable pulse on logo / watermark
§3.8 — split each whisper Spanish word into syllables by vowel groups; for each syllable's midpoint, fire a `scale 1.0 → 1.03 → 1.0` over 80 ms on the channel mark. Builds brand identity through micro-motion. Indistinguishable consciously, identifiable subconsciously.

### 7.5 Phrase-end punctuation flash
Whisper marks `endMs` of the final word in each caption page. At that exact frame, fire a 1-frame §1.7 color flash on the caption — visually "punctuates" the spoken phrase. Replaces conventional punctuation (which captions usually omit) with motion punctuation.

---

## Pipeline implementation notes

1. **One ease library, two engines.** Define a shared `ease.ts` constants file: `EDITORIAL_OUT = cubicBezier(0.22, 1, 0.36, 1)`, `PUNCH_OUT = cubicBezier(0.16, 1, 0.3, 1)`, `BREATH = cubicBezier(0.4, 0, 0.2, 1)`. Both Remotion compositions and HyperFrames templates import the same constants — guarantees feel-parity across the bake-off.
2. **Template metadata.** Each composition declares its allowed entrance set. The `generate.ts` pipeline rejects any keyword-trigger that asks for a disallowed entrance. Enforces editorial discipline at the build layer.
3. **Whisper output schema.** Extend `transcribe.py` to emit per word: `{ text, startMs, endMs, syllables: [{startMs, endMs}], pos: "VERB"|"NOUN"|... }`. Every motion pattern in §3, §4, §7 consumes this — single source of truth, zero hardcoded frames.
4. **Verify before committing a template.** Render the same 30 s script through every approved template, lay them on a contact sheet, and ask: "Could a viewer tell these are the same channel?" If yes — consistency holds. If no — the entrance vocabulary has drifted, narrow it.

---

## Sources

Bloomberg Businessweek anti-aesthetics, Vox Borders, Wendover Productions, Pentagram editorial, GSAP SplitText, Remotion captions, Jenny Hoyos playbook, MarkerHighlight.js, A24 trailers, The Pudding longreads, Bottega Veneta, Nike, Apple Keynote, MrBeast (short-form), Reuters Graphics, Codrops, Aceternity UI, OlafMotion, Marketing Examined. (Full URL list available; trimmed for brevity in this archived copy.)
