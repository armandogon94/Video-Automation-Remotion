# austin.marchese (@austin.marchese) — ANALYSIS

**Platform:** YouTube long-form (16:9) · **Added/analyzed:** 2026-06-26
**Sample:** 29 videos downloaded (28 analyzed; `jdLFeBkiy3M` was removed/restricted). 223 contact
sheets (1/3s frame sampling). Source videos deleted per project policy; frames + sheets kept under
`references/creators/austin.marchese/<id>/{frames,sheets}/`.
**Anchor:** `TP73qyFWDcY` "Paste This Into Claude, It'll Make You Build 10x Faster" — the video the
user flagged as looking like nateherk's animations.

> **Triangulation status (this is a 3-reviewer study, per user request):**
> - ✅ **My catalog** (this doc) — 4-phase Workflow `wm4rm0qu3`: 28 scan agents → synthesize →
>   adversarially-verify NEW/PARTIAL claims vs the 130-comp inventory → build-specs for confirmed gaps.
>   ⚠️ Scan agents ran on **Haiku** (fast, but weaker at subtle motion-craft) — treat "0 gaps" as a
>   **structural** finding pending craft confirmation from the deeper reviewers.
> - ⏳ **Codex GPT-5.5 (xhigh)** — per-video `docs/research/austin-anim/ANALYSIS-FROM-CODEX-<id>.md`
>   (much deeper craft detail: ~40–47 patterns/video). In progress + 6am-cron mop-up on 5h limit.
> - ⏳ **Gemini 3.5 Flash (Antigravity)** — user runs `docs/research/austin-anim/ANTIGRAVITY-PROMPTS.md`
>   tomorrow (5h window was spent). → `ANALYSIS-FROM-GEMINI-FLASH-<id>.md`.
>
> The BUILD decision is deferred until all three are in. This doc records reviewer #1.

---

## Who they are
English **Claude / Claude Code educational** creator. Long-form (12–16 min) explainers:
"How Anthropic Employees ACTUALLY Use Claude Code", "How Alex Hormozi ACTUALLY Uses AI",
"Stop Prompting Claude. Start Loop Engineering.", "How I Used Claude Code to Build a $481k App",
"25 Things You Didn't Know OpenClaw Could Do". Talking-head + screen-rec **plus** a dense
motion-graphics layer — which is why he reads as a nateherk cousin.

## Verdict (reviewer #1): liquid-glass family, RESKINNED — 0 verified new-template gaps

austin's motion vocabulary **100% overlaps nateherk's liquid-glass system; the only difference is
color** (austin = warm **burgundy/magenta/orange**; nate = cool **cyan/teal/green**). Identical
easing (cubic-out + overshoot/elastic), timing (~150ms stagger, ~1.5s glow-pulse cycle), and
kinetic word-by-word typography. **No new motion mechanics.** All 19 distinct animations map onto
our existing 130 comps.

| # | Animation | In N/28 vids | Verdict | Covered by | Appeal |
|---|---|---|---|---|---|
| 1 | glass-card-slide-enter | 26 | COVERED | LayerCardStack9x16(/Dark), QuoteCard9x16Dark | high |
| 2 | kinetic-text-reveal | 22 | COVERED | KineticMacroTypeOpener9x16, KineticTypoCard9x16, AnimatedText9x16BlurIn | high |
| 3 | stagger-list-reveal | 19 | COVERED | BrollListicle9x16, LayerCardStack9x16 | high |
| 4 | numbered-step-badge | 18 | PARTIAL→covered | LayerCardStack9x16 (scale-in+glow, custom counts) | high |
| 5 | code-terminal-reveal | 18 | COVERED | TerminalBlock9x16, TerminalCommand9x16 | high |
| 6 | speaker-overlay-chip | 16 | COVERED | SpeakerOverlayScene9x16/16x9 | high |
| 7 | numeric-count-animation | 15 | COVERED | AnimatedCounter9x16, BigNumberHero9x16 | high |
| 8 | glow-pulse-border | 14 | PARTIAL ⚠️unverified | StatCardSequenceWithUnderlines9x16 (embedded, not isolated atom) | medium |
| 9 | flowchart-diagram | 14 | COVERED | PipelineFlow16x9/9x16, DiagramExplainer9x16 | high |
| 10 | full-screen-text-overlay | 13 | COVERED | KineticMacroTypeOpener9x16, OpeningTitleCard9x16 | high |
| 11 | network-diagram-animate | 12 | COVERED | ForceGraph9x16/16x9, NeuralNetwork9x16 | high |
| 12 | quote-card | 12 | COVERED | QuoteCard9x16(Dark) | high |
| 13 | underline-accent-draw | 11 | COVERED | PaintStrokeRibbonBanner16x9, DocumentHighlightSwipe16x9 | medium |
| 14 | bar-chart-animation | 10 | COVERED | BarChartList9x16, BenchmarkBars9x16 | high |
| 15 | section-title-divider | 9 | COVERED | SectionDividerTitleCard16x9, TitleCardKineticTwoLine16x9 | medium |
| 16 | comparison-cards-pair | 8 | COVERED | ModelComparison2x2Grid16x9, BeforeAfterText16x9 | medium |
| 17 | data-viz-heatmap | 5 | COVERED | AttentionHeatmap9x16Dark, MatrixGridHeatmap9x16 | low |
| 18 | floating-label | 4 | PARTIAL→covered | FloatingCaption (needs glowColor + rotation props) | medium |
| 19 | sparkline-chart | 3 | COVERED | Sparkline9x16, LineChartAnnotated16x9 | low |

**Adversarial verify result:** 0 confirmed real gaps. `numbered-step-badge` → covered by
LayerCardStack (numbered scale-in+glow, custom counts). `floating-label` → covered by FloatingCaption
(core motion present; would benefit from a configurable `glowColor` + optional `rotationDegrees` —
"trivial additions, not a new build"). `glow-pulse-border` → its verify agent failed to return
structured output, so it's **unverified**, but by frequency (14/28) it's the clearest reusable
extraction.

## The genuine (small) additive opportunities — pending Codex/Gemini confirmation
Not new templates — the value of studying austin (and nate) is the **liquid-glass *material*** itself:
1. **`GlowPulseOverlay` atom** — wraps any element with the signature glow-pulse border cycle
   (opacity ~1.0→0.4→1.0, ~1.5s), color-parameterized. Lets us add the look to existing comps.
2. **`FloatingCaption` enhancement** — add `glowColor` (themed) + optional `rotationDegrees`.
3. **Liquid-glass recolor theme** — rebrand austin's burgundy/magenta/teal to our navy #1B3A6E /
   gold #D4AF37 / cream #FAF7F2 as a reusable glass card treatment.

## nate ↔ austin
**100% motion overlap, 0% color overlap.** Confirms the liquid-glass system is the cross-creator
signature worth owning as a *material/atom layer*, not as a pile of duplicate templates. Same honest
shape as the rileybrown.ai pass (coverage confirmation), but here with a real reusable-atom takeaway.

## Method
- Workflow `wm4rm0qu3`: 28 parallel scan agents (Haiku) over 223 sheets → 580 motion moments →
  1 synthesis agent → 3 adversarial-verify agents (1 failed StructuredOutput) → spec phase (0 specs,
  since 0 verified gaps). Raw result: task output `wm4rm0qu3` / `docs/research/austin-anim/`.
- Codex + Gemini reviewers append their per-video MDs under `docs/research/austin-anim/`.

---

## 2026-07-06 re-check (+2 new uploads since the 2026-06-26 study)

**Channel diff:** `yt-dlp --flat-playlist` vs the 29 analyzed IDs → 2 genuinely NEW uploads
(everything else in the diff is pre-study back-catalog, out of scope by design; `jdLFeBkiy3M`
is live again after being dead at study time):

| id | title | dur | verdict |
|---|---|---|---|
| `HGCHgD4uGgY` | 8 Claude Loops to Build 10x Faster | 17:11 | Same liquid-glass system. ONE uncataloged layout: **dashed circular feedback-loop diagram** (4 glass station chips on an ellipse, sequential pop-ins, dashed arcs drawing between stations with arrowheads, over blurred+dimmed footage, ~t=450–470). → **BUILT** as `FeedbackLoopCycle16x9`/`9x16` (shared core + thin wrappers). |
| `2fc0NX9vIJ8` | How to Build A Self-Improving System with Claude Code | 16:46 | Same system. No new layouts. Physical whiteboard/marker cutaways (not a template — real-world footage). |

**Craft notes (no new atoms):** the red/pink clause-highlight + strikethrough emphasis inside
prompt cards is the `warm` theme of our existing `ClauseHighlightPhrase` (token, not a fork);
sentence captions with an inline red keyword = our editorial register; numbered-chip rows,
quote cards, comment cards, logo chips, red screenshot-callout boxes all already covered.
The 2026-06-26 three-reviewer verdict (**austin = nateherk reskinned warm, atom layer not
template layer**) HOLDS for both new videos.

**Pipeline dogfood (2026-07-06):** cut a 22 s clean talking-head window from `2fc0NX9vIJ8`
(t=292–314, videos KEPT under `<id>/video.mp4` for this purpose) and ran it through
`npm run autoedit -- --render` (whisper EN → silence-trim → suggestOverlays →
SpeakerOverlayScene16x9). Result: captions + handle chip production-clean over his footage;
the run EXPOSED AND FIXED a critical EDL bug — overlay `fromFrame/toFrame` were dropped and
every suggested overlay fired at scene t=0 instead of its beat (fixed in commit `9ec50d2`;
the "99" stat callout now pops exactly on the spoken word). Outputs:
`output/autoedit/austin-pipeline-test2-edit.mp4`, plan at `output/austin-test/editplan2.json`.
