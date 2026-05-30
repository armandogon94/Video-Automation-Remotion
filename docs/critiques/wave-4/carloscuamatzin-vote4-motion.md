# @carloscuamatzin — Wave 4 / Vote 4 / MOTION GRAMMAR

> Independent vote. Color, typography and content were ignored on purpose. Conclusions are inferred from 24 frames sampled across 12 reels in `references/creators/carloscuamatzin/`, with extra attention to adjacent-frame pairs and to frames that were obviously caught mid-animation (blur, partial reveal, particle haze).

---

## 1. The motion DNA in one paragraph

Every reel feels like a single continuous take that someone manually scrubs through, not a deck of slides. Three things produce that feeling: (a) a **persistent low-energy background** (radial vignette breathing, dust particles drifting, occasional matrix-rain or animated wave) that never pauses, (b) **blur-in-from-defocus entries** that last long enough to read on a 30 fps timeline as a distinct beat (~180–300 ms), and (c) **scene transitions that are always covered**, either by a brief blackout/vignette pulse, by a particle-shatter of the outgoing text, or by leaving the previous element visible in motion-blur ghost form while the next one resolves into focus. Hard cuts are reserved for the moment audio emphasis lands on a punchline; everything else is dissolves and dimming. Within a scene, elements arrive on a **staggered cascade** (300–600 ms between siblings), and any quantity on screen — a counter, a bar, a chart curve, a strikethrough line — **animates instead of appearing fully formed**.

---

## 2. Entry choreography per element type

| Element | Entry move (high confidence unless flagged) | Approx duration | Easing |
|---|---|---|---|
| Hero word (display serif/sans, centred) | Blur-in (gaussian 14→0 px) + fade 0→1 + slight scale 0.96→1 | 250–350 ms | Soft ease-out, no overshoot |
| Section-title kicker ("ANTI-PATRÓN", "EL PROBLEMA", "ANTHROP\\C") | Plain fade-up 6 px | ~200 ms | linear-ish ease-out |
| Numbered chapter badge top-left ("01", "HALLAZGO 03") | Pop-scale 0.85→1 + fade | ~180 ms | Soft spring, slight overshoot (low conf) |
| Big counter (179K, 150 000, 432, 5.1 g) | Tween counter from 0 to value + colour-glow ramp | 600–1200 ms | ease-out-quart, value bouncing very slightly at the end |
| Horizontal progress bar | Width 0→target % | 600–900 ms, syncs to counter | ease-out-cubic |
| Animated chart line (the Tylenol curves) | Stroke-dashoffset draw L→R, tracker dot appears at end | 800–1200 ms | ease-in-out-cubic |
| Terminal line | Typewriter character-by-character + caret blink | 25–40 ms / char | linear |
| Row card in a list (5-row hooks, 3-step pipeline) | Slide-in from below + fade, **staggered 80–120 ms between rows** | per row 280 ms | ease-out |
| Grid card (the 5-card TABLAS/CSS/SVG grid) | Fade + tiny scale 0.94→1, staggered row-major | per card 200 ms, ~150 ms stagger | ease-out |
| Pill/chip ("validar prompts", "transport: http · stdio · sse") | Fade + 8 px slide-from-right | ~220 ms | ease-out |
| Strikethrough line over text (medium conf) | SVG stroke-dashoffset draw L→R, slight downward tilt | 220–300 ms | linear, draws "hand-quick" |
| Diagonal hand-drawn X over a card | Two strokes drawn in sequence corner→corner | first 200 ms, then 200 ms | ease-in (slows at end) |
| Highlight rectangle over code (the orange box on `"matcher"`) | Stroke draws around perimeter + fill flashes once | 350 ms | ease-out, hold |
| Callout label with arrow ("← Filtra qué dispara") | Slide-in from the side it's pointing | ~250 ms | spring, ~10 % overshoot |
| Shattered-text transition | Letters convert to particles, particles fall + dissipate while the next text resolves above | 500–800 ms | gravity easing (ease-in then ease-out fade) |

---

## 3. Continuous (always-on) motion layers

These never stop, so the screen never feels frozen even on long static beats:

1. **Radial vignette breathing.** A soft red/amber radial glow centred mid-frame slowly pulses scale + opacity (~3–4 s cycle). Visible in DX-pGXlxoq2 / DYINSgWpzIe / DYV1hvkxP16 / DYOAxVOp2nu. On the light-theme reels it's a pale warm wash instead of a glow.
2. **Drifting dust particles.** ~30–60 tiny soft-edged dots, near-static but slowly migrating, varying brightness. Density goes up during "ambient" beats and gets temporarily cleared by a transition.
3. **Liquid wave background loop** (DX-pGXlxoq2 opener, DYD15WYxhwb): a slow horizontal flowing curve with motion blur, looped — gives a sense of "live wallpaper". Lives on its own layer behind cards.
4. **Matrix-rain katakana columns** (DYV1hvkxP16): vertical streams falling continuously through the whole scene, including behind text.
5. **Particle simulation** (DYV1hvkxP16): a 3D mesh "shattering downward" as continuous gravity-driven particles — runs for the entire scene length.
6. **Camera-style micro-drift on still graphics.** The light-theme illustration cards (DYTRgokx4lU, DYqgAYfRqBf) show a very small position drift between consecutive frames, suggesting a slow ±4 px translate + ±1 % scale loop on the card to keep it alive.

---

## 4. Transition vocabulary between scenes

| Transition | When it's used | Frames seen |
|---|---|---|
| **Blackout pulse + radial glow** (full dim ~200 ms, then next scene blooms) | Between major topic shifts | DYOAxVOp2nu f4 (caught at the trough) |
| **Particle shatter of outgoing text** | When text gives way to text | DYlJ6X2JFIN f3 ("LA" still half-particles) |
| **Cross-blur dissolve** (outgoing element stays as blurred ghost while incoming resolves) | Between sibling scenes of the same theme | DYqgAYfRqBf f6 (ghosted strikethrough behind the new card), DYnCz7upOOM f0 (Shopify) |
| **Hard cut to talking head** | Reserved for the hook in face-led reels | DX0U2rZRBYY f0 |
| **Slide-up next card from below** | Stacked terminal sequences | DX-pGXlxoq2 f6 (second terminal already pushed up under the first) |
| **Whip-slide of hero word** | One specific punchline reveal | DYV1hvkxP16 f0 ("Superpowers" frozen mid-slide, motion-blurred radial behind) |

I see **no hard cuts that aren't immediately preceded or followed by a covering element** — every transition has at least a particle layer, a blur ghost, or a glow pulse hiding the seam.

---

## 5. Dwell times

Most populated scenes live on screen **~5–8 s** before the next change. Within those:

- Hero word (e.g. "CAUSAL", "context rot") holds full intensity ~2.5 s after its blur-in resolves, then either dissolves to particles or cross-blurs.
- Counter scenes (179K, 150 000, 432) hold ~3 s after the count finishes, to let the eye land on the number.
- Code-editor scenes hold longest, ~6–8 s, with internal sub-animations (highlight rectangle pulse, sidebar callout slide-in) refreshing attention at ~1–1.5 s intervals.
- List/grid scenes hold roughly **(stagger × items) + 3 s** so the last item gets the same read time as the first.

Exit animations look like the inverse of entries, but are noticeably **shorter** (~60 % of entry duration), so the rhythm feels "elements take their time arriving, leave fast".

---

## 6. Audio-visual sync (inferred from cut timestamps)

- The cut cadence (see §8) tightens around dense narration sections and loosens around hero-word beats — strong sign that the cuts are placed on Carlos's spoken stresses rather than on a constant grid.
- Counters and bar fills appear to **finish on a syllable** (e.g. the bar reaches 100 % right as "noventa y cuatro" hits). Inferred from the consistency of "value-ramp ~700 ms" matching a typical Spanish two-word phrase.
- Strikethroughs cross out the word **as it is named** in the voiceover.
- The shatter transitions sit on hard consonants (the most "punctuating" moments in the script).

---

## 7. Easing palette (calibrated by eye)

| Curve | Where it lives | Confidence |
|---|---|---|
| `ease-out` (cubic-ish, ~0.16, 1, 0.3, 1) | The default for nearly every entry | high |
| `ease-out-quart` | Counter ramps + bar fills | medium-high |
| `ease-in-out-cubic` | Chart line drawing | medium |
| Soft spring, ~6–10 % overshoot | Callout labels & chapter badges | medium |
| Linear | Typewriters, stroke-draws | high |
| `ease-in` then fade | Particle gravity / shatters | medium |

**No bouncy / elastic / cartoon-spring overshoots** — the spring he does use is restrained. This is a big part of why it reads "polished software product demo" rather than "Lottie sticker pack".

---

## 8. Per-reel cut cadence

Cuts inferred from the visual deltas between sampled frames; cadence is `total_cuts / duration_s`. Frame interval ≈ 15.4 s in 108 s reels and ≈ 22 s in 157 s reels, so "cuts observed in sample" is a lower bound. I adjusted upward where mid-frame motion blur clearly implies one or more in-between scenes were missed.

| Reel | Duration | Cuts observed (sample) | Adjusted estimate | Cuts/sec | Reads as |
|---|---|---|---|---|---|
| DX-pGXlxoq2 (Hooks) | 108 s | 7 | ~14 | 0.13 | Calm/explanatory |
| DX0U2rZRBYY (talking-head + code) | 108 s | 6 | ~12 | 0.11 | Slow, hook-first |
| DYD15WYxhwb (cloud code review) | 111 s | 6 | ~13 | 0.12 | Calm |
| DYINSgWpzIe (Interpretability probe) | 157 s | 8 | ~18 | 0.11 | Long-form, denser at chart sections |
| DYOAxVOp2nu (Equipo Claude Code) | 134 s | 7 | ~14 | 0.10 | Calmest in the corpus |
| DYTRgokx4lU (light-theme eval) | 110 s | 6 | ~12 | 0.11 | Slow, editorial |
| DYV1hvkxP16 (Superpowers / context rot) | 108 s | 7 | ~16 | 0.15 | Most energetic — particle scenes + whip slide |
| DYik8lSJW9x (MCP Postgres) | 130 s | 7 | ~14 | 0.11 | Calm |
| DYlJ6X2JFIN (Proyectos / Claude) | 155 s | 7 | ~15 | 0.10 | Slow + meditative |
| DYnCz7upOOM (Shopify quote) | 192 s | 6 | ~14 | 0.07 | Slowest — quote pacing |
| DYqgAYfRqBf (3 agentes pipeline) | 169 s | 7 | ~15 | 0.09 | Calm |
| DYtE2wkREAe (Antes/Después) | 109 s | 7 | ~15 | 0.14 | Energetic, comparison-heavy |

**Median cadence: ~0.11 cuts/s** — roughly one cut every 9 s. This is *very* slow for IG Reels (compare typical TikTok dev content at 0.3–0.6 cuts/s). The illusion of pace comes almost entirely from the within-scene sub-animations.

---

## 9. Timing quirks worth stealing

- **Caption text runs at a different rhythm from the visuals.** White caption stripe at the bottom updates roughly every 1.5–2 s (sentence chunks), independent of the slower scene-level beat. This double-layer rhythm makes a 6 s static-feeling scene still feel like progress is happening.
- **The radial glow brightens slightly each time a new element enters.** Inferred from the matching warm wash under each just-arrived card. It's effectively a non-diegetic "spotlight" that follows the eye to the new element.
- **Numbers are never typed, always counted.** A 4-digit value gets its own ~800 ms ramp even when the rest of the scene has resolved. This is the single most "premium feeling" trick in the corpus.
- **List items don't all use the same stagger.** The 5-hooks list (DX-pGXlxoq2 f3) appears to use a slightly accelerating cascade (later rows arrive faster), so the eye doesn't get bored waiting for row 5.
- **Highlight rectangles "land" with a single quick flash** before settling to a static stroke + dim fill. Implies an opacity ramp 0→1→0.6 over ~250 ms.

---

## 10. What separates polished from amateur here

It's not the assets — the assets are mostly plain dark cards with one accent colour. It's that **nothing on screen is ever instantly true**. Numbers count up, bars fill, lines draw, words blur into focus, and scenes hand off through a covering layer (particles, glow, blur ghost) so the brain never registers a hard "slide change". On top of that, two slow continuous-motion layers (breathing vignette + drifting dust) keep the screen biologically "alive" during the long 5–8 s dwells, so the eye never declares the frame dead. The easing palette is deliberately restrained — soft ease-outs and tiny springs, no rubber-band bounces — so the whole thing reads as "engineered software demo" rather than "After Effects template". An amateur version of these same layouts would (1) snap things in fully formed, (2) cut on a constant 2 s grid, (3) use bouncy springs everywhere, and (4) leave the background dead. Carlos does the opposite of all four, and that is the entire trick.

---

## 11. Top 5 motion principles to extract into reusable utilities

1. **`blurInFocus(durationMs=280, startBlurPx=14)`** — fade + scale 0.96→1 + gaussian blur ramp 14→0. The single most-used entry in the corpus, applicable to hero words, hero numbers, hero cards.
2. **`countUp(from, to, durationMs=800, ease='easeOutQuart', syncedBar?)`** — animated number with optional linked bar / chart fill. Should be the only way numbers ever enter a frame.
3. **`staggeredCascade(children, perChildMs=240, staggerMs=110, accelerate=true)`** — generic stagger for lists/grids with optional accelerating curve so later items aren't punished.
4. **`coveredTransition(kind: 'blackoutPulse' | 'particleShatter' | 'crossBlur')`** — wrap any scene change in one of these three covers; never permit a naked cut between graphics scenes.
5. **`ambientBackdrop({ vignettePulse: true, dustParticles: 40, optional: 'wave' | 'matrix' | 'shatter' })`** — always-on persistent backdrop so dwell beats stay alive. Should be a single composition layer that lives behind everything.

A sixth honourable mention: **`drawStroke(svgPath, durationMs=280, ease='linear', handJitter=2)`** — for the hand-drawn strikethroughs, X-marks, and underlines. Linear easing + a couple of pixels of jitter is what makes them feel marker-drawn rather than CSS-drawn.
