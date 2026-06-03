# abhishek.devini — Frame-by-Frame Reel Analysis (raw-0)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels, 720×1280 @ 30fps.
Method: ffmpeg evenly-spaced frames + 30fps transition bursts; HEX sampled with PIL on real frames; cap-height measured in px ÷ 720; motion timed by counting consecutive 30fps frames.

Reels analyzed:
- **DX4GVwQPyaD** — 55.08s — "Paperclip" AI-org product. LIGHT pastel-mesh mode (cool periwinkle/blue/violet accent).
- **DX9k8WDPZ2D** — 105.28s — "Claude watches video frame-by-frame" / claude-watch. LIGHT warm-orange mesh mode (Anthropic/Claude orange accent #FF8448).
- **DXTd62KCBAV** — 32.09s — "3D website builder skill" (Devini). PAPER-GRID mode (warm off-white #DDD8D5 + faint grid, orange accent, dark mockup chassis + green/dark terminal chat pills).

> Note: All three reels in this set are **LIGHT-family**. None use the near-black DARK+grid+radial-glow mode. Two flavors of LIGHT appear: (1) pastel-mesh-gradient + floating rounded squares (DX4GVwQPyaD, DX9k8WDPZ2D), and (2) flat warm-paper + faint square grid, no mesh (DXTd62KCBAV).

---

## GLOBAL NOTES

### Font family best-guesses
- **HEADLINES** — extra-bold/black grotesk. Geometric, tight tracking, true apostrophes, period punctuation baked into copy ("frame.", "phone.", "pipeline."). Best guess: **Inter / Geist / General Sans** at weight 800–900 (`Inter` is the closest free match; some headlines look slightly more humanist → could be `General Sans` or `Satoshi` Black). Letterforms: double-story `a`, straight-leg `R`.
- **PILL KICKER** — small UPPERCASE **monospace**, heavy letter-spacing (~0.18em). Best guess: **JetBrains Mono / Geist Mono / SF Mono**, weight 500–600. Always formatted `●  NN / WORD` (orange or violet status dot + zero-padded index + slash + section word).
- **TERMINAL / CODE blocks** — monospace, same family as kicker. Green `$`/command prompt (#0Fae… green), light-grey body.
- **SERIF accent** (DX4GVwQPyaD mockup only) — the in-mockup "Paperclip" wordmark + "Every decision traced." headline inside the browser card use a **transitional serif** (looks like `Times`/`Tiempos`/`Lora`). This is *content inside the fake product UI*, not the reel's own type system.
- **SUBTITLE / kinetic caption** — semibold grotesk, same family as headline at ~600 weight, smaller.

### Full palette (sampled HEX from real frames)
| Token | HEX | Where |
|---|---|---|
| Ink / near-black headline | `#0A0A0C`–`#110B14` (≈ `#0D0D10`) | all headlines, dark squares |
| Light mesh base (cool) | `#E5DFE8` / `#ECE6EF` (pale lavender-grey) | DX4GVwQPyaD, DX9k8WDPZ2D bg |
| Mesh warm blob | peach `#F6CDB8`-ish, yellow `#F2E2C0`-ish | lower-center glow blobs |
| Mesh cool blob | periwinkle `#C9C9F5`-ish, mint `#CADBE7` | upper / right blobs |
| **Claude/Anthropic orange (accent)** | `#FF8448` (bright), `#E87E52`/`#E47A51` (logo fill), `#FA9600` (deep) | DX9k8WDPZ2D + DXTd62KCBAV accent word + spark |
| Periwinkle/blue accent | `#7076FD` (dots), `#8E8BF3` ("phone."), `#79B4E2` (stat) | DX4GVwQPyaD + DX9k8WDPZ2D "text."/"vibe-coding" |
| Teal accent | `#0BC390` ("anywhere"), `#2E8568` (green chips) | DX9k8WDPZ2D, DXTd62KCBAV |
| YouTube red | `#FF0000`–`#FF1900` | DX9k8WDPZ2D YouTube tile |
| Pink/coral | `#FB5C7A`-ish (YouTube text), `#F4D3CD` (30min stat) | DX9k8WDPZ2D |
| Paper bg (DXTd62KCBAV) | `#DDD8D5` / `#DFD8D3` warm off-white | DXTd62KCBAV |
| Dark mockup chassis | `#1E1E20`–`#262629` | terminal/browser bezels |
| Pill/card surface | `#EAF0F8` / `#FFFFFF` ~85% glassy white | kicker pills, chip cards |

### Timing conventions (measured)
- **Kicker pill** appears first, top-left, and persists the whole scene. Pill width animates open (clip-reveal) over ~6–8f at scene start.
- **Headline reveal** = word-by-word (or line-by-line) **slide-up + motion-blur-in**, ~2 words per 6f (≈0.2s/word). Two-tone accent word arrives colored, not recolored mid-flight.
- **Mockup cards** (browser/terminal/phone) **rise from below + fade**, scale 0.96→1, over ~10–14f, with the mesh glow brightening behind them.
- **Chips / pills** (badges like MIT LICENSED, ASSETS→CODE→SCENE→SHIP) **pop in staggered**, ~1 chip per 4–6f, slight overshoot scale 0.8→1.05→1.
- **Spark / radial glow** behind hero text **pulses** (scale ~0.96→1.0 + opacity 0.6→1) over ~14f at section entry, then idles with a slow breathe.
- **Floating rounded squares** drift continuously (slow parallax, never static) the entire reel.
- **Subtitle kinetic line** fades/strikes word emphasis ~1 emphasis-event per 6f (e.g. strikethrough on "transcript" lands ~18f into the section).
- Scenes hold ~3–8s each; transitions between scenes are **soft cross-fade + upward slide**, ~8–12f.

---

# REEL A — DX4GVwQPyaD (55.08s) — "Paperclip" — LIGHT pastel-mesh

bgMode: **LIGHT pastel-mesh** — base `#E5DFE8` pale lavender-grey, soft multicolor mesh blobs (mint top-center `#CADBE7`, periwinkle right `#C9C9F5`, peach/pink lower-center, yellow lower-right). Faint square **grid** overlay (~1.5px lines, very low alpha) on most title scenes. Floating **rounded-square** glass tiles drift in 6–8 positions.
Accent family: cool — periwinkle/blue/violet (`#8E8BF3`, `#79B4E2`) with occasional pink/orange in gradient numerals.

### A1 · 0.0–3.0s · `intro-counter`
- bgMode LIGHT pastel-mesh + grid. bg `#E5DFE8`.
- **element** numeral "0" — kind big-counter; weight black grotesk; fontSize ~9% (65px cap); color violet-blur `#5B5BC8`-ish (motion-blurred); pos x50 y48.
- transitionVerb: "A single blurred '0' materializes dead-center at f0, snaps into focus over ~6f, then the mesh blobs swell behind it while it rolls up into the stat scene."
- timing: counter focus-in 6f; mesh blob drift continuous.

### A2 · 3.0–6.0s · `big-stat-number`
- bgMode LIGHT pastel-mesh + a **rotating dashed-circle frame** (thin outline ring, full-bleed, slowly rotating) + scattered confetti **star/dot** particles (pastel pink/blue/yellow).
- **kicker pill** "▸ STARS ON GITHUB" — mono uppercase, ~2.4% (17px), ink `#1A1A1E` on glassy white pill `#EAF0F8`; pos x50 y18; tracking ~0.16em.
- **big stat** "61,800" — black grotesk; fontSize ~17% (122px cap); **multi-tone left→right gradient** blue `#79B4E2` → periwinkle → pink → peach `#DE9FC9`; pos x50 y48.
- **sub-label** "★ STARS · PAPERCLIP ON GITHUB" — mono uppercase ~2.3% (16px), ink; pos x50 y57; leading star is yellow.
- transitionVerb: "The dashed ring fades up and begins a slow CW rotation while '61,800' scales 0.92→1 over ~8f and its gradient sweeps in; confetti dots scatter outward and the sub-label types/fades under it over ~6f."
- timing: stat scale-in 8f; ring rotation continuous (~one rev / 12s); confetti drift continuous; gradient is static (not animated hue-cycle).

### A3 · 6.0–10.0s · `two-logo-compare-cards`
- bgMode LIGHT pastel-mesh (no grid visible), floating squares.
- **card L** white rounded-rect ~38%×26%, contains **OpenAI** logo glyph + label "OpenAI" (bold grotesk ~3.3%); pos x27 y65.
- **card R** white rounded-rect, **Google "G"** multicolor logo + label "Google"; pos x73 y65.
- transitionVerb: "Two white logo cards rise from y75→y65 and fade in together over ~10f, scale 0.96→1, each with a soft drop-shadow; floating squares drift past."
- timing: cards rise+fade 10f, staggered ~2f L-before-R.

### A4 · 10.0–13.0s · `title-card-two-tone` (chips)
- bgMode LIGHT pastel-mesh.
- **headline** "Already powering **real** businesses." — black grotesk two-tone; "Already powering" + "businesses." ink `#0D0D10`, "real" periwinkle `#9AA0F2`; fontSize ~7% (50px cap); 2 lines centered; pos x50 y22.
- **status chips** stacked: "● MIT LICENSED" (teal dot), "● OPEN SOURCE" (violet dot), "— 61.8K STARS" (greyed) — mono uppercase ~2.4%, white glassy pills ~46% wide; pos x50 y50–62, stacked ~7% apart.
- transitionVerb: "Headline slides up word-group by word-group with motion-blur (~2 words/6f); then the three chips pop in top-to-bottom, ~1 chip/5f, each overshooting scale 0.85→1.05→1."
- timing: headline build ~12f; chips stagger 5f each.

### A5 · 13.0–16.0s · `title-plus-trio-cards`
- bgMode LIGHT pastel-mesh.
- **headline** "People are spinning up whole **companies** on it." — ink, "companies" periwinkle `#9AA0F2`; ~7% (50px); 3 lines; pos x50 y20.
- **trio cards** bottom row, 3 white rounded-rects each w/ tiny "● BUILT ON PAPERCLIP" mono micro-kicker + bold name ("Halcyon Studio" / "Atlas Foundry" / "Meridian Labs") + grey subline; ~30% wide each; pos y60, x18/x50/x82.
- transitionVerb: "Headline builds line-by-line top-down (~6f/line); the three labeled cards slide up from below and fade in left→right, ~1 card/4f, scale 0.96→1."
- timing: headline 18f; cards 12f total staggered.

### A6 · 16.0–20.0s · `browser-mockup-card` (hero product)
- bgMode LIGHT pastel-mesh + grid.
- **browser card** large white rounded window, traffic-light dots (red/yellow/green) top-left, right-corner mono crumb "paperclip ▸ ai"; centered **serif** wordmark "Paperclip" (~7%, grey `#9A9AA0`); window ~88% wide × ~46% tall; pos x50 y48.
- transitionVerb: "The browser chassis rises from y58→y48 and fades+scales 0.95→1 over ~12f; the 'Paperclip' serif wordmark cross-fades in ~6f after the frame lands."
- timing: card rise 12f; wordmark fade 6f delayed.

### A7 · 20.0–34.0s · `browser-mockup-card` sequence (product walkthrough)
- Same browser chassis persists; **floating label pills** pop above it ("● CEO AGENT SPAWNED", "● HIRING ROSTER · 24/7", "● REAL AI AGENTS") and the in-window content swaps (node graph → roster table → "Every decision traced." serif → Claude Code dashboard).
- **bottom info cards** appear: "FOUNDER · 24/7 / CEO Agent", "IC · 12 SEATS / Engineers", "GROWTH LEAD / Marketing Director" (white rounded chip-cards, bold name ~3.3%, micro mono kicker).
- transitionVerb: "Per beat, a status pill clip-reveals above the window (~6f) while the window's inner screenshot cross-dissolves (~10f) and a new bottom info-card slides up (~8f)."
- timing: pill reveal 6f; inner content cross-dissolve 10f; info-card slide 8f, staggered.

### A8 · 34.0–42.0s · `browser-mockup-card` (Claude Code + agent stack)
- "● REAL AI AGENTS" kicker pill grows to add chips "— Claude Code → Codex → Cursor" (stagger pop).
- Window shows dark IDE screenshot then a dark analytics dashboard (bar charts teal/yellow).
- Bottom: "● EVERY AGENT IS ACCOUNTABLE" + browser shows serif "Open source. Self-hosted. Yours." with dark CLI pill "$ npx paperclip onboard" + button row.
- bottom info-cards "● BUDGET / $200/mo", "● JOB TITLE / CEO", "● REPORTS TO / → You".
- transitionVerb: "Agent-name chips append to the top pill one at a time (~1/5f, overshoot); the dark dashboard inside the window cross-dissolves; three stat info-cards rise bottom-up staggered ~4f."
- timing: chip append 5f each; dashboard dissolve 10f; info cards 4f stagger.

### A9 · 42.0–46.0s · `title-card-two-tone` (manifesto)
- bgMode LIGHT pastel-mesh, **strong center mesh glow** (mint→periwinkle→peach).
- **headline** "This isn't **vibe-coding** a chatbot." — ink `#00060D` + "vibe-coding" lavender-grey `#B9BEE8`; ~8% (58px); 2 lines; pos x50 y48.
- **sub** "THIS IS AN ORG." — mono uppercase ~2.2%, violet `#9AA0F2`; pos x50 y58.
- transitionVerb: "Headline pops in line-by-line with a quick blur-clear (~6f/line); the center mesh glow swells brighter behind it (~14f) as the mono sub-line fades up last."
- timing: headline 12f; glow swell 14f; sub fade 6f.

### A10 · 46.0–52.0s · `phone-mockup-card`
- bgMode LIGHT pastel-mesh + floating squares.
- **headline** "Run a whole company from your **phone**." — ink + "phone." periwinkle `#8E8BF3`; ~7.5% (54px); 2 lines; pos x50 y18.
- **phone mockup** dark iPhone, screen lists "CEO / Engineers / Marketing / Copy" rows w/ time stamps, header "✏ PAPERCLIP", footer "ORG RUNNING · 24/7"; phone ~33% wide; pos x50 y58.
- transitionVerb (measured from Atitle burst f1→f16): "Headline reveals word-by-word with a heavy upward motion-blur trail — 'Run a' then 'whole' then 'company' then 'from' then 'your' then 'phone.' — ~2 words per 6f; simultaneously the phone slides up from y70→y58 and fades 0→1 over ~12f while its on-screen rows populate top-down one per ~3f."
- timing: headline word-build ~18f total; phone rise+fade 12f; rows populate 3f each.

### A11 · 52.0–55.08s · `cta-comment` (kinetic outro)
- bgMode LIGHT pastel-mesh, floating squares, confetti specks.
- **kicker pill** "● GET THE LINK" — mono, glassy white pill; pos x50 y19.
- **headline** "Comment" (ink ~7%) + giant two-tone **"AI"** (gradient violet→blue `#8E8BF3`, ~18%/130px, quotes included "AI") + "and I'll DM the GitHub repo." (ink ~4.5%); centered stack x50 y28–52.
- **handle pill** "◌ @abhishek.devini" — gradient-tinted glassy pill; pos x50 y60.
- transitionVerb: "'Comment' fades in, then '\"AI\"' scales 0.9→1 with a violet→blue gradient sweep (~8f) and a soft bloom; the instruction line and handle pill fade up under it (~6f each, staggered)."
- timing: "AI" scale+bloom 8f; lines stagger 6f.

---

# REEL B — DX9k8WDPZ2D (105.28s) — "Claude watches video" — LIGHT warm-orange mesh

bgMode: **LIGHT warm mesh** — base pale lavender `#F0E8F1`, but mesh blobs are **warm Anthropic-orange** dominant: large peach/orange glow upper-center `#E47F52`-tinted, yellow lower-center, periwinkle blob right edge. Faint floating rounded squares. **No grid** on most scenes (cleaner than A). This is the "brand-tracks-topic" case — topic is Claude, accent is **Claude orange `#FF8448`**.
Accent family: warm — orange `#FF8448`/`#FA9600` primary, with periwinkle `#7076FD`, teal `#0BC390`, pink/coral and YouTube-red as secondary topic colors.
Kicker convention: numbered `● NN / WORD` top-left, persistent per section. Sections 01–14.

### B1 · 0.0–4.0s · `intro-spark` (01/WATCH)
- bgMode LIGHT warm mesh. Big soft peach radial glow center.
- **kicker pill** "● 01 / WATCH" — mono uppercase ~2.4% (17px), ink, orange status dot, glassy white pill; pos x15 y17.
- **spark glyph** — the orange asterisk/burst "✳" mark (Claude-style spark), line-art orange `#E47F52`, ~10% wide; pos x50 y31 (above where headline will land).
- transitionVerb: "The orange spark draws/fades in center over ~10f with a peach radial bloom expanding behind it; the kicker pill clip-reveals top-left (~6f)."
- timing: spark draw-in 10f; glow bloom 14f.

### B2 · 4.0–11.0s · `title-card-two-tone` + kinetic-subtitle (01/WATCH)
- **spark** persists top-center, **breathing pulse** (scale ~0.97↔1.0, glow opacity cycles) ~every 20f.
- **headline** "Claude now watches video. **Frame** by **frame**." — ink `#0D0D10` two-tone, "Frame"+"frame." orange `#FA9600`; ~8.5% (61px); 3 lines; pos x50 y50.
- **kinetic subtitle** "Not just the ~~transcript~~ — the **actual visuals**." — semibold ~4% (29px); "transcript" gets a **pink/coral strike-through**, "actual visuals" orange; pos x50 y68.
- (later) **chip** "Now Claude sees **both**." appears in a peach glassy pill, "both" orange; pos x50 y78.
- transitionVerb (measured Bopen f1→f24): "Headline is already set; the two subtitle lines fade up from faint→full over ~24f, the strikethrough stroke wipes across 'transcript' L→R landing ~f18, 'actual visuals' brightens orange last; finally the peach 'both' pill pops up (~6f, overshoot)."
- timing: subtitle fade 24f; strike wipe ~6f landing f18; both-pill pop 6f; spark breathe ~20f cycle.

### B3 · 14.0–18.0s · `terminal-mockup-card` (03/RUN IT)
- **kicker** "● 03 / RUN IT" top-left.
- **headline** "Type. Paste. **Watch**." — ink + "Watch." orange `#FF8448`; ~8.5% (61px); 1 line; pos x46 y20.
- **terminal card** glassy white-ish rounded window, traffic dots + crumb "~/claude-projects"; body: green `$` then orange "/claude-watch", grey "https://youtu.be/bV-N_d7vZJM" with blinking caret block, "↵ ENTER" pill button; card ~88% wide; pos x50 y36.
- transitionVerb: "Headline pops word-by-word ('Type.'→'Paste.'→'Watch.' ~1 word/4f); the terminal card rises+fades (~12f), then the command **types in** char-by-char with a blinking block caret (~2 chars/f), ENTER pill fades in last."
- timing: headline 12f; card rise 12f; type-on ~1.5s; caret blink 15f cycle.

### B4 · 18.0–24.0s · `result-screen-recording` (04/RESULT)
- **kicker** "● 04 / RESULT".
- **dark result card** near-full-width dark panel "Key Concepts" bulleted list (Skill, Plugin, Context rot, Quality gates, Sandboxed tool calls, Three-layer retrieval) w/ inline orange code-pill timestamps `[t=02:26]`; pos x50 y62; title bar "claude-watch-result.mov".
- floating **stat numbers** above: "30 min" (pink/coral `#F4828A`), "2 min" (teal `#0BC390`), green ring "◯"; pos y28.
- transitionVerb: "Three stat tokens pop in across the top staggered (~1/5f); the dark result panel slides up from below and fades (~12f); list rows reveal top-down ~1 row/3f."
- timing: stats 5f stagger; panel 12f; rows 3f each.

### B5 · 24.0–34.0s · `grid-vs-terminal` / decode-network (05/DECODE)
- **kicker** "● 05 / DECODE".
- **headline** "Every top creator. **Decoded**." — ink + "Decoded." periwinkle `#7076FD`; ~8% (58px); 2 lines; pos x50 y22.
- **video thumbnail cards** row: @mrbeast (red gradient), @garrytan (orange gradient), @aliabdaal (blue gradient) — each rounded card w/ ▶ play glyph, handle label, color tag-pill ("HOOK"/"VISUALS"/"TRENDS"); pos y38, x22/x50/x78.
- **OBSIDIAN VAULT** node bottom-center w/ curved **connector lines** (orange/orange/blue) drawn from each card down to it.
- transitionVerb: "Headline two-tone builds (~12f); three thumbnail cards pop up staggered L→R (~1/5f); then tag-pills fade onto each, and the three curved connector strokes **draw downward** from cards to the vault node (~14f path animation)."
- timing: cards 5f stagger; connectors draw 14f; vault node fade 6f.

### B6 · 36.0–42.0s · `title-card` + particle-cluster (06/BRAIN)
- **kicker** "● 06 / BRAIN" (violet dot).
- **headline** "Second brain. On **autopilot**." — ink + "autopilot." orange `#FA9600` (drawn/handwritten-feel underline weight); ~9% (65px); 2 lines; pos x50 y24.
- **node cluster** ~7 periwinkle `#7076FD` dots of varied size arranged in a loose ring/graph, center x50 y42, faint connecting edges.
- transitionVerb: "Headline pops (ink line first, orange 'autopilot.' wipes in second ~8f); periwinkle nodes pop into a ring one-by-one (~1/3f) with subtle connecting edges drawing between them."
- timing: orange-word wipe 8f; nodes 3f stagger; edges draw 10f.

### B7 · 42.0–52.0s · `youtube-mockup-card` (07/TUTORIAL)
- **kicker** "● 07 / TUTORIAL".
- **big card** peach-tinted glassy rounded card center; inside: **YouTube red ▶ tile** (`#FF0000`), headline "Full tutorial on **YouTube**." (ink + "YouTube." red-pink `#FB5C7A`, ~6.5%), handle "@DeviniLabs" (pink ~3.5%), CTA pill "↗ LINK IN PROFILE" (mono); card ~85% wide; pos x50 y55.
- transitionVerb: "The card rises+scales (0.95→1, ~12f); the red YouTube tile pops with a slight bounce (~6f, overshoot); text lines fade up under it staggered ~5f; CTA pill last."
- timing: card 12f; tile bounce 6f; lines 5f stagger.

### B8 · 52.0–60.0s · `grid-vs-terminal` (08/UNDER THE HOOD)
- **kicker** "● 08 / UNDER THE HOOD".
- **headline** "Images + **text**. That's all Claude needs." — ink + "text." periwinkle `#7076FD`; ~8% (58px); 2 lines; pos x50 y22.
- two **dark squares** placeholder (~22% each) center → resolve into: LEFT a **color grid mockup** (3×3 colored tiles) labeled "IMAGES" (orange), RIGHT a **dark terminal text block** ([00:14] Subject enters…) labeled "TEXT" (periwinkle); pos y52, x22/x78.
- transitionVerb: "Headline builds (~12f); two solid dark squares slide up from below (~10f), then **cross-fade** their contents in — left into a 9-tile color grid, right into terminal text — over ~12f, with mono labels typing under each (~6f)."
- timing: squares slide 10f; content cross-fade 12f; labels 6f.

### B9 · 60.0–66.0s · `terminal-mockup-card` + app-grid (09/YT-DLP)
- **kicker** "● 09 / YT-DLP".
- **headline** "Pull from **anywhere**." — ink + "anywhere." teal `#0BC390`; ~9% (65px); 1 line; pos x50 y20.
- **command pill** "$ yt-dlp https://...|" (green `$`, blinking caret) glassy wide bar; pos x50 y33.
- **app-icon grid** row of glassy rounded app tiles: YouTube(red), Loom(spark), Instagram(gradient), "+ more"(orange) — pop-in staggered; pos y50, centered.
- transitionVerb: "Headline pops ('anywhere.' teal wipes in ~8f); the command bar fades up with a typing caret (~8f); then 4 app tiles pop in left→right with overshoot (~1/4f)."
- timing: command 8f; app tiles 4f stagger overshoot.

### B10 · 66.0–72.0s · `brand-lockup` / spark-whip (10/EXTRACT)
- **kicker** "● 10 / EXTRACT".
- **headline** (transitioning, motion-blurred) — ink, mid-swap; pos x50 y22.
- **dark spark/diamond glyph** tumbling center (rotated ~45°, near-black) — a brand mark mid-spin; pos x50 y36.
- transitionVerb: "Previous headline blurs out as a dark spark mark **whip-rotates** into center (spins ~90° with heavy motion-blur over ~6f) then settles upright; mesh blobs swell warm behind it."
- timing: whip-rotate 6f; settle 4f.

### B11 · 72.0–78.0s · `audio-waveform` (11/TRANSCRIBE)
- **kicker** "● 11 / TRANSCRIBE" (violet dot).
- **headline** "Transcribe." — ink, motion-blurred entrance; ~9% (65px); pos x50 y22.
- **waveform bar** wide glassy rounded pill containing a **periwinkle `#7076FD` audio waveform** (many vertical bars, varied height, peach gradient wash behind); pos x50 y31.
- transitionVerb: "'Transcribe.' slides up with motion-blur (~6f); the waveform pill fades in then its bars **animate height** in a left→right travelling wave (continuous, ~1 cycle/30f)."
- timing: headline 6f; waveform bars animate continuously.

### B12 · 78.0–90.0s · `sync-split` (12/SYNC) — video-card + Claude-reads caption
- **kicker** "● 12 / SYNC".
- **headline** "Claude reads. Claude **watches**. Same time." — ink + "watches." orange `#FA9600`; ~7.5% (54px); 3 lines; pos x50 y18.
- **video card** (teal/blue gradient thumbnail, ▶, burnt-in caption "[00:42] Speaker walks toward camera") left; pos x28 y45.
- **Claude badge** circular white "✳ Claude / CLAUDE" right; pos x78 y45.
- **caption read-out card** "▸ CLAUDE SEES: [00:42] Speaker walks toward camera." white glassy bar; pos x50 y62.
- **timeline scrubber** "00:14 · 00:27 · **00:42** · 00:58 · 01:14" w/ orange-highlighted active stamp; pos x50 y72.
- transitionVerb: "Headline builds line-by-line (~6f/line, 'watches.' orange wipes in); video card and Claude badge fade up on opposite sides (~10f); the SEES caption bar slides up (~8f); timeline stamps pop in L→R with the active 00:42 stamp lighting orange (~1/4f)."
- timing: headline 18f; cards 10f; caption bar 8f; timeline 4f stagger.

### B13 · 90.0–96.0s · `vs-cards` (13/LOCAL)
- **kicker** "● 13 / LOCAL" (teal dot).
- **headline** "Runs on **your** machine." — ink + "your" orange `#FF8448`; ~9% (65px); 1 line; pos x50 y20.
- two **outlined VS cards**: LEFT teal-outlined "💻 LOCAL / your machine" (laptop glyph, "LOCAL" teal), RIGHT pink-outlined "$0 NO API / no monthly bills" ("$0" + "NO API" pink/coral); each ~40% wide; pos y52, x27/x73.
- transitionVerb: "Headline pops ('your' orange wipe ~8f); two outlined cards rise from below (~10f) and their glyphs/labels fade in (~6f); the colored borders **draw on** (stroke-dash reveal ~12f)."
- timing: headline 8f; cards 10f; border draw 12f.

### B14 · 96.0–105.28s · `cta-comment-searchbar` (14/GET IT)
- **kicker** "● 14 / GET IT".
- **headline** "Comment" (ink black ~10%/72px, pos x50 y31) + "**AI**" (orange `#FF8448` ~8%/58px, pos x50 y40).
- **search/input bar** wide glassy rounded bar w/ **orange dot** left + blinking text caret + **orange ↗ circle button** right; pos x50 y59.
- transitionVerb: "'Comment' drops in bold (~6f); 'AI' fades up orange under it (~6f); the input bar slides up, the orange send-button pops (overshoot ~6f), and a caret blinks in the field."
- timing: headline 6f+6f; bar slide 8f; button pop 6f; caret blink 15f.

---

# REEL C — DXTd62KCBAV (32.09s) — "3D website builder skill" (Devini) — PAPER-GRID mode

bgMode: **PAPER / light-grid** — flat warm off-white `#DDD8D5`–`#DFD8D3`, faint **square grid** lines edge-to-edge, subtle vignette (slightly brighter center). **No mesh-gradient blobs, no floating squares.** Distinct from A/B. The hero visual is a large **3D-tilted browser/screen-recording mockup** with a dark chassis, and **dark/green terminal "chat" pills** (Claude Code conversation bubbles) slide in at the bottom. Accent: **orange `#E47A51`/`#D57343`** + green `#2E8568` for "shipped/done" states.
Type: same black-grotesk headline system, but kinetic subtitle is **pinned top-center** (not bottom), small, two-tone.

### C1 · 0.0–2.0s · `paper-intro`
- bgMode PAPER grid only, empty. bg `#DDD8D5`.
- transitionVerb: "Blank warm-paper grid holds ~1s with a faint vignette breathing, then the first mockup begins rising."
- timing: hold ~30f.

### C2 · 2.0–4.5s · `browser-mockup-card` + top-kinetic-subtitle ("1 hour")
- **top subtitle** "This whole 3D site? **1 hour**." — semibold grotesk ~3.5% (25px); ink + "1 hour." orange `#E47A51`; pinned top-center; pos x50 y6.
- **browser mockup** large 3D-perspective-tilted browser window (dark chassis bezel `#1E1E20`, light content) showing a **3D statue/asset scene with floating debris**; window ~80% wide, slightly tilted; pos x50 y38.
- **dark chip** "● start to ship · 55 minutes" small dark pill below card; pos x50 y66.
- transitionVerb: "Top subtitle types/fades in pinned at the top (~6f); the tilted browser mockup rises from below and fades (~12f, scale 0.96→1) on a slight 3D perspective; the dark status chip pops under it (~5f)."
- timing: subtitle 6f; mockup rise 12f; chip 5f.

### C3 · 4.5–9.0s · `browser-mockup-card` sequence ("One custom skill handles it all")
- **micro-kicker** "HERE'S THE WILD PART" — mono uppercase ~2.2%, grey; pinned top; pos x50 y6.
- **headline** "One **custom skill** handles it all" — ink + "custom skill" orange `#D57343`; ~5% (36px); 2 lines; pos x50 y15.
- **browser mockups cross-swap**: Devini product page (split panels, clock graphic) → dark hero "Let's Build Something Exceptional" mountain site; tilted dark-chassis window; pos x50 y40.
- **dark command chip** "● /3d-website-builder · CUSTOM" bottom; pos x50 y82.
- transitionVerb: "Headline two-tone pops (ink first, 'custom skill' orange wipes ~8f); the browser content cross-dissolves between site demos (~12f) while the whole window does a slow continuous parallax drift; the orange-tagged command chip slides up (~6f)."
- timing: headline 8f; content dissolve 12f; chip 6f; window slow-drift continuous.

### C4 · 9.0–12.0s · `browser-mockup-card` (mountain hero site)
- top kicker persists; window shows full dark "Let's Build Something Exceptional" mountain landing page.
- **dark chip** "I'M GONNA BE SUCCESS" / build-status pill bottom; pos x50 y82.
- transitionVerb: "The site screenshot scrolls/cross-fades inside the tilted window (~10f); chip swaps text with a quick fade (~4f)."
- timing: inner scroll/fade 10f.

### C5 · 12.0–16.5s · `browser-mockup-card` + chat-pill ("I just asked")
- **top subtitle** "I just **asked**." — ink + "asked." orange; pinned top; pos x50 y13.
- **browser mockup** shows a pixel-art "DEVINI / BUILD WITH" retro game site (blue pixel text on black); tilted dark chassis; pos x50 y40.
- **chat pill** dark-green rounded **terminal/chat bubble** "● YOU → CLAUDE / build me" sliding up bottom; green `#2E8568` accent, mono text; pos x50 y80.
- transitionVerb: "Top subtitle pops ('asked.' orange ~6f); the pixel-art site cross-fades into the window (~12f); a dark-green chat bubble **slides up from the bottom edge** (~8f) with the 'build me' command typed in (~1 word/3f)."
- timing: subtitle 6f; site fade 12f; chat bubble slide 8f.

### C6 · 16.5–22.5s · `browser-mockup-card` + stacked-chat-pills ("And it just did it")
- **top subtitle** "And it just **did it**." — ink + "did it" orange; pinned top; pos x50 y13.
- **browser mockup** pixel-art "DEVINI BUILD WITH" → resolves into a **white 3D bust statue with gold cracks** scene (the finished 3D site); tilted dark chassis; pos x50 y38.
- **stacked green chat pills** bottom: "Generated the 3D models" / "Wrote the code" / "Set up the scene" / "Shipped it" — dark-green rounded bubbles stacking up one per beat; pos x50 y68–82.
- transitionVerb: "Subtitle pops; the window content cross-dissolves from pixel-site → finished 3D-bust site (~12f); four green status chat pills **stack up bottom-to-top, ~1 pill/8f**, each sliding up + fading with a checkmark."
- timing: content dissolve 12f; chat pills 8f stagger each.

### C7 · 22.5–25.5s · `browser-mockup-card` + spark-whip ("none of the usual mess")
- **top subtitle** "And **none** of the usual mess" — ink + "none" orange/red; pinned top; pos x50 y13.
- **browser mockup** 3D-bust site; below it two dark chips "● no sweat pasta"/"● no boilerplate" (anti-pain chips); pos x50 y70.
- → **orange spark logo whips in**: the rounded-square **orange `#E47A51` spark tile** (white asterisk on orange rounded-square, ~18% wide) flies in over the mockup, growing; pos x50 y30.
- transitionVerb (measured Clogo burst): "The dark chips fade in (~5f); then the orange spark tile **whip-scales in from huge→settled** over the mockup (motion-blur, scale ~1.4→1 over ~8f), and the browser mockup behind it fades/scales down as the scene collapses to the logo."
- timing: chips 5f; spark whip-in 8f.

### C8 · 25.5–30.0s · `brand-lockup` + pipeline-chips ("One skill. Whole pipeline.")
- bgMode PAPER grid, centered.
- **spark tile** orange rounded-square `#E47A51` w/ white asterisk, ~17% wide, with a faint **orbiting ellipse ring** around it; pos x50 y32; gentle idle bob.
- **headline** "One **skill**. Whole **pipeline**." — ink + "skill"/"pipeline" orange; ~6% (43px); 2 lines centered; pos x50 y55.
- **pipeline chips** dark rounded pills row "● ASSETS · CODE · SCENE · SHIP" pop in L→R; pos x50 y66.
- **flow line** "asset → code → scene → **shipped**" — mono/italic, "shipped" green `#2E8568`; pos x50 y73.
- transitionVerb (measured Clogo f1→f20): "Spark tile sits center with a slow orbiting ring + idle bob; headline is in; the four dark pipeline chips **pop in left→right ~1/5f with overshoot**, then the 'asset → code → scene → shipped' flow line types/fades under them (~8f), 'shipped' landing green."
- timing: chips 5f stagger; flow line 8f; ring orbit continuous (~one rev/3s); bob ~2px.

### C9 · 30.0–32.09s · `cta-comment-chat` ("Comment AI for the full setup")
- bgMode PAPER grid.
- **spark tile** smaller, top; pos x50 y14.
- **headline** "Comment **\"AI\"** for the full setup" — ink + "\"AI\"" orange; ~6% (43px); 2 lines centered; pos x50 y32.
- **chat input pill** dark-green rounded bar "● you · just now / AI|" w/ blinking caret + send glyph right; pos x50 y58.
- **micro-cta** "RUNNING TONIGHT · GUARANTEED ↓" — mono grey, downward arrow; pos x50 y76.
- transitionVerb: "Spark shrinks to the top (~6f); headline fades in ('\"AI\"' orange); the dark-green chat bar slides up (~8f) with 'AI' typed + blinking caret; the micro-cta + down-arrow fade in last (~6f)."
- timing: spark shrink 6f; chat bar 8f; cta 6f; caret blink 15f.

---

## CROSS-REEL TEMPLATE INDEX (distinct templates found)

1. `intro-counter` (A1)
2. `intro-spark` (B1) / `paper-intro` (C1)
3. `big-stat-number` (A2) — gradient numeral + rotating dashed ring + confetti
4. `two-logo-compare-cards` (A3)
5. `title-card-two-tone` (A4, A5, A9; B2, B5, B6; C3) — the core headline template
6. `browser-mockup-card` (A6, A7, A8; C2, C3, C4, C5, C6, C7) — incl. 3D-tilted paper variant
7. `phone-mockup-card` (A10)
8. `cta-comment` / `cta-comment-searchbar` / `cta-comment-chat` (A11; B14; C9)
9. `terminal-mockup-card` (B3, B9)
10. `result-screen-recording` (B4)
11. `grid-vs-terminal` (B8) — images-grid vs terminal-text split
12. `decode-network` / connector-graph (B5)
13. `particle-cluster` node graph (B6)
14. `youtube-mockup-card` (B7)
15. `brand-lockup` + spark/orbit (B10; C7, C8)
16. `audio-waveform` (B11)
17. `sync-split` video-card + caption + timeline (B12)
18. `vs-cards` outlined comparison (B13; C8 pipeline-chips variant)
19. `kinetic-subtitle` (pinned-top variant in C; bottom variant in B2)
20. `trio-cards` labeled bottom row (A5)

**~20 distinct templates across the 3 reels.**
