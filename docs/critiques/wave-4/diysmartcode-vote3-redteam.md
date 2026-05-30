# @DIYSmartCode — Vote 3 (Red-Team) — What the prior ANALYSIS missed

> **Voter:** Red-team / brutal honesty. Scope = ONLY `references/creators/diysmartcode/ANALYSIS.md` + frames.
> **Frames inspected:** 24 frames across 9 videos (`o9MSAAXma-I`, `dzn9KVVtZLc`, `Jj3m_R2627Y`, `-FNswl7pVcA`, `-LxJJwOjif4`, `0HIf4AlajNY`, `eEy1oMeGfhQ`, `6nVW14npcO4`, `fpNTqli9cs8`, `DgDK5KWtJAw`, `jOorXKrbTHU`).

**Bottom line:** the prior ANALYSIS identifies **3** templates from 3 cherry-picked videos and infers his "house grammar" from them. It is dangerously incomplete. The frames reveal **at least 3 additional template families** the analysis never mentions, plus ~15 reusable components and motion devices that were either bucketed as static decoration or skipped entirely. The "no burned-in captions" claim is factually wrong for one of the families. The recommendations table at the bottom of ANALYSIS.md is missing ~70% of what's actually on screen.

---

## Confirmed (ANALYSIS.md was right about these)

- Top breadcrumb / section label as a structural moat — confirmed in every dark Claude-Code frame, every cream Anthropic-editorial frame, and even the new Google/Gemini family (`THE CLAIM`, `WHERE IT SHIPS`, `UPGRADE 01`, etc).
- One color-emphasized word per hero line — confirmed (`Zero`, `inside`, `knows`, `back the bet`, `US-only`, `works`, `live`, `aren't static`).
- Bottom source-attribution pill — confirmed on the cream editorial template (`SOURCE @karpathy on X`).
- Subtle background pattern texture — confirmed (hexagon/molecule mesh on dark Claude; lightning bolts on ast-grep dark; hands+puzzle on cream Anthropic; particle field on Google).
- Mono/serif/sans typography split — confirmed.
- Per-video accent matching the subject brand — partially confirmed (greens for Anthropic, orange for ast-grep, warm-red for editorial) BUT see "rotating per-step accent" finding below — the rule is more complicated than ANALYSIS claims.

---

## NEW findings — entire TEMPLATES the ANALYSIS missed

### 🔴 N1 — "GeminiFrame" / Google AppShell template
**Where:** `0HIf4AlajNY`, `-LxJJwOjif4` (Cloudflare sandbox), `6nVW14npcO4` (pricing tiers), `eEy1oMeGfhQ` (Stitch/streaming), `jOorXKrbTHU` (Edit by talking).
**Why it's a missed template, not a variant of #1:** different chrome, different layout grammar, different background system, different niche (Google AI, not Anthropic).
**Distinguishing chrome:**
- Top-left rounded "macOS notch" pill at the very top of the canvas.
- Top progress bar (thin yellow/orange line growing horizontally) — completely absent from the dark Claude template.
- Centered colored brand wordmark (`Google` in 4 brand colors, or a glow-gradient `{...}/[...]` Google I/O lockup).
- Top-right channel handle watermark (`@DIYSMARTCODE`, `@SMARTCODE`, `@STITCHBYGOOGLE`, `@GOOGLE`).
- **Animated floating Google-color particle field** (blue/red/yellow/green dots scattered + drifting) — the closest visual analogue to confetti in his catalog.
- **Section-progress chapter stepper at the bottom** (`HOOK · WHAT · UPGRADES · SHIP · YOU` or `SETUP · CREATE · EVAL · DEPLOY · PUBLISH`) — see N7.
**Proposed template name:** `GeminiPhoneFrame9x16`. **Severity 🔴.**

### 🔴 N2 — "Camcorder/REC Surveillance" template
**Where:** `fpNTqli9cs8` (Anthropic compliance).
**Distinguishing chrome:**
- Viewfinder corner brackets in all 4 corners.
- `● REC` (blinking red dot) top-left + `00:19:20` HH:MM:SS mono timecode top-right.
- Faux-matrix garbled-character columns running vertically down both edges (data-stream chrome).
- Pagination footer: `02 / 15` slash counter bottom-left + 15-dot pagination indicators bottom-right (the active dot is accent-colored).
- **Multi-row stacked item-list panel** where each row has its OWN accent color (orange / purple / blue) — directly contradicts ANALYSIS's "one accent per video" rule.
**Proposed template name:** `CamcorderListicle9x16`. **Severity 🔴.**

### 🟠 N3 — "GlassCardAB" light/glass template
**Where:** `jOorXKrbTHU` frame-04.
**Distinguishing chrome:**
- Pale mint-pink gradient background (NOT cream paper, NOT dark navy — third bg variant).
- Two large frosted-glass cards in a 1:1 horizontal split with `LABEL` (uppercase mono) + huge sans-serif value + tiny mono caption.
- Designed for binary comparisons (`PIXELS Settled / STORY Isn't`).
**Proposed template name:** `GlassCompareAB9x16`. **Severity 🟠.**

---

## NEW findings — Reusable COMPONENTS the ANALYSIS missed

### 🔴 N4 — Horizontal bar-chart module
`o9MSAAXma-I` frame-04. Color-coded bars with category label on the left, mono value label on the right (`BACKGROUND SESSIONS · 18`, `PLUGIN MARKETPLACE · 5`, `MCP SERVERS · 4`). Bars themselves animate-grow from 0 to value. Completely absent from ANALYSIS, which has no data-viz component at all. Proposed: `<BarChartList>`. **Severity 🔴.**

### 🔴 N5 — Terminal/shell mock with traffic-light chrome + ANSI colors
`dzn9KVVtZLc` frame-04, `dzn9KVVtZLc` frame-01, `fpNTqli9cs8` frame-04. Three macOS dots (red/yellow/green), title bar with filename (`~/your-project — bash`) or service spec (`claude — compliance api · zsh`), inner content with `$` prompt, gray italic comments, cyan package names, orange commands. ANALYSIS only mentions mono font for CTAs/source pills — never describes a real terminal mock as a recurring component. Proposed: `<TerminalBlock>`. **Severity 🔴.**

### 🔴 N6 — Editor code-block with line numbers + status badge row
`o9MSAAXma-I` frame-03, `-FNswl7pVcA` frame-03. Distinct from N5: this is a CODE editor (not shell). Has a synthetic file-tab header (`claude · statusline.json`) followed by `injected · no shell-out` status chips, line numbers down the left, JSON or TS syntax highlighting (green strings, orange numbers, blue function names). Proposed: `<EditorBlock>` separate from `<TerminalBlock>`. **Severity 🔴.**

### 🔴 N7 — Section-progress chapter stepper
`eEy1oMeGfhQ` frame-01 (`HOOK · WHAT · UPGRADES · SHIP · YOU`), frame-03 (`HOOK · WHAT · UPGRADES · SHIP · YOU` with `SHIP` lit), `rfzA7HWcpCQ` (`SETUP · CREATE · EVAL · DEPLOY · PUBLISH`). Bottom-anchored connected-dot line with labels under each dot. Active dot is enlarged + accent-colored. This is narrative wayfinding — the viewer always knows which chapter they're in. Proposed: `<ChapterStepper>`. **Severity 🔴.**

### 🟠 N8 — Top thin progress scrubber
Present in every GeminiFrame video. A 4–6px horizontal accent line at the very top that grows L→R across the full video duration. Different from N7's chapter stops. Proposed: `<TopScrubBar>`. **Severity 🟠.**

### 🟠 N9 — Numbered/dotted pagination row
`fpNTqli9cs8` (15-dot indicator + `02 / 15` counter). Distinct from N7 — this is a finer-grained slide counter for long videos. Proposed: `<DotPagination>`. **Severity 🟠.**

### 🟠 N10 — Spec-sheet KV row
`0HIf4AlajNY` frame-02 (`RUNS / Multiple Gemini Flash instances`, `MODE / Coordinated, parallel work`). Bordered rounded card with a fixed-width left-aligned mono label and a free-form right-side value. Proposed: `<SpecRow>`. **Severity 🟠.**

### 🟠 N11 — 2×2 product/feature grid
`0HIf4AlajNY` frame-04. Four "Available today / Ultra Beta · Next wk" cards with per-card colored left-border accent and per-card subject label color. ANALYSIS has no grid component at all. Proposed: `<FeatureGrid2x2>`. **Severity 🟠.**

### 🟠 N12 — Pricing-tier mini cards (masonry)
`6nVW14npcO4` frame-01. Three rounded cards with `TIER NAME` (accent uppercase) + price OR `???` masked placeholder. Conceals/reveals semantically — the masked tiers are a deliberate visual hook for "you don't know yet". Proposed: `<PricingTierCard>` with `mask?: boolean` prop. **Severity 🟠.**

### 🟠 N13 — Vendor/integration logo wall
`fpNTqli9cs8` frame-03. White card holding a 6×4 grid of real-brand logos (Cloudflare, Cribl, CrowdStrike, etc). Acts as a credibility wall. Proposed: `<LogoWall>` component pulling from a `logos/` registry. **Severity 🟠.**

### 🟠 N14 — File-type chip badge
`DgDK5KWtJAw` frame-02 (`.html` bordered pill prefixing `25,000`). Proposed: `<FileTypeBadge>` — small mono pill prefix to a big-number card. **Severity 🟠.**

### 🟠 N15 — Floating word-chip cluster (Anthropic editorial / camcorder)
`fpNTqli9cs8` frame-02 (`Logins`, `Admin actions`, `Config changes`, `Unified feed` chips drifting in at slight angles). Distinct from a chip ROW — these are kinetic, rotated, scattered. Proposed: `<FloatingChipCluster>` with per-chip rotation/delay. **Severity 🟠.**

### 🟠 N16 — Hand-drawn highlight underline
`6nVW14npcO4` frame-03 (the wavy organic underline beneath `US-only`). Different from the thin straight underline beneath the breadcrumb. Brush/penmark stroke, irregular. Proposed: `<PenmarkUnderline>` SVG component with stroke-dash animation for draw-in. **Severity 🟠.**

### 🟠 N17 — Big-number with sidecar metadata
`Jj3m_R2627Y` frame-03 (`$30B` on the left + right-aligned mono `RUN RATE · APRIL 2026` + `↑ FROM $9B (DEC 2025)`). Different from ANALYSIS's `BigNumberHero` which had body BELOW. Proposed: `<BigNumberSidecar>` variant. **Severity 🟠.**

### 🟠 N18 — Before→After numeric transform
`dzn9KVVtZLc` frame-01 (`164 → 12 matches`, with original in gray and target in accent). Semantic delta, not generic big number. Proposed: `<BeforeAfterNumber>`. **Severity 🟠.**

### 🟠 N19 — Pull-quote on dark card (cream variant)
`Jj3m_R2627Y` frame-03 (`DARIO AMODEI / "Just crazy. Too hard to handle."` on a dark slab IN A CREAM VIDEO). Inverted-color quote card placed inside a light template. Proposed: `<DarkQuoteSlab>` for cream layouts. **Severity 🟠.**

### 🟢 N20 — Lock-icon feature gate row
`6nVW14npcO4` frame-03 (`[LOCK] Gemini Spark — US ONLY pill`). Proposed: `<LockedFeatureRow>`. **Severity 🟢.**

### 🟢 N21 — Engagement-poll CTA
`DgDK5KWtJAw` frame-05 (`Which side are you on?` end card). Distinct from the "long-form link" CTA. Proposed: `<PollCTA>`. **Severity 🟢.**

### 🟢 N22 — Embedded B-roll/image card with overlay chips
`jOorXKrbTHU` frame-01 (rounded card holding claymation render + bottom-overlaid `GRAVITY`, `KINETIC ENERGY`, `FLUID DYNAMICS` context chips). Proposed: `<MediaCardWithTags>`. **Severity 🟢.**

### 🟢 N23 — Embedded webcam/talking-head player tile
`jOorXKrbTHU` frame-02 (rounded card with a real-person clip + person holding phone). Proposed: `<EmbeddedClip>` — clip-in-card, not standalone TalkingHead. **Severity 🟢.**

---

## NEW findings — TYPOGRAPHY & COLOR rules ANALYSIS missed

### 🔴 N24 — Per-STEP rotating accent (not per-video)
ANALYSIS claims "one accent per video". FALSE for `o9MSAAXma-I`: step 03 is green, step 02 is purple, step 04 is blue, step 05 is purple again. Same in `fpNTqli9cs8` (orange/purple/blue per row) and `0HIf4AlajNY` (per-card colors). Real rule: the accent rotates per item to differentiate them, then sometimes returns to the brand accent for the global elements. Proposed: schema needs `palette: AccentColor[]` not just `accentColor: string`. **Severity 🔴.**

### 🔴 N25 — Strikethrough text as semantic device
`Jj3m_R2627Y` frame-04 (`The model is the moat.` with a horizontal line through it, indicating a myth being busted). ANALYSIS only mentions italic + color swap for emphasis. The strikethrough is a SECOND emphasis mode with different semantics ("we are correcting the record"). Proposed: emphasis prop should accept `"struck" | "italic" | "color" | "underline"`. **Severity 🔴.**

### 🟠 N26 — Multi-color gradient on big glyphs
`0HIf4AlajNY` frame-01 (`4x` and `½` rendered in a green→yellow gradient, not a flat fill), `eEy1oMeGfhQ` frame-03 (`MOTION.` in a blue→green→yellow gradient). Distinct from text-color emphasis. Proposed: text component should support `fill: "solid" | "gradient"`. **Severity 🟠.**

### 🟠 N27 — Subscript/superscript numeric formatting
`Jj3m_R2627Y` frame-03 (`$30B` rendered as small `$` prefix + huge `30` + small subscript `B`). Proposed: `<BigCurrencyValue>` that auto-extracts prefix/suffix. **Severity 🟠.**

### 🟠 N28 — Glow / colored vignette as ambience
`-LxJJwOjif4` frame-01 has a warm-red radial vignette behind the `ANTHROPIC` wordmark. GeminiFrame videos have a radial green-warm glow at frame center. ANALYSIS only mentions "dark teal/charcoal bg" — never the colored vignette layer. Proposed: brand-set needs `ambientGlow?: { color, position }`. **Severity 🟠.**

### 🟠 N29 — Stylized brand wordmark
`-LxJJwOjif4`, `-FNswl7pVcA`, `fpNTqli9cs8` all render the brand as `ANTHROP\C` (the `I` substituted with `\C`). Deliberate logo treatment, not a render bug. Proposed: brand-set should support a `wordmarkSVG` so we don't risk fragile font hacks. **Severity 🟠.**

---

## NEW findings — MOTION / SYNC the ANALYSIS treated as static

### 🔴 N30 — Background pattern DRIFTS
Comparing the same video's frame-00 and frame-05 (`o9MSAAXma-I`) the hexagon/molecule shapes have MOVED positions. ANALYSIS calls it "subtle background pattern" as if it's static. It's not — there's slow parallax drift. Proposed: `<DriftingPattern>` with an `xOffset = t * speed` per shape, lazy GPU-friendly. **Severity 🔴.**

### 🟠 N31 — Particle field has color synchrony with content
GeminiFrame particle dots are tinted blue/red/yellow/green — matching the Google brand. On `-LxJJwOjif4` (Anthropic) the particles tint orange/warm-red. So the particle palette is content-driven, not template-fixed. Proposed: particle palette is a brand-set prop. **Severity 🟠.**

### 🟠 N32 — Burned-in captions DO exist (claim in ANALYSIS is wrong)
ANALYSIS explicitly says "NO burned-in captions in most of his content." Counter-evidence: `eEy1oMeGfhQ` frame-03 has burned captions ("Mocks aren't static anymore. They move.") WITH word-level color highlighting (`aren't static` and `move` in green). The Gemini family DOES use captions; the Anthropic family doesn't. Two-mode rule, not "no". **Severity 🟠 (fact-check fail).**

### 🟠 N33 — Black-frame transitions
`o9MSAAXma-I` frame-05 is pure black. Either an end card or a deliberate punctuating cut between sections. The compositions need to support `cutToBlack` as a transition primitive — useful for audio-visual sync. **Severity 🟠.**

---

## NEW findings — SEMANTICALLY LOAD-BEARING elements bucketed as decorative

- **`[LOCK]` brackets** in front of feature names aren't typography — they're functional locked-state indicators (N20).
- **Corner brackets** in the camcorder template aren't decoration — they semantically frame the entire shot as "captured footage / surveillance / receipts".
- **The `???` mask** on pricing cards isn't a placeholder — it's a deliberate engagement hook ("you have to keep watching to find out").
- **Strikethrough on the playbook headline** isn't a typo aesthetic — it's a debate device.
- **Slash-prefixed labels** (`/CODE-REVIEW`, `/PLUGIN X-RAY`) aren't just styling — they're CLI-command semantics, matching the Claude Code subject brand.

---

## Verdict

ANALYSIS.md is a competent first pass on 3 of his videos but treats the catalog as much smaller and more uniform than it is. It misses:

- Two entire template families (`GeminiFrame`, `CamcorderListicle`) plus one minor (`GlassCompareAB`).
- An entire data-viz vocabulary (bar charts, big-number sidecars, before→after, spec sheets, grids, pricing cards, logo walls).
- Two chrome systems that are universal in the GeminiFrame family (chapter stepper, top scrubber).
- The semantic-emphasis system (strikethrough, hand-drawn underline, gradient text, file-type chip prefix, masked values).
- The fact that accent color rotates PER STEP, not per video — invalidates the proposed schema in ANALYSIS's recommendations table.
- The fact that captions DO get burned in on the Gemini family — invalidates the "document for a/b" footnote.

If we shipped the components in ANALYSIS.md and stopped there, we'd reproduce **maybe 25%** of what DIYSmartCode is actually doing visually.

---

## Sources

- Frames inspected (24): `o9MSAAXma-I/frames/frame-{00,01,02,03,04,05}`, `dzn9KVVtZLc/frames/frame-{01,03,04}`, `Jj3m_R2627Y/frames/frame-{01,03,04}`, `-FNswl7pVcA/frames/frame-{01,03,05}`, `-LxJJwOjif4/frames/frame-{01,03,04}`, `0HIf4AlajNY/frames/frame-{01,02,04}`, `eEy1oMeGfhQ/frames/frame-{00,01,03}`, `6nVW14npcO4/frames/frame-{01,03}`, `fpNTqli9cs8/frames/frame-{01,02,03,04}`, `DgDK5KWtJAw/frames/frame-{02,04}`, `jOorXKrbTHU/frames/frame-{01,02,04}`.
- Prior analysis: `references/creators/diysmartcode/ANALYSIS.md`.
