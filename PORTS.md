# Port Allocation — Project 10: Video Automation (Remotion)

> All host-exposed ports are globally unique across all 16 projects so every project can run simultaneously. See `../PORT-MAP.md` for the full map.
> This project is **local-only** (MacBook Apple Silicon). It is never deployed to the VPS.

## Current Assignments

| Service | Host Port | Container Port | File |
|---------|-----------|---------------|------|
| Video Factory | **3100** | 3100 | docker-compose.dev.yml |
| Redis | **6381** | 6379 | docker-compose.dev.yml |

## Allowed Range for New Services

If you need to add a new service to this project, pick from these ranges **only**:

| Type | Allowed Host Ports |
|------|--------------------|
| Frontend / UI | `3100 – 3109` |
| Backend / API | `8100 – 8109` |
| PostgreSQL | Not assigned. If needed, request an assignment in `../PORT-MAP.md`. |
| Redis | `6381` (already assigned — do not spin up a second instance) |

Available slots: `3101-3109`, `8100-8109`.

## Do Not Use

Every port outside the ranges above is reserved by another project. Always check `../PORT-MAP.md` before picking a port.

Key ranges already taken:
- `3090-3099 / 8090-8099` → Project 09
- `3110-3119 / 8110-8119` → Project 11
- `6379` → Project 02 Redis
- `6380` → Project 05 Redis
- `6382-6385` → Projects 12, 13, 15, 16 Redis
- `5432-5439` → Projects 02-05, 11-13, 15 PostgreSQL
