#!/usr/bin/env node
/**
 * List available video templates.
 */
import fs from "fs";
import path from "path";

const templatesDir = path.resolve(import.meta.dirname, "../../templates");

console.log("\nAvailable Video Templates:\n");

const files = fs.readdirSync(templatesDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const config = JSON.parse(fs.readFileSync(path.join(templatesDir, file), "utf-8"));
  const id = (config.id as string).padEnd(20);
  console.log(`  ${id} ${config.name}`);
  console.log(`  ${"".padEnd(20)} ${config.description}\n`);
}

console.log(`  Total: ${files.length} templates\n`);
