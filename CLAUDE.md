# MealPilot

Personal meal planning app. Syncs Sam's Club grocery products, enriches with USDA nutrition data, uses Claude AI to generate weekly meal plans, and creates optimized shopping lists targeting Sam's Club's $50 free delivery minimum.

Single-user app — no authentication.

## Monorepo Map

| Path | What | Stack |
|------|------|-------|
| `apps/server/` | API server | Hono, oRPC, node-cron |
| `apps/web/` | Frontend SPA | React, TanStack Router/Query, Tailwind |
| `packages/api/` | Typed RPC routers | oRPC, Zod |
| `packages/db/` | Schema + DB client | Drizzle ORM, PostgreSQL |
| `packages/env/` | Env validation | t3-env |
| `packages/ui/` | Design system | shadcn/ui |

## Verifying Changes

```bash
pnpm check-types      # TypeScript across all packages
pnpm dev              # Start server (:3000) + web (:3001)
pnpm db:push          # Push schema changes to PostgreSQL
```

## Context Docs

Read these before working in the relevant area — they contain architecture decisions, conventions, and how-to details:

- `agent_docs/architecture.md` — system design, data flow, service boundaries, key decisions
- `agent_docs/database.md` — schema overview, column conventions, setup commands
- `agent_docs/api.md` — oRPC router structure, context, how to add new routers
- `agent_docs/frontend.md` — routing, data fetching, design system, component organization
- `agent_docs/commands.md` — all dev, build, db, and sync commands
