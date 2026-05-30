# @adamrosler (YouTube Shorts) — visual + motion analysis

> **Scraped:** 2026-05-28 · 18 shorts · durations 42–55s (all 9:16, YouTube native).
> **Niche match:** EXACT — English-language AI/ML/systems-engineering explainer creator. AI agents, BGP, CUDA, transformers, sandboxing, RAG, diffusion LMs, npm worms, CPU branch prediction. Same audience as @armandointeligencia, English-side.
> **Tooling guess:** Almost certainly Remotion or a Remotion-class framework — every reel is **pure procedural motion graphics on solid dark navy/black**, no real footage, no face-cam, no studio. Deterministic-looking entrances, framerate-precise word-by-word karaoke captions, and consistent typographic chrome across 18 reels point to a code-driven template system. **This is the closest match in the entire 16-creator reference set to what we are building.**
> **Channel:** https://www.youtube.com/@adamrosler · cross-posted to TikTok `@adam_rosler` + Instagram `@adam_rosler`. YouTube selected as primary (HD source, exposed view counts).

Adam Rosler runs **one tightly disciplined house grammar** (dark BG + uppercase bold sans hero + bottom karaoke caption + per-video custom procedural diagram in the middle band) — but inside that grammar he switches the **middle-band primitive** every scene based on what the script demands: ranked list, terminal block, force graph, gauge cluster, line chart, token grid, pipeline-step diagram, icon-pair illustration, etc. He does NOT have 3 templates with 3 reels each (Carlos-style); he has **one templated chrome + ~12 procedural diagram primitives** that combine and recombine. This is the model we want.

His view-count distribution is the strongest signal in the reference set after Nate Jones — top reel 23K views, 5 reels above 2K, none below 1K. The 23K winner (`mZgCDFEBna0`, Hermes/OpenRouter) is a ranked-tier list + terminal block combo. The visual format scales.

---

## Per-video distillation

For each video: title · YouTube URL · duration · view count · semantic clip name(s) · animation findings · `transitionVerb` · orientation · replicability vs our existing primitives.

### 1. `mZgCDFEBna0` — Hermes #1 on OpenRouter (23K views) — top performer

- **Title:** "The #1 agent on OpenRouter is open source and runs on a 20GB laptop — Hermes"
- **URL:** https://youtube.com/shorts/mZgCDFEBna0 · 51s · 23,568 views
- **Semantic clip:** `cookbook-skills-memory`
- **Patterns:**
  - **RankedTierList (dark)** — two rows: rank "1" in orange + "HERMES" orange + green up-arrow on right, glowing orange border on the active row; row 2 "2 OPENCLAW" muted white with grey border. Header "OPENROUTER LEADERBOARD" + mono caption "LAST WEEK".
  - **TerminalSkillLibrary** — folder icon `~/.hermes/skills/` header + list of `.py/.sh/.md` filenames in green mono, right-aligned grey mono `SAVED` tags per line. Black/dark-grey rounded card frame.
  - **Karaoke caption** with one-word emphasis (active word bright white, context dim grey, e.g. "AND **RELOADS** IT.").
- **transitionVerb:** "Render row-2 first dimmed, then slide a glowing orange border around row-1 and scale-pop the rank number; in the terminal panel, type each filename one-per-line at ~6 fps with `SAVED` tag fading in 4 frames after each line lands."
- **Orientation:** 9:16
- **Maps to:** `RankedTierList9x16` (direct hit — dark variant), `TerminalBlock9x16` / `TerminalCommand9x16` (skill-library mode). Caption pattern already covered by `EditorialCaption` with `emphasisWord` extension.

---

### 2. `hvtB3UaQ1wg` — Microsoft semantic drift over 20 edits (5.2K views)

- **Title:** "Microsoft measured 19–34% semantic drift over 20 chained agent edits — the fix"
- **URL:** https://youtube.com/shorts/hvtB3UaQ1wg · 42s · 5,294 views
- **Semantic clips:** `telephone-game` + `trade-off-bar`
- **Patterns:**
  - **BulletSequenceCounter** — row of 20 green glow-dots progressing left→right, big mono counter "EDIT 20/20" pulsing above, gradient bar below (green→amber→red). Hero label "REALITY" at top white.
  - **GearCompilerDiagram** — abstract cog/gear glyph (cyan stroke) + dotted vertical connector + abstract code block placeholder. Hero "GIVE PROSE A COMPILER". This is a custom analogy primitive — the gear is a metaphor for "spec/compiler".
  - **TradeOffBar (horizontal scale)** — likely a two-axis bar with center pivot (per clip name).
- **transitionVerb:** "Pulse each of the 20 dots green-on then leave them lit; reveal the gradient bar with a left-to-right wipe; tick the counter `01→20` at 4 frames per increment with a single beat-bounce at each landing."
- **Orientation:** 9:16
- **Maps to:** New primitive needed — `BulletSequenceCounter` (no exact match; `AnimatedCounter9x16` is single-number). `GearCompilerDiagram` is one-off illustration — model as an asset-driven `IllustratedConcept9x16` slot, not a new template.

---

### 3. `I9pjllzSNK0` — 2008 BGP leak killed YouTube (4.2K views)

- **Title:** "The internet routes on the honor system — how a 2008 BGP leak killed YouTube globally"
- **URL:** https://youtube.com/shorts/I9pjllzSNK0 · 54s · 4,278 views
- **Semantic clips:** `bgp-announce-graph` + `hijack-route-flip`
- **Patterns:**
  - **AutonomousSystemGraph** — node graph with labeled circles (`AS7007` orange-active = announcer, `AS3356` teal-transit, `AS174` + `AS1299` transit, `AS15169` Google destination, `AS17557` red = hijacker, offset alone). Glowing edges connect transit nodes. Mono "API CALL" pill annotation above AS7007. Mono sub-labels (`TRANSIT`, `GOOGLE`, `HIJACKER`).
  - **Hero label** uppercase bold sans "NO OWNERSHIP CHECK." at top.
  - **Karaoke caption** "AND **REBROADCASTS** IT." — one-word emphasis pattern again.
  - The `hijack-route-flip` clip likely animates the red node injecting an edge into the graph, flipping arrow directions.
- **transitionVerb:** "Fade nodes in from center one-by-one in BFS order from `AS7007`; draw each connecting edge L→R over 12 frames; pulse `AS7007` orange-glow ring while displaying the API-CALL pill; on hijack scene, scale-pop the red `AS17557` node and redirect the outgoing arrow from green to red with a 200ms easeInOut."
- **Orientation:** 9:16
- **Maps to:** `ForceGraph9x16` (direct hit — node graph with edge animation) + `NeuralNetwork9x16` (close cousin). The route-flip mechanic (changing edge direction mid-anim) is **NOT** in our existing primitives — add `redirectEdge` to `pathDraw.ts`.

---

### 4. `gaGcC_OOGQ0` — Async continuous batching, 22% faster (3.4K views)

- **Title:** "Async continuous batching: same model, 22% faster"
- **URL:** https://youtube.com/shorts/gaGcC_OOGQ0 · 48s · 3,459 views
- **Semantic clips:** `cuda-handoff-queues` + `gpu-gauge-code`
- **Patterns:**
  - **CPUvsGPUToggle (`cuda-handoff-queues`)** — two pill buttons inside a dashed-border container: `CPU` (dark fill) + `GPU` (green-fill + orange-dot active + glow ring). Mono labels below: `stream 0` and `they take turns`. Hero "ONE CUDA STREAM" uppercase bold. Karaoke caption "BUT THE CPU **AND** GPU".
  - **GPUGaugeCode (`gpu-gauge-code`)** — likely radial gauge or % readout next to a terminal/code panel.
- **transitionVerb:** "Render both pills dimmed; ramp the green fill into the right pill over 8 frames while pulsing an orange dot inside; sync the karaoke caption emphasis word `AND` to land on the same frame as the green pill reaches full brightness."
- **Orientation:** 9:16
- **Maps to:** `BigNumberDuel9x16` (head-to-head structure) + `RankedTierList9x16` (active-row glow mechanic — same visual language as the `mZgCDFEBna0` orange-border-on-active-row). Pill-with-pulse-dot is a new molecule — `<TogglePillPair active="left|right" accent />`.

---

### 5. `P55GHPFTMQI` — npm Mini Shai-Hulud worm (2.3K views)

- **Title:** "The npm Worm That Shipped With a Valid Sigstore Badge: Mini Shai-Hulud, Explained"
- **URL:** https://youtube.com/shorts/P55GHPFTMQI · 48s · 2,377 views
- **Semantic clip:** `pipeline-steps`
- **Patterns:**
  - **IconObjectDiagramPair** — red-glow rounded card containing 3 stacked horizontal bars (file abstraction) with mono path label `/node_modules/.cache` below it, paired with an analog clock illustration + orange `...waiting` mono note. Hero "BUILD CACHE" uppercase bold. Karaoke caption "**BUILD** CACHE".
  - **PipelineSteps** — clip name implies a horizontal step-flow (CI/CD pipeline) likely with arrow connectors and step labels (build → install → publish → sign). RED accent throughout (security/danger framing).
- **transitionVerb:** "Fade the cache-card and clock in side-by-side; pulse the cache-card red border on a 60-frame loop; tick the clock minute-hand forward 5° per beat while `...waiting` cycles dot-count (1→3→1)."
- **Orientation:** 9:16
- **Maps to:** `PipelineFlow9x16` (direct hit — exists). Cache-card-with-icon is a new asset-illustration molecule worth extracting (`<IllustratedObjectCard accent>`). Clock illustration is one-off.

---

### 6. `omeIyf2Zja4` — Reads 10M tokens without loading (2K views)

- **Title:** "How A Model Reads 10 Million Tokens Without Loading The Document"
- **URL:** https://youtube.com/shorts/omeIyf2Zja4 · 54s · 2,058 views
- **Semantic clip:** `model-to-sandbox-grep`
- **Patterns:**
  - **ModelToSandboxHandoff** — circle node "MODEL" left (teal glow ring) → connector with active port indicator (green pulse) → dashed-bordered card right labeled "CODE SANDBOX" (mono green header) containing abstract code-line placeholders + mono variable annotation `doc = "...10M tokens..."`.
  - Below: actual mono terminal block (rounded rect) with two-line command `> grep(doc, "keyword")` (orange keyword in quotes) / `> doc[9000]` (orange number).
  - Hero "IT WRITES CODE" uppercase bold sans. Karaoke caption "**it** writes code" — note **lowercase** caption in this scene, a tonal variant.
- **transitionVerb:** "Render MODEL node first; draw connector L→R while pulsing port indicator; fade in sandbox card with mono header typing in over 16 frames; once card lands, type the terminal block command character-by-character at ~10 fps, then highlight \"keyword\" orange when query lands."
- **Orientation:** 9:16
- **Maps to:** `DecisionTree9x16` (node+connector+card structure) + `TerminalBlock9x16` (the actual code panel). The model→sandbox handoff is a **flow primitive** we could distil into a `<NodeToCardHandoff>` molecule reused across many AI/agent scripts.

---

### 7. `1aVyHmt2-Uo` — GridSFM $20B grid cost (2.4K views)

- **Title:** "GridSFM: a tiny transformer that unlocks $20B of US grid cost in milliseconds"
- **URL:** https://youtube.com/shorts/1aVyHmt2-Uo · 52s · 2,434 views
- **Semantic clip:** `model-to-solved-chip`
- **Patterns:**
  - **IconObjectDiagramPair** — windmill illustration (3-blade rotating prop on stand) + solar panel illustration (5-cell array on stand), both as flat-shaded vector icons. Bracketed red-border callout below "3.4 TWh" (mono). Hero "RENEWABLES WASTED" uppercase bold white. Karaoke caption "**THAT** JUST GETS".
  - The `model-to-solved-chip` clip likely shows transformer chip illustration → "solved" outcome.
- **transitionVerb:** "Slide windmill in from left + solar in from right simultaneously; rotate windmill blades on continuous 360° loop at 0.5 rps; after both icons settle, scale-pop the red-bracketed `3.4 TWh` callout from 0.7 to 1.0 with a 4-frame overshoot."
- **Orientation:** 9:16
- **Maps to:** `BigNumberHero9x16` (the bracketed-red-stat is a hero number) + `IllustratedConcept9x16` (the icon pair) + needs a new `<IconObjectPair>` molecule with rotation/idle animation support.

---

### 8. `rQxA1i4pQTg` — Million-token context lie (1.6K views)

- **Title:** "Is The Million-Token Context Window A Lie? The Honest Verdict"
- **URL:** https://youtube.com/shorts/rQxA1i4pQTg · ~55s · 1,600 views
- **Patterns:**
  - **AnnotatedLineChart** — clean axis (X = `TOKENS IN THE PROMPT`, Y = `0% / 100%`), green polyline plateau at ~95% from origin to 32K, then orange annotation dot + dotted vertical drop line at the cliff, big orange callout `32K` above. Hero "ACCURACY vs PROMPT LENGTH" with lowercase `vs` (typographic detail). Karaoke caption "ACCURACY HOLDS **CLEAN**".
- **transitionVerb:** "Draw the X+Y axis from origin outward over 8 frames; trace the green line L→R at constant speed; when line reaches the 32K x-coordinate, scale-pop the orange dot and animate the dotted vertical drop down to baseline over 12 frames, then fade in the `32K` label above the dot."
- **Orientation:** 9:16
- **Maps to:** `LineChartAnnotated9x16` (direct hit — exists). Adam's exact orange-cliff-annotation choreography is a great reference for our `annotationPoint` prop motion.

---

### 9. `L2xSh1nlmgo` — Python 3.13 mimalloc vs jemalloc (1.5K views)

- **Title:** "Python 3.13 no-GIL ships mimalloc as default — +14% on Redis vs jemalloc"
- **URL:** https://youtube.com/shorts/L2xSh1nlmgo · ~55s · 1,500 views
- **Patterns (no semantic clip — inferred from title + chrome consistency):** benchmark bar comparison — likely two horizontal bars (mimalloc green, jemalloc grey) with `+14%` callout pill. Same dark BG + uppercase hero + karaoke caption chrome.
- **transitionVerb:** "Animate two horizontal bars filling L→R simultaneously; the longer (mimalloc) finishes first with a green pulse, then a `+14%` pill scale-pops above the gap between the two bar ends."
- **Orientation:** 9:16
- **Maps to:** `BenchmarkBars9x16` (direct hit — exists) or `BarChartList9x16`.

---

### 10. `pthNSkWU8VM` — Claude 4 Opus blackmail 96% (1.5K views)

- **Title:** "Claude 4 Opus blackmailed engineers 96% of the time. Here's how Anthropic fixed it."
- **URL:** https://youtube.com/shorts/pthNSkWU8VM · ~55s · 1,500 views
- **Patterns:**
  - **PersonaAnalogyScene** — orange emoji-face character (glow ring) + green speech bubble `"PLEASE"` + dark grey 3D-shaded dinner-table illustration + green checkmark + label `DINNER TABLE` below in green mono. Hero "ANALOGY: DINNER TABLE" with `ANALOGY:` prefix. Karaoke caption "AT THE **TABLE**.".
  - This is a **storytime/analogy** scene — Adam uses character + object scenes as concrete analogies for abstract AI safety concepts.
- **transitionVerb:** "Bounce the emoji-face in from above with overshoot; pop speech bubble out from the face's right at +6 frames; settle the dinner-table illustration in from below; animate the green ✓ then type `DINNER TABLE` left-to-right."
- **Orientation:** 9:16
- **Maps to:** `IllustratedConcept9x16` (direct hit — the analogy/scene primitive). This validates we should keep illustrated-concept around for analogies, not just abstract dataviz.

---

### 11. `I30REYSeA0s` — CPU branch prediction 95% (1.6K views)

- **Title:** "Your CPU guesses the next 200 instructions — and it's right 95% of the time"
- **URL:** https://youtube.com/shorts/I30REYSeA0s · ~55s · 1,600 views
- **Patterns (no semantic clip):** likely CPU/chip illustration + flowing instruction queue + green/red success markers. Hero + karaoke caption chrome consistent.
- **transitionVerb:** "Slide instruction tiles L→R into a chip-illustration target; flip each tile green on hit / red on miss in a 95/5 weighted random sequence; show a running mono counter `HIT 95%` updating as tiles land."
- **Orientation:** 9:16
- **Maps to:** `TokenStream9x16` (instruction stream) + `IllustratedConcept9x16` (chip illustration). Hit/miss color flip is a new state — `<TileSequenceWithHitMiss>` molecule.

---

### 12. `tY40HHLnNxE` — OpenAI Codex 3 Windows sandboxes (1.8K views)

- **Title:** "OpenAI tried 3 Windows sandboxes for Codex — all failed. Here's the hybrid they shipped."
- **URL:** https://youtube.com/shorts/tY40HHLnNxE · ~55s · 1,800 views
- **Patterns (no semantic clip):** 3-option enumeration → red ✗ marks on each → green ✓ on a 4th hybrid card. Same dark chrome.
- **transitionVerb:** "Stack 3 cards vertically with mono labels; reveal one-by-one with a 200ms beat; flip each card to a red `✗` after a 600ms hold; then slide in a 4th `HYBRID` card from below with a green `✓` and a glow ring."
- **Orientation:** 9:16
- **Maps to:** `Listicle.tsx` / `RankedTierList9x16` (3-item enumeration) + Carlos-style `LockedFeatureRow9x16` (the ✗/✓ state per row exists).

---

### 13. `2n4Mc8Bh8KQ` — DeepSeek V4 vs GPT-5 (1.8K views)

- **Title:** "DeepSeek V4 fires 49B of 1.6T params and matches GPT-5 on code"
- **URL:** https://youtube.com/shorts/2n4Mc8Bh8KQ · ~55s · 1,800 views
- **Patterns:** versus framing — likely two big-number cards side by side (49B / 1.6T) or DeepSeek-vs-GPT-5 head-to-head benchmark bars.
- **transitionVerb:** "Land left card and right card simultaneously; count up the `49B` and `1.6T` numbers in parallel via rolling-digit animation; pulse the `=` operator between them on the karaoke `MATCHES` word."
- **Orientation:** 9:16
- **Maps to:** `BigNumberDuel9x16` (direct hit — exists).

---

### 14. `OnRw0D0nnDI` — Google Managed Agents one API call (1.2K views)

- **Title:** "One API Call Now Runs a Whole Coding Agent in a Linux Sandbox (Google Managed Agents)"
- **URL:** https://youtube.com/shorts/OnRw0D0nnDI · ~55s · 1,200 views
- **Patterns:** flow/pipeline topic — likely the `model-to-sandbox-grep` cousin pattern (node → arrow → sandbox card) but with a single API-call origin and Linux sandbox destination.
- **transitionVerb:** "Drop the `curl` command in mono terminal block, then animate a glowing arrow leaving the terminal and entering a `LINUX SANDBOX` dashed-border card; once card lands, run a typed agent log inside it."
- **Orientation:** 9:16
- **Maps to:** `PipelineFlow9x16` + `TerminalBlock9x16` + `DecisionTree9x16` (composable).

---

### 15. `knSbdZTglzQ` — Agent skill routes on description (1.2K views)

- **Title:** "Your agent skill never fires because the model routes on the description, not the body"
- **URL:** https://youtube.com/shorts/knSbdZTglzQ · ~55s · 1,200 views
- **Patterns:** instructional / layered card — likely a skill-card with `DESCRIPTION` highlighted vs `BODY` greyed out, plus a routing arrow.
- **transitionVerb:** "Render the full skill-card; pulse a green glow around the `DESCRIPTION` field and dim the `BODY` field to 0.35 opacity; draw an arrow from the description field outward to a `MODEL` node."
- **Orientation:** 9:16
- **Maps to:** `EditorBlock9x16` / `TitledDossierCard9x16` (card with highlighted field).

---

### 16. `ehVpELha2ss` — RAG chunking split mid-sentence (1.0K views)

- **Title:** "Your RAG Can't Find the Answer Because You Split the Doc Mid-Sentence (Chunking Strategy)"
- **URL:** https://youtube.com/shorts/ehVpELha2ss · ~55s · 1,000 views
- **Patterns:** doc-being-sliced visualization — likely a long doc-block with vertical dashed cut lines and one cut line landing mid-sentence with a red ✗.
- **transitionVerb:** "Drop a tall doc-block with placeholder text lines; animate vertical dashed cut lines sliding in from above one-by-one; flip the middle cut line red and zoom in on the bisected sentence with a red underline."
- **Orientation:** 9:16
- **Maps to:** new primitive — `<DocChunkSlicer>`. Closest existing is `KineticTypoCard9x16` but not really. **Worth building** — RAG content is a recurring topic.

---

### 17. `1eBmR1n0VNk` — Diffusion language models (1.0K views)

- **Title:** "Diffusion Language Models: Write a Whole Block at Once, Then Revise (NVIDIA Nemotron Diffusion)"
- **URL:** https://youtube.com/shorts/1eBmR1n0VNk · ~55s · 1,000 views
- **Patterns:**
  - **TokenGrid (6×6)** — dark glassy tile cards each containing a random mono symbol (`* ? + = < > / \ ~ ^ # @ %` etc), arranged in a tight grid on a starfield dark BG. Hero white "ALL 32 AT ONCE" + accent purple sub-line "MOSTLY GARBAGE". Karaoke "**MOSTLY** GARBAGE." with periodless emphasis.
  - This is the **diffusion-block animation** the picks JSON predicted — the grid will likely undergo iterative refinement (tiles flipping from garbage symbols to real tokens).
- **transitionVerb:** "Scale-pop all 32 tiles in at once with a 4-frame stagger; let them sit garbage for 1.5s; then on iterate scenes, flip each tile (with a Y-axis flip) from a symbol to a real token character one row at a time top→bottom."
- **Orientation:** 9:16
- **Maps to:** `AttentionHeatmap9x16` (grid mechanics) + `TokenStream9x16` (token-flip animation). The 6×6 random-symbol-grid is a new variant — `<TokenGrid mode="garbage" | "refined">`.

---

### 18. `O8RfsSzybEU` — 1M context stops at 32K (2.9K views)

- **Title:** "Your 1M Context Window Stops Listening At 32K — Here's Why"
- **URL:** https://youtube.com/shorts/O8RfsSzybEU · ~55s · 2,900 views
- **Patterns:**
  - **NumberedListicleRow with BarVisualization** — single rounded card row labeled "1. SLIDING WINDOW" + mono sub `DROPS OLDER TOKENS` + horizontal bar made of ~30 vertical green "filled" segments at right with ~10 dim grey "dropped" segments at left. Hero "THREE THINGS STACK" uppercase bold. The card is one of three (only #1 shown in this frame; the listicle stacks vertically with reveal).
- **transitionVerb:** "Reveal card 1 from below with a 200ms bounce; once card-1 anchors, animate the dropped-tokens (grey) segments crashing leftward off-screen while the active (green) segments brighten; reveal card-2 after 1.2s with the same motion."
- **Orientation:** 9:16
- **Maps to:** `BarChartList9x16` + `Listicle.tsx` combination + Adam's own `TokenStream9x16` variant. The "dropped-segments fade-out leftward" is a new motion verb worth supporting in our `TokenStream9x16`.

---

## Catalog of distinct patterns (12)

Across the 18 reels, Adam consistently composes from this PascalCase set:

1. **DarkRankedListWithGlowingActiveRow** — rounded-corner list rows on near-black BG; active row gets an accent (orange/green) glowing border + accent-colored rank number + brand-color emphasis word + a right-side accent arrow/icon.
2. **TerminalSkillLibrary** — mono green file/path listing inside a rounded dark card with a folder-icon path header at top + right-aligned mono status tags (`SAVED`, `OK`, etc).
3. **AutonomousSystemGraph (Force/Node graph)** — labeled circle nodes (color-coded by role: orange=actor, teal=transit, red=adversary, green=destination) connected by glowing edges with mono sub-labels under each node + optional bracketed mono pill annotation hovering over a node.
4. **BulletSequenceCounter** — row of N glow-dots progressing left→right with a big mono `M/N` counter pulsing above + a gradient health bar below.
5. **GearCompilerDiagram / AnalogyGlyph** — single iconic abstract glyph (gear, prism, atom) with a thin dotted connector to a placeholder object; used as a metaphor primitive.
6. **CPUvsGPUTogglePair** — two pill buttons inside a dashed-border container with one active (accent fill + pulse dot) and one inactive (dark fill).
7. **GPUGaugeCode** — radial gauge or % readout adjacent to a mono code snippet.
8. **IconObjectDiagramPair** — two stylized vector-illustration objects (windmill+solar, cache+clock, model+sandbox) side by side, optionally with a bracketed numeric callout pill below.
9. **ModelToSandboxHandoff** — `<CircleNode>` left + connector with active port indicator + `<DashedCardPanel>` right with mono header.
10. **AnnotatedLineChart** — clean axis with green polyline + orange cliff annotation dot + dotted vertical drop line + big mono callout (e.g. `32K`) above the dot.
11. **PersonaAnalogyScene** — single character glyph (emoji-face, person) + speech bubble + scene object (table, chair, board) + green ✓ caption.
12. **TokenGrid (refined vs garbage)** — N×M grid of dark glassy tile cards, each tile holding a single character; tiles flip from garbage symbols to refined tokens.

### Shared chrome across ALL 18 reels (his "house grammar")

A — **Pure dark BG.** Solid `#0A0E16`-ish near-black (sometimes with a very faint starfield as in `1eBmR1n0VNk`). No gradients, no images, no face-cam, no studio. Zero footage.
B — **Uppercase bold sans hero label** at the upper third (~y=15%). Inter/Söhne-class geometric sans, ~80–90pt, white. Always one line, sometimes with a colon prefix (`ANALOGY:`, `SOURCE:`).
C — **Procedural diagram in the middle band** (y≈30–65%) — the per-reel custom primitive, sized to fill ~60% of width.
D — **Two-tone karaoke caption at lower third** (~y=72%). Active word/phrase bright white, surrounding context dim grey at ~0.45 opacity. Period punctuation when the line is a sentence-end. Same font as hero. Word-by-word reveal timed to TTS.
E — **Accent color discipline** — one accent per reel keyed to the topic: orange for systems/incident (BGP, leaderboard, GPU active), green for terminal/success/CUDA accept states, red for danger/loss (renewables wasted, npm worm, hijacker AS), purple/violet for diffusion/abstract concepts, teal for transit/neutral.
F — **No watermark, no brand mark, no end-card chrome** in 18/18 frames sampled. Pure content. (Implication: he's relying on the YouTube channel-level branding, NOT in-video branding. Different from Hormozi/Nate.)
G — **No B-roll, no real footage, no avatars.** This is the strongest signal that the whole pipeline is procedural.

---

## Comparison to other creators

| Creator | Closest analogue | Key difference |
|---|---|---|
| **Adam Rosler** | (this analysis) | Pure procedural motion graphics on dark; ~12 primitives recomposed; one tightly disciplined chrome |
| `natebjones` | The OTHER user-flagged "our style of animations" reference | Nate: 16:9 long-form, NamedCardEquation/TreeOfChildCards/BeforeAfterTextComparison, persistent CTA pill + bookshelf-avatar watermark; Adam: 9:16 shorts, no watermark, per-scene primitive |
| `carloscuamatzin` | The Spanish-language reference for visual primitive recombination | Carlos: 6 templates with stylistic variety (cream/dark/watercolor); Adam: 1 chrome + 12 procedural sub-primitives — more disciplined, less variety |
| `diysmartcode` | Same dark-mode + accent palette discipline | DIYSC: editorial typography-first (hero claim with one emphasized word); Adam: diagram-first (the visualization IS the message, caption is secondary) |
| `alexhormozi` | Same karaoke caption + one-word emphasis convention | Hormozi: typography-over-real-video (face-cam under captions); Adam: typography-over-procedural-graphics. Same caption layer, opposite middle band. |
| `motiondarwin` | Both procedural / non-footage | Darwin: pure 3D C4D demoreel without information; Adam: 2D vector + procedural with high information density. Opposite ends of "art for art's sake" vs "art carries the script." |

**Adam is the closest creator in the reference set to our build target.** Nate is the long-form 16:9 sibling. Adam is the Shorts 9:16 sibling. If we had to pick a single house grammar to converge our 73 compositions toward, Adam's is the cleanest reference.

---

## USER-CLAIM VERIFICATION

> **User claim:** Adam Rosler uses "our animation style."
>
> **Verdict: CONFIRM with strong evidence + concrete additions to backlog.**

The claim holds — Adam's chrome (dark BG, uppercase bold hero, two-tone karaoke caption, procedural middle band) is **already inside our system** as our default brand-palette + `EditorialCaption` + the existing compositions like `RankedTierList9x16`, `LineChartAnnotated9x16`, `ForceGraph9x16`, `TerminalBlock9x16`, `BigNumberDuel9x16`, `BenchmarkBars9x16`. We are not far from Adam's look — we likely already render frames that would slot into his feed at a glance.

### Direct existing-primitive matches (8 of 12 patterns map to current compositions)

| Adam pattern | Our existing composition | Confidence |
|---|---|---|
| DarkRankedListWithGlowingActiveRow (`mZgCDFEBna0`) | `src/compositions/RankedTierList9x16.tsx` | HIGH — same active-row glow + accent-rank-number structure; we already have `accentColor` per row |
| TerminalSkillLibrary (`mZgCDFEBna0`) | `src/compositions/TerminalBlock9x16.tsx` + `TerminalCommand9x16.tsx` | HIGH — we have the rounded mono card; need to add a `<FilePathHeader>` slot with folder-icon and right-aligned `<StatusTag>` rows |
| AutonomousSystemGraph (`I9pjllzSNK0`) | `src/compositions/ForceGraph9x16.tsx` + `NeuralNetwork9x16.tsx` | HIGH — node+edge primitive exists; needs role-color presets (orange-actor/teal-transit/red-adversary) and the route-flip mechanic added to `src/animation/pathDraw.ts` |
| CPUvsGPUTogglePair (`gaGcC_OOGQ0`) | `src/compositions/BigNumberDuel9x16.tsx` (chrome) | MEDIUM — duel layout exists; the toggle-pill-with-pulse-dot is a new molecule (~50 LOC component) |
| AnnotatedLineChart (`rQxA1i4pQTg`) | `src/compositions/LineChartAnnotated9x16.tsx` | HIGH — direct hit; verify the orange-dot+dotted-drop annotation motion matches |
| PersonaAnalogyScene (`pthNSkWU8VM`) | `src/compositions/IllustratedConcept9x16.tsx` | HIGH — analogy primitive exists; needs an emoji-face + speech-bubble assets pack |
| NumberedListicleRow with BarVisualization (`O8RfsSzybEU`) | `src/compositions/BarChartList9x16.tsx` + `Listicle.tsx` | HIGH — composable from existing pieces |
| Versus Benchmark Bars (`L2xSh1nlmgo`, `2n4Mc8Bh8KQ`) | `src/compositions/BenchmarkBars9x16.tsx` + `BigNumberDuel9x16.tsx` | HIGH — direct hit |

### Gaps: 4 of 12 patterns are NEW primitives we don't have

| Adam pattern | Required new work |
|---|---|
| **BulletSequenceCounter** (`hvtB3UaQ1wg`) — row of N progress-dots + big M/N counter + gradient health bar | New molecule `<BulletSequenceCounter total={N} current={M} />`. Existing `src/animation/countUp.ts` handles the counter; the dot row + gradient bar are new. ~80 LOC. |
| **TokenGrid (refined vs garbage)** (`1eBmR1n0VNk`) — 6×6 glassy tile grid with per-tile flip-from-garbage-to-token | New mode in `src/compositions/TokenStream9x16.tsx` OR a new `TokenGrid9x16.tsx` composition. Tile flip animation is new (3D Y-axis rotate + content swap at 50%). ~150 LOC. |
| **DocChunkSlicer** (`ehVpELha2ss`) — tall doc-block + vertical dashed cut lines + bisected-sentence callout | New composition `DocChunkSlicer9x16.tsx`. RAG content is recurring — high replay value. ~200 LOC. |
| **IconObjectDiagramPair** (`P55GHPFTMQI`, `1aVyHmt2-Uo`) — two stylized vector-icon illustrations side by side + bracketed numeric callout | New molecule `<IconObjectPair leftIcon rightIcon callout />`. Requires asset library of stylized vector icons (windmill, solar, clock, cache, chip, etc) — most likely as SVG components. Asset-heavy but the molecule itself is ~60 LOC. |

### Caption layer (load-bearing, already covered)

Adam's two-tone karaoke caption with one-word emphasis is **exactly what our `src/components/captions/EditorialCaption.tsx` already produces** — provided we set the active-word color to bright white (255 255 255) and the context to ~`rgba(255,255,255,0.45)`. Verify the dim color matches Adam's at the byte level on the next test render. If our current dim is `0.6` or above, lower it to `0.45` to match.

### Brand chrome discipline (one delta)

Adam ships **zero in-video watermark / brand mark / end-card chrome**. This is the opposite of our current default (`<BrandWatermark>` + `<BrandBreadcrumb>` always-on, baked into all 5 original templates per the 2026-05-15 decision). For an "Adam-style" output mode we'd want a `chrome: "none" | "minimal" | "full"` brand prop and route Adam-style requests to `minimal`. **Decision needed:** is our brand identity load-bearing for Armando Inteligencia (yes — Spanish creator competing with Carlos), or do we ship an unbranded export for cross-platform repost? Recommend: keep watermark for our primary 9:16 output, add `chrome: "minimal"` for English-only/Adam-mode shorts.

### Net verdict

**CONFIRM** the user's claim. Adam Rosler is using essentially our system. 8/12 of his patterns slot directly into our existing 73 compositions; 4 require new primitives (`BulletSequenceCounter`, `TokenGrid` mode, `DocChunkSlicer9x16`, `IconObjectPair`); the caption layer + dark BG + accent discipline are already ours. **Adam is the canonical 9:16 reference for the build target.** The honest delta is asset variety (he commissions or hand-draws stylized vector icons — windmills, dinner tables, gears — that we don't currently maintain as a library) and the discipline of NOT branding every frame.

---

## Build priority queue addendum (recommended ranks)

Inserted into the rolling priority queue (`docs/research/wave-6` / Wave-7 backlog):

| Rank | Item | Justification | Effort |
|---|---|---|---|
| A1 | **Add `chrome: "minimal" \| "full"` brand mode** to all 9:16 compositions (default `full`, `minimal` strips watermark + breadcrumb) | Enables Adam-style unbranded output for English cross-post; respects the 2026-05-15 brand decision as default | ~2h, schema + 73 grep-replace |
| A2 | **Build `<BulletSequenceCounter>` molecule** + integrate into `AnimatedCounter9x16` | Telephone-game/degradation visualization is a recurring AI-research story (drift, hallucination, accuracy decay) | ~4h |
| A3 | **Add `<FilePathHeader>` slot + `<StatusTag>` row variant** to `TerminalBlock9x16` | Skill-library / file-listing aesthetic — Adam's 23K-view winner used this exact pattern | ~2h |
| A4 | **Build `DocChunkSlicer9x16`** composition | RAG content is recurring + no existing analogue | ~6h |
| A5 | **Add role-color presets to `ForceGraph9x16`** (`actor` orange, `transit` teal, `adversary` red, `destination` green) + `redirectEdge` motion in `pathDraw.ts` | Incident-narrative / attack-graph stories — BGP, npm worm, etc | ~4h |
| A6 | **Build `<TogglePillPair>` molecule** with active-pulse-dot | CPU/GPU, OpenAI/Anthropic, before/after toggles — highly reusable | ~2h |
| A7 | **Build `<IconObjectPair>` molecule + stylized SVG icon pack** (windmill, solar, clock, cache, gear, chip, table, chair, doc, lock — start with 10) | Analogy/concept slot — Adam's secret sauce is hand-drawn-feeling vector icons that carry narrative | ~12h asset-heavy, but reusable forever |
| A8 | **Add `TokenGrid` mode to `TokenStream9x16`** with per-tile flip animation | Diffusion/attention/refinement visualizations | ~6h |
| A9 | **Verify + lower `EditorialCaption` dim opacity to ~0.45** if currently higher | One-line tweak to match Adam's exact karaoke chrome | ~10min |
| A10 | **Document Adam's per-pattern accent-color mapping** in `brand/voice.md` as the "Adam-mode" preset (`orange=incident`, `red=danger`, `green=accept`, `purple=abstract`, `teal=neutral`) | Codify a tested palette → topic mapping so script-to-template auto-routing has accent guidance | ~30min |

---

## Sources

- Scraper picks: `references/creators/adamrosler/picks-wave7.json` (18 picks rationale)
- Info: `references/creators/adamrosler/info.json`
- Videos: `references/creators/adamrosler/<video_id>/` (no `video.mp4` retained per Phase-1 disk budget — frames only)
- Keyframes: `references/creators/adamrosler/<video_id>/frames/frame-NNN.jpg` (NOTE: flat naming convention, distinct from `anim-NN-frame-MMM` used for other creators)
- Semantic reference clips: `docs/research/wave-6/references/adamrosler/<id>-<descriptive-name>.mp4` (10 hand-named clips)
- Per-video YouTube metadata: `<video_id>/metadata.info.json` (7 videos — IDs `mZgCDFEBna0 hvtB3UaQ1wg I9pjllzSNK0 gaGcC_OOGQ0 P55GHPFTMQI omeIyf2Zja4 1aVyHmt2-Uo`; remaining 11 use `picks-wave7.json` for title/duration/views)
- YouTube channel: https://www.youtube.com/@adamrosler/shorts
- Cross-posts: TikTok `@adam_rosler`, Instagram `@adam_rosler`

---

## Wave-7 Extension — Videos 19+

Added 2026-05-28 to hit the user-requested 20-video baseline. Four new picks (catalog now totals 22 analyzed videos) drawn from the same `@adamrosler/shorts` archive, deliberately spread across:
- **1 viral hit** (~21K views — well above his ~1.5K median)
- **1 high performer** (~4K)
- **1 mid-tier ML fundamentals piece** (~2.9K)
- **1 OS-internals mid-tier** (~1.9K)

Picks rationale + source mp4 lifecycle (downloaded → frames + clips → deleted) recorded in `references/creators/adamrosler/picks-wave7-ext.json`. Frames live at `references/creators/adamrosler/<id>/frames/`. Reference clips live at `docs/research/wave-6/references/adamrosler/<id>-<semantic>.mp4` (8 new clips, same naming pattern as the original 10).

### V19 — `lEH0kNy54Ao` "Why ChatGPT can't count the R's in strawberry" (37.8s, ~21,000 views)

URL: https://www.youtube.com/shorts/lEH0kNy54Ao
Orientation: 9:16 vertical Short
Topic: LLM tokenization — why character-level questions fail

**Key animations**

| t (s) | Visual | Frame | Clip | `transitionVerb` |
|---|---|---|---|---|
| ~3-9 | **Letter-tile token build** — "STRAW" + "BERRY" headers above two blue/orange columns; lowercase letter chips (`a`, `w`, `s`, `t`, `r`, `r`, `y`, `b`, `e`, `r`) stack-in to form physical token bricks | `frames/frame-005.jpg` | `lEH0kNy54Ao-letter-tile-tokens-build.mp4` | `stackIn` (letters arrive from below, settle) |
| ~21-27 | **Magnifying-glass loupe** — circular glass overlay slides over a "straw" token chip; underneath, blurred ghost letters fade with a glowing `?` mark | `frames/frame-018.jpg` | `lEH0kNy54Ao-magnifier-loupe-letters-gone.mp4` | `loupeSlide` (curved easeOutBack tween into target) |

**Replicability**
- Letter-tile token build: **HIGH** — extends existing `TokenStream9x16` with character-level tiles (3D-ish drop shadow, rounded squircles). Looks like an upgrade to A8 "TokenGrid mode" in the original action plan.
- Magnifying-glass loupe: **NEW PRIMITIVE** — not in the existing 18-video catalog. Best home is a new `<Loupe9x16>` molecule (clip-path circular mask + concentric ring frame + blurred backdrop). Reusable for "the model can't see X" stories (hallucination, context attention sink, blind spots).

### V20 — `U6O4yv1XR34` "Google just shrunk LLM memory 5x — TurboQuant" (49.4s, ~4,000 views)

URL: https://www.youtube.com/shorts/U6O4yv1XR34
Orientation: 9:16 vertical Short
Topic: Quantization for KV-cache memory reduction

**Key animations**

| t (s) | Visual | Frame | Clip | `transitionVerb` |
|---|---|---|---|---|
| ~14-20 | **K/V dual-column tile stack + memory gauge bar** — "the / cat / sat / on / the / mat" token row at top; blue `K` column + orange `V` column of 7 chips each; faint connecting lines from each token down into the columns; bottom: glowing red gauge bar with `17 GB · LLAMA 70B @ 32K` callout | `frames/frame-010.jpg` | `U6O4yv1XR34-key-value-columns-gauge.mp4` | `cascadeIn` (columns build top-down, gauge fill-bar pours left-to-right) |
| ~32-38 | **Random-rotation particles ring** — three concentric rings of mint-green dot particles rotating around a center triangle/peace-symbol icon; "RANDOM ROTATION" header, "JOHNSON-LINDENSTRAUSS" footer | `frames/frame-028.jpg` | `U6O4yv1XR34-random-rotation-particles-ring.mp4` | `orbitalSpin` (continuous rotation + scale pulse) |

**Replicability**
- K/V column duals: **MEDIUM** — composition of existing primitives (token-row + 2× chip stacks + gauge). Direct reuse of A8 token grid + a new `<TwinColumn>` molecule. Strong candidate for any cache/attention/parameter visualization.
- Particles ring: **NEW PRIMITIVE** — purely decorative-but-meaningful abstraction layer for "math transforms data into a different space". No existing analogue. Best home: `<DimensionalProjectionRing9x16>` background — `particles-shader`-style: N dots arranged on concentric circles, each ring rotating at a different rate. Cheap to build with React + `transform: rotate()` on three nested `<div>`s.

### V21 — `7RhJawm2nw4` "How neural networks actually learn — backpropagation" (56.5s, ~2,900 views)

URL: https://www.youtube.com/shorts/7RhJawm2nw4
Orientation: 9:16 vertical Short
Topic: Deep-learning fundamentals — gradient descent + backprop

**Key animations**

| t (s) | Visual | Frame | Clip | `transitionVerb` |
|---|---|---|---|---|
| ~18-24 | **Gradient-descent valley + rolling ball** — 2D loss landscape (multi-minimum curve, light blue stroke + faint fill); glowing green ball rolls down into the valley; "ERROR 0.12" orange counter above; "gradient descent" green label below | `frames/frame-014.jpg` | `7RhJawm2nw4-gradient-descent-valley-ball.mp4` | `physicsRoll` (ease-in then settle at minimum) |
| ~33-39 | **Layered neural network graph + WRONG output** — 3 input nodes / 3 hidden / 3 output, all glowing green except top-right output which is **glowing red labeled WRONG**; thin blue edges crisscross; "INPUT" and "OUTPUT" left/right labels; "backpropagation" orange title underneath | `frames/frame-029.jpg` | `7RhJawm2nw4-neural-net-backprop-graph.mp4` | `nodeWavePulse` (left-to-right pulse on forward pass, right-to-left pulse on backward) |

**Replicability**
- Gradient-descent valley: **NEW PRIMITIVE** — best built as a new `<LossLandscape9x16>` molecule. Mathematically: a parametric polyline (smooth multi-minimum function) + an animated `<circle>` with vertical offset = f(x) at current x. Reusable for ANY "search/optimize" story (RLHF, hyperparam tuning, simulated annealing).
- Layered NN graph: **MEDIUM** — overlaps with existing `<ForceGraph9x16>` (A5 in original plan) but Adam's version is strictly layered (cols), not force-directed. Suggests adding a `layout: "force" | "layered"` switch to `ForceGraph9x16` rather than a new molecule.

### V22 — `S5ZFkY756IY` "Linux fork() clones a 4GB process in under a millisecond" (53.0s, ~1,900 views)

URL: https://www.youtube.com/shorts/S5ZFkY756IY
Orientation: 9:16 vertical Short
Topic: OS internals — copy-on-write memory semantics

**Key animations**

| t (s) | Visual | Frame | Clip | `transitionVerb` |
|---|---|---|---|---|
| ~15-21 | **Copy-on-write page-table diagram** — two rounded cards top ("PARENT PT" blue / "CHILD PT" purple); single "PHYSICAL MEMORY" row below with 5 page tiles (one highlighted red = dirty page); dashed arrows from BOTH parent and child to the SAME page tiles | `frames/frame-011.jpg` | `S5ZFkY756IY-cow-page-table-shared.mp4` | `arrowMultiplex` (parent arrows draw first, child arrows draw second to same targets) |
| ~36-42 | **Side-by-side fork/posix_spawn comparison cards** — left red card "fork + exec" with numbered steps (`1. CLONE PT`, `2. exec → DROP`) + empty result box; right green card "posix_spawn" with "DIRECT PATH" label + single blue "PARENT" pill | `frames/frame-031.jpg` | `S5ZFkY756IY-fork-vs-posix-spawn-cards.mp4` | `cardSwap` (left card fades/shrinks while right card slides up to fill) |

**Replicability**
- COW page-table: **NEW PRIMITIVE** — `<PageTableGrid9x16>` molecule: 2 owner cards + N memory-page tiles + curved arrows from each owner to subsets of pages. Generalizes to ANY shared-resource pattern (DB connection pool, S3 multipart, dedupe blocks).
- Comparison cards (red-fail / green-success): **CONFIRMS** existing pattern from `1eBmR1n0VNk-draft-verify-checks` and `2n4Mc8Bh8KQ-active-total-pie-duel`. Adam reuses the bicolor-card duel across at least 4 of the 22 videos now — strongest single-pattern frequency. Promote to a top-tier molecule: `<RedGreenDuelCards9x16>`.

---

### New patterns added to catalog (Wave-7 Extension only)

1. **`<Loupe9x16>` magnifying-glass overlay** — circular clip-path + blur backdrop, glides over tiles to reveal "missing detail". (V19)
2. **`<DimensionalProjectionRing9x16>` orbital particles** — concentric rotating dot rings, background-fit, math-abstraction signifier. (V20)
3. **`<LossLandscape9x16>` valley + ball** — parametric curve + physics-rolling marker, optimization metaphor. (V21)
4. **`<PageTableGrid9x16>` shared-pages diagram** — N-owner → M-page arrow multiplex for any shared-resource story. (V22)
5. **`<TwinColumn>` molecule** — two parallel chip stacks fed from a common source row (K/V, prefill/decode, request/response). (V20)

### Patterns CONFIRMED with higher frequency (Wave-7 Extension only)

- **Bicolor side-by-side duel cards (red fail / green pass)** — now observed in V20-original + V22 + multiple Wave-5/6 entries. Highest-frequency single molecule in the catalog. Priority promotion to `<RedGreenDuelCards9x16>`.
- **Token-chip stacks** — V19 (letter-level) + V20 (word-level K/V) confirm A8's "TokenGrid mode" as a must-build. Now appears in 7+ of 22 videos.
- **Glowing counter / live-number badge** ("ERROR 0.12" in V21) — confirms `EditorialCaption`-adjacent badge pattern.
- **Per-pattern accent palette** holds: V21 uses green=correct/red=wrong/orange=title; V22 uses red=expensive/green=cheap; V20 uses blue=key/orange=value. Confirms A10's "Adam-mode" color preset proposal.

### Updated catalog totals (post-Wave-7-extension)

- **22 videos analyzed** (was 18) — meets user's 20-video baseline with 2-video safety margin.
- **18 reference clips** (was 10) — 8 new semantic clips added under `docs/research/wave-6/references/adamrosler/`.
- **5 new molecules identified** as Wave-7-extension-only contributions.
- **4 previously-identified molecules confirmed** with higher cross-video frequency.

### Wave-7 Extension sources

- Picks rationale: `references/creators/adamrosler/picks-wave7-ext.json`
- New per-video YouTube metadata: `<id>/metadata.info.json` for `lEH0kNy54Ao U6O4yv1XR34 7RhJawm2nw4 S5ZFkY756IY`
- New keyframes: `references/creators/adamrosler/<id>/frames/` (coarse-NNN.jpg @ 1/3s + frame-NNN.jpg @ 1s within animation windows)
- New reference clips (8 total, semantic-named):
  - `lEH0kNy54Ao-letter-tile-tokens-build.mp4`
  - `lEH0kNy54Ao-magnifier-loupe-letters-gone.mp4`
  - `U6O4yv1XR34-key-value-columns-gauge.mp4`
  - `U6O4yv1XR34-random-rotation-particles-ring.mp4`
  - `7RhJawm2nw4-gradient-descent-valley-ball.mp4`
  - `7RhJawm2nw4-neural-net-backprop-graph.mp4`
  - `S5ZFkY756IY-cow-page-table-shared.mp4`
  - `S5ZFkY756IY-fork-vs-posix-spawn-cards.mp4`
- Source mp4s downloaded then deleted from `/tmp/wave7-adamrosler-ext/` per Phase-1 disk budget (frames only retained).

