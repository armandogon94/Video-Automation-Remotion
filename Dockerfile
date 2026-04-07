# ── Stage 1: Node.js dependencies ──────────────────────────────
FROM node:22-bookworm-slim AS node-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Runtime (Node + Python + FFmpeg + Chromium) ───────
FROM node:22-bookworm-slim

WORKDIR /app

# System dependencies: FFmpeg, Chromium for Remotion, Python 3.11+
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    python3 \
    python3-pip \
    python3-venv \
    fonts-noto \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Python dependencies
COPY pyproject.toml uv.lock* ./
RUN uv venv /app/.venv && \
    (uv sync --frozen --no-dev 2>/dev/null || uv sync --no-dev)
ENV PATH="/app/.venv/bin:$PATH"

# Node.js dependencies
COPY --from=node-deps /app/node_modules ./node_modules

# Application source
COPY . .

# Remotion needs Chromium path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium
ENV REMOTION_CONCURRENCY=2
ENV NODE_ENV=production

# Output directory
RUN mkdir -p /app/output

EXPOSE 3100

CMD ["npm", "run", "dev"]
