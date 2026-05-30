#!/usr/bin/env tsx
/**
 * multi-angle-analyze.ts — voting-style multi-agent video frame analysis helper.
 *
 * Two modes:
 *   1) dispatch  (default) — prepare per-voter prompts + print copy-paste agent commands
 *   2) aggregate (--aggregate) — synthesize vote-*.md files into a consensus document
 *
 * Usage:
 *   npx tsx scripts/multi-angle-analyze.ts --handle <h> --shortcode <s> [--n 5] [--frames-per-agent 20]
 *   npx tsx scripts/multi-angle-analyze.ts --aggregate --handle <h> --shortcode <s>
 *
 * No external deps — Node stdlib only.
 */

import * as fs from "node:fs";
import * as path from "node:path";

type Args = {
  handle?: string;
  shortcode?: string;
  n: number;
  framesPerAgent: number;
  aggregate: boolean;
};

function parseArgs(argv: string[]): Args {
  const out: Args = { n: 5, framesPerAgent: 20, aggregate: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--handle") { out.handle = next; i++; }
    else if (a === "--shortcode") { out.shortcode = next; i++; }
    else if (a === "--n") { out.n = parseInt(next ?? "5", 10); i++; }
    else if (a === "--frames-per-agent") { out.framesPerAgent = parseInt(next ?? "20", 10); i++; }
    else if (a === "--aggregate") { out.aggregate = true; }
    else if (a === "--help" || a === "-h") { printHelpAndExit(0); }
  }
  if (!out.handle || !out.shortcode) {
    console.error("ERROR: --handle and --shortcode are required");
    printHelpAndExit(1);
  }
  if (out.n < 3 || out.n > 5) {
    console.error(`ERROR: --n must be between 3 and 5 (got ${out.n})`);
    process.exit(1);
  }
  return out;
}

function printHelpAndExit(code: number): never {
  console.log(`multi-angle-analyze — dispatch N voting agents on a creator's reel frames.

Dispatch mode (default):
  npx tsx scripts/multi-angle-analyze.ts --handle <handle> --shortcode <shortcode> [--n 5] [--frames-per-agent 20]

Aggregate mode:
  npx tsx scripts/multi-angle-analyze.ts --aggregate --handle <handle> --shortcode <shortcode>

Outputs:
  Per-voter prompts  -> docs/critiques/multi-angle/<shortcode>-vote-K.prompt.md
  Per-voter answers  -> docs/critiques/multi-angle/<shortcode>-vote-K.md          (written by agents)
  Consensus          -> docs/critiques/multi-angle/<shortcode>-consensus.md       (--aggregate)
`);
  process.exit(code);
}

const ROOT = process.cwd();

function framesDir(handle: string, shortcode: string): string {
  return path.join(ROOT, "references", "creators", handle, shortcode, "frames");
}

function voteDir(): string {
  return path.join(ROOT, "docs", "critiques", "multi-angle");
}

function votePromptPath(shortcode: string, k: number): string {
  return path.join(voteDir(), `${shortcode}-vote-${k}.prompt.md`);
}

function voteAnswerPath(shortcode: string, k: number): string {
  return path.join(voteDir(), `${shortcode}-vote-${k}.md`);
}

function consensusPath(shortcode: string): string {
  return path.join(voteDir(), `${shortcode}-consensus.md`);
}

function listFrames(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
}

function ensureFrames(handle: string, shortcode: string, needed: number): string[] {
  const dir = framesDir(handle, shortcode);
  let frames = listFrames(dir);
  if (frames.length === 0) {
    console.error(`ERROR: no frames found at ${dir}`);
    console.error(`HINT: extract them first, e.g.`);
    console.error(`  python scripts/extract-keyframes.py --handle ${handle} --shortcode ${shortcode} --count ${needed}`);
    process.exit(1);
  }
  if (frames.length < needed) {
    console.warn(`WARN: only ${frames.length} frames at ${dir}, needed ${needed}.`);
    console.warn(`HINT: re-extract with more frames:`);
    console.warn(`  python scripts/extract-keyframes.py --handle ${handle} --shortcode ${shortcode} --count ${needed}`);
  }
  return frames;
}

// ---------- DISPATCH MODE ----------

function buildVoterPrompt(opts: {
  k: number;
  n: number;
  handle: string;
  shortcode: string;
  frames: string[];
  framesDirAbs: string;
  outputPathAbs: string;
}): string {
  const { k, n, handle, shortcode, frames, framesDirAbs, outputPathAbs } = opts;
  const frameList = frames.map((f) => `  - ${path.join(framesDirAbs, f)}`).join("\n");
  return `# Voter ${k} of ${n} — Independent reel analysis

You are voter **${k}** of **${n}** in a voting-style ensemble analysis.

## Rules
1. **DO NOT** read any other voter's output files. Files matching
   \`docs/critiques/multi-angle/${shortcode}-vote-*.md\` are OFF-LIMITS.
2. **DO NOT** read the consensus file (if it exists).
3. Analyze the frames INDEPENDENTLY. Your goal is an honest, individual reading.
4. Write your analysis to: \`${outputPathAbs}\`

## Subject
- Creator handle: \`${handle}\`
- Reel shortcode: \`${shortcode}\`
- Frames directory: \`${framesDirAbs}\`
- Frame count provided: ${frames.length}

## Frames to analyze
${frameList}

## What to produce
Markdown with these sections (use exactly these H2 headings — the aggregator
greps for them):

\`\`\`
# Voter ${k} analysis — ${shortcode}

## Hook (first 1-2 seconds)
- What is the visual/textual hook? Why does it stop the scroll?

## Visual template
- Layout, framing, dominant colors, text overlays, motion style.

## Motion & pacing
- Cut frequency, transitions, zoom/pan behavior, on-screen animation.

## Typography & captions
- Font feel, caption style, word-by-word vs sentence reveals, color hierarchy.

## Brand signals
- Watermark/handle placement, color palette consistency, recurring iconography.

## Replicable patterns
- 3-5 concrete patterns we could lift into our 15-template typology.

## Weaknesses
- What is mediocre, dated, or platform-specific in a bad way.

## Confidence notes
- Where you are guessing vs. seeing clearly. Flag anything a second viewer
  might disagree on.
\`\`\`

Keep it under ~400 lines. Be specific and visual. Cite frame filenames where
relevant (e.g. "frame-03-t02.4s.jpg shows the headline reveal").
`;
}

function dispatch(args: Args): void {
  const { handle, shortcode, n, framesPerAgent } = args as Required<Pick<Args, "handle" | "shortcode">> & Args;
  const frames = ensureFrames(handle, shortcode, framesPerAgent);
  const dir = voteDir();
  fs.mkdirSync(dir, { recursive: true });

  const fdAbs = framesDir(handle, shortcode);
  const promptPaths: string[] = [];
  for (let k = 1; k <= n; k++) {
    const promptPath = votePromptPath(shortcode, k);
    const answerPath = voteAnswerPath(shortcode, k);
    const prompt = buildVoterPrompt({
      k, n, handle, shortcode,
      frames: frames.slice(0, framesPerAgent),
      framesDirAbs: fdAbs,
      outputPathAbs: answerPath,
    });
    fs.writeFileSync(promptPath, prompt);
    promptPaths.push(promptPath);
  }

  console.log(`\nWrote ${n} voter prompts to ${dir}\n`);
  console.log(`=== Copy-paste these into ${n} separate Claude sessions (or dispatch via Task tool) ===\n`);
  for (let k = 1; k <= n; k++) {
    console.log(`--- Voter ${k} of ${n} ---`);
    console.log(`Read and follow the instructions in: ${promptPaths[k - 1]}`);
    console.log(`When done, your analysis MUST exist at: ${voteAnswerPath(shortcode, k)}`);
    console.log("");
  }
  console.log(`=== After all ${n} voters finish, run: ===`);
  console.log(`  npx tsx scripts/multi-angle-analyze.ts --aggregate --handle ${handle} --shortcode ${shortcode}\n`);
}

// ---------- AGGREGATE MODE ----------

type ParsedVote = { k: number; sections: Map<string, string[]> };

function parseVote(filePath: string, k: number): ParsedVote {
  const raw = fs.readFileSync(filePath, "utf8");
  const sections = new Map<string, string[]>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current !== null) sections.set(current, buf);
    buf = [];
  };
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return { k, sections };
}

function extractBullets(lines: string[]): string[] {
  const bullets: string[] = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (m) bullets.push(m[1]);
  }
  return bullets;
}

// Tiny similarity: jaccard on lowercased word sets, ignoring stopwords.
const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "with", "for", "of", "to", "in", "on",
  "at", "by", "is", "are", "was", "were", "be", "been", "being", "this", "that",
  "these", "those", "it", "its", "as", "from", "into", "than", "then", "so",
  "very", "more", "most", "less", "least", "uses", "use", "used", "using",
  "shows", "show", "shown", "has", "have", "had", "i", "we", "you", "they",
]);

function toks(s: string): Set<string> {
  return new Set(
    s.toLowerCase()
      .replace(/[`*_]/g, " ")
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2 && !STOP.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const uni = a.size + b.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

type Finding = { text: string; voters: Set<number>; tokens: Set<string> };

function clusterBullets(all: Array<{ k: number; text: string }>, threshold = 0.35): Finding[] {
  const findings: Finding[] = [];
  for (const { k, text } of all) {
    const tk = toks(text);
    if (tk.size === 0) continue;
    let merged = false;
    for (const f of findings) {
      if (jaccard(tk, f.tokens) >= threshold) {
        f.voters.add(k);
        // Keep the shorter/cleaner exemplar
        if (text.length < f.text.length) f.text = text;
        for (const t of tk) f.tokens.add(t);
        merged = true;
        break;
      }
    }
    if (!merged) findings.push({ text, voters: new Set([k]), tokens: tk });
  }
  return findings;
}

function tagConfidence(voterCount: number, totalVoters: number): "HIGH" | "MED" | "LOW" {
  const ratio = voterCount / totalVoters;
  if (voterCount >= 3 || ratio >= 0.6) return "HIGH";
  if (voterCount === 2 || ratio >= 0.4) return "MED";
  return "LOW";
}

function aggregate(args: Args): void {
  const { handle, shortcode } = args as Required<Pick<Args, "handle" | "shortcode">> & Args;
  const dir = voteDir();
  if (!fs.existsSync(dir)) {
    console.error(`ERROR: vote directory does not exist: ${dir}`);
    process.exit(1);
  }
  const voteFiles = fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${shortcode}-vote-(\\d+)\\.md$`).test(f))
    .sort();
  if (voteFiles.length === 0) {
    console.error(`ERROR: no vote files found matching ${shortcode}-vote-*.md in ${dir}`);
    process.exit(1);
  }
  const votes: ParsedVote[] = voteFiles.map((f) => {
    const m = f.match(/-vote-(\d+)\.md$/);
    const k = m ? parseInt(m[1], 10) : 0;
    return parseVote(path.join(dir, f), k);
  });
  const totalVoters = votes.length;

  const sectionOrder = [
    "Hook (first 1-2 seconds)",
    "Visual template",
    "Motion & pacing",
    "Typography & captions",
    "Brand signals",
    "Replicable patterns",
    "Weaknesses",
    "Confidence notes",
  ];

  const lines: string[] = [];
  lines.push(`# Consensus analysis — ${shortcode}`);
  lines.push("");
  lines.push(`Synthesized from ${totalVoters} independent voters: ${votes.map((v) => `vote-${v.k}`).join(", ")}.`);
  lines.push(`Handle: \`${handle}\` · Shortcode: \`${shortcode}\``);
  lines.push("");
  lines.push(`Confidence tags: **HIGH** = mentioned by 3+ voters · **MED** = 2 voters · **LOW** = 1 voter.`);
  lines.push("");

  let hadAny = false;
  for (const section of sectionOrder) {
    const allBullets: Array<{ k: number; text: string }> = [];
    for (const v of votes) {
      const body = v.sections.get(section);
      if (!body) continue;
      for (const b of extractBullets(body)) allBullets.push({ k: v.k, text: b });
    }
    if (allBullets.length === 0) continue;
    hadAny = true;
    const findings = clusterBullets(allBullets);
    findings.sort((a, b) => b.voters.size - a.voters.size);

    lines.push(`## ${section}`);
    lines.push("");
    const high = findings.filter((f) => tagConfidence(f.voters.size, totalVoters) === "HIGH");
    const med = findings.filter((f) => tagConfidence(f.voters.size, totalVoters) === "MED");
    const low = findings.filter((f) => tagConfidence(f.voters.size, totalVoters) === "LOW");

    const writeBlock = (label: "HIGH" | "MED" | "LOW", group: Finding[]) => {
      if (group.length === 0) return;
      lines.push(`### ${label} confidence`);
      for (const f of group) {
        const voters = [...f.voters].sort((a, b) => a - b).map((k) => `v${k}`).join(",");
        lines.push(`- ${f.text}  _(${voters})_`);
      }
      lines.push("");
    };
    writeBlock("HIGH", high);
    writeBlock("MED", med);
    writeBlock("LOW", low);
  }

  if (!hadAny) {
    lines.push(`> No parseable sections found in any vote file. Did the voters use the expected H2 headings?`);
    lines.push("");
  }

  const outPath = consensusPath(shortcode);
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`Aggregated ${totalVoters} votes into ${outPath}`);
}

// ---------- MAIN ----------

const args = parseArgs(process.argv.slice(2));
if (args.aggregate) aggregate(args);
else dispatch(args);
