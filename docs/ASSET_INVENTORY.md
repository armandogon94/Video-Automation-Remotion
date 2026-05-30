# Asset Inventory — Armando Inteligencia Video Factory

> Last updated: 2026-05-18 · Sources scanned: `~/Downloads`, `17-Instagram-Slides`, this project's `brand/`.
> Discovered during the W21 video-quality overhaul. **Read this before designing new templates** — most things you'd otherwise generate already exist.

---

## 1. Sub-brand identities — four, not one

The channel ladders into FOUR brand identities. Each has its own logo set. Templates should pick the right identity per video:

| Brand | When to use | Asset folder |
|---|---|---|
| **Armando Inteligencia** (main) | Default — Spanish AI/tech content for founders | `~/Downloads/Armando Inteligencia/Logos Armando Inteligencia y 305 AI/Logos Finales/Armando Inteligencia *.png` |
| **305 AI** | Agency / consulting work, B2B context | Same folder, `305 AI Logo *.png` (4 variants: Icon, Side by Side, Text, Top Bottom) |
| **AI Leadership Lab** | Executive education content, longer-form | Same folder, `AI Leadership Lab *.png` (4 variants) |
| **IA Ejecutiva 90** | Cohort program promo / curriculum content | Same folder, `IA Ejecutiva 90 *.png` (8 variants total — Icon, Texto, Completo, w/ alternates) |

**Implication for templates:** the brand prop must support all four; default is Armando Inteligencia.

## 2. Logo & avatar inventory (Armando Inteligencia, main brand)

Already imported into this project at `brand/logos/`:
- `avatar-pixar.png` — Pixar-style avatar, transparent
- `avatar-pixar-letras.png` — Avatar + brand wordmark
- `logo-completo.png` — Full logo lockup
- `logo-lentes.png` — Glasses-only icon mark
- `logo-letras.png` — Wordmark only

Additional variants in project 17 (`17-Instagram-Slides/brand/avatar/`) — **not yet imported here**:
- `armando-avatar-pixar-transparent.png` (cleaner rename of the same)
- `armando-avatar-pixar-with-text.png`
- `armando-avatar-solo.png` — **NEW variant — avatar without background, useful for floating watermark / picture-in-picture**

**Action:** copy `armando-avatar-solo.png` into `brand/logos/`.

## 3. Real Armando face footage — for face-cam / mixed-mode templates

Three real Instagram-Reel-style clips of Armando talking, in `17-Instagram-Slides/references/armando-face/`:

| File | Resolution | Duration | Use |
|---|---|---|---|
| `DTqE-tgDSzy.mp4` | 720×1280 | 70.6 s | Could intercut as B-roll, or use a keyframe as a still |
| `DVtjqDuDUF0.mp4` | **1080×1920** | 77.9 s | **Highest quality — primary face-cam reference** |
| `DVwNXi2ET5V.mp4` | 720×1280 | 65.8 s | Third option |

Plus `references/armando-face/contact-sheets/` and `references/armando-face/keyframes/` — Claude vision can analyze his lighting, framing, expressions for templates that need face-cam matching.

**Templates that benefit:** any template wanting a 3–5s real-face intro/outro to humanize an otherwise text-only video. Or a templates that runs the face video as a B-roll background under a translucent caption.

## 4. B-roll archive — `~/Downloads/Armando Inteligencia Media/`

Two sizable folders of ready-to-use video assets:

### `Claude Diagramas Dinamicos/` (16+ MOV/MP4 files)
Topic: Claude-related diagrams + skills demos. Mostly iPhone screen recordings + Higgsfield-generated clips (`hf_2026032*.mp4`). Use as B-roll for any Claude/AI tooling content.

Sample specs: 1080×1920 H.264, ~5s clips, 11 MB each (Higgsfield outputs).

### `AGI Terminator Raw/` (10+ MOV files)
Topic: AGI/AI-takeover themed raw footage + reference imagery (marlin.jpg, platypus.jpeg = symbolic visuals). Use sparingly — fits the OPINION template type when discussing AGI risk.

### Miscellaneous in root
- `Instagram_icon.png`, `tiktok_logo_symbol.png` — platform brand marks (for "we just hit X followers" type slides)
- `hank-shake-continue-today-main-200403.jpg` — Tom Hanks shaking? (memetic reference image)
- `on-device-generative-ai-with-sub-10-billion-parameter-models.jpeg` — diagram screenshot (Apple-style)

### `Versus Seguir Armando Inteligencia/Versus Seguir Armando Inteligencia Video PNGs/`
PNG sequence frames from a previous "vs" comparison video. Could be reference for the **ComparisonTable** template motion.

### `Animacion Jaime Huesos/`
Prior animation experiment — review for visual style hints.

### `Logos Videos AI/`
Logo overlays used in prior videos.

## 5. Tool brand marks (3rd-party logos in `17-Instagram-Slides/public/brand/logos/`)

For when stories mention specific products:
- `claude-code.png`
- `codex.webp`
- `antigravity.webp`

**Add as you go** — when a story mentions a tool, drop its logo here.

## 6. Prior carousel work (style reference, NOT direct import)

`~/Downloads/Armando Inteligencia/` contains 4 PDF + folder pairs of past Instagram carousels:
- `Carrusel Autoridad Personal Armando Inteligencia` (Feb 2026)
- `Carrusel Casos de Exito Armando Inteligencia` (Feb 2026)
- `Carrusel IA Ejecutiva 90 Armando Inteligencia` (Feb 2026)
- `Carrusel Mitos AI Armando Inteligencia` (Mar 2026)

Plus offer PDFs:
- `Cliente Ideal Armando Inteligencia.pdf` — ICP definition (good for tone-of-voice calibration)
- `Oferta para CEOs Armando Inteligencia.pdf`
- `Oferta para Ejecutivos Armando Inteligencia 2.0.pdf`
- `Historias Destacadas Armando Inteligencia.pdf`

**Action:** read at least `Cliente Ideal` and `Historias Destacadas` when finalizing template list — they define the voice and audience the templates serve.

## 7. Prior Remotion attempt — `~/Downloads/Video_Generation_Remotion/First_Video/`

Existing Remotion 4.0.438 project with Tailwind v4 + transitions. Worth scanning `src/Composition.tsx` and `src/Root.tsx` to see what was already attempted before this project's pipeline took over. Two libraries used there that we DON'T currently use:
- **`@remotion/tailwind-v4`** — Tailwind for Remotion compositions
- **`@remotion/transitions`** — scene-to-scene transitions

Both are worth evaluating in the templates-roadmap synthesis.

---

## 8. Recommended next imports into this project

Priority 1 (do as part of next render):
- Copy `armando-avatar-solo.png` from project 17 → this project's `brand/logos/`
- Copy 2–3 best b-roll clips from `Claude Diagramas Dinamicos/` → `public/broll/claude/` (rename to slug-friendly names)
- Copy the cleanest face video (`DVtjqDuDUF0.mp4`) → `public/face/armando-talking-1080.mp4`

Priority 2 (when designing templates that need them):
- Import 305 AI / AI Leadership Lab / IA Ejecutiva 90 logos into a `brand/logos-secondary/` folder
- Convert the PNG sequence in `Versus Seguir` to a transparent webm for animated logo intros
- Pull the carousel PDFs and extract their visual rhythm (font choices, accent color usage, slide-to-slide pacing)

Priority 3 (optional polish):
- Set up an asset-CDN-ish symlink layer so future templates reference assets by path without copying

---

## 9. Brand config (existing — for reference)

Current `brand/config.json` only describes the MAIN Armando Inteligencia brand. Templates that need sub-brands (305 AI, AI Leadership Lab, IA Ejecutiva 90) will need a brand-set extension. Proposed schema:

```json
{
  "brands": {
    "armando-inteligencia": { /* current shape */ },
    "305-ai": { ... },
    "ai-leadership-lab": { ... },
    "ia-ejecutiva-90": { ... }
  },
  "defaultBrand": "armando-inteligencia"
}
```

**Defer this** until at least one template requests a non-default brand.
