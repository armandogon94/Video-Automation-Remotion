# @DIYSmartCode (YouTube Shorts) — visual + motion analysis

> **Scraped:** 2026-05-23 · 12 shorts · durations 93–178s (mostly 2-3 min).
> **Niche match:** STRONG — English-language Claude / Anthropic / Google AI content for builders. Different angle from Carlos (English not Spanish, US developer audience), but same niche.
> **Tooling guess:** Remotion or Hyperframes likely — high typographic precision, consistent template grammars, deterministic-looking entrances.

He's a peer creator running **at least 3 distinct templates** in active rotation. Like Carlos, he does NOT have one "house style" — he has a library and routes each video to the right shape.

---

## Template 1 — **DarkChangelog / Listicle counter**
*Example: `o9MSAAXma-I` ("Why You Should Update To Claude Code v2.1.145 Now")*

**Visual structure (top → bottom):**
- **Top brand bar:** product wordmark on left ("Claude Code" + star icon), release pill on right (`● RELEASE v2.1.145` with orange dot)
- **Top-left numbered counter:** huge sans-serif `03 / 06` (active step in green, total in muted)
- **Section label:** small tracking-spaced uppercase green sans (`BACKGROUND SESSIONS`)
- **Hero claim:** massive sans-serif bold heading with ONE word color-emphasized in the accent (`18 fixes. **Zero** state leaks on resume.`)
- **Body:** smaller sans body paragraph
- **Bottom attribution:** brand mark + GitHub link (`ANTHROPIC · github.com/anthropics/claude-code`)

**Color palette:** dark teal/charcoal bg with subtle hexagon-mesh + Anthropic green accent + white text.

**Maps to:** `Listicle5` (#5) — dark mode variant. Strong reference for our `DarkEditorial` palette mode.

---

## Template 2 — **HeroPricing / BigNumber on dark**
*Example: `dzn9KVVtZLc` ("ast grep - the missing layer")*

**Visual structure:**
- **Top breadcrumb:** small tracking-spaced uppercase accent with thin underline (`AST-GREP · SHORT`)
- **Section label:** uppercase tracking-spaced sans (`PER DEVELOPER · PER MONTH`)
- **HUGE numeric card:** rounded rectangle with thin orange border, holding a massive serif italic number with small `$` prefix (`$15` — number ~400pt, prefix ~80pt)
- **Explainer line:** serif italic body explaining the math
- **CTA pill bottom-left:** outlined rounded rect with mono text + arrow (`FULL long-form on this channel ↓`)
- **Background:** dark navy with very faint diagonal lightning-bolt watermark texture

**Color palette:** dark navy + warm orange accent (Anthropic-warm sibling tone).

**Maps to:** `BigNumberHero` (#2) — direct match. The "small breadcrumb + accent label + massive number card + body explainer + CTA" structure is the complete spec.

---

## Template 3 — **CreamEditorial with numbered items**
*Example: `Jj3m_R2627Y` ("Anthropic Just Hired The Biggest Name in AI")*

**Visual structure:**
- **Top breadcrumb:** uppercase tracking-spaced sans with thin warm-red underline (`ANTHROPIC · MAY 19, 2026`)
- **Hero headline:** serif (Tiempos/Recoleta-like) with one italic colored word (`Reports to **Nick Joseph.**`)
- **Numbered item card:** wide rounded white card on cream with: round warm-red `01` circle + bold sans title + serif italic gray sub
- **Bottom-right source attribution:** small bordered pill with mono text (`SOURCE @karpathy on X`)
- **Background:** cream paper with very faint icon pattern

**Color palette:** cream + warm-red accent + ink-black titles + muted gray sub.

**Maps to:** `TechNewsFlash9x16` hybrid with inline numbered item card — worth extracting the numbered-item device as a reusable component.

---

## Cross-template patterns (his "house grammar")

### Always-present elements (structural moat)
1. **Top breadcrumb / section label** — tracking-spaced uppercase sans with a thin underline. ALWAYS present. Establishes context in <1 second.
2. **One color-emphasized word per hero line** (italic or color swap). Marks the load-bearing word.
3. **Source attribution** in a bottom pill (mono font, bordered). Builds credibility.
4. **Subtle background pattern** (hexagons, lightning bolts, hands, puzzle pieces). Depth without noise.

### Typography system
- **Sans (Inter / Söhne)** for tracking-spaced labels and bold body
- **Serif italic (Tiempos / Recoleta)** for hero emphasis and supporting copy
- **Mono (JetBrains Mono)** for CTA pills, source attribution, metadata

### Color discipline
- **One accent per video** (green for changelog, orange for pricing, warm-red for editorial)
- Accent often matches the SUBJECT brand (Anthropic green for Claude content)
- Our brand-set already supports per-video `accentColor` override — we can dynamically tint when covering a known product

### Captions
- **NO burned-in captions** in most of his content. The hero text IS the message.
- Different decision from Carlos and from us — we burn (audience scrolls without sound). Document for future a/b.

---

## What we adopt (priorities for our 15-template build)

| Priority | DIYSmartCode pattern | Our slot | Action |
|---|---|---|---|
| 🔴 1 | Top breadcrumb / section label in EVERY template | New shared `<BrandBreadcrumb>` component | Build + require in every template layout |
| 🔴 1 | One color-emphasized word per hero line | `emphasizeWord?: string` prop on hero-bearing templates | Schema + render |
| 🟠 2 | Numbered item card (round number circle + title + italic sub) | New shared `<NumberedItemCard>` component | Build for use in Listicle5 + TechNewsFlash hybrids |
| 🟠 2 | Subtle background pattern texture | `backgroundPattern?: "hexagons" \| "bolts" \| "hands" \| null` on brand-set | Use SVG tile, low opacity |
| 🟢 3 | Bottom source attribution pill | New shared `<SourcePill>` component | Build; add to news templates |
| 🟢 3 | Subject-brand-tinted accent | Build a "tools palette" mapping (Claude=green, OpenAI=teal, Gemini=violet, etc.) | Lookup table in brand module |

---

## Sources

- Scraper command: `npm run scrape:shorts -- --url "https://www.youtube.com/@DIYSmartCode/shorts" --count 12`
- Videos: `references/creators/diysmartcode/<video_id>/video.mp4`
- Metadata: `<video_id>/metadata.json`
- Keyframes: `<video_id>/frames/frame-NN-tXX.XXs.jpg`
- YouTube channel: https://www.youtube.com/@DIYSmartCode/shorts
