#!/usr/bin/env node
/**
 * List available Spanish voices from Edge-TTS.
 */
import path from "path";
import fs from "fs";
import { execa } from "execa";

function getUvPath(): string {
  const homeUv = path.join(process.env.HOME || "", ".local", "bin", "uv");
  if (fs.existsSync(homeUv)) return homeUv;
  return "uv";
}

const projectRoot = path.resolve(import.meta.dirname, "../..");
const uv = getUvPath();

try {
  const result = await execa(uv, [
    "run", "python", path.join(projectRoot, "src/tts/generate.py"),
    "voices",
  ], { cwd: projectRoot });

  const voices = JSON.parse(result.stdout) as Array<{
    name: string;
    gender: string;
    locale: string;
  }>;

  console.log("\nAvailable Spanish Voices:\n");
  console.log("  Voice Name                    Gender    Locale");
  console.log("  " + "─".repeat(55));

  for (const v of voices) {
    const name = v.name.padEnd(30);
    const gender = v.gender.padEnd(10);
    console.log(`  ${name}${gender}${v.locale}`);
  }

  console.log(`\n  Total: ${voices.length} voices\n`);
} catch (error) {
  console.error("Failed to list voices:", error instanceof Error ? error.message : error);
  process.exit(1);
}
