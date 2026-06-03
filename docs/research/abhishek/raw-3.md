# abhishek.devini — Raw Frame-by-Frame Analysis (3 reels)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels, 720×1280 @ 30fps.
Reels analyzed: **DXpZf2ziBYP** (99.5s, DARK mode), **DXtNSIhj_dp** (55.0s, LIGHT mode), **DXwq6HYoogv** (71.4s, LIGHT mode).

Method: 1 fps full-pass frames + 30fps transition bursts via ffmpeg; colors sampled with PIL on real frames (darkest/bluest/orange-channel extraction for anti-aliased glyphs); cap-heights measured by pixel bounding-box ÷ 720. All x/y are % of the 720×1280 frame. Timings in frames @30fps unless noted.

> NOTE: in these reels the giant headline word that is "two-tone" is colored by a **per-topic brand accent**. DXpZf2ziBYP tracks **Anthropic/Claude orange** (#FD9B00). The two LIGHT reels track a **blue→purple→pink gradient** (#8789ED → #9A8AF9 → #D99BCC) on the accent word, near-black for the rest.

---

## REEL 1 — DXpZf2ziBYP (DARK mode, accent = orange) — 99.5s

bgMode: **DARK**. Near-black base `#07040A`–`#140A0D`, faint square GRID overlay (~70px cells, stroke ~#1c1410 at very low opacity), soft RADIAL accent GLOW behind hero/center bleeding warm `#210E10`→`#2a1409` toward center-bottom. Accent ORANGE `#FD9B00`/`#F99707`. Pill fills are dark translucent `#2D1413`/`#331C06` with orange hairline border + orange dot. White text `#FAF7FC`. All cards are dark slate `#13141B`–`#1a1b22` rounded-20px with 1px lighter top edge.

### 1A · 0–2.2s — `browser-mockup-card` (HOOK: rate-limit notification)
- bgMode DARK; bg `#07040A` top / `#210E10` center-glow; accent `#FD9B00`.
- **pill kicker**: "● RATE LIMITED · QUOTA HIT", mono/letter-spaced ~2.3% caps, color salmon-red `#E8746A` on dark-red pill fill `#2D1413`, centered x50% y16%.
- **browser mockup card**: rounded card x6–94% / y23–38%, dark `#15161d`; top chrome bar with 3 traffic-light dots (red/amber/green) + url "claude.ai/design" mono grey x16%.
- **card body**: red-dot label "● WEEKLY LIMIT REACHED" (mono caps, salmon), bold headline "You've hit your Claude Design quota." (~3.6% cap-height, white, Inter-bold) at y31%, sub "Resets in 6 days · 14 hrs · 22 min" grey mono y34%.
- transitionVerb: "Pill fades+drops in from y13%→16% over frames 1–6; browser card wipes up from y+24px with opacity 0→1 over frames 7–14; at ~frame 30 a bright red STRIKETHROUGH laser line sweeps left→right across the headline over ~8f, leaving the quota text crossed out."
- timing: pill in 6f; card slide-up 8f; strikethrough sweep 8f; hold ~40f.

### 1B · 2.2–5.5s — `title-card-two-tone` ("THE FIX")
- Same DARK bg + card from 1A persists top; new block lower.
- **kicker**: "THE FIX ↓" orange `#FD9B00` mono caps ~1.9%, x6% y55%.
- **GIANT headline** (2 lines, left-aligned x6%): "One " white `#F5F2F7` + "open-source" orange `#F99707` / "repo." white. Extra-bold grotesk (Inter/Geist-black). Cap-height ~**12.1%** (87px). y57–69%.
- transitionVerb: "Kicker fades in first (frames 1–5); headline rises word-group by word-group from y+18px, white words then the orange word, each ~6f apart, settling by frame ~20."
- timing: headline line scale 0.96→1 + rise over 8f; word stagger 6f.

### 1C · 5.5–9.5s — `brand-lockup` (HUASHU/DESIGN title)
- bgMode DARK, warm glow stronger center; bg `#160D09`.
- **pill kicker**: "★ NEW · OPEN SOURCE" orange-on-dark `#331C06` fill, x6% y17%.
- **GIANT lockup** left x6%: "HUASHU" white `#FDFAFE` / "DESIGN." orange `#FD9B00` — extra-bold grotesk, cap-height ~**22.4%** (161px), the period is orange. y25–45%.
- **subtitle**: "画术设计 · 「打字、回车。一份能交付的设计。」" grey mono row y48%.
- **github lockup card**: dark card x6–94% y63–72%, GitHub mark + "alchaincyf/huashu-design" mono white, plus tag chips "● JUST DROPPED" / "Personal use license".
- transitionVerb: "HUASHU scales 0.92→1 and fades as one block over frames 1–8; DESIGN. drops in 4f later; the repo card slides up from below the fold (y+40px) over 10f; a faint orange glow pulse blooms behind the lockup ~14f."
- timing: lockup scale 8f; DESIGN offset +4f; card slide 10f; glow bloom 14f.

### 1D · 9.5–13.5s — `grid-of-logo-cards` (Drop it into any coding agent)
- **pill**: "AGENT-AGNOSTIC" neutral dark pill x6% y16%.
- **two-tone headline** x6% y19–28%: "Drop it into " white + "any" orange / "coding agent." white. ~6.5% cap-height bold grotesk.
- **center chip**: pill "● huashu-design  SKILL" — orange dot + white mono + small orange "SKILL" tag, glowing orange halo, x50% y38%.
- **2×2 logo card grid** (rows stagger in): Claude Code (orange-tint card), Cursor (neutral), Codex (teal-tint), OpenClaw (orange-tint) — each card x6–49% / 51–94%, rounded, brand icon + label white-bold, ~y45–56%.
- **footnote caption**: "— + OPENCLAW · HERMES · ANY SKILLS-COMPATIBLE AGENT —" centered grey mono y68% (appears last).
- transitionVerb: "Headline+chip settle first; then card grid builds row-by-row — top row (Claude Code, Cursor) pops in with scale 0.9→1 over 6f, bottom row (Codex, OpenClaw) follows 6f later; the chip's orange glow pulses once; footnote fades in at frame ~24."
- timing: per-card pop 6f; row stagger 6f; chip glow pulse 12f.

### 1E · 13.5–17s — `terminal-mockup-card` (one-line install)
- **pill**: "ONE-LINE INSTALL" orange-on-dark `#331C06` x6% y16%.
- **terminal card** x6–94% y26–48%, dark `#181a21`, top chrome "● ● ●  ~/projects · zsh".
- body mono: comment "# one line. all 20 skills." grey, then "$ npx skills add alchaincyf/huashu-design" ($ orange, cmd white), a "resolving…" line, an **orange progress bar** that fills L→R, then success "✓ installed · 20 skills · 0 errors" (green check).
- **kinetic subtitle** bottom x6% y68–74%: "Then talk to your agent. " white + "No buttons. No panels." orange. ~4% bold.
- transitionVerb: "Terminal card fades up over 8f; the typed command appears char-run (cursor block blinks every ~15f); the orange progress bar fills 0→100% width over ~18f, then the green success line pops in; bottom subtitle swaps its second clause to orange on a 1-word-per-6f cadence."
- timing: progress bar fill 18f; cursor blink 15f cycle; subtitle 6f/word.

### 1F · 17–21s — `four-feature-card-grid` (Type once. Ship anything.)
- **pill**: "ONE SKILL · FOUR DELIVERABLES" x6% y16%.
- **two-tone headline** x6% y20–28%: "Type once. Ship " white + "anything." orange.
- **2×2 feature cards** x6–49%/51–94%, y32–53%: each has a small orange/teal icon top-left, numbered kicker ("01 · INTERACTIVE", "02 · HTML→PPTX", "03 · TIMELINE", "04 · PRINT-GRADE"), bold title (Prototypes / Slide Decks / Motion / Infographics ~2.8%), and a grey one-line desc.
- transitionVerb: "Headline settles; four cards fade+rise in a Z-order stagger (TL→TR→BL→BR), each scale 0.94→1 over 6f, ~5f apart."
- timing: card stagger 5f; per-card rise 6f.

### 1G · 21–34s — `big-stat-number` + scrolling browser preview ("20 design philosophies")
- **pill**: "UNDER THE HOOD" orange-on-dark x6% y16%.
- **BIG STAT**: orange "20" giant cap-height ~**15.3%** (110px) x6% y18–28%, with 2-line label to its right "design philosophies," (white) / "baked in." (grey) ~3%.
- **large browser preview card** x6–94% y37–82%: chrome "● huashu-design · live preview" + red "● REC"; body is a long auto-scrolling document (Chinese body text, "时间轴 = 代码", showcase lists, tag chips "● HTML→MP4", "● PLAYWRIGHT"); content scrolls upward continuously through the scene.
- transitionVerb: "Orange '20' counts up 0→20 over ~14f with a slight scale-overshoot (1.06→1); label fades in beside it; the preview card scrolls its body up at a steady ~constant rate for the whole 10+s hold."
- timing: number count-up 14f; overshoot settle 4f; continuous scroll.

### 1H · 34–48s — `grid-vs-terminal` / comparison-cards (variants & tweaks)
- **pill**: "THREE VARIANTS · TWEAKS PANEL" x6% y16%.
- **two-tone headline**: "Three options." white / "Pick one. Or tweak." orange, x6% y19–28%.
- **3 variant cards** y34–58%: "Editorial" (cream `#f4efe2` card, serif title, orange underline, tag "● Serif"), "Brutalist" (dark card, mono title, teal underline, "● Mono"), "Soft" (light `#ece7e2` card, "Geist", orange underline). Cards are tilted/offset slightly.
- **./TWEAKS panel card** x6–94% y60–70%: "LIVE" label + 3 labeled slider rows — Hue (orange fill, 129), Density (teal fill, 30), Type Scale (blue fill, 75).
- transitionVerb: "Headline settles; three variant cards fan in left→right (each rotates from ±3° to 0° + fades over 7f, 5f apart); the tweaks panel slides up last; slider fills animate L→R to their values over ~12f."
- timing: card fan-in 7f; stagger 5f; slider fill 12f.

### 1I · 48–72s — `grid-vs-terminal` (honest take: GUI vs terminal) + more scroll cards
- Multiple browser/preview cards continue (long mid-section showcasing the repo). Same DARK chassis, scrolling mockup cards, orange tag chips.

### 1J · 72–86s — `grid-vs-terminal` ("Replace it fully? Probably not.")
- **pill**: "THE HONEST TAKE" x6% y14%.
- **two-tone headline**: "Replace it fully? " white + "Probably not." grey (de-emphasized), x6% y17–26%.
- **VS layout**: left LIGHT card "CLAUDE DESIGN · GUI" (cream, with tabs click/draw/comment, sketch graphic, caption "wins for click · draw · comment"); right DARK card "HUASHU · TERMINAL" (terminal output: "$ design a landing page", "[planning] picking variant", "✓ delivered in 4m 18s", caption "closes the gap fast."). A circular orange "VS" badge sits centered between them y50%.
- **kinetic subtitle** bottom: "But if you live in your terminal — " white / "this thing closes the gap fast." orange, x6% y72–78%.
- transitionVerb: "Two cards slide in from opposite sides (left card from x−40px, right card from x+40px) over 9f; the orange circular VS badge pops with scale 0→1 + slight rotate at frame ~10; bottom subtitle reveals clause-by-clause 1-per-6f."
- timing: card slide 9f; VS badge pop 6f; subtitle 6f/clause.

### 1K · 86–99.5s — `cta-outro` (Comment "AI")
- **pill**: "● DROP A COMMENT" orange dot, dark-orange fill, x6% y16%.
- **small label**: "Comment" grey letter-spaced caps x6% y23%.
- **GIANT "AI"** orange `#FD9B00`, cap-height ~20% (bbox-clipped measure 11–15%, visually ≈140px), x6% y29–43%.
- **white subtitle**: "→ I'll send the repo + a starter prompt." ~3% bold x6% y45%.
- **github lockup card** bottom x6–94% y79–84%: "⌥ github.com/alchaincyf/huashu-design" mono white on dark card.
- transitionVerb: "'AI' scales 0.9→1 + fades over 8f with an orange glow bloom behind it (14f); subtitle slides up under it 4f later; the github bar slides up from the very bottom edge over 10f and holds to the end."
- timing: AI scale 8f; glow 14f; bar slide 10f.

---

## REEL 2 — DXtNSIhj_dp (LIGHT mode, accent = blue) — 55.0s

bgMode: **LIGHT**. Pastel MESH gradient — base lavender `#E8E0EB`, blue-grey `#D9E1ED`, peach `#EBDAE2`, soft cyan + warm pink blooms drifting slowly. Faint square GRID (~50px, very low-opacity grey lines). Near-black text `#19151F`→`#000`. Accent BLUE/periwinkle `#8E83FE`. Cards are frosted white `#FFFFFF`@~85% with soft drop-shadow, rounded ~18px; some inner mockups are DARK (code/terminal) inside the light frame. Footer pill "● @ABHISHEK.DEVINI" centered bottom y96%.

### 2A · 0–3s — `light-mesh-section` / title-card ("Before you open Claude Code, again,")
- **pill**: "● ……" small kicker centered top y8%.
- **stacked headline** centered x50% y14–22%: "Before you open" (grey, light weight) / "Claude Code" (near-black bold) / "again," (near-black). Two-tone by weight, not color.
- **white card mockup** below center y28–44% (frosted, faint UI).
- transitionVerb: "Mesh holds; headline lines fade+rise in top-down 1 line per ~5f; card scales 0.96→1 fading in over 8f."
- timing: line stagger 5f; card 8f.

### 2B · 3–10s — `kinetic-subtitle` / explainer ("Claude Code reads your entire codebase…")
- centered multi-line near-black body with one accent-blue phrase; small frosted info cards below. Word-reveal kinetic.
- transitionVerb: "Body text reveals word-group by word-group ~1 word/5f; accent phrase turns blue as it lands."

### 2C · 10–16s — `brand-lockup` ("Graphify.")
- **GIANT lockup** centered: "Graphify." — near-black extra-bold grotesk with the "." possibly accent; cap-height ~18%. Mesh bg.
- transitionVerb: "Wordmark scales 0.9→1 + fades over 8f; subtle blue underline wipe L→R 10f."

### 2D · 16–24s — `browser-mockup-card` / stat-rows (graph metrics)
- Frosted white cards in a vertical list, each with an icon + label + number (e.g., "27,360", "34,991", "35,000" with small bar sparklines). Near-black numbers, grey labels.
- transitionVerb: "Rows fade+rise in top-down ~5f apart; the sparkline bars grow from 0 height over 10f."

### 2E · 24–30s — `grid-vs-terminal` ("It navigates the graph") with DARK code mockup
- **pill**: "● 04 — HERE'S THE TRICK" centered y8%.
- **two-tone headline** centered y12–20%: "It doesn't re-read files." (near-black) / "It navigates the graph." with "navigates" accent-blue `#8E83FE`.
- **DARK code mockup card** y26–80%: nearly-black panel "Using graph.json with an LLM" + multi-line code, sits inside the light frame (high contrast inset).
- transitionVerb: "Headline reveals line 1 then line 2 (5f apart); 'navigates' flips to blue as it lands; dark code card slides up from y+30px over 10f; code lines type-reveal top-down ~1 line/4f."
- timing: code line reveal 4f/line; card slide 10f.

### 2F · 30–34s — `big-stat-number` ("0x" / "68x")
- **GIANT two-tone** centered: a big number with blue "x" suffix (e.g. "0x" then a count). Near-black digits, blue `#8E83FE` "x".
- transitionVerb: "Digit counts up; the 'x' stays blue; slight scale-overshoot 1.06→1 over 6f."

### 2G · 34–40s — `big-stat-number` ("71×  fewer tokens per query")
- **pill**: "● 05 — THE MATH" centered y10%.
- **GIANT two-tone stat** centered y14–28%: "71" near-black `#19151F`, "×" accent-blue `#8E83FE` — extra-bold grotesk, cap-height ~**31.4%** (226px). Label below "fewer tokens per query" grey ~3.5% y30%.
- **two equation cards** y65–78%: frosted white "YOU PAY $20 per month" `=` "YOU GET $100 of throughput" — "$20" near-black, "$100" accent-blue; a bold "=" between them.
- transitionVerb: "'68' counts up to '71' over ~10f landing on this scene (digit roll), blue '×' pops in beside it with scale 0→1 (6f); the two equation cards slide in from left & right meeting at the center '=' over 9f."
- timing: count-up 10f; × pop 6f; cards slide 9f.

### 2H · 40–48s — `kinetic-subtitle` ("Not just code… it's actually working")
- centered two-line near-black/blue kinetic: "Not just code." / "It's actually working." with accent word blue. Small frosted chips below.
- transitionVerb: "Clause-by-clause reveal 1/6f; accent word turns blue on landing."

### 2I · 48–55s — `cta-outro` ("AI")
- centered: "Comment" grey / "AI" giant accent (blue/black two-tone) / subtitle grey, footer pill "● @ABHISHEK.DEVINI".
- transitionVerb: "'AI' scales 0.9→1 fade 8f; subtitle rises under it 4f later; footer pill always present."

---

## REEL 3 — DXwq6HYoogv (LIGHT mode, accent = blue→purple→pink gradient) — 71.4s

bgMode: **LIGHT**. Pastel MESH gradient base `#E5DFE8` with strong drifting blooms: cyan top-left, lavender/periwinkle right, warm pink/peach bottom-center. Faint square GRID overlay. Floating **rounded-square** decorative tiles (frosted white, ~40–60px, soft shadow) scattered and gently bobbing in the margins. Near-black text `#000`–`#19151F`. Accent = **gradient** blue `#8789ED` → purple `#9A8AF9` → pink `#D99BCC` applied left→right across the accent word. Footer pill "● @ABHISHEK.DEVINI" y96%.

### 3A · 0–3s — `light-mesh-section` / desktop-mockup ("MEET YOUR DOCK BUDDIES")
- **pill**: "● 01 — MEET YOUR DOCK BUDDIES" centered y17%.
- **desktop mockup card** centered x18–82% y25–63%: rounded card showing a macOS-style screen — blue→pink wallpaper, a little 3D character standing on a **dock** of app icons (Finder, Safari, Messages w/ red badge, Mail, etc.).
- **kinetic subtitle** below y68%: "tiny Claude agents." (last word gradient-accent).
- transitionVerb: "Whole mockup card fades up from opacity 0 + scale 0.94→1 over ~12f; floating squares drift in from edges; subtitle types in word-by-word ~1/6f; the character does a tiny idle bob loop."
- timing: card in 12f; subtitle 6f/word.

### 3B · 3–7s — `kinetic-subtitle` ("they're just up there vibing.")
- **pill**: "● 02 — THEY JUST VIBE" centered y17%.
- **two-line headline** centered: "they're just up there" (grey ~4%) / "vibing." (GIANT gradient blue→purple→pink, cap-height ~16%, y28–37%).
- **two chat bubbles** ("oh hi there" left y66%, "just chillin'" right y70% w/ little green character), and a **colorful dock/swatch bar** mockup y80% (row of colored rounded squares), floating squares around.
- transitionVerb: "'vibing.' scales 0.9→1 with the gradient sweeping in L→R over 8f; chat bubbles pop in staggered (left then right, 6f apart, scale 0.8→1); swatch bar slides up from bottom 10f."
- timing: headline 8f; bubble pop 6f stagger; bar slide 10f.

### 3C · 7–12s — `brand-lockup` ("lil agents.")
- **pill**: "● 03 — WHAT IT IS" centered y17%.
- **small label**: "it's called" grey centered y27%.
- **GIANT two-tone lockup** centered: "lil" near-black `#000` (cap-height ~14%) / "agents." gradient blue→purple→pink (cap-height ~17%) y33–48%.
- **subtitle**: "TINY AI COMPANIONS FOR YOUR DOCK" grey letter-spaced caps y53%.
- **credit card** bottom x10–90% y78–86%: frosted "BUILT BY · Ryan Stephen" with "R" avatar chip (orange) + GitHub mark.
- transitionVerb: "'lil' drops in (rise+fade 6f); 'agents.' scales 0.9→1 with gradient sweep L→R 8f, 4f after 'lil'; credit card slides up from bottom 10f."
- timing: lil 6f; agents +4f / 8f; card 10f.

### 3D · 12–17s — `big-stat-number` ("$0 — FOREVER, NO CATCH")
- **pill**: "● 04 — FULLY OPEN" centered y17%.
- **GIANT gradient stat** centered: "$0" blue→purple gradient, cap-height ~16%, y22–32%.
- **label**: "FOREVER, NO CATCH" grey caps y34%.
- **two list-row cards** y62–73%: "● OPEN SOURCE … MIT", "● MIT LICENSE … FREE" — frosted white rows, green dot, near-black label, grey right-tag.
- transitionVerb: "'$0' scale-overshoots 1.1→1 over 8f as gradient sweeps; the two rows slide in from left, stacked, 6f apart; right-tags fade in last."
- timing: stat 8f; rows 6f stagger.

### 3E · 17–26s — `kinetic-subtitle` / character cards ("fun.")
- Character mockup cards (purple-bg cards with the 3D character in poses) in a row; kinetic word "fun." gradient accent. Floating squares.
- transitionVerb: "Character cards fan in left→right 5f apart; 'fun.' pops gradient-swept 8f."

### 3F · 26–30s — `kinetic-subtitle` ("peaceful.")
- centered grey lead-in + GIANT gradient "peaceful." y30%, mockup card below.
- transitionVerb: "Lead-in fades; 'peaceful.' scales 0.9→1 gradient-sweep L→R 8f."

### 3G · 30–40s — `browser-mockup-card` / scrolling ("fun." continued, app preview)
- Frosted browser/app preview cards with scrolling content; small character; floating squares.
- transitionVerb: "Card fades up 10f; body scrolls steadily."

### 3H · 40–47s — `kinetic-subtitle` ("while it thinks, it talks back.")
- **pill**: "● 07 — PLAYFUL UX" centered y17%.
- **two-line headline** centered: "while it thinks," (grey ~4%) / "it talks back." (near-black `#000` extra-bold ~6%) y22–32%.
- **center gradient app-icon emblem** y45–55%: a rounded-square app icon with a gradient face/blob, concentric ring halo around it.
- **notification chip** y82%: frosted "● done!  'PLAYS A LITTLE SOUND'".
- transitionVerb: "Headline reveals line1 then line2 (5f apart); the app-icon emblem pops scale 0→1 with a ring pulse expanding outward over 12f; notification chip slides up from bottom + a subtle bounce at frame ~10."
- timing: emblem pop 8f; ring pulse 12f; chip slide 8f + bounce 3f.

### 3I · 47–58s — `big-stat-number` ("100% local" — PRIVACY FIRST)
- **pill**: "● 08 — PRIVACY FIRST" centered y17%.
- **shield emblem card** centered y22–33%: frosted rounded card with a shield + purple checkmark.
- **label**: "YOUR DATA STAYS" grey caps y37%.
- **GIANT two-tone**: "100%" blue-gradient `#8789ED` / "local" purple→pink gradient `#9A8AF9`→`#D99BCC`, cap-height ~12%, centered y42–49%.
- **3 stat cards** bottom row y75–84%: each a frosted card with "0" — "NO SIGNUP / accounts", "NO TRACKING / events", "NO CLOUD / bytes leave".
- transitionVerb: "Shield card pops scale 0.9→1 (8f) with a checkmark draw-on (8f); '100% local' sweeps gradient L→R over 10f; the three '0' cards rise in left→right 5f apart, each '0' counting/snapping in."
- timing: shield 8f; checkmark draw 8f; headline 10f; cards 5f stagger.

### 3J · 58–66s — `big-stat-number` / data-table ("alive" build-up + metrics table)
- A frosted **data table card** (rows of metrics/columns) appears y40–60%; near-black header, grey rows. Floating squares.
- transitionVerb: "Table card fades up 10f; rows reveal top-down 4f/row."

### 3K · 60–67s — `title-card-two-tone` ("but this guy made it alive.")
- **pill**: "● 09 — BUT THIS" centered y17%.
- **pink heart icon** centered y37%.
- **headline**: "but this guy made it" (grey ~4.5%) / GIANT "alive." gradient blue→pink→peach (cap-height ~14%) y50–60%.
- **subtitle**: "A LITTLE BUDDY ON YOUR SCREEN" grey caps y65%.
- transitionVerb: "Pink heart pops scale 0→1 (5f) with a tiny beat; 'alive.' scales 0.9→1 with gradient sweep L→R 8f; subtitle fades in under it 4f later."
- timing: heart 5f; alive 8f; subtitle +4f.

### 3L · 67–71.4s — `cta-outro` (Comment "AI")
- centered: "Comment" (grey caps) / "AI" (purple `#9A8AF9`, quoted "AI" giant ~10%) / "and I'll DM you the resources." (grey ~4.5%) y38–55%; footer pill "● @ABHISHEK.DEVINI" y96%; mesh + grid + floating squares.
- transitionVerb: "'AI' scales 0.9→1 + purple fade over 8f; subtitle rises under it 4f later; footer pill persistent."
- timing: AI 8f; subtitle +4f.

---

## GLOBAL NOTES

### Font family best-guesses
- **Giant headlines / lockups / stat numbers**: extra-bold/black **grotesk** — Inter-Black, Geist-Black, or similar humanist grotesk (tight tracking, large x-height, geometric "a"/"g"). Strong condensed feel at black weight. The "." period is often colored as a deliberate accent.
- **Body / sub-headlines**: same family, regular/medium weight, near-black or grey.
- **Pill kickers, mono labels, terminal/code, footnotes**: **monospace** (JetBrains Mono / Geist Mono / SF Mono), uppercase, wide letter-spacing (~0.15–0.25em), small (~1.6–2.3% cap-height). Always prefixed with a "●" dot or "—" rule.
- **Two-tone rule**: headline = 1 accent-colored word + rest near-black (LIGHT) or white (DARK). Accent word is usually the payoff noun/verb.

### Full palette
DARK reel (DXpZf2ziBYP):
- bg base: `#07040A` → `#140A0D`; glow warm: `#210E10` → `#2A1409`
- card slate: `#13141B` / `#181A21`
- accent orange: `#FD9B00` (primary), `#F99707` (gradient lower), `#E8746A` (alert salmon-red)
- text white: `#FAF7FC` / `#F5F2F7`; grid line ~`#1C1410`@low-opacity
- variant-card swatches: cream `#F4EFE2`, light `#ECE7E2`, teal underline `~#3FB6A0`

LIGHT reels (DXtNSIhj_dp + DXwq6HYoogv):
- mesh: lavender `#E8E0EB`, blue-grey `#D9E1ED`, peach `#EBDAE2`, base `#E5DFE8` + drifting cyan/pink/lavender blooms
- text near-black: `#19151F` / `#000`; grey labels ~`#9A95A5`
- accent BLUE (reel 2): `#8E83FE`
- accent GRADIENT (reel 3): `#8789ED` (blue) → `#9A8AF9` (purple) → `#D99BCC` (pink), extending to peach at far right on "alive."
- cards: frosted white `#FFFFFF`@~85%, soft shadow, ~18px radius; inset DARK code panels near-black

### Timing conventions (30fps)
- **Entrance**: scale 0.9–0.96 → 1 + opacity 0→1, over **6–10 frames** (~0.2–0.33s). Giant stats add a 1.06–1.1 **overshoot** settling over ~4–6f.
- **Word/line stagger**: 5–6f between successive lines/words/cards. Kinetic subtitles reveal ~**1 word per 5–6 frames**.
- **Card grids**: row-by-row or Z-order stagger, ~5f apart, each card 6–7f.
- **Gradient/accent sweep** on the hero word: L→R reveal over **8–10f**.
- **Stat count-ups**: number rolls over **10–14f**; the unit suffix ("x", "%") pops separately in 6f.
- **Progress bars / sliders / sparklines**: fill L→R or grow over **10–18f**.
- **Glow blooms** (dark reel): 12–14f fade-in behind the hero.
- **Slide-ins from edges** (VS cards, bottom lockup bars): ~9–10f from ±30–40px offset.
- **Scenes** typically hold 2.5–5s; the reel is a fast sequence of ~10–12 distinct templated scenes. Pills/kickers always lead the scene (in by frame 6); hero text second; supporting cards/mockups last.

### Recurring element library (across all 3)
`pill-kicker` (dot/rule + mono caps) · `giant-two-tone-headline` · `brand-lockup` (giant wordmark + repo/credit card) · `big-stat-number` (giant digit + unit accent + label + supporting cards) · `browser-mockup-card` · `terminal-mockup-card` (traffic-lights chrome, $ prompt, progress bar, ✓ success) · `grid-of-logo-cards` / `feature-card-grid` (2×2) · `grid-vs-terminal` (VS badge between a light GUI card and a dark terminal card) · `kinetic-subtitle` (word-by-word, accent word colored) · `light-mesh-section` (floating rounded squares + mesh) · `cta-outro` ("Comment 'AI'" + handle footer pill).
