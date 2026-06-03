# abhishek.devini — RAW frame-by-frame analysis (batch 2)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels, **720×1280 @ 30 fps**.
Method: ffmpeg frame extraction (2 fps overview grids + 30 fps transition bursts) read directly; HEX sampled with Python/PIL on real frames; cap-heights measured in px ÷ 720 → fontSize%.

Reels in this batch (durations from ffprobe):
- **DXeQSrWiGiW** — 76.65 s — DARK mode, **pink + orange** accents. "Plug Stitch into Claude Code / Gemini 3.1" pure-typography reel.
- **DXhkSFiD8dL** — 91.35 s — DARK mode, **teal/green + gold** accents. "GPT 5.5 just dropped" pure-typography reel.
- **DXot4OjD3CS** — 56.21 s — DARK mode, **clay-orange** accent. **Screen-recording demo reel** (3D scroll-animation website) with webcam PiP + typography CTA overlays.

> Convention note: all three are DARK mode. No LIGHT-mesh sections appear in this batch. Backgrounds are near-black with a faint square GRID and a soft RADIAL accent GLOW that tints the corners with the topic brand color. Reel 3 differs structurally: it is mostly a full-bleed 16:9 browser screen-capture with a rounded webcam PiP, interrupted by full-screen typography CTA cards.

---

## REEL 1 — DXeQSrWiGiW (0–76.6 s) — "Plug Stitch into Claude Code"

bgMode: **dark**. Base bg **#060307 → #0A0508** (near-black, warm). Center radial glow warms to **#170E0C**. Faint square grid (~64 px cells, grid line ≈ #1A1216, ~4% opacity). Radial accent glow is **orange-amber top, pink-magenta bottom**, drifting.
Palette: white/grey headline ink **#ADA6A8** (warm off-white, NOT pure white), accent **orange #C0653A / #D06030**, accent **pink/magenta #FF6DB3 / #FF7CA7 / #F06090**, stat gold **#FBD189**, stat green **#8CB597**, terminal-prompt pink **#ED7A9B**. Gemini gradient: blue **#5D88FF** → purple **#9070D0** → pink/orange **#D87D97**.

### S1 · 0.0–10.3 s · `title-card-two-tone` (brand-lockup intro)
bgMode dark; bg #060307; accent orange #C0653A + pink #FF6DB3.
Elements:
- **pill kicker** — text "GOOGLE STITCH + CLAUDE CODE" — mono/letter-spaced uppercase, ~2.0% cap-height, color grey **#949195**, inside a thin rounded pill outline; x 50% / y 17% (centered).
- **brand lockup** — Stitch icon (pink dashed rounded-square w/ centered dot, **#AA3E67**) **+** glyph **+** Claude "AI" wordmark (orange **#C0653A**); icons ~7% tall; x 50% / y 26%.
- **headline (two-tone, two lines)** — line1 "plug Stitch" / line2 "into Claude Code". Extra-bold grotesk. "plug" + "into" warm-white **#ADA6A8**; "Stitch" white; "Claude Code" orange **#C0653A**. Cap-height ≈ 58 px → **~8.0%**; left-aligned block, x 8–95% / y 36–52%.
- **sub-kicker** — "— SAVES A LOT OF CLAUDE TOKENS —" — mono uppercase, ~1.8%, grey; x 50% / y 55%.
- **kinetic subtitle** — "this changes everything." — bold, pink **#FF6DB3**, ~3.4% cap-height; x 50% / y 79%; subtle pink glow halo.
transitionVerb: From black+grid, the pill kicker fades up over ~6f (~0.4 s, frames ~11–13 of intro burst), then the brand lockup scales 0.9→1 + fades over ~10f (~0.7–1.0 s), then the two-tone headline rises ~24 px and fades in line-by-line after ~2.0 s, finally the pink subtitle fades up ~6f; whole card then holds with a slow ±4% glow pulse on the radial accent.
measured timing: pill 6f fade; lockup 10f scale-fade; headline lines ~8f each staggered; subtitle 6f fade-up; glow pulse ~30f cycle.

### S2 · 10.3–14.5 s · `brand-lockup` + `dual-card` + `terminal-card`
bgMode dark; accent Gemini gradient blue→pink→orange.
Elements:
- **kicker** "POWERED BY" — mono uppercase, ~1.6%, grey; x 50% / y 16%.
- **gradient headline** "Gemini 3.1" w/ 4-point sparkle glyph at left — extra-bold, **diagonal gradient #5D88FF (blue) → #9070D0 (purple) → #D87D97 (pink-orange)**; cap-height ≈ 60 px → **~8.3%**; x 22–78% / y 22%.
- **sub-headline** "one-click install into" — bold warm-white, ~3.6%; x 50% / y 30%.
- **two dark cards** (rounded ~20 px, fill #14141A): LEFT "Claude Code" w/ **orange top border #C0653A** + orange "AI" icon + green "● READY" pill (#7FBE8E); RIGHT "Antigravity" w/ **purple top border** + purple ⊕ icon + green "● READY" pill. Card titles bold white ~2.6%; x 6–48% & 52–94% / y 32–43%.
- **terminal card** (full-width rounded, fill #0E0E12, 1px border): line1 `$ claude plugin install stitch` (`$` pink **#ED7A9B**, command grey mono); line2 `✓ installed — ready to design` (✓ green, text white mono); ~2.0% mono; x 6–94% / y 49–55%.
- **kinetic subtitle** "your coding agent can **design**." — bold, "design." italic pink **#FF6DB3**, rest warm-grey; ~3.2%; x 50% / y 76%.
transitionVerb: Hard cut from S1 to black-grid (~2f), then "Gemini 3.1" wipes its gradient + sparkle in over ~10f while sub-headline fades, the two cards pop up (scale 0.94→1) staggered left-then-right ~6f apart, the terminal block slides up ~20 px + fades ~10f and the second line `✓ installed` types/fades a few frames later, subtitle fades last.
measured timing: gradient headline reveal ~10f; cards scale-pop 8f each, 6f stagger; terminal slide-up 10f; line2 +8f delay; subtitle 6f.

### S3 · 14.5–18.5 s · `chat-mockup-card` (Feature 01/03)
bgMode dark; accent blue glow border.
Elements:
- **pill kicker** "● STITCH · LIVE DEMO" — mono, grey, pill outline; x 50% / y 17%.
- **chat/terminal mockup card** — rounded card w/ **blue glowing border (#3A6BD0-ish)**, header dots + chat icon; body text (light-blue **#9FC0E8**) "I've generated three visual directions for you." + numbered list "1. Organic handcrafted / 2. Noir editorial / 3. Neo-chroma"; ~2.4% body; x 18–82% / y 22–52%.
- **lower-third feature label** "— FEATURE · 01 / 03" — mono, pink/grey; x 8% / y 67%.
- **headline** "prompt a full website" — extra-bold warm-white, ~5.4%; left-aligned x 8% / y 70%.
- **sub** "→ generate.stitch" — mono grey; x 8% / y 74%.
- faint pink underline-dash marker near y 78%.
transitionVerb: Cut to black-grid, mockup card scales 0.96→1 + fades over ~8f with its blue border-glow ramping up; the lower-third feature label + headline slide in from left (~24 px) over ~8f; sub fades 6f after.
measured timing: card 8f scale-fade; headline slide-in 8f; sub +6f.

### S4 · 18.5–23 s · `browser-mockup-card` (Feature 03/03, 3 design mockups)
bgMode dark; accent pink.
Elements:
- **pill kicker** "● STITCH · LIVE DEMO".
- **three website mockup thumbnails** in a row (rounded cards): "Crafting Atmospheres for the Modern Brand" (editorial, green/cream); "The Cinema of Brand Identity" (dark); "Designing the Future of Identity" (purple-gradient hero). ~each 28% wide; y 18–52%.
- **lower-third** "— FEATURE · 03 / 03" mono; "drop a URL → redesign" extra-bold warm-white ~5.4%, x 8% / y 70%; sub "→ Nano Banana 2" mono grey.
transitionVerb: Cut-in; the three mockup thumbnails fan/scale up staggered ~5f apart, headline "drop a URL → redesign" slides left-in ~8f; the "→" arrow draws in.
measured timing: thumbnails 8f scale, 5f stagger; headline 8f.

### S5 · 23–37 s · `browser-mockup-card` (GitHub repo) + `big-stat-number` row
bgMode dark; accent **pink #FF6DB3**.
Elements:
- **kicker** "— THE REAL UNLOCK —" — mono, pink; x 50% / y 14%.
- **two-tone headline** "a GitHub repo **packed with skills**" — extra-bold; "a GitHub repo" white, "packed with skills" pink **#FF6DB3**; ~4.8%; x 4–96% / y 17%.
- **browser mockup card** (GitHub repo `Leoneino/stitch-skills`) — realistic GitHub UI screenshot, dark; "SKILLS FOLDER" pink callout label + pink arrow pointing at the `skills` row; "Stitch Agent Skills" title bottom-left; green "Code" button; x 4–96% / y 24–52%.
- **big-stat-number row** — three pill chips: "**4.7K** STARS" (orange **#FBD189**), "**43** WATCHING" (pink **#FF7BAB**), "**560** FORKS" (green **#8CB597**); numbers bold ~2.8%, labels mono ~1.4%; x 22–78% / y 71%.
- **kinetic subtitle** "this is where the **magic** happens." — bold, "magic" pink, rest warm-grey; x 50% / y 80%.
transitionVerb: Cut-in; two-tone headline fades down from top ~8f; the GitHub card slides up ~30 px + fades ~10f; the pink "SKILLS FOLDER" callout + arrow draw in ~6f after card settles; the three stat chips pop up (scale 0.9→1) staggered ~5f apart with numbers counting up over ~12f; subtitle fades last.
measured timing: headline 8f; card slide-up 10f; callout 6f; stat chips 8f scale + 12f count-up, 5f stagger; subtitle 6f.

### S6 · 37–47 s · `dashboard-mockup-grid` (2×2, "one palette. every surface.")
bgMode dark; accent **pink #FF6DB3** + rainbow palette dots.
Elements:
- **kicker** "—— CLONES ACROSS EVERY PAGE ——" — mono, pink; x 50% / y 15%.
- **two-tone headline** "one palette. **every surface.**" — extra-bold; "one palette." white, "every surface." pink; ~4.6%; x 16–84% / y 18%.
- **"SHARED PALETTE" pill** w/ row of color dots (pink/orange/green/blue/purple); x 38–62% / y 25%.
- **2×2 UI mockup cards** (rounded, fill #121218), each with a **rainbow gradient top border**: Pricing ($0/$19 highlighted pink/$49 — PRICING.TSX), FAQ (FAQ.TSX), Dashboard (47.2% + 2.8K + pink line chart "LIVE" — DASHBOARD.TSX), Onboarding (stepper + pink "Continue →" button — ONBOARDING.TSX). Card labels mono ~1.4% pink filename bottom-left; x 4–49% & 51–96% / y 28–55%.
transitionVerb: Cut-in; headline fades down ~8f; SHARED PALETTE pill fades + its dots pop in sequentially ~3f apart; the four cards scale-pop 0.94→1 staggered diagonally (TL→TR→BL→BR) ~6f apart; the rainbow top-borders wipe left→right ~10f as each card lands.
measured timing: headline 8f; palette dots 3f each; cards 8f scale, 6f stagger; top-border wipe 10f.

### S7 · 47–66 s · `concept-swatch-grid` ("3 concepts → pick 1 → 8 pages")
bgMode dark; accent **pink #FF6DB3**.
Elements:
- **kicker** "I TESTED THE FULL LOOP" — mono, pink; x 50% / y 16%.
- **headline** "3 concepts → **pick 1** → **8 pages**" — extra-bold; "8 pages" pink; ~4.6%; x 10–90% / y 18%.
- **three concept swatch cards** — "Aurora" (purple/red swatches), "Monograph" (grey/orange/black — SELECTED: pink dashed highlight border + pink check badge top-right), "Forest" (green/brown). Each shows "Aa" + small color chips. x spread y 24–38%.
- **8-page card grid** (2 rows × 4) — small dark page cards each w/ rainbow top-border + pink/grey skeleton bars + filename labels (Landing, Pricing, FAQ, Blog, Dashboard, Settings, Auth, Generic). x 4–96% / y 44–58%.
transitionVerb: Cut-in; headline fades down ~8f; the 3 swatch cards slide up staggered; the **pink dashed highlight + check badge** animates onto "Monograph" (border draws ~8f, badge pops ~5f); the 8 page-cards then cascade in row-by-row, ~4f stagger, each scaling 0.92→1.
measured timing: swatches 8f; highlight draw 8f + check pop 5f; page grid cascade 4f/card.

### S8 · 66–76.6 s · `title-card-two-tone` outro CTA ("just got a design team.")
bgMode dark; accent **pink #FF7CA7** glow + **orange** CTA glow.
Elements:
- **kicker** "SOLO FOUNDERS" — mono letter-spaced, pink **#DF7F97**; x 50% / y 16%.
- **two-tone headline** "just got a" (warm-white) / "**design team.**" (glowing pink **#FF7CA7**, heavy pink halo); extra-bold; cap-height ≈ 64 px → **~8.9%**; x 22–78% / y 19–29%.
- **outlined pill CTA** "📄 want the full setup guide?" — rounded pill, orange/peach outline + soft orange glow, white text ~2.6%; x 28–72% / y 42%.
- strong pink-bottom + orange-mid radial glow; grid clearly visible.
transitionVerb: Cut-in; kicker fades ~5f; "just got a" rises + fades ~8f, then "design team." pops with a pink glow-bloom (scale 0.95→1 + glow 0→full over ~10f); the CTA pill fades up ~8f with its orange border-glow ramping; card holds with slow glow breathing to end.
measured timing: kicker 5f; headline line1 8f, line2 10f glow-pop; CTA 8f; end glow pulse ~30f.

---

## REEL 2 — DXhkSFiD8dL (0–91.3 s) — "GPT 5.5 just dropped"

bgMode: **dark**. Base bg **#070408** near-black; grid area tints faint teal **#0C1518**. Soft **teal radial glow** (#0A2A28) drifting right/center. Square grid ~64 px, line ≈ #10201E.
Palette: white headline **#FFFFFF**, teal accent **#009080 / #00A080** (bright highlight **#00C0A0**), gold/amber **#F2CA88 / #EACE8E**, red delta **#ED6267**, grey body **#9AA0A2**. OpenAI icon teal gradient **#008070 → #0A5A50**.

### S1 · 0–7.5 s · `title-card-two-tone` (app-icon intro)
bgMode dark; accent teal.
Elements:
- **app icon** — OpenAI logomark (white knot) in **teal gradient rounded-square** (#008070→darker), ~13% tall, soft teal under-glow; x 50% / y 22%.
- **giant headline** "GPT 5.5" — extra-bold grotesk, white **#FFFFFF**; cap-height ≈ 66 px → **~9.2%**; x 24–76% / y 34%.
- **accent sub-headline** "JUST DROPPED" — bold uppercase, teal **#00A080**, ~4.6%; x 50% / y 41%.
- **subtitle** "smartest, most intuitive / model yet." — bold, "smartest, most intuitive" white + "model yet." grey; ~2.8%; x 50% / y 46–49%.
- **date pill** "● APR 23 · 2026" — mono, teal text, teal-outline rounded pill; x 42–58% / y 51%.
transitionVerb: From black-grid the app-icon scales 0.85→1 + fades with teal glow-bloom over ~10f, "GPT 5.5" rises 24 px + fades ~8f, "JUST DROPPED" wipes/fades ~6f, subtitle fades ~6f at ~2.8 s, date pill fades up last ~5f at ~3.2 s.
measured timing: icon 10f scale-glow; headline 8f; JUST DROPPED 6f; subtitle 6f (~+0.8s); date pill 5f (~+1.2s).

### S2 · 7.5–14 s · `line-chart-mockup-card` ("GPT-5.5 leads. Across the board.")
bgMode dark; accent teal.
Elements:
- **kicker** "ARTIFICIAL ANALYSIS · INTELLIGENCE INDEX" — mono, teal; x 6% / y 16%.
- **two-tone headline** "GPT-5.5 leads." (white) / "Across the board." (teal **#00A080**); extra-bold ~5.0%; left x 6% / y 19–23%.
- **rotated badge** "STATE OF THE ART" — teal filled rounded rect, slightly rotated ~ -12°, white text; x 72–96% / y 28–34%.
- **browser/line-chart card** — dark rounded card titled "Artificial Analysis Intelligence Index", multi-series line chart (GPT-5.5 white, GPT-5.4 blue, Claude Opus 4.7/4.6 orange, Gemini 3.1 grey), axis labels; x 6–94% / y 36–62%.
transitionVerb: Cut to black-grid, kicker+headline slide in from left ~8f, the teal "STATE OF THE ART" badge pops + slightly over-rotates (scale 0.9→1.05→1, ~8f), the chart card fades+slides up ~10f and the line series **draw on left→right** over ~20f.
measured timing: headline 8f; badge pop 8f; card 10f; line-draw 20f.

### S3 · 14–16 s · `transition-breather`
Empty dark bg + grid + teal radial glow only (no text). ~1–2 s gap between scenes — a recurring device in this reel.

### S4 · 16–22 s · `model-list-checklist` ("Five jobs. One model." precursor / model list)
bgMode dark; accent teal.
Elements: a list of model rows w/ teal check icons (e.g. "Five jobs. One model.") — rows fade in one-by-one.
transitionVerb: rows cascade in top→bottom, ~6–8f apart, each fading + sliding up ~12 px.
measured timing: ~6–8f per row stagger.

### S5 · 22–30 s · `feature-rows-list` ("Five jobs. One model.")
bgMode dark; accent teal.
Elements:
- **kicker** "WHAT IT'S BUILT TO DO" — mono, teal; x 6% / y 16%.
- **two-tone headline** "Five jobs. **One model.**" — "One model." teal; extra-bold ~5.0%; x 6% / y 19%.
- **5 stacked rounded rows** (fill #121418), each: teal monoline icon (in a small square) + bold white title + teal mono sub-caption:
  - `<>` **Write & debug code** — "pulls PRs, fixes tests"
  - 🌐 **Research online** — "reads, cites, decides"
  - 📊 **Analyze data** — "pivots, charts, infers"
  - 📄 **Docs & sheets** — "drafts, edits, formats"
  - ⚡ **Operate software** — "clicks, types, navigates"
  - titles ~2.8%, captions mono ~1.4%; x 6–94% / y 28–73%.
transitionVerb: Cut-in; headline slides left-in ~8f; the 5 rows cascade up one-by-one ~6f apart, each scaling 0.96→1 + fade, the teal icon inside popping ~3f after its row lands.
measured timing: headline 8f; rows 6f stagger; icon pop +3f.

### S6 · 30–37 s · `quote-card` (Greg Brockman)
bgMode dark; accent teal.
Elements:
- **opening quote glyph** "❝" — large teal **#009080**, ~10% tall; x 50% / y 36%.
- **centered quote** "A **faster, sharper** thinker for fewer tokens." — "faster, sharper" bold white, rest light-grey; ~5.0%; two lines centered; x 10–90% / y 46–53%.
- **attribution** "Greg Brockman" (bold white) / "PRESIDENT · OPENAI" (mono grey) w/ **teal left-border accent line**; x 42–58% / y 58–61%.
transitionVerb: Cut-in; the teal quote-mark scales 0.8→1 + fades ~8f, the quote lines fade up ~10f (line2 +6f), the attribution + its teal bar slide in ~6f.
measured timing: quotemark 8f; quote 10f (line2 +6f); attribution 6f.

### S7 · 37–48 s · `numbered-vertical-stepper` ("Trust the loop.")
bgMode dark; accent teal.
Elements:
- **kicker** "HAND IT A MESSY, MULTI-PART TASK" — mono, teal; x 6% / y 18%.
- **headline** "Trust the loop." — extra-bold white ~5.0%; x 6% / y 19%.
- **4-step vertical list** w/ numbered circle nodes connected by a vertical line:
  - **01 Plan** — active (teal-glowing ring, white text)
  - **02 Use tools** — active (teal-glowing ring, white text)
  - **03 Check its work** — inactive (grey ring, grey text)
  - **04 Keep going** — inactive (grey ring, grey text)
  - node circles ~10% wide; titles bold ~4.0%; x 6–60% / y 32–58%.
transitionVerb: Cut-in; headline fades ~8f; the 4 nodes drop in top→bottom ~6f apart; the connecting line draws downward ~16f; nodes 01 then 02 "activate" — grey ring → teal glow ramp ~8f each in sequence (progressive highlight), 03/04 stay dim.
measured timing: nodes 6f stagger; line draw 16f; activation glow 8f each, sequential.

### S8 · 48–58 s · `comparison-bar-chart` ("Same speed. Better everything.")
bgMode dark; accent teal + delta pills.
Elements:
- **kicker** "GENUINELY IMPRESSIVE" — mono, **gold #F2CA88**; x 6% / y 16%.
- **two-tone headline** "Same speed." (white) / "Better everything." (teal); extra-bold ~5.0%; x 6% / y 18–22%.
- **4 metric cards** (fill #161618), each: bold white title + two horizontal bars (GPT-5.4 grey, GPT-5.5 teal **#00A080**) + a delta pill top-right:
  - **Per-token latency** — pill "IDENTICAL" (amber outline #EACE8E)
  - **Output quality** — pill "+42%" (teal)
  - **Tokens used** — pill "-38%" (red #ED6267)
  - **Retries** — pill "-65%" (red)
  - titles ~2.6%, bar-labels mono ~1.2%; x 6–94% / y 28–62%.
transitionVerb: Cut-in; headline slides left-in ~8f; the 4 cards cascade up ~6f apart; inside each, the **teal bar grows left→right** over ~14f and the delta pill pops 0.8→1 ~5f as the bar finishes.
measured timing: cards 6f stagger; bar grow 14f; pill pop 5f.

### S9 · 58–68 s · `three-card-icon-row` ("Capability up. Cost down.")
bgMode dark; accent teal + gold.
Elements:
- **kicker** "EFFICIENCY WIN" — mono, gold **#F2CA88**; x 6% / y 16%.
- **headline** "Capability up. / Cost down." — extra-bold white ~5.0%; x 6% / y 18–22%.
- **3 small cards** (fill #161618): **CAPABILITY** ↑ teal up-arrow; **SPEED** = gold equals; **COST** ↓ teal down-arrow; labels mono ~1.4%, icons ~5% tall; x 6–94% / y 30–37%.
transitionVerb: Cut-in; headline ~8f; the 3 cards pop up left→right ~6f apart, each arrow/glyph drawing or sliding (up-arrow rises, down-arrow drops, equals fades) ~6f after card lands.
measured timing: cards 6f stagger; glyph anim 6f.

### S10 · 68–80 s · `data-table-card` ("That's rare." benchmark table)
bgMode dark; accent teal. (Continues S9 — the 3 cards stay top; table slides up beneath.)
Elements:
- **benchmark data table** (dark card) — columns: GPT-5.5 / GPT-5.4 / GPT-5.5 Pro / GPT-5.4 Pro / Claude Opus 4.7 / Gemini 3.1 Pro; rows: Terminal-Bench 2.0, Expert-SWE, GPQA, OSWorld-Verified, Toolathon, BrowseComp, FrontierMath Tier 1-3, FrontierMath Tier 4, CyberGym; **GPT-5.5 column bolded** (e.g. 82.7%, 73.1%, 84.9%…); mono ~1.4%; x 6–94% / y 43–63%.
- **kinetic subtitle** "That's rare." — bold teal **#00C0A0** w/ teal glow; ~4.6%; x 50% / y 73%.
transitionVerb: Table card slides up from y~75% to y~53% + fades over ~12f, rows reveal top→bottom ~3f apart, the GPT-5.5 numbers highlight-bold ~6f; then "That's rare." pops with teal glow-bloom ~8f.
measured timing: table slide 12f; rows 3f stagger; subtitle 8f.

### S11 · 80–91.3 s · `split-comparison` + `kinetic-subtitle` + `title-card-two-tone` outro
bgMode dark; LEFT panel warm-orange tint, RIGHT panel teal tint.
Elements:
- **split band** (upper third): LEFT "ANTHROPIC / DEALING WITH MYTHOS" (warm-orange #5A3A2A tint, mono labels) | RIGHT OpenAI logo + "SHIPPING GPT-5.5" (teal tint, mono).
- **kinetic caption** "Given everything Anthropic's been dealing with around **Mythos** lately…" — white sans ~3.2%, **"Mythos" bold + red underline #ED6267**; x 10–90% / y 38%.
- **outro title** (lower): kicker "OPENAI PICKED A" (teal mono small-caps) + giant two-tone headline "SHARPER MOMENT." — teal gradient **#00A080→#43B4A3** w/ teal glow; cap-height ≈ 60 px → **~8.3%**; x 8–92% / y 67–76%.
transitionVerb: The split band slides in (left from left, right from right) ~10f meeting center; the caption types/word-reveals (~1 word per 4–6f) with the red underline wiping under "Mythos" ~6f; then the outro "SHARPER MOMENT." rises + teal-glow blooms ~10f to end.
measured timing: split slide 10f; caption ~5f/word; underline 6f; outro 10f glow-pop.

---

## REEL 3 — DXot4OjD3CS (0–56.2 s) — "Build Within An Hour" (screen-recording demo)

bgMode: **dark**. Base bg **#070306** near-black; soft **orange radial glow** top-center (#1A0E08) + faint green-teal glow lower; faint square grid. STRUCTURE differs: most of the reel is a **full-bleed 16:9 browser screen-capture** (a 3D scroll-animation "cosmic/eye/black-hole" website) letterboxed top/bottom, with a **rounded-rect webcam PiP** of the creator (bottom-right, ~26% wide, repositions). Typography CTA cards interrupt full-screen.
Palette: clay-orange accent **#E06030 / #E07040 / #D06030** (Anthropic coral), white text #FFFFFF, like-red **#DE5A3A**, comment-green **#5A9A6A**. Screen-rec hero glows are warm orange/gold **#E8A050 / #F0B060**.

### S1 · 0–24 s · `browser-screen-capture` + `webcam-pip` (hero scroll demo)
bgMode dark; accent orange.
Elements:
- **browser screen-capture** — full-width 16:9 card (rounded corners, thin top chrome bar w/ tiny mono nav labels "WITNESS / 002 …"), letterboxed centered ~y 28–52%. Content is a dark 3D-scroll website: glowing **black-hole / accretion-disk** ("Singularity", "First Light", "Cosmic Inflation"), **glowing eye/iris** ("A singularity in the iris"), **embers along eyelash** ("Embers along the lash"), **nebula card grid** (Sombrero, Whirlpool, Cat's Eye, Carina, Cassiopeia A, Omega — colorful radial-glow cards). Big serif hero headlines on the site itself e.g. "Everything began / with nothing." (white serif).
- **webcam PiP** — rounded-rect, creator talking, bottom-right ~x 80% / y 62%, ~26% wide; repositions slightly between sections.
transitionVerb: The screen-capture scrolls continuously (parallax 3D sections animate as the page scrolls), cursor visible; webcam PiP holds bottom-right; transitions between website sections are the site's own scroll-driven reveals (no editor cut), ~every 3–5 s a new hero section enters from below with its glow blooming.
measured timing: site scroll continuous; section reveals ~90–150f apart; PiP static per section.

### S2 · ~24–27 s · `brand-lockup` overlay (Claude Code)
bgMode dark; accent orange. (Typography overlay; screen-rec shrinks to a card below.)
Elements:
- **app icon** — Anthropic/Claude **burst-star glyph** (white) in **clay-orange gradient rounded-square #E06030**, soft orange glow, ~13% tall; x 50% / y 16%.
- **outlined pill** "CLAUDE CODE" — mono letter-spaced, orange-outline rounded pill, ~2.0%; x 42–58% / y 23%.
- screen-capture card demoted to lower ~y 32–52% behind/below.
transitionVerb: Screen-rec scales down + slides to lower third ~10f while the orange icon scales 0.85→1 + glow-blooms ~10f and the "CLAUDE CODE" pill fades up ~6f beneath it.
measured timing: rec demote 10f; icon scale-glow 10f; pill 6f.

### S3 · ~27–36 s · `cta-engagement-rows` ("Want this website's full code?")
bgMode dark; accent orange; like-red/follow-orange/comment-green states.
Elements:
- **two-tone headline** "Want this website's full" (white) / "**code?**" (orange **#E06030**); extra-bold ~5.4%; x 8–92% / y 18–22%.
- **sub-kicker** "+ THE ENTIRE SKILL PACK" — mono, grey/orange; x 50% / y 26%.
- **3 stacked rounded rows** (fill #15110E), white monoline icons:
  - ♥ **Like** → animates to **Liked** (heart fills red **#DE5A3A**, red row-glow)
  - 👤+ **Follow** → **Following** (orange row-glow)
  - 💬 **Comment** (blinking cursor `_|`) → green row-glow + "AI" typed (green)
  - titles bold ~3.2%; x 6–94% / y 35–55%.
- (resolve state adds) **YouTube pill** "▶ Check Bio, Full tutorial @DeviniLabs" (dark pill, red play glyph) x 24–76% / y 70%; **orange filled CTA pill** "💬 Like, Follow & Comment AI" (#E07040 fill) x 30–70% / y 76%.
transitionVerb: Cut to typography; headline fades down ~8f; sub-kicker fades ~5f; the 3 rows cascade up ~6f apart with cursor blinking in the Comment row; then sequentially each row "completes" — heart fills + red glow (~6f), Follow→Following + orange glow (~6f), Comment types "AI" + green glow (~6f); finally the YouTube pill + orange CTA pill pop up ~8f.
measured timing: rows 6f stagger; each completion 6f, sequential; pills 8f scale-pop.

### S4 · ~36–56 s · `browser-screen-capture` (return to hero demo, full-screen finale)
bgMode dark; accent orange.
Elements: returns to full-bleed screen-capture scrolling the cosmic website (black-hole "First Light / Cosmic Inflation" accretion disk centered, nebula grids, eye sections); webcam PiP may drop for the clean finale; the final shot is the glowing orange black-hole hero centered + letterboxed.
transitionVerb: Cut back to the screen-capture; site continues scroll-driven 3D section reveals through to end; final hold on the accretion-disk hero with its orange glow slowly rotating.
measured timing: continuous scroll; final hold ~60f.

---

## GLOBAL NOTES

### Font family best-guesses
- **Headlines / display**: a heavy/extra-bold **grotesk** — strong candidates **Inter / Inter Display (Black/ExtraBold)**, **Geist (Bold/Black)**, or **General Sans / Switzer ExtraBold**. Tight letter-spacing, large counters, slightly condensed feel on the giant words. Two-tone treatment = same weight, one clause recolored to the accent.
- **Sub-headlines / row titles**: same family, **Bold ~600–700**, sentence case.
- **Kickers / pills / captions / filenames**: **monospace** — likely **Geist Mono / JetBrains Mono / Roboto Mono**, UPPERCASE, heavy letter-spacing (tracking ~0.15–0.25em), small (1.4–2.0% of 720w).
- **Quote card body** (reel 2): lighter weight grotesk (Regular/Medium) with the keyword clause in Bold.
- Reel-3 on-site hero headlines are a **serif** (Editorial/Playfair-style) — but that is the demoed website, not Abhishek's overlay system.

### Full palette (sampled HEX)
| Role | Reel 1 (Stitch/pink) | Reel 2 (GPT/teal) | Reel 3 (Claude/orange) |
|---|---|---|---|
| bg base | #060307 / #0A0508 | #070408 | #070306 |
| bg grid tint | #1A1216 | #0C1518 | #100A08 |
| headline ink | #ADA6A8 (warm-white) | #FFFFFF | #FFFFFF |
| primary accent | pink #FF6DB3 / #FF7CA7 / #F06090 | teal #009080 / #00A080 / #00C0A0 | clay-orange #E06030 / #E07040 / #D06030 |
| secondary accent | orange #C0653A / #D06030 | gold #F2CA88 / #EACE8E | red #DE5A3A, green #5A9A6A |
| stat/positive | gold #FBD189, green #8CB597 | teal bars #00A080 | green #5A9A6A |
| delta-negative | — | red #ED6267 | red #DE5A3A |
| special | Gemini gradient #5D88FF→#9070D0→#D87D97 | OpenAI icon #008070 | Claude icon #E06030 |

### Timing conventions (30 fps)
- **Element build = staggered fade-up + slight scale**: each element fades in over **~5–8 frames** while rising ~16–24 px (or scaling 0.9→1). Elements within a scene stagger **~5–8 f** apart (kicker → headline → mockup/cards → subtitle).
- **Scene changes = hard cut to black-grid breather (~1–2 f, sometimes a 1–2 s empty grid breather in reel 2), then rebuild** — NOT cross-dissolves. Title/headline blocks are fully formed within the first ~2 s of each scene.
- **Cards/mockups**: scale **0.94→1** over ~8 f + fade; **rainbow/colored top-borders wipe left→right** over ~10 f.
- **Charts**: line series **draw left→right ~20 f**; horizontal bars **grow left→right ~14 f**; data-table rows reveal **~3 f/row**.
- **Stat numbers**: **count up over ~12 f**; chips pop 0.9→1 over ~8 f, ~5 f stagger.
- **Kinetic subtitles**: pop with an **accent glow-bloom** (scale 0.95→1 + glow 0→full) over **~8–10 f**; the closing-word/keyword recolored to accent. Reel-2 burned caption reveals **~1 word per 4–6 f** with a colored underline wipe (~6 f) under the bold keyword.
- **Steppers/lists**: nodes/rows cascade top→bottom **~6 f apart**; progressive **highlight/activation** (grey→accent-glow ring) **~8 f** each, sequential.
- **Glyph/icon pops**: ~3–6 f after their container lands; brand-lockup icons scale **0.85→1 + glow-bloom ~10 f**.
- **Ambient**: persistent slow **radial-glow breathing** (~30 f cycle, ±4%) and very subtle drift of the background grid/glow throughout every scene.
