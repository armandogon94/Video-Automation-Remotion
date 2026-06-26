# Response to VISUAL-AUDIT-FROM-CODEX.md (2026-06-25)

Each Codex finding was independently ground-truthed (frames re-extracted + viewed) before
acting — Codex has false-positived before. Every flagged item was verified by a dedicated
verify-then-fix agent (8/8 confirmed real, 0 rejected for the ones we chose to action).

## FIXED (8) — confirmed real, patched, re-rendered

| Comp | Sev | Root cause → fix |
|---|---|---|
| BigNumberDuel9x16 | HIGH | The two value columns actually overlapped (−20px gutter) and the auto-fit measured only the bare number (ignoring the `$`), so wide `$`-figures never shrank → `$0.25`/`$3.72` merged. Fix: 120px center gutter, symmetric 460px columns, base 220→200, fitter counts full `$0.25` glyphs. Figures never touch now. |
| StudioCompositor16x9 | HIGH | Both the "UI mockup" focal element AND the PIP pointed at the square ARMANDO-INTELIGENCIA avatar, scaled to ~1100px → giant brand card, no compositor UI. Fix: reframed the mockup as a 1120×630 landscape window-chrome screen panel (traffic-lights + title bar, object-fit cover) + kept the corner PIP; added `screenLabel`. Reads as a studio compositor now. |
| VennDiagram9x16 | MED | Default r=280 group ran off the left edge and the `VELOCIDAD` label clipped left. Fix: r→235, group shifted up/in, bottom labels re-centered; all circles + labels inside the 56px safe area. |
| ForceGraph9x16 | MED | Edges were muted/near-background + 2px, invisible after downscale → looked like disconnected dots. Fix: edges → accent color, opacity 0.55, width 4; draw-on animation preserved → reads as a connected network. |
| TechNewsFlash9x16 | LOW | `TopProgressSweep` was pinned flush at top:0/left:0, reading as a clipped red tag. Fix: inset 18px to match the cosmic frame + rounded caps. |
| AbhiKineticSubtitle | MED | Source slams a big diagonal `OBSOLETE` stamp that overshoots then settles; ours only showed the settled state. Fix: added the big diagonal pop→settle. |
| AbhiScrambleOpener | MED | Lock icon was already present; the orbital/particle ring layer was genuinely missing. Fix: added the orbiting particle/ring system behind the scramble. |
| AbhiFeatureRows | MED | Our CTA chip popped at ~1.4s; source holds it past 4s. Fix: delayed the CTA until after the row cascade. |

## ACCEPTED — source-clip framing, NOT template defects (~12 ABHI rows)

Codex flagged these as "our render misses a second scene / intro / tail" or "ours ends at
5s but the source runs 6–10s": **AbhiTitleCard, AbhiBigStat, AbhiGridVsTerminal, AbhiNodeGraph,
AbhiBarChart, AbhiPhoneMockup, AbhiComparisonTable, AbhiChecklist, AbhiQuoteCard, AbhiLineChart,
AbhiCodeDiff, AbhiAppCard** (+ AbhiBrowserMockup LOW: one extra held frame).

This is the same mixed-reel reality already documented for cross-creator: the abhi
`source-scenes/<comp>.mp4` clips were cut generously and include adjacent beats (an intro
screenshot, a "Personal use only" tail, a MYTHOS outro, a count-up, a transcript UI, etc.).
**Our Abhi templates deliberately replicate ONE pattern each** — that is the whole replication
methodology. Bloating a single-pattern template with non-core scenes (or stretching its
duration to cover a tail it doesn't represent) would be *wrong*, not better.

The honest apples-to-apples improvement (deferred, optional) is to **trim each abhi
source-scene clip to the matching beat** so the gallery compares like-for-like — logged in
NEXT-STEPS, not auto-done (it changes the comparison baseline for 12 rows).

### AbhiWaveform (HIGH) — already addressed structurally
Source transitions waveform → transcript/timeline UI. We built that capability this session
(`AbhiWaveformTranscript9x16` + AbhiWaveform's `showTranscript` prop). The canonical
`AbhiWaveform` row stays pure-waveform by design; the transcript variant is registered + rendered.

### AbhiQuoteCard dimension note
Codex noted "source is 720×1280, ours 1080×1920" — our 1080×1920 export is correct (full-res
9:16); the source keyframes are simply lower-res. Not a defect.

## BY-DESIGN / low-priority
- **Listicle (MED)** — single item shown at 3.5s. The source pairing is already known-weak
  (simonhoiberg DPT3n_PgEiU is a LayerCardStack scene, flagged in SOURCE-VERIFICATION.md);
  the template's slower one-at-a-time pacing is a design choice. Left as-is.

## Verification
`npx tsc --noEmit` clean (0) after fixes; all 8 fixed comps re-rendered + re-QA'd; gallery
rebuilt. CROSS rows Codex marked OK (53) were left untouched.

---

# 3-way reviewer consolidation (Codex + Gemini Flash + Gemini Pro) — 2026-06-25

After the Codex fixes above, two more independent reviewers ran in parallel.

## Gemini 3.5 Flash (VISUAL-AUDIT-FROM-GEMINI-FLASH.md)
Reviewed a PRE-FIX snapshot (sampled while the Codex fixes were mid-render), so most of
its flags were already resolved — verified live in the current renders: AbhiKineticSubtitle
stamp present, AbhiScrambleOpener orbital ring + lock present, TechNewsFlash tag inset,
BigNumberDuel clean (Flash itself marked it clean, disagreeing with Codex). It surfaced
**3 genuinely-new/post-fix items — all confirmed + fixed + re-rendered:**
- **StudioCompositor16x9** — prior fix left the avatar inside the screen panel ("double
  avatar"); now renders a PROCEDURAL editor/dashboard mock (tool rail + canvas + properties
  panel + swatches), avatar only in the corner PIP. (verified)
- **ForceGraph9x16** — edges drew on too slowly (disconnected early); now fade in via opacity
  concurrent with nodes (0.45s, near-zero stagger). (verified)
- **Listicle** — stalled on item 1; now paces against actual durationInFrames so multiple
  items stack within the clip (3 items shown). (verified)

## Gemini 3.1 Pro (VISUAL-AUDIT-FROM-GEMINI-PRO.md) — UNRELIABLE for this task
Pro produced mostly confident false positives from two systematic errors:
1. **Ignored the intentional-placeholder/footage caveat** — flagged every footage-less render
   CRITICAL ("background video missing"): QuoteCard, BrandedOpener, TalkingHead, DiagramExplainer,
   VennDiagram, Listicle, SplitWebcamScreen, ModelComparison2x2Grid, etc. All by-design.
2. **Misread / mismatched source pairings** — many "complete mismatch / wrong reference /
   impossible to QA", plus a garbled summary table with HALLUCINATED comp names
   (KaraokeWithBotChipPullouts, BenchmarkBands16x9, LeanCardStack, TiltedDialerCard,
   NeuralNetworks9x16, ...). It even marked RankedTierList / BigNumberDuel / AnimatedCounter
   broken — both Codex and Flash marked those clean.
Its only plausible singletons were ground-truthed and REJECTED: AbhiTweetCard "glitched f0"
= normal empty pre-entrance frame; AbhiBarChart "massive orange glow" = a subtle intentional
highlight behind the winning bar. **Net new actionable findings from Pro: 0.**

## Outcome
3-way consensus confirms the library is clean after the Codex + Flash fix rounds: 11 real
visual fixes applied + verified (8 Codex + 3 Flash); the remaining ABHI flags are source-clip
framing (documented above); Pro added no real defects. tsc 0; gallery 59 pairings, refs resolve.
