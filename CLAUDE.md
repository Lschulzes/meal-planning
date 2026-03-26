# MealPilot — Project Context

## What is this?
Personal meal planning app that syncs Sam's Club grocery data, uses Claude AI to generate weekly meal plans, and creates optimized shopping lists.

## Architecture
- Monorepo: Turborepo + pnpm workspaces
- Frontend: `apps/web/` — React + TanStack Router + TanStack Query + Tailwind
- Backend: `apps/server/` — Hono + oRPC + Drizzle ORM + PostgreSQL
- Shared API: `packages/api/` — oRPC router definitions
- Shared DB: `packages/db/` — Drizzle schema + DB client
- Shared Env: `packages/env/` — t3-env validation
- Shared UI: `packages/ui/` — shadcn/ui components
- No auth — single user app

## Key Directories
- `packages/db/src/schema/` — Drizzle schema files (one per table)
- `packages/api/src/routers/` — oRPC routers (products, preferences, mealPlans, shoppingList, feedback, admin)
- `apps/server/src/services/samsclub/` — Sam's Club scraper
- `apps/server/src/services/usda/` — USDA nutritional data enrichment
- `apps/server/src/services/ai/` — Claude AI meal planning
- `apps/server/src/worker/` — Cron sync worker
- `apps/web/src/routes/` — TanStack Router pages (file-based routing)
- `apps/web/src/components/` — React components

## Conventions
- All DB IDs are UUIDs
- oRPC for all client-server communication (typed end-to-end)
- Zod for all validation schemas
- AI outputs are validated against Zod schemas via tool_use
- Products are tagged with categories for efficient AI context building
- Daily sync runs at 3am, can be triggered manually via POST /api/admin/sync

## Quick Start
1. Copy `apps/server/.env.example` to `apps/server/.env`
2. Get USDA API key from https://fdc.nal.usda.gov/api-key-signup/
3. Set ANTHROPIC_API_KEY
4. Set SAMSCLUB_ZIP_CODE
5. `docker compose -f packages/db/docker-compose.yml up -d` (Postgres)
6. `pnpm db:push` (push schema to DB)
7. `pnpm db:seed` (creates default preferences)
8. `pnpm dev` (starts both server and web)

## AI Multi-Step Flow
1. `generateMealConcepts()` — cheap call, returns meal names + metadata
2. User reviews/swaps concepts on frontend
3. `generateFullRecipes()` — medium call, returns structured recipes mapped to Sam's Club products
4. Backend validates product mappings, calculates cart, generates shopping list
5. Optional: `suggestCartAddons()` if cart < $50
