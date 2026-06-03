# abhishek.devini — Consolidated Replication Spec (STYLE-SPEC)

> Distilled from 18 reels across 6 raw analyses (`raw-0`…`raw-5`). All canvas measures are % of a **720×1280 @ 30fps** frame (x = % of 720w, y = % of 1280h). FontSize% = glyph cap-height px ÷ 720. All timings in **frames @30fps** (1f ≈ 0.033s).

The creator runs ONE design language in TWO background families. Every reel is a fast sequence of ~8–14 templated scenes: a **letter-spaced mono pill kicker** leads (in by ~f6), then a **giant extra-bold grotesk two-tone headline**, then a **glassmorphic mockup/card block**, optionally a **bottom kinetic subtitle**, closing on a **"Comment AI" CTA + handle/brand lockup**. The single accent color **tracks the topic's brand** (Anthropic/Claude orange is the most frequent; teal for OpenAI, pink for Stitch, gold for Stark, blue/gradient for the LIGHT-mesh reels).

---

## STYLE TOKENS

### Palette — exact sampled hexes

**DARK family (near-black mode)**
| Token | Hex | Where |
|---|---|---|
| BG base (corner) | `#07040A` / `#0A070A` / `#0C090C` / `#060102` | dark reel base, warm-tinted |
| BG body / mid | `#13101A` / `#161317` / `#140A0D` | center field |
| BG streak highlight | `#1A171A` | diagonal soft light streaks |
| Radial glow (warm) | `#210E10` → `#2A1409` / `#130A03`→`#2A1A08` | behind hero text, hue tracks accent |
| Grid line | `#1C1410` / `#10201E` / `#1A1216` @ ~6–10% opacity | square grid ~64–90px cells |
| Card slate fill | `#13141B` / `#181A21` / `#15161D` | rounded-20 glass cards, 1px lighter top edge |
| Text white (never pure) | `#F2F2F4` / `#FAF7FC` / `#F5F0ED` | warm off-white headlines |
| Text grey (labels) | `#8A8A90` / `#9A9AA0` / `#C8C8CC` | kickers, subtitles |
| Terminal navy | `#0E1117` / `#14161C` / `#181A21` | code/terminal panels |
| Cream quote card | `#E1D7C8` / `#F4EFE2` | editorial serif quote/chat cards |

**LIGHT family (pastel-mesh mode)**
| Token | Hex | Where |
|---|---|---|
| Mesh base | `#E5DFE8` / `#E8E0EB` / `#F0E8F1` / `#EFE9EE` | lavender-grey field |
| Mesh blob — peach/coral | `#F9C8BA` / `#F6CDB8` / `#EBDAE2` | lower-center bloom |
| Mesh blob — lavender/periwinkle | `#CBC9F9` / `#C9C9F5` / `#C5C5E5` | right/upper bloom |
| Mesh blob — mint/cyan | `#E0EEE7` / `#CADBE7` / `#D9E1ED` | top-center bloom |
| Mesh blob — amber | `#F0CEAD` / `#F2E2C0` | lower-right bloom |
| Frosted square / card fill | `#FFFFFF`@~85% / `#F4EEF4` / `#F2EEF4` / `#EDEAF2` | floating tiles + mockup cards, ~18px radius, soft shadow |
| Grid line | low-opacity grey ~`#C9C4CE` | square grid ~50px (faint, sometimes absent) |
| Text near-black | `#000000` / `#0C0C12` / `#19151F` / `#1A1A1A` | all headlines |
| Text slate-grey | `#5A5A66` / `#9A95A5` | sub-labels |
| Green dot/badge | `#00C07E` / `#27C26B` / `#34D3A0` | status dots, ✓ stamps |

**Topic-accent set (the recolored headline word + dot/glow take ONE of these)**
| Brand topic | Accent hex(es) |
|---|---|
| Anthropic / Claude orange (most common) | `#FD9B00` · `#FF8448` · `#DE6D35`/`#DE7854` · `#E07853` · `#FA9600` · `#E08A5A` |
| Amber-gold (Claude variants) | `#F8B000` · `#FAB400` · `#FEB400` · `#FBD189` |
| OpenAI teal | `#00A080` · `#009080` · `#00C0A0` (icon `#008070`) |
| Stitch pink/magenta | `#FF6DB3` · `#FF7CA7` · `#F06090` |
| Stark gold (Iron-Man hero) | `#D6A130` · `#EEAA28` (serif) |
| LIGHT-mesh blue/periwinkle | `#8E83FE` · `#8789ED` · `#7076FD` |
| LIGHT-mesh gradient (blue→purple→pink) | `#8789ED` → `#9A8AF9` → `#D99BCC` |
| Mythos/shipped lavender | `#B490FC` · `#C6C0FC` |
| Success green | `#42AE66` · `#47B16A` · `#58B078` · `#0BC390` |
| Negative red (refusal/strike/heart) | `#F5553A` · `#DC5867` · `#ED6267` · `#E8746A` |
| Teal/indigo (LIGHT reels secondary) | `#6B60F0`/`#6E5EEB` indigo · `#0BC390` teal |

### Background recipes

**dark-grid-glow** (DARK hero scenes)
1. Fill `#07040A`→`#13101A` vertical near-black, faint warm tint.
2. Square grid overlay: 1px lines `#1C1410` @ ~8% opacity, ~70px cells.
3. Radial glow blob behind hero text — large blurred ellipse, hue = scene accent (orange default; red for negative scenes; blue for "memory"; green for positive; dual orange+green common), color `#210E10`→`#2A1409`, breathing ±4% scale / opacity over ~30f.
4. Diagonal soft light streaks `#1A171A` + drifting dust particles + floating mono bracket glyphs `{ } > # / -` parked in side margins (x≈8% / x≈90%), gentle continuous bob.
5. Subtle vignette darkening at frame edges.

**light-mesh-gradient** (LIGHT hero scenes)
1. Base `#E5DFE8`/`#F0E8F1` pale lavender-grey.
2. 3–5 soft multicolor mesh blobs (mint top-center, periwinkle right, peach/coral lower-center, amber lower-right) drifting slowly + continuously.
3. Optional faint square grid (~50px, very low alpha) — present on ~half of title scenes, absent on cleaner ones.
4. Floating frosted **rounded-square** tiles (`#F4EEF4`@~85%, ~40–60px, soft shadow) in 6–8 margin positions, slow parallax bob.
5. Colored dust dots (orange/lavender) drifting; optional 4-point stars in stat scenes (opacity twinkle ~10f loop).

**floating-squares** (overlay layer, LIGHT): 6–8 frosted rounded-square tiles `#F4EEF4`@85%, radius ~10px, soft drop-shadow, sizes 40–60px, parked near margins, each on an independent slow sine bob (~±4px, period ~3–5s) + faint parallax drift. Never static.

**radial-glow** (hero-text backer, both modes): single large blurred radial ellipse centered behind the hero word/number, color = scene accent at low alpha. Entry: scale 0.96→1.0 + opacity 0.6→1 over ~14f, then idle breathe ±4% over ~30f. In DARK it reads as a colored bloom on black; in LIGHT it's a brighter mesh swell.

**grid-overlay** (both): square grid, 1px strokes. DARK = `#1C1410` @ ~8% over black, ~64–90px cells. LIGHT = faint grey ~50px cells, very low alpha. Static (no scroll); only the glow/blobs above it move.

### Font roles

| Role | Style | Weight | Closest Google font | Notes |
|---|---|---|---|---|
| **Headline / big-stat** | extra-bold/black geometric-humanist grotesk, very tight tracking (~-0.02em), large x-height, two-story `a`, straight-leg `R` | 800–900 | **Inter** (Black) — fallbacks: Geist, Archivo, Sora, Montserrat | ALL-CAPS for hero word-cards; sentence-case for kinetic headlines. The terminal **period** ("Heretic.", "phone.", "together.") is a deliberate styling element, often recolored to accent. |
| **Kicker / mono labels** | UPPERCASE monospace, heavy letter-spacing ~0.15–0.25em, small | 500–600 | **JetBrains Mono** — fallbacks: Geist Mono, IBM Plex Mono, Roboto Mono | Always prefixed `●` dot (accent-colored) or `—` rule. Pattern `● NN / WORD` (zero-padded index + slash + section word) or `● LETTERSPACED CAPS`. ~1.6–2.4% cap-height. |
| **Body / sub-headline / kinetic subtitle** | same grotesk, sentence case | 600–700 | **Inter** (SemiBold/Bold) | Two-tone by color or by weight; kinetic reveal word-by-word, accent word recolored on landing. |
| **Terminal / code** | monospace, same family as kicker | 400–500 | **JetBrains Mono** | green `$` prompt (`#42AE66`-ish), grey body, `✓` green success, traffic-light dots chrome. |
| **Serif accent (rare)** | high-contrast transitional/Didone serif | 600–700 | **Playfair Display** — fallbacks: Cormorant, Lora, PT Serif | ONLY for editorial quote cards (cream-card) + in-mockup product wordmarks (Stark "Devini" gold, "Paperclip"). Not the reel's own system. |

### Timing conventions (frames @30fps)

- **Kicker pill** — in first, leads scene: fade + drop from y−16px over **6f**; accent dot ignites/glows **4f**. Persists whole scene.
- **Headline reveal** — two modes: (a) **word/line slide-up + blur-clear**, scale 0.92–0.96→1 + translateY +12–40px→0, **6–8f**, words/lines stagger ~**5–6f**; (b) **"slam"** scale 1.05–1.06→1 over **5f**.
- **Two-tone accent word** — either appears pre-colored, or **tint-sweeps white→accent L→R over ~8f**; gradient words sweep L→R over **8–10f**.
- **Mockup/card entrance** — scale 0.94–0.96→1 + fade, **8–12f** (rise from below +24–40px), or slide from side ±50–60px over **7f** staggered **+4f**. Inner rows reveal **3–4f/row**.
- **Card/tile grids** — stagger-pop in reading order (Z-order TL→TR→BL→BR or row-by-row), **4–6f each**, ~**5–8f stagger**; icon/✓ lands **2–3f after** its tile (slight overshoot 0.8→1.05→1).
- **Stat counter** — hold start ~6f, then **ease-out count over 14–54f** (fast→slow); unit suffix (`×`,`%`,`+`) pops separately **6f**; giant stats add overshoot 1.06–1.1→1 settling **4–6f**.
- **Kinetic subtitle** — word-by-word, **~1 word / 6f** (≈5 w/s); final/keyword word recolored to accent on landing; strike-through wipe L→R **~6–8f**.
- **Type-on (terminal/comment field)** — **~1 char / 2–3f**; block caret blinks **~15f cycle**.
- **Charts/viz** — line series draw L→R **~20f**; horizontal bars grow L→R **~14f**; bar-chart histogram **~1 bar/2f**; node-graph edges draw **~1 edge/3f**; progress bars / sliders fill **10–18f**; data-table rows reveal **~3f/row**; auto-scroll panels **~1 line/8f**.
- **Glow bloom** — 8–14f behind hero, slower than the element it backs.
- **Letter-scramble decode** (rare opener) — random-glyph cycling **~1 swap/1–2f**, resolving L→R over **~60f (2s)**.
- **Scene cadence** — scenes hold ~2.5–6s, then **hard-cut** (often through a 0.3–0.5s black/mesh-only breather that carries the next kicker in early). NOT cross-dissolves between scenes (mockup content WITHIN a scene does cross-dissolve).
- **Ambient** — radial glow breathes ±4% (~30f cycle); mesh blobs drift; margin glyph-chips bob; stars twinkle — all continuous under every scene.
- **Layout rule** — numbered-section kickers + their headlines are **LEFT-aligned** (x≈6–8%); intro/outro CTA kickers + giant single-word hero cards are **CENTERED** (x50%).

---

## RANKED TEMPLATES

The 8 most distinctive, reusable, high-impact templates — ranked for how directly they map onto a typography/card/number system and how much they would elevate our reels. Each has a CLEANEST `sourceRef` for head-to-head comparison.

---

### 1. `title-card-two-tone` — the core headline template
**Frequency:** Ubiquitous — present in essentially every reel, multiple scenes each (the single most-used template).
**bgMode:** both (DARK or LIGHT-mesh).
**Build spec:**
- **Kicker pill** — mono UPPERCASE `● NN / WORD` or `● LETTERSPACED CAPS`, ~2.0% (14px), accent dot; centered x50% y17% (CTA/title) OR left x6–8% y16–18% (numbered section). On glassy pill (DARK `#331C06`/`#2D1413` w/ accent hairline; LIGHT frosted white `#F4F4FA`).
- **Giant headline** — extra-bold grotesk, 1–3 lines, cap-height **7–12%** (50–87px). One clause/word recolored to the topic accent; rest white (DARK) / near-black (LIGHT). Centered x50% y20–50% OR left x6% y17–30%. Terminal period often accent-colored.
- **Optional sub / kinetic subtitle** — semibold ~4% bottom (y68–79%) or mono uppercase under headline, two-tone.
**transitionVerb:** "Kicker fades+drops from y−16px over f1–6; headline rises word-group by word-group from +18px (white words first, then the accent word tint-sweeps L→R over ~8f), each group ~6f apart, settling by ~f20; radial glow blooms behind over 14f."
**CLEANEST sourceRef:** `DXpZf2ziBYP` 2.2–5.5s (DARK, "One open-source repo." — accent orange word, cleanest two-line build).

---

### 2. `big-stat-number` — giant numeral + unit accent + label
**Frequency:** Very high — ~1–3 per reel (counter intros, traction/benchmark/metric beats).
**bgMode:** both.
**Build spec:**
- **Kicker pill** — `● TRACTION` / `● OUTPUT` / `● 04 — THE MATH`, mono, accent dot, y16–21%.
- **Giant numeral** — extra-bold grotesk, cap-height **13–31%** (95–226px), x50% (centered) or x6% (left). Digits in primary ink; the **unit suffix** (`×`, `%`, `+`, `x`, `$`) recolored to accent. Often framed by thin corner-bracket `⌐ ⌐` (DARK). Comma-formatted for large counts.
- **Sub-label** — mono uppercase below (`★ GITHUB STARS`, `fewer tokens per query`), grey, ~3%.
- **Optional supporting cards** — equation cards / stat chips row beneath.
**transitionVerb:** "Numeral holds start ~6f then counts up with strong ease-out (e.g. 0→98% over ~24f, fast→slow), scaling 0.9→1 with a 1.06 overshoot settle; the accent unit suffix pops in beside it over 6f; label + glow bloom fade up 8f after the number lands."
**CLEANEST sourceRef:** `DXUhthziNCS` 0.0–4.4s (DARK, "98%→99%" — orange digits + white `%`, classic count-up).

---

### 3. `terminal-mockup-card` — install/command card with progress + success
**Frequency:** High — ~1 per reel in tool/dev reels (install, run-it beats).
**bgMode:** mostly DARK (also appears as DARK inset inside LIGHT frames).
**Build spec:**
- **Kicker** — `● RUN IT` / `ONE-LINE INSTALL`, mono accent, y16%.
- **Headline** — short two-tone ("Type. Paste. Watch.").
- **Terminal card** — rounded `#181A21` (or `#0E1117`), ~80–88% wide x50% y36–52%. Top chrome: 3 traffic-light dots (red/amber/green) + url/path crumb (`~/claude-projects`, `free-claude-code — zsh`). Body mono: comment line (grey), `$ command` (`$` accent, cmd white), resolving line, **accent progress bar** filling L→R, then `✓ installed · N skills · 0 errors` (green check). Optional corner-bracket `⌐ ⌐` frame (DARK).
- **Optional bottom kinetic subtitle** two-tone.
**transitionVerb:** "Headline pops word-by-word (~1/4f); terminal card scales 0.96→1 + fades up over 10–12f; the command types in char-by-char (~2 chars/f) with a blinking block caret; the orange progress bar fills 0→100% width over ~18f; then the green `✓ success` line pops in last."
**CLEANEST sourceRef:** `DXpZf2ziBYP` 13.5–17s (DARK, `$ npx skills add …` + orange progress bar + `✓ installed · 20 skills · 0 errors`).

---

### 4. `cta-comment-outro` — "Comment AI" close + handle/brand lockup
**Frequency:** Ubiquitous — exactly one per reel, always the closer.
**bgMode:** both.
**Build spec:**
- **Kicker** — `● GET THE LINK` / `● DROP A COMMENT`, mono, accent dot, y16–21%.
- **"Comment"** label — grey letter-spaced caps OR bold, x50%/x6% y23–37%.
- **Giant "AI"** — extra-bold, often quoted `"AI"`, cap-height **8–20%** (58–140px), in accent (orange) OR blue/purple gradient (LIGHT); blinking caret bar; centered/left.
- **Subtitle** — `and I'll DM the GitHub repo.` / `I'll send the repo + a starter prompt.` near-black/white bold ~3.5%.
- **Input/comment bar** — glassy rounded pill: avatar (accent ring) + typed `A I |` (blinking caret) + send button (accent circle / `Post` / paper-plane).
- **Handle pill / brand lockup** — `● @abhishek.devini` mono w/ IG glyph (persistent footer y96%) OR `✳ Reel Stack · A CLAUDE CODE SKILL · DEVINI LABS`.
**transitionVerb:** "'Comment' fades up (6f); the giant 'AI' snaps in scale 1.06→1 with the accent/gradient sweeping across the glyphs over ~8f + a glow bloom + blinking caret; the input bar slides up from +40px (8f), the send button pops (overshoot 6f); subtitle + handle pill rise under it 4–6f later."
**CLEANEST sourceRef:** `DYukIE0PFac` 50–53.8s (LIGHT, `Comment "AI"` blue-purple gradient + `@abhishek.devini` handle pill — cleanest gradient outro).

---

### 5. `feature-card-grid` (2×2) — staggered deliverable/feature tiles
**Frequency:** High — appears in most multi-feature reels (deliverables, "what's new", feature lists).
**bgMode:** both.
**Build spec:**
- **Kicker** — `● ONE SKILL · FOUR DELIVERABLES`, mono accent.
- **Two-tone headline** — "Type once. Ship anything." (accent on payoff word).
- **2×2 cards** — rounded glass (DARK `#13141B` / LIGHT frosted white, ~`#140E07` amber-tint in gold reels), each x6–49%/51–94% y32–55%. Per card: small accent icon top-left, numbered mono kicker (`01 · INTERACTIVE`), bold white/near-black title ~2.8%, grey one-line desc. Optional accent top-border that wipes L→R.
**transitionVerb:** "Headline settles; four cards fade+rise in Z-order stagger (TL→TR→BL→BR), each scale 0.94→1 over 6f, ~5f apart; the accent top-border (or icon glyph) wipes/pops in 2–3f after each card lands."
**CLEANEST sourceRef:** `DXpZf2ziBYP` 17–21s (DARK, "Type once. Ship anything." 2×2 numbered deliverable cards — cleanest Z-stagger).

---

### 6. `feature-rows-list` — stacked icon rows (cards / checklist / problem-solution)
**Frequency:** Very high — the workhorse for list/explainer scenes (feature lists, problem cards, solution cards, model lists).
**bgMode:** both.
**Build spec:**
- **Kicker** — `WHAT IT'S BUILT TO DO` / `OPENCLAW · WHAT WENT WRONG`, mono accent, left x6%.
- **Two-tone headline** — left-aligned, "Five jobs. One model." (accent on second clause).
- **3–5 stacked rounded rows** — fill `#121418` (DARK) / frosted (LIGHT), ~88–90% wide x50%, y28–73%. Per row: accent monoline icon in a small square (left) + bold title + accent mono sub-caption. Color-coded by valence: accent-bordered rows; problem rows red/orange-tinted, solution rows green-bordered with ✓ check badge; CTA "Comment" row is the highlighted/green focus.
**transitionVerb:** "Headline slides left-in ~8f; rows cascade up one-by-one bottom-edge ~6f each with ~5f stagger (3-card list lands in ~33f), each scaling 0.96→1 + fade; the accent icon/border/✓ badge pops 2–3f after its row lands (solution checks bloom green glow)."
**CLEANEST sourceRef:** `DXhkSFiD8dL` 22–30s (DARK, "Five jobs. One model." — 5 teal-icon rows, cleanest cascade).

---

### 7. `grid-vs-terminal` — split comparison (GUI/grid card vs terminal/dark card)
**Frequency:** Medium-high — recurring "decode/compare/under-the-hood" device.
**bgMode:** both (often a LIGHT frame with a DARK code inset).
**Build spec:**
- **Kicker** — `● UNDER THE HOOD` / `● 03 — THE MECHANISM`, mono accent.
- **Two-tone headline** — "Images + text. That's all Claude needs." (accent on second part).
- **Two side-by-side blocks** — LEFT a light/grid card (color-tile grid, GUI mock, "IMAGES"/"BRAINS" label) and RIGHT a dark terminal/text card (mono log lines, `[00:14] …`, "TEXT"/"GUARDRAILS" label). Optional circular accent **VS badge** centered between them. Often resolves from two solid dark placeholder squares that cross-fade their contents in.
- **Optional stat overlay** (99% indigo / 4% red counting).
**transitionVerb:** "Headline builds ~12f; two solid placeholder squares slide up from below ~10f, then cross-fade their contents in (left→color grid, right→terminal text) over ~12f; the circular accent VS badge pops scale 0→1 + slight rotate at ~f10; mono labels type under each (~6f)."
**CLEANEST sourceRef:** `DXpZf2ziBYP` 72–86s (DARK, "Replace it fully? Probably not." — cream GUI card vs dark terminal card + orange VS badge).

---

### 8. `brand-lockup` — giant wordmark + repo/credit card + spark icon
**Frequency:** High — opener and/or closer of tool reels (product intro, "introducing X", outro lockup).
**bgMode:** both.
**Build spec:**
- **Kicker pill** — `★ NEW · OPEN SOURCE` / `● INTRODUCING`, mono accent.
- **Spark/app icon** — the signature **Anthropic burst glyph** (radiating spokes, accent `#DE7854`/`#FC7E48`) OR a rounded-square app tile (white asterisk on accent fill), ~9–16%, often with an orbiting ellipse ring + idle bob. Centered or top.
- **Giant lockup wordmark** — extra-bold grotesk, cap-height **14–22%** (e.g. `HUASHU DESIGN.` / `Reel Stack` / `Heretic.`), one part recolored accent (incl. the period). Centered or left.
- **Sub-label** — mono caps (`A CLAUDE CODE SKILL · DEVINI LABS`, `TINY AI COMPANIONS FOR YOUR DOCK`).
- **Repo/credit card** — dark/frosted card at bottom: GitHub mark + `owner/repo` mono + tag chips (`● JUST DROPPED`, `Personal use license`).
**transitionVerb:** "Spark icon scales 0→1 with spoke/ray bloom over 8–10f; the lockup wordmark scales 0.9→1 + fades as one block (8f), the accent part / period dropping in ~4f later (or wiping L→R 8f); the repo/credit card slides up from below +40px over 10f; orange glow pulse blooms behind ~14f."
**CLEANEST sourceRef:** `DXpZf2ziBYP` 5.5–9.5s (DARK, "HUASHU DESIGN." giant lockup + github repo card — cleanest big-wordmark + credit-card pairing). LIGHT alt: `DYUcj5iPAxL` 13–20s ("Reel Stack" frosted card lockup).

---

### Honorable mentions (next-tier, not in the 8)
`kinetic-subtitle` (bottom word-by-word two-tone — used as a layer inside other templates), `browser-mockup-card` (3D-tilted product screen-recording with chat pills), `phone-mockup-card` (iPhone frame + IG comment UI), `comparison-table-card` / `data-table` (benchmark grid, highlighted column), `numbered-vertical-stepper` (01→04 nodes with progressive activation), `quote-card` (cream editorial serif), `radial-progress`/`constellation` (target rings, orbiting subagent dots).
