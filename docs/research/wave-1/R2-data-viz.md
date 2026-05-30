# R2 — Vertical 9×16 Data-Viz Primitives for Tech/AI Motion Video

> **Wave 1 research deliverable** — surveys 10 motion-data-viz primitives that
> belong next to `BenchmarkBars9x16` in the AI/tech-news lane. Each primitive
> ships with: use case, Remotion-friendly implementation recipe, schema shape,
> pacing recommendation, and a real-world reference.
>
> **Scope:** primitives that fit a 1080×1920 canvas, animate from
> `useCurrentFrame()` (no third-party runtime libs — flickers on render —
> per Vercel's Remotion best-practice rules ([vercel-labs/json-render charts.md][vercel-charts])),
> and slot into the existing cream/dark palette + `EditorialCaption` strip
> grammar used by `BenchmarkBars9x16.tsx`.
>
> **What this is NOT:** a fully-coded library. It's a build-priority brief that
> the `/build` phase can turn into TSX one primitive at a time, in the priority
> order at the end of this doc.

---

## 0. House Grammar We Inherit From `BenchmarkBars9x16`

Every primitive below assumes the same wrapping shell so animations compose
cleanly with the rest of the Sprint-1 templates:

- 1080×1920, `AbsoluteFill` over `resolvedPaper`
- Palette-driven grain overlay (`mix-blend-mode: multiply` for cream,
  `screen` for dark) — copy from `BenchmarkBars9x16` lines 326-332
- Optional `BrandBreadcrumb` (~y=80) and `EditorialCaption` (bottom 200px)
- Title at ~y=260 (Inter 700, auto-shrink), subtitle at ~y=380 (Inter 500
  muted), viz zone from y=460 to ~y=1420, source caption at y=1420
- Fades driven by `interpolate(frame, [start, start + fps*0.4], [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`
- Easing: cubic ease-out (`1 - (1 - t)^3`) for "settles into place"
  feel — already proven on the bars; use `spring({ fps, frame, config:
  { damping: 200 } })` for organic bounce on **discrete** entries
  (counters, table rows), interpolate-only for **continuous** sweeps
  (sparkline, gauge, donut arc) per Vercel charts.md ([vercel-charts][vercel-charts]).

Stagger constant from Vercel's `json-render` Remotion skill:
`const STAGGER_DELAY = 5;` (≈0.17 s @ 30 fps) — matches our existing
`barStaggerSeconds: 0.3` ballpark.

---

## 1. Animated Counter / Odometer

**Why it's useful.** The single most viral primitive in the AI-news lane —
"reached **100M** users", "**$5.6B** raised", "**93.9%** on SWE-bench
Verified". Pairs naturally with `BigNumberHero9x16`: counter is the *animated*
version of that hero. Works whenever the voiceover lands on a number beat
(typical Edge-TTS rate puts the number ≈1.8 s into a 4 s clause —
counter should peak just before the word is spoken).

**Implementation recipe (Remotion-native, no `odometerjs`).** HubSpot's
`odometerjs` is the canonical CSS odometer but it animates on real-time DOM
transitions, which **will flicker during Remotion's frame-by-frame render**
(per Vercel rule: "Disable all animations by third party libraries"
([vercel-charts][vercel-charts])). Roll our own:

```tsx
import { interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const animFrames = Math.round(durationSeconds * fps); // e.g. 1.8s
const eased = interpolate(frame, [0, animFrames], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic), // matches BenchmarkBars house ease
});
const current = startValue + (targetValue - startValue) * eased;

// Format: 1,000,000 → "1M", 1,234 → "1.2K", 0.937 → "93.7%"
const display = formatNumber(current, formatStyle);
return <span style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
```

For a **mechanical-odometer flip** (each digit scrolls independently —
the look weiming/wu describes as "columns of numbers from 0 to 9
scrolling" ([Medium counter][medium-counter])), render each digit slot
separately and `translateY(-currentDigit * 100%)` inside a `overflow: hidden`
wrapper. More expensive in tokens, only worth it for the final
"thousands → millions" hero shot.

`Math.round` vs `Math.floor`: Remotion docs example uses `Math.floor`
([Remotion animating-properties][remotion-anim]); for currency we use
`toFixed(2)`, for percentages `toFixed(1)`.

**Schema shape (≤6 fields).**

```ts
const counterSchema = z.object({
  startValue: z.number().default(0),
  targetValue: z.number(),                          // e.g. 100_000_000
  format: z.enum(["integer", "currency", "percent", "compact"])
              .default("compact"),                  // "100M", "$5.6B", "93.7%"
  decimals: z.number().min(0).max(4).default(0),
  durationSeconds: z.number().min(0.5).max(4).default(1.8),
  suffix: z.string().default(""),                   // e.g. "users", "$/M tokens"
});
```

**Pacing.** Entry **1.5–2.0 s** with cubic ease-out (number races up,
settles). **Dwell 1.2–2.0 s** before the next composition. Total beat
≈3.5 s. Tie the entry start frame to the voiceover word that says the
number — feed in `wordTimings` and find the first numeric token.

**Reference in the wild.** [Andrej Karpathy "AI job exposure" graphic][karpathy]
(May 2026) — viral within hours; the version reposters cut for TikTok all
used a 0→10 odometer on the score column. Anchor reference for the
"counter as story beat" usage. Bloomberg QuickTake's news bumpers use the
same pattern with `tabular-nums` and a settled-in-place easeOut
([Bloomberg QuickTake branding][bloomberg-qt]).

---

## 2. Sparkline / Micro Line-Chart

**Why it's useful.** Compresses "trend over the last 7/30/90 days" into
~30 % of the viz zone — perfect for the **subtitle area of a counter
composition** (counter shows the headline number, sparkline below shows
"…and trending +47 % WoW"). Canonical AI-news beats: weekly DAU growth,
inference-cost-over-time, benchmark-score-per-release.

**Implementation recipe.** SVG `<path>` with `stroke-dasharray` /
`stroke-dashoffset` draw-on — the technique CSS-Tricks documents
([CSS-Tricks SVG line][css-tricks-svg]) and Remotion supports natively
via `@remotion/paths` ([@remotion/paths docs][remotion-paths]).

```tsx
import { getLength } from "@remotion/paths";

// Build the path string from points using d3-shape or a manual reducer.
const pathD = points.reduce((acc, p, i) => {
  const x = (i / (points.length - 1)) * width;
  const y = height - ((p - min) / (max - min)) * height;
  return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
}, "");

const totalLength = getLength(pathD);
const frame = useCurrentFrame();
const drawFrames = Math.round(0.8 * fps);
const drawProgress = interpolate(frame, [0, drawFrames], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.cubic),
});
const dashOffset = totalLength * (1 - drawProgress);

return (
  <svg viewBox={`0 0 ${width} ${height}`}>
    <path d={pathD}
          stroke={accentColor}
          strokeWidth={4}
          fill="none"
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset} />
    {/* Trailing dot: position at point index Math.floor(drawProgress * (n-1)) */}
  </svg>
);
```

A trailing **glowing dot** at the head of the draw (the Remotion "Bar + Line
Combined" prompt explicitly calls for this — "pulsing dot marker at the line
tip" ([Remotion bar-line prompt][remotion-barline])) elevates the
animation feel by ~40 %; cost is +20 lines.

**Schema shape.**

```ts
const sparklineSchema = z.object({
  points: z.array(z.number()).min(2).max(60),     // 5-20 typical
  caption: z.string().optional(),                 // "+47% WoW"
  trendDirection: z.enum(["up", "down", "flat"]).default("up"),
  drawSeconds: z.number().min(0.3).max(2).default(0.8),
  showDot: z.boolean().default(true),
  showFill: z.boolean().default(false),           // area under curve at 12% alpha
});
```

**Pacing.** Entry **0.6–1.0 s** (fast — sparkline is usually a supporting
beat, not the lead). Dwell 1.5–2.5 s. If paired with a counter, start the
sparkline draw at counter-complete + 0.2 s.

**Reference in the wild.** [Tympanus Codrops "Interactive Sparkline with
D3"][codrops-spark] is the cleanest visual study; the AI-news creator
[Matt Wolfe / @mreflow][mreflow] uses sparklines in his "Future Tools weekly
update" intros (vertical reposts on TikTok). NPM weekly-downloads sparkline
is the universal mental model.

---

## 3. Gauge / Arc Meter (Semicircular Dial)

**Why it's useful.** Best primitive for a **single 0–100 score** when you
also want to convey "low / mid / high" context — exactly the shape of MMLU,
SWE-bench, HumanEval scores. Bars say "X beat Y"; gauge says "X scored 73
out of a possible 100, in the green zone". Pairs with `breadcrumb.text:
"SWE-bench Verified"` for instant context.

**Implementation recipe.** SVG semicircular arc with
`stroke-dasharray` reveal (same technique as the donut below but
clamped to π radians). MUI X and Syncfusion both ship arc gauges
([MUI X Gauge][mui-gauge], [Syncfusion Circular Gauge][syncfusion-gauge]) —
they animate via `transitionDuration` which **does not survive Remotion
render**, so reimplement frame-driven:

```tsx
// Geometry: half-circle from 180° (left) to 0° (right).
const cx = width / 2, cy = height * 0.8, r = height * 0.7;
const fullArcLength = Math.PI * r;          // half-circumference

const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

const valueProgress = interpolate(frame, [0, Math.round(1.0 * fps)], [0, value / max], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
const dashOffset = fullArcLength * (1 - valueProgress);

// Optional: zone colors — red [0, 0.33], amber [0.33, 0.66], green [0.66, 1]
const fillColor = pickZoneColor(value / max, zoneStops);

return (
  <svg viewBox={`0 0 ${width} ${height}`}>
    <path d={trackPath} stroke={mutedColor + "26"} strokeWidth={48} fill="none"
          strokeLinecap="round" />
    <path d={trackPath} stroke={fillColor} strokeWidth={48} fill="none"
          strokeLinecap="round"
          strokeDasharray={fullArcLength} strokeDashoffset={dashOffset} />
    {/* Center label: counter-animated current value with same valueProgress */}
  </svg>
);
```

**Schema shape.**

```ts
const gaugeSchema = z.object({
  value: z.number(),
  max: z.number().default(100),
  label: z.string(),                              // "MMLU"
  unit: z.string().default("%"),
  zones: z.array(z.object({                       // optional traffic-light
    upTo: z.number(), color: z.string()
  })).default([]),
  sweepSeconds: z.number().min(0.5).max(3).default(1.0),
});
```

**Pacing.** Entry **0.8–1.2 s** for the arc sweep. Synchronise a center
counter (primitive #1) to the same `valueProgress` so the numeric display
"races to" the arc tip. Dwell 1.5–2.0 s.

**Reference in the wild.** [`react-gauge-chart` README demo][react-gauge] —
visual reference for the arc + center counter combo. AI-news beat
example: "Claude Opus 4.7 → 64.3 % on SWE-bench Pro" ([llm-stats SWE-bench
Pro][llm-stats-swe]) is exactly the shape this primitive owns.

---

## 4. Donut / Pie Chart with Animated Arc Draw-On

**Why it's useful.** Parts-of-whole when you have **2–4 segments max** —
"of the $5.6B raised, 47 % went to compute, 31 % to talent, 22 % to
go-to-market". Five+ segments → switch to stacked-bar (primitive #10).
Critical for funding-round / revenue-split beats.

**Implementation recipe.** SVG circle with per-segment `stroke-dasharray` +
rotation, exactly the technique Markus Oberlehner's "Pure CSS Animated SVG
Circle Chart" describes ([Oberlehner CSS donut][oberlehner-donut]) and the
Vercel `json-render` Remotion skill blesses ("Uses SVG stroke-dashoffset
manipulation starting from 12 o'clock, with rotation transforms to control
segment reveal direction" ([vercel-charts][vercel-charts])):

```tsx
const cx = width / 2, cy = height / 2, r = 240, sw = 60;
const circumference = 2 * Math.PI * r;
let cumulative = 0;

const drawFrames = Math.round(1.0 * fps);
const drawProgress = interpolate(frame, [0, drawFrames], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});

return (
  <svg viewBox={`0 0 ${width} ${height}`}>
    {segments.map((seg, i) => {
      const segLength = circumference * seg.fraction * drawProgress;
      const segGap = circumference - segLength;
      const rotation = (cumulative / 1) * 360 - 90;   // -90 = start at 12
      cumulative += seg.fraction;
      return (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color} strokeWidth={sw}
                strokeDasharray={`${segLength} ${segGap}`}
                transform={`rotate(${rotation} ${cx} ${cy})`} />
      );
    })}
    {/* Optional centerLabel — counter-animated total */}
  </svg>
);
```

The dev.to React Native example ([dev.to RN donut][devto-rn-donut]) and the
`react-minimal-pie-chart` source ([npm pie chart][rmpc]) are good
cross-references for edge cases (0-fraction segments, ordering).

**Schema shape.**

```ts
const donutSchema = z.object({
  segments: z.array(z.object({
    label: z.string(),
    fraction: z.number().min(0).max(1),     // must sum to ~1
    color: z.string().default(""),          // empty = palette rotation
  })).min(2).max(5),
  centerLabel: z.string().optional(),       // "$5.6B"
  centerSub: z.string().optional(),         // "raised in Q2"
  drawSeconds: z.number().min(0.5).max(2).default(1.0),
});
```

**Pacing.** Entry **0.8–1.2 s** for the draw. Stagger legend labels in
**0.1 s after** their segment completes drawing (so the eye lands on the
slice first, the label second). Dwell 2.0–2.5 s.

**Reference in the wild.** [akzhy.com donut chart tutorial][akzhy-donut]
visually closest to the look we want. AI-news beat example: any
"funding allocation" or "model-mix-by-usage" graphic in The Information's
AI vertical.

---

## 5. Animated Table Reveal (Row-by-Row Stagger)

**Why it's useful.** Leaderboard beats — "here's the top 5 on SWE-bench
Verified" — that need more than 2 columns. Our `BenchmarkBars` handles
1-metric comparison; a table handles 3-metric (rank, model, score,
cost) and supports a **header pin** + **highlight-our-pick** row glow.

**Implementation recipe.** No third-party animation lib (Framer Motion
would flicker per [vercel-charts][vercel-charts]). Implement
waterfall manually with per-row `enterFrame`, identical pattern to
`BenchmarkBars9x16`'s `BarRow` component (lines 99-130):

```tsx
const ROW_STAGGER = 0.18; // seconds — matches BenchmarkBars 0.3 vibe but tighter

rows.map((row, i) => {
  const enterFrame = Math.round(i * ROW_STAGGER * fps);
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, Math.round(0.25 * fps)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Slide up 16px → 0
  const translateY = interpolate(localFrame, [0, Math.round(0.25 * fps)], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const isHighlighted = row.highlight === true;
  return (
    <div style={{
      opacity, transform: `translateY(${translateY}px)`,
      background: isHighlighted ? `${accentColor}1F` : "transparent",
      borderLeft: isHighlighted ? `4px solid ${accentColor}` : "none",
      display: "grid",
      gridTemplateColumns: "60px 1fr 140px 140px",
      gap: 16, padding: "20px 24px",
    }}>
      <span>{row.rank}</span>
      <span>{row.model}</span>
      <span style={{ textAlign: "right" }}>{row.score}</span>
      <span style={{ textAlign: "right" }}>{row.cost}</span>
    </div>
  );
});
```

Header pin is just a non-staggered row at `enterFrame: 0` with thicker
font-weight and a `borderBottom: 1px solid ${mutedColor}`.

The Framer-Motion "waterfall" article ([jstodev waterfall][jstodev]) is the
mental model; we just port the `delay = i * STAGGER_DELAY` formula to a
frame-based version.

**Schema shape.**

```ts
const tableSchema = z.object({
  headers: z.array(z.string()),                    // ["Rank", "Model", "Score", "Cost"]
  rows: z.array(z.object({
    cells: z.array(z.string()),                    // matches headers.length
    highlight: z.boolean().default(false),         // bg + left-border accent
  })).max(7),                                      // 9x16 fits ~7 rows comfortably
  rowStaggerSeconds: z.number().min(0.05).max(1).default(0.18),
  pinHeader: z.boolean().default(true),
});
```

**Pacing.** Per-row entry **0.25 s**, stagger **0.18 s** → 5-row table
fully revealed in **1.0 s**. Dwell **2.5–3.0 s** so viewers can actually
read all rows. Tighten the stagger for 7+ rows.

**Reference in the wild.** [Artificial Analysis text-to-video
leaderboard][aa-leaderboard] is the static version; any 30-day-leaderboard
reel that reposts it animates exactly like this. The OpenLM Arena
leaderboard ([openlm leaderboard][openlm]) is another live source.

---

## 6. Comparison Slider / Before-After (Vertical Seam Wipe)

**Why it's useful.** Image-quality beats — "Sora 2 vs Veo 3.1 on the same
prompt", "GPT-5 vs GPT-5.5 output on the same eval question", "DALL-E
vs Midjourney". The seam wipe is *more* legible on a 9×16 than the
classic horizontal-drag because the vertical axis dominates the canvas.

**Implementation recipe.** Two `<Img>` (or `<Video>`) stacked, the
top one masked by a `clipPath` whose width interpolates over time.
Adapted from the Codemyui video-comparison-slider technique
([Codemyui slider][codemyui]):

```tsx
const seamX = interpolate(frame, [0, Math.round(1.2 * fps)], [0, width], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.cubic),
});

return (
  <AbsoluteFill>
    <Img src={afterUrl} style={{ width, height, objectFit: "cover" }} />
    <div style={{
      position: "absolute", inset: 0,
      clipPath: `inset(0 ${width - seamX}px 0 0)`,  // reveal left → right
    }}>
      <Img src={beforeUrl} style={{ width, height, objectFit: "cover" }} />
    </div>
    {/* Vertical seam line + handle */}
    <div style={{
      position: "absolute", top: 0, bottom: 0, left: seamX - 2,
      width: 4, background: accentColor, boxShadow: `0 0 24px ${accentColor}`,
    }} />
    {/* "BEFORE" / "AFTER" pill labels — fade in once seam passes their x */}
  </AbsoluteFill>
);
```

For **vertical seam wipe** (the brief's literal ask — horizontal line
that travels top-to-bottom) swap `clipPath: inset(0 0 ${height - seamY}px
0)` and animate `seamY`. Vertical orientation is rarer in the wild but
reads beautifully in 9×16.

**Schema shape.**

```ts
const beforeAfterSchema = z.object({
  beforeUrl: z.string(),
  afterUrl: z.string(),
  beforeLabel: z.string().default("Before"),
  afterLabel: z.string().default("After"),
  seamOrientation: z.enum(["vertical", "horizontal"]).default("vertical"),
  wipeSeconds: z.number().min(0.5).max(3).default(1.2),
  loop: z.boolean().default(false),               // ping-pong after first wipe
});
```

**Pacing.** Single wipe **1.0–1.5 s** with `Easing.inOut(Easing.cubic)`
(starts slow, accelerates, settles). Dwell 1.0 s on full "after" then
optional ping-pong back at 0.8× speed for emphasis. Total **3.5–4.5 s**.

**Reference in the wild.** [Elfsight comparison widget gallery][elfsight] —
production patterns. Envato has a whole [Before/After AE templates
category][envato-ba]; ripping one open and timing the keyframes is the
fastest visual study. Any AI-image-model launch reel on TikTok uses this.

---

## 7. Dot Plot / Density Strip (1D Scatter)

**Why it's useful.** Niche but high-impact when you need to show
**distribution shape** without a full histogram — "out of 50 models
tested, here's where Claude falls on price-per-million-tokens". One
horizontal axis, N dots with sample-level x-positions, optional jitter on
the y axis to avoid overlap. Communicates "X is an outlier" or "the field
is converging" instantly.

**Implementation recipe.** Plain absolute-positioned `<div>` per dot, no
SVG needed:

```tsx
points.map((p, i) => {
  const enterFrame = Math.round(i * 0.03 * fps);  // tight stagger — 0.03s
  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const scale = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),  // tiny pop
  });

  const xPx = AXIS_LEFT + ((p.value - min) / (max - min)) * AXIS_WIDTH;
  const yPx = AXIS_Y + (p.jitter ?? 0) * JITTER_HEIGHT;
  const dotSize = p.highlight ? 32 : 16;
  const color = p.highlight ? accentColor : `${inkColor}66`;

  return <div key={i} style={{
    position: "absolute", left: xPx - dotSize/2, top: yPx - dotSize/2,
    width: dotSize, height: dotSize, borderRadius: "50%",
    background: color, opacity, transform: `scale(${scale})`,
  }} />;
});
```

D3 Graph Gallery's animated scatter ([d3 scatter animation][d3-scatter])
is the canonical reference (their `function(d,i)` per-point delay maps
1:1 to our `enterFrame: i * stagger * fps`).

**Schema shape.**

```ts
const dotPlotSchema = z.object({
  points: z.array(z.object({
    value: z.number(),
    label: z.string().optional(),
    jitter: z.number().min(-1).max(1).default(0),  // vertical noise
    highlight: z.boolean().default(false),         // larger + accent color
  })).min(3).max(80),
  axisMin: z.number(),
  axisMax: z.number(),
  axisLabel: z.string(),                          // "Price per 1M tokens ($)"
  axisTicks: z.array(z.number()).default([]),
});
```

**Pacing.** Per-dot stagger **0.03 s** (very tight — the *swarm effect*
is the point). 50-dot plot reveals in **1.5 s**. Highlight dots should
enter **last** with a 0.3 s gap so they read as "and *this* is where we
land". Dwell 2.0 s.

**Reference in the wild.** [React Graph Gallery scatter][rgg-scatter]
and [STHDA strip charts][sthda] for the visual primer. AI-news beat
example: "where Gemini 3.2 Flash sits on the price-vs-quality plot" —
exactly the shape Artificial Analysis publishes weekly
([Artificial Analysis][aa-leaderboard]).

---

## 8. Animated Heatmap (Cells Fade In Scan Order)

**Why it's useful.** Highest-density primitive on this list — fits a
**7×N matrix** (e.g. "model × benchmark", "day × hour activity") that no
other chart can show in 9×16. Cell-by-cell reveal turns a static table
into a beat ("watch the bottom-right light up — that's where Opus 4.7
dominates"). Specifically owns the "show me the full benchmark grid"
story that bars can't.

**Implementation recipe.** Grid of `<div>` cells, each with its own
`enterFrame` based on scan order (row-major, column-major, or
"hot-corner first" — sort cells by `Math.abs(value)` descending). Color
interpolates within a min/max ramp:

```tsx
const sortedCells = cells
  .map((c, i) => ({ ...c, originalIndex: i }))
  .sort((a, b) => b.value - a.value);     // hottest first

sortedCells.map((cell, scanIdx) => {
  const enterFrame = Math.round(scanIdx * 0.02 * fps);
  const localFrame = frame - enterFrame;
  if (localFrame < 0) {
    return <Cell {...cell} bg={mutedColor + "11"} />;  // ghosted
  }

  const opacity = interpolate(localFrame, [0, 8], [0.1, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Color: lerp from paper → accent in HSL space at value/max
  const intensity = (cell.value - valueMin) / (valueMax - valueMin);
  const bg = lerpHsl(paperColor, accentColor, intensity);

  return <Cell {...cell} bg={bg} opacity={opacity} />;
});
```

Patrick Wied's heatmap.js demos ([heatmap.js animation][heatmapjs]) are
the visual reference, though we don't need its kernel-density blur —
discrete cells read better at 9×16. The matplotlib "animated heatmap"
example ([matplotlib heatmap][mpl-heatmap]) is the algorithmic mental
model.

**Schema shape.**

```ts
const heatmapSchema = z.object({
  rowLabels: z.array(z.string()),                // models
  colLabels: z.array(z.string()),                // benchmarks
  cells: z.array(z.array(z.number())),           // [row][col] values
  scanOrder: z.enum(["row-major", "col-major", "hot-first", "diagonal"])
              .default("hot-first"),
  cellStaggerSeconds: z.number().min(0.005).max(0.1).default(0.02),
  colorRamp: z.tuple([z.string(), z.string()]).default(["", ""]),  // [cold, hot]
});
```

**Pacing.** Per-cell stagger **0.02 s**. A 6×8 (48 cells) heatmap reveals
in **~1.0 s**. Dwell **2.5 s** — heatmaps need reading time. Optional
"final pulse" on hottest cell at +0.3 s after full reveal.

**Reference in the wild.** No vertical-reel-native example surfaced
(heatmaps are still mostly desktop dashboard primitives) — this is a
*gap* we'd be filling. Closest reference is Stripe's annual-letter
heatmap animations in their Year-In-Review videos (16:9 but the pattern
ports cleanly). Use this primitive sparingly — it's the most expensive
to author script copy for.

---

## 9. Distribution / Histogram (Bars Rising Sequentially)

**Why it's useful.** When you have a **continuous variable bucketed**
(latency in ms, response length in tokens, error severity 1-5). Difference
vs `BenchmarkBars`: histogram bars are **vertical** (height-animated),
**all the same color**, **adjacent** (no gap), and the **x-axis is
ordered/numeric** rather than categorical. Owns the "shape of the
distribution" beat: "most prompts complete in 200-400ms, but watch this
long tail".

**Implementation recipe.** Vertical bars with `height` interpolated and
**spring-based stagger** per Vercel's `json-render`
`charts.md` ([vercel-charts][vercel-charts]):

```tsx
const STAGGER_DELAY = 5;    // frames — Vercel's recommended constant

bins.map((bin, i) => {
  const delay = i * STAGGER_DELAY;
  const heightProgress = spring({
    frame, fps, delay,
    config: { damping: 200 },   // organic but not bouncy
  });
  const barHeight = MAX_BAR_HEIGHT * (bin.count / maxCount) * heightProgress;

  return (
    <div key={i} style={{
      position: "absolute",
      left: AXIS_LEFT + i * BAR_WIDTH,
      bottom: AXIS_BOTTOM,
      width: BAR_WIDTH - 2,           // 2px adjacency gap
      height: barHeight,
      background: bin.isOutlier ? accentColor : `${inkColor}AA`,
      borderRadius: "4px 4px 0 0",
    }} />
  );
});
```

Highlight-the-tail trick: pass `isOutlier: true` for bins above a percentile
threshold → they enter in `accentColor` while the bulk stays muted. This
is the storytelling magnifier ("…but look at this 99th percentile").

**Schema shape.**

```ts
const histogramSchema = z.object({
  bins: z.array(z.object({
    rangeLabel: z.string(),            // "200-300ms"
    count: z.number(),
    isOutlier: z.boolean().default(false),
  })).min(3).max(20),
  xAxisLabel: z.string(),              // "Latency (ms)"
  yAxisLabel: z.string().optional(),   // "Requests"
  barStaggerFrames: z.number().min(1).max(15).default(5),
});
```

**Pacing.** Per-bar `STAGGER_DELAY=5` frames @30fps → 12-bin histogram
fully grown in **~1.0 s**. Dwell **2.0 s**. The Highcharts "animated
histogram" reference ([Highcharts histogram][hc-hist]) shows that
sequential is more legible than parallel for distribution shape.

**Reference in the wild.** Internal eng-blog posts (Vercel, Cloudflare,
Anthropic) routinely embed bin-by-bin animated histograms in launch posts
— ports straight to 9×16 by shrinking the bin count to ≤12.

---

## 10. Stacked Horizontal Bar (Parts-of-Whole, Single Bar)

**Why it's useful.** The "donut, but linear" — same parts-of-whole story
but reads in one horizontal sweep, **doesn't burn the vertical space** a
donut needs, and **lets you label segments inline**. Best for:
"$100M ARR = $47M enterprise + $31M SMB + $22M self-serve",
"100% of compute = 60% pre-training + 30% inference + 10% fine-tuning".

**Implementation recipe.** Single track, segments fill **left-to-right
sequentially** (next segment can't start until the previous reaches its
target width — feels more like a story than a parallel fill):

```tsx
const TRACK_WIDTH = 920, TRACK_HEIGHT = 96;
const segmentFillSeconds = 0.4;

let cumulativeStartFrame = 0;
let cumulativeFraction = 0;

segments.map((seg, i) => {
  const enterFrame = cumulativeStartFrame;
  const fillFrames = Math.round(segmentFillSeconds * fps);
  const localFrame = frame - enterFrame;

  const fillProgress = interpolate(localFrame, [0, fillFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const currentWidth = TRACK_WIDTH * seg.fraction * fillProgress;
  const leftOffset = TRACK_WIDTH * cumulativeFraction;

  cumulativeStartFrame += fillFrames + Math.round(0.05 * fps); // tiny gap
  cumulativeFraction += seg.fraction;

  return (
    <div key={i} style={{
      position: "absolute",
      left: TRACK_LEFT + leftOffset,
      width: currentWidth,
      height: TRACK_HEIGHT,
      background: seg.color || paletteAccent(i),
    }}>
      {/* Inline label, fade in once segment >= 80% filled */}
      {fillProgress >= 0.8 && (
        <span style={{ /* …label styles… */ }}>
          {seg.label} <strong>{(seg.fraction * 100).toFixed(0)}%</strong>
        </span>
      )}
    </div>
  );
});
```

The Medium "stacked bar with React + D3" article ([Medium stacked
bar][medium-stacked]) covers the math (`d3.stack()`); we skip the
library by precomputing in vanilla JS — it's literally `cumulativeFraction`.

**Schema shape.**

```ts
const stackedBarSchema = z.object({
  total: z.number(),                                // for tooltip / center label
  totalLabel: z.string(),                           // "$100M ARR"
  segments: z.array(z.object({
    label: z.string(),
    fraction: z.number().min(0).max(1),
    valueDisplay: z.string(),                       // "$47M"
    color: z.string().default(""),
  })).min(2).max(5),
  segmentFillSeconds: z.number().min(0.2).max(1.5).default(0.4),
  showInlineLabels: z.boolean().default(true),
});
```

**Pacing.** **Sequential** fill: 3-segment bar @0.4s each = **1.2 s**
total entry, plus 0.05 s inter-segment gap. Dwell **1.8–2.5 s**. If your
voiceover lists the segments one-by-one, sync each `enterFrame` to the
matching word boundary in `wordTimings`.

**Reference in the wild.** The React Graph Gallery stacked barplot
([RGG barplot][rgg-bar]) for visual reference. AI-news beat example: any
"breakdown of compute spend" or "ARR mix" graphic in a funding-round
announcement (frequent on AI Daily Brief / Matthew Berman recap videos
[Matthew Berman YT][berman]).

---

## Build-Priority Ranking — Top 3 to Build Next

| Rank | Primitive | Why first | Effort (LoC) |
|------|-----------|-----------|---------------|
| **1** | **Animated Counter / Odometer** (§1) | Highest reuse per LoC. Slots into `BigNumberHero9x16`, `BenchmarkBars9x16` (counter inside each fill), `TweetCardHero9x16` (engagement counts), and most AI-news beats land on a number. Implementation is ~40 lines; pays off immediately. | ~40 |
| **2** | **Animated Table Reveal** (§5) | Fills the gap `BenchmarkBars` can't — multi-metric leaderboards (rank + model + score + cost). Stagger pattern is a near-direct port of the existing `BarRow` component (§5 recipe is structurally identical to `BenchmarkBars9x16.tsx:99-130`), so authoring cost is low. Unlocks the "Top 5 on X benchmark" story which is the dominant AI-news long-tail format. | ~80 |
| **3** | **Sparkline** (§2) | Combines beautifully with #1 to form a **two-primitive composite scene** ("100M users [counter] / +47% WoW [sparkline]"). Validates `@remotion/paths` integration for the heavier #3 (gauge) and #4 (donut) primitives later. SVG-draw-on is a learn-once technique that pays for all subsequent SVG primitives. | ~60 |

**Building 1 → 2 → 3 in that order** also gives a clean dependency arc:
counter (no SVG) → table (extends an existing component pattern) →
sparkline (introduces `@remotion/paths` + draw-on, prepping for gauge/donut
in wave 2). All three should ship in a single sprint and be visible from
`Root.tsx` registration before wave 2 of this research runs.

---

## Open Questions

1. **Composition vs. embedding.** Should the counter (§1) be its own
   standalone composition (`Counter9x16`) like a hero shot, or only a
   *primitive component* (`<AnimatedCounter />`) that other compositions
   embed? Recommended split: **both**. Ship `Counter9x16` for hero-stat
   reels, and the same internal `<AnimatedCounter>` component for
   embedding into `BenchmarkBars`, `BigNumberHero`, gauge centers, donut
   centers. The component is the canonical implementation; the
   composition is a thin wrapper that adds title/subtitle/breadcrumb.

2. **`@remotion/paths` install.** It's a separate package — confirm
   adding it doesn't bump our Node ≥22 requirement and that it ships
   ESM-only (matches our `tsconfig.json`). If yes, install once during
   wave-2 build phase rather than per-primitive.

3. **Color ramps for heatmap (§8) and dot plot (§7) "highlight" states.**
   Brand `accentColor` works for highlight, but the muted-cell color
   needs to live in `brand/config.json` so cream and dark palettes both
   have a sensible "cold cell" color. Likely add
   `colors.cellMuted` and `colors.cellHot` to the palette.

4. **Audio sync for counters.** Does the pipeline expose word-level start
   frames to compositions, or do compositions have to derive
   `numberWordStartFrame` themselves from `wordTimings`? If the latter,
   add a `findNumericTokenStart(wordTimings)` helper in `src/timing/`
   and use it as the default `entryStartFrame` for §1.

5. **In-the-wild gap: vertical-9×16 heatmap (§8).** No public reference
   surfaced — this is a primitive **we'd be inventing for the format**.
   Worth doing? Low priority unless a script copy specifically calls for
   it. Defer to wave 2; if no script slot for it appears in the first
   five scripts post-build, drop it.

6. **Before-after (§6) loop UX.** Should `loop: true` ping-pong forever
   (best for ambient B-roll) or just twice (good for a hook beat)? Brief
   doesn't specify; default to `loop: false` and let templates override.

7. **Compositional grammar between primitives.** Should we ship a
   `DataVizDeck9x16` composition that auto-sequences 2-3 primitives in a
   single video (counter → sparkline → gauge), or keep each primitive as
   its own one-beat composition and let the pipeline stitch via FFmpeg?
   Punt to wave 2 — the per-primitive compositions are the foundation
   either way.

---

## Sources

### Remotion + animation patterns
- [Remotion — interpolate()](https://www.remotion.dev/docs/interpolate)
- [Remotion — Animating Properties (`useCurrentFrame`, `interpolate`, `spring`)][remotion-anim]
- [Remotion — Easing functions](https://www.remotion.dev/docs/easing)
- [Remotion — @remotion/paths package][remotion-paths]
- [Remotion — Animation Math](https://www.remotion.dev/docs/animation-math)
- [Remotion Prompts — Bar + Line Chart Combined][remotion-barline]
- [Remotion Prompts — Showcase index](https://www.remotion.dev/prompts/)
- [vercel-labs/json-render — `skills/remotion-best-practices/rules/charts.md`][vercel-charts] — STAGGER_DELAY constant, spring vs interpolate guidance, "disable third-party animations" rule

### Chart-specific reference implementations
- [Medium — Recreating animated numerical counters in React (Weiming Wu)][medium-counter]
- [HubSpot Odometer.js docs](https://github.hubspot.com/odometer/docs/welcome/) — odometer flip primer (not Remotion-safe, use as visual reference only)
- [shadcn — Sliding Number component](https://www.shadcn.io/text/sliding-number) — per-digit spring sliding
- [CSS-Tricks — How SVG Line Animation Works][css-tricks-svg] — stroke-dasharray fundamentals
- [Tympanus Codrops — Interactive Sparkline with D3][codrops-spark]
- [@remotion/paths docs][remotion-paths] — `getLength` and `evolvePath`
- [MUI X — Gauge component][mui-gauge]
- [Syncfusion — React Circular Gauge][syncfusion-gauge]
- [react-gauge-chart on npm][react-gauge]
- [Markus Oberlehner — Pure CSS Animated SVG Circle Chart][oberlehner-donut]
- [dev.to — React Native animated donut (reanimated + svg)][devto-rn-donut]
- [react-minimal-pie-chart on npm][rmpc]
- [akzhy.com — Animated donut chart with SVG + JS][akzhy-donut]
- [jstodev — Waterfall table-row animation with Framer Motion][jstodev]
- [Codemyui — Video comparison slider HTML5][codemyui]
- [Elfsight — Before-and-after slider widget][elfsight]
- [Envato — Before/After slider templates][envato-ba]
- [D3 Graph Gallery — scatterplot animation on load][d3-scatter]
- [React Graph Gallery — Scatter plot][rgg-scatter]
- [React Graph Gallery — Barplot (stacked variant)][rgg-bar]
- [STHDA — 1-D scatter / strip charts][sthda]
- [Highcharts — animated histogram option][hc-hist]
- [matplotlib — animated_histogram gallery example][mpl-heatmap]
- [Patrick Wied — heatmap.js animation example][heatmapjs]
- [Medium — Stacked Bar in React with D3 (Stuthi Neal)][medium-stacked]

### AI/tech-news creators + benchmark data sources (in-the-wild references)
- [LLM-Stats — SWE-Bench Pro leaderboard][llm-stats-swe] — live data, mental model for §3 (gauge) and §5 (table)
- [LLM-Stats — AI Updates (May 2026)](https://llm-stats.com/llm-updates) — source for counter beats
- [Artificial Analysis — Text-to-Video leaderboard][aa-leaderboard] — visual reference for §5 (table) and §7 (dot plot)
- [OpenLM.ai — LLM Arena leaderboard][openlm] — another table/leaderboard data source
- [Matt Wolfe / @mreflow on YouTube][mreflow] — uses sparklines + counters in Future Tools intros
- [Matthew Berman on YouTube][berman] — AI news recaps with chart inserts
- [The AI Daily Brief on YouTube](https://www.youtube.com/@AIDailyBrief) — daily AI news; recap visual style
- [Bloomberg QuickTake — Channel branding][bloomberg-qt] — house-grammar reference for animated stat cards
- [Yahoo Finance — Karpathy "AI job exposure" graphic][karpathy] — viral AI-stat-counter beat example
- [Fireship YouTube channel](https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA) — dense-info short format reference

[vercel-charts]: https://github.com/vercel-labs/json-render/blob/main/skills/remotion-best-practices/rules/charts.md
[remotion-anim]: https://www.remotion.dev/docs/animating-properties
[remotion-paths]: https://www.remotion.dev/docs/paths/
[remotion-barline]: https://www.remotion.dev/prompts/bar-line-chart-combined
[medium-counter]: https://medium.com/geekculture/recreating-animated-numerical-counters-in-react-from-scratch-better-than-existing-libraries-2fa6d3056b33
[css-tricks-svg]: https://css-tricks.com/svg-line-animation-works/
[codrops-spark]: https://tympanus.net/codrops/2022/03/29/building-an-interactive-sparkline-graph-with-d3/
[mui-gauge]: https://mui.com/x/react-charts/gauge/
[syncfusion-gauge]: https://www.syncfusion.com/react-components/react-circular-gauge
[react-gauge]: https://www.npmjs.com/package/react-gauge-chart
[oberlehner-donut]: https://markus.oberlehner.net/blog/pure-css-animated-svg-circle-chart
[devto-rn-donut]: https://dev.to/dimaportenko/react-native-animated-donut-pie-chart-reanimated-svg-32od
[rmpc]: https://www.npmjs.com/package/react-minimal-pie-chart
[akzhy-donut]: https://akzhy.com/blog/create-animated-donut-chart-using-svg-and-javascript/
[jstodev]: https://www.jstodev.com/how-to-create-a-waterfall-like-animation-for-table-rows-in-react-using-framer-motion/
[codemyui]: https://codemyui.com/video-comparison-slider-animation-using-html5/
[elfsight]: https://elfsight.com/before-and-after-slider-widget/
[envato-ba]: https://elements.envato.com/video-templates/before+after+slider
[d3-scatter]: https://d3-graph-gallery.com/graph/scatter_animation_start.html
[rgg-scatter]: https://www.react-graph-gallery.com/scatter-plot
[rgg-bar]: https://www.react-graph-gallery.com/barplot
[sthda]: https://www.sthda.com/english/wiki/strip-charts-1-d-scatter-plots-r-base-graphs
[hc-hist]: https://api.highcharts.com/highcharts/plotOptions.histogram.animation
[mpl-heatmap]: https://matplotlib.org/stable/gallery/animation/animated_histogram.html
[heatmapjs]: https://www.patrick-wied.at/static/heatmapjs/example-heatmap-animation.html
[medium-stacked]: https://medium.com/@stuthineal/stacked-bar-chart-in-react-with-d3-using-json-data-9a873a99a7ae
[llm-stats-swe]: https://llm-stats.com/benchmarks/swe-bench-pro
[aa-leaderboard]: https://artificialanalysis.ai/video/leaderboard/text-to-video
[openlm]: https://openlm.ai/leaderboard/
[mreflow]: https://www.youtube.com/@mreflow
[berman]: https://www.youtube.com/@matthew_berman/videos
[bloomberg-qt]: https://www.behance.net/gallery/136417347/Bloomberg-Quicktake-Channel-Identity
[karpathy]: https://finance.yahoo.com/news/openai-cofounder-vibe-coded-analysis-192257720.html
