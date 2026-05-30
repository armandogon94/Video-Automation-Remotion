# A4 — Information density and audio/visual sync critique

**Scope:** All 12 W21 video variants for `2026-05-18-gemini-3-2-flash-leak`.
**Question:** At the preview frame, does the visual REINFORCE the audio, COMPETE with it, or DUPLICATE it?
**Reference script (Spanish, ~45s):** Hook on Gemini 3.2 Flash leak → date/source detail → I/O context → punchline pricing → benchmark numbers → CTA.
**Reference transcript (faster-whisper SRT, w/ timing):** `output/2026-05-18-gemini-3-2-flash-leak/transcript/transcript.srt`

## Audio timing map (used throughout)

| Filename token | Audio playing at that timestamp |
|---|---|
| `t1s` / `t1.5s` / `t2s` / `t3s` | "Filtraron Gemini 3.2 Flash dos días antes del Google I/O." → tail "Y los números son escandalosos." |
| `t6.85s` (crossfade) | mid seg 3: "Apareció el 5 de mayo en builds del app de iOS y en metadata de AI Studio." |
| `t8s` | end of seg 3 → about to hit seg 4 ("Google I/O arranca esta semana.") |
| `t10.5s` | seg 4 → seg 5: "Google I/O arranca esta semana. Cero coincidencia." |
| `t25s` | seg 10 → seg 11: end of "Y en código rinde al 92% de GPT-5.5." → "Latencia, menos de 200 milisegundos." |

---

## 1. `remotion-v2-baseline` — preview-t1.5s.jpg

1. **Visual:** "FILTRACIÓN" red eyebrow chip + huge "GEMINI 3.2 FLASH" hero.
2. **Audio (t1.5s):** "Filtraron Gemini tres punto dos Flash…"
3. **Verdict:** **DUPLICATE.** The hero text is literally the same noun phrase the narrator is saying, and the caption strip below reads "Filtraron Gemini tres punto dos Flash" — the same words a third time.
4. **Caption strip:** Reads "Filtraron Gemini tres punto dos Flash" — duplicates both the hero ("GEMINI 3.2 FLASH") and the audio. Triple-redundant.
5. **3+ places at once?** **YES.** Eyebrow ("FILTRACIÓN") + hero ("GEMINI 3.2 FLASH") + caption ("Filtraron Gemini tres punto dos Flash") + audio = same concept in 4 surfaces. Worst offender at this frame.

## 2. `tnf-blue` — preview-t1s.jpg

1. **Visual:** Blue "FILTRACIÓN" chip (animating in over the eyebrow), eyebrow "I/O 2026 · FILTRACIÓN", hero "GEMINI 3.2 FLASH".
2. **Audio (t1s):** "Filtraron Gemini tres punto dos Flash…"
3. **Verdict:** **DUPLICATE,** same failure mode as v2-baseline but with one extra surface — the animating chip momentarily overlaps the eyebrow text spelling "FILTRACIÓN" twice.
4. **Caption strip:** "Filtraron Gemini tres punto dos Flash" — duplicates hero + audio.
5. **3+ places at once?** **YES — five surfaces.** Chip "FILTRACIÓN" + eyebrow "I/O 2026 · FILTRACIÓN" + hero "GEMINI 3.2 FLASH" + caption "Filtraron…tres punto dos Flash" + voice. The chip-over-eyebrow moment is a self-collision the template should prevent.

## 3. `tnf-transitions` — preview-t6.85s-crossfade.jpg

1. **Visual:** Mid-crossfade between two scenes. The "GEMINI 3.2 FLASH" hero is fading out (gray, low opacity) while caption strip now reads "del app de iOS y en".
2. **Audio (t6.85s):** "…builds del app de iOS y en metadata de AI Studio."
3. **Verdict:** **REINFORCES (weakly).** The hero is on its way out so it's no longer competing; the caption strip is the only running info. Hero is stale (Gemini 3.2 Flash) for what the audio now describes (where it was found).
4. **Caption strip:** "del app de iOS y en" — verbatim audio. Since the hero zone is empty/fading, the caption is the only visual carrying meaning. Acceptable.
5. **3+ places at once?** **NO** during the crossfade. This is actually a good frame — the template lets the hero go before a new one appears.

## 3b. `tnf-transitions` — preview-t10.5s.jpg

1. **Visual:** New hero "15× MÁS BARATO". Eyebrow "GOOGLE I/O 2026 · FILTRACIÓN".
2. **Audio (t10.5s):** "Google I/O arranca esta semana. Cero coincidencia."
3. **Verdict:** **COMPETES.** The visual is announcing the price punchline that the narrator does not reach for another ~5s ("15 veces más barato" lands at ~15.8s). Viewer reads the price; ear hears unrelated context line. Eye and ear are on different beats.
4. **Caption strip:** "arranca esta semana. Cero coincidencia. Esta" — matches audio. But hero ("15× MÁS BARATO") is two ideas ahead. Eye-vs-ear desync.
5. **3+ places at once?** Two beats simultaneously (caption = current audio; hero = future audio). Not a triple, but a sync problem.

## 4. `tweetcard` — preview-t2s.jpg

1. **Visual:** Mock tweet from @armandointeligencia: "Gemini 3.2 Flash filtra benchmarks: 15× más barato que GPT-5.5 con casi el mismo score. Esto cambia el cálculo para todos los que están construyendo con LLMs."
2. **Audio (t2s):** "Filtraron Gemini tres punto dos Flash dos días antes del Google I/O…"
3. **Verdict:** **COMPETES, badly.** The tweet already contains the *entire video's thesis* — the leak, the 15× number, the GPT-5.5 comparison, the "this changes the math" framing. The viewer can read it in 3s and is now waiting for the audio to catch up for 40+ seconds. The tweet is a spoiler.
4. **Caption strip:** "dos días antes del Google I/O." — a fragment that's already inside the tweet body. Pure duplication of a snippet of the hero.
5. **3+ places at once?** **YES at the macro level.** The tweet covers ~the whole script's content; the caption replays a fragment; the voice narrates linearly. Three simultaneous tracks of the same information at different granularities.

## 5. `diagram-cream` — preview-t25s.jpg

1. **Visual:** Three stacked boxes connected by arrows: "Filtraron Gemini 3.2 Flash / 5 mayo · builds iOS" → "15× más barato / $0.25 / $2.00 / 1M tokens" → "92% rendimiento GPT-5.5 / <200ms latencia". Title "EL LEAK".
2. **Audio (t25s):** end of "…92% de GPT-5.5." → "Latencia, menos de 200 milisegundos."
3. **Verdict:** **REINFORCES, then becomes DUPLICATE.** The third box ("92% rendimiento GPT-5.5 / <200ms latencia") lines up exactly with the narration. But boxes 1 and 2 are also fully visible, repeating earlier ideas the voice already left behind ~10s and ~20s ago.
4. **Caption strip:** "cinco punto cinco. Latencia: menos de" — matches audio AND matches the third box ("92% rendimiento GPT-5.5", "<200ms latencia"). The same fact lives in caption + diagram-box + audio at the same instant.
5. **3+ places at once?** **YES.** Box 3 + caption + voice all carry "92% / <200ms" simultaneously. Plus boxes 1 and 2 are "echo" content the script has finished with. Density is high but at the cost of redundancy.

## 6. `diagram-dark` — preview-t25s.jpg

Identical content to 5; only the palette changes. Same verdict: **REINFORCES then DUPLICATES**, same triple-stack at t25s, same caption echo. Dark theme makes the redundancy slightly less fatiguing because the contrast hides the lower boxes a touch — but the information density problem is identical.

## 7. `quote-cream` — preview-t8s.jpg

1. **Visual:** Pull-quote in serif italic: "Filtraron Gemini 3.2 Flash dos días antes del Google I/O. Y los números son escandalosos." Attribution: ARMANDO INTELIGENCIA / AI Leadership Lab.
2. **Audio (t8s):** "…metadata de AI Studio." (transitioning to "Google I/O arranca esta semana.")
3. **Verdict:** **COMPETES.** The on-screen quote is the script's *opening two sentences*. At t8s the audio has moved on by ~7 seconds and is talking about iOS metadata / I/O timing. The eye is re-reading sentence 1 while the ear is on sentence 3. Maximum eye/ear desync of the 12 variants.
4. **Caption strip:** "metadata de AI Studio. Google I/O" — current audio. But hero quote is two beats behind. The caption is also visually fighting the big serif quote for the eye's attention.
5. **3+ places at once?** **NO triple, but a structural mismatch:** quote (past audio) + caption (current audio) + voice (current audio). Two of three are out of phase with what's being said.

## 8. `quote-dark` — preview-t8s.jpg

Same content as 7; dark navy bg. Same critique: **COMPETES** (hero quote two beats behind narration). Dark mode actually slightly mitigates the issue because the cream serif on dark is easier to skim-and-ignore than dark-on-cream — but the design problem is identical. The attribution "AI Leadership Lab" is invented/fictional and adds noise without reinforcing the audio.

## 9. `bignum-cream` — preview-t1.5s.jpg

1. **Visual:** Massive "15×" hero with subtitle "más barato que GPT-5.5" and sub-sub "$0.25 / $2.00 por millón de tokens". Label above: "GEMINI 3.2 FLASH".
2. **Audio (t1.5s):** "Filtraron Gemini tres punto dos Flash…" (the *opening hook,* not the price beat).
3. **Verdict:** **COMPETES, severely.** The biggest, loudest visual element ("15×") is the script's *punchline,* which the narrator doesn't reach until ~16s. The viewer reads the answer 14s before the question is asked, gutting the reveal.
4. **Caption strip:** "Filtraron Gemini tres punto dos Flash" — that *is* matched to the audio. But the hero zone above contradicts the audio's pacing entirely. Caption ≠ hero.
5. **3+ places at once?** **NO triple at this instant** — but the desync is the worst-in-class problem. (The shorthand label "GEMINI 3.2 FLASH" + caption "Filtraron Gemini tres punto dos Flash" + audio is already a triple of the model name, then the "15×" hero is icing.)

## 10. `bignum-dark` — preview-t1.5s.jpg

Same content as 9. Same verdict: **COMPETES** (punchline shown 14s before the audio reveal). Dark mode looks cleaner but the script-vs-visual desync is identical. If `bignum-*` is positioned at the price beat (~t16s) instead of t1.5s, it would become best-in-class. As composed today, it's a spoiler card.

## 11. `benchmark-cream` — preview-t3s.jpg

1. **Visual:** Bar-chart "Precio por millón de tokens (entrada)". Gemini 3.2 Flash bar at $0.25 (short, blue). GPT-5.5 bar at $3.75 (long, blue). Footer source: "Filtración Google AI Studio · 5 mayo 2026".
2. **Audio (t3s):** "…Y los números son escandalosos." (just finishing the hook).
3. **Verdict:** **REINFORCES (literally).** The audio promises "scandalous numbers"; the visual immediately delivers two numbers in a comparison chart. The hero is asking the question the audio just teased. This is the rare A+ moment: visual answers what the audio is setting up.
4. **Caption strip:** "Y los números son escandalosos. Apareció" — verbatim audio. The caption is the tease; the chart is the receipt. Zero duplication between caption and chart.
5. **3+ places at once?** **NO.** Chart shows prices; caption shows tease sentence; audio matches caption. Three surfaces, three different layers (data / tease / voice). This is the model the other templates should learn from.

## 12. `benchmark-dark` — preview-t3s.jpg

Same content as 11, dark palette. Same verdict: **REINFORCES.** Dark makes the blue bars pop harder and the contrast between the tiny $0.25 bar and the huge $3.75 bar is more legible. Best-in-class at this frame, tied with `benchmark-cream`.

---

## Top 5 redundancy / competition issues

1. **`bignum-cream` / `bignum-dark` at t1.5s — spoiler card.** The 15× punchline dominates the screen while the narrator is still on the opening hook. **Fix:** delay the bignum scene so the 15× appears at ~t15.8s when the narrator says "Quince veces más barato"; before that, show a build-up (a question mark, a "?", or a price-tag placeholder).
2. **`quote-cream` / `quote-dark` at t8s — eye/ear two beats out of phase.** Quote is sentences 1–2; audio is on sentence 3. **Fix:** advance the quote slide as new sentences arrive (one slide per audio chunk), OR drop the running caption strip on quote templates (see CTA below).
3. **`remotion-v2-baseline` and `tnf-blue` at t1s/t1.5s — model name in 3–5 places at once.** Chip + eyebrow + hero + caption + voice all say "Gemini 3.2 Flash" / "Filtración" in the first second. **Fix:** kill the eyebrow chip duplication; pick one of {eyebrow, hero, caption} for the brand/model name in the cold-open.
4. **`tweetcard` at t2s — full thesis is on screen by second 3.** A 7-second mock tweet that contains the whole video's argument is the wrong opener for a 45s narrated piece. **Fix:** show the tweet later as a closer/proof shot, OR mask sections of the tweet to reveal in sync with the narration ("15×" appears at t15.8s, the comparison clause at t22s, etc.).
5. **`diagram-cream` / `diagram-dark` at t25s — caption + box + voice all carry the same fact.** When the audio says "92% / <200ms", the third box already says "92% rendimiento GPT-5.5 / <200ms latencia" and the caption strip is mirroring the audio verbatim. **Fix:** disable the caption strip on diagram templates (the diagram already carries the structure), OR have the boxes appear one-at-a-time keyed to audio segments so only the active box is highlighted.

## Best-in-class

**`benchmark-cream` and `benchmark-dark`** at t3s. The audio sets a question ("los números son escandalosos") and the visual immediately answers it with a *data* layer (a bar chart) that the audio cannot deliver on its own. The caption strip echoes the tease, not the answer — so the three surfaces (chart, caption, voice) carry three different layers of meaning, not the same one. The chart also shows the GPT-5.5 number ($3.75) which the audio never states, so the visual is *adding* information rather than mirroring it. This is the pattern to replicate: **visual delivers data the audio cannot.**

Honorable mention: **`tnf-transitions` at t6.85s** — the crossfade moment correctly drops the stale hero before the new one arrives, which is the only frame where a hero zone is *deliberately empty.* Worth keeping; worth porting the crossfade behavior to the other templates.

## Should QuoteCard9x16 and TweetCardHero9x16 disable captions by default?

**Yes — set `showCaptions: false` for both templates by default.**

The argument:

- **QuoteCard9x16** — the hero is a literal pull-quote rendered in serif italic. It is *meant* to be read at the viewer's pace, holding for several seconds. A live caption strip below it forces the eye to choose between two large blocks of text simultaneously, and one of them (the quote) is always behind the audio. Either the quote should advance per audio sentence (and captions become redundant) or the quote stays static (and captions visually shout over the editorial quote). Both failure modes are solved by dropping captions on this template.
- **TweetCardHero9x16** — the mock tweet already includes the entire argument in 2–3 sentences of natural Spanish. Captions add a second moving text element competing for attention right under a static text element. The viewer reads neither well. Drop captions and let the tweet breathe.

For both templates, the audio narration is the temporal layer and the hero card is the spatial layer — there is no third "live text" layer needed. The captions earn their keep only on templates where the hero zone is *non-textual* (bar chart, diagram nodes, big number) or where the hero updates synchronously with the audio.

**Recommended default by template:**

| Template | `showCaptions` default | Rationale |
|---|---|---|
| `BenchmarkBars9x16` | `true` | Chart is data; caption carries the tease/voice text. Layers don't collide. |
| `BigNumberHero9x16` | `true` (but re-time the scene) | OK as long as the bignum lands with the audio beat. |
| `DiagramExplainer9x16` | `false` | Diagram nodes already are the text; caption duplicates. |
| `QuoteCard9x16` | **`false`** | Quote *is* the text layer. |
| `TweetCardHero9x16` | **`false`** | Tweet body *is* the text layer. |
| `TechNewsFlash9x16` (tnf-*) | `true` | Hero is a single short phrase; caption fills the gap between phrases. |
| `ExplainerVideo` (remotion-v2-baseline) | `true` | Same as TNF. |

## One-sentence info-density grade per variant

| Variant | Grade | One-sentence rationale |
|---|---|---|
| `remotion-v2-baseline` | **C** | Hero + caption + audio all say the same noun in the first 2s; clean type can't save the redundancy. |
| `tnf-blue` | **C** | Same triple-spelling problem as baseline, made worse by the animating chip overlapping the eyebrow. |
| `tnf-transitions` | **B** | The crossfade gives the hero room to breathe, but t10.5s shows a price punchline two beats before the audio reaches it. |
| `tweetcard` | **D** | The opening mock tweet contains the entire video's thesis in plain Spanish, spoiling everything before second 3. |
| `diagram-cream` | **B−** | High-density structural map that genuinely aids retention, but caption strip + active box repeat the same fact at t25s. |
| `diagram-dark` | **B−** | Same as cream; dark palette hides the lower boxes slightly so feels less stacked but the redundancy is identical. |
| `quote-cream` | **D** | Hero quote is the script's first two sentences while audio is already on sentence 3 — worst eye/ear desync in the set. |
| `quote-dark` | **D** | Same desync as quote-cream; cream-on-dark only marginally improves skim-ability of the offending quote. |
| `bignum-cream` | **D** | Spoils the 15× punchline at t1.5s, 14 seconds before the audio reveal — biggest, loudest, earliest disclosure of all 12. |
| `bignum-dark` | **D** | Same punchline-too-early problem; dark palette looks cleaner but does not fix the timing. |
| `benchmark-cream` | **A** | Audio teases "scandalous numbers"; chart immediately delivers two numbers the audio doesn't verbalize — three layers, three meanings. |
| `benchmark-dark` | **A** | Same A-grade pattern as cream; dark mode actually improves the bar-length contrast and is the strongest single frame in the set. |
