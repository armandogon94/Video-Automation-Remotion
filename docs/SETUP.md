# Tooling setup — top 5 additions (W21 overhaul)

> Once these five tools are installed, every template downstream uses them. Order doesn't
> strictly matter; pick whichever you can move on first.

---

## 1. LottieFiles Creator MCP + `@remotion/lottie`

**What it gives us:** prompt → Lottie animation, dropped into Remotion as `<Lottie animationData={...} />`. Use for accent micro-animations (red ink stamps, hand-drawn arrows, brand pulses).

**Status:** `@remotion/lottie@4.0.443` + `lottie-web` already installed via `npm install` this session. MCP server needs your config.

**MCP config** — add to `~/.claude.json` (or `.mcp.json` at the project root):
```jsonc
{
  "mcpServers": {
    "lottiefiles": {
      "command": "npx",
      "args": ["-y", "@lottiefiles/lottie-creator-mcp"]
    }
  }
}
```

Then **restart Claude Code** so it picks up the new MCP. Verify with: `/mcp` in Claude.

**Cache location:** put downloaded JSONs under `public/lottie/`.

---

## 2. Pexels MCP (vertical B-roll search)

**What it gives us:** keyword search → free vertical 9×16 stock video clips. Pairs with Remotion's `<OffthreadVideo>` for cutaways inside a cream frame (~720×720 inset window).

**One-time setup:**
1. Get a free API key at https://www.pexels.com/api/
2. Add to your shell env (e.g. `~/.zshrc`):
   ```bash
   export PEXELS_API_KEY="your_key_here"
   ```

**MCP config** — add to `~/.claude.json`:
```jsonc
{
  "mcpServers": {
    "pexels": {
      "command": "npx",
      "args": ["-y", "@garylab/pexels-mcp-server"],
      "env": { "PEXELS_API_KEY": "${PEXELS_API_KEY}" }
    }
  }
}
```

Restart Claude Code. Pipeline integration (download clips to `output/<slug>/broll/` per script's noun-phrases) is a future task — not built yet.

---

## 3. Mermaid → SVG (via `claude-mermaid` MCP)

**What it gives us:** flowcharts / sequence diagrams / state machines as deterministic SVG. Drops into Remotion compositions as `<Img>`. Critical for `DiagramExplainer` template (mechanism videos like "how MCP works").

**One-time setup:**
```bash
npm install -g @mermaid-js/mermaid-cli @veelenga/claude-mermaid
```

**MCP config** — add to `~/.claude.json`:
```jsonc
{
  "mcpServers": {
    "mermaid": {
      "command": "npx",
      "args": ["-y", "@veelenga/claude-mermaid"]
    }
  }
}
```

Restart Claude Code. Test with: ask Claude to render a Mermaid sequence diagram with brand colors. Should output an SVG file.

---

## 4. FFmpeg `lut3d` color grading (Armando Inteligencia LUT)

**What it gives us:** programmatic color grading — one `.cube` file applied to every render, locks in the brand look.

**One-time setup:**
1. Install DaVinci Resolve (free) from https://www.blackmagicdesign.com/products/davinciresolve
2. Drop one rendered frame (e.g. `output/2026-05-18-gemini-3-2-flash-leak/verification-v2/v2-t24s.jpg`) into Resolve
3. Color-grade to your taste (slight warmth, lift on shadows, subtle gold cast on highlights, etc.)
4. Right-click the clip → **Generate 3D LUT (33 Point Cube)** → save as `brand/armando.cube`

**Pipeline wiring** (do this once `armando.cube` exists):
- Edit `src/ffmpeg/commands.ts` → add `lut3d=file=brand/armando.cube:interp=tetrahedral` to the post-processing video filter chain
- Verify with a re-render — should look subtly more "Armando" without further tweaking

---

## 5. Mubert API (Creator $14/mo — mood-tagged music beds)

**What it gives us:** REST endpoint that returns a music bed tagged by mood + duration. Mixed at -22 LUFS under the VO with `sidechaincompress` so the voice always wins.

**One-time setup:**
1. Sign up at https://mubert.com/ (Creator tier $14/mo)
2. Get API key from dashboard
3. Add to shell env:
   ```bash
   export MUBERT_KEY="your_key_here"
   ```

**Pipeline wiring** (future task, not built yet):
- New `src/pipeline/music.ts` calls Mubert REST, caches result at `output/<slug>/music/bed.mp3`
- New step in `src/ffmpeg/commands.ts` mixes via `amix=inputs=2:duration=longest,sidechaincompress=threshold=0.05:ratio=8:attack=10:release=300`

---

## Deferred (next quarter)

These are documented in `docs/research/D-tools-mcps-survey.md` but not in the immediate top-5:

- **Cartesia Sonic 3.5** (voice clone — preferred over ElevenLabs for Spanish per the research; $5/mo Pro tier, 3-second clone)
- **Rive + `@remotion/rive`** (character / state-machine animation; higher ceiling than Lottie but real authoring time)
- **Real-ESRGAN + RIFE** (optional 60fps upscale final pass)

---

## After all 5 are installed

Verify in one shot:

```bash
# 1. LottieFiles MCP — ask Claude in a session: "use the lottiefiles MCP to generate a small warm-red checkmark Lottie"
# 2. Pexels MCP — ask Claude: "search Pexels for vertical 9:16 'developer typing keyboard' clips"
# 3. Mermaid MCP — ask Claude: "render this Mermaid flowchart as SVG: graph LR; A[User] --> B[Claude] --> C[MCP] --> D[Tool]"
# 4. LUT file exists at brand/armando.cube, FFmpeg pass produces graded output
# 5. Mubert returns an MP3 URL for { mood: "inspiring", duration: 45 }
```

All 5 active = the pipeline is ready for Sprint 2 templates (HotTake / Listicle5 / FAQMythbuster / PrediCtion) which will lean on Lottie accents + Pexels B-roll + Mermaid diagrams as part of their visual vocabulary.
