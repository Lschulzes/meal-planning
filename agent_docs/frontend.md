# Frontend

## Stack

React 19 + TanStack Router (file-based) + TanStack Query (via oRPC) + Tailwind CSS v4 + shadcn/ui.

## Routing

File-based routing in `apps/web/src/routes/`. TanStack Router auto-generates `routeTree.gen.ts` — never edit that file.

```
/                         Dashboard
/onboarding               4-step preference wizard
/plan/new                 AI meal plan creation flow
/plan/:id                 View a meal plan
/plan/:id/shopping-list   Shopping checklist
/plan/:id/feedback        Post-week ratings
/history                  Past plans
/products                 Product catalog browser
/settings                 Edit preferences + sync status
```

`/plan/$id.tsx` is a layout route (renders `<Outlet />`). The actual plan page is `/plan/$id/index.tsx`.

## Data Fetching

oRPC client is set up in `apps/web/src/utils/orpc.ts`. Use it via the router context:

```tsx
const { orpc } = Route.useRouteContext();
// or import directly:
import { orpc } from "@/utils/orpc";
```

Currently most pages use mock data from `apps/web/src/lib/mock-data.ts` with `// TODO: wire to oRPC` comments.

## Design System

- **Fonts**: DM Sans (body), Fraunces (display headings) — loaded via Google Fonts in `index.html`
- **Colors**: Warm earth tones — sage green primary, terracotta accent. Defined in `packages/ui/src/styles/globals.css`
- **Use `font-display`** Tailwind class for Fraunces headings
- **Components**: Import from `@meal-planning/ui/components/*`
- Responsive: sidebar on desktop, bottom tab bar on mobile

## Component Organization

```
components/
  layout/      Sidebar, MobileNav, PageHeader
  plan/        ConceptCard, RecipeCard, WeekView
  shopping/    ShoppingList, CartTotal
  feedback/    StarRating
  shared/      EmptyState, LoadingSpinner, NutritionBadge, PriceTag
```
