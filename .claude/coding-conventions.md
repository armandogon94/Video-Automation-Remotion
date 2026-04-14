# Coding Conventions

## TypeScript (Remotion + Pipeline)

- **Strict TypeScript** — `strict: true` in tsconfig.json
- **Functional components only** — no class components in Remotion compositions
- **Zod schemas for validation** — all input props validated with Zod before use
- **camelCase** for variables/functions, **PascalCase** for components/types/classes
- **No `any` types** — use `unknown` + type narrowing or `as const` for literals
- **ESM imports** — use `import`/`export`, never `require` (project uses `"type": "module"`)
- **No file extensions in source imports** — `import { Root } from "./Root"` not `"./Root.tsx"` (Webpack resolves)
- **Async/await over callbacks** — use modern async patterns throughout
- **Error handling** — throw typed errors with context, use try-catch judiciously

## Python (TTS + Transcription)

- **Python 3.11+** with comprehensive type hints on all functions
- **snake_case** for variables, functions, modules; **SCREAMING_SNAKE_CASE** for constants
- **uv** for dependency management (not pip directly)
- **pathlib.Path** for all file paths (never string concatenation)
- **JSON output to stdout** — pipeline parses via TypeScript `JSON.parse()`
- **CLI via argparse or Click** — well-structured subcommands with help text
- **Generator patterns** — use `list(generator)` before reiterating (faster-whisper gotcha)

## General

- **No secrets in code** — use `.env.example` for documentation, `.env` for secrets (gitignored)
- **Error messages must be actionable** — clearly state what happened + how to fix it
- **Minimal abstractions** — this is a single-developer tool; keep it readable over clever
- **Spanish content is the default** — English is secondary
- **Comments for "why" not "what"** — code should be self-documenting; comments explain intent
