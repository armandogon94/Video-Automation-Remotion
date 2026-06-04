/**
 * bundleOnce — a self-cleaning drop-in wrapper around @remotion/bundler's `bundle()`.
 *
 * WHY: `bundle()` writes a ~2.5-3 GB webpack bundle into $TMPDIR
 * (`remotion-webpack-bundle-*`). Remotion never deletes it, so every render leaks
 * a multi-GB directory. Across a heavy session these pile up and fill the disk
 * (a sibling project once leaked 204 of them ≈ 370 GB). This wrapper registers the
 * returned bundle directory and removes it automatically when the process exits —
 * on normal completion AND on Ctrl-C / SIGTERM / SIGHUP (more robust than a
 * try/finally, which a signal would skip).
 *
 * USAGE — make any render script self-cleaning with a ONE-LINE import swap, no
 * call-site changes:
 *
 *     // import { bundle } from "@remotion/bundler";
 *     import { bundleOnce as bundle } from "./bundleOnce";   // path relative to caller
 *     const serveUrl = await bundle({ entryPoint });          // unchanged
 *
 * For an explicit mid-process free (e.g. before bundling again), call
 * `cleanupBundle(serveUrl)`.
 *
 * CAVEAT: a hard `kill -9` (SIGKILL) cannot run any handler, so it can still leak.
 * After any killed/aborted render run `scripts/clean-remotion-bundles.sh`.
 */
import fs from "fs";
import { bundle } from "@remotion/bundler";

const registered = new Set<string>();
let hooked = false;

function removeDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best-effort: a concurrent process may already have removed it */
  }
}

function cleanAll(): void {
  for (const dir of registered) removeDir(dir);
  registered.clear();
}

function ensureHooked(): void {
  if (hooked) return;
  hooked = true;
  // Normal completion (sync handler — rmSync is allowed here).
  process.on("exit", cleanAll);
  // Interrupts: clean, then exit so the default signal behavior still applies.
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => {
      cleanAll();
      process.exit(1);
    });
  }
}

/** Drop-in for `@remotion/bundler` `bundle()`. Same args + return (the serveUrl
 *  path string). The created bundle dir is auto-removed on process exit. */
export async function bundleOnce(
  ...args: Parameters<typeof bundle>
): Promise<string> {
  const serveUrl = await bundle(...args);
  registered.add(serveUrl);
  ensureHooked();
  return serveUrl;
}

/** Explicitly remove a bundle dir now (and unregister it). Safe to call anytime. */
export function cleanupBundle(serveUrl: string): void {
  removeDir(serveUrl);
  registered.delete(serveUrl);
}
