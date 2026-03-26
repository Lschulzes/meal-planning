# Commands

## Development

```bash
pnpm dev              # Start server (3000) + web (3001)
pnpm dev:server       # Server only
pnpm dev:web          # Web only
```

## Database

```bash
pnpm db:push          # Push Drizzle schema to PostgreSQL
pnpm db:generate      # Generate migration SQL
pnpm db:migrate       # Run migrations
pnpm db:seed          # Insert default user_preferences row
pnpm db:studio        # Open Drizzle Studio
pnpm db:start         # Docker Compose up
pnpm db:stop          # Docker Compose stop
pnpm db:down          # Docker Compose down (removes containers)
```

## Sync

```bash
pnpm sync             # Run full Sam's Club product sync
pnpm sync:enrich      # Run USDA nutrition enrichment only
```

Also available as HTTP endpoints:
- `POST /api/admin/sync` — trigger sync from the running server
- `POST /api/admin/enrich` — trigger enrichment from the running server

## Build & Check

```bash
pnpm build            # Build all packages
pnpm check-types      # TypeScript type checking across all packages
```

## Adding UI Components

```bash
npx shadcn@latest add <component> -c packages/ui   # shared primitives
```

Import: `import { Button } from "@meal-planning/ui/components/button"`
