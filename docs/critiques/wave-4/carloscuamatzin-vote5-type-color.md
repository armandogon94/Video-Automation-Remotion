# carloscuamatzin — Vote 5 of 5 — Typography + Color Only

**Scope:** Independent voter focused exclusively on typefaces, weight/size/tracking hierarchy, and color discipline. Prior voter outputs were not consulted. Sample: 21 frames across 12 reels (DX-pGXlxoq2, DX0U2rZRBYY, DYD15WYxhwb, DYINSgWpzIe, DYOAxVOp2nu, DYTRgokx4lU, DYV1hvkxP16, DYik8lSJW9x, DYlJ6X2JFIN, DYnCz7upOOM, DYqgAYfRqBf, DYtE2wkREAe). Frame paths under `references/creators/carloscuamatzin/<shortcode>/frames/`.

---

## TYPOGRAPHY

### Typeface inventory (distinct families observed)

1. **Geometric sans, display weight** — appears as the heaviest UI face. Title slabs like `EL EQUIPO DE CLAUDE CODE` (DYOAxVOp2nu f00), `MOSTRAR` (DYTRgokx4lU f05), `MI FAVORITO` (DYOAxVOp2nu f05), `FASES / SPECS ESTRICTAS / CONTEXT RESET` (DYV1hvkxP16 f05). Tall x-height, geometric "O", straight-cut terminals. Strong candidate: **Inter Black (900)** or **Geist Black**. Not Helvetica (apertures too open, no double-storey "g" visible at this size to confirm — but proportions match Inter).
2. **Same family at 500–700** — body and chip text in card panels (`Trabajo dividido en pasos.`, `Cada fase con su contrato.`, captions "evalúa si Clot realmente terminó"). Confirms a single sans family is the workhorse across multiple weights.
3. **Monospace (programmer)** — used for code editors, terminal chrome, chip labels, mini metadata. Distinct ligature-friendly letterforms (zero with a slash, distinct `1` from `l`), even spacing. The shapes match **JetBrains Mono** or **Fira Code**; `>` and arrow ligatures in `→` (DYINSgWpzIe f00 prompt `~/billing-service`) suggest **Fira Code** is plausible. Used at: terminal prompts (DYik8lSJW9x f04 `$ claude mcp add github…`), VS Code mockups (DYD15WYxhwb f04 `#!/bin/bash`), chip pills (`command / http / prompt / mcp_tool / agent` in DX-pGXlxoq2 f03), even mini-labels like `85M tokens · honeypot-similar` (DYTRgokx4lU f02), `vector`, `comportamiento` (DYINSgWpzIe f03). This mono shows up in MORE places than the sans does.
4. **Transitional/Didone serif, italic-leaning display** — used sparingly but with intent. Hero words `CAUSAL` (DYINSgWpzIe f03), `CRITERIO` (DYV1hvkxP16 f01), `REGLAS` (struck-through, same family upright then italic for `vs`), single-character logo `TU` (DYik8lSJW9x f00), tiny serif italic numerals `3` inside `HALLAZGO 03` chip (DYINSgWpzIe f03), the italicized `3%`, `1.4%`, `0.8%` in DYtE2wkREAe f04, even the editorial `meh.` under `MOSTRAR` (DYTRgokx4lU f05). High stroke-contrast, ball terminals, fully drawn italic (not slanted). Strong candidates: **Playfair Display Italic**, **GT Sectra**, or **EB Garamond Italic** at heavy weights. The `CRITERIO`/`CAUSAL` italic has a flared `R` and a `T` with curved-foot serifs that lean Playfair-or-Sectra family.
5. **Body serif italic (subtle, supporting)** — small lines like `Es lo mismo que pasa con personas.`, `Las reglas se rompen cuando aparece un caso nuevo.`, `Y resulta que los modelos aprenden criterio, no solo reglas.` (all DYV1hvkxP16 f01) — same italic serif but at body size. This serif is doing real narrative work alongside the geometric sans.

### Weight palette

- **900 / Black** — only on hero display words (`MOSTRAR`, `EL EQUIPO DE CLAUDE CODE`, `context rot`)
- **800 / Extra-bold** — chip titles (`FASES`, `SPECS ESTRICTAS`)
- **700 / Bold** — flow card titles `Escribes una función`, captions `Stop`
- **600 / Semibold** — captions, list secondary text
- **500 / Medium** — small mono labels in dark UI
- **400 / Regular** — monospace body inside terminals, serif body italic

So roughly **5 actively used weights** — not a one-or-two-weight aesthetic. Disciplined but not minimalist.

### Size hierarchy (per 1080×1920 frame, estimated)

- Hero serif italic display: **~190–220px** (`CAUSAL`, `CRITERIO`, `MOSTRAR`)
- Hero sans display: **~160–180px** (`EL EQUIPO DE CLAUDE CODE`, `context rot`)
- Card titles: **~56–64px** (`FASES`, `Escribes una función`)
- Caption body (whisper-style): **~52–60px** (`evalúa si Clot realmente terminó`)
- Mono code body: **~38–46px** (terminal/editor body)
- Tracked uppercase labels: **~30–36px** (`CASO 05`, `EL FLUJO`, `INTENTO 1`, `HALLAZGO 03`)
- Tiny metadata/breadcrumbs: **~22–28px** (`~/project — claude-code`, `main · 0 errors`)

Six clean tiers. The contrast between the smallest tracked label (~30px) and largest hero (~220px) is roughly **7:1** — dramatic, which is why hooks pop.

### Letter-spacing / tracking

- **Tracked uppercase labels at +150 to +250** — `CASO 05`, `MI FAVORITO`, `INTENTO 1 · MOSTRAR EJEMPLOS`, `EL FLUJO`, `HALLAZGO 03`, `SELECTED BRAND`, `PRODUCTOS PARECIDOS COMPITEN POR TRES FILTROS`, `PRODUCT`, `ATENCION/CONFIANZA/RECUERDO`. This is a SIGNATURE — wide tracking on all-caps secondary text is used in nearly every reel.
- **Negative or 0 tracking on hero display** — the sans hero words (`MOSTRAR`, `EL EQUIPO…`) sit tight, almost touching. Confidence + density.
- **Default tracking on body sans and serif italic** — never artificially loosened in body copy.

### Italic vs roman

- Italic is **reserved for serif** — the geometric sans never appears in italic in any sampled frame.
- Italic serif is used for: editorial pull-quotes, contrastive labels (`vs`), and numeric percentages (`3%`, `1.4%`, `0.8%`).
- The `Forzar a Claude a discutir consigo mismo` slide (DYnCz7upOOM f03) uses **roman bold sans on top**, **roman semibold green sans below** — no italic. So italic isn't reflexive — it's a tool for serif moments specifically.

### Line-height

- Caption stack: ~1.15 — tight enough that two-line captions feel like one block, not two.
- Card body: ~1.3
- Mono code: ~1.5 (very generous, signature dev-tool feel)
- Serif italic body: ~1.4

### Specific anomalies / details

- The `Claude` voice keeps writing `Clot` in the burned captions (DX-pGXlxoq2 f06 `evalúa si Clot realmente terminó`) — that's a Whisper transcription error, NOT a typographic choice, but it's a useful lesson for us: relying on Whisper for proper nouns is risky and we should override branded terms post-transcription.
- The chip `5 tipos de hook` (DX-pGXlxoq2 f03) is **monospace inside a pill** with a coral outline glow — combining mono + outlined chip + soft glow is a distinctive pattern.
- The `EDITANDO` status pill in DYlJ6X2JFIN f02 uses tracked-uppercase **mono** (not sans) — a small but considered choice: it's a system-state indicator, so it stays in the dev-tool typographic register.
- `CRITERIO` (DYV1hvkxP16 f01) has a faint coral glow halo behind the serif italic — typography literally lit from behind. This is rare and beautiful.

---

## COLOR

### Background palette per scene (hex estimates)

Multiple distinct background "moods" — each reel commits to one or two of:

- **Near-black with warm radial vignette** (~#080608 → ~#1B0F10 in the warm center). Most common base. Used for hero/text slides across DYINSgWpzIe, DYV1hvkxP16, DYik8lSJW9x, DYOAxVOp2nu, DYtE2wkREAe. The vignette is **warm, not cool** — a subtle but huge mood difference vs pure `#000`.
- **Near-black with cool radial vignette** (~#070A10 → ~#0F1825). Used on tech/data scenes (DYV1hvkxP16 networks, DYTRgokx4lU code panels). Cool blue glow under code = the implicit "screen light" metaphor.
- **Parchment / warm cream** (~#EFE9DC, slightly textured). Used in DYTRgokx4lU and DYqgAYfRqBf as the entire reel base — completely inverts the standard palette for "documentation / editorial" topics.
- **Sage-green off-white** (~#E5EAD8) — DYnCz7upOOM. Even gentler than the parchment, with dark green primary text.
- **macOS Light editor white** (~#F4F1EB) — DYOAxVOp2nu f05 Kanban mockup, framed inside the dark base.

So: **at least 5 distinct background modes**, but always anchored by either near-black OR warm cream. Never pure white. Never pure black.

### Accent color discipline

The most striking finding: **most reels commit to ONE accent color, and stack with at most one secondary**. Examples:

- **Coral / salmon `#E89B7A`** — DYINSgWpzIe, DYV1hvkxP16, DYqgAYfRqBf, DX-pGXlxoq2. Used as: chip outline, hero serif italic, leading rule before tracked label, button fill (Kanban `COPY AS MARKDOWN` is the same coral).
- **Gold / amber `#D4A93B`** — DYtE2wkREAe. Entirely gold reel: gold serif italic numerals, gold underlines, gold chip outlines.
- **Yellow `#F5C400`** — DX-pGXlxoq2 (sub-accent for mono code highlight in dark editor), DYik8lSJW9x (`Stop` headline + accent dot).
- **Cyan `#5BC0E8` / electric blue `#3B82F6`** — used as a SECOND accent inside the coral reel (DYINSgWpzIe f03 `vector` chip is cyan, `comportamiento` is coral — diagrammatic contrast).
- **Indigo / periwinkle `#9A8FFF`** — DYV1hvkxP16 f05, full monochromatic indigo for the `FASES/SPECS/CONTEXT RESET` list.
- **Mint green `#7CE49A`** — DYik8lSJW9x f04 terminal success message `✓ Server 'github' added`. Syntax-highlight realism.
- **Red `#FF5757`** — DYV1hvkxP16 f01 `context rot` hero. The only red I observed at hero scale — used for the ONE negative concept (context rot = bad).

**Rule observed:** never more than 2 chromatic accents in the same slide. The other "accents" (cyan in terminal prompt, mint in success line) are always semantic — they signal success/state/category, not decoration.

### Text color hierarchy

- **Primary text on dark:** off-white **#F1ECE1** (warm white, NEVER pure `#FFFFFF`) — captions, hero sans, card body. The warmth ties it to the radial vignette.
- **Primary text on parchment:** very dark warm gray **#2E2A24** — used on DYTRgokx4lU and DYqgAYfRqBf parchment reels. Not pure black.
- **Secondary text on dark:** muted gray **#8B847A** (warm) or **#7A8190** (cool), depending on background mood.
- **Hero/accent text:** the reel's accent color (coral, gold, indigo, red).
- **Mono code chrome (tab labels, file paths):** desaturated `#8E96A1`, almost invisible — appropriately subordinate.

### Specific contrast wins / fails

- **Win — caption legibility:** off-white (#F1ECE1) on near-black (#0A080A) gives ~17:1 — passes WCAG AAA with massive headroom. They're not pushing contrast for legibility; they're using restraint elsewhere.
- **Win — semantic green for success:** `#7CE49A` on dark terminal hits ~10:1; reads as instantly "good outcome" without a label.
- **Soft fail (intentional aesthetic) — secondary cards:** in DYV1hvkxP16 f05, the supporting line "Trabajo dividido en pasos." on the dark card sits at maybe ~4.5:1. Passes AA for large text but uncomfortable for a reader scrolling. They prioritize tonality over maximum contrast.
- **Hard fail (artistic):** the AI-generated illustration in DYD15WYxhwb f01 has decorative serif italic labels `Constructor` and `Crítico` whose color is so close to the rendered scene's metallic gradient (~#A47F65 over #6E5040 backdrop) that contrast is roughly 1.8:1 — illegible. This is the only consistent fail I see. It's used decoratively, not as primary info, so it survives — but it's the weak spot in their system.
- **Win — coral outline glow on chips:** `5 tipos de hook` pill (coral outline on near-black) uses ~6:1 outline-to-bg, with the soft glow extending the perceived contrast. Beautiful execution.

### Brand vs decorative colors

- **Brand-stable across reels:** the off-white text color, the near-black/warm-cream background poles, the mono+sans+serif italic typeface trio.
- **Topic-variable:** the accent color rotates per reel/topic (coral for editorial, gold for metrics, indigo for process, red for problem). This is content-aware palette swapping — each reel feels distinct but inherits the same skeleton.

---

## TOP LESSONS WE SHOULD ADOPT

### Typography — top 3

1. **Adopt a 3-family system: geometric sans (Inter) + programmer mono (Fira Code or JetBrains Mono) + transitional serif italic (Playfair Display Italic or GT Sectra).** Our current stack is Inter-only across all 15 templates. Their work feels editorial precisely because the serif italic does the "this is a real idea, slow down" work, and mono signals "this is code/data." Three voices, three jobs. We're missing two of them.
2. **Use mono in MORE places than code blocks** — chip labels, status pills (`EDITANDO`), file breadcrumbs, taxonomic tags (`auto · proactive`, `Read · Grep · Glob`). It's the texture that ties their dev-tool brand together. We currently only use mono inside terminal scenes; we should push it into UI chrome.
3. **Establish a tracked-uppercase label convention at +200 letter-spacing for every section opener.** `CASO 05`, `INTENTO 1`, `HALLAZGO 03`, `EL FLUJO`, `SELECTED BRAND` — every secondary label uses the same treatment. We don't have an equivalent convention; adding one would instantly give our templates a consistent editorial spine.

### Color — top 3

1. **Replace pure `#000` with warm near-black + radial vignette (warm or cool per scene).** Our current dark base is closer to pure black; theirs is `#0A0608`-ish with a `#1B0F10` warm center. The vignette also acts as a soft spotlight on the hero text without any extra effect.
2. **Replace pure `#FFFFFF` text with warm off-white (~#F1ECE1).** Pure white on near-black is a Word-document tell; theirs feels like printed paper. One CSS variable swap, big mood lift.
3. **One accent per scene, swapped per topic — never decorate, always signal.** Their accent always means something: coral = editorial concept, gold = metric, indigo = process, red = problem, mint = success. Our `#D4AF37` Armando gold is currently used as universal decoration; we should restrict it to one semantic role and add 2–3 sibling accents for the others.

---

## FONT-STACK RECOMMENDATION

Our current stack: `Inter` across the board (per `brand/config.json` and CLAUDE.md). Their stack is meaningfully richer. Suggested upgrade for `brand/config.json`:

```css
--font-sans:    'Inter', system-ui, sans-serif;       /* body, UI — keep */
--font-display: 'Inter', system-ui, sans-serif;       /* hero sans   — keep, push to 900 */
--font-mono:    'Fira Code', 'JetBrains Mono', ui-monospace, monospace;  /* NEW: dev-tool chrome */
--font-serif:   'Playfair Display', 'GT Sectra', Georgia, serif;         /* NEW: editorial italic */
```

Both new fonts are free / open-source. Fira Code has programming ligatures (`→`, `=>`, `!=`) that ALREADY appear in carloscuamatzin's terminal scenes. Playfair Display has heavy italic weights with high stroke contrast that matches the `CRITERIO`/`CAUSAL` ball-terminal look. Drop both in `/public/fonts/` and wire via Remotion's `staticFile` + `@remotion/google-fonts`.

---

## PALETTE DISCIPLINE VERDICT

Carloscuamatzin's color system is the most disciplined of any creator we've studied so far in this wave: a fixed dark-or-cream backdrop pair, a fixed warm-off-white text color, and a SINGLE accent per reel that is always semantic rather than decorative. The illusion of variety comes entirely from rotating that single accent across topics (coral for editorial, gold for metrics, indigo for process, red for problems). Combined with the warm radial vignette and the disciplined three-family type stack, the result feels less like "Instagram content" and more like a dev-tooling brand microsite — high signal density without visual fatigue. We should copy the discipline before we copy any specific color: pick ONE accent per template and refuse to let it leak into adjacent elements.
