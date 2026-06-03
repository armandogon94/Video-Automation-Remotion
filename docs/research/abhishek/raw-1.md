# abhishek.devini — Frame-by-Frame Raw Analysis (Batch 1)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels, 720×1280 @ 30fps.
Reels in this batch: **DXUhthziNCS** (56.07s / 1680f), **DXUzK1fCLhF** (74.09s / 2220f), **DXbs1fRiA7x** (35.08s / 1050f).

Method: ffmpeg frame extraction (evenly-spaced + 30fps transition bursts), PIL HEX sampling on real frames, cap-height pixel measurement ÷720 for fontSize%. All positions are % of the 720×1280 canvas (x = % of 720 width, y = % of 1280 height). All HEX values sampled from actual decoded frames.

---

## REEL DXUhthziNCS — "Infinite memory in NotebookLM" (56s, DARK throughout)

Brand accent = **Anthropic/Claude orange** (`#DE6D35`). Secondary accents: blue `#4C7DF0`, yellow `#E7B548`, green `#41B287`, red `#F5553A`. Background = near-black `#030003`→`#0B080D` with faint square grid + soft radial accent glow that recolors per scene.

### S1 — 0.0–4.4s · `big-stat-number`
- **bgMode:** DARK. bg `#050307`, faint grid, warm radial orange glow centered behind number.
- **kicker** (PILL/plain mono): "A SECRET MOST MISS" — letter-spaced uppercase mono, ~2.6% (19px), color `#8A8A8A` gray, x50% y17% centered.
- **stat number:** "98%" → counts to "99%" — extra-bold grotesk. "98/99" two-tone: digits ORANGE `#DE6D35`, "%" sign WHITE `#D3CECB`. capHeight ~205px = **28.5%**, x50% y42% centered. Soft orange glow halo bleeds ~30px around glyphs.
- **subtitle** (two-tone, centered): "of Claude users have / no idea this exists" — line1 white `#F5F0ED`, line2 orange `#DE6D35` (underlined). ~4.5% (32px), x50% y56%.
- **dot-grid viz:** small 2-row grid of dots/squares, mostly dim gray with a few orange-lit, x50% y63%.
- **transitionVerb:** Number rolls/counts up 0%→8→22→33→43→52→59→65→70→74→78→81→84→87→89→90→92→93→94→95→…→98% over ~24f with ease-OUT (fast→slow), scaling 0.85→1.0 while orange glow blooms in.
- **timing:** stat count-up 24f (0%→98%, ease-out); glyph scale 0.85→1 ~10f; glow bloom ~14f; kicker+subtitle fade-up ~8f staggered after number lands.

### S2 — 4.4–8.5s · `icon-pair-headline` (feature reveal)
- **bgMode:** DARK, neutral grid + faint center glow.
- **toptext:** "I gave Claude" — white `#F7F0ED` bold grotesk, ~5% (36px), x50% y34%.
- **icon A:** Claude app icon — orange `#DE7C53` rounded-square (~14% wide) with white radial burst, x37% y44%.
- **icon B:** infinity "∞" — orange→blue gradient (`#DF7C53`→`#5B7CE2`), x60% y44%.
- **headline:** "infinite memory" — white `#F7F0ED` extra-bold grotesk, ~7% (50px), x50% y51% centered.
- **pill (stat chip):** rounded pill, dark green-tinted fill + green glow, text "● COST · 1,370 tokens" — "COST" gray mono, "1,370" GREEN `#41B287` bold mono, "tokens" small gray, x50% y59%.
- **transitionVerb:** Icons pop in scale 0.6→1 (~7f, slight overshoot), headline fades+rises ~10px over 8f, then green cost-pill scales in 0.9→1 with green glow over 6f.
- **timing:** icon pop 7f overshoot; headline rise 8f; pill 6f; ~3f stagger between each.

### S3 — 8.5–16s · `terminal-list-negative` ("Every new chat starts from zero")
- **bgMode:** DARK with **red** radial tint behind cards (negative framing), grid visible.
- **headline (two-tone, LEFT-aligned):** "Every new chat" (white `#E8E4E2`) / "starts from zero." (red-orange `#C0492A`) — extra-bold grotesk, ~7% (50px), x8% (left) y20%, line2 below.
- **cards:** 3 stacked rounded rows, dark glassy fill with red right-edge glow. Each: gray circle avatar (left) + gray prompt line ("Hi Claude, remember our project…") + red mono response ("No prior context found.", "Starting fresh.", "Tell me again."). Card1 y32%, card2 y39%, card3 y46%. width ~84%, x50%.
- **footer bar:** "TOKENS BURNING" (gray mono, left) ··· "0" (red mono, right) in a thin rounded bar, y55%.
- **transitionVerb:** Headline two lines wipe-up in sequence (~6f each), then the 3 cards slide-up + fade one-by-one bottom-edge, ~5f each with ~4f stagger; red glow on the footer bar pulses as "0" appears.
- **timing:** headline lines 6f each; card stagger 5f + 4f gap (×3); footer bar 6f.

### S4 — 16–24s · `icon-pair-compare` ("A second brain that never forgets")
- **bgMode:** DARK with cool blue radial glow lower-center, grid.
- **headline (two-tone, centered):** "A second brain" (white `#F5F0EF`) / "that never forgets." (blue `#4C7DF0`) — extra-bold grotesk ~7% (50px), x50% y21%.
- **icon L:** brain outline, ORANGE `#C5673C` stroke inside soft orange circular glow, x24% y52%; label "REASONING" mono letter-spaced gray, y61%.
- **icon R:** network/constellation, BLUE `#4C7DF0` stroke inside blue glow, x76% y52%; label "MEMORY" mono, y61%.
- **transitionVerb:** Headline fades in centered (~10f), then the two glowing icon discs scale 0.7→1 with blooming glow simultaneously (~8f), faint connecting lines draw between nodes; labels fade up 6f after.
- **timing:** headline 10f; icon disc scale+glow 8f; labels 6f delayed.

### S5 — 24–27s · `headline-only-intro` ("Plus — all free, in NotebookLM")
- **bgMode:** DARK neutral.
- **headline (two-tone, LEFT):** "Plus — all free," (white `#EDE9E6`) / "in NotebookLM." (blue `#4C7DF0`) — extra-bold grotesk ~6.5% (47px), x8% y20%. Holds alone ~2s before cards.
- **transitionVerb:** Two lines slide-up + fade from +12px over 7f each, 4f apart.

### S6 — 27–36s · `feature-list-cards` (continues S5 headline)
- **bgMode:** DARK, warm low glow.
- Headline from S5 shrinks/stays top. **3 cards** animate in below:
  - Card1: yellow icon (bar-chart) + "Infographics" (white bold) / "AUTO-DESIGNED" (gray mono) + "FREE" tag YELLOW `#E7B548`, right. y34%.
  - Card2: orange icon (play) + "Cinematic video" / "STORYBOARD → CLIP" + "FREE" tag ORANGE `#DE6D35`. y42%.
  - Card3: blue icon (search+) + "Deep research" / "SOURCED & CITED" + "FREE" tag BLUE `#4C7DF0`. y49%.
  - Cards: rounded `#15141A` glassy fill, width ~88%, x50%.
- **transitionVerb:** Cards stagger-rise from +20px with fade, ~6f each, ~5f apart, slight ease-out settle; FREE tags pop 0.8→1 one beat after their card lands.
- **timing:** card rise 6f; stagger 5f gap (×3); tag pop 4f.

### S7 — 36–44s · `flow-diagram` ("The secret wrap-up skill")
- **bgMode:** DARK, blue radial glow lower-right.
- **kicker:** "THE SECRET" gray mono letter-spaced ~2.6% x50% y19%.
- **headline:** "\"wrap-up\" skill." white `#F2EEEB` extra-bold ~7.5% (54px) x50% y23%.
- **pill:** "runs after every session" mono, dark fill w/ faint orange glow, x50% y27%.
- **flow row (lower):** "SESSION" gray mono label (left, x10% y43%) → animated arrow ">" blue (x54% y54%) → NotebookLM logo (blue gradient arc, x76% y50%) + "NotebookLM" white label + green "+ SAVED" pill (green `#41B287` text, y61%).
- **transitionVerb:** Kicker→headline→pill cascade-fade top-down (6f each); then ">" arrow draws/blinks and the NotebookLM logo scales in 0.8→1 (7f); green "+ SAVED" pill pops 0.85→1 with glow 5f.
- **timing:** title stack 6f×3; arrow blink 4f; logo scale 7f; saved pill 5f.

### S8 — 44–48s · `search-grid-viz` ("Claude pulls only what it needs")
- **bgMode:** DARK.
- **headline (two-tone, LEFT):** "Claude pulls only" (white `#F0ECE9`) / "what it needs." (yellow `#E7B548`) — extra-bold ~7% (50px) x8% y14%.
- **search bar:** rounded input "🔍 how did we structure that auth flow?|" mono gray, blinking cursor, x50% y22%.
- **memory grid:** square cell grid (matrix), ~6×4 cells dim `#1A1A1F`; 4 cells highlighted with blue/yellow gradient glow. Labels "MEMORY VECTORS · 12,847" (left mono) + "MATCHES · 4" (right green mono), y28%; grid y30–48%.
- **transitionVerb:** Headline two-tone fades up (7f); search text types in char-by-char (~1 char/2f); then 4 grid cells light up one-by-one with gradient bloom (~5f each, 3f apart) as "MATCHES" counter ticks 1→4.
- **timing:** headline 7f; type-on ~2f/char; cell light 5f + 3f stagger ×4.

### S9 — 48–52s · `title-card-two-tone-gradient` ("Changes everything")
- **bgMode:** DARK, faint grid, subtle center glow.
- **toptext:** "One setup." white `#F5F0ED` bold ~5% (36px) x50% y40%.
- **headline L1:** "Changes" white `#F5F0ED` extra-bold grotesk ~10% (72px) x50% y47%.
- **headline L2:** "everything." GRADIENT orange→yellow→gray→blue (`#E48737`→`#E7B548`→#9AA→`#6487D7`) ~10% (72px) x50% y54%, with an animated gradient underline beneath.
- **transitionVerb:** "One setup." fades in (~6f), then "Changes" scales 0.94→1 + fades (8f), then "everything." reveals L→R with the gradient + underline wiping in (~10f); gradient continuously sweeps after settle.
- **timing:** toptext 6f; "Changes" scale 8f; gradient word wipe 10f; underline draw 8f; gradient loop ongoing.

### S10 — 52–56s · `cta-engagement-cards` ("Want the exact steps?")
- **bgMode:** DARK.
- **headline:** "Want the exact steps?" white `#F1EFF1` extra-bold ~7.5% (54px) x50% y19%.
- **subtitle:** "I'LL SEND THEM OVER." gray mono letter-spaced ~3% x50% y23%.
- **3 cards** (rounded, width ~84%, x50%):
  - "Like this / so more people see it" — RED heart `#F5553A`, y41%.
  - "Follow / more AI shortcuts weekly" — BLUE person+ `#517DEC`, blue border, y48%.
  - "COMMENT / 〝〞" — YELLOW chat icon `#EFBD3D`, yellow glow border (highlighted), y57%.
- **footer:** "I'LL DM THE FULL SETUP →" gray mono centered y75%.
- **transitionVerb:** Headline+subtitle fade-up (7f); 3 cards stagger-rise from +18px (6f each, 5f apart); the COMMENT card's yellow border glows/pulses on as the focus card; footer fades in last.
- **timing:** title 7f; card stagger 6f+5f gap ×3; comment glow pulse loop; footer 6f.

---

## REEL DXUzK1fCLhF — "Claude Dispatch" (74s, DARK + 1 cream-card section)

Brand accent = orange `#DE6D37`. Green `#47B16A` for positive/solution. Cream card `#E1D7C8` for quote/chat mockups. Same dark grid + dual radial glows (orange top-left, green bottom-right recurring).

### S1 — 0.0–3.5s · `brand-lockup` (Anthropic intro)
- **bgMode:** DARK, big warm orange radial glow center, grid.
- **kicker (PILL):** "● QUIETLY LAUNCHED" — orange dot + gray mono letter-spaced text, rounded dark pill, x50% y17%.
- **lockup:** Anthropic logo — orange "A\" mark `#DE6D37` + white "Anthropic" wordmark `#F6F3F8`, ~5% (36px), x50% y21% centered.
- **transitionVerb:** Pill fades+scales 0.9→1 (6f); logo mark draws/fades then wordmark slides in from left ~8px (8f); orange radial glow blooms behind over 14f.

### S2 — 3.5–9s · `title-card-two-tone` ("Claude Dispatch")
- **bgMode:** DARK, orange glow shifts to mid-right.
- Lockup + pill stay pinned top.
- **eyebrow:** "just dropped a feature that" gray `#9A9A9A` regular ~4% x50% y27%.
- **headline (two-tone, centered):** "Claude" (white `#F6F3F8`) / "Dispatch" (orange `#DE6D37`, glowing) — extra-bold grotesk, capHeight **73px = 10.1%** ("Claude"), "Dispatch" ~85px incl. descender; x50%, "Claude" y37%, "Dispatch" y45%. Orange word has soft glow halo.
- **kinetic subtitle:** "Might end" (word-by-word) white, bottom y75%.
- **transitionVerb:** Eyebrow fades in (6f); "Claude" rises+fades from +14px (8f); "Dispatch" scales 0.92→1 with orange glow bloom (9f, slight overshoot); kinetic subtitle words pop in 1 word per ~6f at bottom.
- **timing:** "Claude" 8f; "Dispatch" scale 9f + glow 12f; subtitle 1 word/6f.

### S3 — 9–18s · `phone-terminal-mockup` ("Text it. Walk away.")
- **bgMode:** DARK, grid, dual glow (orange right, green bottom).
- **kicker:** "HERE'S THE IDEA" gray mono letter-spaced x50% y16%.
- **headline:** "Text it. Walk away." white `#F3EFEC` extra-bold ~7.5% (54px) x50% y20%.
- **phone mockup (LEFT):** iPhone frame x15% y43%, screen shows "Claude Dispatch · ACTIVE" header (orange C avatar), orange user bubble "fix the bugs in my code", gray reply "On it. Running now."
- **terminal card (RIGHT):** green-tinted rounded card x70% y40%, "● ● ● dispatch —run" titlebar, mono log lines: "○ Parsing codebase…" (gray), "○ Locating bug in auth.ts" (white), "● Writing fix + tests" (orange), green inset "> auth.ts — bug patched. 3 tests passing."
- **connector:** dashed orange→green curve from phone to terminal with a GREEN dot traveling along it.
- **transitionVerb:** Headline fades up (7f); phone slides in from left (10f), terminal from right (10f) simultaneously; then dashed curve draws L→R (~14f) while the green dot travels its length; terminal log lines type/check-on one per ~8f; orange chat bubble pops 0.85→1.
- **timing:** mockups slide 10f; dashed curve+dot 14f; log lines 8f each; bubble 6f.

### S4 — 18–27s · `cream-quote-card + list` ("Like when the deck is on your laptop")
- **bgMode:** DARK base; large **cream card** `#E1D7C8` dominates upper area.
- **kicker:** "WHILE YOU'RE AWAY" gray mono x50% y16%.
- **cream card:** rounded `#E1D7C8`, x50% y31%, width ~83%. Pill top-left "● LIVE · DISPATCH" (orange dot + dark mono). **SERIF** quote (distinct from grotesk): "Like when the deck is on your laptop, but you aren't" near-black `#1A1612` serif ~5% (36px) centered in card.
- **list rows (below card):** "☕ Grabbing coffee" (gray) y49%; "> Fix bugs in my code" (orange ">" badge, white text) y54%. Dark rounded rows width ~88%.
- **transitionVerb:** Cream card scales 0.9→1 + fades (10f); LIVE pill pops; serif quote fades in (8f); then 2 list rows slide-up stagger (6f, 5f apart), the orange ">" row highlighting last.
- **timing:** card 10f; quote 8f; rows 6f + 5f gap.

### S5 — 33–43s · `single-icon-spotlight` ("People tried this before — OpenClaw")
- **bgMode:** DARK, dual glow (orange top-left, green bottom-right), grid. Kicker-only at ~33s (headline not yet in).
- **kicker:** "WHY THIS MATTERS" gray mono x50% y17%.
- **headline:** "People tried this before." white `#EDE9E6` bold grotesk ~6% (43px) x50% y21%.
- **icon spotlight:** glowing orange ring circle (~46% wide) center x50% y37%, containing red mascot ("OpenClaw" bug/robot) `#E0533A` with cyan eyes. Label "OPENCLAW" orange `#DE6D37` mono letter-spaced y52%.
- **kinetic subtitle:** "It had serious issues." — "It had" white + "serious issues." orange `#DE6D37`, ~4% x50% y75%.
- **transitionVerb:** Kicker fades (5f); headline rises (7f); orange ring scales 0.8→1 with glow pulse (8f) and mascot pops inside 0.7→1 (6f); subtitle two-tone fades word-group by word-group at bottom.
- **timing:** ring scale 8f; mascot pop 6f; subtitle ~1 phrase/8f.

### S6 — 43–52s · `problem-list-cards` ("Three deal-breakers")
- **bgMode:** DARK, red/orange tint, grid.
- **kicker (PILL):** "OPENCLAW · WHAT WENT WRONG" orange mono in dark pill, orange border, x50% y14%.
- **headline:** "Three deal-breakers." white `#F0ECE9` extra-bold ~6.5% (47px) x50% y19%.
- **3 cards** (orange-bordered, dark fill, width ~90%, x50%):
  - "API keys leaking / Tokens exposed in every request trace." + orange "ISSUE" tag. y30%.
  - "Security? Shaky. / No sandbox. Any prompt was a live wire." + "ISSUE". y38%.
  - "Wallet on fire / Every single request billed. It stacked up fast." + "ISSUE". y46%.
  - Each: orange rounded icon (left), white bold title, gray subtitle.
- **kinetic subtitle:** "Not great." italic white, y75% (appears ~50s).
- **transitionVerb:** Pill+headline fade-up (6f each); 3 orange cards stagger-slide from +18px (6f, 5f apart) with orange border glow on entry; ISSUE tags pop after; "Not great." fades in last.
- **timing:** cards 6f + 5f gap ×3; ISSUE tag 4f; subtitle 6f.

### S7 — 52–63s · `solution-list-cards + cream-chat` ("Dispatch fixes all of it")
- **bgMode:** DARK, **green** positive glow.
- **kicker (PILL):** "DISPATCH · HOW IT'S DIFFERENT" orange mono, x50% y13%.
- **headline (two-tone):** "Dispatch fixes" (white `#F3EFF0`) "all of it." (orange `#DE6D37`) extra-bold ~7% (50px) x50% y16%.
- **cream chat card:** `#E1D7C8`, x50% y25%, "CLAUDE · DISPATCH" pill top-left; shows an orange chat bubble msg ("Start the dev server, screenshot the library page… 3PM. Please!" / "I'm running late… export my pitch deck…") — zooms/pans on the card.
- **2 solution cards** (GREEN-bordered, width ~90%):
  - "Runs on your machine / No API keys. No cloud. Just local." + GREEN check-circle `#47B16A` badge (right). y43%.
  - "Asks before it acts / Sensitive action? Prompts you first." + green check. y50%.
- **transitionVerb:** Headline two-tone fades up (7f); cream chat card scales in (10f) and slowly zooms on its bubble; then 2 green cards slide-up stagger (6f, 5f apart); green check badges pop 0.8→1 with glow as each card lands.
- **timing:** chat card 10f + slow zoom; green cards 6f + 5f gap; check pop 5f.

### S8 — 63–67s · `kinetic-stacked-headline` ("SAFER. CHEAPER. SMOOTHER.")
- **bgMode:** DARK, grid, dual glow.
- **3 stacked words** (centered, extra-bold grotesk ~9% / 65px):
  - "SAFER." GREEN `#47B16A`, x50% y20%.
  - "CHEAPER." ORANGE `#DE6D37`, x50% y28%.
  - "SMOOTHER." WHITE `#F6F3F9`, x50% y36%.
- **transitionVerb (measured from 30fps burst):** "SAFER." holds alone ~17f; "CHEAPER." drops in around f18 and settles by ~f22–24 (scale 0.9→1 + fade ~5f); "SMOOTHER." follows the same ~6f beat after. Each word punches in with a slight scale-overshoot + glow.
- **timing:** word interval ~17–18f (≈0.6s) between SAFER→CHEAPER; per-word punch 5–6f.

### S9 — 67–74s · `cta-comment` ("Drop Claude in comments")
- **bgMode:** DARK, orange glow right.
- **headline:** "Drop [Claude] in comments" — "Drop" + "in comments" white `#F0ECE9`; "Claude" orange `#DE6D37` inside an orange-OUTLINED rounded chip/box. Extra-bold ~7.5% (54px) x50% y17%.
- **subtitle:** "+ like for the full setup guide." gray `#9A9A9A` ~4% x50% y21%.
- **phone mockup:** iPhone center x50% y43%, shows IG comment UI — "devini.io · Claude Dispatch · 2m" (orange D avatar), comment field typing "Cla|" + "Post", row of like/comment/share/save outline icons.
- **transitionVerb:** Headline fades up, the "Claude" chip box draws its orange outline (~8f); phone slides up from +20px (10f); comment text types char-by-char (~1/3f); icons fade in row.
- **timing:** chip outline 8f; phone slide 10f; type-on 3f/char.

---

## REEL DXbs1fRiA7x — "Build with Devini / Build Within An Hour" (35s, DARK + photo-hero browser mockup)

Two accent systems: **gold/amber `#D6A130`** for the Stark-Industries browser-mockup hero, and **Claude orange `#DE6D35`** for the Claude-Code title + CTA. Photographic Iron Man hero imagery inside the mockup (warm red/gold). Same near-black bg `#070408` + grid + radial glow.

### S1 — 0.0–3.5s · `browser-mockup-card` reveal (Stark Industries)
- **bgMode:** DARK; a browser card animates in mid-frame, letterboxed → grows.
- **browser card:** dark site mockup, nav bar "● STARK / INDUSTRIES" (left, gold dot) · "SYSTEMS  ARCHIVE" (center mono) · "ENGAGE ↗" (pill, right). HUD chrome: "TELEMETRY LINK · LIVE" (top-left), "ARC REACTOR 88.7%" (top-right), Iron Man photo (right half), pull-quote "Sometimes you gotta run before you can walk." (right), footer "SEQ 001 / 199 · J.A.R.V.I.S. // DIAGNOSTIC · SCROLL ↓". Faint "Build with…" headline visible behind/under (z-stacked teaser).
- **transitionVerb:** Browser card scales up from ~70%→100% width (letterbox→full) over ~24f with ease-out while Iron Man hero slides/reveals from right; nav + HUD labels fade in staggered after the frame lands.
- **timing:** card zoom 24f ease-out; HUD labels fade 6f staggered.

### S2 — 3.5–13s · `browser-mockup-hero` ("Build with Devini")
- **bgMode:** browser card now FULL-WIDTH (x50% y middle), bg dark behind.
- **kicker (in-mockup):** "● PROTOCOL — MK LXXXV" gold mono, x6% y48%.
- **headline (two-tone, LEFT, inside mockup):** "Build / with **Devini**" — "Build with" white `#E5E2E6`, "Devini" GOLD `#D6A130`. Extra-bold grotesk, capHeight **48px = 6.7%** (smaller — framed inside the mockup), x6% y52%.
- **subtitle:** "INTERFACES & PRODUCTS, / ENGINEERED LIKE THE MARK LXXXV." gray mono ~2.4% x6% y60%.
- **hero image:** Iron Man (Mark suit) right side x78% y55%, with cyan arc-reactor glints.
- **chrome footer:** "SEQ 001 / 199" · "J.A.R.V.I.S. // DIAGNOSTIC" · "SCROLL ↓".
- **transitionVerb:** Inside the now-full mockup, "Build with" wipes up (7f), then "Devini" reveals in gold L→R (8f); subtitle types/fades under; the page subtly parallax-scrolls (HUD seq counter ticks). Acts like a live website scroll.
- **timing:** headline lines 7f; gold word 8f; subtle parallax scroll ongoing.

### S3 — 13–20s · `browser-mockup-hero` variant ("I am Iron Man")
- **bgMode:** same Stark browser mockup, scrolled to a new hero state.
- **headline (two-tone, LEFT):** "I am / Iron Man." — "I am" white `#E5E2E6`, "Iron Man." gold `#D6A130`, extra-bold ~6.5%, x6% y55%.
- **subtitle:** "Mark LXXXV nanotech suit. Arc reactor calibrated. Scott runs a full system diagnostic — J.A.R.V.I.S. is locking on this one." gray mono, x6% y62%.
- Iron Man image fills right, smoke/atmosphere.
- **transitionVerb:** Mockup scroll-transitions from S2 (page slides up ~one viewport over ~12f), new hero headline two-tone wipes in (7f) as the Iron Man image cross-settles.
- **timing:** scroll 12f; headline 7f.

### S4 — 20–26s · `title-card-icon-two-tone` ("Build Within An Hour")
- **bgMode:** DARK, faint grid, orange center glow (switches from gold to Claude orange here).
- **icon:** Claude Code app icon — orange `#DE6D35` rounded-square + white burst, x50% y20%.
- **pill:** "CLAUDE CODE" orange mono, orange-outlined rounded pill, x50% y26%.
- **headline (two-tone, centered):** "Build Within An **Hour**" — "Build Within An" white `#F2EEEB`, "Hour" orange `#DE6D35`. Extra-bold grotesk ~8.5% (61px), x50% y40%.
- **subtitle (two-tone):** "using a custom-created **Claude Skill**" — white + "Claude Skill" orange, ~4.2% x50% y47%.
- **transitionVerb:** Icon scales in 0.7→1 with overshoot (7f); CLAUDE CODE pill pops under (5f); headline fades up from +12px (8f) with "Hour" glowing orange; subtitle fades in (6f).
- **timing:** icon 7f; pill 5f; headline 8f; subtitle 6f.

### S5 — 26–31s · `cta-engagement-cards` ("Want this website's full code?")
- **bgMode:** DARK, orange top glow + green bottom glow.
- **headline (two-tone):** "Want this website's full" (white `#F1EDEA`) / "code?" (orange `#DE6D35`) extra-bold ~7.5% (54px) x50% y15%.
- **kicker:** "+ THE ENTIRE SKILL PACK" gray mono letter-spaced x50% y19%.
- **3 cards** (rounded, width ~84%, x50%):
  - "Like" — white heart icon. y26%.
  - "Follow" — white person+ icon. y32%.
  - "Comment" — GREEN-bordered, green chat icon `#47B16A`, green "AI" tag (right). y38%.
- **transitionVerb:** Headline two-tone fades up (7f); 3 cards stagger-rise from +18px (6f, 5f apart); the Comment card's green border glows on as focus.
- **timing:** title 7f; cards 6f + 5f gap ×3.

### S6 — 31–35s · `cta-engaged-state` (cards animate to "active")
- Same layout as S5 but cards flip to ACTIVE state:
  - "Liked" — RED filled heart `#F5553A`, orange border. 
  - "Following" — orange border/icon.
  - "Comment" — green, green "AI" tag.
- **extra:** "▶ Check Bio, Full tutorial @DeviniLabs" pill (YouTube red icon) y68%; ORANGE "Like, Follow & Comment AI" filled button `#DE6D35` y76%.
- **transitionVerb:** Each card cross-fades label (Like→Liked, Follow→Following) with icon fill animating (~5f each, stagger); the bio pill slides up (8f); orange CTA button pops 0.85→1 with glow (6f) and gently pulses.
- **timing:** card state flip 5f stagger; bio pill 8f; CTA button pop 6f + pulse loop.

---

## GLOBAL NOTES

### Font family best-guesses
- **Headlines / stat numbers:** an extra-bold/black **geometric-humanist grotesk** — strong candidates: **Inter (Black/ExtraBold)**, **SF Pro Display Black**, or **Söhne/General Sans ExtraBold**. Tight tracking, large x-height, two-story 'a', rounded-but-firm terminals. Weight ~800–900. This is the dominant typeface across all giant headlines and the "98%/99%" digits.
- **Kickers / labels / HUD / terminal text:** a **monospace** with wide letter-spacing for uppercase labels — candidates **JetBrains Mono**, **IBM Plex Mono**, **Geist Mono**, or **SF Mono**. Always uppercase, letter-spaced ~0.15–0.25em, gray/accent.
- **Eyebrow / subtitle body (non-mono):** same grotesk at regular/medium weight, gray.
- **Cream-card quote (Reel B S4 only):** a **high-contrast serif** (transitional/Didone-ish) — candidate **Times-like / PT Serif / Source Serif** — used deliberately to feel "editorial/quote".

### Full palette (sampled HEX)
| Role | HEX | Notes |
|------|-----|-------|
| BG near-black (corner) | `#030003` – `#070408` | true black w/ faint warm tint |
| BG mid / cards | `#0B080D` – `#15141A` | glassy card fill |
| Brand orange (Claude/Anthropic) | `#DE6D35` / `#DE6D37` | primary accent, consistent across A & B |
| Orange (chat bubble / icon) | `#E07C53` | lighter orange |
| Gold/amber (Stark mockup) | `#D6A130` | Reel C hero accent only |
| Accent blue | `#4C7DF0` / `#517DEC` | "memory", NotebookLM, Follow |
| Accent yellow | `#E7B548` / `#EFBD3D` | Infographics, "what it needs", Comment |
| Accent green (positive) | `#41B287` / `#47B16A` | cost/saved/solution/SAFER |
| Accent red (negative/heart) | `#F5553A` / `#C0492A` | "starts from zero", Like heart, OpenClaw |
| Text white | `#F5F0ED` – `#F6F3F9` | warm off-white, never pure #FFF |
| Text gray (labels) | `#8A8A8A` – `#9A9A9A` | kickers, subtitles |
| Cream card | `#E1D7C8` | quote/chat mockup cards (Reel B) |

### Background system (every dark scene)
- Layer 1: near-black `#030003`.
- Layer 2: **faint square grid** — thin lines ~`#15151A`, cell ~70–90px, low opacity (~6–10%).
- Layer 3: **soft radial accent GLOW** behind hero text — large blurred blob whose HUE tracks the scene's accent (orange default; red for negative scenes; blue for "memory"; green for positive; dual orange+green glows common). Subtle vignette darkening at frame edges.

### Timing conventions (measured from 30fps bursts)
- **Frame rate:** 30fps. Standard.
- **Element entrance:** fade + slide-up from +12–20px, **6–8 frames** (~0.2–0.27s), ease-out. Icons/badges use **scale 0.7–0.92 → 1.0 with slight overshoot** over 5–8f.
- **Stagger between list cards:** ~5 frames (≈0.17s) gap; each card ~6f to settle. 3-card lists fully land in ~33f (~1.1s).
- **Kinetic stacked words** (SAFER/CHEAPER/SMOOTHER): ~17–18 frames (~0.6s) between words; each word punches in 5–6f.
- **Stat counter:** ~24f count-up with ease-out (fast→slow approach to target).
- **Kinetic subtitle (bottom karaoke):** ~1 word per 6 frames (~0.2s/word).
- **Type-on (search/comment):** ~1 char per 2–3 frames.
- **Glow bloom:** 12–14f, slower than the element it accompanies.
- **Browser-mockup zoom-in:** ~24f scale-up ease-out; page scroll-transitions between hero states ~12f.
- **Scene cadence:** scenes run ~3–9s each; ~10 scenes in 56s (A), ~9 in 74s (B), ~6 in 35s (C). Headline-first, then supporting cards/mockups animate in beneath.

### Recurring layout grammar
1. **PILL/mono KICKER** at top (y13–17%), letter-spaced uppercase.
2. **GIANT two-tone grotesk HEADLINE** — one word/line in accent color (orange/blue/yellow/green/gold). Centered for title cards, **LEFT-aligned (x6–8%)** for list/explainer scenes.
3. **Supporting block:** rounded cards (feature/problem/solution lists), browser/phone/terminal MOCKUPS, icon pairs, grid/flow viz, or big stat number.
4. **Kinetic SUBTITLE** at bottom (y75%) — word-by-word, often two-tone.
5. **CTA close** — Like/Follow/Comment cards (Comment always the highlighted/green focus card) + "DM / bio / comment" footer.
