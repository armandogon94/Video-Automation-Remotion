# Austin Marchese (@austin.marchese) — Animation Vocabulary (OPUS visual pass)

> **Verdict up front:** Opus **CONFIRMS** the Haiku/Codex conclusion — austin's motion
> system is a magenta/burgundy reskin of the nateherk/Anthropic-explainer grammar, and
> **every distinct animation family maps to an existing composition (COVERED or PARTIAL).**
> **No new-template gap is overturned at the template level.** What Opus adds is a sharper
> read on *why* two PARTIALs are only partial: they lean on a **lit 3D specular sphere**
> and a **dedicated glow-arc light-wipe transition** that are *craft primitives we do not
> own*, even though the *layouts* that host them are fully covered. Those are **component
> upgrades to existing templates, not net-new templates.**

Source: OPUS pass over the 489-moment corpus (29 flagged `beyond:true`). Inventory cross-checked
against `src/compositions/` (130 registered comps) on 2026-06-26.

---

## 1. Method / strictness

- 130 comps exist. The bar for **NEW** is strict: a layout/motion the repo cannot produce
  *even by reskinning an existing comp's palette*. Palette/accent-hue differences never count.
- I confirmed the load-bearing primitives by reading source, not by trusting the `maps` hints:
  - `AnimatedText9x16.tsx` has a real `scramble-decrypt` mode (mulberry32-seeded per-char,
    settles L→R over ~1.0s) → the per-glyph cipher subtitle is **genuinely COVERED**, not faked.
  - `backdrop-filter: blur()` frosted glass exists across ~12 components (Abhi templates,
    overlays, FauxProductUI, ModelNameChip) → the frosted "Prompt:" card material is COVERED.
  - **No `specular` / `terminator` / glossy-sphere primitive exists anywhere** → the lit 3D
    number-orb is a craft gap (PARTIAL on its host template).
  - **No dedicated arc/light-wipe transition primitive exists** (`grep` for arcSweep/lightWipe/
    swoosh = 0 hits) → the magenta glow-arc swoosh is a craft gap (PARTIAL on the divider template).

---

## 2. Distinct animation families (deduped) — see structured output for the table

The 29 `beyond:true` flags collapse into **5 recurring families**, all hosted on covered layouts:

1. **3D glossy number-orb / chapter-orb lockup** (MOVE 1-6, "1 Selecting", orb step-pills,
   central energy-orb hub, faceted crystal) — appears ~6 videos. The *only* thing the repo can't
   reproduce is the **lit sphere with real specular highlight + burgundy terminator + ambient
   spill**. The lockup layout (orb-left, title-right, tethered chip) = OpeningTitleCard /
   ConcentricHierarchyRadialCallout. **PARTIAL → craft upgrade, not a template.**

2. **Magenta glow-arc / light-streak swoosh transition** (E7RVKqyS recurring wipe, Step-#N arc,
   "Building Problem #N" arc, opening orbiting-chip montage) — ~7 videos. Repo has no arc-wipe
   primitive. Host layout (SectionDividerTitleCard / OpeningTitleCard) is covered.
   **PARTIAL → craft upgrade.**

3. **Frosted glass "Prompt:" card + glowing-border PIP** (every video) — fully **COVERED** by
   TitledDossierCard9x16 / TerminalCommand9x16 / SplitWebcamScreen9x16 + WebcamPipOverlay.
   backdrop-filter blur is already in the repo.

4. **Numbered-rail checklist w/ advancing play-head** (AnZ9HFuM9Ek, t9il, 5hq9, 8Z6p, 6ad) —
   ~8 videos. **COVERED** by StatCardSequenceWithUnderlines9x16 + BulletSequenceCounter (the
   hollow→solid node-fill + descending triangle pointer is exactly the stat-sequence molecule).

5. **Per-glyph scramble/cipher subtitle on chapter cards** (t9il, 5hq9 x25) — ~3 videos.
   **COVERED** — `AnimatedText9x16` scramble-decrypt mode is purpose-built for this.

The 460 `beyond:false` moments all map cleanly (kinetic macro type, accent-word second-read,
karaoke captions, pull-quotes, lower-thirds, bar charts, node graphs, before/after, outro CTA,
name tags, faux-UI, tweet cards, etc.) — see structured table.

---

## 3. Does Opus overturn the "0 new-template gaps" verdict?

**No.** `changes_zero_gaps_conclusion = false`.

Every distinct family resolves to COVERED or PARTIAL. The two PARTIALs (3D orb, glow-arc wipe)
are **missing craft primitives bolted onto templates we already own** — they do not require a new
composition, only a `LitSphereGlyph` atom and an `ArcLightWipe` transition atom that would slot
into OpeningTitleCard / SectionDividerTitleCard. That is the same conclusion Haiku and Codex
reached. Opus is *stricter about labeling them PARTIAL rather than COVERED*, but stricter ≠ a gap.

---

## 4. Opus vs Haiku — what this pass added

Haiku said "19 distinct, ALL COVERED/PARTIAL, 0 gaps." Opus confirms the count and the verdict
but **corrects two COVERED→PARTIAL downgrades** that Haiku waved through:

- The **lit 3D number-orb** is not "a glowing circle we already do" — I verified there is **no
  specular/3D-sphere primitive in the repo at all**. Haiku's mapping to ConcentricHierarchyRadial
  is layout-correct but materially under-sells it; it's PARTIAL, needs a new atom.
- The **glow-arc light-wipe** is the connective tissue of ~7 videos and the repo has **zero
  arc-wipe transition code** — Haiku treated the section-divider as fully covering it. PARTIAL.

Opus also corroborates that the **scramble subtitle is truly COVERED** (Haiku was right but for
the wrong reason — I confirmed the mulberry32 mode exists rather than assuming).

---

## 5. Craft details surfaced (independent corroboration of Codex 18 + additions)

I independently corroborate **all of Codex's 18** craft observations (two-stage glow-bloom-after-
settle, hand/finger occlusion of overlays = true layer keying, layer-independent easing across
glow/arc/type, clause-highlight second-read, ribbon/arc parallax independence, chassis-then-content
two-stage timing, feathered speaker-into-gradient matte, VO-gated list pacing, recolored-PIP-border-
per-scene, value-inversion whiteboard cards, semantic accent-hue breaks green/red, etc.).

**Additions Opus surfaces beyond Codex 18:**

- **Lit-sphere terminator shift on settle** — the orb's dark lower-edge terminator *moves* as it
  docks/overshoots, implying a real 3D light rig, not a static radial gradient. (No repo primitive.)
- **Tethered-chip parallax via connector-line + junction node** — the chapter chip rides a separate
  depth track from its orb, connected by a thin line ending in a glass square, so chip can drift
  independently. (Distinct from a grouped lockup.)
- **Content-sized card width animates to fit variable-length slugs** (`/internal-focus-group` vs
  `/web-scraper`) — the chassis is content-sized, not fixed-width.
- **Per-facet specular sweep on the crystal/gem bumper** — light travels facet-to-facet on rotate.
- **Acronym-anchored expand** ("SOP" → initials hold bright while full words grow rightward) — a
  reflow-as-transition distinct from plain typewriter.
- **State-change micro-interaction on outro** (SUBSCRIBE → SUBSCRIBED toggles live, not static).
- **Screen-replacement compositing tracked to a tilted laptop panel** (keystone + preserved glare) —
  graphic inherits room lighting; beyond a flat overlay.
- **Glow-bloom-on-settle on hero kinetic type** — letterforms "charge" (edges brighten) then cool,
  not a static drop-in.
- **Notification/badge overshoot-settle** on milestone cards (WINNER / 50K) for a celebratory punch.

None of these change the template count; they are the **fidelity backlog** for a future
`liquid-glass` component family (task #90).

---

## 6. Recommendation

Keep the conclusion: **0 net-new templates from austin.marchese.** Convert the two PARTIALs into a
small primitive backlog feeding existing templates:

- `LitSphereGlyph` atom (specular + terminator + ambient spill) → OpeningTitleCard /
  ConcentricHierarchyRadialCallout / SectionDividerTitleCard.
- `ArcLightWipe` / `GlowArcSweep` transition atom → SectionDividerTitleCard / OpeningTitleCard.
- Optional: content-sized-width flag on the card chassis; live state-toggle on OutroFollowCTA.

This is exactly the "consensus liquid-glass template family (austin + nate)" already queued as
pending task #90 — Opus confirms that's the right framing (component family, not new templates).
