# @carloscuamatzin — Vote V2: Visual Primitives Catalog

**Voter:** V2 of 5 (independent — no other voter outputs read)
**Scope:** Catalog every distinct VISUAL PRIMITIVE present across the corpus, decoupled from "templates". Each primitive is something that could become its own reusable React component or token.
**Frames sampled:** 30+ across all 12 reels (`DX-pGXlxoq2`, `DX0U2rZRBYY`, `DYD15WYxhwb`, `DYINSgWpzIe`, `DYOAxVOp2nu`, `DYTRgokx4lU`, `DYV1hvkxP16`, `DYik8lSJW9x`, `DYlJ6X2JFIN`, `DYnCz7upOOM`, `DYqgAYfRqBf`, `DYtE2wkREAe`).

Reusability score (1-5): 1 = one-off, 5 = ubiquitous across multiple reels & templates.

---

## 1. Logos / Brand Marks

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 1.1 | **Pixel-art Claude orange mascot** (chunky 8-bit head, orange ~#D97757) | `DX-pGXlxoq2/00`, `DYTRgokx4lU/07` (top-right), `DYlJ6X2JFIN/00` | Acts as Carlos's personal brand glyph. Sometimes centered & glowing, sometimes small as a corner watermark. | 5 |
| 1.2 | **`ANTHROP\C` faux-wordmark** (bold uppercase, kerned, with backslash replacing `I`) | `DYTRgokx4lU/00`, `DYINSgWpzIe` mid-frames | Used as a stylized brand reference on cream / dark backgrounds. Treated like a chip when shown in a card eyebrow. | 4 |
| 1.3 | **Real third-party product logos** (`Shopify` wordmark + green bag, `GitHub` octocat, `Postgres` elephant, `Slack` 4-color hash, `WhatsApp` glyph) | `DYnCz7upOOM/00`, `DYik8lSJW9x/01` | Always shown inside pill/chip containers (see 3.x). Color preserved. | 4 |
| 1.4 | **Claude flower / asterisk mark** (orange 8-petal) | `DYlJ6X2JFIN/00` | Used inline with text like "Proyectos · Claude". | 3 |
| 1.5 | **Apple-window traffic-light dots** (red/yellow/green ~22px) | `DX-pGXlxoq2/06`, `DYik8lSJW9x/04`, `DYTRgokx4lU/07`, `DYOAxVOp2nu/05` | Always paired with a fake macOS terminal/browser chrome. | 5 |

## 2. Chrome / Framing

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 2.1 | **Vignette glow (radial darken)** — center is ~10% brighter than the corners | Nearly every dark-bg frame (e.g. `DYV1hvkxP16/00`, `DYik8lSJW9x/00`) | Built into the background, not a separate layer; gives a "spotlight on stage" feel. | 5 |
| 2.2 | **Subtle scanline / CRT noise** (very low opacity horizontal striations) | `DYD15WYxhwb/04` (orange `PAGOS SIN ORDEN`), `DYV1hvkxP16/00` (`Superpowers`) | Adds analog grit; usually orange when warm, gray when neutral. | 3 |
| 2.3 | **Rounded card container** (~24px radius, 1px outline, dark fill) | `DX-pGXlxoq2/03` (5 rows), `DYV1hvkxP16/07` (Sígueme card), `DYINSgWpzIe/06` (MONITOREO bar) | The single most reused container shape. | 5 |
| 2.4 | **macOS terminal frame** (top bar with 3 dots + path tag, monospace body) | `DX-pGXlxoq2/06` (`task complete`), `DYik8lSJW9x/04` (`zsh — claude-code`), `DYOAxVOp2nu/05` (`claude.local/throwaway`), `DX0U2rZRBYY/03` (`claude code · /loop`), `DYINSgWpzIe/00` (Terminal `~/billing-service`) | Used 5+ times. Sometimes stacked (2 windows overlapping). | 5 |
| 2.5 | **macOS browser frame** (3 dots + URL bar showing `claude.local/throwaway-87a3.html`) | `DYOAxVOp2nu/05` | Variation of 2.4 used to host the Kanban board screenshot. | 4 |
| 2.6 | **CLAUDE.md "code editor" frame** (3 dots + filename tab + breadcrumb `src/.claude › CLAUDE.md`) | `DYTRgokx4lU/07` | Highly stylized variant of 2.4 for documents instead of shell. | 4 |
| 2.7 | **Horizontal divider rules** (thin desaturated lines bracketing a number) | `DYOAxVOp2nu/03` (`5 CASOS`) | Editorial "chapter slug" framing. | 3 |
| 2.8 | **Tilted/skewed card** (~5deg rotation, casting shadow) | `DYtE2wkREAe/06` (LEARN/BUILD/TEST quadrant) | Used for kinetic motion on serif-led layouts. | 2 |
| 2.9 | **Numbered bracket badge** (`HALLAZGO 03` in a thin-bordered rounded rectangle at top-left) | `DYINSgWpzIe/03` | Editorial chapter marker. | 4 |

## 3. Badges / Pills / Eyebrow Labels

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 3.1 | **Glowing rounded pill** (orange stroke + soft halo, dark fill, label like `5 tipos de hook` or `API open source`) | `DX-pGXlxoq2/03`, `DX0U2rZRBYY/03` | Section header pill. | 5 |
| 3.2 | **Circle-letter avatar** (orange outlined circle, single capital letter inside — `C`, `H`, `P`, `M`, `A`) | `DX-pGXlxoq2/03` | List-item bullet. | 4 |
| 3.3 | **Eyebrow label** (small, tracked, uppercase, low-contrast — `ANTHROPIC`, `AHORA`, `EL ESTÁNDAR`, `INTENTO 3 · DOCUMENTO CONSTITUCIONAL`) | `DYINSgWpzIe/06`, `DYik8lSJW9x/07`, `DYik8lSJW9x/01`, `DYTRgokx4lU/04` | Editorial-magazine vibe. Letter-spacing ~+200. | 5 |
| 3.4 | **Gradient pill** (multi-color horizontal blend — used on `parte 7` and `Model Context Protocol`) | `DYik8lSJW9x/07`, `DYik8lSJW9x/01` | Punches accent words. | 3 |
| 3.5 | **Cyan-outline mini chip** (label `vector`) and **salmon-outline mini chip** (label `comportamiento`) | `DYINSgWpzIe/03` | Used as inline "tags" next to a serif headline. | 3 |
| 3.6 | **Status pill with icon** (e.g. `✓ 01 LLM Proxy` rows on cream bg) | `DYnCz7upOOM/07` | Cream-background variant used in Shopify reel. | 4 |
| 3.7 | **CTA button (filled coral, white tracked uppercase)** — `COPY AS MARKDOWN` | `DYOAxVOp2nu/05` | Coral ~#E27D60. | 2 |
| 3.8 | **CTA link with arrow** — `LINK AL PAPER EN LA BIO ↗` | `DYTRgokx4lU/07` | Cream-bg CTA pattern. | 3 |
| 3.9 | **Counter chip top-left** (small monospace, e.g. `04`) | `DYD15WYxhwb/04` | Acts as a slide-number indicator. | 3 |

## 4. Typography

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 4.1 | **Geometric sans, heavy weight, slight condensed** (used for hero/heading) | `DYV1hvkxP16/00` `Superpowers`, `DYOAxVOp2nu/00` `EL EQUIPO DE CLAUDE CODE`, `DYqgAYfRqBf/07` `WORKFLOW` | Likely Inter Black or similar. | 5 |
| 4.2 | **Editorial serif** (high-contrast didone, italic and roman) — `CAUSAL`, `Síngueme`, `ingeniería + velocidad`, `ideas → producto`, `Model Context Protocol`, `producto`, `módulo` | `DYINSgWpzIe/03`, `DYik8lSJW9x/01`, `DYtE2wkREAe/03`, `DYtE2wkREAe/06` | Very consistent across the cream + dark "editorial" templates. | 5 |
| 4.3 | **Monospace code font** (used for terminal text, filenames, `command`, `http`, `prompt`, `mcp_tool`, `agent`, `.claude/agents/`) | `DX-pGXlxoq2/03`, `DYik8lSJW9x/04`, `DYqgAYfRqBf/02` | Looks like Fira Code / JetBrains Mono. | 5 |
| 4.4 | **Hand-set CAPS with tight tracking** (`PAGOS SIN ORDEN` with green+coral split) | `DYD15WYxhwb/04` | Two-color word treatment. | 3 |
| 4.5 | **Big single number** (huge sans `5`, `7`, italic `3`) | `DYOAxVOp2nu/03`, `DYnCz7upOOM/07`, `DYINSgWpzIe/03` | Always centered, supports a slug below. | 4 |
| 4.6 | **Subtitled caption underneath everything** (white sans, 2 lines max, centered, no background) | `DYD15WYxhwb/00`, `DYlJ6X2JFIN/03`, `DYV1hvkxP16/04` | The "Whisper caption" lane. | 5 |
| 4.7 | **Highlight-fill caption** (yellow text with black stroke, e.g. `Stop`) | `DX-pGXlxoq2/06` | Used to punch a single word. | 3 |
| 4.8 | **Two-color in-line word emphasis** (e.g. `razones` in coral inside an italic serif sentence) | `DYTRgokx4lU/07` | Drives attention to one keyword. | 4 |

## 5. Animation Primitives

| # | Primitive | Evidence | Notes | Reuse |
|---|-----------|----------|-------|-------|
| 5.1 | **Word-by-word typewriter reveal in monospace** | `DYik8lSJW9x/04` (terminal command), `DX0U2rZRBYY/03` (`/loop 10m /check-ocho-g`) | Implied by sequential frames; classic CLI typing. | 5 |
| 5.2 | **Fade-up text** (entry from below + opacity) | `DYlJ6X2JFIN/06`, `DYV1hvkxP16/07` | Default text entry. | 5 |
| 5.3 | **Punch-scale (140%→100%)** on big single words | `DYV1hvkxP16/00` `Superpowers`, `DYik8lSJW9x/01` `MCP` | Combined with glow halo. | 5 |
| 5.4 | **Glow pulse / breathing halo** behind hero text | `DYV1hvkxP16/00`, `DYINSgWpzIe/03` `CAUSAL` | Soft orange-to-cream radial pulse. | 5 |
| 5.5 | **Staggered list reveal** (each row in `5 tipos de hook` enters one beat after the previous) | `DX-pGXlxoq2/03`, `DYnCz7upOOM/07` (7 patterns) | Classic 80-150ms stagger. | 5 |
| 5.6 | **Counter/timeline animation** (dot sliding along an axis between `2010s` and `AHORA`) | `DYtE2wkREAe/03` | Bar fill on `días` happens in same beat. | 2 |
| 5.7 | **Card-tilt/scatter (Pinterest-style)** | `DYtE2wkREAe/06` | Cards rotated -5/0/+5 then settle. | 2 |
| 5.8 | **Beam / vertical scanline draw** (multi-color gradient line dropping from a logo down to a terminal) | `DX0U2rZRBYY/03` (WAHA → /loop terminal) | Connects two cards visually. | 2 |
| 5.9 | **Cross-word color flicker** (e.g. green `WAHA` glowing) | `DX0U2rZRBYY/03` | Subtle 1Hz glow loop. | 3 |

## 6. Transition Primitives

| # | Primitive | Evidence | Notes | Reuse |
|---|-----------|----------|-------|-------|
| 6.1 | **Hard cut between scenes** (no blend; every 3-5s) | Across all reels, e.g. `DYqgAYfRqBf` jumps from cream-blur to flowchart to `WORKFLOW` | The dominant transition. | 5 |
| 6.2 | **Motion-blur cross-dissolve** (cream/orange smear during scene swap) | `DYqgAYfRqBf/00`, `DYnCz7upOOM/00` (Shopify reveal) | Used when intro asset is large. | 4 |
| 6.3 | **Black-frame flash** (1-2 frames pure black between scenes) | `DYtE2wkREAe/00` (full black opener) | Acts like a shutter. | 3 |
| 6.4 | **Slide-in from right** (cards entering during reveals) | `DYINSgWpzIe/06` `MONITOREO` bar | Horizontal entry for editorial bars. | 3 |
| 6.5 | **Smear / horizontal swipe** (gold band sweeping across screen) | `DX-pGXlxoq2/00` mid-frame, `DYD15WYxhwb/00` | "Curtain" transition. | 3 |

## 7. Background Treatments

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 7.1 | **Solid near-black** (#0A0A0F-ish) with subtle radial gradient | `DYV1hvkxP16/00`, `DYik8lSJW9x/01`, `DYINSgWpzIe/06` | The primary background. | 5 |
| 7.2 | **Cream / off-white paper** (~#F1ECE2) | `DYTRgokx4lU/00`, `DYqgAYfRqBf/04`, `DYnCz7upOOM/07` | The editorial counterpart. | 5 |
| 7.3 | **Particle/star sprinkle** (small ~2px coral dots, low opacity, drifting) | `DYlJ6X2JFIN/03`, `DX-pGXlxoq2/06`, `DYtE2wkREAe/03` | Constellation feel. | 5 |
| 7.4 | **Animated gradient sky** (blue-to-brown vertical with horizontal silk ribbons) | `DYD15WYxhwb/00` | Used for the talking-head adjacent overlays. | 2 |
| 7.5 | **Soft cream noise** (very fine speckle on paper bg) | `DYTRgokx4lU/07`, `DYqgAYfRqBf/04` | Adds tactile texture. | 4 |
| 7.6 | **Black void with single light source** | `DYik8lSJW9x/00` `TU` | Pure dramatic spotlight. | 4 |

## 8. Color Usages (hex guesses)

| Role | Hex (guess) | Where |
|------|-------------|-------|
| Bg dark primary | `#0A0A10` | All dark-mode reels |
| Bg cream primary | `#F1ECE2` | `DYTRgokx4lU`, `DYqgAYfRqBf`, `DYnCz7upOOM` |
| Brand orange / coral | `#E27D60` / `#D97757` | Almost every accent (logo, glow, headings) |
| Editorial salmon | `#C97062` | `DYTRgokx4lU/07` body text |
| Highlight yellow | `#F5C518` | `Stop` callout, captions emphasis |
| Cyan accent | `#5FB9D9` | `vector` chip in `DYINSgWpzIe/03`, `transport: http` in terminal |
| Success green | `#3DA77D` / `#5BBA66` | `PAGOS` first word, Shopify checks, `Server 'github' added` |
| Magenta | `#C73E5E` | rarely — `Comenta`/`Like` icons on Sígueme card |
| Text white | `#FFFFFF` | captions, hero |
| Text near-black on cream | `#2A2A2A` | editorial body |

Palette = bicolor stage (dark navy-black OR warm cream) + a tight 5-color accent set (orange, cyan, green, yellow, salmon). Very consistent.

## 9. Caption Styles

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 9.1 | **Plain white sans, 2 lines, centered, no bg** | `DYD15WYxhwb/00`, `DYlJ6X2JFIN/03`, `DYV1hvkxP16/04` | Default Whisper caption. ~48px. | 5 |
| 9.2 | **Bold white sans w/ black outline + light shadow + per-word highlight** | `DX0U2rZRBYY/03` (`y para que se repita cada 10 minutos uso`), `DX0U2rZRBYY/05` (`ya estaban` highlighted) | TikTok-style emphasis. | 4 |
| 9.3 | **Italic body caption** (`Tu agente aprende razones, no comandos.`) — cream bg | `DYTRgokx4lU/07` | Editorial variant. | 3 |
| 9.4 | **Yellow-on-black callout word** | `DX-pGXlxoq2/06` `Stop` | One-word reaction caption. | 2 |
| 9.5 | **Faded next-word preview** (current word white, upcoming word ~30% opacity) | `DYV1hvkxP16/04` `Es como darle a Claude la disciplina de un equipo, pero sin _perder_` | Karaoke-style preview. | 3 |

## 10. Camera Shots

| # | Primitive | Frames | Notes | Reuse |
|---|-----------|--------|-------|-------|
| 10.1 | **Close-up vertical face-cam (handheld, slightly wide-angle, kitchen/loft background)** | `DX0U2rZRBYY/00` | Carlos talking direct-to-camera. Only 1 of 12 reels is talking-head dominant. | 2 |
| 10.2 | **Screen-recording of macOS terminal** (not a stylized terminal — actual capture) | None of the sampled frames purely — most "terminals" are styled (see 2.4). | The styled fake is preferred over true screen-rec. | 1 |
| 10.3 | **Static animated graphic (no camera)** | All other reels | The dominant "shot" is just animated UI on a stage. | 5 |
| 10.4 | **AI-illustration insert** (cartoon coder with laptop, framed image card) | `DYV1hvkxP16/04`, `DYTRgokx4lU/04` (ancient manuscript) | Used as a metaphor visual on dark bg. | 3 |
| 10.5 | **Phone mockup B-roll** (Android WhatsApp screen rendered as a device) | `DX0U2rZRBYY/05` | One-off but high-impact. | 2 |

---

## Top 10 components to formalize as reusable React components (prioritized)

Mapped to plausible names in our existing `src/components/` and `src/compositions/` structure.

1. 🔴 **`<MacWindow variant="terminal|browser|editor">`** — covers primitives 2.4, 2.5, 2.6 (traffic-light dots, title bar, monospace body, breadcrumb). Used in 5+ reels; *highest leverage single component*. Should accept `prompt`, `lines[]`, and a `typewriter` boolean.
2. 🔴 **`<GlowPill>`** — primitive 3.1 (orange-stroke rounded pill with soft halo). Section-header pill used everywhere; should accept `tone="brand|cyan|green|gradient"` to also cover 3.4 and 3.5.
3. 🔴 **`<EyebrowLabel>`** — primitive 3.3 (small, tracked, uppercase, low-contrast label). Universally present above hero blocks; trivial to build, used 5+ times.
4. 🔴 **`<CardContainer>`** — primitive 2.3 (rounded ~24px radius, 1px outline, dark or cream fill). The single shape that hosts almost every other element; expose `surface="dark|cream"` and `padding` tokens.
5. 🔴 **`<StaggeredList items={...}>`** — primitives 3.2 + 5.5 + 3.6 (circle-letter avatar OR check icon, label, optional description, staggered enter). Powers `5 tipos de hook`, `7 PATTERNS`, `01 MONITOREO` blocks.
6. 🟠 **`<HeroWord text glow tone>`** — primitives 4.1 + 5.3 + 5.4 (heavy sans hero word with punch-scale entrance + glow pulse). The signature opener move.
7. 🟠 **`<CaptionsTrack variant="plain|emphasis|preview">`** — primitives 9.1 + 9.2 + 9.5. Wrap our existing `Caption.tsx` so all three styles share one render path.
8. 🟠 **`<EditorialHeader number title slug>`** — primitives 2.7 + 4.5 (horizontal rules bracketing a big number with caption below). Drives `5 CASOS / DONDE HTML ROMPE A MARKDOWN`.
9. 🟢 **`<StageBackground tone="dark|cream" particles vignette scanlines>`** — primitives 2.1 + 7.1/7.2 + 7.3 + 2.2. One backplate component that toggles every background treatment.
10. 🟢 **`<BrandMascot variant="pixel|flower">`** + **`<BrandWordmark>`** — primitives 1.1, 1.2, 1.4. Currently our `BrandWatermark.tsx` exists; extend it to render Carlos-style mascot/wordmark when needed for reference comparisons.

**Bonus (would land below the top-10 cutoff):**
- 🟢 `<MetaCTA icons={["Sigue","Like","Comenta","Guarda"]}>` — primitive 3.7/3.8 plus the four-icon footer in `DYik8lSJW9x/07`.
- 🟢 `<TwoColorWord first second tone>` — primitive 4.4 for `PAGOS SIN ORDEN` style emphasis.
- 🟢 `<BeamConnector from to colors[]>` — primitive 5.8 for vertical color-beam between cards.

**Key insight:** Carlos's visual system is *not* 12 templates — it's ~5 background stages × ~10 reusable molecules (MacWindow, GlowPill, EyebrowLabel, CardContainer, StaggeredList, HeroWord, EditorialHeader, Captions, BrandMascot, MetaCTA). Building those 10 React primitives unlocks almost the entire corpus combinatorially.
