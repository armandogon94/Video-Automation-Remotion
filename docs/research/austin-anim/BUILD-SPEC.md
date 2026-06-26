# Liquid-Glass Atom Family — BUILD SPEC (austin.marchese + nateherk)

> **Status:** STAGED — pending (a) user's Gemini/Antigravity pass folded in, (b) user greenlight.
> **Triangulation:** ✅ Reviewer #1 — **RE-RUN ON OPUS** (`MY-CATALOG-OPUS.md`), now authoritative;
> confirms **0 new-template gaps** (does NOT overturn the verdict) but stricter than the Haiku pass:
> downgraded 2 families COVERED→PARTIAL, surfaced **2 source-verified NET-NEW atom primitives**
> (`LitSphereGlyph`, `ArcLightWipe`), corrected 1 build item (scramble is already COVERED), and
> corroborated all of Codex's 18 craft details +~10 more. ✅ Reviewer #2 (Codex xhigh, 29/29) agrees.
> ⏳ Reviewer #3 (Gemini Flash) pending. Sources: `MY-CATALOG-OPUS.md`,
> `references/creators/austin.marchese/ANALYSIS.md`, `CODEX-CONSENSUS.md`, `ANALYSIS-FROM-CODEX-*.md`.

## Verdict driving this spec
Both reviewers: **austin = nateherk's liquid-glass design system, RESKINNED** — 100% motion overlap,
0% color overlap (austin warm burgundy/magenta/orange/gold; nate cool cyan/teal). **0 genuine
new-TEMPLATE gaps** — our 130 comps already cover every layout/mechanic. The real, additive output of
studying both creators is a **reusable ATOM/material layer** that encodes the signature *craft* (the
glow-bloom, the second-read highlight, the layer independence) so we can apply the look to existing
comps — NOT a pile of duplicate templates (building those would be wrong, per adversarial verify).

All atoms rebrand austin's warm palette to **our brand**: navy `#1B3A6E`, gold `#D4AF37`,
deep-navy `#0F1B2D`, cream `#FAF7F2`, Inter. A `warm` variant (burgundy `#B85C4B` / magenta `#D4477F`
/ gold) is retained as an optional theme for parity studies. 30fps. 9x16 + 16x9.

---

## P0 — core signature, fully corroborated, low-risk (build first)

### 1. `liquidGlass` material tokens + helper (foundation)
A shared style helper (NOT a comp) consumed by every atom below.
- **Material:** translucent fill `rgba(navy, 0.15)`, 2px glowing border, drop shadow, 16–20px radius.
- **Themes:** `brand` (navy/gold) default; `warm` (burgundy/magenta/gold) optional.
- **API:** `glassCard({ theme, glowColor, radius, borderWidth }) => CSSProperties` + a `<GlassCard>`
  wrapper. Lives in `src/components/liquidglass/` (new folder).

### 2. `GlowPulseOverlay` atom  — Codex's signature craft
Wrap ANY element with the signature **two-stage** glow. (My verify left this PARTIAL/unverified; Codex
confirms it as the most frequent component-agnostic effect, 14+ videos.)
- **Motion (Codex-exact):** border settles crisp first (frames **0–12, ease-out**), THEN glow blooms
  **independently** (frames **16–22, ease-in-out**) — a 2–4 frame gap creates the "powered-on" feel.
  Optional continuous pulse afterward: opacity `1 → 0.4 → 1`, ~**1.5s** cycle. Border and glow are
  **separate interpolations with separate easing** (do NOT animate them together).
- **Props (Zod, all `.default()`):** `children`, `color=#D4AF37`, `settleFrames=12`,
  `bloomDelayFrames=16`, `bloomFrames=6`, `glowSigma=18`, `pulse=true`, `pulsePeriodFrames=45`,
  `borderWidth=2`.

### 3. `FloatingCaption` enhancement (existing component — backward-compatible)
Add OPTIONAL props (defaults preserve current behavior; 73+ consumers unaffected):
- `glowColor?` (themed glow instead of fixed black text-shadow), `rotationDegrees?` (subtle tilt),
  `animationType?: 'fade' | 'blur-resolve' | 'rise'` (Codex: blur-to-sharp resolve is the missing one).

---

## P1 — signature teaching modules (higher value, some judgment)

### 4. `PromptCardPedagogy{9x16,16x9}`  — Codex's #1 most-replicable (11+ videos)
austin's signature teaching module. Composite atom (uses a portrait PIP + a prompt/code card).
- **Layout:** prompt/code card left-or-center; portrait PIP right with rose/themed border.
- **Motion (Codex-exact):** card enters first; **PIP lands 6–10 frames AFTER** the card (eyes read
  card, then see presenter — extend delay to ~12f for dense 300+ char text). Then **ClauseHighlight**
  sweeps as a second-read layer. PIP border uses `GlowPulseOverlay` (delayed bloom).
- **Props:** `promptText/lines`, `presenterSrc` (image/PIP), `pipBorderColor`, `pipDelayFrames=8`,
  `highlights[]` (phrase ranges), `theme`.

### 5. `ClauseHighlightPhrase` atom
Magenta/gold **phrase-length** (8–16 words, semantic phrases — NOT full line/width) rounded highlight
bars over any text block. Sweep **L→R**, arrive **6–10 frames AFTER** the text lands (the "second-read"
beat). Reusable over captions, prompt cards, lists.
- **Props:** `text`, `phrases[] {start,end}`, `highlightColor`, `sweepFrames=8`, `secondReadDelay=8`,
  `barRadius`, `direction='ltr'`.

### 6. `LitSphereGlyph` atom  — **OPUS-VERIFIED NET-NEW primitive** (no specular/sphere code in repo)
The signature lit 3D specular orb (number-orb / chapter-orb lockups, "MOVE-orb"). Opus grepped `src/`
and confirmed **no specular / terminator / glossy-sphere primitive exists** — `ConcentricHierarchyRadialCallout`
gets the *layout* right but materially under-sells the lit-sphere material, so it's a real atom gap.
- **Motion (Opus craft):** orb docks/overshoots and its specular **terminator SHIFTS with the motion**
  (a real light rig, not a static radial gradient). Crystal variant: per-facet specular sweep on rotate.
  Optional tethered chapter-chip on a **separate depth/parallax track** via a thin connector → glass-square junction.
- **Props:** `glyph`/`number`, `radius`, `lightAngle`, `specularColor`, `bodyColor=#1B3A6E`,
  `dockOvershoot`, `facetMode=false`, `theme`.

### 7. `ArcLightWipe` transition atom  — **OPUS-VERIFIED NET-NEW** (grep arcSweep/lightWipe/swoosh = 0)
The magenta glow-arc / light-streak swoosh that wipes between ~7 videos' section cards — the connective
tissue. Repo has **zero** arc-wipe/light-streak transition code (currently only fakeable as a static gradient).
- **Motion:** an animated independent-layer arc/streak sweeps across to wipe scenes; own easing curve,
  glow bloom, motion blur. Rebrand to gold `#D4AF37` / cream streak.
- **Props:** `color`, `arcRadius`, `sweepFrames`, `streakWidth`, `glowSigma`, `direction`.

---

## P2 — niche / partially covered (build only if Gemini/usage justifies; several are EXTEND-existing)

| Atom | Note / overlap with existing |
|---|---|
| `RibbonParallax` atom | Independent drifting warm-gradient bg (0.5–2px/f, own easing, blur σ, opacity). "Alive" bg under static text. Net-new, cheap. |
| `SoftDepthFieldVignette` atom | Blur 6–8σ + darken 20–30% one side of footage for list overlay (vs hard card border; lets gesture point into overlay). Pairs with our matte layer. |
| ~~`ScrambleResolveText` atom~~ | **DROP — COVERED.** Opus verified in source: `AnimatedText9x16` already has a real mulberry32 scramble-decrypt mode. No build needed. |
| `ConnectorDrawTrim` atom | SVG path draw-on (stroke-dashoffset 0→1, linear, 8f) BEFORE child labels pop. ⚠️ overlaps `PipelineFlow`/`DiagramExplainer` connectors — extract as shared util. |
| `TerminalChapterShell` | Retro terminal chapter frame (orange/red 2px border, monospace top rail, left sidebar, Claude-Code brand). ⚠️ EXTEND `TerminalBlock` as a repeating chapter shell. |
| `CorridorMascotAnchor` | Coral pixel mascot (pop 100–108% + glow). austin-specific; OUR equivalent = existing avatar-pixar watermark. Likely SKIP (we already have a brand mascot). |

---

## Craft appendix — Codex's 18 subtle-motion details every atom must honor
(The real value Codex added over the Haiku scan. Encode these as the motion defaults.)
1. **Glow-bloom two-stage:** border settle (0–12f) → glow bloom (16–22f), 2–4f gap. Independent easing.
2. **Hand occlusion draw-on:** hand enters before mark, covers during stroke-dashoffset draw, reveals after (naturalistic write-on). [for whiteboard atoms]
3. **Border-pulse + glow-bloom = separate layers/curves** (border ease-out settle; glow ease-in-out bloom).
4. **Scramble→resolve:** glyph pool caps+digits+punct, 1–2 glyphs/frame, jittered, **final snap is instant**.
5. **Portrait-rail reading-pace anchor:** PIP lands 6–10f AFTER card; extend for dense text.
6. **Clause-highlight = phrase length** (8–16 words), semantic only, sweep L→R, +6–10f second-read.
7. **Soft depth-field vignette:** blur 6–8σ, darken 20–30%, preserves texture (not a hard border).
8. **Yellow micro-bullets** under red-numbered bullets, 12–20px indent (hierarchy w/o new card).
9. **Ribbon parallax independence:** 0.5–2px/f drift, own easing, separate from card motion.
10. **Scrambled-subtitle loading state:** wide letter-tracking / missing glyphs → resolves (playful, not glitch).
11. **Connector draw BEFORE labels:** paths trim 0→1 (linear, 8f), THEN child labels pop (ease-out, 16f).
12. **Mosaic cropped neighbors:** active card sharp/full; side cards 20–30% visible, blurred 4–6σ, dark 40%, scale 85–90%.
13. **Terminal-native chapter shell** repeats every chapter (in-product feel).
14. **Active-row brightening:** current row full bright + glow; prior rows 60–80% (progress/accumulation).
15. **Delayed rise-pop badges:** number badge pops (0.8→1.0, overshoot 1.1) **3f BEFORE** row text enters.
16. **VO gestural integration:** overlay labels appear in negative space 0–4f BEFORE the hand gesture arrives.
17. **Check-mark completion pulse:** final badge bounce 1.0→1.08→1.0 + glow 0→0.6→0 over 6f.
18. **Warm-gold halo for tier-top:** premium row gets gold `#D4AF37` glow + 2px outer halo, slower bloom (500ms vs 300ms).

### Opus pass additions (Reviewer #1, +10 beyond Codex's 18)
19. **Lit-sphere terminator shift:** the 3D number/chapter orb's specular terminator SHIFTS as it docks/overshoots — a real light rig, not a static radial gradient. (→ `LitSphereGlyph`)
20. **Tethered chip independent depth:** chapter chip rides a SEPARATE depth/parallax track from its orb via a thin connector ending in a glass-square junction.
21. **Content-sized card width:** chassis width ANIMATES to fit variable-length slugs (`/internal-focus-group` vs `/web-scraper`) — content-sized, not fixed-width.
22. **Per-facet crystal sweep:** specular highlight travels facet-to-facet across a gem/crystal bumper as it rotates.
23. **Acronym-anchored expand:** initials hold bright while full words grow rightward (`SOP` → Standard Operating Procedure) — reflow-as-transition, distinct from typewriter.
24. **Live state toggle outro:** `SUBSCRIBE → SUBSCRIBED` actually toggles (micro-interaction), not a static CTA.
25. **Laptop screen-replacement compositing:** graphic keystoned onto a tilted laptop panel with preserved screen glare so it inherits room lighting (beyond a flat overlay).
26. **Glow-bloom-on-settle hero type:** letterform edges brighten ("charge") then cool — not a static drop-in.
27. **Badge overshoot-settle:** milestone cards (WINNER / 50K Subscribers) pop with notification-style overshoot for celebratory punch.
28. **Frosted speech-bubble DOF bookends:** two oversized frosted-glass blobs blurred MORE than the pull-quote text → a 3-plane depth-of-field stack.

> **Material note (Opus, source-verified):** `backdrop-filter` frosted glass already exists in ~12 components, and
> `AnimatedText9x16` already has a mulberry32 scramble-decrypt mode. So the `liquidGlass` tokens (P0 #1) should
> WRAP/standardize the existing frosted-glass usage, not reinvent it; and `ScrambleResolveText` is dropped.

---

## Build order when greenlit
1. P0 #1–3 (foundation + GlowPulseOverlay + FloatingCaption props) → showcase comp → tsc → render QA.
2. P1 #4–5 (PromptCardPedagogy + ClauseHighlightPhrase) → render QA vs austin frames.
3. P2 case-by-case (most are EXTEND-existing, not new comps).
4. Register in `src/Root.tsx`, render, QA, update `ANALYSIS.md` + `CREATORS.md`, commit, merge.
Apply nate's cool-teal variant in the same pass (shared atoms, just a theme token) — closes the nate build too.
