# Architecture

## Monorepo Layout

```
apps/
  server/     Hono API server (port 3000)
  web/        React SPA (port 3001, Vite)
packages/
  api/        oRPC router definitions + Zod schemas — shared types between server & web
  db/         Drizzle ORM schema + client — single source of truth for DB types
  env/        t3-env validation — server.ts and web.ts
  ui/         shadcn/ui primitives — shared design system
  config/     shared tsconfig
```

## Data Flow

```
Sam's Club API  →  Scraper  →  PostgreSQL  ←  Drizzle ORM  ←  oRPC routers  ←  React frontend
                                   ↑
                              USDA FDC API
                              (nutrition enrichment)
```

## Key Design Decisions

**No auth.** Single-user app. `user_preferences` is always a single row.

**oRPC, not REST.** All client-server communication is typed end-to-end through `packages/api/`. The server mounts it at `/rpc`. Frontend uses `@orpc/tanstack-query` for data fetching.

**AI two-step flow.** Meal planning uses two Claude calls:
1. `generateMealConcepts()` — lightweight, returns meal names + metadata
2. `generateFullRecipes()` — heavier, returns full recipes mapped to Sam's Club product IDs

Both use `tool_use` with Zod schemas converted to JSON Schema to enforce structured output.

**Product tagging.** Products get auto-tagged during sync (`protein`, `produce`, `dairy`, etc.) so the AI service can build focused context without sending the entire catalog.

**Worker runs in-process.** The cron scheduler (`node-cron`) starts inside the Hono server process. Manual triggers are available via `POST /api/admin/sync` and `POST /api/admin/enrich`.

## Service Boundaries

| Service | Location | External API |
|---------|----------|-------------|
| Sam's Club scraper | `apps/server/src/services/samsclub/` | samsclub.com internal APIs (needs devtools verification) |
| USDA nutrition | `apps/server/src/services/usda/` | `api.nal.usda.gov/fdc/v1` (free, 1000 req/hr) |
| AI meal planning | `apps/server/src/services/ai/` | Anthropic API (`claude-sonnet-4-20250514`) |
| Sync worker | `apps/server/src/worker/` | Orchestrates scraper + USDA |
