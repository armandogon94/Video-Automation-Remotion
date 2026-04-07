# AI Video Factory — Makefile
# Local development commands for macOS Apple Silicon

.PHONY: docker docker-build docker-down docker-logs install dev build render generate test lint clean help

# Default target
help:
	@echo "AI Video Factory — Available Commands"
	@echo ""
	@echo "  make docker      Start full stack in Docker"
	@echo "  make docker-build Rebuild and start Docker containers"
	@echo "  make docker-down Stop Docker containers"
	@echo "  make docker-logs Tail Docker logs"
	@echo "  make install     Install all dependencies locally (Node.js + Python)"
	@echo "  make dev         Start Remotion Studio locally for preview"
	@echo "  make build       Bundle Remotion for rendering"
	@echo "  make render      Render a composition (use COMP= PROPS= OUT=)"
	@echo "  make generate    Run full pipeline (use SCRIPT= VOICE= TEMPLATE=)"
	@echo "  make test        Run all tests (vitest + pytest)"
	@echo "  make test-js     Run JavaScript tests only"
	@echo "  make test-py     Run Python tests only"
	@echo "  make lint        Lint all code"
	@echo "  make clean       Remove output files and build artifacts"
	@echo "  make check       Verify all dependencies are installed"
	@echo ""

# ── Docker ─────────────────────────────────────────────────────
docker:
	docker compose -f docker-compose.dev.yml up -d

docker-build:
	docker compose -f docker-compose.dev.yml up -d --build

docker-down:
	docker compose -f docker-compose.dev.yml down

docker-logs:
	docker compose -f docker-compose.dev.yml logs -f

# ── Local (without Docker) ────────────────────────────────────
# Install all dependencies
install:
	npm install
	uv sync
	@echo "Checking FFmpeg..."
	@which ffmpeg > /dev/null 2>&1 || (echo "FFmpeg not found. Install with: brew install ffmpeg" && exit 1)
	@echo "All dependencies installed."

# Start Remotion Studio
dev:
	npx remotion studio

# Bundle for rendering
build:
	npx remotion bundle

# Render a specific composition
# Usage: make render COMP=ExplainerVideo PROPS=./data.json OUT=./output/video.mp4
render:
	npx remotion render src/compositions/index.ts $(COMP) $(OUT) --props=$(PROPS)

# Full pipeline generation
# Usage: make generate SCRIPT="Your text here" VOICE=es-MX-JorgeNeural TEMPLATE=explainer
generate:
	npx tsx src/pipeline/generate.ts --script "$(SCRIPT)" --voice "$(VOICE)" --template "$(TEMPLATE)"

# Run all tests
test: test-js test-py

test-js:
	npx vitest run

test-py:
	uv run pytest tests/python/ -v

# Lint
lint:
	npx eslint src/ --ext .ts,.tsx
	uv run ruff check src/tts/ src/transcribe/

# Clean output and build artifacts
clean:
	rm -rf output/*
	touch output/.gitkeep
	rm -rf dist/ build/ remotion-bundle/
	@echo "Cleaned output and build artifacts."

# Verify dependencies
check:
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Python: $$(python3 --version)"
	@echo "uv: $$(uv --version 2>/dev/null || echo 'not installed')"
	@echo "FFmpeg: $$(ffmpeg -version 2>/dev/null | head -1 || echo 'not installed')"
	@echo ""
	@echo "All checks passed."
