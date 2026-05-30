# @DIYSmartCode — Vote 5: Typography + Color

Voter: V5 (TYPE + COLOR only)
Frames audited: 22 across 8 reels (0HIf4AlajNY, 6nVW14npcO4, DgDK5KWtJAw, Jj3m_R2627Y, dzn9KVVtZLc, eEy1oMeGfhQ, fpNTqli9cs8, jOorXKrbTHU, o9MSAAXma-I, rfzA7HWcpCQ).

---

## 0. Two visual systems, one creator

Before anything else: @DIYSmartCode runs **two distinct templates** in parallel and the system choice is the strongest variable on screen. Calling them anything else would muddle the analysis, so:

- **System A — "Deep-space Google":** near-black navy gradient bg (`#0A1A2E → #0E2238` top, fading into `#11231C` murky green and `#3A1D24` warm red blooms), Google-logo crown, sans-serif headlines, neon-blue mono labels. Used for Google/Gemini/Anthropic news. (frames: 0HIf4AlajNY all, 6nVW14npcO4 all, eEy1oMeGfhQ all, jOorXKrbTHU all, o9MSAAXma-I last frames, rfzA7HWcpCQ all)
- **System B — "Editorial cream":** warm off-white bg (`#F0E8DD` ish) with hand-pattern wallpaper, serif italic headlines in terracotta, mono small caps. Used for op-ed / debate / tweet-reaction posts. (frames: DgDK5KWtJAw all, Jj3m_R2627Y all, dzn9KVVtZLc partial)
- **System C — "Storm dark":** near-black with translucent lightning-bolt pattern, orange accents, serif italic accents. Cameo template for dev-tooling shorts (fpNTqli9cs8).

The two main systems share **layout DNA** (1080×1920 safe frame, top-corner brand mark, bottom progress bar, card stacks) but their type/color worlds are nearly opposite. That duality is the headline finding.

---

## 1. Typography

### Typefaces in use
- **Headline sans (System A & some B):** A geometric humanist sans, likely **Inter** or **Manrope** at 800/900 weight. Tight tracking, very slight letter-rounding, "y" with curved tail (visible in "key" of "keynote"). Render is crisp at huge sizes (240–280 px in 1080-wide) without breakup.
- **Headline serif (System B):** A high-contrast didone/transitional serif — pronounced thick/thin axis, ball terminals, swashy italic ("Markdown", "Which side", "are you on?"). Reads as **Playfair Display** or **DM Serif Display** in Bold + Bold Italic. The italic does the heavy lifting in System B.
- **Mono label (both systems):** A grotesque mono with squared dots — likely **JetBrains Mono** or **IBM Plex Mono**. Used at very small caps (12–18 px) for labels like `WHERE IT SHIPS`, `MODEL`, `RUNS`, `SURFACE 1`, `RELEASE v2.1.145`, `ANTHROPIC · MAY 19, 2026`. Letter-spacing is huge — visually `200–300/1000` em — which gives the "telemetry HUD" feel.
- **Body sans (System A subtitles, card body):** Same sans as the headline, mid-weight 600. Drops to ~32 px for descriptions ("New agentic flagship", "Google's filmmaking tool").
- **Italic accent serif (System B inside headlines):** terracotta italic words ("back the bet.", "are you on?", "works.") — the italic is a different VOICE inside the same line, not just an emphasis weight.

### Weight & size hierarchy (relative, per scene)
Roughly four tiers, applied consistently across both systems:

| Tier | Role | Size (approx, 1080w) | Weight |
|------|------|----------------------|--------|
| H0 | Hero word ("$250", "25,000", "AGENTIC ERA") | 280–460 px | 800–900 |
| H1 | Headline ("Strongest agentic model yet", "The numbers back the bet.") | 110–150 px | 800 (sans) / 700 (serif) |
| H2 | Card title ("Gemini 3.5 Flash", "Subagents in parallel") | 56–72 px | 700 |
| Label | Mono small caps | 22–32 px | 400–500, +200 tracking |
| Body | Card body / subtitle | 36–48 px | 400–500 |

The ratio between H0 and Label is roughly **10–14×** — that's an aggressive scale and it's why the screens read as confident posters rather than slides.

### Letter-spacing
- **Mono labels:** very wide tracking, ~200/1000 em. Single most recognizable type tic.
- **Sans headlines:** tight, near 0 or -10/1000. Words feel locked.
- **Serif italic:** default tracking, lets the italic curve breathe.

### Line-height
- Sans headlines stack at ~1.0–1.05 line-height (very tight — "STRONGEST / AGENTIC / MODEL YET" almost touches). This is the Apple-keynote move.
- Serif italics also tight (~1.0). Editorial poster, not paragraph.
- Body card text: 1.2–1.3.

### Italic / roman mix
This is the cleverest type move. **Serif italic is reserved for the emotional payload word** — "back the bet", "are you on?", "works.", "one HTML file" — while the rest of the line is set in upright serif or sans. The italic literally voices the verb / question. Same trick appears in System A with color (see §2) but visually less elegant there.

### Anomalies / mis-hits
- `ANTHRPIC` (missing O) in jOorXKrbTHU frame 0 — appears intentional stylization (the backslash becomes a typographic glyph), but it reads as a typo on first scan. Risky.
- "Subagents in parallel" — the headline sans **clips into the right edge** on the 6nVW14npcO4 series; the card outline is hugging too tight.
- "5x Pro limits. 20TB. YouTube Premium." — wraps awkwardly with "Premium." alone on line 2. Could have shrunk one notch.
- System B sometimes leaves whole bottom half empty (DgDK5KWtJAw frame 4 "Which side / are you on?" — 60% of canvas is blank cream). Vertical balance suffers.
- The handwritten/hand-icon pattern in System B is barely-there (alpha ~0.08–0.12 over `#F0E8DD`); that's deliberate but it makes the cream look dirty rather than textured on lossy compression.

---

## 2. Color

### Background palettes (per system)

**System A — Deep-space Google (most common):**
- Base: `#0A1A2E` → `#0E2238` (deep navy) at top
- Mid bloom: `#11231C` muddy forest green center-low, `#3A1D24` dull red on right edge
- Confetti dots: Google primary set — `#4285F4` blue, `#EA4335` red, `#FBBC05` yellow, `#34A853` green — at varying sizes and opacities (40–100%), forming an ambient bokeh
- Top hairline progress bar: `#FFD83D` yellow
- Bottom hairline progress bar: `#4285F4` blue
- A faint inner "device frame" border (~`#1F3754` @ 30%) sits 24 px inside the safe area on most A scenes — gives the iPhone-mockup feel.

**System B — Editorial cream:**
- Base: `#F0E8DD` warm off-white / parchment
- Pattern: hand silhouettes + tetris-step shapes in `#D9CFC1` (parchment + 10% gray)
- Headline ink: `#2E2722` near-black for upright, `#C5523A` terracotta for italic accent
- Mono labels: `#B23A2A` slightly hotter terracotta
- Dark callout chip (Dario Amodei quote): `#1C1A17` espresso, with white text and `#E0B243` mustard label
- Number hero: `#C5523A` solid terracotta — same hue as the italic accents (intentional brand thread)

**System C — Storm dark:**
- Base: near `#0E0E10` to `#1A1614`
- Pattern: lightning bolts in `#2A2825` (subtle, almost black-on-black)
- Accent: `#F08054` warm orange (lightning bolt + label text + card outline)
- Headline: white + same `#F08054` for italic accent ("How it *works*.")

### Accent discipline
- **System A is over-served.** Each card uses a *different* Google brand color for its left bar and label — Gemini App is blue, AI Mode is red, Antigravity is yellow, Gemini Spark is green. Charming on a single screen, but across a video the eye never settles. There is no single "this video's accent" — the accent IS Google itself.
- **System B is disciplined.** One terracotta `#C5523A` does headline italic + numbers + chip outline + mono labels. One mustard `#E0B243` does the quote-label. That's it. Two accents total. Cleaner read.
- **System C is monk-mode.** One orange. Best contrast hierarchy of the three.

### Text color hierarchy
- **A:** White (#FFFFFF) for H0/H1, sky-blue `#7FB6FF` for mono labels, off-white `#CBD5E1` for body, Google-quartet for card labels. Four layers — too many.
- **B:** Espresso `#2E2722` for upright headline + body, terracotta `#C5523A` for italic accent + numbers, slightly darker mono terracotta `#B23A2A` for labels. Three layers — sings.
- **C:** White, orange, gray. Three layers.

### Contrast — wins
- System B headlines on cream: ~13:1 contrast, AAA.
- System A H0 white on navy: ~14:1, AAA.
- System C orange-on-near-black: ~7.5:1, AAA Large.

### Contrast — fails
- **System A "@DIYSMARTCODE" watermark in sky-blue** on top-right: roughly 4.2:1 on the navy where it sits but drops to ~2.8:1 over the red bloom. Borderline AA, sometimes worse.
- **System A green mono label** (`GEMINI SPARK`) on near-black at the small size used: ~3.1:1. Below AA for normal text — the green is doing brand-signal duty at the cost of legibility.
- **System B mustard `DARIO AMODEI` label on espresso chip:** ~5.5:1, OK, but the mustard is also a dot in System A — colors do cross between systems and the meaning drifts.
- **System B `FULL VIDEO Link in description` chip** in mono on cream: ~3.6:1 — readable but visually noisy because the chip is tiny.
- **System B underline strokes** (the short red dash under section labels): pure decoration, the dash itself fails contrast at small viewport.

### Brand vs decorative colors
- **Brand-load:** the Google-quartet (`#4285F4 / #EA4335 / #FBBC05 / #34A853`) is treated as the entire brand vocabulary in System A — wallpaper dots, card accents, logo, progress bars. There is no DIYSmartCode-owned color; the creator is borrowing Google's identity wholesale. Risky for long-term recognition.
- **Decorative:** the bokeh confetti is the only purely decorative element in A; it's earned because it matches the keynote-stage vibe of Google I/O. In B, the hand pattern is decorative and weak (low contrast, abstract icons that don't reinforce the message).
- **Brand thread that DOES belong to the creator:** the **mono label with extreme tracking** and the **night-blue thin device frame** — those two formal choices are consistent across A and C and could become the actual @DIYSmartCode signature.

---

## 3. Verdicts

### Top 3 TYPOGRAPHY lessons (apply to Armando Inteligencia)
1. **Italic-as-voice trick.** Set the headline in upright weight, then drop the verb/question/punchline into italic in a contrasting color. "Las apuestas / *suben otra vez*." reads as two distinct beats and works at 0.8 s scan time. Steal this.
2. **Mono small caps with `letter-spacing: 0.2em` as the signature label.** It's the cheapest typographic move in the deck and the most recognizable. Use for `EPISODIO 03`, `FUENTE @karpathy`, `SE LANZA HOY` labels — never for body.
3. **Four tiers, locked.** H0 hero (~12× label), H1 headline (~5×), H2 card title (~2.5×), label/body (~1×). Don't introduce a fifth size. The Apple-keynote line-height of 1.0 on H0/H1 is non-negotiable for the "poster, not slide" feel.

### Top 3 COLOR lessons
1. **Pick ONE accent per video and let labels carry the second.** System B (terracotta + mustard) outperforms System A (four Google colors competing) on every scene. Our brand has `#D4AF37` gold — use it as the sole emphasis, with `#1B3A6E` navy as the only ink-contrast.
2. **Never borrow a borrowed brand.** System A reads as a Google fan account because the entire palette IS Google's. Use brand colors of the *subject* only inside logos/quoted UI — keep your own bg and accent untouched.
3. **Test small mono labels for contrast.** Sky-blue mono on navy and small green mono on near-black both fail AA. If you use the mono-small-caps signature (lesson #2), keep its color near pure white or our gold against the navy bg.

### Font-stack recommendation (for our Remotion/Hyperframes templates)
```
--font-headline-sans: "Inter", "Manrope", system-ui, sans-serif;   /* 800/900 */
--font-headline-serif: "Playfair Display", "DM Serif Display", Georgia, serif;  /* 700 + 700 italic */
--font-mono-label: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;  /* 500, letter-spacing 0.2em, uppercase */
--font-body: "Inter", system-ui, sans-serif;  /* 500/600 */
```
We already standardize on Inter in `brand/config.json` — keep it for sans, add Playfair Display for italic accents, add JetBrains Mono for the small-caps labels. Three families is the ceiling.

### Palette verdict
- **Adopt System B's discipline, not its palette.** Our brand already has the equivalent restrained pair (`#1B3A6E` navy + `#D4AF37` gold + `#0F1B2D` deep navy). Treat gold as the sole accent the way DIYSmartCode treats terracotta: italic words, hero numbers, label outlines, that's it.
- **Steal System A's "device frame + confetti bokeh + top/bottom hairline progress bars" treatment** for background atmosphere, but recolor the bokeh to gold-on-navy (one hue at varying alpha) instead of Google-quartet. That kills the "fan account" smell while preserving the keynote energy.
- **Avoid System B's cream** — high recognition cost, low payoff for a tech-Spanish channel, and the hand pattern is barely-there on compression.
- **Adopt System C's monk-mode** as the rule for code/dev shorts: black bg + one accent + white. It's the cleanest of the three and translates directly to our brand if we swap orange for gold.

**One-line summary:** DIYSmartCode is a tale of two type systems and three color worlds — copy System B's *italic-as-voice* and *one-accent discipline*, copy System A's *poster-scale type ladder* and *mono-small-caps labels*, and ignore everything else.
