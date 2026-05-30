# @DIYSmartCode — Vote 2: Visual Primitives Catalog

**Voter:** V2 of 5 — independent (no prior outputs read)
**Frames sampled:** 18 frames across 12 shortcodes (rfzA, -FNswl, -LxJJ, 0HIf4, 6nVW1, DgDK5, Jj3m_, dzn9K, eEy1o, fpNTq, jOorX, o9MSA)
**Scope:** Catalog every distinct visual primitive in the @DIYSmartCode reels corpus. Reusability scored 1 (one-off) → 5 (use in every video).

A meta-finding before the catalogue: @DIYSmartCode runs **per-subject themes**, not a single skin. I observed 5 distinct theme variants (Google-dark, Anthropic-dark/Claude Code, Anthropic-cream/serif editorial, AST-grep-orange-lightning, Stitch-by-Google) that share an underlying **template grammar**. The primitives below describe both the universal grammar AND the theme variants.

---

## 1. Logos & Identity Marks

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| L1 | Real-brand wordmark, top-center (Google multicolor) | rfzA-00, 6nVW1-00, 0HIf4-00, jOorX-00, o9MSA-00 | 5 | Recolored Google "G/o/o/g/l/e" letters; sets subject-anchor. Variant: Sundar/Stitch theme moves slightly. |
| L2 | "Claude Code" sparkle wordmark, top-left | -FNswl-00, -LxJJ-00, o9MSA-04 | 4 | Compass-rose orange asterisk + serif "Claude Code". Used as identity chrome across Anthropic-dark theme. |
| L3 | Custom abbreviation logo (SG / AST-GREP) | dzn9K-00, dzn9K-05 | 3 | Display-italic 2-letter mark + lightning glyph. Stands in for an oss-tool/brand. |
| L4 | Google I/O blob mark | rfzA-00, rfzA-04, 0HIf4-00, eEy1o-00 | 3 | Rainbow shape-cluster identifier reused for event-themed series. |
| L5 | Anthropic "ANTHROP\\C" stretched glyph (header) | fpNTq-02, fpNTq-04 | 3 | Bold custom letterspacing; centerpiece of the "compliance/security" sub-theme. |
| L6 | Wordmark inside a card/badge (Anthropic pill, .html pill) | Jj3m-02, DgDK5-02 | 3 | Tag/source attribution component pattern. |

---

## 2. Chrome (Persistent Frame Elements)

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| C1 | Top-progress thin bar (color matches theme, fills L→R) | 6nVW1-00, rfzA-04, eEy1o-02, o9MSA-00 | 5 | Always 1-2px, full-width, leftmost color = theme accent. Universal. |
| C2 | 1px rounded full-frame "card" border | rfzA-00, 6nVW1-00, 0HIf4-00, jOorX-00 | 5 | Tiny inset gives the whole frame a "card on stage" feel. Subtle, easy to miss but always present in dark themes. |
| C3 | Handle tag top-right (@GOOGLE / @DIYSMARTCODE / @SMARTCODE / @STITCHBYGOOGLE) | rfzA-00, 6nVW1-00, jOorX-00, eEy1o-02 | 5 | Letter-spaced uppercase, theme-accent color. Persistent. |
| C4 | Bottom step-tracker (5 nodes + labels: SETUP/CREATE/EVAL/DEPLOY/PUBLISH) | rfzA-02, rfzA-04, eEy1o-02 | 4 | Active node glows, label below in matching color. Theme-aware (HOOK/WHAT/UPGRADES/SHIP/YOU on Stitch theme). |
| C5 | Corner-bracket "viewfinder" frame (REC + timecode) | fpNTq-02, fpNTq-04 | 3 | Cinema-camera corner ticks, "● REC" + "00:34:00" timecode. Anthropic-compliance variant. |
| C6 | Slide-counter bottom-left "02 / 15" + dot-row bottom-right | fpNTq-02, fpNTq-04 | 3 | Fraction in monospace + progress dots. Pairs with C5. |
| C7 | Header strip top: BRAND · DATE / RELEASE vX.Y.Z | -FNswl-00, Jj3m-02, o9MSA-04 | 4 | "Claude Code"/"Anthropic" left, "● RELEASE v2.1.147" right with red status dot. |
| C8 | Footer attribution: "ANTHROP\\C · github.com/anthropics/claude-code" | -FNswl-00, -LxJJ-00, o9MSA-04 | 3 | Monospace, dim, bottom-center. Source-of-truth signal. |

---

## 3. Badges, Pills, and Tags

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| B1 | Solid pill, accent color, white uppercase label (API / EVENTS / ANTHROPIC) | fpNTq-02, Jj3m-02 | 5 | Most common badge. Two corner radii: full-round (Anthropic-cream) vs squared (dark themes). |
| B2 | Outlined pill with tiny accent label (TOOLS / MODEL / RUNS / MODE / 24/7 / UI) | rfzA-02, rfzA-04, 6nVW1-00, 0HIf4-02 | 5 | Left-aligned mini-label inside a thin-border outlined pill. The corpus's signature "spec sheet" component. |
| B3 | Numbered ranking badge (01, 02 on right side of pill) | fpNTq-02 | 3 | Monospace, accent color, right-edge of row. |
| B4 | Status pill (OK / READY / AVAILABLE / FLAG / INLINE / 600/min) | -LxJJ-00, fpNTq-04 | 4 | Small caps in tinted box; signals "live API/CLI state." |
| B5 | Filetype pill (.html, --comment, PR comments) | DgDK5-02, -LxJJ-00 | 3 | Monospace label inside thin outline; reads as a code token. |
| B6 | "FULL VIDEO Link in description" bottom CTA pill | DgDK5-02, DgDK5-04 | 4 | Recurring deep-link CTA on cream-theme videos. |
| B7 | Lozenge "vs." separator | Jj3m-02 | 2 | Pure typographic mark, italic serif. |
| B8 | Glowing rounded button (Subscribe →) | dzn9K-05 | 3 | Used on outro screens. Theme-accent outline + soft glow. |

---

## 4. Typography System

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| T1 | Headline sans, ultra-bold, 1-3 lines centered/left | rfzA-00, rfzA-04, 0HIf4-00, o9MSA-04 | 5 | The hero text style. Likely Inter/Pally Black or similar grotesk. Tight leading. |
| T2 | Headline serif (editorial), italic accent word in orange | DgDK5-04, Jj3m-02, dzn9K-05 | 4 | "Which side / **are you on?**" — Anthropic-cream theme. Mixes upright + italic for emphasis. |
| T3 | Eyebrow / kicker: tracked-out uppercase, small, accent-color | rfzA-02, 6nVW1-00, jOorX-00 | 5 | "SPARK CONNECTS" / "5 THINGS YOU GET" / "EDITING" / "THE RECEIPTS". Universal subject-line component. |
| T4 | Monospace body for code / labels (Berkeley Mono or JetBrains feel) | -LxJJ-00, fpNTq-04, dzn9K-05 | 5 | All terminal text, all small chrome labels, and CTA buttons. |
| T5 | Two-tone color-pop word inside headline (one word in accent color) | -LxJJ-00 ("comments" green), o9MSA-04 ("Zero" green), -FNswl-00 ("19" blue) | 5 | Single-word recoloring inside an otherwise-white headline is the #1 emphasis trick. |
| T6 | Massive numeral display (25,000 / $250 / 18) | DgDK5-02, 6nVW1-04 | 4 | Set in either serif (cream) or sans (dark); fills 50%+ of vertical space. |
| T7 | Body explainer 2-3 lines, ~40% headline size, dim white | -LxJJ-00, o9MSA-04 | 4 | Sits directly under headline, gives the "what changed" prose. |

---

## 5. Cards, Rows, and Containers

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| K1 | "Spec row" — outlined pill on left + multi-line text on right | rfzA-02, rfzA-04, 6nVW1-00, 0HIf4-02 | 5 | The corpus's signature info-row. Stackable. Left pill is theme-accent color. |
| K2 | Stacked spec-row table (2-4 rows, alternating accent pills) | rfzA-04, 6nVW1-04, fpNTq-02 | 5 | Stacks K1 vertically; sometimes a different color per row to teach hierarchy. |
| K3 | Full-bleed bordered card on accent-color border | Jj3m-02, DgDK5-02 | 4 | Cream-theme container; orange/red 1.5px border, slight inner shadow. |
| K4 | Terminal-window card (3 traffic-light dots + title + body) | fpNTq-04 | 3 | Mimics macOS terminal; multi-line shell session with status badges per line. |
| K5 | Tweet/embed card (avatar circle + handle + verified tick + body + meta) | Jj3m-00 | 2 | Faithful X/Twitter reproduction; full meta row (time, views, replies, RT, likes, bookmarks). |
| K6 | Image/screenshot inset (16:9 inside the 9:16 frame) | 6nVW1-04, jOorX-00 | 3 | Centered media block with rounded corners; product UI screenshots. |
| K7 | Two-column compare grid (TWO WAYS / SURGICAL placeholder cards) | eEy1o-02 | 3 | Side-by-side bordered cards with eyebrow labels; A/B comparison layout. |

---

## 6. Backgrounds (Per-Theme)

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| BG1 | Deep-navy radial gradient + multicolor particle bokeh (Google theme) | rfzA-*, 6nVW1-*, 0HIf4-*, jOorX-*, o9MSA-* | 5 | Cyan-top, red-middle, green-bottom soft glows + ~80 RGYB dots animating slowly. Most-used background. |
| BG2 | Black with floating Anthropic "puzzle/staircase" + "constellation" glyphs at 5% opacity | -FNswl-*, -LxJJ-*, o9MSA-*, fpNTq-* | 5 | Pattern tile of two glyphs at varied rotation, parallax-drifting. Universal Anthropic-theme bg. |
| BG3 | Cream/bone color (#F5EFE3) with same Anthropic glyphs in tan outline | DgDK5-*, Jj3m-* | 4 | The light-mode editorial inversion of BG2. |
| BG4 | Black with orange lightning-bolt tile (AST-grep theme) | dzn9K-* | 2 | Subject-specific; high-contrast, energetic. |
| BG5 | Vignetted dark corners (radial darkening) | every dark frame | 5 | Subtle but everywhere — keeps text legible at edges. |

---

## 7. Color Palette

| # | Token | Hex (eyeballed) | Where | Reuse |
|---|-------|-----------------|-------|-------|
| P1 | Background-dark | #0A1428 → #001218 | All dark themes | 5 |
| P2 | Background-cream | #F5EFE3 | Anthropic-light theme | 4 |
| P3 | Accent-blue (Google blue / Tools / Code) | #4A8CFF | rfzA, 6nVW1 | 5 |
| P4 | Accent-green (status / numbers / progress) | #2BC971 | rfzA-04, o9MSA-04, -LxJJ-00 | 5 |
| P5 | Accent-orange (Anthropic / AST-grep / serif italics) | #E8694A | -FNswl, DgDK5, dzn9K | 5 |
| P6 | Accent-purple (Anthropic-compliance accent / second-rank rows) | #A78CFB | fpNTq, o9MSA-extras | 3 |
| P7 | Accent-red (status dot, warn) | #FF5C5C | -FNswl-00 release dot | 3 |
| P8 | Accent-yellow (top progress, Gemini Omni) | #F2C94C | C1 left-edge, jOorX | 3 |
| P9 | White-primary text | #FFFFFF | All headlines | 5 |
| P10 | White-dim text (~70%) | #C9CFD8 | Body/subtitles | 5 |

The palette is deliberately **multi-accent**: any given video uses 1 dominant + 1-2 secondary accents tied to the subject brand (Google → all four logo colors; Anthropic → orange/green; AST-grep → orange-only).

---

## 8. Captions / On-Screen Text (Spoken-Audio Sync)

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| CAP1 | Per-slide static headline (no word-by-word burn-in captions visible) | All | 5 | @DIYSmartCode replaces TikTok-style captions with **slide-level typography**. The slides themselves ARE the captions. |
| CAP2 | Two-tone emphasis (T5) tied to spoken-stress moment | -LxJJ-00, o9MSA-04 | 5 | The recolored word is what's audibly emphasized — a manual proxy for word-burn-in. |
| CAP3 | Body explainer fades in after headline (T7) | -LxJJ-00, o9MSA-04 | 4 | Two-stage reveal: headline → details. |

---

## 9. Animation & Motion Primitives (inferred from keyframes)

| # | Primitive | Evidence | Reuse | Notes |
|---|-----------|----------|-------|-------|
| M1 | Top progress bar fills across entire reel | C1 in early vs late frames of same video | 5 | Linear, frame-locked. |
| M2 | Step-tracker node "hops" between SETUP→CREATE→EVAL→DEPLOY→PUBLISH | rfzA-02 vs rfzA-04 (DEPLOY active vs SETUP active) | 4 | Active node enlarges, glows, label brightens. |
| M3 | Headline word-stagger reveal (each word/line drops in) | implied by T1 multi-line headlines | 5 | Standard kinetic-type pattern; no on-screen evidence beyond consistency. |
| M4 | Pill/badge "pop in" with scale + opacity | implied by K1 stacks | 5 | Spec-rows almost certainly appear in sequence top→bottom. |
| M5 | Massive numeral count-up (25,000, $250) | DgDK5-02, 6nVW1-04 | 3 | Number rolls up to final value during voiceover beat. |
| M6 | Floating glyph parallax in BG2/BG3 | constellation/puzzle bg | 5 | Slow drift + slight rotation; ambient depth. |
| M7 | Particle drift in BG1 | RGYB dots | 5 | Slow upward float with hue shift. |
| M8 | Glow/pulse on active step-tracker node | rfzA-04 DEPLOY visibly glowing | 4 | Subtle radial pulse. |
| M9 | Horizontal bar-chart fill animation | o9MSA-04 (Personalized / UI / POWERED BY rows have varying widths suggesting reveal mid-fill) and explicitly o9MSA-extras with PowerShell/Background/MCP bars | 3 | Bars fill L→R with a duration tied to the spoken stat. |

---

## 10. Transitions (Between Slides)

| # | Primitive | Evidence | Reuse | Notes |
|---|-----------|----------|-------|-------|
| TR1 | Hard cut on beat (no crossfade) | rfzA-00 → rfzA-02 are completely different layouts | 5 | The dominant transition. Snappy, audio-synced. |
| TR2 | Step-tracker advance (single node hop) acts as a soft "scene change" within a theme | rfzA series | 4 | Visual continuity device that masks the hard cut. |
| TR3 | Background continuity (BG persists, FG content swaps) | all videos hold one BG per video | 5 | No video changes its background mid-video — strong identity anchor. |

---

## 11. Shot / Composition Patterns

| # | Primitive | Frames | Reuse | Notes |
|---|-----------|--------|-------|-------|
| S1 | Title slide: top-anchored wordmark → kicker → big headline → empty bottom half | rfzA-00, 0HIf4-00, 6nVW1-00 | 5 | Opening shot template. ~40-50% of canvas is intentionally empty (room for the kicker/animation to land). |
| S2 | Spec slide: wordmark + kicker + headline + K1/K2 stack | rfzA-02, rfzA-04, 6nVW1-00 | 5 | The "content" slide that does most of the educational work. |
| S3 | Receipt slide: huge numeral inside a bordered card with eyebrow + filetype pill | DgDK5-02, 6nVW1-04 | 4 | The "money-shot" stat reveal. |
| S4 | Embed slide: a single card (tweet/screenshot/terminal) centered with minimal chrome | Jj3m-00, fpNTq-04 | 4 | Source-quoting slide. |
| S5 | Logo-reveal slide: oversized brand mark + tagline (no body) | dzn9K-00 | 3 | Cold-open/CTA slide. |
| S6 | Webcam-overlay slide (face inset on themed background) | o9MSA-00 | 2 | Creator-on-camera; rare but used as variety. |
| S7 | Outro slide: subscribe button + CTA pill + closing prompt question | dzn9K-05 | 4 | Always has B6 ("FULL VIDEO Link in description"). |

---

## 12. Component Reusability Matrix Summary

Across 12 videos, the primitives that appear in **80%+ of frames sampled** are:

- BG1 or BG2 or BG3 (theme-keyed background)
- C1 (top progress bar)
- C2 (1px card border)
- C3 (handle top-right)
- L1/L2/L4 (subject wordmark top-center)
- T1 + T3 (headline + kicker pair)
- T5 (single-word color emphasis)
- BG5 (vignette)

These are the **non-negotiable spine**. Everything else (B-series badges, K-series cards, M-series motion) plugs into that spine.

---

## Top 10 Reusable Components — Build Priority

Prioritized for our Remotion/Hyperframes typology. 🔴 = build first (every video), 🟠 = build second (most videos), 🟢 = build third (variety pack).

### 🔴 RED — Build first (universal spine)
1. **`<ThemeBackground variant="dark|cream|orange">`** — implements BG1+BG5 / BG2+BG5 / BG3 / BG4. Single component, prop-driven. Without this, nothing else feels @DIYSmartCode.
2. **`<TopProgressBar accent={color} />`** — C1. Trivial CSS but essential identity signal; runs the full video length.
3. **`<HeaderChrome handle="@..." wordmark={node} />`** — combines L1/L2/L4 + C3 + C2 (the 1px card border). Sits at every video top.
4. **`<HeadlineEmphasis text="..." accentWord="..." accentColor="..." />`** — T1 + T5. The single most important content component because every video has 3-6 of these.
5. **`<SpecRow labelPill="TOOLS" body="..." labelColor="..." />`** — K1, the signature info row. Should accept stacking (K2) via flex children.

### 🟠 ORANGE — Build second (high-frequency, theme-specific)
6. **`<StepTracker steps={["SETUP","CREATE",...]} active={2} />`** — C4 + M2 + M8. Used in entire Google-theme series.
7. **`<EyebrowKicker text="..." color={accent} />`** — T3. Tiny but everywhere; should be its own component for consistency.
8. **`<HugeNumeral value={25000} prefix="$" />`** — T6 + M5 (count-up). The receipt/stat shot.

### 🟢 GREEN — Build third (variety pack)
9. **`<EmbedCard kind="tweet|terminal|screenshot" data={...} />`** — K4/K5/K6 unified container with three sub-renderers. Lets us drop in source-quoting slides without redesign.
10. **`<OutroCTA primary="Subscribe" secondary="Full video link in description" />`** — S7 + B6 + B8. Standardized closer so every video lands the same way.

---

**Final note:** the brilliance of @DIYSmartCode is that the **spec-row stack (K1/K2) carries 70% of the educational payload** in a tiny, repeatable component. If we build that one beautifully — outlined pill + body, theme-color-aware, stackable, with a clean reveal animation — we've matched the most distinctive thing about this creator's visual language.
