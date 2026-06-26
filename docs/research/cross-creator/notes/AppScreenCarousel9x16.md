# AppScreenCarousel9x16 ↔ codingfab (NEW — 2026-06 CodingFab-derived)

**Creator pattern:** *FauxAppWalkthroughCarousel* — a polished fake-product UI tour where
several full-screen app states (a "Trading Hub" / "Learning Hub" style product) are shown
in sequence: a branded top bar with app wordmark, a screen title + sub, scrollable list
rows or cards, and a bottom tab bar — advanced screen-by-screen like a carousel.

**Source reel:** `references/creators/codingfab/nxDVmkv_A-U/frames/`
- `frame-01-t08.09s.jpg` — **Market list screen:** top bar "Trading Hub" (icon + blue
  wordmark), a `Trending:` chip row (`NVDA AAPL TSLA AMD SPY`), section title "My Market
  List", then list rows — each `TICKER` + company name + sector on the left and a big
  `$price` + colored `±delta (±%)` (green up / red down) + star on the right (`AAPL
  $176.33 -0.80%`, `MSFT $386.43 +1.61%`, `NVDA $823.42 -1.05%`, `AMZN`, `META`), and a
  bottom **tab bar** (`Market · Discover · News · Missions · Watchlist · Portfolio · History`).
- `frame-03-t23.88s.jpg` — **Buy/position screen:** order summary (`Current Cash`,
  `Estimated Cost`, `Balance After Purchase`), a blue "Place Buy Order" CTA, a "Current
  Position" stat block, and an "AI Market Analysis" panel.
- `frame-05-t39.67s.jpg` — **Market News screen:** "Market News" title + sub, "Top Stories"
  list with source icon + relative-time + headline rows; the News tab is active in the bar.

**Signature traits:** branded app top-bar (icon + wordmark) · screen title + sub · list rows
with ticker/name/sector + right-aligned price & colored delta · bottom tab bar with one
active tab · multiple screens shown in carousel sequence · green-up / red-down deltas.

## What matches (our render)
Sampled `output/cross-creator/AppScreenCarousel9x16.mp4` @0.4/3.0s:
- **Faux "Trading Hub" product, on-pattern:** top bar with a gold app-icon tile + "Trading
  Hub" wordmark, screen title "My Market List" + sub "Sigue tus posiciones en vivo", and a
  bottom **tab bar** (`Market · News · Portfolio · Watchlist`) with the **Market tab active
  (gold)** — directly mirrors codingfab's branded top-bar + titled screen + active-tab bar.
- **It is a screen carousel:** @0.4s the Market-list screen is establishing; by ~3.0s it has
  advanced to a second screen "Comprar AAPL" / "Confirma tu orden" with stat cards sliding
  in (`$176.33 -0.80%` red, `$386.43 +1.61%` green, `$823.42 -1.05%` red) — same multi-screen
  app-walkthrough cadence, and the **green-up / red-down delta coloring matches exactly**
  (same numbers as codingfab's AAPL/MSFT/NVDA rows: 176.33/386.43/823.42).
- **Rendered inside a phone device frame** (notch, `9:41` status bar, `5G` + battery,
  rounded bezel) — a clean way to read as an app screen in a 9:16 reel.

## What differs (honest)
- **Device bezel vs full-bleed:** codingfab presents the app **full-bleed** (the UI fills the
  frame, no phone chrome); ours wraps it in a literal iPhone bezel + status bar. Reasonable
  presentation choice, but a structural divergence from the source's edge-to-edge app look.
- **Density:** codingfab's list screen shows ~5 detailed rows (ticker + name + sector + price
  + delta + star) plus a Trending chip row and a 7-item tab bar; our Market-list screen reads
  sparser (title + sub, rows populate via the carousel/buy screen), and the tab bar is 4 items.
  The richest source screen is busier than our settled frames.
- **Palette/copy:** brand swap — gold app icon + navy on codingfab's blue wordmark; Spanish
  copy ("Sigue tus posiciones en vivo", "Comprar AAPL", "Confirma tu orden") per the
  default content language. Expected per the cross-creator framing.

**Score: 8/10 — NEW.** Faithful net-new CodingFab template: a faux "Trading Hub" app
walkthrough carousel with branded top bar, titled screens, active-tab bottom bar, and
green-up/red-down price stat cards advancing screen-by-screen. Honest gaps are the added
phone bezel (vs codingfab's full-bleed UI) and lower per-screen row density.
