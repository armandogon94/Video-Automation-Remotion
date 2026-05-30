# Nate B Jones — motion-graphics analysis (Voter #2)

> Independent vote. Voter #1 at `ANALYSIS-VOTE1.md`. Consensus document (when written) will live at `docs/research/wave-6/natebjones-consensus.md`.

---

## 1. Voter metadata

| Field | Value |
|---|---|
| **voter** | vote2 |
| **date** | 2026-05-27 |
| **channel** | @NateBJones (`https://www.youtube.com/@NateBJones`) |
| **videos analyzed** | 4 long-form + 4 shorts = 8 videos (all from `picks-vote2.json`) |
| **methodology** | Resumed from cached downloads in `/tmp/natebjones-vote2/videos/` (no re-download). Coarse scan was already complete (1 frame / 15 s on long-forms, 1 frame / 3 s on shorts). Read coarse frames as visuals, identified motion-graphic windows, dense-scanned each window at 1 frame / 1.5 s, extracted 10–15 s reference clips with `-an`. All artifacts use the `v2-` and `-v2.mp4` suffix to avoid colliding with voter #1's. |
| **artifacts written** | `references/creators/natebjones/animation-ranges-vote2.json` (9 entries) · 8 reference clips at `docs/research/wave-6/references/natebjones/*-v2.mp4` · 79 dense frames at `references/creators/natebjones/<videoId>/frames/v2-anim-*` |
| **independence guarantee** | Did NOT read `ANALYSIS-VOTE1.md`, `picks-vote1.json`, or `animation-ranges-vote1.json`. Voter #1 frames sharing the same per-video frame directories were ignored visually — only files prefixed `v2-` were generated and consulted. |

---

## 2. Channel overview

Nate B. Jones is an English-language AI/infra commentator on YouTube. His personal brand visually is **the helmet-and-glasses pixel/glyph mark** (a stylized beanie + glasses silhouette) which appears as: (a) a translucent watermark behind every full-screen graphic, (b) the icon inside his subscribe/handle chip in the lower-right of every talking-head shot, and (c) the favicon of his Substack. He records talking-head from a book/Lego-shelf room (long-form, in a navy cable-knit sweater + light beanie) and a different mic-and-castle-bookshelf room (shorts, in a Michigan hoodie + blue beanie). The visual mark is the helmet; the verbal hook is "infrastructure that nobody is talking about."

Production-wise this is a **two-mode channel**. Mode A (long-form, 1280×720 16:9, 20–46 min) is talking head + occasional dark-slate **kinetic title cards** and one or two **diagram payoffs per video** — extremely restrained, almost like Stripe Press in motion. Mode B (shorts, 608×1080 9:16, ≤90 s) is pure talking head + animated karaoke captions (green-and-white-on-black, per-word highlight), with the rare exception of an outro motion graphic on one of the four shorts. There is no "house listicle template," no chart animation, no Venn, no token-stream — just title cards, simple flow diagrams, two-column contrast cards, and on rare occasions a constellation-of-cards diagnostic diagram. The whole production aesthetic reads as a **Substack writer who learned just enough Remotion-or-Figma-make to bring a paragraph to life when the explanation needed it, and otherwise gets out of the way**.

---

## 3. Per-video distillation

Reference-clip paths below are all relative to project root `10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/`.

### 3.1 `z3pbrFKVyQE` — "The Infrastructure Nightmare Nobody Is Talking About"
- **URL:** `https://www.youtube.com/watch?v=z3pbrFKVyQE`
- **Duration:** 2796 s (46:36) · **Format:** 16:9 1280×720
- **Animation findings:** Zero traditional motion graphics. The entire video is a **2-presenter podcast in a 50/50 split-screen**: Nate on the left in his book-lined room, an Asian woman in a purple hoodie (different room, decorated wooden shelves, low-warm lighting) on the right. The split is a clean vertical line — no animated transition between layouts beyond the initial single-shot intro fading into the split. The split-screen IS the animation.
  - **Pattern A — `SplitScreenInterviewLayout`**
    - **Time range:** 580–595 s (representative; layout is persistent for ~95% of the video duration)
    - **Visual:** two webcam feeds side-by-side, identical aspect each (640×720), exact midline split, no chyron, no breadcrumb between them. Lower-right `@nate.b.jones` chip persists. No karaoke captions on long-form (different from shorts).
    - **transitionVerb:** `"Two webcam halves slide in from opposite edges to meet at the midline; the left half locks at the helmet-room, the right half at the guest-room, and the lower-right handle chip fades in last."`
    - **Frame refs:** `references/creators/natebjones/z3pbrFKVyQE/frames/v2-anim-01-frame-*-t580s.jpg` (10 frames)
    - **Reference clip:** `docs/research/wave-6/references/natebjones/z3pbrFKVyQE-anim-01-v2.mp4`
    - **Orientation:** 16:9
    - **Replicability:** **new needed** — we have `SplitWebcamScreen9x16.tsx` for 9:16, but no 16:9 dual-presenter podcast layout.

### 3.2 `iUSdS-6uwr4` — "RTX 5090, Mac Studio, or DGX Spark? I tried all three."
- **URL:** `https://www.youtube.com/watch?v=iUSdS-6uwr4`
- **Duration:** 1955 s (32:35) · **Format:** 16:9 1280×720
- **This is the richest video in the corpus** — four distinct motion-graphic moments.

#### Anim-01 (132–144 s): `TitleCardKineticTwoLine` — "Cloud Or Local / not a binary"
- **Visual:** dark slate background (#0F1419-ish), large white sans serif headline (`Cloud Or Local`, ~120 px), muted gray subtitle (`not a binary`) underneath. Soft radial glow centered behind text. Translucent helmet+glasses watermark in lower-left of frame. Lower-right `@nate.b.jones` or `read more on substack` chip persists from talking-head shots underneath. The card fades in (~12 frames), holds, fades out.
- **transitionVerb:** `"Headline and subtitle fade in together from 0 to 1 opacity over 12 frames against a dark slate slab, hold for 80 frames, then fade out as the radial glow dilates outward."`
- **Frame refs:** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-01-frame-*-t132s.jpg`
- **Reference clip:** `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-01-v2.mp4`
- **Orientation:** 16:9
- **Replicability:** **existing** — `KineticTypoCard9x16.tsx` exists for 9:16; we need a 16:9 sibling or a generalized prop.

#### Anim-02 (577–596 s): `FourStageHorizontalFlowDiagram` — Weights → Runtime → Endpoint → Tools
- **Visual:** four rounded-square cards (~190×130 px each) laid out in a horizontal row on the same dark slate. Each card has:
  - A small uppercase tracking-spaced **category label** at top (`MODEL`, `SERVE`, `API`, `USE`)
  - A bold **headline word** in white (`Weights`, `Runtime`, `Endpoint`, `Tools`)
  - A muted **subline** in the card's accent color (`raw model`, `loads model`, `shared shape`, `talk to it`)
  - A **colored border + faint inner glow** keyed to the role: gray, blue, green, orange
- Between cards: right-pointing chevron arrows drawn in the *outgoing* card's accent color.
- After cards land: a centered caption pill below — `Runtime makes local AI feel normal` — with `Runtime` highlighted orange.
- The sequence is preceded by a "Runtime Layer / local becomes usable" title card (anim-02 frame 006 catches it).
- **transitionVerb:** `"Show the four pipeline cards left-to-right one at a time: each card fades in and the colored arrow-chevron to its right draws in matching color before the next card appears; once all four are placed, the caption pill 'Runtime makes local AI feel normal' fades in below with the word 'Runtime' tinted orange."`
- **Frame refs:** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-02-frame-*-t578s.jpg` (11 frames showing the progression: 2 cards visible at frame 008, 4 cards + caption at frame 011)
- **Reference clip:** `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-02-v2.mp4`
- **Orientation:** 16:9
- **Replicability:** **existing-ish** — `PipelineFlow9x16.tsx` exists for 9:16 and likely handles ordered card+arrow sequences. Either generalize it to 16:9 or wrap a horizontal variant.

#### Anim-03 (653–668 s): `TitleCardKineticTwoLine` — "Runtime Defaults / simple starting path"
- **Visual:** identical template to anim-01. Different copy.
- **transitionVerb:** same as anim-01 transitionVerb. This is the second instance of the template in the same video — confirms reuse.
- **Frame refs:** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-03-frame-*-t653s.jpg`
- **Reference clip:** `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-03-v2.mp4`
- **Orientation:** 16:9
- **Replicability:** **existing** (same as anim-01).

#### Anim-04 (1779–1796 s): `BeforeAfterContrastCards` — "Cloud Home → Cloud Guest"
- **Visual:** Two-column contrast in the same dark slate. LEFT column has:
  - A short horizontal orange/red **accent rule** above the label
  - Uppercase tracking-spaced label `DEFAULT` in muted orange
  - Headline `Cloud Home` in large white sans
  - Subtitle `rented memory` in muted orange
- RIGHT column mirrors the layout but in **blue/teal**: rule → `BETTER` → `Cloud Guest` → `specialist`.
- Centered ABOVE the two columns is the word `TO` in muted gray sans, with a thin underline-stroke that draws in.
- **transitionVerb:** `"Slide the LEFT 'DEFAULT' column in from the left and the RIGHT 'BETTER' column in from the right simultaneously; once both columns settle, fade in the central 'TO' word above them and stroke-draw its thin underline left-to-right."`
- **Frame refs:** `references/creators/natebjones/iUSdS-6uwr4/frames/v2-anim-04-frame-*-t1779s.jpg` (frame 011 has the full layout)
- **Reference clip:** `docs/research/wave-6/references/natebjones/iUSdS-6uwr4-anim-04-v2.mp4`
- **Orientation:** 16:9
- **Replicability:** **new needed** — `CodeDiffBeforeAfter9x16.tsx` exists but is for code blocks. This is a **conceptual** before/after in plain typography on the dark slate background. Cleaner, less chrome, and 16:9.

### 3.3 `9aIYhjeYxzM` — "GPT-5.5 vs Claude vs Gemini: The Real Difference Nobody's Talking About"
- **URL:** `https://www.youtube.com/watch?v=9aIYhjeYxzM`
- **Duration:** 1954 s (32:34) · **Format:** 16:9 1280×720
- Two `TitleCardKineticTwoLine` instances; no diagrams identified.

#### Anim-01 (132–144 s): "Moving Frontier / ambition follows"
- **transitionVerb:** same as iUSdS-6uwr4 anim-01.
- **Frame refs:** `references/creators/natebjones/9aIYhjeYxzM/frames/v2-anim-01-frame-*-t132s.jpg`
- **Reference clip:** `docs/research/wave-6/references/natebjones/9aIYhjeYxzM-anim-01-v2.mp4`
- **Orientation:** 16:9

#### Anim-02 (1182–1198 s): "Reference Workflow / taste into build"
- **transitionVerb:** same as above.
- **Frame refs:** `references/creators/natebjones/9aIYhjeYxzM/frames/v2-anim-02-frame-*-t1182s.jpg`
- **Reference clip:** `docs/research/wave-6/references/natebjones/9aIYhjeYxzM-anim-02-v2.mp4`
- **Orientation:** 16:9

Cross-video count: **4 confirmed instances** of `TitleCardKineticTwoLine` across iUSdS-6uwr4 (2) and 9aIYhjeYxzM (2). Likely more if a finer scan were run. This template is Nate's most-used motion-graphic by a wide margin.

### 3.4 `woGB2vr5wTg` — "These 5 Infrastructure Giants Secretly Rule AI"
- **URL:** `https://www.youtube.com/watch?v=woGB2vr5wTg`
- **Duration:** 1219 s (20:19) · **Format:** 16:9 1280×720
- **Negative finding:** despite the listicle framing in the title, **the entire 20 minutes is talking head only.** No "1/5" intro cards, no item-reveal animations, no numbered chapters. The lower-right `read more on substack` chip is the only persistent overlay. Documented in `animation-ranges-vote2.json` as `TalkingHeadOnlyNoOverlays` for calibration: the title structure of a video does NOT predict Nate will animate it.

### 3.5 `DVS-cTSVKv4` — "How to build a 10-cent AI brain" (9:16 Short)
- **URL:** `https://www.youtube.com/shorts/DVS-cTSVKv4`
- **Duration:** 59 s · **Format:** 9:16 608×1080
- **Karaoke captions** throughout — TikTok-style word-by-word green highlight on white text, exactly mirroring our `@remotion/captions` pattern.
- **Outro animation (53–59 s):** `DisconnectedCardsDiagram`

#### Anim-01 (53–59 s): The Memory Silo Problem
- **Visual:** Four small cards arranged in an irregular constellation on the lower half of the frame: `Claude`, `ChatGPT`, `Cursor`, `Grok`. Each card has the model name in white, a tiny `Memory` label below, and a small padlock icon. Yellow `×` marks are placed between adjacent cards (`Claude × ChatGPT`, `ChatGPT × Cursor`, etc.) to signify *they cannot share memory*. Title `The Memory Silo Problem` in muted gold sits centered above. There is a duplicate of the title repeated as a top-edge banner — likely a parallax/scroll echo.
- **Cards appear sequentially** (frame 003 has only Claude; frame 004 has all four + X marks).
- Karaoke captions persist at the bottom (`OF THEM TALK` → `TO EACH OTHER` → `WALLED GARDEN OF`).
- **transitionVerb:** `"Reveal four labeled product cards in an irregular constellation one at a time with a soft scale-pop, then draw a small yellow × between each adjacent pair to mean 'cannot share memory'; keep the karaoke caption running underneath the diagram the entire time."`
- **Frame refs:** `references/creators/natebjones/DVS-cTSVKv4/frames/v2-anim-01-frame-*-t54s.jpg` (4 frames)
- **Reference clip:** `docs/research/wave-6/references/natebjones/DVS-cTSVKv4-anim-01-v2.mp4`
- **Orientation:** 9:16
- **Replicability:** **new needed** — closest existing template is `ForceGraph9x16.tsx` (node graph) but the "X between" semantic is different from a connection edge. This wants a dedicated `DisconnectedCardsDiagram9x16` molecule.

### 3.6 `xkC_WDLmfS8` — "Why switching AI models is now impossible" (9:16 Short)
- **Duration:** 58 s · **Format:** 9:16 608×1080
- **Pure talking head + karaoke captions.** No motion graphics overlays. Same blue beanie + Michigan hoodie + bookshelf-castle setup as DVS-cTSVKv4.

### 3.7 `eszYRrsIdHg` — "This 30-cent database gives your AI infinite memory" (9:16 Short)
- **Duration:** 57 s · **Format:** 9:16 608×1080
- **Pure talking head + karaoke captions.** No motion graphics overlays. Identical setup to xkC_WDLmfS8.

### 3.8 `x8Y404We8O8` — "2025 Prompting vs 2026 Prompting" (9:16 Short)
- **Duration:** 92 s · **Format:** 9:16 608×1080
- **Pure talking head + karaoke captions.** The title's "vs" framing led me to expect a split-screen or before/after — there is none. Just karaoke captions over Nate talking. Negative finding.

---

## 4. Catalog of distinct patterns

| # | Pattern (PascalCase) | Frequency in corpus | transitionVerb (canonical) | Orientation | Replicability | Effort |
|---|---|---|---|---|---|---|
| 1 | `TitleCardKineticTwoLine` | 4 confirmed (iUSdS-6uwr4 ×2, 9aIYhjeYxzM ×2); likely more on finer scan | "Headline and subtitle fade in together from 0 to 1 opacity over 12 frames against a dark slate slab, hold for 80 frames, then fade out as the radial glow dilates outward." | 16:9 | Existing 9:16 (`KineticTypoCard9x16`) → wrap or 16:9 sibling | S |
| 2 | `KaraokeWordCaptions` | All 4 shorts + part of long-forms | "Highlight the current word in green and underline-pop it; dim the previous word back to white." | 9:16 (and possibly 16:9 in shorts-style edits) | Existing (`src/components/captions/*` + `@remotion/captions`) | none — already shipped |
| 3 | `SplitScreenInterviewLayout` | 1 instance, persistent for 46 min | "Two webcam halves slide in from opposite edges to meet at the midline; the left half locks at the helmet-room, the right half at the guest-room, and the lower-right handle chip fades in last." | 16:9 | Existing 9:16 (`SplitWebcamScreen9x16`) → 16:9 sibling | M |
| 4 | `FourStageHorizontalFlowDiagram` | 1 instance (iUSdS-6uwr4 anim-02) | "Show the four pipeline cards left-to-right one at a time: each card fades in and the colored arrow-chevron to its right draws in matching color before the next card appears; once all four are placed, the caption pill fades in below with the keyword tinted." | 16:9 | Existing-ish (`PipelineFlow9x16`) → check N=4 support and add 16:9 variant | S |
| 5 | `BeforeAfterContrastCards` | 1 instance (iUSdS-6uwr4 anim-04) | "Slide the LEFT 'DEFAULT' column in from the left and the RIGHT 'BETTER' column in from the right simultaneously; once both columns settle, fade in the central 'TO' word above them and stroke-draw its thin underline left-to-right." | 16:9 | New needed (different from `CodeDiffBeforeAfter9x16`) | M |
| 6 | `DisconnectedCardsDiagram` | 1 instance (DVS-cTSVKv4 outro) | "Reveal four labeled product cards in an irregular constellation one at a time with a soft scale-pop, then draw a small yellow × between each adjacent pair to mean 'cannot share memory'; keep the karaoke caption running underneath the diagram the entire time." | 9:16 | New needed (related but distinct from `ForceGraph9x16`) | M |
| 7 | `HelmetGlyphWatermarkBehind` | Persistent on every full-screen graphic in long-forms | "Render a 60%-translucent helmet+glasses glyph at the lower-left third of the frame behind all foreground graphics." | 16:9 (and visible in 9:16 outro) | Existing primitive (`src/components/BrandWatermark.tsx` adapted) | XS |
| 8 | `HandleChipLowerRight` | Persistent on every talking-head shot | "Render a pill-shaped chip in the lower-right safe area: helmet glyph + `@nate.b.jones` (or rotating CTA copy 'read more on substack', 'Full guide', 'Prompt…')." | 16:9 and 9:16 | Existing (`BrandWatermark.tsx`-style) | XS |
| 9 | `TalkingHeadOnlyNoOverlays` | 1 instance in corpus (woGB2vr5wTg) — many more across the broader channel | "Nothing — let the talking head and the lower-right chip do the work." | 16:9 | Existing (`TalkingHead.tsx`, `TalkingHeadDynamic9x16`) | none |

(9 distinct patterns. Lower than 15 because much of Nate's "production" is intentional restraint — see Section 5.)

---

## 5. Comparison to other creators in our library

### vs `@carloscuamatzin` (Spanish AI-builder, 6 templates in rotation)
Carlos rotates **6 distinct visual templates** including cosmic-editorial, listicle, ranked-tier, kinetic typography, quote cards, and code-diff. He's our highest-value graphics reference because he treats template selection as a writing decision. **Nate is the opposite end of the spectrum:** 1 dominant pattern (`TitleCardKineticTwoLine`) plus 3 long-tail patterns (flow diagram, contrast cards, disconnected cards) used once each. Carlos's library would be overkill for Nate's content; Nate's restraint would feel underbaked for Carlos's content. They are **complementary references, not competing ones.**

### vs `@DIYSmartCode` (English AI-builder Shorts, 3 templates)
DIYSmartCode has a heavily-decorated "DarkChangelog / Listicle counter" template — release pills, numbered counters, brand bars, GitHub footers. **Nate is the OPPOSITE.** When Nate animates a listicle context (woGB2vr5wTg) he produces ZERO graphics. When Nate animates a diagram (iUSdS-6uwr4 anim-02) the diagram is bare typography on slate — no decorations. The lesson here is that the **same content type (technical AI content) supports radically different design vocabularies.** Nate's vocabulary is closer to Stripe Press than to DIYSmartCode.

### vs `@bilawal.ai` (TweetCardOverlay tentpole, 5/7 reels)
Bilawal runs ONE tentpole template (`TweetCardOverlay`) where his own tweet is the headline above whatever artifact he's showing. **Nate's tentpole is `TitleCardKineticTwoLine`** — a similarly load-bearing single template repeated across many videos. The difference: Bilawal's tentpole is *attribution-first* (his tweet IS the brand), Nate's tentpole is *pacing-first* (the title card is the section break, his face IS the brand). Both are "one tentpole + cinematic alternates" archetypes.

### vs `@simonhoiberg` (TalkingHeadStudio dominant 8/12)
Simon's 8/12 reels are *undecorated* studio talking head with NO captions, NO motion graphics — he trusts his face + voice + the IG caption. **Nate is one step "louder" than Simon:** Nate adds karaoke captions on shorts (Simon does not) and adds title cards on long-form (Simon almost never does). But both creators share the philosophy that **the talking head is the content, and motion graphics exist only to mark a chapter or land a payoff** — they are NOT continuous decoration. This is the right philosophical reference for our brand.

### vs `@AlexHormozi` (CapCut-style burned-in captions, 10/10 shorts)
Hormozi is the canonical reference for **burned-in captions on talking head**, optimized for sound-off scroll. Nate's shorts use the **same approach** — karaoke captions on talking head, never relying on audio. The visual treatment is comparable: green-highlight current word, white siblings, dark stroke. We can call this established craft.

**Summary of cross-reference:** Nate sits in the same "restraint cohort" as Simon (long-form) and uses the same "captions-as-craft" baseline as Hormozi (shorts). For diagram payoffs he's closest in spirit to the **dark-paper / cosmic-editorial** template Carlos uses for opinion pieces — though Nate uses lower decoration density (no starfield, no amber spotlight).

---

## 6. User-claim verification

> **User's hypothesis:** Nate "adds our style of animations" — meaning Nate's videos contain motion graphics in the same family as the ones we build (Remotion-style, programmatic, kinetic typography + simple SVG diagrams).

**Verdict: PARTIALLY CONFIRMED.**

**Confirmed by evidence:**
- The 4 `TitleCardKineticTwoLine` instances are structurally identical to our `KineticTypoCard9x16` (two-line typography, dark background, deterministic fade-in/hold/fade-out). Same vibe, same toolchain class.
- The `FourStageHorizontalFlowDiagram` is structurally identical to our `PipelineFlow9x16` — sequential card reveal + drawn arrows + caption pill below. Same primitive class.
- The shorts use karaoke captions in the same per-word green/white pattern we ship.
- The use of a single brand glyph (helmet) as a translucent backplate watermark is the same craft move we make with the avatar-pixar mark.

**NOT confirmed:**
- Nate does NOT do animated charts (bars, lines, sparklines, area), animated tables, animated counters, Venn diagrams, force graphs (real graphs with edges), token streams, terminal blocks, code diffs, tweet cards, or app-UI mockups. Those are large portions of our 60-composition library that have no Nate analog.
- Nate's "listicle" videos do NOT contain animated listicles. He has no `NumberedListReveal`, no `RankedTierList`, no `BarChartList`.
- Nate's diagram density per video is **low** (1 diagram per 30-minute video in iUSdS-6uwr4; ZERO in the listicle video). Our compositions assume higher density.

**Refined verdict:** Nate adds **a narrow subset** of our style of animations — specifically the section-divider title card and the occasional sequential flow diagram. He is closer to Simon Hoiberg's restraint than to Carlos Cuamatzin's graphics density. If we want to "produce content like Nate," we should under-build animations rather than over-build, and prioritize `TitleCardKineticTwoLine` + 1 diagram payoff per long-form.

---

## 7. Build priority queue addendum

Ranked by ROI for "producing content that looks like Nate":

1. **`TitleCardKineticTwoLine16x9`** (new 16:9 sibling of `KineticTypoCard9x16`) — appears 4× in the corpus; lowest effort (S); highest reuse. Should accept `{ headline, subtitle, backgroundGlyphUrl, transitionVerb }` props and default to dark-slate + soft radial glow. This is the single highest-priority addition from Nate.
2. **`PipelineFlow16x9` (or generalize `PipelineFlow9x16` to support 16:9)** — needed to land the Weights → Runtime → Endpoint → Tools type diagram. Schema: ordered array of `{ category, headline, subline, accentColor }` + a final caption-pill prop. Effort S because the 9:16 primitive likely already does most of the work.
3. **`SplitScreenInterviewLayout16x9`** — for podcast/interview content. Two webcam slots, vertical midline. Schema: `{ leftStreamUrl, rightStreamUrl, leftHandle, rightHandle, transitionVerb }`. Effort M because needs proper video-on-video composition. (Lower priority since we don't currently produce interview content.)
4. **`BeforeAfterContrastCards16x9`** — for the DEFAULT/BETTER kind of conceptual contrast. Schema: `{ leftLabel, leftHeadline, leftSubtitle, leftAccentHex, rightLabel, rightHeadline, rightSubtitle, rightAccentHex, connectorWord, transitionVerb }`. Effort M. Not the same as our existing `CodeDiffBeforeAfter9x16`.
5. **`DisconnectedCardsDiagram9x16`** — for the Memory Silo type "these systems don't talk to each other" diagnostic. Schema: `{ items: [{ name, sublabel, iconKind }], xMarkColor, titleCopy, transitionVerb }`. Effort M. Lower priority because it's a single instance in the corpus.

Items 1 and 2 alone would account for **5 of the 6 motion-graphic moments** in the long-form corpus (the 4 title cards + the pipeline). Build those two first; everything else is long-tail.

**Build-order suggestion:** ship #1 in W22, then #2 in W22, then re-watch a fresh Nate video to see if the coverage feels complete before moving to #3–#5.
