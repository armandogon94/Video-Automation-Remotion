# abhishek.devini — raw frame-by-frame analysis (batch 4)

Creator: **abhishek.devini** — typography-driven AI/tech explainer reels, 720×1280 @ 30fps.
Reels analyzed: **DY4hA09PkjD** (50.45s, DARK / Claude-Code "free claude code"), **DY6pP0FP4Qa** (83.71s, DARK / "OPUS 4.8 / Mythos"), **DYUcj5iPAxL** (58.07s, LIGHT mesh / "Reel Stack" self-promo).

Method: ffmpeg even-spaced frames every 2s + 30fps dense bursts across intros/counters/transitions; PIL dominant-color sampling on real frames; cap-height ÷ 720 for fontSize%; consecutive-frame counts for timing.

All three confirm the creator's two background systems: **DARK** (near-black, faint radial accent glow behind hero text, diagonal soft light streaks, drifting dust particles, floating rounded-square bracket glyphs `{ } > # /` in the margins) and **LIGHT** (pastel MESH gradient peach/lavender/blue/amber, floating frosted rounded-squares, colored dust dots, near-black text). Accent color tracks the topic brand (Anthropic orange-coral / amber-gold; "Mythos" sub-reveal switches to lavender).

---

## REEL DY4hA09PkjD — DARK, "Free Claude Code" (Anthropic orange/amber)

bgMode: **DARK**. bg HEX: corner `#0A070A`, body `#13101 5`→`#161317`, streaks `#1A171A`. Accents: mascot/icon coral `#E07853`, amber-gold `#F8B000` (headline accent word + ZERO COST), success green `#58B078` ("free"). Two-tone headline = white `#F2F2F4` + one accent word.

### 1. 0.0–3.0s — title-card-two-tone
- bgMode DARK; accent amber `#F8B000` / mascot coral `#E07853`.
- icon: **pixel-art Claude mascot** (orange/coral blocky sprite), ~9% w, centered x50% y18%.
- pill KICKER: `●  FREE  ·  FOREVER`, mono-ish letter-spaced caps, ~2% (14px cap), text `#C8C8CC`, dot coral, x50% y27%, dark rounded pill.
- small-caps overline: `RUN CLAUDE CODE`, extra-bold grotesk, ~5.5% (40px), white, x50% y34%.
- giant HEADLINE two lines: `FREE` / `FOREVER`, extra-bold grotesk ALL-CAPS, ~15% (≈108px cap), white `#F2F2F4`, x50% y42–53%.
- transitionVerb: "Mascot fades+drifts down into place over first 6f; pill and `RUN CLAUDE CODE` fade in ~f7; `FREE` rises ~12px and scales 0.92→1 entering at f8 settling by f14; `FOREVER` repeats the rise-in at f16 settling by f22."
- timing: mascot fade-in 6f; kicker 4f; FREE word rise+scale 6f; FOREVER rise+scale 6f (1-word-per-~8f stagger).

### 2. 3.0–6.5s — kinetic-subtitle + terminal-mockup-card (build)
- pill `●  OPEN SOURCE` x50% y19%.
- kinetic HEADLINE: `A developer just dropped this on GitHub`, bold ~6% (44px), white; **word-by-word reveal** — already-spoken words solid white, upcoming words rendered blurred/grey and sharpen as they're "spoken." x50% y26%.
- terminal MOCKUP CARD: dark `#141416` rounded card, traffic-light dots (red/yellow/green), titlebar `free-claude-code — zsh`, corner bracket frame `⌐ ⌐` around card, monospace lines `$ gh repo clone Alishahryar1/free-claude-code` / `Cloning into 'free-claude-code'…`. card x50% y52%, ~80% w.
- transitionVerb: "Headline words sharpen left-to-right one per ~6f; terminal card scales 0.96→1 + fades up over 10f, then file-tree lines type in one row per ~4f (`router.py` highlighted amber)."
- timing: kinetic words ~6f each; card fade/scale-in 10f; code lines ~4f/line.

### 3. 6.5–10s — big-stat-number ("22,000+")
- pill `●  TRACTION` x50% y33%.
- BIG STAT: `22,000+`, extra-bold grotesk, ~17% (≈122px), white, x50% y45%, framed by thin corner-bracket `⌐ ⌐`.
- label: `★  GITHUB STARS`, letter-spaced caps ~3%, `#9A9AA0`, star amber, x50% y56%.
- transitionVerb: "Bracket frame draws corners + number counts/pops in (scale 0.9→1 over 8f) while label fades up 8f; whole group holds then cuts to black at ~10s."
- timing: number pop 8f; label fade 8f.

### 4. 11–15s — network-routing-diagram + kinetic-subtitle + bracket-pill
- two-tone HEADLINE: `It quietly reroutes Claude Code to free AI models` ("reroutes" amber `#F8B000`), bold ~5.5%, white, x50% y26%.
- DIAGRAM: left fan of glowing node dots + lines converging right into a single ringed node (white→amber edge), animated routing.
- bracketed pill SUBTITLE: `●  WITHOUT BREAKING ANYTHING`, mono caps ~2.5%, inside corner-bracket frame, dot green, x50% y66%.
- transitionVerb: "Nodes pop in left-to-right (each dot scale 0→1 ~3f), connector lines draw toward the right hub over ~12f, hub ring pulses once; subtitle pill fades up 8f."
- timing: node stagger ~3f; lines draw 12f.

### 5. 16–19s — browser-mockup-card (GitHub repo) + kinetic-subtitle
- pill `●  LIVE`.
- kinetic HEADLINE: `Your terminal still thinks it's talking to Anthropic` ("Anthropic" coral `#E07853`), word-by-word sharpen.
- browser/repo MOCKUP CARD: full GitHub-style dark UI (file list, sidebar Releases/Packages/Contributors/Languages, README "Free Claude Code"), corner-bracket frame, titlebar `claude-code — zsh`.
- transitionVerb: "Repo card scales up + fades in 10f; the view scroll-pans / cross-fades to the README quick-start at ~18s; headline words sharpen one per ~6f."
- timing: card in 10f; cross-fade to quick-start ~12f.

### 6. 19–30s — diagram-explainer ("THE SWITCHBOARD")
- pill `●  THE SWITCHBOARD` (coral dot).
- node cards: `✳ Claude Code` (dark rounded card, burst icon coral) top; ghost `A\ Anthropic` card right (greyed); central **switch node** = ringed circle (amber edge) with `⇄` icon.
- expands at ~26s: three model cards bottom — `DeepSeek` (blue logo), `Kimi K2`, `GLM` — connected by lines from the switch node.
- bottom kinetic SUBTITLE: `It thinks it's calling Anthropic` → `redirected to a free model instead` ("free" green `#58B078`).
- transitionVerb: "Claude Code card drops in from top (translateY −20→0, 8f); connector line draws down to switch node 6f; switch ring spins/pulses; at ~26s three model cards pop in bottom staggered ~4f each as their lines draw."
- timing: card drop 8f; line draws 6f; model-card stagger 4f.

### 7. 30–35s — title-card-two-tone ("ZERO COST")
- pill `●  THE BEST PART` (amber dot), appears alone ~32s during transition.
- HEADLINE: `SAME EXPERIENCE` (white, ~7%) over giant two-line `ZERO` / `COST` (amber-gold `#FEB400` with soft glow, extra-bold caps ~16% / ≈115px), x50% y45–58%.
- transitionVerb: "`SAME EXPERIENCE` fades up 6f; `ZERO` then `COST` each scale-pop 0.9→1 with amber glow blooming behind over 8f, staggered ~8f apart."
- timing: line stagger 8f; glow bloom 8f.

### 8. 35–43s — instruction-card + brand-chips
- pill `●  THE BEST PART`.
- HEADLINE: `You don't need to be a developer`, bold ~6.5%, white, x50% y26%.
- instruction CARD: dark rounded, label `THE ONLY STEP →` (grey caps), bold white `Grab a free key & paste it in`, inset code field `$ API_KEY=sk-••••••••`, corner-bracket frame. x50% y48%.
- brand CHIPS row: `▮ NVIDIA NIM` (green logo) + `◇ OpenRouter`, dark pill chips, x50% y64%.
- transitionVerb: "Headline fades up 6f; card scales 0.96→1 + fades 10f; the two brand chips slide up from below staggered ~5f."
- timing: card in 10f; chips ~5f stagger.

### 9. 43–48s — cta-card ("COMMENT AI")
- pill `●  ↓ DO THIS` (amber).
- icon: chat-bubble `●●●` in white-stroked dark rounded square, x50% y36%.
- giant HEADLINE: `COMMENT "AI"`, extra-bold caps ~14% (≈100px), white, x50% y52%.
- SUBTITLE: `and I'll send the setup file + the repo link` ("repo" bold), ~4%, `#C8C8CC`, x50% y60%.
- transitionVerb: "Chat icon pops (scale 0→1 + slight overshoot, 6f); headline rises+scales 0.9→1 8f; subtitle fades up 6f."
- timing: icon pop 6f; headline 8f.

### 10. 48–50.4s — brand-lockup (outro)
- LOCKUP: `✳ Claude` wordmark (burst coral + white text) center, ~9% x50% y40%.
- subtitle kinetic: `Made in minutes with a custom Claude skill` (last words greyed/blurred), x50% y48%.
- circular BADGE: thin ring with curved text `FREE CLAUDE CODE · DARK GLASS · DEVINI LABS`, amber ring accent, x50% y68%.
- transitionVerb: "Wordmark fades in 8f; subtitle sharpens word-by-word; circular badge rotates slowly (~3°/f) and its ring traces in over ~20f."
- timing: ring trace 20f; slow rotation continuous.

---

## REEL DY6pP0FP4Qa — DARK, "OPUS 4.8 / Mythos" (Anthropic orange→Mythos lavender)

bgMode: **DARK**. bg HEX corner `#0C090C`, body `#13101 5`→`#161317`. Accents: burst coral `#DE7854`, amber-gold `#FAB400`, success/highlight green `#42AE66`, **Mythos lavender `#C6C0FC`** (sub-reveal only). Floating bracket glyphs `{ > # / -` in margins throughout.

### 1. 0–6.5s — title-card-two-tone ("OPUS 4.8")
- icon: **Anthropic burst** (radiating coral spokes `#DE7854`), ~9% x50% y18%.
- pill `●  ANTHROPIC  ·  NEW RELEASE` (coral dot), x50% y25%.
- giant HEADLINE two lines: `OPUS` / `4.8`, extra-bold grotesk, ~22% (≈150px for "4.8"), white with subtle vertical gradient, x50% y28–48%.
- italic SUBTITLE: `is finally here.`, italic grey `#8A8A90`, ~6%, x50% y62%.
- 2nd pill (≈f120/4s): `●  THE FULL RUNDOWN  ·  UNDER A MINUTE` (amber dot), x50% y70%.
- transitionVerb: "Burst icon scales 0→1 with spoke bloom 8f; `OPUS` then `4.8` rise+scale 0.92→1 staggered ~10f; italic subtitle fades up 8f; second pill fades up later ~f110."
- timing: icon bloom 8f; word stagger 10f.

### 2. 6.5–9.5s — big-stat-number ("#1") + rising-bars
- pill `●  THE BENCHMARK KING` (amber dot).
- BIG STAT: `#1`, extra-bold ~24% (≈150px), white gradient, x50% y34%.
- rising-bars graphic: 4 bars left→right increasing, last bar white with glow (others dark grey), x50% y52%.
- kinetic SUBTITLE: `The most capable model anyone's shipped` ("capable" amber `#FAB400`), word-by-word sharpen, x50% y64%.
- transitionVerb: "`#1` pops scale 0.9→1 8f; bars grow up from baseline staggered ~4f each, tallest white bar blooms glow on land; subtitle words sharpen ~6f each."
- timing: bar stagger 4f; #1 pop 8f.

### 3. 9.5–18s — comparison-table-card ("BENCHMARKS")
- pill `●  BENCHMARKS` (coral dot).
- TABLE CARD: dark rounded, corner-bracket frame; columns `Opus 4.8`(highlighted warm-tint col w/ burst icon) | `Opus 4.7` | `GPT-5.5`(OpenAI logo) | `Gemini 3.1`(spark); rows `Agentic coding / SWE-Bench Pro`, `Terminal coding`, `Reasoning`, `Computer use`, `Knowledge / GPQA`; Opus 4.8 values bold white, one rival value amber (`78.2`). x50% y40%.
- transitionVerb: "Card body scales/fades in 10f; the Opus 4.8 column tint sweeps in (a warm vertical wipe) over ~12f; rows reveal top-to-bottom one per ~3f."
- timing: card in 10f; column tint wipe 12f; rows 3f/row.

### 4. 18–28s — big-stat-number ("4" → "4×") + code-card
- pill `●  HONESTY` (green dot).
- icon: balance/scale `⚖`, white line icon, x50% y28%.
- BIG STAT: `4` then morphs to `4×`, extra-bold ~24%, white gradient, x50% y40%.
- label: `MORE HONEST THAN 4.7`, letter-spaced caps ~3.5%, grey, x50% y48%.
- code-comment CARD: dark rounded, `// less hand-holding` (grey) + strikethrough quote `✗ "I'm confident this is right."` (orange ✗ marker, line-through), x50% y58%.
- transitionVerb: "Scale icon fades in 6f; `4` pops 8f; `×` slides in from right at ~24s (translateX +20→0, 6f); strikethrough draws across the quote left→right over 8f as the orange ✗ pops."
- timing: × slide-in 6f; strikethrough draw 8f.

### 5. 28–40s — radial-progress / radar-target ("FIRST TRY")
- pill `●  ACCURACY` (amber dot).
- graphic: concentric-ring **radar/target**, outer rings thin grey, an amber ring `#FAB400` highlight + white center dot, x50% y34%.
- giant HEADLINE: `FIRST TRY`, extra-bold caps ~18% (≈130px), white→grey vertical gradient, x50% y50%.
- chip row: `✓ Less fixing` / `✓ Less nudging` / `✓ Right the first time` — dark pills with green check, x50% y58%.
- italic SUBTITLE: `…far more often.`, italic grey, x50% y66%.
- transitionVerb: "Rings expand outward from center one per ~4f (scale 0→1), amber ring locks + center dot pops; `FIRST TRY` rises+scales 0.9→1 8f; three green-check chips pop in staggered ~5f."
- timing: ring expand 4f/ring; chip stagger 5f.

### 6. 40–46s — bar-chart-card ("ALIGNMENT")
- pill `●  ALIGNMENT` (green dot).
- card HEADLINE: `Misaligned behavior  ↓ lower is better`, bold white + grey suffix, x50% y26%.
- BAR CHART: 4 bars `Sonnet 4.6 (2.50)` grey | `Mythos (1.75)` **green `#42AE66`** | `Opus 4.7 (2.40)` grey | `Opus 4.8 (1.85)` **white-glow highlighted**; dashed baseline rule; value labels above bars (green for Mythos, white for Opus 4.8). x50% y52%.
- transitionVerb: "Bars grow up from baseline staggered ~4f; the two highlighted bars (green Mythos, white Opus 4.8) bloom a soft glow on land; value numbers count-up + fade above each."
- timing: bar grow ~10f total, 4f stagger.

### 7. 46–52s — chat-bubble-card ("BACKBONE")
- pill `●  BACKBONE` (amber dot).
- two-tone HEADLINE: `It won't just nod along to keep you happy.` ("nod" amber `#FAB400`), bold ~5.5%, white, x50% y26%.
- user MESSAGE bubble (right-aligned, dark grey): `"Let's just skip the migration and ship."` x50% y42%.
- Opus reply CARD: dark card w/ **orange glow border**, header `✳ OPUS 4.8` (coral), `⚠ That'll drop user data. Bad plan — here's a safer path.` (bold white), x50% y54%.
- transitionVerb: "Headline fades up 6f; user bubble slides up + fades 8f; Opus reply card slides up beneath it 8f then its orange border-glow fades in over ~6f."
- timing: bubbles 8f each; glow 6f.

### 8. 52–60s — feature-card-stack ("WHAT'S NEW")
- pill `●  WHAT'S NEW` (coral dot).
- two-tone HEADLINE: `Three new features dropped.` ("Three" amber), bold ~6%, x50% y26%.
- highlighted CARD: orange-glow rounded, icon `⟳` in glowing rounded square, label `THE STANDOUT` (amber caps), title `Dynamic Workflows` (bold white ~7%), x50% y42%.
- two dimmed numbered CARDS below: `02 + one more upgrade`, `03 + one more upgrade` (grey), x50% y56%.
- transitionVerb: "Standout card scales 0.96→1 + orange glow blooms 10f; `02`/`03` cards fade up dimmed staggered ~5f."
- timing: card bloom 10f; numbered cards 5f stagger.

### 9. 60–68s — constellation / radial-burst ("DYNAMIC WORKFLOWS")
- pill `●  DYNAMIC WORKFLOWS` (coral dot).
- graphic: **constellation** — central ringed node `✳ 1 SESSION` (burst coral) with dozens of orbiting dots radiating outward on thin spokes; a cluster of dots on the right tinted amber. x50% y36%.
- BIG STAT: `100+`, extra-bold ~20%, white-gradient, x50% y62%; label `SUBAGENTS  ·  ONE SESSION` letter-spaced grey, x50% y68%.
- transitionVerb: "Center node pulses; orbit dots spray outward along spokes staggered (waves of ~6 dots per ~3f); `100+` counts/pops up 8f; the right amber dots light up last."
- timing: dot waves ~3f; stat pop 8f.

### 10. 68–76s — title-card-reveal ("CLAUDE MYTHOS") — lavender accent
- pill `●  ONE MORE THING`.
- overline `CLAUDE` (letter-spaced lavender-tinted caps ~5%) over giant `MYTHOS` (extra-bold caps ~20% ≈145px, **lavender `#C6C0FC` gradient with glow**), set over a dark circle + floating lavender dots, x50% y42%.
- bracketed pill SUBTITLE: `●  ROLLING OUT IN THE COMING WEEKS` (lavender glow), x50% y60%.
- italic SUBTITLE: `…to everyone.`, italic grey, x50% y65%.
- transitionVerb: "Dark circle scales in behind text 8f; `MYTHOS` rises+scales 0.9→1 with lavender glow bloom 10f; floating dots drift; bracket pill fades up with glow 8f."
- timing: glow bloom 10f; circle scale 8f. **Palette switches orange→lavender here.**

### 11. 76–83.7s — cta-card ("COMMENT OPUS")
- pill `●  WANT THE FULL ANNOUNCEMENT?` (coral dot).
- giant HEADLINE: `OPUS`, extra-bold caps ~20% (≈145px), white-gradient, x50% y32%.
- input FIELD (dark rounded): chat icon + typed `Opus` + **amber blinking cursor `|`**, x50% y45%.
- CTA BUTTON: white rounded pill `COMMENT "OPUS"  →` with warm glow, x50% y54%.
- SUBTITLE: `…and I'll fire the link over to you.`, grey, x50% y63%.
- transitionVerb: "`OPUS` rises in 8f; the field types `Opus` letter-by-letter (~3f/char) with blinking amber caret; white CTA button pops scale 0.95→1 + glow pulse 6f; subtitle fades up."
- timing: type ~3f/char; button pop 6f.

---

## REEL DYUcj5iPAxL — LIGHT mesh, "Reel Stack" self-promo (orange + lavender)

bgMode: **LIGHT**. Mesh bg HEX: base `#F0E8F1`, peach blob `#F9C8BA`, lavender blob `#CBC9F9`, amber blob `#F0CEAD`; floating frosted rounded-squares `~#F4EEF4` w/ soft shadow; dust dots in orange/lavender. Accents: orange `#FC7E48`, near-black text `#0C0C12`, lavender/purple `#B490FC`, green dot `#00C07E`. Mesh blobs + squares + dots **drift continuously** the whole reel.

### 1. 0–3s — light-hook-section (two-tone headline)
- pill `●  ATTENTION` (orange dot), frosted white pill, x50% y19%.
- two-tone HEADLINE: `Every reel on my profile` ("Every" orange `#FC7E48`, rest near-black), extra-bold grotesk ~9% (≈65px), x50% y45%.
- transitionVerb: "Mesh blobs drift; headline words pop up word-by-word (each translateY +12→0 + fade, ~5f) with `Every` landing orange; floating squares parallax-drift slowly."
- timing: words ~5f each.

### 2. 3–6s — light-mesh-title-build ("built with one custom claude skill")
- pill `●  BUILT WITH`.
- large orange **Anthropic burst** icon `#FC7E48`, ~16% center, x50% y48%.
- kinetic HEADLINE under icon: `one custom claude skill` (word-by-word, blur→sharp), near-black, x50% y63%.
- transitionVerb: "Burst icon scales 0→1 + spoke bloom 10f over drifting mesh; headline words sharpen left-to-right ~6f each."
- timing: icon bloom 10f; words 6f.

### 3. 6–13s — big-stat-number light (0 → 9,778 → 10,000)
- pill `●  2 WEEKS  ·  ORGANIC` (green dot `#00C07E`).
- BIG STAT counter: starts `0` (slashed-zero, near-black extra-bold ~13% ≈95px), counts up `9,778`…`10,000`, x50% y48%.
- transitionVerb: "Single slashed `0` holds ~6f, then the number counts up with strong ease-out — ~450/frame early, decelerating to ~18/frame, total ~54f to land on `10,000`; label `one supporter` fades below."
- timing: counter 54f ease-out; hold-0 6f.

### 4. 13–20s — brand-lockup ("Reel Stack")
- pill `●  INTRODUCING` (orange dot).
- white rounded LOCKUP CARD (soft shadow): orange burst icon + wordmark `Reel`(near-black) `Stack`(orange `#FC7E48`), extra-bold grotesk, x50% y52%.
- label below: `A CLAUDE CODE SKILL`, letter-spaced caps ~3%, grey, x50% y68%.
- transitionVerb: "Empty white card slides up + fades 8f; burst icon pops inside (scale 0→1, 6f); `Reel Stack` text wipes/reveals left→right 8f; label fades up 6f."
- timing: card in 8f; wordmark reveal 8f.

### 5. 20–27s — phone/glass-mockup-card ("Multimodal")
- pill `●  PICK A STYLE`.
- PHONE FRAME mockup (rounded, glassmorphic inner): chip `●  GLASS`, Anthropic `A\` icon in white circle, title `Multimodal` (near-black bold) / `without the demo.` (blue italic `~#6E78F0`), preset row `PRESET — GRAPHIFY` / `Glass family  1080×1920`, pagination dots (one orange-filled). x50% y52%.
- transitionVerb: "Phone frame scales 0.95→1 + fades in 10f; inner card content reveals top-to-bottom ~4f/row; pagination dot slides to active."
- timing: phone in 10f; rows 4f.

### 6. 27–32s — waveform-mockup ("VOICEOVER.WAV")
- pill `●  YOUR VOICE` (orange dot).
- mic icon `🎤` in white circle, x50% y42%.
- WAVEFORM: row of rounded bars alternating **orange `#FC7E48` / lavender `#B490FC`**, animated heights, x50% y54%.
- label `VOICEOVER.WAV`, mono letter-spaced near-black, x50% y62%.
- transitionVerb: "Mic circle pops 6f; waveform bars spring up sequentially left→right (each scaleY 0→1 ~2f) then idle-oscillate; label fades up."
- timing: bar spray ~2f/bar; mic pop 6f.

### 7. 32–37s — lint-card-mockup ("Catches breaks")
- pill `●  LINT`.
- two-tone HEADLINE: `Catches breaks before you ever hit post` ("post" lavender/highlighted, kinetic blur→sharp), near-black, x50% y26%.
- LINT CARD (frosted): `/REELSTACK-LINT SRC/LAUNCH.TSX` (mono) + `3 ERRORS` (orange, right), error row `✗ Safe zones (top 290 / bottom 422)` (orange ✗ circle) + `Motion floor ≥ 4 layers`. x50% y58%.
- transitionVerb: "Headline words sharpen ~6f; card slides up + fades 10f; error rows reveal one per ~4f with the orange ✗ circle popping."
- timing: card in 10f; rows 4f.

### 8. 37–41s — code-editor-mockup ("FOUNDATION")
- pill `●  FOUNDATION`.
- CODE CARD (dark editor on light bg): traffic lights + `src/ReelStack.tsx` + `REACT` badge; syntax-highlighted lines `import { Audio, Sequence } from "remotion";` / `export const ReelStack = () => {` / `<Sequence durationInFrames={1740}>` / `<Hook /> <Reveal /> <Proof />` / `<Product /> <Styles /> <CTA />`; line numbers gutter. x50% y50%.
- transitionVerb: "Dark editor card scales 0.96→1 + fades 10f; code types/reveals line-by-line ~4f per line with syntax colors fading in."
- timing: card in 10f; lines 4f.

### 9. 41–45s — big-stat-number light ("22") + chip-cloud
- pill `●  DIRECT PORT  ·  SHIPPED REEL`.
- BIG STAT `22`, near-black extra-bold ~13%, x50% y28%.
- chip CLOUD: frosted pill chips `graphify`, `paperclip`, `gstack`, `lilagents`, `jcode`, `claudewatch`, `claudewatchbeta`… pop in across two rows, x50% y38%.
- transitionVerb: "`22` pops scale 0.9→1 8f; chips spray in one per ~3f (each scale 0→1 + slight overshoot) filling the cloud."
- timing: stat pop 8f; chip stagger 3f.

### 10. 45–50s — phone-mockup-showcase ("Reels I already shipped")
- pill `●  DIRECT PORTS`.
- two-tone HEADLINE: `Reels I already shipped.` ("shipped" lavender `#B490FC`, kinetic), near-black, x50% y24%.
- PHONE FRAME slides in from left, screen shows `It's called / Graphify.` + `A knowledge graph for your code`, x35% y55%.
- transitionVerb: "Headline words sharpen ~6f; phone frame slides in from left (translateX −80→0 + fade, 10f) and parallax-tilts slightly."
- timing: phone slide 10f.

### 11. 50–58s — cta-card light + brand-lockup outro ("Comment AI")
- pill `●  WANT IT?` then `●  ...` ; final input pill `Comment "AI" → link in your inbox`.
- giant two-tone HEADLINE: `Comment AI.` ("AI." orange `#FC7E48`), extra-bold ~11% (≈80px), near-black, x50% y20%.
- SUBTITLE: `I'll DM you the link.`, slate-grey bold ~5%, x50% y28%.
- three pastel ACTION TILES: `♥ LIKE` (peach), `+ FOLLOW` (mint), `AI COMMENT` (lavender), rounded squares w/ labels, x50% y42%.
- brand LOCKUP (outro): `✳ Reel Stack` wordmark + `A CLAUDE CODE SKILL  ·  DEVINI LABS` letter-spaced grey, x50% y78%.
- transitionVerb: "`Comment` then `AI.` pop word-by-word 8f; three tiles pop in staggered ~5f (scale 0→1 overshoot); input pill + wordmark fade up last 8f."
- timing: tiles 5f stagger; headline words 8f.

---

## GLOBAL NOTES

**Font families (best guess):**
- HEADLINES / BIG STATS / brand wordmarks: an **extra-bold geometric grotesk** — reads like **General Sans / Clash Display / Satoshi Black** or Inter/Helvetica-Now-Display Black. Very tight tracking, large x-height, ALL-CAPS for hero cards, sentence-case for kinetic headlines. Two-tone = one word swapped to accent color.
- BODY / kinetic subtitles: same family, Bold/Semibold, sentence case.
- PILL KICKERS, code/labels, table cells, `.WAV/.TSX` filenames: a **monospace** (JetBrains Mono / SF Mono / Geist Mono), heavily **letter-spaced** ALL-CAPS, ~12–14px.
- Italic subtitles ("is finally here.", "…to everyone.", "without the demo.") use the same grotesk's italic.

**Palette (full):**
- DARK bg ramp: `#0A070A` (corner) → `#0C090C` → `#13101 5` → `#161317` (body) → `#1A171A` (streak highlights). Text white `#F2F2F4`, muted grey `#8A8A90`/`#C8C8CC`.
- LIGHT mesh: base `#F0E8F1`; blobs peach `#F9C8BA`, lavender `#CBC9F9`, amber `#F0CEAD`; frosted squares `#F4EEF4`. Text near-black `#0C0C12`, slate `#5A5A66`.
- Accents (topic-tracked): Anthropic coral `#DE7854`/`#E07853`, amber-gold `#F8B000`–`#FAB400`–`#FEB400`, "Reel Stack" orange `#FC7E48`, success green `#42AE66`/`#58B078`/`#00C07E`, **Mythos/shipped lavender `#B490FC`/`#C6C0FC`**, mockup blue `#6E78F0`.

**Recurring elements / decoration:**
- Pill KICKER on every scene: `●  LETTERSPACED CAPS` at x50% y~19–27%; dot color = accent.
- Corner-bracket frame `⌐ … ⌐` around every mockup/stat card.
- DARK reels: diagonal soft light streaks + drifting dust + floating mono bracket glyphs `{ } > # / -` in side margins.
- LIGHT reel: drifting mesh blobs + floating frosted rounded-squares + colored dust dots.
- Anthropic burst icon (radiating spokes) is the signature logo mark; pixel-art mascot variant in reel A.

**Timing conventions (measured @30fps):**
- Word-by-word kinetic headline: **1 word per ~6f**; upcoming words rendered blurred/greyed then sharpen.
- Hero word/number entrance: **scale 0.92→1 + translateY ~12px, over 6–10f**, ease-out.
- Stat counters: hold start ~6f then **ease-out count ~54f** (fast→slow, ~450/f decel to ~18/f).
- Card entrance: **scale 0.96→1 + fade, 10f**; inner rows reveal **~3–4f/row**.
- Chips / nodes / bars / dots: **spray/stagger 3–5f each**, with scale-0→1 + slight overshoot; highlighted bars/cards bloom a soft glow on land (~6–10f).
- Glow blooms (ZERO COST, Mythos, CTA buttons, highlight bars): **8–10f**.
- Scenes hold ~2–4s then hard-cut (often through a 0.3–0.5s black/mesh-only gap that carries the next pill kicker in early).
