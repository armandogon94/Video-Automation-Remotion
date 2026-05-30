# R1 — Terminal / CLI simulation in motion video

> Wave-1 research deliverable for the `TerminalCommand9x16` Remotion composition.
> Goal: capture the patterns that make a fake terminal feel real, plus a concrete
> implementation recipe to translate into a Remotion composition.
> Author: Opus deep-research agent · 2026-05-25 · @armandointeligencia

---

## TL;DR

A fake terminal stops feeling fake when **four** things line up:
1. **Monospace font with confident metrics** — JetBrains Mono is the safest 2026 default. Fira Code if you want ligatures (`->`, `=>`, `!=`). Avoid system `monospace` fallback at all costs.
2. **Authentic prompt + cursor** — Starship `❯` chevron is the modern look, `$` is the timeless one. Cursor must blink at ~530 ms (Windows-standard rate) and switch from steady→blinking when typing stops.
3. **Character-level reveal, not opacity** — Use `text.slice(0, charsShown)` driven by `useCurrentFrame()`. Per-character opacity fades look like a kinetic-text plugin, not a terminal.
4. **Real-output texture** — ANSI color (green checkmarks, dim grey paths, yellow warnings), variable line-arrival timing (some lines stream slow, some dump instantly), and a "thinking pause" between input and output. No two consecutive lines should arrive at the same speed.

The good news for our pipeline: Remotion already has a stock typewriter template
(`github.com/remotion-dev/typewriter`) and a one-page rule in its agent-skills
repo that nails the right primitive (`slice()` driven by frame). We extend that
primitive with a per-line clock, an ANSI-colored child renderer, and a
shell-prompt prefix component.

---

## 1. Aesthetic survey — what creators actually use

I surveyed Remotion templates, ttyd/VHS-style screencast tooling, popular tech
content (Fireship, Theo Browne, Karpathy lectures, Vercel Ship, the Claude Code
launch reel), CodePen terminal mockups, and the official aesthetic guidance
from Charm (VHS), Warp, and Hyper. Pulling out the consistent signals:

### Font

| Font | Verdict | Notes |
|---|---|---|
| **JetBrains Mono** | **Default choice** | Heavier strokes, ships ligatures, designed for high-DPI displays. What Cursor/JetBrains demo videos use. Free, OFL license. ([JetBrains](https://www.jetbrains.com/lp/mono/)) |
| Fira Code | Strong alternative | Lighter weight reads more "refined" on macOS. Pioneered the ligature set. ([FontFYI comparison](https://fontfyi.com/blog/jetbrains-mono-vs-fira-code/)) |
| SF Mono | Looks great on macOS only | `1` vs lowercase `l` ambiguity is a real recognition risk in a vertical reel. |
| IBM Plex Mono | Niche "engineer-y" vibe | Use when you want a slightly retro/typewriter accent. |
| Cascadia Code | Microsoft default | Reads "Windows Terminal." Avoid unless that's the vibe. |
| `monospace` fallback | **Never** | Renders Courier on most machines. Instantly gives the game away. |

**Recommendation:** load JetBrains Mono via `@remotion/google-fonts/JetBrainsMono`
at weights 400/500/700 and explicit ligature CSS (`font-feature-settings: "calt", "liga"`).

### Background + text colors

The dominant terminal palettes in motion content come from three sources:

- **Tokyo Night** (Starship's reference theme): `bg #1a1b26`, `fg #c0caf5`, green `#9ece6a`, yellow `#e0af68`, red `#f7768e`, blue `#7aa2f7`. Most popular on YouTube tech content. ([Starship preset](https://starship.rs/presets/tokyo-night))
- **Catppuccin Frappé** (Charm VHS reference): warmer, lavender accents. ([VHS](https://github.com/charmbracelet/vhs))
- **Pure black + monokai-ish accents**: Fireship-style. `bg #000`, fg `#e6e6e6`, green `#a6e22e`, pink/red `#f92672`.

**Recommendation:** for an Armando Inteligencia brand-fit, **do NOT use pure
black**. Use `#0D1117` (GitHub Dark) or `#0F1B2D` (our brand deep-navy) so the
terminal feels like part of the brand. Map ANSI colors to the Tokyo Night
greens/reds for "real terminal" recognition.

### Prompt

| Prefix | Vibe | Use when |
|---|---|---|
| `$` | Classic, neutral, "Unix textbook" | Default if unsure |
| `%` | Default zsh on macOS, vaguely techy | Talking to a macOS audience |
| `>` | Vague, looks like a REPL prompt (Node, Python) | When the command IS in a REPL |
| `❯` | Starship default, "modern dev" signaling | When audience is senior devs / cool kids |
| `>>>` | Python REPL specifically | Show-me-the-Python content |
| `~ $` or `user@host ~/dir $` | Full PS1, looks "real" but busy | Avoid in 9×16 — eats horizontal space |

**Recommendation:** `❯ ` (Starship chevron + one space) in muted blue/cyan
(`#7aa2f7`). Two-line prompt only if you really need to show the working
directory. ([Starship docs](https://starship.rs/))

### Cursor

- **Style:** block (`▋`) is the most "terminal-y." Bar (`|`) reads as text editor.
  Underscore (`_`) reads as DOS-era retro. Termynal defaults to the unicode block
  `▋` ([termynal](https://github.com/ines/termynal)).
- **Blink rate:** ~530 ms is the Windows default and the standard adopted by
  CodeMirror after community feedback ([CodeMirror #722](https://github.com/codemirror/codemirror5/issues/722)).
  Implement as `step-end` (or `step-start`) easing — never linear — so the cursor
  snaps on/off rather than fading.
- **Behavior:** while typing, cursor is **solid** (no blink). When the line
  pauses, blink kicks in after ~300 ms idle. This is exactly what the Remotion
  stock typewriter does (always-on while typing, then `Math.floor(frame/10) % 2 === 1`
  toggle after the slice completes). ([remotion-dev/typewriter](https://github.com/remotion-dev/typewriter))

### Padding + chrome

- Inner padding: 32–48 px on all sides at 1080-wide. Termynal recommends not
  jamming text against the edge — gives the eye a place to breathe between the
  window edge and content.
- Optional macOS "traffic-light" window bar (red/yellow/green dots, ~14 px each,
  `#FF5F57 / #FEBC2E / #28C840`). VHS exposes this as `WindowBar Colorful`.
  Adds instant "this is a terminal" recognition; downside is it consumes vertical
  height in a 9×16 frame. ([VHS WindowBar docs](https://github.com/charmbracelet/vhs))
- Optional title text in the bar ("zsh — 80×24", or a project name like
  "armando-inteligencia ~ main"). Cheap authenticity boost.

### Aesthetic checklist (exact values to ship)

```
FONT:           JetBrains Mono 500 (regular for prose, 700 for prompts/errors)
                font-feature-settings: "calt", "liga"
                line-height: 1.45
                letter-spacing: 0

CANVAS:         1080×1920 with terminal inset 80px from sides (so content is 920px wide)
BACKGROUND:     #0F1B2D (brand deep-navy) — NOT pure black
FOREGROUND:     #E6EDF3 (90% white-ish)
DIM TEXT:       #8B949E (paths, timestamps, comments)
ANSI GREEN:     #9ECE6A   ANSI RED:    #F7768E
ANSI YELLOW:    #E0AF68   ANSI BLUE:   #7AA2F7
ANSI MAGENTA:   #BB9AF7   ANSI CYAN:   #7DCFFF

PROMPT:         "❯ "  in #7AA2F7  (or  "$ " in #9ECE6A  for retro look)
CURSOR:         block "▋" in #E6EDF3, opacity 1 while typing, blink 530ms after pause
                blink: step-end keyframes, NEVER linear fade

PADDING:        40px inside terminal frame
LINE GAP:       8px between rendered lines
WINDOW BAR:     optional, 32px tall, 3 dots × 14px, gap 8px, only when frame budget allows
CORNER RADIUS:  12px on outer terminal frame
SHADOW:         0 24px 64px rgba(0,0,0,0.4)
```

---

## 2. Implementation patterns

### How everyone does the typewriter

After reading the stock Remotion typewriter, react-type-animation, typed.js,
termynal, and Charm VHS source, the canonical pattern is identical across all
of them:

> Drive a **character count** off a clock; **slice the source string** to that
> length on every render; render the slice in a `<pre>` with a cursor element
> after it. Never animate per-character opacity.

The Remotion `skills/text-animations` rule is explicit:

> *"Based on `useCurrentFrame()`, reduce the string character by character to
> create a typewriter effect. Always use string slicing for typewriter effects.
> Never use per-character opacity."* ([remotion-dev/skills](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md))

Concrete reference implementations:

| Library / template | Pattern | Cursor approach |
|---|---|---|
| [remotion-dev/typewriter](https://github.com/remotion-dev/typewriter) | `Math.floor(frame/3)` → 1 char per 3 frames at 30 fps = ~10 cps | 3 px vertical line, always on during typing, toggles `% 2` every 10 frames after |
| [react-type-animation](https://www.npmjs.com/package/react-type-animation) | Sequence API: string, pause ms, string, ... — `speed={50}` = ms-per-keystroke | `::after { content: '\|'; animation: cursor 1.1s step-start infinite }` |
| [typed.js](https://github.com/mattboldt/typed.js) | `typeSpeed: 50` ms-per-char, supports backspace | Configurable HTML element + CSS animation |
| [termynal](https://github.com/ines/termynal) | Async/await per line, `typeDelay: 90`, `lineDelay: 1500` | Unicode `▋`, CSS `animation: blink 1s infinite` |
| [Charm VHS](https://github.com/charmbracelet/vhs) | `Type "..."` + `Sleep 500ms` DSL | Real terminal under ttyd; cursor blink is on by default |
| [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects) | Effects engine: `Print` (line-by-line), `Decrypt`, `Rain`, `Slide`, `Pour` | Programmatic — built for actual terminal output, useful as inspiration for fancy reveals |

### Line-streaming (what makes output look real)

Real terminal output **does not arrive at typewriter speed.** It either:
- Dumps instantly (e.g. `cat file.txt`, `ls`, command echo)
- Streams in chunks (e.g. `npm install` log lines, one per ~50–200 ms)
- Trickles slow (e.g. progress bars, `tqdm`)

Termynal's defaults capture this well: `startDelay: 600ms`, `typeDelay: 90ms`,
`lineDelay: 1500ms` (gap between lines). That extra 1.5 s between lines is what
sells "the shell is thinking" before output appears.

For our Remotion composition, that means lines need a per-line **enter time**
(when this line starts appearing) and a per-line **mode** (`typed` for user
input, `instant` for output dumps, `streamed` for progressive logs).

### Cursor implementation — code that actually works

The cleanest Remotion-native approach (adapted from the stock template):

```tsx
const totalChars = lines.reduce((n, l) => n + l.text.length, 0);
const charsShown = Math.min(totalChars, Math.floor((frame - delayFrames) / framesPerChar));
const typingComplete = charsShown >= totalChars;

// blink only after typing completes; while typing, cursor is solid
const cursorVisible = !typingComplete || Math.floor(frame / 16) % 2 === 0;
//                                                     ^ 16f @ 30fps = 533ms ~ Windows default
```

### Anti-pattern: per-character opacity

Several "kinetic text" tutorials fade each `<span>` in by interpolating opacity.
This is wrong for a terminal because:
- Spacing wobbles as letters fade in (subpixel rendering)
- It looks like a slick presentation, not output from a process
- It precludes monospace alignment for progress bars and tables

Always use `pre` + `text.slice(0, n)`.

---

## 3. Real-world creator examples (top 5)

I could not view individual TikTok/IG videos directly through search, but the
canonical references that creators publicly cite as inspiration:

| # | Source | URL | Why it's good |
|---|---|---|---|
| 1 | **Anthropic — "Introducing Claude Code" launch reel** | [YouTube](https://www.youtube.com/watch?v=AJpK3YTTKZ4) | The bar to clear. Real terminal recording (not animated), but the framing — solid dark bg, JetBrains-y mono, restrained color, generous padding — is exactly the look we're emulating. Watch 00:30–01:10 for the typing rhythm and how outputs stream. |
| 2 | **Remotion stock typewriter template** | [github.com/remotion-dev/typewriter](https://github.com/remotion-dev/typewriter) | Cleanest reference implementation we can copy line-for-line. `frame/3` typing, post-completion blink. |
| 3 | **Fireship × Remotion template (William Candillon)** | [BrightCoding writeup](http://blog.brightcoding.dev/2026/02/21/remotion-fireship-create-viral-videos-with-react-code) | Production-ready demonstration of "code-typing animations" in 9×16 — directly the format we want. Watch for the synced voiceover + code reveal pattern. |
| 4 | **Charm VHS demo gallery** | [github.com/charmbracelet/vhs](https://github.com/charmbracelet/vhs) (README) | Every gif in the README is the gold-standard "this is what authentic terminal motion looks like." Note the cursor behavior between commands. |
| 5 | **System Interface (Vercel Ship 2026)** | [terminaluianimation.vercel.app](https://terminaluianimation.vercel.app/) | Stylized but still convincingly terminal-like. Watch the line-arrival timing and how text dims out as it scrolls up. |

Supporting references:
- **Karpathy "Let's reproduce GPT-2" lecture** ([X post](https://x.com/karpathy/status/1799949853289804266)) — real terminal capture, but the line-arrival cadence during training (`tqdm`-style progress + periodic log dumps) is the rhythm to mimic for any "model is training" beat.
- **Skillkit Terminal Demo Generator** ([skillkit.io](https://skillkit.io/skills/claude-code/terminal-demo-generator)) — Claude Code skill that already generates terminal demos. Worth reading its prompt template for what details matter.

---

## 4. Library survey — is there an off-the-shelf component?

| Library | Remotion-compatible? | Verdict |
|---|---|---|
| **xterm.js** ([xtermjs.org](https://xtermjs.org/)) + [react-xtermjs](https://www.qovery.com/blog/react-xtermjs-a-react-library-to-build-terminals) | ⚠ Not really | Full terminal emulator backed by a canvas. Designed for live PTY interaction, not deterministic frame-based rendering. Will fight Remotion's headless renderer and the canvas won't capture cleanly. **Skip.** |
| **react-type-animation** ([npm](https://www.npmjs.com/package/react-type-animation)) | ⚠ Partial | Time-based (`setInterval`) not frame-based. Will desync from Remotion's clock. Could work in `<Img>`-snapshot pipelines but not in our render. **Skip — roll our own.** |
| **typed.js** ([github](https://github.com/mattboldt/typed.js)) | ⚠ Partial | Same problem — setTimeout-driven. Good source to read for backspace/loop logic. **Skip but borrow ideas.** |
| **termynal** ([github](https://github.com/ines/termynal)) | ❌ No | Plain HTML/JS for web pages, async/await timing. Brilliant CSS/HTML reference though — its `data-ty="input"` markup is a great mental model for our props schema. **Steal the structure, not the code.** |
| **ansi-to-react** ([npm](https://www.npmjs.com/package/ansi-to-react)) | ✅ Yes | Pure renderer that converts ANSI escape sequences to React spans. Useful if scripts include raw `[32m` codes. **Optional add-on**, not required for v1. |
| **Remotion stock typewriter** ([github](https://github.com/remotion-dev/typewriter)) | ✅ Yes | Native. **Use this as the base.** |
| **Charm VHS** ([github](https://github.com/charmbracelet/vhs)) | ❌ (renders to MP4/GIF, not Remotion-native) | Can be used **out-of-band** to record an actual terminal and `<Video>` it back into Remotion. Useful escape hatch when authenticity matters more than props-driven control. |

**Conclusion:** there is no drop-in. Build a small custom component from
first principles, using the Remotion stock typewriter as the seed.

---

## 5. Implementation recipe (12-line pseudocode)

For `src/compositions/TerminalCommand9x16.tsx`. Frame rate assumed 30 fps.

```tsx
// Props (Zod-validated):
//   lines: Array<{
//     kind: "input" | "output" | "comment" | "progress",
//     prompt?: "❯" | "$" | ">>>" | null,
//     text: string,                  // may contain ANSI escapes
//     cps?: number,                  // chars per second; defaults by kind
//     pauseAfterMs?: number,         // gap before next line begins
//   }>
//   theme: "tokyo-night" | "github-dark" | "armando"
//   showWindowBar?: boolean
//   prompt?: "❯" | "$" | "%"         // global default
//   fontSizePx?: number              // default 38px for 9x16

const FPS = 30;
const DEFAULT_CPS = { input: 22, output: 0, comment: 18, progress: 60 };
//                            ^ output=0 means instant dump

// 1. Pre-compute each line's startFrame and endFrame from cps + pauseAfterMs
const timeline = useMemo(() => buildTimeline(lines, DEFAULT_CPS, FPS), [lines]);

// 2. Per render, compute how much of each line is visible
const frame = useCurrentFrame();
const rendered = timeline.map((l) => {
  const elapsed = Math.max(0, frame - l.startFrame);
  const charsShown = l.cps === 0
    ? (frame >= l.startFrame ? l.text.length : 0)            // instant dump
    : Math.min(l.text.length, Math.floor(elapsed * l.cps / FPS));
  return { ...l, visibleText: l.text.slice(0, charsShown), done: charsShown >= l.text.length };
});

// 3. Cursor sits at the end of the most recent in-progress line; blinks once done
const activeIdx = rendered.findLastIndex((r) => frame >= r.startFrame);
const allDone = rendered.every((r) => r.done);
const cursorOn = !allDone ? true : Math.floor(frame / 16) % 2 === 0;   // 533ms blink

// 4. Render: <TerminalFrame> (window bar + padding + scrollable region)
//      → for each line: <PromptPrefix /> + <AnsiText text={visibleText} />
//      → cursor element after the active line's visible text
```

Helper notes:
- `buildTimeline` is a 15-line pure function: accumulates `startFrame` per line as
  prior duration + `pauseAfterMs * FPS / 1000`. Trivial.
- `<AnsiText>` either uses `ansi-to-react` or strips ANSI and applies a regex
  for simple `[GREEN]✓[/]` markup we control. Start with the latter for v1.
- For lines with `kind: "progress"`, render the visible slice but also a
  block-character progress bar (`█████░░░░░`) that fills proportionally — gives
  the `npm install` / `pip install` aesthetic instantly.
- For "scrolling" effect when lines exceed viewport height, translate the
  rendered stack upward by `-(overflowPx)` once the active line approaches the
  bottom. Real terminals scroll; not scrolling looks wrong.

---

## 6. Anti-patterns (what makes a fake terminal look fake)

1. **Pure black background.** Real terminals are almost always slightly-not-black
   (`#0D1117`, `#1A1B26`, `#1E1E1E`). Pure black plus white text is the "I
   designed this in PowerPoint" look.
2. **`monospace` CSS fallback.** Renders Courier on most systems. Letterforms
   immediately read as "typewriter from 1985," not "terminal from 2026."
3. **Cursor that fades instead of blinking.** A linear/ease opacity transition
   does not look like a real cursor — real cursors snap. Use `step-end` or just
   toggle between `0` and `1`.
4. **Every line streams at the same rate.** Output dumps; user input types;
   progress bars trickle. If everything is the same `cps`, the eye registers
   "this is an animation," not "this is a process."
5. **No gap between command and output.** Real shells have ≥100 ms latency.
   In motion, give it 200–600 ms so the brain has time to register "the user
   pressed Enter, now the machine responds."
6. **Cursor always blinking, even mid-typing.** Real cursors are *solid* while
   actively typing — they only blink during idle. Get this wrong and the
   illusion breaks immediately.
7. **Wrong prompt for wrong shell.** `>>>` in a "bash demo" reads as
   amateur-hour. Match prompt to the implied shell.
8. **Per-character opacity fade-in.** Looks like After Effects, breaks
   monospace alignment, prevents tables/progress bars from working.

---

## 7. 15-template typology slot

This composition does **not** map to any of the existing 15 templates in
`docs/research/E-15-template-typology.md`. The closest neighbor is
`TutorialMicro` (complexity 4, screen-recording with annotated callouts), but
that template is built around an actual recorded screencast with overlay
annotations — fundamentally different from a synthesized terminal.

**Recommendation: add as a 16th template** (or replace the lowest-shipping
existing template) with this slot:

| # | Slug (ES) | Category | Complexity | Motion Intensity | Asset Weight | Duration | Primary use |
|---|---|---|---|---|---|---|---|
| 16 | **TerminalCommand** | demo / tooling | 3 | Mid | Light (script only — no assets) | 25–45s | "Mirá esto" CLI moment: install a new tool, run a model, ship a deploy |

**Story spine fit:** This template earns its slot because it covers a
narrative beat the existing 15 do not: showing a *capability* live, not just
talking about it. Use cases from upcoming W22+ calendar:
- "Claude Code en 30 segundos" (install + first prompt + output)
- "Gemini 3.2 Flash desde la CLI" (curl + streamed response)
- "Deploy en 3 comandos con Vercel"
- "MCP server en 60 segundos"
- "uv vs pip — mismo install, 10× más rápido" (side-by-side terminals)

**Props schema sketch:**
```ts
{
  hookTitle: string,                       // "Claude Code en 30 segundos"
  shell: "zsh" | "bash" | "python" | "node",
  prompt: "❯" | "$" | "%" | ">>>",
  theme: "tokyo-night" | "github-dark" | "armando",
  lines: Array<TerminalLine>,              // see recipe above
  finalCallout?: string,                   // e.g. "Listo. Esto corre en tu laptop."
  voiceoverSyncMarkers?: number[],         // optional per-line VO sync
}
```

This template synergizes with the existing infrastructure: prompt/cursor
component is reusable, ANSI renderer can be extracted, and the same JSON-driven
approach used by `TechNewsFlash9x16` works here unchanged.

---

## 8. Open questions for the user

1. **Is real-terminal screen-capture an option?** Charm VHS produces frame-perfect
   MP4 of a real terminal session driven by a `.tape` script. For maximum
   authenticity we could record the terminal *out of band* with VHS, then
   `<OffthreadVideo>` it into Remotion with our brand overlay. Trade-off:
   loses props-driven control. Should we support both modes?
2. **Voiceover sync model.** Should each line have a `narrationStartSeconds`
   prop (so the terminal animation locks to specific words in the VO), or do
   we let the terminal run on its own clock and trust the editor to align?
   The `TimelineRecap` template already does per-event sync; reusing that
   pattern is cheapest.
3. **Live ANSI escape parsing vs. our own markup.** Real `npm install` output
   contains `[32m✓[0m`. Do we (a) ship `ansi-to-react`, (b) define
   our own bracket markup (`[GREEN]✓[/]`), or (c) require the script-author to
   pre-process? Recommend (b) for v1 — simpler, no extra dep — but (a) is
   trivial to add later.
4. **Window chrome — yes or no?** macOS traffic-light dots add instant
   recognition but cost ~5% vertical real estate. In a 9×16 frame where
   every pixel matters, is it worth it? My instinct: **off by default,
   prop-toggleable on**.
5. **Background color — pure dark or brand-aligned?** The brand is `#0F1B2D`
   deep-navy. Tokyo Night is `#1A1B26`. They're within 5 RGB points of each
   other. I'd use `#0F1B2D` (brand) for the terminal bg so it visually
   belongs to the @armandointeligencia world rather than reading as
   generic-tech-content. Confirm?
6. **Should this replace one of the existing 15, or sit as a 16th?** My
   instinct: add as 16th. The 15 cover talking/explaining beats; this covers
   *demonstrating* beats, which is a genuinely different content axis. But
   maintaining 16 templates costs more than 15.

---

## Sources

- [remotion-dev/typewriter (stock template)](https://github.com/remotion-dev/typewriter)
- [remotion-dev/skills — text-animations rules](https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/text-animations.md)
- [react-type-animation](https://www.npmjs.com/package/react-type-animation) · [examples](https://react-type-animation.netlify.app/examples)
- [typed.js](https://github.com/mattboldt/typed.js)
- [termynal (ines)](https://github.com/ines/termynal)
- [Charm VHS](https://github.com/charmbracelet/vhs) · [VHS publish blog](https://charm.land/blog/vhs-publish/)
- [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects)
- [ansi-to-react (nteract)](https://github.com/nteract/ansi-to-react) · [ansi_up](https://www.npmjs.com/package/ansi_up)
- [xterm.js](https://xtermjs.org/) · [react-xtermjs (Qovery)](https://www.qovery.com/blog/react-xtermjs-a-react-library-to-build-terminals)
- [asciinema](https://github.com/asciinema/asciinema) · [divby0 — high-quality terminal videos](https://www.divby0.io/posts/high-quality-terminal-videos/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) · [JetBrains Mono vs Fira Code (FontFYI)](https://fontfyi.com/blog/jetbrains-mono-vs-fira-code/)
- [Starship](https://starship.rs/) · [Tokyo Night preset](https://starship.rs/presets/tokyo-night)
- [Warp themes](https://docs.warp.dev/terminal/appearance/themes/) · [Warp design blog](https://www.warp.dev/blog/how-we-designed-themes-for-the-terminal-a-peek-into-our-process)
- [Hyper themes](https://hyper.is/themes/newest) · [Awesome Hyper](https://github.com/bnb/awesome-hyper)
- [CodeMirror — cursor blink rate 530ms](https://github.com/codemirror/codemirror5/issues/722)
- [Anthropic — Introducing Claude Code (YouTube)](https://www.youtube.com/watch?v=AJpK3YTTKZ4)
- [Fireship × Remotion template](http://blog.brightcoding.dev/2026/02/21/remotion-fireship-create-viral-videos-with-react-code)
- [Skillkit — Terminal Demo Generator skill](https://skillkit.io/skills/claude-code/terminal-demo-generator)
- [Karpathy — Let's reproduce GPT-2 (X)](https://x.com/karpathy/status/1799949853289804266)
- [Terminal mockup (CodePen — shreyasminocha)](https://codepen.io/shreyasminocha/pen/rGVdMr) · [Full CSS terminal + blink cursor (nths)](https://codepen.io/nths/pen/VpLdMK)
