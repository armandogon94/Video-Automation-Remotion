# @carloscuamatzin — Templates Vote 1

**Voter:** V1 (Templates, independent)
**Frames sampled:** 17 frames across 8 of 12 shortcode folders (DX-pGXlxoq2, DX0U2rZRBYY, DYD15WYxhwb, DYINSgWpzIe, DYOAxVOp2nu, DYTRgokx4lU, DYV1hvkxP16, DYik8lSJW9x, DYlJ6X2JFIN, DYnCz7upOOM, DYqgAYfRqBf, DYtE2wkREAe).
**Creator overview:** Spanish-language AI-engineering content (Claude Code, Anthropic, MCP, Shopify case studies). Vertical 9:16, ~110–193s, dark-first palette but with two recurring alt-palettes (cream/light, gold-on-black). Heavy use of typographic chapters, kinetic text, fake terminal/IDE chrome, info-design cards.

---

## Global brand grammar (used across all templates)

- **Vignette/radial glow** behind almost every dark scene (subtle red/orange ambient ellipse).
- **Pixel mascot** (small orange pixel-art character) used as logo glyph in hooks & outros (HIGH).
- **Two captioning tracks at once** in many videos: an in-design label/quote (top) AND TikTok-style burned subtitles (bottom). The bottom captions are the auto-burned style; the upper text is layout-locked design copy. (HIGH)
- **Chapter/section indicators:** small bracketed number like `01`, `04`, or hand-script `1`/`O1` in top-left as item counter (MED).
- **Two palette modes** that toggle per topic: (a) dark navy + orange/yellow/pink accents (default), (b) cream/off-white + sage green/coral (used for Anthropic/Shopify reference videos — DYTRgokx4lU, DYnCz7upOOM, DYqgAYfRqBf), (c) black + gold serif (DYtE2wkREAe brand strategy piece).
- **Serif italic** (Playfair/Tiempos-like) for emphasis words mixed with sans-serif body — signature "essay" typography move.

---

## Distinct templates identified (17 total)

### T1. Pixel-Mascot Intro Tag — HIGH
- **Reels:** DX-pGXlxoq2 (frame 0), DYOAxVOp2nu (outro frame 7)
- **Structure:** Dark BG, pixel-art mascot centered top, faint animated lens-flare wave at midpoint, no text.
- **Motion:** Mascot drops in, sinusoidal yellow wave sweeps L→R behind.
- **Maps to:** No close match. Closest in our typology: `AnimatedText9x16` for brand stinger but ours has no mascot.
- **Sprint priority:** 🟢 (brand-specific; low transferability without our own mascot)

### T2. Big Headline Hook Card — HIGH
- **Reels:** DYOAxVOp2nu (frame 0 "EL EQUIPO DE CLAUDE CODE"), DYV1hvkxP16 (frame 0 "Superpowers" orange glow), DYtE2wkREAe (frame 2 "era reallocation")
- **Structure:** Centered bold title over dark vignette. Single line or two-line subtitle. Often a glowing accent word.
- **Motion:** Text fade-in with blur-clear; sometimes underline sweep.
- **Maps to:** `AnimatedText9x16` — close match. Needs a "glow accent word" variant.
- **Sprint priority:** 🔴 (universal hook; we already have base, need glow accent)

### T3. Selfie Talking-Head Cutaway — HIGH
- **Reels:** DX0U2rZRBYY (frame 0)
- **Structure:** Full-bleed handheld selfie video of Carlos, no overlays during talking-head moments. Brief b-roll-style cutaways from other content.
- **Motion:** Native phone capture (slight shake).
- **Maps to:** `TalkingHeadDynamic9x16` — direct match.
- **Sprint priority:** 🔴 (need this for Armando)

### T4. Photo/Video B-Roll With Caption — MED
- **Reels:** DX0U2rZRBYY (frame 6 — basketball arena overlay with caption "pero llegué primero")
- **Structure:** Full-screen photo (stadium), burned caption only.
- **Motion:** Slight Ken Burns zoom likely.
- **Maps to:** No close match. Could be a new `BRollPhoto9x16` template.
- **Sprint priority:** 🟠

### T5. Code Editor Mockup w/ Annotations (VS Code style) — HIGH
- **Reels:** DX-pGXlxoq2 (frame 2 — settings.json with arrow label), DX0U2rZRBYY (frame 4 — check.sh script)
- **Structure:** Faux VS Code window (tabs, breadcrumb, line numbers, syntax highlighting), one line highlighted with an animated outlined box, side-arrow label ("← Filtra qué dis…"), blurry desk background visible behind.
- **Motion:** Box draws around target line; arrow + label slide in from right; lines may type in.
- **Maps to:** New — does NOT match our existing `TerminalCommand9x16` (which is plain terminal). Propose **`CodeEditorAnnotated9x16`**.
- **Sprint priority:** 🔴 (extremely high reuse for dev content; missing in our stack)

### T6. Terminal Card (single window, monospace) — HIGH
- **Reels:** DX-pGXlxoq2 (frame 4 — PreToolUse blocked command), DX0U2rZRBYY (frame 2 — `$ ag`), DYD15WYxhwb (frame 2 — codex install session), DYik8lSJW9x (frame 4 — claude mcp add), DYINSgWpzIe (frame 0 — empty terminal, frame 5 — solving-impossible-test)
- **Structure:** macOS-style window chrome (3 traffic lights, title bar), monospace output, color highlights (green/cyan/red), often section heading above ("PreToolUse"/"Stop") with yellow underline.
- **Motion:** Lines type sequentially; result line flashes/highlights; sometimes a second stacked window slides in over the first.
- **Maps to:** `TerminalCommand9x16` — direct match. Needs section-heading + yellow-underline variant + stacked-windows variant.
- **Sprint priority:** 🔴 (we have base; extend with stacked + heading variants)

### T7. Stacked Terminal Windows (cascading) — MED
- **Reels:** DX-pGXlxoq2 (frame 6 — two terminals overlapping, "Stop" heading)
- **Structure:** Two faux terminal windows offset diagonally, the back one dimmer, both show different sessions; serif italic caption below.
- **Motion:** Second window slides in/up over the first.
- **Maps to:** Extension of `TerminalCommand9x16`. Could be its own `TerminalStack9x16`.
- **Sprint priority:** 🟠

### T8. Code Diff (Before/After Vertical) — HIGH
- **Reels:** DYik8lSJW9x (frame 6 — `agent.ts` Antes/Después blocks)
- **Structure:** Two code editor cards stacked vertically with red "Antes" / green "Después" pill badges, line-by-line diff coloring (red strikeout, green new), connecting down-arrow between them, accent chip below.
- **Motion:** Top card crossfades to bottom; arrow scrolls; pill chip pops in.
- **Maps to:** New — propose **`CodeDiffBeforeAfter9x16`**.
- **Sprint priority:** 🔴 (huge for tutorial content)

### T9. Markdown/Spec Editor Mockup w/ Status Badge — MED
- **Reels:** DYlJ6X2JFIN (frame 2 — "instrucciones · Mi Proyecto" with EDITANDO badge)
- **Structure:** Dark editor window styled as markdown source (orange `#` headings, green `##` headings), file-tab header w/ status pill ("● EDITANDO" red).
- **Motion:** Content types in; badge pulses.
- **Maps to:** Variant of code-editor. Propose **`MarkdownEditor9x16`** or fold into T5.
- **Sprint priority:** 🟠

### T10. Numbered Listicle Card Strip (Big-Card variant) — HIGH
- **Reels:** DYINSgWpzIe (frame 6 — "01 MONITOREO"), DYnCz7upOOM (frame 7 — "7 PATTERNS COPIABLES" stack)
- **Structure:** Horizontal "chapter card" with number tag (serif italic `01`), bold ALL-CAPS title, subtitle line, right-aligned icon (eye/check), thin outline border. In recap mode, 7 stacked rows w/ green check badges.
- **Motion:** Cards slide in from right; number flips.
- **Maps to:** Sits between `LayerCardStack9x16` and a chapter card. Propose **`ListicleCardStack9x16`** (extends existing) — supports both single-item-on-screen and recap-stack modes.
- **Sprint priority:** 🔴 (workhorse for listicle videos)

### T11. Pill/Chip Stack (vertical labeled tags) — MED
- **Reels:** DYD15WYxhwb (frame 6 — auth/billing/migraciones/refactors rounded pills with colored borders)
- **Structure:** 3–5 vertically stacked rounded-pill containers, each with a colored outline (teal/pink/orange/purple cycling), single short word inside.
- **Motion:** Pills pop in sequentially; outline glows.
- **Maps to:** No direct match. Propose **`TagPillStack9x16`**.
- **Sprint priority:** 🟠

### T12. Numbered Glass List Card — MED
- **Reels:** DYV1hvkxP16 (frame 6 — "BUENO PARA: 01 Proyectos largos / 02 Sesiones de horas")
- **Structure:** Single rounded glass card panel (subtle border, transparency over BG glow), eyebrow label, 2–3 numbered list items with small purple number-square badges.
- **Motion:** Card scales in; items typewriter.
- **Maps to:** Variant of T10 but as a single contained panel. Could be `LayerCardStack9x16` mode.
- **Sprint priority:** 🟢 (covered by T10 extension)

### T13. Icon Card Grid (3×2 mini-cards) — HIGH
- **Reels:** DYOAxVOp2nu (frame 2 — TABLAS / CSS / SVG / CÓDIGO / SLIDERS, each with mini-icon + label + subtitle)
- **Structure:** Top eyebrow line "LO QUE HTML TE DA…", 5 small dark cards in 3+2 grid, each card: top orange accent stripe, centered glyph illustration, bold caps label, faded subtitle.
- **Motion:** Cards stagger in; orange stripe sweeps.
- **Maps to:** No match. Propose **`IconCardGrid9x16`** (~2×3 or 3×2 capability comparison).
- **Sprint priority:** 🔴 (great for feature-comparison content)

### T14. Big-Number Comparison Split (2 columns) — HIGH
- **Reels:** DYV1hvkxP16 (frame 2 — 179K SUPERPOWERS vs GSD)
- **Structure:** Two huge stat columns side-by-side, each with: massive colored number (orange left, blue right), title caps, italic tagline, source icon ("estrellas en github" + octocat).
- **Motion:** Numbers count up simultaneously; columns wipe in from opposite sides.
- **Maps to:** Close to `BigNumberHero9x16` but ours is single-stat. Propose **`BigNumberDuel9x16`** (split-comparison).
- **Sprint priority:** 🔴

### T15. Big-Number Hero Single (neon callout) — HIGH
- **Reels:** DYOAxVOp2nu (frame 6 — "1M" stacked over "REALMENTE LEE" neon green)
- **Structure:** Single huge metric center-screen with a neon highlight bar below as the punchline.
- **Maps to:** `BigNumberHero9x16` — direct match.
- **Sprint priority:** 🔴 (already in stack)

### T16. Animated Line Chart w/ Two Series + Annotation — HIGH
- **Reels:** DYINSgWpzIe (frame 2 — green vs pink curves "ACTIVACIÓN VECTOR vs DOSIS DE TYLENOL", frame 4 — pink line chart with peak callout "considera trampa")
- **Structure:** XY chart with axes labels, 1–2 animated lines, key data point dots with attached annotation labels, value readout in top-right (cyan), big underlying text behind chart (semi-transparent).
- **Motion:** Lines draw with stroke-dashoffset; dots ping; value counter updates.
- **Maps to:** Closest is `Sparkline9x16` but we need bigger chart with full axes and annotations. Propose **`LineChartAnnotated9x16`**.
- **Sprint priority:** 🔴

### T17. Horizontal Bar Chart w/ Percent Labels — MED
- **Reels:** DYnCz7upOOM (frame 5 — "2024 EJECUCIÓN 70% / ESTRATEGIA 30%" cream palette)
- **Structure:** Big year label center, then 2–4 labeled horizontal bars, each with left label / right percent / animated fill width.
- **Motion:** Bars grow L→R staggered; percent numbers count up.
- **Maps to:** `BenchmarkBars9x16` — direct match. Needs cream palette variant.
- **Sprint priority:** 🔴 (already in stack)

### T18. Vertical Pipeline / Flow Diagram — HIGH
- **Reels:** DYqgAYfRqBf (frame 4 — implementation-agent → code-reviewer → debugger, cream palette)
- **Structure:** 3+ white rounded cards stacked vertically with monospace title in coral + body line, connected by big coral arrows pointing down, footer label "TRES AGENTES · UN PIPELINE".
- **Motion:** Each card slides in then arrow extends down to next.
- **Maps to:** Closest is `DiagramExplainer9x16` but we need a dedicated vertical-flow variant. Propose **`PipelineFlow9x16`**.
- **Sprint priority:** 🔴

### T19. Option-Card Choice Pair — MED
- **Reels:** DYqgAYfRqBf (frame 2 — `.claude/agents/` vs `~/.claude/agents/` with icon badges, cream palette)
- **Structure:** Question label, then 2 horizontal cards stacked, each with: left icon badge ({} or ~/), small caps eyebrow (PROYECTO/GLOBAL) + monospace path.
- **Motion:** Question types in; cards slide in alternating left/right.
- **Maps to:** No match. Propose **`OptionCompare9x16`**.
- **Sprint priority:** 🟠

### T20. Question→Answer Flow Card — MED
- **Reels:** DYik8lSJW9x (frame 2 — Spanish question above, SQL answer below, with big downward arrow between)
- **Structure:** Top brand glyph + capability heading. Two outlined content boxes vertically stacked with a cyan ↓ arrow between, labeled "tú →" and "Claude →".
- **Motion:** Top box types; arrow appears; bottom box renders.
- **Maps to:** No direct match. Propose **`QnAFlow9x16`** or as variant of `TerminalCommand9x16`.
- **Sprint priority:** 🟠

### T21. Anti-Pattern Card (crossed-out warning) — MED
- **Reels:** DYqgAYfRqBf (frame 6 — "ANTI-PATRÓN" with X across "Tareas chiquitas" card showing bar overhead)
- **Structure:** Eyebrow caps "ANTI-PATRÓN" in red, a smaller info card with mini bars/data, a big red diagonal X stroke across the whole card, caption below with "overhead" highlighted red.
- **Motion:** X strokes in from corner to corner.
- **Maps to:** No match. Propose **`AntiPatternCard9x16`** (could be variant decoration on other templates).
- **Sprint priority:** 🟠

### T22. Hand-Drawn Illustration Diagram (cream/sketch) — HIGH
- **Reels:** DYTRgokx4lU (frame 2 — sketchbook drawing of cards flowing into a sphere, frame 4 — illuminated manuscript book), DYV1hvkxP16 (frame 4 — cartoon programmer)
- **Structure:** Centered AI-generated illustration in pencil/watercolor or cartoon style, top eyebrow chapter label, optional content list below.
- **Motion:** Image fades/zooms in; chapter label crossfades.
- **Maps to:** No match — this is creator-curated AI art per concept. Propose **`IllustratedConcept9x16`** (image slot + chapter title pattern).
- **Sprint priority:** 🟢 (high content cost, requires custom image gen per script; low template-engine ROI but template the layout)

### T23. Kinetic Typography Essay (REGLAS vs CRITERIO) — HIGH
- **Reels:** DYTRgokx4lU (frame 6 — strike-through REGLAS with glowing serif CRITERIO + multi-line italic essay), DYlJ6X2JFIN (frame 4 — "Deja de asumir / Construye sobre lo correcto"), DYtE2wkREAe (frame 2 — "no era productividad; era reallocation")
- **Structure:** Multi-line typographic composition mixing serif italic + sans bold, color-accent words (orange/yellow), strike-through, "vs" separators. No imagery.
- **Motion:** Word-by-word reveal with selective color/scale emphasis; strike line draws.
- **Maps to:** `AnimatedText9x16` could cover BASIC version, but Carlos's compositions are multi-line essays with mixed weights/styles. Propose **`KineticEssay9x16`**.
- **Sprint priority:** 🔴 (defining grammar; very copyable)

### T24. Stat-Block Quadrant Cards (floating) — LOW
- **Reels:** DYtE2wkREAe (frame 6 — 3 floating dark cards "producto/línea/módulo" with italic monospace + LEARN/BUILD/TEST labels arranged on grid)
- **Structure:** Multiple small dark glass cards floating in offset positions around a central vertical divider, each card has serif italic noun + sans verb, label badges (LEARN/BUILD/TEST) anchored on grid axis.
- **Motion:** Cards drift in from edges; central golden phrase fades through.
- **Maps to:** No direct match. Heavily bespoke. Propose **`QuadrantConcepts9x16`** but low reuse.
- **Sprint priority:** 🟢

### T25. Selected-Product Visualization (faded grid + highlight) — LOW
- **Reels:** DYtE2wkREAe (frame 4 — Northstar product card highlighted in gold, faded competitor grid behind, stat stack on left)
- **Structure:** Background grid of dimmed product cards; one card popped forward with gold border; stat list ("ATENCIÓN 3% / CONFIANZA 1.4% / RECUERDO 0.8%") on left; descriptor panel bottom-right.
- **Motion:** Camera pulls focus to highlighted card; stats count down.
- **Maps to:** No match. Highly bespoke. Propose `MarketCompare9x16`.
- **Sprint priority:** 🟢

### T26. Letterbox Brand Wordmark Intro (cream) — MED
- **Reels:** DYTRgokx4lU (frame 0 — "ANTHROPIC" wordmark on cream), DYnCz7upOOM (frame 0 — Shopify logo on cream)
- **Structure:** Cream/off-white BG with single brand wordmark + small caps tagline. Empty space.
- **Motion:** Fade-in only, very minimal.
- **Maps to:** `AnimatedText9x16` variant.
- **Sprint priority:** 🟠

### T27. Recap Card with Numbered Timeline (28 → 5 → ∞) — MED
- **Reels:** DX-pGXlxoq2 (frame 7 — three numbers with arrows + italic serif aphorism + small mascot CTA)
- **Structure:** Three big numbers strung on a horizontal axis joined by arrows, serif italic moral line below the axis, small mascot + CTA at bottom.
- **Motion:** Numbers fade in left→right; arrows draw.
- **Maps to:** No direct match. Hybrid of `AnimatedCounter9x16` + outro CTA. Propose **`NumberTimelineOutro9x16`**.
- **Sprint priority:** 🟠

### T28. Outro CTA Card — HIGH
- **Reels:** DYOAxVOp2nu (frame 7 — "SÍGUEME / PARA MÁS OPINIONES TÉCNICAS / SOBRE CLAUDE CODE."), DYINSgWpzIe (frame 7 — handle pill card with "RESEARCH APLICABLE CADA SEMANA")
- **Structure:** Brand mark top, big "SÍGUEME" or "FOLLOW" word, small caps reason line, accented final clause (orange CLAUDE CODE), @handle bottom.
- **Motion:** Stagger reveal, mascot bobs.
- **Maps to:** No direct match. Propose **`OutroFollowCTA9x16`**.
- **Sprint priority:** 🔴 (every video needs one)

---

## Summary template inventory

| # | Template (proposed) | Existing match? | Priority | Confidence |
|---|---|---|---|---|
| T1 | PixelMascotIntro | none | 🟢 | HIGH |
| T2 | BigHeadlineHook (glow accent) | extend AnimatedText9x16 | 🔴 | HIGH |
| T3 | TalkingHeadSelfie | TalkingHeadDynamic9x16 | 🔴 | HIGH |
| T4 | BRollPhotoCaption | none | 🟠 | MED |
| T5 | CodeEditorAnnotated9x16 | none (≠ TerminalCommand) | 🔴 | HIGH |
| T6 | TerminalCommand (heading+underline) | TerminalCommand9x16 (extend) | 🔴 | HIGH |
| T7 | TerminalStack (cascading windows) | extend T6 | 🟠 | MED |
| T8 | CodeDiffBeforeAfter9x16 | none | 🔴 | HIGH |
| T9 | MarkdownEditor9x16 | variant of T5 | 🟠 | MED |
| T10 | ListicleCardStack9x16 | near LayerCardStack9x16 | 🔴 | HIGH |
| T11 | TagPillStack9x16 | none | 🟠 | MED |
| T12 | NumberedGlassList | covered by T10 ext | 🟢 | MED |
| T13 | IconCardGrid9x16 | none | 🔴 | HIGH |
| T14 | BigNumberDuel9x16 | extend BigNumberHero9x16 | 🔴 | HIGH |
| T15 | BigNumberHero9x16 | direct match | 🔴 | HIGH |
| T16 | LineChartAnnotated9x16 | near Sparkline9x16 | 🔴 | HIGH |
| T17 | BenchmarkBars9x16 (cream variant) | direct match | 🔴 | HIGH |
| T18 | PipelineFlow9x16 | near DiagramExplainer9x16 | 🔴 | HIGH |
| T19 | OptionCompare9x16 | none | 🟠 | MED |
| T20 | QnAFlow9x16 | none | 🟠 | MED |
| T21 | AntiPatternCard9x16 | none (decoration) | 🟠 | MED |
| T22 | IllustratedConcept9x16 | none | 🟢 | HIGH |
| T23 | KineticEssay9x16 | extends AnimatedText9x16 | 🔴 | HIGH |
| T24 | QuadrantConcepts9x16 | none (bespoke) | 🟢 | LOW |
| T25 | MarketCompare9x16 | none (bespoke) | 🟢 | LOW |
| T26 | BrandWordmarkIntro | variant AnimatedText9x16 | 🟠 | MED |
| T27 | NumberTimelineOutro9x16 | extend AnimatedCounter9x16 | 🟠 | MED |
| T28 | OutroFollowCTA9x16 | none | 🔴 | HIGH |

---

## Build priorities — Sprint recommendation

**🔴 Build now (10 templates — these power 80% of Carlos's content):**
1. `CodeEditorAnnotated9x16` (T5) — VS Code chrome + annotation arrow
2. `TerminalCommand9x16` extensions (T6, T7) — section-heading variant + stacked-windows variant
3. `CodeDiffBeforeAfter9x16` (T8) — twin code cards, diff coloring, connector arrow
4. `ListicleCardStack9x16` (T10) — single-item + recap-stack modes
5. `IconCardGrid9x16` (T13) — 3×2 capability comparison
6. `BigNumberDuel9x16` (T14) — split-comparison stats with brand logos
7. `LineChartAnnotated9x16` (T16) — XY chart w/ annotations & value readout
8. `PipelineFlow9x16` (T18) — vertical cards-with-arrows flow
9. `KineticEssay9x16` (T23) — multi-line serif/sans typography w/ accent words & strikethrough
10. `OutroFollowCTA9x16` (T28) — branded follow card with handle + tagline

**🟠 Build later (8 templates):** T4, T7 (if not folded), T9, T11, T19, T20, T21, T26, T27

**🟢 Skip / brand-bespoke (5):** T1, T12 (folded), T22 (image cost), T24, T25

---

## Notable mismatch / corrections vs our typology

- Our `TerminalCommand9x16` is the workhorse but lacks (a) section-heading + yellow-underline overlay, (b) cascading-window mode. Both are constant in Carlos's work.
- Our `BigNumberHero9x16` is single-stat; Carlos's dominant variant is the **duel** (T14). Highest-leverage missing template.
- Our `DiagramExplainer9x16` does not appear to cover vertical-flow-with-arrows (T18) which is one of his signature info-design moves. Either extend it or fork.
- We have NO **code-editor-annotated** template (T5). Given the dev audience overlap with Armando, this is the single biggest gap.
- We have NO **kinetic typography essay** template (T23). This is arguably his most copyable "look" because it's all type, no assets.
- `AnimatedText9x16` is probably overloaded — we may want to split it into Hook/Statement/Essay/CTA sub-templates to match Carlos's clear separation.
