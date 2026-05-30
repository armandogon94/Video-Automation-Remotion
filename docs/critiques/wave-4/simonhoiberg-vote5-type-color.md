# Simon Hoiberg — V5 Critique: TYPOGRAPHY + COLOR

**Voter:** Wave-4, Vote 5 (type + color only)
**Scope:** ~27 frames sampled across 11 reels (DBMBFjoCy1N, DM0MxiTOu-p, DMsj5dNPzK3, DN5lzNDjMkV, DNDqoVHRlsq, DNVjkdEsKAj, DNnr51Mqp75, DOdy8xIjH-A, DPBv4qMkmXE, DPT3n_PgEiU, DQWsK-UCnTq, DQb8u0vihLC).
**Methodology:** No prior ANALYSIS.md or sibling votes consulted. Conclusions drawn only from frame inspection.

---

## A. What Simon's videos actually look like (the surprise)

The first surprise: **most of Simon's footage carries NO on-screen text at all**. Easily 70%+ of the sampled frames are clean MCU/MS talking-head shots — no captions, no kickers, no lower-thirds. Type only appears when it must do work the spoken word can't (numbers, product UIs, taxonomies, screenshot pull-quotes). This is itself the dominant typographic decision: **restraint as identity**.

When type does appear, it falls into four buckets:

1. **Native UI screenshots** (Cursor pricing, Kling/Krea dashboard, FeedHive/Lovable, Gitea-style repo UI, Cursor blog post) — letting product chrome speak for itself, sometimes intentionally tilted/blurred (Cursor announcement frame at DOdy8xIjH-A frame-03, the pricing card at DNDqoVHRlsq frame-01).
2. **Handwritten "iPad whiteboard" frames** (DMsj5dNPzK3 frame-04, DNDqoVHRlsq frame-03) — black/red Procreate-style marker on a near-white paper background, lined up with the desk paper-and-stylus prop in his MCU shot. The diegetic match is the whole point.
3. **Custom overlay cards** (DPBv4qMkmXE frame-00/03 — the "Layer 1 / Layer 2 / Layer 3" stack) — white rounded pills with a sans-serif extra-bold black headline + a small purple pill kicker.
4. **B-roll of 3D motion graphics** (DM0MxiTOu-p frame-06 — isometric desk-with-robot scene rendered in a separate tool, no on-pixel type at all).

---

## B. Color verdict — palette per scene

### Brand accent — the purple
A single chromatic anchor recurs: **vivid purple, approximately `#5C2EE5` to `#6633FF`** (RGB rough sample: R≈92, G≈46, B≈229). It appears on:
- the laptop sticker / Sigma-style hexagonal logo in DBMBFjoCy1N frame-03,
- the "Layer N" kicker pills in DPBv4qMkmXE,
- the thin purple bezel/glow framing the 3D B-roll plate in DM0MxiTOu-p frame-06,
- the bottom-edge gradient of the Cursor pricing card (pink→purple→orange) — a happy coincidence that the product Simon screenshotted shares his accent.

This is the only saturated color in his palette. Everything else is grayscale or near-grayscale.

### Bg palette by scene type

| Scene | Background hex(es) | Notes |
|---|---|---|
| MCU desk (`DMsj5dNPzK3`, `DN5lzNDjMkV`, etc.) | Brick wall `~#B8B0AA` w/ cool window panes `~#2A3848`, fluorescent strip `~#E8E2D6` | Painter-knocked-down, never lit hot |
| MCU office (`DPBv4qMkmXE`) | Brick `~#C4BAB3`, neon strips `#FF4D2E` orange | The only scene with a competing warm accent — used sparingly |
| Cursor screen B-roll | Pure black `#000000` to `#0A0A0A` | Maximum contrast for white type |
| Whiteboard frames | Off-white `~#F1EDE8` (looks like real paper) | Warm-bias, NOT pure `#FFFFFF` |
| Cursor pricing card | Charcoal `#0F0F12` w/ a rainbow gradient bottom (#FF3D8A→#7B2EE5→#FF7A2E) | Borrowed, not Simon's |
| 3D B-roll | Cool gray `#3A3F47` floor, robot accent purple `#7656E8` | Matches the brand purple intentionally |

### Accent discipline (the lesson)
The purple is **never used as text fill** in custom overlays — it's the *container* (the kicker pill) and the text inside the pill is pure white. Black is reserved for primary text. White is reserved for type-on-product-screenshot or type-on-purple. This is a hard tri-color rule:

- **Black `#0A0A0A` → primary headline weight** (on white card)
- **White `#FFFFFF` → label/kicker text** (on purple pill, on black product UI)
- **Purple `#5C2EE5` → container fills + brand glyph only, never letterform fill**

### Text hierarchy / contrast
Where overlays exist, contrast is brutal — black-on-white at WCAG AAA for headline ("Vibe Coding"), white-on-purple at AAA for kicker ("Layer 1"). No mid-grays for body text, no decorative tints. The handwritten whiteboard scenes use the same logic: black ink does the words, red ink does the single emphasis arrow (DNDqoVHRlsq frame-03). One emphasis color per scene, never two.

---

## C. Typography verdict

### Identified typefaces
- **Overlay headline (Layer cards)**: a geometric sans, extra-bold weight, very slight roundness on the terminals — reads as **Inter Black** or **Plus Jakarta Sans ExtraBold**. Sharp horizontal flats on E/F, single-story `g`, double-story `a`. The `oding` in "Coding" gives it away vs. true Inter, which has a more open `g`.
- **Overlay kicker (Layer 1/2/3 pill)**: same family, **Bold** weight, smaller cap-height, slightly tighter tracking. Possibly the same font, simply one weight down.
- **Whiteboard handwriting**: Procreate marker brush, drawn live on iPad — not a font. The variability between letters ("Marketing" vs. "Ops/Automation") proves it's hand-drawn. The cap-O is closed and slightly squashed; the lowercase `t` has a slanted crossbar — classic Procreate "marker" preset.
- **Product UIs** are inherited (Cursor uses **Inter**; Lovable uses **Geist Sans**; Cursor blog uses **Söhne/Inter**) — Simon does not retype anything, he screenshots.

### Weights, sizing, letter-spacing
- "Layer 1" pill kicker: roughly 28–32px equivalent at 1080×1920 — small, tight tracking (~`-1%`).
- "Vibe Coding" headline: roughly 64–72px equivalent, weight 800–900, tracking near `0%`, line-height ~1.1 (single-line).
- Whiteboard "Marketing": ~110px equivalent in marker stroke, hand-drawn with natural rotation drift (~3–5°).
- The 3D B-roll has no type — letterforms appear only on the toy laptop screen as colored code lines (pure decoration).

### Italic / roman
**Zero italics observed** in any custom Simon overlay. All roman. The only italic glyphs in the entire sample are inside borrowed product screenshots.

### Line-height
Overlay cards use generous vertical padding inside the rounded rectangle (`~1.5×` cap height top/bottom) and single-line headlines. He avoids two-line headlines entirely in the sampled overlay frames — which prevents leading from becoming a design decision he has to make.

---

## D. Top 3 TYPOGRAPHY lessons

1. **Single-weight bombs over multi-weight hierarchies.** Simon's overlay system is two type sizes (big black headline + small white pill kicker) and one family. He never mixes a thin display font with a body font. Easier to template, harder to mess up, more graphic.
2. **One-line headlines only.** Every overlay text he uses fits on one line by design. This forces copywriting discipline — "Vibe Coding", not "What vibe coding actually means". For us: write the template's `text` field to fail loud (truncate visibly or throw) if the headline exceeds ~14 characters.
3. **Hand-drawn marker for explanatory diagrams beats any font.** The iPad-marker whiteboards (DMsj5dNPzK3, DNDqoVHRlsq) outperform any geometric-sans diagram for *educational warmth*. Worth building a `WhiteboardScene` template that uses an actual marker SVG stroke (or pre-recorded Procreate exports) instead of trying to make Inter look casual.

---

## E. Top 3 COLOR lessons

1. **One accent, used as container, never as text.** Simon's purple `#5C2EE5` is a *background fill* for kicker pills and brand glyphs — it is never the color of letterforms. Our pipeline currently risks coloring text in our brand gold `#D4AF37` directly, which forces us into contrast problems on light backgrounds. Promote the accent to "container only" by convention.
2. **Backgrounds in his MCU are intentionally muted (`#B8B0AA` brick, cool window) so the only saturated thing on screen is his eye color and the purple accent.** When we do MCU with our presenter, we should desaturate the b-roll plate to ≤30% so brand gold can pop without competing with a colorful set.
3. **The whiteboard scenes use warm off-white paper `#F1EDE8`, NOT pure `#FFFFFF`.** Pure white reads as a UI rectangle; off-white reads as a sheet of paper. Tiny difference, huge perceived warmth. Bake `--brand-paper: #F1EDE8` and a `--brand-ink: #0A0A0A` into the whiteboard template.

---

## F. Font-stack recommendation for Armando Inteligencia templates

Direct mimicry would compromise our brand, but the structural lesson transplants cleanly:

```css
/* Primary display — headline pills, kicker chips, big numbers */
font-family: "Inter", "Plus Jakarta Sans", -apple-system, system-ui, sans-serif;
font-weight: 900;       /* black for headlines */
font-weight: 700;       /* bold for kickers */
letter-spacing: -0.01em;
line-height: 1.05;

/* Whiteboard / explanatory diagrams — only when hand-drawn aesthetic is wanted */
font-family: "Caveat", "Permanent Marker", "Patrick Hand", cursive;
font-weight: 600;
/* But prefer actual SVG marker strokes — fonts read fake at this size. */

/* Body / captions — already on Inter in brand config; keep it */
font-family: "Inter", system-ui, sans-serif;
font-weight: 500;
```

We already standardize on Inter per `brand/config.json` — Simon's lesson reinforces sticking with it and adding `font-weight: 900` to the design tokens (we currently top out at 800 in some templates).

---

## G. Palette verdict

**Adopt Simon's accent-discipline rule, not his palette.** Our brand is navy `#1B3A6E` + gold `#D4AF37` + deep navy `#0F1B2D` — that stays. But we should:

1. Make gold a **container fill** (pill backgrounds, button fills, watermark plate), not a text color.
2. Make navy + deep navy the **text colors** (navy for primary on light, white for primary on deep navy).
3. Add an off-white paper token `#F1EDE8` for any "notes / whiteboard / handwriting" scene.
4. Desaturate B-roll plates to ≤30% saturation before compositing — Simon's brick wall does this naturally; our generated B-roll often doesn't.

The single-accent + tri-tone-text rule is what makes Simon's overlays read as one brand across vastly different reels. We can copy the *rule* without copying the *colors*.

---

## H. What I'm NOT confident about

- Exact hex of the purple — sampled visually, not pixel-eyedropped. Range `#5B2EE5` ↔ `#6B36FF` is plausible.
- Whether the Layer-pill font is Inter Black or Plus Jakarta Sans ExtraBold — they look near-identical at this size and JPG compression eats the diagnostic glyphs. Either substitute works.
- The "marker" handwriting is *probably* Procreate's default marker but could be a custom brush. Either way, an SVG stroke beats trying to font-match it.
