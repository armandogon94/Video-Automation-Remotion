# EditorBlock9x16 ↔ adamrosler

**Creator pattern (adamrosler dark procedural):** pure-black canvas, monospace everywhere, VS-Code-style editor mockups with Finder breadcrumb + traffic-light chrome, glow-rectangle highlight around the "active" line/element, tracked-uppercase colored section headers, gold/orange mono accents (`ERROR 2.69`, `step 2,907,583`, `> error signal traveling backwards`), occasional red `WRONG` inline labels. Source frames: `S5ZFkY756IY/_fresh/frame-026,030` (red-vs-green VS cards, code blocks), `7RhJawm2nw4/_fresh/frame-020,030` (editor-style annotated graphics, INPUT/OUTPUT corner labels, loss/training mono axis labels).

**Our 4 frames:** t=0.5 (labels only, window pre-entrance), t=1.5 / t=2.5 / t=3.5 (window sprung in; static after settle).

## Matches
- Dark canvas (brand deep-navy gradient — correct brand substitution for their pure black). ✓
- MacWindow editor chrome: traffic-light dots, title "Root.tsx", Finder breadcrumb `src › Root.tsx › Root.tsx`, line numbers, syntax highlighting. ✓ — directly mirrors adamrosler editor mockups.
- Gold glow-rectangle highlight around line 2 = their signature "callout chip around the active element". ✓
- Tracked-uppercase gold section labels ("REMOTION · SETUP" w/ underline, "EDITOR"). ✓ matches their colored all-caps headers (brand gold instead of red/blue).
- Monospace code body. ✓
- Entrance motion: section labels first, editor window springs up (translateY 22→0) ~0.5s later. ✓ matches their staged element entrance.

## Gaps
- Minor: cross-creator props `code` content renders a stray tofu/replacement glyph in `<Composition id=0□ />` (a missing-glyph in the seed content string, NOT in the composition). Cosmetic, content-layer (driver/props), not a signature-pattern defect. Left untouched per "differing copy is correct / don't edit content".
- adamrosler often pairs the editor with a red inline `WRONG` tag or a `> prompt` annotation line; ours uses the right-margin `sideAnnotation` slot (unused by the cross-creator seed). Capability exists in-comp; this is a content choice, not a structural gap.

## Score: 8/10 — VALIDATED
Faithful capture of the signature editor pattern (chrome, mono, glow-highlight, tracked headers, staged entrance). No clear/safe structural win; copy differences are correct by design. Left untouched.
