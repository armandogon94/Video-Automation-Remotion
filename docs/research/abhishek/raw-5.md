# abhishek.devini — Frame-by-Frame Analysis (raw-5)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels. 720×1280 @ 30fps.
Reels in this batch: **DYfC4O8vS-r** (45.32s / 1360f), **DYpMPSjvUyy** (35.18s / 1055f), **DYukIE0PFac** (53.84s / 1615f).

Method: ffmpeg overview frames (every 1.2–1.8s) + 30fps transition bursts + PIL HEX sampling on real frames (dominant-saturation scan for accents, darkest-pixel scan for near-black text). Positions are % of 720w × 1280h. FontSize % = cap-height px ÷ 720.

All three reels share one design language: a centered **letter-spaced pill kicker** at y≈21%, a **giant extra-bold grotesk two-tone headline** in the upper third, **glassmorphic mockup cards** in the middle, optional bottom **kinetic subtitle**, and a **brand-lockup / comment-CTA outro**. Reel 1 + Reel 3 are LIGHT mesh mode; Reel 2 is DARK amber mode.

---

# REEL 1 — DYfC4O8vS-r ("Prompt it. Post it." AI-video-pipeline promo)

bgMode: **LIGHT — iridescent/holographic pastel mesh** (mint + lavender + pink + peach drifting blobs over near-white). Faint square grid mostly absent here; instead soft rainbow gradient washes + tiny floating glyph chips (◇ ⊕ ⊗ ∞ Σ Δ) parked at the side margins (x≈10% / x≈88%). Sampled bg: TL `#D2CAD5`, mint-center `#E0EEE7`, lavender-right `#C5C5E5`, pink-bottom `#EACADD`, near-white field `#EFE9EE`. Near-black text `#000000–#141414`. Claude logo orange `#E08A5A`→`#EF9D83`.

### 1.1 — browser-mockup-card (Claude) · 0.0–4.0s
- bgMode LIGHT mesh. accent: Claude orange `#E08A5A`.
- **mockup card**: rounded glass browser panel, x≈16–84%, y≈17–82%, fill `#F2EEF4` @ ~85% opacity, 28px radius, 1px light border.
  - **brand lockup**: orange Claude burst-asterisk icon + wordmark `Claude` — bold grotesk, ~3.5% (25px), near-black `#1A1A1A`, x≈21% y≈19%.
  - **label** `new chat` — mono, letter-spaced, ~2% (14px), grey `#9A9AA2`, x≈73% y≈19%.
  - **input ghost-bar**: rounded lavender pill `#E2E0F2` with 2 grey skeleton lines, x≈31–80% y≈24–29%.
  - **floating mic/wave chip**: dark rounded-square `#23222A` w/ blue waveform, x≈74% y≈33%.
  - **send button**: peach gradient rounded-square `#F0B48E` + black ↑ arrow, x≈75% y≈77%.
- transitionVerb: *Card fades up from opacity 0 + translateY +24px over the first 8f while the orange Claude asterisk draws its rays outward; the send-button ↑ pulses scale 1.0→1.08→1.0 on a 12f loop.*
- timing: card rise 8f; logo-ray draw ~10f; send-pulse 12f loop.

### 1.2 — step-cards-row (STEPS · 01→03) · 4.0–9.0s
- kicker pill `● STEPS · 01 → 03` — mono uppercase, letter-spaced ~0.18em, ~1.8% (13px), near-black on white pill `#F4F4FA` w/ green dot `#34D3A0`, centered x≈50% y≈21%.
- **card 01** (Claude mini-browser): glass card x≈4–37% y≈35–60%, highlighted with **amber/yellow 1px outline** `#E6C24A`; big number `01` bottom-left, extrabold ~5% (36px) black.
- **card 02** (assets): glass card x≈37–63% y≈39–60%; two dark rounded-square icons — blue waveform `voiceover.wav` + lines `script.txt`; labels mono grey ~1.7%; cursor arrow ▲ at x≈43% y≈51%; number `02` bottom-left.
- transitionVerb: *Card 01 slides in from left (x −60px→rest) over 7f, card 02 slides in from right 4f later over 7f, each with a faint amber focus-ring that fades in over 6f; the mouse cursor glides to card 02 over ~10f.*
- timing: card slide 7f each, staggered +4f; focus-ring fade 6f; cursor glide 10f.

### 1.3 — fanned-clip-stack (+ my clips) · ~13.0–14.5s (Q · 02 / 04)
- kicker `● Q · 02 / 04` mono pill, centered y≈21%.
- **three fanned polaroid cards** overlapping center y≈45–63%: `CLIP 01` (mint), `CLIP 02` (lavender), front `MY CLIP` with peach gradient thumb + black **+** glyph; each card mono caption-label top, colored progress dot at bottom (mint/blue/coral).
- bottom subtitle `+ my clips` — mono grey ~2% centered y≈91%.
- transitionVerb: *The three cards fan out from a stacked deck, rotating to −8°/0°/+6° and spreading horizontally over ~10f, the front "MY CLIP" card popping forward with a scale 0.94→1 over 6f.*
- timing: fan spread 10f; front-card pop 6f.

### 1.4 — transcription-mockup (FRAME 0417 / whisper-cli) · ~9.0–12.0s (Q · 01 / 04)
- kicker `● Q · 01 / 04`.
- **frame-counter card** glass pill: `FRAME` label + `0417` big mono extrabold ~5% black + `●LOCKED 00:14.18` chip, x≈25–75% y≈21–27%.
- **waveform**: multicolor bar spectrum (mint/blue/pink/purple) x≈8–92% y≈30–34%.
- **caption rows** (4 stacked glass rows): `00:12.68 → f0380 | But`, `00:12.94 → f0388 | hey`, `00:13.77 → f0413 | audio`, `00:14.18 → f0425 | video` (last row accented lavender + `●SYNC`), mono ~1.8%, x≈8–92% y≈37–48%.
- **scrub timeline**: gradient track `00:00 … SCANNING · WHISPER-CLI … 00:30`, y≈58%.
- bottom subtitle `drift?` mono grey centered y≈61%.
- transitionVerb: *Caption rows type/slide in one per ~6f from x −20px, the waveform bars animate height noise continuously, and the scrub playhead sweeps left→right across the timeline over ~24f while the FRAME counter ticks.*
- timing: caption rows 1 per 6f; playhead sweep 24f; frame-counter ticks per frame.

### 1.5 — dark-terminal-mockup (setup hell) · ~16.5–18.0s (Q · 04 / 04)
- **DARK inset**: macOS terminal window `#14161C` w/ traffic-light dots, monospaced install log (`npm install -g`, `Password:`, `verifying signature…`, `retrying (attempt 4/5)…`, `npm WARN`, errors), plus stacked macOS system modals ("Allow notifications?", "Authentication required" w/ password dots, "Install Xcode tools?" Install button blue `#2F7CF6`).
- footer status `3 errors · 5 warnings` red/amber.
- bottom subtitle `setup hell · ⊘` mono grey y≈95%.
- transitionVerb: *Terminal log scrolls upward continuously (~1 line per 8f) while three system permission modals pop in sequentially, each scaling 0.9→1 + fading over 6f, stacking the chaos.*
- timing: log scroll 1 line/8f; modals pop 6f each, staggered ~12f.

### 1.6 — design-system-mockup (Aa · DESIGN·SYSTEM v4.2) · ~22.5–24.0s (Q · 03 / 04)
- kicker `● Q · 03 / 04`.
- **big tablet card** glass `#EDEAF2`, x≈7–93% y≈26–78%; header `DESIGN · SYSTEM` (mono, left) + `v 4.2` (right); sub-label `TYPOGRAPHY`; three descending `Aa` specimens (extrabold→bold→medium, ~8%/5.5%/4%) at x≈9–34% y≈30–36%; faint right-side spec text.
- transitionVerb: *The tablet card scales up from 0.96 + fades over 8f; the three Aa specimens cascade in left→right one per ~5f, then the whole card holds as the mesh gradient drifts beneath the glass.*
- timing: card scale-in 8f; Aa cascade 5f each.

### 1.7 — WE-GOT-YOU recap-dashboard (THE ANSWER · 4/4) · ~19.5–21s
- kicker pill `● THE ANSWER`.
- headline **WE GOT YOU** extrabold grotesk ~5.5% (40px) black, centered y≈14%; sub `FOUR WORRIES · ONE ANSWER` mono grey ~1.6%.
- **4-quadrant dashboard card** glass, x≈8–92% y≈22–73%: TL `AUDIO + VIDEO` (FRAME 0432 + waveform + caption rows), TR `YOUR CLIPS` (3 dark phone thumbs), BL `DESIGN` (pastel swatches), BR `SETUP` (mini dark terminal). Each quadrant has a **green ✓ checkmark badge** `#27C26B` bottom-right.
- footer `ALL COVERED … 4 / 4`.
- transitionVerb: *The four quadrants pop in clockwise from TL, each scaling 0.92→1 over 5f, and a green ✓ stamps onto each quadrant 3f after it lands.*
- timing: quadrant pop 5f, staggered ~8f; ✓ stamp 3f after.

### 1.8 — big-stat-number (5 / WEEK · AFTERNOON) · ~27.0–28.5s (● OUTPUT)
- kicker `● OUTPUT` w/ amber dot, y≈21%.
- **giant numeral `5`** extrabold grotesk ~22% (≈160px) near-black `#000000`, centered x≈45% y≈45%, drop shadow; behind it a diagonal lavender mesh streak.
- side labels `WEEK` / `AFTERNOON` mono uppercase ~2% grey, stacked bottom-left x≈9% y≈67–70%.
- transitionVerb: *The numeral 5 snaps in scale 0.9→1 + slight rotate-settle over 6f, the diagonal rainbow streak wipes across behind it over ~12f.*
- timing: numeral snap 6f; streak wipe 12f.

### 1.9 — big-stat-number (7 DAYS / 1 afternoon) · ~30.0–31.5s
- **glass circle badge** center y≈45% containing numeral `7` extrabold ~14% black + `DAYS` mono small to its right.
- kinetic subtitle `/ 1 afternoon` — mono, the `1` accented (lavender), x≈14% y≈59%.
- transitionVerb: *The 7 cross-fades in from the previous 5 (number swap) while a glass ring scales 0.9→1 around it over 7f; subtitle "/ 1 afternoon" types in word-by-word.*
- timing: ring scale 7f; subtitle ~1 token/5f.

### 1.10 — icon-grid-divider (no plugins / just reels) · ~34.5–36s
- kicker pill `● no plugins` mono lowercase, y≈21%.
- **2×3 glass icon tiles** center y≈48–61% (⊕ ⊗ ◉ / ⬡ ⬣ ⊠ in mint/indigo/coral/amber), with a **diagonal gradient line** slashing mint→amber across the grid corner-to-corner.
- bottom subtitle `just reels` mono grey centered y≈91%.
- transitionVerb: *The six tiles stagger-pop in (scale 0.9→1, 4f each, reading order), then a single gradient diagonal line draws across them corner-to-corner over ~10f.*
- timing: tile pop 4f each; diagonal line draw 10f.

### 1.11 — comment-CTA-outro (COMMENT / Prompt it. Post it.) · ~39.0–45.3s
- kicker pill `● THE CALL TO ACTION` mono, amber dot, y≈21%.
- headline **COMMENT** extrabold grotesk ~6% (44px) black, centered y≈30%; sub `AND I'LL DM YOU THE KIT` mono letter-spaced grey ~1.7% y≈33%.
- **comment input bar** glass pill x≈9–91% y≈40%: person avatar (orange ring) + typed `A I |` (blinking caret) + grey `Post` button right.
- later a **phone-mockup** rises center showing the devini DM + side chips `THE SKILL / RESOURCES / REFERENCE`; final tail card `Prompt it.` / `Post it.` two-line near-black headline (see contact sheet) bottom-left.
- transitionVerb: *COMMENT slams in scale 1.06→1 over 5f, the input bar slides up from y +40px over 8f, then `AI` types into the field one char per ~6f as the Post button tints active; finally a phone-mockup rises from below over ~12f.*
- timing: headline slam 5f; bar rise 8f; type 1 char/6f; phone rise 12f.

---

# REEL 2 — DYpMPSjvUyy (DARK amber "Devini tea" product build → Comment CTA)

bgMode: **DARK — near-black + amber radial glow + faint square grid**. Sampled bg: base `#060102`, warm glow center `#130A03`→`#2A1A08`. A faint amber square grid is visible behind the glow. accent amber `#F4A632 / #F2B231 / #F0AD38`; Devini serif gold `#EEAA28`; white text `#FFFFFF`.

This reel is **video/mockup-led** (a glowing browser showcase of a fictional "Devini" tea e-commerce site) rather than typographic — the typography templates are the kicker pills, the dark two-tone headlines, the feature-grid, and the brand lockup.

### 2.1 — browser-mockup-card (Devini tea hero) · ~0.0–9.0s
- **dark browser window** centered x≈4–96% y≈35–67%, chrome bar w/ traffic lights + url `🔒 devin1.io/tea`, dashed amber 1px border, header `TEA … SHOP`.
- **hero video content**: a backlit hanging **teabag** with golden volumetric glow (cinematic 3D/AI render), serif wordmark `Devini` glowing amber `#EEAA28` ~5% centered under it; later shot = hands cradling a glowing cup of tea with rising steam.
- transitionVerb: *The browser window fades up from black + scales 0.97→1 over ~10f, the teabag's golden glow blooms in over ~20f, and the content cross-dissolves between hero shots (teabag → cupped hands) over ~12f each.*
- timing: window fade/scale 10f; glow bloom 20f; shot cross-dissolve 12f.

### 2.2 — kicker-pill-tag (● THE COMPLETE BUILD) · ~19.5s
- amber-outlined dark pill `● THE COMPLETE BUILD` mono uppercase letter-spaced ~1.8%, amber text `#F0AD38`, centered x≈50% y≈29%, sitting above the browser card.
- transitionVerb: *The pill fades in + drops from y −16px over 6f while its amber dot ignites (glow pulse) over 4f.*
- timing: pill drop 6f; dot ignite 4f.

### 2.3 — comment-CTA-card (Comment one word) · ~22.0–25.5s (● TO GET IT ALL)
- kicker dark amber pill `● TO GET IT ALL`, y≈34%.
- headline **Comment one word** white extrabold grotesk ~7% (50px), centered y≈44%; small ↓ chevron below.
- **comment input bar** dark rounded `#15110A` x≈10–90% y≈54–61%: amber circle avatar `D` (serif) + typed `A |` white + amber paper-plane ➤ send icon right.
- transitionVerb: *Headline scales 1.05→1 + fades over 5f, the ↓ chevron bounces (y ±6px) on a 16f loop, then `AI` types into the bar one char per ~7f.*
- timing: headline 5f; chevron bounce 16f loop; type 1 char/7f.

### 2.4 — feature-grid-card (Straight to your DMs · 2×2) · ~25.5–28.5s
- headline `➤ Straight to your DMs` white bold grotesk ~5.5% (40px) w/ amber paper-plane glyph, y≈31%.
- **2×2 feature tiles** x≈4–96% y≈37–67%, fill `#140E07` amber-outline glow: `Tutorial video` (▶ amber), `Source code` (`<>` amber), `Assets` (stacked-layers amber), `Prompt guide` (book amber). Tile label white bold ~3% (22px) centered under each amber icon.
- transitionVerb: *The four tiles cascade in TL→TR→BL→BR, each scaling 0.9→1 + amber-border igniting over 5f, staggered ~6f, with the icon glyph fading up 2f after its tile.*
- timing: tile cascade 5f each, stagger 6f; icon fade +2f.

### 2.5 — title-card-two-tone (Want your own build like this?) · ~28.5–31s (● YOUR TURN)
- kicker dark amber pill `● YOUR TURN`, y≈37%.
- headline two lines, two-tone: **Want** (white) **your own build** (amber `#F4A632`) / **like this?** (white) — extrabold grotesk ~7% (50px), centered y≈51–58%.
- transitionVerb: *Line 1 fades up from y +20px over 7f; the amber words "your own build" tint-sweep from white→amber left-to-right over ~8f; line 2 fades up 4f later.*
- timing: line rise 7f; amber tint-sweep 8f; line-2 stagger +4f.

### 2.6 — brand-lockup-outro (Let's build it together. / Devini) · ~31–35.2s
- headline two-tone: **Let's build it** (white) / **together.** (amber `#F2B231`) — extrabold grotesk ~7% (50px), centered y≈28–32%.
- **gold divider line** (thin amber gradient rule) y≈38%.
- brand lockup: serif **Devini** gold `#EEAA28` ~5.5% centered y≈42%; handle `@DEVINILABS` mono letter-spaced amber-grey ~2% y≈46%.
- transitionVerb: *Headline lines fade up sequentially, then the gold divider draws outward from center over ~10f, and the serif "Devini" lockup fades in + rises from y +12px over 8f.*
- timing: divider draw 10f (center-out); lockup rise 8f.

---

# REEL 3 — DYukIE0PFac (LIGHT mesh "Heretic" open-source uncensoring tool)

bgMode: **LIGHT — pastel mesh (peach + lavender + coral + indigo radial blobs) over warm off-white, faint square grid + floating rounded-square chips at margins + tiny scattered stars (in stat scene)**. Sampled bg: TL `#EFE6DF`, warm field `#F5E6DE`, mid `#E4C9C1`, coral blob `#D45A69`, floating square `#F1E4DC`. Near-black text `#000000`.

**Accent palette (sampled on real glyphs):** RED/coral (refusal/censorship) `#DC5867`–`#D7566B`; INDIGO/blue (brains/remove/stat) `#6B60F0`–`#6E5EEB`; AI-outro blue-purple gradient `#8F89F6`; ORANGE (momentum) ≈`#E98C70`. Each numbered section's kicker carries the section accent.

### 3.1 — title-card-two-tone w/ letter-scramble (Strip the CENSORSHIP) · 0.0–4.0s
- kicker pill `● 01 — HERETIC` mono uppercase letter-spaced ~1.8% (13px), near-black on white pill `#FAE9DF` w/ red dot, x≈8% y≈18% (LEFT-aligned, not centered).
- headline `Strip the` (near-black `#1A1A1A`, regular-weight grotesk ~6%) + giant **CENSORSHIP.** (extrabold ~9% / 65px, red `#DC5867`, period accent) — x≈6% y≈35–46%, LEFT-aligned.
- **black padlock icon** centered x≈48% y≈43% during scramble.
- sub line `right out of any open-source AI.` — bold grotesk ~3.5%, "open-source" tinted red; below it a thin underline + command pill `⌘ with one command.` mono in glass pill.
- transitionVerb: *Each headline glyph rapid-cycles through random letters (CE!FMT07!FM → BPW3@BPW3 → QX4#C…) — a decode/scramble effect ~1 random glyph swap per 1–2f for ~60f — resolving left-to-right into "Strip the CENSORSHIP" while the black padlock holds center, then the padlock fades as the sub-line types in.*
- timing: scramble ~60f total, resolve L→R ~1 letter locks/2f; sub-line type 1 token/5f; command pill fade-in 8f.

### 3.2 — browser/response-cards (Ask the Big Three) · ~6.0–8.5s (● 02 — THE BIG THREE)
- kicker pill `● 02 — THE BIG THREE`, LEFT x≈8% y≈18%.
- headline two-tone **Ask the Big Three.** — extrabold grotesk ~7% (50px), "Three." red `#DC5867`, LEFT x≈6% y≈22%.
- **two response cards** glass: `ChatGPT` (icon + `RESPONSE`) sliding from left x≈4–43% y≈30–45%, `Claude` (`▽ Claude` + `RESPONSE`) x≈37–73% y≈32–46%, overlapping.
- transitionVerb: *The ChatGPT card slides in from left (x −50px) over 7f, the Claude card slides in from right 4f later over 7f, overlapping like a stack as a ghost "RESPONSE" watermark fades behind.*
- timing: card slide 7f each, stagger +4f.

### 3.3 — python-tool-card + kinetic-subtitle (this Python tool / It just does it.) · ~9.5–11s
- same kicker/headline `Ask the Big Three.` held above.
- **single glass card** center x≈28–72% y≈58–75% w/ blue+yellow **Python logo** + caption `this Python tool.` bold ~3.5% black + `DOES IT` mono lavender ~1.6%.
- kinetic subtitle **It just does it.** centered y≈90%, extrabold ~4.5%, "does it." tinted lavender `#8F89F6`.
- transitionVerb: *The Python card pops up scale 0.92→1 + fades over 6f, then the subtitle reveals word-by-word "It / just / does / it." one word per ~6f, the final "does it." landing in lavender.*
- timing: card pop 6f; subtitle 1 word/6f.

### 3.4 — title-card-two-tone GIANT (It's called Heretic.) · ~12.5–15.5s
- small grey label `It's called` mono/regular ~2.5% centered y≈35%.
- GIANT headline **Heretic.** extrabold grotesk ~16% (115px) near-black `#000000`, period accent, centered y≈48%.
- behind: strong coral-left / indigo-right radial mesh bloom; 4 floating rounded-square chips at corners (x≈10/90%, y≈22/72%).
- (continues) chips row appears: `+ no fine-tuning`, `+ no training data`, `+ no manual setup` (mono pills) under a smaller Heretic + `RECOVERS ANY OPEN-SOURCE LLM · FULLY AUTOMATIC` micro-label; kinetic subtitle **nothing.** lavender centered y≈83%.
- transitionVerb: *"It's called" fades in first (8f); then "Heretic." rises from y +40px + scales 0.92→1 over ~7f settling at frame ~13.7s; the corner chips drift inward subtly; later the three feature pills stagger-pop in (4f each) and "nothing." snaps in.*
- timing: label fade 8f; Heretic rise+scale 7f; feature pills 4f each; "nothing." snap 5f.

### 3.5 — grid-vs-terminal mockup (Find the pattern. Remove the weights.) · ~27.0–33s (● 03 — THE MECHANISM)
- kicker pill `● 03 — THE MECHANISM`, LEFT x≈8% y≈18%.
- headline two lines: **Find the pattern.** (near-black, "Find the" grey-black) / **Remove the weights.** — extrabold grotesk ~6.5% (47px), "Remove" indigo `#6E5EEB`, LEFT x≈6% y≈22–30%.
- **weight grid mockup**: two stacked faint square-grid panels x≈14–86% y≈37–73%, with `→ REFUSAL` micro-label; the lower grid tints indigo on the right.
- **dark README panel** (GitHub-style): dark navy panel `#0E1117` slides up x≈8–92% y≈35–67% showing markdown ("Prior art", blue links `AutoAbliteration`, `abliterator.py`, `Removing refusals with HF Transformers`, "Acknowledgments"), blue links `#4C8DF5`.
- kinetic headline **That's it.** near-black extrabold ~6% centered y≈73% after panel.
- transitionVerb: *The two grid panels fade in, the right half tinting indigo to mark "removed weights" over ~10f; then the dark README panel slides up from y +60px over ~10f and auto-scrolls its markdown upward (~1 line/8f); finally "That's it." snaps in scale 1.05→1 over 5f.*
- timing: grid tint 10f; panel slide-up 10f; README scroll 1 line/8f; "That's it." snap 5f.

### 3.6 — grid-vs-terminal stat-cards (Keep the brains. Lose the guardrails. · 99% / 4%) · ~33–43s (● 04 — THE WILD PART)
- kicker pill `● 04 — THE WILD PART`, LEFT x≈8% y≈18%.
- headline two lines two-tone: **Keep the brains.** ("brains." indigo `#6B60F0`) / **Lose the guardrails.** ("guardrails." red `#D7566B`) — extrabold grotesk ~6.5% (47px), LEFT x≈6% y≈23–31%.
- **two stat cards** glass x≈4–47% & x≈53–96%, y≈45–73%:
  - LEFT `BRAINS · INTACT` — a **node-graph** (7 indigo-ringed white nodes + connecting edges) + big stat `99%` indigo `#6B60F0` bottom-right + `CAPABILITY` micro-label.
  - RIGHT `GUARDRAILS · REMOVED` — sparse fading node graph + big stat `4%` red `#D7566B` (counts down from a higher start to 2%) + `REFUSAL RATE` micro-label.
- footer micro-label `INTELLIGENCE PRESERVED · REFUSALS REMOVED` mono centered y≈83%.
- transitionVerb: *Headline lines reveal first (the second line "Lose the…" starting greyed then color-snapping its accent word); the two cards slide up from y +40px over 8f; the LEFT node-graph draws its edges node-by-node (~1 edge/3f) while `99%` counts 0→99 over ~20f, and the RIGHT `4%/2%` counts down over ~20f.*
- timing: cards slide 8f; node edges 1/3f; stat count ~20f (0→99 / down to 2).

### 3.7 — big-stat-number bar-chart (heretic · 19,847 · MOMENTUM) · ~44.5–49s (● 05 — MOMENTUM)
- kicker pill `● 05 — MOMENTUM`, LEFT x≈8% y≈18%.
- **GitHub-star stat card** glass x≈8–92% y≈22–48%: header `GitHub` + bold `heretic` repo + purple ★ star icon; GIANT counter `19,847` extrabold grotesk ~10% (72px) near-black, x≈10% y≈29%, comma-formatted; `and counting` mono grey right; **bar-chart histogram** below (grey bars rising left→right, rightmost ~5 bars tint lavender→coral `#E98C70`).
- below card: glass pill `1,115+ community models running on it` — `1,115+` orange, rest near-black, centered y≈63%.
- decoration: scattered **stars** (lavender + coral, 4-point) floating across the field.
- transitionVerb: *The counter rapid-counts up 19,788→19,847 (~5–10 increments per frame) over ~30f while the bar-chart bars rise into place left→right (~1 bar/2f) with the last bars igniting lavender/coral; the "1,115+" pill pops in scale 0.95→1 over 5f after the count settles; stars twinkle (opacity flicker) continuously.*
- timing: counter count-up ~30f; bars 1/2f L→R; pill pop 5f; star twinkle ~10f loop.

### 3.8 — comment-CTA-outro (Comment "AI" / GitHub repo) · ~50–53.8s (● GET THE LINK)
- kicker pill `● GET THE LINK` mono, centered x≈50% y≈18% (CENTERED here, unlike earlier left pills).
- `Comment` near-black bold ~4.5% centered y≈37%; GIANT **"AI"** in blue-purple gradient `#8F89F6` extrabold grotesk ~12% (86px) centered y≈44% (with quote marks + blinking caret bar); sub `and I'll DM the GitHub repo.` near-black bold ~3.5% y≈52%.
- **handle pill** glass: `▣ @abhishek.devini` mono w/ Instagram glyph, centered y≈60%.
- transitionVerb: *"Comment" fades up (6f), then the giant gradient "AI" snaps in scale 1.06→1 + the gradient sweeps across the glyphs over ~8f with a caret blinking; the handle pill fades up from y +16px over 6f.*
- timing: AI snap 6f + gradient sweep 8f; caret blink ~15f loop; handle pill rise 6f.

---

# GLOBAL NOTES

### Font family best-guesses
- **Headlines / big numbers**: a tightly-set **extra-bold geometric/neo-grotesk** — reads as **Inter Display ExtraBold/Black, Aeonik Bold, or General Sans Bold**. Very tight tracking (~ -0.02em), large x-height, true-circle dots. Two-tone within one word/phrase (one word in accent). Period/full-stop is a deliberate styling element ("Heretic.", "Three.", "together.").
- **Kicker pills & micro-labels & mockup chrome**: a **monospaced** face — reads as **JetBrains Mono / IBM Plex Mono / Geist Mono**, ALL-CAPS, letter-spaced ~0.15–0.18em, ~13px.
- **Sub-headlines / card labels**: same grotesk at **Bold/SemiBold**, sentence case.
- **Brand serif (Reel 2 "Devini")**: a high-contrast **transitional/Didone serif** (reads as Playfair Display / Cormorant), gold.

### Full palette HEXES
| Token | Hex | Used in |
|---|---|---|
| near-black text | `#000000`–`#1A1A1A` | all headlines/numbers (light reels) |
| white text | `#FFFFFF`–`#F2F0F4` | dark reel 2 headlines |
| **R1 mesh** mint / lavender / pink / neutral | `#E0EEE7` / `#C5C5E5` / `#EACADD` / `#D2CAD5` | reel 1 bg |
| R1 Claude orange | `#E08A5A`–`#EF9D83` | reel 1 logo/send |
| **R2 dark base / glow** | `#060102` / `#130A03`→`#2A1A08` | reel 2 bg |
| R2 amber accent | `#F4A632` / `#F2B231` / `#F0AD38` | reel 2 headlines/icons |
| R2 Devini gold serif | `#EEAA28` | reel 2 lockup |
| **R3 mesh** peach / warm-field / coral / lavender-chip | `#F5E6DE` / `#EFE6DF` / `#D45A69` / `#F1E4DC` | reel 3 bg |
| R3 accent RED (refusal) | `#DC5867`–`#D7566B` | CENSORSHIP, Three., guardrails, 4% |
| R3 accent INDIGO (intelligence) | `#6B60F0`–`#6E5EEB` | brains, Remove, 99%, does-it |
| R3 AI-outro gradient | `#8F89F6` blue-purple | "AI" outro |
| R3 orange (momentum) | `#E98C70` | bar-chart tips, 1,115+ |
| glass card fill (light) | `#EDEAF2`/`#F2EEF4` @ ~85% | all light mockup cards |
| glass card fill (dark) | `#140E07`–`#15110A` | reel 2 tiles |
| green ✓ badge | `#27C26B`–`#34D3A0` | reel 1 recap / step dots |
| terminal navy | `#0E1117`–`#14161C` | dark code/terminal panels |
| link blue (README) | `#4C8DF5` | reel 3 README links |

### Timing conventions (cross-reel)
- **30fps.** Section length ≈ 3–6s each; 8–11 sections per reel.
- **Headline reveal**: scale 0.92–0.96 → 1.0 + translateY +20–40px → 0, over **6–8 frames**. Often "slam" variant scale 1.05–1.06 → 1.0 over **5f**.
- **Two-tone accent**: the accent word either appears pre-colored or **tint-sweeps white→accent L→R over ~8f**.
- **Kicker pill**: fades/drops from y −16px over **6f**, dot ignites **4f**.
- **Mockup cards**: slide from side (±50–60px) over **7f**, staggered **+4f**; pop variant scale 0.9→1 over **5–6f**.
- **Card/tile grids**: stagger-pop in reading order, **4–6f each, ~6–8f stagger**, icon/✓ lands **2–3f after** its tile.
- **Kinetic subtitle**: word-by-word, **~1 word / 6f** (≈5 words/sec), final word in accent color.
- **Stat counters**: rapid count-up/down over **~20–30f** (numbers tick every 1–2 frames); bar-charts fill **~1 bar/2f L→R**; node-graphs draw **~1 edge/3f**.
- **Letter-scramble decode** (reel 3 open): random-glyph cycling **~1 swap/1–2f**, resolving L→R over **~60f (2s)**.
- **Auto-scroll panels** (terminal/README): **~1 line / 8f**.
- **Persistent ambient motion**: mesh-gradient blobs drift slowly; margin glyph-chips bob; stars twinkle (opacity flicker, ~10f loop) — these run continuously under every section.
- **Layout rule**: numbered-section kickers + headlines are **LEFT-aligned** (x≈6–8%); intro/outro CTA kickers + giant single-word hero cards are **CENTERED**.
