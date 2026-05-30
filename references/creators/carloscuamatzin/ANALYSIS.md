# @carloscuamatzin — visual + motion analysis

> **Scraped:** 2026-05-23 · 12 reels · durations 108–193s (1.8–3.2 min — longer-form than typical 60s Reels).
> **Niche match:** PERFECT — Spanish-language Claude / Claude Code / Anthropic content for builders. Direct peer to @armandointeligencia.
> **Tooling guess:** likely Remotion or HyperFrames (high typographic precision, consistent template families, no After Effects "swoosh" tells).

This is the highest-signal reference we have. He has clearly built a **template library** and routes each story to the right template — which is exactly the strategy we proposed in `docs/research/E-15-template-typology.md`.

---

## At least 5 distinct templates in active rotation

### 1. **Dark-paper / cosmic editorial** — opinion + comparison
*Example reel: `DYtE2wkREAe` ("Si el código se vuelve abundante")*

- **Bg:** pure black with a soft amber spotlight glow + subtle starfield particles for depth
- **Typography:**
  - Sans uppercase tracking-spaced labels (`ANTES`, `DESPUÉS`, `SEMANAS`)
  - Large serif italic for the emotional/hero text (`ingeniería + velocidad`, `lo humano decide`, `ideas → producto`)
  - Smaller serif italic captions (`días`)
  - Small sans body for supporting copy
- **Layout devices:**
  - Side-by-side ANTES / DESPUÉS bordered cards with mismatched accent (one neutral, one gold-bordered)
  - Horizontal timeline (`2010s • → AHORA`) with a circular node marker on the line
  - Bar-chart-style visual proxy (vertical bars under SEMANAS vs días) for time/quantity comparisons
- **Color accents:** warm gold (#D4AF37-adjacent) for the "future / desired state", neutral gray for the "before"
- **Caption strategy:** burned-in single-word centered emphasis (yellow italic for active emphasis vs muted gray for context)

**Replicates in our pipeline as:** `BeforeAfter` template (Stream E, Complexity 3) + the inverse of our cream-paper aesthetic — call it `DarkEditorial` variant.

### 2. **Cream-paper flowchart / mechanism diagram** — explainer (PURE MATCH FOR OUR EXISTING BRAND)
*Example reel: `DYqgAYfRqBf` ("Tu Claude se traba a mitad de las tareas grandes")*

- **Bg:** cream / warm-paper `#FAF7F2`-like — **identical to our brand palette**
- **Typography:**
  - Sans uppercase tracking-spaced section label (`EL FLUJO`)
  - Bold sans for node titles (`Escribes una función`, `Claude invoca al subagente`, `Reviewer lee y analiza`)
  - Monospace muted (`$ you`, `auto · proactive`, `Read · Grep · Glob`) for code-flavored sublabels
- **Layout devices:**
  - Three vertically stacked rounded-rectangle cards (white-on-cream with thin warm-red border)
  - Warm-red downward arrows connecting nodes (animated draw-on, presumably)
  - One card is "ghosted" with reduced opacity to indicate "not yet active" / "future step" state
- **Color accent:** single warm-red (`#B33A2A`-adjacent), exact match for our brand
- **Why it matters:** this is the `DiagramExplainer` from Stream E, executed beautifully. Our brand can do this *today* — we just need the composition.

**Replicates in our pipeline as:** the `DiagramExplainer` template (Stream E, Complexity 5) — but his version is simpler than my Sprint E spec, suggesting we can ship a v1 with just stacked cards + arrows + ghosted future state, not full graph layout.

### 3. **Dark scientific chart** — data viz / mechanism reveal
*Example reel: `DYINSgWpzIe` ("Anthropic encontró 171 patrones neuronales")*

- **Bg:** pure black + subtle radial vignette
- **Typography:**
  - Numbered step badge top-left (orange rounded square with white "1") — sequence indicator
  - Cyan/teal numeric readouts (`5.1 g`) for measured values
  - Sans uppercase axis labels (`ACTIVACIÓN VECTOR`, `DOSIS DE TYLENOL`, `DOSIS SEGURA`)
- **Layout devices:**
  - SVG line chart with 2 lines (one green = safe/normal, one red/pink = harmful/anomalous)
  - Dotted vertical rule at a specific x-coordinate marking the threshold
  - Inflection point marker (green dot on the safe line at the labeled x)
  - Drawn axes with discrete tick labels (`500mg`, `5g`, `10g`)
- **Color accents:** neon green + neon pink/red (signal vs noise / safe vs harmful), cyan for readouts

**Replicates in our pipeline as:** `ChartReveal` template (Stream E, Complexity 4) — exact match. Use stroke-dasharray animation on path, dotted-rule drop-in at inflection, label tick-marks via SVG.

### 4. **Dark stats reveal** — comparison / number hero
*Example reel: `DYV1hvkxP16` ("Si llevas tiempo con Claude Code, notaste que se vuelve mediocre")*

- **Bg:** pure black with two soft color-coded radial glows (left = warm orange-red, right = electric blue) anchoring two compared "camps"
- **Typography:**
  - Massive sans-serif numeric headline (`179K`) in glowing accent color
  - Sub-label sans uppercase tracking (`SUPERPOWERS`, `GSD`) in matching accent
  - Tiny italic serif tagline (`Get Shit Done`) for personality
  - Inline GitHub icon + sans label (`ESTRELLAS EN GITHUB`)
- **Layout devices:**
  - Two-column split with color-coded sides (orange-red vs blue)
  - Each column has a giant stat + a name + an icon + a metric description, stacked
- **Color accents:** warm orange-red (#FF6F4D-ish) + electric blue/violet (#5470FF-ish) — these are not Armando brand colors but very effective for "X vs Y" framing

**Replicates in our pipeline as:** `ComparisonTable` template (Stream E, Complexity 3) — but his version is more cinematic. Worth a brand variant with our warm-red + navy split.

### 5. **Annotated screen recording** — tutorial / how-to
*Example reel: `DX-pGXlxoq2` ("Configura Claude Code para que valide comandos peligrosos")*

- **Bg:** blurred ambient color background (extracted from screen recording or external photo)
- **Centerpiece:** a VS Code / terminal window screenshot or screen recording, framed mid-screen
- **Annotation layer:**
  - Small warm-amber rounded-rectangle outlines highlighting specific code lines (`"matcher": "Bash"`)
  - Side callout boxes pointing at the highlight (`← Filtra qué dis...`) — looks like a sticky-note arrow
- **Caption:** burned-in single-line at bottom (`un matcher y un comando listo`) — appears word-by-word with one word in warm-amber as active

**Replicates in our pipeline as:** `TutorialMicro` template (Stream E, Complexity 4) — match for the spec almost exactly. Use SVG overlays for callouts + outlines.

### 6. **Editorial illustration / collage** — opinion + abstract
*Example reel: `DYTRgokx4lU` ("Claude chantajeaba al 96% del tiempo")*

- **Bg:** soft cream paper with subtle texture
- **Centerpiece:** a hand-painted watercolor illustration in a wide rounded-rectangle card (figures with balance scales, splashes of warm-red watercolor) — feels like New Yorker or Wired editorial cover art
- **Typography:**
  - Sans uppercase tracking-spaced label (`INTENTO 2 · CONSEJOS DIFÍCILES`)
  - Huge serif italic for the central question (`el porqué`) with a thin warm-red underline
- **Color accent:** muted warm-red watercolor splashes (illustration) + thin warm-red underline (typography)

**Replicates in our pipeline as:** a new template `EditorialIllustration` not yet in Stream E — worth adding to the typology. We can generate the illustrations via Higgsfield (Nano Banana or GPT Image) and animate watercolor cards in with a parallax/scale-in.

---

## Cross-template patterns (the creator's "house style")

### Typography system (consistent across templates)
- **Sans (Inter or similar)** — uppercase tracking-spaced for section labels (`ANTES`, `EL FLUJO`, `INTENTO 2 · CONSEJOS DIFÍCILES`)
- **Serif italic (Fraunces-like or Tiempos/Recoleta)** — for emotional/hero copy (`el porqué`, `lo humano decide`, `ingeniería + velocidad`)
- **Mono (JetBrains Mono / IBM Plex Mono)** — for code-flavored content (`$ you`, `Read · Grep · Glob`, `auto · proactive`)
- **Sans body** — for explanatory copy

This is **exactly** the typography hierarchy in Bloomberg Businessweek / Pentagram editorial — the same one our motion-design typology recommended in `docs/research/A-motion-design-typology.md`.

### Color usage
- **Two palettes in active rotation:** (a) cream paper + warm-red accent (impeccable editorial — our brand), (b) pure black + warm amber accent (dark editorial — same vocabulary, inverted)
- **Occasional secondary accents:** electric blue, cyan, neon green/pink for charts and comparisons
- **One accent per scene** (he doesn't mix accents within a single screen) — discipline that we should adopt

### Motion strategy (inferred from frame samples)
- **Animation is restrained** — no decorative wiggle, no constant pulsing
- **Cards animate in with simple opacity + slight Y offset** (the standard editorial entrance)
- **Arrows draw with stroke-dasharray** (visible in the flowchart reel)
- **Numbers and labels appear via fade-and-rise** (typical sans label sequence)
- **No dependencies on cinematic transitions** — almost everything is a hard cut between cards, which keeps the pace

### Caption strategy
- **Burned-in word-by-word** with the active word in the accent color
- **Single line at bottom** (not multi-line pills like our current implementation)
- **Mono / sans for visible style** — feels like a teleprompter, not a TikTok subtitle

---

## What we replicate (priority for our 15-template build)

| Priority | Carlos pattern | Our template slot | Already specced? |
|---|---|---|---|
| 🔴 1 | Cream flowchart / arrow-connected cards | `DiagramExplainer` | Yes, Stream E #15 — simplify spec to his pattern |
| 🔴 1 | Annotated screen recording | `TutorialMicro` | Yes, Stream E #13 — almost exact match |
| 🟠 2 | Dark/light editorial duality (same vocabulary inverted) | NEW: `DarkEditorial` variant of every template | Not specced — add as palette mode |
| 🟠 2 | Color-coded "X vs Y" with radial glow camps | `ComparisonTable` | Yes, Stream E #9 — adopt the glowing camp visual |
| 🟢 3 | Scientific chart with anomaly inflection | `ChartReveal` | Yes, Stream E #14 |
| 🟢 3 | Watercolor / editorial illustration cards | NEW: `EditorialIllustration` | Not specced — add as template #16 |

## Caption-format finding (changes our caption strategy)

His captions are **single-line bottom-burn with monospace-ish sans**. Our current `EditorialCaption` uses a pill with warm-red left border and inline-flex wrapping at max-width 960px. His simpler approach reads better at thumb-scrolling speed.

**Proposed v3 caption renderer:** strip the pill background, single line at bottom 120px, max 4-5 words per window (not 6), accent-color active word. Add this as a `<TickerCaption>` variant per the Stream E plan.

## Hooks + scripting style (caption tone)

Sample first-3-seconds hooks (from caption files):
- "Si el código se vuelve abundante…"
- "Configura Claude Code para que valide comandos peligrosos"
- "Probablemente usas Claude al 10%"
- "Tu Claude no sabe qué pasa en tu GitHub, tu DB ni tu Slack"
- "Anthropic encontró 171 patrones neuronales"
- "Claude chantajeaba al 96% del tiempo en pruebas internas"

Pattern: **direct address ("tú"/"tu")** + **concrete problem framing** + **specific number when available**. Matches VOICE.md §5 (story spine) perfectly. We should treat his hook patterns as a corpus for future script-writing prompts.

## Sources for replication

- Frames per reel: `references/creators/carloscuamatzin/<shortcode>/frames/frame-NN-tXX.XXs.jpg`
- Original videos: `<shortcode>/video.mp4`
- Metadata + caption: `<shortcode>/metadata.json` (`description` field)

To re-scrape and refresh: `npm run scrape:reels -- carloscuamatzin --count 12 && npm run analyze:creator -- --handle carloscuamatzin`.
