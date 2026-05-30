# ADR-002 — Captions register × aspect matrix as a non-orthogonal product space

> **Status:** Accepted (2026-05-29). Writing this ADR is the acceptance, per the same convention as ADR-001 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:3`).
>
> **Authors:** Wave-7 research synthesis agent.
>
> **Mandated by:** ADR-001 Addendum A.5 open-question #7 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:465`), which states the Captions API ADR **MUST** explicitly address the captions-register × aspect matrix as a non-orthogonal product space. This is that document.
>
> **Tracks:** handoff item #141 (ADR-002 — Captions register × aspect matrix) and #171 (`captionRegister` as schema field vs renderer-only) per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:121-122`.
>
> **Affects:** The captions library at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/`, the schema layer at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`, the pipeline orchestrator and CLI at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/`, and the transcription step at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/transcribe/transcribe.py`.
>
> **Relationship to ADR-001:** This ADR is the load-bearing follow-up named in ADR-001 §8 item 2 ("ratified in a separate captions API ADR") and Addendum A.5 #7. It is **consistent with and subordinate to** ADR-001: it does not reopen the lane-split decision; it specifies how the caption layer behaves inside the two lanes that ADR-001 opened.
>
> **One-line:** The caption layer is governed by a {punchy, editorial, technical, custom, none} **register** × {9:16, 16:9-A-roll, 16:9-B-roll} **aspect** matrix that is **non-orthogonal** — not every cell is valid — because (per ADR-001 Addendum A.2 / Nate Correction 2) 9:16 captions and 16:9 captions are different primitives, not the same primitive rescaled.

---

## 1. Context

### 1.1 What ADR-001 left open

ADR-001 §2.5 ("Captions positioning rules", `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:104-116`) gave a first-pass per-aspect default table and named `EditorialCaption` as the canonical Tier-C (aspect-aware) molecule (§2.3, `:90`). It deferred the exact discriminator shape to "a separate captions API ADR" (§8 item 2, `:361`).

Addendum A.5 #7 (`:465`) then **escalated** that deferral into a hard requirement: the captions ADR "MUST explicitly address the captions-register × aspect matrix as a non-orthogonal product space," because the R4B Nate finding (Correction 2) made it load-bearing — "9:16 captions and 16:9 captions are not the same primitive with different sizing — they are different primitives ... the `register` enum itself must be tagged with which aspect lanes accept which registers."

### 1.2 The register taxonomy as it actually exists in code

The informal register taxonomy (per `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:97-103`) is already partially materialized in two caption components. This ADR grounds every claim in the **current prop surface**, not the aspiration:

- **`EditorialCaption.tsx`** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/EditorialCaption.tsx`) ships:
  - `register?: CaptionRegister` where `CaptionRegister = "punchy" | "editorial" | "technical" | "custom"` (`:46`). **There is no `"none"` member and no `aspect` member today.**
  - `REGISTER_PALETTES` (`:101-117`): `punchy` active `#F1C232`, `editorial` active `#5BC0E8`, `technical` active `#FFFFFF`; all with white past and graduated-white future.
  - `transition?: "pop" | "fade"` (`:58`, `:154`) — resolution order: explicit value wins; else `editorial → "pop"` (Bilawal R4C); else `"fade"` (`:212-217`).
  - `pulloutChip?: CaptionPulloutChip` (`:73-93`, `:167`) — Nate C7 blue keyword chip (default color `#3FB8FF`, `:317`), with keyword auto-sync to the karaoke stream (`:261-274`).
  - `style.position?: "bottom" | "center" | "top"` (`:120`), `distancePx` default 240 (`:174`), `fontSize` default 48 (`:175`).
- **`ChunkedPhraseCaption.tsx`** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/ChunkedPhraseCaption.tsx`) ships:
  - The **same** `register?: CaptionRegister = "punchy" | "editorial" | "technical" | "custom"` (`:40`) and the **same** `REGISTER_PALETTES` (`:48-64`). Again **no `"none"`, no `aspect`.**
  - Step-function (no per-word fade) reveal, `uppercase` default true (`:117`), `fontSize` default 64 (`:109`), `windowSize` default 3 (`:113`) — Bilawal/Simon busy-background variant.
- **`CaptionPillWithKeyword.tsx`** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/CaptionPillWithKeyword.tsx`) ships the Nate 16:9 atom (B23): a centered translucent pill with **exactly one** code-set keyword tinted `TNF_ORANGE = "#E07B3C"` (`:52`, `:129`). `anchor?: "below-content" | "lower-third" | "absolute-bottom"` (`:67`), `fontSize` default 36 (`:71`), `transitionVerb?: "fade" | "pop" | "none"` (`:77`). This is explicitly **not** a karaoke component — "the keyword is set in code at composition time, not driven by whisper alignment" (`:18-19`). It carries **no `register` prop** — it *is* the materialization of the 16:9 editorial register.
- **`EducationalDisclaimerCaption.tsx`** (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/EducationalDisclaimerCaption.tsx`) is a Hormozi compliance overlay (B18), orthogonal to the register matrix — it is a legal moat overlay, not a speech-caption register. Out of scope for the matrix; noted so the next reader does not try to slot it into a cell.

**Key reality-check:** the register enum in code is 4-valued (`punchy | editorial | technical | custom`). The taxonomy in the handoff and in the creator analyses is **5-valued** — it adds `none`. `none` is currently expressed by **omitting the caption component / setting `showCaptions: false`**, not by a `register` value. ADR-001 §2.5 (`:111`) already uses `none` as the 16:9-A-roll default. The All-In analysis recommends adding `'none'` as a real enum member (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:142`, `:245`). This ADR adopts that recommendation (§3.3).

### 1.3 The creator evidence behind each register

| Register | Active-word treatment | Driving creator evidence (absolute path + locator) |
|---|---|---|
| **punchy** | yellow `#F1C232` active, white past | Alex Hormozi (and Igor). `EditorialCaption.tsx:36-38, 102-106`; All-In taxonomy table `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:270` ("Yellow karaoke active word — Alex Hormozi"). |
| **editorial** | cyan `#5BC0E8` active, white past; **hard pop** transition by default | Sahil Bloom + Bilawal. `EditorialCaption.tsx:37, 107-111`; Sahil P7 `KaraokeCaptionCyanActive` `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/sahilbloom/ANALYSIS.md:103-108, 157, 169`; Bilawal R4C hard-pop validation `EditorialCaption.tsx:20-27`. |
| **technical** | white active, white past, graduated-white future | Adam Rosler. `EditorialCaption.tsx:38, 112-116`; handoff `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:100`. |
| **custom** | caller-supplied colors, back-compat opt-out | `EditorialCaption.tsx:39, 184` (`register: "custom"` default — existing call sites land here unchanged). |
| **none** | no burned-in caption; defer to platform CC | Sahil A-roll, All-In, Matthew Berman long-form. Sahil "captions ON during B-roll, OFF during face-cam essays" `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/sahilbloom/ANALYSIS.md:16, 155, 176-178`; All-In `BurnedInCaptionsAbsent16x9` anti-finding 12/12 `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:119-142, 264-273`. |

### 1.4 Why the matrix is non-orthogonal — the load-bearing finding

ADR-001 Addendum A.2 ("Aspect duality is NEGATIVE", `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md:423-435`) and the underlying Nate analysis Correction 2 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS.md:167-186, 303`) establish the central fact:

> Nate's long-form 16:9 and his Shorts 9:16 use **different visual grammars, not the same vocab rescaled**. None of the six new long-form patterns (N1–N6) appear in any of the three new Shorts; all three Shorts run karaoke + blue pullout chip with the slate cards stripped entirely (`natebjones/ANALYSIS.md:175-176`). The ONLY element continuous across both lanes is the lower-right handle chip (`:177`).

The consequence for captions specifically: a 16:9 composition's caption layer is **not** the 9:16 caption layer at a different `fontSize`. The 16:9 editorial register is a *typographic-highlight pill* with one code-set keyword (`CaptionPillWithKeyword.tsx`), driven by composition-time text, **not** by whisper alignment. The 9:16 editorial register is a *karaoke active-word* component driven by `wordTimings` (`EditorialCaption.tsx`). They share a name and a palette family but are different primitives with different data dependencies.

Therefore the (register, aspect) product space is **non-orthogonal**: several cells are structurally invalid, and the ones that are valid map to *different components*, not the same component resized. This ADR enumerates the matrix and marks the invalid cells explicitly.

---

## 2. Decision

### 2.1 The matrix

We model three aspect lanes, not two, because ADR-001 §2.5 already splits 16:9 into A-roll vs B-roll for caption purposes (`:111-112`):

- **9:16** — Shorts/Reels/TikTok vertical (1080×1920).
- **16:9-A-roll** — landscape talking-head (1920×1080). The presenter is on screen carrying the meaning.
- **16:9-B-roll / motion-graphic insert** — landscape with a graphic/stock/screen-rec plate where captions re-appear.

Cells below specify, per (register × aspect-lane): default-ness, the component that renders it, position, font size, active-word color, whether burned-in captions appear at all, and the driving creator evidence.

#### Lane: 9:16 (vertical)

| Register | Valid? | Component | Position | Font px | Active color | Burned-in? | Default for lane? | Evidence |
|---|---|---|---|---|---|---|---|---|
| **punchy** | ✅ | `EditorialCaption` or `ChunkedPhraseCaption` | bottom-third center (~70% from top) | 42 (ADR-001 §2.5) / 48 (`EditorialCaption` default) | `#F1C232` | yes | candidate default for Hormozi-style Shorts | ADR-001 `:110`; Hormozi `punchy` palette `EditorialCaption.tsx:102-106` |
| **editorial** | ✅ | `EditorialCaption` (karaoke) + optional `pulloutChip`; `ChunkedPhraseCaption` for busy bg | bottom-third center / left-low | 42–48 | `#5BC0E8`, hard **pop** | yes | **the 9:16 default register** | Sahil cyan karaoke `sahilbloom/ANALYSIS.md:103-108`; Bilawal hard-pop `EditorialCaption.tsx:20-27`; Nate Shorts karaoke-green + blue chip C7 `natebjones/ANALYSIS.md:133-141` |
| **technical** | ✅ | `EditorialCaption` / `ChunkedPhraseCaption` | bottom-third center | 42 | `#FFFFFF` | yes | for Adam-Rosler-style step walkthroughs | `EditorialCaption.tsx:112-116`; handoff `:100` |
| **custom** | ✅ | any caption component, caller-supplied colors | caller | caller | caller | yes | back-compat escape hatch | `EditorialCaption.tsx:184` |
| **none** | ⚠️ valid-but-discouraged | (no component / `showCaptions:false`) | n/a | n/a | n/a | **no** | **not recommended for our 9:16 output** | All-In/Sahil note: our sound-off-scroller audience demands captions ALWAYS ON for vertical — "copying All-In's no-caption discipline would tank watch time. KEEP captions on." `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:285`, `:123` |

**9:16 lane default register = `editorial`** (cyan karaoke, hard pop) — it is the most-validated register across Sahil + Bilawal + Nate Shorts and matches the existing `captionDefaultsVertical` convention referenced at ADR-001 `:110, :432` (`Root.tsx:130-134`). `none` is valid as a schema value but flagged: for *our* brand's 9:16 output it is an anti-pattern (sound-off audience).

#### Lane: 16:9-A-roll (landscape talking head)

| Register | Valid? | Component | Position | Font px | Active color | Burned-in? | Default for lane? | Evidence |
|---|---|---|---|---|---|---|---|---|
| **none** | ✅ | (no component / `showCaptions:false`) | n/a | n/a | n/a | **no** | **the 16:9-A-roll default** | ADR-001 `:111` ("long-form A-roll runs WITHOUT burned captions"); Sahil A-roll-off `sahilbloom/ANALYSIS.md:16, 176-178`; All-In 12/12 `allin/ANALYSIS.md:119-142` |
| **punchy** | ❌ invalid | — | — | — | — | — | — | No reference creator burns punchy karaoke onto 16:9 long-form A-roll. Igor/Hormozi/Nate/Matt all default A-roll to no captions (ADR-001 `:111`). |
| **editorial** | ❌ invalid | — | — | — | — | — | — | The 16:9 "editorial" treatment is the *keyword pill* on B-roll/graphic cards, not karaoke over a talking head. See B-roll lane below. |
| **technical** | ❌ invalid | — | — | — | — | — | — | Same as punchy: no creator runs technical karaoke over 16:9 A-roll. |
| **custom** | ⚠️ valid-but-rare | caller-supplied | caller | caller | caller | yes (if caller insists) | no | Only via explicit opt-in; the escape hatch exists but contradicts the lane default. |

**16:9-A-roll default register = `none`.** This is the single most consequential cell — it is what makes the pipeline-efficiency optimization in §4 possible.

#### Lane: 16:9-B-roll / motion-graphic insert

| Register | Valid? | Component | Position | Font px | Active color | Burned-in? | Default for lane? | Evidence |
|---|---|---|---|---|---|---|---|---|
| **editorial** | ✅ | **`CaptionPillWithKeyword`** (typographic one-keyword pill — *not* karaoke) OR `EditorialCaption` with `register:"editorial"` for sentence/karaoke moments | `lower-third` / `absolute-bottom`, centered, ≤70% frame width, max 3 lines | 36 (`CaptionPillWithKeyword` / ADR-001 §2.5 B-roll) | `#E07B3C` TNF_ORANGE keyword (pill) / `#5BC0E8` (karaoke variant) | yes | **the 16:9-B-roll default** | ADR-001 `:112`; Nate "Stripe Press in motion" orange-keyword pill `natebjones/ANALYSIS.md:155-165`; `CaptionPillWithKeyword.tsx:1-19` |
| **technical** | ✅ | `EditorialCaption` / `ChunkedPhraseCaption` `register:"technical"` | bottom-center ≤70% width | 36 | `#FFFFFF` | yes | for Adam-Rosler-style step inserts | `EditorialCaption.tsx:112-116` |
| **punchy** | ⚠️ valid-but-rare | `EditorialCaption` `register:"punchy"` | bottom-center ≤70% width | 36 | `#F1C232` | yes | no | Hormozi long-form occasionally burns yellow on B-roll, but our brand's 16:9 editorial voice is the orange-keyword pill, not yellow karaoke. Allowed; not default. |
| **custom** | ✅ | any, caller-supplied | caller | caller | caller | yes | no | back-compat escape hatch |
| **none** | ✅ | (omit on this insert) | n/a | n/a | n/a | no | no | A B-roll insert MAY still run captionless if the graphic is self-explanatory; valid but not the default (the point of B-roll captions is they DO appear, ADR-001 `:112`). |

**16:9-B-roll default register = `editorial`**, materialized as the orange-keyword pill (`CaptionPillWithKeyword`) for card/graphic beats and as cyan karaoke (`EditorialCaption`) for sentence-level B-roll narration.

### 2.2 Invalid cells (the non-orthogonality, stated plainly)

The product space `{punchy, editorial, technical, custom, none} × {9:16, 16:9-A-roll, 16:9-B-roll}` has 15 cells. **Three are structurally invalid** and one is an anti-pattern for our brand:

- ❌ `punchy × 16:9-A-roll` — invalid (no creator burns karaoke on landscape A-roll).
- ❌ `editorial × 16:9-A-roll` — invalid (16:9 editorial lives on B-roll pills, not A-roll karaoke).
- ❌ `technical × 16:9-A-roll` — invalid (same reason as punchy).
- ⚠️ `none × 9:16` — valid in the type system, anti-pattern for our output (sound-off audience).

The whole 16:9-A-roll column collapses to a single live register (`none`), with `custom` as a rarely-used explicit opt-in. This is the matrix-level expression of ADR-001 Addendum A.2: **16:9 captions are not 9:16 captions resized** — in the A-roll lane they mostly *do not exist*, and in the B-roll lane the "editorial" register is a different component (`CaptionPillWithKeyword`, keyword-driven) than the 9:16 "editorial" register (`EditorialCaption`, whisper-driven).

### 2.3 Register → component routing is aspect-dependent

A direct corollary the matrix forces: **the same `register` value resolves to different components depending on the aspect lane.** This is the precise sense in which the discriminator must carry both axes.

| register | 9:16 component | 16:9-B-roll component |
|---|---|---|
| `editorial` | `EditorialCaption` (whisper-driven karaoke, cyan, pop) + optional `pulloutChip` | `CaptionPillWithKeyword` (code-set one orange keyword) for card beats; `EditorialCaption` for sentence B-roll |
| `punchy` | `EditorialCaption` / `ChunkedPhraseCaption` (yellow) | `EditorialCaption` (yellow), rare |
| `technical` | `EditorialCaption` / `ChunkedPhraseCaption` (white) | `EditorialCaption` / `ChunkedPhraseCaption` (white) |
| `none` | — (discouraged) | — (per-insert opt-out) |
| `custom` | caller-supplied | caller-supplied |

This is why a single `EditorialCaption` with only a `register` prop is **necessary but not sufficient** (exactly the wording of ADR-001 Addendum A.5 #7, `:465`): the renderer/composition must also know the aspect lane to pick the right component, and the 16:9-editorial path is a different component entirely.

### 2.4 Caption-register `aspect` discriminator (the Tier-C surface)

Per ADR-001 §2.3 (`:90`) the captions library is the canonical Tier-C aspect-aware molecule. We ratify this concrete discriminator shape for the caption layer:

```
register: 'punchy' | 'editorial' | 'technical' | 'custom' | 'none'   // add 'none' to the existing 4
aspect:   '9:16' | '16:9'                                            // A-roll vs B-roll is a composition concern, see below
```

Notes on the shape:
- The `aspect` axis on the *caption component* is binary (`9:16 | 16:9`), matching the §2.3 Tier-C discriminator. The **A-roll vs B-roll** distinction is resolved one level up, by the **composition**: an A-roll 16:9 composition simply does not mount a caption component (register `none`); a B-roll insert mounts one with `aspect:'16:9'`. We do *not* push a three-valued aspect onto the component, because "A-roll" is the absence of a caption, not a caption mode.
- Adding `'none'` to the enum is additive and back-compat: existing call sites pass no `register` (defaults to `custom`, `EditorialCaption.tsx:184`) and are unaffected.
- For `aspect:'16:9'` + `register:'editorial'`, the recommended materialization for card/graphic beats is `CaptionPillWithKeyword` (not a karaoke render of `EditorialCaption`). The component may internally delegate, or the composition may select the component directly; either is acceptable, but the *contract* is: editorial-16:9 = one code-set keyword pill, not whisper karaoke.

### 2.5 What this ADR does NOT do

- It does **not** rename or change the existing `register` palettes or the `transition`/`pulloutChip` behavior already shipped — those are correct and cited as evidence here.
- It does **not** mandate the actual code change to add `'none'` to the two `CaptionRegister` enums. That is a build task (handoff #170/#171 follow-on); this ADR is the decision authority for it.
- It does **not** graduate `TNF_ORANGE` to a brand token (deferred to #161 — see §6).
- It does **not** add the condensed-sans font (deferred to #168 — see §6).

---

## 3. Recommendation on the `captionRegister` API surface (open-question #171)

**Question (handoff `:122`):** should `register` be a **schema-level field on compositions**, or **renderer-only**? The pipeline-efficiency angle: when `register='none'`, the pipeline can SKIP the faster-whisper transcription step entirely.

### 3.1 Recommendation — schema-level, with a derived render-time selector

**Recommendation: make `captionRegister` a schema-level field on every composition that has a caption layer (a Zod field in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts`), NOT renderer-only.**

Concretely:
- Add an aspect-aware-ish field to the relevant composition schemas: `captionRegister: z.enum(['punchy','editorial','technical','custom','none']).default(<per-lane default>)`. Defaults are the lane defaults from §2.1: 9:16 → `editorial`; 16:9-A-roll compositions → `none`; 16:9-B-roll-capable compositions → `editorial`.
- This sits alongside the existing aspect-neutral `showCaptions` field that ADR-001 §2.4 lists as aspect-neutral (`:98`). `register:'none'` and `showCaptions:false` are made consistent: `none` implies no whisper-driven caption layer.

### 3.2 Rationale — the pipeline-efficiency angle is decisive

This is the load-bearing reason and it tips the decision to schema-level:

1. **`register` is an input to the pipeline, not just the renderer.** The faster-whisper transcription step (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/transcribe/transcribe.py`) exists *only* to produce the `wordTimings` that karaoke captions consume. The pipeline's data flow (CLAUDE.md: "Render → Transcription → FFmpeg") runs Whisper on by default for accurate caption timing.
2. **When `register='none', the entire transcription step is dead work.** A 16:9-A-roll composition that defaults to `none` needs no `wordTimings` at all. If `register` is renderer-only, the orchestrator at `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/pipeline.ts` cannot know to skip Whisper — it would transcribe, produce timings, and then the renderer would throw them away. faster-whisper "small" on CPU int8 ARM64 (per CLAUDE.md tech stack) is one of the slowest steps in the pipeline. Skipping it for every A-roll 16:9 render is a real, recurring win.
3. **The pipeline must read `register` *before* it decides whether to transcribe.** That is only possible if `register` is a declared field on the composition's props/schema (or otherwise resolvable by the orchestrator from the composition id + defaults). A renderer-only prop is invisible to the pre-render pipeline. Therefore schema-level is required for the optimization to exist at all.
4. **It composes with ADR-001 §5.2 aspect inference** (`:211-219`): the pipeline already needs to infer aspect from the composition id suffix (`*16x9` / `*9x16`). The register default falls out of the same routing — landscape A-roll chassis → `none` → skip Whisper. The two consequences reinforce each other.
5. **Determinism & reproducibility.** A schema field is serialized into the per-request props JSON (the `--props` file in the render command, CLAUDE.md commands). That makes the caption register a recorded, diffable part of the request — consistent with ADR-001 §2.4's treatment of `showCaptions` as a schema field.

### 3.3 Concrete shape

- `register` is a **schema field** (the source of truth for both the pipeline-skip decision and the render).
- The **renderer** derives component selection from `(register, aspect)` per §2.3 — that derivation is render-time logic, but it reads the schema field, it does not own it.
- Add `'none'` to the two `CaptionRegister` enums (`EditorialCaption.tsx:46`, `ChunkedPhraseCaption.tsx:40`) so the schema enum and the component enum agree. `register:'none'` renders nothing (per All-In recommendation `allin/ANALYSIS.md:142, 245`).
- Pipeline rule: **if the resolved `captionRegister === 'none'` (or `showCaptions === false`), skip the faster-whisper step.** Document this in `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/pipeline.ts` when implemented. (Note: `--no-whisper` already exists for fast iteration per CLAUDE.md; the `none` register makes the skip *semantic* rather than a manual flag.)

---

## 4. Consequences

1. **`CaptionRegister` enum gains `'none'`** in both `EditorialCaption.tsx` and `ChunkedPhraseCaption.tsx`. Additive, back-compat (default stays `custom`). Render path for `none` returns `null`.
2. **Composition schemas gain `captionRegister`** with per-lane defaults (§3.1). 16:9-A-roll chassis (`StudioCompositor16x9`, `KeynoteSlidePIP16x9`, `StudioDeskTalkingHead16x9`, etc.) default to `none`.
3. **Pipeline skips faster-whisper when register resolves to `none`** (§3.3) — a recurring render-time saving for the entire 16:9-A-roll lane.
4. **The 16:9 "editorial" register is the orange-keyword pill (`CaptionPillWithKeyword`), not karaoke.** Compositions in the 16:9-B-roll lane that want the editorial look mount `CaptionPillWithKeyword`, not `EditorialCaption` in karaoke mode. This is the matrix's register→component routing (§2.3) made concrete.
5. **No cross-aspect schema sharing for the Nate vocabulary**, reaffirming ADR-001 Addendum A.2 (`:435`): `KineticTypoCard9x16` and `TitleCardKineticTwoLine16x9` keep independent caption layers; the 9:16 sibling lives on karaoke + blue pullout chip, the 16:9 original lives on the orange-keyword pill.
6. **Existing 9:16 compositions are unaffected.** They keep `register` unset (→ `custom`) or `editorial`; nothing is renamed or refactored. Mirrors ADR-001 §5.6 (`:252-254`).
7. **`EducationalDisclaimerCaption` stays outside the matrix** — it is a compliance overlay, composable alongside any register including `none` (it does not depend on `wordTimings`).

---

## 5. Alternatives considered

### 5.1 Renderer-only `register` (no schema field)

**Approach:** keep `register` as a pure render-time prop on the caption components; the pipeline always transcribes.

**Why rejected:** forfeits the faster-whisper skip for the entire 16:9-A-roll lane (§3.2). The pipeline cannot see a renderer-only prop before rendering, so it cannot skip the most expensive CPU step. The whole point of open-question #171 is the efficiency angle; renderer-only kills it.

### 5.2 Treat the matrix as orthogonal (every cell valid, just resized)

**Approach:** one `EditorialCaption` with `register` × `aspect`, every combination valid, 16:9 = 9:16 with bigger/smaller font.

**Why rejected:** directly contradicts ADR-001 Addendum A.2 / Nate Correction 2 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS.md:167-186`). 16:9 editorial is a keyword pill driven by composition-time text; 9:16 editorial is whisper-driven karaoke. They are different primitives with different data dependencies. Pretending the cell `editorial × 16:9-A-roll` is valid would burn karaoke onto talking heads, which no reference creator does and which the All-In/Sahil evidence explicitly counts as absent. Strengthens, rather than weakens, ADR-001 §6.2's rejection of a single aspect-aware god-component.

### 5.3 Three-valued `aspect` on the caption component (`9:16 | 16:9-aroll | 16:9-broll`)

**Approach:** push the A-roll/B-roll distinction down into the caption component's `aspect` prop.

**Why rejected:** "A-roll" is the *absence* of a caption, not a caption mode. Encoding it as a caption-component value invites the nonsensical `register:'editorial', aspect:'16:9-aroll'` call. Cleaner to keep the component `aspect` binary (`9:16 | 16:9`) per ADR-001 §2.3 and let the **composition** decide whether to mount a caption at all (register `none` = don't mount). Keeps the invalid cells unrepresentable at the right layer.

### 5.4 Keep `none` as `showCaptions:false` only (do not add to the enum)

**Approach:** express "no captions" purely via the existing `showCaptions` boolean; never add `'none'` to `CaptionRegister`.

**Why rejected:** the pipeline-skip decision and the lane defaults both want to reason about *register*, and `none` is the natural lane default for 16:9-A-roll (ADR-001 `:111`). The All-In analysis explicitly recommends `'none'` as an enum member so long-form templates can "declare 'no captions' cleanly in the schema for ... templates that defer to platform CC" (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:142, 245`). We keep `showCaptions` and make `none` consistent with it, rather than forcing two ways to say the same thing in different layers.

---

## 6. Brand-token graduations (referenced, deferred)

Two brand-token items intersect the caption layer but are deferred to their own tasks, per ADR-001's "defer the actual token work" posture and the handoff queue:

- **`TNF_ORANGE` (`#E07B3C`)** — currently a local const in `CaptionPillWithKeyword.tsx:52`, the active ink of the 16:9 editorial keyword pill. Graduate to `src/brand/palettes.ts` per handoff #161 (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md:112`). This ADR does not perform the graduation; it records that the 16:9-B-roll-editorial cell's active color is owned by that future token.
- **Condensed-sans font** (Barlow Condensed / Oswald / Bebas Neue) — not loaded; the B10 chyron approximates with Inter 800 + tracking (handoff #168, `:113`). Where a caption register's wordmark/chyron wants condensed type, it inherits whatever `src/brand/fonts.ts` resolves once #168 lands. Deferred.

---

## 7. Open questions surfaced during writing

These do not block acceptance but need a human decision before the caption-register build task ships:

1. **9:16 lane default register: `editorial` (cyan) vs `punchy` (yellow)?** §2.1 sets the 9:16 default to `editorial` because it is the most cross-validated (Sahil + Bilawal + Nate Shorts). But the project's *own* current default leans yellow/`punchy` — All-In taxonomy calls yellow karaoke "our own current default" (`/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md:270`) and `captionDefaultsVertical` (ADR-001 `:110`) should be checked. **Human decision: confirm the brand's canonical 9:16 active-word color before setting the schema default.** (I could not read `Root.tsx:130-134` directly in this pass; the cited default may already be set — verify.)
2. **Does `CaptionPillWithKeyword` get a `register` prop, or stay register-implicit?** It currently has no `register` (it *is* 16:9-editorial). If the renderer routes `(register:'editorial', aspect:'16:9')` → `CaptionPillWithKeyword`, the component may not need the prop. But if `punchy`/`technical` keyword pills are ever wanted on 16:9 B-roll, the pill would need a palette switch. Decide whether to add `register` to the pill or keep palette-per-component.
3. **Sahil's `FullSentenceItalicEmphasisCaption` / `allCapsCenter` modes** (Sahil P3 `:71-76`, P8 `:111-116`) are register-adjacent caption *modes* not captured by the `{punchy,editorial,technical,custom,none}` axis. Are they a third axis (`mode`) on the editorial register, or new registers? ADR-001 §2.5 mentioned `register: 'karaoke' | 'sentence' | 'allCapsCenter' | 'none'` (`:115, :361`) — a **different enum** than the color-register enum shipped in code. **Human decision: reconcile the "color register" axis (punchy/editorial/technical) with the "layout mode" axis (karaoke/sentence/allCapsCenter) — they are orthogonal sub-axes that ADR-001 conflated.** This is the single biggest unresolved modeling question.
4. **A-roll detection for mixed 16:9 compositions.** A 16:9 composition that intercuts A-roll and B-roll (e.g. Sahil-style essays, `sahilbloom/ANALYSIS.md:16`) needs captions ON during B-roll and OFF during A-roll within one render. The matrix models the *default* per lane, but per-segment register scheduling (like `pulloutChip`'s per-beat schedule, or a `keywordChipSchedule` per `natebjones/ANALYSIS.md:141`) is not yet specified. Defer to the `KaraokeWithBlueChipPullout9x16` / B24b build (#170) and a future per-segment caption-schedule spec.
5. **`PersistentCreatorChip` family vs caption layer.** ADR-001 Addendum A.5 #8 (`:466`) flags whether the handle chip / event chyron is a chrome primitive or part of the caption family. The handle chip is the ONLY element continuous across both Nate aspect lanes (`natebjones/ANALYSIS.md:177`). Confirm it is chrome (not a caption register) so it stays out of this matrix. (This ADR treats it as chrome.)

---

## 8. Sources

Primary evidence cited above (all read for this ADR):

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md` — the parent ADR. §2.3 (molecule tiers `:82-92`), §2.4 (schema field classes `:94-102`), §2.5 (captions positioning `:104-116`), §4.3 (Tier-C candidates `:180-192`), §6.2 (god-component rejection `:273-281`), Addendum A.2 (negative aspect duality `:423-435`), A.5 #7 + #8 (open questions `:465-466`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/WAVE7-HANDOFF.md` — captions taxonomy informal (`:97-103`), brand-token graduations (`:111-113`), ADR-002 / #171 framing (`:121-122`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/EditorialCaption.tsx` — `CaptionRegister` enum (`:46`), `REGISTER_PALETTES` (`:101-117`), `transition` resolution (`:212-217`), `pulloutChip` (`:73-93, :261-274, :317`), defaults (`:170-185`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/ChunkedPhraseCaption.tsx` — same `register` enum (`:40`) and palettes (`:48-64`), step-function reveal, defaults (`:104-120`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/CaptionPillWithKeyword.tsx` — 16:9 editorial pill, `TNF_ORANGE` (`:52`), keyword-not-karaoke note (`:18-19`), anchor/transitionVerb props (`:54-83`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/EducationalDisclaimerCaption.tsx` — compliance overlay (out of matrix, `:1-30`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/natebjones/ANALYSIS.md` — C7 `KaraokeWithBlueChipPullout9x16` (`:133-141`), Correction 1 vocab (`:149-165`), Correction 2 negative aspect duality (`:167-186`), two-lane summary (`:303`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/sahilbloom/ANALYSIS.md` — captions selectively burned (`:16`), cyan karaoke P7 (`:103-108`), A-roll-off discipline (`:155, :176-178`), captions taxonomy (`:171-178`).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/allin/ANALYSIS.md` — `BurnedInCaptionsAbsent16x9` anti-finding 12/12 (`:119-142`), `register:'none'` recommendation (`:142, :245`), register taxonomy table (`:264-273`), keep-captions-on-for-our-audience (`:285`).

Code that this decision affects (read-only for the ADR itself):

- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/components/captions/` — the four caption components above.
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/compositions/schemas.ts` — where `captionRegister` becomes a schema field (§3).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/pipeline/pipeline.ts` and `generate.ts` — where the faster-whisper skip is wired (§3.3, composes with ADR-001 §5.2 aspect inference).
- `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/src/transcribe/transcribe.py` — the step skipped when register resolves to `none`.

Companion docs:

- ADR-001 (parent): `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/docs/research/wave-7/ADR-001-16x9-lane.md`.
- Per-segment caption-schedule spec (to author next, per §7 #4): build task #170 `KaraokeWithBlueChipPullout9x16`.
- `PersistentCreatorChip` chrome family ADR (per ADR-001 A.5 #8 / §7 #5): future.
