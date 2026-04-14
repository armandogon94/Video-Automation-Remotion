# Key Architectural Decisions

All architectural decisions with detailed reasoning are recorded in `.claude/memory.md`. Major decisions:

## 1. Local-Only Execution

**Decision:** VPS (2 vCPU / 8GB RAM) too weak for video rendering; runs on macOS Apple Silicon only.

**Rationale:** Video rendering with Remotion requires significant CPU/memory. The Hostinger VPS cannot handle simultaneous renders. Keeping it local-only simplifies deployment and avoids infrastructure costs.

**Implication:** Do NOT create Traefik labels, VPS deployment configs, systemd services, or Nginx configs.

## 2. Edge-TTS (Free) over ElevenLabs (Paid)

**Decision:** 45 Spanish voices, word timestamps, unlimited usage.

**Rationale:** Cost-free, sufficient quality for business/educational content, native Python integration.

**Limitation:** v7.2.8 only emits SentenceBoundary (not WordBoundary); word timings are approximated.

## 3. faster-whisper (CPU) over whisper.cpp

**Decision:** Better Python integration, word-level timestamps, "small" model sufficient for 88% accuracy.

**Rationale:** Integrates cleanly with pipeline, CPU-only (no GPU required on Apple Silicon).

**Optimization:** Uses int8 quantization on ARM64.

## 4. Simple TypeScript Pipeline over BullMQ+Redis

**Decision:** No need for queues; single-user, local tool, sequential execution sufficient.

**Rationale:** Reduces complexity, eliminates Redis dependency, easier to debug and maintain.

## 5. uv (Python Package Manager) over pip

**Decision:** Faster, better dependency resolution, explicit lock files.

**Rationale:** Modern tooling, better reproducibility across environments.

## 6. Remotion v4 (Pinned Exactly)

**Decision:** All Remotion packages pinned to v4.0.443 with `--save-exact`.

**Rationale:** Prevents version mismatch breakage. v5 not released yet.

**Upgrade Path:** Use `npx remotion upgrade` to atomically upgrade all packages.

## 7. Node.js 24 LTS + Python 3.14

**Decision:** Latest stable versions for compatibility.

**Rationale:** Modern language features, better performance, security patches.

## 8. No VPS/Docker Production Config

**Decision:** All Docker is dev-only; no systemd, Nginx, Traefik, or production services.

**Rationale:** Simplifies the project scope. This is a developer tool, not a distributed service.
