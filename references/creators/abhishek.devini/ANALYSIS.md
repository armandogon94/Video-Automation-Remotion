# abhishek.devini — ANALYSIS

**Added:** 2026-06-02 · **Reels analyzed:** 18 (frame-by-frame, 6 parallel agents) · **Source:** Instagram
**Full spec:** [`docs/research/abhishek/STYLE-SPEC.md`](../../../docs/research/abhishek/STYLE-SPEC.md) · raw per-agent: `docs/research/abhishek/raw-0..5.md` · machine list: `templates.json`

> Typography-driven AI/tech explainer reels. ONE design language, TWO background families. Every reel is a
> fast sequence of ~8–14 templated scenes. The single ACCENT color **tracks the topic's brand** (Anthropic/Claude
> orange most common; teal for OpenAI, pink for Stitch, gold for Stark, blue/gradient for the LIGHT-mesh reels).
> **This style closely matches our own typography/card/number system — high-value to replicate.**

## Background families
- **DARK** — warm near-black gradient (`#07040A`→`#13101A`) + faint warm square grid (~70px, ~8%) + a soft
  **radial accent glow** behind the hero text (breathes ±4% / ~30f) + edge vignette + parked mono bracket glyphs.
- **LIGHT** — pale lavender-grey mesh base (`#E5DFE8`) + 3–5 soft pastel blobs (peach/lavender/mint/amber, drifting)
  + floating frosted **rounded-square** tiles (slow parallax bob) + optional faint grid.

## Type system
- **Headline / big-stat** — Inter **Black (900)**, tight `-0.02em`, two-tone (one word recolored to accent), terminal period often accent.
- **Kicker** — JetBrains **Mono**, UPPERCASE, `0.18em` tracking, `● NN / WORD` pattern, accent dot.
- **Body / subtitle** — Inter SemiBold/Bold, kinetic word-by-word, accent word recolors on landing.
- **Terminal** — JetBrains Mono, green `$`/`✓`, grey log lines, traffic-light chrome.

## Motion conventions (frames @30fps)
Kicker drop-in 6f · headline word/line slide-up+blur-clear 6–8f (stagger 5–6f) · accent word tint-sweep L→R ~8f ·
mockup cards scale 0.94→1 + rise 8–12f · grids stagger-pop in reading order 4–6f (stagger 5–8f) · stat count-up
ease-out 14–54f w/ 1.06 overshoot · type-on ~1 char/2–3f + blinking caret · scenes hard-cut (not dissolve).

## Templates replicated (Phase 4) — 8 of 160 scenes
Built as `src/components/abhi/templates/*` over the shared `AbhiBackground`, hosted by `AbhiScene9x16`,
rendered via `runAbhiTemplates.ts`. Head-to-head vs source: **`ABHI-COMPARE.html`** (also `scripts/compare-frames.py`).

| Template | Component | Source ref |
|---|---|---|
| title-card-two-tone | `AbhiTitleCard` | DXpZf2ziBYP 2.2–5.5 |
| big-stat-number | `AbhiBigStat` | DXUhthziNCS 0–4.4 |
| terminal-mockup-card | `AbhiTerminalCard` | DXpZf2ziBYP 13.5–17 |
| feature-card-grid | `AbhiFeatureGrid` | DXpZf2ziBYP 17–21 |
| feature-rows-list | `AbhiFeatureRows` | DXhkSFiD8dL 22–30 |
| grid-vs-terminal | `AbhiGridVsTerminal` | DXpZf2ziBYP 72–86 |
| cta-comment-outro | `AbhiCtaComment` | DYukIE0PFac 50–53.8 |
| brand-lockup | `AbhiBrandLockup` | DXpZf2ziBYP 5.5–9.5 |

**Source reels kept** under `references/creators/abhishek.devini/*.mp4` (gitignored) for ongoing head-to-head;
do NOT delete until replication is signed off.
