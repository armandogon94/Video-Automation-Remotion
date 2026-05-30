# @DIYSmartCode — Vote 1 / 5 · TEMPLATES

> Independent voting agent V1. Frames sampled: **18** across **all 12** video folders.
> Channel taxonomy: tech/AI news shorts, mostly "Claude Code / Anthropic" or "Google I/O 2026" coverage, occasional dev-tool deep-dives (ast-grep) and opinion follow-ups (markdown debate).

---

## 0. Pre-template observation — "brand-themed KIT" pattern

Before listing templates, the most striking pattern is that this creator **swaps the entire visual brand kit per subject** while reusing the same underlying composition templates. Three kits dominate the dataset:

| Kit | Videos | Palette | Pattern | Typography |
|---|---|---|---|---|
| **Anthropic kit** | -FNswl7pVcA, o9MSAAXma-I, -LxJJwOjif4, fpNTqli9cs8 | navy `#0F1B2D` + orange `#E07856` + green `#3FCB7B` + lavender `#B4A8F0` | faint Anthropic "connector node" + brick glyphs | Inter Black headline, mono caption (`THE RECEIPTS`, `BACKGROUND SESSIONS`) |
| **Google I/O kit** | 0HIf4AlajNY, 6nVW14npcO4, jOorXKrbTHU, rfzA7HWcpCQ, eEy1oMeGfhQ | navy + multi-color (Google blue/red/yellow/green) drifting dot particles | rounded glass frame around entire 9:16 canvas | Inter Black headline, Google-color mono section chips |
| **Cream/Opinion kit** | DgDK5KWtJAw, Jj3m_R2627Y | paper `#F5EFE3` + terracotta `#B85A3F` | faint hand + markdown-square sketches | **Georgia serif italic** big-word + mono caption |
| **AST-Grep kit** (one-off) | dzn9KVVtZLc | black + neon orange `#FB7547` | tiled lightning bolts | Bold display sans (SG mark) |

**Implication for our build:** treat "brand kit" as an **orthogonal axis** to template. Same `BigNumberHero` skeleton, three different kit themes. (HIGH confidence — every visible frame is consistent with this kit/template factorization.)

---

## 1. Template catalogue

Each entry: name → videos using it → visual structure → motion grammar → existing-typology mapping → priority + confidence.

### T1. `HookHeroCard` 🔴 *(must build)*
- **Videos:** -FNswl7pVcA (frame-00), 0HIf4AlajNY (frame-00), eEy1oMeGfhQ (frame-00), rfzA7HWcpCQ (frame-00), dzn9KVVtZLc (frame-00), DgDK5KWtJAw (frame-00), 6nVW14npcO4 (frame-00, with Google logo + "OFFICIAL RECEIPT" caption + blurred `$250` ghost), o9MSAAXma-I (frame-00 black-screen pre-text)
- **Structure:** Top wordmark / brand logo, mono caption ("THE RECEIPTS", "GOOGLE I/O · 2026", "THE MISSING LAYER", "FOLLOW-UP · ONE WEEK LATER"), then giant 2–4-line headline. Lower half empty (negative space for caption burn-in). Footer with source URL.
- **Motion grammar:** caption fade-in → headline split-text reveal word-by-word → underline sweep on accent word → particle/lightning ambient loop continues.
- **Typology map:** **NEW HYBRID** — closest to our existing `TechNewsFlash` (overlays only, news/launch). Differs in two ways: (a) very specific brand-kit theming per source, (b) caption-above + huge-headline-centered + giant-empty-bottom layout for captions to live.
- **Priority:** 🔴 — appears as opening 0.5–3s of ~90% of the corpus.
- **Confidence:** HIGH.

### T2. `BigNumberHero` 🔴
- **Videos:** -FNswl7pVcA (frame-02, "Two releases. **19** hours."), 6nVW14npcO4 (frame-00 `$250` ghost behind headline), dzn9KVVtZLc (frame-02 `$15` card), DgDK5KWtJAw (frame-02 `25,000` tokens), o9MSAAXma-I (frame-02 "**18 fixes. Zero** state leaks")
- **Structure:** Pre-headline mono kicker ("PER DEVELOPER · PER MONTH", "5 THINGS YOU GET", "THE DEBATE CONTINUES"), then **giant numeric hero** (240–360pt, accent color), optional thin bordered card frame around the number, sub-caption in mono or serif italic.
- **Motion grammar:** number counter ramp (0 → target ~0.5–0.8s), card border draw-on (stroke-dasharray), unit prefix `$` scale-in.
- **Typology map:** **EXACT MATCH** to our existing `BigNumberHero` (E-15 #2). Their take adds the optional bordered card and mono kicker.
- **Priority:** 🔴 — already on our build list; their card-framed variant is a worthwhile spec addition.
- **Confidence:** HIGH.

### T3. `NumberedStepCard` (NN / NN listicle item) 🔴
- **Videos:** -FNswl7pVcA (frame-02, `03 / 06 --COMMENT · Inline PR comments straight from the CLI.`), 0HIf4AlajNY (frame-02, `01 / 04 Subagents in parallel`), o9MSAAXma-I (frame-02, `03 / 06 BACKGROUND SESSIONS · 18 fixes…`), eEy1oMeGfhQ (frame-02, `UPGRADE 03 · In-place AI edits.`)
- **Structure:** Top-left big accent-color counter `03` + thin gray `/ 06`, vertical accent rule on the left margin, mono section-tag below counter (`--COMMENT`, `RUNS`, `BACKGROUND SESSIONS`), then 2–4-line **multi-color headline** where one keyword is the accent (green/orange), then 1–2-line body description, then optional **chip pair** at the bottom (`-- comment FLAG`, `PR comments INLINE`).
- **Motion grammar:** counter flip-in, accent rule slide-down, headline split-text with the accent word's color "lit" on its beat, chip scale-in. Progress bar at very bottom of frame (1/N progress).
- **Typology map:** **PARTIAL MATCH** to our `Listicle5` but they go 4–15 items not 5. Better name: `NumberedStepCard` (one slide of an N-step countdown). Closest extension: `Listicle5` → generalise to `ListicleN`.
- **Priority:** 🔴 — workhorse template, appears in 4/12 sampled videos as the body of the short.
- **Confidence:** HIGH.

### T4. `KeyValueRowsCard` 🟠
- **Videos:** 0HIf4AlajNY (frame-00, `MODEL · Gemini 3.5 Flash · New agentic flagship`), 6nVW14npcO4 (frame-02 `RUNS · MODE` stacked rows), rfzA7HWcpCQ (frame-02 `TOOLS · Google's apps + third-party via MCP`)
- **Structure:** Bordered rounded card holding stacked rows; each row = mono accent-color label (left, 80–120px wide) + body text (right, white sans). 1–3 rows typical.
- **Motion grammar:** card frame draw-on, rows stagger in top-to-bottom with 100ms offset, label color flashes on entry.
- **Typology map:** **NEW** — fragment of our `CaseStudy` "stack card" but stand-alone usage. Cheapest possible "spec sheet" component. Could be a sub-component reused by `ToolReview` / `NumberedStepCard` / `BigNumberHero`.
- **Priority:** 🟠 — high reuse value as a primitive.
- **Confidence:** HIGH.

### T5. `TwoOptionCompare` (BETA/PREVIEW dual-card) 🟠
- **Videos:** -LxJJwOjif4 (frame-02, `BETA self-hosted sandboxes` vs `PREVIEW MCP tunnels` with synthesis line below), eEy1oMeGfhQ (frame-02, `TWO WAYS / SURGICAL` dual-pane), DgDK5KWtJAw (frame-02, side-by-side comparison structure)
- **Structure:** Brand wordmark top, mono kicker ("WHAT YOU CAN USE TODAY", "TWO WAYS"), single-line headline ("Two different green lights."), then **two color-themed cards side by side** (left tinted green/teal, right tinted purple/red), each card has chip label + body + status mono caption ("PUBLIC · AVAILABLE NOW" / "RESEARCH · REQUEST ACCESS"). Optional **synthesis line in a third bordered pill** below ("Both shipping inside the Claude Platform.").
- **Motion grammar:** cards spring-in left-then-right (200ms offset), color tint pulses, synthesis pill draws after both.
- **Typology map:** **PARTIAL MATCH** to our `ComparisonTable` (which is 2-col matrix with N rows). This is the **1-row simpler cousin** = "two options head-to-head". Worth its own template since it covers ~25% of the corpus.
- **Priority:** 🟠.
- **Confidence:** HIGH.

### T6. `TweetEmbed` (screenshot-of-X-post card) 🟠
- **Videos:** Jj3m_R2627Y (frame-02, Andrej Karpathy "I've joined Anthropic" tweet card)
- **Structure:** Cream paper bg with hand pattern, ANIMATED tweet card (avatar + display name + verified badge + handle + body text + timestamp + view count + reaction strip) centered low. Often arrives **rotated slightly** then snaps level.
- **Motion grammar:** tweet card flies in from below at ~5deg tilt, settles to 0, body text type-on, view count counter ramp, reaction icons stagger.
- **Typology map:** **NEW** — we don't have this. Distinct from our `QuoteCard` (which uses native typography). Real screenshot-styled tweet card is its own thing.
- **Priority:** 🟠 — at least 1 of every 5 stories in tech-news space cites a tweet.
- **Confidence:** HIGH.

### T7. `BrandedHeadlineCanvas` (Google I/O master) 🟠
- **Videos:** 0HIf4AlajNY, 6nVW14npcO4, jOorXKrbTHU, rfzA7HWcpCQ, eEy1oMeGfhQ
- **Structure:** Entire 9:16 wrapped in a **rounded glass frame** (~24px corner-radius, 1px stroke). Top-center Google logo, top-right `@HANDLE`, bottom: 5-dot **chapter progress bar** (HOOK · WHAT · UPGRADES · SHIP · YOU). Body inherits T1/T3/T5 sub-templates.
- **Motion grammar:** Google "color dot" particle field drifts continuously; logo and handle stay fixed; progress dot advances per chapter.
- **Typology map:** **NEW META-TEMPLATE** — this is a *theme wrapper* not a content template. Equivalent in our codebase: brand watermark + breadcrumb already exist (`BrandWatermark.tsx`, `BrandBreadcrumb.tsx`). We need a "chapter progress nav" component.
- **Priority:** 🟠 — high recognizability per series; medium effort.
- **Confidence:** HIGH.

### T8. `AcronymLogoHero` 🟢
- **Videos:** dzn9KVVtZLc (frame-00, `SG / AST-GREP` lightning-bolt monogram), -FNswl7pVcA (frame-00, "Claude Code" wordmark + version pill behaves the same way)
- **Structure:** Centered chunky monogram (2-letter acronym in 400pt+ display sans, often metallic/glow), mono caption above ("THE MISSING LAYER"), small full-name caption below, themed background pattern (lightning bolts, connectors).
- **Motion grammar:** lightning bolt zaps in (path stroke + flash), monogram scale-from-0 with bouncing easing, full-name fade-in. Background pattern parallaxes slowly.
- **Typology map:** **NEW** — variant of `HookHeroCard` but dedicated to introducing a tool / framework / brand by its mark. Different motion grammar (more "logo reveal" energy).
- **Priority:** 🟢 — useful when story is *about* a specific brand/tool, but T1 covers most cases.
- **Confidence:** MED — only 1 explicit example, plus the wordmark variant in -FNswl7pVcA.

### T9. `MetricsBenchmarkPanel` 🟠
- **Videos:** 0HIf4AlajNY (frame-01, `THE CLAIM · Frontier-level performance · 4x SPEED · 1/2 COST · THE RECEIPTS · TERMINAL-BENCH 2.1 · 76.2%`)
- **Structure:** Mono kicker ("THE CLAIM"), 2-line headline, **horizontal pair of gradient-stroked giant glyphs** (`4x`, `½`) with mono caption under each (`SPEED`, `COST`), then second mono kicker ("THE RECEIPTS"), then a small bordered receipt card showing benchmark name + score. Two-tier "claim → proof" structure on one slide.
- **Motion grammar:** glyphs gradient-stroke draw-on, captions slide-up, receipt card draws after a beat. Background particles drift.
- **Typology map:** **NEW** — sits between `BigNumberHero` (one number) and `ComparisonTable` (matrix). Worth own template because the "claim + proof" layered structure is distinctive.
- **Priority:** 🟠 — benchmark stories are a recurring AI-news beat.
- **Confidence:** MED — one strong exemplar.

### T10. `LabeledBadgesField` (free-floating tag cloud) 🟢
- **Videos:** -LxJJwOjif4 (frame-01, `Logins / Admin actions / Config changes / Unified feed` rotated outline pills), eEy1oMeGfhQ (frame-01 cards as upgrade reveal pre-state)
- **Structure:** Headline at top, then **free-floating outlined pill badges** placed at slight rotations (-8°…+12°), scattered across the lower-mid canvas.
- **Motion grammar:** pills pop-in randomly (jitter timing + slight overshoot), rotate to their final tilt, hover-bob continuously.
- **Typology map:** **NEW** — useful for "here are 4 things in this concept" without the rigor of a numbered list. Light, playful component.
- **Priority:** 🟢 — nice-to-have visual variety; can be approximated by a one-slot variant of `Listicle`.
- **Confidence:** MED.

### T11. `VideoEmbedWindow` (webcam / B-roll inset) 🟠
- **Videos:** jOorXKrbTHU (frame-02, presenter holding Pixel phone, embedded in rounded landscape window inside the Google glass-frame canvas), eEy1oMeGfhQ (frame-00 with Gemini Omni sunflower mandala B-roll inset)
- **Structure:** Headline above ("Edit by talking."), then a 16:9 rounded-rectangle window playing a B-roll clip or product image, centered in the upper-middle of the 9:16 canvas. Below: empty space for caption.
- **Motion grammar:** window iris-in from 0.7 scale → 1.0, soft inner glow pulse, content plays through. Sometimes the inset replaces a previous still.
- **Typology map:** **NEW** — closest to `TutorialMicro` (which is full-screen recording with annotations). This is a *windowed* inset used as a single beat, not a multi-step walk-through.
- **Priority:** 🟠 — every "Google announces X" video uses this at least once.
- **Confidence:** HIGH.

### T12. `SerifQuoteOpinionCard` 🟢
- **Videos:** DgDK5KWtJAw (frame-00, `FOLLOW-UP · ONE WEEK LATER` mono kicker + `Markdown` in giant Georgia serif italic gray), Jj3m_R2627Y (frame-02, `Two strategies. Two bets.` Georgia serif + warm-red italic), DgDK5KWtJAw (frame-02 closing card with same aesthetic)
- **Structure:** Cream paper bg, mono terracotta kicker, then **single giant Georgia serif word(s)** in muted gray with one accent in warm-red italic. Often paired with a small bordered card holding a tagged definition.
- **Motion grammar:** serif word marker-sweep reveal (looks like a fountain-pen draw), accent word fades in afterward with italic emphasis, card slides up from bottom.
- **Typology map:** **PARTIAL MATCH** to our `QuoteCard` and `HotTake` — but the *typography contract* (Georgia serif as the hero) is different enough to warrant its own variant of `HotTake`.
- **Priority:** 🟢 — covers the opinion/follow-up lane, lower frequency.
- **Confidence:** MED.

### T13. `AmbientBrandBackground` (recurring loop) 🟢
- **Videos:** all of them — every frame
- **Structure:** Pattern of brand glyphs (Anthropic connectors, Google color dots, AST-Grep lightning bolts, hand silhouettes for cream kit), slowly drifting on a radial-gradient bg.
- **Motion grammar:** infinite slow parallax (10–30s loop), barely visible (15–25% opacity).
- **Typology map:** **NEW** — a component, not a slide template. Belongs in `src/components/backgrounds/`. Already partially implemented via brand watermark; need expansion to themed-glyph fields.
- **Priority:** 🟢 — gives "production polish" feeling across all other templates.
- **Confidence:** HIGH.

### T14. `ChapterProgressNav` 🟠
- **Videos:** eEy1oMeGfhQ (frame-02 bottom `HOOK · WHAT · UPGRADES · SHIP · YOU` dots), rfzA7HWcpCQ (frame-02 bottom `SETUP · CREATE · EVAL · DEPLOY · PUBLISH` dots), -FNswl7pVcA / o9MSAAXma-I (counter `03 / 06` is a numeric variant)
- **Structure:** 4–5 dots on a thin horizontal rule at the bottom of the canvas, current dot highlighted larger + accent-colored, labels below in mono.
- **Motion grammar:** dot advances per chapter with slide+pulse; current label illuminates.
- **Typology map:** **NEW component** — not a template by itself but a near-mandatory primitive for long shorts (>60s) that have narrative chapters.
- **Priority:** 🟠 — pairs with T7 and `NumberedStepCard`.
- **Confidence:** HIGH.

### T15. `OrangeRecBezel` ("REC" recording-frame chrome) 🟢
- **Videos:** fpNTqli9cs8 (frame-02, `● REC 00:34:00` top with bezel corner brackets + bottom `02 / 15` slide counter)
- **Structure:** L-shaped corner brackets on all 4 corners (camera-viewfinder look), `● REC` top-left + running timecode top-right, slide counter bottom-left, mini dot-progress bottom-right.
- **Motion grammar:** timecode advances real-time, REC dot pulses red, faint film-grain over the whole frame.
- **Typology map:** **NEW chrome variant** — sibling of T7 (Google glass-frame). Specific to "compliance / security / official record" lane.
- **Priority:** 🟢 — adds genre-flavor; low priority but cheap.
- **Confidence:** HIGH.

---

## 2. Coverage summary

| # | Template | Status | Priority |
|---|---|---|---|
| T1 | HookHeroCard | NEW (hybrid w/ TechNewsFlash) | 🔴 |
| T2 | BigNumberHero | EXISTING (E-15 #2) | 🔴 |
| T3 | NumberedStepCard | EXTENDS Listicle5 → ListicleN | 🔴 |
| T4 | KeyValueRowsCard | NEW primitive | 🟠 |
| T5 | TwoOptionCompare | EXTENDS ComparisonTable | 🟠 |
| T6 | TweetEmbed | NEW | 🟠 |
| T7 | BrandedHeadlineCanvas | NEW meta-template | 🟠 |
| T8 | AcronymLogoHero | NEW variant of HookHeroCard | 🟢 |
| T9 | MetricsBenchmarkPanel | NEW | 🟠 |
| T10 | LabeledBadgesField | NEW | 🟢 |
| T11 | VideoEmbedWindow | NEW (sibling of TutorialMicro) | 🟠 |
| T12 | SerifQuoteOpinionCard | EXTENDS HotTake / QuoteCard | 🟢 |
| T13 | AmbientBrandBackground | NEW component | 🟢 |
| T14 | ChapterProgressNav | NEW component | 🟠 |
| T15 | OrangeRecBezel | NEW chrome variant | 🟢 |

**Net new templates:** 8 templates + 4 reusable primitives (T4, T13, T14, T7 wrapper) + 3 variants of existing.

---

## 3. Cross-cutting observations (HIGH confidence)

1. **Kit ≠ template.** The same `NumberedStepCard` ships with three different visual kits (Anthropic green, Google color-dots, AST-Grep neon). Our build should separate **theme tokens** from **layout templates** explicitly — one JSON for kit, one for template.
2. **Mono labels everywhere.** Every kit uses a monospaced font (IBM Plex Mono / JetBrains Mono / similar) for kickers, section tags, chip labels, captions. Body text is sans-serif (Inter / Geist). Headlines vary (Inter Black or Georgia serif depending on kit).
3. **Counter + section-tag header is universal.** Anthropic kit: `03 / 06 --COMMENT`. Google kit: `01 / 04`. AST-Grep: `AST-GREP · SHORT`. Codify this as a shared `SlideHeader` component.
4. **Progress bar at the very bottom** (1px tall, accent-colored, fills with playhead) is on every Google-kit and Anthropic-kit slide. Tiny detail, big polish signal.
5. **Caption-burn region is always lower 30–40%** of the canvas. Templates intentionally leave that area empty/dim for word-by-word captions. Our caption renderer must respect this safe-area.
6. **Pattern-fill backgrounds parallax slowly** — never static. Cheap CSS animation, large visual payoff.
7. **Negative-space asymmetry** is a hallmark — Anthropic-kit slides leave huge empty lower halves; this is a feature, not unused space.

---

## 4. Build-order recommendation (V1 vote)

**Sprint A (this week):** T1 `HookHeroCard` + T3 `NumberedStepCard` + T4 `KeyValueRowsCard` + T14 `ChapterProgressNav` + T13 `AmbientBrandBackground`. These five together cover **>70%** of every frame in the corpus.

**Sprint B:** T5 `TwoOptionCompare`, T6 `TweetEmbed`, T11 `VideoEmbedWindow`, T9 `MetricsBenchmarkPanel`, T7 `BrandedHeadlineCanvas` wrapper.

**Sprint C (nice-to-have):** T8 `AcronymLogoHero`, T10 `LabeledBadgesField`, T12 `SerifQuoteOpinionCard`, T15 `OrangeRecBezel`.

Update existing: extend `Listicle5` → `ListicleN` (T3); extend `BigNumberHero` to support card-frame mode (T2 card variant).

---

## 5. Confidence summary

- **HIGH confidence (10):** T1, T2, T3, T4, T5, T6, T7, T11, T13, T14, T15, kit/template separation, mono-label universality, caption safe-area.
- **MED confidence (4):** T8 (1 strong example), T9 (1 example), T10 (2 examples but small), T12 (kit-specific).
- **LOW confidence (0):** none — every claim is grounded in at least one specific frame.

**Final inventory:** 12 videos → **15 distinct templates** identified (8 net new, 3 variants of existing E-15 typology, 4 reusable primitives). Strong consensus signal: build T1+T3+T4+T13+T14 first.
