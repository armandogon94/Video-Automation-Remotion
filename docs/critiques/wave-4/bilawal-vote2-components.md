# Voter 2 — @bilawal.ai COMPONENTS Catalog

**Voter role:** Wave-4 voting agent V2. Independent pass, did NOT read prior ANALYSIS.md or other voters.
**Frames sampled (16, all reels):**
- DW_0tFaj2lU/frames: 00, 03, 06 (Strait of Hormuz, tweet-card recording)
- DWeLzV4hxsp/frames: 00, 03, 06 (OSINT tanker map, tweet-card)
- DWr9DkpDzsI/frames: 00, 04, 07 (talking-head close-up, full-screen map cut-in)
- DWwOcLEOHXI/frames: 00, 03, 06 (tweet-card with "Tehran's Tollbooth" overlay + news clipping)
- DXC96O6CPgC/frames: 00, 04 (street-protest stock, anti-text)
- DYGgyZJPG-M/frames: 00, 04 (Anduril Lattice satire UI, thermal feed)
- DYh_jS_vM4L/frames: 04, 07 (Genie 3 + Street View cinematic clips with tweet overlay)

Reusability scoring: **1 = one-off**, **5 = drop-in every video**.

---

## 1. Logos & Brand Marks

| Component | Frame ref | Notes | Reuse |
|---|---|---|---|
| Avatar circle (creator headshot in tweet header) | DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWwOcLEOHXI/00 | ~80–96 px circle, soft-cropped portrait, top-left of tweet card | 5 |
| Verified blue checkmark (rounded scalloped badge) | DW_0tFaj2lU/00, DWeLzV4hxsp/00 | Always next to display name; X/Twitter blue `#1D9BF0` | 5 |
| Source-logo chip ("INDEPENDENT" news brand) | DWwOcLEOHXI/06 | Red rectangle + white wordmark inside news-clipping card | 3 |
| Fake-product wordmark "ANDURIL LATTICE" | DYGgyZJPG-M/00 | Title-cased, condensed sans, with triangle icon — defense-tech parody mark | 2 |
| "Genie 3" sub-watermark on stock-art video | DYh_jS_vM4L/04, /07 | Centered low-third caption, "Created using Google Street View imagery" | 2 |

## 2. Chrome (UI Frames, HUD Frames)

| Component | Frame ref | Notes | Reuse |
|---|---|---|---|
| Tweet card (whole structure) | DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWwOcLEOHXI/00, DYh_jS_vM4L/04 | Black bg, avatar + name + handle + 2–5 lines body. Anchors **every** non-thermal reel | 5 |
| Classified-doc HUD bar (TOP/BOTTOM) | DYGgyZJPG-M/00 | "ANDURIL LATTICE / CLASSIFICATION: SECRET//NOFORN / timestamp" — top status bar | 3 |
| Thermal-feed viewfinder brackets | DYGgyZJPG-M/04 | Four L-shaped corner crops, classic FLIR/Predator-cam frame | 4 |
| Left-rail icon nav (triangle / play / search / gear) | DYGgyZJPG-M/00 | 4 stacked monochrome icons, mimics defense-software shell | 2 |
| Bottom playback bar (PAUSE/PLAY + speed pills) | DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWwOcLEOHXI/00 | `PAUSE 30M/s 2M/s 6M/s 10M/s` chip row + timeline with dots | 3 |
| Right-side analyst-controls panel | DW_0tFaj2lU/00, DWeLzV4hxsp/00 | Stacked pill buttons (FULL PERIOD, BEFORE/AFTER CHOKEPOINT, SEARCH VESSEL, LAYERS) | 3 |

## 3. Badges, Pills, Chips

| Component | Frame ref | Notes | Reuse |
|---|---|---|---|
| Cyan rounded pill (active filter) | DW_0tFaj2lU/00, DWeLzV4hxsp/00 | Cyan outline + cyan text on dark bg, ~28 px tall, e.g. `FULL PERIOD`, `OPERATIONAL EVENTS` | 5 |
| Live indicator (cyan dot + "LIVE") | DWeLzV4hxsp/00, DWr9DkpDzsI/04 | Pulsing dot left of label, mimics broadcast HUD | 4 |
| Datestamp chip (uppercase, monospace-ish) | DW_0tFaj2lU/03, DWr9DkpDzsI/04 | `FEB 27, 2026` / `APR 04, 2026` / `MAR 06, 2026` — caps, letter-spaced | 4 |
| Stat counter card (number + label) | DW_0tFaj2lU/00 (`142 CROSSING EVENTS / 69 ↑IN / 73 ↓OUT`), DWr9DkpDzsI/04 | Big numeral + tiny uppercase label, often in 2–3 col grid | 5 |
| "DOD" delta chip (green up / red down) | DW_0tFaj2lU/06 (`+1.98% DOD`, `+4.28% DOD`, `-$2.16 DOD`) | Green `#3FCB7E`-ish for positive, salmon-red for negative; tiny monospace | 4 |
| Classification banner (CENTER) | DYGgyZJPG-M/00 | `CLASSIFICATION: SECRET//NOFORN` — uppercase, light text, top-center | 2 |
| `TOP SECRET // DECLASSIFIED` footer | DYGgyZJPG-M/04 | Two-tone footer line on thermal feed | 2 |

## 4. Typography

| Use | Frame ref | Notes | Reuse |
|---|---|---|---|
| Tweet body sans (Chirp-ish) | DW_0tFaj2lU/00, DWwOcLEOHXI/00 | Looks like Twitter's Chirp / very close to SF Pro. White on black, ~46–50 px at 1080w, line-height ≈1.25 | 5 |
| Display name (bold) + handle (medium gray) | All tweet-card frames | Bold white display + `#71767B`-grey `@handle` underneath | 5 |
| Burned-in caption (auto-caption style) | DWr9DkpDzsI/00 ("SO A FEW WEEKS AGO,"), /07 ("WHAT'S GOING ON.") | ALL CAPS, white sans, no background, drop shadow, center-bottom | 5 |
| Monospace HUD type | DYGgyZJPG-M/04 (`TRK ID: SANTA-01`, `ALT: 35,000 FT`) | Pixelated/IBM Plex Mono vibe, slightly green-tinted on thermal | 3 |
| Letter-spaced micro-label | DW_0tFaj2lU/06 (`OIL RISK MATRIX`, `GLOBAL BRENT`, `PER SHIP, PER TRANSIT`) | 11–13 px caps, +200 tracking, low-opacity white | 5 |
| Huge $-amount headline | DW_0tFaj2lU/06 (`$96.63`, `$98.45`), DWwOcLEOHXI/03 (`$2-3M`) | Bold geometric sans (Inter Black / SF Display), gold/amber when emphasized | 4 |
| Map place-label (mixed-case serif/sans) | DWeLzV4hxsp/03 | Faint white `Bandar Abbas`, `Dubai`, `UNITED ARAB EMIRATES`, ~20 px | 2 |

## 5. Animation Patterns

| Pattern | Frame ref | Notes | Reuse |
|---|---|---|---|
| Slow Ken-Burns push on map / footage | DW_0tFaj2lU/00→03→06 | Same map slowly zooming/panning across 60 s while tweet card stays | 5 |
| Number ticker (date + counter scrubbing) | DW_0tFaj2lU/00 (`FEB 27`) → /03 (`APR 04`) → DWr9DkpDzsI/04 (`MAR 06`) | Datestamp + crossing-counter increment over time, like a playback head | 4 |
| Live cursor "hand" pointer overlay | DWeLzV4hxsp/03, DW_0tFaj2lU/06 | OS-native hand cursor visible — implies real screen recording, lends authenticity | 3 |
| Punch-in cut on talking head (mid-sentence) | DWr9DkpDzsI/00 → /07 | Same shot but tighter framing on emphasis word | 4 |
| Insert/reveal of dashboard sub-card | DWwOcLEOHXI/03 (`TEHRAN'S TOLLBOOTH` panel fades in over map), /06 (news clipping pops in) | Fade + slight scale-up of a secondary card over existing scene | 4 |
| Sticky tweet card during B-roll | All map-reel frames | Tweet stays pinned top-third; B-roll changes underneath | 5 |

## 6. Transitions (Scene-to-Scene)

| Transition | Frame ref | Notes | Reuse |
|---|---|---|---|
| Hard cut talking-head → full-screen map | DWr9DkpDzsI/00 → /04 | No fade; jump from face to dashboard, motivated by sentence break | 5 |
| Pinned card swap (B-roll changes, card persists) | DW_0tFaj2lU/00 → /03 → /06 | Tweet card constant, lower 60% swaps map → close-up → matrix card | 5 |
| Overlay reveal (modal slide-in) | DWwOcLEOHXI/03 → /06 | News clipping slides in over the map at ~70 % opacity backdrop | 3 |
| Cross-cut to "evidence" stock clip | DXC96O6CPgC/04 | Tweet card disappears, raw street video plays full-frame for ~2 s | 3 |

## 7. Backgrounds

| Background | Frame ref | Notes | Reuse |
|---|---|---|---|
| Pure black canvas (`#000000` / very-near) | All tweet-card frames | Default backdrop; lets tweet card and dashboards float | 5 |
| Subtle noise / faint grid texture | DWr9DkpDzsI/04 (around the map cutout) | Slight diamond-grid texture frames the dashboard window | 2 |
| Map basemap (Mapbox dark) | DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWr9DkpDzsI/04 | Charcoal landmasses, near-black ocean, faded gray borders | 5 |
| Studio talking-head (out-of-focus garage) | DWr9DkpDzsI/00, /07 | Warm rust/orange bokeh behind subject, shallow DoF | 3 |
| Thermal cloud-cover gradient (cyan→navy) | DYGgyZJPG-M/00 | Generated heatmap as background canvas | 3 |
| Cinematic stock B-roll (Genie 3, drone) | DYh_jS_vM4L/04, /07 | Real-world plates used as evidence; full-bleed below tweet card | 3 |

## 8. Color Palette (Hex Guesses, Sampled by Eye)

| Color | Hex (est.) | Where seen | Role | Reuse |
|---|---|---|---|---|
| Pure black | `#000000` | All canvas bgs | Letterbox / canvas | 5 |
| Near-black panel | `#0A0E13` | DWwOcLEOHXI/03 dashboard | Card surface | 5 |
| Dashboard slate | `#141821` | DW_0tFaj2lU/06 matrix card | Secondary surface | 4 |
| Cyan accent (active filter) | `#22D3EE` / `#1FB4D9` | DW_0tFaj2lU/00 pill outlines, LIVE dot | Primary accent | 5 |
| Twitter verified blue | `#1D9BF0` | All tweet headers | Trust badge | 5 |
| Amber/gold (data positive emphasis) | `#D9A441` / `#C28A2A` | DW_0tFaj2lU/06 sparkline, vessel tracks | Data viz | 4 |
| Pure white text | `#FFFFFF` / `#F2F4F7` | Tweet body, captions | Primary text | 5 |
| Muted gray handle | `#6E7681` / `#71767B` | `@bilawalsidhu` | Secondary text | 5 |
| Positive green delta | `#3FCB7E` | `+1.98% DOD` | Up indicator | 4 |
| Negative red delta | `#E07A6B` / `#D9534F` | `-92.2%`, `-$2.16 DOD` | Down indicator | 4 |
| Thermal cyan-navy | `#2F6F8F` → `#0E1F2E` | DYGgyZJPG-M/00 heatmap | Sat-feed bg | 2 |
| News-source red | `#D62828` | INDEPENDENT wordmark | Source brand chip | 2 |

## 9. Captions (Burned-in Subtitle Style)

| Variant | Frame ref | Notes | Reuse |
|---|---|---|---|
| ALL-CAPS single-line caption, white, drop-shadow | DWr9DkpDzsI/00 (`SO A FEW WEEKS AGO,`), /07 (`WHAT'S GOING ON.`) | 1 phrase ≈ 4–6 words, sits ~55 % down, no background pill | 5 |
| Mixed-case tweet copy as "fake caption" | DW_0tFaj2lU/00, DWwOcLEOHXI/00 | Tweet body doubles as the spoken text — caption work is the tweet itself | 5 |
| Centered low-third 2-line hook | DYGgyZJPG-M/00 (`The Department of War UFO files / are absolutely jaw dropping`) | White sans, bold, ~52 px, no pill, lives above the visual evidence | 5 |
| No caption (pure B-roll moment) | DXC96O6CPgC/04, DYh_jS_vM4L/04 | Visual carries the beat | 3 |

## 10. Shots (Camera / Frame Composition)

| Shot type | Frame ref | Notes | Reuse |
|---|---|---|---|
| Top-third tweet header + B-roll fill | DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWwOcLEOHXI/00, DYh_jS_vM4L/04 | Signature composition; tweet "owns" upper 40 %, evidence in lower 60 % | 5 |
| MCU talking head, mic in frame | DWr9DkpDzsI/00 | Mid-close, shoulders + Shure mic peeking bottom; warm garage backdrop | 4 |
| Extreme close-up "eyes only" cut-in | DWr9DkpDzsI/04 (eye-level glasses reflection) | Reaction beat / emphasis; reflective glasses give cyberpunk vibe | 3 |
| Picture-in-picture (PIP) talking head over dashboard | DW_0tFaj2lU/00, /03, DWwOcLEOHXI/06 | Small headshot bottom-right corner over the screen recording | 4 |
| Full-bleed dashboard / map (no PIP, no card) | DWr9DkpDzsI/04 | Lets the data breathe; caption is the only overlay | 4 |
| Mocked OS window (heatmap + side rail) | DYGgyZJPG-M/00 | 16:9 letterboxed inside 9:16 frame — feels like screenshare leak | 3 |
| Cinematic POV stock plate | DYh_jS_vM4L/07 | Boat-on-water dolly, generated by Genie 3, full-bleed | 2 |

---

## Top 10 Components — Prioritized for Adoption

1. 🔴 **Sticky tweet-card header (avatar + name + verified + 2–5 line body).** Most-used hook framework across all reels; reads as "real X post," lends authority. Implement as a reusable `<TweetCard>` React component for Remotion. (DW_0tFaj2lU/00, DWeLzV4hxsp/00, DWwOcLEOHXI/00, DYh_jS_vM4L/04)
2. 🔴 **Top-third hook + lower-60 % evidence layout.** The composition pattern that frees us to swap any B-roll while keeping the message anchored. (DW_0tFaj2lU/00 → /03 → /06)
3. 🔴 **ALL-CAPS single-line burned caption (drop shadow, no pill).** Cleanest auto-caption style; pair with Whisper word-timestamps. (DWr9DkpDzsI/00, /07)
4. 🔴 **Cyan accent system (`#22D3EE` pills, dots, dividers) on `#000`/`#0A0E13`.** A reusable "dashboard" theme that signals data/credibility. (DW_0tFaj2lU/00, DWeLzV4hxsp/00)
5. 🟠 **Stat counter card (big numeral + tiny uppercase label).** Drop-in component for any KPI/number reveal. (DW_0tFaj2lU/00 `142 CROSSING EVENTS`, /06 `$96.63`)
6. 🟠 **DOD delta chip (green up / red down, monospace).** Tiny but readable — perfect for finance/AI-benchmark videos. (DW_0tFaj2lU/06)
7. 🟠 **Datestamp / playback ticker (`MMM DD, YYYY` uppercase, letter-spaced).** Gives any timeline content a "live OSINT" feel. (DW_0tFaj2lU/03, DWr9DkpDzsI/04)
8. 🟠 **Pinned-card-with-B-roll-swap transition.** No fancy transition needed; the card persistence creates continuity. (DW_0tFaj2lU/00 → /03 → /06)
9. 🟢 **Picture-in-picture talking head bottom-right over dashboard.** Useful when we eventually shoot real footage; for now keep as backlog. (DW_0tFaj2lU/00, DWwOcLEOHXI/06)
10. 🟢 **Mock-OS chrome (left icon rail + top classification bar + viewfinder brackets).** High novelty, low-frequency reuse — keep as a one-off "leak/declassified" template for high-engagement satire pieces. (DYGgyZJPG-M/00, /04)

**Legend:** 🔴 ship in next template iteration · 🟠 add as optional module · 🟢 nice-to-have / niche reuse

---

## Implementation Notes (for the Remotion engine)

- **TweetCard component** should accept `{avatarSrc, displayName, handle, verified, body, position: "top"|"bottom"}`. Bilawal places it consistently in the upper third; codify that as the default.
- **Caption styling** should mirror DWr9DkpDzsI/00: Inter Black or SF Pro Display Bold, all-caps, white `#FFFFFF`, 2-px black drop shadow at 60 % opacity. No background pill — relies on shadow for contrast over busy bg.
- **Cyan token** `--accent-cyan: #22D3EE` — pin this to the brand config so dashboards reusing the chip style stay consistent.
- **Stat card sizing:** numeral at ~80–120 px, label at 11–13 px with `letter-spacing: 0.2em` and `opacity: 0.6`. Use a 12-col grid; stat cards are typically 4-col wide.
- **Datestamp ticker:** drive it from a single `Date` prop, format with `Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' })`, then `.toUpperCase()`. Tween between two dates with `interpolate()` + `Math.floor()`.
- **Tweet-pin transition:** the tweet card is its own `<Sequence>` that runs the whole composition; B-roll lives in a nested `<Sequence>` underneath that switches sources. No animated transitions between B-roll changes — Bilawal uses straight hard cuts, which feel more credible than dissolves.

## What We Are NOT Stealing (intentional)

- Bilawal's specific dashboard ("Strait of Hormuz God's Eye View") is custom-built for his OSINT angle and would feel forced on our content topics. We take the *aesthetic primitives* (pills, stat cards, datestamps) but not the literal map UI.
- The mock-classified HUD (`SECRET//NOFORN`) is a strong novelty tool but reads as parody — only deploy when the topic supports it.
- News-clipping overlay style is generic enough to reuse but we should source legitimate clippings, not fabricate them.

