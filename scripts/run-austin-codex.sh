#!/usr/bin/env bash
# Idempotent Codex (GPT-5.5 xhigh) visual-animation analysis for @austin.marchese.
# Processes ONLY videos that have contact sheets but no ANALYSIS-FROM-CODEX-<id>.md yet,
# so it is safe to re-run (overnight loop + 6am cron mop-up after a 5h-limit cutoff).
set -uo pipefail
WT="/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b"
cd "$WT" || exit 1
OUTDIR="docs/research/austin-anim"
mkdir -p "$OUTDIR"
pre=0; ran=0; failed=0
for d in references/creators/austin.marchese/*/; do
  id=$(basename "$d")
  [ -d "$d/sheets" ] || continue
  ls "$d/sheets"/sheet-*.jpg >/dev/null 2>&1 || continue
  out="$OUTDIR/ANALYSIS-FROM-CODEX-$id.md"
  if [ -f "$out" ]; then pre=$((pre+1)); continue; fi
  echo "===== CODEX $id ====="
  printf 'You are a motion-graphics analyst. First read references/creators/austin.marchese/%s/metadata.json for the video title. Then visually analyze the ANIMATIONS in this @austin.marchese YouTube video (id %s, 16:9). Attached: contact sheets, each a 6x6 grid of 36 frames sampled every 3s; sheet N covers video time (N-1)*108s..N*108s; cell K is at ~((N-1)*108+(K-1)*3)s.\n\nContext: austin.marchese is an English Claude/Claude-Code educator whose motion-graphics resemble nateherk — a LIQUID-GLASS card system (translucent rounded-rect cards, glowing borders, glow-pulse; austin uses warm burgundy/magenta/orange vs nate cyan/teal): numbered step/upgrade cards, stat/metric cards w/ count-ups, agenda lists, over-speaker chips, kinetic captions, workflow/agent diagrams, code/terminal callouts.\n\nCatalog EVERY distinct motion-graphic/animation. For each: name; example timestamp(s); exact MOTION (entrance/exit, easing, stagger, scale overshoot/anticipation, glow pulse, border draw-on, blur, parallax, count-up easing, z-order); color+material; layout. CRUCIALLY call out SUBTLE craft a quick still pass misses. Note which animations differ from or extend nateherk and rank the top 5 most distinctive/replicable. Write the full analysis to: %s . Do not edit other files.' "$id" "$id" "$out" \
    | codex exec -m gpt-5.5 -c model_reasoning_effort="xhigh" -s workspace-write -c approval_policy="never" --skip-git-repo-check -i "$d"/sheets/sheet-*.jpg 2>&1 | tail -3
  if [ -f "$out" ]; then ran=$((ran+1)); echo "--- wrote $id ---"; else failed=$((failed+1)); echo "--- FAILED $id (likely 5h limit; will retry) ---"; fi
done
echo "CODEX-SCRIPT DONE: pre-existing=$pre newly-written=$ran failed=$failed | total-with-md=$(ls -1 $OUTDIR/ANALYSIS-FROM-CODEX-*.md 2>/dev/null | wc -l | tr -d ' ')"
