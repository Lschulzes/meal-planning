# API Layer

## oRPC Setup

Routers are defined in `packages/api/src/routers/`. Each router is an object of `publicProcedure` handlers with `.input()` (Zod) and `.handler()`.

The app router is assembled in `packages/api/src/routers/index.ts` and mounted at `/rpc` in the Hono server.

## Routers


| Router         | File               | Endpoints                                   |
| -------------- | ------------------ | ------------------------------------------- |
| `products`     | `products.ts`      | list, getById, search, categories, byTag    |
| `preferences`  | `preferences.ts`   | get, update, reset                          |
| `mealPlans`    | `meal-plans.ts`    | list, getById, create, updateStatus, delete |
| `shoppingList` | `shopping-list.ts` | getByPlanId, generate, toggleItem           |
| `feedback`     | `feedback.ts`      | submit, getByPlanId, history                |
| `admin`        | `admin.ts`         | syncStatus                                  |


## Context

`packages/api/src/context.ts` injects `{ db }` into every procedure. Access via `context.db` in handlers.

## Adding a New Router

1. Create `packages/api/src/routers/my-router.ts`
2. Define procedures using `publicProcedure` from `../index`
3. Add to `appRouter` in `packages/api/src/routers/index.ts`
4. Types flow automatically to the frontend via `AppRouterClient`

