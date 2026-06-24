# TitleCardKineticTwoLine16x9 ↔ sahilbloom

**Pass:** deep cross-creator adversarial QA (sahilbloom-kinetic-broll cluster)
**Date:** 2026-06-04

## Creator signature (sahilbloom)
sahilbloom runs TWO title registers, both editorial-restrained:
- **Light kinetic-word title** (`fresh-kinetic-word-title-This.jpg`): deep blue/navy word
  ("This") on a pale cream/blue-white field (bg RGB ~232,240,243). Heavy sans, left-set,
  one word at a time — word-by-word kinetic reveal.
- **Dark glow card** (`anim-01-dense-001.jpg`, "Advice Nº15"): WHITE centered text on a
  dark card with blue radial glow halos, framed inside a faked browser chrome. Single-beat
  reveal (NOT word-by-word).

## Our version (TitleCardKineticTwoLine16x9.mp4)
Frames @ 0.4/1.8/3.2/4.6s. This template is — per its own docstring — **Nate B Jones
consensus pattern H1**, a dark-slate section-divider title. It is cross-compared against
sahilbloom here, not built from it.
- Dark-slate gradient bg (`#0A0F1A`) + soft cyan radial glow halo behind the type.
- Centered stack: tracked uppercase kicker ("BENCHMARK BREAKDOWN", blue) → heavy bold
  white hero ("Gemini 3.2 Flash", 140px) → muted-gray subtitle.
- Top-left breadcrumb ("GOOGLE · I/O 2026 · FILTRACIÓN", blue, underlined).
- Motion: blurInFocus fade-in (12f) → hold static (60f) → fade-out (12f). After ~84f the
  hero stack clears (frames 3 & 4 blank except the persistent breadcrumb) — this is the
  intended H1 section-divider behaviour (the slot where the talking head returns); native
  duration is trimmed to audio by calculateMetadata, the blank tail only shows because the
  standalone comparison clip has no audio and runs the full 150f cap.

## Compare (skeptic)
- **Layout / hierarchy:** strong match — centered kicker→hero→subtitle editorial stack,
  exactly sahilbloom's register. ✓
- **Palette discipline:** match — single blue accent (kicker + glow + breadcrumb), white
  hero, muted subtitle. Restrained, no second accent. Our dark+blue-glow reads as a direct
  sibling of sahilbloom's dark "Advice Nº15" glow card. ✓
- **Typography:** match — heavy sans hero, tracked uppercase mono kicker. ✓
- **Motion:** DIVERGES — ours is single-beat fade/hold; sahilbloom's *light* title is
  word-by-word kinetic. BUT sahilbloom's *dark* card is also single-beat, so the divergence
  only applies to one of his two registers, and single-beat is this template's defining
  identity ("the key difference from KineticTypoCard" per docstring).

## Decision: **VALIDATE** — 7/10
Faithful capture of an editorial title-card signature (centered single-accent hierarchy,
heavy sans, glow-halo depth mirroring sahilbloom's dark glow card). The lone gap
(single-beat vs word-by-word) is an intentional template-identity choice owned by the
natebjones H1 lane; converting it to per-word reveal would rewrite the core motion grammar
and break the template's real purpose — fails the minimal/high-confidence bar. Differing
copy/brand (navy+gold, Spanish breadcrumb) is correct per brief. Left untouched.

## Recommended (NOT made — out of scope / shared)
- None for this comp. (The blank back-half is by-design; no shared-molecule issue observed.)
