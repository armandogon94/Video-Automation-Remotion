import { defineConfig } from "vitest/config";

/**
 * Pin the test surface (FABLE Task 0.5). Without an explicit include/exclude,
 * vitest globs the whole tree — which double-runs every copy under
 * `.claude/worktrees/` and pulls in the Hyperframes sibling engine. Restrict it
 * to the primary Remotion/pipeline sources + the top-level tests dir.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      ".claude/**",
      "hyperframes/**",
      "**/dist/**",
      "**/build/**",
    ],
  },
});
