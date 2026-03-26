# MealPilot

AI-powered meal planning that works with your Sam's Club membership. MealPilot syncs real product data, generates personalized weekly meal plans using Claude AI, and creates shopping lists optimized for Sam's Club's $50 free delivery minimum.

## How It Works

1. **Set preferences** — dietary restrictions, cuisine preferences, budget, cooking skill
2. **AI generates meal concepts** — Claude suggests a week of meals based on your preferences and past feedback
3. **Review and customize** — swap out meals you don't want, approve the plan
4. **Get full recipes** — Claude generates detailed recipes using available Sam's Club products
5. **Shop** — an optimized shopping list with real prices, targeting free delivery

Behind the scenes, a daily sync fetches current Sam's Club products and enriches them with USDA nutritional data.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/server/.env.example apps/server/.env
# Edit .env: set ANTHROPIC_API_KEY, USDA_API_KEY, SAMSCLUB_ZIP_CODE

# 3. Start PostgreSQL
docker compose -f packages/db/docker-compose.yml up -d

# 4. Set up database
pnpm db:push
pnpm db:seed

# 5. Run
pnpm dev
```

- **Web app**: http://localhost:3001
- **API server**: http://localhost:3000
- **API docs**: http://localhost:3000/api-reference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Router, TanStack Query, Tailwind CSS v4 |
| Backend | Hono, oRPC (typed end-to-end), Node.js |
| Database | PostgreSQL 15, Drizzle ORM |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| External Data | Sam's Club product API, USDA FoodData Central |
| Monorepo | Turborepo, pnpm workspaces |

## Project Structure

```
apps/
  server/           Hono API + cron worker
  web/              React SPA
packages/
  api/              oRPC router definitions
  db/               Drizzle schema + migrations
  env/              Environment validation
  ui/               Shared shadcn/ui components
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | For AI | Claude API key |
| `USDA_API_KEY` | For nutrition | [Get one free](https://fdc.nal.usda.gov/api-key-signup/) |
| `SAMSCLUB_ZIP_CODE` | For sync | Your zip code for nearest Sam's Club |

## Scripts

```bash
pnpm dev              # Start everything
pnpm build            # Production build
pnpm check-types      # TypeScript type checking
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed default preferences
pnpm db:studio        # Open Drizzle Studio
pnpm sync             # Manual product sync
pnpm sync:enrich      # USDA nutrition enrichment
```
