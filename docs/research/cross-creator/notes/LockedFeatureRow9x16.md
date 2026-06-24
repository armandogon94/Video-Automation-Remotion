# LockedFeatureRow9x16 ↔ adamrosler

**Note:** Native template is DIYSmartCode V3 N20 (feature-gating row stack: lock/check/clock/flask icon + feature name + right-aligned colored state pill). Structurally this is a STRONG adamrosler match — adamrosler leans heavily on small colored status badges/chips (RO badges, neon labels) on thin dark cards.

**Creator pattern (adamrosler):** pure-black canvas, thin-stroked dark cards, mono everywhere, multi-hue colored status chips (red/green/blue/gold), gold mono accents. Source frames `S5ZFkY756IY/_fresh/frame-008` (RO badge grid in thin dark card), `frame-014` (PAGE FAULT red chip), `frame-030` (red-vs-green VS chips, PARENT blue pill).

## Before (cream default)
Rendered **cream** (`#FAF7F2` warm off-white): black ink names, colored pills sitting on a light card stack. Flat mismatch vs adamrosler's pure-black neon canvas, and — critically — the comp's **dark-only neon-glow pill treatment was dormant** (the `boxShadow: 0 0 0 1px ${pill}66, 0 2px 8px ${pill}44` glow only fires when `paletteMode === "dark"`, lines 273-277). Root cause: driver loads `{}` (no props json) → Root.tsx defaultProps `palette: "cream"`.

## Change (IMPROVED)
Added isolated cross-creator props json `docs/research/cross-creator/props/LockedFeatureRow9x16.json` → **`palette: "dark"`**, with the seed rows/labels/breadcrumb/timing copied verbatim from Root.tsx (so content + motion are byte-identical; only the register flips). `inputProps` override Root.tsx defaultProps for the cross-creator render only — Root.tsx, the comp, and `schemas.ts` are untouched. Typecheck clean; re-rendered 1/1.

## After (4-frame check)
- Pure navy-black canvas + grain vignette → adamrosler dark register, consistent w/ EditorBlock + IllustratedConcept(now-dark). ✓
- Gold "FEATURES · ROADMAP" eyebrow + underline + gold mono "FUNCIONES" → adamrosler gold-mono accent. ✓
- Rows now render as **thin dark tinted plates** (`rgba(255,255,255,0.03)` + hairline stroke) → adamrosler's thin-stroked dark cards. ✓
- **State pills now GLOW** — dark-palette neon `boxShadow` activated: mint check / gold PRO / indigo Q3 2026 / cyan BETA / red US ONLY each ringed + haloed → near-direct echo of adamrosler's colored status badges. White ink names, legible. ✓
- Staggered row entrance preserved (t=0.5 row 1 alone ghosting in; t=4.2 all 5 settled). ✓

## Score: 8.5/10 — IMPROVED (was ~4/10)
Register + neon-glow pill treatment now squarely in adamrosler's dark-status-badge grammar; structure (icon + label + colored mono pill on thin dark card) is one of the closest matches in the whole cluster. Residual: adamrosler's chips often carry tiny mono captions / connector lines we don't add — minor, out of scope.

**Edited files:** `docs/research/cross-creator/props/LockedFeatureRow9x16.json` (new). No comp/.tsx change. No shared-molecule changes.
