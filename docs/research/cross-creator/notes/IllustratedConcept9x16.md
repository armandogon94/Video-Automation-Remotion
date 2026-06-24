# IllustratedConcept9x16 ↔ adamrosler

**Note on assignment:** This is a *Carlos T22* template (centered AI-illustration hero + serif-italic caption), parked in the adamrosler cluster as the closest available slot. adamrosler's signature is dark-procedural neon diagrams/cards on pure black — structurally different from a centered-illustration card. So a perfect match is impossible by template-shape; the judgeable axis is register + color discipline.

**Creator pattern (adamrosler):** pure-black canvas, mono everywhere, gold/orange mono accents, neon-stroke cards. Source frames `S5ZFkY756IY/_fresh/frame-008,014,022,026,030`, `7RhJawm2nw4/_fresh/frame-005,018,020,030`.

## Before (cream default)
Rendered in the Carlos-native **cream** register (warm off-white `#FAF7F2` paper, hairline diagonal-stripe placeholder, brick-red `#B33A2A` eyebrow/section label, black serif caption). Against pure-black neon references this was a flat palette/color-discipline mismatch — and off-register vs the sibling adamrosler clip EditorBlock9x16 (which renders dark navy). Root cause: driver loads `{}` for this comp (no props json existed) → `selectComposition` used Root.tsx defaultProps `palette: "cream"`.

## Change (IMPROVED)
Added isolated cross-creator props json `docs/research/cross-creator/props/IllustratedConcept9x16.json` setting **`palette: "dark"`** (Carlos cosmic-editorial: `#0A0F1A` navy-black paper, `#F2E9D8` warm-cream ink, `#D4A04A` amber accent), preserving the existing seed copy verbatim (`sectionLabel: "CONCEPTO"`, `captionLine: "una idea con forma"`, breadcrumb `Idea / Concept`). `inputProps` override Root.tsx defaultProps, so this flips the register for the cross-creator render ONLY — Root.tsx, the comp, and the template's native cream identity are all untouched. Typecheck clean (comp unchanged); re-rendered 1/1.

## After (4-frame check)
- Deep warm-navy-black canvas w/ grain vignette → now in adamrosler dark-canvas register, consistent with EditorBlock9x16. ✓
- Gold/amber eyebrow "IDEA · CONCEPT" + gold underline + gold mono "CONCEPTO" → mirrors adamrosler's gold-mono accent + colored mono headers. ✓
- Serif-italic "una idea con forma" warm-cream, fully legible on dark. ✓
- Motion intact: blur-in-focus image + Ken Burns; caption springs in ~0.75s after entry (absent at t=0.6, present at t=3.5). ✓

## Gaps (residual, structural — not fixed)
- Still a centered-illustration card shape, not a neon two-column/callout diagram — adamrosler's actual structures. This is inherent to the template; out of scope to restructure a Carlos template into an adamrosler one.
- Stripe placeholder is generic; with a real dark illustration asset it would read closer to adamrosler's glowing hero visuals.

## Score: 7/10 — IMPROVED (was ~4/10)
Register/color-discipline brought into the adamrosler dark world via an isolated props json; structural template-shape difference is inherent and left as-is.

**Edited files:** `docs/research/cross-creator/props/IllustratedConcept9x16.json` (new). No comp/.tsx change. No shared-molecule changes.
