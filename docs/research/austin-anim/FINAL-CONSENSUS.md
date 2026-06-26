# @austin.marchese — FINAL 3-Reviewer Consensus

**Reviewers:** #1 Opus 4.8 (re-run) · #2 Codex GPT-5.5 xhigh · #3 Gemini 2.x Flash
**Videos analyzed:** 29 (full back-catalog)
**Date:** 2026-06-26
**Status:** LOCKED. Gemini CONFIRMS the plan. No change to the build list.

---

## TL;DR

> Gemini (#3) **confirms** the plan. It does **not** change it.
>
> All three reviewers agree: **austin = the nateherk liquid-glass system RESKINNED warm** (burgundy / magenta / rose / orange / gold over near-black). **0 net-new LAYOUT templates** — every layout family Austin uses is already covered by our 130-comp library. The genuine additive surface is an **ATOM layer**, not a template layer. Every atom Gemini flags as "a custom primitive we don't currently support" is **already on the locked build list** (LitSphereGlyph, ArcLightWipe) or **already shipped in source** (scramble-decrypt). Gemini surfaced **zero buildables that Opus + Codex missed**.

---

## 1. Three-way agreement: YES

| Claim | Opus #1 | Codex #2 | Gemini #3 |
|---|---|---|---|
| austin = reskinned nateherk (warm palette, same glass grammar) | ✅ | ✅ | ✅ (29/29 MDs CONFIRM verbatim) |
| 0 net-new layout templates (design-gap level) | ✅ | ✅ | ✅ (29/29 MDs: "no net-new layout templates that represent a design gap") |
| Genuine additive = ATOM layer, not template layer | ✅ | ✅ | ✅ (flags atoms/primitives, never a layout) |

**three_way_agreement = TRUE.**

Gemini's standard header on all 29 videos: *"the motion-graphics system in this video is a warm-color reskin … of the nateherk liquid-glass system. There are no net-new layout templates that represent a design gap."* It then adds the same five craft caveats (lit orb, glow-arc, scramble, clause-highlight, ribbon-parallax) — these are **caveats on top of** the verdict, never contradictions of it. Gemini itself labels every one as a craft/atom signature, and explicitly uses the omit-or-fumble pattern across videos (orb is dropped in ~10 videos → "modular accent, not a system requirement") as **evidence for** the reskin verdict, not against it.

---

## 2. Does Gemini change anything? NO

**gemini_changes_anything = FALSE.**

Gemini's 172 "new-pattern" flags collapse, after source verification, into the exact atom set Opus + Codex already identified:

| Gemini flag (recurring) | Maps to | Status |
|---|---|---|
| Lit 3D specular orb ("requires a custom 3D sphere render atom") | **LitSphereGlyph** | Already P1 |
| Glow-arc magenta light-streak swoosh ("custom transition primitive not in our library") | **ArcLightWipe** | Already P1 |
| Scramble-to-resolve / per-character decrypt subtitles | `AnimatedText9x16` `scramble-decrypt` mode | **Already shipped** (verified, see §4) |
| Magenta clause/keyword highlight arriving 6–10f after text settles | **ClauseHighlightPhrase** | Already P1 |
| Prompt-card pedagogy (recipe card + portrait rail) | **PromptCardPedagogy** | Already P1 |
| Liquid magenta/orange ribbon chapter bumper | `PaintStrokeRibbonBanner16x9` + reskin | Covered (recombination) |
| Handwritten/overhead-paper worksheet + marker write-on + PIP | `WhiteboardScene9x16`, `FlipChartLiveDrawing16x9`, `WhiteboardOverheadHandDraw` atom | Covered |
| Terminal/CLI chapter slate, URL capsule, browser proof frame + PIP | `TerminalBlock`, `TerminalCommand`, 9 PIP/overlay comps | Covered |
| Numbered roadmap / step-card / chapter carousel / 4-ways carousel | `SceneSequencer`, `StatCardSequence…`, `SectionDivider…`, listicle family | Covered |
| Tree/flowchart/branching/exponential-curve diagrams | `DecisionTree`, `ForceGraph`, `PipelineFlow`, `NeuralNetwork`, `LineChartAnnotated` | Covered |
| Glass menu / project selector / board-member carousel | `CircularLogoCarousel`, `AppScreenCarousel`, card-stack family | Covered |

Everything Gemini calls an "extension" is a **recombination or warm reskin** of an existing layout — not a new buildable. The only things it calls genuinely uncovered ("custom atom" / "custom primitive not in our Remotion library") are the lit orb and the glow-arc swoosh — **both already on our P1 list.**

---

## 3. New candidates from Gemini (strict): NONE

**new_candidates_from_gemini = [] (empty).**

Strict test: a genuine new buildable = something Gemini identifies that (a) Opus + Codex did **not** already capture AND (b) is **not** already in source. Nothing passes. The two atoms Gemini pushes hardest (lit orb, glow-arc) were already independently source-verified by Opus as absent from the repo and placed on P1. The scramble it flags is already implemented. Zero net-new candidates.

---

## 4. Source verification (this review)

Run against `src/compositions/` (111 `.tsx` comps in this worktree; ~130 incl. atoms/scenes):

- **Scramble-decrypt — ALREADY SHIPPED.** `AnimatedText9x16.tsx` has a full `"scramble-decrypt"` reveal mode: seeded `mulberry32` PRNG (deterministic so SSR render matches Studio), settles **left-to-right over ~1.0s**, with a `scrambleCharPool` defaulting to `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*¿¡ñÑáéíóúÁÉÍÓÚ` (Spanish glyphs included). This is exactly Gemini's "per-character decrypt / broken glyphs settle L→R" signature. **Correctly DROPPED** from the build list — confirmed not a gap.
- **Lit 3D specular sphere — ABSENT (additive confirmed).** All `radial-gradient` hits in the repo are flat decorative vignettes/glows: `ConcentricHierarchyRadialCallout` (corner vignette), `RotatingVectorDial` (accent glow), `AgentThinking9x16` (a *breathing* soft orb — opacity/radius oscillation, **no specular hotspot, no shifting terminator**). None renders a lit sphere whose highlight + dark terminator shift on dock/overshoot. → **LitSphereGlyph is genuinely additive.** (Opus source-verification corroborated.)
- **Arc-wipe / light-streak / swoosh transition — ABSENT (additive confirmed).** Grep for `arcwipe|swoosh|lightStreak|light-streak|lightArc|light-arc` returns nothing. → **ArcLightWipe is genuinely additive.** (Opus source-verification corroborated.)
- **Prompt-card pedagogy / clause-highlight — ABSENT (additive confirmed).** Grep for `promptcard|clauseHighlight|clause` returns nothing. → **PromptCardPedagogy + ClauseHighlightPhrase are genuinely additive.**
- **Coverage of Gemini's "extensions":** whiteboard/paper (`WhiteboardScene9x16`, `FlipChartLiveDrawing16x9`), PIP/overlay (9 comps), terminal/CLI (5 comps), ribbon (`PaintStrokeRibbonBanner16x9`), chapter/step/divider/listicle (11 comps), diagrams/trees/flows (`DecisionTree`, `ForceGraph`, `PipelineFlow`, `NeuralNetwork`, `LineChartAnnotated`). All present → **0 new layout templates.**

---

## 5. LOCKED BUILD LIST

> No templates. Atoms + atom-props only. This is the final, locked surface.

### P0 — wrap/extend what already glasses
1. **liquidGlass tokens** — promote the warm-glass material (backdrop-filter blur + saturation + rim/inner-shadow + warm tint) into a reusable `BRAND` token set. Wraps existing `backdrop-filter` glass in `LayerCardStack`, `ModelNameChipComparison`, `FauxProductUI` so every comp can opt into nate/austin glass uniformly. Warm-vs-cool tint is a token, not a fork.
2. **GlowPulseOverlay** — two-stage border-settle → glow-bloom overlay atom (border locks first, glow blooms ~on-settle with overshoot). Drop-in over any card/badge.
3. **FloatingCaption props** — extend the existing `FloatingCaption` overlay with glow, slight rotation, and blur-resolve entrance props (no new comp).

### P1 — net-new atoms (source-verified absent)
4. **PromptCardPedagogy** — copyable prompt/recipe card + portrait rail, reduced internal motion (pause/copy-friendly).
5. **ClauseHighlightPhrase** — phrase-fitted highlight/underline that arrives 6–10 frames *after* the text settles (human-highlighter "second read"). Content-sized width.
6. **LitSphereGlyph** — lit 3D specular sphere for number/chapter orbs; specular highlight + dark terminator shift on dock/overshoot. (Opus + Gemini both confirm no flat-radial-gradient substitute exists in repo.)
7. **ArcLightWipe** — magenta light-streak arc transition that draws on dynamically to guide the eye across layout shifts. (No swoosh/arc transition exists in repo.)

### DROPPED
- **ScrambleResolveText** — `AnimatedText9x16` already ships `scramble-decrypt` (mulberry32, L→R settle, Spanish glyph pool). Building it again would be duplication.

---

## 6. Extra craft from Gemini (beyond the Opus 28 + Codex 18 set)

Genuine new craft details Gemini contributed that the prior two reviewers had not stated:

1. Orb is a **modular accent, not a system requirement** — proven by ~10 videos that drop the lit orb for flat pill indicators/standard icons while keeping the rest of the system intact (e.g. 38vBXioeOqc, 3UWxMPUko1k, 45JqVBihguo, 5hq9PMPBJT4, 7zZy1QTvokM, qOvc9IUKEIc, t9il-BN2wtM, yfeHoOkn2TI). → `LitSphereGlyph` should be an **opt-in prop on the step/chapter card**, not baked into every numbered card.
2. Scramble-decrypt is likewise **modular/optional** — present only on select Step bumpers (e.g. bV6 Step #3/#6, "letters spaced/missing/displaced for ~10–20 frames while the badge stays readable") and omitted entirely in most videos. → keep our `scramble-decrypt` mode as a per-reveal opt-in (it already is).
3. **Question-mark-orb anticipation pre-beat** (8Z6p): an orb shows "?" then morphs into the numbered step — a pre-reveal teaser state for `LitSphereGlyph`.
4. **Ribbon parallax is genuinely a moving background layer** in some videos (bV6 confirms the magenta/orange ribbon drifts independently of the foreground card) but a flat static gradient in others (0TZNQT3Eusc, YAS4ojuhbW4, 45JqVBihguo) — so ribbon drift is an **optional background-energy prop**, not a fixed device. Distinguishes a true parallax layer from a still gradient.
5. **Subtitle holds only the subtitle in scramble** while the main badge/step stays stable and readable (bV6) — scope the scramble to the secondary text line, not the headline, to protect readability.
6. **Two-channel document highlight semantics** (AnZ9): magenta = "attention/section focus" box vs blue/teal = "exact-text inline selection" — two distinct highlight roles that `ClauseHighlightPhrase` should support as variants (focus-box vs inline-text-select), plus green="done"/amber="exception" status rows.
7. **Glow blooms *after* the text/border locks** (bV6: "border glow blooms after the text locks") — sequencing detail reinforcing GlowPulseOverlay's two-stage timing (settle → bloom), independently observed by Gemini.
8. **Recurring coral/pixel mascot (OpenClaw-style) as a brand anchor** — appears across multiple videos (5hq9, E7RVKqyS_rg, 7zZy1, GN0yhCt9qeo) as a character mark; ours would be the Armando avatar-pixar watermark playing the same role (no new atom, brand-asset placement note).
9. **Decrypt/typewriter step titles inside a Claude Code terminal slate** (8Z6p) — the CLI frame itself becomes the numbered step container; covered by terminal comps + scramble mode, but the *combination* (terminal-as-chapter-container) is a useful preset pairing.

---

## 7. Verdict

**Gemini confirms the plan; it does not change it.** All three reviewers (Opus, Codex, Gemini) independently land on: austin = warm reskin of nateherk's liquid-glass system, **0 net-new layout templates**. The genuine additive surface is a small atom layer. The two atoms Gemini insists are "not currently in our Remotion library" (lit specular orb, glow-arc swoosh) were already on our P1 list and are re-confirmed absent in source. The scramble effect Gemini flags is already shipped. **No new buildables. Build list LOCKED:**

- **P0:** liquidGlass tokens · GlowPulseOverlay · FloatingCaption glow/rotation/blur-resolve props
- **P1:** PromptCardPedagogy · ClauseHighlightPhrase · LitSphereGlyph (opt-in) · ArcLightWipe
- **DROPPED:** ScrambleResolveText (duplicate of `AnimatedText9x16` scramble-decrypt)

Gemini's lasting contribution is **craft nuance, not scope**: orb and scramble are modular opt-ins (not system requirements); ribbon parallax is an optional moving-background prop; clause-highlight needs focus-box vs inline-text-select variants; glow blooms after lock; the orb supports a "?" anticipation pre-beat.
