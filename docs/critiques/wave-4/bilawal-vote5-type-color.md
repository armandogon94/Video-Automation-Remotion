# @bilawal.ai — Vote 5: Typography + Color

**Scope:** TYPOGRAPHY and COLOR only. 23 frames sampled across all 7 reels in `references/creators/bilawal.ai/` (DW_0tFaj2lU, DWeLzV4hxsp, DWr9DkpDzsI, DWwOcLEOHXI, DXC96O6CPgC, DYGgyZJPG-M, DYh_jS_vM4L). Prior ANALYSIS.md intentionally not read.

---

## Typography inventory

### Typeface stack (observed)

| Layer | Typeface (best identification) | Weight | Use |
|---|---|---|---|
| Tweet quote header — "Bilawal Sidhu" | **Chirp** (X/Twitter's house sans) | 700 / bold | Display name |
| Tweet quote handle — "@bilawalsidhu" | Chirp | 400 regular, ~60% opacity grey | Secondary identity |
| Tweet body paragraph | Chirp regular | 400, roman | Hook/body copy |
| Burn-in subtitle captions ("SO A FEW WEEKS AGO,") | **Inter** or **SF Pro Display** | 800/900 ALL CAPS | CapCut-style talking-head captions |
| Dashboard chrome ("STRAIT OF HORMUZ / GOD'S EYE VIEW") | **JetBrains Mono / IBM Plex Mono** family | 500, tracked +80–120 | UI labels — data-tool aesthetic |
| Big dashboard numbers ($96.63, 142, 4,500,000) | Mono (same family) | 700 | Hero metrics |
| Wide-tracked titles ("STRAIT OF HORMUZ" overlay, "TEHRAN'S TOLLBOOTH") | Wide/extended mono (looks like **Eurostile/Bahnschrift Condensed Bold** or stretched mono) | 700, tracked +200 | Cinematic chapter cards |
| Outro CTA "WATCH FULL VIDEO HERE" | Inter/SF Pro | 800 ALL CAPS | End-card |
| Outro pill "IS IT OPEN?" on yellow chip | Same condensed bold | 800 black on yellow | Thumbnail-style hook |

### Weight ladder
Three weights total across the entire account: **400 (body)**, **700 (display names, big numbers, ALL CAPS captions)**, **800–900 (captions, CTAs, thumbnail pills)**. No light/thin weights observed. Italic appears **zero times** across 23 frames — fully roman, which keeps the "engineer documenting reality" tone.

### Sizes (approximate, 1080×1920 frame)
- Tweet body: ~52–58 px (3 line wrap at ~30 chars/line)
- Burn-in captions: ~70 px ALL CAPS
- Big number heroes ($96.63, "118"): ~120–160 px
- Dashboard chrome labels: ~22–28 px, heavily tracked
- Wide cinematic chapter titles ("STRAIT OF HORMUZ"): ~90 px with +200 tracking

### Letter-spacing / line-height
- Tweet body uses **default −10 to 0 tracking, ~1.25 line-height** — reads as a real screenshot.
- All UI/dashboard labels are **tracked +80 to +200** (mono with letter-spacing) — this is the entire visual signature of the data-dashboard look. Without the tracking, the same mono would feel ordinary.
- ALL-CAPS captions use **0 to +20 tracking** — tight enough to read fast on mobile.

### Anomalies / friction
- **DYGgyZJPG-M (UFO files)** breaks the system: body copy is centered, looks like **Inter Bold 700**, not the tweet template. This is the only non-tweet-quote hook in the set — feels off-brand because the rest of the account is rigidly tweet-quoted.
- The CapCut subtitles (DWr9DkpDzsI, DXC96O6CPgC, DYh_jS_vM4L) are clearly **stock CapCut "Squad" or "Komika" preset** — they don't match the dashboard mono and they don't match the tweet Chirp. There are effectively **three unrelated type systems** on the account.
- "GIFTS DELIEVVRED" typo visible in the UFO frame — AI-generated dashboard text not proofread.

---

## Color inventory

### Per-scene background palette

| Scene type | Background | Hex (approx) |
|---|---|---|
| Tweet-quote hook (default) | True black, full bleed top + bottom letterbox | `#000000` |
| Dashboard / map base | Near-black with faint grid | `#0A0A0C` → `#15171A` |
| Map landmass | Dark warm grey | `#1F1B17` |
| Dashboard card surfaces | Translucent black, slight blue tint | `#0F1419` @ ~70% opacity |
| Thermal sensor overlay (UFO) | Teal-cyan + lime gradient | `#2A6B7F` + `#A8D957` highlights |
| Night-vision overlay (UFO files) | Military green | `#5C7A4A` to `#3F5236` |
| Outro card | Black with subtle grid pattern | `#000000` over `#0A0A0A` mesh |

### Accent palette (used with extreme discipline)

| Hex | Role | Frequency |
|---|---|---|
| `#FFFFFF` | Primary text on black | every frame |
| `#7A8794` (~60% white) | Secondary text — @handle, metadata, dashboard subtitles | every dashboard frame |
| `#1D9BF0` | Twitter blue verified checkmark | every tweet hook |
| `#E0B96A` / `#D4A04E` | **Signature amber** — vessel trails, line charts, big-number positives | dashboard frames |
| `#7BD4D9` / `#5BC8D0` | **Signature cyan** — active selection, focus rings, "PLAYBACK" pill, chokepoint marker | dashboard frames |
| `#FF4D4D` | Negative deltas ("-92.2%"), red-zone overlays | sparingly, ~3 frames |
| `#9FE881` | Positive deltas (+1.98% DOD) | 1 frame |
| `#FFEB3B` | Yellow ALERT chip ("IS IT OPEN?"), pipeline routes | outro + map frame |

### Color hierarchy / discipline

The whole account runs on a **single 2-accent system: amber + cyan over true black**. Amber = "the thing happened" (vessel paths, oil prices). Cyan = "the system is watching" (focus rings, live indicators, chokepoint markers). Red is reserved for negative numbers and danger zones — never used decoratively. Yellow appears only on the outro CTA as a recognizable thumbnail device.

### Contrast wins
- White-on-black tweet text hits **21:1 contrast** — perfect on any phone.
- Amber `#E0B96A` on `#0A0A0C` ≈ **10.8:1** — well above WCAG AAA for large text.
- Cyan `#7BD4D9` on near-black ≈ **11.4:1** — excellent.
- ALL-CAPS captions are white with a faint dark drop-shadow against varied talking-head footage — readable in every frame sampled.

### Contrast fails
- Grey `@bilawalsidhu` handle (~`#7A8794` on `#000`) is `~5.3:1` — fine for body but used at small size on letterboxed frames where it competes with the tweet text. Not a fail, but the weakest link.
- Dashboard "DARK TRANSIT: LAYER OFF" mono label is `~3:1` — sub-WCAG-AA, deliberately ambient/secondary, fine for the data-tool aesthetic but unreadable while scrolling fast.
- Dashboard card body text (small mono inside the "OIL RISK MATRIX" card) is `~4:1` and effectively decorative — viewer is meant to read only the big number, not the rationale bullets.

### Brand vs decorative
Bilawal has **no logo, no name-tag, no watermark**. The brand IS the tweet-quote frame + amber/cyan dashboard. That's it. Every element on screen is content; nothing is decoration. The dashboard chrome (tracked mono labels, monospace numbers, sci-fi card chrome) does double duty as branding AND content — it tells you "I built this tool" without ever saying so.

---

## Top 3 typography lessons

1. **Three weights, no italics, ever.** 400 / 700 / 800. The restraint creates a coherent voice across screenshot, dashboard, and caption — and removes a thousand micro-decisions per video.
2. **Tracked mono IS the brand.** Letter-space mono labels by +80 to +200 and they instantly read "engineering tool / OSINT dashboard." Tighten the tracking and the same font reads "generic code editor." This single typographic move differentiates Bilawal from every other AI commentator.
3. **Tweet-quote frame as a typographic template, not a screenshot.** The header (`Chirp Bold + verified blue + grey handle + roman body`) is reproduced pixel-faithful in every hook frame. It borrows X's authority for free and signals "this is a real take, not a generated explainer" before a single word is read.

## Top 3 color lessons

1. **Two-accent discipline.** Amber + cyan + nothing else for content; red only for negatives; yellow only for the outro CTA. The viewer learns the color grammar in 3 seconds and reads charts faster on every subsequent slide.
2. **True black, not dark navy.** `#000000` everywhere (not `#0A0E1A`-ish OLED-black-with-tint). On phones this means the letterbox bars vanish into the device bezel and the tweet text/dashboard appear to float — a "screenshot taken from real life" feel.
3. **Contrast for the hero, ambient for the chrome.** Big numbers and titles hit 10:1+; the rationale text on cards is deliberately ~3–4:1 so the eye lands on the metric and treats the rest as "scientific texture." This is intentional hierarchy, not a contrast bug.

---

## Recommended font stack (for our Armando Inteligencia templates)

```css
/* TWEET-QUOTE HOOK template */
--font-tweet-display: "Chirp", "Inter", "SF Pro Display", system-ui;
--font-tweet-body:    "Chirp", "Inter", "SF Pro Text", system-ui;

/* DATA-DASHBOARD template */
--font-mono-dash:     "JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace;
--font-num-hero:      "JetBrains Mono", "IBM Plex Mono", ui-monospace; /* same family */
/* Apply letter-spacing: 0.08em on labels, 0.02em on numbers */

/* CINEMATIC CHAPTER TITLE */
--font-wide-title:    "Bahnschrift Condensed", "Eurostile Extended", "Inter", sans-serif;
/* font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase */

/* CAPCUT-STYLE CAPTIONS */
--font-caption:       "Inter", "SF Pro Display", system-ui;
/* font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em */
```

Weights to ship: **400 / 700 / 800** of Inter + **500 / 700** of JetBrains Mono. Skip light/thin/italic entirely.

## Palette verdict

**Adopt the two-accent system, swap the accents to match Armando Inteligencia brand.**

```css
/* base */
--bg-black:        #000000;            /* not navy — true black */
--surface-card:    rgba(15,20,25,0.7); /* translucent dark card */

/* text */
--text-primary:    #FFFFFF;            /* 21:1 on black */
--text-secondary:  #7A8794;            /* 5.3:1 — handle/meta */
--text-ambient:    #4A5560;            /* 3:1 — decorative chrome */

/* Bilawal's accents -> our brand */
--accent-warm:     #D4AF37;  /* our gold, replaces Bilawal's amber */
--accent-cool:     #6FB4E0;  /* lightened navy-cyan, replaces Bilawal's teal */
--negative:        #FF4D4D;  /* reserved for negative deltas only */
--positive:        #9FE881;  /* reserved for positive deltas only */
--alert-chip:      #FFEB3B;  /* outro CTA only */
```

Verdict: Bilawal's palette is **best-in-class for OSINT/data-storytelling content** and 90% portable to our brand. Replace amber with our `#D4AF37` gold and lighten the cyan to harmonize with our `#1B3A6E` navy. Keep the true-black background, keep the two-accent rule, keep red/yellow as reserved-meaning colors only. The single biggest risk in copying this account is over-using accents — Bilawal's amber appears in maybe 5% of pixels per frame, never as fill, only as data ink.
