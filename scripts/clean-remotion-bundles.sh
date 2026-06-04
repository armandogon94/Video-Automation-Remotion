#!/usr/bin/env bash
# clean-remotion-bundles.sh — safely sweep leaked Remotion webpack bundle dirs.
#
# WHY: @remotion/bundler's bundle() writes a ~2.5-3 GB `remotion-webpack-bundle-*`
# dir into $TMPDIR and never deletes it. Our render scripts now auto-clean on exit
# (see src/autoedit/bundleOnce.ts), but a HARD-KILLED render (kill -9 / crash /
# power loss) skips that cleanup and leaks the dir. Run this after any aborted run.
#
# SAFETY: the macOS per-user tmpdir (/tmp/claude-501) is SHARED across all Claude
# sessions/projects, so a bundle dir may belong to ANOTHER project's LIVE render.
# This script REFUSES to delete anything while any Remotion render process is alive.
#
# Portable: works on macOS's stock bash 3.2 (no mapfile / readarray).
#
# Usage:  bash scripts/clean-remotion-bundles.sh            # sweep if safe
#         bash scripts/clean-remotion-bundles.sh --dry-run  # just report
set -euo pipefail

DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

# Collect bundle dirs across the shared per-user tmpdirs + current TMPDIR.
# (paths are like remotion-webpack-bundle-AbCdEf — no spaces/newlines.)
LIST=$(
  for d in /tmp/claude-* "${TMPDIR:-/tmp}"; do
    [ -d "$d" ] && find "$d" -maxdepth 1 -type d -name 'remotion-webpack-bundle-*' 2>/dev/null
  done | sort -u
)

if [ -z "$LIST" ]; then
  echo "✓ no leaked remotion-webpack-bundle-* dirs found. nothing to do."
  exit 0
fi

COUNT=$(printf '%s\n' "$LIST" | grep -c .)
TOTAL=$(printf '%s\n' "$LIST" | tr '\n' '\0' | xargs -0 du -sch 2>/dev/null | tail -1 | awk '{print $1}')
echo "found ${COUNT} bundle dir(s), ~${TOTAL} total:"
printf '  %s\n' $LIST

# Is any render alive? compositor + headless chrome are the reliable signals;
# also catch our render scripts running under node/tsx.
RUNNING=$(ps aux | grep -iE "@remotion/compositor|chrome-headless-shell|remotion-webpack-bundle|runAbhiTemplates|runCrossCreatorReplicas|renderFromPlan|render-w21|runMotionGraphics|runComboDemos|runVariations" | grep -v grep | grep -v "clean-remotion-bundles" || true)
if [ -n "$RUNNING" ]; then
  echo ""
  echo "✋ a Remotion render appears to be ACTIVE — NOT sweeping (a bundle may be in use):"
  echo "$RUNNING" | awk '{print "   pid "$2}' | head -5
  echo "   Re-run this once renders have finished."
  exit 2
fi

if [ "$DRY" -eq 1 ]; then
  echo ""
  echo "(--dry-run) would remove the ${COUNT} dir(s) above (~${TOTAL}). No render running."
  exit 0
fi

BEFORE=$(df -h /System/Volumes/Data 2>/dev/null | tail -1 | awk '{print $4}')
printf '%s\n' "$LIST" | while IFS= read -r b; do
  [ -n "$b" ] && rm -rf "$b"
done
AFTER=$(df -h /System/Volumes/Data 2>/dev/null | tail -1 | awk '{print $4}')
echo ""
echo "✓ swept ${COUNT} bundle dir(s), freed ~${TOTAL}.  free space: ${BEFORE} → ${AFTER}"
