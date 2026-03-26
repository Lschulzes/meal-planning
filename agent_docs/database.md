# Database

## Setup

PostgreSQL 15 via Docker. Config: `packages/db/docker-compose.yml`.

```bash
docker compose -f packages/db/docker-compose.yml up -d   # start
pnpm db:push                                              # push schema
pnpm db:seed                                              # insert default preferences
pnpm db:studio                                            # Drizzle Studio GUI
```

## Schema

9 tables in `packages/db/src/schema/`, one file per table, barrel-exported from `index.ts`.

| Table | Purpose |
|-------|---------|
| `products` | Main catalog — latest scraped Sam's Club data |
| `product_history` | CDC/audit — new row on price or stock change |
| `user_preferences` | Single row for the solo user |
| `meal_plans` | Weekly plans with status (draft/active/completed) |
| `meal_plan_items` | Individual meals within a plan |
| `meal_plan_ingredients` | Links meals to Sam's Club products |
| `shopping_lists` | Generated buy lists from a meal plan |
| `shopping_list_items` | Individual items with purchased toggle |
| `meal_feedback` | Post-week ratings that feed back into AI planning |

## Conventions

- All IDs are UUIDs using `$defaultFn(() => crypto.randomUUID())`
- Drizzle `relations()` are defined alongside each table
- Price columns use `numeric(10,2)` stored as strings, parsed to numbers in application code
- `nutrition` is a `jsonb` column with the shape defined in `services/usda/types.ts:ProductNutrition`
- Timestamps use `timestamp with time zone` and default to `now()`
